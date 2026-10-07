if(typeof document!=='undefined'){const s=document.createElement('style');s.dataset.plugin="tekton";s.textContent=".gap[data-v-733e398e]{margin-bottom:12px}h4[data-v-733e398e]{margin:8px 0}[data-v-733e398e] .selected td{background:var(--n-td-color-hover)}table[data-v-0c4eea02]{border-collapse:collapse;width:100%}td[data-v-0c4eea02]{white-space:nowrap;padding:4px 8px 4px 0}td[data-v-0c4eea02]:first-child{text-overflow:ellipsis;max-width:220px;overflow:hidden}.muted[data-v-0c4eea02]{opacity:.7;font-size:12px}\n/*$vite$:1*/";document.head.appendChild(s)}
import { EXTENSION_API_VERSION as e, definePlugin as t, pluginAction as n } from "@capybara/sdk";
import { NAlert as r, NButton as i, NDataTable as a, NEmpty as o, NModal as s, NSpace as c, NSpin as l, NTag as u, useMessage as d } from "naive-ui";
import { Fragment as f, computed as p, createBlock as m, createCommentVNode as h, createElementBlock as g, createElementVNode as _, createTextVNode as v, createVNode as y, defineComponent as b, h as x, onScopeDispose as ee, openBlock as S, ref as C, renderList as w, resolveDynamicComponent as T, toDisplayString as E, unref as D, watch as te, withCtx as O } from "vue";
//#region \0rolldown/runtime.js
var k = Object.defineProperty, A = (e, t, n) => () => {
	if (n) throw n[0];
	try {
		return e && (t = e(e = 0)), t;
	} catch (e) {
		throw n = [e], e;
	}
}, j = (e, t) => {
	let n = {};
	for (var r in e) k(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || k(n, Symbol.toStringTag, { value: "Module" }), n;
};
//#endregion
//#region src/tekton.ts
function ne(e) {
	L = e;
}
function M() {
	if (!L) throw Error("tekton plugin is not registered");
	return L;
}
function N(e) {
	let t = (e.status?.conditions ?? []).find((e) => e.type === "Succeeded");
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
function re(e) {
	return (e.status?.conditions ?? []).find((e) => e.type === "Succeeded")?.message ?? "";
}
function P(e, t) {
	let n = Date.parse(e.status?.startTime ?? "");
	if (!n) return "—";
	let r = Date.parse(e.status?.completionTime ?? "") || t, i = Math.max(0, Math.round((r - n) / 1e3));
	if (i < 60) return `${i}s`;
	let a = Math.floor(i / 60);
	return a < 60 ? `${a}m ${String(i % 60).padStart(2, "0")}s` : `${Math.floor(a / 60)}h ${String(a % 60).padStart(2, "0")}m`;
}
function F(e) {
	return e.spec?.pipelineRef?.name ?? (e.spec?.pipelineSpec ? "(inline)" : "—");
}
function I(e) {
	let t = N(e);
	return x(u, {
		size: "small",
		type: t.tone,
		bordered: !1,
		"data-test": "run-status"
	}, () => t.text);
}
var L, R, z, B, V, H, ie, U, W, G, K, q, J = A((() => {
	L = null, R = (e, t) => ({
		group: "tekton.dev",
		version: "v1",
		plural: e,
		kind: t,
		namespaced: !0
	}), z = R("pipelineruns", "PipelineRun"), B = R("taskruns", "TaskRun"), V = R("pipelines", "Pipeline"), H = (e) => Date.parse(e.status?.startTime ?? "") || Date.parse(e.metadata.creationTimestamp) || 0, ie = (e, t) => H(t) - H(e), U = (e, t, n) => n ? x(M().components.ResourceLink, {
		resource: e,
		namespace: t.metadata.namespace,
		name: n
	}) : "—", W = "Capybara's account on this cluster lacks the Pipelines console permissions: reinstall or reconnect the plugin.", G = {
		id: "tekton.pipelineruns",
		type: z,
		label: "PipelineRuns",
		singular: "PipelineRun",
		path: "tekton/pipelineruns",
		columns: [
			{
				key: "status",
				title: "Status",
				width: 140,
				ellipsis: !1,
				render: I,
				sortValue: (e) => N(e).text
			},
			{
				key: "pipeline",
				title: "Pipeline",
				minWidth: 140,
				render: (e) => e.spec?.pipelineRef?.name ? U("tekton.pipelines", e, e.spec.pipelineRef.name) : F(e),
				sortValue: F
			},
			{
				key: "started",
				title: "Started",
				width: 180,
				render: (e) => e.status?.startTime ? new Date(e.status.startTime).toLocaleString() : "—",
				sortValue: H
			},
			{
				key: "duration",
				title: "Duration",
				width: 100,
				render: (e, t) => P(e, t)
			}
		],
		status: (e) => N(e),
		overview: [
			{
				label: "Pipeline",
				render: (e) => e.spec?.pipelineRef?.name ? U("tekton.pipelines", e, e.spec.pipelineRef.name) : F(e)
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
				render: (e) => P(e, Date.now())
			},
			{
				label: "Message",
				render: (e) => re(e) || "—"
			},
			{
				label: "Rerun of",
				render: (e) => U("tekton.pipelineruns", e, e.metadata.annotations?.["platform.capybara.io/copy-of"])
			}
		],
		forbiddenHint: W
	}, K = {
		id: "tekton.taskruns",
		type: B,
		label: "TaskRuns",
		singular: "TaskRun",
		path: "tekton/taskruns",
		columns: [
			{
				key: "status",
				title: "Status",
				width: 140,
				ellipsis: !1,
				render: I,
				sortValue: (e) => N(e).text
			},
			{
				key: "pipelinerun",
				title: "PipelineRun",
				minWidth: 160,
				render: (e) => U("tekton.pipelineruns", e, e.metadata.labels?.["tekton.dev/pipelineRun"])
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
				render: (e, t) => P(e, t)
			}
		],
		status: (e) => N(e),
		overview: [
			{
				label: "PipelineRun",
				render: (e) => U("tekton.pipelineruns", e, e.metadata.labels?.["tekton.dev/pipelineRun"])
			},
			{
				label: "Pod",
				render: (e) => U("core.pods", e, e.status?.podName)
			},
			{
				label: "Duration",
				render: (e) => P(e, Date.now())
			},
			{
				label: "Message",
				render: (e) => re(e) || "—"
			}
		],
		forbiddenHint: W
	}, q = {
		id: "tekton.pipelines",
		type: V,
		label: "Pipelines",
		singular: "Pipeline",
		path: "tekton/pipelines",
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
		forbiddenHint: W
	};
})), Y, X = A((() => {
	J(), Y = /*@__PURE__*/ b({
		__name: "TaskRunLogs",
		props: {
			cluster: {},
			taskRun: {}
		},
		setup(e) {
			let t = e, { LogViewer: n } = M().components, i = p(() => t.taskRun.status?.podName ?? ""), a = p(() => t.taskRun.status?.steps ?? []), o = p(() => a.value.map((e) => ({
				label: e.name,
				value: e.container
			}))), s = p(() => a.value.map((e) => e.terminated ? "t" : e.running ? "r" : "w").join(""));
			return (t, a) => !i.value || !o.value.length ? (S(), m(D(r), {
				key: 0,
				type: "info",
				bordered: !1
			}, {
				default: O(() => [...a[0] ||= [v(" The TaskRun has no pod yet: logs show once its steps start. ", -1)]]),
				_: 1
			})) : (S(), m(T(D(n)), {
				key: `${i.value}/${s.value}`,
				cluster: e.cluster,
				namespace: e.taskRun.metadata.namespace ?? "",
				pod: i.value,
				containers: o.value
			}, null, 8, [
				"cluster",
				"namespace",
				"pod",
				"containers"
			]));
		}
	});
})), Z, ae = A((() => {
	X(), X(), Z = Y;
})), oe, se, ce = A((() => {
	ae(), J(), oe = { "data-test": "tekton-tasks" }, se = /*@__PURE__*/ b({
		__name: "PipelineRunTasksTab",
		props: {
			cluster: {},
			object: {}
		},
		setup(e) {
			let t = e, { ResourceLink: n } = M().components, { items: i, loading: s, error: c } = M().composables.useLiveList(() => ({
				cluster: t.cluster,
				type: B,
				namespace: t.object.metadata.namespace,
				labelSelector: `tekton.dev/pipelineRun=${t.object.metadata.name}`
			}), { sort: (e, t) => H(e) - H(t) }), l = C(Date.now()), u = setInterval(() => l.value = Date.now(), 1e3);
			ee(() => clearInterval(u));
			let d = C(null), b = C(!1);
			te(i, (e) => {
				if (b.value && e.some((e) => e.metadata.uid === d.value)) return;
				let t = e.find((e) => N(e).running);
				d.value = (t ?? e.at(-1))?.metadata.uid ?? null;
			});
			let w = p(() => i.value.find((e) => e.metadata.uid === d.value) ?? null), T = (e) => e.metadata.labels?.["tekton.dev/pipelineTask"] ?? e.metadata.name, k = p(() => [
				{
					key: "task",
					title: "Task",
					render: (e) => T(e)
				},
				{
					key: "status",
					title: "Status",
					width: 140,
					render: I
				},
				{
					key: "duration",
					title: "Duration",
					width: 100,
					render: (e) => P(e, l.value)
				},
				{
					key: "name",
					title: "TaskRun",
					ellipsis: { tooltip: !0 },
					render: (e) => x(n, {
						resource: "tekton.taskruns",
						namespace: e.metadata.namespace,
						name: e.metadata.name
					})
				}
			]), A = (e) => ({
				style: "cursor: pointer",
				"data-test": `task-${T(e)}`,
				onClick: () => {
					d.value = e.metadata.uid, b.value = !0;
				}
			}), j = (e) => e.metadata.uid === d.value ? "selected" : "";
			return (t, n) => (S(), g("div", oe, [
				D(c) ? (S(), m(D(r), {
					key: 0,
					type: "warning",
					class: "gap"
				}, {
					default: O(() => [v(E(D(c)), 1)]),
					_: 1
				})) : h("", !0),
				y(D(a), {
					size: "small",
					columns: k.value,
					data: D(i),
					loading: D(s),
					"row-key": (e) => e.metadata.uid,
					"row-props": A,
					"row-class-name": j,
					class: "gap"
				}, null, 8, [
					"columns",
					"data",
					"loading",
					"row-key"
				]),
				w.value ? (S(), g(f, { key: 1 }, [_("h4", null, "Logs: " + E(T(w.value)), 1), y(Z, {
					cluster: e.cluster,
					"task-run": w.value
				}, null, 8, ["cluster", "task-run"])], 64)) : D(s) ? h("", !0) : (S(), m(D(o), {
					key: 2,
					description: "No TaskRuns yet."
				}))
			]));
		}
	});
})), le = A((() => {})), Q, ue = A((() => {
	Q = (e, t) => {
		let n = e.__vccOpts || e;
		for (let [e, r] of t) n[e] = r;
		return n;
	};
})), de = /* @__PURE__ */ j({ default: () => fe }), fe, pe = A((() => {
	ce(), ce(), le(), ue(), fe = /*#__PURE__*/ Q(se, [["__scopeId", "data-v-733e398e"]]);
})), me, he, ge = A((() => {
	ae(), me = { "data-test": "tekton-taskrun-logs" }, he = /*@__PURE__*/ b({
		__name: "TaskRunLogsTab",
		props: {
			cluster: {},
			object: {}
		},
		setup(e) {
			return (t, n) => (S(), g("div", me, [y(Z, {
				cluster: e.cluster,
				"task-run": e.object
			}, null, 8, ["cluster", "task-run"])]));
		}
	});
})), _e = /* @__PURE__ */ j({ default: () => ve }), ve, ye = A((() => {
	ge(), ge(), ve = he;
})), be, xe, Se = A((() => {
	J(), be = {
		key: 0,
		"data-test": "rerun-created"
	}, xe = /*@__PURE__*/ b({
		__name: "RerunAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: t }) {
			let a = e, o = t, { ResourceLink: l } = M().components, u = C(!1), d = C(null), p = C(null);
			async function b() {
				u.value = !0, d.value = null;
				try {
					let e = a.object.metadata;
					p.value = await n(a.cluster, "tekton", "rerun", {
						namespace: e.namespace,
						name: e.name,
						uid: e.uid
					});
				} catch (e) {
					d.value = e instanceof Error ? e.message : String(e);
				} finally {
					u.value = !1;
				}
			}
			return (t, n) => (S(), m(D(s), {
				show: !0,
				preset: "card",
				title: `Rerun ${e.object.metadata.name}`,
				style: { "max-width": "520px" },
				onClose: n[1] ||= (e) => o("close"),
				onMaskClick: n[2] ||= (e) => o("close")
			}, {
				footer: O(() => [y(D(c), { justify: "end" }, {
					default: O(() => [y(D(i), { onClick: n[0] ||= (e) => o("close") }, {
						default: O(() => [v(E(p.value ? "Close" : "Cancel"), 1)]),
						_: 1
					}), p.value ? h("", !0) : (S(), m(D(i), {
						key: 0,
						type: "primary",
						loading: u.value,
						"data-test": "confirm",
						onClick: b
					}, {
						default: O(() => [...n[5] ||= [v(" Rerun ", -1)]]),
						_: 1
					}, 8, ["loading"]))]),
					_: 1
				})]),
				default: O(() => [p.value ? (S(), g("div", be, [
					n[3] ||= v(" Started ", -1),
					(S(), m(T(D(l)), {
						cluster: e.cluster,
						resource: "tekton.pipelineruns",
						namespace: e.object.metadata.namespace,
						name: p.value
					}, null, 8, [
						"cluster",
						"namespace",
						"name"
					])),
					n[4] ||= v(". ", -1)
				])) : (S(), g(f, { key: 1 }, [_("p", null, " Starts a new PipelineRun with the same pipeline, parameters, workspaces and service account (" + E(e.object.spec?.taskRunTemplate?.serviceAccountName ?? "default") + "). ", 1), d.value ? (S(), m(D(r), {
					key: 0,
					type: "error"
				}, {
					default: O(() => [v(E(d.value), 1)]),
					_: 1
				})) : h("", !0)], 64))]),
				_: 1
			}, 8, ["title"]));
		}
	});
})), Ce = /* @__PURE__ */ j({ default: () => we }), we, Te = A((() => {
	Se(), Se(), we = xe;
})), Ee, De = A((() => {
	J(), Ee = /*@__PURE__*/ b({
		__name: "CancelAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: t }) {
			let r = e, i = t, a = d(), o = C(!1), c = p(() => N(r.object).running);
			async function l() {
				if (!c.value) return i("close"), !0;
				o.value = !0;
				try {
					let e = r.object.metadata;
					await n(r.cluster, "tekton", "cancel", {
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
			return (t, n) => (S(), m(D(s), {
				show: !0,
				preset: "dialog",
				type: c.value ? "warning" : "info",
				title: c.value ? `Cancel ${e.object.metadata.name}?` : `${e.object.metadata.name} has finished`,
				"positive-text": c.value ? "Cancel run" : "Close",
				"negative-text": c.value ? "Keep running" : void 0,
				loading: o.value,
				"positive-button-props": { "data-test": "confirm" },
				onPositiveClick: l,
				onNegativeClick: n[0] ||= (e) => i("close"),
				onClose: n[1] ||= (e) => i("close"),
				onMaskClick: n[2] ||= (e) => i("close")
			}, {
				default: O(() => [c.value ? (S(), g(f, { key: 0 }, [v(" Running tasks are stopped and the run ends as Cancelled. ")], 64)) : (S(), g(f, { key: 1 }, [v(" It is " + E(D(N)(e.object).text) + "; there is nothing to cancel. ", 1)], 64))]),
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
})), Oe = /* @__PURE__ */ j({ default: () => ke }), ke, Ae = A((() => {
	De(), De(), ke = Ee;
})), $, je, Me, Ne, Pe, Fe, Ie = A((() => {
	J(), $ = { "data-test": "tekton-project-card" }, je = { key: 0 }, Me = { key: 3 }, Ne = { class: "muted" }, Pe = { class: "muted" }, Fe = /*@__PURE__*/ b({
		__name: "ProjectRunsCard",
		props: {
			cluster: {},
			project: {}
		},
		setup(e) {
			let t = e, { ResourceLink: n } = M().components, { items: r, loading: i, error: a } = M().composables.useLiveList(() => ({
				cluster: t.cluster,
				type: z,
				namespace: t.project.spec.namespace
			}), {
				sort: ie,
				max: 5
			}), s = C(Date.now()), c = setInterval(() => s.value = Date.now(), 1e3);
			return ee(() => clearInterval(c)), (t, c) => (S(), g("div", $, [D(a) ? (S(), g("span", je, E(D(a)), 1)) : D(i) ? (S(), m(D(l), {
				key: 1,
				size: "small"
			})) : D(r).length ? (S(), g("table", Me, [(S(!0), g(f, null, w(D(r), (t) => (S(), g("tr", { key: t.metadata.uid }, [
				_("td", null, [(S(), m(T(D(n)), {
					cluster: e.cluster,
					resource: "tekton.pipelineruns",
					namespace: t.metadata.namespace,
					name: t.metadata.name
				}, null, 8, [
					"cluster",
					"namespace",
					"name"
				]))]),
				_("td", Ne, E(D(F)(t)), 1),
				_("td", null, [(S(), m(T(D(I)(t))))]),
				_("td", Pe, E(D(P)(t, s.value)), 1)
			]))), 128))])) : (S(), m(D(o), {
				key: 2,
				size: "small",
				description: "No pipeline runs in this Project yet."
			}))]));
		}
	});
})), Le = A((() => {})), Re = /* @__PURE__ */ j({ default: () => ze }), ze, Be = A((() => {
	Ie(), Ie(), Le(), ue(), ze = /*#__PURE__*/ Q(Fe, [["__scopeId", "data-v-0c4eea02"]]);
}));
//#endregion
//#region src/index.ts
J();
var Ve = t({
	name: "tekton",
	apiVersion: e,
	minApi: "1.1",
	register(e) {
		ne(e), e.register({
			type: "nav-section",
			id: "tekton.section",
			label: "Pipelines",
			order: 45
		}), e.registerResource(G, {
			order: 10,
			section: "tekton.section"
		}), e.registerResource(K, {
			order: 20,
			section: "tekton.section"
		}), e.registerResource(q, {
			order: 30,
			section: "tekton.section"
		}), e.register({
			type: "resource-detail-tab",
			id: "tekton.tab.tasks",
			label: "Tasks",
			order: 15,
			kinds: ["PipelineRun"],
			component: () => Promise.resolve().then(() => (pe(), de))
		}), e.register({
			type: "resource-detail-tab",
			id: "tekton.tab.logs",
			label: "Logs",
			order: 40,
			kinds: ["TaskRun"],
			component: () => Promise.resolve().then(() => (ye(), _e))
		}), e.register({
			type: "resource-action",
			id: "tekton.action.rerun",
			label: "Rerun",
			order: 15,
			kinds: ["PipelineRun"],
			component: () => Promise.resolve().then(() => (Te(), Ce))
		}), e.register({
			type: "resource-action",
			id: "tekton.action.cancel",
			label: "Cancel run",
			order: 16,
			danger: !0,
			kinds: ["PipelineRun"],
			component: () => Promise.resolve().then(() => (Ae(), Oe))
		}), e.register({
			type: "project-overview-card",
			id: "tekton.card.runs",
			title: "Pipeline runs",
			order: 30,
			component: () => Promise.resolve().then(() => (Be(), Re))
		});
	}
});
//#endregion
export { Ve as default };
