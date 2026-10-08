if(typeof document!=='undefined'){const s=document.createElement('style');s.dataset.plugin="tekton";s.textContent=".title[data-v-e2addc7d]{margin:0 0 16px}.toolbar[data-v-e2addc7d]{margin-bottom:12px}.select[data-v-e2addc7d]{width:240px}.gap[data-v-e2addc7d]{margin-top:12px}.title[data-v-0ae2f9c4]{margin:0 0 16px}.toolbar[data-v-0ae2f9c4]{margin-bottom:12px}.select[data-v-0ae2f9c4]{width:240px}.spacer[data-v-0ae2f9c4]{flex:1}.gap[data-v-0ae2f9c4]{margin-top:12px}.muted[data-v-0ae2f9c4]{opacity:.7;font-size:12px}h4[data-v-0ae2f9c4]{margin:4px 0 8px}.scroll[data-v-774e814d]{padding:4px 0 12px;overflow-x:auto}.node rect[data-v-774e814d]{fill:var(--n-color,transparent);stroke-width:2px}.node.clickable[data-v-774e814d]{cursor:pointer}.node.chosen rect[data-v-774e814d]{stroke-width:3px}.name[data-v-774e814d]{fill:currentColor;font-size:13px;font-weight:600}.state[data-v-774e814d]{fill:currentColor;opacity:.7;font-size:11px}.edge[data-v-774e814d]{fill:none;stroke:currentColor;opacity:.45;stroke-width:1.5px}.arrow[data-v-774e814d]{fill:currentColor;opacity:.6}h4[data-v-774e814d]{margin:8px 0}.gap[data-v-7107da21]{margin-bottom:12px}h4[data-v-e2c1216c]{margin:4px 0 8px}h4+*+h4[data-v-e2c1216c],h4[data-v-e2c1216c]:not(:first-child){margin-top:16px}.pull[data-v-7a8b8553]{margin-bottom:12px}.reason[data-v-7a8b8553]{opacity:.7;margin-left:6px;font-size:12px}.hint[data-v-7a8b8553]{opacity:.85;margin-top:6px;font-size:12px}.cancel[data-v-7a8b8553]{margin-top:8px}.cmd[data-v-7a8b8553]{margin-top:4px;display:block}.gap[data-v-5ebe946e]{margin-bottom:12px}.split[data-v-5ebe946e]{grid-template-columns:minmax(180px,260px) 1fr;align-items:start;gap:16px;display:grid}@media (width<=900px){.split[data-v-5ebe946e]{grid-template-columns:1fr}}.tasks[data-v-5ebe946e]{border:1px solid var(--capy-border);border-radius:6px;margin:0;padding:0;list-style:none}.tasks li[data-v-5ebe946e]{cursor:pointer;border-bottom:1px solid var(--capy-border);grid-template-rows:auto auto;grid-template-columns:10px 1fr auto;column-gap:8px;padding:8px 10px;display:grid}.tasks li[data-v-5ebe946e]:last-child{border-bottom:none}.tasks li.chosen[data-v-5ebe946e]{background:#c39b6e26}.dot[data-v-5ebe946e]{border-radius:50%;grid-area:1/1/3;width:10px;height:10px;margin-top:5px}.name[data-v-5ebe946e]{text-overflow:ellipsis;white-space:nowrap;grid-area:1/2;font-weight:600;overflow:hidden}.time[data-v-5ebe946e]{opacity:.7;white-space:nowrap;grid-area:1/3;font-size:12px}.state[data-v-5ebe946e]{opacity:.75;grid-area:2/2/auto/4;font-size:12px}.logs[data-v-5ebe946e]{min-width:0}.start-new[data-v-db36ac4d]{margin-top:8px}.gap[data-v-d99fe515]{margin-bottom:12px}table[data-v-0c4eea02]{border-collapse:collapse;width:100%}td[data-v-0c4eea02]{white-space:nowrap;padding:4px 8px 4px 0}td[data-v-0c4eea02]:first-child{text-overflow:ellipsis;max-width:220px;overflow:hidden}.muted[data-v-0c4eea02]{opacity:.7;font-size:12px}\n/*$vite$:1*/";document.head.appendChild(s)}
import { EXTENSION_API_VERSION as e, PluginRequestError as t, definePlugin as n, pluginAction as r, pluginObjects as i, useCluster as a, useNavigate as o, useParams as s, useQuery as c } from "@capybara/sdk";
import { NAlert as l, NButton as u, NCard as d, NDataTable as f, NDynamicTags as p, NEmpty as m, NForm as h, NFormItem as g, NH2 as ee, NInput as te, NInputNumber as ne, NModal as _, NRadioButton as v, NRadioGroup as y, NSelect as re, NSpace as b, NSpin as ie, NSwitch as ae, NTag as x, NTooltip as oe, useMessage as S } from "naive-ui";
import { Fragment as C, computed as w, createBlock as T, createCommentVNode as E, createElementBlock as D, createElementVNode as O, createTextVNode as k, createVNode as A, defineComponent as j, h as se, normalizeClass as M, normalizeStyle as ce, onMounted as le, onScopeDispose as ue, openBlock as N, reactive as de, ref as P, renderList as F, resolveDynamicComponent as fe, shallowRef as pe, toDisplayString as I, unref as L, watch as me, withCtx as R } from "vue";
//#region \0rolldown/runtime.js
var z = Object.defineProperty, B = (e, t, n) => () => {
	if (n) throw n[0];
	try {
		return e && (t = e(e = 0)), t;
	} catch (e) {
		throw n = [e], e;
	}
}, V = (e, t) => {
	let n = {};
	for (var r in e) z(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || z(n, Symbol.toStringTag, { value: "Module" }), n;
};
//#endregion
//#region src/pulls.ts
function H(e) {
	let t = e.status ?? {}, n = t.taskSpec?.steps ?? [], r = t.taskSpec?.sidecars ?? [], i = [], a = (e, t) => {
		for (let n of e ?? []) {
			let e = n.waiting?.reason ?? "";
			if (!he.has(e)) continue;
			let r = t.find((e) => e.name === n.name)?.image ?? U(n.waiting?.message) ?? "(unknown image)";
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
function U(e) {
	return e ? /image "([^"]+)"/.exec(e)?.[1] : void 0;
}
function W(e, t) {
	return e.reason === "InvalidImageName" ? `"${e.image}" is not a valid image name.` : `Image ${e.image} is not on ${t}, and the cluster could not pull it.`;
}
var he, ge = B((() => {
	he = /* @__PURE__ */ new Set([
		"ErrImagePull",
		"ImagePullBackOff",
		"ErrImageNeverPull",
		"InvalidImageName"
	]);
}));
//#endregion
//#region src/tekton.ts
function _e(e) {
	Ce = e;
}
function G() {
	if (!Ce) throw Error("tekton plugin is not registered");
	return Ce;
}
function ve(e = !1) {
	return Oe && !e && Date.now() - ke < 6e4 ? Oe : (ke = Date.now(), Oe = (async () => {
		try {
			let e = await fetch("/api/projects", { headers: { Accept: "application/json" } });
			if (!e.ok) return;
			let t = await e.json(), n = Array.isArray(t) ? t : t.items ?? [];
			De.value = new Set(n.filter((e) => e.status?.phase === "Ready").map((e) => `${e.spec.cluster}/${e.spec.namespace}`));
		} catch {}
	})(), Oe);
}
function ye(e, t) {
	return ve(), !!e && !!De.value?.has(`${t}/${e}`);
}
function be(e) {
	return ve(), [...De.value ?? []].filter((t) => t.startsWith(`${e}/`)).map((t) => t.slice(e.length + 1)).sort();
}
function K(e) {
	let t = (e.status?.conditions ?? []).find((e) => e.type === "Succeeded");
	if (t?.status !== "True" && t?.status !== "False" && H(e).length > 0) return {
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
function xe(e) {
	return (e.status?.conditions ?? []).find((e) => e.type === "Succeeded")?.message ?? "";
}
function q(e, t) {
	let n = Date.parse(e.status?.startTime ?? "");
	if (!n) return "—";
	let r = Date.parse(e.status?.completionTime ?? "") || t, i = Math.max(0, Math.round((r - n) / 1e3));
	if (i < 60) return `${i}s`;
	let a = Math.floor(i / 60);
	return a < 60 ? `${a}m ${String(i % 60).padStart(2, "0")}s` : `${Math.floor(a / 60)}h ${String(a % 60).padStart(2, "0")}m`;
}
function Se(e) {
	return e.spec?.pipelineRef?.name ?? (e.spec?.pipelineSpec ? "(inline)" : "—");
}
function J(e) {
	let t = K(e);
	return se(x, {
		size: "small",
		type: t.tone,
		bordered: !1,
		"data-test": "run-status"
	}, () => t.text);
}
var Y, Ce, X, we, Z, Te, Ee, De, Oe, ke, Ae, je, Me, Ne, Pe, Fe, Ie, Le, Re, ze, Q = B((() => {
	ge(), Y = "tekton", Ce = null, X = (e, t) => ({
		group: "tekton.dev",
		version: "v1",
		plural: e,
		kind: t,
		namespaced: !0
	}), we = X("pipelineruns", "PipelineRun"), Z = X("taskruns", "TaskRun"), Te = X("pipelines", "Pipeline"), Ee = X("tasks", "Task"), De = pe(null), Oe = null, ke = 0, Ae = (e) => Date.parse(e.status?.startTime ?? "") || Date.parse(e.metadata.creationTimestamp) || 0, je = (e, t) => Ae(t) - Ae(e), Me = (e, t, n) => n ? se(G().components.ResourceLink, {
		resource: e,
		namespace: t.metadata.namespace,
		name: n
	}) : "—", Ne = (e, t) => t ? ye(t, e) : be(e).length > 0, Pe = "Capybara's account on this cluster lacks the Pipelines console permissions: reinstall or reconnect the plugin.", Fe = {
		id: "tekton.pipelineruns",
		type: we,
		label: "PipelineRuns",
		singular: "PipelineRun",
		path: "tekton/pipelineruns",
		create: {
			label: "Create PipelineRun",
			route: "tekton.pipelineruns.new",
			when: Ne
		},
		columns: [
			{
				key: "status",
				title: "Status",
				width: 140,
				ellipsis: !1,
				render: J,
				sortValue: (e) => K(e).text
			},
			{
				key: "pipeline",
				title: "Pipeline",
				minWidth: 140,
				render: (e) => e.spec?.pipelineRef?.name ? Me("tekton.pipelines", e, e.spec.pipelineRef.name) : Se(e),
				sortValue: Se
			},
			{
				key: "started",
				title: "Started",
				width: 180,
				render: (e) => e.status?.startTime ? new Date(e.status.startTime).toLocaleString() : "—",
				sortValue: Ae
			},
			{
				key: "duration",
				title: "Duration",
				width: 100,
				render: (e, t) => q(e, t)
			}
		],
		status: (e) => K(e),
		overview: [
			{
				label: "Pipeline",
				render: (e) => e.spec?.pipelineRef?.name ? Me("tekton.pipelines", e, e.spec.pipelineRef.name) : Se(e)
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
				render: (e) => q(e, Date.now())
			},
			{
				label: "Message",
				render: (e) => xe(e) || "—"
			},
			{
				label: "Rerun of",
				render: (e) => Me("tekton.pipelineruns", e, e.metadata.annotations?.["platform.capybara.io/copy-of"])
			}
		],
		forbiddenHint: Pe
	}, Ie = {
		id: "tekton.taskruns",
		type: Z,
		label: "TaskRuns",
		singular: "TaskRun",
		path: "tekton/taskruns",
		create: {
			label: "Create TaskRun",
			route: "tekton.taskruns.new",
			when: Ne
		},
		columns: [
			{
				key: "status",
				title: "Status",
				width: 140,
				ellipsis: !1,
				render: J,
				sortValue: (e) => K(e).text
			},
			{
				key: "pipelinerun",
				title: "PipelineRun",
				minWidth: 160,
				render: (e) => Me("tekton.pipelineruns", e, e.metadata.labels?.["tekton.dev/pipelineRun"])
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
				render: (e, t) => q(e, t)
			}
		],
		status: (e) => K(e),
		overview: [
			{
				label: "PipelineRun",
				render: (e) => Me("tekton.pipelineruns", e, e.metadata.labels?.["tekton.dev/pipelineRun"])
			},
			{
				label: "Pod",
				render: (e) => Me("core.pods", e, e.status?.podName)
			},
			{
				label: "Duration",
				render: (e) => q(e, Date.now())
			},
			{
				label: "Message",
				render: (e) => xe(e) || "—"
			}
		],
		forbiddenHint: Pe
	}, Le = {
		id: "tekton.pipelines",
		type: Te,
		label: "Pipelines",
		singular: "Pipeline",
		path: "tekton/pipelines",
		create: {
			label: "Create Pipeline",
			route: "tekton.pipelines.new",
			when: Ne
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
		forbiddenHint: Pe
	}, Re = {
		id: "tekton.tasks",
		type: Ee,
		label: "Tasks",
		singular: "Task",
		path: "tekton/tasks",
		create: {
			label: "Create Task",
			route: "tekton.tasks.new",
			when: Ne
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
		forbiddenHint: Pe
	}, ze = {
		Task: "tasks",
		Pipeline: "pipelines",
		PipelineRun: "pipelineruns",
		TaskRun: "taskruns"
	};
})), Be, Ve, He = B((() => {
	Be = [{
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
	}], Ve = [{
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
})), Ue, We, Ge, Ke, qe, Je = B((() => {
	He(), Q(), Ue = { "data-test": "tekton-editor" }, We = { key: 1 }, Ge = { key: 0 }, Ke = { key: 0 }, qe = /*@__PURE__*/ j({
		__name: "EditorPage",
		props: { object: {} },
		setup(e) {
			let n = e, { YamlEditor: r, YamlDiff: f, ResourceLink: p } = G().components, m = G().yaml, h = a(), g = s(), te = c(), ne = o(), _ = w(() => n.object === "tasks" ? "Task" : "Pipeline"), v = w(() => !!g.value.name), y = P(g.value.namespace ?? te.value.ns ?? ""), ae = w(() => h.value ? be(h.value) : []), x = w(() => ye(y.value, h.value)), oe = w(() => n.object === "tasks" ? Be : Ve), S = P(oe.value[0].id), j = P(""), se = P(""), M = pe(null), ce = P(!1), ue = P(null), de = P([]), z = P([]), B = P(null), V = P(!1), H = P(!1), U = P(!1);
			function W() {
				let e = oe.value.find((e) => e.id === S.value);
				e && (j.value = e.yaml(n.object === "tasks" ? "say" : "my-pipeline"));
			}
			le(async () => {
				if (ve(!0), !v.value) {
					!y.value && ae.value.length && (y.value = ae.value[0]), W();
					return;
				}
				ce.value = !0;
				try {
					let e = `/api/clusters/${encodeURIComponent(h.value ?? "")}/k8s/apis/tekton.dev/v1/namespaces/${encodeURIComponent(y.value)}/${n.object}/${encodeURIComponent(g.value.name)}`, t = await fetch(e, { headers: { Accept: "application/json" } });
					if (!t.ok) throw Error(`${_.value} ${g.value.name} could not be loaded (${t.status})`);
					let r = await t.json();
					M.value = {
						uid: r.metadata.uid,
						resourceVersion: r.metadata.resourceVersion
					}, se.value = j.value = m.editable(r);
				} catch (e) {
					ue.value = e instanceof Error ? e.message : String(e);
				} finally {
					ce.value = !1;
				}
			}), me(ae, (e) => {
				!v.value && !y.value && e.length && (y.value = e[0]);
			}), me(j, () => {
				H.value = !1, U.value = !1;
			});
			function he() {
				try {
					return B.value = null, m.parse(j.value);
				} catch (e) {
					return B.value = e instanceof Error ? e.message : String(e), de.value = [], null;
				}
			}
			function ge(e) {
				e instanceof t ? (B.value = e.message, de.value = e.problems, z.value = e.warnings) : B.value = e instanceof Error ? e.message : String(e);
			}
			async function _e() {
				let e = he();
				if (!e || !h.value) return !1;
				V.value = !0;
				try {
					let t = await i.validate(h.value, Y, n.object, y.value, e, g.value.name);
					return de.value = t.problems, z.value = t.warnings, H.value = t.problems.length === 0, H.value;
				} catch (e) {
					return ge(e), !1;
				} finally {
					V.value = !1;
				}
			}
			async function K() {
				let e = he();
				if (e && h.value) {
					V.value = !0;
					try {
						let t = (v.value ? await i.update(h.value, Y, n.object, y.value, g.value.name, e, M.value) : await i.create(h.value, Y, n.object, y.value, e)).object.metadata.name;
						await ne({
							name: `tekton.${n.object}.detail`,
							params: {
								cluster: h.value,
								namespace: y.value,
								name: t
							}
						});
					} catch (e) {
						ge(e);
					} finally {
						V.value = !1;
					}
				}
			}
			async function xe() {
				if (v.value && !U.value) {
					await _e() && (U.value = !0);
					return;
				}
				(H.value || await _e()) && await K();
			}
			return (t, n) => (N(), D("div", Ue, [A(L(ee), { class: "title" }, {
				default: R(() => [k(I(v.value ? `Edit ${_.value} ${L(g).name}` : `Create ${_.value}`), 1)]),
				_: 1
			}), ce.value ? (N(), T(L(ie), { key: 0 })) : ue.value ? (N(), T(L(l), {
				key: 1,
				type: "error"
			}, {
				default: R(() => [k(I(ue.value), 1)]),
				_: 1
			})) : (N(), T(L(d), {
				key: 2,
				size: "small"
			}, {
				default: R(() => [
					A(L(b), {
						align: "center",
						class: "toolbar"
					}, {
						default: R(() => [
							n[5] ||= O("span", null, "Namespace", -1),
							v.value ? (N(), D("strong", We, I(y.value), 1)) : (N(), T(L(re), {
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
							v.value ? E("", !0) : (N(), D(C, { key: 2 }, [n[4] ||= O("span", null, "Template", -1), A(L(re), {
								value: S.value,
								"onUpdate:value": [n[1] ||= (e) => S.value = e, W],
								options: oe.value.map((e) => ({
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
					!ae.value.length && !v.value ? (N(), T(L(l), {
						key: 0,
						type: "info",
						class: "gap",
						"data-test": "editor-no-projects"
					}, {
						default: R(() => [...n[6] ||= [k(" Tasks and Pipelines can be created only in Project namespaces, and this cluster has no Projects yet. ", -1)]]),
						_: 1
					})) : y.value && !x.value ? (N(), T(L(l), {
						key: 1,
						type: "warning",
						class: "gap"
					}, {
						default: R(() => [k(I(y.value) + " is not a Project namespace: Tasks and Pipelines can be written only in Projects. ", 1)]),
						_: 1
					})) : E("", !0),
					U.value ? (N(), T(fe(L(f)), {
						key: 2,
						original: se.value,
						modified: j.value,
						"data-test": "editor-diff"
					}, null, 8, ["original", "modified"])) : (N(), T(fe(L(r)), {
						key: 3,
						value: j.value,
						"onUpdate:value": n[2] ||= (e) => j.value = e,
						problems: de.value,
						height: "55vh"
					}, null, 40, ["value", "problems"])),
					B.value || de.value.length ? (N(), T(L(l), {
						key: 4,
						type: "error",
						class: "gap",
						"data-test": "editor-error"
					}, {
						default: R(() => [k(I(B.value ?? "It does not meet the rules for this Project:") + " ", 1), de.value.length ? (N(), D("ul", Ge, [(N(!0), D(C, null, F(de.value, (e) => (N(), D("li", {
							key: e.path + e.message,
							"data-test": "editor-problem"
						}, [e.path ? (N(), D("code", Ke, I(e.path), 1)) : E("", !0), k(" " + I(e.message), 1)]))), 128))])) : E("", !0)]),
						_: 1
					})) : H.value && !U.value ? (N(), T(L(l), {
						key: 5,
						type: "success",
						class: "gap",
						"data-test": "editor-valid"
					}, {
						default: R(() => [...n[7] ||= [k(" It meets the rules for this Project and the cluster accepts it. ", -1)]]),
						_: 1
					})) : E("", !0),
					z.value.length ? (N(), T(L(l), {
						key: 6,
						type: "warning",
						class: "gap",
						"data-test": "editor-warnings"
					}, {
						default: R(() => [(N(!0), D(C, null, F(z.value, (e) => (N(), D("div", { key: e }, I(e), 1))), 128))]),
						_: 1
					})) : E("", !0),
					A(L(b), {
						justify: "end",
						class: "gap"
					}, {
						default: R(() => [
							v.value ? (N(), T(fe(L(p)), {
								key: 0,
								resource: `tekton.${e.object}`,
								namespace: y.value,
								name: L(g).name
							}, {
								default: R(() => [...n[8] ||= [k(" Cancel ", -1)]]),
								_: 1
							}, 8, [
								"resource",
								"namespace",
								"name"
							])) : E("", !0),
							U.value ? (N(), T(L(u), {
								key: 1,
								onClick: n[3] ||= (e) => U.value = !1
							}, {
								default: R(() => [...n[9] ||= [k(" Back to the editor ", -1)]]),
								_: 1
							})) : (N(), T(L(u), {
								key: 2,
								loading: V.value,
								disabled: !x.value,
								"data-test": "editor-validate",
								onClick: _e
							}, {
								default: R(() => [...n[10] ||= [k(" Validate ", -1)]]),
								_: 1
							}, 8, ["loading", "disabled"])),
							A(L(u), {
								type: "primary",
								loading: V.value,
								disabled: !x.value,
								"data-test": "editor-save",
								onClick: xe
							}, {
								default: R(() => [k(I(v.value ? U.value ? "Save" : "Review changes" : `Create ${_.value}`), 1)]),
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
})), Ye = B((() => {})), $, Xe = B((() => {
	$ = (e, t) => {
		let n = e.__vccOpts || e;
		for (let [e, r] of t) n[e] = r;
		return n;
	};
})), Ze = /* @__PURE__ */ V({ default: () => Qe }), Qe, $e = B((() => {
	Je(), Je(), Ye(), Xe(), Qe = /*#__PURE__*/ $(qe, [["__scopeId", "data-v-e2addc7d"]]);
})), et, tt, nt, rt, it, at, ot, st = B((() => {
	Q(), et = { "data-test": "tekton-run-form" }, tt = { key: 0 }, nt = { key: 1 }, rt = {
		key: 0,
		class: "muted"
	}, it = { key: 0 }, at = { key: 0 }, ot = /*@__PURE__*/ j({
		__name: "RunForm",
		props: { kind: {} },
		setup(e) {
			let n = e, { YamlEditor: r } = G().components, s = G().yaml, f = a(), m = c(), _ = o(), x = w(() => n.kind === "pipelineruns"), S = w(() => x.value ? "Pipeline" : "Task"), j = w(() => x.value ? "pipelines" : "tasks"), se = w(() => x.value ? "PipelineRun" : "TaskRun"), M = P(m.value.ns ?? ""), ce = w(() => f.value ? be(f.value) : []), ue = w(() => ye(M.value, f.value)), pe = P([]), z = P(m.value.pipeline ?? m.value.task ?? null), B = P(!1), V = P([]), H = P([]), U = de({}), W = de({}), he = P([]), ge = P(null), _e = P(null), K = P(!1), xe = P(""), q = P(!1), Se = P(null), J = P([]), Ce = P([]), X = (e) => `/api/clusters/${encodeURIComponent(f.value ?? "")}/k8s/${e}`;
			async function we(e) {
				let t = await fetch(e, { headers: { Accept: "application/json" } });
				return t.ok ? await t.json() : null;
			}
			let Z = (e) => `namespaces/${encodeURIComponent(e)}`;
			le(() => {
				ve(!0), !M.value && ce.value.length && (M.value = ce.value[0]);
			}), me(ce, (e) => {
				!M.value && e.length && (M.value = e[0]);
			}), me(M, async (e) => {
				if (pe.value = [], he.value = [], ge.value = null, !e || !f.value) return;
				let t = await we(X(`apis/tekton.dev/v1/${Z(e)}/${j.value}`));
				pe.value = (t?.items ?? []).map((e) => e.metadata.name).sort(), z.value && !pe.value.includes(z.value) && (z.value = null);
				let n = await we(X(`api/v1/${Z(e)}/configmaps`));
				he.value = (n?.items ?? []).map((e) => e.metadata.name).filter((e) => e !== "kube-root-ca.crt").sort();
				let r = (await we(X(`api/v1/${Z(e)}/resourcequotas`)))?.items.find((e) => e.status?.hard?.["requests.storage"]);
				r && (ge.value = `${r.status.used?.["requests.storage"] ?? "0"} of ${r.status.hard["requests.storage"]} used`);
			}, { immediate: !0 }), me([z, M], async ([e, t]) => {
				if (V.value = [], H.value = [], e && t) {
					B.value = !0;
					try {
						let r = await we(X(`apis/tekton.dev/v1/${Z(t)}/${j.value}/${encodeURIComponent(e)}`)), i = {};
						m.value.from && (i = (await we(X(`apis/tekton.dev/v1/${Z(t)}/${n.kind}/${encodeURIComponent(m.value.from)}`)))?.spec ?? {});
						let a = Object.fromEntries((i.params ?? []).map((e) => [e.name, e.value]));
						V.value = r?.spec?.params ?? [], H.value = r?.spec?.workspaces ?? [];
						for (let e of Object.keys(U)) delete U[e];
						for (let e of V.value) {
							let t = a[e.name] ?? e.default;
							U[e.name] = e.type === "array" ? t ?? [] : t === void 0 ? "" : typeof t == "string" ? t : JSON.stringify(t);
						}
						for (let e of Object.keys(W)) delete W[e];
						for (let e of H.value) W[e.name] = {
							kind: e.optional ? "none" : "emptyDir",
							sizeGi: 1,
							configMap: ""
						};
					} finally {
						B.value = !1;
					}
				}
			}, { immediate: !0 });
			let Te = w(() => V.value.filter((e) => e.default === void 0).filter((e) => {
				let t = U[e.name];
				return t === "" || t === void 0 || Array.isArray(t) && !t.length;
			}).map((e) => e.name));
			function Ee() {
				let e = V.value.map((e) => {
					let t = U[e.name];
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
				}), t = Object.entries(W).filter(([, e]) => e.kind !== "none" && e.kind !== "secret").map(([e, t]) => t.kind === "emptyDir" ? {
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
				}), n = z.value ?? (x.value ? "my-pipeline" : "my-task"), r = x.value ? { pipelineRef: { name: n } } : { taskRef: { name: n } };
				if (e.length && (r.params = e), t.length && (r.workspaces = t), _e.value) {
					let e = `${_e.value}m`;
					x.value ? r.timeouts = { pipeline: e } : r.timeout = e;
				}
				return {
					apiVersion: "tekton.dev/v1",
					kind: se.value,
					metadata: { generateName: `${n.slice(0, 50)}-` },
					spec: r
				};
			}
			me(K, (e) => {
				e && (xe.value = s.stringify(Ee()));
			});
			async function De() {
				if (f.value) {
					q.value = !0, Se.value = null, J.value = [], Ce.value = [];
					try {
						let e = K.value ? s.parse(xe.value) : Ee(), t = (await i.create(f.value, Y, n.kind, M.value, e)).object.metadata.name;
						await _({
							name: `tekton.${n.kind}.detail`,
							params: {
								cluster: f.value,
								namespace: M.value,
								name: t
							}
						});
					} catch (e) {
						e instanceof t ? (Se.value = e.message, J.value = e.problems, Ce.value = e.warnings) : Se.value = e instanceof Error ? e.message : String(e);
					} finally {
						q.value = !1;
					}
				}
			}
			return (e, t) => (N(), D("div", et, [A(L(ee), { class: "title" }, {
				default: R(() => [k(" Create " + I(se.value), 1)]),
				_: 1
			}), A(L(d), { size: "small" }, {
				default: R(() => [ce.value.length ? (N(), D(C, { key: 1 }, [
					A(L(b), {
						align: "center",
						class: "toolbar"
					}, {
						default: R(() => [
							t[6] ||= O("span", null, "Namespace", -1),
							A(L(re), {
								value: M.value,
								"onUpdate:value": t[0] ||= (e) => M.value = e,
								options: ce.value.map((e) => ({
									label: e,
									value: e
								})),
								size: "small",
								class: "select",
								"data-test": "run-form-namespace"
							}, null, 8, ["value", "options"]),
							O("span", null, I(S.value), 1),
							A(L(re), {
								value: z.value,
								"onUpdate:value": t[1] ||= (e) => z.value = e,
								options: pe.value.map((e) => ({
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
							A(L(ae), {
								value: K.value,
								"onUpdate:value": t[2] ||= (e) => K.value = e,
								"data-test": "run-form-yaml"
							}, null, 8, ["value"])
						]),
						_: 1
					}),
					M.value && !ue.value ? (N(), T(L(l), {
						key: 0,
						type: "warning",
						class: "gap"
					}, {
						default: R(() => [k(I(M.value) + " is not a Project namespace: runs can be created only in Projects. ", 1)]),
						_: 1
					})) : E("", !0),
					K.value ? (N(), D(C, { key: 1 }, [(N(), T(fe(L(r)), {
						value: xe.value,
						"onUpdate:value": t[3] ||= (e) => xe.value = e,
						problems: J.value,
						height: "50vh"
					}, null, 40, ["value", "problems"])), t[9] ||= O("div", { class: "muted gap" }, [
						k(" The run uses the Project's "),
						O("code", null, "pipeline"),
						k(" ServiceAccount (filled in by Capybara if left out). ")
					], -1)], 64)) : B.value ? (N(), T(L(ie), { key: 2 })) : z.value ? (N(), T(L(h), {
						key: 3,
						"label-placement": "top"
					}, {
						default: R(() => [
							V.value.length ? (N(), D("h4", tt, " Parameters ")) : E("", !0),
							(N(!0), D(C, null, F(V.value, (e) => (N(), T(L(g), {
								key: e.name,
								label: e.name + (e.default === void 0 ? " (required)" : ""),
								feedback: e.description
							}, {
								default: R(() => [e.type === "array" ? (N(), T(L(p), {
									key: 0,
									value: U[e.name],
									"onUpdate:value": (t) => U[e.name] = t,
									"data-test": `param-${e.name}`
								}, null, 8, [
									"value",
									"onUpdate:value",
									"data-test"
								])) : (N(), T(L(te), {
									key: 1,
									value: U[e.name],
									"onUpdate:value": (t) => U[e.name] = t,
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
							H.value.length ? (N(), D("h4", nt, " Workspaces ")) : E("", !0),
							(N(!0), D(C, null, F(H.value, (e) => (N(), T(L(g), {
								key: e.name,
								label: e.name + (e.optional ? " (optional)" : ""),
								feedback: e.description
							}, {
								default: R(() => [A(L(b), {
									vertical: "",
									"data-test": `workspace-${e.name}`
								}, {
									default: R(() => [
										A(L(y), {
											value: W[e.name].kind,
											"onUpdate:value": (t) => W[e.name].kind = t,
											size: "small"
										}, {
											default: R(() => [
												e.optional ? (N(), T(L(v), {
													key: 0,
													value: "none"
												}, {
													default: R(() => [...t[10] ||= [k(" None ", -1)]]),
													_: 1
												})) : E("", !0),
												A(L(v), { value: "emptyDir" }, {
													default: R(() => [...t[11] ||= [k(" Empty directory ", -1)]]),
													_: 1
												}),
												A(L(v), { value: "volumeClaimTemplate" }, {
													default: R(() => [...t[12] ||= [k(" New volume ", -1)]]),
													_: 1
												}),
												A(L(v), {
													value: "configMap",
													disabled: !he.value.length
												}, {
													default: R(() => [...t[13] ||= [k(" ConfigMap ", -1)]]),
													_: 1
												}, 8, ["disabled"]),
												A(L(oe), null, {
													trigger: R(() => [A(L(v), {
														value: "secret",
														disabled: "",
														"data-test": "workspace-secret"
													}, {
														default: R(() => [...t[14] ||= [k(" Secret ", -1)]]),
														_: 1
													})]),
													default: R(() => [t[15] ||= k(" Secrets come with sign-in (Phase 5): until then runs started from Capybara cannot use them. ", -1)]),
													_: 1
												})
											]),
											_: 2
										}, 1032, ["value", "onUpdate:value"]),
										W[e.name].kind === "volumeClaimTemplate" ? (N(), T(L(b), {
											key: 0,
											align: "center"
										}, {
											default: R(() => [A(L(ne), {
												value: W[e.name].sizeGi,
												"onUpdate:value": (t) => W[e.name].sizeGi = t,
												min: 1,
												max: 100,
												size: "small"
											}, {
												suffix: R(() => [...t[16] ||= [k(" Gi ", -1)]]),
												_: 1
											}, 8, ["value", "onUpdate:value"]), ge.value ? (N(), D("span", rt, "Project storage: " + I(ge.value), 1)) : E("", !0)]),
											_: 2
										}, 1024)) : E("", !0),
										W[e.name].kind === "configMap" ? (N(), T(L(re), {
											key: 1,
											value: W[e.name].configMap,
											"onUpdate:value": (t) => W[e.name].configMap = t,
											options: he.value.map((e) => ({
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
							A(L(g), { label: "Timeout" }, {
								default: R(() => [A(L(b), { align: "center" }, {
									default: R(() => [A(L(ne), {
										value: _e.value,
										"onUpdate:value": t[4] ||= (e) => _e.value = e,
										min: 1,
										max: 1440,
										placeholder: "Default (1 hour)",
										size: "small",
										"data-test": "run-form-timeout"
									}, {
										suffix: R(() => [...t[17] ||= [k(" min ", -1)]]),
										_: 1
									}, 8, ["value"])]),
									_: 1
								})]),
								_: 1
							}),
							A(L(l), {
								type: "info",
								bordered: !1
							}, {
								default: R(() => [...t[18] ||= [
									k(" The run uses the Project's ", -1),
									O("code", null, "pipeline", -1),
									k(" ServiceAccount, which has no permissions and no API token. ", -1)
								]]),
								_: 1
							})
						]),
						_: 1
					})) : (N(), T(L(l), {
						key: 4,
						type: "info",
						bordered: !1,
						class: "gap"
					}, {
						default: R(() => [k(" Choose a " + I(S.value) + " " + I(pe.value.length ? "" : `(there are none in ${M.value} yet)`) + ". ", 1)]),
						_: 1
					})),
					Se.value ? (N(), T(L(l), {
						key: 5,
						type: "error",
						class: "gap",
						"data-test": "run-form-error"
					}, {
						default: R(() => [k(I(Se.value) + " ", 1), J.value.length ? (N(), D("ul", it, [(N(!0), D(C, null, F(J.value, (e) => (N(), D("li", { key: e.path + e.message }, [e.path ? (N(), D("code", at, I(e.path), 1)) : E("", !0), k(" " + I(e.message), 1)]))), 128))])) : E("", !0)]),
						_: 1
					})) : E("", !0),
					Ce.value.length ? (N(), T(L(l), {
						key: 6,
						type: "warning",
						class: "gap"
					}, {
						default: R(() => [(N(!0), D(C, null, F(Ce.value, (e) => (N(), D("div", { key: e }, I(e), 1))), 128))]),
						_: 1
					})) : E("", !0),
					A(L(b), {
						justify: "end",
						class: "gap"
					}, {
						default: R(() => [A(L(u), {
							type: "primary",
							loading: q.value,
							disabled: !ue.value || !K.value && (!z.value || Te.value.length > 0),
							"data-test": "run-form-create",
							onClick: De
						}, {
							default: R(() => [...t[19] ||= [k(" Create ", -1)]]),
							_: 1
						}, 8, ["loading", "disabled"])]),
						_: 1
					})
				], 64)) : (N(), T(L(l), {
					key: 0,
					type: "info",
					"data-test": "run-form-no-projects"
				}, {
					default: R(() => [...t[5] ||= [k(" Runs can be created only in Project namespaces, and this cluster has no Projects yet. ", -1)]]),
					_: 1
				}))]),
				_: 1
			})]));
		}
	});
})), ct = B((() => {})), lt = /* @__PURE__ */ V({ default: () => ut }), ut, dt = B((() => {
	st(), st(), ct(), Xe(), ut = /*#__PURE__*/ $(ot, [["__scopeId", "data-v-0ae2f9c4"]]);
}));
//#endregion
//#region src/graph.ts
function ft(e, t) {
	let n = new Set(e.runAfter ?? []), r = JSON.stringify([e.params ?? [], e.when ?? []]);
	for (let e of r.matchAll(mt)) n.add(e[1]);
	return [...n].filter((n) => t.has(n) && n !== e.name).sort();
}
function pt(e, t = []) {
	let n = new Set(e.map((e) => e.name)), r = new Map(e.map((e) => [e.name, ft(e, n)])), i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set(), o = (e) => {
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
var mt, ht = B((() => {
	mt = /\$\(tasks\.([a-z0-9]([-a-z0-9]*[a-z0-9])?)\.results\./g;
})), gt, _t = B((() => {
	Q(), gt = /*@__PURE__*/ j({
		__name: "TaskRunLogs",
		props: {
			cluster: {},
			taskRun: {}
		},
		setup(e) {
			let t = e, { LogViewer: n } = G().components, r = w(() => t.taskRun.status?.podName ?? ""), i = w(() => t.taskRun.status?.steps ?? []), a = w(() => i.value.map((e) => ({
				label: e.name,
				value: e.container
			}))), o = w(() => i.value.map((e) => e.terminated ? "t" : e.running ? "r" : "w").join(""));
			return (t, i) => !r.value || !a.value.length ? (N(), T(L(l), {
				key: 0,
				type: "info",
				bordered: !1
			}, {
				default: R(() => [...i[0] ||= [k(" The TaskRun has no pod yet: logs show once its steps start. ", -1)]]),
				_: 1
			})) : (N(), T(fe(L(n)), {
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
})), vt, yt = B((() => {
	_t(), _t(), vt = gt;
})), bt, xt, St, Ct, wt, Tt, Et, Dt, Ot, kt, At, jt, Mt = B((() => {
	ht(), yt(), Q(), bt = { "data-test": "tekton-graph" }, xt = {
		key: 1,
		class: "scroll"
	}, St = [
		"width",
		"height",
		"aria-label"
	], Ct = ["d"], wt = [
		"transform",
		"data-test",
		"data-state",
		"onClick"
	], Tt = ["stroke", "stroke-dasharray"], Et = ["cy", "fill"], Dt = ["y"], Ot = {
		key: 0,
		x: "26",
		y: "34",
		class: "state"
	}, kt = 170, At = 44, jt = /*@__PURE__*/ j({
		__name: "GraphTab",
		props: {
			cluster: {},
			object: {}
		},
		setup(e) {
			let t = e, n = w(() => t.object.kind === "PipelineRun"), r = w(() => n.value ? t.object.status?.pipelineSpec ?? t.object.spec?.pipelineSpec ?? {} : t.object.spec ?? {}), i = w(() => pt(r.value.tasks ?? [], r.value.finally ?? [])), a = n.value ? G().composables.useLiveList(() => ({
				cluster: t.cluster,
				type: Z,
				namespace: t.object.metadata.namespace,
				labelSelector: `tekton.dev/pipelineRun=${t.object.metadata.name}`
			})).items : P([]), o = w(() => new Map(a.value.map((e) => [e.metadata.labels?.["tekton.dev/pipelineTask"] ?? "", e]))), s = P(null), c = w(() => s.value ? o.value.get(s.value) ?? null : null), u = (e) => 10 + e * 230, d = (e) => 10 + e * 64, f = w(() => new Map(i.value.nodes.map((e) => [e.name, e]))), p = w(() => u(i.value.columns) + 10), h = w(() => d(i.value.rows) + 10), g = {
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
				let r = K(t);
				return {
					label: r.text,
					color: g[r.tone] ?? g.default
				};
			}
			function te(e, t) {
				let n = f.value.get(e), r = f.value.get(t);
				if (!n || !r) return "";
				let i = u(n.column) + kt, a = d(n.row) + At / 2, o = u(r.column), s = d(r.row) + At / 2, c = (i + o) / 2;
				return `M${i},${a} C${c},${a} ${c},${s} ${o},${s}`;
			}
			return (t, r) => (N(), D("div", bt, [i.value.nodes.length ? (N(), D("div", xt, [(N(), D("svg", {
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
				(N(!0), D(C, null, F(i.value.edges, (e) => (N(), D("path", {
					key: e.from + ">" + e.to,
					d: te(e.from, e.to),
					class: "edge",
					"marker-end": "url(#arrow)"
				}, null, 8, Ct))), 128)),
				(N(!0), D(C, null, F(i.value.nodes, (e) => (N(), D("g", {
					key: e.name,
					transform: `translate(${u(e.column)},${d(e.row)})`,
					class: M(["node", {
						clickable: n.value,
						chosen: s.value === e.name
					}]),
					"data-test": `graph-node-${e.name}`,
					"data-state": ee(e.name).label,
					onClick: (t) => n.value && (s.value = e.name)
				}, [
					O("rect", {
						width: kt,
						height: At,
						rx: "8",
						stroke: ee(e.name).color,
						"stroke-dasharray": e.finally ? "4 3" : void 0
					}, null, 8, Tt),
					O("circle", {
						cx: "14",
						cy: At / 2,
						r: "5",
						fill: ee(e.name).color
					}, null, 8, Et),
					O("text", {
						x: "26",
						y: n.value ? 18 : 26,
						class: "name"
					}, I(e.name.length > 18 ? e.name.slice(0, 17) + "…" : e.name), 9, Dt),
					n.value ? (N(), D("text", Ot, I(ee(e.name).label), 1)) : E("", !0)
				], 10, wt))), 128))
			], 8, St))])) : (N(), T(L(m), {
				key: 0,
				description: "No tasks."
			})), n.value && s.value ? (N(), D(C, { key: 2 }, [O("h4", null, "Logs: " + I(s.value), 1), c.value ? (N(), T(vt, {
				key: 0,
				cluster: e.cluster,
				"task-run": c.value
			}, null, 8, ["cluster", "task-run"])) : (N(), T(L(l), {
				key: 1,
				type: "info",
				bordered: !1
			}, {
				default: R(() => [...r[1] ||= [k(" This task has not started. ", -1)]]),
				_: 1
			}))], 64)) : E("", !0)]));
		}
	});
})), Nt = B((() => {})), Pt = /* @__PURE__ */ V({ default: () => Ft }), Ft, It = B((() => {
	Mt(), Mt(), Nt(), Xe(), Ft = /*#__PURE__*/ $(jt, [["__scopeId", "data-v-774e814d"]]);
})), Lt, Rt = B((() => {
	Q(), Lt = /*@__PURE__*/ j({
		__name: "PipelineRunTaskRunsTab",
		props: {
			cluster: {},
			object: {}
		},
		setup(e) {
			let t = e, { ResourceLink: n } = G().components, { items: r, loading: i } = G().composables.useLiveList(() => ({
				cluster: t.cluster,
				type: Z,
				namespace: t.object.metadata.namespace,
				labelSelector: `tekton.dev/pipelineRun=${t.object.metadata.name}`
			}), { sort: (e, t) => Ae(e) - Ae(t) }), a = P(Date.now()), o = setInterval(() => a.value = Date.now(), 1e3);
			ue(() => clearInterval(o));
			let s = w(() => [
				{
					key: "name",
					title: "TaskRun",
					ellipsis: { tooltip: !0 },
					render: (e) => se(n, {
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
					render: J
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
					render: (e) => q(e, a.value)
				}
			]);
			return (e, t) => (N(), T(L(f), {
				size: "small",
				columns: s.value,
				data: L(r),
				loading: L(i),
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
})), zt = /* @__PURE__ */ V({ default: () => Bt }), Bt, Vt = B((() => {
	Rt(), Rt(), Bt = Lt;
})), Ht, Ut, Wt = B((() => {
	Q(), Ht = { "data-test": "tekton-pipeline-runs" }, Ut = /*@__PURE__*/ j({
		__name: "PipelineRunsTab",
		props: {
			cluster: {},
			object: {}
		},
		setup(e) {
			let t = e, { ResourceLink: n } = G().components, r = o(), { items: i, loading: a } = G().composables.useLiveList(() => ({
				cluster: t.cluster,
				type: we,
				namespace: t.object.metadata.namespace,
				labelSelector: `tekton.dev/pipeline=${t.object.metadata.name}`
			}), { sort: je }), s = P(Date.now()), c = setInterval(() => s.value = Date.now(), 1e3);
			ue(() => clearInterval(c));
			let l = w(() => ye(t.object.metadata.namespace, t.cluster)), d = w(() => [
				{
					key: "name",
					title: "PipelineRun",
					render: (e) => se(n, {
						resource: "tekton.pipelineruns",
						namespace: e.metadata.namespace,
						name: e.metadata.name
					})
				},
				{
					key: "status",
					title: "Status",
					width: 160,
					render: J
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
					render: (e) => q(e, s.value)
				}
			]), p = () => r({
				name: "tekton.pipelineruns.new",
				params: { cluster: t.cluster },
				query: {
					ns: t.object.metadata.namespace ?? "",
					pipeline: t.object.metadata.name
				}
			});
			return (e, t) => (N(), D("div", Ht, [l.value ? (N(), T(L(b), {
				key: 0,
				justify: "end",
				class: "gap"
			}, {
				default: R(() => [A(L(u), {
					size: "small",
					type: "primary",
					"data-test": "pipeline-create-run",
					onClick: p
				}, {
					default: R(() => [...t[0] ||= [k(" Create PipelineRun ", -1)]]),
					_: 1
				})]),
				_: 1
			})) : E("", !0), A(L(f), {
				size: "small",
				columns: d.value,
				data: L(i),
				loading: L(a),
				"row-key": (e) => e.metadata.uid
			}, null, 8, [
				"columns",
				"data",
				"loading",
				"row-key"
			])]));
		}
	});
})), Gt = B((() => {})), Kt = /* @__PURE__ */ V({ default: () => qt }), qt, Jt = B((() => {
	Wt(), Wt(), Gt(), Xe(), qt = /*#__PURE__*/ $(Ut, [["__scopeId", "data-v-7107da21"]]);
})), Yt, Xt, Zt = B((() => {
	Yt = { "data-test": "tekton-parameters" }, Xt = /*@__PURE__*/ j({
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
			return (e, t) => (N(), D("div", Yt, [
				t[0] ||= O("h4", null, "Parameters", -1),
				i.value.length ? (N(), T(L(f), {
					key: 0,
					size: "small",
					columns: o.value,
					data: i.value
				}, null, 8, ["columns", "data"])) : (N(), T(L(m), {
					key: 1,
					size: "small",
					description: "No parameters."
				})),
				t[1] ||= O("h4", null, "Workspaces", -1),
				a.value.length ? (N(), T(L(f), {
					key: 2,
					size: "small",
					columns: s.value,
					data: a.value
				}, null, 8, ["columns", "data"])) : (N(), T(L(m), {
					key: 3,
					size: "small",
					description: "No workspaces."
				}))
			]));
		}
	});
})), Qt = B((() => {})), $t = /* @__PURE__ */ V({ default: () => en }), en, tn = B((() => {
	Zt(), Zt(), Qt(), Xe(), en = /*#__PURE__*/ $(Xt, [["__scopeId", "data-v-e2c1216c"]]);
})), nn, rn, an, on = B((() => {
	ge(), Q(), nn = { class: "reason" }, rn = { class: "hint" }, an = /*@__PURE__*/ j({
		__name: "ImagePullBanner",
		props: {
			cluster: {},
			taskRuns: {},
			pipelineRun: {}
		},
		setup(e) {
			let t = e, n = S(), i = P(!1), a = w(() => t.taskRuns.flatMap((e) => H(e).map((t) => ({
				...t,
				task: e.metadata.labels?.["tekton.dev/pipelineTask"] ?? e.metadata.name
			})))), o = w(() => [...new Set(a.value.map((e) => e.image).filter((e) => !e.startsWith("(")))]), s = w(() => {
				let e = t.pipelineRun;
				return !!e && K(e).running && ye(e.metadata.namespace, t.cluster);
			});
			async function c() {
				let e = t.pipelineRun;
				i.value = !0;
				try {
					await r(t.cluster, Y, "cancel", {
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
			return (t, n) => a.value.length ? (N(), T(L(l), {
				key: 0,
				type: "error",
				title: "Waiting for an image that cannot be pulled",
				class: "pull",
				"data-test": "image-pull-problem"
			}, {
				default: R(() => [
					(N(!0), D(C, null, F(a.value, (t) => (N(), D("div", { key: t.task + t.container }, [
						O("strong", null, I(t.task), 1),
						k(" (" + I(t.container) + "): " + I(L(W)(t, e.cluster)) + " ", 1),
						O("span", nn, I(t.reason), 1)
					]))), 128)),
					O("div", rn, [n[0] ||= k(" The run stays waiting until the image is available or the run times out. On the local k3d clusters, import it on the host: ", -1), (N(!0), D(C, null, F(o.value, (t) => (N(), D("code", {
						key: t,
						class: "cmd"
					}, "docker pull " + I(t) + " && k3d image import " + I(t) + " -c capybara-" + I(e.cluster), 1))), 128))]),
					s.value ? (N(), T(L(u), {
						key: 0,
						size: "small",
						type: "error",
						ghost: "",
						loading: i.value,
						class: "cancel",
						"data-test": "image-pull-cancel",
						onClick: c
					}, {
						default: R(() => [...n[1] ||= [k(" Cancel run ", -1)]]),
						_: 1
					}, 8, ["loading"])) : E("", !0)
				]),
				_: 1
			})) : E("", !0);
		}
	});
})), sn = B((() => {})), cn, ln = B((() => {
	on(), on(), sn(), Xe(), cn = /*#__PURE__*/ $(an, [["__scopeId", "data-v-7a8b8553"]]);
})), un, dn, fn, pn, mn, hn, gn, _n, vn, yn = B((() => {
	ln(), yt(), Q(), un = { "data-test": "tekton-run-logs" }, dn = {
		key: 2,
		class: "split"
	}, fn = {
		class: "tasks",
		role: "listbox"
	}, pn = [
		"aria-selected",
		"data-test",
		"onClick"
	], mn = { class: "name" }, hn = {
		class: "state",
		"data-test": "run-status"
	}, gn = { class: "time" }, _n = { class: "logs" }, vn = /*@__PURE__*/ j({
		__name: "PipelineRunLogsTab",
		props: {
			cluster: {},
			object: {}
		},
		setup(e) {
			let t = e, { items: n, loading: r, error: i } = G().composables.useLiveList(() => ({
				cluster: t.cluster,
				type: Z,
				namespace: t.object.metadata.namespace,
				labelSelector: `tekton.dev/pipelineRun=${t.object.metadata.name}`
			}), { sort: (e, t) => Ae(e) - Ae(t) }), a = P(Date.now()), o = setInterval(() => a.value = Date.now(), 1e3);
			ue(() => clearInterval(o));
			let s = P(null), c = P(!1);
			me(n, (e) => {
				if (c.value && e.some((e) => e.metadata.uid === s.value)) return;
				let t = e.find((e) => K(e).running);
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
			return (t, o) => (N(), D("div", un, [
				A(cn, {
					cluster: e.cluster,
					"task-runs": L(n),
					"pipeline-run": e.object
				}, null, 8, [
					"cluster",
					"task-runs",
					"pipeline-run"
				]),
				L(i) ? (N(), T(L(l), {
					key: 0,
					type: "warning",
					class: "gap"
				}, {
					default: R(() => [k(I(L(i)), 1)]),
					_: 1
				})) : E("", !0),
				!L(r) && !L(n).length ? (N(), T(L(m), {
					key: 1,
					description: "No tasks have started yet."
				})) : (N(), D("div", dn, [O("ul", fn, [(N(!0), D(C, null, F(L(n), (e) => (N(), D("li", {
					key: e.metadata.uid,
					class: M({ chosen: e.metadata.uid === s.value }),
					role: "option",
					"aria-selected": e.metadata.uid === s.value,
					"data-test": `task-${d(e)}`,
					onClick: (t) => p(e)
				}, [
					O("span", {
						class: "dot",
						style: ce({ background: f[L(K)(e).tone] })
					}, null, 4),
					O("span", mn, I(d(e)), 1),
					O("span", hn, I(L(K)(e).text), 1),
					O("span", gn, I(L(q)(e, a.value)), 1)
				], 10, pn))), 128))]), O("div", _n, [u.value ? (N(), T(vt, {
					key: 0,
					cluster: e.cluster,
					"task-run": u.value
				}, null, 8, ["cluster", "task-run"])) : E("", !0)])]))
			]));
		}
	});
})), bn = B((() => {})), xn = /* @__PURE__ */ V({ default: () => Sn }), Sn, Cn = B((() => {
	yn(), yn(), bn(), Xe(), Sn = /*#__PURE__*/ $(vn, [["__scopeId", "data-v-5ebe946e"]]);
})), wn, Tn, En = B((() => {
	ln(), yt(), wn = { "data-test": "tekton-taskrun-logs" }, Tn = /*@__PURE__*/ j({
		__name: "TaskRunLogsTab",
		props: {
			cluster: {},
			object: {}
		},
		setup(e) {
			return (t, n) => (N(), D("div", wn, [A(cn, {
				cluster: e.cluster,
				"task-runs": [e.object]
			}, null, 8, ["cluster", "task-runs"]), A(vt, {
				cluster: e.cluster,
				"task-run": e.object
			}, null, 8, ["cluster", "task-run"])]));
		}
	});
})), Dn = /* @__PURE__ */ V({ default: () => On }), On, kn = B((() => {
	En(), En(), On = Tn;
})), An, jn = B((() => {
	An = /*@__PURE__*/ j({
		__name: "StartRunAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: t }) {
			let n = e, r = t, i = o();
			return le(async () => {
				await i({
					name: "tekton.pipelineruns.new",
					params: { cluster: n.cluster },
					query: {
						ns: n.object.metadata.namespace ?? "",
						pipeline: n.object.metadata.name
					}
				}), r("close");
			}), (e, t) => (N(), D("span"));
		}
	});
})), Mn = /* @__PURE__ */ V({ default: () => Nn }), Nn, Pn = B((() => {
	jn(), jn(), Nn = An;
})), Fn, In = B((() => {
	Q(), Fn = /*@__PURE__*/ j({
		__name: "StartLastRunAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: n }) {
			let i = e, a = n, s = o(), c = i.object.metadata.namespace ?? "", d = P(!0), f = P(null), p = P(null);
			le(async () => {
				try {
					let e = encodeURIComponent(`tekton.dev/pipeline=${i.object.metadata.name}`), t = await fetch(`/api/clusters/${encodeURIComponent(i.cluster)}/k8s/apis/tekton.dev/v1/namespaces/${encodeURIComponent(c)}/pipelineruns?labelSelector=${e}`, { headers: { Accept: "application/json" } }), n = [...(t.ok ? await t.json() : { items: [] }).items].sort((e, t) => Date.parse(t.metadata.creationTimestamp) - Date.parse(e.metadata.creationTimestamp))[0];
					if (!n) {
						f.value = `${i.object.metadata.name} has no runs yet: create one first.`;
						return;
					}
					p.value = n.metadata.name;
					let o = await r(i.cluster, Y, "rerun", {
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
			return (t, n) => (N(), T(L(_), {
				show: !0,
				preset: "card",
				title: `Start the last run of ${e.object.metadata.name}`,
				style: { "max-width": "520px" },
				onClose: n[1] ||= (e) => a("close"),
				onMaskClick: n[2] ||= (e) => a("close")
			}, {
				footer: R(() => [A(L(b), { justify: "end" }, {
					default: R(() => [A(L(u), { onClick: n[0] ||= (e) => a("close") }, {
						default: R(() => [...n[3] ||= [k(" Close ", -1)]]),
						_: 1
					}), f.value ? (N(), T(L(u), {
						key: 0,
						type: "primary",
						"data-test": "start-last-create",
						onClick: m
					}, {
						default: R(() => [...n[4] ||= [k(" Create PipelineRun ", -1)]]),
						_: 1
					})) : E("", !0)]),
					_: 1
				})]),
				default: R(() => [d.value ? (N(), T(L(ie), { key: 0 })) : f.value ? (N(), T(L(l), {
					key: 1,
					type: "error",
					"data-test": "start-last-error"
				}, {
					default: R(() => [k(I(f.value), 1)]),
					_: 1
				})) : E("", !0)]),
				_: 1
			}, 8, ["title"]));
		}
	});
})), Ln = /* @__PURE__ */ V({ default: () => Rn }), Rn, zn = B((() => {
	In(), In(), Rn = Fn;
})), Bn, Vn = B((() => {
	Q(), Bn = /*@__PURE__*/ j({
		__name: "EditAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: t }) {
			let n = e, r = t, i = o();
			return le(async () => {
				let e = ze[n.object.kind ?? ""];
				await i({
					name: `tekton.${e}.edit`,
					params: {
						cluster: n.cluster,
						namespace: n.object.metadata.namespace ?? "",
						name: n.object.metadata.name
					}
				}), r("close");
			}), (e, t) => (N(), D("span"));
		}
	});
})), Hn = /* @__PURE__ */ V({ default: () => Un }), Un, Wn = B((() => {
	Vn(), Vn(), Un = Bn;
})), Gn, Kn, qn, Jn = B((() => {
	Q(), Gn = {
		key: 0,
		"data-test": "rerun-created"
	}, Kn = { key: 0 }, qn = /*@__PURE__*/ j({
		__name: "RerunAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: n }) {
			let i = e, a = n, { ResourceLink: s } = G().components, c = o(), d = P(!1), f = i.object.spec?.pipelineRef?.name;
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
			let m = P(!1), h = P(null), g = P(null);
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
			return (t, n) => (N(), T(L(_), {
				show: !0,
				preset: "card",
				title: `Rerun ${e.object.metadata.name}`,
				style: { "max-width": "520px" },
				onClose: n[1] ||= (e) => a("close"),
				onMaskClick: n[2] ||= (e) => a("close")
			}, {
				footer: R(() => [A(L(b), { justify: "end" }, {
					default: R(() => [A(L(u), { onClick: n[0] ||= (e) => a("close") }, {
						default: R(() => [k(I(g.value ? "Close" : "Cancel"), 1)]),
						_: 1
					}), g.value ? E("", !0) : (N(), T(L(u), {
						key: 0,
						type: "primary",
						loading: m.value,
						"data-test": "confirm",
						onClick: ee
					}, {
						default: R(() => [...n[6] ||= [k(" Rerun ", -1)]]),
						_: 1
					}, 8, ["loading"]))]),
					_: 1
				})]),
				default: R(() => [g.value ? (N(), D("div", Gn, [
					n[3] ||= k(" Started ", -1),
					(N(), T(fe(L(s)), {
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
				])) : (N(), D(C, { key: 1 }, [O("p", null, " Starts a new PipelineRun with the same pipeline, parameters, workspaces and service account (" + I(e.object.spec?.taskRunTemplate?.serviceAccountName ?? "default") + "). ", 1), h.value ? (N(), T(L(l), {
					key: 0,
					type: "error",
					"data-test": "rerun-error"
				}, {
					default: R(() => [k(I(h.value) + " ", 1), d.value && L(f) ? (N(), D("div", Kn, [A(L(u), {
						size: "small",
						class: "start-new",
						"data-test": "rerun-start-new",
						onClick: p
					}, {
						default: R(() => [...n[5] ||= [k(" Start a new run as pipeline ", -1)]]),
						_: 1
					})])) : E("", !0)]),
					_: 1
				})) : E("", !0)], 64))]),
				_: 1
			}, 8, ["title"]));
		}
	});
})), Yn = B((() => {})), Xn = /* @__PURE__ */ V({ default: () => Zn }), Zn, Qn = B((() => {
	Jn(), Jn(), Yn(), Xe(), Zn = /*#__PURE__*/ $(qn, [["__scopeId", "data-v-db36ac4d"]]);
})), $n, er = B((() => {
	Q(), $n = /*@__PURE__*/ j({
		__name: "StopAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: t }) {
			let n = e, i = t, a = S(), o = P(!1), s = w(() => K(n.object).running);
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
			return (t, n) => (N(), T(L(_), {
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
				default: R(() => [s.value ? (N(), D(C, { key: 0 }, [k(" No new tasks start; tasks already running and the finally tasks finish. To stop everything at once, use Cancel run. ")], 64)) : (N(), D(C, { key: 1 }, [k(" It is " + I(L(K)(e.object).text) + "; there is nothing to stop. ", 1)], 64))]),
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
})), tr = /* @__PURE__ */ V({ default: () => nr }), nr, rr = B((() => {
	er(), er(), nr = $n;
})), ir, ar, or = B((() => {
	Q(), ir = {
		key: 0,
		"data-test": "cleanup-preview"
	}, ar = /*@__PURE__*/ j({
		__name: "CleanupAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: t }) {
			let n = e, r = t, a = S(), o = P(10), s = P(null), c = P(!1), d = P(null), f = n.object.metadata.namespace ?? "";
			async function p() {
				d.value = null;
				try {
					s.value = (await i.cleanup(n.cluster, Y, "pipelineruns", f, {
						keep: o.value,
						group: n.object.metadata.name,
						dryRun: !0
					})).deleted;
				} catch (e) {
					d.value = e instanceof Error ? e.message : String(e);
				}
			}
			le(p), me(o, p);
			async function m() {
				c.value = !0;
				try {
					let { deleted: e } = await i.cleanup(n.cluster, Y, "pipelineruns", f, {
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
			return (t, n) => (N(), T(L(_), {
				show: !0,
				preset: "card",
				title: `Clean up runs of ${e.object.metadata.name}`,
				style: { "max-width": "560px" },
				onClose: n[2] ||= (e) => r("close"),
				onMaskClick: n[3] ||= (e) => r("close")
			}, {
				footer: R(() => [A(L(b), { justify: "end" }, {
					default: R(() => [A(L(u), { onClick: n[1] ||= (e) => r("close") }, {
						default: R(() => [...n[6] ||= [k(" Cancel ", -1)]]),
						_: 1
					}), A(L(u), {
						type: "error",
						disabled: !s.value?.length,
						loading: c.value,
						"data-test": "cleanup-confirm",
						onClick: m
					}, {
						default: R(() => [k(" Delete " + I(s.value?.length ?? 0) + " run(s) ", 1)]),
						_: 1
					}, 8, ["disabled", "loading"])]),
					_: 1
				})]),
				default: R(() => [
					A(L(b), { align: "center" }, {
						default: R(() => [
							n[4] ||= k(" Keep the newest ", -1),
							A(L(ne), {
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
					s.value ? (N(), D("p", ir, [s.value.length ? (N(), D(C, { key: 0 }, [k(I(s.value.length) + " run(s) will be deleted: " + I(s.value.join(", ")), 1)], 64)) : (N(), D(C, { key: 1 }, [k(" Nothing to delete. ")], 64))])) : E("", !0),
					d.value ? (N(), T(L(l), {
						key: 1,
						type: "error"
					}, {
						default: R(() => [k(I(d.value), 1)]),
						_: 1
					})) : E("", !0)
				]),
				_: 1
			}, 8, ["title"]));
		}
	});
})), sr = /* @__PURE__ */ V({ default: () => cr }), cr, lr = B((() => {
	or(), or(), cr = ar;
})), ur, dr = B((() => {
	Q(), ur = /*@__PURE__*/ j({
		__name: "CancelAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: t }) {
			let n = e, i = t, a = S(), o = P(!1), s = w(() => K(n.object).running);
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
			return (t, n) => (N(), T(L(_), {
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
				default: R(() => [s.value ? (N(), D(C, { key: 0 }, [k(" Running tasks are stopped and the run ends as Cancelled. ")], 64)) : (N(), D(C, { key: 1 }, [k(" It is " + I(L(K)(e.object).text) + "; there is nothing to cancel. ", 1)], 64))]),
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
})), fr = /* @__PURE__ */ V({ default: () => pr }), pr, mr = B((() => {
	dr(), dr(), pr = ur;
})), hr, gr, _r = B((() => {
	Q(), hr = { key: 0 }, gr = /*@__PURE__*/ j({
		__name: "DeleteAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: t }) {
			let n = e, r = t, a = o(), s = w(() => n.object.kind ?? ""), c = w(() => s.value === "PipelineRun" || s.value === "TaskRun"), d = P(""), f = P(!1), p = P(null), m = P([]);
			le(async () => {
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
					await i.remove(n.cluster, Y, ze[s.value], e.namespace ?? "", e.name, e.uid), r("close"), await a({
						name: `tekton.${ze[s.value]}.list`,
						params: { cluster: n.cluster },
						query: { ns: e.namespace ?? "" }
					});
				} catch (e) {
					p.value = e instanceof Error ? e.message : String(e);
				} finally {
					f.value = !1;
				}
			}
			return (t, n) => (N(), T(L(_), {
				show: !0,
				preset: "card",
				title: `Delete ${s.value} ${e.object.metadata.name}?`,
				style: { "max-width": "520px" },
				onClose: n[2] ||= (e) => r("close"),
				onMaskClick: n[3] ||= (e) => r("close")
			}, {
				footer: R(() => [A(L(b), { justify: "end" }, {
					default: R(() => [A(L(u), { onClick: n[1] ||= (e) => r("close") }, {
						default: R(() => [...n[6] ||= [k(" Cancel ", -1)]]),
						_: 1
					}), A(L(u), {
						type: "error",
						disabled: !h.value,
						loading: f.value,
						"data-test": "delete-confirm",
						onClick: g
					}, {
						default: R(() => [...n[7] ||= [k(" Delete ", -1)]]),
						_: 1
					}, 8, ["disabled", "loading"])]),
					_: 1
				})]),
				default: R(() => [c.value ? (N(), D("p", hr, " The run" + I(s.value === "PipelineRun" ? ", its TaskRuns" : "") + " and their pods are removed (with their logs). ", 1)) : (N(), D(C, { key: 1 }, [
					m.value.length ? (N(), T(L(l), {
						key: 0,
						type: "warning",
						class: "gap",
						"data-test": "delete-used-by"
					}, {
						default: R(() => [k(" Used by " + I(m.value.join(", ")) + ": their next runs will fail until it exists again. ", 1)]),
						_: 1
					})) : E("", !0),
					O("p", null, [
						n[4] ||= k("Type ", -1),
						O("strong", null, I(e.object.metadata.name), 1),
						n[5] ||= k(" to delete it.", -1)
					]),
					A(L(te), {
						value: d.value,
						"onUpdate:value": n[0] ||= (e) => d.value = e,
						"data-test": "delete-confirm-name"
					}, null, 8, ["value"])
				], 64)), p.value ? (N(), T(L(l), {
					key: 2,
					type: "error",
					class: "gap"
				}, {
					default: R(() => [k(I(p.value), 1)]),
					_: 1
				})) : E("", !0)]),
				_: 1
			}, 8, ["title"]));
		}
	});
})), vr = B((() => {})), yr = /* @__PURE__ */ V({ default: () => br }), br, xr = B((() => {
	_r(), _r(), vr(), Xe(), br = /*#__PURE__*/ $(gr, [["__scopeId", "data-v-d99fe515"]]);
})), Sr, Cr, wr, Tr, Er, Dr, Or = B((() => {
	Q(), Sr = { "data-test": "tekton-project-card" }, Cr = { key: 0 }, wr = { key: 3 }, Tr = { class: "muted" }, Er = { class: "muted" }, Dr = /*@__PURE__*/ j({
		__name: "ProjectRunsCard",
		props: {
			cluster: {},
			project: {}
		},
		setup(e) {
			let t = e, { ResourceLink: n } = G().components, { items: r, loading: i, error: a } = G().composables.useLiveList(() => ({
				cluster: t.cluster,
				type: we,
				namespace: t.project.spec.namespace
			}), {
				sort: je,
				max: 5
			}), o = P(Date.now()), s = setInterval(() => o.value = Date.now(), 1e3);
			return ue(() => clearInterval(s)), (t, s) => (N(), D("div", Sr, [L(a) ? (N(), D("span", Cr, I(L(a)), 1)) : L(i) ? (N(), T(L(ie), {
				key: 1,
				size: "small"
			})) : L(r).length ? (N(), D("table", wr, [(N(!0), D(C, null, F(L(r), (t) => (N(), D("tr", { key: t.metadata.uid }, [
				O("td", null, [(N(), T(fe(L(n)), {
					cluster: e.cluster,
					resource: "tekton.pipelineruns",
					namespace: t.metadata.namespace,
					name: t.metadata.name
				}, null, 8, [
					"cluster",
					"namespace",
					"name"
				]))]),
				O("td", Tr, I(L(Se)(t)), 1),
				O("td", null, [(N(), T(fe(L(J)(t))))]),
				O("td", Er, I(L(q)(t, o.value)), 1)
			]))), 128))])) : (N(), T(L(m), {
				key: 2,
				size: "small",
				description: "No pipeline runs in this Project yet."
			}))]));
		}
	});
})), kr = B((() => {})), Ar = /* @__PURE__ */ V({ default: () => jr }), jr, Mr = B((() => {
	Or(), Or(), kr(), Xe(), jr = /*#__PURE__*/ $(Dr, [["__scopeId", "data-v-0c4eea02"]]);
}));
//#endregion
//#region src/index.ts
Q();
var Nr = (e, t) => ye(e.metadata.namespace, t.cluster), Pr = n({
	name: "tekton",
	apiVersion: e,
	minApi: "1.2",
	register(e) {
		_e(e), ve(), e.register({
			type: "nav-section",
			id: "tekton.section",
			label: "Pipelines",
			order: 45
		}), e.registerResource(Fe, {
			order: 10,
			section: "tekton.section"
		}), e.registerResource(Ie, {
			order: 20,
			section: "tekton.section"
		}), e.registerResource(Le, {
			order: 30,
			section: "tekton.section"
		}), e.registerResource(Re, {
			order: 40,
			section: "tekton.section"
		});
		let t = () => Promise.resolve().then(() => ($e(), Ze)), n = () => Promise.resolve().then(() => (dt(), lt));
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
			component: () => Promise.resolve().then(() => (It(), Pt))
		}), e.register({
			type: "resource-detail-tab",
			id: "tekton.tab.taskruns",
			label: "TaskRuns",
			order: 22,
			kinds: ["PipelineRun"],
			component: () => Promise.resolve().then(() => (Vt(), zt))
		}), e.register({
			type: "resource-detail-tab",
			id: "tekton.tab.pipelineruns",
			label: "PipelineRuns",
			order: 22,
			kinds: ["Pipeline"],
			component: () => Promise.resolve().then(() => (Jt(), Kt))
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
			component: () => Promise.resolve().then(() => (tn(), $t))
		}), e.register({
			type: "resource-detail-tab",
			id: "tekton.tab.logs",
			label: "Logs",
			order: 26,
			kinds: ["PipelineRun"],
			component: () => Promise.resolve().then(() => (Cn(), xn))
		}), e.register({
			type: "resource-detail-tab",
			id: "tekton.tab.taskrun-logs",
			label: "Logs",
			order: 26,
			kinds: ["TaskRun"],
			component: () => Promise.resolve().then(() => (kn(), Dn))
		}), e.register({
			type: "resource-action",
			id: "tekton.action.start",
			label: "Start",
			order: 5,
			kinds: ["Pipeline"],
			appliesTo: Nr,
			component: () => Promise.resolve().then(() => (Pn(), Mn))
		}), e.register({
			type: "resource-action",
			id: "tekton.action.start-last",
			label: "Start last run",
			order: 6,
			kinds: ["Pipeline"],
			appliesTo: Nr,
			component: () => Promise.resolve().then(() => (zn(), Ln))
		}), e.register({
			type: "resource-action",
			id: "tekton.action.edit",
			label: "Edit",
			order: 10,
			kinds: ["Task", "Pipeline"],
			appliesTo: Nr,
			component: () => Promise.resolve().then(() => (Wn(), Hn))
		}), e.register({
			type: "resource-action",
			id: "tekton.action.rerun",
			label: "Rerun",
			order: 15,
			kinds: ["PipelineRun"],
			appliesTo: Nr,
			component: () => Promise.resolve().then(() => (Qn(), Xn))
		}), e.register({
			type: "resource-action",
			id: "tekton.action.stop",
			label: "Stop",
			order: 16,
			kinds: ["PipelineRun"],
			appliesTo: Nr,
			component: () => Promise.resolve().then(() => (rr(), tr))
		}), e.register({
			type: "resource-action",
			id: "tekton.action.cleanup",
			label: "Clean up runs",
			order: 30,
			kinds: ["Pipeline"],
			appliesTo: Nr,
			component: () => Promise.resolve().then(() => (lr(), sr))
		}), e.register({
			type: "resource-action",
			id: "tekton.action.cancel",
			label: "Cancel run",
			order: 17,
			danger: !0,
			kinds: ["PipelineRun"],
			appliesTo: Nr,
			component: () => Promise.resolve().then(() => (mr(), fr))
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
			appliesTo: Nr,
			component: () => Promise.resolve().then(() => (xr(), yr))
		}), e.register({
			type: "project-overview-card",
			id: "tekton.card.runs",
			title: "Pipeline runs",
			order: 30,
			component: () => Promise.resolve().then(() => (Mr(), Ar))
		});
	}
});
//#endregion
export { Pr as default };
