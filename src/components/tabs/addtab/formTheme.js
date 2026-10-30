"use client";

import React, { memo } from "react";
import { clsx } from "clsx";
import { Package, Shirt, Tag, ShoppingBag } from "lucide-react";

/* ==========================================================================
   SHARED THEME FOR THE PRODUCT FORM (same look as ProductsPage / ViewProductPage)
   Put this file next to the tabs: components/tabs/addtab/formTheme.js
   ========================================================================== */

export const primaryGradient = "from-indigo-500 via-purple-500 to-indigo-600";
export const hairline = "border-slate-300/80 dark:border-white/20";
export const glassCard = "bg-white/70 dark:bg-slate-900/60 border border-slate-300/80 dark:border-white/20";
export const glassSubtle = "bg-white/50 dark:bg-white/5 border border-slate-300/80 dark:border-white/20";
export const gradientBtn =
  "bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40";

export const inputCls =
  "h-10 w-full rounded-xl px-3 text-sm text-foreground placeholder:text-muted-foreground/60 bg-white/50 dark:bg-white/10 border border-slate-300/80 dark:border-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40 read-only:bg-slate-100/70 dark:read-only:bg-white/5 read-only:cursor-not-allowed";
export const textareaCls =
  "w-full rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 bg-white/50 dark:bg-white/10 border border-slate-300/80 dark:border-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40";
export const selectCls = inputCls + " cursor-pointer";
export const labelCls = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground";

/* ==========================================================================
   GLOBAL-WHILE-MOUNTED CSS
   - motion keyframes for the wave header
   - readable text selection
   - Select2 + Summernote skinned to match the theme (light + dark)
   This <style> lives inside the form, so it disappears when the form unmounts.
   ========================================================================== */
export const FORM_CSS = `
@keyframes pp-float { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-6px) rotate(3deg); } }
@keyframes pp-wave { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes pp-fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.pp-float { animation: pp-float 3.2s ease-in-out infinite; }
.pp-fade-up { animation: pp-fade-up 0.3s ease-out both; }
.pp-wave-1 { animation: pp-wave 26s linear infinite; will-change: transform; }
.pp-wave-2 { animation: pp-wave 18s linear infinite reverse; will-change: transform; }
.pp-wave-3 { animation: pp-wave 12s linear infinite; will-change: transform; }

/* Selected text stays readable */
.pp-view ::selection { background: rgba(99, 102, 241, 0.35) !important; color: inherit !important; }
.pp-view ::-moz-selection { background: rgba(99, 102, 241, 0.35) !important; color: inherit !important; }

/* ---------- Select2 ---------- */
.pp-form .select2-container { width: 100% !important; }
.select2-container--default .select2-selection--multiple,
.select2-container--default .select2-selection--single {
  min-height: 2.5rem; border-radius: 0.75rem; border: 1px solid rgba(203, 213, 225, 0.9);
  background: rgba(255, 255, 255, 0.5); color: inherit;
}
.select2-container--default .select2-selection--single .select2-selection__rendered { line-height: 2.5rem; padding-left: 0.75rem; color: inherit; }
.select2-container--default .select2-selection--single .select2-selection__arrow { height: 2.5rem; }
.select2-container--default .select2-selection--multiple { padding: 0 0.35rem 0.2rem; }
.select2-container--default.select2-container--focus .select2-selection--multiple,
.select2-container--default.select2-container--open .select2-selection--multiple,
.select2-container--default.select2-container--focus .select2-selection--single {
  border-color: rgba(99, 102, 241, 0.6); box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
}
.select2-container--default .select2-selection--multiple .select2-selection__choice {
  background: rgba(99, 102, 241, 0.12); border: 1px solid rgba(99, 102, 241, 0.3); color: #4338ca;
  border-radius: 9999px; padding: 0 0.6rem; margin-top: 0.4rem; font-size: 0.75rem; line-height: 1.5rem;
}
.select2-container--default .select2-selection--multiple .select2-selection__choice__remove {
  color: #6366f1; border: 0; background: transparent; margin-right: 0.35rem;
}
.select2-container--default .select2-search--inline .select2-search__field { margin-top: 0.45rem; color: inherit; }
.select2-dropdown {
  border-radius: 0.75rem; border: 1px solid rgba(203, 213, 225, 0.9); overflow: hidden;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.15);
}
.select2-container--default .select2-search--dropdown .select2-search__field { border-radius: 0.5rem; border: 1px solid rgba(203, 213, 225, 0.9); padding: 0.35rem 0.6rem; }
.select2-container--default .select2-results__option[aria-selected=true] { background: rgba(99, 102, 241, 0.1); color: inherit; }
.select2-container--default .select2-results__option--highlighted[aria-selected],
.select2-container--default .select2-results__option--highlighted.select2-results__option--selectable {
  background: rgba(99, 102, 241, 0.2); color: inherit;
}
.dark .select2-container--default .select2-selection--multiple,
.dark .select2-container--default .select2-selection--single { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.2); color: #e2e8f0; }
.dark .select2-container--default .select2-selection--multiple .select2-selection__choice { background: rgba(99, 102, 241, 0.25); border-color: rgba(129, 140, 248, 0.4); color: #c7d2fe; }
.dark .select2-container--default .select2-selection--multiple .select2-selection__choice__remove { color: #a5b4fc; }
.dark .select2-dropdown { background: #0f172a; border-color: rgba(255, 255, 255, 0.2); color: #e2e8f0; }
.dark .select2-container--default .select2-search--dropdown .select2-search__field { background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.2); color: #e2e8f0; }
.dark .select2-container--default .select2-results__option[aria-selected=true] { background: rgba(99, 102, 241, 0.3); }
.dark .select2-container--default .select2-results__option--highlighted[aria-selected],
.dark .select2-container--default .select2-results__option--highlighted.select2-results__option--selectable { background: rgba(99, 102, 241, 0.45); color: #fff; }

/* ---------- Summernote ---------- */
.pp-form .note-editor.note-frame { border: 1px solid rgba(203, 213, 225, 0.9); border-radius: 0.75rem; overflow: hidden; box-shadow: none; }
.pp-form .note-editor .note-toolbar { background: rgba(241, 245, 249, 0.8); border-bottom: 1px solid rgba(203, 213, 225, 0.9); }
.pp-form .note-editor .note-editing-area .note-editable { background: rgba(255, 255, 255, 0.6); color: #0f172a; }
.pp-form .note-editor .note-statusbar { background: rgba(241, 245, 249, 0.8); border-top: 1px solid rgba(203, 213, 225, 0.9); }
.pp-form .note-btn { border-radius: 0.5rem; }
.dark .pp-form .note-editor.note-frame { border-color: rgba(255, 255, 255, 0.2); }
.dark .pp-form .note-editor .note-toolbar,
.dark .pp-form .note-editor .note-statusbar { background: rgba(255, 255, 255, 0.06); border-color: rgba(255, 255, 255, 0.2); }
.dark .pp-form .note-editor .note-editing-area .note-editable { background: rgba(15, 23, 42, 0.6); color: #e2e8f0; }
.dark .pp-form .note-btn { background: rgba(255, 255, 255, 0.08); color: #e2e8f0; border-color: rgba(255, 255, 255, 0.2); }

@media (prefers-reduced-motion: reduce) {
  .pp-float, .pp-fade-up, .pp-wave-1, .pp-wave-2, .pp-wave-3 { animation: none !important; }
}
`;

/* ==========================================================================
   WAVE HEADER BACKGROUND (same as ProductsPage)
   ========================================================================== */
const WAVE_PATH =
  "M0 80 Q180 20 360 80 T720 80 T1080 80 T1440 80 T1800 80 T2160 80 T2520 80 T2880 80 L2880 160 L0 160 Z";

export const WaveBackground = memo(function WaveBackground() {
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
  const floaters = [
    { Icon: Package, left: "8%", delay: "0s" },
    { Icon: Shirt, left: "34%", delay: "-1.1s" },
    { Icon: Tag, left: "61%", delay: "-2.2s" },
    { Icon: ShoppingBag, left: "86%", delay: "-0.6s" },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {layer("pp-wave-1", "text-indigo-500/10 dark:text-indigo-400/10", "70%")}
      {layer("pp-wave-2", "text-purple-500/10 dark:text-purple-400/10", "52%")}
      {layer("pp-wave-3", "text-indigo-500/15 dark:text-indigo-400/15", "34%")}
      {floaters.map(({ Icon, left, delay }, i) => (
        <Icon
          key={i}
          size={20}
          strokeWidth={1.75}
          className="pp-float absolute bottom-3 text-indigo-500/40 dark:text-indigo-300/40"
          style={{ left, animationDelay: delay }}
        />
      ))}
    </div>
  );
});

/* ==========================================================================
   BUILDING BLOCKS
   NOTE: FormSection has no overflow-hidden on purpose, so Select2 dropdowns
   are never clipped by the card edge.
   ========================================================================== */
export function FormSection({ icon: Icon, title, description, children, className }) {
  return (
    <section
      className={clsx(
        "pp-fade-up rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/20",
        glassCard,
        className
      )}
    >
      <div
        className={clsx(
          "flex items-center gap-2.5 rounded-t-2xl border-b px-5 py-3.5 bg-white/40 dark:bg-white/5",
          hairline
        )}
      >
        {Icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
            <Icon size={16} className="text-primary" />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Field({ label, htmlFor, required, hint, children, className }) {
  return (
    <div className={clsx("min-w-0", className)}>
      {label && (
        <label htmlFor={htmlFor} className={labelCls}>
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ToggleSwitch({ name, label, checked, onChange }) {
  return (
    <label
      className={clsx(
        "flex cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-primary/5",
        glassSubtle
      )}
    >
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="flex items-center gap-2.5">
        <span
          className={clsx(
            "text-xs font-medium",
            checked ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
          )}
        >
          {checked ? "Yes" : "No"}
        </span>
        <input type="checkbox" className="peer sr-only" name={name} checked={checked} onChange={onChange} />
        <span className="relative h-6 w-11 rounded-full bg-slate-300 transition-colors dark:bg-white/20 peer-checked:bg-indigo-500 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform after:content-[''] peer-checked:after:translate-x-5" />
      </span>
    </label>
  );
}