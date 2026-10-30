"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/Table";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import Swal from "sweetalert2";
import { Plus, Edit, Trash2, Eye, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Input from "../../ui/Input";
import PermissionGuard from "../../auth/PermissionGuard";

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDir, setSortDir] = useState("desc");
  const [totalItems, setTotalItems] = useState(0);
  const navigate = useNavigate();

  // Fetch banners from API
  const fetchBanners = async () => {
    try {
      const params = new URLSearchParams({
        page,
        perPage: entriesPerPage,
        sortDir,
        ...(searchTerm ? { search: searchTerm } : {}),
      });

      const res = await fetch(
        `http://127.0.0.1:8000/api/banners?${params}`
      );
      const data = await res.json();
      console.log("Fetched Banners:", data);

      if (data?.data) {
        setBanners(data.data);
        setTotalItems(data.total || data.meta?.total || data.data.length);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [page, entriesPerPage, searchTerm, sortDir]);

  const totalPages = Math.ceil(totalItems / entriesPerPage);
  const startIndex = (page - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalItems);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === banners.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(banners.map((b) => b.id));
    }
  };

  const handleEdit = (item) => navigate(`/edit-banner/${item.id}`);

  const handleView = (item) => {
    // const imageUrl = item.banner_image 
    //   ? `http://127.0.0.1:8000/storage/${item.banner_image}`
    //   : null;
    
    const imageUrl = item.banner_image
      ? `http://127.0.0.1:8000/storage/${item.banner_image}`
      : null;

    const statusText = item.is_active ? "✅ Active" : "❌ Inactive";
    const createdDate = new Date(item.created_at).toLocaleString();
    const updatedDate = new Date(item.updated_at).toLocaleString();
    const isDark = document.documentElement.classList.contains("dark");

    Swal.fire({
      title: "Banner Details",
      background: isDark ? "black" : "#fff",
      color: isDark ? "#fff" : "#000",
      html: `
      <div style="display:flex;flex-direction:column;align-items:center;${
        isDark ? "color:white;" : ""
      }">
        ${
          imageUrl
            ? `<img src="${imageUrl}" alt="Banner" style="width:100%;max-width:300px;margin-bottom:15px;object-fit:cover;box-shadow:0 2px 8px rgba(0,0,0,0.2);" />`
            : `<div style="width:100%;max-width:300px;height:200px;display:flex;align-items:center;justify-content:center;background:#f3f4f6;color:#6b7280;border:1px solid #ddd;margin-bottom:15px;">No Image</div>`
        }
        <table style="width:100%;border-collapse:collapse;font-size:14px;${
          isDark ? "color:white;" : ""
        }">
          <tr>
            <td style="font-weight:bold;padding:6px;">Position</td>
            <td>${item.position || "—"}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;padding:6px;">Target URL</td>
            <td>${
              item.target_url
                ? `<a href="${item.target_url}" target="_blank" style="color:${
                    isDark ? "#60a5fa" : "#2563eb"
                  }">${item.target_url}</a>`
                : "—"
            }</td>
          </tr>
          <tr>
            <td style="font-weight:bold;padding:6px;">Status</td>
            <td>${statusText}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;padding:6px;">Created At</td>
            <td>${createdDate}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;padding:6px;">Updated At</td>
            <td>${updatedDate}</td>
          </tr>
        </table>
      </div>
    `,
      confirmButtonText: "Close",
      width: "450px",
    });
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the banner permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await fetch(
          `http://127.0.0.1:8000/api/banners/${id}`,
          { method: "DELETE" }
        );
        setBanners((prev) => prev.filter((b) => b.id !== id));
        setTotalItems((prev) => prev - 1);
        Swal.fire("Deleted!", "Banner has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting banner:", error);
        Swal.fire("Error", "Something went wrong!", "error");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      Swal.fire("No Selection", "Please select at least one banner!", "info");
      return;
    }

    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete ${selectedIds.length} banners!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete all!",
    });

    if (confirm.isConfirmed) {
      try {
        await fetch(
          "http://127.0.0.1:8000/api/banner/bulk-delete",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: selectedIds }),
          }
        );
        setBanners((prev) => prev.filter((b) => !selectedIds.includes(b.id)));
        setSelectedIds([]);
        setTotalItems((prev) => prev - selectedIds.length);
        Swal.fire("Deleted!", "Selected banners have been deleted.", "success");
      } catch (error) {
        console.error("Error bulk deleting banners:", error);
        Swal.fire("Error", "Something went wrong!", "error");
      }
    }
  };

  const getStatusBadge = (is_active) =>
    is_active ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
    );

  const getPageNumbers = () => {
    let pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="space-y-4 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
        <div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            Banner Management
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Manage homepage banners and promotional graphics
          </p>
        </div>
        <div className="flex gap-2">
          <PermissionGuard permission="bulk_banners">
            <Button
              onClick={handleBulkDelete}
              className="bg-gray-600 hover:bg-gray-700"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Bulk Delete
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="create_banners">
            <Button
              onClick={() => navigate("/addbanner")}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Banner
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Top controls */}
      <div className="flex justify-between items-center mt-4 w-full max-w-full dark:text-white">
        <div>
          Show{" "}
          <select
            className="border p-1 rounded bg-transparent text-sm"
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>{" "}
          entries
        </div>
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Input
            placeholder="Search banners..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="hidden md:block w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <input
                  type="checkbox"
                  checked={
                    selectedIds.length === banners.length && banners.length > 0
                  }
                  onChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Banner Image</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Target URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners.length > 0 ? (
              banners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(banner.id)}
                      onChange={() => toggleSelect(banner.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <img
                      // src={`http://127.0.0.1:8000/storage/${banner.banner_image}`}
                      src={`http://127.0.0.1:8000/storage/${banner.banner_image}`}
                      alt="banner"
                      className="w-20 h-12 object-cover rounded"
                      onError={(e) => (e.target.src = "https://placehold.net/default.png")}
                    />
                  </TableCell>
                  <TableCell>{banner.position || "-"}</TableCell>
                  <TableCell className="truncate max-w-[200px]">
                    {banner.target_url ? (
                      <a
                        href={banner.target_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        {banner.target_url}
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(banner.is_active)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <PermissionGuard permission="view_banners">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(banner)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </PermissionGuard>
                      <PermissionGuard permission="edit_banners">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(banner)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </PermissionGuard>
                      <PermissionGuard permission="delete_banners">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(banner.id)}
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
                <TableCell colSpan={6} className="text-center py-4">
                  No banners found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 dark:text-white">
        <div>
          Showing {totalItems === 0 ? 0 : startIndex + 1} to {endIndex} of{" "}
          {totalItems} entries
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          {getPageNumbers().map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`px-3 py-1 border rounded ${
                num === page
                  ? "bg-red-600 text-white"
                  : "bg-transparent dark:text-white"
              }`}
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerManagement;
