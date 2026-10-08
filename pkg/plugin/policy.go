package plugin

import (
	"context"
	"fmt"
	"slices"
	"strconv"
	"strings"

	"k8s.io/apimachinery/pkg/api/resource"

	"github.com/capybara/capybara/api/v1alpha1"
)

// Violation is one way an object breaks a plugin's policy, at a field path
// such as "spec.steps[0].env[1].valueFrom.secretKeyRef".
type Violation struct {
	Path    string `json:"path"`
	Message string `json:"message"`
}

func (v Violation) String() string { return v.Path + ": " + v.Message }

// Quotas tells how much of a quota resource a namespace still allows
// (hard minus used, the least across its ResourceQuotas); ok is false when
// no quota limits that resource.
type Quotas func(ctx context.Context, resourceName string) (left resource.Quantity, ok bool, err error)

// ResolvePolicy returns a named policy's rules with its includes first.
func ResolvePolicy(policies map[string]v1alpha1.ObjectPolicy, name string) ([]v1alpha1.ObjectRule, error) {
	var out []v1alpha1.ObjectRule
	var visit func(n string, seen []string) error
	visit = func(n string, seen []string) error {
		if slices.Contains(seen, n) {
			return fmt.Errorf("policy %q includes itself", n)
		}
		p, ok := policies[n]
		if !ok {
			return fmt.Errorf("no policy %q", n)
		}
		for _, inc := range p.Include {
			if err := visit(inc, append(seen, n)); err != nil {
				return err
			}
		}
		out = append(out, p.Rules...)
		return nil
	}
	if err := visit(name, nil); err != nil {
		return nil, err
	}
	return out, nil
}

// ApplyPolicy sets the rules' defaults on obj, then checks every rule and
// returns the violations (none: obj may be written as it is now).
func ApplyPolicy(ctx context.Context, rules []v1alpha1.ObjectRule, obj map[string]any, quotas Quotas) ([]Violation, error) {
	for _, r := range rules {
		if r.Default != "" {
			setDefault(obj, splitPath(r.Path), r.Default)
		}
	}
	var out []Violation
	seen := map[string]bool{}
	add := func(path, msg string) {
		if key := path + "\x00" + msg; !seen[key] {
			seen[key] = true
			out = append(out, Violation{Path: path, Message: msg})
		}
	}
	for _, r := range rules {
		matches := match(obj, splitPath(r.Path))
		msg := func(def string) string {
			if r.Message != "" {
				return r.Message
			}
			return def
		}
		switch {
		case r.Deny:
			for _, m := range matches {
				if r.Equals == "" || scalar(m.value) == r.Equals {
					add(m.path, msg("not allowed"))
				}
			}
		case len(r.Allow) > 0:
			for _, m := range matches {
				if !slices.Contains(r.Allow, scalar(m.value)) {
					add(m.path, msg(fmt.Sprintf("must be one of %s (got %q)", strings.Join(r.Allow, ", "), scalar(m.value))))
				}
			}
		case len(r.AllowKeys) > 0 || len(r.ExactlyOneOf) > 0:
			for _, m := range matches {
				obj, ok := m.value.(map[string]any)
				if !ok {
					add(m.path, msg("must be an object"))
					continue
				}
				one := 0
				for k := range obj {
					switch {
					case slices.Contains(r.ExactlyOneOf, k):
						one++
					case !slices.Contains(r.AllowKeys, k):
						add(m.path+"."+k, msg(fmt.Sprintf("%q is not allowed here; use one of %s", k, strings.Join(r.ExactlyOneOf, ", "))))
					}
				}
				if len(r.ExactlyOneOf) > 0 && one != 1 {
					add(m.path, msg("needs exactly one of "+strings.Join(r.ExactlyOneOf, ", ")))
				}
			}
		case r.WithinQuota != "" || r.CountQuota != "":
			if len(matches) == 0 || quotas == nil {
				continue
			}
			name := r.WithinQuota
			want := resource.MustParse(strconv.Itoa(len(matches)))
			if name != "" {
				want = resource.Quantity{}
				for _, m := range matches {
					q, err := resource.ParseQuantity(scalar(m.value))
					if err != nil {
						add(m.path, msg("not a quantity"))
						continue
					}
					want.Add(q)
				}
			} else {
				name = r.CountQuota
			}
			left, ok, err := quotas(ctx, name)
			if err != nil {
				return nil, err
			}
			if ok && want.Cmp(left) > 0 {
				add(matches[0].path, msg(fmt.Sprintf("needs %s of %s; the Project's quota allows %s more", want.String(), name, left.String())))
			}
		}
	}
	slices.SortStableFunc(out, func(a, b Violation) int { return strings.Compare(a.Path, b.Path) })
	return out, nil
}

// Values returns the scalar values at path (e.g. referenced names).
func Values(obj map[string]any, path string) []string {
	var out []string
	for _, m := range match(obj, splitPath(path)) {
		if s := scalar(m.value); s != "" {
			out = append(out, s)
		}
	}
	return out
}

// ValidatePath reports a malformed rule path.
func ValidatePath(p string) error {
	if p == "" {
		return fmt.Errorf("empty path")
	}
	for _, s := range splitPath(p) {
		if s == "" {
			return fmt.Errorf("path %q has an empty segment", p)
		}
	}
	return nil
}

type matched struct {
	path  string
	value any
}

func splitPath(p string) []string { return strings.Split(p, ".") }

// match returns every value at the path, with its concrete path.
func match(root any, segs []string) []matched {
	var out []matched
	seen := map[string]bool{}
	var walk func(v any, segs []string, at string)
	walk = func(v any, segs []string, at string) {
		if len(segs) == 0 {
			if !seen[at] {
				seen[at] = true
				out = append(out, matched{path: at, value: v})
			}
			return
		}
		switch s := segs[0]; s {
		case "**":
			walk(v, segs[1:], at)
			children(v, at, func(c any, cat string) { walk(c, segs, cat) })
		case "*":
			children(v, at, func(c any, cat string) { walk(c, segs[1:], cat) })
		default:
			if m, ok := v.(map[string]any); ok {
				if c, ok := m[s]; ok {
					walk(c, segs[1:], join(at, s))
				}
			}
		}
	}
	walk(root, segs, "")
	return out
}

func children(v any, at string, fn func(c any, at string)) {
	switch t := v.(type) {
	case map[string]any:
		keys := make([]string, 0, len(t))
		for k := range t {
			keys = append(keys, k)
		}
		slices.Sort(keys)
		for _, k := range keys {
			fn(t[k], join(at, k))
		}
	case []any:
		for i, c := range t {
			fn(c, fmt.Sprintf("%s[%d]", at, i))
		}
	}
}

func join(at, key string) string {
	if at == "" {
		return key
	}
	return at + "." + key
}

// setDefault sets value at an exact path (no wildcards) when absent.
func setDefault(obj map[string]any, segs []string, value string) {
	cur := obj
	for i, s := range segs {
		if s == "*" || s == "**" {
			return
		}
		if i == len(segs)-1 {
			if _, ok := cur[s]; !ok {
				cur[s] = value
			}
			return
		}
		next, ok := cur[s].(map[string]any)
		if !ok {
			if _, exists := cur[s]; exists {
				return
			}
			next = map[string]any{}
			cur[s] = next
		}
		cur = next
	}
}

func scalar(v any) string {
	switch t := v.(type) {
	case nil:
		return ""
	case string:
		return t
	case bool:
		return strconv.FormatBool(t)
	case int64:
		return strconv.FormatInt(t, 10)
	case float64:
		return strconv.FormatFloat(t, 'f', -1, 64)
	default:
		return fmt.Sprint(t)
	}
}
