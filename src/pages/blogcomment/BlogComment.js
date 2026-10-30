// src/components/content/Blog/BlogCommentsTable.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Trash2, Search, MessageSquare, CheckCircle2, Clock, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Swal from "sweetalert2";

const API = "http://127.0.0.1:8000/api";
const PAGE_SIZES = [10, 30, 50, 100];

const glassCard =
  "bg-white/70 dark:bg-slate-900/60 border border-slate-300/80 dark:border-white/20 shadow-xl shadow-black/5 dark:shadow-black/20";
const glassInput =
  "h-10 rounded-xl border border-slate-300/80 dark:border-white/20 bg-white/60 dark:bg-white/5 px-3 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20";
const lineB = "border-b border-slate-300/60 dark:border-white/10";
const navBtn =
  "inline-flex h-9 items-center gap-1 rounded-xl border border-slate-300/80 dark:border-white/20 bg-white/50 dark:bg-white/5 px-3 text-sm font-medium transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:pointer-events-none disabled:opacity-50";

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

const STATUS_STYLE = {
  approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  pending: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  rejected: "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

const formatDate = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString();
};

const pageList = (page, total) => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (page <= 3) return [1, 2, 3, "…", total];
  if (page >= total - 2) return [1, "…", total - 2, total - 1, total];
  return [1, "…", page - 1, page, page + 1, "…", total];
};

const BlogCommentsTable = () => {
  const [comments, setComments] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [range, setRange] = useState({ from: 0, to: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const abortRef = useRef(null);

  const token = localStorage.getItem("token");

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchComments = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      setError(false);
      const qs = new URLSearchParams({ page: currentPage, perPage, search: searchTerm });
      const res = await fetch(`${API}/post-comment?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data && Array.isArray(data.data)) {
        let rows = data.data;
        // Safety net in case the server ignores `search`
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          rows = rows.filter(
            (c) =>
              (c.guest_name || "").toLowerCase().includes(q) ||
              (c.guest_email || "").toLowerCase().includes(q) ||
              (c.body || "").toLowerCase().includes(q)
          );
        }
        setComments(rows);
        setTotalPages(data.meta?.last_page || 1);
        setTotalItems(data.meta?.total ?? rows.length);
        setRange({ from: data.meta?.from ?? null, to: data.meta?.to ?? null });
      } else {
        setComments([]);
        setTotalPages(1);
        setTotalItems(0);
        setRange({ from: 0, to: 0 });
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
      console.error("Error fetching comments:", err);
      setComments([]);
      setTotalPages(1);
      setTotalItems(0);
      setError(true);
    } finally {
      if (abortRef.current === controller) setLoading(false);
    }
  }, [currentPage, perPage, searchTerm, token]);

  useEffect(() => {
    fetchComments();
    return () => abortRef.current?.abort();
  }, [fetchComments]);

  // After deleting rows, refresh — or step back if we emptied the last page
  const refreshAfterDelete = (removed) => {
    if (removed >= comments.length && currentPage > 1) setCurrentPage((p) => p - 1);
    else fetchComments();
  };

  const confirmBox = (title, text, confirmButtonText, danger = true) =>
    Swal.fire({
      title,
      text,
      icon: danger ? "warning" : "question",
      showCancelButton: true,
      confirmButtonColor: danger ? "#e11d48" : "#6366f1",
      cancelButtonColor: danger ? "#6366f1" : "#64748b",
      confirmButtonText,
    });

  const handleDelete = async (id) => {
    const result = await confirmBox("Are you sure?", "You want to delete this comment?", "Yes, delete it!");
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API}/post-comment/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to delete comment.");
      }
      setSelectedIds((prev) => prev.filter((sid) => sid !== id));
      refreshAfterDelete(1);
      Swal.fire({ icon: "success", title: "Deleted!", text: "Comment has been deleted.", timer: 1500, showConfirmButton: false });
    } catch (err) {
      console.error("Delete error:", err);
      Swal.fire("Error!", err.message || "Failed to delete comment.", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      Swal.fire("Info", "No comments selected.", "info");
      return;
    }
    const result = await confirmBox("Are you sure?", `You want to delete ${selectedIds.length} comments?`, "Yes, delete them!");
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API}/post-comment/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to delete comments.");
      }
      const removedOnPage = comments.filter((c) => selectedIds.includes(c.id)).length;
      setSelectedIds([]);
      refreshAfterDelete(removedOnPage);
      Swal.fire({ icon: "success", title: "Deleted!", text: "Comments deleted successfully.", timer: 1500, showConfirmButton: false });
    } catch (err) {
      console.error("Bulk delete error:", err);
      Swal.fire("Error!", err.message || "Failed to delete comments.", "error");
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    const result = await confirmBox("Update Status?", `Change status to ${newStatus}?`, "Yes, update it!", false);
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API}/blog-comment/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to update status.");
      }
      // Update in place so the row doesn't jump while the table reloads
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
      Swal.fire({ icon: "success", title: "Updated!", text: `Status changed to ${newStatus}.`, timer: 1500, showConfirmButton: false });
    } catch (err) {
      console.error("Status update error:", err);
      Swal.fire("Error!", err.message || "Failed to update status.", "error");
    }
  };

  const idsOnPage = comments.map((c) => c.id);
  const allOnPageSelected = comments.length > 0 && idsOnPage.every((id) => selectedIds.includes(id));

  const handleSelectAll = (e) =>
    setSelectedIds((prev) =>
      e.target.checked ? Array.from(new Set([...prev, ...idsOnPage])) : prev.filter((id) => !idsOnPage.includes(id))
    );

  const handleSelectRow = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]));

  const startIndex = (currentPage - 1) * perPage;
  const from = totalItems === 0 || comments.length === 0 ? 0 : range.from ?? startIndex + 1;
  const to = comments.length === 0 ? 0 : range.to ?? Math.min(startIndex + comments.length, totalItems);

  const count = (st) => comments.filter((c) => c.status === st).length;
  const tiles = [
    { title: "Total Comments", value: totalItems, icon: MessageSquare, tone: "from-indigo-500 to-purple-500" },
    { title: "Approved (this page)", value: count("approved"), icon: CheckCircle2, tone: "from-emerald-500 to-teal-500" },
    { title: "Pending (this page)", value: count("pending"), icon: Clock, tone: "from-amber-500 to-orange-500" },
    { title: "Rejected (this page)", value: count("rejected"), icon: XCircle, tone: "from-rose-500 to-pink-500" },
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
            <MessageSquare className="pp-float absolute right-10 top-4 h-9 w-9 text-indigo-500/20" />
            <CheckCircle2 className="pp-float absolute right-32 top-10 h-7 w-7 text-purple-500/20" style={{ animationDelay: "1.2s" }} />
            <Clock className="pp-float absolute right-56 top-3 h-6 w-6 text-indigo-500/20" style={{ animationDelay: "2.4s" }} />
          </div>
          <div className="relative z-10 flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Content / Blog</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-card-foreground sm:text-3xl">Blog Comments</h1>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">Moderate what readers say on your posts</p>
            </div>
            <button
              onClick={handleBulkDelete}
              disabled={selectedIds.length === 0}
              className="inline-flex h-10 items-center gap-2 self-start rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-4 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition-opacity disabled:pointer-events-none disabled:opacity-50 sm:self-auto"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected{selectedIds.length ? ` (${selectedIds.length})` : ""}
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
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
          <div className={"flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 " + lineB}>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Show
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(parseInt(e.target.value, 10));
                  setCurrentPage(1);
                }}
                className={glassInput + " h-9 px-2"}
              >
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              entries
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search name, email or comment..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className={glassInput + " w-full pl-9 sm:w-80"}
              />
            </div>
          </div>

          <div className="overflow-x-auto px-2 sm:px-4">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className={lineB + " text-xs uppercase tracking-wide text-muted-foreground"}>
                  <th className="w-10 p-3">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={allOnPageSelected}
                      disabled={comments.length === 0}
                      aria-label="Select all comments on this page"
                      className="h-4 w-4 accent-indigo-500"
                    />
                  </th>
                  <th className="p-3 font-medium">Post</th>
                  <th className="p-3 font-medium">Guest Name</th>
                  <th className="p-3 font-medium">Email</th>
                  <th className="p-3 font-medium">Comment</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Created At</th>
                  <th className="p-3 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(Math.min(perPage, 6))].map((_, i) => (
                    <tr key={`sk-${i}`} className={lineB}>
                      {[...Array(8)].map((__, j) => (
                        <td key={j} className="p-3">
                          <div className="pp-skel h-4 rounded-md bg-slate-300/60 dark:bg-white/10" style={{ width: j === 0 ? 16 : `${55 + ((i + j) % 3) * 15}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <p className="font-medium text-foreground">Couldn't load comments</p>
                      <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
                      <button
                        onClick={fetchComments}
                        className="mt-4 h-10 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30"
                      >
                        Retry
                      </button>
                    </td>
                  </tr>
                ) : comments.length > 0 ? (
                  comments.map((c) => {
                    const postTitle = c.post?.data?.[0]?.title || "—";
                    return (
                      <tr key={c.id} className={lineB + " transition-colors hover:bg-primary/5"}>
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(c.id)}
                            onChange={() => handleSelectRow(c.id)}
                            aria-label={`Select comment ${c.id}`}
                            className="h-4 w-4 accent-indigo-500"
                          />
                        </td>
                        <td className="max-w-[12rem] p-3">
                          <div className="truncate font-medium" title={postTitle}>{postTitle}</div>
                        </td>
                        <td className="p-3">{c.guest_name || "—"}</td>
                        <td className="p-3">{c.guest_email || "—"}</td>
                        <td className="max-w-xs p-3">
                          <div className="line-clamp-2 break-words" title={c.body}>{c.body}</div>
                        </td>
                        <td className="p-3">
                          <select
                            value={c.status}
                            onChange={(e) => handleStatusUpdate(c.id, e.target.value)}
                            aria-label="Comment status"
                            className={
                              "h-8 cursor-pointer rounded-full border px-3 text-xs font-medium outline-none transition-colors focus:ring-2 focus:ring-primary/20 " +
                              (STATUS_STYLE[c.status] || STATUS_STYLE.rejected)
                            }
                          >
                            <option value="pending" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Pending</option>
                            <option value="approved" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Approved</option>
                            <option value="rejected" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Rejected</option>
                          </select>
                        </td>
                        <td className="whitespace-nowrap p-3 text-muted-foreground">{formatDate(c.created_at)}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDelete(c.id)}
                            title="Delete comment"
                            aria-label="Delete comment"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/30 text-rose-600 transition-colors hover:bg-rose-500/10 dark:text-rose-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      {searchTerm ? `No comments match “${searchTerm}”.` : "No comments found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Info + pagination */}
          {!error && (
            <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-300/80 p-4 dark:border-white/20 sm:flex-row sm:px-6">
              <div className="text-sm text-muted-foreground">
                Showing {from} to {to} of {totalItems} entries
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className={navBtn}>
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                {pageList(currentPage, totalPages).map((n, i) =>
                  n === "…" ? (
                    <span key={`d-${i}`} className="px-1 text-muted-foreground">…</span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => setCurrentPage(n)}
                      aria-current={currentPage === n ? "page" : undefined}
                      className={
                        "h-9 min-w-9 rounded-xl border px-3 text-sm font-medium transition-colors " +
                        (currentPage === n
                          ? "border-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                          : "border-slate-300/80 dark:border-white/20 bg-white/50 dark:bg-white/5 hover:border-primary/30 hover:bg-primary/5 hover:text-primary")
                      }
                    >
                      {n}
                    </button>
                  )
                )}
                <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className={navBtn}>
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogCommentsTable;