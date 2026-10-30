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
import { useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Palette } from "lucide-react";
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

const ColorsPage = () => {
  const navigate = useNavigate();
  const [colors, setColors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedColors, setSelectedColors] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const token = localStorage.getItem("token");

  // Fetch colors from API with backend pagination & search
  const fetchColors = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/product-colors",
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

      setColors(res.data.data || []);
      // setTotalPages(res.data.totalPages || 1);

      setTotalPages(
        res.data.meta?.last_page ??
        res.data.last_page ??
        res.data.totalPages ??
        1
      );
    } catch (error) {
      console.error("Error fetching colors:", error.response || error);
    }
  }, [page, itemsPerPage, searchTerm, token]);

  useEffect(() => {
    fetchColors();
  }, [fetchColors]);

  // Delete single color
  const deleteColor = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This color will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `http://127.0.0.1:8000/api/product-colors/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          Swal.fire("Deleted!", "The color has been deleted.", "success");
          fetchColors();
        } catch (error) {
          console.error("Error deleting color:", error.response || error);
          Swal.fire("Error", "Failed to delete the color.", "error");
        }
      }
    });
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (selectedColors.length === 0) return;

    Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete ${selectedColors.length} colors.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await Promise.all(
            selectedColors.map((id) =>
              axios.delete(
                `http://127.0.0.1:8000/api/product-colors/${id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              )
            )
          );
          Swal.fire(
            "Deleted!",
            "Selected colors have been deleted.",
            "success"
          );
          setSelectedColors([]);
          fetchColors();
        } catch (error) {
          console.error("Bulk delete error:", error.response || error);
          Swal.fire("Error", "Failed to delete selected colors.", "error");
        }
      }
    });
  };

  const areAllOnPageSelected =
    colors.length > 0 &&
    colors.every((color) => selectedColors.includes(color.id));

  const handleSelectAllColors = (e) => {
    if (e.target.checked) {
      const idsOnPage = colors.map((color) => color.id);
      setSelectedColors((prev) => [...new Set([...prev, ...idsOnPage])]);
    } else {
      const idsOnPage = colors.map((color) => color.id);
      setSelectedColors((prev) =>
        prev.filter((id) => !idsOnPage.includes(id))
      );
    }
  };

  const handleSelectColor = (id) => {
    setSelectedColors((prev) =>
      prev.includes(id)
        ? prev.filter((colorId) => colorId !== id)
        : [...prev, id]
    );
  };

  const swatchStyle = (color) => ({
    background: color.hexa_code_2
      ? `linear-gradient(135deg, ${color.hexa_code} 50%, ${color.hexa_code_2} 50%)`
      : color.hexa_code,
  });

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 py-4">
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
                Variants / Colors
              </p>
              <h1 className="mt-1 break-words text-2xl font-semibold text-card-foreground">
                Colors
              </h1>
            </div>
            <div className="flex gap-2">
              {selectedColors.length > 0 && (
                <PermissionGuard permission="bulk_delete_variants_colors">
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Bulk Delete ({selectedColors.length})
                  </Button>
                </PermissionGuard>
              )}
              <PermissionGuard permission="create_variants_colors">
                <Button onClick={() => navigate("/add-color")} className={gradientBtn}>
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
                placeholder="Search colors..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
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
                        onChange={handleSelectAllColors}
                        className="rounded border-slate-300 text-primary focus:ring-primary"
                      />
                    </TableHead>
                    <TableHead className={tableHeadCls}>Color</TableHead>
                    <TableHead className={tableHeadCls}>Name</TableHead>
                    <TableHead className={tableHeadCls}>Slug</TableHead>
                    <TableHead className={tableHeadCls}>Status</TableHead>
                    <TableHead className={tableHeadCls}>Created At</TableHead>
                    <TableHead className={tableHeadCls}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {colors.length > 0 ? (
                    colors.map((color) => (
                      <TableRow key={color.id} className={tableRowDivideCls}>
                        <TableCell className={tableCellCls + " text-center"}>
                          <input
                            type="checkbox"
                            checked={selectedColors.includes(color.id)}
                            onChange={() => handleSelectColor(color.id)}
                            className="rounded border-slate-300 text-primary focus:ring-primary"
                          />
                        </TableCell>
                        <TableCell className={tableCellCls}>
                          <span
                            className="inline-block h-6 w-6 rounded-full border border-border"
                            style={swatchStyle(color)}
                          />
                        </TableCell>
                        <TableCell className={tableCellCls}>{color.name}</TableCell>
                        <TableCell className={tableCellCls}>{color.slug}</TableCell>
                        <TableCell className={tableCellCls}>
                          {color.status === true || color.status === 1 ? (
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
                          {color.created_at
                            ? new Date(color.created_at).toLocaleString()
                            : "N/A"}
                        </TableCell>
                        <TableCell className={tableCellCls}>
                          <div className="flex items-center gap-2">
                            <PermissionGuard permission="edit_variants_colors">
                              <button
                                onClick={() => navigate(`/edit-color/${color.id}?page=${page}&per_page=${itemsPerPage}`)}
                                className="text-blue-500 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                aria-label="Edit color"
                              >
                                <Pencil size={18} />
                              </button>
                            </PermissionGuard>
                            <PermissionGuard permission="delete_variants_colors">
                              <Button
                                variant="ghost"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-colors"
                                onClick={() => deleteColor(color.id)}
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
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                        No colors found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center px-6 py-4 border-t dark:border-white/10">
              <Button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                variant="outline"
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                variant="outline"
                className="gap-2"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
    </div>
  );
};

export default ColorsPage;