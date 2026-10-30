import React, { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import PermissionGuard from "../../components/auth/PermissionGuard";

const BrandTable = ({
  selectedBrands = [],
  onSelectBrand = () => {},
  onSelectAll = () => {},
  onDelete = () => {},
  onViewImage = () => {},
}) => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchBrands();
  }, [currentPage, entriesPerPage, searchTerm]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://127.0.0.1:8000/api/product-brands?page=${currentPage}&perPage=${entriesPerPage}&search=${searchTerm}&sortDir=desc`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        setBrands(data.data);
        if (data.meta) {
          setTotalPages(data.meta.last_page || 1);
          setTotalItems(data.meta.total || data.data.length);
        }
      } else {
        console.error("Unexpected API format:", data);
        setBrands([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      setBrands([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await fetch(
            `http://127.0.0.1:8000/api/product-brands/${id}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          fetchBrands();
          onDelete(id);
          Swal.fire("Deleted!", "Brand has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting brand:", error);
          Swal.fire("Error", "Failed to delete brand.", "error");
        }
      }
    });
  };

  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="overflow-x-auto rounded-lg p-4">
      {/* Search & Show Entries */}
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
        <div className="dark:text-white">
          <label className="mr-2">Show</label>
          <select
            value={entriesPerPage}
            onChange={handleEntriesChange}
            className="border border-gray-300 dark:bg-slate-600 rounded px-2 py-1"
          >
            {[10, 20, 50, 100].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
          <span className="ml-2">entries</span>
        </div>
        <div>
          <input
            type="text"
            placeholder="Search..."
            className="border border-gray-300 rounded px-2 py-1 w-48"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-6 text-center dark:text-white text-gray-500">
          Loading brands...
        </div>
      ) : (
        <table className="min-w-full divide-y">
          <thead>
            <tr>
              <th className="px-3 py-3 text-left">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 accent-blue-600 focus:ring-blue-500"
                  onChange={(e) => onSelectAll(e.target.checked)}
                  checked={
                    brands.length > 0 && selectedBrands.length === brands.length
                  }
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase dark:text-white">
                Brand Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase dark:text-white">
                Brand Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase dark:text-white">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase dark:text-white">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:text-white">
            {brands.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-8 text-center text-gray-500 dark:text-white"
                >
                  No brands found.
                </td>
              </tr>
            ) : (
              brands.map((brand) => (
                <tr key={brand.id}>
                  <td className="px-3 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedBrands.includes(brand.id)}
                      onChange={(e) =>
                        onSelectBrand(brand.id, e.target.checked)
                      }
                    />
                  </td>
                  <td className="px-6 py-4">
                    <img
                      className="h-12 w-12 rounded-lg object-cover cursor-pointer hover:opacity-80"
                      src={
                        brand.logo ||
                        "/placeholder.svg?height=48&width=48&query=brand-logo"
                      }
                      alt={brand.brand_name}
                      onClick={() => onViewImage(brand.logo)}
                    />
                  </td>
                  <td className="px-6 py-4">{brand.brand_name}</td>
                  <td
                    className="px-6 py-4 truncate max-w-xs"
                    title={brand.slug}
                  >
                    {brand.slug}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        brand.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {brand.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <PermissionGuard permission="create_role">
                        <button
                          onClick={() => navigate(`/edit-brands/${brand.id}`)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        >
                          <Edit size={16} />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permission="create_role">
                        <button
                          onClick={() => handleDeleteClick(brand.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-4">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
            {Math.min(currentPage * entriesPerPage, totalItems)} of {totalItems}{" "}
            entries
          </div>

          <div className="flex items-center gap-2">
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

            {[...Array(totalPages)].map((_, idx) => {
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
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === totalPages
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-red-500 hover:bg-gray-300"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandTable;
