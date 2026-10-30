"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { clsx } from "clsx";
import {
  Edit, MoreVertical, Trash2, Plus, Search, X, RefreshCw, AlertTriangle,
  Tag, Award, Store, Star,
} from "lucide-react";

import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Pagination } from "../../components/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/Dropdown";
import PermissionGuard from "../../components/auth/PermissionGuard";

/* ==========================================================================
   THEME (same tokens as ProductsPage / DiscountTable)
   ========================================================================== */
const glassCard = "bg-white/70 dark:bg-slate-900/60 border border-slate-300/80 dark:border-white/20";
const glassCardHeader = "bg-white/40 dark:bg-white/5 border-b border-slate-300/80 dark:border-white/20";
const glassInput = "bg-white/50 dark:bg-white/10 border border-slate-300/80 dark:border-white/20";
const glassModal = "bg-white dark:bg-slate-900 border border-slate-300/80 dark:border-white/20";
// Solid (NOT see-through) menu. The "!" makes sure no transparent class from the
// shared Dropdown component can win over it.
const solidMenu =
  "!bg-white dark:!bg-slate-900 border border-slate-300/80 dark:border-white/20 rounded-2xl shadow-xl min-w-[160px] z-50 backdrop-blur-none";
const primaryGradient = "from-indigo-500 via-purple-500 to-indigo-600";

const API = "http://127.0.0.1:8000/api";
// Delete one brand. If this ever returns 404, the older route used by the previous
// BrandPage was `${API}/brands/delete/${id}`.
const deleteUrl = (id) => `${API}/product-brands/${id}`;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

/* SweetAlert classes so the dialogs follow the theme (light + dark) */
const swalPopup = `${glassModal} rounded-2xl !text-slate-800 dark:!text-slate-100`;
const swalConfirm = `bg-gradient-to-r ${primaryGradient} text-white shadow-lg shadow-indigo-500/30`;
const swalDanger = "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/30";
const swalCancel = "bg-muted text-muted-foreground hover:bg-muted/80";

/* ==========================================================================
   MOTION + readable text selection
   ========================================================================== */
const MOTION_CSS = `
@keyframes pp-float { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-6px) rotate(3deg); } }
@keyframes pp-row-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes pp-wave { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.pp-float { animation: pp-float 3.2s ease-in-out infinite; }
.pp-row-in { animation: pp-row-in 0.28s ease-out both; }
.pp-wave-1 { animation: pp-wave 26s linear infinite; will-change: transform; }
.pp-wave-2 { animation: pp-wave 18s linear infinite reverse; will-change: transform; }
.pp-wave-3 { animation: pp-wave 12s linear infinite; will-change: transform; }
/* Selected text: keep the text colour and use a soft indigo highlight so it stays readable */
.pp-view ::selection { background: rgba(99, 102, 241, 0.35) !important; color: inherit !important; }
.pp-view ::-moz-selection { background: rgba(99, 102, 241, 0.35) !important; color: inherit !important; }
.pp-view select option { color: #0f172a; }
@media (prefers-reduced-motion: reduce) {
  .pp-float, .pp-row-in, .pp-wave-1, .pp-wave-2, .pp-wave-3 { animation: none !important; }
}
`;

const WAVE_PATH =
  "M0 80 Q180 20 360 80 T720 80 T1080 80 T1440 80 T1800 80 T2160 80 T2520 80 T2880 80 L2880 160 L0 160 Z";

const WaveBackground = memo(function WaveBackground() {
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
    { Icon: Tag, left: "8%", delay: "0s" },
    { Icon: Award, left: "34%", delay: "-1.1s" },
    { Icon: Store, left: "61%", delay: "-2.2s" },
    { Icon: Star, left: "86%", delay: "-0.6s" },
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

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const isActive = (v) => [true, 1, "1", "true"].includes(v);

/* ==========================================================================
   PAGE
   ========================================================================== */
const BrandPage = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const abortRef = useRef(null);
  const token = localStorage.getItem("token");
  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fetchBrands = useCallback(async () => {
    // Cancel any in-flight request so an old response can't overwrite a newer one
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      setError(false);
      const res = await axios.get(`${API}/product-brands`, {
        params: { page: currentPage, perPage: entriesPerPage, search: debouncedSearch, sortDir: "desc" },
        headers: authHeaders,
        signal: controller.signal,
      });

      const body = res.data;
      const list = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
      setBrands(list);
      setTotalPages(body?.meta?.last_page || 1);
      setTotalItems(body?.meta?.total || list.length);
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error("Error fetching brands:", err);
      setBrands([]);
      setTotalPages(1);
      setTotalItems(0);
      setError(true);
    } finally {
      if (abortRef.current === controller) setLoading(false);
    }
  }, [currentPage, entriesPerPage, debouncedSearch, authHeaders]);

  useEffect(() => {
    fetchBrands();
    return () => abortRef.current?.abort();
  }, [fetchBrands]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allSelected = brands.length > 0 && brands.every((b) => selectedSet.has(b.id));

  const toggleSelect = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]));

  const toggleSelectAll = () =>
    setSelectedIds((prev) =>
      allSelected
        ? prev.filter((id) => !brands.some((b) => b.id === id))
        : [...new Set([...prev, ...brands.map((b) => b.id)])]
    );

  // After deleting, step back a page if this page just became empty
  const refreshAfterDelete = (removedCount) => {
    if (brands.length - removedCount <= 0 && currentPage > 1) setCurrentPage((p) => p - 1);
    else fetchBrands();
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      customClass: { popup: swalPopup, confirmButton: swalDanger, cancelButton: swalCancel },
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await axios.delete(deleteUrl(id), { headers: authHeaders });
        setSelectedIds((prev) => prev.filter((sid) => sid !== id));
        Swal.fire({
          title: "Deleted!",
          text: "Brand has been deleted.",
          icon: "success",
          customClass: { popup: swalPopup, confirmButton: swalConfirm },
        });
        refreshAfterDelete(1);
      } catch (err) {
        console.error("Error deleting brand:", err);
        Swal.fire({
          title: "Error!",
          text: err.response?.data?.message || "Failed to delete the brand.",
          icon: "error",
          customClass: { popup: swalPopup, confirmButton: swalConfirm },
        });
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      Swal.fire({
        title: "Info",
        text: "No brands selected.",
        icon: "info",
        customClass: { popup: swalPopup, confirmButton: swalConfirm },
      });
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: `You want to delete ${selectedIds.length} selected brands?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete them!",
      cancelButtonText: "Cancel",
      customClass: { popup: swalPopup, confirmButton: swalDanger, cancelButton: swalCancel },
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await axios.post(`${API}/product-brand/bulk-delete`, { ids: selectedIds }, { headers: authHeaders });
        Swal.fire({
          title: "Deleted!",
          text: "Selected brands have been deleted.",
          icon: "success",
          customClass: { popup: swalPopup, confirmButton: swalConfirm },
        });
        const removedOnThisPage = brands.filter((b) => selectedSet.has(b.id)).length;
        setSelectedIds([]);
        refreshAfterDelete(removedOnThisPage);
      } catch (err) {
        console.error("Bulk delete error:", err);
        Swal.fire({
          title: "Error!",
          text: err.response?.data?.message || "Failed to delete selected brands.",
          icon: "error",
          customClass: { popup: swalPopup, confirmButton: swalConfirm },
        });
      }
    });
  };

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1;
  const endIndex = Math.min(currentPage * entriesPerPage, totalItems);

  return (
    <div className="w-full pp-view">
      <style>{MOTION_CSS}</style>
      <div className="w-full max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className={clsx("rounded-2xl overflow-hidden", glassCard, "shadow-xl shadow-black/5 dark:shadow-black/20")}>
          {/* HEADER + CONTROLS (wave behind) */}
          <div className="relative">
            <WaveBackground />
            <div className="relative z-10 px-6 py-4 border-b border-slate-300/80 dark:border-white/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold text-card-foreground">Brands</h1>
                  <p className="text-sm text-muted-foreground">Manage your brands</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <PermissionGuard permission="bulk_delete_brands">
                    <Button
                      variant="destructive"
                      disabled={selectedIds.length === 0}
                      onClick={handleBulkDelete}
                      leftIcon={<Trash2 size={14} />}
                      className="gap-2"
                    >
                      Bulk Delete ({selectedIds.length})
                    </Button>
                  </PermissionGuard>

                  <PermissionGuard permission="create_brands">
                    <Button
                      onClick={() => navigate("/add-brands")}
                      leftIcon={<Plus size={14} />}
                      className={clsx(
                        "gap-2 bg-gradient-to-r text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40",
                        primaryGradient
                      )}
                    >
                      Add Brand
                    </Button>
                  </PermissionGuard>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={fetchBrands}
                    aria-label="Refresh brands"
                    className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                  >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                  </Button>
                </div>
              </div>
            </div>

            <div className="relative z-10 px-6 pt-4 pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <label htmlFor="entries-per-page" className="text-sm text-muted-foreground whitespace-nowrap">
                    Show
                  </label>
                  <select
                    id="entries-per-page"
                    value={entriesPerPage}
                    onChange={(e) => {
                      setEntriesPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className={clsx(
                      "h-9 w-[90px] px-3 rounded-lg text-sm text-foreground cursor-pointer",
                      "focus:outline-none focus:ring-2 focus:ring-primary/40",
                      glassInput
                    )}
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">entries</span>
                </div>

                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                  <input
                    type="text"
                    placeholder="Search brands..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className={clsx(
                      "h-10 w-full pl-10 pr-9 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60",
                      "focus:outline-none focus:ring-2 focus:ring-primary/40",
                      glassInput
                    )}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                      aria-label="Clear search"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <Table className="min-w-[760px] w-full">
              <TableHeader className="bg-white/30 dark:bg-white/10 border-b border-slate-300/80 dark:border-white/20">
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-input text-primary focus:ring-primary accent-primary"
                      onChange={toggleSelectAll}
                      checked={allSelected}
                      aria-label="Select all brands"
                    />
                  </TableHead>
                  <TableHead className="font-medium text-foreground">Brand</TableHead>
                  <TableHead className="font-medium text-foreground">Slug</TableHead>
                  <TableHead className="font-medium text-foreground">Status</TableHead>
                  <TableHead className="w-24 text-right font-medium text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-b border-slate-300/80 dark:border-white/20">
                      {[0, 1, 2, 3, 4].map((c) => (
                        <TableCell key={c} className="p-3">
                          <div className="h-5 animate-pulse rounded-lg bg-slate-200/70 dark:bg-white/10" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-14 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10">
                        <AlertTriangle className="text-rose-500" size={22} />
                      </div>
                      <p className="font-medium text-foreground">Couldn't load brands</p>
                      <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
                      <Button
                        onClick={fetchBrands}
                        leftIcon={<RefreshCw size={14} />}
                        className={clsx("mt-4 gap-2 bg-gradient-to-r text-white", primaryGradient)}
                      >
                        Retry
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : brands.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-14 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                        <Tag className="text-primary" size={22} />
                      </div>
                      <p className="font-medium text-foreground">No brands found</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {debouncedSearch ? `No brands match "${debouncedSearch}"` : "No brands created yet"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  brands.map((brand, index) => (
                    <TableRow
                      key={brand.id}
                      className="pp-row-in hover:bg-primary/5 transition-colors border-b border-slate-300/80 dark:border-white/20"
                      style={{ animationDelay: `${Math.min(index, 9) * 30}ms` }}
                    >
                      <TableCell className="p-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-input text-primary focus:ring-primary accent-primary"
                          checked={selectedSet.has(brand.id)}
                          onChange={() => toggleSelect(brand.id)}
                          aria-label={`Select ${brand.brand_name}`}
                        />
                      </TableCell>

                      <TableCell className="p-3">
                        <div className="flex items-center gap-3">
                          {brand.logo ? (
                            <img
                              src={brand.logo}
                              alt={brand.brand_name}
                              loading="lazy"
                              decoding="async"
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-lg object-cover border border-border shadow-sm"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-border">
                              <Tag size={16} className="text-primary" />
                            </div>
                          )}
                          <p className="font-medium text-foreground truncate max-w-[260px]">{brand.brand_name}</p>
                        </div>
                      </TableCell>

                      <TableCell
                        className="p-3 font-mono text-sm text-muted-foreground truncate max-w-xs"
                        title={brand.slug}
                      >
                        {brand.slug}
                      </TableCell>

                      <TableCell className="p-3">
                        <Badge variant={isActive(brand.is_active) ? "success" : "inactive"} dot className="text-xs px-2 py-1">
                          {isActive(brand.is_active) ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>

                      <TableCell className="p-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="p-2 rounded-lg transition-colors hover:bg-primary/10 text-muted-foreground hover:text-primary"
                              aria-label={`Actions for ${brand.brand_name}`}
                              aria-haspopup="menu"
                            >
                              <MoreVertical size={16} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className={solidMenu}>
                            <PermissionGuard permission="create_role">
                              <DropdownMenuItem
                                onClick={() => navigate(`/edit-brands/${brand.id}`)}
                                className="flex items-center text-sm text-foreground hover:bg-primary/5 hover:text-primary"
                              >
                                <Edit className="mr-2 h-4 w-4 text-primary" /> Edit
                              </DropdownMenuItem>
                            </PermissionGuard>
                            <PermissionGuard permission="create_role">
                              <DropdownMenuItem
                                onClick={() => handleDelete(brand.id)}
                                className="flex items-center text-sm text-rose-500 hover:bg-rose-500/10 focus:text-rose-500"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </PermissionGuard>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* FOOTER */}
          <div className={clsx("px-6 py-4", glassCardHeader)}>
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              showFirstLast
              showPrevNext
              siblingCount={1}
              boundaryCount={1}
              showPageSize={false}
              pageSize={entriesPerPage}
              totalItems={totalItems}
              showTotal={false}
              className="w-full"
            />
            <div className="mt-3 text-sm text-muted-foreground">
              Showing {startIndex} to {endIndex} of {totalItems} entries
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandPage;