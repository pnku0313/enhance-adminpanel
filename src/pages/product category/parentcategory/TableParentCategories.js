import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit, Trash2, Plus, Search, X, ChevronLeft, ChevronRight, Loader2,
  Network, FolderOpen, Layers, Tags,
} from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { clsx } from "clsx";
import PermissionGuard from "../../../components/auth/PermissionGuard";

/* ==========================================================================
   THEME: same glass + indigo/purple look as Products / Orders / Categories.
   No backdrop-blur (it caused scroll lag).
   ========================================================================== */
const glassCard = "bg-white/70 dark:bg-slate-900/60 border border-white/30 dark:border-white/10";
const glassInput = "bg-white/50 dark:bg-white/10 border border-white/30 dark:border-white/15";
const glassModal = "bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-700";
const cardShadow = "shadow-xl shadow-black/5 dark:shadow-black/20";
const primaryGradient = "from-indigo-500 via-purple-500 to-indigo-600";

const API_BASE = "http://127.0.0.1:8000/api";
// NOTE: the old code called ".../product-sub-categort/bulk-delete" (typo). Confirm the real route name in your backend.
const BULK_DELETE_URL = `${API_BASE}/product-sub-category/bulk-delete`;

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
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

/* Waves with hierarchy-themed icons: network, open folder, layers, tags */
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
    { Icon: Network, left: "9%", delay: "0s" },
    { Icon: FolderOpen, left: "34%", delay: "-1.1s" },
    { Icon: Layers, left: "60%", delay: "-2.2s" },
    { Icon: Tags, left: "85%", delay: "-0.6s" },
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

/* ==========================================================================
   PAGE
   ========================================================================== */
const ParentCategories = () => {
  const navigate = useNavigate();

  const [parentCategories, setParentCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedParents, setSelectedParents] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token") || localStorage.getItem("authToken");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    // (The old code also fetched /product-categories into an unused state; that request is removed.)
    fetch(`${API_BASE}/product-sub-categories`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => { if (!cancelled) setParentCategories(data.data || []); })
      .catch((err) => console.error("Error fetching parent categories:", err))
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [token]);

  /* Filtering + pagination (client side), null-safe */
  const filteredCategories = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return parentCategories;
    return parentCategories.filter(
      (cat) =>
        (cat.name || "").toLowerCase().includes(q) ||
        (cat.slug || "").toLowerCase().includes(q) ||
        (cat.parent_category?.name || "").toLowerCase().includes(q)
    );
  }, [parentCategories, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / itemsPerPage));

  // Keep the current page valid (e.g. after deleting the last row on the last page)
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const indexOfFirst = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = useMemo(
    () => filteredCategories.slice(indexOfFirst, indexOfFirst + itemsPerPage),
    [filteredCategories, indexOfFirst, itemsPerPage]
  );

  const pages = useMemo(() => pageWindow(currentPage, totalPages), [currentPage, totalPages]);

  const areAllOnPageSelected =
    paginatedCategories.length > 0 && paginatedCategories.every((cat) => selectedParents.includes(cat.id));

  const handleSelectAllCategories = () => {
    if (areAllOnPageSelected) {
      setSelectedParents((prev) => prev.filter((id) => !paginatedCategories.some((cat) => cat.id === id)));
    } else {
      const newIds = paginatedCategories.map((cat) => cat.id).filter((id) => !selectedParents.includes(id));
      setSelectedParents((prev) => [...prev, ...newIds]);
    }
  };

  const handleSelectCategory = (id) =>
    setSelectedParents((prev) => (prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]));

  const deleteCategory = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the category.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      customClass: swalClasses,
    }).then((result) => {
      if (!result.isConfirmed) return;

      fetch(`${API_BASE}/product-sub-categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data?.message || "Failed to delete");

          setParentCategories((prev) => prev.filter((cat) => cat.id !== id));
          setSelectedParents((prev) => prev.filter((cid) => cid !== id));
          Swal.fire("Deleted!", "The category has been deleted.", "success");
        })
        .catch((err) => {
          console.error("Delete error:", err);
          toast.error(err.message || "Failed to delete the category.");
        });
    });
  };

  const handleBulkDelete = () => {
    if (!token) {
      toast.error("No token found");
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete selected categories. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete them!",
      customClass: swalClasses,
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        // One request carrying the selected ids (the old code sent N identical requests with no ids)
        const res = await fetch(BULK_DELETE_URL, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedParents }),
        });
        if (!res.ok) throw new Error("Bulk delete failed");

        setParentCategories((prev) => prev.filter((cat) => !selectedParents.includes(cat.id)));
        setSelectedParents([]);
        Swal.fire("Deleted!", "Selected categories were deleted.", "success");
      } catch (err) {
        console.error("Bulk delete error:", err);
        toast.error("Error deleting selected categories.");
      }
    });
  };

  const iconBtn = "h-8 w-8 inline-flex items-center justify-center rounded-lg transition-colors";
  const shownFrom = paginatedCategories.length === 0 ? 0 : indexOfFirst + 1;
  const shownTo = indexOfFirst + paginatedCategories.length;

  return (
    <div className="w-full">
      <style>{MOTION_CSS}</style>

      {/* <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6"> */}
        {/* <div className={clsx("rounded-2xl overflow-hidden", glassCard, cardShadow)}> */}

          {/* HEADER + CONTROLS ON WAVES */}
          <div className="relative">
            <WaveBackground />

            <div className="relative z-10 px-6 py-4 border-b border-white/20 dark:border-white/10">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold text-card-foreground">Parent categories</h1>
                  <p className="text-sm text-muted-foreground">Manage your parent product categories</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedParents.length > 0 && (
                    <PermissionGuard permission="bulk_delete_parent_categories">
                      <button
                        type="button"
                        onClick={handleBulkDelete}
                        className="inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold whitespace-nowrap bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-400/30 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete ({selectedParents.length})
                      </button>
                    </PermissionGuard>
                  )}

                  <PermissionGuard permission="create_parent_categories">
                    <button
                      type="button"
                      onClick={() => navigate("/add-parentcategory")}
                      className={clsx(
                        "inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold whitespace-nowrap text-white transition-all duration-200",
                        "bg-gradient-to-r shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40",
                        primaryGradient
                      )}
                    >
                      <Plus className="h-4 w-4" />
                      Add parent category
                    </button>
                  </PermissionGuard>
                </div>
              </div>
            </div>

            <div className="relative z-10 px-6 pt-4 pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <label htmlFor="parent-per-page" className="text-sm text-muted-foreground whitespace-nowrap">Show</label>
                  <select
                    id="parent-per-page"
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
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
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
            <table className="w-full border-collapse min-w-[700px]">
              <thead className="bg-white/30 dark:bg-white/10 border-b border-white/20 dark:border-white/15">
                <tr>
                  <th className="w-[60px] px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={areAllOnPageSelected}
                      onChange={handleSelectAllCategories}
                      aria-label="Select all on this page"
                      className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                    />
                  </th>
                  <th className="w-[25%] px-4 py-3 text-left text-xs font-semibold text-foreground">Head category</th>
                  <th className="w-[30%] px-4 py-3 text-left text-xs font-semibold text-foreground">Parent category</th>
                  <th className="w-[25%] px-4 py-3 text-left text-xs font-semibold text-foreground">Slug</th>
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
                ) : !token ? (
                  <tr>
                    <td colSpan={5} className="py-14 text-center text-sm text-rose-500">
                      You are not signed in. Please log in again.
                    </td>
                  </tr>
                ) : paginatedCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-14 text-center text-sm text-muted-foreground">
                      {searchTerm ? `No categories match "${searchTerm}"` : "No parent categories found."}
                    </td>
                  </tr>
                ) : (
                  paginatedCategories.map((cat, i) => (
                    <tr
                      key={cat.id}
                      className="pp-row-in border-b border-white/10 dark:border-white/5 hover:bg-primary/5 transition-colors"
                      style={{ animationDelay: `${Math.min(i, 9) * 30}ms` }}
                    >
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedParents.includes(cat.id)}
                          onChange={() => handleSelectCategory(cat.id)}
                          aria-label={`Select ${cat.name}`}
                          className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                        />
                      </td>

                      <td className="px-4 py-3.5">
                        {cat.parent_category?.name ? (
                          <span className={clsx(chipBase, "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-400/30")}>
                            {cat.parent_category.name}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-border flex items-center justify-center">
                            <FolderOpen size={16} className="text-primary" />
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
                          <PermissionGuard permission="edit_parent_categories">
                            <button
                              type="button"
                              onClick={() => navigate(`/edit-parentcategory/${cat.id}`)}
                              title="Edit"
                              aria-label={`Edit ${cat.name}`}
                              className={clsx(iconBtn, "text-muted-foreground hover:bg-primary/10 hover:text-primary")}
                            >
                              <Edit className="h-[18px] w-[18px]" />
                            </button>
                          </PermissionGuard>

                          <PermissionGuard permission="delete_parent_categories">
                            <button
                              type="button"
                              onClick={() => deleteCategory(cat.id)}
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER / PAGINATION */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-white/20 dark:border-white/10 bg-white/40 dark:bg-white/5">
            <span className="text-[13px] text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{shownFrom}</span> to{" "}
              <span className="font-semibold text-foreground">{shownTo}</span> of{" "}
              <span className="font-semibold text-foreground">{filteredCategories.length}</span> entries
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
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
                    onClick={() => setCurrentPage(n)}
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
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                aria-label="Next page"
                className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-border text-foreground hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
    //   </div>
    // </div>
  );
};

export default ParentCategories;