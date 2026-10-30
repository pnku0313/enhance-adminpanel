// src/components/common/RolePermissionsPicker.js
// Shared by AddRoles and EditRole: loads every permission, shows a searchable
// checklist, and turns API responses into field errors.
import React, { useEffect, useMemo, useState } from "react";
import { Search, Check } from "lucide-react";
import { toast } from "react-toastify";

const API = "http://127.0.0.1:8000/api";
const MAX_PAGES = 100; // safety cap so a misbehaving API can't loop forever

/** Load all pages of /permissions. */
export function usePermissions() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setFailed(false);
        const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
        const seen = new Set();
        const all = [];
        let page = 1;
        let lastPage = Infinity;

        while (page <= Math.min(lastPage, MAX_PAGES)) {
          const res = await fetch(`${API}/permissions?page=${page}`, { headers, signal: controller.signal });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          if (!Array.isArray(data.data) || data.data.length === 0) break;

          let added = 0;
          data.data.forEach((p) => {
            if (!seen.has(p.id)) {
              seen.add(p.id);
              all.push(p);
              added += 1;
            }
          });
          if (added === 0) break; // API ignored `page` and repeated itself
          if (data.meta?.last_page) lastPage = data.meta.last_page;
          page += 1;
        }
        setPermissions(all);
      } catch (err) {
        if (err?.name === "AbortError") return;
        console.error("Error fetching permissions:", err);
        setFailed(true);
        toast.error("Failed to fetch permissions ❌");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [reloadKey]);

  return { permissions, loading, failed, reload: () => setReloadKey((k) => k + 1) };
}

/** Did the API say it worked? (the two role endpoints answer slightly differently) */
export const isSuccess = (res, data) =>
  res.ok &&
  (data?.success === true ||
    data?.success === 1 ||
    data?.status === true ||
    data?.status === 1 ||
    data?.status === "success" ||
    String(data?.message || "").toLowerCase().includes("success"));

/** Turn an API error body into { name, permissions, general } messages. */
export function parseRoleErrors(data) {
  const out = {};
  if (!data) return out;
  if (data.errors && typeof data.errors === "object") {
    Object.keys(data.errors).forEach((key) => {
      const v = data.errors[key];
      const msg = Array.isArray(v) ? v[0] : v;
      if (msg) out[key] = msg;
    });
  } else if (typeof data.message === "string") {
    const lower = data.message.toLowerCase();
    if (lower.includes("name")) out.name = data.message;
    if (lower.includes("permission")) out.permissions = data.message;
    if (!out.name && !out.permissions) out.general = data.message;
  } else if (typeof data === "string") {
    out.general = data;
  }
  return out;
}

export default function PermissionPicker({ permissions, loading, failed, onRetry, selected, onChange, error }) {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? permissions.filter((p) => String(p.name).toLowerCase().includes(q)) : permissions;
  }, [permissions, query]);

  const visibleIds = visible.map((p) => p.id);
  const allVisibleSelected = visible.length > 0 && visibleIds.every((id) => selected.includes(id));

  const toggle = (id) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  const toggleAllVisible = () =>
    onChange(
      allVisibleSelected
        ? selected.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...selected, ...visibleIds]))
    );

  return (
    <div>
      <div
        className={
          "rounded-xl border bg-white/50 dark:bg-white/5 " +
          (error ? "border-rose-500/60" : "border-slate-300/80 dark:border-white/20")
        }
      >
        <div className="flex flex-col gap-3 border-b border-slate-300/60 p-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-foreground">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleAllVisible}
              disabled={visible.length === 0}
              className="h-4 w-4 accent-indigo-500"
            />
            {query ? "Select all matching" : "Select all"}
            <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300">
              {selected.length} / {permissions.length}
            </span>
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search permissions..."
              className="h-9 w-full rounded-lg border border-slate-300/80 bg-white/60 pl-9 pr-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 dark:border-white/20 dark:bg-white/5 sm:w-64"
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto p-3">
          {loading ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-9 animate-pulse rounded-lg bg-slate-300/50 dark:bg-white/10" />
              ))}
            </div>
          ) : failed ? (
            <div className="py-8 text-center">
              <p className="font-medium text-foreground">Couldn't load permissions</p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 h-9 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 px-4 text-sm font-semibold text-white"
              >
                Retry
              </button>
            </div>
          ) : visible.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {query ? `No permissions match “${query}”.` : "No permissions available."}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((p) => {
                const on = selected.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className={
                      "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors " +
                      (on
                        ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-200"
                        : "border-slate-300/60 hover:border-primary/30 hover:bg-primary/5 dark:border-white/10")
                    }
                  >
                    <input type="checkbox" checked={on} onChange={() => toggle(p.id)} className="sr-only" />
                    <span
                      className={
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border " +
                        (on ? "border-indigo-500 bg-indigo-500 text-white" : "border-slate-400/70 dark:border-white/30")
                      }
                      aria-hidden="true"
                    >
                      {on && <Check className="h-3 w-3" />}
                    </span>
                    <span className="truncate" title={p.name}>{p.name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {error && <p className="mt-1.5 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}