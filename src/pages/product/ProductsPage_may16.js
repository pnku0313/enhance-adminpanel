"use client";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import { Plus, Edit, Trash2, MoreVertical, Eye, X, Upload } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PermissionGuard from "../../components/auth/PermissionGuard";

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

  // stock modal
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockProductId, setStockProductId] = useState(null);
  const [tempStockValue, setTempStockValue] = useState("");

  // new states
  const [loading, setLoading] = useState(false);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // ✅ Fetch Products with backend pagination + search
  const fetchProducts = async (
    pageNo = 1,
    perPageCount = entriesPerPage,
    search = ""
  ) => {
    try {
      setLoading(true);
      const res = await fetch(
        // `http://127.0.0.1:8000/api/products?page=${pageNo}&perPage=${perPageCount}&search=${encodeURIComponent(
        //   search
        // )}&sort=desc`
        `http://127.0.0.1:8000/api/products?page=${pageNo}&perPage=${perPageCount}&search=${encodeURIComponent(
          search
        )}&sort=desc`
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
        }));
        setProducts(mapped);
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
          fetch(
            `http://127.0.0.1:8000/api/update-stock/${stockProductId}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ stock: parseInt(tempStockValue) || 0 }),
            }
          )
            .then((res) => {
              if (!res.ok) throw new Error("Failed to update stock");
              return res.json();
            })
            .then(() => {
              setProducts((prev) =>
                prev.map((p) =>
                  p.id === stockProductId
                    ? { ...p, stock: parseInt(tempStockValue) || 0 }
                    : p
                )
              );
              toast.success("Stock updated successfully!", {
                position: "top-right",
                autoClose: 3000,
              });
            })
            .catch(() => {
              toast.error("Failed to update stock!", {
                position: "top-right",
                autoClose: 3000,
              });
            });
        }
      });
    }, 100);
  };

  // ✅ Single Delete
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
        // fetch(`http://127.0.0.1:8000/api/products/${id}`, {
        //   method: "DELETE",
        // })
        fetch(`http://127.0.0.1:8000/api/products/${id}`, {
          method: "DELETE",
        })
          .then((response) => {
            if (!response.ok) throw new Error("Delete failed");
            setProducts(products.filter((p) => p.id !== id));
            setSelectedIds(selectedIds.filter((sid) => sid !== id));
            toast.success("Product deleted successfully!", {
              position: "top-right",
              autoClose: 3000,
            });
          })
          .catch(() => {
            toast.error("Failed to delete product!", {
              position: "top-right",
              autoClose: 3000,
            });
          });
      }
    });
  };

  // ✅ Bulk Delete (UPDATED with API integration)
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
          const response = await fetch(
            "http://127.0.0.1:8000/api/product/bulk-delete",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ids: selectedIds }),
            }
          );

          if (!response.ok) throw new Error("Bulk delete failed");

          setProducts(products.filter((p) => !selectedIds.includes(p.id)));
          setSelectedIds([]);
          toast.success("Selected products deleted successfully!", {
            position: "top-right",
            autoClose: 3000,
          });
        } catch (error) {
          toast.error("Failed to delete selected products!", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      }
    });
  };

  // ✅ Import Products
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        // "http://127.0.0.1:8000/api/products/import",
        "http://127.0.0.1:8000/api/products/import",

        { method: "POST", body: formData }
      );

      if (!response.ok) throw new Error("Import failed");
      const result = await response.json();

      console.log("✅ Imported Data:", result);

      toast.success("Products imported successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      fetchProducts(page, entriesPerPage, searchTerm); // refresh table after import
    } catch (error) {
      console.error("❌ Import Error:", error);
      toast.error("Failed to import products!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="w-full max-w-screen overflow-x-hidden">
      <div className="space-y-4 px-4 py-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Product</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Products</CardTitle>
              <div className="flex gap-3">
                {/* ✅ Import */}
                <PermissionGuard permission="import_product">
                  <div>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={handleImport}
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById("file-upload").click()
                      }
                    >
                      <Upload className="mr-2 h-4 w-4" /> Import
                    </Button>
                  </div>
                </PermissionGuard>
                <PermissionGuard permission="create_product">
                  <Button onClick={() => navigate("/addproduct")}>
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                  </Button>
                </PermissionGuard>

                <Button
                  variant={selectedIds.length > 0 ? "destructive" : "outline"}
                  disabled={selectedIds.length === 0}
                  onClick={bulkDelete}
                >
                  Bulk Delete
                </Button>
              </div>
            </div>

            {/* Entries & Search */}
            <div className="mt-4 flex justify-between items-center flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="border rounded px-2 py-1 dark:bg-slate-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>entries</span>
              </div>
              <div className="flex items-center px-2 py-1">
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="border-none p-0 ml-2 bg-transparent focus:ring-0 "
                  style={{ width: "300px" }}
                />
              </div>
            </div>
          </CardHeader>

          {/* Table */}
          <CardContent className="overflow-x-auto">
            <Table className="min-w-[800px] relative">
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === products.length &&
                        products.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(products.map((p) => p.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Total Variant Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds([...selectedIds, p.id]);
                          } else {
                            setSelectedIds(
                              selectedIds.filter((sid) => sid !== p.id)
                            );
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.sku}</TableCell>
                    <TableCell>₹{p.selling_price}</TableCell>
                    <TableCell>{p.total_stock}</TableCell>
                    <TableCell>
                      <span
                        className={
                          p.status === "Active"
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {p.status}
                      </span>
                    </TableCell>
                    <TableCell className="relative">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(
                              openDropdownId === p.id ? null : p.id
                            );
                          }}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        {openDropdownId === p.id && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 shadow-lg rounded border z-[9999]">
                            <PermissionGuard permission="view_product">
                              <button
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  navigate(
                                    `/view-product/${p.id}?page=${page}&per_page=${entriesPerPage}`
                                  );
                                }}
                                className="w-full px-3 py-2 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Eye className="mr-2 h-4 w-4" /> View
                              </button>
                            </PermissionGuard>
                            <PermissionGuard permission="edit_product">
                              <button
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  navigate(
                                    `/edit-product/${p.id}?page=${page}&per_page=${entriesPerPage}`
                                  );
                                }}
                                className="w-full px-3 py-2 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </button>
                            </PermissionGuard>
                            <PermissionGuard permission="delete_product">
                              <button
                                onClick={() => deleteProduct(p.id)}
                                className="w-full px-3 py-2 flex items-center text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </button>
                            </PermissionGuard>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>

          {/* Pagination */}
          {/* <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t">
            <div className="text-sm text-gray-600 dark:text-white ml-3 mb-4">
              Showing {total === 0 ? 0 : (page - 1) * entriesPerPage + 1} to{" "}
              {page * entriesPerPage > total ? total : page * entriesPerPage} of{" "}
              {total} entries
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              {[...Array(lastPage)].map((_, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={page === i + 1 ? "default" : "outline"}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                size="sm"
                disabled={page === lastPage}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div> */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t">
            <div className="text-sm text-gray-600 dark:text-white ml-3 mb-4">
              Showing {total === 0 ? 0 : (page - 1) * entriesPerPage + 1} to{" "}
              {page * entriesPerPage > total ? total : page * entriesPerPage} of{" "}
              {total} entries
            </div>

            <div className="flex gap-2">
              {/* Previous Button */}
              <Button
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>

              {/* First Page Always */}
              <Button
                size="sm"
                variant={page === 1 ? "default" : "outline"}
                onClick={() => setPage(1)}
              >
                1
              </Button>

              {/* Left dots */}
              {page > 3 && <span className="px-2 flex items-center">...</span>}

              {/* Dynamic Middle Pages */}
              {Array.from({ length: 3 }, (_, i) => {
                const pageNumber = page - 1 + i;
                if (pageNumber > 1 && pageNumber < lastPage) {
                  return (
                    <Button
                      key={pageNumber}
                      size="sm"
                      variant={page === pageNumber ? "default" : "outline"}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                }
                return null;
              })}

              {/* Right dots */}
              {page < lastPage - 2 && (
                <span className="px-2 flex items-center">...</span>
              )}

              {/* Last Page Always */}
              {lastPage > 1 && (
                <Button
                  size="sm"
                  variant={page === lastPage ? "default" : "outline"}
                  onClick={() => setPage(lastPage)}
                >
                  {lastPage}
                </Button>
              )}

              {/* Next Button */}
              <Button
                size="sm"
                disabled={page === lastPage}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Stock Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Edit Stock</h2>
              <button onClick={() => setShowStockModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <Input
              type="number"
              value={tempStockValue}
              onChange={(e) => setTempStockValue(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowStockModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={confirmStockUpdate}>Confirm</Button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default ProductsPage;
