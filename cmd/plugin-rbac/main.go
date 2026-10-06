// Command plugin-rbac prints the RBAC for a plugin's installer credential,
// from the plugin's manifest, for one mode:
//
//	install  a ClusterRole with what the chart creates (broad)
//	connect  a Role in the connected service's namespace: only the
//	         backend's account, plus get services/proxy on that service
//
// hack/capybara-sa.sh --installer pipes it into kubectl apply.
//
//	go run ./cmd/plugin-rbac -plugin monitoring -mode connect -set namespace=monitoring -set service=prometheus -set port=9090
package main

import (
	"errors"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	rbacv1 "k8s.io/api/rbac/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"sigs.k8s.io/yaml"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/pkg/plugin"
)

type sets map[string]any

func (s sets) String() string { return "" }
func (s sets) Set(v string) error {
	k, val, ok := strings.Cut(v, "=")
	if !ok {
		return errors.New("want key=value")
	}
	s[k] = val
	return nil
}

func main() {
	cfg := sets{}
	dir := flag.String("plugins-dir", "plugins", "builtin plugin repository")
	name := flag.String("plugin", "", "plugin name")
	mode := flag.String("mode", "install", "install or connect")
	account := flag.String("account", "capybara-installer", "ServiceAccount in capybara-system to bind")
	flag.Var(cfg, "set", "config value key=value (connect mode), repeatable")
	flag.Parse()
	if err := run(*dir, *name, v1alpha1.InstallMode(*mode), *account, cfg); err != nil {
		fmt.Fprintln(os.Stderr, "plugin-rbac:", err)
		os.Exit(1)
	}
}

func run(dir, name string, mode v1alpha1.InstallMode, account string, values map[string]any) error {
	m, spec, err := plugin.LoadDir(filepath.Join(dir, name), "builtin")
	if m == nil {
		return err
	}
	var ui *plugin.UIBundleError
	if err != nil && !errors.As(err, &ui) {
		return err
	}
	cfgJSON := []byte(nil)
	if spec.ConfigSchema != nil {
		cfgJSON = spec.ConfigSchema.Raw
	}
	cfg, err := plugin.ValidateConfig(cfgJSON, values)
	if err != nil {
		return err
	}
	ns, err := plugin.Namespace(spec, mode, cfg)
	if err != nil {
		return err
	}
	services, err := plugin.ResolveServices(spec, mode, cfg)
	if err != nil {
		return err
	}
	clusterRules, nsRules := plugin.InstallerRules(spec, mode, services, ns)
	roleName := "capybara-installer-" + name
	if mode == v1alpha1.ModeConnect {
		roleName += "-connect"
	}
	labels := map[string]string{"app.kubernetes.io/managed-by": "capybara", v1alpha1.LabelPlugin: name, "platform.capybara.io/installer": "true"}
	subject := []rbacv1.Subject{{Kind: "ServiceAccount", Name: account, Namespace: v1alpha1.SystemNamespace}}
	var docs []any
	if len(clusterRules) > 0 {
		docs = append(docs,
			&rbacv1.ClusterRole{TypeMeta: tm("ClusterRole"), ObjectMeta: metav1.ObjectMeta{Name: roleName, Labels: labels}, Rules: clusterRules},
			&rbacv1.ClusterRoleBinding{TypeMeta: tm("ClusterRoleBinding"), ObjectMeta: metav1.ObjectMeta{Name: roleName + "-" + account, Labels: labels},
				RoleRef: rbacv1.RoleRef{APIGroup: rbacv1.GroupName, Kind: "ClusterRole", Name: roleName}, Subjects: subject})
	}
	if len(nsRules) > 0 {
		docs = append(docs,
			&rbacv1.Role{TypeMeta: tm("Role"), ObjectMeta: metav1.ObjectMeta{Name: roleName, Namespace: ns, Labels: labels}, Rules: nsRules},
			&rbacv1.RoleBinding{TypeMeta: tm("RoleBinding"), ObjectMeta: metav1.ObjectMeta{Name: roleName + "-" + account, Namespace: ns, Labels: labels},
				RoleRef: rbacv1.RoleRef{APIGroup: rbacv1.GroupName, Kind: "Role", Name: roleName}, Subjects: subject})
	}
	for i, d := range docs {
		b, err := yaml.Marshal(d)
		if err != nil {
			return err
		}
		if i > 0 {
			fmt.Println("---")
		}
		fmt.Print(string(b))
	}
	return nil
}

func tm(kind string) metav1.TypeMeta {
	return metav1.TypeMeta{APIVersion: rbacv1.SchemeGroupVersion.String(), Kind: kind}
}
