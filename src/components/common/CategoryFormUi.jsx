import React from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { clsx } from "clsx";
import { Loader2 } from "lucide-react";

/* ==========================================================================
   Shared building blocks for the category Add / Edit pages.
   Put this file at: src/components/common/CategoryFormUI.jsx
   Same glass + indigo/purple theme as Products / Orders / Categories.
   No backdrop-blur (it caused scroll lag).
   ========================================================================== */
export const glassCard = "bg-white/70 dark:bg-slate-900/60 border border-white/30 dark:border-white/10";
export const glassInput = "bg-white/50 dark:bg-white/10 border border-white/30 dark:border-white/15";
export const cardShadow = "shadow-xl shadow-black/5 dark:shadow-black/20";
export const primaryGradient = "from-indigo-500 via-purple-500 to-indigo-600";

/* ---------- helpers ---------- */
// Head category style: collapses any run of symbols into one hyphen
export const slugifyStrict = (s = "") =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
// Parent / child style: drops symbols, spaces become hyphens
export const slugify = (s = "") =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

/* Loads every page of a paginated list endpoint */
export async function fetchAllPages(url, headers) {
  let all = [];
  let page = 1;
  let last = 1;
  do {
    const res = await axios.get(url, { params: { page }, headers });
    all = all.concat(res.data.data || []);
    last = res.data.meta?.last_page || 1;
    page++;
  } while (page <= last);
  return all;
}

/* Theme-aware loading dialog (the old ones hard-coded white/black backgrounds) */
export const showSwalLoading = (title, text) =>
  Swal.fire({
    title,
    text,
    allowOutsideClick: false,
    customClass: {
      popup: "bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl",
    },
    didOpen: () => Swal.showLoading(),
  });

/* ==========================================================================
   MOTION + visible text selection
   ========================================================================== */
const FORM_CSS = `
/* Selected text stays readable: tinted highlight, original text colour kept */
::selection { background: rgba(99,102,241,0.35); color: inherit; }
::-moz-selection { background: rgba(99,102,241,0.35); color: inherit; }
.dark ::selection { background: rgba(165,180,252,0.40); color: inherit; }
.pp-select option { color: #0f172a; }

@keyframes pp-wave { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes pp-float { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-6px) rotate(3deg); } }
@keyframes pp-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.pp-wave-1 { animation: pp-wave 26s linear infinite; will-change: transform; }
.pp-wave-2 { animation: pp-wave 18s linear infinite reverse; will-change: transform; }
.pp-wave-3 { animation: pp-wave 12s linear infinite; will-change: transform; }
.pp-float { animation: pp-float 3.2s ease-in-out infinite; }
.pp-rise { animation: pp-rise 0.35s ease-out backwards; }
@media (prefers-reduced-motion: reduce) {
  .pp-wave-1, .pp-wave-2, .pp-wave-3, .pp-float, .pp-rise { animation: none !important; }
}
`;

const WAVE_PATH =
  "M0 80 Q180 20 360 80 T720 80 T1080 80 T1440 80 T1800 80 T2160 80 T2520 80 T2880 80 L2880 160 L0 160 Z";

const FLOAT_POSITIONS = [
  { left: "9%", delay: "0s" },
  { left: "34%", delay: "-1.1s" },
  { left: "60%", delay: "-2.2s" },
  { left: "85%", delay: "-0.6s" },
];

const WaveBackground = ({ icons }) => {
  const layer = (cls, color, h) => (
    <svg
      className={clsx("absolute bottom-0 left-0 w-[200%]", cls, color)}
      style={{ height: h }}
      viewBox="0 0 2880 160"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={WAVE_PATH} fill="currentColor" />
    </svg>
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {layer("pp-wave-1", "text-indigo-500/10 dark:text-indigo-400/10", "70%")}
      {layer("pp-wave-2", "text-purple-500/10 dark:text-purple-400/10", "52%")}
      {layer("pp-wave-3", "text-indigo-500/15 dark:text-indigo-400/15", "34%")}
      {icons.slice(0, 4).map((Icon, i) => (
        <Icon
          key={i}
          size={20}
          strokeWidth={1.75}
          className="pp-float absolute bottom-3 text-indigo-500/40 dark:text-indigo-300/40"
          style={{ left: FLOAT_POSITIONS[i].left, animationDelay: FLOAT_POSITIONS[i].delay }}
        />
      ))}
    </div>
  );
};

/* ==========================================================================
   LAYOUT + FORM CONTROLS
   ========================================================================== */
export function FormShell({ title, subtitle, icons = [], children }) {
  return (
    <div className="w-full">
      <style>{FORM_CSS}</style>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className={clsx("rounded-2xl", glassCard, cardShadow)}>
          <div className="relative overflow-hidden rounded-t-2xl">
            <WaveBackground icons={icons} />
            <div className="relative z-10 px-6 py-6 border-b border-white/20 dark:border-white/10">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          <div className="p-6 sm:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

export const FormLoading = () => (
  <div className="py-16 text-center">
    <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
  </div>
);

export function FormField({ label, htmlFor, required, hint, error, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-rose-500">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

const controlCls = (invalid, readOnly) =>
  clsx(
    "h-10 w-full px-3 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/60",
    "focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow",
    glassInput,
    invalid && "!border-rose-400 ring-1 ring-rose-300",
    readOnly && "opacity-70 cursor-not-allowed font-mono"
  );

export const TextInput = ({ invalid, readOnly, className, ...props }) => (
  <input {...props} readOnly={readOnly} className={clsx(controlCls(invalid, readOnly), className)} />
);

export const SelectInput = ({ invalid, className, children, ...props }) => (
  <select
    {...props}
    className={clsx(controlCls(invalid), "pp-select cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed", className)}
  >
    {children}
  </select>
);

/* Wrapper that gives the rich text editor the same rounded glass border */
export const EditorFrame = ({ children }) => (
  <div className={clsx("rounded-xl p-0.5", glassInput)}>{children}</div>
);

export function FormActions({ onCancel, submitLabel, loadingLabel, loading }) {
  return (
    <div className="flex flex-wrap justify-end gap-3 pt-5 border-t border-white/20 dark:border-white/10">
      <button
        type="button"
        onClick={onCancel}
        className="h-10 rounded-lg border border-border px-5 text-sm font-medium text-foreground hover:bg-primary/5 transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading}
        className={clsx(
          "inline-flex h-10 items-center gap-2 rounded-lg px-5 text-sm font-semibold text-white transition-all duration-200",
          "bg-gradient-to-r shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40",
          "disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none",
          primaryGradient
        )}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? loadingLabel : submitLabel}
      </button>
    </div>
  );
}