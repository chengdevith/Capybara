if(typeof document!=='undefined'){const s=document.createElement('style');s.dataset.plugin="argocd";s.textContent=".title[data-v-26cd17b7]{margin:0 0 16px}.toolbar[data-v-26cd17b7]{margin-bottom:12px}.select[data-v-26cd17b7]{width:240px}.form[data-v-26cd17b7]{max-width:760px}.muted[data-v-26cd17b7]{opacity:.7;font-size:12px}.gap[data-v-26cd17b7]{margin-top:12px}.gap-bottom[data-v-26cd17b7],.gap[data-v-a0aeab4a]{margin-bottom:12px}.hint[data-v-a0aeab4a]{margin-top:6px;font-weight:500}.gap[data-v-31fa413f]{margin-bottom:12px}.muted[data-v-31fa413f]{opacity:.6;font-size:12px}.space[data-v-39f59e71]{margin-left:6px}.gap[data-v-39f59e71]{margin-top:12px}.gap[data-v-51626dfb]{margin-bottom:12px}.gap-top[data-v-51626dfb]{margin-top:12px}.row[data-v-44c35b2d]{align-items:center;gap:12px;margin-bottom:12px;display:flex}.gap[data-v-44c35b2d]{margin:12px 0}.gap[data-v-a9a29bfc]{margin-bottom:12px}.gap-top[data-v-a9a29bfc]{margin-top:12px}table[data-v-2b5493ad]{border-collapse:collapse;width:100%}td[data-v-2b5493ad]{white-space:nowrap;padding:4px 8px 4px 0}.muted[data-v-2b5493ad]{opacity:.7;margin-top:6px;font-size:12px}.gap[data-v-2b5493ad]{margin-bottom:8px}\n/*$vite$:1*/";document.head.appendChild(s)}
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
	let t = e ?? "", n = /resource [^\s:]*:(\w+) is not permitted/.exec(t)?.[1];
	return n === "RoleBinding" || /RoleBinding/.test(t) && /not permitted|is not allowed|denied/i.test(t) ? "RoleBindings are refused in Projects: a chart that needs one cannot be deployed through GitOps yet (roles are granted per user from Phase 5)." : n && [
		"ResourceQuota",
		"LimitRange",
		"NetworkPolicy"
	].includes(n) ? "A Project's quota, limits and network policies are set by Capybara; an Application may not change them." : n && W.has(n) || /cluster level|cluster-scoped|cluster scoped/i.test(t) && /not permitted|is not allowed/i.test(t) ? "Cluster-scoped resources (namespaces, CRDs, ClusterRoles, …) are refused: an Application deploys only into its Project namespace." : n ? `${n} is not allowed in this Project's Argo CD project.` : /namespace .* is not permitted|destination .* is not permitted/i.test(t) ? "Every resource must go into the Project's own namespace on this cluster." : /exceeded quota|forbidden: exceeded/i.test(t) ? "The Project's quota does not allow it: lower the requests or ask for a larger Project size." : /not permitted to use project|is not allowed to use project|application .* not allowed/i.test(t) ? "Applications in this namespace must use their Project's Argo CD project (capybara-<project>)." : "";
}
function U(e) {
	let t = (e.spec?.sourceNamespaces ?? []).join(", "), n = (e.spec?.destinations ?? []).map((e) => `${e.namespace ?? "*"}${e.server === "https://kubernetes.default.svc" || e.name === "in-cluster" ? "" : ` on ${e.server ?? e.name ?? "?"}`}`).join(", ");
	return {
		sources: t || `${e.metadata.namespace ?? ""} only`,
		destinations: n || "nowhere"
	};
}
function me(e, t = "argocd") {
	let n = e.metadata.annotations?.[_e];
	if (n) {
		let [e = "", r = ""] = n.split(":"), i = r.split("/").pop() || void 0;
		if (e) {
			let n = e.indexOf("_");
			return n > 0 ? {
				namespace: e.slice(0, n),
				name: e.slice(n + 1),
				via: "annotation",
				kind: i
			} : {
				namespace: t,
				name: e,
				via: "annotation",
				kind: i
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
var W, _e, G = L((() => {
	W = /* @__PURE__ */ new Set([
		"Namespace",
		"ClusterRole",
		"ClusterRoleBinding",
		"CustomResourceDefinition",
		"PersistentVolume",
		"StorageClass",
		"PriorityClass",
		"ValidatingWebhookConfiguration",
		"MutatingWebhookConfiguration",
		"APIService",
		"IngressClass",
		"RuntimeClass",
		"Node",
		"CSIDriver",
		"VolumeSnapshotClass",
		"ClusterIssuer"
	]), _e = "argocd.argoproj.io/tracking-id";
}));
//#endregion
//#region src/argocd.ts
function ve(e) {
	J = e;
}
function ye() {
	if (!J) throw Error("argocd plugin is not registered");
	return J;
}
function be(e = !1) {
	return Y && !e && Date.now() - Ne < 6e4 ? Y : (Ne = Date.now(), Y = (async () => {
		try {
			let e = await fetch("/api/projects", { headers: { Accept: "application/json" } });
			if (!e.ok) return;
			let t = await e.json(), n = Array.isArray(t) ? t : t.items ?? [];
			Me.value = new Map(n.filter((e) => e.status?.phase === "Ready").map((e) => [`${e.spec.cluster}/${e.spec.namespace}`, e.metadata.name]));
		} catch {}
	})(), Y);
}
function xe(e, t) {
	return be(), !!e && !!Me.value?.has(`${t}/${e}`);
}
function Se(e, t) {
	return be(), e ? Me.value?.get(`${t}/${e}`) : void 0;
}
function Ce(e) {
	return be(), [...Me.value?.keys() ?? []].filter((t) => t.startsWith(`${e}/`)).map((t) => t.slice(e.length + 1)).sort();
}
async function we(e, t = !1) {
	let n = X.get(e) ?? 0;
	if (!(!t && Date.now() - n < 6e4)) {
		X.set(e, Date.now());
		try {
			let t = await fetch(`/api/plugins/installations/${encodeURIComponent(`${q}.${e}`)}`, { headers: { Accept: "application/json" } });
			if (!t.ok) return;
			let n = await t.json(), r = n.status.steps?.find((e) => e.name === Pe), i = new Map(Fe.value);
			i.set(e, {
				writable: r?.state === "Done",
				mode: n.spec.mode
			}), Fe.value = i;
		} catch {}
	}
}
function Te(e) {
	return e ? (we(e), Fe.value.get(e)?.writable ?? !1) : !1;
}
function Ee(e) {
	if (!e) return !1;
	we(e);
	let t = Fe.value.get(e);
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
async function De(e, t, n) {
	let r = `/api/clusters/${encodeURIComponent(e)}/k8s/apis/argoproj.io/v1alpha1/namespaces/${encodeURIComponent(t)}/applications/${encodeURIComponent(n)}`, i = await fetch(r, { headers: { Accept: "application/json" } });
	if (!i.ok) throw Error(`Application ${n} could not be loaded (${i.status})`);
	return await i.json();
}
var q, J, Oe, ke, Ae, je, Me, Y, Ne, Pe, Fe, X, Ie, Le, Re, ze, Be, Ve, He, Ue, Z = L((() => {
	G(), q = "argocd", J = null, Oe = (e, t) => ({
		group: "argoproj.io",
		version: "v1alpha1",
		plural: e,
		kind: t,
		namespaced: !0
	}), ke = Oe("applications", "Application"), Ae = Oe("appprojects", "AppProject"), je = "resources-finalizer.argocd.argoproj.io", Me = de(null), Y = null, Ne = 0, Pe = "apps-in-any-namespace", Fe = de(/* @__PURE__ */ new Map()), X = /* @__PURE__ */ new Map(), Ie = (e) => {
		let t = z(e);
		return K(t.text, t.tone, "app-sync");
	}, Le = (e) => {
		let t = B(e);
		return K(t.text, t.tone, "app-health");
	}, Re = (e) => Date.parse(e.status?.operationState?.finishedAt ?? "") || 0, ze = (e, t) => Te(e) && (t ? xe(t, e) : Ce(e).length > 0), Be = "Capybara's account on this cluster lacks the GitOps console permissions: reinstall or reconnect the plugin.", Ve = {
		id: "argocd.applications",
		type: ke,
		label: "Applications",
		singular: "Application",
		path: "gitops/applications",
		create: {
			label: "Create Application",
			route: "argocd.applications.new",
			when: ze
		},
		columns: [
			{
				key: "sync",
				title: "Sync",
				width: 120,
				ellipsis: !1,
				render: Ie,
				sortValue: (e) => z(e).text
			},
			{
				key: "health",
				title: "Health",
				width: 120,
				ellipsis: !1,
				render: Le,
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
				render: (e) => Re(e) ? new Date(Re(e)).toLocaleString() : "—",
				sortValue: Re
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
				render: Ie
			},
			{
				label: "Health",
				render: Le
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
				render: (e) => Re(e) ? `${e.status?.operationState?.phase ?? ""} at ${new Date(Re(e)).toLocaleString()}` : "—"
			},
			{
				label: "Message",
				render: (e) => {
					let t = e.status?.operationState?.message ?? "", n = H(t);
					return n ? `${t} — ${n}` : t || "—";
				}
			}
		],
		forbiddenHint: Be
	}, He = {
		id: "argocd.appprojects",
		type: Ae,
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
		forbiddenHint: Be
	}, Ue = {
		Deployment: "core.deployments",
		Service: "core.services",
		ConfigMap: "core.configmaps",
		Secret: "core.secrets",
		Pod: "core.pods"
	};
}));
//#endregion
//#region src/appform.ts
function We(e, t, n) {
	let r = structuredClone(n ?? {});
	r.apiVersion = "argoproj.io/v1alpha1", r.kind = "Application";
	let i = r.metadata ?? {};
	i.name = e.name, i.namespace = t;
	let a = (i.finalizers ?? []).filter((e) => !e.startsWith(Je));
	e.cascade && a.push(Je), a.length ? i.finalizers = a : delete i.finalizers, r.metadata = i;
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
function Ge(e) {
	let t = e.metadata ?? {}, n = e.spec ?? {}, r = n.syncPolicy?.automated;
	return {
		name: t.name ?? "",
		repoURL: String(n.source?.repoURL ?? ""),
		targetRevision: String(n.source?.targetRevision ?? "HEAD"),
		path: String(n.source?.path ?? ""),
		autoSync: !!r,
		selfHeal: !!r?.selfHeal,
		prune: !!r?.prune,
		cascade: (t.finalizers ?? []).some((e) => e.startsWith(Je))
	};
}
function Ke(e) {
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
function qe(e) {
	let t = [];
	return /^[a-z0-9]([-a-z0-9]{0,51}[a-z0-9])?$/.test(e.name) || t.push("Name: lowercase letters, digits and dashes (at most 53)."), e.repoURL.trim() ? /^(https|http|git):\/\//.test(e.repoURL.trim()) || t.push("Repository URL: https://, or http:// / git:// to a service in this cluster (no SSH).") : t.push("Repository URL is required."), e.path.includes("..") && t.push("Path may not contain \"..\"."), t;
}
var Je, Ye, Xe = L((() => {
	Je = "resources-finalizer.argocd.argoproj.io", Ye = () => ({
		name: "",
		repoURL: "",
		targetRevision: "HEAD",
		path: "",
		autoSync: !1,
		selfHeal: !1,
		prune: !1,
		cascade: !0
	});
})), Ze, Qe, $e, et, tt, nt, rt = L((() => {
	Xe(), Z(), Ze = { "data-test": "argocd-form" }, Qe = { key: 1 }, $e = {
		key: 2,
		class: "muted"
	}, et = { key: 0 }, tt = { key: 0 }, nt = /*@__PURE__*/ k({
		__name: "ApplicationForm",
		setup(e) {
			let { YamlEditor: n, YamlDiff: r, ResourceLink: p } = ye().components, m = ye().yaml, h = a(), g = s(), re = c(), ce = o(), y = S(() => !!g.value.name), b = M(g.value.namespace ?? re.value.ns ?? ""), k = S(() => h.value ? Ce(h.value) : []), A = S(() => xe(b.value, h.value)), pe = S(() => Se(b.value, h.value)), L = S(() => Te(h.value)), R = S(() => Ee(h.value)), z = M("form"), B = M(Ye()), V = M(""), H = M(""), U = de(void 0), me = de(null), he = M(!1), ge = M(null), W = M([]), _e = M([]), G = M(null), ve = M(!1), K = M(!1), J = M(!1);
			le(async () => {
				if (be(!0), h.value && we(h.value, !0), !y.value) {
					!b.value && k.value.length && (b.value = k.value[0]);
					return;
				}
				he.value = !0;
				try {
					let e = await De(h.value ?? "", b.value, g.value.name);
					me.value = {
						uid: e.metadata.uid,
						resourceVersion: e.metadata.resourceVersion
					}, H.value = m.editable(e), U.value = m.parse(H.value), B.value = Ge(U.value);
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
				K.value = !1, J.value = !1;
			}, { deep: !0 });
			let Oe = S(() => U.value ? Ke(U.value) : []), ke = S(() => z.value === "form" ? qe(B.value) : []);
			function Ae() {
				if (G.value = null, z.value === "form") return We(B.value, b.value, U.value);
				try {
					return m.parse(V.value);
				} catch (e) {
					return G.value = e instanceof Error ? e.message : String(e), W.value = [], null;
				}
			}
			function je(e) {
				if (e !== z.value) {
					if (e === "yaml") V.value = m.stringify(We(B.value, b.value, U.value));
					else {
						let e = Ae();
						if (!e) return;
						U.value = e, B.value = Ge(e);
					}
					z.value = e;
				}
			}
			function Me(e) {
				e instanceof t ? (G.value = e.message, W.value = e.problems, _e.value = e.warnings) : G.value = e instanceof Error ? e.message : String(e);
			}
			async function Y() {
				if (ke.value.length) return !1;
				let e = Ae();
				if (!e || !h.value) return !1;
				ve.value = !0;
				try {
					let t = await i.validate(h.value, q, "applications", b.value, e, g.value.name);
					return W.value = t.problems, _e.value = t.warnings, K.value = t.problems.length === 0, K.value;
				} catch (e) {
					return Me(e), !1;
				} finally {
					ve.value = !1;
				}
			}
			async function Ne() {
				let e = Ae();
				if (e && h.value) {
					ve.value = !0;
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
						Me(e);
					} finally {
						ve.value = !1;
					}
				}
			}
			let Pe = S(() => {
				let e = z.value === "yaml" ? null : We(B.value, b.value, U.value);
				return e ? m.editable(e) : V.value;
			});
			async function Fe() {
				if (y.value && !J.value) {
					await Y() && (J.value = !0);
					return;
				}
				(K.value || await Y()) && await Ne();
			}
			let X = (e) => W.value.filter((t) => t.path === e || t.path.startsWith(`${e}.`)).map((e) => e.message).join("; "), Ie = S(() => z.value === "yaml" ? W.value : W.value.filter((e) => ![
				"metadata.name",
				"spec.source.repoURL",
				"spec.source.path",
				"spec.source.targetRevision"
			].includes(e.path)));
			return (e, t) => (j(), T("div", Ze, [O(F(ne), { class: "title" }, {
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
								y.value ? (j(), T("strong", Qe, P(b.value), 1)) : (j(), C(F(oe), {
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
								pe.value ? (j(), T("span", $e, "Argo CD project capybara-" + P(pe.value), 1)) : w("", !0)
							]),
							_: 1
						}), O(F(ae), {
							value: z.value,
							size: "small",
							"onUpdate:value": je
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
					J.value ? (j(), C(N(F(r)), {
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
							Oe.value.length ? (j(), C(F(l), {
								key: 0,
								type: "info"
							}, {
								default: I(() => [D(" Kept as they are (edit them in YAML): " + P(Oe.value.join(", ")), 1)]),
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
					ke.value.length ? (j(), C(F(l), {
						key: 5,
						type: "warning",
						class: "gap",
						"data-test": "app-quick-problems"
					}, {
						default: I(() => [(j(!0), T(x, null, ue(ke.value, (e) => (j(), T("div", { key: e }, P(e), 1))), 128))]),
						_: 1
					})) : w("", !0),
					G.value || Ie.value.length ? (j(), C(F(l), {
						key: 6,
						type: "error",
						class: "gap",
						"data-test": "app-error"
					}, {
						default: I(() => [D(P(G.value ?? "It does not meet the rules for this Project:") + " ", 1), Ie.value.length ? (j(), T("ul", et, [(j(!0), T(x, null, ue(Ie.value, (e) => (j(), T("li", {
							key: e.path + e.message,
							"data-test": "app-problem"
						}, [e.path ? (j(), T("code", tt, P(e.path), 1)) : w("", !0), D(" " + P(e.message), 1)]))), 128))])) : w("", !0)]),
						_: 1
					})) : K.value && !J.value ? (j(), C(F(l), {
						key: 7,
						type: "success",
						class: "gap",
						"data-test": "app-valid"
					}, {
						default: I(() => [...t[22] ||= [D(" It meets the rules for this Project and the cluster accepts it. ", -1)]]),
						_: 1
					})) : w("", !0),
					_e.value.length ? (j(), C(F(l), {
						key: 8,
						type: "warning",
						class: "gap"
					}, {
						default: I(() => [(j(!0), T(x, null, ue(_e.value, (e) => (j(), T("div", { key: e }, P(e), 1))), 128))]),
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
							J.value ? (j(), C(F(u), {
								key: 1,
								onClick: t[10] ||= (e) => J.value = !1
							}, {
								default: I(() => [...t[24] ||= [D(" Back to the editor ", -1)]]),
								_: 1
							})) : (j(), C(F(u), {
								key: 2,
								loading: ve.value,
								disabled: !A.value || !L.value,
								"data-test": "app-validate",
								onClick: Y
							}, {
								default: I(() => [...t[25] ||= [D(" Validate ", -1)]]),
								_: 1
							}, 8, ["loading", "disabled"])),
							O(F(u), {
								type: "primary",
								loading: ve.value,
								disabled: !A.value || !L.value,
								"data-test": "app-save",
								onClick: Fe
							}, {
								default: I(() => [D(P(y.value ? J.value ? "Save" : "Review changes" : "Create Application"), 1)]),
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
})), it = L((() => {})), Q, $ = L((() => {
	Q = (e, t) => {
		let n = e.__vccOpts || e;
		for (let [e, r] of t) n[e] = r;
		return n;
	};
})), at = /* @__PURE__ */ R({ default: () => ot }), ot, st = L((() => {
	rt(), rt(), it(), $(), ot = /*#__PURE__*/ Q(nt, [["__scopeId", "data-v-26cd17b7"]]);
})), ct, lt, ut, dt = L((() => {
	Z(), G(), ct = { "data-test": "argocd-resources" }, lt = {
		key: 0,
		class: "hint",
		"data-test": "argocd-refusal-hint"
	}, ut = /*@__PURE__*/ k({
		__name: "ResourcesTab",
		props: {
			cluster: {},
			object: {}
		},
		setup(e) {
			let t = e, { ResourceLink: n } = ye().components, r = S(() => Ee(t.cluster)), i = S(() => (t.object.status?.resources ?? []).filter((e) => !e.hook)), a = S(() => {
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
					render: (e) => Ue[e.kind] ? A(n, {
						cluster: t.cluster,
						resource: Ue[e.kind],
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
			return (e, t) => (j(), T("div", ct, [
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
					default: I(() => [E("div", null, P(e.message), 1), e.hint ? (j(), T("div", lt, P(e.hint), 1)) : w("", !0)]),
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
})), ft = L((() => {})), pt = /* @__PURE__ */ R({ default: () => mt }), mt, ht = L((() => {
	dt(), dt(), ft(), $(), mt = /*#__PURE__*/ Q(ut, [["__scopeId", "data-v-a0aeab4a"]]);
})), gt, _t, vt = L((() => {
	Z(), G(), gt = { "data-test": "argocd-history" }, _t = /*@__PURE__*/ k({
		__name: "HistoryTab",
		props: {
			cluster: {},
			object: {}
		},
		setup(e) {
			let t = e, n = b(), i = S(() => he(t.object)), a = S(() => ge(t.object)), o = S(() => Te(t.cluster) && xe(t.object.metadata.namespace, t.cluster)), s = M(null), c = M(!1);
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
			return (t, n) => (j(), T("div", gt, [
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
})), yt = L((() => {})), bt = /* @__PURE__ */ R({ default: () => xt }), xt, St = L((() => {
	vt(), vt(), yt(), $(), xt = /*#__PURE__*/ Q(_t, [["__scopeId", "data-v-31fa413f"]]);
})), Ct, wt, Tt = L((() => {
	Z(), G(), Ct = { "data-test": "argocd-gitops-tab" }, wt = /*@__PURE__*/ k({
		__name: "GitOpsTab",
		props: {
			cluster: {},
			object: {}
		},
		setup(e) {
			let t = e, { ResourceLink: n } = ye().components, r = S(() => me(t.object)), i = de(null), a = M(!1), o = M(null);
			le(async () => {
				if (r.value) {
					a.value = !0;
					try {
						i.value = await De(t.cluster, r.value.namespace, r.value.name);
					} catch (e) {
						o.value = e instanceof Error ? e.message : String(e);
					} finally {
						a.value = !1;
					}
				}
			});
			let s = S(() => (i.value?.status?.resources ?? []).find((e) => e.kind === (t.object.kind ?? r.value?.kind) && e.name === t.object.metadata.name && (e.namespace ?? "") === (t.object.metadata.namespace ?? ""))), c = S(() => !!i.value?.spec?.syncPolicy?.automated?.selfHeal);
			return (e, t) => (j(), T("div", Ct, [r.value ? a.value ? (j(), C(F(se), { key: 1 })) : o.value || !s.value ? (j(), C(F(l), {
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
})), Et = L((() => {})), Dt = /* @__PURE__ */ R({ default: () => Ot }), Ot, kt = L((() => {
	Tt(), Tt(), Et(), $(), Ot = /*#__PURE__*/ Q(wt, [["__scopeId", "data-v-39f59e71"]]);
})), At, jt = L((() => {
	Z(), At = /*@__PURE__*/ k({
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
})), Mt = L((() => {})), Nt = /* @__PURE__ */ R({ default: () => Pt }), Pt, Ft = L((() => {
	jt(), jt(), Mt(), $(), Pt = /*#__PURE__*/ Q(At, [["__scopeId", "data-v-51626dfb"]]);
})), It, Lt = L((() => {
	Z(), It = /*@__PURE__*/ k({
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
})), Rt, zt = L((() => {
	Lt(), Lt(), Rt = It;
})), Bt, Vt = L((() => {
	zt(), Bt = /*@__PURE__*/ k({
		__name: "RefreshAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: t }) {
			let n = t;
			return (t, r) => (j(), C(Rt, {
				cluster: e.cluster,
				object: e.object,
				onClose: r[0] ||= (e) => n("close")
			}, null, 8, ["cluster", "object"]));
		}
	});
})), Ht = /* @__PURE__ */ R({ default: () => Ut }), Ut, Wt = L((() => {
	Vt(), Vt(), Ut = Bt;
})), Gt, Kt = L((() => {
	zt(), Gt = /*@__PURE__*/ k({
		__name: "HardRefreshAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: t }) {
			let n = t;
			return (t, r) => (j(), C(Rt, {
				cluster: e.cluster,
				object: e.object,
				hard: "",
				onClose: r[0] ||= (e) => n("close")
			}, null, 8, ["cluster", "object"]));
		}
	});
})), qt = /* @__PURE__ */ R({ default: () => Jt }), Jt, Yt = L((() => {
	Kt(), Kt(), Jt = Gt;
})), Xt, Zt, Qt, $t, en = L((() => {
	Z(), Xt = { class: "row" }, Zt = { class: "row" }, Qt = { class: "row" }, $t = /*@__PURE__*/ k({
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
					E("div", Xt, [O(F(ce), {
						value: !!a.value,
						loading: o.value?.startsWith("auto-sync"),
						"data-test": "policy-auto-sync",
						"onUpdate:value": n[0] ||= (e) => m("auto-sync", e)
					}, null, 8, ["value", "loading"]), n[7] ||= E("span", null, "Auto-sync: sync when Git changes", -1)]),
					E("div", Zt, [O(F(ce), {
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
					E("div", Qt, [O(F(ce), {
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
})), tn = L((() => {})), nn = /* @__PURE__ */ R({ default: () => rn }), rn, an = L((() => {
	en(), en(), tn(), $(), rn = /*#__PURE__*/ Q($t, [["__scopeId", "data-v-44c35b2d"]]);
})), on, sn = L((() => {
	on = /*@__PURE__*/ k({
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
})), cn = /* @__PURE__ */ R({ default: () => ln }), ln, un = L((() => {
	sn(), sn(), ln = on;
})), dn, fn = L((() => {
	Z(), dn = /*@__PURE__*/ k({
		__name: "DeleteAction",
		props: {
			cluster: {},
			object: {}
		},
		emits: ["close"],
		setup(e, { emit: t }) {
			let n = e, r = t, a = o(), s = (n.object.metadata.finalizers ?? []).some((e) => e.startsWith(je)), c = M(s ? "cascade" : "app-only"), d = M(""), f = M(!1), p = M(null), m = S(() => (n.object.status?.resources ?? []).length);
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
})), pn = L((() => {})), mn = /* @__PURE__ */ R({ default: () => hn }), hn, gn = L((() => {
	fn(), fn(), pn(), $(), hn = /*#__PURE__*/ Q(dn, [["__scopeId", "data-v-a9a29bfc"]]);
})), _n, vn, yn, bn, xn, Sn = L((() => {
	Z(), _n = { "data-test": "argocd-project-card" }, vn = { key: 1 }, yn = { key: 4 }, bn = { class: "muted" }, xn = /*@__PURE__*/ k({
		__name: "ProjectAppsCard",
		props: {
			cluster: {},
			project: {}
		},
		setup(e) {
			let t = e, { ResourceLink: n } = ye().components, { items: r, loading: i, error: a } = ye().composables.useLiveList(() => ({
				cluster: t.cluster,
				type: ke,
				namespace: t.project.spec.namespace
			}), { sort: (e, t) => e.metadata.name.localeCompare(t.metadata.name) }), o = S(() => Ee(t.cluster));
			return (t, s) => (j(), T("div", _n, [
				o.value ? (j(), C(F(l), {
					key: 0,
					type: "info",
					class: "gap"
				}, {
					default: I(() => [...s[0] ||= [D(" View-only on this cluster. ", -1)]]),
					_: 1
				})) : w("", !0),
				F(a) ? (j(), T("span", vn, P(F(a)), 1)) : F(i) ? (j(), C(F(se), {
					key: 2,
					size: "small"
				})) : F(r).length ? (j(), T("table", yn, [(j(!0), T(x, null, ue(F(r), (t) => (j(), T("tr", { key: t.metadata.uid }, [
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
					E("td", null, [(j(), C(N(F(Ie)(t))))]),
					E("td", null, [(j(), C(N(F(Le)(t))))])
				]))), 128))])) : (j(), C(F(g), {
					key: 3,
					size: "small",
					description: "No Applications in this Project yet."
				})),
				E("div", bn, " Argo CD project: capybara-" + P(e.project.metadata.name), 1)
			]));
		}
	});
})), Cn = L((() => {})), wn = /* @__PURE__ */ R({ default: () => Tn }), Tn, En = L((() => {
	Sn(), Sn(), Cn(), $(), Tn = /*#__PURE__*/ Q(xn, [["__scopeId", "data-v-2b5493ad"]]);
}));
//#endregion
//#region src/index.ts
Z();
var Dn = (e, t) => Te(t.cluster) && xe(e.metadata.namespace, t.cluster), On = n({
	name: "argocd",
	apiVersion: e,
	minApi: "1.3",
	register(e) {
		ve(e), be(), e.register({
			type: "nav-section",
			id: "argocd.section",
			label: "GitOps",
			order: 47
		}), e.registerResource(Ve, {
			order: 10,
			section: "argocd.section"
		}), e.registerResource(He, {
			order: 20,
			section: "argocd.section"
		});
		let t = () => Promise.resolve().then(() => (st(), at));
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
			component: () => Promise.resolve().then(() => (ht(), pt))
		}), e.register({
			type: "resource-detail-tab",
			id: "argocd.tab.history",
			label: "History",
			order: 14,
			kinds: ["Application"],
			component: () => Promise.resolve().then(() => (St(), bt))
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
			component: () => Promise.resolve().then(() => (kt(), Dt))
		}), e.register({
			type: "resource-action",
			id: "argocd.action.sync",
			label: "Sync",
			order: 5,
			kinds: ["Application"],
			appliesTo: Dn,
			component: () => Promise.resolve().then(() => (Ft(), Nt))
		}), e.register({
			type: "resource-action",
			id: "argocd.action.refresh",
			label: "Refresh",
			order: 6,
			kinds: ["Application"],
			appliesTo: Dn,
			component: () => Promise.resolve().then(() => (Wt(), Ht))
		}), e.register({
			type: "resource-action",
			id: "argocd.action.hard-refresh",
			label: "Hard refresh",
			order: 7,
			kinds: ["Application"],
			appliesTo: Dn,
			component: () => Promise.resolve().then(() => (Yt(), qt))
		}), e.register({
			type: "resource-action",
			id: "argocd.action.policy",
			label: "Sync policy",
			order: 8,
			kinds: ["Application"],
			appliesTo: Dn,
			component: () => Promise.resolve().then(() => (an(), nn))
		}), e.register({
			type: "resource-action",
			id: "argocd.action.edit",
			label: "Edit",
			order: 10,
			kinds: ["Application"],
			appliesTo: Dn,
			component: () => Promise.resolve().then(() => (un(), cn))
		}), e.register({
			type: "resource-action",
			id: "argocd.action.delete",
			label: "Delete",
			order: 90,
			danger: !0,
			kinds: ["Application"],
			appliesTo: Dn,
			component: () => Promise.resolve().then(() => (gn(), mn))
		}), e.register({
			type: "project-overview-card",
			id: "argocd.card.apps",
			title: "GitOps applications",
			order: 35,
			component: () => Promise.resolve().then(() => (En(), wn))
		});
	}
});
//#endregion
export { On as default };
