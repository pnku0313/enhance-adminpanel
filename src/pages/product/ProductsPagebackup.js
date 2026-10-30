"use client";

import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Plus, Edit, Trash2, MoreVertical, Eye, X, Upload, Search, Package, ChevronLeft, ChevronRight,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PermissionGuard from "../../components/auth/PermissionGuard";
import { clsx } from "clsx";

// Design System Components
import {
  Button, Input, Select, Badge, Table, TableHeader, TableBody, TableRow, TableCell, TableHead,
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  Pagination, Skeleton, SkeletonGroup, EmptyState,
  PageHeader, PageHeaderActions, PageHeaderTitle,
} from "../../components/ui";

const ProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(queryParams.get("page")) || 1;
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(pageFromUrl);
  const perpageFromUrl = parseInt(queryParams.get("per_page"));
  const [entriesPerPage, setEntriesPerPage] = useState(perpageFromUrl || 10);
  const [products, setProducts] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockProductId, setStockProductId] = useState(null);
  const [tempStockValue, setTempStockValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchProducts = async (pageNo = 1, perPageCount = entriesPerPage, search = "") => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://127.0.0.1:8000/api/products?page=${pageNo}&perPage=${perPageCount}&search=${encodeURIComponent(search)}&sort=desc`
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
          sub_categories: item.sub_categories || [],
          child_categories: item.child_categories || [],
        }));
        setProducts(mapped);
        const uniqueCategories = [
          "All",
          ...new Set(mapped.flatMap((p) => p.categories.map((c) => c.name))),
        ];
        setCategories(uniqueCategories);
        setLastPage(data.meta?.last_page || 1);
        setTotal(data.meta?.total || mapped.length);
      }
    } catch (err) {
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page, entriesPerPage, searchTerm);
  }, [page, entriesPerPage, searchTerm]);

  const filteredProducts = useMemo(() =>
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.categories.some((cat) => cat.name === selectedCategory)),
  [products, selectedCategory]);

  const openStockModal = (product) => {
    setStockProductId(product.id);
    setTempStockValue(product.stock);
    setShowStockModal(true);
  };

  const confirmStockUpdate = () => {
    setShowStockModal(false);
    setTimeout(() => {
      Swal.fire({
        title: "Update Stock?",
        text: "Do you want to update the stock value?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          fetch(`http://127.0.0.1:8000/api/update-stock/${stockProductId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stock: parseInt(tempStockValue) || 0 }),
          })
            .then((res) => { if (!res.ok) throw new Error("Failed to update stock"); return res.json(); })
            .then(() => {
              setProducts((prev) =>
                prev.map((p) => p.id === stockProductId ? { ...p, stock: parseInt(tempStockValue) || 0 } : p)
              );
              toast.success("Stock updated successfully!", { position: "top-right", autoClose: 3000 });
            })
            .catch(() => { toast.error("Failed to update stock!", { position: "top-right", autoClose: 3000 }); });
        }
      });
    }, 100);
  };

  const deleteProduct = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Product will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    }).then((res) => {
      if (res.isConfirmed) {
        fetch(`http://127.0.0.1:8000/api/products/${id}`, { method: "DELETE" })
          .then((response) => {
            if (!response.ok) throw new Error("Delete failed");
            setProducts(products.filter((p) => p.id !== id));
            setSelectedIds(selectedIds.filter((sid) => sid !== id));
            toast.success("Product deleted successfully!", { position: "top-right", autoClose: 3000 });
          })
          .catch(() => { toast.error("Failed to delete product!", { position: "top-right", autoClose: 3000 }); });
      }
    });
  };

  const bulkDelete = () => {
    if (selectedIds.length === 0) return;
    Swal.fire({
      title: "Delete selected products?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete All",
      cancelButtonText: "Cancel",
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          const response = await fetch("http://127.0.0.1:8000/api/product/bulk-delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: selectedIds }),
          });
          if (!response.ok) throw new Error("Bulk delete failed");
          setProducts(products.filter((p) => !selectedIds.includes(p.id)));
          setSelectedIds([]);
          toast.success("Selected products deleted successfully!", { position: "top-right", autoClose: 3000 });
        } catch (error) {
          toast.error("Failed to delete selected products!", { position: "top-right", autoClose: 3000 });
        }
      }
    });
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/products/import", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Import failed");
      await response.json();
      toast.success("Products imported successfully!", { position: "top-right", autoClose: 3000 });
      fetchProducts(page, entriesPerPage, searchTerm);
    } catch (error) {
      toast.error("Failed to import products!", { position: "top-right", autoClose: 3000 });
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(filteredProducts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    }
  };

  const startIndex = total === 0 ? 0 : (page - 1) * entriesPerPage + 1;
  const endIndex = page * entriesPerPage > total ? total : page * entriesPerPage;

  return (
    <div className="w-full max-w-screen overflow-x-hidden">
      <div className="">
        {/* PAGE HEADER */}
        <PageHeader>
          <PageHeaderTitle>
            <h1 className="text-2xl font-bold text-foreground">Products</h1>
            <p className="text-muted-foreground mt-1">Manage your product catalogue</p>
          </PageHeaderTitle>
          <PageHeaderActions>
            <div className="flex items-center gap-2 flex-wrap">
              <PermissionGuard permission="import_product">
                <label className="cursor-pointer">
                  <Input
                    type="file"
                    id="file-upload"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleImport}
                  />
                  <Button variant="outline" leftIcon={<Upload size={14} />}>
                    Import
                  </Button>
                </label>
              </PermissionGuard>

              <PermissionGuard permission="create_product">
                <Button onClick={() => navigate("/addproduct")} leftIcon={<Plus size={14} />}>
                  Add Product
                </Button>
              </PermissionGuard>

              <Button
                variant="destructive"
                disabled={selectedIds.length === 0}
                onClick={bulkDelete}
                leftIcon={<Trash2 size={14} />}
              >
                Bulk Delete ({selectedIds.length})
              </Button>
            </div>
          </PageHeaderActions>
        </PageHeader>

        {/* MAIN CONTENT CARD */}
        <Card variant="default">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Products</CardTitle>
            <CardDescription>All products in your catalogue</CardDescription>
          </CardHeader>

          {/* CONTROLS ROW */}
          <CardContent className="pt-0 pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Show</span>
                <Select
                  value={entriesPerPage}
                  onValueChange={(value) => { setEntriesPerPage(Number(value)); setPage(1); }}
                  options={[
                    { value: "10", label: "10" },
                    { value: "20", label: "20" },
                    { value: "50", label: "50" },
                    { value: "100", label: "100" },
                  ]}
                  className="w-[80px]"
                />
                <span className="text-sm text-muted-foreground">entries</span>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  className="pl-10"
                  leftIcon={<Search size={14} className="text-muted-foreground" />}
                />
              </div>
            </div>

            {/* CATEGORY TABS */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedCategory(category)}
                    className={clsx(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                      "border border-border",
                      selectedCategory === category
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </CardContent>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                      checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      aria-label="Select all products"
                    />
                  </TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead className="text-right">Selling Price</TableHead>
                  <TableHead className="text-right">Total Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead className="w-48 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <SkeletonGroup count={5} variant="tableRow" />
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-12 text-center">
                      <EmptyState
                        illustration="products"
                        title="No products found"
                        description={searchTerm ? `No products match "${searchTerm}"` : "No products in your catalogue yet"}
                        action={
                          <PermissionGuard permission="create_product">
                            <Button onClick={() => navigate("/addproduct")} leftIcon={<Plus size={14} />}>
                              Add Product
                            </Button>
                          </PermissionGuard>
                        }
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((p) => (
                    <TableRow key={p.id} className="hover:bg-muted/50">
                      <TableCell className="p-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                          checked={selectedIds.includes(p.id)}
                          onChange={(e) => handleSelectOne(p.id, e.target.checked)}
                          aria-label={`Select ${p.name}`}
                        />
                      </TableCell>
                      <TableCell className="p-3">
                        <div className="flex items-center gap-3">
                          {p.image && p.image !== "/placeholder.svg" ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover border border-border"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center border border-border">
                              <Package size={16} className="text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate max-w-[200px]">{p.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-3 font-mono text-sm text-muted-foreground">{p.sku}</TableCell>
                      <TableCell className="p-3">
                        {p.image && p.image !== "/placeholder.svg" ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-12 h-12 rounded-lg object-cover border border-border"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center border border-border">
                            <Package size={16} className="text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="p-3 text-right font-mono font-medium text-foreground">
                        ₹{Number(p.selling_price).toLocaleString()}
                      </TableCell>
                      <TableCell className="p-3 text-right font-mono text-sm text-foreground">
                        {p.total_stock}
                      </TableCell>
                      <TableCell className="p-3">
                        <Badge
                          variant={p.status === "Active" ? "success" : "inactive"}
                          dot
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {p.categories?.map((cat) => (
                            <Badge key={cat.id} variant="secondary" className="text-xs">
                              {cat.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="p-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className={clsx(
                                "p-2 rounded-lg transition-colors",
                                "hover:bg-muted",
                                "text-muted-foreground hover:text-foreground"
                              )}
                              aria-label={`Actions for ${p.name}`}
                            >
                              <MoreVertical size={16} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <PermissionGuard permission="view_product">
                              <DropdownMenuItem
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  navigate(`/view-product/${p.id}?page=${page}&per_page=${entriesPerPage}`);
                                }}
                                leftIcon={<Eye size={14} />}
                              >
                                View
                              </DropdownMenuItem>
                            </PermissionGuard>
                            <PermissionGuard permission="edit_product">
                              <DropdownMenuItem
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  navigate(`/edit-product/${p.id}?page=${page}&per_page=${entriesPerPage}`);
                                }}
                                leftIcon={<Edit size={14} />}
                              >
                                Edit
                              </DropdownMenuItem>
                            </PermissionGuard>
                            <DropdownMenuSeparator />
                            <PermissionGuard permission="delete_product">
                              <DropdownMenuItem
                                onClick={() => deleteProduct(p.id)}
                                leftIcon={<Trash2 size={14} />}
                                className="text-destructive focus:text-destructive"
                              >
                                Delete
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

          {/* PAGINATION */}
          <CardFooter className="pt-3">
            <Pagination
              page={page}
              total={total}
              pageSize={entriesPerPage}
              siblingCount={1}
              boundaryCount={1}
              showPageSize
              pageSizeOptions={[10, 20, 50, 100]}
              onPageChange={setPage}
              onPageSizeChange={(size) => { setEntriesPerPage(size); setPage(1); }}
            />
          </CardFooter>
        </Card>
      </div>

      {/* STOCK MODAL */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md" variant="default">
            <CardHeader>
              <CardTitle>Edit Stock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="number"
                label="Stock Quantity"
                value={tempStockValue}
                onChange={(e) => setTempStockValue(e.target.value)}
                placeholder="Enter stock quantity"
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowStockModal(false)}
              >
                Cancel
              </Button>

              <Button onClick={confirmStockUpdate}>
                Confirm
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default ProductsPage;