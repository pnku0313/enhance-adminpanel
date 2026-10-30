import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import {
  Edit, Trash2, Plus, Search, X, ChevronLeft, ChevronRight, Loader2,
  GitBranch, Tag, Boxes, Shapes,
} from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import PermissionGuard from "../../../components/auth/PermissionGuard";

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
const DEFAULT_PAGE_SIZE = 10;
const chipBase = "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap";

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

/* Waves with leaf-level category icons: branch, tag, boxes, shapes */
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
    { Icon: GitBranch, left: "9%", delay: "0s" },
    { Icon: Tag, left: "34%", delay: "-1.1s" },
    { Icon: Boxes, left: "60%", delay: "-2.2s" },
    { Icon: Shapes, left: "85%", delay: "-0.6s" },
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

/* Loads every page of a list endpoint (used once, for the Head/Parent name lookups) */
const fetchAllPages = async (url) => {
  try {
    let all = [];
    let page = 1;
    let last = 1;
    do {
      const res = await axios.get(`${url}?page=${page}`);
      all = all.concat(res.data.data || []);
      last = res.data.meta?.last_page || 1;
      page++;
    } while (page <= last);
    return all;
  } catch (err) {
    console.error("Error fetching all pages:", err);
    return [];
  }
};

const dangerBtn =
  "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40";
const swalClasses = {
  popup: `${glassModal} rounded-2xl`,
  confirmButton: dangerBtn,
  cancelButton: "bg-muted text-muted-foreground hover:bg-muted/80",
};

/* ==========================================================================
   PAGE
   ========================================================================== */
const ChildCategoriesTable = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(queryParams.get("page"), 10) || 1;
  const perPageFromUrl = parseInt(queryParams.get("per_page"), 10);
  const initialPerPage = PAGE_SIZE_OPTIONS.includes(perPageFromUrl) ? perPageFromUrl : DEFAULT_PAGE_SIZE;

  const [headCategories, setHeadCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [childCategories, setChildCategories] = useState([]);
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setPage] = useState(pageFromUrl);
  const [entriesPerPage, setEntriesPerPage] = useState(initialPerPage);
  const [lastPage, setLastPage] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const sortDir = "desc";
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);

  const reqId = useRef(0); // ignore out-of-date responses

  /* Head + Parent names: fetched ONCE (the old code re-downloaded every page of both on each page change / keystroke) */
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchAllPages(`${API_BASE}/product-categories`),
      fetchAllPages(`${API_BASE}/product-sub-categories`),
    ]).then(([heads, parents]) => {
      if (cancelled) return;
      setHeadCategories(heads);
      setParentCategories(parents);
    });
    return () => { cancelled = true; };
  }, []);

  const headById = useMemo(() => new Map(headCategories.map((h) => [h.id, h.name])), [headCategories]);
  const parentById = useMemo(() => new Map(parentCategories.map((p) => [p.id, p.name])), [parentCategories]);

  const fetchChildren = async () => {
    const myReq = ++reqId.current;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/product-child-categories`, {
        params: { page: currentPage, perPage: entriesPerPage, search: debouncedSearch, sortDir },
      });
      if (myReq !== reqId.current) return;
      setChildCategories(res.data.data || []);
      setLastPage(res.data.meta?.last_page || 1);
      setTotalEntries(res.data.meta?.total || 0);
      setSelectedChildren([]);
    } catch (error) {
      if (myReq !== reqId.current) return;
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories from API.");
    } finally {
      if (myReq === reqId.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, entriesPerPage, debouncedSearch]);

  const allSelected = childCategories.length > 0 && selectedChildren.length === childCategories.length;

  const handleSelectAllCategories = () =>
    setSelectedChildren(allSelected ? [] : childCategories.map((c) => c.id));

  const handleSelectCategory = (id) =>
    setSelectedChildren((prev) => (prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]));

  const deleteCategory = async (cat) => {
    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${cat.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      customClass: swalClasses,
    });
    if (!confirmed.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE}/product-child-categories/${cat.id}`);
      fetchChildren();
      toast.success("Child category deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete child category.");
    }
  };

  const handleBulkDelete = async () => {
    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete ${selectedChildren.length} selected categories?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete them!",
      customClass: swalClasses,
    });
    if (!confirmed.isConfirmed) return;

    // allSettled so one failure doesn't hide the ones that succeeded
    const results = await Promise.allSettled(
      selectedChildren.map((id) => axios.delete(`${API_BASE}/product-child-categories/${id}`))
    );
    const failed = results.filter((r) => r.status === "rejected").length;

    fetchChildren();
    setSelectedChildren([]);
    if (failed === 0) toast.success("Selected child categories deleted successfully!");
    else toast.error(`${failed} of ${results.length} deletions failed.`);
  };

  const pages = useMemo(() => pageWindow(currentPage, lastPage), [currentPage, lastPage]);
  const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1;
  const endIndex = Math.min(currentPage * entriesPerPage, totalEntries);
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
                  <h1 className="text-lg font-semibold text-card-foreground">Child categories</h1>
                  <p className="text-sm text-muted-foreground">Manage your lowest-level product categories</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedChildren.length > 0 && (
                    <PermissionGuard permission="bulk_delete_child_categories">
                      <button
                        type="button"
                        onClick={handleBulkDelete}
                        className="inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold whitespace-nowrap bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-400/30 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Bulk delete ({selectedChildren.length})
                      </button>
                    </PermissionGuard>
                  )}

                  <PermissionGuard permission="create_child_categories">
                    <button
                      type="button"
                      onClick={() => navigate("/add-childcategory")}
                      className={clsx(
                        "inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold whitespace-nowrap text-white transition-all duration-200",
                        "bg-gradient-to-r shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40",
                        primaryGradient
                      )}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Add child category</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </PermissionGuard>
                </div>
              </div>
            </div>

            <div className="relative z-10 px-6 pt-4 pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <label htmlFor="child-per-page" className="text-sm text-muted-foreground whitespace-nowrap">Show</label>
                  <select
                    id="child-per-page"
                    value={entriesPerPage}
                    onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setPage(1); }}
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
                    placeholder="Search child categories..."
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
            <table className="w-full border-collapse min-w-[800px]">
              <thead className="bg-white/30 dark:bg-white/10 border-b border-white/20 dark:border-white/15">
                <tr>
                  <th className="w-[60px] px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAllCategories}
                      aria-label="Select all child categories"
                      className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                    />
                  </th>
                  <th className="min-w-[150px] px-4 py-3 text-left text-xs font-semibold text-foreground">Head category</th>
                  <th className="min-w-[150px] px-4 py-3 text-left text-xs font-semibold text-foreground">Parent category</th>
                  <th className="min-w-[180px] px-4 py-3 text-left text-xs font-semibold text-foreground">Child category</th>
                  <th className="min-w-[150px] px-4 py-3 text-left text-xs font-semibold text-foreground">Slug</th>
                  <th className="w-[110px] px-4 py-3 text-right text-xs font-semibold text-foreground">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
                    </td>
                  </tr>
                ) : childCategories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center text-sm text-muted-foreground">
                      {debouncedSearch ? `No categories match "${debouncedSearch}"` : "No child categories found."}
                    </td>
                  </tr>
                ) : (
                  childCategories.map((cat, i) => {
                    const head = headById.get(cat.product_category_id);
                    const parent = parentById.get(cat.product_subcategory_id);
                    return (
                      <tr
                        key={cat.id}
                        className="pp-row-in border-b border-white/10 dark:border-white/5 hover:bg-primary/5 transition-colors"
                        style={{ animationDelay: `${Math.min(i, 9) * 30}ms` }}
                      >
                        <td className="px-4 py-3.5">
                          <input
                            type="checkbox"
                            checked={selectedChildren.includes(cat.id)}
                            onChange={() => handleSelectCategory(cat.id)}
                            aria-label={`Select ${cat.name}`}
                            className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                          />
                        </td>

                        <td className="px-4 py-3.5">
                          {head ? (
                            <span className={clsx(chipBase, "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-400/30")}>
                              {head}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">N/A</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          {parent ? (
                            <span className={clsx(chipBase, "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-400/30")}>
                              {parent}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">N/A</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-border flex items-center justify-center">
                              <Tag size={16} className="text-primary" />
                            </div>
                            <span className="text-sm font-semibold text-foreground truncate">{cat.name}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          {cat.slug ? (
                            <span className={clsx(chipBase, "font-mono bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-400/30")}>
                              {cat.slug}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <PermissionGuard permission="edit_child_categories">
                              <button
                                type="button"
                                onClick={() => navigate(`/edit-childcategory/${cat.id}?page=${currentPage}&per_page=${entriesPerPage}`)}
                                title="Edit"
                                aria-label={`Edit ${cat.name}`}
                                className={clsx(iconBtn, "text-muted-foreground hover:bg-primary/10 hover:text-primary")}
                              >
                                <Edit className="h-[18px] w-[18px]" />
                              </button>
                            </PermissionGuard>

                            <PermissionGuard permission="delete_child_categories">
                              <button
                                type="button"
                                onClick={() => deleteCategory(cat)}
                                title="Delete"
                                aria-label={`Delete ${cat.name}`}
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
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-white/20 dark:border-white/10 bg-white/40 dark:bg-white/5">
            <span className="text-[13px] text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{startIndex}</span> to{" "}
              <span className="font-semibold text-foreground">{endIndex}</span> of{" "}
              <span className="font-semibold text-foreground">{totalEntries}</span> entries
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
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
                    aria-current={n === currentPage ? "page" : undefined}
                    className={clsx(
                      "h-9 min-w-[36px] px-2 rounded-lg text-[13px] font-medium transition-colors",
                      n === currentPage
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
                disabled={currentPage === lastPage}
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

export default ChildCategoriesTable;