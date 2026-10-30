"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { clsx } from "clsx";
import {
  Search, X, Users, UserCheck, UserX, Eye, Ban, CheckCircle, Pencil, Trash2,
  ChevronLeft, ChevronRight, Loader2, ShieldCheck, Mail,
} from "lucide-react";
import PermissionGuard from "../../components/auth/PermissionGuard";

/* ==========================================================================
   THEME: same glass + indigo/purple look as the other pages.
   No backdrop-blur (it caused scroll lag). Light black lines separate data.
   ========================================================================== */
const glassCard = "bg-white/70 dark:bg-slate-900/60 border border-black/10 dark:border-white/10";
const glassInput = "bg-white/50 dark:bg-white/10 border border-black/10 dark:border-white/15";
const cardShadow = "shadow-xl shadow-black/5 dark:shadow-black/20";
const primaryGradient = "from-indigo-500 via-purple-500 to-indigo-600";

const API_BASE = "http://127.0.0.1:8000/api";
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

const chipBase = "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap";
const ACTIVE_STYLE = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/30";
const BLOCKED_STYLE = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-400/30";

const dangerBtn =
  "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40";
const swalClasses = {
  popup: "bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl",
  confirmButton: dangerBtn,
  cancelButton: "bg-muted text-muted-foreground hover:bg-muted/80",
};
const swalOk = { popup: swalClasses.popup };

/* ==========================================================================
   MOTION (CSS only) + visible text selection
   ========================================================================== */
const MOTION_CSS = `
/* Selected text stays readable: tinted highlight, original text colour kept */
::selection { background: rgba(99,102,241,0.35); color: inherit; }
::-moz-selection { background: rgba(99,102,241,0.35); color: inherit; }
.dark ::selection { background: rgba(165,180,252,0.40); color: inherit; }

@keyframes pp-wave { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes pp-float { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-6px) rotate(3deg); } }
@keyframes pp-row-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes pp-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.pp-wave-1 { animation: pp-wave 26s linear infinite; will-change: transform; }
.pp-wave-2 { animation: pp-wave 18s linear infinite reverse; will-change: transform; }
.pp-wave-3 { animation: pp-wave 12s linear infinite; will-change: transform; }
.pp-float { animation: pp-float 3.2s ease-in-out infinite; }
/* "backwards" (not "both") so finished rows don't keep a stacking context */
.pp-row-in { animation: pp-row-in 0.28s ease-out backwards; }
.pp-rise { animation: pp-rise 0.4s ease-out backwards; }
@media (prefers-reduced-motion: reduce) {
  .pp-wave-1, .pp-wave-2, .pp-wave-3, .pp-float, .pp-row-in, .pp-rise { animation: none !important; }
}
`;

const WAVE_PATH =
  "M0 80 Q180 20 360 80 T720 80 T1080 80 T1440 80 T1800 80 T2160 80 T2520 80 T2880 80 L2880 160 L0 160 Z";

/* Waves with customer-themed icons: users, verified, shield, mail */
const WaveBackground = () => {
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
    { Icon: Users, left: "9%", delay: "0s" },
    { Icon: UserCheck, left: "34%", delay: "-1.1s" },
    { Icon: ShieldCheck, left: "60%", delay: "-2.2s" },
    { Icon: Mail, left: "85%", delay: "-0.6s" },
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
};

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const pageWindow = (page, total) => {
  const nums = [...new Set([1, total, page - 1, page, page + 1])]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push(`gap-${n}`);
    out.push(n);
  });
  return out;
};

/* Avatar: the image if it loads, otherwise initials */
const Avatar = ({ src, name, size = 32 }) => {
  const [failed, setFailed] = useState(false);
  const initials = (name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const dim = { width: size, height: size };
  return src && !failed ? (
    <img
      src={src}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
      style={dim}
      className="shrink-0 rounded-full border border-border object-cover"
    />
  ) : (
    <div
      style={{ ...dim, fontSize: size * 0.38 }}
      className={clsx("flex shrink-0 items-center justify-center rounded-full font-semibold text-white bg-gradient-to-br", primaryGradient)}
    >
      {initials}
    </div>
  );
};

const StatTile = ({ label, value, caption, icon: Icon, delay }) => (
  <div style={{ animationDelay: `${delay}ms` }} className={clsx("pp-rise rounded-2xl p-5", glassCard, cardShadow)}>
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
        <Icon size={15} className="text-primary" />
      </div>
    </div>
    <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums text-foreground">{Number(value).toLocaleString("en-IN")}</p>
    {caption && <p className="mt-0.5 text-xs text-muted-foreground">{caption}</p>}
  </div>
);

/* ==========================================================================
   PAGE
   ========================================================================== */
const CustomersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const queryParams = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(queryParams.get("page"), 10) || 1;
  const perPageFromUrl = parseInt(queryParams.get("per_page"), 10);
  const initialPerPage = PAGE_SIZE_OPTIONS.includes(perPageFromUrl) ? perPageFromUrl : DEFAULT_PAGE_SIZE;

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [page, setPage] = useState(pageFromUrl);
  const [entriesPerPage, setEntriesPerPage] = useState(initialPerPage);
  const sortDir = "desc";
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [detailedCustomer, setDetailedCustomer] = useState(null);

  const reqId = useRef(0); // ignore out-of-date responses

  // Keep ?page= and ?per_page= in the URL (so Edit -> Back returns here)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("page") === String(page) && params.get("per_page") === String(entriesPerPage)) return;
    params.set("page", page);
    params.set("per_page", entriesPerPage);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, entriesPerPage]);

  const fetchCustomers = async () => {
    const myReq = ++reqId.current;
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page,
        perPage: entriesPerPage,
        search: debouncedSearch,
        sortDir,
      }).toString();

      const res = await fetch(`${API_BASE}/customers?${query}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        cache: "no-store",
      });
      const data = await res.json();
      if (myReq !== reqId.current) return;

      if (data.success) {
        setCustomers(data.data);
        setMeta(data.meta);
      } else {
        setCustomers([]);
        setMeta(null);
      }
    } catch (err) {
      if (myReq !== reqId.current) return;
      console.error("Error fetching customers:", err);
    } finally {
      if (myReq === reqId.current) setLoading(false);
    }
  };

  // One effect = one request per change (the old code fired 4 or more)
  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, entriesPerPage, debouncedSearch]);

  /* ---------- customer details dialog ---------- */
  useEffect(() => {
    if (!viewingCustomer) {
      setDetailedCustomer(null);
      return;
    }
    let cancelled = false;
    fetch(`${API_BASE}/customers/${viewingCustomer.id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => { if (!cancelled) setDetailedCustomer(data.success ? data.data : null); })
      .catch((err) => {
        console.error("Error fetching customer details:", err);
        if (!cancelled) setDetailedCustomer(null);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingCustomer]);

  useEffect(() => {
    if (!viewingCustomer) return;
    const onKey = (e) => { if (e.key === "Escape") setViewingCustomer(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [viewingCustomer]);

  /* ---------- actions ---------- */
  const toggleStatus = async (customer) => {
    const blocking = customer.status === 1;
    const confirm = await Swal.fire({
      title: blocking ? "Block this customer?" : "Unblock this customer?",
      text: `${customer.name} will be ${blocking ? "blocked" : "set to active"}.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: blocking ? "Yes, block" : "Yes, unblock",
      customClass: swalClasses,
    });
    if (!confirm.isConfirmed) return;

    try {
      const newStatus = blocking ? 0 : 1;
      const res = await fetch(`${API_BASE}/users/${customer.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (data.success) {
        setCustomers((prev) => prev.map((c) => (c.id === customer.id ? { ...c, status: newStatus } : c)));
      } else {
        Swal.fire({ title: "Error", text: data.message || "Failed to update status", icon: "error", customClass: swalOk });
      }
    } catch (err) {
      console.error("Error updating status:", err);
      Swal.fire({ title: "Error", text: "Error updating status", icon: "error", customClass: swalOk });
    }
  };

  const areAllOnPageSelected = customers.length > 0 && customers.every((c) => selectedIds.includes(c.id));

  const handleSelectCustomer = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  const handleSelectAll = (e) => {
    const idsOnPage = customers.map((c) => c.id);
    setSelectedIds((prev) =>
      e.target.checked ? [...new Set([...prev, ...idsOnPage])] : prev.filter((id) => !idsOnPage.includes(id))
    );
  };

  const bulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `${selectedIds.length} selected customer(s) will be permanently deleted!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete!",
      customClass: swalClasses,
    });
    if (!result.isConfirmed) return;

    try {
      await axios.post(
        `${API_BASE}/customer/bulk-delete`,
        { ids: selectedIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire({ title: "Deleted!", text: "Selected customers deleted.", icon: "success", customClass: swalOk });
      setSelectedIds([]);
      fetchCustomers();
    } catch (error) {
      Swal.fire({ title: "Error!", text: "Something went wrong.", icon: "error", customClass: swalOk });
    }
  };

  /* ---------- derived ---------- */
  // Active / blocked are counted from the rows on this page (the API only sends a grand total)
  const stats = {
    total: meta?.total || 0,
    active: customers.filter((c) => c.status === 1).length,
    blocked: customers.filter((c) => c.status === 0).length,
  };
  const lastPage = meta?.last_page || 1;
  const pages = useMemo(() => pageWindow(page, lastPage), [page, lastPage]);
  const iconBtn = "h-8 w-8 inline-flex items-center justify-center rounded-lg transition-colors";

  return (
    <div className="w-full">
      <style>{MOTION_CSS}</style>

      <div className="mx-auto w-full max-w-[90rem] space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">

        {/* STATS */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile label="Total customers" value={stats.total} icon={Users} delay={0} />
          <StatTile label="Active customers" value={stats.active} caption="On this page" icon={UserCheck} delay={60} />
          <StatTile label="Blocked customers" value={stats.blocked} caption="On this page" icon={UserX} delay={120} />
        </div>

        <div className={clsx("overflow-hidden rounded-2xl", glassCard, cardShadow)}>

          {/* HEADER + CONTROLS ON WAVES */}
          <div className="relative">
            <WaveBackground />

            <div className="relative z-10 border-b border-black/10 px-6 py-4 dark:border-white/10">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold text-card-foreground">Customer management</h1>
                  <p className="text-sm text-muted-foreground">Manage customer accounts and view order history</p>
                </div>

                <PermissionGuard permission="bulk_delete_customers">
                  <button
                    type="button"
                    onClick={bulkDelete}
                    disabled={selectedIds.length === 0}
                    className={clsx(
                      "inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg px-4 text-sm font-semibold transition-colors",
                      selectedIds.length > 0
                        ? "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-300"
                        : "cursor-not-allowed border border-border text-muted-foreground opacity-40"
                    )}
                  >
                    <Trash2 className="h-4 w-4" />
                    Bulk delete{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
                  </button>
                </PermissionGuard>
              </div>
            </div>

            <div className="relative z-10 px-6 pb-6 pt-4">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <label htmlFor="cust-per-page" className="whitespace-nowrap text-sm text-muted-foreground">Show</label>
                  <select
                    id="cust-per-page"
                    value={entriesPerPage}
                    onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setPage(1); }}
                    className={clsx(
                      "h-9 w-[90px] cursor-pointer rounded-lg px-3 text-sm text-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-primary/40",
                      glassInput
                    )}
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n} className="text-slate-900">{n}</option>
                    ))}
                  </select>
                  <span className="whitespace-nowrap text-sm text-muted-foreground">entries</span>
                </div>

                <div className="relative w-full sm:w-80">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    className={clsx(
                      "h-10 w-full rounded-xl pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground/60",
                      "focus:outline-none focus:ring-2 focus:ring-primary/40",
                      glassInput
                    )}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead className="border-b border-black/15 bg-white/30 dark:border-white/15 dark:bg-white/10">
                <tr className="divide-x divide-black/5 dark:divide-white/5">
                  <th className="w-[60px] px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={areAllOnPageSelected}
                      onChange={handleSelectAll}
                      aria-label="Select all customers on this page"
                      className="h-4 w-4 cursor-pointer rounded border-input accent-primary"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Status</th>
                  <th className="w-[140px] px-4 py-3 text-right text-xs font-semibold text-foreground">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" />
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center text-sm text-muted-foreground">
                      {debouncedSearch ? `No customers match "${debouncedSearch}"` : "No customers found."}
                    </td>
                  </tr>
                ) : (
                  customers.map((customer, i) => (
                    <tr
                      key={customer.id}
                      className="pp-row-in divide-x divide-black/5 border-b border-black/10 transition-colors hover:bg-primary/5 dark:divide-white/5 dark:border-white/10"
                      style={{ animationDelay: `${Math.min(i, 9) * 30}ms` }}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(customer.id)}
                          onChange={() => handleSelectCustomer(customer.id)}
                          aria-label={`Select ${customer.name}`}
                          className="h-4 w-4 cursor-pointer rounded border-input accent-primary"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar src={customer.detail_links?.single_user} name={customer.name} />
                          <span className="truncate text-sm font-semibold text-foreground">{customer.name}</span>
                        </div>
                      </td>

                      <td className="max-w-[240px] px-4 py-3 text-sm text-muted-foreground">
                        <p className="truncate" title={customer.email}>{customer.email}</p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground">{customer.phone || "—"}</td>

                      <td className="px-4 py-3">
                        <span className={clsx(chipBase, customer.status === 1 ? ACTIVE_STYLE : BLOCKED_STYLE)}>
                          <span className={clsx("h-1.5 w-1.5 rounded-full", customer.status === 1 ? "bg-emerald-500" : "bg-rose-500")} />
                          {customer.status === 1 ? "Active" : "Blocked"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <PermissionGuard permission="view_customers">
                            <button
                              type="button"
                              onClick={() => setViewingCustomer(customer)}
                              title="View"
                              aria-label={`View ${customer.name}`}
                              className={clsx(iconBtn, "text-muted-foreground hover:bg-primary/10 hover:text-primary")}
                            >
                              <Eye className="h-[18px] w-[18px]" />
                            </button>
                          </PermissionGuard>

                          <PermissionGuard permission="edit_customers">
                            <button
                              type="button"
                              onClick={() => navigate(`/customers/edit/${customer.id}?page=${page}&per_page=${entriesPerPage}`)}
                              title="Edit"
                              aria-label={`Edit ${customer.name}`}
                              className={clsx(iconBtn, "text-muted-foreground hover:bg-primary/10 hover:text-primary")}
                            >
                              <Pencil className="h-[18px] w-[18px]" />
                            </button>
                          </PermissionGuard>

                          <PermissionGuard permission="block_customers">
                            <button
                              type="button"
                              onClick={() => toggleStatus(customer)}
                              title={customer.status === 1 ? "Block" : "Unblock"}
                              aria-label={`${customer.status === 1 ? "Block" : "Unblock"} ${customer.name}`}
                              className={clsx(
                                iconBtn,
                                customer.status === 1
                                  ? "text-rose-500 hover:bg-rose-500/10"
                                  : "text-emerald-600 hover:bg-emerald-500/10"
                              )}
                            >
                              {customer.status === 1 ? <Ban className="h-[18px] w-[18px]" /> : <CheckCircle className="h-[18px] w-[18px]" />}
                            </button>
                          </PermissionGuard>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER / PAGINATION */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-black/10 bg-white/40 px-6 py-4 dark:border-white/10 dark:bg-white/5 md:flex-row">
            <span className="text-[13px] text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{meta?.from || 0}</span> to{" "}
              <span className="font-semibold text-foreground">{meta?.to || 0}</span> of{" "}
              <span className="font-semibold text-foreground">{meta?.total || 0}</span> entries
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                aria-label="Previous page"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>

              {pages.map((n) =>
                typeof n === "string" ? (
                  <span key={n} className="px-1 text-muted-foreground">…</span>
                ) : (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    aria-current={n === page ? "page" : undefined}
                    className={clsx(
                      "h-9 min-w-[36px] rounded-lg px-2 text-[13px] font-medium transition-colors",
                      n === page
                        ? `bg-gradient-to-r ${primaryGradient} text-white shadow-md shadow-indigo-500/30`
                        : "border border-border text-foreground hover:bg-primary/5"
                    )}
                  >
                    {n}
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(p + 1, lastPage))}
                disabled={page === lastPage}
                aria-label="Next page"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOMER DETAILS DIALOG */}
      {viewingCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setViewingCustomer(null); }}
        >
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-black/10 px-6 py-4 dark:border-white/10">
              <h3 className="text-lg font-semibold text-foreground">Customer details</h3>
              <button
                type="button"
                onClick={() => setViewingCustomer(null)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              {detailedCustomer ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <Avatar src={viewingCustomer.detail_links?.single_user} name={detailedCustomer.name} size={56} />
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-foreground">{detailedCustomer.name}</p>
                      <span className={clsx(chipBase, "mt-1", detailedCustomer.status === 1 ? ACTIVE_STYLE : BLOCKED_STYLE)}>
                        {detailedCustomer.status === 1 ? "Active" : "Blocked"}
                      </span>
                    </div>
                  </div>

                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div className="border-b border-black/10 pb-3 dark:border-white/10">
                      <dt className="text-xs text-muted-foreground">Email</dt>
                      <dd className="mt-0.5 break-words text-sm font-medium text-foreground">{detailedCustomer.email || "—"}</dd>
                    </div>
                    <div className="border-b border-black/10 pb-3 dark:border-white/10">
                      <dt className="text-xs text-muted-foreground">Phone</dt>
                      <dd className="mt-0.5 text-sm font-medium text-foreground">{detailedCustomer.phone || "—"}</dd>
                    </div>
                  </dl>

                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-foreground">Addresses</h4>
                    {detailedCustomer.address?.data?.length > 0 ? (
                      <div className="space-y-3">
                        {detailedCustomer.address.data.map((address, index) => (
                          <div
                            key={address.id ?? index}
                            className="rounded-xl border border-black/10 bg-white/50 p-4 text-sm dark:border-white/10 dark:bg-white/5"
                          >
                            <p className="mb-2 text-xs font-semibold text-primary">Address {index + 1}</p>
                            <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
                              <div><dt className="text-xs text-muted-foreground">Street</dt><dd className="font-medium text-foreground">{address.street || "—"}</dd></div>
                              <div><dt className="text-xs text-muted-foreground">Apartment / suite</dt><dd className="font-medium text-foreground">{address.apartment_suite || "N/A"}</dd></div>
                              <div><dt className="text-xs text-muted-foreground">City</dt><dd className="font-medium text-foreground">{address.city?.name || "Unknown City"}</dd></div>
                              <div><dt className="text-xs text-muted-foreground">State / province</dt><dd className="font-medium text-foreground">{address.state?.name || "Unknown State"}</dd></div>
                              <div><dt className="text-xs text-muted-foreground">Zip code</dt><dd className="font-medium text-foreground">{address.zipcode || "—"}</dd></div>
                              <div><dt className="text-xs text-muted-foreground">Country</dt><dd className="font-medium text-foreground">{address.country?.name || "Unknown Country"}</dd></div>
                            </dl>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No addresses available</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" />
                  <p className="mt-3 text-sm text-muted-foreground">Loading customer details...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;