import React, { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/Table";
import { Edit, Trash2, Plus } from "lucide-react";
import Swal from "sweetalert2";
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import PermissionGuard from "../../../components/auth/PermissionGuard";

const HeadCategoriesTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDir, setSortDir] = useState("desc");

  const [totalItems, setTotalItems] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);

  const navigate = useNavigate();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/product-categories?page=${currentPage}&perPage=${perPage}&search=${searchTerm}&sortDir=${sortDir}`
      );
      const result = await response.json();

      setData(result.data || []);
      if (result.meta) {
        setCurrentPage(result.meta.current_page);
        setLastPage(result.meta.last_page);
        setTotalItems(result.meta.total);
        setFrom(result.meta.from || 0);
        setTo(result.meta.to || 0);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, perPage, searchTerm, sortDir]);

  const areAllSelected =
    data.length > 0 && data.every((item) => selectedIds.includes(item.id));

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = data.map((item) => item.id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleDelete = async (cat) => {
    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${cat.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmed.isConfirmed) {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/product-categories/${cat.id}`,
          { method: "DELETE" }
        );
        if (!response.ok) throw new Error("Failed to delete category.");
        await fetchCategories();
        Swal.fire("Deleted!", "Category has been deleted.", "success");
      } catch (error) {
        Swal.fire("Error", "Failed to delete category.", "error");
      }
    }
  };

  const handleBulkDelete = async () => {
    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete ${selectedIds.length} selected categories?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    });

    if (confirmed.isConfirmed) {
      try {
        await Promise.all(
          selectedIds.map((id) =>
            fetch(
              `http://127.0.0.1:8000/api/product-category/bulk-delete`,
              { method: "POST" }
            )
          )
        );
        await fetchCategories();
        setSelectedIds([]);
        Swal.fire(
          "Deleted!",
          "Selected categories have been deleted.",
          "success"
        );
      } catch (error) {
        Swal.fire("Error", "Failed to delete selected categories.", "error");
      }
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Card Header */}
      <CardHeader className="space-y-4">
        <div className="flex flex-col space-y-2">
          <CardTitle className="text-lg sm:text-xl">Main Categories</CardTitle>
          <CardDescription className="text-sm">
            Manage your top-level product categories
          </CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <div className="flex items-center rounded-md px-3 py-2 flex-1 min-w-0"></div>
          {selectedIds.length > 0 && (
            <PermissionGuard permission="bulk_delete_main_categories">
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={handleBulkDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Bulk Delete ({selectedIds.length})
              </Button>
            </PermissionGuard>
          )}
          <PermissionGuard permission="create_main_categories">
            <Button
              className="flex-shrink-0 w-full sm:w-auto"
              onClick={() => navigate("/add-headcategory")}
            >
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add Parent Category</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </PermissionGuard>
        </div>

        {/* Show per page + Search */}
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div className="flex items-center gap-2">
            <label>Show</label>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded p-1 text-sm mb-1 dark:bg-slate-500"
            >
              {[10, 25, 50, 100].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            <label>entries</label>
          </div>
          <div
            className="flex items-center px-3 py-2 w-full sm:w-64"
            style={{ width: "450px", marginRight: "-13px" }}
          >
            <Input
              placeholder="Search head categories..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="border-none p-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
            />
          </div>
        </div>
      </CardHeader>

      {/* Table */}
      <div className="overflow-x-auto w-full">
        <Table className="min-w-[640px] w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                  checked={areAllSelected}
                  onChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="min-w-[150px] w-[25%] text-black">
                Name
              </TableHead>
              <TableHead className="min-w-[150px] w-[35%]">
                Description
              </TableHead>
              <TableHead className="min-w-[150px] w-[20%] text-black">
                Slug
              </TableHead>
              <TableHead className="min-w-[100px] w-[20%] ">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-4 text-muted-foreground"
                >
                  No head categories found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                      checked={selectedIds.includes(cat.id)}
                      onChange={() => handleSelect(cat.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="truncate max-w-xs">
                    {cat.description}
                  </TableCell>
                  <TableCell>{cat.slug}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-start gap-2">
                      <PermissionGuard permission="edit_main_categories">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            (window.location.href = `/edit-headcategory/${cat.id}`)
                          }
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </PermissionGuard>
                      <PermissionGuard permission="delete_main_categories">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(cat)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </PermissionGuard>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 px-2 ">
          <div className="text-sm text-gray-600 dark:text-white ml-3 mb-4">
            Showing {totalItems === 0 ? 0 : from} to {to} of {totalItems}{" "}
            entries
          </div>
          <div className="flex gap-1 mr-3 mb-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-red-500 hover:bg-gray-300"
              }`}
            >
              Previous
            </button>
            {[...Array(lastPage)].map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded ${
                    currentPage === pageNum
                      ? "bg-red-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              disabled={currentPage === lastPage || lastPage === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === lastPage || lastPage === 0
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-red-500 hover:bg-gray-300"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeadCategoriesTable;
