"use client";
// src/pages/reviews/ReviewsPage.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/Dialog";
import {
  Star,
  Eye,
  MessageSquare,
  User,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Trash2,
  Power,
} from "lucide-react";
import Swal from "sweetalert2";
import PermissionGuard from "../../components/auth/PermissionGuard";

const API = "http://127.0.0.1:8000/api";
const PAGE_SIZES = [10, 20, 50, 100];

const glassCard =
  "bg-white/70 dark:bg-slate-900/60 border border-slate-300/80 dark:border-white/20 shadow-xl shadow-black/5 dark:shadow-black/20";
const glassInput =
  "h-10 rounded-xl border border-slate-300/80 dark:border-white/20 bg-white/60 dark:bg-white/5 px-3 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20";
const rowDivider = "border-b border-slate-300/60 dark:border-white/10";

const MOTION_CSS = `
.pp-view ::selection { background: rgba(99,102,241,.35); color: inherit; }
@keyframes pp-wave { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes pp-float { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-10px) rotate(6deg); } }
@keyframes pp-pulse { 0%,100% { opacity: .5; } 50% { opacity: 1; } }
.pp-wave { animation: pp-wave 14s linear infinite; }
.pp-wave.slow { animation-duration: 22s; }
.pp-float { animation: pp-float 6s ease-in-out infinite; }
.pp-skel { animation: pp-pulse 1.4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .pp-wave, .pp-float, .pp-skel { animation: none; } }
`;

const renderStars = (rating) => (
  <div className="flex items-center" aria-label={`${rating} out of 5`}>
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? "fill-current text-amber-400" : "text-slate-300 dark:text-slate-600"}`}
      />
    ))}
  </div>
);

const ReviewsPage = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReview, setSelectedReview] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [selectedReviews, setSelectedReviews] = useState([]);
  const abortRef = useRef(null);
  const token = localStorage.getItem("token");

  // Debounce the search box so we don't fire a request per keystroke
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchReviews = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      setError(false);
      const res = await axios.get(`${API}/product-reviews`, {
        params: { page, perPage: entriesPerPage, search: searchTerm, sortDir: "desc" },
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });

      if (res.data.success) {
        setReviews(
          res.data.data.map((item) => ({
            id: item.id,
            product_id: item.product_id,
            rating_value: item.rating_value,
            rating_title: item.rating_title || "",
            rating_desc: item.rating_desc || "",
            product: item.product?.name || `Product #${item.product_id}`,
            customer: item.user?.name || "Guest",
            email: item.user?.email || "N/A",
            rating: parseInt(item.rating_value) || 0,
            title: item.rating_title || "No Title",
            comment: item.rating_desc || "No Comment Provided",
            date: item.created_at,
            status: item.is_active === 1 ? 1 : 0,
          }))
        );
        setMeta(res.data.meta);
      } else {
        setReviews([]);
        setMeta(null);
      }
    } catch (err) {
      if (axios.isCancel(err) || err?.code === "ERR_CANCELED") return;
      console.error("Error fetching reviews:", err);
      setError(true);
    } finally {
      if (abortRef.current === controller) setLoading(false);
    }
  }, [page, entriesPerPage, searchTerm, token]);

  useEffect(() => {
    fetchReviews();
    return () => abortRef.current?.abort();
  }, [fetchReviews]);

  const handleStatusToggle = async (reviewId, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      const review = reviews.find((r) => r.id === reviewId);
      if (!review) return;

      await axios.patch(
        `${API}/product-reviews/${reviewId}/status`,
        {
          product_id: review.product_id,
          rating_value: review.rating_value,
          rating_title: review.rating_title,
          rating_desc: review.rating_desc,
          status: newStatus,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r)));
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: `Review has been ${newStatus === 1 ? "activated" : "deactivated"}`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Failed to update review status:", err);
      Swal.fire("Error!", err?.response?.data?.message || "Failed to update review status", "error");
    }
  };

  const handleView = (review) => {
    setSelectedReview(review);
    setShowViewDialog(true);
  };

  const getStatusBadge = (status) =>
    status === 1 ? (
      <Badge className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">Active</Badge>
    ) : (
      <Badge className="border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300">Inactive</Badge>
    );

  const handleBulkDelete = async () => {
    if (selectedReviews.length === 0) {
      Swal.fire("Warning!", "No reviews selected", "warning");
      return;
    }
    const confirmed = await Swal.fire({
      title: `Delete ${selectedReviews.length} review(s)?`,
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });
    if (!confirmed.isConfirmed) return;

    try {
      await axios.post(
        `${API}/product-review/bulk-delete`,
        { ids: selectedReviews },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire({ icon: "success", title: "Deleted!", text: "Selected reviews have been deleted", timer: 1500, showConfirmButton: false });
      // If we just emptied the last page, step back one page
      const removedAll = selectedReviews.length >= reviews.length && page > 1;
      setSelectedReviews([]);
      if (removedAll) setPage((p) => p - 1);
      else fetchReviews();
    } catch (err) {
      console.error("Bulk delete error:", err);
      Swal.fire("Error!", err?.response?.data?.message || "Failed to delete selected reviews", "error");
    }
  };

  const toggleSelectReview = (id) =>
    setSelectedReviews((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));

  const allOnPageSelected = reviews.length > 0 && reviews.every((r) => selectedReviews.includes(r.id));
  const toggleSelectAll = () => {
    const ids = reviews.map((r) => r.id);
    setSelectedReviews((prev) =>
      allOnPageSelected ? prev.filter((id) => !ids.includes(id)) : Array.from(new Set([...prev, ...ids]))
    );
  };

  const totalPages = meta?.last_page || 1;

  const renderPagination = () => {
    if (!meta) return null;
    const pageNumbers = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else if (page <= 3) {
      pageNumbers.push(1, 2, 3, "...", totalPages);
    } else if (page >= totalPages - 2) {
      pageNumbers.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
    } else {
      pageNumbers.push(1, "...", page, "...", totalPages);
    }

    const navBtn =
      "inline-flex h-9 items-center gap-1 rounded-xl border border-slate-300/80 dark:border-white/20 bg-white/50 dark:bg-white/5 px-3 text-sm font-medium transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:pointer-events-none disabled:opacity-50";

    return (
      <div className="flex flex-wrap items-center gap-2">
        <button disabled={page === 1} onClick={() => setPage(page - 1)} className={navBtn}>
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>
        {pageNumbers.map((num, idx) =>
          num === "..." ? (
            <span key={`dots-${idx}`} className="px-1 text-muted-foreground">…</span>
          ) : (
            <button
              key={num}
              onClick={() => setPage(num)}
              aria-current={page === num ? "page" : undefined}
              className={
                "h-9 min-w-9 rounded-xl border px-3 text-sm font-medium transition-colors " +
                (page === num
                  ? "border-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                  : "border-slate-300/80 dark:border-white/20 bg-white/50 dark:bg-white/5 hover:border-primary/30 hover:bg-primary/5 hover:text-primary")
              }
            >
              {num}
            </button>
          )
        )}
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className={navBtn}>
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  };

  // Stats: total comes from the server; the rest describe the current page only
  const pageAvg = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : "0";
  const tiles = [
    { title: "Total Reviews", value: meta?.total ?? 0, icon: MessageSquare, tone: "from-indigo-500 to-purple-500" },
    { title: "Active (this page)", value: reviews.filter((r) => r.status === 1).length, icon: ThumbsUp, tone: "from-emerald-500 to-teal-500" },
    { title: "Inactive (this page)", value: reviews.filter((r) => r.status === 0).length, icon: User, tone: "from-rose-500 to-pink-500" },
    { title: "Avg rating (this page)", value: pageAvg, icon: Star, tone: "from-amber-500 to-orange-500" },
  ];

  const from = reviews.length === 0 ? 0 : meta?.from ?? (page - 1) * entriesPerPage + 1;
  const to = meta?.to ?? from + reviews.length - 1;

  const details = selectedReview && [
    ["Product", selectedReview.product],
    ["Customer", selectedReview.customer],
    ["Email", selectedReview.email],
    ["Rating", null],
    ["Title", selectedReview.title],
    ["Comment", selectedReview.comment],
    ["Date", selectedReview.date ? new Date(selectedReview.date).toLocaleString() : "—"],
    ["Status", null],
  ];

  return (
    <div className="pp-view">
      <style>{MOTION_CSS}</style>
      <div className="mx-auto w-full max-w-[100rem] space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* HEADER */}
        <div className={glassCard + " relative overflow-hidden rounded-2xl"}>
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-600/10" />
            <div className="absolute inset-x-0 bottom-0 h-16 overflow-hidden opacity-60">
              <svg className="pp-wave absolute bottom-0 left-0 h-full w-[200%]" viewBox="0 0 1200 100" preserveAspectRatio="none">
                <path d="M0 50 Q150 0 300 50 T600 50 T900 50 T1200 50 V100 H0Z" className="fill-indigo-500/15" />
              </svg>
              <svg className="pp-wave slow absolute bottom-0 left-0 h-full w-[200%]" viewBox="0 0 1200 100" preserveAspectRatio="none">
                <path d="M0 65 Q150 20 300 65 T600 65 T900 65 T1200 65 V100 H0Z" className="fill-purple-500/15" />
              </svg>
            </div>
            <Star className="pp-float absolute right-10 top-4 h-9 w-9 text-indigo-500/20" />
            <MessageSquare className="pp-float absolute right-32 top-10 h-7 w-7 text-purple-500/20" style={{ animationDelay: "1.2s" }} />
            <ThumbsUp className="pp-float absolute right-56 top-3 h-6 w-6 text-indigo-500/20" style={{ animationDelay: "2.4s" }} />
          </div>
          <div className="relative z-10 px-6 py-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Catalogue / Reviews</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-card-foreground sm:text-3xl">Review Management</h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">Manage customer reviews and feedback</p>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {tiles.map(({ title, value, icon: Icon, tone }) => (
            <div key={title} className={glassCard + " flex items-center gap-4 rounded-2xl p-4"}>
              <div className={"flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg shadow-indigo-500/20 " + tone}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-muted-foreground">{title}</p>
                <p className="text-2xl font-semibold leading-tight text-card-foreground">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* TABLE CARD */}
        <div className={glassCard + " rounded-2xl"}>
          <div className={"flex flex-col gap-4 px-4 py-4 sm:px-6 " + rowDivider}>
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">Reviews</h2>
              <p className="text-sm text-muted-foreground">Manage and moderate customer reviews</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <PermissionGuard permission="bulk_delete_review">
                <Button size="sm" variant="destructive" onClick={handleBulkDelete} disabled={selectedReviews.length === 0}>
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Delete Selected{selectedReviews.length ? ` (${selectedReviews.length})` : ""}
                </Button>
              </PermissionGuard>
              <div className="flex flex-col gap-3 sm:ml-auto sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    placeholder="Search reviews..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className={glassInput + " w-full pl-9 sm:w-64"}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  Show
                  <select
                    value={entriesPerPage}
                    onChange={(e) => {
                      setEntriesPerPage(parseInt(e.target.value, 10));
                      setPage(1);
                    }}
                    className={glassInput + " h-9 px-2"}
                  >
                    {PAGE_SIZES.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  entries
                </label>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto px-2 sm:px-4">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className={rowDivider}>
                  <TableHead className="w-10 p-3">
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      onChange={toggleSelectAll}
                      disabled={reviews.length === 0}
                      aria-label="Select all reviews on this page"
                      className="h-4 w-4 accent-indigo-500"
                    />
                  </TableHead>
                  <TableHead className="p-3">Product</TableHead>
                  <TableHead className="p-3">Customer</TableHead>
                  <TableHead className="p-3">Rating</TableHead>
                  <TableHead className="p-3">Review</TableHead>
                  <TableHead className="p-3">Status</TableHead>
                  <TableHead className="p-3">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(Math.min(entriesPerPage, 6))].map((_, i) => (
                    <TableRow key={`sk-${i}`} className={rowDivider}>
                      {[...Array(7)].map((__, j) => (
                        <TableCell key={j} className="p-3">
                          <div className="pp-skel h-4 rounded-md bg-slate-300/60 dark:bg-white/10" style={{ width: j === 0 ? 16 : `${60 + ((i + j) % 3) * 15}%` }} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center">
                      <p className="font-medium text-foreground">Couldn't load reviews</p>
                      <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
                      <button
                        onClick={fetchReviews}
                        className="mt-4 h-10 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30"
                      >
                        Retry
                      </button>
                    </TableCell>
                  </TableRow>
                ) : reviews.length > 0 ? (
                  reviews.map((review) => (
                    <TableRow key={review.id} className={rowDivider + " transition-colors hover:bg-primary/5"}>
                      <TableCell className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedReviews.includes(review.id)}
                          onChange={() => toggleSelectReview(review.id)}
                          aria-label={`Select review ${review.id}`}
                          className="h-4 w-4 accent-indigo-500"
                        />
                      </TableCell>
                      <TableCell className="p-3 font-medium">{review.product}</TableCell>
                      <TableCell className="p-3">{review.customer}</TableCell>
                      <TableCell className="p-3">{renderStars(review.rating)}</TableCell>
                      <TableCell className="max-w-xs p-3">
                        <div className="truncate text-sm font-medium" title={review.title}>{review.title}</div>
                        <div className="truncate text-sm text-muted-foreground" title={review.comment}>{review.comment}</div>
                      </TableCell>
                      <TableCell className="p-3">{getStatusBadge(review.status)}</TableCell>
                      <TableCell className="p-3">
                        <div className="flex items-center gap-2">
                          <PermissionGuard permission="view_review">
                            <button
                              onClick={() => handleView(review)}
                              title="View details"
                              aria-label="View details"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300/80 dark:border-white/20 bg-white/50 dark:bg-white/5 transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </PermissionGuard>
                          <PermissionGuard permission="block_review">
                            <button
                              onClick={() => handleStatusToggle(review.id, review.status)}
                              className={
                                "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors " +
                                (review.status === 1
                                  ? "border-rose-500/40 text-rose-600 hover:bg-rose-500/10 dark:text-rose-300"
                                  : "border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-300")
                              }
                            >
                              <Power className="h-3.5 w-3.5" />
                              {review.status === 1 ? "Deactivate" : "Activate"}
                            </button>
                          </PermissionGuard>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                      {searchTerm ? `No reviews match “${searchTerm}”.` : "No reviews found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!error && (
            <div className={"flex flex-col items-center justify-between gap-4 border-t border-slate-300/80 p-4 dark:border-white/20 sm:flex-row sm:px-6"}>
              <div className="text-sm text-muted-foreground">
                Showing {from} to {reviews.length === 0 ? 0 : to} of {meta?.total ?? 0} entries
              </div>
              {renderPagination()}
            </div>
          )}
        </div>

        {/* View Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-lg rounded-2xl border border-slate-300/80 !bg-white dark:border-white/20 dark:!bg-slate-900">
            <DialogHeader>
              <DialogTitle>Review Details</DialogTitle>
            </DialogHeader>
            {selectedReview && (
              <dl className="mt-2 divide-y divide-slate-300/60 dark:divide-white/10">
                {details.map(([label, val]) => (
                  <div key={label} className="grid grid-cols-3 gap-3 py-2.5 text-sm">
                    <dt className="font-medium text-muted-foreground">{label}</dt>
                    <dd className="col-span-2 break-words text-foreground">
                      {label === "Rating" ? (
                        <span className="flex items-center gap-2">
                          {renderStars(selectedReview.rating)}
                          <span className="text-muted-foreground">{selectedReview.rating} / 5</span>
                        </span>
                      ) : label === "Status" ? (
                        getStatusBadge(selectedReview.status)
                      ) : (
                        val
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            <DialogFooter>
              <Button onClick={() => setShowViewDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ReviewsPage;