import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../components/ui/Table";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { Eye, Edit, Trash2, Plus } from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/Card";
import PermissionGuard from "../../../components/auth/PermissionGuard";

const ParentCategories = () => {
  const navigate = useNavigate();
  const [parentCategories, setParentCategories] = useState([]);
  const [headCategories, setHeadCategories] = useState([]);
  const [selectedParents, setSelectedParents] = useState([]);

  // Pagination & search
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken");

  useEffect(() => {
    if (!token) return;

    fetch(
      "http://127.0.0.1:8000/api/product-sub-categories",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setParentCategories(data.data || []);
      })

      .catch((err) => {
        console.error("Error fetching parent categories:", err);
      });

    fetch(
      "http://127.0.0.1:8000/api/product-categories",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setHeadCategories(data.data || []);
      })
      .catch((err) => {
        console.error("Error fetching head categories:", err);
      });
  }, [token]);

  // Filtered data
  const filteredCategories = parentCategories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.parent_category?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const paginatedCategories = filteredCategories.slice(
    indexOfFirst,
    indexOfLast
  );
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const areAllOnPageSelected =
    paginatedCategories.length > 0 &&
    paginatedCategories.every((cat) => selectedParents.includes(cat.id));

  const handleSelectAllCategories = () => {
    if (areAllOnPageSelected) {
      setSelectedParents((prev) =>
        prev.filter((id) => !paginatedCategories.some((cat) => cat.id === id))
      );
    } else {
      const newIds = paginatedCategories
        .map((cat) => cat.id)
        .filter((id) => !selectedParents.includes(id));
      setSelectedParents((prev) => [...prev, ...newIds]);
    }
  };

  const handleSelectCategory = (id) => {
    setSelectedParents((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const deleteCategory = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the category.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (!result.isConfirmed) return;

      fetch(
        `http://127.0.0.1:8000/api/product-sub-categories/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data?.message || "Failed to delete");
          }

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
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    }).then((result) => {
      if (!result.isConfirmed) return;

      Promise.all(
        selectedParents.map((id) =>
          fetch(
            `http://127.0.0.1:8000/api/product-sub-categort/bulk-delete`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        )
      )
        .then((responses) => {
          const failed = responses.filter((res) => !res.ok);
          if (failed.length) {
            toast.error(`${failed.length} deletion(s) failed`);
          } else {
            Swal.fire(
              "Deleted!",
              "Selected categories were deleted.",
              "success"
            );
          }
          setParentCategories((prev) =>
            prev.filter((cat) => !selectedParents.includes(cat.id))
          );
          setSelectedParents([]);
        })
        .catch((err) => {
          console.error("Batch delete error:", err);
          toast.error("Error deleting selected categories.");
        });
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Card Header */}
      <CardHeader className="space-y-4">
        <div className="flex flex-col space-y-2">
          <CardTitle className="text-lg sm:text-xl">
            Parent Categories
          </CardTitle>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <div
            className="flex items-center rounded-md px-3 py-2 flex-1 min-w-0"
            // width kam kar di yahan
          ></div>
          {selectedParents.length > 0 && (
            <PermissionGuard permission="bulk_delete_parent_categories">
              <Button
                className="flex-shrink-0 w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white"
                onClick={handleBulkDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Bulk Delete ({selectedParents.length})
              </Button>
            </PermissionGuard>
          )}
          <PermissionGuard permission="create_parent_categories">
            <Button
              className="flex-shrink-0 w-full sm:w-auto"
              onClick={() => navigate("/add-parentcategory")}
            >
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add Parent Category</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </PermissionGuard>
        </div>
      </CardHeader>

      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
        <div>
          Show{" "}
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(parseInt(e.target.value, 10));
              setCurrentPage(1);
            }}
            className="border p-1 rounded bg-transparent"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>{" "}
          entries
        </div>
        <div className="flex items-center rounded-md px-3 py-2 flex-1 max-w-xs sm:max-w-sm">
          <Input
            placeholder="Search parent categories..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border p-1 rounded bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 w-full min-w-0"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full">
        <Table className="min-w-[800px] w-full" id="parent-categories-table">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                  checked={areAllOnPageSelected}
                  onChange={handleSelectAllCategories}
                />
              </TableHead>
              <TableHead className="min-w-[150px] w-[20%]">
                Head Category
              </TableHead>
              <TableHead className="min-w-[200px] w-[20%]">
                Parent Category Name
              </TableHead>
              <TableHead className="min-w-[150px] w-[20%]">Slug</TableHead>
              <TableHead className="min-w-[100px] w-[10%] text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedCategories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-4 text-muted-foreground"
                >
                  No parent categories found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedCategories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                      checked={selectedParents.includes(cat.id)}
                      onChange={() => handleSelectCategory(cat.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {cat.parent_category?.name || "N/A"}
                  </TableCell>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="font-medium">{cat.slug}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <PermissionGuard permission="edit_parent_categories">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            navigate(`/edit-parentcategory/${cat.id}`)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </PermissionGuard>
                      <PermissionGuard permission="delete_parent_categories">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteCategory(cat.id)}
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
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 text-sm">
        <div>
          Showing {paginatedCategories.length === 0 ? 0 : indexOfFirst + 1} to{" "}
          {indexOfFirst + paginatedCategories.length} of{" "}
          {filteredCategories.length} entries
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            size="sm"
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </Button>

          {/* Pagination with ellipsis */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((pageNum) => {
              return (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              );
            })
            .map((pageNum, idx, arr) => {
              const prev = arr[idx - 1];
              return (
                <React.Fragment key={pageNum}>
                  {prev && pageNum - prev > 1 && (
                    <span className="px-2">...</span>
                  )}
                  <Button
                    onClick={() => setCurrentPage(pageNum)}
                    size="sm"
                    className={`px-3 py-1 border rounded ${
                      currentPage === pageNum
                        ? "bg-red-600 text-white"
                        : "bg-transparent dark:text-white"
                    }`}
                  >
                    {pageNum}
                  </Button>
                </React.Fragment>
              );
            })}

          <Button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            size="sm"
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ParentCategories;
