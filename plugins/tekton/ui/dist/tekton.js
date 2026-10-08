if(typeof document!=='undefined'){const s=document.createElement('style');s.dataset.plugin="tekton";s.textContent=".title[data-v-e2addc7d]{margin:0 0 16px}.toolbar[data-v-e2addc7d]{margin-bottom:12px}.select[data-v-e2addc7d]{width:240px}.gap[data-v-e2addc7d]{margin-top:12px}.title[data-v-4949b877]{align-items:baseline;gap:8px;margin:0 0 16px;display:flex}.gap[data-v-4949b877]{margin-top:12px}.select[data-v-4949b877]{width:260px}.muted[data-v-4949b877]{opacity:.7;font-size:12px}h4[data-v-4949b877]{margin:4px 0 8px}.scroll[data-v-774e814d]{padding:4px 0 12px;overflow-x:auto}.node rect[data-v-774e814d]{fill:var(--n-color,transparent);stroke-width:2px}.node.clickable[data-v-774e814d]{cursor:pointer}.node.chosen rect[data-v-774e814d]{stroke-width:3px}.name[data-v-774e814d]{fill:currentColor;font-size:13px;font-weight:600}.state[data-v-774e814d]{fill:currentColor;opacity:.7;font-size:11px}.edge[data-v-774e814d]{fill:none;stroke:currentColor;opacity:.45;stroke-width:1.5px}.arrow[data-v-774e814d]{fill:currentColor;opacity:.6}h4[data-v-774e814d]{margin:8px 0}.pull[data-v-7a8b8553]{margin-bottom:12px}.reason[data-v-7a8b8553]{opacity:.7;margin-left:6px;font-size:12px}.hint[data-v-7a8b8553]{opacity:.85;margin-top:6px;font-size:12px}.cancel[data-v-7a8b8553]{margin-top:8px}.cmd[data-v-7a8b8553]{margin-top:4px;display:block}.gap[data-v-bd94b745]{margin-bottom:12px}h4[data-v-bd94b745]{margin:8px 0}[data-v-bd94b745] .selected td{background:var(--n-td-color-hover)}.start-new[data-v-0f92e9de]{margin-top:8px}.gap[data-v-3d0b322e]{margin-bottom:12px}table[data-v-0c4eea02]{border-collapse:collapse;width:100%}td[data-v-0c4eea02]{white-space:nowrap;padding:4px 8px 4px 0}td[data-v-0c4eea02]:first-child{text-overflow:ellipsis;max-width:220px;overflow:hidden}.muted[data-v-0c4eea02]{opacity:.7;font-size:12px}\n/*$vite$:1*/";document.head.appendChild(s)}
import { EXTENSION_API_VERSION as e, PluginRequestError as t, definePlugin as n, pluginAction as r, pluginObjects as i, useCluster as a, useNavigate as o, useParams as s, useQuery as c } from "@capybara/sdk";
import { NAlert as l, NButton as u, NCard as d, NDataTable as f, NDynamicTags as p, NEmpty as m, NForm as h, NFormItem as g, NH2 as ee, NInput as te, NInputNumber as ne, NModal as _, NRadioButton as v, NRadioGroup as y, NSelect as re, NSpace as b, NSpin as ie, NTag as x, useMessage as S } from "naive-ui";
import { Fragment as C, computed as w, createBlock as T, createCommentVNode as E, createElementBlock as D, createElementVNode as O, createTextVNode as k, createVNode as A, defineComponent as j, h as M, normalizeClass as N, onMounted as ae, onScopeDispose as oe, openBlock as P, reactive as se, ref as F, renderList as I, resolveDynamicComponent as ce, shallowRef as L, toDisplayString as R, unref as z, watch as B, withCtx as V } from "vue";
//#region \0rolldown/runtime.js
var le = Object.defineProperty, H = (e, t, n) => () => {
	if (n) throw n[0];
	try {
		return e && (t = e(e = 0)), t;
	} catch (e) {
		throw n = [e], e;
	}
}, U = (e, t) => {
	let n = {};
	for (var r in e) le(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || le(n, Symbol.toStringTag, { value: "Module" }), n;
};
//#endregion
//#region src/pulls.ts
function W(e) {
	let t = e.status ?? {}, n = t.taskSpec?.steps ?? [], r = t.taskSpec?.sidecars ?? [], i = [], a = (e, t) => {
		for (let n of e ?? []) {
			let e = n.waiting?.reason ?? "";
			if (!q.has(e)) continue;
			let r = t.find((e) => e.name === n.name)?.image ?? G(n.waiting?.message) ?? "(unknown image)";
			i.push({
				container: n.container ?? n.name ?? "",
				image: r,
				reason: e,
				message: n.waiting?.message ?? ""
			});
		}
	};
	return a(t.steps, n), a(t.sidecars, r), i;
}
function G(e) {
	return e ? /image "([^"]+)"/.exec(e)?.[1] : void 0;
}
function K(e, t) {
	return e.reason === "InvalidImageName" ? `"${e.image}" is not a valid image name.` : `Image ${e.image} is not on ${t}, and the cluster could not pull it.`;
}
var q, J = H((() => {
	q = /* @__PURE__ */ new Set([
		"ErrImagePull",
		"ImagePullBackOff",
		"ErrImageNeverPull",
		"InvalidImageName"
	]);
}));
//#endregion
//#region src/tekton.ts
function ue(e) {
	ve = e;
}
function Y() {
	if (!ve) throw Error("tekton plugin is not registered");
	return ve;
}
function de(e = !1) {
	return Te && !e && Date.now() - Ee < 6e4 ? Te : (Ee = Date.now(), Te = (async () => {
		try {
			let e = await fetch("/api/projects", { headers: { Accept: "application/json" } });
			if (!e.ok) return;
			let t = await e.json(), n = Array.isArray(t) ? t : t.items ?? [];
			we.value = new Set(n.filter((e) => e.status?.phase === "Ready").map((e) => `${e.spec.cluster}/${e.spec.namespace}`));
		} catch {}
	})(), Te);
}
function fe(e, t) {
	return de(), !!e && !!we.value?.has(`${t}/${e}`);
}
function pe(e) {
	return de(), [...we.value ?? []].filter((t) => t.startsWith(`${e}/`)).map((t) => t.slice(e.length + 1)).sort();
}
function X(e) {
	let t = (e.status?.conditions ?? []).find((e) => e.type === "Succeeded");
	if (t?.status !== "True" && t?.status !== "False" && W(e).length > 0) return {
		text: "Image pull failed",
		tone: "error",
		running: !0
	};
	if (!t) return {
		text: "Pending",
		tone: "default",
		running: !0
	};
	if (t.status === "True") return {
		text: "Succeeded",
		tone: "success",
		running: !1
	};
	if (t.status === "False") {
		let e = /Cancelled/.test(t.reason ?? "");
		return {
			text: t.reason || "Failed",
			tone: e ? "warning" : "error",
			running: !1
		};
	}
	return {
		text: t.reason || "Running",
		tone: "info",
		running: !0
	};
}
function me(e) {
	return (e.status?.conditions ?? []).find((e) => e.type === "Succeeded")?.message ?? "";
}
function Z(e, t) {
	let n = Date.parse(e.status?.startTime ?? "");
	if (!n) return "—";
	let r = Date.parse(e.status?.completionTime ?? "") || t, i = Math.max(0, Math.round((r - n) / 1e3));
	if (i < 60) return `${i}s`;
	let a = Math.floor(i / 60);
	return a < 60 ? `${a}m ${String(i % 60).padStart(2, "0")}s` : `${Math.floor(a / 60)}h ${String(a % 60).padStart(2, "0")}m`;
}
function he(e) {
	return e.spec?.pipelineRef?.name ?? (e.spec?.pipelineSpec ? "(inline)" : "—");
}
function ge(e) {
	let t = X(e);
	return M(x, {
		size: "small",
		type: t.tone,
		bordered: !1,
		"data-test": "run-status"
	}, () => t.text);
}
var _e, ve, ye, be, xe, Se, Ce, we, Te, Ee, De, Oe, ke, Ae, je, Me, Ne, Pe, Fe, Q = H((() => {
	J(), _e = "tekton", ve = null, ye = (e, t) => ({
		group: "tekton.dev",
		version: "v1",
		plural: e,
		kind: t,
		namespaced: !0
	}), be = ye("pipelineruns", "PipelineRun"), xe = ye("taskruns", "TaskRun"), Se = ye("pipelines", "Pipeline"), Ce = ye("tasks", "Task"), we = L(null), Te = null, Ee = 0, De = (e) => Date.parse(e.status?.startTime ?? "") || Date.parse(e.metadata.creationTimestamp) || 0, Oe = (e, t) => De(t) - De(e), ke = (e, t, n) => n ? M(Y().components.ResourceLink, {
		resource: e,
		namespace: t.metadata.namespace,
		name: n
	}) : "—", Ae = "Capybara's account on this cluster lacks the Pipelines console permissions: reinstall or reconnect the plugin.", je = {
		id: "tekton.pipelineruns",
		type: be,
		label: "PipelineRuns",
		singular: "PipelineRun",
		path: "tekton/pipelineruns",
		columns: [
			{
				key: "status",
				title: "Status",
				width: 140,
				ellipsis: !1,
				render: ge,
				sortValue: (e) => X(e).text
			},
			{
				key: "pipeline",
				title: "Pipeline",
				minWidth: 140,
				render: (e) => e.spec?.pipelineRef?.name ? ke("tekton.pipelines", e, e.spec.pipelineRef.name) : he(e),
				sortValue: he
			},
			{
				key: "started",
				title: "Started",
				width: 180,
				render: (e) => e.status?.startTime ? new Date(e.status.startTime).toLocaleString() : "—",
				sortValue: De
			},
			{
				key: "duration",
				title: "Duration",
				width: 100,
				render: (e, t) => Z(e, t)
			}
		],
		status: (e) => X(e),
		overview: [
			{
				label: "Pipeline",
				render: (e) => e.spec?.pipelineRef?.name ? ke("tekton.pipelines", e, e.spec.pipelineRef.name) : he(e)
			},
			{
				label: "Service account",
				render: (e) => e.spec?.taskRunTemplate?.serviceAccountName ?? "default"
			},
			{
				label: "Started",
				render: (e) => e.status?.startTime ? new Date(e.status.startTime).toLocaleString() : "—"
			},
			{
				label: "Duration",
				render: (e) => Z(e, Date.now())
			},
			{
				label: "Message",
				render: (e) => me(e) || "—"
			},
			{
				label: "Rerun of",
				render: (e) => ke("tekton.pipelineruns", e, e.metadata.annotations?.["platform.capybara.io/copy-of"])
			}
		],
		forbiddenHint: Ae
	}, Me = {
		id: "tekton.taskruns",
		type: xe,
		label: "TaskRuns",
		singular: "TaskRun",
		path: "tekton/taskruns",
		columns: [
			{
				key: "status",
				title: "Status",
				width: 140,
				ellipsis: !1,
				render: ge,
				sortValue: (e) => X(e).text
			},
			{
				key: "pipelinerun",
				title: "PipelineRun",
				minWidth: 160,
				render: (e) => ke("tekton.pipelineruns", e, e.metadata.labels?.["tekton.dev/pipelineRun"])
			},
			{
				key: "task",
				title: "Task",
				minWidth: 120,
				render: (e) => e.metadata.labels?.["tekton.dev/pipelineTask"] ?? e.spec?.taskRef?.name ?? "—"
			},
			{
				key: "duration",
				title: "Duration",
				width: 100,
				render: (e, t) => Z(e, t)
			}
		],
		status: (e) => X(e),
		overview: [
			{
				label: "PipelineRun",
				render: (e) => ke("tekton.pipelineruns", e, e.metadata.labels?.["tekton.dev/pipelineRun"])
			},
			{
				label: "Pod",
				render: (e) => ke("core.pods", e, e.status?.podName)
			},
			{
				label: "Duration",
				render: (e) => Z(e, Date.now())
			},
			{
				label: "Message",
				render: (e) => me(e) || "—"
			}
		],
		forbiddenHint: Ae
	}, Ne = {
		id: "tekton.pipelines",
		type: Se,
		label: "Pipelines",
		singular: "Pipeline",
		path: "tekton/pipelines",
		create: {
			label: "Create Pipeline",
			route: "tekton.pipelines.new"
		},
		columns: [{
			key: "tasks",
			title: "Tasks",
			width: 90,
			render: (e) => String(e.spec?.tasks?.length ?? 0)
		}, {
			key: "description",
			title: "Description",
			minWidth: 200,
			render: (e) => e.spec?.description ?? ""
		}],
		overview: [
			{
				label: "Tasks",
				render: (e) => (e.spec?.tasks ?? []).map((e) => e.name).join(", ") || "—"
			},
			{
				label: "Parameters",
				render: (e) => (e.spec?.params ?? []).map((e) => e.name).join(", ") || "—"
			},
			{
				label: "Workspaces",
				render: (e) => (e.spec?.workspaces ?? []).map((e) => e.name).join(", ") || "—"
			}
		],
		forbiddenHint: Ae
	}, Pe = {
		id: "tekton.tasks",
		type: Ce,
		label: "Tasks",
		singular: "Task",
		path: "tekton/tasks",
		create: {
			label: "Create Task",
			route: "tekton.tasks.new"
		},
		columns: [{
			key: "steps",
			title: "Steps",
			width: 90,
			render: (e) => String(e.spec?.steps?.length ?? 0)
		}, {
			key: "description",
			title: "Description",
			minWidth: 200,
			render: (e) => e.spec?.description ?? ""
		}],
		overview: [
			{
				label: "Steps",
				render: (e) => (e.spec?.steps ?? []).map((e) => `${e.name ?? "?"} (${e.image ?? "—"})`).join(", ") || "—"
			},
			{
				label: "Parameters",
				render: (e) => (e.spec?.params ?? []).map((e) => e.name).join(", ") || "—"
			},
			{
				label: "Workspaces",
				render: (e) => (e.spec?.workspaces ?? []).map((e) => e.name).join(", ") || "—"
			}
		],
		forbiddenHint: Ae
	}, Fe = {
		Task: "tasks",
		Pipeline: "pipelines",
		PipelineRun: "pipelineruns"
	};
})), Ie, Le, Re = H((() => {
	Ie = [{
		id: "script",
		label: "Script step",
		yaml: (e) => `apiVersion: tekton.dev/v1
kind: Task
metadata:
  name: ${e}
spec:
  description: Runs a shell script.
  params:
    - name: message
      type: string
      default: Hello from Tekton
  steps:
    - name: run
      image: busybox:1.36
      script: |
        #!/bin/sh
        echo "$(params.message)"
`
	}, {
		id: "workspace",
		label: "Step with a workspace",
		yaml: (e) => `apiVersion: tekton.dev/v1
kind: Task
metadata:
  name: ${e}
spec:
  description: Writes a file into a shared workspace.
  workspaces:
    - name: work
  steps:
    - name: write
      image: busybox:1.36
      script: |
        #!/bin/sh
        date > $(workspaces.work.path)/stamp
        cat $(workspaces.work.path)/stamp
`
	}], Le = [{
		id: "two-tasks",
		label: "Two tasks in order",
		yaml: (e) => `apiVersion: tekton.dev/v1
kind: Pipeline
metadata:
  name: ${e}
spec:
  description: Runs one Task twice, the second after the first.
  params:
    - name: app
      type: string
      default: shop
  tasks:
    - name: test
      taskRef:
        name: say
      params:
        - name: message
          value: Testing $(params.app)
    - name: build
      runAfter: [test]
      taskRef:
        name: say
      params:
        - name: message
          value: Building $(params.app)
`
	}, {
		id: "inline",
		label: "Inline task (no Task needed)",
		yaml: (e) => `apiVersion: tekton.dev/v1
kind: Pipeline
metadata:
  name: ${e}
spec:
  params:
    - name: seconds
      type: string
      default: "5"
  tasks:
    - name: work
      params:
        - name: seconds
          value: $(params.seconds)
      taskSpec:
        params:
          - name: seconds
        steps:
          - name: count
            image: busybox:1.36
            script: |
              #!/bin/sh
              n=$(params.seconds); i=1
              while [ "$i" -le "$n" ]; do echo "working $i/$n"; sleep 1; i=$((i + 1)); done
`
	}];
})), ze, Be, Ve, He, Ue, We = H((() => {
	Re(), Q(), ze = { "data-test": "tekton-editor" }, Be = { key: 1 }, Ve = { key: 0 }, He = { key: 0 }, Ue = /*@__PURE__*/ j({
		__name: "EditorPage",
		props: { object: {} },
		setup(e) {
			let n = e, { YamlEditor: r, YamlDiff: f, ResourceLink: p } = Y().components, m = Y().yaml, h = a(), g = s(), te = c(), ne = o(), _ = w(() => n.object === "tasks" ? "Task" : "Pipeline"), v = w(() => !!g.value.name), y = F(g.value.namespace ?? te.value.ns ?? ""), x = w(() => h.value ? pe(h.value) : []), S = w(() => fe(y.value, h.value)), j = w(() => n.object === "tasks" ? Ie : Le), M = F(j.value[0].id), N = F(""), oe = F(""), se = L(null), le = F(!1), H = F(null), U = F([]), W = F([]), G = F(null), K = F(!1), q = F(!1), J = F(!1);
			function ue() {
				let e = j.value.find((e) => e.id === M.value);
				e && (N.value = e.yaml(n.object === "tasks" ? "say" : "my-pipeline"));
			}
			ae(async () => {
				if (de(!0), !v.value) {
					!y.value && x.value.length && (y.value = x.value[0]), ue();
					return;
				}
				le.value = !0;
				try {
					let e = `/api/clusters/${encodeURIComponent(h.value ?? "")}/k8s/apis/tekton.dev/v1/namespaces/${encodeURIComponent(y.value)}/${n.object}/${encodeURIComponent(g.value.name)}`, t = await fetch(e, { headers: { Accept: "application/json" } });
					if (!t.ok) throw Error(`${_.value} ${g.value.name} could not be loaded (${t.status})`);
					let r = await t.json();
					se.value = {
						uid: r.metadata.uid,
						resourceVersion: r.metadata.resourceVersion
					}, oe.value = N.value = m.editable(r);
				} catch (e) {
					H.value = e instanceof Error ? e.message : String(e);
				} finally {
					le.value = !1;
				}
			}), B(x, (e) => {
				!v.value && !y.value && e.length && (y.value = e[0]);
			}), B(N, () => {
				q.value = !1, J.value = !1;
			});
			function X() {
				try {
					return G.value = null, m.parse(N.value);
				} catch (e) {
					return G.value = e instanceof Error ? e.message : String(e), U.value = [], null;
				}
			}
			function me(e) {
				e instanceof t ? (G.value = e.message, U.value = e.problems, W.value = e.warnings) : G.value = e instanceof Error ? e.message : String(e);
			}
			async function Z() {
				let e = X();
				if (!e || !h.value) return !1;
				K.value = !0;
				try {
					let t = await i.validate(h.value, _e, n.object, y.value, e, g.value.name);
					return U.value = t.problems, W.value = t.warnings, q.value = t.problems.length === 0, q.value;
				} catch (e) {
					return me(e), !1;
				} finally {
					K.value = !1;
				}
			}
			async function he() {
				let e = X();
				if (e && h.value) {
					K.value = !0;
					try {
						let t = (v.value ? await i.update(h.value, _e, n.object, y.value, g.value.name, e, se.value) : await i.create(h.value, _e, n.object, y.value, e)).object.metadata.name;
						await ne({
							name: `tekton.${n.object}.detail`,
							params: {
								cluster: h.value,
								namespace: y.value,
								name: t
							}
						});
					} catch (e) {
						me(e);
					} finally {
						K.value = !1;
					}
				}
			}
			async function ge() {
				if (v.value && !J.value) {
					await Z() && (J.value = !0);
					return;
				}
				(q.value || await Z()) && await he();
			}
			return (t, n) => (P(), D("div", ze, [A(z(ee), { class: "title" }, {
				default: V(() => [k(R(v.value ? `Edit ${_.value} ${z(g).name}` : `Create ${_.value}`), 1)]),
				_: 1
			}), le.value ? (P(), T(z(ie), { key: 0 })) : H.value ? (P(), T(z(l), {
				key: 1,
				type: "error"
			}, {
				default: V(() => [k(R(H.value), 1)]),
				_: 1
			})) : (P(), T(z(d), {
				key: 2,
				size: "small"
			}, {
				default: V(() => [
					A(z(b), {
						align: "center",
						class: "toolbar"
					}, {
						default: V(() => [
							n[5] ||= O("span", null, "Namespace", -1),
							v.value ? (P(), D("strong", Be, R(y.value), 1)) : (P(), T(z(re), {
								key: 0,
								value: y.value,
								"onUpdate:value": n[0] ||= (e) => y.value = e,
								options: x.value.map((e) => ({
									label: e,
									value: e
								})),
								placeholder: "A Project namespace",
								size: "small",
								class: "select",
								"data-test": "editor-namespace"
							}, null, 8, ["value", "options"])),
							v.value ? E("", !0) : (P(), D(C, { key: 2 }, [n[4] ||= O("span", null, "Template", -1), A(z(re), {
								value: M.value,
								"onUpdate:value": [n[1] ||= (e) => M.value = e, ue],
								options: j.value.map((e) => ({
									label: e.label,
									value: e.id
								})),
								size: "small",
								class: "select",
								"data-test": "editor-template"
							}, null, 8, ["value", "options"])], 64))
						]),
						_: 1
					}),
					!x.value.length && !v.value ? (P(), T(z(l), {
						key: 0,
						type: "info",
						class: "gap",
						"data-test": "editor-no-projects"
					}, {
						default: V(() => [...n[6] ||= [k(" Tasks and Pipelines can be created only in Project namespaces, and this cluster has no Projects yet. ", -1)]]),
						_: 1
					})) : y.value && !S.value ? (P(), T(z(l), {
						key: 1,
						type: "warning",
						class: "gap"
					}, {
						default: V(() => [k(R(y.value) + " is not a Project namespace: Tasks and Pipelines can be written only in Projects. ", 1)]),
						_: 1
					})) : E("", !0),
					J.value ? (P(), T(ce(z(f)), {
						key: 2,
						original: oe.value,
						modified: N.value,
						"data-test": "editor-diff"
					}, null, 8, ["original", "modified"])) : (P(), T(ce(z(r)), {
						key: 3,
						value: N.value,
						"onUpdate:value": n[2] ||= (e) => N.value = e,
						problems: U.value,
						height: "55vh"
					}, null, 40, ["value", "problems"])),
					G.value || U.value.length ? (P(), T(z(l), {
						key: 4,
						type: "error",
						class: "gap",
						"data-test": "editor-error"
					}, {
						default: V(() => [k(R(G.value ?? "It does not meet the rules for this Project:") + " ", 1), U.value.length ? (P(), D("ul", Ve, [(P(!0), D(C, null, I(U.value, (e) => (P(), D("li", {
							key: e.path + e.message,
							"data-test": "editor-problem"
						}, [e.path ? (P(), D("code", He, R(e.path), 1)) : E("", !0), k(" " + R(e.message), 1)]))), 128))])) : E("", !0)]),
						_: 1
					})) : q.value && !J.value ? (P(), T(z(l), {
						key: 5,
						type: "success",
						class: "gap",
						"data-test": "editor-valid"
					}, {
						default: V(() => [...n[7] ||= [k(" It meets the rules for this Project and the cluster accepts it. ", -1)]]),
						_: 1
					})) : E("", !0),
					W.value.length ? (P(), T(z(l), {
						key: 6,
						type: "warning",
						class: "gap",
						"data-test": "editor-warnings"
					}, {
						default: V(() => [(P(!0), D(C, null, I(W.value, (e) => (P(), D("div", { key: e }, R(e), 1))), 128))]),
						_: 1
					})) : E("", !0),
					A(z(b), {
						justify: "end",
						class: "gap"
					}, {
						default: V(() => [
							v.value ? (P(), T(ce(z(p)), {
								key: 0,
								resource: `tekton.${e.object}`,
								namespace: y.value,
								name: z(g).name
							}, {
								default: V(() => [...n[8] ||= [k(" Cancel ", -1)]]),
								_: 1
							}, 8, [
								"resource",
								"namespace",
								"name"
							])) : E("", !0),
							J.value ? (P(), T(z(u), {
								key: 1,
								onClick: n[3] ||= (e) => J.value = !1
							}, {
								default: V(() => [...n[9] ||= [k(" Back to the editor ", -1)]]),
								_: 1
							})) : (P(), T(z(u), {
								key: 2,
								loading: K.value,
								disabled: !S.value,
								"data-test": "editor-validate",
								onClick: Z
							}, {
								default: V(() => [...n[10] ||= [k(" Validate ", -1)]]),
								_: 1
							}, 8, ["loading", "disabled"])),
							A(z(u), {
								type: "primary",
								loading: K.value,
								disabled: !S.value,
								"data-test": "editor-save",
								onClick: ge
							}, {
								default: V(() => [k(R(v.value ? J.value ? "Save" : "Review changes" : `Create ${_.value}`), 1)]),
								_: 1
							}, 8, ["loading", "disabled"])
						]),
						_: 1
					})
				]),
				_: 1
			}))]));
		}
	});
})), Ge = H((() => {})), $, Ke = H((() => {
	$ = (e, t) => {
		let n = e.__vccOpts || e;
		for (let [e, r] of t) n[e] = r;
		return n;
	};
})), qe = /* @__PURE__ */ U({ default: () => Je }), Je, Ye = H((() => {
	We(), We(), Ge(), Ke(), Je = /*#__PURE__*/ $(Ue, [["__scopeId", "data-v-e2addc7d"]]);
})), Xe, Ze, Qe, $e, et, tt, nt, rt = H((() => {
	Q(), Xe = { "data-test": "tekton-start" }, Ze = { key: 0 }, Qe = { key: 1 }, $e = {
		key: 0,
		class: "muted"
	}, et = { key: 0 }, tt = { key: 0 }, nt = /*@__PURE__*/ j({
		__name: "StartRunPage",
		setup(e) {
			let { ResourceLink: n } = Y().components, r = a(), f = s(), m = c(), _ = o(), x = w(() => f.value.namespace ?? ""), S = w(() => f.value.name ?? ""), j = F(!0), M = F(null), N = F([]), oe = F([]), L = se({}), B = se({}), le = F([]), H = F(null), U = F(!1), W = F(null), G = F([]), K = F([]), q = (e) => `/api/clusters/${encodeURIComponent(r.value ?? "")}/k8s/${e}`;
			async function J(e) {
				let t = await fetch(e, { headers: { Accept: "application/json" } });
				return t.ok ? await t.json() : null;
			}
			ae(async () => {
				de(!0);
				try {
					let e = await J(q(`apis/tekton.dev/v1/namespaces/${encodeURIComponent(x.value)}/pipelines/${encodeURIComponent(S.value)}`));
					if (!e) throw Error(`Pipeline ${S.value} could not be loaded`);
					N.value = e.spec?.params ?? [], oe.value = e.spec?.workspaces ?? [];
					let t = {};
					if (m.value.from) {
						let e = await J(q(`apis/tekton.dev/v1/namespaces/${encodeURIComponent(x.value)}/pipelineruns/${encodeURIComponent(m.value.from)}`));
						t = Object.fromEntries((e?.spec?.params ?? []).map((e) => [e.name, e.value]));
					}
					for (let e of N.value) {
						let n = t[e.name] ?? e.default;
						L[e.name] = e.type === "array" ? n ?? [] : n === void 0 ? "" : typeof n == "string" ? n : JSON.stringify(n);
					}
					for (let e of oe.value) B[e.name] = {
						kind: e.optional ? "none" : "emptyDir",
						sizeGi: 1,
						configMap: ""
					};
					let n = await J(q(`api/v1/namespaces/${encodeURIComponent(x.value)}/configmaps`));
					le.value = (n?.items ?? []).map((e) => e.metadata.name).filter((e) => e !== "kube-root-ca.crt").sort();
					let r = (await J(q(`api/v1/namespaces/${encodeURIComponent(x.value)}/resourcequotas`)))?.items.find((e) => e.status?.hard?.["requests.storage"]);
					r && (H.value = `${r.status.used?.["requests.storage"] ?? "0"} of ${r.status.hard["requests.storage"]} used`);
				} catch (e) {
					M.value = e instanceof Error ? e.message : String(e);
				} finally {
					j.value = !1;
				}
			});
			let ue = w(() => fe(x.value, r.value)), pe = w(() => N.value.filter((e) => e.default === void 0 && (L[e.name] === "" || Array.isArray(L[e.name]) && !L[e.name].length)).map((e) => e.name));
			function X() {
				let e = N.value.map((e) => {
					let t = L[e.name];
					if (e.type === "object" && typeof t == "string") try {
						return {
							name: e.name,
							value: JSON.parse(t)
						};
					} catch {
						return {
							name: e.name,
							value: t
						};
					}
					return {
						name: e.name,
						value: t
					};
				}), t = Object.entries(B).filter(([, e]) => e.kind !== "none").map(([e, t]) => t.kind === "emptyDir" ? {
					name: e,
					emptyDir: {}
				} : t.kind === "configMap" ? {
					name: e,
					configMap: { name: t.configMap }
				} : {
					name: e,
					volumeClaimTemplate: { spec: {
						accessModes: ["ReadWriteOnce"],
						resources: { requests: { storage: `${t.sizeGi}Gi` } }
					} }
				});
				return {
					apiVersion: "tekton.dev/v1",
					kind: "PipelineRun",
					metadata: { generateName: `${S.value.slice(0, 50)}-` },
					spec: {
						pipelineRef: { name: S.value },
						params: e,
						workspaces: t
					}
				};
			}
			async function me() {
				if (r.value) {
					U.value = !0, W.value = null, G.value = [];
					try {
						let e = (await i.create(r.value, _e, "pipelineruns", x.value, X())).object.metadata.name;
						await _({
							name: "tekton.pipelineruns.detail",
							params: {
								cluster: r.value,
								namespace: x.value,
								name: e
							}
						});
					} catch (e) {
						e instanceof t ? (W.value = e.message, G.value = e.problems, K.value = e.warnings) : W.value = e instanceof Error ? e.message : String(e);
					} finally {
						U.value = !1;
					}
				}
			}
			return (e, t) => (P(), D("div", Xe, [A(z(ee), { class: "title" }, {
				default: V(() => [t[0] ||= k(" Start a run of ", -1), (P(), T(ce(z(n)), {
					resource: "tekton.pipelines",
					namespace: x.value,
					name: S.value
				}, null, 8, ["namespace", "name"]))]),
				_: 1
			}), j.value ? (P(), T(z(ie), { key: 0 })) : M.value ? (P(), T(z(l), {
				key: 1,
				type: "error"
			}, {
				default: V(() => [k(R(M.value), 1)]),
				_: 1
			})) : ue.value ? (P(), T(z(d), {
				key: 3,
				size: "small"
			}, {
				default: V(() => [
					A(z(h), { "label-placement": "top" }, {
						default: V(() => [
							N.value.length ? (P(), D("h4", Ze, " Parameters ")) : E("", !0),
							(P(!0), D(C, null, I(N.value, (e) => (P(), T(z(g), {
								key: e.name,
								label: e.name + (e.default === void 0 ? " (required)" : ""),
								feedback: e.description
							}, {
								default: V(() => [e.type === "array" ? (P(), T(z(p), {
									key: 0,
									value: L[e.name],
									"onUpdate:value": (t) => L[e.name] = t,
									"data-test": `param-${e.name}`
								}, null, 8, [
									"value",
									"onUpdate:value",
									"data-test"
								])) : (P(), T(z(te), {
									key: 1,
									value: L[e.name],
									"onUpdate:value": (t) => L[e.name] = t,
									type: e.type === "object" ? "textarea" : "text",
									placeholder: e.type === "object" ? "{\"key\": \"value\"}" : "",
									"data-test": `param-${e.name}`
								}, null, 8, [
									"value",
									"onUpdate:value",
									"type",
									"placeholder",
									"data-test"
								]))]),
								_: 2
							}, 1032, ["label", "feedback"]))), 128)),
							oe.value.length ? (P(), D("h4", Qe, " Workspaces ")) : E("", !0),
							(P(!0), D(C, null, I(oe.value, (e) => (P(), T(z(g), {
								key: e.name,
								label: e.name + (e.optional ? " (optional)" : ""),
								feedback: e.description
							}, {
								default: V(() => [A(z(b), {
									vertical: "",
									"data-test": `workspace-${e.name}`
								}, {
									default: V(() => [
										A(z(y), {
											value: B[e.name].kind,
											"onUpdate:value": (t) => B[e.name].kind = t,
											size: "small"
										}, {
											default: V(() => [
												e.optional ? (P(), T(z(v), {
													key: 0,
													value: "none"
												}, {
													default: V(() => [...t[1] ||= [k(" None ", -1)]]),
													_: 1
												})) : E("", !0),
												A(z(v), { value: "emptyDir" }, {
													default: V(() => [...t[2] ||= [k(" Empty directory ", -1)]]),
													_: 1
												}),
												A(z(v), { value: "volumeClaimTemplate" }, {
													default: V(() => [...t[3] ||= [k(" New volume ", -1)]]),
													_: 1
												}),
												A(z(v), {
													value: "configMap",
													disabled: !le.value.length
												}, {
													default: V(() => [...t[4] ||= [k(" ConfigMap ", -1)]]),
													_: 1
												}, 8, ["disabled"])
											]),
											_: 2
										}, 1032, ["value", "onUpdate:value"]),
										B[e.name].kind === "volumeClaimTemplate" ? (P(), T(z(b), {
											key: 0,
											align: "center"
										}, {
											default: V(() => [A(z(ne), {
												value: B[e.name].sizeGi,
												"onUpdate:value": (t) => B[e.name].sizeGi = t,
												min: 1,
												max: 100,
												size: "small"
											}, {
												suffix: V(() => [...t[5] ||= [k(" Gi ", -1)]]),
												_: 1
											}, 8, ["value", "onUpdate:value"]), H.value ? (P(), D("span", $e, "Project storage: " + R(H.value), 1)) : E("", !0)]),
											_: 2
										}, 1024)) : E("", !0),
										B[e.name].kind === "configMap" ? (P(), T(z(re), {
											key: 1,
											value: B[e.name].configMap,
											"onUpdate:value": (t) => B[e.name].configMap = t,
											options: le.value.map((e) => ({
												label: e,
												value: e
											})),
											size: "small",
											class: "select"
										}, null, 8, [
											"value",
											"onUpdate:value",
											"options"
										])) : E("", !0)
									]),
									_: 2
								}, 1032, ["data-test"])]),
								_: 2
							}, 1032, ["label", "feedback"]))), 128))
						]),
						_: 1
					}),
					A(z(l), {
						type: "info",
						bordered: !1,
						class: "gap"
					}, {
						default: V(() => [...t[6] ||= [
							k(" The run uses the Project's ", -1),
							O("code", null, "pipeline", -1),
							k(" ServiceAccount, which has no permissions and no API token. ", -1)
						]]),
						_: 1
					}),
					W.value ? (P(), T(z(l), {
						key: 0,
						type: "error",
						class: "gap",
						"data-test": "start-error"
					}, {
						default: V(() => [k(R(W.value) + " ", 1), G.value.length ? (P(), D("ul", et, [(P(!0), D(C, null, I(G.value, (e) => (P(), D("li", { key: e.path + e.message }, [e.path ? (P(), D("code", tt, R(e.path), 1)) : E("", !0), k(" " + R(e.message), 1)]))), 128))])) : E("", !0)]),
						_: 1
					})) : E("", !0),
					K.value.length ? (P(), T(z(l), {
						key: 1,
						type: "warning",
						class: "gap"
					}, {
						default: V(() => [(P(!0), D(C, null, I(K.value, (e) => (P(), D("div", { key: e }, R(e), 1))), 128))]),
						_: 1
					})) : E("", !0),
					A(z(b), {
						justify: "end",
						class: "gap"
					}, {
						default: V(() => [A(z(u), {
							type: "primary",
							loading: U.value,
							disabled: pe.value.length > 0,
							"data-test": "start-submit",
							onClick: me
						}, {
							default: V(() => [...t[7] ||= [k(" Start run ", -1)]]),
							_: 1
						}, 8, ["loading", "disabled"])]),
						_: 1
					})
				]),
				_: 1
			})) : (P(), T(z(l), {
				key: 2,
				type: "warning"
			}, {
				default: V(() => [k(R(x.value) + " is not a Project namespace: runs can be started only in Projects. ", 1)]),
				_: 1
			}))]));
		}
	});
})), it = H((() => {})), at = /* @__PURE__ */ U({ default: () => ot }), ot, st = H((() => {
	rt(), rt(), it(), Ke(), ot = /*#__PURE__*/ $(nt, [["__scopeId", "data-v-4949b877"]]);
}));
//#endregion
//#region src/graph.ts
function ct(e, t) {
	let n = new Set(e.runAfter ?? []), r = JSON.stringify([e.params ?? [], e.when ?? []]);
	for (let e of r.matchAll(ut)) n.add(e[1]);
	return [...n].filter((n) => t.has(n) && n !== e.name).sort();
}
function lt(e, t = []) {
	let n = new Set(e.map((e) => e.name)), r = new Map(e.map((e) => [e.name, ct(e, n)])), i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set(), o = (e) => {
		let t = i.get(e);
		if (t !== void 0) return t;
		if (a.has(e)) return 0;
		a.add(e);
		let n = Math.max(-1, ...(r.get(e) ?? []).map(o)) + 1;
		return a.delete(e), i.set(e, n), n;
	};
	e.forEach((e) => o(e.name));
	let s = e.length ? Math.max(...i.values()) + 1 : 0, c = [], l = /* @__PURE__ */ new Map();
	for (let t of e) {
		let e = i.get(t.name), n = l.get(e) ?? 0;
		l.set(e, n + 1), c.push({
			name: t.name,
			column: e,
			row: n,
			finally: !1
		});
	}
	t.forEach((e, t) => c.push({
		name: e.name,
		column: s,
		row: t,
		finally: !0
	}));
	let u = [];
	for (let t of e) for (let e of r.get(t.name)) u.push({
		from: e,
		to: t.name
	});
	let d = c.filter((e) => !e.finally && e.column === s - 1);
	for (let e of t) for (let t of d) u.push({
		from: t.name,
		to: e.name
	});
	let f = Math.max(1, ...l.values(), t.length);
	return {
		nodes: c,
		edges: u,
		columns: s + +!!t.length,
		rows: f
	};
}
var ut, dt = H((() => {
	ut = /\$\(tasks\.([a-z0-9]([-a-z0-9]*[a-z0-9])?)\.results\./g;
})), ft, pt = H((() => {
	Q(), ft = /*@__PURE__*/ j({
		__name: "TaskRunLogs",
		props: {
			cluster: {},
			taskRun: {}
		},
		setup(e) {
			let t = e, { LogViewer: n } = Y().components, r = w(() => t.taskRun.status?.podName ?? ""), i = w(() => t.taskRun.status?.steps ?? []), a = w(() => i.value.map((e) => ({
				label: e.name,
				value: e.container
			}))), o = w(() => i.value.map((e) => e.terminated ? "t" : e.running ? "r" : "w").join(""));
			return (t, i) => !r.value || !a.value.length ? (P(), T(z(l), {
				key: 0,
				type: "info",
				bordered: !1
			}, {
				default: V(() => [...i[0] ||= [k(" The TaskRun has no pod yet: logs show once its steps start. ", -1)]]),
				_: 1
			})) : (P(), T(ce(z(n)), {
				key: `${r.value}/${o.value}`,
				cluster: e.cluster,
				namespace: e.taskRun.metadata.namespace ?? "",
				pod: r.value,
				containers: a.value
			}, null, 8, [
				"cluster",
				"namespace",
				"pod",
				"containers"
			]));
		}
	});
})), mt, ht = H((() => {
	pt(), pt(), mt = ft;
})), gt, _t, vt, yt, bt, xt, St, Ct, wt, Tt, Et, Dt, Ot = H((() => {
	dt(), ht(), Q(), gt = { "data-test": "tekton-graph" }, _t = {
		key: 1,
		class: "scroll"
	}, vt = [
		"width",
		"height",
		"aria-label"
	], yt = ["d"], bt = [
		"transform",
		"data-test",
		"data-state",
		"onClick"
	], xt = ["stroke", "stroke-dasharray"], St = ["cy", "fill"], Ct = ["y"], wt = {
		key: 0,
		x: "26",
		y: "34",
		class: "state"
	}, Tt = 170, Et = 44, Dt = /*@__PURE__*/ j({
		__name: "GraphTab",
		props: {
			cluster: {},
			object: {}
		},
		setup(e) {
			let t = e, n = w(() => t.object.kind === "PipelineRun"), r = w(() => n.value ? t.object.status?.pipelineSpec ?? t.object.spec?.pipelineSpec ?? {} : t.object.spec ?? {}), i = w(() => lt(r.value.tasks ?? [], r.value.finally ?? [])), a = n.value ? Y().composables.useLiveList(() => ({
				cluster: t.cluster,
				type: xe,
				namespace: t.object.metadata.namespace,
				labelSelector: `tekton.dev/pipelineRun=${t.object.metadata.name}`
			})).items : F([]), o = w(() => new Map(a.value.map((e) => [e.metadata.labels?.["tekton.dev/pipelineTask"] ?? "", e]))), s = F(null), c = w(() => s.value ? o.value.get(s.value) ?? null : null), u = (e) => 10 + e * 230, d = (e) => 10 + e * 64, f = w(() => new Map(i.value.nodes.map((e) => [e.name, e]))), p = w(() => u(i.value.columns) + 10), h = w(() => d(i.value.rows) + 10), g = {
				success: "#18a058",
				error: "#d03050",
				warning: "#f0a020",
				info: "#2080f0",
				default: "#888"
			};
			function ee(e) {
				if (!n.value) return {
					label: "",
					color: "#c39b6e"
				};
				let t = o.value.get(e);
				if (!t) return {
					label: "Not started",
					color: g.default
				};
				let r = X(t);
				return {
					label: r.text,
					color: g[r.tone] ?? g.default
				};
			}
			function te(e, t) {
				let n = f.value.get(e), r = f.value.get(t);
				if (!n || !r) return "";
				let i = u(n.column) + Tt, a = d(n.row) + Et / 2, o = u(r.column), s = d(r.row) + Et / 2, c = (i + o) / 2;
				return `M${i},${a} C${c},${a} ${c},${s} ${o},${s}`;
			}
			return (t, r) => (P(), D("div", gt, [i.value.nodes.length ? (P(), D("div", _t, [(P(), D("svg", {
				width: p.value,
				height: h.value,
				role: "img",
				"aria-label": `Task graph of ${e.object.metadata.name}`
			}, [
				r[0] ||= O("defs", null, [O("marker", {
					id: "arrow",
					viewBox: "0 0 10 10",
					refX: "10",
					refY: "5",
					markerWidth: "6",
					markerHeight: "6",
					orient: "auto-start-reverse"
				}, [O("path", {
					d: "M 0 0 L 10 5 L 0 10 z",
					class: "arrow"
				})])], -1),
				(P(!0), D(C, null, I(i.value.edges, (e) => (P(), D("path", {
					key: e.from + ">" + e.to,
					d: te(e.from, e.to),
					class: "edge",
					"marker-end": "url(#arrow)"
				}, null, 8, yt))), 128)),
				(P(!0), D(C, null, I(i.value.nodes, (e) => (P(), D("g", {
					key: e.name,
					transform: `translate(${u(e.column)},${d(e.row)})`,
					class: N(["node", {
						clickable: n.value,
						chosen: s.value === e.name
					}]),
					"data-test": `graph-node-${e.name}`,
					"data-state": ee(e.name).label,
					onClick: (t) => n.value && (s.value = e.name)
				}, [
					O("rect", {
						width: Tt,
						height: Et,
						rx: "8",
						stroke: ee(e.name).color,
						"stroke-dasharray": e.finally ? "4 3" : void 0
					}, null, 8, xt),
					O("circle", {
						cx: "14",
						cy: Et / 2,
						r: "5",
						fill: ee(e.name).color
					}, null, 8, St),
					O("text", {
						x: "26",
						y: n.value ? 18 : 26,
						class: "name"
					}, R(e.name.length > 18 ? e.name.slice(0, 17) + "…" : e.name), 9, Ct),
					n.value ? (P(), D("text", wt, R(ee(e.name).label), 1)) : E("", !0)
				], 10, bt))), 128))
			], 8, vt))])) : (P(), T(z(m), {
				key: 0,
				description: "No tasks."
			})), n.value && s.value ? (P(), D(C, { key: 2 }, [O("h4", null, "Logs: " + R(s.value), 1), c.value ? (P(), T(mt, {
				key: 0,
				cluster: e.cluster,
				"task-run": c.value
			}, null, 8, ["cluster", "task-run"])) : (P(), T(z(l), {
				key: 1,
				type: "info",
				bordered: !1
			}, {
				default: V(() => [...r[1] ||= [k(" This task has not started. ", -1)]]),
				_: 1
			}))], 64)) : E("", !0)]));
		}
	});
})), kt = H((() => {})), At = /* @__PURE__ */ U({ default: () => jt }), jt, Mt = H((() => {
	Ot(), Ot(), kt(), Ke(), jt = /*#__PURE__*/ $(Dt, [["__scopeId", "data-v-774e814d"]]);
})), Nt, Pt, Ft, It = H((() => {
	J(), Q(), Nt = { class: "reason" }, Pt = { class: "hint" }, Ft = /*@__PURE__*/ j({
		__name: "ImagePullBanner",
		props: {
			cluster: {},
			taskRuns: {},
			pipelineRun: {}
		},
		setup(e) {
			let t = e, n = S(), i = F(!1), a = w(() => t.taskRuns.flatMap((e) => W(e).map((t) => ({
				...t,
				task: e.metadata.labels?.["tekton.dev/pipelineTask"] ?? e.metadata.name
			})))), o = w(() => [...new Set(a.value.map((e) => e.image).filter((e) => !e.startsWith("(")))]), s = w(() => {
				let e = t.pipelineRun;
				return !!e && X(e).running && fe(e.metadata.namespace, t.cluster);
			});
			async function c() {
				let e = t.pipelineRun;
				i.value = !0;
				try {
					await r(t.cluster, _e, "cancel", {
						namespace: e.metadata.namespace,
						name: e.metadata.name,
						uid: e.metadata.uid
					}), n.success(`Cancelling ${e.metadata.name}`);
				} catch (e) {
					n.error(e instanceof Error ? e.message : String(e));
				} finally {
					i.value = !1;
				}
			}
			return (t, n) => a.value.length ? (P(), T(z(l), {
				key: 0,
				type: "error",
				title: "Waiting for an image that cannot be pulled",
				class: "pull",
				"data-test": "image-pull-problem"
			}, {
				default: V(() => [
					(P(!0), D(C, null, I(a.value, (t) => (P(), D("div", { key: t.task + t.container }, [
						O("strong", null, R(t.task), 1),
						k(" (" + R(t.container) + "): " + R(z(K)(t, e.cluster)) + " ", 1),
						O("span", Nt, R(t.reason), 1)
					]))), 128)),
					O("div", Pt, [n[0] ||= k(" The run stays waiting until the image is available or the run times out. On the local k3d clusters, import it on the host: ", -1), (P(!0), D(C, null, I(o.value, (t) => (P(), D("code", {
						key: t,
						class: "cmd"
					}, "docker pull " + R(t) + " && k3d image import " + R(t) + " -c capybara-" + R(e.cluster), 1))), 128))]),
					s.value ? (P(), T(z(u), {
						key: 0,
						size: "small",
						type: "error",
						ghost: "",
						loading: i.value,
						class: "cancel",
						"data-test": "image-pull-cancel",
						onClick: c
					}, {
						default: V(() => [...n[1] ||= [k(" Cancel run ", -1)]]),
						_: 1
					}, 8, ["loading"])) : E("", !0)
				]),
				_: 1
			})) : E("", !0);
		}
	});
})), Lt = H((() => {})), Rt, zt = H((() => {
	It(), It(), Lt(), Ke(), Rt = /*#__PURE__*/ $(Ft, [["__scopeId", "data-v-7a8b8553"]]);
})), Bt, Vt, Ht = H((() => {
	zt(), ht(), Q(), Bt = { "data-test": "tekton-tasks" }, Vt = /*@__PURE__*/ j({
		__name: "PipelineRunTasksTab",
		props: {
			cluster: {},
			object: {}
		},
		setup(e) {
			let t = e, { ResourceLink: n } = Y().components, { items: r, loading: i, error: a } = Y().composables.useLiveList(() => ({
				cluster: t.cluster,
				type: xe,
				namespace: t.object.metadata.namespace,
				labelSelector: `tekton.dev/pipelineRun=${t.object.metadata.name}`
			}), { sort: (e, t) => De(e) - De(t) }), o = F(Date.now()), s = setInterval(() => o.value = Date.now(), 1e3);
			oe(() => clearInterval(s));
			let c = F(null), u = F(!1);
			B(r, (e) => {
				if (u.value && e.some((e) => e.metadata.uid === c.value)) return;
				let t = e.find((e) => X(e).running);
				c.value = (t ?? e.at(-1))?.metadata.uid ?? null;
			});
			let d = w(() => r.value.find((e) => e.metadata.uid === c.value) ?? null), p = (e) => e.metadata.labels?.["tekton.dev/pipelineTask"] ?? e.metadata.name, h = w(() => [
				{
					key: "task",
					title: "Task",
					render: (e) => p(e)
				},
				{
					key: "status",
					title: "Status",
					width: 140,
					render: ge
				},
				{
					key: "duration",
					title: "Duration",
					width: 100,
					render: (e) => Z(e, o.value)
				},
				{
					key: "name",
					title: "TaskRun",
					ellipsis: { tooltip: !0 },
					render: (e) => M(n, {
						resource: "tekton.taskruns",
						namespace: e.metadata.namespace,
						name: e.metadata.name
					})
				}
			]), g = (e) => ({
				style: "cursor: pointer",
				"data-test": `task-${p(e)}`,
				onClick: () => {
					c.value = e.metadata.uid, u.value = !0;
				}
			}), ee = (e) => e.metadata.uid === c.value ? "selected" : "";
			return (t, n) => (P(), D("div", Bt, [
				A(Rt, {
					cluster: e.cluster,
					"task-runs": z(r),
					"pipeline-run": e.object
				}, null, 8, [
					"cluster",
					"task-runs",
					"pipeline-run"
				]),
				z(a) ? (P(), T(z(l), {
					key: 0,
					type: "warning",
					class: "gap"
				}, {
					default: V(() => [k(R(z(a)), 1)]),
					_: 1
				})) : E("", !0),
				A(z(f), {
					size: "small",
					columns: h.value,
					data: z(r),
					loading: z(i),
					"row-key": (e) => e.metadata.uid,
					"row-props": g,
					"row-class-name": ee,
					class: "gap"
				}, null, 8, [
					"columns",
					"data",
					"loading",
					"row-key"
				]),
				d.value ? (P(), D(C, { key: 1 }, [O("h4", null, "Logs: " + R(p(d.value)), 1), A(mt, {
					cluster: e.cluster,
					"task-run": d.value
				}, null, 8, ["cluster", "task-run"])], 64)) : z(i) ? E("", !0) : (P(), T(z(m), {
					key: 2,
					description: "No TaskRuns yet."
				}))
			]));
		}
	});
})), Ut = H((() => {})), Wt = /* @__PURE__ */ U({ default: () => Gt }), Gt, Kt = H((() => {
	Ht(), Ht(), Ut(), Ke(), Gt = /*#__PURE__*/ $(Vt, [["__scopeId", "data-v-bd94b745"]]);
})), qt, Jt, Yt = H((() => {
	zt(), ht(), qt = { "data-test": "tekton-taskrun-logs" }, Jt = /*@__PURE__*/ j({
		__name: "TaskRunLogsTab",
		props: {
			cluster: {},
			object: {}
		},
		setup(e) {
			return (t, n) => (P(), D("div", qt, [A(Rt, {
				cluster: e.cluster,
				"task-runs": [e.object]
			}, null, 8, ["cluster", "task-runs"]), A(mt, {
				cluster: e.cluster,
				"task-run": e.object
			}, null, 8, ["cluster", "task-run"])]));
		}
	});
})), Xt = /* @__PURE__ */ U({ default: () => Zt }), Zt, Qt = H((() => {
	Yt(), Yt(), Zt = Jt;
})), $t, en = H((() => {
	$t = /*@__PURE__*/ j({
		__name: "StartRunAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: t }) {
			let n = e, r = t, i = o();
			return ae(async () => {
				await i({
					name: "tekton.pipelines.start",
					params: {
						cluster: n.cluster,
						namespace: n.object.metadata.namespace ?? "",
						name: n.object.metadata.name
					}
				}), r("close");
			}), (e, t) => (P(), D("span"));
		}
	});
})), tn = /* @__PURE__ */ U({ default: () => nn }), nn, rn = H((() => {
	en(), en(), nn = $t;
})), an, on = H((() => {
	Q(), an = /*@__PURE__*/ j({
		__name: "EditAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: t }) {
			let n = e, r = t, i = o();
			return ae(async () => {
				let e = Fe[n.object.kind ?? ""];
				await i({
					name: `tekton.${e}.edit`,
					params: {
						cluster: n.cluster,
						namespace: n.object.metadata.namespace ?? "",
						name: n.object.metadata.name
					}
				}), r("close");
			}), (e, t) => (P(), D("span"));
		}
	});
})), sn = /* @__PURE__ */ U({ default: () => cn }), cn, ln = H((() => {
	on(), on(), cn = an;
})), un, dn, fn, pn = H((() => {
	Q(), un = {
		key: 0,
		"data-test": "rerun-created"
	}, dn = { key: 0 }, fn = /*@__PURE__*/ j({
		__name: "RerunAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: n }) {
			let i = e, a = n, { ResourceLink: s } = Y().components, c = o(), d = F(!1), f = i.object.spec?.pipelineRef?.name;
			async function p() {
				await c({
					name: "tekton.pipelines.start",
					params: {
						cluster: i.cluster,
						namespace: i.object.metadata.namespace ?? "",
						name: f
					},
					query: { from: i.object.metadata.name }
				}), a("close");
			}
			let m = F(!1), h = F(null), g = F(null);
			async function ee() {
				m.value = !0, h.value = null;
				try {
					let e = i.object.metadata;
					g.value = await r(i.cluster, "tekton", "rerun", {
						namespace: e.namespace,
						name: e.name,
						uid: e.uid
					});
				} catch (e) {
					h.value = e instanceof Error ? e.message : String(e), e instanceof t && (d.value = e.problems.some((e) => e.path.endsWith("serviceAccountName")), e.problems.length && (h.value = e.problems.map((e) => e.message).join("; ")));
				} finally {
					m.value = !1;
				}
			}
			return (t, n) => (P(), T(z(_), {
				show: !0,
				preset: "card",
				title: `Rerun ${e.object.metadata.name}`,
				style: { "max-width": "520px" },
				onClose: n[1] ||= (e) => a("close"),
				onMaskClick: n[2] ||= (e) => a("close")
			}, {
				footer: V(() => [A(z(b), { justify: "end" }, {
					default: V(() => [A(z(u), { onClick: n[0] ||= (e) => a("close") }, {
						default: V(() => [k(R(g.value ? "Close" : "Cancel"), 1)]),
						_: 1
					}), g.value ? E("", !0) : (P(), T(z(u), {
						key: 0,
						type: "primary",
						loading: m.value,
						"data-test": "confirm",
						onClick: ee
					}, {
						default: V(() => [...n[6] ||= [k(" Rerun ", -1)]]),
						_: 1
					}, 8, ["loading"]))]),
					_: 1
				})]),
				default: V(() => [g.value ? (P(), D("div", un, [
					n[3] ||= k(" Started ", -1),
					(P(), T(ce(z(s)), {
						cluster: e.cluster,
						resource: "tekton.pipelineruns",
						namespace: e.object.metadata.namespace,
						name: g.value
					}, null, 8, [
						"cluster",
						"namespace",
						"name"
					])),
					n[4] ||= k(". ", -1)
				])) : (P(), D(C, { key: 1 }, [O("p", null, " Starts a new PipelineRun with the same pipeline, parameters, workspaces and service account (" + R(e.object.spec?.taskRunTemplate?.serviceAccountName ?? "default") + "). ", 1), h.value ? (P(), T(z(l), {
					key: 0,
					type: "error",
					"data-test": "rerun-error"
				}, {
					default: V(() => [k(R(h.value) + " ", 1), d.value && z(f) ? (P(), D("div", dn, [A(z(u), {
						size: "small",
						class: "start-new",
						"data-test": "rerun-start-new",
						onClick: p
					}, {
						default: V(() => [...n[5] ||= [k(" Start a new run as pipeline ", -1)]]),
						_: 1
					})])) : E("", !0)]),
					_: 1
				})) : E("", !0)], 64))]),
				_: 1
			}, 8, ["title"]));
		}
	});
})), mn = H((() => {})), hn = /* @__PURE__ */ U({ default: () => gn }), gn, _n = H((() => {
	pn(), pn(), mn(), Ke(), gn = /*#__PURE__*/ $(fn, [["__scopeId", "data-v-0f92e9de"]]);
})), vn, yn, bn = H((() => {
	Q(), vn = {
		key: 0,
		"data-test": "cleanup-preview"
	}, yn = /*@__PURE__*/ j({
		__name: "CleanupAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: t }) {
			let n = e, r = t, a = S(), o = F(10), s = F(null), c = F(!1), d = F(null), f = n.object.metadata.namespace ?? "";
			async function p() {
				d.value = null;
				try {
					s.value = (await i.cleanup(n.cluster, _e, "pipelineruns", f, {
						keep: o.value,
						group: n.object.metadata.name,
						dryRun: !0
					})).deleted;
				} catch (e) {
					d.value = e instanceof Error ? e.message : String(e);
				}
			}
			ae(p), B(o, p);
			async function m() {
				c.value = !0;
				try {
					let { deleted: e } = await i.cleanup(n.cluster, _e, "pipelineruns", f, {
						keep: o.value,
						group: n.object.metadata.name
					});
					a.success(`Deleted ${e.length} finished run(s)`), r("close");
				} catch (e) {
					d.value = e instanceof Error ? e.message : String(e);
				} finally {
					c.value = !1;
				}
			}
			return (t, n) => (P(), T(z(_), {
				show: !0,
				preset: "card",
				title: `Clean up runs of ${e.object.metadata.name}`,
				style: { "max-width": "560px" },
				onClose: n[2] ||= (e) => r("close"),
				onMaskClick: n[3] ||= (e) => r("close")
			}, {
				footer: V(() => [A(z(b), { justify: "end" }, {
					default: V(() => [A(z(u), { onClick: n[1] ||= (e) => r("close") }, {
						default: V(() => [...n[6] ||= [k(" Cancel ", -1)]]),
						_: 1
					}), A(z(u), {
						type: "error",
						disabled: !s.value?.length,
						loading: c.value,
						"data-test": "cleanup-confirm",
						onClick: m
					}, {
						default: V(() => [k(" Delete " + R(s.value?.length ?? 0) + " run(s) ", 1)]),
						_: 1
					}, 8, ["disabled", "loading"])]),
					_: 1
				})]),
				default: V(() => [
					A(z(b), { align: "center" }, {
						default: V(() => [
							n[4] ||= k(" Keep the newest ", -1),
							A(z(ne), {
								value: o.value,
								"onUpdate:value": n[0] ||= (e) => o.value = e,
								min: 0,
								max: 1e3,
								size: "small",
								style: { width: "110px" },
								"data-test": "cleanup-keep"
							}, null, 8, ["value"]),
							n[5] ||= k(" finished runs. Running runs always stay. ", -1)
						]),
						_: 1
					}),
					s.value ? (P(), D("p", vn, [s.value.length ? (P(), D(C, { key: 0 }, [k(R(s.value.length) + " run(s) will be deleted: " + R(s.value.join(", ")), 1)], 64)) : (P(), D(C, { key: 1 }, [k(" Nothing to delete. ")], 64))])) : E("", !0),
					d.value ? (P(), T(z(l), {
						key: 1,
						type: "error"
					}, {
						default: V(() => [k(R(d.value), 1)]),
						_: 1
					})) : E("", !0)
				]),
				_: 1
			}, 8, ["title"]));
		}
	});
})), xn = /* @__PURE__ */ U({ default: () => Sn }), Sn, Cn = H((() => {
	bn(), bn(), Sn = yn;
})), wn, Tn = H((() => {
	Q(), wn = /*@__PURE__*/ j({
		__name: "CancelAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: t }) {
			let n = e, i = t, a = S(), o = F(!1), s = w(() => X(n.object).running);
			async function c() {
				if (!s.value) return i("close"), !0;
				o.value = !0;
				try {
					let e = n.object.metadata;
					await r(n.cluster, "tekton", "cancel", {
						namespace: e.namespace,
						name: e.name,
						uid: e.uid
					}), a.success(`Cancelling ${e.name}`), i("close");
				} catch (e) {
					a.error(e instanceof Error ? e.message : String(e));
				} finally {
					o.value = !1;
				}
				return !1;
			}
			return (t, n) => (P(), T(z(_), {
				show: !0,
				preset: "dialog",
				type: s.value ? "warning" : "info",
				title: s.value ? `Cancel ${e.object.metadata.name}?` : `${e.object.metadata.name} has finished`,
				"positive-text": s.value ? "Cancel run" : "Close",
				"negative-text": s.value ? "Keep running" : void 0,
				loading: o.value,
				"positive-button-props": { "data-test": "confirm" },
				onPositiveClick: c,
				onNegativeClick: n[0] ||= (e) => i("close"),
				onClose: n[1] ||= (e) => i("close"),
				onMaskClick: n[2] ||= (e) => i("close")
			}, {
				default: V(() => [s.value ? (P(), D(C, { key: 0 }, [k(" Running tasks are stopped and the run ends as Cancelled. ")], 64)) : (P(), D(C, { key: 1 }, [k(" It is " + R(z(X)(e.object).text) + "; there is nothing to cancel. ", 1)], 64))]),
				_: 1
			}, 8, [
				"type",
				"title",
				"positive-text",
				"negative-text",
				"loading"
			]));
		}
	});
})), En = /* @__PURE__ */ U({ default: () => Dn }), Dn, On = H((() => {
	Tn(), Tn(), Dn = wn;
})), kn, An, jn = H((() => {
	Q(), kn = { key: 0 }, An = /*@__PURE__*/ j({
		__name: "DeleteAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: t }) {
			let n = e, r = t, a = o(), s = w(() => n.object.kind ?? ""), c = w(() => s.value === "PipelineRun"), d = F(""), f = F(!1), p = F(null), m = F([]);
			ae(async () => {
				if (s.value !== "Task") return;
				let e = n.object.metadata.namespace ?? "", t = await fetch(`/api/clusters/${encodeURIComponent(n.cluster)}/k8s/apis/tekton.dev/v1/namespaces/${encodeURIComponent(e)}/pipelines`, { headers: { Accept: "application/json" } });
				if (!t.ok) return;
				let r = await t.json();
				m.value = r.items.filter((e) => [...e.spec?.tasks ?? [], ...e.spec?.finally ?? []].some((e) => e.taskRef?.name === n.object.metadata.name)).map((e) => e.metadata.name);
			});
			let h = w(() => c.value || d.value === n.object.metadata.name);
			async function g() {
				f.value = !0, p.value = null;
				let e = n.object.metadata;
				try {
					await i.remove(n.cluster, _e, Fe[s.value], e.namespace ?? "", e.name, e.uid), r("close"), await a({
						name: `tekton.${Fe[s.value]}.list`,
						params: { cluster: n.cluster },
						query: { ns: e.namespace ?? "" }
					});
				} catch (e) {
					p.value = e instanceof Error ? e.message : String(e);
				} finally {
					f.value = !1;
				}
			}
			return (t, n) => (P(), T(z(_), {
				show: !0,
				preset: "card",
				title: `Delete ${s.value} ${e.object.metadata.name}?`,
				style: { "max-width": "520px" },
				onClose: n[2] ||= (e) => r("close"),
				onMaskClick: n[3] ||= (e) => r("close")
			}, {
				footer: V(() => [A(z(b), { justify: "end" }, {
					default: V(() => [A(z(u), { onClick: n[1] ||= (e) => r("close") }, {
						default: V(() => [...n[6] ||= [k(" Cancel ", -1)]]),
						_: 1
					}), A(z(u), {
						type: "error",
						disabled: !h.value,
						loading: f.value,
						"data-test": "delete-confirm",
						onClick: g
					}, {
						default: V(() => [...n[7] ||= [k(" Delete ", -1)]]),
						_: 1
					}, 8, ["disabled", "loading"])]),
					_: 1
				})]),
				default: V(() => [c.value ? (P(), D("p", kn, " The run, its TaskRuns and their pods are removed (with their logs). ")) : (P(), D(C, { key: 1 }, [
					m.value.length ? (P(), T(z(l), {
						key: 0,
						type: "warning",
						class: "gap",
						"data-test": "delete-used-by"
					}, {
						default: V(() => [k(" Used by " + R(m.value.join(", ")) + ": their next runs will fail until it exists again. ", 1)]),
						_: 1
					})) : E("", !0),
					O("p", null, [
						n[4] ||= k("Type ", -1),
						O("strong", null, R(e.object.metadata.name), 1),
						n[5] ||= k(" to delete it.", -1)
					]),
					A(z(te), {
						value: d.value,
						"onUpdate:value": n[0] ||= (e) => d.value = e,
						"data-test": "delete-confirm-name"
					}, null, 8, ["value"])
				], 64)), p.value ? (P(), T(z(l), {
					key: 2,
					type: "error",
					class: "gap"
				}, {
					default: V(() => [k(R(p.value), 1)]),
					_: 1
				})) : E("", !0)]),
				_: 1
			}, 8, ["title"]));
		}
	});
})), Mn = H((() => {})), Nn = /* @__PURE__ */ U({ default: () => Pn }), Pn, Fn = H((() => {
	jn(), jn(), Mn(), Ke(), Pn = /*#__PURE__*/ $(An, [["__scopeId", "data-v-3d0b322e"]]);
})), In, Ln, Rn, zn, Bn, Vn, Hn = H((() => {
	Q(), In = { "data-test": "tekton-project-card" }, Ln = { key: 0 }, Rn = { key: 3 }, zn = { class: "muted" }, Bn = { class: "muted" }, Vn = /*@__PURE__*/ j({
		__name: "ProjectRunsCard",
		props: {
			cluster: {},
			project: {}
		},
		setup(e) {
			let t = e, { ResourceLink: n } = Y().components, { items: r, loading: i, error: a } = Y().composables.useLiveList(() => ({
				cluster: t.cluster,
				type: be,
				namespace: t.project.spec.namespace
			}), {
				sort: Oe,
				max: 5
			}), o = F(Date.now()), s = setInterval(() => o.value = Date.now(), 1e3);
			return oe(() => clearInterval(s)), (t, s) => (P(), D("div", In, [z(a) ? (P(), D("span", Ln, R(z(a)), 1)) : z(i) ? (P(), T(z(ie), {
				key: 1,
				size: "small"
			})) : z(r).length ? (P(), D("table", Rn, [(P(!0), D(C, null, I(z(r), (t) => (P(), D("tr", { key: t.metadata.uid }, [
				O("td", null, [(P(), T(ce(z(n)), {
					cluster: e.cluster,
					resource: "tekton.pipelineruns",
					namespace: t.metadata.namespace,
					name: t.metadata.name
				}, null, 8, [
					"cluster",
					"namespace",
					"name"
				]))]),
				O("td", zn, R(z(he)(t)), 1),
				O("td", null, [(P(), T(ce(z(ge)(t))))]),
				O("td", Bn, R(z(Z)(t, o.value)), 1)
			]))), 128))])) : (P(), T(z(m), {
				key: 2,
				size: "small",
				description: "No pipeline runs in this Project yet."
			}))]));
		}
	});
})), Un = H((() => {})), Wn = /* @__PURE__ */ U({ default: () => Gn }), Gn, Kn = H((() => {
	Hn(), Hn(), Un(), Ke(), Gn = /*#__PURE__*/ $(Vn, [["__scopeId", "data-v-0c4eea02"]]);
}));
//#endregion
//#region src/index.ts
Q();
var qn = (e, t) => fe(e.metadata.namespace, t.cluster), Jn = n({
	name: "tekton",
	apiVersion: e,
	minApi: "1.2",
	register(e) {
		ue(e), de(), e.register({
			type: "nav-section",
			id: "tekton.section",
			label: "Pipelines",
			order: 45
		}), e.registerResource(je, {
			order: 10,
			section: "tekton.section"
		}), e.registerResource(Me, {
			order: 20,
			section: "tekton.section"
		}), e.registerResource(Ne, {
			order: 30,
			section: "tekton.section"
		}), e.registerResource(Pe, {
			order: 40,
			section: "tekton.section"
		});
		let t = () => Promise.resolve().then(() => (Ye(), qe));
		e.register({
			type: "route",
			id: "tekton.tasks.new",
			path: "tekton/tasks/new",
			scope: "cluster",
			title: "Create Task",
			parent: "tekton.tasks.list",
			props: { object: "tasks" },
			component: t
		}), e.register({
			type: "route",
			id: "tekton.pipelines.new",
			path: "tekton/pipelines/new",
			scope: "cluster",
			title: "Create Pipeline",
			parent: "tekton.pipelines.list",
			props: { object: "pipelines" },
			component: t
		}), e.register({
			type: "route",
			id: "tekton.tasks.edit",
			path: "tekton/tasks/:namespace/:name/edit",
			scope: "cluster",
			title: "Edit Task",
			parent: "tekton.tasks.list",
			props: { object: "tasks" },
			component: t
		}), e.register({
			type: "route",
			id: "tekton.pipelines.edit",
			path: "tekton/pipelines/:namespace/:name/edit",
			scope: "cluster",
			title: "Edit Pipeline",
			parent: "tekton.pipelines.list",
			props: { object: "pipelines" },
			component: t
		}), e.register({
			type: "route",
			id: "tekton.pipelines.start",
			path: "tekton/pipelines/:namespace/:name/start",
			scope: "cluster",
			title: "Start run",
			parent: "tekton.pipelines.list",
			component: () => Promise.resolve().then(() => (st(), at))
		}), e.register({
			type: "resource-detail-tab",
			id: "tekton.tab.graph",
			label: "Graph",
			order: 12,
			kinds: ["Pipeline", "PipelineRun"],
			component: () => Promise.resolve().then(() => (Mt(), At))
		}), e.register({
			type: "resource-detail-tab",
			id: "tekton.tab.tasks",
			label: "Tasks",
			order: 15,
			kinds: ["PipelineRun"],
			component: () => Promise.resolve().then(() => (Kt(), Wt))
		}), e.register({
			type: "resource-detail-tab",
			id: "tekton.tab.logs",
			label: "Logs",
			order: 40,
			kinds: ["TaskRun"],
			component: () => Promise.resolve().then(() => (Qt(), Xt))
		}), e.register({
			type: "resource-action",
			id: "tekton.action.start",
			label: "Start run",
			order: 5,
			kinds: ["Pipeline"],
			appliesTo: qn,
			component: () => Promise.resolve().then(() => (rn(), tn))
		}), e.register({
			type: "resource-action",
			id: "tekton.action.edit",
			label: "Edit",
			order: 10,
			kinds: ["Task", "Pipeline"],
			appliesTo: qn,
			component: () => Promise.resolve().then(() => (ln(), sn))
		}), e.register({
			type: "resource-action",
			id: "tekton.action.rerun",
			label: "Rerun",
			order: 15,
			kinds: ["PipelineRun"],
			appliesTo: qn,
			component: () => Promise.resolve().then(() => (_n(), hn))
		}), e.register({
			type: "resource-action",
			id: "tekton.action.cleanup",
			label: "Clean up runs",
			order: 30,
			kinds: ["Pipeline"],
			appliesTo: qn,
			component: () => Promise.resolve().then(() => (Cn(), xn))
		}), e.register({
			type: "resource-action",
			id: "tekton.action.cancel",
			label: "Cancel run",
			order: 16,
			danger: !0,
			kinds: ["PipelineRun"],
			appliesTo: qn,
			component: () => Promise.resolve().then(() => (On(), En))
		}), e.register({
			type: "resource-action",
			id: "tekton.action.delete",
			label: "Delete",
			order: 90,
			danger: !0,
			kinds: [
				"Task",
				"Pipeline",
				"PipelineRun"
			],
			appliesTo: qn,
			component: () => Promise.resolve().then(() => (Fn(), Nn))
		}), e.register({
			type: "project-overview-card",
			id: "tekton.card.runs",
			title: "Pipeline runs",
			order: 30,
			component: () => Promise.resolve().then(() => (Kn(), Wn))
		});
	}
});
//#endregion
export { Jn as default };
