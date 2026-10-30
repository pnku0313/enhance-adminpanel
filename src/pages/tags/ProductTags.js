"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { clsx } from "clsx";
import {
  Plus, Pencil, Trash2, Search, X, ChevronLeft, ChevronRight, Loader2,
  Tag, Tags, Hash, Bookmark,
} from "lucide-react";
import PermissionGuard from "../../components/auth/PermissionGuard";

/* ==========================================================================
   THEME: same glass + indigo/purple look as the other pages.
   No backdrop-blur (it caused scroll lag).
   ========================================================================== */
const glassCard = "bg-white/70 dark:bg-slate-900/60 border border-white/30 dark:border-white/10";
const glassInput = "bg-white/50 dark:bg-white/10 border border-white/30 dark:border-white/15";
const glassModal = "bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-700";
const cardShadow = "shadow-xl shadow-black/5 dark:shadow-black/20";
const primaryGradient = "from-indigo-500 via-purple-500 to-indigo-600";

const API_BASE = "http://127.0.0.1:8000/api";
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const chipBase = "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap";

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
.pp-wave-1 { animation: pp-wave 26s linear infinite; will-change: transform; }
.pp-wave-2 { animation: pp-wave 18s linear infinite reverse; will-change: transform; }
.pp-wave-3 { animation: pp-wave 12s linear infinite; will-change: transform; }
.pp-float { animation: pp-float 3.2s ease-in-out infinite; }
/* "backwards" (not "both") so finished rows don't keep a stacking context */
.pp-row-in { animation: pp-row-in 0.28s ease-out backwards; }
@media (prefers-reduced-motion: reduce) {
  .pp-wave-1, .pp-wave-2, .pp-wave-3, .pp-float, .pp-row-in { animation: none !important; }
}
`;

const WAVE_PATH =
  "M0 80 Q180 20 360 80 T720 80 T1080 80 T1440 80 T1800 80 T2160 80 T2520 80 T2880 80 L2880 160 L0 160 Z";

/* Waves with tag-themed icons: tag, tags, hash, bookmark */
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
    { Icon: Tag, left: "9%", delay: "0s" },
    { Icon: Hash, left: "34%", delay: "-1.1s" },
    { Icon: Tags, left: "60%", delay: "-2.2s" },
    { Icon: Bookmark, left: "85%", delay: "-0.6s" },
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

const dangerBtn =
  "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40";
const swalClasses = {
  popup: `${glassModal} rounded-2xl`,
  confirmButton: dangerBtn,
  cancelButton: "bg-muted text-muted-foreground hover:bg-muted/80",
};
const swalOk = { popup: `${glassModal} rounded-2xl` };

/* ==========================================================================
   PAGE
   ========================================================================== */
const ProductTagsPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [productTags, setProductTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [selectedTags, setSelectedTags] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const reqId = useRef(0); // ignore out-of-date responses

  const fetchTags = async () => {
    const myReq = ++reqId.current;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/tags`, {
        params: { page, perPage: itemsPerPage, search: debouncedSearch, sortDir: "desc" },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (myReq !== reqId.current) return;
      setProductTags(res.data.data || []);
      setTotalItems(res.data.meta?.total || 0);
      setLastPage(res.data.meta?.last_page || 1);
    } catch (error) {
      if (myReq !== reqId.current) return;
      console.error("Error fetching tags:", error.response || error);
      setProductTags([]);
    } finally {
      if (myReq === reqId.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, itemsPerPage, debouncedSearch]);

  const deleteTag = async (tag) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `"${tag.name}" will be permanently deleted.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      customClass: swalClasses,
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE}/tags/${tag.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedTags((prev) => prev.filter((id) => id !== tag.id));
      Swal.fire({ title: "Deleted!", text: "The tag has been deleted.", icon: "success", customClass: swalOk });
      fetchTags();
    } catch (error) {
      console.error("Error deleting tag:", error.response || error);
      Swal.fire({ title: "Error", text: "Failed to delete the tag.", icon: "error", customClass: swalOk });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTags.length === 0) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete ${selectedTags.length} tags.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete them!",
      customClass: swalClasses,
    });
    if (!result.isConfirmed) return;

    // allSettled so one failure doesn't hide the ones that succeeded
    const results = await Promise.allSettled(
      selectedTags.map((id) =>
        axios.delete(`${API_BASE}/tags/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      )
    );
    const failed = results.filter((r) => r.status === "rejected").length;

    setSelectedTags([]);
    fetchTags();
    if (failed === 0) {
      Swal.fire({ title: "Deleted!", text: "Selected tags have been deleted.", icon: "success", customClass: swalOk });
    } else {
      Swal.fire({
        title: "Partly deleted",
        text: `${failed} of ${results.length} tags could not be deleted.`,
        icon: "error",
        customClass: swalOk,
      });
    }
  };

  const areAllOnPageSelected = productTags.length > 0 && productTags.every((tag) => selectedTags.includes(tag.id));

  const handleSelectAllTags = (e) => {
    const idsOnPage = productTags.map((tag) => tag.id);
    setSelectedTags((prev) =>
      e.target.checked ? [...new Set([...prev, ...idsOnPage])] : prev.filter((id) => !idsOnPage.includes(id))
    );
  };

  const handleSelectTag = (id) =>
    setSelectedTags((prev) => (prev.includes(id) ? prev.filter((tagId) => tagId !== id) : [...prev, id]));

  const pages = useMemo(() => pageWindow(page, lastPage), [page, lastPage]);
  const startIndex = totalItems === 0 ? 0 : (page - 1) * itemsPerPage + 1;
  const endIndex = Math.min(page * itemsPerPage, totalItems);
  const iconBtn = "h-8 w-8 inline-flex items-center justify-center rounded-lg transition-colors";

  return (
    <div className="w-full">
      <style>{MOTION_CSS}</style>

      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className={clsx("rounded-2xl overflow-hidden", glassCard, cardShadow)}>

          {/* HEADER + CONTROLS ON WAVES */}
          <div className="relative">
            <WaveBackground />

            <div className="relative z-10 px-6 py-4 border-b border-white/20 dark:border-white/10">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold text-card-foreground">Product tags</h1>
                  <p className="text-sm text-muted-foreground">Manage your product tags</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedTags.length > 0 && (
                    <PermissionGuard permission="bulk_delete_product_tags">
                      <button
                        type="button"
                        onClick={handleBulkDelete}
                        className="inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold whitespace-nowrap bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-400/30 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Bulk delete ({selectedTags.length})
                      </button>
                    </PermissionGuard>
                  )}

                  <PermissionGuard permission="create_product_tags">
                    <button
                      type="button"
                      onClick={() => navigate("/add-tag")}
                      className={clsx(
                        "inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold whitespace-nowrap text-white transition-all duration-200",
                        "bg-gradient-to-r shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40",
                        primaryGradient
                      )}
                    >
                      <Plus className="h-4 w-4" />
                      Add new
                    </button>
                  </PermissionGuard>
                </div>
              </div>
            </div>

            <div className="relative z-10 px-6 pt-4 pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <label htmlFor="tags-per-page" className="text-sm text-muted-foreground whitespace-nowrap">Show</label>
                  <select
                    id="tags-per-page"
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setPage(1); }}
                    className={clsx(
                      "h-9 w-[90px] px-3 rounded-lg text-sm text-foreground cursor-pointer",
                      "focus:outline-none focus:ring-2 focus:ring-primary/40",
                      glassInput
                    )}
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n} className="text-slate-900">{n}</option>
                    ))}
                  </select>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">entries</span>
                </div>

                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search tags..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    className={clsx(
                      "h-10 w-full pl-10 pr-9 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60",
                      "focus:outline-none focus:ring-2 focus:ring-primary/40",
                      glassInput
                    )}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
            <table className="w-full border-collapse min-w-[640px]">
              <thead className="bg-white/30 dark:bg-white/10 border-b border-white/20 dark:border-white/15">
                <tr>
                  <th className="w-[60px] px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={areAllOnPageSelected}
                      onChange={handleSelectAllTags}
                      aria-label="Select all tags on this page"
                      className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Created at</th>
                  <th className="w-[110px] px-4 py-3 text-right text-xs font-semibold text-foreground">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-14 text-center">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
                    </td>
                  </tr>
                ) : productTags.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-14 text-center text-sm text-muted-foreground">
                      {debouncedSearch ? `No tags match "${debouncedSearch}"` : "No tags found"}
                    </td>
                  </tr>
                ) : (
                  productTags.map((tag, i) => (
                    <tr
                      key={tag.id}
                      className="pp-row-in border-b border-white/10 dark:border-white/5 hover:bg-primary/5 transition-colors"
                      style={{ animationDelay: `${Math.min(i, 9) * 30}ms` }}
                    >
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag.id)}
                          onChange={() => handleSelectTag(tag.id)}
                          aria-label={`Select ${tag.name}`}
                          className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                        />
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-border flex items-center justify-center">
                            <Tag size={16} className="text-primary" />
                          </div>
                          <span className="text-sm font-semibold text-foreground truncate">{tag.name}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        {tag.status === true ? (
                          <span className={clsx(chipBase, "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/30")}>
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className={clsx(chipBase, "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-400/30")}>
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-[13px] text-muted-foreground whitespace-nowrap">
                        {tag.created_at ? new Date(tag.created_at).toLocaleString() : "N/A"}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <PermissionGuard permission="edit_product_tags">
                            <button
                              type="button"
                              onClick={() => navigate(`/edit-tag/${tag.id}`)}
                              title="Edit"
                              aria-label={`Edit ${tag.name}`}
                              className={clsx(iconBtn, "text-muted-foreground hover:bg-primary/10 hover:text-primary")}
                            >
                              <Pencil className="h-[18px] w-[18px]" />
                            </button>
                          </PermissionGuard>

                          <PermissionGuard permission="delete_product_tags">
                            <button
                              type="button"
                              onClick={() => deleteTag(tag)}
                              title="Delete"
                              aria-label={`Delete ${tag.name}`}
                              className={clsx(iconBtn, "text-rose-500 hover:bg-rose-500/10")}
                            >
                              <Trash2 className="h-[18px] w-[18px]" />
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
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-white/20 dark:border-white/10 bg-white/40 dark:bg-white/5">
            <span className="text-[13px] text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{startIndex}</span> to{" "}
              <span className="font-semibold text-foreground">{endIndex}</span> of{" "}
              <span className="font-semibold text-foreground">{totalItems}</span> entries
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Previous page"
                className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-border text-foreground hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                      "h-9 min-w-[36px] px-2 rounded-lg text-[13px] font-medium transition-colors",
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
                disabled={page === lastPage || lastPage === 0}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
                className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-border text-foreground hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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

export default ProductTagsPage;