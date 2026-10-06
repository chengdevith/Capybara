if(typeof document!=='undefined'){const s=document.createElement('style');s.dataset.plugin='monitoring';s.textContent=".muted[data-v-e59f9909]{opacity:.7;font-size:12px}.chart[data-v-ac80903c]{width:100%;height:260px}.range[data-v-543ca935],.card[data-v-543ca935]{margin-bottom:12px}.muted[data-v-d967538f],.muted[data-v-b0d2df3d]{opacity:.7;margin-top:6px;font-size:12px}.note[data-v-bc9f3634]{margin-bottom:12px}\n/*$vite$:1*/";document.head.appendChild(s)}
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
var ue, de, fe, N, pe, me, he, ge, _e, ve, ye = M((() => {
	ue = [
		"1h",
		"6h",
		"24h",
		"7d"
	], de = encodeURIComponent, fe = (e) => n("monitoring", e), N = (e, t, n, r, i) => fe(`/clusters/${de(e)}/metrics/${t}?${new URLSearchParams({
		namespace: n ?? "",
		name: r,
		range: i
	})}`), pe = (e) => fe(`/clusters/${de(e)}/overview`), me = (e) => fe(`/clusters/${de(e)}/status`), he = (e) => fe(`/clusters/${de(e)}/alerts`), ge = (e, t) => fe(`/clusters/${de(e)}/namespaces/${de(t)}/usage`), _e = (e) => `/api/plugins/monitoring/grafana/${de(e)}/`, ve = (e) => e < 1 ? `${Math.round(e * 1e3)}m` : `${e.toFixed(2)} cores`;
})), be, xe, Se, Ce = M((() => {
	ye(), be = { "data-test": "monitoring-overview" }, xe = { class: "muted" }, Se = /*@__PURE__*/ d({
		__name: "OverviewPage",
		setup(e) {
			let t = r(), n = g(null), i = g(""), d = g(null), f;
			async function m() {
				if (t.value) try {
					let [e, r] = await Promise.all([pe(t.value), me(t.value)]);
					n.value = e, i.value = r.version, d.value = null;
				} catch (e) {
					d.value = e instanceof Error ? e.message : String(e);
				}
			}
			b(t, () => {
				m(), clearInterval(f), f = setInterval(() => void m(), 3e4);
			}, { immediate: !0 }), p(() => clearInterval(f));
			let _ = (e, t) => t > 0 ? Math.round(e / t * 100) : 0;
			return (e, r) => (h(), s("div", be, [
				u(y(ne), {
					align: "center",
					justify: "space-between"
				}, {
					default: x(() => [u(y(A), null, {
						default: x(() => [...r[0] ||= [l("Monitoring", -1)]]),
						_: 1
					}), y(t) ? (h(), a(y(C), {
						key: 0,
						tag: "a",
						href: y(_e)(y(t)),
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
								default: x(() => [u(y(ie), { value: `${y(ve)(n.value.cpuUsed)} of ${y(ve)(n.value.cpuCapacity)}` }, null, 8, ["value"]), u(y(j), {
									type: "line",
									percentage: _(n.value.cpuUsed, n.value.cpuCapacity)
								}, null, 8, ["percentage"])]),
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
									percentage: _(n.value.memoryUsed, n.value.memoryCapacity)
								}, null, 8, ["percentage"])]),
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
	Ce(), Ce(), we(), Ee(), Oe = /*#__PURE__*/ Te(Se, [["__scopeId", "data-v-e59f9909"]]);
})), Ae, je = M((() => {
	ye(), Ae = /*@__PURE__*/ d({
		__name: "AlertsPage",
		setup(e) {
			let t = r(), n = g([]), i = g(!0), c = g(null), d;
			async function m() {
				if (t.value) try {
					n.value = await he(t.value), c.value = null;
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
					href: y(_e)(y(t)),
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
	return Wt >= Gt && (Wt = 0), Wt++;
}
function Ze() {
	var e = [...arguments];
	typeof console < "u" && console.error.apply(console, e);
}
function I(e) {
	if (typeof e != "object" || !e) return e;
	var t = e, n = Ft.call(e);
	if (n === "[object Array]") {
		if (!Et(e)) {
			t = [];
			for (var r = 0, i = e.length; r < i; r++) t[r] = I(e[r]);
		}
	} else if (Pt[n]) {
		if (!Et(e)) {
			var a = e.constructor;
			if (a.from) t = a.from(e);
			else {
				t = new a(e.length);
				for (var r = 0, i = e.length; r < i; r++) t[r] = e[r];
			}
		}
	} else if (!Nt[n] && !Et(e) && !ht(e)) for (var o in t = {}, e) e.hasOwnProperty(o) && o !== Ut && (t[o] = I(e[o]));
	return t;
}
function Qe(e, t, n) {
	if (!U(t) || !U(e)) return n ? I(t) : e;
	for (var r in t) if (t.hasOwnProperty(r) && r !== Ut) {
		var i = e[r], a = t[r];
		U(a) && U(i) && !B(a) && !B(i) && !ht(a) && !ht(i) && !pt(a) && !pt(i) && !Et(a) && !Et(i) ? Qe(i, a, n) : (n || !(r in e)) && (e[r] = I(t[r]));
	}
	return e;
}
function L(e, t) {
	if (Object.assign) Object.assign(e, t);
	else for (var n in t) t.hasOwnProperty(n) && n !== Ut && (e[n] = t[n]);
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
	for (var r = ct(t), i = 0, a = r.length; i < a; i++) {
		var o = r[i];
		(n ? t[o] != null : e[o] == null) && (e[o] = t[o]);
	}
	return e;
}
function tt(e, t) {
	if (e) {
		if (e.indexOf) return e.indexOf(t);
		for (var n = 0, r = e.length; n < r; n++) if (e[n] === t) return n;
	}
	return -1;
}
function nt(e, t) {
	var n = e.prototype;
	function r() {}
	for (var i in r.prototype = t.prototype, e.prototype = new r(), n) n.hasOwnProperty(i) && (e.prototype[i] = n[i]);
	e.prototype.constructor = e, e.superClass = t;
}
function rt(e, t, n) {
	if (e = "prototype" in e ? e.prototype : e, t = "prototype" in t ? t.prototype : t, Object.getOwnPropertyNames) for (var r = Object.getOwnPropertyNames(t), i = 0; i < r.length; i++) {
		var a = r[i];
		a !== "constructor" && (n ? t[a] != null : e[a] == null) && (e[a] = t[a]);
	}
	else et(e, t, n);
}
function it(e) {
	return !e || typeof e == "string" ? !1 : typeof e.length == "number";
}
function R(e, t, n) {
	if (e && t) {
		if (e.forEach && e.forEach === Lt) e.forEach(t, n);
		else if (e.length === +e.length) for (var r = 0, i = e.length; r < i; r++) t.call(n, e[r], r, e);
		else for (var a in e) e.hasOwnProperty(a) && t.call(n, e[a], a, e);
	}
}
function z(e, t, n) {
	if (!e) return [];
	if (!t) return St(e);
	if (e.map && e.map === Bt) return e.map(t, n);
	for (var r = [], i = 0, a = e.length; i < a; i++) r.push(t.call(n, e[i], i, e));
	return r;
}
function at(e, t, n, r) {
	if (e && t) {
		for (var i = 0, a = e.length; i < a; i++) n = t.call(r, n, e[i], i, e);
		return n;
	}
}
function ot(e, t, n) {
	if (!e) return [];
	if (!t) return St(e);
	if (e.filter && e.filter === Rt) return e.filter(t, n);
	for (var r = [], i = 0, a = e.length; i < a; i++) t.call(n, e[i], i, e) && r.push(e[i]);
	return r;
}
function st(e, t, n) {
	if (e && t) {
		for (var r = 0, i = e.length; r < i; r++) if (t.call(n, e[r], r, e)) return e[r];
	}
}
function ct(e) {
	if (!e) return [];
	if (Object.keys) return Object.keys(e);
	var t = [];
	for (var n in e) e.hasOwnProperty(n) && t.push(n);
	return t;
}
function lt(e, t) {
	var n = [...arguments].slice(2);
	return function() {
		return e.apply(t, n.concat(zt.call(arguments)));
	};
}
function ut(e) {
	var t = [...arguments].slice(1);
	return function() {
		return e.apply(this, t.concat(zt.call(arguments)));
	};
}
function B(e) {
	return Array.isArray ? Array.isArray(e) : Ft.call(e) === "[object Array]";
}
function V(e) {
	return typeof e == "function";
}
function H(e) {
	return typeof e == "string";
}
function dt(e) {
	return Ft.call(e) === "[object String]";
}
function ft(e) {
	return typeof e == "number";
}
function U(e) {
	var t = typeof e;
	return t === "function" || !!e && t === "object";
}
function pt(e) {
	return !!Nt[Ft.call(e)];
}
function mt(e) {
	return !!Pt[Ft.call(e)];
}
function ht(e) {
	return typeof e == "object" && typeof e.nodeType == "number" && typeof e.ownerDocument == "object";
}
function gt(e) {
	return e.colorStops != null;
}
function _t(e) {
	return e.image != null;
}
function vt(e) {
	return Ft.call(e) === "[object RegExp]";
}
function yt(e) {
	return e !== e;
}
function bt() {
	for (var e = [...arguments], t = 0, n = e.length; t < n; t++) if (e[t] != null) return e[t];
}
function W(e, t) {
	return e ?? t;
}
function xt(e, t, n) {
	return e ?? t ?? n;
}
function St(e) {
	var t = [...arguments].slice(1);
	return zt.apply(e, t);
}
function Ct(e) {
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
function G(e, t) {
	if (!e) throw Error(t);
}
function wt(e) {
	return e == null ? null : typeof e.trim == "function" ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
}
function Tt(e) {
	e[qt] = !0;
}
function Et(e) {
	return e[qt];
}
function Dt() {
	return Yt ? /* @__PURE__ */ new Map() : new Jt();
}
function K(e) {
	return new Xt(e);
}
function Ot(e, t) {
	for (var n = new e.constructor(e.length + t.length), r = 0; r < e.length; r++) n[r] = e[r];
	for (var i = e.length, r = 0; r < t.length; r++) n[r + i] = t[r];
	return n;
}
function kt(e, t) {
	var n;
	if (Object.create) n = Object.create(e);
	else {
		var r = function() {};
		r.prototype = e, n = new r();
	}
	return t && L(n, t), n;
}
function At(e) {
	var t = e.style;
	t.webkitUserSelect = "none", t.userSelect = "none", t.webkitTapHighlightColor = "rgba(0,0,0,0)", t["-webkit-touch-callout"] = "none";
}
function jt(e, t) {
	return e.hasOwnProperty(t);
}
function Mt() {}
var Nt, Pt, Ft, It, Lt, Rt, zt, Bt, Vt, Ht, Ut, Wt, Gt, Kt, qt, Jt, Yt, Xt, Zt, q = M((() => {
	Ye(), Nt = at([
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
	}, {}), Pt = at([
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
	}, {}), Ft = Object.prototype.toString, It = Array.prototype, Lt = It.forEach, Rt = It.filter, zt = It.slice, Bt = It.map, Vt = function() {}.constructor, Ht = Vt ? Vt.prototype : null, Ut = "__proto__", Wt = 2311, Gt = 2 ** 53 - 1, Je.createCanvas, Kt = Ht && V(Ht.bind) ? Ht.call.bind(Ht.bind) : lt, qt = "__ec_primitive__", Jt = function() {
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
			return ct(this.data);
		}, e.prototype.forEach = function(e) {
			var t = this.data;
			for (var n in t) t.hasOwnProperty(n) && e(t[n], n);
		}, e;
	}(), Yt = typeof Map == "function", Xt = function() {
		function e(t) {
			var n = B(t);
			this.data = Dt();
			var r = this;
			t instanceof e ? t.each(i) : t && R(t, i);
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
			return Yt ? Array.from(e) : e;
		}, e.prototype.removeKey = function(e) {
			this.data.delete(e);
		}, e;
	}(), Zt = 180 / Math.PI;
}));
//#endregion
//#region node_modules/zrender/lib/core/env.js
function Qt(e, t) {
	var n = t.browser, r = e.match(/Firefox\/([\d.]+)/), i = e.match(/MSIE\s([\d.]+)/) || e.match(/Trident\/.+?rv:(([\d.]+))/), a = e.match(/Edge?\/([\d.]+)/), o = /micromessenger/i.test(e);
	if (r && (n.firefox = !0, n.version = r[1]), i && (n.ie = !0, n.version = i[1]), a && (n.edge = !0, n.version = a[1], n.newEdge = +a[1].split(".")[0] > 18), o && (n.weChat = !0), t.svgSupported = typeof SVGRect < "u", t.touchEventsSupported = "ontouchstart" in window && !n.ie && !n.edge, t.pointerEventsSupported = "onpointerdown" in window && (n.edge || n.ie && +n.version >= 11), t.domSupported = typeof document < "u") {
		var s = document.documentElement.style;
		t.transform3dSupported = (n.ie && "transition" in s || n.edge || "WebKitCSSMatrix" in window && "m11" in new WebKitCSSMatrix() || "MozPerspective" in s) && !("OTransition" in s), t.transformSupported = t.transform3dSupported || n.ie && +n.version >= 9;
	}
}
var $t, J, en = M((() => {
	$t = function() {
		function e() {
			this.firefox = !1, this.ie = !1, this.edge = !1, this.newEdge = !1, this.weChat = !1;
		}
		return e;
	}(), J = new (function() {
		function e() {
			this.browser = new $t(), this.node = !1, this.wxa = !1, this.worker = !1, this.svgSupported = !1, this.touchEventsSupported = !1, this.pointerEventsSupported = !1, this.domSupported = !1, this.transformSupported = !1, this.transform3dSupported = !1, this.hasGlobalWindow = typeof window < "u";
		}
		return e;
	}())(), typeof wx == "object" && typeof wx.getSystemInfoSync == "function" ? (J.wxa = !0, J.touchEventsSupported = !0) : typeof document > "u" && typeof self < "u" ? J.worker = !0 : !J.hasGlobalWindow || "Deno" in window || typeof navigator < "u" && typeof navigator.userAgent == "string" && navigator.userAgent.indexOf("Node.js") > -1 ? (J.node = !0, J.svgSupported = !0) : Qt(navigator.userAgent, J);
}));
//#endregion
//#region node_modules/echarts/lib/util/clazz.js
function tn(e) {
	var t = {
		main: "",
		sub: ""
	};
	if (e) {
		var n = e.split(fn);
		t.main = n[0] || "", t.sub = n[1] || "";
	}
	return t;
}
function nn(e) {
	G(/^[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)?$/.test(e), "componentType \"" + e + "\" illegal");
}
function rn(e) {
	return !!(e && e[mn]);
}
function an(e, t) {
	e.$constructor = e, e.extend = function(e) {
		process.env.NODE_ENV !== "production" && R(t, function(t) {
			e[t] || console.warn("Method `" + t + "` should be implemented" + (e.type ? " in " + e.type : "") + ".");
		});
		var n = this, r;
		return on(n) ? r = function(e) {
			P(t, e);
			function t() {
				return e.apply(this, arguments) || this;
			}
			return t;
		}(n) : (r = function() {
			(e.$constructor || n).apply(this, arguments);
		}, nt(r, this)), L(r.prototype, e), r[mn] = !0, r.extend = this.extend, r.superCall = ln, r.superApply = un, r.superClass = n, r;
	};
}
function on(e) {
	return V(e) && /^class\s/.test(Function.prototype.toString.call(e));
}
function sn(e, t) {
	e.extend = t.extend;
}
function cn(e) {
	var t = ["__\0is_clz", hn++].join("_");
	e.prototype[t] = !0, process.env.NODE_ENV !== "production" && G(!e.isInstance, "The method \"is\" can not be defined."), e.isInstance = function(e) {
		return !!(e && e[t]);
	};
}
function ln(e, t) {
	var n = [...arguments].slice(2);
	return this.superClass.prototype[t].apply(e, n);
}
function un(e, t, n) {
	return this.superClass.prototype[t].apply(e, n);
}
function dn(e) {
	var t = {};
	e.registerClass = function(e) {
		var r = e.type || e.prototype.type;
		if (r) {
			nn(r), e.prototype.type = r;
			var i = tn(r);
			if (!i.sub) process.env.NODE_ENV !== "production" && t[i.main] && console.warn(i.main + " exists."), t[i.main] = e;
			else if (i.sub !== pn) {
				var a = n(i);
				a[i.sub] = e;
			}
		}
		return e;
	}, e.getClass = function(e, n, r) {
		var i = t[e];
		if (i && i[pn] && (i = n ? i[n] : null), r && !i) throw Error(n ? "Component " + e + "." + (n || "") + " is used but not imported." : e + ".type should be specified.");
		return i;
	}, e.getClassesByMainType = function(e) {
		var n = tn(e), r = [], i = t[n.main];
		return i && i[pn] ? R(i, function(e, t) {
			t !== pn && r.push(e);
		}) : r.push(i), r;
	}, e.hasClass = function(e) {
		return !!t[tn(e).main];
	}, e.getAllClassMainTypes = function() {
		var e = [];
		return R(t, function(t, n) {
			e.push(n);
		}), e;
	}, e.hasSubTypes = function(e) {
		var n = t[tn(e).main];
		return n && n[pn];
	};
	function n(e) {
		var n = t[e.main];
		return (!n || !n[pn]) && (n = t[e.main] = {}, n[pn] = !0), n;
	}
}
var fn, pn, mn, hn, gn = M((() => {
	F(), q(), fn = ".", pn = "___EC__COMPONENT__CONTAINER___", mn = "___EC__EXTENDED_CLASS___", hn = Math.round(Math.random() * 10);
}));
//#endregion
//#region node_modules/echarts/lib/model/mixin/makeStyleMapper.js
function _n(e, t) {
	for (var n = 0; n < e.length; n++) e[n][1] || (e[n][1] = e[n][0]);
	return t ||= !1, function(n, r, i) {
		for (var a = {}, o = 0; o < e.length; o++) {
			var s = e[o][1];
			if (!(r && tt(r, s) >= 0 || i && tt(i, s) < 0)) {
				var c = n.getShallow(s, t);
				c != null && (a[e[o][0]] = c);
			}
		}
		return a;
	};
}
var vn = M((() => {
	q();
})), yn, bn, xn, Sn = M((() => {
	vn(), yn = [
		["fill", "color"],
		["shadowBlur"],
		["shadowOffsetX"],
		["shadowOffsetY"],
		["opacity"],
		["shadowColor"]
	], bn = _n(yn), xn = function() {
		function e() {}
		return e.prototype.getAreaStyle = function(e, t) {
			return bn(this, e, t);
		}, e;
	}();
})), Cn, wn, Tn, En = M((() => {
	Cn = function() {
		function e(e) {
			this.value = e;
		}
		return e;
	}(), wn = function() {
		function e() {
			this._len = 0;
		}
		return e.prototype.insert = function(e) {
			var t = new Cn(e);
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
	}(), Tn = function() {
		function e(e) {
			this._list = new wn(), this._maxSize = 10, this._map = {}, this._maxSize = e;
		}
		return e.prototype.put = function(e, t) {
			var n = this._list, r = this._map, i = null;
			if (r[e] == null) {
				var a = n.len(), o = this._lastRemovedEntry;
				if (a >= this._maxSize && a > 0) {
					var s = n.head;
					n.remove(s), delete r[s.key], i = s.value, this._lastRemovedEntry = s;
				}
				o ? o.value = t : o = new Cn(t), o.key = e, n.insertEntry(o), r[e] = o;
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
function Dn(e) {
	if (typeof e == "string") {
		var t = jn.get(e);
		return t && t.image;
	}
	return e;
}
function On(e, t, n, r, i) {
	if (!e) return t;
	if (typeof e == "string") {
		if (t && t.__zrImageSrc === e || !n) return t;
		var a = jn.get(e), o = {
			hostEl: n,
			cb: r,
			cbPayload: i
		};
		return a ? (t = a.image, !An(t) && a.pending.push(o)) : (t = Je.loadImage(e, kn, kn), t.__zrImageSrc = e, jn.put(e, t.__cachedImgObj = {
			image: t,
			pending: [o]
		})), t;
	}
	return e;
}
function kn() {
	var e = this.__cachedImgObj;
	this.onload = this.onerror = this.__cachedImgObj = null;
	for (var t = 0; t < e.pending.length; t++) {
		var n = e.pending[t], r = n.cb;
		r && r(this, n.cbPayload), n.hostEl.dirty();
	}
	e.pending.length = 0;
}
function An(e) {
	return e && e.width && e.height;
}
var jn, Mn = M((() => {
	En(), Ye(), jn = new Tn(50);
}));
//#endregion
//#region node_modules/zrender/lib/core/matrix.js
function Nn() {
	return [
		1,
		0,
		0,
		1,
		0,
		0
	];
}
function Pn(e) {
	return e[0] = 1, e[1] = 0, e[2] = 0, e[3] = 1, e[4] = 0, e[5] = 0, e;
}
function Fn(e, t) {
	return e[0] = t[0], e[1] = t[1], e[2] = t[2], e[3] = t[3], e[4] = t[4], e[5] = t[5], e;
}
function In(e, t, n) {
	var r = t[0] * n[0] + t[2] * n[1], i = t[1] * n[0] + t[3] * n[1], a = t[0] * n[2] + t[2] * n[3], o = t[1] * n[2] + t[3] * n[3], s = t[0] * n[4] + t[2] * n[5] + t[4], c = t[1] * n[4] + t[3] * n[5] + t[5];
	return e[0] = r, e[1] = i, e[2] = a, e[3] = o, e[4] = s, e[5] = c, e;
}
function Ln(e, t, n) {
	return e[0] = t[0], e[1] = t[1], e[2] = t[2], e[3] = t[3], e[4] = t[4] + n[0], e[5] = t[5] + n[1], e;
}
function Rn(e, t, n, r) {
	r === void 0 && (r = [0, 0]);
	var i = t[0], a = t[2], o = t[4], s = t[1], c = t[3], l = t[5], u = Math.sin(n), d = Math.cos(n);
	return e[0] = i * d + s * u, e[1] = -i * u + s * d, e[2] = a * d + c * u, e[3] = -a * u + d * c, e[4] = d * (o - r[0]) + u * (l - r[1]) + r[0], e[5] = d * (l - r[1]) - u * (o - r[0]) + r[1], e;
}
function zn(e, t, n) {
	var r = n[0], i = n[1];
	return e[0] = t[0] * r, e[1] = t[1] * i, e[2] = t[2] * r, e[3] = t[3] * i, e[4] = t[4] * r, e[5] = t[5] * i, e;
}
function Bn(e, t) {
	var n = t[0], r = t[2], i = t[4], a = t[1], o = t[3], s = t[5], c = n * o - a * r;
	return c ? (c = 1 / c, e[0] = o * c, e[1] = -a * c, e[2] = -r * c, e[3] = n * c, e[4] = (r * s - o * i) * c, e[5] = (a * i - n * s) * c, e) : null;
}
var Vn = M((() => {}));
//#endregion
//#region node_modules/zrender/lib/core/vector.js
function Hn(e, t) {
	return e ??= 0, t ??= 0, [e, t];
}
function Un(e) {
	return [e[0], e[1]];
}
function Wn(e, t, n) {
	return e[0] = t, e[1] = n, e;
}
function Gn(e, t, n) {
	return e[0] = t[0] + n[0], e[1] = t[1] + n[1], e;
}
function Kn(e, t, n) {
	return e[0] = t[0] - n[0], e[1] = t[1] - n[1], e;
}
function qn(e) {
	return Math.sqrt(Jn(e));
}
function Jn(e) {
	return e[0] * e[0] + e[1] * e[1];
}
function Yn(e, t, n) {
	return e[0] = t[0] * n, e[1] = t[1] * n, e;
}
function Xn(e, t) {
	var n = qn(t);
	return n === 0 ? (e[0] = 0, e[1] = 0) : (e[0] = t[0] / n, e[1] = t[1] / n), e;
}
function Zn(e, t) {
	return Math.sqrt((e[0] - t[0]) * (e[0] - t[0]) + (e[1] - t[1]) * (e[1] - t[1]));
}
function Qn(e, t) {
	return (e[0] - t[0]) * (e[0] - t[0]) + (e[1] - t[1]) * (e[1] - t[1]);
}
function $n(e, t, n) {
	var r = t[0], i = t[1];
	return e[0] = n[0] * r + n[2] * i + n[4], e[1] = n[1] * r + n[3] * i + n[5], e;
}
function er(e, t, n) {
	return e[0] = Math.min(t[0], n[0]), e[1] = Math.min(t[1], n[1]), e;
}
function tr(e, t, n) {
	return e[0] = Math.max(t[0], n[0]), e[1] = Math.max(t[1], n[1]), e;
}
var nr, rr, ir = M((() => {
	nr = Zn, rr = Qn;
})), ar, or = M((() => {
	ar = function() {
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
function sr(e, t, n, r, i, a, o, s) {
	var c = dr(t - n), l = dr(r - e), u = lr(c, l), d = fr[i], f = fr[1 - i], p = pr[i];
	t < n || r < e ? c < l ? (a && (br[d] = -c), s && (o[d] = t, o[p] = 0)) : (a && (br[d] = l), s && (o[d] = e, o[p] = 0)) : (o && (o[d] = ur(e, n), o[p] = lr(t, r) - o[d]), a && (u < xr[0] || vr.useDir) && (xr[0] = lr(u, xr[0]), (c < l || !vr.bidirectional) && (yr[d] = c, yr[f] = 0, vr.useDir && vr.calcDirMTV()), (c >= l || !vr.bidirectional) && (yr[d] = -l, yr[f] = 0, vr.useDir && vr.calcDirMTV())));
}
function cr() {
	var e = 0, t = new ar(), n = new ar(), r = {
		minTv: new ar(),
		maxTv: new ar(),
		useDir: !1,
		dirMinTv: new ar(),
		touchThreshold: 0,
		bidirectional: !0,
		negativeSize: !1,
		reset: function(i, a) {
			r.touchThreshold = 0, i && i.touchThreshold != null && (r.touchThreshold = ur(0, i.touchThreshold)), r.negativeSize = !1, a && (r.minTv.set(Infinity, Infinity), r.maxTv.set(0, 0), r.useDir = !1, i && i.direction != null && (r.useDir = !0, r.dirMinTv.copy(r.minTv), n.copy(r.minTv), e = i.direction, r.bidirectional = i.bidirectional == null || !!i.bidirectional, r.bidirectional || t.set(Math.cos(e), Math.sin(e))));
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
		return dr(e) < 1e-10;
	}
	return r;
}
var lr, ur, dr, fr, pr, mr, hr, gr, _r, vr, yr, br, xr, Y, Sr, Cr, wr, Tr, Er, Dr, Or = M((() => {
	Vn(), ir(), or(), lr = Math.min, ur = Math.max, dr = Math.abs, fr = ["x", "y"], pr = ["width", "height"], mr = new ar(), hr = new ar(), gr = new ar(), _r = new ar(), vr = cr(), yr = vr.minTv, br = vr.maxTv, xr = [0, 0], Y = function() {
		function e(e, t, n, r) {
			Sr(this, e, t, n, r);
		}
		return e.set = function(e, t, n, r, i) {
			return r < 0 && (t += r, r = -r), i < 0 && (n += i, i = -i), e.x = t, e.y = n, e.width = r, e.height = i, e;
		}, e.prototype.union = function(e) {
			var t = lr(e.x, this.x), n = lr(e.y, this.y);
			this.width = isFinite(this.x) && isFinite(this.width) ? ur(e.x + e.width, this.x + this.width) - t : e.width, this.height = isFinite(this.y) && isFinite(this.height) ? ur(e.y + e.height, this.y + this.height) - n : e.height, this.x = t, this.y = n;
		}, e.prototype.applyTransform = function(t) {
			e.applyTransform(this, this, t);
		}, e.prototype.calculateTransform = function(e) {
			return wr(Nn(), this, e);
		}, e.prototype.intersect = function(t, n, r) {
			return e.intersect(this, t, n, r);
		}, e.intersect = function(t, n, r, i) {
			r && ar.set(r, 0, 0);
			var a = i && i.outIntersectRect || null, o = i && i.clamp;
			if (a && (a.x = a.y = a.width = a.height = NaN), !t || !n) return !1;
			t instanceof e || (t = Sr(Tr, t.x, t.y, t.width, t.height)), n instanceof e || (n = Sr(Er, n.x, n.y, n.width, n.height));
			var s = !!r;
			vr.reset(i, s);
			var c = vr.touchThreshold, l = t.x + c, u = t.x + t.width - c, d = t.y + c, f = t.y + t.height - c, p = n.x + c, m = n.x + n.width - c, h = n.y + c, g = n.y + n.height - c;
			if (l > u || d > f || p > m || h > g) return !1;
			var _ = !(u < p || m < l || f < h || g < d);
			return (s || a) && (xr[0] = Infinity, xr[1] = 0, sr(l, u, p, m, 0, s, a, o), sr(d, f, h, g, 1, s, a, o), s && ar.copy(r, _ ? vr.useDir ? vr.dirMinTv : yr : br)), _;
		}, e.contain = function(e, t, n) {
			return t >= e.x && t <= e.x + e.width && n >= e.y && n <= e.y + e.height;
		}, e.prototype.contain = function(t, n) {
			return e.contain(this, t, n);
		}, e.prototype.clone = function() {
			return new e(this.x, this.y, this.width, this.height);
		}, e.prototype.copy = function(e) {
			Cr(this, e);
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
				e !== t && Cr(e, t);
				return;
			}
			if (n[1] < 1e-5 && n[1] > -1e-5 && n[2] < 1e-5 && n[2] > -1e-5) {
				var r = n[0], i = n[3], a = n[4], o = n[5];
				e.x = t.x * r + a, e.y = t.y * i + o, e.width = t.width * r, e.height = t.height * i, e.width < 0 && (e.x += e.width, e.width = -e.width), e.height < 0 && (e.y += e.height, e.height = -e.height);
				return;
			}
			mr.x = gr.x = t.x, mr.y = _r.y = t.y, hr.x = _r.x = t.x + t.width, hr.y = gr.y = t.y + t.height, mr.transform(n), _r.transform(n), hr.transform(n), gr.transform(n), e.x = lr(mr.x, hr.x, gr.x, _r.x), e.y = lr(mr.y, hr.y, gr.y, _r.y);
			var s = ur(mr.x, hr.x, gr.x, _r.x), c = ur(mr.y, hr.y, gr.y, _r.y);
			e.width = s - e.x, e.height = c - e.y;
		}, e.calculateTransform = function(e, t, n) {
			var r = n.width / t.width, i = n.height / t.height;
			return e = Pn(e || []), Ln(e, e, Wn(Dr, -t.x, -t.y)), zn(e, e, Wn(Dr, r, i)), Ln(e, e, Wn(Dr, n.x, n.y)), e;
		}, e;
	}(), Y.create, Sr = Y.set, Cr = Y.copy, wr = Y.calculateTransform, Y.applyTransform, Y.contain, Tr = new Y(0, 0, 0, 0), Er = new Y(0, 0, 0, 0), Dr = [];
}));
//#endregion
//#region node_modules/zrender/lib/contain/text.js
function kr(e) {
	Br ||= new Tn(100), e ||= "12px sans-serif";
	var t = Br.get(e);
	return t || (t = {
		font: e,
		strWidthCache: new Tn(500),
		asciiWidthMap: null,
		asciiWidthMapTried: !1,
		stWideCharWidth: Je.measureText("国", e).width,
		asciiCharWidth: Je.measureText("a", e).width
	}, Br.put(e, t)), t;
}
function Ar(e) {
	if (!(Vr >= Hr)) {
		e ||= "12px sans-serif";
		for (var t = [], n = +/* @__PURE__ */ new Date(), r = 0; r <= 127; r++) t[r] = Je.measureText(String.fromCharCode(r), e).width;
		var i = +/* @__PURE__ */ new Date() - n;
		return i > 16 ? Vr = Hr : i > 2 && Vr++, t;
	}
}
function jr(e, t) {
	return e.asciiWidthMapTried ||= (e.asciiWidthMap = Ar(e.font), !0), 0 <= t && t <= 127 ? e.asciiWidthMap == null ? e.asciiCharWidth : e.asciiWidthMap[t] : e.stWideCharWidth;
}
function Mr(e, t) {
	var n = e.strWidthCache, r = n.get(t);
	return r ?? (r = Je.measureText(t, e.font).width, n.put(t, r)), r;
}
function Nr(e, t, n, r) {
	var i = Mr(kr(t), e), a = Lr(t), o = Fr(0, i, n), s = Ir(0, a, r);
	return new Y(o, s, i, a);
}
function Pr(e, t, n, r) {
	var i = ((e || "") + "").split("\n");
	if (i.length === 1) return Nr(i[0], t, n, r);
	for (var a = new Y(0, 0, 0, 0), o = 0; o < i.length; o++) {
		var s = Nr(i[o], t, n, r);
		o === 0 ? a.copy(s) : a.union(s);
	}
	return a;
}
function Fr(e, t, n, r) {
	return n === "right" ? r ? e += t : e -= t : n === "center" && (r ? e += t / 2 : e -= t / 2), e;
}
function Ir(e, t, n, r) {
	return n === "middle" ? r ? e += t / 2 : e -= t / 2 : n === "bottom" && (r ? e += t : e -= t), e;
}
function Lr(e) {
	return kr(e).stWideCharWidth;
}
function Rr(e, t) {
	return typeof e == "string" ? e.lastIndexOf("%") >= 0 ? parseFloat(e) / 100 * t : parseFloat(e) : e;
}
function zr(e, t, n) {
	var r = t.position || "inside", i = t.distance == null ? 5 : t.distance, a = n.height, o = n.width, s = a / 2, c = n.x, l = n.y, u = "left", d = "top";
	if (r instanceof Array) c += Rr(r[0], n.width), l += Rr(r[1], n.height), u = null, d = null;
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
var Br, Vr, Hr, Ur = M((() => {
	Or(), En(), Ye(), Vr = 0, Hr = 5;
}));
//#endregion
//#region node_modules/zrender/lib/graphic/helper/parseText.js
function Wr(e, t, n, r, i, a) {
	if (!n) {
		e.text = "", e.isTruncated = !1;
		return;
	}
	var o = (t + "").split("\n");
	a = Gr(n, r, i, a);
	for (var s = !1, c = {}, l = 0, u = o.length; l < u; l++) Kr(c, o[l], a), o[l] = c.textLine, s ||= c.isTruncated;
	e.text = o.join("\n"), e.isTruncated = s;
}
function Gr(e, t, n, r) {
	r ||= {};
	var i = L({}, r);
	n = W(n, "..."), i.maxIterations = W(r.maxIterations, 2);
	var a = i.minChar = W(r.minChar, 0), o = i.fontMeasureInfo = kr(t), s = o.asciiCharWidth;
	i.placeholder = W(r.placeholder, "");
	for (var c = e = Math.max(0, e - 1), l = 0; l < a && c >= s; l++) c -= s;
	var u = Mr(o, n);
	return u > c && (n = "", u = 0), c = e - u, i.ellipsis = n, i.ellipsisWidth = u, i.contentWidth = c, i.containerWidth = e, i;
}
function Kr(e, t, n) {
	var r = n.containerWidth, i = n.contentWidth, a = n.fontMeasureInfo;
	if (!r) {
		e.textLine = "", e.isTruncated = !1;
		return;
	}
	var o = Mr(a, t);
	if (o <= r) {
		e.textLine = t, e.isTruncated = !1;
		return;
	}
	for (var s = 0;; s++) {
		if (o <= i || s >= n.maxIterations) {
			t += n.ellipsis;
			break;
		}
		var c = s === 0 ? qr(t, i, a) : o > 0 ? Math.floor(t.length * i / o) : 0;
		t = t.substr(0, c), o = Mr(a, t);
	}
	t === "" && (t = n.placeholder), e.textLine = t, e.isTruncated = !0;
}
function qr(e, t, n) {
	for (var r = 0, i = 0, a = e.length; i < a && r < t; i++) r += jr(n, e.charCodeAt(i));
	return i;
}
function Jr(e, t, n, r) {
	var i = ti(e), a = t.overflow, o = t.padding, s = o ? o[1] + o[3] : 0, c = o ? o[0] + o[2] : 0, l = t.font, u = a === "truncate", d = Lr(l), f = W(t.lineHeight, d), p = t.lineOverflow === "truncate", m = !1, h = t.width;
	h == null && n != null && (h = n - s);
	var g = t.height;
	g == null && r != null && (g = r - c);
	var _ = h != null && (a === "break" || a === "breakAll") ? i ? $r(i, t.font, h, a === "breakAll", 0).lines : [] : i ? i.split("\n") : [], v = _.length * f;
	if (g ??= v, v > g && p) {
		var y = Math.floor(g / f);
		m ||= _.length > y, _ = _.slice(0, y), v = _.length * f;
	}
	if (i && u && h != null) for (var b = Gr(h, l, t.ellipsis, {
		minChar: t.truncateMinChar,
		placeholder: t.placeholder
	}), x = {}, S = 0; S < _.length; S++) Kr(x, _[S], b), _[S] = x.textLine, m ||= x.isTruncated;
	for (var C = g, w = 0, T = kr(l), S = 0; S < _.length; S++) w = Math.max(Mr(T, _[S]), w);
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
function Yr(e, t, n, r, i) {
	var a = new ci(), o = ti(e);
	if (!o) return a;
	var s = t.padding, c = s ? s[1] + s[3] : 0, l = s ? s[0] + s[2] : 0, u = t.width;
	u == null && n != null && (u = n - c);
	var d = t.height;
	d == null && r != null && (d = r - l);
	for (var f = t.overflow, p = (f === "break" || f === "breakAll") && u != null ? {
		width: u,
		accumWidth: 0,
		breakAll: f === "breakAll"
	} : null, m = ai.lastIndex = 0, h; (h = ai.exec(o)) != null;) {
		var g = h.index;
		g > m && Xr(a, o.substring(m, g), t, p), Xr(a, h[2], t, p, h[1]), m = ai.lastIndex;
	}
	m < o.length && Xr(a, o.substring(m, o.length), t, p);
	var _ = [], v = 0, y = 0, b = f === "truncate", x = t.lineOverflow === "truncate", S = {};
	function C(e, t, n) {
		e.width = t, e.lineHeight = n, v += n, y = Math.max(y, t);
	}
	outer: for (var w = 0; w < a.lines.length; w++) {
		for (var T = a.lines[w], E = 0, D = 0, O = 0; O < T.tokens.length; O++) {
			var k = T.tokens[O], A = k.styleName && t.rich[k.styleName] || {}, j = k.textPadding = A.padding, ee = j ? j[1] + j[3] : 0, te = k.font = A.font || t.font;
			k.contentHeight = Lr(te);
			var ne = W(A.height, k.contentHeight);
			if (k.innerHeight = ne, j && (ne += j[0] + j[2]), k.height = ne, k.lineHeight = xt(A.lineHeight, t.lineHeight, ne), k.align = A && A.align || i, k.verticalAlign = A && A.verticalAlign || "middle", x && d != null && v + k.lineHeight > d) {
				var re = a.lines.length;
				O > 0 ? (T.tokens = T.tokens.slice(0, O), C(T, D, E), a.lines = a.lines.slice(0, w + 1)) : a.lines = a.lines.slice(0, w), a.isTruncated = a.isTruncated || a.lines.length < re;
				break outer;
			}
			var ie = A.width, ae = ie == null || ie === "auto";
			if (typeof ie == "string" && ie.charAt(ie.length - 1) === "%") k.percentWidth = ie, _.push(k), k.contentWidth = Mr(kr(te), k.text);
			else {
				if (ae) {
					var oe = A.backgroundColor, se = oe && oe.image;
					se && (se = Dn(se), An(se) && (k.width = Math.max(k.width, se.width * ne / se.height)));
				}
				var M = b && u != null ? u - D : null;
				M != null && M < k.width ? !ae || M < ee ? (k.text = "", k.width = k.contentWidth = 0) : (Wr(S, k.text, M - ee, te, t.ellipsis, { minChar: t.truncateMinChar }), k.text = S.text, a.isTruncated = a.isTruncated || S.isTruncated, k.width = k.contentWidth = Mr(kr(te), k.text)) : k.contentWidth = Mr(kr(te), k.text);
			}
			k.width += ee, D += k.width, A && (E = Math.max(E, k.lineHeight));
		}
		C(T, D, E);
	}
	a.outerWidth = a.width = W(u, y), a.outerHeight = a.height = W(d, v), a.contentHeight = v, a.contentWidth = y, a.outerWidth += c, a.outerHeight += l;
	for (var w = 0; w < _.length; w++) {
		var k = _[w], ce = k.percentWidth;
		k.width = parseInt(ce, 10) / 100 * a.width;
	}
	return a;
}
function Xr(e, t, n, r, i) {
	var a = t === "", o = i && n.rich[i] || {}, s = e.lines, c = o.font || n.font, l = !1, u, d;
	if (r) {
		var f = o.padding, p = f ? f[1] + f[3] : 0;
		if (o.width != null && o.width !== "auto") {
			var m = Rr(o.width, r.width) + p;
			s.length > 0 && m + r.accumWidth > r.width && (u = t.split("\n"), l = !0), r.accumWidth = m;
		} else {
			var h = $r(t, c, r.width, r.breakAll, r.accumWidth);
			r.accumWidth = h.accumWidth + p, d = h.linesWidths, u = h.lines;
		}
	}
	u ||= t.split("\n");
	for (var g = kr(c), _ = 0; _ < u.length; _++) {
		var v = u[_], y = new oi();
		if (y.styleName = i, y.text = v, y.isLineHolder = !v && !a, y.width = typeof o.width == "number" ? o.width : d ? d[_] : Mr(g, v), !_ && !l) {
			var b = (s[s.length - 1] || (s[0] = new si())).tokens, x = b.length;
			x === 1 && b[0].isLineHolder ? b[0] = y : (v || !x || a) && b.push(y);
		} else s.push(new si([y]));
	}
}
function Zr(e) {
	var t = e.charCodeAt(0);
	return t >= 32 && t <= 591 || t >= 880 && t <= 4351 || t >= 4608 && t <= 5119 || t >= 7680 && t <= 8303;
}
function Qr(e) {
	return !Zr(e) || !!li[e];
}
function $r(e, t, n, r, i) {
	for (var a = [], o = [], s = "", c = "", l = 0, u = 0, d = kr(t), f = 0; f < e.length; f++) {
		var p = e.charAt(f);
		if (p === "\n") {
			c && (s += c, u += l), a.push(s), o.push(u), s = "", c = "", l = 0, u = 0;
			continue;
		}
		var m = jr(d, p.charCodeAt(0)), h = !r && !Qr(p);
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
function ei(e, t, n, r, i, a) {
	if (e.baseX = n, e.baseY = r, e.outerWidth = e.outerHeight = null, t) {
		var o = t.width * 2, s = t.height * 2;
		Y.set(ui, Fr(n, o, i), Ir(r, s, a), o, s), Y.intersect(t, ui, null, di);
		var c = di.outIntersectRect;
		e.outerWidth = c.width, e.outerHeight = c.height, e.baseX = Fr(c.x, c.width, i, !0), e.baseY = Ir(c.y, c.height, a, !0);
	}
}
function ti(e) {
	return e == null ? e = "" : e += "";
}
function ni(e) {
	var t = ti(e.text), n = e.font;
	return ri(e, Mr(kr(n), t), Lr(n), null);
}
function ri(e, t, n, r) {
	var i = new Y(Fr(e.x || 0, t, e.textAlign), Ir(e.y || 0, n, e.textBaseline), t, n), a = r ?? (ii(e) ? e.lineWidth : 0);
	return a > 0 && (i.x -= a / 2, i.y -= a / 2, i.width += a, i.height += a), i;
}
function ii(e) {
	var t = e.stroke;
	return t != null && t !== "none" && e.lineWidth > 0;
}
var ai, oi, si, ci, li, ui, di, fi = M((() => {
	Mn(), q(), Ur(), Or(), ai = /\{([a-zA-Z0-9_]+)\|([^}]*)\}/g, oi = function() {
		function e() {}
		return e;
	}(), si = function() {
		function e(e) {
			this.tokens = [], e && (this.tokens = e);
		}
		return e;
	}(), ci = function() {
		function e() {
			this.width = 0, this.height = 0, this.contentWidth = 0, this.contentHeight = 0, this.outerWidth = 0, this.outerHeight = 0, this.lines = [], this.isTruncated = !1;
		}
		return e;
	}(), li = at(",&?/;] ".split(""), function(e, t) {
		return e[t] = !0, e;
	}, {}), ui = new Y(0, 0, 0, 0), di = {
		outIntersectRect: {},
		clamp: !0
	};
}));
//#endregion
//#region node_modules/zrender/lib/core/Transformable.js
function pi(e) {
	return e > gi || e < -gi;
}
function mi(e, t) {
	return $e(e, t, Ci);
}
var hi, gi, _i, vi, yi, bi, xi, Si, Ci, wi = M((() => {
	Vn(), q(), ir(), hi = Pn, gi = 5e-5, _i = [], vi = [], yi = Nn(), bi = Math.abs, xi = function() {
		function e() {}
		return e.prototype.getLocalTransform = function(e) {
			return Si(this, e);
		}, e.prototype.setPosition = function(e) {
			this.x = e[0], this.y = e[1];
		}, e.prototype.setScale = function(e) {
			this.scaleX = e[0], this.scaleY = e[1];
		}, e.prototype.setSkew = function(e) {
			this.skewX = e[0], this.skewY = e[1];
		}, e.prototype.setOrigin = function(e) {
			this.originX = e[0], this.originY = e[1];
		}, e.prototype.needLocalTransform = function() {
			return pi(this.rotation) || pi(this.x) || pi(this.y) || pi(this.scaleX - 1) || pi(this.scaleY - 1) || pi(this.skewX) || pi(this.skewY);
		}, e.prototype.updateTransform = function() {
			var e = this.parent && this.parent.transform, t = this.needLocalTransform(), n = this.transform;
			if (!(t || e)) {
				n && (hi(n), this.invTransform = null);
				return;
			}
			n ||= Nn(), t ? this.getLocalTransform(n) : hi(n), e && (t ? In(n, e, n) : Fn(n, e)), this.transform = n, this._resolveGlobalScaleRatio(n), this.invTransform = this.invTransform || Nn(), Bn(this.invTransform, n);
		}, e.prototype._resolveGlobalScaleRatio = function(e) {
			var t = this.globalScaleRatio;
			if (t != null && t !== 1) {
				this.getGlobalScale(_i);
				var n = _i[0] < 0 ? -1 : 1, r = _i[1] < 0 ? -1 : 1, i = ((_i[0] - n) * t + n) / _i[0] || 0, a = ((_i[1] - r) * t + r) / _i[1] || 0;
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
				e && e.transform && (e.invTransform = e.invTransform || Nn(), In(vi, e.invTransform, t), t = vi);
				var n = this.originX, r = this.originY;
				(n || r) && (yi[4] = n, yi[5] = r, In(vi, t, yi), vi[4] -= n, vi[5] -= r, t = vi), this.setLocalTransform(t);
			}
		}, e.prototype.getGlobalScale = function(e) {
			var t = this.transform;
			return e ||= [], t ? (e[0] = Math.sqrt(t[0] * t[0] + t[1] * t[1]), e[1] = Math.sqrt(t[2] * t[2] + t[3] * t[3]), t[0] < 0 && (e[0] = -e[0]), t[3] < 0 && (e[1] = -e[1]), e) : (e[0] = 1, e[1] = 1, e);
		}, e.prototype.transformCoordToLocal = function(e, t) {
			var n = [e, t], r = this.invTransform;
			return r && $n(n, n, r), n;
		}, e.prototype.transformCoordToGlobal = function(e, t) {
			var n = [e, t], r = this.transform;
			return r && $n(n, n, r), n;
		}, e.prototype.getLineScale = function() {
			var e = this.transform;
			return e && bi(e[0] - 1) > 1e-10 && bi(e[3] - 1) > 1e-10 ? Math.sqrt(bi(e[0] * e[3] - e[2] * e[1])) : 1;
		}, e.prototype.copyTransform = function(e) {
			mi(this, e);
		}, e.getLocalTransform = function(e, t) {
			t ||= [];
			var n = e.originX || 0, r = e.originY || 0, i = e.scaleX, a = e.scaleY, o = e.anchorX, s = e.anchorY, c = e.rotation || 0, l = e.x, u = e.y, d = e.skewX ? Math.tan(e.skewX) : 0, f = e.skewY ? Math.tan(-e.skewY) : 0;
			if (n || r || o || s) {
				var p = n + o, m = r + s;
				t[4] = -p * i - d * m * a, t[5] = -m * a - f * p * i;
			} else t[4] = t[5] = 0;
			return t[0] = i, t[3] = a, t[1] = f * i, t[2] = d * a, c && Rn(t, t, c), t[4] += n + l, t[5] += r + u, t;
		}, e.initDefaultProps = (function() {
			var t = e.prototype;
			t.scaleX = t.scaleY = t.globalScaleRatio = 1, t.x = t.y = t.originX = t.originY = t.skewX = t.skewY = t.rotation = t.anchorX = t.anchorY = 0;
		})(), e;
	}(), Si = xi.getLocalTransform, Ci = [
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
})), Ti, Ei = M((() => {
	Ti = {
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
			return 1 - Ti.bounceOut(1 - e);
		},
		bounceOut: function(e) {
			return e < 1 / 2.75 ? 7.5625 * e * e : e < 2 / 2.75 ? 7.5625 * (e -= 1.5 / 2.75) * e + .75 : e < 2.5 / 2.75 ? 7.5625 * (e -= 2.25 / 2.75) * e + .9375 : 7.5625 * (e -= 2.625 / 2.75) * e + .984375;
		},
		bounceInOut: function(e) {
			return e < .5 ? Ti.bounceIn(e * 2) * .5 : Ti.bounceOut(e * 2 - 1) * .5 + .5;
		}
	};
}));
//#endregion
//#region node_modules/zrender/lib/core/curve.js
function Di(e) {
	return e > -Gi && e < Gi;
}
function Oi(e) {
	return e > Gi || e < -Gi;
}
function ki(e, t, n, r, i) {
	var a = 1 - i;
	return a * a * (a * e + 3 * i * t) + i * i * (i * r + 3 * a * n);
}
function Ai(e, t, n, r, i) {
	var a = 1 - i;
	return 3 * (((t - e) * a + 2 * (n - t) * i) * a + (r - n) * i * i);
}
function ji(e, t, n, r, i, a) {
	var o = r + 3 * (t - n) - e, s = 3 * (n - t * 2 + e), c = 3 * (t - e), l = e - i, u = s * s - 3 * o * c, d = s * c - 9 * o * l, f = c * c - 3 * s * l, p = 0;
	if (Di(u) && Di(d)) {
		if (Di(s)) a[0] = 0;
		else {
			var m = -c / s;
			m >= 0 && m <= 1 && (a[p++] = m);
		}
	} else {
		var h = d * d - 4 * u * f;
		if (Di(h)) {
			var g = d / u, m = -s / o + g, _ = -g / 2;
			m >= 0 && m <= 1 && (a[p++] = m), _ >= 0 && _ <= 1 && (a[p++] = _);
		} else if (h > 0) {
			var v = Wi(h), y = u * s + 1.5 * o * (-d + v), b = u * s + 1.5 * o * (-d - v);
			y = y < 0 ? -Ui(-y, Ji) : Ui(y, Ji), b = b < 0 ? -Ui(-b, Ji) : Ui(b, Ji);
			var m = (-s - (y + b)) / (3 * o);
			m >= 0 && m <= 1 && (a[p++] = m);
		} else {
			var x = (2 * u * s - 3 * o * d) / (2 * Wi(u * u * u)), S = Math.acos(x) / 3, C = Wi(u), w = Math.cos(S), m = (-s - 2 * C * w) / (3 * o), _ = (-s + C * (w + qi * Math.sin(S))) / (3 * o), T = (-s + C * (w - qi * Math.sin(S))) / (3 * o);
			m >= 0 && m <= 1 && (a[p++] = m), _ >= 0 && _ <= 1 && (a[p++] = _), T >= 0 && T <= 1 && (a[p++] = T);
		}
	}
	return p;
}
function Mi(e, t, n, r, i) {
	var a = 6 * n - 12 * t + 6 * e, o = 9 * t + 3 * r - 3 * e - 9 * n, s = 3 * t - 3 * e, c = 0;
	if (Di(o)) {
		if (Oi(a)) {
			var l = -s / a;
			l >= 0 && l <= 1 && (i[c++] = l);
		}
	} else {
		var u = a * a - 4 * o * s;
		if (Di(u)) i[0] = -a / (2 * o);
		else if (u > 0) {
			var d = Wi(u), l = (-a + d) / (2 * o), f = (-a - d) / (2 * o);
			l >= 0 && l <= 1 && (i[c++] = l), f >= 0 && f <= 1 && (i[c++] = f);
		}
	}
	return c;
}
function Ni(e, t, n, r, i, a) {
	var o = (t - e) * i + e, s = (n - t) * i + t, c = (r - n) * i + n, l = (s - o) * i + o, u = (c - s) * i + s, d = (u - l) * i + l;
	a[0] = e, a[1] = o, a[2] = l, a[3] = d, a[4] = d, a[5] = u, a[6] = c, a[7] = r;
}
function Pi(e, t, n, r, i, a, o, s, c, l, u) {
	var d, f = .005, p = Infinity, m, h, g, _;
	Yi[0] = c, Yi[1] = l;
	for (var v = 0; v < 1; v += .05) Xi[0] = ki(e, n, i, o, v), Xi[1] = ki(t, r, a, s, v), g = rr(Yi, Xi), g < p && (d = v, p = g);
	p = Infinity;
	for (var y = 0; y < 32 && !(f < Ki); y++) m = d - f, h = d + f, Xi[0] = ki(e, n, i, o, m), Xi[1] = ki(t, r, a, s, m), g = rr(Xi, Yi), m >= 0 && g < p ? (d = m, p = g) : (Zi[0] = ki(e, n, i, o, h), Zi[1] = ki(t, r, a, s, h), _ = rr(Zi, Yi), h <= 1 && _ < p ? (d = h, p = _) : f *= .5);
	return u && (u[0] = ki(e, n, i, o, d), u[1] = ki(t, r, a, s, d)), Wi(p);
}
function Fi(e, t, n, r, i, a, o, s, c) {
	for (var l = e, u = t, d = 0, f = 1 / c, p = 1; p <= c; p++) {
		var m = p * f, h = ki(e, n, i, o, m), g = ki(t, r, a, s, m), _ = h - l, v = g - u;
		d += Math.sqrt(_ * _ + v * v), l = h, u = g;
	}
	return d;
}
function Ii(e, t, n, r) {
	var i = 1 - r;
	return i * (i * e + 2 * r * t) + r * r * n;
}
function Li(e, t, n, r) {
	return 2 * ((1 - r) * (t - e) + r * (n - t));
}
function Ri(e, t, n, r, i) {
	var a = e - 2 * t + n, o = 2 * (t - e), s = e - r, c = 0;
	if (Di(a)) {
		if (Oi(o)) {
			var l = -s / o;
			l >= 0 && l <= 1 && (i[c++] = l);
		}
	} else {
		var u = o * o - 4 * a * s;
		if (Di(u)) {
			var l = -o / (2 * a);
			l >= 0 && l <= 1 && (i[c++] = l);
		} else if (u > 0) {
			var d = Wi(u), l = (-o + d) / (2 * a), f = (-o - d) / (2 * a);
			l >= 0 && l <= 1 && (i[c++] = l), f >= 0 && f <= 1 && (i[c++] = f);
		}
	}
	return c;
}
function zi(e, t, n) {
	var r = e + n - 2 * t;
	return r === 0 ? .5 : (e - t) / r;
}
function Bi(e, t, n, r, i) {
	var a = (t - e) * r + e, o = (n - t) * r + t, s = (o - a) * r + a;
	i[0] = e, i[1] = a, i[2] = s, i[3] = s, i[4] = o, i[5] = n;
}
function Vi(e, t, n, r, i, a, o, s, c) {
	var l, u = .005, d = Infinity;
	Yi[0] = o, Yi[1] = s;
	for (var f = 0; f < 1; f += .05) {
		Xi[0] = Ii(e, n, i, f), Xi[1] = Ii(t, r, a, f);
		var p = rr(Yi, Xi);
		p < d && (l = f, d = p);
	}
	d = Infinity;
	for (var m = 0; m < 32 && !(u < Ki); m++) {
		var h = l - u, g = l + u;
		Xi[0] = Ii(e, n, i, h), Xi[1] = Ii(t, r, a, h);
		var p = rr(Xi, Yi);
		if (h >= 0 && p < d) l = h, d = p;
		else {
			Zi[0] = Ii(e, n, i, g), Zi[1] = Ii(t, r, a, g);
			var _ = rr(Zi, Yi);
			g <= 1 && _ < d ? (l = g, d = _) : u *= .5;
		}
	}
	return c && (c[0] = Ii(e, n, i, l), c[1] = Ii(t, r, a, l)), Wi(d);
}
function Hi(e, t, n, r, i, a, o) {
	for (var s = e, c = t, l = 0, u = 1 / o, d = 1; d <= o; d++) {
		var f = d * u, p = Ii(e, n, i, f), m = Ii(t, r, a, f), h = p - s, g = m - c;
		l += Math.sqrt(h * h + g * g), s = p, c = m;
	}
	return l;
}
var Ui, Wi, Gi, Ki, qi, Ji, Yi, Xi, Zi, Qi = M((() => {
	ir(), Ui = Math.pow, Wi = Math.sqrt, Gi = 1e-8, Ki = 1e-4, qi = Wi(3), Ji = 1 / 3, Yi = Hn(), Xi = Hn(), Zi = Hn();
}));
//#endregion
//#region node_modules/zrender/lib/animation/cubicEasing.js
function $i(e) {
	var t = e && ea.exec(e);
	if (t) {
		var n = t[1].split(","), r = +wt(n[0]), i = +wt(n[1]), a = +wt(n[2]), o = +wt(n[3]);
		if (isNaN(r + i + a + o)) return;
		var s = [];
		return function(e) {
			return e <= 0 ? 0 : e >= 1 ? 1 : ji(0, r, a, 1, e, s) && ki(0, i, o, 1, s[0]);
		};
	}
}
var ea, ta = M((() => {
	Qi(), q(), ea = /cubic-bezier\(([0-9,\.e ]+)\)/;
})), na, ra = M((() => {
	Ei(), q(), ta(), na = function() {
		function e(e) {
			this._inited = !1, this._startTime = 0, this._pausedTime = 0, this._paused = !1, this._life = e.life || 1e3, this._delay = e.delay || 0, this.loop = e.loop || !1, this.onframe = e.onframe || Mt, this.ondestroy = e.ondestroy || Mt, this.onrestart = e.onrestart || Mt, e.easing && this.setEasing(e.easing);
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
			this.easing = e, this.easingFunc = V(e) ? e : Ti[e] || $i(e);
		}, e;
	}();
}));
//#endregion
//#region node_modules/zrender/lib/tool/color.js
function ia(e) {
	return e = Math.round(e), e < 0 ? 0 : e > 255 ? 255 : e;
}
function aa(e) {
	return e = Math.round(e), e < 0 ? 0 : e > 360 ? 360 : e;
}
function oa(e) {
	return e < 0 ? 0 : e > 1 ? 1 : e;
}
function sa(e) {
	var t = e;
	return t.length && t.charAt(t.length - 1) === "%" ? ia(parseFloat(t) / 100 * 255) : ia(parseInt(t, 10));
}
function ca(e) {
	var t = e;
	return t.length && t.charAt(t.length - 1) === "%" ? oa(parseFloat(t) / 100) : oa(parseFloat(t));
}
function la(e, t, n) {
	return n < 0 ? n += 1 : n > 1 && --n, n * 6 < 1 ? e + (t - e) * n * 6 : n * 2 < 1 ? t : n * 3 < 2 ? e + (t - e) * (2 / 3 - n) * 6 : e;
}
function ua(e, t, n) {
	return e + (t - e) * n;
}
function da(e, t, n, r, i) {
	return e[0] = t, e[1] = n, e[2] = r, e[3] = i, e;
}
function fa(e, t) {
	return e[0] = t[0], e[1] = t[1], e[2] = t[2], e[3] = t[3], e;
}
function pa(e, t) {
	Ta && fa(Ta, t), Ta = wa.put(e, Ta || t.slice());
}
function ma(e, t) {
	if (e) {
		t ||= [];
		var n = wa.get(e);
		if (n) return fa(t, n);
		e += "";
		var r = e.replace(/ /g, "").toLowerCase();
		if (r in Ca) return fa(t, Ca[r]), pa(e, t), t;
		var i = r.length;
		if (r.charAt(0) === "#") {
			if (i === 4 || i === 5) {
				var a = parseInt(r.slice(1, 4), 16);
				if (!(a >= 0 && a <= 4095)) {
					da(t, 0, 0, 0, 1);
					return;
				}
				return da(t, (a & 3840) >> 4 | (a & 3840) >> 8, a & 240 | (a & 240) >> 4, a & 15 | (a & 15) << 4, i === 5 ? parseInt(r.slice(4), 16) / 15 : 1), pa(e, t), t;
			}
			if (i === 7 || i === 9) {
				var a = parseInt(r.slice(1, 7), 16);
				if (!(a >= 0 && a <= 16777215)) {
					da(t, 0, 0, 0, 1);
					return;
				}
				return da(t, (a & 16711680) >> 16, (a & 65280) >> 8, a & 255, i === 9 ? parseInt(r.slice(7), 16) / 255 : 1), pa(e, t), t;
			}
			return;
		}
		var o = r.indexOf("("), s = r.indexOf(")");
		if (o !== -1 && s + 1 === i) {
			var c = r.substr(0, o), l = r.substr(o + 1, s - (o + 1)).split(","), u = 1;
			switch (c) {
				case "rgba":
					if (l.length !== 4) return l.length === 3 ? da(t, +l[0], +l[1], +l[2], 1) : da(t, 0, 0, 0, 1);
					u = ca(l.pop());
				case "rgb":
					if (l.length >= 3) return da(t, sa(l[0]), sa(l[1]), sa(l[2]), l.length === 3 ? u : ca(l[3])), pa(e, t), t;
					da(t, 0, 0, 0, 1);
					return;
				case "hsla":
					if (l.length !== 4) {
						da(t, 0, 0, 0, 1);
						return;
					}
					return l[3] = ca(l[3]), ha(l, t), pa(e, t), t;
				case "hsl":
					if (l.length !== 3) {
						da(t, 0, 0, 0, 1);
						return;
					}
					return ha(l, t), pa(e, t), t;
				default: return;
			}
		}
		da(t, 0, 0, 0, 1);
	}
}
function ha(e, t) {
	var n = (parseFloat(e[0]) % 360 + 360) % 360 / 360, r = ca(e[1]), i = ca(e[2]), a = i <= .5 ? i * (r + 1) : i + r - i * r, o = i * 2 - a;
	return t ||= [], da(t, ia(la(o, a, n + 1 / 3) * 255), ia(la(o, a, n) * 255), ia(la(o, a, n - 1 / 3) * 255), 1), e.length === 4 && (t[3] = e[3]), t;
}
function ga(e) {
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
function _a(e, t) {
	var n = ma(e);
	if (n) {
		for (var r = 0; r < 3; r++) t < 0 ? n[r] = n[r] * (1 - t) | 0 : n[r] = (255 - n[r]) * t + n[r] | 0, n[r] > 255 ? n[r] = 255 : n[r] < 0 && (n[r] = 0);
		return ba(n, n.length === 4 ? "rgba" : "rgb");
	}
}
function va(e, t, n) {
	if (t && t.length && e >= 0 && e <= 1) {
		var r = e * (t.length - 1), i = Math.floor(r), a = Math.ceil(r), o = ma(t[i]), s = ma(t[a]), c = r - i, l = ba([
			ia(ua(o[0], s[0], c)),
			ia(ua(o[1], s[1], c)),
			ia(ua(o[2], s[2], c)),
			oa(ua(o[3], s[3], c))
		], "rgba");
		return n ? {
			color: l,
			leftIndex: i,
			rightIndex: a,
			value: r
		} : l;
	}
}
function ya(e, t, n, r) {
	var i = ma(e);
	if (e) return i = ga(i), t != null && (i[0] = aa(V(t) ? t(i[0]) : t)), n != null && (i[1] = ca(V(n) ? n(i[1]) : n)), r != null && (i[2] = ca(V(r) ? r(i[2]) : r)), ba(ha(i), "rgba");
}
function ba(e, t) {
	if (e && e.length) {
		var n = e[0] + "," + e[1] + "," + e[2];
		return (t === "rgba" || t === "hsva" || t === "hsla") && (n += "," + e[3]), t + "(" + n + ")";
	}
}
function xa(e, t) {
	var n = ma(e);
	return n ? (.299 * n[0] + .587 * n[1] + .114 * n[2]) * n[3] / 255 + (1 - n[3]) * t : 0;
}
function Sa(e) {
	if (H(e)) {
		var t = Ea.get(e);
		return t || (t = _a(e, -.1), Ea.put(e, t)), t;
	}
	if (gt(e)) {
		var n = L({}, e);
		return n.colorStops = z(e.colorStops, function(e) {
			return {
				offset: e.offset,
				color: _a(e.color, -.1)
			};
		}), n;
	}
	return e;
}
var Ca, wa, Ta, Ea, Da = M((() => {
	En(), q(), Ca = {
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
	}, wa = new Tn(20), Ta = null, Ea = new Tn(100);
}));
//#endregion
//#region node_modules/zrender/lib/svg/helper.js
function Oa(e) {
	return e.type === "linear";
}
function ka(e) {
	return e.type === "radial";
}
var Aa = M((() => {
	q(), (function() {
		return typeof Buffer < "u" && typeof Buffer.from == "function" ? function(e) {
			return Buffer.from(e).toString("base64");
		} : typeof btoa == "function" && typeof unescape == "function" && typeof encodeURIComponent == "function" ? function(e) {
			return btoa(unescape(encodeURIComponent(e)));
		} : function(e) {
			return process.env.NODE_ENV !== "production" && Ze("Base64 isn't natively supported in the current environment."), null;
		};
	})();
}));
//#endregion
//#region node_modules/zrender/lib/animation/Animator.js
function ja(e, t, n) {
	return (t - e) * n + e;
}
function Ma(e, t, n, r) {
	for (var i = t.length, a = 0; a < i; a++) e[a] = ja(t[a], n[a], r);
	return e;
}
function Na(e, t, n, r) {
	for (var i = t.length, a = i && t[0].length, o = 0; o < i; o++) {
		e[o] || (e[o] = []);
		for (var s = 0; s < a; s++) e[o][s] = ja(t[o][s], n[o][s], r);
	}
	return e;
}
function Pa(e, t, n, r) {
	for (var i = t.length, a = 0; a < i; a++) e[a] = t[a] + n[a] * r;
	return e;
}
function Fa(e, t, n, r) {
	for (var i = t.length, a = i && t[0].length, o = 0; o < i; o++) {
		e[o] || (e[o] = []);
		for (var s = 0; s < a; s++) e[o][s] = t[o][s] + n[o][s] * r;
	}
	return e;
}
function Ia(e, t) {
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
function La(e, t, n) {
	var r = e, i = t;
	if (r.push && i.push) {
		var a = r.length, o = i.length;
		if (a !== o) {
			if (a > o) r.length = o;
			else for (var s = a; s < o; s++) r.push(n === 1 ? i[s] : Ua.call(i[s]));
		}
		for (var c = r[0] && r[0].length, s = 0; s < r.length; s++) if (n === 1) isNaN(r[s]) && (r[s] = i[s]);
		else for (var l = 0; l < c; l++) isNaN(r[s][l]) && (r[s][l] = i[s][l]);
	}
}
function Ra(e) {
	if (it(e)) {
		var t = e.length;
		if (it(e[0])) {
			for (var n = [], r = 0; r < t; r++) n.push(Ua.call(e[r]));
			return n;
		}
		return Ua.call(e);
	}
	return e;
}
function za(e) {
	return e[0] = Math.floor(e[0]) || 0, e[1] = Math.floor(e[1]) || 0, e[2] = Math.floor(e[2]) || 0, e[3] = e[3] == null ? 1 : e[3], "rgba(" + e.join(",") + ")";
}
function Ba(e) {
	return it(e && e[0]) ? 2 : 1;
}
function Va(e) {
	return e === Ja || e === Ya;
}
function Ha(e) {
	return e === Ga || e === Ka;
}
var Ua, Wa, Ga, Ka, qa, Ja, Ya, Xa, Za, Qa, $a, eo = M((() => {
	ra(), Da(), q(), Ei(), ta(), Aa(), Ua = Array.prototype.slice, Wa = 0, Ga = 1, Ka = 2, qa = 3, Ja = 4, Ya = 5, Xa = 6, Za = [
		0,
		0,
		0,
		0
	], Qa = function() {
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
			var r = this.keyframes, i = r.length, a = !1, o = Xa, s = t;
			if (it(t)) {
				var c = Ba(t);
				o = c, (c === 1 && !ft(t[0]) || c === 2 && !ft(t[0][0])) && (a = !0);
			} else if (ft(t) && !yt(t)) o = Wa;
			else if (H(t)) {
				if (!isNaN(+t)) o = Wa;
				else {
					var l = ma(t);
					l && (s = l, o = qa);
				}
			} else if (gt(t)) {
				var u = L({}, s);
				u.colorStops = z(t.colorStops, function(e) {
					return {
						offset: e.offset,
						color: ma(e.color)
					};
				}), Oa(t) ? o = Ja : ka(t) && (o = Ya), s = u;
			}
			i === 0 ? this.valType = o : (o !== this.valType || o === Xa) && (a = !0), this.discrete = this.discrete || a;
			var d = {
				time: e,
				value: s,
				rawValue: t,
				percent: 0
			};
			return n && (d.easing = n, d.easingFunc = V(n) ? n : Ti[n] || $i(n)), r.push(d), d;
		}, e.prototype.prepare = function(e, t) {
			var n = this.keyframes;
			this._needsSort && n.sort(function(e, t) {
				return e.time - t.time;
			});
			for (var r = this.valType, i = n.length, a = n[i - 1], o = this.discrete, s = Ha(r), c = Va(r), l = 0; l < i; l++) {
				var u = n[l], d = u.value, f = a.value;
				u.percent = u.time / e, o || (s && l !== i - 1 ? La(d, f, r) : c && Ia(d.colorStops, f.colorStops));
			}
			if (!o && r !== Ya && t && this.needsAnimate() && t.needsAnimate() && r === t.valType && !t._finished) {
				this._additiveTrack = t;
				for (var p = n[0].value, l = 0; l < i; l++) r === Wa ? n[l].additiveValue = n[l].value - p : r === qa ? n[l].additiveValue = Pa([], n[l].value, p, -1) : Ha(r) && (n[l].additiveValue = r === Ga ? Pa([], n[l].value, p, -1) : Fa([], n[l].value, p, -1));
			}
		}, e.prototype.step = function(e, t) {
			if (!this._finished) {
				this._additiveTrack && this._additiveTrack._finished && (this._additiveTrack = null);
				var n = this._additiveTrack != null, r = n ? "additiveValue" : "value", i = this.valType, a = this.keyframes, o = a.length, s = this.propName, c = i === qa, l, u = this._lastFr, d = Math.min, f, p;
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
					var g = n ? this._additiveValue : c ? Za : e[s];
					if ((Ha(i) || c) && !g && (g = this._additiveValue = []), this.discrete) e[s] = h < 1 ? f.rawValue : p.rawValue;
					else if (Ha(i)) i === Ga ? Ma(g, f[r], p[r], h) : Na(g, f[r], p[r], h);
					else if (Va(i)) {
						var _ = f[r], v = p[r], y = i === Ja;
						e[s] = {
							type: y ? "linear" : "radial",
							x: ja(_.x, v.x, h),
							y: ja(_.y, v.y, h),
							colorStops: z(_.colorStops, function(e, t) {
								var n = v.colorStops[t];
								return {
									offset: ja(e.offset, n.offset, h),
									color: za(Ma([], e.color, n.color, h))
								};
							}),
							global: v.global
						}, y ? (e[s].x2 = ja(_.x2, v.x2, h), e[s].y2 = ja(_.y2, v.y2, h)) : e[s].r = ja(_.r, v.r, h);
					} else if (c) Ma(g, f[r], p[r], h), n || (e[s] = za(g));
					else {
						var b = ja(f[r], p[r], h);
						n ? this._additiveValue = b : e[s] = b;
					}
					n && this._addToTarget(e);
				}
			}
		}, e.prototype._addToTarget = function(e) {
			var t = this.valType, n = this.propName, r = this._additiveValue;
			t === Wa ? e[n] = e[n] + r : t === qa ? (ma(e[n], Za), Pa(Za, Za, r, 1), e[n] = za(Za)) : t === Ga ? Pa(e[n], e[n], r, 1) : t === Ka && Fa(e[n], e[n], r, 1);
		}, e;
	}(), $a = function() {
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
			return this.whenWithKeys(e, t, ct(t), n);
		}, e.prototype.whenWithKeys = function(e, t, n, r) {
			for (var i = this._tracks, a = 0; a < n.length; a++) {
				var o = n[a], s = i[o];
				if (!s) {
					s = i[o] = new Qa(o);
					var c = void 0, l = this._getAdditiveTrack(o);
					if (l) {
						var u = l.keyframes, d = u[u.length - 1];
						c = d && d.value, l.valType === qa && c && (c = za(c));
					} else c = this._target[o];
					if (c == null) continue;
					e > 0 && s.addKeyframe(0, Ra(c), r), this._trackKeys.push(o);
				}
				s.addKeyframe(e, Ra(t[o]), r);
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
					var d = new na({
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
			return z(this._trackKeys, function(t) {
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
						s && (e[i] = Ra(s.rawValue));
					}
				}
			}
		}, e.prototype.__changeFinalValue = function(e, t) {
			t ||= ct(e);
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
})), to, no = M((() => {
	to = function() {
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
})), ro, io, ao, oo, so, co, lo = M((() => {
	en(), ro = 1, J.hasGlobalWindow && (ro = Math.max(window.devicePixelRatio || window.screen && window.screen.deviceXDPI / window.screen.logicalXDPI || 1, 1)), io = ro, ao = .4, oo = "#333", so = "#ccc", co = "#eee";
})), uo = M((() => {}));
//#endregion
//#region node_modules/zrender/lib/Element.js
function fo(e, t, n, r, i) {
	n ||= {};
	var a = [];
	vo(e, "", e, t, n, r, a, i);
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
function po(e, t, n) {
	for (var r = 0; r < n; r++) e[r] = t[r];
}
function mo(e) {
	return it(e[0]);
}
function ho(e, t, n) {
	if (it(t[n])) {
		if (it(e[n]) || (e[n] = []), mt(t[n])) {
			var r = t[n].length;
			e[n].length !== r && (e[n] = new t[n].constructor(r), po(e[n], t[n], r));
		} else {
			var i = t[n], a = e[n], o = i.length;
			if (mo(i)) for (var s = i[0].length, c = 0; c < o; c++) a[c] ? po(a[c], i[c], s) : a[c] = Array.prototype.slice.call(i[c]);
			else po(a, i, o);
			a.length = i.length;
		}
	} else e[n] = t[n];
}
function go(e, t) {
	return e === t || it(e) && it(t) && _o(e, t);
}
function _o(e, t) {
	var n = e.length;
	if (n !== t.length) return !1;
	for (var r = 0; r < n; r++) if (e[r] !== t[r]) return !1;
	return !0;
}
function vo(e, t, n, r, i, a, o, s) {
	for (var c = ct(r), l = i.duration, u = i.delay, d = i.additive, f = i.setToFinal, p = !U(a), m = e.animators, h = [], g = 0; g < c.length; g++) {
		var _ = c[g], v = r[_];
		if (v != null && n[_] != null && (p || a[_])) {
			if (U(v) && !it(v) && !gt(v)) {
				if (t) {
					s || (n[_] = v, e.updateDuringAnimation(t));
					continue;
				}
				vo(e, _, n[_], v, i, a && a[_], o, s);
			} else h.push(_);
		} else s || (n[_] = v, e.updateDuringAnimation(t), h.push(_));
	}
	var y = h.length;
	if (!d && y) for (var b = 0; b < m.length; b++) {
		var x = m[b];
		if (x.targetName === t && x.stopTracks(h)) {
			var S = tt(m, x);
			m.splice(S, 1);
		}
	}
	if (i.force || (h = ot(h, function(e) {
		return !go(r[e], n[e]);
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
				T[_] = Ra(n[_]), ho(n, r, _);
			}
		}
		var x = new $a(n, !1, !1, d ? ot(m, function(e) {
			return e.targetName === t;
		}) : null);
		x.targetName = t, i.scope && (x.scope = i.scope), f && C && x.whenWithKeys(0, C, h), T && x.whenWithKeys(0, T, h), x.whenWithKeys(l ?? 500, s ? w : r, h).delay(u || 0), e.addAnimator(x, t), o.push(x);
	}
}
function yo(e, t, n, r) {
	return !(n && n.hoverLayer || r) || bo(e) || t && bo(t) ? 0 : 1;
}
function bo(e) {
	return e.type === "text" || e.type === "tspan";
}
function xo(e, t, n) {
	return !t && !e.__inHover && n && n.duration > 0;
}
var So, Co, wo, To, Eo, Do, Oo, ko = M((() => {
	wi(), eo(), Or(), no(), Ur(), q(), lo(), Da(), uo(), Vn(), So = "__zr_normal__", Co = Ci.concat(["ignore"]), wo = at(Ci, function(e, t) {
		return e[t] = !0, e;
	}, { ignore: !1 }), To = {}, Eo = new Y(0, 0, 0, 0), Do = [], Oo = function() {
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
				if ((u || l) && (d = Eo, n.layoutRect ? d.copy(n.layoutRect) : d.copy(this.getBoundingRect()), r || d.applyTransform(this.transform)), l) {
					this.calculateTextPosition ? this.calculateTextPosition(To, n, d) : zr(To, n, d), i.x = To.x, i.y = To.y, a = To.align, o = To.verticalAlign;
					var f = n.origin;
					if (f && n.rotation != null) {
						var p = void 0, m = void 0;
						f === "center" ? (p = d.width * .5, m = d.height * .5) : (p = Rr(f[0], d.width), m = Rr(f[1], d.height)), c = !0, i.originX = -i.x + p + (r ? 0 : d.x), i.originY = -i.y + m + (r ? 0 : d.y);
					}
				}
				n.rotation != null && (i.rotation = n.rotation);
				var h = n.offset;
				h && (i.x += h[0], i.y += h[1], c || (i.originX = -h[0], i.originY = -h[1]));
				var g = this._innerTextDefaultStyle ||= {};
				if (u) {
					var _ = g.overflowRect = g.overflowRect || new Y(0, 0, 0, 0);
					i.getLocalTransform(Do), Bn(Do, Do), Y.copy(_, d), _.applyTransform(Do);
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
			return this.__zr && this.__zr.isDarkMode() ? so : oo;
		}, e.prototype.getOutsideStroke = function(e) {
			var t = this.__zr && this.__zr.getBackgroundColor(), n = typeof t == "string" && ma(t);
			n ||= [
				255,
				255,
				255,
				1
			];
			for (var r = n[3], i = this.__zr.isDarkMode(), a = 0; a < 3; a++) n[a] = n[a] * r + (i ? 0 : 255) * (1 - r);
			return n[3] = 1, ba(n, "rgba");
		}, e.prototype.traverse = function(e, t) {}, e.prototype.attrKV = function(e, t) {
			e === "textConfig" ? this.setTextConfig(t) : e === "textContent" ? this.setTextContent(t) : e === "clipPath" ? this.setClipPath(t) : e === "extra" ? (this.extra = this.extra || {}, L(this.extra, t)) : this[e] = t;
		}, e.prototype.hide = function() {
			this.ignore = !0, this.markRedraw();
		}, e.prototype.show = function() {
			this.ignore = !1, this.markRedraw();
		}, e.prototype.attr = function(e, t) {
			if (typeof e == "string") this.attrKV(e, t);
			else if (U(e)) for (var n = ct(e), r = 0; r < n.length; r++) {
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
			t ||= this._normalState = {}, e.textConfig && !t.textConfig && (t.textConfig = this.textConfig), this._savePrimaryToNormal(e, t, Co);
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
			this.useState(So, !1, e);
		}, e.prototype.useState = function(e, t, n, r) {
			var i = e === So;
			if (this.hasState() || !i) {
				var a = this.currentStates, o = this.stateTransition;
				if (!(tt(a, e) >= 0 && (t || a.length === 1))) {
					var s;
					if (this.stateProxy && !i && (s = this.stateProxy(e)), s ||= this.states && this.states[e], !s && !i) {
						Ze("State " + e + " not exists.");
						return;
					}
					i || this.saveCurrentToNormalState(s);
					var c = this._textContent, l = yo(this, c, s, r);
					l && !this.__inHover && (this.__inHover = l), this._applyStateObj(e, s, this._normalState, t, xo(this, n, o), o);
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
				var u = r[a - 1], d = this._textContent, f = yo(this, d, u, n);
				f && !this.__inHover && (this.__inHover = f);
				var p = this._mergeStates(r), m = this.stateTransition;
				this.saveCurrentToNormalState(p), this._applyStateObj(e.join(","), p, this._normalState, !1, xo(this, t, m), m);
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
			var t = tt(this.currentStates, e);
			if (t >= 0) {
				var n = this.currentStates.slice();
				n.splice(t, 1), this.useStates(n);
			}
		}, e.prototype.replaceState = function(e, t, n) {
			var r = this.currentStates.slice(), i = tt(r, e), a = tt(r, t) >= 0;
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
				for (var s = {}, c = !1, l = 0; l < Co.length; l++) {
					var u = Co[l], d = i && wo[u];
					t && t[u] != null ? d ? (c = !0, s[u] = t[u]) : this[u] = t[u] : o && n[u] != null && (d ? (c = !0, s[u] = n[u]) : this[u] = n[u]);
				}
				if (!i) for (var l = 0; l < this.animators.length; l++) {
					var f = this.animators[l], p = f.targetName;
					f.getLoop() || f.__changeFinalValue(p ? (t || n)[p] : t || n);
				}
				c && this._transitionState(e, s, a);
			}
		}, e.prototype._attachComponent = function(e) {
			if (e.__zr && !e.__hostTarget) {
				if (process.env.NODE_ENV !== "production") throw Error("Text element has been added to zrender.");
				return;
			}
			if (e === this) {
				if (process.env.NODE_ENV !== "production") throw Error("Recursive component attachment.");
				return;
			}
			var t = this.__zr;
			t && e.addSelfToZr(t), e.__zr = t, e.__hostTarget = this;
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
			if (t !== e) {
				if (t && t !== e && this.removeTextContent(), process.env.NODE_ENV !== "production" && e.__zr && !e.__hostTarget) throw Error("Text element has been added to zrender.");
				e.innerTransformable = new xi(), this._attachComponent(e), this._textContent = e, this.markRedraw();
			}
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
			var r = e ? this[e] : this;
			if (process.env.NODE_ENV !== "production" && !r) {
				Ze("Property \"" + e + "\" is not existed in element " + this.id);
				return;
			}
			var i = new $a(r, t, n);
			return e && (i.targetName = e), this.addAnimator(i, e), i;
		}, e.prototype.addAnimator = function(e, t) {
			var n = this.__zr, r = this;
			e.during(function() {
				r.updateDuringAnimation(t);
			}).done(function() {
				var t = r.animators, n = tt(t, e);
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
			fo(this, e, t, n);
		}, e.prototype.animateFrom = function(e, t, n) {
			fo(this, e, t, n, !0);
		}, e.prototype._transitionState = function(e, t, n, r) {
			for (var i = fo(this, t, n, r), a = 0; a < i.length; a++) i[a].__fromStateTransition = e;
		}, e.prototype.getBoundingRect = function() {
			return null;
		}, e.prototype.getPaintRect = function() {
			return null;
		}, e.initDefaultProps = (function() {
			var t = e.prototype;
			t.type = "element", t.name = "", t.ignore = t.silent = t.ignoreHostSilent = t.isGroup = t.draggable = t.dragging = t.ignoreClip = !1, t.__inHover = 0, t.__dirty = 1;
			var n = {};
			function r(e, t, r) {
				n[e + t + r] || (console.warn("DEPRECATED: '" + e + "' has been deprecated. use '" + t + "', '" + r + "' instead"), n[e + t + r] = !0);
			}
			function i(e, n, i, a) {
				Object.defineProperty(t, e, {
					get: function() {
						if (process.env.NODE_ENV !== "production" && r(e, i, a), !this[n]) {
							var t = this[n] = [];
							o(this, t);
						}
						return this[n];
					},
					set: function(t) {
						process.env.NODE_ENV !== "production" && r(e, i, a), this[i] = t[0], this[a] = t[1], this[n] = t, o(this, t);
					}
				});
				function o(e, t) {
					Object.defineProperty(t, 0, {
						get: function() {
							return e[i];
						},
						set: function(t) {
							e[i] = t;
						}
					}), Object.defineProperty(t, 1, {
						get: function() {
							return e[a];
						},
						set: function(t) {
							e[a] = t;
						}
					});
				}
			}
			Object.defineProperty && (i("position", "_legacyPos", "x", "y"), i("scale", "_legacyScale", "scaleX", "scaleY"), i("origin", "_legacyOrigin", "originX", "originY"));
		})(), e;
	}(), rt(Oo, to), rt(Oo, xi);
}));
//#endregion
//#region node_modules/zrender/lib/graphic/Displayable.js
function Ao(e, t, n) {
	return Lo.copy(e.getBoundingRect()), e.transform && Lo.applyTransform(e.transform), Ro.width = t, Ro.height = n, !Lo.intersect(Ro);
}
var jo, Mo, No, Po, Fo, Io, Lo, Ro, zo = M((() => {
	F(), ko(), Or(), q(), uo(), jo = "__zr_style_" + Math.round(Math.random() * 10), Mo = {
		shadowBlur: 0,
		shadowOffsetX: 0,
		shadowOffsetY: 0,
		shadowColor: "#000",
		opacity: 1,
		blend: "source-over"
	}, No = { style: {
		shadowBlur: !0,
		shadowOffsetX: !0,
		shadowOffsetY: !0,
		shadowColor: !0,
		opacity: !0
	} }, Mo[jo] = !0, Po = [
		"z",
		"z2",
		"invisible"
	], Fo = ["invisible"], Io = function(e) {
		P(t, e);
		function t(t) {
			return e.call(this, t) || this;
		}
		return t.prototype._init = function(t) {
			for (var n = ct(t), r = 0; r < n.length; r++) {
				var i = n[r];
				i === "style" ? this.useStyle(t[i]) : e.prototype.attrKV.call(this, i, t[i]);
			}
			this.style || this.useStyle({});
		}, t.prototype.beforeBrush = function(e) {}, t.prototype.afterBrush = function() {}, t.prototype.innerBeforeBrush = function() {}, t.prototype.innerAfterBrush = function() {}, t.prototype.shouldBePainted = function(e, t, n, r) {
			var i = this.transform;
			if (this.ignore || this.invisible || this.style.opacity === 0 || this.culling && Ao(this, e, t) || i && !i[0] && !i[3]) return !1;
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
			return kt(Mo, e);
		}, t.prototype.useStyle = function(e) {
			e[jo] || (e = this.createStyle(e)), this.style = e, this.dirtyStyle();
		}, t.prototype._useHoverStyle = function(e) {
			this.__hoverStyle = e;
		}, t.prototype.isStyleObject = function(e) {
			return e[jo];
		}, t.prototype._innerSaveToNormal = function(t) {
			e.prototype._innerSaveToNormal.call(this, t);
			var n = this._normalState;
			t.style && !n.style && (n.style = this._mergeStyle(this.createStyle(), this.style)), this._savePrimaryToNormal(t, n, Po);
		}, t.prototype._applyStateObj = function(t, n, r, i, a, o) {
			e.prototype._applyStateObj.call(this, t, n, r, i, a, o);
			var s = !(n && i), c = this.__inHover === 1, l;
			if (n && n.style ? a ? i ? l = n.style : (l = this._mergeStyle(this.createStyle(), r.style), this._mergeStyle(l, n.style)) : (l = this._mergeStyle(this.createStyle(), i ? this.style : r.style), this._mergeStyle(l, n.style)) : s && (l = r.style), l) {
				if (a) {
					var u = this.style;
					if (this.style = this.createStyle(s ? {} : u), s) for (var d = ct(u), f = 0; f < d.length; f++) {
						var p = d[f];
						p in l && (l[p] = l[p], this.style[p] = u[p]);
					}
					for (var m = ct(l), f = 0; f < m.length; f++) {
						var p = m[f];
						this.style[p] = this.style[p];
					}
					this._transitionState(t, { style: l }, o, this.getAnimationStyleProps());
				} else c ? this._useHoverStyle(l) : this.useStyle(l);
			}
			if (!c) for (var h = this.__inHover ? Fo : Po, f = 0; f < h.length; f++) {
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
			return No;
		}, t.initDefaultProps = (function() {
			var e = t.prototype;
			e.type = "displayable", e.invisible = !1, e.z = 0, e.z2 = 0, e.zlevel = 0, e.culling = !1, e.cursor = "pointer", e.rectHover = !1, e.incremental = 0, e._rect = null, e.dirtyRectTolerance = 0, e.__dirty = 3;
		})(), t;
	}(Oo), Lo = new Y(0, 0, 0, 0), Ro = new Y(0, 0, 0, 0);
}));
//#endregion
//#region node_modules/zrender/lib/core/bbox.js
function Bo(e, t, n, r, i, a) {
	i[0] = Wo(e, n), i[1] = Wo(t, r), a[0] = Go(e, n), a[1] = Go(t, r);
}
function Vo(e, t, n, r, i, a, o, s, c, l) {
	var u = Mi, d = ki, f = u(e, n, i, o, Qo);
	c[0] = Infinity, c[1] = Infinity, l[0] = -Infinity, l[1] = -Infinity;
	for (var p = 0; p < f; p++) {
		var m = d(e, n, i, o, Qo[p]);
		c[0] = Wo(m, c[0]), l[0] = Go(m, l[0]);
	}
	f = u(t, r, a, s, $o);
	for (var p = 0; p < f; p++) {
		var h = d(t, r, a, s, $o[p]);
		c[1] = Wo(h, c[1]), l[1] = Go(h, l[1]);
	}
	c[0] = Wo(e, c[0]), l[0] = Go(e, l[0]), c[0] = Wo(o, c[0]), l[0] = Go(o, l[0]), c[1] = Wo(t, c[1]), l[1] = Go(t, l[1]), c[1] = Wo(s, c[1]), l[1] = Go(s, l[1]);
}
function Ho(e, t, n, r, i, a, o, s) {
	var c = zi, l = Ii, u = Go(Wo(c(e, n, i), 1), 0), d = Go(Wo(c(t, r, a), 1), 0), f = l(e, n, i, u), p = l(t, r, a, d);
	o[0] = Wo(e, i, f), o[1] = Wo(t, a, p), s[0] = Go(e, i, f), s[1] = Go(t, a, p);
}
function Uo(e, t, n, r, i, a, o, s, c) {
	var l = er, u = tr, d = Math.abs(i - a);
	if (d % Jo < 1e-4 && d > 1e-4) {
		s[0] = e - n, s[1] = t - r, c[0] = e + n, c[1] = t + r;
		return;
	}
	if (Yo[0] = qo(i) * n + e, Yo[1] = Ko(i) * r + t, Xo[0] = qo(a) * n + e, Xo[1] = Ko(a) * r + t, l(s, Yo, Xo), u(c, Yo, Xo), i %= Jo, i < 0 && (i += Jo), a %= Jo, a < 0 && (a += Jo), i > a && !o ? a += Jo : i < a && o && (i += Jo), o) {
		var f = a;
		a = i, i = f;
	}
	for (var p = 0; p < a; p += Math.PI / 2) p > i && (Zo[0] = qo(p) * n + e, Zo[1] = Ko(p) * r + t, l(s, Zo, s), u(c, Zo, c));
}
var Wo, Go, Ko, qo, Jo, Yo, Xo, Zo, Qo, $o, es = M((() => {
	ir(), Qi(), Wo = Math.min, Go = Math.max, Ko = Math.sin, qo = Math.cos, Jo = Math.PI * 2, Yo = Hn(), Xo = Hn(), Zo = Hn(), Qo = [], $o = [];
}));
//#endregion
//#region node_modules/zrender/lib/core/PathProxy.js
function ts(e) {
	return Math.round(e / hs * 1e8) / 1e8 % 2 * hs;
}
function ns(e, t) {
	var n = ts(e[0]);
	n < 0 && (n += gs);
	var r = n - e[0], i = e[1];
	i += r, !t && i - n >= gs ? i = n + gs : t && n - i >= gs ? i = n - gs : !t && n > i ? i = n + (gs - ts(n - i)) : t && n < i && (i = n - (gs - ts(i - n))), e[0] = n, e[1] = i;
}
var rs, is, as, os, ss, cs, ls, us, ds, fs, ps, ms, hs, gs, _s, vs, ys, bs = M((() => {
	ir(), Or(), lo(), es(), Qi(), rs = {
		M: 1,
		L: 2,
		C: 3,
		Q: 4,
		A: 5,
		Z: 6,
		R: 7
	}, is = [], as = [], os = [], ss = [], cs = [], ls = [], us = Math.min, ds = Math.max, fs = Math.cos, ps = Math.sin, ms = Math.abs, hs = Math.PI, gs = hs * 2, _s = typeof Float32Array < "u", vs = [], ys = function() {
		function e(e) {
			this.dpr = 1, this._xi = 0, this._yi = 0, this._x0 = 0, this._y0 = 0, this._len = 0, e && (this._saveData = !1), this._saveData && (this.data = []);
		}
		return e.prototype.increaseVersion = function() {
			this._version++;
		}, e.prototype.getVersion = function() {
			return this._version;
		}, e.prototype.setScale = function(e, t, n) {
			n ||= 0, n > 0 && (this._ux = ms(n / io / e) || 0, this._uy = ms(n / io / t) || 0);
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
			return this._drawPendingPt(), this.addData(rs.M, e, t), this._ctx && this._ctx.moveTo(e, t), this._x0 = e, this._y0 = t, this._xi = e, this._yi = t, this;
		}, e.prototype.lineTo = function(e, t) {
			var n = ms(e - this._xi), r = ms(t - this._yi), i = n > this._ux || r > this._uy;
			if (this.addData(rs.L, e, t), this._ctx && i && this._ctx.lineTo(e, t), i) this._xi = e, this._yi = t, this._pendingPtDist = 0;
			else {
				var a = n * n + r * r;
				a > this._pendingPtDist && (this._pendingPtX = e, this._pendingPtY = t, this._pendingPtDist = a);
			}
			return this;
		}, e.prototype.bezierCurveTo = function(e, t, n, r, i, a) {
			return this._drawPendingPt(), this.addData(rs.C, e, t, n, r, i, a), this._ctx && this._ctx.bezierCurveTo(e, t, n, r, i, a), this._xi = i, this._yi = a, this;
		}, e.prototype.quadraticCurveTo = function(e, t, n, r) {
			return this._drawPendingPt(), this.addData(rs.Q, e, t, n, r), this._ctx && this._ctx.quadraticCurveTo(e, t, n, r), this._xi = n, this._yi = r, this;
		}, e.prototype.arc = function(e, t, n, r, i, a) {
			this._drawPendingPt(), vs[0] = r, vs[1] = i, ns(vs, a), r = vs[0], i = vs[1];
			var o = i - r;
			return this.addData(rs.A, e, t, n, n, r, o, 0, +!a), this._ctx && this._ctx.arc(e, t, n, r, i, a), this._xi = fs(i) * n + e, this._yi = ps(i) * n + t, this;
		}, e.prototype.arcTo = function(e, t, n, r, i) {
			return this._drawPendingPt(), this._ctx && this._ctx.arcTo(e, t, n, r, i), this;
		}, e.prototype.rect = function(e, t, n, r) {
			return this._drawPendingPt(), this._ctx && this._ctx.rect(e, t, n, r), this.addData(rs.R, e, t, n, r), this;
		}, e.prototype.closePath = function() {
			this._drawPendingPt(), this.addData(rs.Z);
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
				!(this.data && this.data.length === t) && _s && (this.data = new Float32Array(t));
				for (var n = 0; n < t; n++) this.data[n] = e[n];
				this._len = t;
			}
		}, e.prototype.appendPath = function(e) {
			if (this._saveData) {
				e instanceof Array || (e = [e]);
				for (var t = e.length, n = 0, r = this._len, i = 0; i < t; i++) n += e[i].len();
				var a = this.data;
				if (_s && (a instanceof Float32Array || !a) && (this.data = new Float32Array(r + n), r > 0 && a)) for (var o = 0; o < r; o++) this.data[o] = a[o];
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
				e instanceof Array && (e.length = this._len, _s && this._len > 11 && (this.data = new Float32Array(e)));
			}
		}, e.prototype.getBoundingRect = function() {
			os[0] = os[1] = cs[0] = cs[1] = Number.MAX_VALUE, ss[0] = ss[1] = ls[0] = ls[1] = -Number.MAX_VALUE;
			for (var e = this.data, t = 0, n = 0, r = 0, i = 0, a = 0; a < this._len;) {
				var o = e[a++], s = a === 1;
				switch (s && (t = e[a], n = e[a + 1], r = t, i = n), o) {
					case rs.M:
						t = r = e[a++], n = i = e[a++], cs[0] = r, cs[1] = i, ls[0] = r, ls[1] = i;
						break;
					case rs.L:
						Bo(t, n, e[a], e[a + 1], cs, ls), t = e[a++], n = e[a++];
						break;
					case rs.C:
						Vo(t, n, e[a++], e[a++], e[a++], e[a++], e[a], e[a + 1], cs, ls), t = e[a++], n = e[a++];
						break;
					case rs.Q:
						Ho(t, n, e[a++], e[a++], e[a], e[a + 1], cs, ls), t = e[a++], n = e[a++];
						break;
					case rs.A:
						var c = e[a++], l = e[a++], u = e[a++], d = e[a++], f = e[a++], p = e[a++] + f;
						a += 1;
						var m = !e[a++];
						s && (r = fs(f) * u + c, i = ps(f) * d + l), Uo(c, l, u, d, f, p, m, cs, ls), t = fs(p) * u + c, n = ps(p) * d + l;
						break;
					case rs.R:
						r = t = e[a++], i = n = e[a++];
						var h = e[a++], g = e[a++];
						Bo(r, i, r + h, i + g, cs, ls);
						break;
					case rs.Z: t = r, n = i;
				}
				er(os, os, cs), tr(ss, ss, ls);
			}
			return a === 0 && (os[0] = os[1] = ss[0] = ss[1] = 0), new Y(os[0], os[1], ss[0] - os[0], ss[1] - os[1]);
		}, e.prototype._calculateLength = function() {
			var e = this.data, t = this._len, n = this._ux, r = this._uy, i = 0, a = 0, o = 0, s = 0;
			this._pathSegLen ||= [];
			for (var c = this._pathSegLen, l = 0, u = 0, d = 0; d < t;) {
				var f = e[d++], p = d === 1;
				p && (i = e[d], a = e[d + 1], o = i, s = a);
				var m = -1;
				switch (f) {
					case rs.M:
						i = o = e[d++], a = s = e[d++];
						break;
					case rs.L:
						var h = e[d++], g = e[d++], _ = h - i, v = g - a;
						(ms(_) > n || ms(v) > r || d === t - 1) && (m = Math.sqrt(_ * _ + v * v), i = h, a = g);
						break;
					case rs.C:
						var y = e[d++], b = e[d++], h = e[d++], g = e[d++], x = e[d++], S = e[d++];
						m = Fi(i, a, y, b, h, g, x, S, 10), i = x, a = S;
						break;
					case rs.Q:
						var y = e[d++], b = e[d++], h = e[d++], g = e[d++];
						m = Hi(i, a, y, b, h, g, 10), i = h, a = g;
						break;
					case rs.A:
						var C = e[d++], w = e[d++], T = e[d++], E = e[d++], D = e[d++], O = e[d++], k = O + D;
						d += 1, p && (o = fs(D) * T + C, s = ps(D) * E + w), m = ds(T, E) * us(gs, Math.abs(O)), i = fs(k) * T + C, a = ps(k) * E + w;
						break;
					case rs.R:
						o = i = e[d++], s = a = e[d++];
						var A = e[d++], j = e[d++];
						m = A * 2 + j * 2;
						break;
					case rs.Z:
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
				switch (C && (c = n[x], l = n[x + 1], o = c, s = l), S !== rs.L && v > 0 && (e.lineTo(y, b), v = 0), S) {
					case rs.M:
						o = c = n[x++], s = l = n[x++], e.moveTo(c, l);
						break;
					case rs.L:
						u = n[x++], d = n[x++];
						var w = ms(u - c), T = ms(d - l);
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
					case rs.C:
						var k = n[x++], A = n[x++], j = n[x++], ee = n[x++], te = n[x++], ne = n[x++];
						if (f) {
							var E = p[g++];
							if (h + E > _) {
								var D = (_ - h) / E;
								Ni(c, k, j, te, D, is), Ni(l, A, ee, ne, D, as), e.bezierCurveTo(is[1], as[1], is[2], as[2], is[3], as[3]);
								break lo;
							}
							h += E;
						}
						e.bezierCurveTo(k, A, j, ee, te, ne), c = te, l = ne;
						break;
					case rs.Q:
						var k = n[x++], A = n[x++], j = n[x++], ee = n[x++];
						if (f) {
							var E = p[g++];
							if (h + E > _) {
								var D = (_ - h) / E;
								Bi(c, k, j, D, is), Bi(l, A, ee, D, as), e.quadraticCurveTo(is[1], as[1], is[2], as[2]);
								break lo;
							}
							h += E;
						}
						e.quadraticCurveTo(k, A, j, ee), c = j, l = ee;
						break;
					case rs.A:
						var re = n[x++], ie = n[x++], ae = n[x++], oe = n[x++], se = n[x++], M = n[x++], ce = n[x++], le = !n[x++], ue = ae > oe ? ae : oe, de = ms(ae - oe) > .001, fe = se + M, N = !1;
						if (f) {
							var E = p[g++];
							h + E > _ && (fe = se + M * (_ - h) / E, N = !0), h += E;
						}
						if (de && e.ellipse ? e.ellipse(re, ie, ae, oe, ce, se, fe, le) : e.arc(re, ie, ue, se, fe, le), N) break lo;
						C && (o = fs(se) * ae + re, s = ps(se) * oe + ie), c = fs(fe) * ae + re, l = ps(fe) * oe + ie;
						break;
					case rs.R:
						o = c = n[x], s = l = n[x + 1], u = n[x++], d = n[x++];
						var pe = n[x++], me = n[x++];
						if (f) {
							var E = p[g++];
							if (h + E > _) {
								var he = _ - h;
								e.moveTo(u, d), e.lineTo(u + us(he, pe), d), he -= pe, he > 0 && e.lineTo(u + pe, d + us(he, me)), he -= me, he > 0 && e.lineTo(u + ds(pe - he, 0), d + me), he -= pe, he > 0 && e.lineTo(u, d + ds(me - he, 0));
								break lo;
							}
							h += E;
						}
						e.rect(u, d, pe, me);
						break;
					case rs.Z:
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
		}, e.CMD = rs, e.initDefaultProps = (function() {
			var t = e.prototype;
			t._saveData = !0, t._ux = 0, t._uy = 0, t._pendingPtDist = 0, t._version = 0;
		})(), e;
	}();
}));
//#endregion
//#region node_modules/zrender/lib/contain/line.js
function xs(e, t, n, r, i, a, o) {
	if (i === 0) return !1;
	var s = i, c = 0, l = e;
	if (o > t + s && o > r + s || o < t - s && o < r - s || a > e + s && a > n + s || a < e - s && a < n - s) return !1;
	if (e !== n) c = (t - r) / (e - n), l = (e * r - n * t) / (e - n);
	else return Math.abs(a - e) <= s / 2;
	var u = c * a - o + l;
	return u * u / (c * c + 1) <= s / 2 * s / 2;
}
var Ss = M((() => {}));
//#endregion
//#region node_modules/zrender/lib/contain/cubic.js
function Cs(e, t, n, r, i, a, o, s, c, l, u) {
	if (c === 0) return !1;
	var d = c;
	return u > t + d && u > r + d && u > a + d && u > s + d || u < t - d && u < r - d && u < a - d && u < s - d || l > e + d && l > n + d && l > i + d && l > o + d || l < e - d && l < n - d && l < i - d && l < o - d ? !1 : Pi(e, t, n, r, i, a, o, s, l, u, null) <= d / 2;
}
var ws = M((() => {
	Qi();
}));
//#endregion
//#region node_modules/zrender/lib/contain/quadratic.js
function Ts(e, t, n, r, i, a, o, s, c) {
	if (o === 0) return !1;
	var l = o;
	return c > t + l && c > r + l && c > a + l || c < t - l && c < r - l && c < a - l || s > e + l && s > n + l && s > i + l || s < e - l && s < n - l && s < i - l ? !1 : Vi(e, t, n, r, i, a, s, c, null) <= l / 2;
}
var Es = M((() => {
	Qi();
}));
//#endregion
//#region node_modules/zrender/lib/contain/util.js
function Ds(e) {
	return e %= Os, e < 0 && (e += Os), e;
}
var Os, ks = M((() => {
	Os = Math.PI * 2;
}));
//#endregion
//#region node_modules/zrender/lib/contain/arc.js
function As(e, t, n, r, i, a, o, s, c) {
	if (o === 0) return !1;
	var l = o;
	s -= e, c -= t;
	var u = Math.sqrt(s * s + c * c);
	if (u - l > n || u + l < n) return !1;
	if (Math.abs(r - i) % js < 1e-4) return !0;
	if (a) {
		var d = r;
		r = Ds(i), i = Ds(d);
	} else r = Ds(r), i = Ds(i);
	r > i && (i += js);
	var f = Math.atan2(c, s);
	return f < 0 && (f += js), f >= r && f <= i || f + js >= r && f + js <= i;
}
var js, Ms = M((() => {
	ks(), js = Math.PI * 2;
}));
//#endregion
//#region node_modules/zrender/lib/contain/windingLine.js
function Ns(e, t, n, r, i, a) {
	if (a > t && a > r || a < t && a < r || r === t) return 0;
	var o = (a - t) / (r - t), s = r < t ? 1 : -1;
	(o === 1 || o === 0) && (s = r < t ? .5 : -.5);
	var c = o * (n - e) + e;
	return c === i ? Infinity : c > i ? s : 0;
}
var Ps = M((() => {}));
//#endregion
//#region node_modules/zrender/lib/contain/path.js
function Fs(e, t) {
	return Math.abs(e - t) < Gs;
}
function Is() {
	var e = qs[0];
	qs[0] = qs[1], qs[1] = e;
}
function Ls(e, t, n, r, i, a, o, s, c, l) {
	if (l > t && l > r && l > a && l > s || l < t && l < r && l < a && l < s) return 0;
	var u = ji(t, r, a, s, l, Ks);
	if (u === 0) return 0;
	for (var d = 0, f = -1, p = void 0, m = void 0, h = 0; h < u; h++) {
		var g = Ks[h], _ = g === 0 || g === 1 ? .5 : 1;
		ki(e, n, i, o, g) < c || (f < 0 && (f = Mi(t, r, a, s, qs), qs[1] < qs[0] && f > 1 && Is(), p = ki(t, r, a, s, qs[0]), f > 1 && (m = ki(t, r, a, s, qs[1]))), f === 2 ? g < qs[0] ? d += p < t ? _ : -_ : g < qs[1] ? d += m < p ? _ : -_ : d += s < m ? _ : -_ : g < qs[0] ? d += p < t ? _ : -_ : d += s < p ? _ : -_);
	}
	return d;
}
function Rs(e, t, n, r, i, a, o, s) {
	if (s > t && s > r && s > a || s < t && s < r && s < a) return 0;
	var c = Ri(t, r, a, s, Ks);
	if (c === 0) return 0;
	var l = zi(t, r, a);
	if (l >= 0 && l <= 1) {
		for (var u = 0, d = Ii(t, r, a, l), f = 0; f < c; f++) {
			var p = Ks[f] === 0 || Ks[f] === 1 ? .5 : 1, m = Ii(e, n, i, Ks[f]);
			m < o || (Ks[f] < l ? u += d < t ? p : -p : u += a < d ? p : -p);
		}
		return u;
	}
	var p = Ks[0] === 0 || Ks[0] === 1 ? .5 : 1, m = Ii(e, n, i, Ks[0]);
	return m < o ? 0 : a < t ? p : -p;
}
function zs(e, t, n, r, i, a, o, s) {
	if (s -= t, s > n || s < -n) return 0;
	var c = Math.sqrt(n * n - s * s);
	Ks[0] = -c, Ks[1] = c;
	var l = Math.abs(r - i);
	if (l < 1e-4) return 0;
	if (l >= Ws - 1e-4) {
		r = 0, i = Ws;
		var u = a ? 1 : -1;
		return o >= Ks[0] + e && o <= Ks[1] + e ? u : 0;
	}
	if (r > i) {
		var d = r;
		r = i, i = d;
	}
	r < 0 && (r += Ws, i += Ws);
	for (var f = 0, p = 0; p < 2; p++) {
		var m = Ks[p];
		if (m + e > o) {
			var h = Math.atan2(s, m), u = a ? 1 : -1;
			h < 0 && (h = Ws + h), (h >= r && h <= i || h + Ws >= r && h + Ws <= i) && (h > Math.PI / 2 && h < Math.PI * 1.5 && (u = -u), f += u);
		}
	}
	return f;
}
function Bs(e, t, n, r, i) {
	for (var a = e.data, o = e.len(), s = 0, c = 0, l = 0, u = 0, d = 0, f, p, m = 0; m < o;) {
		var h = a[m++], g = m === 1;
		switch (h === Us.M && m > 1 && (n || (s += Ns(c, l, u, d, r, i))), g && (c = a[m], l = a[m + 1], u = c, d = l), h) {
			case Us.M:
				u = a[m++], d = a[m++], c = u, l = d;
				break;
			case Us.L:
				if (n) {
					if (xs(c, l, a[m], a[m + 1], t, r, i)) return !0;
				} else s += Ns(c, l, a[m], a[m + 1], r, i) || 0;
				c = a[m++], l = a[m++];
				break;
			case Us.C:
				if (n) {
					if (Cs(c, l, a[m++], a[m++], a[m++], a[m++], a[m], a[m + 1], t, r, i)) return !0;
				} else s += Ls(c, l, a[m++], a[m++], a[m++], a[m++], a[m], a[m + 1], r, i) || 0;
				c = a[m++], l = a[m++];
				break;
			case Us.Q:
				if (n) {
					if (Ts(c, l, a[m++], a[m++], a[m], a[m + 1], t, r, i)) return !0;
				} else s += Rs(c, l, a[m++], a[m++], a[m], a[m + 1], r, i) || 0;
				c = a[m++], l = a[m++];
				break;
			case Us.A:
				var _ = a[m++], v = a[m++], y = a[m++], b = a[m++], x = a[m++], S = a[m++];
				m += 1;
				var C = !!(1 - a[m++]);
				f = Math.cos(x) * y + _, p = Math.sin(x) * b + v, g ? (u = f, d = p) : s += Ns(c, l, f, p, r, i);
				var w = (r - _) * b / y + _;
				if (n) {
					if (As(_, v, b, x, x + S, C, t, w, i)) return !0;
				} else s += zs(_, v, b, x, x + S, C, w, i);
				c = Math.cos(x + S) * y + _, l = Math.sin(x + S) * b + v;
				break;
			case Us.R:
				u = c = a[m++], d = l = a[m++];
				var T = a[m++], E = a[m++];
				if (f = u + T, p = d + E, n) {
					if (xs(u, d, f, d, t, r, i) || xs(f, d, f, p, t, r, i) || xs(f, p, u, p, t, r, i) || xs(u, p, u, d, t, r, i)) return !0;
				} else s += Ns(f, d, f, p, r, i), s += Ns(u, p, u, d, r, i);
				break;
			case Us.Z:
				if (n) {
					if (xs(c, l, u, d, t, r, i)) return !0;
				} else s += Ns(c, l, u, d, r, i);
				c = u, l = d;
		}
	}
	return !n && !Fs(l, d) && (s += Ns(c, l, u, d, r, i) || 0), s !== 0;
}
function Vs(e, t, n) {
	return Bs(e, 0, !1, t, n);
}
function Hs(e, t, n, r) {
	return Bs(e, t, !0, n, r);
}
var Us, Ws, Gs, Ks, qs, Js = M((() => {
	bs(), Ss(), ws(), Es(), Ms(), Qi(), Ps(), Us = ys.CMD, Ws = Math.PI * 2, Gs = 1e-4, Ks = [
		-1,
		-1,
		-1
	], qs = [-1, -1];
})), Ys, Xs, Zs, Qs, $s = M((() => {
	F(), zo(), ko(), bs(), Js(), q(), Da(), lo(), uo(), wi(), Ys = et({
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
	}, Mo), Xs = { style: et({
		fill: !0,
		stroke: !0,
		strokePercent: !0,
		fillOpacity: !0,
		strokeOpacity: !0,
		lineDashOffset: !0,
		lineWidth: !0,
		miterLimit: !0
	}, No.style) }, Zs = Ci.concat([
		"invisible",
		"culling",
		"z",
		"z2",
		"zlevel",
		"parent"
	]), Qs = function(e) {
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
				for (var s = 0; s < Zs.length; ++s) i[Zs[s]] = this[Zs[s]];
				i.__dirty |= 1;
			} else this._decalEl &&= null;
		}, t.prototype.getDecalElement = function() {
			return this._decalEl;
		}, t.prototype._init = function(t) {
			var n = ct(t);
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
				if (H(e)) {
					var t = xa(e, 0);
					return t > .5 ? oo : t > .2 ? co : so;
				}
				if (e) return so;
			}
			return oo;
		}, t.prototype.getInsideTextStroke = function(e) {
			var t = this.style.fill;
			if (H(t)) {
				var n = this.__zr;
				if (!!(n && n.isDarkMode()) == xa(e, 0) < .4) return t;
			}
		}, t.prototype.buildPath = function(e, t, n) {}, t.prototype.pathUpdated = function() {
			this.__dirty &= -5;
		}, t.prototype.getUpdatedPathProxy = function(e) {
			return !this.path && this.createPathProxy(), this.path.beginPath(), this.buildPath(this.path, this.shape, e), this.path;
		}, t.prototype.createPathProxy = function() {
			this.path = new ys(!1);
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
					if (s > 1e-10 && (this.hasFill() || (o = Math.max(o, this.strokeContainThreshold)), Hs(a, o / s, e, t))) return !0;
				}
				if (this.hasFill()) return Vs(a, e, t);
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
			return kt(Ys, e);
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
						for (var l = {}, u = ct(c), d = 0; d < u.length; d++) {
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
			return Xs;
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
	}(Io);
})), ec, tc, nc = M((() => {
	F(), zo(), $s(), q(), Ye(), fi(), ec = et({
		strokeFirst: !0,
		font: Ue,
		x: 0,
		y: 0,
		textAlign: "left",
		textBaseline: "top",
		miterLimit: 2
	}, Ys), tc = function(e) {
		P(t, e);
		function t() {
			return e !== null && e.apply(this, arguments) || this;
		}
		return t.prototype.hasStroke = function() {
			return ii(this.style);
		}, t.prototype.hasFill = function() {
			var e = this.style.fill;
			return e != null && e !== "none";
		}, t.prototype.createStyle = function(e) {
			return kt(ec, e);
		}, t.prototype.setBoundingRect = function(e) {
			this._rect = e;
		}, t.prototype.getBoundingRect = function() {
			return this._rect ||= ni(this.style), this._rect;
		}, t.initDefaultProps = (function() {
			var e = t.prototype;
			e.dirtyRectTolerance = 10;
		})(), t;
	}(Io), tc.prototype.type = "tspan";
}));
//#endregion
//#region node_modules/zrender/lib/graphic/Image.js
function rc(e) {
	return !!(e && typeof e != "string" && e.width && e.height);
}
var ic, ac, oc, sc = M((() => {
	F(), zo(), Or(), q(), ic = et({
		x: 0,
		y: 0
	}, Mo), ac = { style: et({
		x: !0,
		y: !0,
		width: !0,
		height: !0,
		sx: !0,
		sy: !0,
		sWidth: !0,
		sHeight: !0
	}, No.style) }, oc = function(e) {
		P(t, e);
		function t() {
			return e !== null && e.apply(this, arguments) || this;
		}
		return t.prototype.createStyle = function(e) {
			return kt(ic, e);
		}, t.prototype._getSize = function(e) {
			var t = this.style, n = t[e];
			if (n != null) return n;
			var r = rc(t.image) ? t.image : this.__image;
			if (!r) return 0;
			var i = e === "width" ? "height" : "width", a = t[i];
			return a == null ? r[e] : r[e] / r[i] * a;
		}, t.prototype.getWidth = function() {
			return this._getSize("width");
		}, t.prototype.getHeight = function() {
			return this._getSize("height");
		}, t.prototype.getAnimationStyleProps = function() {
			return ac;
		}, t.prototype.getBoundingRect = function() {
			var e = this.style;
			return this._rect ||= new Y(e.x || 0, e.y || 0, this.getWidth(), this.getHeight()), this._rect;
		}, t;
	}(Io), oc.prototype.type = "image";
}));
//#endregion
//#region node_modules/zrender/lib/graphic/helper/roundRect.js
function cc(e, t) {
	var n = t.x, r = t.y, i = t.width, a = t.height, o = t.r, s, c, l, u;
	i < 0 && (n += i, i = -i), a < 0 && (r += a, a = -a), typeof o == "number" ? s = c = l = u = o : o instanceof Array ? o.length === 1 ? s = c = l = u = o[0] : o.length === 2 ? (s = l = o[0], c = u = o[1]) : o.length === 3 ? (s = o[0], c = u = o[1], l = o[2]) : (s = o[0], c = o[1], l = o[2], u = o[3]) : s = c = l = u = 0;
	var d;
	s + c > i && (d = s + c, s *= i / d, c *= i / d), l + u > i && (d = l + u, l *= i / d, u *= i / d), c + l > a && (d = c + l, c *= a / d, l *= a / d), s + u > a && (d = s + u, s *= a / d, u *= a / d), e.moveTo(n + s, r), e.lineTo(n + i - c, r), c !== 0 && e.arc(n + i - c, r + c, c, -Math.PI / 2, 0), e.lineTo(n + i, r + a - l), l !== 0 && e.arc(n + i - l, r + a - l, l, 0, Math.PI / 2), e.lineTo(n + u, r + a), u !== 0 && e.arc(n + u, r + a - u, u, Math.PI / 2, Math.PI), e.lineTo(n, r + s), s !== 0 && e.arc(n + s, r + s, s, Math.PI, Math.PI * 1.5), e.closePath();
}
var lc = M((() => {}));
//#endregion
//#region node_modules/zrender/lib/graphic/helper/subPixelOptimize.js
function uc(e, t, n) {
	if (t) {
		var r = t.x1, i = t.x2, a = t.y1, o = t.y2;
		e.x1 = r, e.x2 = i, e.y1 = a, e.y2 = o;
		var s = n && n.lineWidth;
		return s ? (pc(r * 2) === pc(i * 2) && (e.x1 = e.x2 = fc(r, s, !0)), pc(a * 2) === pc(o * 2) && (e.y1 = e.y2 = fc(a, s, !0)), e) : e;
	}
}
function dc(e, t, n) {
	if (t) {
		var r = t.x, i = t.y, a = t.width, o = t.height;
		e.x = r, e.y = i, e.width = a, e.height = o;
		var s = n && n.lineWidth;
		return s ? (e.x = fc(r, s, !0), e.y = fc(i, s, !0), e.width = Math.max(fc(r + a, s, !1) - e.x, a === 0 ? 0 : 1), e.height = Math.max(fc(i + o, s, !1) - e.y, o === 0 ? 0 : 1), e) : e;
	}
}
function fc(e, t, n) {
	if (!t) return e;
	var r = pc(e * 2);
	return (r + pc(t)) % 2 == 0 ? r / 2 : (r + (n ? 1 : -1)) / 2;
}
var pc, mc = M((() => {
	pc = Math.round;
})), hc, gc, _c, vc = M((() => {
	F(), $s(), lc(), mc(), hc = function() {
		function e() {
			this.x = 0, this.y = 0, this.width = 0, this.height = 0;
		}
		return e;
	}(), gc = {}, _c = function(e) {
		P(t, e);
		function t(t) {
			return e.call(this, t) || this;
		}
		return t.prototype.getDefaultShape = function() {
			return new hc();
		}, t.prototype.buildPath = function(e, t) {
			var n, r, i, a;
			if (this.subPixelOptimize) {
				var o = dc(gc, t, this.style);
				n = o.x, r = o.y, i = o.width, a = o.height, o.r = t.r, t = o;
			} else n = t.x, r = t.y, i = t.width, a = t.height;
			t.r ? cc(e, t) : e.rect(n, r, i, a);
		}, t.prototype.isZeroArea = function() {
			return !this.shape.width || !this.shape.height;
		}, t;
	}(Qs), _c.prototype.type = "rect";
}));
//#endregion
//#region node_modules/zrender/lib/graphic/Text.js
function yc(e) {
	return typeof e == "string" && (e.indexOf("px") !== -1 || e.indexOf("rem") !== -1 || e.indexOf("em") !== -1) ? e : isNaN(+e) ? "12px" : e + "px";
}
function bc(e, t) {
	for (var n = 0; n < Ic.length; n++) {
		var r = Ic[n], i = t[r];
		i != null && (e[r] = i);
	}
}
function xc(e) {
	return e.fontSize != null || e.fontFamily || e.fontWeight;
}
function Sc(e) {
	return Cc(e), R(e.rich, Cc), e;
}
function Cc(e) {
	if (e) {
		e.font = Nc.makeFont(e);
		var t = e.align;
		t === "middle" && (t = "center"), e.align = t == null || Pc[t] ? t : "left";
		var n = e.verticalAlign;
		n === "center" && (n = "middle"), e.verticalAlign = n == null || Fc[n] ? n : "top", e.padding &&= Ct(e.padding);
	}
}
function wc(e, t) {
	return e == null || t <= 0 || e === "transparent" || e === "none" ? null : e.image || e.colorStops ? "#000" : e;
}
function Tc(e) {
	return e == null || e === "none" ? null : e.image || e.colorStops ? "#000" : e;
}
function Ec(e, t, n) {
	return t === "right" ? e - n[1] : t === "center" ? e + n[3] / 2 - n[1] / 2 : e + n[3];
}
function Dc(e) {
	var t = e.text;
	return t != null && (t += ""), t;
}
function Oc(e) {
	return !!(e.backgroundColor || e.lineHeight || e.borderWidth && e.borderColor);
}
var kc, Ac, jc, Mc, Nc, Pc, Fc, Ic, Lc = M((() => {
	F(), fi(), nc(), q(), Ur(), sc(), vc(), Or(), zo(), Ye(), kc = { fill: "#000" }, Ac = 2, jc = {}, Mc = { style: et({
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
	}, No.style) }, Nc = function(e) {
		P(t, e);
		function t(t) {
			var n = e.call(this) || this;
			return n.type = "text", n._children = [], n._defaultStyle = kc, n.attr(t), n;
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
			this._childCursor = 0, Sc(this.style), this.style.rich ? this._updateRichTexts() : this._updatePlainTexts(), this._children.length = this._childCursor, this.styleUpdated();
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
			this._defaultStyle = e || kc;
		}, t.prototype.setTextContent = function(e) {
			if (process.env.NODE_ENV !== "production") throw Error("Can't attach text on another text");
		}, t.prototype._mergeStyle = function(e, t) {
			if (!t) return e;
			var n = t.rich, r = e.rich || n && {};
			return L(e, t), n && r ? (this._mergeRich(r, n), e.rich = r) : r && (e.rich = r), e;
		}, t.prototype._mergeRich = function(e, t) {
			for (var n = ct(t), r = 0; r < n.length; r++) {
				var i = n[r];
				e[i] = e[i] || {}, L(e[i], t[i]);
			}
		}, t.prototype.getAnimationStyleProps = function() {
			return Mc;
		}, t.prototype._getOrCreateChild = function(e) {
			var t = this._children[this._childCursor];
			return (!t || !(t instanceof e)) && (t = new e()), this._children[this._childCursor++] = t, t.__zr = this.__zr, t.parent = this, t;
		}, t.prototype._updatePlainTexts = function() {
			var e = this.style, t = e.font || "12px sans-serif", n = e.padding, r = this._defaultStyle, i = e.x || 0, a = e.y || 0, o = e.align || r.align || "left", s = e.verticalAlign || r.verticalAlign || "top";
			ei(jc, r.overflowRect, i, a, o, s), i = jc.baseX, a = jc.baseY;
			var c = Jr(Dc(e), e, jc.outerWidth, jc.outerHeight), l = Oc(e), u = !!e.backgroundColor, d = c.outerHeight, f = c.outerWidth, p = c.lines, m = c.lineHeight;
			this.isTruncated = !!c.isTruncated;
			var h = i, g = Ir(a, c.contentHeight, s);
			if (l || n) {
				var _ = Fr(i, f, o), v = Ir(a, d, s);
				l && this._renderBackground(e, e, _, v, f, d);
			}
			g += m / 2, n && (h = Ec(i, o, n), s === "top" ? g += n[0] : s === "bottom" && (g -= n[2]));
			for (var y = 0, b = !1, x = !1, S = Tc("fill" in e ? e.fill : (x = !0, r.fill)), C = wc("stroke" in e ? e.stroke : !u && (!r.autoStroke || x) ? (y = Ac, b = !0, r.stroke) : null), w = e.textShadowBlur > 0, T = 0; T < p.length; T++) {
				var E = this._getOrCreateChild(tc), D = E.createStyle();
				E.useStyle(D), D.text = p[T], D.x = h, D.y = g, o && (D.textAlign = o), D.textBaseline = "middle", D.opacity = e.opacity, D.strokeFirst = !0, w && (D.shadowBlur = e.textShadowBlur || 0, D.shadowColor = e.textShadowColor || "transparent", D.shadowOffsetX = e.textShadowOffsetX || 0, D.shadowOffsetY = e.textShadowOffsetY || 0), D.stroke = C, D.fill = S, C && (D.lineWidth = e.lineWidth || y, D.lineDash = e.lineDash, D.lineDashOffset = e.lineDashOffset || 0), D.font = t, bc(D, e), g += m, E.setBoundingRect(ri(D, c.contentWidth, c.calculatedLineHeight, b ? 0 : null));
			}
		}, t.prototype._updateRichTexts = function() {
			var e = this.style, t = this._defaultStyle, n = e.align || t.align, r = e.verticalAlign || t.verticalAlign, i = e.x || 0, a = e.y || 0;
			ei(jc, t.overflowRect, i, a, n, r), i = jc.baseX, a = jc.baseY;
			var o = Yr(Dc(e), e, jc.outerWidth, jc.outerHeight, n), s = o.width, c = o.outerWidth, l = o.outerHeight, u = e.padding;
			this.isTruncated = !!o.isTruncated;
			var d = Fr(i, c, n), f = Ir(a, l, r), p = d, m = f;
			u && (p += u[3], m += u[0]);
			var h = p + s;
			Oc(e) && this._renderBackground(e, e, d, f, c, l);
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
			c === "top" ? l = r + e.height / 2 : c === "bottom" && (l = r + n - e.height / 2), !e.isLineHolder && Oc(s) && this._renderBackground(s, t, a === "right" ? i - e.width : a === "center" ? i - e.width / 2 : i, l - e.height / 2, e.width, e.height);
			var u = !!s.backgroundColor, d = e.textPadding;
			d && (i = Ec(i, a, d), l -= e.height / 2 - d[0] - e.innerHeight / 2);
			var f = this._getOrCreateChild(tc), p = f.createStyle();
			f.useStyle(p);
			var m = this._defaultStyle, h = !1, g = 0, _ = !1, v = Tc("fill" in s ? s.fill : "fill" in t ? t.fill : (h = !0, m.fill)), y = wc("stroke" in s ? s.stroke : "stroke" in t ? t.stroke : !u && !o && (!m.autoStroke || h) ? (g = Ac, _ = !0, m.stroke) : null), b = s.textShadowBlur > 0 || t.textShadowBlur > 0;
			p.text = e.text, p.x = i, p.y = l, b && (p.shadowBlur = s.textShadowBlur || t.textShadowBlur || 0, p.shadowColor = s.textShadowColor || t.textShadowColor || "transparent", p.shadowOffsetX = s.textShadowOffsetX || t.textShadowOffsetX || 0, p.shadowOffsetY = s.textShadowOffsetY || t.textShadowOffsetY || 0), p.textAlign = a, p.textBaseline = "middle", p.font = e.font || "12px sans-serif", p.opacity = xt(s.opacity, t.opacity, 1), bc(p, s), y && (p.lineWidth = xt(s.lineWidth, t.lineWidth, g), p.lineDash = W(s.lineDash, t.lineDash), p.lineDashOffset = t.lineDashOffset || 0, p.stroke = y), v && (p.fill = v), f.setBoundingRect(ri(p, e.contentWidth, e.contentHeight, _ ? 0 : null));
		}, t.prototype._renderBackground = function(e, t, n, r, i, a) {
			var o = e.backgroundColor, s = e.borderWidth, c = e.borderColor, l = o && o.image, u = o && !l, d = e.borderRadius, f = this, p, m;
			if (u || e.lineHeight || s && c) {
				p = this._getOrCreateChild(_c), p.useStyle(p.createStyle()), p.style.fill = null;
				var h = p.shape;
				h.x = n, h.y = r, h.width = i, h.height = a, h.r = d, p.dirtyShape();
			}
			if (u) {
				var g = p.style;
				g.fill = o || null, g.fillOpacity = W(e.fillOpacity, 1);
			} else if (l) {
				m = this._getOrCreateChild(oc), m.onload = function() {
					f.dirtyStyle();
				};
				var _ = m.style;
				_.image = o.image, _.x = n, _.y = r, _.width = i, _.height = a;
			}
			if (s && c) {
				var g = p.style;
				g.lineWidth = s, g.stroke = c, g.strokeOpacity = W(e.strokeOpacity, 1), g.lineDash = e.borderDash, g.lineDashOffset = e.borderDashOffset || 0, p.strokeContainThreshold = 0, p.hasFill() && p.hasStroke() && (g.strokeFirst = !0, g.lineWidth *= 2);
			}
			var v = (p || m).style;
			v.shadowBlur = e.shadowBlur || 0, v.shadowColor = e.shadowColor || "transparent", v.shadowOffsetX = e.shadowOffsetX || 0, v.shadowOffsetY = e.shadowOffsetY || 0, v.opacity = xt(e.opacity, t.opacity, 1);
		}, t.makeFont = function(e) {
			var t = "";
			return xc(e) && (t = [
				e.fontStyle,
				e.fontWeight,
				yc(e.fontSize),
				e.fontFamily || "sans-serif"
			].join(" ")), t && wt(t) || e.textFont || e.font;
		}, t;
	}(Io), Pc = {
		left: !0,
		right: 1,
		center: 1
	}, Fc = {
		top: 1,
		bottom: 1,
		middle: 1
	}, Ic = [
		"fontStyle",
		"fontWeight",
		"fontSize",
		"fontFamily"
	];
}));
//#endregion
//#region node_modules/echarts/lib/util/number.js
function Rc(e) {
	return e.replace(/^\s+|\s+$/g, "");
}
function zc(e, t, n, r) {
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
function Bc(e, t, n) {
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
	return Vc(e, t, n);
}
function Vc(e, t, n) {
	return H(e) ? Hc(e) ? parseFloat(e) / 100 * t + (n || 0) : parseFloat(e) : e == null ? NaN : +e;
}
function Hc(e) {
	return !!Rc(e).match(/%$/);
}
function X(e, t, n) {
	return process.env.NODE_ENV !== "production" && G(t != null), isNaN(t) ? n ? "" + e : +e : (t = cl(ll(0, t), sl), e = (+e).toFixed(t), n ? e : +e);
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
	return n > sl ? r : X(r, n);
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
	if (H(e)) {
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
	return e = (t === 2 ? 1 : t ? i < 1.5 ? 1 : i < 2.5 ? 2 : i < 4 ? 3 : i < 7 ? 5 : 10 : i < 1 ? 1 : i < 2 ? 2 : i < 3 ? 3 : i < 5 ? 5 : 10) * r, X(e, -n);
}
function el(e) {
	var t = parseFloat(e);
	return t == e && (t !== 0 || !H(e) || e.indexOf("x") <= 0) ? t : NaN;
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
var ol, sl, cl, ll, ul, dl, fl, pl, ml, hl, gl, _l, vl, yl, bl, xl, Sl = M((() => {
	q(), ol = 1e-4, sl = 20, cl = Math.min, ll = Math.max, ul = Math.abs, dl = Math.round, fl = Math.floor, pl = Math.ceil, ml = Math.pow, hl = Math.log, gl = Math.LN10, _l = Math.PI, vl = Math.random, yl = Bc, bl = ml(2, 53) - 1, xl = /^(?:(\d{4})(?:[-\/](\d{1,2})(?:[-\/](\d{1,2})(?:[T ](\d{1,2})(?::(\d{1,2})(?::(\d{1,2})(?:[.,](\d+))?)?)?(Z|[\+\-]\d\d:?\d\d)?)?)?)?)?$/;
}));
//#endregion
//#region node_modules/echarts/lib/util/log.js
function Cl(e, t, n) {
	if (Nl) {
		if (n) {
			if (Ml[t]) return;
			Ml[t] = !0;
		}
		console[e](jl + t);
	}
}
function wl(e, t) {
	Cl("log", e, t);
}
function Tl(e, t) {
	Cl("warn", e, t);
}
function El(e, t) {
	Cl("error", e, t);
}
function Dl(e) {
	process.env.NODE_ENV !== "production" && Cl("warn", "DEPRECATED: " + e, !0);
}
function Ol(e, t, n) {
	process.env.NODE_ENV !== "production" && Dl((n ? "[" + n + "]" : "") + (e + " is deprecated; use " + t + " instead."));
}
function kl() {
	var e = [...arguments], t = "";
	if (process.env.NODE_ENV !== "production") {
		var n = function(e) {
			return e === void 0 ? "undefined" : e === Infinity ? "Infinity" : e === -Infinity ? "-Infinity" : yt(e) ? "NaN" : e instanceof Date ? "Date(" + e.toISOString() + ")" : V(e) ? "function () { ... }" : vt(e) ? e + "" : null;
		};
		t = z(e, function(e) {
			if (H(e)) return e;
			var t = n(e);
			if (t != null) return t;
			if (typeof JSON < "u" && JSON.stringify) try {
				return JSON.stringify(e, function(e, t) {
					return n(t) ?? t;
				});
			} catch {
				return "?";
			}
			return "?";
		}).join(" ");
	}
	return t;
}
function Al(e) {
	throw Error(e);
}
var jl, Ml, Nl, Pl = M((() => {
	q(), jl = "[ECharts] ", Ml = {}, Nl = typeof console < "u" && console.warn && console.log;
}));
//#endregion
//#region node_modules/echarts/lib/util/model.js
function Fl(e, t, n) {
	return (t - e) * n + e;
}
function Il(e) {
	return e instanceof Array ? e : e == null ? [] : [e];
}
function Ll(e, t, n) {
	if (e) {
		e[t] = e[t] || {}, e.emphasis = e.emphasis || {}, e.emphasis[t] = e.emphasis[t] || {};
		for (var r = 0, i = n.length; r < i; r++) {
			var a = n[r];
			!e.emphasis[t].hasOwnProperty(a) && e[t].hasOwnProperty(a) && (e.emphasis[t][a] = e[t][a]);
		}
	}
}
function Rl(e) {
	return U(e) && !B(e) && !(e instanceof Date) ? e.value : e;
}
function zl(e) {
	return U(e) && !(e instanceof Array);
}
function Bl(e, t, n) {
	var r = n === "normalMerge", i = n === "replaceMerge", a = n === "replaceAll";
	e ||= [], t = (t || []).slice();
	var o = K();
	R(t, function(e, n) {
		if (!U(e)) {
			t[n] = null;
			return;
		}
		process.env.NODE_ENV !== "production" && (e.id != null && !Zl(e.id) && Xl(e.id), e.name != null && !Zl(e.name) && Xl(e.name));
	});
	var s = Vl(e, o, n);
	return (r || i) && Hl(s, e, o, t), r && Ul(s, t), r || i ? Wl(s, t, i) : a && Gl(s, t), Kl(s), s;
}
function Vl(e, t, n) {
	var r = [];
	if (n === "replaceAll") return r;
	for (var i = 0; i < e.length; i++) {
		var a = e[i];
		a && a.id != null && t.set(a.id, i), r.push({
			existing: n === "replaceMerge" || $l(a) ? null : a,
			newOption: null,
			keyInfo: null,
			brandNew: null
		});
	}
	return r;
}
function Hl(e, t, n, r) {
	R(r, function(i, a) {
		if (i && i.id != null) {
			var o = Jl(i.id), s = n.get(o);
			if (s != null) {
				var c = e[s];
				G(!c.newOption, "Duplicated option on id \"" + o + "\"."), c.newOption = i, c.existing = t[s], r[a] = null;
			}
		}
	});
}
function Ul(e, t) {
	R(t, function(n, r) {
		if (n && n.name != null) for (var i = 0; i < e.length; i++) {
			var a = e[i].existing;
			if (!e[i].newOption && a && (a.id == null || n.id == null) && !$l(n) && !$l(a) && ql("name", a, n)) {
				e[i].newOption = n, t[r] = null;
				return;
			}
		}
	});
}
function Wl(e, t, n) {
	R(t, function(t) {
		if (t) {
			for (var r, i = 0; (r = e[i]) && (r.newOption || $l(r.existing) || r.existing && t.id != null && !ql("id", t, r.existing));) i++;
			r ? (r.newOption = t, r.brandNew = n) : e.push({
				newOption: t,
				brandNew: n,
				existing: null,
				keyInfo: null
			}), i++;
		}
	});
}
function Gl(e, t) {
	R(t, function(t) {
		e.push({
			newOption: t,
			brandNew: !0,
			existing: null,
			keyInfo: null
		});
	});
}
function Kl(e) {
	var t = K();
	R(e, function(e) {
		var n = e.existing;
		n && t.set(n.id, e);
	}), R(e, function(e) {
		var n = e.newOption;
		G(!n || n.id == null || !t.get(n.id) || t.get(n.id) === e, "id duplicates: " + (n && n.id)), n && n.id != null && t.set(n.id, e), !e.keyInfo && (e.keyInfo = {});
	}), R(e, function(e, n) {
		var r = e.existing, i = e.newOption, a = e.keyInfo;
		if (U(i)) {
			if (a.name = i.name == null ? r ? r.name : Du + n : Jl(i.name), r) a.id = Jl(r.id);
			else if (i.id != null) a.id = Jl(i.id);
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
function ql(e, t, n) {
	var r = Yl(t[e], null), i = Yl(n[e], null);
	return r != null && i != null && r === i;
}
function Jl(e) {
	if (process.env.NODE_ENV !== "production" && e == null) throw Error();
	return Yl(e, "");
}
function Yl(e, t) {
	return e == null ? t : H(e) ? e : ft(e) || dt(e) ? e + "" : t;
}
function Xl(e) {
	process.env.NODE_ENV !== "production" && Tl("`" + e + "` is invalid id or name. Must be a string or number.");
}
function Zl(e) {
	return dt(e) || tl(e);
}
function Ql(e) {
	var t = e.name;
	return !!(t && t.indexOf(Du));
}
function $l(e) {
	return e && e.id != null && Jl(e.id).indexOf(Ou) === 0;
}
function eu(e, t, n) {
	R(e, function(e) {
		var r = e.newOption;
		U(r) && (e.keyInfo.mainType = t, e.keyInfo.subType = tu(t, r, e.existing, n));
	});
}
function tu(e, t, n, r) {
	return t.type ? t.type : n ? n.subType : r.determineSubType(e, t);
}
function nu(e, t) {
	if (t.dataIndexInside != null) return t.dataIndexInside;
	if (t.dataIndex != null) return B(t.dataIndex) ? z(t.dataIndex, function(t) {
		return e.indexOfRawIndex(t);
	}) : e.indexOfRawIndex(t.dataIndex);
	if (t.name != null) return B(t.name) ? z(t.name, function(t) {
		return e.indexOfName(t);
	}) : e.indexOfName(t.name);
}
function ru() {
	var e = "__ec_inner_" + Au++;
	return function(t) {
		return t[e] || (t[e] = {});
	};
}
function iu(e, t, n) {
	var r = au(t, n), i = r.mainTypeSpecified, a = r.queryOptionMap, o = r.others, s = n ? n.defaultMainType : null;
	return !i && s && a.set(s, {}), a.each(function(t, r) {
		var i = ou(e, r, t, {
			useDefault: s === r,
			enableAll: n && n.enableAll != null ? n.enableAll : !0,
			enableNone: n && n.enableNone != null ? n.enableNone : !0
		});
		o[r + "Models"] = i.models, o[r + "Model"] = i.models[0];
	}), o;
}
function au(e, t) {
	var n;
	if (H(e)) {
		var r = {};
		r[e + "Index"] = 0, n = r;
	} else n = e;
	var i = K(), a = {}, o = !1;
	return R(n, function(e, n) {
		if (n === "dataIndex" || n === "dataIndexInside") {
			a[n] = e;
			return;
		}
		var r = n.match(/^(\w+)(Index|Id|Name)$/) || [], s = r[1], c = (r[2] || "").toLowerCase();
		if (!(!s || !c || t && t.includeMainTypes && tt(t.includeMainTypes, s) < 0)) {
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
function ou(e, t, n, r) {
	r ||= ju;
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
		process.env.NODE_ENV !== "production" && El("`\"none\"` or `false` is not a valid value on index option."), i = -1;
	}
	return i === "all" && (r.enableAll ? i = a = o = null : (process.env.NODE_ENV !== "production" && El("`\"all\"` is not a valid value on index option."), i = -1)), s.models = e.queryComponents({
		mainType: t,
		index: i,
		id: a,
		name: o
	}), s;
}
function su(e, t, n) {
	process.env.NODE_ENV !== "production" && G(t);
	var r = {};
	r[t + "Id"] = e[t + "Id"], r[t + "Index"] = e[t + "Index"], r[t + "Name"] = e[t + "Name"];
	var i = {
		mainType: t,
		query: r
	};
	return n && (i.subType = n), i;
}
function cu(e, t, n) {
	e.setAttribute ? e.setAttribute(t, n) : e[t] = n;
}
function lu(e, t) {
	return e.getAttribute ? e.getAttribute(t) : e[t];
}
function uu(e) {
	return e === "auto" ? J.domSupported ? "html" : "richText" : e || "html";
}
function du(e, t, n, r, i) {
	var a = t == null || t === "auto";
	if (r == null) return r;
	if (ft(r)) {
		var o = Fl(n || 0, r, i);
		return X(o, a ? Math.max(Wc(n || 0), Wc(r)) : t);
	}
	if (H(r)) return i < 1 ? n : r;
	for (var s = [], c = n, l = r, u = Math.max(c ? c.length : 0, l.length), d = 0; d < u; ++d) {
		var f = e.getDimensionInfo(d);
		if (f && f.type === "ordinal") s[d] = (i < 1 && c ? c : l)[d];
		else {
			var p = c && c[d] ? c[d] : 0, m = l[d], o = Fl(p, m, i);
			s[d] = X(o, a ? Math.max(Wc(p), Wc(m)) : t);
		}
	}
	return s;
}
function fu() {
	return [Infinity, -Infinity];
}
function pu(e, t) {
	_u(t) && (t < e[0] && (e[0] = t), t > e[1] && (e[1] = t));
}
function mu(e, t) {
	_u(t) && t < e[0] && (e[0] = t);
}
function hu(e, t) {
	_u(t) && t > e[1] && (e[1] = t);
}
function gu(e, t) {
	vu(t[0], t[1]) && (t[0] < e[0] && (e[0] = t[0]), t[1] > e[1] && (e[1] = t[1]));
}
function _u(e) {
	return e != null && isFinite(e);
}
function vu(e, t) {
	return _u(e) && _u(t) && e <= t;
}
function yu(e) {
	var t = e[1] - e[0];
	return isFinite(t) && t >= 0;
}
function bu(e) {
	vu(e[0], e[1]) && e[0] > e[1] && (e[0] = e[1]);
}
function xu() {
	var e = "__ec_once_" + Mu++;
	return function(t, n) {
		process.env.NODE_ENV !== "production" && G(t), jt(t, e) || (t[e] = 1, n());
	};
}
function Su(e, t, n) {
	var r = K(), i = 0;
	R(e, function(a) {
		var o = t(a);
		process.env.NODE_ENV !== "production" && G(H(o));
		var s = r.get(o) || 0;
		n && n(a, s), !s && !n && (e[i++] = a), r.set(o, s + 1);
	}), n || (e.length = i);
}
function Cu(e) {
	return process.env.NODE_ENV !== "production" && G(e.value != null), e.value + "";
}
function wu(e) {
	return process.env.NODE_ENV !== "production" && G(e != null), e + "";
}
function Tu(e, t, n) {
	var r = e.getData().count();
	return {
		progressiveRender: n.progressiveEnabled && t.incrementalPrepareRender && r >= n.threshold,
		large: e.get("large") && r >= e.get("largeThreshold"),
		modDataCount: e.get("progressiveChunkMode") === "mod" ? e.getData().count() : null
	};
}
function Eu(e) {
	return { overallReset: e };
}
var Du, Ou, ku, Au, ju, Mu, Z = M((() => {
	q(), en(), Sl(), Pl(), Du = "series\0", Ou = "\0_ec_\0", ku = /* @__PURE__ */ "fontStyle.fontWeight.fontSize.fontFamily.rich.tag.color.textBorderColor.textBorderWidth.width.height.lineHeight.align.verticalAlign.baseline.shadowColor.shadowBlur.shadowOffsetX.shadowOffsetY.textShadowColor.textShadowBlur.textShadowOffsetX.textShadowOffsetY.backgroundColor.borderColor.borderWidth.borderRadius.padding".split("."), Au = nl(), ju = {
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
	}(), Mu = nl();
})), Nu, Pu, Fu = M((() => {
	Z(), Nu = ru(), Pu = function(e, t, n, r) {
		if (r) {
			var i = Nu(r);
			i.dataIndex = n, i.dataType = t, i.seriesIndex = e, i.ssrType = "chart", r.type === "group" && r.traverse(function(r) {
				var i = Nu(r);
				i.seriesIndex = e, i.dataIndex = n, i.dataType = t, i.ssrType = "chart";
			});
		}
	};
})), Iu, Lu, Ru, zu, Bu, Vu, Hu, Uu, Wu = M((() => {
	q(), Iu = K([
		"tooltip",
		"label",
		"itemName",
		"itemId",
		"itemGroupId",
		"itemChildGroupId",
		"seriesName"
	]), Lu = "original", Ru = "arrayRows", zu = "objectRows", Bu = "keyedColumns", Vu = "typedArray", Hu = "unknown", Uu = "column";
}));
//#endregion
//#region node_modules/echarts/lib/core/ExtensionAPI.js
function Gu(e, t) {
	return t.mainType === "series" ? e.getViewOfSeriesModel(t) : e.getViewOfComponentModel(t);
}
var Ku, qu, Ju = M((() => {
	q(), Wu(), Ku = [
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
	], qu = function() {
		function e(e) {
			R(Ku, function(t) {
				this[t] = Kt(e[t], e);
			}, this);
		}
		return e;
	}();
}));
//#endregion
//#region node_modules/echarts/lib/util/states.js
function Yu(e) {
	return e != null && e !== "none";
}
function Xu(e, t, n) {
	e.onHoverStateChange && (e.hoverState || 0) !== n && e.onHoverStateChange(t), e.hoverState = n;
}
function Zu(e) {
	Xu(e, "emphasis", 2);
}
function Qu(e) {
	e.hoverState === 2 && Xu(e, "normal", 0);
}
function $u(e) {
	Xu(e, "blur", 1);
}
function ed(e) {
	e.hoverState === 1 && Xu(e, "normal", 0);
}
function td(e) {
	e.selected = !0;
}
function nd(e) {
	e.selected = !1;
}
function rd(e, t, n) {
	t(e, n);
}
function id(e, t, n) {
	rd(e, t, n), e.isGroup && e.traverse(function(e) {
		rd(e, t, n);
	});
}
function ad(e, t) {
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
function od(e, t, n, r) {
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
function sd(e, t, n, r) {
	var i = n && tt(n, "select") >= 0, a = !1;
	if (e instanceof Qs) {
		var o = Wd(e), s = i && o.selectFill || o.normalFill, c = i && o.selectStroke || o.normalStroke;
		if (Yu(s) || Yu(c)) {
			r ||= {};
			var l = r.style || {};
			l.fill === "inherit" ? (a = !0, r = L({}, r), l = L({}, l), l.fill = s) : !Yu(l.fill) && Yu(s) ? (a = !0, r = L({}, r), l = L({}, l), l.fill = Sa(s)) : !Yu(l.stroke) && Yu(c) && (a || (r = L({}, r), l = L({}, l)), l.stroke = Sa(c)), r.style = l;
		}
	}
	if (r && r.z2 == null) {
		a || (r = L({}, r));
		var u = e.z2EmphasisLift;
		r.z2 = e.z2 + (u ?? 10);
	}
	return r;
}
function cd(e, t, n) {
	if (n && n.z2 == null) {
		n = L({}, n);
		var r = e.z2SelectLift;
		n.z2 = e.z2 + (r ?? 9);
	}
	return n;
}
function ld(e, t, n) {
	var r = tt(e.currentStates, t) >= 0, i = e.style.opacity, a = r ? null : od(e, ["opacity"], t, { opacity: 1 });
	n ||= {};
	var o = n.style || {};
	return o.opacity ?? (n = L({}, n), o = L({ opacity: r ? i : a.opacity * .1 }, o), n.style = o), n;
}
function ud(e, t) {
	var n = this.states[e];
	if (this.style) {
		if (e === "emphasis") return sd(this, e, t, n);
		if (e === "blur") return ld(this, e, n);
		if (e === "select") return cd(this, e, n);
	}
	return n;
}
function dd(e) {
	e.stateProxy = ud;
	var t = e.getTextContent(), n = e.getTextGuideLine();
	t && (t.stateProxy = ud), n && (n.stateProxy = ud);
}
function fd(e, t) {
	!bd(e, t) && !e.__highByOuter && id(e, Zu);
}
function pd(e, t) {
	!bd(e, t) && !e.__highByOuter && id(e, Qu);
}
function md(e, t) {
	e.__highByOuter |= 1 << (t || 0), id(e, Zu);
}
function hd(e, t) {
	!(e.__highByOuter &= ~(1 << (t || 0))) && id(e, Qu);
}
function gd(e) {
	id(e, $u);
}
function _d(e) {
	id(e, ed);
}
function vd(e) {
	id(e, td);
}
function yd(e) {
	id(e, nd);
}
function bd(e, t) {
	return e.__highDownSilentOnTouch && t.zrByTouch;
}
function xd(e) {
	var t = e.getModel(), n = [], r = [];
	t.eachComponent(function(t, i) {
		var a = Gd(i), o = Gu(e, i), s = t === "series";
		!s && r.push(o), a.isBlured && (o.group.traverse(function(e) {
			ed(e);
		}), s && n.push(i)), a.isBlured = !1;
	}), R(r, function(e) {
		e && e.toggleBlurSeries && e.toggleBlurSeries(n, !1, t);
	});
}
function Sd(e, t, n, r) {
	var i = r.getModel();
	n ||= "coordinateSystem";
	function a(e, t) {
		for (var n = 0; n < t.length; n++) {
			var r = e.getItemGraphicEl(t[n]);
			r && _d(r);
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
					e.__highByOuter && i && t === "self" || $u(e);
				}), it(t)) a(e.getData(), t);
				else if (U(t)) for (var u = ct(t), d = 0; d < u.length; d++) a(e.getData(u[d]), t[u[d]]);
				c.push(e), Gd(e).isBlured = !0;
			}
		}), i.eachComponent(function(e, t) {
			if (e !== "series") {
				var n = r.getViewOfComponentModel(t);
				n && n.toggleBlurSeries && n.toggleBlurSeries(c, !0, i);
			}
		});
	}
}
function Cd(e, t, n) {
	if (e != null && t != null) {
		var r = n.getModel().getComponent(e, t);
		if (r) {
			Gd(r).isBlured = !0;
			var i = n.getViewOfComponentModel(r);
			i && i.focusBlurEnabled && i.group.traverse(function(e) {
				$u(e);
			});
		}
	}
}
function wd(e, t, n) {
	var r = e.seriesIndex, i = e.getData(t.dataType);
	if (!i) {
		process.env.NODE_ENV !== "production" && El("Unknown dataType " + t.dataType);
		return;
	}
	var a = nu(i, t);
	a = (B(a) ? a[0] : a) || 0;
	var o = i.getItemGraphicEl(a);
	if (!o) for (var s = i.count(), c = 0; !o && c < s;) o = i.getItemGraphicEl(c++);
	if (o) {
		var l = Nu(o);
		Sd(r, l.focus, l.blurScope, n);
	} else {
		var u = e.get(["emphasis", "focus"]), d = e.get(["emphasis", "blurScope"]);
		u != null && Sd(r, u, d, n);
	}
}
function Td(e, t, n, r) {
	var i = {
		focusSelf: !1,
		dispatchers: null
	};
	if (e == null || e === "series" || t == null || n == null) return i;
	var a = r.getModel().getComponent(e, t);
	if (!a) return i;
	var o = r.getViewOfComponentModel(a);
	if (!o || !o.findHighDownDispatchers) return i;
	for (var s = o.findHighDownDispatchers(n), c, l = 0; l < s.length; l++) if (process.env.NODE_ENV !== "production" && !Ld(s[l]) && El("param should be highDownDispatcher"), Nu(s[l]).focus === "self") {
		c = !0;
		break;
	}
	return {
		focusSelf: c,
		dispatchers: s
	};
}
function Ed(e, t, n) {
	process.env.NODE_ENV !== "production" && !Ld(e) && El("param should be highDownDispatcher");
	var r = Nu(e), i = Td(r.componentMainType, r.componentIndex, r.componentHighDownName, n), a = i.dispatchers, o = i.focusSelf;
	a ? (o && Cd(r.componentMainType, r.componentIndex, n), R(a, function(e) {
		return fd(e, t);
	})) : (Sd(r.seriesIndex, r.focus, r.blurScope, n), r.focus === "self" && Cd(r.componentMainType, r.componentIndex, n), fd(e, t));
}
function Dd(e, t, n) {
	process.env.NODE_ENV !== "production" && !Ld(e) && El("param should be highDownDispatcher"), xd(n);
	var r = Nu(e), i = Td(r.componentMainType, r.componentIndex, r.componentHighDownName, n).dispatchers;
	i ? R(i, function(e) {
		return pd(e, t);
	}) : pd(e, t);
}
function Od(e, t, n) {
	if (zd(t)) {
		var r = t.dataType, i = nu(e.getData(r), t);
		B(i) || (i = [i]), e[t.type === "toggleSelect" ? "toggleSelect" : t.type === "select" ? "select" : "unselect"](i, r);
	}
}
function kd(e) {
	R(e.getAllData(), function(t) {
		var n = t.data, r = t.type;
		n.eachItemGraphicEl(function(t, n) {
			e.isSelected(n, r) ? vd(t) : yd(t);
		});
	});
}
function Ad(e) {
	var t = [];
	return e.eachSeries(function(e) {
		R(e.getAllData(), function(n) {
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
function jd(e, t, n) {
	Id(e, !0), id(e, dd), Pd(e, t, n);
}
function Md(e) {
	Id(e, !1);
}
function Nd(e, t, n, r) {
	r ? Md(e) : jd(e, t, n);
}
function Pd(e, t, n) {
	var r = Nu(e);
	t == null ? r.focus &&= null : (r.focus = t, r.blurScope = n);
}
function Fd(e, t, n, r) {
	n ||= "itemStyle";
	for (var i = 0; i < ef.length; i++) {
		var a = ef[i], o = t.getModel([a, n]), s = e.ensureState(a);
		s.style = r ? r(o) : o[tf[n]]();
	}
}
function Id(e, t) {
	var n = t === !1, r = e;
	e.highDownSilentOnTouch && (r.__highDownSilentOnTouch = e.highDownSilentOnTouch), (!n || r.__highDownDispatcher) && (r.__highByOuter = r.__highByOuter || 0, r.__highDownDispatcher = !n);
}
function Ld(e) {
	return !!(e && e.__highDownDispatcher);
}
function Rd(e) {
	var t = Ud[e];
	return t == null && Hd <= 32 && (t = Ud[e] = Hd++), t;
}
function zd(e) {
	var t = e.type;
	return t === "select" || t === "unselect" || t === "toggleSelect";
}
function Bd(e) {
	var t = e.type;
	return t === "highlight" || t === "downplay";
}
function Vd(e) {
	var t = Wd(e);
	t.normalFill = e.style.fill, t.normalStroke = e.style.stroke;
	var n = e.states.select || {};
	t.selectFill = n.style && n.style.fill || null, t.selectStroke = n.style && n.style.stroke || null;
}
var Hd, Ud, Wd, Gd, Kd, qd, Jd, Yd, Xd, Zd, Qd, $d, ef, tf, nf = M((() => {
	q(), Fu(), Da(), Z(), $s(), Ju(), Pl(), Hd = 1, Ud = {}, Wd = ru(), Gd = ru(), Kd = [
		"emphasis",
		"blur",
		"select"
	], qd = [
		"normal",
		"emphasis",
		"blur",
		"select"
	], Jd = "highlight", Yd = "downplay", Xd = "select", Zd = "unselect", Qd = "toggleSelect", $d = "selectchanged", ef = [
		"emphasis",
		"blur",
		"select"
	], tf = {
		itemStyle: "getItemStyle",
		lineStyle: "getLineStyle",
		areaStyle: "getAreaStyle"
	};
}));
//#endregion
//#region node_modules/zrender/lib/tool/transformPath.js
function rf(e, t) {
	if (t) {
		var n = e.data, r = e.len(), i, a, o, s, c, l, u = af.M, d = af.C, f = af.L, p = af.R, m = af.A, h = af.Q;
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
					var g = t[4], _ = t[5], v = sf(t[0] * t[0] + t[1] * t[1]), y = sf(t[2] * t[2] + t[3] * t[3]), b = cf(-t[1] / y, t[0] / v);
					n[o] *= v, n[o++] += g, n[o] *= y, n[o++] += _, n[o++] *= v, n[o++] *= y, n[o++] += b, n[o++] += b, o += 2, s = o;
					break;
				case p: l[0] = n[o++], l[1] = n[o++], $n(l, l, t), n[s++] = l[0], n[s++] = l[1], l[0] += n[o++], l[1] += n[o++], $n(l, l, t), n[s++] = l[0], n[s++] = l[1];
			}
			for (c = 0; c < a; c++) {
				var x = of[c];
				x[0] = n[o++], x[1] = n[o++], $n(x, x, t), n[s++] = x[0], n[s++] = x[1];
			}
		}
		e.increaseVersion();
	}
}
var af, of, sf, cf, lf = M((() => {
	bs(), ir(), af = ys.CMD, of = [
		[],
		[],
		[]
	], sf = Math.sqrt, cf = Math.atan2;
}));
//#endregion
//#region node_modules/zrender/lib/tool/path.js
function uf(e) {
	return Math.sqrt(e[0] * e[0] + e[1] * e[1]);
}
function df(e, t) {
	return (e[0] * t[0] + e[1] * t[1]) / (uf(e) * uf(t));
}
function ff(e, t) {
	return (e[0] * t[1] < e[1] * t[0] ? -1 : 1) * Math.acos(df(e, t));
}
function pf(e, t, n, r, i, a, o, s, c, l, u) {
	var d = Cf / 180 * c, f = Sf(d) * (e - n) / 2 + xf(d) * (t - r) / 2, p = -1 * xf(d) * (e - n) / 2 + Sf(d) * (t - r) / 2, m = f * f / (o * o) + p * p / (s * s);
	m > 1 && (o *= bf(m), s *= bf(m));
	var h = (i === a ? -1 : 1) * bf((o * o * (s * s) - o * o * (p * p) - s * s * (f * f)) / (o * o * (p * p) + s * s * (f * f))) || 0, g = h * o * p / s, _ = h * -s * f / o, v = (e + n) / 2 + Sf(d) * g - xf(d) * _, y = (t + r) / 2 + xf(d) * g + Sf(d) * _, b = ff([1, 0], [(f - g) / o, (p - _) / s]), x = [(f - g) / o, (p - _) / s], S = [(-1 * f - g) / o, (-1 * p - _) / s], C = ff(x, S);
	if (df(x, S) <= -1 && (C = Cf), df(x, S) >= 1 && (C = 0), C < 0) {
		var w = Math.round(C / Cf * 1e6) / 1e6;
		C = Cf * 2 + w % 2 * Cf;
	}
	u.addData(l, v, y, o, s, b, C, d, a);
}
function mf(e) {
	var t = new ys();
	if (!e) return t;
	var n = 0, r = 0, i = n, a = r, o, s = ys.CMD, c = e.match(wf);
	if (!c) return t;
	for (var l = 0; l < c.length; l++) {
		for (var u = c[l], d = u.charAt(0), f = void 0, p = u.match(Tf) || [], m = p.length, h = 0; h < m; h++) p[h] = parseFloat(p[h]);
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
					y = p[g++], b = p[g++], x = p[g++], S = p[g++], C = p[g++], w = n, T = r, n = p[g++], r = p[g++], f = s.A, pf(w, T, n, r, S, C, y, b, x, f, t);
					break;
				case "a": y = p[g++], b = p[g++], x = p[g++], S = p[g++], C = p[g++], w = n, T = r, n += p[g++], r += p[g++], f = s.A, pf(w, T, n, r, S, C, y, b, x, f, t);
			}
		}
		(d === "z" || d === "Z") && (f = s.Z, t.addData(f), n = i, r = a), o = f;
	}
	return t.toStatic(), t;
}
function hf(e) {
	return e.setData != null;
}
function gf(e, t) {
	var n = mf(e), r = L({}, t);
	return r.buildPath = function(e) {
		var t = hf(e);
		if (t && e.canSave()) {
			e.appendPath(n);
			var r = e.getContext();
			r && e.rebuildPath(r, 1);
		} else {
			var r = t ? e.getContext() : e;
			r && n.rebuildPath(r, 1);
		}
	}, r.applyTransform = function(e) {
		rf(n, e), this.dirtyShape();
	}, r;
}
function _f(e, t) {
	return new Ef(gf(e, t));
}
function vf(e, t) {
	var n = gf(e, t);
	return function(e) {
		P(t, e);
		function t(t) {
			var r = e.call(this, t) || this;
			return r.applyTransform = n.applyTransform, r.buildPath = n.buildPath, r;
		}
		return t;
	}(Ef);
}
function yf(e, t) {
	for (var n = [], r = e.length, i = 0; i < r; i++) {
		var a = e[i];
		n.push(a.getUpdatedPathProxy(!0));
	}
	var o = new Qs(t);
	return o.createPathProxy(), o.buildPath = function(e) {
		if (hf(e)) {
			e.appendPath(n);
			var t = e.getContext();
			t && e.rebuildPath(t, 1);
		}
	}, o;
}
var bf, xf, Sf, Cf, wf, Tf, Ef, Df = M((() => {
	F(), $s(), bs(), lf(), q(), bf = Math.sqrt, xf = Math.sin, Sf = Math.cos, Cf = Math.PI, wf = /([mlvhzcqtsa])([^mlvhzcqtsa]*)/gi, Tf = /-?([0-9]*\.)?[0-9]+([eE]-?[0-9]+)?/g, Ef = function(e) {
		P(t, e);
		function t() {
			return e !== null && e.apply(this, arguments) || this;
		}
		return t.prototype.applyTransform = function(e) {}, t;
	}(Qs);
})), Of, kf = M((() => {
	F(), q(), ko(), Or(), Of = function(e) {
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
			if (e && (e !== this && e.parent !== this && (this._children.push(e), this._doAdd(e)), process.env.NODE_ENV !== "production" && e.__hostTarget)) throw "This elemenet has been used as an attachment";
			return this;
		}, t.prototype.addBefore = function(e, t) {
			if (e && e !== this && e.parent !== this && t && t.parent === this) {
				var n = this._children, r = n.indexOf(t);
				r >= 0 && (n.splice(r, 0, e), this._doAdd(e));
			}
			return this;
		}, t.prototype.replace = function(e, t) {
			var n = tt(this._children, e);
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
			var t = this.__zr, n = this._children, r = tt(n, e);
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
	}(Oo), Of.prototype.type = "group";
})), Af, jf, Mf = M((() => {
	F(), $s(), Af = function() {
		function e() {
			this.cx = 0, this.cy = 0, this.r = 0;
		}
		return e;
	}(), jf = function(e) {
		P(t, e);
		function t(t) {
			return e.call(this, t) || this;
		}
		return t.prototype.getDefaultShape = function() {
			return new Af();
		}, t.prototype.buildPath = function(e, t) {
			e.moveTo(t.cx + t.r, t.cy), e.arc(t.cx, t.cy, t.r, 0, Math.PI * 2);
		}, t;
	}(Qs), jf.prototype.type = "circle";
})), Nf, Pf, Ff = M((() => {
	F(), $s(), Nf = function() {
		function e() {
			this.cx = 0, this.cy = 0, this.rx = 0, this.ry = 0;
		}
		return e;
	}(), Pf = function(e) {
		P(t, e);
		function t(t) {
			return e.call(this, t) || this;
		}
		return t.prototype.getDefaultShape = function() {
			return new Nf();
		}, t.prototype.buildPath = function(e, t) {
			var n = .5522848, r = t.cx, i = t.cy, a = t.rx, o = t.ry, s = a * n, c = o * n;
			e.moveTo(r - a, i), e.bezierCurveTo(r - a, i - c, r - s, i - o, r, i - o), e.bezierCurveTo(r + s, i - o, r + a, i - c, r + a, i), e.bezierCurveTo(r + a, i + c, r + s, i + o, r, i + o), e.bezierCurveTo(r - s, i + o, r - a, i + c, r - a, i), e.closePath();
		}, t;
	}(Qs), Pf.prototype.type = "ellipse";
}));
//#endregion
//#region node_modules/zrender/lib/graphic/helper/roundSector.js
function If(e, t, n, r, i, a, o, s) {
	var c = n - e, l = r - t, u = o - i, d = s - a, f = d * c - u * l;
	if (!(f * f < Xf)) return f = (u * (t - a) - d * (e - i)) / f, [e + f * c, t + f * l];
}
function Lf(e, t, n, r, i, a, o) {
	var s = e - n, c = t - r, l = (o ? a : -a) / qf(s * s + c * c), u = l * c, d = -l * s, f = e + u, p = t + d, m = n + u, h = r + d, g = (f + m) / 2, _ = (p + h) / 2, v = m - f, y = h - p, b = v * v + y * y, x = i - a, S = f * h - m * p, C = (y < 0 ? -1 : 1) * qf(Jf(0, x * x * b - S * S)), w = (S * y - v * C) / b, T = (-S * v - y * C) / b, E = (S * y + v * C) / b, D = (-S * v + y * C) / b, O = w - g, k = T - _, A = E - g, j = D - _;
	return O * O + k * k > A * A + j * j && (w = E, T = D), {
		cx: w,
		cy: T,
		x0: -u,
		y0: -d,
		x1: w * (i / x - 1),
		y1: T * (i / x - 1)
	};
}
function Rf(e) {
	var t;
	if (B(e)) {
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
function zf(e, t) {
	var n, r = Jf(t.r, 0), i = Jf(t.r0 || 0, 0), a = r > 0;
	if (a || i > 0) {
		if (a || (r = i, i = 0), i > r) {
			var o = r;
			r = i, i = o;
		}
		var s = t.startAngle, c = t.endAngle;
		if (!(isNaN(s) || isNaN(c))) {
			var l = t.cx, u = t.cy, d = !!t.clockwise, f = Kf(c - s), p = f > Vf && f % Vf;
			if (p > Xf && (f = p), !(r > Xf)) e.moveTo(l, u);
			else if (f > Vf - Xf) e.moveTo(l + r * Uf(s), u + r * Hf(s)), e.arc(l, u, r, s, c, !d), i > Xf && (e.moveTo(l + i * Uf(c), u + i * Hf(c)), e.arc(l, u, i, c, s, d));
			else {
				var m = void 0, h = void 0, g = void 0, _ = void 0, v = void 0, y = void 0, b = void 0, x = void 0, S = void 0, C = void 0, w = void 0, T = void 0, E = void 0, D = void 0, O = void 0, k = void 0, A = r * Uf(s), j = r * Hf(s), ee = i * Uf(c), te = i * Hf(c), ne = f > Xf;
				if (ne) {
					var re = t.cornerRadius;
					re && (n = Rf(re), m = n[0], h = n[1], g = n[2], _ = n[3]);
					var ie = Kf(r - i) / 2;
					if (v = Yf(ie, g), y = Yf(ie, _), b = Yf(ie, m), x = Yf(ie, h), w = S = Jf(v, y), T = C = Jf(b, x), (S > Xf || C > Xf) && (E = r * Uf(c), D = r * Hf(c), O = i * Uf(s), k = i * Hf(s), f < Bf)) {
						var ae = If(A, j, O, k, E, D, ee, te);
						if (ae) {
							var oe = A - ae[0], se = j - ae[1], M = E - ae[0], ce = D - ae[1], le = 1 / Hf(Wf((oe * M + se * ce) / (qf(oe * oe + se * se) * qf(M * M + ce * ce))) / 2), ue = qf(ae[0] * ae[0] + ae[1] * ae[1]);
							w = Yf(S, (r - ue) / (le + 1)), T = Yf(C, (i - ue) / (le - 1));
						}
					}
				}
				if (!ne) e.moveTo(l + A, u + j);
				else if (w > Xf) {
					var de = Yf(g, w), fe = Yf(_, w), N = Lf(O, k, A, j, r, de, d), pe = Lf(E, D, ee, te, r, fe, d);
					e.moveTo(l + N.cx + N.x0, u + N.cy + N.y0), w < S && de === fe ? e.arc(l + N.cx, u + N.cy, w, Gf(N.y0, N.x0), Gf(pe.y0, pe.x0), !d) : (de > 0 && e.arc(l + N.cx, u + N.cy, de, Gf(N.y0, N.x0), Gf(N.y1, N.x1), !d), e.arc(l, u, r, Gf(N.cy + N.y1, N.cx + N.x1), Gf(pe.cy + pe.y1, pe.cx + pe.x1), !d), fe > 0 && e.arc(l + pe.cx, u + pe.cy, fe, Gf(pe.y1, pe.x1), Gf(pe.y0, pe.x0), !d));
				} else e.moveTo(l + A, u + j), e.arc(l, u, r, s, c, !d);
				if (!(i > Xf) || !ne) e.lineTo(l + ee, u + te);
				else if (T > Xf) {
					var de = Yf(m, T), fe = Yf(h, T), N = Lf(ee, te, E, D, i, -fe, d), pe = Lf(A, j, O, k, i, -de, d);
					e.lineTo(l + N.cx + N.x0, u + N.cy + N.y0), T < C && de === fe ? e.arc(l + N.cx, u + N.cy, T, Gf(N.y0, N.x0), Gf(pe.y0, pe.x0), !d) : (fe > 0 && e.arc(l + N.cx, u + N.cy, fe, Gf(N.y0, N.x0), Gf(N.y1, N.x1), !d), e.arc(l, u, i, Gf(N.cy + N.y1, N.cx + N.x1), Gf(pe.cy + pe.y1, pe.cx + pe.x1), d), de > 0 && e.arc(l + pe.cx, u + pe.cy, de, Gf(pe.y1, pe.x1), Gf(pe.y0, pe.x0), !d));
				} else e.lineTo(l + ee, u + te), e.arc(l, u, i, c, s, d);
			}
			e.closePath();
		}
	}
}
var Bf, Vf, Hf, Uf, Wf, Gf, Kf, qf, Jf, Yf, Xf, Zf = M((() => {
	q(), Bf = Math.PI, Vf = Bf * 2, Hf = Math.sin, Uf = Math.cos, Wf = Math.acos, Gf = Math.atan2, Kf = Math.abs, qf = Math.sqrt, Jf = Math.max, Yf = Math.min, Xf = 1e-4;
})), Qf, $f, ep = M((() => {
	F(), $s(), Zf(), Qf = function() {
		function e() {
			this.cx = 0, this.cy = 0, this.r0 = 0, this.r = 0, this.startAngle = 0, this.endAngle = Math.PI * 2, this.clockwise = !0, this.cornerRadius = 0;
		}
		return e;
	}(), $f = function(e) {
		P(t, e);
		function t(t) {
			return e.call(this, t) || this;
		}
		return t.prototype.getDefaultShape = function() {
			return new Qf();
		}, t.prototype.buildPath = function(e, t) {
			zf(e, t);
		}, t.prototype.isZeroArea = function() {
			return this.shape.startAngle === this.shape.endAngle || this.shape.r === this.shape.r0;
		}, t;
	}(Qs), $f.prototype.type = "sector";
})), tp, np, rp = M((() => {
	F(), $s(), tp = function() {
		function e() {
			this.cx = 0, this.cy = 0, this.r = 0, this.r0 = 0;
		}
		return e;
	}(), np = function(e) {
		P(t, e);
		function t(t) {
			return e.call(this, t) || this;
		}
		return t.prototype.getDefaultShape = function() {
			return new tp();
		}, t.prototype.buildPath = function(e, t) {
			var n = t.cx, r = t.cy, i = Math.PI * 2;
			e.moveTo(n + t.r, r), e.arc(n, r, t.r, 0, i, !1), e.moveTo(n + t.r0, r), e.arc(n, r, t.r0, 0, i, !0);
		}, t;
	}(Qs), np.prototype.type = "ring";
}));
//#endregion
//#region node_modules/zrender/lib/graphic/helper/smoothBezier.js
function ip(e, t, n, r) {
	var i = [], a = [], o = [], s = [], c, l, u, d;
	if (r) {
		u = [Infinity, Infinity], d = [-Infinity, -Infinity];
		for (var f = 0, p = e.length; f < p; f++) er(u, u, e[f]), tr(d, d, e[f]);
		er(u, u, r[0]), tr(d, d, r[1]);
	}
	for (var f = 0, p = e.length; f < p; f++) {
		var m = e[f];
		if (n) c = e[f ? f - 1 : p - 1], l = e[(f + 1) % p];
		else if (f === 0 || f === p - 1) {
			i.push(Un(e[f]));
			continue;
		} else c = e[f - 1], l = e[f + 1];
		Kn(a, l, c), Yn(a, a, t);
		var h = Zn(m, c), g = Zn(m, l), _ = h + g;
		_ !== 0 && (h /= _, g /= _), Yn(o, a, -h), Yn(s, a, g);
		var v = Gn([], m, o), y = Gn([], m, s);
		r && (tr(v, v, u), er(v, v, d), tr(y, y, u), er(y, y, d)), i.push(v), i.push(y);
	}
	return n && i.push(i.shift()), i;
}
var ap = M((() => {
	ir();
}));
//#endregion
//#region node_modules/zrender/lib/graphic/helper/poly.js
function op(e, t, n) {
	var r = t.smooth, i = t.points;
	if (i && i.length >= 2) {
		if (r) {
			var a = ip(i, r, n, t.smoothConstraint);
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
var sp = M((() => {
	ap();
})), cp, lp, up = M((() => {
	F(), $s(), sp(), cp = function() {
		function e() {
			this.points = null, this.smooth = 0, this.smoothConstraint = null;
		}
		return e;
	}(), lp = function(e) {
		P(t, e);
		function t(t) {
			return e.call(this, t) || this;
		}
		return t.prototype.getDefaultShape = function() {
			return new cp();
		}, t.prototype.buildPath = function(e, t) {
			op(e, t, !0);
		}, t;
	}(Qs), lp.prototype.type = "polygon";
})), dp, fp, pp = M((() => {
	F(), $s(), sp(), dp = function() {
		function e() {
			this.points = null, this.percent = 1, this.smooth = 0, this.smoothConstraint = null;
		}
		return e;
	}(), fp = function(e) {
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
			return new dp();
		}, t.prototype.buildPath = function(e, t) {
			op(e, t, !1);
		}, t;
	}(Qs), fp.prototype.type = "polyline";
})), mp, hp, gp, _p = M((() => {
	F(), $s(), mc(), mp = {}, hp = function() {
		function e() {
			this.x1 = 0, this.y1 = 0, this.x2 = 0, this.y2 = 0, this.percent = 1;
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
			var n, r, i, a;
			if (this.subPixelOptimize) {
				var o = uc(mp, t, this.style);
				n = o.x1, r = o.y1, i = o.x2, a = o.y2;
			} else n = t.x1, r = t.y1, i = t.x2, a = t.y2;
			var s = t.percent;
			s !== 0 && (e.moveTo(n, r), s < 1 && (i = n * (1 - s) + i * s, a = r * (1 - s) + a * s), e.lineTo(i, a));
		}, t.prototype.pointAt = function(e) {
			var t = this.shape;
			return [t.x1 * (1 - e) + t.x2 * e, t.y1 * (1 - e) + t.y2 * e];
		}, t;
	}(Qs), gp.prototype.type = "line";
}));
//#endregion
//#region node_modules/zrender/lib/graphic/shape/BezierCurve.js
function vp(e, t, n) {
	var r = e.cpx2, i = e.cpy2;
	return r != null || i != null ? [(n ? Ai : ki)(e.x1, e.cpx1, e.cpx2, e.x2, t), (n ? Ai : ki)(e.y1, e.cpy1, e.cpy2, e.y2, t)] : [(n ? Li : Ii)(e.x1, e.cpx1, e.x2, t), (n ? Li : Ii)(e.y1, e.cpy1, e.y2, t)];
}
var yp, bp, xp, Sp = M((() => {
	F(), $s(), ir(), Qi(), yp = [], bp = function() {
		function e() {
			this.x1 = 0, this.y1 = 0, this.x2 = 0, this.y2 = 0, this.cpx1 = 0, this.cpy1 = 0, this.percent = 1;
		}
		return e;
	}(), xp = function(e) {
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
			return new bp();
		}, t.prototype.buildPath = function(e, t) {
			var n = t.x1, r = t.y1, i = t.x2, a = t.y2, o = t.cpx1, s = t.cpy1, c = t.cpx2, l = t.cpy2, u = t.percent;
			u !== 0 && (e.moveTo(n, r), c == null || l == null ? (u < 1 && (Bi(n, o, i, u, yp), o = yp[1], i = yp[2], Bi(r, s, a, u, yp), s = yp[1], a = yp[2]), e.quadraticCurveTo(o, s, i, a)) : (u < 1 && (Ni(n, o, c, i, u, yp), o = yp[1], c = yp[2], i = yp[3], Ni(r, s, l, a, u, yp), s = yp[1], l = yp[2], a = yp[3]), e.bezierCurveTo(o, s, c, l, i, a)));
		}, t.prototype.pointAt = function(e) {
			return vp(this.shape, e, !1);
		}, t.prototype.tangentAt = function(e) {
			var t = vp(this.shape, e, !0);
			return Xn(t, t);
		}, t;
	}(Qs), xp.prototype.type = "bezier-curve";
})), Cp, wp, Tp = M((() => {
	F(), $s(), Cp = function() {
		function e() {
			this.cx = 0, this.cy = 0, this.r = 0, this.startAngle = 0, this.endAngle = Math.PI * 2, this.clockwise = !0;
		}
		return e;
	}(), wp = function(e) {
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
			return new Cp();
		}, t.prototype.buildPath = function(e, t) {
			var n = t.cx, r = t.cy, i = Math.max(t.r, 0), a = t.startAngle, o = t.endAngle, s = t.clockwise, c = Math.cos(a), l = Math.sin(a);
			e.moveTo(c * i + n, l * i + r), e.arc(n, r, i, a, o, !s);
		}, t;
	}(Qs), wp.prototype.type = "arc";
})), Ep, Dp = M((() => {
	F(), $s(), Ep = function(e) {
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
			return this._updatePathDirty.call(this), Qs.prototype.getBoundingRect.call(this);
		}, t;
	}(Qs);
})), Op, kp = M((() => {
	Op = function() {
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
})), Ap, jp = M((() => {
	F(), kp(), Ap = function(e) {
		P(t, e);
		function t(t, n, r, i, a, o) {
			var s = e.call(this, a) || this;
			return s.x = t ?? 0, s.y = n ?? 0, s.x2 = r ?? 1, s.y2 = i ?? 0, s.type = "linear", s.global = o || !1, s;
		}
		return t;
	}(Op);
})), Mp, Np = M((() => {
	F(), kp(), Mp = function(e) {
		P(t, e);
		function t(t, n, r, i, a) {
			var o = e.call(this, i) || this;
			return o.x = t ?? .5, o.y = n ?? .5, o.r = r ?? .5, o.type = "radial", o.global = a || !1, o;
		}
		return t;
	}(Op);
})), Pp, Fp, Ip, Lp, Rp, zp, Bp, Vp, Hp, Up = M((() => {
	or(), Or(), Pp = Math.min, Fp = Math.max, Ip = Math.abs, Lp = [0, 0], Rp = [0, 0], zp = cr(), Bp = zp.minTv, Vp = zp.maxTv, Hp = function() {
		function e(e, t) {
			this._corners = [], this._axes = [], this._origin = [0, 0];
			for (var n = 0; n < 4; n++) this._corners[n] = new ar();
			for (var n = 0; n < 2; n++) this._axes[n] = new ar();
			e && this.fromBoundingRect(e, t);
		}
		return e.prototype.fromBoundingRect = function(e, t) {
			var n = this._corners, r = this._axes, i = e.x, a = e.y, o = i + e.width, s = a + e.height;
			if (n[0].set(i, a), n[1].set(o, a), n[2].set(o, s), n[3].set(i, s), t) for (var c = 0; c < 4; c++) n[c].transform(t);
			ar.sub(r[0], n[1], n[0]), ar.sub(r[1], n[3], n[0]), r[0].normalize(), r[1].normalize();
			for (var c = 0; c < 2; c++) this._origin[c] = r[c].dot(n[0]);
		}, e.prototype.intersect = function(e, t, n) {
			var r = !0, i = !t;
			return t && ar.set(t, 0, 0), zp.reset(n, !i), !this._intersectCheckOneSide(this, e, i, 1) && (r = !1, i) || !this._intersectCheckOneSide(e, this, i, -1) && (r = !1, i) || !i && !zp.negativeSize && ar.copy(t, r ? zp.useDir ? zp.dirMinTv : Bp : Vp), r;
		}, e.prototype._intersectCheckOneSide = function(e, t, n, r) {
			for (var i = !0, a = 0; a < 2; a++) {
				var o = e._axes[a];
				if (e._getProjMinMaxOnAxis(a, e._corners, Lp), e._getProjMinMaxOnAxis(a, t._corners, Rp), zp.negativeSize || Lp[1] < Rp[0] || Lp[0] > Rp[1]) {
					if (i = !1, zp.negativeSize || n) return i;
					var s = Ip(Rp[0] - Lp[1]), c = Ip(Lp[0] - Rp[1]);
					Pp(s, c) > Vp.len() && (s < c ? ar.scale(Vp, o, -s * r) : ar.scale(Vp, o, c * r));
				} else if (!n) {
					var s = Ip(Rp[0] - Lp[1]), c = Ip(Lp[0] - Rp[1]);
					(zp.useDir || Pp(s, c) < Bp.len()) && ((s < c || !zp.bidirectional) && (ar.scale(Bp, o, s * r), zp.useDir && zp.calcDirMTV()), (s >= c || !zp.bidirectional) && (ar.scale(Bp, o, -c * r), zp.useDir && zp.calcDirMTV()));
				}
			}
			return i;
		}, e.prototype._getProjMinMaxOnAxis = function(e, t, n) {
			for (var r = this._axes[e], i = this._origin, a = t[0].dot(r) + i[e], o = a, s = a, c = 1; c < t.length; c++) {
				var l = t[c].dot(r) + i[e];
				o = Pp(l, o), s = Fp(l, s);
			}
			n[0] = o + zp.touchThreshold, n[1] = s - zp.touchThreshold, zp.negativeSize = n[1] < n[0];
		}, e;
	}();
})), Wp = M((() => {})), Gp, Kp, qp = M((() => {
	F(), zo(), Or(), Wp(), Gp = [], Kp = function(e) {
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
					n.needLocalTransform() && r.applyTransform(n.getLocalTransform(Gp)), e.union(r);
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
	}(Io);
}));
//#endregion
//#region node_modules/echarts/lib/animation/basicTransition.js
function Jp(e, t, n, r, i) {
	var a;
	if (t && t.ecModel) {
		var o = t.ecModel.getUpdatePayload();
		a = o && o.animation;
	}
	var s = t && t.isAnimationEnabled(), c = e === "update";
	if (s) {
		var l = void 0, u = void 0, d = void 0;
		return r ? (l = W(r.duration, 200), u = W(r.easing, "cubicOut"), d = 0) : (l = t.getShallow(c ? "animationDurationUpdate" : "animationDuration"), u = t.getShallow(c ? "animationEasingUpdate" : "animationEasing"), d = t.getShallow(c ? "animationDelayUpdate" : "animationDelay")), a && (a.duration != null && (l = a.duration), a.easing != null && (u = a.easing), a.delay != null && (d = a.delay)), V(d) && (d = d(n, i)), V(l) && (l = l(n)), {
			duration: l || 0,
			delay: d,
			easing: u
		};
	}
	return null;
}
function Yp(e, t, n, r, i, a, o) {
	var s = !1, c;
	V(i) ? (o = a, a = i, i = null) : U(i) && (a = i.cb, o = i.during, s = i.isFrom, c = i.removeOpt, i = i.dataIndex);
	var l = e === "leave";
	l || t.stopAnimation("leave");
	var u = Jp(e, r, i, l ? c || {} : null, r && r.getAnimationDelayParams ? r.getAnimationDelayParams(t, i) : null);
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
function Xp(e, t, n, r, i, a) {
	Yp("update", e, t, n, r, i, a);
}
function Zp(e, t, n, r, i, a) {
	Yp("enter", e, t, n, r, i, a);
}
function Qp(e) {
	if (!e.__zr) return !0;
	for (var t = 0; t < e.animators.length; t++) if (e.animators[t].scope === "leave") return !0;
	return !1;
}
function $p(e, t, n, r, i, a) {
	Qp(e) || Yp("leave", e, t, n, r, i, a);
}
function em(e, t, n, r) {
	e.removeTextContent(), e.removeTextGuideLine(), $p(e, { style: { opacity: 0 } }, t, n, r);
}
function tm(e, t, n) {
	function r() {
		e.parent && e.parent.remove(e);
	}
	e.isGroup ? e.traverse(function(e) {
		e.isGroup || em(e, t, n, r);
	}) : em(e, t, n, r);
}
function nm(e) {
	rm(e).oldStyle = e.style;
}
var rm, im = M((() => {
	q(), Z(), rm = ru();
})), am = /* @__PURE__ */ ce({
	Arc: () => wp,
	BezierCurve: () => xp,
	BoundingRect: () => Y,
	Circle: () => jf,
	CompoundPath: () => Ep,
	Ellipse: () => Pf,
	Group: () => Of,
	HOVER_LAYER_FOR_INCREMENTAL: () => 2,
	HOVER_LAYER_FROM_THRESHOLD: () => 1,
	HOVER_LAYER_NO: () => 0,
	Image: () => oc,
	IncrementalDisplayable: () => Kp,
	Line: () => gp,
	LinearGradient: () => Ap,
	OrientedBoundingRect: () => Hp,
	Path: () => Qs,
	Point: () => ar,
	Polygon: () => lp,
	Polyline: () => fp,
	RadialGradient: () => Mp,
	Rect: () => _c,
	Ring: () => np,
	Sector: () => $f,
	Text: () => Nc,
	WH: () => Km,
	XY: () => Gm,
	applyTransform: () => _m,
	calcZ2Range: () => Rm,
	clipPointsByRect: () => Sm,
	clipRectByRect: () => Cm,
	createIcon: () => wm,
	decomposeTransform: () => Hm,
	ensureCopyRect: () => Fm,
	ensureCopyTransform: () => Im,
	expandOrShrinkRect: () => km,
	extendPath: () => sm,
	extendShape: () => om,
	getCurrentCanvasPainter: () => Um,
	getShapeClass: () => lm,
	getTransform: () => gm,
	groupTransition: () => xm,
	initProps: () => Zp,
	isBoundingRectAxisAligned: () => Pm,
	isElementRemoved: () => Qp,
	lineLineIntersect: () => Em,
	linePolygonIntersect: () => Tm,
	makeImage: () => dm,
	makePath: () => um,
	mergePath: () => Jm,
	payloadDisableAnimation: () => Vm,
	registerShape: () => cm,
	removeElement: () => $p,
	removeElementWithFadeOut: () => tm,
	resizePath: () => pm,
	retrieveZInfo: () => Lm,
	setTooltipConfig: () => jm,
	subPixelOptimize: () => Ym,
	subPixelOptimizeLine: () => mm,
	subPixelOptimizeRect: () => hm,
	transformDirection: () => vm,
	traverseElements: () => Nm,
	traverseUpdateZ: () => zm,
	updateProps: () => Xp
});
function om(e) {
	return Qs.extend(e);
}
function sm(e, t) {
	return qm(e, t);
}
function cm(e, t) {
	Wm[e] = t;
}
function lm(e) {
	if (Wm.hasOwnProperty(e)) return Wm[e];
}
function um(e, t, n, r) {
	var i = _f(e, t);
	return n && (r === "center" && (n = fm(n, i.getBoundingRect())), pm(i, n)), i;
}
function dm(e, t, n) {
	var r = new oc({
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
				r.setStyle(fm(t, i));
			}
		}
	});
	return r;
}
function fm(e, t) {
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
function pm(e, t) {
	if (e.applyTransform) {
		var n = e.getBoundingRect().calculateTransform(t);
		e.applyTransform(n);
	}
}
function mm(e, t) {
	return uc(e, e, { lineWidth: t }), e;
}
function hm(e, t) {
	return dc(e, e, t), e;
}
function gm(e, t) {
	for (var n = Pn([]); e && e !== t;) In(n, e.getLocalTransform(), n), e = e.parent;
	return n;
}
function _m(e, t, n) {
	return t && !it(t) && (t = xi.getLocalTransform(t)), n && (t = Bn([], t)), $n([], e, t);
}
function vm(e, t, n) {
	var r = t[4] === 0 || t[5] === 0 || t[0] === 0 ? 1 : ul(2 * t[4] / t[0]), i = t[4] === 0 || t[5] === 0 || t[2] === 0 ? 1 : ul(2 * t[4] / t[2]), a = [e === "left" ? -r : e === "right" ? r : 0, e === "top" ? -i : e === "bottom" ? i : 0];
	return a = _m(a, t, n), ul(a[0]) > ul(a[1]) ? a[0] > 0 ? "right" : "left" : a[1] > 0 ? "bottom" : "top";
}
function ym(e) {
	return !e.isGroup;
}
function bm(e) {
	return e.shape != null;
}
function xm(e, t, n) {
	if (!e || !t) return;
	function r(e) {
		var t = {};
		return e.traverse(function(e) {
			ym(e) && e.anid && (t[e.anid] = e);
		}), t;
	}
	function i(e) {
		var t = {
			x: e.x,
			y: e.y,
			rotation: e.rotation
		};
		return bm(e) && (t.shape = I(e.shape)), t;
	}
	var a = r(e);
	t.traverse(function(e) {
		if (ym(e) && e.anid) {
			var t = a[e.anid];
			if (t) {
				var r = i(e);
				e.attr(i(t)), Xp(e, r, n, Nu(e).dataIndex);
			}
		}
	});
}
function Sm(e, t) {
	return z(e, function(e) {
		var n = e[0];
		n = ll(n, t.x), n = cl(n, t.x + t.width);
		var r = e[1];
		return r = ll(r, t.y), r = cl(r, t.y + t.height), [n, r];
	});
}
function Cm(e, t) {
	var n = ll(e.x, t.x), r = cl(e.x + e.width, t.x + t.width), i = ll(e.y, t.y), a = cl(e.y + e.height, t.y + t.height);
	if (r >= n && a >= i) return {
		x: n,
		y: i,
		width: r - n,
		height: a - i
	};
}
function wm(e, t, n) {
	var r = L({ rectHover: !0 }, t), i = r.style = { strokeNoScale: !0 };
	if (n ||= {
		x: -1,
		y: -1,
		width: 2,
		height: 2
	}, e) return e.indexOf("image://") === 0 ? (i.image = e.slice(8), et(i, n), new oc(r)) : um(e.replace("path://", ""), r, n, "center");
}
function Tm(e, t, n, r, i) {
	for (var a = 0, o = i[i.length - 1]; a < i.length; a++) {
		var s = i[a];
		if (Em(e, t, n, r, s[0], s[1], o[0], o[1])) return !0;
		o = s;
	}
}
function Em(e, t, n, r, i, a, o, s) {
	var c = n - e, l = r - t, u = o - i, d = s - a, f = Dm(u, d, c, l);
	if (Om(f)) return !1;
	var p = e - i, m = t - a, h = Dm(p, m, c, l) / f;
	if (h < 0 || h > 1) return !1;
	var g = Dm(p, m, u, d) / f;
	return !(g < 0 || g > 1);
}
function Dm(e, t, n, r) {
	return e * r - n * t;
}
function Om(e) {
	return e <= 1e-6 && e >= -1e-6;
}
function km(e, t, n, r, i) {
	return t == null ? e : (ft(t) ? Xm[0] = Xm[1] = Xm[2] = Xm[3] = t : (process.env.NODE_ENV !== "production" && G(t.length === 4), Xm[0] = t[0], Xm[1] = t[1], Xm[2] = t[2], Xm[3] = t[3]), r && (Xm[0] = ll(0, Xm[0]), Xm[1] = ll(0, Xm[1]), Xm[2] = ll(0, Xm[2]), Xm[3] = ll(0, Xm[3])), n && (Xm[0] = -Xm[0], Xm[1] = -Xm[1], Xm[2] = -Xm[2], Xm[3] = -Xm[3]), Am(e, Xm, "x", "width", 3, 1, i && i[0] || 0), Am(e, Xm, "y", "height", 0, 2, i && i[1] || 0), e);
}
function Am(e, t, n, r, i, a, o) {
	var s = t[a] + t[i], c = e[r];
	e[r] += s, o = ll(0, cl(o, c)), e[r] < o ? (e[r] = o, e[n] += t[i] >= 0 ? -t[i] : t[a] >= 0 ? c + t[a] : ul(s) > 1e-8 ? (c - o) * t[i] / s : 0) : e[n] -= t[i];
}
function jm(e) {
	var t = e.itemTooltipOption, n = e.componentModel, r = e.itemName, i = H(t) ? { formatter: t } : t, a = n.mainType, o = n.componentIndex, s = {
		componentType: a,
		name: r,
		$vars: ["name"]
	};
	s[a + "Index"] = o;
	var c = e.formatterParamsExtra;
	c && R(ct(c), function(e) {
		jt(s, e) || (s[e] = c[e], s.$vars.push(e));
	});
	var l = Nu(e.el);
	l.componentMainType = a, l.componentIndex = o, l.tooltipConfig = {
		name: r,
		option: et({
			content: r,
			encodeHTMLContent: !0,
			formatterParams: s
		}, i)
	};
}
function Mm(e, t) {
	var n;
	e.isGroup && (n = t(e)), n || e.traverse(t);
}
function Nm(e, t) {
	if (e) {
		if (B(e)) for (var n = 0; n < e.length; n++) Mm(e[n], t);
		else Mm(e, t);
	}
}
function Pm(e) {
	return !e || ul(e[1]) < Zm && ul(e[2]) < Zm || ul(e[0]) < Zm && ul(e[3]) < Zm;
}
function Fm(e, t) {
	return e ? Y.copy(e, t) : t.clone();
}
function Im(e, t) {
	return t ? Fn(e || Nn(), t) : void 0;
}
function Lm(e) {
	return {
		z: e.get("z") || 0,
		zlevel: e.get("zlevel") || 0
	};
}
function Rm(e) {
	var t = -Infinity, n = Infinity;
	Mm(e, function(e) {
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
function zm(e, t, n) {
	Bm(e, t, n, -Infinity);
}
function Bm(e, t, n, r) {
	if (e.ignoreModelZ) return r;
	var i = e.getTextContent(), a = e.getTextGuideLine();
	if (e.isGroup) for (var o = e.childrenRef(), s = 0; s < o.length; s++) r = ll(Bm(o[s], t, n, r), r);
	else e.z = t, e.zlevel = n, r = ll(e.z2 || 0, r);
	if (i && (i.z = t, i.zlevel = n, isFinite(r) && (i.z2 = r + 2)), a) {
		var c = e.textGuideLineConfig;
		a.z = t, a.zlevel = n, isFinite(r) && (a.z2 = r + (c && c.showAbove ? 1 : -1));
	}
	return r;
}
function Vm(e) {
	return e.animation = { duration: 0 }, e;
}
function Hm(e, t) {
	return t ? Fn(Qm.transform, t) : Pn(Qm.transform), Qm.decomposeTransform(), mi(e, Qm), e;
}
function Um(e) {
	var t = e.getZr().painter;
	return t.getType() === "canvas" ? t : null;
}
var Wm, Gm, Km, qm, Jm, Ym, Xm, Zm, Qm, $m = M((() => {
	Df(), Vn(), ir(), $s(), wi(), sc(), kf(), Lc(), Mf(), Ff(), ep(), rp(), up(), pp(), vc(), _p(), Sp(), Tp(), Dp(), jp(), Np(), Or(), Up(), or(), qp(), mc(), q(), Fu(), im(), Sl(), Wm = {}, Gm = ["x", "y"], Km = ["width", "height"], qm = vf, Jm = yf, Ym = fc, Xm = [
		0,
		0,
		0,
		0
	], Zm = 1e-5, Qm = new xi(), Qm.transform = Nn(), cm("circle", jf), cm("ellipse", Pf), cm("sector", $f), cm("ring", np), cm("polygon", lp), cm("polyline", fp), cm("rect", _c), cm("line", gp), cm("bezierCurve", xp), cm("arc", wp);
}));
//#endregion
//#region node_modules/echarts/lib/label/labelStyle.js
function eh(e, t) {
	for (var n = 0; n < Kd.length; n++) {
		var r = Kd[n], i = t[r], a = e.ensureState(r);
		a.style = a.style || {}, a.style.text = i;
	}
	var o = e.currentStates.slice();
	e.clearStates(!0), e.setStyle({ text: t.normal }), e.useStates(o, !0);
}
function th(e, t, n) {
	var r = e.labelFetcher, i = e.labelDataIndex, a = e.labelDimIndex, o = t.normal, s;
	r && (s = r.getFormattedLabel(i, "normal", null, a, o && o.get("formatter"), n == null ? null : { interpolatedValue: n })), s ??= V(e.defaultText) ? e.defaultText(i, e, n) : e.defaultText;
	for (var c = { normal: s }, l = 0; l < Kd.length; l++) {
		var u = Kd[l], d = t[u];
		c[u] = W(r ? r.getFormattedLabel(i, u, null, a, d && d.get("formatter")) : null, s);
	}
	return c;
}
function nh(e, t, n, r) {
	n ||= uh;
	for (var i = e instanceof Nc, a = !1, o = 0; o < qd.length; o++) {
		var s = t[qd[o]];
		if (s && s.getShallow("show")) {
			a = !0;
			break;
		}
	}
	var c = i ? e : e.getTextContent();
	if (a) {
		i || (c || (c = new Nc(), e.setTextContent(c)), e.stateProxy && (c.stateProxy = e.stateProxy));
		var l = th(n, t), u = t.normal, d = !!u.getShallow("show"), f = ih(u, r && r.normal, n, !1, !i);
		f.text = l.normal, i || e.setTextConfig(ah(u, n, !1));
		for (var o = 0; o < Kd.length; o++) {
			var p = Kd[o], s = t[p];
			if (s) {
				var m = c.ensureState(p), h = !!W(s.getShallow("show"), d);
				if (h !== d && (m.ignore = !h), m.style = ih(s, r && r[p], n, !0, !i), m.style.text = l[p], !i) {
					var g = e.ensureState(p);
					g.textConfig = ah(s, n, !0);
				}
			}
		}
		c.silent = !!u.getShallow("silent"), c.style.x != null && (f.x = c.style.x), c.style.y != null && (f.y = c.style.y), c.ignore = !d, c.useStyle(f), c.dirty(), n.enableTextSetter && (mh(c).setLabelText = function(e) {
			var r = th(n, t, e);
			eh(c, r);
		});
	} else c && (c.ignore = !0);
	e.dirty();
}
function rh(e, t) {
	t ||= "label";
	for (var n = { normal: e.getModel(t) }, r = 0; r < Kd.length; r++) {
		var i = Kd[r];
		n[i] = e.getModel([i, t]);
	}
	return n;
}
function ih(e, t, n, r, i) {
	var a = {};
	return oh(a, e, n, r, i), t && L(a, t), a;
}
function ah(e, t, n) {
	t ||= {};
	var r = {}, i, a = e.getShallow("rotate"), o = W(e.getShallow("distance"), n ? null : 5), s = e.getShallow("offset");
	return i = e.getShallow("position") || (n ? null : "inside"), i === "outside" && (i = t.defaultOutsidePosition || "top"), i != null && (r.position = i), s != null && (r.offset = s), a != null && (a *= Math.PI / 180, r.rotation = a), o != null && (r.distance = o), r.outsideFill = e.get("color") === "inherit" ? t.inheritColor || null : "auto", t.autoOverflowArea != null && (r.autoOverflowArea = t.autoOverflowArea), t.layoutRect != null && (r.layoutRect = t.layoutRect), r;
}
function oh(e, t, n, r, i) {
	n ||= uh;
	var a = t.ecModel, o = a && a.option.textStyle, s = sh(t), c;
	if (s) {
		c = {};
		var l = "richInheritPlainLabel", u = W(t.get(l), a ? a.get(l) : void 0);
		for (var d in s) if (s.hasOwnProperty(d)) {
			var f = t.getModel(["rich", d]);
			ch(c[d] = {}, f, o, t, u, n, r, i, !1, !0);
		}
	}
	c && (e.rich = c);
	var p = t.get("overflow");
	p && (e.overflow = p);
	var m = t.get("lineOverflow");
	m && (e.lineOverflow = m);
	var h = e, g = t.get("minMargin");
	if (g != null) g = ft(g) ? g / 2 : 0, h.margin = [
		g,
		g,
		g,
		g
	], h.__marginType = hh.minMargin;
	else {
		var _ = t.get("textMargin");
		_ != null && (h.margin = Ct(_), h.__marginType = hh.textMargin);
	}
	ch(e, t, o, null, null, n, r, i, !0, !1);
}
function sh(e) {
	for (var t; e && e !== e.ecModel;) {
		var n = (e.option || uh).rich;
		if (n) {
			t ||= {};
			for (var r = ct(n), i = 0; i < r.length; i++) {
				var a = r[i];
				t[a] = 1;
			}
		}
		e = e.parentModel;
	}
	return t;
}
function ch(e, t, n, r, i, a, o, s, c, l) {
	n = !o && n || uh;
	var u = a && a.inheritColor, d = t.getShallow("color"), f = t.getShallow("textBorderColor"), p = W(t.getShallow("opacity"), n.opacity);
	(d === "inherit" || d === "auto") && (process.env.NODE_ENV !== "production" && d === "auto" && Ol("color: 'auto'", "color: 'inherit'"), d = u || null), (f === "inherit" || f === "auto") && (process.env.NODE_ENV !== "production" && f === "auto" && Ol("color: 'auto'", "color: 'inherit'"), f = u || null), s || (d ||= n.color, f ||= n.textBorderColor), d != null && (e.fill = d), f != null && (e.stroke = f);
	var m = W(t.getShallow("textBorderWidth"), n.textBorderWidth);
	m != null && (e.lineWidth = m);
	var h = W(t.getShallow("textBorderType"), n.textBorderType);
	h != null && (e.lineDash = h);
	var g = W(t.getShallow("textBorderDashOffset"), n.textBorderDashOffset);
	g != null && (e.lineDashOffset = g), !o && p == null && !l && (p = a && a.defaultOpacity), p != null && (e.opacity = p), !o && !s && e.fill == null && a.inheritColor && (e.fill = a.inheritColor);
	for (var _ = 0; _ < dh.length; _++) {
		var v = dh[_], y = i !== !1 && r ? xt(t.getShallow(v), r.getShallow(v), n[v]) : W(t.getShallow(v), n[v]);
		y != null && (e[v] = y);
	}
	for (var _ = 0; _ < fh.length; _++) {
		var v = fh[_], y = t.getShallow(v);
		y != null && (e[v] = y);
	}
	if (e.verticalAlign == null) {
		var b = t.getShallow("baseline");
		b != null && (e.verticalAlign = b);
	}
	if (!c || !a.disableBox) {
		for (var _ = 0; _ < ph.length; _++) {
			var v = ph[_], y = t.getShallow(v);
			y != null && (e[v] = y);
		}
		var x = t.getShallow("borderType");
		x != null && (e.borderDash = x), (e.backgroundColor === "auto" || e.backgroundColor === "inherit") && u && (process.env.NODE_ENV !== "production" && e.backgroundColor === "auto" && Ol("backgroundColor: 'auto'", "backgroundColor: 'inherit'"), e.backgroundColor = u), (e.borderColor === "auto" || e.borderColor === "inherit") && u && (process.env.NODE_ENV !== "production" && e.borderColor === "auto" && Ol("borderColor: 'auto'", "borderColor: 'inherit'"), e.borderColor = u);
	}
}
function lh(e, t) {
	var n = t && t.getModel("textStyle");
	return wt([
		e.fontStyle || n && n.getShallow("fontStyle") || "",
		e.fontWeight || n && n.getShallow("fontWeight") || "",
		(e.fontSize || n && n.getShallow("fontSize") || 12) + "px",
		e.fontFamily || n && n.getShallow("fontFamily") || "sans-serif"
	].join(" "));
}
var uh, dh, fh, ph, mh, hh, gh = M((() => {
	Lc(), q(), nf(), Pl(), Z(), uh = {}, dh = [
		"fontStyle",
		"fontWeight",
		"fontSize",
		"fontFamily",
		"textShadowColor",
		"textShadowBlur",
		"textShadowOffsetX",
		"textShadowOffsetY"
	], fh = [
		"align",
		"lineHeight",
		"width",
		"height",
		"tag",
		"verticalAlign",
		"ellipsis"
	], ph = [
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
	], mh = ru(), hh = {
		minMargin: 1,
		textMargin: 2
	};
})), _h, vh, yh, bh, xh = M((() => {
	gh(), Lc(), _h = ["textStyle", "color"], vh = [
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
	], yh = new Nc(), bh = function() {
		function e() {}
		return e.prototype.getTextColor = function(e) {
			var t = this.ecModel;
			return this.getShallow("color") || (!e && t ? t.get(_h) : null);
		}, e.prototype.getFont = function() {
			return lh({
				fontStyle: this.getShallow("fontStyle"),
				fontWeight: this.getShallow("fontWeight"),
				fontSize: this.getShallow("fontSize"),
				fontFamily: this.getShallow("fontFamily")
			}, this.ecModel);
		}, e.prototype.getTextRect = function(e) {
			for (var t = {
				text: e,
				verticalAlign: this.getShallow("verticalAlign") || this.getShallow("baseline")
			}, n = 0; n < vh.length; n++) t[vh[n]] = this.getShallow(vh[n]);
			return yh.useStyle(t), yh.update(), yh.getBoundingRect();
		}, e;
	}();
})), Sh, Ch, wh, Th = M((() => {
	vn(), Sh = [
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
	], Ch = _n(Sh), wh = function() {
		function e() {}
		return e.prototype.getLineStyle = function(e) {
			return Ch(this, e);
		}, e;
	}();
})), Eh, Dh, Oh, kh = M((() => {
	vn(), Eh = [
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
	], Dh = _n(Eh), Oh = function() {
		function e() {}
		return e.prototype.getItemStyle = function(e, t) {
			return Dh(this, e, t);
		}, e;
	}();
})), Ah, jh = M((() => {
	en(), gn(), Sn(), xh(), Th(), kh(), q(), Ah = function() {
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
	}(), an(Ah), cn(Ah), rt(Ah, wh), rt(Ah, Oh), rt(Ah, xn), rt(Ah, bh);
}));
//#endregion
//#region node_modules/echarts/lib/data/DataDiffer.js
function Mh(e) {
	return e == null ? 0 : e.length || 1;
}
function Nh(e) {
	return e;
}
var Ph, Fh = M((() => {
	Ph = function() {
		function e(e, t, n, r, i, a) {
			this._old = e, this._new = t, this._oldKeyGetter = n || Nh, this._newKeyGetter = r || Nh, this.context = i, this._diffModeMultiple = a === "multiple";
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
				var o = r[a], s = n[o], c = Mh(s);
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
				var s = i[o], c = n[s], l = r[s], u = Mh(c), d = Mh(l);
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
				var r = e[n], i = t[r], a = Mh(i);
				if (a > 1) for (var o = 0; o < a; o++) this._add && this._add(i[o]);
				else a === 1 && this._add && this._add(i);
				t[r] = null;
			}
		}, e.prototype._initIndexMap = function(e, t, n, r) {
			for (var i = this._diffModeMultiple, a = 0; a < e.length; a++) {
				var o = "_ec_" + this[r](e[a], a);
				if (i || (n[a] = o), t) {
					var s = t[o], c = Mh(s);
					c === 0 ? (t[o] = a, i && n.push(o)) : c === 1 ? t[o] = [s, a] : s.push(a);
				}
			}
		}, e;
	}();
}));
//#endregion
//#region node_modules/echarts/lib/data/helper/sourceHelper.js
function Ih(e) {
	Uh(e).datasetMap = K();
}
function Lh(e, t, n) {
	var r = {}, i = Rh(t);
	if (!i || !e) return r;
	var a = [], o = [], s = t.ecModel, c = Uh(s).datasetMap, l = i.uid + "_" + n.seriesLayoutBy, u, d;
	e = e.slice(), R(e, function(t, n) {
		var i = U(t) ? t : e[n] = { name: t };
		i.type === "ordinal" && u == null && (u = n, d = m(i)), r[i.name] = [];
	});
	var f = c.get(l) || c.set(l, {
		categoryWayDim: d,
		valueWayDim: 0
	});
	R(e, function(e, t) {
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
function Rh(e) {
	if (!e.get("data", !0)) return ou(e.ecModel, "dataset", {
		index: e.get("datasetIndex", !0),
		id: e.get("datasetId", !0)
	}, ju).models[0];
}
function zh(e) {
	return !e.get("transform", !0) && !e.get("fromTransformResult", !0) ? [] : ou(e.ecModel, "dataset", {
		index: e.get("fromDatasetIndex", !0),
		id: e.get("fromDatasetId", !0)
	}, ju).models;
}
function Bh(e, t) {
	return Vh(e.data, e.sourceFormat, e.seriesLayoutBy, e.dimensionsDefine, e.startIndex, t);
}
function Vh(e, t, n, r, i, a) {
	var o, s = 5;
	if (mt(e)) return Hh.Not;
	var c, l;
	if (r) {
		var u = r[a];
		U(u) ? (c = u.name, l = u.type) : H(u) && (c = u);
	}
	if (l != null) return l === "ordinal" ? Hh.Must : Hh.Not;
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
		if (!c) return Hh.Not;
		for (var p = 0; p < h.length && p < s; p++) {
			var g = h[p];
			if (g && (o = b(g[c])) != null) return o;
		}
	} else if (t === "keyedColumns") {
		var _ = e;
		if (!c) return Hh.Not;
		var f = _[c];
		if (!f || mt(f)) return Hh.Not;
		for (var p = 0; p < f.length && p < s; p++) if ((o = b(f[p])) != null) return o;
	} else if (t === "original") for (var v = e, p = 0; p < v.length && p < s; p++) {
		var g = v[p], y = Rl(g);
		if (!B(y)) return Hh.Not;
		if ((o = b(y[a])) != null) return o;
	}
	function b(e) {
		var t = H(e);
		if (e != null && isFinite(Number(e)) && e !== "") return t ? Hh.Might : Hh.Not;
		if (t && e !== "-") return Hh.Must;
	}
	return Hh.Not;
}
var Hh, Uh, Wh = M((() => {
	Z(), q(), Wu(), Hh = {
		Must: 1,
		Might: 2,
		Not: 3
	}, Uh = ru();
}));
//#endregion
//#region node_modules/echarts/lib/data/Source.js
function Gh(e) {
	return e instanceof tg;
}
function Kh(e, t, n) {
	n ||= Yh(e);
	var r = t.seriesLayoutBy, i = Xh(e, n, r, t.sourceHeader, t.dimensions);
	return new tg({
		data: e,
		sourceFormat: n,
		seriesLayoutBy: r,
		dimensionsDefine: i.dimensionsDefine,
		startIndex: i.startIndex,
		dimensionsDetectedCount: i.dimensionsDetectedCount,
		metaRawOption: I(t)
	});
}
function qh(e) {
	return new tg({
		data: e,
		sourceFormat: mt(e) ? Vu : Lu
	});
}
function Jh(e) {
	return new tg({
		data: e.data,
		sourceFormat: e.sourceFormat,
		seriesLayoutBy: e.seriesLayoutBy,
		dimensionsDefine: I(e.dimensionsDefine),
		startIndex: e.startIndex,
		dimensionsDetectedCount: e.dimensionsDetectedCount
	});
}
function Yh(e) {
	var t = Hu;
	if (mt(e)) t = Vu;
	else if (B(e)) {
		e.length === 0 && (t = Ru);
		for (var n = 0, r = e.length; n < r; n++) {
			var i = e[n];
			if (i != null) {
				if (B(i) || mt(i)) {
					t = Ru;
					break;
				}
				if (U(i)) {
					t = zu;
					break;
				}
			}
		}
	} else if (U(e)) {
		for (var a in e) if (jt(e, a) && it(e[a])) {
			t = Bu;
			break;
		}
	}
	return t;
}
function Xh(e, t, n, r, i) {
	var a, o;
	if (!e) return {
		dimensionsDefine: Qh(i),
		startIndex: o,
		dimensionsDetectedCount: a
	};
	if (t === "arrayRows") {
		var s = e;
		r === "auto" || r == null ? $h(function(e) {
			e != null && e !== "-" && (H(e) ? o ??= 1 : o = 0);
		}, n, s, 10) : o = ft(r) ? r : +!!r, !i && o === 1 && (i = [], $h(function(e, t) {
			i[t] = e == null ? "" : e + "";
		}, n, s, Infinity)), a = i ? i.length : n === "row" ? s.length : s[0] ? s[0].length : null;
	} else if (t === "objectRows") i ||= Zh(e);
	else if (t === "keyedColumns") i || (i = [], R(e, function(e, t) {
		i.push(t);
	}));
	else if (t === "original") {
		var c = Rl(e[0]);
		a = B(c) && c.length || 1;
	} else t === "typedArray" && process.env.NODE_ENV !== "production" && G(!!i, "dimensions must be given if data is TypedArray.");
	return {
		startIndex: o,
		dimensionsDefine: Qh(i),
		dimensionsDetectedCount: a
	};
}
function Zh(e) {
	for (var t = 0, n; t < e.length && !(n = e[t++]););
	if (n) return ct(n);
}
function Qh(e) {
	if (e) {
		var t = K();
		return z(e, function(e, n) {
			e = U(e) ? e : { name: e };
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
function $h(e, t, n, r) {
	if (t === "row") for (var i = 0; i < n.length && i < r; i++) e(n[i] ? n[i][0] : null, i);
	else for (var a = n[0] || [], i = 0; i < a.length && i < r; i++) e(a[i], i);
}
function eg(e) {
	var t = e.sourceFormat;
	return t === "objectRows" || t === "keyedColumns";
}
var tg, ng = M((() => {
	q(), Wu(), Z(), Wh(), tg = function() {
		function e(e) {
			this.data = e.data || (e.sourceFormat === "keyedColumns" ? {} : []), this.sourceFormat = e.sourceFormat || "unknown", this.seriesLayoutBy = e.seriesLayoutBy || "column", this.startIndex = e.startIndex || 0, this.dimensionsDetectedCount = e.dimensionsDetectedCount, this.metaRawOption = e.metaRawOption;
			var t = this.dimensionsDefine = e.dimensionsDefine;
			if (t) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				r.type == null && Bh(this, n) === Hh.Must && (r.type = "ordinal");
			}
		}
		return e;
	}();
}));
//#endregion
//#region node_modules/echarts/lib/data/helper/dataProvider.js
function rg(e, t) {
	var n = vg[og(e, t)];
	return process.env.NODE_ENV !== "production" && G(n, "Do not support get item on \"" + e + "\", \"" + t + "\"."), n;
}
function ig(e, t) {
	var n = bg[og(e, t)];
	return process.env.NODE_ENV !== "production" && G(n, "Do not support count on \"" + e + "\", \"" + t + "\"."), n;
}
function ag(e) {
	var t = Sg[e];
	return process.env.NODE_ENV !== "production" && G(t, "Do not support get value on \"" + e + "\"."), t;
}
function og(e, t) {
	return e === "arrayRows" ? e + "_" + t : e;
}
function sg(e, t, n) {
	if (e) {
		var r = e.getRawDataItem(t);
		if (r != null) {
			var i = e.getStore(), a = i.getSource().sourceFormat;
			if (n != null) {
				var o = e.getDimensionIndex(n), s = i.getDimensionProperty(o);
				return ag(a)(r, o, s);
			}
			var c = r;
			return a === "original" && (c = Rl(r)), c;
		}
	}
}
var cg, lg, ug, dg, fg, pg, mg, hg, gg, _g, vg, yg, bg, xg, Sg, Cg = M((() => {
	q(), Z(), ng(), Wu(), Pl(), mg = function() {
		function e(e, t) {
			var n = Gh(e) ? e : qh(e);
			this._source = n;
			var r = this._data = n.data, i = n.sourceFormat, a = n.seriesLayoutBy;
			if (i === "typedArray") {
				if (process.env.NODE_ENV !== "production" && t == null) throw Error("Typed array data must specify dimension size");
				this._offset = 0, this._dimSize = t, this._data = r;
			}
			if (process.env.NODE_ENV !== "production") {
				var o = gg[og(i, a)];
				o && o(r, n.dimensionsDefine);
			}
			pg(this, r, n);
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
			pg = function(e, i, a) {
				var o = a.sourceFormat, s = a.seriesLayoutBy, c = a.startIndex, l = a.dimensionsDefine, u = fg[og(o, s)];
				if (process.env.NODE_ENV !== "production" && G(u, "Invalide sourceFormat: " + o), L(e, u), o === "typedArray") e.getItem = t, e.count = r, e.fillStorage = n;
				else {
					var d = rg(o, s);
					e.getItem = Kt(d, null, i, c, l);
					var f = ig(o, s);
					e.count = Kt(f, null, i, c, l);
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
			fg = (e = {}, e[Ru + "_" + Uu] = {
				pure: !0,
				appendData: i
			}, e[Ru + "_row"] = {
				pure: !0,
				appendData: function() {
					throw Error("Do not support appendData when set seriesLayoutBy: \"row\".");
				}
			}, e[zu] = {
				pure: !0,
				appendData: i
			}, e[Bu] = {
				pure: !0,
				appendData: function(e) {
					var t = this._data;
					R(e, function(e, n) {
						for (var r = t[n] || (t[n] = []), i = 0; i < (e || []).length; i++) r.push(e[i]);
					});
				}
			}, e[Lu] = { appendData: i }, e[Vu] = {
				persistent: !1,
				pure: !0,
				appendData: function(e) {
					process.env.NODE_ENV !== "production" && G(mt(e), "Added data must be TypedArray if data in initialization is TypedArray"), this._data = e;
				},
				clean: function() {
					this._offset += this.count(), this._data = null;
				}
			}, e);
			function i(e) {
				for (var t = 0; t < e.length; t++) this._data.push(e[t]);
			}
		}(), e;
	}(), hg = function(e) {
		B(e) || El("series.data or dataset.source must be an array.");
	}, gg = (cg = {}, cg[Ru + "_" + Uu] = hg, cg[Ru + "_row"] = hg, cg[zu] = hg, cg[Bu] = function(e, t) {
		for (var n = 0; n < t.length; n++) t[n].name ?? El("dimension name must not be null/undefined.");
	}, cg[Lu] = hg, cg), _g = function(e, t, n, r) {
		return e[r];
	}, vg = (lg = {}, lg[Ru + "_" + Uu] = function(e, t, n, r) {
		return e[r + t];
	}, lg[Ru + "_row"] = function(e, t, n, r, i) {
		r += t;
		for (var a = i || [], o = e, s = 0; s < o.length; s++) {
			var c = o[s];
			a[s] = c ? c[r] : null;
		}
		return a;
	}, lg[zu] = _g, lg[Bu] = function(e, t, n, r, i) {
		for (var a = i || [], o = 0; o < n.length; o++) {
			var s = n[o].name, c = s == null ? null : e[s];
			a[o] = c ? c[r] : null;
		}
		return a;
	}, lg[Lu] = _g, lg), yg = function(e, t, n) {
		return e.length;
	}, bg = (ug = {}, ug[Ru + "_" + Uu] = function(e, t, n) {
		return Math.max(0, e.length - t);
	}, ug[Ru + "_row"] = function(e, t, n) {
		var r = e[0];
		return r ? Math.max(0, r.length - t) : 0;
	}, ug[zu] = yg, ug[Bu] = function(e, t, n) {
		var r = n[0].name, i = r == null ? null : e[r];
		return i ? i.length : 0;
	}, ug[Lu] = yg, ug), xg = function(e, t, n) {
		return e[t];
	}, Sg = (dg = {}, dg[Ru] = xg, dg[zu] = function(e, t, n) {
		return e[n];
	}, dg[Bu] = xg, dg[Lu] = function(e, t, n) {
		var r = Rl(e);
		return r instanceof Array ? r[t] : r;
	}, dg[Vu] = xg, dg);
}));
//#endregion
//#region node_modules/echarts/lib/data/helper/dimensionHelper.js
function wg(e, t) {
	var n = {}, r = n.encode = {}, i = K(), a = [], o = [], s = {};
	R(e.dimensions, function(t) {
		var n = e.getDimensionInfo(t), c = n.coordDim;
		if (c) {
			process.env.NODE_ENV !== "production" && G(Iu.get(c) == null);
			var l = n.coordDimIndex;
			Tg(r, c)[l] = t, n.isExtraCoord || (i.set(c, 1), Dg(n.type) && (a[0] = t), Tg(s, c)[l] = e.getDimensionIndex(n.name)), n.defaultTooltip && o.push(t);
		}
		Iu.each(function(e, t) {
			var i = Tg(r, t), a = n.otherDims[t];
			a != null && a !== !1 && (i[a] = n.name);
		});
	});
	var c = [], l = {};
	i.each(function(e, t) {
		var n = r[t];
		l[t] = n[0], c = c.concat(n);
	}), n.dataDimsOnCoord = c, n.dataDimIndicesOnCoord = z(c, function(t) {
		return e.getDimensionInfo(t).storeDimIndex;
	}), n.encodeFirstDimNotExtra = l;
	var u = r.label;
	u && u.length && (a = u.slice());
	var d = r.tooltip;
	return d && d.length ? o = d.slice() : o.length || (o = a.slice()), r.defaultedLabel = a, r.defaultedTooltip = o, n.userOutput = new Og(s, t), n;
}
function Tg(e, t) {
	return e.hasOwnProperty(t) || (e[t] = []), e[t];
}
function Eg(e) {
	return e === "category" ? "ordinal" : e === "time" ? "time" : "float";
}
function Dg(e) {
	return e !== "ordinal" && e !== "time";
}
var Og, kg = M((() => {
	q(), Wu(), Og = function() {
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
})), Ag, jg = M((() => {
	q(), Ag = function() {
		function e(e) {
			this.otherDims = {}, e != null && L(this, e);
		}
		return e;
	}();
}));
//#endregion
//#region node_modules/echarts/lib/data/helper/dataValueHelper.js
function Mg(e, t) {
	var n = t && t.type;
	return n === "ordinal" ? e : (n === "time" && !ft(e) && e != null && e !== "-" && (e = +Xc(e)), e == null || e === "" ? NaN : Number(e));
}
function Ng(e) {
	var t = "", n = -Infinity, r = -Infinity, i = Infinity, a = Infinity;
	return e && (e.g != null && (t += "G" + e.g, n = e.g), e.ge != null && (t += "GE" + e.ge, r = e.ge), e.l != null && (t += "L" + e.l, i = e.l), e.le != null && (t += "LE" + e.le, a = e.le)), {
		key: t,
		g: n,
		ge: r,
		l: i,
		le: a
	};
}
function Pg(e, t) {
	return t > e.g && t >= e.ge && t < e.l && t <= e.le;
}
var Fg, Ig, Lg = M((() => {
	Sl(), q(), Pl(), K({
		number: function(e) {
			return parseFloat(e);
		},
		time: function(e) {
			return +Xc(e);
		},
		trim: function(e) {
			return H(e) ? wt(e) : e;
		}
	}), Fg = {
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
			if (!ft(t)) {
				var n = "";
				process.env.NODE_ENV !== "production" && (n = "rvalue of \"<\", \">\", \"<=\", \">=\" can only be number in filter."), Al(n);
			}
			this._opFn = Fg[e], this._rvalFloat = el(t);
		}
		return e.prototype.evaluate = function(e) {
			return ft(e) ? this._opFn(e, this._rvalFloat) : this._opFn(el(e), this._rvalFloat);
		}, e;
	}(), Ig = function() {
		function e(e, t) {
			var n = e === "desc";
			this._resultLT = n ? 1 : -1, t ??= n ? "min" : "max", this._incomparable = t === "min" ? -Infinity : Infinity;
		}
		return e.prototype.evaluate = function(e, t) {
			var n = ft(e) ? e : el(e), r = ft(t) ? t : el(t), i = isNaN(n), a = isNaN(r);
			if (i && (n = this._incomparable), a && (r = this._incomparable), i && a) {
				var o = H(e), s = H(t);
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
function Rg(e) {
	return e > 65535 ? Vg : Hg;
}
function zg(e) {
	var t = e.constructor;
	return t === Array ? e.slice() : new t(e);
}
function Bg(e, t, n, r, i) {
	var a = Gg[n || "float"];
	if (i) {
		var o = e[t], s = o && o.length;
		if (s !== r) {
			for (var c = new a(r), l = 0; l < s; l++) c[l] = o[l];
			e[t] = c;
		}
	} else e[t] = new a(r);
}
var Vg, Hg, Ug, Wg, Gg, Kg, qg, Jg = M((() => {
	q(), Wu(), Lg(), ng(), Z(), Sl(), Vg = typeof Uint32Array > "u" ? Array : Uint32Array, Hg = typeof Uint16Array > "u" ? Array : Uint16Array, Ug = typeof Int32Array > "u" ? Array : Int32Array, Wg = typeof Float64Array > "u" ? Array : Float64Array, Gg = {
		float: Wg,
		int: Ug,
		ordinal: Array,
		number: Array,
		time: Wg
	}, qg = function() {
		function e() {
			this._chunks = [], this._rawExtent = [], this._extent = [], this._count = 0, this._rawCount = 0, this._calcDimNameToIdx = K();
		}
		return e.prototype.initData = function(e, t, n) {
			process.env.NODE_ENV !== "production" && G(V(e.getItem) && V(e.count), "Invalid data provider."), this._provider = e, this._chunks = [], this._indices = null, this.getRawIndex = this._getRawIdxIdentity;
			var r = e.getSource(), i = this.defaultDimValueGetter = Kg[r.sourceFormat];
			this._dimValueGetter = n || i, this._rawExtent = [];
			var a = eg(r);
			this._dimensions = z(t, function(e) {
				return process.env.NODE_ENV !== "production" && a && G(e.property != null), {
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
			return r[i] = { type: t }, n.set(e, i), this._chunks[i] = new Gg[t || "float"](this._rawCount), this._rawExtent[i] = fu(), i;
		}, e.prototype.collectOrdinalMeta = function(e, t) {
			var n = this._chunks[e], r = this._dimensions[e], i = this._rawExtent, a = r.ordinalOffset || 0, o = n.length;
			a === 0 && (i[e] = fu());
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
			process.env.NODE_ENV !== "production" && G(!this._indices, "appendData can only be called on raw data.");
			var t = this._provider, n = this.count();
			t.appendData(e);
			var r = t.count();
			return t.persistent || (r += n), n < r && this._initDataFromProvider(n, r, !0), [n, r];
		}, e.prototype.appendValues = function(e, t) {
			for (var n = this._chunks, r = this._dimensions, i = r.length, a = this._rawExtent, o = this.count(), s = o + Math.max(e.length, t || 0), c = 0; c < i; c++) {
				var l = r[c];
				Bg(n, c, l.type, s, !0);
			}
			for (var u = [], d = o; d < s; d++) for (var f = d - o, p = 0; p < i; p++) {
				var l = r[p], m = Kg.arrayRows.call(this, e[f] || u, l.property, f, p);
				n[p][d] = m;
				var h = a[p];
				m < h[0] && (h[0] = m), m > h[1] && (h[1] = m);
			}
			return this._rawCount = this._count = s, {
				start: o,
				end: s
			};
		}, e.prototype._initDataFromProvider = function(e, t, n) {
			for (var r = this._provider, i = this._chunks, a = this._dimensions, o = a.length, s = this._rawExtent, c = z(a, function(e) {
				return e.property;
			}), l = 0; l < o; l++) {
				var u = a[l];
				s[l] || (s[l] = fu()), Bg(i, l, u.type, t, n);
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
				var n = Rg(this._rawCount);
				e = new n(this.count());
				for (var i = 0; i < e.length; i++) e[i] = i;
			}
			return e;
		}, e.prototype.filter = function(e, t) {
			if (!this._count) return this;
			for (var n = this.clone(), r = n.count(), i = new (Rg(n._rawCount))(r), a = [], o = e.length, s = 0, c = e[0], l = n._chunks, u = 0; u < r; u++) {
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
			var r = ct(e), i = r.length;
			if (!i) return this;
			var a = t.count(), o = new (Rg(t._rawCount))(a), s = 0, c = r[0], l = e[c][0], u = e[c][1], d = t._chunks, f = !1;
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
			for (var r = e._chunks, i = [], a = t.length, o = e.count(), s = [], c = e._rawExtent, l = 0; l < t.length; l++) c[t[l]] = fu();
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
			var n = this.clone([e], !0), r = n._chunks[e], i = this.count(), a = 0, o = Math.floor(1 / t), s = this.getRawIndex(0), c, l, u, d = new (Rg(this._rawCount))(Math.min((Math.ceil(i / o) + 2) * 2, i));
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
			for (var n = this.clone([e], !0), r = n._chunks, i = Math.floor(1 / t), a = r[e], o = this.count(), s = new (Rg(this._rawCount))(Math.ceil(o / i) * 2), c = 0, l = 0; l < o; l += i) {
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
			for (var i = this.clone([e], !0), a = i._chunks, o = [], s = Math.floor(1 / t), c = a[e], l = this.count(), u = i._rawExtent[e] = fu(), d = new (Rg(this._rawCount))(Math.ceil(l / s)), f = 0, p = 0; p < l; p += s) {
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
			var n = this._chunks[e], r = fu();
			if (!n) return r;
			var i = this.count();
			if (!this._indices && !t) return this._rawExtent[e].slice();
			var a = this._extent, o = a[e] || (a[e] = {}), s = Ng(t), c = s.key, l = o[c];
			if (l) return l.slice();
			for (var u = r[0], d = r[1], f = 0; f < i; f++) {
				var p = n[this.getRawIndex(f)];
				(!t || Pg(s, p)) && (p < u && (u = p), p > d && (d = p));
			}
			return o[c] = [u, d];
		}, e.prototype.getRawDataItem = function(e) {
			var t = this.getRawIndex(e);
			if (this._provider.persistent) return this._provider.getItem(t);
			for (var n = [], r = this._chunks, i = 0; i < r.length; i++) n.push(r[i][t]);
			return n;
		}, e.prototype.clone = function(t, n) {
			var r = new e(), i = this._chunks, a = t && at(t, function(e, t) {
				return e[t] = !0, e;
			}, {});
			if (a) for (var o = 0; o < i.length; o++) r._chunks[o] = a[o] ? zg(i[o]) : i[o];
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
				return Mg(e[r], this._dimensions[r]);
			}
			Kg = {
				arrayRows: e,
				objectRows: function(e, t, n, r) {
					return Mg(e[t], this._dimensions[r]);
				},
				keyedColumns: e,
				original: function(e, t, n, r) {
					var i = e && (e.value == null ? e : e.value);
					return Mg(i instanceof Array ? i[r] : i, this._dimensions[r]);
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
function Yg(e) {
	return e instanceof t_;
}
function Xg(e) {
	for (var t = K(), n = 0; n < (e || []).length; n++) {
		var r = e[n], i = U(r) ? r.name : r;
		i != null && t.get(i) == null && t.set(i, n);
	}
	return t;
}
function Zg(e) {
	var t = $g(e);
	return t.dimNameMap ||= Xg(e.dimensionsDefine);
}
function Qg(e) {
	return e > 30;
}
var $g, e_, t_, n_ = M((() => {
	q(), Z(), ng(), $g = ru(), e_ = {
		float: "f",
		int: "i",
		ordinal: "o",
		number: "n",
		time: "t"
	}, t_ = function() {
		function e(e) {
			this.dimensions = e.dimensions, this._dimOmitted = e.dimensionOmitted, this.source = e.source, this._fullDimCount = e.fullDimensionCount, this._updateDimOmitted(e.dimensionOmitted);
		}
		return e.prototype.isDimensionOmitted = function() {
			return this._dimOmitted;
		}, e.prototype._updateDimOmitted = function(e) {
			this._dimOmitted = e, e && (this._dimNameMap ||= Zg(this.source));
		}, e.prototype.getSourceDimensionIndex = function(e) {
			return W(this._dimNameMap.get(e), -1);
		}, e.prototype.getSourceDimension = function(e) {
			var t = this.source.dimensionsDefine;
			if (t) return t[e];
		}, e.prototype.makeStoreSchema = function() {
			for (var e = this._fullDimCount, t = eg(this.source), n = !Qg(e), r = "", i = [], a = 0, o = 0; a < e; a++) {
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
				}), t && s != null && (!u || !u.isCalculationCoord) && (r += n ? s.replace(/\`/g, "`1").replace(/\$/g, "`2") : s), r += "$", r += e_[c] || "f", l && (r += l.uid), r += "$";
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
})), r_, i_, a_, o_, s_, c_, l_, u_, d_, f_, p_, m_, h_, g_, __, v_ = M((() => {
	q(), jh(), Fh(), Cg(), kg(), jg(), Wu(), Z(), Fu(), ng(), Jg(), n_(), r_ = U, i_ = z, a_ = typeof Int32Array > "u" ? Array : Int32Array, o_ = "e\0\0", s_ = -1, c_ = [
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
	], l_ = ["_approximateExtent"], __ = function() {
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
			Yg(e) ? (n = e.dimensions, this._dimOmitted = e.isDimensionOmitted(), this._schema = e) : (r = !0, n = e), n ||= ["x", "y"];
			for (var i = {}, a = [], o = {}, s = !1, c = {}, l = 0; l < n.length; l++) {
				var u = n[l], d = H(u) ? new Ag({ name: u }) : u instanceof Ag ? u : new Ag(u), f = d.name;
				d.type = d.type || "float", d.coordDim || (d.coordDim = f, d.coordDimIndex = 0);
				var p = d.otherDims = d.otherDims || {};
				a.push(f), i[f] = d, c[f] != null && (s = !0), d.createInvertedIndices && (o[f] = []), process.env.NODE_ENV !== "production" && G(r || d.storeDimIndex >= 0), r && (d.storeDimIndex = l), p.itemName === 0 && (this._nameDimIdx = d.storeDimIndex), p.itemId === 0 && (this._idDimIdx = d.storeDimIndex);
			}
			if (this.dimensions = a, this._dimInfos = i, this._initGetDimensionInfo(s), this.hostModel = t, this._invertedIndicesMap = o, this._dimOmitted) {
				var m = this._dimIdxToName = K();
				R(a, function(e) {
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
			if (ft(e) || e != null && !isNaN(e) && !this._getDimInfo(e) && (!this._dimOmitted || this._schema.getSourceDimensionIndex(e) < 0)) return +e;
		}, e.prototype._getStoreDimIndex = function(e) {
			var t = this.getDimensionIndex(e);
			if (process.env.NODE_ENV !== "production" && t == null) throw Error("Unknown dimension " + e);
			return t;
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
			if (e instanceof qg && (i = e), !i) {
				var a = this.dimensions, o = Gh(e) || it(e) ? new mg(e, a.length) : e;
				i = new qg();
				var s = i_(a, function(e) {
					return {
						type: r._dimInfos[e].type,
						property: e
					};
				});
				i.initData(o, s, n);
			}
			this._store = i, this._nameList = (t || []).slice(), this._idList = [], this._nameRepeatCount = {}, this._doInit(0, i.count()), this._dimSummary = wg(this, this._schema), this.userOutput = this._dimSummary.userOutput;
		}, e.prototype.appendData = function(e) {
			var t = this._store.appendData(e);
			this._doInit(t[0], t[1]);
		}, e.prototype.appendValues = function(e, t) {
			var n = this._store.appendValues(e, t && t.length), r = n.start, i = n.end, a = this._shouldMakeIdFromName();
			if (this._updateOrdinalMeta(), t) for (var o = r; o < i; o++) {
				var s = o - r;
				this._nameList[o] = t[s], a && g_(this, o);
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
					if (!this.hasItemOption && zl(s) && (this.hasItemOption = !0), s) {
						var c = s.name;
						r[o] == null && c != null && (r[o] = Yl(c, null));
						var l = s.id;
						i[o] == null && l != null && (i[o] = Yl(l, null));
					}
				}
				if (this._shouldMakeIdFromName()) for (var o = e; o < t; o++) g_(this, o);
				u_(this);
			}
		}, e.prototype.getApproximateExtent = function(e, t) {
			return this._approximateExtent[e] || this._store.getDataExtent(this._getStoreDimIndex(e), t);
		}, e.prototype.setApproximateExtent = function(e, t) {
			t = this.getDimension(t), this._approximateExtent[t] = e.slice();
		}, e.prototype.getCalculationInfo = function(e) {
			return this._calculationInfo[e];
		}, e.prototype.setCalculationInfo = function(e, t) {
			r_(e) ? L(this._calculationInfo, e) : this._calculationInfo[e] = t;
		}, e.prototype.getName = function(e) {
			var t = this.getRawIndex(e), n = this._nameList[t];
			return n == null && this._nameDimIdx != null && (n = f_(this, this._nameDimIdx, t)), n ??= "", n;
		}, e.prototype._getCategory = function(e, t) {
			var n = this._store.get(e, t), r = this._store.getOrdinalMeta(e);
			return r ? r.categories[n] : n;
		}, e.prototype.getId = function(e) {
			return d_(this, this.getRawIndex(e));
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
			return B(e) ? r.getValues(i_(e, function(e) {
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
			var n = e && this._invertedIndicesMap[e];
			if (process.env.NODE_ENV !== "production" && !n) throw Error("Do not supported yet");
			var r = n && n[t];
			return r == null || isNaN(r) ? s_ : r;
		}, e.prototype.each = function(e, t, n) {
			V(e) && (n = t, t = e, e = []);
			var r = n || this, i = i_(p_(e), this._getStoreDimIndex, this);
			this._store.each(i, r ? Kt(t, r) : t);
		}, e.prototype.filterSelf = function(e, t, n) {
			V(e) && (n = t, t = e, e = []);
			var r = n || this, i = i_(p_(e), this._getStoreDimIndex, this);
			return this._store = this._store.filter(i, r ? Kt(t, r) : t), this;
		}, e.prototype.selectRange = function(e) {
			var t = this, n = {}, r = ct(e), i = [];
			return R(r, function(r) {
				var a = t._getStoreDimIndex(r);
				n[a] = e[r], i.push(a);
			}), this._store = this._store.selectRange(n), this;
		}, e.prototype.mapArray = function(e, t, n) {
			V(e) && (n = t, t = e, e = []), n ||= this;
			var r = [];
			return this.each(e, function() {
				r.push(t && t.apply(this, arguments));
			}, n), r;
		}, e.prototype.map = function(e, t, n, r) {
			var i = n || r || this, a = i_(p_(e), this._getStoreDimIndex, this), o = h_(this);
			return o._store = this._store.map(a, i ? Kt(t, i) : t), o;
		}, e.prototype.modify = function(e, t, n, r) {
			var i = this, a = n || r || this;
			process.env.NODE_ENV !== "production" && R(p_(e), function(e) {
				i.getDimensionInfo(e).isCalculationCoord || console.error("Danger: only stack dimension can be modified");
			});
			var o = i_(p_(e), this._getStoreDimIndex, this);
			this._store.modify(o, a ? Kt(t, a) : t);
		}, e.prototype.downSample = function(e, t, n, r) {
			var i = h_(this);
			return i._store = this._store.downSample(this._getStoreDimIndex(e), t, n, r), i;
		}, e.prototype.minmaxDownSample = function(e, t) {
			var n = h_(this);
			return n._store = this._store.minmaxDownSample(this._getStoreDimIndex(e), t), n;
		}, e.prototype.lttbDownSample = function(e, t) {
			var n = h_(this);
			return n._store = this._store.lttbDownSample(this._getStoreDimIndex(e), t), n;
		}, e.prototype.getRawDataItem = function(e) {
			return this._store.getRawDataItem(e);
		}, e.prototype.getItemModel = function(e) {
			var t = this.hostModel, n = this.getRawDataItem(e);
			return new Ah(n, t, t && t.ecModel);
		}, e.prototype.diff = function(e) {
			var t = this;
			return new Ph(e ? e.getStore().getIndices() : [], this.getStore().getIndices(), function(t) {
				return d_(e, t);
			}, function(e) {
				return d_(t, e);
			});
		}, e.prototype.getVisual = function(e) {
			var t = this._visual;
			return t && t[e];
		}, e.prototype.setVisual = function(e, t) {
			this._visual = this._visual || {}, r_(e) ? L(this._visual, e) : this._visual[e] = t;
		}, e.prototype.getItemVisual = function(e, t) {
			var n = this._itemVisuals[e];
			return (n && n[t]) ?? this.getVisual(t);
		}, e.prototype.hasItemVisual = function() {
			return this._itemVisuals.length > 0;
		}, e.prototype.ensureUniqueItemVisual = function(e, t) {
			var n = this._itemVisuals, r = n[e];
			r ||= n[e] = {};
			var i = r[t];
			return i ?? (i = this.getVisual(t), B(i) ? i = i.slice() : r_(i) && (i = L({}, i)), r[t] = i), i;
		}, e.prototype.setItemVisual = function(e, t, n) {
			var r = this._itemVisuals[e] || {};
			this._itemVisuals[e] = r, r_(t) ? L(r, t) : r[t] = n;
		}, e.prototype.clearAllVisual = function() {
			this._visual = {}, this._itemVisuals = [];
		}, e.prototype.setLayout = function(e, t) {
			r_(e) ? L(this._layout, e) : this._layout[e] = t;
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
			Pu(n, this.dataType, e, t), this._graphicEls[e] = t;
		}, e.prototype.getItemGraphicEl = function(e) {
			return this._graphicEls[e];
		}, e.prototype.eachItemGraphicEl = function(e, t) {
			R(this._graphicEls, function(n, r) {
				n && e && e.call(t, n, r);
			});
		}, e.prototype.cloneShallow = function(t) {
			return t ||= new e(this._schema ? this._schema : i_(this.dimensions, this._getDimInfo, this), this.hostModel), m_(t, this), t._store = this._store, t;
		}, e.prototype.wrapMethod = function(e, t) {
			var n = this[e];
			V(n) && (this.__wrappedMethods = this.__wrappedMethods || [], this.__wrappedMethods.push(e), this[e] = function() {
				var e = n.apply(this, arguments);
				return t.apply(this, [e].concat(St(arguments)));
			});
		}, e.internalField = function() {
			u_ = function(e) {
				var t = e._invertedIndicesMap;
				R(t, function(n, r) {
					var i = e._dimInfos[r], a = i.ordinalMeta, o = e._store;
					if (a) {
						n = t[r] = new a_(a.categories.length);
						for (var s = 0; s < n.length; s++) n[s] = s_;
						for (var s = 0; s < o.count(); s++) n[o.get(i.storeDimIndex, s)] = s;
					}
				});
			}, f_ = function(e, t, n) {
				return Yl(e._getCategory(t, n), null);
			}, d_ = function(e, t) {
				var n = e._idList[t];
				return n == null && e._idDimIdx != null && (n = f_(e, e._idDimIdx, t)), n ??= o_ + t, n;
			}, p_ = function(e) {
				return B(e) || (e = e == null ? [] : [e]), e;
			}, h_ = function(t) {
				var n = new e(t._schema ? t._schema : i_(t.dimensions, t._getDimInfo, t), t.hostModel);
				return m_(n, t), n;
			}, m_ = function(e, t) {
				R(c_.concat(t.__wrappedMethods || []), function(n) {
					t.hasOwnProperty(n) && (e[n] = t[n]);
				}), e.__wrappedMethods = t.__wrappedMethods, R(l_, function(n) {
					e[n] = I(t[n]);
				}), e._calculationInfo = L({}, t._calculationInfo);
			}, g_ = function(e, t) {
				var n = e._nameList, r = e._idList, i = e._nameDimIdx, a = e._idDimIdx, o = n[t], s = r[t];
				if (o == null && i != null && (n[t] = o = f_(e, i, t)), s == null && a != null && (r[t] = s = f_(e, a, t)), s == null && o != null) {
					var c = e._nameRepeatCount, l = c[o] = (c[o] || 0) + 1;
					s = o, l > 1 && (s += "__ec__" + l), r[t] = s;
				}
			};
		}(), e;
	}();
}));
//#endregion
//#region node_modules/echarts/lib/data/helper/createDimensions.js
function y_(e, t) {
	Gh(e) || (e = qh(e)), t ||= {};
	var n = t.coordDimensions || [], r = t.dimensionsDefine || e.dimensionsDefine || [], i = K(), a = [], o = b_(e, n, r, t.dimensionsCount), s = t.canOmitUnusedDimensions && Qg(o), c = r === e.dimensionsDefine, l = c ? Zg(e) : Xg(r), u = t.encodeDefine;
	!u && t.encodeDefaulter && (u = t.encodeDefaulter(e, o));
	for (var d = K(u), f = new Ug(o), p = 0; p < f.length; p++) f[p] = -1;
	function m(e) {
		var t = f[e];
		if (t < 0) {
			var n = r[e], i = U(n) ? n : { name: n }, o = new Ag(), s = i.name;
			return s != null && l.get(s) != null && (o.name = o.displayName = s), i.type != null && (o.type = i.type), i.displayName != null && (o.displayName = i.displayName), f[e] = a.length, o.storeDimIndex = e, a.push(o), o;
		}
		return a[t];
	}
	if (!s) for (var p = 0; p < o; p++) m(p);
	d.each(function(e, t) {
		var n = Il(e).slice();
		if (n.length === 1 && !H(n[0]) && n[0] < 0) {
			d.set(t, !1);
			return;
		}
		var r = d.set(t, []);
		R(n, function(e, n) {
			var i = H(e) ? l.get(e) : e;
			i != null && i < o && (r[n] = i, g(m(i), t, n));
		});
	});
	var h = 0;
	R(n, function(e) {
		var t, n, r, i;
		if (H(e)) t = e, i = {};
		else {
			i = e, t = i.name;
			var a = i.ordinalMeta;
			i.ordinalMeta = null, i = L({}, i), i.ordinalMeta = a, n = i.dimsDef, r = i.otherDims, i.name = i.coordDim = i.coordDimIndex = i.dimsDef = i.otherDims = null;
		}
		var s = d.get(t);
		if (s !== !1) {
			if (s = Il(s), !s.length) for (var l = 0; l < (n && n.length || 1); l++) {
				for (; h < o && m(h).coordDim != null;) h++;
				h < o && s.push(h++);
			}
			R(s, function(e, a) {
				var o = m(e);
				if (c && i.type != null && (o.type = i.type), g(et(o, i), t, a), o.name == null && n) {
					var s = n[a];
					!U(s) && (s = { name: s }), o.name = o.displayName = s.name, o.defaultTooltip = s.defaultTooltip;
				}
				r && et(o.otherDims, r);
			});
		}
	});
	function g(e, t, n) {
		Iu.get(t) == null ? (e.coordDim = t, e.coordDimIndex = n, i.set(t, !0)) : e.otherDims[t] = n;
	}
	var _ = t.generateCoord, v = t.generateCoordCount, y = v != null;
	v = _ ? v || 1 : 0;
	var b = _ || "value";
	function x(e) {
		e.name ??= e.coordDim;
	}
	if (s) R(a, function(e) {
		x(e);
	}), a.sort(function(e, t) {
		return e.storeDimIndex - t.storeDimIndex;
	});
	else for (var S = 0; S < o; S++) {
		var C = m(S);
		C.coordDim ?? (C.coordDim = x_(b, i, y), C.coordDimIndex = 0, (!_ || v <= 0) && (C.isExtraCoord = !0), v--), x(C), C.type == null && (Bh(e, S) === Hh.Must || C.isExtraCoord && (C.otherDims.itemName != null || C.otherDims.seriesName != null)) && (C.type = "ordinal");
	}
	return Su(a, function(e) {
		return e.name;
	}, function(e, t) {
		t > 0 && (e.name += t - 1);
	}), new t_({
		source: e,
		dimensions: a,
		fullDimensionCount: o,
		dimensionOmitted: s
	});
}
function b_(e, t, n, r) {
	var i = Math.max(e.dimensionsDetectedCount || 1, t.length, n.length, r || 0);
	return R(t, function(e) {
		var t;
		U(e) && (t = e.dimsDef) && (i = Math.max(i, t.length));
	}), i;
}
function x_(e, t, n) {
	if (n || t.hasKey(e)) {
		for (var r = 0; t.hasKey(e + r);) r++;
		e += r;
	}
	return t.set(e, !0), e;
}
var S_ = M((() => {
	Wu(), jg(), q(), ng(), Jg(), Z(), Wh(), n_();
}));
//#endregion
//#region node_modules/echarts/lib/core/CoordinateSystem.js
function C_(e) {
	return !!D_[e];
}
function w_(e) {
	var t = e.getShallow("coord", !0), n = 1;
	if (t == null) {
		var r = A_.get(e.type);
		r && r.getCoord2 && (n = 2, t = r.getCoord2(e));
	}
	return {
		coord: t,
		from: n
	};
}
function T_(e, t) {
	var n = e.getShallow("coordinateSystem"), r = e.getShallow("coordinateSystemUsage", !0), i = r != null, a = 0;
	if (n) {
		var o = e.mainType === "series";
		r ??= o ? "data" : "box", r === "data" ? (a = 1, o || (process.env.NODE_ENV !== "production" && i && t && El("coordinateSystemUsage \"data\" is not supported in non-series components."), a = 0)) : r === "box" && (a = 2, !o && !C_(n) && (process.env.NODE_ENV !== "production" && i && t && El("coordinateSystem \"" + n + "\" cannot be used" + (" as coordinateSystemUsage \"box\" for \"" + e.type + "\" yet.")), a = 0));
	}
	return {
		coordSysType: n,
		kind: a
	};
}
function E_(e) {
	var t = e.targetModel, n = e.coordSysType, r = e.coordSysProvider, i = e.isDefaultDataCoordSys, a = e.allowNotFound;
	process.env.NODE_ENV !== "production" && G(!!n);
	var o = T_(t, !0), s = o.kind, c = o.coordSysType;
	if (i && s !== 1 && (s = 1, c = n), s === 0 || c !== n) return 0;
	var l = r(n, t);
	return l ? (s === 1 ? (process.env.NODE_ENV !== "production" && G(t.mainType === "series"), t.coordinateSystem = l) : t.boxCoordinateSystem = l, s) : (process.env.NODE_ENV !== "production" && (a || El(n + " cannot be found for" + (" " + t.type + " (index: " + t.componentIndex + ")."))), 0);
}
var D_, O_, k_, A_, j_ = M((() => {
	q(), Pl(), D_ = {}, O_ = {}, k_ = function() {
		function e() {
			this._normalMasterList = [], this._nonSeriesBoxMasterList = [];
		}
		return e.prototype.create = function(e, t) {
			this._nonSeriesBoxMasterList = n(D_, !0), this._normalMasterList = n(O_, !1);
			function n(n, r) {
				var i = [];
				return R(n, function(n, a) {
					var o = n.create(e, t);
					i = i.concat(o || []), process.env.NODE_ENV !== "production" && r && R(o, function(e) {
						return G(!e.update);
					});
				}), i;
			}
		}, e.prototype.update = function(e, t) {
			R(this._normalMasterList, function(n) {
				n.update && n.update(e, t);
			});
		}, e.prototype.getCoordinateSystems = function() {
			return this._normalMasterList.concat(this._nonSeriesBoxMasterList);
		}, e.register = function(e, t) {
			if (e === "matrix" || e === "calendar") {
				D_[e] = t;
				return;
			}
			O_[e] = t;
		}, e.get = function(e) {
			return O_[e] || D_[e];
		}, e;
	}(), A_ = K();
}));
//#endregion
//#region node_modules/echarts/lib/model/referHelper.js
function M_(e) {
	var t = e.get("coordinateSystem"), n = new P_(t), r = F_[t];
	if (r) return r(e, n, n.axisMap, n.categoryAxisMap), n;
}
function N_(e) {
	return e.get("type") === "category";
}
var P_, F_, I_ = M((() => {
	q(), Z(), P_ = function() {
		function e(e) {
			this.coordSysDims = [], this.axisMap = K(), this.categoryAxisMap = K(), this.coordSysName = e;
		}
		return e;
	}(), F_ = {
		cartesian2d: function(e, t, n, r) {
			var i = e.getReferringComponents("xAxis", ju).models[0], a = e.getReferringComponents("yAxis", ju).models[0];
			if (process.env.NODE_ENV !== "production") {
				if (!i) throw Error("xAxis \"" + bt(e.get("xAxisIndex"), e.get("xAxisId"), 0) + "\" not found");
				if (!a) throw Error("yAxis \"" + bt(e.get("xAxisIndex"), e.get("yAxisId"), 0) + "\" not found");
			}
			t.coordSysDims = ["x", "y"], n.set("x", i), n.set("y", a), N_(i) && (r.set("x", i), t.firstCategoryDimIndex = 0), N_(a) && (r.set("y", a), t.firstCategoryDimIndex ??= 1);
		},
		singleAxis: function(e, t, n, r) {
			var i = e.getReferringComponents("singleAxis", ju).models[0];
			if (process.env.NODE_ENV !== "production" && !i) throw Error("singleAxis should be specified.");
			t.coordSysDims = ["single"], n.set("single", i), N_(i) && (r.set("single", i), t.firstCategoryDimIndex = 0);
		},
		polar: function(e, t, n, r) {
			var i = e.getReferringComponents("polar", ju).models[0], a = i.findAxisModel("radiusAxis"), o = i.findAxisModel("angleAxis");
			if (process.env.NODE_ENV !== "production") {
				if (!o) throw Error("angleAxis option not found");
				if (!a) throw Error("radiusAxis option not found");
			}
			t.coordSysDims = ["radius", "angle"], n.set("radius", a), n.set("angle", o), N_(a) && (r.set("radius", a), t.firstCategoryDimIndex = 0), N_(o) && (r.set("angle", o), t.firstCategoryDimIndex ??= 1);
		},
		geo: function(e, t, n, r) {
			t.coordSysDims = ["lng", "lat"];
		},
		parallel: function(e, t, n, r) {
			var i = e.ecModel, a = i.getComponent("parallel", e.get("parallelIndex")), o = t.coordSysDims = a.dimensions.slice();
			R(a.parallelAxisIndex, function(e, a) {
				var s = i.getComponent("parallelAxis", e), c = o[a];
				n.set(c, s), N_(s) && (r.set(c, s), t.firstCategoryDimIndex ??= a);
			});
		},
		matrix: function(e, t, n, r) {
			var i = e.getReferringComponents("matrix", ju).models[0];
			if (process.env.NODE_ENV !== "production" && !i) throw Error("matrix coordinate system should be specified.");
			t.coordSysDims = ["x", "y"];
			var a = i.getDimensionModel("x"), o = i.getDimensionModel("y");
			n.set("x", a), n.set("y", o), r.set("x", a), r.set("y", o);
		}
	};
}));
//#endregion
//#region node_modules/echarts/lib/data/helper/dataStackHelper.js
function L_(e, t, n) {
	n ||= {};
	var r = n.byIndex, i = n.stackedCoordDimension, a, o, s;
	R_(t) ? a = t : (o = t.schema, a = o.dimensions, s = t.store);
	var c = !!(e && e.get("stack")), l, u, d, f, p = !0;
	function m(e) {
		return e.type !== "ordinal" && e.type !== "time";
	}
	if (R(a, function(e, t) {
		H(e) && (a[t] = e = { name: e }), m(e) || (p = !1);
	}), R(a, function(e, t) {
		c && !e.isExtraCoord && (!r && !l && e.ordinalMeta && (l = e), !u && m(e) && (!p || e.coordDim !== "x" && e.coordDim !== "angle") && (!i || i === e.coordDim) && (u = e));
	}), u && !r && !l && (r = !0), u) {
		d = "__\0ecstackresult_" + e.id, f = "__\0ecstackedover_" + e.id, l && (l.createInvertedIndices = !0);
		var h = u.coordDim, g = u.type, _ = 0;
		R(a, function(e) {
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
function R_(e) {
	return !Yg(e.schema);
}
function z_(e, t) {
	return !!t && t === e.getCalculationInfo("stackedDimension");
}
function B_(e, t) {
	return z_(e, t) ? e.getCalculationInfo("stackResultDimension") : t;
}
var V_ = M((() => {
	q(), n_();
}));
//#endregion
//#region node_modules/echarts/lib/chart/helper/createSeriesData.js
function H_(e, t) {
	var n = e.get("coordinateSystem"), r = k_.get(n), i;
	return t && t.coordSysDims && (i = z(t.coordSysDims, function(e) {
		var n = { name: e }, r = t.axisMap.get(e);
		return r && (n.type = Eg(r.get("type"))), n;
	})), i ||= r && (r.getDimensionsInfo ? r.getDimensionsInfo() : r.dimensions.slice()) || ["x", "y"], i;
}
function U_(e, t, n) {
	var r, i;
	return n && R(e, function(e, a) {
		var o = e.coordDim, s = n.categoryAxisMap.get(o);
		s && (r ??= a, e.ordinalMeta = s.getOrdinalMeta(), t && (e.createInvertedIndices = !0)), e.otherDims.itemName != null && (i = !0);
	}), !i && r != null && (e[r].otherDims.itemName = 0), r;
}
function W_(e, t, n) {
	n ||= {};
	var r = t.getSourceManager(), i, a = !1;
	e ? (a = !0, i = qh(e)) : (i = r.getSource(), a = i.sourceFormat === Lu);
	var o = M_(t), s = H_(t, o), c = n.useEncodeDefaulter, l = V(c) ? c : c ? ut(Lh, s, t) : null, u = {
		coordDimensions: s,
		generateCoord: n.generateCoord,
		encodeDefine: t.getEncode(),
		encodeDefaulter: l,
		canOmitUnusedDimensions: !a
	}, d = y_(i, u), f = U_(d.dimensions, n.createInvertedIndices, o), p = a ? null : r.getSharedDataStore(d), m = L_(t, {
		schema: d,
		store: p
	}), h = new __(d, t);
	h.setCalculationInfo(m);
	var g = f != null && G_(i) ? function(e, t, n, r) {
		return r === f ? n : this.defaultDimValueGetter(e, t, n, r);
	} : null;
	return h.hasItemOption = !1, h.initData(a ? i : p, null, g), h;
}
function G_(e) {
	if (e.sourceFormat === "original") return !B(Rl(K_(e.data || [])));
}
function K_(e) {
	for (var t = 0; t < e.length && e[t] == null;) t++;
	return e[t];
}
var q_ = M((() => {
	q(), v_(), S_(), kg(), Z(), j_(), I_(), ng(), V_(), Wh(), Wu();
}));
//#endregion
//#region node_modules/echarts/lib/util/component.js
function J_(e) {
	return [e || "", Q_++].join("_");
}
function Y_(e) {
	var t = {};
	e.registerSubTypeDefaulter = function(e, n) {
		var r = tn(e);
		t[r.main] = n;
	}, e.determineSubType = function(n, r) {
		var i = r.type;
		if (!i) {
			var a = tn(n).main;
			e.hasSubTypes(n) && t[a] && (i = t[a](r));
		}
		return i;
	};
}
function X_(e, t) {
	e.topologicalTravel = function(e, t, r, i) {
		if (!e.length) return;
		var a = n(t), o = a.graph, s = a.noEntryList, c = {};
		for (R(e, function(e) {
			c[e] = !0;
		}); s.length;) {
			var l = s.pop(), u = o[l], d = !!c[l];
			d && (r.call(i, l, u.originalDeps.slice()), delete c[l]), R(u.successor, d ? p : f);
		}
		R(c, function() {
			var n = "";
			throw process.env.NODE_ENV !== "production" && (n = kl("Circular dependency may exists: ", c, e, t)), Error(n);
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
		return R(e, function(o) {
			var s = r(n, o), c = i(s.originalDeps = t(o), e);
			s.entryCount = c.length, s.entryCount === 0 && a.push(o), R(c, function(e) {
				tt(s.predecessor, e) < 0 && s.predecessor.push(e);
				var t = r(n, e);
				tt(t.successor, e) < 0 && t.successor.push(o);
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
		return R(e, function(e) {
			tt(t, e) >= 0 && n.push(e);
		}), n;
	}
}
function Z_(e, t) {
	return Qe(Qe({}, e, !0), t, !0);
}
var Q_, $_ = M((() => {
	q(), gn(), Pl(), Q_ = Math.round(Math.random() * 10);
}));
//#endregion
//#region node_modules/zrender/lib/core/fourPointsTransform.js
function ev(e, t, n, r, i, a) {
	var o = r + "-" + i, s = e.length;
	if (a.hasOwnProperty(o)) return a[o];
	if (t === 1) {
		var c = Math.round(Math.log((1 << s) - 1 & ~i) / nv);
		return e[n][c];
	}
	for (var l = r | 1 << n, u = n + 1; r & 1 << u;) u++;
	for (var d = 0, f = 0, p = 0; f < s; f++) {
		var m = 1 << f;
		m & i || (d += (p % 2 ? -1 : 1) * e[n][f] * ev(e, t - 1, u, l, i | m, a), p++);
	}
	return a[o] = d, d;
}
function tv(e, t) {
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
	], r = {}, i = ev(n, 8, 0, 0, 0, r);
	if (i !== 0) {
		for (var a = [], o = 0; o < 8; o++) for (var s = 0; s < 8; s++) a[s] ?? (a[s] = 0), a[s] += ((o + s) % 2 ? -1 : 1) * ev(n, 7, +(o === 0), 1 << o, 1 << s, r) / i * t[o];
		return function(e, t, n) {
			var r = t * a[6] + n * a[7] + 1;
			e[0] = (t * a[0] + n * a[1] + a[2]) / r, e[1] = (t * a[3] + n * a[4] + a[5]) / r;
		};
	}
}
var nv, rv = M((() => {
	nv = Math.log(2);
}));
//#endregion
//#region node_modules/zrender/lib/core/dom.js
function iv(e, t, n, r, i) {
	return ov(fv, t, r, i, !0) && ov(e, n, fv[0], fv[1]);
}
function av(e, t) {
	e && n(e), t && n(t);
	function n(e) {
		var t = e[dv];
		t && (t.clearMarkers && t.clearMarkers(), delete e[dv]);
	}
}
function ov(e, t, n, r, i) {
	if (t.getBoundingClientRect && J.domSupported && !lv(t)) {
		var a = t[dv] || (t[dv] = {}), o = cv(sv(t, a), a, i);
		if (o) return o(e, n, r), !0;
	}
	return !1;
}
function sv(e, t) {
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
		R(n, function(e) {
			e.parentNode && e.parentNode.removeChild(e);
		});
	}, n;
}
function cv(e, t, n) {
	for (var r = n ? "invTrans" : "trans", i = t[r], a = t.srcCoords, o = [], s = [], c = !0, l = 0; l < 4; l++) {
		var u = e[l].getBoundingClientRect(), d = 2 * l, f = u.left, p = u.top;
		o.push(f, p), c = c && a && f === a[d] && p === a[d + 1], s.push(e[l].offsetLeft, e[l].offsetTop);
	}
	return c && i ? i : (t.srcCoords = o, t[r] = n ? tv(s, o) : tv(o, s));
}
function lv(e) {
	return e.nodeName.toUpperCase() === "CANVAS";
}
function uv(e) {
	return e == null ? "" : (e + "").replace(pv, function(e, t) {
		return mv[t];
	});
}
var dv, fv, pv, mv, hv = M((() => {
	en(), rv(), q(), dv = "___zrEVENTSAVED", fv = [], pv = /([&<>"'])/g, mv = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&#39;"
	};
})), gv, _v = M((() => {
	gv = {
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
})), vv, yv = M((() => {
	vv = {
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
function bv(e, t) {
	e = e.toUpperCase(), Ov[e] = new Ah(t), Dv[e] = t;
}
function xv(e) {
	if (H(e)) {
		var t = Dv[e.toUpperCase()] || {};
		return e === wv || e === Tv ? I(t) : Qe(I(t), I(Dv[Ev]), !1);
	}
	return Qe(I(e), I(Dv[Ev]), !1);
}
function Sv(e) {
	return Ov[e];
}
function Cv() {
	return Ov[Ev];
}
var wv, Tv, Ev, Dv, Ov, kv, Av = M((() => {
	jh(), en(), _v(), yv(), q(), wv = "ZH", Tv = "EN", Ev = Tv, Dv = {}, Ov = {}, kv = J.domSupported ? function() {
		return (document.documentElement.lang || navigator.language || navigator.browserLanguage || Ev).toUpperCase().indexOf(wv) > -1 ? wv : Ev;
	}() : Ev, bv(Tv, gv), bv(wv, vv);
}));
//#endregion
//#region node_modules/echarts/lib/scale/break.js
function jv() {
	return Fv;
}
function Mv(e, t) {
	var n = jv(), r = t.breakOption, i = t.breakParsed;
	return !i && n && (i = n.parseAxisBreakOption(r, e)), i;
}
function Nv(e) {
	var t = e.brk;
	return t ? t.breaks : [];
}
function Pv(e) {
	var t = e.brk;
	return t ? t.hasBreaks() : !1;
}
var Fv, Iv = M((() => {
	Fv = null;
}));
//#endregion
//#region node_modules/echarts/lib/util/time.js
function Lv(e) {
	return !H(e) && !V(e) ? Rv(e) : e;
}
function Rv(e) {
	e ||= {};
	var t = {}, n = !0;
	return R(_y, function(t) {
		n &&= e[t] == null;
	}), R(_y, function(r, i) {
		var a = e[r];
		t[r] = {};
		for (var o = null, s = i; s >= 0; s--) {
			var c = _y[s], l = U(a) && !B(a) ? a[c] : a, u = void 0;
			B(l) ? (u = l.slice(), o = u[0] || "") : H(l) ? (o = l, u = [o]) : (o == null ? o = py[r] : fy[c].test(o) || (o = t[c][c][0] + " " + o), u = [o], n && (u[1] = "{primary|" + o + "}")), t[r][c] = u;
		}
	}), t;
}
function zv(e, t) {
	return e += "", "0000".substr(0, t - e.length) + e;
}
function Bv(e) {
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
function Vv(e) {
	return e === Bv(e);
}
function Hv(e) {
	switch (e) {
		case "year":
		case "month": return "day";
		case "millisecond": return "millisecond";
		default: return "second";
	}
}
function Uv(e, t, n, r) {
	var i = Xc(e), a = i[qv(n)](), o = i[Jv(n)]() + 1, s = Math.floor((o - 1) / 3) + 1, c = i[Yv(n)](), l = i["get" + (n ? "UTC" : "") + "Day"](), u = i[Xv(n)](), d = (u - 1) % 12 + 1, f = i[Zv(n)](), p = i[Qv(n)](), m = i[$v(n)](), h = u >= 12 ? "pm" : "am", g = h.toUpperCase(), _ = (r instanceof Ah ? r : Sv(r || kv) || Cv()).getModel("time"), v = _.get("month"), y = _.get("monthAbbr"), b = _.get("dayOfWeek"), x = _.get("dayOfWeekAbbr");
	return (t || "").replace(/{a}/g, h + "").replace(/{A}/g, g + "").replace(/{yyyy}/g, a + "").replace(/{yy}/g, zv(a % 100 + "", 2)).replace(/{Q}/g, s + "").replace(/{MMMM}/g, v[o - 1]).replace(/{MMM}/g, y[o - 1]).replace(/{MM}/g, zv(o, 2)).replace(/{M}/g, o + "").replace(/{dd}/g, zv(c, 2)).replace(/{d}/g, c + "").replace(/{eeee}/g, b[l]).replace(/{ee}/g, x[l]).replace(/{e}/g, l + "").replace(/{HH}/g, zv(u, 2)).replace(/{H}/g, u + "").replace(/{hh}/g, zv(d + "", 2)).replace(/{h}/g, d + "").replace(/{mm}/g, zv(f, 2)).replace(/{m}/g, f + "").replace(/{ss}/g, zv(p, 2)).replace(/{s}/g, p + "").replace(/{SSS}/g, zv(m, 3)).replace(/{S}/g, m + "");
}
function Wv(e, t, n, r, i) {
	var a = null;
	if (H(n)) a = n;
	else if (V(n)) {
		var o = {
			time: e.time,
			level: e.time ? e.time.level : 0
		}, s = jv();
		s && s.makeAxisLabelFormatterParamBreak(o, e.break), a = n(e.value, t, o);
	} else {
		var c = e.time;
		if (c) {
			var l = n[c.lowerTimeUnit][c.upperTimeUnit];
			a = l[Math.min(c.level, l.length - 1)] || "";
		} else {
			var u = Gv(e.value, i);
			a = n[u][u][0];
		}
	}
	return Uv(new Date(e.value), a, i, r);
}
function Gv(e, t) {
	var n = Xc(e), r = n[Jv(t)]() + 1, i = n[Yv(t)](), a = n[Xv(t)](), o = n[Zv(t)](), s = n[Qv(t)](), c = n[$v(t)]() === 0, l = c && s === 0, u = l && o === 0, d = u && a === 0, f = d && i === 1;
	return f && r === 1 ? "year" : f ? "month" : d ? "day" : u ? "hour" : l ? "minute" : c ? "second" : "millisecond";
}
function Kv(e, t, n) {
	switch (t) {
		case "year": e[ty(n)](0);
		case "month": e[ny(n)](1);
		case "day": e[ry(n)](0);
		case "hour": e[iy(n)](0);
		case "minute": e[ay(n)](0);
		case "second": e[oy(n)](0);
	}
	return e;
}
function qv(e) {
	return e ? "getUTCFullYear" : "getFullYear";
}
function Jv(e) {
	return e ? "getUTCMonth" : "getMonth";
}
function Yv(e) {
	return e ? "getUTCDate" : "getDate";
}
function Xv(e) {
	return e ? "getUTCHours" : "getHours";
}
function Zv(e) {
	return e ? "getUTCMinutes" : "getMinutes";
}
function Qv(e) {
	return e ? "getUTCSeconds" : "getSeconds";
}
function $v(e) {
	return e ? "getUTCMilliseconds" : "getMilliseconds";
}
function ey(e) {
	return e ? "setUTCFullYear" : "setFullYear";
}
function ty(e) {
	return e ? "setUTCMonth" : "setMonth";
}
function ny(e) {
	return e ? "setUTCDate" : "setDate";
}
function ry(e) {
	return e ? "setUTCHours" : "setHours";
}
function iy(e) {
	return e ? "setUTCMinutes" : "setMinutes";
}
function ay(e) {
	return e ? "setUTCSeconds" : "setSeconds";
}
function oy(e) {
	return e ? "setUTCMilliseconds" : "setMilliseconds";
}
var sy, cy, ly, uy, dy, fy, py, my, hy, gy, _y, vy, yy = M((() => {
	q(), Sl(), Av(), jh(), Iv(), sy = 1e3, cy = sy * 60, ly = cy * 60, uy = ly * 24, dy = uy * 365, fy = {
		year: /({yyyy}|{yy})/,
		month: /({MMMM}|{MMM}|{MM}|{M})/,
		day: /({dd}|{d})/,
		hour: /({HH}|{H}|{hh}|{h})/,
		minute: /({mm}|{m})/,
		second: /({ss}|{s})/,
		millisecond: /({SSS}|{S})/
	}, py = {
		year: "{yyyy}",
		month: "{MMM}",
		day: "{d}",
		hour: "{HH}:{mm}",
		minute: "{HH}:{mm}",
		second: "{HH}:{mm}:{ss}",
		millisecond: "{HH}:{mm}:{ss} {SSS}"
	}, my = "{yyyy}-{MM}-{dd} {HH}:{mm}:{ss} {SSS}", hy = "{yyyy}-{MM}-{dd}", gy = {
		year: "{yyyy}",
		month: "{yyyy}-{MM}",
		day: hy,
		hour: hy + " " + py.hour,
		minute: hy + " " + py.minute,
		second: hy + " " + py.second,
		millisecond: my
	}, _y = [
		"year",
		"month",
		"day",
		"hour",
		"minute",
		"second",
		"millisecond"
	], vy = [
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
function by(e) {
	if (!tl(e)) return H(e) ? e : "-";
	var t = (e + "").split(".");
	return t[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, "$1,") + (t.length > 1 ? "." + t[1] : "");
}
function xy(e, t) {
	return e = (e || "").toLowerCase().replace(/-(.)/g, function(e, t) {
		return t.toUpperCase();
	}), t && e && (e = e.charAt(0).toUpperCase() + e.slice(1)), e;
}
function Sy(e, t, n) {
	var r = "{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}";
	function i(e) {
		return e && wt(e) ? e : "-";
	}
	function a(e) {
		return al(e);
	}
	var o = t === "time", s = e instanceof Date;
	if (o || s) {
		var c = o ? Xc(e) : e;
		if (!isNaN(+c)) return Uv(c, r, n);
		if (s) return "-";
	}
	if (t === "ordinal") return dt(e) ? i(e) : ft(e) && a(e) ? e + "" : "-";
	var l = el(e);
	return a(l) ? by(l) : dt(e) ? i(e) : typeof e == "boolean" ? e + "" : "-";
}
function Cy(e, t, n) {
	B(t) || (t = [t]);
	var r = t.length;
	if (!r) return "";
	for (var i = t[0].$vars || [], a = 0; a < i.length; a++) {
		var o = Dy[a];
		e = e.replace(Oy(o), Oy(o, 0));
	}
	for (var s = 0; s < r; s++) for (var c = 0; c < i.length; c++) {
		var l = t[s][i[c]];
		e = e.replace(Oy(Dy[c], s), n ? uv(l) : l);
	}
	return e;
}
function wy(e, t) {
	var n = H(e) ? {
		color: e,
		extraCssText: t
	} : e || {}, r = n.color, i = n.type;
	t = n.extraCssText;
	var a = n.renderMode || "html";
	return r ? a === "html" ? i === "subItem" ? "<span style=\"display:inline-block;vertical-align:middle;margin-right:8px;margin-left:3px;border-radius:4px;width:4px;height:4px;background-color:" + uv(r) + ";" + (t || "") + "\"></span>" : "<span style=\"display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:" + uv(r) + ";" + (t || "") + "\"></span>" : {
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
function Ty(e, t) {
	return t ||= "transparent", H(e) ? e : U(e) && e.colorStops && (e.colorStops[0] || {}).color || t;
}
var Ey, Dy, Oy, ky = M((() => {
	q(), hv(), Sl(), yy(), fi(), $m(), Ey = Ct, Dy = [
		"a",
		"b",
		"c",
		"d",
		"e",
		"f",
		"g"
	], Oy = function(e, t) {
		return "{" + e + (t ?? "") + "}";
	};
}));
//#endregion
//#region node_modules/echarts/lib/util/layout.js
function Ay(e, t, n, r, i) {
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
function jy(e, t) {
	return {
		left: e.getShallow("left", t),
		top: e.getShallow("top", t),
		right: e.getShallow("right", t),
		bottom: e.getShallow("bottom", t),
		width: e.getShallow("width", t),
		height: e.getShallow("height", t)
	};
}
function My(e, t, n) {
	n = Ey(n || 0);
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
function Ny(e, t, n) {
	var r, i, a, o = e.boxCoordinateSystem, s;
	if (o) {
		var c = w_(e), l = c.coord, u = c.from;
		if (o.dataToLayout) {
			a = Hy.rect, s = u;
			var d = o.dataToLayout(l);
			r = d.contentRect || d.rect;
		} else n && n.enableLayoutOnlyByCenter && o.dataToPoint ? (a = Hy.point, s = u, i = o.dataToPoint(l)) : process.env.NODE_ENV !== "production" && El(e.type + "[" + e.componentIndex + "]" + (" layout based on " + o.type + " is not supported."));
	}
	return a ??= Hy.rect, a === Hy.rect && (r ||= {
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
function Py(e) {
	var t = e.layoutMode || e.constructor.layoutMode;
	return U(t) ? t : t ? { type: t } : null;
}
function Fy(e, t, n) {
	var r = n && n.ignoreSize;
	!B(r) && (r = [r, r]);
	var i = o(By[0], 0), a = o(By[1], 1);
	c(By[0], e, i), c(By[1], e, a);
	function o(n, i) {
		var a = {}, o = 0, c = {}, l = 0, u = 2;
		if (Ry(n, function(t) {
			c[t] = e[t];
		}), Ry(n, function(e) {
			jt(t, e) && (a[e] = c[e] = t[e]), s(a, e) && o++, s(c, e) && l++;
		}), r[i]) return s(t, n[1]) ? c[n[2]] = null : s(t, n[2]) && (c[n[1]] = null), c;
		if (l === u || !o) return c;
		if (o >= u) return a;
		for (var d = 0; d < n.length; d++) {
			var f = n[d];
			if (!jt(a, f) && jt(e, f)) {
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
		Ry(e, function(e) {
			t[e] = n[e];
		});
	}
}
function Iy(e) {
	return Ly({}, e);
}
function Ly(e, t) {
	return t && e && Ry(zy, function(n) {
		jt(t, n) && (e[n] = t[n]);
	}), e;
}
var Ry, zy, By, Vy, Hy, Uy = M((() => {
	q(), Or(), Sl(), ky(), Pl(), j_(), Ry = R, zy = [
		"left",
		"right",
		"top",
		"bottom",
		"width",
		"height"
	], By = [[
		"width",
		"left",
		"right"
	], [
		"height",
		"top",
		"bottom"
	]], Vy = Ay, ut(Ay, "vertical"), ut(Ay, "horizontal"), Hy = {
		rect: 1,
		point: 2
	};
}));
//#endregion
//#region node_modules/echarts/lib/model/Component.js
function Wy(e) {
	var t = [];
	return R(Ky.getClassesByMainType(e), function(e) {
		t = t.concat(e.dependencies || e.prototype.dependencies || []);
	}), t = z(t, function(e) {
		return tn(e).main;
	}), e !== "dataset" && tt(t, "dataset") <= 0 && t.unshift("dataset"), t;
}
var Gy, Ky, qy = M((() => {
	F(), q(), jh(), $_(), gn(), Z(), Uy(), Gy = ru(), Ky = function(e) {
		P(t, e);
		function t(t, n, r) {
			var i = e.call(this, t, n, r) || this;
			return i.uid = J_("ec_cpt_model"), i;
		}
		return t.prototype.init = function(e, t, n) {
			this.mergeDefaultAndTheme(e, n);
		}, t.prototype.mergeDefaultAndTheme = function(e, t) {
			var n = Py(this), r = n ? Iy(e) : {};
			Qe(e, t.getTheme().get(this.mainType)), Qe(e, this.getDefaultOption()), n && Fy(e, r, n);
		}, t.prototype.mergeOption = function(e, t) {
			Qe(this.option, e, !0);
			var n = Py(this);
			n && Fy(this.option, e, n);
		}, t.prototype.optionUpdated = function(e, t) {}, t.prototype.getDefaultOption = function() {
			var e = this.constructor;
			if (!rn(e)) return e.defaultOption;
			var t = Gy(this);
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
			return ou(this.ecModel, e, {
				index: this.get(n, !0),
				id: this.get(r, !0)
			}, t);
		}, t.prototype.getBoxLayoutParams = function() {
			return jy(this, !1);
		}, t.prototype.getZLevelKey = function() {
			return "";
		}, t.prototype.setZLevel = function(e) {
			this.option.zlevel = e;
		}, t.protoInitialize = function() {
			var e = t.prototype;
			e.type = "component", e.id = "", e.name = "", e.mainType = "", e.subType = "", e.componentIndex = 0;
		}(), t;
	}(Ah), sn(Ky, Ah), dn(Ky), Y_(Ky), X_(Ky, Wy);
}));
//#endregion
//#region node_modules/echarts/lib/model/mixin/palette.js
function Jy(e, t) {
	for (var n = e.length, r = 0; r < n; r++) if (e[r].length > t) return e[r];
	return e[n - 1];
}
function Yy(e, t, n, r, i, a, o) {
	a ||= e;
	var s = t(a), c = s.paletteIdx || 0, l = s.paletteNameMap = s.paletteNameMap || {};
	if (l.hasOwnProperty(i)) return l[i];
	var u = o == null || !r ? n : Jy(r, o);
	if (u ||= n, u && u.length) {
		var d = u[c];
		return i && (l[i] = d), s.paletteIdx = (c + 1) % u.length, d;
	}
}
function Xy(e, t) {
	t(e).paletteIdx = 0, t(e).paletteNameMap = {};
}
var Zy, Qy, $y = M((() => {
	Z(), Zy = ru(), ru(), Qy = function() {
		function e() {}
		return e.prototype.getColorFromPalette = function(e, t, n) {
			var r = Il(this.get("color", !0)), i = this.get("colorLayer", !0);
			return Yy(this, Zy, r, i, e, t, n);
		}, e.prototype.clearColorPalette = function() {
			Xy(this, Zy);
		}, e;
	}();
}));
//#endregion
//#region node_modules/echarts/lib/model/mixin/dataFormat.js
function eb(e) {
	var t, n;
	return U(e) ? e.type ? n = e : process.env.NODE_ENV !== "production" && console.warn("The return type of `formatTooltip` is not supported: " + kl(e)) : t = e, {
		text: t,
		frag: n
	};
}
var tb, nb, rb = M((() => {
	q(), Cg(), ky(), Pl(), tb = /\{@(.+?)\}/g, nb = function() {
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
			if (a && (s.value = a.interpolatedValue), r != null && B(s.value) && (s.value = s.value[r]), i ||= o.getItemModel(e).get(t === "normal" ? ["label", "formatter"] : [
				t,
				"label",
				"formatter"
			]), V(i)) return s.status = t, s.dimensionIndex = r, i(s);
			if (H(i)) return Cy(i, s).replace(tb, function(t, n) {
				var r = n.length, i = n;
				i.charAt(0) === "[" && i.charAt(r - 1) === "]" && (i = +i.slice(1, r - 1), process.env.NODE_ENV !== "production" && isNaN(i) && El("Invalide label formatter: @" + n + ", only support @[0], @[1], @[2], ..."));
				var s = sg(o, e, i);
				if (a && B(a.interpolatedValue)) {
					var c = o.getDimensionIndex(i);
					c >= 0 && (s = a.interpolatedValue[c]);
				}
				return s == null ? "" : s + "";
			});
		}, e.prototype.getRawValue = function(e, t) {
			return sg(this.getData(t), e);
		}, e.prototype.formatTooltip = function(e, t, n) {}, e;
	}();
}));
//#endregion
//#region node_modules/echarts/lib/core/task.js
function ib(e) {
	return new ab(e);
}
var ab, ob, sb = M((() => {
	q(), ab = function() {
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
			if (t ? (process.env.NODE_ENV !== "production" && G(t._outputDueEnd != null), this._dueEnd = t._outputDueEnd) : (process.env.NODE_ENV !== "production" && G(!this._progress || this._count), this._dueEnd = this._count ? this._count(this.context) : Infinity), this._progress) {
				var f = this._dueIndex, p = Math.min(d == null ? Infinity : this._dueIndex + d, this._dueEnd);
				if (!n && (u || f < p)) {
					var m = this._progress;
					if (B(m)) for (var h = 0; h < m.length; h++) this._doProgress(m[h], f, p, s, c);
					else this._doProgress(m, f, p, s, c);
				}
				this._dueIndex = p;
				var g = this._settedOutputEnd == null ? p : this._settedOutputEnd;
				process.env.NODE_ENV !== "production" && G(g >= this._outputDueEnd), this._outputDueEnd = g;
			} else this._dueIndex = this._outputDueEnd = this._settedOutputEnd == null ? this._dueEnd : this._settedOutputEnd;
			return this.unfinished();
		}, e.prototype.dirty = function() {
			this._dirty = !0, this._onDirty && this._onDirty(this.context);
		}, e.prototype._doProgress = function(e, t, n, r, i) {
			ob.reset(t, n, r, i), this._callingProgress = e, this._callingProgress({
				start: t,
				end: n,
				count: n - t,
				next: ob.next
			}, this.context);
		}, e.prototype._doReset = function(e) {
			this._dueIndex = this._outputDueEnd = this._dueEnd = 0, this._settedOutputEnd = null;
			var t, n;
			!e && this._reset && (t = this._reset(this.context), t && t.progress && (n = t.forceFirstProgress, t = t.progress), B(t) && !t.length && (t = null)), this._progress = t, this._modBy = this._modDataCount = null;
			var r = this._downstream;
			return r && r.dirty(), n;
		}, e.prototype.unfinished = function() {
			return this._progress && this._dueIndex < this._dueEnd;
		}, e.prototype.pipe = function(e) {
			process.env.NODE_ENV !== "production" && G(e && !e._disposed && e !== this), (this._downstream !== e || this._dirty) && (this._downstream = e, e._upstream = this, e.dirty());
		}, e.prototype.dispose = function() {
			this._disposed ||= (this._upstream && (this._upstream._downstream = null), this._downstream && (this._downstream._upstream = null), this._dirty = !1, !0);
		}, e.prototype.getUpstream = function() {
			return this._upstream;
		}, e.prototype.getDownstream = function() {
			return this._downstream;
		}, e.prototype.setOutputEnd = function(e) {
			this._outputDueEnd = this._settedOutputEnd = e;
		}, e;
	}(), ob = function() {
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
function cb(e, t) {
	var n = new _b(), r = e.data, i = n.sourceFormat = e.sourceFormat, a = e.startIndex, o = "";
	e.seriesLayoutBy !== "column" && (process.env.NODE_ENV !== "production" && (o = "`seriesLayoutBy` of upstream dataset can only be \"column\" in data transform."), Al(o));
	var s = [], c = {}, l = e.dimensionsDefine;
	if (l) R(l, function(e, t) {
		var n = e.name, r = {
			index: t,
			name: n,
			displayName: e.displayName
		};
		if (s.push(r), n != null) {
			var i = "";
			jt(c, n) && (process.env.NODE_ENV !== "production" && (i = "dimension name \"" + n + "\" duplicated."), Al(i)), c[n] = r;
		}
	});
	else for (var u = 0; u < e.dimensionsDetectedCount; u++) s.push({ index: u });
	var d = rg(i, Uu);
	t.__isBuiltIn && (n.getRawDataItem = function(e) {
		return d(r, a, s, e);
	}, n.getRawData = Kt(lb, null, e)), n.cloneRawData = Kt(ub, null, e);
	var f = ig(i, Uu);
	n.count = Kt(f, null, r, a, s);
	var p = ag(i);
	n.retrieveValue = function(e, t) {
		return m(d(r, a, s, e), t);
	};
	var m = n.retrieveValueFromItem = function(e, t) {
		if (e != null) {
			var n = s[t];
			if (n) return p(e, t, n.name);
		}
	};
	return n.getDimensionInfo = Kt(db, null, s, c), n.cloneAllDimensionInfo = Kt(fb, null, s), n;
}
function lb(e) {
	var t = e.sourceFormat;
	if (!gb(t)) {
		var n = "";
		process.env.NODE_ENV !== "production" && (n = "`getRawData` is not supported in source format " + t), Al(n);
	}
	return e.data;
}
function ub(e) {
	var t = e.sourceFormat, n = e.data;
	if (!gb(t)) {
		var r = "";
		process.env.NODE_ENV !== "production" && (r = "`cloneRawData` is not supported in source format " + t), Al(r);
	}
	if (t === "arrayRows") {
		for (var i = [], a = 0, o = n.length; a < o; a++) i.push(n[a].slice());
		return i;
	}
	if (t === "objectRows") {
		for (var i = [], a = 0, o = n.length; a < o; a++) i.push(L({}, n[a]));
		return i;
	}
}
function db(e, t, n) {
	if (n != null) {
		if (ft(n) || !isNaN(n) && !jt(t, n)) return e[n];
		if (jt(t, n)) return t[n];
	}
}
function fb(e) {
	return I(e);
}
function pb(e) {
	e = I(e);
	var t = e.type, n = "";
	t || (process.env.NODE_ENV !== "production" && (n = "Must have a `type` when `registerTransform`."), Al(n));
	var r = t.split(":");
	r.length !== 2 && (process.env.NODE_ENV !== "production" && (n = "Name must include namespace like \"ns:regression\"."), Al(n));
	var i = !1;
	r[0] === "echarts" && (t = r[1], i = !0), e.__isBuiltIn = i, vb.set(t, e);
}
function mb(e, t, n) {
	var r = Il(e), i = r.length, a = "";
	i || (process.env.NODE_ENV !== "production" && (a = "If `transform` declared, it should at least contain one transform."), Al(a));
	for (var o = 0, s = i; o < s; o++) {
		var c = r[o];
		t = hb(c, t, n, i === 1 ? null : o), o !== s - 1 && (t.length = Math.max(t.length, 1));
	}
	return t;
}
function hb(e, t, n, r) {
	var i = "";
	t.length || (process.env.NODE_ENV !== "production" && (i = "Must have at least one upstream dataset."), Al(i)), U(e) || (process.env.NODE_ENV !== "production" && (i = "transform declaration must be an object rather than " + typeof e + "."), Al(i));
	var a = e.type, o = vb.get(a);
	o || (process.env.NODE_ENV !== "production" && (i = "Can not find transform on type \"" + a + "\"."), Al(i));
	var s = z(t, function(e) {
		return cb(e, o);
	}), c = Il(o.transform({
		upstream: s[0],
		upstreamList: s,
		config: I(e.config)
	}));
	return process.env.NODE_ENV !== "production" && e.print && wl(z(c, function(e) {
		var t = r == null ? "" : " === pipe index: " + r;
		return [
			"=== dataset index: " + n.datasetIndex + t + " ===",
			"- transform result data:",
			kl(e.data),
			"- transform result dimensions:",
			kl(e.dimensions)
		].join("\n");
	}).join("\n")), z(c, function(e, n) {
		var r = "";
		U(e) || (process.env.NODE_ENV !== "production" && (r = "A transform should not return some empty results."), Al(r)), e.data || (process.env.NODE_ENV !== "production" && (r = "Transform result data should be not be null or undefined"), Al(r)), gb(Yh(e.data)) || (process.env.NODE_ENV !== "production" && (r = "Transform result data should be array rows or object rows."), Al(r));
		var i, a = t[0];
		if (a && n === 0 && !e.dimensions) {
			var o = a.startIndex;
			o && (e.data = a.data.slice(0, o).concat(e.data)), i = {
				seriesLayoutBy: Uu,
				sourceHeader: o,
				dimensions: a.metaRawOption.dimensions
			};
		} else i = {
			seriesLayoutBy: Uu,
			sourceHeader: 0,
			dimensions: e.dimensions
		};
		return Kh(e.data, i, null);
	});
}
function gb(e) {
	return e === "arrayRows" || e === "objectRows";
}
var _b, vb, yb = M((() => {
	Wu(), Z(), q(), Cg(), Lg(), Pl(), ng(), _b = function() {
		function e() {}
		return e.prototype.getRawData = function() {
			throw Error("not supported");
		}, e.prototype.getRawDataItem = function(e) {
			throw Error("not supported");
		}, e.prototype.cloneRawData = function() {}, e.prototype.getDimensionInfo = function(e) {}, e.prototype.cloneAllDimensionInfo = function() {}, e.prototype.count = function() {}, e.prototype.retrieveValue = function(e, t) {}, e.prototype.retrieveValueFromItem = function(e, t) {}, e.prototype.convertValue = function(e, t) {
			return Mg(e, t);
		}, e;
	}(), vb = K();
}));
//#endregion
//#region node_modules/echarts/lib/data/helper/sourceManager.js
function bb(e) {
	return e.mainType === "series";
}
function xb(e) {
	throw Error(e);
}
var Sb, Cb = M((() => {
	q(), ng(), Wu(), Wh(), yb(), Jg(), Cg(), Sb = function() {
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
			if (bb(e)) {
				var a = e, o = void 0, s = void 0, c = void 0;
				if (n) {
					var l = t[0];
					l.prepareSource(), c = l.getSource(), o = c.data, s = c.sourceFormat, i = [l._getVersionSign()];
				} else o = a.get("data", !0), s = mt(o) ? Vu : Lu, i = [];
				var u = this._getSourceMetaRawOption() || {}, d = c && c.metaRawOption || {}, f = W(u.seriesLayoutBy, d.seriesLayoutBy) || null, p = W(u.sourceHeader, d.sourceHeader), m = W(u.dimensions, d.dimensions);
				r = f !== d.seriesLayoutBy || !!p != !!d.sourceHeader || m ? [Kh(o, {
					seriesLayoutBy: f,
					sourceHeader: p,
					dimensions: m
				}, s)] : [];
			} else {
				var h = e;
				if (n) {
					var g = this._applyTransform(t);
					r = g.sourceList, i = g.upstreamSignList;
				} else r = [Kh(h.get("source", !0), this._getSourceMetaRawOption(), null)], i = [];
			}
			process.env.NODE_ENV !== "production" && G(r && i), this._setLocalSource(r, i);
		}, e.prototype._applyTransform = function(e) {
			var t = this._sourceHost, n = t.get("transform", !0), r = t.get("fromTransformResult", !0);
			if (process.env.NODE_ENV !== "production" && G(r != null || n != null), r != null) {
				var i = "";
				e.length !== 1 && (process.env.NODE_ENV !== "production" && (i = "When using `fromTransformResult`, there should be only one upstream dataset"), xb(i));
			}
			var a, o = [], s = [];
			return R(e, function(e) {
				e.prepareSource();
				var t = e.getSource(r || 0), n = "";
				r != null && !t && (process.env.NODE_ENV !== "production" && (n = "Can not retrieve result by `fromTransformResult`: " + r), xb(n)), o.push(t), s.push(e._getVersionSign());
			}), n ? a = mb(n, o, { datasetIndex: t.componentIndex }) : r != null && (a = [Jh(o[0])]), {
				sourceList: a,
				upstreamSignList: s
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
			process.env.NODE_ENV !== "production" && G(bb(this._sourceHost), "Can only call getDataStore on series source manager.");
			var t = e.makeStoreSchema();
			return this._innerGetDataStore(t.dimensions, e.source, t.hash);
		}, e.prototype._innerGetDataStore = function(e, t, n) {
			var r = 0, i = this._storeList, a = i[r];
			a ||= i[r] = {};
			var o = a[n];
			if (!o) {
				var s = this._getUpstreamSourceManagers()[0];
				bb(this._sourceHost) && s ? o = s._innerGetDataStore(e, t, n) : (o = new qg(), o.initData(new mg(t, e.length), e)), a[n] = o;
			}
			return o;
		}, e.prototype._getUpstreamSourceManagers = function() {
			var e = this._sourceHost;
			if (bb(e)) {
				var t = Rh(e);
				return t ? [t.getSourceManager()] : [];
			}
			return z(zh(e), function(e) {
				return e.getSourceManager();
			});
		}, e.prototype._getSourceMetaRawOption = function() {
			var e = this._sourceHost, t, n, r;
			if (bb(e)) t = e.get("seriesLayoutBy", !0), n = e.get("sourceHeader", !0), r = e.get("dimensions", !0);
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
})), Q, wb, Tb, Eb = M((() => {
	for (var e in q(), Da(), Q = {
		color: {},
		darkColor: {},
		size: {}
	}, wb = Q.color = {
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
	}, L(wb, {
		primary: wb.neutral80,
		secondary: wb.neutral70,
		tertiary: wb.neutral60,
		quaternary: wb.neutral50,
		disabled: wb.neutral20,
		border: wb.neutral30,
		borderTint: wb.neutral20,
		borderShade: wb.neutral40,
		background: wb.neutral05,
		backgroundTint: "rgba(234,237,245,0.5)",
		backgroundTransparent: "rgba(255,255,255,0)",
		backgroundShade: wb.neutral10,
		shadow: "rgba(0,0,0,0.2)",
		shadowTint: "rgba(129,130,136,0.2)",
		axisLine: wb.neutral70,
		axisLineTint: wb.neutral40,
		axisTick: wb.neutral70,
		axisTickMinor: wb.neutral60,
		axisLabel: wb.neutral70,
		axisSplitLine: wb.neutral15,
		axisMinorSplitLine: wb.neutral05
	}), wb) wb.hasOwnProperty(e) && (Tb = wb[e], e === "theme" ? Q.darkColor.theme = wb.theme.slice() : e === "highlight" ? Q.darkColor.highlight = "rgba(255,231,130,0.4)" : e.indexOf("accent") === 0 ? Q.darkColor[e] = ya(Tb, null, function(e) {
		return e * .5;
	}, function(e) {
		return Math.min(1, 1.3 - e);
	}) : Q.darkColor[e] = ya(Tb, null, function(e) {
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
function Db(e) {
	var t = e.lineHeight;
	return t == null ? Wb : "line-height:" + uv(t + "") + "px";
}
function Ob(e, t) {
	var n = e.color || Q.color.tertiary, r = e.fontSize || 12, i = e.fontWeight || "400", a = e.color || Q.color.secondary, o = e.fontSize || 14, s = e.fontWeight || "900";
	return t === "html" ? {
		nameStyle: "font-size:" + uv(r + "") + "px;color:" + uv(n) + ";font-weight:" + uv(i + ""),
		valueStyle: "font-size:" + uv(o + "") + "px;color:" + uv(a) + ";font-weight:" + uv(s + "")
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
function kb(e, t) {
	return t.type = e, t;
}
function Ab(e) {
	return e.type === "section";
}
function jb(e) {
	return Ab(e) ? Nb : Pb;
}
function Mb(e) {
	if (Ab(e)) {
		var t = 0, n = e.blocks.length, r = n > 1 || n > 0 && !e.noHeader;
		return R(e.blocks, function(e) {
			var n = Mb(e);
			n >= t && (t = n + +(r && (!n || Ab(e) && !e.noHeader)));
		}), t;
	}
	return 0;
}
function Nb(e, t, n, r) {
	var i = t.noHeader, a = Ib(Mb(t)), o = [], s = t.blocks || [];
	G(!s || B(s)), s ||= [];
	var c = e.orderMode;
	if (t.sortBlocks && c) {
		s = s.slice();
		var l = {
			valueAsc: "asc",
			valueDesc: "desc"
		};
		if (jt(l, c)) {
			var u = new Ig(l[c], null);
			s.sort(function(e, t) {
				return u.evaluate(e.sortParam, t.sortParam);
			});
		} else c === "seriesDesc" && s.reverse();
	}
	R(s, function(n, i) {
		var s = t.valueFormatter, c = jb(n)(s ? L(L({}, e), { valueFormatter: s }) : e, n, i > 0 ? a.html : 0, r);
		c != null && o.push(c);
	});
	var d = e.renderMode === "richText" ? o.join(a.richText) : Lb(r, o.join(""), i ? n : a.html);
	if (i) return d;
	var f = Sy(t.header, "ordinal", e.useUTC), p = Ob(r, e.renderMode).nameStyle, m = Db(r);
	return e.renderMode === "richText" ? Bb(e, f, p) + a.richText + d : Lb(r, "<div style=\"" + p + ";" + m + ";\">" + uv(f) + "</div>" + d, n);
}
function Pb(e, t, n, r) {
	var i = e.renderMode, a = t.noName, o = t.noValue, s = !t.markerType, c = t.name, l = e.useUTC, u = t.valueFormatter || e.valueFormatter || function(e) {
		return e = B(e) ? e : [e], z(e, function(e, t) {
			return Sy(e, B(p) ? p[t] : p, l);
		});
	};
	if (!(a && o)) {
		var d = s ? "" : e.markupStyleCreator.makeTooltipMarker(t.markerType, t.markerColor || Q.color.secondary, i), f = a ? "" : Sy(c, "ordinal", l), p = t.valueType, m = o ? [] : u(t.value, t.rawDataIndex), h = !s || !a, g = !s && a, _ = Ob(r, i), v = _.nameStyle, y = _.valueStyle;
		return i === "richText" ? (s ? "" : d) + (a ? "" : Bb(e, f, v)) + (o ? "" : Vb(e, m, h, g, y)) : Lb(r, (s ? "" : d) + (a ? "" : Rb(f, !s, v)) + (o ? "" : zb(m, h, g, y)), n);
	}
}
function Fb(e, t, n, r, i, a) {
	if (e) return jb(e)({
		useUTC: i,
		renderMode: n,
		orderMode: r,
		markupStyleCreator: t,
		valueFormatter: e.valueFormatter
	}, e, 0, a);
}
function Ib(e) {
	return {
		html: Gb[e],
		richText: Kb[e]
	};
}
function Lb(e, t, n) {
	var r = "<div style=\"clear:both\"></div>", i = "margin: " + n + "px 0 0", a = Db(e);
	return "<div style=\"" + i + ";" + a + ";\">" + t + r + "</div>";
}
function Rb(e, t, n) {
	var r = t ? "margin-left:2px" : "";
	return "<span style=\"" + n + ";" + r + "\">" + uv(e) + "</span>";
}
function zb(e, t, n, r) {
	var i = t ? "float:right;margin-left:" + (n ? "10px" : "20px") : "";
	return e = B(e) ? e : [e], "<span style=\"" + i + ";" + r + "\">" + z(e, function(e) {
		return uv(e);
	}).join("&nbsp;&nbsp;") + "</span>";
}
function Bb(e, t, n) {
	return e.markupStyleCreator.wrapRichTextStyle(t, n);
}
function Vb(e, t, n, r, i) {
	var a = [i], o = r ? 10 : 20;
	return n && a.push({
		padding: [
			0,
			0,
			0,
			o
		],
		align: "right"
	}), e.markupStyleCreator.wrapRichTextStyle(B(t) ? t.join("  ") : t, a);
}
function Hb(e, t) {
	var n = e.getData().getItemVisual(t, "style")[e.visualDrawType];
	return Ty(n);
}
function Ub(e, t) {
	return e.get("padding") ?? (t === "richText" ? [8, 10] : 10);
}
var Wb, Gb, Kb, qb, Jb = M((() => {
	ky(), q(), Lg(), Sl(), Eb(), Wb = "line-height:1", Gb = [
		0,
		10,
		20,
		30
	], Kb = [
		"",
		"\n",
		"\n\n",
		"\n\n\n"
	], qb = function() {
		function e() {
			this.richTextStyles = {}, this._nextStyleNameId = nl();
		}
		return e.prototype._generateStyleName = function() {
			return "__EC_aUTo_" + this._nextStyleNameId++;
		}, e.prototype.makeTooltipMarker = function(e, t, n) {
			var r = n === "richText" ? this._generateStyleName() : null, i = wy({
				color: t,
				type: e,
				renderMode: n,
				markerId: r
			});
			return H(i) ? i : (process.env.NODE_ENV !== "production" && G(r), this.richTextStyles[r] = i.style, i.content);
		}, e.prototype.wrapRichTextStyle = function(e, t) {
			var n = {};
			B(t) ? R(t, function(e) {
				return L(n, e);
			}) : L(n, t);
			var r = this._generateStyleName();
			return this.richTextStyles[r] = n, "{" + r + "|" + e + "}";
		}, e;
	}();
}));
//#endregion
//#region node_modules/echarts/lib/component/tooltip/seriesFormatTooltip.js
function Yb(e) {
	var t = e.series, n = e.dataIndex, r = e.multipleSeries, i = t.getData(), a = i.mapDimensionsAll("defaultedTooltip"), o = a.length, s = t.getRawValue(n), c = B(s), l = Hb(t, n), u, d, f, p;
	if (o > 1 || c && !o) {
		var m = Xb(s, t, n, a, l);
		u = m.inlineValues, d = m.inlineValueTypes, f = m.blocks, p = m.inlineValues[0];
	} else if (o) {
		var h = i.getDimensionInfo(a[0]);
		p = u = sg(i, n, a[0]), d = h.type;
	} else p = u = c ? s[0] : s;
	var g = Ql(t), _ = g && t.name || "", v = i.getName(n), y = r ? _ : v;
	return kb("section", {
		header: _,
		noHeader: r || !g,
		sortParam: p,
		blocks: [kb("nameValue", {
			markerType: "item",
			markerColor: l,
			name: y,
			noName: !wt(y),
			value: u,
			valueType: d,
			rawDataIndex: i.getRawIndex(n)
		})].concat(f || [])
	});
}
function Xb(e, t, n, r, i) {
	var a = t.getData(), o = at(e, function(e, t, n) {
		var r = a.getDimensionInfo(n);
		return e ||= r && r.tooltip !== !1 && r.displayName != null;
	}, !1), s = [], c = [], l = [];
	r.length ? R(r, function(e) {
		u(sg(a, n, e), e);
	}) : R(e, u);
	function u(e, t) {
		var n = a.getDimensionInfo(t);
		n && n.otherDims.tooltip !== !1 && (o ? l.push(kb("nameValue", {
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
var Zb = M((() => {
	q(), Jb(), Cg(), Z();
}));
//#endregion
//#region node_modules/echarts/lib/model/Series.js
function Qb(e, t) {
	return e.getName(t) || e.getId(t);
}
function $b(e) {
	var t = e.name;
	Ql(e) || (e.name = ex(e) || t);
}
function ex(e) {
	var t = e.getRawData(), n = t.mapDimensionsAll("seriesName"), r = [];
	return R(n, function(e) {
		var n = t.getDimensionInfo(e);
		n.displayName && r.push(n.displayName);
	}), r.join(" ");
}
function tx(e) {
	return e.model.getRawData().count();
}
function nx(e) {
	var t = e.model;
	return t.setData(t.getRawData().cloneShallow()), rx;
}
function rx(e, t) {
	t.outputData && e.end > t.outputData.count() && t.model.getRawData().cloneShallow(t.outputData);
}
function ix(e, t) {
	R(Ot(e.CHANGABLE_METHODS, e.DOWNSAMPLE_METHODS), function(n) {
		e.wrapMethod(n, ut(ax, t));
	});
}
function ax(e, t) {
	var n = ox(e);
	return n && n.setOutputEnd((t || this).count()), t;
}
function ox(e) {
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
var sx, cx, lx = M((() => {
	F(), q(), en(), Z(), qy(), $y(), rb(), Uy(), sb(), gn(), Cb(), Zb(), sx = ru(), cx = function(e) {
		P(t, e);
		function t() {
			var t = e !== null && e.apply(this, arguments) || this;
			return t._selectedDataIndicesMap = {}, t;
		}
		return t.prototype.init = function(e, t, n) {
			this.seriesIndex = this.componentIndex, this.dataTask = ib({
				count: tx,
				reset: nx
			}), this.dataTask.context = { model: this }, this.mergeDefaultAndTheme(e, n), (sx(this).sourceManager = new Sb(this)).prepareSource();
			var r = this.getInitialData(e, n);
			ix(r, this), this.dataTask.context.data = r, process.env.NODE_ENV !== "production" && G(r, "getInitialData returned invalid data."), sx(this).dataBeforeProcessed = r, $b(this), this._initSelectedMapFromData(r);
		}, t.prototype.mergeDefaultAndTheme = function(e, t) {
			var n = Py(this), r = n ? Iy(e) : {}, i = this.subType;
			Ky.hasClass(i) && (i += "Series"), Qe(e, t.getTheme().get(this.subType)), Qe(e, this.getDefaultOption()), Ll(e, "label", ["show"]), this.fillDataTextStyle(e.data), n && Fy(e, r, n);
		}, t.prototype.mergeOption = function(e, t) {
			e = Qe(this.option, e, !0), this.fillDataTextStyle(e.data);
			var n = Py(this);
			n && Fy(this.option, e, n);
			var r = sx(this).sourceManager;
			r.dirty(), r.prepareSource();
			var i = this.getInitialData(e, t);
			ix(i, this), this.dataTask.dirty(), this.dataTask.context.data = i, sx(this).dataBeforeProcessed = i, $b(this), this._initSelectedMapFromData(i);
		}, t.prototype.fillDataTextStyle = function(e) {
			if (e && !mt(e)) for (var t = ["show"], n = 0; n < e.length; n++) e[n] && e[n].label && Ll(e[n], "label", t);
		}, t.prototype.getInitialData = function(e, t) {}, t.prototype.appendData = function(e) {
			this.getRawData().appendData(e.data);
		}, t.prototype.getData = function(e) {
			var t = ox(this);
			if (t) {
				var n = t.context.data;
				return e == null || !n.getLinkedData ? n : n.getLinkedData(e);
			}
			return sx(this).data;
		}, t.prototype.getAllData = function() {
			var e = this.getData();
			return e && e.getLinkedDataAll ? e.getLinkedDataAll() : [{ data: e }];
		}, t.prototype.setData = function(e) {
			var t = ox(this);
			if (t) {
				var n = t.context;
				n.outputData = e, t !== this.dataTask && (n.data = e);
			}
			sx(this).data = e;
		}, t.prototype.getEncode = function() {
			var e = this.get("encode", !0);
			if (e) return K(e);
		}, t.prototype.getSourceManager = function() {
			return sx(this).sourceManager;
		}, t.prototype.getSource = function() {
			return this.getSourceManager().getSource();
		}, t.prototype.getRawData = function() {
			return sx(this).dataBeforeProcessed;
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
			return Yb({
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
			var r = this.ecModel, i = Qy.prototype.getColorFromPalette.call(this, e, t, n);
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
					var o = e[a], s = Qb(i, o);
					n[s] = !1, this._selectedDataIndicesMap[s] = -1;
				}
			}
		}, t.prototype.toggleSelect = function(e, t) {
			for (var n = [], r = 0; r < e.length; r++) n[0] = e[r], this.isSelected(e[r], t) ? this.unselect(n, t) : this.select(n, t);
		}, t.prototype.getSelectedDataIndices = function() {
			if (this.option.selectedMap === "all") return [].slice.call(this.getData().getIndices());
			for (var e = this._selectedDataIndicesMap, t = ct(e), n = [], r = 0; r < t.length; r++) {
				var i = e[t[r]];
				i >= 0 && n.push(i);
			}
			return n;
		}, t.prototype.isSelected = function(e, t) {
			var n = this.option.selectedMap;
			if (!n) return !1;
			var r = this.getData(t);
			return (n === "all" || n[Qb(r, e)]) && !r.getItemModel(e).get(["select", "disabled"]);
		}, t.prototype.isUniversalTransitionEnabled = function() {
			if (this.__universalTransitionEnabled) return !0;
			var e = this.option.universalTransition;
			return e ? e === !0 || e && e.enabled : !1;
		}, t.prototype._innerSelect = function(e, t) {
			var n, r, i = this.option, a = i.selectedMode, o = t.length;
			if (a && o) {
				if (a === "series") i.selectedMap = "all";
				else if (a === "multiple") {
					U(i.selectedMap) || (i.selectedMap = {});
					for (var s = i.selectedMap, c = 0; c < o; c++) {
						var l = t[c], u = Qb(e, l);
						s[u] = !0, this._selectedDataIndicesMap[u] = e.getRawIndex(l);
					}
				} else if (a === "single" || a === !0) {
					var d = t[o - 1], u = Qb(e, d);
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
			return Ky.registerClass(e);
		}, t.protoInitialize = function() {
			var e = t.prototype;
			e.type = "series.__base__", e.seriesIndex = 0, e.ignoreStyleOnData = !1, e.hasSymbolVisual = !1, e.defaultSymbol = "circle", e.visualStyleAccessPath = "itemStyle", e.visualDrawType = "fill";
		}(), t;
	}(Ky), rt(cx, nb), rt(cx, Qy), sn(cx, Ky);
}));
//#endregion
//#region node_modules/echarts/lib/util/symbol.js
function ux(e, t) {
	if (this.type !== "image") {
		var n = this.style;
		this.__isEmptyBrush ? (n.stroke = e, n.fill = t || Q.color.neutral00, n.lineWidth = 2) : this.shape.symbolType === "line" ? n.stroke = e : n.fill = e, this.markRedraw();
	}
}
function dx(e, t, n, r, i, a, o) {
	var s = e.indexOf("empty") === 0;
	s && (e = e.substr(5, 1).toLowerCase() + e.substr(6));
	var c = e.indexOf("image://") === 0 ? dm(e.slice(8), new Y(t, n, r, i), o ? "center" : "cover") : e.indexOf("path://") === 0 ? um(e.slice(7), {}, new Y(t, n, r, i), o ? "center" : "cover") : new xx({ shape: {
		symbolType: e,
		x: t,
		y: n,
		width: r,
		height: i
	} });
	return c.__isEmptyBrush = s, c.setColor = ux, a && c.setColor(a), c;
}
function fx(e) {
	return B(e) || (e = [+e, +e]), [e[0] || 0, e[1] || 0];
}
function px(e, t) {
	if (e != null) return B(e) || (e = [e, e]), [yl(e[0], t[0]) || 0, yl(W(e[1], e[0]), t[1]) || 0];
}
var mx, hx, gx, _x, vx, yx, bx, xx, Sx = M((() => {
	q(), $m(), Or(), Ur(), Sl(), Eb(), mx = Qs.extend({
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
	}), hx = Qs.extend({
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
	}), gx = Qs.extend({
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
	}), _x = Qs.extend({
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
	}), vx = {
		line: gp,
		rect: _c,
		roundRect: _c,
		square: _c,
		circle: jf,
		diamond: hx,
		pin: gx,
		arrow: _x,
		triangle: mx
	}, yx = {
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
	}, bx = {}, R(vx, function(e, t) {
		bx[t] = new e();
	}), xx = Qs.extend({
		type: "symbol",
		shape: {
			symbolType: "",
			x: 0,
			y: 0,
			width: 0,
			height: 0
		},
		calculateTextPosition: function(e, t, n) {
			var r = zr(e, t, n), i = this.shape;
			return i && i.symbolType === "pin" && t.position === "inside" && (r.y = n.y + n.height * .4), r;
		},
		buildPath: function(e, t, n) {
			var r = t.symbolType;
			if (r !== "none") {
				var i = bx[r];
				i ||= (r = "rect", bx[r]), yx[r](t.x, t.y, t.width, t.height, i.shape), i.buildPath(e, i.shape, n);
			}
		}
	});
})), Cx, Tx = M((() => {
	F(), q_(), lx(), Sx(), $m(), Eb(), Cx = function(e) {
		P(t, e);
		function t() {
			var n = e !== null && e.apply(this, arguments) || this;
			return n.type = t.type, n.hasSymbolVisual = !0, n;
		}
		return t.prototype.getInitialData = function(e) {
			if (process.env.NODE_ENV !== "production") {
				var t = e.coordinateSystem;
				if (t !== "polar" && t !== "cartesian2d") throw Error("Line not support coordinateSystem besides cartesian and polar");
			}
			return W_(null, this, { useEncodeDefaulter: !0 });
		}, t.prototype.getLegendIcon = function(e) {
			var t = new Of(), n = dx("line", 0, e.itemHeight / 2, e.itemWidth, 0, e.lineStyle.stroke, !1);
			t.add(n), n.setStyle(e.lineStyle);
			var r = this.getData().getVisual("symbol"), i = this.getData().getVisual("symbolRotate"), a = r === "none" ? "circle" : r, o = e.itemHeight * .8, s = dx(a, (e.itemWidth - o) / 2, (e.itemHeight - o) / 2, o, o, e.itemStyle.fill);
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
	}(cx);
}));
//#endregion
//#region node_modules/echarts/lib/chart/helper/labelHelper.js
function Ex(e, t) {
	var n = e.mapDimensionsAll("defaultedLabel"), r = n.length;
	if (r === 1) {
		var i = sg(e, t, n[0]);
		return i == null ? null : i + "";
	}
	if (r) {
		for (var a = [], o = 0; o < n.length; o++) a.push(sg(e, t, n[o]));
		return a.join(" ");
	}
}
function Dx(e, t) {
	var n = e.mapDimensionsAll("defaultedLabel");
	if (!B(t)) return t + "";
	for (var r = [], i = 0; i < n.length; i++) {
		var a = e.getDimensionIndex(n[i]);
		a >= 0 && r.push(t[a]);
	}
	return r.join(" ");
}
var Ox = M((() => {
	Cg(), q();
}));
//#endregion
//#region node_modules/echarts/lib/chart/helper/Symbol.js
function kx(e, t) {
	this.parent.drift(e, t);
}
var Ax, jx = M((() => {
	F(), Sx(), $m(), Fu(), nf(), Ox(), q(), gh(), sc(), im(), Ax = function(e) {
		P(t, e);
		function t(t, n, r, i) {
			var a = e.call(this) || this;
			return a.updateData(t, n, r, i), a;
		}
		return t.prototype._createSymbol = function(e, t, n, r, i, a) {
			this.removeAll();
			var o = dx(e, -1, -1, 2, 2, null, a);
			o.attr({
				z2: W(i, 100),
				culling: !0,
				scaleX: r[0] / 2,
				scaleY: r[1] / 2
			}), o.drift = kx, this._symbolType = e, this.add(o);
		}, t.prototype.stopSymbolAnimation = function(e) {
			this.childAt(0).stopAnimation(null, e);
		}, t.prototype.getSymbolType = function() {
			return this._symbolType;
		}, t.prototype.getSymbolPath = function() {
			return this.childAt(0);
		}, t.prototype.highlight = function() {
			md(this.childAt(0));
		}, t.prototype.downplay = function() {
			hd(this.childAt(0));
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
				u ? f.attr(p) : Xp(f, p, o, n), nm(f);
			}
			if (this._updateCommon(e, n, s, r, i), l) {
				var f = this.childAt(0);
				if (!u) {
					var p = {
						scaleX: this._sizeX,
						scaleY: this._sizeY,
						style: { opacity: f.style.opacity }
					};
					f.scaleX = f.scaleY = 0, f.style.opacity = 0, Zp(f, p, o, n);
				}
			}
			u && this.childAt(0).stopAnimation("leave");
		}, t.prototype._updateCommon = function(e, t, n, r, i) {
			var a = this.childAt(0), o = e.hostModel, s, c, l, u, d, f, p, m, h;
			if (r && (s = r.emphasisItemStyle, c = r.blurItemStyle, l = r.selectItemStyle, u = r.focus, d = r.blurScope, p = r.labelStatesModels, m = r.hoverScale, h = r.cursorStyle, f = r.emphasisDisabled), !r || e.hasItemOption) {
				var g = r && r.itemModel ? r.itemModel : e.getItemModel(t), _ = g.getModel("emphasis");
				s = _.getModel("itemStyle").getItemStyle(), l = g.getModel(["select", "itemStyle"]).getItemStyle(), c = g.getModel(["blur", "itemStyle"]).getItemStyle(), u = _.get("focus"), d = _.get("blurScope"), f = _.get("disabled"), p = rh(g), m = _.getShallow("scale"), h = g.getShallow("cursor");
			}
			var v = e.getItemVisual(t, "symbolRotate");
			a.attr("rotation", (v || 0) * Math.PI / 180 || 0);
			var y = px(e.getItemVisual(t, "symbolOffset"), n);
			y && (a.x = y[0], a.y = y[1]), h && a.attr("cursor", h);
			var b = e.getItemVisual(t, "style"), x = b.fill;
			if (a instanceof oc) {
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
			nh(a, p, {
				labelFetcher: o,
				labelDataIndex: t,
				defaultText: E,
				inheritColor: x,
				defaultOpacity: b.opacity
			});
			function E(t) {
				return T ? e.getName(t) : Ex(e, t);
			}
			this._sizeX = n[0] / 2, this._sizeY = n[1] / 2;
			var D = a.ensureState("emphasis");
			D.style = s, a.ensureState("select").style = l, a.ensureState("blur").style = c;
			var O = m == null || m === !0 ? Math.max(1.1, 3 / this._sizeY) : isFinite(m) && m > 0 ? +m : 1;
			D.scaleX = this._sizeX * O, D.scaleY = this._sizeY * O, this.setSymbolScale(1), Nd(this, u, d, f);
		}, t.prototype.setSymbolScale = function(e) {
			this.scaleX = this.scaleY = e;
		}, t.prototype.fadeOut = function(e, t, n) {
			var r = this.childAt(0), i = Nu(this).dataIndex, a = n && n.animation;
			if (this.silent = r.silent = !0, n && n.fadeLabel) {
				var o = r.getTextContent();
				o && $p(o, { style: { opacity: 0 } }, t, {
					dataIndex: i,
					removeOpt: a,
					cb: function() {
						r.removeTextContent();
					}
				});
			} else r.removeTextContent();
			$p(r, {
				style: { opacity: 0 },
				scaleX: 0,
				scaleY: 0
			}, t, {
				dataIndex: i,
				cb: e,
				removeOpt: a
			});
		}, t.getSymbolSize = function(e, t) {
			return fx(e.getItemVisual(t, "symbolSize"));
		}, t.getSymbolZ2 = function(e, t) {
			return e.getItemVisual(t, "z2");
		}, t;
	}(Of);
}));
//#endregion
//#region node_modules/echarts/lib/chart/helper/SymbolDraw.js
function Mx(e, t, n, r) {
	return t && !isNaN(t[0]) && !isNaN(t[1]) && !(r && r.isIgnore && r.isIgnore(n)) && !(r && r.clipShape && !r.clipShape.contain(t[0], t[1])) && e.getItemVisual(n, "symbol") !== "none";
}
function Nx(e) {
	return e != null && !U(e) && (e = { isIgnore: e }), e || {};
}
function Px(e) {
	var t = e.hostModel, n = t.getModel("emphasis");
	return {
		emphasisItemStyle: n.getModel("itemStyle").getItemStyle(),
		blurItemStyle: t.getModel(["blur", "itemStyle"]).getItemStyle(),
		selectItemStyle: t.getModel(["select", "itemStyle"]).getItemStyle(),
		focus: n.get("focus"),
		blurScope: n.get("blurScope"),
		emphasisDisabled: n.get("disabled"),
		hoverScale: n.get("scale"),
		labelStatesModels: rh(t),
		cursorStyle: t.get("cursor")
	};
}
function Fx(e, t, n, r, i, a, o) {
	var s = new e(t, n, r, i);
	return s.setPosition(a), t.setItemGraphicEl(n, s), o.add(s), s;
}
var Ix, Lx = M((() => {
	$m(), jx(), q(), gh(), Ix = function() {
		function e(e) {
			this.group = new Of(), this._SymbolCtor = e || Ax;
		}
		return e.prototype.updateData = function(e, t) {
			this._progressiveEls = null, t = Nx(t);
			var n = this.group, r = e.hostModel, i = this._data, a = this._SymbolCtor, o = t.disableAnimation, s = this._seriesScope = Px(e), c = { disableAnimation: o }, l = t.getSymbolPoint || function(t) {
				return e.getItemLayout(t);
			};
			i || n.removeAll(), e.diff(i).add(function(r) {
				var i = l(r);
				Mx(e, i, r, t) && Fx(a, e, r, s, c, i, n);
			}).update(function(u, d) {
				var f = i.getItemGraphicEl(d), p = l(u);
				if (!Mx(e, p, u, t)) {
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
					o ? f.attr(g) : Xp(f, g, r);
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
				Mx(t, s, i, e) ? (o ||= Fx(n._SymbolCtor, t, i, n._seriesScope, { disableAnimation: !0 }, s, n.group), o.stopAnimation(), o.setPosition(s), o.markRedraw()) : o && (n.group.remove(o), t.setItemGraphicEl(i, null));
			}
		}, e.prototype.incrementalPrepareUpdate = function(e) {
			this._seriesScope = Px(e), this._data = null, this.group.removeAll();
		}, e.prototype.incrementalUpdate = function(e, t, n, r) {
			this._progressiveEls = [], r = Nx(r);
			function i(e) {
				e.isGroup || (e.incremental = n, e.ensureState("emphasis").hoverLayer = 2);
			}
			for (var a = e.start; a < e.end; a++) {
				var o = t.getItemLayout(a);
				if (Mx(t, o, a, r)) {
					var s = new this._SymbolCtor(t, a, this._seriesScope);
					s.traverse(i), s.setPosition(o), this.group.add(s), t.setItemGraphicEl(a, s), this._progressiveEls.push(s);
				}
			}
		}, e.prototype.eachRendered = function(e) {
			Nm(this._progressiveEls || this.group, e);
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
function Rx(e, t, n) {
	var r = e.getBaseAxis(), i = e.getOtherAxis(r), a = zx(i, n), o = r.dim, s = i.dim, c = t.mapDimension(s), l = t.mapDimension(o), u = +(s === "x" || s === "radius"), d = z(e.dimensions, function(e) {
		return t.mapDimension(e);
	}), f = !1, p = t.getCalculationInfo("stackResultDimension");
	return z_(t, d[0]) && (f = !0, d[0] = p), z_(t, d[1]) && (f = !0, d[1] = p), {
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
function zx(e, t) {
	var n = 0, r = e.scale.getExtent();
	return t === "start" ? n = r[0] : t === "end" ? n = r[1] : ft(t) && !isNaN(t) ? n = t : r[0] > 0 ? n = r[0] : r[1] < 0 && (n = r[1]), n;
}
function Bx(e, t, n, r) {
	var i = NaN;
	e.stacked && (i = n.get(n.getCalculationInfo("stackedOverDimension"), r)), isNaN(i) && (i = e.valueStart);
	var a = e.baseDataOffset, o = [];
	return o[a] = n.get(e.baseDim, r), o[1 - a] = i, t.dataToPoint(o);
}
function Vx(e, t) {
	return !isFinite(e) || !isFinite(t);
}
var Hx = M((() => {
	V_(), q();
}));
//#endregion
//#region node_modules/echarts/lib/util/vendor.js
function Ux(e) {
	return Wx({ ctor: Gx }, e).arr;
}
function Wx(e, t) {
	process.env.NODE_ENV !== "production" && G(t != null && isFinite(t) && t >= 0 && e.hasOwnProperty("ctor"));
	var n = e.arr, r = e.ctor;
	if (t > bl && (t = bl), !n || e.typed && n.length < t) {
		var i = void 0;
		if (r) try {
			i = new r(t), e.typed = !0, n && i.set(n);
		} catch (e) {
			process.env.NODE_ENV !== "production" && El(e);
		}
		if (!i && (i = [], e.typed = !1, n)) for (var a = 0, o = n.length; a < o; a++) i[a] = n[a];
		e.arr = i;
	}
	return e;
}
var Gx, Kx = M((() => {
	q(), Pl(), Wu(), Sl(), Gx = typeof Float32Array < "u" ? Float32Array : void 0;
}));
//#endregion
//#region node_modules/echarts/lib/chart/line/lineAnimationDiff.js
function qx(e, t) {
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
function Jx(e, t, n, r, i, a, o, s) {
	for (var c = qx(e, t), l = [], u = [], d = [], f = [], p = [], m = [], h = [], g = Rx(i, t, o), _ = e.getLayout("points") || [], v = t.getLayout("points") || [], y = 0; y < c.length; y++) {
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
				var j = Bx(g, i, t, O);
				d.push(j[0], j[1]), f.push(r[C], r[C + 1]), h.push(t.getRawIndex(O));
				break;
			case "-": x = !1;
		}
		x && (p.push(b), m.push(m.length));
	}
	m.sort(function(e, t) {
		return h[e] - h[t];
	});
	for (var ee = l.length, te = Ux(ee), ne = Ux(ee), re = Ux(ee), ie = Ux(ee), ae = [], y = 0; y < m.length; y++) {
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
var Yx = M((() => {
	Hx(), Kx();
}));
//#endregion
//#region node_modules/echarts/lib/chart/line/poly.js
function Xx(e, t, n, r, i, a, o, s, c) {
	for (var l, u, d, f, p, m, h = n, g = 0; g < r; g++) {
		var _ = t[h * 2], v = t[h * 2 + 1];
		if (h >= i || h < 0) break;
		if (Vx(_, v)) {
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
				if (c) for (; Vx(S, C) && w < r;) w++, x += a, S = t[x * 2], C = t[x * 2 + 1];
				var T = .5, E = 0, D = 0, O = void 0, k = void 0;
				if (w >= r || Vx(S, C)) p = _, m = v;
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
					} else ne = Math.sqrt(A * A + ee * ee), re = Math.sqrt(j * j + te * te), T = re / (re + ne), p = _ - E * o * (1 - T), m = v - D * o * (1 - T), O = _ + E * o * T, k = v + D * o * T, O = Zx(O, Qx(S, _)), k = Zx(k, Qx(C, v)), O = Qx(O, Zx(S, _)), k = Qx(k, Zx(C, v)), E = O - _, D = k - v, p = _ - E * ne / re, m = v - D * ne / re, p = Zx(p, Qx(l, _)), m = Zx(m, Qx(u, v)), p = Qx(p, Zx(l, _)), m = Qx(m, Zx(u, v)), E = _ - p, D = v - m, O = _ + E * re / ne, k = v + D * re / ne;
				}
				e.bezierCurveTo(d, f, p, m, _, v), d = O, f = k;
			} else e.lineTo(_, v);
		}
		l = _, u = v, h += a;
	}
	return g;
}
var Zx, Qx, $x, eS, tS, nS, rS = M((() => {
	F(), $s(), bs(), Qi(), Eb(), Hx(), Zx = Math.min, Qx = Math.max, $x = function() {
		function e() {
			this.smooth = 0, this.smoothConstraint = !0;
		}
		return e;
	}(), eS = function(e) {
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
			return new $x();
		}, t.prototype.buildPath = function(e, t) {
			var n = t.points, r = 0, i = n.length / 2;
			if (t.connectNulls) {
				for (; i > 0 && Vx(n[i * 2 - 2], n[i * 2 - 1]); i--);
				for (; r < i && Vx(n[r * 2], n[r * 2 + 1]); r++);
			}
			for (; r < i;) r += Xx(e, n, r, i, i, 1, t.smooth, t.smoothMonotone, t.connectNulls) + 1;
		}, t.prototype.getPointOn = function(e, t) {
			this.path || (this.createPathProxy(), this.buildPath(this.path, this.shape));
			for (var n = this.path.data, r = ys.CMD, i, a, o = t === "x", s = [], c = 0; c < n.length;) {
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
						var v = o ? ji(i, u, f, m, e, s) : ji(a, d, p, h, e, s);
						if (v > 0) for (var y = 0; y < v; y++) {
							var b = s[y];
							if (b <= 1 && b >= 0) {
								var _ = o ? ki(a, d, p, h, b) : ki(i, u, f, m, b);
								return o ? [e, _] : [_, e];
							}
						}
						i = m, a = h;
				}
			}
		}, t;
	}(Qs), tS = function(e) {
		P(t, e);
		function t() {
			return e !== null && e.apply(this, arguments) || this;
		}
		return t;
	}($x), nS = function(e) {
		P(t, e);
		function t(t) {
			var n = e.call(this, t) || this;
			return n.type = "ec-polygon", n;
		}
		return t.prototype.getDefaultShape = function() {
			return new tS();
		}, t.prototype.buildPath = function(e, t) {
			var n = t.points, r = t.stackedOnPoints, i = 0, a = n.length / 2, o = t.smoothMonotone;
			if (t.connectNulls) {
				for (; a > 0 && Vx(n[a * 2 - 2], n[a * 2 - 1]); a--);
				for (; i < a && Vx(n[i * 2], n[i * 2 + 1]); i++);
			}
			for (; i < a;) {
				var s = Xx(e, n, i, a, a, 1, t.smooth, o, t.connectNulls);
				Xx(e, r, i + s - 1, s, a, -1, t.stackedOnSmooth, o, t.connectNulls), i += s + 1, e.closePath();
			}
		}, t;
	}(Qs);
}));
//#endregion
//#region node_modules/echarts/lib/chart/helper/createRenderPlanner.js
function iS() {
	var e = ru();
	return function(t) {
		var n = e(t), r = t.pipelineContext, i = !!n.large, a = !!n.progressiveRender, o = n.large = !!(r && r.large), s = n.progressiveRender = !!(r && r.progressiveRender);
		return (i !== o || a !== s) && "reset";
	};
}
var aS = M((() => {
	Z();
}));
//#endregion
//#region node_modules/echarts/lib/view/Chart.js
function oS(e, t, n) {
	e && Ld(e) && (t === "emphasis" ? md : hd)(e, n);
}
function sS(e, t, n) {
	var r = nu(e, t), i = t && t.highlightKey != null ? Rd(t.highlightKey) : null;
	r == null ? e.eachItemGraphicEl(function(e) {
		oS(e, n, i);
	}) : R(Il(r), function(t) {
		oS(e.getItemGraphicEl(t), n, i);
	});
}
function cS(e) {
	return dS(e.model);
}
function lS(e) {
	var t = e.model, n = e.ecModel, r = e.api, i = e.payload, a = t.pipelineContext.progressiveRender, o = e.view, s = i && uS(i).updateMethod, c = a ? "incrementalPrepareRender" : s && o[s] ? s : "render";
	return c !== "render" && o[c](t, n, r, i), pS[c];
}
var uS, dS, fS, pS, mS = M((() => {
	q(), kf(), $_(), gn(), Z(), nf(), sb(), aS(), $m(), Pl(), uS = ru(), dS = iS(), fS = function() {
		function e() {
			this.group = new Of(), this.uid = J_("viewChart"), this.renderTask = ib({
				plan: cS,
				reset: lS
			}), this.renderTask.context = { view: this };
		}
		return e.prototype.init = function(e, t) {}, e.prototype.render = function(e, t, n, r) {
			if (process.env.NODE_ENV !== "production") throw Error("render method must been implemented");
		}, e.prototype.highlight = function(e, t, n, r) {
			var i = e.getData(r && r.dataType);
			if (!i) {
				process.env.NODE_ENV !== "production" && El("Unknown dataType " + r.dataType);
				return;
			}
			sS(i, r, "emphasis");
		}, e.prototype.downplay = function(e, t, n, r) {
			var i = e.getData(r && r.dataType);
			if (!i) {
				process.env.NODE_ENV !== "production" && El("Unknown dataType " + r.dataType);
				return;
			}
			sS(i, r, "normal");
		}, e.prototype.remove = function(e, t) {
			this.group.removeAll();
		}, e.prototype.dispose = function(e, t) {}, e.prototype.updateView = function(e, t, n, r) {
			this.render(e, t, n, r);
		}, e.prototype.updateVisual = function(e, t, n, r) {
			this.render(e, t, n, r);
		}, e.prototype.eachRendered = function(e) {
			Nm(this.group, e);
		}, e.markUpdateMethod = function(e, t) {
			uS(e).updateMethod = t;
		}, e.protoInitialize = function() {
			var t = e.prototype;
			t.type = "chart";
		}(), e;
	}(), an(fS, ["dispose"]), dn(fS), pS = {
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
function hS(e, t, n, r, i) {
	var a = e.getArea(), o = a.x, s = a.y, c = a.width, l = a.height, u = n.get(["lineStyle", "width"]) || 0;
	o -= u / 2, s -= u / 2, c += u, l += u, c = Math.ceil(c), o !== Math.floor(o) && (o = Math.floor(o), c++);
	var d = new _c({ shape: {
		x: o,
		y: s,
		width: c,
		height: l
	} });
	if (t) {
		var f = e.getBaseAxis(), p = f.isHorizontal(), m = f.inverse;
		p ? (m && (d.shape.x += c), d.shape.width = 0) : (m || (d.shape.y += l), d.shape.height = 0);
		var h = V(i) ? function(e) {
			i(e, d);
		} : null;
		Zp(d, { shape: {
			width: c,
			height: l,
			x: o,
			y: s
		} }, n, null, r, h);
	}
	return d;
}
function gS(e, t, n) {
	var r = e.getArea(), i = X(r.r0, 1), a = X(r.r, 1), o = new $f({ shape: {
		cx: X(e.cx, 1),
		cy: X(e.cy, 1),
		r0: i,
		r: a,
		startAngle: r.startAngle,
		endAngle: r.endAngle,
		clockwise: r.clockwise
	} });
	return t && (e.getBaseAxis().dim === "angle" ? o.shape.endAngle = r.startAngle : o.shape.r = i, Zp(o, { shape: {
		endAngle: r.endAngle,
		r: a
	} }, n)), o;
}
var _S = M((() => {
	$m(), Sl(), q();
}));
//#endregion
//#region node_modules/echarts/lib/coord/CoordinateSystem.js
function vS(e, t) {
	return e.type === t;
}
var yS = M((() => {}));
//#endregion
//#region node_modules/echarts/lib/util/styleCompat.js
function bS(e, t) {
	if (process.env.NODE_ENV !== "production") {
		var n = e + "^_^" + t;
		xS[n] || (console.warn("[ECharts] DEPRECATED: \"" + e + "\" has been deprecated. " + t), xS[n] = !0);
	}
}
var xS, SS = M((() => {
	xS = {};
})), CS, wS = M((() => {
	gn(), CS = function() {
		function e() {}
		return e.prototype.isBlank = function() {
			return this._isBlank;
		}, e.prototype.setBlank = function(e) {
			this._isBlank = e;
		}, e;
	}(), dn(CS);
}));
//#endregion
//#region node_modules/echarts/lib/data/OrdinalMeta.js
function TS(e) {
	return U(e) && e.value != null ? e.value : e + "";
}
var ES, DS, OS = M((() => {
	q(), ES = 0, DS = function() {
		function e(e) {
			this.categories = e.categories || [], this._needCollect = e.needCollect, this._deduplication = e.deduplication, this.uid = ++ES, this._onCollect = e.onCollect;
		}
		return e.createByAxisModel = function(t) {
			var n = t.option, r = n.data, i = r && z(r, TS);
			return new e({
				categories: i,
				needCollect: !i,
				deduplication: n.dedplication !== !1
			});
		}, e.prototype.getOrdinal = function(e) {
			return this._getOrCreateMap().get(e);
		}, e.prototype.parseAndCollect = function(e) {
			var t, n = this._needCollect;
			if (!H(e) && !n) return e;
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
function kS(e, t, n) {
	var r;
	e ||= {};
	var i = jv();
	if (i) {
		var a = i.createBreakScaleMapper(t, n);
		a.hasBreaks() && (R(RS, function(t) {
			a[t] && (e[t] = Kt(a[t], a));
		}), r = a);
	}
	return r ?? IS(e, n), {
		brk: r,
		mapper: e
	};
}
function AS(e, t) {
	R(RS, function(n) {
		e[n] = t[n];
	});
}
function jS(e, t) {
	e.freeze = Mt, process.env.NODE_ENV !== "production" && (e.freeze = function() {
		t.freeze();
	});
}
function MS(e) {
	return e.getExtentUnsafe(0, 2);
}
function NS(e, t) {
	return e.getExtentUnsafe(1, t) || e.getExtentUnsafe(0, t);
}
function PS(e) {
	var t = NS(e, 3);
	return t[1] - t[0];
}
function FS(e) {
	var t = e.getExtentUnsafe(0, 3);
	return t[1] - t[0];
}
function IS(e, t) {
	var n = e || {}, r = [];
	return n._extents = r, r[0] = t ? t.slice() : fu(), L(n, zS), n;
}
function LS(e, t, n, r) {
	vu(n, r) ? (e[t][0] = n, e[t][1] = r) : process.env.NODE_ENV !== "production" && n != null && r != null && n <= r && El("Invalid setExtent call - start: " + n + ", end: " + r);
}
var RS, zS, BS = M((() => {
	q(), Z(), Iv(), Pl(), RS = ct({
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
	}), zS = {
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
			var t = NS(this, null);
			return e >= t[0] && e <= t[1];
		},
		getExtent: function() {
			return this._extents[0].slice();
		},
		getExtentUnsafe: function(e) {
			return this._extents[e];
		},
		setExtent: function(e, t) {
			process.env.NODE_ENV !== "production" && G(!this._frozen), LS(this._extents, 0, e, t);
		},
		setExtent2: function(e, t, n) {
			process.env.NODE_ENV !== "production" && G(!this._frozen);
			var r = this._extents;
			r[e] || (r[e] = r[0].slice()), LS(r, e, t, n);
		},
		freeze: function() {
			process.env.NODE_ENV !== "production" && (this._frozen = !0);
		}
	};
}));
//#endregion
//#region node_modules/echarts/lib/scale/helper.js
function VS(e) {
	return HS(e) || WS(e);
}
function HS(e) {
	return e.type === "interval";
}
function US(e) {
	return e.type === "time";
}
function WS(e) {
	return e.type === "log";
}
function GS(e) {
	return e.type === "ordinal";
}
function KS(e) {
	var t = Qc(e), n = ml(10, t), r = dl(e / n);
	return r ? r === 2 ? r = 3 : r === 3 ? r = 5 : r *= 2 : r = 1, X(r * n, -t);
}
function qS(e) {
	return Wc(e) + 2;
}
function JS(e, t) {
	return hl(e) / hl(t);
}
function YS(e, t, n) {
	var r = n && n.lookup;
	if (r) {
		for (var i = 0; i < r.from.length; i++) if (e === r.from[i]) return r.to[i];
	}
	return ml(t, e);
}
function XS(e, t, n) {
	var r = e.slice();
	if (r[0] === r[1]) {
		var i = n && n.ctnShp;
		if (r[0] !== 0) {
			var a = ul(r[0]);
			t[1] || (r[1] += a / 2), r[0] -= a / 2;
		} else i && (r[0] = -1), r[1] = 1;
	}
	return (!_u(r[0]) || !_u(r[1])) && (r[0] = 0, r[1] = 1), r[1] < r[0] && r.reverse(), r;
}
function ZS(e, t) {
	return [e[0] !== t[0], e[1] !== t[1]];
}
function QS(e, t) {
	return e ||= t, dl(ll(e, 1));
}
function $S(e, t, n) {
	var r = MS(e), i = r[0], a = e.count(), o = Math.max((t || 0) + 1, 1);
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
var eC = M((() => {
	Sl(), Z(), BS();
})), tC, nC = M((() => {
	F(), wS(), OS(), q(), Sl(), BS(), eC(), tC = function(e) {
		P(t, e);
		function t(n) {
			var r = e.call(this) || this;
			r.type = "ordinal", r.parse = t.parse, AS(r, t.decoratedMethods);
			var i = n.ordinalMeta;
			i ||= new DS({}), B(i) && (i = new DS({ categories: z(i, function(e) {
				return U(e) ? e.value : e;
			}) })), r._ordinalMeta = i;
			var a = kS(null, null, n.extent || [0, i.categories.length - 1]);
			return r._mapper = a.mapper, jS(r, a.mapper), r;
		}
		return t.parse = function(e) {
			return e == null ? e = NaN : H(e) ? (e = this._ordinalMeta.getOrdinal(e), e ??= NaN) : e = dl(e), e;
		}, t.prototype.getTicks = function() {
			var e = [];
			return $S(this, 0, function(t) {
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
			var e = MS(this._mapper);
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
	}(CS), CS.registerClass(tC);
}));
//#endregion
//#region node_modules/echarts/lib/scale/minorTicks.js
function rC(e, t, n, r) {
	for (var i = e.getTicks({ expandToNicedExtent: !0 }), a = [], o = e.getExtent(), s = 1; s < i.length; s++) {
		var c = i[s], l = i[s - 1];
		if (!(l.break || c.break)) {
			for (var u = 0, d = [], f = (c.value - l.value) / t, p = qS(f); u < t - 1;) {
				var m = X(l.value + (u + 1) * f, p);
				m > o[0] && m < o[1] && d.push(m), u++;
			}
			var h = jv();
			h && h.pruneTicksByBreak("auto", d, n, function(e) {
				return e;
			}, r, o), a.push(d);
		}
	}
	return a;
}
var iC = M((() => {
	Sl(), Iv(), eC();
})), aC, oC = M((() => {
	F(), Sl(), ky(), wS(), eC(), Iv(), q(), iC(), BS(), Pl(), aC = function(e) {
		P(t, e);
		function t(n) {
			var r = e.call(this) || this;
			return r.type = "interval", r.parse = t.parse, n ||= {}, r.brk = kS(r, Mv(r, n), null).brk, r._cfg = {
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
			var t = MS(this);
			process.env.NODE_ENV !== "production" && (G(e.interval != null), e.intervalCount != null && G(e.intervalCount >= -1 && e.intervalPrecision != null && !Pv(this)), e.niceExtent != null && (G(isFinite(e.niceExtent[0]) && isFinite(e.niceExtent[1])), G(t[0] <= e.niceExtent[0] && e.niceExtent[1] <= t[1]), G(X(e.niceExtent[0] - e.niceExtent[1], Wc(e.interval)) <= e.interval))), this._cfg = e = I(e), e.niceExtent ?? (e.niceExtent = t.slice()), e.intervalPrecision ?? (e.intervalPrecision = qS(e.interval));
		}, t.prototype.getTicks = function(e) {
			e ||= {};
			var t = this._cfg, n = t.interval, r = MS(this), i = t.niceExtent, a = t.intervalPrecision, o = jv(), s = this.brk, c = o && s, l = [];
			if (!n) return l;
			if (e.breakTicks === "only_break" && c) return o.addBreaksToTicks(l, s.breaks, r), l;
			process.env.NODE_ENV !== "production" && G(i != null);
			var u = 3e3;
			r[0] < i[0] && l.push({ value: e.expandToNicedExtent ? X(i[0] - n, a) : r[0] });
			for (var d = function(e, t) {
				return dl((t - e) / n);
			}, f = t.intervalCount, p = i[0], m = 0;; m++) {
				if (f == null) {
					if (p > i[1] || !isFinite(p) || !isFinite(i[1])) break;
				} else {
					if (m > f) break;
					p = cl(p, i[1]), m === f && (p = i[1]);
				}
				if (l.push({ value: p }), p = X(p + n, a), s) {
					var h = s.calcNiceTickMultiple(p, d);
					h >= 0 && (p = X(p + h * n, a));
				}
				if (l.length > 0 && p === l[l.length - 1].value) break;
				if (l.length > u) return process.env.NODE_ENV !== "production" && Tl("Exceed safe limit in IntervalScale[\"getTicks\"]."), [];
			}
			var g = l.length ? l[l.length - 1].value : i[1];
			return r[1] > g && l.push({ value: e.expandToNicedExtent ? X(g + n, a) : r[1] }), c && o.pruneTicksByBreak(e.pruneByBreak, l, s.breaks, function(e) {
				return e.value;
			}, t.interval, r), c && e.breakTicks !== "none" && o.addBreaksToTicks(l, s.breaks, r), l;
		}, t.prototype.getMinorTicks = function(e) {
			return rC(this, e, Nv(this), this._cfg.interval);
		}, t.prototype.getLabel = function(e, t) {
			if (e == null) return "";
			var n = t && t.precision;
			return n == null ? n = Wc(e.value) || 0 : n === "auto" && (n = this._cfg.intervalPrecision), by(X(e.value, n, !0));
		}, t.type = "interval", t;
	}(CS), CS.registerClass(aC);
}));
//#endregion
//#region node_modules/echarts/lib/scale/Time.js
function sC(e, t, n, r) {
	return Kv(new Date(t), e, r).getTime() === Kv(new Date(n), e, r).getTime();
}
function cC(e, t) {
	return e /= uy, e > 16 ? 16 : e > 7.5 ? 7 : e > 3.5 ? 4 : e > 1.5 ? 2 : 1;
}
function lC(e) {
	var t = 30 * uy;
	return e /= t, e > 6 ? 6 : e > 3 ? 3 : e > 2 ? 2 : 1;
}
function uC(e) {
	return e /= ly, e > 12 ? 12 : e > 6 ? 6 : e > 3.5 ? 4 : e > 2 ? 2 : 1;
}
function dC(e, t) {
	return e /= t ? cy : sy, e > 30 ? 30 : e > 20 ? 20 : e > 15 ? 15 : e > 10 ? 10 : e > 5 ? 5 : e > 2 ? 2 : 1;
}
function fC(e) {
	return ll($c(e, !0), 1);
}
function pC(e, t, n) {
	var r = Math.max(0, tt(_y, t) - 1);
	return Kv(new Date(e), _y[r], n).getTime();
}
function mC(e, t) {
	var n = /* @__PURE__ */ new Date(0);
	n[e](1);
	var r = n.getTime();
	n[e](1 + t);
	var i = n.getTime() - r;
	return function(e, t) {
		return Math.max(0, Math.round((t - e) / i));
	};
}
function hC(e, t, n, r, i, a) {
	var o = vy, s = 0;
	function c(e, t, n, i, o, c, l) {
		for (var u = mC(o, e), d = t, f = new Date(d); d < n && d <= r[1];) {
			if (l.push({ value: d }), s++ > 3e3) {
				process.env.NODE_ENV !== "production" && Tl("Exceed safe limit in TimeScale[\"getTicks\"].");
				break;
			}
			if (f[o](f[i]() + e), d = f.getTime(), a) {
				var p = a.calcNiceTickMultiple(d, u);
				p > 0 && (f[o](f[i]() + p * e), d = f.getTime());
			}
		}
		l.push({
			value: d,
			notAdd: d > r[1]
		});
	}
	function l(e, i, a) {
		var o = [], s = !i.length;
		if (!sC(Bv(e), r[0], r[1], n)) {
			s && (i = [{ value: pC(r[0], e, n) }, { value: r[1] }]);
			for (var l = 0; l < i.length - 1; l++) {
				var u = i[l].value, d = i[l + 1].value;
				if (u !== d) {
					var f = void 0, p = void 0, m = void 0, h = !1;
					switch (e) {
						case "year":
							f = Math.max(1, Math.round(t / uy / 365)), p = qv(n), m = ey(n);
							break;
						case "half-year":
						case "quarter":
						case "month":
							f = lC(t), p = Jv(n), m = ty(n);
							break;
						case "week":
						case "half-week":
						case "day":
							f = cC(t, 31), p = Yv(n), m = ny(n), h = !0;
							break;
						case "half-day":
						case "quarter-day":
						case "hour":
							f = uC(t), p = Xv(n), m = ry(n);
							break;
						case "minute":
							f = dC(t, !0), p = Zv(n), m = iy(n);
							break;
						case "second":
							f = dC(t, !1), p = Qv(n), m = ay(n);
							break;
						case "millisecond": f = fC(t), p = $v(n), m = oy(n);
					}
					d >= r[0] && u <= r[1] && c(f, u, d, p, m, h, o), e === "year" && a.length > 1 && l === 0 && a.unshift({ value: a[0].value - f });
				}
			}
			for (var l = 0; l < o.length; l++) a.push(o[l]);
		}
	}
	for (var u = [], d = [], f = 0, p = 0, m = 0; m < o.length; ++m) {
		var h = Bv(o[m]);
		if (Vv(o[m]) && (l(o[m], u[u.length - 1] || [], d), h !== (o[m + 1] ? Bv(o[m + 1]) : null))) {
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
	for (var b = ot(z(u, function(e) {
		return ot(e, function(e) {
			return e.value >= r[0] && e.value <= r[1] && !e.notAdd;
		});
	}), function(e) {
		return e.length > 0;
	}), x = b.length - 1, S = [], m = 0; m < b.length; ++m) for (var C = b[m], w = 0; w < C.length; ++w) {
		var T = Gv(C[w].value, n);
		S.push({
			value: C[w].value,
			time: {
				level: x - m,
				upperTimeUnit: T,
				lowerTimeUnit: T
			}
		});
	}
	Su(S, Cu, null), S.sort(function(e, t) {
		return e.value - t.value;
	});
	var E = S[0], D = S[S.length - 1], O = Gv(r[0], n), k = Gv(r[1], n);
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
var gC, _C, vC, yC, bC = M((() => {
	F(), Sl(), yy(), eC(), wS(), Pl(), q(), Iv(), iC(), BS(), Z(), gC = function(e, t, n, r) {
		for (; n < r;) {
			var i = n + r >>> 1;
			e[i][1] < t ? n = i + 1 : r = i;
		}
		return n;
	}, _C = function(e) {
		P(t, e);
		function t(n) {
			var r = e.call(this) || this;
			return r.type = "time", r.parse = t.parse, r._locale = n.locale, r._useUTC = n.useUTC, r._interval = 0, r.brk = kS(r, Mv(r, n), null).brk, r;
		}
		return t.prototype.getLabel = function(e) {
			return Uv(e.value, gy[Hv(Bv(this._minLevelUnit))] || gy.second, this._useUTC, this._locale);
		}, t.prototype.getFormattedLabel = function(e, t, n) {
			return Wv(e, t, n, this._locale, this._useUTC);
		}, t.prototype.getTicks = function(e) {
			e ||= {};
			var t = this._interval, n = MS(this), r = jv(), i = this.brk, a = r && i, o = [];
			if (!t) return o;
			var s = this._useUTC;
			if (a && e.breakTicks === "only_break") return jv().addBreaksToTicks(o, i.breaks, n), o;
			o = hC(this._minLevelUnit, this._approxInterval, s, n, FS(this), i);
			var c = _y.length - 1, l = 0;
			return R(o, function(e) {
				e.time && (c = Math.min(c, tt(_y, e.time.upperTimeUnit)), l = Math.max(l, e.time.level));
			}), a && jv().pruneTicksByBreak(e.pruneByBreak, o, i.breaks, function(e) {
				return e.value;
			}, this._approxInterval, n), a && e.breakTicks !== "none" && jv().addBreaksToTicks(o, i.breaks, n, function(e) {
				for (var t = Math.max(tt(_y, Gv(e.vmin, s)), tt(_y, Gv(e.vmax, s))), n = 0, r = 0; r < _y.length; r++) if (!sC(_y[r], e.vmin, e.vmax, s)) {
					n = r;
					break;
				}
				var i = Math.min(n, c);
				return {
					level: l,
					lowerTimeUnit: _y[Math.max(i, t)],
					upperTimeUnit: _y[i]
				};
			}), o;
		}, t.prototype.getMinorTicks = function(e) {
			return rC(this, e, Nv(this), this._interval);
		}, t.prototype.setTimeInterval = function(e) {
			this._interval = e.interval, this._approxInterval = e.approxInterval, this._minLevelUnit = e.minLevelUnit;
		}, t.parse = function(e) {
			return ft(e) ? Math.round(e) : +Xc(e);
		}, t.type = "time", t;
	}(CS), vC = [
		["second", sy],
		["minute", cy],
		["hour", ly],
		["quarter-day", ly * 6],
		["half-day", ly * 12],
		["day", uy * 1.2],
		["half-week", uy * 3.5],
		["week", uy * 7],
		["month", uy * 31],
		["quarter", uy * 95],
		["half-year", dy / 2],
		["year", dy]
	], yC = function(e, t) {
		var n = e.getExtent();
		if (n[0] === n[1] && (n[0] -= uy, n[1] += uy), n[1] === -Infinity && n[0] === Infinity) {
			var r = /* @__PURE__ */ new Date();
			n[1] = +new Date(r.getFullYear(), r.getMonth(), r.getDate()), n[0] = n[1] - uy;
		}
		e.setExtent(n[0], n[1]);
		var i = QS(t.splitNumber, 10), a = FS(e) / i, o = t.minInterval, s = t.maxInterval;
		o != null && a < o && (a = o), s != null && a > s && (a = s);
		var c = vC.length, l = Math.min(gC(vC, a, 0, c), c - 1), u = vC[l][1], d = vC[Math.max(l - 1, 0)][0];
		e.setTimeInterval({
			approxInterval: a,
			interval: u,
			minLevelUnit: d
		});
	}, CS.registerClass(_C);
})), xC, SC, CC, wC, TC, EC, DC, OC = M((() => {
	F(), wS(), oC(), eC(), Iv(), iC(), BS(), q(), Z(), Sl(), xC = 0, SC = 1, CC = 2, wC = function(e) {
		P(t, e);
		function t(n) {
			var r = e.call(this) || this;
			r.type = "log", r.parse = aC.parse, r.base = n.logBase || 10;
			var i = [], a = [], o = r._lookup = {
				from: i,
				to: a
			};
			i[xC] = i[SC] = a[xC] = a[SC] = NaN, AS(r, t.mapperMethods);
			var s = jv(), c = n.breakOption, l = { lookup: o };
			return s && s.parseAxisBreakOptionInwardTransform(c, r, { noNegative: !0 }, CC, l), r.powStub = new aC({ breakParsed: l.original }), r.intervalStub = new aC({ breakParsed: l.transformed }), jS(r, r.intervalStub), r;
		}
		return t.prototype.getTicks = function(e) {
			var t = this.base, n = this.powStub, r = jv(), i = this.intervalStub, a = { lookup: {
				from: i.getExtent(),
				to: n.getExtent()
			} };
			return z(i.getTicks(e || {}), function(e) {
				var i = e.value, o = YS(i, t, a), s;
				if (r) {
					var c = r.getTicksBreakOutwardTransform(this, e, Nv(n), this._lookup);
					c && (s = c.vBreak, o = c.tickVal);
				}
				return {
					value: o,
					break: s
				};
			}, this);
		}, t.prototype.getMinorTicks = function(e) {
			return rC(this, e, Nv(this.powStub), this.intervalStub.getConfig().interval);
		}, t.prototype.getLabel = function(e, t) {
			return this.intervalStub.getLabel(e, t);
		}, t.type = "log", t.mapperMethods = {
			needTransform: function() {
				return !0;
			},
			normalize: function(e) {
				return this.intervalStub.normalize(JS(e, this.base));
			},
			scale: function(e) {
				return YS(this.intervalStub.scale(e), this.base, null);
			},
			transformIn: function(e, t) {
				return e = JS(e, this.base), t && t.depth === 2 ? e : this.intervalStub.transformIn(e, t);
			},
			transformOut: function(e, t) {
				var n = t ? t.depth : null;
				return TC.depth = n, EC.lookup = this._lookup, YS(n === 2 ? e : this.intervalStub.transformOut(e, TC), this.base, EC);
			},
			contain: function(e) {
				return this.powStub.contain(e);
			},
			setExtent: function(e, t) {
				this.setExtent2(0, e, t);
			},
			setExtent2: function(e, t, n) {
				if (!(!vu(t, n) || t <= 0 || n <= 0)) {
					var r = DC, i = DC;
					if (e === 0) {
						var a = this._lookup;
						r = a.to, i = a.from;
					}
					this.powStub.setExtent2(e, r[xC] = t, r[SC] = n);
					var o = this.base;
					this.intervalStub.setExtent2(e, i[xC] = JS(t, o), i[SC] = JS(n, o));
				}
			},
			getFilter: function() {
				return { g: 0 };
			},
			sanitize: function(e, t) {
				return vu(t[0], t[1]) && al(e) && e <= 0 && (e = t[0]), e;
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
	}(CS), CS.registerClass(wC), TC = {}, EC = {}, DC = [];
})), kC, AC = M((() => {
	kC = {
		value: 1,
		category: 1,
		time: 1,
		log: 1
	};
}));
//#endregion
//#region node_modules/echarts/lib/coord/axisHelper.js
function jC(e) {
	var t = e.get("type");
	return (t == null || !jt(kC, t) && !CS.getClass(t)) && (t = "value"), t;
}
function MC(e, t, n) {
	var r = jv(), i;
	switch (r && (i = UC(e, t, n)), t) {
		case "category": return new tC({
			ordinalMeta: e.getOrdinalMeta ? e.getOrdinalMeta() : e.getCategories(),
			extent: fu()
		});
		case "time": return new _C({
			locale: e.ecModel.getLocaleModel(),
			useUTC: e.ecModel.get("useUTC"),
			breakOption: i
		});
		case "log": return new wC({
			logBase: e.get("logBase"),
			breakOption: i
		});
		case "value": return new aC({ breakOption: i });
		default: return new ((CS.getClass(t)) || aC)({});
	}
}
function NC(e, t, n) {
	var r = n ? NS(e, null) : e.getExtentUnsafe(0, null), i = r[0], a = r[1];
	return vu(i, a) ? i === t || a === t ? 2 : i < t && a > t ? 1 : 3 : 3;
}
function PC(e) {
	JC(e).noOnMyZero = !0;
}
function FC(e) {
	return JC(e).noOnMyZero;
}
function IC(e) {
	var t = e.getLabelModel().get("formatter");
	if (e.type === "time") {
		var n = Lv(t);
		return function(t, r) {
			return e.scale.getFormattedLabel(t, r, n);
		};
	}
	if (H(t)) return function(n) {
		var r = e.scale.getLabel(n);
		return t.replace("{value}", r ?? "");
	};
	if (V(t)) {
		if (e.type === "category") return function(n, r) {
			return t(LC(e, n), n.value - e.scale.getExtent()[0], null);
		};
		var r = jv();
		return function(n, i) {
			var a = null;
			return r && (a = r.makeAxisLabelFormatterParamBreak(a, n.break)), t(LC(e, n), i, a);
		};
	}
	return function(t) {
		return e.scale.getLabel(t);
	};
}
function LC(e, t) {
	var n = e.scale;
	return GS(n) ? n.getLabel(t) : t.value;
}
function RC(e) {
	return e.get("interval") ?? "auto";
}
function zC(e) {
	return e.type === "category" && RC(e.getLabelModel()) === 0;
}
function BC(e, t) {
	var n = {};
	return R(e.mapDimensionsAll(t), function(t) {
		n[B_(e, t)] = !0;
	}), ct(n);
}
function VC(e) {
	return e === "middle" || e === "center";
}
function HC(e) {
	return e.getShallow("show");
}
function UC(e, t, n) {
	var r = e.get("breaks", !0);
	if (r != null) {
		if (!jv()) {
			process.env.NODE_ENV !== "production" && El("Must `import {AxisBreak} from \"echarts/features.js\"; use(AxisBreak);` first if using breaks option.");
			return;
		}
		if (!n || !WC(t)) {
			process.env.NODE_ENV !== "production" && El("Axis" + (e instanceof Ky ? " " + e.type + "[" + e.componentIndex + "]" : "") + " does not support break.");
			return;
		}
		return r;
	}
}
function WC(e) {
	return e !== "category";
}
function GC(e, t, n, r, i, a) {
	var o = WS(e), s = o ? e.intervalStub : e;
	if (s.setExtent(r[0], r[1]), o) {
		var c = e.powStub, l = { depth: 2 }, u = e.transformOut(r[0], l), d = e.transformOut(r[1], l), f = ZS(n, r);
		t[0] && !f[0] && (u = i[0]), t[1] && !f[1] && (d = i[1]), c.setExtent(u, d);
	}
	s.setConfig(a);
}
function KC(e, t) {
	return GS(e) ? e.getRawOrdinalNumber(t.value) : t.value;
}
function qC(e, t) {
	return GS(e) && !!t.get("boundaryGap");
}
var JC, YC = M((() => {
	q(), nC(), oC(), wS(), bC(), OC(), AC(), V_(), yy(), Iv(), Pl(), eC(), Z(), BS(), qy(), JC = ru();
}));
//#endregion
//#region node_modules/echarts/lib/chart/line/LineView.js
function XC(e, t) {
	if (e.length === t.length) {
		for (var n = 0; n < e.length; n++) if (e[n] !== t[n]) return;
		return !0;
	}
}
function ZC(e) {
	for (var t = fu(), n = fu(), r = 0; r < e.length;) {
		var i = e[r++], a = e[r++];
		Vx(i, a) || (pu(t, i), pu(n, a));
	}
	return [t, n];
}
function QC(e, t) {
	var n = ZC(e), r = n[0], i = n[1], a = ZC(t), o = a[0], s = a[1];
	return Math.max(Math.abs(r[0] - o[0]), Math.abs(i[0] - s[0]), Math.abs(r[1] - o[1]), Math.abs(i[1] - s[1]));
}
function $C(e) {
	return ft(e) ? e : e ? .5 : 0;
}
function ew(e, t, n) {
	if (n.valueDim == null) return [];
	for (var r = t.count(), i = Ux(r * 2), a = 0; a < r; a++) {
		var o = Bx(n, e, t, a);
		i[a * 2] = o[0], i[a * 2 + 1] = o[1];
	}
	return i;
}
function tw(e, t, n, r, i) {
	var a = n.getBaseAxis(), o = a.dim === "x" || a.dim === "radius" ? 0 : 1, s = [], c = 0, l = [], u = [], d = [], f = [];
	if (i) {
		for (c = 0; c < e.length; c += 2) {
			var p = t || e;
			Vx(p[c], p[c + 1]) || f.push(e[c], e[c + 1]);
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
function nw(e, t) {
	var n = [], r = e.length, i, a;
	function o(e, t, n) {
		var r = e.coord;
		return {
			coord: n,
			color: va((n - r) / (t.coord - r), [e.color, t.color])
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
function rw(e, t, n) {
	var r = e.getVisual("visualMeta");
	if (r && r.length && e.count()) {
		if (t.type !== "cartesian2d") {
			process.env.NODE_ENV !== "production" && console.warn("Visual map on line style is only supported on cartesian2d.");
			return;
		}
		for (var i, a, o = r.length - 1; o >= 0; o--) {
			var s = e.getDimensionInfo(r[o].dimension);
			if (i = s && s.coordDim, i === "x" || i === "y") {
				a = r[o];
				break;
			}
		}
		if (!a) {
			process.env.NODE_ENV !== "production" && console.warn("Visual map on line style only support x or y dimension.");
			return;
		}
		var c = t.getAxis(i), l = z(a.stops, function(e) {
			return {
				coord: c.toGlobalCoord(c.dataToCoord(e.value)),
				color: e.color
			};
		}), u = l.length, d = a.outerColors.slice();
		u && l[0].coord > l[u - 1].coord && (l.reverse(), d.reverse());
		var f = nw(l, i === "x" ? n.getWidth() : n.getHeight()), p = f.length;
		if (!p && u) return l[0].coord < 0 ? d[1] ? d[1] : l[u - 1].color : d[0] ? d[0] : l[0].color;
		var m = 10, h = f[0].coord - m, g = f[p - 1].coord + m, _ = g - h;
		if (_ < .001) return "transparent";
		R(f, function(e) {
			e.offset = (e.coord - h) / _;
		}), f.push({
			offset: p ? f[p - 1].offset : .5,
			color: d[1] || "transparent"
		}), f.unshift({
			offset: p ? f[0].offset : .5,
			color: d[0] || "transparent"
		});
		var v = new Ap(0, 0, 0, 0, f, !0);
		return v[i] = h, v[i + "2"] = g, v;
	}
}
function iw(e, t, n) {
	var r = e.get("showAllSymbol"), i = r === "auto";
	if (!r || i) {
		var a = n.getAxesByScale("ordinal")[0];
		if (a && !(i && aw(a, t))) {
			var o = t.mapDimension(a.dim), s = {};
			return R(a.getViewLabels(), function(e) {
				e.tick.offInterval || (s[KC(a.scale, e.tick)] = 1);
			}), function(e) {
				return !s.hasOwnProperty(t.get(o, e));
			};
		}
	}
}
function aw(e, t) {
	var n = e.getExtent(), r = Math.abs(n[1] - n[0]) / e.scale.count();
	isNaN(r) && (r = 0);
	for (var i = t.count(), a = Math.max(1, Math.round(i / 5)), o = 0; o < i; o += a) if (Ax.getSymbolSize(t, o)[+!!e.isHorizontal()] * 1.5 > r) return !1;
	return !0;
}
function ow(e) {
	for (var t = e.length / 2; t > 0 && Vx(e[t * 2 - 2], e[t * 2 - 1]); t--);
	return t - 1;
}
function sw(e, t) {
	return [e[t * 2], e[t * 2 + 1]];
}
function cw(e, t, n) {
	for (var r = e.length / 2, i = n === "x" ? 0 : 1, a, o, s = 0, c = -1, l = 0; l < r; l++) if (o = e[l * 2 + i], !Vx(o, e[l * 2 + 1 - i])) {
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
function lw(e) {
	if (e.get(["endLabel", "show"])) return !0;
	for (var t = 0; t < Kd.length; t++) if (e.get([
		Kd[t],
		"endLabel",
		"show"
	])) return !0;
	return !1;
}
function uw(e, t, n, r) {
	if (vS(t, "cartesian2d")) {
		var i = r.getModel("endLabel"), a = i.get("valueAnimation"), o = r.getData(), s = { lastFrameIndex: 0 }, c = lw(r) ? function(n, r) {
			e._endLabelOnDuring(n, r, o, s, a, i, t);
		} : null, l = t.getBaseAxis().isHorizontal(), u = hS(t, n, r, function() {
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
	return process.env.NODE_ENV !== "production" && r.get(["endLabel", "show"]) && console.warn("endLabel is not supported for lines in polar systems."), gS(t, n, r);
}
function dw(e, t) {
	var n = t.getBaseAxis(), r = n.isHorizontal(), i = n.inverse, a = r ? i ? "right" : "left" : "center", o = r ? "middle" : i ? "top" : "bottom";
	return { normal: {
		align: e.get("align") || a,
		verticalAlign: e.get("verticalAlign") || o
	} };
}
var fw, pw = M((() => {
	F(), q(), Lx(), jx(), Yx(), $m(), Z(), rS(), mS(), Hx(), _S(), yS(), nf(), gh(), Ox(), Fu(), Kx(), ky(), SS(), Da(), YC(), fw = function(e) {
		P(t, e);
		function t() {
			return e !== null && e.apply(this, arguments) || this;
		}
		return t.prototype.init = function() {
			var e = new Of(), t = new Ix();
			this.group.add(t.group), this._symbolDraw = t, this._lineGroup = e, this._changePolyState = Kt(this._changePolyState, this);
		}, t.prototype.render = function(e, t, n) {
			var r = e.coordinateSystem, i = this.group, a = e.getData(), o = e.getModel("lineStyle"), s = e.getModel("areaStyle"), c = a.getLayout("points") || [], l = r.type === "polar", u = this._coordSys, d = this._symbolDraw, f = this._polyline, p = this._polygon, m = this._lineGroup, h = !t.ssr && e.get("animation"), g = !s.isEmpty(), _ = s.get("origin"), v = Rx(r, a, _), y = g && ew(r, a, v), b = e.get("showSymbol"), x = e.get("connectNulls"), S = b && !l && iw(e, a, r), C = this._data;
			C && C.eachItemGraphicEl(function(e, t) {
				e.__temp && (i.remove(e), C.setItemGraphicEl(t, null));
			}), b || d.remove(), i.add(m);
			var w = !l && e.get("step"), T;
			r && r.getArea && e.get("clip", !0) && (T = r.getArea(), T.width == null ? T.r0 && (T.r0 -= .5, T.r += .5) : (T.x -= .1, T.y -= .1, T.width += .2, T.height += .2)), this._clipShapeForSymbol = T;
			var E = rw(a, r, n) || a.getVisual("style")[a.getVisual("drawType")];
			if (!(f && u.type === r.type && w === this._step)) b && d.updateData(a, {
				isIgnore: S,
				clipShape: T,
				disableAnimation: !0,
				getSymbolPoint: function(e) {
					return [c[e * 2], c[e * 2 + 1]];
				}
			}), h && this._initSymbolLabelAnimation(a, r, T), w && (y &&= tw(y, c, r, w, x), c = tw(c, null, r, w, x)), f = this._newPolyline(c), g ? p = this._newPolygon(c, y) : p &&= (m.remove(p), this._polygon = null), l || this._initOrUpdateEndLabel(e, r, Ty(E)), m.setClipPath(uw(this, r, !0, e));
			else {
				g && !p ? p = this._newPolygon(c, y) : p && !g && (m.remove(p), p = this._polygon = null), l || this._initOrUpdateEndLabel(e, r, Ty(E));
				var D = m.getClipPath();
				D ? Zp(D, { shape: uw(this, r, !1, e).shape }, e) : m.setClipPath(uw(this, r, !0, e)), b && d.updateData(a, {
					isIgnore: S,
					clipShape: T,
					disableAnimation: !0,
					getSymbolPoint: function(e) {
						return [c[e * 2], c[e * 2 + 1]];
					}
				}), (!XC(this._stackedOnPoints, y) || !XC(this._points, c)) && (h ? this._doUpdateAnimation(a, y, r, n, w, _, x) : (w && (y &&= tw(y, c, r, w, x), c = tw(c, null, r, w, x)), f.setShape({ points: c }), p && p.setShape({
					points: c,
					stackedOnPoints: y
				})));
			}
			var O = e.getModel("emphasis"), k = O.get("focus"), A = O.get("blurScope"), j = O.get("disabled");
			if (f.useStyle(et(o.getLineStyle(), {
				fill: "none",
				stroke: E,
				lineJoin: "bevel"
			})), Fd(f, e, "lineStyle"), f.style.lineWidth > 0 && e.get([
				"emphasis",
				"lineStyle",
				"width"
			]) === "bolder") {
				var ee = f.getState("emphasis").style;
				ee.lineWidth = +f.style.lineWidth + 1;
			}
			Nu(f).seriesIndex = e.seriesIndex, Nd(f, k, A, j);
			var te = $C(e.get("smooth")), ne = e.get("smoothMonotone");
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
				})), re && (ie = $C(re.get("smooth"))), p.setShape({
					smooth: te,
					stackedOnSmooth: ie,
					smoothMonotone: ne,
					connectNulls: x
				}), Fd(p, e, "areaStyle"), Nu(p).seriesIndex = e.seriesIndex, Nd(p, k, A, j);
			}
			var ae = this._changePolyState;
			a.eachItemGraphicEl(function(e) {
				e && (e.onHoverStateChange = ae);
			}), this._polyline.onHoverStateChange = ae, this._data = a, this._coordSys = r, this._stackedOnPoints = y, this._points = c, this._step = w, this._valueOrigin = _;
			var oe = e.get("triggerEvent"), se = e.get("triggerLineEvent");
			process.env.NODE_ENV !== "production" && se && bS("triggerLineEvent", "Use the `triggerEvent` option instead.");
			var M = se === !0 || oe === !0 || oe === "line", ce = se === !0 || oe === !0 || oe === "area";
			this.packEventData(e, f, M), p && this.packEventData(e, p, ce);
		}, t.prototype.packEventData = function(e, t, n) {
			Nu(t).eventData = n ? {
				componentType: "series",
				componentSubType: "line",
				componentIndex: e.componentIndex,
				seriesIndex: e.seriesIndex,
				seriesName: e.name,
				seriesType: "line",
				selfType: t === this._polygon ? "area" : "line"
			} : null;
		}, t.prototype.highlight = function(e, t, n, r) {
			var i = e.getData(), a = nu(i, r);
			if (this._changePolyState("emphasis"), !(a instanceof Array) && a != null && a >= 0) {
				var o = i.getLayout("points"), s = i.getItemGraphicEl(a);
				if (!s) {
					var c = o[a * 2], l = o[a * 2 + 1];
					if (Vx(c, l) || this._clipShapeForSymbol && !this._clipShapeForSymbol.contain(c, l)) return;
					var u = e.get("zlevel") || 0, d = e.get("z") || 0;
					s = new Ax(i, a), s.x = c, s.y = l, s.setZ(u, d);
					var f = s.getSymbolPath().getTextContent();
					f && (f.zlevel = u, f.z = d, f.z2 = this._polyline.z2 + 1), s.__temp = !0, i.setItemGraphicEl(a, s), s.stopSymbolAnimation(!0), this.group.add(s);
				}
				s.highlight();
			} else fS.prototype.highlight.call(this, e, t, n, r);
		}, t.prototype.downplay = function(e, t, n, r) {
			var i = e.getData(), a = nu(i, r);
			if (this._changePolyState("normal"), a != null && a >= 0) {
				var o = i.getItemGraphicEl(a);
				o && (o.__temp ? (i.setItemGraphicEl(a, null), this.group.remove(o)) : o.downplay());
			} else fS.prototype.downplay.call(this, e, t, n, r);
		}, t.prototype._changePolyState = function(e) {
			var t = this._polygon;
			ad(this._polyline, e), t && ad(t, e);
		}, t.prototype._newPolyline = function(e) {
			var t = this._polyline;
			return t && this._lineGroup.remove(t), t = new eS({
				shape: { points: e },
				segmentIgnoreThreshold: 2,
				z2: 10
			}), this._lineGroup.add(t), this._polyline = t, t;
		}, t.prototype._newPolygon = function(e, t) {
			var n = this._polygon;
			return n && this._lineGroup.remove(n), n = new nS({
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
			V(c) && (c = c(null));
			var l = s.get("animationDelay") || 0, u = V(l) ? l(null) : l;
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
					var y = V(l) ? l(a) : c * v + u, b = s.getSymbolPath(), x = b.getTextContent();
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
			if (lw(e)) {
				var i = e.getData(), a = this._polyline, o = i.getLayout("points");
				if (!o) {
					a.removeTextContent(), this._endLabel = null;
					return;
				}
				var s = this._endLabel;
				s || (s = this._endLabel = new Nc({ z2: 200 }), s.ignoreClip = !0, a.setTextContent(this._endLabel), a.disableLabelAnimation = !0);
				var c = ow(o);
				c >= 0 && (nh(a, rh(e, "endLabel"), {
					inheritColor: n,
					labelFetcher: e,
					labelDataIndex: c,
					defaultText: function(e, t, n) {
						return n == null ? Ex(i, e) : Dx(i, n);
					},
					enableTextSetter: !0
				}, dw(r, t)), a.textConfig.position = null);
			} else this._endLabel &&= (this._polyline.removeTextContent(), null);
		}, t.prototype._endLabelOnDuring = function(e, t, n, r, i, a, o) {
			var s = this._endLabel, c = this._polyline;
			if (s) {
				e < 1 && r.originalX == null && (r.originalX = s.x, r.originalY = s.y);
				var l = n.getLayout("points"), u = n.hostModel, d = u.get("connectNulls"), f = a.get("precision"), p = a.get("distance") || 0, m = o.getBaseAxis(), h = m.isHorizontal(), g = m.inverse, _ = t.shape, v = g ? h ? _.x : _.y + _.height : h ? _.x + _.width : _.y, y = (h ? p : 0) * (g ? -1 : 1), b = (h ? 0 : -p) * (g ? -1 : 1), x = h ? "x" : "y", S = cw(l, v, x), C = S.range, w = C[1] - C[0], T = void 0;
				if (w >= 1) {
					if (w > 1 && !d) {
						var E = sw(l, C[0]);
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
						i && (T = du(n, f, D, O, S.t));
					}
					r.lastFrameIndex = C[0];
				} else {
					var k = e === 1 || r.lastFrameIndex > 0 ? C[0] : 0, E = sw(l, k);
					i && (T = u.getRawValue(k)), s.attr({
						x: E[0] + y,
						y: E[1] + b
					});
				}
				if (i) {
					var A = mh(s);
					typeof A.setLabelText == "function" && A.setLabelText(T);
				}
			}
		}, t.prototype._doUpdateAnimation = function(e, t, n, r, i, a, o) {
			var s = this._polyline, c = this._polygon, l = e.hostModel, u = Jx(this._data, e, this._stackedOnPoints, t, this._coordSys, n, this._valueOrigin, a), d = u.current, f = u.stackedOnCurrent, p = u.next, m = u.stackedOnNext;
			if (i && (f = tw(u.stackedOnCurrent, u.current, n, i, o), d = tw(u.current, null, n, i, o), m = tw(u.stackedOnNext, u.next, n, i, o), p = tw(u.next, null, n, i, o)), QC(d, p) > 3e3 || c && QC(f, m) > 3e3) {
				s.stopAnimation(), s.setShape({ points: p }), c && (c.stopAnimation(), c.setShape({
					points: p,
					stackedOnPoints: m
				}));
				return;
			}
			s.shape.__points = u.current, s.shape.points = d;
			var h = { shape: { points: p } };
			u.current !== d && (h.shape.__points = u.next), s.stopAnimation(), Xp(s, h, l), c && (c.setShape({
				points: d,
				stackedOnPoints: f
			}), c.stopAnimation(), Xp(c, { shape: { stackedOnPoints: m } }, l), s.shape.points !== c.shape.points && (c.shape.points = s.shape.points));
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
	}(fS);
}));
//#endregion
//#region node_modules/echarts/lib/layout/points.js
function mw(e, t) {
	return {
		seriesType: e,
		plan: iS(),
		reset: function(e) {
			var n = e.getData(), r = e.coordinateSystem, i = e.pipelineContext, a = t || i.large;
			if (r) {
				var o = z(r.dimensions, function(e) {
					return n.mapDimension(e);
				}).slice(0, 2), s = o.length, c = n.getCalculationInfo("stackResultDimension");
				z_(n, o[0]) && (o[0] = c), z_(n, o[1]) && (o[1] = c);
				var l = n.getStore(), u = n.getDimensionIndex(o[0]), d = n.getDimensionIndex(o[1]);
				return s && { progress: function(e, t) {
					for (var n = e.end - e.start, i = a && Ux(n * s), o = [], c = [], f = e.start, p = 0; f < e.end; f++) {
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
var hw = M((() => {
	q(), aS(), V_(), Kx();
}));
//#endregion
//#region node_modules/echarts/lib/processor/dataSample.js
function gw(e) {
	return {
		seriesType: e,
		reset: function(e, t, n) {
			var r = e.getData(), i = e.get("sampling"), a = e.coordinateSystem, o = r.count();
			if (o > 10 && a.type === "cartesian2d" && i) {
				var s = a.getBaseAxis(), c = a.getOtherAxis(s), l = s.getExtent(), u = n.getDevicePixelRatio(), d = Math.abs(l[1] - l[0]) * (u || 1), f = Math.round(o / d);
				if (isFinite(f) && f > 1) {
					i === "lttb" ? e.setData(r.lttbDownSample(r.mapDimension(c.dim), 1 / f)) : i === "minmax" && e.setData(r.minmaxDownSample(r.mapDimension(c.dim), 1 / f));
					var p = void 0;
					H(i) ? p = _w[i] : V(i) && (p = i), p && e.setData(r.downSample(r.mapDimension(c.dim), 1 / f, p, vw));
				}
			}
		}
	};
}
var _w, vw, yw = M((() => {
	q(), _w = {
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
	}, vw = function(e) {
		return Math.round(e.length / 2);
	};
}));
//#endregion
//#region node_modules/echarts/lib/chart/line/install.js
function bw(e) {
	e.registerChartView(fw), e.registerSeriesModel(Cx), e.registerLayout(mw("line", !0)), e.registerVisual({
		seriesType: "line",
		reset: function(e) {
			var t = e.getData(), n = e.getModel("lineStyle").getLineStyle();
			n && !n.stroke && (n.stroke = t.getVisual("style").fill), t.setVisual("legendLineStyle", n);
		}
	}), e.registerProcessor(e.PRIORITY.PROCESSOR.STATISTIC, gw("line"));
}
var xw = M((() => {
	Tx(), pw(), hw(), yw();
}));
//#endregion
//#region node_modules/echarts/lib/coord/axisTickLabelBuilder.js
function Sw(e) {
	return {
		out: { noPxChangeTryDetermine: [] },
		kind: e
	};
}
function Cw(e, t) {
	var n = e.getLabelModel().get("customValues");
	if (n) {
		var r = e.scale;
		return { labels: z(Tw(n, r), function(t, n) {
			return {
				formattedLabel: IC(e)(t, n),
				rawLabel: r.getLabel(t),
				tick: t
			};
		}) };
	}
	return e.type === "category" ? Ew(e, t) : kw(e);
}
function ww(e, t, n) {
	var r = e.scale, i = e.getTickModel().get("customValues");
	return i ? { ticks: Tw(i, r) } : e.type === "category" ? Ow(e, t) : { ticks: r.getTicks(n) };
}
function Tw(e, t) {
	var n = t.getExtent(), r = [];
	return R(e, function(e) {
		e = t.parse(e), e >= n[0] && e <= n[1] && r.push(e);
	}), Su(r, wu, null), Uc(r), z(r, function(e) {
		return { value: e };
	});
}
function Ew(e, t) {
	var n = e.getLabelModel(), r = Dw(e, n, t);
	return !n.get("show") || e.scale.isBlank() ? { labels: [] } : r;
}
function Dw(e, t, n) {
	var r = Uw(e), i = RC(t), a = n.kind === Vw.estimate;
	if (!a) {
		var o = jw(r, i);
		if (o) return o;
	}
	var s, c;
	V(i) ? s = Rw(e, i, !1) : (c = i === "auto" ? Nw(e, n) : i, s = Rw(e, c, !1));
	var l = {
		labels: s,
		labelCategoryInterval: c
	};
	return a ? n.out.noPxChangeTryDetermine.push(function() {
		return Mw(r, i, l), !0;
	}) : Mw(r, i, l), l;
}
function Ow(e, t) {
	var n = Hw(e), r = RC(t), i = jw(n, r);
	if (i) return i;
	var a, o;
	if ((!t.get("show") || e.scale.isBlank()) && (a = []), V(r)) a = Rw(e, r, !0);
	else if (r === "auto") {
		var s = Dw(e, e.getLabelModel(), Sw(Vw.determine));
		o = s.labelCategoryInterval, a = z(s.labels, function(e) {
			return e.tick;
		});
	} else o = r, a = Rw(e, o, !0);
	return Mw(n, r, {
		ticks: a,
		tickCategoryInterval: o
	});
}
function kw(e) {
	var t = e.scale.getTicks(), n = IC(e);
	return { labels: z(t, function(t, r) {
		return {
			formattedLabel: n(t, r),
			rawLabel: e.scale.getLabel(t),
			tick: t
		};
	}) };
}
function Aw(e) {
	return function(t) {
		return Bw(t)[e] || (Bw(t)[e] = { list: [] });
	};
}
function jw(e, t) {
	for (var n = 0; n < e.list.length; n++) if (e.list[n].key === t) return e.list[n].value;
}
function Mw(e, t, n) {
	return e.list.push({
		key: t,
		value: n
	}), n;
}
function Nw(e, t) {
	if (t.kind === Vw.estimate) {
		var n = e.calculateCategoryInterval(t);
		return t.out.noPxChangeTryDetermine.push(function() {
			return Bw(e).autoInterval = n, !0;
		}), n;
	}
	return Bw(e).autoInterval ?? (Bw(e).autoInterval = e.calculateCategoryInterval(t));
}
function Pw(e, t) {
	var n = t.kind, r = Lw(e), i = IC(e), a = (r.axisRotate - r.labelRotate) / 180 * Math.PI, o = e.scale, s = o.getExtent(), c = o.count();
	if (s[1] - s[0] < 1) return 0;
	var l = 1, u = 40;
	c > u && (l = Math.max(1, Math.floor(c / u)));
	for (var d = s[0], f = e.dataToCoord(d + 1) - e.dataToCoord(d), p = Math.abs(f * Math.cos(a)), m = Math.abs(f * Math.sin(a)), h = 0, g = 0; d <= s[1]; d += l) {
		var _ = 0, v = 0, y = Pr(i({ value: d }), r.font, "center", "top");
		_ = y.width * 1.3, v = y.height * 1.3, h = Math.max(h, _, 7), g = Math.max(g, v, 7);
	}
	var b = h / p, x = g / m;
	isNaN(b) && (b = Infinity), isNaN(x) && (x = Infinity);
	var S = Math.max(0, Math.floor(Math.min(b, x)));
	return n === Vw.estimate ? (t.out.noPxChangeTryDetermine.push(Kt(Fw, null, e, S, c)), S) : Iw(e, S, c) ?? S;
}
function Fw(e, t, n) {
	return Iw(e, t, n) == null;
}
function Iw(e, t, n) {
	var r = zw(e.model), i = e.getExtent(), a = r.lastAutoInterval, o = r.lastTickCount;
	if (a != null && o != null && Math.abs(a - t) <= 1 && Math.abs(o - n) <= 1 && a > t && r.axisExtent0 === i[0] && r.axisExtent1 === i[1]) return a;
	r.lastTickCount = n, r.lastAutoInterval = t, r.axisExtent0 = i[0], r.axisExtent1 = i[1];
}
function Lw(e) {
	var t = e.getLabelModel();
	return {
		axisRotate: e.getRotate ? e.getRotate() : e.isHorizontal && !e.isHorizontal() ? 90 : 0,
		labelRotate: t.get("rotate") || 0,
		font: t.getFont()
	};
}
function Rw(e, t, n) {
	var r = IC(e), i = e.scale, a = [], o = V(t);
	return $S(i, o ? 0 : t, function(e, s) {
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
var zw, Bw, Vw, Hw, Uw, Ww = M((() => {
	q(), Ur(), Z(), YC(), Sl(), eC(), zw = ru(), Bw = ru(), Vw = {
		estimate: 1,
		determine: 2
	}, Hw = Aw("axisTick"), Uw = Aw("axisLabel");
}));
//#endregion
//#region node_modules/echarts/lib/util/cycleCache.js
function Gw(e) {
	Jw(e).prepare = {};
}
function Kw(e) {
	Jw(e).fullUpdate = {};
}
function qw(e) {
	return Jw(e).fullUpdate;
}
var Jw, Yw = M((() => {
	Z(), Jw = ru();
}));
//#endregion
//#region node_modules/echarts/lib/coord/axisStatistics.js
function Xw(e, t) {
	var n = e.model, r = oT(qw(n.ecModel)).keyed, i = r && r.get(t);
	return i && i.get(n.uid);
}
function Zw(e, t) {
	return process.env.NODE_ENV !== "production" && (G(t != null), sT(e)), eT(Xw(e, t));
}
function Qw(e, t) {
	process.env.NODE_ENV !== "production" && sT(e);
	var n = [];
	return $w(e.model.ecModel, function(e) {
		for (var r = 0; r < t.length; r++) t[r] && e.serByIdx[t[r].seriesIndex] && n.push(eT(e));
	}), n;
}
function $w(e, t) {
	var n = oT(qw(e)).keyed;
	n && n.each(function(e, n) {
		e.each(function(e, r) {
			t(e, n, r);
		});
	});
}
function eT(e) {
	return { liPosMinGap: e ? e.liPosMinGap : void 0 };
}
function tT(e, t) {
	process.env.NODE_ENV !== "production" && sT(e);
	var n = e.model.ecModel, r = oT(qw(n)).axSer;
	r && nT(n, r.get(e.model.uid), t);
}
function nT(e, t, n) {
	if (t) for (var r = 0; r < t.length; r++) {
		var i = t[r];
		e.isSeriesFiltered(i) || n(i);
	}
}
function rT(e, t) {
	process.env.NODE_ENV !== "production" && sT(e);
	var n = e.model, r = oT(qw(n.ecModel)).keys;
	r && R(r.get(n.uid), function(n) {
		if (process.env.NODE_ENV !== "production") {
			var r = Xw(e, n);
			G(r && r.sers.length > 0);
		}
		t(n);
	});
}
function iT(e, t, n) {
	if (e) {
		var r = t.ecModel, i = oT(qw(r)), a = e.model.uid;
		if (process.env.NODE_ENV !== "production") {
			sT(e);
			var o = i.axSerPairCheck ||= K(), s = "" + a + "|&" + t.uid;
			G(!o.get(s)), o.set(s, 1);
		}
		var c = i.axSer ||= K(), l = c.get(a) || c.set(a, []);
		if (process.env.NODE_ENV !== "production") {
			var u = l[l.length - 1];
			u && G(u.seriesIndex < t.seriesIndex);
		}
		l.push(t);
		var d = t.subType, f = t.getBaseAxis() === e, p = cT.get(aT(d, f, n)) || cT.get(aT(d, f, null));
		if (p) {
			var m = i.keyed ||= K(), h = i.keys ||= K(), g = p.key, _ = m.get(g) || m.set(g, K()), v = _.get(a);
			v || (v = _.set(a, {
				axis: e,
				sers: [],
				serByIdx: []
			}), v.metrics = p.getMetrics(e), (h.get(a) || h.set(a, [])).push(g)), v.sers.push(t), v.serByIdx[t.seriesIndex] = t;
		}
	}
}
function aT(e, t, n) {
	return e + "|&" + W(t, !0) + "|&" + (n || "");
}
var oT, sT, cT, lT = M((() => {
	q(), Z(), Yw(), xu(), oT = ru(), ru(), process.env.NODE_ENV !== "production" && (sT = function(e) {
		G(e && e.model && e.model.uid && e.model.ecModel);
	}), process.env.NODE_ENV !== "production" && K(), cT = K();
}));
//#endregion
//#region node_modules/echarts/lib/coord/axisBand.js
function uT(e, t) {
	t ||= {};
	var n = {
		w: NaN,
		w2: NaN
	}, r = e.scale, i = t.fromStat, a = t.min, o = PS(r);
	al(o) || (o = NaN);
	var s = e.getExtent(), c = ul(s[1] - s[0]);
	return GS(r) ? dT(n, e, o, c) : i ? fT(n, e, o, c, i) : a == null && process.env.NODE_ENV !== "production" && G(!1), a != null && (n.w = al(n.w) ? ll(a, n.w) : a), n;
}
function dT(e, t, n, r) {
	var i = t.onBand, a = n + +!!i;
	a === 0 && (a = 1), e.w = r / a, !i && n && r && (e.w2 = e.w * n / r);
}
function fT(e, t, n, r, i) {
	process.env.NODE_ENV !== "production" && G(i);
	var a = !1, o = -Infinity;
	R(i.key ? [Zw(t, i.key)] : Qw(t, i.sers || []), function(e) {
		var t = e.liPosMinGap;
		t != null && (t > 0 ? (t > o && (o = t), a = !1) : t === -2 && (a = !0));
	}), al(n) && n > 0 && al(o) ? (e.w = r / n * o, e.w2 = o) : a && (e.w = r * pT, e.w2 = e.w * n / r);
}
var pT, mT = M((() => {
	q(), eC(), Sl(), lT(), BS(), pT = .8;
}));
//#endregion
//#region node_modules/echarts/lib/coord/Axis.js
function hT(e) {
	var t = e.getExtent();
	if (e.onBand) {
		var n = (t[1] - t[0]) / e.scale.count() / 2;
		t[0] += n, t[1] -= n;
	}
	return t;
}
function gT(e, t, n) {
	var r = t.length;
	if (!e.onBand || n || !r) return !1;
	var i = uT(e).w;
	if (!i) return !1;
	R(t, function(e) {
		e.coord -= i / 2;
	});
	var a = e.scale.getExtent(), o = t[r - 1];
	return o.tick.offInterval && t.pop(), t.push({
		coord: o.coord + i,
		tick: { value: a[1] + 1 }
	}), !0;
}
var _T, vT, yT = M((() => {
	q(), Sl(), Ww(), eC(), mT(), YC(), _T = [0, 1], vT = function() {
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
			return e = n.normalize(n.parse(e)), zc(e, _T, hT(this), t);
		}, e.prototype.coordToData = function(e, t) {
			var n = zc(e, hT(this), _T, t);
			return this.scale.scale(n);
		}, e.prototype.pointToData = function(e, t) {}, e.prototype.getTicksCoords = function(e) {
			e ||= {};
			var t = e.tickModel || this.getTickModel(), n = z(ww(this, t, {
				breakTicks: e.breakTicks,
				pruneByBreak: e.pruneByBreak
			}).ticks, function(e) {
				return {
					coord: this.dataToCoord(KC(this.scale, e)),
					tick: e
				};
			}, this), r = t.get("alignWithLabel"), i = gT(this, n, r);
			return z(n, function(e) {
				return {
					coord: e.coord,
					tickValue: e.tick.value,
					onBand: i
				};
			});
		}, e.prototype.getMinorTicksCoords = function() {
			if (GS(this.scale)) return [];
			var e = this.model.getModel("minorTick").get("splitNumber");
			return e > 0 && e < 100 || (e = 5), z(this.scale.getMinorTicks(e), function(e) {
				return z(e, function(e) {
					return {
						coord: this.dataToCoord(e),
						tickValue: e
					};
				}, this);
			}, this);
		}, e.prototype.getViewLabels = function(e) {
			return e ||= Sw(Vw.determine), Cw(this, e).labels;
		}, e.prototype.getLabelModel = function() {
			return this.model.getModel("axisLabel");
		}, e.prototype.getTickModel = function() {
			return this.model.getModel("axisTick");
		}, e.prototype.getBandWidth = function() {
			return uT(this, { min: 1 }).w;
		}, e.prototype.calculateCategoryInterval = function(e) {
			return e ||= Sw(Vw.determine), Pw(this, e);
		}, e;
	}();
})), bT, xT = M((() => {
	F(), yT(), bT = function(e) {
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
	}(vT);
}));
//#endregion
//#region node_modules/echarts/lib/label/labelLayoutHelper.js
function ST(e, t, n) {
	n ||= FT, t ? e.dirty |= n : e.dirty &= ~n;
}
function CT(e, t) {
	return t ||= FT, e.dirty == null || !!(e.dirty & t);
}
function wT(e) {
	if (e) return CT(e) && TT(e, e.label, e), e;
}
function TT(e, t, n) {
	var r = t.getComputedTransform();
	e.transform = Im(e.transform, r);
	var i = e.localRect = Fm(e.localRect, t.getBoundingRect()), a = t.style, o = a.margin, s = n && n.marginForce, c = n && n.minMarginForce, l = n && n.marginDefault, u = a.__marginType;
	u == null && l && (o = l, u = hh.textMargin);
	for (var d = 0; d < 4; d++) IT[d] = u === hh.minMargin && c && c[d] != null ? c[d] : s && s[d] != null ? s[d] : o ? o[d] : 0;
	u === hh.textMargin && km(i, IT, !1, !1);
	var f = e.rect = Fm(e.rect, i);
	return r && f.applyTransform(r), u === hh.minMargin && km(f, IT, !1, !1), e.axisAligned = Pm(r), (e.label = e.label || {}).ignore = t.ignore, ST(e, !1), ST(e, !0, PT), e;
}
function ET(e, t, n) {
	return e.transform = Im(e.transform, n), e.localRect = Fm(e.localRect, t), e.rect = Fm(e.rect, t), n && e.rect.applyTransform(n), e.axisAligned = Pm(n), e.obb = void 0, (e.label = e.label || {}).ignore = !1, e;
}
function DT(e, t) {
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
function OT(e, t) {
	for (var n = 0; n < MT.length; n++) {
		var r = MT[n];
		e[r] ?? (e[r] = t[r]);
	}
	return wT(e);
}
function kT(e) {
	var t = e.obb;
	return (!t || CT(e, PT)) && (e.obb = t ||= new Hp(), t.fromBoundingRect(e.localRect, e.transform), ST(e, !1, PT)), t;
}
function AT(e) {
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
		var i = wT(e[r]);
		if (!i.label.ignore) {
			for (var a = i.label, o = i.labelLine, s = !1, c = 0; c < t.length; c++) if (jT(i, t[c], null, { touchThreshold: .05 })) {
				s = !0;
				break;
			}
			s ? (n(a), o && n(o)) : t.push(i);
		}
	}
}
function jT(e, t, n, r) {
	return !e || !t || e.label && e.label.ignore || t.label && t.label.ignore || !e.rect.intersect(t.rect, n, r) ? !1 : e.axisAligned && t.axisAligned ? !0 : kT(e).intersect(kT(t), n, r);
}
var MT, NT, PT, FT, IT, LT = M((() => {
	$m(), gh(), MT = [
		"label",
		"labelLine",
		"layoutOption",
		"priority",
		"defaultAttr",
		"marginForce",
		"minMarginForce",
		"marginDefault",
		"suggestIgnore"
	], NT = 1, PT = 2, FT = NT | PT, IT = [
		0,
		0,
		0,
		0
	];
}));
//#endregion
//#region node_modules/echarts/lib/component/axis/axisBreakHelper.js
function RT() {
	return zT;
}
var zT, BT = M((() => {
	zT = null;
})), VT, HT = M((() => {
	VT = "expandAxisBreak";
}));
//#endregion
//#region node_modules/echarts/lib/component/axis/AxisBuilder.js
function UT(e, t, n, r) {
	var i = n.axis, a = t.ensureRecord(n), o = [], s, c = aE(e.axisName) && VC(e.nameLocation);
	R(r, function(e) {
		var t = wT(e);
		if (t && !t.label.ignore) {
			o.push(t);
			var n = a.transGroup;
			c && (n.transform ? Bn(mE, n.transform) : Pn(mE), t.transform && In(mE, mE, t.transform), Y.copy(hE, t.localRect), hE.applyTransform(mE), s ? s.union(hE) : Y.copy(s = new Y(0, 0, 0, 0), hE));
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
function WT(e, t, n) {
	var r = new ar();
	jT(e, t, r, {
		direction: Math.atan2(n.y, n.x),
		bidirectional: !1,
		touchThreshold: .05
	}) && DT(t, r);
}
function GT(e, t, n, r) {
	for (var i = ar.dot(r, t) >= 0, a = 0, o = e.length; a < o; a++) {
		var s = e[i ? a : o - 1 - a];
		s.label.ignore || WT(s, n, r);
	}
}
function KT(e, t, n, r, i, a, o, s) {
	nE(t) || tE(e, t, i, s, r, o);
	var c = t.labelLayoutList;
	iE(e, r, c, a), sE(r, e.rotation, c);
	var l = e.optionHideOverlap;
	JT(r, c, l), l && AT(ot(c, function(e) {
		return e && !e.label.ignore;
	})), UT(e, n, r, c);
}
function qT(e, t, n, r) {
	var i = Jc(n - e), a, o, s = r[0] > r[1], c = t === "start" && !s || t !== "start" && s;
	return Yc(i - cE / 2) ? (o = c ? "bottom" : "top", a = "center") : Yc(i - cE * 1.5) ? (o = c ? "top" : "bottom", a = "center") : (o = "middle", a = i < cE * 1.5 && i > cE / 2 ? c ? "left" : "right" : c ? "right" : "left"), {
		rotation: i,
		textAlign: a,
		textVerticalAlign: o
	};
}
function JT(e, t, n) {
	var r = e.axis, i = e.get(["axisLabel", "customValues"]);
	if (zC(r)) return;
	function a(e, a, o) {
		var s = wT(t[a]), c = wT(t[o]), l = r.scale;
		if (s && c) {
			if (e == null) {
				if (!n && i) return;
				var u = dE(s.label).labelInfo.tick;
				if (US(l) && u.notNice || GS(l) && u.offInterval) {
					XT(s.label);
					return;
				}
			}
			if (e === !1 || s.suggestIgnore) {
				XT(s.label);
				return;
			}
			if (c.suggestIgnore) {
				XT(c.label);
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
				s = OT({ marginForce: f }, s), c = OT({ marginForce: f }, c);
			}
			jT(s, c, null, { touchThreshold: d }) && XT(e ? c.label : s.label);
		}
	}
	var o = e.get(["axisLabel", "showMinLabel"]), s = e.get(["axisLabel", "showMaxLabel"]), c = t.length;
	a(o, 0, 1), a(s, c - 1, c - 2);
}
function YT(e, t, n) {
	e.showMinorTicks || R(t, function(e) {
		if (e && e.label.ignore) for (var t = 0; t < n.length; t++) {
			var r = n[t], i = fE(r), a = dE(e.label);
			if (i.tickValue != null && !i.onBand && i.tickValue === a.labelInfo.tick.value) {
				XT(r);
				return;
			}
		}
	});
}
function XT(e) {
	e && (e.ignore = !0);
}
function ZT(e, t, n, r, i) {
	for (var a = [], o = [], s = [], c = 0; c < e.length; c++) {
		var l = e[c].coord;
		o[0] = l, o[1] = 0, s[0] = l, s[1] = n, t && ($n(o, o, t), $n(s, s, t));
		var u = new gp({
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
		mm(u.shape, u.style.lineWidth), u.anid = i + "_" + e[c].tickValue, a.push(u);
		var d = fE(u);
		d.onBand = !!e[c].onBand, d.tickValue = e[c].tickValue;
	}
	return a;
}
function QT(e, t, n, r) {
	var i = r.axis, a = r.getModel("axisTick"), o = a.get("show");
	if (o === "auto" && (o = !0, e.raw.axisTickAutoShow != null && (o = !!e.raw.axisTickAutoShow)), !o || i.scale.isBlank()) return [];
	for (var s = a.getModel("lineStyle"), c = e.tickDirection * a.get("length"), l = ZT(i.getTicksCoords(), n.transform, c, et(s.getLineStyle(), { stroke: r.get([
		"axisLine",
		"lineStyle",
		"color"
	]) }), "ticks"), u = 0; u < l.length; u++) t.add(l[u]);
	return l;
}
function $T(e, t, n, r, i) {
	var a = r.axis, o = r.getModel("minorTick");
	if (e.showMinorTicks && !a.scale.isBlank()) {
		var s = a.getMinorTicksCoords();
		if (s.length) for (var c = o.getModel("lineStyle"), l = i * o.get("length"), u = et(c.getLineStyle(), et(r.getModel("axisTick").getLineStyle(), { stroke: r.get([
			"axisLine",
			"lineStyle",
			"color"
		]) })), d = 0; d < s.length; d++) for (var f = ZT(s[d], n.transform, l, u, "minorticks_" + d), p = 0; p < f.length; p++) t.add(f[p]);
	}
}
function eE(e, t, n) {
	if (nE(e)) {
		var r = e.axisLabelsCreationContext;
		process.env.NODE_ENV !== "production" && G(e.labelGroup && r);
		var i = r.out.noPxChangeTryDetermine;
		if (n.noPxChange) {
			for (var a = !0, o = 0; o < i.length; o++) a &&= i[o]();
			if (a) return !1;
		}
		i.length && (t.remove(e.labelGroup), rE(e, null, null, null));
	}
	return !0;
}
function tE(e, t, n, r, i, a) {
	var o = i.axis, s = bt(e.raw.axisLabelShow, i.get(["axisLabel", "show"])), c = new Of();
	n.add(c);
	var l = Sw(r);
	if (!s || o.scale.isBlank()) {
		rE(t, [], c, l);
		return;
	}
	var u = i.getModel("axisLabel"), d = o.getViewLabels(l), f = (bt(e.raw.labelRotate, u.get("rotate")) || 0) * cE / 180, p = _E.innerTextLayout(e.rotation, f, e.labelDirection), m = i.getCategories && i.getCategories(!0), h = [], g = i.get("triggerEvent"), _ = Infinity, v = -Infinity;
	R(d, function(e, t) {
		var n = e.tick, r = e.formattedLabel, s = e.rawLabel, l = u, f = KC(o.scale, n);
		if (m && m[f]) {
			var y = m[f];
			U(y) && y.textStyle && (l = new Ah(y.textStyle, u, i.ecModel));
		}
		var b = l.getTextColor() || i.get([
			"axisLine",
			"lineStyle",
			"color"
		]), x = l.getShallow("align", !0) || p.textAlign, S = W(l.getShallow("alignMinLabel", !0), x), C = W(l.getShallow("alignMaxLabel", !0), x), w = l.getShallow("verticalAlign", !0) || l.getShallow("baseline", !0) || p.textVerticalAlign, T = W(l.getShallow("verticalAlignMinLabel", !0), w), E = W(l.getShallow("verticalAlignMaxLabel", !0), w), D = 10 + (n.time?.level || 0);
		_ = Math.min(_, D), v = Math.max(v, D);
		var O = new Nc({
			x: 0,
			y: 0,
			rotation: 0,
			silent: _E.isLabelSilent(i),
			z2: D,
			style: ih(l, {
				text: r,
				align: t === 0 ? S : t === d.length - 1 ? C : x,
				verticalAlign: t === 0 ? T : t === d.length - 1 ? E : w,
				fill: V(b) ? b(o.type === "category" ? s : o.type === "value" ? f + "" : f, t) : b
			})
		});
		O.anid = "label_" + f;
		var k = dE(O);
		if (k.labelInfo = e, k.layoutRotation = p.rotation, jm({
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
			var A = _E.makeAxisEventDataBase(i);
			A.targetType = "axisLabel", A.value = s, A.tickIndex = t;
			var j = e.tick.break;
			if (j) {
				var ee = j.parsedBreak;
				A.break = {
					start: ee.vmin,
					end: ee.vmax
				};
			}
			o.type === "category" && (A.dataIndex = f), Nu(O).eventData = A, j && oE(i, a, O, j);
		}
		h.push(O), c.add(O);
	}), rE(t, z(h, function(e) {
		return {
			label: e,
			priority: dE(e).labelInfo.tick.break ? e.z2 + (v - _ + 1) : e.z2,
			defaultAttr: { ignore: e.ignore }
		};
	}), c, l);
}
function nE(e) {
	return !!e.labelLayoutList;
}
function rE(e, t, n, r) {
	e.labelLayoutList = t, e.labelGroup = n, e.axisLabelsCreationContext = r;
}
function iE(e, t, n, r) {
	var i = t.get(["axisLabel", "margin"]);
	R(n, function(n, a) {
		var o = wT(n);
		if (o) {
			var s = o.label, c = dE(s);
			o.suggestIgnore = s.ignore, s.ignore = !1, mi(bE, xE);
			var l = t.axis;
			bE.x = l.dataToCoord(KC(l.scale, c.labelInfo.tick)), bE.y = e.labelOffset + e.labelDirection * i, bE.rotation = c.layoutRotation, r.add(bE), bE.updateTransform(), r.remove(bE), bE.decomposeTransform(), mi(s, bE), s.markRedraw(), ST(o, !0), wT(o);
		}
	});
}
function aE(e) {
	return !!e;
}
function oE(e, t, n, r) {
	n.on("click", function(n) {
		var i = {
			type: VT,
			breaks: [{
				start: r.parsedBreak.breakOption.start,
				end: r.parsedBreak.breakOption.end
			}]
		};
		i[e.axis.dim + "AxisIndex"] = e.componentIndex, t.dispatchAction(i);
	});
}
function sE(e, t, n) {
	var r = jv();
	if (r) {
		var i = r.retrieveAxisBreakPairs(n, function(e) {
			return e && dE(e.label).labelInfo.tick.break;
		}, !0), a = e.get(["breakLabelLayout", "moveOverlap"], !0);
		(a === !0 || a === "auto") && R(i, function(r) {
			RT().adjustBreakLabelPair(e.axis.inverse, t, [wT(n[r[0]]), wT(n[r[1]])]);
		});
	}
}
var cE, lE, uE, dE, fE, pE, mE, hE, gE, _E, vE, yE, bE, xE, SE = M((() => {
	q(), $m(), Fu(), gh(), jh(), Sl(), Sx(), Vn(), ir(), YC(), LT(), Z(), BT(), HT(), Iv(), Or(), or(), wi(), Ww(), eC(), cE = Math.PI, lE = [
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
	], uE = [
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
	], dE = ru(), fE = ru(), pE = function() {
		function e(e) {
			this.recordMap = {}, this.resolveAxisNameOverlap = e;
		}
		return e.prototype.ensureRecord = function(e) {
			var t = e.axis.dim, n = e.componentIndex, r = this.recordMap, i = r[t] || (r[t] = []);
			return i[n] || (i[n] = { ready: {} });
		}, e;
	}(), mE = Nn(), hE = new Y(0, 0, 0, 0), gE = function(e, t, n, r, i, a) {
		if (VC(e.nameLocation)) {
			var o = a.stOccupiedRect;
			o && WT(ET({}, o, a.transGroup.transform), r, i);
		} else GT(a.labelInfoList, a.dirVec, r, i);
	}, _E = function() {
		function e(e, t, n, r) {
			this.group = new Of(), this._axisModel = e, this._api = t, this._local = {}, this._shared = r || new pE(gE), this._resetCfgDetermined(n);
		}
		return e.prototype.updateCfg = function(e) {
			if (process.env.NODE_ENV !== "production") {
				var t = this._shared.ensureRecord(this._axisModel).ready;
				G(!t.axisLine && !t.axisTickLabelDetermine), t.axisName = t.axisTickLabelEstimate = !1;
			}
			var n = this._cfg.raw;
			n.position = e.position, n.labelOffset = e.labelOffset, this._resetCfgDetermined(n);
		}, e.prototype.__getRawCfg = function() {
			return this._cfg.raw;
		}, e.prototype._resetCfgDetermined = function(e) {
			var t = this._axisModel, n = t.getDefaultOption ? t.getDefaultOption() : {}, r = W(e.axisName, t.get("name")), i = t.get("nameMoveOverlap");
			(i == null || i === "auto") && (i = W(e.defaultNameMoveOverlap, !0));
			var a = {
				raw: e,
				position: e.position,
				rotation: e.rotation,
				nameDirection: W(e.nameDirection, 1),
				tickDirection: W(e.tickDirection, 1),
				labelDirection: W(e.labelDirection, 1),
				labelOffset: W(e.labelOffset, 0),
				silent: W(e.silent, !0),
				axisName: r,
				nameLocation: xt(t.get("nameLocation"), n.nameLocation, "end"),
				shouldNameMoveOverlap: aE(r) && i,
				optionHideOverlap: t.get(["axisLabel", "hideOverlap"]),
				showMinorTicks: t.get(["minorTick", "show"])
			};
			process.env.NODE_ENV !== "production" && (G(a.position != null), G(a.rotation != null)), this._cfg = a;
			var o = new Of({
				x: a.position[0],
				y: a.position[1],
				rotation: a.rotation
			});
			o.updateTransform(), this._transformGroup = o;
			var s = this._shared.ensureRecord(t);
			s.transGroup = this._transformGroup, s.dirVec = new ar(Math.cos(-a.rotation), Math.sin(-a.rotation));
		}, e.prototype.build = function(e, t) {
			var n = this;
			return e ||= {
				axisLine: !0,
				axisTickLabelEstimate: !1,
				axisTickLabelDetermine: !0,
				axisName: !0
			}, R(vE, function(r) {
				e[r] && yE[r](n._cfg, n._local, n._shared, n._axisModel, n.group, n._transformGroup, n._api, t || {});
			}), this;
		}, e.innerTextLayout = function(e, t, n) {
			var r = Jc(t - e), i, a;
			return Yc(r) ? (a = n > 0 ? "top" : "bottom", i = "center") : Yc(r - cE) ? (a = n > 0 ? "bottom" : "top", i = "center") : (a = "middle", i = r > 0 && r < cE ? n > 0 ? "right" : "left" : n > 0 ? "left" : "right"), {
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
	}(), vE = [
		"axisLine",
		"axisTickLabelEstimate",
		"axisTickLabelDetermine",
		"axisName"
	], yE = {
		axisLine: function(e, t, n, r, i, a, o) {
			if (process.env.NODE_ENV !== "production") {
				var s = n.ensureRecord(r).ready;
				G(!s.axisLine), s.axisLine = !0;
			}
			var c = r.get(["axisLine", "show"]);
			if (c === "auto" && (c = !0, e.raw.axisLineAutoShow != null && (c = !!e.raw.axisLineAutoShow)), c) {
				var l = r.axis.getExtent(), u = a.transform, d = [l[0], 0], f = [l[1], 0], p = d[0] > f[0];
				u && ($n(d, d, u), $n(f, f, u));
				var m = L({ lineCap: "round" }, r.getModel(["axisLine", "lineStyle"]).getLineStyle()), h = {
					strokeContainThreshold: e.raw.strokeContainThreshold || 5,
					silent: !0,
					z2: 1,
					style: m
				};
				if (r.get(["axisLine", "breakLine"]) && Pv(r.axis.scale)) RT().buildAxisBreakLine(r, i, a, h);
				else {
					var g = new gp(L({ shape: {
						x1: d[0],
						y1: d[1],
						x2: f[0],
						y2: f[1]
					} }, h));
					mm(g.shape, g.style.lineWidth), g.anid = "line", i.add(g);
				}
				var _ = r.get(["axisLine", "symbol"]);
				if (_ != null) {
					var v = r.get(["axisLine", "symbolSize"]);
					H(_) && (_ = [_, _]), (H(v) || ft(v)) && (v = [v, v]);
					var y = px(r.get(["axisLine", "symbolOffset"]) || 0, v), b = v[0], x = v[1];
					R([{
						rotate: e.rotation + Math.PI / 2,
						offset: y[0],
						r: 0
					}, {
						rotate: e.rotation - Math.PI / 2,
						offset: y[1],
						r: Math.sqrt((d[0] - f[0]) * (d[0] - f[0]) + (d[1] - f[1]) * (d[1] - f[1]))
					}], function(t, n) {
						if (_[n] !== "none" && _[n] != null) {
							var r = dx(_[n], -b / 2, -x / 2, b, x, m.stroke, !0), a = t.r + t.offset, o = p ? f : d;
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
			if (process.env.NODE_ENV !== "production") {
				var c = n.ensureRecord(r).ready;
				G(!c.axisTickLabelDetermine), c.axisTickLabelEstimate = !0;
			}
			eE(t, i, s) && KT(e, t, n, r, i, a, o, Vw.estimate);
		},
		axisTickLabelDetermine: function(e, t, n, r, i, a, o, s) {
			if (process.env.NODE_ENV !== "production") {
				var c = n.ensureRecord(r).ready;
				c.axisTickLabelDetermine = !0;
			}
			eE(t, i, s) && KT(e, t, n, r, i, a, o, Vw.determine);
			var l = QT(e, i, a, r);
			YT(e, t.labelLayoutList, l), $T(e, i, a, r, e.tickDirection);
		},
		axisName: function(e, t, n, r, i, a, o, s) {
			var c = n.ensureRecord(r);
			if (process.env.NODE_ENV !== "production") {
				var l = c.ready;
				G(l.axisTickLabelEstimate || l.axisTickLabelDetermine), l.axisName = !0;
			}
			t.nameEl &&= (i.remove(t.nameEl), c.nameLayout = c.nameLocation = null);
			var u = e.axisName;
			if (aE(u)) {
				var d = e.nameLocation, f = e.nameDirection, p = r.getModel("nameTextStyle"), m = r.get("nameGap") || 0, h = r.axis.getExtent(), g = r.axis.inverse ? -1 : 1, _ = new ar(0, 0), v = new ar(0, 0);
				d === "start" ? (_.x = h[0] - g * m, v.x = -g) : d === "end" ? (_.x = h[1] + g * m, v.x = g) : (_.x = (h[0] + h[1]) / 2, _.y = e.labelOffset + f * m, v.y = f);
				var y = Nn();
				v.transform(Rn(y, y, e.rotation));
				var b = r.get("nameRotate");
				b != null && (b = b * cE / 180);
				var x, S;
				VC(d) ? x = _E.innerTextLayout(e.rotation, b ?? e.rotation, f) : (x = qT(e.rotation, d, b || 0, h), S = e.raw.axisNameAvailableWidth, S != null && (S = Math.abs(S / Math.sin(x.rotation)), !isFinite(S) && (S = null)));
				var C = p.getFont(), w = r.get("nameTruncate", !0) || {}, T = w.ellipsis, E = bt(e.raw.nameTruncateMaxWidth, w.maxWidth, S), D = s.nameMarginLevel || 0, O = new Nc({
					x: _.x,
					y: _.y,
					rotation: x.rotation,
					silent: _E.isLabelSilent(r),
					style: ih(p, {
						text: u,
						font: C,
						overflow: "truncate",
						width: E,
						ellipsis: T,
						fill: p.getTextColor() || r.get([
							"axisLine",
							"lineStyle",
							"color"
						]),
						align: p.get("align") || x.textAlign,
						verticalAlign: p.get("verticalAlign") || x.textVerticalAlign
					}),
					z2: 1
				});
				if (jm({
					el: O,
					componentModel: r,
					itemName: u
				}), O.__fullText = u, O.anid = "name", r.get("triggerEvent")) {
					var k = _E.makeAxisEventDataBase(r);
					k.targetType = "axisName", k.name = u, Nu(O).eventData = k;
				}
				a.add(O), O.updateTransform(), t.nameEl = O;
				var A = c.nameLayout = wT({
					label: O,
					priority: O.z2,
					defaultAttr: { ignore: O.ignore },
					marginDefault: VC(d) ? lE[D] : uE[D]
				});
				if (c.nameLocation = d, i.add(O), O.decomposeTransform(), e.shouldNameMoveOverlap && A) {
					var j = n.ensureRecord(r);
					process.env.NODE_ENV !== "production" && G(j.labelInfoList), n.resolveAxisNameOverlap(e, n, r, A, v, j);
				}
			}
		}
	}, bE = new _c(), xE = new _c();
}));
//#endregion
//#region node_modules/echarts/lib/coord/cartesian/cartesianAxisHelper.js
function CE(e, t, n) {
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
	}[o], i.labelOffset = a ? f[u[o]] - f[u.onZero] : 0, t.get(["axisTick", "inside"]) && (i.tickDirection = -i.tickDirection), bt(n.labelInside, t.get(["axisLabel", "inside"])) && (i.labelDirection = -i.labelDirection);
	var m = t.get(["axisLabel", "rotate"]);
	return i.labelRotate = s === "top" ? -m : m, i.z2 = 1, i;
}
function wE(e) {
	var t = {
		xAxisModel: null,
		yAxisModel: null
	};
	return R(t, function(n, r) {
		var i = r.replace(/Model$/, ""), a = e.getReferringComponents(i, ju).models[0];
		if (process.env.NODE_ENV !== "production" && !a) throw Error(i + " \"" + xt(e.get(i + "Index"), e.get(i + "Id"), 0) + "\" not found");
		t[r] = a;
	}), t;
}
function TE(e, t, n, r, i, a) {
	for (var o = CE(e, n), s = !1, c = !1, l = 0; l < t.length; l++) VS(t[l].getOtherAxis(n.axis).scale) && (s = c = !0, n.axis.type === "category" && n.axis.onBand && (c = !1));
	return o.axisLineAutoShow = s, o.axisTickAutoShow = c, o.defaultNameMoveOverlap = a, new _E(n, r, o, i);
}
function EE(e, t, n) {
	var r = CE(t, n);
	if (process.env.NODE_ENV !== "production") {
		var i = e.__getRawCfg();
		R(ct(r), function(e) {
			e !== "position" && e !== "labelOffset" && G(r[e] === i[e]);
		});
	}
	e.updateCfg(r);
}
var DE = M((() => {
	q(), Z(), SE(), eC();
}));
//#endregion
//#region node_modules/echarts/lib/coord/scaleRawExtentInfo.js
function OE(e, t) {
	var n = e.scale, r = e.dataMM;
	n.sanitize && (t[0] = n.sanitize(t[0], r), t[1] = n.sanitize(t[1], r), bu(t));
}
function kE(e, t) {
	return t == null ? null : yt(t) ? NaN : e.parse(t);
}
function AE(e, t) {
	var n;
	if (GS(e)) n = [0, 0];
	else {
		var r = t.get("boundaryGap");
		typeof r == "boolean" && (process.env.NODE_ENV !== "production" && r === !0 && console.warn("Boolean type for boundaryGap is only allowed for ordinal axis. Please use string in percentage instead, e.g., \"20%\". Currently, boundaryGap is set to 0."), r = null), n = B(r) ? r : [r, r];
	}
	return [jE(n[0]), jE(n[1])];
}
function jE(e) {
	return Rr(typeof e == "boolean" ? 0 : e, 1) || 0;
}
function ME(e) {
	var t = VE(e.scale);
	return t.extent ||= fu(), t;
}
function NE(e, t) {
	ME(e).dimIdxInCoord = t.get(e.dim);
}
function PE(e, t) {
	var n = e.scale, r = e.model, i = e.dim;
	if (process.env.NODE_ENV !== "production" && G(n && r && i), n.rawExtentInfo) {
		process.env.NODE_ENV !== "production" && G(n.rawExtentInfo.from !== t || t === 2);
		return;
	}
	FE(n, e, i, r, t);
}
function FE(e, t, n, r, i) {
	var a = ME(t), o = a.extent, s = !1;
	tT(t, function(r) {
		if (r.boxCoordinateSystem) {
			var i = w_(r).coord, c = a.dimIdxInCoord;
			if (!(c >= 0)) process.env.NODE_ENV !== "production" && El("Property \"series.coord\" is not supported on axis " + r.boxCoordinateSystem.type + ".");
			else if (B(i)) {
				var l = i[c];
				l != null && !B(l) && pu(o, e.parse(l));
			}
		} else if (r.coordinateSystem) {
			var u = r.getData();
			if (u) {
				var d = e.getFilter ? e.getFilter() : null;
				R(BC(u, n), function(e) {
					gu(o, u.getApproximateExtent(e, d));
				});
			}
			r.__requireStartValue && r.__requireStartValue(t) && (s = !0);
		}
	});
	var c = zE(e, t, r);
	LE(e, new UE(e, r, o, s, c), i), a.extent = null;
}
function IE(e, t) {
	var n = e.scale;
	process.env.NODE_ENV !== "production" && G(!n.rawExtentInfo), LE(n, new UE(n, e.model, t, !1, !1), HE);
}
function LE(e, t, n) {
	e.rawExtentInfo = t, t.from = n;
}
function RE(e, t, n, r, i) {
	process.env.NODE_ENV !== "production" && G(!i || !e.rawExtentInfo), e.rawExtentInfo || IE({
		scale: e,
		model: t
	}, i || fu());
	var a = e.rawExtentInfo.makeFinal(), o = a.effMM;
	return e.setExtent(o[0], o[1]), e.setBlank(a.isBlank), r && a.tggAxInv && n && !n.get("legacyMinMaxDontInverseAxis") && (r.inverse = !r.inverse), a;
}
function zE(e, t, n) {
	var r = qC(e, n), i = n.get("containShape", !0);
	if (i == null && !r && (i = !0), !i) return !1;
	var a = !1;
	return rT(t, function(e) {
		a = !!WE.get(e) || a;
	}), a;
}
function BE(e, t, n, r) {
	if (n.ctnShp) {
		var i;
		if (rT(e, function(t) {
			var n = WE.get(t);
			if (n) {
				var a = n(e, r);
				a && (i ||= [0, 0], mu(i, a[0]), hu(i, a[1]), PC(e));
			}
		}), i) {
			var a = t.getExtent();
			if (GS(t)) e.onBand || t.setExtent2(1, cl(a[0], a[0] + i[0]), ll(a[1], a[1] + i[1]));
			else {
				var o = a.slice();
				n.zoomFixMM[0] || (o[0] = cl(o[0], t.transformOut(t.transformIn(o[0], null) + i[0], null))), n.zoomFixMM[1] || (o[1] = ll(o[1], t.transformOut(t.transformIn(o[1], null) + i[1], null))), (o[0] < a[0] || o[1] > a[1]) && t.setExtent2(1, o[0], o[1]);
			}
		}
	}
}
var VE, HE, UE, WE, GE = M((() => {
	q(), Ur(), eC(), Z(), YC(), j_(), Pl(), Sl(), BS(), lT(), VE = ru(), HE = 3, UE = function() {
		function e(e, t, n, r, i) {
			var a = GS(e), o = a ? t.getCategories().length : null, s;
			if (a) {
				var c = t.getCategories(!0);
				s = c && !c.length;
			}
			var l = n.slice();
			(HS(e) || WS(e) || US(e)) && (mu(l, kE(e, t.get("dataMin", !0))), hu(l, kE(e, t.get("dataMax", !0)))), yu(l) || (l[0] = l[1] = NaN);
			var u = [], d = [!1, !1], f = t.get("min", !0);
			f === "dataMin" ? (u[0] = l[0], d[0] = !0) : (u[0] = kE(e, V(f) ? f({
				min: l[0],
				max: l[1]
			}) : f), d[0] = u[0] != null);
			var p = t.get("max", !0);
			p === "dataMax" ? (u[1] = l[1], d[1] = !0) : (u[1] = kE(e, V(p) ? p({
				min: l[0],
				max: l[1]
			}) : p), d[1] = u[1] != null);
			var m = AE(e, t), h = a ? null : l[1] - l[0] || Math.abs(l[0]);
			u[0] ??= a ? s ? l[0] : o ? 0 : NaN : l[0] - m[0] * h, u[1] ??= a ? s ? l[1] : o ? o - 1 : NaN : l[1] + m[1] * h, !_u(u[0]) && (u[0] = NaN), !_u(u[1]) && (u[1] = NaN);
			var g = s || yt(u[0]) || yt(u[1]) || a && !o, _ = HS(e), v = _ && t.needIncludeZero && t.needIncludeZero();
			v && (u[0] > 0 && u[1] > 0 && !d[0] && (u[0] = 0), u[0] < 0 && u[1] < 0 && !d[1] && (u[1] = 0));
			var y = !1;
			u[0] > u[1] && (u.reverse(), y = !0);
			var b = kE(e, t.get("startValue", !0)), x = b != null;
			!al(b) && r && (b = e.getDefaultStartValue ? e.getDefaultStartValue() : 0), al(b) && (x || !_ || v) && (b < u[0] && !d[0] ? (u[0] = b, d[0] = !0) : b > u[1] && !d[1] && (u[1] = b, d[1] = !0)), OE(this._i = {
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
			return t[0] != null && (o[0] = t[0], i[0] = r[0] = !0), t[1] != null && (o[1] = t[1], i[1] = r[1] = !0), OE(e, o), a;
		}, e.prototype.makeRenderInfo = function() {
			return { startValue: this._i.startValue };
		}, e.prototype.setZoomMM = function(e, t) {
			this._i.zoomMM[e] = t;
		}, e;
	}(), WE = K();
})), KE, qE, JE, YE, XE = M((() => {
	F(), qy(), Uy(), Eb(), KE = {
		left: 0,
		right: 0,
		top: 0,
		bottom: 0
	}, qE = ["25%", "25%"], JE = "cartesian2d", YE = function(e) {
		P(t, e);
		function t() {
			return e !== null && e.apply(this, arguments) || this;
		}
		return t.prototype.mergeDefaultAndTheme = function(t, n) {
			var r = Iy(t.outerBounds);
			e.prototype.mergeDefaultAndTheme.apply(this, arguments), r && t.outerBounds && Fy(t.outerBounds, r);
		}, t.prototype.mergeOption = function(t, n) {
			e.prototype.mergeOption.apply(this, arguments), this.option.outerBounds && t.outerBounds && Fy(this.option.outerBounds, t.outerBounds);
		}, t.type = "grid", t.dependencies = ["xAxis", "yAxis"], t.layoutMode = "box", t.defaultOption = {
			show: !1,
			z: 0,
			left: "15%",
			top: 65,
			right: "10%",
			bottom: 80,
			containLabel: !1,
			outerBoundsMode: "auto",
			outerBounds: KE,
			outerBoundsContain: "all",
			outerBoundsClampWidth: qE[0],
			outerBoundsClampHeight: qE[1],
			backgroundColor: Q.color.transparent,
			borderWidth: 1,
			borderColor: Q.color.neutral30
		}, t;
	}(Ky);
}));
//#endregion
//#region node_modules/echarts/lib/util/throttle.js
function ZE(e, t, n) {
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
function QE(e, t, n, r) {
	var i = e[t];
	if (i) {
		var a = i[eD] || i, o = i[nD];
		if (i[tD] !== n || o !== r) {
			if (n == null || !r) return e[t] = a;
			i = e[t] = ZE(a, n, r === "debounce"), i[eD] = a, i[nD] = r, i[tD] = n;
		}
		return i;
	}
}
function $E(e, t) {
	var n = e[t];
	n && n[eD] && (n.clear && n.clear(), e[t] = n[eD]);
}
var eD, tD, nD, rD = M((() => {
	eD = "\0__throttleOriginMethod", tD = "\0__throttleRate", nD = "\0__throttleType";
}));
//#endregion
//#region node_modules/echarts/lib/legacy/dataSelectAction.js
function iD(e, t, n, r, i) {
	var a = e + t;
	n.isSilent(a) || (process.env.NODE_ENV !== "production" && Dl("event " + a + " is deprecated."), r.eachComponent({
		mainType: "series",
		subType: "pie"
	}, function(e) {
		for (var t = e.seriesIndex, r = e.option.selectedMap, o = i.selected, s = 0; s < o.length; s++) if (o[s].seriesIndex === t) {
			var c = e.getData(), l = nu(c, i.fromActionPayload);
			n.trigger(a, {
				type: a,
				seriesId: e.id,
				name: B(l) ? c.getName(l[0]) : c.getName(l),
				selected: H(r) ? r : L({}, r)
			});
		}
	}));
}
function aD(e, t, n) {
	e.on("selectchanged", function(e) {
		var r = n.getModel();
		e.isFromClick ? (iD("map", "selectchanged", t, r, e), iD("pie", "selectchanged", t, r, e)) : e.fromAction === "select" ? (iD("map", "selected", t, r, e), iD("pie", "selected", t, r, e)) : e.fromAction === "unselect" && (iD("map", "unselected", t, r, e), iD("pie", "unselected", t, r, e));
	});
}
var oD = M((() => {
	q(), Pl(), Z();
})), sD, cD, lD = M((() => {
	sD = function() {
		function e(e, t) {
			this.target = e, this.topTarget = t && t.topTarget;
		}
		return e;
	}(), cD = function() {
		function e(e) {
			this.handler = e, e.on("mousedown", this._dragStart, this), e.on("mousemove", this._drag, this), e.on("mouseup", this._dragEnd, this);
		}
		return e.prototype._dragStart = function(e) {
			for (var t = e.target; t && !t.draggable;) t = t.parent || t.__hostTarget;
			t && (this._draggingTarget = t, t.dragging = !0, this._x = e.offsetX, this._y = e.offsetY, this.handler.dispatchToElement(new sD(t, e), "dragstart", e.event));
		}, e.prototype._drag = function(e) {
			var t = this._draggingTarget;
			if (t) {
				var n = e.offsetX, r = e.offsetY, i = n - this._x, a = r - this._y;
				this._x = n, this._y = r, t.drift(i, a, e), this.handler.dispatchToElement(new sD(t, e), "drag", e.event);
				var o = this.handler.findHover(n, r, t).target, s = this._dropTarget;
				this._dropTarget = o, t !== o && (s && o !== s && this.handler.dispatchToElement(new sD(s, e), "dragleave", e.event), o && o !== s && this.handler.dispatchToElement(new sD(o, e), "dragenter", e.event));
			}
		}, e.prototype._dragEnd = function(e) {
			var t = this._draggingTarget;
			t && (t.dragging = !1), this.handler.dispatchToElement(new sD(t, e), "dragend", e.event), this._dropTarget && this.handler.dispatchToElement(new sD(this._dropTarget, e), "drop", e.event), this._draggingTarget = null, this._dropTarget = null;
		}, e;
	}();
}));
//#endregion
//#region node_modules/zrender/lib/core/event.js
function uD(e, t, n, r) {
	return n ||= {}, r ? dD(e, t, n) : yD && t.layerX != null && t.layerX !== t.offsetX ? (n.zrX = t.layerX, n.zrY = t.layerY) : t.offsetX == null ? dD(e, t, n) : (n.zrX = t.offsetX, n.zrY = t.offsetY), n;
}
function dD(e, t, n) {
	if (J.domSupported && e.getBoundingClientRect) {
		var r = t.clientX, i = t.clientY;
		if (lv(e)) {
			var a = e.getBoundingClientRect();
			n.zrX = r - a.left, n.zrY = i - a.top;
			return;
		}
		if (ov(vD, e, r, i)) {
			n.zrX = vD[0], n.zrY = vD[1];
			return;
		}
	}
	n.zrX = n.zrY = 0;
}
function fD(e) {
	return e || window.event;
}
function pD(e, t, n) {
	if (t = fD(t), t.zrX != null) return t;
	var r = t.type;
	if (r && r.indexOf("touch") >= 0) {
		var i = r === "touchend" ? t.changedTouches[0] : t.targetTouches[0];
		i && uD(e, i, t, n);
	} else {
		uD(e, t, t, n);
		var a = mD(t);
		t.zrDelta = a ? a / 120 : -(t.detail || 0) / 3;
	}
	var o = t.button;
	return t.which == null && o !== void 0 && _D.test(t.type) && (t.which = o & 1 ? 1 : o & 2 ? 3 : o & 4 ? 2 : 0), t;
}
function mD(e) {
	var t = e.wheelDelta;
	if (t) return t;
	var n = e.deltaX, r = e.deltaY;
	if (n == null || r == null) return t;
	var i = Math.abs(r === 0 ? n : r), a = r > 0 ? -1 : r < 0 ? 1 : n > 0 ? -1 : 1;
	return 3 * i * a;
}
function hD(e, t, n, r) {
	e.addEventListener(t, n, r);
}
function gD(e, t, n, r) {
	e.removeEventListener(t, n, r);
}
var _D, vD, yD, bD, xD = M((() => {
	en(), hv(), _D = /^(?:mouse|pointer|contextmenu|drag|drop)|click/, vD = [], yD = J.browser.firefox && +J.browser.version.split(".")[0] < 39, bD = function(e) {
		e.preventDefault(), e.stopPropagation(), e.cancelBubble = !0;
	};
}));
//#endregion
//#region node_modules/zrender/lib/core/GestureMgr.js
function SD(e) {
	var t = e[1][0] - e[0][0], n = e[1][1] - e[0][1];
	return Math.sqrt(t * t + n * n);
}
function CD(e) {
	return [(e[0][0] + e[1][0]) / 2, (e[0][1] + e[1][1]) / 2];
}
var wD, TD, ED = M((() => {
	xD(), wD = function() {
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
					var s = r[a], c = uD(n, s, {});
					i.points.push([c.zrX, c.zrY]), i.touches.push(s);
				}
				this._track.push(i);
			}
		}, e.prototype._recognize = function(e) {
			for (var t in TD) if (TD.hasOwnProperty(t)) {
				var n = TD[t](this._track, e);
				if (n) return n;
			}
		}, e;
	}(), TD = { pinch: function(e, t) {
		var n = e.length;
		if (n) {
			var r = (e[n - 1] || {}).points, i = (e[n - 2] || {}).points || r;
			if (i && i.length > 1 && r && r.length > 1) {
				var a = SD(r) / SD(i);
				!isFinite(a) && (a = 1), t.pinchScale = a;
				var o = CD(r);
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
function DD(e, t, n) {
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
		stop: OD
	};
}
function OD() {
	bD(this.event);
}
function kD(e, t, n) {
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
		return !i || MD;
	}
	return !1;
}
function AD(e, t, n, r, i) {
	for (var a = e.length - 1; a >= 0; a--) {
		var o = e[a], s = void 0;
		if (o !== i && !o.ignore && (s = kD(o, n, r)) && (!t.topTarget && (t.topTarget = o), s !== MD)) {
			t.target = o;
			break;
		}
	}
}
function jD(e, t, n) {
	var r = e.painter;
	return t < 0 || t > r.getWidth() || n < 0 || n > r.getHeight();
}
var MD, ND, PD, FD, ID, LD, RD = M((() => {
	F(), q(), ir(), lD(), no(), xD(), ED(), Or(), MD = "silent", ND = function(e) {
		P(t, e);
		function t() {
			var t = e !== null && e.apply(this, arguments) || this;
			return t.handler = null, t;
		}
		return t.prototype.dispose = function() {}, t.prototype.setCursor = function() {}, t;
	}(to), PD = function() {
		function e(e, t) {
			this.x = e, this.y = t;
		}
		return e;
	}(), FD = [
		"click",
		"dblclick",
		"mousewheel",
		"mouseout",
		"mouseup",
		"mousedown",
		"mousemove",
		"contextmenu"
	], ID = new Y(0, 0, 0, 0), LD = function(e) {
		P(t, e);
		function t(t, n, r, i, a) {
			var o = e.call(this) || this;
			return o._hovered = new PD(0, 0), o.storage = t, o.painter = n, o.painterRoot = i, o._pointerSize = a, r ||= new ND(), o.proxy = null, o.setHandlerProxy(r), o._draggingMgr = new cD(o), o;
		}
		return t.prototype.setHandlerProxy = function(e) {
			this.proxy && this.proxy.dispose(), e && (R(FD, function(t) {
				e.on && e.on(t, this[t], this);
			}, this), e.handler = this), this.proxy = e;
		}, t.prototype.mousemove = function(e) {
			var t = e.zrX, n = e.zrY, r = jD(this, t, n), i = this._hovered, a = i.target;
			a && !a.__zr && (i = this.findHover(i.x, i.y), a = i.target);
			var o = this._hovered = r ? new PD(t, n) : this.findHover(t, n), s = o.target, c = this.proxy;
			c.setCursor && c.setCursor(s ? s.cursor : "default"), a && s !== a && this.dispatchToElement(i, "mouseout", e), this.dispatchToElement(o, "mousemove", e), s && s !== a && this.dispatchToElement(o, "mouseover", e);
		}, t.prototype.mouseout = function(e) {
			var t = e.zrEventControl;
			t !== "only_globalout" && this.dispatchToElement(this._hovered, "mouseout", e), t !== "no_globalout" && this.trigger("globalout", {
				type: "globalout",
				event: e
			});
		}, t.prototype.resize = function() {
			this._hovered = new PD(0, 0);
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
				for (var i = "on" + t, a = DD(t, e, n); r && (r[i] && (a.cancelBubble = !!r[i].call(r, a)), r.trigger(t, a), r = r.__hostTarget ? r.__hostTarget : r.parent, !a.cancelBubble););
				a.cancelBubble || (this.trigger(t, a), this.painter && this.painter.eachOtherLayer && this.painter.eachOtherLayer(function(e) {
					typeof e[i] == "function" && e[i].call(e, a), e.trigger && e.trigger(t, a);
				}));
			}
		}, t.prototype.findHover = function(e, t, n) {
			var r = this.storage.getDisplayList(), i = new PD(e, t);
			if (AD(r, i, e, t, n), this._pointerSize && !i.target) {
				for (var a = [], o = this._pointerSize, s = o / 2, c = new Y(e - s, t - s, o, o), l = r.length - 1; l >= 0; l--) {
					var u = r[l];
					u !== n && !u.ignore && !u.ignoreCoarsePointer && (!u.parent || !u.parent.ignoreCoarsePointer) && (ID.copy(u.getBoundingRect()), u.transform && ID.applyTransform(u.transform), ID.intersect(c) && a.push(u));
				}
				if (a.length) {
					for (var d = 4, f = Math.PI / 12, p = Math.PI * 2, m = 0; m < s; m += d) for (var h = 0; h < p; h += f) if (AD(a, i, e + m * Math.cos(h), t + m * Math.sin(h), n), i.target) return i;
				}
			}
			return i;
		}, t.prototype.processGesture = function(e, t) {
			this._gestureMgr ||= new wD();
			var n = this._gestureMgr;
			t === "start" && n.clear();
			var r = n.recognize(e, this.findHover(e.zrX, e.zrY, null).target, this.proxy.dom);
			if (t === "end" && n.clear(), r) {
				var i = r.type;
				e.gestureEvent = i;
				var a = new PD();
				a.target = r.target, this.dispatchToElement(a, i, r.event);
			}
		}, t;
	}(to), R([
		"click",
		"mousedown",
		"mouseup",
		"mousewheel",
		"dblclick",
		"contextmenu"
	], function(e) {
		LD.prototype[e] = function(t) {
			var n = t.zrX, r = t.zrY, i = jD(this, n, r), a, o;
			if ((e !== "mouseup" || !i) && (a = this.findHover(n, r), o = a.target), e === "mousedown") this._downEl = o, this._downPoint = [t.zrX, t.zrY], this._upEl = o;
			else if (e === "mouseup") this._upEl = o;
			else if (e === "click") {
				if (this._downEl !== this._upEl || !this._downPoint || nr(this._downPoint, [t.zrX, t.zrY]) > 4) return;
				this._downPoint = null;
			}
			this.dispatchToElement(a, e, t);
		};
	});
}));
//#endregion
//#region node_modules/zrender/lib/core/timsort.js
function zD(e) {
	for (var t = 0; e >= qD;) t |= e & 1, e >>= 1;
	return e + t;
}
function BD(e, t, n, r) {
	var i = t + 1;
	if (i === n) return 1;
	if (r(e[i++], e[t]) < 0) {
		for (; i < n && r(e[i], e[i - 1]) < 0;) i++;
		VD(e, t, i);
	} else for (; i < n && r(e[i], e[i - 1]) >= 0;) i++;
	return i - t;
}
function VD(e, t, n) {
	for (n--; t < n;) {
		var r = e[t];
		e[t++] = e[n], e[n--] = r;
	}
}
function HD(e, t, n, r, i) {
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
function UD(e, t, n, r, i, a) {
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
function WD(e, t, n, r, i, a) {
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
function GD(e, t) {
	var n = JD, r, i, a = 0, o = [];
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
		var u = WD(e[c], e, o, s, 0, t);
		o += u, s -= u, s !== 0 && (l = UD(e[o + s - 1], e, c, l, l - 1, t), l !== 0 && (s <= l ? d(o, s, c, l) : f(o, s, c, l)));
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
				if (p = WD(e[u], o, l, i, 0, t), p !== 0) {
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
				if (m = UD(o[l], e, u, s, 0, t), m !== 0) {
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
			} while (p >= JD || m >= JD);
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
				if (h = i - WD(o[u], e, r, i, i - 1, t), h !== 0) {
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
				if (g = s - UD(e[l], o, 0, s, s - 1, t), g !== 0) {
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
			} while (h >= JD || g >= JD);
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
function KD(e, t, n, r) {
	n ||= 0, r ||= e.length;
	var i = r - n;
	if (!(i < 2)) {
		var a = 0;
		if (i < qD) {
			a = BD(e, n, r, t), HD(e, n, r, n + a, t);
			return;
		}
		var o = GD(e, t), s = zD(i);
		do {
			if (a = BD(e, n, r, t), a < s) {
				var c = i;
				c > s && (c = s), HD(e, n, n + c, n + a, t), a = c;
			}
			o.pushRun(n, a), o.mergeRuns(), i -= a, n += a;
		} while (i !== 0);
		o.forceMergeRuns();
	}
}
var qD, JD, YD = M((() => {
	qD = 32, JD = 7;
}));
//#endregion
//#region node_modules/zrender/lib/Storage.js
function XD() {
	QD || (QD = !0, console.warn("z / z2 / zlevel of displayable is invalid, which may cause unexpected errors"));
}
function ZD(e, t) {
	return e.zlevel === t.zlevel ? e.z === t.z ? e.z2 - t.z2 : e.z - t.z : e.zlevel - t.zlevel;
}
var QD, $D, eO = M((() => {
	q(), YD(), uo(), QD = !1, $D = function() {
		function e() {
			this._roots = [], this._displayList = [], this._displayListLen = 0, this.displayableSortFunc = ZD;
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
			n.length = this._displayListLen, KD(n, ZD);
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
					isNaN(p.z) && (XD(), p.z = 0), isNaN(p.z2) && (XD(), p.z2 = 0), isNaN(p.zlevel) && (XD(), p.zlevel = 0), this._displayList[this._displayListLen++] = p;
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
			var r = tt(this._roots, e);
			r >= 0 && this._roots.splice(r, 1);
		}, e.prototype.delAllRoots = function() {
			this._roots = [], this._displayList = [], this._displayListLen = 0;
		}, e.prototype.getRoots = function() {
			return this._roots;
		}, e.prototype.dispose = function() {
			this._displayList = null, this._roots = null;
		}, e;
	}();
})), tO, nO = M((() => {
	en(), tO = J.hasGlobalWindow && (window.requestAnimationFrame && window.requestAnimationFrame.bind(window) || window.msRequestAnimationFrame && window.msRequestAnimationFrame.bind(window) || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame) || function(e) {
		return setTimeout(e, 16);
	};
}));
//#endregion
//#region node_modules/zrender/lib/animation/Animation.js
function rO() {
	return (/* @__PURE__ */ new Date()).getTime();
}
var iO, aO = M((() => {
	F(), no(), nO(), eo(), iO = function(e) {
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
			for (var t = rO() - this._pausedTime, n = t - this._time, r = this._head; r;) {
				var i = r.next;
				r.step(t, n) ? (r.ondestroy(), this.removeClip(r), r = i) : r = i;
			}
			this._time = t, e || (this.trigger("frame", n), this.stage.update && this.stage.update());
		}, t.prototype._startLoop = function() {
			var e = this;
			this._running = !0;
			function t() {
				e._running && (tO(t), !e._paused && e.update());
			}
			tO(t);
		}, t.prototype.start = function() {
			this._running || (this._time = rO(), this._pausedTime = 0, this._startLoop());
		}, t.prototype.stop = function() {
			this._running = !1;
		}, t.prototype.pause = function() {
			this._paused ||= (this._pauseStart = rO(), !0);
		}, t.prototype.resume = function() {
			this._paused &&= (this._pausedTime += rO() - this._pauseStart, !1);
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
			var n = new $a(e, t.loop);
			return this.addAnimator(n), n;
		}, t;
	}(to);
}));
//#endregion
//#region node_modules/zrender/lib/dom/HandlerProxy.js
function oO(e) {
	var t = e.pointerType;
	return t === "pen" || t === "touch";
}
function sO(e) {
	e.touching = !0, e.touchTimer != null && (clearTimeout(e.touchTimer), e.touchTimer = null), e.touchTimer = setTimeout(function() {
		e.touching = !1, e.touchTimer = null;
	}, 700);
}
function cO(e) {
	e && (e.zrByTouch = !0);
}
function lO(e, t) {
	return pD(e.dom, new bO(e, t), !0);
}
function uO(e, t) {
	for (var n = t, r = !1; n && n.nodeType !== 9 && !(r = n.domBelongToZr || n !== t && n === e.painterRoot);) n = n.parentNode;
	return r;
}
function dO(e, t) {
	var n = t.domHandlers;
	J.pointerEventsSupported ? R(_O.pointer, function(r) {
		pO(t, r, function(t) {
			n[r].call(e, t);
		});
	}) : (J.touchEventsSupported && R(_O.touch, function(r) {
		pO(t, r, function(i) {
			n[r].call(e, i), sO(t);
		});
	}), R(_O.mouse, function(r) {
		pO(t, r, function(i) {
			i = fD(i), t.touching || n[r].call(e, i);
		});
	}));
}
function fO(e, t) {
	J.pointerEventsSupported ? R(vO.pointer, n) : J.touchEventsSupported || R(vO.mouse, n);
	function n(n) {
		function r(r) {
			r = fD(r), uO(e, r.target) || (r = lO(e, r), t.domHandlers[n].call(e, r));
		}
		pO(t, n, r, { capture: !0 });
	}
}
function pO(e, t, n, r) {
	e.mounted[t] = n, e.listenerOpts[t] = r, hD(e.domTarget, t, n, r);
}
function mO(e) {
	var t = e.mounted;
	for (var n in t) t.hasOwnProperty(n) && gD(e.domTarget, n, t[n], e.listenerOpts[n]);
	e.mounted = {};
}
var hO, gO, _O, vO, yO, bO, xO, SO, CO, wO, TO = M((() => {
	F(), xD(), q(), no(), en(), hO = 300, gO = J.domSupported, _O = (function() {
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
			pointer: z(e, function(e) {
				var t = e.replace("mouse", "pointer");
				return n.hasOwnProperty(t) ? t : e;
			})
		};
	})(), vO = {
		mouse: ["mousemove", "mouseup"],
		pointer: ["pointermove", "pointerup"]
	}, yO = !1, bO = function() {
		function e(e, t) {
			this.stopPropagation = Mt, this.stopImmediatePropagation = Mt, this.preventDefault = Mt, this.type = t.type, this.target = this.currentTarget = e.dom, this.pointerType = t.pointerType, this.clientX = t.clientX, this.clientY = t.clientY;
		}
		return e;
	}(), xO = {
		mousedown: function(e) {
			e = pD(this.dom, e), this.__mayPointerCapture = [e.zrX, e.zrY], this.trigger("mousedown", e);
		},
		mousemove: function(e) {
			e = pD(this.dom, e);
			var t = this.__mayPointerCapture;
			t && (e.zrX !== t[0] || e.zrY !== t[1]) && this.__togglePointerCapture(!0), this.trigger("mousemove", e);
		},
		mouseup: function(e) {
			e = pD(this.dom, e), this.__togglePointerCapture(!1), this.trigger("mouseup", e);
		},
		mouseout: function(e) {
			e = pD(this.dom, e);
			var t = e.toElement || e.relatedTarget;
			uO(this, t) || (this.__pointerCapturing && (e.zrEventControl = "no_globalout"), this.trigger("mouseout", e));
		},
		wheel: function(e) {
			yO = !0, e = pD(this.dom, e), this.trigger("mousewheel", e);
		},
		mousewheel: function(e) {
			yO || (e = pD(this.dom, e), this.trigger("mousewheel", e));
		},
		touchstart: function(e) {
			e = pD(this.dom, e), cO(e), this.__lastTouchMoment = /* @__PURE__ */ new Date(), this.handler.processGesture(e, "start"), xO.mousemove.call(this, e), xO.mousedown.call(this, e);
		},
		touchmove: function(e) {
			e = pD(this.dom, e), cO(e), this.handler.processGesture(e, "change"), xO.mousemove.call(this, e);
		},
		touchend: function(e) {
			e = pD(this.dom, e), cO(e), this.handler.processGesture(e, "end"), xO.mouseup.call(this, e), +/* @__PURE__ */ new Date() - this.__lastTouchMoment < hO && xO.click.call(this, e);
		},
		pointerdown: function(e) {
			xO.mousedown.call(this, e);
		},
		pointermove: function(e) {
			oO(e) || xO.mousemove.call(this, e);
		},
		pointerup: function(e) {
			xO.mouseup.call(this, e);
		},
		pointerout: function(e) {
			oO(e) || xO.mouseout.call(this, e);
		}
	}, R([
		"click",
		"dblclick",
		"contextmenu"
	], function(e) {
		xO[e] = function(t) {
			t = pD(this.dom, t), this.trigger(e, t);
		};
	}), SO = {
		pointermove: function(e) {
			oO(e) || SO.mousemove.call(this, e);
		},
		pointerup: function(e) {
			SO.mouseup.call(this, e);
		},
		mousemove: function(e) {
			this.trigger("mousemove", e);
		},
		mouseup: function(e) {
			var t = this.__pointerCapturing;
			this.__togglePointerCapture(!1), this.trigger("mouseup", e), t && (e.zrEventControl = "only_globalout", this.trigger("mouseout", e));
		}
	}, CO = function() {
		function e(e, t) {
			this.mounted = {}, this.listenerOpts = {}, this.touching = !1, this.domTarget = e, this.domHandlers = t;
		}
		return e;
	}(), wO = function(e) {
		P(t, e);
		function t(t, n) {
			var r = e.call(this) || this;
			return r.__pointerCapturing = !1, r.dom = t, r.painterRoot = n, r._localHandlerScope = new CO(t, xO), gO && (r._globalHandlerScope = new CO(document, SO)), dO(r, r._localHandlerScope), r;
		}
		return t.prototype.dispose = function() {
			mO(this._localHandlerScope), gO && mO(this._globalHandlerScope);
		}, t.prototype.setCursor = function(e) {
			this.dom.style && (this.dom.style.cursor = e || "default");
		}, t.prototype.__togglePointerCapture = function(e) {
			if (this.__mayPointerCapture = null, gO && +this.__pointerCapturing ^ e) {
				this.__pointerCapturing = e;
				var t = this._globalHandlerScope;
				e ? fO(this, t) : mO(t);
			}
		}, t;
	}(to);
}));
//#endregion
//#region node_modules/zrender/lib/zrender.js
function EO(e) {
	delete MO[e];
}
function DO(e) {
	if (!e) return !1;
	if (typeof e == "string") return xa(e, 1) < ao;
	if (e.colorStops) {
		for (var t = e.colorStops, n = 0, r = t.length, i = 0; i < r; i++) n += xa(t[i].color, 1);
		return n /= r, n < ao;
	}
	return !1;
}
function OO(e, t) {
	var n = new NO(Xe(), e, t);
	return MO[n.id] = n, n;
}
function kO(e, t) {
	jO[e] = t;
}
function AO(e) {
	PO = e;
}
var jO, MO, NO, PO, FO = M((() => {
	en(), q(), RD(), eO(), aO(), TO(), Da(), lo(), kf(), jO = {}, MO = {}, NO = function() {
		function e(e, t, n) {
			var r = this;
			this._sleepAfterStill = 10, this._stillFrameAccum = 0, this._needsRefresh = !0, this._needsRefreshHover = !1, this._darkMode = !1, n ||= {}, this.dom = t, this.id = e;
			var i = new $D(), a = n.renderer || "canvas";
			if (jO[a] || (a = ct(jO)[0]), process.env.NODE_ENV !== "production" && !jO[a]) throw Error("Renderer '" + a + "' is not imported. Please import it first.");
			n.useDirtyRect = n.useDirtyRect != null && n.useDirtyRect;
			var o = new jO[a](t, i, n, e), s = n.ssr || o.ssrOnly;
			this.storage = i, this.painter = o;
			var c = !J.node && !J.worker && !s ? new wO(o.getViewportRoot(), o.root) : null, l = n.useCoarsePointer, u = l == null || l === "auto" ? J.touchEventsSupported : !!l, d = 44, f;
			u && (f = W(n.pointerSize, d)), this.handler = new LD(i, o, c, o.root, f), this.animation = new iO({ stage: { update: s ? null : function() {
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
			this._disposed || (this.painter.setBackgroundColor && this.painter.setBackgroundColor(e), this.refresh(), this._backgroundColor = e, this._darkMode = DO(e));
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
			var t, n = rO(), r = this._needsRefresh, i = this._needsRefreshHover;
			(r || i) && (t = !0, this._refresh({
				animUpdate: e,
				refresh: r,
				refreshHover: i
			}));
			var a = rO();
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
				for (var e = this.storage.getRoots(), t = 0; t < e.length; t++) e[t] instanceof Of && e[t].removeSelfFromZr(this);
				this.storage.delAllRoots(), this.painter.clear();
			}
		}, e.prototype.dispose = function() {
			this._disposed || (this.animation.stop(), this.clear(), this.storage.dispose(), this.painter.dispose(), this.handler.dispose(), this.animation = this.storage = this.painter = this.handler = null, this._disposed = !0, EO(this.id));
		}, e;
	}();
})), IO, LO, RO, zO, BO, VO = M((() => {
	Da(), Eb(), IO = "", typeof navigator < "u" && (IO = navigator.platform || ""), LO = "rgba(0, 0, 0, 0.2)", RO = Q.color.theme[0], zO = ya(RO, null, null, .9), BO = {
		darkMode: "auto",
		colorBy: "series",
		color: Q.color.theme,
		gradientColor: [zO, RO],
		aria: { decal: { decals: [
			{
				color: LO,
				dashArrayX: [1, 0],
				dashArrayY: [2, 5],
				symbolSize: 1,
				rotation: Math.PI / 6
			},
			{
				color: LO,
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
				color: LO,
				dashArrayX: [1, 0],
				dashArrayY: [4, 3],
				rotation: -Math.PI / 4
			},
			{
				color: LO,
				dashArrayX: [[6, 6], [
					0,
					6,
					6,
					0
				]],
				dashArrayY: [6, 0]
			},
			{
				color: LO,
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
				color: LO,
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
			fontFamily: IO.match(/^Win/) ? "Microsoft YaHei" : "sans-serif",
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
function HO(e, t, n) {
	var r = UO.get(t);
	if (!r) return n;
	var i = r(e);
	if (!i) return n;
	if (process.env.NODE_ENV !== "production") for (var a = 0; a < i.length; a++) G($l(i[a]));
	return n.concat(i);
}
var UO, WO = M((() => {
	q(), Z(), UO = K();
}));
//#endregion
//#region node_modules/echarts/lib/model/Global.js
function GO(e) {
	R(e, function(e, t) {
		if (!Ky.hasClass(t)) {
			var n = nk[t];
			n && !ik[n] && (El("Component " + t + " is used but not imported.\nimport { " + n + " } from 'echarts/components';\necharts.use([" + n + "]);"), ik[n] = !0);
		}
	});
}
function KO(e, t) {
	if (t) {
		var n = t.seriesIndex, r = t.seriesId, i = t.seriesName;
		return n != null && e.componentIndex !== n || r != null && e.id !== r || i != null && e.name !== i;
	}
}
function qO(e, t) {
	var n = e.color && !e.colorLayer;
	R(t, function(t, r) {
		r === "colorLayer" && n || r === "color" && e.color || Ky.hasClass(r) || (typeof t == "object" ? e[r] = e[r] ? Qe(e[r], t, !1) : I(t) : e[r] ?? (e[r] = t));
	});
}
function JO(e, t, n) {
	if (B(t)) {
		var r = K();
		return R(t, function(e) {
			e != null && Yl(e, null) != null && r.set(e, !0);
		}), ot(n, function(t) {
			return t && r.get(t[e]);
		});
	}
	var i = Yl(t, null);
	return ot(n, function(t) {
		return t && i != null && t[e] === i;
	});
}
function YO(e, t) {
	return t.hasOwnProperty("subType") ? ot(e, function(e) {
		return e && e.subType === t.subType;
	}) : e;
}
function XO(e) {
	var t = K();
	return e && R(Il(e.replaceMerge), function(e) {
		process.env.NODE_ENV !== "production" && G(Ky.hasClass(e), "\"" + e + "\" is not valid component main type in \"replaceMerge\""), t.set(e, !0);
	}), { replaceMergeMainTypeMap: t };
}
var ZO, QO, $O, ek, tk, nk, rk, ik, ak, ok = M((() => {
	F(), q(), Z(), jh(), qy(), VO(), Wh(), WO(), $y(), Pl(), ek = "\0_ec_inner", tk = 1, nk = {
		grid: "GridComponent",
		polar: "PolarComponent",
		geo: "GeoComponent",
		singleAxis: "SingleAxisComponent",
		parallel: "ParallelComponent",
		calendar: "CalendarComponent",
		matrix: "MatrixComponent",
		graphic: "GraphicComponent",
		toolbox: "ToolboxComponent",
		tooltip: "TooltipComponent",
		axisPointer: "AxisPointerComponent",
		brush: "BrushComponent",
		title: "TitleComponent",
		timeline: "TimelineComponent",
		markPoint: "MarkPointComponent",
		markLine: "MarkLineComponent",
		markArea: "MarkAreaComponent",
		legend: "LegendComponent",
		dataZoom: "DataZoomComponent",
		visualMap: "VisualMapComponent",
		xAxis: "GridComponent",
		yAxis: "GridComponent",
		angleAxis: "PolarComponent",
		radiusAxis: "PolarComponent"
	}, rk = {
		line: "LineChart",
		bar: "BarChart",
		pie: "PieChart",
		scatter: "ScatterChart",
		radar: "RadarChart",
		map: "MapChart",
		tree: "TreeChart",
		treemap: "TreemapChart",
		graph: "GraphChart",
		chord: "ChordChart",
		gauge: "GaugeChart",
		funnel: "FunnelChart",
		parallel: "ParallelChart",
		sankey: "SankeyChart",
		boxplot: "BoxplotChart",
		candlestick: "CandlestickChart",
		effectScatter: "EffectScatterChart",
		lines: "LinesChart",
		heatmap: "HeatmapChart",
		pictorialBar: "PictorialBarChart",
		themeRiver: "ThemeRiverChart",
		sunburst: "SunburstChart",
		custom: "CustomChart"
	}, ik = {}, ak = function(e) {
		P(t, e);
		function t() {
			return e !== null && e.apply(this, arguments) || this;
		}
		return t.prototype.init = function(e, t, n, r, i, a) {
			r ||= {}, this.option = null, this._theme = new Ah(r), this._locale = new Ah(i), this._optionManager = a;
		}, t.prototype.setOption = function(e, t, n) {
			process.env.NODE_ENV !== "production" && (G(e != null, "option is null/undefined"), G(e[ek] !== tk, "please use chart.getOption()"));
			var r = XO(t);
			this._optionManager.setOption(e, n, r), this._resetOption(null, r);
		}, t.prototype.resetOption = function(e, t) {
			return this._resetOption(e, XO(t));
		}, t.prototype._resetOption = function(e, t) {
			var n = !1, r = this._optionManager;
			if (!e || e === "recreate") {
				var i = r.mountOption(e === "recreate");
				process.env.NODE_ENV !== "production" && GO(i), !this.option || e === "recreate" ? $O(this, i) : (this.restoreData(), this._mergeOption(i, t)), n = !0;
			}
			if ((e === "timeline" || e === "media") && this.restoreData(), !e || e === "recreate" || e === "timeline") {
				var a = r.getTimelineOption(this);
				a && (n = !0, this._mergeOption(a, t));
			}
			if (!e || e === "recreate" || e === "media") {
				var o = r.getMediaOption(this);
				o.length && R(o, function(e) {
					n = !0, this._mergeOption(e, t);
				}, this);
			}
			return n;
		}, t.prototype.mergeOption = function(e) {
			this._mergeOption(e, null);
		}, t.prototype._mergeOption = function(e, t) {
			var n = this.option, r = this._componentsMap, i = this._componentsCount, a = [], o = K(), s = t && t.replaceMergeMainTypeMap;
			Ih(this), R(e, function(e, t) {
				e != null && (Ky.hasClass(t) ? t && (a.push(t), o.set(t, !0)) : n[t] = n[t] == null ? I(e) : Qe(n[t], e, !0));
			}), s && s.each(function(e, t) {
				Ky.hasClass(t) && !o.get(t) && (a.push(t), o.set(t, !0));
			}), Ky.topologicalTravel(a, Ky.getAllClassMainTypes(), c, this);
			function c(t) {
				var a = HO(this, t, Il(e[t])), o = r.get(t), c = Bl(o, a, o ? s && s.get(t) ? "replaceMerge" : "normalMerge" : "replaceAll");
				eu(c, t, Ky), n[t] = null, r.set(t, null), i.set(t, 0);
				var l = [], u = [], d = 0, f, p;
				R(c, function(e, n) {
					var r = e.existing, i = e.newOption;
					if (!i) r && (r.mergeOption({}, this), r.optionUpdated({}, !1));
					else {
						var a = t === "series", o = Ky.getClass(t, e.keyInfo.subType, !a);
						if (!o) {
							if (process.env.NODE_ENV !== "production") {
								var s = e.keyInfo.subType, c = rk[s];
								ik[s] || (ik[s] = !0, El(c ? "Series " + s + " is used but not imported.\nimport { " + c + " } from 'echarts/charts';\necharts.use([" + c + "]);" : "Unknown series " + s));
							}
							return;
						}
						if (t === "tooltip") {
							if (f) {
								process.env.NODE_ENV !== "production" && (p ||= (Tl("Currently only one tooltip component is allowed."), !0));
								return;
							}
							f = !0;
						}
						if (r && r.constructor === o) r.name = e.keyInfo.name, r.mergeOption(i, this), r.optionUpdated(i, !1);
						else {
							var m = L({ componentIndex: n }, e.keyInfo);
							r = new o(i, this, this, m), L(r, m), e.brandNew && (r.__requireNewView = !0), r.init(i, this, this), r.optionUpdated(null, !0);
						}
					}
					r ? (l.push(r.option), u.push(r), d++) : (l.push(void 0), u.push(void 0));
				}, this), n[t] = l, r.set(t, u), i.set(t, d), t === "series" && ZO(this);
			}
			this._seriesIndices || ZO(this);
		}, t.prototype.getOption = function() {
			var e = I(this.option);
			return R(e, function(t, n) {
				if (Ky.hasClass(n)) {
					for (var r = Il(t), i = r.length, a = !1, o = i - 1; o >= 0; o--) r[o] && !$l(r[o]) ? a = !0 : (r[o] = null, !a && i--);
					r.length = i, e[n] = r;
				}
			}), delete e[ek], e;
		}, t.prototype.setTheme = function(e) {
			this._theme = new Ah(e), this._resetOption("recreate", null);
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
			return n == null ? o = r == null ? i == null ? ot(a, function(e) {
				return !!e;
			}) : JO("name", i, a) : JO("id", r, a) : (o = [], R(Il(n), function(e) {
				a[e] && o.push(a[e]);
			})), YO(o, e);
		}, t.prototype.findComponents = function(e) {
			var t = e.query, n = e.mainType, r = i(t);
			return a(YO(r ? this.queryComponents(r) : ot(this._componentsMap.get(n), function(e) {
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
				return e.filter ? ot(t, e.filter) : t;
			}
		}, t.prototype.eachComponent = function(e, t, n) {
			var r = this._componentsMap;
			if (V(e)) {
				var i = t, a = e;
				r.each(function(e, t) {
					for (var n = 0; e && n < e.length; n++) {
						var r = e[n];
						r && a.call(i, t, r, r.componentIndex);
					}
				});
			} else for (var o = H(e) ? r.get(e) : U(e) ? this.findComponents(e) : null, s = 0; o && s < o.length; s++) {
				var c = o[s];
				c && t.call(n, c, c.componentIndex);
			}
		}, t.prototype.getSeriesByName = function(e) {
			var t = Yl(e, null);
			return ot(this._componentsMap.get("series"), function(e) {
				return !!e && t != null && e.name === t;
			});
		}, t.prototype.getSeriesByIndex = function(e) {
			return this._componentsMap.get("series")[e];
		}, t.prototype.getSeriesByType = function(e) {
			return ot(this._componentsMap.get("series"), function(t) {
				return !!t && t.subType === e;
			});
		}, t.prototype.getSeries = function() {
			return ot(this._componentsMap.get("series"), function(e) {
				return !!e;
			});
		}, t.prototype.getSeriesCount = function() {
			return this._componentsCount.get("series");
		}, t.prototype.eachSeries = function(e, t) {
			QO(this), R(this._seriesIndices, function(n) {
				var r = this._componentsMap.get("series")[n];
				e.call(t, r, n);
			}, this);
		}, t.prototype.eachRawSeries = function(e, t) {
			R(this._componentsMap.get("series"), function(n) {
				n && e.call(t, n, n.componentIndex);
			});
		}, t.prototype.eachSeriesByType = function(e, t, n) {
			QO(this), R(this._seriesIndices, function(r) {
				var i = this._componentsMap.get("series")[r];
				i.subType === e && t.call(n, i, r);
			}, this);
		}, t.prototype.eachRawSeriesByType = function(e, t, n) {
			return R(this.getSeriesByType(e), t, n);
		}, t.prototype.isSeriesFiltered = function(e) {
			return QO(this), this._seriesIndicesMap.get(e.componentIndex) == null;
		}, t.prototype.getCurrentSeriesIndices = function() {
			return (this._seriesIndices || []).slice();
		}, t.prototype.filterSeries = function(e, t) {
			QO(this);
			var n = [];
			R(this._seriesIndices, function(r) {
				var i = this._componentsMap.get("series")[r];
				e.call(t, i, r) && n.push(r);
			}, this), this._seriesIndices = n, this._seriesIndicesMap = K(n);
		}, t.prototype.restoreData = function(e) {
			ZO(this);
			var t = this._componentsMap, n = [];
			t.each(function(e, t) {
				Ky.hasClass(t) && n.push(t);
			}), Ky.topologicalTravel(n, Ky.getAllClassMainTypes(), function(n) {
				R(t.get(n), function(t) {
					t && (n !== "series" || !KO(t, e)) && t.restoreData();
				});
			});
		}, t.internalField = function() {
			ZO = function(e) {
				var t = e._seriesIndices = [];
				R(e._componentsMap.get("series"), function(e) {
					e && t.push(e.componentIndex);
				}), e._seriesIndicesMap = K(t);
			}, QO = function(e) {
				if (process.env.NODE_ENV !== "production" && !e._seriesIndices) throw Error("Option should contains series.");
			}, $O = function(e, t) {
				e.option = {}, e.option[ek] = tk, e._componentsMap = K({ series: [] }), e._componentsCount = K();
				var n = t.aria;
				U(n) && n.enabled == null && (n.enabled = !0), qO(t, e._theme.option), Qe(t, BO, !1), e._mergeOption(t, null);
			};
		}(), t;
	}(Ah), rt(ak, Qy);
}));
//#endregion
//#region node_modules/echarts/lib/model/OptionManager.js
function sk(e, t, n) {
	var r = [], i, a, o = e.baseOption, s = e.timeline, c = e.options, l = e.media, u = !!e.media, d = !!(c || s || o && o.timeline);
	o ? (a = o, a.timeline || (a.timeline = s)) : ((d || u) && (e.options = e.media = null), a = e), u && (B(l) ? R(l, function(e) {
		process.env.NODE_ENV !== "production" && e && !e.option && U(e.query) && U(e.query.option) && El("Illegal media option. Must be like { media: [ { query: {}, option: {} } ] }"), e && e.option && (e.query ? r.push(e) : i ||= e);
	}) : process.env.NODE_ENV !== "production" && El("Illegal media option. Must be an array. Like { media: [ {...}, {...} ] }")), f(a), R(c, function(e) {
		return f(e);
	}), R(r, function(e) {
		return f(e.option);
	});
	function f(e) {
		R(t, function(t) {
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
function ck(e, t, n) {
	var r = {
		width: t,
		height: n,
		aspectratio: t / n
	}, i = !0;
	return R(e, function(e, t) {
		var n = t.match(dk);
		if (n && n[1] && n[2]) {
			var a = n[1];
			lk(r[n[2].toLowerCase()], e, a) || (i = !1);
		}
	}), i;
}
function lk(e, t, n) {
	return n === "min" ? e >= t : n === "max" ? e <= t : e === t;
}
function uk(e, t) {
	return e.join(",") === t.join(",");
}
var dk, fk, pk = M((() => {
	Z(), q(), Pl(), dk = /^(min|max)?(.+)$/, fk = function() {
		function e(e) {
			this._timelineOptions = [], this._mediaList = [], this._currentMediaIndices = [], this._api = e;
		}
		return e.prototype.setOption = function(e, t, n) {
			e && (R(Il(e.series), function(e) {
				e && e.data && mt(e.data) && Tt(e.data);
			}), R(Il(e.dataset), function(e) {
				e && e.source && mt(e.source) && Tt(e.source);
			})), e = I(e);
			var r = this._optionBackup, i = sk(e, t, !r);
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
			for (var s = 0, c = r.length; s < c; s++) ck(r[s].query, t, n) && a.push(s);
			return !a.length && i && (a = [-1]), a.length && !uk(a, this._currentMediaIndices) && (o = z(a, function(e) {
				return I(e === -1 ? i.option : r[e].option);
			})), this._currentMediaIndices = a, o;
		}, e;
	}();
}));
//#endregion
//#region node_modules/echarts/lib/preprocessor/helper/compatStyle.js
function mk(e) {
	var t = e && e.itemStyle;
	if (t) for (var n = 0, r = Tk.length; n < r; n++) {
		var i = Tk[n], a = t.normal, o = t.emphasis;
		a && a[i] && (process.env.NODE_ENV !== "production" && Ol("itemStyle.normal." + i, i), e[i] = e[i] || {}, e[i].normal ? Qe(e[i].normal, a[i]) : e[i].normal = a[i], a[i] = null), o && o[i] && (process.env.NODE_ENV !== "production" && Ol("itemStyle.emphasis." + i, "emphasis." + i), e[i] = e[i] || {}, e[i].emphasis ? Qe(e[i].emphasis, o[i]) : e[i].emphasis = o[i], o[i] = null);
	}
}
function hk(e, t, n) {
	if (e && e[t] && (e[t].normal || e[t].emphasis)) {
		var r = e[t].normal, i = e[t].emphasis;
		r && (process.env.NODE_ENV !== "production" && Dl("'normal' hierarchy in " + t + " has been removed since 4.0. All style properties are configured in " + t + " directly now."), n ? (e[t].normal = e[t].emphasis = null, et(e[t], r)) : e[t] = r), i && (process.env.NODE_ENV !== "production" && Dl(t + ".emphasis has been changed to emphasis." + t + " since 4.0"), e.emphasis = e.emphasis || {}, e.emphasis[t] = i, i.focus && (e.emphasis.focus = i.focus), i.blurScope && (e.emphasis.blurScope = i.blurScope));
	}
}
function gk(e) {
	hk(e, "itemStyle"), hk(e, "lineStyle"), hk(e, "areaStyle"), hk(e, "label"), hk(e, "labelLine"), hk(e, "upperLabel"), hk(e, "edgeLabel");
}
function _k(e, t) {
	var n = wk(e) && e[t], r = wk(n) && n.textStyle;
	if (r) {
		process.env.NODE_ENV !== "production" && Dl("textStyle hierarchy in " + t + " has been removed since 4.0. All textStyle properties are configured in " + t + " directly now.");
		for (var i = 0, a = ku.length; i < a; i++) {
			var o = ku[i];
			r.hasOwnProperty(o) && (n[o] = r[o]);
		}
	}
}
function vk(e) {
	e && (gk(e), _k(e, "label"), e.emphasis && _k(e.emphasis, "label"));
}
function yk(e) {
	if (wk(e)) {
		mk(e), gk(e), _k(e, "label"), _k(e, "upperLabel"), _k(e, "edgeLabel"), e.emphasis && (_k(e.emphasis, "label"), _k(e.emphasis, "upperLabel"), _k(e.emphasis, "edgeLabel"));
		var t = e.markPoint;
		t && (mk(t), vk(t));
		var n = e.markLine;
		n && (mk(n), vk(n));
		var r = e.markArea;
		r && vk(r);
		var i = e.data;
		if (e.type === "graph") {
			i ||= e.nodes;
			var a = e.links || e.edges;
			if (a && !mt(a)) for (var o = 0; o < a.length; o++) vk(a[o]);
			R(e.categories, function(e) {
				gk(e);
			});
		}
		if (i && !mt(i)) for (var o = 0; o < i.length; o++) vk(i[o]);
		if (t = e.markPoint, t && t.data) for (var s = t.data, o = 0; o < s.length; o++) vk(s[o]);
		if (n = e.markLine, n && n.data) for (var c = n.data, o = 0; o < c.length; o++) B(c[o]) ? (vk(c[o][0]), vk(c[o][1])) : vk(c[o]);
		e.type === "gauge" ? (_k(e, "axisLabel"), _k(e, "title"), _k(e, "detail")) : e.type === "treemap" ? (hk(e.breadcrumb, "itemStyle"), R(e.levels, function(e) {
			gk(e);
		})) : e.type === "tree" && gk(e.leaves);
	}
}
function bk(e) {
	return B(e) ? e : e ? [e] : [];
}
function xk(e) {
	return (B(e) ? e[0] : e) || {};
}
function Sk(e, t) {
	Ck(bk(e.series), function(e) {
		wk(e) && yk(e);
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
	t && n.push("valueAxis", "categoryAxis", "logAxis", "timeAxis"), Ck(n, function(t) {
		Ck(bk(e[t]), function(e) {
			e && (_k(e, "axisLabel"), _k(e.axisPointer, "label"));
		});
	}), Ck(bk(e.parallel), function(e) {
		var t = e && e.parallelAxisDefault;
		_k(t, "axisLabel"), _k(t && t.axisPointer, "label");
	}), Ck(bk(e.calendar), function(e) {
		hk(e, "itemStyle"), _k(e, "dayLabel"), _k(e, "monthLabel"), _k(e, "yearLabel");
	}), Ck(bk(e.radar), function(e) {
		_k(e, "name"), e.name && e.axisName == null && (e.axisName = e.name, delete e.name, process.env.NODE_ENV !== "production" && Dl("name property in radar component has been changed to axisName")), e.nameGap != null && e.axisNameGap == null && (e.axisNameGap = e.nameGap, delete e.nameGap, process.env.NODE_ENV !== "production" && Dl("nameGap property in radar component has been changed to axisNameGap")), process.env.NODE_ENV !== "production" && Ck(e.indicator, function(e) {
			e.text && Ol("text", "name", "radar.indicator");
		});
	}), Ck(bk(e.geo), function(e) {
		wk(e) && (vk(e), Ck(bk(e.regions), function(e) {
			vk(e);
		}));
	}), Ck(bk(e.timeline), function(e) {
		vk(e), hk(e, "label"), hk(e, "itemStyle"), hk(e, "controlStyle", !0);
		var t = e.data;
		B(t) && R(t, function(e) {
			U(e) && (hk(e, "label"), hk(e, "itemStyle"));
		});
	}), Ck(bk(e.toolbox), function(e) {
		hk(e, "iconStyle"), Ck(e.feature, function(e) {
			hk(e, "iconStyle");
		});
	}), _k(xk(e.axisPointer), "label"), _k(xk(e.tooltip).axisPointer, "label");
}
var Ck, wk, Tk, Ek = M((() => {
	q(), Z(), Pl(), Ck = R, wk = U, Tk = [
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
function Dk(e, t) {
	for (var n = t.split(","), r = e, i = 0; i < n.length && (r &&= r[n[i]], r != null); i++);
	return r;
}
function Ok(e, t, n, r) {
	for (var i = t.split(","), a = e, o, s = 0; s < i.length - 1; s++) o = i[s], a[o] ?? (a[o] = {}), a = a[o];
	(r || a[i[s]] == null) && (a[i[s]] = n);
}
function kk(e) {
	e && R(Ik, function(t) {
		t[0] in e && !(t[1] in e) && (e[t[1]] = e[t[0]]);
	});
}
function Ak(e) {
	var t = e && e.itemStyle;
	if (t) for (var n = 0; n < Rk.length; n++) {
		var r = Rk[n][1], i = Rk[n][0];
		t[r] != null && (t[i] = t[r], process.env.NODE_ENV !== "production" && Ol(r, i));
	}
}
function jk(e) {
	e && e.alignTo === "edge" && e.margin != null && e.edgeDistance == null && (process.env.NODE_ENV !== "production" && Ol("label.margin", "label.edgeDistance", "pie"), e.edgeDistance = e.margin);
}
function Mk(e) {
	e && e.downplay && !e.blur && (e.blur = e.downplay, process.env.NODE_ENV !== "production" && Ol("downplay", "blur", "sunburst"));
}
function Nk(e) {
	e && e.focusNodeAdjacency != null && (e.emphasis = e.emphasis || {}, e.emphasis.focus ?? (process.env.NODE_ENV !== "production" && Ol("focusNodeAdjacency", "emphasis: { focus: 'adjacency'}", "graph/sankey"), e.emphasis.focus = "adjacency"));
}
function Pk(e, t) {
	if (e) for (var n = 0; n < e.length; n++) t(e[n]), e[n] && Pk(e[n].children, t);
}
function Fk(e, t) {
	Sk(e, t), e.series = Il(e.series), R(e.series, function(e) {
		if (U(e)) {
			var t = e.type;
			if (t === "line") e.clipOverflow != null && (e.clip = e.clipOverflow, process.env.NODE_ENV !== "production" && Ol("clipOverflow", "clip", "line"));
			else if (t === "pie" || t === "gauge") {
				e.clockWise != null && (e.clockwise = e.clockWise, process.env.NODE_ENV !== "production" && Ol("clockWise", "clockwise")), jk(e.label);
				var n = e.data;
				if (n && !mt(n)) for (var r = 0; r < n.length; r++) jk(n[r]);
				e.hoverOffset != null && (e.emphasis = e.emphasis || {}, (e.emphasis.scaleSize = null) && (process.env.NODE_ENV !== "production" && Ol("hoverOffset", "emphasis.scaleSize"), e.emphasis.scaleSize = e.hoverOffset));
			} else if (t === "gauge") {
				var i = Dk(e, "pointer.color");
				i != null && Ok(e, "itemStyle.color", i);
			} else if (t === "bar") {
				Ak(e), Ak(e.backgroundStyle), Ak(e.emphasis);
				var n = e.data;
				if (n && !mt(n)) for (var r = 0; r < n.length; r++) typeof n[r] == "object" && (Ak(n[r]), Ak(n[r] && n[r].emphasis));
			} else if (t === "sunburst") {
				var a = e.highlightPolicy;
				a && (e.emphasis = e.emphasis || {}, e.emphasis.focus || (e.emphasis.focus = a, process.env.NODE_ENV !== "production" && Ol("highlightPolicy", "emphasis.focus", "sunburst"))), Mk(e), Pk(e.data, Mk);
			} else t === "graph" || t === "sankey" ? Nk(e) : t === "map" && (e.mapType && !e.map && (process.env.NODE_ENV !== "production" && Ol("mapType", "map", "map"), e.map = e.mapType), e.mapLocation && (process.env.NODE_ENV !== "production" && Dl("`mapLocation` is not used anymore."), et(e, e.mapLocation)));
			e.hoverAnimation != null && (e.emphasis = e.emphasis || {}, e.emphasis && e.emphasis.scale == null && (process.env.NODE_ENV !== "production" && Ol("hoverAnimation", "emphasis.scale"), e.emphasis.scale = e.hoverAnimation)), kk(e);
		}
	}), e.dataRange && (e.visualMap = e.dataRange), R(Lk, function(t) {
		var n = e[t];
		n && (B(n) || (n = [n]), R(n, function(e) {
			kk(e);
		}));
	});
}
var Ik, Lk, Rk, zk = M((() => {
	q(), Ek(), Z(), Pl(), Ik = [
		["x", "left"],
		["y", "top"],
		["x2", "right"],
		["y2", "bottom"]
	], Lk = [
		"grid",
		"geo",
		"parallel",
		"legend",
		"toolbox",
		"title",
		"visualMap",
		"dataZoom",
		"timeline"
	], Rk = [
		["borderRadius", "barBorderRadius"],
		["borderColor", "barBorderColor"],
		["borderWidth", "barBorderWidth"]
	];
}));
//#endregion
//#region node_modules/echarts/lib/processor/dataStack.js
function Bk(e) {
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
		e.length !== 0 && ((e[0].seriesModel.get("stackOrder") || "seriesAsc") === "seriesDesc" && e.reverse(), R(e, function(t, n) {
			t.data.setCalculationInfo("stackedOnSeries", n > 0 ? e[n - 1].seriesModel : null);
		}), Vk(e));
	});
}
function Vk(e) {
	R(e, function(t, n) {
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
var Hk, Uk = M((() => {
	q(), Sl(), Z(), Hk = Eu(Bk);
})), Wk, Gk = M((() => {
	kf(), $_(), gn(), Wk = function() {
		function e() {
			this.group = new Of(), this.uid = J_("viewComponent");
		}
		return e.prototype.init = function(e, t) {}, e.prototype.render = function(e, t, n, r) {}, e.prototype.dispose = function(e, t) {}, e.prototype.updateView = function(e, t, n, r) {}, e.prototype.updateLayout = function(e, t, n, r) {}, e.prototype.updateVisual = function(e, t, n, r) {}, e.prototype.toggleBlurSeries = function(e, t, n) {}, e.prototype.eachRendered = function(e) {
			var t = this.group;
			t && t.traverse(e);
		}, e;
	}(), an(Wk), dn(Wk);
}));
//#endregion
//#region node_modules/echarts/lib/visual/style.js
function Kk(e, t) {
	return e.visualStyleMapper || Yk[t] || (console.warn("Unknown style type '" + t + "'."), Yk.itemStyle);
}
function qk(e, t) {
	return e.visualDrawType || Xk[t] || (console.warn("Unknown style type '" + t + "'."), "fill");
}
var Jk, Yk, Xk, Zk, Qk, $k, eA, tA = M((() => {
	q(), vn(), kh(), Th(), jh(), Z(), Jk = ru(), Yk = {
		itemStyle: _n(Eh, !0),
		lineStyle: _n(Sh, !0)
	}, Xk = {
		lineStyle: "stroke",
		itemStyle: "fill"
	}, Zk = {
		createOnAllSeries: !0,
		performRawSeries: !0,
		reset: function(e, t) {
			var n = e.getData(), r = e.visualStyleAccessPath || "itemStyle", i = e.getModel(r), a = Kk(e, r)(i), o = i.getShallow("decal");
			o && (n.setVisual("decal", o), o.dirty = !0);
			var s = qk(e, r), c = a[s], l = V(c) ? c : null, u = a.fill === "auto" || a.stroke === "auto";
			if (!a[s] || l || u) {
				var d = e.getColorFromPalette(e.name, null, t.getSeriesCount());
				a[s] || (a[s] = d, n.setVisual("colorFromPalette", !0)), a.fill = a.fill === "auto" || V(a.fill) ? d : a.fill, a.stroke = a.stroke === "auto" || V(a.stroke) ? d : a.stroke;
			}
			if (n.setVisual("style", a), n.setVisual("drawType", s), !t.isSeriesFiltered(e) && l) return n.setVisual("colorFromPalette", !1), { dataEach: function(t, n) {
				var r = e.getDataParams(n), i = L({}, a);
				i[s] = l(r), t.setItemVisual(n, "style", i);
			} };
		}
	}, Qk = new Ah(), $k = {
		createOnAllSeries: !0,
		reset: function(e, t) {
			if (!e.ignoreStyleOnData) {
				var n = e.getData(), r = e.visualStyleAccessPath || "itemStyle", i = Kk(e, r), a = n.getVisual("drawType");
				return { dataEach: n.hasItemOption ? function(e, t) {
					var n = e.getRawDataItem(t);
					if (n && n[r]) {
						Qk.option = n[r];
						var o = i(Qk);
						L(e.ensureUniqueItemVisual(t, "style"), o), Qk.option.decal && (e.setItemVisual(t, "decal", Qk.option.decal), Qk.option.decal.dirty = !0), a in o && e.setItemVisual(t, "colorFromPalette", !1);
					}
				} : null };
			}
		}
	}, eA = {
		performRawSeries: !0,
		overallReset: function(e) {
			var t = K();
			e.eachSeries(function(e) {
				if (!e.isColorBySeries()) {
					var n = e.type + "-" + e.getColorBy();
					Jk(e).scope = t.get(n) || t.set(n, {});
				}
			}), e.eachSeries(function(e) {
				if (!e.isColorBySeries()) {
					var t = e.getRawData(), n = {}, r = e.getData(), i = Jk(e).scope, a = qk(e, e.visualStyleAccessPath || "itemStyle");
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
function nA(e, t) {
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
	var n = new Of(), r = new _c({
		style: { fill: t.maskColor },
		zlevel: t.zlevel,
		z: 1e4
	});
	n.add(r);
	var i = new Nc({
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
	}), a = new _c({
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
	return t.showSpinner && (o = new wp({
		shape: {
			startAngle: -rA / 2,
			endAngle: -rA / 2 + .1,
			r: t.spinnerRadius
		},
		style: {
			stroke: t.color,
			lineCap: "round",
			lineWidth: t.lineWidth
		},
		zlevel: t.zlevel,
		z: 10001
	}), o.animateShape(!0).when(1e3, { endAngle: rA * 3 / 2 }).start("circularInOut"), o.animateShape(!0).when(1e3, { startAngle: rA * 3 / 2 }).delay(300).start("circularInOut"), n.add(o)), n.resize = function() {
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
var rA, iA = M((() => {
	q(), $m(), Eb(), rA = Math.PI;
}));
//#endregion
//#region node_modules/echarts/lib/core/Scheduler.js
function aA(e) {
	e.overallReset(e.ecModel, e.api, e.payload);
}
function oA(e) {
	return e.dirtyOnOverallProgress && sA;
}
function sA() {
	this.agent.dirty(), this.getDownstream().dirty();
}
function cA() {
	this.agent && this.agent.dirty();
}
function lA(e) {
	return e.plan ? e.plan(e.model, e.ecModel, e.api, e.payload) : null;
}
function uA(e) {
	e.useClearVisual && e.data.clearAllVisual();
	var t = e.resetDefines = Il(e.reset(e.model, e.ecModel, e.api, e.payload));
	return t.length > 1 ? z(t, function(e, t) {
		return dA(t);
	}) : gA;
}
function dA(e) {
	return function(t, n) {
		var r = n.data, i = n.resetDefines[e];
		if (i && i.dataEach) for (var a = t.start; a < t.end; a++) i.dataEach(r, a);
		else i && i.progress && i.progress(t, r);
	};
}
function fA(e) {
	return e.data.count();
}
function pA(e) {
	yA = null;
	try {
		e(_A, vA);
	} catch {}
	return yA;
}
function mA(e, t) {
	for (var n in t.prototype) e[n] = Mt;
}
var hA, gA, _A, vA, yA, bA = M((() => {
	q(), sb(), $_(), ok(), Ju(), Z(), hA = function() {
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
			e.pipelineContext = n.context = e.__preparePipelineContext ? e.__preparePipelineContext(t, n) : Tu(e, t, n);
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
			R(this._allHandlers, function(r) {
				var i = e.get(r.uid) || e.set(r.uid, {}), a = "";
				process.env.NODE_ENV !== "production" && (a = "\"reset\" and \"overallReset\" must not be both specified."), G(!(r.reset && r.overallReset), a), r.reset && this._createSeriesStageTask(r, i, t, n), r.overallReset && this._createOverallStageTask(r, i, t, n);
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
			R(e, function(e, s) {
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
				var s = t.uid, c = o.set(s, a && a.get(s) || ib({
					plan: lA,
					reset: uA,
					count: fA
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
			var i = this, a = t.overallTask = t.overallTask || ib({ reset: aA });
			a.context = {
				ecModel: n,
				api: r,
				overallReset: e.overallReset,
				scheduler: i
			};
			var o = a.agentStubMap, s = a.agentStubMap = K(), c = e.seriesType, l = e.getTargetSeries, u = e.dirtyOnOverallProgress, d = !1, f = "";
			process.env.NODE_ENV !== "production" && (f = "\"createOnAllSeries\" is not supported for \"overallReset\", because it will block all streams."), G(!e.createOnAllSeries, f), c ? n.eachRawSeriesByType(c, p) : l ? l(n, r).each(p) : R(n.getSeries(), p);
			function p(e) {
				var t = e.uid, n = s.set(t, o && o.get(t) || (d = !0, ib({
					reset: oA,
					onDirty: cA
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
			return V(e) && (e = {
				overallReset: e,
				seriesType: pA(e)
			}), e.uid = J_("stageHandler"), t && (e.visualType = t), e;
		}, e;
	}(), gA = dA(0), _A = {}, vA = {}, mA(_A, ak), mA(vA, qu), _A.eachSeriesByType = _A.eachRawSeriesByType = function(e) {
		yA = e;
	}, _A.eachComponent = function(e) {
		e.mainType === "series" && e.subType && (yA = e.subType);
	};
})), $, xA, SA, CA, wA, TA = M((() => {
	Eb(), $ = Q.darkColor, xA = $.background, SA = function() {
		return {
			axisLine: { lineStyle: { color: $.axisLine } },
			splitLine: { lineStyle: { color: $.axisSplitLine } },
			splitArea: { areaStyle: { color: [$.backgroundTint, $.backgroundTransparent] } },
			minorSplitLine: { lineStyle: { color: $.axisMinorSplitLine } },
			axisLabel: { color: $.axisLabel },
			axisName: {}
		};
	}, CA = {
		label: { color: $.secondary },
		itemStyle: { borderColor: $.borderTint },
		dividerLineStyle: { color: $.border }
	}, wA = {
		darkMode: !0,
		color: $.theme,
		backgroundColor: xA,
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
				backgroundColor: xA,
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
			x: CA,
			y: CA,
			backgroundColor: { borderColor: $.axisLine },
			body: { itemStyle: { borderColor: $.borderTint } }
		},
		timeAxis: SA(),
		logAxis: SA(),
		valueAxis: SA(),
		categoryAxis: SA(),
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
			var e = SA();
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
	}, wA.categoryAxis.splitLine.show = !1;
})), EA, DA = M((() => {
	q(), gn(), EA = function() {
		function e() {}
		return e.prototype.normalizeQuery = function(e) {
			var t = {}, n = {}, r = {};
			if (H(e)) {
				var i = tn(e);
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
				R(e, function(e, i) {
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
})), OA, kA, AA, jA, MA = M((() => {
	q(), OA = [
		"symbol",
		"symbolSize",
		"symbolRotate",
		"symbolOffset"
	], kA = OA.concat(["symbolKeepAspect"]), AA = {
		createOnAllSeries: !0,
		performRawSeries: !0,
		reset: function(e, t) {
			var n = e.getData();
			if (e.legendIcon && n.setVisual("legendIcon", e.legendIcon), !e.hasSymbolVisual) return;
			for (var r = {}, i = {}, a = !1, o = 0; o < OA.length; o++) {
				var s = OA[o], c = e.get(s);
				V(c) ? (a = !0, i[s] = c) : r[s] = c;
			}
			if (r.symbol = r.symbol || e.defaultSymbol, n.setVisual(L({
				legendIcon: e.legendIcon || r.symbol,
				symbolKeepAspect: e.get("symbolKeepAspect")
			}, r)), t.isSeriesFiltered(e)) return;
			var l = ct(i);
			function u(t, n) {
				for (var r = e.getRawValue(n), a = e.getDataParams(n), o = 0; o < l.length; o++) {
					var s = l[o];
					t.setItemVisual(n, s, i[s](r, a));
				}
			}
			return { dataEach: a ? u : null };
		}
	}, jA = {
		createOnAllSeries: !0,
		performRawSeries: !0,
		reset: function(e, t) {
			if (!e.hasSymbolVisual || t.isSeriesFiltered(e)) return;
			var n = e.getData();
			function r(e, t) {
				for (var n = e.getItemModel(t), r = 0; r < kA.length; r++) {
					var i = kA[r], a = n.getShallow(i, !0);
					a != null && e.setItemVisual(t, i, a);
				}
			}
			return { dataEach: n.hasItemOption ? r : null };
		}
	};
}));
//#endregion
//#region node_modules/echarts/lib/visual/helper.js
function NA(e, t, n) {
	switch (n) {
		case "color": return e.getItemVisual(t, "style")[e.getVisual("drawType")];
		case "opacity": return e.getItemVisual(t, "style").opacity;
		case "symbol":
		case "symbolSize":
		case "liftZ": return e.getItemVisual(t, n);
		default: process.env.NODE_ENV !== "production" && console.warn("Unknown visual type " + n);
	}
}
function PA(e, t) {
	switch (t) {
		case "color": return e.getVisual("style")[e.getVisual("drawType")];
		case "opacity": return e.getVisual("style").opacity;
		case "symbol":
		case "symbolSize":
		case "liftZ": return e.getVisual(t);
		default: process.env.NODE_ENV !== "production" && console.warn("Unknown visual type " + t);
	}
}
var FA = M((() => {}));
//#endregion
//#region node_modules/echarts/lib/util/event.js
function IA(e, t, n) {
	for (var r; e && !(t(e) && (r = e, n));) e = e.__hostTarget || e.parent;
	return r;
}
var LA = M((() => {})), RA, zA = M((() => {
	no(), RA = new to();
}));
//#endregion
//#region node_modules/echarts/lib/core/impl.js
function BA(e, t) {
	process.env.NODE_ENV !== "production" && HA[e] && El("Already has an implementation of " + e + "."), HA[e] = t;
}
function VA(e) {
	return process.env.NODE_ENV !== "production" && (HA[e] || El("Implementation of " + e + " doesn't exists.")), HA[e];
}
var HA, UA = M((() => {
	Pl(), HA = {};
}));
//#endregion
//#region node_modules/echarts/lib/chart/custom/customSeriesRegister.js
function WA(e, t) {
	GA[e] = t;
}
var GA, KA = M((() => {
	GA = {};
})), qA, JA, YA, XA = M((() => {
	qA = Math.round(Math.random() * 9), JA = typeof Object.defineProperty == "function", YA = function() {
		function e() {
			this._id = "__ec_inner_" + qA++;
		}
		return e.prototype.get = function(e) {
			return this._guard(e)[this._id];
		}, e.prototype.set = function(e, t) {
			var n = this._guard(e);
			return JA ? Object.defineProperty(n, this._id, {
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
function ZA(e) {
	return isFinite(e);
}
function QA(e, t, n) {
	var r = t.x == null ? 0 : t.x, i = t.x2 == null ? 1 : t.x2, a = t.y == null ? 0 : t.y, o = t.y2 == null ? 0 : t.y2;
	return t.global || (r = r * n.width + n.x, i = i * n.width + n.x, a = a * n.height + n.y, o = o * n.height + n.y), r = ZA(r) ? r : 0, i = ZA(i) ? i : 1, a = ZA(a) ? a : 0, o = ZA(o) ? o : 0, e.createLinearGradient(r, a, i, o);
}
function $A(e, t, n) {
	var r = n.width, i = n.height, a = Math.min(r, i), o = t.x == null ? .5 : t.x, s = t.y == null ? .5 : t.y, c = t.r == null ? .5 : t.r;
	return t.global || (o = o * r + n.x, s = s * i + n.y, c *= a), o = ZA(o) ? o : .5, s = ZA(s) ? s : .5, c = c >= 0 && ZA(c) ? c : .5, e.createRadialGradient(o, s, 0, o, s, c);
}
function ej(e, t, n) {
	for (var r = t.type === "radial" ? $A(e, t, n) : QA(e, t, n), i = t.colorStops, a = 0; a < i.length; a++) r.addColorStop(i[a].offset, i[a].color);
	return r;
}
function tj(e, t) {
	if (e === t || !e && !t) return !1;
	if (!e || !t || e.length !== t.length) return !0;
	for (var n = 0; n < e.length; n++) if (e[n] !== t[n]) return !0;
	return !1;
}
function nj(e) {
	return parseInt(e, 10);
}
function rj(e, t, n) {
	var r = ["width", "height"][t], i = ["clientWidth", "clientHeight"][t], a = ["paddingLeft", "paddingTop"][t], o = ["paddingRight", "paddingBottom"][t];
	if (n[r] != null && n[r] !== "auto") return parseFloat(n[r]);
	var s = document.defaultView.getComputedStyle(e);
	return (e[i] || nj(s[r]) || nj(e.style[r])) - (nj(s[a]) || 0) - (nj(s[o]) || 0) || 0;
}
var ij = M((() => {}));
//#endregion
//#region node_modules/zrender/lib/canvas/dashStyle.js
function aj(e, t) {
	return !e || e === "solid" || !(t > 0) ? null : e === "dashed" ? [4 * t, 2 * t] : e === "dotted" ? [t] : ft(e) ? [e] : B(e) ? e : null;
}
function oj(e) {
	var t = e.style, n = t.lineDash && t.lineWidth > 0 && aj(t.lineDash, t.lineWidth), r = t.lineDashOffset;
	if (n) {
		var i = t.strokeNoScale && e.getLineScale ? e.getLineScale() : 1;
		i && i !== 1 && (n = z(n, function(e) {
			return e / i;
		}), r /= i);
	}
	return [n, r];
}
var sj = M((() => {
	q();
}));
//#endregion
//#region node_modules/zrender/lib/canvas/graphic.js
function cj(e) {
	var t = e.stroke;
	return !(t == null || t === "none" || !(e.lineWidth > 0));
}
function lj(e) {
	return typeof e == "string" && e !== "none";
}
function uj(e) {
	var t = e.fill;
	return t != null && t !== "none";
}
function dj(e, t) {
	if (t.fillOpacity != null && t.fillOpacity !== 1) {
		var n = e.globalAlpha;
		e.globalAlpha = t.fillOpacity * t.opacity, e.fill(), e.globalAlpha = n;
	} else e.fill();
}
function fj(e, t) {
	if (t.strokeOpacity != null && t.strokeOpacity !== 1) {
		var n = e.globalAlpha;
		e.globalAlpha = t.strokeOpacity * t.opacity, e.stroke(), e.globalAlpha = n;
	} else e.stroke();
}
function pj(e, t, n) {
	var r = On(t.image, t.__image, n);
	if (An(r)) {
		var i = e.createPattern(r, t.repeat || "repeat");
		if (typeof DOMMatrix == "function" && i && i.setTransform) {
			var a = new DOMMatrix();
			a.translateSelf(t.x || 0, t.y || 0), a.rotateSelf(0, 0, (t.rotation || 0) * Zt), a.scaleSelf(t.scaleX || 1, t.scaleY || 1), i.setTransform(a);
		}
		return i;
	}
}
function mj(e, t, n, r, i) {
	var a, o = cj(n), s = uj(n), c = n.strokePercent, l = c < 1, u = !t.path;
	(!t.silent || l) && u && t.createPathProxy();
	var d = t.path || kj, f = t.__dirty;
	if (!r) {
		var p = n.fill, m = n.stroke, h = s && !!p.colorStops, g = o && !!m.colorStops, _ = s && !!p.image, v = o && !!m.image, y = void 0, b = void 0, x = void 0, S = void 0, C = void 0;
		(h || g) && (C = t.getBoundingRect()), h && (y = f ? ej(e, p, C) : t.__canvasFillGradient, t.__canvasFillGradient = y), g && (b = f ? ej(e, m, C) : t.__canvasStrokeGradient, t.__canvasStrokeGradient = b), _ && (x = f || !t.__canvasFillPattern ? pj(e, p, t) : t.__canvasFillPattern, t.__canvasFillPattern = x), v && (S = f || !t.__canvasStrokePattern ? pj(e, m, t) : t.__canvasStrokePattern, t.__canvasStrokePattern = S), h ? e.fillStyle = y : _ && (x ? e.fillStyle = x : s = !1), g ? e.strokeStyle = b : v && (S ? e.strokeStyle = S : o = !1);
	}
	var w = t.getGlobalScale();
	d.setScale(w[0], w[1], t.segmentIgnoreThreshold);
	var T, E;
	e.setLineDash && n.lineDash && (a = oj(t), T = a[0], E = a[1]);
	var D = !0;
	(u || f & 4) && (d.setDPR(e.dpr), l ? d.setContext(null) : (d.setContext(e), D = !1), d.reset(), t.buildPath(d, t.shape, r), d.toStatic(), t.pathUpdated()), D && d.rebuildPath(e, l ? c : 1), T && (e.setLineDash(T), e.lineDashOffset = E), r ? (i.batchFill = s, i.batchStroke = o) : n.strokeFirst ? (o && fj(e, n), s && dj(e, n)) : (s && dj(e, n), o && fj(e, n)), T && e.setLineDash([]);
}
function hj(e, t, n) {
	var r = t.__image = On(n.image, t.__image, t, t.onload);
	if (r && An(r)) {
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
function gj(e, t, n) {
	var r, i = n.text;
	if (i != null && (i += ""), i) {
		e.font = n.font || "12px sans-serif", e.textAlign = n.textAlign, e.textBaseline = n.textBaseline;
		var a = void 0, o = void 0;
		e.setLineDash && n.lineDash && (r = oj(t), a = r[0], o = r[1]), a && (e.setLineDash(a), e.lineDashOffset = o), n.strokeFirst ? (cj(n) && e.strokeText(i, n.x, n.y), uj(n) && e.fillText(i, n.x, n.y)) : (uj(n) && e.fillText(i, n.x, n.y), cj(n) && e.strokeText(i, n.x, n.y)), a && e.setLineDash([]);
	}
}
function _j(e, t, n, r, i) {
	var a = !1;
	if (!r && (n ||= {}, t === n)) return !1;
	if (r || t.opacity !== n.opacity) {
		wj(e, i), a = !0;
		var o = Math.max(Math.min(t.opacity, 1), 0);
		e.globalAlpha = isNaN(o) ? Mo.opacity : o;
	}
	(r || t.blend !== n.blend) && (a ||= (wj(e, i), !0), e.globalCompositeOperation = t.blend || Mo.blend);
	for (var s = 0; s < Aj.length; s++) {
		var c = Aj[s];
		(r || t[c] !== n[c]) && (a ||= (wj(e, i), !0), e[c] = e.dpr * (t[c] || 0));
	}
	return (r || t.shadowColor !== n.shadowColor) && (a ||= (wj(e, i), !0), e.shadowColor = t.shadowColor || Mo.shadowColor), a;
}
function vj(e, t, n, r, i) {
	var a = t.style, o = r ? null : n && n.style || {};
	if (a === o) return !1;
	var s = _j(e, a, o, r, i);
	if ((r || a.fill !== o.fill) && (s ||= (wj(e, i), !0), lj(a.fill) && (e.fillStyle = a.fill)), (r || a.stroke !== o.stroke) && (s ||= (wj(e, i), !0), lj(a.stroke) && (e.strokeStyle = a.stroke)), (r || a.opacity !== o.opacity) && (s ||= (wj(e, i), !0), e.globalAlpha = a.opacity == null ? 1 : a.opacity), t.hasStroke()) {
		var c = a.lineWidth / (a.strokeNoScale && t.getLineScale ? t.getLineScale() : 1);
		e.lineWidth !== c && (s ||= (wj(e, i), !0), e.lineWidth = c);
	}
	for (var l = 0; l < jj.length; l++) {
		var u = jj[l], d = u[0];
		(r || a[d] !== o[d]) && (s ||= (wj(e, i), !0), e[d] = a[d] || u[1]);
	}
	return s;
}
function yj(e, t, n, r, i) {
	return _j(e, t.style, n && n.style, r, i);
}
function bj(e, t) {
	var n = t.transform, r = e.dpr || 1;
	n ? e.setTransform(r * n[0], r * n[1], r * n[2], r * n[3], r * n[4], r * n[5]) : e.setTransform(r, 0, 0, r, 0, 0);
}
function xj(e, t, n) {
	for (var r = !1, i = 0; i < e.length; i++) {
		var a = e[i];
		r ||= a.isZeroArea(), bj(t, a), t.beginPath(), a.buildPath(t, a.shape), t.clip();
	}
	n.allClipped = r;
}
function Sj(e, t) {
	return e && t ? e[0] !== t[0] || e[1] !== t[1] || e[2] !== t[2] || e[3] !== t[3] || e[4] !== t[4] || e[5] !== t[5] : !(!e && !t);
}
function Cj(e) {
	var t = uj(e), n = cj(e);
	return !(e.lineDash || !(+t ^ n) || t && typeof e.fill != "string" || n && typeof e.stroke != "string" || e.strokePercent < 1 || e.strokeOpacity < 1 || e.fillOpacity < 1);
}
function wj(e, t) {
	t.batchFill && (t.batchFill = !1, e.fill()), t.batchStroke && (t.batchStroke = !1, e.stroke());
}
function Tj(e, t) {
	var n = {
		inHover: !1,
		viewWidth: 0,
		viewHeight: 0,
		beforeBrushParam: {}
	};
	Ej(e, t, n), Dj(e, n);
}
function Ej(e, t, n) {
	var r = t.transform;
	if (!t.shouldBePainted(n.viewWidth, n.viewHeight, !1, !1)) {
		t.__dirty &= -2, t.__isRendered = !1;
		return;
	}
	var i = t.__clipPaths, a = n.prevElClipPaths, o = t.style, s = !1, c = !1;
	if ((!a || tj(i, a)) && (a && (wj(e, n), e.restore(), c = s = !0, n.prevElClipPaths = null, n.allClipped = !1, n.prevEl = null), i && i.length && (wj(e, n), e.save(), xj(i, e, n), s = !0, n.prevElClipPaths = i)), n.allClipped) {
		t.__dirty &= -2, t.__isRendered = !1;
		return;
	}
	t.beforeBrush && t.beforeBrush(n.beforeBrushParam), t.innerBeforeBrush();
	var l = n.prevEl;
	l || (c = s = !0);
	var u = t instanceof Qs && t.autoBatch && Cj(o);
	s || Sj(r, l.transform) ? (wj(e, n), bj(e, t)) : u || wj(e, n), t instanceof Qs ? (n.lastDrawType !== Mj && (c = !0, n.lastDrawType = Mj), vj(e, t, l, c, n), (!u || !n.batchFill && !n.batchStroke) && e.beginPath(), mj(e, t, o, u, n)) : t instanceof tc ? (n.lastDrawType !== Pj && (c = !0, n.lastDrawType = Pj), vj(e, t, l, c, n), gj(e, t, o)) : t instanceof oc ? (n.lastDrawType !== Nj && (c = !0, n.lastDrawType = Nj), yj(e, t, l, c, n), hj(e, t, o)) : t.getTemporalDisplayables && (n.lastDrawType !== Fj && (c = !0, n.lastDrawType = Fj), Oj(e, t, n)), t.innerAfterBrush(), t.afterBrush && (u && wj(e, n), t.afterBrush()), n.prevEl = t, t.__dirty = 0, t.__isRendered = !0;
}
function Dj(e, t) {
	wj(e, t), t.prevElClipPaths && e.restore();
}
function Oj(e, t, n) {
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
		c.beforeBrush && c.beforeBrush(n.beforeBrushParam), c.innerBeforeBrush(), Ej(e, c, a), c.innerAfterBrush(), c.afterBrush && c.afterBrush(), a.prevEl = c;
	}
	Dj(e, a);
	for (var l = 0, u = i.length; l < u; l++) {
		var c = i[l];
		c.beforeBrush && c.beforeBrush(n.beforeBrushParam), c.innerBeforeBrush(), Ej(e, c, a), c.innerAfterBrush(), c.afterBrush && c.afterBrush(), a.prevEl = c;
	}
	Dj(e, a), t.clearTemporalDisplayables(), t.notClear = !0, e.restore();
}
var kj, Aj, jj, Mj, Nj, Pj, Fj, Ij = M((() => {
	zo(), bs(), Mn(), ij(), $s(), sc(), nc(), q(), sj(), uo(), Ye(), kj = new ys(!0), Aj = [
		"shadowBlur",
		"shadowOffsetX",
		"shadowOffsetY"
	], jj = [
		["lineCap", "butt"],
		["lineJoin", "miter"],
		["miterLimit", 10]
	], Mj = 1, Nj = 2, Pj = 3, Fj = 4;
}));
//#endregion
//#region node_modules/echarts/lib/util/decal.js
function Lj(e, t) {
	if (e === "none") return null;
	var n = t.getDevicePixelRatio(), r = t.getZr(), i = r.painter.type === "svg";
	e.dirty && Uj.delete(e);
	var a = Uj.get(e);
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
	return c(s), s.rotation = o.rotation, s.scaleX = s.scaleY = i ? 1 : 1 / n, Uj.set(e, s), e.dirty = !1, s;
	function c(e) {
		for (var t = [n], a = !0, s = 0; s < Gj.length; ++s) {
			var c = o[Gj[s]];
			if (c != null && !B(c) && !H(c) && !ft(c) && typeof c != "boolean") {
				a = !1;
				break;
			}
			t.push(c);
		}
		var l;
		if (a) {
			l = t.join(",") + (i ? "-svg" : "");
			var u = Wj.get(l);
			u && (i ? e.svgElement = u : e.image = u);
		}
		var d = zj(o.dashArrayX), f = Bj(o.dashArrayY), p = Rj(o.symbol), m = Vj(d), h = Hj(f), g = !i && Je.createCanvas(), _ = i && {
			tag: "g",
			attrs: {},
			key: "dcl",
			children: []
		}, v = b(), y;
		g && (g.width = v.width * n, g.height = v.height * n, y = g.getContext("2d")), x(), a && Wj.put(l, g || _), e.image = g, e.svgElement = _, e.svgWidth = v.width, e.svgHeight = v.height;
		function b() {
			for (var e = 1, t = 0, n = m.length; t < n; ++t) e = il(e, m[t]);
			for (var r = 1, t = 0, n = p.length; t < n; ++t) r = il(r, p[t].length);
			e *= r;
			var i = h * m.length * p.length;
			if (process.env.NODE_ENV !== "production") {
				var a = function(e) {
					console.warn("Calculated decal size is greater than " + e + " due to decal option settings so " + e + " is used for the decal size. Please consider changing the decal option to make a smaller decal or set " + e + " to be larger to avoid incontinuity.");
				};
				e > o.maxTileWidth && a("maxTileWidth"), i > o.maxTileHeight && a("maxTileHeight");
			}
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
				var l = i ? 1 : n, u = dx(c, e * l, t * l, a * l, s * l, o.color, o.symbolKeepAspect);
				if (i) {
					var d = r.painter.renderOneToVNode(u);
					d && _.children.push(d);
				} else Tj(y, u);
			}
		}
	}
}
function Rj(e) {
	if (!e || e.length === 0) return [["rect"]];
	if (H(e)) return [[e]];
	for (var t = !0, n = 0; n < e.length; ++n) if (!H(e[n])) {
		t = !1;
		break;
	}
	if (t) return Rj([e]);
	for (var r = [], n = 0; n < e.length; ++n) H(e[n]) ? r.push([e[n]]) : r.push(e[n]);
	return r;
}
function zj(e) {
	if (!e || e.length === 0) return [[0, 0]];
	if (ft(e)) {
		var t = Math.ceil(e);
		return [[t, t]];
	}
	for (var n = !0, r = 0; r < e.length; ++r) if (!ft(e[r])) {
		n = !1;
		break;
	}
	if (n) return zj([e]);
	for (var i = [], r = 0; r < e.length; ++r) if (ft(e[r])) {
		var t = Math.ceil(e[r]);
		i.push([t, t]);
	} else {
		var t = z(e[r], function(e) {
			return Math.ceil(e);
		});
		t.length % 2 == 1 ? i.push(t.concat(t)) : i.push(t);
	}
	return i;
}
function Bj(e) {
	if (!e || typeof e == "object" && e.length === 0) return [0, 0];
	if (ft(e)) {
		var t = Math.ceil(e);
		return [t, t];
	}
	var n = z(e, function(e) {
		return Math.ceil(e);
	});
	return e.length % 2 ? n.concat(n) : n;
}
function Vj(e) {
	return z(e, function(e) {
		return Hj(e);
	});
}
function Hj(e) {
	for (var t = 0, n = 0; n < e.length; ++n) t += e[n];
	return e.length % 2 == 1 ? t * 2 : t;
}
var Uj, Wj, Gj, Kj = M((() => {
	XA(), En(), q(), Sl(), Sx(), Ij(), Ye(), Uj = new YA(), Wj = new Tn(100), Gj = [
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
function qj(e, t) {
	e.eachRawSeries(function(n) {
		if (!e.isSeriesFiltered(n)) {
			var r = n.getData();
			r.hasItemVisual() && r.each(function(e) {
				var n = r.getItemVisual(e, "decal");
				if (n) {
					var i = r.ensureUniqueItemVisual(e, "style");
					i.decal = Lj(n, t);
				}
			});
			var i = r.getVisual("decal");
			if (i) {
				var a = r.getVisual("style");
				a.decal = Lj(i, t);
			}
		}
	});
}
var Jj, Yj = M((() => {
	Kj(), Z(), Jj = Eu(qj);
}));
//#endregion
//#region node_modules/echarts/lib/core/echarts.js
function Xj(e) {
	return function() {
		var t = [...arguments];
		if (this.isDisposed()) {
			$j(this.id);
			return;
		}
		return Qj(this, e, t);
	};
}
function Zj(e) {
	return function() {
		var t = [...arguments];
		return Qj(this, e, t);
	};
}
function Qj(e, t, n) {
	return n[0] = n[0] && n[0].toLowerCase(), to.prototype[t].apply(e, n);
}
function $j(e) {
	process.env.NODE_ENV !== "production" && Tl("Instance " + e + " has been disposed");
}
function eM(e, t, n) {
	var r = !(n && n.ssr);
	if (r) {
		if (process.env.NODE_ENV !== "production" && !e) throw Error("Initialize failed: invalid dom.");
		var i = tM(e);
		if (i) return process.env.NODE_ENV !== "production" && Tl("There is a chart instance already initialized on the dom."), i;
		process.env.NODE_ENV !== "production" && ht(e) && e.nodeName.toUpperCase() !== "CANVAS" && (!e.clientWidth && (!n || n.width == null) || !e.clientHeight && (!n || n.height == null)) && Tl("Can't get DOM width or height. Please check dom.clientWidth and dom.clientHeight. They should not be 0.For example, you may need to call this in the callback of window.onload.");
	}
	var a = new uN(e, t, n);
	return a.id = "ec_" + CN++, xN[a.id] = a, r && cu(e, wN, a.id), oN(a), RA.trigger("afterinit", a), a;
}
function tM(e) {
	return xN[lu(e, wN)];
}
function nM(e, t) {
	yN[e] = t;
}
function rM(e) {
	tt(_N, e) < 0 && _N.push(e);
}
function iM(e, t) {
	fM(gN, e, t, xM);
}
function aM(e) {
	sM("afterinit", e);
}
function oM(e) {
	sM("afterupdate", e);
}
function sM(e, t) {
	RA.on(e, t);
}
function cM(e, t, n) {
	var r, i, a, o, s;
	V(t) && (n = t, t = ""), U(e) ? (r = e.type, i = e.event, o = e.update, s = e.publishNonRefinedEvent, n ||= e.action, a = e.refineEvent) : (r = e, i = t);
	function c(e) {
		return e.toLowerCase();
	}
	i = c(i || r);
	var l = a ? c(r) : i;
	pN[r] || (G(RM.test(r) && RM.test(i)), a && G(i !== r), pN[r] = {
		actionType: r,
		refinedEventType: i,
		nonRefinedEventType: l,
		update: o,
		action: n,
		refineEvent: a
	}, hN[i] = 1, a && s && (hN[l] = 1), process.env.NODE_ENV !== "production" && mN[l] && El(l + " must not be shared; use \"refineEvent\" if you intend to share an event name."), mN[l] = r);
}
function lM(e, t) {
	k_.register(e, t);
}
function uM(e, t) {
	fM(vN, e, t, CM, "layout", !0);
}
function dM(e, t) {
	fM(vN, e, t, EM, "visual", !0);
}
function fM(e, t, n, r, i, a) {
	if ((V(t) || U(t)) && (n = t, t = r), process.env.NODE_ENV !== "production") {
		if (isNaN(t) || t == null) throw Error("Illegal priority");
		R(e, function(e) {
			G(e.__raw !== n);
		});
	}
	if (!(tt(TN, n) >= 0)) {
		TN.push(n);
		var o = hA.wrapStageHandler(n, i);
		o.__prio = t, o.__raw = n, e.push(o), process.env.NODE_ENV !== "production" && a && G(!o.dirtyOnOverallProgress, "dirtyOnOverallProgress is not allowed in " + i + " stage; otherwise progressive rendering is disabled on all series.");
	}
}
function pM(e, t) {
	bN[e] = t;
}
function mM(e, t, n) {
	var r = VA("registerMap");
	r && r(e, t, n);
}
function hM(e, t, n, r) {
	return { eventContent: {
		selected: Ad(n),
		isFromClick: t.isFromClick || !1
	} };
}
var gM, _M, vM, yM, bM, xM, SM, CM, wM, TM, EM, DM, OM, kM, AM, jM, MM, NM, PM, FM, IM, LM, RM, zM, BM, VM, HM, UM, WM, GM, KM, qM, JM, YM, XM, ZM, QM, $M, eN, tN, nN, rN, iN, aN, oN, sN, cN, lN, uN, dN, fN, pN, mN, hN, gN, _N, vN, yN, bN, xN, SN, CN, wN, TN, EN, DN = M((() => {
	F(), FO(), q(), en(), YD(), no(), ok(), Ju(), j_(), pk(), zk(), Uk(), lx(), Gk(), mS(), $m(), Fu(), nf(), Z(), rD(), tA(), iA(), bA(), TA(), gn(), DA(), Wu(), MA(), FA(), Pl(), oD(), yb(), Av(), LA(), zA(), Ye(), UA(), Yw(), VO(), Yj(), gM = 1, _M = 800, vM = 900, yM = 920, bM = 1e3, xM = 2e3, SM = 5e3, CM = 1e3, wM = 1100, TM = 2e3, EM = 3e3, DM = 4e3, OM = 4500, kM = 4600, AM = 5e3, jM = 6e3, MM = 7e3, NM = {
		PROCESSOR: {
			SERIES_FILTER: _M,
			AXIS_STATISTICS: yM,
			FILTER: bM,
			STATISTIC: SM,
			STATISTICS: SM
		},
		VISUAL: {
			LAYOUT: CM,
			PROGRESSIVE_LAYOUT: wM,
			GLOBAL: TM,
			CHART: EM,
			POST_CHART_LAYOUT: kM,
			COMPONENT: DM,
			BRUSH: AM,
			CHART_ITEM: OM,
			ARIA: jM,
			DECAL: MM
		}
	}, PM = "__flagInMainProcess", FM = "__mainProcessVersion", IM = "__pendingUpdate", LM = "__needsUpdateStatus", RM = /^[a-zA-Z0-9_]+$/, zM = "__connectUpdateStatus", BM = 0, VM = 1, HM = 2, UM = function(e) {
		P(t, e);
		function t() {
			return e !== null && e.apply(this, arguments) || this;
		}
		return t;
	}(to), WM = UM.prototype, WM.on = Zj("on"), WM.off = Zj("off"), uN = function(e) {
		P(t, e);
		function t(t, n, r) {
			var i = e.call(this, new EA()) || this;
			i._chartsViews = [], i._chartsMap = {}, i._componentsViews = [], i._componentsMap = {}, i._pendingActions = [], r ||= {}, i.__v_skip = !0, i._dom = t;
			var a = "canvas", o = "auto", s = !1;
			if (i[FM] = 1, process.env.NODE_ENV !== "production") {
				var c = J.hasGlobalWindow ? window : global;
				c && (a = W(c.__ECHARTS__DEFAULT__RENDERER__, a), o = W(c.__ECHARTS__DEFAULT__COARSE_POINTER, o), s = W(c.__ECHARTS__DEFAULT__USE_DIRTY_RECT__, s));
			}
			r.ssr && AO(function(e) {
				var t = Nu(e), n = t.dataIndex;
				if (n != null) {
					var r = K();
					return r.set("series_index", t.seriesIndex), r.set("data_index", n), t.ssrType && r.set("ssr_type", t.ssrType), r;
				}
			});
			var l = i._zr = OO(t, {
				renderer: r.renderer || a,
				devicePixelRatio: r.devicePixelRatio,
				width: r.width,
				height: r.height,
				ssr: r.ssr,
				useDirtyRect: W(r.useDirtyRect, s),
				useCoarsePointer: W(r.useCoarsePointer, o),
				pointerSize: r.pointerSize
			});
			i._ssr = r.ssr, i._throttledZrFlush = ZE(Kt(l.flush, l), 17), i._updateTheme(n), i._locale = xv(r.locale || kv), i._coordSysMgr = new k_();
			var u = i._api = aN(i);
			function d(e, t) {
				return e.__prio - t.__prio;
			}
			return KD(vN, d), KD(gN, d), i._scheduler = new hA(i, u, gN, vN), i._messageCenter = new UM(), i._initEvents(), i.resize = Kt(i.resize, i), l.animation.on("frame", i._onframe, i), eN(l, i), tN(l, i), Tt(i), i;
		}
		return t.prototype._onframe = function() {
			if (!this._disposed) {
				var e = this._scheduler, t = this._model, n = this._api;
				if (cN(this), this[IM]) {
					var r = this[IM].silent;
					this[PM] = !0, lN(this);
					try {
						GM(this), JM.update.call(this, null, this[IM].updateParams);
					} catch (e) {
						throw this[PM] = !1, this[IM] = null, e;
					}
					this._zr.flush(), this[PM] = !1, this[IM] = null, QM.call(this, r), $M.call(this, r);
				} else if (e.unfinished) {
					var i = gM;
					do {
						e.unfinished = !1;
						var a = Je.getTime();
						e.performSeriesTasks(t), e.performDataProcessorTasks(t), XM(this, t), e.performVisualTasks(t), iN(this, this._model, n, "remain", {}), i -= Je.getTime() - a;
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
			if (this[PM]) {
				process.env.NODE_ENV !== "production" && El("`setOption` should not be called during main process.");
				return;
			}
			if (this._disposed) {
				$j(this.id);
				return;
			}
			var r, i, a;
			if (U(t) && (n = t.lazyUpdate, r = t.silent, i = t.replaceMerge, a = t.transition, t = t.notMerge), this[PM] = !0, lN(this), !this._model || t) {
				var o = new fk(this._api), s = this._theme, c = this._model = new ak();
				c.scheduler = this._scheduler, c.ssr = this._ssr, c.init(null, null, null, s, this._locale, o);
			}
			this._model.setOption(e, { replaceMerge: i }, _N);
			var l = {
				seriesTransition: a,
				optionChanged: !0
			};
			if (n) this[IM] = {
				silent: r,
				updateParams: l
			}, this[PM] = !1, this.getZr().wakeUp();
			else {
				try {
					GM(this), JM.update.call(this, null, l);
				} catch (e) {
					throw this[IM] = null, this[PM] = !1, e;
				}
				this._ssr || this._zr.flush(), this[IM] = null, this[PM] = !1, QM.call(this, r), $M.call(this, r);
			}
		}, t.prototype.setTheme = function(e, t) {
			if (this[PM]) {
				process.env.NODE_ENV !== "production" && El("`setTheme` should not be called during main process.");
				return;
			}
			if (this._disposed) {
				$j(this.id);
				return;
			}
			var n = this._model;
			if (n) {
				var r = t && t.silent, i = null;
				this[IM] && (r ??= this[IM].silent, i = this[IM].updateParams, this[IM] = null), this[PM] = !0, lN(this);
				try {
					this._updateTheme(e), n.setTheme(this._theme), GM(this), JM.update.call(this, { type: "setTheme" }, i);
				} catch (e) {
					throw this[PM] = !1, e;
				}
				this[PM] = !1, QM.call(this, r), $M.call(this, r);
			}
		}, t.prototype._updateTheme = function(e) {
			H(e) && (e = yN[e]), e && (e = I(e), e && Fk(e, !0), this._theme = e);
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
			return process.env.NODE_ENV !== "production" && Ol("getRenderedCanvas", "renderToCanvas"), this.renderToCanvas(e);
		}, t.prototype.renderToCanvas = function(e) {
			e ||= {};
			var t = this._zr.painter;
			if (process.env.NODE_ENV !== "production" && t.type !== "canvas") throw Error("renderToCanvas can only be used in the canvas renderer.");
			return t.getRenderedCanvas({
				backgroundColor: e.backgroundColor || this._model.get("backgroundColor"),
				pixelRatio: e.pixelRatio || this.getDevicePixelRatio()
			});
		}, t.prototype.renderToSVGString = function(e) {
			e ||= {};
			var t = this._zr.painter;
			if (process.env.NODE_ENV !== "production" && t.type !== "svg") throw Error("renderToSVGString can only be used in the svg renderer.");
			return t.renderToString({ useViewBox: e.useViewBox });
		}, t.prototype.getSvgDataURL = function() {
			var e = this._zr;
			return R(e.storage.getDisplayList(), function(e) {
				e.stopAnimation(null, !0);
			}), e.painter.toDataURL();
		}, t.prototype.getDataURL = function(e) {
			if (this._disposed) {
				$j(this.id);
				return;
			}
			e ||= {};
			var t = e.excludeComponents, n = this._model, r = [], i = this;
			R(t, function(e) {
				n.eachComponent({ mainType: e }, function(e) {
					var t = i._componentsMap[e.__viewId];
					t.group.ignore || (r.push(t), t.group.ignore = !0);
				});
			});
			var a = this._zr.painter.getType() === "svg" ? this.getSvgDataURL() : this.renderToCanvas(e).toDataURL("image/" + (e && e.type || "png"));
			return R(r, function(e) {
				e.group.ignore = !1;
			}), a;
		}, t.prototype.getConnectedDataURL = function(e) {
			if (this._disposed) {
				$j(this.id);
				return;
			}
			var t = e.type === "svg", n = this.group, r = Math.min, i = Math.max, a = Infinity;
			if (SN[n]) {
				var o = a, s = a, c = -a, l = -a, u = [], d = e && e.pixelRatio || this.getDevicePixelRatio();
				R(xN, function(a, d) {
					if (a.group === n) {
						var f = t ? a.getZr().painter.getSvgDom().innerHTML : a.renderToCanvas(I(e)), p = a.getDom().getBoundingClientRect();
						o = r(p.left, o), s = r(p.top, s), c = i(p.right, c), l = i(p.bottom, l), u.push({
							dom: f,
							left: p.left,
							top: p.top
						});
					}
				}), o *= d, s *= d, c *= d, l *= d;
				var f = c - o, p = l - s, m = Je.createCanvas(), h = OO(m, { renderer: t ? "svg" : "canvas" });
				if (h.resize({
					width: f,
					height: p
				}), t) {
					var g = "";
					return R(u, function(e) {
						var t = e.left - o, n = e.top - s;
						g += "<g transform=\"translate(" + t + "," + n + ")\">" + e.dom + "</g>";
					}), h.painter.getSvgRoot().innerHTML = g, e.connectedBackgroundColor && h.painter.setBackgroundColor(e.connectedBackgroundColor), h.refreshImmediately(), h.painter.toDataURL();
				}
				return e.connectedBackgroundColor && h.add(new _c({
					shape: {
						x: 0,
						y: 0,
						width: f,
						height: p
					},
					style: { fill: e.connectedBackgroundColor }
				})), R(u, function(e) {
					var t = new oc({ style: {
						x: e.left * d - o,
						y: e.top * d - s,
						image: e.dom
					} });
					h.add(t);
				}), h.refreshImmediately(), m.toDataURL("image/" + (e && e.type || "png"));
			}
			return this.getDataURL(e);
		}, t.prototype.convertToPixel = function(e, t, n) {
			return YM(this, "convertToPixel", e, t, n);
		}, t.prototype.convertToLayout = function(e, t, n) {
			return YM(this, "convertToLayout", e, t, n);
		}, t.prototype.convertFromPixel = function(e, t, n) {
			return YM(this, "convertFromPixel", e, t, n);
		}, t.prototype.containPixel = function(e, t) {
			if (this._disposed) {
				$j(this.id);
				return;
			}
			var n = this._model, r;
			return R(iu(n, e), function(e, n) {
				n.indexOf("Models") >= 0 && R(e, function(e) {
					var i = e.coordinateSystem;
					if (i && i.containPoint) r ||= !!i.containPoint(t);
					else if (n === "seriesModels") {
						var a = this._chartsMap[e.__viewId];
						a && a.containPoint ? r ||= a.containPoint(t, e) : process.env.NODE_ENV !== "production" && Tl(n + ": " + (a ? "The found component do not support containPoint." : "No view mapping to the found component."));
					} else process.env.NODE_ENV !== "production" && Tl(n + ": containPoint is not supported");
				}, this);
			}, this), !!r;
		}, t.prototype.getVisual = function(e, t) {
			var n = this._model, r = iu(n, e, { defaultMainType: "series" }), i = r.seriesModel;
			process.env.NODE_ENV !== "production" && (i || Tl("There is no specified series model"));
			var a = i.getData(), o = r.hasOwnProperty("dataIndexInside") ? r.dataIndexInside : r.hasOwnProperty("dataIndex") ? a.indexOfRawIndex(r.dataIndex) : null;
			return o == null ? PA(a, t) : NA(a, o, t);
		}, t.prototype.getViewOfComponentModel = function(e) {
			return this._componentsMap[e.__viewId];
		}, t.prototype.getViewOfSeriesModel = function(e) {
			return this._chartsMap[e.__viewId];
		}, t.prototype._initEvents = function() {
			var e = this;
			R(fN, function(t) {
				var n = function(n) {
					var r = e.getModel(), i = n.target, a, o = t === "globalout";
					if (o ? a = {} : i && IA(i, function(e) {
						var t = Nu(e);
						if (t && t.dataIndex != null) {
							var n = t.dataModel || r.getSeriesByIndex(t.seriesIndex);
							return a = n && n.getDataParams(t.dataIndex, t.dataType, i) || {}, !0;
						}
						if (t.eventData) return a = L({}, t.eventData), !0;
					}, !0), a) {
						var s = a.componentType, c = a.componentIndex;
						(s === "markLine" || s === "markPoint" || s === "markArea") && (s = "series", c = a.seriesIndex);
						var l = s && c != null && r.getComponent(s, c), u = l && e[l.mainType === "series" ? "_chartsMap" : "_componentsMap"][l.__viewId];
						process.env.NODE_ENV !== "production" && !o && !(l && u) && Tl("model or view can not be found by params"), a.event = n, a.type = t, e._$eventProcessor.eventInfo = {
							targetEl: i,
							packedEvent: a,
							model: l,
							view: u
						}, e.trigger(t, a);
					}
				};
				n.zrEventfulCallAtLast = !0, e._zr.on(t, n, e);
			});
			var t = this._messageCenter;
			R(hN, function(n, r) {
				t.on(r, function(t) {
					e.trigger(r, t);
				});
			}), aD(t, this, this._api);
		}, t.prototype.isDisposed = function() {
			return this._disposed;
		}, t.prototype.clear = function() {
			if (this._disposed) {
				$j(this.id);
				return;
			}
			this.setOption({ series: [] }, !0);
		}, t.prototype.dispose = function() {
			if (this._disposed) {
				$j(this.id);
				return;
			}
			this._disposed = !0, this.getDom() && cu(this.getDom(), wN, "");
			var e = this, t = e._api, n = e._model;
			R(e._componentsViews, function(e) {
				e.dispose(n, t);
			}), R(e._chartsViews, function(e) {
				e.dispose(n, t);
			}), e._zr.dispose(), e._dom = e._model = e._chartsMap = e._componentsMap = e._chartsViews = e._componentsViews = e._scheduler = e._api = e._zr = e._throttledZrFlush = e._theme = e._coordSysMgr = e._messageCenter = null, delete xN[e.id];
		}, t.prototype.resize = function(e) {
			if (this[PM]) {
				process.env.NODE_ENV !== "production" && El("`resize` should not be called during main process.");
				return;
			}
			if (this._disposed) {
				$j(this.id);
				return;
			}
			this._zr.resize(e);
			var t = this._model;
			if (this._loadingFX && this._loadingFX.resize(), t) {
				var n = t.resetOption("media"), r = e && e.silent;
				this[IM] && (r ??= this[IM].silent, n = !0, this[IM] = null), this[PM] = !0, lN(this);
				try {
					n && GM(this), JM.update.call(this, {
						type: "resize",
						animation: L({ duration: 0 }, e && e.animation)
					});
				} catch (e) {
					throw this[PM] = !1, e;
				}
				this[PM] = !1, QM.call(this, r), $M.call(this, r);
			}
		}, t.prototype.showLoading = function(e, t) {
			if (this._disposed) {
				$j(this.id);
				return;
			}
			if (U(e) && (t = e, e = ""), e ||= "default", this.hideLoading(), !bN[e]) {
				process.env.NODE_ENV !== "production" && Tl("Loading effects " + e + " not exists.");
				return;
			}
			var n = bN[e](this._api, t), r = this._zr;
			this._loadingFX = n, r.add(n);
		}, t.prototype.hideLoading = function() {
			if (this._disposed) {
				$j(this.id);
				return;
			}
			this._loadingFX && this._zr.remove(this._loadingFX), this._loadingFX = null;
		}, t.prototype.makeActionFromEvent = function(e) {
			var t = L({}, e);
			return t.type = mN[e.type], t;
		}, t.prototype.dispatchAction = function(e, t) {
			if (this._disposed) {
				$j(this.id);
				return;
			}
			if (U(t) || (t = { silent: !!t }), pN[e.type] && this._model) {
				if (this[PM]) {
					this._pendingActions.push(e);
					return;
				}
				var n = t.silent;
				ZM.call(this, e, n);
				var r = t.flush;
				r ? this._zr.flush() : r !== !1 && J.browser.weChat && this._throttledZrFlush(), QM.call(this, n), $M.call(this, n);
			}
		}, t.prototype.updateLabelLayout = function() {
			RA.trigger("series:layoutlabels", this._model, this._api, { updatedSeries: [] });
		}, t.prototype.appendData = function(e) {
			if (this._disposed) {
				$j(this.id);
				return;
			}
			var t = e.seriesIndex, n = this.getModel().getSeriesByIndex(t);
			process.env.NODE_ENV !== "production" && G(e.data && n), n.appendData(e), this._scheduler.unfinished = !0, this.getZr().wakeUp();
		}, t.internalField = function() {
			GM = function(e) {
				Gw(e._model);
				var t = e._scheduler;
				t.restorePipelines(e._zr, e._model), t.prepareStageTasks(), KM(e, !0), KM(e, !1), t.plan();
			}, KM = function(e, t) {
				for (var n = e._model, r = e._scheduler, i = t ? e._componentsViews : e._chartsViews, a = t ? e._componentsMap : e._chartsMap, o = e._zr, s = e._api, c = 0; c < i.length; c++) i[c].__alive = !1;
				t ? n.eachComponent(function(e, t) {
					e !== "series" && l(t);
				}) : n.eachSeries(l);
				function l(e) {
					var c = e.__requireNewView;
					e.__requireNewView = !1;
					var l = "_ec_" + e.id + "_" + e.type, u = !c && a[l];
					if (!u) {
						var d = tn(e.type), f = t ? Wk.getClass(d.main, d.sub) : fS.getClass(d.sub);
						process.env.NODE_ENV !== "production" && G(f, d.sub + " does not exist."), u = new f(), u.init(n, s), a[l] = u, i.push(u), o.add(u.group);
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
			}, qM = function(e, t, n, r, i) {
				var a = e._model;
				if (a.setUpdatePayload(n), !r) {
					R([].concat(e._componentsViews, e._chartsViews), l);
					return;
				}
				var o = su(n, r, i), s = n.excludeSeriesId, c;
				s != null && (c = K(), R(Il(s), function(e) {
					var t = Yl(e, null);
					t != null && c.set(t, !0);
				})), a && a.eachComponent(o, function(t) {
					if (!(c && c.get(t.id) != null)) {
						if (Bd(n)) {
							if (t instanceof cx) n.type === "highlight" && !n.notBlur && !t.get(["emphasis", "disabled"]) && wd(t, n, e._api);
							else {
								var r = Td(t.mainType, t.componentIndex, n.name, e._api), i = r.focusSelf, a = r.dispatchers;
								n.type === "highlight" && i && !n.notBlur && Cd(t.mainType, t.componentIndex, e._api), a && R(a, function(e) {
									n.type === "highlight" ? md(e) : hd(e);
								});
							}
						} else zd(n) && t instanceof cx && (Od(t, n, e._api), kd(t), sN(e));
					}
				}, e), a && a.eachComponent(o, function(t) {
					c && c.get(t.id) != null || l(e[r === "series" ? "_chartsMap" : "_componentsMap"][t.__viewId]);
				}, e);
				function l(r) {
					r && r.__alive && r[t] && r[t](r.__model, a, e._api, n);
				}
			}, JM = {
				prepareAndUpdate: function(e) {
					GM(this), JM.update.call(this, e, e && { optionChanged: e.newOption != null });
				},
				update: function(e, n) {
					var r = this._model, i = this._api, a = this._zr, o = this._coordSysMgr, s = this._scheduler;
					if (r) {
						Kw(r), r.setUpdatePayload(e), s.restoreData(r, e), s.performSeriesTasks(r), o.create(r, i), RA.trigger("coordsys:aftercreate", r, i), s.performDataProcessorTasks(r, e), XM(this, r), o.update(r, i), t(r), s.performVisualTasks(r, e);
						var c = r.get("backgroundColor") || "transparent";
						a.setBackgroundColor(c);
						var l = r.get("darkMode");
						l != null && l !== "auto" && a.setDarkMode(l), nN(this, r, i, e, n), RA.trigger("afterupdate", r, i);
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
						}), iN(t, n, r, e, {}, a), RA.trigger("afterupdate", n, r);
					}
				},
				updateView: function(e) {
					var n = this._model;
					n && (n.setUpdatePayload(e), fS.markUpdateMethod(e, "updateView"), t(n), this._scheduler.performVisualTasks(n, e, { setDirty: !0 }), nN(this, n, this._api, e, {}), RA.trigger("afterupdate", n, this._api));
				},
				updateVisual: function(e) {
					var n = this, r = this._model;
					r && (r.setUpdatePayload(e), r.eachSeries(function(e) {
						e.getData().clearAllVisual();
					}), fS.markUpdateMethod(e, "updateVisual"), t(r), this._scheduler.performVisualTasks(r, e, {
						visualType: "visual",
						setDirty: !0
					}), r.eachComponent(function(t, i) {
						if (t !== "series") {
							var a = n.getViewOfComponentModel(i);
							a && a.__alive && a.updateVisual(i, r, n._api, e);
						}
					}), r.eachSeries(function(t) {
						n._chartsMap[t.__viewId].updateVisual(t, r, n._api, e);
					}), RA.trigger("afterupdate", r, this._api));
				},
				updateLayout: function(e) {
					JM.update.call(this, e);
				}
			};
			function e(e, t, n, r, i) {
				if (e._disposed) {
					$j(e.id);
					return;
				}
				for (var a = e._model, o = e._coordSysMgr.getCoordinateSystems(), s, c = iu(a, n), l = 0; l < o.length; l++) {
					var u = o[l];
					if (u[t] && (s = u[t](a, c, r, i)) != null) return s;
				}
				process.env.NODE_ENV !== "production" && Tl("No coordinate system that supports " + t + " found by the given finder.");
			}
			YM = e, XM = function(e, t) {
				var n = e._chartsMap, r = e._scheduler;
				t.eachSeries(function(e) {
					r.updateStreamModes(e, n[e.__viewId]);
				});
			}, ZM = function(e, t) {
				var n = this, r = this.getModel(), i = e.type, a = e.escapeConnect, o = pN[i], s = (o.update || "update").split(":"), c = s.pop(), l = s[0] != null && tn(s[0]);
				this[PM] = !0, lN(this);
				var u = [e], d = !1;
				e.batch && (d = !0, u = z(e.batch, function(t) {
					return t = et(L({}, t), e), t.batch = null, t;
				}));
				var f = [], p, m = [], h = o.nonRefinedEventType, g = zd(e), _ = Bd(e);
				if (_ && xd(this._api), R(u, function(t) {
					var i = o.action(t, r, n._api);
					if (o.refineEvent ? m.push(i) : p = i, p ||= L({}, t), p.type = h, f.push(p), _) {
						var a = au(e), s = a.queryOptionMap, u = a.mainTypeSpecified ? s.keys()[0] : "series";
						qM(n, c, t, u), sN(n);
					} else g ? (qM(n, c, t, "series"), sN(n)) : l && qM(n, c, t, l.main, l.sub);
				}), c !== "none" && !_ && !g && !l) try {
					this[IM] ? (GM(this), JM.update.call(this, e), this[IM] = null) : JM[c].call(this, e);
				} catch (e) {
					throw this[PM] = !1, e;
				}
				if (p = d ? {
					type: h,
					escapeConnect: a,
					batch: f
				} : f[0], this[PM] = !1, !t) {
					var v = void 0;
					if (o.refineEvent) {
						var y = o.refineEvent(m, e, r, this._api).eventContent;
						G(U(y)), v = et({ type: o.refinedEventType }, y), v.fromAction = e.type, v.fromActionPayload = e, v.escapeConnect = !0;
					}
					var b = this._messageCenter;
					b.trigger(p.type, p), v && b.trigger(v.type, v);
				}
			}, QM = function(e) {
				for (var t = this._pendingActions; t.length;) {
					var n = t.shift();
					ZM.call(this, n, e);
				}
			}, $M = function(e) {
				!e && this.trigger("updated");
			}, eN = function(e, t) {
				e.on("rendered", function(n) {
					t.trigger("rendered", n), e.animation.isFinished() && !t[IM] && !t._scheduler.unfinished && !t._pendingActions.length ? t.trigger("finished") : e.refresh();
				});
			}, tN = function(e, t) {
				e.on("mouseover", function(e) {
					var n = e.target, r = IA(n, Ld);
					r && (Ed(r, e, t._api), sN(t));
				}).on("mouseout", function(e) {
					var n = e.target, r = IA(n, Ld);
					r && (Dd(r, e, t._api), sN(t));
				}).on("click", function(e) {
					var n = e.target, r = IA(n, function(e) {
						return Nu(e).dataIndex != null;
					}, !0);
					if (r) {
						var i = r.selected ? "unselect" : "select", a = Nu(r);
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
					KD(i, function(e, t) {
						return e.zlevel === t.zlevel ? e.z - t.z : e.zlevel - t.zlevel;
					}), R(i, function(t) {
						var n = e.getComponent(t.type, t.idx), r = t.zlevel, i = t.key;
						a != null && (r = Math.max(a, r)), i ? (r === a && i !== o && r++, o = i) : o &&= (r === a && r++, ""), a = r, n.setZLevel(r);
					});
				}
			}
			nN = function(e, t, r, i, a) {
				n(t), rN(e, t, r, i, a), R(e._chartsViews, function(e) {
					e.__alive = !1;
				}), iN(e, t, r, i, a), R(e._chartsViews, function(e) {
					e.__alive || e.remove(t, r);
				});
			}, rN = function(e, t, n, r, i, a) {
				R(a || e._componentsViews, function(e) {
					var i = e.__model;
					s(i, e), e.render(i, t, n, r), o(i, e), c(i, e);
				});
			}, iN = function(e, t, n, r, l, u) {
				var d = e._scheduler;
				l = L(l || {}, { updatedSeries: t.getSeries() }), RA.trigger("series:beforeupdate", t, n, l);
				var f = !1;
				t.eachSeries(function(t) {
					var n = e._chartsMap[t.__viewId];
					n.__alive = !0;
					var i = n.renderTask;
					d.updatePayload(i, r), s(t, n), u && u.get(t.uid) && i.dirty(), i.perform(d.getPerformArgs(i)) && (f = !0), n.group.silent = !!t.get("silent"), a(t, n), kd(t);
				}), d.unfinished = f || d.unfinished, RA.trigger("series:layoutlabels", t, n, l), RA.trigger("series:transition", t, n, l), t.eachSeries(function(t) {
					var n = e._chartsMap[t.__viewId];
					o(t, n), c(t, n);
				}), i(e, t), RA.trigger("series:afterupdate", t, n, l);
			}, sN = function(e) {
				e[LM] = !0, e.getZr().wakeUp();
			}, lN = function(e) {
				e[FM] = (e[FM] + 1) % 1e6;
			}, cN = function(e) {
				e[LM] && (e.getZr().storage.traverse(function(e) {
					Qp(e) || r(e);
				}), e[LM] = !1);
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
					var a = i > W(t.get("hoverLayerThreshold"), BO.hoverLayerThreshold) && !J.node && !J.worker;
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
					var n = Lm(e);
					t.eachRendered(function(e) {
						return zm(e, n.z, n.zlevel), !0;
					});
				}
			}
			function s(e, t) {
				t.eachRendered(function(e) {
					if (!Qp(e)) {
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
						if (Qp(e)) return;
						if (e instanceof Qs && Vd(e), e.__dirty) {
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
			aN = function(e) {
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
						md(t, n), sN(e);
					}, n.prototype.leaveEmphasis = function(t, n) {
						hd(t, n), sN(e);
					}, n.prototype.enterBlur = function(t) {
						gd(t), sN(e);
					}, n.prototype.leaveBlur = function(t) {
						_d(t), sN(e);
					}, n.prototype.enterSelect = function(t) {
						vd(t), sN(e);
					}, n.prototype.leaveSelect = function(t) {
						yd(t), sN(e);
					}, n.prototype.getModel = function() {
						return e.getModel();
					}, n.prototype.getViewOfComponentModel = function(t) {
						return e.getViewOfComponentModel(t);
					}, n.prototype.getViewOfSeriesModel = function(t) {
						return e.getViewOfSeriesModel(t);
					}, n.prototype.getECUpdateCycleVersion = function() {
						return e[FM];
					}, n.prototype.usingTHL = function() {
						return e._usingTHL;
					}, n;
				}(qu))(e);
			}, oN = function(e) {
				function t(e, t) {
					for (var n = 0; n < e.length; n++) {
						var r = e[n];
						r[zM] = t;
					}
				}
				R(mN, function(n, r) {
					e._messageCenter.on(r, function(n) {
						if (SN[e.group] && e[zM] !== BM) {
							if (n && n.escapeConnect) return;
							var r = e.makeActionFromEvent(n), i = [];
							R(xN, function(t) {
								t !== e && t.group === e.group && i.push(t);
							}), t(i, BM), R(i, function(e) {
								e[zM] !== VM && e.dispatchAction(r);
							}), t(i, HM);
						}
					});
				});
			};
		}(), t;
	}(to), dN = uN.prototype, dN.on = Xj("on"), dN.off = Xj("off"), dN.one = function(e, t, n) {
		var r = this;
		Dl("ECharts#one is deprecated.");
		function i() {
			var n = [...arguments];
			t && t.apply && t.apply(this, n), r.off(e, i);
		}
		this.on.call(this, e, i, n);
	}, fN = [
		"click",
		"dblclick",
		"mouseover",
		"mouseout",
		"mousemove",
		"mousedown",
		"mouseup",
		"globalout",
		"contextmenu"
	], pN = {}, mN = {}, hN = {}, gN = [], _N = [], vN = [], yN = {}, bN = {}, xN = {}, SN = {}, CN = /* @__PURE__ */ new Date() - 0, /* @__PURE__ */ new Date() - 0, wN = "_echarts_instance_", TN = [], EN = pb, dM(TM, Zk), dM(OM, $k), dM(OM, eA), dM(TM, AA), dM(OM, jA), dM(MM, Jj), rM(Fk), iM(vM, Hk), pM("default", nA), cM({
		type: Jd,
		event: Jd,
		update: Jd
	}, Mt), cM({
		type: Yd,
		event: Yd,
		update: Yd
	}, Mt), cM({
		type: Xd,
		event: $d,
		update: Xd,
		action: Mt,
		refineEvent: hM,
		publishNonRefinedEvent: !0
	}), cM({
		type: Zd,
		event: $d,
		update: Zd,
		action: Mt,
		refineEvent: hM,
		publishNonRefinedEvent: !0
	}), cM({
		type: Qd,
		event: $d,
		update: Qd,
		action: Mt,
		refineEvent: hM,
		publishNonRefinedEvent: !0
	}), nM("default", {}), nM("dark", wA);
}));
//#endregion
//#region node_modules/echarts/lib/extension.js
function ON(e) {
	if (B(e)) {
		R(e, function(e) {
			ON(e);
		});
		return;
	}
	tt(kN, e) >= 0 || (kN.push(e), V(e) && (e = { install: e }), e.install(AN));
}
var kN, AN, jN = M((() => {
	DN(), Gk(), mS(), qy(), lx(), q(), UA(), FO(), KA(), kN = [], AN = {
		registerPreprocessor: rM,
		registerProcessor: iM,
		registerPostInit: aM,
		registerPostUpdate: oM,
		registerUpdateLifecycle: sM,
		registerAction: cM,
		registerCoordinateSystem: lM,
		registerLayout: uM,
		registerVisual: dM,
		registerTransform: EN,
		registerLoading: pM,
		registerMap: mM,
		registerImpl: BA,
		PRIORITY: NM,
		ComponentModel: Ky,
		ComponentView: Wk,
		SeriesModel: cx,
		ChartView: fS,
		registerComponentModel: function(e) {
			Ky.registerClass(e);
		},
		registerComponentView: function(e) {
			Wk.registerClass(e);
		},
		registerSeriesModel: function(e) {
			cx.registerClass(e);
		},
		registerChartView: function(e) {
			fS.registerClass(e);
		},
		registerCustomSeries: function(e, t) {
			WA(e, t);
		},
		registerSubTypeDefaulter: function(e, t) {
			Ky.registerSubTypeDefaulter(e, t);
		},
		registerPainter: function(e, t) {
			kO(e, t);
		}
	};
})), MN, NN = M((() => {
	MN = function() {
		function e() {}
		return e.prototype.needIncludeZero = function() {
			return !this.option.scale;
		}, e.prototype.getCoordSysModel = function() {}, e;
	}();
})), PN, FN = M((() => {
	F(), q(), qy(), NN(), Z(), PN = function(e) {
		P(t, e);
		function t() {
			return e !== null && e.apply(this, arguments) || this;
		}
		return t.prototype.getCoordSysModel = function() {
			return this.getReferringComponents("grid", ju).models[0];
		}, t.type = "cartesian2dAxis", t;
	}(Ky), rt(PN, MN);
})), IN, LN, RN, zN, BN, VN, HN = M((() => {
	q(), Eb(), IN = {
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
	}, LN = Qe({
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
	}, IN), RN = Qe({
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
	}, IN), zN = Qe({
		splitNumber: 6,
		axisLabel: { rich: { primary: { fontWeight: "bold" } } },
		splitLine: { show: !1 }
	}, RN), BN = et({ logBase: 10 }, RN), VN = {
		category: LN,
		value: RN,
		time: zN,
		log: BN
	};
}));
//#endregion
//#region node_modules/echarts/lib/coord/axisModelCreator.js
function UN(e, t, n, r) {
	R(kC, function(i, a) {
		var o = Qe(Qe({}, VN[a], !0), r, !0), s = function(e) {
			P(n, e);
			function n() {
				var n = e !== null && e.apply(this, arguments) || this;
				return n.type = t + "Axis." + a, n;
			}
			return n.prototype.mergeDefaultAndTheme = function(e, t) {
				var n = Py(this), r = n ? Iy(e) : {};
				Qe(e, t.getTheme().get(a + "Axis")), Qe(e, this.getDefaultOption()), e.type = WN(e), n && Fy(e, r, n);
			}, n.prototype.optionUpdated = function() {
				this.option.type === "category" && (this.__ordinalMeta = DS.createByAxisModel(this));
			}, n.prototype.getCategories = function(e) {
				var t = this.option;
				if (t.type === "category") return e ? t.data : this.__ordinalMeta.categories;
			}, n.prototype.getOrdinalMeta = function() {
				return this.__ordinalMeta;
			}, n.prototype.updateAxisBreaks = function(e) {
				var t = RT();
				return t ? t.updateModelAxisBreak(this, e) : { breaks: [] };
			}, n.type = t + "Axis." + a, n.defaultOption = o, n;
		}(n);
		e.registerComponentModel(s);
	}), e.registerSubTypeDefaulter(t + "Axis", WN);
}
function WN(e) {
	return e.type || (e.data ? "category" : "value");
}
var GN = M((() => {
	F(), HN(), Uy(), OS(), AC(), q(), BT();
})), KN, qN = M((() => {
	q(), KN = function() {
		function e(e) {
			this.type = "cartesian", this._dimList = [], this._axes = {}, this.name = e || "";
		}
		return e.prototype.getAxis = function(e) {
			return this._axes[e];
		}, e.prototype.getAxes = function() {
			return z(this._dimList, function(e) {
				return this._axes[e];
			}, this);
		}, e.prototype.getAxesByScale = function(e) {
			return e = e.toLowerCase(), ot(this.getAxes(), function(t) {
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
function JN(e) {
	return (e.type === "interval" || e.type === "time") && !Pv(e);
}
var YN, XN, ZN = M((() => {
	F(), Or(), qN(), XE(), Vn(), ir(), BS(), Iv(), YN = ["x", "y"], XN = function(e) {
		P(t, e);
		function t() {
			var t = e !== null && e.apply(this, arguments) || this;
			return t.type = JE, t.dimensions = YN, t;
		}
		return t.prototype.calcAffineTransform = function() {
			this._transform = this._invTransform = null;
			var e = this.getAxis("x").scale, t = this.getAxis("y").scale;
			if (JN(e) && JN(t)) {
				var n = NS(e, null), r = NS(t, null), i = this.dataToPoint([n[0], r[0]]), a = this.dataToPoint([n[1], r[1]]), o = n[1] - n[0], s = r[1] - r[0];
				if (o && s) {
					var c = (a[0] - i[0]) / o, l = (a[1] - i[1]) / s, u = i[0] - n[0] * c, d = i[1] - r[0] * l, f = this._transform = [
						c,
						0,
						0,
						l,
						u,
						d
					];
					this._invTransform = Bn([], f);
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
			if (this._transform && r != null && isFinite(r) && i != null && isFinite(i)) return $n(n, e, this._transform);
			var a = this.getAxis("x"), o = this.getAxis("y");
			return n[0] = a.toGlobalCoord(a.dataToCoord(r, t)), n[1] = o.toGlobalCoord(o.dataToCoord(i, t)), n;
		}, t.prototype.clampData = function(e, t) {
			var n = this.getAxis("x").scale, r = this.getAxis("y").scale, i = n.getExtent(), a = r.getExtent(), o = n.parse(e[0]), s = r.parse(e[1]);
			return t ||= [], t[0] = Math.min(Math.max(Math.min(i[0], i[1]), o), Math.max(i[0], i[1])), t[1] = Math.min(Math.max(Math.min(a[0], a[1]), s), Math.max(a[0], a[1])), t;
		}, t.prototype.pointToData = function(e, t, n) {
			if (n ||= [], this._invTransform) return $n(n, e, this._invTransform);
			var r = this.getAxis("x"), i = this.getAxis("y");
			return n[0] = r.coordToData(r.toLocalCoord(e[0]), t), n[1] = i.coordToData(i.toLocalCoord(e[1]), t), n;
		}, t.prototype.getOtherAxis = function(e) {
			return this.getAxis(e.dim === "x" ? "y" : "x");
		}, t.prototype.getArea = function(e) {
			e ||= 0;
			var t = this.getAxis("x").getGlobalExtent(), n = this.getAxis("y").getGlobalExtent(), r = Math.min(t[0], t[1]) - e, i = Math.min(n[0], n[1]) - e, a = Math.max(t[0], t[1]) - r + e, o = Math.max(n[0], n[1]) - i + e;
			return new Y(r, i, a, o);
		}, t;
	}(KN);
}));
//#endregion
//#region node_modules/echarts/lib/coord/axisAlignTicks.js
function QN(e, t) {
	var n = e.scale, r = e.model;
	process.env.NODE_ENV !== "production" && G(n && r && (n instanceof aC || n instanceof wC) && (t instanceof aC || t instanceof wC));
	var i = RE(n, r, r.ecModel, e, null), a = WS(n), o = WS(t) ? t.intervalStub : t, s = a ? n.intervalStub : n, c = n.base, l = o.getTicks(), u = o.getTicks({ expandToNicedExtent: !0 }), d = l.length - 1;
	process.env.NODE_ENV !== "production" && (G(!Pv(t) && !Pv(n)), G(d > 0), G(u.length === l.length), G(l[0].value <= l[d].value), G(u[0].value <= l[0].value && l[d].value <= u[d].value), d >= 2 && (G(u[1].value === l[1].value), G(u[d - 1].value === l[d - 1].value)));
	var f, p, m;
	if (d === 1) f = p = 0, m = 1;
	else if (d === 2) {
		var h = ul(l[0].value - l[1].value), g = ul(l[1].value - l[2].value);
		f = p = 0, h === g ? m = 2 : (m = 1, h < g ? f = h / g : p = g / h);
	} else {
		var _ = o.getConfig().interval;
		f = (1 - (l[0].value - u[0].value) / _) % 1, p = (1 - (u[d].value - l[d].value) / _) % 1, m = d - +!!f - !!p;
	}
	process.env.NODE_ENV !== "production" && G(m >= 1);
	var v = i.zoomFixMM, y = v[0] || v[1], b = [i.fixMM[0] || y, i.fixMM[1] || y], x = n.getExtent(), S = s.getExtent(), C = XS(S, b), w, T, E, D, O, k;
	function A(e) {
		for (var t = 50, n = 0; n < t && !e(); n++) E = a ? E * ll(c, 2) : KS(E), D = qS(E);
		process.env.NODE_ENV !== "production" && n >= t && Tl("incorrect impl in `scaleCalcAlign`.");
	}
	function j() {
		w = X(k - E * f, D);
	}
	function ee() {
		T = X(O + E * p, D);
	}
	function te() {
		k = f ? X(w + E * f, D) : w;
	}
	function ne() {
		O = p ? X(T - E * p, D) : T;
	}
	if (b[0] && b[1]) {
		w = C[0], T = C[1], E = (T - w) / (m + f + p);
		var re = e.getExtent(), ie = ul(re[1] - re[0]);
		D = Kc([T, w], ie, .5 / m), te(), ne(), al(D) && (E = X(E, D));
	} else {
		var ae = C[1] - C[0];
		E = a ? ll(Zc(ae), 1) : $c(ae / m, 2), D = qS(E), b[0] ? (w = C[0], A(function() {
			if (te(), O = X(k + E * m, D), ee(), T >= C[1]) return !0;
		})) : b[1] ? (T = C[1], A(function() {
			if (ne(), k = X(O - E * m, D), j(), w <= C[0]) return !0;
		})) : A(function() {
			k = X(pl(C[0] / E) * E, D), O = X(fl(C[1] / E) * E, D);
			var e = dl((O - k) / E);
			if (e <= m) {
				var t = m - e, n = void 0, r = i.incl0 || a;
				if (r && C[0] === 0) n = [0, t];
				else if (r && C[1] === 0) n = [t, 0];
				else {
					var o = fl(t / 2);
					n = t % 2 == 0 ? [o, o] : w + T < C[0] + C[1] ? [o, o + 1] : [o + 1, o];
				}
				if (k = X(k - E * n[0], D), O = X(O + E * n[1], D), j(), ee(), w <= C[0] && T >= C[1]) return !0;
			}
		});
	}
	GC(n, b, S, [w, T], x, {
		interval: E,
		intervalCount: m,
		intervalPrecision: D,
		niceExtent: [k, O]
	}), process.env.NODE_ENV !== "production" && n.freeze();
}
var $N = M((() => {
	Sl(), oC(), OC(), YC(), Pl(), eC(), q(), GE(), Iv();
}));
//#endregion
//#region node_modules/echarts/lib/coord/axisNiceTicks.js
function eP(e, t) {
	var n = WS(e), r = n ? e.intervalStub : e, i = t.fixMinMax || [], a = n ? e.getExtent() : null, o = r.getExtent(), s = XS(o, i, t.rawExtentResult);
	r.setExtent(s[0], s[1]), s = r.getExtent();
	var c = n ? nP(r, t) : tP(r, t), l = c.intervalPrecision, u = c.interval, d = t.userInterval;
	d != null && (c.interval = d, c.intervalPrecision = qS(d)), i[0] || (s[0] = X(fl(s[0] / u) * u, l)), i[1] || (s[1] = X(pl(s[1] / u) * u, l)), d != null && (c.niceExtent = s.slice()), GC(e, i, o, s, a, c);
}
function tP(e, t) {
	var n = QS(t.splitNumber, 5), r = FS(e);
	process.env.NODE_ENV !== "production" && G(isFinite(r) && r > 0);
	var i = t.minInterval, a = t.maxInterval, o = $c(r / n, !0);
	i != null && o < i && (o = i), a != null && o > a && (o = a);
	var s = qS(o), c = e.getExtent(), l = [X(pl(c[0] / o) * o, s), X(fl(c[1] / o) * o, s)];
	return {
		interval: o,
		intervalPrecision: s,
		niceExtent: l
	};
}
function nP(e, t) {
	var n = QS(t.splitNumber, 10), r = e.getExtent(), i = FS(e);
	process.env.NODE_ENV !== "production" && G(isFinite(i) && i > 0);
	var a = ll(Zc(i), 1);
	n / i * a <= .5 && (a *= 10);
	var o = qS(a), s = [X(pl(r[0] / a) * a, o), X(fl(r[1] / a) * a, o)];
	return {
		intervalPrecision: o,
		interval: a,
		niceExtent: s
	};
}
function rP(e) {
	var t = e.scale, n = e.model, r = n.axis, i = n.ecModel;
	process.env.NODE_ENV !== "production" && G(r && i), iP(t, n, r, i, null);
}
function iP(e, t, n, r, i) {
	var a = RE(e, t, r, n, i), o = HS(e) || US(e);
	aP(e, {
		splitNumber: t.get("splitNumber"),
		fixMinMax: a.fixMM,
		userInterval: t.get("interval"),
		minInterval: o ? t.get("minInterval") : null,
		maxInterval: o ? t.get("maxInterval") : null,
		rawExtentResult: a
	}), n && r && BE(n, e, a, r), process.env.NODE_ENV !== "production" && e.freeze();
}
function aP(e, t) {
	oP[e.type](e, t);
}
var oP, sP = M((() => {
	q(), eC(), Sl(), YC(), bC(), GE(), BS(), oP = {
		interval: eP,
		log: eP,
		time: yC,
		ordinal: Mt
	};
}));
//#endregion
//#region node_modules/echarts/lib/coord/cartesian/Grid.js
function cP(e, t) {
	return e.getCoordSysModel() === t;
}
function lP(e, t, n, r) {
	n.getAxesOnZeroOf = function() {
		return a ? [a] : [];
	};
	var i = e[t], a, o = n.model, s = o.get(["axisLine", "onZero"]), c = o.get(["axisLine", "onZeroAxisIndex"]);
	if (!s) return;
	if (c != null) uP(s, i[c]) && (a = i[c]);
	else for (var l in i) if (jt(i, l) && uP(s, i[l]) && !r[u(i[l])]) {
		a = i[l];
		break;
	}
	a && (r[u(a)] = !0);
	function u(e) {
		return e.dim + "_" + e.index;
	}
}
function uP(e, t) {
	if (!t) return !1;
	var n = t.scale, r = NC(n, 0, !1), i = t && t.type !== "category" && t.type !== "time" && r !== 3;
	return i && e === "auto" && FC(t) && (i = !1), i;
}
function dP(e) {
	for (var t = ct(e), n, r = [], i = t.length - 1; i >= 0; i--) {
		var a = e[+t[i]];
		VS(a.scale) && UC(a.model, a.type, !0) == null && (a.model.get("alignTicks") && a.model.get("interval") == null ? r.push(a) : n = a);
	}
	n ||= r.pop(), n && R(r, function(e) {
		e.__alignTo = n;
	});
}
function fP(e, t) {
	return Pv(e.scale) || Pv(t.scale) || t.scale.getTicks().length < 2;
}
function pP(e, t) {
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
function mP(e, t) {
	R(e.x, function(e) {
		return hP(e, t.x, t.width);
	}), R(e.y, function(e) {
		return hP(e, t.y, t.height);
	});
}
function hP(e, t, n) {
	var r = [0, n], i = +!!e.inverse;
	e.setExtent(r[i], r[1 - i]), pP(e, t);
}
function gP(e, t, n, r, i, a, o) {
	process.env.NODE_ENV !== "production" && G(t === "all" || t === "axisLabel"), vP(r, i, Vw.estimate, t, !1, o);
	var s = [
		0,
		0,
		0,
		0
	];
	l(0), l(1), u(r, 0, NaN), u(r, 1, NaN);
	var c = st(s, function(e) {
		return e > 0;
	}) == null;
	return km(r, s, !0, !0, n), mP(i, r), c;
	function l(e) {
		R(i[Gm[e]], function(t) {
			if (HC(t.model)) {
				var n = a.ensureRecord(t.model), r = n.labelInfoList;
				if (r) for (var i = 0; i < r.length; i++) {
					var o = r[i], s = t.scale.normalize(KC(t.scale, dE(o.label).labelInfo.tick));
					s = e === 1 ? 1 - s : s, u(o.rect, e, s), u(o.rect, 1 - e, NaN);
				}
				var c = n.nameLayout;
				if (c) {
					var s = VC(n.nameLocation) ? .5 : NaN;
					u(c.rect, e, s), u(c.rect, 1 - e, NaN);
				}
			}
		});
	}
	function u(t, n, r) {
		var i = e[Gm[n]] - t[Gm[n]], a = t[Km[n]] + t[Gm[n]] - (e[Km[n]] + e[Gm[n]]);
		i = d(i, 1 - r), a = d(a, r);
		var o = bP[n][0], c = bP[n][1];
		s[o] = ll(s[o], i), s[c] = ll(s[c], a);
	}
	function d(e, t) {
		return e > 0 && !yt(t) && t > 1e-4 && (e /= t), e;
	}
}
function _P(e, t, n, r, i) {
	var a = new pE(SP);
	return R(n, function(n) {
		return R(n, function(n) {
			if (HC(n.model)) {
				var o = !r;
				n.axisBuilder = TE(e, t, n.model, i, a, o);
			}
		});
	}), a;
}
function vP(e, t, n, r, i, a) {
	var o = n === Vw.determine;
	R(t, function(t) {
		return R(t, function(t) {
			HC(t.model) && (EE(t.axisBuilder, e, t.model), t.axisBuilder.build(o ? { axisTickLabelDetermine: !0 } : { axisTickLabelEstimate: !0 }, { noPxChange: i }));
		});
	});
	var s = {
		x: 0,
		y: 0
	};
	c(0), c(1);
	function c(t) {
		s[Gm[1 - t]] = e[Km[t]] <= a.refContainer[Km[t]] * .5 ? 0 : 1 - t == 1 ? 2 : 1;
	}
	R(t, function(e, t) {
		return R(e, function(e) {
			HC(e.model) && ((r === "all" || o) && e.axisBuilder.build({ axisName: !0 }, { nameMarginLevel: s[t] }), o && e.axisBuilder.build({ axisLine: !0 }));
		});
	});
}
function yP(e, t, n) {
	var r, i = e.get("outerBoundsMode", !0);
	i === "same" ? r = t.clone() : i == null || i === "auto" ? r = My(e.get("outerBounds", !0) || KE, n.refContainer) : i !== "none" && process.env.NODE_ENV !== "production" && El("Invalid grid[" + e.componentIndex + "].outerBoundsMode.");
	var a = e.get("outerBoundsContain", !0), o;
	a == null || a === "auto" ? o = "all" : tt(["all", "axisLabel"], a) < 0 ? (process.env.NODE_ENV !== "production" && El("Invalid grid[" + e.componentIndex + "].outerBoundsContain."), o = "all") : o = a;
	var s = [Vc(W(e.get("outerBoundsClampWidth", !0), qE[0]), t.width), Vc(W(e.get("outerBoundsClampHeight", !0), qE[1]), t.height)];
	return {
		outerBoundsRect: r,
		parsedOuterBoundsContain: o,
		outerBoundsClamp: s
	};
}
var bP, xP, SP, CP = M((() => {
	q(), Uy(), YC(), ZN(), xT(), Z(), XE(), DE(), eC(), $N(), $m(), SE(), Pl(), Ww(), j_(), Sl(), sP(), n_(), GE(), Iv(), lT(), bP = [[3, 1], [0, 2]], xP = function() {
		function e(e, t, n) {
			this.type = "grid", this._coordsMap = {}, this._coordsList = [], this._axesMap = {}, this._axesList = [], this.axisPointerEnabled = !0, this.dimensions = YN, this._initCartesian(e, t, n), this.model = e;
		}
		return e.prototype.getRect = function() {
			return this._rect;
		}, e.prototype.update = function(e, t) {
			var n = this._axesMap;
			R(this._axesList, function(e) {
				PE(e, 1);
				var t = e.scale;
				GS(t) && t.setSortInfo(e.model.get("categorySortInfo"));
			});
			function r(e) {
				for (var t = ct(e), n = [], r = t.length - 1; r >= 0; r--) {
					var i = e[+t[r]];
					i.__alignTo ? n.push(i) : rP(i);
				}
				R(n, function(e) {
					fP(e, e.__alignTo) ? rP(e) : QN(e, e.__alignTo.scale);
				});
			}
			r(n.x), r(n.y);
			var i = {};
			R(n.x, function(e) {
				lP(n, "y", e, i);
			}), R(n.y, function(e) {
				lP(n, "x", e, i);
			}), this.resize(this.model, t);
		}, e.prototype.resize = function(e, t, n) {
			var r = Ny(e, t), i = this._rect = My(e.getBoxLayoutParams(), r.refContainer), a = this._axesMap, o = this._coordsList, s = e.get("containLabel");
			if (mP(a, i), !n) {
				var c = _P(i, o, a, s, t), l = void 0;
				if (s) process.env.NODE_ENV !== "production" && wl("Specified `grid.containLabel` but no `use(LegacyGridContainLabel)`;use `grid.outerBounds` instead.", !0), l = gP(i.clone(), "axisLabel", null, i, a, c, r);
				else {
					var u = yP(e, i, r), d = u.outerBoundsRect, f = u.parsedOuterBoundsContain, p = u.outerBoundsClamp;
					d && (l = gP(d, f, p, i, a, c, r));
				}
				vP(i, a, Vw.determine, null, l, r), R(this._coordsList, function(e) {
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
			U(e) && (t = e.yAxisIndex, e = e.xAxisIndex);
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
			var t = e.seriesModel, n = e.xAxisModel || t && t.getReferringComponents("xAxis", ju).models[0], r = e.yAxisModel || t && t.getReferringComponents("yAxis", ju).models[0], i = e.gridModel, a = this._coordsList, o, s;
			return t ? (o = t.coordinateSystem, tt(a, o) < 0 && (o = null)) : n && r ? o = this.getCartesian(n.componentIndex, r.componentIndex) : n ? s = this.getAxis("x", n.componentIndex) : r ? s = this.getAxis("y", r.componentIndex) : i && i.coordinateSystem === this && (o = this._coordsList[0]), {
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
			this._axesMap = o, R(o.x, function(t, n) {
				R(o.y, function(i, a) {
					var o = "x" + n + "y" + a, s = new XN(o);
					s.master = r, s.model = e, r._coordsMap[o] = s, r._coordsList.push(s), s.addAxis(t), s.addAxis(i);
				});
			}), dP(o.x), dP(o.y);
			function c(t) {
				return function(n, r) {
					if (cP(n, e)) {
						var c = n.get("position");
						t === "x" ? c !== "top" && c !== "bottom" && (c = a.bottom ? "top" : "bottom") : c !== "left" && c !== "right" && (c = a.left ? "right" : "left"), a[c] = !0;
						var l = jC(n), u = new bT(t, MC(n, l, !0), [0, 0], l, c);
						u.onBand = qC(u.scale, n), u.inverse = n.get("inverse"), n.axis = u, u.model = n, u.grid = i, u.index = r, i._axesList.push(u), o[t][r] = u, s[t]++;
					}
				};
			}
		}, e.prototype.getTooltipAxes = function(e) {
			var t = [], n = [];
			return R(this.getCartesians(), function(r) {
				var i = e != null && e !== "auto" ? r.getAxis(e) : r.getBaseAxis(), a = r.getOtherAxis(i);
				tt(t, i) < 0 && t.push(i), tt(n, a) < 0 && n.push(a);
			}), {
				baseAxes: t,
				otherAxes: n
			};
		}, e.create = function(t, n) {
			var r = [];
			return t.eachComponent("grid", function(i, a) {
				var o = new e(i, t, n);
				o.name = "grid_" + a, o.resize(i, n, !0), i.coordinateSystem = o, r.push(o), R(o._axesList, function(t) {
					NE(t, e.dimIdxMap);
				});
			}), t.eachSeries(function(e) {
				var t, n;
				E_({
					targetModel: e,
					coordSysType: JE,
					coordSysProvider: r
				});
				function r() {
					var r = wE(e), i = r.xAxisModel, a = r.yAxisModel;
					t = i.axis, n = a.axis;
					var o = i.getCoordSysModel();
					if (process.env.NODE_ENV !== "production") {
						if (!o) throw Error("Grid \"" + xt(i.get("gridIndex"), i.get("gridId"), 0) + "\" not found");
						if (i.getCoordSysModel() !== a.getCoordSysModel()) throw Error("xAxis and yAxis must use the same grid");
					}
					return o.coordinateSystem.getCartesian(i.componentIndex, a.componentIndex);
				}
				t && n && (iT(t, e, JE), iT(n, e, JE));
			}, this), r;
		}, e.dimensions = YN, e.dimIdxMap = Xg(YN), e;
	}(), SP = function(e, t, n, r, i, a) {
		var o = n.axis.dim === "x" ? "y" : "x";
		gE(e, t, n, r, i, a), VC(e.nameLocation) || R(t.recordMap[o], function(e) {
			e && e.labelInfoList && e.dirVec && GT(e.labelInfoList, e.dirVec, r, i);
		});
	};
}));
//#endregion
//#region node_modules/echarts/lib/component/axisPointer/modelHelper.js
function wP(e, t) {
	var n = {
		axesInfo: {},
		seriesInvolved: !1,
		coordSysAxesInfo: {},
		coordSysMap: {}
	};
	return TP(n, e, t), n.seriesInvolved && DP(n, e), n;
}
function TP(e, t, n) {
	var r = t.getComponent("tooltip"), i = t.getComponent("axisPointer"), a = i.get("link", !0) || [], o = [];
	R(n.getCoordinateSystems(), function(n) {
		if (!n.axisPointerEnabled) return;
		var s = PP(n.model), c = e.coordSysAxesInfo[s] = {};
		e.coordSysMap[s] = n;
		var l = n.model.getModel("tooltip", r);
		if (R(n.getAxes(), ut(p, !1, null)), n.getTooltipAxes && r && l.get("show")) {
			var u = l.get("trigger") === "axis", d = l.get(["axisPointer", "type"]) === "cross", f = n.getTooltipAxes(l.get(["axisPointer", "axis"]));
			(u || d) && R(f.baseAxes, ut(p, !d || "cross", u)), d && R(f.otherAxes, ut(p, "cross", !1));
		}
		function p(r, s, u) {
			var d = u.model.getModel("axisPointer", i), f = d.get("show");
			if (f && (f !== "auto" || r || NP(d))) {
				s ??= d.get("triggerTooltip"), d = r ? EP(u, l, i, t, r, s) : d;
				var p = d.get("snap"), m = d.get("triggerEmphasis"), h = PP(u.model), g = s || p || u.type === "category", _ = e.axesInfo[h] = {
					key: h,
					axis: u,
					coordSys: n,
					axisPointerModel: d,
					triggerTooltip: s,
					triggerEmphasis: m,
					involveSeries: g,
					snap: p,
					useHandle: NP(d),
					seriesModels: [],
					linkGroup: null
				};
				c[h] = _, e.seriesInvolved = e.seriesInvolved || g;
				var v = OP(a, u);
				if (v != null) {
					var y = o[v] || (o[v] = { axesInfo: {} });
					y.axesInfo[h] = _, y.mapper = a[v].mapper, _.linkGroup = y;
				}
			}
		}
	});
}
function EP(e, t, n, r, i, a) {
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
	R(s, function(e) {
		c[e] = I(o.get(e));
	}), c.snap = e.type !== "category" && !!a, o.get("type") === "cross" && (c.type = "line");
	var l = c.label ||= {};
	if (l.show ??= !1, i === "cross" && (l.show = o.get(["label", "show"]) ?? !0, !a)) {
		var u = c.lineStyle = o.get("crossStyle");
		u && et(l, u.textStyle);
	}
	return e.model.getModel("axisPointer", new Ah(c, n, r));
}
function DP(e, t) {
	t.eachSeries(function(t) {
		var n = t.coordinateSystem, r = t.get(["tooltip", "trigger"], !0), i = t.get(["tooltip", "show"], !0);
		n && n.model && r !== "none" && r !== !1 && r !== "item" && i !== !1 && t.get(["axisPointer", "show"], !0) !== !1 && R(e.coordSysAxesInfo[PP(n.model)], function(e) {
			var r = e.axis;
			n.getAxis(r.dim) === r && (e.seriesModels.push(t), e.seriesDataCount ??= 0, e.seriesDataCount += t.getData().count());
		});
	});
}
function OP(e, t) {
	for (var n = t.model, r = t.dim, i = 0; i < e.length; i++) {
		var a = e[i] || {};
		if (kP(a[r + "AxisId"], n.id) || kP(a[r + "AxisIndex"], n.componentIndex) || kP(a[r + "AxisName"], n.name)) return i;
	}
}
function kP(e, t) {
	return e === "all" || B(e) && tt(e, t) >= 0 || e === t;
}
function AP(e) {
	var t = jP(e);
	if (t) {
		var n = t.axisPointerModel, r = t.axis.scale, i = n.option, a = n.get("status"), o = n.get("value");
		o != null && (o = r.parse(o));
		var s = NP(n);
		a ?? (i.status = s ? "show" : "hide");
		var c = r.getExtent();
		(o == null || o > c[1]) && (o = c[1]), o < c[0] && (o = c[0]), i.value = o, s && (i.status = t.axis.scale.isBlank() ? "hide" : "show");
	}
}
function jP(e) {
	var t = (e.ecModel.getComponent("axisPointer") || {}).coordSysAxesInfo;
	return t && t.axesInfo[PP(e)];
}
function MP(e) {
	var t = jP(e);
	return t && t.axisPointerModel;
}
function NP(e) {
	return !!e.get(["handle", "show"]);
}
function PP(e) {
	return e.type + "||" + e.id;
}
var FP = M((() => {
	jh(), q();
})), IP, LP, RP = M((() => {
	F(), FP(), Gk(), IP = {}, LP = function(e) {
		P(t, e);
		function t() {
			var n = e !== null && e.apply(this, arguments) || this;
			return n.type = t.type, n;
		}
		return t.prototype.render = function(t, n, r, i) {
			this.axisPointerClass && AP(t), e.prototype.render.apply(this, arguments), this._doUpdateAxisPointerClass(t, r, !0);
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
				var a = MP(e);
				a ? (this._axisPointer ||= new i()).render(e, a, n, r) : this._disposeAxisPointer(n);
			}
		}, t.prototype._disposeAxisPointer = function(e) {
			this._axisPointer && this._axisPointer.dispose(e), this._axisPointer = null;
		}, t.registerAxisPointerClass = function(e, t) {
			if (process.env.NODE_ENV !== "production" && IP[e]) throw Error("axisPointer " + e + " exists");
			IP[e] = t;
		}, t.getAxisPointerClass = function(e) {
			return e && IP[e];
		}, t.type = "axis", t;
	}(Wk);
}));
//#endregion
//#region node_modules/echarts/lib/component/axis/axisSplitHelper.js
function zP(e, t, n, r) {
	var i = n.axis;
	if (!i.scale.isBlank()) {
		var a = n.getModel("splitArea"), o = a.getModel("areaStyle"), s = o.get("color"), c = r.coordinateSystem.getRect(), l = i.getTicksCoords({
			tickModel: a,
			breakTicks: "none",
			pruneByBreak: "preserve_extent_bound"
		});
		if (l.length) {
			var u = s.length, d = VP(e).splitAreaColors, f = K(), p = 0;
			if (d) for (var m = 0; m < l.length; m++) {
				var h = d.get(l[m].tickValue);
				if (h != null) {
					p = (h + (u - 1) * m) % u;
					break;
				}
			}
			var g = i.toGlobalCoord(l[0].coord), _ = o.getAreaStyle();
			s = B(s) ? s : [s];
			for (var m = 1; m < l.length; m++) {
				var v = i.toGlobalCoord(l[m].coord), y = void 0, b = void 0, x = void 0, S = void 0;
				i.isHorizontal() ? (y = g, b = c.y, x = v - y, S = c.height, g = y + x) : (y = c.x, b = g, x = c.width, S = v - b, g = b + S);
				var C = l[m - 1].tickValue;
				C != null && f.set(C, p), t.add(new _c({
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
			VP(e).splitAreaColors = f;
		}
	}
}
function BP(e) {
	VP(e).splitAreaColors = null;
}
var VP, HP = M((() => {
	q(), $m(), Z(), VP = ru();
})), UP, WP, GP, KP, qP, JP = M((() => {
	F(), q(), $m(), RP(), HP(), BT(), YC(), UP = [
		"splitArea",
		"splitLine",
		"minorSplitLine",
		"breakArea"
	], WP = function(e) {
		P(t, e);
		function t() {
			var n = e !== null && e.apply(this, arguments) || this;
			return n.type = t.type, n.axisPointerClass = "CartesianAxisPointer", n;
		}
		return t.prototype.render = function(t, n, r, i) {
			this.group.removeAll();
			var a = this._axisGroup;
			this._axisGroup = new Of(), this.group.add(this._axisGroup), HC(t) && (this._axisGroup.add(t.axis.axisBuilder.group), R(UP, function(e) {
				t.get([e, "show"]) && GP[e](this, this._axisGroup, t, t.getCoordSysModel(), r);
			}, this), i && i.type === "changeAxisOrder" && i.isInitSort || xm(a, this._axisGroup, t), e.prototype.render.call(this, t, n, r, i));
		}, t.prototype.remove = function() {
			BP(this);
		}, t.type = "cartesianAxis", t;
	}(LP), GP = {
		splitLine: function(e, t, n, r, i) {
			var a = n.axis;
			if (!a.scale.isBlank()) {
				var o = n.getModel("splitLine"), s = o.getModel("lineStyle"), c = s.get("color"), l = o.get("showMinLine") !== !1, u = o.get("showMaxLine") !== !1;
				c = B(c) ? c : [c];
				for (var d = r.coordinateSystem.getRect(), f = a.isHorizontal(), p = 0, m = a.getTicksCoords({
					tickModel: o,
					breakTicks: "none",
					pruneByBreak: "preserve_extent_bound"
				}), h = [], g = [], _ = s.getLineStyle(), v = 0; v < m.length; v++) {
					var y = a.toGlobalCoord(m[v].coord);
					if (!(v === 0 && !l || v === m.length - 1 && !u)) {
						var b = m[v].tickValue;
						f ? (h[0] = y, h[1] = d.y, g[0] = y, g[1] = d.y + d.height) : (h[0] = d.x, h[1] = y, g[0] = d.x + d.width, g[1] = y);
						var x = p++ % c.length, S = new gp({
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
						mm(S.shape, _.lineWidth), t.add(S);
					}
				}
			}
		},
		minorSplitLine: function(e, t, n, r, i) {
			var a = n.axis, o = n.getModel("minorSplitLine").getModel("lineStyle"), s = r.coordinateSystem.getRect(), c = a.isHorizontal(), l = a.getMinorTicksCoords();
			if (l.length) for (var u = [], d = [], f = o.getLineStyle(), p = 0; p < l.length; p++) for (var m = 0; m < l[p].length; m++) {
				var h = a.toGlobalCoord(l[p][m].coord);
				c ? (u[0] = h, u[1] = s.y, d[0] = h, d[1] = s.y + s.height) : (u[0] = s.x, u[1] = h, d[0] = s.x + s.width, d[1] = h);
				var g = new gp({
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
				mm(g.shape, f.lineWidth), t.add(g);
			}
		},
		splitArea: function(e, t, n, r, i) {
			zP(e, t, n, r);
		},
		breakArea: function(e, t, n, r, i) {
			var a = RT(), o = n.axis.scale;
			a && o.type !== "ordinal" && a.rectCoordBuildBreakAxis(t, e, n, r.coordinateSystem.getRect(), i);
		}
	}, KP = function(e) {
		P(t, e);
		function t() {
			var n = e !== null && e.apply(this, arguments) || this;
			return n.type = t.type, n;
		}
		return t.type = "xAxis", t;
	}(WP), qP = function(e) {
		P(t, e);
		function t() {
			var t = e !== null && e.apply(this, arguments) || this;
			return t.type = KP.type, t;
		}
		return t.type = "yAxis", t;
	}(WP);
}));
//#endregion
//#region node_modules/echarts/lib/component/grid/installSimple.js
function YP(e) {
	e.registerComponentView(XP), e.registerComponentModel(YE), e.registerCoordinateSystem("cartesian2d", xP), UN(e, "x", PN, ZP), UN(e, "y", PN, ZP), e.registerComponentView(KP), e.registerComponentView(qP), e.registerPreprocessor(function(e) {
		e.xAxis && e.yAxis && !e.grid && (e.grid = {});
	});
}
var XP, ZP, QP = M((() => {
	F(), Gk(), XE(), $m(), q(), FN(), GN(), CP(), JP(), XP = function(e) {
		P(t, e);
		function t() {
			var t = e !== null && e.apply(this, arguments) || this;
			return t.type = "grid", t;
		}
		return t.prototype.render = function(e, t) {
			this.group.removeAll(), e.get("show") && this.group.add(new _c({
				shape: e.coordinateSystem.getRect(),
				style: et({ fill: e.get("backgroundColor") }, e.getItemStyle()),
				silent: !0,
				z2: -1
			}));
		}, t.type = "grid", t;
	}(Wk), ZP = { offset: 0 };
})), $P = M((() => {
	xw(), q(), Sl(), V_(), aS(), xT(), Kx(), Z(), eC(), DE(), GE(), lT(), mT(), Lg(), XE(), yw(), F(), lx(), q_(), $_(), Eb(), $s(), kf(), $m(), Fu(), nf(), gh(), rD(), _S(), mS(), Ox(), Pl(), Ur(), im(), oD(), S_(), v_(), Wh(), j_(), Or(), bs(), ks(), Qi(), ir(), LT(), Uy(), jN(), Lx(), Sx(), hw(), QP(), qy(), NN(), Jb(), sc(), HN(), jh(), SE(), Gk(), yT(), oC(), $N(), no(), xD(), DN(), Mf(), vc(), Ff(), _p(), up(), pp(), Df(), jp(), Np(), nc(), Da(), Ps(), Kj(), wi(), Ju(), zo(), Wu(), jx(), es(), $y(), Fh(), vn(), ky(), Zb(), YC(), sP(), GN(), kg(), Es(), Ye(), rS(), SS(), eo(), KA();
})), eF = M((() => {
	$P();
}));
//#endregion
//#region node_modules/echarts/lib/component/axisPointer/BaseAxisPointer.js
function tF(e, t, n, r) {
	nF(oF(n).lastProp, r) || (oF(n).lastProp = r, t ? Xp(n, r, e) : (n.stopAnimation(), n.attr(r)));
}
function nF(e, t) {
	if (U(e) && U(t)) {
		var n = !0;
		return R(t, function(t, r) {
			n &&= nF(e[r], t);
		}), !!n;
	}
	return e === t;
}
function rF(e, t) {
	e[t.get(["label", "show"]) ? "show" : "hide"]();
}
function iF(e) {
	return {
		x: e.x || 0,
		y: e.y || 0,
		rotation: e.rotation || 0
	};
}
function aF(e, t, n) {
	var r = t.get("z"), i = t.get("zlevel");
	e && e.traverse(function(e) {
		e.type !== "group" && (r != null && (e.z = r), i != null && (e.zlevel = i), e.silent = n);
	});
}
var oF, sF, cF, lF, uF = M((() => {
	q(), $m(), FP(), xD(), rD(), Z(), mT(), oF = ru(), sF = I, cF = Kt, lF = function() {
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
				if (!o) o = this._group = new Of(), this.createPointerEl(o, c, e, t), this.createLabelEl(o, c, e, t), n.getZr().add(o);
				else {
					var d = ut(tF, t, u);
					this.updatePointerEl(o, c, d), this.updateLabelEl(o, c, d, t);
				}
				aF(o, t, !0), this._renderHandle(i);
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
				if (i && uT(r).w > o) return !0;
				if (a) {
					var s = jP(e).seriesDataCount, c = r.getExtent();
					return Math.abs(c[0] - c[1]) / s > o;
				}
				return !1;
			}
			return n === !0;
		}, e.prototype.makeElOption = function(e, t, n, r, i) {}, e.prototype.createPointerEl = function(e, t, n, r) {
			var i = t.pointer;
			if (i) {
				var a = oF(e).pointerEl = new am[i.type](sF(t.pointer));
				e.add(a);
			}
		}, e.prototype.createLabelEl = function(e, t, n, r) {
			if (t.label) {
				var i = oF(e).labelEl = new Nc(sF(t.label));
				e.add(i), rF(i, r);
			}
		}, e.prototype.updatePointerEl = function(e, t, n) {
			var r = oF(e).pointerEl;
			r && t.pointer && (r.setStyle(t.pointer.style), n(r, { shape: t.pointer.shape }));
		}, e.prototype.updateLabelEl = function(e, t, n, r) {
			var i = oF(e).labelEl;
			i && (i.setStyle(t.label.style), n(i, {
				x: t.label.x,
				y: t.label.y
			}), rF(i, r));
		}, e.prototype._renderHandle = function(e) {
			if (!this._dragging && this.updateHandleTransform) {
				var t = this._axisPointerModel, n = this._api.getZr(), r = this._handle, i = t.getModel("handle"), a = t.get("status");
				if (!i.get("show") || !a || a === "hide") {
					r && n.remove(r), this._handle = null;
					return;
				}
				var o;
				this._handle || (o = !0, r = this._handle = wm(i.get("icon"), {
					cursor: "move",
					draggable: !0,
					onmousemove: function(e) {
						bD(e.event);
					},
					onmousedown: cF(this._onHandleDragMove, this, 0, 0),
					drift: cF(this._onHandleDragMove, this),
					ondragend: cF(this._onHandleDragEnd, this)
				}), n.add(r)), aF(r, t, !1), r.setStyle(i.getItemStyle(null, [
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
				B(s) || (s = [s, s]), r.scaleX = s[0] / 2, r.scaleY = s[1] / 2, QE(this, "_doDispatchAxisPointer", i.get("throttle") || 0, "fixRate"), this._moveHandleToValue(e, o);
			}
		}, e.prototype._moveHandleToValue = function(e, t) {
			tF(this._axisPointerModel, !t && this._moveAnimation, this._handle, iF(this.getHandleTransform(e, this._axisModel, this._axisPointerModel)));
		}, e.prototype._onHandleDragMove = function(e, t) {
			var n = this._handle;
			if (n) {
				this._dragging = !0;
				var r = this.updateHandleTransform(iF(n), [e, t], this._axisModel, this._axisPointerModel);
				this._payloadInfo = r, n.stopAnimation(), n.attr(iF(r)), oF(n).lastProp = null, this._doDispatchAxisPointer();
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
			t && n && (this._lastGraphicKey = null, n && t.remove(n), r && t.remove(r), this._group = null, this._handle = null, this._payloadInfo = null), $E(this, "_doDispatchAxisPointer");
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
function dF(e) {
	var t = e.get("type"), n = e.getModel(t + "Style"), r;
	return t === "line" ? (r = n.getLineStyle(), r.fill = null) : t === "shadow" && (r = n.getAreaStyle(), r.stroke = null), r;
}
function fF(e, t, n, r, i) {
	var a = mF(n.get("value"), t.axis, t.ecModel, n.get("seriesDataIndices"), {
		precision: n.get(["label", "precision"]),
		formatter: n.get(["label", "formatter"])
	}), o = n.getModel("label"), s = Ey(o.get("padding") || 0), c = o.getFont(), l = Pr(a, c), u = i.position, d = l.width + s[1] + s[3], f = l.height + s[0] + s[2], p = i.align;
	p === "right" && (u[0] -= d), p === "center" && (u[0] -= d / 2);
	var m = i.verticalAlign;
	m === "bottom" && (u[1] -= f), m === "middle" && (u[1] -= f / 2), pF(u, d, f, r);
	var h = o.get("backgroundColor");
	(!h || h === "auto") && (h = t.get([
		"axisLine",
		"lineStyle",
		"color"
	])), e.label = {
		x: u[0],
		y: u[1],
		style: ih(o, {
			text: a,
			font: c,
			fill: o.getTextColor(),
			padding: s,
			backgroundColor: h
		}),
		z2: 10
	};
}
function pF(e, t, n, r) {
	var i = r.getWidth(), a = r.getHeight();
	e[0] = Math.min(e[0] + t, i) - t, e[1] = Math.min(e[1] + n, a) - n, e[0] = Math.max(e[0], 0), e[1] = Math.max(e[1], 0);
}
function mF(e, t, n, r, i) {
	e = t.scale.parse(e);
	var a = t.scale.getLabel({ value: e }, { precision: i.precision }), o = i.formatter;
	if (o) {
		var s = {
			value: LC(t, { value: e }),
			axisDimension: t.dim,
			axisIndex: t.index,
			seriesData: []
		};
		R(r, function(e) {
			var t = n.getSeriesByIndex(e.seriesIndex), r = e.dataIndexInside, i = t && t.getDataParams(r);
			i && s.seriesData.push(i);
		}), H(o) ? a = o.replace("{value}", a) : V(o) && (a = o(s));
	}
	return a;
}
function hF(e, t, n) {
	var r = Nn();
	return Rn(r, r, n.rotation), Ln(r, r, n.position), _m([e.dataToCoord(t), (n.labelOffset || 0) + (n.labelDirection || 1) * (n.labelMargin || 0)], r);
}
function gF(e, t, n, r, i, a) {
	var o = _E.innerTextLayout(n.rotation, 0, n.labelDirection);
	n.labelMargin = i.get(["label", "margin"]), fF(t, r, i, a, {
		position: hF(r.axis, e, n),
		align: o.textAlign,
		verticalAlign: o.textVerticalAlign
	});
}
function _F(e, t, n) {
	return n ||= 0, {
		x1: e[n],
		y1: e[1 - n],
		x2: t[n],
		y2: t[1 - n]
	};
}
function vF(e, t, n) {
	return n ||= 0, {
		x: e[n],
		y: e[1 - n],
		width: t[n],
		height: t[1 - n]
	};
}
function yF(e, t, n) {
	return uT(e, {
		fromStat: { sers: z(t, function(e) {
			return n.getSeriesByIndex(e.seriesIndex);
		}) },
		min: 1
	}).w;
}
function bF(e, t, n) {
	return [ll(cl(t[0], t[1]), e - n / 2), cl(e + n / 2, ll(t[0], t[1]))];
}
var xF = M((() => {
	q(), $m(), Ur(), ky(), Vn(), YC(), SE(), gh(), mT(), Sl();
}));
//#endregion
//#region node_modules/echarts/lib/component/axisPointer/CartesianAxisPointer.js
function SF(e, t) {
	var n = {};
	return n[t.dim + "AxisIndex"] = t.index, e.getCartesian(n);
}
function CF(e) {
	return e.dim === "x" ? 0 : 1;
}
var wF, TF, EF = M((() => {
	F(), uF(), xF(), DE(), Sl(), wF = function(e) {
		P(t, e);
		function t() {
			return e !== null && e.apply(this, arguments) || this;
		}
		return t.prototype.makeElOption = function(e, t, n, r, i) {
			var a = n.axis, o = a.grid, s = r.get("type"), c = a.getGlobalExtent(), l = SF(o, a).getOtherAxis(a).getGlobalExtent(), u = a.toGlobalCoord(a.dataToCoord(t, !0));
			if (s && s !== "none") {
				var d = dF(r), f = TF[s](a, u, c, l, r.get("seriesDataIndices"), r.ecModel);
				f.style = d, e.graphicKey = f.type, e.pointer = f;
			}
			gF(t, e, CE(o.getRect(), n), n, r, i);
		}, t.prototype.getHandleTransform = function(e, t, n) {
			var r = CE(t.axis.grid.getRect(), t, { labelInside: !1 });
			r.labelMargin = n.get(["handle", "margin"]);
			var i = hF(t.axis, e, r);
			return {
				x: i[0],
				y: i[1],
				rotation: r.rotation + (r.labelDirection < 0 ? Math.PI : 0)
			};
		}, t.prototype.updateHandleTransform = function(e, t, n, r) {
			var i = n.axis, a = i.grid, o = i.getGlobalExtent(!0), s = SF(a, i).getOtherAxis(i).getGlobalExtent(), c = i.dim === "x" ? 0 : 1, l = [e.x, e.y];
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
	}(lF), TF = {
		line: function(e, t, n, r) {
			return {
				type: "Line",
				subPixelOptimize: !0,
				shape: _F([t, r[0]], [t, r[1]], CF(e))
			};
		},
		shadow: function(e, t, n, r, i, a) {
			var o = yF(e, i, a), s = r[1] - r[0], c = bF(t, n, o), l = c[0], u = c[1];
			return {
				type: "Rect",
				shape: vF([l, r[0]], [u - l, s], CF(e))
			};
		}
	};
})), DF, OF = M((() => {
	F(), qy(), Eb(), DF = function(e) {
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
	}(Ky);
}));
//#endregion
//#region node_modules/echarts/lib/component/axisPointer/globalListener.js
function kF(e, t, n) {
	if (!J.node) {
		var r = t.getZr();
		IF(r).records || (IF(r).records = {}), AF(r, t);
		var i = IF(r).records[e] || (IF(r).records[e] = {});
		i.handler = n;
	}
}
function AF(e, t) {
	if (IF(e).initialized) return;
	IF(e).initialized = !0, n("click", ut(NF, "click")), n("mousemove", ut(NF, "mousemove")), n("mousewheel", ut(NF, "mousewheel")), n("globalout", MF);
	function n(n, r) {
		e.on(n, function(n) {
			var i = PF(t);
			LF(IF(e).records, function(e) {
				e && r(e, n, i.dispatchAction);
			}), jF(i.pendings, t);
		});
	}
}
function jF(e, t) {
	var n = e.showTip.length, r = e.hideTip.length, i;
	n ? i = e.showTip[n - 1] : r && (i = e.hideTip[r - 1]), i && (i.dispatchAction = null, t.dispatchAction(i));
}
function MF(e, t, n) {
	e.handler("leave", null, n);
}
function NF(e, t, n, r) {
	t.handler(e, n, r);
}
function PF(e) {
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
function FF(e, t) {
	if (!J.node) {
		var n = t.getZr();
		(IF(n).records || {})[e] && (IF(n).records[e] = null);
	}
}
var IF, LF, RF = M((() => {
	q(), en(), Z(), IF = ru(), LF = R;
})), zF, BF = M((() => {
	F(), RF(), Gk(), zF = function(e) {
		P(t, e);
		function t() {
			var n = e !== null && e.apply(this, arguments) || this;
			return n.type = t.type, n;
		}
		return t.prototype.render = function(e, t, n) {
			var r = t.getComponent("tooltip"), i = e.get("triggerOn") || r && r.get("triggerOn") || "mousemove|click|mousewheel";
			kF("axisPointer", n, function(e, t, n) {
				i !== "none" && (e === "leave" || i.indexOf(e) >= 0) && n({
					type: "updateAxisPointer",
					currTrigger: e,
					x: t && t.offsetX,
					y: t && t.offsetY
				});
			});
		}, t.prototype.remove = function(e, t) {
			FF("axisPointer", t);
		}, t.prototype.dispose = function(e, t) {
			FF("axisPointer", t);
		}, t.type = "axisPointer", t;
	}(Wk);
}));
//#endregion
//#region node_modules/echarts/lib/component/axisPointer/findPointFromSeries.js
function VF(e, t) {
	var n = [], r = e.seriesIndex, i;
	if (r == null || !(i = t.getSeriesByIndex(r))) return { point: [] };
	var a = i.getData(), o = nu(a, e);
	if (o == null || o < 0 || B(o)) return { point: [] };
	var s = a.getItemGraphicEl(o), c = i.coordinateSystem;
	if (i.getTooltipPosition) n = i.getTooltipPosition(o) || [];
	else if (c && c.dataToPoint) {
		if (e.isStacked) {
			var l = c.getBaseAxis(), u = c.getOtherAxis(l).dim, d = l.dim, f = +(u === "x" || u === "radius"), p = a.mapDimension(d), m = [];
			m[f] = a.get(p, o), m[1 - f] = a.get(a.getCalculationInfo("stackResultDimension"), o), n = c.dataToPoint(m) || [];
		} else n = c.dataToPoint(a.getValues(z(c.dimensions, function(e) {
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
var HF = M((() => {
	q(), Z();
}));
//#endregion
//#region node_modules/echarts/lib/component/axisPointer/axisTrigger.js
function UF(e, t, n) {
	var r = e.currTrigger, i = [e.x, e.y], a = e, o = e.dispatchAction || Kt(n.dispatchAction, n), s = t.getComponent("axisPointer").coordSysAxesInfo;
	if (s) {
		$F(i) && (i = VF({
			seriesIndex: a.seriesIndex,
			dataIndex: a.dataIndex
		}, t).point);
		var c = $F(i), l = a.axesInfo, u = s.axesInfo, d = r === "leave" || $F(i), f = {}, p = {}, m = {
			list: [],
			map: {}
		}, h = {
			showPointer: ut(KF, p),
			showTooltip: ut(qF, m)
		};
		R(s.coordSysMap, function(e, t) {
			var n = c || e.containPoint(i);
			R(s.coordSysAxesInfo[t], function(e, t) {
				var r = e.axis, a = ZF(l, e);
				if (!d && n && (!l || a)) {
					var o = a && a.value;
					o == null && !c && (o = r.pointToData(i)), o != null && WF(e, o, h, !1, f);
				}
			});
		});
		var g = {};
		return R(u, function(e, t) {
			var n = e.linkGroup;
			n && !p[t] && R(n.axesInfo, function(t, r) {
				var i = p[r];
				if (t !== e && i) {
					var a = i.value;
					n.mapper && (a = e.axis.scale.parse(n.mapper(a, QF(t), QF(e)))), g[e.key] = a;
				}
			});
		}), R(g, function(e, t) {
			WF(u[t], e, h, !0, f);
		}), JF(p, u, f), YF(m, i, e, o), XF(u, o, n), f;
	}
}
function WF(e, t, n, r, i) {
	var a = e.axis;
	if (!a.scale.isBlank() && a.containData(t)) {
		if (!e.involveSeries) {
			n.showPointer(e, t);
			return;
		}
		var o = GF(t, e), s = o.payloadBatch, c = o.snapToValue;
		s[0] && i.seriesIndex == null && L(i, s[0]), !r && e.snap && a.containData(c) && c != null && (t = c), n.showPointer(e, t, s), n.showTooltip(e, o, c);
	}
}
function GF(e, t) {
	var n = t.axis, r = n.dim, i = e, a = [], o = Number.MAX_VALUE, s = -1;
	return R(t.seriesModels, function(t, c) {
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
			m <= o && ((m < o || p >= 0 && s < 0) && (o = m, s = p, i = u, a.length = 0), R(d, function(e) {
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
function KF(e, t, n, r) {
	e[t.key] = {
		value: n,
		payloadBatch: r
	};
}
function qF(e, t, n, r) {
	var i = n.payloadBatch, a = t.axis, o = a.model, s = t.axisPointerModel;
	if (t.triggerTooltip && i.length) {
		var c = t.coordSys.model, l = PP(c), u = e.map[l];
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
function JF(e, t, n) {
	var r = n.axesInfo = [];
	R(t, function(t, n) {
		var i = t.axisPointerModel.option, a = e[n];
		a ? (!t.useHandle && (i.status = "show"), i.value = a.value, i.seriesDataIndices = (a.payloadBatch || []).slice()) : !t.useHandle && (i.status = "hide"), i.status === "show" && r.push({
			axisDim: t.axis.dim,
			axisIndex: t.axis.model.componentIndex,
			value: i.value
		});
	});
}
function YF(e, t, n, r) {
	if ($F(t) || !e.list.length) {
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
function XF(e, t, n) {
	var r = n.getZr(), i = "axisPointerLastHighlights", a = eI(r)[i] || {}, o = eI(r)[i] = {};
	R(e, function(e, t) {
		var n = e.axisPointerModel.option;
		n.status === "show" && e.triggerEmphasis && R(n.seriesDataIndices, function(e) {
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
	R(a, function(e, t) {
		!o[t] && c.push(l(e));
	}), R(o, function(e, t) {
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
function ZF(e, t) {
	for (var n = 0; n < (e || []).length; n++) {
		var r = e[n];
		if (t.axis.dim === r.axisDim && t.axis.model.componentIndex === r.axisIndex) return r;
	}
}
function QF(e) {
	var t = e.axis.model, n = {}, r = n.axisDim = e.axis.dim;
	return n.axisIndex = n[r + "AxisIndex"] = t.componentIndex, n.axisName = n[r + "AxisName"] = t.name, n.axisId = n[r + "AxisId"] = t.id, n;
}
function $F(e) {
	return !e || e[0] == null || isNaN(e[0]) || e[1] == null || isNaN(e[1]);
}
var eI, tI = M((() => {
	Z(), FP(), HF(), q(), Sl(), eI = ru();
}));
//#endregion
//#region node_modules/echarts/lib/component/axisPointer/install.js
function nI(e) {
	LP.registerAxisPointerClass("CartesianAxisPointer", wF), e.registerComponentModel(DF), e.registerComponentView(zF), e.registerPreprocessor(function(e) {
		if (e) {
			(!e.axisPointer || e.axisPointer.length === 0) && (e.axisPointer = {});
			var t = e.axisPointer.link;
			t && !B(t) && (e.axisPointer.link = [t]);
		}
	}), e.registerProcessor(e.PRIORITY.PROCESSOR.STATISTIC, { overallReset: function(e, t) {
		e.getComponent("axisPointer").coordSysAxesInfo = wP(e, t);
	} }), e.registerAction({
		type: "updateAxisPointer",
		event: "updateAxisPointer",
		update: ":updateAxisPointer"
	}, UF);
}
var rI = M((() => {
	RP(), EF(), OF(), BF(), q(), FP(), tI();
}));
//#endregion
//#region node_modules/echarts/lib/component/grid/install.js
function iI(e) {
	ON(YP), ON(nI);
}
var aI = M((() => {
	QP(), rI(), jN();
}));
//#endregion
//#region node_modules/echarts/lib/component/helper/listComponent.js
function oI(e, t) {
	var n = Ey(t.get("padding")), r = t.getItemStyle(["color", "opacity"]);
	return r.fill = t.get("backgroundColor"), new _c({
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
var sI = M((() => {
	ky(), $m();
})), cI, lI = M((() => {
	F(), qy(), Eb(), cI = function(e) {
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
	}(Ky);
}));
//#endregion
//#region node_modules/echarts/lib/component/tooltip/helper.js
function uI(e) {
	var t = e.get("confine");
	return t == null ? e.get("renderMode") === "richText" : !!t;
}
function dI(e) {
	if (J.domSupported) {
		for (var t = document.documentElement.style, n = 0, r = e.length; n < r; n++) if (e[n] in t) return e[n];
	}
}
function fI(e, t) {
	if (!e) return t;
	t = xy(t, !0);
	var n = e.indexOf(t);
	return e = n === -1 ? t : "-" + e.slice(0, n) + "-" + t, e.toLowerCase();
}
function pI(e, t) {
	var n = e.currentStyle || document.defaultView && document.defaultView.getComputedStyle(e);
	return n ? t ? n[t] : n : null;
}
var mI, hI, gI = M((() => {
	ky(), en(), mI = dI([
		"transform",
		"webkitTransform",
		"OTransform",
		"MozTransform",
		"msTransform"
	]), hI = dI([
		"webkitTransition",
		"transition",
		"OTransition",
		"MozTransition",
		"msTransition"
	]);
}));
//#endregion
//#region node_modules/echarts/lib/component/tooltip/TooltipHTMLContent.js
function _I(e) {
	return e = e === "left" ? "right" : e === "right" ? "left" : e === "top" ? "bottom" : "top", e;
}
function vI(e, t, n) {
	if (!H(n) || n === "inside") return "";
	var r = e.get("backgroundColor"), i = e.get("borderWidth");
	t = Ty(t);
	var a = _I(n), o = Math.max(Math.round(i) * 1.5, 6), s = "", c = TI + ":", l;
	tt(["left", "right"], a) > -1 ? (s += "top:50%", c += "translateY(-50%) rotate(" + (l = a === "left" ? -225 : -45) + "deg)") : (s += "left:50%", c += "translateX(-50%) rotate(" + (l = a === "top" ? 225 : 45) + "deg)");
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
function yI(e, t, n) {
	var r = "cubic-bezier(0.23,1,0.32,1)", i = "", a = "";
	return n && (i = " " + e / 2 + "s " + r, a = "opacity" + i + ",visibility" + i), t || (i = " " + e + "s " + r, a += (a.length ? "," : "") + (J.transformSupported ? "" + TI + i : ",left" + i + ",top" + i)), wI + ":" + a;
}
function bI(e, t, n) {
	var r = e.toFixed(0) + "px", i = t.toFixed(0) + "px";
	if (!J.transformSupported) return n ? "top:" + i + ";left:" + r + ";" : [["top", i], ["left", r]];
	var a = J.transform3dSupported, o = "translate" + (a ? "3d" : "") + "(" + r + "," + i + (a ? ",0" : "") + ")";
	return n ? "top:0;left:0;" + TI + ":" + o + ";" : [
		["top", 0],
		["left", 0],
		[mI, o]
	];
}
function xI(e) {
	var t = [], n = e.get("fontSize"), r = e.getTextColor();
	r && t.push("color:" + r), t.push("font:" + e.getFont());
	var i = W(e.get("lineHeight"), Math.round(n * 3 / 2));
	n && t.push("line-height:" + i + "px");
	var a = e.get("textShadowColor"), o = e.get("textShadowBlur") || 0, s = e.get("textShadowOffsetX") || 0, c = e.get("textShadowOffsetY") || 0;
	return a && o && t.push("text-shadow:" + s + "px " + c + "px " + o + "px " + a), R(["decoration", "align"], function(n) {
		var r = e.get(n);
		r && t.push("text-" + n + ":" + r);
	}), t.join(";");
}
function SI(e, t, n, r) {
	var i = [], a = e.get("transitionDuration"), o = e.get("backgroundColor"), s = e.get("shadowBlur"), c = e.get("shadowColor"), l = e.get("shadowOffsetX"), u = e.get("shadowOffsetY"), d = e.getModel("textStyle"), f = Ub(e, "html"), p = l + "px " + u + "px " + s + "px " + c;
	return i.push("box-shadow:" + p), t && a > 0 && i.push(yI(a, n, r)), o && i.push("background-color:" + o), R([
		"width",
		"color",
		"radius"
	], function(t) {
		var n = "border-" + t, r = xy(n), a = e.get(r);
		a != null && i.push(n + ":" + a + (t === "color" ? "" : "px"));
	}), i.push(xI(d)), f != null && i.push("padding:" + Ey(f).join("px ") + "px"), i.join(";") + ";";
}
function CI(e, t, n, r, i) {
	var a = t && t.painter;
	if (n) {
		var o = a && a.getViewportRoot();
		o && iv(e, o, n, r, i);
	} else {
		e[0] = r, e[1] = i;
		var s = a && a.getViewportRootOffset();
		s && (e[0] += s.offsetLeft, e[1] += s.offsetTop);
	}
	e[2] = e[0] / t.getWidth(), e[3] = e[1] / t.getHeight();
}
var wI, TI, EI, DI, OI = M((() => {
	q(), xD(), hv(), en(), ky(), gI(), Jb(), wI = fI(hI, "transition"), TI = fI(mI, "transform"), EI = "position:absolute;display:block;border-style:solid;white-space:nowrap;z-index:9999999;" + (J.transform3dSupported ? "will-change:transform;" : ""), DI = function() {
		function e(e, t) {
			if (this._show = !1, this._styleCoord = [
				0,
				0,
				0,
				0
			], this._enterable = !0, this._alwaysShowContent = !1, this._firstShow = !0, this._longHide = !0, J.wxa) return null;
			var n = document.createElement("div");
			n.domBelongToZr = !0, this.el = n;
			var r = this._zr = e.getZr(), i = t.appendTo, a = i && (H(i) ? document.querySelector(i) : ht(i) ? i : V(i) && i(e.getDom()));
			CI(this._styleCoord, r, a, e.getWidth() / 2, e.getHeight() / 2), (a || e.getDom()).appendChild(n), this._api = e, this._container = a;
			var o = this;
			n.onmouseenter = function() {
				o._enterable && (clearTimeout(o._hideTimeout), o._show = !0), o._inContent = !0;
			}, n.onmousemove = function(e) {
				if (e ||= window.event, !o._enterable) {
					var t = r.handler;
					pD(r.painter.getViewportRoot(), e, !0), t.dispatch("mousemove", e);
				}
			}, n.onmouseleave = function() {
				o._inContent = !1, o._enterable && o._show && o.hideLater(o._hideDelay);
			};
		}
		return e.prototype.update = function(e) {
			if (!this._container) {
				var t = this._api.getDom(), n = pI(t, "position"), r = t.style;
				r.position !== "absolute" && n !== "absolute" && (r.position = "relative");
			}
			var i = e.get("alwaysShowContent");
			i && this._moveIfResized(), this._alwaysShowContent = i, this._enableDisplayTransition = e.get("displayTransition") && e.get("transitionDuration") > 0, this.el.className = e.get("className") || "";
		}, e.prototype.show = function(e, t) {
			clearTimeout(this._hideTimeout), clearTimeout(this._longHideTimeout);
			var n = this.el, r = n.style, i = this._styleCoord;
			n.innerHTML ? r.cssText = EI + SI(e, !this._firstShow, this._longHide, this._enableDisplayTransition) + bI(i[0], i[1], !0) + ("border-color:" + Ty(t) + ";") + (e.get("extraCssText") || "") + (";pointer-events:" + (this._enterable ? "auto" : "none")) : r.display = "none", this._show = !0, this._firstShow = !1, this._longHide = !1;
		}, e.prototype.setContent = function(e, t, n, r, i) {
			var a = this.el;
			if (e == null) {
				a.innerHTML = "";
				return;
			}
			var o = "";
			if (H(i) && n.get("trigger") === "item" && !uI(n) && (o = vI(n, r, i)), H(e)) a.innerHTML = e + o;
			else if (e) {
				a.innerHTML = "", B(e) || (e = [e]);
				for (var s = 0; s < e.length; s++) ht(e[s]) && e[s].parentNode !== a && a.appendChild(e[s]);
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
				if (CI(n, this._zr, this._container, e, t), n[0] != null && n[1] != null) {
					var r = this.el.style;
					R(bI(n[0], n[1]), function(e) {
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
			this._show && !(this._inContent && this._enterable) && !this._alwaysShowContent && (e ? (this._hideDelay = e, this._show = !1, this._hideTimeout = setTimeout(Kt(this.hide, this), e)) : this.hide());
		}, e.prototype.isShow = function() {
			return this._show;
		}, e.prototype.dispose = function() {
			clearTimeout(this._hideTimeout), clearTimeout(this._longHideTimeout);
			var e = this._zr;
			av(e && e.painter && e.painter.getViewportRoot(), this._container);
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
function kI(e) {
	return Math.max(0, e);
}
function AI(e) {
	var t = kI(e.shadowBlur || 0), n = kI(e.shadowOffsetX || 0), r = kI(e.shadowOffsetY || 0);
	return {
		left: kI(t - n),
		right: kI(t + n),
		top: kI(t - r),
		bottom: kI(t + r)
	};
}
function jI(e, t, n, r) {
	e[0] = n, e[1] = r, e[2] = e[0] / t.getWidth(), e[3] = e[1] / t.getHeight();
}
var MI, NI = M((() => {
	q(), Lc(), Jb(), Pl(), MI = function() {
		function e(e) {
			this._show = !1, this._styleCoord = [
				0,
				0,
				0,
				0
			], this._alwaysShowContent = !1, this._enterable = !0, this._zr = e.getZr(), jI(this._styleCoord, this._zr, e.getWidth() / 2, e.getHeight() / 2);
		}
		return e.prototype.update = function(e) {
			var t = e.get("alwaysShowContent");
			t && this._moveIfResized(), this._alwaysShowContent = t;
		}, e.prototype.show = function() {
			this._hideTimeout && clearTimeout(this._hideTimeout), this.el.show(), this._show = !0;
		}, e.prototype.setContent = function(e, t, n, r, i) {
			var a = this;
			U(e) && Al(process.env.NODE_ENV === "production" ? "" : "Passing DOM nodes as content is not supported in richText tooltip!"), this.el && this._zr.remove(this.el);
			var o = n.getModel("textStyle");
			this.el = new Nc({
				style: {
					rich: t.richTextStyles,
					text: e,
					lineHeight: 22,
					borderWidth: 1,
					borderColor: r,
					textShadowColor: o.get("textShadowColor"),
					fill: n.get(["textStyle", "color"]),
					padding: Ub(n, "richText"),
					verticalAlign: "top",
					align: "left"
				},
				z: n.get("z")
			}), R([
				"backgroundColor",
				"borderRadius",
				"shadowColor",
				"shadowBlur",
				"shadowOffsetX",
				"shadowOffsetY"
			], function(e) {
				a.el.style[e] = n.get(e);
			}), R([
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
			var e = this.el, t = this.el.getBoundingRect(), n = AI(e.style);
			return [t.width + n.left + n.right, t.height + n.top + n.bottom];
		}, e.prototype.moveTo = function(e, t) {
			var n = this.el;
			if (n) {
				var r = this._styleCoord;
				jI(r, this._zr, e, t), e = r[0], t = r[1];
				var i = n.style, a = kI(i.borderWidth || 0), o = AI(i);
				n.x = e + a + o.left, n.y = t + a + o.top, n.markRedraw();
			}
		}, e.prototype._moveIfResized = function() {
			var e = this._styleCoord[2], t = this._styleCoord[3];
			this.moveTo(e * this._zr.getWidth(), t * this._zr.getHeight());
		}, e.prototype.hide = function() {
			this.el && this.el.hide(), this._show = !1;
		}, e.prototype.hideLater = function(e) {
			this._show && !(this._inContent && this._enterable) && !this._alwaysShowContent && (e ? (this._hideDelay = e, this._show = !1, this._hideTimeout = setTimeout(Kt(this.hide, this), e)) : this.hide());
		}, e.prototype.isShow = function() {
			return this._show;
		}, e.prototype.dispose = function() {
			this._zr.remove(this.el);
		}, e;
	}();
}));
//#endregion
//#region node_modules/echarts/lib/component/tooltip/TooltipView.js
function PI(e, t, n) {
	var r = t.ecModel, i;
	n ? (i = new Ah(n, r, r), i = new Ah(t.option, i, r)) : i = t;
	for (var a = e.length - 1; a >= 0; a--) {
		var o = e[a];
		o && (o instanceof Ah && (o = o.get("tooltip", !0)), H(o) && (o = { formatter: o }), o && (i = new Ah(o, i, r)));
	}
	return i;
}
function FI(e, t) {
	return e.dispatchAction || Kt(t.dispatchAction, t);
}
function II(e, t, n, r, i, a, o) {
	var s = n.getSize(), c = s[0], l = s[1];
	return a != null && (e + c + a + 2 > r ? e -= c + a : e += a), o != null && (t + l + o > i ? t -= l + o : t += o), [e, t];
}
function LI(e, t, n, r, i) {
	var a = n.getSize(), o = a[0], s = a[1];
	return e = Math.min(e + o, r) - o, t = Math.min(t + s, i) - s, e = Math.max(e, 0), t = Math.max(t, 0), [e, t];
}
function RI(e, t, n, r) {
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
function zI(e) {
	return e === "center" || e === "middle";
}
function BI(e, t, n) {
	var r = au(e).queryOptionMap, i = r.keys()[0];
	if (i && i !== "series") {
		var a = ou(t, i, r.get(i), {
			useDefault: !1,
			enableAll: !1,
			enableNone: !1
		}).models[0];
		if (a) {
			var o = n.getViewOfComponentModel(a), s;
			if (o.group.traverse(function(t) {
				var n = Nu(t).tooltipConfig;
				if (n && n.name === e.name) return s = t, !0;
			}), s) return {
				componentMainType: i,
				componentIndex: a.componentIndex,
				el: s
			};
		}
	}
}
var VI, HI, UI = M((() => {
	F(), q(), en(), OI(), NI(), ky(), Sl(), $m(), HF(), Uy(), jh(), RF(), YC(), xF(), Z(), Gk(), yy(), Fu(), gI(), rb(), Jb(), LA(), rD(), VI = new _c({ shape: {
		x: -1,
		y: -1,
		width: 2,
		height: 2
	} }), HI = function(e) {
		P(t, e);
		function t() {
			var n = e !== null && e.apply(this, arguments) || this;
			return n.type = t.type, n;
		}
		return t.prototype.init = function(e, t) {
			if (!J.node && t.getDom()) {
				var n = e.getComponent("tooltip"), r = this._renderMode = uu(n.get("renderMode"));
				this._tooltipContent = r === "richText" ? new MI(t) : new DI(t, { appendTo: n.get("appendToBody", !0) ? "body" : n.get("appendTo", !0) });
			}
		}, t.prototype.render = function(e, t, n) {
			if (!J.node && n.getDom()) {
				this.group.removeAll(), this._tooltipModel = e, this._ecModel = t, this._api = n;
				var r = this._tooltipContent;
				r.update(e), r.setEnterable(e.get("enterable")), this._initGlobalListener(), this._keepShow(), this._renderMode !== "richText" && e.get("transitionDuration") ? QE(this, "_updatePosition", 50, "fixRate") : $E(this, "_updatePosition");
			}
		}, t.prototype._initGlobalListener = function() {
			var e = this._tooltipModel.get("triggerOn");
			kF("itemTooltip", this._api, Kt(function(t, n, r) {
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
				var i = FI(r, n);
				this._ticket = "";
				var a = r.dataByCoordSys, o = BI(r, t, n);
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
					var c = VI;
					c.x = r.x, c.y = r.y, c.update(), Nu(c).tooltipConfig = {
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
					var l = VF(r, t), u = l.point[0], d = l.point[1];
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
			this._tooltipModel && i.hideLater(this._tooltipModel.get("hideDelay")), this._lastX = this._lastY = this._lastDataByCoordSys = null, this._cbParamsList = null, r.from !== this.uid && this._hide(FI(r, n));
		}, t.prototype._manuallyAxisShowTip = function(e, t, n, r) {
			var i = r.seriesIndex, a = r.dataIndex, o = t.getComponent("axisPointer").coordSysAxesInfo;
			if (i != null && a != null && o != null) {
				var s = t.getSeriesByIndex(i);
				if (s && PI([
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
					if (Nu(n).ssrType === "legend") return;
					this._lastDataByCoordSys = null, this._cbParamsList = null;
					var i, a;
					IA(n, function(e) {
						if (e.tooltipDisabled) return i = a = null, !0;
						i || a || (Nu(e).dataIndex == null ? Nu(e).tooltipConfig != null && (a = e) : i = e);
					}, !0), i ? this._showSeriesItemTooltip(e, i, t) : a ? this._showComponentItemTooltip(e, a, t) : this._hide(t);
				} else this._lastDataByCoordSys = null, this._cbParamsList = null, this._hide(t);
			}
		}, t.prototype._showOrMove = function(e, t) {
			var n = e.get("showDelay");
			t = Kt(t, this), clearTimeout(this._showTimout), n > 0 ? this._showTimout = setTimeout(t, n) : t();
		}, t.prototype._showAxisTooltip = function(e, t) {
			var n = this._ecModel, r = this._tooltipModel, i = [t.offsetX, t.offsetY], a = PI([t.tooltipOption], r), o = this._renderMode, s = [], c = kb("section", {
				blocks: [],
				noHeader: !0
			}), l = [], u = new qb();
			R(e, function(e) {
				R(e.dataByAxis, function(e) {
					var t = n.getComponent(e.axisDim + "Axis", e.axisIndex), i = e.value, a = t.axis, d = a.scale.parse(i);
					if (t && i != null) {
						var f = mF(i, a, n, e.seriesDataIndices, e.valueLabelOpt), p = kb("section", {
							header: f,
							noHeader: !wt(f),
							sortBlocks: !0,
							blocks: []
						});
						c.blocks.push(p), R(e.seriesDataIndices, function(i) {
							var a = n.getSeriesByIndex(i.seriesIndex), c = i.dataIndexInside, m = a.getDataParams(c);
							if (!(m.dataIndex < 0)) {
								m.axisDim = e.axisDim, m.axisIndex = e.axisIndex, m.axisType = e.axisType, m.axisId = e.axisId, m.axisValue = LC(t.axis, { value: d }), m.axisValueLabel = f, m.marker = u.makeTooltipMarker("item", Ty(m.color), o);
								var h = eb(a.formatTooltip(c, !0, null)), g = h.frag;
								if (g) {
									var _ = PI([a], r).get("valueFormatter");
									p.blocks.push(_ ? L({ valueFormatter: _ }, g) : g);
								}
								h.text && l.push(h.text), s.push(m);
							}
						});
					}
				});
			}), c.blocks.reverse(), l.reverse();
			var d = t.position, f = Fb(c, u, o, a.get("order"), n.get("useUTC"), a.get("textStyle"));
			f && l.unshift(f);
			var p = o === "richText" ? "\n\n" : "<br/>", m = l.join(p);
			this._showOrMove(a, function() {
				this._updateContentNotChangedOnAxis(e, s) ? this._updatePosition(a, d, i[0], i[1], this._tooltipContent, s) : this._showTooltipContent(a, m, s, Math.random() + "", i[0], i[1], d, null, u);
			});
		}, t.prototype._showSeriesItemTooltip = function(e, t, n) {
			var r = this._ecModel, i = Nu(t), a = i.seriesIndex, o = r.getSeriesByIndex(a), s = i.dataModel || o, c = i.dataIndex, l = i.dataType, u = s.getData(l), d = this._renderMode, f = e.positionDefault, p = PI([
				u.getItemModel(c),
				s,
				o && (o.coordinateSystem || {}).model
			], this._tooltipModel, f ? { position: f } : null), m = p.get("trigger");
			if (m == null || m === "item") {
				var h = s.getDataParams(c, l), g = new qb();
				h.marker = g.makeTooltipMarker("item", Ty(h.color), d);
				var _ = eb(s.formatTooltip(c, !1, l)), v = p.get("order"), y = p.get("valueFormatter"), b = _.frag, x = b ? Fb(y ? L({ valueFormatter: y }, b) : b, g, d, v, r.get("useUTC"), p.get("textStyle")) : _.text, S = "item_" + s.name + "_" + c;
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
			var r = this._renderMode === "html", i = Nu(t), a = i.tooltipConfig.option || {}, o = a.encodeHTMLContent;
			if (H(a)) {
				var s = a;
				a = {
					content: s,
					formatter: s
				}, o = !0;
			}
			o && r && a.content && (a = I(a), a.content = uv(a.content));
			var c = [a], l = this._ecModel.getComponent(i.componentMainType, i.componentIndex);
			l && c.push(l), c.push({ formatter: a.content });
			var u = e.positionDefault, d = PI(c, this._tooltipModel, u ? { position: u } : null), f = d.get("content"), p = Math.random() + "", m = new qb();
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
					if (H(u)) {
						var p = e.ecModel.get("useUTC"), m = B(n) ? n[0] : n, h = m && m.axisType && m.axisType.indexOf("time") >= 0;
						d = u, h && (d = Uv(m.axisValue, d, p)), d = Cy(d, n, !0);
					} else if (V(u)) {
						var g = Kt(function(t, r) {
							t === this._ticket && (l.setContent(r, c, e, f, o), this._updatePosition(e, o, i, a, l, n, s));
						}, this);
						this._ticket = r, d = u(n, r, g);
					} else d = u;
				}
				l.setContent(d, c, e, f, o), l.show(e, f), this._updatePosition(e, o, i, a, l, n, s);
			}
		}, t.prototype._getNearestPoint = function(e, t, n, r, i) {
			if (n === "axis" || B(t)) return { color: r || i };
			if (!B(t)) return { color: r || t.color || t.borderColor };
		}, t.prototype._updatePosition = function(e, t, n, r, i, a, o) {
			var s = this._api.getWidth(), c = this._api.getHeight();
			t ||= e.get("position");
			var l = i.getSize(), u = e.get("align"), d = e.get("verticalAlign"), f = o && o.getBoundingRect().clone();
			if (o && f.applyTransform(o.transform), V(t) && (t = t([n, r], a, i.el, f, {
				viewSize: [s, c],
				contentSize: l.slice()
			})), B(t)) n = yl(t[0], s), r = yl(t[1], c);
			else if (U(t)) {
				var p = t;
				p.width = l[0], p.height = l[1];
				var m = My(p, {
					width: s,
					height: c
				});
				n = m.x, r = m.y, u = null, d = null;
			} else if (H(t) && o) {
				var h = RI(t, f, l, e.get("borderWidth"));
				n = h[0], r = h[1];
			} else {
				var h = II(n, r, i, s, c, u ? null : 20, d ? null : 20);
				n = h[0], r = h[1];
			}
			if (u && (n -= zI(u) ? l[0] / 2 : u === "right" ? l[0] : 0), d && (r -= zI(d) ? l[1] / 2 : d === "bottom" ? l[1] : 0), uI(e)) {
				var h = LI(n, r, i, s, c);
				n = h[0], r = h[1];
			}
			i.moveTo(n, r);
		}, t.prototype._updateContentNotChangedOnAxis = function(e, t) {
			var n = this._lastDataByCoordSys, r = this._cbParamsList, i = !!n && n.length === e.length;
			return i && R(n, function(n, a) {
				var o = n.dataByAxis || [], s = (e[a] || {}).dataByAxis || [];
				i &&= o.length === s.length, i && R(o, function(e, n) {
					var a = s[n] || {}, o = e.seriesDataIndices || [], c = a.seriesDataIndices || [];
					i = i && e.value === a.value && e.axisType === a.axisType && e.axisId === a.axisId && o.length === c.length, i && R(o, function(e, t) {
						var n = c[t];
						i = i && e.seriesIndex === n.seriesIndex && e.dataIndex === n.dataIndex;
					}), r && R(e.seriesDataIndices, function(e) {
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
			!J.node && t.getDom() && ($E(this, "_updatePosition"), this._tooltipContent.dispose(), FF("itemTooltip", t), this._tooltipContent = null, this._tooltipModel = null, this._lastDataByCoordSys = null, this._cbParamsList = null);
		}, t.type = "tooltip", t;
	}(Wk);
}));
//#endregion
//#region node_modules/echarts/lib/component/tooltip/install.js
function WI(e) {
	ON(nI), e.registerComponentModel(cI), e.registerComponentView(HI), e.registerAction({
		type: "showTip",
		event: "showTip",
		update: "tooltip:manuallyShowTip"
	}, Mt), e.registerAction({
		type: "hideTip",
		event: "hideTip",
		update: "tooltip:manuallyHideTip"
	}, Mt);
}
var GI = M((() => {
	rI(), jN(), lI(), UI(), q();
})), KI, qI, JI = M((() => {
	F(), q(), jh(), Z(), qy(), Eb(), KI = function(e, t) {
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
	}, qI = function(e) {
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
			t === !0 && (t = e.selector = ["all", "inverse"]), B(t) && R(t, function(e, r) {
				H(e) && (e = { type: e }), t[r] = Qe(e, KI(n, e.type));
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
				a && Ql(r) && t.push(r.name);
			}), this._availableNames = n;
			var r = this.get("data") || t, i = K(), a = z(r, function(e) {
				return (H(e) || ft(e)) && (e = { name: e }), i.get(e.name) ? null : (i.set(e.name, !0), new Ah(e, this, this.ecModel));
			}, this);
			this._data = ot(a, function(e) {
				return !!e;
			});
		}, t.prototype.getData = function() {
			return this._data;
		}, t.prototype.select = function(e) {
			var t = this.option.selected;
			if (this.get("selectedMode") === "single") {
				var n = this._data;
				R(n, function(e) {
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
			R(e, function(e) {
				t[e.get("name", !0)] = !0;
			});
		}, t.prototype.inverseSelect = function() {
			var e = this._data, t = this.option.selected;
			R(e, function(e) {
				var n = e.get("name", !0);
				t.hasOwnProperty(n) || (t[n] = !0), t[n] = !t[n];
			});
		}, t.prototype.isSelected = function(e) {
			var t = this.option.selected;
			return !(t.hasOwnProperty(e) && !t[e]) && tt(this._availableNames, e) >= 0;
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
	}(Ky);
}));
//#endregion
//#region node_modules/echarts/lib/component/legend/LegendView.js
function YI(e, t, n, r, i, a, o) {
	function s(e, t) {
		e.lineWidth === "auto" && (e.lineWidth = t.lineWidth > 0 ? 2 : 0), tL(e, function(n, r) {
			e[r] === "inherit" && (e[r] = t[r]);
		});
	}
	var c = t.getModel("itemStyle"), l = c.getItemStyle(), u = e.lastIndexOf("empty", 0) === 0 ? "fill" : "stroke", d = c.getShallow("decal");
	l.decal = !d || d === "inherit" ? r.decal : Lj(d, o), l.fill === "inherit" && (l.fill = r[i]), l.stroke === "inherit" && (l.stroke = r[u]), l.opacity === "inherit" && (l.opacity = (i === "fill" ? r : n).opacity), s(l, r);
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
function XI(e) {
	var t = e.icon || "roundRect", n = dx(t, 0, 0, e.itemWidth, e.itemHeight, e.itemStyle.fill, e.symbolKeepAspect);
	return n.setStyle(e.itemStyle), n.rotation = (e.iconRotate || 0) * Math.PI / 180, n.setOrigin([e.itemWidth / 2, e.itemHeight / 2]), t.indexOf("empty") > -1 && (n.style.stroke = n.style.fill, n.style.fill = Q.color.neutral00, n.style.lineWidth = 2), n;
}
function ZI(e, t, n, r) {
	$I(e, t, n, r), n.dispatchAction({
		type: "legendToggleSelect",
		name: e ?? t
	}), QI(e, t, n, r);
}
function QI(e, t, n, r) {
	n.usingTHL() || n.dispatchAction({
		type: "highlight",
		seriesName: e,
		name: t,
		excludeSeriesId: r
	});
}
function $I(e, t, n, r) {
	n.usingTHL() || n.dispatchAction({
		type: "downplay",
		seriesName: e,
		name: t,
		excludeSeriesId: r
	});
}
var eL, tL, nL, rL, iL = M((() => {
	F(), q(), Da(), $m(), nf(), gh(), sI(), Uy(), Gk(), Sx(), Kj(), Fu(), Eb(), eL = ut, tL = R, nL = Of, rL = function(e) {
		P(t, e);
		function t() {
			var n = e !== null && e.apply(this, arguments) || this;
			return n.type = t.type, n.newlineDisabled = !1, n;
		}
		return t.prototype.init = function() {
			this.group.add(this._contentGroup = new nL()), this.group.add(this._selectorGroup = new nL()), this._isFirstRender = !0;
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
				var c = Ny(e, n).refContainer, l = e.getBoxLayoutParams(), u = e.get("padding"), d = My(l, c, u), f = this.layoutInner(e, i, d, r, o, s), p = My(et({
					width: f.width,
					height: f.height
				}, l), c, u);
				this.group.x = p.x - f.x, this.group.y = p.y - f.y, this.group.markRedraw(), this.group.add(this._backgroundEl = oI(f, e));
			}
		}, t.prototype.resetInner = function() {
			this.getContentGroup().removeAll(), this._backgroundEl && this.group.remove(this._backgroundEl), this.getSelectorGroup().removeAll();
		}, t.prototype.renderInner = function(e, t, n, r, i, a, o) {
			var s = this.getContentGroup(), c = K(), l = t.get("selectedMode"), u = t.get("triggerEvent"), d = [];
			n.eachRawSeries(function(e) {
				!e.get("legendHoverLink") && d.push(e.id);
			}), tL(t.getData(), function(i, a) {
				var o = this, f = i.get("name");
				if (!this.newlineDisabled && (f === "" || f === "\n")) {
					var p = new nL();
					p.newline = !0, s.add(p);
					return;
				}
				var m = n.getSeriesByName(f)[0];
				if (!c.get(f)) {
					if (m) {
						var h = m.getData(), g = h.getVisual("legendLineStyle") || {}, _ = h.getVisual("legendIcon"), v = h.getVisual("style"), y = this._createItem(m, f, a, i, t, e, g, v, _, l, r);
						y.on("click", eL(ZI, f, null, r, d)).on("mouseover", eL(QI, m.name, null, r, d)).on("mouseout", eL($I, m.name, null, r, d)), n.ssr && y.eachChild(function(e) {
							var t = Nu(e);
							t.seriesIndex = m.seriesIndex, t.dataIndex = a, t.ssrType = "legend";
						}), u && y.eachChild(function(e) {
							o.packEventData(e, t, m, a, f);
						}), c.set(f, !0);
					} else n.eachRawSeries(function(o) {
						var s = this;
						if (!c.get(f) && o.legendVisualProvider) {
							var p = o.legendVisualProvider;
							if (!p.containName(f)) return;
							var m = p.indexOfName(f), h = p.getItemVisual(m, "style"), g = p.getItemVisual(m, "legendIcon"), _ = ma(h.fill);
							_ && _[3] === 0 && (_[3] = .2, h = L(L({}, h), { fill: ba(_, "rgba") }));
							var v = this._createItem(o, f, a, i, t, e, {}, h, g, l, r);
							v.on("click", eL(ZI, null, f, r, d)).on("mouseover", eL(QI, null, f, r, d)).on("mouseout", eL($I, null, f, r, d)), n.ssr && v.eachChild(function(e) {
								var t = Nu(e);
								t.seriesIndex = o.seriesIndex, t.dataIndex = a, t.ssrType = "legend";
							}), u && v.eachChild(function(e) {
								s.packEventData(e, t, o, a, f);
							}), c.set(f, !0);
						}
					}, this);
					process.env.NODE_ENV !== "production" && (c.get(f) || console.warn(f + " series not exists. Legend data should be same with series name or data name."));
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
			Nu(e).eventData = a;
		}, t.prototype._createSelector = function(e, t, n, r, i) {
			var a = this.getSelectorGroup();
			tL(e, function(e) {
				var r = e.type, i = new Nc({
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
				a.add(i), nh(i, {
					normal: t.getModel("selectorLabel"),
					emphasis: t.getModel(["emphasis", "selectorLabel"])
				}, { defaultText: e.title }), jd(i);
			});
		}, t.prototype._createItem = function(e, t, n, r, i, a, o, s, c, l, u) {
			var d = e.visualDrawType, f = i.get("itemWidth"), p = i.get("itemHeight"), m = i.isSelected(t), h = r.get("symbolRotate"), g = r.get("symbolKeepAspect"), _ = r.get("icon");
			c = _ || c || "roundRect";
			var v = YI(c, r, o, s, d, m, u), y = new nL(), b = r.getModel("textStyle");
			if (V(e.getLegendIcon) && (!_ || _ === "inherit")) y.add(e.getLegendIcon({
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
				y.add(XI({
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
			H(w) && w ? T = w.replace("{name}", t ?? "") : V(w) && (T = w(t));
			var E = m ? b.getTextColor() : r.get("inactiveColor");
			y.add(new Nc({ style: ih(b, {
				text: T,
				x: S,
				y: p / 2,
				fill: E,
				align: C,
				verticalAlign: "middle"
			}, { inheritColor: E }) }));
			var D = new _c({
				shape: y.getBoundingRect(),
				style: { fill: "transparent" }
			}), O = r.getModel("tooltip");
			return O.get("show") && jm({
				el: D,
				componentModel: i,
				itemName: t,
				itemTooltipOption: O.option
			}), y.add(D), y.eachChild(function(e) {
				e.silent = !0;
			}), D.silent = !l, this.getContentGroup().add(y), jd(y), y.__legendDataIndex = n, y;
		}, t.prototype.layoutInner = function(e, t, n, r, i, a) {
			var o = this.getContentGroup(), s = this.getSelectorGroup();
			Vy(e.get("orient"), o, e.get("itemGap"), n.width, n.height);
			var c = o.getBoundingRect(), l = [-c.x, -c.y];
			if (s.markRedraw(), o.markRedraw(), i) {
				Vy("horizontal", s, e.get("selectorItemGap", !0));
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
	}(Wk);
}));
//#endregion
//#region node_modules/echarts/lib/component/legend/legendAction.js
function aL(e, t, n) {
	var r = e === "allSelect" || e === "inverseSelect", i = {}, a = [];
	n.eachComponent({
		mainType: "legend",
		query: t
	}, function(n) {
		r ? n[e]() : n[e](t.name), oL(n, i), a.push(n.componentIndex);
	});
	var o = {};
	return n.eachComponent("legend", function(e) {
		R(i, function(t, n) {
			e[t ? "select" : "unSelect"](n);
		}), oL(e, o);
	}), r ? {
		selected: o,
		legendIndex: a
	} : {
		name: t.name,
		selected: o
	};
}
function oL(e, t) {
	var n = t || {};
	return R(e.getData(), function(t) {
		var r = t.get("name");
		if (r !== "\n" && r !== "") {
			var i = e.isSelected(r);
			n[r] = jt(n, r) ? n[r] && i : i;
		}
	}), n;
}
function sL(e) {
	e.registerAction("legendToggleSelect", "legendselectchanged", ut(aL, "toggleSelected")), e.registerAction("legendAllSelect", "legendselectall", ut(aL, "allSelect")), e.registerAction("legendInverseSelect", "legendinverseselect", ut(aL, "inverseSelect")), e.registerAction("legendSelect", "legendselected", ut(aL, "select")), e.registerAction("legendUnSelect", "legendunselected", ut(aL, "unSelect"));
}
var cL = M((() => {
	q();
}));
//#endregion
//#region node_modules/echarts/lib/component/legend/legendFilter.js
function lL(e) {
	var t = e.findComponents({ mainType: "legend" });
	t && t.length && e.filterSeries(function(e) {
		for (var n = 0; n < t.length; n++) if (!t[n].isSelected(e.name)) return !1;
		return !0;
	});
}
var uL, dL = M((() => {
	Z(), uL = Eu(lL);
}));
//#endregion
//#region node_modules/echarts/lib/component/legend/installLegendPlain.js
function fL(e) {
	e.registerComponentModel(qI), e.registerComponentView(rL), e.registerProcessor(e.PRIORITY.PROCESSOR.SERIES_FILTER, uL), e.registerSubTypeDefaulter("legend", function() {
		return "plain";
	}), sL(e);
}
var pL = M((() => {
	JI(), iL(), cL(), dL();
}));
//#endregion
//#region node_modules/echarts/lib/component/legend/ScrollableLegendModel.js
function mL(e, t, n) {
	var r = e.getOrient(), i = [1, 1];
	i[r.index] = 0, Fy(t, n, {
		type: "box",
		ignoreSize: !!i
	});
}
var hL, gL = M((() => {
	F(), JI(), Uy(), $_(), Eb(), hL = function(e) {
		P(t, e);
		function t() {
			var n = e !== null && e.apply(this, arguments) || this;
			return n.type = t.type, n;
		}
		return t.prototype.setScrollDataIndex = function(e) {
			this.option.scrollDataIndex = e;
		}, t.prototype.init = function(t, n, r) {
			var i = Iy(t);
			e.prototype.init.call(this, t, n, r), mL(this, t, i);
		}, t.prototype.mergeOption = function(t, n) {
			e.prototype.mergeOption.call(this, t, n), mL(this, this.option, t);
		}, t.type = "legend.scroll", t.defaultOption = Z_(qI.defaultOption, {
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
	}(qI);
})), _L, vL, yL, bL, xL = M((() => {
	F(), q(), $m(), Uy(), iL(), _L = Of, vL = ["width", "height"], yL = ["x", "y"], bL = function(e) {
		P(t, e);
		function t() {
			var n = e !== null && e.apply(this, arguments) || this;
			return n.type = t.type, n.newlineDisabled = !0, n._currentIndex = 0, n;
		}
		return t.prototype.init = function() {
			e.prototype.init.call(this), this.group.add(this._containerGroup = new _L()), this._containerGroup.add(this.getContentGroup()), this.group.add(this._controllerGroup = new _L());
		}, t.prototype.resetInner = function() {
			e.prototype.resetInner.call(this), this._controllerGroup.removeAll(), this._containerGroup.removeClipPath(), this._containerGroup.__rectSize = null;
		}, t.prototype.renderInner = function(t, n, r, i, a, o, s) {
			var c = this;
			e.prototype.renderInner.call(this, t, n, r, i, a, o, s);
			var l = this._controllerGroup, u = n.get("pageIconSize", !0), d = B(u) ? u : [u, u];
			p("pagePrev", 0);
			var f = n.getModel("pageTextStyle");
			l.add(new Nc({
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
				var r = e + "DataIndex", a = wm(n.get("pageIcons", !0)[n.getOrient().name][t], { onclick: Kt(c._pageGo, c, r, n, i) }, {
					x: -d[0] / 2,
					y: -d[1] / 2,
					width: d[0],
					height: d[1]
				});
				a.name = e, l.add(a);
			}
		}, t.prototype.layoutInner = function(e, t, n, r, i, a) {
			var o = this.getSelectorGroup(), s = e.getOrient().index, c = vL[s], l = yL[s], u = vL[1 - s], d = yL[1 - s];
			i && Vy("horizontal", o, e.get("selectorItemGap", !0));
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
			Vy(e.get("orient"), c, e.get("itemGap"), r ? n.width : null, r ? null : n.height), Vy("horizontal", u, e.get("pageButtonItemGap", !0));
			var d = c.getBoundingRect(), f = u.getBoundingRect(), p = this._showController = d[i] > n[i], m = [-d.x, -d.y];
			t || (m[r] = c[s]);
			var h = [0, 0], g = [-f.x, -f.y], _ = W(e.get("pageButtonGap", !0), e.get("itemGap", !0));
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
				y[i] = Math.max(n[i] - f[i] - _, 0), y[a] = v[a], l.setClipPath(new _c({ shape: y })), l.__rectSize = y[i];
			} else u.eachChild(function(e) {
				e.attr({
					invisible: !0,
					silent: !0
				});
			});
			var b = this._getPageInfo(e);
			return b.pageIndex != null && Xp(c, {
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
			R(["pagePrev", "pageNext"], function(r) {
				var i = t[r + "DataIndex"] != null, a = n.childOfName(r);
				a && (a.setStyle("fill", i ? e.get("pageIconColor", !0) : e.get("pageIconInactiveColor", !0)), a.cursor = i ? "pointer" : "default");
			});
			var r = n.childOfName("pageText"), i = e.get("pageFormatter"), a = t.pageIndex, o = a == null ? 0 : a + 1, s = t.pageCount;
			r && i && r.setStyle("text", H(i) ? i.replace("{current}", o == null ? "" : o + "").replace("{total}", s == null ? "" : s + "") : i({
				current: o,
				total: s
			}));
		}, t.prototype._getPageInfo = function(e) {
			var t = e.get("scrollDataIndex", !0), n = this.getContentGroup(), r = this._containerGroup.__rectSize, i = e.getOrient().index, a = vL[i], o = yL[i], s = this._findTargetItemIndex(t), c = n.children(), l = c[s], u = c.length, d = +!!u, f = {
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
	}(rL);
}));
//#endregion
//#region node_modules/echarts/lib/component/legend/scrollableLegendAction.js
function SL(e) {
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
var CL = M((() => {}));
//#endregion
//#region node_modules/echarts/lib/component/legend/installLegendScroll.js
function wL(e) {
	ON(fL), e.registerComponentModel(hL), e.registerComponentView(bL), SL(e);
}
var TL = M((() => {
	jN(), pL(), gL(), xL(), CL();
}));
//#endregion
//#region node_modules/echarts/lib/component/legend/install.js
function EL(e) {
	ON(fL), ON(wL);
}
var DL = M((() => {
	jN(), pL(), TL();
})), OL = M((() => {
	QP(), aI(), F(), jN(), RP(), uF(), $m(), xF(), SE(), rI(), qy(), GN(), q(), NN(), Z(), yT(), Ur(), Sl(), YC(), Uy(), sP(), GE(), lT(), gh(), jh(), Fu(), Gk(), V_(), mT(), Lg(), Kx(), eC(), HN(), Eb(), $_(), oC(), $N(), Or(), wi(), Ju(), ir(), kf(), sc(), Mf(), vc(), Ff(), _p(), up(), pp(), Df(), jp(), Np(), nc(), Da(), Ps(), Pl(), S_(), v_(), lx(), Wh(), Jb(), Sx(), j_(), Wu(), no(), xD(), DN(), nf(), Kj(), zo(), HP(), BT(), rD(), vn(), Fh(), ky(), Av(), or(), OS(), nC(), mc(), SS(), eo(), im(), Yw(), sI(), Lc(), en(), DE(), WO(), GI(), rb(), Lx(), DL(), TL(), pL(), $y(), Cb();
})), kL = M((() => {
	OL();
})), AL = M((() => {
	rD(), jN(), Ye(), q(), F(), Or(), ir(), Ps(), en(), jh(), yT(), Ij();
})), jL = M((() => {
	DN(), AL();
})), ML = M((() => {
	jL();
}));
//#endregion
//#region node_modules/zrender/lib/canvas/Layer.js
function NL(e, t, n) {
	var r = Je.createCanvas(), i = t.getWidth(), a = t.getHeight(), o = r.style;
	return o && (o.position = "absolute", o.left = "0", o.top = "0", o.width = i + "px", o.height = a + "px", r.setAttribute("data-zr-dom-id", e)), r.width = i * n, r.height = a * n, r;
}
function PL(e) {
	return !e.__cursors.get(0);
}
function FL(e) {
	var t = e.__cursors.get(0);
	return {
		startIdx: t ? t.startIdx : 0,
		endIdx: t ? t.endIdx : 0
	};
}
var IL, LL = M((() => {
	F(), q(), lo(), Wp(), no(), ij(), Ij(), Or(), uo(), Ye(), IL = function(e) {
		P(t, e);
		function t(t, n, r) {
			var i = e.call(this) || this;
			i.motionBlur = !1, i.lastFrameAlpha = .7, i.dpr = 1, i.virtual = !1, i.config = {}, i.zlevel = 0, i.zlevel2 = 0, i.maxRepaintRectCount = 5, i.__dirty = !0, i.__firstTimePaint = !0, i.__prevIdx = {
				startIdx: 0,
				endIdx: 0
			};
			var a;
			r ||= io, typeof t == "string" ? a = NL(t, n, r) : U(t) && (a = t, t = a.id), i.id = t, i.dom = a;
			var o = a.style;
			return o && (At(a), a.onselectstart = function() {
				return !1;
			}, o.padding = "0", o.margin = "0", o.borderWidth = "0"), i.painter = n, i.dpr = r, i;
		}
		return t.prototype.afterBrush = function() {
			this.__prevIdx = FL(this);
		}, t.prototype.initContext = function() {
			this.ctx = this.dom.getContext("2d"), this.ctx.dpr = this.dpr;
		}, t.prototype.setUnpainted = function() {
			this.__firstTimePaint = !0;
		}, t.prototype.createBackBuffer = function() {
			var e = this.dpr;
			this.domBack = NL("back-" + this.id, this.painter, e), this.ctxBack = this.domBack.getContext("2d"), e !== 1 && this.ctxBack.scale(e, e);
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
			for (var l = FL(this), u = l.startIdx; u < l.endIdx; ++u) {
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
					gt(t) ? (o = (t.global || t.__width === r && t.__height === a) && t.__canvasGradient || ej(i, t, {
						x: 0,
						y: 0,
						width: r,
						height: a
					}), t.__canvasGradient = o, t.__width = r, t.__height = a) : _t(t) && (t.scaleX = t.scaleX || l, t.scaleY = t.scaleY || l, o = pj(i, t, { dirty: function() {
						u.setUnpainted(), u.painter.refresh();
					} })), i.save(), i.fillStyle = o || t, i.fillRect(e, n, r, a), i.restore();
				}
				s && (i.save(), i.globalAlpha = c, i.drawImage(d, e, n, r, a), i.restore());
			}
			!n || s ? f(0, 0, a, o) : n.length && R(n, function(e) {
				f(e.x * l, e.y * l, e.width * l, e.height * l);
			});
		}, t;
	}(to);
}));
//#endregion
//#region node_modules/zrender/lib/canvas/Painter.js
function RL(e) {
	return e ? e.__builtin__ ? !0 : typeof e.resize == "function" && typeof e.refresh == "function" : !1;
}
function zL(e, t) {
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
function BL(e, t, n, r) {
	var i = new IL(e, t, t.dpr);
	return i.zlevel = n, i.zlevel2 = r, i.__builtin__ = !0, VL(i), i;
}
function VL(e) {
	e.__cursorStack = [], e.__cursors = K();
}
function HL(e) {
	return e.startIdx = e.drawIdx = e.endIdx = e.endIdxNew = 0, e.used = !1, e.first = e.last = NaN, e.notClearIdx = -1, e;
}
function UL(e, t) {
	var n = e.__cursors, r = +t;
	return n.get(r) || (e.__cursorStack.push(r), n.set(r, HL({ key: r })));
}
function WL(e, t) {
	for (var n = e.__cursorStack, r = 0; r < n.length; r++) t(e.__cursors.get(n[r]));
}
function GL(e, t) {
	var n = e.layers;
	return n[t] || (n[t] = [
		,
		,
		,
	]);
}
function KL(e, t, n) {
	for (var r = e.layerStack, i = 0; i < r.length; i++) {
		var a = r[i].zl, o = r[i].zl2, s = e.layers[a][o];
		(!n || (!(n & QL) || s.__builtin__) && (!(n & $L) || !s.__builtin__) && (!(n & eR) || s !== e.hoverlayer)) && t(s, a, o, i);
	}
}
var qL, JL, YL, XL, ZL, QL, $L, eR, tR, nR, rR = M((() => {
	lo(), q(), LL(), nO(), en(), Wp(), Ij(), uo(), ij(), Ye(), qL = 1e5, JL = 314159, YL = void 0, XL = 1, ZL = 2, QL = 1, $L = 2, eR = 4, tR = QL | eR, nR = function() {
		function e(e, t, n, r) {
			this.type = "canvas", this._prevDisplayList = [], this._layerConfig = {}, this._needsManuallyCompositing = !1, this.type = "canvas", this._i = {
				layerStack: [],
				layers: []
			};
			var i = !e.nodeName || e.nodeName.toUpperCase() === "CANVAS";
			if (this._opts = n = L({}, n || {}), this.dpr = n.devicePixelRatio || io, this._singleCanvas = i, this.root = e, e.style && (At(e), e.innerHTML = ""), this.storage = t, this._prevDisplayList = [], i) {
				var a = e, o = a.width, s = a.height;
				n.width != null && (o = n.width), n.height != null && (s = n.height), this.dpr = n.devicePixelRatio || 1, a.width = o * this.dpr, a.height = s * this.dpr, this._width = o, this._height = s;
				var c = BL(a, this, JL, 0);
				c.initContext(), this._insertLayer(c, JL, 0, !0), this._domRoot = e;
			} else {
				this._width = rj(e, 0, n), this._height = rj(e, 1, n);
				var l = this._domRoot = zL(this._width, this._height);
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
			var t = e && !U(e) ? { paintAll: !!e } : e || {}, n = W(t.refresh, !0), r = W(t.refreshHover, !1);
			if (r && (this._hoverLayerDirty = ZL), !n) return r && this._paintHoverList(this.storage.getDisplayList(!1)), this;
			var i = this.storage.getDisplayList(!0);
			this._updateLayerStatus(i, t.paintAll), this._redrawId = Math.random();
			var a = this._prevDisplayList;
			this._paintList(i, a, this._redrawId);
			var o = this._backgroundColor;
			return KL(this._i, function(e, t, n, r) {
				e.refresh && e.refresh(r === 0 ? o : null);
			}, $L), this._opts.useDirtyRect && (this._prevDisplayList = i.slice()), this;
		}, e.prototype._paintHoverList = function(e) {
			var t = this._i.hoverlayer, n = this._hoverLayerDirty;
			if (this._hoverLayerDirty = YL, n !== YL && (!t && n === ZL && (t = this._i.hoverlayer = this._ensureLayer(qL)), t)) {
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
						c && (l = s.style, s.style = c), Ej(i, s, r), c && (s.style = l);
					}
				}
				i && (Dj(i, r), i.restore());
			}
		}, e.prototype.getHoverLayer = function() {
			return this._ensureLayer(qL);
		}, e.prototype.paintOne = function(e, t) {
			Tj(e, t);
		}, e.prototype._paintList = function(e, t, n) {
			if (this._redrawId === n) {
				var r = this._doPaintList(e, t);
				if (this._needsManuallyCompositing && this._compositeManually(), r) KL(this._i, function(e) {
					e.afterBrush && e.afterBrush();
				}, tR), this._paintHoverList(e);
				else {
					var i = this;
					tO(function() {
						i._paintList(e, t, n);
					});
				}
			}
		}, e.prototype._compositeManually = function() {
			var e = this._ensureLayer(JL).ctx, t = this._domRoot.width, n = this._domRoot.height;
			e.clearRect(0, 0, t, n), KL(this._i, function(r) {
				r.virtual && e.drawImage(r.dom, 0, 0, t, n);
			}, QL);
		}, e.prototype._doPaintList = function(e, t) {
			var n = this, r = !0;
			return KL(this._i, function(i) {
				var a = !1;
				if (WL(i, function(e) {
					(e.drawIdx < e.endIdx || e.notClearIdx >= 0) && (a = !0);
				}), a || i.__dirty) {
					var o = n._opts.useDirtyRect && !PL(i) ? i.createRepaintRects(e, t, n._width, n._height) : null, s = n._i.layerStack[0], c = !0;
					if (i.__dirty) {
						c = !1, i.__dirty = !1;
						var l = i.zlevel === s.zl && i.zlevel2 === s.zl2 ? n._backgroundColor : null;
						i.clear(!1, l, o);
					}
					WL(i, function(t) {
						var a = n._paintPerCursor(i, t, e, o, c);
						r &&= a;
					});
				}
			}, tR), J.wxa && KL(this._i, function(e) {
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
			}, o = e.ctx, s = PL(e), c = s && Je.getTime(), l = t.drawIdx, u = t.notClearIdx, d = u >= 0 ? Math.min(u, l) : l; d < t.endIdx; d++) {
				var f = n[d];
				if (!(d < l && !f.notClear)) {
					if (f.__inHover && (this._hoverLayerDirty = ZL), r != null) {
						var p = f.getPaintRect();
						p && p.intersect(r) && (Ej(o, f, a), f.setPrevPaintRect(p));
					} else Ej(o, f, a);
					if (s && Je.getTime() - c > 15) {
						d++;
						break;
					}
				}
			}
			Dj(o, a), t.drawIdx = Math.max(d, l);
		}, e.prototype.getLayer = function(e, t) {
			return this._ensureLayer(e, 0, t);
		}, e.prototype._ensureLayer = function(e, t, n) {
			t ||= 0;
			var r = this._singleCanvas;
			r && !this._needsManuallyCompositing && (e = JL, t = 0);
			var i = GL(this._i, e)[t];
			return i || (i = BL("zr_" + e + "." + t, this, e, t), this._layerConfig[e] && Qe(i, this._layerConfig[e], !0), (n || r && e !== JL) && (i.virtual = !0), this._insertLayer(i, e, t, !1), i.initContext()), i;
		}, e.prototype.insertLayer = function(e, t) {
			this._insertLayer(t, e, 0, !1);
		}, e.prototype._insertLayer = function(e, t, n, r) {
			var i = this._i, a = i.layers, o = i.layerStack, s = this._domRoot, c = null;
			if (a[t] && a[t][n]) {
				process.env.NODE_ENV !== "production" && Ze("ZLevel " + t + "." + n + " has been used already");
				return;
			}
			if (!RL(e)) {
				process.env.NODE_ENV !== "production" && Ze("Layer of zlevel " + t + " is not valid");
				return;
			}
			for (var l = o.length, u = 0; u < l && (o[u].zl < t || o[u].zl === t && o[u].zl2 < n);) u++;
			if (u > 0 && (c = GL(i, o[u - 1].zl)[o[u - 1].zl2]), o.splice(u, 0, {
				zl: t,
				zl2: n
			}), GL(i, t)[n] = e, !r && !e.virtual) {
				if (c) {
					var d = c.dom;
					d.nextSibling ? s.insertBefore(e.dom, d.nextSibling) : s.appendChild(e.dom);
				} else s.firstChild ? s.insertBefore(e.dom, s.firstChild) : s.appendChild(e.dom);
			}
			e.painter ||= this;
		}, e.prototype.eachLayer = function(e, t) {
			return KL(this._i, function(n, r) {
				e.call(t, n, r);
			});
		}, e.prototype.eachBuiltinLayer = function(e, t) {
			return KL(this._i, function(n, r) {
				e.call(t, n, r);
			}, QL);
		}, e.prototype.eachOtherLayer = function(e, t) {
			return KL(this._i, function(n, r) {
				e.call(t, n, r);
			}, $L);
		}, e.prototype.getLayers = function() {
			var e = {};
			return KL(this._i, function(t, n, r) {
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
			KL(n._i, function(e) {
				e.__dirty = !1, WL(e, function(e) {
					e.used = !1, e.endIdxNew = 0, e.notClearIdx = -1;
				});
			}, tR);
			for (var a, o = null, s = null, c = !1, l = 0, u = e.length; l < u; l++) {
				var i = e[l], d = i.zlevel, f = i.incremental, p = void 0;
				if (a !== d && (a = d, c = !1), f ? (c = !0, p = 1) : p = c ? 2 : 0, (!o || d !== o.zlevel || p !== o.zlevel2) && (o = n._ensureLayer(d, p), s = null, !o.__builtin__)) {
					Ze("ZLevel " + d + " has been used by unknown layer " + o.id);
					continue;
				}
				if ((!s || f !== s.key) && (s = UL(o, f), !s.used)) {
					if (s.used = !0, !t && s.first === i.id) {
						var m = l - s.startIdx;
						s.startIdx = l, s.drawIdx += m, s.endIdx += m;
					} else o.__dirty = !0, s.first = i.id, s.startIdx = s.drawIdx = l, s.endIdx = l + 1;
				}
				s.endIdxNew = l + 1, i.__dirty & 1 && !i.__inHover && ((!f || !i.notClear && l < s.drawIdx) && (o.__dirty = !0), f && i.notClear && s.notClearIdx < 0 && (s.notClearIdx = l));
			}
			KL(n._i, function(t) {
				for (var r = t.__cursorStack, i = t.__cursors, a = r.length - 1; a >= 0; a--) {
					var o = i.get(r[a]);
					if (!o.used) t.__dirty = !0, i.removeKey(r[a]), r.splice(a, 1);
					else {
						var s = o.endIdxNew;
						(PL(t) ? s < o.drawIdx : s !== o.endIdx || !s || e[s - 1].id !== o.last) && (t.__dirty = !0), o.endIdx = o.endIdxNew, o.last = s ? e[s - 1].id : NaN;
					}
				}
				t.__dirty && (WL(t, function(e) {
					e.drawIdx = e.startIdx;
				}), n._hoverLayerDirty === YL && (n._hoverLayerDirty = XL));
			}, tR);
		}, e.prototype.clear = function() {
			return KL(this._i, function(e) {
				e.clear(), VL(e);
			}, QL), this;
		}, e.prototype.setBackgroundColor = function(e) {
			this._backgroundColor = e, KL(this._i, function(e) {
				e.setUnpainted();
			});
		}, e.prototype.configLayer = function(e, t) {
			if (t) {
				var n = this._layerConfig;
				n[e] ? Qe(n[e], t, !0) : n[e] = t, KL(this._i, function(e, t) {
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
				e != null && (r.width = e), t != null && (r.height = t), e = rj(i, 0, r), t = rj(i, 1, r), n.style.display = "", (this._width !== e || t !== this._height) && (n.style.width = e + "px", n.style.height = t + "px", KL(this._i, function(n) {
					n.resize(e, t);
				}), this.refresh({ paintAll: !0 })), this._width = e, this._height = t;
			} else {
				if (e == null || t == null) return;
				this._width = e, this._height = t, this._ensureLayer(JL).resize(e, t);
			}
			return this;
		}, e.prototype.clearLayer = function(e) {
			R(this._i.layers[e], function(e) {
				e && !e.__builtin__ && e.clear();
			});
		}, e.prototype.dispose = function() {
			this.root.innerHTML = "", this.root = this.storage = this._domRoot = this._i = null;
		}, e.prototype.getRenderedCanvas = function(e) {
			if (e ||= {}, this._singleCanvas && !this._compositeManually) return this._i.layers[JL][0].dom;
			var t = new IL("image", this, e.pixelRatio || this.dpr);
			t.initContext(), t.clear(!1, e.backgroundColor || this._backgroundColor);
			var n = t.ctx;
			if (e.pixelRatio <= this.dpr) {
				this.refresh();
				var r = t.dom.width, i = t.dom.height;
				KL(this._i, function(e) {
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
					Ej(n, l, a);
				}
				Dj(n, a);
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
function iR(e) {
	e.registerPainter("canvas", nR);
}
var aR = M((() => {
	rR();
})), oR = M((() => {
	Aa(), $s(), sc(), Ur(), nc(), sj(), q(), hv(), Mn(), wi(), bs(), Dp(), ta(), Lc(), Ye(), Da(), FO(), aR();
})), sR = M((() => {
	oR();
})), cR, lR = M((() => {
	eF(), kL(), ML(), sR(), cR = /*@__PURE__*/ d({
		__name: "Chart",
		props: {
			series: {},
			format: { type: Function },
			capacity: {}
		},
		setup(e) {
			ON([
				bw,
				iI,
				WI,
				EL,
				iR
			]);
			let t = e, n = g(null), r = oe(), i;
			function a() {
				if (!i) return;
				let e = r.value.textColor3;
				i.setOption({
					animation: !1,
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
				n.value && (i = eM(n.value), a(), window.addEventListener("resize", o));
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
})), uR = M((() => {})), dR, fR = M((() => {
	lR(), lR(), uR(), Ee(), dR = /*#__PURE__*/ Te(cR, [["__scopeId", "data-v-ac80903c"]]);
})), pR, mR, hR = M((() => {
	ye(), fR(), pR = { "data-test": "monitoring-metrics" }, mR = /*@__PURE__*/ d({
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
					r.value = await N(t.cluster, e, t.object.metadata.namespace, t.object.metadata.name, n.value), o.value = null;
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
			}, { immediate: !0 }), p(() => clearInterval(c)), (e, t) => (h(), s("div", pR, [u(y(te), {
				value: n.value,
				"onUpdate:value": t[0] ||= (e) => n.value = e,
				size: "small",
				class: "range"
			}, {
				default: x(() => [(h(!0), s(i, null, _(y(ue), (e) => (h(), a(y(ee), {
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
				default: x(() => [u(dR, {
					series: r.value.cpu,
					format: y(ve),
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
				default: x(() => [u(dR, {
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
})), gR = M((() => {})), _R = /* @__PURE__ */ ce({ default: () => vR }), vR, yR = M((() => {
	hR(), hR(), gR(), Ee(), vR = /*#__PURE__*/ Te(mR, [["__scopeId", "data-v-543ca935"]]);
})), bR, xR, SR, CR, wR = M((() => {
	ye(), bR = { "data-test": "monitoring-cluster-card" }, xR = { key: 0 }, SR = { class: "muted" }, CR = /*@__PURE__*/ d({
		__name: "ClusterCard",
		props: { cluster: {} },
		setup(e) {
			let t = e, n = g(null), r = g(null);
			m(async () => {
				try {
					n.value = await pe(t.cluster);
				} catch (e) {
					r.value = e instanceof Error ? e.message : String(e);
				}
			});
			let o = (e, t) => t > 0 ? Math.round(e / t * 100) : 0;
			return (e, t) => (h(), s("div", bR, [r.value ? (h(), s("span", xR, v(r.value), 1)) : n.value ? (h(), s(i, { key: 2 }, [
				c("div", null, "CPU " + v(y(ve)(n.value.cpuUsed)) + " of " + v(y(ve)(n.value.cpuCapacity)), 1),
				u(y(j), {
					type: "line",
					percentage: o(n.value.cpuUsed, n.value.cpuCapacity)
				}, null, 8, ["percentage"]),
				c("div", null, "Memory " + v(y(le)(n.value.memoryUsed)) + " of " + v(y(le)(n.value.memoryCapacity)), 1),
				u(y(j), {
					type: "line",
					percentage: o(n.value.memoryUsed, n.value.memoryCapacity)
				}, null, 8, ["percentage"]),
				c("div", SR, v(n.value.targetsUp) + " scrape targets up, " + v(n.value.targetsDown) + " down ", 1)
			], 64)) : (h(), a(y(re), {
				key: 1,
				size: "small"
			}))]));
		}
	});
})), TR = M((() => {})), ER = /* @__PURE__ */ ce({ default: () => DR }), DR, OR = M((() => {
	wR(), wR(), TR(), Ee(), DR = /*#__PURE__*/ Te(CR, [["__scopeId", "data-v-d967538f"]]);
})), kR, AR, jR, MR, NR = M((() => {
	ye(), kR = { "data-test": "monitoring-project-card" }, AR = { key: 0 }, jR = { class: "muted" }, MR = /*@__PURE__*/ d({
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
					let [i, a] = await Promise.all([fetch(`/api/clusters/${encodeURIComponent(t.cluster)}/k8s/api/v1/namespaces/${encodeURIComponent(e)}/resourcequotas/capybara-project-quota`).then((e) => e.ok ? e.json() : { status: void 0 }), ge(t.cluster, e)]);
					n.value = i.status ?? {}, r.value = a;
				} catch (e) {
					o.value = e instanceof Error ? e.message : String(e);
				}
			});
			let f = (e, t) => t > 0 ? Math.min(100, Math.round(e / t * 100)) : 0;
			return (e, t) => (h(), s("div", kR, [o.value ? (h(), s("span", AR, v(o.value), 1)) : !r.value || !n.value ? (h(), a(y(re), {
				key: 1,
				size: "small"
			})) : (h(), s(i, { key: 2 }, [
				c("div", null, "CPU in use " + v(y(ve)(r.value.cpu)) + " · limit " + v(n.value.hard?.["limits.cpu"] ?? "—"), 1),
				u(y(j), {
					type: "line",
					percentage: f(r.value.cpu, l(n.value.hard?.["limits.cpu"]))
				}, null, 8, ["percentage"]),
				c("div", null, "Memory in use " + v(y(le)(r.value.memory)) + " · limit " + v(n.value.hard?.["limits.memory"] ?? "—"), 1),
				u(y(j), {
					type: "line",
					percentage: f(r.value.memory, d(n.value.hard?.["limits.memory"]))
				}, null, 8, ["percentage"]),
				c("div", jR, v(r.value.pods) + " pod(s) running of " + v(n.value.hard?.pods ?? "—") + " allowed ", 1)
			], 64))]));
		}
	});
})), PR = M((() => {})), FR = /* @__PURE__ */ ce({ default: () => IR }), IR, LR = M((() => {
	NR(), NR(), PR(), Ee(), IR = /*#__PURE__*/ Te(MR, [["__scopeId", "data-v-b0d2df3d"]]);
})), RR, zR = M((() => {
	ye(), RR = /*@__PURE__*/ d({
		__name: "SettingsPage",
		props: { cluster: {} },
		setup(e) {
			let t = e, n = g(null), r = g(null);
			return m(async () => {
				try {
					n.value = await me(t.cluster);
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
})), BR = M((() => {})), VR = /* @__PURE__ */ ce({ default: () => HR }), HR, UR = M((() => {
	zR(), zR(), BR(), Ee(), HR = /*#__PURE__*/ Te(RR, [["__scopeId", "data-v-bc9f3634"]]);
})), WR = t({
	name: "monitoring",
	apiVersion: e,
	register(e) {
		e.register({
			type: "nav-section",
			id: "monitoring.section",
			label: "Monitoring",
			order: 50
		}), e.register({
			type: "route",
			id: "monitoring.overview",
			path: "monitoring",
			scope: "cluster",
			title: "Monitoring",
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
			component: () => Promise.resolve().then(() => (yR(), _R))
		}), e.register({
			type: "cluster-overview-card",
			id: "monitoring.card.cluster",
			title: "Resource usage",
			order: 40,
			component: () => Promise.resolve().then(() => (OR(), ER))
		}), e.register({
			type: "project-overview-card",
			id: "monitoring.card.project",
			title: "Quota vs usage",
			order: 10,
			component: () => Promise.resolve().then(() => (LR(), FR))
		}), e.register({
			type: "settings-page",
			id: "monitoring.settings",
			label: "Monitoring",
			order: 10,
			component: () => Promise.resolve().then(() => (UR(), VR))
		});
	}
});
//#endregion
export { WR as default };
