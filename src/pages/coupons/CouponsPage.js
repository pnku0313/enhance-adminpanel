"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { clsx } from "clsx";
import {
  Plus, Pencil, Trash2, Search, X, ChevronLeft, ChevronRight, Loader2,
  Ticket, Percent, Gift, Tag,
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

const chipBase = "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap";
const INDIGO_CHIP = "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-400/30";
const PURPLE_CHIP = "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-400/30";
const EXPIRED_CHIP = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-400/30";

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
@keyframes pp-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.pp-wave-1 { animation: pp-wave 26s linear infinite; will-change: transform; }
.pp-wave-2 { animation: pp-wave 18s linear infinite reverse; will-change: transform; }
.pp-wave-3 { animation: pp-wave 12s linear infinite; will-change: transform; }
.pp-float { animation: pp-float 3.2s ease-in-out infinite; }
/* "backwards" (not "both") so finished rows don't keep a stacking context */
.pp-row-in { animation: pp-row-in 0.28s ease-out backwards; }
.pp-grow { transform-origin: left center; animation: pp-grow 0.8s cubic-bezier(.2,.7,.2,1) backwards; }
@media (prefers-reduced-motion: reduce) {
  .pp-wave-1, .pp-wave-2, .pp-wave-3, .pp-float, .pp-row-in, .pp-grow { animation: none !important; }
}
`;

const WAVE_PATH =
  "M0 80 Q180 20 360 80 T720 80 T1080 80 T1440 80 T1800 80 T2160 80 T2520 80 T2880 80 L2880 160 L0 160 Z";

/* Waves with coupon-themed icons: ticket, percent, gift, tag */
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
    { Icon: Ticket, left: "9%", delay: "0s" },
    { Icon: Percent, left: "34%", delay: "-1.1s" },
    { Icon: Gift, left: "60%", delay: "-2.2s" },
    { Icon: Tag, left: "85%", delay: "-0.6s" },
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

const todayStr = () => new Date().toISOString().slice(0, 10);

/* ==========================================================================
   PAGE
   ========================================================================== */
const CouponsPage = () => {
  const navigate = useNavigate();

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [total, setTotal] = useState(0);

  const reqId = useRef(0); // ignore out-of-date responses

  const fetchCoupons = async () => {
    const myReq = ++reqId.current;
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/coupons?perPage=${entriesPerPage}&page=${page}&search=${encodeURIComponent(debouncedSearch)}`
      );
      const data = await response.json();
      if (myReq !== reqId.current) return;
      const rows = data.data || [];
      setCoupons(rows);
      setTotal(data.meta?.total ?? data.total ?? rows.length);
    } catch (error) {
      if (myReq !== reqId.current) return;
      console.error("Error fetching coupons:", error);
      setCoupons([]);
    } finally {
      if (myReq === reqId.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entriesPerPage, page, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(total / entriesPerPage));
  const pages = useMemo(() => pageWindow(page, totalPages), [page, totalPages]);

  const handleDelete = async (coupon) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Coupon "${coupon.coupon_code}" will be deleted. You won't be able to revert this!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      customClass: swalClasses,
    });
    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${API_BASE}/coupons/${coupon.id}`, { method: "DELETE" });
      const resData = await response.json();

      if (resData.success) {
        setSelectedIds((prev) => prev.filter((sid) => sid !== coupon.id));
        fetchCoupons();
        Swal.fire({ title: "Deleted!", text: "Coupon has been deleted.", icon: "success", customClass: swalOk });
      } else {
        Swal.fire({ title: "Error!", text: "Failed to delete coupon.", icon: "error", customClass: swalOk });
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      Swal.fire({ title: "Error!", text: "An error occurred while deleting the coupon.", icon: "error", customClass: swalOk });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const result = await Swal.fire({
      title: `Delete ${selectedIds.length} selected coupons?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete them!",
      customClass: swalClasses,
    });
    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${API_BASE}/coupon/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const resData = await response.json();

      if (resData.success) {
        setSelectedIds([]);
        fetchCoupons();
        Swal.fire({ title: "Deleted!", text: "Selected coupons have been deleted.", icon: "success", customClass: swalOk });
      } else {
        Swal.fire({ title: "Error!", text: "Failed to delete selected coupons.", icon: "error", customClass: swalOk });
      }
    } catch (error) {
      console.error("Bulk delete error:", error);
      Swal.fire({ title: "Error!", text: "An error occurred while deleting coupons.", icon: "error", customClass: swalOk });
    }
  };

  const areAllOnPageSelected = coupons.length > 0 && coupons.every((c) => selectedIds.includes(c.id));

  const handleSelectAll = (e) => {
    const idsOnPage = coupons.map((c) => c.id);
    setSelectedIds((prev) =>
      e.target.checked ? [...new Set([...prev, ...idsOnPage])] : prev.filter((id) => !idsOnPage.includes(id))
    );
  };

  const handleSelectOne = (id, checked) =>
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((sid) => sid !== id)));

  const startIndex = total === 0 ? 0 : (page - 1) * entriesPerPage + 1;
  const endIndex = Math.min(page * entriesPerPage, total);
  const today = todayStr();
  const iconBtn = "h-8 w-8 inline-flex items-center justify-center rounded-lg transition-colors";

  return (
    <div className="w-full">
      <style>{MOTION_CSS}</style>

      <div className="mx-auto w-full max-w-[90rem] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className={clsx("overflow-hidden rounded-2xl", glassCard, cardShadow)}>

          {/* HEADER + CONTROLS ON WAVES */}
          <div className="relative">
            <WaveBackground />

            <div className="relative z-10 border-b border-black/10 px-6 py-4 dark:border-white/10">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold text-card-foreground">Coupons</h1>
                  <p className="text-sm text-muted-foreground">Create and manage discount coupons</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <PermissionGuard permission="bulk_coupons">
                    <button
                      type="button"
                      disabled={selectedIds.length === 0}
                      onClick={handleBulkDelete}
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

                  <PermissionGuard permission="create_coupons">
                    <button
                      type="button"
                      onClick={() => navigate("/addcoupen")}
                      className={clsx(
                        "inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg bg-gradient-to-r px-4 text-sm font-semibold text-white transition-all duration-200",
                        "shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40",
                        primaryGradient
                      )}
                    >
                      <Plus className="h-4 w-4" />
                      Add coupon
                    </button>
                  </PermissionGuard>
                </div>
              </div>
            </div>

            <div className="relative z-10 px-6 pb-6 pt-4">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <label htmlFor="coupon-per-page" className="whitespace-nowrap text-sm text-muted-foreground">Show</label>
                  <select
                    id="coupon-per-page"
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
                    placeholder="Search coupons..."
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
            <table className="w-full min-w-[900px] border-collapse">
              <thead className="border-b border-black/15 bg-white/30 dark:border-white/15 dark:bg-white/10">
                <tr className="divide-x divide-black/5 dark:divide-white/5">
                  <th className="w-[60px] px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={areAllOnPageSelected}
                      onChange={handleSelectAll}
                      aria-label="Select all coupons on this page"
                      className="h-4 w-4 cursor-pointer rounded border-input accent-primary"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-foreground">Value</th>
                  <th className="min-w-[150px] px-4 py-3 text-left text-xs font-semibold text-foreground">Usage</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-foreground">Min amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Valid until</th>
                  <th className="w-[100px] px-4 py-3 text-right text-xs font-semibold text-foreground">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-14 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" />
                    </td>
                  </tr>
                ) : coupons.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-14 text-center text-sm text-muted-foreground">
                      {debouncedSearch ? `No coupons match "${debouncedSearch}"` : "No coupons found."}
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon, i) => {
                    const used = Number(coupon.no_of_uses) || 0;
                    const allowed = Number(coupon.no_uses_allowed) || 0;
                    const usedPct = allowed > 0 ? Math.min(100, (used / allowed) * 100) : 0;
                    const validTo = coupon.date_to ? String(coupon.date_to).slice(0, 10) : "";
                    const expired = validTo && validTo < today;

                    return (
                      <tr
                        key={coupon.id}
                        className="pp-row-in divide-x divide-black/5 border-b border-black/10 transition-colors hover:bg-primary/5 dark:divide-white/5 dark:border-white/10"
                        style={{ animationDelay: `${Math.min(i, 9) * 30}ms` }}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(coupon.id)}
                            onChange={(e) => handleSelectOne(coupon.id, e.target.checked)}
                            aria-label={`Select ${coupon.coupon_code}`}
                            className="h-4 w-4 cursor-pointer rounded border-input accent-primary"
                          />
                        </td>

                        <td className="px-4 py-3">
                          <span className={clsx(chipBase, "font-mono uppercase", INDIGO_CHIP)}>{coupon.coupon_code}</span>
                        </td>

                        <td className="px-4 py-3 text-sm font-semibold text-foreground">{coupon.coupon_name}</td>

                        <td className="px-4 py-3">
                          <span className={clsx(chipBase, "capitalize", PURPLE_CHIP)}>{coupon.discount_type}</span>
                        </td>

                        <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-foreground">
                          {coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center justify-between text-xs tabular-nums">
                            <span className="font-medium text-foreground">{used}</span>
                            <span className="text-muted-foreground">of {allowed || "—"}</span>
                          </div>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted/60">
                            <div
                              className={clsx("pp-grow h-full rounded-full bg-gradient-to-r", primaryGradient)}
                              style={{ width: `${usedPct}%` }}
                            />
                          </div>
                        </td>

                        <td className="px-4 py-3 text-right text-sm tabular-nums text-foreground">₹{coupon.min_amount}</td>

                        <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground">
                          {validTo ? (
                            <div className="flex flex-col items-start gap-1">
                              <span>{validTo}</span>
                              {expired && <span className={clsx(chipBase, "px-2 py-0.5", EXPIRED_CHIP)}>Expired</span>}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <PermissionGuard permission="edit_coupons">
                              <button
                                type="button"
                                onClick={() => navigate(`/edit-coupons/${coupon.id}`)}
                                title="Edit"
                                aria-label={`Edit ${coupon.coupon_code}`}
                                className={clsx(iconBtn, "text-muted-foreground hover:bg-primary/10 hover:text-primary")}
                              >
                                <Pencil className="h-[18px] w-[18px]" />
                              </button>
                            </PermissionGuard>
                            <PermissionGuard permission="delete_coupons">
                              <button
                                type="button"
                                onClick={() => handleDelete(coupon)}
                                title="Delete"
                                aria-label={`Delete ${coupon.coupon_code}`}
                                className={clsx(iconBtn, "text-rose-500 hover:bg-rose-500/10")}
                              >
                                <Trash2 className="h-[18px] w-[18px]" />
                              </button>
                            </PermissionGuard>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER / PAGINATION */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-black/10 bg-white/40 px-6 py-4 dark:border-white/10 dark:bg-white/5 md:flex-row">
            <span className="text-[13px] text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{startIndex}</span> to{" "}
              <span className="font-semibold text-foreground">{endIndex}</span> of{" "}
              <span className="font-semibold text-foreground">{total}</span> entries
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
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
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponsPage;