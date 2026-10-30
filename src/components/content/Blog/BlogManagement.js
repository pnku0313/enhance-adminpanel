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

const BlogManagement = ({ onStatsUpdate }) => {
  const [blogs, setBlogs] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDir, setSortDir] = useState("desc");
  const [totalItems, setTotalItems] = useState(0);
  const navigate = useNavigate();

  const fetchBlogs = async () => {
    try {
      const params = new URLSearchParams({
        page,
        perPage: entriesPerPage,
        sortDir,
        ...(searchTerm ? { search: searchTerm } : {}),
      });

      const res = await fetch(
        `http://127.0.0.1:8000/api/blogs?${params}`
      );
      const data = await res.json();

      if (data?.data) {
        setBlogs(data.data);
        setTotalItems(data.total || data.meta?.total || data.data.length);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [page, entriesPerPage, searchTerm, sortDir]);

  useEffect(() => {
    if (onStatsUpdate) {
      const publishedBlogs = blogs.filter(
        (b) => b.status === "PUBLISHED"
      ).length;
      onStatsUpdate({ publishedBlogs });
    }
  }, [blogs, onStatsUpdate]);

  const totalPages = Math.ceil(totalItems / entriesPerPage);
  const startIndex = (page - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalItems);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === blogs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(blogs.map((b) => b.id));
    }
  };

  const handleEdit = (item) => navigate(`/edit-blog/${item.id}`);

  const handleView = (item) => {
    const imageUrl = `http://127.0.0.1:8000/storage/${item.image}`;
    const createdDate = new Date(item.created_at).toLocaleString();
    const updatedDate = new Date(item.updated_at).toLocaleString();
    const isDark = document.documentElement.classList.contains("dark");

    Swal.fire({
      title: item.title,
      background: isDark ? "black" : "#fff",
      color: isDark ? "#fff" : "#000",
      html: `
      <div style="display:flex;flex-direction:column;align-items:center;${
        isDark ? "color:white;" : ""
      }">
        <img src="${imageUrl}" alt="Blog" 
          style="width:100%;max-width:300px;margin-bottom:15px;
          object-fit:cover;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.3);" 
        />
        
        <!-- Main Info Table -->
        <table style="
          width:100%;
          border-collapse:collapse;
          font-size:14px;
          text-align:left;
          ${isDark ? "color:white;" : "color:black;"}
        ">
          <tbody>
            <tr><th style="padding:8px;border:1px solid #ccc;width:30%;">ID</th><td style="padding:8px;border:1px solid #ccc;">${
              item.id
            }</td></tr>
            <tr><th style="padding:8px;border:1px solid #ccc;">Title</th><td style="padding:8px;border:1px solid #ccc;">${
              item.title
            }</td></tr>
            <tr><th style="padding:8px;border:1px solid #ccc;">SEO Title</th><td style="padding:8px;border:1px solid #ccc;">${
              item.seo_title ?? "N/A"
            }</td></tr>
            <tr><th style="padding:8px;border:1px solid #ccc;">Excerpt</th><td style="padding:8px;border:1px solid #ccc;">${
              item.excerpt ?? "No excerpt"
            }</td></tr>
            <tr><th style="padding:8px;border:1px solid #ccc;">Slug</th><td style="padding:8px;border:1px solid #ccc;">${
              item.slug
            }</td></tr>
            <tr><th style="padding:8px;border:1px solid #ccc;">Meta Description</th><td style="padding:8px;border:1px solid #ccc;">${
              item.meta_description
            }</td></tr>
            <tr><th style="padding:8px;border:1px solid #ccc;">Meta Keywords</th><td style="padding:8px;border:1px solid #ccc;">${
              item.meta_keywords
            }</td></tr>
            <tr><th style="padding:8px;border:1px solid #ccc;">Status</th><td style="padding:8px;border:1px solid #ccc;">${
              item.status
            }</td></tr>
            <tr><th style="padding:8px;border:1px solid #ccc;">Featured</th><td style="padding:8px;border:1px solid #ccc;">${
              item.featured ? "Yes" : "No"
            }</td></tr>
            <tr><th style="padding:8px;border:1px solid #ccc;">Author</th><td style="padding:8px;border:1px solid #ccc;">${
              item.author?.name ?? "N/A"
            } (${item.author?.email ?? "N/A"})</td></tr>
            <tr><th style="padding:8px;border:1px solid #ccc;">Created At</th><td style="padding:8px;border:1px solid #ccc;">${createdDate}</td></tr>
            <tr><th style="padding:8px;border:1px solid #ccc;">Updated At</th><td style="padding:8px;border:1px solid #ccc;">${updatedDate}</td></tr>
          </tbody>
        </table>

        <!-- Body Section -->
        <h3 style="margin-top:20px;margin-bottom:10px;font-size:18px;text-align:left;width:100%;">Body</h3>
        <div style="
          width:100%;
          max-height:400px;
          overflow:auto;
          border:1px solid #ccc;
          border-radius:8px;
          padding:10px;
          background:${isDark ? "#1a1a1a" : "#fafafa"};
          text-align:left;
        ">
          ${item.body || "<p>No content available</p>"}
        </div>
      </div>
    `,
      confirmButtonText: "Close",
      width: "900px",
    });
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the blog permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await fetch(
          `http://127.0.0.1:8000/api/blogs/${id}`,
          { method: "DELETE" }
        );
        setBlogs((prev) => prev.filter((b) => b.id !== id));
        setTotalItems((prev) => prev - 1);
        Swal.fire("Deleted!", "Blog has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting blog:", error);
        Swal.fire("Error", "Something went wrong!", "error");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      Swal.fire("No Selection", "Please select at least one blog!", "info");
      return;
    }

    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete ${selectedIds.length} blogs!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete all!",
    });

    if (confirm.isConfirmed) {
      try {
        await fetch(
          "http://127.0.0.1:8000/api/blog/bulk-delete",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: selectedIds }),
          }
        );
        setBlogs((prev) => prev.filter((b) => !selectedIds.includes(b.id)));
        setSelectedIds([]);
        setTotalItems((prev) => prev - selectedIds.length);
        Swal.fire("Deleted!", "Selected blogs have been deleted.", "success");
      } catch (error) {
        console.error("Error bulk deleting blogs:", error);
        Swal.fire("Error", "Something went wrong!", "error");
      }
    }
  };

  const getStatusBadge = (status) => {
    let colorClasses =
      status === "PUBLISHED"
        ? "bg-green-100 text-green-800"
        : status === "DRAFT"
        ? "bg-gray-300 text-gray-900"
        : "bg-red-100 text-red-800";
    return <Badge className={colorClasses}>{status}</Badge>;
  };

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
            Blog Management
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Manage all blogs and articles
          </p>
        </div>
        <div className="flex gap-2">
          <PermissionGuard permission="bulk_blog">
            <Button
              onClick={handleBulkDelete}
              className="bg-gray-600 hover:bg-gray-700"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Bulk Delete
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="create_blog">
            <Button
              onClick={() => navigate("/addblog")}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Blog
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Controls */}
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
            placeholder="Search blogs..."
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
                    selectedIds.length === blogs.length && blogs.length > 0
                  }
                  onChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.length > 0 ? (
              blogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(blog.id)}
                      onChange={() => toggleSelect(blog.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <img
                      src={`http://127.0.0.1:8000/storage/${blog.image}`}
                      alt="blog"
                      className="w-20 h-12 object-cover rounded"
                      onError={(e) => (e.target.src = "/placeholder.jpg")}
                    />
                  </TableCell>
                  <TableCell>{blog.title}</TableCell>
                  <TableCell>{blog.author?.name ?? "N/A"}</TableCell>
                  <TableCell>{getStatusBadge(blog.status)}</TableCell>
                  <TableCell>
                    {new Date(blog.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <PermissionGuard permission="view_blog">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(blog)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </PermissionGuard>
                      <PermissionGuard permission="edit_blog">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(blog)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </PermissionGuard>
                      <PermissionGuard permission="delete_blog">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(blog.id)}
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
                <TableCell colSpan={7} className="text-center py-4">
                  No blogs found.
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

export default BlogManagement;
