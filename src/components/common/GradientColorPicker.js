"use client";

import React, { useEffect, useRef, useState } from "react";

const clamp = (n, max = 1) => Math.max(0, Math.min(max, n));
function parseHex(value) {
  let hex = String(value || "").replace(/^#/, "");
  if (/^[\da-f]{3,4}$/i.test(hex)) hex = [...hex].map(c => c + c).join("");
  if (!/^(?:[\da-f]{6}|[\da-f]{8})$/i.test(hex)) return null;
  const [r, g, b] = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d) h = (max === r ? (g - b) / d : max === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60;
  return { h: (h + 360) % 360, s: max ? d / max : 0, v: max, a: hex.length === 8 ? parseInt(hex.slice(6), 16) / 255 : 1 };
}
function rgbOf({ h, s, v }) {
  const f = n => { const k = (n + h / 60) % 6; return Math.round(255 * (v - v * s * Math.max(0, Math.min(k, 4 - k, 1)))); };
  return [f(5), f(3), f(1)];
}
function hexOf(state) {
  const byte = n => n.toString(16).padStart(2, "0");
  return "#" + rgbOf(state).map(byte).join("") + (state.a < 1 ? byte(Math.round(state.a * 255)) : "");
}
const CSS = `
.gcp{width:100%;max-width:590px;min-width:0;overflow:hidden;border:1px solid #353535;border-radius:11px;background:#111;color:#fff;color-scheme:dark;box-sizing:border-box;font-family:inherit;margin-left: auto;margin-right: auto;}
.gcp *{box-sizing:border-box}.gcp .gcp-plane{height:120px;position:relative;touch-action:none;cursor:crosshair;outline-offset:-3px}
.gcp .gcp-marker{position:absolute;width:20px;height:20px;border:2px solid white;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 2px #111;pointer-events:none}
.gcp .gcp-body{padding:14px 9px 28px}.gcp .gcp-track{height:12px;margin:6px 0 10px;border-radius:20px;position:relative}
.gcp .gcp-range{display:block!important;appearance:none!important;-webkit-appearance:none!important;width:100%!important;height:12px!important;padding:0!important;margin:0!important;background:transparent!important;border:0!important;border-radius:20px!important;box-shadow:none!important;cursor:pointer;position:relative;top:0}
.gcp .gcp-range::-webkit-slider-thumb{appearance:none;-webkit-appearance:none;width:20px;height:20px;border:2px solid #fff;border-radius:50%;background:var(--thumb);box-shadow:0 0 2px #111}
.gcp .gcp-range::-moz-range-thumb{width:16px;height:16px;border:2px solid #fff;border-radius:50%;background:var(--thumb)}
.gcp .gcp-range:focus-visible{outline:2px solid #a5b4fc;outline-offset:5px}
.gcp .gcp-values{display:grid;grid-template-columns:1fr 1fr;gap:20px 10px;margin-top:20px}
.gcp .gcp-value{display:flex;flex-direction:column;align-items:stretch;gap:5px;min-width:0}.gcp .gcp-hex{grid-column:1/-1}
.gcp .gcp-input{display:block!important;width:100%!important;min-width:0!important;height:35px!important;background:#111!important;color:#fff!important;border:2px solid #272727!important;border-radius:5px!important;padding:6px!important;text-align:center!important;font:13px Arial,sans-serif!important;box-shadow:none!important}
.gcp .gcp-input:focus{outline:2px solid #a5b4fc;outline-offset:1px}.gcp .gcp-caption{color:#94a3b8;font-size:12px;text-align:center;font-weight:400;letter-spacing:0}
`;

// Controlled picker. Opaque colors emit #RRGGBB; transparency emits #RRGGBBAA.
export default function GradientColorPicker({ color = "#3b82f6", onChange, id, label = "Color" }) {
  const [state, setState] = useState(() => parseHex(color) || parseHex("#3b82f6"));
  const current = useRef(state);
  const emitted = useRef(null);
  const [draft, setDraft] = useState(color);
  useEffect(() => {
    if (color === emitted.current) return;
    const next = parseHex(color);
    if (next) { current.current = next; setState(next); setDraft(hexOf(next)); }
  }, [color]);
  const update = patch => {
    const next = { ...current.current, ...patch };
    current.current = next;
    setState(next);
    const hex = hexOf(next);
    emitted.current = hex;
    setDraft(hex);
    onChange?.({ hex, rgb: rgbOf(next), hsv: next, alpha: next.a });
  };
  const point = event => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width && rect.height) update({ s: clamp((event.clientX - rect.left) / rect.width), v: 1 - clamp((event.clientY - rect.top) / rect.height) });
  };
  const rgb = rgbOf(state), solid = `rgb(${rgb.join(",")})`;
  return (
    <div className="gcp" role="group" aria-label={`${label} picker`}>
      <style>{CSS}</style>
      <div className="gcp-plane" role="group" tabIndex={0}
        aria-label={`${label} saturation and brightness. Use left and right arrows for saturation, up and down for brightness.`}
        style={{ background: `linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,transparent),hsl(${state.h},100%,50%)` }}
        onPointerDown={e => { if (e.button !== 0) return; e.preventDefault(); e.currentTarget.focus(); e.currentTarget.setPointerCapture(e.pointerId); point(e); }}
        onPointerMove={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) point(e); }}
        onPointerUp={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); }}
        onKeyDown={e => {
          const step = e.shiftKey ? .1 : .01;
          if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
            e.preventDefault(); update(e.key === "ArrowLeft" || e.key === "ArrowRight" ? { s: clamp(current.current.s + (e.key === "ArrowRight" ? step : -step)) } : { v: clamp(current.current.v + (e.key === "ArrowUp" ? step : -step)) });
          }
        }}>
        <span className="gcp-marker" style={{ left: `${state.s * 100}%`, top: `${(1 - state.v) * 100}%`, background: solid }} />
      </div>
      <div className="gcp-body">
        <div className="gcp-track" style={{ background: "linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)" }}>
          <input className="gcp-range" aria-label={`${label} hue`} type="range" min="0" max="360" step="1" value={state.h} onChange={e => update({ h: Number(e.target.value) })} style={{ "--thumb": `hsl(${state.h},100%,50%)` }} />
        </div>
        <div className="gcp-track" style={{ background: `linear-gradient(to right,transparent,${solid}),repeating-conic-gradient(#888 0% 25%,#444 0% 50%) 0 / 10px 10px` }}>
          <input className="gcp-range" aria-label={`${label} opacity`} aria-valuetext={`${Math.round(state.a * 100)} percent`} type="range" min="0" max="1" step="0.01" value={state.a} onChange={e => update({ a: Number(e.target.value) })} style={{ "--thumb": solid }} />
        </div>
        <div className="gcp-values">
          <label className="gcp-value gcp-hex">
            <input id={id} className="gcp-input" aria-label={`${label} hexadecimal value`} value={draft} spellCheck={false}
              onChange={e => { const value = e.target.value; setDraft(value); if (/^#?(?:[\da-f]{6}|[\da-f]{8})$/i.test(value)) update(parseHex(value)); }}
              onBlur={() => { const parsed = parseHex(draft); if (parsed) update(parsed); else setDraft(hexOf(current.current)); }}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); } }} />
            <span className="gcp-caption">HEX{state.a < 1 ? "A" : ""}</span>
          </label>
          <label className="gcp-value"><input className="gcp-input" aria-label={`${label} RGB value`} readOnly value={rgb.join(", ")} /><span className="gcp-caption">RGB</span></label>
          <label className="gcp-value"><input className="gcp-input" aria-label={`${label} HSV value`} readOnly value={`${Math.round(state.h)}°, ${Math.round(state.s * 100)}%, ${Math.round(state.v * 100)}%`} /><span className="gcp-caption">HSV</span></label>
        </div>
      </div>
    </div>
  );
}
