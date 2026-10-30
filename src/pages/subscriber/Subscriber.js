// src/pages/subscribers/SubscribersTable.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Trash2, Search, Mail, UserCheck, UserX, Users, ChevronLeft, ChevronRight } from "lucide-react";
import Swal from "sweetalert2";

const API = "http://127.0.0.1:8000/api";
const PAGE_SIZES = [10, 20, 50, 100];

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

const formatDate = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString();
};

const isSubscribed = (s) => String(s.status || "").toUpperCase() === "SUBSCRIBED";

const pageList = (page, total) => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (page <= 3) return [1, 2, 3, "…", total];
  if (page >= total - 2) return [1, "…", total - 2, total - 1, total];
  return [1, "…", page - 1, page, page + 1, "…", total];
};

const SubscribersTable = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
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

  const fetchSubscribers = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      setError(false);
      const qs = new URLSearchParams({
        page: currentPage,
        perPage,
        search: searchTerm,
        sortDir: "desc",
      });
      const res = await fetch(`${API}/subscribers?${qs}`, {
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
            (s) => (s.name || "").toLowerCase().includes(q) || (s.email || "").toLowerCase().includes(q)
          );
        }
        setSubscribers(rows);
        setTotalPages(data.meta?.last_page || 1);
        setTotalItems(data.meta?.total ?? rows.length);
      } else {
        setSubscribers([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
      console.error("Error fetching subscribers:", err);
      setSubscribers([]);
      setTotalPages(1);
      setTotalItems(0);
      setError(true);
    } finally {
      if (abortRef.current === controller) setLoading(false);
    }
  }, [currentPage, perPage, searchTerm, token]);

  useEffect(() => {
    fetchSubscribers();
    return () => abortRef.current?.abort();
  }, [fetchSubscribers]);

  // After deleting rows, refresh — or step back if we emptied the last page
  const refreshAfterDelete = (removed) => {
    if (removed >= subscribers.length && currentPage > 1) setCurrentPage((p) => p - 1);
    else fetchSubscribers();
  };

  const confirmDelete = (title, text, confirmButtonText) =>
    Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#6366f1",
      confirmButtonText,
    });

  const handleDelete = async (id) => {
    const result = await confirmDelete("Are you sure?", "You want to delete this subscriber?", "Yes, delete it!");
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API}/subscribers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to delete subscriber.");
      }
      setSelectedIds((prev) => prev.filter((sid) => sid !== id));
      refreshAfterDelete(1);
      Swal.fire({ icon: "success", title: "Deleted!", text: "Subscriber has been deleted.", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire("Error!", err.message || "Failed to delete subscriber.", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      Swal.fire("Info", "No subscribers selected.", "info");
      return;
    }
    const result = await confirmDelete(
      "Are you sure?",
      `You want to delete ${selectedIds.length} subscribers?`,
      "Yes, delete them!"
    );
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API}/subscriber/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Bulk delete failed:", errData);
        Swal.fire("Error!", errData.message || "Failed to delete subscribers.", "error");
        return;
      }
      const removedOnPage = subscribers.filter((s) => selectedIds.includes(s.id)).length;
      setSelectedIds([]);
      refreshAfterDelete(removedOnPage);
      Swal.fire({ icon: "success", title: "Deleted!", text: "Subscribers deleted successfully.", timer: 1500, showConfirmButton: false });
    } catch (err) {
      console.error("Bulk delete error:", err);
      Swal.fire("Error!", "Something went wrong with bulk delete.", "error");
    }
  };

  const idsOnPage = subscribers.map((s) => s.id);
  const allOnPageSelected = subscribers.length > 0 && idsOnPage.every((id) => selectedIds.includes(id));

  const handleSelectAll = (e) =>
    setSelectedIds((prev) =>
      e.target.checked ? Array.from(new Set([...prev, ...idsOnPage])) : prev.filter((id) => !idsOnPage.includes(id))
    );

  const handleSelectRow = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]));

  const startIndex = (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + subscribers.length, totalItems);

  const pageSubscribed = subscribers.filter(isSubscribed).length;
  const tiles = [
    { title: "Total Subscribers", value: totalItems, icon: Users, tone: "from-indigo-500 to-purple-500" },
    { title: "Subscribed (this page)", value: pageSubscribed, icon: UserCheck, tone: "from-emerald-500 to-teal-500" },
    { title: "Unsubscribed (this page)", value: subscribers.length - pageSubscribed, icon: UserX, tone: "from-rose-500 to-pink-500" },
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
            <Mail className="pp-float absolute right-10 top-4 h-9 w-9 text-indigo-500/20" />
            <Users className="pp-float absolute right-32 top-10 h-7 w-7 text-purple-500/20" style={{ animationDelay: "1.2s" }} />
            <UserCheck className="pp-float absolute right-56 top-3 h-6 w-6 text-indigo-500/20" style={{ animationDelay: "2.4s" }} />
          </div>
          <div className="relative z-10 flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Marketing / Subscribers</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-card-foreground sm:text-3xl">Subscribers</h1>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">People who signed up for your newsletter</p>
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
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
                placeholder="Search name or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className={glassInput + " w-full pl-9 sm:w-80"}
              />
            </div>
          </div>

          <div className="overflow-x-auto px-2 sm:px-4">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className={lineB + " text-xs uppercase tracking-wide text-muted-foreground"}>
                  <th className="w-10 p-3">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={allOnPageSelected}
                      disabled={subscribers.length === 0}
                      aria-label="Select all subscribers on this page"
                      className="h-4 w-4 accent-indigo-500"
                    />
                  </th>
                  <th className="p-3 font-medium">ID</th>
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Email</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Subscribed At</th>
                  <th className="p-3 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(Math.min(perPage, 6))].map((_, i) => (
                    <tr key={`sk-${i}`} className={lineB}>
                      {[...Array(7)].map((__, j) => (
                        <td key={j} className="p-3">
                          <div className="pp-skel h-4 rounded-md bg-slate-300/60 dark:bg-white/10" style={{ width: j === 0 ? 16 : `${55 + ((i + j) % 3) * 15}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <p className="font-medium text-foreground">Couldn't load subscribers</p>
                      <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
                      <button
                        onClick={fetchSubscribers}
                        className="mt-4 h-10 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30"
                      >
                        Retry
                      </button>
                    </td>
                  </tr>
                ) : subscribers.length > 0 ? (
                  subscribers.map((s) => (
                    <tr key={s.id} className={lineB + " transition-colors hover:bg-primary/5"}>
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(s.id)}
                          onChange={() => handleSelectRow(s.id)}
                          aria-label={`Select ${s.email || s.id}`}
                          className="h-4 w-4 accent-indigo-500"
                        />
                      </td>
                      <td className="p-3 text-muted-foreground">#{s.id}</td>
                      <td className="p-3 font-medium">{s.name || "—"}</td>
                      <td className="p-3">{s.email}</td>
                      <td className="p-3">
                        <span
                          className={
                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium " +
                            (isSubscribed(s)
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                              : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300")
                          }
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">{formatDate(s.subscribed_at)}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDelete(s.id)}
                          title="Delete subscriber"
                          aria-label="Delete subscriber"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/30 text-rose-600 transition-colors hover:bg-rose-500/10 dark:text-rose-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      {searchTerm ? `No subscribers match “${searchTerm}”.` : "No subscribers found"}
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
                Showing {totalItems === 0 ? 0 : startIndex + 1} to {endIndex} of {totalItems} entries
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

export default SubscribersTable;