"use client";

import { useState, useEffect, useMemo, useCallback, useRef, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Plus, Edit, Trash2, MoreVertical, Eye, X, Upload, Search, Package, Filter, RefreshCw,
  Shirt, Tag, ShoppingBag,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PermissionGuard from "../../components/auth/PermissionGuard";
import { clsx } from "clsx";

import {
  Button, Input, Badge, Table, TableHeader, TableBody, TableRow, TableCell, TableHead,
  Card, CardHeader, CardTitle, CardContent, CardFooter,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  Pagination, SkeletonGroup, EmptyState,
} from "../../components/ui";

/* ==========================================================================
   THEME
   PERFORMANCE: backdrop-filter (backdrop-blur-*) is very expensive. The old
   code stacked it on the page, cards, headers, inputs, table, dropdowns and
   modal, so the browser re-blurred huge areas on every scroll/hover.
   Now the glass look comes from semi-transparent backgrounds + borders only,
   and a single light blur is kept on the small header card.

   LINES: borders use slate-300/80 (light) and white/20 (dark) so the
   dividers are clearly visible on both backgrounds.
   ========================================================================== */
const glassCard = "bg-white/70 dark:bg-slate-900/60 border border-slate-300/80 dark:border-white/20";
const glassCardHeader = "bg-white/40 dark:bg-white/5 border-b border-slate-300/80 dark:border-white/20";
const glassDropdown = "bg-white/95 dark:bg-slate-900/95 border border-slate-300/80 dark:border-white/20";
const glassModal = "bg-white/95 dark:bg-slate-900/95 border border-slate-300/80 dark:border-white/20";
const glassInput = "bg-white/50 dark:bg-white/10 border border-slate-300/80 dark:border-white/20";

const primaryGradient = "from-indigo-500 via-purple-500 to-indigo-600";

const API_BASE = "http://127.0.0.1:8000/api";
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

const toastOpts = { position: "top-right", autoClose: 3000 };

/* ==========================================================================
   PRODUCT-THEMED MOTION (CSS only: transform/opacity, so it stays smooth)
   - pp-float : the package icon in the header bobs gently
   - pp-row-in: table rows drop in when a new page / search result loads
   All of it switches off for people who prefer reduced motion.
   ========================================================================== */
const MOTION_CSS = `
@keyframes pp-float { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-6px) rotate(3deg); } }
@keyframes pp-row-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.pp-float { animation: pp-float 3.2s ease-in-out infinite; }
.pp-row-in { animation: pp-row-in 0.28s ease-out both; }
@keyframes pp-wave { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.pp-wave-1 { animation: pp-wave 26s linear infinite; will-change: transform; }
.pp-wave-2 { animation: pp-wave 18s linear infinite reverse; will-change: transform; }
.pp-wave-3 { animation: pp-wave 12s linear infinite; will-change: transform; }
/* Selected text: keep the text colour and use a soft indigo highlight so it stays readable */
.pp-view ::selection { background: rgba(99, 102, 241, 0.35) !important; color: inherit !important; }
.pp-view ::-moz-selection { background: rgba(99, 102, 241, 0.35) !important; color: inherit !important; }
@media (prefers-reduced-motion: reduce) {
  .pp-float, .pp-row-in, .pp-wave-1, .pp-wave-2, .pp-wave-3 { animation: none !important; }
}
`;

/* Wavy background: three sine layers drifting at different speeds, with a few
   faint products bobbing on top. Sits behind the controls (pointer-events: none). */
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

/* Small debounce hook so we don't hit the API on every keystroke */
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* ==========================================================================
   ROW (memoized + owns its own dropdown state, so opening a menu no longer
   re-renders the entire table)
   ========================================================================== */
const ProductRow = memo(function ProductRow({ p, index, checked, onSelect, onView, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const hasImage = p.image && p.image !== "/placeholder.svg";

  return (
    <TableRow
      className="pp-row-in hover:bg-primary/5 transition-colors border-b border-slate-300/80 dark:border-white/20"
      style={{ animationDelay: `${Math.min(index, 9) * 30}ms` }}
    >
      <TableCell className="p-3">
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-input text-primary focus:ring-primary accent-primary"
          checked={checked}
          onChange={(e) => onSelect(p.id, e.target.checked)}
          aria-label={`Select ${p.name}`}
        />
      </TableCell>

      <TableCell className="p-3">
        <div className="flex items-center gap-3">
          {hasImage ? (
            <img
              src={p.image}
              alt={p.name}
              loading="lazy"
              decoding="async"
              width={40}
              height={40}
              className="w-10 h-10 rounded-lg object-cover border border-border shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-border">
              <Package size={16} className="text-primary" />
            </div>
          )}
          <p className="font-medium text-foreground truncate max-w-[260px]">{p.name}</p>
        </div>
      </TableCell>

      <TableCell className="p-3 font-mono text-sm text-muted-foreground">{p.sku}</TableCell>

      <TableCell className="p-3 text-right font-mono font-medium text-foreground">
        ₹{Number(p.selling_price).toLocaleString()}
      </TableCell>

      <TableCell className="p-3 text-right font-mono text-sm text-foreground">{p.total_stock}</TableCell>

      <TableCell className="p-3">
        <Badge variant={p.status === "Active" ? "success" : "inactive"} dot className="text-xs px-2 py-1">
          {p.status}
        </Badge>
      </TableCell>

      <TableCell className="p-3">
        <div className="flex items-center gap-1 flex-nowrap">
          {p.categories?.slice(0, 2).map((cat) => (
            <span key={cat.id} className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-400/30">
              {cat.name}
            </span>
          ))}
          {p.categories?.length > 2 && (
            <span
              className="text-xs font-medium text-muted-foreground whitespace-nowrap"
              title={p.categories.slice(2).map((c) => c.name).join(", ")}
            >
              +{p.categories.length - 2}
            </span>
          )}
        </div>
      </TableCell>

      <TableCell className="p-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={() => setOpen((o) => !o)}
              className={clsx(
                "p-2 rounded-lg transition-colors hover:bg-primary/10 text-muted-foreground hover:text-primary",
                open && "bg-primary/10 text-primary"
              )}
              aria-label={`Actions for ${p.name}`}
              aria-expanded={open}
              aria-haspopup="menu"
            >
              <MoreVertical size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={clsx(glassDropdown, "rounded-2xl shadow-xl min-w-[160px]")}
            open={open}
            onOpenChange={setOpen}
          >
            <PermissionGuard permission="view_product">
              <DropdownMenuItem
                onClick={() => { setOpen(false); onView(p.id); }}
                leftIcon={<Eye size={14} className="text-primary" />}
                className="text-foreground hover:bg-primary/5 hover:text-primary"
              >
                View
              </DropdownMenuItem>
            </PermissionGuard>
            <PermissionGuard permission="edit_product">
              <DropdownMenuItem
                onClick={() => { setOpen(false); onEdit(p.id); }}
                leftIcon={<Edit size={14} className="text-primary" />}
                className="text-foreground hover:bg-primary/5 hover:text-primary"
              >
                Edit
              </DropdownMenuItem>
            </PermissionGuard>
            <DropdownMenuSeparator className="border-slate-300/80 dark:border-white/20" />
            <PermissionGuard permission="delete_product">
              <DropdownMenuItem
                onClick={() => { setOpen(false); onDelete(p.id); }}
                leftIcon={<Trash2 size={14} className="text-rose-500" />}
                className="text-rose-500 hover:bg-rose-500/10 focus:text-rose-500"
              >
                Delete
              </DropdownMenuItem>
            </PermissionGuard>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});

/* ==========================================================================
   PAGE
   ========================================================================== */
const ProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(queryParams.get("page"), 10) || 1;
  const perPageFromUrl = parseInt(queryParams.get("per_page"), 10);
  // Only accept a page size we actually offer, otherwise fall back to 10
  const initialPerPage = PAGE_SIZE_OPTIONS.includes(perPageFromUrl) ? perPageFromUrl : DEFAULT_PAGE_SIZE;

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [page, setPage] = useState(pageFromUrl);
  const [entriesPerPage, setEntriesPerPage] = useState(initialPerPage);
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockProductId, setStockProductId] = useState(null);
  const [tempStockValue, setTempStockValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const abortRef = useRef(null);

  const fetchProducts = useCallback(async (pageNo, perPageCount, search) => {
    // Cancel any in-flight request so old responses can't overwrite newer ones
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE}/products?page=${pageNo}&perPage=${perPageCount}&search=${encodeURIComponent(search)}&sort=desc`,
        { signal: controller.signal }
      );
      const data = await res.json();
      if (data?.data) {
        const mapped = data.data.map((item) => ({
          id: item.id,
          image: item.banner_image || "/placeholder.svg",
          name: item.name || "N/A",
          sku: item.sku || "N/A",
          selling_price: item.selling_price || 0,
          stock: item.stock ?? 0,
          total_stock: item.total_stock ?? 0,
          status: item.is_active ? "Active" : "Inactive",
          categories: item.categories || [],
        }));
        setProducts(mapped);
        setCategories([
          "All",
          ...new Set(mapped.flatMap((p) => p.categories.map((c) => c.name))),
        ]);
        setLastPage(data.meta?.last_page || 1);
        setTotal(data.meta?.total || mapped.length);
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("API Error:", err);
      toast.error("Failed to load products", toastOpts);
    } finally {
      if (abortRef.current === controller) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(page, entriesPerPage, debouncedSearch);
    return () => abortRef.current?.abort();
  }, [page, entriesPerPage, debouncedSearch, fetchProducts]);

  const filteredProducts = useMemo(
    () =>
      selectedCategory === "All"
        ? products
        : products.filter((p) => p.categories.some((cat) => cat.name === selectedCategory)),
    [products, selectedCategory]
  );

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const confirmStockUpdate = useCallback(() => {
    setShowStockModal(false);
    setTimeout(() => {
      Swal.fire({
        title: "Update Stock?",
        text: "Do you want to update the stock value?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
        customClass: {
          popup: glassModal + " rounded-2xl",
          confirmButton: `bg-gradient-to-r ${primaryGradient} text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40`,
          cancelButton: "bg-muted text-muted-foreground hover:bg-muted/80",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          fetch(`${API_BASE}/update-stock/${stockProductId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stock: parseInt(tempStockValue, 10) || 0 }),
          })
            .then((res) => { if (!res.ok) throw new Error("Failed to update stock"); return res.json(); })
            .then(() => {
              setProducts((prev) =>
                prev.map((p) => (p.id === stockProductId ? { ...p, stock: parseInt(tempStockValue, 10) || 0 } : p))
              );
              toast.success("Stock updated successfully!", toastOpts);
            })
            .catch(() => toast.error("Failed to update stock!", toastOpts));
        }
      });
    }, 100);
  }, [stockProductId, tempStockValue]);

  const deleteProduct = useCallback((id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Product will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      customClass: {
        popup: glassModal + " rounded-2xl",
        confirmButton: "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40",
        cancelButton: "bg-muted text-muted-foreground hover:bg-muted/80",
      },
    }).then((res) => {
      if (res.isConfirmed) {
        fetch(`${API_BASE}/products/${id}`, { method: "DELETE" })
          .then((response) => {
            if (!response.ok) throw new Error("Delete failed");
            setProducts((prev) => prev.filter((p) => p.id !== id));
            setSelectedIds((prev) => prev.filter((sid) => sid !== id));
            toast.success("Product deleted successfully!", toastOpts);
          })
          .catch(() => toast.error("Failed to delete product!", toastOpts));
      }
    });
  }, []);

  const bulkDelete = useCallback(() => {
    if (selectedIds.length === 0) return;
    Swal.fire({
      title: "Delete selected products?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete All",
      cancelButtonText: "Cancel",
      customClass: {
        popup: glassModal + " rounded-2xl",
        confirmButton: "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40",
        cancelButton: "bg-muted text-muted-foreground hover:bg-muted/80",
      },
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          const response = await fetch(`${API_BASE}/product/bulk-delete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: selectedIds }),
          });
          if (!response.ok) throw new Error("Bulk delete failed");
          setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
          setSelectedIds([]);
          toast.success("Selected products deleted successfully!", toastOpts);
        } catch (error) {
          toast.error("Failed to delete selected products!", toastOpts);
        }
      }
    });
  }, [selectedIds]);

  const handleImport = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch(`${API_BASE}/products/import`, { method: "POST", body: formData });
      if (!response.ok) throw new Error("Import failed");
      await response.json();
      toast.success("Products imported successfully!", toastOpts);
      fetchProducts(page, entriesPerPage, debouncedSearch);
    } catch (error) {
      toast.error("Failed to import products!", toastOpts);
    } finally {
      e.target.value = ""; // allow re-importing the same file
    }
  }, [fetchProducts, page, entriesPerPage, debouncedSearch]);

  const handleSelectAll = useCallback((checked) => {
    setSelectedIds(checked ? filteredProducts.map((p) => p.id) : []);
  }, [filteredProducts]);

  const handleSelectOne = useCallback((id, checked) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((sid) => sid !== id)));
  }, []);

  const handleView = useCallback(
    (id) => navigate(`/view-product/${id}?page=${page}&per_page=${entriesPerPage}`),
    [navigate, page, entriesPerPage]
  );
  const handleEdit = useCallback(
    (id) => navigate(`/edit-product/${id}?page=${page}&per_page=${entriesPerPage}`),
    [navigate, page, entriesPerPage]
  );

  const changePageSize = useCallback((size) => {
    setEntriesPerPage(Number(size));
    setPage(1);
  }, []);

  const startIndex = total === 0 ? 0 : (page - 1) * entriesPerPage + 1;
  const endIndex = Math.min(page * entriesPerPage, total);

  return (
    <div className="w-full pp-view">
      <style>{MOTION_CSS}</style>
      {/* WIDTH FIX: replaced `container-wide` with an explicit wide container.
          max-w-7xl = 1280px. For "8xl" (not a default Tailwind size) use max-w-[90rem] = 1440px. */}
      <div className="w-full max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* MAIN CARD */}
        <div className={clsx("rounded-2xl overflow-hidden", glassCard, "shadow-xl shadow-black/5 dark:shadow-black/20")}>
          <div className="relative">
          <WaveBackground />
          <div className="relative z-10 px-6 py-4 border-b border-slate-300/80 dark:border-white/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-card-foreground">Products</h1>
                <p className="text-sm text-muted-foreground">Manage your product catalogue</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <PermissionGuard permission="import_product">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Input
                    type="file"
                    id="file-upload"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleImport}
                  />
                  <Button
                    variant="outline"
                    leftIcon={<Upload size={14} />}
                    className="gap-2 hover:bg-primary/5 hover:border-primary/30 hover:text-primary border-border"
                  >
                    Import
                  </Button>
                </label>
              </PermissionGuard>

              <PermissionGuard permission="create_product">
                <Button
                  onClick={() => navigate("/addproduct")}
                  leftIcon={<Plus size={14} />}
                  className={clsx(
                    "gap-2 bg-gradient-to-r", primaryGradient,
                    "text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40"
                  )}
                >
                  Add Product
                </Button>
              </PermissionGuard>

              <Button
                variant="destructive"
                disabled={selectedIds.length === 0}
                onClick={bulkDelete}
                leftIcon={<Trash2 size={14} />}
                className="gap-2"
              >
                Bulk Delete ({selectedIds.length})
              </Button>
            </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  fetchProducts(page, entriesPerPage, debouncedSearch);
                  toast.success("Refreshed!", { ...toastOpts, autoClose: 2000 });
                }}
                aria-label="Refresh products"
                className="text-muted-foreground hover:text-primary hover:bg-primary/10"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </Button>
              </div>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="relative z-10 px-6 pt-4 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* ENTRIES PER PAGE: native select, so the value always shows (10 / 25 / 50 / 100) */}
              <div className="flex items-center gap-3">
                <label htmlFor="entries-per-page" className="text-sm text-muted-foreground whitespace-nowrap">
                  Show
                </label>
                <select
                  id="entries-per-page"
                  value={entriesPerPage}
                  onChange={(e) => changePageSize(e.target.value)}
                  className={clsx(
                    "h-9 w-[90px] px-3 rounded-lg text-sm text-foreground cursor-pointer",
                    "focus:outline-none focus:ring-2 focus:ring-primary/40",
                    glassInput
                  )}
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n} className="text-slate-900">
                      {n}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-muted-foreground whitespace-nowrap">entries</span>
              </div>

              {/* SEARCH */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                <input
                  type="text"
                  placeholder="Search products, SKU, categories..."
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
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* CATEGORY TABS */}
            {categories.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={clsx(
                      "px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 border border-border",
                      selectedCategory === category
                        ? `bg-gradient-to-r ${primaryGradient} text-white shadow-md shadow-indigo-500/30`
                        : "text-muted-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/20"
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-white/30 dark:bg-white/10 border-b border-slate-300/80 dark:border-white/20">
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-input text-primary focus:ring-primary accent-primary"
                      checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      aria-label="Select all products"
                    />
                  </TableHead>
                  <TableHead className="font-medium text-foreground">Product</TableHead>
                  <TableHead className="font-medium text-foreground">SKU</TableHead>
                  <TableHead className="text-right font-medium text-foreground">Selling Price</TableHead>
                  <TableHead className="text-right font-medium text-foreground">Total Stock</TableHead>
                  <TableHead className="font-medium text-foreground">Status</TableHead>
                  <TableHead className="font-medium text-foreground">Categories</TableHead>
                  <TableHead className="w-24 text-right font-medium text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <SkeletonGroup count={5} variant="tableRow" />
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-16 text-center">
                      <EmptyState
                        illustration="products"
                        title="No products found"
                        description={
                          debouncedSearch ? `No products match "${debouncedSearch}"` : "No products in your catalogue yet"
                        }
                        action={
                          <PermissionGuard permission="create_product">
                            <Button
                              onClick={() => navigate("/addproduct")}
                              leftIcon={<Plus size={14} />}
                              className={clsx("gap-2 bg-gradient-to-r", primaryGradient, "text-white")}
                            >
                              Add Product
                            </Button>
                          </PermissionGuard>
                        }
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((p, i) => (
                    <ProductRow
                      key={p.id}
                      p={p}
                      index={i}
                      checked={selectedSet.has(p.id)}
                      onSelect={handleSelectOne}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={deleteProduct}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* PAGINATION
              showPageSize is OFF: the page-size picker above already does this, and the
              built-in one was the source of the duplicate / "0" display. */}
          <div className={clsx("px-6 py-4", glassCardHeader)}>
            <Pagination
              page={page}
              totalPages={lastPage}
              onPageChange={setPage}
              showFirstLast
              showPrevNext
              siblingCount={1}
              boundaryCount={1}
              showPageSize={false}
              pageSize={entriesPerPage}
              totalItems={total}
              showTotal={false}
              className="w-full"
            />
            <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
              <span>Showing {startIndex} to {endIndex} of {total} entries</span>
              {selectedCategory !== "All" && (
                <span className="flex items-center gap-1.5">
                  <Filter size={14} />
                  <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-400/30">
                    Filtered: {selectedCategory}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* STOCK MODAL (no backdrop blur on overlay) */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <Card className={clsx("w-full max-w-md rounded-2xl shadow-2xl", glassModal)} variant="ghost">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Package size={20} className="text-primary" />
                Edit Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className={clsx(glassInput, "rounded-xl p-4")}>
                <label className="block text-sm font-medium text-foreground mb-2">Stock Quantity</label>
                <Input
                  type="number"
                  value={tempStockValue}
                  onChange={(e) => setTempStockValue(e.target.value)}
                  placeholder="Enter stock quantity"
                  min="0"
                  className="w-full bg-transparent border-0 focus:ring-0 placeholder:text-muted-foreground/40"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-3 border-t border-slate-300/80 dark:border-white/20">
              <Button
                variant="ghost"
                onClick={() => setShowStockModal(false)}
                className="text-muted-foreground hover:text-foreground hover:bg-primary/5"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmStockUpdate}
                className={clsx("gap-2 bg-gradient-to-r", primaryGradient, "text-white shadow-lg shadow-indigo-500/30")}
              >
                Confirm
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default ProductsPage;