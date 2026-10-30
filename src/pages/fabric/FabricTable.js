"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useNavigate, useSearchParams } from "react-router-dom";
import Input from "../../components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Package } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";
import PermissionGuard from "../../components/auth/PermissionGuard";
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

const FabricsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [fabrics, setFabrics] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFabrics, setSelectedFabrics] = useState([]);

  // ✅ page URL param se lo
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const [page, setPage] = useState(initialPage);

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const token = localStorage.getItem("token");

  // ✅ Jab bhi page change ho → URL update karo
  useEffect(() => {
    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    if (page !== currentPage) {
      searchParams.set("page", page);
      setSearchParams(searchParams, { replace: true });
    }
  }, [page, searchParams, setSearchParams]);

  // ✅ Jab bhi searchTerm change ho to page reset karo aur URL update ho
  useEffect(() => {
    if (searchTerm.trim() !== "") {
      setPage(1);
      searchParams.set("page", "1");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchTerm, searchParams, setSearchParams]);

  // Fetch fabrics from API
  const fetchFabrics = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/fabrics",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            perPage: itemsPerPage,
            page,
            search: searchTerm || undefined,
          },
        }
      );

      const data = res.data.data || [];
      const meta = res.data.meta || {};

      setFabrics(data);
      setTotalPages(meta.last_page || 1);
      setTotalItems(meta.total || 0);
      setStartIndex(meta.from ? meta.from - 1 : 0);
      setEndIndex(meta.to || 0);
    } catch (error) {
      console.error("Error fetching fabrics:", error.response || error);
    }
  }, [page, itemsPerPage, searchTerm, token]);

  useEffect(() => {
    fetchFabrics();
  }, [fetchFabrics]);

  // Delete single fabric
  const deleteFabric = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This fabric will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `http://127.0.0.1:8000/api/fabrics/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          Swal.fire("Deleted!", "The fabric has been deleted.", "success");
          fetchFabrics();
        } catch (error) {
          console.error("Error deleting fabric:", error.response || error);
          Swal.fire("Error", "Failed to delete the fabric.", "error");
        }
      }
    });
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (selectedFabrics.length === 0) return;

    Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete ${selectedFabrics.length} fabrics.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await Promise.all(
            selectedFabrics.map((id) =>
              axios.delete(
                `http://127.0.0.1:8000/api/fabrics/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              )
            )
          );
          Swal.fire(
            "Deleted!",
            "Selected fabrics have been deleted.",
            "success"
          );
          setSelectedFabrics([]);
          fetchFabrics();
        } catch (error) {
          console.error("Bulk delete error:", error.response || error);
          Swal.fire("Error", "Failed to delete selected fabrics.", "error");
        }
      }
    });
  };

  const areAllOnPageSelected =
    fabrics.length > 0 &&
    fabrics.every((fabric) => selectedFabrics.includes(fabric.id));

  const handleSelectAllFabrics = (e) => {
    const idsOnPage = fabrics.map((fabric) => fabric.id);
    if (e.target.checked) {
      setSelectedFabrics((prev) => [...new Set([...prev, ...idsOnPage])]);
    } else {
      setSelectedFabrics((prev) =>
        prev.filter((id) => !idsOnPage.includes(id))
      );
    }
  };

  const handleSelectFabric = (id) => {
    setSelectedFabrics((prev) =>
      prev.includes(id)
        ? prev.filter((fabricId) => fabricId !== id)
        : [...prev, id]
    );
  };

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
              Variants / Fabrics
            </p>
            <h1 className="mt-1 break-words text-2xl font-semibold text-card-foreground">
              Fabrics
            </h1>
          </div>
          <div className="flex gap-2">
            {selectedFabrics.length > 0 && (
              <PermissionGuard permission="bulk_delete_variants_fabric">
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Bulk Delete ({selectedFabrics.length})
                </Button>
              </PermissionGuard>
            )}
            <PermissionGuard permission="create_variants_fabric">
              <Button onClick={() => navigate("/add-fabric")} className={gradientBtn}>
                <Plus className="mr-2 h-4 w-4" /> Add New
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
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setPage(1);
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
            <Input
              placeholder="Search fabrics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={inputCls + " w-64 ml-2"}
            />
          </div>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className={glassCard + " rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/20"}>
        <CardContent className="p-0">
          <div className={tableContainerCls}>
            <Table>
              <TableHeader>
                <TableRow className={tableHeaderCls + " " + tableRowDivideCls}>
                  <TableHead className={tableHeadCls}>
                    <input
                      type="checkbox"
                      checked={areAllOnPageSelected}
                      onChange={handleSelectAllFabrics}
                      className="rounded border-slate-300 text-primary focus:ring-primary"
                    />
                  </TableHead>
                  <TableHead className={tableHeadCls}>Name</TableHead>
                  <TableHead className={tableHeadCls}>Slug</TableHead>
                  <TableHead className={tableHeadCls}>Status</TableHead>
                  <TableHead className={tableHeadCls}>Created At</TableHead>
                  <TableHead className={tableHeadCls}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fabrics.length > 0 ? (
                  fabrics.map((fabric) => (
                    <TableRow key={fabric.id} className={tableRowDivideCls}>
                      <TableCell className={tableCellCls + " text-center"}>
                        <input
                          type="checkbox"
                          checked={selectedFabrics.includes(fabric.id)}
                          onChange={() => handleSelectFabric(fabric.id)}
                          className="rounded border-slate-300 text-primary focus:ring-primary"
                        />
                      </TableCell>
                      <TableCell className={tableCellCls}>{fabric.name}</TableCell>
                      <TableCell className={tableCellCls}>{fabric.slug}</TableCell>
                      <TableCell className={tableCellCls}>
                        {fabric.status === true || fabric.status === 1 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            Inactive
                          </span>
                        )}
                      </TableCell>
                      <TableCell className={tableCellCls}>
                        {fabric.created_at
                          ? new Date(fabric.created_at).toLocaleString()
                          : "N/A"}
                      </TableCell>
                      <TableCell className={tableCellCls}>
                        <div className="flex items-center gap-2">
                          <PermissionGuard permission="edit_variants_fabric">
                            <button
                              onClick={() =>
                                navigate(
                                  `/edit-fabric/${fabric.id}?page=${page}&per_page=${itemsPerPage}`
                                )
                              }
                              className="text-blue-500 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              aria-label="Edit fabric"
                            >
                              <Pencil size={18} />
                            </button>
                          </PermissionGuard>
                          <PermissionGuard permission="delete_variants_fabric">
                            <Button
                              variant="ghost"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-colors"
                              onClick={() => deleteFabric(fabric.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </PermissionGuard>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No fabrics found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>

              {/* First Page */}
              <Button
                variant={page === 1 ? "default" : "outline"}
                onClick={() => setPage(1)}
                className="px-3 py-1.5"
              >
                1
              </Button>

              {/* Left Dots */}
              {page > 3 && <span className="px-2 flex items-center text-muted-foreground">...</span>}

              {/* Dynamic Middle Pages */}
              {Array.from({ length: 3 }, (_, i) => {
                const pageNumber = page - 1 + i;
                if (pageNumber > 1 && pageNumber < totalPages) {
                  return (
                    <Button
                      key={pageNumber}
                      variant={page === pageNumber ? "default" : "outline"}
                      onClick={() => setPage(pageNumber)}
                      className="px-3 py-1.5"
                    >
                      {pageNumber}
                    </Button>
                  );
                }
                return null;
              })}

              {/* Right Dots */}
              {page < totalPages - 2 && (
                <span className="px-2 flex items-center text-muted-foreground">...</span>
              )}

              {/* Last Page */}
              {totalPages > 1 && (
                <Button
                  variant={page === totalPages ? "default" : "outline"}
                  onClick={() => setPage(totalPages)}
                  className="px-3 py-1.5"
                >
                  {totalPages}
                </Button>
              )}

              {/* Next Button */}
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="gap-2"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </div>
  );
};

export default FabricsPage;