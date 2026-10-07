if(typeof document!=='undefined'){const s=document.createElement('style');s.dataset.plugin='monitoring';s.textContent=".muted[data-v-5d0ac06d]{opacity:.7;font-size:12px}.chart[data-v-22c05fe5]{width:100%;height:260px}.range[data-v-543ca935],.card[data-v-543ca935]{margin-bottom:12px}.muted[data-v-a67c69a0],.muted[data-v-bdaa3d00]{opacity:.7;margin-top:6px;font-size:12px}.note[data-v-bc9f3634]{margin-bottom:12px}\n/*$vite$:1*/";document.head.appendChild(s)}
import { EXTENSION_API_VERSION as e, definePlugin as t, pluginFetch as n, useCluster as r } from "@capybara/sdk";
import { Fragment as i, createBlock as a, createCommentVNode as o, createElementBlock as s, createElementVNode as c, createTextVNode as l, createVNode as u, defineComponent as d, h as f, onBeforeUnmount as p, onMounted as m, openBlock as h, ref as g, renderList as _, toDisplayString as v, unref as y, watch as b, withCtx as x } from "vue";
import { NAlert as S, NButton as C, NCard as w, NDataTable as T, NDescriptions as E, NDescriptionsItem as D, NGrid as O, NGridItem as k, NH2 as A, NProgress as j, NRadioButton as ee, NRadioGroup as te, NSpace as ne, NSpin as re, NStatistic as ie, NTag as ae, useThemeVars as oe } from "naive-ui";
//#region \0rolldown/runtime.js
var se = Object.defineProperty, M = (e, t, n) => () => {
	if (n) throw n[0];
	try {
		return e && (t = e(e = 0)), t;
	} catch (e) {
		throw n = [e], e;
	}
}, ce = (e, t) => {
	let n = {};
	for (var r in e) se(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || se(n, Symbol.toStringTag, { value: "Module" }), n;
};
//#endregion
//#region src/api.ts
function le(e) {
	let t = [
		"B",
		"KiB",
		"MiB",
		"GiB",
		"TiB"
	], n = 0;
	for (; e >= 1024 && n < t.length - 1;) e /= 1024, n++;
	return `${e.toFixed(+!!n)} ${t[n]}`;
}
function ue(e) {
	if (e === 0) return "0";
	if (e >= 1) return `${e.toFixed(2)} cores`;
	let t = e * 1e3;
	return t < 10 ? `${t.toFixed(1)}m` : `${Math.round(t)}m`;
}
var de, fe, N, pe, me, he, ge, _e, ve, ye = M((() => {
	de = [
		"1h",
		"6h",
		"24h",
		"7d"
	], fe = encodeURIComponent, N = (e) => n("monitoring", e), pe = (e, t, n, r, i) => N(`/clusters/${fe(e)}/metrics/${t}?${new URLSearchParams({
		namespace: n ?? "",
		name: r,
		range: i
	})}`), me = (e) => N(`/clusters/${fe(e)}/overview`), he = (e) => N(`/clusters/${fe(e)}/status`), ge = (e) => N(`/clusters/${fe(e)}/alerts`), _e = (e, t) => N(`/clusters/${fe(e)}/namespaces/${fe(t)}/usage`), ve = (e) => `/api/plugins/monitoring/grafana/${fe(e)}/`;
})), be, xe, Se, Ce = M((() => {
	ye(), be = { "data-test": "monitoring-overview" }, xe = { class: "muted" }, Se = /*@__PURE__*/ d({
		__name: "OverviewPage",
		setup(e) {
			let t = r(), n = g(null), i = g(""), d = g(null), f;
			async function m() {
				if (t.value) try {
					let [e, r] = await Promise.all([me(t.value), he(t.value)]);
					n.value = e, i.value = r.version, d.value = null;
				} catch (e) {
					d.value = e instanceof Error ? e.message : String(e);
				}
			}
			b(t, () => {
				m(), clearInterval(f), f = setInterval(() => void m(), 3e4);
			}, { immediate: !0 }), p(() => clearInterval(f));
			let _ = (e, t) => t > 0 ? Math.round(e / t * 100) : 0, T = oe();
			return (e, r) => (h(), s("div", be, [
				u(y(ne), {
					align: "center",
					justify: "space-between"
				}, {
					default: x(() => [u(y(A), null, {
						default: x(() => [...r[0] ||= [l("Observe", -1)]]),
						_: 1
					}), y(t) ? (h(), a(y(C), {
						key: 0,
						tag: "a",
						href: y(ve)(y(t)),
						target: "_blank",
						rel: "noopener"
					}, {
						default: x(() => [...r[1] ||= [l(" Open Grafana ", -1)]]),
						_: 1
					}, 8, ["href"])) : o("", !0)]),
					_: 1
				}),
				d.value ? (h(), a(y(S), {
					key: 0,
					type: "warning"
				}, {
					default: x(() => [l(v(d.value), 1)]),
					_: 1
				})) : o("", !0),
				n.value ? (h(), a(y(O), {
					key: 1,
					cols: "1 m:3",
					responsive: "screen",
					"x-gap": 16,
					"y-gap": 16
				}, {
					default: x(() => [
						u(y(k), null, {
							default: x(() => [u(y(w), {
								title: "CPU",
								size: "small"
							}, {
								default: x(() => [u(y(ie), { value: `${y(ue)(n.value.cpuUsed)} of ${y(ue)(n.value.cpuCapacity)}` }, null, 8, ["value"]), u(y(j), {
									type: "line",
									color: y(T).primaryColor,
									percentage: _(n.value.cpuUsed, n.value.cpuCapacity)
								}, null, 8, ["color", "percentage"])]),
								_: 1
							})]),
							_: 1
						}),
						u(y(k), null, {
							default: x(() => [u(y(w), {
								title: "Memory",
								size: "small"
							}, {
								default: x(() => [u(y(ie), { value: `${y(le)(n.value.memoryUsed)} of ${y(le)(n.value.memoryCapacity)}` }, null, 8, ["value"]), u(y(j), {
									type: "line",
									color: y(T).primaryColor,
									percentage: _(n.value.memoryUsed, n.value.memoryCapacity)
								}, null, 8, ["color", "percentage"])]),
								_: 1
							})]),
							_: 1
						}),
						u(y(k), null, {
							default: x(() => [u(y(w), {
								title: "Scrape targets",
								size: "small"
							}, {
								default: x(() => [u(y(ie), {
									value: `${n.value.targetsUp} up, ${n.value.targetsDown} down`,
									"data-test": "targets"
								}, null, 8, ["value"]), c("span", xe, "Prometheus " + v(i.value), 1)]),
								_: 1
							})]),
							_: 1
						})
					]),
					_: 1
				})) : o("", !0)
			]));
		}
	});
})), we = M((() => {})), Te, Ee = M((() => {
	Te = (e, t) => {
		let n = e.__vccOpts || e;
		for (let [e, r] of t) n[e] = r;
		return n;
	};
})), De = /* @__PURE__ */ ce({ default: () => Oe }), Oe, ke = M((() => {
	Ce(), Ce(), we(), Ee(), Oe = /*#__PURE__*/ Te(Se, [["__scopeId", "data-v-5d0ac06d"]]);
})), Ae, je = M((() => {
	ye(), Ae = /*@__PURE__*/ d({
		__name: "AlertsPage",
		setup(e) {
			let t = r(), n = g([]), i = g(!0), c = g(null), d;
			async function m() {
				if (t.value) try {
					n.value = await ge(t.value), c.value = null;
				} catch (e) {
					c.value = e instanceof Error ? e.message : String(e);
				} finally {
					i.value = !1;
				}
			}
			b(t, () => {
				m(), clearInterval(d), d = setInterval(() => void m(), 3e4);
			}, { immediate: !0 }), p(() => clearInterval(d));
			let _ = [
				{
					key: "name",
					title: "Alert",
					sorter: (e, t) => e.name.localeCompare(t.name)
				},
				{
					key: "state",
					title: "State",
					width: 100,
					render: (e) => f(ae, {
						size: "small",
						bordered: !1,
						type: e.state === "firing" ? "error" : "warning"
					}, () => e.state)
				},
				{
					key: "severity",
					title: "Severity",
					width: 100,
					render: (e) => e.severity ?? "—"
				},
				{
					key: "summary",
					title: "Summary",
					render: (e) => e.summary ?? "—"
				},
				{
					key: "activeAt",
					title: "Since",
					width: 200,
					render: (e) => e.activeAt ? new Date(e.activeAt).toLocaleString() : "—"
				}
			];
			return (e, t) => (h(), s("div", null, [
				u(y(A), null, {
					default: x(() => [...t[0] ||= [l("Alerts", -1)]]),
					_: 1
				}),
				c.value ? (h(), a(y(S), {
					key: 0,
					type: "warning"
				}, {
					default: x(() => [l(v(c.value), 1)]),
					_: 1
				})) : o("", !0),
				u(y(w), null, {
					default: x(() => [u(y(T), {
						columns: _,
						data: n.value,
						loading: i.value,
						size: "small",
						"data-test": "monitoring-alerts"
					}, null, 8, ["data", "loading"])]),
					_: 1
				})
			]));
		}
	});
})), Me = /* @__PURE__ */ ce({ default: () => Ne }), Ne, Pe = M((() => {
	je(), je(), Ne = Ae;
})), Fe, Ie = M((() => {
	ye(), Fe = /*@__PURE__*/ d({
		__name: "GrafanaPage",
		setup(e) {
			let t = r();
			return (e, n) => (h(), s("div", null, [u(y(A), null, {
				default: x(() => [...n[0] ||= [l("Grafana", -1)]]),
				_: 1
			}), u(y(w), null, {
				default: x(() => [n[2] ||= c("p", null, "Grafana's dashboards for this cluster, read-only (anonymous Viewer) through Capybara.", -1), y(t) ? (h(), a(y(C), {
					key: 0,
					type: "primary",
					tag: "a",
					href: y(ve)(y(t)),
					target: "_blank",
					rel: "noopener",
					"data-test": "open-grafana"
				}, {
					default: x(() => [...n[1] ||= [l(" Open Grafana ", -1)]]),
					_: 1
				}, 8, ["href"])) : o("", !0)]),
				_: 1
			})]));
		}
	});
})), Le = /* @__PURE__ */ ce({ default: () => Re }), Re, ze = M((() => {
	Ie(), Ie(), Re = Fe;
}));
//#endregion
//#region node_modules/tslib/tslib.es6.js
function P(e, t) {
	if (typeof t != "function" && t !== null) throw TypeError("Class extends value " + String(t) + " is not a constructor or null");
	Be(e, t);
	function n() {
		this.constructor = e;
	}
	e.prototype = t === null ? Object.create(t) : (n.prototype = t.prototype, new n());
}
var Be, F = M((() => {
	Be = function(e, t) {
		return Be = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(e, t) {
			e.__proto__ = t;
		} || function(e, t) {
			for (var n in t) Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
		}, Be(e, t);
	};
}));
//#endregion
//#region node_modules/zrender/lib/core/platform.js
function Ve(e) {
	var t = {};
	if (typeof JSON > "u") return t;
	for (var n = 0; n < e.length; n++) {
		var r = String.fromCharCode(n + 32);
		t[r] = (e.charCodeAt(n) - We) / Ge;
	}
	return t;
}
var He, Ue, We, Ge, Ke, qe, Je, Ye = M((() => {
	He = "sans-serif", Ue = "12px " + He, We = 20, Ge = 100, Ke = "007LLmW'55;N0500LLLLLLLLLL00NNNLzWW\\\\WQb\\0FWLg\\bWb\\WQ\\WrWWQ000CL5LLFLL0LL**F*gLLLL5F0LF\\FFF5.5N", qe = Ve(Ke), Je = {
		createCanvas: function() {
			return typeof document < "u" && document.createElement("canvas");
		},
		measureText: (function() {
			var e, t;
			return function(n, r) {
				if (!e) {
					var i = Je.createCanvas();
					e = i && i.getContext("2d");
				}
				if (e) return t !== r && (t = e.font = r || "12px sans-serif"), e.measureText(n);
				n ||= "", r ||= "12px sans-serif";
				var a = /((?:\d+)?\.?\d*)px/.exec(r), o = a && +a[1] || 12, s = 0;
				if (r.indexOf("mono") >= 0) s = o * n.length;
				else for (var c = 0; c < n.length; c++) {
					var l = qe[n[c]];
					s += l == null ? o : l * o;
				}
				return { width: s };
			};
		})(),
		loadImage: function(e, t, n) {
			var r = new Image();
			return r.onload = t, r.onerror = n, r.src = e, r;
		},
		getTime: function() {
			return Date.now ? Date.now() : +/* @__PURE__ */ new Date();
		}
	};
}));
//#endregion
//#region node_modules/zrender/lib/core/util.js
function Xe() {
	return Ut >= Wt && (Ut = 0), Ut++;
}
function Ze() {
	var e = [...arguments];
	typeof console < "u" && console.error.apply(console, e);
}
function I(e) {
	if (typeof e != "object" || !e) return e;
	var t = e, n = Pt.call(e);
	if (n === "[object Array]") {
		if (!Tt(e)) {
			t = [];
			for (var r = 0, i = e.length; r < i; r++) t[r] = I(e[r]);
		}
	} else if (Nt[n]) {
		if (!Tt(e)) {
			var a = e.constructor;
			if (a.from) t = a.from(e);
			else {
				t = new a(e.length);
				for (var r = 0, i = e.length; r < i; r++) t[r] = e[r];
			}
		}
	} else if (!Mt[n] && !Tt(e) && !mt(e)) for (var o in t = {}, e) e.hasOwnProperty(o) && o !== Ht && (t[o] = I(e[o]));
	return t;
}
function Qe(e, t, n) {
	if (!W(t) || !W(e)) return n ? I(t) : e;
	for (var r in t) if (t.hasOwnProperty(r) && r !== Ht) {
		var i = e[r], a = t[r];
		W(a) && W(i) && !V(a) && !V(i) && !mt(a) && !mt(i) && !ft(a) && !ft(i) && !Tt(a) && !Tt(i) ? Qe(i, a, n) : (n || !(r in e)) && (e[r] = I(t[r]));
	}
	return e;
}
function L(e, t) {
	if (Object.assign) Object.assign(e, t);
	else for (var n in t) t.hasOwnProperty(n) && n !== Ht && (e[n] = t[n]);
	return e;
}
function $e(e, t, n) {
	e ||= {};
	for (var r = 0; r < n.length; r++) {
		var i = n[r];
		e[i] = t[i];
	}
	return e;
}
function et(e, t, n) {
	for (var r = st(t), i = 0, a = r.length; i < a; i++) {
		var o = r[i];
		(n ? t[o] != null : e[o] == null) && (e[o] = t[o]);
	}
	return e;
}
function R(e, t) {
	if (e) {
		if (e.indexOf) return e.indexOf(t);
		for (var n = 0, r = e.length; n < r; n++) if (e[n] === t) return n;
	}
	return -1;
}
function tt(e, t) {
	var n = e.prototype;
	function r() {}
	for (var i in r.prototype = t.prototype, e.prototype = new r(), n) n.hasOwnProperty(i) && (e.prototype[i] = n[i]);
	e.prototype.constructor = e, e.superClass = t;
}
function nt(e, t, n) {
	if (e = "prototype" in e ? e.prototype : e, t = "prototype" in t ? t.prototype : t, Object.getOwnPropertyNames) for (var r = Object.getOwnPropertyNames(t), i = 0; i < r.length; i++) {
		var a = r[i];
		a !== "constructor" && (n ? t[a] != null : e[a] == null) && (e[a] = t[a]);
	}
	else et(e, t, n);
}
function rt(e) {
	return !e || typeof e == "string" ? !1 : typeof e.length == "number";
}
function z(e, t, n) {
	if (e && t) {
		if (e.forEach && e.forEach === It) e.forEach(t, n);
		else if (e.length === +e.length) for (var r = 0, i = e.length; r < i; r++) t.call(n, e[r], r, e);
		else for (var a in e) e.hasOwnProperty(a) && t.call(n, e[a], a, e);
	}
}
function B(e, t, n) {
	if (!e) return [];
	if (!t) return bt(e);
	if (e.map && e.map === zt) return e.map(t, n);
	for (var r = [], i = 0, a = e.length; i < a; i++) r.push(t.call(n, e[i], i, e));
	return r;
}
function it(e, t, n, r) {
	if (e && t) {
		for (var i = 0, a = e.length; i < a; i++) n = t.call(r, n, e[i], i, e);
		return n;
	}
}
function at(e, t, n) {
	if (!e) return [];
	if (!t) return bt(e);
	if (e.filter && e.filter === Lt) return e.filter(t, n);
	for (var r = [], i = 0, a = e.length; i < a; i++) t.call(n, e[i], i, e) && r.push(e[i]);
	return r;
}
function ot(e, t, n) {
	if (e && t) {
		for (var r = 0, i = e.length; r < i; r++) if (t.call(n, e[r], r, e)) return e[r];
	}
}
function st(e) {
	if (!e) return [];
	if (Object.keys) return Object.keys(e);
	var t = [];
	for (var n in e) e.hasOwnProperty(n) && t.push(n);
	return t;
}
function ct(e, t) {
	var n = [...arguments].slice(2);
	return function() {
		return e.apply(t, n.concat(Rt.call(arguments)));
	};
}
function lt(e) {
	var t = [...arguments].slice(1);
	return function() {
		return e.apply(this, t.concat(Rt.call(arguments)));
	};
}
function V(e) {
	return Array.isArray ? Array.isArray(e) : Pt.call(e) === "[object Array]";
}
function H(e) {
	return typeof e == "function";
}
function U(e) {
	return typeof e == "string";
}
function ut(e) {
	return Pt.call(e) === "[object String]";
}
function dt(e) {
	return typeof e == "number";
}
function W(e) {
	var t = typeof e;
	return t === "function" || !!e && t === "object";
}
function ft(e) {
	return !!Mt[Pt.call(e)];
}
function pt(e) {
	return !!Nt[Pt.call(e)];
}
function mt(e) {
	return typeof e == "object" && typeof e.nodeType == "number" && typeof e.ownerDocument == "object";
}
function ht(e) {
	return e.colorStops != null;
}
function gt(e) {
	return e.image != null;
}
function _t(e) {
	return e !== e;
}
function vt() {
	for (var e = [...arguments], t = 0, n = e.length; t < n; t++) if (e[t] != null) return e[t];
}
function G(e, t) {
	return e ?? t;
}
function yt(e, t, n) {
	return e ?? t ?? n;
}
function bt(e) {
	var t = [...arguments].slice(1);
	return Rt.apply(e, t);
}
function xt(e) {
	if (typeof e == "number") return [
		e,
		e,
		e,
		e
	];
	var t = e.length;
	return t === 2 ? [
		e[0],
		e[1],
		e[0],
		e[1]
	] : t === 3 ? [
		e[0],
		e[1],
		e[2],
		e[1]
	] : e;
}
function St(e, t) {
	if (!e) throw Error(t);
}
function Ct(e) {
	return e == null ? null : typeof e.trim == "function" ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
}
function wt(e) {
	e[Kt] = !0;
}
function Tt(e) {
	return e[Kt];
}
function Et() {
	return Jt ? /* @__PURE__ */ new Map() : new qt();
}
function K(e) {
	return new Yt(e);
}
function Dt(e, t) {
	for (var n = new e.constructor(e.length + t.length), r = 0; r < e.length; r++) n[r] = e[r];
	for (var i = e.length, r = 0; r < t.length; r++) n[r + i] = t[r];
	return n;
}
function Ot(e, t) {
	var n;
	if (Object.create) n = Object.create(e);
	else {
		var r = function() {};
		r.prototype = e, n = new r();
	}
	return t && L(n, t), n;
}
function kt(e) {
	var t = e.style;
	t.webkitUserSelect = "none", t.userSelect = "none", t.webkitTapHighlightColor = "rgba(0,0,0,0)", t["-webkit-touch-callout"] = "none";
}
function At(e, t) {
	return e.hasOwnProperty(t);
}
function jt() {}
var Mt, Nt, Pt, Ft, It, Lt, Rt, zt, Bt, Vt, Ht, Ut, Wt, Gt, Kt, qt, Jt, Yt, Xt, q = M((() => {
	Ye(), Mt = it([
		"Function",
		"RegExp",
		"Date",
		"Error",
		"CanvasGradient",
		"CanvasPattern",
		"Image",
		"Canvas"
	], function(e, t) {
		return e["[object " + t + "]"] = !0, e;
	}, {}), Nt = it([
		"Int8",
		"Uint8",
		"Uint8Clamped",
		"Int16",
		"Uint16",
		"Int32",
		"Uint32",
		"Float32",
		"Float64"
	], function(e, t) {
		return e["[object " + t + "Array]"] = !0, e;
	}, {}), Pt = Object.prototype.toString, Ft = Array.prototype, It = Ft.forEach, Lt = Ft.filter, Rt = Ft.slice, zt = Ft.map, Bt = function() {}.constructor, Vt = Bt ? Bt.prototype : null, Ht = "__proto__", Ut = 2311, Wt = 2 ** 53 - 1, Je.createCanvas, Gt = Vt && H(Vt.bind) ? Vt.call.bind(Vt.bind) : ct, Kt = "__ec_primitive__", qt = function() {
		function e() {
			this.data = {};
		}
		return e.prototype.delete = function(e) {
			var t = this.has(e);
			return t && delete this.data[e], t;
		}, e.prototype.has = function(e) {
			return this.data.hasOwnProperty(e);
		}, e.prototype.get = function(e) {
			return this.data[e];
		}, e.prototype.set = function(e, t) {
			return this.data[e] = t, this;
		}, e.prototype.keys = function() {
			return st(this.data);
		}, e.prototype.forEach = function(e) {
			var t = this.data;
			for (var n in t) t.hasOwnProperty(n) && e(t[n], n);
		}, e;
	}(), Jt = typeof Map == "function", Yt = function() {
		function e(t) {
			var n = V(t);
			this.data = Et();
			var r = this;
			t instanceof e ? t.each(i) : t && z(t, i);
			function i(e, t) {
				n ? r.set(e, t) : r.set(t, e);
			}
		}
		return e.prototype.hasKey = function(e) {
			return this.data.has(e);
		}, e.prototype.get = function(e) {
			return this.data.get(e);
		}, e.prototype.set = function(e, t) {
			return this.data.set(e, t), t;
		}, e.prototype.each = function(e, t) {
			this.data.forEach(function(n, r) {
				e.call(t, n, r);
			});
		}, e.prototype.keys = function() {
			var e = this.data.keys();
			return Jt ? Array.from(e) : e;
		}, e.prototype.removeKey = function(e) {
			this.data.delete(e);
		}, e;
	}(), Xt = 180 / Math.PI;
}));
//#endregion
//#region node_modules/zrender/lib/core/env.js
function Zt(e, t) {
	var n = t.browser, r = e.match(/Firefox\/([\d.]+)/), i = e.match(/MSIE\s([\d.]+)/) || e.match(/Trident\/.+?rv:(([\d.]+))/), a = e.match(/Edge?\/([\d.]+)/), o = /micromessenger/i.test(e);
	if (r && (n.firefox = !0, n.version = r[1]), i && (n.ie = !0, n.version = i[1]), a && (n.edge = !0, n.version = a[1], n.newEdge = +a[1].split(".")[0] > 18), o && (n.weChat = !0), t.svgSupported = typeof SVGRect < "u", t.touchEventsSupported = "ontouchstart" in window && !n.ie && !n.edge, t.pointerEventsSupported = "onpointerdown" in window && (n.edge || n.ie && +n.version >= 11), t.domSupported = typeof document < "u") {
		var s = document.documentElement.style;
		t.transform3dSupported = (n.ie && "transition" in s || n.edge || "WebKitCSSMatrix" in window && "m11" in new WebKitCSSMatrix() || "MozPerspective" in s) && !("OTransition" in s), t.transformSupported = t.transform3dSupported || n.ie && +n.version >= 9;
	}
}
var Qt, J, $t = M((() => {
	Qt = function() {
		function e() {
			this.firefox = !1, this.ie = !1, this.edge = !1, this.newEdge = !1, this.weChat = !1;
		}
		return e;
	}(), J = new (function() {
		function e() {
			this.browser = new Qt(), this.node = !1, this.wxa = !1, this.worker = !1, this.svgSupported = !1, this.touchEventsSupported = !1, this.pointerEventsSupported = !1, this.domSupported = !1, this.transformSupported = !1, this.transform3dSupported = !1, this.hasGlobalWindow = typeof window < "u";
		}
		return e;
	}())(), typeof wx == "object" && typeof wx.getSystemInfoSync == "function" ? (J.wxa = !0, J.touchEventsSupported = !0) : typeof document > "u" && typeof self < "u" ? J.worker = !0 : !J.hasGlobalWindow || "Deno" in window || typeof navigator < "u" && typeof navigator.userAgent == "string" && navigator.userAgent.indexOf("Node.js") > -1 ? (J.node = !0, J.svgSupported = !0) : Zt(navigator.userAgent, J);
}));
//#endregion
//#region node_modules/echarts/lib/util/clazz.js
function en(e) {
	var t = {
		main: "",
		sub: ""
	};
	if (e) {
		var n = e.split(dn);
		t.main = n[0] || "", t.sub = n[1] || "";
	}
	return t;
}
function tn(e) {
	St(/^[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)?$/.test(e), "componentType \"" + e + "\" illegal");
}
function nn(e) {
	return !!(e && e[pn]);
}
function rn(e, t) {
	e.$constructor = e, e.extend = function(e) {
		var t = this, n;
		return an(t) ? n = function(e) {
			P(t, e);
			function t() {
				return e.apply(this, arguments) || this;
			}
			return t;
		}(t) : (n = function() {
			(e.$constructor || t).apply(this, arguments);
		}, tt(n, this)), L(n.prototype, e), n[pn] = !0, n.extend = this.extend, n.superCall = cn, n.superApply = ln, n.superClass = t, n;
	};
}
function an(e) {
	return H(e) && /^class\s/.test(Function.prototype.toString.call(e));
}
function on(e, t) {
	e.extend = t.extend;
}
function sn(e) {
	var t = ["__\0is_clz", mn++].join("_");
	e.prototype[t] = !0, e.isInstance = function(e) {
		return !!(e && e[t]);
	};
}
function cn(e, t) {
	var n = [...arguments].slice(2);
	return this.superClass.prototype[t].apply(e, n);
}
function ln(e, t, n) {
	return this.superClass.prototype[t].apply(e, n);
}
function un(e) {
	var t = {};
	e.registerClass = function(e) {
		var r = e.type || e.prototype.type;
		if (r) {
			tn(r), e.prototype.type = r;
			var i = en(r);
			if (!i.sub) t[i.main] = e;
			else if (i.sub !== fn) {
				var a = n(i);
				a[i.sub] = e;
			}
		}
		return e;
	}, e.getClass = function(e, n, r) {
		var i = t[e];
		if (i && i[fn] && (i = n ? i[n] : null), r && !i) throw Error(n ? "Component " + e + "." + (n || "") + " is used but not imported." : e + ".type should be specified.");
		return i;
	}, e.getClassesByMainType = function(e) {
		var n = en(e), r = [], i = t[n.main];
		return i && i[fn] ? z(i, function(e, t) {
			t !== fn && r.push(e);
		}) : r.push(i), r;
	}, e.hasClass = function(e) {
		return !!t[en(e).main];
	}, e.getAllClassMainTypes = function() {
		var e = [];
		return z(t, function(t, n) {
			e.push(n);
		}), e;
	}, e.hasSubTypes = function(e) {
		var n = t[en(e).main];
		return n && n[fn];
	};
	function n(e) {
		var n = t[e.main];
		return (!n || !n[fn]) && (n = t[e.main] = {}, n[fn] = !0), n;
	}
}
var dn, fn, pn, mn, hn = M((() => {
	F(), q(), dn = ".", fn = "___EC__COMPONENT__CONTAINER___", pn = "___EC__EXTENDED_CLASS___", mn = Math.round(Math.random() * 10);
}));
//#endregion
//#region node_modules/echarts/lib/model/mixin/makeStyleMapper.js
function gn(e, t) {
	for (var n = 0; n < e.length; n++) e[n][1] || (e[n][1] = e[n][0]);
	return t ||= !1, function(n, r, i) {
		for (var a = {}, o = 0; o < e.length; o++) {
			var s = e[o][1];
			if (!(r && R(r, s) >= 0 || i && R(i, s) < 0)) {
				var c = n.getShallow(s, t);
				c != null && (a[e[o][0]] = c);
			}
		}
		return a;
	};
}
var _n = M((() => {
	q();
})), vn, yn, bn, xn = M((() => {
	_n(), vn = [
		["fill", "color"],
		["shadowBlur"],
		["shadowOffsetX"],
		["shadowOffsetY"],
		["opacity"],
		["shadowColor"]
	], yn = gn(vn), bn = function() {
		function e() {}
		return e.prototype.getAreaStyle = function(e, t) {
			return yn(this, e, t);
		}, e;
	}();
})), Sn, Cn, wn, Tn = M((() => {
	Sn = function() {
		function e(e) {
			this.value = e;
		}
		return e;
	}(), Cn = function() {
		function e() {
			this._len = 0;
		}
		return e.prototype.insert = function(e) {
			var t = new Sn(e);
			return this.insertEntry(t), t;
		}, e.prototype.insertEntry = function(e) {
			this.head ? (this.tail.next = e, e.prev = this.tail, e.next = null, this.tail = e) : this.head = this.tail = e, this._len++;
		}, e.prototype.remove = function(e) {
			var t = e.prev, n = e.next;
			t ? t.next = n : this.head = n, n ? n.prev = t : this.tail = t, e.next = e.prev = null, this._len--;
		}, e.prototype.len = function() {
			return this._len;
		}, e.prototype.clear = function() {
			this.head = this.tail = null, this._len = 0;
		}, e;
	}(), wn = function() {
		function e(e) {
			this._list = new Cn(), this._maxSize = 10, this._map = {}, this._maxSize = e;
		}
		return e.prototype.put = function(e, t) {
			var n = this._list, r = this._map, i = null;
			if (r[e] == null) {
				var a = n.len(), o = this._lastRemovedEntry;
				if (a >= this._maxSize && a > 0) {
					var s = n.head;
					n.remove(s), delete r[s.key], i = s.value, this._lastRemovedEntry = s;
				}
				o ? o.value = t : o = new Sn(t), o.key = e, n.insertEntry(o), r[e] = o;
			}
			return i;
		}, e.prototype.get = function(e) {
			var t = this._map[e], n = this._list;
			if (t != null) return t !== n.tail && (n.remove(t), n.insertEntry(t)), t.value;
		}, e.prototype.clear = function() {
			this._list.clear(), this._map = {};
		}, e.prototype.len = function() {
			return this._list.len();
		}, e;
	}();
}));
//#endregion
//#region node_modules/zrender/lib/graphic/helper/image.js
function En(e) {
	if (typeof e == "string") {
		var t = An.get(e);
		return t && t.image;
	}
	return e;
}
function Dn(e, t, n, r, i) {
	if (!e) return t;
	if (typeof e == "string") {
		if (t && t.__zrImageSrc === e || !n) return t;
		var a = An.get(e), o = {
			hostEl: n,
			cb: r,
			cbPayload: i
		};
		return a ? (t = a.image, !kn(t) && a.pending.push(o)) : (t = Je.loadImage(e, On, On), t.__zrImageSrc = e, An.put(e, t.__cachedImgObj = {
			image: t,
			pending: [o]
		})), t;
	}
	return e;
}
function On() {
	var e = this.__cachedImgObj;
	this.onload = this.onerror = this.__cachedImgObj = null;
	for (var t = 0; t < e.pending.length; t++) {
		var n = e.pending[t], r = n.cb;
		r && r(this, n.cbPayload), n.hostEl.dirty();
	}
	e.pending.length = 0;
}
function kn(e) {
	return e && e.width && e.height;
}
var An, jn = M((() => {
	Tn(), Ye(), An = new wn(50);
}));
//#endregion
//#region node_modules/zrender/lib/core/matrix.js
function Mn() {
	return [
		1,
		0,
		0,
		1,
		0,
		0
	];
}
function Nn(e) {
	return e[0] = 1, e[1] = 0, e[2] = 0, e[3] = 1, e[4] = 0, e[5] = 0, e;
}
function Pn(e, t) {
	return e[0] = t[0], e[1] = t[1], e[2] = t[2], e[3] = t[3], e[4] = t[4], e[5] = t[5], e;
}
function Fn(e, t, n) {
	var r = t[0] * n[0] + t[2] * n[1], i = t[1] * n[0] + t[3] * n[1], a = t[0] * n[2] + t[2] * n[3], o = t[1] * n[2] + t[3] * n[3], s = t[0] * n[4] + t[2] * n[5] + t[4], c = t[1] * n[4] + t[3] * n[5] + t[5];
	return e[0] = r, e[1] = i, e[2] = a, e[3] = o, e[4] = s, e[5] = c, e;
}
function In(e, t, n) {
	return e[0] = t[0], e[1] = t[1], e[2] = t[2], e[3] = t[3], e[4] = t[4] + n[0], e[5] = t[5] + n[1], e;
}
function Ln(e, t, n, r) {
	r === void 0 && (r = [0, 0]);
	var i = t[0], a = t[2], o = t[4], s = t[1], c = t[3], l = t[5], u = Math.sin(n), d = Math.cos(n);
	return e[0] = i * d + s * u, e[1] = -i * u + s * d, e[2] = a * d + c * u, e[3] = -a * u + d * c, e[4] = d * (o - r[0]) + u * (l - r[1]) + r[0], e[5] = d * (l - r[1]) - u * (o - r[0]) + r[1], e;
}
function Rn(e, t, n) {
	var r = n[0], i = n[1];
	return e[0] = t[0] * r, e[1] = t[1] * i, e[2] = t[2] * r, e[3] = t[3] * i, e[4] = t[4] * r, e[5] = t[5] * i, e;
}
function zn(e, t) {
	var n = t[0], r = t[2], i = t[4], a = t[1], o = t[3], s = t[5], c = n * o - a * r;
	return c ? (c = 1 / c, e[0] = o * c, e[1] = -a * c, e[2] = -r * c, e[3] = n * c, e[4] = (r * s - o * i) * c, e[5] = (a * i - n * s) * c, e) : null;
}
var Bn = M((() => {}));
//#endregion
//#region node_modules/zrender/lib/core/vector.js
function Vn(e, t) {
	return e ??= 0, t ??= 0, [e, t];
}
function Hn(e) {
	return [e[0], e[1]];
}
function Un(e, t, n) {
	return e[0] = t, e[1] = n, e;
}
function Wn(e, t, n) {
	return e[0] = t[0] + n[0], e[1] = t[1] + n[1], e;
}
function Gn(e, t, n) {
	return e[0] = t[0] - n[0], e[1] = t[1] - n[1], e;
}
function Kn(e) {
	return Math.sqrt(qn(e));
}
function qn(e) {
	return e[0] * e[0] + e[1] * e[1];
}
function Jn(e, t, n) {
	return e[0] = t[0] * n, e[1] = t[1] * n, e;
}
function Yn(e, t) {
	var n = Kn(t);
	return n === 0 ? (e[0] = 0, e[1] = 0) : (e[0] = t[0] / n, e[1] = t[1] / n), e;
}
function Xn(e, t) {
	return Math.sqrt((e[0] - t[0]) * (e[0] - t[0]) + (e[1] - t[1]) * (e[1] - t[1]));
}
function Zn(e, t) {
	return (e[0] - t[0]) * (e[0] - t[0]) + (e[1] - t[1]) * (e[1] - t[1]);
}
function Qn(e, t, n) {
	var r = t[0], i = t[1];
	return e[0] = n[0] * r + n[2] * i + n[4], e[1] = n[1] * r + n[3] * i + n[5], e;
}
function $n(e, t, n) {
	return e[0] = Math.min(t[0], n[0]), e[1] = Math.min(t[1], n[1]), e;
}
function er(e, t, n) {
	return e[0] = Math.max(t[0], n[0]), e[1] = Math.max(t[1], n[1]), e;
}
var tr, nr, rr = M((() => {
	tr = Xn, nr = Zn;
})), ir, ar = M((() => {
	ir = function() {
		function e(e, t) {
			this.x = e || 0, this.y = t || 0;
		}
		return e.prototype.copy = function(e) {
			return this.x = e.x, this.y = e.y, this;
		}, e.prototype.clone = function() {
			return new e(this.x, this.y);
		}, e.prototype.set = function(e, t) {
			return this.x = e, this.y = t, this;
		}, e.prototype.equal = function(e) {
			return e.x === this.x && e.y === this.y;
		}, e.prototype.add = function(e) {
			return this.x += e.x, this.y += e.y, this;
		}, e.prototype.scale = function(e) {
			this.x *= e, this.y *= e;
		}, e.prototype.scaleAndAdd = function(e, t) {
			this.x += e.x * t, this.y += e.y * t;
		}, e.prototype.sub = function(e) {
			return this.x -= e.x, this.y -= e.y, this;
		}, e.prototype.dot = function(e) {
			return this.x * e.x + this.y * e.y;
		}, e.prototype.len = function() {
			return Math.sqrt(this.x * this.x + this.y * this.y);
		}, e.prototype.lenSquare = function() {
			return this.x * this.x + this.y * this.y;
		}, e.prototype.normalize = function() {
			var e = this.len();
			return this.x /= e, this.y /= e, this;
		}, e.prototype.distance = function(e) {
			var t = this.x - e.x, n = this.y - e.y;
			return Math.sqrt(t * t + n * n);
		}, e.prototype.distanceSquare = function(e) {
			var t = this.x - e.x, n = this.y - e.y;
			return t * t + n * n;
		}, e.prototype.negate = function() {
			return this.x = -this.x, this.y = -this.y, this;
		}, e.prototype.transform = function(e) {
			if (e) {
				var t = this.x, n = this.y;
				return this.x = e[0] * t + e[2] * n + e[4], this.y = e[1] * t + e[3] * n + e[5], this;
			}
		}, e.prototype.toArray = function(e) {
			return e[0] = this.x, e[1] = this.y, e;
		}, e.prototype.fromArray = function(e) {
			this.x = e[0], this.y = e[1];
		}, e.set = function(e, t, n) {
			e.x = t, e.y = n;
		}, e.copy = function(e, t) {
			e.x = t.x, e.y = t.y;
		}, e.len = function(e) {
			return Math.sqrt(e.x * e.x + e.y * e.y);
		}, e.lenSquare = function(e) {
			return e.x * e.x + e.y * e.y;
		}, e.dot = function(e, t) {
			return e.x * t.x + e.y * t.y;
		}, e.add = function(e, t, n) {
			e.x = t.x + n.x, e.y = t.y + n.y;
		}, e.sub = function(e, t, n) {
			e.x = t.x - n.x, e.y = t.y - n.y;
		}, e.scale = function(e, t, n) {
			e.x = t.x * n, e.y = t.y * n;
		}, e.scaleAndAdd = function(e, t, n, r) {
			e.x = t.x + n.x * r, e.y = t.y + n.y * r;
		}, e.lerp = function(e, t, n, r) {
			var i = 1 - r;
			e.x = i * t.x + r * n.x, e.y = i * t.y + r * n.y;
		}, e;
	}();
}));
//#endregion
//#region node_modules/zrender/lib/core/BoundingRect.js
function or(e, t, n, r, i, a, o, s) {
	var c = ur(t - n), l = ur(r - e), u = cr(c, l), d = dr[i], f = dr[1 - i], p = fr[i];
	t < n || r < e ? c < l ? (a && (yr[d] = -c), s && (o[d] = t, o[p] = 0)) : (a && (yr[d] = l), s && (o[d] = e, o[p] = 0)) : (o && (o[d] = lr(e, n), o[p] = cr(t, r) - o[d]), a && (u < br[0] || _r.useDir) && (br[0] = cr(u, br[0]), (c < l || !_r.bidirectional) && (vr[d] = c, vr[f] = 0, _r.useDir && _r.calcDirMTV()), (c >= l || !_r.bidirectional) && (vr[d] = -l, vr[f] = 0, _r.useDir && _r.calcDirMTV())));
}
function sr() {
	var e = 0, t = new ir(), n = new ir(), r = {
		minTv: new ir(),
		maxTv: new ir(),
		useDir: !1,
		dirMinTv: new ir(),
		touchThreshold: 0,
		bidirectional: !0,
		negativeSize: !1,
		reset: function(i, a) {
			r.touchThreshold = 0, i && i.touchThreshold != null && (r.touchThreshold = lr(0, i.touchThreshold)), r.negativeSize = !1, a && (r.minTv.set(Infinity, Infinity), r.maxTv.set(0, 0), r.useDir = !1, i && i.direction != null && (r.useDir = !0, r.dirMinTv.copy(r.minTv), n.copy(r.minTv), e = i.direction, r.bidirectional = i.bidirectional == null || !!i.bidirectional, r.bidirectional || t.set(Math.cos(e), Math.sin(e))));
		},
		calcDirMTV: function() {
			var a = r.minTv, o = r.dirMinTv, s = a.y * a.y + a.x * a.x, c = Math.sin(e), l = Math.cos(e), u = c * a.y + l * a.x;
			if (i(u)) {
				i(a.x) && i(a.y) && o.set(0, 0);
				return;
			}
			if (n.x = s * l / u, n.y = s * c / u, i(n.x) && i(n.y)) {
				o.set(0, 0);
				return;
			}
			(r.bidirectional || t.dot(n) > 0) && n.len() < o.len() && o.copy(n);
		}
	};
	function i(e) {
		return ur(e) < 1e-10;
	}
	return r;
}
var cr, lr, ur, dr, fr, pr, mr, hr, gr, _r, vr, yr, br, Y, xr, Sr, Cr, wr, Tr, Er, Dr = M((() => {
	Bn(), rr(), ar(), cr = Math.min, lr = Math.max, ur = Math.abs, dr = ["x", "y"], fr = ["width", "height"], pr = new ir(), mr = new ir(), hr = new ir(), gr = new ir(), _r = sr(), vr = _r.minTv, yr = _r.maxTv, br = [0, 0], Y = function() {
		function e(e, t, n, r) {
			xr(this, e, t, n, r);
		}
		return e.set = function(e, t, n, r, i) {
			return r < 0 && (t += r, r = -r), i < 0 && (n += i, i = -i), e.x = t, e.y = n, e.width = r, e.height = i, e;
		}, e.prototype.union = function(e) {
			var t = cr(e.x, this.x), n = cr(e.y, this.y);
			this.width = isFinite(this.x) && isFinite(this.width) ? lr(e.x + e.width, this.x + this.width) - t : e.width, this.height = isFinite(this.y) && isFinite(this.height) ? lr(e.y + e.height, this.y + this.height) - n : e.height, this.x = t, this.y = n;
		}, e.prototype.applyTransform = function(t) {
			e.applyTransform(this, this, t);
		}, e.prototype.calculateTransform = function(e) {
			return Cr(Mn(), this, e);
		}, e.prototype.intersect = function(t, n, r) {
			return e.intersect(this, t, n, r);
		}, e.intersect = function(t, n, r, i) {
			r && ir.set(r, 0, 0);
			var a = i && i.outIntersectRect || null, o = i && i.clamp;
			if (a && (a.x = a.y = a.width = a.height = NaN), !t || !n) return !1;
			t instanceof e || (t = xr(wr, t.x, t.y, t.width, t.height)), n instanceof e || (n = xr(Tr, n.x, n.y, n.width, n.height));
			var s = !!r;
			_r.reset(i, s);
			var c = _r.touchThreshold, l = t.x + c, u = t.x + t.width - c, d = t.y + c, f = t.y + t.height - c, p = n.x + c, m = n.x + n.width - c, h = n.y + c, g = n.y + n.height - c;
			if (l > u || d > f || p > m || h > g) return !1;
			var _ = !(u < p || m < l || f < h || g < d);
			return (s || a) && (br[0] = Infinity, br[1] = 0, or(l, u, p, m, 0, s, a, o), or(d, f, h, g, 1, s, a, o), s && ir.copy(r, _ ? _r.useDir ? _r.dirMinTv : vr : yr)), _;
		}, e.contain = function(e, t, n) {
			return t >= e.x && t <= e.x + e.width && n >= e.y && n <= e.y + e.height;
		}, e.prototype.contain = function(t, n) {
			return e.contain(this, t, n);
		}, e.prototype.clone = function() {
			return new e(this.x, this.y, this.width, this.height);
		}, e.prototype.copy = function(e) {
			Sr(this, e);
		}, e.prototype.plain = function() {
			return {
				x: this.x,
				y: this.y,
				width: this.width,
				height: this.height
			};
		}, e.prototype.isFinite = function() {
			return isFinite(this.x) && isFinite(this.y) && isFinite(this.width) && isFinite(this.height);
		}, e.prototype.isZero = function() {
			return this.width === 0 || this.height === 0;
		}, e.create = function(t) {
			return new e(t ? t.x : 0, t ? t.y : 0, t ? t.width : 0, t ? t.height : 0);
		}, e.copy = function(e, t) {
			return e.x = t.x, e.y = t.y, e.width = t.width, e.height = t.height, e;
		}, e.applyTransform = function(e, t, n) {
			if (!n) {
				e !== t && Sr(e, t);
				return;
			}
			if (n[1] < 1e-5 && n[1] > -1e-5 && n[2] < 1e-5 && n[2] > -1e-5) {
				var r = n[0], i = n[3], a = n[4], o = n[5];
				e.x = t.x * r + a, e.y = t.y * i + o, e.width = t.width * r, e.height = t.height * i, e.width < 0 && (e.x += e.width, e.width = -e.width), e.height < 0 && (e.y += e.height, e.height = -e.height);
				return;
			}
			pr.x = hr.x = t.x, pr.y = gr.y = t.y, mr.x = gr.x = t.x + t.width, mr.y = hr.y = t.y + t.height, pr.transform(n), gr.transform(n), mr.transform(n), hr.transform(n), e.x = cr(pr.x, mr.x, hr.x, gr.x), e.y = cr(pr.y, mr.y, hr.y, gr.y);
			var s = lr(pr.x, mr.x, hr.x, gr.x), c = lr(pr.y, mr.y, hr.y, gr.y);
			e.width = s - e.x, e.height = c - e.y;
		}, e.calculateTransform = function(e, t, n) {
			var r = n.width / t.width, i = n.height / t.height;
			return e = Nn(e || []), In(e, e, Un(Er, -t.x, -t.y)), Rn(e, e, Un(Er, r, i)), In(e, e, Un(Er, n.x, n.y)), e;
		}, e;
	}(), Y.create, xr = Y.set, Sr = Y.copy, Cr = Y.calculateTransform, Y.applyTransform, Y.contain, wr = new Y(0, 0, 0, 0), Tr = new Y(0, 0, 0, 0), Er = [];
}));
//#endregion
//#region node_modules/zrender/lib/contain/text.js
function Or(e) {
	zr ||= new wn(100), e ||= "12px sans-serif";
	var t = zr.get(e);
	return t || (t = {
		font: e,
		strWidthCache: new wn(500),
		asciiWidthMap: null,
		asciiWidthMapTried: !1,
		stWideCharWidth: Je.measureText("国", e).width,
		asciiCharWidth: Je.measureText("a", e).width
	}, zr.put(e, t)), t;
}
function kr(e) {
	if (!(Br >= Vr)) {
		e ||= "12px sans-serif";
		for (var t = [], n = +/* @__PURE__ */ new Date(), r = 0; r <= 127; r++) t[r] = Je.measureText(String.fromCharCode(r), e).width;
		var i = +/* @__PURE__ */ new Date() - n;
		return i > 16 ? Br = Vr : i > 2 && Br++, t;
	}
}
function Ar(e, t) {
	return e.asciiWidthMapTried ||= (e.asciiWidthMap = kr(e.font), !0), 0 <= t && t <= 127 ? e.asciiWidthMap == null ? e.asciiCharWidth : e.asciiWidthMap[t] : e.stWideCharWidth;
}
function jr(e, t) {
	var n = e.strWidthCache, r = n.get(t);
	return r ?? (r = Je.measureText(t, e.font).width, n.put(t, r)), r;
}
function Mr(e, t, n, r) {
	var i = jr(Or(t), e), a = Ir(t), o = Pr(0, i, n), s = Fr(0, a, r);
	return new Y(o, s, i, a);
}
function Nr(e, t, n, r) {
	var i = ((e || "") + "").split("\n");
	if (i.length === 1) return Mr(i[0], t, n, r);
	for (var a = new Y(0, 0, 0, 0), o = 0; o < i.length; o++) {
		var s = Mr(i[o], t, n, r);
		o === 0 ? a.copy(s) : a.union(s);
	}
	return a;
}
function Pr(e, t, n, r) {
	return n === "right" ? r ? e += t : e -= t : n === "center" && (r ? e += t / 2 : e -= t / 2), e;
}
function Fr(e, t, n, r) {
	return n === "middle" ? r ? e += t / 2 : e -= t / 2 : n === "bottom" && (r ? e += t : e -= t), e;
}
function Ir(e) {
	return Or(e).stWideCharWidth;
}
function Lr(e, t) {
	return typeof e == "string" ? e.lastIndexOf("%") >= 0 ? parseFloat(e) / 100 * t : parseFloat(e) : e;
}
function Rr(e, t, n) {
	var r = t.position || "inside", i = t.distance == null ? 5 : t.distance, a = n.height, o = n.width, s = a / 2, c = n.x, l = n.y, u = "left", d = "top";
	if (r instanceof Array) c += Lr(r[0], n.width), l += Lr(r[1], n.height), u = null, d = null;
	else switch (r) {
		case "left":
			c -= i, l += s, u = "right", d = "middle";
			break;
		case "right":
			c += i + o, l += s, d = "middle";
			break;
		case "top":
			c += o / 2, l -= i, u = "center", d = "bottom";
			break;
		case "bottom":
			c += o / 2, l += a + i, u = "center";
			break;
		case "inside":
			c += o / 2, l += s, u = "center", d = "middle";
			break;
		case "insideLeft":
			c += i, l += s, d = "middle";
			break;
		case "insideRight":
			c += o - i, l += s, u = "right", d = "middle";
			break;
		case "insideTop":
			c += o / 2, l += i, u = "center";
			break;
		case "insideBottom":
			c += o / 2, l += a - i, u = "center", d = "bottom";
			break;
		case "insideTopLeft":
			c += i, l += i;
			break;
		case "insideTopRight":
			c += o - i, l += i, u = "right";
			break;
		case "insideBottomLeft":
			c += i, l += a - i, d = "bottom";
			break;
		case "insideBottomRight": c += o - i, l += a - i, u = "right", d = "bottom";
	}
	return e ||= {}, e.x = c, e.y = l, e.align = u, e.verticalAlign = d, e;
}
var zr, Br, Vr, Hr = M((() => {
	Dr(), Tn(), Ye(), Br = 0, Vr = 5;
}));
//#endregion
//#region node_modules/zrender/lib/graphic/helper/parseText.js
function Ur(e, t, n, r, i, a) {
	if (!n) {
		e.text = "", e.isTruncated = !1;
		return;
	}
	var o = (t + "").split("\n");
	a = Wr(n, r, i, a);
	for (var s = !1, c = {}, l = 0, u = o.length; l < u; l++) Gr(c, o[l], a), o[l] = c.textLine, s ||= c.isTruncated;
	e.text = o.join("\n"), e.isTruncated = s;
}
function Wr(e, t, n, r) {
	r ||= {};
	var i = L({}, r);
	n = G(n, "..."), i.maxIterations = G(r.maxIterations, 2);
	var a = i.minChar = G(r.minChar, 0), o = i.fontMeasureInfo = Or(t), s = o.asciiCharWidth;
	i.placeholder = G(r.placeholder, "");
	for (var c = e = Math.max(0, e - 1), l = 0; l < a && c >= s; l++) c -= s;
	var u = jr(o, n);
	return u > c && (n = "", u = 0), c = e - u, i.ellipsis = n, i.ellipsisWidth = u, i.contentWidth = c, i.containerWidth = e, i;
}
function Gr(e, t, n) {
	var r = n.containerWidth, i = n.contentWidth, a = n.fontMeasureInfo;
	if (!r) {
		e.textLine = "", e.isTruncated = !1;
		return;
	}
	var o = jr(a, t);
	if (o <= r) {
		e.textLine = t, e.isTruncated = !1;
		return;
	}
	for (var s = 0;; s++) {
		if (o <= i || s >= n.maxIterations) {
			t += n.ellipsis;
			break;
		}
		var c = s === 0 ? Kr(t, i, a) : o > 0 ? Math.floor(t.length * i / o) : 0;
		t = t.substr(0, c), o = jr(a, t);
	}
	t === "" && (t = n.placeholder), e.textLine = t, e.isTruncated = !0;
}
function Kr(e, t, n) {
	for (var r = 0, i = 0, a = e.length; i < a && r < t; i++) r += Ar(n, e.charCodeAt(i));
	return i;
}
function qr(e, t, n, r) {
	var i = ei(e), a = t.overflow, o = t.padding, s = o ? o[1] + o[3] : 0, c = o ? o[0] + o[2] : 0, l = t.font, u = a === "truncate", d = Ir(l), f = G(t.lineHeight, d), p = t.lineOverflow === "truncate", m = !1, h = t.width;
	h == null && n != null && (h = n - s);
	var g = t.height;
	g == null && r != null && (g = r - c);
	var _ = h != null && (a === "break" || a === "breakAll") ? i ? Qr(i, t.font, h, a === "breakAll", 0).lines : [] : i ? i.split("\n") : [], v = _.length * f;
	if (g ??= v, v > g && p) {
		var y = Math.floor(g / f);
		m ||= _.length > y, _ = _.slice(0, y), v = _.length * f;
	}
	if (i && u && h != null) for (var b = Wr(h, l, t.ellipsis, {
		minChar: t.truncateMinChar,
		placeholder: t.placeholder
	}), x = {}, S = 0; S < _.length; S++) Gr(x, _[S], b), _[S] = x.textLine, m ||= x.isTruncated;
	for (var C = g, w = 0, T = Or(l), S = 0; S < _.length; S++) w = Math.max(jr(T, _[S]), w);
	h ??= w;
	var E = h;
	return C += c, E += s, {
		lines: _,
		height: g,
		outerWidth: E,
		outerHeight: C,
		lineHeight: f,
		calculatedLineHeight: d,
		contentWidth: w,
		contentHeight: v,
		width: h,
		isTruncated: m
	};
}
function Jr(e, t, n, r, i) {
	var a = new si(), o = ei(e);
	if (!o) return a;
	var s = t.padding, c = s ? s[1] + s[3] : 0, l = s ? s[0] + s[2] : 0, u = t.width;
	u == null && n != null && (u = n - c);
	var d = t.height;
	d == null && r != null && (d = r - l);
	for (var f = t.overflow, p = (f === "break" || f === "breakAll") && u != null ? {
		width: u,
		accumWidth: 0,
		breakAll: f === "breakAll"
	} : null, m = ii.lastIndex = 0, h; (h = ii.exec(o)) != null;) {
		var g = h.index;
		g > m && Yr(a, o.substring(m, g), t, p), Yr(a, h[2], t, p, h[1]), m = ii.lastIndex;
	}
	m < o.length && Yr(a, o.substring(m, o.length), t, p);
	var _ = [], v = 0, y = 0, b = f === "truncate", x = t.lineOverflow === "truncate", S = {};
	function C(e, t, n) {
		e.width = t, e.lineHeight = n, v += n, y = Math.max(y, t);
	}
	outer: for (var w = 0; w < a.lines.length; w++) {
		for (var T = a.lines[w], E = 0, D = 0, O = 0; O < T.tokens.length; O++) {
			var k = T.tokens[O], A = k.styleName && t.rich[k.styleName] || {}, j = k.textPadding = A.padding, ee = j ? j[1] + j[3] : 0, te = k.font = A.font || t.font;
			k.contentHeight = Ir(te);
			var ne = G(A.height, k.contentHeight);
			if (k.innerHeight = ne, j && (ne += j[0] + j[2]), k.height = ne, k.lineHeight = yt(A.lineHeight, t.lineHeight, ne), k.align = A && A.align || i, k.verticalAlign = A && A.verticalAlign || "middle", x && d != null && v + k.lineHeight > d) {
				var re = a.lines.length;
				O > 0 ? (T.tokens = T.tokens.slice(0, O), C(T, D, E), a.lines = a.lines.slice(0, w + 1)) : a.lines = a.lines.slice(0, w), a.isTruncated = a.isTruncated || a.lines.length < re;
				break outer;
			}
			var ie = A.width, ae = ie == null || ie === "auto";
			if (typeof ie == "string" && ie.charAt(ie.length - 1) === "%") k.percentWidth = ie, _.push(k), k.contentWidth = jr(Or(te), k.text);
			else {
				if (ae) {
					var oe = A.backgroundColor, se = oe && oe.image;
					se && (se = En(se), kn(se) && (k.width = Math.max(k.width, se.width * ne / se.height)));
				}
				var M = b && u != null ? u - D : null;
				M != null && M < k.width ? !ae || M < ee ? (k.text = "", k.width = k.contentWidth = 0) : (Ur(S, k.text, M - ee, te, t.ellipsis, { minChar: t.truncateMinChar }), k.text = S.text, a.isTruncated = a.isTruncated || S.isTruncated, k.width = k.contentWidth = jr(Or(te), k.text)) : k.contentWidth = jr(Or(te), k.text);
			}
			k.width += ee, D += k.width, A && (E = Math.max(E, k.lineHeight));
		}
		C(T, D, E);
	}
	a.outerWidth = a.width = G(u, y), a.outerHeight = a.height = G(d, v), a.contentHeight = v, a.contentWidth = y, a.outerWidth += c, a.outerHeight += l;
	for (var w = 0; w < _.length; w++) {
		var k = _[w], ce = k.percentWidth;
		k.width = parseInt(ce, 10) / 100 * a.width;
	}
	return a;
}
function Yr(e, t, n, r, i) {
	var a = t === "", o = i && n.rich[i] || {}, s = e.lines, c = o.font || n.font, l = !1, u, d;
	if (r) {
		var f = o.padding, p = f ? f[1] + f[3] : 0;
		if (o.width != null && o.width !== "auto") {
			var m = Lr(o.width, r.width) + p;
			s.length > 0 && m + r.accumWidth > r.width && (u = t.split("\n"), l = !0), r.accumWidth = m;
		} else {
			var h = Qr(t, c, r.width, r.breakAll, r.accumWidth);
			r.accumWidth = h.accumWidth + p, d = h.linesWidths, u = h.lines;
		}
	}
	u ||= t.split("\n");
	for (var g = Or(c), _ = 0; _ < u.length; _++) {
		var v = u[_], y = new ai();
		if (y.styleName = i, y.text = v, y.isLineHolder = !v && !a, y.width = typeof o.width == "number" ? o.width : d ? d[_] : jr(g, v), !_ && !l) {
			var b = (s[s.length - 1] || (s[0] = new oi())).tokens, x = b.length;
			x === 1 && b[0].isLineHolder ? b[0] = y : (v || !x || a) && b.push(y);
		} else s.push(new oi([y]));
	}
}
function Xr(e) {
	var t = e.charCodeAt(0);
	return t >= 32 && t <= 591 || t >= 880 && t <= 4351 || t >= 4608 && t <= 5119 || t >= 7680 && t <= 8303;
}
function Zr(e) {
	return !Xr(e) || !!ci[e];
}
function Qr(e, t, n, r, i) {
	for (var a = [], o = [], s = "", c = "", l = 0, u = 0, d = Or(t), f = 0; f < e.length; f++) {
		var p = e.charAt(f);
		if (p === "\n") {
			c && (s += c, u += l), a.push(s), o.push(u), s = "", c = "", l = 0, u = 0;
			continue;
		}
		var m = Ar(d, p.charCodeAt(0)), h = !r && !Zr(p);
		if (a.length ? u + m > n : i + u + m > n) {
			u ? (s || c) && (h ? (s || (s = c, c = "", l = 0, u = l), a.push(s), o.push(u - l), c += p, l += m, s = "", u = l) : (c && (s += c, c = "", l = 0), a.push(s), o.push(u), s = p, u = m)) : h ? (a.push(c), o.push(l), c = p, l = m) : (a.push(p), o.push(m));
			continue;
		}
		u += m, h ? (c += p, l += m) : (c && (s += c, c = "", l = 0), s += p);
	}
	return c && (s += c), s && (a.push(s), o.push(u)), a.length === 1 && (u += i), {
		accumWidth: u,
		lines: a,
		linesWidths: o
	};
}
function $r(e, t, n, r, i, a) {
	if (e.baseX = n, e.baseY = r, e.outerWidth = e.outerHeight = null, t) {
		var o = t.width * 2, s = t.height * 2;
		Y.set(li, Pr(n, o, i), Fr(r, s, a), o, s), Y.intersect(t, li, null, ui);
		var c = ui.outIntersectRect;
		e.outerWidth = c.width, e.outerHeight = c.height, e.baseX = Pr(c.x, c.width, i, !0), e.baseY = Fr(c.y, c.height, a, !0);
	}
}
function ei(e) {
	return e == null ? e = "" : e += "";
}
function ti(e) {
	var t = ei(e.text), n = e.font;
	return ni(e, jr(Or(n), t), Ir(n), null);
}
function ni(e, t, n, r) {
	var i = new Y(Pr(e.x || 0, t, e.textAlign), Fr(e.y || 0, n, e.textBaseline), t, n), a = r ?? (ri(e) ? e.lineWidth : 0);
	return a > 0 && (i.x -= a / 2, i.y -= a / 2, i.width += a, i.height += a), i;
}
function ri(e) {
	var t = e.stroke;
	return t != null && t !== "none" && e.lineWidth > 0;
}
var ii, ai, oi, si, ci, li, ui, di = M((() => {
	jn(), q(), Hr(), Dr(), ii = /\{([a-zA-Z0-9_]+)\|([^}]*)\}/g, ai = function() {
		function e() {}
		return e;
	}(), oi = function() {
		function e(e) {
			this.tokens = [], e && (this.tokens = e);
		}
		return e;
	}(), si = function() {
		function e() {
			this.width = 0, this.height = 0, this.contentWidth = 0, this.contentHeight = 0, this.outerWidth = 0, this.outerHeight = 0, this.lines = [], this.isTruncated = !1;
		}
		return e;
	}(), ci = it(",&?/;] ".split(""), function(e, t) {
		return e[t] = !0, e;
	}, {}), li = new Y(0, 0, 0, 0), ui = {
		outIntersectRect: {},
		clamp: !0
	};
}));
//#endregion
//#region node_modules/zrender/lib/core/Transformable.js
function fi(e) {
	return e > hi || e < -hi;
}
function pi(e, t) {
	return $e(e, t, Si);
}
var mi, hi, gi, _i, vi, yi, bi, xi, Si, Ci = M((() => {
	Bn(), q(), rr(), mi = Nn, hi = 5e-5, gi = [], _i = [], vi = Mn(), yi = Math.abs, bi = function() {
		function e() {}
		return e.prototype.getLocalTransform = function(e) {
			return xi(this, e);
		}, e.prototype.setPosition = function(e) {
			this.x = e[0], this.y = e[1];
		}, e.prototype.setScale = function(e) {
			this.scaleX = e[0], this.scaleY = e[1];
		}, e.prototype.setSkew = function(e) {
			this.skewX = e[0], this.skewY = e[1];
		}, e.prototype.setOrigin = function(e) {
			this.originX = e[0], this.originY = e[1];
		}, e.prototype.needLocalTransform = function() {
			return fi(this.rotation) || fi(this.x) || fi(this.y) || fi(this.scaleX - 1) || fi(this.scaleY - 1) || fi(this.skewX) || fi(this.skewY);
		}, e.prototype.updateTransform = function() {
			var e = this.parent && this.parent.transform, t = this.needLocalTransform(), n = this.transform;
			if (!(t || e)) {
				n && (mi(n), this.invTransform = null);
				return;
			}
			n ||= Mn(), t ? this.getLocalTransform(n) : mi(n), e && (t ? Fn(n, e, n) : Pn(n, e)), this.transform = n, this._resolveGlobalScaleRatio(n), this.invTransform = this.invTransform || Mn(), zn(this.invTransform, n);
		}, e.prototype._resolveGlobalScaleRatio = function(e) {
			var t = this.globalScaleRatio;
			if (t != null && t !== 1) {
				this.getGlobalScale(gi);
				var n = gi[0] < 0 ? -1 : 1, r = gi[1] < 0 ? -1 : 1, i = ((gi[0] - n) * t + n) / gi[0] || 0, a = ((gi[1] - r) * t + r) / gi[1] || 0;
				e[0] *= i, e[1] *= i, e[2] *= a, e[3] *= a;
			}
		}, e.prototype.getComputedTransform = function() {
			for (var e = this, t = []; e;) t.push(e), e = e.parent;
			for (; e = t.pop();) e.updateTransform();
			return this.transform;
		}, e.prototype.setLocalTransform = function(e) {
			if (e) {
				var t = e[0] * e[0] + e[1] * e[1], n = e[2] * e[2] + e[3] * e[3], r = Math.atan2(e[1], e[0]), i = Math.PI / 2 + r - Math.atan2(e[3], e[2]);
				n = Math.sqrt(n) * Math.cos(i), t = Math.sqrt(t), this.skewX = i, this.skewY = 0, this.rotation = -r, this.x = +e[4], this.y = +e[5], this.scaleX = t, this.scaleY = n, this.originX = 0, this.originY = 0;
			}
		}, e.prototype.decomposeTransform = function() {
			if (this.transform) {
				var e = this.parent, t = this.transform;
				e && e.transform && (e.invTransform = e.invTransform || Mn(), Fn(_i, e.invTransform, t), t = _i);
				var n = this.originX, r = this.originY;
				(n || r) && (vi[4] = n, vi[5] = r, Fn(_i, t, vi), _i[4] -= n, _i[5] -= r, t = _i), this.setLocalTransform(t);
			}
		}, e.prototype.getGlobalScale = function(e) {
			var t = this.transform;
			return e ||= [], t ? (e[0] = Math.sqrt(t[0] * t[0] + t[1] * t[1]), e[1] = Math.sqrt(t[2] * t[2] + t[3] * t[3]), t[0] < 0 && (e[0] = -e[0]), t[3] < 0 && (e[1] = -e[1]), e) : (e[0] = 1, e[1] = 1, e);
		}, e.prototype.transformCoordToLocal = function(e, t) {
			var n = [e, t], r = this.invTransform;
			return r && Qn(n, n, r), n;
		}, e.prototype.transformCoordToGlobal = function(e, t) {
			var n = [e, t], r = this.transform;
			return r && Qn(n, n, r), n;
		}, e.prototype.getLineScale = function() {
			var e = this.transform;
			return e && yi(e[0] - 1) > 1e-10 && yi(e[3] - 1) > 1e-10 ? Math.sqrt(yi(e[0] * e[3] - e[2] * e[1])) : 1;
		}, e.prototype.copyTransform = function(e) {
			pi(this, e);
		}, e.getLocalTransform = function(e, t) {
			t ||= [];
			var n = e.originX || 0, r = e.originY || 0, i = e.scaleX, a = e.scaleY, o = e.anchorX, s = e.anchorY, c = e.rotation || 0, l = e.x, u = e.y, d = e.skewX ? Math.tan(e.skewX) : 0, f = e.skewY ? Math.tan(-e.skewY) : 0;
			if (n || r || o || s) {
				var p = n + o, m = r + s;
				t[4] = -p * i - d * m * a, t[5] = -m * a - f * p * i;
			} else t[4] = t[5] = 0;
			return t[0] = i, t[3] = a, t[1] = f * i, t[2] = d * a, c && Ln(t, t, c), t[4] += n + l, t[5] += r + u, t;
		}, e.initDefaultProps = (function() {
			var t = e.prototype;
			t.scaleX = t.scaleY = t.globalScaleRatio = 1, t.x = t.y = t.originX = t.originY = t.skewX = t.skewY = t.rotation = t.anchorX = t.anchorY = 0;
		})(), e;
	}(), xi = bi.getLocalTransform, Si = [
		"x",
		"y",
		"originX",
		"originY",
		"anchorX",
		"anchorY",
		"rotation",
		"scaleX",
		"scaleY",
		"skewX",
		"skewY"
	];
})), wi, Ti = M((() => {
	wi = {
		linear: function(e) {
			return e;
		},
		quadraticIn: function(e) {
			return e * e;
		},
		quadraticOut: function(e) {
			return e * (2 - e);
		},
		quadraticInOut: function(e) {
			return (e *= 2) < 1 ? .5 * e * e : -.5 * (--e * (e - 2) - 1);
		},
		cubicIn: function(e) {
			return e * e * e;
		},
		cubicOut: function(e) {
			return --e * e * e + 1;
		},
		cubicInOut: function(e) {
			return (e *= 2) < 1 ? .5 * e * e * e : .5 * ((e -= 2) * e * e + 2);
		},
		quarticIn: function(e) {
			return e * e * e * e;
		},
		quarticOut: function(e) {
			return 1 - --e * e * e * e;
		},
		quarticInOut: function(e) {
			return (e *= 2) < 1 ? .5 * e * e * e * e : -.5 * ((e -= 2) * e * e * e - 2);
		},
		quinticIn: function(e) {
			return e * e * e * e * e;
		},
		quinticOut: function(e) {
			return --e * e * e * e * e + 1;
		},
		quinticInOut: function(e) {
			return (e *= 2) < 1 ? .5 * e * e * e * e * e : .5 * ((e -= 2) * e * e * e * e + 2);
		},
		sinusoidalIn: function(e) {
			return 1 - Math.cos(e * Math.PI / 2);
		},
		sinusoidalOut: function(e) {
			return Math.sin(e * Math.PI / 2);
		},
		sinusoidalInOut: function(e) {
			return .5 * (1 - Math.cos(Math.PI * e));
		},
		exponentialIn: function(e) {
			return e === 0 ? 0 : 1024 ** (e - 1);
		},
		exponentialOut: function(e) {
			return e === 1 ? 1 : 1 - 2 ** (-10 * e);
		},
		exponentialInOut: function(e) {
			return e === 0 ? 0 : e === 1 ? 1 : (e *= 2) < 1 ? .5 * 1024 ** (e - 1) : .5 * (-(2 ** (-10 * (e - 1))) + 2);
		},
		circularIn: function(e) {
			return 1 - Math.sqrt(1 - e * e);
		},
		circularOut: function(e) {
			return Math.sqrt(1 - --e * e);
		},
		circularInOut: function(e) {
			return (e *= 2) < 1 ? -.5 * (Math.sqrt(1 - e * e) - 1) : .5 * (Math.sqrt(1 - (e -= 2) * e) + 1);
		},
		elasticIn: function(e) {
			var t, n = .1, r = .4;
			return e === 0 ? 0 : e === 1 ? 1 : (!n || n < 1 ? (n = 1, t = r / 4) : t = r * Math.asin(1 / n) / (2 * Math.PI), -(n * 2 ** (10 * --e) * Math.sin((e - t) * (2 * Math.PI) / r)));
		},
		elasticOut: function(e) {
			var t, n = .1, r = .4;
			return e === 0 ? 0 : e === 1 ? 1 : (!n || n < 1 ? (n = 1, t = r / 4) : t = r * Math.asin(1 / n) / (2 * Math.PI), n * 2 ** (-10 * e) * Math.sin((e - t) * (2 * Math.PI) / r) + 1);
		},
		elasticInOut: function(e) {
			var t, n = .1, r = .4;
			return e === 0 ? 0 : e === 1 ? 1 : (!n || n < 1 ? (n = 1, t = r / 4) : t = r * Math.asin(1 / n) / (2 * Math.PI), (e *= 2) < 1 ? -.5 * (n * 2 ** (10 * --e) * Math.sin((e - t) * (2 * Math.PI) / r)) : n * 2 ** (-10 * --e) * Math.sin((e - t) * (2 * Math.PI) / r) * .5 + 1);
		},
		backIn: function(e) {
			var t = 1.70158;
			return e * e * ((t + 1) * e - t);
		},
		backOut: function(e) {
			var t = 1.70158;
			return --e * e * ((t + 1) * e + t) + 1;
		},
		backInOut: function(e) {
			var t = 2.5949095;
			return (e *= 2) < 1 ? .5 * (e * e * ((t + 1) * e - t)) : .5 * ((e -= 2) * e * ((t + 1) * e + t) + 2);
		},
		bounceIn: function(e) {
			return 1 - wi.bounceOut(1 - e);
		},
		bounceOut: function(e) {
			return e < 1 / 2.75 ? 7.5625 * e * e : e < 2 / 2.75 ? 7.5625 * (e -= 1.5 / 2.75) * e + .75 : e < 2.5 / 2.75 ? 7.5625 * (e -= 2.25 / 2.75) * e + .9375 : 7.5625 * (e -= 2.625 / 2.75) * e + .984375;
		},
		bounceInOut: function(e) {
			return e < .5 ? wi.bounceIn(e * 2) * .5 : wi.bounceOut(e * 2 - 1) * .5 + .5;
		}
	};
}));
//#endregion
//#region node_modules/zrender/lib/core/curve.js
function Ei(e) {
	return e > -Wi && e < Wi;
}
function Di(e) {
	return e > Wi || e < -Wi;
}
function Oi(e, t, n, r, i) {
	var a = 1 - i;
	return a * a * (a * e + 3 * i * t) + i * i * (i * r + 3 * a * n);
}
function ki(e, t, n, r, i) {
	var a = 1 - i;
	return 3 * (((t - e) * a + 2 * (n - t) * i) * a + (r - n) * i * i);
}
function Ai(e, t, n, r, i, a) {
	var o = r + 3 * (t - n) - e, s = 3 * (n - t * 2 + e), c = 3 * (t - e), l = e - i, u = s * s - 3 * o * c, d = s * c - 9 * o * l, f = c * c - 3 * s * l, p = 0;
	if (Ei(u) && Ei(d)) {
		if (Ei(s)) a[0] = 0;
		else {
			var m = -c / s;
			m >= 0 && m <= 1 && (a[p++] = m);
		}
	} else {
		var h = d * d - 4 * u * f;
		if (Ei(h)) {
			var g = d / u, m = -s / o + g, _ = -g / 2;
			m >= 0 && m <= 1 && (a[p++] = m), _ >= 0 && _ <= 1 && (a[p++] = _);
		} else if (h > 0) {
			var v = Ui(h), y = u * s + 1.5 * o * (-d + v), b = u * s + 1.5 * o * (-d - v);
			y = y < 0 ? -Hi(-y, qi) : Hi(y, qi), b = b < 0 ? -Hi(-b, qi) : Hi(b, qi);
			var m = (-s - (y + b)) / (3 * o);
			m >= 0 && m <= 1 && (a[p++] = m);
		} else {
			var x = (2 * u * s - 3 * o * d) / (2 * Ui(u * u * u)), S = Math.acos(x) / 3, C = Ui(u), w = Math.cos(S), m = (-s - 2 * C * w) / (3 * o), _ = (-s + C * (w + Ki * Math.sin(S))) / (3 * o), T = (-s + C * (w - Ki * Math.sin(S))) / (3 * o);
			m >= 0 && m <= 1 && (a[p++] = m), _ >= 0 && _ <= 1 && (a[p++] = _), T >= 0 && T <= 1 && (a[p++] = T);
		}
	}
	return p;
}
function ji(e, t, n, r, i) {
	var a = 6 * n - 12 * t + 6 * e, o = 9 * t + 3 * r - 3 * e - 9 * n, s = 3 * t - 3 * e, c = 0;
	if (Ei(o)) {
		if (Di(a)) {
			var l = -s / a;
			l >= 0 && l <= 1 && (i[c++] = l);
		}
	} else {
		var u = a * a - 4 * o * s;
		if (Ei(u)) i[0] = -a / (2 * o);
		else if (u > 0) {
			var d = Ui(u), l = (-a + d) / (2 * o), f = (-a - d) / (2 * o);
			l >= 0 && l <= 1 && (i[c++] = l), f >= 0 && f <= 1 && (i[c++] = f);
		}
	}
	return c;
}
function Mi(e, t, n, r, i, a) {
	var o = (t - e) * i + e, s = (n - t) * i + t, c = (r - n) * i + n, l = (s - o) * i + o, u = (c - s) * i + s, d = (u - l) * i + l;
	a[0] = e, a[1] = o, a[2] = l, a[3] = d, a[4] = d, a[5] = u, a[6] = c, a[7] = r;
}
function Ni(e, t, n, r, i, a, o, s, c, l, u) {
	var d, f = .005, p = Infinity, m, h, g, _;
	Ji[0] = c, Ji[1] = l;
	for (var v = 0; v < 1; v += .05) Yi[0] = Oi(e, n, i, o, v), Yi[1] = Oi(t, r, a, s, v), g = nr(Ji, Yi), g < p && (d = v, p = g);
	p = Infinity;
	for (var y = 0; y < 32 && !(f < Gi); y++) m = d - f, h = d + f, Yi[0] = Oi(e, n, i, o, m), Yi[1] = Oi(t, r, a, s, m), g = nr(Yi, Ji), m >= 0 && g < p ? (d = m, p = g) : (Xi[0] = Oi(e, n, i, o, h), Xi[1] = Oi(t, r, a, s, h), _ = nr(Xi, Ji), h <= 1 && _ < p ? (d = h, p = _) : f *= .5);
	return u && (u[0] = Oi(e, n, i, o, d), u[1] = Oi(t, r, a, s, d)), Ui(p);
}
function Pi(e, t, n, r, i, a, o, s, c) {
	for (var l = e, u = t, d = 0, f = 1 / c, p = 1; p <= c; p++) {
		var m = p * f, h = Oi(e, n, i, o, m), g = Oi(t, r, a, s, m), _ = h - l, v = g - u;
		d += Math.sqrt(_ * _ + v * v), l = h, u = g;
	}
	return d;
}
function Fi(e, t, n, r) {
	var i = 1 - r;
	return i * (i * e + 2 * r * t) + r * r * n;
}
function Ii(e, t, n, r) {
	return 2 * ((1 - r) * (t - e) + r * (n - t));
}
function Li(e, t, n, r, i) {
	var a = e - 2 * t + n, o = 2 * (t - e), s = e - r, c = 0;
	if (Ei(a)) {
		if (Di(o)) {
			var l = -s / o;
			l >= 0 && l <= 1 && (i[c++] = l);
		}
	} else {
		var u = o * o - 4 * a * s;
		if (Ei(u)) {
			var l = -o / (2 * a);
			l >= 0 && l <= 1 && (i[c++] = l);
		} else if (u > 0) {
			var d = Ui(u), l = (-o + d) / (2 * a), f = (-o - d) / (2 * a);
			l >= 0 && l <= 1 && (i[c++] = l), f >= 0 && f <= 1 && (i[c++] = f);
		}
	}
	return c;
}
function Ri(e, t, n) {
	var r = e + n - 2 * t;
	return r === 0 ? .5 : (e - t) / r;
}
function zi(e, t, n, r, i) {
	var a = (t - e) * r + e, o = (n - t) * r + t, s = (o - a) * r + a;
	i[0] = e, i[1] = a, i[2] = s, i[3] = s, i[4] = o, i[5] = n;
}
function Bi(e, t, n, r, i, a, o, s, c) {
	var l, u = .005, d = Infinity;
	Ji[0] = o, Ji[1] = s;
	for (var f = 0; f < 1; f += .05) {
		Yi[0] = Fi(e, n, i, f), Yi[1] = Fi(t, r, a, f);
		var p = nr(Ji, Yi);
		p < d && (l = f, d = p);
	}
	d = Infinity;
	for (var m = 0; m < 32 && !(u < Gi); m++) {
		var h = l - u, g = l + u;
		Yi[0] = Fi(e, n, i, h), Yi[1] = Fi(t, r, a, h);
		var p = nr(Yi, Ji);
		if (h >= 0 && p < d) l = h, d = p;
		else {
			Xi[0] = Fi(e, n, i, g), Xi[1] = Fi(t, r, a, g);
			var _ = nr(Xi, Ji);
			g <= 1 && _ < d ? (l = g, d = _) : u *= .5;
		}
	}
	return c && (c[0] = Fi(e, n, i, l), c[1] = Fi(t, r, a, l)), Ui(d);
}
function Vi(e, t, n, r, i, a, o) {
	for (var s = e, c = t, l = 0, u = 1 / o, d = 1; d <= o; d++) {
		var f = d * u, p = Fi(e, n, i, f), m = Fi(t, r, a, f), h = p - s, g = m - c;
		l += Math.sqrt(h * h + g * g), s = p, c = m;
	}
	return l;
}
var Hi, Ui, Wi, Gi, Ki, qi, Ji, Yi, Xi, Zi = M((() => {
	rr(), Hi = Math.pow, Ui = Math.sqrt, Wi = 1e-8, Gi = 1e-4, Ki = Ui(3), qi = 1 / 3, Ji = Vn(), Yi = Vn(), Xi = Vn();
}));
//#endregion
//#region node_modules/zrender/lib/animation/cubicEasing.js
function Qi(e) {
	var t = e && $i.exec(e);
	if (t) {
		var n = t[1].split(","), r = +Ct(n[0]), i = +Ct(n[1]), a = +Ct(n[2]), o = +Ct(n[3]);
		if (isNaN(r + i + a + o)) return;
		var s = [];
		return function(e) {
			return e <= 0 ? 0 : e >= 1 ? 1 : Ai(0, r, a, 1, e, s) && Oi(0, i, o, 1, s[0]);
		};
	}
}
var $i, ea = M((() => {
	Zi(), q(), $i = /cubic-bezier\(([0-9,\.e ]+)\)/;
})), ta, na = M((() => {
	Ti(), q(), ea(), ta = function() {
		function e(e) {
			this._inited = !1, this._startTime = 0, this._pausedTime = 0, this._paused = !1, this._life = e.life || 1e3, this._delay = e.delay || 0, this.loop = e.loop || !1, this.onframe = e.onframe || jt, this.ondestroy = e.ondestroy || jt, this.onrestart = e.onrestart || jt, e.easing && this.setEasing(e.easing);
		}
		return e.prototype.step = function(e, t) {
			if (this._inited ||= (this._startTime = e + this._delay, !0), this._paused) {
				this._pausedTime += t;
				return;
			}
			var n = this._life, r = e - this._startTime - this._pausedTime, i = r / n;
			i < 0 && (i = 0), i = Math.min(i, 1);
			var a = this.easingFunc, o = a ? a(i) : i;
			if (this.onframe(o), i === 1) {
				if (this.loop) {
					var s = r % n;
					this._startTime = e - s, this._pausedTime = 0, this.onrestart();
				} else return !0;
			}
			return !1;
		}, e.prototype.pause = function() {
			this._paused = !0;
		}, e.prototype.resume = function() {
			this._paused = !1;
		}, e.prototype.setEasing = function(e) {
			this.easing = e, this.easingFunc = H(e) ? e : wi[e] || Qi(e);
		}, e;
	}();
}));
//#endregion
//#region node_modules/zrender/lib/tool/color.js
function ra(e) {
	return e = Math.round(e), e < 0 ? 0 : e > 255 ? 255 : e;
}
function ia(e) {
	return e = Math.round(e), e < 0 ? 0 : e > 360 ? 360 : e;
}
function aa(e) {
	return e < 0 ? 0 : e > 1 ? 1 : e;
}
function oa(e) {
	var t = e;
	return t.length && t.charAt(t.length - 1) === "%" ? ra(parseFloat(t) / 100 * 255) : ra(parseInt(t, 10));
}
function sa(e) {
	var t = e;
	return t.length && t.charAt(t.length - 1) === "%" ? aa(parseFloat(t) / 100) : aa(parseFloat(t));
}
function ca(e, t, n) {
	return n < 0 ? n += 1 : n > 1 && --n, n * 6 < 1 ? e + (t - e) * n * 6 : n * 2 < 1 ? t : n * 3 < 2 ? e + (t - e) * (2 / 3 - n) * 6 : e;
}
function la(e, t, n) {
	return e + (t - e) * n;
}
function ua(e, t, n, r, i) {
	return e[0] = t, e[1] = n, e[2] = r, e[3] = i, e;
}
function da(e, t) {
	return e[0] = t[0], e[1] = t[1], e[2] = t[2], e[3] = t[3], e;
}
function fa(e, t) {
	wa && da(wa, t), wa = Ca.put(e, wa || t.slice());
}
function pa(e, t) {
	if (e) {
		t ||= [];
		var n = Ca.get(e);
		if (n) return da(t, n);
		e += "";
		var r = e.replace(/ /g, "").toLowerCase();
		if (r in Sa) return da(t, Sa[r]), fa(e, t), t;
		var i = r.length;
		if (r.charAt(0) === "#") {
			if (i === 4 || i === 5) {
				var a = parseInt(r.slice(1, 4), 16);
				if (!(a >= 0 && a <= 4095)) {
					ua(t, 0, 0, 0, 1);
					return;
				}
				return ua(t, (a & 3840) >> 4 | (a & 3840) >> 8, a & 240 | (a & 240) >> 4, a & 15 | (a & 15) << 4, i === 5 ? parseInt(r.slice(4), 16) / 15 : 1), fa(e, t), t;
			}
			if (i === 7 || i === 9) {
				var a = parseInt(r.slice(1, 7), 16);
				if (!(a >= 0 && a <= 16777215)) {
					ua(t, 0, 0, 0, 1);
					return;
				}
				return ua(t, (a & 16711680) >> 16, (a & 65280) >> 8, a & 255, i === 9 ? parseInt(r.slice(7), 16) / 255 : 1), fa(e, t), t;
			}
			return;
		}
		var o = r.indexOf("("), s = r.indexOf(")");
		if (o !== -1 && s + 1 === i) {
			var c = r.substr(0, o), l = r.substr(o + 1, s - (o + 1)).split(","), u = 1;
			switch (c) {
				case "rgba":
					if (l.length !== 4) return l.length === 3 ? ua(t, +l[0], +l[1], +l[2], 1) : ua(t, 0, 0, 0, 1);
					u = sa(l.pop());
				case "rgb":
					if (l.length >= 3) return ua(t, oa(l[0]), oa(l[1]), oa(l[2]), l.length === 3 ? u : sa(l[3])), fa(e, t), t;
					ua(t, 0, 0, 0, 1);
					return;
				case "hsla":
					if (l.length !== 4) {
						ua(t, 0, 0, 0, 1);
						return;
					}
					return l[3] = sa(l[3]), ma(l, t), fa(e, t), t;
				case "hsl":
					if (l.length !== 3) {
						ua(t, 0, 0, 0, 1);
						return;
					}
					return ma(l, t), fa(e, t), t;
				default: return;
			}
		}
		ua(t, 0, 0, 0, 1);
	}
}
function ma(e, t) {
	var n = (parseFloat(e[0]) % 360 + 360) % 360 / 360, r = sa(e[1]), i = sa(e[2]), a = i <= .5 ? i * (r + 1) : i + r - i * r, o = i * 2 - a;
	return t ||= [], ua(t, ra(ca(o, a, n + 1 / 3) * 255), ra(ca(o, a, n) * 255), ra(ca(o, a, n - 1 / 3) * 255), 1), e.length === 4 && (t[3] = e[3]), t;
}
function ha(e) {
	if (e) {
		var t = e[0] / 255, n = e[1] / 255, r = e[2] / 255, i = Math.min(t, n, r), a = Math.max(t, n, r), o = a - i, s = (a + i) / 2, c, l;
		if (o === 0) c = 0, l = 0;
		else {
			l = s < .5 ? o / (a + i) : o / (2 - a - i);
			var u = ((a - t) / 6 + o / 2) / o, d = ((a - n) / 6 + o / 2) / o, f = ((a - r) / 6 + o / 2) / o;
			t === a ? c = f - d : n === a ? c = 1 / 3 + u - f : r === a && (c = 2 / 3 + d - u), c < 0 && (c += 1), c > 1 && --c;
		}
		var p = [
			c * 360,
			l,
			s
		];
		return e[3] != null && p.push(e[3]), p;
	}
}
function ga(e, t) {
	var n = pa(e);
	if (n) {
		for (var r = 0; r < 3; r++) t < 0 ? n[r] = n[r] * (1 - t) | 0 : n[r] = (255 - n[r]) * t + n[r] | 0, n[r] > 255 ? n[r] = 255 : n[r] < 0 && (n[r] = 0);
		return ya(n, n.length === 4 ? "rgba" : "rgb");
	}
}
function _a(e, t, n) {
	if (t && t.length && e >= 0 && e <= 1) {
		var r = e * (t.length - 1), i = Math.floor(r), a = Math.ceil(r), o = pa(t[i]), s = pa(t[a]), c = r - i, l = ya([
			ra(la(o[0], s[0], c)),
			ra(la(o[1], s[1], c)),
			ra(la(o[2], s[2], c)),
			aa(la(o[3], s[3], c))
		], "rgba");
		return n ? {
			color: l,
			leftIndex: i,
			rightIndex: a,
			value: r
		} : l;
	}
}
function va(e, t, n, r) {
	var i = pa(e);
	if (e) return i = ha(i), t != null && (i[0] = ia(H(t) ? t(i[0]) : t)), n != null && (i[1] = sa(H(n) ? n(i[1]) : n)), r != null && (i[2] = sa(H(r) ? r(i[2]) : r)), ya(ma(i), "rgba");
}
function ya(e, t) {
	if (e && e.length) {
		var n = e[0] + "," + e[1] + "," + e[2];
		return (t === "rgba" || t === "hsva" || t === "hsla") && (n += "," + e[3]), t + "(" + n + ")";
	}
}
function ba(e, t) {
	var n = pa(e);
	return n ? (.299 * n[0] + .587 * n[1] + .114 * n[2]) * n[3] / 255 + (1 - n[3]) * t : 0;
}
function xa(e) {
	if (U(e)) {
		var t = Ta.get(e);
		return t || (t = ga(e, -.1), Ta.put(e, t)), t;
	}
	if (ht(e)) {
		var n = L({}, e);
		return n.colorStops = B(e.colorStops, function(e) {
			return {
				offset: e.offset,
				color: ga(e.color, -.1)
			};
		}), n;
	}
	return e;
}
var Sa, Ca, wa, Ta, Ea = M((() => {
	Tn(), q(), Sa = {
		transparent: [
			0,
			0,
			0,
			0
		],
		aliceblue: [
			240,
			248,
			255,
			1
		],
		antiquewhite: [
			250,
			235,
			215,
			1
		],
		aqua: [
			0,
			255,
			255,
			1
		],
		aquamarine: [
			127,
			255,
			212,
			1
		],
		azure: [
			240,
			255,
			255,
			1
		],
		beige: [
			245,
			245,
			220,
			1
		],
		bisque: [
			255,
			228,
			196,
			1
		],
		black: [
			0,
			0,
			0,
			1
		],
		blanchedalmond: [
			255,
			235,
			205,
			1
		],
		blue: [
			0,
			0,
			255,
			1
		],
		blueviolet: [
			138,
			43,
			226,
			1
		],
		brown: [
			165,
			42,
			42,
			1
		],
		burlywood: [
			222,
			184,
			135,
			1
		],
		cadetblue: [
			95,
			158,
			160,
			1
		],
		chartreuse: [
			127,
			255,
			0,
			1
		],
		chocolate: [
			210,
			105,
			30,
			1
		],
		coral: [
			255,
			127,
			80,
			1
		],
		cornflowerblue: [
			100,
			149,
			237,
			1
		],
		cornsilk: [
			255,
			248,
			220,
			1
		],
		crimson: [
			220,
			20,
			60,
			1
		],
		cyan: [
			0,
			255,
			255,
			1
		],
		darkblue: [
			0,
			0,
			139,
			1
		],
		darkcyan: [
			0,
			139,
			139,
			1
		],
		darkgoldenrod: [
			184,
			134,
			11,
			1
		],
		darkgray: [
			169,
			169,
			169,
			1
		],
		darkgreen: [
			0,
			100,
			0,
			1
		],
		darkgrey: [
			169,
			169,
			169,
			1
		],
		darkkhaki: [
			189,
			183,
			107,
			1
		],
		darkmagenta: [
			139,
			0,
			139,
			1
		],
		darkolivegreen: [
			85,
			107,
			47,
			1
		],
		darkorange: [
			255,
			140,
			0,
			1
		],
		darkorchid: [
			153,
			50,
			204,
			1
		],
		darkred: [
			139,
			0,
			0,
			1
		],
		darksalmon: [
			233,
			150,
			122,
			1
		],
		darkseagreen: [
			143,
			188,
			143,
			1
		],
		darkslateblue: [
			72,
			61,
			139,
			1
		],
		darkslategray: [
			47,
			79,
			79,
			1
		],
		darkslategrey: [
			47,
			79,
			79,
			1
		],
		darkturquoise: [
			0,
			206,
			209,
			1
		],
		darkviolet: [
			148,
			0,
			211,
			1
		],
		deeppink: [
			255,
			20,
			147,
			1
		],
		deepskyblue: [
			0,
			191,
			255,
			1
		],
		dimgray: [
			105,
			105,
			105,
			1
		],
		dimgrey: [
			105,
			105,
			105,
			1
		],
		dodgerblue: [
			30,
			144,
			255,
			1
		],
		firebrick: [
			178,
			34,
			34,
			1
		],
		floralwhite: [
			255,
			250,
			240,
			1
		],
		forestgreen: [
			34,
			139,
			34,
			1
		],
		fuchsia: [
			255,
			0,
			255,
			1
		],
		gainsboro: [
			220,
			220,
			220,
			1
		],
		ghostwhite: [
			248,
			248,
			255,
			1
		],
		gold: [
			255,
			215,
			0,
			1
		],
		goldenrod: [
			218,
			165,
			32,
			1
		],
		gray: [
			128,
			128,
			128,
			1
		],
		green: [
			0,
			128,
			0,
			1
		],
		greenyellow: [
			173,
			255,
			47,
			1
		],
		grey: [
			128,
			128,
			128,
			1
		],
		honeydew: [
			240,
			255,
			240,
			1
		],
		hotpink: [
			255,
			105,
			180,
			1
		],
		indianred: [
			205,
			92,
			92,
			1
		],
		indigo: [
			75,
			0,
			130,
			1
		],
		ivory: [
			255,
			255,
			240,
			1
		],
		khaki: [
			240,
			230,
			140,
			1
		],
		lavender: [
			230,
			230,
			250,
			1
		],
		lavenderblush: [
			255,
			240,
			245,
			1
		],
		lawngreen: [
			124,
			252,
			0,
			1
		],
		lemonchiffon: [
			255,
			250,
			205,
			1
		],
		lightblue: [
			173,
			216,
			230,
			1
		],
		lightcoral: [
			240,
			128,
			128,
			1
		],
		lightcyan: [
			224,
			255,
			255,
			1
		],
		lightgoldenrodyellow: [
			250,
			250,
			210,
			1
		],
		lightgray: [
			211,
			211,
			211,
			1
		],
		lightgreen: [
			144,
			238,
			144,
			1
		],
		lightgrey: [
			211,
			211,
			211,
			1
		],
		lightpink: [
			255,
			182,
			193,
			1
		],
		lightsalmon: [
			255,
			160,
			122,
			1
		],
		lightseagreen: [
			32,
			178,
			170,
			1
		],
		lightskyblue: [
			135,
			206,
			250,
			1
		],
		lightslategray: [
			119,
			136,
			153,
			1
		],
		lightslategrey: [
			119,
			136,
			153,
			1
		],
		lightsteelblue: [
			176,
			196,
			222,
			1
		],
		lightyellow: [
			255,
			255,
			224,
			1
		],
		lime: [
			0,
			255,
			0,
			1
		],
		limegreen: [
			50,
			205,
			50,
			1
		],
		linen: [
			250,
			240,
			230,
			1
		],
		magenta: [
			255,
			0,
			255,
			1
		],
		maroon: [
			128,
			0,
			0,
			1
		],
		mediumaquamarine: [
			102,
			205,
			170,
			1
		],
		mediumblue: [
			0,
			0,
			205,
			1
		],
		mediumorchid: [
			186,
			85,
			211,
			1
		],
		mediumpurple: [
			147,
			112,
			219,
			1
		],
		mediumseagreen: [
			60,
			179,
			113,
			1
		],
		mediumslateblue: [
			123,
			104,
			238,
			1
		],
		mediumspringgreen: [
			0,
			250,
			154,
			1
		],
		mediumturquoise: [
			72,
			209,
			204,
			1
		],
		mediumvioletred: [
			199,
			21,
			133,
			1
		],
		midnightblue: [
			25,
			25,
			112,
			1
		],
		mintcream: [
			245,
			255,
			250,
			1
		],
		mistyrose: [
			255,
			228,
			225,
			1
		],
		moccasin: [
			255,
			228,
			181,
			1
		],
		navajowhite: [
			255,
			222,
			173,
			1
		],
		navy: [
			0,
			0,
			128,
			1
		],
		oldlace: [
			253,
			245,
			230,
			1
		],
		olive: [
			128,
			128,
			0,
			1
		],
		olivedrab: [
			107,
			142,
			35,
			1
		],
		orange: [
			255,
			165,
			0,
			1
		],
		orangered: [
			255,
			69,
			0,
			1
		],
		orchid: [
			218,
			112,
			214,
			1
		],
		palegoldenrod: [
			238,
			232,
			170,
			1
		],
		palegreen: [
			152,
			251,
			152,
			1
		],
		paleturquoise: [
			175,
			238,
			238,
			1
		],
		palevioletred: [
			219,
			112,
			147,
			1
		],
		papayawhip: [
			255,
			239,
			213,
			1
		],
		peachpuff: [
			255,
			218,
			185,
			1
		],
		peru: [
			205,
			133,
			63,
			1
		],
		pink: [
			255,
			192,
			203,
			1
		],
		plum: [
			221,
			160,
			221,
			1
		],
		powderblue: [
			176,
			224,
			230,
			1
		],
		purple: [
			128,
			0,
			128,
			1
		],
		red: [
			255,
			0,
			0,
			1
		],
		rosybrown: [
			188,
			143,
			143,
			1
		],
		royalblue: [
			65,
			105,
			225,
			1
		],
		saddlebrown: [
			139,
			69,
			19,
			1
		],
		salmon: [
			250,
			128,
			114,
			1
		],
		sandybrown: [
			244,
			164,
			96,
			1
		],
		seagreen: [
			46,
			139,
			87,
			1
		],
		seashell: [
			255,
			245,
			238,
			1
		],
		sienna: [
			160,
			82,
			45,
			1
		],
		silver: [
			192,
			192,
			192,
			1
		],
		skyblue: [
			135,
			206,
			235,
			1
		],
		slateblue: [
			106,
			90,
			205,
			1
		],
		slategray: [
			112,
			128,
			144,
			1
		],
		slategrey: [
			112,
			128,
			144,
			1
		],
		snow: [
			255,
			250,
			250,
			1
		],
		springgreen: [
			0,
			255,
			127,
			1
		],
		steelblue: [
			70,
			130,
			180,
			1
		],
		tan: [
			210,
			180,
			140,
			1
		],
		teal: [
			0,
			128,
			128,
			1
		],
		thistle: [
			216,
			191,
			216,
			1
		],
		tomato: [
			255,
			99,
			71,
			1
		],
		turquoise: [
			64,
			224,
			208,
			1
		],
		violet: [
			238,
			130,
			238,
			1
		],
		wheat: [
			245,
			222,
			179,
			1
		],
		white: [
			255,
			255,
			255,
			1
		],
		whitesmoke: [
			245,
			245,
			245,
			1
		],
		yellow: [
			255,
			255,
			0,
			1
		],
		yellowgreen: [
			154,
			205,
			50,
			1
		]
	}, Ca = new wn(20), wa = null, Ta = new wn(100);
}));
//#endregion
//#region node_modules/zrender/lib/svg/helper.js
function Da(e) {
	return e.type === "linear";
}
function Oa(e) {
	return e.type === "radial";
}
var ka = M((() => {
	(function() {
		return globalThis.Buffer !== void 0 && typeof globalThis.Buffer.from == "function" ? function(e) {
			return globalThis.Buffer.from(e).toString("base64");
		} : typeof btoa == "function" && typeof unescape == "function" && typeof encodeURIComponent == "function" ? function(e) {
			return btoa(unescape(encodeURIComponent(e)));
		} : function(e) {
			return null;
		};
	})();
}));
//#endregion
//#region node_modules/zrender/lib/animation/Animator.js
function Aa(e, t, n) {
	return (t - e) * n + e;
}
function ja(e, t, n, r) {
	for (var i = t.length, a = 0; a < i; a++) e[a] = Aa(t[a], n[a], r);
	return e;
}
function Ma(e, t, n, r) {
	for (var i = t.length, a = i && t[0].length, o = 0; o < i; o++) {
		e[o] || (e[o] = []);
		for (var s = 0; s < a; s++) e[o][s] = Aa(t[o][s], n[o][s], r);
	}
	return e;
}
function Na(e, t, n, r) {
	for (var i = t.length, a = 0; a < i; a++) e[a] = t[a] + n[a] * r;
	return e;
}
function Pa(e, t, n, r) {
	for (var i = t.length, a = i && t[0].length, o = 0; o < i; o++) {
		e[o] || (e[o] = []);
		for (var s = 0; s < a; s++) e[o][s] = t[o][s] + n[o][s] * r;
	}
	return e;
}
function Fa(e, t) {
	for (var n = e.length, r = t.length, i = n > r ? t : e, a = Math.min(n, r), o = i[a - 1] || {
		color: [
			0,
			0,
			0,
			0
		],
		offset: 0
	}, s = a; s < Math.max(n, r); s++) i.push({
		offset: o.offset,
		color: o.color.slice()
	});
}
function Ia(e, t, n) {
	var r = e, i = t;
	if (r.push && i.push) {
		var a = r.length, o = i.length;
		if (a !== o) {
			if (a > o) r.length = o;
			else for (var s = a; s < o; s++) r.push(n === 1 ? i[s] : Ha.call(i[s]));
		}
		for (var c = r[0] && r[0].length, s = 0; s < r.length; s++) if (n === 1) isNaN(r[s]) && (r[s] = i[s]);
		else for (var l = 0; l < c; l++) isNaN(r[s][l]) && (r[s][l] = i[s][l]);
	}
}
function La(e) {
	if (rt(e)) {
		var t = e.length;
		if (rt(e[0])) {
			for (var n = [], r = 0; r < t; r++) n.push(Ha.call(e[r]));
			return n;
		}
		return Ha.call(e);
	}
	return e;
}
function Ra(e) {
	return e[0] = Math.floor(e[0]) || 0, e[1] = Math.floor(e[1]) || 0, e[2] = Math.floor(e[2]) || 0, e[3] = e[3] == null ? 1 : e[3], "rgba(" + e.join(",") + ")";
}
function za(e) {
	return rt(e && e[0]) ? 2 : 1;
}
function Ba(e) {
	return e === qa || e === Ja;
}
function Va(e) {
	return e === Wa || e === Ga;
}
var Ha, Ua, Wa, Ga, Ka, qa, Ja, Ya, Xa, Za, Qa, $a = M((() => {
	na(), Ea(), q(), Ti(), ea(), ka(), Ha = Array.prototype.slice, Ua = 0, Wa = 1, Ga = 2, Ka = 3, qa = 4, Ja = 5, Ya = 6, Xa = [
		0,
		0,
		0,
		0
	], Za = function() {
		function e(e) {
			this.keyframes = [], this.discrete = !1, this._invalid = !1, this._needsSort = !1, this._lastFr = 0, this._lastFrP = 0, this.propName = e;
		}
		return e.prototype.isFinished = function() {
			return this._finished;
		}, e.prototype.setFinished = function() {
			this._finished = !0, this._additiveTrack && this._additiveTrack.setFinished();
		}, e.prototype.needsAnimate = function() {
			return this.keyframes.length >= 1;
		}, e.prototype.getAdditiveTrack = function() {
			return this._additiveTrack;
		}, e.prototype.addKeyframe = function(e, t, n) {
			this._needsSort = !0;
			var r = this.keyframes, i = r.length, a = !1, o = Ya, s = t;
			if (rt(t)) {
				var c = za(t);
				o = c, (c === 1 && !dt(t[0]) || c === 2 && !dt(t[0][0])) && (a = !0);
			} else if (dt(t) && !_t(t)) o = Ua;
			else if (U(t)) {
				if (!isNaN(+t)) o = Ua;
				else {
					var l = pa(t);
					l && (s = l, o = Ka);
				}
			} else if (ht(t)) {
				var u = L({}, s);
				u.colorStops = B(t.colorStops, function(e) {
					return {
						offset: e.offset,
						color: pa(e.color)
					};
				}), Da(t) ? o = qa : Oa(t) && (o = Ja), s = u;
			}
			i === 0 ? this.valType = o : (o !== this.valType || o === Ya) && (a = !0), this.discrete = this.discrete || a;
			var d = {
				time: e,
				value: s,
				rawValue: t,
				percent: 0
			};
			return n && (d.easing = n, d.easingFunc = H(n) ? n : wi[n] || Qi(n)), r.push(d), d;
		}, e.prototype.prepare = function(e, t) {
			var n = this.keyframes;
			this._needsSort && n.sort(function(e, t) {
				return e.time - t.time;
			});
			for (var r = this.valType, i = n.length, a = n[i - 1], o = this.discrete, s = Va(r), c = Ba(r), l = 0; l < i; l++) {
				var u = n[l], d = u.value, f = a.value;
				u.percent = u.time / e, o || (s && l !== i - 1 ? Ia(d, f, r) : c && Fa(d.colorStops, f.colorStops));
			}
			if (!o && r !== Ja && t && this.needsAnimate() && t.needsAnimate() && r === t.valType && !t._finished) {
				this._additiveTrack = t;
				for (var p = n[0].value, l = 0; l < i; l++) r === Ua ? n[l].additiveValue = n[l].value - p : r === Ka ? n[l].additiveValue = Na([], n[l].value, p, -1) : Va(r) && (n[l].additiveValue = r === Wa ? Na([], n[l].value, p, -1) : Pa([], n[l].value, p, -1));
			}
		}, e.prototype.step = function(e, t) {
			if (!this._finished) {
				this._additiveTrack && this._additiveTrack._finished && (this._additiveTrack = null);
				var n = this._additiveTrack != null, r = n ? "additiveValue" : "value", i = this.valType, a = this.keyframes, o = a.length, s = this.propName, c = i === Ka, l, u = this._lastFr, d = Math.min, f, p;
				if (o === 1) f = p = a[0];
				else {
					if (t < 0) l = 0;
					else if (t < this._lastFrP) {
						for (l = d(u + 1, o - 1); l >= 0 && !(a[l].percent <= t); l--);
						l = d(l, o - 2);
					} else {
						for (l = u; l < o && !(a[l].percent > t); l++);
						l = d(l - 1, o - 2);
					}
					p = a[l + 1], f = a[l];
				}
				if (f && p) {
					this._lastFr = l, this._lastFrP = t;
					var m = p.percent - f.percent, h = m === 0 ? 1 : d((t - f.percent) / m, 1);
					p.easingFunc && (h = p.easingFunc(h));
					var g = n ? this._additiveValue : c ? Xa : e[s];
					if ((Va(i) || c) && !g && (g = this._additiveValue = []), this.discrete) e[s] = h < 1 ? f.rawValue : p.rawValue;
					else if (Va(i)) i === Wa ? ja(g, f[r], p[r], h) : Ma(g, f[r], p[r], h);
					else if (Ba(i)) {
						var _ = f[r], v = p[r], y = i === qa;
						e[s] = {
							type: y ? "linear" : "radial",
							x: Aa(_.x, v.x, h),
							y: Aa(_.y, v.y, h),
							colorStops: B(_.colorStops, function(e, t) {
								var n = v.colorStops[t];
								return {
									offset: Aa(e.offset, n.offset, h),
									color: Ra(ja([], e.color, n.color, h))
								};
							}),
							global: v.global
						}, y ? (e[s].x2 = Aa(_.x2, v.x2, h), e[s].y2 = Aa(_.y2, v.y2, h)) : e[s].r = Aa(_.r, v.r, h);
					} else if (c) ja(g, f[r], p[r], h), n || (e[s] = Ra(g));
					else {
						var b = Aa(f[r], p[r], h);
						n ? this._additiveValue = b : e[s] = b;
					}
					n && this._addToTarget(e);
				}
			}
		}, e.prototype._addToTarget = function(e) {
			var t = this.valType, n = this.propName, r = this._additiveValue;
			t === Ua ? e[n] = e[n] + r : t === Ka ? (pa(e[n], Xa), Na(Xa, Xa, r, 1), e[n] = Ra(Xa)) : t === Wa ? Na(e[n], e[n], r, 1) : t === Ga && Pa(e[n], e[n], r, 1);
		}, e;
	}(), Qa = function() {
		function e(e, t, n, r) {
			if (this._tracks = {}, this._trackKeys = [], this._maxTime = 0, this._started = 0, this._clip = null, this._target = e, this._loop = t, t && r) {
				Ze("Can' use additive animation on looped animation.");
				return;
			}
			this._additiveAnimators = r, this._allowDiscrete = n;
		}
		return e.prototype.getMaxTime = function() {
			return this._maxTime;
		}, e.prototype.getDelay = function() {
			return this._delay;
		}, e.prototype.getLoop = function() {
			return this._loop;
		}, e.prototype.getTarget = function() {
			return this._target;
		}, e.prototype.changeTarget = function(e) {
			this._target = e;
		}, e.prototype.when = function(e, t, n) {
			return this.whenWithKeys(e, t, st(t), n);
		}, e.prototype.whenWithKeys = function(e, t, n, r) {
			for (var i = this._tracks, a = 0; a < n.length; a++) {
				var o = n[a], s = i[o];
				if (!s) {
					s = i[o] = new Za(o);
					var c = void 0, l = this._getAdditiveTrack(o);
					if (l) {
						var u = l.keyframes, d = u[u.length - 1];
						c = d && d.value, l.valType === Ka && c && (c = Ra(c));
					} else c = this._target[o];
					if (c == null) continue;
					e > 0 && s.addKeyframe(0, La(c), r), this._trackKeys.push(o);
				}
				s.addKeyframe(e, La(t[o]), r);
			}
			return this._maxTime = Math.max(this._maxTime, e), this;
		}, e.prototype.pause = function() {
			this._clip.pause(), this._paused = !0;
		}, e.prototype.resume = function() {
			this._clip.resume(), this._paused = !1;
		}, e.prototype.isPaused = function() {
			return !!this._paused;
		}, e.prototype.duration = function(e) {
			return this._maxTime = e, this._force = !0, this;
		}, e.prototype._doneCallback = function() {
			this._setTracksFinished(), this._clip = null;
			var e = this._doneCbs;
			if (e) for (var t = e.length, n = 0; n < t; n++) e[n].call(this);
		}, e.prototype._abortedCallback = function() {
			this._setTracksFinished();
			var e = this.animation, t = this._abortedCbs;
			if (e && e.removeClip(this._clip), this._clip = null, t) for (var n = 0; n < t.length; n++) t[n].call(this);
		}, e.prototype._setTracksFinished = function() {
			for (var e = this._tracks, t = this._trackKeys, n = 0; n < t.length; n++) e[t[n]].setFinished();
		}, e.prototype._getAdditiveTrack = function(e) {
			var t, n = this._additiveAnimators;
			if (n) for (var r = 0; r < n.length; r++) {
				var i = n[r].getTrack(e);
				i && (t = i);
			}
			return t;
		}, e.prototype.start = function(e) {
			if (!(this._started > 0)) {
				this._started = 1;
				for (var t = this, n = [], r = this._maxTime || 0, i = 0; i < this._trackKeys.length; i++) {
					var a = this._trackKeys[i], o = this._tracks[a], s = this._getAdditiveTrack(a), c = o.keyframes, l = c.length;
					if (o.prepare(r, s), o.needsAnimate()) {
						if (!this._allowDiscrete && o.discrete) {
							var u = c[l - 1];
							u && (t._target[o.propName] = u.rawValue), o.setFinished();
						} else n.push(o);
					}
				}
				if (n.length || this._force) {
					var d = new ta({
						life: r,
						loop: this._loop,
						delay: this._delay || 0,
						onframe: function(e) {
							t._started = 2;
							var r = t._additiveAnimators;
							if (r) {
								for (var i = !1, a = 0; a < r.length; a++) if (r[a]._clip) {
									i = !0;
									break;
								}
								i || (t._additiveAnimators = null);
							}
							for (var a = 0; a < n.length; a++) n[a].step(t._target, e);
							var o = t._onframeCbs;
							if (o) for (var a = 0; a < o.length; a++) o[a](t._target, e);
						},
						ondestroy: function() {
							t._doneCallback();
						}
					});
					this._clip = d, this.animation && this.animation.addClip(d), e && d.setEasing(e);
				} else this._doneCallback();
				return this;
			}
		}, e.prototype.stop = function(e) {
			if (this._clip) {
				var t = this._clip;
				e && t.onframe(1), this._abortedCallback();
			}
		}, e.prototype.delay = function(e) {
			return this._delay = e, this;
		}, e.prototype.during = function(e) {
			return e && (this._onframeCbs ||= [], this._onframeCbs.push(e)), this;
		}, e.prototype.done = function(e) {
			return e && (this._doneCbs ||= [], this._doneCbs.push(e)), this;
		}, e.prototype.aborted = function(e) {
			return e && (this._abortedCbs ||= [], this._abortedCbs.push(e)), this;
		}, e.prototype.getClip = function() {
			return this._clip;
		}, e.prototype.getTrack = function(e) {
			return this._tracks[e];
		}, e.prototype.getTracks = function() {
			var e = this;
			return B(this._trackKeys, function(t) {
				return e._tracks[t];
			});
		}, e.prototype.stopTracks = function(e, t) {
			if (!e.length || !this._clip) return !0;
			for (var n = this._tracks, r = this._trackKeys, i = 0; i < e.length; i++) {
				var a = n[e[i]];
				a && !a.isFinished() && (t ? a.step(this._target, 1) : this._started === 1 && a.step(this._target, 0), a.setFinished());
			}
			for (var o = !0, i = 0; i < r.length; i++) if (!n[r[i]].isFinished()) {
				o = !1;
				break;
			}
			return o && this._abortedCallback(), o;
		}, e.prototype.saveTo = function(e, t, n) {
			if (e) {
				t ||= this._trackKeys;
				for (var r = 0; r < t.length; r++) {
					var i = t[r], a = this._tracks[i];
					if (a && !a.isFinished()) {
						var o = a.keyframes, s = o[n ? 0 : o.length - 1];
						s && (e[i] = La(s.rawValue));
					}
				}
			}
		}, e.prototype.__changeFinalValue = function(e, t) {
			t ||= st(e);
			for (var n = 0; n < t.length; n++) {
				var r = t[n], i = this._tracks[r];
				if (i) {
					var a = i.keyframes;
					if (a.length > 1) {
						var o = a.pop();
						i.addKeyframe(o.time, e[r]), i.prepare(this._maxTime, i.getAdditiveTrack());
					}
				}
			}
		}, e;
	}();
})), eo, to = M((() => {
	eo = function() {
		function e(e) {
			e && (this._$eventProcessor = e);
		}
		return e.prototype.on = function(e, t, n, r) {
			this._$handlers ||= {};
			var i = this._$handlers;
			if (typeof t == "function" && (r = n, n = t, t = null), !n || !e) return this;
			var a = this._$eventProcessor;
			t != null && a && a.normalizeQuery && (t = a.normalizeQuery(t)), i[e] || (i[e] = []);
			for (var o = 0; o < i[e].length; o++) if (i[e][o].h === n) return this;
			var s = {
				h: n,
				query: t,
				ctx: r || this,
				callAtLast: n.zrEventfulCallAtLast
			}, c = i[e].length - 1, l = i[e][c];
			return l && l.callAtLast ? i[e].splice(c, 0, s) : i[e].push(s), this;
		}, e.prototype.isSilent = function(e) {
			var t = this._$handlers;
			return !t || !t[e] || !t[e].length;
		}, e.prototype.off = function(e, t) {
			var n = this._$handlers;
			if (!n) return this;
			if (!e) return this._$handlers = {}, this;
			if (t) {
				if (n[e]) {
					for (var r = [], i = 0, a = n[e].length; i < a; i++) n[e][i].h !== t && r.push(n[e][i]);
					n[e] = r;
				}
				n[e] && n[e].length === 0 && delete n[e];
			} else delete n[e];
			return this;
		}, e.prototype.trigger = function(e) {
			var t = [...arguments].slice(1);
			if (!this._$handlers) return this;
			var n = this._$handlers[e], r = this._$eventProcessor;
			if (n) for (var i = t.length, a = n.length, o = 0; o < a; o++) {
				var s = n[o];
				if (!(r && r.filter && s.query != null && !r.filter(e, s.query))) switch (i) {
					case 0:
						s.h.call(s.ctx);
						break;
					case 1:
						s.h.call(s.ctx, t[0]);
						break;
					case 2:
						s.h.call(s.ctx, t[0], t[1]);
						break;
					default: s.h.apply(s.ctx, t);
				}
			}
			return r && r.afterTrigger && r.afterTrigger(e), this;
		}, e.prototype.triggerWithContext = function(e) {
			var t = [...arguments].slice(1);
			if (!this._$handlers) return this;
			var n = this._$handlers[e], r = this._$eventProcessor;
			if (n) for (var i = t.length, a = t[i - 1], o = n.length, s = 0; s < o; s++) {
				var c = n[s];
				if (!(r && r.filter && c.query != null && !r.filter(e, c.query))) switch (i) {
					case 0:
						c.h.call(a);
						break;
					case 1:
						c.h.call(a, t[0]);
						break;
					case 2:
						c.h.call(a, t[0], t[1]);
						break;
					default: c.h.apply(a, t.slice(1, i - 1));
				}
			}
			return r && r.afterTrigger && r.afterTrigger(e), this;
		}, e;
	}();
})), no, ro, io, ao, oo, so, co = M((() => {
	$t(), no = 1, J.hasGlobalWindow && (no = Math.max(window.devicePixelRatio || window.screen && window.screen.deviceXDPI / window.screen.logicalXDPI || 1, 1)), ro = no, io = .4, ao = "#333", oo = "#ccc", so = "#eee";
})), lo = M((() => {}));
//#endregion
//#region node_modules/zrender/lib/Element.js
function uo(e, t, n, r, i) {
	n ||= {};
	var a = [];
	_o(e, "", e, t, n, r, a, i);
	var o = a.length, s = !1, c = n.done, l = n.aborted, u = function() {
		s = !0, o--, o <= 0 && (s ? c && c() : l && l());
	}, d = function() {
		o--, o <= 0 && (s ? c && c() : l && l());
	};
	o || c && c(), a.length > 0 && n.during && a[0].during(function(e, t) {
		n.during(t);
	});
	for (var f = 0; f < a.length; f++) {
		var p = a[f];
		u && p.done(u), d && p.aborted(d), n.force && p.duration(n.duration), p.start(n.easing);
	}
	return a;
}
function fo(e, t, n) {
	for (var r = 0; r < n; r++) e[r] = t[r];
}
function po(e) {
	return rt(e[0]);
}
function mo(e, t, n) {
	if (rt(t[n])) {
		if (rt(e[n]) || (e[n] = []), pt(t[n])) {
			var r = t[n].length;
			e[n].length !== r && (e[n] = new t[n].constructor(r), fo(e[n], t[n], r));
		} else {
			var i = t[n], a = e[n], o = i.length;
			if (po(i)) for (var s = i[0].length, c = 0; c < o; c++) a[c] ? fo(a[c], i[c], s) : a[c] = Array.prototype.slice.call(i[c]);
			else fo(a, i, o);
			a.length = i.length;
		}
	} else e[n] = t[n];
}
function ho(e, t) {
	return e === t || rt(e) && rt(t) && go(e, t);
}
function go(e, t) {
	var n = e.length;
	if (n !== t.length) return !1;
	for (var r = 0; r < n; r++) if (e[r] !== t[r]) return !1;
	return !0;
}
function _o(e, t, n, r, i, a, o, s) {
	for (var c = st(r), l = i.duration, u = i.delay, d = i.additive, f = i.setToFinal, p = !W(a), m = e.animators, h = [], g = 0; g < c.length; g++) {
		var _ = c[g], v = r[_];
		if (v != null && n[_] != null && (p || a[_])) {
			if (W(v) && !rt(v) && !ht(v)) {
				if (t) {
					s || (n[_] = v, e.updateDuringAnimation(t));
					continue;
				}
				_o(e, _, n[_], v, i, a && a[_], o, s);
			} else h.push(_);
		} else s || (n[_] = v, e.updateDuringAnimation(t), h.push(_));
	}
	var y = h.length;
	if (!d && y) for (var b = 0; b < m.length; b++) {
		var x = m[b];
		if (x.targetName === t && x.stopTracks(h)) {
			var S = R(m, x);
			m.splice(S, 1);
		}
	}
	if (i.force || (h = at(h, function(e) {
		return !ho(r[e], n[e]);
	}), y = h.length), y > 0 || i.force && !o.length) {
		var C = void 0, w = void 0, T = void 0;
		if (s) {
			w = {}, f && (C = {});
			for (var b = 0; b < y; b++) {
				var _ = h[b];
				w[_] = n[_], f ? C[_] = r[_] : n[_] = r[_];
			}
		} else if (f) {
			T = {};
			for (var b = 0; b < y; b++) {
				var _ = h[b];
				T[_] = La(n[_]), mo(n, r, _);
			}
		}
		var x = new Qa(n, !1, !1, d ? at(m, function(e) {
			return e.targetName === t;
		}) : null);
		x.targetName = t, i.scope && (x.scope = i.scope), f && C && x.whenWithKeys(0, C, h), T && x.whenWithKeys(0, T, h), x.whenWithKeys(l ?? 500, s ? w : r, h).delay(u || 0), e.addAnimator(x, t), o.push(x);
	}
}
function vo(e, t, n, r) {
	return !(n && n.hoverLayer || r) || yo(e) || t && yo(t) ? 0 : 1;
}
function yo(e) {
	return e.type === "text" || e.type === "tspan";
}
function bo(e, t, n) {
	return !t && !e.__inHover && n && n.duration > 0;
}
var xo, So, Co, wo, To, Eo, Do, Oo = M((() => {
	Ci(), $a(), Dr(), to(), Hr(), q(), co(), Ea(), lo(), Bn(), xo = "__zr_normal__", So = Si.concat(["ignore"]), Co = it(Si, function(e, t) {
		return e[t] = !0, e;
	}, { ignore: !1 }), wo = {}, To = new Y(0, 0, 0, 0), Eo = [], Do = function() {
		function e(e) {
			this.id = Xe(), this.animators = [], this.currentStates = [], this.states = {}, this._init(e);
		}
		return e.prototype._init = function(e) {
			this.attr(e);
		}, e.prototype.drift = function(e, t, n) {
			switch (this.draggable) {
				case "horizontal":
					t = 0;
					break;
				case "vertical": e = 0;
			}
			var r = this.transform;
			r ||= this.transform = [
				1,
				0,
				0,
				1,
				0,
				0
			], r[4] += e, r[5] += t, this.decomposeTransform(), this.markRedraw();
		}, e.prototype.beforeUpdate = function() {}, e.prototype.afterUpdate = function() {}, e.prototype.update = function() {
			this.updateTransform(), this.__dirty && this.updateInnerText();
		}, e.prototype.updateInnerText = function(e) {
			var t = this._textContent;
			if (t && (!t.ignore || e)) {
				this.textConfig ||= {};
				var n = this.textConfig, r = n.local, i = t.innerTransformable, a = void 0, o = void 0, s = !1;
				i.parent = r ? this : null;
				var c = !1;
				i.copyTransform(t);
				var l = n.position != null, u = n.autoOverflowArea, d = void 0;
				if ((u || l) && (d = To, n.layoutRect ? d.copy(n.layoutRect) : d.copy(this.getBoundingRect()), r || d.applyTransform(this.transform)), l) {
					this.calculateTextPosition ? this.calculateTextPosition(wo, n, d) : Rr(wo, n, d), i.x = wo.x, i.y = wo.y, a = wo.align, o = wo.verticalAlign;
					var f = n.origin;
					if (f && n.rotation != null) {
						var p = void 0, m = void 0;
						f === "center" ? (p = d.width * .5, m = d.height * .5) : (p = Lr(f[0], d.width), m = Lr(f[1], d.height)), c = !0, i.originX = -i.x + p + (r ? 0 : d.x), i.originY = -i.y + m + (r ? 0 : d.y);
					}
				}
				n.rotation != null && (i.rotation = n.rotation);
				var h = n.offset;
				h && (i.x += h[0], i.y += h[1], c || (i.originX = -h[0], i.originY = -h[1]));
				var g = this._innerTextDefaultStyle ||= {};
				if (u) {
					var _ = g.overflowRect = g.overflowRect || new Y(0, 0, 0, 0);
					i.getLocalTransform(Eo), zn(Eo, Eo), Y.copy(_, d), _.applyTransform(Eo);
				} else g.overflowRect = null;
				var v = n.inside == null ? typeof n.position == "string" && n.position.indexOf("inside") >= 0 : n.inside, y = void 0, b = void 0, x = void 0;
				v && this.canBeInsideText() ? (y = n.insideFill, b = n.insideStroke, (y == null || y === "auto") && (y = this.getInsideTextFill()), (b == null || b === "auto") && (b = this.getInsideTextStroke(y), x = !0)) : (y = n.outsideFill, b = n.outsideStroke, (y == null || y === "auto") && (y = this.getOutsideFill()), (b == null || b === "auto") && (b = this.getOutsideStroke(y), x = !0)), y ||= "#000", (y !== g.fill || b !== g.stroke || x !== g.autoStroke || a !== g.align || o !== g.verticalAlign) && (s = !0, g.fill = y, g.stroke = b, g.autoStroke = x, g.align = a, g.verticalAlign = o, t.setDefaultTextStyle(g)), t.__dirty |= 1, s && t.dirtyStyle(!0);
			}
		}, e.prototype.canBeInsideText = function() {
			return !0;
		}, e.prototype.getInsideTextFill = function() {
			return "#fff";
		}, e.prototype.getInsideTextStroke = function(e) {
			return "#000";
		}, e.prototype.getOutsideFill = function() {
			return this.__zr && this.__zr.isDarkMode() ? oo : ao;
		}, e.prototype.getOutsideStroke = function(e) {
			var t = this.__zr && this.__zr.getBackgroundColor(), n = typeof t == "string" && pa(t);
			n ||= [
				255,
				255,
				255,
				1
			];
			for (var r = n[3], i = this.__zr.isDarkMode(), a = 0; a < 3; a++) n[a] = n[a] * r + (i ? 0 : 255) * (1 - r);
			return n[3] = 1, ya(n, "rgba");
		}, e.prototype.traverse = function(e, t) {}, e.prototype.attrKV = function(e, t) {
			e === "textConfig" ? this.setTextConfig(t) : e === "textContent" ? this.setTextContent(t) : e === "clipPath" ? this.setClipPath(t) : e === "extra" ? (this.extra = this.extra || {}, L(this.extra, t)) : this[e] = t;
		}, e.prototype.hide = function() {
			this.ignore = !0, this.markRedraw();
		}, e.prototype.show = function() {
			this.ignore = !1, this.markRedraw();
		}, e.prototype.attr = function(e, t) {
			if (typeof e == "string") this.attrKV(e, t);
			else if (W(e)) for (var n = st(e), r = 0; r < n.length; r++) {
				var i = n[r];
				this.attrKV(i, e[i]);
			}
			return this.markRedraw(), this;
		}, e.prototype.saveCurrentToNormalState = function(e) {
			this._innerSaveToNormal(e);
			for (var t = this._normalState, n = 0; n < this.animators.length; n++) {
				var r = this.animators[n], i = r.__fromStateTransition;
				if (!(r.getLoop() || i && i !== "__zr_normal__")) {
					var a = r.targetName, o = a ? t[a] : t;
					r.saveTo(o);
				}
			}
		}, e.prototype._innerSaveToNormal = function(e) {
			var t = this._normalState;
			t ||= this._normalState = {}, e.textConfig && !t.textConfig && (t.textConfig = this.textConfig), this._savePrimaryToNormal(e, t, So);
		}, e.prototype._savePrimaryToNormal = function(e, t, n) {
			for (var r = 0; r < n.length; r++) {
				var i = n[r];
				e[i] != null && !(i in t) && (t[i] = this[i]);
			}
		}, e.prototype.hasState = function() {
			return this.currentStates.length > 0;
		}, e.prototype.getState = function(e) {
			return this.states[e];
		}, e.prototype.ensureState = function(e) {
			var t = this.states;
			return t[e] || (t[e] = {}), t[e];
		}, e.prototype.clearStates = function(e) {
			this.useState(xo, !1, e);
		}, e.prototype.useState = function(e, t, n, r) {
			var i = e === xo;
			if (this.hasState() || !i) {
				var a = this.currentStates, o = this.stateTransition;
				if (!(R(a, e) >= 0 && (t || a.length === 1))) {
					var s;
					if (this.stateProxy && !i && (s = this.stateProxy(e)), s ||= this.states && this.states[e], !s && !i) {
						Ze("State " + e + " not exists.");
						return;
					}
					i || this.saveCurrentToNormalState(s);
					var c = this._textContent, l = vo(this, c, s, r);
					l && !this.__inHover && (this.__inHover = l), this._applyStateObj(e, s, this._normalState, t, bo(this, n, o), o);
					var u = this._textGuide;
					return c && c.useState(e, t, n, !!l), u && u.useState(e, t, n, !!l), i ? (this.currentStates = [], this._normalState = {}) : t ? this.currentStates.push(e) : this.currentStates = [e], this._updateAnimationTargets(), this.markRedraw(), !l && this.__inHover && (this.__inHover = 0, this.__dirty &= -2), s;
				}
			}
		}, e.prototype.useStates = function(e, t, n) {
			if (!e.length) this.clearStates();
			else {
				var r = [], i = this.currentStates, a = e.length, o = a === i.length;
				if (o) {
					for (var s = 0; s < a; s++) if (e[s] !== i[s]) {
						o = !1;
						break;
					}
				}
				if (o) return;
				for (var s = 0; s < a; s++) {
					var c = e[s], l = void 0;
					this.stateProxy && (l = this.stateProxy(c, e)), l ||= this.states[c], l && r.push(l);
				}
				var u = r[a - 1], d = this._textContent, f = vo(this, d, u, n);
				f && !this.__inHover && (this.__inHover = f);
				var p = this._mergeStates(r), m = this.stateTransition;
				this.saveCurrentToNormalState(p), this._applyStateObj(e.join(","), p, this._normalState, !1, bo(this, t, m), m);
				var h = this._textGuide;
				d && d.useStates(e, t, !!f), h && h.useStates(e, t, !!f), this._updateAnimationTargets(), this.currentStates = e.slice(), this.markRedraw(), !f && this.__inHover && (this.__inHover = 0, this.__dirty &= -2);
			}
		}, e.prototype.isSilent = function() {
			for (var e = this; e;) {
				if (e.silent) return !0;
				var t = e.__hostTarget;
				e = t ? e.ignoreHostSilent ? null : t : e.parent;
			}
			return !1;
		}, e.prototype._updateAnimationTargets = function() {
			for (var e = 0; e < this.animators.length; e++) {
				var t = this.animators[e];
				t.targetName && t.changeTarget(this[t.targetName]);
			}
		}, e.prototype.removeState = function(e) {
			var t = R(this.currentStates, e);
			if (t >= 0) {
				var n = this.currentStates.slice();
				n.splice(t, 1), this.useStates(n);
			}
		}, e.prototype.replaceState = function(e, t, n) {
			var r = this.currentStates.slice(), i = R(r, e), a = R(r, t) >= 0;
			i >= 0 ? a ? r.splice(i, 1) : r[i] = t : n && !a && r.push(t), this.useStates(r);
		}, e.prototype.toggleState = function(e, t) {
			t ? this.useState(e, !0) : this.removeState(e);
		}, e.prototype._mergeStates = function(e) {
			for (var t = {}, n, r = 0; r < e.length; r++) {
				var i = e[r];
				L(t, i), i.textConfig && (n ||= {}, L(n, i.textConfig));
			}
			return n && (t.textConfig = n), t;
		}, e.prototype._applyStateObj = function(e, t, n, r, i, a) {
			if (this.__inHover !== 1) {
				var o = !(t && r);
				t && t.textConfig ? (this.textConfig = L({}, r ? this.textConfig : n.textConfig), L(this.textConfig, t.textConfig)) : o && n.textConfig && (this.textConfig = n.textConfig);
				for (var s = {}, c = !1, l = 0; l < So.length; l++) {
					var u = So[l], d = i && Co[u];
					t && t[u] != null ? d ? (c = !0, s[u] = t[u]) : this[u] = t[u] : o && n[u] != null && (d ? (c = !0, s[u] = n[u]) : this[u] = n[u]);
				}
				if (!i) for (var l = 0; l < this.animators.length; l++) {
					var f = this.animators[l], p = f.targetName;
					f.getLoop() || f.__changeFinalValue(p ? (t || n)[p] : t || n);
				}
				c && this._transitionState(e, s, a);
			}
		}, e.prototype._attachComponent = function(e) {
			if ((!e.__zr || e.__hostTarget) && e !== this) {
				var t = this.__zr;
				t && e.addSelfToZr(t), e.__zr = t, e.__hostTarget = this;
			}
		}, e.prototype._detachComponent = function(e) {
			e.__zr && e.removeSelfFromZr(e.__zr), e.__zr = null, e.__hostTarget = null;
		}, e.prototype.getClipPath = function() {
			return this._clipPath;
		}, e.prototype.setClipPath = function(e) {
			this._clipPath && this._clipPath !== e && this.removeClipPath(), this._attachComponent(e), this._clipPath = e, this.markRedraw();
		}, e.prototype.removeClipPath = function() {
			var e = this._clipPath;
			e && (this._detachComponent(e), this._clipPath = null, this.markRedraw());
		}, e.prototype.getTextContent = function() {
			return this._textContent;
		}, e.prototype.setTextContent = function(e) {
			var t = this._textContent;
			t !== e && (t && t !== e && this.removeTextContent(), e.innerTransformable = new bi(), this._attachComponent(e), this._textContent = e, this.markRedraw());
		}, e.prototype.setTextConfig = function(e) {
			this.textConfig ||= {}, L(this.textConfig, e), this.markRedraw();
		}, e.prototype.removeTextConfig = function() {
			this.textConfig = null, this.markRedraw();
		}, e.prototype.removeTextContent = function() {
			var e = this._textContent;
			e && (e.innerTransformable = null, this._detachComponent(e), this._textContent = null, this._innerTextDefaultStyle = null, this.markRedraw());
		}, e.prototype.getTextGuideLine = function() {
			return this._textGuide;
		}, e.prototype.setTextGuideLine = function(e) {
			this._textGuide && this._textGuide !== e && this.removeTextGuideLine(), this._attachComponent(e), this._textGuide = e, this.markRedraw();
		}, e.prototype.removeTextGuideLine = function() {
			var e = this._textGuide;
			e && (this._detachComponent(e), this._textGuide = null, this.markRedraw());
		}, e.prototype.markRedraw = function() {
			this.__dirty |= 1;
			var e = this.__zr;
			e && (this.__inHover ? e.refreshHover() : e.refresh()), this.__hostTarget && this.__hostTarget.markRedraw();
		}, e.prototype.dirty = function() {
			this.markRedraw();
		}, e.prototype.addSelfToZr = function(e) {
			if (this.__zr !== e) {
				this.__zr = e;
				var t = this.animators;
				if (t) for (var n = 0; n < t.length; n++) e.animation.addAnimator(t[n]);
				this._clipPath && this._clipPath.addSelfToZr(e), this._textContent && this._textContent.addSelfToZr(e), this._textGuide && this._textGuide.addSelfToZr(e);
			}
		}, e.prototype.removeSelfFromZr = function(e) {
			if (this.__zr) {
				this.__zr = null;
				var t = this.animators;
				if (t) for (var n = 0; n < t.length; n++) e.animation.removeAnimator(t[n]);
				this._clipPath && this._clipPath.removeSelfFromZr(e), this._textContent && this._textContent.removeSelfFromZr(e), this._textGuide && this._textGuide.removeSelfFromZr(e);
			}
		}, e.prototype.animate = function(e, t, n) {
			var r = e ? this[e] : this, i = new Qa(r, t, n);
			return e && (i.targetName = e), this.addAnimator(i, e), i;
		}, e.prototype.addAnimator = function(e, t) {
			var n = this.__zr, r = this;
			e.during(function() {
				r.updateDuringAnimation(t);
			}).done(function() {
				var t = r.animators, n = R(t, e);
				n >= 0 && t.splice(n, 1);
			}), this.animators.push(e), n && n.animation.addAnimator(e), n && n.wakeUp();
		}, e.prototype.updateDuringAnimation = function(e) {
			this.markRedraw();
		}, e.prototype.stopAnimation = function(e, t) {
			for (var n = this.animators, r = n.length, i = [], a = 0; a < r; a++) {
				var o = n[a];
				!e || e === o.scope ? o.stop(t) : i.push(o);
			}
			return this.animators = i, this;
		}, e.prototype.animateTo = function(e, t, n) {
			uo(this, e, t, n);
		}, e.prototype.animateFrom = function(e, t, n) {
			uo(this, e, t, n, !0);
		}, e.prototype._transitionState = function(e, t, n, r) {
			for (var i = uo(this, t, n, r), a = 0; a < i.length; a++) i[a].__fromStateTransition = e;
		}, e.prototype.getBoundingRect = function() {
			return null;
		}, e.prototype.getPaintRect = function() {
			return null;
		}, e.initDefaultProps = (function() {
			var t = e.prototype;
			t.type = "element", t.name = "", t.ignore = t.silent = t.ignoreHostSilent = t.isGroup = t.draggable = t.dragging = t.ignoreClip = !1, t.__inHover = 0, t.__dirty = 1;
			function n(e, n, r, i) {
				Object.defineProperty(t, e, {
					get: function() {
						if (!this[n]) {
							var e = this[n] = [];
							a(this, e);
						}
						return this[n];
					},
					set: function(e) {
						this[r] = e[0], this[i] = e[1], this[n] = e, a(this, e);
					}
				});
				function a(e, t) {
					Object.defineProperty(t, 0, {
						get: function() {
							return e[r];
						},
						set: function(t) {
							e[r] = t;
						}
					}), Object.defineProperty(t, 1, {
						get: function() {
							return e[i];
						},
						set: function(t) {
							e[i] = t;
						}
					});
				}
			}
			Object.defineProperty && (n("position", "_legacyPos", "x", "y"), n("scale", "_legacyScale", "scaleX", "scaleY"), n("origin", "_legacyOrigin", "originX", "originY"));
		})(), e;
	}(), nt(Do, eo), nt(Do, bi);
}));
//#endregion
//#region node_modules/zrender/lib/graphic/Displayable.js
function ko(e, t, n) {
	return Io.copy(e.getBoundingRect()), e.transform && Io.applyTransform(e.transform), Lo.width = t, Lo.height = n, !Io.intersect(Lo);
}
var Ao, jo, Mo, No, Po, Fo, Io, Lo, Ro = M((() => {
	F(), Oo(), Dr(), q(), lo(), Ao = "__zr_style_" + Math.round(Math.random() * 10), jo = {
		shadowBlur: 0,
		shadowOffsetX: 0,
		shadowOffsetY: 0,
		shadowColor: "#000",
		opacity: 1,
		blend: "source-over"
	}, Mo = { style: {
		shadowBlur: !0,
		shadowOffsetX: !0,
		shadowOffsetY: !0,
		shadowColor: !0,
		opacity: !0
	} }, jo[Ao] = !0, No = [
		"z",
		"z2",
		"invisible"
	], Po = ["invisible"], Fo = function(e) {
		P(t, e);
		function t(t) {
			return e.call(this, t) || this;
		}
		return t.prototype._init = function(t) {
			for (var n = st(t), r = 0; r < n.length; r++) {
				var i = n[r];
				i === "style" ? this.useStyle(t[i]) : e.prototype.attrKV.call(this, i, t[i]);
			}
			this.style || this.useStyle({});
		}, t.prototype.beforeBrush = function(e) {}, t.prototype.afterBrush = function() {}, t.prototype.innerBeforeBrush = function() {}, t.prototype.innerAfterBrush = function() {}, t.prototype.shouldBePainted = function(e, t, n, r) {
			var i = this.transform;
			if (this.ignore || this.invisible || this.style.opacity === 0 || this.culling && ko(this, e, t) || i && !i[0] && !i[3]) return !1;
			if (n && this.__clipPaths && this.__clipPaths.length) {
				for (var a = 0; a < this.__clipPaths.length; ++a) if (this.__clipPaths[a].isZeroArea()) return !1;
			}
			if (r && this.parent) for (var o = this.parent; o;) {
				if (o.ignore) return !1;
				o = o.parent;
			}
			return !0;
		}, t.prototype.contain = function(e, t) {
			return this.rectContain(e, t);
		}, t.prototype.traverse = function(e, t) {
			e.call(t, this);
		}, t.prototype.rectContain = function(e, t) {
			var n = this.transformCoordToLocal(e, t);
			return this.getBoundingRect().contain(n[0], n[1]);
		}, t.prototype.getPaintRect = function() {
			var e = this._paintRect;
			if (!this._paintRect || this.__dirty) {
				var t = this.transform, n = this.getBoundingRect(), r = this.style, i = r.shadowBlur || 0, a = r.shadowOffsetX || 0, o = r.shadowOffsetY || 0;
				e = this._paintRect ||= new Y(0, 0, 0, 0), t ? Y.applyTransform(e, n, t) : e.copy(n), (i || a || o) && (e.width += i * 2 + Math.abs(a), e.height += i * 2 + Math.abs(o), e.x = Math.min(e.x, e.x + a - i), e.y = Math.min(e.y, e.y + o - i));
				var s = this.dirtyRectTolerance;
				e.isZero() || (e.x = Math.floor(e.x - s), e.y = Math.floor(e.y - s), e.width = Math.ceil(e.width + 1 + s * 2), e.height = Math.ceil(e.height + 1 + s * 2));
			}
			return e;
		}, t.prototype.setPrevPaintRect = function(e) {
			e ? (this._prevPaintRect = this._prevPaintRect || new Y(0, 0, 0, 0), this._prevPaintRect.copy(e)) : this._prevPaintRect = null;
		}, t.prototype.getPrevPaintRect = function() {
			return this._prevPaintRect;
		}, t.prototype.animateStyle = function(e) {
			return this.animate("style", e);
		}, t.prototype.updateDuringAnimation = function(e) {
			e === "style" ? this.dirtyStyle() : this.markRedraw();
		}, t.prototype.attrKV = function(t, n) {
			t === "style" ? this.style ? this.setStyle(n) : this.useStyle(n) : e.prototype.attrKV.call(this, t, n);
		}, t.prototype.setStyle = function(e, t) {
			return typeof e == "string" ? this.style[e] = t : L(this.style, e), this.dirtyStyle(), this;
		}, t.prototype.dirtyStyle = function(e) {
			e || this.markRedraw(), this.__dirty |= 2, this._rect &&= null;
		}, t.prototype.dirty = function() {
			this.dirtyStyle();
		}, t.prototype.styleChanged = function() {
			return !!(this.__dirty & 2);
		}, t.prototype.styleUpdated = function() {
			this.__dirty &= -3;
		}, t.prototype.createStyle = function(e) {
			return Ot(jo, e);
		}, t.prototype.useStyle = function(e) {
			e[Ao] || (e = this.createStyle(e)), this.style = e, this.dirtyStyle();
		}, t.prototype._useHoverStyle = function(e) {
			this.__hoverStyle = e;
		}, t.prototype.isStyleObject = function(e) {
			return e[Ao];
		}, t.prototype._innerSaveToNormal = function(t) {
			e.prototype._innerSaveToNormal.call(this, t);
			var n = this._normalState;
			t.style && !n.style && (n.style = this._mergeStyle(this.createStyle(), this.style)), this._savePrimaryToNormal(t, n, No);
		}, t.prototype._applyStateObj = function(t, n, r, i, a, o) {
			e.prototype._applyStateObj.call(this, t, n, r, i, a, o);
			var s = !(n && i), c = this.__inHover === 1, l;
			if (n && n.style ? a ? i ? l = n.style : (l = this._mergeStyle(this.createStyle(), r.style), this._mergeStyle(l, n.style)) : (l = this._mergeStyle(this.createStyle(), i ? this.style : r.style), this._mergeStyle(l, n.style)) : s && (l = r.style), l) {
				if (a) {
					var u = this.style;
					if (this.style = this.createStyle(s ? {} : u), s) for (var d = st(u), f = 0; f < d.length; f++) {
						var p = d[f];
						p in l && (l[p] = l[p], this.style[p] = u[p]);
					}
					for (var m = st(l), f = 0; f < m.length; f++) {
						var p = m[f];
						this.style[p] = this.style[p];
					}
					this._transitionState(t, { style: l }, o, this.getAnimationStyleProps());
				} else c ? this._useHoverStyle(l) : this.useStyle(l);
			}
			if (!c) for (var h = this.__inHover ? Po : No, f = 0; f < h.length; f++) {
				var p = h[f];
				n && n[p] != null ? this[p] = n[p] : s && r[p] != null && (this[p] = r[p]);
			}
		}, t.prototype._mergeStates = function(t) {
			for (var n = e.prototype._mergeStates.call(this, t), r, i = 0; i < t.length; i++) {
				var a = t[i];
				a.style && (r ||= {}, this._mergeStyle(r, a.style));
			}
			return r && (n.style = r), n;
		}, t.prototype._mergeStyle = function(e, t) {
			return L(e, t), e;
		}, t.prototype.getAnimationStyleProps = function() {
			return Mo;
		}, t.initDefaultProps = (function() {
			var e = t.prototype;
			e.type = "displayable", e.invisible = !1, e.z = 0, e.z2 = 0, e.zlevel = 0, e.culling = !1, e.cursor = "pointer", e.rectHover = !1, e.incremental = 0, e._rect = null, e.dirtyRectTolerance = 0, e.__dirty = 3;
		})(), t;
	}(Do), Io = new Y(0, 0, 0, 0), Lo = new Y(0, 0, 0, 0);
}));
//#endregion
//#region node_modules/zrender/lib/core/bbox.js
function zo(e, t, n, r, i, a) {
	i[0] = Uo(e, n), i[1] = Uo(t, r), a[0] = Wo(e, n), a[1] = Wo(t, r);
}
function Bo(e, t, n, r, i, a, o, s, c, l) {
	var u = ji, d = Oi, f = u(e, n, i, o, Zo);
	c[0] = Infinity, c[1] = Infinity, l[0] = -Infinity, l[1] = -Infinity;
	for (var p = 0; p < f; p++) {
		var m = d(e, n, i, o, Zo[p]);
		c[0] = Uo(m, c[0]), l[0] = Wo(m, l[0]);
	}
	f = u(t, r, a, s, Qo);
	for (var p = 0; p < f; p++) {
		var h = d(t, r, a, s, Qo[p]);
		c[1] = Uo(h, c[1]), l[1] = Wo(h, l[1]);
	}
	c[0] = Uo(e, c[0]), l[0] = Wo(e, l[0]), c[0] = Uo(o, c[0]), l[0] = Wo(o, l[0]), c[1] = Uo(t, c[1]), l[1] = Wo(t, l[1]), c[1] = Uo(s, c[1]), l[1] = Wo(s, l[1]);
}
function Vo(e, t, n, r, i, a, o, s) {
	var c = Ri, l = Fi, u = Wo(Uo(c(e, n, i), 1), 0), d = Wo(Uo(c(t, r, a), 1), 0), f = l(e, n, i, u), p = l(t, r, a, d);
	o[0] = Uo(e, i, f), o[1] = Uo(t, a, p), s[0] = Wo(e, i, f), s[1] = Wo(t, a, p);
}
function Ho(e, t, n, r, i, a, o, s, c) {
	var l = $n, u = er, d = Math.abs(i - a);
	if (d % qo < 1e-4 && d > 1e-4) {
		s[0] = e - n, s[1] = t - r, c[0] = e + n, c[1] = t + r;
		return;
	}
	if (Jo[0] = Ko(i) * n + e, Jo[1] = Go(i) * r + t, Yo[0] = Ko(a) * n + e, Yo[1] = Go(a) * r + t, l(s, Jo, Yo), u(c, Jo, Yo), i %= qo, i < 0 && (i += qo), a %= qo, a < 0 && (a += qo), i > a && !o ? a += qo : i < a && o && (i += qo), o) {
		var f = a;
		a = i, i = f;
	}
	for (var p = 0; p < a; p += Math.PI / 2) p > i && (Xo[0] = Ko(p) * n + e, Xo[1] = Go(p) * r + t, l(s, Xo, s), u(c, Xo, c));
}
var Uo, Wo, Go, Ko, qo, Jo, Yo, Xo, Zo, Qo, $o = M((() => {
	rr(), Zi(), Uo = Math.min, Wo = Math.max, Go = Math.sin, Ko = Math.cos, qo = Math.PI * 2, Jo = Vn(), Yo = Vn(), Xo = Vn(), Zo = [], Qo = [];
}));
//#endregion
//#region node_modules/zrender/lib/core/PathProxy.js
function es(e) {
	return Math.round(e / ms * 1e8) / 1e8 % 2 * ms;
}
function ts(e, t) {
	var n = es(e[0]);
	n < 0 && (n += hs);
	var r = n - e[0], i = e[1];
	i += r, !t && i - n >= hs ? i = n + hs : t && n - i >= hs ? i = n - hs : !t && n > i ? i = n + (hs - es(n - i)) : t && n < i && (i = n - (hs - es(i - n))), e[0] = n, e[1] = i;
}
var ns, rs, is, as, os, ss, cs, ls, us, ds, fs, ps, ms, hs, gs, _s, vs, ys = M((() => {
	rr(), Dr(), co(), $o(), Zi(), ns = {
		M: 1,
		L: 2,
		C: 3,
		Q: 4,
		A: 5,
		Z: 6,
		R: 7
	}, rs = [], is = [], as = [], os = [], ss = [], cs = [], ls = Math.min, us = Math.max, ds = Math.cos, fs = Math.sin, ps = Math.abs, ms = Math.PI, hs = ms * 2, gs = typeof Float32Array < "u", _s = [], vs = function() {
		function e(e) {
			this.dpr = 1, this._xi = 0, this._yi = 0, this._x0 = 0, this._y0 = 0, this._len = 0, e && (this._saveData = !1), this._saveData && (this.data = []);
		}
		return e.prototype.increaseVersion = function() {
			this._version++;
		}, e.prototype.getVersion = function() {
			return this._version;
		}, e.prototype.setScale = function(e, t, n) {
			n ||= 0, n > 0 && (this._ux = ps(n / ro / e) || 0, this._uy = ps(n / ro / t) || 0);
		}, e.prototype.setDPR = function(e) {
			this.dpr = e;
		}, e.prototype.setContext = function(e) {
			this._ctx = e;
		}, e.prototype.getContext = function() {
			return this._ctx;
		}, e.prototype.beginPath = function() {
			return this._ctx && this._ctx.beginPath(), this.reset(), this;
		}, e.prototype.reset = function() {
			this._saveData && (this._len = 0), this._pathSegLen && (this._pathSegLen = null, this._pathLen = 0), this._version++;
		}, e.prototype.moveTo = function(e, t) {
			return this._drawPendingPt(), this.addData(ns.M, e, t), this._ctx && this._ctx.moveTo(e, t), this._x0 = e, this._y0 = t, this._xi = e, this._yi = t, this;
		}, e.prototype.lineTo = function(e, t) {
			var n = ps(e - this._xi), r = ps(t - this._yi), i = n > this._ux || r > this._uy;
			if (this.addData(ns.L, e, t), this._ctx && i && this._ctx.lineTo(e, t), i) this._xi = e, this._yi = t, this._pendingPtDist = 0;
			else {
				var a = n * n + r * r;
				a > this._pendingPtDist && (this._pendingPtX = e, this._pendingPtY = t, this._pendingPtDist = a);
			}
			return this;
		}, e.prototype.bezierCurveTo = function(e, t, n, r, i, a) {
			return this._drawPendingPt(), this.addData(ns.C, e, t, n, r, i, a), this._ctx && this._ctx.bezierCurveTo(e, t, n, r, i, a), this._xi = i, this._yi = a, this;
		}, e.prototype.quadraticCurveTo = function(e, t, n, r) {
			return this._drawPendingPt(), this.addData(ns.Q, e, t, n, r), this._ctx && this._ctx.quadraticCurveTo(e, t, n, r), this._xi = n, this._yi = r, this;
		}, e.prototype.arc = function(e, t, n, r, i, a) {
			this._drawPendingPt(), _s[0] = r, _s[1] = i, ts(_s, a), r = _s[0], i = _s[1];
			var o = i - r;
			return this.addData(ns.A, e, t, n, n, r, o, 0, +!a), this._ctx && this._ctx.arc(e, t, n, r, i, a), this._xi = ds(i) * n + e, this._yi = fs(i) * n + t, this;
		}, e.prototype.arcTo = function(e, t, n, r, i) {
			return this._drawPendingPt(), this._ctx && this._ctx.arcTo(e, t, n, r, i), this;
		}, e.prototype.rect = function(e, t, n, r) {
			return this._drawPendingPt(), this._ctx && this._ctx.rect(e, t, n, r), this.addData(ns.R, e, t, n, r), this;
		}, e.prototype.closePath = function() {
			this._drawPendingPt(), this.addData(ns.Z);
			var e = this._ctx, t = this._x0, n = this._y0;
			return e && e.closePath(), this._xi = t, this._yi = n, this;
		}, e.prototype.fill = function(e) {
			e && e.fill(), this.toStatic();
		}, e.prototype.stroke = function(e) {
			e && e.stroke(), this.toStatic();
		}, e.prototype.len = function() {
			return this._len;
		}, e.prototype.setData = function(e) {
			if (this._saveData) {
				var t = e.length;
				!(this.data && this.data.length === t) && gs && (this.data = new Float32Array(t));
				for (var n = 0; n < t; n++) this.data[n] = e[n];
				this._len = t;
			}
		}, e.prototype.appendPath = function(e) {
			if (this._saveData) {
				e instanceof Array || (e = [e]);
				for (var t = e.length, n = 0, r = this._len, i = 0; i < t; i++) n += e[i].len();
				var a = this.data;
				if (gs && (a instanceof Float32Array || !a) && (this.data = new Float32Array(r + n), r > 0 && a)) for (var o = 0; o < r; o++) this.data[o] = a[o];
				for (var i = 0; i < t; i++) for (var s = e[i].data, o = 0; o < s.length; o++) this.data[r++] = s[o];
				this._len = r;
			}
		}, e.prototype.addData = function(e, t, n, r, i, a, o, s, c) {
			if (this._saveData) {
				var l = this.data;
				this._len + arguments.length > l.length && (this._expandData(), l = this.data);
				for (var u = 0; u < arguments.length; u++) l[this._len++] = arguments[u];
			}
		}, e.prototype._drawPendingPt = function() {
			this._pendingPtDist > 0 && (this._ctx && this._ctx.lineTo(this._pendingPtX, this._pendingPtY), this._pendingPtDist = 0);
		}, e.prototype._expandData = function() {
			if (!(this.data instanceof Array)) {
				for (var e = [], t = 0; t < this._len; t++) e[t] = this.data[t];
				this.data = e;
			}
		}, e.prototype.toStatic = function() {
			if (this._saveData) {
				this._drawPendingPt();
				var e = this.data;
				e instanceof Array && (e.length = this._len, gs && this._len > 11 && (this.data = new Float32Array(e)));
			}
		}, e.prototype.getBoundingRect = function() {
			as[0] = as[1] = ss[0] = ss[1] = Number.MAX_VALUE, os[0] = os[1] = cs[0] = cs[1] = -Number.MAX_VALUE;
			for (var e = this.data, t = 0, n = 0, r = 0, i = 0, a = 0; a < this._len;) {
				var o = e[a++], s = a === 1;
				switch (s && (t = e[a], n = e[a + 1], r = t, i = n), o) {
					case ns.M:
						t = r = e[a++], n = i = e[a++], ss[0] = r, ss[1] = i, cs[0] = r, cs[1] = i;
						break;
					case ns.L:
						zo(t, n, e[a], e[a + 1], ss, cs), t = e[a++], n = e[a++];
						break;
					case ns.C:
						Bo(t, n, e[a++], e[a++], e[a++], e[a++], e[a], e[a + 1], ss, cs), t = e[a++], n = e[a++];
						break;
					case ns.Q:
						Vo(t, n, e[a++], e[a++], e[a], e[a + 1], ss, cs), t = e[a++], n = e[a++];
						break;
					case ns.A:
						var c = e[a++], l = e[a++], u = e[a++], d = e[a++], f = e[a++], p = e[a++] + f;
						a += 1;
						var m = !e[a++];
						s && (r = ds(f) * u + c, i = fs(f) * d + l), Ho(c, l, u, d, f, p, m, ss, cs), t = ds(p) * u + c, n = fs(p) * d + l;
						break;
					case ns.R:
						r = t = e[a++], i = n = e[a++];
						var h = e[a++], g = e[a++];
						zo(r, i, r + h, i + g, ss, cs);
						break;
					case ns.Z: t = r, n = i;
				}
				$n(as, as, ss), er(os, os, cs);
			}
			return a === 0 && (as[0] = as[1] = os[0] = os[1] = 0), new Y(as[0], as[1], os[0] - as[0], os[1] - as[1]);
		}, e.prototype._calculateLength = function() {
			var e = this.data, t = this._len, n = this._ux, r = this._uy, i = 0, a = 0, o = 0, s = 0;
			this._pathSegLen ||= [];
			for (var c = this._pathSegLen, l = 0, u = 0, d = 0; d < t;) {
				var f = e[d++], p = d === 1;
				p && (i = e[d], a = e[d + 1], o = i, s = a);
				var m = -1;
				switch (f) {
					case ns.M:
						i = o = e[d++], a = s = e[d++];
						break;
					case ns.L:
						var h = e[d++], g = e[d++], _ = h - i, v = g - a;
						(ps(_) > n || ps(v) > r || d === t - 1) && (m = Math.sqrt(_ * _ + v * v), i = h, a = g);
						break;
					case ns.C:
						var y = e[d++], b = e[d++], h = e[d++], g = e[d++], x = e[d++], S = e[d++];
						m = Pi(i, a, y, b, h, g, x, S, 10), i = x, a = S;
						break;
					case ns.Q:
						var y = e[d++], b = e[d++], h = e[d++], g = e[d++];
						m = Vi(i, a, y, b, h, g, 10), i = h, a = g;
						break;
					case ns.A:
						var C = e[d++], w = e[d++], T = e[d++], E = e[d++], D = e[d++], O = e[d++], k = O + D;
						d += 1, p && (o = ds(D) * T + C, s = fs(D) * E + w), m = us(T, E) * ls(hs, Math.abs(O)), i = ds(k) * T + C, a = fs(k) * E + w;
						break;
					case ns.R:
						o = i = e[d++], s = a = e[d++];
						var A = e[d++], j = e[d++];
						m = A * 2 + j * 2;
						break;
					case ns.Z:
						var _ = o - i, v = s - a;
						m = Math.sqrt(_ * _ + v * v), i = o, a = s;
				}
				m >= 0 && (c[u++] = m, l += m);
			}
			return this._pathLen = l, l;
		}, e.prototype.rebuildPath = function(e, t) {
			var n = this.data, r = this._ux, i = this._uy, a = this._len, o, s, c, l, u, d, f = t < 1, p, m, h = 0, g = 0, _, v = 0, y, b;
			if (!(f && (this._pathSegLen || this._calculateLength(), p = this._pathSegLen, m = this._pathLen, _ = t * m, !_))) lo: for (var x = 0; x < a;) {
				var S = n[x++], C = x === 1;
				switch (C && (c = n[x], l = n[x + 1], o = c, s = l), S !== ns.L && v > 0 && (e.lineTo(y, b), v = 0), S) {
					case ns.M:
						o = c = n[x++], s = l = n[x++], e.moveTo(c, l);
						break;
					case ns.L:
						u = n[x++], d = n[x++];
						var w = ps(u - c), T = ps(d - l);
						if (w > r || T > i) {
							if (f) {
								var E = p[g++];
								if (h + E > _) {
									var D = (_ - h) / E;
									e.lineTo(c * (1 - D) + u * D, l * (1 - D) + d * D);
									break lo;
								}
								h += E;
							}
							e.lineTo(u, d), c = u, l = d, v = 0;
						} else {
							var O = w * w + T * T;
							O > v && (y = u, b = d, v = O);
						}
						break;
					case ns.C:
						var k = n[x++], A = n[x++], j = n[x++], ee = n[x++], te = n[x++], ne = n[x++];
						if (f) {
							var E = p[g++];
							if (h + E > _) {
								var D = (_ - h) / E;
								Mi(c, k, j, te, D, rs), Mi(l, A, ee, ne, D, is), e.bezierCurveTo(rs[1], is[1], rs[2], is[2], rs[3], is[3]);
								break lo;
							}
							h += E;
						}
						e.bezierCurveTo(k, A, j, ee, te, ne), c = te, l = ne;
						break;
					case ns.Q:
						var k = n[x++], A = n[x++], j = n[x++], ee = n[x++];
						if (f) {
							var E = p[g++];
							if (h + E > _) {
								var D = (_ - h) / E;
								zi(c, k, j, D, rs), zi(l, A, ee, D, is), e.quadraticCurveTo(rs[1], is[1], rs[2], is[2]);
								break lo;
							}
							h += E;
						}
						e.quadraticCurveTo(k, A, j, ee), c = j, l = ee;
						break;
					case ns.A:
						var re = n[x++], ie = n[x++], ae = n[x++], oe = n[x++], se = n[x++], M = n[x++], ce = n[x++], le = !n[x++], ue = ae > oe ? ae : oe, de = ps(ae - oe) > .001, fe = se + M, N = !1;
						if (f) {
							var E = p[g++];
							h + E > _ && (fe = se + M * (_ - h) / E, N = !0), h += E;
						}
						if (de && e.ellipse ? e.ellipse(re, ie, ae, oe, ce, se, fe, le) : e.arc(re, ie, ue, se, fe, le), N) break lo;
						C && (o = ds(se) * ae + re, s = fs(se) * oe + ie), c = ds(fe) * ae + re, l = fs(fe) * oe + ie;
						break;
					case ns.R:
						o = c = n[x], s = l = n[x + 1], u = n[x++], d = n[x++];
						var pe = n[x++], me = n[x++];
						if (f) {
							var E = p[g++];
							if (h + E > _) {
								var he = _ - h;
								e.moveTo(u, d), e.lineTo(u + ls(he, pe), d), he -= pe, he > 0 && e.lineTo(u + pe, d + ls(he, me)), he -= me, he > 0 && e.lineTo(u + us(pe - he, 0), d + me), he -= pe, he > 0 && e.lineTo(u, d + us(me - he, 0));
								break lo;
							}
							h += E;
						}
						e.rect(u, d, pe, me);
						break;
					case ns.Z:
						if (f) {
							var E = p[g++];
							if (h + E > _) {
								var D = (_ - h) / E;
								e.lineTo(c * (1 - D) + o * D, l * (1 - D) + s * D);
								break lo;
							}
							h += E;
						}
						e.closePath(), c = o, l = s;
				}
			}
		}, e.prototype.clone = function() {
			var t = new e(), n = this.data;
			return t.data = n.slice ? n.slice() : Array.prototype.slice.call(n), t._len = this._len, t;
		}, e.prototype.canSave = function() {
			return !!this._saveData;
		}, e.CMD = ns, e.initDefaultProps = (function() {
			var t = e.prototype;
			t._saveData = !0, t._ux = 0, t._uy = 0, t._pendingPtDist = 0, t._version = 0;
		})(), e;
	}();
}));
//#endregion
//#region node_modules/zrender/lib/contain/line.js
function bs(e, t, n, r, i, a, o) {
	if (i === 0) return !1;
	var s = i, c = 0, l = e;
	if (o > t + s && o > r + s || o < t - s && o < r - s || a > e + s && a > n + s || a < e - s && a < n - s) return !1;
	if (e !== n) c = (t - r) / (e - n), l = (e * r - n * t) / (e - n);
	else return Math.abs(a - e) <= s / 2;
	var u = c * a - o + l;
	return u * u / (c * c + 1) <= s / 2 * s / 2;
}
var xs = M((() => {}));
//#endregion
//#region node_modules/zrender/lib/contain/cubic.js
function Ss(e, t, n, r, i, a, o, s, c, l, u) {
	if (c === 0) return !1;
	var d = c;
	return u > t + d && u > r + d && u > a + d && u > s + d || u < t - d && u < r - d && u < a - d && u < s - d || l > e + d && l > n + d && l > i + d && l > o + d || l < e - d && l < n - d && l < i - d && l < o - d ? !1 : Ni(e, t, n, r, i, a, o, s, l, u, null) <= d / 2;
}
var Cs = M((() => {
	Zi();
}));
//#endregion
//#region node_modules/zrender/lib/contain/quadratic.js
function ws(e, t, n, r, i, a, o, s, c) {
	if (o === 0) return !1;
	var l = o;
	return c > t + l && c > r + l && c > a + l || c < t - l && c < r - l && c < a - l || s > e + l && s > n + l && s > i + l || s < e - l && s < n - l && s < i - l ? !1 : Bi(e, t, n, r, i, a, s, c, null) <= l / 2;
}
var Ts = M((() => {
	Zi();
}));
//#endregion
//#region node_modules/zrender/lib/contain/util.js
function Es(e) {
	return e %= Ds, e < 0 && (e += Ds), e;
}
var Ds, Os = M((() => {
	Ds = Math.PI * 2;
}));
//#endregion
//#region node_modules/zrender/lib/contain/arc.js
function ks(e, t, n, r, i, a, o, s, c) {
	if (o === 0) return !1;
	var l = o;
	s -= e, c -= t;
	var u = Math.sqrt(s * s + c * c);
	if (u - l > n || u + l < n) return !1;
	if (Math.abs(r - i) % As < 1e-4) return !0;
	if (a) {
		var d = r;
		r = Es(i), i = Es(d);
	} else r = Es(r), i = Es(i);
	r > i && (i += As);
	var f = Math.atan2(c, s);
	return f < 0 && (f += As), f >= r && f <= i || f + As >= r && f + As <= i;
}
var As, js = M((() => {
	Os(), As = Math.PI * 2;
}));
//#endregion
//#region node_modules/zrender/lib/contain/windingLine.js
function Ms(e, t, n, r, i, a) {
	if (a > t && a > r || a < t && a < r || r === t) return 0;
	var o = (a - t) / (r - t), s = r < t ? 1 : -1;
	(o === 1 || o === 0) && (s = r < t ? .5 : -.5);
	var c = o * (n - e) + e;
	return c === i ? Infinity : c > i ? s : 0;
}
var Ns = M((() => {}));
//#endregion
//#region node_modules/zrender/lib/contain/path.js
function Ps(e, t) {
	return Math.abs(e - t) < Ws;
}
function Fs() {
	var e = Ks[0];
	Ks[0] = Ks[1], Ks[1] = e;
}
function Is(e, t, n, r, i, a, o, s, c, l) {
	if (l > t && l > r && l > a && l > s || l < t && l < r && l < a && l < s) return 0;
	var u = Ai(t, r, a, s, l, Gs);
	if (u === 0) return 0;
	for (var d = 0, f = -1, p = void 0, m = void 0, h = 0; h < u; h++) {
		var g = Gs[h], _ = g === 0 || g === 1 ? .5 : 1;
		Oi(e, n, i, o, g) < c || (f < 0 && (f = ji(t, r, a, s, Ks), Ks[1] < Ks[0] && f > 1 && Fs(), p = Oi(t, r, a, s, Ks[0]), f > 1 && (m = Oi(t, r, a, s, Ks[1]))), f === 2 ? g < Ks[0] ? d += p < t ? _ : -_ : g < Ks[1] ? d += m < p ? _ : -_ : d += s < m ? _ : -_ : g < Ks[0] ? d += p < t ? _ : -_ : d += s < p ? _ : -_);
	}
	return d;
}
function Ls(e, t, n, r, i, a, o, s) {
	if (s > t && s > r && s > a || s < t && s < r && s < a) return 0;
	var c = Li(t, r, a, s, Gs);
	if (c === 0) return 0;
	var l = Ri(t, r, a);
	if (l >= 0 && l <= 1) {
		for (var u = 0, d = Fi(t, r, a, l), f = 0; f < c; f++) {
			var p = Gs[f] === 0 || Gs[f] === 1 ? .5 : 1, m = Fi(e, n, i, Gs[f]);
			m < o || (Gs[f] < l ? u += d < t ? p : -p : u += a < d ? p : -p);
		}
		return u;
	}
	var p = Gs[0] === 0 || Gs[0] === 1 ? .5 : 1, m = Fi(e, n, i, Gs[0]);
	return m < o ? 0 : a < t ? p : -p;
}
function Rs(e, t, n, r, i, a, o, s) {
	if (s -= t, s > n || s < -n) return 0;
	var c = Math.sqrt(n * n - s * s);
	Gs[0] = -c, Gs[1] = c;
	var l = Math.abs(r - i);
	if (l < 1e-4) return 0;
	if (l >= Us - 1e-4) {
		r = 0, i = Us;
		var u = a ? 1 : -1;
		return o >= Gs[0] + e && o <= Gs[1] + e ? u : 0;
	}
	if (r > i) {
		var d = r;
		r = i, i = d;
	}
	r < 0 && (r += Us, i += Us);
	for (var f = 0, p = 0; p < 2; p++) {
		var m = Gs[p];
		if (m + e > o) {
			var h = Math.atan2(s, m), u = a ? 1 : -1;
			h < 0 && (h = Us + h), (h >= r && h <= i || h + Us >= r && h + Us <= i) && (h > Math.PI / 2 && h < Math.PI * 1.5 && (u = -u), f += u);
		}
	}
	return f;
}
function zs(e, t, n, r, i) {
	for (var a = e.data, o = e.len(), s = 0, c = 0, l = 0, u = 0, d = 0, f, p, m = 0; m < o;) {
		var h = a[m++], g = m === 1;
		switch (h === Hs.M && m > 1 && (n || (s += Ms(c, l, u, d, r, i))), g && (c = a[m], l = a[m + 1], u = c, d = l), h) {
			case Hs.M:
				u = a[m++], d = a[m++], c = u, l = d;
				break;
			case Hs.L:
				if (n) {
					if (bs(c, l, a[m], a[m + 1], t, r, i)) return !0;
				} else s += Ms(c, l, a[m], a[m + 1], r, i) || 0;
				c = a[m++], l = a[m++];
				break;
			case Hs.C:
				if (n) {
					if (Ss(c, l, a[m++], a[m++], a[m++], a[m++], a[m], a[m + 1], t, r, i)) return !0;
				} else s += Is(c, l, a[m++], a[m++], a[m++], a[m++], a[m], a[m + 1], r, i) || 0;
				c = a[m++], l = a[m++];
				break;
			case Hs.Q:
				if (n) {
					if (ws(c, l, a[m++], a[m++], a[m], a[m + 1], t, r, i)) return !0;
				} else s += Ls(c, l, a[m++], a[m++], a[m], a[m + 1], r, i) || 0;
				c = a[m++], l = a[m++];
				break;
			case Hs.A:
				var _ = a[m++], v = a[m++], y = a[m++], b = a[m++], x = a[m++], S = a[m++];
				m += 1;
				var C = !!(1 - a[m++]);
				f = Math.cos(x) * y + _, p = Math.sin(x) * b + v, g ? (u = f, d = p) : s += Ms(c, l, f, p, r, i);
				var w = (r - _) * b / y + _;
				if (n) {
					if (ks(_, v, b, x, x + S, C, t, w, i)) return !0;
				} else s += Rs(_, v, b, x, x + S, C, w, i);
				c = Math.cos(x + S) * y + _, l = Math.sin(x + S) * b + v;
				break;
			case Hs.R:
				u = c = a[m++], d = l = a[m++];
				var T = a[m++], E = a[m++];
				if (f = u + T, p = d + E, n) {
					if (bs(u, d, f, d, t, r, i) || bs(f, d, f, p, t, r, i) || bs(f, p, u, p, t, r, i) || bs(u, p, u, d, t, r, i)) return !0;
				} else s += Ms(f, d, f, p, r, i), s += Ms(u, p, u, d, r, i);
				break;
			case Hs.Z:
				if (n) {
					if (bs(c, l, u, d, t, r, i)) return !0;
				} else s += Ms(c, l, u, d, r, i);
				c = u, l = d;
		}
	}
	return !n && !Ps(l, d) && (s += Ms(c, l, u, d, r, i) || 0), s !== 0;
}
function Bs(e, t, n) {
	return zs(e, 0, !1, t, n);
}
function Vs(e, t, n, r) {
	return zs(e, t, !0, n, r);
}
var Hs, Us, Ws, Gs, Ks, qs = M((() => {
	ys(), xs(), Cs(), Ts(), js(), Zi(), Ns(), Hs = vs.CMD, Us = Math.PI * 2, Ws = 1e-4, Gs = [
		-1,
		-1,
		-1
	], Ks = [-1, -1];
})), Js, Ys, Xs, Zs, Qs = M((() => {
	F(), Ro(), Oo(), ys(), qs(), q(), Ea(), co(), lo(), Ci(), Js = et({
		fill: "#000",
		stroke: null,
		strokePercent: 1,
		fillOpacity: 1,
		strokeOpacity: 1,
		lineDashOffset: 0,
		lineWidth: 1,
		lineCap: "butt",
		miterLimit: 10,
		strokeNoScale: !1,
		strokeFirst: !1
	}, jo), Ys = { style: et({
		fill: !0,
		stroke: !0,
		strokePercent: !0,
		fillOpacity: !0,
		strokeOpacity: !0,
		lineDashOffset: !0,
		lineWidth: !0,
		miterLimit: !0
	}, Mo.style) }, Xs = Si.concat([
		"invisible",
		"culling",
		"z",
		"z2",
		"zlevel",
		"parent"
	]), Zs = function(e) {
		P(t, e);
		function t(t) {
			return e.call(this, t) || this;
		}
		return t.prototype.update = function() {
			var n = this;
			e.prototype.update.call(this);
			var r = this.style;
			if (r.decal) {
				var i = this._decalEl = this._decalEl || new t();
				i.buildPath === t.prototype.buildPath && (i.buildPath = function(e) {
					n.buildPath(e, n.shape);
				}), i.silent = !0;
				var a = i.style;
				for (var o in r) a[o] !== r[o] && (a[o] = r[o]);
				a.fill = r.fill ? r.decal : null, a.decal = null, a.shadowColor = null, r.strokeFirst && (a.stroke = null);
				for (var s = 0; s < Xs.length; ++s) i[Xs[s]] = this[Xs[s]];
				i.__dirty |= 1;
			} else this._decalEl &&= null;
		}, t.prototype.getDecalElement = function() {
			return this._decalEl;
		}, t.prototype._init = function(t) {
			var n = st(t);
			this.shape = this.getDefaultShape();
			var r = this.getDefaultStyle();
			r && this.useStyle(r);
			for (var i = 0; i < n.length; i++) {
				var a = n[i], o = t[a];
				a === "style" ? this.style ? L(this.style, o) : this.useStyle(o) : a === "shape" ? L(this.shape, o) : e.prototype.attrKV.call(this, a, o);
			}
			this.style || this.useStyle({});
		}, t.prototype.getDefaultStyle = function() {
			return null;
		}, t.prototype.getDefaultShape = function() {
			return {};
		}, t.prototype.canBeInsideText = function() {
			return this.hasFill();
		}, t.prototype.getInsideTextFill = function() {
			var e = this.style.fill;
			if (e !== "none") {
				if (U(e)) {
					var t = ba(e, 0);
					return t > .5 ? ao : t > .2 ? so : oo;
				}
				if (e) return oo;
			}
			return ao;
		}, t.prototype.getInsideTextStroke = function(e) {
			var t = this.style.fill;
			if (U(t)) {
				var n = this.__zr;
				if (!!(n && n.isDarkMode()) == ba(e, 0) < .4) return t;
			}
		}, t.prototype.buildPath = function(e, t, n) {}, t.prototype.pathUpdated = function() {
			this.__dirty &= -5;
		}, t.prototype.getUpdatedPathProxy = function(e) {
			return !this.path && this.createPathProxy(), this.path.beginPath(), this.buildPath(this.path, this.shape, e), this.path;
		}, t.prototype.createPathProxy = function() {
			this.path = new vs(!1);
		}, t.prototype.hasStroke = function() {
			var e = this.style, t = e.stroke;
			return !(t == null || t === "none" || !(e.lineWidth > 0));
		}, t.prototype.hasFill = function() {
			var e = this.style.fill;
			return e != null && e !== "none";
		}, t.prototype.getBoundingRect = function() {
			var e = this._rect, t = this.style, n = !e;
			if (n) {
				var r = !1;
				this.path || (r = !0, this.createPathProxy());
				var i = this.path;
				(r || this.__dirty & 4) && (i.beginPath(), this.buildPath(i, this.shape, !1), this.pathUpdated()), e = i.getBoundingRect();
			}
			if (this._rect = e, this.hasStroke() && this.path && this.path.len() > 0) {
				var a = this._rectStroke ||= e.clone();
				if (this.__dirty || n) {
					a.copy(e);
					var o = t.strokeNoScale ? this.getLineScale() : 1, s = t.lineWidth;
					if (!this.hasFill()) {
						var c = this.strokeContainThreshold;
						s = Math.max(s, c ?? 4);
					}
					o > 1e-10 && (a.width += s / o, a.height += s / o, a.x -= s / o / 2, a.y -= s / o / 2);
				}
				return a;
			}
			return e;
		}, t.prototype.contain = function(e, t) {
			var n = this.transformCoordToLocal(e, t), r = this.getBoundingRect(), i = this.style;
			if (e = n[0], t = n[1], r.contain(e, t)) {
				var a = this.path;
				if (this.hasStroke()) {
					var o = i.lineWidth, s = i.strokeNoScale ? this.getLineScale() : 1;
					if (s > 1e-10 && (this.hasFill() || (o = Math.max(o, this.strokeContainThreshold)), Vs(a, o / s, e, t))) return !0;
				}
				if (this.hasFill()) return Bs(a, e, t);
			}
			return !1;
		}, t.prototype.dirtyShape = function() {
			this.__dirty |= 4, this._rect &&= null, this._decalEl && this._decalEl.dirtyShape(), this.markRedraw();
		}, t.prototype.dirty = function() {
			this.dirtyStyle(), this.dirtyShape();
		}, t.prototype.animateShape = function(e) {
			return this.animate("shape", e);
		}, t.prototype.updateDuringAnimation = function(e) {
			e === "style" ? this.dirtyStyle() : e === "shape" ? this.dirtyShape() : this.markRedraw();
		}, t.prototype.attrKV = function(t, n) {
			t === "shape" ? this.setShape(n) : e.prototype.attrKV.call(this, t, n);
		}, t.prototype.setShape = function(e, t) {
			var n = this.shape;
			return n ||= this.shape = {}, typeof e == "string" ? n[e] = t : L(n, e), this.dirtyShape(), this;
		}, t.prototype.shapeChanged = function() {
			return !!(this.__dirty & 4);
		}, t.prototype.createStyle = function(e) {
			return Ot(Js, e);
		}, t.prototype._innerSaveToNormal = function(t) {
			e.prototype._innerSaveToNormal.call(this, t);
			var n = this._normalState;
			t.shape && !n.shape && (n.shape = L({}, this.shape));
		}, t.prototype._applyStateObj = function(t, n, r, i, a, o) {
			if (e.prototype._applyStateObj.call(this, t, n, r, i, a, o), this.__inHover !== 1) {
				var s = !(n && i), c;
				if (n && n.shape ? a ? i ? c = n.shape : (c = L({}, r.shape), L(c, n.shape)) : (c = L({}, i ? this.shape : r.shape), L(c, n.shape)) : s && (c = r.shape), c) {
					if (a) {
						this.shape = L({}, this.shape);
						for (var l = {}, u = st(c), d = 0; d < u.length; d++) {
							var f = u[d];
							typeof c[f] == "object" ? this.shape[f] = c[f] : l[f] = c[f];
						}
						this._transitionState(t, { shape: l }, o);
					} else this.shape = c, this.dirtyShape();
				}
			}
		}, t.prototype._mergeStates = function(t) {
			for (var n = e.prototype._mergeStates.call(this, t), r, i = 0; i < t.length; i++) {
				var a = t[i];
				a.shape && (r ||= {}, this._mergeStyle(r, a.shape));
			}
			return r && (n.shape = r), n;
		}, t.prototype.getAnimationStyleProps = function() {
			return Ys;
		}, t.prototype.isZeroArea = function() {
			return !1;
		}, t.extend = function(e) {
			var n = function(t) {
				P(n, t);
				function n(n) {
					var r = t.call(this, n) || this;
					return e.init && e.init.call(r, n), r;
				}
				return n.prototype.getDefaultStyle = function() {
					return I(e.style);
				}, n.prototype.getDefaultShape = function() {
					return I(e.shape);
				}, n;
			}(t);
			for (var r in e) typeof e[r] == "function" && (n.prototype[r] = e[r]);
			return n;
		}, t.initDefaultProps = (function() {
			var e = t.prototype;
			e.type = "path", e.strokeContainThreshold = 5, e.segmentIgnoreThreshold = 0, e.subPixelOptimize = !1, e.autoBatch = !1, e.__dirty = 7;
		})(), t;
	}(Fo);
})), $s, ec, tc = M((() => {
	F(), Ro(), Qs(), q(), Ye(), di(), $s = et({
		strokeFirst: !0,
		font: Ue,
		x: 0,
		y: 0,
		textAlign: "left",
		textBaseline: "top",
		miterLimit: 2
	}, Js), ec = function(e) {
		P(t, e);
		function t() {
			return e !== null && e.apply(this, arguments) || this;
		}
		return t.prototype.hasStroke = function() {
			return ri(this.style);
		}, t.prototype.hasFill = function() {
			var e = this.style.fill;
			return e != null && e !== "none";
		}, t.prototype.createStyle = function(e) {
			return Ot($s, e);
		}, t.prototype.setBoundingRect = function(e) {
			this._rect = e;
		}, t.prototype.getBoundingRect = function() {
			return this._rect ||= ti(this.style), this._rect;
		}, t.initDefaultProps = (function() {
			var e = t.prototype;
			e.dirtyRectTolerance = 10;
		})(), t;
	}(Fo), ec.prototype.type = "tspan";
}));
//#endregion
//#region node_modules/zrender/lib/graphic/Image.js
function nc(e) {
	return !!(e && typeof e != "string" && e.width && e.height);
}
var rc, ic, ac, oc = M((() => {
	F(), Ro(), Dr(), q(), rc = et({
		x: 0,
		y: 0
	}, jo), ic = { style: et({
		x: !0,
		y: !0,
		width: !0,
		height: !0,
		sx: !0,
		sy: !0,
		sWidth: !0,
		sHeight: !0
	}, Mo.style) }, ac = function(e) {
		P(t, e);
		function t() {
			return e !== null && e.apply(this, arguments) || this;
		}
		return t.prototype.createStyle = function(e) {
			return Ot(rc, e);
		}, t.prototype._getSize = function(e) {
			var t = this.style, n = t[e];
			if (n != null) return n;
			var r = nc(t.image) ? t.image : this.__image;
			if (!r) return 0;
			var i = e === "width" ? "height" : "width", a = t[i];
			return a == null ? r[e] : r[e] / r[i] * a;
		}, t.prototype.getWidth = function() {
			return this._getSize("width");
		}, t.prototype.getHeight = function() {
			return this._getSize("height");
		}, t.prototype.getAnimationStyleProps = function() {
			return ic;
		}, t.prototype.getBoundingRect = function() {
			var e = this.style;
			return this._rect ||= new Y(e.x || 0, e.y || 0, this.getWidth(), this.getHeight()), this._rect;
		}, t;
	}(Fo), ac.prototype.type = "image";
}));
//#endregion
//#region node_modules/zrender/lib/graphic/helper/roundRect.js
function sc(e, t) {
	var n = t.x, r = t.y, i = t.width, a = t.height, o = t.r, s, c, l, u;
	i < 0 && (n += i, i = -i), a < 0 && (r += a, a = -a), typeof o == "number" ? s = c = l = u = o : o instanceof Array ? o.length === 1 ? s = c = l = u = o[0] : o.length === 2 ? (s = l = o[0], c = u = o[1]) : o.length === 3 ? (s = o[0], c = u = o[1], l = o[2]) : (s = o[0], c = o[1], l = o[2], u = o[3]) : s = c = l = u = 0;
	var d;
	s + c > i && (d = s + c, s *= i / d, c *= i / d), l + u > i && (d = l + u, l *= i / d, u *= i / d), c + l > a && (d = c + l, c *= a / d, l *= a / d), s + u > a && (d = s + u, s *= a / d, u *= a / d), e.moveTo(n + s, r), e.lineTo(n + i - c, r), c !== 0 && e.arc(n + i - c, r + c, c, -Math.PI / 2, 0), e.lineTo(n + i, r + a - l), l !== 0 && e.arc(n + i - l, r + a - l, l, 0, Math.PI / 2), e.lineTo(n + u, r + a), u !== 0 && e.arc(n + u, r + a - u, u, Math.PI / 2, Math.PI), e.lineTo(n, r + s), s !== 0 && e.arc(n + s, r + s, s, Math.PI, Math.PI * 1.5), e.closePath();
}
var cc = M((() => {}));
//#endregion
//#region node_modules/zrender/lib/graphic/helper/subPixelOptimize.js
function lc(e, t, n) {
	if (t) {
		var r = t.x1, i = t.x2, a = t.y1, o = t.y2;
		e.x1 = r, e.x2 = i, e.y1 = a, e.y2 = o;
		var s = n && n.lineWidth;
		return s ? (fc(r * 2) === fc(i * 2) && (e.x1 = e.x2 = dc(r, s, !0)), fc(a * 2) === fc(o * 2) && (e.y1 = e.y2 = dc(a, s, !0)), e) : e;
	}
}
function uc(e, t, n) {
	if (t) {
		var r = t.x, i = t.y, a = t.width, o = t.height;
		e.x = r, e.y = i, e.width = a, e.height = o;
		var s = n && n.lineWidth;
		return s ? (e.x = dc(r, s, !0), e.y = dc(i, s, !0), e.width = Math.max(dc(r + a, s, !1) - e.x, a === 0 ? 0 : 1), e.height = Math.max(dc(i + o, s, !1) - e.y, o === 0 ? 0 : 1), e) : e;
	}
}
function dc(e, t, n) {
	if (!t) return e;
	var r = fc(e * 2);
	return (r + fc(t)) % 2 == 0 ? r / 2 : (r + (n ? 1 : -1)) / 2;
}
var fc, pc = M((() => {
	fc = Math.round;
})), mc, hc, gc, _c = M((() => {
	F(), Qs(), cc(), pc(), mc = function() {
		function e() {
			this.x = 0, this.y = 0, this.width = 0, this.height = 0;
		}
		return e;
	}(), hc = {}, gc = function(e) {
		P(t, e);
		function t(t) {
			return e.call(this, t) || this;
		}
		return t.prototype.getDefaultShape = function() {
			return new mc();
		}, t.prototype.buildPath = function(e, t) {
			var n, r, i, a;
			if (this.subPixelOptimize) {
				var o = uc(hc, t, this.style);
				n = o.x, r = o.y, i = o.width, a = o.height, o.r = t.r, t = o;
			} else n = t.x, r = t.y, i = t.width, a = t.height;
			t.r ? sc(e, t) : e.rect(n, r, i, a);
		}, t.prototype.isZeroArea = function() {
			return !this.shape.width || !this.shape.height;
		}, t;
	}(Zs), gc.prototype.type = "rect";
}));
//#endregion
//#region node_modules/zrender/lib/graphic/Text.js
function vc(e) {
	return typeof e == "string" && (e.indexOf("px") !== -1 || e.indexOf("rem") !== -1 || e.indexOf("em") !== -1) ? e : isNaN(+e) ? "12px" : e + "px";
}
function yc(e, t) {
	for (var n = 0; n < Fc.length; n++) {
		var r = Fc[n], i = t[r];
		i != null && (e[r] = i);
	}
}
function bc(e) {
	return e.fontSize != null || e.fontFamily || e.fontWeight;
}
function xc(e) {
	return Sc(e), z(e.rich, Sc), e;
}
function Sc(e) {
	if (e) {
		e.font = Mc.makeFont(e);
		var t = e.align;
		t === "middle" && (t = "center"), e.align = t == null || Nc[t] ? t : "left";
		var n = e.verticalAlign;
		n === "center" && (n = "middle"), e.verticalAlign = n == null || Pc[n] ? n : "top", e.padding &&= xt(e.padding);
	}
}
function Cc(e, t) {
	return e == null || t <= 0 || e === "transparent" || e === "none" ? null : e.image || e.colorStops ? "#000" : e;
}
function wc(e) {
	return e == null || e === "none" ? null : e.image || e.colorStops ? "#000" : e;
}
function Tc(e, t, n) {
	return t === "right" ? e - n[1] : t === "center" ? e + n[3] / 2 - n[1] / 2 : e + n[3];
}
function Ec(e) {
	var t = e.text;
	return t != null && (t += ""), t;
}
function Dc(e) {
	return !!(e.backgroundColor || e.lineHeight || e.borderWidth && e.borderColor);
}
var Oc, kc, Ac, jc, Mc, Nc, Pc, Fc, Ic = M((() => {
	F(), di(), tc(), q(), Hr(), oc(), _c(), Dr(), Ro(), Ye(), Oc = { fill: "#000" }, kc = 2, Ac = {}, jc = { style: et({
		fill: !0,
		stroke: !0,
		fillOpacity: !0,
		strokeOpacity: !0,
		lineWidth: !0,
		fontSize: !0,
		lineHeight: !0,
		width: !0,
		height: !0,
		textShadowColor: !0,
		textShadowBlur: !0,
		textShadowOffsetX: !0,
		textShadowOffsetY: !0,
		backgroundColor: !0,
		padding: !0,
		borderColor: !0,
		borderWidth: !0,
		borderRadius: !0
	}, Mo.style) }, Mc = function(e) {
		P(t, e);
		function t(t) {
			var n = e.call(this) || this;
			return n.type = "text", n._children = [], n._defaultStyle = Oc, n.attr(t), n;
		}
		return t.prototype.childrenRef = function() {
			return this._children;
		}, t.prototype.update = function() {
			e.prototype.update.call(this), this.styleChanged() && this._updateSubTexts();
			for (var t = 0; t < this._children.length; t++) {
				var n = this._children[t];
				n.zlevel = this.zlevel, n.z = this.z, n.z2 = this.z2, n.culling = this.culling, n.cursor = this.cursor, n.invisible = this.invisible;
			}
		}, t.prototype.updateTransform = function() {
			var t = this.innerTransformable;
			t ? (t.updateTransform(), t.transform && (this.transform = t.transform)) : e.prototype.updateTransform.call(this);
		}, t.prototype.getLocalTransform = function(t) {
			var n = this.innerTransformable;
			return n ? n.getLocalTransform(t) : e.prototype.getLocalTransform.call(this, t);
		}, t.prototype.getComputedTransform = function() {
			return this.__hostTarget && (this.__hostTarget.getComputedTransform(), this.__hostTarget.updateInnerText(!0)), e.prototype.getComputedTransform.call(this);
		}, t.prototype._updateSubTexts = function() {
			this._childCursor = 0, xc(this.style), this.style.rich ? this._updateRichTexts() : this._updatePlainTexts(), this._children.length = this._childCursor, this.styleUpdated();
		}, t.prototype.addSelfToZr = function(t) {
			e.prototype.addSelfToZr.call(this, t);
			for (var n = 0; n < this._children.length; n++) this._children[n].__zr = t;
		}, t.prototype.removeSelfFromZr = function(t) {
			e.prototype.removeSelfFromZr.call(this, t);
			for (var n = 0; n < this._children.length; n++) this._children[n].__zr = null;
		}, t.prototype.getBoundingRect = function() {
			if (this.styleChanged() && this._updateSubTexts(), !this._rect) {
				for (var e = new Y(0, 0, 0, 0), t = this._children, n = [], r = null, i = 0; i < t.length; i++) {
					var a = t[i], o = a.getBoundingRect(), s = a.getLocalTransform(n);
					s ? (e.copy(o), e.applyTransform(s), r ||= e.clone(), r.union(e)) : (r ||= o.clone(), r.union(o));
				}
				this._rect = r || e;
			}
			return this._rect;
		}, t.prototype.setDefaultTextStyle = function(e) {
			this._defaultStyle = e || Oc;
		}, t.prototype.setTextContent = function(e) {}, t.prototype._mergeStyle = function(e, t) {
			if (!t) return e;
			var n = t.rich, r = e.rich || n && {};
			return L(e, t), n && r ? (this._mergeRich(r, n), e.rich = r) : r && (e.rich = r), e;
		}, t.prototype._mergeRich = function(e, t) {
			for (var n = st(t), r = 0; r < n.length; r++) {
				var i = n[r];
				e[i] = e[i] || {}, L(e[i], t[i]);
			}
		}, t.prototype.getAnimationStyleProps = function() {
			return jc;
		}, t.prototype._getOrCreateChild = function(e) {
			var t = this._children[this._childCursor];
			return (!t || !(t instanceof e)) && (t = new e()), this._children[this._childCursor++] = t, t.__zr = this.__zr, t.parent = this, t;
		}, t.prototype._updatePlainTexts = function() {
			var e = this.style, t = e.font || "12px sans-serif", n = e.padding, r = this._defaultStyle, i = e.x || 0, a = e.y || 0, o = e.align || r.align || "left", s = e.verticalAlign || r.verticalAlign || "top";
			$r(Ac, r.overflowRect, i, a, o, s), i = Ac.baseX, a = Ac.baseY;
			var c = qr(Ec(e), e, Ac.outerWidth, Ac.outerHeight), l = Dc(e), u = !!e.backgroundColor, d = c.outerHeight, f = c.outerWidth, p = c.lines, m = c.lineHeight;
			this.isTruncated = !!c.isTruncated;
			var h = i, g = Fr(a, c.contentHeight, s);
			if (l || n) {
				var _ = Pr(i, f, o), v = Fr(a, d, s);
				l && this._renderBackground(e, e, _, v, f, d);
			}
			g += m / 2, n && (h = Tc(i, o, n), s === "top" ? g += n[0] : s === "bottom" && (g -= n[2]));
			for (var y = 0, b = !1, x = !1, S = wc("fill" in e ? e.fill : (x = !0, r.fill)), C = Cc("stroke" in e ? e.stroke : !u && (!r.autoStroke || x) ? (y = kc, b = !0, r.stroke) : null), w = e.textShadowBlur > 0, T = 0; T < p.length; T++) {
				var E = this._getOrCreateChild(ec), D = E.createStyle();
				E.useStyle(D), D.text = p[T], D.x = h, D.y = g, o && (D.textAlign = o), D.textBaseline = "middle", D.opacity = e.opacity, D.strokeFirst = !0, w && (D.shadowBlur = e.textShadowBlur || 0, D.shadowColor = e.textShadowColor || "transparent", D.shadowOffsetX = e.textShadowOffsetX || 0, D.shadowOffsetY = e.textShadowOffsetY || 0), D.stroke = C, D.fill = S, C && (D.lineWidth = e.lineWidth || y, D.lineDash = e.lineDash, D.lineDashOffset = e.lineDashOffset || 0), D.font = t, yc(D, e), g += m, E.setBoundingRect(ni(D, c.contentWidth, c.calculatedLineHeight, b ? 0 : null));
			}
		}, t.prototype._updateRichTexts = function() {
			var e = this.style, t = this._defaultStyle, n = e.align || t.align, r = e.verticalAlign || t.verticalAlign, i = e.x || 0, a = e.y || 0;
			$r(Ac, t.overflowRect, i, a, n, r), i = Ac.baseX, a = Ac.baseY;
			var o = Jr(Ec(e), e, Ac.outerWidth, Ac.outerHeight, n), s = o.width, c = o.outerWidth, l = o.outerHeight, u = e.padding;
			this.isTruncated = !!o.isTruncated;
			var d = Pr(i, c, n), f = Fr(a, l, r), p = d, m = f;
			u && (p += u[3], m += u[0]);
			var h = p + s;
			Dc(e) && this._renderBackground(e, e, d, f, c, l);
			for (var g = !!e.backgroundColor, _ = 0; _ < o.lines.length; _++) {
				for (var v = o.lines[_], y = v.tokens, b = y.length, x = v.lineHeight, S = v.width, C = 0, w = p, T = h, E = b - 1, D = void 0; C < b && (D = y[C], !D.align || D.align === "left");) this._placeToken(D, e, x, m, w, "left", g), S -= D.width, w += D.width, C++;
				for (; E >= 0 && (D = y[E], D.align === "right");) this._placeToken(D, e, x, m, T, "right", g), S -= D.width, T -= D.width, E--;
				for (w += (s - (w - p) - (h - T) - S) / 2; C <= E;) D = y[C], this._placeToken(D, e, x, m, w + D.width / 2, "center", g), w += D.width, C++;
				m += x;
			}
		}, t.prototype._placeToken = function(e, t, n, r, i, a, o) {
			var s = t.rich[e.styleName] || {};
			s.text = e.text;
			var c = e.verticalAlign, l = r + n / 2;
			c === "top" ? l = r + e.height / 2 : c === "bottom" && (l = r + n - e.height / 2), !e.isLineHolder && Dc(s) && this._renderBackground(s, t, a === "right" ? i - e.width : a === "center" ? i - e.width / 2 : i, l - e.height / 2, e.width, e.height);
			var u = !!s.backgroundColor, d = e.textPadding;
			d && (i = Tc(i, a, d), l -= e.height / 2 - d[0] - e.innerHeight / 2);
			var f = this._getOrCreateChild(ec), p = f.createStyle();
			f.useStyle(p);
			var m = this._defaultStyle, h = !1, g = 0, _ = !1, v = wc("fill" in s ? s.fill : "fill" in t ? t.fill : (h = !0, m.fill)), y = Cc("stroke" in s ? s.stroke : "stroke" in t ? t.stroke : !u && !o && (!m.autoStroke || h) ? (g = kc, _ = !0, m.stroke) : null), b = s.textShadowBlur > 0 || t.textShadowBlur > 0;
			p.text = e.text, p.x = i, p.y = l, b && (p.shadowBlur = s.textShadowBlur || t.textShadowBlur || 0, p.shadowColor = s.textShadowColor || t.textShadowColor || "transparent", p.shadowOffsetX = s.textShadowOffsetX || t.textShadowOffsetX || 0, p.shadowOffsetY = s.textShadowOffsetY || t.textShadowOffsetY || 0), p.textAlign = a, p.textBaseline = "middle", p.font = e.font || "12px sans-serif", p.opacity = yt(s.opacity, t.opacity, 1), yc(p, s), y && (p.lineWidth = yt(s.lineWidth, t.lineWidth, g), p.lineDash = G(s.lineDash, t.lineDash), p.lineDashOffset = t.lineDashOffset || 0, p.stroke = y), v && (p.fill = v), f.setBoundingRect(ni(p, e.contentWidth, e.contentHeight, _ ? 0 : null));
		}, t.prototype._renderBackground = function(e, t, n, r, i, a) {
			var o = e.backgroundColor, s = e.borderWidth, c = e.borderColor, l = o && o.image, u = o && !l, d = e.borderRadius, f = this, p, m;
			if (u || e.lineHeight || s && c) {
				p = this._getOrCreateChild(gc), p.useStyle(p.createStyle()), p.style.fill = null;
				var h = p.shape;
				h.x = n, h.y = r, h.width = i, h.height = a, h.r = d, p.dirtyShape();
			}
			if (u) {
				var g = p.style;
				g.fill = o || null, g.fillOpacity = G(e.fillOpacity, 1);
			} else if (l) {
				m = this._getOrCreateChild(ac), m.onload = function() {
					f.dirtyStyle();
				};
				var _ = m.style;
				_.image = o.image, _.x = n, _.y = r, _.width = i, _.height = a;
			}
			if (s && c) {
				var g = p.style;
				g.lineWidth = s, g.stroke = c, g.strokeOpacity = G(e.strokeOpacity, 1), g.lineDash = e.borderDash, g.lineDashOffset = e.borderDashOffset || 0, p.strokeContainThreshold = 0, p.hasFill() && p.hasStroke() && (g.strokeFirst = !0, g.lineWidth *= 2);
			}
			var v = (p || m).style;
			v.shadowBlur = e.shadowBlur || 0, v.shadowColor = e.shadowColor || "transparent", v.shadowOffsetX = e.shadowOffsetX || 0, v.shadowOffsetY = e.shadowOffsetY || 0, v.opacity = yt(e.opacity, t.opacity, 1);
		}, t.makeFont = function(e) {
			var t = "";
			return bc(e) && (t = [
				e.fontStyle,
				e.fontWeight,
				vc(e.fontSize),
				e.fontFamily || "sans-serif"
			].join(" ")), t && Ct(t) || e.textFont || e.font;
		}, t;
	}(Fo), Nc = {
		left: !0,
		right: 1,
		center: 1
	}, Pc = {
		top: 1,
		bottom: 1,
		middle: 1
	}, Fc = [
		"fontStyle",
		"fontWeight",
		"fontSize",
		"fontFamily"
	];
}));
//#endregion
//#region node_modules/echarts/lib/util/number.js
function Lc(e) {
	return e.replace(/^\s+|\s+$/g, "");
}
function Rc(e, t, n, r) {
	var i = t[0], a = t[1], o = n[0], s = n[1], c = a - i, l = s - o;
	if (c === 0) return l === 0 ? o : (o + s) / 2;
	if (r) {
		if (c > 0) {
			if (e <= i) return o;
			if (e >= a) return s;
		} else if (e >= i) return o;
		else if (e <= a) return s;
	} else {
		if (e === i) return o;
		if (e === a) return s;
	}
	return (e - i) / c * l + o;
}
function zc(e, t, n) {
	switch (e) {
		case "center":
		case "middle":
			e = "50%";
			break;
		case "left":
		case "top":
			e = "0%";
			break;
		case "right":
		case "bottom": e = "100%";
	}
	return Bc(e, t, n);
}
function Bc(e, t, n) {
	return U(e) ? Vc(e) ? parseFloat(e) / 100 * t + (n || 0) : parseFloat(e) : e == null ? NaN : +e;
}
function Vc(e) {
	return !!Lc(e).match(/%$/);
}
function Hc(e, t, n) {
	return isNaN(t) ? n ? "" + e : +e : (t = cl(ll(0, t), sl), e = (+e).toFixed(t), n ? e : +e);
}
function Uc(e) {
	return e.sort(function(e, t) {
		return e - t;
	}), e;
}
function Wc(e) {
	if (e = +e, isNaN(e)) return 0;
	if (e > 1e-14) {
		for (var t = 1, n = 0; n < 15; n++, t *= 10) if (dl(e * t) / t === e) return n;
	}
	return Gc(e);
}
function Gc(e) {
	var t = e.toString().toLowerCase(), n = t.indexOf("e"), r = n > 0 ? +t.slice(n + 1) : 0, i = n > 0 ? n : t.length, a = t.indexOf(".");
	return ll(0, (a < 0 ? 0 : i - 1 - a) - r);
}
function Kc(e, t, n) {
	var r = ul(e[1] - e[0]);
	if (!isFinite(r) || r === 0) return NaN;
	var i = hl(2 * ul(n || 1) * ul(r)) / gl, a = hl(ul(t)) / gl, o = ll(0, pl(-i + a));
	return isFinite(o) || (o = NaN), o;
}
function qc(e, t) {
	var n = ll(Wc(e), Wc(t)), r = e + t;
	return n > sl ? r : Hc(r, n);
}
function Jc(e) {
	var t = _l * 2;
	return (e % t + t) % t;
}
function Yc(e) {
	return e > -ol && e < ol;
}
function Xc(e) {
	if (e instanceof Date) return e;
	if (U(e)) {
		var t = xl.exec(e);
		if (!t) return /* @__PURE__ */ new Date(NaN);
		if (t[8]) {
			var n = +t[4] || 0;
			return t[8].toUpperCase() !== "Z" && (n -= +t[8].slice(0, 3)), new Date(Date.UTC(+t[1], (t[2] || 1) - 1, +t[3] || 1, n, +(t[5] || 0), +t[6] || 0, t[7] ? +t[7].substring(0, 3) : 0));
		}
		return new Date(+t[1], (t[2] || 1) - 1, +t[3] || 1, +t[4] || 0, +(t[5] || 0), +t[6] || 0, t[7] ? +t[7].substring(0, 3) : 0);
	}
	return e == null ? /* @__PURE__ */ new Date(NaN) : new Date(dl(e));
}
function Zc(e) {
	return ml(10, Qc(e));
}
function Qc(e) {
	if (e === 0) return 0;
	var t = fl(hl(e) / gl);
	return e / ml(10, t) >= 10 && t++, t;
}
function $c(e, t) {
	var n = Qc(e), r = ml(10, n), i = e / r;
	return e = (t === 2 ? 1 : t ? i < 1.5 ? 1 : i < 2.5 ? 2 : i < 4 ? 3 : i < 7 ? 5 : 10 : i < 1 ? 1 : i < 2 ? 2 : i < 3 ? 3 : i < 5 ? 5 : 10) * r, Hc(e, -n);
}
function el(e) {
	var t = parseFloat(e);
	return t == e && (t !== 0 || !U(e) || e.indexOf("x") <= 0) ? t : NaN;
}
function tl(e) {
	return !isNaN(el(e));
}
function nl() {
	return dl(vl() * 9);
}
function rl(e, t) {
	return t === 0 ? e : rl(t, e % t);
}
function il(e, t) {
	return e == null ? t : t == null ? e : e * t / rl(e, t);
}
function al(e) {
	return e != null && isFinite(e);
}
var ol, sl, cl, ll, ul, dl, fl, pl, ml, hl, gl, _l, vl, yl, bl, xl, X = M((() => {
	q(), ol = 1e-4, sl = 20, cl = Math.min, ll = Math.max, ul = Math.abs, dl = Math.round, fl = Math.floor, pl = Math.ceil, ml = Math.pow, hl = Math.log, gl = Math.LN10, _l = Math.PI, vl = Math.random, yl = zc, bl = ml(2, 53) - 1, xl = /^(?:(\d{4})(?:[-\/](\d{1,2})(?:[-\/](\d{1,2})(?:[T ](\d{1,2})(?::(\d{1,2})(?::(\d{1,2})(?:[.,](\d+))?)?)?(Z|[\+\-]\d\d:?\d\d)?)?)?)?)?$/;
}));
//#endregion
//#region node_modules/echarts/lib/util/log.js
function Sl(e, t, n) {
	if (Dl) {
		if (n) {
			if (El[t]) return;
			El[t] = !0;
		}
		console[e](Tl + t);
	}
}
function Cl(e, t) {
	Sl("error", e, t);
}
function wl(e) {
	throw Error(e);
}
var Tl, El, Dl, Ol = M((() => {
	Tl = "[ECharts] ", El = {}, Dl = typeof console < "u" && console.warn && console.log;
}));
//#endregion
//#region node_modules/echarts/lib/util/model.js
function kl(e, t, n) {
	return (t - e) * n + e;
}
function Al(e) {
	return e instanceof Array ? e : e == null ? [] : [e];
}
function jl(e, t, n) {
	if (e) {
		e[t] = e[t] || {}, e.emphasis = e.emphasis || {}, e.emphasis[t] = e.emphasis[t] || {};
		for (var r = 0, i = n.length; r < i; r++) {
			var a = n[r];
			!e.emphasis[t].hasOwnProperty(a) && e[t].hasOwnProperty(a) && (e.emphasis[t][a] = e[t][a]);
		}
	}
}
function Ml(e) {
	return W(e) && !V(e) && !(e instanceof Date) ? e.value : e;
}
function Nl(e) {
	return W(e) && !(e instanceof Array);
}
function Pl(e, t, n) {
	var r = n === "normalMerge", i = n === "replaceMerge", a = n === "replaceAll";
	e ||= [], t = (t || []).slice();
	var o = K();
	z(t, function(e, n) {
		if (!W(e)) {
			t[n] = null;
			return;
		}
	});
	var s = Fl(e, o, n);
	return (r || i) && Il(s, e, o, t), r && Ll(s, t), r || i ? Rl(s, t, i) : a && zl(s, t), Bl(s), s;
}
function Fl(e, t, n) {
	var r = [];
	if (n === "replaceAll") return r;
	for (var i = 0; i < e.length; i++) {
		var a = e[i];
		a && a.id != null && t.set(a.id, i), r.push({
			existing: n === "replaceMerge" || Gl(a) ? null : a,
			newOption: null,
			keyInfo: null,
			brandNew: null
		});
	}
	return r;
}
function Il(e, t, n, r) {
	z(r, function(i, a) {
		if (i && i.id != null) {
			var o = Hl(i.id), s = n.get(o);
			if (s != null) {
				var c = e[s];
				St(!c.newOption, "Duplicated option on id \"" + o + "\"."), c.newOption = i, c.existing = t[s], r[a] = null;
			}
		}
	});
}
function Ll(e, t) {
	z(t, function(n, r) {
		if (n && n.name != null) for (var i = 0; i < e.length; i++) {
			var a = e[i].existing;
			if (!e[i].newOption && a && (a.id == null || n.id == null) && !Gl(n) && !Gl(a) && Vl("name", a, n)) {
				e[i].newOption = n, t[r] = null;
				return;
			}
		}
	});
}
function Rl(e, t, n) {
	z(t, function(t) {
		if (t) {
			for (var r, i = 0; (r = e[i]) && (r.newOption || Gl(r.existing) || r.existing && t.id != null && !Vl("id", t, r.existing));) i++;
			r ? (r.newOption = t, r.brandNew = n) : e.push({
				newOption: t,
				brandNew: n,
				existing: null,
				keyInfo: null
			}), i++;
		}
	});
}
function zl(e, t) {
	z(t, function(t) {
		e.push({
			newOption: t,
			brandNew: !0,
			existing: null,
			keyInfo: null
		});
	});
}
function Bl(e) {
	var t = K();
	z(e, function(e) {
		var n = e.existing;
		n && t.set(n.id, e);
	}), z(e, function(e) {
		var n = e.newOption;
		St(!n || n.id == null || !t.get(n.id) || t.get(n.id) === e, "id duplicates: " + (n && n.id)), n && n.id != null && t.set(n.id, e), !e.keyInfo && (e.keyInfo = {});
	}), z(e, function(e, n) {
		var r = e.existing, i = e.newOption, a = e.keyInfo;
		if (W(i)) {
			if (a.name = i.name == null ? r ? r.name : yu + n : Hl(i.name), r) a.id = Hl(r.id);
			else if (i.id != null) a.id = Hl(i.id);
			else {
				var o = 0;
				do
					a.id = "\0" + a.name + "\0" + o++;
				while (t.get(a.id));
			}
			t.set(a.id, e);
		}
	});
}
function Vl(e, t, n) {
	var r = Ul(t[e], null), i = Ul(n[e], null);
	return r != null && i != null && r === i;
}
function Hl(e) {
	return Ul(e, "");
}
function Ul(e, t) {
	return e == null ? t : U(e) ? e : dt(e) || ut(e) ? e + "" : t;
}
function Wl(e) {
	var t = e.name;
	return !!(t && t.indexOf(yu));
}
function Gl(e) {
	return e && e.id != null && Hl(e.id).indexOf(bu) === 0;
}
function Kl(e, t, n) {
	z(e, function(e) {
		var r = e.newOption;
		W(r) && (e.keyInfo.mainType = t, e.keyInfo.subType = ql(t, r, e.existing, n));
	});
}
function ql(e, t, n, r) {
	return t.type ? t.type : n ? n.subType : r.determineSubType(e, t);
}
function Jl(e, t) {
	if (t.dataIndexInside != null) return t.dataIndexInside;
	if (t.dataIndex != null) return V(t.dataIndex) ? B(t.dataIndex, function(t) {
		return e.indexOfRawIndex(t);
	}) : e.indexOfRawIndex(t.dataIndex);
	if (t.name != null) return V(t.name) ? B(t.name, function(t) {
		return e.indexOfName(t);
	}) : e.indexOfName(t.name);
}
function Yl() {
	var e = "__ec_inner_" + Su++;
	return function(t) {
		return t[e] || (t[e] = {});
	};
}
function Xl(e, t, n) {
	var r = Zl(t, n), i = r.mainTypeSpecified, a = r.queryOptionMap, o = r.others, s = n ? n.defaultMainType : null;
	return !i && s && a.set(s, {}), a.each(function(t, r) {
		var i = Ql(e, r, t, {
			useDefault: s === r,
			enableAll: n && n.enableAll != null ? n.enableAll : !0,
			enableNone: n && n.enableNone != null ? n.enableNone : !0
		});
		o[r + "Models"] = i.models, o[r + "Model"] = i.models[0];
	}), o;
}
function Zl(e, t) {
	var n;
	if (U(e)) {
		var r = {};
		r[e + "Index"] = 0, n = r;
	} else n = e;
	var i = K(), a = {}, o = !1;
	return z(n, function(e, n) {
		if (n === "dataIndex" || n === "dataIndexInside") {
			a[n] = e;
			return;
		}
		var r = n.match(/^(\w+)(Index|Id|Name)$/) || [], s = r[1], c = (r[2] || "").toLowerCase();
		if (!(!s || !c || t && t.includeMainTypes && R(t.includeMainTypes, s) < 0)) {
			o ||= !!s;
			var l = i.get(s) || i.set(s, {});
			l[c] = e;
		}
	}), {
		mainTypeSpecified: o,
		queryOptionMap: i,
		others: a
	};
}
function Ql(e, t, n, r) {
	r ||= Cu;
	var i = n.index, a = n.id, o = n.name, s = {
		models: null,
		specified: i != null || a != null || o != null
	};
	if (!s.specified) {
		var c = void 0;
		return s.models = r.useDefault && (c = e.getComponent(t)) ? [c] : [], s;
	}
	if (i === "none" || i === !1) {
		if (r.enableNone) return s.models = [], s;
		i = -1;
	}
	return i === "all" && (i = r.enableAll ? a = o = null : -1), s.models = e.queryComponents({
		mainType: t,
		index: i,
		id: a,
		name: o
	}), s;
}
function $l(e, t, n) {
	var r = {};
	r[t + "Id"] = e[t + "Id"], r[t + "Index"] = e[t + "Index"], r[t + "Name"] = e[t + "Name"];
	var i = {
		mainType: t,
		query: r
	};
	return n && (i.subType = n), i;
}
function eu(e, t, n) {
	e.setAttribute ? e.setAttribute(t, n) : e[t] = n;
}
function tu(e, t) {
	return e.getAttribute ? e.getAttribute(t) : e[t];
}
function nu(e) {
	return e === "auto" ? J.domSupported ? "html" : "richText" : e || "html";
}
function ru(e, t, n, r, i) {
	var a = t == null || t === "auto";
	if (r == null) return r;
	if (dt(r)) {
		var o = kl(n || 0, r, i);
		return Hc(o, a ? Math.max(Wc(n || 0), Wc(r)) : t);
	}
	if (U(r)) return i < 1 ? n : r;
	for (var s = [], c = n, l = r, u = Math.max(c ? c.length : 0, l.length), d = 0; d < u; ++d) {
		var f = e.getDimensionInfo(d);
		if (f && f.type === "ordinal") s[d] = (i < 1 && c ? c : l)[d];
		else {
			var p = c && c[d] ? c[d] : 0, m = l[d], o = kl(p, m, i);
			s[d] = Hc(o, a ? Math.max(Wc(p), Wc(m)) : t);
		}
	}
	return s;
}
function iu() {
	return [Infinity, -Infinity];
}
function au(e, t) {
	lu(t) && (t < e[0] && (e[0] = t), t > e[1] && (e[1] = t));
}
function ou(e, t) {
	lu(t) && t < e[0] && (e[0] = t);
}
function su(e, t) {
	lu(t) && t > e[1] && (e[1] = t);
}
function cu(e, t) {
	uu(t[0], t[1]) && (t[0] < e[0] && (e[0] = t[0]), t[1] > e[1] && (e[1] = t[1]));
}
function lu(e) {
	return e != null && isFinite(e);
}
function uu(e, t) {
	return lu(e) && lu(t) && e <= t;
}
function du(e) {
	var t = e[1] - e[0];
	return isFinite(t) && t >= 0;
}
function fu(e) {
	uu(e[0], e[1]) && e[0] > e[1] && (e[0] = e[1]);
}
function pu() {
	var e = "__ec_once_" + wu++;
	return function(t, n) {
		At(t, e) || (t[e] = 1, n());
	};
}
function mu(e, t, n) {
	var r = K(), i = 0;
	z(e, function(a) {
		var o = t(a), s = r.get(o) || 0;
		n && n(a, s), !s && !n && (e[i++] = a), r.set(o, s + 1);
	}), n || (e.length = i);
}
function hu(e) {
	return e.value + "";
}
function gu(e) {
	return e + "";
}
function _u(e, t, n) {
	var r = e.getData().count();
	return {
		progressiveRender: n.progressiveEnabled && t.incrementalPrepareRender && r >= n.threshold,
		large: e.get("large") && r >= e.get("largeThreshold"),
		modDataCount: e.get("progressiveChunkMode") === "mod" ? e.getData().count() : null
	};
}
function vu(e) {
	return { overallReset: e };
}
var yu, bu, xu, Su, Cu, wu, Z = M((() => {
	q(), $t(), X(), yu = "series\0", bu = "\0_ec_\0", xu = /* @__PURE__ */ "fontStyle.fontWeight.fontSize.fontFamily.rich.tag.color.textBorderColor.textBorderWidth.width.height.lineHeight.align.verticalAlign.baseline.shadowColor.shadowBlur.shadowOffsetX.shadowOffsetY.textShadowColor.textShadowBlur.textShadowOffsetX.textShadowOffsetY.backgroundColor.borderColor.borderWidth.borderRadius.padding".split("."), Su = nl(), Cu = {
		useDefault: !0,
		enableAll: !1,
		enableNone: !1
	}, function() {
		function e() {}
		return e.prototype.reset = function(e, t, n, r) {
			return this._list = e, this._step = r ||= 1, this._idx = t, this._end = n ?? (r > 0 ? e.length : 0), this.item = null, this.key = NaN, this;
		}, e.prototype.next = function() {
			return (this._step > 0 ? this._idx < this._end : this._idx >= this._end) && (this.item = this._list[this._idx], this.key = this._idx += this._step, !0);
		}, e;
	}(), wu = nl();
})), Tu, Eu, Du = M((() => {
	Z(), Tu = Yl(), Eu = function(e, t, n, r) {
		if (r) {
			var i = Tu(r);
			i.dataIndex = n, i.dataType = t, i.seriesIndex = e, i.ssrType = "chart", r.type === "group" && r.traverse(function(r) {
				var i = Tu(r);
				i.seriesIndex = e, i.dataIndex = n, i.dataType = t, i.ssrType = "chart";
			});
		}
	};
})), Ou, ku, Au, ju, Mu, Nu, Pu, Fu, Iu = M((() => {
	q(), Ou = K([
		"tooltip",
		"label",
		"itemName",
		"itemId",
		"itemGroupId",
		"itemChildGroupId",
		"seriesName"
	]), ku = "original", Au = "arrayRows", ju = "objectRows", Mu = "keyedColumns", Nu = "typedArray", Pu = "unknown", Fu = "column";
}));
//#endregion
//#region node_modules/echarts/lib/core/ExtensionAPI.js
function Lu(e, t) {
	return t.mainType === "series" ? e.getViewOfSeriesModel(t) : e.getViewOfComponentModel(t);
}
var Ru, zu, Bu = M((() => {
	q(), Iu(), Ru = [
		"getDom",
		"getZr",
		"getWidth",
		"getHeight",
		"getDevicePixelRatio",
		"dispatchAction",
		"isSSR",
		"isDisposed",
		"on",
		"off",
		"getDataURL",
		"getConnectedDataURL",
		"getOption",
		"getId",
		"updateLabelLayout"
	], zu = function() {
		function e(e) {
			z(Ru, function(t) {
				this[t] = Gt(e[t], e);
			}, this);
		}
		return e;
	}();
}));
//#endregion
//#region node_modules/echarts/lib/util/states.js
function Vu(e) {
	return e != null && e !== "none";
}
function Hu(e, t, n) {
	e.onHoverStateChange && (e.hoverState || 0) !== n && e.onHoverStateChange(t), e.hoverState = n;
}
function Uu(e) {
	Hu(e, "emphasis", 2);
}
function Wu(e) {
	e.hoverState === 2 && Hu(e, "normal", 0);
}
function Gu(e) {
	Hu(e, "blur", 1);
}
function Ku(e) {
	e.hoverState === 1 && Hu(e, "normal", 0);
}
function qu(e) {
	e.selected = !0;
}
function Ju(e) {
	e.selected = !1;
}
function Yu(e, t, n) {
	t(e, n);
}
function Xu(e, t, n) {
	Yu(e, t, n), e.isGroup && e.traverse(function(e) {
		Yu(e, t, n);
	});
}
function Zu(e, t) {
	switch (t) {
		case "emphasis":
			e.hoverState = 2;
			break;
		case "normal":
			e.hoverState = 0;
			break;
		case "blur":
			e.hoverState = 1;
			break;
		case "select": e.selected = !0;
	}
}
function Qu(e, t, n, r) {
	for (var i = e.style, a = {}, o = 0; o < t.length; o++) {
		var s = t[o];
		a[s] = i[s] ?? (r && r[s]);
	}
	for (var o = 0; o < e.animators.length; o++) {
		var c = e.animators[o];
		c.__fromStateTransition && c.__fromStateTransition.indexOf(n) < 0 && c.targetName === "style" && c.saveTo(a, t);
	}
	return a;
}
function $u(e, t, n, r) {
	var i = n && R(n, "select") >= 0, a = !1;
	if (e instanceof Zs) {
		var o = Id(e), s = i && o.selectFill || o.normalFill, c = i && o.selectStroke || o.normalStroke;
		if (Vu(s) || Vu(c)) {
			r ||= {};
			var l = r.style || {};
			l.fill === "inherit" ? (a = !0, r = L({}, r), l = L({}, l), l.fill = s) : !Vu(l.fill) && Vu(s) ? (a = !0, r = L({}, r), l = L({}, l), l.fill = xa(s)) : !Vu(l.stroke) && Vu(c) && (a || (r = L({}, r), l = L({}, l)), l.stroke = xa(c)), r.style = l;
		}
	}
	if (r && r.z2 == null) {
		a || (r = L({}, r));
		var u = e.z2EmphasisLift;
		r.z2 = e.z2 + (u ?? 10);
	}
	return r;
}
function ed(e, t, n) {
	if (n && n.z2 == null) {
		n = L({}, n);
		var r = e.z2SelectLift;
		n.z2 = e.z2 + (r ?? 9);
	}
	return n;
}
function td(e, t, n) {
	var r = R(e.currentStates, t) >= 0, i = e.style.opacity, a = r ? null : Qu(e, ["opacity"], t, { opacity: 1 });
	n ||= {};
	var o = n.style || {};
	return o.opacity ?? (n = L({}, n), o = L({ opacity: r ? i : a.opacity * .1 }, o), n.style = o), n;
}
function nd(e, t) {
	var n = this.states[e];
	if (this.style) {
		if (e === "emphasis") return $u(this, e, t, n);
		if (e === "blur") return td(this, e, n);
		if (e === "select") return ed(this, e, n);
	}
	return n;
}
function rd(e) {
	e.stateProxy = nd;
	var t = e.getTextContent(), n = e.getTextGuideLine();
	t && (t.stateProxy = nd), n && (n.stateProxy = nd);
}
function id(e, t) {
	!fd(e, t) && !e.__highByOuter && Xu(e, Uu);
}
function ad(e, t) {
	!fd(e, t) && !e.__highByOuter && Xu(e, Wu);
}
function od(e, t) {
	e.__highByOuter |= 1 << (t || 0), Xu(e, Uu);
}
function sd(e, t) {
	!(e.__highByOuter &= ~(1 << (t || 0))) && Xu(e, Wu);
}
function cd(e) {
	Xu(e, Gu);
}
function ld(e) {
	Xu(e, Ku);
}
function ud(e) {
	Xu(e, qu);
}
function dd(e) {
	Xu(e, Ju);
}
function fd(e, t) {
	return e.__highDownSilentOnTouch && t.zrByTouch;
}
function pd(e) {
	var t = e.getModel(), n = [], r = [];
	t.eachComponent(function(t, i) {
		var a = Ld(i), o = Lu(e, i), s = t === "series";
		!s && r.push(o), a.isBlured && (o.group.traverse(function(e) {
			Ku(e);
		}), s && n.push(i)), a.isBlured = !1;
	}), z(r, function(e) {
		e && e.toggleBlurSeries && e.toggleBlurSeries(n, !1, t);
	});
}
function md(e, t, n, r) {
	var i = r.getModel();
	n ||= "coordinateSystem";
	function a(e, t) {
		for (var n = 0; n < t.length; n++) {
			var r = e.getItemGraphicEl(t[n]);
			r && ld(r);
		}
	}
	if (e != null && t && t !== "none") {
		var o = i.getSeriesByIndex(e), s = o.coordinateSystem;
		s && s.master && (s = s.master);
		var c = [];
		i.eachSeries(function(e) {
			var i = o === e, l = e.coordinateSystem;
			if (l && l.master && (l = l.master), !(n === "series" && !i || n === "coordinateSystem" && !(l && s ? l === s : i) || t === "series" && i)) {
				if (r.getViewOfSeriesModel(e).group.traverse(function(e) {
					e.__highByOuter && i && t === "self" || Gu(e);
				}), rt(t)) a(e.getData(), t);
				else if (W(t)) for (var u = st(t), d = 0; d < u.length; d++) a(e.getData(u[d]), t[u[d]]);
				c.push(e), Ld(e).isBlured = !0;
			}
		}), i.eachComponent(function(e, t) {
			if (e !== "series") {
				var n = r.getViewOfComponentModel(t);
				n && n.toggleBlurSeries && n.toggleBlurSeries(c, !0, i);
			}
		});
	}
}
function hd(e, t, n) {
	if (e != null && t != null) {
		var r = n.getModel().getComponent(e, t);
		if (r) {
			Ld(r).isBlured = !0;
			var i = n.getViewOfComponentModel(r);
			i && i.focusBlurEnabled && i.group.traverse(function(e) {
				Gu(e);
			});
		}
	}
}
function gd(e, t, n) {
	var r = e.seriesIndex, i = e.getData(t.dataType);
	if (i) {
		var a = Jl(i, t);
		a = (V(a) ? a[0] : a) || 0;
		var o = i.getItemGraphicEl(a);
		if (!o) for (var s = i.count(), c = 0; !o && c < s;) o = i.getItemGraphicEl(c++);
		if (o) {
			var l = Tu(o);
			md(r, l.focus, l.blurScope, n);
		} else {
			var u = e.get(["emphasis", "focus"]), d = e.get(["emphasis", "blurScope"]);
			u != null && md(r, u, d, n);
		}
	}
}
function _d(e, t, n, r) {
	var i = {
		focusSelf: !1,
		dispatchers: null
	};
	if (e == null || e === "series" || t == null || n == null) return i;
	var a = r.getModel().getComponent(e, t);
	if (!a) return i;
	var o = r.getViewOfComponentModel(a);
	if (!o || !o.findHighDownDispatchers) return i;
	for (var s = o.findHighDownDispatchers(n), c, l = 0; l < s.length; l++) if (Tu(s[l]).focus === "self") {
		c = !0;
		break;
	}
	return {
		focusSelf: c,
		dispatchers: s
	};
}
function vd(e, t, n) {
	var r = Tu(e), i = _d(r.componentMainType, r.componentIndex, r.componentHighDownName, n), a = i.dispatchers, o = i.focusSelf;
	a ? (o && hd(r.componentMainType, r.componentIndex, n), z(a, function(e) {
		return id(e, t);
	})) : (md(r.seriesIndex, r.focus, r.blurScope, n), r.focus === "self" && hd(r.componentMainType, r.componentIndex, n), id(e, t));
}
function yd(e, t, n) {
	pd(n);
	var r = Tu(e), i = _d(r.componentMainType, r.componentIndex, r.componentHighDownName, n).dispatchers;
	i ? z(i, function(e) {
		return ad(e, t);
	}) : ad(e, t);
}
function bd(e, t, n) {
	if (jd(t)) {
		var r = t.dataType, i = Jl(e.getData(r), t);
		V(i) || (i = [i]), e[t.type === "toggleSelect" ? "toggleSelect" : t.type === "select" ? "select" : "unselect"](i, r);
	}
}
function xd(e) {
	z(e.getAllData(), function(t) {
		var n = t.data, r = t.type;
		n.eachItemGraphicEl(function(t, n) {
			e.isSelected(n, r) ? ud(t) : dd(t);
		});
	});
}
function Sd(e) {
	var t = [];
	return e.eachSeries(function(e) {
		z(e.getAllData(), function(n) {
			n.data;
			var r = n.type, i = e.getSelectedDataIndices();
			if (i.length > 0) {
				var a = {
					dataIndex: i,
					seriesIndex: e.seriesIndex
				};
				r != null && (a.dataType = r), t.push(a);
			}
		});
	}), t;
}
function Cd(e, t, n) {
	Od(e, !0), Xu(e, rd), Ed(e, t, n);
}
function wd(e) {
	Od(e, !1);
}
function Td(e, t, n, r) {
	r ? wd(e) : Cd(e, t, n);
}
function Ed(e, t, n) {
	var r = Tu(e);
	t == null ? r.focus &&= null : (r.focus = t, r.blurScope = n);
}
function Dd(e, t, n, r) {
	n ||= "itemStyle";
	for (var i = 0; i < Kd.length; i++) {
		var a = Kd[i], o = t.getModel([a, n]), s = e.ensureState(a);
		s.style = r ? r(o) : o[qd[n]]();
	}
}
function Od(e, t) {
	var n = t === !1, r = e;
	e.highDownSilentOnTouch && (r.__highDownSilentOnTouch = e.highDownSilentOnTouch), (!n || r.__highDownDispatcher) && (r.__highByOuter = r.__highByOuter || 0, r.__highDownDispatcher = !n);
}
function kd(e) {
	return !!(e && e.__highDownDispatcher);
}
function Ad(e) {
	var t = Fd[e];
	return t == null && Pd <= 32 && (t = Fd[e] = Pd++), t;
}
function jd(e) {
	var t = e.type;
	return t === "select" || t === "unselect" || t === "toggleSelect";
}
function Md(e) {
	var t = e.type;
	return t === "highlight" || t === "downplay";
}
function Nd(e) {
	var t = Id(e);
	t.normalFill = e.style.fill, t.normalStroke = e.style.stroke;
	var n = e.states.select || {};
	t.selectFill = n.style && n.style.fill || null, t.selectStroke = n.style && n.style.stroke || null;
}
var Pd, Fd, Id, Ld, Rd, zd, Bd, Vd, Hd, Ud, Wd, Gd, Kd, qd, Jd = M((() => {
	q(), Du(), Ea(), Z(), Qs(), Bu(), Pd = 1, Fd = {}, Id = Yl(), Ld = Yl(), Rd = [
		"emphasis",
		"blur",
		"select"
	], zd = [
		"normal",
		"emphasis",
		"blur",
		"select"
	], Bd = "highlight", Vd = "downplay", Hd = "select", Ud = "unselect", Wd = "toggleSelect", Gd = "selectchanged", Kd = [
		"emphasis",
		"blur",
		"select"
	], qd = {
		itemStyle: "getItemStyle",
		lineStyle: "getLineStyle",
		areaStyle: "getAreaStyle"
	};
}));
//#endregion
//#region node_modules/zrender/lib/tool/transformPath.js
function Yd(e, t) {
	if (t) {
		var n = e.data, r = e.len(), i, a, o, s, c, l, u = Xd.M, d = Xd.C, f = Xd.L, p = Xd.R, m = Xd.A, h = Xd.Q;
		for (o = 0, s = 0; o < r;) {
			switch (i = n[o++], s = o, a = 0, i) {
				case u:
					a = 1;
					break;
				case f:
					a = 1;
					break;
				case d:
					a = 3;
					break;
				case h:
					a = 2;
					break;
				case m:
					var g = t[4], _ = t[5], v = Qd(t[0] * t[0] + t[1] * t[1]), y = Qd(t[2] * t[2] + t[3] * t[3]), b = $d(-t[1] / y, t[0] / v);
					n[o] *= v, n[o++] += g, n[o] *= y, n[o++] += _, n[o++] *= v, n[o++] *= y, n[o++] += b, n[o++] += b, o += 2, s = o;
					break;
				case p: l[0] = n[o++], l[1] = n[o++], Qn(l, l, t), n[s++] = l[0], n[s++] = l[1], l[0] += n[o++], l[1] += n[o++], Qn(l, l, t), n[s++] = l[0], n[s++] = l[1];
			}
			for (c = 0; c < a; c++) {
				var x = Zd[c];
				x[0] = n[o++], x[1] = n[o++], Qn(x, x, t), n[s++] = x[0], n[s++] = x[1];
			}
		}
		e.increaseVersion();
	}
}
var Xd, Zd, Qd, $d, ef = M((() => {
	ys(), rr(), Xd = vs.CMD, Zd = [
		[],
		[],
		[]
	], Qd = Math.sqrt, $d = Math.atan2;
}));
//#endregion
//#region node_modules/zrender/lib/tool/path.js
function tf(e) {
	return Math.sqrt(e[0] * e[0] + e[1] * e[1]);
}
function nf(e, t) {
	return (e[0] * t[0] + e[1] * t[1]) / (tf(e) * tf(t));
}
function rf(e, t) {
	return (e[0] * t[1] < e[1] * t[0] ? -1 : 1) * Math.acos(nf(e, t));
}
function af(e, t, n, r, i, a, o, s, c, l, u) {
	var d = hf / 180 * c, f = mf(d) * (e - n) / 2 + pf(d) * (t - r) / 2, p = -1 * pf(d) * (e - n) / 2 + mf(d) * (t - r) / 2, m = f * f / (o * o) + p * p / (s * s);
	m > 1 && (o *= ff(m), s *= ff(m));
	var h = (i === a ? -1 : 1) * ff((o * o * (s * s) - o * o * (p * p) - s * s * (f * f)) / (o * o * (p * p) + s * s * (f * f))) || 0, g = h * o * p / s, _ = h * -s * f / o, v = (e + n) / 2 + mf(d) * g - pf(d) * _, y = (t + r) / 2 + pf(d) * g + mf(d) * _, b = rf([1, 0], [(f - g) / o, (p - _) / s]), x = [(f - g) / o, (p - _) / s], S = [(-1 * f - g) / o, (-1 * p - _) / s], C = rf(x, S);
	if (nf(x, S) <= -1 && (C = hf), nf(x, S) >= 1 && (C = 0), C < 0) {
		var w = Math.round(C / hf * 1e6) / 1e6;
		C = hf * 2 + w % 2 * hf;
	}
	u.addData(l, v, y, o, s, b, C, d, a);
}
function of(e) {
	var t = new vs();
	if (!e) return t;
	var n = 0, r = 0, i = n, a = r, o, s = vs.CMD, c = e.match(gf);
	if (!c) return t;
	for (var l = 0; l < c.length; l++) {
		for (var u = c[l], d = u.charAt(0), f = void 0, p = u.match(_f) || [], m = p.length, h = 0; h < m; h++) p[h] = parseFloat(p[h]);
		for (var g = 0; g < m;) {
			var _ = void 0, v = void 0, y = void 0, b = void 0, x = void 0, S = void 0, C = void 0, w = n, T = r, E = void 0, D = void 0;
			switch (d) {
				case "l":
					n += p[g++], r += p[g++], f = s.L, t.addData(f, n, r);
					break;
				case "L":
					n = p[g++], r = p[g++], f = s.L, t.addData(f, n, r);
					break;
				case "m":
					n += p[g++], r += p[g++], f = s.M, t.addData(f, n, r), i = n, a = r, d = "l";
					break;
				case "M":
					n = p[g++], r = p[g++], f = s.M, t.addData(f, n, r), i = n, a = r, d = "L";
					break;
				case "h":
					n += p[g++], f = s.L, t.addData(f, n, r);
					break;
				case "H":
					n = p[g++], f = s.L, t.addData(f, n, r);
					break;
				case "v":
					r += p[g++], f = s.L, t.addData(f, n, r);
					break;
				case "V":
					r = p[g++], f = s.L, t.addData(f, n, r);
					break;
				case "C":
					f = s.C, t.addData(f, p[g++], p[g++], p[g++], p[g++], p[g++], p[g++]), n = p[g - 2], r = p[g - 1];
					break;
				case "c":
					f = s.C, t.addData(f, p[g++] + n, p[g++] + r, p[g++] + n, p[g++] + r, p[g++] + n, p[g++] + r), n += p[g - 2], r += p[g - 1];
					break;
				case "S":
					_ = n, v = r, E = t.len(), D = t.data, o === s.C && (_ += n - D[E - 4], v += r - D[E - 3]), f = s.C, w = p[g++], T = p[g++], n = p[g++], r = p[g++], t.addData(f, _, v, w, T, n, r);
					break;
				case "s":
					_ = n, v = r, E = t.len(), D = t.data, o === s.C && (_ += n - D[E - 4], v += r - D[E - 3]), f = s.C, w = n + p[g++], T = r + p[g++], n += p[g++], r += p[g++], t.addData(f, _, v, w, T, n, r);
					break;
				case "Q":
					w = p[g++], T = p[g++], n = p[g++], r = p[g++], f = s.Q, t.addData(f, w, T, n, r);
					break;
				case "q":
					w = p[g++] + n, T = p[g++] + r, n += p[g++], r += p[g++], f = s.Q, t.addData(f, w, T, n, r);
					break;
				case "T":
					_ = n, v = r, E = t.len(), D = t.data, o === s.Q && (_ += n - D[E - 4], v += r - D[E - 3]), n = p[g++], r = p[g++], f = s.Q, t.addData(f, _, v, n, r);
					break;
				case "t":
					_ = n, v = r, E = t.len(), D = t.data, o === s.Q && (_ += n - D[E - 4], v += r - D[E - 3]), n += p[g++], r += p[g++], f = s.Q, t.addData(f, _, v, n, r);
					break;
				case "A":
					y = p[g++], b = p[g++], x = p[g++], S = p[g++], C = p[g++], w = n, T = r, n = p[g++], r = p[g++], f = s.A, af(w, T, n, r, S, C, y, b, x, f, t);
					break;
				case "a": y = p[g++], b = p[g++], x = p[g++], S = p[g++], C = p[g++], w = n, T = r, n += p[g++], r += p[g++], f = s.A, af(w, T, n, r, S, C, y, b, x, f, t);
			}
		}
		(d === "z" || d === "Z") && (f = s.Z, t.addData(f), n = i, r = a), o = f;
	}
	return t.toStatic(), t;
}
function sf(e) {
	return e.setData != null;
}
function cf(e, t) {
	var n = of(e), r = L({}, t);
	return r.buildPath = function(e) {
		var t = sf(e);
		if (t && e.canSave()) {
			e.appendPath(n);
			var r = e.getContext();
			r && e.rebuildPath(r, 1);
		} else {
			var r = t ? e.getContext() : e;
			r && n.rebuildPath(r, 1);
		}
	}, r.applyTransform = function(e) {
		Yd(n, e), this.dirtyShape();
	}, r;
}
function lf(e, t) {
	return new vf(cf(e, t));
}
function uf(e, t) {
	var n = cf(e, t);
	return function(e) {
		P(t, e);
		function t(t) {
			var r = e.call(this, t) || this;
			return r.applyTransform = n.applyTransform, r.buildPath = n.buildPath, r;
		}
		return t;
	}(vf);
}
function df(e, t) {
	for (var n = [], r = e.length, i = 0; i < r; i++) {
		var a = e[i];
		n.push(a.getUpdatedPathProxy(!0));
	}
	var o = new Zs(t);
	return o.createPathProxy(), o.buildPath = function(e) {
		if (sf(e)) {
			e.appendPath(n);
			var t = e.getContext();
			t && e.rebuildPath(t, 1);
		}
	}, o;
}
var ff, pf, mf, hf, gf, _f, vf, yf = M((() => {
	F(), Qs(), ys(), ef(), q(), ff = Math.sqrt, pf = Math.sin, mf = Math.cos, hf = Math.PI, gf = /([mlvhzcqtsa])([^mlvhzcqtsa]*)/gi, _f = /-?([0-9]*\.)?[0-9]+([eE]-?[0-9]+)?/g, vf = function(e) {
		P(t, e);
		function t() {
			return e !== null && e.apply(this, arguments) || this;
		}
		return t.prototype.applyTransform = function(e) {}, t;
	}(Zs);
})), bf, xf = M((() => {
	F(), q(), Oo(), Dr(), bf = function(e) {
		P(t, e);
		function t(t) {
			var n = e.call(this) || this;
			return n.isGroup = !0, n._children = [], n.attr(t), n;
		}
		return t.prototype.childrenRef = function() {
			return this._children;
		}, t.prototype.children = function() {
			return this._children.slice();
		}, t.prototype.childAt = function(e) {
			return this._children[e];
		}, t.prototype.childOfName = function(e) {
			for (var t = this._children, n = 0; n < t.length; n++) if (t[n].name === e) return t[n];
		}, t.prototype.childCount = function() {
			return this._children.length;
		}, t.prototype.add = function(e) {
			return e && e !== this && e.parent !== this && (this._children.push(e), this._doAdd(e)), this;
		}, t.prototype.addBefore = function(e, t) {
			if (e && e !== this && e.parent !== this && t && t.parent === this) {
				var n = this._children, r = n.indexOf(t);
				r >= 0 && (n.splice(r, 0, e), this._doAdd(e));
			}
			return this;
		}, t.prototype.replace = function(e, t) {
			var n = R(this._children, e);
			return n >= 0 && this.replaceAt(t, n), this;
		}, t.prototype.replaceAt = function(e, t) {
			var n = this._children, r = n[t];
			if (e && e !== this && e.parent !== this && e !== r) {
				n[t] = e, r.parent = null;
				var i = this.__zr;
				i && r.removeSelfFromZr(i), this._doAdd(e);
			}
			return this;
		}, t.prototype._doAdd = function(e) {
			e.parent && e.parent.remove(e), e.parent = this;
			var t = this.__zr;
			t && t !== e.__zr && e.addSelfToZr(t), t && t.refresh();
		}, t.prototype.remove = function(e) {
			var t = this.__zr, n = this._children, r = R(n, e);
			return r < 0 ? this : (n.splice(r, 1), e.parent = null, t && e.removeSelfFromZr(t), t && t.refresh(), this);
		}, t.prototype.removeAll = function() {
			for (var e = this._children, t = this.__zr, n = 0; n < e.length; n++) {
				var r = e[n];
				t && r.removeSelfFromZr(t), r.parent = null;
			}
			return e.length = 0, this;
		}, t.prototype.eachChild = function(e, t) {
			for (var n = this._children, r = 0; r < n.length; r++) {
				var i = n[r];
				e.call(t, i, r);
			}
			return this;
		}, t.prototype.traverse = function(e, t) {
			for (var n = 0; n < this._children.length; n++) {
				var r = this._children[n], i = e.call(t, r);
				r.isGroup && !i && r.traverse(e, t);
			}
			return this;
		}, t.prototype.addSelfToZr = function(t) {
			e.prototype.addSelfToZr.call(this, t);
			for (var n = 0; n < this._children.length; n++) this._children[n].addSelfToZr(t);
		}, t.prototype.removeSelfFromZr = function(t) {
			e.prototype.removeSelfFromZr.call(this, t);
			for (var n = 0; n < this._children.length; n++) this._children[n].removeSelfFromZr(t);
		}, t.prototype.getBoundingRect = function(e) {
			for (var t = new Y(0, 0, 0, 0), n = e || this._children, r = [], i = null, a = 0; a < n.length; a++) {
				var o = n[a];
				if (!(o.ignore || o.invisible)) {
					var s = o.getBoundingRect(), c = o.getLocalTransform(r);
					c ? (Y.applyTransform(t, s, c), i ||= t.clone(), i.union(t)) : (i ||= s.clone(), i.union(s));
				}
			}
			return i || t;
		}, t;
	}(Do), bf.prototype.type = "group";
})), Sf, Cf, wf = M((() => {
	F(), Qs(), Sf = function() {
		function e() {
			this.cx = 0, this.cy = 0, this.r = 0;
		}
		return e;
	}(), Cf = function(e) {
		P(t, e);
		function t(t) {
			return e.call(this, t) || this;
		}
		return t.prototype.getDefaultShape = function() {
			return new Sf();
		}, t.prototype.buildPath = function(e, t) {
			e.moveTo(t.cx + t.r, t.cy), e.arc(t.cx, t.cy, t.r, 0, Math.PI * 2);
		}, t;
	}(Zs), Cf.prototype.type = "circle";
})), Tf, Ef, Df = M((() => {
	F(), Qs(), Tf = function() {
		function e() {
			this.cx = 0, this.cy = 0, this.rx = 0, this.ry = 0;
		}
		return e;
	}(), Ef = function(e) {
		P(t, e);
		function t(t) {
			return e.call(this, t) || this;
		}
		return t.prototype.getDefaultShape = function() {
			return new Tf();
		}, t.prototype.buildPath = function(e, t) {
			var n = .5522848, r = t.cx, i = t.cy, a = t.rx, o = t.ry, s = a * n, c = o * n;
			e.moveTo(r - a, i), e.bezierCurveTo(r - a, i - c, r - s, i - o, r, i - o), e.bezierCurveTo(r + s, i - o, r + a, i - c, r + a, i), e.bezierCurveTo(r + a, i + c, r + s, i + o, r, i + o), e.bezierCurveTo(r - s, i + o, r - a, i + c, r - a, i), e.closePath();
		}, t;
	}(Zs), Ef.prototype.type = "ellipse";
}));
//#endregion
//#region node_modules/zrender/lib/graphic/helper/roundSector.js
function Of(e, t, n, r, i, a, o, s) {
	var c = n - e, l = r - t, u = o - i, d = s - a, f = d * c - u * l;
	if (!(f * f < Hf)) return f = (u * (t - a) - d * (e - i)) / f, [e + f * c, t + f * l];
}
function kf(e, t, n, r, i, a, o) {
	var s = e - n, c = t - r, l = (o ? a : -a) / zf(s * s + c * c), u = l * c, d = -l * s, f = e + u, p = t + d, m = n + u, h = r + d, g = (f + m) / 2, _ = (p + h) / 2, v = m - f, y = h - p, b = v * v + y * y, x = i - a, S = f * h - m * p, C = (y < 0 ? -1 : 1) * zf(Bf(0, x * x * b - S * S)), w = (S * y - v * C) / b, T = (-S * v - y * C) / b, E = (S * y + v * C) / b, D = (-S * v + y * C) / b, O = w - g, k = T - _, A = E - g, j = D - _;
	return O * O + k * k > A * A + j * j && (w = E, T = D), {
		cx: w,
		cy: T,
		x0: -u,
		y0: -d,
		x1: w * (i / x - 1),
		y1: T * (i / x - 1)
	};
}
function Af(e) {
	var t;
	if (V(e)) {
		var n = e.length;
		if (!n) return e;
		t = n === 1 ? [
			e[0],
			e[0],
			0,
			0
		] : n === 2 ? [
			e[0],
			e[0],
			e[1],
			e[1]
		] : n === 3 ? e.concat(e[2]) : e;
	} else t = [
		e,
		e,
		e,
		e
	];
	return t;
}
function jf(e, t) {
	var n, r = Bf(t.r, 0), i = Bf(t.r0 || 0, 0), a = r > 0;
	if (a || i > 0) {
		if (a || (r = i, i = 0), i > r) {
			var o = r;
			r = i, i = o;
		}
		var s = t.startAngle, c = t.endAngle;
		if (!(isNaN(s) || isNaN(c))) {
			var l = t.cx, u = t.cy, d = !!t.clockwise, f = Rf(c - s), p = f > Nf && f % Nf;
			if (p > Hf && (f = p), !(r > Hf)) e.moveTo(l, u);
			else if (f > Nf - Hf) e.moveTo(l + r * Ff(s), u + r * Pf(s)), e.arc(l, u, r, s, c, !d), i > Hf && (e.moveTo(l + i * Ff(c), u + i * Pf(c)), e.arc(l, u, i, c, s, d));
			else {
				var m = void 0, h = void 0, g = void 0, _ = void 0, v = void 0, y = void 0, b = void 0, x = void 0, S = void 0, C = void 0, w = void 0, T = void 0, E = void 0, D = void 0, O = void 0, k = void 0, A = r * Ff(s), j = r * Pf(s), ee = i * Ff(c), te = i * Pf(c), ne = f > Hf;
				if (ne) {
					var re = t.cornerRadius;
					re && (n = Af(re), m = n[0], h = n[1], g = n[2], _ = n[3]);
					var ie = Rf(r - i) / 2;
					if (v = Vf(ie, g), y = Vf(ie, _), b = Vf(ie, m), x = Vf(ie, h), w = S = Bf(v, y), T = C = Bf(b, x), (S > Hf || C > Hf) && (E = r * Ff(c), D = r * Pf(c), O = i * Ff(s), k = i * Pf(s), f < Mf)) {
						var ae = Of(A, j, O, k, E, D, ee, te);
						if (ae) {
							var oe = A - ae[0], se = j - ae[1], M = E - ae[0], ce = D - ae[1], le = 1 / Pf(If((oe * M + se * ce) / (zf(oe * oe + se * se) * zf(M * M + ce * ce))) / 2), ue = zf(ae[0] * ae[0] + ae[1] * ae[1]);
							w = Vf(S, (r - ue) / (le + 1)), T = Vf(C, (i - ue) / (le - 1));
						}
					}
				}
				if (!ne) e.moveTo(l + A, u + j);
				else if (w > Hf) {
					var de = Vf(g, w), fe = Vf(_, w), N = kf(O, k, A, j, r, de, d), pe = kf(E, D, ee, te, r, fe, d);
					e.moveTo(l + N.cx + N.x0, u + N.cy + N.y0), w < S && de === fe ? e.arc(l + N.cx, u + N.cy, w, Lf(N.y0, N.x0), Lf(pe.y0, pe.x0), !d) : (de > 0 && e.arc(l + N.cx, u + N.cy, de, Lf(N.y0, N.x0), Lf(N.y1, N.x1), !d), e.arc(l, u, r, Lf(N.cy + N.y1, N.cx + N.x1), Lf(pe.cy + pe.y1, pe.cx + pe.x1), !d), fe > 0 && e.arc(l + pe.cx, u + pe.cy, fe, Lf(pe.y1, pe.x1), Lf(pe.y0, pe.x0), !d));
				} else e.moveTo(l + A, u + j), e.arc(l, u, r, s, c, !d);
				if (!(i > Hf) || !ne) e.lineTo(l + ee, u + te);
				else if (T > Hf) {
					var de = Vf(m, T), fe = Vf(h, T), N = kf(ee, te, E, D, i, -fe, d), pe = kf(A, j, O, k, i, -de, d);
					e.lineTo(l + N.cx + N.x0, u + N.cy + N.y0), T < C && de === fe ? e.arc(l + N.cx, u + N.cy, T, Lf(N.y0, N.x0), Lf(pe.y0, pe.x0), !d) : (fe > 0 && e.arc(l + N.cx, u + N.cy, fe, Lf(N.y0, N.x0), Lf(N.y1, N.x1), !d), e.arc(l, u, i, Lf(N.cy + N.y1, N.cx + N.x1), Lf(pe.cy + pe.y1, pe.cx + pe.x1), d), de > 0 && e.arc(l + pe.cx, u + pe.cy, de, Lf(pe.y1, pe.x1), Lf(pe.y0, pe.x0), !d));
				} else e.lineTo(l + ee, u + te), e.arc(l, u, i, c, s, d);
			}
			e.closePath();
		}
	}
}
var Mf, Nf, Pf, Ff, If, Lf, Rf, zf, Bf, Vf, Hf, Uf = M((() => {
	q(), Mf = Math.PI, Nf = Mf * 2, Pf = Math.sin, Ff = Math.cos, If = Math.acos, Lf = Math.atan2, Rf = Math.abs, zf = Math.sqrt, Bf = Math.max, Vf = Math.min, Hf = 1e-4;
})), Wf, Gf, Kf = M((() => {
	F(), Qs(), Uf(), Wf = function() {
		function e() {
			this.cx = 0, this.cy = 0, this.r0 = 0, this.r = 0, this.startAngle = 0, this.endAngle = Math.PI * 2, this.clockwise = !0, this.cornerRadius = 0;
		}
		return e;
	}(), Gf = function(e) {
		P(t, e);
		function t(t) {
			return e.call(this, t) || this;
		}
		return t.prototype.getDefaultShape = function() {
			return new Wf();
		}, t.prototype.buildPath = function(e, t) {
			jf(e, t);
		}, t.prototype.isZeroArea = function() {
			return this.shape.startAngle === this.shape.endAngle || this.shape.r === this.shape.r0;
		}, t;
	}(Zs), Gf.prototype.type = "sector";
})), qf, Jf, Yf = M((() => {
	F(), Qs(), qf = function() {
		function e() {
			this.cx = 0, this.cy = 0, this.r = 0, this.r0 = 0;
		}
		return e;
	}(), Jf = function(e) {
		P(t, e);
		function t(t) {
			return e.call(this, t) || this;
		}
		return t.prototype.getDefaultShape = function() {
			return new qf();
		}, t.prototype.buildPath = function(e, t) {
			var n = t.cx, r = t.cy, i = Math.PI * 2;
			e.moveTo(n + t.r, r), e.arc(n, r, t.r, 0, i, !1), e.moveTo(n + t.r0, r), e.arc(n, r, t.r0, 0, i, !0);
		}, t;
	}(Zs), Jf.prototype.type = "ring";
}));
//#endregion
//#region node_modules/zrender/lib/graphic/helper/smoothBezier.js
function Xf(e, t, n, r) {
	var i = [], a = [], o = [], s = [], c, l, u, d;
	if (r) {
		u = [Infinity, Infinity], d = [-Infinity, -Infinity];
		for (var f = 0, p = e.length; f < p; f++) $n(u, u, e[f]), er(d, d, e[f]);
		$n(u, u, r[0]), er(d, d, r[1]);
	}
	for (var f = 0, p = e.length; f < p; f++) {
		var m = e[f];
		if (n) c = e[f ? f - 1 : p - 1], l = e[(f + 1) % p];
		else if (f === 0 || f === p - 1) {
			i.push(Hn(e[f]));
			continue;
		} else c = e[f - 1], l = e[f + 1];
		Gn(a, l, c), Jn(a, a, t);
		var h = Xn(m, c), g = Xn(m, l), _ = h + g;
		_ !== 0 && (h /= _, g /= _), Jn(o, a, -h), Jn(s, a, g);
		var v = Wn([], m, o), y = Wn([], m, s);
		r && (er(v, v, u), $n(v, v, d), er(y, y, u), $n(y, y, d)), i.push(v), i.push(y);
	}
	return n && i.push(i.shift()), i;
}
var Zf = M((() => {
	rr();
}));
//#endregion
//#region node_modules/zrender/lib/graphic/helper/poly.js
function Qf(e, t, n) {
	var r = t.smooth, i = t.points;
	if (i && i.length >= 2) {
		if (r) {
			var a = Xf(i, r, n, t.smoothConstraint);
			e.moveTo(i[0][0], i[0][1]);
			for (var o = i.length, s = 0; s < (n ? o : o - 1); s++) {
				var c = a[s * 2], l = a[s * 2 + 1], u = i[(s + 1) % o];
				e.bezierCurveTo(c[0], c[1], l[0], l[1], u[0], u[1]);
			}
		} else {
			e.moveTo(i[0][0], i[0][1]);
			for (var s = 1, d = i.length; s < d; s++) e.lineTo(i[s][0], i[s][1]);
		}
		n && e.closePath();
	}
}
var $f = M((() => {
	Zf();
})), ep, tp, np = M((() => {
	F(), Qs(), $f(), ep = function() {
		function e() {
			this.points = null, this.smooth = 0, this.smoothConstraint = null;
		}
		return e;
	}(), tp = function(e) {
		P(t, e);
		function t(t) {
			return e.call(this, t) || this;
		}
		return t.prototype.getDefaultShape = function() {
			return new ep();
		}, t.prototype.buildPath = function(e, t) {
			Qf(e, t, !0);
		}, t;
	}(Zs), tp.prototype.type = "polygon";
})), rp, ip, ap = M((() => {
	F(), Qs(), $f(), rp = function() {
		function e() {
			this.points = null, this.percent = 1, this.smooth = 0, this.smoothConstraint = null;
		}
		return e;
	}(), ip = function(e) {
		P(t, e);
		function t(t) {
			return e.call(this, t) || this;
		}
		return t.prototype.getDefaultStyle = function() {
			return {
				stroke: "#000",
				fill: null
			};
		}, t.prototype.getDefaultShape = function() {
			return new rp();
		}, t.prototype.buildPath = function(e, t) {
			Qf(e, t, !1);
		}, t;
	}(Zs), ip.prototype.type = "polyline";
})), op, sp, cp, lp = M((() => {
	F(), Qs(), pc(), op = {}, sp = function() {
		function e() {
			this.x1 = 0, this.y1 = 0, this.x2 = 0, this.y2 = 0, this.percent = 1;
		}
		return e;
	}(), cp = function(e) {
		P(t, e);
		function t(t) {
			return e.call(this, t) || this;
		}
		return t.prototype.getDefaultStyle = function() {
			return {
				stroke: "#000",
				fill: null
			};
		}, t.prototype.getDefaultShape = function() {
			return new sp();
		}, t.prototype.buildPath = function(e, t) {
			var n, r, i, a;
			if (this.subPixelOptimize) {
				var o = lc(op, t, this.style);
				n = o.x1, r = o.y1, i = o.x2, a = o.y2;
			} else n = t.x1, r = t.y1, i = t.x2, a = t.y2;
			var s = t.percent;
			s !== 0 && (e.moveTo(n, r), s < 1 && (i = n * (1 - s) + i * s, a = r * (1 - s) + a * s), e.lineTo(i, a));
		}, t.prototype.pointAt = function(e) {
			var t = this.shape;
			return [t.x1 * (1 - e) + t.x2 * e, t.y1 * (1 - e) + t.y2 * e];
		}, t;
	}(Zs), cp.prototype.type = "line";
}));
//#endregion
//#region node_modules/zrender/lib/graphic/shape/BezierCurve.js
function up(e, t, n) {
	var r = e.cpx2, i = e.cpy2;
	return r != null || i != null ? [(n ? ki : Oi)(e.x1, e.cpx1, e.cpx2, e.x2, t), (n ? ki : Oi)(e.y1, e.cpy1, e.cpy2, e.y2, t)] : [(n ? Ii : Fi)(e.x1, e.cpx1, e.x2, t), (n ? Ii : Fi)(e.y1, e.cpy1, e.y2, t)];
}
var dp, fp, pp, mp = M((() => {
	F(), Qs(), rr(), Zi(), dp = [], fp = function() {
		function e() {
			this.x1 = 0, this.y1 = 0, this.x2 = 0, this.y2 = 0, this.cpx1 = 0, this.cpy1 = 0, this.percent = 1;
		}
		return e;
	}(), pp = function(e) {
		P(t, e);
		function t(t) {
			return e.call(this, t) || this;
		}
		return t.prototype.getDefaultStyle = function() {
			return {
				stroke: "#000",
				fill: null
			};
		}, t.prototype.getDefaultShape = function() {
			return new fp();
		}, t.prototype.buildPath = function(e, t) {
			var n = t.x1, r = t.y1, i = t.x2, a = t.y2, o = t.cpx1, s = t.cpy1, c = t.cpx2, l = t.cpy2, u = t.percent;
			u !== 0 && (e.moveTo(n, r), c == null || l == null ? (u < 1 && (zi(n, o, i, u, dp), o = dp[1], i = dp[2], zi(r, s, a, u, dp), s = dp[1], a = dp[2]), e.quadraticCurveTo(o, s, i, a)) : (u < 1 && (Mi(n, o, c, i, u, dp), o = dp[1], c = dp[2], i = dp[3], Mi(r, s, l, a, u, dp), s = dp[1], l = dp[2], a = dp[3]), e.bezierCurveTo(o, s, c, l, i, a)));
		}, t.prototype.pointAt = function(e) {
			return up(this.shape, e, !1);
		}, t.prototype.tangentAt = function(e) {
			var t = up(this.shape, e, !0);
			return Yn(t, t);
		}, t;
	}(Zs), pp.prototype.type = "bezier-curve";
})), hp, gp, _p = M((() => {
	F(), Qs(), hp = function() {
		function e() {
			this.cx = 0, this.cy = 0, this.r = 0, this.startAngle = 0, this.endAngle = Math.PI * 2, this.clockwise = !0;
		}
		return e;
	}(), gp = function(e) {
		P(t, e);
		function t(t) {
			return e.call(this, t) || this;
		}
		return t.prototype.getDefaultStyle = function() {
			return {
				stroke: "#000",
				fill: null
			};
		}, t.prototype.getDefaultShape = function() {
			return new hp();
		}, t.prototype.buildPath = function(e, t) {
			var n = t.cx, r = t.cy, i = Math.max(t.r, 0), a = t.startAngle, o = t.endAngle, s = t.clockwise, c = Math.cos(a), l = Math.sin(a);
			e.moveTo(c * i + n, l * i + r), e.arc(n, r, i, a, o, !s);
		}, t;
	}(Zs), gp.prototype.type = "arc";
})), vp, yp = M((() => {
	F(), Qs(), vp = function(e) {
		P(t, e);
		function t() {
			var t = e !== null && e.apply(this, arguments) || this;
			return t.type = "compound", t;
		}
		return t.prototype._updatePathDirty = function() {
			for (var e = this.shape.paths, t = this.shapeChanged(), n = 0; n < e.length; n++) t ||= e[n].shapeChanged();
			t && this.dirtyShape();
		}, t.prototype.beforeBrush = function() {
			this._updatePathDirty();
			for (var e = this.shape.paths || [], t = this.getGlobalScale(), n = 0; n < e.length; n++) e[n].path || e[n].createPathProxy(), e[n].path.setScale(t[0], t[1], e[n].segmentIgnoreThreshold);
		}, t.prototype.buildPath = function(e, t) {
			for (var n = t.paths || [], r = 0; r < n.length; r++) n[r].buildPath(e, n[r].shape, !0);
		}, t.prototype.afterBrush = function() {
			for (var e = this.shape.paths || [], t = 0; t < e.length; t++) e[t].pathUpdated();
		}, t.prototype.getBoundingRect = function() {
			return this._updatePathDirty.call(this), Zs.prototype.getBoundingRect.call(this);
		}, t;
	}(Zs);
})), bp, xp = M((() => {
	bp = function() {
		function e(e) {
			this.colorStops = e || [];
		}
		return e.prototype.addColorStop = function(e, t) {
			this.colorStops.push({
				offset: e,
				color: t
			});
		}, e;
	}();
})), Sp, Cp = M((() => {
	F(), xp(), Sp = function(e) {
		P(t, e);
		function t(t, n, r, i, a, o) {
			var s = e.call(this, a) || this;
			return s.x = t ?? 0, s.y = n ?? 0, s.x2 = r ?? 1, s.y2 = i ?? 0, s.type = "linear", s.global = o || !1, s;
		}
		return t;
	}(bp);
})), wp, Tp = M((() => {
	F(), xp(), wp = function(e) {
		P(t, e);
		function t(t, n, r, i, a) {
			var o = e.call(this, i) || this;
			return o.x = t ?? .5, o.y = n ?? .5, o.r = r ?? .5, o.type = "radial", o.global = a || !1, o;
		}
		return t;
	}(bp);
})), Ep, Dp, Op, kp, Ap, jp, Mp, Np, Pp, Fp = M((() => {
	ar(), Dr(), Ep = Math.min, Dp = Math.max, Op = Math.abs, kp = [0, 0], Ap = [0, 0], jp = sr(), Mp = jp.minTv, Np = jp.maxTv, Pp = function() {
		function e(e, t) {
			this._corners = [], this._axes = [], this._origin = [0, 0];
			for (var n = 0; n < 4; n++) this._corners[n] = new ir();
			for (var n = 0; n < 2; n++) this._axes[n] = new ir();
			e && this.fromBoundingRect(e, t);
		}
		return e.prototype.fromBoundingRect = function(e, t) {
			var n = this._corners, r = this._axes, i = e.x, a = e.y, o = i + e.width, s = a + e.height;
			if (n[0].set(i, a), n[1].set(o, a), n[2].set(o, s), n[3].set(i, s), t) for (var c = 0; c < 4; c++) n[c].transform(t);
			ir.sub(r[0], n[1], n[0]), ir.sub(r[1], n[3], n[0]), r[0].normalize(), r[1].normalize();
			for (var c = 0; c < 2; c++) this._origin[c] = r[c].dot(n[0]);
		}, e.prototype.intersect = function(e, t, n) {
			var r = !0, i = !t;
			return t && ir.set(t, 0, 0), jp.reset(n, !i), !this._intersectCheckOneSide(this, e, i, 1) && (r = !1, i) || !this._intersectCheckOneSide(e, this, i, -1) && (r = !1, i) || !i && !jp.negativeSize && ir.copy(t, r ? jp.useDir ? jp.dirMinTv : Mp : Np), r;
		}, e.prototype._intersectCheckOneSide = function(e, t, n, r) {
			for (var i = !0, a = 0; a < 2; a++) {
				var o = e._axes[a];
				if (e._getProjMinMaxOnAxis(a, e._corners, kp), e._getProjMinMaxOnAxis(a, t._corners, Ap), jp.negativeSize || kp[1] < Ap[0] || kp[0] > Ap[1]) {
					if (i = !1, jp.negativeSize || n) return i;
					var s = Op(Ap[0] - kp[1]), c = Op(kp[0] - Ap[1]);
					Ep(s, c) > Np.len() && (s < c ? ir.scale(Np, o, -s * r) : ir.scale(Np, o, c * r));
				} else if (!n) {
					var s = Op(Ap[0] - kp[1]), c = Op(kp[0] - Ap[1]);
					(jp.useDir || Ep(s, c) < Mp.len()) && ((s < c || !jp.bidirectional) && (ir.scale(Mp, o, s * r), jp.useDir && jp.calcDirMTV()), (s >= c || !jp.bidirectional) && (ir.scale(Mp, o, -c * r), jp.useDir && jp.calcDirMTV()));
				}
			}
			return i;
		}, e.prototype._getProjMinMaxOnAxis = function(e, t, n) {
			for (var r = this._axes[e], i = this._origin, a = t[0].dot(r) + i[e], o = a, s = a, c = 1; c < t.length; c++) {
				var l = t[c].dot(r) + i[e];
				o = Ep(l, o), s = Dp(l, s);
			}
			n[0] = o + jp.touchThreshold, n[1] = s - jp.touchThreshold, jp.negativeSize = n[1] < n[0];
		}, e;
	}();
})), Ip = M((() => {})), Lp, Rp, zp = M((() => {
	F(), Ro(), Dr(), Ip(), Lp = [], Rp = function(e) {
		P(t, e);
		function t() {
			var t = e !== null && e.apply(this, arguments) || this;
			return t.notClear = !0, t.incremental = 1, t._displayables = [], t._temporaryDisplayables = [], t._cursor = 0, t;
		}
		return t.prototype.traverse = function(e, t) {
			e.call(t, this);
		}, t.prototype.useStyle = function() {
			this.style = {};
		}, t.prototype._useHoverStyle = function() {
			this.__hoverStyle = null;
		}, t.prototype.getCursor = function() {
			return this._cursor;
		}, t.prototype.innerAfterBrush = function() {
			this._cursor = this._displayables.length;
		}, t.prototype.clearDisplaybles = function() {
			this._displayables = [], this._temporaryDisplayables = [], this._cursor = 0, this.markRedraw(), this.notClear = !1;
		}, t.prototype.clearTemporalDisplayables = function() {
			this._temporaryDisplayables = [];
		}, t.prototype.addDisplayable = function(e, t) {
			t ? this._temporaryDisplayables.push(e) : this._displayables.push(e), this.markRedraw();
		}, t.prototype.addDisplayables = function(e, t) {
			t ||= !1;
			for (var n = 0; n < e.length; n++) this.addDisplayable(e[n], t);
		}, t.prototype.getDisplayables = function() {
			return this._displayables;
		}, t.prototype.getTemporalDisplayables = function() {
			return this._temporaryDisplayables;
		}, t.prototype.eachPendingDisplayable = function(e) {
			for (var t = this._cursor; t < this._displayables.length; t++) e && e(this._displayables[t]);
			for (var t = 0; t < this._temporaryDisplayables.length; t++) e && e(this._temporaryDisplayables[t]);
		}, t.prototype.update = function() {
			this.updateTransform();
			for (var e = this._cursor; e < this._displayables.length; e++) {
				var t = this._displayables[e];
				t.parent = this, t.update(), t.parent = null;
			}
			for (var e = 0; e < this._temporaryDisplayables.length; e++) {
				var t = this._temporaryDisplayables[e];
				t.parent = this, t.update(), t.parent = null;
			}
		}, t.prototype.getBoundingRect = function() {
			if (!this._rect) {
				for (var e = new Y(Infinity, Infinity, -Infinity, -Infinity), t = 0; t < this._displayables.length; t++) {
					var n = this._displayables[t], r = n.getBoundingRect().clone();
					n.needLocalTransform() && r.applyTransform(n.getLocalTransform(Lp)), e.union(r);
				}
				this._rect = e;
			}
			return this._rect;
		}, t.prototype.contain = function(e, t) {
			var n = this.transformCoordToLocal(e, t);
			if (this.getBoundingRect().contain(n[0], n[1])) {
				for (var r = 0; r < this._displayables.length; r++) if (this._displayables[r].contain(e, t)) return !0;
			}
			return !1;
		}, t;
	}(Fo);
}));
//#endregion
//#region node_modules/echarts/lib/animation/basicTransition.js
function Bp(e, t, n, r, i) {
	var a;
	if (t && t.ecModel) {
		var o = t.ecModel.getUpdatePayload();
		a = o && o.animation;
	}
	var s = t && t.isAnimationEnabled(), c = e === "update";
	if (s) {
		var l = void 0, u = void 0, d = void 0;
		return r ? (l = G(r.duration, 200), u = G(r.easing, "cubicOut"), d = 0) : (l = t.getShallow(c ? "animationDurationUpdate" : "animationDuration"), u = t.getShallow(c ? "animationEasingUpdate" : "animationEasing"), d = t.getShallow(c ? "animationDelayUpdate" : "animationDelay")), a && (a.duration != null && (l = a.duration), a.easing != null && (u = a.easing), a.delay != null && (d = a.delay)), H(d) && (d = d(n, i)), H(l) && (l = l(n)), {
			duration: l || 0,
			delay: d,
			easing: u
		};
	}
	return null;
}
function Vp(e, t, n, r, i, a, o) {
	var s = !1, c;
	H(i) ? (o = a, a = i, i = null) : W(i) && (a = i.cb, o = i.during, s = i.isFrom, c = i.removeOpt, i = i.dataIndex);
	var l = e === "leave";
	l || t.stopAnimation("leave");
	var u = Bp(e, r, i, l ? c || {} : null, r && r.getAnimationDelayParams ? r.getAnimationDelayParams(t, i) : null);
	if (u && u.duration > 0) {
		var d = u.duration, f = u.delay, p = u.easing, m = {
			duration: d,
			delay: f || 0,
			easing: p,
			done: a,
			force: !!a || !!o,
			setToFinal: !l,
			scope: e,
			during: o
		};
		s ? t.animateFrom(n, m) : t.animateTo(n, m);
	} else t.stopAnimation(), !s && t.attr(n), o && o(1), a && a();
}
function Hp(e, t, n, r, i, a) {
	Vp("update", e, t, n, r, i, a);
}
function Up(e, t, n, r, i, a) {
	Vp("enter", e, t, n, r, i, a);
}
function Wp(e) {
	if (!e.__zr) return !0;
	for (var t = 0; t < e.animators.length; t++) if (e.animators[t].scope === "leave") return !0;
	return !1;
}
function Gp(e, t, n, r, i, a) {
	Wp(e) || Vp("leave", e, t, n, r, i, a);
}
function Kp(e, t, n, r) {
	e.removeTextContent(), e.removeTextGuideLine(), Gp(e, { style: { opacity: 0 } }, t, n, r);
}
function qp(e, t, n) {
	function r() {
		e.parent && e.parent.remove(e);
	}
	e.isGroup ? e.traverse(function(e) {
		e.isGroup || Kp(e, t, n, r);
	}) : Kp(e, t, n, r);
}
function Jp(e) {
	Yp(e).oldStyle = e.style;
}
var Yp, Xp = M((() => {
	q(), Z(), Yp = Yl();
})), Zp = /* @__PURE__ */ ce({
	Arc: () => gp,
	BezierCurve: () => pp,
	BoundingRect: () => Y,
	Circle: () => Cf,
	CompoundPath: () => vp,
	Ellipse: () => Ef,
	Group: () => bf,
	HOVER_LAYER_FOR_INCREMENTAL: () => 2,
	HOVER_LAYER_FROM_THRESHOLD: () => 1,
	HOVER_LAYER_NO: () => 0,
	Image: () => ac,
	IncrementalDisplayable: () => Rp,
	Line: () => cp,
	LinearGradient: () => Sp,
	OrientedBoundingRect: () => Pp,
	Path: () => Zs,
	Point: () => ir,
	Polygon: () => tp,
	Polyline: () => ip,
	RadialGradient: () => wp,
	Rect: () => gc,
	Ring: () => Jf,
	Sector: () => Gf,
	Text: () => Mc,
	WH: () => Rm,
	XY: () => Lm,
	applyTransform: () => lm,
	calcZ2Range: () => Am,
	clipPointsByRect: () => mm,
	clipRectByRect: () => hm,
	createIcon: () => gm,
	decomposeTransform: () => Pm,
	ensureCopyRect: () => Dm,
	ensureCopyTransform: () => Om,
	expandOrShrinkRect: () => xm,
	extendPath: () => $p,
	extendShape: () => Qp,
	getCurrentCanvasPainter: () => Fm,
	getShapeClass: () => tm,
	getTransform: () => cm,
	groupTransition: () => pm,
	initProps: () => Up,
	isBoundingRectAxisAligned: () => Em,
	isElementRemoved: () => Wp,
	lineLineIntersect: () => vm,
	linePolygonIntersect: () => _m,
	makeImage: () => rm,
	makePath: () => nm,
	mergePath: () => Bm,
	payloadDisableAnimation: () => Nm,
	registerShape: () => em,
	removeElement: () => Gp,
	removeElementWithFadeOut: () => qp,
	resizePath: () => am,
	retrieveZInfo: () => km,
	setTooltipConfig: () => Cm,
	subPixelOptimize: () => Vm,
	subPixelOptimizeLine: () => om,
	subPixelOptimizeRect: () => sm,
	transformDirection: () => um,
	traverseElements: () => Tm,
	traverseUpdateZ: () => jm,
	updateProps: () => Hp
});
function Qp(e) {
	return Zs.extend(e);
}
function $p(e, t) {
	return zm(e, t);
}
function em(e, t) {
	Im[e] = t;
}
function tm(e) {
	if (Im.hasOwnProperty(e)) return Im[e];
}
function nm(e, t, n, r) {
	var i = lf(e, t);
	return n && (r === "center" && (n = im(n, i.getBoundingRect())), am(i, n)), i;
}
function rm(e, t, n) {
	var r = new ac({
		style: {
			image: e,
			x: t.x,
			y: t.y,
			width: t.width,
			height: t.height
		},
		onload: function(e) {
			if (n === "center") {
				var i = {
					width: e.width,
					height: e.height
				};
				r.setStyle(im(t, i));
			}
		}
	});
	return r;
}
function im(e, t) {
	var n = t.width / t.height, r = e.height * n, i;
	r <= e.width ? i = e.height : (r = e.width, i = r / n);
	var a = e.x + e.width / 2, o = e.y + e.height / 2;
	return {
		x: a - r / 2,
		y: o - i / 2,
		width: r,
		height: i
	};
}
function am(e, t) {
	if (e.applyTransform) {
		var n = e.getBoundingRect().calculateTransform(t);
		e.applyTransform(n);
	}
}
function om(e, t) {
	return lc(e, e, { lineWidth: t }), e;
}
function sm(e, t) {
	return uc(e, e, t), e;
}
function cm(e, t) {
	for (var n = Nn([]); e && e !== t;) Fn(n, e.getLocalTransform(), n), e = e.parent;
	return n;
}
function lm(e, t, n) {
	return t && !rt(t) && (t = bi.getLocalTransform(t)), n && (t = zn([], t)), Qn([], e, t);
}
function um(e, t, n) {
	var r = t[4] === 0 || t[5] === 0 || t[0] === 0 ? 1 : ul(2 * t[4] / t[0]), i = t[4] === 0 || t[5] === 0 || t[2] === 0 ? 1 : ul(2 * t[4] / t[2]), a = [e === "left" ? -r : e === "right" ? r : 0, e === "top" ? -i : e === "bottom" ? i : 0];
	return a = lm(a, t, n), ul(a[0]) > ul(a[1]) ? a[0] > 0 ? "right" : "left" : a[1] > 0 ? "bottom" : "top";
}
function dm(e) {
	return !e.isGroup;
}
function fm(e) {
	return e.shape != null;
}
function pm(e, t, n) {
	if (!e || !t) return;
	function r(e) {
		var t = {};
		return e.traverse(function(e) {
			dm(e) && e.anid && (t[e.anid] = e);
		}), t;
	}
	function i(e) {
		var t = {
			x: e.x,
			y: e.y,
			rotation: e.rotation
		};
		return fm(e) && (t.shape = I(e.shape)), t;
	}
	var a = r(e);
	t.traverse(function(e) {
		if (dm(e) && e.anid) {
			var t = a[e.anid];
			if (t) {
				var r = i(e);
				e.attr(i(t)), Hp(e, r, n, Tu(e).dataIndex);
			}
		}
	});
}
function mm(e, t) {
	return B(e, function(e) {
		var n = e[0];
		n = ll(n, t.x), n = cl(n, t.x + t.width);
		var r = e[1];
		return r = ll(r, t.y), r = cl(r, t.y + t.height), [n, r];
	});
}
function hm(e, t) {
	var n = ll(e.x, t.x), r = cl(e.x + e.width, t.x + t.width), i = ll(e.y, t.y), a = cl(e.y + e.height, t.y + t.height);
	if (r >= n && a >= i) return {
		x: n,
		y: i,
		width: r - n,
		height: a - i
	};
}
function gm(e, t, n) {
	var r = L({ rectHover: !0 }, t), i = r.style = { strokeNoScale: !0 };
	if (n ||= {
		x: -1,
		y: -1,
		width: 2,
		height: 2
	}, e) return e.indexOf("image://") === 0 ? (i.image = e.slice(8), et(i, n), new ac(r)) : nm(e.replace("path://", ""), r, n, "center");
}
function _m(e, t, n, r, i) {
	for (var a = 0, o = i[i.length - 1]; a < i.length; a++) {
		var s = i[a];
		if (vm(e, t, n, r, s[0], s[1], o[0], o[1])) return !0;
		o = s;
	}
}
function vm(e, t, n, r, i, a, o, s) {
	var c = n - e, l = r - t, u = o - i, d = s - a, f = ym(u, d, c, l);
	if (bm(f)) return !1;
	var p = e - i, m = t - a, h = ym(p, m, c, l) / f;
	if (h < 0 || h > 1) return !1;
	var g = ym(p, m, u, d) / f;
	return !(g < 0 || g > 1);
}
function ym(e, t, n, r) {
	return e * r - n * t;
}
function bm(e) {
	return e <= 1e-6 && e >= -1e-6;
}
function xm(e, t, n, r, i) {
	return t == null ? e : (dt(t) ? Hm[0] = Hm[1] = Hm[2] = Hm[3] = t : (Hm[0] = t[0], Hm[1] = t[1], Hm[2] = t[2], Hm[3] = t[3]), r && (Hm[0] = ll(0, Hm[0]), Hm[1] = ll(0, Hm[1]), Hm[2] = ll(0, Hm[2]), Hm[3] = ll(0, Hm[3])), n && (Hm[0] = -Hm[0], Hm[1] = -Hm[1], Hm[2] = -Hm[2], Hm[3] = -Hm[3]), Sm(e, Hm, "x", "width", 3, 1, i && i[0] || 0), Sm(e, Hm, "y", "height", 0, 2, i && i[1] || 0), e);
}
function Sm(e, t, n, r, i, a, o) {
	var s = t[a] + t[i], c = e[r];
	e[r] += s, o = ll(0, cl(o, c)), e[r] < o ? (e[r] = o, e[n] += t[i] >= 0 ? -t[i] : t[a] >= 0 ? c + t[a] : ul(s) > 1e-8 ? (c - o) * t[i] / s : 0) : e[n] -= t[i];
}
function Cm(e) {
	var t = e.itemTooltipOption, n = e.componentModel, r = e.itemName, i = U(t) ? { formatter: t } : t, a = n.mainType, o = n.componentIndex, s = {
		componentType: a,
		name: r,
		$vars: ["name"]
	};
	s[a + "Index"] = o;
	var c = e.formatterParamsExtra;
	c && z(st(c), function(e) {
		At(s, e) || (s[e] = c[e], s.$vars.push(e));
	});
	var l = Tu(e.el);
	l.componentMainType = a, l.componentIndex = o, l.tooltipConfig = {
		name: r,
		option: et({
			content: r,
			encodeHTMLContent: !0,
			formatterParams: s
		}, i)
	};
}
function wm(e, t) {
	var n;
	e.isGroup && (n = t(e)), n || e.traverse(t);
}
function Tm(e, t) {
	if (e) {
		if (V(e)) for (var n = 0; n < e.length; n++) wm(e[n], t);
		else wm(e, t);
	}
}
function Em(e) {
	return !e || ul(e[1]) < Um && ul(e[2]) < Um || ul(e[0]) < Um && ul(e[3]) < Um;
}
function Dm(e, t) {
	return e ? Y.copy(e, t) : t.clone();
}
function Om(e, t) {
	return t ? Pn(e || Mn(), t) : void 0;
}
function km(e) {
	return {
		z: e.get("z") || 0,
		zlevel: e.get("zlevel") || 0
	};
}
function Am(e) {
	var t = -Infinity, n = Infinity;
	wm(e, function(e) {
		r(e), r(e.getTextContent()), r(e.getTextGuideLine());
	});
	function r(e) {
		if (e && !e.isGroup) {
			var t = e.currentStates;
			if (t.length) for (var n = 0; n < t.length; n++) i(e.states[t[n]]);
			i(e);
		}
	}
	function i(e) {
		if (e) {
			var r = e.z2;
			r > t && (t = r), r < n && (n = r);
		}
	}
	return n > t && (n = t = 0), {
		min: n,
		max: t
	};
}
function jm(e, t, n) {
	Mm(e, t, n, -Infinity);
}
function Mm(e, t, n, r) {
	if (e.ignoreModelZ) return r;
	var i = e.getTextContent(), a = e.getTextGuideLine();
	if (e.isGroup) for (var o = e.childrenRef(), s = 0; s < o.length; s++) r = ll(Mm(o[s], t, n, r), r);
	else e.z = t, e.zlevel = n, r = ll(e.z2 || 0, r);
	if (i && (i.z = t, i.zlevel = n, isFinite(r) && (i.z2 = r + 2)), a) {
		var c = e.textGuideLineConfig;
		a.z = t, a.zlevel = n, isFinite(r) && (a.z2 = r + (c && c.showAbove ? 1 : -1));
	}
	return r;
}
function Nm(e) {
	return e.animation = { duration: 0 }, e;
}
function Pm(e, t) {
	return t ? Pn(Wm.transform, t) : Nn(Wm.transform), Wm.decomposeTransform(), pi(e, Wm), e;
}
function Fm(e) {
	var t = e.getZr().painter;
	return t.getType() === "canvas" ? t : null;
}
var Im, Lm, Rm, zm, Bm, Vm, Hm, Um, Wm, Gm = M((() => {
	yf(), Bn(), rr(), Qs(), Ci(), oc(), xf(), Ic(), wf(), Df(), Kf(), Yf(), np(), ap(), _c(), lp(), mp(), _p(), yp(), Cp(), Tp(), Dr(), Fp(), ar(), zp(), pc(), q(), Du(), Xp(), X(), Im = {}, Lm = ["x", "y"], Rm = ["width", "height"], zm = uf, Bm = df, Vm = dc, Hm = [
		0,
		0,
		0,
		0
	], Um = 1e-5, Wm = new bi(), Wm.transform = Mn(), em("circle", Cf), em("ellipse", Ef), em("sector", Gf), em("ring", Jf), em("polygon", tp), em("polyline", ip), em("rect", gc), em("line", cp), em("bezierCurve", pp), em("arc", gp);
}));
//#endregion
//#region node_modules/echarts/lib/label/labelStyle.js
function Km(e, t) {
	for (var n = 0; n < Rd.length; n++) {
		var r = Rd[n], i = t[r], a = e.ensureState(r);
		a.style = a.style || {}, a.style.text = i;
	}
	var o = e.currentStates.slice();
	e.clearStates(!0), e.setStyle({ text: t.normal }), e.useStates(o, !0);
}
function qm(e, t, n) {
	var r = e.labelFetcher, i = e.labelDataIndex, a = e.labelDimIndex, o = t.normal, s;
	r && (s = r.getFormattedLabel(i, "normal", null, a, o && o.get("formatter"), n == null ? null : { interpolatedValue: n })), s ??= H(e.defaultText) ? e.defaultText(i, e, n) : e.defaultText;
	for (var c = { normal: s }, l = 0; l < Rd.length; l++) {
		var u = Rd[l], d = t[u];
		c[u] = G(r ? r.getFormattedLabel(i, u, null, a, d && d.get("formatter")) : null, s);
	}
	return c;
}
function Jm(e, t, n, r) {
	n ||= nh;
	for (var i = e instanceof Mc, a = !1, o = 0; o < zd.length; o++) {
		var s = t[zd[o]];
		if (s && s.getShallow("show")) {
			a = !0;
			break;
		}
	}
	var c = i ? e : e.getTextContent();
	if (a) {
		i || (c || (c = new Mc(), e.setTextContent(c)), e.stateProxy && (c.stateProxy = e.stateProxy));
		var l = qm(n, t), u = t.normal, d = !!u.getShallow("show"), f = Xm(u, r && r.normal, n, !1, !i);
		f.text = l.normal, i || e.setTextConfig(Zm(u, n, !1));
		for (var o = 0; o < Rd.length; o++) {
			var p = Rd[o], s = t[p];
			if (s) {
				var m = c.ensureState(p), h = !!G(s.getShallow("show"), d);
				if (h !== d && (m.ignore = !h), m.style = Xm(s, r && r[p], n, !0, !i), m.style.text = l[p], !i) {
					var g = e.ensureState(p);
					g.textConfig = Zm(s, n, !0);
				}
			}
		}
		c.silent = !!u.getShallow("silent"), c.style.x != null && (f.x = c.style.x), c.style.y != null && (f.y = c.style.y), c.ignore = !d, c.useStyle(f), c.dirty(), n.enableTextSetter && (oh(c).setLabelText = function(e) {
			var r = qm(n, t, e);
			Km(c, r);
		});
	} else c && (c.ignore = !0);
	e.dirty();
}
function Ym(e, t) {
	t ||= "label";
	for (var n = { normal: e.getModel(t) }, r = 0; r < Rd.length; r++) {
		var i = Rd[r];
		n[i] = e.getModel([i, t]);
	}
	return n;
}
function Xm(e, t, n, r, i) {
	var a = {};
	return Qm(a, e, n, r, i), t && L(a, t), a;
}
function Zm(e, t, n) {
	t ||= {};
	var r = {}, i, a = e.getShallow("rotate"), o = G(e.getShallow("distance"), n ? null : 5), s = e.getShallow("offset");
	return i = e.getShallow("position") || (n ? null : "inside"), i === "outside" && (i = t.defaultOutsidePosition || "top"), i != null && (r.position = i), s != null && (r.offset = s), a != null && (a *= Math.PI / 180, r.rotation = a), o != null && (r.distance = o), r.outsideFill = e.get("color") === "inherit" ? t.inheritColor || null : "auto", t.autoOverflowArea != null && (r.autoOverflowArea = t.autoOverflowArea), t.layoutRect != null && (r.layoutRect = t.layoutRect), r;
}
function Qm(e, t, n, r, i) {
	n ||= nh;
	var a = t.ecModel, o = a && a.option.textStyle, s = $m(t), c;
	if (s) {
		c = {};
		var l = "richInheritPlainLabel", u = G(t.get(l), a ? a.get(l) : void 0);
		for (var d in s) if (s.hasOwnProperty(d)) {
			var f = t.getModel(["rich", d]);
			eh(c[d] = {}, f, o, t, u, n, r, i, !1, !0);
		}
	}
	c && (e.rich = c);
	var p = t.get("overflow");
	p && (e.overflow = p);
	var m = t.get("lineOverflow");
	m && (e.lineOverflow = m);
	var h = e, g = t.get("minMargin");
	if (g != null) g = dt(g) ? g / 2 : 0, h.margin = [
		g,
		g,
		g,
		g
	], h.__marginType = sh.minMargin;
	else {
		var _ = t.get("textMargin");
		_ != null && (h.margin = xt(_), h.__marginType = sh.textMargin);
	}
	eh(e, t, o, null, null, n, r, i, !0, !1);
}
function $m(e) {
	for (var t; e && e !== e.ecModel;) {
		var n = (e.option || nh).rich;
		if (n) {
			t ||= {};
			for (var r = st(n), i = 0; i < r.length; i++) {
				var a = r[i];
				t[a] = 1;
			}
		}
		e = e.parentModel;
	}
	return t;
}
function eh(e, t, n, r, i, a, o, s, c, l) {
	n = !o && n || nh;
	var u = a && a.inheritColor, d = t.getShallow("color"), f = t.getShallow("textBorderColor"), p = G(t.getShallow("opacity"), n.opacity);
	(d === "inherit" || d === "auto") && (d = u || null), (f === "inherit" || f === "auto") && (f = u || null), s || (d ||= n.color, f ||= n.textBorderColor), d != null && (e.fill = d), f != null && (e.stroke = f);
	var m = G(t.getShallow("textBorderWidth"), n.textBorderWidth);
	m != null && (e.lineWidth = m);
	var h = G(t.getShallow("textBorderType"), n.textBorderType);
	h != null && (e.lineDash = h);
	var g = G(t.getShallow("textBorderDashOffset"), n.textBorderDashOffset);
	g != null && (e.lineDashOffset = g), !o && p == null && !l && (p = a && a.defaultOpacity), p != null && (e.opacity = p), !o && !s && e.fill == null && a.inheritColor && (e.fill = a.inheritColor);
	for (var _ = 0; _ < rh.length; _++) {
		var v = rh[_], y = i !== !1 && r ? yt(t.getShallow(v), r.getShallow(v), n[v]) : G(t.getShallow(v), n[v]);
		y != null && (e[v] = y);
	}
	for (var _ = 0; _ < ih.length; _++) {
		var v = ih[_], y = t.getShallow(v);
		y != null && (e[v] = y);
	}
	if (e.verticalAlign == null) {
		var b = t.getShallow("baseline");
		b != null && (e.verticalAlign = b);
	}
	if (!c || !a.disableBox) {
		for (var _ = 0; _ < ah.length; _++) {
			var v = ah[_], y = t.getShallow(v);
			y != null && (e[v] = y);
		}
		var x = t.getShallow("borderType");
		x != null && (e.borderDash = x), (e.backgroundColor === "auto" || e.backgroundColor === "inherit") && u && (e.backgroundColor = u), (e.borderColor === "auto" || e.borderColor === "inherit") && u && (e.borderColor = u);
	}
}
function th(e, t) {
	var n = t && t.getModel("textStyle");
	return Ct([
		e.fontStyle || n && n.getShallow("fontStyle") || "",
		e.fontWeight || n && n.getShallow("fontWeight") || "",
		(e.fontSize || n && n.getShallow("fontSize") || 12) + "px",
		e.fontFamily || n && n.getShallow("fontFamily") || "sans-serif"
	].join(" "));
}
var nh, rh, ih, ah, oh, sh, ch = M((() => {
	Ic(), q(), Jd(), Z(), nh = {}, rh = [
		"fontStyle",
		"fontWeight",
		"fontSize",
		"fontFamily",
		"textShadowColor",
		"textShadowBlur",
		"textShadowOffsetX",
		"textShadowOffsetY"
	], ih = [
		"align",
		"lineHeight",
		"width",
		"height",
		"tag",
		"verticalAlign",
		"ellipsis"
	], ah = [
		"padding",
		"borderWidth",
		"borderRadius",
		"borderDashOffset",
		"backgroundColor",
		"borderColor",
		"shadowColor",
		"shadowBlur",
		"shadowOffsetX",
		"shadowOffsetY"
	], oh = Yl(), sh = {
		minMargin: 1,
		textMargin: 2
	};
})), lh, uh, dh, fh, ph = M((() => {
	ch(), Ic(), lh = ["textStyle", "color"], uh = [
		"fontStyle",
		"fontWeight",
		"fontSize",
		"fontFamily",
		"padding",
		"lineHeight",
		"rich",
		"width",
		"height",
		"overflow"
	], dh = new Mc(), fh = function() {
		function e() {}
		return e.prototype.getTextColor = function(e) {
			var t = this.ecModel;
			return this.getShallow("color") || (!e && t ? t.get(lh) : null);
		}, e.prototype.getFont = function() {
			return th({
				fontStyle: this.getShallow("fontStyle"),
				fontWeight: this.getShallow("fontWeight"),
				fontSize: this.getShallow("fontSize"),
				fontFamily: this.getShallow("fontFamily")
			}, this.ecModel);
		}, e.prototype.getTextRect = function(e) {
			for (var t = {
				text: e,
				verticalAlign: this.getShallow("verticalAlign") || this.getShallow("baseline")
			}, n = 0; n < uh.length; n++) t[uh[n]] = this.getShallow(uh[n]);
			return dh.useStyle(t), dh.update(), dh.getBoundingRect();
		}, e;
	}();
})), mh, hh, gh, _h = M((() => {
	_n(), mh = [
		["lineWidth", "width"],
		["stroke", "color"],
		["opacity"],
		["shadowBlur"],
		["shadowOffsetX"],
		["shadowOffsetY"],
		["shadowColor"],
		["lineDash", "type"],
		["lineDashOffset", "dashOffset"],
		["lineCap", "cap"],
		["lineJoin", "join"],
		["miterLimit"]
	], hh = gn(mh), gh = function() {
		function e() {}
		return e.prototype.getLineStyle = function(e) {
			return hh(this, e);
		}, e;
	}();
})), vh, yh, bh, xh = M((() => {
	_n(), vh = [
		["fill", "color"],
		["stroke", "borderColor"],
		["lineWidth", "borderWidth"],
		["opacity"],
		["shadowBlur"],
		["shadowOffsetX"],
		["shadowOffsetY"],
		["shadowColor"],
		["lineDash", "borderType"],
		["lineDashOffset", "borderDashOffset"],
		["lineCap", "borderCap"],
		["lineJoin", "borderJoin"],
		["miterLimit", "borderMiterLimit"]
	], yh = gn(vh), bh = function() {
		function e() {}
		return e.prototype.getItemStyle = function(e, t) {
			return yh(this, e, t);
		}, e;
	}();
})), Sh, Ch = M((() => {
	$t(), hn(), xn(), ph(), _h(), xh(), q(), Sh = function() {
		function e(e, t, n) {
			this.parentModel = t, this.ecModel = n, this.option = e;
		}
		return e.prototype.init = function(e, t, n) {}, e.prototype.mergeOption = function(e, t) {
			Qe(this.option, e, !0);
		}, e.prototype.get = function(e, t) {
			return e == null ? this.option : this._doGet(this.parsePath(e), !t && this.parentModel);
		}, e.prototype.getShallow = function(e, t) {
			var n = this.option, r = n == null ? n : n[e];
			if (r == null && !t) {
				var i = this.parentModel;
				i && (r = i.getShallow(e));
			}
			return r;
		}, e.prototype.getModel = function(t, n) {
			var r = t != null, i = r ? this.parsePath(t) : null, a = r ? this._doGet(i) : this.option;
			return n ||= this.parentModel && this.parentModel.getModel(this.resolveParentPath(i)), new e(a, n, this.ecModel);
		}, e.prototype.isEmpty = function() {
			return this.option == null;
		}, e.prototype.restoreData = function() {}, e.prototype.clone = function() {
			var e = this.constructor;
			return new e(I(this.option));
		}, e.prototype.parsePath = function(e) {
			return typeof e == "string" ? e.split(".") : e;
		}, e.prototype.resolveParentPath = function(e) {
			return e;
		}, e.prototype.isAnimationEnabled = function() {
			if (!J.node && this.option) {
				if (this.option.animation != null) return !!this.option.animation;
				if (this.parentModel) return this.parentModel.isAnimationEnabled();
			}
		}, e.prototype._doGet = function(e, t) {
			var n = this.option;
			if (!e) return n;
			for (var r = 0; r < e.length && !(e[r] && (n = n && typeof n == "object" ? n[e[r]] : null, n == null)); r++);
			return n == null && t && (n = t._doGet(this.resolveParentPath(e), t.parentModel)), n;
		}, e;
	}(), rn(Sh), sn(Sh), nt(Sh, gh), nt(Sh, bh), nt(Sh, bn), nt(Sh, fh);
}));
//#endregion
//#region node_modules/echarts/lib/data/DataDiffer.js
function wh(e) {
	return e == null ? 0 : e.length || 1;
}
function Th(e) {
	return e;
}
var Eh, Dh = M((() => {
	Eh = function() {
		function e(e, t, n, r, i, a) {
			this._old = e, this._new = t, this._oldKeyGetter = n || Th, this._newKeyGetter = r || Th, this.context = i, this._diffModeMultiple = a === "multiple";
		}
		return e.prototype.add = function(e) {
			return this._add = e, this;
		}, e.prototype.update = function(e) {
			return this._update = e, this;
		}, e.prototype.updateManyToOne = function(e) {
			return this._updateManyToOne = e, this;
		}, e.prototype.updateOneToMany = function(e) {
			return this._updateOneToMany = e, this;
		}, e.prototype.updateManyToMany = function(e) {
			return this._updateManyToMany = e, this;
		}, e.prototype.remove = function(e) {
			return this._remove = e, this;
		}, e.prototype.execute = function() {
			this[this._diffModeMultiple ? "_executeMultiple" : "_executeOneToOne"]();
		}, e.prototype._executeOneToOne = function() {
			var e = this._old, t = this._new, n = {}, r = Array(e.length), i = Array(t.length);
			this._initIndexMap(e, null, r, "_oldKeyGetter"), this._initIndexMap(t, n, i, "_newKeyGetter");
			for (var a = 0; a < e.length; a++) {
				var o = r[a], s = n[o], c = wh(s);
				if (c > 1) {
					var l = s.shift();
					s.length === 1 && (n[o] = s[0]), this._update && this._update(l, a);
				} else c === 1 ? (n[o] = null, this._update && this._update(s, a)) : this._remove && this._remove(a);
			}
			this._performRestAdd(i, n);
		}, e.prototype._executeMultiple = function() {
			var e = this._old, t = this._new, n = {}, r = {}, i = [], a = [];
			this._initIndexMap(e, n, i, "_oldKeyGetter"), this._initIndexMap(t, r, a, "_newKeyGetter");
			for (var o = 0; o < i.length; o++) {
				var s = i[o], c = n[s], l = r[s], u = wh(c), d = wh(l);
				if (u > 1 && d === 1) this._updateManyToOne && this._updateManyToOne(l, c), r[s] = null;
				else if (u === 1 && d > 1) this._updateOneToMany && this._updateOneToMany(l, c), r[s] = null;
				else if (u === 1 && d === 1) this._update && this._update(l, c), r[s] = null;
				else if (u > 1 && d > 1) this._updateManyToMany && this._updateManyToMany(l, c), r[s] = null;
				else if (u > 1) for (var f = 0; f < u; f++) this._remove && this._remove(c[f]);
				else this._remove && this._remove(c);
			}
			this._performRestAdd(a, r);
		}, e.prototype._performRestAdd = function(e, t) {
			for (var n = 0; n < e.length; n++) {
				var r = e[n], i = t[r], a = wh(i);
				if (a > 1) for (var o = 0; o < a; o++) this._add && this._add(i[o]);
				else a === 1 && this._add && this._add(i);
				t[r] = null;
			}
		}, e.prototype._initIndexMap = function(e, t, n, r) {
			for (var i = this._diffModeMultiple, a = 0; a < e.length; a++) {
				var o = "_ec_" + this[r](e[a], a);
				if (i || (n[a] = o), t) {
					var s = t[o], c = wh(s);
					c === 0 ? (t[o] = a, i && n.push(o)) : c === 1 ? t[o] = [s, a] : s.push(a);
				}
			}
		}, e;
	}();
}));
//#endregion
//#region node_modules/echarts/lib/data/helper/sourceHelper.js
function Oh(e) {
	Fh(e).datasetMap = K();
}
function kh(e, t, n) {
	var r = {}, i = Ah(t);
	if (!i || !e) return r;
	var a = [], o = [], s = t.ecModel, c = Fh(s).datasetMap, l = i.uid + "_" + n.seriesLayoutBy, u, d;
	e = e.slice(), z(e, function(t, n) {
		var i = W(t) ? t : e[n] = { name: t };
		i.type === "ordinal" && u == null && (u = n, d = m(i)), r[i.name] = [];
	});
	var f = c.get(l) || c.set(l, {
		categoryWayDim: d,
		valueWayDim: 0
	});
	z(e, function(e, t) {
		var n = e.name, i = m(e);
		if (u == null) {
			var s = f.valueWayDim;
			p(r[n], s, i), p(o, s, i), f.valueWayDim += i;
		} else if (u === t) p(r[n], 0, i), p(a, 0, i);
		else {
			var s = f.categoryWayDim;
			p(r[n], s, i), p(o, s, i), f.categoryWayDim += i;
		}
	});
	function p(e, t, n) {
		for (var r = 0; r < n; r++) e.push(t + r);
	}
	function m(e) {
		var t = e.dimsDef;
		return t ? t.length : 1;
	}
	return a.length && (r.itemName = a), o.length && (r.seriesName = o), r;
}
function Ah(e) {
	if (!e.get("data", !0)) return Ql(e.ecModel, "dataset", {
		index: e.get("datasetIndex", !0),
		id: e.get("datasetId", !0)
	}, Cu).models[0];
}
function jh(e) {
	return !e.get("transform", !0) && !e.get("fromTransformResult", !0) ? [] : Ql(e.ecModel, "dataset", {
		index: e.get("fromDatasetIndex", !0),
		id: e.get("fromDatasetId", !0)
	}, Cu).models;
}
function Mh(e, t) {
	return Nh(e.data, e.sourceFormat, e.seriesLayoutBy, e.dimensionsDefine, e.startIndex, t);
}
function Nh(e, t, n, r, i, a) {
	var o, s = 5;
	if (pt(e)) return Ph.Not;
	var c, l;
	if (r) {
		var u = r[a];
		W(u) ? (c = u.name, l = u.type) : U(u) && (c = u);
	}
	if (l != null) return l === "ordinal" ? Ph.Must : Ph.Not;
	if (t === "arrayRows") {
		var d = e;
		if (n === "row") {
			for (var f = d[a], p = 0; p < (f || []).length && p < s; p++) if ((o = b(f[i + p])) != null) return o;
		} else for (var p = 0; p < d.length && p < s; p++) {
			var m = d[i + p];
			if (m && (o = b(m[a])) != null) return o;
		}
	} else if (t === "objectRows") {
		var h = e;
		if (!c) return Ph.Not;
		for (var p = 0; p < h.length && p < s; p++) {
			var g = h[p];
			if (g && (o = b(g[c])) != null) return o;
		}
	} else if (t === "keyedColumns") {
		var _ = e;
		if (!c) return Ph.Not;
		var f = _[c];
		if (!f || pt(f)) return Ph.Not;
		for (var p = 0; p < f.length && p < s; p++) if ((o = b(f[p])) != null) return o;
	} else if (t === "original") for (var v = e, p = 0; p < v.length && p < s; p++) {
		var g = v[p], y = Ml(g);
		if (!V(y)) return Ph.Not;
		if ((o = b(y[a])) != null) return o;
	}
	function b(e) {
		var t = U(e);
		if (e != null && isFinite(Number(e)) && e !== "") return t ? Ph.Might : Ph.Not;
		if (t && e !== "-") return Ph.Must;
	}
	return Ph.Not;
}
var Ph, Fh, Ih = M((() => {
	Z(), q(), Iu(), Ph = {
		Must: 1,
		Might: 2,
		Not: 3
	}, Fh = Yl();
}));
//#endregion
//#region node_modules/echarts/lib/data/Source.js
function Lh(e) {
	return e instanceof qh;
}
function Rh(e, t, n) {
	n ||= Vh(e);
	var r = t.seriesLayoutBy, i = Hh(e, n, r, t.sourceHeader, t.dimensions);
	return new qh({
		data: e,
		sourceFormat: n,
		seriesLayoutBy: r,
		dimensionsDefine: i.dimensionsDefine,
		startIndex: i.startIndex,
		dimensionsDetectedCount: i.dimensionsDetectedCount,
		metaRawOption: I(t)
	});
}
function zh(e) {
	return new qh({
		data: e,
		sourceFormat: pt(e) ? Nu : ku
	});
}
function Bh(e) {
	return new qh({
		data: e.data,
		sourceFormat: e.sourceFormat,
		seriesLayoutBy: e.seriesLayoutBy,
		dimensionsDefine: I(e.dimensionsDefine),
		startIndex: e.startIndex,
		dimensionsDetectedCount: e.dimensionsDetectedCount
	});
}
function Vh(e) {
	var t = Pu;
	if (pt(e)) t = Nu;
	else if (V(e)) {
		e.length === 0 && (t = Au);
		for (var n = 0, r = e.length; n < r; n++) {
			var i = e[n];
			if (i != null) {
				if (V(i) || pt(i)) {
					t = Au;
					break;
				}
				if (W(i)) {
					t = ju;
					break;
				}
			}
		}
	} else if (W(e)) {
		for (var a in e) if (At(e, a) && rt(e[a])) {
			t = Mu;
			break;
		}
	}
	return t;
}
function Hh(e, t, n, r, i) {
	var a, o;
	if (!e) return {
		dimensionsDefine: Wh(i),
		startIndex: o,
		dimensionsDetectedCount: a
	};
	if (t === "arrayRows") {
		var s = e;
		r === "auto" || r == null ? Gh(function(e) {
			e != null && e !== "-" && (U(e) ? o ??= 1 : o = 0);
		}, n, s, 10) : o = dt(r) ? r : +!!r, !i && o === 1 && (i = [], Gh(function(e, t) {
			i[t] = e == null ? "" : e + "";
		}, n, s, Infinity)), a = i ? i.length : n === "row" ? s.length : s[0] ? s[0].length : null;
	} else if (t === "objectRows") i ||= Uh(e);
	else if (t === "keyedColumns") i || (i = [], z(e, function(e, t) {
		i.push(t);
	}));
	else if (t === "original") {
		var c = Ml(e[0]);
		a = V(c) && c.length || 1;
	}
	return {
		startIndex: o,
		dimensionsDefine: Wh(i),
		dimensionsDetectedCount: a
	};
}
function Uh(e) {
	for (var t = 0, n; t < e.length && !(n = e[t++]););
	if (n) return st(n);
}
function Wh(e) {
	if (e) {
		var t = K();
		return B(e, function(e, n) {
			e = W(e) ? e : { name: e };
			var r = {
				name: e.name,
				displayName: e.displayName,
				type: e.type
			};
			if (r.name == null) return r;
			r.name += "", r.displayName ??= r.name;
			var i = t.get(r.name);
			return i ? r.name += "-" + i.count++ : t.set(r.name, { count: 1 }), r;
		});
	}
}
function Gh(e, t, n, r) {
	if (t === "row") for (var i = 0; i < n.length && i < r; i++) e(n[i] ? n[i][0] : null, i);
	else for (var a = n[0] || [], i = 0; i < a.length && i < r; i++) e(a[i], i);
}
function Kh(e) {
	var t = e.sourceFormat;
	return t === "objectRows" || t === "keyedColumns";
}
var qh, Jh = M((() => {
	q(), Iu(), Z(), Ih(), qh = function() {
		function e(e) {
			this.data = e.data || (e.sourceFormat === "keyedColumns" ? {} : []), this.sourceFormat = e.sourceFormat || "unknown", this.seriesLayoutBy = e.seriesLayoutBy || "column", this.startIndex = e.startIndex || 0, this.dimensionsDetectedCount = e.dimensionsDetectedCount, this.metaRawOption = e.metaRawOption;
			var t = this.dimensionsDefine = e.dimensionsDefine;
			if (t) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				r.type == null && Mh(this, n) === Ph.Must && (r.type = "ordinal");
			}
		}
		return e;
	}();
}));
//#endregion
//#region node_modules/echarts/lib/data/helper/dataProvider.js
function Yh(e, t) {
	return lg[Qh(e, t)];
}
function Xh(e, t) {
	return dg[Qh(e, t)];
}
function Zh(e) {
	return pg[e];
}
function Qh(e, t) {
	return e === "arrayRows" ? e + "_" + t : e;
}
function $h(e, t, n) {
	if (e) {
		var r = e.getRawDataItem(t);
		if (r != null) {
			var i = e.getStore(), a = i.getSource().sourceFormat;
			if (n != null) {
				var o = e.getDimensionIndex(n), s = i.getDimensionProperty(o);
				return Zh(a)(r, o, s);
			}
			var c = r;
			return a === "original" && (c = Ml(r)), c;
		}
	}
}
var eg, tg, ng, rg, ig, ag, og, sg, cg, lg, ug, dg, fg, pg, mg = M((() => {
	q(), Z(), Jh(), Iu(), Ol(), og = function() {
		function e(e, t) {
			var n = Lh(e) ? e : zh(e);
			this._source = n;
			var r = this._data = n.data, i = n.sourceFormat;
			n.seriesLayoutBy, i === "typedArray" && (this._offset = 0, this._dimSize = t, this._data = r), ag(this, r, n);
		}
		return e.prototype.getSource = function() {
			return this._source;
		}, e.prototype.count = function() {
			return 0;
		}, e.prototype.getItem = function(e, t) {}, e.prototype.appendData = function(e) {}, e.prototype.clean = function() {}, e.protoInitialize = function() {
			var t = e.prototype;
			t.pure = !1, t.persistent = !0;
		}(), e.internalField = function() {
			var e;
			ag = function(e, i, a) {
				var o = a.sourceFormat, s = a.seriesLayoutBy, c = a.startIndex, l = a.dimensionsDefine, u = ig[Qh(o, s)];
				if (L(e, u), o === "typedArray") e.getItem = t, e.count = r, e.fillStorage = n;
				else {
					var d = Yh(o, s);
					e.getItem = Gt(d, null, i, c, l);
					var f = Xh(o, s);
					e.count = Gt(f, null, i, c, l);
				}
			};
			var t = function(e, t) {
				e -= this._offset, t ||= [];
				for (var n = this._data, r = this._dimSize, i = r * e, a = 0; a < r; a++) t[a] = n[i + a];
				return t;
			}, n = function(e, t, n, r) {
				for (var i = this._data, a = this._dimSize, o = 0; o < a; o++) {
					for (var s = r[o], c = s[0] == null ? Infinity : s[0], l = s[1] == null ? -Infinity : s[1], u = t - e, d = n[o], f = 0; f < u; f++) {
						var p = i[f * a + o];
						d[e + f] = p, p < c && (c = p), p > l && (l = p);
					}
					s[0] = c, s[1] = l;
				}
			}, r = function() {
				return this._data ? this._data.length / this._dimSize : 0;
			};
			ig = (e = {}, e[Au + "_" + Fu] = {
				pure: !0,
				appendData: i
			}, e[Au + "_row"] = {
				pure: !0,
				appendData: function() {
					throw Error("Do not support appendData when set seriesLayoutBy: \"row\".");
				}
			}, e[ju] = {
				pure: !0,
				appendData: i
			}, e[Mu] = {
				pure: !0,
				appendData: function(e) {
					var t = this._data;
					z(e, function(e, n) {
						for (var r = t[n] || (t[n] = []), i = 0; i < (e || []).length; i++) r.push(e[i]);
					});
				}
			}, e[ku] = { appendData: i }, e[Nu] = {
				persistent: !1,
				pure: !0,
				appendData: function(e) {
					this._data = e;
				},
				clean: function() {
					this._offset += this.count(), this._data = null;
				}
			}, e);
			function i(e) {
				for (var t = 0; t < e.length; t++) this._data.push(e[t]);
			}
		}(), e;
	}(), sg = function(e) {
		V(e) || Cl("series.data or dataset.source must be an array.");
	}, eg = {}, eg[Au + "_" + Fu] = sg, eg[Au + "_row"] = sg, eg[ju] = sg, eg[Mu] = function(e, t) {
		for (var n = 0; n < t.length; n++) t[n].name ?? Cl("dimension name must not be null/undefined.");
	}, eg[ku] = sg, cg = function(e, t, n, r) {
		return e[r];
	}, lg = (tg = {}, tg[Au + "_" + Fu] = function(e, t, n, r) {
		return e[r + t];
	}, tg[Au + "_row"] = function(e, t, n, r, i) {
		r += t;
		for (var a = i || [], o = e, s = 0; s < o.length; s++) {
			var c = o[s];
			a[s] = c ? c[r] : null;
		}
		return a;
	}, tg[ju] = cg, tg[Mu] = function(e, t, n, r, i) {
		for (var a = i || [], o = 0; o < n.length; o++) {
			var s = n[o].name, c = s == null ? null : e[s];
			a[o] = c ? c[r] : null;
		}
		return a;
	}, tg[ku] = cg, tg), ug = function(e, t, n) {
		return e.length;
	}, dg = (ng = {}, ng[Au + "_" + Fu] = function(e, t, n) {
		return Math.max(0, e.length - t);
	}, ng[Au + "_row"] = function(e, t, n) {
		var r = e[0];
		return r ? Math.max(0, r.length - t) : 0;
	}, ng[ju] = ug, ng[Mu] = function(e, t, n) {
		var r = n[0].name, i = r == null ? null : e[r];
		return i ? i.length : 0;
	}, ng[ku] = ug, ng), fg = function(e, t, n) {
		return e[t];
	}, pg = (rg = {}, rg[Au] = fg, rg[ju] = function(e, t, n) {
		return e[n];
	}, rg[Mu] = fg, rg[ku] = function(e, t, n) {
		var r = Ml(e);
		return r instanceof Array ? r[t] : r;
	}, rg[Nu] = fg, rg);
}));
//#endregion
//#region node_modules/echarts/lib/data/helper/dimensionHelper.js
function hg(e, t) {
	var n = {}, r = n.encode = {}, i = K(), a = [], o = [], s = {};
	z(e.dimensions, function(t) {
		var n = e.getDimensionInfo(t), c = n.coordDim;
		if (c) {
			var l = n.coordDimIndex;
			gg(r, c)[l] = t, n.isExtraCoord || (i.set(c, 1), vg(n.type) && (a[0] = t), gg(s, c)[l] = e.getDimensionIndex(n.name)), n.defaultTooltip && o.push(t);
		}
		Ou.each(function(e, t) {
			var i = gg(r, t), a = n.otherDims[t];
			a != null && a !== !1 && (i[a] = n.name);
		});
	});
	var c = [], l = {};
	i.each(function(e, t) {
		var n = r[t];
		l[t] = n[0], c = c.concat(n);
	}), n.dataDimsOnCoord = c, n.dataDimIndicesOnCoord = B(c, function(t) {
		return e.getDimensionInfo(t).storeDimIndex;
	}), n.encodeFirstDimNotExtra = l;
	var u = r.label;
	u && u.length && (a = u.slice());
	var d = r.tooltip;
	return d && d.length ? o = d.slice() : o.length || (o = a.slice()), r.defaultedLabel = a, r.defaultedTooltip = o, n.userOutput = new yg(s, t), n;
}
function gg(e, t) {
	return e.hasOwnProperty(t) || (e[t] = []), e[t];
}
function _g(e) {
	return e === "category" ? "ordinal" : e === "time" ? "time" : "float";
}
function vg(e) {
	return e !== "ordinal" && e !== "time";
}
var yg, bg = M((() => {
	q(), Iu(), yg = function() {
		function e(e, t) {
			this._encode = e, this._schema = t;
		}
		return e.prototype.get = function() {
			return {
				fullDimensions: this._getFullDimensionNames(),
				encode: this._encode
			};
		}, e.prototype._getFullDimensionNames = function() {
			return this._cachedDimNames ||= this._schema ? this._schema.makeOutputDimensionNames() : [], this._cachedDimNames;
		}, e;
	}();
})), xg, Sg = M((() => {
	q(), xg = function() {
		function e(e) {
			this.otherDims = {}, e != null && L(this, e);
		}
		return e;
	}();
}));
//#endregion
//#region node_modules/echarts/lib/data/helper/dataValueHelper.js
function Cg(e, t) {
	var n = t && t.type;
	return n === "ordinal" ? e : (n === "time" && !dt(e) && e != null && e !== "-" && (e = +Xc(e)), e == null || e === "" ? NaN : Number(e));
}
function wg(e) {
	var t = "", n = -Infinity, r = -Infinity, i = Infinity, a = Infinity;
	return e && (e.g != null && (t += "G" + e.g, n = e.g), e.ge != null && (t += "GE" + e.ge, r = e.ge), e.l != null && (t += "L" + e.l, i = e.l), e.le != null && (t += "LE" + e.le, a = e.le)), {
		key: t,
		g: n,
		ge: r,
		l: i,
		le: a
	};
}
function Tg(e, t) {
	return t > e.g && t >= e.ge && t < e.l && t <= e.le;
}
var Eg, Dg, Og = M((() => {
	X(), q(), Ol(), K({
		number: function(e) {
			return parseFloat(e);
		},
		time: function(e) {
			return +Xc(e);
		},
		trim: function(e) {
			return U(e) ? Ct(e) : e;
		}
	}), Eg = {
		lt: function(e, t) {
			return e < t;
		},
		lte: function(e, t) {
			return e <= t;
		},
		gt: function(e, t) {
			return e > t;
		},
		gte: function(e, t) {
			return e >= t;
		}
	}, function() {
		function e(e, t) {
			dt(t) || wl(""), this._opFn = Eg[e], this._rvalFloat = el(t);
		}
		return e.prototype.evaluate = function(e) {
			return dt(e) ? this._opFn(e, this._rvalFloat) : this._opFn(el(e), this._rvalFloat);
		}, e;
	}(), Dg = function() {
		function e(e, t) {
			var n = e === "desc";
			this._resultLT = n ? 1 : -1, t ??= n ? "min" : "max", this._incomparable = t === "min" ? -Infinity : Infinity;
		}
		return e.prototype.evaluate = function(e, t) {
			var n = dt(e) ? e : el(e), r = dt(t) ? t : el(t), i = isNaN(n), a = isNaN(r);
			if (i && (n = this._incomparable), a && (r = this._incomparable), i && a) {
				var o = U(e), s = U(t);
				o && (n = s ? e : 0), s && (r = o ? t : 0);
			}
			return n < r ? this._resultLT : n > r ? -this._resultLT : 0;
		}, e;
	}(), function() {
		function e(e, t) {
			this._rval = t, this._isEQ = e, this._rvalTypeof = typeof t, this._rvalFloat = el(t);
		}
		return e.prototype.evaluate = function(e) {
			var t = e === this._rval;
			if (!t) {
				var n = typeof e;
				n !== this._rvalTypeof && (n === "number" || this._rvalTypeof === "number") && (t = el(e) === this._rvalFloat);
			}
			return this._isEQ ? t : !t;
		}, e;
	}();
}));
//#endregion
//#region node_modules/echarts/lib/data/DataStore.js
function kg(e) {
	return e > 65535 ? Mg : Ng;
}
function Ag(e) {
	var t = e.constructor;
	return t === Array ? e.slice() : new t(e);
}
function jg(e, t, n, r, i) {
	var a = Ig[n || "float"];
	if (i) {
		var o = e[t], s = o && o.length;
		if (s !== r) {
			for (var c = new a(r), l = 0; l < s; l++) c[l] = o[l];
			e[t] = c;
		}
	} else e[t] = new a(r);
}
var Mg, Ng, Pg, Fg, Ig, Lg, Rg, zg = M((() => {
	q(), Iu(), Og(), Jh(), Z(), X(), Mg = typeof Uint32Array > "u" ? Array : Uint32Array, Ng = typeof Uint16Array > "u" ? Array : Uint16Array, Pg = typeof Int32Array > "u" ? Array : Int32Array, Fg = typeof Float64Array > "u" ? Array : Float64Array, Ig = {
		float: Fg,
		int: Pg,
		ordinal: Array,
		number: Array,
		time: Fg
	}, Rg = function() {
		function e() {
			this._chunks = [], this._rawExtent = [], this._extent = [], this._count = 0, this._rawCount = 0, this._calcDimNameToIdx = K();
		}
		return e.prototype.initData = function(e, t, n) {
			this._provider = e, this._chunks = [], this._indices = null, this.getRawIndex = this._getRawIdxIdentity;
			var r = e.getSource(), i = this.defaultDimValueGetter = Lg[r.sourceFormat];
			this._dimValueGetter = n || i, this._rawExtent = [], Kh(r), this._dimensions = B(t, function(e) {
				return {
					type: e.type,
					property: e.property
				};
			}), this._initDataFromProvider(0, e.count());
		}, e.prototype.getProvider = function() {
			return this._provider;
		}, e.prototype.getSource = function() {
			return this._provider.getSource();
		}, e.prototype.ensureCalculationDimension = function(e, t) {
			var n = this._calcDimNameToIdx, r = this._dimensions, i = n.get(e);
			if (i != null) {
				if (r[i].type === t) return i;
			} else i = r.length;
			return r[i] = { type: t }, n.set(e, i), this._chunks[i] = new Ig[t || "float"](this._rawCount), this._rawExtent[i] = iu(), i;
		}, e.prototype.collectOrdinalMeta = function(e, t) {
			var n = this._chunks[e], r = this._dimensions[e], i = this._rawExtent, a = r.ordinalOffset || 0, o = n.length;
			a === 0 && (i[e] = iu());
			for (var s = i[e], c = a; c < o; c++) {
				var l = n[c] = t.parseAndCollect(n[c]);
				isNaN(l) || (s[0] = Math.min(l, s[0]), s[1] = Math.max(l, s[1]));
			}
			r.ordinalMeta = t, r.ordinalOffset = o, r.type = "ordinal";
		}, e.prototype.getOrdinalMeta = function(e) {
			return this._dimensions[e].ordinalMeta;
		}, e.prototype.getDimensionProperty = function(e) {
			var t = this._dimensions[e];
			return t && t.property;
		}, e.prototype.appendData = function(e) {
			var t = this._provider, n = this.count();
			t.appendData(e);
			var r = t.count();
			return t.persistent || (r += n), n < r && this._initDataFromProvider(n, r, !0), [n, r];
		}, e.prototype.appendValues = function(e, t) {
			for (var n = this._chunks, r = this._dimensions, i = r.length, a = this._rawExtent, o = this.count(), s = o + Math.max(e.length, t || 0), c = 0; c < i; c++) {
				var l = r[c];
				jg(n, c, l.type, s, !0);
			}
			for (var u = [], d = o; d < s; d++) for (var f = d - o, p = 0; p < i; p++) {
				var l = r[p], m = Lg.arrayRows.call(this, e[f] || u, l.property, f, p);
				n[p][d] = m;
				var h = a[p];
				m < h[0] && (h[0] = m), m > h[1] && (h[1] = m);
			}
			return this._rawCount = this._count = s, {
				start: o,
				end: s
			};
		}, e.prototype._initDataFromProvider = function(e, t, n) {
			for (var r = this._provider, i = this._chunks, a = this._dimensions, o = a.length, s = this._rawExtent, c = B(a, function(e) {
				return e.property;
			}), l = 0; l < o; l++) {
				var u = a[l];
				s[l] || (s[l] = iu()), jg(i, l, u.type, t, n);
			}
			if (r.fillStorage) r.fillStorage(e, t, i, s);
			else for (var d = [], f = e; f < t; f++) {
				d = r.getItem(f, d);
				for (var p = 0; p < o; p++) {
					var m = i[p], h = this._dimValueGetter(d, c[p], f, p);
					m[f] = h;
					var g = s[p];
					h < g[0] && (g[0] = h), h > g[1] && (g[1] = h);
				}
			}
			!r.persistent && r.clean && r.clean(), this._rawCount = this._count = t, this._extent = [];
		}, e.prototype.count = function() {
			return this._count;
		}, e.prototype.get = function(e, t) {
			if (!(t >= 0 && t < this._count)) return NaN;
			var n = this._chunks[e];
			return n ? n[this.getRawIndex(t)] : NaN;
		}, e.prototype.getValues = function(e, t) {
			var n = [], r = [];
			if (t == null) {
				t = e, e = [];
				for (var i = 0; i < this._dimensions.length; i++) r.push(i);
			} else r = e;
			for (var i = 0, a = r.length; i < a; i++) n.push(this.get(r[i], t));
			return n;
		}, e.prototype.getByRawIndex = function(e, t) {
			if (!(t >= 0 && t < this._rawCount)) return NaN;
			var n = this._chunks[e];
			return n ? n[t] : NaN;
		}, e.prototype.getSum = function(e) {
			var t = this._chunks[e], n = 0;
			if (t) for (var r = 0, i = this.count(); r < i; r++) {
				var a = this.get(e, r);
				isNaN(a) || (n += a);
			}
			return n;
		}, e.prototype.getMedian = function(e) {
			var t = [];
			this.each([e], function(e) {
				isNaN(e) || t.push(e);
			}), Uc(t);
			var n = this.count();
			return n === 0 ? 0 : n % 2 == 1 ? t[(n - 1) / 2] : (t[n / 2] + t[n / 2 - 1]) / 2;
		}, e.prototype.indexOfRawIndex = function(e) {
			if (e >= this._rawCount || e < 0) return -1;
			if (!this._indices) return e;
			var t = this._indices, n = t[e];
			if (n != null && n < this._count && n === e) return e;
			for (var r = 0, i = this._count - 1; r <= i;) {
				var a = (r + i) / 2 | 0;
				if (t[a] < e) r = a + 1;
				else if (t[a] > e) i = a - 1;
				else return a;
			}
			return -1;
		}, e.prototype.getIndices = function() {
			var e, t = this._indices;
			if (t) {
				var n = t.constructor, r = this._count;
				if (n === Array) {
					e = new n(r);
					for (var i = 0; i < r; i++) e[i] = t[i];
				} else e = new n(t.buffer, 0, r);
			} else {
				var n = kg(this._rawCount);
				e = new n(this.count());
				for (var i = 0; i < e.length; i++) e[i] = i;
			}
			return e;
		}, e.prototype.filter = function(e, t) {
			if (!this._count) return this;
			for (var n = this.clone(), r = n.count(), i = new (kg(n._rawCount))(r), a = [], o = e.length, s = 0, c = e[0], l = n._chunks, u = 0; u < r; u++) {
				var d = void 0, f = n.getRawIndex(u);
				if (o === 0) d = t(u);
				else if (o === 1) {
					var p = l[c][f];
					d = t(p, u);
				} else {
					for (var m = 0; m < o; m++) a[m] = l[e[m]][f];
					a[m] = u, d = t.apply(null, a);
				}
				d && (i[s++] = f);
			}
			return s < r && (n._indices = i), n._count = s, n._extent = [], n._updateGetRawIdx(), n;
		}, e.prototype.selectRange = function(e) {
			var t = this.clone(), n = t._count;
			if (!n) return this;
			var r = st(e), i = r.length;
			if (!i) return this;
			var a = t.count(), o = new (kg(t._rawCount))(a), s = 0, c = r[0], l = e[c][0], u = e[c][1], d = t._chunks, f = !1;
			if (!t._indices) {
				var p = 0;
				if (i === 1) {
					for (var m = d[r[0]], h = 0; h < n; h++) {
						var g = m[h];
						(g >= l && g <= u || isNaN(g)) && (o[s++] = p), p++;
					}
					f = !0;
				} else if (i === 2) {
					for (var m = d[r[0]], _ = d[r[1]], v = e[r[1]][0], y = e[r[1]][1], h = 0; h < n; h++) {
						var g = m[h], b = _[h];
						(g >= l && g <= u || isNaN(g)) && (b >= v && b <= y || isNaN(b)) && (o[s++] = p), p++;
					}
					f = !0;
				}
			}
			if (!f) {
				if (i === 1) for (var h = 0; h < a; h++) {
					var x = t.getRawIndex(h), g = d[r[0]][x];
					(g >= l && g <= u || isNaN(g)) && (o[s++] = x);
				}
				else for (var h = 0; h < a; h++) {
					for (var S = !0, x = t.getRawIndex(h), C = 0; C < i; C++) {
						var w = r[C], g = d[w][x];
						(g < e[w][0] || g > e[w][1]) && (S = !1);
					}
					S && (o[s++] = t.getRawIndex(h));
				}
			}
			return s < a && (t._indices = o), t._count = s, t._extent = [], t._updateGetRawIdx(), t;
		}, e.prototype.map = function(e, t) {
			var n = this.clone(e);
			return this._updateDims(n, e, t), n;
		}, e.prototype.modify = function(e, t) {
			this._updateDims(this, e, t);
		}, e.prototype._updateDims = function(e, t, n) {
			for (var r = e._chunks, i = [], a = t.length, o = e.count(), s = [], c = e._rawExtent, l = 0; l < t.length; l++) c[t[l]] = iu();
			for (var u = 0; u < o; u++) {
				for (var d = e.getRawIndex(u), f = 0; f < a; f++) s[f] = r[t[f]][d];
				s[a] = u;
				var p = n && n.apply(null, s);
				if (p != null) {
					typeof p != "object" && (i[0] = p, p = i);
					for (var l = 0; l < p.length; l++) {
						var m = t[l], h = p[l], g = c[m], _ = r[m];
						_ && (_[d] = h), h < g[0] && (g[0] = h), h > g[1] && (g[1] = h);
					}
				}
			}
		}, e.prototype.lttbDownSample = function(e, t) {
			var n = this.clone([e], !0), r = n._chunks[e], i = this.count(), a = 0, o = Math.floor(1 / t), s = this.getRawIndex(0), c, l, u, d = new (kg(this._rawCount))(Math.min((Math.ceil(i / o) + 2) * 2, i));
			d[a++] = s;
			for (var f = 1; f < i - 1; f += o) {
				for (var p = Math.min(f + o, i - 1), m = Math.min(f + o * 2, i), h = (m + p) / 2, g = 0, _ = p; _ < m; _++) {
					var v = this.getRawIndex(_), y = r[v];
					isNaN(y) || (g += y);
				}
				g /= m - p;
				var b = f, x = Math.min(f + o, i), S = f - 1, C = r[s];
				c = -1, u = b;
				for (var w = -1, T = 0, _ = b; _ < x; _++) {
					var v = this.getRawIndex(_), y = r[v];
					if (isNaN(y)) {
						T++, w < 0 && (w = v);
						continue;
					}
					l = Math.abs((S - h) * (y - C) - (S - _) * (g - C)), l > c && (c = l, u = v);
				}
				T > 0 && T < x - b && (d[a++] = Math.min(w, u), u = Math.max(w, u)), d[a++] = u, s = u;
			}
			return d[a++] = this.getRawIndex(i - 1), n._count = a, n._indices = d, n.getRawIndex = this._getRawIdx, n;
		}, e.prototype.minmaxDownSample = function(e, t) {
			for (var n = this.clone([e], !0), r = n._chunks, i = Math.floor(1 / t), a = r[e], o = this.count(), s = new (kg(this._rawCount))(Math.ceil(o / i) * 2), c = 0, l = 0; l < o; l += i) {
				var u = l, d = a[this.getRawIndex(u)], f = l, p = a[this.getRawIndex(f)], m = i;
				l + i > o && (m = o - l);
				for (var h = 0; h < m; h++) {
					var g = a[this.getRawIndex(l + h)];
					g < d && (d = g, u = l + h), g > p && (p = g, f = l + h);
				}
				var _ = this.getRawIndex(u), v = this.getRawIndex(f);
				u < f ? (s[c++] = _, s[c++] = v) : (s[c++] = v, s[c++] = _);
			}
			return n._count = c, n._indices = s, n._updateGetRawIdx(), n;
		}, e.prototype.downSample = function(e, t, n, r) {
			for (var i = this.clone([e], !0), a = i._chunks, o = [], s = Math.floor(1 / t), c = a[e], l = this.count(), u = i._rawExtent[e] = iu(), d = new (kg(this._rawCount))(Math.ceil(l / s)), f = 0, p = 0; p < l; p += s) {
				s > l - p && (s = l - p, o.length = s);
				for (var m = 0; m < s; m++) {
					var h = this.getRawIndex(p + m);
					o[m] = c[h];
				}
				var g = n(o), _ = this.getRawIndex(Math.min(p + r(o, g) || 0, l - 1));
				c[_] = g, g < u[0] && (u[0] = g), g > u[1] && (u[1] = g), d[f++] = _;
			}
			return i._count = f, i._indices = d, i._updateGetRawIdx(), i;
		}, e.prototype.each = function(e, t) {
			if (this._count) for (var n = e.length, r = this._chunks, i = 0, a = this.count(); i < a; i++) {
				var o = this.getRawIndex(i);
				switch (n) {
					case 0:
						t(i);
						break;
					case 1:
						t(r[e[0]][o], i);
						break;
					case 2:
						t(r[e[0]][o], r[e[1]][o], i);
						break;
					default:
						for (var s = 0, c = []; s < n; s++) c[s] = r[e[s]][o];
						c[s] = i, t.apply(null, c);
				}
			}
		}, e.prototype.getDataExtent = function(e, t) {
			var n = this._chunks[e], r = iu();
			if (!n) return r;
			var i = this.count();
			if (!this._indices && !t) return this._rawExtent[e].slice();
			var a = this._extent, o = a[e] || (a[e] = {}), s = wg(t), c = s.key, l = o[c];
			if (l) return l.slice();
			for (var u = r[0], d = r[1], f = 0; f < i; f++) {
				var p = n[this.getRawIndex(f)];
				(!t || Tg(s, p)) && (p < u && (u = p), p > d && (d = p));
			}
			return o[c] = [u, d];
		}, e.prototype.getRawDataItem = function(e) {
			var t = this.getRawIndex(e);
			if (this._provider.persistent) return this._provider.getItem(t);
			for (var n = [], r = this._chunks, i = 0; i < r.length; i++) n.push(r[i][t]);
			return n;
		}, e.prototype.clone = function(t, n) {
			var r = new e(), i = this._chunks, a = t && it(t, function(e, t) {
				return e[t] = !0, e;
			}, {});
			if (a) for (var o = 0; o < i.length; o++) r._chunks[o] = a[o] ? Ag(i[o]) : i[o];
			else r._chunks = i;
			return this._copyCommonProps(r), n || (r._indices = this._cloneIndices()), r._updateGetRawIdx(), r;
		}, e.prototype._copyCommonProps = function(e) {
			e._count = this._count, e._rawCount = this._rawCount, e._provider = this._provider, e._dimensions = this._dimensions, e._extent = I(this._extent), e._rawExtent = I(this._rawExtent);
		}, e.prototype._cloneIndices = function() {
			if (this._indices) {
				var e = this._indices.constructor, t = void 0;
				if (e === Array) {
					var n = this._indices.length;
					t = new e(n);
					for (var r = 0; r < n; r++) t[r] = this._indices[r];
				} else t = new e(this._indices);
				return t;
			}
			return null;
		}, e.prototype._getRawIdxIdentity = function(e) {
			return e;
		}, e.prototype._getRawIdx = function(e) {
			return e < this._count && e >= 0 ? this._indices[e] : -1;
		}, e.prototype._updateGetRawIdx = function() {
			this.getRawIndex = this._indices ? this._getRawIdx : this._getRawIdxIdentity;
		}, e.internalField = function() {
			function e(e, t, n, r) {
				return Cg(e[r], this._dimensions[r]);
			}
			Lg = {
				arrayRows: e,
				objectRows: function(e, t, n, r) {
					return Cg(e[t], this._dimensions[r]);
				},
				keyedColumns: e,
				original: function(e, t, n, r) {
					var i = e && (e.value == null ? e : e.value);
					return Cg(i instanceof Array ? i[r] : i, this._dimensions[r]);
				},
				typedArray: function(e, t, n, r) {
					return e[r];
				}
			};
		}(), e;
	}();
}));
//#endregion
//#region node_modules/echarts/lib/data/helper/SeriesDataSchema.js
function Bg(e) {
	return e instanceof Kg;
}
function Vg(e) {
	for (var t = K(), n = 0; n < (e || []).length; n++) {
		var r = e[n], i = W(r) ? r.name : r;
		i != null && t.get(i) == null && t.set(i, n);
	}
	return t;
}
function Hg(e) {
	var t = Wg(e);
	return t.dimNameMap ||= Vg(e.dimensionsDefine);
}
function Ug(e) {
	return e > 30;
}
var Wg, Gg, Kg, qg = M((() => {
	q(), Z(), Jh(), Wg = Yl(), Gg = {
		float: "f",
		int: "i",
		ordinal: "o",
		number: "n",
		time: "t"
	}, Kg = function() {
		function e(e) {
			this.dimensions = e.dimensions, this._dimOmitted = e.dimensionOmitted, this.source = e.source, this._fullDimCount = e.fullDimensionCount, this._updateDimOmitted(e.dimensionOmitted);
		}
		return e.prototype.isDimensionOmitted = function() {
			return this._dimOmitted;
		}, e.prototype._updateDimOmitted = function(e) {
			this._dimOmitted = e, e && (this._dimNameMap ||= Hg(this.source));
		}, e.prototype.getSourceDimensionIndex = function(e) {
			return G(this._dimNameMap.get(e), -1);
		}, e.prototype.getSourceDimension = function(e) {
			var t = this.source.dimensionsDefine;
			if (t) return t[e];
		}, e.prototype.makeStoreSchema = function() {
			for (var e = this._fullDimCount, t = Kh(this.source), n = !Ug(e), r = "", i = [], a = 0, o = 0; a < e; a++) {
				var s = void 0, c = void 0, l = void 0, u = this.dimensions[o];
				if (u && u.storeDimIndex === a) s = t ? u.name : null, c = u.type, l = u.ordinalMeta, o++;
				else {
					var d = this.getSourceDimension(a);
					d && (s = t ? d.name : null, c = d.type);
				}
				i.push({
					property: s,
					type: c,
					ordinalMeta: l
				}), t && s != null && (!u || !u.isCalculationCoord) && (r += n ? s.replace(/\`/g, "`1").replace(/\$/g, "`2") : s), r += "$", r += Gg[c] || "f", l && (r += l.uid), r += "$";
			}
			var f = this.source;
			return {
				dimensions: i,
				hash: [
					f.seriesLayoutBy,
					f.startIndex,
					r
				].join("$$")
			};
		}, e.prototype.makeOutputDimensionNames = function() {
			for (var e = [], t = 0, n = 0; t < this._fullDimCount; t++) {
				var r = void 0, i = this.dimensions[n];
				if (i && i.storeDimIndex === t) i.isCalculationCoord || (r = i.name), n++;
				else {
					var a = this.getSourceDimension(t);
					a && (r = a.name);
				}
				e.push(r);
			}
			return e;
		}, e.prototype.appendCalculationDimension = function(e) {
			this.dimensions.push(e), e.isCalculationCoord = !0, this._fullDimCount++, this._updateDimOmitted(!0);
		}, e;
	}();
})), Jg, Yg, Xg, Zg, Qg, $g, e_, t_, n_, r_, i_, a_, o_, s_, c_, l_ = M((() => {
	q(), Ch(), Dh(), mg(), bg(), Sg(), Iu(), Z(), Du(), Jh(), zg(), qg(), Jg = W, Yg = B, Xg = typeof Int32Array > "u" ? Array : Int32Array, Zg = "e\0\0", Qg = -1, $g = [
		"hasItemOption",
		"_nameList",
		"_idList",
		"_invertedIndicesMap",
		"_dimSummary",
		"userOutput",
		"_rawData",
		"_dimValueGetter",
		"_nameDimIdx",
		"_idDimIdx",
		"_nameRepeatCount"
	], e_ = ["_approximateExtent"], c_ = function() {
		function e(e, t) {
			this.type = "list", this._dimOmitted = !1, this._nameList = [], this._idList = [], this._visual = {}, this._layout = {}, this._itemVisuals = [], this._itemLayouts = [], this._graphicEls = [], this._approximateExtent = {}, this._calculationInfo = {}, this.hasItemOption = !1, this.TRANSFERABLE_METHODS = [
				"cloneShallow",
				"downSample",
				"minmaxDownSample",
				"lttbDownSample",
				"map"
			], this.CHANGABLE_METHODS = ["filterSelf", "selectRange"], this.DOWNSAMPLE_METHODS = [
				"downSample",
				"minmaxDownSample",
				"lttbDownSample"
			];
			var n, r = !1;
			Bg(e) ? (n = e.dimensions, this._dimOmitted = e.isDimensionOmitted(), this._schema = e) : (r = !0, n = e), n ||= ["x", "y"];
			for (var i = {}, a = [], o = {}, s = !1, c = {}, l = 0; l < n.length; l++) {
				var u = n[l], d = U(u) ? new xg({ name: u }) : u instanceof xg ? u : new xg(u), f = d.name;
				d.type = d.type || "float", d.coordDim || (d.coordDim = f, d.coordDimIndex = 0);
				var p = d.otherDims = d.otherDims || {};
				a.push(f), i[f] = d, c[f] != null && (s = !0), d.createInvertedIndices && (o[f] = []), r && (d.storeDimIndex = l), p.itemName === 0 && (this._nameDimIdx = d.storeDimIndex), p.itemId === 0 && (this._idDimIdx = d.storeDimIndex);
			}
			if (this.dimensions = a, this._dimInfos = i, this._initGetDimensionInfo(s), this.hostModel = t, this._invertedIndicesMap = o, this._dimOmitted) {
				var m = this._dimIdxToName = K();
				z(a, function(e) {
					m.set(i[e].storeDimIndex, e);
				});
			}
		}
		return e.prototype.getDimension = function(e) {
			var t = this._recognizeDimIndex(e);
			if (t == null) return e;
			if (t = e, !this._dimOmitted) return this.dimensions[t];
			var n = this._dimIdxToName.get(t);
			if (n != null) return n;
			var r = this._schema.getSourceDimension(t);
			if (r) return r.name;
		}, e.prototype.getDimensionIndex = function(e) {
			var t = this._recognizeDimIndex(e);
			if (t != null) return t;
			if (e == null) return -1;
			var n = this._getDimInfo(e);
			return n ? n.storeDimIndex : this._dimOmitted ? this._schema.getSourceDimensionIndex(e) : -1;
		}, e.prototype._recognizeDimIndex = function(e) {
			if (dt(e) || e != null && !isNaN(e) && !this._getDimInfo(e) && (!this._dimOmitted || this._schema.getSourceDimensionIndex(e) < 0)) return +e;
		}, e.prototype._getStoreDimIndex = function(e) {
			return this.getDimensionIndex(e);
		}, e.prototype.getDimensionInfo = function(e) {
			return this._getDimInfo(this.getDimension(e));
		}, e.prototype._initGetDimensionInfo = function(e) {
			var t = this._dimInfos;
			this._getDimInfo = e ? function(e) {
				return t.hasOwnProperty(e) ? t[e] : void 0;
			} : function(e) {
				return t[e];
			};
		}, e.prototype.getDimensionsOnCoord = function() {
			return this._dimSummary.dataDimsOnCoord.slice();
		}, e.prototype.mapDimension = function(e, t) {
			var n = this._dimSummary;
			if (t == null) return n.encodeFirstDimNotExtra[e];
			var r = n.encode[e];
			return r ? r[t] : null;
		}, e.prototype.mapDimensionsAll = function(e) {
			return (this._dimSummary.encode[e] || []).slice();
		}, e.prototype.getStore = function() {
			return this._store;
		}, e.prototype.initData = function(e, t, n) {
			var r = this, i;
			if (e instanceof Rg && (i = e), !i) {
				var a = this.dimensions, o = Lh(e) || rt(e) ? new og(e, a.length) : e;
				i = new Rg();
				var s = Yg(a, function(e) {
					return {
						type: r._dimInfos[e].type,
						property: e
					};
				});
				i.initData(o, s, n);
			}
			this._store = i, this._nameList = (t || []).slice(), this._idList = [], this._nameRepeatCount = {}, this._doInit(0, i.count()), this._dimSummary = hg(this, this._schema), this.userOutput = this._dimSummary.userOutput;
		}, e.prototype.appendData = function(e) {
			var t = this._store.appendData(e);
			this._doInit(t[0], t[1]);
		}, e.prototype.appendValues = function(e, t) {
			var n = this._store.appendValues(e, t && t.length), r = n.start, i = n.end, a = this._shouldMakeIdFromName();
			if (this._updateOrdinalMeta(), t) for (var o = r; o < i; o++) {
				var s = o - r;
				this._nameList[o] = t[s], a && s_(this, o);
			}
		}, e.prototype._updateOrdinalMeta = function() {
			for (var e = this._store, t = this.dimensions, n = 0; n < t.length; n++) {
				var r = this._dimInfos[t[n]];
				r.ordinalMeta && e.collectOrdinalMeta(r.storeDimIndex, r.ordinalMeta);
			}
		}, e.prototype._shouldMakeIdFromName = function() {
			var e = this._store.getProvider();
			return this._idDimIdx == null && e.getSource().sourceFormat !== "typedArray" && !e.fillStorage;
		}, e.prototype._doInit = function(e, t) {
			if (!(e >= t)) {
				var n = this._store.getProvider();
				this._updateOrdinalMeta();
				var r = this._nameList, i = this._idList;
				if (n.getSource().sourceFormat === "original" && !n.pure) for (var a = [], o = e; o < t; o++) {
					var s = n.getItem(o, a);
					if (!this.hasItemOption && Nl(s) && (this.hasItemOption = !0), s) {
						var c = s.name;
						r[o] == null && c != null && (r[o] = Ul(c, null));
						var l = s.id;
						i[o] == null && l != null && (i[o] = Ul(l, null));
					}
				}
				if (this._shouldMakeIdFromName()) for (var o = e; o < t; o++) s_(this, o);
				t_(this);
			}
		}, e.prototype.getApproximateExtent = function(e, t) {
			return this._approximateExtent[e] || this._store.getDataExtent(this._getStoreDimIndex(e), t);
		}, e.prototype.setApproximateExtent = function(e, t) {
			t = this.getDimension(t), this._approximateExtent[t] = e.slice();
		}, e.prototype.getCalculationInfo = function(e) {
			return this._calculationInfo[e];
		}, e.prototype.setCalculationInfo = function(e, t) {
			Jg(e) ? L(this._calculationInfo, e) : this._calculationInfo[e] = t;
		}, e.prototype.getName = function(e) {
			var t = this.getRawIndex(e), n = this._nameList[t];
			return n == null && this._nameDimIdx != null && (n = r_(this, this._nameDimIdx, t)), n ??= "", n;
		}, e.prototype._getCategory = function(e, t) {
			var n = this._store.get(e, t), r = this._store.getOrdinalMeta(e);
			return r ? r.categories[n] : n;
		}, e.prototype.getId = function(e) {
			return n_(this, this.getRawIndex(e));
		}, e.prototype.count = function() {
			return this._store.count();
		}, e.prototype.get = function(e, t) {
			var n = this._store, r = this._dimInfos[e];
			if (r) return n.get(r.storeDimIndex, t);
		}, e.prototype.getByRawIndex = function(e, t) {
			var n = this._store, r = this._dimInfos[e];
			if (r) return n.getByRawIndex(r.storeDimIndex, t);
		}, e.prototype.getIndices = function() {
			return this._store.getIndices();
		}, e.prototype.getDataExtent = function(e) {
			return this._store.getDataExtent(this._getStoreDimIndex(e), null);
		}, e.prototype.getSum = function(e) {
			return this._store.getSum(this._getStoreDimIndex(e));
		}, e.prototype.getMedian = function(e) {
			return this._store.getMedian(this._getStoreDimIndex(e));
		}, e.prototype.getValues = function(e, t) {
			var n = this, r = this._store;
			return V(e) ? r.getValues(Yg(e, function(e) {
				return n._getStoreDimIndex(e);
			}), t) : r.getValues(e);
		}, e.prototype.hasValue = function(e) {
			for (var t = this._dimSummary.dataDimIndicesOnCoord, n = 0, r = t.length; n < r; n++) if (isNaN(this._store.get(t[n], e))) return !1;
			return !0;
		}, e.prototype.indexOfName = function(e) {
			for (var t = 0, n = this._store.count(); t < n; t++) if (this.getName(t) === e) return t;
			return -1;
		}, e.prototype.getRawIndex = function(e) {
			return this._store.getRawIndex(e);
		}, e.prototype.indexOfRawIndex = function(e) {
			return this._store.indexOfRawIndex(e);
		}, e.prototype.rawIndexOf = function(e, t) {
			var n = e && this._invertedIndicesMap[e], r = n && n[t];
			return r == null || isNaN(r) ? Qg : r;
		}, e.prototype.each = function(e, t, n) {
			H(e) && (n = t, t = e, e = []);
			var r = n || this, i = Yg(i_(e), this._getStoreDimIndex, this);
			this._store.each(i, r ? Gt(t, r) : t);
		}, e.prototype.filterSelf = function(e, t, n) {
			H(e) && (n = t, t = e, e = []);
			var r = n || this, i = Yg(i_(e), this._getStoreDimIndex, this);
			return this._store = this._store.filter(i, r ? Gt(t, r) : t), this;
		}, e.prototype.selectRange = function(e) {
			var t = this, n = {}, r = st(e), i = [];
			return z(r, function(r) {
				var a = t._getStoreDimIndex(r);
				n[a] = e[r], i.push(a);
			}), this._store = this._store.selectRange(n), this;
		}, e.prototype.mapArray = function(e, t, n) {
			H(e) && (n = t, t = e, e = []), n ||= this;
			var r = [];
			return this.each(e, function() {
				r.push(t && t.apply(this, arguments));
			}, n), r;
		}, e.prototype.map = function(e, t, n, r) {
			var i = n || r || this, a = Yg(i_(e), this._getStoreDimIndex, this), o = o_(this);
			return o._store = this._store.map(a, i ? Gt(t, i) : t), o;
		}, e.prototype.modify = function(e, t, n, r) {
			var i = n || r || this, a = Yg(i_(e), this._getStoreDimIndex, this);
			this._store.modify(a, i ? Gt(t, i) : t);
		}, e.prototype.downSample = function(e, t, n, r) {
			var i = o_(this);
			return i._store = this._store.downSample(this._getStoreDimIndex(e), t, n, r), i;
		}, e.prototype.minmaxDownSample = function(e, t) {
			var n = o_(this);
			return n._store = this._store.minmaxDownSample(this._getStoreDimIndex(e), t), n;
		}, e.prototype.lttbDownSample = function(e, t) {
			var n = o_(this);
			return n._store = this._store.lttbDownSample(this._getStoreDimIndex(e), t), n;
		}, e.prototype.getRawDataItem = function(e) {
			return this._store.getRawDataItem(e);
		}, e.prototype.getItemModel = function(e) {
			var t = this.hostModel, n = this.getRawDataItem(e);
			return new Sh(n, t, t && t.ecModel);
		}, e.prototype.diff = function(e) {
			var t = this;
			return new Eh(e ? e.getStore().getIndices() : [], this.getStore().getIndices(), function(t) {
				return n_(e, t);
			}, function(e) {
				return n_(t, e);
			});
		}, e.prototype.getVisual = function(e) {
			var t = this._visual;
			return t && t[e];
		}, e.prototype.setVisual = function(e, t) {
			this._visual = this._visual || {}, Jg(e) ? L(this._visual, e) : this._visual[e] = t;
		}, e.prototype.getItemVisual = function(e, t) {
			var n = this._itemVisuals[e];
			return (n && n[t]) ?? this.getVisual(t);
		}, e.prototype.hasItemVisual = function() {
			return this._itemVisuals.length > 0;
		}, e.prototype.ensureUniqueItemVisual = function(e, t) {
			var n = this._itemVisuals, r = n[e];
			r ||= n[e] = {};
			var i = r[t];
			return i ?? (i = this.getVisual(t), V(i) ? i = i.slice() : Jg(i) && (i = L({}, i)), r[t] = i), i;
		}, e.prototype.setItemVisual = function(e, t, n) {
			var r = this._itemVisuals[e] || {};
			this._itemVisuals[e] = r, Jg(t) ? L(r, t) : r[t] = n;
		}, e.prototype.clearAllVisual = function() {
			this._visual = {}, this._itemVisuals = [];
		}, e.prototype.setLayout = function(e, t) {
			Jg(e) ? L(this._layout, e) : this._layout[e] = t;
		}, e.prototype.getLayout = function(e) {
			return this._layout[e];
		}, e.prototype.getItemLayout = function(e) {
			return this._itemLayouts[e];
		}, e.prototype.setItemLayout = function(e, t, n) {
			this._itemLayouts[e] = n ? L(this._itemLayouts[e] || {}, t) : t;
		}, e.prototype.clearItemLayouts = function() {
			this._itemLayouts.length = 0;
		}, e.prototype.setItemGraphicEl = function(e, t) {
			var n = this.hostModel && this.hostModel.seriesIndex;
			Eu(n, this.dataType, e, t), this._graphicEls[e] = t;
		}, e.prototype.getItemGraphicEl = function(e) {
			return this._graphicEls[e];
		}, e.prototype.eachItemGraphicEl = function(e, t) {
			z(this._graphicEls, function(n, r) {
				n && e && e.call(t, n, r);
			});
		}, e.prototype.cloneShallow = function(t) {
			return t ||= new e(this._schema ? this._schema : Yg(this.dimensions, this._getDimInfo, this), this.hostModel), a_(t, this), t._store = this._store, t;
		}, e.prototype.wrapMethod = function(e, t) {
			var n = this[e];
			H(n) && (this.__wrappedMethods = this.__wrappedMethods || [], this.__wrappedMethods.push(e), this[e] = function() {
				var e = n.apply(this, arguments);
				return t.apply(this, [e].concat(bt(arguments)));
			});
		}, e.internalField = function() {
			t_ = function(e) {
				var t = e._invertedIndicesMap;
				z(t, function(n, r) {
					var i = e._dimInfos[r], a = i.ordinalMeta, o = e._store;
					if (a) {
						n = t[r] = new Xg(a.categories.length);
						for (var s = 0; s < n.length; s++) n[s] = Qg;
						for (var s = 0; s < o.count(); s++) n[o.get(i.storeDimIndex, s)] = s;
					}
				});
			}, r_ = function(e, t, n) {
				return Ul(e._getCategory(t, n), null);
			}, n_ = function(e, t) {
				var n = e._idList[t];
				return n == null && e._idDimIdx != null && (n = r_(e, e._idDimIdx, t)), n ??= Zg + t, n;
			}, i_ = function(e) {
				return V(e) || (e = e == null ? [] : [e]), e;
			}, o_ = function(t) {
				var n = new e(t._schema ? t._schema : Yg(t.dimensions, t._getDimInfo, t), t.hostModel);
				return a_(n, t), n;
			}, a_ = function(e, t) {
				z($g.concat(t.__wrappedMethods || []), function(n) {
					t.hasOwnProperty(n) && (e[n] = t[n]);
				}), e.__wrappedMethods = t.__wrappedMethods, z(e_, function(n) {
					e[n] = I(t[n]);
				}), e._calculationInfo = L({}, t._calculationInfo);
			}, s_ = function(e, t) {
				var n = e._nameList, r = e._idList, i = e._nameDimIdx, a = e._idDimIdx, o = n[t], s = r[t];
				if (o == null && i != null && (n[t] = o = r_(e, i, t)), s == null && a != null && (r[t] = s = r_(e, a, t)), s == null && o != null) {
					var c = e._nameRepeatCount, l = c[o] = (c[o] || 0) + 1;
					s = o, l > 1 && (s += "__ec__" + l), r[t] = s;
				}
			};
		}(), e;
	}();
}));
//#endregion
//#region node_modules/echarts/lib/data/helper/createDimensions.js
function u_(e, t) {
	Lh(e) || (e = zh(e)), t ||= {};
	var n = t.coordDimensions || [], r = t.dimensionsDefine || e.dimensionsDefine || [], i = K(), a = [], o = d_(e, n, r, t.dimensionsCount), s = t.canOmitUnusedDimensions && Ug(o), c = r === e.dimensionsDefine, l = c ? Hg(e) : Vg(r), u = t.encodeDefine;
	!u && t.encodeDefaulter && (u = t.encodeDefaulter(e, o));
	for (var d = K(u), f = new Pg(o), p = 0; p < f.length; p++) f[p] = -1;
	function m(e) {
		var t = f[e];
		if (t < 0) {
			var n = r[e], i = W(n) ? n : { name: n }, o = new xg(), s = i.name;
			return s != null && l.get(s) != null && (o.name = o.displayName = s), i.type != null && (o.type = i.type), i.displayName != null && (o.displayName = i.displayName), f[e] = a.length, o.storeDimIndex = e, a.push(o), o;
		}
		return a[t];
	}
	if (!s) for (var p = 0; p < o; p++) m(p);
	d.each(function(e, t) {
		var n = Al(e).slice();
		if (n.length === 1 && !U(n[0]) && n[0] < 0) {
			d.set(t, !1);
			return;
		}
		var r = d.set(t, []);
		z(n, function(e, n) {
			var i = U(e) ? l.get(e) : e;
			i != null && i < o && (r[n] = i, g(m(i), t, n));
		});
	});
	var h = 0;
	z(n, function(e) {
		var t, n, r, i;
		if (U(e)) t = e, i = {};
		else {
			i = e, t = i.name;
			var a = i.ordinalMeta;
			i.ordinalMeta = null, i = L({}, i), i.ordinalMeta = a, n = i.dimsDef, r = i.otherDims, i.name = i.coordDim = i.coordDimIndex = i.dimsDef = i.otherDims = null;
		}
		var s = d.get(t);
		if (s !== !1) {
			if (s = Al(s), !s.length) for (var l = 0; l < (n && n.length || 1); l++) {
				for (; h < o && m(h).coordDim != null;) h++;
				h < o && s.push(h++);
			}
			z(s, function(e, a) {
				var o = m(e);
				if (c && i.type != null && (o.type = i.type), g(et(o, i), t, a), o.name == null && n) {
					var s = n[a];
					!W(s) && (s = { name: s }), o.name = o.displayName = s.name, o.defaultTooltip = s.defaultTooltip;
				}
				r && et(o.otherDims, r);
			});
		}
	});
	function g(e, t, n) {
		Ou.get(t) == null ? (e.coordDim = t, e.coordDimIndex = n, i.set(t, !0)) : e.otherDims[t] = n;
	}
	var _ = t.generateCoord, v = t.generateCoordCount, y = v != null;
	v = _ ? v || 1 : 0;
	var b = _ || "value";
	function x(e) {
		e.name ??= e.coordDim;
	}
	if (s) z(a, function(e) {
		x(e);
	}), a.sort(function(e, t) {
		return e.storeDimIndex - t.storeDimIndex;
	});
	else for (var S = 0; S < o; S++) {
		var C = m(S);
		C.coordDim ?? (C.coordDim = f_(b, i, y), C.coordDimIndex = 0, (!_ || v <= 0) && (C.isExtraCoord = !0), v--), x(C), C.type == null && (Mh(e, S) === Ph.Must || C.isExtraCoord && (C.otherDims.itemName != null || C.otherDims.seriesName != null)) && (C.type = "ordinal");
	}
	return mu(a, function(e) {
		return e.name;
	}, function(e, t) {
		t > 0 && (e.name += t - 1);
	}), new Kg({
		source: e,
		dimensions: a,
		fullDimensionCount: o,
		dimensionOmitted: s
	});
}
function d_(e, t, n, r) {
	var i = Math.max(e.dimensionsDetectedCount || 1, t.length, n.length, r || 0);
	return z(t, function(e) {
		var t;
		W(e) && (t = e.dimsDef) && (i = Math.max(i, t.length));
	}), i;
}
function f_(e, t, n) {
	if (n || t.hasKey(e)) {
		for (var r = 0; t.hasKey(e + r);) r++;
		e += r;
	}
	return t.set(e, !0), e;
}
var p_ = M((() => {
	Iu(), Sg(), q(), Jh(), zg(), Z(), Ih(), qg();
}));
//#endregion
//#region node_modules/echarts/lib/core/CoordinateSystem.js
function m_(e) {
	return !!v_[e];
}
function h_(e) {
	var t = e.getShallow("coord", !0), n = 1;
	if (t == null) {
		var r = x_.get(e.type);
		r && r.getCoord2 && (n = 2, t = r.getCoord2(e));
	}
	return {
		coord: t,
		from: n
	};
}
function g_(e, t) {
	var n = e.getShallow("coordinateSystem"), r = e.getShallow("coordinateSystemUsage", !0), i = 0;
	if (n) {
		var a = e.mainType === "series";
		r ??= a ? "data" : "box", r === "data" ? (i = 1, a || (i = 0)) : r === "box" && (i = 2, !a && !m_(n) && (i = 0));
	}
	return {
		coordSysType: n,
		kind: i
	};
}
function __(e) {
	var t = e.targetModel, n = e.coordSysType, r = e.coordSysProvider, i = e.isDefaultDataCoordSys;
	e.allowNotFound;
	var a = g_(t, !0), o = a.kind, s = a.coordSysType;
	if (i && o !== 1 && (o = 1, s = n), o === 0 || s !== n) return 0;
	var c = r(n, t);
	return c ? (o === 1 ? t.coordinateSystem = c : t.boxCoordinateSystem = c, o) : 0;
}
var v_, y_, b_, x_, S_ = M((() => {
	q(), v_ = {}, y_ = {}, b_ = function() {
		function e() {
			this._normalMasterList = [], this._nonSeriesBoxMasterList = [];
		}
		return e.prototype.create = function(e, t) {
			this._nonSeriesBoxMasterList = n(v_, !0), this._normalMasterList = n(y_, !1);
			function n(n, r) {
				var i = [];
				return z(n, function(n, r) {
					var a = n.create(e, t);
					i = i.concat(a || []);
				}), i;
			}
		}, e.prototype.update = function(e, t) {
			z(this._normalMasterList, function(n) {
				n.update && n.update(e, t);
			});
		}, e.prototype.getCoordinateSystems = function() {
			return this._normalMasterList.concat(this._nonSeriesBoxMasterList);
		}, e.register = function(e, t) {
			if (e === "matrix" || e === "calendar") {
				v_[e] = t;
				return;
			}
			y_[e] = t;
		}, e.get = function(e) {
			return y_[e] || v_[e];
		}, e;
	}(), x_ = K();
}));
//#endregion
//#region node_modules/echarts/lib/model/referHelper.js
function C_(e) {
	var t = e.get("coordinateSystem"), n = new T_(t), r = E_[t];
	if (r) return r(e, n, n.axisMap, n.categoryAxisMap), n;
}
function w_(e) {
	return e.get("type") === "category";
}
var T_, E_, D_ = M((() => {
	q(), Z(), T_ = function() {
		function e(e) {
			this.coordSysDims = [], this.axisMap = K(), this.categoryAxisMap = K(), this.coordSysName = e;
		}
		return e;
	}(), E_ = {
		cartesian2d: function(e, t, n, r) {
			var i = e.getReferringComponents("xAxis", Cu).models[0], a = e.getReferringComponents("yAxis", Cu).models[0];
			t.coordSysDims = ["x", "y"], n.set("x", i), n.set("y", a), w_(i) && (r.set("x", i), t.firstCategoryDimIndex = 0), w_(a) && (r.set("y", a), t.firstCategoryDimIndex ??= 1);
		},
		singleAxis: function(e, t, n, r) {
			var i = e.getReferringComponents("singleAxis", Cu).models[0];
			t.coordSysDims = ["single"], n.set("single", i), w_(i) && (r.set("single", i), t.firstCategoryDimIndex = 0);
		},
		polar: function(e, t, n, r) {
			var i = e.getReferringComponents("polar", Cu).models[0], a = i.findAxisModel("radiusAxis"), o = i.findAxisModel("angleAxis");
			t.coordSysDims = ["radius", "angle"], n.set("radius", a), n.set("angle", o), w_(a) && (r.set("radius", a), t.firstCategoryDimIndex = 0), w_(o) && (r.set("angle", o), t.firstCategoryDimIndex ??= 1);
		},
		geo: function(e, t, n, r) {
			t.coordSysDims = ["lng", "lat"];
		},
		parallel: function(e, t, n, r) {
			var i = e.ecModel, a = i.getComponent("parallel", e.get("parallelIndex")), o = t.coordSysDims = a.dimensions.slice();
			z(a.parallelAxisIndex, function(e, a) {
				var s = i.getComponent("parallelAxis", e), c = o[a];
				n.set(c, s), w_(s) && (r.set(c, s), t.firstCategoryDimIndex ??= a);
			});
		},
		matrix: function(e, t, n, r) {
			var i = e.getReferringComponents("matrix", Cu).models[0];
			t.coordSysDims = ["x", "y"];
			var a = i.getDimensionModel("x"), o = i.getDimensionModel("y");
			n.set("x", a), n.set("y", o), r.set("x", a), r.set("y", o);
		}
	};
}));
//#endregion
//#region node_modules/echarts/lib/data/helper/dataStackHelper.js
function O_(e, t, n) {
	n ||= {};
	var r = n.byIndex, i = n.stackedCoordDimension, a, o, s;
	k_(t) ? a = t : (o = t.schema, a = o.dimensions, s = t.store);
	var c = !!(e && e.get("stack")), l, u, d, f, p = !0;
	function m(e) {
		return e.type !== "ordinal" && e.type !== "time";
	}
	if (z(a, function(e, t) {
		U(e) && (a[t] = e = { name: e }), m(e) || (p = !1);
	}), z(a, function(e, t) {
		c && !e.isExtraCoord && (!r && !l && e.ordinalMeta && (l = e), !u && m(e) && (!p || e.coordDim !== "x" && e.coordDim !== "angle") && (!i || i === e.coordDim) && (u = e));
	}), u && !r && !l && (r = !0), u) {
		d = "__\0ecstackresult_" + e.id, f = "__\0ecstackedover_" + e.id, l && (l.createInvertedIndices = !0);
		var h = u.coordDim, g = u.type, _ = 0;
		z(a, function(e) {
			e.coordDim === h && _++;
		});
		var v = {
			name: d,
			coordDim: h,
			coordDimIndex: _,
			type: g,
			isExtraCoord: !0,
			isCalculationCoord: !0,
			storeDimIndex: a.length
		}, y = {
			name: f,
			coordDim: f,
			coordDimIndex: _ + 1,
			type: g,
			isExtraCoord: !0,
			isCalculationCoord: !0,
			storeDimIndex: a.length + 1
		};
		o ? (s && (v.storeDimIndex = s.ensureCalculationDimension(f, g), y.storeDimIndex = s.ensureCalculationDimension(d, g)), o.appendCalculationDimension(v), o.appendCalculationDimension(y)) : (a.push(v), a.push(y));
	}
	return {
		stackedDimension: u && u.name,
		stackedByDimension: l && l.name,
		isStackedByIndex: r,
		stackedOverDimension: f,
		stackResultDimension: d
	};
}
function k_(e) {
	return !Bg(e.schema);
}
function A_(e, t) {
	return !!t && t === e.getCalculationInfo("stackedDimension");
}
function j_(e, t) {
	return A_(e, t) ? e.getCalculationInfo("stackResultDimension") : t;
}
var M_ = M((() => {
	q(), qg();
}));
//#endregion
//#region node_modules/echarts/lib/chart/helper/createSeriesData.js
function N_(e, t) {
	var n = e.get("coordinateSystem"), r = b_.get(n), i;
	return t && t.coordSysDims && (i = B(t.coordSysDims, function(e) {
		var n = { name: e }, r = t.axisMap.get(e);
		return r && (n.type = _g(r.get("type"))), n;
	})), i ||= r && (r.getDimensionsInfo ? r.getDimensionsInfo() : r.dimensions.slice()) || ["x", "y"], i;
}
function P_(e, t, n) {
	var r, i;
	return n && z(e, function(e, a) {
		var o = e.coordDim, s = n.categoryAxisMap.get(o);
		s && (r ??= a, e.ordinalMeta = s.getOrdinalMeta(), t && (e.createInvertedIndices = !0)), e.otherDims.itemName != null && (i = !0);
	}), !i && r != null && (e[r].otherDims.itemName = 0), r;
}
function F_(e, t, n) {
	n ||= {};
	var r = t.getSourceManager(), i, a = !1;
	e ? (a = !0, i = zh(e)) : (i = r.getSource(), a = i.sourceFormat === ku);
	var o = C_(t), s = N_(t, o), c = n.useEncodeDefaulter, l = H(c) ? c : c ? lt(kh, s, t) : null, u = {
		coordDimensions: s,
		generateCoord: n.generateCoord,
		encodeDefine: t.getEncode(),
		encodeDefaulter: l,
		canOmitUnusedDimensions: !a
	}, d = u_(i, u), f = P_(d.dimensions, n.createInvertedIndices, o), p = a ? null : r.getSharedDataStore(d), m = O_(t, {
		schema: d,
		store: p
	}), h = new c_(d, t);
	h.setCalculationInfo(m);
	var g = f != null && I_(i) ? function(e, t, n, r) {
		return r === f ? n : this.defaultDimValueGetter(e, t, n, r);
	} : null;
	return h.hasItemOption = !1, h.initData(a ? i : p, null, g), h;
}
function I_(e) {
	if (e.sourceFormat === "original") return !V(Ml(L_(e.data || [])));
}
function L_(e) {
	for (var t = 0; t < e.length && e[t] == null;) t++;
	return e[t];
}
var R_ = M((() => {
	q(), l_(), p_(), bg(), Z(), S_(), D_(), Jh(), M_(), Ih(), Iu();
}));
//#endregion
//#region node_modules/echarts/lib/util/component.js
function z_(e) {
	return [e || "", U_++].join("_");
}
function B_(e) {
	var t = {};
	e.registerSubTypeDefaulter = function(e, n) {
		var r = en(e);
		t[r.main] = n;
	}, e.determineSubType = function(n, r) {
		var i = r.type;
		if (!i) {
			var a = en(n).main;
			e.hasSubTypes(n) && t[a] && (i = t[a](r));
		}
		return i;
	};
}
function V_(e, t) {
	e.topologicalTravel = function(e, t, r, i) {
		if (!e.length) return;
		var a = n(t), o = a.graph, s = a.noEntryList, c = {};
		for (z(e, function(e) {
			c[e] = !0;
		}); s.length;) {
			var l = s.pop(), u = o[l], d = !!c[l];
			d && (r.call(i, l, u.originalDeps.slice()), delete c[l]), z(u.successor, d ? p : f);
		}
		z(c, function() {
			throw Error("");
		});
		function f(e) {
			o[e].entryCount--, o[e].entryCount === 0 && s.push(e);
		}
		function p(e) {
			c[e] = !0, f(e);
		}
	};
	function n(e) {
		var n = {}, a = [];
		return z(e, function(o) {
			var s = r(n, o), c = i(s.originalDeps = t(o), e);
			s.entryCount = c.length, s.entryCount === 0 && a.push(o), z(c, function(e) {
				R(s.predecessor, e) < 0 && s.predecessor.push(e);
				var t = r(n, e);
				R(t.successor, e) < 0 && t.successor.push(o);
			});
		}), {
			graph: n,
			noEntryList: a
		};
	}
	function r(e, t) {
		return e[t] || (e[t] = {
			predecessor: [],
			successor: []
		}), e[t];
	}
	function i(e, t) {
		var n = [];
		return z(e, function(e) {
			R(t, e) >= 0 && n.push(e);
		}), n;
	}
}
function H_(e, t) {
	return Qe(Qe({}, e, !0), t, !0);
}
var U_, W_ = M((() => {
	q(), hn(), U_ = Math.round(Math.random() * 10);
}));
//#endregion
//#region node_modules/zrender/lib/core/fourPointsTransform.js
function G_(e, t, n, r, i, a) {
	var o = r + "-" + i, s = e.length;
	if (a.hasOwnProperty(o)) return a[o];
	if (t === 1) {
		var c = Math.round(Math.log((1 << s) - 1 & ~i) / q_);
		return e[n][c];
	}
	for (var l = r | 1 << n, u = n + 1; r & 1 << u;) u++;
	for (var d = 0, f = 0, p = 0; f < s; f++) {
		var m = 1 << f;
		m & i || (d += (p % 2 ? -1 : 1) * e[n][f] * G_(e, t - 1, u, l, i | m, a), p++);
	}
	return a[o] = d, d;
}
function K_(e, t) {
	var n = [
		[
			e[0],
			e[1],
			1,
			0,
			0,
			0,
			-t[0] * e[0],
			-t[0] * e[1]
		],
		[
			0,
			0,
			0,
			e[0],
			e[1],
			1,
			-t[1] * e[0],
			-t[1] * e[1]
		],
		[
			e[2],
			e[3],
			1,
			0,
			0,
			0,
			-t[2] * e[2],
			-t[2] * e[3]
		],
		[
			0,
			0,
			0,
			e[2],
			e[3],
			1,
			-t[3] * e[2],
			-t[3] * e[3]
		],
		[
			e[4],
			e[5],
			1,
			0,
			0,
			0,
			-t[4] * e[4],
			-t[4] * e[5]
		],
		[
			0,
			0,
			0,
			e[4],
			e[5],
			1,
			-t[5] * e[4],
			-t[5] * e[5]
		],
		[
			e[6],
			e[7],
			1,
			0,
			0,
			0,
			-t[6] * e[6],
			-t[6] * e[7]
		],
		[
			0,
			0,
			0,
			e[6],
			e[7],
			1,
			-t[7] * e[6],
			-t[7] * e[7]
		]
	], r = {}, i = G_(n, 8, 0, 0, 0, r);
	if (i !== 0) {
		for (var a = [], o = 0; o < 8; o++) for (var s = 0; s < 8; s++) a[s] ?? (a[s] = 0), a[s] += ((o + s) % 2 ? -1 : 1) * G_(n, 7, +(o === 0), 1 << o, 1 << s, r) / i * t[o];
		return function(e, t, n) {
			var r = t * a[6] + n * a[7] + 1;
			e[0] = (t * a[0] + n * a[1] + a[2]) / r, e[1] = (t * a[3] + n * a[4] + a[5]) / r;
		};
	}
}
var q_, J_ = M((() => {
	q_ = Math.log(2);
}));
//#endregion
//#region node_modules/zrender/lib/core/dom.js
function Y_(e, t, n, r, i) {
	return Z_(rv, t, r, i, !0) && Z_(e, n, rv[0], rv[1]);
}
function X_(e, t) {
	e && n(e), t && n(t);
	function n(e) {
		var t = e[nv];
		t && (t.clearMarkers && t.clearMarkers(), delete e[nv]);
	}
}
function Z_(e, t, n, r, i) {
	if (t.getBoundingClientRect && J.domSupported && !ev(t)) {
		var a = t[nv] || (t[nv] = {}), o = $_(Q_(t, a), a, i);
		if (o) return o(e, n, r), !0;
	}
	return !1;
}
function Q_(e, t) {
	var n = t.markers;
	if (n) return n;
	n = t.markers = [];
	for (var r = ["left", "right"], i = ["top", "bottom"], a = 0; a < 4; a++) {
		var o = document.createElement("div"), s = o.style, c = a % 2, l = (a >> 1) % 2;
		s.cssText = [
			"position: absolute",
			"visibility: hidden",
			"padding: 0",
			"margin: 0",
			"border-width: 0",
			"user-select: none",
			"width:0",
			"height:0",
			r[c] + ":0",
			i[l] + ":0",
			r[1 - c] + ":auto",
			i[1 - l] + ":auto",
			""
		].join("!important;"), e.appendChild(o), n.push(o);
	}
	return t.clearMarkers = function() {
		z(n, function(e) {
			e.parentNode && e.parentNode.removeChild(e);
		});
	}, n;
}
function $_(e, t, n) {
	for (var r = n ? "invTrans" : "trans", i = t[r], a = t.srcCoords, o = [], s = [], c = !0, l = 0; l < 4; l++) {
		var u = e[l].getBoundingClientRect(), d = 2 * l, f = u.left, p = u.top;
		o.push(f, p), c = c && a && f === a[d] && p === a[d + 1], s.push(e[l].offsetLeft, e[l].offsetTop);
	}
	return c && i ? i : (t.srcCoords = o, t[r] = n ? K_(s, o) : K_(o, s));
}
function ev(e) {
	return e.nodeName.toUpperCase() === "CANVAS";
}
function tv(e) {
	return e == null ? "" : (e + "").replace(iv, function(e, t) {
		return av[t];
	});
}
var nv, rv, iv, av, ov = M((() => {
	$t(), J_(), q(), nv = "___zrEVENTSAVED", rv = [], iv = /([&<>"'])/g, av = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&#39;"
	};
})), sv, cv = M((() => {
	sv = {
		time: {
			month: [
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December"
			],
			monthAbbr: [
				"Jan",
				"Feb",
				"Mar",
				"Apr",
				"May",
				"Jun",
				"Jul",
				"Aug",
				"Sep",
				"Oct",
				"Nov",
				"Dec"
			],
			dayOfWeek: [
				"Sunday",
				"Monday",
				"Tuesday",
				"Wednesday",
				"Thursday",
				"Friday",
				"Saturday"
			],
			dayOfWeekAbbr: [
				"Sun",
				"Mon",
				"Tue",
				"Wed",
				"Thu",
				"Fri",
				"Sat"
			]
		},
		legend: { selector: {
			all: "All",
			inverse: "Inv"
		} },
		toolbox: {
			brush: { title: {
				rect: "Box Select",
				polygon: "Lasso Select",
				lineX: "Horizontally Select",
				lineY: "Vertically Select",
				keep: "Keep Selections",
				clear: "Clear Selections"
			} },
			dataView: {
				title: "Data View",
				lang: [
					"Data View",
					"Close",
					"Refresh"
				]
			},
			dataZoom: { title: {
				zoom: "Zoom",
				back: "Zoom Reset"
			} },
			magicType: { title: {
				line: "Switch to Line Chart",
				bar: "Switch to Bar Chart",
				stack: "Stack",
				tiled: "Tile"
			} },
			restore: { title: "Restore" },
			saveAsImage: {
				title: "Save as Image",
				lang: ["Right Click to Save Image"]
			}
		},
		series: { typeNames: {
			pie: "Pie chart",
			bar: "Bar chart",
			line: "Line chart",
			scatter: "Scatter plot",
			effectScatter: "Ripple scatter plot",
			radar: "Radar chart",
			tree: "Tree",
			treemap: "Treemap",
			boxplot: "Boxplot",
			candlestick: "Candlestick",
			k: "K line chart",
			heatmap: "Heat map",
			map: "Map",
			parallel: "Parallel coordinate map",
			lines: "Line graph",
			graph: "Relationship graph",
			sankey: "Sankey diagram",
			funnel: "Funnel chart",
			gauge: "Gauge",
			pictorialBar: "Pictorial bar",
			themeRiver: "Theme River Map",
			sunburst: "Sunburst",
			custom: "Custom chart",
			chart: "Chart"
		} },
		aria: {
			general: {
				withTitle: "This is a chart about \"{title}\"",
				withoutTitle: "This is a chart"
			},
			series: {
				single: {
					prefix: "",
					withName: " with type {seriesType} named {seriesName}.",
					withoutName: " with type {seriesType}."
				},
				multiple: {
					prefix: ". It consists of {seriesCount} series count.",
					withName: " The {seriesId} series is a {seriesType} representing {seriesName}.",
					withoutName: " The {seriesId} series is a {seriesType}.",
					separator: {
						middle: "",
						end: ""
					}
				}
			},
			data: {
				allData: "The data is as follows: ",
				partialData: "The first {displayCnt} items are: ",
				withName: "the data for {name} is {value}",
				withoutName: "{value}",
				separator: {
					middle: ", ",
					end: ". "
				}
			}
		}
	};
})), lv, uv = M((() => {
	lv = {
		time: {
			month: [
				"一月",
				"二月",
				"三月",
				"四月",
				"五月",
				"六月",
				"七月",
				"八月",
				"九月",
				"十月",
				"十一月",
				"十二月"
			],
			monthAbbr: [
				"1月",
				"2月",
				"3月",
				"4月",
				"5月",
				"6月",
				"7月",
				"8月",
				"9月",
				"10月",
				"11月",
				"12月"
			],
			dayOfWeek: [
				"星期日",
				"星期一",
				"星期二",
				"星期三",
				"星期四",
				"星期五",
				"星期六"
			],
			dayOfWeekAbbr: [
				"日",
				"一",
				"二",
				"三",
				"四",
				"五",
				"六"
			]
		},
		legend: { selector: {
			all: "全选",
			inverse: "反选"
		} },
		toolbox: {
			brush: { title: {
				rect: "矩形选择",
				polygon: "圈选",
				lineX: "横向选择",
				lineY: "纵向选择",
				keep: "保持选择",
				clear: "清除选择"
			} },
			dataView: {
				title: "数据视图",
				lang: [
					"数据视图",
					"关闭",
					"刷新"
				]
			},
			dataZoom: { title: {
				zoom: "区域缩放",
				back: "区域缩放还原"
			} },
			magicType: { title: {
				line: "切换为折线图",
				bar: "切换为柱状图",
				stack: "切换为堆叠",
				tiled: "切换为平铺"
			} },
			restore: { title: "还原" },
			saveAsImage: {
				title: "保存为图片",
				lang: ["右键另存为图片"]
			}
		},
		series: { typeNames: {
			pie: "饼图",
			bar: "柱状图",
			line: "折线图",
			scatter: "散点图",
			effectScatter: "涟漪散点图",
			radar: "雷达图",
			tree: "树图",
			treemap: "矩形树图",
			boxplot: "箱型图",
			candlestick: "K线图",
			k: "K线图",
			heatmap: "热力图",
			map: "地图",
			parallel: "平行坐标图",
			lines: "线图",
			graph: "关系图",
			sankey: "桑基图",
			funnel: "漏斗图",
			gauge: "仪表盘图",
			pictorialBar: "象形柱图",
			themeRiver: "主题河流图",
			sunburst: "旭日图",
			custom: "自定义图表",
			chart: "图表"
		} },
		aria: {
			general: {
				withTitle: "这是一个关于“{title}”的图表。",
				withoutTitle: "这是一个图表，"
			},
			series: {
				single: {
					prefix: "",
					withName: "图表类型是{seriesType}，表示{seriesName}。",
					withoutName: "图表类型是{seriesType}。"
				},
				multiple: {
					prefix: "它由{seriesCount}个图表系列组成。",
					withName: "第{seriesId}个系列是一个表示{seriesName}的{seriesType}，",
					withoutName: "第{seriesId}个系列是一个{seriesType}，",
					separator: {
						middle: "；",
						end: "。"
					}
				}
			},
			data: {
				allData: "其数据是——",
				partialData: "其中，前{displayCnt}项是——",
				withName: "{name}的数据是{value}",
				withoutName: "{value}",
				separator: {
					middle: "，",
					end: ""
				}
			}
		}
	};
}));
//#endregion
//#region node_modules/echarts/lib/core/locale.js
function dv(e, t) {
	e = e.toUpperCase(), yv[e] = new Sh(t), vv[e] = t;
}
function fv(e) {
	if (U(e)) {
		var t = vv[e.toUpperCase()] || {};
		return e === hv || e === gv ? I(t) : Qe(I(t), I(vv[_v]), !1);
	}
	return Qe(I(e), I(vv[_v]), !1);
}
function pv(e) {
	return yv[e];
}
function mv() {
	return yv[_v];
}
var hv, gv, _v, vv, yv, bv, xv = M((() => {
	Ch(), $t(), cv(), uv(), q(), hv = "ZH", gv = "EN", _v = gv, vv = {}, yv = {}, bv = J.domSupported ? function() {
		return (document.documentElement.lang || navigator.language || navigator.browserLanguage || _v).toUpperCase().indexOf(hv) > -1 ? hv : _v;
	}() : _v, dv(gv, sv), dv(hv, lv);
}));
//#endregion
//#region node_modules/echarts/lib/scale/break.js
function Sv() {
	return Ev;
}
function Cv(e, t) {
	var n = Sv(), r = t.breakOption, i = t.breakParsed;
	return !i && n && (i = n.parseAxisBreakOption(r, e)), i;
}
function wv(e) {
	var t = e.brk;
	return t ? t.breaks : [];
}
function Tv(e) {
	var t = e.brk;
	return t ? t.hasBreaks() : !1;
}
var Ev, Dv = M((() => {
	Ev = null;
}));
//#endregion
//#region node_modules/echarts/lib/util/time.js
function Ov(e) {
	return !U(e) && !H(e) ? kv(e) : e;
}
function kv(e) {
	e ||= {};
	var t = {}, n = !0;
	return z(cy, function(t) {
		n &&= e[t] == null;
	}), z(cy, function(r, i) {
		var a = e[r];
		t[r] = {};
		for (var o = null, s = i; s >= 0; s--) {
			var c = cy[s], l = W(a) && !V(a) ? a[c] : a, u = void 0;
			V(l) ? (u = l.slice(), o = u[0] || "") : U(l) ? (o = l, u = [o]) : (o == null ? o = iy[r] : ry[c].test(o) || (o = t[c][c][0] + " " + o), u = [o], n && (u[1] = "{primary|" + o + "}")), t[r][c] = u;
		}
	}), t;
}
function Av(e, t) {
	return e += "", "0000".substr(0, t - e.length) + e;
}
function jv(e) {
	switch (e) {
		case "half-year":
		case "quarter": return "month";
		case "week":
		case "half-week": return "day";
		case "half-day":
		case "quarter-day": return "hour";
		default: return e;
	}
}
function Mv(e) {
	return e === jv(e);
}
function Nv(e) {
	switch (e) {
		case "year":
		case "month": return "day";
		case "millisecond": return "millisecond";
		default: return "second";
	}
}
function Pv(e, t, n, r) {
	var i = Xc(e), a = i[Rv(n)](), o = i[zv(n)]() + 1, s = Math.floor((o - 1) / 3) + 1, c = i[Bv(n)](), l = i["get" + (n ? "UTC" : "") + "Day"](), u = i[Vv(n)](), d = (u - 1) % 12 + 1, f = i[Hv(n)](), p = i[Uv(n)](), m = i[Wv(n)](), h = u >= 12 ? "pm" : "am", g = h.toUpperCase(), _ = (r instanceof Sh ? r : pv(r || bv) || mv()).getModel("time"), v = _.get("month"), y = _.get("monthAbbr"), b = _.get("dayOfWeek"), x = _.get("dayOfWeekAbbr");
	return (t || "").replace(/{a}/g, h + "").replace(/{A}/g, g + "").replace(/{yyyy}/g, a + "").replace(/{yy}/g, Av(a % 100 + "", 2)).replace(/{Q}/g, s + "").replace(/{MMMM}/g, v[o - 1]).replace(/{MMM}/g, y[o - 1]).replace(/{MM}/g, Av(o, 2)).replace(/{M}/g, o + "").replace(/{dd}/g, Av(c, 2)).replace(/{d}/g, c + "").replace(/{eeee}/g, b[l]).replace(/{ee}/g, x[l]).replace(/{e}/g, l + "").replace(/{HH}/g, Av(u, 2)).replace(/{H}/g, u + "").replace(/{hh}/g, Av(d + "", 2)).replace(/{h}/g, d + "").replace(/{mm}/g, Av(f, 2)).replace(/{m}/g, f + "").replace(/{ss}/g, Av(p, 2)).replace(/{s}/g, p + "").replace(/{SSS}/g, Av(m, 3)).replace(/{S}/g, m + "");
}
function Fv(e, t, n, r, i) {
	var a = null;
	if (U(n)) a = n;
	else if (H(n)) {
		var o = {
			time: e.time,
			level: e.time ? e.time.level : 0
		}, s = Sv();
		s && s.makeAxisLabelFormatterParamBreak(o, e.break), a = n(e.value, t, o);
	} else {
		var c = e.time;
		if (c) {
			var l = n[c.lowerTimeUnit][c.upperTimeUnit];
			a = l[Math.min(c.level, l.length - 1)] || "";
		} else {
			var u = Iv(e.value, i);
			a = n[u][u][0];
		}
	}
	return Pv(new Date(e.value), a, i, r);
}
function Iv(e, t) {
	var n = Xc(e), r = n[zv(t)]() + 1, i = n[Bv(t)](), a = n[Vv(t)](), o = n[Hv(t)](), s = n[Uv(t)](), c = n[Wv(t)]() === 0, l = c && s === 0, u = l && o === 0, d = u && a === 0, f = d && i === 1;
	return f && r === 1 ? "year" : f ? "month" : d ? "day" : u ? "hour" : l ? "minute" : c ? "second" : "millisecond";
}
function Lv(e, t, n) {
	switch (t) {
		case "year": e[Kv(n)](0);
		case "month": e[qv(n)](1);
		case "day": e[Jv(n)](0);
		case "hour": e[Yv(n)](0);
		case "minute": e[Xv(n)](0);
		case "second": e[Zv(n)](0);
	}
	return e;
}
function Rv(e) {
	return e ? "getUTCFullYear" : "getFullYear";
}
function zv(e) {
	return e ? "getUTCMonth" : "getMonth";
}
function Bv(e) {
	return e ? "getUTCDate" : "getDate";
}
function Vv(e) {
	return e ? "getUTCHours" : "getHours";
}
function Hv(e) {
	return e ? "getUTCMinutes" : "getMinutes";
}
function Uv(e) {
	return e ? "getUTCSeconds" : "getSeconds";
}
function Wv(e) {
	return e ? "getUTCMilliseconds" : "getMilliseconds";
}
function Gv(e) {
	return e ? "setUTCFullYear" : "setFullYear";
}
function Kv(e) {
	return e ? "setUTCMonth" : "setMonth";
}
function qv(e) {
	return e ? "setUTCDate" : "setDate";
}
function Jv(e) {
	return e ? "setUTCHours" : "setHours";
}
function Yv(e) {
	return e ? "setUTCMinutes" : "setMinutes";
}
function Xv(e) {
	return e ? "setUTCSeconds" : "setSeconds";
}
function Zv(e) {
	return e ? "setUTCMilliseconds" : "setMilliseconds";
}
var Qv, $v, ey, ty, ny, ry, iy, ay, oy, sy, cy, ly, uy = M((() => {
	q(), X(), xv(), Ch(), Dv(), Qv = 1e3, $v = Qv * 60, ey = $v * 60, ty = ey * 24, ny = ty * 365, ry = {
		year: /({yyyy}|{yy})/,
		month: /({MMMM}|{MMM}|{MM}|{M})/,
		day: /({dd}|{d})/,
		hour: /({HH}|{H}|{hh}|{h})/,
		minute: /({mm}|{m})/,
		second: /({ss}|{s})/,
		millisecond: /({SSS}|{S})/
	}, iy = {
		year: "{yyyy}",
		month: "{MMM}",
		day: "{d}",
		hour: "{HH}:{mm}",
		minute: "{HH}:{mm}",
		second: "{HH}:{mm}:{ss}",
		millisecond: "{HH}:{mm}:{ss} {SSS}"
	}, ay = "{yyyy}-{MM}-{dd} {HH}:{mm}:{ss} {SSS}", oy = "{yyyy}-{MM}-{dd}", sy = {
		year: "{yyyy}",
		month: "{yyyy}-{MM}",
		day: oy,
		hour: oy + " " + iy.hour,
		minute: oy + " " + iy.minute,
		second: oy + " " + iy.second,
		millisecond: ay
	}, cy = [
		"year",
		"month",
		"day",
		"hour",
		"minute",
		"second",
		"millisecond"
	], ly = [
		"year",
		"half-year",
		"quarter",
		"month",
		"week",
		"half-week",
		"day",
		"half-day",
		"quarter-day",
		"hour",
		"minute",
		"second",
		"millisecond"
	];
}));
//#endregion
//#region node_modules/echarts/lib/util/format.js
function dy(e) {
	if (!tl(e)) return U(e) ? e : "-";
	var t = (e + "").split(".");
	return t[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, "$1,") + (t.length > 1 ? "." + t[1] : "");
}
function fy(e, t) {
	return e = (e || "").toLowerCase().replace(/-(.)/g, function(e, t) {
		return t.toUpperCase();
	}), t && e && (e = e.charAt(0).toUpperCase() + e.slice(1)), e;
}
function py(e, t, n) {
	var r = "{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}";
	function i(e) {
		return e && Ct(e) ? e : "-";
	}
	function a(e) {
		return al(e);
	}
	var o = t === "time", s = e instanceof Date;
	if (o || s) {
		var c = o ? Xc(e) : e;
		if (!isNaN(+c)) return Pv(c, r, n);
		if (s) return "-";
	}
	if (t === "ordinal") return ut(e) ? i(e) : dt(e) && a(e) ? e + "" : "-";
	var l = el(e);
	return a(l) ? dy(l) : ut(e) ? i(e) : typeof e == "boolean" ? e + "" : "-";
}
function my(e, t, n) {
	V(t) || (t = [t]);
	var r = t.length;
	if (!r) return "";
	for (var i = t[0].$vars || [], a = 0; a < i.length; a++) {
		var o = vy[a];
		e = e.replace(yy(o), yy(o, 0));
	}
	for (var s = 0; s < r; s++) for (var c = 0; c < i.length; c++) {
		var l = t[s][i[c]];
		e = e.replace(yy(vy[c], s), n ? tv(l) : l);
	}
	return e;
}
function hy(e, t) {
	var n = U(e) ? {
		color: e,
		extraCssText: t
	} : e || {}, r = n.color, i = n.type;
	t = n.extraCssText;
	var a = n.renderMode || "html";
	return r ? a === "html" ? i === "subItem" ? "<span style=\"display:inline-block;vertical-align:middle;margin-right:8px;margin-left:3px;border-radius:4px;width:4px;height:4px;background-color:" + tv(r) + ";" + (t || "") + "\"></span>" : "<span style=\"display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:" + tv(r) + ";" + (t || "") + "\"></span>" : {
		renderMode: a,
		content: "{" + (n.markerId || "markerX") + "|}  ",
		style: i === "subItem" ? {
			width: 4,
			height: 4,
			borderRadius: 2,
			backgroundColor: r
		} : {
			width: 10,
			height: 10,
			borderRadius: 5,
			backgroundColor: r
		}
	} : "";
}
function gy(e, t) {
	return t ||= "transparent", U(e) ? e : W(e) && e.colorStops && (e.colorStops[0] || {}).color || t;
}
var _y, vy, yy, by = M((() => {
	q(), ov(), X(), uy(), di(), Gm(), _y = xt, vy = [
		"a",
		"b",
		"c",
		"d",
		"e",
		"f",
		"g"
	], yy = function(e, t) {
		return "{" + e + (t ?? "") + "}";
	};
}));
//#endregion
//#region node_modules/echarts/lib/util/layout.js
function xy(e, t, n, r, i) {
	var a = 0, o = 0;
	r ??= Infinity, i ??= Infinity;
	var s = 0;
	t.eachChild(function(c, l) {
		var u = c.getBoundingRect(), d = t.childAt(l + 1), f = d && d.getBoundingRect(), p, m;
		if (e === "horizontal") {
			var h = u.width + (f ? -f.x + u.x : 0);
			p = a + h, p > r || c.newline ? (a = 0, p = h, o += s + n, s = u.height) : s = Math.max(s, u.height);
		} else {
			var g = u.height + (f ? -f.y + u.y : 0);
			m = o + g, m > i || c.newline ? (a += s + n, o = 0, m = g, s = u.width) : s = Math.max(s, u.width);
		}
		c.newline || (c.x = a, c.y = o, c.markRedraw(), e === "horizontal" ? a = p + n : o = m + n);
	});
}
function Sy(e, t) {
	return {
		left: e.getShallow("left", t),
		top: e.getShallow("top", t),
		right: e.getShallow("right", t),
		bottom: e.getShallow("bottom", t),
		width: e.getShallow("width", t),
		height: e.getShallow("height", t)
	};
}
function Cy(e, t, n) {
	n = _y(n || 0);
	var r = t.width, i = t.height, a = yl(e.left, r), o = yl(e.top, i), s = yl(e.right, r), c = yl(e.bottom, i), l = yl(e.width, r), u = yl(e.height, i), d = n[2] + n[0], f = n[1] + n[3], p = e.aspect;
	switch (isNaN(l) && (l = r - s - f - a), isNaN(u) && (u = i - c - d - o), p != null && (isNaN(l) && isNaN(u) && (p > r / i ? l = r * .8 : u = i * .8), isNaN(l) && (l = p * u), isNaN(u) && (u = l / p)), isNaN(a) && (a = r - s - l - f), isNaN(o) && (o = i - c - u - d), e.left || e.right) {
		case "center":
			a = r / 2 - l / 2 - n[3];
			break;
		case "right": a = r - l - f;
	}
	switch (e.top || e.bottom) {
		case "middle":
		case "center":
			o = i / 2 - u / 2 - n[0];
			break;
		case "bottom": o = i - u - d;
	}
	a ||= 0, o ||= 0, isNaN(l) && (l = r - f - a - (s || 0)), isNaN(u) && (u = i - d - o - (c || 0));
	var m = new Y((t.x || 0) + a + n[3], (t.y || 0) + o + n[0], l, u);
	return m.margin = n, m;
}
function wy(e, t, n) {
	var r, i, a, o = e.boxCoordinateSystem, s;
	if (o) {
		var c = h_(e), l = c.coord, u = c.from;
		if (o.dataToLayout) {
			a = Ny.rect, s = u;
			var d = o.dataToLayout(l);
			r = d.contentRect || d.rect;
		} else n && n.enableLayoutOnlyByCenter && o.dataToPoint && (a = Ny.point, s = u, i = o.dataToPoint(l));
	}
	return a ??= Ny.rect, a === Ny.rect && (r ||= {
		x: 0,
		y: 0,
		width: t.getWidth(),
		height: t.getHeight()
	}, i = [r.x + r.width / 2, r.y + r.height / 2]), {
		type: a,
		refContainer: r,
		refPoint: i,
		boxCoordFrom: s
	};
}
function Ty(e) {
	var t = e.layoutMode || e.constructor.layoutMode;
	return W(t) ? t : t ? { type: t } : null;
}
function Ey(e, t, n) {
	var r = n && n.ignoreSize;
	!V(r) && (r = [r, r]);
	var i = o(jy[0], 0), a = o(jy[1], 1);
	c(jy[0], e, i), c(jy[1], e, a);
	function o(n, i) {
		var a = {}, o = 0, c = {}, l = 0, u = 2;
		if (ky(n, function(t) {
			c[t] = e[t];
		}), ky(n, function(e) {
			At(t, e) && (a[e] = c[e] = t[e]), s(a, e) && o++, s(c, e) && l++;
		}), r[i]) return s(t, n[1]) ? c[n[2]] = null : s(t, n[2]) && (c[n[1]] = null), c;
		if (l === u || !o) return c;
		if (o >= u) return a;
		for (var d = 0; d < n.length; d++) {
			var f = n[d];
			if (!At(a, f) && At(e, f)) {
				a[f] = e[f];
				break;
			}
		}
		return a;
	}
	function s(e, t) {
		return e[t] != null && e[t] !== "auto";
	}
	function c(e, t, n) {
		ky(e, function(e) {
			t[e] = n[e];
		});
	}
}
function Dy(e) {
	return Oy({}, e);
}
function Oy(e, t) {
	return t && e && ky(Ay, function(n) {
		At(t, n) && (e[n] = t[n]);
	}), e;
}
var ky, Ay, jy, My, Ny, Py = M((() => {
	q(), Dr(), X(), by(), S_(), ky = z, Ay = [
		"left",
		"right",
		"top",
		"bottom",
		"width",
		"height"
	], jy = [[
		"width",
		"left",
		"right"
	], [
		"height",
		"top",
		"bottom"
	]], My = xy, lt(xy, "vertical"), lt(xy, "horizontal"), Ny = {
		rect: 1,
		point: 2
	};
}));
//#endregion
//#region node_modules/echarts/lib/model/Component.js
function Fy(e) {
	var t = [];
	return z(Ly.getClassesByMainType(e), function(e) {
		t = t.concat(e.dependencies || e.prototype.dependencies || []);
	}), t = B(t, function(e) {
		return en(e).main;
	}), e !== "dataset" && R(t, "dataset") <= 0 && t.unshift("dataset"), t;
}
var Iy, Ly, Ry = M((() => {
	F(), q(), Ch(), W_(), hn(), Z(), Py(), Iy = Yl(), Ly = function(e) {
		P(t, e);
		function t(t, n, r) {
			var i = e.call(this, t, n, r) || this;
			return i.uid = z_("ec_cpt_model"), i;
		}
		return t.prototype.init = function(e, t, n) {
			this.mergeDefaultAndTheme(e, n);
		}, t.prototype.mergeDefaultAndTheme = function(e, t) {
			var n = Ty(this), r = n ? Dy(e) : {};
			Qe(e, t.getTheme().get(this.mainType)), Qe(e, this.getDefaultOption()), n && Ey(e, r, n);
		}, t.prototype.mergeOption = function(e, t) {
			Qe(this.option, e, !0);
			var n = Ty(this);
			n && Ey(this.option, e, n);
		}, t.prototype.optionUpdated = function(e, t) {}, t.prototype.getDefaultOption = function() {
			var e = this.constructor;
			if (!nn(e)) return e.defaultOption;
			var t = Iy(this);
			if (!t.defaultOption) {
				for (var n = [], r = e; r;) {
					var i = r.prototype.defaultOption;
					i && n.push(i), r = r.superClass;
				}
				for (var a = {}, o = n.length - 1; o >= 0; o--) a = Qe(a, n[o], !0);
				t.defaultOption = a;
			}
			return t.defaultOption;
		}, t.prototype.getReferringComponents = function(e, t) {
			var n = e + "Index", r = e + "Id";
			return Ql(this.ecModel, e, {
				index: this.get(n, !0),
				id: this.get(r, !0)
			}, t);
		}, t.prototype.getBoxLayoutParams = function() {
			return Sy(this, !1);
		}, t.prototype.getZLevelKey = function() {
			return "";
		}, t.prototype.setZLevel = function(e) {
			this.option.zlevel = e;
		}, t.protoInitialize = function() {
			var e = t.prototype;
			e.type = "component", e.id = "", e.name = "", e.mainType = "", e.subType = "", e.componentIndex = 0;
		}(), t;
	}(Sh), on(Ly, Sh), un(Ly), B_(Ly), V_(Ly, Fy);
}));
//#endregion
//#region node_modules/echarts/lib/model/mixin/palette.js
function zy(e, t) {
	for (var n = e.length, r = 0; r < n; r++) if (e[r].length > t) return e[r];
	return e[n - 1];
}
function By(e, t, n, r, i, a, o) {
	a ||= e;
	var s = t(a), c = s.paletteIdx || 0, l = s.paletteNameMap = s.paletteNameMap || {};
	if (l.hasOwnProperty(i)) return l[i];
	var u = o == null || !r ? n : zy(r, o);
	if (u ||= n, u && u.length) {
		var d = u[c];
		return i && (l[i] = d), s.paletteIdx = (c + 1) % u.length, d;
	}
}
function Vy(e, t) {
	t(e).paletteIdx = 0, t(e).paletteNameMap = {};
}
var Hy, Uy, Wy = M((() => {
	Z(), Hy = Yl(), Yl(), Uy = function() {
		function e() {}
		return e.prototype.getColorFromPalette = function(e, t, n) {
			var r = Al(this.get("color", !0)), i = this.get("colorLayer", !0);
			return By(this, Hy, r, i, e, t, n);
		}, e.prototype.clearColorPalette = function() {
			Vy(this, Hy);
		}, e;
	}();
}));
//#endregion
//#region node_modules/echarts/lib/model/mixin/dataFormat.js
function Gy(e) {
	var t, n;
	return W(e) ? e.type && (n = e) : t = e, {
		text: t,
		frag: n
	};
}
var Ky, qy, Jy = M((() => {
	q(), mg(), by(), Ky = /\{@(.+?)\}/g, qy = function() {
		function e() {}
		return e.prototype.getDataParams = function(e, t) {
			var n = this.getData(t), r = this.getRawValue(e, t), i = n.getRawIndex(e), a = n.getName(e), o = n.getRawDataItem(e), s = n.getItemVisual(e, "style"), c = s && s[n.getItemVisual(e, "drawType") || "fill"], l = s && s.stroke, u = this.mainType, d = u === "series", f = n.userOutput && n.userOutput.get();
			return {
				componentType: u,
				componentSubType: this.subType,
				componentIndex: this.componentIndex,
				seriesType: d ? this.subType : null,
				seriesIndex: this.seriesIndex,
				seriesId: d ? this.id : null,
				seriesName: d ? this.name : null,
				name: a,
				dataIndex: i,
				data: o,
				dataType: t,
				value: r,
				color: c,
				borderColor: l,
				dimensionNames: f ? f.fullDimensions : null,
				encode: f ? f.encode : null,
				$vars: [
					"seriesName",
					"name",
					"value"
				]
			};
		}, e.prototype.getFormattedLabel = function(e, t, n, r, i, a) {
			t ||= "normal";
			var o = this.getData(n), s = this.getDataParams(e, n);
			if (a && (s.value = a.interpolatedValue), r != null && V(s.value) && (s.value = s.value[r]), i ||= o.getItemModel(e).get(t === "normal" ? ["label", "formatter"] : [
				t,
				"label",
				"formatter"
			]), H(i)) return s.status = t, s.dimensionIndex = r, i(s);
			if (U(i)) return my(i, s).replace(Ky, function(t, n) {
				var r = n.length, i = n;
				i.charAt(0) === "[" && i.charAt(r - 1) === "]" && (i = +i.slice(1, r - 1));
				var s = $h(o, e, i);
				if (a && V(a.interpolatedValue)) {
					var c = o.getDimensionIndex(i);
					c >= 0 && (s = a.interpolatedValue[c]);
				}
				return s == null ? "" : s + "";
			});
		}, e.prototype.getRawValue = function(e, t) {
			return $h(this.getData(t), e);
		}, e.prototype.formatTooltip = function(e, t, n) {}, e;
	}();
}));
//#endregion
//#region node_modules/echarts/lib/core/task.js
function Yy(e) {
	return new Xy(e);
}
var Xy, Zy, Qy = M((() => {
	q(), Xy = function() {
		function e(e) {
			e ||= {}, this._reset = e.reset, this._plan = e.plan, this._count = e.count, this._onDirty = e.onDirty, this._dirty = !0;
		}
		return e.prototype.perform = function(e) {
			var t = this._upstream, n = e && e.skip;
			if (this._dirty && t) {
				var r = this.context;
				r.data = r.outputData = t.context.outputData;
			}
			this.__pipeline && (this.__pipeline.currentTask = this);
			var i;
			this._plan && !n && (i = this._plan(this.context));
			var a = l(this._modBy), o = this._modDataCount || 0, s = l(e && e.modBy), c = e && e.modDataCount || 0;
			(a !== s || o !== c) && (i = "reset");
			function l(e) {
				return !(e >= 1) && (e = 1), e;
			}
			var u;
			(this._dirty || i === "reset") && (this._dirty = !1, u = this._doReset(n)), this._modBy = s, this._modDataCount = c;
			var d = e && e.step;
			if (this._dueEnd = t ? t._outputDueEnd : this._count ? this._count(this.context) : Infinity, this._progress) {
				var f = this._dueIndex, p = Math.min(d == null ? Infinity : this._dueIndex + d, this._dueEnd);
				if (!n && (u || f < p)) {
					var m = this._progress;
					if (V(m)) for (var h = 0; h < m.length; h++) this._doProgress(m[h], f, p, s, c);
					else this._doProgress(m, f, p, s, c);
				}
				this._dueIndex = p;
				var g = this._settedOutputEnd == null ? p : this._settedOutputEnd;
				this._outputDueEnd = g;
			} else this._dueIndex = this._outputDueEnd = this._settedOutputEnd == null ? this._dueEnd : this._settedOutputEnd;
			return this.unfinished();
		}, e.prototype.dirty = function() {
			this._dirty = !0, this._onDirty && this._onDirty(this.context);
		}, e.prototype._doProgress = function(e, t, n, r, i) {
			Zy.reset(t, n, r, i), this._callingProgress = e, this._callingProgress({
				start: t,
				end: n,
				count: n - t,
				next: Zy.next
			}, this.context);
		}, e.prototype._doReset = function(e) {
			this._dueIndex = this._outputDueEnd = this._dueEnd = 0, this._settedOutputEnd = null;
			var t, n;
			!e && this._reset && (t = this._reset(this.context), t && t.progress && (n = t.forceFirstProgress, t = t.progress), V(t) && !t.length && (t = null)), this._progress = t, this._modBy = this._modDataCount = null;
			var r = this._downstream;
			return r && r.dirty(), n;
		}, e.prototype.unfinished = function() {
			return this._progress && this._dueIndex < this._dueEnd;
		}, e.prototype.pipe = function(e) {
			(this._downstream !== e || this._dirty) && (this._downstream = e, e._upstream = this, e.dirty());
		}, e.prototype.dispose = function() {
			this._disposed ||= (this._upstream && (this._upstream._downstream = null), this._downstream && (this._downstream._upstream = null), this._dirty = !1, !0);
		}, e.prototype.getUpstream = function() {
			return this._upstream;
		}, e.prototype.getDownstream = function() {
			return this._downstream;
		}, e.prototype.setOutputEnd = function(e) {
			this._outputDueEnd = this._settedOutputEnd = e;
		}, e;
	}(), Zy = function() {
		var e, t, n, r, i, a = { reset: function(c, l, u, d) {
			t = c, e = l, n = u, r = d, i = Math.ceil(r / n), a.next = n > 1 && r > 0 ? s : o;
		} };
		return a;
		function o() {
			return t < e ? t++ : null;
		}
		function s() {
			var a = t % i * n + Math.ceil(t / i), o = t >= e ? null : a < r ? a : t;
			return t++, o;
		}
	}();
}));
//#endregion
//#region node_modules/echarts/lib/data/helper/transform.js
function $y(e, t) {
	var n = new cb(), r = e.data, i = n.sourceFormat = e.sourceFormat, a = e.startIndex;
	e.seriesLayoutBy !== "column" && wl("");
	var o = [], s = {}, c = e.dimensionsDefine;
	if (c) z(c, function(e, t) {
		var n = e.name, r = {
			index: t,
			name: n,
			displayName: e.displayName
		};
		o.push(r), n != null && (At(s, n) && wl(""), s[n] = r);
	});
	else for (var l = 0; l < e.dimensionsDetectedCount; l++) o.push({ index: l });
	var u = Yh(i, Fu);
	t.__isBuiltIn && (n.getRawDataItem = function(e) {
		return u(r, a, o, e);
	}, n.getRawData = Gt(eb, null, e)), n.cloneRawData = Gt(tb, null, e);
	var d = Xh(i, Fu);
	n.count = Gt(d, null, r, a, o);
	var f = Zh(i);
	n.retrieveValue = function(e, t) {
		return p(u(r, a, o, e), t);
	};
	var p = n.retrieveValueFromItem = function(e, t) {
		if (e != null) {
			var n = o[t];
			if (n) return f(e, t, n.name);
		}
	};
	return n.getDimensionInfo = Gt(nb, null, o, s), n.cloneAllDimensionInfo = Gt(rb, null, o), n;
}
function eb(e) {
	var t = e.sourceFormat;
	return sb(t) || wl(""), e.data;
}
function tb(e) {
	var t = e.sourceFormat, n = e.data;
	if (sb(t) || wl(""), t === "arrayRows") {
		for (var r = [], i = 0, a = n.length; i < a; i++) r.push(n[i].slice());
		return r;
	}
	if (t === "objectRows") {
		for (var r = [], i = 0, a = n.length; i < a; i++) r.push(L({}, n[i]));
		return r;
	}
}
function nb(e, t, n) {
	if (n != null) {
		if (dt(n) || !isNaN(n) && !At(t, n)) return e[n];
		if (At(t, n)) return t[n];
	}
}
function rb(e) {
	return I(e);
}
function ib(e) {
	e = I(e);
	var t = e.type, n = "";
	t || wl(n);
	var r = t.split(":");
	r.length !== 2 && wl(n);
	var i = !1;
	r[0] === "echarts" && (t = r[1], i = !0), e.__isBuiltIn = i, lb.set(t, e);
}
function ab(e, t, n) {
	var r = Al(e), i = r.length;
	i || wl("");
	for (var a = 0, o = i; a < o; a++) {
		var s = r[a];
		t = ob(s, t, n, i === 1 ? null : a), a !== o - 1 && (t.length = Math.max(t.length, 1));
	}
	return t;
}
function ob(e, t, n, r) {
	var i = "";
	t.length || wl(i), W(e) || wl(i);
	var a = e.type, o = lb.get(a);
	o || wl(i);
	var s = B(t, function(e) {
		return $y(e, o);
	});
	return B(Al(o.transform({
		upstream: s[0],
		upstreamList: s,
		config: I(e.config)
	})), function(e, n) {
		var r = "";
		W(e) || wl(r), e.data || wl(r), sb(Vh(e.data)) || wl(r);
		var i, a = t[0];
		if (a && n === 0 && !e.dimensions) {
			var o = a.startIndex;
			o && (e.data = a.data.slice(0, o).concat(e.data)), i = {
				seriesLayoutBy: Fu,
				sourceHeader: o,
				dimensions: a.metaRawOption.dimensions
			};
		} else i = {
			seriesLayoutBy: Fu,
			sourceHeader: 0,
			dimensions: e.dimensions
		};
		return Rh(e.data, i, null);
	});
}
function sb(e) {
	return e === "arrayRows" || e === "objectRows";
}
var cb, lb, ub = M((() => {
	Iu(), Z(), q(), mg(), Og(), Ol(), Jh(), cb = function() {
		function e() {}
		return e.prototype.getRawData = function() {
			throw Error("not supported");
		}, e.prototype.getRawDataItem = function(e) {
			throw Error("not supported");
		}, e.prototype.cloneRawData = function() {}, e.prototype.getDimensionInfo = function(e) {}, e.prototype.cloneAllDimensionInfo = function() {}, e.prototype.count = function() {}, e.prototype.retrieveValue = function(e, t) {}, e.prototype.retrieveValueFromItem = function(e, t) {}, e.prototype.convertValue = function(e, t) {
			return Cg(e, t);
		}, e;
	}(), lb = K();
}));
//#endregion
//#region node_modules/echarts/lib/data/helper/sourceManager.js
function db(e) {
	return e.mainType === "series";
}
function fb(e) {
	throw Error(e);
}
var pb, mb = M((() => {
	q(), Jh(), Iu(), Ih(), ub(), zg(), mg(), pb = function() {
		function e(e) {
			this._sourceList = [], this._storeList = [], this._upstreamSignList = [], this._versionSignBase = 0, this._dirty = !0, this._sourceHost = e;
		}
		return e.prototype.dirty = function() {
			this._setLocalSource([], []), this._storeList = [], this._dirty = !0;
		}, e.prototype._setLocalSource = function(e, t) {
			this._sourceList = e, this._upstreamSignList = t, this._versionSignBase++, this._versionSignBase > 9e10 && (this._versionSignBase = 0);
		}, e.prototype._getVersionSign = function() {
			return this._sourceHost.uid + "_" + this._versionSignBase;
		}, e.prototype.prepareSource = function() {
			this._isDirty() && (this._createSource(), this._dirty = !1);
		}, e.prototype._createSource = function() {
			this._setLocalSource([], []);
			var e = this._sourceHost, t = this._getUpstreamSourceManagers(), n = !!t.length, r, i;
			if (db(e)) {
				var a = e, o = void 0, s = void 0, c = void 0;
				if (n) {
					var l = t[0];
					l.prepareSource(), c = l.getSource(), o = c.data, s = c.sourceFormat, i = [l._getVersionSign()];
				} else o = a.get("data", !0), s = pt(o) ? Nu : ku, i = [];
				var u = this._getSourceMetaRawOption() || {}, d = c && c.metaRawOption || {}, f = G(u.seriesLayoutBy, d.seriesLayoutBy) || null, p = G(u.sourceHeader, d.sourceHeader), m = G(u.dimensions, d.dimensions);
				r = f !== d.seriesLayoutBy || !!p != !!d.sourceHeader || m ? [Rh(o, {
					seriesLayoutBy: f,
					sourceHeader: p,
					dimensions: m
				}, s)] : [];
			} else {
				var h = e;
				if (n) {
					var g = this._applyTransform(t);
					r = g.sourceList, i = g.upstreamSignList;
				} else r = [Rh(h.get("source", !0), this._getSourceMetaRawOption(), null)], i = [];
			}
			this._setLocalSource(r, i);
		}, e.prototype._applyTransform = function(e) {
			var t = this._sourceHost, n = t.get("transform", !0), r = t.get("fromTransformResult", !0);
			r != null && e.length !== 1 && fb("");
			var i, a = [], o = [];
			return z(e, function(e) {
				e.prepareSource();
				var t = e.getSource(r || 0);
				r != null && !t && fb(""), a.push(t), o.push(e._getVersionSign());
			}), n ? i = ab(n, a, { datasetIndex: t.componentIndex }) : r != null && (i = [Bh(a[0])]), {
				sourceList: i,
				upstreamSignList: o
			};
		}, e.prototype._isDirty = function() {
			if (this._dirty) return !0;
			for (var e = this._getUpstreamSourceManagers(), t = 0; t < e.length; t++) {
				var n = e[t];
				if (n._isDirty() || this._upstreamSignList[t] !== n._getVersionSign()) return !0;
			}
		}, e.prototype.getSource = function(e) {
			e ||= 0;
			var t = this._sourceList[e];
			if (!t) {
				var n = this._getUpstreamSourceManagers();
				return n[0] && n[0].getSource(e);
			}
			return t;
		}, e.prototype.getSharedDataStore = function(e) {
			var t = e.makeStoreSchema();
			return this._innerGetDataStore(t.dimensions, e.source, t.hash);
		}, e.prototype._innerGetDataStore = function(e, t, n) {
			var r = 0, i = this._storeList, a = i[r];
			a ||= i[r] = {};
			var o = a[n];
			if (!o) {
				var s = this._getUpstreamSourceManagers()[0];
				db(this._sourceHost) && s ? o = s._innerGetDataStore(e, t, n) : (o = new Rg(), o.initData(new og(t, e.length), e)), a[n] = o;
			}
			return o;
		}, e.prototype._getUpstreamSourceManagers = function() {
			var e = this._sourceHost;
			if (db(e)) {
				var t = Ah(e);
				return t ? [t.getSourceManager()] : [];
			}
			return B(jh(e), function(e) {
				return e.getSourceManager();
			});
		}, e.prototype._getSourceMetaRawOption = function() {
			var e = this._sourceHost, t, n, r;
			if (db(e)) t = e.get("seriesLayoutBy", !0), n = e.get("sourceHeader", !0), r = e.get("dimensions", !0);
			else if (!this._getUpstreamSourceManagers().length) {
				var i = e;
				t = i.get("seriesLayoutBy", !0), n = i.get("sourceHeader", !0), r = i.get("dimensions", !0);
			}
			return {
				seriesLayoutBy: t,
				sourceHeader: n,
				dimensions: r
			};
		}, e;
	}();
})), Q, hb, gb, _b = M((() => {
	for (var e in q(), Ea(), Q = {
		color: {},
		darkColor: {},
		size: {}
	}, hb = Q.color = {
		theme: [
			"#5070dd",
			"#b6d634",
			"#505372",
			"#ff994d",
			"#0ca8df",
			"#ffd10a",
			"#fb628b",
			"#785db0",
			"#3fbe95"
		],
		neutral00: "#fff",
		neutral05: "#f4f7fd",
		neutral10: "#e8ebf0",
		neutral15: "#dbdee4",
		neutral20: "#cfd2d7",
		neutral25: "#c3c5cb",
		neutral30: "#b7b9be",
		neutral35: "#aaacb2",
		neutral40: "#9ea0a5",
		neutral45: "#929399",
		neutral50: "#86878c",
		neutral55: "#797b7f",
		neutral60: "#6d6e73",
		neutral65: "#616266",
		neutral70: "#54555a",
		neutral75: "#48494d",
		neutral80: "#3c3c41",
		neutral85: "#303034",
		neutral90: "#232328",
		neutral95: "#17171b",
		neutral99: "#000",
		accent05: "#eff1f9",
		accent10: "#e0e4f2",
		accent15: "#d0d6ec",
		accent20: "#c0c9e6",
		accent25: "#b1bbdf",
		accent30: "#a1aed9",
		accent35: "#91a0d3",
		accent40: "#8292cc",
		accent45: "#7285c6",
		accent50: "#6578ba",
		accent55: "#5c6da9",
		accent60: "#536298",
		accent65: "#4a5787",
		accent70: "#404c76",
		accent75: "#374165",
		accent80: "#2e3654",
		accent85: "#252b43",
		accent90: "#1b2032",
		accent95: "#121521",
		transparent: "rgba(0,0,0,0)",
		highlight: "rgba(255,231,130,0.8)"
	}, L(hb, {
		primary: hb.neutral80,
		secondary: hb.neutral70,
		tertiary: hb.neutral60,
		quaternary: hb.neutral50,
		disabled: hb.neutral20,
		border: hb.neutral30,
		borderTint: hb.neutral20,
		borderShade: hb.neutral40,
		background: hb.neutral05,
		backgroundTint: "rgba(234,237,245,0.5)",
		backgroundTransparent: "rgba(255,255,255,0)",
		backgroundShade: hb.neutral10,
		shadow: "rgba(0,0,0,0.2)",
		shadowTint: "rgba(129,130,136,0.2)",
		axisLine: hb.neutral70,
		axisLineTint: hb.neutral40,
		axisTick: hb.neutral70,
		axisTickMinor: hb.neutral60,
		axisLabel: hb.neutral70,
		axisSplitLine: hb.neutral15,
		axisMinorSplitLine: hb.neutral05
	}), hb) hb.hasOwnProperty(e) && (gb = hb[e], e === "theme" ? Q.darkColor.theme = hb.theme.slice() : e === "highlight" ? Q.darkColor.highlight = "rgba(255,231,130,0.4)" : e.indexOf("accent") === 0 ? Q.darkColor[e] = va(gb, null, function(e) {
		return e * .5;
	}, function(e) {
		return Math.min(1, 1.3 - e);
	}) : Q.darkColor[e] = va(gb, null, function(e) {
		return e * .9;
	}, function(e) {
		return 1 - e ** 1.5;
	}));
	Q.size = {
		xxs: 2,
		xs: 5,
		s: 10,
		m: 15,
		l: 20,
		xl: 30,
		xxl: 40,
		xxxl: 50
	};
}));
//#endregion
//#region node_modules/echarts/lib/component/tooltip/tooltipMarkup.js
function vb(e) {
	var t = e.lineHeight;
	return t == null ? Fb : "line-height:" + tv(t + "") + "px";
}
function yb(e, t) {
	var n = e.color || Q.color.tertiary, r = e.fontSize || 12, i = e.fontWeight || "400", a = e.color || Q.color.secondary, o = e.fontSize || 14, s = e.fontWeight || "900";
	return t === "html" ? {
		nameStyle: "font-size:" + tv(r + "") + "px;color:" + tv(n) + ";font-weight:" + tv(i + ""),
		valueStyle: "font-size:" + tv(o + "") + "px;color:" + tv(a) + ";font-weight:" + tv(s + "")
	} : {
		nameStyle: {
			fontSize: r,
			fill: n,
			fontWeight: i
		},
		valueStyle: {
			fontSize: o,
			fill: a,
			fontWeight: s
		}
	};
}
function bb(e, t) {
	return t.type = e, t;
}
function xb(e) {
	return e.type === "section";
}
function Sb(e) {
	return xb(e) ? wb : Tb;
}
function Cb(e) {
	if (xb(e)) {
		var t = 0, n = e.blocks.length, r = n > 1 || n > 0 && !e.noHeader;
		return z(e.blocks, function(e) {
			var n = Cb(e);
			n >= t && (t = n + +(r && (!n || xb(e) && !e.noHeader)));
		}), t;
	}
	return 0;
}
function wb(e, t, n, r) {
	var i = t.noHeader, a = Db(Cb(t)), o = [], s = t.blocks || [];
	St(!s || V(s)), s ||= [];
	var c = e.orderMode;
	if (t.sortBlocks && c) {
		s = s.slice();
		var l = {
			valueAsc: "asc",
			valueDesc: "desc"
		};
		if (At(l, c)) {
			var u = new Dg(l[c], null);
			s.sort(function(e, t) {
				return u.evaluate(e.sortParam, t.sortParam);
			});
		} else c === "seriesDesc" && s.reverse();
	}
	z(s, function(n, i) {
		var s = t.valueFormatter, c = Sb(n)(s ? L(L({}, e), { valueFormatter: s }) : e, n, i > 0 ? a.html : 0, r);
		c != null && o.push(c);
	});
	var d = e.renderMode === "richText" ? o.join(a.richText) : Ob(r, o.join(""), i ? n : a.html);
	if (i) return d;
	var f = py(t.header, "ordinal", e.useUTC), p = yb(r, e.renderMode).nameStyle, m = vb(r);
	return e.renderMode === "richText" ? jb(e, f, p) + a.richText + d : Ob(r, "<div style=\"" + p + ";" + m + ";\">" + tv(f) + "</div>" + d, n);
}
function Tb(e, t, n, r) {
	var i = e.renderMode, a = t.noName, o = t.noValue, s = !t.markerType, c = t.name, l = e.useUTC, u = t.valueFormatter || e.valueFormatter || function(e) {
		return e = V(e) ? e : [e], B(e, function(e, t) {
			return py(e, V(p) ? p[t] : p, l);
		});
	};
	if (!(a && o)) {
		var d = s ? "" : e.markupStyleCreator.makeTooltipMarker(t.markerType, t.markerColor || Q.color.secondary, i), f = a ? "" : py(c, "ordinal", l), p = t.valueType, m = o ? [] : u(t.value, t.rawDataIndex), h = !s || !a, g = !s && a, _ = yb(r, i), v = _.nameStyle, y = _.valueStyle;
		return i === "richText" ? (s ? "" : d) + (a ? "" : jb(e, f, v)) + (o ? "" : Mb(e, m, h, g, y)) : Ob(r, (s ? "" : d) + (a ? "" : kb(f, !s, v)) + (o ? "" : Ab(m, h, g, y)), n);
	}
}
function Eb(e, t, n, r, i, a) {
	if (e) return Sb(e)({
		useUTC: i,
		renderMode: n,
		orderMode: r,
		markupStyleCreator: t,
		valueFormatter: e.valueFormatter
	}, e, 0, a);
}
function Db(e) {
	return {
		html: Ib[e],
		richText: Lb[e]
	};
}
function Ob(e, t, n) {
	var r = "<div style=\"clear:both\"></div>", i = "margin: " + n + "px 0 0", a = vb(e);
	return "<div style=\"" + i + ";" + a + ";\">" + t + r + "</div>";
}
function kb(e, t, n) {
	var r = t ? "margin-left:2px" : "";
	return "<span style=\"" + n + ";" + r + "\">" + tv(e) + "</span>";
}
function Ab(e, t, n, r) {
	var i = t ? "float:right;margin-left:" + (n ? "10px" : "20px") : "";
	return e = V(e) ? e : [e], "<span style=\"" + i + ";" + r + "\">" + B(e, function(e) {
		return tv(e);
	}).join("&nbsp;&nbsp;") + "</span>";
}
function jb(e, t, n) {
	return e.markupStyleCreator.wrapRichTextStyle(t, n);
}
function Mb(e, t, n, r, i) {
	var a = [i], o = r ? 10 : 20;
	return n && a.push({
		padding: [
			0,
			0,
			0,
			o
		],
		align: "right"
	}), e.markupStyleCreator.wrapRichTextStyle(V(t) ? t.join("  ") : t, a);
}
function Nb(e, t) {
	var n = e.getData().getItemVisual(t, "style")[e.visualDrawType];
	return gy(n);
}
function Pb(e, t) {
	return e.get("padding") ?? (t === "richText" ? [8, 10] : 10);
}
var Fb, Ib, Lb, Rb, zb = M((() => {
	by(), q(), Og(), X(), _b(), Fb = "line-height:1", Ib = [
		0,
		10,
		20,
		30
	], Lb = [
		"",
		"\n",
		"\n\n",
		"\n\n\n"
	], Rb = function() {
		function e() {
			this.richTextStyles = {}, this._nextStyleNameId = nl();
		}
		return e.prototype._generateStyleName = function() {
			return "__EC_aUTo_" + this._nextStyleNameId++;
		}, e.prototype.makeTooltipMarker = function(e, t, n) {
			var r = n === "richText" ? this._generateStyleName() : null, i = hy({
				color: t,
				type: e,
				renderMode: n,
				markerId: r
			});
			return U(i) ? i : (this.richTextStyles[r] = i.style, i.content);
		}, e.prototype.wrapRichTextStyle = function(e, t) {
			var n = {};
			V(t) ? z(t, function(e) {
				return L(n, e);
			}) : L(n, t);
			var r = this._generateStyleName();
			return this.richTextStyles[r] = n, "{" + r + "|" + e + "}";
		}, e;
	}();
}));
//#endregion
//#region node_modules/echarts/lib/component/tooltip/seriesFormatTooltip.js
function Bb(e) {
	var t = e.series, n = e.dataIndex, r = e.multipleSeries, i = t.getData(), a = i.mapDimensionsAll("defaultedTooltip"), o = a.length, s = t.getRawValue(n), c = V(s), l = Nb(t, n), u, d, f, p;
	if (o > 1 || c && !o) {
		var m = Vb(s, t, n, a, l);
		u = m.inlineValues, d = m.inlineValueTypes, f = m.blocks, p = m.inlineValues[0];
	} else if (o) {
		var h = i.getDimensionInfo(a[0]);
		p = u = $h(i, n, a[0]), d = h.type;
	} else p = u = c ? s[0] : s;
	var g = Wl(t), _ = g && t.name || "", v = i.getName(n), y = r ? _ : v;
	return bb("section", {
		header: _,
		noHeader: r || !g,
		sortParam: p,
		blocks: [bb("nameValue", {
			markerType: "item",
			markerColor: l,
			name: y,
			noName: !Ct(y),
			value: u,
			valueType: d,
			rawDataIndex: i.getRawIndex(n)
		})].concat(f || [])
	});
}
function Vb(e, t, n, r, i) {
	var a = t.getData(), o = it(e, function(e, t, n) {
		var r = a.getDimensionInfo(n);
		return e ||= r && r.tooltip !== !1 && r.displayName != null;
	}, !1), s = [], c = [], l = [];
	r.length ? z(r, function(e) {
		u($h(a, n, e), e);
	}) : z(e, u);
	function u(e, t) {
		var n = a.getDimensionInfo(t);
		n && n.otherDims.tooltip !== !1 && (o ? l.push(bb("nameValue", {
			markerType: "subItem",
			markerColor: i,
			name: n.displayName,
			value: e,
			valueType: n.type
		})) : (s.push(e), c.push(n.type)));
	}
	return {
		inlineValues: s,
		inlineValueTypes: c,
		blocks: l
	};
}
var Hb = M((() => {
	q(), zb(), mg(), Z();
}));
//#endregion
//#region node_modules/echarts/lib/model/Series.js
function Ub(e, t) {
	return e.getName(t) || e.getId(t);
}
function Wb(e) {
	var t = e.name;
	Wl(e) || (e.name = Gb(e) || t);
}
function Gb(e) {
	var t = e.getRawData(), n = t.mapDimensionsAll("seriesName"), r = [];
	return z(n, function(e) {
		var n = t.getDimensionInfo(e);
		n.displayName && r.push(n.displayName);
	}), r.join(" ");
}
function Kb(e) {
	return e.model.getRawData().count();
}
function qb(e) {
	var t = e.model;
	return t.setData(t.getRawData().cloneShallow()), Jb;
}
function Jb(e, t) {
	t.outputData && e.end > t.outputData.count() && t.model.getRawData().cloneShallow(t.outputData);
}
function Yb(e, t) {
	z(Dt(e.CHANGABLE_METHODS, e.DOWNSAMPLE_METHODS), function(n) {
		e.wrapMethod(n, lt(Xb, t));
	});
}
function Xb(e, t) {
	var n = Zb(e);
	return n && n.setOutputEnd((t || this).count()), t;
}
function Zb(e) {
	var t = (e.ecModel || {}).scheduler, n = t && t.getPipeline(e.uid);
	if (n) {
		var r = n.currentTask;
		if (r) {
			var i = r.agentStubMap;
			i && (r = i.get(e.uid));
		}
		return r;
	}
}
var Qb, $b, ex = M((() => {
	F(), q(), $t(), Z(), Ry(), Wy(), Jy(), Py(), Qy(), hn(), mb(), Hb(), Qb = Yl(), $b = function(e) {
		P(t, e);
		function t() {
			var t = e !== null && e.apply(this, arguments) || this;
			return t._selectedDataIndicesMap = {}, t;
		}
		return t.prototype.init = function(e, t, n) {
			this.seriesIndex = this.componentIndex, this.dataTask = Yy({
				count: Kb,
				reset: qb
			}), this.dataTask.context = { model: this }, this.mergeDefaultAndTheme(e, n), (Qb(this).sourceManager = new pb(this)).prepareSource();
			var r = this.getInitialData(e, n);
			Yb(r, this), this.dataTask.context.data = r, Qb(this).dataBeforeProcessed = r, Wb(this), this._initSelectedMapFromData(r);
		}, t.prototype.mergeDefaultAndTheme = function(e, t) {
			var n = Ty(this), r = n ? Dy(e) : {}, i = this.subType;
			Ly.hasClass(i) && (i += "Series"), Qe(e, t.getTheme().get(this.subType)), Qe(e, this.getDefaultOption()), jl(e, "label", ["show"]), this.fillDataTextStyle(e.data), n && Ey(e, r, n);
		}, t.prototype.mergeOption = function(e, t) {
			e = Qe(this.option, e, !0), this.fillDataTextStyle(e.data);
			var n = Ty(this);
			n && Ey(this.option, e, n);
			var r = Qb(this).sourceManager;
			r.dirty(), r.prepareSource();
			var i = this.getInitialData(e, t);
			Yb(i, this), this.dataTask.dirty(), this.dataTask.context.data = i, Qb(this).dataBeforeProcessed = i, Wb(this), this._initSelectedMapFromData(i);
		}, t.prototype.fillDataTextStyle = function(e) {
			if (e && !pt(e)) for (var t = ["show"], n = 0; n < e.length; n++) e[n] && e[n].label && jl(e[n], "label", t);
		}, t.prototype.getInitialData = function(e, t) {}, t.prototype.appendData = function(e) {
			this.getRawData().appendData(e.data);
		}, t.prototype.getData = function(e) {
			var t = Zb(this);
			if (t) {
				var n = t.context.data;
				return e == null || !n.getLinkedData ? n : n.getLinkedData(e);
			}
			return Qb(this).data;
		}, t.prototype.getAllData = function() {
			var e = this.getData();
			return e && e.getLinkedDataAll ? e.getLinkedDataAll() : [{ data: e }];
		}, t.prototype.setData = function(e) {
			var t = Zb(this);
			if (t) {
				var n = t.context;
				n.outputData = e, t !== this.dataTask && (n.data = e);
			}
			Qb(this).data = e;
		}, t.prototype.getEncode = function() {
			var e = this.get("encode", !0);
			if (e) return K(e);
		}, t.prototype.getSourceManager = function() {
			return Qb(this).sourceManager;
		}, t.prototype.getSource = function() {
			return this.getSourceManager().getSource();
		}, t.prototype.getRawData = function() {
			return Qb(this).dataBeforeProcessed;
		}, t.prototype.getColorBy = function() {
			return this.get("colorBy") || "series";
		}, t.prototype.isColorBySeries = function() {
			return this.getColorBy() === "series";
		}, t.prototype.getBaseAxis = function() {
			var e = this.coordinateSystem;
			return e && e.getBaseAxis && e.getBaseAxis();
		}, t.prototype.indicesOfNearest = function(e, t, n, r) {
			var i = this.getData(), a = this.coordinateSystem, o = a && a.getAxis(e);
			if (!a || !o) return [];
			var s = o.dataToCoord(n);
			r ??= Infinity;
			for (var c = [], l = Infinity, u = -1, d = 0, f = i.getDimensionIndex(t), p = i.getStore(), m = 0, h = p.count(); m < h; m++) {
				var g = p.get(f, m), _ = s - o.dataToCoord(g), v = Math.abs(_);
				v <= r && ((v < l || v === l && _ >= 0 && u < 0) && (l = v, u = _, d = 0), _ === u && (c[d++] = m));
			}
			return c.length = d, c;
		}, t.prototype.formatTooltip = function(e, t, n) {
			return Bb({
				series: this,
				dataIndex: e,
				multipleSeries: t
			});
		}, t.prototype.isAnimationEnabled = function() {
			var e = this.ecModel;
			if (J.node && !(e && e.ssr)) return !1;
			var t = this.getShallow("animation");
			return t && this.getData().count() > this.getShallow("animationThreshold") && (t = !1), !!t;
		}, t.prototype.restoreData = function() {
			this.dataTask.dirty();
		}, t.prototype.getColorFromPalette = function(e, t, n) {
			var r = this.ecModel, i = Uy.prototype.getColorFromPalette.call(this, e, t, n);
			return i ||= r.getColorFromPalette(e, t, n), i;
		}, t.prototype.coordDimToDataDim = function(e) {
			return this.getRawData().mapDimensionsAll(e);
		}, t.prototype.getProgressive = function() {
			return this.get("progressive");
		}, t.prototype.getProgressiveThreshold = function() {
			return this.get("progressiveThreshold");
		}, t.prototype.select = function(e, t) {
			this._innerSelect(this.getData(t), e);
		}, t.prototype.unselect = function(e, t) {
			var n = this.option.selectedMap;
			if (n) {
				var r = this.option.selectedMode, i = this.getData(t);
				if (r === "series" || n === "all") {
					this.option.selectedMap = {}, this._selectedDataIndicesMap = {};
					return;
				}
				for (var a = 0; a < e.length; a++) {
					var o = e[a], s = Ub(i, o);
					n[s] = !1, this._selectedDataIndicesMap[s] = -1;
				}
			}
		}, t.prototype.toggleSelect = function(e, t) {
			for (var n = [], r = 0; r < e.length; r++) n[0] = e[r], this.isSelected(e[r], t) ? this.unselect(n, t) : this.select(n, t);
		}, t.prototype.getSelectedDataIndices = function() {
			if (this.option.selectedMap === "all") return [].slice.call(this.getData().getIndices());
			for (var e = this._selectedDataIndicesMap, t = st(e), n = [], r = 0; r < t.length; r++) {
				var i = e[t[r]];
				i >= 0 && n.push(i);
			}
			return n;
		}, t.prototype.isSelected = function(e, t) {
			var n = this.option.selectedMap;
			if (!n) return !1;
			var r = this.getData(t);
			return (n === "all" || n[Ub(r, e)]) && !r.getItemModel(e).get(["select", "disabled"]);
		}, t.prototype.isUniversalTransitionEnabled = function() {
			if (this.__universalTransitionEnabled) return !0;
			var e = this.option.universalTransition;
			return e ? e === !0 || e && e.enabled : !1;
		}, t.prototype._innerSelect = function(e, t) {
			var n, r, i = this.option, a = i.selectedMode, o = t.length;
			if (a && o) {
				if (a === "series") i.selectedMap = "all";
				else if (a === "multiple") {
					W(i.selectedMap) || (i.selectedMap = {});
					for (var s = i.selectedMap, c = 0; c < o; c++) {
						var l = t[c], u = Ub(e, l);
						s[u] = !0, this._selectedDataIndicesMap[u] = e.getRawIndex(l);
					}
				} else if (a === "single" || a === !0) {
					var d = t[o - 1], u = Ub(e, d);
					i.selectedMap = (n = {}, n[u] = !0, n), this._selectedDataIndicesMap = (r = {}, r[u] = e.getRawIndex(d), r);
				}
			}
		}, t.prototype._initSelectedMapFromData = function(e) {
			if (!this.option.selectedMap) {
				var t = [];
				e.hasItemOption && e.each(function(n) {
					var r = e.getRawDataItem(n);
					r && r.selected && t.push(n);
				}), t.length > 0 && this._innerSelect(e, t);
			}
		}, t.registerClass = function(e) {
			return Ly.registerClass(e);
		}, t.protoInitialize = function() {
			var e = t.prototype;
			e.type = "series.__base__", e.seriesIndex = 0, e.ignoreStyleOnData = !1, e.hasSymbolVisual = !1, e.defaultSymbol = "circle", e.visualStyleAccessPath = "itemStyle", e.visualDrawType = "fill";
		}(), t;
	}(Ly), nt($b, qy), nt($b, Uy), on($b, Ly);
}));
//#endregion
//#region node_modules/echarts/lib/util/symbol.js
function tx(e, t) {
	if (this.type !== "image") {
		var n = this.style;
		this.__isEmptyBrush ? (n.stroke = e, n.fill = t || Q.color.neutral00, n.lineWidth = 2) : this.shape.symbolType === "line" ? n.stroke = e : n.fill = e, this.markRedraw();
	}
}
function nx(e, t, n, r, i, a, o) {
	var s = e.indexOf("empty") === 0;
	s && (e = e.substr(5, 1).toLowerCase() + e.substr(6));
	var c = e.indexOf("image://") === 0 ? rm(e.slice(8), new Y(t, n, r, i), o ? "center" : "cover") : e.indexOf("path://") === 0 ? nm(e.slice(7), {}, new Y(t, n, r, i), o ? "center" : "cover") : new fx({ shape: {
		symbolType: e,
		x: t,
		y: n,
		width: r,
		height: i
	} });
	return c.__isEmptyBrush = s, c.setColor = tx, a && c.setColor(a), c;
}
function rx(e) {
	return V(e) || (e = [+e, +e]), [e[0] || 0, e[1] || 0];
}
function ix(e, t) {
	if (e != null) return V(e) || (e = [e, e]), [yl(e[0], t[0]) || 0, yl(G(e[1], e[0]), t[1]) || 0];
}
var ax, ox, sx, cx, lx, ux, dx, fx, px = M((() => {
	q(), Gm(), Dr(), Hr(), X(), _b(), ax = Zs.extend({
		type: "triangle",
		shape: {
			cx: 0,
			cy: 0,
			width: 0,
			height: 0
		},
		buildPath: function(e, t) {
			var n = t.cx, r = t.cy, i = t.width / 2, a = t.height / 2;
			e.moveTo(n, r - a), e.lineTo(n + i, r + a), e.lineTo(n - i, r + a), e.closePath();
		}
	}), ox = Zs.extend({
		type: "diamond",
		shape: {
			cx: 0,
			cy: 0,
			width: 0,
			height: 0
		},
		buildPath: function(e, t) {
			var n = t.cx, r = t.cy, i = t.width / 2, a = t.height / 2;
			e.moveTo(n, r - a), e.lineTo(n + i, r), e.lineTo(n, r + a), e.lineTo(n - i, r), e.closePath();
		}
	}), sx = Zs.extend({
		type: "pin",
		shape: {
			x: 0,
			y: 0,
			width: 0,
			height: 0
		},
		buildPath: function(e, t) {
			var n = t.x, r = t.y, i = t.width / 5 * 3, a = Math.max(i, t.height), o = i / 2, s = o * o / (a - o), c = r - a + o + s, l = Math.asin(s / o), u = Math.cos(l) * o, d = Math.sin(l), f = Math.cos(l), p = o * .6, m = o * .7;
			e.moveTo(n - u, c + s), e.arc(n, c, o, Math.PI - l, Math.PI * 2 + l), e.bezierCurveTo(n + u - d * p, c + s + f * p, n, r - m, n, r), e.bezierCurveTo(n, r - m, n - u + d * p, c + s + f * p, n - u, c + s), e.closePath();
		}
	}), cx = Zs.extend({
		type: "arrow",
		shape: {
			x: 0,
			y: 0,
			width: 0,
			height: 0
		},
		buildPath: function(e, t) {
			var n = t.height, r = t.width, i = t.x, a = t.y, o = r / 3 * 2;
			e.moveTo(i, a), e.lineTo(i + o, a + n), e.lineTo(i, a + n / 4 * 3), e.lineTo(i - o, a + n), e.lineTo(i, a), e.closePath();
		}
	}), lx = {
		line: cp,
		rect: gc,
		roundRect: gc,
		square: gc,
		circle: Cf,
		diamond: ox,
		pin: sx,
		arrow: cx,
		triangle: ax
	}, ux = {
		line: function(e, t, n, r, i) {
			i.x1 = e, i.y1 = t + r / 2, i.x2 = e + n, i.y2 = t + r / 2;
		},
		rect: function(e, t, n, r, i) {
			i.x = e, i.y = t, i.width = n, i.height = r;
		},
		roundRect: function(e, t, n, r, i) {
			i.x = e, i.y = t, i.width = n, i.height = r, i.r = Math.min(n, r) / 4;
		},
		square: function(e, t, n, r, i) {
			var a = Math.min(n, r);
			i.x = e, i.y = t, i.width = a, i.height = a;
		},
		circle: function(e, t, n, r, i) {
			i.cx = e + n / 2, i.cy = t + r / 2, i.r = Math.min(n, r) / 2;
		},
		diamond: function(e, t, n, r, i) {
			i.cx = e + n / 2, i.cy = t + r / 2, i.width = n, i.height = r;
		},
		pin: function(e, t, n, r, i) {
			i.x = e + n / 2, i.y = t + r / 2, i.width = n, i.height = r;
		},
		arrow: function(e, t, n, r, i) {
			i.x = e + n / 2, i.y = t + r / 2, i.width = n, i.height = r;
		},
		triangle: function(e, t, n, r, i) {
			i.cx = e + n / 2, i.cy = t + r / 2, i.width = n, i.height = r;
		}
	}, dx = {}, z(lx, function(e, t) {
		dx[t] = new e();
	}), fx = Zs.extend({
		type: "symbol",
		shape: {
			symbolType: "",
			x: 0,
			y: 0,
			width: 0,
			height: 0
		},
		calculateTextPosition: function(e, t, n) {
			var r = Rr(e, t, n), i = this.shape;
			return i && i.symbolType === "pin" && t.position === "inside" && (r.y = n.y + n.height * .4), r;
		},
		buildPath: function(e, t, n) {
			var r = t.symbolType;
			if (r !== "none") {
				var i = dx[r];
				i ||= (r = "rect", dx[r]), ux[r](t.x, t.y, t.width, t.height, i.shape), i.buildPath(e, i.shape, n);
			}
		}
	});
})), mx, hx = M((() => {
	F(), R_(), ex(), px(), Gm(), _b(), mx = function(e) {
		P(t, e);
		function t() {
			var n = e !== null && e.apply(this, arguments) || this;
			return n.type = t.type, n.hasSymbolVisual = !0, n;
		}
		return t.prototype.getInitialData = function(e) {
			return F_(null, this, { useEncodeDefaulter: !0 });
		}, t.prototype.getLegendIcon = function(e) {
			var t = new bf(), n = nx("line", 0, e.itemHeight / 2, e.itemWidth, 0, e.lineStyle.stroke, !1);
			t.add(n), n.setStyle(e.lineStyle);
			var r = this.getData().getVisual("symbol"), i = this.getData().getVisual("symbolRotate"), a = r === "none" ? "circle" : r, o = e.itemHeight * .8, s = nx(a, (e.itemWidth - o) / 2, (e.itemHeight - o) / 2, o, o, e.itemStyle.fill);
			return t.add(s), s.setStyle(e.itemStyle), s.rotation = (e.iconRotate === "inherit" ? i : e.iconRotate || 0) * Math.PI / 180, s.setOrigin([e.itemWidth / 2, e.itemHeight / 2]), a.indexOf("empty") > -1 && (s.style.stroke = s.style.fill, s.style.fill = Q.color.neutral00, s.style.lineWidth = 2), t;
		}, t.type = "series.line", t.dependencies = ["grid", "polar"], t.defaultOption = {
			z: 3,
			coordinateSystem: "cartesian2d",
			legendHoverLink: !0,
			clip: !0,
			label: { position: "top" },
			endLabel: {
				show: !1,
				valueAnimation: !0,
				distance: 8
			},
			lineStyle: {
				width: 2,
				type: "solid"
			},
			emphasis: { scale: !0 },
			step: !1,
			smooth: !1,
			smoothMonotone: null,
			symbol: "emptyCircle",
			symbolSize: 6,
			symbolRotate: null,
			showSymbol: !0,
			showAllSymbol: "auto",
			connectNulls: !1,
			sampling: "none",
			animationEasing: "linear",
			progressive: 0,
			hoverLayerThreshold: Infinity,
			universalTransition: { divideShape: "clone" },
			triggerLineEvent: !1,
			triggerEvent: !1
		}, t;
	}($b);
}));
//#endregion
//#region node_modules/echarts/lib/chart/helper/labelHelper.js
function gx(e, t) {
	var n = e.mapDimensionsAll("defaultedLabel"), r = n.length;
	if (r === 1) {
		var i = $h(e, t, n[0]);
		return i == null ? null : i + "";
	}
	if (r) {
		for (var a = [], o = 0; o < n.length; o++) a.push($h(e, t, n[o]));
		return a.join(" ");
	}
}
function _x(e, t) {
	var n = e.mapDimensionsAll("defaultedLabel");
	if (!V(t)) return t + "";
	for (var r = [], i = 0; i < n.length; i++) {
		var a = e.getDimensionIndex(n[i]);
		a >= 0 && r.push(t[a]);
	}
	return r.join(" ");
}
var vx = M((() => {
	mg(), q();
}));
//#endregion
//#region node_modules/echarts/lib/chart/helper/Symbol.js
function yx(e, t) {
	this.parent.drift(e, t);
}
var bx, xx = M((() => {
	F(), px(), Gm(), Du(), Jd(), vx(), q(), ch(), oc(), Xp(), bx = function(e) {
		P(t, e);
		function t(t, n, r, i) {
			var a = e.call(this) || this;
			return a.updateData(t, n, r, i), a;
		}
		return t.prototype._createSymbol = function(e, t, n, r, i, a) {
			this.removeAll();
			var o = nx(e, -1, -1, 2, 2, null, a);
			o.attr({
				z2: G(i, 100),
				culling: !0,
				scaleX: r[0] / 2,
				scaleY: r[1] / 2
			}), o.drift = yx, this._symbolType = e, this.add(o);
		}, t.prototype.stopSymbolAnimation = function(e) {
			this.childAt(0).stopAnimation(null, e);
		}, t.prototype.getSymbolType = function() {
			return this._symbolType;
		}, t.prototype.getSymbolPath = function() {
			return this.childAt(0);
		}, t.prototype.highlight = function() {
			od(this.childAt(0));
		}, t.prototype.downplay = function() {
			sd(this.childAt(0));
		}, t.prototype.setZ = function(e, t) {
			var n = this.childAt(0);
			n.zlevel = e, n.z = t;
		}, t.prototype.setDraggable = function(e, t) {
			var n = this.childAt(0);
			n.draggable = e, n.cursor = !t && e ? "move" : n.cursor;
		}, t.prototype.updateData = function(e, n, r, i) {
			this.silent = !1;
			var a = e.getItemVisual(n, "symbol") || "circle", o = e.hostModel, s = t.getSymbolSize(e, n), c = t.getSymbolZ2(e, n), l = a !== this._symbolType, u = i && i.disableAnimation;
			if (l) {
				var d = e.getItemVisual(n, "symbolKeepAspect");
				this._createSymbol(a, e, n, s, c, d);
			} else {
				var f = this.childAt(0);
				f.silent = !1;
				var p = {
					scaleX: s[0] / 2,
					scaleY: s[1] / 2
				};
				u ? f.attr(p) : Hp(f, p, o, n), Jp(f);
			}
			if (this._updateCommon(e, n, s, r, i), l) {
				var f = this.childAt(0);
				if (!u) {
					var p = {
						scaleX: this._sizeX,
						scaleY: this._sizeY,
						style: { opacity: f.style.opacity }
					};
					f.scaleX = f.scaleY = 0, f.style.opacity = 0, Up(f, p, o, n);
				}
			}
			u && this.childAt(0).stopAnimation("leave");
		}, t.prototype._updateCommon = function(e, t, n, r, i) {
			var a = this.childAt(0), o = e.hostModel, s, c, l, u, d, f, p, m, h;
			if (r && (s = r.emphasisItemStyle, c = r.blurItemStyle, l = r.selectItemStyle, u = r.focus, d = r.blurScope, p = r.labelStatesModels, m = r.hoverScale, h = r.cursorStyle, f = r.emphasisDisabled), !r || e.hasItemOption) {
				var g = r && r.itemModel ? r.itemModel : e.getItemModel(t), _ = g.getModel("emphasis");
				s = _.getModel("itemStyle").getItemStyle(), l = g.getModel(["select", "itemStyle"]).getItemStyle(), c = g.getModel(["blur", "itemStyle"]).getItemStyle(), u = _.get("focus"), d = _.get("blurScope"), f = _.get("disabled"), p = Ym(g), m = _.getShallow("scale"), h = g.getShallow("cursor");
			}
			var v = e.getItemVisual(t, "symbolRotate");
			a.attr("rotation", (v || 0) * Math.PI / 180 || 0);
			var y = ix(e.getItemVisual(t, "symbolOffset"), n);
			y && (a.x = y[0], a.y = y[1]), h && a.attr("cursor", h);
			var b = e.getItemVisual(t, "style"), x = b.fill;
			if (a instanceof ac) {
				var S = a.style;
				a.useStyle(L({
					image: S.image,
					x: S.x,
					y: S.y,
					width: S.width,
					height: S.height
				}, b));
			} else a.__isEmptyBrush ? a.useStyle(L({}, b)) : a.useStyle(b), a.style.decal = null, a.setColor(x, i && i.symbolInnerColor), a.style.strokeNoScale = !0;
			var C = e.getItemVisual(t, "liftZ"), w = this._z2;
			C == null ? w != null && (a.z2 = w, this._z2 = null) : w ?? (this._z2 = a.z2, a.z2 += C);
			var T = i && i.useNameLabel;
			Jm(a, p, {
				labelFetcher: o,
				labelDataIndex: t,
				defaultText: E,
				inheritColor: x,
				defaultOpacity: b.opacity
			});
			function E(t) {
				return T ? e.getName(t) : gx(e, t);
			}
			this._sizeX = n[0] / 2, this._sizeY = n[1] / 2;
			var D = a.ensureState("emphasis");
			D.style = s, a.ensureState("select").style = l, a.ensureState("blur").style = c;
			var O = m == null || m === !0 ? Math.max(1.1, 3 / this._sizeY) : isFinite(m) && m > 0 ? +m : 1;
			D.scaleX = this._sizeX * O, D.scaleY = this._sizeY * O, this.setSymbolScale(1), Td(this, u, d, f);
		}, t.prototype.setSymbolScale = function(e) {
			this.scaleX = this.scaleY = e;
		}, t.prototype.fadeOut = function(e, t, n) {
			var r = this.childAt(0), i = Tu(this).dataIndex, a = n && n.animation;
			if (this.silent = r.silent = !0, n && n.fadeLabel) {
				var o = r.getTextContent();
				o && Gp(o, { style: { opacity: 0 } }, t, {
					dataIndex: i,
					removeOpt: a,
					cb: function() {
						r.removeTextContent();
					}
				});
			} else r.removeTextContent();
			Gp(r, {
				style: { opacity: 0 },
				scaleX: 0,
				scaleY: 0
			}, t, {
				dataIndex: i,
				cb: e,
				removeOpt: a
			});
		}, t.getSymbolSize = function(e, t) {
			return rx(e.getItemVisual(t, "symbolSize"));
		}, t.getSymbolZ2 = function(e, t) {
			return e.getItemVisual(t, "z2");
		}, t;
	}(bf);
}));
//#endregion
//#region node_modules/echarts/lib/chart/helper/SymbolDraw.js
function Sx(e, t, n, r) {
	return t && !isNaN(t[0]) && !isNaN(t[1]) && !(r && r.isIgnore && r.isIgnore(n)) && !(r && r.clipShape && !r.clipShape.contain(t[0], t[1])) && e.getItemVisual(n, "symbol") !== "none";
}
function Cx(e) {
	return e != null && !W(e) && (e = { isIgnore: e }), e || {};
}
function Tx(e) {
	var t = e.hostModel, n = t.getModel("emphasis");
	return {
		emphasisItemStyle: n.getModel("itemStyle").getItemStyle(),
		blurItemStyle: t.getModel(["blur", "itemStyle"]).getItemStyle(),
		selectItemStyle: t.getModel(["select", "itemStyle"]).getItemStyle(),
		focus: n.get("focus"),
		blurScope: n.get("blurScope"),
		emphasisDisabled: n.get("disabled"),
		hoverScale: n.get("scale"),
		labelStatesModels: Ym(t),
		cursorStyle: t.get("cursor")
	};
}
function Ex(e, t, n, r, i, a, o) {
	var s = new e(t, n, r, i);
	return s.setPosition(a), t.setItemGraphicEl(n, s), o.add(s), s;
}
var Dx, Ox = M((() => {
	Gm(), xx(), q(), ch(), Dx = function() {
		function e(e) {
			this.group = new bf(), this._SymbolCtor = e || bx;
		}
		return e.prototype.updateData = function(e, t) {
			this._progressiveEls = null, t = Cx(t);
			var n = this.group, r = e.hostModel, i = this._data, a = this._SymbolCtor, o = t.disableAnimation, s = this._seriesScope = Tx(e), c = { disableAnimation: o }, l = t.getSymbolPoint || function(t) {
				return e.getItemLayout(t);
			};
			i || n.removeAll(), e.diff(i).add(function(r) {
				var i = l(r);
				Sx(e, i, r, t) && Ex(a, e, r, s, c, i, n);
			}).update(function(u, d) {
				var f = i.getItemGraphicEl(d), p = l(u);
				if (!Sx(e, p, u, t)) {
					n.remove(f);
					return;
				}
				var m = e.getItemVisual(u, "symbol") || "circle", h = f && f.getSymbolType && f.getSymbolType();
				if (!f || h && h !== m) n.remove(f), f = new a(e, u, s, c), f.setPosition(p);
				else {
					f.updateData(e, u, s, c);
					var g = {
						x: p[0],
						y: p[1]
					};
					o ? f.attr(g) : Hp(f, g, r);
				}
				n.add(f), e.setItemGraphicEl(u, f);
			}).remove(function(e) {
				var t = i.getItemGraphicEl(e);
				t && t.fadeOut(function() {
					n.remove(t);
				}, r);
			}).execute(), this._getSymbolPoint = l, this._data = e;
		}, e.prototype.updateLayout = function(e) {
			var t = this._data;
			if (t) for (var n = this, r = t.getStore(), i = 0, a = r.count(); i < a; i++) {
				var o = t.getItemGraphicEl(i), s = n._getSymbolPoint(i);
				Sx(t, s, i, e) ? (o ||= Ex(n._SymbolCtor, t, i, n._seriesScope, { disableAnimation: !0 }, s, n.group), o.stopAnimation(), o.setPosition(s), o.markRedraw()) : o && (n.group.remove(o), t.setItemGraphicEl(i, null));
			}
		}, e.prototype.incrementalPrepareUpdate = function(e) {
			this._seriesScope = Tx(e), this._data = null, this.group.removeAll();
		}, e.prototype.incrementalUpdate = function(e, t, n, r) {
			this._progressiveEls = [], r = Cx(r);
			function i(e) {
				e.isGroup || (e.incremental = n, e.ensureState("emphasis").hoverLayer = 2);
			}
			for (var a = e.start; a < e.end; a++) {
				var o = t.getItemLayout(a);
				if (Sx(t, o, a, r)) {
					var s = new this._SymbolCtor(t, a, this._seriesScope);
					s.traverse(i), s.setPosition(o), this.group.add(s), t.setItemGraphicEl(a, s), this._progressiveEls.push(s);
				}
			}
		}, e.prototype.eachRendered = function(e) {
			Tm(this._progressiveEls || this.group, e);
		}, e.prototype.remove = function(e) {
			var t = this.group, n = this._data;
			n && e ? n.eachItemGraphicEl(function(e) {
				e.fadeOut(function() {
					t.remove(e);
				}, n.hostModel);
			}) : t.removeAll();
		}, e;
	}();
}));
//#endregion
//#region node_modules/echarts/lib/chart/line/helper.js
function kx(e, t, n) {
	var r = e.getBaseAxis(), i = e.getOtherAxis(r), a = Ax(i, n), o = r.dim, s = i.dim, c = t.mapDimension(s), l = t.mapDimension(o), u = +(s === "x" || s === "radius"), d = B(e.dimensions, function(e) {
		return t.mapDimension(e);
	}), f = !1, p = t.getCalculationInfo("stackResultDimension");
	return A_(t, d[0]) && (f = !0, d[0] = p), A_(t, d[1]) && (f = !0, d[1] = p), {
		dataDimsForPoint: d,
		valueStart: a,
		valueAxisDim: s,
		baseAxisDim: o,
		stacked: !!f,
		valueDim: c,
		baseDim: l,
		baseDataOffset: u,
		stackedOverDimension: t.getCalculationInfo("stackedOverDimension")
	};
}
function Ax(e, t) {
	var n = 0, r = e.scale.getExtent();
	return t === "start" ? n = r[0] : t === "end" ? n = r[1] : dt(t) && !isNaN(t) ? n = t : r[0] > 0 ? n = r[0] : r[1] < 0 && (n = r[1]), n;
}
function jx(e, t, n, r) {
	var i = NaN;
	e.stacked && (i = n.get(n.getCalculationInfo("stackedOverDimension"), r)), isNaN(i) && (i = e.valueStart);
	var a = e.baseDataOffset, o = [];
	return o[a] = n.get(e.baseDim, r), o[1 - a] = i, t.dataToPoint(o);
}
function Mx(e, t) {
	return !isFinite(e) || !isFinite(t);
}
var Nx = M((() => {
	M_(), q();
}));
//#endregion
//#region node_modules/echarts/lib/util/vendor.js
function Px(e) {
	return Fx({ ctor: Ix }, e).arr;
}
function Fx(e, t) {
	var n = e.arr, r = e.ctor;
	if (t > bl && (t = bl), !n || e.typed && n.length < t) {
		var i = void 0;
		if (r) try {
			i = new r(t), e.typed = !0, n && i.set(n);
		} catch {}
		if (!i && (i = [], e.typed = !1, n)) for (var a = 0, o = n.length; a < o; a++) i[a] = n[a];
		e.arr = i;
	}
	return e;
}
var Ix, Lx = M((() => {
	Iu(), X(), Ix = typeof Float32Array < "u" ? Float32Array : void 0;
}));
//#endregion
//#region node_modules/echarts/lib/chart/line/lineAnimationDiff.js
function Rx(e, t) {
	var n = [];
	return t.diff(e).add(function(e) {
		n.push({
			cmd: "+",
			idx: e
		});
	}).update(function(e, t) {
		n.push({
			cmd: "=",
			idx: t,
			idx1: e
		});
	}).remove(function(e) {
		n.push({
			cmd: "-",
			idx: e
		});
	}).execute(), n;
}
function zx(e, t, n, r, i, a, o, s) {
	for (var c = Rx(e, t), l = [], u = [], d = [], f = [], p = [], m = [], h = [], g = kx(i, t, o), _ = e.getLayout("points") || [], v = t.getLayout("points") || [], y = 0; y < c.length; y++) {
		var b = c[y], x = !0, S = void 0, C = void 0;
		switch (b.cmd) {
			case "=":
				S = b.idx * 2, C = b.idx1 * 2;
				var w = _[S], T = _[S + 1], E = v[C], D = v[C + 1];
				(isNaN(w) || isNaN(T)) && (w = E, T = D), l.push(w, T), u.push(E, D), d.push(n[S], n[S + 1]), f.push(r[C], r[C + 1]), h.push(t.getRawIndex(b.idx1));
				break;
			case "+":
				var O = b.idx, k = g.dataDimsForPoint, A = i.dataToPoint([t.get(k[0], O), t.get(k[1], O)]);
				C = O * 2, l.push(A[0], A[1]), u.push(v[C], v[C + 1]);
				var j = jx(g, i, t, O);
				d.push(j[0], j[1]), f.push(r[C], r[C + 1]), h.push(t.getRawIndex(O));
				break;
			case "-": x = !1;
		}
		x && (p.push(b), m.push(m.length));
	}
	m.sort(function(e, t) {
		return h[e] - h[t];
	});
	for (var ee = l.length, te = Px(ee), ne = Px(ee), re = Px(ee), ie = Px(ee), ae = [], y = 0; y < m.length; y++) {
		var oe = m[y], se = y * 2, M = oe * 2;
		te[se] = l[M], te[se + 1] = l[M + 1], ne[se] = u[M], ne[se + 1] = u[M + 1], re[se] = d[M], re[se + 1] = d[M + 1], ie[se] = f[M], ie[se + 1] = f[M + 1], ae[y] = p[oe];
	}
	return {
		current: te,
		next: ne,
		stackedOnCurrent: re,
		stackedOnNext: ie,
		status: ae
	};
}
var Bx = M((() => {
	Nx(), Lx();
}));
//#endregion
//#region node_modules/echarts/lib/chart/line/poly.js
function Vx(e, t, n, r, i, a, o, s, c) {
	for (var l, u, d, f, p, m, h = n, g = 0; g < r; g++) {
		var _ = t[h * 2], v = t[h * 2 + 1];
		if (h >= i || h < 0) break;
		if (Mx(_, v)) {
			if (c) {
				h += a;
				continue;
			}
			break;
		}
		if (h === n) e[a > 0 ? "moveTo" : "lineTo"](_, v), d = _, f = v;
		else {
			var y = _ - l, b = v - u;
			if (y * y + b * b < .5) {
				h += a;
				continue;
			}
			if (o > 0) {
				for (var x = h + a, S = t[x * 2], C = t[x * 2 + 1]; S === _ && C === v && g < r;) g++, x += a, h += a, S = t[x * 2], C = t[x * 2 + 1], _ = t[h * 2], v = t[h * 2 + 1], y = _ - l, b = v - u;
				var w = g + 1;
				if (c) for (; Mx(S, C) && w < r;) w++, x += a, S = t[x * 2], C = t[x * 2 + 1];
				var T = .5, E = 0, D = 0, O = void 0, k = void 0;
				if (w >= r || Mx(S, C)) p = _, m = v;
				else {
					E = S - l, D = C - u;
					var A = _ - l, j = S - _, ee = v - u, te = C - v, ne = void 0, re = void 0;
					if (s === "x") {
						ne = Math.abs(A), re = Math.abs(j);
						var ie = E > 0 ? 1 : -1;
						p = _ - ie * ne * o, m = v, O = _ + ie * re * o, k = v;
					} else if (s === "y") {
						ne = Math.abs(ee), re = Math.abs(te);
						var ae = D > 0 ? 1 : -1;
						p = _, m = v - ae * ne * o, O = _, k = v + ae * re * o;
					} else ne = Math.sqrt(A * A + ee * ee), re = Math.sqrt(j * j + te * te), T = re / (re + ne), p = _ - E * o * (1 - T), m = v - D * o * (1 - T), O = _ + E * o * T, k = v + D * o * T, O = Hx(O, Ux(S, _)), k = Hx(k, Ux(C, v)), O = Ux(O, Hx(S, _)), k = Ux(k, Hx(C, v)), E = O - _, D = k - v, p = _ - E * ne / re, m = v - D * ne / re, p = Hx(p, Ux(l, _)), m = Hx(m, Ux(u, v)), p = Ux(p, Hx(l, _)), m = Ux(m, Hx(u, v)), E = _ - p, D = v - m, O = _ + E * re / ne, k = v + D * re / ne;
				}
				e.bezierCurveTo(d, f, p, m, _, v), d = O, f = k;
			} else e.lineTo(_, v);
		}
		l = _, u = v, h += a;
	}
	return g;
}
var Hx, Ux, Wx, Gx, Kx, qx, Jx = M((() => {
	F(), Qs(), ys(), Zi(), _b(), Nx(), Hx = Math.min, Ux = Math.max, Wx = function() {
		function e() {
			this.smooth = 0, this.smoothConstraint = !0;
		}
		return e;
	}(), Gx = function(e) {
		P(t, e);
		function t(t) {
			var n = e.call(this, t) || this;
			return n.type = "ec-polyline", n;
		}
		return t.prototype.getDefaultStyle = function() {
			return {
				stroke: Q.color.neutral99,
				fill: null
			};
		}, t.prototype.getDefaultShape = function() {
			return new Wx();
		}, t.prototype.buildPath = function(e, t) {
			var n = t.points, r = 0, i = n.length / 2;
			if (t.connectNulls) {
				for (; i > 0 && Mx(n[i * 2 - 2], n[i * 2 - 1]); i--);
				for (; r < i && Mx(n[r * 2], n[r * 2 + 1]); r++);
			}
			for (; r < i;) r += Vx(e, n, r, i, i, 1, t.smooth, t.smoothMonotone, t.connectNulls) + 1;
		}, t.prototype.getPointOn = function(e, t) {
			this.path || (this.createPathProxy(), this.buildPath(this.path, this.shape));
			for (var n = this.path.data, r = vs.CMD, i, a, o = t === "x", s = [], c = 0; c < n.length;) {
				var l = n[c++], u = void 0, d = void 0, f = void 0, p = void 0, m = void 0, h = void 0, g = void 0;
				switch (l) {
					case r.M:
						i = n[c++], a = n[c++];
						break;
					case r.L:
						if (u = n[c++], d = n[c++], g = o ? (e - i) / (u - i) : (e - a) / (d - a), g <= 1 && g >= 0) {
							var _ = o ? (d - a) * g + a : (u - i) * g + i;
							return o ? [e, _] : [_, e];
						}
						i = u, a = d;
						break;
					case r.C:
						u = n[c++], d = n[c++], f = n[c++], p = n[c++], m = n[c++], h = n[c++];
						var v = o ? Ai(i, u, f, m, e, s) : Ai(a, d, p, h, e, s);
						if (v > 0) for (var y = 0; y < v; y++) {
							var b = s[y];
							if (b <= 1 && b >= 0) {
								var _ = o ? Oi(a, d, p, h, b) : Oi(i, u, f, m, b);
								return o ? [e, _] : [_, e];
							}
						}
						i = m, a = h;
				}
			}
		}, t;
	}(Zs), Kx = function(e) {
		P(t, e);
		function t() {
			return e !== null && e.apply(this, arguments) || this;
		}
		return t;
	}(Wx), qx = function(e) {
		P(t, e);
		function t(t) {
			var n = e.call(this, t) || this;
			return n.type = "ec-polygon", n;
		}
		return t.prototype.getDefaultShape = function() {
			return new Kx();
		}, t.prototype.buildPath = function(e, t) {
			var n = t.points, r = t.stackedOnPoints, i = 0, a = n.length / 2, o = t.smoothMonotone;
			if (t.connectNulls) {
				for (; a > 0 && Mx(n[a * 2 - 2], n[a * 2 - 1]); a--);
				for (; i < a && Mx(n[i * 2], n[i * 2 + 1]); i++);
			}
			for (; i < a;) {
				var s = Vx(e, n, i, a, a, 1, t.smooth, o, t.connectNulls);
				Vx(e, r, i + s - 1, s, a, -1, t.stackedOnSmooth, o, t.connectNulls), i += s + 1, e.closePath();
			}
		}, t;
	}(Zs);
}));
//#endregion
//#region node_modules/echarts/lib/chart/helper/createRenderPlanner.js
function Yx() {
	var e = Yl();
	return function(t) {
		var n = e(t), r = t.pipelineContext, i = !!n.large, a = !!n.progressiveRender, o = n.large = !!(r && r.large), s = n.progressiveRender = !!(r && r.progressiveRender);
		return (i !== o || a !== s) && "reset";
	};
}
var Xx = M((() => {
	Z();
}));
//#endregion
//#region node_modules/echarts/lib/view/Chart.js
function Zx(e, t, n) {
	e && kd(e) && (t === "emphasis" ? od : sd)(e, n);
}
function Qx(e, t, n) {
	var r = Jl(e, t), i = t && t.highlightKey != null ? Ad(t.highlightKey) : null;
	r == null ? e.eachItemGraphicEl(function(e) {
		Zx(e, n, i);
	}) : z(Al(r), function(t) {
		Zx(e.getItemGraphicEl(t), n, i);
	});
}
function $x(e) {
	return nS(e.model);
}
function eS(e) {
	var t = e.model, n = e.ecModel, r = e.api, i = e.payload, a = t.pipelineContext.progressiveRender, o = e.view, s = i && tS(i).updateMethod, c = a ? "incrementalPrepareRender" : s && o[s] ? s : "render";
	return c !== "render" && o[c](t, n, r, i), iS[c];
}
var tS, nS, rS, iS, aS = M((() => {
	q(), xf(), W_(), hn(), Z(), Jd(), Qy(), Xx(), Gm(), tS = Yl(), nS = Yx(), rS = function() {
		function e() {
			this.group = new bf(), this.uid = z_("viewChart"), this.renderTask = Yy({
				plan: $x,
				reset: eS
			}), this.renderTask.context = { view: this };
		}
		return e.prototype.init = function(e, t) {}, e.prototype.render = function(e, t, n, r) {}, e.prototype.highlight = function(e, t, n, r) {
			var i = e.getData(r && r.dataType);
			i && Qx(i, r, "emphasis");
		}, e.prototype.downplay = function(e, t, n, r) {
			var i = e.getData(r && r.dataType);
			i && Qx(i, r, "normal");
		}, e.prototype.remove = function(e, t) {
			this.group.removeAll();
		}, e.prototype.dispose = function(e, t) {}, e.prototype.updateView = function(e, t, n, r) {
			this.render(e, t, n, r);
		}, e.prototype.updateVisual = function(e, t, n, r) {
			this.render(e, t, n, r);
		}, e.prototype.eachRendered = function(e) {
			Tm(this.group, e);
		}, e.markUpdateMethod = function(e, t) {
			tS(e).updateMethod = t;
		}, e.protoInitialize = function() {
			var t = e.prototype;
			t.type = "chart";
		}(), e;
	}(), rn(rS, ["dispose"]), un(rS), iS = {
		incrementalPrepareRender: { progress: function(e, t) {
			t.view.incrementalRender(e, t.model, t.ecModel, t.api, t.payload);
		} },
		render: {
			forceFirstProgress: !0,
			progress: function(e, t) {
				t.view.render(t.model, t.ecModel, t.api, t.payload);
			}
		}
	};
}));
//#endregion
//#region node_modules/echarts/lib/chart/helper/createClipPathFromCoordSys.js
function oS(e, t, n, r, i) {
	var a = e.getArea(), o = a.x, s = a.y, c = a.width, l = a.height, u = n.get(["lineStyle", "width"]) || 0;
	o -= u / 2, s -= u / 2, c += u, l += u, c = Math.ceil(c), o !== Math.floor(o) && (o = Math.floor(o), c++);
	var d = new gc({ shape: {
		x: o,
		y: s,
		width: c,
		height: l
	} });
	if (t) {
		var f = e.getBaseAxis(), p = f.isHorizontal(), m = f.inverse;
		p ? (m && (d.shape.x += c), d.shape.width = 0) : (m || (d.shape.y += l), d.shape.height = 0);
		var h = H(i) ? function(e) {
			i(e, d);
		} : null;
		Up(d, { shape: {
			width: c,
			height: l,
			x: o,
			y: s
		} }, n, null, r, h);
	}
	return d;
}
function sS(e, t, n) {
	var r = e.getArea(), i = Hc(r.r0, 1), a = Hc(r.r, 1), o = new Gf({ shape: {
		cx: Hc(e.cx, 1),
		cy: Hc(e.cy, 1),
		r0: i,
		r: a,
		startAngle: r.startAngle,
		endAngle: r.endAngle,
		clockwise: r.clockwise
	} });
	return t && (e.getBaseAxis().dim === "angle" ? o.shape.endAngle = r.startAngle : o.shape.r = i, Up(o, { shape: {
		endAngle: r.endAngle,
		r: a
	} }, n)), o;
}
var cS = M((() => {
	Gm(), X(), q();
}));
//#endregion
//#region node_modules/echarts/lib/coord/CoordinateSystem.js
function lS(e, t) {
	return e.type === t;
}
var uS = M((() => {})), dS, fS = M((() => {
	hn(), dS = function() {
		function e() {}
		return e.prototype.isBlank = function() {
			return this._isBlank;
		}, e.prototype.setBlank = function(e) {
			this._isBlank = e;
		}, e;
	}(), un(dS);
}));
//#endregion
//#region node_modules/echarts/lib/data/OrdinalMeta.js
function pS(e) {
	return W(e) && e.value != null ? e.value : e + "";
}
var mS, hS, gS = M((() => {
	q(), mS = 0, hS = function() {
		function e(e) {
			this.categories = e.categories || [], this._needCollect = e.needCollect, this._deduplication = e.deduplication, this.uid = ++mS, this._onCollect = e.onCollect;
		}
		return e.createByAxisModel = function(t) {
			var n = t.option, r = n.data, i = r && B(r, pS);
			return new e({
				categories: i,
				needCollect: !i,
				deduplication: n.dedplication !== !1
			});
		}, e.prototype.getOrdinal = function(e) {
			return this._getOrCreateMap().get(e);
		}, e.prototype.parseAndCollect = function(e) {
			var t, n = this._needCollect;
			if (!U(e) && !n) return e;
			if (n && !this._deduplication) return t = this.categories.length, this.categories[t] = e, this._onCollect && this._onCollect(e, t), t;
			var r = this._getOrCreateMap();
			return t = r.get(e), t ?? (n ? (t = this.categories.length, this.categories[t] = e, r.set(e, t), this._onCollect && this._onCollect(e, t)) : t = NaN), t;
		}, e.prototype._getOrCreateMap = function() {
			return this._map ||= K(this.categories);
		}, e;
	}();
}));
//#endregion
//#region node_modules/echarts/lib/scale/scaleMapper.js
function _S(e, t, n) {
	var r;
	e ||= {};
	var i = Sv();
	if (i) {
		var a = i.createBreakScaleMapper(t, n);
		a.hasBreaks() && (z(ES, function(t) {
			a[t] && (e[t] = Gt(a[t], a));
		}), r = a);
	}
	return r ?? wS(e, n), {
		brk: r,
		mapper: e
	};
}
function vS(e, t) {
	z(ES, function(n) {
		e[n] = t[n];
	});
}
function yS(e, t) {
	e.freeze = jt;
}
function bS(e) {
	return e.getExtentUnsafe(0, 2);
}
function xS(e, t) {
	return e.getExtentUnsafe(1, t) || e.getExtentUnsafe(0, t);
}
function SS(e) {
	var t = xS(e, 3);
	return t[1] - t[0];
}
function CS(e) {
	var t = e.getExtentUnsafe(0, 3);
	return t[1] - t[0];
}
function wS(e, t) {
	var n = e || {}, r = [];
	return n._extents = r, r[0] = t ? t.slice() : iu(), L(n, DS), n;
}
function TS(e, t, n, r) {
	uu(n, r) && (e[t][0] = n, e[t][1] = r);
}
var ES, DS, OS = M((() => {
	q(), Z(), Dv(), ES = st({
		needTransform: 1,
		normalize: 1,
		scale: 1,
		transformIn: 1,
		transformOut: 1,
		contain: 1,
		getExtent: 1,
		getExtentUnsafe: 1,
		setExtent: 1,
		setExtent2: 1,
		getFilter: 1,
		sanitize: 1,
		getDefaultStartValue: 1,
		freeze: 1
	}), DS = {
		needTransform: function() {
			return !1;
		},
		normalize: function(e) {
			var t = this._extents[1] || this._extents[0];
			return t[1] === t[0] ? .5 : (e - t[0]) / (t[1] - t[0]);
		},
		scale: function(e) {
			var t = this._extents[1] || this._extents[0];
			return e * (t[1] - t[0]) + t[0];
		},
		transformIn: function(e) {
			return e;
		},
		transformOut: function(e) {
			return e;
		},
		contain: function(e) {
			var t = xS(this, null);
			return e >= t[0] && e <= t[1];
		},
		getExtent: function() {
			return this._extents[0].slice();
		},
		getExtentUnsafe: function(e) {
			return this._extents[e];
		},
		setExtent: function(e, t) {
			TS(this._extents, 0, e, t);
		},
		setExtent2: function(e, t, n) {
			var r = this._extents;
			r[e] || (r[e] = r[0].slice()), TS(r, e, t, n);
		},
		freeze: function() {}
	};
}));
//#endregion
//#region node_modules/echarts/lib/scale/helper.js
function kS(e) {
	return AS(e) || MS(e);
}
function AS(e) {
	return e.type === "interval";
}
function jS(e) {
	return e.type === "time";
}
function MS(e) {
	return e.type === "log";
}
function NS(e) {
	return e.type === "ordinal";
}
function PS(e) {
	var t = Qc(e), n = ml(10, t), r = dl(e / n);
	return r ? r === 2 ? r = 3 : r === 3 ? r = 5 : r *= 2 : r = 1, Hc(r * n, -t);
}
function FS(e) {
	return Wc(e) + 2;
}
function IS(e, t) {
	return hl(e) / hl(t);
}
function LS(e, t, n) {
	var r = n && n.lookup;
	if (r) {
		for (var i = 0; i < r.from.length; i++) if (e === r.from[i]) return r.to[i];
	}
	return ml(t, e);
}
function RS(e, t, n) {
	var r = e.slice();
	if (r[0] === r[1]) {
		var i = n && n.ctnShp;
		if (r[0] !== 0) {
			var a = ul(r[0]);
			t[1] || (r[1] += a / 2), r[0] -= a / 2;
		} else i && (r[0] = -1), r[1] = 1;
	}
	return (!lu(r[0]) || !lu(r[1])) && (r[0] = 0, r[1] = 1), r[1] < r[0] && r.reverse(), r;
}
function zS(e, t) {
	return [e[0] !== t[0], e[1] !== t[1]];
}
function BS(e, t) {
	return e ||= t, dl(ll(e, 1));
}
function VS(e, t, n) {
	var r = bS(e), i = r[0], a = e.count(), o = Math.max((t || 0) + 1, 1);
	i !== 0 && o > 1 && a / o > 2 && (i = Math.round(Math.ceil(i / o) * o)), i !== r[0] && c(r[0], !0, !0);
	for (var s = i; s <= r[1]; s += o) c(s, !1, s === r[0] || s === r[1]);
	s - o !== r[1] && c(r[1], !0, !0);
	function c(e, t, r) {
		n({
			value: e,
			offInterval: t
		}, r);
	}
}
var HS = M((() => {
	X(), Z(), OS();
})), US, WS = M((() => {
	F(), fS(), gS(), q(), X(), OS(), HS(), US = function(e) {
		P(t, e);
		function t(n) {
			var r = e.call(this) || this;
			r.type = "ordinal", r.parse = t.parse, vS(r, t.decoratedMethods);
			var i = n.ordinalMeta;
			i ||= new hS({}), V(i) && (i = new hS({ categories: B(i, function(e) {
				return W(e) ? e.value : e;
			}) })), r._ordinalMeta = i;
			var a = _S(null, null, n.extent || [0, i.categories.length - 1]);
			return r._mapper = a.mapper, yS(r, a.mapper), r;
		}
		return t.parse = function(e) {
			return e == null ? e = NaN : U(e) ? (e = this._ordinalMeta.getOrdinal(e), e ??= NaN) : e = dl(e), e;
		}, t.prototype.getTicks = function() {
			var e = [];
			return VS(this, 0, function(t) {
				e.push(t);
			}), e;
		}, t.prototype.getMinorTicks = function(e) {}, t.prototype.setSortInfo = function(e) {
			if (e == null) {
				this._ordinalNumbersByTick = this._ticksByOrdinalNumber = null;
				return;
			}
			for (var t = e.ordinalNumbers, n = this._ordinalNumbersByTick = [], r = this._ticksByOrdinalNumber = [], i = 0, a = this._ordinalMeta.categories.length, o = cl(a, t.length); i < o; ++i) {
				var s = n[i] = t[i];
				r[s] = i;
			}
			for (var c = 0; i < a; ++i) {
				for (; r[c] != null;) c++;
				n[i] = c, r[c] = i;
			}
		}, t.prototype._getTickNumber = function(e) {
			var t = this._ticksByOrdinalNumber;
			return t && e >= 0 && e < t.length ? t[e] : e;
		}, t.prototype.getRawOrdinalNumber = function(e) {
			var t = this._ordinalNumbersByTick;
			return t && e >= 0 && e < t.length ? t[e] : e;
		}, t.prototype.getLabel = function(e) {
			if (!this.isBlank()) {
				var t = this.getRawOrdinalNumber(e.value), n = this._ordinalMeta.categories[t];
				return n == null ? "" : n + "";
			}
		}, t.prototype.count = function() {
			var e = bS(this._mapper);
			return e[1] - e[0] + 1;
		}, t.prototype.getOrdinalMeta = function() {
			return this._ordinalMeta;
		}, t.type = "ordinal", t.decoratedMethods = {
			needTransform: function() {
				return this._mapper.needTransform();
			},
			contain: function(e) {
				return this._mapper.contain(this._getTickNumber(e)) && e >= 0 && e < this._ordinalMeta.categories.length;
			},
			normalize: function(e) {
				return this._mapper.normalize(this._getTickNumber(e));
			},
			scale: function(e) {
				return this.getRawOrdinalNumber(dl(this._mapper.scale(e)));
			},
			transformIn: function(e, t) {
				return this._mapper.transformIn(this._getTickNumber(e), t);
			},
			transformOut: function(e, t) {
				return this.getRawOrdinalNumber(this._mapper.transformOut(e, t));
			},
			getExtent: function() {
				return this._mapper.getExtent();
			},
			getExtentUnsafe: function(e, t) {
				return this._mapper.getExtentUnsafe(e, t);
			},
			setExtent: function(e, t) {
				return this._mapper.setExtent(e, t);
			},
			setExtent2: function(e, t, n) {
				return this._mapper.setExtent2(e, t, n);
			}
		}, t;
	}(dS), dS.registerClass(US);
}));
//#endregion
//#region node_modules/echarts/lib/scale/minorTicks.js
function GS(e, t, n, r) {
	for (var i = e.getTicks({ expandToNicedExtent: !0 }), a = [], o = e.getExtent(), s = 1; s < i.length; s++) {
		var c = i[s], l = i[s - 1];
		if (!(l.break || c.break)) {
			for (var u = 0, d = [], f = (c.value - l.value) / t, p = FS(f); u < t - 1;) {
				var m = Hc(l.value + (u + 1) * f, p);
				m > o[0] && m < o[1] && d.push(m), u++;
			}
			var h = Sv();
			h && h.pruneTicksByBreak("auto", d, n, function(e) {
				return e;
			}, r, o), a.push(d);
		}
	}
	return a;
}
var KS = M((() => {
	X(), Dv(), HS();
})), qS, JS = M((() => {
	F(), X(), by(), fS(), HS(), Dv(), q(), KS(), OS(), qS = function(e) {
		P(t, e);
		function t(n) {
			var r = e.call(this) || this;
			return r.type = "interval", r.parse = t.parse, n ||= {}, r.brk = _S(r, Cv(r, n), null).brk, r._cfg = {
				interval: 0,
				intervalPrecision: 2,
				intervalCount: void 0,
				niceExtent: void 0
			}, r;
		}
		return t.parse = function(e) {
			return e == null || e === "" ? NaN : Number(e);
		}, t.prototype.getConfig = function() {
			return I(this._cfg);
		}, t.prototype.setConfig = function(e) {
			var t = bS(this);
			this._cfg = e = I(e), e.niceExtent ?? (e.niceExtent = t.slice()), e.intervalPrecision ?? (e.intervalPrecision = FS(e.interval));
		}, t.prototype.getTicks = function(e) {
			e ||= {};
			var t = this._cfg, n = t.interval, r = bS(this), i = t.niceExtent, a = t.intervalPrecision, o = Sv(), s = this.brk, c = o && s, l = [];
			if (!n) return l;
			if (e.breakTicks === "only_break" && c) return o.addBreaksToTicks(l, s.breaks, r), l;
			var u = 3e3;
			r[0] < i[0] && l.push({ value: e.expandToNicedExtent ? Hc(i[0] - n, a) : r[0] });
			for (var d = function(e, t) {
				return dl((t - e) / n);
			}, f = t.intervalCount, p = i[0], m = 0;; m++) {
				if (f == null) {
					if (p > i[1] || !isFinite(p) || !isFinite(i[1])) break;
				} else {
					if (m > f) break;
					p = cl(p, i[1]), m === f && (p = i[1]);
				}
				if (l.push({ value: p }), p = Hc(p + n, a), s) {
					var h = s.calcNiceTickMultiple(p, d);
					h >= 0 && (p = Hc(p + h * n, a));
				}
				if (l.length > 0 && p === l[l.length - 1].value) break;
				if (l.length > u) return [];
			}
			var g = l.length ? l[l.length - 1].value : i[1];
			return r[1] > g && l.push({ value: e.expandToNicedExtent ? Hc(g + n, a) : r[1] }), c && o.pruneTicksByBreak(e.pruneByBreak, l, s.breaks, function(e) {
				return e.value;
			}, t.interval, r), c && e.breakTicks !== "none" && o.addBreaksToTicks(l, s.breaks, r), l;
		}, t.prototype.getMinorTicks = function(e) {
			return GS(this, e, wv(this), this._cfg.interval);
		}, t.prototype.getLabel = function(e, t) {
			if (e == null) return "";
			var n = t && t.precision;
			return n == null ? n = Wc(e.value) || 0 : n === "auto" && (n = this._cfg.intervalPrecision), dy(Hc(e.value, n, !0));
		}, t.type = "interval", t;
	}(dS), dS.registerClass(qS);
}));
//#endregion
//#region node_modules/echarts/lib/scale/Time.js
function YS(e, t, n, r) {
	return Lv(new Date(t), e, r).getTime() === Lv(new Date(n), e, r).getTime();
}
function XS(e, t) {
	return e /= ty, e > 16 ? 16 : e > 7.5 ? 7 : e > 3.5 ? 4 : e > 1.5 ? 2 : 1;
}
function ZS(e) {
	var t = 30 * ty;
	return e /= t, e > 6 ? 6 : e > 3 ? 3 : e > 2 ? 2 : 1;
}
function QS(e) {
	return e /= ey, e > 12 ? 12 : e > 6 ? 6 : e > 3.5 ? 4 : e > 2 ? 2 : 1;
}
function $S(e, t) {
	return e /= t ? $v : Qv, e > 30 ? 30 : e > 20 ? 20 : e > 15 ? 15 : e > 10 ? 10 : e > 5 ? 5 : e > 2 ? 2 : 1;
}
function eC(e) {
	return ll($c(e, !0), 1);
}
function tC(e, t, n) {
	var r = Math.max(0, R(cy, t) - 1);
	return Lv(new Date(e), cy[r], n).getTime();
}
function nC(e, t) {
	var n = /* @__PURE__ */ new Date(0);
	n[e](1);
	var r = n.getTime();
	n[e](1 + t);
	var i = n.getTime() - r;
	return function(e, t) {
		return Math.max(0, Math.round((t - e) / i));
	};
}
function rC(e, t, n, r, i, a) {
	var o = ly, s = 0;
	function c(e, t, n, i, o, c, l) {
		for (var u = nC(o, e), d = t, f = new Date(d); d < n && d <= r[1] && (l.push({ value: d }), !(s++ > 3e3));) if (f[o](f[i]() + e), d = f.getTime(), a) {
			var p = a.calcNiceTickMultiple(d, u);
			p > 0 && (f[o](f[i]() + p * e), d = f.getTime());
		}
		l.push({
			value: d,
			notAdd: d > r[1]
		});
	}
	function l(e, i, a) {
		var o = [], s = !i.length;
		if (!YS(jv(e), r[0], r[1], n)) {
			s && (i = [{ value: tC(r[0], e, n) }, { value: r[1] }]);
			for (var l = 0; l < i.length - 1; l++) {
				var u = i[l].value, d = i[l + 1].value;
				if (u !== d) {
					var f = void 0, p = void 0, m = void 0, h = !1;
					switch (e) {
						case "year":
							f = Math.max(1, Math.round(t / ty / 365)), p = Rv(n), m = Gv(n);
							break;
						case "half-year":
						case "quarter":
						case "month":
							f = ZS(t), p = zv(n), m = Kv(n);
							break;
						case "week":
						case "half-week":
						case "day":
							f = XS(t, 31), p = Bv(n), m = qv(n), h = !0;
							break;
						case "half-day":
						case "quarter-day":
						case "hour":
							f = QS(t), p = Vv(n), m = Jv(n);
							break;
						case "minute":
							f = $S(t, !0), p = Hv(n), m = Yv(n);
							break;
						case "second":
							f = $S(t, !1), p = Uv(n), m = Xv(n);
							break;
						case "millisecond": f = eC(t), p = Wv(n), m = Zv(n);
					}
					d >= r[0] && u <= r[1] && c(f, u, d, p, m, h, o), e === "year" && a.length > 1 && l === 0 && a.unshift({ value: a[0].value - f });
				}
			}
			for (var l = 0; l < o.length; l++) a.push(o[l]);
		}
	}
	for (var u = [], d = [], f = 0, p = 0, m = 0; m < o.length; ++m) {
		var h = jv(o[m]);
		if (Mv(o[m]) && (l(o[m], u[u.length - 1] || [], d), h !== (o[m + 1] ? jv(o[m + 1]) : null))) {
			if (d.length) {
				p = f, d.sort(function(e, t) {
					return e.value - t.value;
				});
				for (var g = [], _ = 0; _ < d.length; ++_) {
					var v = d[_].value;
					(_ === 0 || d[_ - 1].value !== v) && (g.push(d[_]), v >= r[0] && v <= r[1] && f++);
				}
				var y = i / t;
				if (f > y * 1.5 && p > y / 1.5 || (u.push(g), f > y || e === o[m])) break;
			}
			d = [];
		}
	}
	for (var b = at(B(u, function(e) {
		return at(e, function(e) {
			return e.value >= r[0] && e.value <= r[1] && !e.notAdd;
		});
	}), function(e) {
		return e.length > 0;
	}), x = b.length - 1, S = [], m = 0; m < b.length; ++m) for (var C = b[m], w = 0; w < C.length; ++w) {
		var T = Iv(C[w].value, n);
		S.push({
			value: C[w].value,
			time: {
				level: x - m,
				upperTimeUnit: T,
				lowerTimeUnit: T
			}
		});
	}
	mu(S, hu, null), S.sort(function(e, t) {
		return e.value - t.value;
	});
	var E = S[0], D = S[S.length - 1], O = Iv(r[0], n), k = Iv(r[1], n);
	return (!E || E.value > r[0]) && S.unshift({
		value: r[0],
		time: {
			level: 0,
			upperTimeUnit: O,
			lowerTimeUnit: O
		},
		notNice: !0
	}), (!D || D.value < r[1]) && S.push({
		value: r[1],
		time: {
			level: 0,
			upperTimeUnit: k,
			lowerTimeUnit: k
		},
		notNice: !0
	}), S;
}
var iC, aC, oC, sC, cC = M((() => {
	F(), X(), uy(), HS(), fS(), q(), Dv(), KS(), OS(), Z(), iC = function(e, t, n, r) {
		for (; n < r;) {
			var i = n + r >>> 1;
			e[i][1] < t ? n = i + 1 : r = i;
		}
		return n;
	}, aC = function(e) {
		P(t, e);
		function t(n) {
			var r = e.call(this) || this;
			return r.type = "time", r.parse = t.parse, r._locale = n.locale, r._useUTC = n.useUTC, r._interval = 0, r.brk = _S(r, Cv(r, n), null).brk, r;
		}
		return t.prototype.getLabel = function(e) {
			return Pv(e.value, sy[Nv(jv(this._minLevelUnit))] || sy.second, this._useUTC, this._locale);
		}, t.prototype.getFormattedLabel = function(e, t, n) {
			return Fv(e, t, n, this._locale, this._useUTC);
		}, t.prototype.getTicks = function(e) {
			e ||= {};
			var t = this._interval, n = bS(this), r = Sv(), i = this.brk, a = r && i, o = [];
			if (!t) return o;
			var s = this._useUTC;
			if (a && e.breakTicks === "only_break") return Sv().addBreaksToTicks(o, i.breaks, n), o;
			o = rC(this._minLevelUnit, this._approxInterval, s, n, CS(this), i);
			var c = cy.length - 1, l = 0;
			return z(o, function(e) {
				e.time && (c = Math.min(c, R(cy, e.time.upperTimeUnit)), l = Math.max(l, e.time.level));
			}), a && Sv().pruneTicksByBreak(e.pruneByBreak, o, i.breaks, function(e) {
				return e.value;
			}, this._approxInterval, n), a && e.breakTicks !== "none" && Sv().addBreaksToTicks(o, i.breaks, n, function(e) {
				for (var t = Math.max(R(cy, Iv(e.vmin, s)), R(cy, Iv(e.vmax, s))), n = 0, r = 0; r < cy.length; r++) if (!YS(cy[r], e.vmin, e.vmax, s)) {
					n = r;
					break;
				}
				var i = Math.min(n, c);
				return {
					level: l,
					lowerTimeUnit: cy[Math.max(i, t)],
					upperTimeUnit: cy[i]
				};
			}), o;
		}, t.prototype.getMinorTicks = function(e) {
			return GS(this, e, wv(this), this._interval);
		}, t.prototype.setTimeInterval = function(e) {
			this._interval = e.interval, this._approxInterval = e.approxInterval, this._minLevelUnit = e.minLevelUnit;
		}, t.parse = function(e) {
			return dt(e) ? Math.round(e) : +Xc(e);
		}, t.type = "time", t;
	}(dS), oC = [
		["second", Qv],
		["minute", $v],
		["hour", ey],
		["quarter-day", ey * 6],
		["half-day", ey * 12],
		["day", ty * 1.2],
		["half-week", ty * 3.5],
		["week", ty * 7],
		["month", ty * 31],
		["quarter", ty * 95],
		["half-year", ny / 2],
		["year", ny]
	], sC = function(e, t) {
		var n = e.getExtent();
		if (n[0] === n[1] && (n[0] -= ty, n[1] += ty), n[1] === -Infinity && n[0] === Infinity) {
			var r = /* @__PURE__ */ new Date();
			n[1] = +new Date(r.getFullYear(), r.getMonth(), r.getDate()), n[0] = n[1] - ty;
		}
		e.setExtent(n[0], n[1]);
		var i = BS(t.splitNumber, 10), a = CS(e) / i, o = t.minInterval, s = t.maxInterval;
		o != null && a < o && (a = o), s != null && a > s && (a = s);
		var c = oC.length, l = Math.min(iC(oC, a, 0, c), c - 1), u = oC[l][1], d = oC[Math.max(l - 1, 0)][0];
		e.setTimeInterval({
			approxInterval: a,
			interval: u,
			minLevelUnit: d
		});
	}, dS.registerClass(aC);
})), lC, uC, dC, fC, pC, mC, hC, gC = M((() => {
	F(), fS(), JS(), HS(), Dv(), KS(), OS(), q(), Z(), X(), lC = 0, uC = 1, dC = 2, fC = function(e) {
		P(t, e);
		function t(n) {
			var r = e.call(this) || this;
			r.type = "log", r.parse = qS.parse, r.base = n.logBase || 10;
			var i = [], a = [], o = r._lookup = {
				from: i,
				to: a
			};
			i[lC] = i[uC] = a[lC] = a[uC] = NaN, vS(r, t.mapperMethods);
			var s = Sv(), c = n.breakOption, l = { lookup: o };
			return s && s.parseAxisBreakOptionInwardTransform(c, r, { noNegative: !0 }, dC, l), r.powStub = new qS({ breakParsed: l.original }), r.intervalStub = new qS({ breakParsed: l.transformed }), yS(r, r.intervalStub), r;
		}
		return t.prototype.getTicks = function(e) {
			var t = this.base, n = this.powStub, r = Sv(), i = this.intervalStub, a = { lookup: {
				from: i.getExtent(),
				to: n.getExtent()
			} };
			return B(i.getTicks(e || {}), function(e) {
				var i = e.value, o = LS(i, t, a), s;
				if (r) {
					var c = r.getTicksBreakOutwardTransform(this, e, wv(n), this._lookup);
					c && (s = c.vBreak, o = c.tickVal);
				}
				return {
					value: o,
					break: s
				};
			}, this);
		}, t.prototype.getMinorTicks = function(e) {
			return GS(this, e, wv(this.powStub), this.intervalStub.getConfig().interval);
		}, t.prototype.getLabel = function(e, t) {
			return this.intervalStub.getLabel(e, t);
		}, t.type = "log", t.mapperMethods = {
			needTransform: function() {
				return !0;
			},
			normalize: function(e) {
				return this.intervalStub.normalize(IS(e, this.base));
			},
			scale: function(e) {
				return LS(this.intervalStub.scale(e), this.base, null);
			},
			transformIn: function(e, t) {
				return e = IS(e, this.base), t && t.depth === 2 ? e : this.intervalStub.transformIn(e, t);
			},
			transformOut: function(e, t) {
				var n = t ? t.depth : null;
				return pC.depth = n, mC.lookup = this._lookup, LS(n === 2 ? e : this.intervalStub.transformOut(e, pC), this.base, mC);
			},
			contain: function(e) {
				return this.powStub.contain(e);
			},
			setExtent: function(e, t) {
				this.setExtent2(0, e, t);
			},
			setExtent2: function(e, t, n) {
				if (!(!uu(t, n) || t <= 0 || n <= 0)) {
					var r = hC, i = hC;
					if (e === 0) {
						var a = this._lookup;
						r = a.to, i = a.from;
					}
					this.powStub.setExtent2(e, r[lC] = t, r[uC] = n);
					var o = this.base;
					this.intervalStub.setExtent2(e, i[lC] = IS(t, o), i[uC] = IS(n, o));
				}
			},
			getFilter: function() {
				return { g: 0 };
			},
			sanitize: function(e, t) {
				return uu(t[0], t[1]) && al(e) && e <= 0 && (e = t[0]), e;
			},
			getDefaultStartValue: function() {
				return 1;
			},
			getExtent: function() {
				return this.powStub.getExtent();
			},
			getExtentUnsafe: function(e, t) {
				return t === null ? this.powStub.getExtentUnsafe(e, null) : this.intervalStub.getExtentUnsafe(e, t);
			}
		}, t;
	}(dS), dS.registerClass(fC), pC = {}, mC = {}, hC = [];
})), _C, vC = M((() => {
	_C = {
		value: 1,
		category: 1,
		time: 1,
		log: 1
	};
}));
//#endregion
//#region node_modules/echarts/lib/coord/axisHelper.js
function yC(e) {
	var t = e.get("type");
	return (t == null || !At(_C, t) && !dS.getClass(t)) && (t = "value"), t;
}
function bC(e, t, n) {
	var r = Sv(), i;
	switch (r && (i = jC(e, t, n)), t) {
		case "category": return new US({
			ordinalMeta: e.getOrdinalMeta ? e.getOrdinalMeta() : e.getCategories(),
			extent: iu()
		});
		case "time": return new aC({
			locale: e.ecModel.getLocaleModel(),
			useUTC: e.ecModel.get("useUTC"),
			breakOption: i
		});
		case "log": return new fC({
			logBase: e.get("logBase"),
			breakOption: i
		});
		case "value": return new qS({ breakOption: i });
		default: return new ((dS.getClass(t)) || qS)({});
	}
}
function xC(e, t, n) {
	var r = n ? xS(e, null) : e.getExtentUnsafe(0, null), i = r[0], a = r[1];
	return uu(i, a) ? i === t || a === t ? 2 : i < t && a > t ? 1 : 3 : 3;
}
function SC(e) {
	IC(e).noOnMyZero = !0;
}
function CC(e) {
	return IC(e).noOnMyZero;
}
function wC(e) {
	var t = e.getLabelModel().get("formatter");
	if (e.type === "time") {
		var n = Ov(t);
		return function(t, r) {
			return e.scale.getFormattedLabel(t, r, n);
		};
	}
	if (U(t)) return function(n) {
		var r = e.scale.getLabel(n);
		return t.replace("{value}", r ?? "");
	};
	if (H(t)) {
		if (e.type === "category") return function(n, r) {
			return t(TC(e, n), n.value - e.scale.getExtent()[0], null);
		};
		var r = Sv();
		return function(n, i) {
			var a = null;
			return r && (a = r.makeAxisLabelFormatterParamBreak(a, n.break)), t(TC(e, n), i, a);
		};
	}
	return function(t) {
		return e.scale.getLabel(t);
	};
}
function TC(e, t) {
	var n = e.scale;
	return NS(n) ? n.getLabel(t) : t.value;
}
function EC(e) {
	return e.get("interval") ?? "auto";
}
function DC(e) {
	return e.type === "category" && EC(e.getLabelModel()) === 0;
}
function OC(e, t) {
	var n = {};
	return z(e.mapDimensionsAll(t), function(t) {
		n[j_(e, t)] = !0;
	}), st(n);
}
function kC(e) {
	return e === "middle" || e === "center";
}
function AC(e) {
	return e.getShallow("show");
}
function jC(e, t, n) {
	var r = e.get("breaks", !0);
	if (r != null) return !Sv() || !n || !MC(t) ? void 0 : r;
}
function MC(e) {
	return e !== "category";
}
function NC(e, t, n, r, i, a) {
	var o = MS(e), s = o ? e.intervalStub : e;
	if (s.setExtent(r[0], r[1]), o) {
		var c = e.powStub, l = { depth: 2 }, u = e.transformOut(r[0], l), d = e.transformOut(r[1], l), f = zS(n, r);
		t[0] && !f[0] && (u = i[0]), t[1] && !f[1] && (d = i[1]), c.setExtent(u, d);
	}
	s.setConfig(a);
}
function PC(e, t) {
	return NS(e) ? e.getRawOrdinalNumber(t.value) : t.value;
}
function FC(e, t) {
	return NS(e) && !!t.get("boundaryGap");
}
var IC, LC = M((() => {
	q(), WS(), JS(), fS(), cC(), gC(), vC(), M_(), uy(), Dv(), HS(), Z(), OS(), IC = Yl();
}));
//#endregion
//#region node_modules/echarts/lib/chart/line/LineView.js
function RC(e, t) {
	if (e.length === t.length) {
		for (var n = 0; n < e.length; n++) if (e[n] !== t[n]) return;
		return !0;
	}
}
function zC(e) {
	for (var t = iu(), n = iu(), r = 0; r < e.length;) {
		var i = e[r++], a = e[r++];
		Mx(i, a) || (au(t, i), au(n, a));
	}
	return [t, n];
}
function BC(e, t) {
	var n = zC(e), r = n[0], i = n[1], a = zC(t), o = a[0], s = a[1];
	return Math.max(Math.abs(r[0] - o[0]), Math.abs(i[0] - s[0]), Math.abs(r[1] - o[1]), Math.abs(i[1] - s[1]));
}
function VC(e) {
	return dt(e) ? e : e ? .5 : 0;
}
function HC(e, t, n) {
	if (n.valueDim == null) return [];
	for (var r = t.count(), i = Px(r * 2), a = 0; a < r; a++) {
		var o = jx(n, e, t, a);
		i[a * 2] = o[0], i[a * 2 + 1] = o[1];
	}
	return i;
}
function UC(e, t, n, r, i) {
	var a = n.getBaseAxis(), o = a.dim === "x" || a.dim === "radius" ? 0 : 1, s = [], c = 0, l = [], u = [], d = [], f = [];
	if (i) {
		for (c = 0; c < e.length; c += 2) {
			var p = t || e;
			Mx(p[c], p[c + 1]) || f.push(e[c], e[c + 1]);
		}
		e = f;
	}
	for (c = 0; c < e.length - 2; c += 2) switch (d[0] = e[c + 2], d[1] = e[c + 3], u[0] = e[c], u[1] = e[c + 1], s.push(u[0], u[1]), r) {
		case "end":
			l[o] = d[o], l[1 - o] = u[1 - o], s.push(l[0], l[1]);
			break;
		case "middle":
			var m = (u[o] + d[o]) / 2, h = [];
			l[o] = h[o] = m, l[1 - o] = u[1 - o], h[1 - o] = d[1 - o], s.push(l[0], l[1]), s.push(h[0], h[1]);
			break;
		default: l[o] = u[o], l[1 - o] = d[1 - o], s.push(l[0], l[1]);
	}
	return s.push(e[c++], e[c++]), s;
}
function WC(e, t) {
	var n = [], r = e.length, i, a;
	function o(e, t, n) {
		var r = e.coord;
		return {
			coord: n,
			color: _a((n - r) / (t.coord - r), [e.color, t.color])
		};
	}
	for (var s = 0; s < r; s++) {
		var c = e[s], l = c.coord;
		if (l < 0) i = c;
		else if (l > t) {
			a ? n.push(o(a, c, t)) : i && n.push(o(i, c, 0), o(i, c, t));
			break;
		} else i &&= (n.push(o(i, c, 0)), null), n.push(c), a = c;
	}
	return n;
}
function GC(e, t, n) {
	var r = e.getVisual("visualMeta");
	if (r && r.length && e.count() && t.type === "cartesian2d") {
		for (var i, a, o = r.length - 1; o >= 0; o--) {
			var s = e.getDimensionInfo(r[o].dimension);
			if (i = s && s.coordDim, i === "x" || i === "y") {
				a = r[o];
				break;
			}
		}
		if (a) {
			var c = t.getAxis(i), l = B(a.stops, function(e) {
				return {
					coord: c.toGlobalCoord(c.dataToCoord(e.value)),
					color: e.color
				};
			}), u = l.length, d = a.outerColors.slice();
			u && l[0].coord > l[u - 1].coord && (l.reverse(), d.reverse());
			var f = WC(l, i === "x" ? n.getWidth() : n.getHeight()), p = f.length;
			if (!p && u) return l[0].coord < 0 ? d[1] ? d[1] : l[u - 1].color : d[0] ? d[0] : l[0].color;
			var m = 10, h = f[0].coord - m, g = f[p - 1].coord + m, _ = g - h;
			if (_ < .001) return "transparent";
			z(f, function(e) {
				e.offset = (e.coord - h) / _;
			}), f.push({
				offset: p ? f[p - 1].offset : .5,
				color: d[1] || "transparent"
			}), f.unshift({
				offset: p ? f[0].offset : .5,
				color: d[0] || "transparent"
			});
			var v = new Sp(0, 0, 0, 0, f, !0);
			return v[i] = h, v[i + "2"] = g, v;
		}
	}
}
function KC(e, t, n) {
	var r = e.get("showAllSymbol"), i = r === "auto";
	if (!r || i) {
		var a = n.getAxesByScale("ordinal")[0];
		if (a && !(i && qC(a, t))) {
			var o = t.mapDimension(a.dim), s = {};
			return z(a.getViewLabels(), function(e) {
				e.tick.offInterval || (s[PC(a.scale, e.tick)] = 1);
			}), function(e) {
				return !s.hasOwnProperty(t.get(o, e));
			};
		}
	}
}
function qC(e, t) {
	var n = e.getExtent(), r = Math.abs(n[1] - n[0]) / e.scale.count();
	isNaN(r) && (r = 0);
	for (var i = t.count(), a = Math.max(1, Math.round(i / 5)), o = 0; o < i; o += a) if (bx.getSymbolSize(t, o)[+!!e.isHorizontal()] * 1.5 > r) return !1;
	return !0;
}
function JC(e) {
	for (var t = e.length / 2; t > 0 && Mx(e[t * 2 - 2], e[t * 2 - 1]); t--);
	return t - 1;
}
function YC(e, t) {
	return [e[t * 2], e[t * 2 + 1]];
}
function XC(e, t, n) {
	for (var r = e.length / 2, i = n === "x" ? 0 : 1, a, o, s = 0, c = -1, l = 0; l < r; l++) if (o = e[l * 2 + i], !Mx(o, e[l * 2 + 1 - i])) {
		if (l === 0) {
			a = o;
			continue;
		}
		if (a <= t && o >= t || a >= t && o <= t) {
			c = l;
			break;
		}
		s = l, a = o;
	}
	return {
		range: [s, c],
		t: (t - a) / (o - a)
	};
}
function ZC(e) {
	if (e.get(["endLabel", "show"])) return !0;
	for (var t = 0; t < Rd.length; t++) if (e.get([
		Rd[t],
		"endLabel",
		"show"
	])) return !0;
	return !1;
}
function QC(e, t, n, r) {
	if (lS(t, "cartesian2d")) {
		var i = r.getModel("endLabel"), a = i.get("valueAnimation"), o = r.getData(), s = { lastFrameIndex: 0 }, c = ZC(r) ? function(n, r) {
			e._endLabelOnDuring(n, r, o, s, a, i, t);
		} : null, l = t.getBaseAxis().isHorizontal(), u = oS(t, n, r, function() {
			var t = e._endLabel;
			t && n && s.originalX != null && t.attr({
				x: s.originalX,
				y: s.originalY
			});
		}, c);
		if (!r.get("clip", !0)) {
			var d = u.shape, f = Math.max(d.width, d.height);
			l ? (d.y -= f, d.height += f * 2) : (d.x -= f, d.width += f * 2);
		}
		return c && c(1, u), u;
	}
	return sS(t, n, r);
}
function $C(e, t) {
	var n = t.getBaseAxis(), r = n.isHorizontal(), i = n.inverse, a = r ? i ? "right" : "left" : "center", o = r ? "middle" : i ? "top" : "bottom";
	return { normal: {
		align: e.get("align") || a,
		verticalAlign: e.get("verticalAlign") || o
	} };
}
var ew, tw = M((() => {
	F(), q(), Ox(), xx(), Bx(), Gm(), Z(), Jx(), aS(), Nx(), cS(), uS(), Jd(), ch(), vx(), Du(), Lx(), by(), Ea(), LC(), ew = function(e) {
		P(t, e);
		function t() {
			return e !== null && e.apply(this, arguments) || this;
		}
		return t.prototype.init = function() {
			var e = new bf(), t = new Dx();
			this.group.add(t.group), this._symbolDraw = t, this._lineGroup = e, this._changePolyState = Gt(this._changePolyState, this);
		}, t.prototype.render = function(e, t, n) {
			var r = e.coordinateSystem, i = this.group, a = e.getData(), o = e.getModel("lineStyle"), s = e.getModel("areaStyle"), c = a.getLayout("points") || [], l = r.type === "polar", u = this._coordSys, d = this._symbolDraw, f = this._polyline, p = this._polygon, m = this._lineGroup, h = !t.ssr && e.get("animation"), g = !s.isEmpty(), _ = s.get("origin"), v = kx(r, a, _), y = g && HC(r, a, v), b = e.get("showSymbol"), x = e.get("connectNulls"), S = b && !l && KC(e, a, r), C = this._data;
			C && C.eachItemGraphicEl(function(e, t) {
				e.__temp && (i.remove(e), C.setItemGraphicEl(t, null));
			}), b || d.remove(), i.add(m);
			var w = !l && e.get("step"), T;
			r && r.getArea && e.get("clip", !0) && (T = r.getArea(), T.width == null ? T.r0 && (T.r0 -= .5, T.r += .5) : (T.x -= .1, T.y -= .1, T.width += .2, T.height += .2)), this._clipShapeForSymbol = T;
			var E = GC(a, r, n) || a.getVisual("style")[a.getVisual("drawType")];
			if (!(f && u.type === r.type && w === this._step)) b && d.updateData(a, {
				isIgnore: S,
				clipShape: T,
				disableAnimation: !0,
				getSymbolPoint: function(e) {
					return [c[e * 2], c[e * 2 + 1]];
				}
			}), h && this._initSymbolLabelAnimation(a, r, T), w && (y &&= UC(y, c, r, w, x), c = UC(c, null, r, w, x)), f = this._newPolyline(c), g ? p = this._newPolygon(c, y) : p &&= (m.remove(p), this._polygon = null), l || this._initOrUpdateEndLabel(e, r, gy(E)), m.setClipPath(QC(this, r, !0, e));
			else {
				g && !p ? p = this._newPolygon(c, y) : p && !g && (m.remove(p), p = this._polygon = null), l || this._initOrUpdateEndLabel(e, r, gy(E));
				var D = m.getClipPath();
				D ? Up(D, { shape: QC(this, r, !1, e).shape }, e) : m.setClipPath(QC(this, r, !0, e)), b && d.updateData(a, {
					isIgnore: S,
					clipShape: T,
					disableAnimation: !0,
					getSymbolPoint: function(e) {
						return [c[e * 2], c[e * 2 + 1]];
					}
				}), (!RC(this._stackedOnPoints, y) || !RC(this._points, c)) && (h ? this._doUpdateAnimation(a, y, r, n, w, _, x) : (w && (y &&= UC(y, c, r, w, x), c = UC(c, null, r, w, x)), f.setShape({ points: c }), p && p.setShape({
					points: c,
					stackedOnPoints: y
				})));
			}
			var O = e.getModel("emphasis"), k = O.get("focus"), A = O.get("blurScope"), j = O.get("disabled");
			if (f.useStyle(et(o.getLineStyle(), {
				fill: "none",
				stroke: E,
				lineJoin: "bevel"
			})), Dd(f, e, "lineStyle"), f.style.lineWidth > 0 && e.get([
				"emphasis",
				"lineStyle",
				"width"
			]) === "bolder") {
				var ee = f.getState("emphasis").style;
				ee.lineWidth = +f.style.lineWidth + 1;
			}
			Tu(f).seriesIndex = e.seriesIndex, Td(f, k, A, j);
			var te = VC(e.get("smooth")), ne = e.get("smoothMonotone");
			if (f.setShape({
				smooth: te,
				smoothMonotone: ne,
				connectNulls: x
			}), p) {
				var re = a.getCalculationInfo("stackedOnSeries"), ie = 0;
				p.useStyle(et(s.getAreaStyle(), {
					fill: E,
					opacity: .7,
					lineJoin: "bevel",
					decal: a.getVisual("style").decal
				})), re && (ie = VC(re.get("smooth"))), p.setShape({
					smooth: te,
					stackedOnSmooth: ie,
					smoothMonotone: ne,
					connectNulls: x
				}), Dd(p, e, "areaStyle"), Tu(p).seriesIndex = e.seriesIndex, Td(p, k, A, j);
			}
			var ae = this._changePolyState;
			a.eachItemGraphicEl(function(e) {
				e && (e.onHoverStateChange = ae);
			}), this._polyline.onHoverStateChange = ae, this._data = a, this._coordSys = r, this._stackedOnPoints = y, this._points = c, this._step = w, this._valueOrigin = _;
			var oe = e.get("triggerEvent"), se = e.get("triggerLineEvent"), M = se === !0 || oe === !0 || oe === "line", ce = se === !0 || oe === !0 || oe === "area";
			this.packEventData(e, f, M), p && this.packEventData(e, p, ce);
		}, t.prototype.packEventData = function(e, t, n) {
			Tu(t).eventData = n ? {
				componentType: "series",
				componentSubType: "line",
				componentIndex: e.componentIndex,
				seriesIndex: e.seriesIndex,
				seriesName: e.name,
				seriesType: "line",
				selfType: t === this._polygon ? "area" : "line"
			} : null;
		}, t.prototype.highlight = function(e, t, n, r) {
			var i = e.getData(), a = Jl(i, r);
			if (this._changePolyState("emphasis"), !(a instanceof Array) && a != null && a >= 0) {
				var o = i.getLayout("points"), s = i.getItemGraphicEl(a);
				if (!s) {
					var c = o[a * 2], l = o[a * 2 + 1];
					if (Mx(c, l) || this._clipShapeForSymbol && !this._clipShapeForSymbol.contain(c, l)) return;
					var u = e.get("zlevel") || 0, d = e.get("z") || 0;
					s = new bx(i, a), s.x = c, s.y = l, s.setZ(u, d);
					var f = s.getSymbolPath().getTextContent();
					f && (f.zlevel = u, f.z = d, f.z2 = this._polyline.z2 + 1), s.__temp = !0, i.setItemGraphicEl(a, s), s.stopSymbolAnimation(!0), this.group.add(s);
				}
				s.highlight();
			} else rS.prototype.highlight.call(this, e, t, n, r);
		}, t.prototype.downplay = function(e, t, n, r) {
			var i = e.getData(), a = Jl(i, r);
			if (this._changePolyState("normal"), a != null && a >= 0) {
				var o = i.getItemGraphicEl(a);
				o && (o.__temp ? (i.setItemGraphicEl(a, null), this.group.remove(o)) : o.downplay());
			} else rS.prototype.downplay.call(this, e, t, n, r);
		}, t.prototype._changePolyState = function(e) {
			var t = this._polygon;
			Zu(this._polyline, e), t && Zu(t, e);
		}, t.prototype._newPolyline = function(e) {
			var t = this._polyline;
			return t && this._lineGroup.remove(t), t = new Gx({
				shape: { points: e },
				segmentIgnoreThreshold: 2,
				z2: 10
			}), this._lineGroup.add(t), this._polyline = t, t;
		}, t.prototype._newPolygon = function(e, t) {
			var n = this._polygon;
			return n && this._lineGroup.remove(n), n = new qx({
				shape: {
					points: e,
					stackedOnPoints: t
				},
				segmentIgnoreThreshold: 2
			}), this._lineGroup.add(n), this._polygon = n, n;
		}, t.prototype._initSymbolLabelAnimation = function(e, t, n) {
			var r, i, a = t.getBaseAxis(), o = a.inverse;
			t.type === "cartesian2d" ? (r = a.isHorizontal(), i = !1) : t.type === "polar" && (r = a.dim === "angle", i = !0);
			var s = e.hostModel, c = s.get("animationDuration");
			H(c) && (c = c(null));
			var l = s.get("animationDelay") || 0, u = H(l) ? l(null) : l;
			e.eachItemGraphicEl(function(e, a) {
				var s = e;
				if (s) {
					var d = [e.x, e.y], f = void 0, p = void 0, m = void 0;
					if (n) {
						if (i) {
							var h = n, g = t.pointToCoord(d);
							r ? (f = h.startAngle, p = h.endAngle, m = -g[1] / 180 * Math.PI) : (f = h.r0, p = h.r, m = g[0]);
						} else {
							var _ = n;
							r ? (f = _.x, p = _.x + _.width, m = e.x) : (f = _.y + _.height, p = _.y, m = e.y);
						}
					}
					var v = p === f ? 0 : (m - f) / (p - f);
					o && (v = 1 - v);
					var y = H(l) ? l(a) : c * v + u, b = s.getSymbolPath(), x = b.getTextContent();
					s.attr({
						scaleX: 0,
						scaleY: 0
					}), s.animateTo({
						scaleX: 1,
						scaleY: 1
					}, {
						duration: 200,
						setToFinal: !0,
						delay: y
					}), x && x.animateFrom({ style: { opacity: 0 } }, {
						duration: 300,
						delay: y
					}), b.disableLabelAnimation = !0;
				}
			});
		}, t.prototype._initOrUpdateEndLabel = function(e, t, n) {
			var r = e.getModel("endLabel");
			if (ZC(e)) {
				var i = e.getData(), a = this._polyline, o = i.getLayout("points");
				if (!o) {
					a.removeTextContent(), this._endLabel = null;
					return;
				}
				var s = this._endLabel;
				s || (s = this._endLabel = new Mc({ z2: 200 }), s.ignoreClip = !0, a.setTextContent(this._endLabel), a.disableLabelAnimation = !0);
				var c = JC(o);
				c >= 0 && (Jm(a, Ym(e, "endLabel"), {
					inheritColor: n,
					labelFetcher: e,
					labelDataIndex: c,
					defaultText: function(e, t, n) {
						return n == null ? gx(i, e) : _x(i, n);
					},
					enableTextSetter: !0
				}, $C(r, t)), a.textConfig.position = null);
			} else this._endLabel &&= (this._polyline.removeTextContent(), null);
		}, t.prototype._endLabelOnDuring = function(e, t, n, r, i, a, o) {
			var s = this._endLabel, c = this._polyline;
			if (s) {
				e < 1 && r.originalX == null && (r.originalX = s.x, r.originalY = s.y);
				var l = n.getLayout("points"), u = n.hostModel, d = u.get("connectNulls"), f = a.get("precision"), p = a.get("distance") || 0, m = o.getBaseAxis(), h = m.isHorizontal(), g = m.inverse, _ = t.shape, v = g ? h ? _.x : _.y + _.height : h ? _.x + _.width : _.y, y = (h ? p : 0) * (g ? -1 : 1), b = (h ? 0 : -p) * (g ? -1 : 1), x = h ? "x" : "y", S = XC(l, v, x), C = S.range, w = C[1] - C[0], T = void 0;
				if (w >= 1) {
					if (w > 1 && !d) {
						var E = YC(l, C[0]);
						s.attr({
							x: E[0] + y,
							y: E[1] + b
						}), i && (T = u.getRawValue(C[0]));
					} else {
						var E = c.getPointOn(v, x);
						E && s.attr({
							x: E[0] + y,
							y: E[1] + b
						});
						var D = u.getRawValue(C[0]), O = u.getRawValue(C[1]);
						i && (T = ru(n, f, D, O, S.t));
					}
					r.lastFrameIndex = C[0];
				} else {
					var k = e === 1 || r.lastFrameIndex > 0 ? C[0] : 0, E = YC(l, k);
					i && (T = u.getRawValue(k)), s.attr({
						x: E[0] + y,
						y: E[1] + b
					});
				}
				if (i) {
					var A = oh(s);
					typeof A.setLabelText == "function" && A.setLabelText(T);
				}
			}
		}, t.prototype._doUpdateAnimation = function(e, t, n, r, i, a, o) {
			var s = this._polyline, c = this._polygon, l = e.hostModel, u = zx(this._data, e, this._stackedOnPoints, t, this._coordSys, n, this._valueOrigin, a), d = u.current, f = u.stackedOnCurrent, p = u.next, m = u.stackedOnNext;
			if (i && (f = UC(u.stackedOnCurrent, u.current, n, i, o), d = UC(u.current, null, n, i, o), m = UC(u.stackedOnNext, u.next, n, i, o), p = UC(u.next, null, n, i, o)), BC(d, p) > 3e3 || c && BC(f, m) > 3e3) {
				s.stopAnimation(), s.setShape({ points: p }), c && (c.stopAnimation(), c.setShape({
					points: p,
					stackedOnPoints: m
				}));
				return;
			}
			s.shape.__points = u.current, s.shape.points = d;
			var h = { shape: { points: p } };
			u.current !== d && (h.shape.__points = u.next), s.stopAnimation(), Hp(s, h, l), c && (c.setShape({
				points: d,
				stackedOnPoints: f
			}), c.stopAnimation(), Hp(c, { shape: { stackedOnPoints: m } }, l), s.shape.points !== c.shape.points && (c.shape.points = s.shape.points));
			for (var g = [], _ = u.status, v = 0; v < _.length; v++) if (_[v].cmd === "=") {
				var y = e.getItemGraphicEl(_[v].idx1);
				y && g.push({
					el: y,
					ptIdx: v
				});
			}
			s.animators && s.animators.length && s.animators[0].during(function() {
				c && c.dirtyShape();
				for (var e = s.shape.__points, t = 0; t < g.length; t++) {
					var n = g[t].el, r = g[t].ptIdx * 2;
					n.x = e[r], n.y = e[r + 1], n.markRedraw();
				}
			});
		}, t.prototype.remove = function(e) {
			var t = this.group, n = this._data;
			this._lineGroup.removeAll(), this._symbolDraw.remove(!0), n && n.eachItemGraphicEl(function(e, r) {
				e.__temp && (t.remove(e), n.setItemGraphicEl(r, null));
			}), this._polyline = this._polygon = this._coordSys = this._points = this._stackedOnPoints = this._endLabel = this._data = null;
		}, t.type = "line", t;
	}(rS);
}));
//#endregion
//#region node_modules/echarts/lib/layout/points.js
function nw(e, t) {
	return {
		seriesType: e,
		plan: Yx(),
		reset: function(e) {
			var n = e.getData(), r = e.coordinateSystem, i = e.pipelineContext, a = t || i.large;
			if (r) {
				var o = B(r.dimensions, function(e) {
					return n.mapDimension(e);
				}).slice(0, 2), s = o.length, c = n.getCalculationInfo("stackResultDimension");
				A_(n, o[0]) && (o[0] = c), A_(n, o[1]) && (o[1] = c);
				var l = n.getStore(), u = n.getDimensionIndex(o[0]), d = n.getDimensionIndex(o[1]);
				return s && { progress: function(e, t) {
					for (var n = e.end - e.start, i = a && Px(n * s), o = [], c = [], f = e.start, p = 0; f < e.end; f++) {
						var m = void 0;
						if (s === 1) {
							var h = l.get(u, f);
							m = r.dataToPoint(h, null, c);
						} else o[0] = l.get(u, f), o[1] = l.get(d, f), m = r.dataToPoint(o, null, c);
						a ? (i[p++] = m[0], i[p++] = m[1]) : t.setItemLayout(f, m.slice());
					}
					a && (t.setLayout("points", i), t.setLayout("pointsRange", {
						start: e.start,
						end: e.end
					}));
				} };
			}
		}
	};
}
var rw = M((() => {
	q(), Xx(), M_(), Lx();
}));
//#endregion
//#region node_modules/echarts/lib/processor/dataSample.js
function iw(e) {
	return {
		seriesType: e,
		reset: function(e, t, n) {
			var r = e.getData(), i = e.get("sampling"), a = e.coordinateSystem, o = r.count();
			if (o > 10 && a.type === "cartesian2d" && i) {
				var s = a.getBaseAxis(), c = a.getOtherAxis(s), l = s.getExtent(), u = n.getDevicePixelRatio(), d = Math.abs(l[1] - l[0]) * (u || 1), f = Math.round(o / d);
				if (isFinite(f) && f > 1) {
					i === "lttb" ? e.setData(r.lttbDownSample(r.mapDimension(c.dim), 1 / f)) : i === "minmax" && e.setData(r.minmaxDownSample(r.mapDimension(c.dim), 1 / f));
					var p = void 0;
					U(i) ? p = aw[i] : H(i) && (p = i), p && e.setData(r.downSample(r.mapDimension(c.dim), 1 / f, p, ow));
				}
			}
		}
	};
}
var aw, ow, sw = M((() => {
	q(), aw = {
		average: function(e) {
			for (var t = 0, n = 0, r = 0; r < e.length; r++) isNaN(e[r]) || (t += e[r], n++);
			return n === 0 ? NaN : t / n;
		},
		sum: function(e) {
			for (var t = 0, n = 0; n < e.length; n++) t += e[n] || 0;
			return t;
		},
		max: function(e) {
			for (var t = -Infinity, n = 0; n < e.length; n++) e[n] > t && (t = e[n]);
			return isFinite(t) ? t : NaN;
		},
		min: function(e) {
			for (var t = Infinity, n = 0; n < e.length; n++) e[n] < t && (t = e[n]);
			return isFinite(t) ? t : NaN;
		},
		nearest: function(e) {
			return e[0];
		}
	}, ow = function(e) {
		return Math.round(e.length / 2);
	};
}));
//#endregion
//#region node_modules/echarts/lib/chart/line/install.js
function cw(e) {
	e.registerChartView(ew), e.registerSeriesModel(mx), e.registerLayout(nw("line", !0)), e.registerVisual({
		seriesType: "line",
		reset: function(e) {
			var t = e.getData(), n = e.getModel("lineStyle").getLineStyle();
			n && !n.stroke && (n.stroke = t.getVisual("style").fill), t.setVisual("legendLineStyle", n);
		}
	}), e.registerProcessor(e.PRIORITY.PROCESSOR.STATISTIC, iw("line"));
}
var lw = M((() => {
	hx(), tw(), rw(), sw();
}));
//#endregion
//#region node_modules/echarts/lib/coord/axisTickLabelBuilder.js
function uw(e) {
	return {
		out: { noPxChangeTryDetermine: [] },
		kind: e
	};
}
function dw(e, t) {
	var n = e.getLabelModel().get("customValues");
	if (n) {
		var r = e.scale;
		return { labels: B(pw(n, r), function(t, n) {
			return {
				formattedLabel: wC(e)(t, n),
				rawLabel: r.getLabel(t),
				tick: t
			};
		}) };
	}
	return e.type === "category" ? mw(e, t) : _w(e);
}
function fw(e, t, n) {
	var r = e.scale, i = e.getTickModel().get("customValues");
	return i ? { ticks: pw(i, r) } : e.type === "category" ? gw(e, t) : { ticks: r.getTicks(n) };
}
function pw(e, t) {
	var n = t.getExtent(), r = [];
	return z(e, function(e) {
		e = t.parse(e), e >= n[0] && e <= n[1] && r.push(e);
	}), mu(r, gu, null), Uc(r), B(r, function(e) {
		return { value: e };
	});
}
function mw(e, t) {
	var n = e.getLabelModel(), r = hw(e, n, t);
	return !n.get("show") || e.scale.isBlank() ? { labels: [] } : r;
}
function hw(e, t, n) {
	var r = jw(e), i = EC(t), a = n.kind === kw.estimate;
	if (!a) {
		var o = yw(r, i);
		if (o) return o;
	}
	var s, c;
	H(i) ? s = Ew(e, i, !1) : (c = i === "auto" ? xw(e, n) : i, s = Ew(e, c, !1));
	var l = {
		labels: s,
		labelCategoryInterval: c
	};
	return a ? n.out.noPxChangeTryDetermine.push(function() {
		return bw(r, i, l), !0;
	}) : bw(r, i, l), l;
}
function gw(e, t) {
	var n = Aw(e), r = EC(t), i = yw(n, r);
	if (i) return i;
	var a, o;
	if ((!t.get("show") || e.scale.isBlank()) && (a = []), H(r)) a = Ew(e, r, !0);
	else if (r === "auto") {
		var s = hw(e, e.getLabelModel(), uw(kw.determine));
		o = s.labelCategoryInterval, a = B(s.labels, function(e) {
			return e.tick;
		});
	} else o = r, a = Ew(e, o, !0);
	return bw(n, r, {
		ticks: a,
		tickCategoryInterval: o
	});
}
function _w(e) {
	var t = e.scale.getTicks(), n = wC(e);
	return { labels: B(t, function(t, r) {
		return {
			formattedLabel: n(t, r),
			rawLabel: e.scale.getLabel(t),
			tick: t
		};
	}) };
}
function vw(e) {
	return function(t) {
		return Ow(t)[e] || (Ow(t)[e] = { list: [] });
	};
}
function yw(e, t) {
	for (var n = 0; n < e.list.length; n++) if (e.list[n].key === t) return e.list[n].value;
}
function bw(e, t, n) {
	return e.list.push({
		key: t,
		value: n
	}), n;
}
function xw(e, t) {
	if (t.kind === kw.estimate) {
		var n = e.calculateCategoryInterval(t);
		return t.out.noPxChangeTryDetermine.push(function() {
			return Ow(e).autoInterval = n, !0;
		}), n;
	}
	return Ow(e).autoInterval ?? (Ow(e).autoInterval = e.calculateCategoryInterval(t));
}
function Sw(e, t) {
	var n = t.kind, r = Tw(e), i = wC(e), a = (r.axisRotate - r.labelRotate) / 180 * Math.PI, o = e.scale, s = o.getExtent(), c = o.count();
	if (s[1] - s[0] < 1) return 0;
	var l = 1, u = 40;
	c > u && (l = Math.max(1, Math.floor(c / u)));
	for (var d = s[0], f = e.dataToCoord(d + 1) - e.dataToCoord(d), p = Math.abs(f * Math.cos(a)), m = Math.abs(f * Math.sin(a)), h = 0, g = 0; d <= s[1]; d += l) {
		var _ = 0, v = 0, y = Nr(i({ value: d }), r.font, "center", "top");
		_ = y.width * 1.3, v = y.height * 1.3, h = Math.max(h, _, 7), g = Math.max(g, v, 7);
	}
	var b = h / p, x = g / m;
	isNaN(b) && (b = Infinity), isNaN(x) && (x = Infinity);
	var S = Math.max(0, Math.floor(Math.min(b, x)));
	return n === kw.estimate ? (t.out.noPxChangeTryDetermine.push(Gt(Cw, null, e, S, c)), S) : ww(e, S, c) ?? S;
}
function Cw(e, t, n) {
	return ww(e, t, n) == null;
}
function ww(e, t, n) {
	var r = Dw(e.model), i = e.getExtent(), a = r.lastAutoInterval, o = r.lastTickCount;
	if (a != null && o != null && Math.abs(a - t) <= 1 && Math.abs(o - n) <= 1 && a > t && r.axisExtent0 === i[0] && r.axisExtent1 === i[1]) return a;
	r.lastTickCount = n, r.lastAutoInterval = t, r.axisExtent0 = i[0], r.axisExtent1 = i[1];
}
function Tw(e) {
	var t = e.getLabelModel();
	return {
		axisRotate: e.getRotate ? e.getRotate() : e.isHorizontal && !e.isHorizontal() ? 90 : 0,
		labelRotate: t.get("rotate") || 0,
		font: t.getFont()
	};
}
function Ew(e, t, n) {
	var r = wC(e), i = e.scale, a = [], o = H(t);
	return VS(i, o ? 0 : t, function(e, s) {
		var c = i.getLabel(e);
		if (o) {
			var l = !!t(e.value, c);
			if (e.offInterval = !l, !l && !s) return;
		}
		a.push(n ? e : {
			formattedLabel: r(e),
			rawLabel: c,
			tick: e
		});
	}), a;
}
var Dw, Ow, kw, Aw, jw, Mw = M((() => {
	q(), Hr(), Z(), LC(), X(), HS(), Dw = Yl(), Ow = Yl(), kw = {
		estimate: 1,
		determine: 2
	}, Aw = vw("axisTick"), jw = vw("axisLabel");
}));
//#endregion
//#region node_modules/echarts/lib/util/cycleCache.js
function Nw(e) {
	Iw(e).prepare = {};
}
function Pw(e) {
	Iw(e).fullUpdate = {};
}
function Fw(e) {
	return Iw(e).fullUpdate;
}
var Iw, Lw = M((() => {
	Z(), Iw = Yl();
}));
//#endregion
//#region node_modules/echarts/lib/coord/axisStatistics.js
function Rw(e, t) {
	var n = e.model, r = Jw(Fw(n.ecModel)).keyed, i = r && r.get(t);
	return i && i.get(n.uid);
}
function zw(e, t) {
	return Hw(Rw(e, t));
}
function Bw(e, t) {
	var n = [];
	return Vw(e.model.ecModel, function(e) {
		for (var r = 0; r < t.length; r++) t[r] && e.serByIdx[t[r].seriesIndex] && n.push(Hw(e));
	}), n;
}
function Vw(e, t) {
	var n = Jw(Fw(e)).keyed;
	n && n.each(function(e, n) {
		e.each(function(e, r) {
			t(e, n, r);
		});
	});
}
function Hw(e) {
	return { liPosMinGap: e ? e.liPosMinGap : void 0 };
}
function Uw(e, t) {
	var n = e.model.ecModel, r = Jw(Fw(n)).axSer;
	r && Ww(n, r.get(e.model.uid), t);
}
function Ww(e, t, n) {
	if (t) for (var r = 0; r < t.length; r++) {
		var i = t[r];
		e.isSeriesFiltered(i) || n(i);
	}
}
function Gw(e, t) {
	var n = e.model, r = Jw(Fw(n.ecModel)).keys;
	r && z(r.get(n.uid), function(e) {
		t(e);
	});
}
function Kw(e, t, n) {
	if (e) {
		var r = t.ecModel, i = Jw(Fw(r)), a = e.model.uid, o = i.axSer ||= K();
		(o.get(a) || o.set(a, [])).push(t);
		var s = t.subType, c = t.getBaseAxis() === e, l = Yw.get(qw(s, c, n)) || Yw.get(qw(s, c, null));
		if (l) {
			var u = i.keyed ||= K(), d = i.keys ||= K(), f = l.key, p = u.get(f) || u.set(f, K()), m = p.get(a);
			m || (m = p.set(a, {
				axis: e,
				sers: [],
				serByIdx: []
			}), m.metrics = l.getMetrics(e), (d.get(a) || d.set(a, [])).push(f)), m.sers.push(t), m.serByIdx[t.seriesIndex] = t;
		}
	}
}
function qw(e, t, n) {
	return e + "|&" + G(t, !0) + "|&" + (n || "");
}
var Jw, Yw, Xw = M((() => {
	q(), Z(), Lw(), pu(), Jw = Yl(), Yl(), Yw = K();
}));
//#endregion
//#region node_modules/echarts/lib/coord/axisBand.js
function Zw(e, t) {
	t ||= {};
	var n = {
		w: NaN,
		w2: NaN
	}, r = e.scale, i = t.fromStat, a = t.min, o = SS(r);
	al(o) || (o = NaN);
	var s = e.getExtent(), c = ul(s[1] - s[0]);
	return NS(r) ? Qw(n, e, o, c) : i && $w(n, e, o, c, i), a != null && (n.w = al(n.w) ? ll(a, n.w) : a), n;
}
function Qw(e, t, n, r) {
	var i = t.onBand, a = n + +!!i;
	a === 0 && (a = 1), e.w = r / a, !i && n && r && (e.w2 = e.w * n / r);
}
function $w(e, t, n, r, i) {
	var a = !1, o = -Infinity;
	z(i.key ? [zw(t, i.key)] : Bw(t, i.sers || []), function(e) {
		var t = e.liPosMinGap;
		t != null && (t > 0 ? (t > o && (o = t), a = !1) : t === -2 && (a = !0));
	}), al(n) && n > 0 && al(o) ? (e.w = r / n * o, e.w2 = o) : a && (e.w = r * eT, e.w2 = e.w * n / r);
}
var eT, tT = M((() => {
	q(), HS(), X(), Xw(), OS(), eT = .8;
}));
//#endregion
//#region node_modules/echarts/lib/coord/Axis.js
function nT(e) {
	var t = e.getExtent();
	if (e.onBand) {
		var n = (t[1] - t[0]) / e.scale.count() / 2;
		t[0] += n, t[1] -= n;
	}
	return t;
}
function rT(e, t, n) {
	var r = t.length;
	if (!e.onBand || n || !r) return !1;
	var i = Zw(e).w;
	if (!i) return !1;
	z(t, function(e) {
		e.coord -= i / 2;
	});
	var a = e.scale.getExtent(), o = t[r - 1];
	return o.tick.offInterval && t.pop(), t.push({
		coord: o.coord + i,
		tick: { value: a[1] + 1 }
	}), !0;
}
var iT, aT, oT = M((() => {
	q(), X(), Mw(), HS(), tT(), LC(), iT = [0, 1], aT = function() {
		function e(e, t, n) {
			this.onBand = !1, this.inverse = !1, this.dim = e, this.scale = t, this._extent = n || [0, 0];
		}
		return e.prototype.contain = function(e) {
			var t = this._extent, n = Math.min(t[0], t[1]), r = Math.max(t[0], t[1]);
			return e >= n && e <= r;
		}, e.prototype.containData = function(e) {
			return this.scale.contain(this.scale.parse(e));
		}, e.prototype.getExtent = function() {
			return this._extent.slice();
		}, e.prototype.setExtent = function(e, t) {
			var n = this._extent;
			n[0] = e, n[1] = t;
		}, e.prototype.dataToCoord = function(e, t) {
			var n = this.scale;
			return e = n.normalize(n.parse(e)), Rc(e, iT, nT(this), t);
		}, e.prototype.coordToData = function(e, t) {
			var n = Rc(e, nT(this), iT, t);
			return this.scale.scale(n);
		}, e.prototype.pointToData = function(e, t) {}, e.prototype.getTicksCoords = function(e) {
			e ||= {};
			var t = e.tickModel || this.getTickModel(), n = B(fw(this, t, {
				breakTicks: e.breakTicks,
				pruneByBreak: e.pruneByBreak
			}).ticks, function(e) {
				return {
					coord: this.dataToCoord(PC(this.scale, e)),
					tick: e
				};
			}, this), r = t.get("alignWithLabel"), i = rT(this, n, r);
			return B(n, function(e) {
				return {
					coord: e.coord,
					tickValue: e.tick.value,
					onBand: i
				};
			});
		}, e.prototype.getMinorTicksCoords = function() {
			if (NS(this.scale)) return [];
			var e = this.model.getModel("minorTick").get("splitNumber");
			return e > 0 && e < 100 || (e = 5), B(this.scale.getMinorTicks(e), function(e) {
				return B(e, function(e) {
					return {
						coord: this.dataToCoord(e),
						tickValue: e
					};
				}, this);
			}, this);
		}, e.prototype.getViewLabels = function(e) {
			return e ||= uw(kw.determine), dw(this, e).labels;
		}, e.prototype.getLabelModel = function() {
			return this.model.getModel("axisLabel");
		}, e.prototype.getTickModel = function() {
			return this.model.getModel("axisTick");
		}, e.prototype.getBandWidth = function() {
			return Zw(this, { min: 1 }).w;
		}, e.prototype.calculateCategoryInterval = function(e) {
			return e ||= uw(kw.determine), Sw(this, e);
		}, e;
	}();
})), sT, cT = M((() => {
	F(), oT(), sT = function(e) {
		P(t, e);
		function t(t, n, r, i, a) {
			var o = e.call(this, t, n, r) || this;
			return o.index = 0, o.type = i || "value", o.position = a || "bottom", o;
		}
		return t.prototype.isHorizontal = function() {
			var e = this.position;
			return e === "top" || e === "bottom";
		}, t.prototype.getGlobalExtent = function(e) {
			var t = this.getExtent();
			return t[0] = this.toGlobalCoord(t[0]), t[1] = this.toGlobalCoord(t[1]), e && t[0] > t[1] && t.reverse(), t;
		}, t.prototype.pointToData = function(e, t) {
			return this.coordToData(this.toLocalCoord(e[this.dim === "x" ? 0 : 1]), t);
		}, t.prototype.setCategorySortInfo = function(e) {
			if (this.type !== "category") return !1;
			this.model.option.categorySortInfo = e, this.scale.setSortInfo(e);
		}, t;
	}(aT);
}));
//#endregion
//#region node_modules/echarts/lib/label/labelLayoutHelper.js
function lT(e, t, n) {
	n ||= ST, t ? e.dirty |= n : e.dirty &= ~n;
}
function uT(e, t) {
	return t ||= ST, e.dirty == null || !!(e.dirty & t);
}
function dT(e) {
	if (e) return uT(e) && fT(e, e.label, e), e;
}
function fT(e, t, n) {
	var r = t.getComputedTransform();
	e.transform = Om(e.transform, r);
	var i = e.localRect = Dm(e.localRect, t.getBoundingRect()), a = t.style, o = a.margin, s = n && n.marginForce, c = n && n.minMarginForce, l = n && n.marginDefault, u = a.__marginType;
	u == null && l && (o = l, u = sh.textMargin);
	for (var d = 0; d < 4; d++) CT[d] = u === sh.minMargin && c && c[d] != null ? c[d] : s && s[d] != null ? s[d] : o ? o[d] : 0;
	u === sh.textMargin && xm(i, CT, !1, !1);
	var f = e.rect = Dm(e.rect, i);
	return r && f.applyTransform(r), u === sh.minMargin && xm(f, CT, !1, !1), e.axisAligned = Em(r), (e.label = e.label || {}).ignore = t.ignore, lT(e, !1), lT(e, !0, xT), e;
}
function pT(e, t, n) {
	return e.transform = Om(e.transform, n), e.localRect = Dm(e.localRect, t), e.rect = Dm(e.rect, t), n && e.rect.applyTransform(n), e.axisAligned = Em(n), e.obb = void 0, (e.label = e.label || {}).ignore = !1, e;
}
function mT(e, t) {
	if (e) {
		e.label.x += t.x, e.label.y += t.y, e.label.markRedraw();
		var n = e.transform;
		n && (n[4] += t.x, n[5] += t.y);
		var r = e.rect;
		r && (r.x += t.x, r.y += t.y);
		var i = e.obb;
		i && i.fromBoundingRect(e.localRect, n);
	}
}
function hT(e, t) {
	for (var n = 0; n < yT.length; n++) {
		var r = yT[n];
		e[r] ?? (e[r] = t[r]);
	}
	return dT(e);
}
function gT(e) {
	var t = e.obb;
	return (!t || uT(e, xT)) && (e.obb = t ||= new Pp(), t.fromBoundingRect(e.localRect, e.transform), lT(e, !1, xT)), t;
}
function _T(e) {
	var t = [];
	e.sort(function(e, t) {
		return +!!t.suggestIgnore - !!e.suggestIgnore || t.priority - e.priority;
	});
	function n(e) {
		if (!e.ignore) {
			var t = e.ensureState("emphasis");
			t.ignore ??= !1;
		}
		e.ignore = !0;
	}
	for (var r = 0; r < e.length; r++) {
		var i = dT(e[r]);
		if (!i.label.ignore) {
			for (var a = i.label, o = i.labelLine, s = !1, c = 0; c < t.length; c++) if (vT(i, t[c], null, { touchThreshold: .05 })) {
				s = !0;
				break;
			}
			s ? (n(a), o && n(o)) : t.push(i);
		}
	}
}
function vT(e, t, n, r) {
	return !e || !t || e.label && e.label.ignore || t.label && t.label.ignore || !e.rect.intersect(t.rect, n, r) ? !1 : e.axisAligned && t.axisAligned ? !0 : gT(e).intersect(gT(t), n, r);
}
var yT, bT, xT, ST, CT, wT = M((() => {
	Gm(), ch(), yT = [
		"label",
		"labelLine",
		"layoutOption",
		"priority",
		"defaultAttr",
		"marginForce",
		"minMarginForce",
		"marginDefault",
		"suggestIgnore"
	], bT = 1, xT = 2, ST = bT | xT, CT = [
		0,
		0,
		0,
		0
	];
}));
//#endregion
//#region node_modules/echarts/lib/component/axis/axisBreakHelper.js
function TT() {
	return ET;
}
var ET, DT = M((() => {
	ET = null;
})), OT, kT = M((() => {
	OT = "expandAxisBreak";
}));
//#endregion
//#region node_modules/echarts/lib/component/axis/AxisBuilder.js
function AT(e, t, n, r) {
	var i = n.axis, a = t.ensureRecord(n), o = [], s, c = KT(e.axisName) && kC(e.nameLocation);
	z(r, function(e) {
		var t = dT(e);
		if (t && !t.label.ignore) {
			o.push(t);
			var n = a.transGroup;
			c && (n.transform ? zn(tE, n.transform) : Nn(tE), t.transform && Fn(tE, tE, t.transform), Y.copy(nE, t.localRect), nE.applyTransform(tE), s ? s.union(nE) : Y.copy(s = new Y(0, 0, 0, 0), nE));
		}
	});
	var l = Math.abs(a.dirVec.x) > .1 ? "x" : "y", u = a.transGroup[l];
	if (o.sort(function(e, t) {
		return Math.abs(e.label[l] - u) - Math.abs(t.label[l] - u);
	}), c && s) {
		var d = i.getExtent(), f = Math.min(d[0], d[1]), p = Math.max(d[0], d[1]) - f;
		s.union(new Y(f, 0, p, 1));
	}
	a.stOccupiedRect = s, a.labelInfoList = o;
}
function jT(e, t, n) {
	var r = new ir();
	vT(e, t, r, {
		direction: Math.atan2(n.y, n.x),
		bidirectional: !1,
		touchThreshold: .05
	}) && mT(t, r);
}
function MT(e, t, n, r) {
	for (var i = ir.dot(r, t) >= 0, a = 0, o = e.length; a < o; a++) {
		var s = e[i ? a : o - 1 - a];
		s.label.ignore || jT(s, n, r);
	}
}
function NT(e, t, n, r, i, a, o, s) {
	UT(t) || HT(e, t, i, s, r, o);
	var c = t.labelLayoutList;
	GT(e, r, c, a), JT(r, e.rotation, c);
	var l = e.optionHideOverlap;
	FT(r, c, l), l && _T(at(c, function(e) {
		return e && !e.label.ignore;
	})), AT(e, n, r, c);
}
function PT(e, t, n, r) {
	var i = Jc(n - e), a, o, s = r[0] > r[1], c = t === "start" && !s || t !== "start" && s;
	return Yc(i - YT / 2) ? (o = c ? "bottom" : "top", a = "center") : Yc(i - YT * 1.5) ? (o = c ? "top" : "bottom", a = "center") : (o = "middle", a = i < YT * 1.5 && i > YT / 2 ? c ? "left" : "right" : c ? "right" : "left"), {
		rotation: i,
		textAlign: a,
		textVerticalAlign: o
	};
}
function FT(e, t, n) {
	var r = e.axis, i = e.get(["axisLabel", "customValues"]);
	if (DC(r)) return;
	function a(e, a, o) {
		var s = dT(t[a]), c = dT(t[o]), l = r.scale;
		if (s && c) {
			if (e == null) {
				if (!n && i) return;
				var u = QT(s.label).labelInfo.tick;
				if (jS(l) && u.notNice || NS(l) && u.offInterval) {
					LT(s.label);
					return;
				}
			}
			if (e === !1 || s.suggestIgnore) {
				LT(s.label);
				return;
			}
			if (c.suggestIgnore) {
				LT(c.label);
				return;
			}
			var d = .1;
			if (!n) {
				var f = [
					0,
					0,
					0,
					0
				];
				s = hT({ marginForce: f }, s), c = hT({ marginForce: f }, c);
			}
			vT(s, c, null, { touchThreshold: d }) && LT(e ? c.label : s.label);
		}
	}
	var o = e.get(["axisLabel", "showMinLabel"]), s = e.get(["axisLabel", "showMaxLabel"]), c = t.length;
	a(o, 0, 1), a(s, c - 1, c - 2);
}
function IT(e, t, n) {
	e.showMinorTicks || z(t, function(e) {
		if (e && e.label.ignore) for (var t = 0; t < n.length; t++) {
			var r = n[t], i = $T(r), a = QT(e.label);
			if (i.tickValue != null && !i.onBand && i.tickValue === a.labelInfo.tick.value) {
				LT(r);
				return;
			}
		}
	});
}
function LT(e) {
	e && (e.ignore = !0);
}
function RT(e, t, n, r, i) {
	for (var a = [], o = [], s = [], c = 0; c < e.length; c++) {
		var l = e[c].coord;
		o[0] = l, o[1] = 0, s[0] = l, s[1] = n, t && (Qn(o, o, t), Qn(s, s, t));
		var u = new cp({
			shape: {
				x1: o[0],
				y1: o[1],
				x2: s[0],
				y2: s[1]
			},
			style: r,
			z2: 2,
			autoBatch: !0,
			silent: !0
		});
		om(u.shape, u.style.lineWidth), u.anid = i + "_" + e[c].tickValue, a.push(u);
		var d = $T(u);
		d.onBand = !!e[c].onBand, d.tickValue = e[c].tickValue;
	}
	return a;
}
function zT(e, t, n, r) {
	var i = r.axis, a = r.getModel("axisTick"), o = a.get("show");
	if (o === "auto" && (o = !0, e.raw.axisTickAutoShow != null && (o = !!e.raw.axisTickAutoShow)), !o || i.scale.isBlank()) return [];
	for (var s = a.getModel("lineStyle"), c = e.tickDirection * a.get("length"), l = RT(i.getTicksCoords(), n.transform, c, et(s.getLineStyle(), { stroke: r.get([
		"axisLine",
		"lineStyle",
		"color"
	]) }), "ticks"), u = 0; u < l.length; u++) t.add(l[u]);
	return l;
}
function BT(e, t, n, r, i) {
	var a = r.axis, o = r.getModel("minorTick");
	if (e.showMinorTicks && !a.scale.isBlank()) {
		var s = a.getMinorTicksCoords();
		if (s.length) for (var c = o.getModel("lineStyle"), l = i * o.get("length"), u = et(c.getLineStyle(), et(r.getModel("axisTick").getLineStyle(), { stroke: r.get([
			"axisLine",
			"lineStyle",
			"color"
		]) })), d = 0; d < s.length; d++) for (var f = RT(s[d], n.transform, l, u, "minorticks_" + d), p = 0; p < f.length; p++) t.add(f[p]);
	}
}
function VT(e, t, n) {
	if (UT(e)) {
		var r = e.axisLabelsCreationContext.out.noPxChangeTryDetermine;
		if (n.noPxChange) {
			for (var i = !0, a = 0; a < r.length; a++) i &&= r[a]();
			if (i) return !1;
		}
		r.length && (t.remove(e.labelGroup), WT(e, null, null, null));
	}
	return !0;
}
function HT(e, t, n, r, i, a) {
	var o = i.axis, s = vt(e.raw.axisLabelShow, i.get(["axisLabel", "show"])), c = new bf();
	n.add(c);
	var l = uw(r);
	if (!s || o.scale.isBlank()) {
		WT(t, [], c, l);
		return;
	}
	var u = i.getModel("axisLabel"), d = o.getViewLabels(l), f = (vt(e.raw.labelRotate, u.get("rotate")) || 0) * YT / 180, p = iE.innerTextLayout(e.rotation, f, e.labelDirection), m = i.getCategories && i.getCategories(!0), h = [], g = i.get("triggerEvent"), _ = Infinity, v = -Infinity;
	z(d, function(e, t) {
		var n = e.tick, r = e.formattedLabel, s = e.rawLabel, l = u, f = PC(o.scale, n);
		if (m && m[f]) {
			var y = m[f];
			W(y) && y.textStyle && (l = new Sh(y.textStyle, u, i.ecModel));
		}
		var b = l.getTextColor() || i.get([
			"axisLine",
			"lineStyle",
			"color"
		]), x = l.getShallow("align", !0) || p.textAlign, S = G(l.getShallow("alignMinLabel", !0), x), C = G(l.getShallow("alignMaxLabel", !0), x), w = l.getShallow("verticalAlign", !0) || l.getShallow("baseline", !0) || p.textVerticalAlign, T = G(l.getShallow("verticalAlignMinLabel", !0), w), E = G(l.getShallow("verticalAlignMaxLabel", !0), w), D = 10 + (n.time?.level || 0);
		_ = Math.min(_, D), v = Math.max(v, D);
		var O = new Mc({
			x: 0,
			y: 0,
			rotation: 0,
			silent: iE.isLabelSilent(i),
			z2: D,
			style: Xm(l, {
				text: r,
				align: t === 0 ? S : t === d.length - 1 ? C : x,
				verticalAlign: t === 0 ? T : t === d.length - 1 ? E : w,
				fill: H(b) ? b(o.type === "category" ? s : o.type === "value" ? f + "" : f, t) : b
			})
		});
		O.anid = "label_" + f;
		var k = QT(O);
		if (k.labelInfo = e, k.layoutRotation = p.rotation, Cm({
			el: O,
			componentModel: i,
			itemName: r,
			formatterParamsExtra: {
				isTruncated: function() {
					return O.isTruncated;
				},
				value: s,
				tickIndex: t
			}
		}), g) {
			var A = iE.makeAxisEventDataBase(i);
			A.targetType = "axisLabel", A.value = s, A.tickIndex = t;
			var j = e.tick.break;
			if (j) {
				var ee = j.parsedBreak;
				A.break = {
					start: ee.vmin,
					end: ee.vmax
				};
			}
			o.type === "category" && (A.dataIndex = f), Tu(O).eventData = A, j && qT(i, a, O, j);
		}
		h.push(O), c.add(O);
	}), WT(t, B(h, function(e) {
		return {
			label: e,
			priority: QT(e).labelInfo.tick.break ? e.z2 + (v - _ + 1) : e.z2,
			defaultAttr: { ignore: e.ignore }
		};
	}), c, l);
}
function UT(e) {
	return !!e.labelLayoutList;
}
function WT(e, t, n, r) {
	e.labelLayoutList = t, e.labelGroup = n, e.axisLabelsCreationContext = r;
}
function GT(e, t, n, r) {
	var i = t.get(["axisLabel", "margin"]);
	z(n, function(n, a) {
		var o = dT(n);
		if (o) {
			var s = o.label, c = QT(s);
			o.suggestIgnore = s.ignore, s.ignore = !1, pi(sE, cE);
			var l = t.axis;
			sE.x = l.dataToCoord(PC(l.scale, c.labelInfo.tick)), sE.y = e.labelOffset + e.labelDirection * i, sE.rotation = c.layoutRotation, r.add(sE), sE.updateTransform(), r.remove(sE), sE.decomposeTransform(), pi(s, sE), s.markRedraw(), lT(o, !0), dT(o);
		}
	});
}
function KT(e) {
	return !!e;
}
function qT(e, t, n, r) {
	n.on("click", function(n) {
		var i = {
			type: OT,
			breaks: [{
				start: r.parsedBreak.breakOption.start,
				end: r.parsedBreak.breakOption.end
			}]
		};
		i[e.axis.dim + "AxisIndex"] = e.componentIndex, t.dispatchAction(i);
	});
}
function JT(e, t, n) {
	var r = Sv();
	if (r) {
		var i = r.retrieveAxisBreakPairs(n, function(e) {
			return e && QT(e.label).labelInfo.tick.break;
		}, !0), a = e.get(["breakLabelLayout", "moveOverlap"], !0);
		(a === !0 || a === "auto") && z(i, function(r) {
			TT().adjustBreakLabelPair(e.axis.inverse, t, [dT(n[r[0]]), dT(n[r[1]])]);
		});
	}
}
var YT, XT, ZT, QT, $T, eE, tE, nE, rE, iE, aE, oE, sE, cE, lE = M((() => {
	q(), Gm(), Du(), ch(), Ch(), X(), px(), Bn(), rr(), LC(), wT(), Z(), DT(), kT(), Dv(), Dr(), ar(), Ci(), Mw(), HS(), YT = Math.PI, XT = [
		[
			1,
			2,
			1,
			2
		],
		[
			5,
			3,
			5,
			3
		],
		[
			8,
			3,
			8,
			3
		]
	], ZT = [
		[
			0,
			1,
			0,
			1
		],
		[
			0,
			3,
			0,
			3
		],
		[
			0,
			3,
			0,
			3
		]
	], QT = Yl(), $T = Yl(), eE = function() {
		function e(e) {
			this.recordMap = {}, this.resolveAxisNameOverlap = e;
		}
		return e.prototype.ensureRecord = function(e) {
			var t = e.axis.dim, n = e.componentIndex, r = this.recordMap, i = r[t] || (r[t] = []);
			return i[n] || (i[n] = { ready: {} });
		}, e;
	}(), tE = Mn(), nE = new Y(0, 0, 0, 0), rE = function(e, t, n, r, i, a) {
		if (kC(e.nameLocation)) {
			var o = a.stOccupiedRect;
			o && jT(pT({}, o, a.transGroup.transform), r, i);
		} else MT(a.labelInfoList, a.dirVec, r, i);
	}, iE = function() {
		function e(e, t, n, r) {
			this.group = new bf(), this._axisModel = e, this._api = t, this._local = {}, this._shared = r || new eE(rE), this._resetCfgDetermined(n);
		}
		return e.prototype.updateCfg = function(e) {
			var t = this._cfg.raw;
			t.position = e.position, t.labelOffset = e.labelOffset, this._resetCfgDetermined(t);
		}, e.prototype.__getRawCfg = function() {
			return this._cfg.raw;
		}, e.prototype._resetCfgDetermined = function(e) {
			var t = this._axisModel, n = t.getDefaultOption ? t.getDefaultOption() : {}, r = G(e.axisName, t.get("name")), i = t.get("nameMoveOverlap");
			(i == null || i === "auto") && (i = G(e.defaultNameMoveOverlap, !0));
			var a = {
				raw: e,
				position: e.position,
				rotation: e.rotation,
				nameDirection: G(e.nameDirection, 1),
				tickDirection: G(e.tickDirection, 1),
				labelDirection: G(e.labelDirection, 1),
				labelOffset: G(e.labelOffset, 0),
				silent: G(e.silent, !0),
				axisName: r,
				nameLocation: yt(t.get("nameLocation"), n.nameLocation, "end"),
				shouldNameMoveOverlap: KT(r) && i,
				optionHideOverlap: t.get(["axisLabel", "hideOverlap"]),
				showMinorTicks: t.get(["minorTick", "show"])
			};
			this._cfg = a;
			var o = new bf({
				x: a.position[0],
				y: a.position[1],
				rotation: a.rotation
			});
			o.updateTransform(), this._transformGroup = o;
			var s = this._shared.ensureRecord(t);
			s.transGroup = this._transformGroup, s.dirVec = new ir(Math.cos(-a.rotation), Math.sin(-a.rotation));
		}, e.prototype.build = function(e, t) {
			var n = this;
			return e ||= {
				axisLine: !0,
				axisTickLabelEstimate: !1,
				axisTickLabelDetermine: !0,
				axisName: !0
			}, z(aE, function(r) {
				e[r] && oE[r](n._cfg, n._local, n._shared, n._axisModel, n.group, n._transformGroup, n._api, t || {});
			}), this;
		}, e.innerTextLayout = function(e, t, n) {
			var r = Jc(t - e), i, a;
			return Yc(r) ? (a = n > 0 ? "top" : "bottom", i = "center") : Yc(r - YT) ? (a = n > 0 ? "bottom" : "top", i = "center") : (a = "middle", i = r > 0 && r < YT ? n > 0 ? "right" : "left" : n > 0 ? "left" : "right"), {
				rotation: r,
				textAlign: i,
				textVerticalAlign: a
			};
		}, e.makeAxisEventDataBase = function(e) {
			var t = {
				componentType: e.mainType,
				componentIndex: e.componentIndex
			};
			return t[e.mainType + "Index"] = e.componentIndex, t;
		}, e.isLabelSilent = function(e) {
			var t = e.get("tooltip");
			return e.get("silent") || !(e.get("triggerEvent") || t && t.show);
		}, e;
	}(), aE = [
		"axisLine",
		"axisTickLabelEstimate",
		"axisTickLabelDetermine",
		"axisName"
	], oE = {
		axisLine: function(e, t, n, r, i, a, o) {
			var s = r.get(["axisLine", "show"]);
			if (s === "auto" && (s = !0, e.raw.axisLineAutoShow != null && (s = !!e.raw.axisLineAutoShow)), s) {
				var c = r.axis.getExtent(), l = a.transform, u = [c[0], 0], d = [c[1], 0], f = u[0] > d[0];
				l && (Qn(u, u, l), Qn(d, d, l));
				var p = L({ lineCap: "round" }, r.getModel(["axisLine", "lineStyle"]).getLineStyle()), m = {
					strokeContainThreshold: e.raw.strokeContainThreshold || 5,
					silent: !0,
					z2: 1,
					style: p
				};
				if (r.get(["axisLine", "breakLine"]) && Tv(r.axis.scale)) TT().buildAxisBreakLine(r, i, a, m);
				else {
					var h = new cp(L({ shape: {
						x1: u[0],
						y1: u[1],
						x2: d[0],
						y2: d[1]
					} }, m));
					om(h.shape, h.style.lineWidth), h.anid = "line", i.add(h);
				}
				var g = r.get(["axisLine", "symbol"]);
				if (g != null) {
					var _ = r.get(["axisLine", "symbolSize"]);
					U(g) && (g = [g, g]), (U(_) || dt(_)) && (_ = [_, _]);
					var v = ix(r.get(["axisLine", "symbolOffset"]) || 0, _), y = _[0], b = _[1];
					z([{
						rotate: e.rotation + Math.PI / 2,
						offset: v[0],
						r: 0
					}, {
						rotate: e.rotation - Math.PI / 2,
						offset: v[1],
						r: Math.sqrt((u[0] - d[0]) * (u[0] - d[0]) + (u[1] - d[1]) * (u[1] - d[1]))
					}], function(t, n) {
						if (g[n] !== "none" && g[n] != null) {
							var r = nx(g[n], -y / 2, -b / 2, y, b, p.stroke, !0), a = t.r + t.offset, o = f ? d : u;
							r.attr({
								rotation: t.rotate,
								x: o[0] + a * Math.cos(e.rotation),
								y: o[1] - a * Math.sin(e.rotation),
								silent: !0,
								z2: 11
							}), i.add(r);
						}
					});
				}
			}
		},
		axisTickLabelEstimate: function(e, t, n, r, i, a, o, s) {
			VT(t, i, s) && NT(e, t, n, r, i, a, o, kw.estimate);
		},
		axisTickLabelDetermine: function(e, t, n, r, i, a, o, s) {
			VT(t, i, s) && NT(e, t, n, r, i, a, o, kw.determine);
			var c = zT(e, i, a, r);
			IT(e, t.labelLayoutList, c), BT(e, i, a, r, e.tickDirection);
		},
		axisName: function(e, t, n, r, i, a, o, s) {
			var c = n.ensureRecord(r);
			t.nameEl &&= (i.remove(t.nameEl), c.nameLayout = c.nameLocation = null);
			var l = e.axisName;
			if (KT(l)) {
				var u = e.nameLocation, d = e.nameDirection, f = r.getModel("nameTextStyle"), p = r.get("nameGap") || 0, m = r.axis.getExtent(), h = r.axis.inverse ? -1 : 1, g = new ir(0, 0), _ = new ir(0, 0);
				u === "start" ? (g.x = m[0] - h * p, _.x = -h) : u === "end" ? (g.x = m[1] + h * p, _.x = h) : (g.x = (m[0] + m[1]) / 2, g.y = e.labelOffset + d * p, _.y = d);
				var v = Mn();
				_.transform(Ln(v, v, e.rotation));
				var y = r.get("nameRotate");
				y != null && (y = y * YT / 180);
				var b, x;
				kC(u) ? b = iE.innerTextLayout(e.rotation, y ?? e.rotation, d) : (b = PT(e.rotation, u, y || 0, m), x = e.raw.axisNameAvailableWidth, x != null && (x = Math.abs(x / Math.sin(b.rotation)), !isFinite(x) && (x = null)));
				var S = f.getFont(), C = r.get("nameTruncate", !0) || {}, w = C.ellipsis, T = vt(e.raw.nameTruncateMaxWidth, C.maxWidth, x), E = s.nameMarginLevel || 0, D = new Mc({
					x: g.x,
					y: g.y,
					rotation: b.rotation,
					silent: iE.isLabelSilent(r),
					style: Xm(f, {
						text: l,
						font: S,
						overflow: "truncate",
						width: T,
						ellipsis: w,
						fill: f.getTextColor() || r.get([
							"axisLine",
							"lineStyle",
							"color"
						]),
						align: f.get("align") || b.textAlign,
						verticalAlign: f.get("verticalAlign") || b.textVerticalAlign
					}),
					z2: 1
				});
				if (Cm({
					el: D,
					componentModel: r,
					itemName: l
				}), D.__fullText = l, D.anid = "name", r.get("triggerEvent")) {
					var O = iE.makeAxisEventDataBase(r);
					O.targetType = "axisName", O.name = l, Tu(D).eventData = O;
				}
				a.add(D), D.updateTransform(), t.nameEl = D;
				var k = c.nameLayout = dT({
					label: D,
					priority: D.z2,
					defaultAttr: { ignore: D.ignore },
					marginDefault: kC(u) ? XT[E] : ZT[E]
				});
				if (c.nameLocation = u, i.add(D), D.decomposeTransform(), e.shouldNameMoveOverlap && k) {
					var A = n.ensureRecord(r);
					n.resolveAxisNameOverlap(e, n, r, k, _, A);
				}
			}
		}
	}, sE = new gc(), cE = new gc();
}));
//#endregion
//#region node_modules/echarts/lib/coord/cartesian/cartesianAxisHelper.js
function uE(e, t, n) {
	n ||= {};
	var r = t.axis, i = {}, a = r.getAxesOnZeroOf()[0], o = r.position, s = a ? "onZero" : o, c = r.dim, l = [
		e.x,
		e.x + e.width,
		e.y,
		e.y + e.height
	], u = {
		left: 0,
		right: 1,
		top: 0,
		bottom: 1,
		onZero: 2
	}, d = t.get("offset") || 0, f = c === "x" ? [l[2] - d, l[3] + d] : [l[0] - d, l[1] + d];
	if (a) {
		var p = a.toGlobalCoord(a.dataToCoord(0));
		f[u.onZero] = Math.max(Math.min(p, f[1]), f[0]);
	}
	i.position = [c === "y" ? f[u[s]] : l[0], c === "x" ? f[u[s]] : l[3]], i.rotation = Math.PI / 2 * (c === "x" ? 0 : 1), i.labelDirection = i.tickDirection = i.nameDirection = {
		top: -1,
		bottom: 1,
		left: -1,
		right: 1
	}[o], i.labelOffset = a ? f[u[o]] - f[u.onZero] : 0, t.get(["axisTick", "inside"]) && (i.tickDirection = -i.tickDirection), vt(n.labelInside, t.get(["axisLabel", "inside"])) && (i.labelDirection = -i.labelDirection);
	var m = t.get(["axisLabel", "rotate"]);
	return i.labelRotate = s === "top" ? -m : m, i.z2 = 1, i;
}
function dE(e) {
	var t = {
		xAxisModel: null,
		yAxisModel: null
	};
	return z(t, function(n, r) {
		var i = r.replace(/Model$/, "");
		t[r] = e.getReferringComponents(i, Cu).models[0];
	}), t;
}
function fE(e, t, n, r, i, a) {
	for (var o = uE(e, n), s = !1, c = !1, l = 0; l < t.length; l++) kS(t[l].getOtherAxis(n.axis).scale) && (s = c = !0, n.axis.type === "category" && n.axis.onBand && (c = !1));
	return o.axisLineAutoShow = s, o.axisTickAutoShow = c, o.defaultNameMoveOverlap = a, new iE(n, r, o, i);
}
function pE(e, t, n) {
	var r = uE(t, n);
	e.updateCfg(r);
}
var mE = M((() => {
	q(), Z(), lE(), HS();
}));
//#endregion
//#region node_modules/echarts/lib/coord/scaleRawExtentInfo.js
function hE(e, t) {
	var n = e.scale, r = e.dataMM;
	n.sanitize && (t[0] = n.sanitize(t[0], r), t[1] = n.sanitize(t[1], r), fu(t));
}
function gE(e, t) {
	return t == null ? null : _t(t) ? NaN : e.parse(t);
}
function _E(e, t) {
	var n;
	if (NS(e)) n = [0, 0];
	else {
		var r = t.get("boundaryGap");
		typeof r == "boolean" && (r = null), n = V(r) ? r : [r, r];
	}
	return [vE(n[0]), vE(n[1])];
}
function vE(e) {
	return Lr(typeof e == "boolean" ? 0 : e, 1) || 0;
}
function yE(e) {
	var t = OE(e.scale);
	return t.extent ||= iu(), t;
}
function bE(e, t) {
	yE(e).dimIdxInCoord = t.get(e.dim);
}
function xE(e, t) {
	var n = e.scale, r = e.model, i = e.dim;
	n.rawExtentInfo || SE(n, e, i, r, t);
}
function SE(e, t, n, r, i) {
	var a = yE(t), o = a.extent, s = !1;
	Uw(t, function(r) {
		if (r.boxCoordinateSystem) {
			var i = h_(r).coord, c = a.dimIdxInCoord;
			if (c >= 0 && V(i)) {
				var l = i[c];
				l != null && !V(l) && au(o, e.parse(l));
			}
		} else if (r.coordinateSystem) {
			var u = r.getData();
			if (u) {
				var d = e.getFilter ? e.getFilter() : null;
				z(OC(u, n), function(e) {
					cu(o, u.getApproximateExtent(e, d));
				});
			}
			r.__requireStartValue && r.__requireStartValue(t) && (s = !0);
		}
	});
	var c = EE(e, t, r);
	wE(e, new AE(e, r, o, s, c), i), a.extent = null;
}
function CE(e, t) {
	var n = e.scale;
	wE(n, new AE(n, e.model, t, !1, !1), kE);
}
function wE(e, t, n) {
	e.rawExtentInfo = t, t.from = n;
}
function TE(e, t, n, r, i) {
	e.rawExtentInfo || CE({
		scale: e,
		model: t
	}, i || iu());
	var a = e.rawExtentInfo.makeFinal(), o = a.effMM;
	return e.setExtent(o[0], o[1]), e.setBlank(a.isBlank), r && a.tggAxInv && n && !n.get("legacyMinMaxDontInverseAxis") && (r.inverse = !r.inverse), a;
}
function EE(e, t, n) {
	var r = FC(e, n), i = n.get("containShape", !0);
	if (i == null && !r && (i = !0), !i) return !1;
	var a = !1;
	return Gw(t, function(e) {
		a = !!jE.get(e) || a;
	}), a;
}
function DE(e, t, n, r) {
	if (n.ctnShp) {
		var i;
		if (Gw(e, function(t) {
			var n = jE.get(t);
			if (n) {
				var a = n(e, r);
				a && (i ||= [0, 0], ou(i, a[0]), su(i, a[1]), SC(e));
			}
		}), i) {
			var a = t.getExtent();
			if (NS(t)) e.onBand || t.setExtent2(1, cl(a[0], a[0] + i[0]), ll(a[1], a[1] + i[1]));
			else {
				var o = a.slice();
				n.zoomFixMM[0] || (o[0] = cl(o[0], t.transformOut(t.transformIn(o[0], null) + i[0], null))), n.zoomFixMM[1] || (o[1] = ll(o[1], t.transformOut(t.transformIn(o[1], null) + i[1], null))), (o[0] < a[0] || o[1] > a[1]) && t.setExtent2(1, o[0], o[1]);
			}
		}
	}
}
var OE, kE, AE, jE, ME = M((() => {
	q(), Hr(), HS(), Z(), LC(), S_(), X(), OS(), Xw(), OE = Yl(), kE = 3, AE = function() {
		function e(e, t, n, r, i) {
			var a = NS(e), o = a ? t.getCategories().length : null, s;
			if (a) {
				var c = t.getCategories(!0);
				s = c && !c.length;
			}
			var l = n.slice();
			(AS(e) || MS(e) || jS(e)) && (ou(l, gE(e, t.get("dataMin", !0))), su(l, gE(e, t.get("dataMax", !0)))), du(l) || (l[0] = l[1] = NaN);
			var u = [], d = [!1, !1], f = t.get("min", !0);
			f === "dataMin" ? (u[0] = l[0], d[0] = !0) : (u[0] = gE(e, H(f) ? f({
				min: l[0],
				max: l[1]
			}) : f), d[0] = u[0] != null);
			var p = t.get("max", !0);
			p === "dataMax" ? (u[1] = l[1], d[1] = !0) : (u[1] = gE(e, H(p) ? p({
				min: l[0],
				max: l[1]
			}) : p), d[1] = u[1] != null);
			var m = _E(e, t), h = a ? null : l[1] - l[0] || Math.abs(l[0]);
			u[0] ??= a ? s ? l[0] : o ? 0 : NaN : l[0] - m[0] * h, u[1] ??= a ? s ? l[1] : o ? o - 1 : NaN : l[1] + m[1] * h, !lu(u[0]) && (u[0] = NaN), !lu(u[1]) && (u[1] = NaN);
			var g = s || _t(u[0]) || _t(u[1]) || a && !o, _ = AS(e), v = _ && t.needIncludeZero && t.needIncludeZero();
			v && (u[0] > 0 && u[1] > 0 && !d[0] && (u[0] = 0), u[0] < 0 && u[1] < 0 && !d[1] && (u[1] = 0));
			var y = !1;
			u[0] > u[1] && (u.reverse(), y = !0);
			var b = gE(e, t.get("startValue", !0)), x = b != null;
			!al(b) && r && (b = e.getDefaultStartValue ? e.getDefaultStartValue() : 0), al(b) && (x || !_ || v) && (b < u[0] && !d[0] ? (u[0] = b, d[0] = !0) : b > u[1] && !d[1] && (u[1] = b, d[1] = !0)), hE(this._i = {
				scale: e,
				dataMM: l,
				noZoomEffMM: u,
				zoomMM: [],
				fixMM: d,
				zoomFixMM: [!1, !1],
				startValue: b,
				isBlank: g,
				incl0: v,
				tggAxInv: y,
				ctnShp: i
			}, u);
		}
		return e.prototype.makeNoZoom = function() {
			return this._i.noZoomEffMM.slice();
		}, e.prototype.makeFinal = function() {
			var e = this._i, t = e.zoomMM, n = e.noZoomEffMM, r = e.zoomFixMM, i = e.fixMM, a = {
				fixMM: i,
				zoomFixMM: r,
				isBlank: e.isBlank,
				incl0: e.incl0,
				tggAxInv: e.tggAxInv,
				ctnShp: e.ctnShp,
				effMM: n.slice()
			}, o = a.effMM;
			return t[0] != null && (o[0] = t[0], i[0] = r[0] = !0), t[1] != null && (o[1] = t[1], i[1] = r[1] = !0), hE(e, o), a;
		}, e.prototype.makeRenderInfo = function() {
			return { startValue: this._i.startValue };
		}, e.prototype.setZoomMM = function(e, t) {
			this._i.zoomMM[e] = t;
		}, e;
	}(), jE = K();
})), NE, PE, FE, IE, LE = M((() => {
	F(), Ry(), Py(), _b(), NE = {
		left: 0,
		right: 0,
		top: 0,
		bottom: 0
	}, PE = ["25%", "25%"], FE = "cartesian2d", IE = function(e) {
		P(t, e);
		function t() {
			return e !== null && e.apply(this, arguments) || this;
		}
		return t.prototype.mergeDefaultAndTheme = function(t, n) {
			var r = Dy(t.outerBounds);
			e.prototype.mergeDefaultAndTheme.apply(this, arguments), r && t.outerBounds && Ey(t.outerBounds, r);
		}, t.prototype.mergeOption = function(t, n) {
			e.prototype.mergeOption.apply(this, arguments), this.option.outerBounds && t.outerBounds && Ey(this.option.outerBounds, t.outerBounds);
		}, t.type = "grid", t.dependencies = ["xAxis", "yAxis"], t.layoutMode = "box", t.defaultOption = {
			show: !1,
			z: 0,
			left: "15%",
			top: 65,
			right: "10%",
			bottom: 80,
			containLabel: !1,
			outerBoundsMode: "auto",
			outerBounds: NE,
			outerBoundsContain: "all",
			outerBoundsClampWidth: PE[0],
			outerBoundsClampHeight: PE[1],
			backgroundColor: Q.color.transparent,
			borderWidth: 1,
			borderColor: Q.color.neutral30
		}, t;
	}(Ly);
}));
//#endregion
//#region node_modules/echarts/lib/util/throttle.js
function RE(e, t, n) {
	var r, i = 0, a = 0, o = null, s, c, l, u;
	t ||= 0;
	function d() {
		a = (/* @__PURE__ */ new Date()).getTime(), o = null, e.apply(c, l || []);
	}
	var f = function() {
		var e = [...arguments];
		r = (/* @__PURE__ */ new Date()).getTime(), c = this, l = e;
		var f = u || t, p = u || n;
		u = null, s = r - (p ? i : a) - f, clearTimeout(o), p ? o = setTimeout(d, f) : s >= 0 ? d() : o = setTimeout(d, -s), i = r;
	};
	return f.clear = function() {
		o &&= (clearTimeout(o), null);
	}, f.debounceNextCall = function(e) {
		u = e;
	}, f;
}
function zE(e, t, n, r) {
	var i = e[t];
	if (i) {
		var a = i[VE] || i, o = i[UE];
		if (i[HE] !== n || o !== r) {
			if (n == null || !r) return e[t] = a;
			i = e[t] = RE(a, n, r === "debounce"), i[VE] = a, i[UE] = r, i[HE] = n;
		}
		return i;
	}
}
function BE(e, t) {
	var n = e[t];
	n && n[VE] && (n.clear && n.clear(), e[t] = n[VE]);
}
var VE, HE, UE, WE = M((() => {
	VE = "\0__throttleOriginMethod", HE = "\0__throttleRate", UE = "\0__throttleType";
}));
//#endregion
//#region node_modules/echarts/lib/legacy/dataSelectAction.js
function GE(e, t, n, r, i) {
	var a = e + t;
	n.isSilent(a) || r.eachComponent({
		mainType: "series",
		subType: "pie"
	}, function(e) {
		for (var t = e.seriesIndex, r = e.option.selectedMap, o = i.selected, s = 0; s < o.length; s++) if (o[s].seriesIndex === t) {
			var c = e.getData(), l = Jl(c, i.fromActionPayload);
			n.trigger(a, {
				type: a,
				seriesId: e.id,
				name: V(l) ? c.getName(l[0]) : c.getName(l),
				selected: U(r) ? r : L({}, r)
			});
		}
	});
}
function KE(e, t, n) {
	e.on("selectchanged", function(e) {
		var r = n.getModel();
		e.isFromClick ? (GE("map", "selectchanged", t, r, e), GE("pie", "selectchanged", t, r, e)) : e.fromAction === "select" ? (GE("map", "selected", t, r, e), GE("pie", "selected", t, r, e)) : e.fromAction === "unselect" && (GE("map", "unselected", t, r, e), GE("pie", "unselected", t, r, e));
	});
}
var qE = M((() => {
	q(), Z();
})), JE, YE, XE = M((() => {
	JE = function() {
		function e(e, t) {
			this.target = e, this.topTarget = t && t.topTarget;
		}
		return e;
	}(), YE = function() {
		function e(e) {
			this.handler = e, e.on("mousedown", this._dragStart, this), e.on("mousemove", this._drag, this), e.on("mouseup", this._dragEnd, this);
		}
		return e.prototype._dragStart = function(e) {
			for (var t = e.target; t && !t.draggable;) t = t.parent || t.__hostTarget;
			t && (this._draggingTarget = t, t.dragging = !0, this._x = e.offsetX, this._y = e.offsetY, this.handler.dispatchToElement(new JE(t, e), "dragstart", e.event));
		}, e.prototype._drag = function(e) {
			var t = this._draggingTarget;
			if (t) {
				var n = e.offsetX, r = e.offsetY, i = n - this._x, a = r - this._y;
				this._x = n, this._y = r, t.drift(i, a, e), this.handler.dispatchToElement(new JE(t, e), "drag", e.event);
				var o = this.handler.findHover(n, r, t).target, s = this._dropTarget;
				this._dropTarget = o, t !== o && (s && o !== s && this.handler.dispatchToElement(new JE(s, e), "dragleave", e.event), o && o !== s && this.handler.dispatchToElement(new JE(o, e), "dragenter", e.event));
			}
		}, e.prototype._dragEnd = function(e) {
			var t = this._draggingTarget;
			t && (t.dragging = !1), this.handler.dispatchToElement(new JE(t, e), "dragend", e.event), this._dropTarget && this.handler.dispatchToElement(new JE(this._dropTarget, e), "drop", e.event), this._draggingTarget = null, this._dropTarget = null;
		}, e;
	}();
}));
//#endregion
//#region node_modules/zrender/lib/core/event.js
function ZE(e, t, n, r) {
	return n ||= {}, r ? QE(e, t, n) : oD && t.layerX != null && t.layerX !== t.offsetX ? (n.zrX = t.layerX, n.zrY = t.layerY) : t.offsetX == null ? QE(e, t, n) : (n.zrX = t.offsetX, n.zrY = t.offsetY), n;
}
function QE(e, t, n) {
	if (J.domSupported && e.getBoundingClientRect) {
		var r = t.clientX, i = t.clientY;
		if (ev(e)) {
			var a = e.getBoundingClientRect();
			n.zrX = r - a.left, n.zrY = i - a.top;
			return;
		}
		if (Z_(aD, e, r, i)) {
			n.zrX = aD[0], n.zrY = aD[1];
			return;
		}
	}
	n.zrX = n.zrY = 0;
}
function $E(e) {
	return e || window.event;
}
function eD(e, t, n) {
	if (t = $E(t), t.zrX != null) return t;
	var r = t.type;
	if (r && r.indexOf("touch") >= 0) {
		var i = r === "touchend" ? t.changedTouches[0] : t.targetTouches[0];
		i && ZE(e, i, t, n);
	} else {
		ZE(e, t, t, n);
		var a = tD(t);
		t.zrDelta = a ? a / 120 : -(t.detail || 0) / 3;
	}
	var o = t.button;
	return t.which == null && o !== void 0 && iD.test(t.type) && (t.which = o & 1 ? 1 : o & 2 ? 3 : o & 4 ? 2 : 0), t;
}
function tD(e) {
	var t = e.wheelDelta;
	if (t) return t;
	var n = e.deltaX, r = e.deltaY;
	if (n == null || r == null) return t;
	var i = Math.abs(r === 0 ? n : r), a = r > 0 ? -1 : r < 0 ? 1 : n > 0 ? -1 : 1;
	return 3 * i * a;
}
function nD(e, t, n, r) {
	e.addEventListener(t, n, r);
}
function rD(e, t, n, r) {
	e.removeEventListener(t, n, r);
}
var iD, aD, oD, sD, cD = M((() => {
	$t(), ov(), iD = /^(?:mouse|pointer|contextmenu|drag|drop)|click/, aD = [], oD = J.browser.firefox && +J.browser.version.split(".")[0] < 39, sD = function(e) {
		e.preventDefault(), e.stopPropagation(), e.cancelBubble = !0;
	};
}));
//#endregion
//#region node_modules/zrender/lib/core/GestureMgr.js
function lD(e) {
	var t = e[1][0] - e[0][0], n = e[1][1] - e[0][1];
	return Math.sqrt(t * t + n * n);
}
function uD(e) {
	return [(e[0][0] + e[1][0]) / 2, (e[0][1] + e[1][1]) / 2];
}
var dD, fD, pD = M((() => {
	cD(), dD = function() {
		function e() {
			this._track = [];
		}
		return e.prototype.recognize = function(e, t, n) {
			return this._doTrack(e, t, n), this._recognize(e);
		}, e.prototype.clear = function() {
			return this._track.length = 0, this;
		}, e.prototype._doTrack = function(e, t, n) {
			var r = e.touches;
			if (r) {
				for (var i = {
					points: [],
					touches: [],
					target: t,
					event: e
				}, a = 0, o = r.length; a < o; a++) {
					var s = r[a], c = ZE(n, s, {});
					i.points.push([c.zrX, c.zrY]), i.touches.push(s);
				}
				this._track.push(i);
			}
		}, e.prototype._recognize = function(e) {
			for (var t in fD) if (fD.hasOwnProperty(t)) {
				var n = fD[t](this._track, e);
				if (n) return n;
			}
		}, e;
	}(), fD = { pinch: function(e, t) {
		var n = e.length;
		if (n) {
			var r = (e[n - 1] || {}).points, i = (e[n - 2] || {}).points || r;
			if (i && i.length > 1 && r && r.length > 1) {
				var a = lD(r) / lD(i);
				!isFinite(a) && (a = 1), t.pinchScale = a;
				var o = uD(r);
				return t.pinchX = o[0], t.pinchY = o[1], {
					type: "pinch",
					target: e[0].target,
					event: t
				};
			}
		}
	} };
}));
//#endregion
//#region node_modules/zrender/lib/Handler.js
function mD(e, t, n) {
	return {
		type: e,
		event: n,
		target: t.target,
		topTarget: t.topTarget,
		cancelBubble: !1,
		offsetX: n.zrX,
		offsetY: n.zrY,
		gestureEvent: n.gestureEvent,
		pinchX: n.pinchX,
		pinchY: n.pinchY,
		pinchScale: n.pinchScale,
		wheelDelta: n.zrDelta,
		zrByTouch: n.zrByTouch,
		which: n.which,
		stop: hD
	};
}
function hD() {
	sD(this.event);
}
function gD(e, t, n) {
	if (e[e.rectHover ? "rectContain" : "contain"](t, n)) {
		for (var r = e, i = void 0, a = !1; r;) {
			if (r.ignoreClip && (a = !0), !a) {
				var o = r.getClipPath();
				if (o && !o.contain(t, n)) return !1;
			}
			r.silent && (i = !0);
			var s = r.__hostTarget;
			r = s ? r.ignoreHostSilent ? null : s : r.parent;
		}
		return !i || yD;
	}
	return !1;
}
function _D(e, t, n, r, i) {
	for (var a = e.length - 1; a >= 0; a--) {
		var o = e[a], s = void 0;
		if (o !== i && !o.ignore && (s = gD(o, n, r)) && (!t.topTarget && (t.topTarget = o), s !== yD)) {
			t.target = o;
			break;
		}
	}
}
function vD(e, t, n) {
	var r = e.painter;
	return t < 0 || t > r.getWidth() || n < 0 || n > r.getHeight();
}
var yD, bD, xD, SD, CD, wD, TD = M((() => {
	F(), q(), rr(), XE(), to(), cD(), pD(), Dr(), yD = "silent", bD = function(e) {
		P(t, e);
		function t() {
			var t = e !== null && e.apply(this, arguments) || this;
			return t.handler = null, t;
		}
		return t.prototype.dispose = function() {}, t.prototype.setCursor = function() {}, t;
	}(eo), xD = function() {
		function e(e, t) {
			this.x = e, this.y = t;
		}
		return e;
	}(), SD = [
		"click",
		"dblclick",
		"mousewheel",
		"mouseout",
		"mouseup",
		"mousedown",
		"mousemove",
		"contextmenu"
	], CD = new Y(0, 0, 0, 0), wD = function(e) {
		P(t, e);
		function t(t, n, r, i, a) {
			var o = e.call(this) || this;
			return o._hovered = new xD(0, 0), o.storage = t, o.painter = n, o.painterRoot = i, o._pointerSize = a, r ||= new bD(), o.proxy = null, o.setHandlerProxy(r), o._draggingMgr = new YE(o), o;
		}
		return t.prototype.setHandlerProxy = function(e) {
			this.proxy && this.proxy.dispose(), e && (z(SD, function(t) {
				e.on && e.on(t, this[t], this);
			}, this), e.handler = this), this.proxy = e;
		}, t.prototype.mousemove = function(e) {
			var t = e.zrX, n = e.zrY, r = vD(this, t, n), i = this._hovered, a = i.target;
			a && !a.__zr && (i = this.findHover(i.x, i.y), a = i.target);
			var o = this._hovered = r ? new xD(t, n) : this.findHover(t, n), s = o.target, c = this.proxy;
			c.setCursor && c.setCursor(s ? s.cursor : "default"), a && s !== a && this.dispatchToElement(i, "mouseout", e), this.dispatchToElement(o, "mousemove", e), s && s !== a && this.dispatchToElement(o, "mouseover", e);
		}, t.prototype.mouseout = function(e) {
			var t = e.zrEventControl;
			t !== "only_globalout" && this.dispatchToElement(this._hovered, "mouseout", e), t !== "no_globalout" && this.trigger("globalout", {
				type: "globalout",
				event: e
			});
		}, t.prototype.resize = function() {
			this._hovered = new xD(0, 0);
		}, t.prototype.dispatch = function(e, t) {
			var n = this[e];
			n && n.call(this, t);
		}, t.prototype.dispose = function() {
			this.proxy.dispose(), this.storage = null, this.proxy = null, this.painter = null;
		}, t.prototype.setCursorStyle = function(e) {
			var t = this.proxy;
			t.setCursor && t.setCursor(e);
		}, t.prototype.dispatchToElement = function(e, t, n) {
			e ||= {};
			var r = e.target;
			if (!(r && r.silent)) {
				for (var i = "on" + t, a = mD(t, e, n); r && (r[i] && (a.cancelBubble = !!r[i].call(r, a)), r.trigger(t, a), r = r.__hostTarget ? r.__hostTarget : r.parent, !a.cancelBubble););
				a.cancelBubble || (this.trigger(t, a), this.painter && this.painter.eachOtherLayer && this.painter.eachOtherLayer(function(e) {
					typeof e[i] == "function" && e[i].call(e, a), e.trigger && e.trigger(t, a);
				}));
			}
		}, t.prototype.findHover = function(e, t, n) {
			var r = this.storage.getDisplayList(), i = new xD(e, t);
			if (_D(r, i, e, t, n), this._pointerSize && !i.target) {
				for (var a = [], o = this._pointerSize, s = o / 2, c = new Y(e - s, t - s, o, o), l = r.length - 1; l >= 0; l--) {
					var u = r[l];
					u !== n && !u.ignore && !u.ignoreCoarsePointer && (!u.parent || !u.parent.ignoreCoarsePointer) && (CD.copy(u.getBoundingRect()), u.transform && CD.applyTransform(u.transform), CD.intersect(c) && a.push(u));
				}
				if (a.length) {
					for (var d = 4, f = Math.PI / 12, p = Math.PI * 2, m = 0; m < s; m += d) for (var h = 0; h < p; h += f) if (_D(a, i, e + m * Math.cos(h), t + m * Math.sin(h), n), i.target) return i;
				}
			}
			return i;
		}, t.prototype.processGesture = function(e, t) {
			this._gestureMgr ||= new dD();
			var n = this._gestureMgr;
			t === "start" && n.clear();
			var r = n.recognize(e, this.findHover(e.zrX, e.zrY, null).target, this.proxy.dom);
			if (t === "end" && n.clear(), r) {
				var i = r.type;
				e.gestureEvent = i;
				var a = new xD();
				a.target = r.target, this.dispatchToElement(a, i, r.event);
			}
		}, t;
	}(eo), z([
		"click",
		"mousedown",
		"mouseup",
		"mousewheel",
		"dblclick",
		"contextmenu"
	], function(e) {
		wD.prototype[e] = function(t) {
			var n = t.zrX, r = t.zrY, i = vD(this, n, r), a, o;
			if ((e !== "mouseup" || !i) && (a = this.findHover(n, r), o = a.target), e === "mousedown") this._downEl = o, this._downPoint = [t.zrX, t.zrY], this._upEl = o;
			else if (e === "mouseup") this._upEl = o;
			else if (e === "click") {
				if (this._downEl !== this._upEl || !this._downPoint || tr(this._downPoint, [t.zrX, t.zrY]) > 4) return;
				this._downPoint = null;
			}
			this.dispatchToElement(a, e, t);
		};
	});
}));
//#endregion
//#region node_modules/zrender/lib/core/timsort.js
function ED(e) {
	for (var t = 0; e >= PD;) t |= e & 1, e >>= 1;
	return e + t;
}
function DD(e, t, n, r) {
	var i = t + 1;
	if (i === n) return 1;
	if (r(e[i++], e[t]) < 0) {
		for (; i < n && r(e[i], e[i - 1]) < 0;) i++;
		OD(e, t, i);
	} else for (; i < n && r(e[i], e[i - 1]) >= 0;) i++;
	return i - t;
}
function OD(e, t, n) {
	for (n--; t < n;) {
		var r = e[t];
		e[t++] = e[n], e[n--] = r;
	}
}
function kD(e, t, n, r, i) {
	for (r === t && r++; r < n; r++) {
		for (var a = e[r], o = t, s = r, c; o < s;) c = o + s >>> 1, i(a, e[c]) < 0 ? s = c : o = c + 1;
		var l = r - o;
		switch (l) {
			case 3: e[o + 3] = e[o + 2];
			case 2: e[o + 2] = e[o + 1];
			case 1:
				e[o + 1] = e[o];
				break;
			default: for (; l > 0;) e[o + l] = e[o + l - 1], l--;
		}
		e[o] = a;
	}
}
function AD(e, t, n, r, i, a) {
	var o = 0, s = 0, c = 1;
	if (a(e, t[n + i]) > 0) {
		for (s = r - i; c < s && a(e, t[n + i + c]) > 0;) o = c, c = (c << 1) + 1, c <= 0 && (c = s);
		c > s && (c = s), o += i, c += i;
	} else {
		for (s = i + 1; c < s && a(e, t[n + i - c]) <= 0;) o = c, c = (c << 1) + 1, c <= 0 && (c = s);
		c > s && (c = s);
		var l = o;
		o = i - c, c = i - l;
	}
	for (o++; o < c;) {
		var u = o + (c - o >>> 1);
		a(e, t[n + u]) > 0 ? o = u + 1 : c = u;
	}
	return c;
}
function jD(e, t, n, r, i, a) {
	var o = 0, s = 0, c = 1;
	if (a(e, t[n + i]) < 0) {
		for (s = i + 1; c < s && a(e, t[n + i - c]) < 0;) o = c, c = (c << 1) + 1, c <= 0 && (c = s);
		c > s && (c = s);
		var l = o;
		o = i - c, c = i - l;
	} else {
		for (s = r - i; c < s && a(e, t[n + i + c]) >= 0;) o = c, c = (c << 1) + 1, c <= 0 && (c = s);
		c > s && (c = s), o += i, c += i;
	}
	for (o++; o < c;) {
		var u = o + (c - o >>> 1);
		a(e, t[n + u]) < 0 ? c = u : o = u + 1;
	}
	return c;
}
function MD(e, t) {
	var n = FD, r, i, a = 0, o = [];
	r = [], i = [];
	function s(e, t) {
		r[a] = e, i[a] = t, a += 1;
	}
	function c() {
		for (; a > 1;) {
			var e = a - 2;
			if (e >= 1 && i[e - 1] <= i[e] + i[e + 1] || e >= 2 && i[e - 2] <= i[e] + i[e - 1]) i[e - 1] < i[e + 1] && e--;
			else if (i[e] > i[e + 1]) break;
			u(e);
		}
	}
	function l() {
		for (; a > 1;) {
			var e = a - 2;
			e > 0 && i[e - 1] < i[e + 1] && e--, u(e);
		}
	}
	function u(n) {
		var o = r[n], s = i[n], c = r[n + 1], l = i[n + 1];
		i[n] = s + l, n === a - 3 && (r[n + 1] = r[n + 2], i[n + 1] = i[n + 2]), a--;
		var u = jD(e[c], e, o, s, 0, t);
		o += u, s -= u, s !== 0 && (l = AD(e[o + s - 1], e, c, l, l - 1, t), l !== 0 && (s <= l ? d(o, s, c, l) : f(o, s, c, l)));
	}
	function d(r, i, a, s) {
		var c = 0;
		for (c = 0; c < i; c++) o[c] = e[r + c];
		var l = 0, u = a, d = r;
		if (e[d++] = e[u++], --s === 0) {
			for (c = 0; c < i; c++) e[d + c] = o[l + c];
			return;
		}
		if (i === 1) {
			for (c = 0; c < s; c++) e[d + c] = e[u + c];
			e[d + s] = o[l];
			return;
		}
		for (var f = n, p, m, h;;) {
			p = 0, m = 0, h = !1;
			do
				if (t(e[u], o[l]) < 0) {
					if (e[d++] = e[u++], m++, p = 0, --s === 0) {
						h = !0;
						break;
					}
				} else if (e[d++] = o[l++], p++, m = 0, --i === 1) {
					h = !0;
					break;
				}
			while ((p | m) < f);
			if (h) break;
			do {
				if (p = jD(e[u], o, l, i, 0, t), p !== 0) {
					for (c = 0; c < p; c++) e[d + c] = o[l + c];
					if (d += p, l += p, i -= p, i <= 1) {
						h = !0;
						break;
					}
				}
				if (e[d++] = e[u++], --s === 0) {
					h = !0;
					break;
				}
				if (m = AD(o[l], e, u, s, 0, t), m !== 0) {
					for (c = 0; c < m; c++) e[d + c] = e[u + c];
					if (d += m, u += m, s -= m, s === 0) {
						h = !0;
						break;
					}
				}
				if (e[d++] = o[l++], --i === 1) {
					h = !0;
					break;
				}
				f--;
			} while (p >= FD || m >= FD);
			if (h) break;
			f < 0 && (f = 0), f += 2;
		}
		if (n = f, n < 1 && (n = 1), i === 1) {
			for (c = 0; c < s; c++) e[d + c] = e[u + c];
			e[d + s] = o[l];
		} else if (i === 0) throw Error();
		else for (c = 0; c < i; c++) e[d + c] = o[l + c];
	}
	function f(r, i, a, s) {
		var c = 0;
		for (c = 0; c < s; c++) o[c] = e[a + c];
		var l = r + i - 1, u = s - 1, d = a + s - 1, f = 0, p = 0;
		if (e[d--] = e[l--], --i === 0) {
			for (f = d - (s - 1), c = 0; c < s; c++) e[f + c] = o[c];
			return;
		}
		if (s === 1) {
			for (d -= i, l -= i, p = d + 1, f = l + 1, c = i - 1; c >= 0; c--) e[p + c] = e[f + c];
			e[d] = o[u];
			return;
		}
		for (var m = n;;) {
			var h = 0, g = 0, _ = !1;
			do
				if (t(o[u], e[l]) < 0) {
					if (e[d--] = e[l--], h++, g = 0, --i === 0) {
						_ = !0;
						break;
					}
				} else if (e[d--] = o[u--], g++, h = 0, --s === 1) {
					_ = !0;
					break;
				}
			while ((h | g) < m);
			if (_) break;
			do {
				if (h = i - jD(o[u], e, r, i, i - 1, t), h !== 0) {
					for (d -= h, l -= h, i -= h, p = d + 1, f = l + 1, c = h - 1; c >= 0; c--) e[p + c] = e[f + c];
					if (i === 0) {
						_ = !0;
						break;
					}
				}
				if (e[d--] = o[u--], --s === 1) {
					_ = !0;
					break;
				}
				if (g = s - AD(e[l], o, 0, s, s - 1, t), g !== 0) {
					for (d -= g, u -= g, s -= g, p = d + 1, f = u + 1, c = 0; c < g; c++) e[p + c] = o[f + c];
					if (s <= 1) {
						_ = !0;
						break;
					}
				}
				if (e[d--] = e[l--], --i === 0) {
					_ = !0;
					break;
				}
				m--;
			} while (h >= FD || g >= FD);
			if (_) break;
			m < 0 && (m = 0), m += 2;
		}
		if (n = m, n < 1 && (n = 1), s === 1) {
			for (d -= i, l -= i, p = d + 1, f = l + 1, c = i - 1; c >= 0; c--) e[p + c] = e[f + c];
			e[d] = o[u];
		} else if (s === 0) throw Error();
		else for (f = d - (s - 1), c = 0; c < s; c++) e[f + c] = o[c];
	}
	return {
		mergeRuns: c,
		forceMergeRuns: l,
		pushRun: s
	};
}
function ND(e, t, n, r) {
	n ||= 0, r ||= e.length;
	var i = r - n;
	if (!(i < 2)) {
		var a = 0;
		if (i < PD) {
			a = DD(e, n, r, t), kD(e, n, r, n + a, t);
			return;
		}
		var o = MD(e, t), s = ED(i);
		do {
			if (a = DD(e, n, r, t), a < s) {
				var c = i;
				c > s && (c = s), kD(e, n, n + c, n + a, t), a = c;
			}
			o.pushRun(n, a), o.mergeRuns(), i -= a, n += a;
		} while (i !== 0);
		o.forceMergeRuns();
	}
}
var PD, FD, ID = M((() => {
	PD = 32, FD = 7;
}));
//#endregion
//#region node_modules/zrender/lib/Storage.js
function LD() {
	zD || (zD = !0, console.warn("z / z2 / zlevel of displayable is invalid, which may cause unexpected errors"));
}
function RD(e, t) {
	return e.zlevel === t.zlevel ? e.z === t.z ? e.z2 - t.z2 : e.z - t.z : e.zlevel - t.zlevel;
}
var zD, BD, VD = M((() => {
	q(), ID(), lo(), zD = !1, BD = function() {
		function e() {
			this._roots = [], this._displayList = [], this._displayListLen = 0, this.displayableSortFunc = RD;
		}
		return e.prototype.traverse = function(e, t) {
			for (var n = 0; n < this._roots.length; n++) this._roots[n].traverse(e, t);
		}, e.prototype.getDisplayList = function(e, t) {
			t ||= !1;
			var n = this._displayList;
			return (e || !n.length) && this.updateDisplayList(t), n;
		}, e.prototype.updateDisplayList = function(e) {
			this._displayListLen = 0;
			for (var t = this._roots, n = this._displayList, r = 0, i = t.length; r < i; r++) this._updateAndAddDisplayable(t[r], null, e);
			n.length = this._displayListLen, ND(n, RD);
		}, e.prototype._updateAndAddDisplayable = function(e, t, n) {
			if (!e.ignore || n) {
				e.beforeUpdate(), e.update(), e.afterUpdate();
				var r = e.getClipPath(), i = t && t.length, a = 0, o = e.__clipPaths;
				if (!e.ignoreClip && (i || r)) {
					if (o ||= e.__clipPaths = [], i) for (var s = 0; s < t.length; s++) o[a++] = t[s];
					for (var c = r, l = e; c;) c.parent = l, c.updateTransform(), o[a++] = c, l = c, c = c.getClipPath();
				}
				if (o && (o.length = a), e.childrenRef) {
					for (var u = e.childrenRef(), d = 0; d < u.length; d++) {
						var f = u[d];
						e.__dirty && (f.__dirty |= 1), this._updateAndAddDisplayable(f, o, n);
					}
					e.__dirty = 0;
				} else {
					var p = e;
					isNaN(p.z) && (LD(), p.z = 0), isNaN(p.z2) && (LD(), p.z2 = 0), isNaN(p.zlevel) && (LD(), p.zlevel = 0), this._displayList[this._displayListLen++] = p;
				}
				var m = e.getDecalElement && e.getDecalElement();
				m && this._updateAndAddDisplayable(m, o, n);
				var h = e.getTextGuideLine();
				h && this._updateAndAddDisplayable(h, o, n);
				var g = e.getTextContent();
				g && this._updateAndAddDisplayable(g, o, n);
			}
		}, e.prototype.addRoot = function(e) {
			e.__zr && e.__zr.storage === this || this._roots.push(e);
		}, e.prototype.delRoot = function(e) {
			if (e instanceof Array) {
				for (var t = 0, n = e.length; t < n; t++) this.delRoot(e[t]);
				return;
			}
			var r = R(this._roots, e);
			r >= 0 && this._roots.splice(r, 1);
		}, e.prototype.delAllRoots = function() {
			this._roots = [], this._displayList = [], this._displayListLen = 0;
		}, e.prototype.getRoots = function() {
			return this._roots;
		}, e.prototype.dispose = function() {
			this._displayList = null, this._roots = null;
		}, e;
	}();
})), HD, UD = M((() => {
	$t(), HD = J.hasGlobalWindow && (window.requestAnimationFrame && window.requestAnimationFrame.bind(window) || window.msRequestAnimationFrame && window.msRequestAnimationFrame.bind(window) || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame) || function(e) {
		return setTimeout(e, 16);
	};
}));
//#endregion
//#region node_modules/zrender/lib/animation/Animation.js
function WD() {
	return (/* @__PURE__ */ new Date()).getTime();
}
var GD, KD = M((() => {
	F(), to(), UD(), $a(), GD = function(e) {
		P(t, e);
		function t(t) {
			var n = e.call(this) || this;
			return n._running = !1, n._time = 0, n._pausedTime = 0, n._pauseStart = 0, n._paused = !1, t ||= {}, n.stage = t.stage || {}, n;
		}
		return t.prototype.addClip = function(e) {
			e.animation && this.removeClip(e), this._head ? (this._tail.next = e, e.prev = this._tail, e.next = null, this._tail = e) : this._head = this._tail = e, e.animation = this;
		}, t.prototype.addAnimator = function(e) {
			e.animation = this;
			var t = e.getClip();
			t && this.addClip(t);
		}, t.prototype.removeClip = function(e) {
			if (e.animation) {
				var t = e.prev, n = e.next;
				t ? t.next = n : this._head = n, n ? n.prev = t : this._tail = t, e.next = e.prev = e.animation = null;
			}
		}, t.prototype.removeAnimator = function(e) {
			var t = e.getClip();
			t && this.removeClip(t), e.animation = null;
		}, t.prototype.update = function(e) {
			for (var t = WD() - this._pausedTime, n = t - this._time, r = this._head; r;) {
				var i = r.next;
				r.step(t, n) ? (r.ondestroy(), this.removeClip(r), r = i) : r = i;
			}
			this._time = t, e || (this.trigger("frame", n), this.stage.update && this.stage.update());
		}, t.prototype._startLoop = function() {
			var e = this;
			this._running = !0;
			function t() {
				e._running && (HD(t), !e._paused && e.update());
			}
			HD(t);
		}, t.prototype.start = function() {
			this._running || (this._time = WD(), this._pausedTime = 0, this._startLoop());
		}, t.prototype.stop = function() {
			this._running = !1;
		}, t.prototype.pause = function() {
			this._paused ||= (this._pauseStart = WD(), !0);
		}, t.prototype.resume = function() {
			this._paused &&= (this._pausedTime += WD() - this._pauseStart, !1);
		}, t.prototype.clear = function() {
			for (var e = this._head; e;) {
				var t = e.next;
				e.prev = e.next = e.animation = null, e = t;
			}
			this._head = this._tail = null;
		}, t.prototype.isFinished = function() {
			return this._head == null;
		}, t.prototype.animate = function(e, t) {
			t ||= {}, this.start();
			var n = new Qa(e, t.loop);
			return this.addAnimator(n), n;
		}, t;
	}(eo);
}));
//#endregion
//#region node_modules/zrender/lib/dom/HandlerProxy.js
function qD(e) {
	var t = e.pointerType;
	return t === "pen" || t === "touch";
}
function JD(e) {
	e.touching = !0, e.touchTimer != null && (clearTimeout(e.touchTimer), e.touchTimer = null), e.touchTimer = setTimeout(function() {
		e.touching = !1, e.touchTimer = null;
	}, 700);
}
function YD(e) {
	e && (e.zrByTouch = !0);
}
function XD(e, t) {
	return eD(e.dom, new sO(e, t), !0);
}
function ZD(e, t) {
	for (var n = t, r = !1; n && n.nodeType !== 9 && !(r = n.domBelongToZr || n !== t && n === e.painterRoot);) n = n.parentNode;
	return r;
}
function QD(e, t) {
	var n = t.domHandlers;
	J.pointerEventsSupported ? z(iO.pointer, function(r) {
		eO(t, r, function(t) {
			n[r].call(e, t);
		});
	}) : (J.touchEventsSupported && z(iO.touch, function(r) {
		eO(t, r, function(i) {
			n[r].call(e, i), JD(t);
		});
	}), z(iO.mouse, function(r) {
		eO(t, r, function(i) {
			i = $E(i), t.touching || n[r].call(e, i);
		});
	}));
}
function $D(e, t) {
	J.pointerEventsSupported ? z(aO.pointer, n) : J.touchEventsSupported || z(aO.mouse, n);
	function n(n) {
		function r(r) {
			r = $E(r), ZD(e, r.target) || (r = XD(e, r), t.domHandlers[n].call(e, r));
		}
		eO(t, n, r, { capture: !0 });
	}
}
function eO(e, t, n, r) {
	e.mounted[t] = n, e.listenerOpts[t] = r, nD(e.domTarget, t, n, r);
}
function tO(e) {
	var t = e.mounted;
	for (var n in t) t.hasOwnProperty(n) && rD(e.domTarget, n, t[n], e.listenerOpts[n]);
	e.mounted = {};
}
var nO, rO, iO, aO, oO, sO, cO, lO, uO, dO, fO = M((() => {
	F(), cD(), q(), to(), $t(), nO = 300, rO = J.domSupported, iO = (function() {
		var e = [
			"click",
			"dblclick",
			"mousewheel",
			"wheel",
			"mouseout",
			"mouseup",
			"mousedown",
			"mousemove",
			"contextmenu"
		], t = [
			"touchstart",
			"touchend",
			"touchmove"
		], n = {
			pointerdown: 1,
			pointerup: 1,
			pointermove: 1,
			pointerout: 1
		};
		return {
			mouse: e,
			touch: t,
			pointer: B(e, function(e) {
				var t = e.replace("mouse", "pointer");
				return n.hasOwnProperty(t) ? t : e;
			})
		};
	})(), aO = {
		mouse: ["mousemove", "mouseup"],
		pointer: ["pointermove", "pointerup"]
	}, oO = !1, sO = function() {
		function e(e, t) {
			this.stopPropagation = jt, this.stopImmediatePropagation = jt, this.preventDefault = jt, this.type = t.type, this.target = this.currentTarget = e.dom, this.pointerType = t.pointerType, this.clientX = t.clientX, this.clientY = t.clientY;
		}
		return e;
	}(), cO = {
		mousedown: function(e) {
			e = eD(this.dom, e), this.__mayPointerCapture = [e.zrX, e.zrY], this.trigger("mousedown", e);
		},
		mousemove: function(e) {
			e = eD(this.dom, e);
			var t = this.__mayPointerCapture;
			t && (e.zrX !== t[0] || e.zrY !== t[1]) && this.__togglePointerCapture(!0), this.trigger("mousemove", e);
		},
		mouseup: function(e) {
			e = eD(this.dom, e), this.__togglePointerCapture(!1), this.trigger("mouseup", e);
		},
		mouseout: function(e) {
			e = eD(this.dom, e);
			var t = e.toElement || e.relatedTarget;
			ZD(this, t) || (this.__pointerCapturing && (e.zrEventControl = "no_globalout"), this.trigger("mouseout", e));
		},
		wheel: function(e) {
			oO = !0, e = eD(this.dom, e), this.trigger("mousewheel", e);
		},
		mousewheel: function(e) {
			oO || (e = eD(this.dom, e), this.trigger("mousewheel", e));
		},
		touchstart: function(e) {
			e = eD(this.dom, e), YD(e), this.__lastTouchMoment = /* @__PURE__ */ new Date(), this.handler.processGesture(e, "start"), cO.mousemove.call(this, e), cO.mousedown.call(this, e);
		},
		touchmove: function(e) {
			e = eD(this.dom, e), YD(e), this.handler.processGesture(e, "change"), cO.mousemove.call(this, e);
		},
		touchend: function(e) {
			e = eD(this.dom, e), YD(e), this.handler.processGesture(e, "end"), cO.mouseup.call(this, e), +/* @__PURE__ */ new Date() - this.__lastTouchMoment < nO && cO.click.call(this, e);
		},
		pointerdown: function(e) {
			cO.mousedown.call(this, e);
		},
		pointermove: function(e) {
			qD(e) || cO.mousemove.call(this, e);
		},
		pointerup: function(e) {
			cO.mouseup.call(this, e);
		},
		pointerout: function(e) {
			qD(e) || cO.mouseout.call(this, e);
		}
	}, z([
		"click",
		"dblclick",
		"contextmenu"
	], function(e) {
		cO[e] = function(t) {
			t = eD(this.dom, t), this.trigger(e, t);
		};
	}), lO = {
		pointermove: function(e) {
			qD(e) || lO.mousemove.call(this, e);
		},
		pointerup: function(e) {
			lO.mouseup.call(this, e);
		},
		mousemove: function(e) {
			this.trigger("mousemove", e);
		},
		mouseup: function(e) {
			var t = this.__pointerCapturing;
			this.__togglePointerCapture(!1), this.trigger("mouseup", e), t && (e.zrEventControl = "only_globalout", this.trigger("mouseout", e));
		}
	}, uO = function() {
		function e(e, t) {
			this.mounted = {}, this.listenerOpts = {}, this.touching = !1, this.domTarget = e, this.domHandlers = t;
		}
		return e;
	}(), dO = function(e) {
		P(t, e);
		function t(t, n) {
			var r = e.call(this) || this;
			return r.__pointerCapturing = !1, r.dom = t, r.painterRoot = n, r._localHandlerScope = new uO(t, cO), rO && (r._globalHandlerScope = new uO(document, lO)), QD(r, r._localHandlerScope), r;
		}
		return t.prototype.dispose = function() {
			tO(this._localHandlerScope), rO && tO(this._globalHandlerScope);
		}, t.prototype.setCursor = function(e) {
			this.dom.style && (this.dom.style.cursor = e || "default");
		}, t.prototype.__togglePointerCapture = function(e) {
			if (this.__mayPointerCapture = null, rO && +this.__pointerCapturing ^ e) {
				this.__pointerCapturing = e;
				var t = this._globalHandlerScope;
				e ? $D(this, t) : tO(t);
			}
		}, t;
	}(eo);
}));
//#endregion
//#region node_modules/zrender/lib/zrender.js
function pO(e) {
	delete yO[e];
}
function mO(e) {
	if (!e) return !1;
	if (typeof e == "string") return ba(e, 1) < io;
	if (e.colorStops) {
		for (var t = e.colorStops, n = 0, r = t.length, i = 0; i < r; i++) n += ba(t[i].color, 1);
		return n /= r, n < io;
	}
	return !1;
}
function hO(e, t) {
	var n = new bO(Xe(), e, t);
	return yO[n.id] = n, n;
}
function gO(e, t) {
	vO[e] = t;
}
function _O(e) {
	xO = e;
}
var vO, yO, bO, xO, SO = M((() => {
	$t(), q(), TD(), VD(), KD(), fO(), Ea(), co(), xf(), vO = {}, yO = {}, bO = function() {
		function e(e, t, n) {
			var r = this;
			this._sleepAfterStill = 10, this._stillFrameAccum = 0, this._needsRefresh = !0, this._needsRefreshHover = !1, this._darkMode = !1, n ||= {}, this.dom = t, this.id = e;
			var i = new BD(), a = n.renderer || "canvas";
			vO[a] || (a = st(vO)[0]), n.useDirtyRect = n.useDirtyRect != null && n.useDirtyRect;
			var o = new vO[a](t, i, n, e), s = n.ssr || o.ssrOnly;
			this.storage = i, this.painter = o;
			var c = !J.node && !J.worker && !s ? new dO(o.getViewportRoot(), o.root) : null, l = n.useCoarsePointer, u = l == null || l === "auto" ? J.touchEventsSupported : !!l, d = 44, f;
			u && (f = G(n.pointerSize, d)), this.handler = new wD(i, o, c, o.root, f), this.animation = new GD({ stage: { update: s ? null : function() {
				return r._flush(!1);
			} } }), s || this.animation.start();
		}
		return e.prototype.add = function(e) {
			!this._disposed && e && (this.storage.addRoot(e), e.addSelfToZr(this), this.refresh());
		}, e.prototype.remove = function(e) {
			!this._disposed && e && (this.storage.delRoot(e), e.removeSelfFromZr(this), this.refresh());
		}, e.prototype.configLayer = function(e, t) {
			this._disposed || (this.painter.configLayer && this.painter.configLayer(e, t), this.refresh());
		}, e.prototype.setBackgroundColor = function(e) {
			this._disposed || (this.painter.setBackgroundColor && this.painter.setBackgroundColor(e), this.refresh(), this._backgroundColor = e, this._darkMode = mO(e));
		}, e.prototype.getBackgroundColor = function() {
			return this._backgroundColor;
		}, e.prototype.setDarkMode = function(e) {
			this._darkMode = e;
		}, e.prototype.isDarkMode = function() {
			return this._darkMode;
		}, e.prototype.refreshImmediately = function(e) {
			this._disposed || this._refresh({
				animUpdate: !e,
				refresh: !0,
				refreshHover: !1
			});
		}, e.prototype._refresh = function(e) {
			e.animUpdate && this.animation.update(!0), this._needsRefresh = this._needsRefreshHover = !1, this.painter.refresh({
				refresh: e.refresh,
				refreshHover: e.refreshHover
			}), this._needsRefresh = this._needsRefreshHover = !1;
		}, e.prototype.refresh = function() {
			this._disposed || (this._needsRefresh = !0, this.animation.start());
		}, e.prototype.flush = function() {
			this._disposed || this._flush(!0);
		}, e.prototype._flush = function(e) {
			var t, n = WD(), r = this._needsRefresh, i = this._needsRefreshHover;
			(r || i) && (t = !0, this._refresh({
				animUpdate: e,
				refresh: r,
				refreshHover: i
			}));
			var a = WD();
			t ? (this._stillFrameAccum = 0, this.trigger("rendered", { elapsedTime: a - n })) : this._sleepAfterStill > 0 && (this._stillFrameAccum++, this._stillFrameAccum > this._sleepAfterStill && this.animation.stop());
		}, e.prototype.setSleepAfterStill = function(e) {
			this._sleepAfterStill = e;
		}, e.prototype.wakeUp = function() {
			this._disposed || (this.animation.start(), this._stillFrameAccum = 0);
		}, e.prototype.refreshHover = function() {
			this._needsRefreshHover = !0;
		}, e.prototype.refreshHoverImmediately = function() {
			this._disposed || this._refresh({
				animUpdate: !1,
				refresh: !1,
				refreshHover: !0
			});
		}, e.prototype.resize = function(e) {
			this._disposed || (e ||= {}, this.painter.resize(e.width, e.height), this.handler.resize());
		}, e.prototype.clearAnimation = function() {
			this._disposed || this.animation.clear();
		}, e.prototype.getWidth = function() {
			if (!this._disposed) return this.painter.getWidth();
		}, e.prototype.getHeight = function() {
			if (!this._disposed) return this.painter.getHeight();
		}, e.prototype.setCursorStyle = function(e) {
			this._disposed || this.handler.setCursorStyle(e);
		}, e.prototype.findHover = function(e, t) {
			if (!this._disposed) return this.handler.findHover(e, t);
		}, e.prototype.on = function(e, t, n) {
			return this._disposed || this.handler.on(e, t, n), this;
		}, e.prototype.off = function(e, t) {
			this._disposed || this.handler.off(e, t);
		}, e.prototype.trigger = function(e, t) {
			this._disposed || this.handler.trigger(e, t);
		}, e.prototype.clear = function() {
			if (!this._disposed) {
				for (var e = this.storage.getRoots(), t = 0; t < e.length; t++) e[t] instanceof bf && e[t].removeSelfFromZr(this);
				this.storage.delAllRoots(), this.painter.clear();
			}
		}, e.prototype.dispose = function() {
			this._disposed || (this.animation.stop(), this.clear(), this.storage.dispose(), this.painter.dispose(), this.handler.dispose(), this.animation = this.storage = this.painter = this.handler = null, this._disposed = !0, pO(this.id));
		}, e;
	}();
})), CO, wO, TO, EO, DO, OO = M((() => {
	Ea(), _b(), CO = "", typeof navigator < "u" && (CO = navigator.platform || ""), wO = "rgba(0, 0, 0, 0.2)", TO = Q.color.theme[0], EO = va(TO, null, null, .9), DO = {
		darkMode: "auto",
		colorBy: "series",
		color: Q.color.theme,
		gradientColor: [EO, TO],
		aria: { decal: { decals: [
			{
				color: wO,
				dashArrayX: [1, 0],
				dashArrayY: [2, 5],
				symbolSize: 1,
				rotation: Math.PI / 6
			},
			{
				color: wO,
				symbol: "circle",
				dashArrayX: [[8, 8], [
					0,
					8,
					8,
					0
				]],
				dashArrayY: [6, 0],
				symbolSize: .8
			},
			{
				color: wO,
				dashArrayX: [1, 0],
				dashArrayY: [4, 3],
				rotation: -Math.PI / 4
			},
			{
				color: wO,
				dashArrayX: [[6, 6], [
					0,
					6,
					6,
					0
				]],
				dashArrayY: [6, 0]
			},
			{
				color: wO,
				dashArrayX: [[1, 0], [1, 6]],
				dashArrayY: [
					1,
					0,
					6,
					0
				],
				rotation: Math.PI / 4
			},
			{
				color: wO,
				symbol: "triangle",
				dashArrayX: [[9, 9], [
					0,
					9,
					9,
					0
				]],
				dashArrayY: [7, 2],
				symbolSize: .75
			}
		] } },
		textStyle: {
			fontFamily: CO.match(/^Win/) ? "Microsoft YaHei" : "sans-serif",
			fontSize: 12,
			fontStyle: "normal",
			fontWeight: "normal"
		},
		blendMode: null,
		stateAnimation: {
			duration: 300,
			easing: "cubicOut"
		},
		animation: "auto",
		animationDuration: 1e3,
		animationDurationUpdate: 500,
		animationEasing: "cubicInOut",
		animationEasingUpdate: "cubicInOut",
		animationThreshold: 2e3,
		progressiveThreshold: 3e3,
		progressive: 400,
		hoverLayerThreshold: 3e3,
		useUTC: !1
	};
}));
//#endregion
//#region node_modules/echarts/lib/model/internalComponentCreator.js
function kO(e, t, n) {
	var r = AO.get(t);
	if (!r) return n;
	var i = r(e);
	return i ? n.concat(i) : n;
}
var AO, jO = M((() => {
	q(), AO = K();
}));
//#endregion
//#region node_modules/echarts/lib/model/Global.js
function MO(e, t) {
	if (t) {
		var n = t.seriesIndex, r = t.seriesId, i = t.seriesName;
		return n != null && e.componentIndex !== n || r != null && e.id !== r || i != null && e.name !== i;
	}
}
function NO(e, t) {
	var n = e.color && !e.colorLayer;
	z(t, function(t, r) {
		r === "colorLayer" && n || r === "color" && e.color || Ly.hasClass(r) || (typeof t == "object" ? e[r] = e[r] ? Qe(e[r], t, !1) : I(t) : e[r] ?? (e[r] = t));
	});
}
function PO(e, t, n) {
	if (V(t)) {
		var r = K();
		return z(t, function(e) {
			e != null && Ul(e, null) != null && r.set(e, !0);
		}), at(n, function(t) {
			return t && r.get(t[e]);
		});
	}
	var i = Ul(t, null);
	return at(n, function(t) {
		return t && i != null && t[e] === i;
	});
}
function FO(e, t) {
	return t.hasOwnProperty("subType") ? at(e, function(e) {
		return e && e.subType === t.subType;
	}) : e;
}
function IO(e) {
	var t = K();
	return e && z(Al(e.replaceMerge), function(e) {
		t.set(e, !0);
	}), { replaceMergeMainTypeMap: t };
}
var LO, RO, zO, BO, VO, HO, UO = M((() => {
	F(), q(), Z(), Ch(), Ry(), OO(), Ih(), jO(), Wy(), BO = "\0_ec_inner", VO = 1, HO = function(e) {
		P(t, e);
		function t() {
			return e !== null && e.apply(this, arguments) || this;
		}
		return t.prototype.init = function(e, t, n, r, i, a) {
			r ||= {}, this.option = null, this._theme = new Sh(r), this._locale = new Sh(i), this._optionManager = a;
		}, t.prototype.setOption = function(e, t, n) {
			var r = IO(t);
			this._optionManager.setOption(e, n, r), this._resetOption(null, r);
		}, t.prototype.resetOption = function(e, t) {
			return this._resetOption(e, IO(t));
		}, t.prototype._resetOption = function(e, t) {
			var n = !1, r = this._optionManager;
			if (!e || e === "recreate") {
				var i = r.mountOption(e === "recreate");
				!this.option || e === "recreate" ? zO(this, i) : (this.restoreData(), this._mergeOption(i, t)), n = !0;
			}
			if ((e === "timeline" || e === "media") && this.restoreData(), !e || e === "recreate" || e === "timeline") {
				var a = r.getTimelineOption(this);
				a && (n = !0, this._mergeOption(a, t));
			}
			if (!e || e === "recreate" || e === "media") {
				var o = r.getMediaOption(this);
				o.length && z(o, function(e) {
					n = !0, this._mergeOption(e, t);
				}, this);
			}
			return n;
		}, t.prototype.mergeOption = function(e) {
			this._mergeOption(e, null);
		}, t.prototype._mergeOption = function(e, t) {
			var n = this.option, r = this._componentsMap, i = this._componentsCount, a = [], o = K(), s = t && t.replaceMergeMainTypeMap;
			Oh(this), z(e, function(e, t) {
				e != null && (Ly.hasClass(t) ? t && (a.push(t), o.set(t, !0)) : n[t] = n[t] == null ? I(e) : Qe(n[t], e, !0));
			}), s && s.each(function(e, t) {
				Ly.hasClass(t) && !o.get(t) && (a.push(t), o.set(t, !0));
			}), Ly.topologicalTravel(a, Ly.getAllClassMainTypes(), c, this);
			function c(t) {
				var a = kO(this, t, Al(e[t])), o = r.get(t), c = Pl(o, a, o ? s && s.get(t) ? "replaceMerge" : "normalMerge" : "replaceAll");
				Kl(c, t, Ly), n[t] = null, r.set(t, null), i.set(t, 0);
				var l = [], u = [], d = 0, f;
				z(c, function(e, n) {
					var r = e.existing, i = e.newOption;
					if (!i) r && (r.mergeOption({}, this), r.optionUpdated({}, !1));
					else {
						var a = t === "series", o = Ly.getClass(t, e.keyInfo.subType, !a);
						if (!o) return;
						if (t === "tooltip") {
							if (f) return;
							f = !0;
						}
						if (r && r.constructor === o) r.name = e.keyInfo.name, r.mergeOption(i, this), r.optionUpdated(i, !1);
						else {
							var s = L({ componentIndex: n }, e.keyInfo);
							r = new o(i, this, this, s), L(r, s), e.brandNew && (r.__requireNewView = !0), r.init(i, this, this), r.optionUpdated(null, !0);
						}
					}
					r ? (l.push(r.option), u.push(r), d++) : (l.push(void 0), u.push(void 0));
				}, this), n[t] = l, r.set(t, u), i.set(t, d), t === "series" && LO(this);
			}
			this._seriesIndices || LO(this);
		}, t.prototype.getOption = function() {
			var e = I(this.option);
			return z(e, function(t, n) {
				if (Ly.hasClass(n)) {
					for (var r = Al(t), i = r.length, a = !1, o = i - 1; o >= 0; o--) r[o] && !Gl(r[o]) ? a = !0 : (r[o] = null, !a && i--);
					r.length = i, e[n] = r;
				}
			}), delete e[BO], e;
		}, t.prototype.setTheme = function(e) {
			this._theme = new Sh(e), this._resetOption("recreate", null);
		}, t.prototype.getTheme = function() {
			return this._theme;
		}, t.prototype.getLocaleModel = function() {
			return this._locale;
		}, t.prototype.setUpdatePayload = function(e) {
			this._payload = e;
		}, t.prototype.getUpdatePayload = function() {
			return this._payload;
		}, t.prototype.getComponent = function(e, t) {
			var n = this._componentsMap.get(e);
			if (n) {
				var r = n[t || 0];
				if (r) return r;
				if (t == null) {
					for (var i = 0; i < n.length; i++) if (n[i]) return n[i];
				}
			}
		}, t.prototype.queryComponents = function(e) {
			var t = e.mainType;
			if (!t) return [];
			var n = e.index, r = e.id, i = e.name, a = this._componentsMap.get(t);
			if (!a || !a.length) return [];
			var o;
			return n == null ? o = r == null ? i == null ? at(a, function(e) {
				return !!e;
			}) : PO("name", i, a) : PO("id", r, a) : (o = [], z(Al(n), function(e) {
				a[e] && o.push(a[e]);
			})), FO(o, e);
		}, t.prototype.findComponents = function(e) {
			var t = e.query, n = e.mainType, r = i(t);
			return a(FO(r ? this.queryComponents(r) : at(this._componentsMap.get(n), function(e) {
				return !!e;
			}), e));
			function i(e) {
				var t = n + "Index", r = n + "Id", i = n + "Name";
				return e && (e[t] != null || e[r] != null || e[i] != null) ? {
					mainType: n,
					index: e[t],
					id: e[r],
					name: e[i]
				} : null;
			}
			function a(t) {
				return e.filter ? at(t, e.filter) : t;
			}
		}, t.prototype.eachComponent = function(e, t, n) {
			var r = this._componentsMap;
			if (H(e)) {
				var i = t, a = e;
				r.each(function(e, t) {
					for (var n = 0; e && n < e.length; n++) {
						var r = e[n];
						r && a.call(i, t, r, r.componentIndex);
					}
				});
			} else for (var o = U(e) ? r.get(e) : W(e) ? this.findComponents(e) : null, s = 0; o && s < o.length; s++) {
				var c = o[s];
				c && t.call(n, c, c.componentIndex);
			}
		}, t.prototype.getSeriesByName = function(e) {
			var t = Ul(e, null);
			return at(this._componentsMap.get("series"), function(e) {
				return !!e && t != null && e.name === t;
			});
		}, t.prototype.getSeriesByIndex = function(e) {
			return this._componentsMap.get("series")[e];
		}, t.prototype.getSeriesByType = function(e) {
			return at(this._componentsMap.get("series"), function(t) {
				return !!t && t.subType === e;
			});
		}, t.prototype.getSeries = function() {
			return at(this._componentsMap.get("series"), function(e) {
				return !!e;
			});
		}, t.prototype.getSeriesCount = function() {
			return this._componentsCount.get("series");
		}, t.prototype.eachSeries = function(e, t) {
			RO(this), z(this._seriesIndices, function(n) {
				var r = this._componentsMap.get("series")[n];
				e.call(t, r, n);
			}, this);
		}, t.prototype.eachRawSeries = function(e, t) {
			z(this._componentsMap.get("series"), function(n) {
				n && e.call(t, n, n.componentIndex);
			});
		}, t.prototype.eachSeriesByType = function(e, t, n) {
			RO(this), z(this._seriesIndices, function(r) {
				var i = this._componentsMap.get("series")[r];
				i.subType === e && t.call(n, i, r);
			}, this);
		}, t.prototype.eachRawSeriesByType = function(e, t, n) {
			return z(this.getSeriesByType(e), t, n);
		}, t.prototype.isSeriesFiltered = function(e) {
			return RO(this), this._seriesIndicesMap.get(e.componentIndex) == null;
		}, t.prototype.getCurrentSeriesIndices = function() {
			return (this._seriesIndices || []).slice();
		}, t.prototype.filterSeries = function(e, t) {
			RO(this);
			var n = [];
			z(this._seriesIndices, function(r) {
				var i = this._componentsMap.get("series")[r];
				e.call(t, i, r) && n.push(r);
			}, this), this._seriesIndices = n, this._seriesIndicesMap = K(n);
		}, t.prototype.restoreData = function(e) {
			LO(this);
			var t = this._componentsMap, n = [];
			t.each(function(e, t) {
				Ly.hasClass(t) && n.push(t);
			}), Ly.topologicalTravel(n, Ly.getAllClassMainTypes(), function(n) {
				z(t.get(n), function(t) {
					t && (n !== "series" || !MO(t, e)) && t.restoreData();
				});
			});
		}, t.internalField = function() {
			LO = function(e) {
				var t = e._seriesIndices = [];
				z(e._componentsMap.get("series"), function(e) {
					e && t.push(e.componentIndex);
				}), e._seriesIndicesMap = K(t);
			}, RO = function(e) {}, zO = function(e, t) {
				e.option = {}, e.option[BO] = VO, e._componentsMap = K({ series: [] }), e._componentsCount = K();
				var n = t.aria;
				W(n) && n.enabled == null && (n.enabled = !0), NO(t, e._theme.option), Qe(t, DO, !1), e._mergeOption(t, null);
			};
		}(), t;
	}(Sh), nt(HO, Uy);
}));
//#endregion
//#region node_modules/echarts/lib/model/OptionManager.js
function WO(e, t, n) {
	var r = [], i, a, o = e.baseOption, s = e.timeline, c = e.options, l = e.media, u = !!e.media, d = !!(c || s || o && o.timeline);
	o ? (a = o, a.timeline || (a.timeline = s)) : ((d || u) && (e.options = e.media = null), a = e), u && V(l) && z(l, function(e) {
		e && e.option && (e.query ? r.push(e) : i ||= e);
	}), f(a), z(c, function(e) {
		return f(e);
	}), z(r, function(e) {
		return f(e.option);
	});
	function f(e) {
		z(t, function(t) {
			t(e, n);
		});
	}
	return {
		baseOption: a,
		timelineOptions: c || [],
		mediaDefault: i,
		mediaList: r
	};
}
function GO(e, t, n) {
	var r = {
		width: t,
		height: n,
		aspectratio: t / n
	}, i = !0;
	return z(e, function(e, t) {
		var n = t.match(JO);
		if (n && n[1] && n[2]) {
			var a = n[1];
			KO(r[n[2].toLowerCase()], e, a) || (i = !1);
		}
	}), i;
}
function KO(e, t, n) {
	return n === "min" ? e >= t : n === "max" ? e <= t : e === t;
}
function qO(e, t) {
	return e.join(",") === t.join(",");
}
var JO, YO, XO = M((() => {
	Z(), q(), JO = /^(min|max)?(.+)$/, YO = function() {
		function e(e) {
			this._timelineOptions = [], this._mediaList = [], this._currentMediaIndices = [], this._api = e;
		}
		return e.prototype.setOption = function(e, t, n) {
			e && (z(Al(e.series), function(e) {
				e && e.data && pt(e.data) && wt(e.data);
			}), z(Al(e.dataset), function(e) {
				e && e.source && pt(e.source) && wt(e.source);
			})), e = I(e);
			var r = this._optionBackup, i = WO(e, t, !r);
			this._newBaseOption = i.baseOption, r ? (i.timelineOptions.length && (r.timelineOptions = i.timelineOptions), i.mediaList.length && (r.mediaList = i.mediaList), i.mediaDefault && (r.mediaDefault = i.mediaDefault)) : this._optionBackup = i;
		}, e.prototype.mountOption = function(e) {
			var t = this._optionBackup;
			return this._timelineOptions = t.timelineOptions, this._mediaList = t.mediaList, this._mediaDefault = t.mediaDefault, this._currentMediaIndices = [], I(e ? t.baseOption : this._newBaseOption);
		}, e.prototype.getTimelineOption = function(e) {
			var t, n = this._timelineOptions;
			if (n.length) {
				var r = e.getComponent("timeline");
				r && (t = I(n[r.getCurrentIndex()]));
			}
			return t;
		}, e.prototype.getMediaOption = function(e) {
			var t = this._api.getWidth(), n = this._api.getHeight(), r = this._mediaList, i = this._mediaDefault, a = [], o = [];
			if (!r.length && !i) return o;
			for (var s = 0, c = r.length; s < c; s++) GO(r[s].query, t, n) && a.push(s);
			return !a.length && i && (a = [-1]), a.length && !qO(a, this._currentMediaIndices) && (o = B(a, function(e) {
				return I(e === -1 ? i.option : r[e].option);
			})), this._currentMediaIndices = a, o;
		}, e;
	}();
}));
//#endregion
//#region node_modules/echarts/lib/preprocessor/helper/compatStyle.js
function ZO(e) {
	var t = e && e.itemStyle;
	if (t) for (var n = 0, r = ck.length; n < r; n++) {
		var i = ck[n], a = t.normal, o = t.emphasis;
		a && a[i] && (e[i] = e[i] || {}, e[i].normal ? Qe(e[i].normal, a[i]) : e[i].normal = a[i], a[i] = null), o && o[i] && (e[i] = e[i] || {}, e[i].emphasis ? Qe(e[i].emphasis, o[i]) : e[i].emphasis = o[i], o[i] = null);
	}
}
function QO(e, t, n) {
	if (e && e[t] && (e[t].normal || e[t].emphasis)) {
		var r = e[t].normal, i = e[t].emphasis;
		r && (n ? (e[t].normal = e[t].emphasis = null, et(e[t], r)) : e[t] = r), i && (e.emphasis = e.emphasis || {}, e.emphasis[t] = i, i.focus && (e.emphasis.focus = i.focus), i.blurScope && (e.emphasis.blurScope = i.blurScope));
	}
}
function $O(e) {
	QO(e, "itemStyle"), QO(e, "lineStyle"), QO(e, "areaStyle"), QO(e, "label"), QO(e, "labelLine"), QO(e, "upperLabel"), QO(e, "edgeLabel");
}
function ek(e, t) {
	var n = sk(e) && e[t], r = sk(n) && n.textStyle;
	if (r) for (var i = 0, a = xu.length; i < a; i++) {
		var o = xu[i];
		r.hasOwnProperty(o) && (n[o] = r[o]);
	}
}
function tk(e) {
	e && ($O(e), ek(e, "label"), e.emphasis && ek(e.emphasis, "label"));
}
function nk(e) {
	if (sk(e)) {
		ZO(e), $O(e), ek(e, "label"), ek(e, "upperLabel"), ek(e, "edgeLabel"), e.emphasis && (ek(e.emphasis, "label"), ek(e.emphasis, "upperLabel"), ek(e.emphasis, "edgeLabel"));
		var t = e.markPoint;
		t && (ZO(t), tk(t));
		var n = e.markLine;
		n && (ZO(n), tk(n));
		var r = e.markArea;
		r && tk(r);
		var i = e.data;
		if (e.type === "graph") {
			i ||= e.nodes;
			var a = e.links || e.edges;
			if (a && !pt(a)) for (var o = 0; o < a.length; o++) tk(a[o]);
			z(e.categories, function(e) {
				$O(e);
			});
		}
		if (i && !pt(i)) for (var o = 0; o < i.length; o++) tk(i[o]);
		if (t = e.markPoint, t && t.data) for (var s = t.data, o = 0; o < s.length; o++) tk(s[o]);
		if (n = e.markLine, n && n.data) for (var c = n.data, o = 0; o < c.length; o++) V(c[o]) ? (tk(c[o][0]), tk(c[o][1])) : tk(c[o]);
		e.type === "gauge" ? (ek(e, "axisLabel"), ek(e, "title"), ek(e, "detail")) : e.type === "treemap" ? (QO(e.breadcrumb, "itemStyle"), z(e.levels, function(e) {
			$O(e);
		})) : e.type === "tree" && $O(e.leaves);
	}
}
function rk(e) {
	return V(e) ? e : e ? [e] : [];
}
function ik(e) {
	return (V(e) ? e[0] : e) || {};
}
function ak(e, t) {
	ok(rk(e.series), function(e) {
		sk(e) && nk(e);
	});
	var n = [
		"xAxis",
		"yAxis",
		"radiusAxis",
		"angleAxis",
		"singleAxis",
		"parallelAxis",
		"radar"
	];
	t && n.push("valueAxis", "categoryAxis", "logAxis", "timeAxis"), ok(n, function(t) {
		ok(rk(e[t]), function(e) {
			e && (ek(e, "axisLabel"), ek(e.axisPointer, "label"));
		});
	}), ok(rk(e.parallel), function(e) {
		var t = e && e.parallelAxisDefault;
		ek(t, "axisLabel"), ek(t && t.axisPointer, "label");
	}), ok(rk(e.calendar), function(e) {
		QO(e, "itemStyle"), ek(e, "dayLabel"), ek(e, "monthLabel"), ek(e, "yearLabel");
	}), ok(rk(e.radar), function(e) {
		ek(e, "name"), e.name && e.axisName == null && (e.axisName = e.name, delete e.name), e.nameGap != null && e.axisNameGap == null && (e.axisNameGap = e.nameGap, delete e.nameGap);
	}), ok(rk(e.geo), function(e) {
		sk(e) && (tk(e), ok(rk(e.regions), function(e) {
			tk(e);
		}));
	}), ok(rk(e.timeline), function(e) {
		tk(e), QO(e, "label"), QO(e, "itemStyle"), QO(e, "controlStyle", !0);
		var t = e.data;
		V(t) && z(t, function(e) {
			W(e) && (QO(e, "label"), QO(e, "itemStyle"));
		});
	}), ok(rk(e.toolbox), function(e) {
		QO(e, "iconStyle"), ok(e.feature, function(e) {
			QO(e, "iconStyle");
		});
	}), ek(ik(e.axisPointer), "label"), ek(ik(e.tooltip).axisPointer, "label");
}
var ok, sk, ck, lk = M((() => {
	q(), Z(), ok = z, sk = W, ck = [
		"areaStyle",
		"lineStyle",
		"nodeStyle",
		"linkStyle",
		"chordStyle",
		"label",
		"labelLine"
	];
}));
//#endregion
//#region node_modules/echarts/lib/preprocessor/backwardCompat.js
function uk(e, t) {
	for (var n = t.split(","), r = e, i = 0; i < n.length && (r &&= r[n[i]], r != null); i++);
	return r;
}
function dk(e, t, n, r) {
	for (var i = t.split(","), a = e, o, s = 0; s < i.length - 1; s++) o = i[s], a[o] ?? (a[o] = {}), a = a[o];
	(r || a[i[s]] == null) && (a[i[s]] = n);
}
function fk(e) {
	e && z(yk, function(t) {
		t[0] in e && !(t[1] in e) && (e[t[1]] = e[t[0]]);
	});
}
function pk(e) {
	var t = e && e.itemStyle;
	if (t) for (var n = 0; n < xk.length; n++) {
		var r = xk[n][1], i = xk[n][0];
		t[r] != null && (t[i] = t[r]);
	}
}
function mk(e) {
	e && e.alignTo === "edge" && e.margin != null && e.edgeDistance == null && (e.edgeDistance = e.margin);
}
function hk(e) {
	e && e.downplay && !e.blur && (e.blur = e.downplay);
}
function gk(e) {
	e && e.focusNodeAdjacency != null && (e.emphasis = e.emphasis || {}, e.emphasis.focus ?? (e.emphasis.focus = "adjacency"));
}
function _k(e, t) {
	if (e) for (var n = 0; n < e.length; n++) t(e[n]), e[n] && _k(e[n].children, t);
}
function vk(e, t) {
	ak(e, t), e.series = Al(e.series), z(e.series, function(e) {
		if (W(e)) {
			var t = e.type;
			if (t === "line") e.clipOverflow != null && (e.clip = e.clipOverflow);
			else if (t === "pie" || t === "gauge") {
				e.clockWise != null && (e.clockwise = e.clockWise), mk(e.label);
				var n = e.data;
				if (n && !pt(n)) for (var r = 0; r < n.length; r++) mk(n[r]);
				e.hoverOffset != null && (e.emphasis = e.emphasis || {}, (e.emphasis.scaleSize = null) && (e.emphasis.scaleSize = e.hoverOffset));
			} else if (t === "gauge") {
				var i = uk(e, "pointer.color");
				i != null && dk(e, "itemStyle.color", i);
			} else if (t === "bar") {
				pk(e), pk(e.backgroundStyle), pk(e.emphasis);
				var n = e.data;
				if (n && !pt(n)) for (var r = 0; r < n.length; r++) typeof n[r] == "object" && (pk(n[r]), pk(n[r] && n[r].emphasis));
			} else if (t === "sunburst") {
				var a = e.highlightPolicy;
				a && (e.emphasis = e.emphasis || {}, e.emphasis.focus || (e.emphasis.focus = a)), hk(e), _k(e.data, hk);
			} else t === "graph" || t === "sankey" ? gk(e) : t === "map" && (e.mapType && !e.map && (e.map = e.mapType), e.mapLocation && et(e, e.mapLocation));
			e.hoverAnimation != null && (e.emphasis = e.emphasis || {}, e.emphasis && e.emphasis.scale == null && (e.emphasis.scale = e.hoverAnimation)), fk(e);
		}
	}), e.dataRange && (e.visualMap = e.dataRange), z(bk, function(t) {
		var n = e[t];
		n && (V(n) || (n = [n]), z(n, function(e) {
			fk(e);
		}));
	});
}
var yk, bk, xk, Sk = M((() => {
	q(), lk(), Z(), yk = [
		["x", "left"],
		["y", "top"],
		["x2", "right"],
		["y2", "bottom"]
	], bk = [
		"grid",
		"geo",
		"parallel",
		"legend",
		"toolbox",
		"title",
		"visualMap",
		"dataZoom",
		"timeline"
	], xk = [
		["borderRadius", "barBorderRadius"],
		["borderColor", "barBorderColor"],
		["borderWidth", "barBorderWidth"]
	];
}));
//#endregion
//#region node_modules/echarts/lib/processor/dataStack.js
function Ck(e) {
	var t = K();
	e.eachSeries(function(e) {
		var n = e.get("stack");
		if (n) {
			var r = t.get(n) || t.set(n, []), i = e.getData(), a = {
				stackResultDimension: i.getCalculationInfo("stackResultDimension"),
				stackedOverDimension: i.getCalculationInfo("stackedOverDimension"),
				stackedDimension: i.getCalculationInfo("stackedDimension"),
				stackedByDimension: i.getCalculationInfo("stackedByDimension"),
				isStackedByIndex: i.getCalculationInfo("isStackedByIndex"),
				data: i,
				seriesModel: e
			};
			if (!a.stackedDimension || !(a.isStackedByIndex || a.stackedByDimension)) return;
			r.push(a);
		}
	}), t.each(function(e) {
		e.length !== 0 && ((e[0].seriesModel.get("stackOrder") || "seriesAsc") === "seriesDesc" && e.reverse(), z(e, function(t, n) {
			t.data.setCalculationInfo("stackedOnSeries", n > 0 ? e[n - 1].seriesModel : null);
		}), wk(e));
	});
}
function wk(e) {
	z(e, function(t, n) {
		var r = [], i = [NaN, NaN], a = [t.stackResultDimension, t.stackedOverDimension], o = t.data, s = t.isStackedByIndex, c = t.seriesModel.get("stackStrategy") || "samesign";
		o.modify(a, function(a, l, u) {
			var d = o.get(t.stackedDimension, u);
			if (isNaN(d)) return i;
			var f, p;
			s ? p = o.getRawIndex(u) : f = o.get(t.stackedByDimension, u);
			for (var m = NaN, h = n - 1; h >= 0; h--) {
				var g = e[h];
				if (s || (p = g.data.rawIndexOf(g.stackedByDimension, f)), p >= 0) {
					var _ = g.data.getByRawIndex(g.stackResultDimension, p);
					if (c === "all" || c === "positive" && _ > 0 || c === "negative" && _ < 0 || c === "samesign" && d >= 0 && _ > 0 || c === "samesign" && d <= 0 && _ < 0) {
						d = qc(d, _), m = _;
						break;
					}
				}
			}
			return r[0] = d, r[1] = m, r;
		});
	});
}
var Tk, Ek = M((() => {
	q(), X(), Z(), Tk = vu(Ck);
})), Dk, Ok = M((() => {
	xf(), W_(), hn(), Dk = function() {
		function e() {
			this.group = new bf(), this.uid = z_("viewComponent");
		}
		return e.prototype.init = function(e, t) {}, e.prototype.render = function(e, t, n, r) {}, e.prototype.dispose = function(e, t) {}, e.prototype.updateView = function(e, t, n, r) {}, e.prototype.updateLayout = function(e, t, n, r) {}, e.prototype.updateVisual = function(e, t, n, r) {}, e.prototype.toggleBlurSeries = function(e, t, n) {}, e.prototype.eachRendered = function(e) {
			var t = this.group;
			t && t.traverse(e);
		}, e;
	}(), rn(Dk), un(Dk);
}));
//#endregion
//#region node_modules/echarts/lib/visual/style.js
function kk(e, t) {
	return e.visualStyleMapper || Mk[t] || (console.warn("Unknown style type '" + t + "'."), Mk.itemStyle);
}
function Ak(e, t) {
	return e.visualDrawType || Nk[t] || (console.warn("Unknown style type '" + t + "'."), "fill");
}
var jk, Mk, Nk, Pk, Fk, Ik, Lk, Rk = M((() => {
	q(), _n(), xh(), _h(), Ch(), Z(), jk = Yl(), Mk = {
		itemStyle: gn(vh, !0),
		lineStyle: gn(mh, !0)
	}, Nk = {
		lineStyle: "stroke",
		itemStyle: "fill"
	}, Pk = {
		createOnAllSeries: !0,
		performRawSeries: !0,
		reset: function(e, t) {
			var n = e.getData(), r = e.visualStyleAccessPath || "itemStyle", i = e.getModel(r), a = kk(e, r)(i), o = i.getShallow("decal");
			o && (n.setVisual("decal", o), o.dirty = !0);
			var s = Ak(e, r), c = a[s], l = H(c) ? c : null, u = a.fill === "auto" || a.stroke === "auto";
			if (!a[s] || l || u) {
				var d = e.getColorFromPalette(e.name, null, t.getSeriesCount());
				a[s] || (a[s] = d, n.setVisual("colorFromPalette", !0)), a.fill = a.fill === "auto" || H(a.fill) ? d : a.fill, a.stroke = a.stroke === "auto" || H(a.stroke) ? d : a.stroke;
			}
			if (n.setVisual("style", a), n.setVisual("drawType", s), !t.isSeriesFiltered(e) && l) return n.setVisual("colorFromPalette", !1), { dataEach: function(t, n) {
				var r = e.getDataParams(n), i = L({}, a);
				i[s] = l(r), t.setItemVisual(n, "style", i);
			} };
		}
	}, Fk = new Sh(), Ik = {
		createOnAllSeries: !0,
		reset: function(e, t) {
			if (!e.ignoreStyleOnData) {
				var n = e.getData(), r = e.visualStyleAccessPath || "itemStyle", i = kk(e, r), a = n.getVisual("drawType");
				return { dataEach: n.hasItemOption ? function(e, t) {
					var n = e.getRawDataItem(t);
					if (n && n[r]) {
						Fk.option = n[r];
						var o = i(Fk);
						L(e.ensureUniqueItemVisual(t, "style"), o), Fk.option.decal && (e.setItemVisual(t, "decal", Fk.option.decal), Fk.option.decal.dirty = !0), a in o && e.setItemVisual(t, "colorFromPalette", !1);
					}
				} : null };
			}
		}
	}, Lk = {
		performRawSeries: !0,
		overallReset: function(e) {
			var t = K();
			e.eachSeries(function(e) {
				if (!e.isColorBySeries()) {
					var n = e.type + "-" + e.getColorBy();
					jk(e).scope = t.get(n) || t.set(n, {});
				}
			}), e.eachSeries(function(e) {
				if (!e.isColorBySeries()) {
					var t = e.getRawData(), n = {}, r = e.getData(), i = jk(e).scope, a = Ak(e, e.visualStyleAccessPath || "itemStyle");
					r.each(function(e) {
						var t = r.getRawIndex(e);
						n[t] = e;
					}), t.each(function(o) {
						var s = n[o];
						if (r.getItemVisual(s, "colorFromPalette")) {
							var c = r.ensureUniqueItemVisual(s, "style"), l = t.getName(o) || o + "", u = t.count();
							c[a] = e.getColorFromPalette(l, i, u);
						}
					});
				}
			});
		}
	};
}));
//#endregion
//#region node_modules/echarts/lib/loading/default.js
function zk(e, t) {
	t ||= {}, et(t, {
		text: "loading",
		textColor: Q.color.primary,
		fontSize: 12,
		fontWeight: "normal",
		fontStyle: "normal",
		fontFamily: "sans-serif",
		maskColor: "rgba(255,255,255,0.8)",
		showSpinner: !0,
		color: Q.color.theme[0],
		spinnerRadius: 10,
		lineWidth: 5,
		zlevel: 0
	});
	var n = new bf(), r = new gc({
		style: { fill: t.maskColor },
		zlevel: t.zlevel,
		z: 1e4
	});
	n.add(r);
	var i = new Mc({
		style: {
			text: t.text,
			fill: t.textColor,
			fontSize: t.fontSize,
			fontWeight: t.fontWeight,
			fontStyle: t.fontStyle,
			fontFamily: t.fontFamily
		},
		zlevel: t.zlevel,
		z: 10001
	}), a = new gc({
		style: { fill: "none" },
		textContent: i,
		textConfig: {
			position: "right",
			distance: 10
		},
		zlevel: t.zlevel,
		z: 10001
	});
	n.add(a);
	var o;
	return t.showSpinner && (o = new gp({
		shape: {
			startAngle: -Bk / 2,
			endAngle: -Bk / 2 + .1,
			r: t.spinnerRadius
		},
		style: {
			stroke: t.color,
			lineCap: "round",
			lineWidth: t.lineWidth
		},
		zlevel: t.zlevel,
		z: 10001
	}), o.animateShape(!0).when(1e3, { endAngle: Bk * 3 / 2 }).start("circularInOut"), o.animateShape(!0).when(1e3, { startAngle: Bk * 3 / 2 }).delay(300).start("circularInOut"), n.add(o)), n.resize = function() {
		var n = i.getBoundingRect().width, s = t.showSpinner ? t.spinnerRadius : 0, c = (e.getWidth() - s * 2 - (t.showSpinner && n ? 10 : 0) - n) / 2 - (t.showSpinner && n ? 0 : 5 + n / 2) + (t.showSpinner ? 0 : n / 2) + (n ? 0 : s), l = e.getHeight() / 2;
		t.showSpinner && o.setShape({
			cx: c,
			cy: l
		}), a.setShape({
			x: c - s,
			y: l - s,
			width: s * 2,
			height: s * 2
		}), r.setShape({
			x: 0,
			y: 0,
			width: e.getWidth(),
			height: e.getHeight()
		});
	}, n.resize(), n;
}
var Bk, Vk = M((() => {
	q(), Gm(), _b(), Bk = Math.PI;
}));
//#endregion
//#region node_modules/echarts/lib/core/Scheduler.js
function Hk(e) {
	e.overallReset(e.ecModel, e.api, e.payload);
}
function Uk(e) {
	return e.dirtyOnOverallProgress && Wk;
}
function Wk() {
	this.agent.dirty(), this.getDownstream().dirty();
}
function Gk() {
	this.agent && this.agent.dirty();
}
function Kk(e) {
	return e.plan ? e.plan(e.model, e.ecModel, e.api, e.payload) : null;
}
function qk(e) {
	e.useClearVisual && e.data.clearAllVisual();
	var t = e.resetDefines = Al(e.reset(e.model, e.ecModel, e.api, e.payload));
	return t.length > 1 ? B(t, function(e, t) {
		return Jk(t);
	}) : $k;
}
function Jk(e) {
	return function(t, n) {
		var r = n.data, i = n.resetDefines[e];
		if (i && i.dataEach) for (var a = t.start; a < t.end; a++) i.dataEach(r, a);
		else i && i.progress && i.progress(t, r);
	};
}
function Yk(e) {
	return e.data.count();
}
function Xk(e) {
	nA = null;
	try {
		e(eA, tA);
	} catch {}
	return nA;
}
function Zk(e, t) {
	for (var n in t.prototype) e[n] = jt;
}
var Qk, $k, eA, tA, nA, rA = M((() => {
	q(), Qy(), W_(), UO(), Bu(), Z(), Qk = function() {
		function e(e, t, n, r) {
			this._stageTaskMap = K(), this.ecInstance = e, this.api = t, n = this._dataProcessorHandlers = n.slice(), r = this._visualHandlers = r.slice(), this._allHandlers = n.concat(r);
		}
		return e.prototype.restoreData = function(e, t) {
			e.restoreData(t), this._stageTaskMap.each(function(e) {
				var t = e.overallTask;
				t && t.dirty();
			});
		}, e.prototype.getPerformArgs = function(e, t) {
			if (e.__pipeline) {
				var n = this._pipelineMap.get(e.__pipeline.id), r = n.context, i = !t && n.progressiveEnabled && (!r || r.progressiveRender) && e.__idxInPipeline > n.blockIndex ? n.step : null, a = r && r.modDataCount;
				return {
					step: i,
					modBy: a == null ? null : Math.ceil(a / i),
					modDataCount: a
				};
			}
		}, e.prototype.getPipeline = function(e) {
			return this._pipelineMap.get(e);
		}, e.prototype.updateStreamModes = function(e, t) {
			var n = this._pipelineMap.get(e.uid);
			e.pipelineContext = n.context = e.__preparePipelineContext ? e.__preparePipelineContext(t, n) : _u(e, t, n);
		}, e.prototype.restorePipelines = function(e, t) {
			var n = this, r = n._pipelineMap = K();
			t.eachSeries(function(t) {
				var i = e.painter.type === "canvas" && t.getProgressive(), a = t.uid;
				r.set(a, {
					id: a,
					head: null,
					tail: null,
					threshold: t.getProgressiveThreshold(),
					progressiveEnabled: i && !(t.preventIncremental && t.preventIncremental()),
					blockIndex: -1,
					step: Math.round(i || 700),
					count: 0
				}), n._pipe(t, t.dataTask);
			});
		}, e.prototype.prepareStageTasks = function() {
			var e = this._stageTaskMap, t = this.api.getModel(), n = this.api;
			z(this._allHandlers, function(r) {
				var i = e.get(r.uid) || e.set(r.uid, {});
				St(!(r.reset && r.overallReset), ""), r.reset && this._createSeriesStageTask(r, i, t, n), r.overallReset && this._createOverallStageTask(r, i, t, n);
			}, this);
		}, e.prototype.prepareView = function(e, t, n, r) {
			var i = e.renderTask, a = i.context;
			a.model = t, a.ecModel = n, a.api = r, i.__block = !e.incrementalPrepareRender, this._pipe(t, i);
		}, e.prototype.performDataProcessorTasks = function(e, t) {
			this._performStageTasks(this._dataProcessorHandlers, e, t, { block: !0 });
		}, e.prototype.performVisualTasks = function(e, t, n) {
			this._performStageTasks(this._visualHandlers, e, t, n);
		}, e.prototype._performStageTasks = function(e, t, n, r) {
			r ||= {};
			var i = !1, a = this;
			z(e, function(e, s) {
				if (!(r.visualType && r.visualType !== e.visualType)) {
					var c = a._stageTaskMap.get(e.uid), l = c.seriesTaskMap, u = c.overallTask;
					if (u) {
						var d, f = u.agentStubMap;
						f.each(function(e) {
							o(r, e) && (e.dirty(), d = !0);
						}), d && u.dirty(), a.updatePayload(u, n);
						var p = a.getPerformArgs(u, r.block);
						f.each(function(e) {
							e.perform(p);
						}), u.perform(p) && (i = !0);
					} else l && l.each(function(s, c) {
						o(r, s) && s.dirty();
						var l = a.getPerformArgs(s, r.block);
						l.skip = !e.performRawSeries && t.isSeriesFiltered(s.context.model), a.updatePayload(s, n), s.perform(l) && (i = !0);
					});
				}
			});
			function o(e, t) {
				return e.setDirty && (!e.dirtyMap || e.dirtyMap.get(t.__pipeline.id));
			}
			this.unfinished = i || this.unfinished;
		}, e.prototype.performSeriesTasks = function(e) {
			var t;
			e.eachSeries(function(e) {
				t = e.dataTask.perform() || t;
			}), this.unfinished = t || this.unfinished;
		}, e.prototype.plan = function() {
			this._pipelineMap.each(function(e) {
				var t = e.tail;
				do {
					if (t.__block) {
						e.blockIndex = t.__idxInPipeline;
						break;
					}
					t = t.getUpstream();
				} while (t);
			});
		}, e.prototype.updatePayload = function(e, t) {
			t !== "remain" && (e.context.payload = t);
		}, e.prototype._createSeriesStageTask = function(e, t, n, r) {
			var i = this, a = t.seriesTaskMap, o = t.seriesTaskMap = K(), s = e.seriesType, c = e.getTargetSeries;
			e.createOnAllSeries ? n.eachRawSeries(l) : s ? n.eachRawSeriesByType(s, l) : c && c(n, r).each(l);
			function l(t) {
				var s = t.uid, c = o.set(s, a && a.get(s) || Yy({
					plan: Kk,
					reset: qk,
					count: Yk
				}));
				c.context = {
					model: t,
					ecModel: n,
					api: r,
					useClearVisual: e.isVisual && !e.isLayout,
					plan: e.plan,
					reset: e.reset,
					scheduler: i
				}, i._pipe(t, c);
			}
		}, e.prototype._createOverallStageTask = function(e, t, n, r) {
			var i = this, a = t.overallTask = t.overallTask || Yy({ reset: Hk });
			a.context = {
				ecModel: n,
				api: r,
				overallReset: e.overallReset,
				scheduler: i
			};
			var o = a.agentStubMap, s = a.agentStubMap = K(), c = e.seriesType, l = e.getTargetSeries, u = e.dirtyOnOverallProgress, d = !1;
			St(!e.createOnAllSeries, ""), c ? n.eachRawSeriesByType(c, f) : l ? l(n, r).each(f) : z(n.getSeries(), f);
			function f(e) {
				var t = e.uid, n = s.set(t, o && o.get(t) || (d = !0, Yy({
					reset: Uk,
					onDirty: Gk
				})));
				n.context = {
					model: e,
					dirtyOnOverallProgress: u
				}, n.agent = a, n.__block = u, i._pipe(e, n);
			}
			d && a.dirty();
		}, e.prototype._pipe = function(e, t) {
			var n = e.uid, r = this._pipelineMap.get(n);
			!r.head && (r.head = t), r.tail && r.tail.pipe(t), r.tail = t, t.__idxInPipeline = r.count++, t.__pipeline = r;
		}, e.wrapStageHandler = function(e, t) {
			return H(e) && (e = {
				overallReset: e,
				seriesType: Xk(e)
			}), e.uid = z_("stageHandler"), t && (e.visualType = t), e;
		}, e;
	}(), $k = Jk(0), eA = {}, tA = {}, Zk(eA, HO), Zk(tA, zu), eA.eachSeriesByType = eA.eachRawSeriesByType = function(e) {
		nA = e;
	}, eA.eachComponent = function(e) {
		e.mainType === "series" && e.subType && (nA = e.subType);
	};
})), $, iA, aA, oA, sA, cA = M((() => {
	_b(), $ = Q.darkColor, iA = $.background, aA = function() {
		return {
			axisLine: { lineStyle: { color: $.axisLine } },
			splitLine: { lineStyle: { color: $.axisSplitLine } },
			splitArea: { areaStyle: { color: [$.backgroundTint, $.backgroundTransparent] } },
			minorSplitLine: { lineStyle: { color: $.axisMinorSplitLine } },
			axisLabel: { color: $.axisLabel },
			axisName: {}
		};
	}, oA = {
		label: { color: $.secondary },
		itemStyle: { borderColor: $.borderTint },
		dividerLineStyle: { color: $.border }
	}, sA = {
		darkMode: !0,
		color: $.theme,
		backgroundColor: iA,
		axisPointer: {
			lineStyle: { color: $.border },
			crossStyle: { color: $.borderShade },
			label: { color: $.tertiary }
		},
		legend: {
			textStyle: { color: $.secondary },
			pageTextStyle: { color: $.tertiary }
		},
		textStyle: { color: $.secondary },
		title: {
			textStyle: { color: $.primary },
			subtextStyle: { color: $.quaternary }
		},
		toolbox: {
			iconStyle: { borderColor: $.accent50 },
			feature: { dataView: {
				backgroundColor: iA,
				textColor: $.primary,
				textareaColor: $.background,
				textareaBorderColor: $.border,
				buttonColor: $.accent50,
				buttonTextColor: $.neutral00
			} }
		},
		tooltip: {
			backgroundColor: $.neutral20,
			defaultBorderColor: $.border,
			textStyle: { color: $.tertiary }
		},
		dataZoom: {
			borderColor: $.accent10,
			textStyle: { color: $.tertiary },
			brushStyle: { color: $.backgroundTint },
			handleStyle: {
				color: $.neutral00,
				borderColor: $.accent20
			},
			moveHandleStyle: { color: $.accent40 },
			emphasis: { handleStyle: { borderColor: $.accent50 } },
			dataBackground: {
				lineStyle: { color: $.accent30 },
				areaStyle: { color: $.accent20 }
			},
			selectedDataBackground: {
				lineStyle: { color: $.accent50 },
				areaStyle: { color: $.accent30 }
			}
		},
		visualMap: {
			textStyle: { color: $.secondary },
			handleStyle: { borderColor: $.neutral30 }
		},
		timeline: {
			lineStyle: { color: $.accent10 },
			label: { color: $.tertiary },
			controlStyle: {
				color: $.accent30,
				borderColor: $.accent30
			}
		},
		calendar: {
			itemStyle: {
				color: $.neutral00,
				borderColor: $.neutral20
			},
			dayLabel: { color: $.tertiary },
			monthLabel: { color: $.secondary },
			yearLabel: { color: $.secondary }
		},
		matrix: {
			x: oA,
			y: oA,
			backgroundColor: { borderColor: $.axisLine },
			body: { itemStyle: { borderColor: $.borderTint } }
		},
		timeAxis: aA(),
		logAxis: aA(),
		valueAxis: aA(),
		categoryAxis: aA(),
		line: { symbol: "circle" },
		graph: { color: $.theme },
		gauge: {
			title: { color: $.secondary },
			axisLine: { lineStyle: { color: [[1, $.neutral05]] } },
			axisLabel: { color: $.axisLabel },
			detail: { color: $.primary }
		},
		candlestick: { itemStyle: {
			color: "#f64e56",
			color0: "#54ea92",
			borderColor: "#f64e56",
			borderColor0: "#54ea92"
		} },
		funnel: { itemStyle: { borderColor: $.background } },
		radar: function() {
			var e = aA();
			return e.axisName = { color: $.axisLabel }, e.axisLine.lineStyle.color = $.neutral20, e;
		}(),
		treemap: { breadcrumb: {
			itemStyle: {
				color: $.neutral20,
				textStyle: { color: $.secondary }
			},
			emphasis: { itemStyle: { color: $.neutral30 } }
		} },
		sunburst: { itemStyle: { borderColor: $.background } },
		map: {
			itemStyle: {
				borderColor: $.border,
				areaColor: $.neutral10
			},
			label: { color: $.tertiary },
			emphasis: {
				label: { color: $.primary },
				itemStyle: { areaColor: $.highlight }
			},
			select: {
				label: { color: $.primary },
				itemStyle: { areaColor: $.highlight }
			}
		},
		geo: {
			itemStyle: {
				borderColor: $.border,
				areaColor: $.neutral10
			},
			emphasis: {
				label: { color: $.primary },
				itemStyle: { areaColor: $.highlight }
			},
			select: {
				label: { color: $.primary },
				itemStyle: { color: $.highlight }
			}
		}
	}, sA.categoryAxis.splitLine.show = !1;
})), lA, uA = M((() => {
	q(), hn(), lA = function() {
		function e() {}
		return e.prototype.normalizeQuery = function(e) {
			var t = {}, n = {}, r = {};
			if (U(e)) {
				var i = en(e);
				t.mainType = i.main || null, t.subType = i.sub || null;
			} else {
				var a = [
					"Index",
					"Name",
					"Id"
				], o = {
					name: 1,
					dataIndex: 1,
					dataType: 1
				};
				z(e, function(e, i) {
					for (var s = !1, c = 0; c < a.length; c++) {
						var l = a[c], u = i.lastIndexOf(l);
						if (u > 0 && u === i.length - l.length) {
							var d = i.slice(0, u);
							d !== "data" && (t.mainType = d, t[l.toLowerCase()] = e, s = !0);
						}
					}
					o.hasOwnProperty(i) && (n[i] = e, s = !0), s || (r[i] = e);
				});
			}
			return {
				cptQuery: t,
				dataQuery: n,
				otherQuery: r
			};
		}, e.prototype.filter = function(e, t) {
			var n = this.eventInfo;
			if (!n) return !0;
			var r = n.targetEl, i = n.packedEvent, a = n.model, o = n.view;
			if (!a || !o) return !0;
			var s = t.cptQuery, c = t.dataQuery;
			return l(s, a, "mainType") && l(s, a, "subType") && l(s, a, "index", "componentIndex") && l(s, a, "name") && l(s, a, "id") && l(c, i, "name") && l(c, i, "dataIndex") && l(c, i, "dataType") && (!o.filterForExposedEvent || o.filterForExposedEvent(e, t.otherQuery, r, i));
			function l(e, t, n, r) {
				return e[n] == null || t[r || n] === e[n];
			}
		}, e.prototype.afterTrigger = function() {
			this.eventInfo = null;
		}, e;
	}();
})), dA, fA, pA, mA, hA = M((() => {
	q(), dA = [
		"symbol",
		"symbolSize",
		"symbolRotate",
		"symbolOffset"
	], fA = dA.concat(["symbolKeepAspect"]), pA = {
		createOnAllSeries: !0,
		performRawSeries: !0,
		reset: function(e, t) {
			var n = e.getData();
			if (e.legendIcon && n.setVisual("legendIcon", e.legendIcon), !e.hasSymbolVisual) return;
			for (var r = {}, i = {}, a = !1, o = 0; o < dA.length; o++) {
				var s = dA[o], c = e.get(s);
				H(c) ? (a = !0, i[s] = c) : r[s] = c;
			}
			if (r.symbol = r.symbol || e.defaultSymbol, n.setVisual(L({
				legendIcon: e.legendIcon || r.symbol,
				symbolKeepAspect: e.get("symbolKeepAspect")
			}, r)), t.isSeriesFiltered(e)) return;
			var l = st(i);
			function u(t, n) {
				for (var r = e.getRawValue(n), a = e.getDataParams(n), o = 0; o < l.length; o++) {
					var s = l[o];
					t.setItemVisual(n, s, i[s](r, a));
				}
			}
			return { dataEach: a ? u : null };
		}
	}, mA = {
		createOnAllSeries: !0,
		performRawSeries: !0,
		reset: function(e, t) {
			if (!e.hasSymbolVisual || t.isSeriesFiltered(e)) return;
			var n = e.getData();
			function r(e, t) {
				for (var n = e.getItemModel(t), r = 0; r < fA.length; r++) {
					var i = fA[r], a = n.getShallow(i, !0);
					a != null && e.setItemVisual(t, i, a);
				}
			}
			return { dataEach: n.hasItemOption ? r : null };
		}
	};
}));
//#endregion
//#region node_modules/echarts/lib/visual/helper.js
function gA(e, t, n) {
	switch (n) {
		case "color": return e.getItemVisual(t, "style")[e.getVisual("drawType")];
		case "opacity": return e.getItemVisual(t, "style").opacity;
		case "symbol":
		case "symbolSize":
		case "liftZ": return e.getItemVisual(t, n);
	}
}
function _A(e, t) {
	switch (t) {
		case "color": return e.getVisual("style")[e.getVisual("drawType")];
		case "opacity": return e.getVisual("style").opacity;
		case "symbol":
		case "symbolSize":
		case "liftZ": return e.getVisual(t);
	}
}
var vA = M((() => {}));
//#endregion
//#region node_modules/echarts/lib/util/event.js
function yA(e, t, n) {
	for (var r; e && !(t(e) && (r = e, n));) e = e.__hostTarget || e.parent;
	return r;
}
var bA = M((() => {})), xA, SA = M((() => {
	to(), xA = new eo();
}));
//#endregion
//#region node_modules/echarts/lib/core/impl.js
function CA(e, t) {
	TA[e] = t;
}
function wA(e) {
	return TA[e];
}
var TA, EA = M((() => {
	TA = {};
}));
//#endregion
//#region node_modules/echarts/lib/chart/custom/customSeriesRegister.js
function DA(e, t) {
	OA[e] = t;
}
var OA, kA = M((() => {
	OA = {};
})), AA, jA, MA, NA = M((() => {
	AA = Math.round(Math.random() * 9), jA = typeof Object.defineProperty == "function", MA = function() {
		function e() {
			this._id = "__ec_inner_" + AA++;
		}
		return e.prototype.get = function(e) {
			return this._guard(e)[this._id];
		}, e.prototype.set = function(e, t) {
			var n = this._guard(e);
			return jA ? Object.defineProperty(n, this._id, {
				value: t,
				enumerable: !1,
				configurable: !0
			}) : n[this._id] = t, this;
		}, e.prototype.delete = function(e) {
			return this.has(e) ? (delete this._guard(e)[this._id], !0) : !1;
		}, e.prototype.has = function(e) {
			return !!this._guard(e)[this._id];
		}, e.prototype._guard = function(e) {
			if (e !== Object(e)) throw TypeError("Value of WeakMap is not a non-null object.");
			return e;
		}, e;
	}();
}));
//#endregion
//#region node_modules/zrender/lib/canvas/helper.js
function PA(e) {
	return isFinite(e);
}
function FA(e, t, n) {
	var r = t.x == null ? 0 : t.x, i = t.x2 == null ? 1 : t.x2, a = t.y == null ? 0 : t.y, o = t.y2 == null ? 0 : t.y2;
	return t.global || (r = r * n.width + n.x, i = i * n.width + n.x, a = a * n.height + n.y, o = o * n.height + n.y), r = PA(r) ? r : 0, i = PA(i) ? i : 1, a = PA(a) ? a : 0, o = PA(o) ? o : 0, e.createLinearGradient(r, a, i, o);
}
function IA(e, t, n) {
	var r = n.width, i = n.height, a = Math.min(r, i), o = t.x == null ? .5 : t.x, s = t.y == null ? .5 : t.y, c = t.r == null ? .5 : t.r;
	return t.global || (o = o * r + n.x, s = s * i + n.y, c *= a), o = PA(o) ? o : .5, s = PA(s) ? s : .5, c = c >= 0 && PA(c) ? c : .5, e.createRadialGradient(o, s, 0, o, s, c);
}
function LA(e, t, n) {
	for (var r = t.type === "radial" ? IA(e, t, n) : FA(e, t, n), i = t.colorStops, a = 0; a < i.length; a++) r.addColorStop(i[a].offset, i[a].color);
	return r;
}
function RA(e, t) {
	if (e === t || !e && !t) return !1;
	if (!e || !t || e.length !== t.length) return !0;
	for (var n = 0; n < e.length; n++) if (e[n] !== t[n]) return !0;
	return !1;
}
function zA(e) {
	return parseInt(e, 10);
}
function BA(e, t, n) {
	var r = ["width", "height"][t], i = ["clientWidth", "clientHeight"][t], a = ["paddingLeft", "paddingTop"][t], o = ["paddingRight", "paddingBottom"][t];
	if (n[r] != null && n[r] !== "auto") return parseFloat(n[r]);
	var s = document.defaultView.getComputedStyle(e);
	return (e[i] || zA(s[r]) || zA(e.style[r])) - (zA(s[a]) || 0) - (zA(s[o]) || 0) || 0;
}
var VA = M((() => {}));
//#endregion
//#region node_modules/zrender/lib/canvas/dashStyle.js
function HA(e, t) {
	return !e || e === "solid" || !(t > 0) ? null : e === "dashed" ? [4 * t, 2 * t] : e === "dotted" ? [t] : dt(e) ? [e] : V(e) ? e : null;
}
function UA(e) {
	var t = e.style, n = t.lineDash && t.lineWidth > 0 && HA(t.lineDash, t.lineWidth), r = t.lineDashOffset;
	if (n) {
		var i = t.strokeNoScale && e.getLineScale ? e.getLineScale() : 1;
		i && i !== 1 && (n = B(n, function(e) {
			return e / i;
		}), r /= i);
	}
	return [n, r];
}
var WA = M((() => {
	q();
}));
//#endregion
//#region node_modules/zrender/lib/canvas/graphic.js
function GA(e) {
	var t = e.stroke;
	return !(t == null || t === "none" || !(e.lineWidth > 0));
}
function KA(e) {
	return typeof e == "string" && e !== "none";
}
function qA(e) {
	var t = e.fill;
	return t != null && t !== "none";
}
function JA(e, t) {
	if (t.fillOpacity != null && t.fillOpacity !== 1) {
		var n = e.globalAlpha;
		e.globalAlpha = t.fillOpacity * t.opacity, e.fill(), e.globalAlpha = n;
	} else e.fill();
}
function YA(e, t) {
	if (t.strokeOpacity != null && t.strokeOpacity !== 1) {
		var n = e.globalAlpha;
		e.globalAlpha = t.strokeOpacity * t.opacity, e.stroke(), e.globalAlpha = n;
	} else e.stroke();
}
function XA(e, t, n) {
	var r = Dn(t.image, t.__image, n);
	if (kn(r)) {
		var i = e.createPattern(r, t.repeat || "repeat");
		if (typeof DOMMatrix == "function" && i && i.setTransform) {
			var a = new DOMMatrix();
			a.translateSelf(t.x || 0, t.y || 0), a.rotateSelf(0, 0, (t.rotation || 0) * Xt), a.scaleSelf(t.scaleX || 1, t.scaleY || 1), i.setTransform(a);
		}
		return i;
	}
}
function ZA(e, t, n, r, i) {
	var a, o = GA(n), s = qA(n), c = n.strokePercent, l = c < 1, u = !t.path;
	(!t.silent || l) && u && t.createPathProxy();
	var d = t.path || fj, f = t.__dirty;
	if (!r) {
		var p = n.fill, m = n.stroke, h = s && !!p.colorStops, g = o && !!m.colorStops, _ = s && !!p.image, v = o && !!m.image, y = void 0, b = void 0, x = void 0, S = void 0, C = void 0;
		(h || g) && (C = t.getBoundingRect()), h && (y = f ? LA(e, p, C) : t.__canvasFillGradient, t.__canvasFillGradient = y), g && (b = f ? LA(e, m, C) : t.__canvasStrokeGradient, t.__canvasStrokeGradient = b), _ && (x = f || !t.__canvasFillPattern ? XA(e, p, t) : t.__canvasFillPattern, t.__canvasFillPattern = x), v && (S = f || !t.__canvasStrokePattern ? XA(e, m, t) : t.__canvasStrokePattern, t.__canvasStrokePattern = S), h ? e.fillStyle = y : _ && (x ? e.fillStyle = x : s = !1), g ? e.strokeStyle = b : v && (S ? e.strokeStyle = S : o = !1);
	}
	var w = t.getGlobalScale();
	d.setScale(w[0], w[1], t.segmentIgnoreThreshold);
	var T, E;
	e.setLineDash && n.lineDash && (a = UA(t), T = a[0], E = a[1]);
	var D = !0;
	(u || f & 4) && (d.setDPR(e.dpr), l ? d.setContext(null) : (d.setContext(e), D = !1), d.reset(), t.buildPath(d, t.shape, r), d.toStatic(), t.pathUpdated()), D && d.rebuildPath(e, l ? c : 1), T && (e.setLineDash(T), e.lineDashOffset = E), r ? (i.batchFill = s, i.batchStroke = o) : n.strokeFirst ? (o && YA(e, n), s && JA(e, n)) : (s && JA(e, n), o && YA(e, n)), T && e.setLineDash([]);
}
function QA(e, t, n) {
	var r = t.__image = Dn(n.image, t.__image, t, t.onload);
	if (r && kn(r)) {
		var i = n.x || 0, a = n.y || 0, o = t.getWidth(), s = t.getHeight(), c = r.width / r.height;
		if (o == null && s != null ? o = s * c : s == null && o != null ? s = o / c : o == null && s == null && (o = r.width, s = r.height), n.sWidth && n.sHeight) {
			var l = n.sx || 0, u = n.sy || 0;
			e.drawImage(r, l, u, n.sWidth, n.sHeight, i, a, o, s);
		} else if (n.sx && n.sy) {
			var l = n.sx, u = n.sy, d = o - l, f = s - u;
			e.drawImage(r, l, u, d, f, i, a, o, s);
		} else e.drawImage(r, i, a, o, s);
	}
}
function $A(e, t, n) {
	var r, i = n.text;
	if (i != null && (i += ""), i) {
		e.font = n.font || "12px sans-serif", e.textAlign = n.textAlign, e.textBaseline = n.textBaseline;
		var a = void 0, o = void 0;
		e.setLineDash && n.lineDash && (r = UA(t), a = r[0], o = r[1]), a && (e.setLineDash(a), e.lineDashOffset = o), n.strokeFirst ? (GA(n) && e.strokeText(i, n.x, n.y), qA(n) && e.fillText(i, n.x, n.y)) : (qA(n) && e.fillText(i, n.x, n.y), GA(n) && e.strokeText(i, n.x, n.y)), a && e.setLineDash([]);
	}
}
function ej(e, t, n, r, i) {
	var a = !1;
	if (!r && (n ||= {}, t === n)) return !1;
	if (r || t.opacity !== n.opacity) {
		sj(e, i), a = !0;
		var o = Math.max(Math.min(t.opacity, 1), 0);
		e.globalAlpha = isNaN(o) ? jo.opacity : o;
	}
	(r || t.blend !== n.blend) && (a ||= (sj(e, i), !0), e.globalCompositeOperation = t.blend || jo.blend);
	for (var s = 0; s < pj.length; s++) {
		var c = pj[s];
		(r || t[c] !== n[c]) && (a ||= (sj(e, i), !0), e[c] = e.dpr * (t[c] || 0));
	}
	return (r || t.shadowColor !== n.shadowColor) && (a ||= (sj(e, i), !0), e.shadowColor = t.shadowColor || jo.shadowColor), a;
}
function tj(e, t, n, r, i) {
	var a = t.style, o = r ? null : n && n.style || {};
	if (a === o) return !1;
	var s = ej(e, a, o, r, i);
	if ((r || a.fill !== o.fill) && (s ||= (sj(e, i), !0), KA(a.fill) && (e.fillStyle = a.fill)), (r || a.stroke !== o.stroke) && (s ||= (sj(e, i), !0), KA(a.stroke) && (e.strokeStyle = a.stroke)), (r || a.opacity !== o.opacity) && (s ||= (sj(e, i), !0), e.globalAlpha = a.opacity == null ? 1 : a.opacity), t.hasStroke()) {
		var c = a.lineWidth / (a.strokeNoScale && t.getLineScale ? t.getLineScale() : 1);
		e.lineWidth !== c && (s ||= (sj(e, i), !0), e.lineWidth = c);
	}
	for (var l = 0; l < mj.length; l++) {
		var u = mj[l], d = u[0];
		(r || a[d] !== o[d]) && (s ||= (sj(e, i), !0), e[d] = a[d] || u[1]);
	}
	return s;
}
function nj(e, t, n, r, i) {
	return ej(e, t.style, n && n.style, r, i);
}
function rj(e, t) {
	var n = t.transform, r = e.dpr || 1;
	n ? e.setTransform(r * n[0], r * n[1], r * n[2], r * n[3], r * n[4], r * n[5]) : e.setTransform(r, 0, 0, r, 0, 0);
}
function ij(e, t, n) {
	for (var r = !1, i = 0; i < e.length; i++) {
		var a = e[i];
		r ||= a.isZeroArea(), rj(t, a), t.beginPath(), a.buildPath(t, a.shape), t.clip();
	}
	n.allClipped = r;
}
function aj(e, t) {
	return e && t ? e[0] !== t[0] || e[1] !== t[1] || e[2] !== t[2] || e[3] !== t[3] || e[4] !== t[4] || e[5] !== t[5] : !(!e && !t);
}
function oj(e) {
	var t = qA(e), n = GA(e);
	return !(e.lineDash || !(+t ^ n) || t && typeof e.fill != "string" || n && typeof e.stroke != "string" || e.strokePercent < 1 || e.strokeOpacity < 1 || e.fillOpacity < 1);
}
function sj(e, t) {
	t.batchFill && (t.batchFill = !1, e.fill()), t.batchStroke && (t.batchStroke = !1, e.stroke());
}
function cj(e, t) {
	var n = {
		inHover: !1,
		viewWidth: 0,
		viewHeight: 0,
		beforeBrushParam: {}
	};
	lj(e, t, n), uj(e, n);
}
function lj(e, t, n) {
	var r = t.transform;
	if (!t.shouldBePainted(n.viewWidth, n.viewHeight, !1, !1)) {
		t.__dirty &= -2, t.__isRendered = !1;
		return;
	}
	var i = t.__clipPaths, a = n.prevElClipPaths, o = t.style, s = !1, c = !1;
	if ((!a || RA(i, a)) && (a && (sj(e, n), e.restore(), c = s = !0, n.prevElClipPaths = null, n.allClipped = !1, n.prevEl = null), i && i.length && (sj(e, n), e.save(), ij(i, e, n), s = !0, n.prevElClipPaths = i)), n.allClipped) {
		t.__dirty &= -2, t.__isRendered = !1;
		return;
	}
	t.beforeBrush && t.beforeBrush(n.beforeBrushParam), t.innerBeforeBrush();
	var l = n.prevEl;
	l || (c = s = !0);
	var u = t instanceof Zs && t.autoBatch && oj(o);
	s || aj(r, l.transform) ? (sj(e, n), rj(e, t)) : u || sj(e, n), t instanceof Zs ? (n.lastDrawType !== hj && (c = !0, n.lastDrawType = hj), tj(e, t, l, c, n), (!u || !n.batchFill && !n.batchStroke) && e.beginPath(), ZA(e, t, o, u, n)) : t instanceof ec ? (n.lastDrawType !== _j && (c = !0, n.lastDrawType = _j), tj(e, t, l, c, n), $A(e, t, o)) : t instanceof ac ? (n.lastDrawType !== gj && (c = !0, n.lastDrawType = gj), nj(e, t, l, c, n), QA(e, t, o)) : t.getTemporalDisplayables && (n.lastDrawType !== vj && (c = !0, n.lastDrawType = vj), dj(e, t, n)), t.innerAfterBrush(), t.afterBrush && (u && sj(e, n), t.afterBrush()), n.prevEl = t, t.__dirty = 0, t.__isRendered = !0;
}
function uj(e, t) {
	sj(e, t), t.prevElClipPaths && e.restore();
}
function dj(e, t, n) {
	var r = t.getDisplayables(), i = t.getTemporalDisplayables();
	e.save();
	for (var a = {
		prevElClipPaths: null,
		prevEl: null,
		allClipped: !1,
		viewWidth: n.viewWidth,
		viewHeight: n.viewHeight,
		inHover: n.inHover,
		beforeBrushParam: {}
	}, o = t.getCursor(), s = r.length; o < s; o++) {
		var c = r[o];
		c.beforeBrush && c.beforeBrush(n.beforeBrushParam), c.innerBeforeBrush(), lj(e, c, a), c.innerAfterBrush(), c.afterBrush && c.afterBrush(), a.prevEl = c;
	}
	uj(e, a);
	for (var l = 0, u = i.length; l < u; l++) {
		var c = i[l];
		c.beforeBrush && c.beforeBrush(n.beforeBrushParam), c.innerBeforeBrush(), lj(e, c, a), c.innerAfterBrush(), c.afterBrush && c.afterBrush(), a.prevEl = c;
	}
	uj(e, a), t.clearTemporalDisplayables(), t.notClear = !0, e.restore();
}
var fj, pj, mj, hj, gj, _j, vj, yj = M((() => {
	Ro(), ys(), jn(), VA(), Qs(), oc(), tc(), q(), WA(), lo(), Ye(), fj = new vs(!0), pj = [
		"shadowBlur",
		"shadowOffsetX",
		"shadowOffsetY"
	], mj = [
		["lineCap", "butt"],
		["lineJoin", "miter"],
		["miterLimit", 10]
	], hj = 1, gj = 2, _j = 3, vj = 4;
}));
//#endregion
//#region node_modules/echarts/lib/util/decal.js
function bj(e, t) {
	if (e === "none") return null;
	var n = t.getDevicePixelRatio(), r = t.getZr(), i = r.painter.type === "svg";
	e.dirty && Ej.delete(e);
	var a = Ej.get(e);
	if (a) return a;
	var o = et(e, {
		symbol: "rect",
		symbolSize: 1,
		symbolKeepAspect: !0,
		color: "rgba(0, 0, 0, 0.2)",
		backgroundColor: null,
		dashArrayX: 5,
		dashArrayY: 5,
		rotation: 0,
		maxTileWidth: 512,
		maxTileHeight: 512
	});
	o.backgroundColor === "none" && (o.backgroundColor = null);
	var s = { repeat: "repeat" };
	return c(s), s.rotation = o.rotation, s.scaleX = s.scaleY = i ? 1 : 1 / n, Ej.set(e, s), e.dirty = !1, s;
	function c(e) {
		for (var t = [n], a = !0, s = 0; s < Oj.length; ++s) {
			var c = o[Oj[s]];
			if (c != null && !V(c) && !U(c) && !dt(c) && typeof c != "boolean") {
				a = !1;
				break;
			}
			t.push(c);
		}
		var l;
		if (a) {
			l = t.join(",") + (i ? "-svg" : "");
			var u = Dj.get(l);
			u && (i ? e.svgElement = u : e.image = u);
		}
		var d = Sj(o.dashArrayX), f = Cj(o.dashArrayY), p = xj(o.symbol), m = wj(d), h = Tj(f), g = !i && Je.createCanvas(), _ = i && {
			tag: "g",
			attrs: {},
			key: "dcl",
			children: []
		}, v = b(), y;
		g && (g.width = v.width * n, g.height = v.height * n, y = g.getContext("2d")), x(), a && Dj.put(l, g || _), e.image = g, e.svgElement = _, e.svgWidth = v.width, e.svgHeight = v.height;
		function b() {
			for (var e = 1, t = 0, n = m.length; t < n; ++t) e = il(e, m[t]);
			for (var r = 1, t = 0, n = p.length; t < n; ++t) r = il(r, p[t].length);
			e *= r;
			var i = h * m.length * p.length;
			return {
				width: Math.max(1, Math.min(e, o.maxTileWidth)),
				height: Math.max(1, Math.min(i, o.maxTileHeight))
			};
		}
		function x() {
			y && (y.clearRect(0, 0, g.width, g.height), o.backgroundColor && (y.fillStyle = o.backgroundColor, y.fillRect(0, 0, g.width, g.height)));
			for (var e = 0, t = 0; t < f.length; ++t) e += f[t];
			if (e <= 0) return;
			for (var a = -h, s = 0, c = 0, l = 0; a < v.height;) {
				if (s % 2 == 0) {
					for (var u = c / 2 % p.length, m = 0, b = 0, x = 0; m < v.width * 2;) {
						for (var S = 0, t = 0; t < d[l].length; ++t) S += d[l][t];
						if (S <= 0) break;
						if (b % 2 == 0) {
							var C = (1 - o.symbolSize) * .5, w = m + d[l][b] * C, T = a + f[s] * C, E = d[l][b] * o.symbolSize, D = f[s] * o.symbolSize, O = x / 2 % p[u].length;
							k(w, T, E, D, p[u][O]);
						}
						m += d[l][b], ++x, ++b, b === d[l].length && (b = 0);
					}
					++l, l === d.length && (l = 0);
				}
				a += f[s], ++c, ++s, s === f.length && (s = 0);
			}
			function k(e, t, a, s, c) {
				var l = i ? 1 : n, u = nx(c, e * l, t * l, a * l, s * l, o.color, o.symbolKeepAspect);
				if (i) {
					var d = r.painter.renderOneToVNode(u);
					d && _.children.push(d);
				} else cj(y, u);
			}
		}
	}
}
function xj(e) {
	if (!e || e.length === 0) return [["rect"]];
	if (U(e)) return [[e]];
	for (var t = !0, n = 0; n < e.length; ++n) if (!U(e[n])) {
		t = !1;
		break;
	}
	if (t) return xj([e]);
	for (var r = [], n = 0; n < e.length; ++n) U(e[n]) ? r.push([e[n]]) : r.push(e[n]);
	return r;
}
function Sj(e) {
	if (!e || e.length === 0) return [[0, 0]];
	if (dt(e)) {
		var t = Math.ceil(e);
		return [[t, t]];
	}
	for (var n = !0, r = 0; r < e.length; ++r) if (!dt(e[r])) {
		n = !1;
		break;
	}
	if (n) return Sj([e]);
	for (var i = [], r = 0; r < e.length; ++r) if (dt(e[r])) {
		var t = Math.ceil(e[r]);
		i.push([t, t]);
	} else {
		var t = B(e[r], function(e) {
			return Math.ceil(e);
		});
		t.length % 2 == 1 ? i.push(t.concat(t)) : i.push(t);
	}
	return i;
}
function Cj(e) {
	if (!e || typeof e == "object" && e.length === 0) return [0, 0];
	if (dt(e)) {
		var t = Math.ceil(e);
		return [t, t];
	}
	var n = B(e, function(e) {
		return Math.ceil(e);
	});
	return e.length % 2 ? n.concat(n) : n;
}
function wj(e) {
	return B(e, function(e) {
		return Tj(e);
	});
}
function Tj(e) {
	for (var t = 0, n = 0; n < e.length; ++n) t += e[n];
	return e.length % 2 == 1 ? t * 2 : t;
}
var Ej, Dj, Oj, kj = M((() => {
	NA(), Tn(), q(), X(), px(), yj(), Ye(), Ej = new MA(), Dj = new wn(100), Oj = [
		"symbol",
		"symbolSize",
		"symbolKeepAspect",
		"color",
		"backgroundColor",
		"dashArrayX",
		"dashArrayY",
		"maxTileWidth",
		"maxTileHeight"
	];
}));
//#endregion
//#region node_modules/echarts/lib/visual/decal.js
function Aj(e, t) {
	e.eachRawSeries(function(n) {
		if (!e.isSeriesFiltered(n)) {
			var r = n.getData();
			r.hasItemVisual() && r.each(function(e) {
				var n = r.getItemVisual(e, "decal");
				if (n) {
					var i = r.ensureUniqueItemVisual(e, "style");
					i.decal = bj(n, t);
				}
			});
			var i = r.getVisual("decal");
			if (i) {
				var a = r.getVisual("style");
				a.decal = bj(i, t);
			}
		}
	});
}
var jj, Mj = M((() => {
	kj(), Z(), jj = vu(Aj);
}));
//#endregion
//#region node_modules/echarts/lib/core/echarts.js
function Nj(e) {
	return function() {
		var t = [...arguments];
		if (this.isDisposed()) {
			this.id;
			return;
		}
		return Fj(this, e, t);
	};
}
function Pj(e) {
	return function() {
		var t = [...arguments];
		return Fj(this, e, t);
	};
}
function Fj(e, t, n) {
	return n[0] = n[0] && n[0].toLowerCase(), eo.prototype[t].apply(e, n);
}
function Ij(e, t, n) {
	var r = !(n && n.ssr);
	if (r) {
		var i = Lj(e);
		if (i) return i;
	}
	var a = new KM(e, t, n);
	return a.id = "ec_" + aN++, rN[a.id] = a, r && eu(e, oN, a.id), HM(a), xA.trigger("afterinit", a), a;
}
function Lj(e) {
	return rN[tu(e, oN)];
}
function Rj(e, t) {
	tN[e] = t;
}
function zj(e) {
	R($M, e) < 0 && $M.push(e);
}
function Bj(e, t) {
	Jj(QM, e, t, rM);
}
function Vj(e) {
	Uj("afterinit", e);
}
function Hj(e) {
	Uj("afterupdate", e);
}
function Uj(e, t) {
	xA.on(e, t);
}
function Wj(e, t, n) {
	var r, i, a, o, s;
	H(t) && (n = t, t = ""), W(e) ? (r = e.type, i = e.event, o = e.update, s = e.publishNonRefinedEvent, n ||= e.action, a = e.refineEvent) : (r = e, i = t);
	function c(e) {
		return e.toLowerCase();
	}
	i = c(i || r);
	var l = a ? c(r) : i;
	YM[r] || (St(bM.test(r) && bM.test(i)), a && St(i !== r), YM[r] = {
		actionType: r,
		refinedEventType: i,
		nonRefinedEventType: l,
		update: o,
		action: n,
		refineEvent: a
	}, ZM[i] = 1, a && s && (ZM[l] = 1), XM[l] = r);
}
function Gj(e, t) {
	b_.register(e, t);
}
function Kj(e, t) {
	Jj(eN, e, t, aM, "layout", !0);
}
function qj(e, t) {
	Jj(eN, e, t, cM, "visual", !0);
}
function Jj(e, t, n, r, i, a) {
	if ((H(t) || W(t)) && (n = t, t = r), !(R(sN, n) >= 0)) {
		sN.push(n);
		var o = Qk.wrapStageHandler(n, i);
		o.__prio = t, o.__raw = n, e.push(o);
	}
}
function Yj(e, t) {
	nN[e] = t;
}
function Xj(e, t, n) {
	var r = wA("registerMap");
	r && r(e, t, n);
}
function Zj(e, t, n, r) {
	return { eventContent: {
		selected: Sd(n),
		isFromClick: t.isFromClick || !1
	} };
}
var Qj, $j, eM, tM, nM, rM, iM, aM, oM, sM, cM, lM, uM, dM, fM, pM, mM, hM, gM, _M, vM, yM, bM, xM, SM, CM, wM, TM, EM, DM, OM, kM, AM, jM, MM, NM, PM, FM, IM, LM, RM, zM, BM, VM, HM, UM, WM, GM, KM, qM, JM, YM, XM, ZM, QM, $M, eN, tN, nN, rN, iN, aN, oN, sN, cN, lN = M((() => {
	F(), SO(), q(), $t(), ID(), to(), UO(), Bu(), S_(), XO(), Sk(), Ek(), ex(), Ok(), aS(), Gm(), Du(), Jd(), Z(), WE(), Rk(), Vk(), rA(), cA(), hn(), uA(), Iu(), hA(), vA(), Ol(), qE(), ub(), xv(), bA(), SA(), Ye(), EA(), Lw(), OO(), Mj(), Qj = 1, $j = 800, eM = 900, tM = 920, nM = 1e3, rM = 2e3, iM = 5e3, aM = 1e3, oM = 1100, sM = 2e3, cM = 3e3, lM = 4e3, uM = 4500, dM = 4600, fM = 5e3, pM = 6e3, mM = 7e3, hM = {
		PROCESSOR: {
			SERIES_FILTER: $j,
			AXIS_STATISTICS: tM,
			FILTER: nM,
			STATISTIC: iM,
			STATISTICS: iM
		},
		VISUAL: {
			LAYOUT: aM,
			PROGRESSIVE_LAYOUT: oM,
			GLOBAL: sM,
			CHART: cM,
			POST_CHART_LAYOUT: dM,
			COMPONENT: lM,
			BRUSH: fM,
			CHART_ITEM: uM,
			ARIA: pM,
			DECAL: mM
		}
	}, gM = "__flagInMainProcess", _M = "__mainProcessVersion", vM = "__pendingUpdate", yM = "__needsUpdateStatus", bM = /^[a-zA-Z0-9_]+$/, xM = "__connectUpdateStatus", SM = 0, CM = 1, wM = 2, TM = function(e) {
		P(t, e);
		function t() {
			return e !== null && e.apply(this, arguments) || this;
		}
		return t;
	}(eo), EM = TM.prototype, EM.on = Pj("on"), EM.off = Pj("off"), KM = function(e) {
		P(t, e);
		function t(t, n, r) {
			var i = e.call(this, new lA()) || this;
			i._chartsViews = [], i._chartsMap = {}, i._componentsViews = [], i._componentsMap = {}, i._pendingActions = [], r ||= {}, i.__v_skip = !0, i._dom = t;
			var a = "canvas", o = "auto", s = !1;
			i[_M] = 1, r.ssr && _O(function(e) {
				var t = Tu(e), n = t.dataIndex;
				if (n != null) {
					var r = K();
					return r.set("series_index", t.seriesIndex), r.set("data_index", n), t.ssrType && r.set("ssr_type", t.ssrType), r;
				}
			});
			var c = i._zr = hO(t, {
				renderer: r.renderer || a,
				devicePixelRatio: r.devicePixelRatio,
				width: r.width,
				height: r.height,
				ssr: r.ssr,
				useDirtyRect: G(r.useDirtyRect, s),
				useCoarsePointer: G(r.useCoarsePointer, o),
				pointerSize: r.pointerSize
			});
			i._ssr = r.ssr, i._throttledZrFlush = RE(Gt(c.flush, c), 17), i._updateTheme(n), i._locale = fv(r.locale || bv), i._coordSysMgr = new b_();
			var l = i._api = VM(i);
			function u(e, t) {
				return e.__prio - t.__prio;
			}
			return ND(eN, u), ND(QM, u), i._scheduler = new Qk(i, l, QM, eN), i._messageCenter = new TM(), i._initEvents(), i.resize = Gt(i.resize, i), c.animation.on("frame", i._onframe, i), IM(c, i), LM(c, i), wt(i), i;
		}
		return t.prototype._onframe = function() {
			if (!this._disposed) {
				var e = this._scheduler, t = this._model, n = this._api;
				if (WM(this), this[vM]) {
					var r = this[vM].silent;
					this[gM] = !0, GM(this);
					try {
						DM(this), AM.update.call(this, null, this[vM].updateParams);
					} catch (e) {
						throw this[gM] = !1, this[vM] = null, e;
					}
					this._zr.flush(), this[gM] = !1, this[vM] = null, PM.call(this, r), FM.call(this, r);
				} else if (e.unfinished) {
					var i = Qj;
					do {
						e.unfinished = !1;
						var a = Je.getTime();
						e.performSeriesTasks(t), e.performDataProcessorTasks(t), MM(this, t), e.performVisualTasks(t), BM(this, this._model, n, "remain", {}), i -= Je.getTime() - a;
					} while (i > 0 && e.unfinished);
					e.unfinished || this._zr.flush();
				}
			}
		}, t.prototype.getDom = function() {
			return this._dom;
		}, t.prototype.getId = function() {
			return this.id;
		}, t.prototype.getZr = function() {
			return this._zr;
		}, t.prototype.isSSR = function() {
			return this._ssr;
		}, t.prototype.setOption = function(e, t, n) {
			if (!this[gM]) {
				if (this._disposed) {
					this.id;
					return;
				}
				var r, i, a;
				if (W(t) && (n = t.lazyUpdate, r = t.silent, i = t.replaceMerge, a = t.transition, t = t.notMerge), this[gM] = !0, GM(this), !this._model || t) {
					var o = new YO(this._api), s = this._theme, c = this._model = new HO();
					c.scheduler = this._scheduler, c.ssr = this._ssr, c.init(null, null, null, s, this._locale, o);
				}
				this._model.setOption(e, { replaceMerge: i }, $M);
				var l = {
					seriesTransition: a,
					optionChanged: !0
				};
				if (n) this[vM] = {
					silent: r,
					updateParams: l
				}, this[gM] = !1, this.getZr().wakeUp();
				else {
					try {
						DM(this), AM.update.call(this, null, l);
					} catch (e) {
						throw this[vM] = null, this[gM] = !1, e;
					}
					this._ssr || this._zr.flush(), this[vM] = null, this[gM] = !1, PM.call(this, r), FM.call(this, r);
				}
			}
		}, t.prototype.setTheme = function(e, t) {
			if (!this[gM]) {
				if (this._disposed) {
					this.id;
					return;
				}
				var n = this._model;
				if (n) {
					var r = t && t.silent, i = null;
					this[vM] && (r ??= this[vM].silent, i = this[vM].updateParams, this[vM] = null), this[gM] = !0, GM(this);
					try {
						this._updateTheme(e), n.setTheme(this._theme), DM(this), AM.update.call(this, { type: "setTheme" }, i);
					} catch (e) {
						throw this[gM] = !1, e;
					}
					this[gM] = !1, PM.call(this, r), FM.call(this, r);
				}
			}
		}, t.prototype._updateTheme = function(e) {
			U(e) && (e = tN[e]), e && (e = I(e), e && vk(e, !0), this._theme = e);
		}, t.prototype.getModel = function() {
			return this._model;
		}, t.prototype.getOption = function() {
			return this._model && this._model.getOption();
		}, t.prototype.getWidth = function() {
			return this._zr.getWidth();
		}, t.prototype.getHeight = function() {
			return this._zr.getHeight();
		}, t.prototype.getDevicePixelRatio = function() {
			return this._zr.painter.dpr || J.hasGlobalWindow && window.devicePixelRatio || 1;
		}, t.prototype.getRenderedCanvas = function(e) {
			return this.renderToCanvas(e);
		}, t.prototype.renderToCanvas = function(e) {
			return e ||= {}, this._zr.painter.getRenderedCanvas({
				backgroundColor: e.backgroundColor || this._model.get("backgroundColor"),
				pixelRatio: e.pixelRatio || this.getDevicePixelRatio()
			});
		}, t.prototype.renderToSVGString = function(e) {
			return e ||= {}, this._zr.painter.renderToString({ useViewBox: e.useViewBox });
		}, t.prototype.getSvgDataURL = function() {
			var e = this._zr;
			return z(e.storage.getDisplayList(), function(e) {
				e.stopAnimation(null, !0);
			}), e.painter.toDataURL();
		}, t.prototype.getDataURL = function(e) {
			if (this._disposed) {
				this.id;
				return;
			}
			e ||= {};
			var t = e.excludeComponents, n = this._model, r = [], i = this;
			z(t, function(e) {
				n.eachComponent({ mainType: e }, function(e) {
					var t = i._componentsMap[e.__viewId];
					t.group.ignore || (r.push(t), t.group.ignore = !0);
				});
			});
			var a = this._zr.painter.getType() === "svg" ? this.getSvgDataURL() : this.renderToCanvas(e).toDataURL("image/" + (e && e.type || "png"));
			return z(r, function(e) {
				e.group.ignore = !1;
			}), a;
		}, t.prototype.getConnectedDataURL = function(e) {
			if (this._disposed) {
				this.id;
				return;
			}
			var t = e.type === "svg", n = this.group, r = Math.min, i = Math.max, a = Infinity;
			if (iN[n]) {
				var o = a, s = a, c = -a, l = -a, u = [], d = e && e.pixelRatio || this.getDevicePixelRatio();
				z(rN, function(a, d) {
					if (a.group === n) {
						var f = t ? a.getZr().painter.getSvgDom().innerHTML : a.renderToCanvas(I(e)), p = a.getDom().getBoundingClientRect();
						o = r(p.left, o), s = r(p.top, s), c = i(p.right, c), l = i(p.bottom, l), u.push({
							dom: f,
							left: p.left,
							top: p.top
						});
					}
				}), o *= d, s *= d, c *= d, l *= d;
				var f = c - o, p = l - s, m = Je.createCanvas(), h = hO(m, { renderer: t ? "svg" : "canvas" });
				if (h.resize({
					width: f,
					height: p
				}), t) {
					var g = "";
					return z(u, function(e) {
						var t = e.left - o, n = e.top - s;
						g += "<g transform=\"translate(" + t + "," + n + ")\">" + e.dom + "</g>";
					}), h.painter.getSvgRoot().innerHTML = g, e.connectedBackgroundColor && h.painter.setBackgroundColor(e.connectedBackgroundColor), h.refreshImmediately(), h.painter.toDataURL();
				}
				return e.connectedBackgroundColor && h.add(new gc({
					shape: {
						x: 0,
						y: 0,
						width: f,
						height: p
					},
					style: { fill: e.connectedBackgroundColor }
				})), z(u, function(e) {
					var t = new ac({ style: {
						x: e.left * d - o,
						y: e.top * d - s,
						image: e.dom
					} });
					h.add(t);
				}), h.refreshImmediately(), m.toDataURL("image/" + (e && e.type || "png"));
			}
			return this.getDataURL(e);
		}, t.prototype.convertToPixel = function(e, t, n) {
			return jM(this, "convertToPixel", e, t, n);
		}, t.prototype.convertToLayout = function(e, t, n) {
			return jM(this, "convertToLayout", e, t, n);
		}, t.prototype.convertFromPixel = function(e, t, n) {
			return jM(this, "convertFromPixel", e, t, n);
		}, t.prototype.containPixel = function(e, t) {
			if (this._disposed) {
				this.id;
				return;
			}
			var n = this._model, r;
			return z(Xl(n, e), function(e, n) {
				n.indexOf("Models") >= 0 && z(e, function(e) {
					var i = e.coordinateSystem;
					if (i && i.containPoint) r ||= !!i.containPoint(t);
					else if (n === "seriesModels") {
						var a = this._chartsMap[e.__viewId];
						a && a.containPoint && (r ||= a.containPoint(t, e));
					}
				}, this);
			}, this), !!r;
		}, t.prototype.getVisual = function(e, t) {
			var n = this._model, r = Xl(n, e, { defaultMainType: "series" }), i = r.seriesModel.getData(), a = r.hasOwnProperty("dataIndexInside") ? r.dataIndexInside : r.hasOwnProperty("dataIndex") ? i.indexOfRawIndex(r.dataIndex) : null;
			return a == null ? _A(i, t) : gA(i, a, t);
		}, t.prototype.getViewOfComponentModel = function(e) {
			return this._componentsMap[e.__viewId];
		}, t.prototype.getViewOfSeriesModel = function(e) {
			return this._chartsMap[e.__viewId];
		}, t.prototype._initEvents = function() {
			var e = this;
			z(JM, function(t) {
				var n = function(n) {
					var r = e.getModel(), i = n.target, a;
					if (t === "globalout" ? a = {} : i && yA(i, function(e) {
						var t = Tu(e);
						if (t && t.dataIndex != null) {
							var n = t.dataModel || r.getSeriesByIndex(t.seriesIndex);
							return a = n && n.getDataParams(t.dataIndex, t.dataType, i) || {}, !0;
						}
						if (t.eventData) return a = L({}, t.eventData), !0;
					}, !0), a) {
						var o = a.componentType, s = a.componentIndex;
						(o === "markLine" || o === "markPoint" || o === "markArea") && (o = "series", s = a.seriesIndex);
						var c = o && s != null && r.getComponent(o, s), l = c && e[c.mainType === "series" ? "_chartsMap" : "_componentsMap"][c.__viewId];
						a.event = n, a.type = t, e._$eventProcessor.eventInfo = {
							targetEl: i,
							packedEvent: a,
							model: c,
							view: l
						}, e.trigger(t, a);
					}
				};
				n.zrEventfulCallAtLast = !0, e._zr.on(t, n, e);
			});
			var t = this._messageCenter;
			z(ZM, function(n, r) {
				t.on(r, function(t) {
					e.trigger(r, t);
				});
			}), KE(t, this, this._api);
		}, t.prototype.isDisposed = function() {
			return this._disposed;
		}, t.prototype.clear = function() {
			if (this._disposed) {
				this.id;
				return;
			}
			this.setOption({ series: [] }, !0);
		}, t.prototype.dispose = function() {
			if (this._disposed) {
				this.id;
				return;
			}
			this._disposed = !0, this.getDom() && eu(this.getDom(), oN, "");
			var e = this, t = e._api, n = e._model;
			z(e._componentsViews, function(e) {
				e.dispose(n, t);
			}), z(e._chartsViews, function(e) {
				e.dispose(n, t);
			}), e._zr.dispose(), e._dom = e._model = e._chartsMap = e._componentsMap = e._chartsViews = e._componentsViews = e._scheduler = e._api = e._zr = e._throttledZrFlush = e._theme = e._coordSysMgr = e._messageCenter = null, delete rN[e.id];
		}, t.prototype.resize = function(e) {
			if (!this[gM]) {
				if (this._disposed) {
					this.id;
					return;
				}
				this._zr.resize(e);
				var t = this._model;
				if (this._loadingFX && this._loadingFX.resize(), t) {
					var n = t.resetOption("media"), r = e && e.silent;
					this[vM] && (r ??= this[vM].silent, n = !0, this[vM] = null), this[gM] = !0, GM(this);
					try {
						n && DM(this), AM.update.call(this, {
							type: "resize",
							animation: L({ duration: 0 }, e && e.animation)
						});
					} catch (e) {
						throw this[gM] = !1, e;
					}
					this[gM] = !1, PM.call(this, r), FM.call(this, r);
				}
			}
		}, t.prototype.showLoading = function(e, t) {
			if (this._disposed) {
				this.id;
				return;
			}
			if (W(e) && (t = e, e = ""), e ||= "default", this.hideLoading(), nN[e]) {
				var n = nN[e](this._api, t), r = this._zr;
				this._loadingFX = n, r.add(n);
			}
		}, t.prototype.hideLoading = function() {
			if (this._disposed) {
				this.id;
				return;
			}
			this._loadingFX && this._zr.remove(this._loadingFX), this._loadingFX = null;
		}, t.prototype.makeActionFromEvent = function(e) {
			var t = L({}, e);
			return t.type = XM[e.type], t;
		}, t.prototype.dispatchAction = function(e, t) {
			if (this._disposed) {
				this.id;
				return;
			}
			if (W(t) || (t = { silent: !!t }), YM[e.type] && this._model) {
				if (this[gM]) {
					this._pendingActions.push(e);
					return;
				}
				var n = t.silent;
				NM.call(this, e, n);
				var r = t.flush;
				r ? this._zr.flush() : r !== !1 && J.browser.weChat && this._throttledZrFlush(), PM.call(this, n), FM.call(this, n);
			}
		}, t.prototype.updateLabelLayout = function() {
			xA.trigger("series:layoutlabels", this._model, this._api, { updatedSeries: [] });
		}, t.prototype.appendData = function(e) {
			if (this._disposed) {
				this.id;
				return;
			}
			var t = e.seriesIndex;
			this.getModel().getSeriesByIndex(t).appendData(e), this._scheduler.unfinished = !0, this.getZr().wakeUp();
		}, t.internalField = function() {
			DM = function(e) {
				Nw(e._model);
				var t = e._scheduler;
				t.restorePipelines(e._zr, e._model), t.prepareStageTasks(), OM(e, !0), OM(e, !1), t.plan();
			}, OM = function(e, t) {
				for (var n = e._model, r = e._scheduler, i = t ? e._componentsViews : e._chartsViews, a = t ? e._componentsMap : e._chartsMap, o = e._zr, s = e._api, c = 0; c < i.length; c++) i[c].__alive = !1;
				t ? n.eachComponent(function(e, t) {
					e !== "series" && l(t);
				}) : n.eachSeries(l);
				function l(e) {
					var c = e.__requireNewView;
					e.__requireNewView = !1;
					var l = "_ec_" + e.id + "_" + e.type, u = !c && a[l];
					if (!u) {
						var d = en(e.type);
						u = new (t ? Dk.getClass(d.main, d.sub) : rS.getClass(d.sub))(), u.init(n, s), a[l] = u, i.push(u), o.add(u.group);
					}
					e.__viewId = u.__id = l, u.__alive = !0, u.__model = e, u.group.__ecComponentInfo = {
						mainType: e.mainType,
						index: e.componentIndex
					}, !t && r.prepareView(u, e, n, s);
				}
				for (var c = 0; c < i.length;) {
					var u = i[c];
					u.__alive ? c++ : (!t && u.renderTask.dispose(), o.remove(u.group), u.dispose(n, s), i.splice(c, 1), a[u.__id] === u && delete a[u.__id], u.__id = u.group.__ecComponentInfo = null);
				}
			}, kM = function(e, t, n, r, i) {
				var a = e._model;
				if (a.setUpdatePayload(n), !r) {
					z([].concat(e._componentsViews, e._chartsViews), l);
					return;
				}
				var o = $l(n, r, i), s = n.excludeSeriesId, c;
				s != null && (c = K(), z(Al(s), function(e) {
					var t = Ul(e, null);
					t != null && c.set(t, !0);
				})), a && a.eachComponent(o, function(t) {
					if (!(c && c.get(t.id) != null)) {
						if (Md(n)) {
							if (t instanceof $b) n.type === "highlight" && !n.notBlur && !t.get(["emphasis", "disabled"]) && gd(t, n, e._api);
							else {
								var r = _d(t.mainType, t.componentIndex, n.name, e._api), i = r.focusSelf, a = r.dispatchers;
								n.type === "highlight" && i && !n.notBlur && hd(t.mainType, t.componentIndex, e._api), a && z(a, function(e) {
									n.type === "highlight" ? od(e) : sd(e);
								});
							}
						} else jd(n) && t instanceof $b && (bd(t, n, e._api), xd(t), UM(e));
					}
				}, e), a && a.eachComponent(o, function(t) {
					c && c.get(t.id) != null || l(e[r === "series" ? "_chartsMap" : "_componentsMap"][t.__viewId]);
				}, e);
				function l(r) {
					r && r.__alive && r[t] && r[t](r.__model, a, e._api, n);
				}
			}, AM = {
				prepareAndUpdate: function(e) {
					DM(this), AM.update.call(this, e, e && { optionChanged: e.newOption != null });
				},
				update: function(e, n) {
					var r = this._model, i = this._api, a = this._zr, o = this._coordSysMgr, s = this._scheduler;
					if (r) {
						Pw(r), r.setUpdatePayload(e), s.restoreData(r, e), s.performSeriesTasks(r), o.create(r, i), xA.trigger("coordsys:aftercreate", r, i), s.performDataProcessorTasks(r, e), MM(this, r), o.update(r, i), t(r), s.performVisualTasks(r, e);
						var c = r.get("backgroundColor") || "transparent";
						a.setBackgroundColor(c);
						var l = r.get("darkMode");
						l != null && l !== "auto" && a.setDarkMode(l), RM(this, r, i, e, n), xA.trigger("afterupdate", r, i);
					}
				},
				updateTransform: function(e) {
					var t = this, n = t._model, r = t._api;
					if (n) {
						n.setUpdatePayload(e);
						var i = [];
						n.eachComponent(function(a, o) {
							if (a !== "series") {
								var s = t.getViewOfComponentModel(o);
								if (s && s.__alive) {
									if (s.updateTransform) {
										var c = s.updateTransform(o, n, r, e);
										c && c.update && i.push(s);
									} else i.push(s);
								}
							}
						});
						var a = K();
						n.eachSeries(function(i) {
							var o = t._chartsMap[i.__viewId], s = i.pipelineContext;
							if (o.updateTransform && !s.progressiveRender) {
								var c = o.updateTransform(i, n, r, e);
								c && c.update && a.set(i.uid, 1);
							} else a.set(i.uid, 1);
						}), t._scheduler.performVisualTasks(n, e, {
							setDirty: !0,
							dirtyMap: a
						}), BM(t, n, r, e, {}, a), xA.trigger("afterupdate", n, r);
					}
				},
				updateView: function(e) {
					var n = this._model;
					n && (n.setUpdatePayload(e), rS.markUpdateMethod(e, "updateView"), t(n), this._scheduler.performVisualTasks(n, e, { setDirty: !0 }), RM(this, n, this._api, e, {}), xA.trigger("afterupdate", n, this._api));
				},
				updateVisual: function(e) {
					var n = this, r = this._model;
					r && (r.setUpdatePayload(e), r.eachSeries(function(e) {
						e.getData().clearAllVisual();
					}), rS.markUpdateMethod(e, "updateVisual"), t(r), this._scheduler.performVisualTasks(r, e, {
						visualType: "visual",
						setDirty: !0
					}), r.eachComponent(function(t, i) {
						if (t !== "series") {
							var a = n.getViewOfComponentModel(i);
							a && a.__alive && a.updateVisual(i, r, n._api, e);
						}
					}), r.eachSeries(function(t) {
						n._chartsMap[t.__viewId].updateVisual(t, r, n._api, e);
					}), xA.trigger("afterupdate", r, this._api));
				},
				updateLayout: function(e) {
					AM.update.call(this, e);
				}
			};
			function e(e, t, n, r, i) {
				if (e._disposed) {
					e.id;
					return;
				}
				for (var a = e._model, o = e._coordSysMgr.getCoordinateSystems(), s, c = Xl(a, n), l = 0; l < o.length; l++) {
					var u = o[l];
					if (u[t] && (s = u[t](a, c, r, i)) != null) return s;
				}
			}
			jM = e, MM = function(e, t) {
				var n = e._chartsMap, r = e._scheduler;
				t.eachSeries(function(e) {
					r.updateStreamModes(e, n[e.__viewId]);
				});
			}, NM = function(e, t) {
				var n = this, r = this.getModel(), i = e.type, a = e.escapeConnect, o = YM[i], s = (o.update || "update").split(":"), c = s.pop(), l = s[0] != null && en(s[0]);
				this[gM] = !0, GM(this);
				var u = [e], d = !1;
				e.batch && (d = !0, u = B(e.batch, function(t) {
					return t = et(L({}, t), e), t.batch = null, t;
				}));
				var f = [], p, m = [], h = o.nonRefinedEventType, g = jd(e), _ = Md(e);
				if (_ && pd(this._api), z(u, function(t) {
					var i = o.action(t, r, n._api);
					if (o.refineEvent ? m.push(i) : p = i, p ||= L({}, t), p.type = h, f.push(p), _) {
						var a = Zl(e), s = a.queryOptionMap, u = a.mainTypeSpecified ? s.keys()[0] : "series";
						kM(n, c, t, u), UM(n);
					} else g ? (kM(n, c, t, "series"), UM(n)) : l && kM(n, c, t, l.main, l.sub);
				}), c !== "none" && !_ && !g && !l) try {
					this[vM] ? (DM(this), AM.update.call(this, e), this[vM] = null) : AM[c].call(this, e);
				} catch (e) {
					throw this[gM] = !1, e;
				}
				if (p = d ? {
					type: h,
					escapeConnect: a,
					batch: f
				} : f[0], this[gM] = !1, !t) {
					var v = void 0;
					if (o.refineEvent) {
						var y = o.refineEvent(m, e, r, this._api).eventContent;
						St(W(y)), v = et({ type: o.refinedEventType }, y), v.fromAction = e.type, v.fromActionPayload = e, v.escapeConnect = !0;
					}
					var b = this._messageCenter;
					b.trigger(p.type, p), v && b.trigger(v.type, v);
				}
			}, PM = function(e) {
				for (var t = this._pendingActions; t.length;) {
					var n = t.shift();
					NM.call(this, n, e);
				}
			}, FM = function(e) {
				!e && this.trigger("updated");
			}, IM = function(e, t) {
				e.on("rendered", function(n) {
					t.trigger("rendered", n), e.animation.isFinished() && !t[vM] && !t._scheduler.unfinished && !t._pendingActions.length ? t.trigger("finished") : e.refresh();
				});
			}, LM = function(e, t) {
				e.on("mouseover", function(e) {
					var n = e.target, r = yA(n, kd);
					r && (vd(r, e, t._api), UM(t));
				}).on("mouseout", function(e) {
					var n = e.target, r = yA(n, kd);
					r && (yd(r, e, t._api), UM(t));
				}).on("click", function(e) {
					var n = e.target, r = yA(n, function(e) {
						return Tu(e).dataIndex != null;
					}, !0);
					if (r) {
						var i = r.selected ? "unselect" : "select", a = Tu(r);
						t._api.dispatchAction({
							type: i,
							dataType: a.dataType,
							dataIndexInside: a.dataIndex,
							seriesIndex: a.seriesIndex,
							isFromClick: !0
						});
					}
				});
			};
			function t(e) {
				e.clearColorPalette(), e.eachSeries(function(e) {
					e.clearColorPalette();
				});
			}
			function n(e) {
				var t = [], n = [], r = !1;
				if (e.eachComponent(function(e, i) {
					var a = i.get("zlevel") || 0, o = i.get("z") || 0, s = i.getZLevelKey();
					r ||= !!s, (e === "series" ? n : t).push({
						zlevel: a,
						z: o,
						idx: i.componentIndex,
						type: e,
						key: s
					});
				}), r) {
					var i = t.concat(n), a, o;
					ND(i, function(e, t) {
						return e.zlevel === t.zlevel ? e.z - t.z : e.zlevel - t.zlevel;
					}), z(i, function(t) {
						var n = e.getComponent(t.type, t.idx), r = t.zlevel, i = t.key;
						a != null && (r = Math.max(a, r)), i ? (r === a && i !== o && r++, o = i) : o &&= (r === a && r++, ""), a = r, n.setZLevel(r);
					});
				}
			}
			RM = function(e, t, r, i, a) {
				n(t), zM(e, t, r, i, a), z(e._chartsViews, function(e) {
					e.__alive = !1;
				}), BM(e, t, r, i, a), z(e._chartsViews, function(e) {
					e.__alive || e.remove(t, r);
				});
			}, zM = function(e, t, n, r, i, a) {
				z(a || e._componentsViews, function(e) {
					var i = e.__model;
					s(i, e), e.render(i, t, n, r), o(i, e), c(i, e);
				});
			}, BM = function(e, t, n, r, l, u) {
				var d = e._scheduler;
				l = L(l || {}, { updatedSeries: t.getSeries() }), xA.trigger("series:beforeupdate", t, n, l);
				var f = !1;
				t.eachSeries(function(t) {
					var n = e._chartsMap[t.__viewId];
					n.__alive = !0;
					var i = n.renderTask;
					d.updatePayload(i, r), s(t, n), u && u.get(t.uid) && i.dirty(), i.perform(d.getPerformArgs(i)) && (f = !0), n.group.silent = !!t.get("silent"), a(t, n), xd(t);
				}), d.unfinished = f || d.unfinished, xA.trigger("series:layoutlabels", t, n, l), xA.trigger("series:transition", t, n, l), t.eachSeries(function(t) {
					var n = e._chartsMap[t.__viewId];
					o(t, n), c(t, n);
				}), i(e, t), xA.trigger("series:afterupdate", t, n, l);
			}, UM = function(e) {
				e[yM] = !0, e.getZr().wakeUp();
			}, GM = function(e) {
				e[_M] = (e[_M] + 1) % 1e6;
			}, WM = function(e) {
				e[yM] && (e.getZr().storage.traverse(function(e) {
					Wp(e) || r(e);
				}), e[yM] = !1);
			};
			function r(e) {
				for (var t = [], n = e.currentStates, r = 0; r < n.length; r++) {
					var i = n[r];
					i !== "emphasis" && i !== "blur" && i !== "select" && t.push(i);
				}
				e.selected && e.states.select && t.push("select"), e.hoverState === 2 && e.states.emphasis ? t.push("emphasis") : e.hoverState === 1 && e.states.blur && t.push("blur"), e.useStates(t);
			}
			function i(e, t) {
				var n = e._zr;
				if (n.painter.type === "canvas") {
					var r = n.storage, i = 0;
					r.traverse(function(e) {
						e.isGroup || i++;
					});
					var a = i > G(t.get("hoverLayerThreshold"), DO.hoverLayerThreshold) && !J.node && !J.worker;
					(e._usingTHL || a) && (t.eachSeries(function(t) {
						if (!t.preventUsingHoverLayer) {
							var n = e._chartsMap[t.__viewId];
							n.__alive && n.eachRendered(function(e) {
								var t = e.states.emphasis;
								t && t.hoverLayer !== 2 && (t.hoverLayer = +!!a);
							});
						}
					}), e._usingTHL = a);
				}
			}
			function a(e, t) {
				var n = e.get("blendMode") || null;
				t.eachRendered(function(e) {
					e.isGroup || (e.style.blend = n);
				});
			}
			function o(e, t) {
				if (!e.preventAutoZ) {
					var n = km(e);
					t.eachRendered(function(e) {
						return jm(e, n.z, n.zlevel), !0;
					});
				}
			}
			function s(e, t) {
				t.eachRendered(function(e) {
					if (!Wp(e)) {
						var t = e.getTextContent(), n = e.getTextGuideLine();
						e.stateTransition &&= null, t && t.stateTransition && (t.stateTransition = null), n && n.stateTransition && (n.stateTransition = null), e.hasState() ? (e.prevStates = e.currentStates, e.clearStates()) : e.prevStates &&= null;
					}
				});
			}
			function c(e, t) {
				var n = e.getModel("stateAnimation"), i = e.isAnimationEnabled(), a = n.get("duration"), o = a > 0 ? {
					duration: a,
					delay: n.get("delay"),
					easing: n.get("easing")
				} : null;
				t.eachRendered(function(e) {
					if (e.states && e.states.emphasis) {
						if (Wp(e)) return;
						if (e instanceof Zs && Nd(e), e.__dirty) {
							var t = e.prevStates;
							t && e.useStates(t);
						}
						if (i) {
							e.stateTransition = o;
							var n = e.getTextContent(), a = e.getTextGuideLine();
							n && (n.stateTransition = o), a && (a.stateTransition = o);
						}
						e.__dirty && r(e);
					}
				});
			}
			VM = function(e) {
				return new (function(t) {
					P(n, t);
					function n() {
						return t !== null && t.apply(this, arguments) || this;
					}
					return n.prototype.getCoordinateSystems = function() {
						return e._coordSysMgr.getCoordinateSystems();
					}, n.prototype.getComponentByElement = function(t) {
						for (; t;) {
							var n = t.__ecComponentInfo;
							if (n != null) return e._model.getComponent(n.mainType, n.index);
							t = t.parent;
						}
					}, n.prototype.enterEmphasis = function(t, n) {
						od(t, n), UM(e);
					}, n.prototype.leaveEmphasis = function(t, n) {
						sd(t, n), UM(e);
					}, n.prototype.enterBlur = function(t) {
						cd(t), UM(e);
					}, n.prototype.leaveBlur = function(t) {
						ld(t), UM(e);
					}, n.prototype.enterSelect = function(t) {
						ud(t), UM(e);
					}, n.prototype.leaveSelect = function(t) {
						dd(t), UM(e);
					}, n.prototype.getModel = function() {
						return e.getModel();
					}, n.prototype.getViewOfComponentModel = function(t) {
						return e.getViewOfComponentModel(t);
					}, n.prototype.getViewOfSeriesModel = function(t) {
						return e.getViewOfSeriesModel(t);
					}, n.prototype.getECUpdateCycleVersion = function() {
						return e[_M];
					}, n.prototype.usingTHL = function() {
						return e._usingTHL;
					}, n;
				}(zu))(e);
			}, HM = function(e) {
				function t(e, t) {
					for (var n = 0; n < e.length; n++) {
						var r = e[n];
						r[xM] = t;
					}
				}
				z(XM, function(n, r) {
					e._messageCenter.on(r, function(n) {
						if (iN[e.group] && e[xM] !== SM) {
							if (n && n.escapeConnect) return;
							var r = e.makeActionFromEvent(n), i = [];
							z(rN, function(t) {
								t !== e && t.group === e.group && i.push(t);
							}), t(i, SM), z(i, function(e) {
								e[xM] !== CM && e.dispatchAction(r);
							}), t(i, wM);
						}
					});
				});
			};
		}(), t;
	}(eo), qM = KM.prototype, qM.on = Nj("on"), qM.off = Nj("off"), qM.one = function(e, t, n) {
		var r = this;
		function i() {
			var n = [...arguments];
			t && t.apply && t.apply(this, n), r.off(e, i);
		}
		this.on.call(this, e, i, n);
	}, JM = [
		"click",
		"dblclick",
		"mouseover",
		"mouseout",
		"mousemove",
		"mousedown",
		"mouseup",
		"globalout",
		"contextmenu"
	], YM = {}, XM = {}, ZM = {}, QM = [], $M = [], eN = [], tN = {}, nN = {}, rN = {}, iN = {}, aN = /* @__PURE__ */ new Date() - 0, /* @__PURE__ */ new Date() - 0, oN = "_echarts_instance_", sN = [], cN = ib, qj(sM, Pk), qj(uM, Ik), qj(uM, Lk), qj(sM, pA), qj(uM, mA), qj(mM, jj), zj(vk), Bj(eM, Tk), Yj("default", zk), Wj({
		type: Bd,
		event: Bd,
		update: Bd
	}, jt), Wj({
		type: Vd,
		event: Vd,
		update: Vd
	}, jt), Wj({
		type: Hd,
		event: Gd,
		update: Hd,
		action: jt,
		refineEvent: Zj,
		publishNonRefinedEvent: !0
	}), Wj({
		type: Ud,
		event: Gd,
		update: Ud,
		action: jt,
		refineEvent: Zj,
		publishNonRefinedEvent: !0
	}), Wj({
		type: Wd,
		event: Gd,
		update: Wd,
		action: jt,
		refineEvent: Zj,
		publishNonRefinedEvent: !0
	}), Rj("default", {}), Rj("dark", sA);
}));
//#endregion
//#region node_modules/echarts/lib/extension.js
function uN(e) {
	if (V(e)) {
		z(e, function(e) {
			uN(e);
		});
		return;
	}
	R(dN, e) >= 0 || (dN.push(e), H(e) && (e = { install: e }), e.install(fN));
}
var dN, fN, pN = M((() => {
	lN(), Ok(), aS(), Ry(), ex(), q(), EA(), SO(), kA(), dN = [], fN = {
		registerPreprocessor: zj,
		registerProcessor: Bj,
		registerPostInit: Vj,
		registerPostUpdate: Hj,
		registerUpdateLifecycle: Uj,
		registerAction: Wj,
		registerCoordinateSystem: Gj,
		registerLayout: Kj,
		registerVisual: qj,
		registerTransform: cN,
		registerLoading: Yj,
		registerMap: Xj,
		registerImpl: CA,
		PRIORITY: hM,
		ComponentModel: Ly,
		ComponentView: Dk,
		SeriesModel: $b,
		ChartView: rS,
		registerComponentModel: function(e) {
			Ly.registerClass(e);
		},
		registerComponentView: function(e) {
			Dk.registerClass(e);
		},
		registerSeriesModel: function(e) {
			$b.registerClass(e);
		},
		registerChartView: function(e) {
			rS.registerClass(e);
		},
		registerCustomSeries: function(e, t) {
			DA(e, t);
		},
		registerSubTypeDefaulter: function(e, t) {
			Ly.registerSubTypeDefaulter(e, t);
		},
		registerPainter: function(e, t) {
			gO(e, t);
		}
	};
})), mN, hN = M((() => {
	mN = function() {
		function e() {}
		return e.prototype.needIncludeZero = function() {
			return !this.option.scale;
		}, e.prototype.getCoordSysModel = function() {}, e;
	}();
})), gN, _N = M((() => {
	F(), q(), Ry(), hN(), Z(), gN = function(e) {
		P(t, e);
		function t() {
			return e !== null && e.apply(this, arguments) || this;
		}
		return t.prototype.getCoordSysModel = function() {
			return this.getReferringComponents("grid", Cu).models[0];
		}, t.type = "cartesian2dAxis", t;
	}(Ly), nt(gN, mN);
})), vN, yN, bN, xN, SN, CN, wN = M((() => {
	q(), _b(), vN = {
		show: !0,
		z: 0,
		inverse: !1,
		name: "",
		nameLocation: "end",
		nameRotate: null,
		nameTruncate: {
			maxWidth: null,
			ellipsis: "...",
			placeholder: "."
		},
		nameTextStyle: {},
		nameGap: 15,
		silent: !1,
		triggerEvent: !1,
		tooltip: { show: !1 },
		axisPointer: {},
		axisLine: {
			show: !0,
			onZero: "auto",
			onZeroAxisIndex: null,
			lineStyle: {
				color: Q.color.axisLine,
				width: 1,
				type: "solid"
			},
			symbol: ["none", "none"],
			symbolSize: [10, 15],
			breakLine: !0
		},
		axisTick: {
			show: !0,
			inside: !1,
			length: 5,
			lineStyle: { width: 1 }
		},
		axisLabel: {
			show: !0,
			inside: !1,
			rotate: 0,
			showMinLabel: null,
			showMaxLabel: null,
			margin: 8,
			fontSize: 12,
			color: Q.color.axisLabel,
			textMargin: [0, 3]
		},
		splitLine: {
			show: !0,
			showMinLine: !0,
			showMaxLine: !0,
			lineStyle: {
				color: Q.color.axisSplitLine,
				width: 1,
				type: "solid"
			}
		},
		splitArea: {
			show: !1,
			areaStyle: { color: [Q.color.backgroundTint, Q.color.backgroundTransparent] }
		},
		breakArea: {
			show: !0,
			itemStyle: {
				color: Q.color.neutral00,
				borderColor: Q.color.border,
				borderWidth: 1,
				borderType: [3, 3],
				opacity: .6
			},
			zigzagAmplitude: 4,
			zigzagMinSpan: 4,
			zigzagMaxSpan: 20,
			zigzagZ: 100,
			expandOnClick: !0
		},
		breakLabelLayout: { moveOverlap: "auto" }
	}, yN = Qe({
		boundaryGap: !0,
		deduplication: null,
		jitter: 0,
		jitterOverlap: !0,
		jitterMargin: 2,
		splitLine: { show: !1 },
		axisTick: {
			alignWithLabel: !1,
			interval: "auto",
			show: "auto"
		},
		axisLabel: { interval: "auto" }
	}, vN), bN = Qe({
		boundaryGap: [0, 0],
		axisLine: { show: "auto" },
		axisTick: { show: "auto" },
		splitNumber: 5,
		minorTick: {
			show: !1,
			splitNumber: 5,
			length: 3,
			lineStyle: {}
		},
		minorSplitLine: {
			show: !1,
			lineStyle: {
				color: Q.color.axisMinorSplitLine,
				width: 1
			}
		}
	}, vN), xN = Qe({
		splitNumber: 6,
		axisLabel: { rich: { primary: { fontWeight: "bold" } } },
		splitLine: { show: !1 }
	}, bN), SN = et({ logBase: 10 }, bN), CN = {
		category: yN,
		value: bN,
		time: xN,
		log: SN
	};
}));
//#endregion
//#region node_modules/echarts/lib/coord/axisModelCreator.js
function TN(e, t, n, r) {
	z(_C, function(i, a) {
		var o = Qe(Qe({}, CN[a], !0), r, !0), s = function(e) {
			P(n, e);
			function n() {
				var n = e !== null && e.apply(this, arguments) || this;
				return n.type = t + "Axis." + a, n;
			}
			return n.prototype.mergeDefaultAndTheme = function(e, t) {
				var n = Ty(this), r = n ? Dy(e) : {};
				Qe(e, t.getTheme().get(a + "Axis")), Qe(e, this.getDefaultOption()), e.type = EN(e), n && Ey(e, r, n);
			}, n.prototype.optionUpdated = function() {
				this.option.type === "category" && (this.__ordinalMeta = hS.createByAxisModel(this));
			}, n.prototype.getCategories = function(e) {
				var t = this.option;
				if (t.type === "category") return e ? t.data : this.__ordinalMeta.categories;
			}, n.prototype.getOrdinalMeta = function() {
				return this.__ordinalMeta;
			}, n.prototype.updateAxisBreaks = function(e) {
				var t = TT();
				return t ? t.updateModelAxisBreak(this, e) : { breaks: [] };
			}, n.type = t + "Axis." + a, n.defaultOption = o, n;
		}(n);
		e.registerComponentModel(s);
	}), e.registerSubTypeDefaulter(t + "Axis", EN);
}
function EN(e) {
	return e.type || (e.data ? "category" : "value");
}
var DN = M((() => {
	F(), wN(), Py(), gS(), vC(), q(), DT();
})), ON, kN = M((() => {
	q(), ON = function() {
		function e(e) {
			this.type = "cartesian", this._dimList = [], this._axes = {}, this.name = e || "";
		}
		return e.prototype.getAxis = function(e) {
			return this._axes[e];
		}, e.prototype.getAxes = function() {
			return B(this._dimList, function(e) {
				return this._axes[e];
			}, this);
		}, e.prototype.getAxesByScale = function(e) {
			return e = e.toLowerCase(), at(this.getAxes(), function(t) {
				return t.scale.type === e;
			});
		}, e.prototype.addAxis = function(e) {
			var t = e.dim;
			this._axes[t] = e, this._dimList.push(t);
		}, e;
	}();
}));
//#endregion
//#region node_modules/echarts/lib/coord/cartesian/Cartesian2D.js
function AN(e) {
	return (e.type === "interval" || e.type === "time") && !Tv(e);
}
var jN, MN, NN = M((() => {
	F(), Dr(), kN(), LE(), Bn(), rr(), OS(), Dv(), jN = ["x", "y"], MN = function(e) {
		P(t, e);
		function t() {
			var t = e !== null && e.apply(this, arguments) || this;
			return t.type = FE, t.dimensions = jN, t;
		}
		return t.prototype.calcAffineTransform = function() {
			this._transform = this._invTransform = null;
			var e = this.getAxis("x").scale, t = this.getAxis("y").scale;
			if (AN(e) && AN(t)) {
				var n = xS(e, null), r = xS(t, null), i = this.dataToPoint([n[0], r[0]]), a = this.dataToPoint([n[1], r[1]]), o = n[1] - n[0], s = r[1] - r[0];
				if (o && s) {
					var c = (a[0] - i[0]) / o, l = (a[1] - i[1]) / s, u = i[0] - n[0] * c, d = i[1] - r[0] * l, f = this._transform = [
						c,
						0,
						0,
						l,
						u,
						d
					];
					this._invTransform = zn([], f);
				}
			}
		}, t.prototype.getBaseAxis = function() {
			return this.getAxesByScale("ordinal")[0] || this.getAxesByScale("time")[0] || this.getAxis("x");
		}, t.prototype.containPoint = function(e) {
			var t = this.getAxis("x"), n = this.getAxis("y");
			return t.contain(t.toLocalCoord(e[0])) && n.contain(n.toLocalCoord(e[1]));
		}, t.prototype.containData = function(e) {
			return this.getAxis("x").containData(e[0]) && this.getAxis("y").containData(e[1]);
		}, t.prototype.containZone = function(e, t) {
			var n = this.dataToPoint(e), r = this.dataToPoint(t), i = this.getArea(), a = new Y(n[0], n[1], r[0] - n[0], r[1] - n[1]);
			return i.intersect(a);
		}, t.prototype.dataToPoint = function(e, t, n) {
			n ||= [];
			var r = e[0], i = e[1];
			if (this._transform && r != null && isFinite(r) && i != null && isFinite(i)) return Qn(n, e, this._transform);
			var a = this.getAxis("x"), o = this.getAxis("y");
			return n[0] = a.toGlobalCoord(a.dataToCoord(r, t)), n[1] = o.toGlobalCoord(o.dataToCoord(i, t)), n;
		}, t.prototype.clampData = function(e, t) {
			var n = this.getAxis("x").scale, r = this.getAxis("y").scale, i = n.getExtent(), a = r.getExtent(), o = n.parse(e[0]), s = r.parse(e[1]);
			return t ||= [], t[0] = Math.min(Math.max(Math.min(i[0], i[1]), o), Math.max(i[0], i[1])), t[1] = Math.min(Math.max(Math.min(a[0], a[1]), s), Math.max(a[0], a[1])), t;
		}, t.prototype.pointToData = function(e, t, n) {
			if (n ||= [], this._invTransform) return Qn(n, e, this._invTransform);
			var r = this.getAxis("x"), i = this.getAxis("y");
			return n[0] = r.coordToData(r.toLocalCoord(e[0]), t), n[1] = i.coordToData(i.toLocalCoord(e[1]), t), n;
		}, t.prototype.getOtherAxis = function(e) {
			return this.getAxis(e.dim === "x" ? "y" : "x");
		}, t.prototype.getArea = function(e) {
			e ||= 0;
			var t = this.getAxis("x").getGlobalExtent(), n = this.getAxis("y").getGlobalExtent(), r = Math.min(t[0], t[1]) - e, i = Math.min(n[0], n[1]) - e, a = Math.max(t[0], t[1]) - r + e, o = Math.max(n[0], n[1]) - i + e;
			return new Y(r, i, a, o);
		}, t;
	}(ON);
}));
//#endregion
//#region node_modules/echarts/lib/coord/axisAlignTicks.js
function PN(e, t) {
	var n = e.scale, r = e.model, i = TE(n, r, r.ecModel, e, null), a = MS(n), o = MS(t) ? t.intervalStub : t, s = a ? n.intervalStub : n, c = n.base, l = o.getTicks(), u = o.getTicks({ expandToNicedExtent: !0 }), d = l.length - 1, f, p, m;
	if (d === 1) f = p = 0, m = 1;
	else if (d === 2) {
		var h = ul(l[0].value - l[1].value), g = ul(l[1].value - l[2].value);
		f = p = 0, h === g ? m = 2 : (m = 1, h < g ? f = h / g : p = g / h);
	} else {
		var _ = o.getConfig().interval;
		f = (1 - (l[0].value - u[0].value) / _) % 1, p = (1 - (u[d].value - l[d].value) / _) % 1, m = d - +!!f - !!p;
	}
	var v = i.zoomFixMM, y = v[0] || v[1], b = [i.fixMM[0] || y, i.fixMM[1] || y], x = n.getExtent(), S = s.getExtent(), C = RS(S, b), w, T, E, D, O, k;
	function A(e) {
		for (var t = 50, n = 0; n < t && !e(); n++) E = a ? E * ll(c, 2) : PS(E), D = FS(E);
	}
	function j() {
		w = Hc(k - E * f, D);
	}
	function ee() {
		T = Hc(O + E * p, D);
	}
	function te() {
		k = f ? Hc(w + E * f, D) : w;
	}
	function ne() {
		O = p ? Hc(T - E * p, D) : T;
	}
	if (b[0] && b[1]) {
		w = C[0], T = C[1], E = (T - w) / (m + f + p);
		var re = e.getExtent(), ie = ul(re[1] - re[0]);
		D = Kc([T, w], ie, .5 / m), te(), ne(), al(D) && (E = Hc(E, D));
	} else {
		var ae = C[1] - C[0];
		E = a ? ll(Zc(ae), 1) : $c(ae / m, 2), D = FS(E), b[0] ? (w = C[0], A(function() {
			if (te(), O = Hc(k + E * m, D), ee(), T >= C[1]) return !0;
		})) : b[1] ? (T = C[1], A(function() {
			if (ne(), k = Hc(O - E * m, D), j(), w <= C[0]) return !0;
		})) : A(function() {
			k = Hc(pl(C[0] / E) * E, D), O = Hc(fl(C[1] / E) * E, D);
			var e = dl((O - k) / E);
			if (e <= m) {
				var t = m - e, n = void 0, r = i.incl0 || a;
				if (r && C[0] === 0) n = [0, t];
				else if (r && C[1] === 0) n = [t, 0];
				else {
					var o = fl(t / 2);
					n = t % 2 == 0 ? [o, o] : w + T < C[0] + C[1] ? [o, o + 1] : [o + 1, o];
				}
				if (k = Hc(k - E * n[0], D), O = Hc(O + E * n[1], D), j(), ee(), w <= C[0] && T >= C[1]) return !0;
			}
		});
	}
	NC(n, b, S, [w, T], x, {
		interval: E,
		intervalCount: m,
		intervalPrecision: D,
		niceExtent: [k, O]
	});
}
var FN = M((() => {
	X(), LC(), HS(), ME();
}));
//#endregion
//#region node_modules/echarts/lib/coord/axisNiceTicks.js
function IN(e, t) {
	var n = MS(e), r = n ? e.intervalStub : e, i = t.fixMinMax || [], a = n ? e.getExtent() : null, o = r.getExtent(), s = RS(o, i, t.rawExtentResult);
	r.setExtent(s[0], s[1]), s = r.getExtent();
	var c = n ? RN(r, t) : LN(r, t), l = c.intervalPrecision, u = c.interval, d = t.userInterval;
	d != null && (c.interval = d, c.intervalPrecision = FS(d)), i[0] || (s[0] = Hc(fl(s[0] / u) * u, l)), i[1] || (s[1] = Hc(pl(s[1] / u) * u, l)), d != null && (c.niceExtent = s.slice()), NC(e, i, o, s, a, c);
}
function LN(e, t) {
	var n = BS(t.splitNumber, 5), r = CS(e), i = t.minInterval, a = t.maxInterval, o = $c(r / n, !0);
	i != null && o < i && (o = i), a != null && o > a && (o = a);
	var s = FS(o), c = e.getExtent(), l = [Hc(pl(c[0] / o) * o, s), Hc(fl(c[1] / o) * o, s)];
	return {
		interval: o,
		intervalPrecision: s,
		niceExtent: l
	};
}
function RN(e, t) {
	var n = BS(t.splitNumber, 10), r = e.getExtent(), i = CS(e), a = ll(Zc(i), 1);
	n / i * a <= .5 && (a *= 10);
	var o = FS(a), s = [Hc(pl(r[0] / a) * a, o), Hc(fl(r[1] / a) * a, o)];
	return {
		intervalPrecision: o,
		interval: a,
		niceExtent: s
	};
}
function zN(e) {
	var t = e.scale, n = e.model, r = n.axis, i = n.ecModel;
	BN(t, n, r, i, null);
}
function BN(e, t, n, r, i) {
	var a = TE(e, t, r, n, i), o = AS(e) || jS(e);
	VN(e, {
		splitNumber: t.get("splitNumber"),
		fixMinMax: a.fixMM,
		userInterval: t.get("interval"),
		minInterval: o ? t.get("minInterval") : null,
		maxInterval: o ? t.get("maxInterval") : null,
		rawExtentResult: a
	}), n && r && DE(n, e, a, r);
}
function VN(e, t) {
	HN[e.type](e, t);
}
var HN, UN = M((() => {
	q(), HS(), X(), LC(), cC(), ME(), OS(), HN = {
		interval: IN,
		log: IN,
		time: sC,
		ordinal: jt
	};
}));
//#endregion
//#region node_modules/echarts/lib/coord/cartesian/Grid.js
function WN(e, t) {
	return e.getCoordSysModel() === t;
}
function GN(e, t, n, r) {
	n.getAxesOnZeroOf = function() {
		return a ? [a] : [];
	};
	var i = e[t], a, o = n.model, s = o.get(["axisLine", "onZero"]), c = o.get(["axisLine", "onZeroAxisIndex"]);
	if (!s) return;
	if (c != null) KN(s, i[c]) && (a = i[c]);
	else for (var l in i) if (At(i, l) && KN(s, i[l]) && !r[u(i[l])]) {
		a = i[l];
		break;
	}
	a && (r[u(a)] = !0);
	function u(e) {
		return e.dim + "_" + e.index;
	}
}
function KN(e, t) {
	if (!t) return !1;
	var n = t.scale, r = xC(n, 0, !1), i = t && t.type !== "category" && t.type !== "time" && r !== 3;
	return i && e === "auto" && CC(t) && (i = !1), i;
}
function qN(e) {
	for (var t = st(e), n, r = [], i = t.length - 1; i >= 0; i--) {
		var a = e[+t[i]];
		kS(a.scale) && jC(a.model, a.type, !0) == null && (a.model.get("alignTicks") && a.model.get("interval") == null ? r.push(a) : n = a);
	}
	n ||= r.pop(), n && z(r, function(e) {
		e.__alignTo = n;
	});
}
function JN(e, t) {
	return Tv(e.scale) || Tv(t.scale) || t.scale.getTicks().length < 2;
}
function YN(e, t) {
	var n = e.getExtent(), r = n[0] + n[1];
	e.toGlobalCoord = e.dim === "x" ? function(e) {
		return e + t;
	} : function(e) {
		return r - e + t;
	}, e.toLocalCoord = e.dim === "x" ? function(e) {
		return e - t;
	} : function(e) {
		return r - e + t;
	};
}
function XN(e, t) {
	z(e.x, function(e) {
		return ZN(e, t.x, t.width);
	}), z(e.y, function(e) {
		return ZN(e, t.y, t.height);
	});
}
function ZN(e, t, n) {
	var r = [0, n], i = +!!e.inverse;
	e.setExtent(r[i], r[1 - i]), YN(e, t);
}
function QN(e, t, n, r, i, a, o) {
	eP(r, i, kw.estimate, t, !1, o);
	var s = [
		0,
		0,
		0,
		0
	];
	l(0), l(1), u(r, 0, NaN), u(r, 1, NaN);
	var c = ot(s, function(e) {
		return e > 0;
	}) == null;
	return xm(r, s, !0, !0, n), XN(i, r), c;
	function l(e) {
		z(i[Lm[e]], function(t) {
			if (AC(t.model)) {
				var n = a.ensureRecord(t.model), r = n.labelInfoList;
				if (r) for (var i = 0; i < r.length; i++) {
					var o = r[i], s = t.scale.normalize(PC(t.scale, QT(o.label).labelInfo.tick));
					s = e === 1 ? 1 - s : s, u(o.rect, e, s), u(o.rect, 1 - e, NaN);
				}
				var c = n.nameLayout;
				if (c) {
					var s = kC(n.nameLocation) ? .5 : NaN;
					u(c.rect, e, s), u(c.rect, 1 - e, NaN);
				}
			}
		});
	}
	function u(t, n, r) {
		var i = e[Lm[n]] - t[Lm[n]], a = t[Rm[n]] + t[Lm[n]] - (e[Rm[n]] + e[Lm[n]]);
		i = d(i, 1 - r), a = d(a, r);
		var o = nP[n][0], c = nP[n][1];
		s[o] = ll(s[o], i), s[c] = ll(s[c], a);
	}
	function d(e, t) {
		return e > 0 && !_t(t) && t > 1e-4 && (e /= t), e;
	}
}
function $N(e, t, n, r, i) {
	var a = new eE(iP);
	return z(n, function(n) {
		return z(n, function(n) {
			if (AC(n.model)) {
				var o = !r;
				n.axisBuilder = fE(e, t, n.model, i, a, o);
			}
		});
	}), a;
}
function eP(e, t, n, r, i, a) {
	var o = n === kw.determine;
	z(t, function(t) {
		return z(t, function(t) {
			AC(t.model) && (pE(t.axisBuilder, e, t.model), t.axisBuilder.build(o ? { axisTickLabelDetermine: !0 } : { axisTickLabelEstimate: !0 }, { noPxChange: i }));
		});
	});
	var s = {
		x: 0,
		y: 0
	};
	c(0), c(1);
	function c(t) {
		s[Lm[1 - t]] = e[Rm[t]] <= a.refContainer[Rm[t]] * .5 ? 0 : 1 - t == 1 ? 2 : 1;
	}
	z(t, function(e, t) {
		return z(e, function(e) {
			AC(e.model) && ((r === "all" || o) && e.axisBuilder.build({ axisName: !0 }, { nameMarginLevel: s[t] }), o && e.axisBuilder.build({ axisLine: !0 }));
		});
	});
}
function tP(e, t, n) {
	var r, i = e.get("outerBoundsMode", !0);
	i === "same" ? r = t.clone() : (i == null || i === "auto") && (r = Cy(e.get("outerBounds", !0) || NE, n.refContainer));
	var a = e.get("outerBoundsContain", !0), o = a == null || a === "auto" || R(["all", "axisLabel"], a) < 0 ? "all" : a, s = [Bc(G(e.get("outerBoundsClampWidth", !0), PE[0]), t.width), Bc(G(e.get("outerBoundsClampHeight", !0), PE[1]), t.height)];
	return {
		outerBoundsRect: r,
		parsedOuterBoundsContain: o,
		outerBoundsClamp: s
	};
}
var nP, rP, iP, aP = M((() => {
	q(), Py(), LC(), NN(), cT(), Z(), LE(), mE(), HS(), FN(), Gm(), lE(), Mw(), S_(), X(), UN(), qg(), ME(), Dv(), Xw(), nP = [[3, 1], [0, 2]], rP = function() {
		function e(e, t, n) {
			this.type = "grid", this._coordsMap = {}, this._coordsList = [], this._axesMap = {}, this._axesList = [], this.axisPointerEnabled = !0, this.dimensions = jN, this._initCartesian(e, t, n), this.model = e;
		}
		return e.prototype.getRect = function() {
			return this._rect;
		}, e.prototype.update = function(e, t) {
			var n = this._axesMap;
			z(this._axesList, function(e) {
				xE(e, 1);
				var t = e.scale;
				NS(t) && t.setSortInfo(e.model.get("categorySortInfo"));
			});
			function r(e) {
				for (var t = st(e), n = [], r = t.length - 1; r >= 0; r--) {
					var i = e[+t[r]];
					i.__alignTo ? n.push(i) : zN(i);
				}
				z(n, function(e) {
					JN(e, e.__alignTo) ? zN(e) : PN(e, e.__alignTo.scale);
				});
			}
			r(n.x), r(n.y);
			var i = {};
			z(n.x, function(e) {
				GN(n, "y", e, i);
			}), z(n.y, function(e) {
				GN(n, "x", e, i);
			}), this.resize(this.model, t);
		}, e.prototype.resize = function(e, t, n) {
			var r = wy(e, t), i = this._rect = Cy(e.getBoxLayoutParams(), r.refContainer), a = this._axesMap, o = this._coordsList, s = e.get("containLabel");
			if (XN(a, i), !n) {
				var c = $N(i, o, a, s, t), l = void 0;
				if (s) l = QN(i.clone(), "axisLabel", null, i, a, c, r);
				else {
					var u = tP(e, i, r), d = u.outerBoundsRect, f = u.parsedOuterBoundsContain, p = u.outerBoundsClamp;
					d && (l = QN(d, f, p, i, a, c, r));
				}
				eP(i, a, kw.determine, null, l, r), z(this._coordsList, function(e) {
					e.calcAffineTransform();
				});
			}
		}, e.prototype.getAxis = function(e, t) {
			var n = this._axesMap[e];
			if (n != null) return n[t || 0];
		}, e.prototype.getAxes = function() {
			return this._axesList.slice();
		}, e.prototype.getCartesian = function(e, t) {
			if (e != null && t != null) {
				var n = "x" + e + "y" + t;
				return this._coordsMap[n];
			}
			W(e) && (t = e.yAxisIndex, e = e.xAxisIndex);
			for (var r = 0, i = this._coordsList; r < i.length; r++) if (i[r].getAxis("x").index === e || i[r].getAxis("y").index === t) return i[r];
		}, e.prototype.getCartesians = function() {
			return this._coordsList.slice();
		}, e.prototype.convertToPixel = function(e, t, n) {
			var r = this._findConvertTarget(t);
			return r.cartesian ? r.cartesian.dataToPoint(n) : r.axis ? r.axis.toGlobalCoord(r.axis.dataToCoord(n)) : null;
		}, e.prototype.convertFromPixel = function(e, t, n) {
			var r = this._findConvertTarget(t);
			return r.cartesian ? r.cartesian.pointToData(n) : r.axis ? r.axis.coordToData(r.axis.toLocalCoord(n)) : null;
		}, e.prototype._findConvertTarget = function(e) {
			var t = e.seriesModel, n = e.xAxisModel || t && t.getReferringComponents("xAxis", Cu).models[0], r = e.yAxisModel || t && t.getReferringComponents("yAxis", Cu).models[0], i = e.gridModel, a = this._coordsList, o, s;
			return t ? (o = t.coordinateSystem, R(a, o) < 0 && (o = null)) : n && r ? o = this.getCartesian(n.componentIndex, r.componentIndex) : n ? s = this.getAxis("x", n.componentIndex) : r ? s = this.getAxis("y", r.componentIndex) : i && i.coordinateSystem === this && (o = this._coordsList[0]), {
				cartesian: o,
				axis: s
			};
		}, e.prototype.containPoint = function(e) {
			var t = this._coordsList[0];
			if (t) return t.containPoint(e);
		}, e.prototype._initCartesian = function(e, t, n) {
			var r = this, i = this, a = {
				left: !1,
				right: !1,
				top: !1,
				bottom: !1
			}, o = {
				x: {},
				y: {}
			}, s = {
				x: 0,
				y: 0
			};
			if (t.eachComponent("xAxis", c("x"), this), t.eachComponent("yAxis", c("y"), this), !s.x || !s.y) {
				this._axesMap = {}, this._axesList = [];
				return;
			}
			this._axesMap = o, z(o.x, function(t, n) {
				z(o.y, function(i, a) {
					var o = "x" + n + "y" + a, s = new MN(o);
					s.master = r, s.model = e, r._coordsMap[o] = s, r._coordsList.push(s), s.addAxis(t), s.addAxis(i);
				});
			}), qN(o.x), qN(o.y);
			function c(t) {
				return function(n, r) {
					if (WN(n, e)) {
						var c = n.get("position");
						t === "x" ? c !== "top" && c !== "bottom" && (c = a.bottom ? "top" : "bottom") : c !== "left" && c !== "right" && (c = a.left ? "right" : "left"), a[c] = !0;
						var l = yC(n), u = new sT(t, bC(n, l, !0), [0, 0], l, c);
						u.onBand = FC(u.scale, n), u.inverse = n.get("inverse"), n.axis = u, u.model = n, u.grid = i, u.index = r, i._axesList.push(u), o[t][r] = u, s[t]++;
					}
				};
			}
		}, e.prototype.getTooltipAxes = function(e) {
			var t = [], n = [];
			return z(this.getCartesians(), function(r) {
				var i = e != null && e !== "auto" ? r.getAxis(e) : r.getBaseAxis(), a = r.getOtherAxis(i);
				R(t, i) < 0 && t.push(i), R(n, a) < 0 && n.push(a);
			}), {
				baseAxes: t,
				otherAxes: n
			};
		}, e.create = function(t, n) {
			var r = [];
			return t.eachComponent("grid", function(i, a) {
				var o = new e(i, t, n);
				o.name = "grid_" + a, o.resize(i, n, !0), i.coordinateSystem = o, r.push(o), z(o._axesList, function(t) {
					bE(t, e.dimIdxMap);
				});
			}), t.eachSeries(function(e) {
				var t, n;
				__({
					targetModel: e,
					coordSysType: FE,
					coordSysProvider: r
				});
				function r() {
					var r = dE(e), i = r.xAxisModel, a = r.yAxisModel;
					return t = i.axis, n = a.axis, i.getCoordSysModel().coordinateSystem.getCartesian(i.componentIndex, a.componentIndex);
				}
				t && n && (Kw(t, e, FE), Kw(n, e, FE));
			}, this), r;
		}, e.dimensions = jN, e.dimIdxMap = Vg(jN), e;
	}(), iP = function(e, t, n, r, i, a) {
		var o = n.axis.dim === "x" ? "y" : "x";
		rE(e, t, n, r, i, a), kC(e.nameLocation) || z(t.recordMap[o], function(e) {
			e && e.labelInfoList && e.dirVec && MT(e.labelInfoList, e.dirVec, r, i);
		});
	};
}));
//#endregion
//#region node_modules/echarts/lib/component/axisPointer/modelHelper.js
function oP(e, t) {
	var n = {
		axesInfo: {},
		seriesInvolved: !1,
		coordSysAxesInfo: {},
		coordSysMap: {}
	};
	return sP(n, e, t), n.seriesInvolved && lP(n, e), n;
}
function sP(e, t, n) {
	var r = t.getComponent("tooltip"), i = t.getComponent("axisPointer"), a = i.get("link", !0) || [], o = [];
	z(n.getCoordinateSystems(), function(n) {
		if (!n.axisPointerEnabled) return;
		var s = gP(n.model), c = e.coordSysAxesInfo[s] = {};
		e.coordSysMap[s] = n;
		var l = n.model.getModel("tooltip", r);
		if (z(n.getAxes(), lt(p, !1, null)), n.getTooltipAxes && r && l.get("show")) {
			var u = l.get("trigger") === "axis", d = l.get(["axisPointer", "type"]) === "cross", f = n.getTooltipAxes(l.get(["axisPointer", "axis"]));
			(u || d) && z(f.baseAxes, lt(p, !d || "cross", u)), d && z(f.otherAxes, lt(p, "cross", !1));
		}
		function p(r, s, u) {
			var d = u.model.getModel("axisPointer", i), f = d.get("show");
			if (f && (f !== "auto" || r || hP(d))) {
				s ??= d.get("triggerTooltip"), d = r ? cP(u, l, i, t, r, s) : d;
				var p = d.get("snap"), m = d.get("triggerEmphasis"), h = gP(u.model), g = s || p || u.type === "category", _ = e.axesInfo[h] = {
					key: h,
					axis: u,
					coordSys: n,
					axisPointerModel: d,
					triggerTooltip: s,
					triggerEmphasis: m,
					involveSeries: g,
					snap: p,
					useHandle: hP(d),
					seriesModels: [],
					linkGroup: null
				};
				c[h] = _, e.seriesInvolved = e.seriesInvolved || g;
				var v = uP(a, u);
				if (v != null) {
					var y = o[v] || (o[v] = { axesInfo: {} });
					y.axesInfo[h] = _, y.mapper = a[v].mapper, _.linkGroup = y;
				}
			}
		}
	});
}
function cP(e, t, n, r, i, a) {
	var o = t.getModel("axisPointer"), s = [
		"type",
		"snap",
		"lineStyle",
		"shadowStyle",
		"label",
		"animation",
		"animationDurationUpdate",
		"animationEasingUpdate",
		"z"
	], c = {};
	z(s, function(e) {
		c[e] = I(o.get(e));
	}), c.snap = e.type !== "category" && !!a, o.get("type") === "cross" && (c.type = "line");
	var l = c.label ||= {};
	if (l.show ??= !1, i === "cross" && (l.show = o.get(["label", "show"]) ?? !0, !a)) {
		var u = c.lineStyle = o.get("crossStyle");
		u && et(l, u.textStyle);
	}
	return e.model.getModel("axisPointer", new Sh(c, n, r));
}
function lP(e, t) {
	t.eachSeries(function(t) {
		var n = t.coordinateSystem, r = t.get(["tooltip", "trigger"], !0), i = t.get(["tooltip", "show"], !0);
		n && n.model && r !== "none" && r !== !1 && r !== "item" && i !== !1 && t.get(["axisPointer", "show"], !0) !== !1 && z(e.coordSysAxesInfo[gP(n.model)], function(e) {
			var r = e.axis;
			n.getAxis(r.dim) === r && (e.seriesModels.push(t), e.seriesDataCount ??= 0, e.seriesDataCount += t.getData().count());
		});
	});
}
function uP(e, t) {
	for (var n = t.model, r = t.dim, i = 0; i < e.length; i++) {
		var a = e[i] || {};
		if (dP(a[r + "AxisId"], n.id) || dP(a[r + "AxisIndex"], n.componentIndex) || dP(a[r + "AxisName"], n.name)) return i;
	}
}
function dP(e, t) {
	return e === "all" || V(e) && R(e, t) >= 0 || e === t;
}
function fP(e) {
	var t = pP(e);
	if (t) {
		var n = t.axisPointerModel, r = t.axis.scale, i = n.option, a = n.get("status"), o = n.get("value");
		o != null && (o = r.parse(o));
		var s = hP(n);
		a ?? (i.status = s ? "show" : "hide");
		var c = r.getExtent();
		(o == null || o > c[1]) && (o = c[1]), o < c[0] && (o = c[0]), i.value = o, s && (i.status = t.axis.scale.isBlank() ? "hide" : "show");
	}
}
function pP(e) {
	var t = (e.ecModel.getComponent("axisPointer") || {}).coordSysAxesInfo;
	return t && t.axesInfo[gP(e)];
}
function mP(e) {
	var t = pP(e);
	return t && t.axisPointerModel;
}
function hP(e) {
	return !!e.get(["handle", "show"]);
}
function gP(e) {
	return e.type + "||" + e.id;
}
var _P = M((() => {
	Ch(), q();
})), vP, yP, bP = M((() => {
	F(), _P(), Ok(), vP = {}, yP = function(e) {
		P(t, e);
		function t() {
			var n = e !== null && e.apply(this, arguments) || this;
			return n.type = t.type, n;
		}
		return t.prototype.render = function(t, n, r, i) {
			this.axisPointerClass && fP(t), e.prototype.render.apply(this, arguments), this._doUpdateAxisPointerClass(t, r, !0);
		}, t.prototype.updateAxisPointer = function(e, t, n, r) {
			this._doUpdateAxisPointerClass(e, n, !1);
		}, t.prototype.remove = function(e, t) {
			var n = this._axisPointer;
			n && n.remove(t);
		}, t.prototype.dispose = function(t, n) {
			this._disposeAxisPointer(n), e.prototype.dispose.apply(this, arguments);
		}, t.prototype._doUpdateAxisPointerClass = function(e, n, r) {
			var i = t.getAxisPointerClass(this.axisPointerClass);
			if (i) {
				var a = mP(e);
				a ? (this._axisPointer ||= new i()).render(e, a, n, r) : this._disposeAxisPointer(n);
			}
		}, t.prototype._disposeAxisPointer = function(e) {
			this._axisPointer && this._axisPointer.dispose(e), this._axisPointer = null;
		}, t.registerAxisPointerClass = function(e, t) {
			vP[e] = t;
		}, t.getAxisPointerClass = function(e) {
			return e && vP[e];
		}, t.type = "axis", t;
	}(Dk);
}));
//#endregion
//#region node_modules/echarts/lib/component/axis/axisSplitHelper.js
function xP(e, t, n, r) {
	var i = n.axis;
	if (!i.scale.isBlank()) {
		var a = n.getModel("splitArea"), o = a.getModel("areaStyle"), s = o.get("color"), c = r.coordinateSystem.getRect(), l = i.getTicksCoords({
			tickModel: a,
			breakTicks: "none",
			pruneByBreak: "preserve_extent_bound"
		});
		if (l.length) {
			var u = s.length, d = CP(e).splitAreaColors, f = K(), p = 0;
			if (d) for (var m = 0; m < l.length; m++) {
				var h = d.get(l[m].tickValue);
				if (h != null) {
					p = (h + (u - 1) * m) % u;
					break;
				}
			}
			var g = i.toGlobalCoord(l[0].coord), _ = o.getAreaStyle();
			s = V(s) ? s : [s];
			for (var m = 1; m < l.length; m++) {
				var v = i.toGlobalCoord(l[m].coord), y = void 0, b = void 0, x = void 0, S = void 0;
				i.isHorizontal() ? (y = g, b = c.y, x = v - y, S = c.height, g = y + x) : (y = c.x, b = g, x = c.width, S = v - b, g = b + S);
				var C = l[m - 1].tickValue;
				C != null && f.set(C, p), t.add(new gc({
					anid: C == null ? null : "area_" + C,
					shape: {
						x: y,
						y: b,
						width: x,
						height: S
					},
					style: et({ fill: s[p] }, _),
					autoBatch: !0,
					silent: !0
				})), p = (p + 1) % u;
			}
			CP(e).splitAreaColors = f;
		}
	}
}
function SP(e) {
	CP(e).splitAreaColors = null;
}
var CP, wP = M((() => {
	q(), Gm(), Z(), CP = Yl();
})), TP, EP, DP, OP, kP, AP = M((() => {
	F(), q(), Gm(), bP(), wP(), DT(), LC(), TP = [
		"splitArea",
		"splitLine",
		"minorSplitLine",
		"breakArea"
	], EP = function(e) {
		P(t, e);
		function t() {
			var n = e !== null && e.apply(this, arguments) || this;
			return n.type = t.type, n.axisPointerClass = "CartesianAxisPointer", n;
		}
		return t.prototype.render = function(t, n, r, i) {
			this.group.removeAll();
			var a = this._axisGroup;
			this._axisGroup = new bf(), this.group.add(this._axisGroup), AC(t) && (this._axisGroup.add(t.axis.axisBuilder.group), z(TP, function(e) {
				t.get([e, "show"]) && DP[e](this, this._axisGroup, t, t.getCoordSysModel(), r);
			}, this), i && i.type === "changeAxisOrder" && i.isInitSort || pm(a, this._axisGroup, t), e.prototype.render.call(this, t, n, r, i));
		}, t.prototype.remove = function() {
			SP(this);
		}, t.type = "cartesianAxis", t;
	}(yP), DP = {
		splitLine: function(e, t, n, r, i) {
			var a = n.axis;
			if (!a.scale.isBlank()) {
				var o = n.getModel("splitLine"), s = o.getModel("lineStyle"), c = s.get("color"), l = o.get("showMinLine") !== !1, u = o.get("showMaxLine") !== !1;
				c = V(c) ? c : [c];
				for (var d = r.coordinateSystem.getRect(), f = a.isHorizontal(), p = 0, m = a.getTicksCoords({
					tickModel: o,
					breakTicks: "none",
					pruneByBreak: "preserve_extent_bound"
				}), h = [], g = [], _ = s.getLineStyle(), v = 0; v < m.length; v++) {
					var y = a.toGlobalCoord(m[v].coord);
					if (!(v === 0 && !l || v === m.length - 1 && !u)) {
						var b = m[v].tickValue;
						f ? (h[0] = y, h[1] = d.y, g[0] = y, g[1] = d.y + d.height) : (h[0] = d.x, h[1] = y, g[0] = d.x + d.width, g[1] = y);
						var x = p++ % c.length, S = new cp({
							anid: b == null ? null : "line_" + b,
							autoBatch: !0,
							shape: {
								x1: h[0],
								y1: h[1],
								x2: g[0],
								y2: g[1]
							},
							style: et({ stroke: c[x] }, _),
							silent: !0
						});
						om(S.shape, _.lineWidth), t.add(S);
					}
				}
			}
		},
		minorSplitLine: function(e, t, n, r, i) {
			var a = n.axis, o = n.getModel("minorSplitLine").getModel("lineStyle"), s = r.coordinateSystem.getRect(), c = a.isHorizontal(), l = a.getMinorTicksCoords();
			if (l.length) for (var u = [], d = [], f = o.getLineStyle(), p = 0; p < l.length; p++) for (var m = 0; m < l[p].length; m++) {
				var h = a.toGlobalCoord(l[p][m].coord);
				c ? (u[0] = h, u[1] = s.y, d[0] = h, d[1] = s.y + s.height) : (u[0] = s.x, u[1] = h, d[0] = s.x + s.width, d[1] = h);
				var g = new cp({
					anid: "minor_line_" + l[p][m].tickValue,
					autoBatch: !0,
					shape: {
						x1: u[0],
						y1: u[1],
						x2: d[0],
						y2: d[1]
					},
					style: f,
					silent: !0
				});
				om(g.shape, f.lineWidth), t.add(g);
			}
		},
		splitArea: function(e, t, n, r, i) {
			xP(e, t, n, r);
		},
		breakArea: function(e, t, n, r, i) {
			var a = TT(), o = n.axis.scale;
			a && o.type !== "ordinal" && a.rectCoordBuildBreakAxis(t, e, n, r.coordinateSystem.getRect(), i);
		}
	}, OP = function(e) {
		P(t, e);
		function t() {
			var n = e !== null && e.apply(this, arguments) || this;
			return n.type = t.type, n;
		}
		return t.type = "xAxis", t;
	}(EP), kP = function(e) {
		P(t, e);
		function t() {
			var t = e !== null && e.apply(this, arguments) || this;
			return t.type = OP.type, t;
		}
		return t.type = "yAxis", t;
	}(EP);
}));
//#endregion
//#region node_modules/echarts/lib/component/grid/installSimple.js
function jP(e) {
	e.registerComponentView(MP), e.registerComponentModel(IE), e.registerCoordinateSystem("cartesian2d", rP), TN(e, "x", gN, NP), TN(e, "y", gN, NP), e.registerComponentView(OP), e.registerComponentView(kP), e.registerPreprocessor(function(e) {
		e.xAxis && e.yAxis && !e.grid && (e.grid = {});
	});
}
var MP, NP, PP = M((() => {
	F(), Ok(), LE(), Gm(), q(), _N(), DN(), aP(), AP(), MP = function(e) {
		P(t, e);
		function t() {
			var t = e !== null && e.apply(this, arguments) || this;
			return t.type = "grid", t;
		}
		return t.prototype.render = function(e, t) {
			this.group.removeAll(), e.get("show") && this.group.add(new gc({
				shape: e.coordinateSystem.getRect(),
				style: et({ fill: e.get("backgroundColor") }, e.getItemStyle()),
				silent: !0,
				z2: -1
			}));
		}, t.type = "grid", t;
	}(Dk), NP = { offset: 0 };
})), FP = M((() => {
	lw(), q(), X(), M_(), Xx(), cT(), Lx(), Z(), HS(), mE(), ME(), Xw(), tT(), Og(), LE(), sw(), F(), ex(), R_(), W_(), _b(), Qs(), xf(), Gm(), Du(), Jd(), ch(), WE(), cS(), aS(), vx(), Ol(), Hr(), Xp(), qE(), p_(), l_(), Ih(), S_(), Dr(), ys(), Os(), Zi(), rr(), wT(), Py(), pN(), Ox(), px(), rw(), PP(), Ry(), hN(), zb(), oc(), wN(), Ch(), lE(), Ok(), oT(), JS(), FN(), to(), cD(), lN(), wf(), _c(), Df(), lp(), np(), ap(), yf(), Cp(), Tp(), tc(), Ea(), Ns(), kj(), Ci(), Bu(), Ro(), Iu(), xx(), $o(), Wy(), Dh(), _n(), by(), Hb(), LC(), UN(), DN(), bg(), Ts(), Ye(), Jx(), $a(), kA();
})), IP = M((() => {
	FP();
}));
//#endregion
//#region node_modules/echarts/lib/component/axisPointer/BaseAxisPointer.js
function LP(e, t, n, r) {
	RP(HP(n).lastProp, r) || (HP(n).lastProp = r, t ? Hp(n, r, e) : (n.stopAnimation(), n.attr(r)));
}
function RP(e, t) {
	if (W(e) && W(t)) {
		var n = !0;
		return z(t, function(t, r) {
			n &&= RP(e[r], t);
		}), !!n;
	}
	return e === t;
}
function zP(e, t) {
	e[t.get(["label", "show"]) ? "show" : "hide"]();
}
function BP(e) {
	return {
		x: e.x || 0,
		y: e.y || 0,
		rotation: e.rotation || 0
	};
}
function VP(e, t, n) {
	var r = t.get("z"), i = t.get("zlevel");
	e && e.traverse(function(e) {
		e.type !== "group" && (r != null && (e.z = r), i != null && (e.zlevel = i), e.silent = n);
	});
}
var HP, UP, WP, GP, KP = M((() => {
	q(), Gm(), _P(), cD(), WE(), Z(), tT(), HP = Yl(), UP = I, WP = Gt, GP = function() {
		function e() {
			this._dragging = !1, this.animationThreshold = 15;
		}
		return e.prototype.render = function(e, t, n, r) {
			var i = t.get("value"), a = t.get("status");
			if (this._axisModel = e, this._axisPointerModel = t, this._api = n, r || this._lastValue !== i || this._lastStatus !== a) {
				this._lastValue = i, this._lastStatus = a;
				var o = this._group, s = this._handle;
				if (!a || a === "hide") {
					o && o.hide(), s && s.hide();
					return;
				}
				o && o.show(), s && s.show();
				var c = {};
				this.makeElOption(c, i, e, t, n);
				var l = c.graphicKey;
				l !== this._lastGraphicKey && this.clear(n), this._lastGraphicKey = l;
				var u = this._moveAnimation = this.determineAnimation(e, t);
				if (!o) o = this._group = new bf(), this.createPointerEl(o, c, e, t), this.createLabelEl(o, c, e, t), n.getZr().add(o);
				else {
					var d = lt(LP, t, u);
					this.updatePointerEl(o, c, d), this.updateLabelEl(o, c, d, t);
				}
				VP(o, t, !0), this._renderHandle(i);
			}
		}, e.prototype.remove = function(e) {
			this.clear(e);
		}, e.prototype.dispose = function(e) {
			this.clear(e);
		}, e.prototype.determineAnimation = function(e, t) {
			var n = t.get("animation"), r = e.axis, i = r.type === "category", a = t.get("snap");
			if (!a && !i) return !1;
			if (n === "auto" || n == null) {
				var o = this.animationThreshold;
				if (i && Zw(r).w > o) return !0;
				if (a) {
					var s = pP(e).seriesDataCount, c = r.getExtent();
					return Math.abs(c[0] - c[1]) / s > o;
				}
				return !1;
			}
			return n === !0;
		}, e.prototype.makeElOption = function(e, t, n, r, i) {}, e.prototype.createPointerEl = function(e, t, n, r) {
			var i = t.pointer;
			if (i) {
				var a = HP(e).pointerEl = new Zp[i.type](UP(t.pointer));
				e.add(a);
			}
		}, e.prototype.createLabelEl = function(e, t, n, r) {
			if (t.label) {
				var i = HP(e).labelEl = new Mc(UP(t.label));
				e.add(i), zP(i, r);
			}
		}, e.prototype.updatePointerEl = function(e, t, n) {
			var r = HP(e).pointerEl;
			r && t.pointer && (r.setStyle(t.pointer.style), n(r, { shape: t.pointer.shape }));
		}, e.prototype.updateLabelEl = function(e, t, n, r) {
			var i = HP(e).labelEl;
			i && (i.setStyle(t.label.style), n(i, {
				x: t.label.x,
				y: t.label.y
			}), zP(i, r));
		}, e.prototype._renderHandle = function(e) {
			if (!this._dragging && this.updateHandleTransform) {
				var t = this._axisPointerModel, n = this._api.getZr(), r = this._handle, i = t.getModel("handle"), a = t.get("status");
				if (!i.get("show") || !a || a === "hide") {
					r && n.remove(r), this._handle = null;
					return;
				}
				var o;
				this._handle || (o = !0, r = this._handle = gm(i.get("icon"), {
					cursor: "move",
					draggable: !0,
					onmousemove: function(e) {
						sD(e.event);
					},
					onmousedown: WP(this._onHandleDragMove, this, 0, 0),
					drift: WP(this._onHandleDragMove, this),
					ondragend: WP(this._onHandleDragEnd, this)
				}), n.add(r)), VP(r, t, !1), r.setStyle(i.getItemStyle(null, [
					"color",
					"borderColor",
					"borderWidth",
					"opacity",
					"shadowColor",
					"shadowBlur",
					"shadowOffsetX",
					"shadowOffsetY"
				]));
				var s = i.get("size");
				V(s) || (s = [s, s]), r.scaleX = s[0] / 2, r.scaleY = s[1] / 2, zE(this, "_doDispatchAxisPointer", i.get("throttle") || 0, "fixRate"), this._moveHandleToValue(e, o);
			}
		}, e.prototype._moveHandleToValue = function(e, t) {
			LP(this._axisPointerModel, !t && this._moveAnimation, this._handle, BP(this.getHandleTransform(e, this._axisModel, this._axisPointerModel)));
		}, e.prototype._onHandleDragMove = function(e, t) {
			var n = this._handle;
			if (n) {
				this._dragging = !0;
				var r = this.updateHandleTransform(BP(n), [e, t], this._axisModel, this._axisPointerModel);
				this._payloadInfo = r, n.stopAnimation(), n.attr(BP(r)), HP(n).lastProp = null, this._doDispatchAxisPointer();
			}
		}, e.prototype._doDispatchAxisPointer = function() {
			if (this._handle) {
				var e = this._payloadInfo, t = this._axisModel;
				this._api.dispatchAction({
					type: "updateAxisPointer",
					x: e.cursorPoint[0],
					y: e.cursorPoint[1],
					tooltipOption: e.tooltipOption,
					axesInfo: [{
						axisDim: t.axis.dim,
						axisIndex: t.componentIndex
					}]
				});
			}
		}, e.prototype._onHandleDragEnd = function() {
			if (this._dragging = !1, this._handle) {
				var e = this._axisPointerModel.get("value");
				this._moveHandleToValue(e), this._api.dispatchAction({ type: "hideTip" });
			}
		}, e.prototype.clear = function(e) {
			this._lastValue = null, this._lastStatus = null;
			var t = e.getZr(), n = this._group, r = this._handle;
			t && n && (this._lastGraphicKey = null, n && t.remove(n), r && t.remove(r), this._group = null, this._handle = null, this._payloadInfo = null), BE(this, "_doDispatchAxisPointer");
		}, e.prototype.doClear = function() {}, e.prototype.buildLabel = function(e, t, n) {
			return n ||= 0, {
				x: e[n],
				y: e[1 - n],
				width: t[n],
				height: t[1 - n]
			};
		}, e;
	}();
}));
//#endregion
//#region node_modules/echarts/lib/component/axisPointer/viewHelper.js
function qP(e) {
	var t = e.get("type"), n = e.getModel(t + "Style"), r;
	return t === "line" ? (r = n.getLineStyle(), r.fill = null) : t === "shadow" && (r = n.getAreaStyle(), r.stroke = null), r;
}
function JP(e, t, n, r, i) {
	var a = XP(n.get("value"), t.axis, t.ecModel, n.get("seriesDataIndices"), {
		precision: n.get(["label", "precision"]),
		formatter: n.get(["label", "formatter"])
	}), o = n.getModel("label"), s = _y(o.get("padding") || 0), c = o.getFont(), l = Nr(a, c), u = i.position, d = l.width + s[1] + s[3], f = l.height + s[0] + s[2], p = i.align;
	p === "right" && (u[0] -= d), p === "center" && (u[0] -= d / 2);
	var m = i.verticalAlign;
	m === "bottom" && (u[1] -= f), m === "middle" && (u[1] -= f / 2), YP(u, d, f, r);
	var h = o.get("backgroundColor");
	(!h || h === "auto") && (h = t.get([
		"axisLine",
		"lineStyle",
		"color"
	])), e.label = {
		x: u[0],
		y: u[1],
		style: Xm(o, {
			text: a,
			font: c,
			fill: o.getTextColor(),
			padding: s,
			backgroundColor: h
		}),
		z2: 10
	};
}
function YP(e, t, n, r) {
	var i = r.getWidth(), a = r.getHeight();
	e[0] = Math.min(e[0] + t, i) - t, e[1] = Math.min(e[1] + n, a) - n, e[0] = Math.max(e[0], 0), e[1] = Math.max(e[1], 0);
}
function XP(e, t, n, r, i) {
	e = t.scale.parse(e);
	var a = t.scale.getLabel({ value: e }, { precision: i.precision }), o = i.formatter;
	if (o) {
		var s = {
			value: TC(t, { value: e }),
			axisDimension: t.dim,
			axisIndex: t.index,
			seriesData: []
		};
		z(r, function(e) {
			var t = n.getSeriesByIndex(e.seriesIndex), r = e.dataIndexInside, i = t && t.getDataParams(r);
			i && s.seriesData.push(i);
		}), U(o) ? a = o.replace("{value}", a) : H(o) && (a = o(s));
	}
	return a;
}
function ZP(e, t, n) {
	var r = Mn();
	return Ln(r, r, n.rotation), In(r, r, n.position), lm([e.dataToCoord(t), (n.labelOffset || 0) + (n.labelDirection || 1) * (n.labelMargin || 0)], r);
}
function QP(e, t, n, r, i, a) {
	var o = iE.innerTextLayout(n.rotation, 0, n.labelDirection);
	n.labelMargin = i.get(["label", "margin"]), JP(t, r, i, a, {
		position: ZP(r.axis, e, n),
		align: o.textAlign,
		verticalAlign: o.textVerticalAlign
	});
}
function $P(e, t, n) {
	return n ||= 0, {
		x1: e[n],
		y1: e[1 - n],
		x2: t[n],
		y2: t[1 - n]
	};
}
function eF(e, t, n) {
	return n ||= 0, {
		x: e[n],
		y: e[1 - n],
		width: t[n],
		height: t[1 - n]
	};
}
function tF(e, t, n) {
	return Zw(e, {
		fromStat: { sers: B(t, function(e) {
			return n.getSeriesByIndex(e.seriesIndex);
		}) },
		min: 1
	}).w;
}
function nF(e, t, n) {
	return [ll(cl(t[0], t[1]), e - n / 2), cl(e + n / 2, ll(t[0], t[1]))];
}
var rF = M((() => {
	q(), Gm(), Hr(), by(), Bn(), LC(), lE(), ch(), tT(), X();
}));
//#endregion
//#region node_modules/echarts/lib/component/axisPointer/CartesianAxisPointer.js
function iF(e, t) {
	var n = {};
	return n[t.dim + "AxisIndex"] = t.index, e.getCartesian(n);
}
function aF(e) {
	return e.dim === "x" ? 0 : 1;
}
var oF, sF, cF = M((() => {
	F(), KP(), rF(), mE(), X(), oF = function(e) {
		P(t, e);
		function t() {
			return e !== null && e.apply(this, arguments) || this;
		}
		return t.prototype.makeElOption = function(e, t, n, r, i) {
			var a = n.axis, o = a.grid, s = r.get("type"), c = a.getGlobalExtent(), l = iF(o, a).getOtherAxis(a).getGlobalExtent(), u = a.toGlobalCoord(a.dataToCoord(t, !0));
			if (s && s !== "none") {
				var d = qP(r), f = sF[s](a, u, c, l, r.get("seriesDataIndices"), r.ecModel);
				f.style = d, e.graphicKey = f.type, e.pointer = f;
			}
			QP(t, e, uE(o.getRect(), n), n, r, i);
		}, t.prototype.getHandleTransform = function(e, t, n) {
			var r = uE(t.axis.grid.getRect(), t, { labelInside: !1 });
			r.labelMargin = n.get(["handle", "margin"]);
			var i = ZP(t.axis, e, r);
			return {
				x: i[0],
				y: i[1],
				rotation: r.rotation + (r.labelDirection < 0 ? Math.PI : 0)
			};
		}, t.prototype.updateHandleTransform = function(e, t, n, r) {
			var i = n.axis, a = i.grid, o = i.getGlobalExtent(!0), s = iF(a, i).getOtherAxis(i).getGlobalExtent(), c = i.dim === "x" ? 0 : 1, l = [e.x, e.y];
			l[c] += t[c], l[c] = cl(o[1], l[c]), l[c] = ll(o[0], l[c]);
			var u = (s[1] + s[0]) / 2, d = [u, u];
			return d[c] = l[c], {
				x: l[0],
				y: l[1],
				rotation: e.rotation,
				cursorPoint: d,
				tooltipOption: [{ verticalAlign: "middle" }, { align: "center" }][c]
			};
		}, t;
	}(GP), sF = {
		line: function(e, t, n, r) {
			return {
				type: "Line",
				subPixelOptimize: !0,
				shape: $P([t, r[0]], [t, r[1]], aF(e))
			};
		},
		shadow: function(e, t, n, r, i, a) {
			var o = tF(e, i, a), s = r[1] - r[0], c = nF(t, n, o), l = c[0], u = c[1];
			return {
				type: "Rect",
				shape: eF([l, r[0]], [u - l, s], aF(e))
			};
		}
	};
})), lF, uF = M((() => {
	F(), Ry(), _b(), lF = function(e) {
		P(t, e);
		function t() {
			var n = e !== null && e.apply(this, arguments) || this;
			return n.type = t.type, n;
		}
		return t.type = "axisPointer", t.defaultOption = {
			show: "auto",
			z: 50,
			type: "line",
			snap: !1,
			triggerTooltip: !0,
			triggerEmphasis: !0,
			value: null,
			status: null,
			link: [],
			animation: null,
			animationDurationUpdate: 200,
			lineStyle: {
				color: Q.color.border,
				width: 1,
				type: "dashed"
			},
			shadowStyle: { color: Q.color.shadowTint },
			label: {
				show: !0,
				formatter: null,
				precision: "auto",
				margin: 3,
				color: Q.color.neutral00,
				padding: [
					5,
					7,
					5,
					7
				],
				backgroundColor: Q.color.accent60,
				borderColor: null,
				borderWidth: 0,
				borderRadius: 3
			},
			handle: {
				show: !1,
				icon: "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7v-1.2h6.6z M13.3,22H6.7v-1.2h6.6z M13.3,19.6H6.7v-1.2h6.6z",
				size: 45,
				margin: 50,
				color: Q.color.accent40,
				throttle: 40
			}
		}, t;
	}(Ly);
}));
//#endregion
//#region node_modules/echarts/lib/component/axisPointer/globalListener.js
function dF(e, t, n) {
	if (!J.node) {
		var r = t.getZr();
		vF(r).records || (vF(r).records = {}), fF(r, t);
		var i = vF(r).records[e] || (vF(r).records[e] = {});
		i.handler = n;
	}
}
function fF(e, t) {
	if (vF(e).initialized) return;
	vF(e).initialized = !0, n("click", lt(hF, "click")), n("mousemove", lt(hF, "mousemove")), n("mousewheel", lt(hF, "mousewheel")), n("globalout", mF);
	function n(n, r) {
		e.on(n, function(n) {
			var i = gF(t);
			yF(vF(e).records, function(e) {
				e && r(e, n, i.dispatchAction);
			}), pF(i.pendings, t);
		});
	}
}
function pF(e, t) {
	var n = e.showTip.length, r = e.hideTip.length, i;
	n ? i = e.showTip[n - 1] : r && (i = e.hideTip[r - 1]), i && (i.dispatchAction = null, t.dispatchAction(i));
}
function mF(e, t, n) {
	e.handler("leave", null, n);
}
function hF(e, t, n, r) {
	t.handler(e, n, r);
}
function gF(e) {
	var t = {
		showTip: [],
		hideTip: []
	}, n = function(r) {
		var i = t[r.type];
		i ? i.push(r) : (r.dispatchAction = n, e.dispatchAction(r));
	};
	return {
		dispatchAction: n,
		pendings: t
	};
}
function _F(e, t) {
	if (!J.node) {
		var n = t.getZr();
		(vF(n).records || {})[e] && (vF(n).records[e] = null);
	}
}
var vF, yF, bF = M((() => {
	q(), $t(), Z(), vF = Yl(), yF = z;
})), xF, SF = M((() => {
	F(), bF(), Ok(), xF = function(e) {
		P(t, e);
		function t() {
			var n = e !== null && e.apply(this, arguments) || this;
			return n.type = t.type, n;
		}
		return t.prototype.render = function(e, t, n) {
			var r = t.getComponent("tooltip"), i = e.get("triggerOn") || r && r.get("triggerOn") || "mousemove|click|mousewheel";
			dF("axisPointer", n, function(e, t, n) {
				i !== "none" && (e === "leave" || i.indexOf(e) >= 0) && n({
					type: "updateAxisPointer",
					currTrigger: e,
					x: t && t.offsetX,
					y: t && t.offsetY
				});
			});
		}, t.prototype.remove = function(e, t) {
			_F("axisPointer", t);
		}, t.prototype.dispose = function(e, t) {
			_F("axisPointer", t);
		}, t.type = "axisPointer", t;
	}(Dk);
}));
//#endregion
//#region node_modules/echarts/lib/component/axisPointer/findPointFromSeries.js
function CF(e, t) {
	var n = [], r = e.seriesIndex, i;
	if (r == null || !(i = t.getSeriesByIndex(r))) return { point: [] };
	var a = i.getData(), o = Jl(a, e);
	if (o == null || o < 0 || V(o)) return { point: [] };
	var s = a.getItemGraphicEl(o), c = i.coordinateSystem;
	if (i.getTooltipPosition) n = i.getTooltipPosition(o) || [];
	else if (c && c.dataToPoint) {
		if (e.isStacked) {
			var l = c.getBaseAxis(), u = c.getOtherAxis(l).dim, d = l.dim, f = +(u === "x" || u === "radius"), p = a.mapDimension(d), m = [];
			m[f] = a.get(p, o), m[1 - f] = a.get(a.getCalculationInfo("stackResultDimension"), o), n = c.dataToPoint(m) || [];
		} else n = c.dataToPoint(a.getValues(B(c.dimensions, function(e) {
			return a.mapDimension(e);
		}), o)) || [];
	} else if (s) {
		var h = s.getBoundingRect().clone();
		h.applyTransform(s.transform), n = [h.x + h.width / 2, h.y + h.height / 2];
	}
	return {
		point: n,
		el: s
	};
}
var wF = M((() => {
	q(), Z();
}));
//#endregion
//#region node_modules/echarts/lib/component/axisPointer/axisTrigger.js
function TF(e, t, n) {
	var r = e.currTrigger, i = [e.x, e.y], a = e, o = e.dispatchAction || Gt(n.dispatchAction, n), s = t.getComponent("axisPointer").coordSysAxesInfo;
	if (s) {
		FF(i) && (i = CF({
			seriesIndex: a.seriesIndex,
			dataIndex: a.dataIndex
		}, t).point);
		var c = FF(i), l = a.axesInfo, u = s.axesInfo, d = r === "leave" || FF(i), f = {}, p = {}, m = {
			list: [],
			map: {}
		}, h = {
			showPointer: lt(OF, p),
			showTooltip: lt(kF, m)
		};
		z(s.coordSysMap, function(e, t) {
			var n = c || e.containPoint(i);
			z(s.coordSysAxesInfo[t], function(e, t) {
				var r = e.axis, a = NF(l, e);
				if (!d && n && (!l || a)) {
					var o = a && a.value;
					o == null && !c && (o = r.pointToData(i)), o != null && EF(e, o, h, !1, f);
				}
			});
		});
		var g = {};
		return z(u, function(e, t) {
			var n = e.linkGroup;
			n && !p[t] && z(n.axesInfo, function(t, r) {
				var i = p[r];
				if (t !== e && i) {
					var a = i.value;
					n.mapper && (a = e.axis.scale.parse(n.mapper(a, PF(t), PF(e)))), g[e.key] = a;
				}
			});
		}), z(g, function(e, t) {
			EF(u[t], e, h, !0, f);
		}), AF(p, u, f), jF(m, i, e, o), MF(u, o, n), f;
	}
}
function EF(e, t, n, r, i) {
	var a = e.axis;
	if (!a.scale.isBlank() && a.containData(t)) {
		if (!e.involveSeries) {
			n.showPointer(e, t);
			return;
		}
		var o = DF(t, e), s = o.payloadBatch, c = o.snapToValue;
		s[0] && i.seriesIndex == null && L(i, s[0]), !r && e.snap && a.containData(c) && c != null && (t = c), n.showPointer(e, t, s), n.showTooltip(e, o, c);
	}
}
function DF(e, t) {
	var n = t.axis, r = n.dim, i = e, a = [], o = Number.MAX_VALUE, s = -1;
	return z(t.seriesModels, function(t, c) {
		var l = t.getData().mapDimensionsAll(r), u, d;
		if (t.getAxisTooltipData) {
			var f = t.getAxisTooltipData(l, e, n);
			d = f.dataIndices, u = f.nestestValue;
		} else {
			if (d = t.indicesOfNearest(r, l[0], e, n.type === "category" ? .5 : null), !d.length) return;
			u = t.getData().get(l[0], d[0]);
		}
		if (al(u)) {
			var p = e - u, m = Math.abs(p);
			m <= o && ((m < o || p >= 0 && s < 0) && (o = m, s = p, i = u, a.length = 0), z(d, function(e) {
				a.push({
					seriesIndex: t.seriesIndex,
					dataIndexInside: e,
					dataIndex: t.getData().getRawIndex(e)
				});
			}));
		}
	}), {
		payloadBatch: a,
		snapToValue: i
	};
}
function OF(e, t, n, r) {
	e[t.key] = {
		value: n,
		payloadBatch: r
	};
}
function kF(e, t, n, r) {
	var i = n.payloadBatch, a = t.axis, o = a.model, s = t.axisPointerModel;
	if (t.triggerTooltip && i.length) {
		var c = t.coordSys.model, l = gP(c), u = e.map[l];
		u || (u = e.map[l] = {
			coordSysId: c.id,
			coordSysIndex: c.componentIndex,
			coordSysType: c.type,
			coordSysMainType: c.mainType,
			dataByAxis: []
		}, e.list.push(u)), u.dataByAxis.push({
			axisDim: a.dim,
			axisIndex: o.componentIndex,
			axisType: o.type,
			axisId: o.id,
			value: r,
			valueLabelOpt: {
				precision: s.get(["label", "precision"]),
				formatter: s.get(["label", "formatter"])
			},
			seriesDataIndices: i.slice()
		});
	}
}
function AF(e, t, n) {
	var r = n.axesInfo = [];
	z(t, function(t, n) {
		var i = t.axisPointerModel.option, a = e[n];
		a ? (!t.useHandle && (i.status = "show"), i.value = a.value, i.seriesDataIndices = (a.payloadBatch || []).slice()) : !t.useHandle && (i.status = "hide"), i.status === "show" && r.push({
			axisDim: t.axis.dim,
			axisIndex: t.axis.model.componentIndex,
			value: i.value
		});
	});
}
function jF(e, t, n, r) {
	if (FF(t) || !e.list.length) {
		r({ type: "hideTip" });
		return;
	}
	var i = ((e.list[0].dataByAxis[0] || {}).seriesDataIndices || [])[0] || {};
	r({
		type: "showTip",
		escapeConnect: !0,
		x: t[0],
		y: t[1],
		tooltipOption: n.tooltipOption,
		position: n.position,
		dataIndexInside: i.dataIndexInside,
		dataIndex: i.dataIndex,
		seriesIndex: i.seriesIndex,
		dataByCoordSys: e.list
	});
}
function MF(e, t, n) {
	var r = n.getZr(), i = "axisPointerLastHighlights", a = IF(r)[i] || {}, o = IF(r)[i] = {};
	z(e, function(e, t) {
		var n = e.axisPointerModel.option;
		n.status === "show" && e.triggerEmphasis && z(n.seriesDataIndices, function(e) {
			o[e.seriesIndex + "|" + e.dataIndex] = e;
		});
	});
	var s = [], c = [];
	function l(e) {
		return {
			seriesIndex: e.seriesIndex,
			dataIndex: e.dataIndex
		};
	}
	z(a, function(e, t) {
		!o[t] && c.push(l(e));
	}), z(o, function(e, t) {
		!a[t] && s.push(l(e));
	}), c.length && n.dispatchAction({
		type: "downplay",
		escapeConnect: !0,
		notBlur: !0,
		batch: c
	}), s.length && n.dispatchAction({
		type: "highlight",
		escapeConnect: !0,
		notBlur: !0,
		batch: s
	});
}
function NF(e, t) {
	for (var n = 0; n < (e || []).length; n++) {
		var r = e[n];
		if (t.axis.dim === r.axisDim && t.axis.model.componentIndex === r.axisIndex) return r;
	}
}
function PF(e) {
	var t = e.axis.model, n = {}, r = n.axisDim = e.axis.dim;
	return n.axisIndex = n[r + "AxisIndex"] = t.componentIndex, n.axisName = n[r + "AxisName"] = t.name, n.axisId = n[r + "AxisId"] = t.id, n;
}
function FF(e) {
	return !e || e[0] == null || isNaN(e[0]) || e[1] == null || isNaN(e[1]);
}
var IF, LF = M((() => {
	Z(), _P(), wF(), q(), X(), IF = Yl();
}));
//#endregion
//#region node_modules/echarts/lib/component/axisPointer/install.js
function RF(e) {
	yP.registerAxisPointerClass("CartesianAxisPointer", oF), e.registerComponentModel(lF), e.registerComponentView(xF), e.registerPreprocessor(function(e) {
		if (e) {
			(!e.axisPointer || e.axisPointer.length === 0) && (e.axisPointer = {});
			var t = e.axisPointer.link;
			t && !V(t) && (e.axisPointer.link = [t]);
		}
	}), e.registerProcessor(e.PRIORITY.PROCESSOR.STATISTIC, { overallReset: function(e, t) {
		e.getComponent("axisPointer").coordSysAxesInfo = oP(e, t);
	} }), e.registerAction({
		type: "updateAxisPointer",
		event: "updateAxisPointer",
		update: ":updateAxisPointer"
	}, TF);
}
var zF = M((() => {
	bP(), cF(), uF(), SF(), q(), _P(), LF();
}));
//#endregion
//#region node_modules/echarts/lib/component/grid/install.js
function BF(e) {
	uN(jP), uN(RF);
}
var VF = M((() => {
	PP(), zF(), pN();
}));
//#endregion
//#region node_modules/echarts/lib/component/helper/listComponent.js
function HF(e, t) {
	var n = _y(t.get("padding")), r = t.getItemStyle(["color", "opacity"]);
	return r.fill = t.get("backgroundColor"), new gc({
		shape: {
			x: e.x - n[3],
			y: e.y - n[0],
			width: e.width + n[1] + n[3],
			height: e.height + n[0] + n[2],
			r: t.get("borderRadius")
		},
		style: r,
		silent: !0,
		z2: -1
	});
}
var UF = M((() => {
	by(), Gm();
})), WF, GF = M((() => {
	F(), Ry(), _b(), WF = function(e) {
		P(t, e);
		function t() {
			var n = e !== null && e.apply(this, arguments) || this;
			return n.type = t.type, n;
		}
		return t.type = "tooltip", t.dependencies = ["axisPointer"], t.defaultOption = {
			z: 60,
			show: !0,
			showContent: !0,
			trigger: "item",
			triggerOn: "mousemove|click|mousewheel",
			alwaysShowContent: !1,
			renderMode: "auto",
			confine: null,
			showDelay: 0,
			hideDelay: 100,
			transitionDuration: .4,
			displayTransition: !0,
			enterable: !1,
			backgroundColor: Q.color.neutral00,
			shadowBlur: 10,
			shadowColor: "rgba(0, 0, 0, .2)",
			shadowOffsetX: 1,
			shadowOffsetY: 2,
			borderRadius: 4,
			borderWidth: 1,
			defaultBorderColor: Q.color.border,
			padding: null,
			extraCssText: "",
			axisPointer: {
				type: "line",
				axis: "auto",
				animation: "auto",
				animationDurationUpdate: 200,
				animationEasingUpdate: "exponentialOut",
				crossStyle: {
					color: Q.color.borderShade,
					width: 1,
					type: "dashed",
					textStyle: {}
				}
			},
			textStyle: {
				color: Q.color.tertiary,
				fontSize: 14
			}
		}, t;
	}(Ly);
}));
//#endregion
//#region node_modules/echarts/lib/component/tooltip/helper.js
function KF(e) {
	var t = e.get("confine");
	return t == null ? e.get("renderMode") === "richText" : !!t;
}
function qF(e) {
	if (J.domSupported) {
		for (var t = document.documentElement.style, n = 0, r = e.length; n < r; n++) if (e[n] in t) return e[n];
	}
}
function JF(e, t) {
	if (!e) return t;
	t = fy(t, !0);
	var n = e.indexOf(t);
	return e = n === -1 ? t : "-" + e.slice(0, n) + "-" + t, e.toLowerCase();
}
function YF(e, t) {
	var n = e.currentStyle || document.defaultView && document.defaultView.getComputedStyle(e);
	return n ? t ? n[t] : n : null;
}
var XF, ZF, QF = M((() => {
	by(), $t(), XF = qF([
		"transform",
		"webkitTransform",
		"OTransform",
		"MozTransform",
		"msTransform"
	]), ZF = qF([
		"webkitTransition",
		"transition",
		"OTransition",
		"MozTransition",
		"msTransition"
	]);
}));
//#endregion
//#region node_modules/echarts/lib/component/tooltip/TooltipHTMLContent.js
function $F(e) {
	return e = e === "left" ? "right" : e === "right" ? "left" : e === "top" ? "bottom" : "top", e;
}
function eI(e, t, n) {
	if (!U(n) || n === "inside") return "";
	var r = e.get("backgroundColor"), i = e.get("borderWidth");
	t = gy(t);
	var a = $F(n), o = Math.max(Math.round(i) * 1.5, 6), s = "", c = sI + ":", l;
	R(["left", "right"], a) > -1 ? (s += "top:50%", c += "translateY(-50%) rotate(" + (l = a === "left" ? -225 : -45) + "deg)") : (s += "left:50%", c += "translateX(-50%) rotate(" + (l = a === "top" ? 225 : 45) + "deg)");
	var u = l * Math.PI / 180, d = o + i, f = d * Math.abs(Math.cos(u)) + d * Math.abs(Math.sin(u)), p = Math.round(((f - Math.SQRT2 * i) / 2 + Math.SQRT2 * i - (f - d) / 2) * 100) / 100;
	s += ";" + a + ":-" + p + "px";
	var m = t + " solid " + i + "px;";
	return "<div style=\"" + [
		"position:absolute;width:" + o + "px;height:" + o + "px;z-index:-1;",
		s + ";" + c + ";",
		"border-bottom:" + m,
		"border-right:" + m,
		"background-color:" + r + ";"
	].join("") + "\"></div>";
}
function tI(e, t, n) {
	var r = "cubic-bezier(0.23,1,0.32,1)", i = "", a = "";
	return n && (i = " " + e / 2 + "s " + r, a = "opacity" + i + ",visibility" + i), t || (i = " " + e + "s " + r, a += (a.length ? "," : "") + (J.transformSupported ? "" + sI + i : ",left" + i + ",top" + i)), oI + ":" + a;
}
function nI(e, t, n) {
	var r = e.toFixed(0) + "px", i = t.toFixed(0) + "px";
	if (!J.transformSupported) return n ? "top:" + i + ";left:" + r + ";" : [["top", i], ["left", r]];
	var a = J.transform3dSupported, o = "translate" + (a ? "3d" : "") + "(" + r + "," + i + (a ? ",0" : "") + ")";
	return n ? "top:0;left:0;" + sI + ":" + o + ";" : [
		["top", 0],
		["left", 0],
		[XF, o]
	];
}
function rI(e) {
	var t = [], n = e.get("fontSize"), r = e.getTextColor();
	r && t.push("color:" + r), t.push("font:" + e.getFont());
	var i = G(e.get("lineHeight"), Math.round(n * 3 / 2));
	n && t.push("line-height:" + i + "px");
	var a = e.get("textShadowColor"), o = e.get("textShadowBlur") || 0, s = e.get("textShadowOffsetX") || 0, c = e.get("textShadowOffsetY") || 0;
	return a && o && t.push("text-shadow:" + s + "px " + c + "px " + o + "px " + a), z(["decoration", "align"], function(n) {
		var r = e.get(n);
		r && t.push("text-" + n + ":" + r);
	}), t.join(";");
}
function iI(e, t, n, r) {
	var i = [], a = e.get("transitionDuration"), o = e.get("backgroundColor"), s = e.get("shadowBlur"), c = e.get("shadowColor"), l = e.get("shadowOffsetX"), u = e.get("shadowOffsetY"), d = e.getModel("textStyle"), f = Pb(e, "html"), p = l + "px " + u + "px " + s + "px " + c;
	return i.push("box-shadow:" + p), t && a > 0 && i.push(tI(a, n, r)), o && i.push("background-color:" + o), z([
		"width",
		"color",
		"radius"
	], function(t) {
		var n = "border-" + t, r = fy(n), a = e.get(r);
		a != null && i.push(n + ":" + a + (t === "color" ? "" : "px"));
	}), i.push(rI(d)), f != null && i.push("padding:" + _y(f).join("px ") + "px"), i.join(";") + ";";
}
function aI(e, t, n, r, i) {
	var a = t && t.painter;
	if (n) {
		var o = a && a.getViewportRoot();
		o && Y_(e, o, n, r, i);
	} else {
		e[0] = r, e[1] = i;
		var s = a && a.getViewportRootOffset();
		s && (e[0] += s.offsetLeft, e[1] += s.offsetTop);
	}
	e[2] = e[0] / t.getWidth(), e[3] = e[1] / t.getHeight();
}
var oI, sI, cI, lI, uI = M((() => {
	q(), cD(), ov(), $t(), by(), QF(), zb(), oI = JF(ZF, "transition"), sI = JF(XF, "transform"), cI = "position:absolute;display:block;border-style:solid;white-space:nowrap;z-index:9999999;" + (J.transform3dSupported ? "will-change:transform;" : ""), lI = function() {
		function e(e, t) {
			if (this._show = !1, this._styleCoord = [
				0,
				0,
				0,
				0
			], this._enterable = !0, this._alwaysShowContent = !1, this._firstShow = !0, this._longHide = !0, J.wxa) return null;
			var n = document.createElement("div");
			n.domBelongToZr = !0, this.el = n;
			var r = this._zr = e.getZr(), i = t.appendTo, a = i && (U(i) ? document.querySelector(i) : mt(i) ? i : H(i) && i(e.getDom()));
			aI(this._styleCoord, r, a, e.getWidth() / 2, e.getHeight() / 2), (a || e.getDom()).appendChild(n), this._api = e, this._container = a;
			var o = this;
			n.onmouseenter = function() {
				o._enterable && (clearTimeout(o._hideTimeout), o._show = !0), o._inContent = !0;
			}, n.onmousemove = function(e) {
				if (e ||= window.event, !o._enterable) {
					var t = r.handler;
					eD(r.painter.getViewportRoot(), e, !0), t.dispatch("mousemove", e);
				}
			}, n.onmouseleave = function() {
				o._inContent = !1, o._enterable && o._show && o.hideLater(o._hideDelay);
			};
		}
		return e.prototype.update = function(e) {
			if (!this._container) {
				var t = this._api.getDom(), n = YF(t, "position"), r = t.style;
				r.position !== "absolute" && n !== "absolute" && (r.position = "relative");
			}
			var i = e.get("alwaysShowContent");
			i && this._moveIfResized(), this._alwaysShowContent = i, this._enableDisplayTransition = e.get("displayTransition") && e.get("transitionDuration") > 0, this.el.className = e.get("className") || "";
		}, e.prototype.show = function(e, t) {
			clearTimeout(this._hideTimeout), clearTimeout(this._longHideTimeout);
			var n = this.el, r = n.style, i = this._styleCoord;
			n.innerHTML ? r.cssText = cI + iI(e, !this._firstShow, this._longHide, this._enableDisplayTransition) + nI(i[0], i[1], !0) + ("border-color:" + gy(t) + ";") + (e.get("extraCssText") || "") + (";pointer-events:" + (this._enterable ? "auto" : "none")) : r.display = "none", this._show = !0, this._firstShow = !1, this._longHide = !1;
		}, e.prototype.setContent = function(e, t, n, r, i) {
			var a = this.el;
			if (e == null) {
				a.innerHTML = "";
				return;
			}
			var o = "";
			if (U(i) && n.get("trigger") === "item" && !KF(n) && (o = eI(n, r, i)), U(e)) a.innerHTML = e + o;
			else if (e) {
				a.innerHTML = "", V(e) || (e = [e]);
				for (var s = 0; s < e.length; s++) mt(e[s]) && e[s].parentNode !== a && a.appendChild(e[s]);
				if (o && a.childNodes.length) {
					var c = document.createElement("div");
					c.innerHTML = o, a.appendChild(c);
				}
			}
		}, e.prototype.setEnterable = function(e) {
			this._enterable = e;
		}, e.prototype.getSize = function() {
			var e = this.el;
			return e ? [e.offsetWidth, e.offsetHeight] : [0, 0];
		}, e.prototype.moveTo = function(e, t) {
			if (this.el) {
				var n = this._styleCoord;
				if (aI(n, this._zr, this._container, e, t), n[0] != null && n[1] != null) {
					var r = this.el.style;
					z(nI(n[0], n[1]), function(e) {
						r[e[0]] = e[1];
					});
				}
			}
		}, e.prototype._moveIfResized = function() {
			var e = this._styleCoord[2], t = this._styleCoord[3];
			this.moveTo(e * this._zr.getWidth(), t * this._zr.getHeight());
		}, e.prototype.hide = function() {
			var e = this, t = this.el.style;
			this._enableDisplayTransition ? (t.visibility = "hidden", t.opacity = "0") : t.display = "none", J.transform3dSupported && (t.willChange = ""), this._show = !1, this._longHideTimeout = setTimeout(function() {
				return e._longHide = !0;
			}, 500);
		}, e.prototype.hideLater = function(e) {
			this._show && !(this._inContent && this._enterable) && !this._alwaysShowContent && (e ? (this._hideDelay = e, this._show = !1, this._hideTimeout = setTimeout(Gt(this.hide, this), e)) : this.hide());
		}, e.prototype.isShow = function() {
			return this._show;
		}, e.prototype.dispose = function() {
			clearTimeout(this._hideTimeout), clearTimeout(this._longHideTimeout);
			var e = this._zr;
			X_(e && e.painter && e.painter.getViewportRoot(), this._container);
			var t = this.el;
			if (t) {
				t.onmouseenter = t.onmousemove = t.onmouseleave = null;
				var n = t.parentNode;
				n && n.removeChild(t);
			}
			this.el = this._container = null;
		}, e;
	}();
}));
//#endregion
//#region node_modules/echarts/lib/component/tooltip/TooltipRichContent.js
function dI(e) {
	return Math.max(0, e);
}
function fI(e) {
	var t = dI(e.shadowBlur || 0), n = dI(e.shadowOffsetX || 0), r = dI(e.shadowOffsetY || 0);
	return {
		left: dI(t - n),
		right: dI(t + n),
		top: dI(t - r),
		bottom: dI(t + r)
	};
}
function pI(e, t, n, r) {
	e[0] = n, e[1] = r, e[2] = e[0] / t.getWidth(), e[3] = e[1] / t.getHeight();
}
var mI, hI = M((() => {
	q(), Ic(), zb(), Ol(), mI = function() {
		function e(e) {
			this._show = !1, this._styleCoord = [
				0,
				0,
				0,
				0
			], this._alwaysShowContent = !1, this._enterable = !0, this._zr = e.getZr(), pI(this._styleCoord, this._zr, e.getWidth() / 2, e.getHeight() / 2);
		}
		return e.prototype.update = function(e) {
			var t = e.get("alwaysShowContent");
			t && this._moveIfResized(), this._alwaysShowContent = t;
		}, e.prototype.show = function() {
			this._hideTimeout && clearTimeout(this._hideTimeout), this.el.show(), this._show = !0;
		}, e.prototype.setContent = function(e, t, n, r, i) {
			var a = this;
			W(e) && wl(""), this.el && this._zr.remove(this.el);
			var o = n.getModel("textStyle");
			this.el = new Mc({
				style: {
					rich: t.richTextStyles,
					text: e,
					lineHeight: 22,
					borderWidth: 1,
					borderColor: r,
					textShadowColor: o.get("textShadowColor"),
					fill: n.get(["textStyle", "color"]),
					padding: Pb(n, "richText"),
					verticalAlign: "top",
					align: "left"
				},
				z: n.get("z")
			}), z([
				"backgroundColor",
				"borderRadius",
				"shadowColor",
				"shadowBlur",
				"shadowOffsetX",
				"shadowOffsetY"
			], function(e) {
				a.el.style[e] = n.get(e);
			}), z([
				"textShadowBlur",
				"textShadowOffsetX",
				"textShadowOffsetY"
			], function(e) {
				a.el.style[e] = o.get(e) || 0;
			}), this._zr.add(this.el);
			var s = this;
			this.el.on("mouseover", function() {
				s._enterable && (clearTimeout(s._hideTimeout), s._show = !0), s._inContent = !0;
			}), this.el.on("mouseout", function() {
				s._enterable && s._show && s.hideLater(s._hideDelay), s._inContent = !1;
			});
		}, e.prototype.setEnterable = function(e) {
			this._enterable = e;
		}, e.prototype.getSize = function() {
			var e = this.el, t = this.el.getBoundingRect(), n = fI(e.style);
			return [t.width + n.left + n.right, t.height + n.top + n.bottom];
		}, e.prototype.moveTo = function(e, t) {
			var n = this.el;
			if (n) {
				var r = this._styleCoord;
				pI(r, this._zr, e, t), e = r[0], t = r[1];
				var i = n.style, a = dI(i.borderWidth || 0), o = fI(i);
				n.x = e + a + o.left, n.y = t + a + o.top, n.markRedraw();
			}
		}, e.prototype._moveIfResized = function() {
			var e = this._styleCoord[2], t = this._styleCoord[3];
			this.moveTo(e * this._zr.getWidth(), t * this._zr.getHeight());
		}, e.prototype.hide = function() {
			this.el && this.el.hide(), this._show = !1;
		}, e.prototype.hideLater = function(e) {
			this._show && !(this._inContent && this._enterable) && !this._alwaysShowContent && (e ? (this._hideDelay = e, this._show = !1, this._hideTimeout = setTimeout(Gt(this.hide, this), e)) : this.hide());
		}, e.prototype.isShow = function() {
			return this._show;
		}, e.prototype.dispose = function() {
			this._zr.remove(this.el);
		}, e;
	}();
}));
//#endregion
//#region node_modules/echarts/lib/component/tooltip/TooltipView.js
function gI(e, t, n) {
	var r = t.ecModel, i;
	n ? (i = new Sh(n, r, r), i = new Sh(t.option, i, r)) : i = t;
	for (var a = e.length - 1; a >= 0; a--) {
		var o = e[a];
		o && (o instanceof Sh && (o = o.get("tooltip", !0)), U(o) && (o = { formatter: o }), o && (i = new Sh(o, i, r)));
	}
	return i;
}
function _I(e, t) {
	return e.dispatchAction || Gt(t.dispatchAction, t);
}
function vI(e, t, n, r, i, a, o) {
	var s = n.getSize(), c = s[0], l = s[1];
	return a != null && (e + c + a + 2 > r ? e -= c + a : e += a), o != null && (t + l + o > i ? t -= l + o : t += o), [e, t];
}
function yI(e, t, n, r, i) {
	var a = n.getSize(), o = a[0], s = a[1];
	return e = Math.min(e + o, r) - o, t = Math.min(t + s, i) - s, e = Math.max(e, 0), t = Math.max(t, 0), [e, t];
}
function bI(e, t, n, r) {
	var i = n[0], a = n[1], o = Math.ceil(Math.SQRT2 * r) + 8, s = 0, c = 0, l = t.width, u = t.height;
	switch (e) {
		case "inside":
			s = t.x + l / 2 - i / 2, c = t.y + u / 2 - a / 2;
			break;
		case "top":
			s = t.x + l / 2 - i / 2, c = t.y - a - o;
			break;
		case "bottom":
			s = t.x + l / 2 - i / 2, c = t.y + u + o;
			break;
		case "left":
			s = t.x - i - o, c = t.y + u / 2 - a / 2;
			break;
		case "right": s = t.x + l + o, c = t.y + u / 2 - a / 2;
	}
	return [s, c];
}
function xI(e) {
	return e === "center" || e === "middle";
}
function SI(e, t, n) {
	var r = Zl(e).queryOptionMap, i = r.keys()[0];
	if (i && i !== "series") {
		var a = Ql(t, i, r.get(i), {
			useDefault: !1,
			enableAll: !1,
			enableNone: !1
		}).models[0];
		if (a) {
			var o = n.getViewOfComponentModel(a), s;
			if (o.group.traverse(function(t) {
				var n = Tu(t).tooltipConfig;
				if (n && n.name === e.name) return s = t, !0;
			}), s) return {
				componentMainType: i,
				componentIndex: a.componentIndex,
				el: s
			};
		}
	}
}
var CI, wI, TI = M((() => {
	F(), q(), $t(), uI(), hI(), by(), X(), Gm(), wF(), Py(), Ch(), bF(), LC(), rF(), Z(), Ok(), uy(), Du(), QF(), Jy(), zb(), bA(), WE(), CI = new gc({ shape: {
		x: -1,
		y: -1,
		width: 2,
		height: 2
	} }), wI = function(e) {
		P(t, e);
		function t() {
			var n = e !== null && e.apply(this, arguments) || this;
			return n.type = t.type, n;
		}
		return t.prototype.init = function(e, t) {
			if (!J.node && t.getDom()) {
				var n = e.getComponent("tooltip"), r = this._renderMode = nu(n.get("renderMode"));
				this._tooltipContent = r === "richText" ? new mI(t) : new lI(t, { appendTo: n.get("appendToBody", !0) ? "body" : n.get("appendTo", !0) });
			}
		}, t.prototype.render = function(e, t, n) {
			if (!J.node && n.getDom()) {
				this.group.removeAll(), this._tooltipModel = e, this._ecModel = t, this._api = n;
				var r = this._tooltipContent;
				r.update(e), r.setEnterable(e.get("enterable")), this._initGlobalListener(), this._keepShow(), this._renderMode !== "richText" && e.get("transitionDuration") ? zE(this, "_updatePosition", 50, "fixRate") : BE(this, "_updatePosition");
			}
		}, t.prototype._initGlobalListener = function() {
			var e = this._tooltipModel.get("triggerOn");
			dF("itemTooltip", this._api, Gt(function(t, n, r) {
				e !== "none" && (e.indexOf(t) >= 0 ? this._tryShow(n, r) : t === "leave" && this._hide(r));
			}, this));
		}, t.prototype._keepShow = function() {
			var e = this._tooltipModel, t = this._ecModel, n = this._api, r = e.get("triggerOn");
			if (e.get("trigger") !== "axis" && (this._lastDataByCoordSys = null, this._cbParamsList = null), this._lastX != null && this._lastY != null && r !== "none" && r !== "click") {
				var i = this;
				clearTimeout(this._refreshUpdateTimeout), this._refreshUpdateTimeout = setTimeout(function() {
					!n.isDisposed() && i.manuallyShowTip(e, t, n, {
						x: i._lastX,
						y: i._lastY,
						dataByCoordSys: i._lastDataByCoordSys
					});
				});
			}
		}, t.prototype.manuallyShowTip = function(e, t, n, r) {
			if (r.from !== this.uid && !J.node && n.getDom()) {
				var i = _I(r, n);
				this._ticket = "";
				var a = r.dataByCoordSys, o = SI(r, t, n);
				if (o) {
					var s = o.el.getBoundingRect().clone();
					s.applyTransform(o.el.transform), this._tryShow({
						offsetX: s.x + s.width / 2,
						offsetY: s.y + s.height / 2,
						target: o.el,
						position: r.position,
						positionDefault: "bottom"
					}, i);
				} else if (r.tooltip && r.x != null && r.y != null) {
					var c = CI;
					c.x = r.x, c.y = r.y, c.update(), Tu(c).tooltipConfig = {
						name: null,
						option: r.tooltip
					}, this._tryShow({
						offsetX: r.x,
						offsetY: r.y,
						target: c
					}, i);
				} else if (a) this._tryShow({
					offsetX: r.x,
					offsetY: r.y,
					position: r.position,
					dataByCoordSys: a,
					tooltipOption: r.tooltipOption
				}, i);
				else if (r.seriesIndex != null) {
					if (this._manuallyAxisShowTip(e, t, n, r)) return;
					var l = CF(r, t), u = l.point[0], d = l.point[1];
					u != null && d != null && this._tryShow({
						offsetX: u,
						offsetY: d,
						target: l.el,
						position: r.position,
						positionDefault: "bottom"
					}, i);
				} else r.x != null && r.y != null && (n.dispatchAction({
					type: "updateAxisPointer",
					x: r.x,
					y: r.y
				}), this._tryShow({
					offsetX: r.x,
					offsetY: r.y,
					position: r.position,
					target: n.getZr().findHover(r.x, r.y).target
				}, i));
			}
		}, t.prototype.manuallyHideTip = function(e, t, n, r) {
			var i = this._tooltipContent;
			this._tooltipModel && i.hideLater(this._tooltipModel.get("hideDelay")), this._lastX = this._lastY = this._lastDataByCoordSys = null, this._cbParamsList = null, r.from !== this.uid && this._hide(_I(r, n));
		}, t.prototype._manuallyAxisShowTip = function(e, t, n, r) {
			var i = r.seriesIndex, a = r.dataIndex, o = t.getComponent("axisPointer").coordSysAxesInfo;
			if (i != null && a != null && o != null) {
				var s = t.getSeriesByIndex(i);
				if (s && gI([
					s.getData().getItemModel(a),
					s,
					(s.coordinateSystem || {}).model
				], this._tooltipModel).get("trigger") === "axis") return n.dispatchAction({
					type: "updateAxisPointer",
					seriesIndex: i,
					dataIndex: a,
					position: r.position
				}), !0;
			}
		}, t.prototype._tryShow = function(e, t) {
			var n = e.target;
			if (this._tooltipModel) {
				this._lastX = e.offsetX, this._lastY = e.offsetY;
				var r = e.dataByCoordSys;
				if (r && r.length) this._showAxisTooltip(r, e);
				else if (n) {
					if (Tu(n).ssrType === "legend") return;
					this._lastDataByCoordSys = null, this._cbParamsList = null;
					var i, a;
					yA(n, function(e) {
						if (e.tooltipDisabled) return i = a = null, !0;
						i || a || (Tu(e).dataIndex == null ? Tu(e).tooltipConfig != null && (a = e) : i = e);
					}, !0), i ? this._showSeriesItemTooltip(e, i, t) : a ? this._showComponentItemTooltip(e, a, t) : this._hide(t);
				} else this._lastDataByCoordSys = null, this._cbParamsList = null, this._hide(t);
			}
		}, t.prototype._showOrMove = function(e, t) {
			var n = e.get("showDelay");
			t = Gt(t, this), clearTimeout(this._showTimout), n > 0 ? this._showTimout = setTimeout(t, n) : t();
		}, t.prototype._showAxisTooltip = function(e, t) {
			var n = this._ecModel, r = this._tooltipModel, i = [t.offsetX, t.offsetY], a = gI([t.tooltipOption], r), o = this._renderMode, s = [], c = bb("section", {
				blocks: [],
				noHeader: !0
			}), l = [], u = new Rb();
			z(e, function(e) {
				z(e.dataByAxis, function(e) {
					var t = n.getComponent(e.axisDim + "Axis", e.axisIndex), i = e.value, a = t.axis, d = a.scale.parse(i);
					if (t && i != null) {
						var f = XP(i, a, n, e.seriesDataIndices, e.valueLabelOpt), p = bb("section", {
							header: f,
							noHeader: !Ct(f),
							sortBlocks: !0,
							blocks: []
						});
						c.blocks.push(p), z(e.seriesDataIndices, function(i) {
							var a = n.getSeriesByIndex(i.seriesIndex), c = i.dataIndexInside, m = a.getDataParams(c);
							if (!(m.dataIndex < 0)) {
								m.axisDim = e.axisDim, m.axisIndex = e.axisIndex, m.axisType = e.axisType, m.axisId = e.axisId, m.axisValue = TC(t.axis, { value: d }), m.axisValueLabel = f, m.marker = u.makeTooltipMarker("item", gy(m.color), o);
								var h = Gy(a.formatTooltip(c, !0, null)), g = h.frag;
								if (g) {
									var _ = gI([a], r).get("valueFormatter");
									p.blocks.push(_ ? L({ valueFormatter: _ }, g) : g);
								}
								h.text && l.push(h.text), s.push(m);
							}
						});
					}
				});
			}), c.blocks.reverse(), l.reverse();
			var d = t.position, f = Eb(c, u, o, a.get("order"), n.get("useUTC"), a.get("textStyle"));
			f && l.unshift(f);
			var p = o === "richText" ? "\n\n" : "<br/>", m = l.join(p);
			this._showOrMove(a, function() {
				this._updateContentNotChangedOnAxis(e, s) ? this._updatePosition(a, d, i[0], i[1], this._tooltipContent, s) : this._showTooltipContent(a, m, s, Math.random() + "", i[0], i[1], d, null, u);
			});
		}, t.prototype._showSeriesItemTooltip = function(e, t, n) {
			var r = this._ecModel, i = Tu(t), a = i.seriesIndex, o = r.getSeriesByIndex(a), s = i.dataModel || o, c = i.dataIndex, l = i.dataType, u = s.getData(l), d = this._renderMode, f = e.positionDefault, p = gI([
				u.getItemModel(c),
				s,
				o && (o.coordinateSystem || {}).model
			], this._tooltipModel, f ? { position: f } : null), m = p.get("trigger");
			if (m == null || m === "item") {
				var h = s.getDataParams(c, l), g = new Rb();
				h.marker = g.makeTooltipMarker("item", gy(h.color), d);
				var _ = Gy(s.formatTooltip(c, !1, l)), v = p.get("order"), y = p.get("valueFormatter"), b = _.frag, x = b ? Eb(y ? L({ valueFormatter: y }, b) : b, g, d, v, r.get("useUTC"), p.get("textStyle")) : _.text, S = "item_" + s.name + "_" + c;
				this._showOrMove(p, function() {
					this._showTooltipContent(p, x, h, S, e.offsetX, e.offsetY, e.position, e.target, g);
				}), n({
					type: "showTip",
					dataIndexInside: c,
					dataIndex: u.getRawIndex(c),
					seriesIndex: a,
					from: this.uid
				});
			}
		}, t.prototype._showComponentItemTooltip = function(e, t, n) {
			var r = this._renderMode === "html", i = Tu(t), a = i.tooltipConfig.option || {}, o = a.encodeHTMLContent;
			if (U(a)) {
				var s = a;
				a = {
					content: s,
					formatter: s
				}, o = !0;
			}
			o && r && a.content && (a = I(a), a.content = tv(a.content));
			var c = [a], l = this._ecModel.getComponent(i.componentMainType, i.componentIndex);
			l && c.push(l), c.push({ formatter: a.content });
			var u = e.positionDefault, d = gI(c, this._tooltipModel, u ? { position: u } : null), f = d.get("content"), p = Math.random() + "", m = new Rb();
			this._showOrMove(d, function() {
				var n = I(d.get("formatterParams") || {});
				this._showTooltipContent(d, f, n, p, e.offsetX, e.offsetY, e.position, t, m);
			}), n({
				type: "showTip",
				from: this.uid
			});
		}, t.prototype._showTooltipContent = function(e, t, n, r, i, a, o, s, c) {
			if (this._ticket = "", e.get("showContent") && e.get("show")) {
				var l = this._tooltipContent;
				l.setEnterable(e.get("enterable"));
				var u = e.get("formatter");
				o ||= e.get("position");
				var d = t, f = this._getNearestPoint([i, a], n, e.get("trigger"), e.get("borderColor"), e.get("defaultBorderColor", !0)).color;
				if (u) {
					if (U(u)) {
						var p = e.ecModel.get("useUTC"), m = V(n) ? n[0] : n, h = m && m.axisType && m.axisType.indexOf("time") >= 0;
						d = u, h && (d = Pv(m.axisValue, d, p)), d = my(d, n, !0);
					} else if (H(u)) {
						var g = Gt(function(t, r) {
							t === this._ticket && (l.setContent(r, c, e, f, o), this._updatePosition(e, o, i, a, l, n, s));
						}, this);
						this._ticket = r, d = u(n, r, g);
					} else d = u;
				}
				l.setContent(d, c, e, f, o), l.show(e, f), this._updatePosition(e, o, i, a, l, n, s);
			}
		}, t.prototype._getNearestPoint = function(e, t, n, r, i) {
			if (n === "axis" || V(t)) return { color: r || i };
			if (!V(t)) return { color: r || t.color || t.borderColor };
		}, t.prototype._updatePosition = function(e, t, n, r, i, a, o) {
			var s = this._api.getWidth(), c = this._api.getHeight();
			t ||= e.get("position");
			var l = i.getSize(), u = e.get("align"), d = e.get("verticalAlign"), f = o && o.getBoundingRect().clone();
			if (o && f.applyTransform(o.transform), H(t) && (t = t([n, r], a, i.el, f, {
				viewSize: [s, c],
				contentSize: l.slice()
			})), V(t)) n = yl(t[0], s), r = yl(t[1], c);
			else if (W(t)) {
				var p = t;
				p.width = l[0], p.height = l[1];
				var m = Cy(p, {
					width: s,
					height: c
				});
				n = m.x, r = m.y, u = null, d = null;
			} else if (U(t) && o) {
				var h = bI(t, f, l, e.get("borderWidth"));
				n = h[0], r = h[1];
			} else {
				var h = vI(n, r, i, s, c, u ? null : 20, d ? null : 20);
				n = h[0], r = h[1];
			}
			if (u && (n -= xI(u) ? l[0] / 2 : u === "right" ? l[0] : 0), d && (r -= xI(d) ? l[1] / 2 : d === "bottom" ? l[1] : 0), KF(e)) {
				var h = yI(n, r, i, s, c);
				n = h[0], r = h[1];
			}
			i.moveTo(n, r);
		}, t.prototype._updateContentNotChangedOnAxis = function(e, t) {
			var n = this._lastDataByCoordSys, r = this._cbParamsList, i = !!n && n.length === e.length;
			return i && z(n, function(n, a) {
				var o = n.dataByAxis || [], s = (e[a] || {}).dataByAxis || [];
				i &&= o.length === s.length, i && z(o, function(e, n) {
					var a = s[n] || {}, o = e.seriesDataIndices || [], c = a.seriesDataIndices || [];
					i = i && e.value === a.value && e.axisType === a.axisType && e.axisId === a.axisId && o.length === c.length, i && z(o, function(e, t) {
						var n = c[t];
						i = i && e.seriesIndex === n.seriesIndex && e.dataIndex === n.dataIndex;
					}), r && z(e.seriesDataIndices, function(e) {
						var n = e.seriesIndex, a = t[n], o = r[n];
						a && o && o.data !== a.data && (i = !1);
					});
				});
			}), this._lastDataByCoordSys = e, this._cbParamsList = t, !!i;
		}, t.prototype._hide = function(e) {
			this._lastDataByCoordSys = null, this._cbParamsList = null, e({
				type: "hideTip",
				from: this.uid
			});
		}, t.prototype.dispose = function(e, t) {
			!J.node && t.getDom() && (BE(this, "_updatePosition"), this._tooltipContent.dispose(), _F("itemTooltip", t), this._tooltipContent = null, this._tooltipModel = null, this._lastDataByCoordSys = null, this._cbParamsList = null);
		}, t.type = "tooltip", t;
	}(Dk);
}));
//#endregion
//#region node_modules/echarts/lib/component/tooltip/install.js
function EI(e) {
	uN(RF), e.registerComponentModel(WF), e.registerComponentView(wI), e.registerAction({
		type: "showTip",
		event: "showTip",
		update: "tooltip:manuallyShowTip"
	}, jt), e.registerAction({
		type: "hideTip",
		event: "hideTip",
		update: "tooltip:manuallyHideTip"
	}, jt);
}
var DI = M((() => {
	zF(), pN(), GF(), TI(), q();
})), OI, kI, AI = M((() => {
	F(), q(), Ch(), Z(), Ry(), _b(), OI = function(e, t) {
		if (t === "all") return {
			type: "all",
			title: e.getLocaleModel().get([
				"legend",
				"selector",
				"all"
			])
		};
		if (t === "inverse") return {
			type: "inverse",
			title: e.getLocaleModel().get([
				"legend",
				"selector",
				"inverse"
			])
		};
	}, kI = function(e) {
		P(t, e);
		function t() {
			var n = e !== null && e.apply(this, arguments) || this;
			return n.type = t.type, n.layoutMode = {
				type: "box",
				ignoreSize: !0
			}, n;
		}
		return t.prototype.init = function(e, t, n) {
			this.mergeDefaultAndTheme(e, n), e.selected = e.selected || {}, this._updateSelector(e);
		}, t.prototype.mergeOption = function(t, n) {
			e.prototype.mergeOption.call(this, t, n), this._updateSelector(t);
		}, t.prototype._updateSelector = function(e) {
			var t = e.selector, n = this.ecModel;
			t === !0 && (t = e.selector = ["all", "inverse"]), V(t) && z(t, function(e, r) {
				U(e) && (e = { type: e }), t[r] = Qe(e, OI(n, e.type));
			});
		}, t.prototype.optionUpdated = function() {
			this._updateData(this.ecModel);
			var e = this._data;
			if (e[0] && this.get("selectedMode") === "single") {
				for (var t = !1, n = 0; n < e.length; n++) {
					var r = e[n].get("name");
					if (this.isSelected(r)) {
						this.select(r), t = !0;
						break;
					}
				}
				!t && this.select(e[0].get("name"));
			}
		}, t.prototype._updateData = function(e) {
			var t = [], n = [];
			e.eachRawSeries(function(r) {
				var i = r.name;
				n.push(i);
				var a;
				if (r.legendVisualProvider) {
					var o = r.legendVisualProvider.getAllNames();
					e.isSeriesFiltered(r) || (n = n.concat(o)), o.length ? t = t.concat(o) : a = !0;
				} else a = !0;
				a && Wl(r) && t.push(r.name);
			}), this._availableNames = n;
			var r = this.get("data") || t, i = K(), a = B(r, function(e) {
				return (U(e) || dt(e)) && (e = { name: e }), i.get(e.name) ? null : (i.set(e.name, !0), new Sh(e, this, this.ecModel));
			}, this);
			this._data = at(a, function(e) {
				return !!e;
			});
		}, t.prototype.getData = function() {
			return this._data;
		}, t.prototype.select = function(e) {
			var t = this.option.selected;
			if (this.get("selectedMode") === "single") {
				var n = this._data;
				z(n, function(e) {
					t[e.get("name")] = !1;
				});
			}
			t[e] = !0;
		}, t.prototype.unSelect = function(e) {
			this.get("selectedMode") !== "single" && (this.option.selected[e] = !1);
		}, t.prototype.toggleSelected = function(e) {
			var t = this.option.selected;
			t.hasOwnProperty(e) || (t[e] = !0), this[t[e] ? "unSelect" : "select"](e);
		}, t.prototype.allSelect = function() {
			var e = this._data, t = this.option.selected;
			z(e, function(e) {
				t[e.get("name", !0)] = !0;
			});
		}, t.prototype.inverseSelect = function() {
			var e = this._data, t = this.option.selected;
			z(e, function(e) {
				var n = e.get("name", !0);
				t.hasOwnProperty(n) || (t[n] = !0), t[n] = !t[n];
			});
		}, t.prototype.isSelected = function(e) {
			var t = this.option.selected;
			return !(t.hasOwnProperty(e) && !t[e]) && R(this._availableNames, e) >= 0;
		}, t.prototype.getOrient = function() {
			return this.get("orient") === "vertical" ? {
				index: 1,
				name: "vertical"
			} : {
				index: 0,
				name: "horizontal"
			};
		}, t.type = "legend.plain", t.dependencies = ["series"], t.defaultOption = {
			z: 4,
			show: !0,
			orient: "horizontal",
			left: "center",
			bottom: Q.size.m,
			align: "auto",
			backgroundColor: Q.color.transparent,
			borderColor: Q.color.border,
			borderRadius: 0,
			borderWidth: 0,
			padding: 5,
			itemGap: 8,
			itemWidth: 25,
			itemHeight: 14,
			symbolRotate: "inherit",
			symbolKeepAspect: !0,
			inactiveColor: Q.color.disabled,
			inactiveBorderColor: Q.color.disabled,
			inactiveBorderWidth: "auto",
			itemStyle: {
				color: "inherit",
				opacity: "inherit",
				borderColor: "inherit",
				borderWidth: "auto",
				borderCap: "inherit",
				borderJoin: "inherit",
				borderDashOffset: "inherit",
				borderMiterLimit: "inherit"
			},
			lineStyle: {
				width: "auto",
				color: "inherit",
				inactiveColor: Q.color.disabled,
				inactiveWidth: 2,
				opacity: "inherit",
				type: "inherit",
				cap: "inherit",
				join: "inherit",
				dashOffset: "inherit",
				miterLimit: "inherit"
			},
			textStyle: { color: Q.color.secondary },
			selectedMode: !0,
			selector: !1,
			selectorLabel: {
				show: !0,
				borderRadius: 10,
				padding: [
					3,
					5,
					3,
					5
				],
				fontSize: 12,
				fontFamily: "sans-serif",
				color: Q.color.tertiary,
				borderWidth: 1,
				borderColor: Q.color.border
			},
			emphasis: { selectorLabel: {
				show: !0,
				color: Q.color.quaternary
			} },
			selectorPosition: "auto",
			selectorItemGap: 7,
			selectorButtonGap: 10,
			tooltip: { show: !1 },
			triggerEvent: !1
		}, t;
	}(Ly);
}));
//#endregion
//#region node_modules/echarts/lib/component/legend/LegendView.js
function jI(e, t, n, r, i, a, o) {
	function s(e, t) {
		e.lineWidth === "auto" && (e.lineWidth = t.lineWidth > 0 ? 2 : 0), LI(e, function(n, r) {
			e[r] === "inherit" && (e[r] = t[r]);
		});
	}
	var c = t.getModel("itemStyle"), l = c.getItemStyle(), u = e.lastIndexOf("empty", 0) === 0 ? "fill" : "stroke", d = c.getShallow("decal");
	l.decal = !d || d === "inherit" ? r.decal : bj(d, o), l.fill === "inherit" && (l.fill = r[i]), l.stroke === "inherit" && (l.stroke = r[u]), l.opacity === "inherit" && (l.opacity = (i === "fill" ? r : n).opacity), s(l, r);
	var f = t.getModel("lineStyle"), p = f.getLineStyle();
	if (s(p, n), l.fill === "auto" && (l.fill = r.fill), l.stroke === "auto" && (l.stroke = r.fill), p.stroke === "auto" && (p.stroke = r.fill), !a) {
		var m = t.get("inactiveBorderWidth"), h = l[u];
		l.lineWidth = m === "auto" ? r.lineWidth > 0 && h ? 2 : 0 : l.lineWidth, l.fill = t.get("inactiveColor"), l.stroke = t.get("inactiveBorderColor"), p.stroke = f.get("inactiveColor"), p.lineWidth = f.get("inactiveWidth");
	}
	return {
		itemStyle: l,
		lineStyle: p
	};
}
function MI(e) {
	var t = e.icon || "roundRect", n = nx(t, 0, 0, e.itemWidth, e.itemHeight, e.itemStyle.fill, e.symbolKeepAspect);
	return n.setStyle(e.itemStyle), n.rotation = (e.iconRotate || 0) * Math.PI / 180, n.setOrigin([e.itemWidth / 2, e.itemHeight / 2]), t.indexOf("empty") > -1 && (n.style.stroke = n.style.fill, n.style.fill = Q.color.neutral00, n.style.lineWidth = 2), n;
}
function NI(e, t, n, r) {
	FI(e, t, n, r), n.dispatchAction({
		type: "legendToggleSelect",
		name: e ?? t
	}), PI(e, t, n, r);
}
function PI(e, t, n, r) {
	n.usingTHL() || n.dispatchAction({
		type: "highlight",
		seriesName: e,
		name: t,
		excludeSeriesId: r
	});
}
function FI(e, t, n, r) {
	n.usingTHL() || n.dispatchAction({
		type: "downplay",
		seriesName: e,
		name: t,
		excludeSeriesId: r
	});
}
var II, LI, RI, zI, BI = M((() => {
	F(), q(), Ea(), Gm(), Jd(), ch(), UF(), Py(), Ok(), px(), kj(), Du(), _b(), II = lt, LI = z, RI = bf, zI = function(e) {
		P(t, e);
		function t() {
			var n = e !== null && e.apply(this, arguments) || this;
			return n.type = t.type, n.newlineDisabled = !1, n;
		}
		return t.prototype.init = function() {
			this.group.add(this._contentGroup = new RI()), this.group.add(this._selectorGroup = new RI()), this._isFirstRender = !0;
		}, t.prototype.getContentGroup = function() {
			return this._contentGroup;
		}, t.prototype.getSelectorGroup = function() {
			return this._selectorGroup;
		}, t.prototype.render = function(e, t, n) {
			var r = this._isFirstRender;
			if (this._isFirstRender = !1, this.resetInner(), e.get("show", !0)) {
				var i = e.get("align"), a = e.get("orient");
				(!i || i === "auto") && (i = e.get("left") === "right" && a === "vertical" ? "right" : "left");
				var o = e.get("selector", !0), s = e.get("selectorPosition", !0);
				o && (!s || s === "auto") && (s = a === "horizontal" ? "end" : "start"), this.renderInner(i, e, t, n, o, a, s);
				var c = wy(e, n).refContainer, l = e.getBoxLayoutParams(), u = e.get("padding"), d = Cy(l, c, u), f = this.layoutInner(e, i, d, r, o, s), p = Cy(et({
					width: f.width,
					height: f.height
				}, l), c, u);
				this.group.x = p.x - f.x, this.group.y = p.y - f.y, this.group.markRedraw(), this.group.add(this._backgroundEl = HF(f, e));
			}
		}, t.prototype.resetInner = function() {
			this.getContentGroup().removeAll(), this._backgroundEl && this.group.remove(this._backgroundEl), this.getSelectorGroup().removeAll();
		}, t.prototype.renderInner = function(e, t, n, r, i, a, o) {
			var s = this.getContentGroup(), c = K(), l = t.get("selectedMode"), u = t.get("triggerEvent"), d = [];
			n.eachRawSeries(function(e) {
				!e.get("legendHoverLink") && d.push(e.id);
			}), LI(t.getData(), function(i, a) {
				var o = this, f = i.get("name");
				if (!this.newlineDisabled && (f === "" || f === "\n")) {
					var p = new RI();
					p.newline = !0, s.add(p);
					return;
				}
				var m = n.getSeriesByName(f)[0];
				if (!c.get(f)) {
					if (m) {
						var h = m.getData(), g = h.getVisual("legendLineStyle") || {}, _ = h.getVisual("legendIcon"), v = h.getVisual("style"), y = this._createItem(m, f, a, i, t, e, g, v, _, l, r);
						y.on("click", II(NI, f, null, r, d)).on("mouseover", II(PI, m.name, null, r, d)).on("mouseout", II(FI, m.name, null, r, d)), n.ssr && y.eachChild(function(e) {
							var t = Tu(e);
							t.seriesIndex = m.seriesIndex, t.dataIndex = a, t.ssrType = "legend";
						}), u && y.eachChild(function(e) {
							o.packEventData(e, t, m, a, f);
						}), c.set(f, !0);
					} else n.eachRawSeries(function(o) {
						var s = this;
						if (!c.get(f) && o.legendVisualProvider) {
							var p = o.legendVisualProvider;
							if (!p.containName(f)) return;
							var m = p.indexOfName(f), h = p.getItemVisual(m, "style"), g = p.getItemVisual(m, "legendIcon"), _ = pa(h.fill);
							_ && _[3] === 0 && (_[3] = .2, h = L(L({}, h), { fill: ya(_, "rgba") }));
							var v = this._createItem(o, f, a, i, t, e, {}, h, g, l, r);
							v.on("click", II(NI, null, f, r, d)).on("mouseover", II(PI, null, f, r, d)).on("mouseout", II(FI, null, f, r, d)), n.ssr && v.eachChild(function(e) {
								var t = Tu(e);
								t.seriesIndex = o.seriesIndex, t.dataIndex = a, t.ssrType = "legend";
							}), u && v.eachChild(function(e) {
								s.packEventData(e, t, o, a, f);
							}), c.set(f, !0);
						}
					}, this);
				}
			}, this), i && this._createSelector(i, t, r, a, o);
		}, t.prototype.packEventData = function(e, t, n, r, i) {
			var a = {
				componentType: "legend",
				componentIndex: t.componentIndex,
				dataIndex: r,
				value: i,
				seriesIndex: n.seriesIndex
			};
			Tu(e).eventData = a;
		}, t.prototype._createSelector = function(e, t, n, r, i) {
			var a = this.getSelectorGroup();
			LI(e, function(e) {
				var r = e.type, i = new Mc({
					style: {
						x: 0,
						y: 0,
						align: "center",
						verticalAlign: "middle"
					},
					onclick: function() {
						n.dispatchAction({
							type: r === "all" ? "legendAllSelect" : "legendInverseSelect",
							legendId: t.id
						});
					}
				});
				a.add(i), Jm(i, {
					normal: t.getModel("selectorLabel"),
					emphasis: t.getModel(["emphasis", "selectorLabel"])
				}, { defaultText: e.title }), Cd(i);
			});
		}, t.prototype._createItem = function(e, t, n, r, i, a, o, s, c, l, u) {
			var d = e.visualDrawType, f = i.get("itemWidth"), p = i.get("itemHeight"), m = i.isSelected(t), h = r.get("symbolRotate"), g = r.get("symbolKeepAspect"), _ = r.get("icon");
			c = _ || c || "roundRect";
			var v = jI(c, r, o, s, d, m, u), y = new RI(), b = r.getModel("textStyle");
			if (H(e.getLegendIcon) && (!_ || _ === "inherit")) y.add(e.getLegendIcon({
				itemWidth: f,
				itemHeight: p,
				icon: c,
				iconRotate: h,
				itemStyle: v.itemStyle,
				lineStyle: v.lineStyle,
				symbolKeepAspect: g
			}));
			else {
				var x = _ === "inherit" && e.getData().getVisual("symbol") ? h === "inherit" ? e.getData().getVisual("symbolRotate") : h : 0;
				y.add(MI({
					itemWidth: f,
					itemHeight: p,
					icon: c,
					iconRotate: x,
					itemStyle: v.itemStyle,
					lineStyle: v.lineStyle,
					symbolKeepAspect: g
				}));
			}
			var S = a === "left" ? f + 5 : -5, C = a, w = i.get("formatter"), T = t;
			U(w) && w ? T = w.replace("{name}", t ?? "") : H(w) && (T = w(t));
			var E = m ? b.getTextColor() : r.get("inactiveColor");
			y.add(new Mc({ style: Xm(b, {
				text: T,
				x: S,
				y: p / 2,
				fill: E,
				align: C,
				verticalAlign: "middle"
			}, { inheritColor: E }) }));
			var D = new gc({
				shape: y.getBoundingRect(),
				style: { fill: "transparent" }
			}), O = r.getModel("tooltip");
			return O.get("show") && Cm({
				el: D,
				componentModel: i,
				itemName: t,
				itemTooltipOption: O.option
			}), y.add(D), y.eachChild(function(e) {
				e.silent = !0;
			}), D.silent = !l, this.getContentGroup().add(y), Cd(y), y.__legendDataIndex = n, y;
		}, t.prototype.layoutInner = function(e, t, n, r, i, a) {
			var o = this.getContentGroup(), s = this.getSelectorGroup();
			My(e.get("orient"), o, e.get("itemGap"), n.width, n.height);
			var c = o.getBoundingRect(), l = [-c.x, -c.y];
			if (s.markRedraw(), o.markRedraw(), i) {
				My("horizontal", s, e.get("selectorItemGap", !0));
				var u = s.getBoundingRect(), d = [-u.x, -u.y], f = e.get("selectorButtonGap", !0), p = e.getOrient().index, m = p === 0 ? "width" : "height", h = p === 0 ? "height" : "width", g = p === 0 ? "y" : "x";
				a === "end" ? d[p] += c[m] + f : l[p] += u[m] + f, d[1 - p] += c[h] / 2 - u[h] / 2, s.x = d[0], s.y = d[1], o.x = l[0], o.y = l[1];
				var _ = {
					x: 0,
					y: 0
				};
				return _[m] = c[m] + f + u[m], _[h] = Math.max(c[h], u[h]), _[g] = Math.min(0, u[g] + d[1 - p]), _;
			}
			return o.x = l[0], o.y = l[1], this.group.getBoundingRect();
		}, t.prototype.remove = function() {
			this.getContentGroup().removeAll(), this._isFirstRender = !0;
		}, t.type = "legend.plain", t;
	}(Dk);
}));
//#endregion
//#region node_modules/echarts/lib/component/legend/legendAction.js
function VI(e, t, n) {
	var r = e === "allSelect" || e === "inverseSelect", i = {}, a = [];
	n.eachComponent({
		mainType: "legend",
		query: t
	}, function(n) {
		r ? n[e]() : n[e](t.name), HI(n, i), a.push(n.componentIndex);
	});
	var o = {};
	return n.eachComponent("legend", function(e) {
		z(i, function(t, n) {
			e[t ? "select" : "unSelect"](n);
		}), HI(e, o);
	}), r ? {
		selected: o,
		legendIndex: a
	} : {
		name: t.name,
		selected: o
	};
}
function HI(e, t) {
	var n = t || {};
	return z(e.getData(), function(t) {
		var r = t.get("name");
		if (r !== "\n" && r !== "") {
			var i = e.isSelected(r);
			n[r] = At(n, r) ? n[r] && i : i;
		}
	}), n;
}
function UI(e) {
	e.registerAction("legendToggleSelect", "legendselectchanged", lt(VI, "toggleSelected")), e.registerAction("legendAllSelect", "legendselectall", lt(VI, "allSelect")), e.registerAction("legendInverseSelect", "legendinverseselect", lt(VI, "inverseSelect")), e.registerAction("legendSelect", "legendselected", lt(VI, "select")), e.registerAction("legendUnSelect", "legendunselected", lt(VI, "unSelect"));
}
var WI = M((() => {
	q();
}));
//#endregion
//#region node_modules/echarts/lib/component/legend/legendFilter.js
function GI(e) {
	var t = e.findComponents({ mainType: "legend" });
	t && t.length && e.filterSeries(function(e) {
		for (var n = 0; n < t.length; n++) if (!t[n].isSelected(e.name)) return !1;
		return !0;
	});
}
var KI, qI = M((() => {
	Z(), KI = vu(GI);
}));
//#endregion
//#region node_modules/echarts/lib/component/legend/installLegendPlain.js
function JI(e) {
	e.registerComponentModel(kI), e.registerComponentView(zI), e.registerProcessor(e.PRIORITY.PROCESSOR.SERIES_FILTER, KI), e.registerSubTypeDefaulter("legend", function() {
		return "plain";
	}), UI(e);
}
var YI = M((() => {
	AI(), BI(), WI(), qI();
}));
//#endregion
//#region node_modules/echarts/lib/component/legend/ScrollableLegendModel.js
function XI(e, t, n) {
	var r = e.getOrient(), i = [1, 1];
	i[r.index] = 0, Ey(t, n, {
		type: "box",
		ignoreSize: !!i
	});
}
var ZI, QI = M((() => {
	F(), AI(), Py(), W_(), _b(), ZI = function(e) {
		P(t, e);
		function t() {
			var n = e !== null && e.apply(this, arguments) || this;
			return n.type = t.type, n;
		}
		return t.prototype.setScrollDataIndex = function(e) {
			this.option.scrollDataIndex = e;
		}, t.prototype.init = function(t, n, r) {
			var i = Dy(t);
			e.prototype.init.call(this, t, n, r), XI(this, t, i);
		}, t.prototype.mergeOption = function(t, n) {
			e.prototype.mergeOption.call(this, t, n), XI(this, this.option, t);
		}, t.type = "legend.scroll", t.defaultOption = H_(kI.defaultOption, {
			scrollDataIndex: 0,
			pageButtonItemGap: 5,
			pageButtonGap: null,
			pageButtonPosition: "end",
			pageFormatter: "{current}/{total}",
			pageIcons: {
				horizontal: ["M0,0L12,-10L12,10z", "M0,0L-12,-10L-12,10z"],
				vertical: ["M0,0L20,0L10,-20z", "M0,0L20,0L10,20z"]
			},
			pageIconColor: Q.color.accent50,
			pageIconInactiveColor: Q.color.accent10,
			pageIconSize: 15,
			pageTextStyle: { color: Q.color.tertiary },
			animationDurationUpdate: 800
		}), t;
	}(kI);
})), $I, eL, tL, nL, rL = M((() => {
	F(), q(), Gm(), Py(), BI(), $I = bf, eL = ["width", "height"], tL = ["x", "y"], nL = function(e) {
		P(t, e);
		function t() {
			var n = e !== null && e.apply(this, arguments) || this;
			return n.type = t.type, n.newlineDisabled = !0, n._currentIndex = 0, n;
		}
		return t.prototype.init = function() {
			e.prototype.init.call(this), this.group.add(this._containerGroup = new $I()), this._containerGroup.add(this.getContentGroup()), this.group.add(this._controllerGroup = new $I());
		}, t.prototype.resetInner = function() {
			e.prototype.resetInner.call(this), this._controllerGroup.removeAll(), this._containerGroup.removeClipPath(), this._containerGroup.__rectSize = null;
		}, t.prototype.renderInner = function(t, n, r, i, a, o, s) {
			var c = this;
			e.prototype.renderInner.call(this, t, n, r, i, a, o, s);
			var l = this._controllerGroup, u = n.get("pageIconSize", !0), d = V(u) ? u : [u, u];
			p("pagePrev", 0);
			var f = n.getModel("pageTextStyle");
			l.add(new Mc({
				name: "pageText",
				style: {
					text: "xx/xx",
					fill: f.getTextColor(),
					font: f.getFont(),
					verticalAlign: "middle",
					align: "center"
				},
				silent: !0
			})), p("pageNext", 1);
			function p(e, t) {
				var r = e + "DataIndex", a = gm(n.get("pageIcons", !0)[n.getOrient().name][t], { onclick: Gt(c._pageGo, c, r, n, i) }, {
					x: -d[0] / 2,
					y: -d[1] / 2,
					width: d[0],
					height: d[1]
				});
				a.name = e, l.add(a);
			}
		}, t.prototype.layoutInner = function(e, t, n, r, i, a) {
			var o = this.getSelectorGroup(), s = e.getOrient().index, c = eL[s], l = tL[s], u = eL[1 - s], d = tL[1 - s];
			i && My("horizontal", o, e.get("selectorItemGap", !0));
			var f = e.get("selectorButtonGap", !0), p = o.getBoundingRect(), m = [-p.x, -p.y], h = I(n);
			i && (h[c] = n[c] - p[c] - f);
			var g = this._layoutContentAndController(e, r, h, s, c, u, d, l);
			if (i) {
				if (a === "end") m[s] += g[c] + f;
				else {
					var _ = p[c] + f;
					m[s] -= _, g[l] -= _;
				}
				g[c] += p[c] + f, m[1 - s] += g[d] + g[u] / 2 - p[u] / 2, g[u] = Math.max(g[u], p[u]), g[d] = Math.min(g[d], p[d] + m[1 - s]), o.x = m[0], o.y = m[1], o.markRedraw();
			}
			return g;
		}, t.prototype._layoutContentAndController = function(e, t, n, r, i, a, o, s) {
			var c = this.getContentGroup(), l = this._containerGroup, u = this._controllerGroup;
			My(e.get("orient"), c, e.get("itemGap"), r ? n.width : null, r ? null : n.height), My("horizontal", u, e.get("pageButtonItemGap", !0));
			var d = c.getBoundingRect(), f = u.getBoundingRect(), p = this._showController = d[i] > n[i], m = [-d.x, -d.y];
			t || (m[r] = c[s]);
			var h = [0, 0], g = [-f.x, -f.y], _ = G(e.get("pageButtonGap", !0), e.get("itemGap", !0));
			p && (e.get("pageButtonPosition", !0) === "end" ? g[r] += n[i] - f[i] : h[r] += f[i] + _), g[1 - r] += d[a] / 2 - f[a] / 2, c.setPosition(m), l.setPosition(h), u.setPosition(g);
			var v = {
				x: 0,
				y: 0
			};
			if (v[i] = p ? n[i] : d[i], v[a] = Math.max(d[a], f[a]), v[o] = Math.min(0, f[o] + g[1 - r]), l.__rectSize = n[i], p) {
				var y = {
					x: 0,
					y: 0
				};
				y[i] = Math.max(n[i] - f[i] - _, 0), y[a] = v[a], l.setClipPath(new gc({ shape: y })), l.__rectSize = y[i];
			} else u.eachChild(function(e) {
				e.attr({
					invisible: !0,
					silent: !0
				});
			});
			var b = this._getPageInfo(e);
			return b.pageIndex != null && Hp(c, {
				x: b.contentPosition[0],
				y: b.contentPosition[1]
			}, p ? e : null), this._updatePageInfoView(e, b), v;
		}, t.prototype._pageGo = function(e, t, n) {
			var r = this._getPageInfo(t)[e];
			r != null && n.dispatchAction({
				type: "legendScroll",
				scrollDataIndex: r,
				legendId: t.id
			});
		}, t.prototype._updatePageInfoView = function(e, t) {
			var n = this._controllerGroup;
			z(["pagePrev", "pageNext"], function(r) {
				var i = t[r + "DataIndex"] != null, a = n.childOfName(r);
				a && (a.setStyle("fill", i ? e.get("pageIconColor", !0) : e.get("pageIconInactiveColor", !0)), a.cursor = i ? "pointer" : "default");
			});
			var r = n.childOfName("pageText"), i = e.get("pageFormatter"), a = t.pageIndex, o = a == null ? 0 : a + 1, s = t.pageCount;
			r && i && r.setStyle("text", U(i) ? i.replace("{current}", o == null ? "" : o + "").replace("{total}", s == null ? "" : s + "") : i({
				current: o,
				total: s
			}));
		}, t.prototype._getPageInfo = function(e) {
			var t = e.get("scrollDataIndex", !0), n = this.getContentGroup(), r = this._containerGroup.__rectSize, i = e.getOrient().index, a = eL[i], o = tL[i], s = this._findTargetItemIndex(t), c = n.children(), l = c[s], u = c.length, d = +!!u, f = {
				contentPosition: [n.x, n.y],
				pageCount: d,
				pageIndex: d - 1,
				pagePrevDataIndex: null,
				pageNextDataIndex: null
			};
			if (!l) return f;
			var p = v(l);
			f.contentPosition[i] = -p.s;
			for (var m = s + 1, h = p, g = p, _ = null; m <= u; ++m) _ = v(c[m]), (!_ && g.e > h.s + r || _ && !y(_, h.s)) && (h = g.i > h.i ? g : _, h && (f.pageNextDataIndex ??= h.i, ++f.pageCount)), g = _;
			for (var m = s - 1, h = p, g = p, _ = null; m >= -1; --m) _ = v(c[m]), (!_ || !y(g, _.s)) && h.i < g.i && (g = h, f.pagePrevDataIndex ??= h.i, ++f.pageCount, ++f.pageIndex), h = _;
			return f;
			function v(e) {
				if (e) {
					var t = e.getBoundingRect(), n = t[o] + e[o];
					return {
						s: n,
						e: n + t[a],
						i: e.__legendDataIndex
					};
				}
			}
			function y(e, t) {
				return e.e >= t && e.s <= t + r;
			}
		}, t.prototype._findTargetItemIndex = function(e) {
			if (!this._showController) return 0;
			var t, n = this.getContentGroup(), r;
			return n.eachChild(function(n, i) {
				var a = n.__legendDataIndex;
				r == null && a != null && (r = i), a === e && (t = i);
			}), t ?? r;
		}, t.type = "legend.scroll", t;
	}(zI);
}));
//#endregion
//#region node_modules/echarts/lib/component/legend/scrollableLegendAction.js
function iL(e) {
	e.registerAction("legendScroll", "legendscroll", function(e, t) {
		var n = e.scrollDataIndex;
		n != null && t.eachComponent({
			mainType: "legend",
			subType: "scroll",
			query: e
		}, function(e) {
			e.setScrollDataIndex(n);
		});
	});
}
var aL = M((() => {}));
//#endregion
//#region node_modules/echarts/lib/component/legend/installLegendScroll.js
function oL(e) {
	uN(JI), e.registerComponentModel(ZI), e.registerComponentView(nL), iL(e);
}
var sL = M((() => {
	pN(), YI(), QI(), rL(), aL();
}));
//#endregion
//#region node_modules/echarts/lib/component/legend/install.js
function cL(e) {
	uN(JI), uN(oL);
}
var lL = M((() => {
	pN(), YI(), sL();
})), uL = M((() => {
	PP(), VF(), F(), pN(), bP(), KP(), Gm(), rF(), lE(), zF(), Ry(), DN(), q(), hN(), Z(), oT(), Hr(), X(), LC(), Py(), UN(), ME(), Xw(), ch(), Ch(), Du(), Ok(), M_(), tT(), Og(), Lx(), HS(), wN(), _b(), W_(), JS(), FN(), Dr(), Ci(), Bu(), rr(), xf(), oc(), wf(), _c(), Df(), lp(), np(), ap(), yf(), Cp(), Tp(), tc(), Ea(), Ns(), Ol(), p_(), l_(), ex(), Ih(), zb(), px(), S_(), Iu(), to(), cD(), lN(), Jd(), kj(), Ro(), wP(), DT(), WE(), _n(), Dh(), by(), xv(), ar(), gS(), WS(), pc(), $a(), Xp(), Lw(), UF(), Ic(), $t(), mE(), jO(), DI(), Jy(), Ox(), lL(), sL(), YI(), Wy(), mb();
})), dL = M((() => {
	uL();
})), fL = M((() => {
	WE(), pN(), Ye(), q(), F(), Dr(), rr(), Ns(), $t(), Ch(), oT(), yj();
})), pL = M((() => {
	lN(), fL();
})), mL = M((() => {
	pL();
}));
//#endregion
//#region node_modules/zrender/lib/canvas/Layer.js
function hL(e, t, n) {
	var r = Je.createCanvas(), i = t.getWidth(), a = t.getHeight(), o = r.style;
	return o && (o.position = "absolute", o.left = "0", o.top = "0", o.width = i + "px", o.height = a + "px", r.setAttribute("data-zr-dom-id", e)), r.width = i * n, r.height = a * n, r;
}
function gL(e) {
	return !e.__cursors.get(0);
}
function _L(e) {
	var t = e.__cursors.get(0);
	return {
		startIdx: t ? t.startIdx : 0,
		endIdx: t ? t.endIdx : 0
	};
}
var vL, yL = M((() => {
	F(), q(), co(), Ip(), to(), VA(), yj(), Dr(), lo(), Ye(), vL = function(e) {
		P(t, e);
		function t(t, n, r) {
			var i = e.call(this) || this;
			i.motionBlur = !1, i.lastFrameAlpha = .7, i.dpr = 1, i.virtual = !1, i.config = {}, i.zlevel = 0, i.zlevel2 = 0, i.maxRepaintRectCount = 5, i.__dirty = !0, i.__firstTimePaint = !0, i.__prevIdx = {
				startIdx: 0,
				endIdx: 0
			};
			var a;
			r ||= ro, typeof t == "string" ? a = hL(t, n, r) : W(t) && (a = t, t = a.id), i.id = t, i.dom = a;
			var o = a.style;
			return o && (kt(a), a.onselectstart = function() {
				return !1;
			}, o.padding = "0", o.margin = "0", o.borderWidth = "0"), i.painter = n, i.dpr = r, i;
		}
		return t.prototype.afterBrush = function() {
			this.__prevIdx = _L(this);
		}, t.prototype.initContext = function() {
			this.ctx = this.dom.getContext("2d"), this.ctx.dpr = this.dpr;
		}, t.prototype.setUnpainted = function() {
			this.__firstTimePaint = !0;
		}, t.prototype.createBackBuffer = function() {
			var e = this.dpr;
			this.domBack = hL("back-" + this.id, this.painter, e), this.ctxBack = this.domBack.getContext("2d"), e !== 1 && this.ctxBack.scale(e, e);
		}, t.prototype.createRepaintRects = function(e, t, n, r) {
			if (this.__firstTimePaint) return this.__firstTimePaint = !1, null;
			var i = [], a = this.maxRepaintRectCount, o = !1, s = new Y(0, 0, 0, 0);
			function c(e) {
				if (e.isFinite() && !e.isZero()) {
					if (i.length === 0) {
						var t = new Y(0, 0, 0, 0);
						t.copy(e), i.push(t);
					} else {
						for (var n = !1, r = Infinity, c = 0, l = 0; l < i.length; ++l) {
							var u = i[l];
							if (u.intersect(e)) {
								var d = new Y(0, 0, 0, 0);
								d.copy(u), d.union(e), i[l] = d, n = !0;
								break;
							}
							if (o) {
								s.copy(e), s.union(u);
								var f = e.width * e.height, p = u.width * u.height, m = s.width * s.height - f - p;
								m < r && (r = m, c = l);
							}
						}
						if (o && (i[c].union(e), n = !0), !n) {
							var t = new Y(0, 0, 0, 0);
							t.copy(e), i.push(t);
						}
						o ||= i.length >= a;
					}
				}
			}
			for (var l = _L(this), u = l.startIdx; u < l.endIdx; ++u) {
				var d = e[u];
				if (d) {
					var f = d.shouldBePainted(n, r, !0, !0), p = d.__isRendered && (d.__dirty & 1 || !f) ? d.getPrevPaintRect() : null;
					p && c(p);
					var m = f && (d.__dirty & 1 || !d.__isRendered) ? d.getPaintRect() : null;
					m && c(m);
				}
			}
			for (var h = this.__prevIdx, u = h.startIdx; u < h.endIdx; ++u) {
				var d = t[u], f = d && d.shouldBePainted(n, r, !0, !0);
				if (d && (!f || !d.__zr) && d.__isRendered) {
					var p = d.getPrevPaintRect();
					p && c(p);
				}
			}
			var g;
			do {
				g = !1;
				for (var u = 0; u < i.length;) {
					if (i[u].isZero()) {
						i.splice(u, 1);
						continue;
					}
					for (var _ = u + 1; _ < i.length;) i[u].intersect(i[_]) ? (g = !0, i[u].union(i[_]), i.splice(_, 1)) : _++;
					u++;
				}
			} while (g);
			return this._paintRects = i, i;
		}, t.prototype.debugGetPaintRects = function() {
			return (this._paintRects || []).slice();
		}, t.prototype.resize = function(e, t) {
			var n = this.dpr, r = this.dom, i = r.style, a = this.domBack;
			i && (i.width = e + "px", i.height = t + "px"), r.width = e * n, r.height = t * n, a && (a.width = e * n, a.height = t * n, n !== 1 && this.ctxBack.scale(n, n));
		}, t.prototype.clear = function(e, t, n) {
			var r = this.dom, i = this.ctx, a = r.width, o = r.height;
			t ||= this.clearColor;
			var s = this.motionBlur && !e, c = this.lastFrameAlpha, l = this.dpr, u = this;
			s && (this.domBack || this.createBackBuffer(), this.ctxBack.globalCompositeOperation = "copy", this.ctxBack.drawImage(r, 0, 0, a / l, o / l));
			var d = this.domBack;
			function f(e, n, r, a) {
				if (i.clearRect(e, n, r, a), t && t !== "transparent") {
					var o = void 0;
					ht(t) ? (o = (t.global || t.__width === r && t.__height === a) && t.__canvasGradient || LA(i, t, {
						x: 0,
						y: 0,
						width: r,
						height: a
					}), t.__canvasGradient = o, t.__width = r, t.__height = a) : gt(t) && (t.scaleX = t.scaleX || l, t.scaleY = t.scaleY || l, o = XA(i, t, { dirty: function() {
						u.setUnpainted(), u.painter.refresh();
					} })), i.save(), i.fillStyle = o || t, i.fillRect(e, n, r, a), i.restore();
				}
				s && (i.save(), i.globalAlpha = c, i.drawImage(d, e, n, r, a), i.restore());
			}
			!n || s ? f(0, 0, a, o) : n.length && z(n, function(e) {
				f(e.x * l, e.y * l, e.width * l, e.height * l);
			});
		}, t;
	}(eo);
}));
//#endregion
//#region node_modules/zrender/lib/canvas/Painter.js
function bL(e) {
	return e ? e.__builtin__ ? !0 : typeof e.resize == "function" && typeof e.refresh == "function" : !1;
}
function xL(e, t) {
	var n = document.createElement("div");
	return n.style.cssText = [
		"position:relative",
		"width:" + e + "px",
		"height:" + t + "px",
		"padding:0",
		"margin:0",
		"border-width:0"
	].join(";") + ";", n;
}
function SL(e, t, n, r) {
	var i = new vL(e, t, t.dpr);
	return i.zlevel = n, i.zlevel2 = r, i.__builtin__ = !0, CL(i), i;
}
function CL(e) {
	e.__cursorStack = [], e.__cursors = K();
}
function wL(e) {
	return e.startIdx = e.drawIdx = e.endIdx = e.endIdxNew = 0, e.used = !1, e.first = e.last = NaN, e.notClearIdx = -1, e;
}
function TL(e, t) {
	var n = e.__cursors, r = +t;
	return n.get(r) || (e.__cursorStack.push(r), n.set(r, wL({ key: r })));
}
function EL(e, t) {
	for (var n = e.__cursorStack, r = 0; r < n.length; r++) t(e.__cursors.get(n[r]));
}
function DL(e, t) {
	var n = e.layers;
	return n[t] || (n[t] = [
		,
		,
		,
	]);
}
function OL(e, t, n) {
	for (var r = e.layerStack, i = 0; i < r.length; i++) {
		var a = r[i].zl, o = r[i].zl2, s = e.layers[a][o];
		(!n || (!(n & PL) || s.__builtin__) && (!(n & FL) || !s.__builtin__) && (!(n & IL) || s !== e.hoverlayer)) && t(s, a, o, i);
	}
}
var kL, AL, jL, ML, NL, PL, FL, IL, LL, RL, zL = M((() => {
	co(), q(), yL(), UD(), $t(), Ip(), yj(), lo(), VA(), Ye(), kL = 1e5, AL = 314159, jL = void 0, ML = 1, NL = 2, PL = 1, FL = 2, IL = 4, LL = PL | IL, RL = function() {
		function e(e, t, n, r) {
			this.type = "canvas", this._prevDisplayList = [], this._layerConfig = {}, this._needsManuallyCompositing = !1, this.type = "canvas", this._i = {
				layerStack: [],
				layers: []
			};
			var i = !e.nodeName || e.nodeName.toUpperCase() === "CANVAS";
			if (this._opts = n = L({}, n || {}), this.dpr = n.devicePixelRatio || ro, this._singleCanvas = i, this.root = e, e.style && (kt(e), e.innerHTML = ""), this.storage = t, this._prevDisplayList = [], i) {
				var a = e, o = a.width, s = a.height;
				n.width != null && (o = n.width), n.height != null && (s = n.height), this.dpr = n.devicePixelRatio || 1, a.width = o * this.dpr, a.height = s * this.dpr, this._width = o, this._height = s;
				var c = SL(a, this, AL, 0);
				c.initContext(), this._insertLayer(c, AL, 0, !0), this._domRoot = e;
			} else {
				this._width = BA(e, 0, n), this._height = BA(e, 1, n);
				var l = this._domRoot = xL(this._width, this._height);
				e.appendChild(l);
			}
		}
		return e.prototype.getType = function() {
			return "canvas";
		}, e.prototype.isSingleCanvas = function() {
			return this._singleCanvas;
		}, e.prototype.getViewportRoot = function() {
			return this._domRoot;
		}, e.prototype.getViewportRootOffset = function() {
			var e = this.getViewportRoot();
			if (e) return {
				offsetLeft: e.offsetLeft || 0,
				offsetTop: e.offsetTop || 0
			};
		}, e.prototype.refresh = function(e) {
			var t = e && !W(e) ? { paintAll: !!e } : e || {}, n = G(t.refresh, !0), r = G(t.refreshHover, !1);
			if (r && (this._hoverLayerDirty = NL), !n) return r && this._paintHoverList(this.storage.getDisplayList(!1)), this;
			var i = this.storage.getDisplayList(!0);
			this._updateLayerStatus(i, t.paintAll), this._redrawId = Math.random();
			var a = this._prevDisplayList;
			this._paintList(i, a, this._redrawId);
			var o = this._backgroundColor;
			return OL(this._i, function(e, t, n, r) {
				e.refresh && e.refresh(r === 0 ? o : null);
			}, FL), this._opts.useDirtyRect && (this._prevDisplayList = i.slice()), this;
		}, e.prototype._paintHoverList = function(e) {
			var t = this._i.hoverlayer, n = this._hoverLayerDirty;
			if (this._hoverLayerDirty = jL, n !== jL && (!t && n === NL && (t = this._i.hoverlayer = this._ensureLayer(kL)), t)) {
				t.clear();
				for (var r = {
					inHover: !0,
					viewWidth: this._width,
					viewHeight: this._height,
					beforeBrushParam: {}
				}, i, a = 0, o = e.length; a < o; a++) {
					var s = e[a];
					if (s.__inHover) {
						i || (i = t.ctx, i.save());
						var c = s.__hoverStyle, l = void 0;
						c && (l = s.style, s.style = c), lj(i, s, r), c && (s.style = l);
					}
				}
				i && (uj(i, r), i.restore());
			}
		}, e.prototype.getHoverLayer = function() {
			return this._ensureLayer(kL);
		}, e.prototype.paintOne = function(e, t) {
			cj(e, t);
		}, e.prototype._paintList = function(e, t, n) {
			if (this._redrawId === n) {
				var r = this._doPaintList(e, t);
				if (this._needsManuallyCompositing && this._compositeManually(), r) OL(this._i, function(e) {
					e.afterBrush && e.afterBrush();
				}, LL), this._paintHoverList(e);
				else {
					var i = this;
					HD(function() {
						i._paintList(e, t, n);
					});
				}
			}
		}, e.prototype._compositeManually = function() {
			var e = this._ensureLayer(AL).ctx, t = this._domRoot.width, n = this._domRoot.height;
			e.clearRect(0, 0, t, n), OL(this._i, function(r) {
				r.virtual && e.drawImage(r.dom, 0, 0, t, n);
			}, PL);
		}, e.prototype._doPaintList = function(e, t) {
			var n = this, r = !0;
			return OL(this._i, function(i) {
				var a = !1;
				if (EL(i, function(e) {
					(e.drawIdx < e.endIdx || e.notClearIdx >= 0) && (a = !0);
				}), a || i.__dirty) {
					var o = n._opts.useDirtyRect && !gL(i) ? i.createRepaintRects(e, t, n._width, n._height) : null, s = n._i.layerStack[0], c = !0;
					if (i.__dirty) {
						c = !1, i.__dirty = !1;
						var l = i.zlevel === s.zl && i.zlevel2 === s.zl2 ? n._backgroundColor : null;
						i.clear(!1, l, o);
					}
					EL(i, function(t) {
						var a = n._paintPerCursor(i, t, e, o, c);
						r &&= a;
					});
				}
			}, LL), J.wxa && OL(this._i, function(e) {
				e && e.ctx && e.ctx.draw && e.ctx.draw();
			}), r;
		}, e.prototype._paintPerCursor = function(e, t, n, r, i) {
			var a = e.ctx;
			if (r) {
				if (!r.length) t.drawIdx = t.endIdx;
				else for (var o = this.dpr, s = 0; s < r.length; ++s) {
					var c = r[s];
					a.save(), a.beginPath(), a.rect(c.x * o, c.y * o, c.width * o, c.height * o), a.clip(), this._paintPerCursorInRect(e, t, n, c, i), a.restore();
				}
			} else a.save(), this._paintPerCursorInRect(e, t, n, null, i), a.restore();
			return t.drawIdx >= t.endIdx;
		}, e.prototype._paintPerCursorInRect = function(e, t, n, r, i) {
			for (var a = {
				inHover: !1,
				allClipped: !1,
				prevEl: null,
				viewWidth: this._width,
				viewHeight: this._height,
				beforeBrushParam: { contentRetained: i }
			}, o = e.ctx, s = gL(e), c = s && Je.getTime(), l = t.drawIdx, u = t.notClearIdx, d = u >= 0 ? Math.min(u, l) : l; d < t.endIdx; d++) {
				var f = n[d];
				if (!(d < l && !f.notClear)) {
					if (f.__inHover && (this._hoverLayerDirty = NL), r != null) {
						var p = f.getPaintRect();
						p && p.intersect(r) && (lj(o, f, a), f.setPrevPaintRect(p));
					} else lj(o, f, a);
					if (s && Je.getTime() - c > 15) {
						d++;
						break;
					}
				}
			}
			uj(o, a), t.drawIdx = Math.max(d, l);
		}, e.prototype.getLayer = function(e, t) {
			return this._ensureLayer(e, 0, t);
		}, e.prototype._ensureLayer = function(e, t, n) {
			t ||= 0;
			var r = this._singleCanvas;
			r && !this._needsManuallyCompositing && (e = AL, t = 0);
			var i = DL(this._i, e)[t];
			return i || (i = SL("zr_" + e + "." + t, this, e, t), this._layerConfig[e] && Qe(i, this._layerConfig[e], !0), (n || r && e !== AL) && (i.virtual = !0), this._insertLayer(i, e, t, !1), i.initContext()), i;
		}, e.prototype.insertLayer = function(e, t) {
			this._insertLayer(t, e, 0, !1);
		}, e.prototype._insertLayer = function(e, t, n, r) {
			var i = this._i, a = i.layers, o = i.layerStack, s = this._domRoot, c = null;
			if (!(a[t] && a[t][n]) && bL(e)) {
				for (var l = o.length, u = 0; u < l && (o[u].zl < t || o[u].zl === t && o[u].zl2 < n);) u++;
				if (u > 0 && (c = DL(i, o[u - 1].zl)[o[u - 1].zl2]), o.splice(u, 0, {
					zl: t,
					zl2: n
				}), DL(i, t)[n] = e, !r && !e.virtual) {
					if (c) {
						var d = c.dom;
						d.nextSibling ? s.insertBefore(e.dom, d.nextSibling) : s.appendChild(e.dom);
					} else s.firstChild ? s.insertBefore(e.dom, s.firstChild) : s.appendChild(e.dom);
				}
				e.painter ||= this;
			}
		}, e.prototype.eachLayer = function(e, t) {
			return OL(this._i, function(n, r) {
				e.call(t, n, r);
			});
		}, e.prototype.eachBuiltinLayer = function(e, t) {
			return OL(this._i, function(n, r) {
				e.call(t, n, r);
			}, PL);
		}, e.prototype.eachOtherLayer = function(e, t) {
			return OL(this._i, function(n, r) {
				e.call(t, n, r);
			}, FL);
		}, e.prototype.getLayers = function() {
			var e = {};
			return OL(this._i, function(t, n, r) {
				e[t.id] = t;
			}), e;
		}, e.prototype._updateLayerStatus = function(e, t) {
			var n = this;
			if (n._singleCanvas) for (var r = 1; r < e.length; r++) {
				var i = e[r];
				if (i.zlevel !== e[r - 1].zlevel || i.incremental) {
					n._needsManuallyCompositing = !0;
					break;
				}
			}
			OL(n._i, function(e) {
				e.__dirty = !1, EL(e, function(e) {
					e.used = !1, e.endIdxNew = 0, e.notClearIdx = -1;
				});
			}, LL);
			for (var a, o = null, s = null, c = !1, l = 0, u = e.length; l < u; l++) {
				var i = e[l], d = i.zlevel, f = i.incremental, p = void 0;
				if (a !== d && (a = d, c = !1), f ? (c = !0, p = 1) : p = c ? 2 : 0, (!o || d !== o.zlevel || p !== o.zlevel2) && (o = n._ensureLayer(d, p), s = null, !o.__builtin__)) {
					Ze("ZLevel " + d + " has been used by unknown layer " + o.id);
					continue;
				}
				if ((!s || f !== s.key) && (s = TL(o, f), !s.used)) {
					if (s.used = !0, !t && s.first === i.id) {
						var m = l - s.startIdx;
						s.startIdx = l, s.drawIdx += m, s.endIdx += m;
					} else o.__dirty = !0, s.first = i.id, s.startIdx = s.drawIdx = l, s.endIdx = l + 1;
				}
				s.endIdxNew = l + 1, i.__dirty & 1 && !i.__inHover && ((!f || !i.notClear && l < s.drawIdx) && (o.__dirty = !0), f && i.notClear && s.notClearIdx < 0 && (s.notClearIdx = l));
			}
			OL(n._i, function(t) {
				for (var r = t.__cursorStack, i = t.__cursors, a = r.length - 1; a >= 0; a--) {
					var o = i.get(r[a]);
					if (!o.used) t.__dirty = !0, i.removeKey(r[a]), r.splice(a, 1);
					else {
						var s = o.endIdxNew;
						(gL(t) ? s < o.drawIdx : s !== o.endIdx || !s || e[s - 1].id !== o.last) && (t.__dirty = !0), o.endIdx = o.endIdxNew, o.last = s ? e[s - 1].id : NaN;
					}
				}
				t.__dirty && (EL(t, function(e) {
					e.drawIdx = e.startIdx;
				}), n._hoverLayerDirty === jL && (n._hoverLayerDirty = ML));
			}, LL);
		}, e.prototype.clear = function() {
			return OL(this._i, function(e) {
				e.clear(), CL(e);
			}, PL), this;
		}, e.prototype.setBackgroundColor = function(e) {
			this._backgroundColor = e, OL(this._i, function(e) {
				e.setUnpainted();
			});
		}, e.prototype.configLayer = function(e, t) {
			if (t) {
				var n = this._layerConfig;
				n[e] ? Qe(n[e], t, !0) : n[e] = t, OL(this._i, function(e, t) {
					Qe(e, n[t], !0);
				});
			}
		}, e.prototype.delLayer = function(e) {
			for (var t = this._i.layerStack, n = this._i.layers, r = t.length - 1; r >= 0; r--) {
				var i = t[r];
				if (i.zl === e) {
					var a = n[e][i.zl2];
					if (a.__builtin__) continue;
					if (t.splice(r, 1), n[e][i.zl2] = void 0, !a.virtual) {
						var o = a.dom.parentNode;
						o && o.removeChild(a.dom);
					}
				}
			}
		}, e.prototype.resize = function(e, t) {
			if (this._domRoot.style) {
				var n = this._domRoot;
				n.style.display = "none";
				var r = this._opts, i = this.root;
				e != null && (r.width = e), t != null && (r.height = t), e = BA(i, 0, r), t = BA(i, 1, r), n.style.display = "", (this._width !== e || t !== this._height) && (n.style.width = e + "px", n.style.height = t + "px", OL(this._i, function(n) {
					n.resize(e, t);
				}), this.refresh({ paintAll: !0 })), this._width = e, this._height = t;
			} else {
				if (e == null || t == null) return;
				this._width = e, this._height = t, this._ensureLayer(AL).resize(e, t);
			}
			return this;
		}, e.prototype.clearLayer = function(e) {
			z(this._i.layers[e], function(e) {
				e && !e.__builtin__ && e.clear();
			});
		}, e.prototype.dispose = function() {
			this.root.innerHTML = "", this.root = this.storage = this._domRoot = this._i = null;
		}, e.prototype.getRenderedCanvas = function(e) {
			if (e ||= {}, this._singleCanvas && !this._compositeManually) return this._i.layers[AL][0].dom;
			var t = new vL("image", this, e.pixelRatio || this.dpr);
			t.initContext(), t.clear(!1, e.backgroundColor || this._backgroundColor);
			var n = t.ctx;
			if (e.pixelRatio <= this.dpr) {
				this.refresh();
				var r = t.dom.width, i = t.dom.height;
				OL(this._i, function(e) {
					e.__builtin__ ? n.drawImage(e.dom, 0, 0, r, i) : e.renderToCanvas && (n.save(), e.renderToCanvas(n), n.restore());
				});
			} else {
				for (var a = {
					inHover: !1,
					viewWidth: this._width,
					viewHeight: this._height,
					beforeBrushParam: {}
				}, o = this.storage.getDisplayList(!0), s = 0, c = o.length; s < c; s++) {
					var l = o[s];
					lj(n, l, a);
				}
				uj(n, a);
			}
			return t.dom;
		}, e.prototype.getWidth = function() {
			return this._width;
		}, e.prototype.getHeight = function() {
			return this._height;
		}, e;
	}();
}));
//#endregion
//#region node_modules/echarts/lib/renderer/installCanvasRenderer.js
function BL(e) {
	e.registerPainter("canvas", RL);
}
var VL = M((() => {
	zL();
})), HL = M((() => {
	ka(), Qs(), oc(), Hr(), tc(), WA(), q(), ov(), jn(), Ci(), ys(), yp(), ea(), Ic(), Ye(), Ea(), SO(), VL();
})), UL = M((() => {
	HL();
})), WL, GL = M((() => {
	IP(), dL(), mL(), UL(), WL = /*@__PURE__*/ d({
		__name: "Chart",
		props: {
			series: {},
			format: { type: Function },
			capacity: {}
		},
		setup(e) {
			uN([
				cw,
				BF,
				EI,
				cL,
				BL
			]);
			let t = e, n = g(null), r = oe(), i;
			function a() {
				if (!i) return;
				let e = r.value.textColor3;
				i.setOption({
					animation: !1,
					color: [
						"#c39b6e",
						"#7a7896",
						"#5f9e8f",
						"#d08c5b",
						"#8fa9c7",
						"#b0718a",
						"#9aa05a"
					],
					grid: {
						left: 64,
						right: 16,
						top: 28,
						bottom: 28
					},
					tooltip: {
						trigger: "axis",
						valueFormatter: (e) => t.format(Number(e))
					},
					legend: {
						type: "scroll",
						top: 0,
						textStyle: { color: e }
					},
					xAxis: {
						type: "time",
						axisLabel: { color: e }
					},
					yAxis: {
						type: "value",
						max: t.capacity || void 0,
						axisLabel: {
							color: e,
							formatter: (e) => t.format(e)
						},
						splitLine: { lineStyle: { color: r.value.dividerColor } }
					},
					series: t.series.map((e) => ({
						name: e.label,
						type: "line",
						showSymbol: !1,
						data: e.points.map(([e, t]) => [e * 1e3, t])
					}))
				}, !0);
			}
			m(() => {
				n.value && (i = Ij(n.value), a(), window.addEventListener("resize", o));
			});
			let o = () => i?.resize();
			return b(() => [
				t.series,
				t.capacity,
				r.value
			], a, { deep: !1 }), p(() => {
				window.removeEventListener("resize", o), i?.dispose();
			}), (e, t) => (h(), s("div", {
				ref_key: "el",
				ref: n,
				class: "chart"
			}, null, 512));
		}
	});
})), KL = M((() => {})), qL, JL = M((() => {
	GL(), GL(), KL(), Ee(), qL = /*#__PURE__*/ Te(WL, [["__scopeId", "data-v-22c05fe5"]]);
})), YL, XL, ZL = M((() => {
	ye(), JL(), YL = { "data-test": "monitoring-metrics" }, XL = /*@__PURE__*/ d({
		__name: "MetricsTab",
		props: {
			cluster: {},
			resource: {},
			object: {}
		},
		setup(e) {
			let t = e, n = g("1h"), r = g(null), o = g(null), c;
			async function d() {
				let e = t.resource.type.kind.toLowerCase();
				try {
					r.value = await pe(t.cluster, e, t.object.metadata.namespace, t.object.metadata.name, n.value), o.value = null;
				} catch (e) {
					o.value = e instanceof Error ? e.message : String(e);
				}
			}
			return b(() => [
				t.cluster,
				t.object.metadata.name,
				n.value
			], () => {
				r.value = null, d(), clearInterval(c), c = setInterval(() => void d(), 3e4);
			}, { immediate: !0 }), p(() => clearInterval(c)), (e, t) => (h(), s("div", YL, [u(y(te), {
				value: n.value,
				"onUpdate:value": t[0] ||= (e) => n.value = e,
				size: "small",
				class: "range"
			}, {
				default: x(() => [(h(!0), s(i, null, _(y(de), (e) => (h(), a(y(ee), {
					key: e,
					value: e
				}, {
					default: x(() => [l(v(e), 1)]),
					_: 2
				}, 1032, ["value"]))), 128))]),
				_: 1
			}, 8, ["value"]), o.value ? (h(), a(y(S), {
				key: 0,
				type: "warning"
			}, {
				default: x(() => [l(v(o.value), 1)]),
				_: 1
			})) : r.value ? (h(), s(i, { key: 2 }, [u(y(w), {
				title: "CPU",
				size: "small",
				class: "card"
			}, {
				default: x(() => [u(qL, {
					series: r.value.cpu,
					format: y(ue),
					capacity: r.value.cpuCapacity
				}, null, 8, [
					"series",
					"format",
					"capacity"
				])]),
				_: 1
			}), u(y(w), {
				title: "Memory (working set)",
				size: "small",
				class: "card"
			}, {
				default: x(() => [u(qL, {
					series: r.value.memory,
					format: y(le),
					capacity: r.value.memoryCapacity
				}, null, 8, [
					"series",
					"format",
					"capacity"
				])]),
				_: 1
			})], 64)) : (h(), a(y(re), { key: 1 }))]));
		}
	});
})), QL = M((() => {})), $L = /* @__PURE__ */ ce({ default: () => eR }), eR, tR = M((() => {
	ZL(), ZL(), QL(), Ee(), eR = /*#__PURE__*/ Te(XL, [["__scopeId", "data-v-543ca935"]]);
})), nR, rR, iR, aR, oR = M((() => {
	ye(), nR = { "data-test": "monitoring-cluster-card" }, rR = { key: 0 }, iR = { class: "muted" }, aR = /*@__PURE__*/ d({
		__name: "ClusterCard",
		props: { cluster: {} },
		setup(e) {
			let t = e, n = g(null), r = g(null);
			m(async () => {
				try {
					n.value = await me(t.cluster);
				} catch (e) {
					r.value = e instanceof Error ? e.message : String(e);
				}
			});
			let o = (e, t) => t > 0 ? Math.round(e / t * 100) : 0, l = oe();
			return (e, t) => (h(), s("div", nR, [r.value ? (h(), s("span", rR, v(r.value), 1)) : n.value ? (h(), s(i, { key: 2 }, [
				c("div", null, "CPU " + v(y(ue)(n.value.cpuUsed)) + " of " + v(y(ue)(n.value.cpuCapacity)), 1),
				u(y(j), {
					type: "line",
					color: y(l).primaryColor,
					percentage: o(n.value.cpuUsed, n.value.cpuCapacity)
				}, null, 8, ["color", "percentage"]),
				c("div", null, "Memory " + v(y(le)(n.value.memoryUsed)) + " of " + v(y(le)(n.value.memoryCapacity)), 1),
				u(y(j), {
					type: "line",
					color: y(l).primaryColor,
					percentage: o(n.value.memoryUsed, n.value.memoryCapacity)
				}, null, 8, ["color", "percentage"]),
				c("div", iR, v(n.value.targetsUp) + " scrape targets up, " + v(n.value.targetsDown) + " down ", 1)
			], 64)) : (h(), a(y(re), {
				key: 1,
				size: "small"
			}))]));
		}
	});
})), sR = M((() => {})), cR = /* @__PURE__ */ ce({ default: () => lR }), lR, uR = M((() => {
	oR(), oR(), sR(), Ee(), lR = /*#__PURE__*/ Te(aR, [["__scopeId", "data-v-a67c69a0"]]);
})), dR, fR, pR, mR, hR = M((() => {
	ye(), dR = { "data-test": "monitoring-project-card" }, fR = { key: 0 }, pR = { class: "muted" }, mR = /*@__PURE__*/ d({
		__name: "ProjectCard",
		props: {
			cluster: {},
			project: {}
		},
		setup(e) {
			let t = e, n = g(null), r = g(null), o = g(null);
			function l(e) {
				return e ? e.endsWith("m") ? Number(e.slice(0, -1)) / 1e3 : Number(e) : 0;
			}
			function d(e) {
				if (!e) return 0;
				let t = /^([0-9.]+)([KMGT]i?)?$/.exec(e);
				return t ? Number(t[1]) * (t[2] ? {
					K: 1e3,
					M: 1e6,
					G: 1e9,
					T: 0xe8d4a51000,
					Ki: 1024,
					Mi: 1024 ** 2,
					Gi: 1024 ** 3,
					Ti: 1024 ** 4
				}[t[2]] ?? 1 : 1) : 0;
			}
			m(async () => {
				let e = t.project.spec.namespace;
				try {
					let [i, a] = await Promise.all([fetch(`/api/clusters/${encodeURIComponent(t.cluster)}/k8s/api/v1/namespaces/${encodeURIComponent(e)}/resourcequotas/capybara-project-quota`).then((e) => e.ok ? e.json() : { status: void 0 }), _e(t.cluster, e)]);
					n.value = i.status ?? {}, r.value = a;
				} catch (e) {
					o.value = e instanceof Error ? e.message : String(e);
				}
			});
			let f = (e, t) => t > 0 ? Math.min(100, Math.round(e / t * 100)) : 0, p = oe();
			return (e, t) => (h(), s("div", dR, [o.value ? (h(), s("span", fR, v(o.value), 1)) : !r.value || !n.value ? (h(), a(y(re), {
				key: 1,
				size: "small"
			})) : (h(), s(i, { key: 2 }, [
				c("div", null, "CPU in use " + v(y(ue)(r.value.cpu)) + " · limit " + v(n.value.hard?.["limits.cpu"] ?? "—"), 1),
				u(y(j), {
					type: "line",
					color: y(p).primaryColor,
					percentage: f(r.value.cpu, l(n.value.hard?.["limits.cpu"]))
				}, null, 8, ["color", "percentage"]),
				c("div", null, "Memory in use " + v(y(le)(r.value.memory)) + " · limit " + v(n.value.hard?.["limits.memory"] ?? "—"), 1),
				u(y(j), {
					type: "line",
					color: y(p).primaryColor,
					percentage: f(r.value.memory, d(n.value.hard?.["limits.memory"]))
				}, null, 8, ["color", "percentage"]),
				c("div", pR, v(r.value.pods) + " pod(s) running of " + v(n.value.hard?.pods ?? "—") + " allowed ", 1)
			], 64))]));
		}
	});
})), gR = M((() => {})), _R = /* @__PURE__ */ ce({ default: () => vR }), vR, yR = M((() => {
	hR(), hR(), gR(), Ee(), vR = /*#__PURE__*/ Te(mR, [["__scopeId", "data-v-bdaa3d00"]]);
})), bR, xR = M((() => {
	ye(), bR = /*@__PURE__*/ d({
		__name: "SettingsPage",
		props: { cluster: {} },
		setup(e) {
			let t = e, n = g(null), r = g(null);
			return m(async () => {
				try {
					n.value = await he(t.cluster);
				} catch (e) {
					r.value = e instanceof Error ? e.message : String(e);
				}
			}), (e, t) => (h(), s("div", null, [
				u(y(S), {
					type: "info",
					"show-icon": !1,
					class: "note"
				}, {
					default: x(() => [...t[0] ||= [l(" Install mode, connection settings, upgrades and uninstalling are managed in the Marketplace. ", -1)]]),
					_: 1
				}),
				r.value ? (h(), a(y(S), {
					key: 0,
					type: "warning"
				}, {
					default: x(() => [l(v(r.value), 1)]),
					_: 1
				})) : o("", !0),
				n.value ? (h(), a(y(E), {
					key: 1,
					column: 1,
					"label-placement": "left",
					bordered: ""
				}, {
					default: x(() => [
						u(y(D), { label: "Prometheus" }, {
							default: x(() => [l(v(n.value.version), 1)]),
							_: 1
						}),
						u(y(D), { label: "Scrape targets" }, {
							default: x(() => [l(v(n.value.targetsUp) + " up, " + v(n.value.targetsDown) + " down ", 1)]),
							_: 1
						}),
						u(y(D), { label: "Queries" }, {
							default: x(() => [...t[1] ||= [l(" Predefined only (CPU, memory, alerts); ranges 1h, 6h, 24h, 7d; cached briefly. ", -1)]]),
							_: 1
						})
					]),
					_: 1
				})) : o("", !0)
			]));
		}
	});
})), SR = M((() => {})), CR = /* @__PURE__ */ ce({ default: () => wR }), wR, TR = M((() => {
	xR(), xR(), SR(), Ee(), wR = /*#__PURE__*/ Te(bR, [["__scopeId", "data-v-bc9f3634"]]);
})), ER = t({
	name: "monitoring",
	apiVersion: e,
	register(e) {
		e.register({
			type: "nav-section",
			id: "monitoring.section",
			label: "Observe",
			order: 50
		}), e.register({
			type: "route",
			id: "monitoring.overview",
			path: "monitoring",
			scope: "cluster",
			title: "Observe",
			component: () => Promise.resolve().then(() => (ke(), De))
		}), e.register({
			type: "route",
			id: "monitoring.alerts",
			path: "monitoring/alerts",
			scope: "cluster",
			title: "Alerts",
			component: () => Promise.resolve().then(() => (Pe(), Me))
		}), e.register({
			type: "route",
			id: "monitoring.grafana",
			path: "monitoring/grafana",
			scope: "cluster",
			title: "Grafana",
			component: () => Promise.resolve().then(() => (ze(), Le))
		}), e.register({
			type: "nav-item",
			id: "monitoring.nav.overview",
			label: "Overview",
			order: 10,
			section: "monitoring.section",
			route: "monitoring.overview"
		}), e.register({
			type: "nav-item",
			id: "monitoring.nav.alerts",
			label: "Alerts",
			order: 20,
			section: "monitoring.section",
			route: "monitoring.alerts"
		}), e.register({
			type: "nav-item",
			id: "monitoring.nav.grafana",
			label: "Grafana",
			order: 30,
			section: "monitoring.section",
			route: "monitoring.grafana"
		}), e.register({
			type: "resource-detail-tab",
			id: "monitoring.tab.metrics",
			label: "Metrics",
			order: 60,
			kinds: [
				"Pod",
				"Deployment",
				"Node"
			],
			component: () => Promise.resolve().then(() => (tR(), $L))
		}), e.register({
			type: "cluster-overview-card",
			id: "monitoring.card.cluster",
			title: "Resource usage",
			order: 40,
			component: () => Promise.resolve().then(() => (uR(), cR))
		}), e.register({
			type: "project-overview-card",
			id: "monitoring.card.project",
			title: "Quota vs usage",
			order: 10,
			component: () => Promise.resolve().then(() => (yR(), _R))
		}), e.register({
			type: "settings-page",
			id: "monitoring.settings",
			label: "Observe",
			order: 10,
			component: () => Promise.resolve().then(() => (TR(), CR))
		});
	}
});
//#endregion
export { ER as default };
