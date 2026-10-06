package plugin

import (
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"slices"
	"sort"
	"strings"
)

// Config schemas are a small JSON Schema subset: an object of string,
// integer, number or boolean properties with title, description, default,
// enum, pattern, minimum/maximum, and a top-level required list. The UI
// renders a form from the same subset.

var propertyKeys = []string{"type", "title", "description", "default", "enum", "pattern", "minimum", "maximum"}

func checkSchema(s map[string]any) error {
	if s["type"] != "object" {
		return errors.New("type must be object")
	}
	for k := range s {
		if !slices.Contains([]string{"type", "properties", "required"}, k) {
			return fmt.Errorf("unsupported keyword %q", k)
		}
	}
	props, _ := s["properties"].(map[string]any)
	for name, p := range props {
		pm, ok := p.(map[string]any)
		if !ok {
			return fmt.Errorf("property %q must be an object", name)
		}
		for k := range pm {
			if !slices.Contains(propertyKeys, k) {
				return fmt.Errorf("property %q: unsupported keyword %q", name, k)
			}
		}
		switch pm["type"] {
		case "string", "integer", "number", "boolean":
		default:
			return fmt.Errorf("property %q: type must be string, integer, number or boolean", name)
		}
		if pat, ok := pm["pattern"].(string); ok {
			if _, err := regexp.Compile(pat); err != nil {
				return fmt.Errorf("property %q: bad pattern", name)
			}
		}
		if d, ok := pm["default"]; ok {
			if err := checkValue(name, pm, d); err != nil {
				return fmt.Errorf("default: %w", err)
			}
		}
	}
	if req, ok := s["required"].([]any); ok {
		for _, r := range req {
			if _, ok := props[fmt.Sprint(r)]; !ok {
				return fmt.Errorf("required property %q is not defined", r)
			}
		}
	}
	return nil
}

// ConfigError lists invalid config values.
type ConfigError struct{ Problems []string }

func (e *ConfigError) Error() string { return "invalid config: " + strings.Join(e.Problems, "; ") }

// ValidateConfig checks values against a schema and returns them with
// defaults filled in. Unknown keys are refused.
func ValidateConfig(schemaJSON []byte, values map[string]any) (map[string]any, error) {
	out := map[string]any{}
	if len(schemaJSON) == 0 {
		if len(values) > 0 {
			return nil, &ConfigError{Problems: []string{"this plugin takes no config"}}
		}
		return out, nil
	}
	var schema map[string]any
	if err := json.Unmarshal(schemaJSON, &schema); err != nil {
		return nil, err
	}
	props, _ := schema["properties"].(map[string]any)
	var problems []string
	keys := make([]string, 0, len(values))
	for k := range values {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	for _, k := range keys {
		p, ok := props[k].(map[string]any)
		if !ok {
			problems = append(problems, fmt.Sprintf("unknown key %q", k))
			continue
		}
		if values[k] == nil {
			continue
		}
		if err := checkValue(k, p, values[k]); err != nil {
			problems = append(problems, err.Error())
			continue
		}
		out[k] = normalize(p, values[k])
	}
	for k, p := range props {
		if _, set := out[k]; !set {
			if d, ok := p.(map[string]any)["default"]; ok {
				out[k] = normalize(p.(map[string]any), d)
			}
		}
	}
	if req, ok := schema["required"].([]any); ok {
		for _, r := range req {
			if v, ok := out[fmt.Sprint(r)]; !ok || v == "" {
				problems = append(problems, fmt.Sprintf("%v is required", r))
			}
		}
	}
	if len(problems) > 0 {
		return nil, &ConfigError{Problems: problems}
	}
	return out, nil
}

func checkValue(name string, p map[string]any, v any) error {
	switch p["type"] {
	case "string":
		s, ok := v.(string)
		if !ok {
			return fmt.Errorf("%s must be a string", name)
		}
		if len(s) > 1024 {
			return fmt.Errorf("%s is too long", name)
		}
		if pat, ok := p["pattern"].(string); ok && !regexp.MustCompile(pat).MatchString(s) {
			return fmt.Errorf("%s does not match %s", name, pat)
		}
	case "boolean":
		if _, ok := v.(bool); !ok {
			return fmt.Errorf("%s must be true or false", name)
		}
	case "integer", "number":
		f, ok := v.(float64)
		if !ok {
			if i, isInt := v.(int); isInt {
				f, ok = float64(i), true
			}
		}
		if !ok || (p["type"] == "integer" && f != float64(int64(f))) {
			return fmt.Errorf("%s must be a %s", name, p["type"])
		}
		if min, ok := p["minimum"].(float64); ok && f < min {
			return fmt.Errorf("%s must be at least %v", name, min)
		}
		if max, ok := p["maximum"].(float64); ok && f > max {
			return fmt.Errorf("%s must be at most %v", name, max)
		}
	}
	if enum, ok := p["enum"].([]any); ok && !slices.ContainsFunc(enum, func(e any) bool { return fmt.Sprint(e) == fmt.Sprint(v) }) {
		return fmt.Errorf("%s must be one of %v", name, enum)
	}
	return nil
}

func normalize(p map[string]any, v any) any {
	if i, ok := v.(int); ok && (p["type"] == "integer" || p["type"] == "number") {
		return float64(i)
	}
	return v
}

// ConfigString reads a string config value ("" when absent).
func ConfigString(cfg map[string]any, key string) string {
	s, _ := cfg[key].(string)
	return s
}
