if(typeof document!=='undefined'){const s=document.createElement('style');s.dataset.plugin="argocd";s.textContent=".title[data-v-26cd17b7]{margin:0 0 16px}.toolbar[data-v-26cd17b7]{margin-bottom:12px}.select[data-v-26cd17b7]{width:240px}.form[data-v-26cd17b7]{max-width:760px}.muted[data-v-26cd17b7]{opacity:.7;font-size:12px}.gap[data-v-26cd17b7]{margin-top:12px}.gap-bottom[data-v-26cd17b7],.gap[data-v-a0aeab4a]{margin-bottom:12px}.hint[data-v-a0aeab4a]{margin-top:6px;font-weight:500}.gap[data-v-31fa413f]{margin-bottom:12px}.muted[data-v-31fa413f]{opacity:.6;font-size:12px}.space[data-v-a95e9d59]{margin-left:6px}.gap[data-v-a95e9d59]{margin-top:12px}.gap[data-v-51626dfb]{margin-bottom:12px}.gap-top[data-v-51626dfb]{margin-top:12px}.row[data-v-44c35b2d]{align-items:center;gap:12px;margin-bottom:12px;display:flex}.gap[data-v-44c35b2d]{margin:12px 0}.gap[data-v-a9a29bfc]{margin-bottom:12px}.gap-top[data-v-a9a29bfc]{margin-top:12px}table[data-v-2b5493ad]{border-collapse:collapse;width:100%}td[data-v-2b5493ad]{white-space:nowrap;padding:4px 8px 4px 0}.muted[data-v-2b5493ad]{opacity:.7;margin-top:6px;font-size:12px}.gap[data-v-2b5493ad]{margin-bottom:8px}\n/*$vite$:1*/";document.head.appendChild(s)}
import { EXTENSION_API_VERSION as e, PluginRequestError as t, definePlugin as n, pluginAction as r, pluginObjects as i, useCluster as a, useNavigate as o, useParams as s, useQuery as c } from "@capybara/sdk";
import { NAlert as l, NButton as u, NCard as d, NCheckbox as f, NDataTable as p, NDescriptions as m, NDescriptionsItem as h, NEmpty as g, NForm as ee, NFormItem as te, NH2 as ne, NInput as _, NModal as re, NRadio as ie, NRadioGroup as ae, NSelect as oe, NSpace as v, NSpin as se, NSwitch as ce, NTag as y, useMessage as b } from "naive-ui";
import { Fragment as x, computed as S, createBlock as C, createCommentVNode as w, createElementBlock as T, createElementVNode as E, createTextVNode as D, createVNode as O, defineComponent as k, h as A, onMounted as le, openBlock as j, ref as M, renderList as ue, resolveDynamicComponent as N, shallowRef as de, toDisplayString as P, unref as F, watch as fe, withCtx as I } from "vue";
//#region \0rolldown/runtime.js
var pe = Object.defineProperty, L = (e, t, n) => () => {
	if (n) throw n[0];
	try {
		return e && (t = e(e = 0)), t;
	} catch (e) {
		throw n = [e], e;
	}
}, R = (e, t) => {
	let n = {};
	for (var r in e) pe(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || pe(n, Symbol.toStringTag, { value: "Module" }), n;
};
//#endregion
//#region src/status.ts
function z(e) {
	if (e.status?.operationState?.phase === "Running") return {
		text: "Syncing",
		tone: "info"
	};
	let t = e.status?.sync?.status ?? "Unknown";
	return {
		text: t,
		tone: t === "Synced" ? "success" : t === "OutOfSync" ? "warning" : "default"
	};
}
function B(e) {
	let t = ("status" in e ? e.status?.health?.status : e.health?.status) ?? "Unknown";
	return {
		text: t,
		tone: {
			Healthy: "success",
			Progressing: "info",
			Suspended: "default",
			Degraded: "error",
			Missing: "warning"
		}[t] ?? "default"
	};
}
function V(e) {
	return e ? /^[0-9a-f]{40}$/.test(e) ? e.slice(0, 7) : e : "—";
}
function H(e) {
	let t = e ?? "";
	return /RoleBinding/.test(t) && /not permitted|is not allowed|blacklist|denied/i.test(t) ? "RoleBindings are refused in Projects: a chart that needs one cannot be deployed through GitOps yet (roles are granted per user from Phase 5)." : /(ResourceQuota|LimitRange|NetworkPolicy)/.test(t) && /not permitted|is not allowed|blacklist/i.test(t) ? "A Project's quota, limits and network policies are set by Capybara; an Application may not change them." : /cluster level|cluster-scoped|cluster scoped/i.test(t) && /not permitted|is not allowed/i.test(t) ? "Cluster-scoped resources (namespaces, CRDs, ClusterRoles, …) are refused: an Application deploys only into its Project namespace." : /namespace .* is not permitted|destination .* is not permitted|not permitted in project/i.test(t) ? "Every resource must go into the Project's own namespace on this cluster." : /exceeded quota|forbidden: exceeded/i.test(t) ? "The Project's quota does not allow it: lower the requests or ask for a larger Project size." : /not permitted to use project|is not allowed to use project|application .* not allowed/i.test(t) ? "Applications in this namespace must use their Project's Argo CD project (capybara-<project>)." : "";
}
function U(e) {
	let t = (e.spec?.sourceNamespaces ?? []).join(", "), n = (e.spec?.destinations ?? []).map((e) => `${e.namespace ?? "*"}${e.server === "https://kubernetes.default.svc" || e.name === "in-cluster" ? "" : ` on ${e.server ?? e.name ?? "?"}`}`).join(", ");
	return {
		sources: t || `${e.metadata.namespace ?? ""} only`,
		destinations: n || "nowhere"
	};
}
function me(e, t = "argocd") {
	let n = e.metadata.annotations?.[W];
	if (n) {
		let e = n.split(":")[0] ?? "";
		if (e) {
			let n = e.indexOf("_");
			return n > 0 ? {
				namespace: e.slice(0, n),
				name: e.slice(n + 1),
				via: "annotation"
			} : {
				namespace: t,
				name: e,
				via: "annotation"
			};
		}
	}
	let r = e.metadata.labels?.["app.kubernetes.io/instance"];
	if (r && e.metadata.labels?.["app.kubernetes.io/managed-by"] !== "Helm") {
		let n = r.indexOf("_");
		return n > 0 ? {
			namespace: r.slice(0, n),
			name: r.slice(n + 1),
			via: "label"
		} : {
			namespace: e.metadata.namespace ?? t,
			name: r,
			via: "label"
		};
	}
	return null;
}
function he(e) {
	return [...e.status?.history ?? []].sort((e, t) => t.id - e.id);
}
function ge(e) {
	return e.spec?.syncPolicy?.automated ? "Auto-sync is on: it would sync back to the target revision. Turn it off first." : e.spec?.sources ? "Applications with several sources cannot be synced to an earlier revision here." : e.operation ? "A sync is in progress." : "";
}
var W, G = L((() => {
	W = "argocd.argoproj.io/tracking-id";
}));
//#endregion
//#region src/argocd.ts
function _e(e) {
	J = e;
}
function ve() {
	if (!J) throw Error("argocd plugin is not registered");
	return J;
}
function ye(e = !1) {
	return je && !e && Date.now() - Me < 6e4 ? je : (Me = Date.now(), je = (async () => {
		try {
			let e = await fetch("/api/projects", { headers: { Accept: "application/json" } });
			if (!e.ok) return;
			let t = await e.json(), n = Array.isArray(t) ? t : t.items ?? [];
			Ae.value = new Map(n.filter((e) => e.status?.phase === "Ready").map((e) => [`${e.spec.cluster}/${e.spec.namespace}`, e.metadata.name]));
		} catch {}
	})(), je);
}
function be(e, t) {
	return ye(), !!e && !!Ae.value?.has(`${t}/${e}`);
}
function xe(e, t) {
	return ye(), e ? Ae.value?.get(`${t}/${e}`) : void 0;
}
function Se(e) {
	return ye(), [...Ae.value?.keys() ?? []].filter((t) => t.startsWith(`${e}/`)).map((t) => t.slice(e.length + 1)).sort();
}
async function Ce(e, t = !1) {
	let n = Fe.get(e) ?? 0;
	if (!(!t && Date.now() - n < 6e4)) {
		Fe.set(e, Date.now());
		try {
			let t = await fetch(`/api/plugins/installations/${encodeURIComponent(`${q}.${e}`)}`, { headers: { Accept: "application/json" } });
			if (!t.ok) return;
			let n = await t.json(), r = n.status.steps?.find((e) => e.name === Ne), i = new Map(Pe.value);
			i.set(e, {
				writable: r?.state === "Done",
				mode: n.spec.mode
			}), Pe.value = i;
		} catch {}
	}
}
function we(e) {
	return e ? (Ce(e), Pe.value.get(e)?.writable ?? !1) : !1;
}
function Te(e) {
	if (!e) return !1;
	Ce(e);
	let t = Pe.value.get(e);
	return !!t && !t.writable;
}
function K(e, t, n) {
	return A(y, {
		size: "small",
		type: t,
		bordered: !1,
		...n ? { "data-test": n } : {}
	}, () => e);
}
async function Ee(e, t, n) {
	let r = `/api/clusters/${encodeURIComponent(e)}/k8s/apis/argoproj.io/v1alpha1/namespaces/${encodeURIComponent(t)}/applications/${encodeURIComponent(n)}`, i = await fetch(r, { headers: { Accept: "application/json" } });
	if (!i.ok) throw Error(`Application ${n} could not be loaded (${i.status})`);
	return await i.json();
}
var q, J, Y, De, Oe, ke, Ae, je, Me, Ne, Pe, Fe, X, Ie, Le, Re, ze, Be, Ve, He, Z = L((() => {
	G(), q = "argocd", J = null, Y = (e, t) => ({
		group: "argoproj.io",
		version: "v1alpha1",
		plural: e,
		kind: t,
		namespaced: !0
	}), De = Y("applications", "Application"), Oe = Y("appprojects", "AppProject"), ke = "resources-finalizer.argocd.argoproj.io", Ae = de(null), je = null, Me = 0, Ne = "apps-in-any-namespace", Pe = de(/* @__PURE__ */ new Map()), Fe = /* @__PURE__ */ new Map(), X = (e) => {
		let t = z(e);
		return K(t.text, t.tone, "app-sync");
	}, Ie = (e) => {
		let t = B(e);
		return K(t.text, t.tone, "app-health");
	}, Le = (e) => Date.parse(e.status?.operationState?.finishedAt ?? "") || 0, Re = (e, t) => we(e) && (t ? be(t, e) : Se(e).length > 0), ze = "Capybara's account on this cluster lacks the GitOps console permissions: reinstall or reconnect the plugin.", Be = {
		id: "argocd.applications",
		type: De,
		label: "Applications",
		singular: "Application",
		path: "gitops/applications",
		create: {
			label: "Create Application",
			route: "argocd.applications.new",
			when: Re
		},
		columns: [
			{
				key: "sync",
				title: "Sync",
				width: 120,
				ellipsis: !1,
				render: X,
				sortValue: (e) => z(e).text
			},
			{
				key: "health",
				title: "Health",
				width: 120,
				ellipsis: !1,
				render: Ie,
				sortValue: (e) => B(e).text
			},
			{
				key: "revision",
				title: "Revision",
				width: 110,
				render: (e) => V(e.status?.sync?.revision)
			},
			{
				key: "lastSync",
				title: "Last sync",
				width: 180,
				render: (e) => Le(e) ? new Date(Le(e)).toLocaleString() : "—",
				sortValue: Le
			},
			{
				key: "repo",
				title: "Repository",
				minWidth: 200,
				render: (e) => e.spec?.source?.repoURL ?? "—"
			}
		],
		status: (e) => {
			let t = z(e), n = B(e);
			return n.tone === "error" ? n : t.tone === "warning" ? t : n;
		},
		overview: [
			{
				label: "Sync",
				render: X
			},
			{
				label: "Health",
				render: Ie
			},
			{
				label: "Repository",
				render: (e) => e.spec?.source?.repoURL ?? "—"
			},
			{
				label: "Path",
				render: (e) => e.spec?.source?.path || "—"
			},
			{
				label: "Target revision",
				render: (e) => e.spec?.source?.targetRevision || "HEAD"
			},
			{
				label: "Synced revision",
				render: (e) => V(e.status?.sync?.revision)
			},
			{
				label: "Argo CD project",
				render: (e) => e.spec?.project ?? "—"
			},
			{
				label: "Sync policy",
				render: (e) => {
					let t = e.spec?.syncPolicy?.automated;
					return t ? [
						"Auto-sync",
						t.selfHeal ? "self-heal" : "",
						t.prune ? "prune" : ""
					].filter(Boolean).join(", ") : "Manual";
				}
			},
			{
				label: "Delete",
				render: (e) => (e.metadata.finalizers ?? []).some((e) => e.startsWith("resources-finalizer.argocd.argoproj.io")) ? "Removes what it deployed" : "Application only"
			},
			{
				label: "Last sync",
				render: (e) => Le(e) ? `${e.status?.operationState?.phase ?? ""} at ${new Date(Le(e)).toLocaleString()}` : "—"
			},
			{
				label: "Message",
				render: (e) => {
					let t = e.status?.operationState?.message ?? "", n = H(t);
					return n ? `${t} — ${n}` : t || "—";
				}
			}
		],
		forbiddenHint: ze
	}, Ve = {
		id: "argocd.appprojects",
		type: Oe,
		label: "Argo CD projects",
		singular: "Argo CD project",
		path: "gitops/projects",
		columns: [
			{
				key: "sources",
				title: "Applications from",
				minWidth: 160,
				render: (e) => U(e).sources
			},
			{
				key: "destinations",
				title: "Deploys to",
				minWidth: 160,
				render: (e) => U(e).destinations
			},
			{
				key: "description",
				title: "Description",
				minWidth: 200,
				render: (e) => e.spec?.description ?? ""
			}
		],
		overview: [
			{
				label: "Applications from",
				render: (e) => U(e).sources
			},
			{
				label: "Deploys to",
				render: (e) => U(e).destinations
			},
			{
				label: "Repositories",
				render: (e) => (e.spec?.sourceRepos ?? []).join(", ") || "none"
			},
			{
				label: "Cluster-scoped kinds",
				render: (e) => (e.spec?.clusterResourceWhitelist ?? []).length ? "some allowed" : "none"
			},
			{
				label: "Kinds refused",
				render: (e) => (e.spec?.namespaceResourceBlacklist ?? []).map((e) => e.kind).join(", ") || "—"
			}
		],
		forbiddenHint: ze
	}, He = {
		Deployment: "core.deployments",
		Service: "core.services",
		ConfigMap: "core.configmaps",
		Secret: "core.secrets",
		Pod: "core.pods"
	};
}));
//#endregion
//#region src/appform.ts
function Ue(e, t, n) {
	let r = structuredClone(n ?? {});
	r.apiVersion = "argoproj.io/v1alpha1", r.kind = "Application";
	let i = r.metadata ?? {};
	i.name = e.name, i.namespace = t;
	let a = (i.finalizers ?? []).filter((e) => !e.startsWith(qe));
	e.cascade && a.push(qe), a.length ? i.finalizers = a : delete i.finalizers, r.metadata = i;
	let o = r.spec ?? {}, s = o.source ?? {};
	s.repoURL = e.repoURL.trim(), s.targetRevision = e.targetRevision.trim() || "HEAD", e.path.trim() ? s.path = e.path.trim() : delete s.path, o.source = s;
	let c = o.syncPolicy ?? {};
	return e.autoSync ? c.automated = {
		...c.automated ?? {},
		selfHeal: e.selfHeal,
		prune: e.prune
	} : delete c.automated, Object.keys(c).length ? o.syncPolicy = c : delete o.syncPolicy, o.destination = {
		...o.destination ?? {},
		namespace: t,
		server: "https://kubernetes.default.svc"
	}, r.spec = o, r;
}
function We(e) {
	let t = e.metadata ?? {}, n = e.spec ?? {}, r = n.syncPolicy?.automated;
	return {
		name: t.name ?? "",
		repoURL: String(n.source?.repoURL ?? ""),
		targetRevision: String(n.source?.targetRevision ?? "HEAD"),
		path: String(n.source?.path ?? ""),
		autoSync: !!r,
		selfHeal: !!r?.selfHeal,
		prune: !!r?.prune,
		cascade: (t.finalizers ?? []).some((e) => e.startsWith(qe))
	};
}
function Ge(e) {
	let t = e.spec ?? {}, n = t.source ?? {}, r = [];
	for (let e of [
		"helm",
		"kustomize",
		"directory",
		"plugin",
		"chart",
		"ref"
	]) n[e] !== void 0 && r.push(`spec.source.${e}`);
	for (let e of [
		"sources",
		"ignoreDifferences",
		"info",
		"revisionHistoryLimit"
	]) t[e] !== void 0 && r.push(`spec.${e}`);
	let i = t.syncPolicy ?? {};
	for (let e of [
		"syncOptions",
		"retry",
		"managedNamespaceMetadata"
	]) i[e] !== void 0 && r.push(`spec.syncPolicy.${e}`);
	return r;
}
function Ke(e) {
	let t = [];
	return /^[a-z0-9]([-a-z0-9]{0,51}[a-z0-9])?$/.test(e.name) || t.push("Name: lowercase letters, digits and dashes (at most 53)."), e.repoURL.trim() ? /^(https|http|git):\/\//.test(e.repoURL.trim()) || t.push("Repository URL: https://, or http:// / git:// to a service in this cluster (no SSH).") : t.push("Repository URL is required."), e.path.includes("..") && t.push("Path may not contain \"..\"."), t;
}
var qe, Je, Ye = L((() => {
	qe = "resources-finalizer.argocd.argoproj.io", Je = () => ({
		name: "",
		repoURL: "",
		targetRevision: "HEAD",
		path: "",
		autoSync: !1,
		selfHeal: !1,
		prune: !1,
		cascade: !0
	});
})), Xe, Ze, Qe, $e, et, tt, nt = L((() => {
	Ye(), Z(), Xe = { "data-test": "argocd-form" }, Ze = { key: 1 }, Qe = {
		key: 2,
		class: "muted"
	}, $e = { key: 0 }, et = { key: 0 }, tt = /*@__PURE__*/ k({
		__name: "ApplicationForm",
		setup(e) {
			let { YamlEditor: n, YamlDiff: r, ResourceLink: p } = ve().components, m = ve().yaml, h = a(), g = s(), re = c(), ce = o(), y = S(() => !!g.value.name), b = M(g.value.namespace ?? re.value.ns ?? ""), k = S(() => h.value ? Se(h.value) : []), A = S(() => be(b.value, h.value)), pe = S(() => xe(b.value, h.value)), L = S(() => we(h.value)), R = S(() => Te(h.value)), z = M("form"), B = M(Je()), V = M(""), H = M(""), U = de(void 0), me = de(null), he = M(!1), ge = M(null), W = M([]), G = M([]), _e = M(null), K = M(!1), J = M(!1), Y = M(!1);
			le(async () => {
				if (ye(!0), h.value && Ce(h.value, !0), !y.value) {
					!b.value && k.value.length && (b.value = k.value[0]);
					return;
				}
				he.value = !0;
				try {
					let e = await Ee(h.value ?? "", b.value, g.value.name);
					me.value = {
						uid: e.metadata.uid,
						resourceVersion: e.metadata.resourceVersion
					}, H.value = m.editable(e), U.value = m.parse(H.value), B.value = We(U.value);
				} catch (e) {
					ge.value = e instanceof Error ? e.message : String(e);
				} finally {
					he.value = !1;
				}
			}), fe(k, (e) => {
				!y.value && !b.value && e.length && (b.value = e[0]);
			}), fe([
				B,
				V,
				b
			], () => {
				J.value = !1, Y.value = !1;
			}, { deep: !0 });
			let De = S(() => U.value ? Ge(U.value) : []), Oe = S(() => z.value === "form" ? Ke(B.value) : []);
			function ke() {
				if (_e.value = null, z.value === "form") return Ue(B.value, b.value, U.value);
				try {
					return m.parse(V.value);
				} catch (e) {
					return _e.value = e instanceof Error ? e.message : String(e), W.value = [], null;
				}
			}
			function Ae(e) {
				if (e !== z.value) {
					if (e === "yaml") V.value = m.stringify(Ue(B.value, b.value, U.value));
					else {
						let e = ke();
						if (!e) return;
						U.value = e, B.value = We(e);
					}
					z.value = e;
				}
			}
			function je(e) {
				e instanceof t ? (_e.value = e.message, W.value = e.problems, G.value = e.warnings) : _e.value = e instanceof Error ? e.message : String(e);
			}
			async function Me() {
				if (Oe.value.length) return !1;
				let e = ke();
				if (!e || !h.value) return !1;
				K.value = !0;
				try {
					let t = await i.validate(h.value, q, "applications", b.value, e, g.value.name);
					return W.value = t.problems, G.value = t.warnings, J.value = t.problems.length === 0, J.value;
				} catch (e) {
					return je(e), !1;
				} finally {
					K.value = !1;
				}
			}
			async function Ne() {
				let e = ke();
				if (e && h.value) {
					K.value = !0;
					try {
						let t = (y.value ? await i.update(h.value, q, "applications", b.value, g.value.name, e, me.value) : await i.create(h.value, q, "applications", b.value, e)).object.metadata.name;
						await ce({
							name: "argocd.applications.detail",
							params: {
								cluster: h.value,
								namespace: b.value,
								name: t
							}
						});
					} catch (e) {
						je(e);
					} finally {
						K.value = !1;
					}
				}
			}
			let Pe = S(() => {
				let e = z.value === "yaml" ? null : Ue(B.value, b.value, U.value);
				return e ? m.editable(e) : V.value;
			});
			async function Fe() {
				if (y.value && !Y.value) {
					await Me() && (Y.value = !0);
					return;
				}
				(J.value || await Me()) && await Ne();
			}
			let X = (e) => W.value.filter((t) => t.path === e || t.path.startsWith(`${e}.`)).map((e) => e.message).join("; "), Ie = S(() => z.value === "yaml" ? W.value : W.value.filter((e) => ![
				"metadata.name",
				"spec.source.repoURL",
				"spec.source.path",
				"spec.source.targetRevision"
			].includes(e.path)));
			return (e, t) => (j(), T("div", Xe, [O(F(ne), { class: "title" }, {
				default: I(() => [D(P(y.value ? `Edit Application ${F(g).name}` : "Create Application"), 1)]),
				_: 1
			}), he.value ? (j(), C(F(se), { key: 0 })) : ge.value ? (j(), C(F(l), {
				key: 1,
				type: "error"
			}, {
				default: I(() => [D(P(ge.value), 1)]),
				_: 1
			})) : (j(), T(x, { key: 2 }, [R.value ? (j(), C(F(l), {
				key: 0,
				type: "info",
				class: "gap-bottom",
				"data-test": "argocd-view-only"
			}, {
				default: I(() => [...t[11] ||= [D(" GitOps is view-only on this cluster: the connected Argo CD only accepts Applications in its own namespace. ", -1)]]),
				_: 1
			})) : w("", !0), O(F(d), { size: "small" }, {
				default: I(() => [
					O(F(v), {
						align: "center",
						justify: "space-between",
						class: "toolbar"
					}, {
						default: I(() => [O(F(v), { align: "center" }, {
							default: I(() => [
								t[12] ||= E("span", null, "Namespace", -1),
								y.value ? (j(), T("strong", Ze, P(b.value), 1)) : (j(), C(F(oe), {
									key: 0,
									value: b.value,
									"onUpdate:value": t[0] ||= (e) => b.value = e,
									options: k.value.map((e) => ({
										label: e,
										value: e
									})),
									placeholder: "A Project namespace",
									size: "small",
									class: "select",
									"data-test": "app-namespace"
								}, null, 8, ["value", "options"])),
								pe.value ? (j(), T("span", Qe, "Argo CD project capybara-" + P(pe.value), 1)) : w("", !0)
							]),
							_: 1
						}), O(F(ae), {
							value: z.value,
							size: "small",
							"onUpdate:value": Ae
						}, {
							default: I(() => [O(F(ie), {
								value: "form",
								"data-test": "app-mode-form"
							}, {
								default: I(() => [...t[13] ||= [D(" Form ", -1)]]),
								_: 1
							}), O(F(ie), {
								value: "yaml",
								"data-test": "app-mode-yaml"
							}, {
								default: I(() => [...t[14] ||= [D(" YAML ", -1)]]),
								_: 1
							})]),
							_: 1
						}, 8, ["value"])]),
						_: 1
					}),
					!k.value.length && !y.value ? (j(), C(F(l), {
						key: 0,
						type: "info",
						class: "gap-bottom"
					}, {
						default: I(() => [...t[15] ||= [D(" Applications can be created only in Project namespaces, and this cluster has no Projects yet. ", -1)]]),
						_: 1
					})) : b.value && !A.value ? (j(), C(F(l), {
						key: 1,
						type: "warning",
						class: "gap-bottom"
					}, {
						default: I(() => [D(P(b.value) + " is not a Project namespace: Applications can be written only in Projects. ", 1)]),
						_: 1
					})) : w("", !0),
					Y.value ? (j(), C(N(F(r)), {
						key: 2,
						original: H.value,
						modified: Pe.value,
						"data-test": "app-diff"
					}, null, 8, ["original", "modified"])) : z.value === "form" ? (j(), C(F(ee), {
						key: 3,
						"label-placement": "left",
						"label-width": "160",
						class: "form"
					}, {
						default: I(() => [
							O(F(te), {
								label: "Name",
								feedback: X("metadata.name"),
								"validation-status": X("metadata.name") ? "error" : void 0
							}, {
								default: I(() => [O(F(_), {
									value: B.value.name,
									"onUpdate:value": t[1] ||= (e) => B.value.name = e,
									disabled: y.value,
									placeholder: "guestbook",
									"data-test": "app-name"
								}, null, 8, ["value", "disabled"])]),
								_: 1
							}, 8, ["feedback", "validation-status"]),
							O(F(te), {
								label: "Repository URL",
								feedback: X("spec.source.repoURL") || "https://…, or http:// / git:// to a service in this cluster",
								"validation-status": X("spec.source.repoURL") ? "error" : void 0
							}, {
								default: I(() => [O(F(_), {
									value: B.value.repoURL,
									"onUpdate:value": t[2] ||= (e) => B.value.repoURL = e,
									placeholder: "https://github.com/org/repo.git",
									"data-test": "app-repo"
								}, null, 8, ["value"])]),
								_: 1
							}, 8, ["feedback", "validation-status"]),
							O(F(te), {
								label: "Revision",
								feedback: X("spec.source.targetRevision") || "Branch, tag or commit (HEAD: the default branch)"
							}, {
								default: I(() => [O(F(_), {
									value: B.value.targetRevision,
									"onUpdate:value": t[3] ||= (e) => B.value.targetRevision = e,
									"data-test": "app-revision"
								}, null, 8, ["value"])]),
								_: 1
							}, 8, ["feedback"]),
							O(F(te), {
								label: "Path",
								feedback: X("spec.source.path") || "Folder in the repository with the manifests, Kustomization or Helm chart"
							}, {
								default: I(() => [O(F(_), {
									value: B.value.path,
									"onUpdate:value": t[4] ||= (e) => B.value.path = e,
									placeholder: "deploy",
									"data-test": "app-path"
								}, null, 8, ["value"])]),
								_: 1
							}, 8, ["feedback"]),
							O(F(te), { label: "Deploys to" }, {
								default: I(() => [E("span", null, [
									t[16] ||= D("namespace ", -1),
									E("strong", null, P(b.value || "—"), 1),
									t[17] ||= D(" on this cluster", -1)
								])]),
								_: 1
							}),
							O(F(te), { label: "Sync" }, {
								default: I(() => [O(F(v), { vertical: "" }, {
									default: I(() => [
										O(F(f), {
											checked: B.value.autoSync,
											"onUpdate:checked": t[5] ||= (e) => B.value.autoSync = e,
											"data-test": "app-auto-sync"
										}, {
											default: I(() => [...t[18] ||= [D(" Sync automatically when Git changes ", -1)]]),
											_: 1
										}, 8, ["checked"]),
										O(F(f), {
											checked: B.value.selfHeal,
											"onUpdate:checked": t[6] ||= (e) => B.value.selfHeal = e,
											disabled: !B.value.autoSync
										}, {
											default: I(() => [...t[19] ||= [D(" Self-heal: undo changes made in the cluster ", -1)]]),
											_: 1
										}, 8, ["checked", "disabled"]),
										O(F(f), {
											checked: B.value.prune,
											"onUpdate:checked": t[7] ||= (e) => B.value.prune = e,
											disabled: !B.value.autoSync
										}, {
											default: I(() => [...t[20] ||= [D(" Prune: delete resources removed from Git ", -1)]]),
											_: 1
										}, 8, ["checked", "disabled"])
									]),
									_: 1
								})]),
								_: 1
							}),
							O(F(te), { label: "On delete" }, {
								default: I(() => [O(F(f), {
									checked: B.value.cascade,
									"onUpdate:checked": t[8] ||= (e) => B.value.cascade = e,
									"data-test": "app-cascade"
								}, {
									default: I(() => [...t[21] ||= [D(" Also delete the resources it deployed (can be changed when deleting) ", -1)]]),
									_: 1
								}, 8, ["checked"])]),
								_: 1
							}),
							De.value.length ? (j(), C(F(l), {
								key: 0,
								type: "info"
							}, {
								default: I(() => [D(" Kept as they are (edit them in YAML): " + P(De.value.join(", ")), 1)]),
								_: 1
							})) : w("", !0)
						]),
						_: 1
					})) : (j(), C(N(F(n)), {
						key: 4,
						value: V.value,
						"onUpdate:value": t[9] ||= (e) => V.value = e,
						problems: W.value,
						height: "55vh"
					}, null, 40, ["value", "problems"])),
					Oe.value.length ? (j(), C(F(l), {
						key: 5,
						type: "warning",
						class: "gap",
						"data-test": "app-quick-problems"
					}, {
						default: I(() => [(j(!0), T(x, null, ue(Oe.value, (e) => (j(), T("div", { key: e }, P(e), 1))), 128))]),
						_: 1
					})) : w("", !0),
					_e.value || Ie.value.length ? (j(), C(F(l), {
						key: 6,
						type: "error",
						class: "gap",
						"data-test": "app-error"
					}, {
						default: I(() => [D(P(_e.value ?? "It does not meet the rules for this Project:") + " ", 1), Ie.value.length ? (j(), T("ul", $e, [(j(!0), T(x, null, ue(Ie.value, (e) => (j(), T("li", {
							key: e.path + e.message,
							"data-test": "app-problem"
						}, [e.path ? (j(), T("code", et, P(e.path), 1)) : w("", !0), D(" " + P(e.message), 1)]))), 128))])) : w("", !0)]),
						_: 1
					})) : J.value && !Y.value ? (j(), C(F(l), {
						key: 7,
						type: "success",
						class: "gap",
						"data-test": "app-valid"
					}, {
						default: I(() => [...t[22] ||= [D(" It meets the rules for this Project and the cluster accepts it. ", -1)]]),
						_: 1
					})) : w("", !0),
					G.value.length ? (j(), C(F(l), {
						key: 8,
						type: "warning",
						class: "gap"
					}, {
						default: I(() => [(j(!0), T(x, null, ue(G.value, (e) => (j(), T("div", { key: e }, P(e), 1))), 128))]),
						_: 1
					})) : w("", !0),
					O(F(v), {
						justify: "end",
						class: "gap"
					}, {
						default: I(() => [
							y.value ? (j(), C(N(F(p)), {
								key: 0,
								resource: "argocd.applications",
								namespace: b.value,
								name: F(g).name
							}, {
								default: I(() => [...t[23] ||= [D(" Cancel ", -1)]]),
								_: 1
							}, 8, ["namespace", "name"])) : w("", !0),
							Y.value ? (j(), C(F(u), {
								key: 1,
								onClick: t[10] ||= (e) => Y.value = !1
							}, {
								default: I(() => [...t[24] ||= [D(" Back to the editor ", -1)]]),
								_: 1
							})) : (j(), C(F(u), {
								key: 2,
								loading: K.value,
								disabled: !A.value || !L.value,
								"data-test": "app-validate",
								onClick: Me
							}, {
								default: I(() => [...t[25] ||= [D(" Validate ", -1)]]),
								_: 1
							}, 8, ["loading", "disabled"])),
							O(F(u), {
								type: "primary",
								loading: K.value,
								disabled: !A.value || !L.value,
								"data-test": "app-save",
								onClick: Fe
							}, {
								default: I(() => [D(P(y.value ? Y.value ? "Save" : "Review changes" : "Create Application"), 1)]),
								_: 1
							}, 8, ["loading", "disabled"])
						]),
						_: 1
					})
				]),
				_: 1
			})], 64))]));
		}
	});
})), rt = L((() => {})), Q, $ = L((() => {
	Q = (e, t) => {
		let n = e.__vccOpts || e;
		for (let [e, r] of t) n[e] = r;
		return n;
	};
})), it = /* @__PURE__ */ R({ default: () => at }), at, ot = L((() => {
	nt(), nt(), rt(), $(), at = /*#__PURE__*/ Q(tt, [["__scopeId", "data-v-26cd17b7"]]);
})), st, ct, lt, ut = L((() => {
	Z(), G(), st = { "data-test": "argocd-resources" }, ct = {
		key: 0,
		class: "hint",
		"data-test": "argocd-refusal-hint"
	}, lt = /*@__PURE__*/ k({
		__name: "ResourcesTab",
		props: {
			cluster: {},
			object: {}
		},
		setup(e) {
			let t = e, { ResourceLink: n } = ve().components, r = S(() => Te(t.cluster)), i = S(() => (t.object.status?.resources ?? []).filter((e) => !e.hook)), a = S(() => {
				let e = [];
				for (let n of t.object.status?.conditions ?? []) /Error|Warning/.test(n.type) && e.push({
					title: n.type,
					message: n.message,
					hint: H(n.message)
				});
				let n = t.object.status?.operationState;
				if (n && (n.phase === "Failed" || n.phase === "Error")) {
					e.push({
						title: `Last sync ${n.phase.toLowerCase()}`,
						message: n.message ?? "",
						hint: H(n.message ?? "")
					});
					for (let t of n.syncResult?.resources ?? []) t.status === "SyncFailed" && t.message && e.push({
						title: `${t.kind} ${t.name}`,
						message: t.message,
						hint: H(t.message)
					});
				}
				return e;
			}), o = [
				{
					key: "kind",
					title: "Kind",
					width: 160,
					render: (e) => e.kind
				},
				{
					key: "name",
					title: "Name",
					minWidth: 180,
					render: (e) => He[e.kind] ? A(n, {
						cluster: t.cluster,
						resource: He[e.kind],
						namespace: e.namespace,
						name: e.name
					}) : e.name
				},
				{
					key: "sync",
					title: "Sync",
					width: 130,
					render: (e) => e.requiresPruning ? K("To prune", "warning") : K(e.status ?? "Unknown", e.status === "Synced" ? "success" : e.status === "OutOfSync" ? "warning" : "default")
				},
				{
					key: "health",
					title: "Health",
					width: 130,
					render: (e) => e.health ? K(B(e).text, B(e).tone) : "—"
				},
				{
					key: "message",
					title: "Message",
					minWidth: 200,
					ellipsis: { tooltip: !0 },
					render: (e) => e.health?.message ?? ""
				}
			];
			return (e, t) => (j(), T("div", st, [
				r.value ? (j(), C(F(l), {
					key: 0,
					type: "info",
					class: "gap"
				}, {
					default: I(() => [...t[0] ||= [D(" GitOps is view-only on this cluster: the connected Argo CD only accepts Applications in its own namespace. ", -1)]]),
					_: 1
				})) : w("", !0),
				(j(!0), T(x, null, ue(a.value, (e) => (j(), C(F(l), {
					key: e.title + e.message,
					type: "error",
					title: e.title,
					class: "gap",
					"data-test": "argocd-refusal"
				}, {
					default: I(() => [E("div", null, P(e.message), 1), e.hint ? (j(), T("div", ct, P(e.hint), 1)) : w("", !0)]),
					_: 2
				}, 1032, ["title"]))), 128)),
				i.value.length ? (j(), C(F(p), {
					key: 2,
					columns: o,
					data: i.value,
					"row-key": (e) => `${e.group}/${e.kind}/${e.namespace}/${e.name}`,
					size: "small"
				}, null, 8, ["data", "row-key"])) : (j(), C(F(g), {
					key: 1,
					description: "Nothing deployed yet: sync the Application."
				}))
			]));
		}
	});
})), dt = L((() => {})), ft = /* @__PURE__ */ R({ default: () => pt }), pt, mt = L((() => {
	ut(), ut(), dt(), $(), pt = /*#__PURE__*/ Q(lt, [["__scopeId", "data-v-a0aeab4a"]]);
})), ht, gt, _t = L((() => {
	Z(), G(), ht = { "data-test": "argocd-history" }, gt = /*@__PURE__*/ k({
		__name: "HistoryTab",
		props: {
			cluster: {},
			object: {}
		},
		setup(e) {
			let t = e, n = b(), i = S(() => he(t.object)), a = S(() => ge(t.object)), o = S(() => we(t.cluster) && be(t.object.metadata.namespace, t.cluster)), s = M(null), c = M(!1);
			async function d() {
				let e = s.value;
				if (!e) return !0;
				c.value = !0;
				try {
					let i = t.object.metadata;
					await r(t.cluster, q, "sync-revision", {
						namespace: i.namespace,
						name: i.name,
						uid: i.uid,
						inputs: { revision: e.revision }
					}), n.success(`Syncing ${i.name} to ${V(e.revision)}`), s.value = null;
				} catch (e) {
					n.error(e instanceof Error ? e.message : String(e));
				} finally {
					c.value = !1;
				}
				return !1;
			}
			let f = S(() => [
				{
					key: "id",
					title: "ID",
					width: 60
				},
				{
					key: "revision",
					title: "Revision",
					width: 120,
					render: (e) => A("code", V(e.revision))
				},
				{
					key: "deployedAt",
					title: "Deployed",
					width: 200,
					render: (e) => e.deployedAt ? new Date(e.deployedAt).toLocaleString() : "—"
				},
				{
					key: "source",
					title: "Source",
					minWidth: 200,
					ellipsis: { tooltip: !0 },
					render: (e) => [e.source?.repoURL, e.source?.path].filter(Boolean).join(" · ")
				},
				{
					key: "action",
					title: "",
					width: 190,
					render: (e, t) => t === 0 ? A("span", { class: "muted" }, "Deployed now") : o.value && !a.value ? A(u, {
						size: "tiny",
						"data-test": "history-rollback",
						onClick: () => s.value = e
					}, () => "Sync to this revision") : null
				}
			]);
			return (t, n) => (j(), T("div", ht, [
				a.value && i.value.length > 1 && o.value ? (j(), C(F(l), {
					key: 0,
					type: "info",
					class: "gap",
					"data-test": "history-blocked"
				}, {
					default: I(() => [D(P(a.value), 1)]),
					_: 1
				})) : w("", !0),
				i.value.length ? (j(), C(F(p), {
					key: 2,
					columns: f.value,
					data: i.value,
					"row-key": (e) => e.id,
					size: "small"
				}, null, 8, [
					"columns",
					"data",
					"row-key"
				])) : (j(), C(F(g), {
					key: 1,
					description: "Not synced yet."
				})),
				O(F(re), {
					show: !!s.value,
					preset: "dialog",
					type: "warning",
					title: `Sync ${e.object.metadata.name} to ${F(V)(s.value?.revision)}?`,
					"positive-text": "Sync to this revision",
					"negative-text": "Cancel",
					loading: c.value,
					"positive-button-props": { "data-test": "confirm" },
					onPositiveClick: d,
					onNegativeClick: n[0] ||= (e) => s.value = null,
					onClose: n[1] ||= (e) => s.value = null
				}, {
					default: I(() => [...n[2] ||= [D(" The resources go back to how they were at this revision (nothing is pruned). The Application then shows OutOfSync until Git's target revision is synced again. ", -1)]]),
					_: 1
				}, 8, [
					"show",
					"title",
					"loading"
				])
			]));
		}
	});
})), vt = L((() => {})), yt = /* @__PURE__ */ R({ default: () => bt }), bt, xt = L((() => {
	_t(), _t(), vt(), $(), bt = /*#__PURE__*/ Q(gt, [["__scopeId", "data-v-31fa413f"]]);
})), St, Ct, wt = L((() => {
	Z(), G(), St = { "data-test": "argocd-gitops-tab" }, Ct = /*@__PURE__*/ k({
		__name: "GitOpsTab",
		props: {
			cluster: {},
			object: {}
		},
		setup(e) {
			let t = e, { ResourceLink: n } = ve().components, r = S(() => me(t.object)), i = de(null), a = M(!1), o = M(null);
			le(async () => {
				if (r.value) {
					a.value = !0;
					try {
						i.value = await Ee(t.cluster, r.value.namespace, r.value.name);
					} catch (e) {
						o.value = e instanceof Error ? e.message : String(e);
					} finally {
						a.value = !1;
					}
				}
			});
			let s = S(() => (i.value?.status?.resources ?? []).find((e) => e.kind === t.object.kind && e.name === t.object.metadata.name && (e.namespace ?? "") === (t.object.metadata.namespace ?? ""))), c = S(() => !!i.value?.spec?.syncPolicy?.automated?.selfHeal);
			return (e, t) => (j(), T("div", St, [r.value ? a.value ? (j(), C(F(se), { key: 1 })) : o.value || !s.value ? (j(), C(F(l), {
				key: 2,
				type: "warning"
			}, {
				default: I(() => [D(" It is marked as managed by Application " + P(r.value.namespace) + "/" + P(r.value.name) + ", which " + P(o.value ? "could not be read" : "does not list it") + ". ", 1)]),
				_: 1
			})) : (j(), T(x, { key: 3 }, [O(F(m), {
				column: 1,
				"label-placement": "left",
				bordered: "",
				size: "small"
			}, {
				default: I(() => [
					O(F(h), { label: "Application" }, {
						default: I(() => [(j(), C(N(F(n)), {
							resource: "argocd.applications",
							namespace: r.value.namespace,
							name: r.value.name,
							"data-test": "gitops-app-link"
						}, null, 8, ["namespace", "name"]))]),
						_: 1
					}),
					O(F(h), { label: "This object" }, {
						default: I(() => [(j(), C(N(F(K)(s.value.status ?? "Unknown", s.value.status === "Synced" ? "success" : "warning", "gitops-object-sync")))), s.value.health ? (j(), C(N(F(K)(F(B)(s.value).text, F(B)(s.value).tone)), {
							key: 0,
							class: "space"
						})) : w("", !0)]),
						_: 1
					}),
					O(F(h), { label: "Application state" }, {
						default: I(() => [(j(), C(N(F(K)(F(z)(i.value).text, F(z)(i.value).tone)))), (j(), C(N(F(K)(F(B)(i.value).text, F(B)(i.value).tone)), { class: "space" }))]),
						_: 1
					}),
					O(F(h), { label: "Source" }, {
						default: I(() => [D(P(i.value.spec?.source?.repoURL) + " " + P(i.value.spec?.source?.path ? `· ${i.value.spec.source.path}` : "") + " @ " + P(F(V)(i.value.status?.sync?.revision)), 1)]),
						_: 1
					})
				]),
				_: 1
			}), O(F(l), {
				type: "info",
				class: "gap"
			}, {
				default: I(() => [D(" Change it in Git. " + P(c.value ? "Self-heal is on: changes made here are undone on the next sync." : "Changes made here show as OutOfSync and are overwritten by the next sync."), 1)]),
				_: 1
			})], 64)) : (j(), C(F(g), {
				key: 0,
				description: "Not managed by GitOps."
			}))]));
		}
	});
})), Tt = L((() => {})), Et = /* @__PURE__ */ R({ default: () => Dt }), Dt, Ot = L((() => {
	wt(), wt(), Tt(), $(), Dt = /*#__PURE__*/ Q(Ct, [["__scopeId", "data-v-a95e9d59"]]);
})), kt, At = L((() => {
	Z(), kt = /*@__PURE__*/ k({
		__name: "SyncAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: t }) {
			let n = e, i = t, a = M(""), o = M(!1), s = M(""), c = M(!1), d = M(null), p = S(() => !!n.object.operation || n.object.status?.operationState?.phase === "Running"), m = S(() => !p.value && (!o.value || s.value === n.object.metadata.name));
			async function h() {
				c.value = !0, d.value = null;
				let e = n.object.metadata;
				try {
					await r(n.cluster, q, "sync", {
						namespace: e.namespace,
						name: e.name,
						uid: e.uid,
						inputs: {
							prune: o.value,
							...a.value.trim() ? { revision: a.value.trim() } : {}
						},
						...o.value ? { confirmName: s.value } : {}
					}), i("close");
				} catch (e) {
					d.value = e instanceof Error ? e.message : String(e);
				} finally {
					c.value = !1;
				}
			}
			return (t, n) => (j(), C(F(re), {
				show: !0,
				preset: "card",
				title: `Sync ${e.object.metadata.name}`,
				style: { "max-width": "520px" },
				onClose: n[4] ||= (e) => i("close"),
				onMaskClick: n[5] ||= (e) => i("close")
			}, {
				footer: I(() => [O(F(v), { justify: "end" }, {
					default: I(() => [O(F(u), { onClick: n[3] ||= (e) => i("close") }, {
						default: I(() => [...n[10] ||= [D(" Cancel ", -1)]]),
						_: 1
					}), O(F(u), {
						type: "primary",
						disabled: !m.value,
						loading: c.value,
						"data-test": "sync-confirm",
						onClick: h
					}, {
						default: I(() => [...n[11] ||= [D(" Sync ", -1)]]),
						_: 1
					}, 8, ["disabled", "loading"])]),
					_: 1
				})]),
				default: I(() => [
					p.value ? (j(), C(F(l), {
						key: 0,
						type: "info",
						class: "gap"
					}, {
						default: I(() => [...n[6] ||= [D(" A sync is already in progress. ", -1)]]),
						_: 1
					})) : w("", !0),
					E("p", null, "Revision (empty: the target revision, " + P(e.object.spec?.source?.targetRevision || "HEAD") + ")", 1),
					O(F(_), {
						value: a.value,
						"onUpdate:value": n[0] ||= (e) => a.value = e,
						placeholder: "branch, tag or commit",
						class: "gap",
						"data-test": "sync-revision"
					}, null, 8, ["value"]),
					O(F(f), {
						checked: o.value,
						"onUpdate:checked": n[1] ||= (e) => o.value = e,
						"data-test": "sync-prune"
					}, {
						default: I(() => [...n[7] ||= [D(" Prune: delete resources that are no longer in Git ", -1)]]),
						_: 1
					}, 8, ["checked"]),
					o.value ? (j(), T(x, { key: 1 }, [E("p", null, [
						n[8] ||= D("Type ", -1),
						E("strong", null, P(e.object.metadata.name), 1),
						n[9] ||= D(" to prune.", -1)
					]), O(F(_), {
						value: s.value,
						"onUpdate:value": n[2] ||= (e) => s.value = e,
						"data-test": "sync-confirm-name"
					}, null, 8, ["value"])], 64)) : w("", !0),
					d.value ? (j(), C(F(l), {
						key: 2,
						type: "error",
						class: "gap-top"
					}, {
						default: I(() => [D(P(d.value), 1)]),
						_: 1
					})) : w("", !0)
				]),
				_: 1
			}, 8, ["title"]));
		}
	});
})), jt = L((() => {})), Mt = /* @__PURE__ */ R({ default: () => Nt }), Nt, Pt = L((() => {
	At(), At(), jt(), $(), Nt = /*#__PURE__*/ Q(kt, [["__scopeId", "data-v-51626dfb"]]);
})), Ft, It = L((() => {
	Z(), Ft = /*@__PURE__*/ k({
		__name: "Refresh",
		props: {
			cluster: {},
			object: {},
			hard: { type: Boolean }
		},
		emits: ["close"],
		setup(e, { emit: t }) {
			let n = e, i = t, a = b();
			return le(async () => {
				let e = n.object.metadata;
				try {
					await r(n.cluster, q, n.hard ? "hard-refresh" : "refresh", {
						namespace: e.namespace,
						name: e.name,
						uid: e.uid
					}), a.success(`${n.hard ? "Hard refreshing" : "Refreshing"} ${e.name}`);
				} catch (e) {
					a.error(e instanceof Error ? e.message : String(e));
				} finally {
					i("close");
				}
			}), (e, t) => (j(), T("span"));
		}
	});
})), Lt, Rt = L((() => {
	It(), It(), Lt = Ft;
})), zt, Bt = L((() => {
	Rt(), zt = /*@__PURE__*/ k({
		__name: "RefreshAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: t }) {
			let n = t;
			return (t, r) => (j(), C(Lt, {
				cluster: e.cluster,
				object: e.object,
				onClose: r[0] ||= (e) => n("close")
			}, null, 8, ["cluster", "object"]));
		}
	});
})), Vt = /* @__PURE__ */ R({ default: () => Ht }), Ht, Ut = L((() => {
	Bt(), Bt(), Ht = zt;
})), Wt, Gt = L((() => {
	Rt(), Wt = /*@__PURE__*/ k({
		__name: "HardRefreshAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: t }) {
			let n = t;
			return (t, r) => (j(), C(Lt, {
				cluster: e.cluster,
				object: e.object,
				hard: "",
				onClose: r[0] ||= (e) => n("close")
			}, null, 8, ["cluster", "object"]));
		}
	});
})), Kt = /* @__PURE__ */ R({ default: () => qt }), qt, Jt = L((() => {
	Gt(), Gt(), qt = Wt;
})), Yt, Xt, Zt, Qt, $t = L((() => {
	Z(), Yt = { class: "row" }, Xt = { class: "row" }, Zt = { class: "row" }, Qt = /*@__PURE__*/ k({
		__name: "SyncPolicyAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: t }) {
			let n = e, i = t, a = S(() => n.object.spec?.syncPolicy?.automated), o = M(null), s = M(null), c = M(!1), d = M(""), f = M([]);
			async function p(e, t) {
				o.value = e, s.value = null;
				let a = n.object.metadata;
				try {
					await r(n.cluster, q, e, {
						namespace: a.namespace,
						name: a.name,
						uid: a.uid,
						...t ? { confirmName: t } : {}
					}), f.value = [...f.value, e], i("close");
				} catch (e) {
					s.value = e instanceof Error ? e.message : String(e);
				} finally {
					o.value = null;
				}
			}
			function m(e, t) {
				if (e === "auto-prune" && t) {
					c.value = !0;
					return;
				}
				p(`${e}-${t ? "on" : "off"}`);
			}
			return (t, n) => (j(), C(F(re), {
				show: !0,
				preset: "card",
				title: `Sync policy of ${e.object.metadata.name}`,
				style: { "max-width": "520px" },
				onClose: n[5] ||= (e) => i("close"),
				onMaskClick: n[6] ||= (e) => i("close")
			}, {
				default: I(() => [
					E("div", Yt, [O(F(ce), {
						value: !!a.value,
						loading: o.value?.startsWith("auto-sync"),
						"data-test": "policy-auto-sync",
						"onUpdate:value": n[0] ||= (e) => m("auto-sync", e)
					}, null, 8, ["value", "loading"]), n[7] ||= E("span", null, "Auto-sync: sync when Git changes", -1)]),
					E("div", Xt, [O(F(ce), {
						value: !!a.value?.selfHeal,
						disabled: !a.value,
						loading: o.value?.startsWith("self-heal"),
						"data-test": "policy-self-heal",
						"onUpdate:value": n[1] ||= (e) => m("self-heal", e)
					}, null, 8, [
						"value",
						"disabled",
						"loading"
					]), n[8] ||= E("span", null, "Self-heal: undo changes made in the cluster", -1)]),
					E("div", Zt, [O(F(ce), {
						value: !!a.value?.prune,
						disabled: !a.value,
						loading: o.value?.startsWith("auto-prune"),
						"data-test": "policy-auto-prune",
						"onUpdate:value": n[2] ||= (e) => m("auto-prune", e)
					}, null, 8, [
						"value",
						"disabled",
						"loading"
					]), n[9] ||= E("span", null, "Auto-prune: delete resources removed from Git", -1)]),
					c.value ? (j(), T(x, { key: 0 }, [O(F(l), {
						type: "warning",
						class: "gap"
					}, {
						default: I(() => [
							n[10] ||= D(" Every automatic sync will delete resources that are no longer in Git. Type ", -1),
							E("strong", null, P(e.object.metadata.name), 1),
							n[11] ||= D(" to turn it on. ", -1)
						]),
						_: 1
					}), O(F(v), null, {
						default: I(() => [O(F(_), {
							value: d.value,
							"onUpdate:value": n[3] ||= (e) => d.value = e,
							"data-test": "policy-confirm-name"
						}, null, 8, ["value"]), O(F(u), {
							type: "warning",
							disabled: d.value !== e.object.metadata.name,
							loading: o.value === "auto-prune-on",
							"data-test": "policy-confirm",
							onClick: n[4] ||= (e) => p("auto-prune-on", d.value)
						}, {
							default: I(() => [...n[12] ||= [D(" Turn on auto-prune ", -1)]]),
							_: 1
						}, 8, ["disabled", "loading"])]),
						_: 1
					})], 64)) : w("", !0),
					s.value ? (j(), C(F(l), {
						key: 1,
						type: "error",
						class: "gap"
					}, {
						default: I(() => [D(P(s.value), 1)]),
						_: 1
					})) : w("", !0)
				]),
				_: 1
			}, 8, ["title"]));
		}
	});
})), en = L((() => {})), tn = /* @__PURE__ */ R({ default: () => nn }), nn, rn = L((() => {
	$t(), $t(), en(), $(), nn = /*#__PURE__*/ Q(Qt, [["__scopeId", "data-v-44c35b2d"]]);
})), an, on = L((() => {
	an = /*@__PURE__*/ k({
		__name: "EditAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: t }) {
			let n = e, r = t, i = o();
			return le(async () => {
				r("close");
				let e = n.object.metadata;
				await i({
					name: "argocd.applications.edit",
					params: {
						cluster: n.cluster,
						namespace: e.namespace ?? "",
						name: e.name
					}
				});
			}), (e, t) => (j(), T("span"));
		}
	});
})), sn = /* @__PURE__ */ R({ default: () => cn }), cn, ln = L((() => {
	on(), on(), cn = an;
})), un, dn = L((() => {
	Z(), un = /*@__PURE__*/ k({
		__name: "DeleteAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: t }) {
			let n = e, r = t, a = o(), s = (n.object.metadata.finalizers ?? []).some((e) => e.startsWith(ke)), c = M(s ? "cascade" : "app-only"), d = M(""), f = M(!1), p = M(null), m = S(() => (n.object.status?.resources ?? []).length);
			async function h() {
				f.value = !0, p.value = null;
				let e = n.object.metadata;
				try {
					await i.remove(n.cluster, q, "applications", e.namespace ?? "", e.name, e.uid, c.value), r("close"), await a({
						name: "argocd.applications.list",
						params: { cluster: n.cluster },
						query: { ns: e.namespace ?? "" }
					});
				} catch (e) {
					p.value = e instanceof Error ? e.message : String(e);
				} finally {
					f.value = !1;
				}
			}
			return (t, n) => (j(), C(F(re), {
				show: !0,
				preset: "card",
				title: `Delete Application ${e.object.metadata.name}?`,
				style: { "max-width": "560px" },
				onClose: n[3] ||= (e) => r("close"),
				onMaskClick: n[4] ||= (e) => r("close")
			}, {
				footer: I(() => [O(F(v), { justify: "end" }, {
					default: I(() => [O(F(u), { onClick: n[2] ||= (e) => r("close") }, {
						default: I(() => [...n[8] ||= [D(" Cancel ", -1)]]),
						_: 1
					}), O(F(u), {
						type: "error",
						disabled: d.value !== e.object.metadata.name,
						loading: f.value,
						"data-test": "delete-confirm",
						onClick: h
					}, {
						default: I(() => [...n[9] ||= [D(" Delete ", -1)]]),
						_: 1
					}, 8, ["disabled", "loading"])]),
					_: 1
				})]),
				default: I(() => [
					O(F(ae), {
						value: c.value,
						"onUpdate:value": n[0] ||= (e) => c.value = e,
						class: "gap"
					}, {
						default: I(() => [O(F(v), { vertical: "" }, {
							default: I(() => [O(F(ie), {
								value: "cascade",
								"data-test": "delete-mode-cascade"
							}, {
								default: I(() => [D(" Delete the Application and the " + P(m.value || "") + " resource" + P(m.value === 1 ? "" : "s") + " it deployed ", 1)]),
								_: 1
							}), O(F(ie), {
								value: "app-only",
								"data-test": "delete-mode-app-only"
							}, {
								default: I(() => [...n[5] ||= [D(" Delete the Application only: what it deployed keeps running, no longer managed ", -1)]]),
								_: 1
							})]),
							_: 1
						})]),
						_: 1
					}, 8, ["value"]),
					E("p", null, [
						n[6] ||= D("Type ", -1),
						E("strong", null, P(e.object.metadata.name), 1),
						n[7] ||= D(" to delete it.", -1)
					]),
					O(F(_), {
						value: d.value,
						"onUpdate:value": n[1] ||= (e) => d.value = e,
						"data-test": "delete-confirm-name"
					}, null, 8, ["value"]),
					p.value ? (j(), C(F(l), {
						key: 0,
						type: "error",
						class: "gap-top"
					}, {
						default: I(() => [D(P(p.value), 1)]),
						_: 1
					})) : w("", !0)
				]),
				_: 1
			}, 8, ["title"]));
		}
	});
})), fn = L((() => {})), pn = /* @__PURE__ */ R({ default: () => mn }), mn, hn = L((() => {
	dn(), dn(), fn(), $(), mn = /*#__PURE__*/ Q(un, [["__scopeId", "data-v-a9a29bfc"]]);
})), gn, _n, vn, yn, bn, xn = L((() => {
	Z(), gn = { "data-test": "argocd-project-card" }, _n = { key: 1 }, vn = { key: 4 }, yn = { class: "muted" }, bn = /*@__PURE__*/ k({
		__name: "ProjectAppsCard",
		props: {
			cluster: {},
			project: {}
		},
		setup(e) {
			let t = e, { ResourceLink: n } = ve().components, { items: r, loading: i, error: a } = ve().composables.useLiveList(() => ({
				cluster: t.cluster,
				type: De,
				namespace: t.project.spec.namespace
			}), { sort: (e, t) => e.metadata.name.localeCompare(t.metadata.name) }), o = S(() => Te(t.cluster));
			return (t, s) => (j(), T("div", gn, [
				o.value ? (j(), C(F(l), {
					key: 0,
					type: "info",
					class: "gap"
				}, {
					default: I(() => [...s[0] ||= [D(" View-only on this cluster. ", -1)]]),
					_: 1
				})) : w("", !0),
				F(a) ? (j(), T("span", _n, P(F(a)), 1)) : F(i) ? (j(), C(F(se), {
					key: 2,
					size: "small"
				})) : F(r).length ? (j(), T("table", vn, [(j(!0), T(x, null, ue(F(r), (t) => (j(), T("tr", { key: t.metadata.uid }, [
					E("td", null, [(j(), C(N(F(n)), {
						cluster: e.cluster,
						resource: "argocd.applications",
						namespace: t.metadata.namespace,
						name: t.metadata.name
					}, null, 8, [
						"cluster",
						"namespace",
						"name"
					]))]),
					E("td", null, [(j(), C(N(F(X)(t))))]),
					E("td", null, [(j(), C(N(F(Ie)(t))))])
				]))), 128))])) : (j(), C(F(g), {
					key: 3,
					size: "small",
					description: "No Applications in this Project yet."
				})),
				E("div", yn, " Argo CD project: capybara-" + P(e.project.metadata.name), 1)
			]));
		}
	});
})), Sn = L((() => {})), Cn = /* @__PURE__ */ R({ default: () => wn }), wn, Tn = L((() => {
	xn(), xn(), Sn(), $(), wn = /*#__PURE__*/ Q(bn, [["__scopeId", "data-v-2b5493ad"]]);
}));
//#endregion
//#region src/index.ts
Z();
var En = (e, t) => we(t.cluster) && be(e.metadata.namespace, t.cluster), Dn = n({
	name: "argocd",
	apiVersion: e,
	minApi: "1.3",
	register(e) {
		_e(e), ye(), e.register({
			type: "nav-section",
			id: "argocd.section",
			label: "GitOps",
			order: 47
		}), e.registerResource(Be, {
			order: 10,
			section: "argocd.section"
		}), e.registerResource(Ve, {
			order: 20,
			section: "argocd.section"
		});
		let t = () => Promise.resolve().then(() => (ot(), it));
		e.register({
			type: "route",
			id: "argocd.applications.new",
			path: "gitops/applications/new",
			scope: "cluster",
			title: "Create Application",
			parent: "argocd.applications.list",
			component: t
		}), e.register({
			type: "route",
			id: "argocd.applications.edit",
			path: "gitops/applications/:namespace/:name/edit",
			scope: "cluster",
			title: "Edit Application",
			parent: "argocd.applications.list",
			component: t
		}), e.register({
			type: "resource-detail-tab",
			id: "argocd.tab.resources",
			label: "Resources",
			order: 12,
			kinds: ["Application"],
			component: () => Promise.resolve().then(() => (mt(), ft))
		}), e.register({
			type: "resource-detail-tab",
			id: "argocd.tab.history",
			label: "History",
			order: 14,
			kinds: ["Application"],
			component: () => Promise.resolve().then(() => (xt(), yt))
		}), e.register({
			type: "resource-detail-tab",
			id: "argocd.tab.gitops",
			label: "GitOps",
			order: 40,
			kinds: [
				"Deployment",
				"Service",
				"ConfigMap",
				"Secret"
			],
			component: () => Promise.resolve().then(() => (Ot(), Et))
		}), e.register({
			type: "resource-action",
			id: "argocd.action.sync",
			label: "Sync",
			order: 5,
			kinds: ["Application"],
			appliesTo: En,
			component: () => Promise.resolve().then(() => (Pt(), Mt))
		}), e.register({
			type: "resource-action",
			id: "argocd.action.refresh",
			label: "Refresh",
			order: 6,
			kinds: ["Application"],
			appliesTo: En,
			component: () => Promise.resolve().then(() => (Ut(), Vt))
		}), e.register({
			type: "resource-action",
			id: "argocd.action.hard-refresh",
			label: "Hard refresh",
			order: 7,
			kinds: ["Application"],
			appliesTo: En,
			component: () => Promise.resolve().then(() => (Jt(), Kt))
		}), e.register({
			type: "resource-action",
			id: "argocd.action.policy",
			label: "Sync policy",
			order: 8,
			kinds: ["Application"],
			appliesTo: En,
			component: () => Promise.resolve().then(() => (rn(), tn))
		}), e.register({
			type: "resource-action",
			id: "argocd.action.edit",
			label: "Edit",
			order: 10,
			kinds: ["Application"],
			appliesTo: En,
			component: () => Promise.resolve().then(() => (ln(), sn))
		}), e.register({
			type: "resource-action",
			id: "argocd.action.delete",
			label: "Delete",
			order: 90,
			danger: !0,
			kinds: ["Application"],
			appliesTo: En,
			component: () => Promise.resolve().then(() => (hn(), pn))
		}), e.register({
			type: "project-overview-card",
			id: "argocd.card.apps",
			title: "GitOps applications",
			order: 35,
			component: () => Promise.resolve().then(() => (Tn(), Cn))
		});
	}
});
//#endregion
export { Dn as default };
