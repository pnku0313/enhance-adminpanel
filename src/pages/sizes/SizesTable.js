"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Pencil, Trash2, Plus, Ruler } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import PermissionGuard from "../../components/auth/PermissionGuard";
import Button from "../../components/ui/Button";
import {
  FORM_CSS,
  WaveBackground,
  glassCard,
  hairline,
  primaryGradient,
  gradientBtn,
  tableContainerCls,
  tableHeaderCls,
  tableRowDivideCls,
  tableHeadCls,
  tableCellCls,
  inputCls,
  selectCls,
} from "./formTheme";

const SizesTable = () => {
  const [sizes, setSizes] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchSizes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://127.0.0.1:8000/api/product-sizes?page=${currentPage}&perPage=${perPage}&search=${searchTerm}&sortDir=desc`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        setSizes(data.data);
        if (data.meta) {
          setTotalPages(data.meta.last_page || 1);
          setTotalItems(data.meta.total || data.data.length);
        }
      } else {
        setSizes([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (err) {
      console.error("Error fetching sizes:", err);
      setSizes([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, searchTerm, token]);

  useEffect(() => {
    fetchSizes();
  }, [fetchSizes]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await fetch(
          `http://127.0.0.1:8000/api/product-sizes/${id}`,
          { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
        );
        fetchSizes();
        setSelectedIds(selectedIds.filter((sid) => sid !== id));
        Swal.fire("Deleted!", "Size has been deleted.", "success");
      } catch {
        Swal.fire("Error!", "Failed to delete size.", "error");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      Swal.fire("Info", "No sizes selected.", "info");
      return;
    }
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to delete ${selectedIds.length} selected sizes?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    });

    if (result.isConfirmed) {
      try {
        await Promise.all(
          selectedIds.map((id) =>
            fetch(
              `http://127.0.0.1:8000/api/product-sizes/${id}`,
              {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              }
            )
          )
        );
        fetchSizes();
        setSelectedIds([]);
        Swal.fire("Deleted!", "Selected sizes have been deleted.", "success");
      } catch {
        Swal.fire("Error!", "Failed to delete selected sizes.", "error");
      }
    }
  };

  const handleSelectAll = (e) => {
    const idsOnPage = sizes.map((size) => size.id);
    if (e.target.checked) {
      setSelectedIds([...new Set([...selectedIds, ...idsOnPage])]);
    } else {
      setSelectedIds(selectedIds.filter((id) => !idsOnPage.includes(id)));
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const startIndex = (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalItems);

  return (
    <div className="pp-form pp-view">
      <style>{FORM_CSS}</style>

      {/* HEADER with WaveBackground */}
      <div
        className={glassCard + " relative overflow-hidden rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/20"}
      >
        <WaveBackground />
        <div className="relative z-10 flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Variants / Sizes
            </p>
            <h1 className="mt-1 break-words text-2xl font-semibold text-card-foreground">
              Sizes
            </h1>
          </div>
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <PermissionGuard permission="bulk_delete_variants_sizes">
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Bulk Delete ({selectedIds.length})
                </Button>
              </PermissionGuard>
            )}
            <PermissionGuard permission="create_variants_sizes">
              <Button onClick={() => navigate("/add-size")} className={gradientBtn}>
                <Plus className="mr-2 h-4 w-4" /> Add Size
              </Button>
            </PermissionGuard>
          </div>
        </div>

        {/* Search & Per Page */}
        <div className="relative z-10 px-6 pb-5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Show</label>
            <select
              className={selectCls + " w-auto"}
              value={perPage}
              onChange={(e) => {
                setPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <label className="text-sm text-muted-foreground">entries</label>
          </div>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search sizes..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className={inputCls + " w-64 ml-2"}
            />
          </div>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className={glassCard + " rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/20"}>
        <div className={tableContainerCls}>
          <table className="w-full">
            <thead>
              <tr className={tableHeaderCls + " " + tableRowDivideCls}>
                <th className={tableHeadCls + " text-center"}>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      sizes.length > 0 &&
                      sizes.every((s) => selectedIds.includes(s.id))
                    }
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                  />
                </th>
                <th className={tableHeadCls}>ID</th>
                <th className={tableHeadCls}>Name</th>
                <th className={tableHeadCls}>Status</th>
                <th className={tableHeadCls}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted-foreground">
                    Loading sizes...
                  </td>
                </tr>
              ) : sizes.length > 0 ? (
                sizes.map((size) => (
                  <tr key={size.id} className={tableRowDivideCls}>
                    <td className={tableCellCls + " text-center"}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(size.id)}
                        onChange={() => handleSelectRow(size.id)}
                        className="rounded border-slate-300 text-primary focus:ring-primary"
                      />
                    </td>
                    <td className={tableCellCls + " dark:text-white"}>{size.id}</td>
                    <td className={tableCellCls + " dark:text-white"}>{size.name}</td>
                    <td className={tableCellCls}>
                      {size.status === 1 || size.status === true ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className={tableCellCls + " text-center"}>
                      <div className="flex items-center justify-center gap-2">
                        <PermissionGuard permission="edit_variants_sizes">
                          <button
                            onClick={() => navigate(`/edit-size/${size.id}`)}
                            className="text-blue-500 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            aria-label="Edit size"
                          >
                            <Pencil size={18} />
                          </button>
                        </PermissionGuard>
                        <PermissionGuard permission="delete_variants_sizes">
                          <button
                            onClick={() => handleDelete(size.id)}
                            className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            aria-label="Delete size"
                          >
                            <Trash2 size={18} />
                          </button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-muted-foreground">
                    No sizes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center px-6 py-4 border-t dark:border-white/10 flex-wrap gap-2">
          <div className="text-sm text-muted-foreground">
            Showing {totalItems === 0 ? 0 : startIndex + 1} to {endIndex} of {totalItems} entries
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Previous Button */}
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="gap-2"
            >
              <span>Previous</span>
            </Button>

            {/* First Page Always */}
            <Button
              variant={currentPage === 1 ? "default" : "outline"}
              onClick={() => setCurrentPage(1)}
              className="px-3 py-1.5"
            >
              1
            </Button>

            {/* Left Dots */}
            {currentPage > 3 && <span className="px-2 flex items-center text-muted-foreground">...</span>}

            {/* Dynamic Middle Pages */}
            {Array.from({ length: 3 }, (_, i) => {
              const pageNumber = currentPage - 1 + i;
              if (pageNumber > 1 && pageNumber < totalPages) {
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNumber)}
                    className="px-3 py-1.5"
                  >
                    {pageNumber}
                  </Button>
                );
              }
              return null;
            })}

            {/* Right Dots */}
            {currentPage < totalPages - 2 && (
              <span className="px-2 flex items-center text-muted-foreground">...</span>
            )}

            {/* Last Page Always */}
            {totalPages > 1 && (
              <Button
                variant={currentPage === totalPages ? "default" : "outline"}
                onClick={() => setCurrentPage(totalPages)}
                className="px-3 py-1.5"
              >
                {totalPages}
              </Button>
            )}

            {/* Next Button */}
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="gap-2"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizesTable;