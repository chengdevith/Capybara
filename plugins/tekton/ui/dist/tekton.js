if(typeof document!=='undefined'){const s=document.createElement('style');s.dataset.plugin="tekton";s.textContent=".title[data-v-e2addc7d]{margin:0 0 16px}.toolbar[data-v-e2addc7d]{margin-bottom:12px}.select[data-v-e2addc7d]{width:240px}.gap[data-v-e2addc7d]{margin-top:12px}.title[data-v-f6850e40]{margin:0 0 16px}.toolbar[data-v-f6850e40]{margin-bottom:12px}.select[data-v-f6850e40]{width:240px}.spacer[data-v-f6850e40]{flex:1}.gap[data-v-f6850e40]{margin-top:12px}.muted[data-v-f6850e40]{opacity:.7;font-size:12px}h4[data-v-f6850e40]{margin:4px 0 8px}.scroll[data-v-774e814d]{padding:4px 0 12px;overflow-x:auto}.node rect[data-v-774e814d]{fill:var(--n-color,transparent);stroke-width:2px}.node.clickable[data-v-774e814d]{cursor:pointer}.node.chosen rect[data-v-774e814d]{stroke-width:3px}.name[data-v-774e814d]{fill:currentColor;font-size:13px;font-weight:600}.state[data-v-774e814d]{fill:currentColor;opacity:.7;font-size:11px}.edge[data-v-774e814d]{fill:none;stroke:currentColor;opacity:.45;stroke-width:1.5px}.arrow[data-v-774e814d]{fill:currentColor;opacity:.6}h4[data-v-774e814d]{margin:8px 0}.gap[data-v-7107da21]{margin-bottom:12px}h4[data-v-e2c1216c]{margin:4px 0 8px}h4+*+h4[data-v-e2c1216c],h4[data-v-e2c1216c]:not(:first-child){margin-top:16px}.pull[data-v-7a8b8553]{margin-bottom:12px}.reason[data-v-7a8b8553]{opacity:.7;margin-left:6px;font-size:12px}.hint[data-v-7a8b8553]{opacity:.85;margin-top:6px;font-size:12px}.cancel[data-v-7a8b8553]{margin-top:8px}.cmd[data-v-7a8b8553]{margin-top:4px;display:block}.gap[data-v-5ebe946e]{margin-bottom:12px}.split[data-v-5ebe946e]{grid-template-columns:minmax(180px,260px) 1fr;align-items:start;gap:16px;display:grid}@media (width<=900px){.split[data-v-5ebe946e]{grid-template-columns:1fr}}.tasks[data-v-5ebe946e]{border:1px solid var(--capy-border);border-radius:6px;margin:0;padding:0;list-style:none}.tasks li[data-v-5ebe946e]{cursor:pointer;border-bottom:1px solid var(--capy-border);grid-template-rows:auto auto;grid-template-columns:10px 1fr auto;column-gap:8px;padding:8px 10px;display:grid}.tasks li[data-v-5ebe946e]:last-child{border-bottom:none}.tasks li.chosen[data-v-5ebe946e]{background:#c39b6e26}.dot[data-v-5ebe946e]{border-radius:50%;grid-area:1/1/3;width:10px;height:10px;margin-top:5px}.name[data-v-5ebe946e]{text-overflow:ellipsis;white-space:nowrap;grid-area:1/2;font-weight:600;overflow:hidden}.time[data-v-5ebe946e]{opacity:.7;white-space:nowrap;grid-area:1/3;font-size:12px}.state[data-v-5ebe946e]{opacity:.75;grid-area:2/2/auto/4;font-size:12px}.logs[data-v-5ebe946e]{min-width:0}.start-new[data-v-db36ac4d]{margin-top:8px}.gap[data-v-d99fe515]{margin-bottom:12px}table[data-v-0c4eea02]{border-collapse:collapse;width:100%}td[data-v-0c4eea02]{white-space:nowrap;padding:4px 8px 4px 0}td[data-v-0c4eea02]:first-child{text-overflow:ellipsis;max-width:220px;overflow:hidden}.muted[data-v-0c4eea02]{opacity:.7;font-size:12px}\n/*$vite$:1*/";document.head.appendChild(s)}
import { EXTENSION_API_VERSION as e, PluginRequestError as t, definePlugin as n, pluginAction as r, pluginObjects as i, useCluster as a, useNavigate as o, useParams as s, useQuery as c } from "@capybara/sdk";
import { NAlert as l, NButton as u, NCard as d, NDataTable as f, NDynamicTags as p, NEmpty as m, NForm as h, NFormItem as g, NH2 as ee, NInput as te, NInputNumber as ne, NModal as _, NRadioButton as v, NRadioGroup as y, NSelect as re, NSpace as b, NSpin as ie, NSwitch as ae, NTag as x, useMessage as S } from "naive-ui";
import { Fragment as C, computed as w, createBlock as T, createCommentVNode as E, createElementBlock as D, createElementVNode as O, createTextVNode as k, createVNode as A, defineComponent as j, h as M, normalizeClass as N, normalizeStyle as oe, onMounted as se, onScopeDispose as ce, openBlock as P, reactive as le, ref as F, renderList as I, resolveDynamicComponent as ue, shallowRef as de, toDisplayString as L, unref as R, watch as fe, withCtx as z } from "vue";
//#region \0rolldown/runtime.js
var B = Object.defineProperty, V = (e, t, n) => () => {
	if (n) throw n[0];
	try {
		return e && (t = e(e = 0)), t;
	} catch (e) {
		throw n = [e], e;
	}
}, H = (e, t) => {
	let n = {};
	for (var r in e) B(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || B(n, Symbol.toStringTag, { value: "Module" }), n;
};
//#endregion
//#region src/pulls.ts
function U(e) {
	let t = e.status ?? {}, n = t.taskSpec?.steps ?? [], r = t.taskSpec?.sidecars ?? [], i = [], a = (e, t) => {
		for (let n of e ?? []) {
			let e = n.waiting?.reason ?? "";
			if (!pe.has(e)) continue;
			let r = t.find((e) => e.name === n.name)?.image ?? W(n.waiting?.message) ?? "(unknown image)";
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
function W(e) {
	return e ? /image "([^"]+)"/.exec(e)?.[1] : void 0;
}
function G(e, t) {
	return e.reason === "InvalidImageName" ? `"${e.image}" is not a valid image name.` : `Image ${e.image} is not on ${t}, and the cluster could not pull it.`;
}
var pe, me = V((() => {
	pe = /* @__PURE__ */ new Set([
		"ErrImagePull",
		"ImagePullBackOff",
		"ErrImageNeverPull",
		"InvalidImageName"
	]);
}));
//#endregion
//#region src/tekton.ts
function he(e) {
	xe = e;
}
function K() {
	if (!xe) throw Error("tekton plugin is not registered");
	return xe;
}
function ge(e = !1) {
	return De && !e && Date.now() - Oe < 6e4 ? De : (Oe = Date.now(), De = (async () => {
		try {
			let e = await fetch("/api/projects", { headers: { Accept: "application/json" } });
			if (!e.ok) return;
			let t = await e.json(), n = Array.isArray(t) ? t : t.items ?? [];
			Ee.value = new Set(n.filter((e) => e.status?.phase === "Ready").map((e) => `${e.spec.cluster}/${e.spec.namespace}`));
		} catch {}
	})(), De);
}
function _e(e, t) {
	return ge(), !!e && !!Ee.value?.has(`${t}/${e}`);
}
function ve(e) {
	return ge(), [...Ee.value ?? []].filter((t) => t.startsWith(`${e}/`)).map((t) => t.slice(e.length + 1)).sort();
}
function q(e) {
	let t = (e.status?.conditions ?? []).find((e) => e.type === "Succeeded");
	if (t?.status !== "True" && t?.status !== "False" && U(e).length > 0) return {
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
function ye(e) {
	return (e.status?.conditions ?? []).find((e) => e.type === "Succeeded")?.message ?? "";
}
function J(e, t) {
	let n = Date.parse(e.status?.startTime ?? "");
	if (!n) return "—";
	let r = Date.parse(e.status?.completionTime ?? "") || t, i = Math.max(0, Math.round((r - n) / 1e3));
	if (i < 60) return `${i}s`;
	let a = Math.floor(i / 60);
	return a < 60 ? `${a}m ${String(i % 60).padStart(2, "0")}s` : `${Math.floor(a / 60)}h ${String(a % 60).padStart(2, "0")}m`;
}
function be(e) {
	return e.spec?.pipelineRef?.name ?? (e.spec?.pipelineSpec ? "(inline)" : "—");
}
function Y(e) {
	let t = q(e);
	return M(x, {
		size: "small",
		type: t.tone,
		bordered: !1,
		"data-test": "run-status"
	}, () => t.text);
}
var X, xe, Z, Se, Ce, we, Te, Ee, De, Oe, ke, Ae, je, Me, Ne, Pe, Fe, Ie, Le, Re, Q = V((() => {
	me(), X = "tekton", xe = null, Z = (e, t) => ({
		group: "tekton.dev",
		version: "v1",
		plural: e,
		kind: t,
		namespaced: !0
	}), Se = Z("pipelineruns", "PipelineRun"), Ce = Z("taskruns", "TaskRun"), we = Z("pipelines", "Pipeline"), Te = Z("tasks", "Task"), Ee = de(null), De = null, Oe = 0, ke = (e) => Date.parse(e.status?.startTime ?? "") || Date.parse(e.metadata.creationTimestamp) || 0, Ae = (e, t) => ke(t) - ke(e), je = (e, t, n) => n ? M(K().components.ResourceLink, {
		resource: e,
		namespace: t.metadata.namespace,
		name: n
	}) : "—", Me = (e, t) => t ? _e(t, e) : ve(e).length > 0, Ne = "Capybara's account on this cluster lacks the Pipelines console permissions: reinstall or reconnect the plugin.", Pe = {
		id: "tekton.pipelineruns",
		type: Se,
		label: "PipelineRuns",
		singular: "PipelineRun",
		path: "tekton/pipelineruns",
		create: {
			label: "Create PipelineRun",
			route: "tekton.pipelineruns.new",
			when: Me
		},
		columns: [
			{
				key: "status",
				title: "Status",
				width: 140,
				ellipsis: !1,
				render: Y,
				sortValue: (e) => q(e).text
			},
			{
				key: "pipeline",
				title: "Pipeline",
				minWidth: 140,
				render: (e) => e.spec?.pipelineRef?.name ? je("tekton.pipelines", e, e.spec.pipelineRef.name) : be(e),
				sortValue: be
			},
			{
				key: "started",
				title: "Started",
				width: 180,
				render: (e) => e.status?.startTime ? new Date(e.status.startTime).toLocaleString() : "—",
				sortValue: ke
			},
			{
				key: "duration",
				title: "Duration",
				width: 100,
				render: (e, t) => J(e, t)
			}
		],
		status: (e) => q(e),
		overview: [
			{
				label: "Pipeline",
				render: (e) => e.spec?.pipelineRef?.name ? je("tekton.pipelines", e, e.spec.pipelineRef.name) : be(e)
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
				render: (e) => J(e, Date.now())
			},
			{
				label: "Message",
				render: (e) => ye(e) || "—"
			},
			{
				label: "Rerun of",
				render: (e) => je("tekton.pipelineruns", e, e.metadata.annotations?.["platform.capybara.io/copy-of"])
			}
		],
		forbiddenHint: Ne
	}, Fe = {
		id: "tekton.taskruns",
		type: Ce,
		label: "TaskRuns",
		singular: "TaskRun",
		path: "tekton/taskruns",
		create: {
			label: "Create TaskRun",
			route: "tekton.taskruns.new",
			when: Me
		},
		columns: [
			{
				key: "status",
				title: "Status",
				width: 140,
				ellipsis: !1,
				render: Y,
				sortValue: (e) => q(e).text
			},
			{
				key: "pipelinerun",
				title: "PipelineRun",
				minWidth: 160,
				render: (e) => je("tekton.pipelineruns", e, e.metadata.labels?.["tekton.dev/pipelineRun"])
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
				render: (e, t) => J(e, t)
			}
		],
		status: (e) => q(e),
		overview: [
			{
				label: "PipelineRun",
				render: (e) => je("tekton.pipelineruns", e, e.metadata.labels?.["tekton.dev/pipelineRun"])
			},
			{
				label: "Pod",
				render: (e) => je("core.pods", e, e.status?.podName)
			},
			{
				label: "Duration",
				render: (e) => J(e, Date.now())
			},
			{
				label: "Message",
				render: (e) => ye(e) || "—"
			}
		],
		forbiddenHint: Ne
	}, Ie = {
		id: "tekton.pipelines",
		type: we,
		label: "Pipelines",
		singular: "Pipeline",
		path: "tekton/pipelines",
		create: {
			label: "Create Pipeline",
			route: "tekton.pipelines.new",
			when: Me
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
		forbiddenHint: Ne
	}, Le = {
		id: "tekton.tasks",
		type: Te,
		label: "Tasks",
		singular: "Task",
		path: "tekton/tasks",
		create: {
			label: "Create Task",
			route: "tekton.tasks.new",
			when: Me
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
		forbiddenHint: Ne
	}, Re = {
		Task: "tasks",
		Pipeline: "pipelines",
		PipelineRun: "pipelineruns",
		TaskRun: "taskruns"
	};
})), ze, Be, Ve = V((() => {
	ze = [{
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
	}], Be = [{
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
})), He, Ue, We, Ge, Ke, qe = V((() => {
	Ve(), Q(), He = { "data-test": "tekton-editor" }, Ue = { key: 1 }, We = { key: 0 }, Ge = { key: 0 }, Ke = /*@__PURE__*/ j({
		__name: "EditorPage",
		props: { object: {} },
		setup(e) {
			let n = e, { YamlEditor: r, YamlDiff: f, ResourceLink: p } = K().components, m = K().yaml, h = a(), g = s(), te = c(), ne = o(), _ = w(() => n.object === "tasks" ? "Task" : "Pipeline"), v = w(() => !!g.value.name), y = F(g.value.namespace ?? te.value.ns ?? ""), ae = w(() => h.value ? ve(h.value) : []), x = w(() => _e(y.value, h.value)), S = w(() => n.object === "tasks" ? ze : Be), j = F(S.value[0].id), M = F(""), N = F(""), oe = de(null), ce = F(!1), le = F(null), B = F([]), V = F([]), H = F(null), U = F(!1), W = F(!1), G = F(!1);
			function pe() {
				let e = S.value.find((e) => e.id === j.value);
				e && (M.value = e.yaml(n.object === "tasks" ? "say" : "my-pipeline"));
			}
			se(async () => {
				if (ge(!0), !v.value) {
					!y.value && ae.value.length && (y.value = ae.value[0]), pe();
					return;
				}
				ce.value = !0;
				try {
					let e = `/api/clusters/${encodeURIComponent(h.value ?? "")}/k8s/apis/tekton.dev/v1/namespaces/${encodeURIComponent(y.value)}/${n.object}/${encodeURIComponent(g.value.name)}`, t = await fetch(e, { headers: { Accept: "application/json" } });
					if (!t.ok) throw Error(`${_.value} ${g.value.name} could not be loaded (${t.status})`);
					let r = await t.json();
					oe.value = {
						uid: r.metadata.uid,
						resourceVersion: r.metadata.resourceVersion
					}, N.value = M.value = m.editable(r);
				} catch (e) {
					le.value = e instanceof Error ? e.message : String(e);
				} finally {
					ce.value = !1;
				}
			}), fe(ae, (e) => {
				!v.value && !y.value && e.length && (y.value = e[0]);
			}), fe(M, () => {
				W.value = !1, G.value = !1;
			});
			function me() {
				try {
					return H.value = null, m.parse(M.value);
				} catch (e) {
					return H.value = e instanceof Error ? e.message : String(e), B.value = [], null;
				}
			}
			function he(e) {
				e instanceof t ? (H.value = e.message, B.value = e.problems, V.value = e.warnings) : H.value = e instanceof Error ? e.message : String(e);
			}
			async function q() {
				let e = me();
				if (!e || !h.value) return !1;
				U.value = !0;
				try {
					let t = await i.validate(h.value, X, n.object, y.value, e, g.value.name);
					return B.value = t.problems, V.value = t.warnings, W.value = t.problems.length === 0, W.value;
				} catch (e) {
					return he(e), !1;
				} finally {
					U.value = !1;
				}
			}
			async function ye() {
				let e = me();
				if (e && h.value) {
					U.value = !0;
					try {
						let t = (v.value ? await i.update(h.value, X, n.object, y.value, g.value.name, e, oe.value) : await i.create(h.value, X, n.object, y.value, e)).object.metadata.name;
						await ne({
							name: `tekton.${n.object}.detail`,
							params: {
								cluster: h.value,
								namespace: y.value,
								name: t
							}
						});
					} catch (e) {
						he(e);
					} finally {
						U.value = !1;
					}
				}
			}
			async function J() {
				if (v.value && !G.value) {
					await q() && (G.value = !0);
					return;
				}
				(W.value || await q()) && await ye();
			}
			return (t, n) => (P(), D("div", He, [A(R(ee), { class: "title" }, {
				default: z(() => [k(L(v.value ? `Edit ${_.value} ${R(g).name}` : `Create ${_.value}`), 1)]),
				_: 1
			}), ce.value ? (P(), T(R(ie), { key: 0 })) : le.value ? (P(), T(R(l), {
				key: 1,
				type: "error"
			}, {
				default: z(() => [k(L(le.value), 1)]),
				_: 1
			})) : (P(), T(R(d), {
				key: 2,
				size: "small"
			}, {
				default: z(() => [
					A(R(b), {
						align: "center",
						class: "toolbar"
					}, {
						default: z(() => [
							n[5] ||= O("span", null, "Namespace", -1),
							v.value ? (P(), D("strong", Ue, L(y.value), 1)) : (P(), T(R(re), {
								key: 0,
								value: y.value,
								"onUpdate:value": n[0] ||= (e) => y.value = e,
								options: ae.value.map((e) => ({
									label: e,
									value: e
								})),
								placeholder: "A Project namespace",
								size: "small",
								class: "select",
								"data-test": "editor-namespace"
							}, null, 8, ["value", "options"])),
							v.value ? E("", !0) : (P(), D(C, { key: 2 }, [n[4] ||= O("span", null, "Template", -1), A(R(re), {
								value: j.value,
								"onUpdate:value": [n[1] ||= (e) => j.value = e, pe],
								options: S.value.map((e) => ({
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
					!ae.value.length && !v.value ? (P(), T(R(l), {
						key: 0,
						type: "info",
						class: "gap",
						"data-test": "editor-no-projects"
					}, {
						default: z(() => [...n[6] ||= [k(" Tasks and Pipelines can be created only in Project namespaces, and this cluster has no Projects yet. ", -1)]]),
						_: 1
					})) : y.value && !x.value ? (P(), T(R(l), {
						key: 1,
						type: "warning",
						class: "gap"
					}, {
						default: z(() => [k(L(y.value) + " is not a Project namespace: Tasks and Pipelines can be written only in Projects. ", 1)]),
						_: 1
					})) : E("", !0),
					G.value ? (P(), T(ue(R(f)), {
						key: 2,
						original: N.value,
						modified: M.value,
						"data-test": "editor-diff"
					}, null, 8, ["original", "modified"])) : (P(), T(ue(R(r)), {
						key: 3,
						value: M.value,
						"onUpdate:value": n[2] ||= (e) => M.value = e,
						problems: B.value,
						height: "55vh"
					}, null, 40, ["value", "problems"])),
					H.value || B.value.length ? (P(), T(R(l), {
						key: 4,
						type: "error",
						class: "gap",
						"data-test": "editor-error"
					}, {
						default: z(() => [k(L(H.value ?? "It does not meet the rules for this Project:") + " ", 1), B.value.length ? (P(), D("ul", We, [(P(!0), D(C, null, I(B.value, (e) => (P(), D("li", {
							key: e.path + e.message,
							"data-test": "editor-problem"
						}, [e.path ? (P(), D("code", Ge, L(e.path), 1)) : E("", !0), k(" " + L(e.message), 1)]))), 128))])) : E("", !0)]),
						_: 1
					})) : W.value && !G.value ? (P(), T(R(l), {
						key: 5,
						type: "success",
						class: "gap",
						"data-test": "editor-valid"
					}, {
						default: z(() => [...n[7] ||= [k(" It meets the rules for this Project and the cluster accepts it. ", -1)]]),
						_: 1
					})) : E("", !0),
					V.value.length ? (P(), T(R(l), {
						key: 6,
						type: "warning",
						class: "gap",
						"data-test": "editor-warnings"
					}, {
						default: z(() => [(P(!0), D(C, null, I(V.value, (e) => (P(), D("div", { key: e }, L(e), 1))), 128))]),
						_: 1
					})) : E("", !0),
					A(R(b), {
						justify: "end",
						class: "gap"
					}, {
						default: z(() => [
							v.value ? (P(), T(ue(R(p)), {
								key: 0,
								resource: `tekton.${e.object}`,
								namespace: y.value,
								name: R(g).name
							}, {
								default: z(() => [...n[8] ||= [k(" Cancel ", -1)]]),
								_: 1
							}, 8, [
								"resource",
								"namespace",
								"name"
							])) : E("", !0),
							G.value ? (P(), T(R(u), {
								key: 1,
								onClick: n[3] ||= (e) => G.value = !1
							}, {
								default: z(() => [...n[9] ||= [k(" Back to the editor ", -1)]]),
								_: 1
							})) : (P(), T(R(u), {
								key: 2,
								loading: U.value,
								disabled: !x.value,
								"data-test": "editor-validate",
								onClick: q
							}, {
								default: z(() => [...n[10] ||= [k(" Validate ", -1)]]),
								_: 1
							}, 8, ["loading", "disabled"])),
							A(R(u), {
								type: "primary",
								loading: U.value,
								disabled: !x.value,
								"data-test": "editor-save",
								onClick: J
							}, {
								default: z(() => [k(L(v.value ? G.value ? "Save" : "Review changes" : `Create ${_.value}`), 1)]),
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
})), Je = V((() => {})), $, Ye = V((() => {
	$ = (e, t) => {
		let n = e.__vccOpts || e;
		for (let [e, r] of t) n[e] = r;
		return n;
	};
})), Xe = /* @__PURE__ */ H({ default: () => Ze }), Ze, Qe = V((() => {
	qe(), qe(), Je(), Ye(), Ze = /*#__PURE__*/ $(Ke, [["__scopeId", "data-v-e2addc7d"]]);
})), $e, et, tt, nt, rt, it, at, ot = V((() => {
	Q(), $e = { "data-test": "tekton-run-form" }, et = { key: 0 }, tt = { key: 1 }, nt = {
		key: 0,
		class: "muted"
	}, rt = { key: 0 }, it = { key: 0 }, at = /*@__PURE__*/ j({
		__name: "RunForm",
		props: { kind: {} },
		setup(e) {
			let n = e, { YamlEditor: r } = K().components, s = K().yaml, f = a(), m = c(), _ = o(), x = w(() => n.kind === "pipelineruns"), S = w(() => x.value ? "Pipeline" : "Task"), j = w(() => x.value ? "pipelines" : "tasks"), M = w(() => x.value ? "PipelineRun" : "TaskRun"), N = F(m.value.ns ?? ""), oe = w(() => f.value ? ve(f.value) : []), ce = w(() => _e(N.value, f.value)), de = F([]), B = F(m.value.pipeline ?? m.value.task ?? null), V = F(!1), H = F([]), U = F([]), W = le({}), G = le({}), pe = F([]), me = F(null), he = F(null), q = F(!1), ye = F(""), J = F(!1), be = F(null), Y = F([]), xe = F([]), Z = (e) => `/api/clusters/${encodeURIComponent(f.value ?? "")}/k8s/${e}`;
			async function Se(e) {
				let t = await fetch(e, { headers: { Accept: "application/json" } });
				return t.ok ? await t.json() : null;
			}
			let Ce = (e) => `namespaces/${encodeURIComponent(e)}`;
			se(() => {
				ge(!0), !N.value && oe.value.length && (N.value = oe.value[0]);
			}), fe(oe, (e) => {
				!N.value && e.length && (N.value = e[0]);
			}), fe(N, async (e) => {
				if (de.value = [], pe.value = [], me.value = null, !e || !f.value) return;
				let t = await Se(Z(`apis/tekton.dev/v1/${Ce(e)}/${j.value}`));
				de.value = (t?.items ?? []).map((e) => e.metadata.name).sort(), B.value && !de.value.includes(B.value) && (B.value = null);
				let n = await Se(Z(`api/v1/${Ce(e)}/configmaps`));
				pe.value = (n?.items ?? []).map((e) => e.metadata.name).filter((e) => e !== "kube-root-ca.crt").sort();
				let r = (await Se(Z(`api/v1/${Ce(e)}/resourcequotas`)))?.items.find((e) => e.status?.hard?.["requests.storage"]);
				r && (me.value = `${r.status.used?.["requests.storage"] ?? "0"} of ${r.status.hard["requests.storage"]} used`);
			}, { immediate: !0 }), fe([B, N], async ([e, t]) => {
				if (H.value = [], U.value = [], e && t) {
					V.value = !0;
					try {
						let r = await Se(Z(`apis/tekton.dev/v1/${Ce(t)}/${j.value}/${encodeURIComponent(e)}`)), i = {};
						m.value.from && (i = (await Se(Z(`apis/tekton.dev/v1/${Ce(t)}/${n.kind}/${encodeURIComponent(m.value.from)}`)))?.spec ?? {});
						let a = Object.fromEntries((i.params ?? []).map((e) => [e.name, e.value]));
						H.value = r?.spec?.params ?? [], U.value = r?.spec?.workspaces ?? [];
						for (let e of Object.keys(W)) delete W[e];
						for (let e of H.value) {
							let t = a[e.name] ?? e.default;
							W[e.name] = e.type === "array" ? t ?? [] : t === void 0 ? "" : typeof t == "string" ? t : JSON.stringify(t);
						}
						for (let e of Object.keys(G)) delete G[e];
						for (let e of U.value) G[e.name] = {
							kind: e.optional ? "none" : "emptyDir",
							sizeGi: 1,
							configMap: ""
						};
					} finally {
						V.value = !1;
					}
				}
			}, { immediate: !0 });
			let we = w(() => H.value.filter((e) => e.default === void 0).filter((e) => {
				let t = W[e.name];
				return t === "" || t === void 0 || Array.isArray(t) && !t.length;
			}).map((e) => e.name));
			function Te() {
				let e = H.value.map((e) => {
					let t = W[e.name];
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
				}), t = Object.entries(G).filter(([, e]) => e.kind !== "none" && e.kind !== "secret").map(([e, t]) => t.kind === "emptyDir" ? {
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
				}), n = B.value ?? (x.value ? "my-pipeline" : "my-task"), r = x.value ? { pipelineRef: { name: n } } : { taskRef: { name: n } };
				if (e.length && (r.params = e), t.length && (r.workspaces = t), he.value) {
					let e = `${he.value}m`;
					x.value ? r.timeouts = { pipeline: e } : r.timeout = e;
				}
				return {
					apiVersion: "tekton.dev/v1",
					kind: M.value,
					metadata: { generateName: `${n.slice(0, 50)}-` },
					spec: r
				};
			}
			fe(q, (e) => {
				e && (ye.value = s.stringify(Te()));
			});
			async function Ee() {
				if (f.value) {
					J.value = !0, be.value = null, Y.value = [], xe.value = [];
					try {
						let e = q.value ? s.parse(ye.value) : Te(), t = (await i.create(f.value, X, n.kind, N.value, e)).object.metadata.name;
						await _({
							name: `tekton.${n.kind}.detail`,
							params: {
								cluster: f.value,
								namespace: N.value,
								name: t
							}
						});
					} catch (e) {
						e instanceof t ? (be.value = e.message, Y.value = e.problems, xe.value = e.warnings) : be.value = e instanceof Error ? e.message : String(e);
					} finally {
						J.value = !1;
					}
				}
			}
			return (e, t) => (P(), D("div", $e, [A(R(ee), { class: "title" }, {
				default: z(() => [k(" Create " + L(M.value), 1)]),
				_: 1
			}), A(R(d), { size: "small" }, {
				default: z(() => [oe.value.length ? (P(), D(C, { key: 1 }, [
					A(R(b), {
						align: "center",
						class: "toolbar"
					}, {
						default: z(() => [
							t[6] ||= O("span", null, "Namespace", -1),
							A(R(re), {
								value: N.value,
								"onUpdate:value": t[0] ||= (e) => N.value = e,
								options: oe.value.map((e) => ({
									label: e,
									value: e
								})),
								size: "small",
								class: "select",
								"data-test": "run-form-namespace"
							}, null, 8, ["value", "options"]),
							O("span", null, L(S.value), 1),
							A(R(re), {
								value: B.value,
								"onUpdate:value": t[1] ||= (e) => B.value = e,
								options: de.value.map((e) => ({
									label: e,
									value: e
								})),
								placeholder: `Choose a ${S.value}`,
								size: "small",
								class: "select",
								filterable: "",
								"data-test": "run-form-source"
							}, null, 8, [
								"value",
								"options",
								"placeholder"
							]),
							t[7] ||= O("span", { class: "spacer" }, null, -1),
							t[8] ||= O("span", null, "YAML view", -1),
							A(R(ae), {
								value: q.value,
								"onUpdate:value": t[2] ||= (e) => q.value = e,
								"data-test": "run-form-yaml"
							}, null, 8, ["value"])
						]),
						_: 1
					}),
					N.value && !ce.value ? (P(), T(R(l), {
						key: 0,
						type: "warning",
						class: "gap"
					}, {
						default: z(() => [k(L(N.value) + " is not a Project namespace: runs can be created only in Projects. ", 1)]),
						_: 1
					})) : E("", !0),
					q.value ? (P(), D(C, { key: 1 }, [(P(), T(ue(R(r)), {
						value: ye.value,
						"onUpdate:value": t[3] ||= (e) => ye.value = e,
						problems: Y.value,
						height: "50vh"
					}, null, 40, ["value", "problems"])), t[9] ||= O("div", { class: "muted gap" }, [
						k(" The run uses the Project's "),
						O("code", null, "pipeline"),
						k(" ServiceAccount (filled in by Capybara if left out). ")
					], -1)], 64)) : V.value ? (P(), T(R(ie), { key: 2 })) : B.value ? (P(), T(R(h), {
						key: 3,
						"label-placement": "top"
					}, {
						default: z(() => [
							H.value.length ? (P(), D("h4", et, " Parameters ")) : E("", !0),
							(P(!0), D(C, null, I(H.value, (e) => (P(), T(R(g), {
								key: e.name,
								label: e.name + (e.default === void 0 ? " (required)" : ""),
								feedback: e.description
							}, {
								default: z(() => [e.type === "array" ? (P(), T(R(p), {
									key: 0,
									value: W[e.name],
									"onUpdate:value": (t) => W[e.name] = t,
									"data-test": `param-${e.name}`
								}, null, 8, [
									"value",
									"onUpdate:value",
									"data-test"
								])) : (P(), T(R(te), {
									key: 1,
									value: W[e.name],
									"onUpdate:value": (t) => W[e.name] = t,
									type: e.type === "object" ? "textarea" : "text",
									"data-test": `param-${e.name}`
								}, null, 8, [
									"value",
									"onUpdate:value",
									"type",
									"data-test"
								]))]),
								_: 2
							}, 1032, ["label", "feedback"]))), 128)),
							U.value.length ? (P(), D("h4", tt, " Workspaces ")) : E("", !0),
							(P(!0), D(C, null, I(U.value, (e) => (P(), T(R(g), {
								key: e.name,
								label: e.name + (e.optional ? " (optional)" : ""),
								feedback: e.description
							}, {
								default: z(() => [A(R(b), {
									vertical: "",
									"data-test": `workspace-${e.name}`
								}, {
									default: z(() => [
										A(R(y), {
											value: G[e.name].kind,
											"onUpdate:value": (t) => G[e.name].kind = t,
											size: "small"
										}, {
											default: z(() => [
												e.optional ? (P(), T(R(v), {
													key: 0,
													value: "none"
												}, {
													default: z(() => [...t[10] ||= [k(" None ", -1)]]),
													_: 1
												})) : E("", !0),
												A(R(v), { value: "emptyDir" }, {
													default: z(() => [...t[11] ||= [k(" Empty directory ", -1)]]),
													_: 1
												}),
												A(R(v), { value: "volumeClaimTemplate" }, {
													default: z(() => [...t[12] ||= [k(" New volume ", -1)]]),
													_: 1
												}),
												A(R(v), {
													value: "configMap",
													disabled: !pe.value.length
												}, {
													default: z(() => [...t[13] ||= [k(" ConfigMap ", -1)]]),
													_: 1
												}, 8, ["disabled"]),
												A(R(v), {
													value: "secret",
													disabled: "",
													title: "Secrets come with sign-in (Phase 5)",
													"data-test": "workspace-secret"
												}, {
													default: z(() => [...t[14] ||= [k(" Secret ", -1)]]),
													_: 1
												})
											]),
											_: 2
										}, 1032, ["value", "onUpdate:value"]),
										t[16] ||= O("span", { class: "muted" }, "Secret workspaces become available with sign-in (Phase 5).", -1),
										G[e.name].kind === "volumeClaimTemplate" ? (P(), T(R(b), {
											key: 0,
											align: "center"
										}, {
											default: z(() => [A(R(ne), {
												value: G[e.name].sizeGi,
												"onUpdate:value": (t) => G[e.name].sizeGi = t,
												min: 1,
												max: 100,
												size: "small"
											}, {
												suffix: z(() => [...t[15] ||= [k(" Gi ", -1)]]),
												_: 1
											}, 8, ["value", "onUpdate:value"]), me.value ? (P(), D("span", nt, "Project storage: " + L(me.value), 1)) : E("", !0)]),
											_: 2
										}, 1024)) : E("", !0),
										G[e.name].kind === "configMap" ? (P(), T(R(re), {
											key: 1,
											value: G[e.name].configMap,
											"onUpdate:value": (t) => G[e.name].configMap = t,
											options: pe.value.map((e) => ({
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
							}, 1032, ["label", "feedback"]))), 128)),
							A(R(g), { label: "Timeout" }, {
								default: z(() => [A(R(b), { align: "center" }, {
									default: z(() => [A(R(ne), {
										value: he.value,
										"onUpdate:value": t[4] ||= (e) => he.value = e,
										min: 1,
										max: 1440,
										placeholder: "Default (1 hour)",
										size: "small",
										"data-test": "run-form-timeout"
									}, {
										suffix: z(() => [...t[17] ||= [k(" min ", -1)]]),
										_: 1
									}, 8, ["value"])]),
									_: 1
								})]),
								_: 1
							}),
							A(R(l), {
								type: "info",
								bordered: !1
							}, {
								default: z(() => [...t[18] ||= [
									k(" The run uses the Project's ", -1),
									O("code", null, "pipeline", -1),
									k(" ServiceAccount, which has no permissions and no API token. ", -1)
								]]),
								_: 1
							})
						]),
						_: 1
					})) : (P(), T(R(l), {
						key: 4,
						type: "info",
						bordered: !1,
						class: "gap"
					}, {
						default: z(() => [k(" Choose a " + L(S.value) + " " + L(de.value.length ? "" : `(there are none in ${N.value} yet)`) + ". ", 1)]),
						_: 1
					})),
					be.value ? (P(), T(R(l), {
						key: 5,
						type: "error",
						class: "gap",
						"data-test": "run-form-error"
					}, {
						default: z(() => [k(L(be.value) + " ", 1), Y.value.length ? (P(), D("ul", rt, [(P(!0), D(C, null, I(Y.value, (e) => (P(), D("li", { key: e.path + e.message }, [e.path ? (P(), D("code", it, L(e.path), 1)) : E("", !0), k(" " + L(e.message), 1)]))), 128))])) : E("", !0)]),
						_: 1
					})) : E("", !0),
					xe.value.length ? (P(), T(R(l), {
						key: 6,
						type: "warning",
						class: "gap"
					}, {
						default: z(() => [(P(!0), D(C, null, I(xe.value, (e) => (P(), D("div", { key: e }, L(e), 1))), 128))]),
						_: 1
					})) : E("", !0),
					A(R(b), {
						justify: "end",
						class: "gap"
					}, {
						default: z(() => [A(R(u), {
							type: "primary",
							loading: J.value,
							disabled: !ce.value || !q.value && (!B.value || we.value.length > 0),
							"data-test": "run-form-create",
							onClick: Ee
						}, {
							default: z(() => [...t[19] ||= [k(" Create ", -1)]]),
							_: 1
						}, 8, ["loading", "disabled"])]),
						_: 1
					})
				], 64)) : (P(), T(R(l), {
					key: 0,
					type: "info",
					"data-test": "run-form-no-projects"
				}, {
					default: z(() => [...t[5] ||= [k(" Runs can be created only in Project namespaces, and this cluster has no Projects yet. ", -1)]]),
					_: 1
				}))]),
				_: 1
			})]));
		}
	});
})), st = V((() => {})), ct = /* @__PURE__ */ H({ default: () => lt }), lt, ut = V((() => {
	ot(), ot(), st(), Ye(), lt = /*#__PURE__*/ $(at, [["__scopeId", "data-v-f6850e40"]]);
}));
//#endregion
//#region src/graph.ts
function dt(e, t) {
	let n = new Set(e.runAfter ?? []), r = JSON.stringify([e.params ?? [], e.when ?? []]);
	for (let e of r.matchAll(pt)) n.add(e[1]);
	return [...n].filter((n) => t.has(n) && n !== e.name).sort();
}
function ft(e, t = []) {
	let n = new Set(e.map((e) => e.name)), r = new Map(e.map((e) => [e.name, dt(e, n)])), i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set(), o = (e) => {
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
var pt, mt = V((() => {
	pt = /\$\(tasks\.([a-z0-9]([-a-z0-9]*[a-z0-9])?)\.results\./g;
})), ht, gt = V((() => {
	Q(), ht = /*@__PURE__*/ j({
		__name: "TaskRunLogs",
		props: {
			cluster: {},
			taskRun: {}
		},
		setup(e) {
			let t = e, { LogViewer: n } = K().components, r = w(() => t.taskRun.status?.podName ?? ""), i = w(() => t.taskRun.status?.steps ?? []), a = w(() => i.value.map((e) => ({
				label: e.name,
				value: e.container
			}))), o = w(() => i.value.map((e) => e.terminated ? "t" : e.running ? "r" : "w").join(""));
			return (t, i) => !r.value || !a.value.length ? (P(), T(R(l), {
				key: 0,
				type: "info",
				bordered: !1
			}, {
				default: z(() => [...i[0] ||= [k(" The TaskRun has no pod yet: logs show once its steps start. ", -1)]]),
				_: 1
			})) : (P(), T(ue(R(n)), {
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
})), _t, vt = V((() => {
	gt(), gt(), _t = ht;
})), yt, bt, xt, St, Ct, wt, Tt, Et, Dt, Ot, kt, At, jt = V((() => {
	mt(), vt(), Q(), yt = { "data-test": "tekton-graph" }, bt = {
		key: 1,
		class: "scroll"
	}, xt = [
		"width",
		"height",
		"aria-label"
	], St = ["d"], Ct = [
		"transform",
		"data-test",
		"data-state",
		"onClick"
	], wt = ["stroke", "stroke-dasharray"], Tt = ["cy", "fill"], Et = ["y"], Dt = {
		key: 0,
		x: "26",
		y: "34",
		class: "state"
	}, Ot = 170, kt = 44, At = /*@__PURE__*/ j({
		__name: "GraphTab",
		props: {
			cluster: {},
			object: {}
		},
		setup(e) {
			let t = e, n = w(() => t.object.kind === "PipelineRun"), r = w(() => n.value ? t.object.status?.pipelineSpec ?? t.object.spec?.pipelineSpec ?? {} : t.object.spec ?? {}), i = w(() => ft(r.value.tasks ?? [], r.value.finally ?? [])), a = n.value ? K().composables.useLiveList(() => ({
				cluster: t.cluster,
				type: Ce,
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
				let r = q(t);
				return {
					label: r.text,
					color: g[r.tone] ?? g.default
				};
			}
			function te(e, t) {
				let n = f.value.get(e), r = f.value.get(t);
				if (!n || !r) return "";
				let i = u(n.column) + Ot, a = d(n.row) + kt / 2, o = u(r.column), s = d(r.row) + kt / 2, c = (i + o) / 2;
				return `M${i},${a} C${c},${a} ${c},${s} ${o},${s}`;
			}
			return (t, r) => (P(), D("div", yt, [i.value.nodes.length ? (P(), D("div", bt, [(P(), D("svg", {
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
				}, null, 8, St))), 128)),
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
						width: Ot,
						height: kt,
						rx: "8",
						stroke: ee(e.name).color,
						"stroke-dasharray": e.finally ? "4 3" : void 0
					}, null, 8, wt),
					O("circle", {
						cx: "14",
						cy: kt / 2,
						r: "5",
						fill: ee(e.name).color
					}, null, 8, Tt),
					O("text", {
						x: "26",
						y: n.value ? 18 : 26,
						class: "name"
					}, L(e.name.length > 18 ? e.name.slice(0, 17) + "…" : e.name), 9, Et),
					n.value ? (P(), D("text", Dt, L(ee(e.name).label), 1)) : E("", !0)
				], 10, Ct))), 128))
			], 8, xt))])) : (P(), T(R(m), {
				key: 0,
				description: "No tasks."
			})), n.value && s.value ? (P(), D(C, { key: 2 }, [O("h4", null, "Logs: " + L(s.value), 1), c.value ? (P(), T(_t, {
				key: 0,
				cluster: e.cluster,
				"task-run": c.value
			}, null, 8, ["cluster", "task-run"])) : (P(), T(R(l), {
				key: 1,
				type: "info",
				bordered: !1
			}, {
				default: z(() => [...r[1] ||= [k(" This task has not started. ", -1)]]),
				_: 1
			}))], 64)) : E("", !0)]));
		}
	});
})), Mt = V((() => {})), Nt = /* @__PURE__ */ H({ default: () => Pt }), Pt, Ft = V((() => {
	jt(), jt(), Mt(), Ye(), Pt = /*#__PURE__*/ $(At, [["__scopeId", "data-v-774e814d"]]);
})), It, Lt = V((() => {
	Q(), It = /*@__PURE__*/ j({
		__name: "PipelineRunTaskRunsTab",
		props: {
			cluster: {},
			object: {}
		},
		setup(e) {
			let t = e, { ResourceLink: n } = K().components, { items: r, loading: i } = K().composables.useLiveList(() => ({
				cluster: t.cluster,
				type: Ce,
				namespace: t.object.metadata.namespace,
				labelSelector: `tekton.dev/pipelineRun=${t.object.metadata.name}`
			}), { sort: (e, t) => ke(e) - ke(t) }), a = F(Date.now()), o = setInterval(() => a.value = Date.now(), 1e3);
			ce(() => clearInterval(o));
			let s = w(() => [
				{
					key: "name",
					title: "TaskRun",
					ellipsis: { tooltip: !0 },
					render: (e) => M(n, {
						resource: "tekton.taskruns",
						namespace: e.metadata.namespace,
						name: e.metadata.name
					})
				},
				{
					key: "task",
					title: "Task",
					render: (e) => e.metadata.labels?.["tekton.dev/pipelineTask"] ?? "—"
				},
				{
					key: "status",
					title: "Status",
					width: 160,
					render: Y
				},
				{
					key: "started",
					title: "Started",
					width: 190,
					render: (e) => e.status?.startTime ? new Date(e.status.startTime).toLocaleString() : "—"
				},
				{
					key: "duration",
					title: "Duration",
					width: 100,
					render: (e) => J(e, a.value)
				}
			]);
			return (e, t) => (P(), T(R(f), {
				size: "small",
				columns: s.value,
				data: R(r),
				loading: R(i),
				"row-key": (e) => e.metadata.uid,
				"data-test": "tekton-taskruns"
			}, null, 8, [
				"columns",
				"data",
				"loading",
				"row-key"
			]));
		}
	});
})), Rt = /* @__PURE__ */ H({ default: () => zt }), zt, Bt = V((() => {
	Lt(), Lt(), zt = It;
})), Vt, Ht, Ut = V((() => {
	Q(), Vt = { "data-test": "tekton-pipeline-runs" }, Ht = /*@__PURE__*/ j({
		__name: "PipelineRunsTab",
		props: {
			cluster: {},
			object: {}
		},
		setup(e) {
			let t = e, { ResourceLink: n } = K().components, r = o(), { items: i, loading: a } = K().composables.useLiveList(() => ({
				cluster: t.cluster,
				type: Se,
				namespace: t.object.metadata.namespace,
				labelSelector: `tekton.dev/pipeline=${t.object.metadata.name}`
			}), { sort: Ae }), s = F(Date.now()), c = setInterval(() => s.value = Date.now(), 1e3);
			ce(() => clearInterval(c));
			let l = w(() => _e(t.object.metadata.namespace, t.cluster)), d = w(() => [
				{
					key: "name",
					title: "PipelineRun",
					render: (e) => M(n, {
						resource: "tekton.pipelineruns",
						namespace: e.metadata.namespace,
						name: e.metadata.name
					})
				},
				{
					key: "status",
					title: "Status",
					width: 160,
					render: Y
				},
				{
					key: "started",
					title: "Started",
					width: 190,
					render: (e) => e.status?.startTime ? new Date(e.status.startTime).toLocaleString() : "—"
				},
				{
					key: "duration",
					title: "Duration",
					width: 100,
					render: (e) => J(e, s.value)
				}
			]), p = () => r({
				name: "tekton.pipelineruns.new",
				params: { cluster: t.cluster },
				query: {
					ns: t.object.metadata.namespace ?? "",
					pipeline: t.object.metadata.name
				}
			});
			return (e, t) => (P(), D("div", Vt, [l.value ? (P(), T(R(b), {
				key: 0,
				justify: "end",
				class: "gap"
			}, {
				default: z(() => [A(R(u), {
					size: "small",
					type: "primary",
					"data-test": "pipeline-create-run",
					onClick: p
				}, {
					default: z(() => [...t[0] ||= [k(" Create PipelineRun ", -1)]]),
					_: 1
				})]),
				_: 1
			})) : E("", !0), A(R(f), {
				size: "small",
				columns: d.value,
				data: R(i),
				loading: R(a),
				"row-key": (e) => e.metadata.uid
			}, null, 8, [
				"columns",
				"data",
				"loading",
				"row-key"
			])]));
		}
	});
})), Wt = V((() => {})), Gt = /* @__PURE__ */ H({ default: () => Kt }), Kt, qt = V((() => {
	Ut(), Ut(), Wt(), Ye(), Kt = /*#__PURE__*/ $(Ht, [["__scopeId", "data-v-7107da21"]]);
})), Jt, Yt, Xt = V((() => {
	Jt = { "data-test": "tekton-parameters" }, Yt = /*@__PURE__*/ j({
		__name: "ParametersTab",
		props: {
			cluster: {},
			object: {}
		},
		setup(e) {
			let t = e, n = w(() => t.object.kind === "PipelineRun" || t.object.kind === "TaskRun"), r = (e) => e === void 0 ? "—" : typeof e == "string" ? e : JSON.stringify(e), i = w(() => (t.object.spec?.params ?? []).map((e) => n.value ? {
				name: e.name,
				a: r(e.value),
				b: ""
			} : {
				name: e.name,
				a: e.type ?? "string",
				b: `${r(e.default)}${e.description ? ` — ${e.description}` : ""}`
			})), a = w(() => (t.object.spec?.workspaces ?? []).map((e) => {
				if (!n.value) return {
					name: String(e.name),
					a: e.optional ? "optional" : "required",
					b: String(e.description ?? "")
				};
				let t = Object.keys(e).find((e) => e !== "name" && e !== "subPath") ?? "—", r = t === "configMap" ? String(e.configMap?.name ?? "") : t === "volumeClaimTemplate" ? String(e.volumeClaimTemplate?.spec?.resources?.requests?.storage ?? "") : "";
				return {
					name: String(e.name),
					a: t,
					b: r
				};
			})), o = w(() => n.value ? [{
				key: "name",
				title: "Name",
				width: 220
			}, {
				key: "a",
				title: "Value"
			}] : [
				{
					key: "name",
					title: "Name",
					width: 220
				},
				{
					key: "a",
					title: "Type",
					width: 100
				},
				{
					key: "b",
					title: "Default"
				}
			]), s = w(() => n.value ? [
				{
					key: "name",
					title: "Workspace",
					width: 220
				},
				{
					key: "a",
					title: "Bound to",
					width: 200
				},
				{
					key: "b",
					title: ""
				}
			] : [
				{
					key: "name",
					title: "Workspace",
					width: 220
				},
				{
					key: "a",
					title: "",
					width: 100
				},
				{
					key: "b",
					title: "Description"
				}
			]);
			return (e, t) => (P(), D("div", Jt, [
				t[0] ||= O("h4", null, "Parameters", -1),
				i.value.length ? (P(), T(R(f), {
					key: 0,
					size: "small",
					columns: o.value,
					data: i.value
				}, null, 8, ["columns", "data"])) : (P(), T(R(m), {
					key: 1,
					size: "small",
					description: "No parameters."
				})),
				t[1] ||= O("h4", null, "Workspaces", -1),
				a.value.length ? (P(), T(R(f), {
					key: 2,
					size: "small",
					columns: s.value,
					data: a.value
				}, null, 8, ["columns", "data"])) : (P(), T(R(m), {
					key: 3,
					size: "small",
					description: "No workspaces."
				}))
			]));
		}
	});
})), Zt = V((() => {})), Qt = /* @__PURE__ */ H({ default: () => $t }), $t, en = V((() => {
	Xt(), Xt(), Zt(), Ye(), $t = /*#__PURE__*/ $(Yt, [["__scopeId", "data-v-e2c1216c"]]);
})), tn, nn, rn, an = V((() => {
	me(), Q(), tn = { class: "reason" }, nn = { class: "hint" }, rn = /*@__PURE__*/ j({
		__name: "ImagePullBanner",
		props: {
			cluster: {},
			taskRuns: {},
			pipelineRun: {}
		},
		setup(e) {
			let t = e, n = S(), i = F(!1), a = w(() => t.taskRuns.flatMap((e) => U(e).map((t) => ({
				...t,
				task: e.metadata.labels?.["tekton.dev/pipelineTask"] ?? e.metadata.name
			})))), o = w(() => [...new Set(a.value.map((e) => e.image).filter((e) => !e.startsWith("(")))]), s = w(() => {
				let e = t.pipelineRun;
				return !!e && q(e).running && _e(e.metadata.namespace, t.cluster);
			});
			async function c() {
				let e = t.pipelineRun;
				i.value = !0;
				try {
					await r(t.cluster, X, "cancel", {
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
			return (t, n) => a.value.length ? (P(), T(R(l), {
				key: 0,
				type: "error",
				title: "Waiting for an image that cannot be pulled",
				class: "pull",
				"data-test": "image-pull-problem"
			}, {
				default: z(() => [
					(P(!0), D(C, null, I(a.value, (t) => (P(), D("div", { key: t.task + t.container }, [
						O("strong", null, L(t.task), 1),
						k(" (" + L(t.container) + "): " + L(R(G)(t, e.cluster)) + " ", 1),
						O("span", tn, L(t.reason), 1)
					]))), 128)),
					O("div", nn, [n[0] ||= k(" The run stays waiting until the image is available or the run times out. On the local k3d clusters, import it on the host: ", -1), (P(!0), D(C, null, I(o.value, (t) => (P(), D("code", {
						key: t,
						class: "cmd"
					}, "docker pull " + L(t) + " && k3d image import " + L(t) + " -c capybara-" + L(e.cluster), 1))), 128))]),
					s.value ? (P(), T(R(u), {
						key: 0,
						size: "small",
						type: "error",
						ghost: "",
						loading: i.value,
						class: "cancel",
						"data-test": "image-pull-cancel",
						onClick: c
					}, {
						default: z(() => [...n[1] ||= [k(" Cancel run ", -1)]]),
						_: 1
					}, 8, ["loading"])) : E("", !0)
				]),
				_: 1
			})) : E("", !0);
		}
	});
})), on = V((() => {})), sn, cn = V((() => {
	an(), an(), on(), Ye(), sn = /*#__PURE__*/ $(rn, [["__scopeId", "data-v-7a8b8553"]]);
})), ln, un, dn, fn, pn, mn, hn, gn, _n, vn = V((() => {
	cn(), vt(), Q(), ln = { "data-test": "tekton-run-logs" }, un = {
		key: 2,
		class: "split"
	}, dn = {
		class: "tasks",
		role: "listbox"
	}, fn = [
		"aria-selected",
		"data-test",
		"onClick"
	], pn = { class: "name" }, mn = {
		class: "state",
		"data-test": "run-status"
	}, hn = { class: "time" }, gn = { class: "logs" }, _n = /*@__PURE__*/ j({
		__name: "PipelineRunLogsTab",
		props: {
			cluster: {},
			object: {}
		},
		setup(e) {
			let t = e, { items: n, loading: r, error: i } = K().composables.useLiveList(() => ({
				cluster: t.cluster,
				type: Ce,
				namespace: t.object.metadata.namespace,
				labelSelector: `tekton.dev/pipelineRun=${t.object.metadata.name}`
			}), { sort: (e, t) => ke(e) - ke(t) }), a = F(Date.now()), o = setInterval(() => a.value = Date.now(), 1e3);
			ce(() => clearInterval(o));
			let s = F(null), c = F(!1);
			fe(n, (e) => {
				if (c.value && e.some((e) => e.metadata.uid === s.value)) return;
				let t = e.find((e) => q(e).running);
				s.value = (t ?? e.at(-1))?.metadata.uid ?? null;
			});
			let u = w(() => n.value.find((e) => e.metadata.uid === s.value) ?? null), d = (e) => e.metadata.labels?.["tekton.dev/pipelineTask"] ?? e.metadata.name, f = {
				success: "#18a058",
				error: "#d03050",
				warning: "#f0a020",
				info: "#2080f0",
				default: "#888"
			};
			function p(e) {
				s.value = e.metadata.uid, c.value = !0;
			}
			return (t, o) => (P(), D("div", ln, [
				A(sn, {
					cluster: e.cluster,
					"task-runs": R(n),
					"pipeline-run": e.object
				}, null, 8, [
					"cluster",
					"task-runs",
					"pipeline-run"
				]),
				R(i) ? (P(), T(R(l), {
					key: 0,
					type: "warning",
					class: "gap"
				}, {
					default: z(() => [k(L(R(i)), 1)]),
					_: 1
				})) : E("", !0),
				!R(r) && !R(n).length ? (P(), T(R(m), {
					key: 1,
					description: "No tasks have started yet."
				})) : (P(), D("div", un, [O("ul", dn, [(P(!0), D(C, null, I(R(n), (e) => (P(), D("li", {
					key: e.metadata.uid,
					class: N({ chosen: e.metadata.uid === s.value }),
					role: "option",
					"aria-selected": e.metadata.uid === s.value,
					"data-test": `task-${d(e)}`,
					onClick: (t) => p(e)
				}, [
					O("span", {
						class: "dot",
						style: oe({ background: f[R(q)(e).tone] })
					}, null, 4),
					O("span", pn, L(d(e)), 1),
					O("span", mn, L(R(q)(e).text), 1),
					O("span", hn, L(R(J)(e, a.value)), 1)
				], 10, fn))), 128))]), O("div", gn, [u.value ? (P(), T(_t, {
					key: 0,
					cluster: e.cluster,
					"task-run": u.value
				}, null, 8, ["cluster", "task-run"])) : E("", !0)])]))
			]));
		}
	});
})), yn = V((() => {})), bn = /* @__PURE__ */ H({ default: () => xn }), xn, Sn = V((() => {
	vn(), vn(), yn(), Ye(), xn = /*#__PURE__*/ $(_n, [["__scopeId", "data-v-5ebe946e"]]);
})), Cn, wn, Tn = V((() => {
	cn(), vt(), Cn = { "data-test": "tekton-taskrun-logs" }, wn = /*@__PURE__*/ j({
		__name: "TaskRunLogsTab",
		props: {
			cluster: {},
			object: {}
		},
		setup(e) {
			return (t, n) => (P(), D("div", Cn, [A(sn, {
				cluster: e.cluster,
				"task-runs": [e.object]
			}, null, 8, ["cluster", "task-runs"]), A(_t, {
				cluster: e.cluster,
				"task-run": e.object
			}, null, 8, ["cluster", "task-run"])]));
		}
	});
})), En = /* @__PURE__ */ H({ default: () => Dn }), Dn, On = V((() => {
	Tn(), Tn(), Dn = wn;
})), kn, An = V((() => {
	kn = /*@__PURE__*/ j({
		__name: "StartRunAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: t }) {
			let n = e, r = t, i = o();
			return se(async () => {
				await i({
					name: "tekton.pipelineruns.new",
					params: { cluster: n.cluster },
					query: {
						ns: n.object.metadata.namespace ?? "",
						pipeline: n.object.metadata.name
					}
				}), r("close");
			}), (e, t) => (P(), D("span"));
		}
	});
})), jn = /* @__PURE__ */ H({ default: () => Mn }), Mn, Nn = V((() => {
	An(), An(), Mn = kn;
})), Pn, Fn = V((() => {
	Q(), Pn = /*@__PURE__*/ j({
		__name: "StartLastRunAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: n }) {
			let i = e, a = n, s = o(), c = i.object.metadata.namespace ?? "", d = F(!0), f = F(null), p = F(null);
			se(async () => {
				try {
					let e = encodeURIComponent(`tekton.dev/pipeline=${i.object.metadata.name}`), t = await fetch(`/api/clusters/${encodeURIComponent(i.cluster)}/k8s/apis/tekton.dev/v1/namespaces/${encodeURIComponent(c)}/pipelineruns?labelSelector=${e}`, { headers: { Accept: "application/json" } }), n = [...(t.ok ? await t.json() : { items: [] }).items].sort((e, t) => Date.parse(t.metadata.creationTimestamp) - Date.parse(e.metadata.creationTimestamp))[0];
					if (!n) {
						f.value = `${i.object.metadata.name} has no runs yet: create one first.`;
						return;
					}
					p.value = n.metadata.name;
					let o = await r(i.cluster, X, "rerun", {
						namespace: c,
						name: n.metadata.name,
						uid: n.metadata.uid
					});
					a("close"), await s({
						name: "tekton.pipelineruns.detail",
						params: {
							cluster: i.cluster,
							namespace: c,
							name: o
						}
					});
				} catch (e) {
					f.value = e instanceof t && e.problems.length ? e.problems.map((e) => e.message).join("; ") : e instanceof Error ? e.message : String(e);
				} finally {
					d.value = !1;
				}
			});
			async function m() {
				a("close"), await s({
					name: "tekton.pipelineruns.new",
					params: { cluster: i.cluster },
					query: {
						ns: c,
						pipeline: i.object.metadata.name,
						...p.value ? { from: p.value } : {}
					}
				});
			}
			return (t, n) => (P(), T(R(_), {
				show: !0,
				preset: "card",
				title: `Start the last run of ${e.object.metadata.name}`,
				style: { "max-width": "520px" },
				onClose: n[1] ||= (e) => a("close"),
				onMaskClick: n[2] ||= (e) => a("close")
			}, {
				footer: z(() => [A(R(b), { justify: "end" }, {
					default: z(() => [A(R(u), { onClick: n[0] ||= (e) => a("close") }, {
						default: z(() => [...n[3] ||= [k(" Close ", -1)]]),
						_: 1
					}), f.value ? (P(), T(R(u), {
						key: 0,
						type: "primary",
						"data-test": "start-last-create",
						onClick: m
					}, {
						default: z(() => [...n[4] ||= [k(" Create PipelineRun ", -1)]]),
						_: 1
					})) : E("", !0)]),
					_: 1
				})]),
				default: z(() => [d.value ? (P(), T(R(ie), { key: 0 })) : f.value ? (P(), T(R(l), {
					key: 1,
					type: "error",
					"data-test": "start-last-error"
				}, {
					default: z(() => [k(L(f.value), 1)]),
					_: 1
				})) : E("", !0)]),
				_: 1
			}, 8, ["title"]));
		}
	});
})), In = /* @__PURE__ */ H({ default: () => Ln }), Ln, Rn = V((() => {
	Fn(), Fn(), Ln = Pn;
})), zn, Bn = V((() => {
	Q(), zn = /*@__PURE__*/ j({
		__name: "EditAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: t }) {
			let n = e, r = t, i = o();
			return se(async () => {
				let e = Re[n.object.kind ?? ""];
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
})), Vn = /* @__PURE__ */ H({ default: () => Hn }), Hn, Un = V((() => {
	Bn(), Bn(), Hn = zn;
})), Wn, Gn, Kn, qn = V((() => {
	Q(), Wn = {
		key: 0,
		"data-test": "rerun-created"
	}, Gn = { key: 0 }, Kn = /*@__PURE__*/ j({
		__name: "RerunAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: n }) {
			let i = e, a = n, { ResourceLink: s } = K().components, c = o(), d = F(!1), f = i.object.spec?.pipelineRef?.name;
			async function p() {
				await c({
					name: "tekton.pipelineruns.new",
					params: { cluster: i.cluster },
					query: {
						ns: i.object.metadata.namespace ?? "",
						pipeline: f,
						from: i.object.metadata.name
					}
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
			return (t, n) => (P(), T(R(_), {
				show: !0,
				preset: "card",
				title: `Rerun ${e.object.metadata.name}`,
				style: { "max-width": "520px" },
				onClose: n[1] ||= (e) => a("close"),
				onMaskClick: n[2] ||= (e) => a("close")
			}, {
				footer: z(() => [A(R(b), { justify: "end" }, {
					default: z(() => [A(R(u), { onClick: n[0] ||= (e) => a("close") }, {
						default: z(() => [k(L(g.value ? "Close" : "Cancel"), 1)]),
						_: 1
					}), g.value ? E("", !0) : (P(), T(R(u), {
						key: 0,
						type: "primary",
						loading: m.value,
						"data-test": "confirm",
						onClick: ee
					}, {
						default: z(() => [...n[6] ||= [k(" Rerun ", -1)]]),
						_: 1
					}, 8, ["loading"]))]),
					_: 1
				})]),
				default: z(() => [g.value ? (P(), D("div", Wn, [
					n[3] ||= k(" Started ", -1),
					(P(), T(ue(R(s)), {
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
				])) : (P(), D(C, { key: 1 }, [O("p", null, " Starts a new PipelineRun with the same pipeline, parameters, workspaces and service account (" + L(e.object.spec?.taskRunTemplate?.serviceAccountName ?? "default") + "). ", 1), h.value ? (P(), T(R(l), {
					key: 0,
					type: "error",
					"data-test": "rerun-error"
				}, {
					default: z(() => [k(L(h.value) + " ", 1), d.value && R(f) ? (P(), D("div", Gn, [A(R(u), {
						size: "small",
						class: "start-new",
						"data-test": "rerun-start-new",
						onClick: p
					}, {
						default: z(() => [...n[5] ||= [k(" Start a new run as pipeline ", -1)]]),
						_: 1
					})])) : E("", !0)]),
					_: 1
				})) : E("", !0)], 64))]),
				_: 1
			}, 8, ["title"]));
		}
	});
})), Jn = V((() => {})), Yn = /* @__PURE__ */ H({ default: () => Xn }), Xn, Zn = V((() => {
	qn(), qn(), Jn(), Ye(), Xn = /*#__PURE__*/ $(Kn, [["__scopeId", "data-v-db36ac4d"]]);
})), Qn, $n = V((() => {
	Q(), Qn = /*@__PURE__*/ j({
		__name: "StopAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: t }) {
			let n = e, i = t, a = S(), o = F(!1), s = w(() => q(n.object).running);
			async function c() {
				if (!s.value) return i("close"), !0;
				o.value = !0;
				try {
					let e = n.object.metadata;
					await r(n.cluster, "tekton", "stop", {
						namespace: e.namespace,
						name: e.name,
						uid: e.uid
					}), a.success(`Stopping ${e.name}`), i("close");
				} catch (e) {
					a.error(e instanceof Error ? e.message : String(e));
				} finally {
					o.value = !1;
				}
				return !1;
			}
			return (t, n) => (P(), T(R(_), {
				show: !0,
				preset: "dialog",
				type: s.value ? "warning" : "info",
				title: s.value ? `Stop ${e.object.metadata.name}?` : `${e.object.metadata.name} has finished`,
				"positive-text": s.value ? "Stop run" : "Close",
				"negative-text": s.value ? "Keep running" : void 0,
				loading: o.value,
				"positive-button-props": { "data-test": "confirm" },
				onPositiveClick: c,
				onNegativeClick: n[0] ||= (e) => i("close"),
				onClose: n[1] ||= (e) => i("close"),
				onMaskClick: n[2] ||= (e) => i("close")
			}, {
				default: z(() => [s.value ? (P(), D(C, { key: 0 }, [k(" No new tasks start; tasks already running and the finally tasks finish. To stop everything at once, use Cancel run. ")], 64)) : (P(), D(C, { key: 1 }, [k(" It is " + L(R(q)(e.object).text) + "; there is nothing to stop. ", 1)], 64))]),
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
})), er = /* @__PURE__ */ H({ default: () => tr }), tr, nr = V((() => {
	$n(), $n(), tr = Qn;
})), rr, ir, ar = V((() => {
	Q(), rr = {
		key: 0,
		"data-test": "cleanup-preview"
	}, ir = /*@__PURE__*/ j({
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
					s.value = (await i.cleanup(n.cluster, X, "pipelineruns", f, {
						keep: o.value,
						group: n.object.metadata.name,
						dryRun: !0
					})).deleted;
				} catch (e) {
					d.value = e instanceof Error ? e.message : String(e);
				}
			}
			se(p), fe(o, p);
			async function m() {
				c.value = !0;
				try {
					let { deleted: e } = await i.cleanup(n.cluster, X, "pipelineruns", f, {
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
			return (t, n) => (P(), T(R(_), {
				show: !0,
				preset: "card",
				title: `Clean up runs of ${e.object.metadata.name}`,
				style: { "max-width": "560px" },
				onClose: n[2] ||= (e) => r("close"),
				onMaskClick: n[3] ||= (e) => r("close")
			}, {
				footer: z(() => [A(R(b), { justify: "end" }, {
					default: z(() => [A(R(u), { onClick: n[1] ||= (e) => r("close") }, {
						default: z(() => [...n[6] ||= [k(" Cancel ", -1)]]),
						_: 1
					}), A(R(u), {
						type: "error",
						disabled: !s.value?.length,
						loading: c.value,
						"data-test": "cleanup-confirm",
						onClick: m
					}, {
						default: z(() => [k(" Delete " + L(s.value?.length ?? 0) + " run(s) ", 1)]),
						_: 1
					}, 8, ["disabled", "loading"])]),
					_: 1
				})]),
				default: z(() => [
					A(R(b), { align: "center" }, {
						default: z(() => [
							n[4] ||= k(" Keep the newest ", -1),
							A(R(ne), {
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
					s.value ? (P(), D("p", rr, [s.value.length ? (P(), D(C, { key: 0 }, [k(L(s.value.length) + " run(s) will be deleted: " + L(s.value.join(", ")), 1)], 64)) : (P(), D(C, { key: 1 }, [k(" Nothing to delete. ")], 64))])) : E("", !0),
					d.value ? (P(), T(R(l), {
						key: 1,
						type: "error"
					}, {
						default: z(() => [k(L(d.value), 1)]),
						_: 1
					})) : E("", !0)
				]),
				_: 1
			}, 8, ["title"]));
		}
	});
})), or = /* @__PURE__ */ H({ default: () => sr }), sr, cr = V((() => {
	ar(), ar(), sr = ir;
})), lr, ur = V((() => {
	Q(), lr = /*@__PURE__*/ j({
		__name: "CancelAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: t }) {
			let n = e, i = t, a = S(), o = F(!1), s = w(() => q(n.object).running);
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
			return (t, n) => (P(), T(R(_), {
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
				default: z(() => [s.value ? (P(), D(C, { key: 0 }, [k(" Running tasks are stopped and the run ends as Cancelled. ")], 64)) : (P(), D(C, { key: 1 }, [k(" It is " + L(R(q)(e.object).text) + "; there is nothing to cancel. ", 1)], 64))]),
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
})), dr = /* @__PURE__ */ H({ default: () => fr }), fr, pr = V((() => {
	ur(), ur(), fr = lr;
})), mr, hr, gr = V((() => {
	Q(), mr = { key: 0 }, hr = /*@__PURE__*/ j({
		__name: "DeleteAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: t }) {
			let n = e, r = t, a = o(), s = w(() => n.object.kind ?? ""), c = w(() => s.value === "PipelineRun" || s.value === "TaskRun"), d = F(""), f = F(!1), p = F(null), m = F([]);
			se(async () => {
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
					await i.remove(n.cluster, X, Re[s.value], e.namespace ?? "", e.name, e.uid), r("close"), await a({
						name: `tekton.${Re[s.value]}.list`,
						params: { cluster: n.cluster },
						query: { ns: e.namespace ?? "" }
					});
				} catch (e) {
					p.value = e instanceof Error ? e.message : String(e);
				} finally {
					f.value = !1;
				}
			}
			return (t, n) => (P(), T(R(_), {
				show: !0,
				preset: "card",
				title: `Delete ${s.value} ${e.object.metadata.name}?`,
				style: { "max-width": "520px" },
				onClose: n[2] ||= (e) => r("close"),
				onMaskClick: n[3] ||= (e) => r("close")
			}, {
				footer: z(() => [A(R(b), { justify: "end" }, {
					default: z(() => [A(R(u), { onClick: n[1] ||= (e) => r("close") }, {
						default: z(() => [...n[6] ||= [k(" Cancel ", -1)]]),
						_: 1
					}), A(R(u), {
						type: "error",
						disabled: !h.value,
						loading: f.value,
						"data-test": "delete-confirm",
						onClick: g
					}, {
						default: z(() => [...n[7] ||= [k(" Delete ", -1)]]),
						_: 1
					}, 8, ["disabled", "loading"])]),
					_: 1
				})]),
				default: z(() => [c.value ? (P(), D("p", mr, " The run" + L(s.value === "PipelineRun" ? ", its TaskRuns" : "") + " and their pods are removed (with their logs). ", 1)) : (P(), D(C, { key: 1 }, [
					m.value.length ? (P(), T(R(l), {
						key: 0,
						type: "warning",
						class: "gap",
						"data-test": "delete-used-by"
					}, {
						default: z(() => [k(" Used by " + L(m.value.join(", ")) + ": their next runs will fail until it exists again. ", 1)]),
						_: 1
					})) : E("", !0),
					O("p", null, [
						n[4] ||= k("Type ", -1),
						O("strong", null, L(e.object.metadata.name), 1),
						n[5] ||= k(" to delete it.", -1)
					]),
					A(R(te), {
						value: d.value,
						"onUpdate:value": n[0] ||= (e) => d.value = e,
						"data-test": "delete-confirm-name"
					}, null, 8, ["value"])
				], 64)), p.value ? (P(), T(R(l), {
					key: 2,
					type: "error",
					class: "gap"
				}, {
					default: z(() => [k(L(p.value), 1)]),
					_: 1
				})) : E("", !0)]),
				_: 1
			}, 8, ["title"]));
		}
	});
})), _r = V((() => {})), vr = /* @__PURE__ */ H({ default: () => yr }), yr, br = V((() => {
	gr(), gr(), _r(), Ye(), yr = /*#__PURE__*/ $(hr, [["__scopeId", "data-v-d99fe515"]]);
})), xr, Sr, Cr, wr, Tr, Er, Dr = V((() => {
	Q(), xr = { "data-test": "tekton-project-card" }, Sr = { key: 0 }, Cr = { key: 3 }, wr = { class: "muted" }, Tr = { class: "muted" }, Er = /*@__PURE__*/ j({
		__name: "ProjectRunsCard",
		props: {
			cluster: {},
			project: {}
		},
		setup(e) {
			let t = e, { ResourceLink: n } = K().components, { items: r, loading: i, error: a } = K().composables.useLiveList(() => ({
				cluster: t.cluster,
				type: Se,
				namespace: t.project.spec.namespace
			}), {
				sort: Ae,
				max: 5
			}), o = F(Date.now()), s = setInterval(() => o.value = Date.now(), 1e3);
			return ce(() => clearInterval(s)), (t, s) => (P(), D("div", xr, [R(a) ? (P(), D("span", Sr, L(R(a)), 1)) : R(i) ? (P(), T(R(ie), {
				key: 1,
				size: "small"
			})) : R(r).length ? (P(), D("table", Cr, [(P(!0), D(C, null, I(R(r), (t) => (P(), D("tr", { key: t.metadata.uid }, [
				O("td", null, [(P(), T(ue(R(n)), {
					cluster: e.cluster,
					resource: "tekton.pipelineruns",
					namespace: t.metadata.namespace,
					name: t.metadata.name
				}, null, 8, [
					"cluster",
					"namespace",
					"name"
				]))]),
				O("td", wr, L(R(be)(t)), 1),
				O("td", null, [(P(), T(ue(R(Y)(t))))]),
				O("td", Tr, L(R(J)(t, o.value)), 1)
			]))), 128))])) : (P(), T(R(m), {
				key: 2,
				size: "small",
				description: "No pipeline runs in this Project yet."
			}))]));
		}
	});
})), Or = V((() => {})), kr = /* @__PURE__ */ H({ default: () => Ar }), Ar, jr = V((() => {
	Dr(), Dr(), Or(), Ye(), Ar = /*#__PURE__*/ $(Er, [["__scopeId", "data-v-0c4eea02"]]);
}));
//#endregion
//#region src/index.ts
Q();
var Mr = (e, t) => _e(e.metadata.namespace, t.cluster), Nr = n({
	name: "tekton",
	apiVersion: e,
	minApi: "1.2",
	register(e) {
		he(e), ge(), e.register({
			type: "nav-section",
			id: "tekton.section",
			label: "Pipelines",
			order: 45
		}), e.registerResource(Pe, {
			order: 10,
			section: "tekton.section"
		}), e.registerResource(Fe, {
			order: 20,
			section: "tekton.section"
		}), e.registerResource(Ie, {
			order: 30,
			section: "tekton.section"
		}), e.registerResource(Le, {
			order: 40,
			section: "tekton.section"
		});
		let t = () => Promise.resolve().then(() => (Qe(), Xe)), n = () => Promise.resolve().then(() => (ut(), ct));
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
			id: "tekton.pipelineruns.new",
			path: "tekton/pipelineruns/new",
			scope: "cluster",
			title: "Create PipelineRun",
			parent: "tekton.pipelineruns.list",
			props: { kind: "pipelineruns" },
			component: n
		}), e.register({
			type: "route",
			id: "tekton.taskruns.new",
			path: "tekton/taskruns/new",
			scope: "cluster",
			title: "Create TaskRun",
			parent: "tekton.taskruns.list",
			props: { kind: "taskruns" },
			component: n
		}), e.register({
			type: "resource-detail-tab",
			id: "tekton.tab.graph",
			label: "Graph",
			order: 12,
			kinds: ["Pipeline", "PipelineRun"],
			component: () => Promise.resolve().then(() => (Ft(), Nt))
		}), e.register({
			type: "resource-detail-tab",
			id: "tekton.tab.taskruns",
			label: "TaskRuns",
			order: 22,
			kinds: ["PipelineRun"],
			component: () => Promise.resolve().then(() => (Bt(), Rt))
		}), e.register({
			type: "resource-detail-tab",
			id: "tekton.tab.pipelineruns",
			label: "PipelineRuns",
			order: 22,
			kinds: ["Pipeline"],
			component: () => Promise.resolve().then(() => (qt(), Gt))
		}), e.register({
			type: "resource-detail-tab",
			id: "tekton.tab.parameters",
			label: "Parameters",
			order: 24,
			kinds: [
				"Pipeline",
				"Task",
				"PipelineRun",
				"TaskRun"
			],
			component: () => Promise.resolve().then(() => (en(), Qt))
		}), e.register({
			type: "resource-detail-tab",
			id: "tekton.tab.logs",
			label: "Logs",
			order: 26,
			kinds: ["PipelineRun"],
			component: () => Promise.resolve().then(() => (Sn(), bn))
		}), e.register({
			type: "resource-detail-tab",
			id: "tekton.tab.taskrun-logs",
			label: "Logs",
			order: 26,
			kinds: ["TaskRun"],
			component: () => Promise.resolve().then(() => (On(), En))
		}), e.register({
			type: "resource-action",
			id: "tekton.action.start",
			label: "Start",
			order: 5,
			kinds: ["Pipeline"],
			appliesTo: Mr,
			component: () => Promise.resolve().then(() => (Nn(), jn))
		}), e.register({
			type: "resource-action",
			id: "tekton.action.start-last",
			label: "Start last run",
			order: 6,
			kinds: ["Pipeline"],
			appliesTo: Mr,
			component: () => Promise.resolve().then(() => (Rn(), In))
		}), e.register({
			type: "resource-action",
			id: "tekton.action.edit",
			label: "Edit",
			order: 10,
			kinds: ["Task", "Pipeline"],
			appliesTo: Mr,
			component: () => Promise.resolve().then(() => (Un(), Vn))
		}), e.register({
			type: "resource-action",
			id: "tekton.action.rerun",
			label: "Rerun",
			order: 15,
			kinds: ["PipelineRun"],
			appliesTo: Mr,
			component: () => Promise.resolve().then(() => (Zn(), Yn))
		}), e.register({
			type: "resource-action",
			id: "tekton.action.stop",
			label: "Stop",
			order: 16,
			kinds: ["PipelineRun"],
			appliesTo: Mr,
			component: () => Promise.resolve().then(() => (nr(), er))
		}), e.register({
			type: "resource-action",
			id: "tekton.action.cleanup",
			label: "Clean up runs",
			order: 30,
			kinds: ["Pipeline"],
			appliesTo: Mr,
			component: () => Promise.resolve().then(() => (cr(), or))
		}), e.register({
			type: "resource-action",
			id: "tekton.action.cancel",
			label: "Cancel run",
			order: 17,
			danger: !0,
			kinds: ["PipelineRun"],
			appliesTo: Mr,
			component: () => Promise.resolve().then(() => (pr(), dr))
		}), e.register({
			type: "resource-action",
			id: "tekton.action.delete",
			label: "Delete",
			order: 90,
			danger: !0,
			kinds: [
				"Task",
				"Pipeline",
				"PipelineRun",
				"TaskRun"
			],
			appliesTo: Mr,
			component: () => Promise.resolve().then(() => (br(), vr))
		}), e.register({
			type: "project-overview-card",
			id: "tekton.card.runs",
			title: "Pipeline runs",
			order: 30,
			component: () => Promise.resolve().then(() => (jr(), kr))
		});
	}
});
//#endregion
export { Nr as default };
