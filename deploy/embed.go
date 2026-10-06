// Package deploy embeds files from deploy/ that the binaries need.
package deploy

import _ "embed"

// ProjectSizes is the built-in copy of project-sizes.yaml: the Project size
// presets used until a valid capybara-project-sizes ConfigMap exists.
//
//go:embed project-sizes.yaml
var ProjectSizes []byte
