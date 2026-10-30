// src/pages/roles/RoleTable.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import { Shield, ShieldCheck, KeyRound, Plus, Search, Trash2, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import PermissionGuard from "../../components/auth/PermissionGuard";

const API = "http://127.0.0.1:8000/api";
const PAGE_SIZES = [10, 30, 50, 100];
const CHIP_LIMIT = 6;

const glassCard =
  "bg-white/70 dark:bg-slate-900/60 border border-slate-300/80 dark:border-white/20 shadow-xl shadow-black/5 dark:shadow-black/20";
const glassInput =
  "h-10 rounded-xl border border-slate-300/80 dark:border-white/20 bg-white/60 dark:bg-white/5 px-3 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20";
const lineB = "border-b border-slate-300/60 dark:border-white/10";
const navBtn =
  "inline-flex h-9 items-center gap-1 rounded-xl border border-slate-300/80 dark:border-white/20 bg-white/50 dark:bg-white/5 px-3 text-sm font-medium transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:pointer-events-none disabled:opacity-50";
const gradientBtn =
  "inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30";

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

const pageList = (page, total) => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (page <= 3) return [1, 2, 3, "…", total];
  if (page >= total - 2) return [1, "…", total - 2, total - 1, total];
  return [1, "…", page - 1, page, page + 1, "…", total];
};

export default function RoleTable() {
  const [roles, setRoles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [range, setRange] = useState({ from: 0, to: 0 });
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [expanded, setExpanded] = useState([]);
  const abortRef = useRef(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchRoles = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      setError(false);
      const qs = new URLSearchParams({ page: currentPage, perPage, search: searchTerm });
      const res = await fetch(`${API}/roles?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.data)) throw new Error(data?.message || `HTTP ${res.status}`);

      setRoles(data.data);
      setTotalPages(data.meta?.last_page || 1);
      setTotalItems(data.meta?.total ?? data.data.length);
      setRange({ from: data.meta?.from ?? 0, to: data.meta?.to ?? 0 });
    } catch (err) {
      if (err?.name === "AbortError") return;
      console.error("Error fetching roles:", err);
      setRoles([]);
      setError(true);
      toast.error("Failed to fetch roles.");
    } finally {
      if (abortRef.current === controller) setLoading(false);
    }
  }, [currentPage, perPage, searchTerm, token]);

  useEffect(() => {
    fetchRoles();
    return () => abortRef.current?.abort();
  }, [fetchRoles]);

  const refreshAfterDelete = (removed) => {
    if (removed >= roles.length && currentPage > 1) setCurrentPage((p) => p - 1);
    else fetchRoles();
  };

  const confirmDelete = (text, confirmButtonText) =>
    Swal.fire({
      title: "Are you sure?",
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#6366f1",
      confirmButtonText,
    });

  const handleDelete = async (roleId) => {
    const confirm = await confirmDelete("This role will be deleted permanently!", "Yes, delete it!");
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${API}/roles/${roleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.status !== false) {
        setSelectedRoles((prev) => prev.filter((id) => id !== roleId));
        refreshAfterDelete(1);
        Swal.fire({ icon: "success", title: "Deleted!", text: "Role deleted successfully.", timer: 1500, showConfirmButton: false });
      } else {
        Swal.fire("Error!", data.message || "Failed to delete role ❌", "error");
      }
    } catch (err) {
      console.error("Error deleting role:", err);
      Swal.fire("Error!", "Error deleting role ❌", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRoles.length === 0) {
      Swal.fire("Warning", "Please select at least one role!", "warning");
      return;
    }
    const confirm = await confirmDelete("Selected roles will be deleted permanently!", "Yes, delete them!");
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${API}/role/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids: selectedRoles }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.status !== false) {
        const removedOnPage = roles.filter((r) => selectedRoles.includes(r.id)).length;
        setSelectedRoles([]);
        refreshAfterDelete(removedOnPage);
        Swal.fire({ icon: "success", title: "Deleted!", text: "Selected roles deleted successfully.", timer: 1500, showConfirmButton: false });
      } else {
        Swal.fire("Error!", data.message || "Bulk delete failed ❌", "error");
      }
    } catch (err) {
      console.error("Error bulk deleting roles:", err);
      Swal.fire("Error!", "Error deleting roles ❌", "error");
    }
  };

  const idsOnPage = roles.map((r) => r.id);
  const allOnPageSelected = roles.length > 0 && idsOnPage.every((id) => selectedRoles.includes(id));

  const toggleSelectRole = (id) =>
    setSelectedRoles((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));

  const toggleSelectAll = () =>
    setSelectedRoles((prev) =>
      allOnPageSelected ? prev.filter((id) => !idsOnPage.includes(id)) : Array.from(new Set([...prev, ...idsOnPage]))
    );

  const toggleExpanded = (id) =>
    setExpanded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const permsOnPage = roles.reduce((n, r) => n + (Array.isArray(r.permissions) ? r.permissions.length : 0), 0);
  const tiles = [
    { title: "Total Roles", value: totalItems, icon: Shield, tone: "from-indigo-500 to-purple-500" },
    { title: "Permissions (this page)", value: permsOnPage, icon: KeyRound, tone: "from-emerald-500 to-teal-500" },
    { title: "Selected", value: selectedRoles.length, icon: ShieldCheck, tone: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="pp-view">
      <style>{MOTION_CSS}</style>
      <div className="mx-auto w-full max-w-[90rem] space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
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
            <Shield className="pp-float absolute right-10 top-4 h-9 w-9 text-indigo-500/20" />
            <KeyRound className="pp-float absolute right-32 top-10 h-7 w-7 text-purple-500/20" style={{ animationDelay: "1.2s" }} />
            <ShieldCheck className="pp-float absolute right-56 top-3 h-6 w-6 text-indigo-500/20" style={{ animationDelay: "2.4s" }} />
          </div>
          <div className="relative z-10 flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Access / Roles</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-card-foreground sm:text-3xl">Roles</h1>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">Control who can do what in the admin panel</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <PermissionGuard permission="create_role">
                <button onClick={() => navigate("/add-roles")} className={gradientBtn}>
                  <Plus className="h-4 w-4" /> Add New Role
                </button>
              </PermissionGuard>
              {/* NOTE: kept the original "view_role" permission on bulk delete */}
              <PermissionGuard permission="view_role">
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedRoles.length === 0}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-4 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition-opacity disabled:pointer-events-none disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Bulk Delete{selectedRoles.length ? ` (${selectedRoles.length})` : ""}
                </button>
              </PermissionGuard>
            </div>
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
                placeholder="Search roles..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className={glassInput + " w-full pl-9 sm:w-80"}
              />
            </div>
          </div>

          <div className="overflow-x-auto px-2 sm:px-4">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className={lineB + " text-xs uppercase tracking-wide text-muted-foreground"}>
                  <th className="w-10 p-3">
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      onChange={toggleSelectAll}
                      disabled={roles.length === 0}
                      aria-label="Select all roles on this page"
                      className="h-4 w-4 accent-indigo-500"
                    />
                  </th>
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Permissions</th>
                  <th className="p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(Math.min(perPage, 5))].map((_, i) => (
                    <tr key={`sk-${i}`} className={lineB}>
                      {[...Array(4)].map((__, j) => (
                        <td key={j} className="p-3">
                          <div className="pp-skel h-4 rounded-md bg-slate-300/60 dark:bg-white/10" style={{ width: j === 0 ? 16 : `${50 + ((i + j) % 3) * 20}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <p className="font-medium text-foreground">Couldn't load roles</p>
                      <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
                      <button onClick={fetchRoles} className={gradientBtn + " mt-4 px-5"}>Retry</button>
                    </td>
                  </tr>
                ) : roles.length > 0 ? (
                  roles.map((role) => {
                    const perms = Array.isArray(role.permissions) ? role.permissions : [];
                    const open = expanded.includes(role.id);
                    const shown = open ? perms : perms.slice(0, CHIP_LIMIT);
                    return (
                      <tr key={role.id} className={lineB + " align-top transition-colors hover:bg-primary/5"}>
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedRoles.includes(role.id)}
                            onChange={() => toggleSelectRole(role.id)}
                            aria-label={`Select ${role.name}`}
                            className="h-4 w-4 accent-indigo-500"
                          />
                        </td>
                        <td className="p-3 font-medium">{role.name}</td>
                        <td className="p-3">
                          {perms.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-1.5">
                              {shown.map((perm) => (
                                <span
                                  key={perm.id}
                                  className="max-w-[12rem] truncate rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300"
                                  title={perm.name}
                                >
                                  {perm.name}
                                </span>
                              ))}
                              {perms.length > CHIP_LIMIT && (
                                <button
                                  onClick={() => toggleExpanded(role.id)}
                                  className="rounded-full border border-slate-300/80 px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary dark:border-white/20"
                                >
                                  {open ? "Show less" : `+${perms.length - CHIP_LIMIT} more`}
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <PermissionGuard permission="edit_role">
                              <button
                                onClick={() => navigate(`/edit-roles/${role.id}`)}
                                title="Edit role"
                                aria-label="Edit role"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300/80 bg-white/50 transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary dark:border-white/20 dark:bg-white/5"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            </PermissionGuard>
                            <PermissionGuard permission="remove_role">
                              <button
                                onClick={() => handleDelete(role.id)}
                                title="Delete role"
                                aria-label="Delete role"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/30 text-rose-600 transition-colors hover:bg-rose-500/10 dark:text-rose-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </PermissionGuard>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-muted-foreground">
                      {searchTerm ? `No roles match “${searchTerm}”.` : "No roles found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!error && (
            <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-300/80 p-4 dark:border-white/20 sm:flex-row sm:px-6">
              <div className="text-sm text-muted-foreground">
                Showing {range.from || 0} to {range.to || 0} of {totalItems} entries
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
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
}