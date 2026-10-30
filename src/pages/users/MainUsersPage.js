import React, { useEffect, useState, useMemo, useRef, useCallback, memo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { clsx } from "clsx";
import {
  Eye, Pencil, Trash2, Plus, Search, X, ChevronLeft, ChevronRight, Loader2,
  Users, UserCog, ShieldCheck, KeyRound,
} from "lucide-react";
import PermissionGuard from "../../components/auth/PermissionGuard";

/* ==========================================================================
   THEME: same glass + indigo/purple look as the other pages.
   No backdrop-blur (it caused scroll lag). Light black lines separate data.
   ========================================================================== */
const glassCard = "bg-white/70 dark:bg-slate-900/60 border border-black/10 dark:border-white/10";
const glassInput = "bg-white/50 dark:bg-white/10 border border-black/10 dark:border-white/15";
const cardShadow = "shadow-xl shadow-black/5 dark:shadow-black/20";
const primaryGradient = "from-indigo-500 via-purple-500 to-indigo-600";

const API = "http://127.0.0.1:8000/api";
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const chipBase = "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap";
const ACTIVE_STYLE = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/30";
const INACTIVE_STYLE = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-400/30";
const ROLE_STYLE = "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-400/30";

const swalClasses = {
  popup: "bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl",
  confirmButton:
    "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40",
  cancelButton: "bg-muted text-muted-foreground hover:bg-muted/80",
};
const swalOk = { popup: swalClasses.popup };

/* ==========================================================================
   MOTION (CSS only) + visible text selection
   ========================================================================== */
const MOTION_CSS = `
/* Selected text stays readable: tinted highlight, original text colour kept */
::selection { background: rgba(99,102,241,0.35); color: inherit; }
::-moz-selection { background: rgba(99,102,241,0.35); color: inherit; }
.dark ::selection { background: rgba(165,180,252,0.40); color: inherit; }

@keyframes pp-wave { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes pp-float { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-6px) rotate(3deg); } }
@keyframes pp-row-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.pp-wave-1 { animation: pp-wave 26s linear infinite; will-change: transform; }
.pp-wave-2 { animation: pp-wave 18s linear infinite reverse; will-change: transform; }
.pp-wave-3 { animation: pp-wave 12s linear infinite; will-change: transform; }
.pp-float { animation: pp-float 3.2s ease-in-out infinite; }
/* "backwards" (not "both") so finished rows don't keep a stacking context */
.pp-row-in { animation: pp-row-in 0.28s ease-out backwards; }
@media (prefers-reduced-motion: reduce) {
  .pp-wave-1, .pp-wave-2, .pp-wave-3, .pp-float, .pp-row-in { animation: none !important; }
}
`;

const WAVE_PATH =
  "M0 80 Q180 20 360 80 T720 80 T1080 80 T1440 80 T1800 80 T2160 80 T2520 80 T2880 80 L2880 160 L0 160 Z";

/* Waves with user-management icons: users, settings, shield, key */
const WaveBackground = () => {
  const layer = (cls, color, h) => (
    <svg
      className={clsx("absolute bottom-0 left-0 w-[200%]", cls, color)}
      style={{ height: h }}
      viewBox="0 0 2880 160"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={WAVE_PATH} fill="currentColor" />
    </svg>
  );
  const floaters = [
    { Icon: Users, left: "9%", delay: "0s" },
    { Icon: UserCog, left: "34%", delay: "-1.1s" },
    { Icon: ShieldCheck, left: "60%", delay: "-2.2s" },
    { Icon: KeyRound, left: "85%", delay: "-0.6s" },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {layer("pp-wave-1", "text-indigo-500/10 dark:text-indigo-400/10", "70%")}
      {layer("pp-wave-2", "text-purple-500/10 dark:text-purple-400/10", "52%")}
      {layer("pp-wave-3", "text-indigo-500/15 dark:text-indigo-400/15", "34%")}
      {floaters.map(({ Icon, left, delay }, i) => (
        <Icon
          key={i}
          size={20}
          strokeWidth={1.75}
          className="pp-float absolute bottom-3 text-indigo-500/40 dark:text-indigo-300/40"
          style={{ left, animationDelay: delay }}
        />
      ))}
    </div>
  );
};

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const pageWindow = (page, total) => {
  const nums = [...new Set([1, total, page - 1, page, page + 1])]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push(`gap-${n}`);
    out.push(n);
  });
  return out;
};

const initials = (name) =>
  (name || "?").split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

const iconBtn = "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors";

/* One row. Memoized: it only re-renders when its own data / selection changes
   (the callbacks below are stable, so selecting one user doesn't re-render the rest). */
const UserRow = memo(function UserRow({ user, index, checked, onToggle, onView, onEdit, onDelete }) {
  const active = user.status === 1 || user.status === "1";
  return (
    <tr
      className="pp-row-in divide-x divide-black/5 border-b border-black/10 transition-colors hover:bg-primary/5 dark:divide-white/5 dark:border-white/10"
      style={{ animationDelay: `${Math.min(index, 9) * 30}ms` }}
    >
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(user.id)}
          aria-label={`Select ${user.name}`}
          className="h-4 w-4 cursor-pointer rounded border-input accent-primary"
        />
      </td>

      <td className="px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className={clsx("flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white", primaryGradient)}>
            {initials(user.name)}
          </div>
          <span className="truncate text-sm font-semibold text-foreground">{user.name}</span>
        </div>
      </td>

      <td className="max-w-[260px] px-4 py-3 text-sm text-muted-foreground">
        <p className="truncate" title={user.email}>{user.email || "—"}</p>
      </td>

      <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground">{user.phone || "—"}</td>

      <td className="px-4 py-3">
        {user.roles?.length ? (
          <div className="flex flex-wrap gap-1">
            {user.roles.map((role, i) => (
              <span key={role.id ?? i} className={clsx(chipBase, ROLE_STYLE)}>{role.role_name}</span>
            ))}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">No roles</span>
        )}
      </td>

      <td className="px-4 py-3">
        <span className={clsx(chipBase, active ? ACTIVE_STYLE : INACTIVE_STYLE)}>
          <span className={clsx("h-1.5 w-1.5 rounded-full", active ? "bg-emerald-500" : "bg-rose-500")} />
          {active ? "Active" : "Inactive"}
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <PermissionGuard permission="view_user">
            <button
              type="button"
              onClick={() => onView(user.id)}
              title="View"
              aria-label={`View ${user.name}`}
              className={clsx(iconBtn, "text-muted-foreground hover:bg-primary/10 hover:text-primary")}
            >
              <Eye className="h-[18px] w-[18px]" />
            </button>
          </PermissionGuard>
          <PermissionGuard permission="edit_user">
            <button
              type="button"
              onClick={() => onEdit(user.id)}
              title="Edit"
              aria-label={`Edit ${user.name}`}
              className={clsx(iconBtn, "text-muted-foreground hover:bg-primary/10 hover:text-primary")}
            >
              <Pencil className="h-[18px] w-[18px]" />
            </button>
          </PermissionGuard>
          <PermissionGuard permission="delete_user">
            <button
              type="button"
              onClick={() => onDelete(user)}
              title="Delete"
              aria-label={`Delete ${user.name}`}
              className={clsx(iconBtn, "text-rose-500 hover:bg-rose-500/10")}
            >
              <Trash2 className="h-[18px] w-[18px]" />
            </button>
          </PermissionGuard>
        </div>
      </td>
    </tr>
  );
});

/* ==========================================================================
   PAGE
   ========================================================================== */
const UsersListPage = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState("asc");
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const reqId = useRef(0); // ignore out-of-date responses

  const fetchUsers = async () => {
    const myReq = ++reqId.current;
    try {
      setLoading(true);
      const res = await axios.get(`${API}/users`, {
        params: { page: currentPage, perPage: usersPerPage, search: debouncedSearch, sort: sortOrder },
        headers: authHeaders(),
      });
      if (myReq !== reqId.current) return;

      const rows = res.data?.data ?? [];
      setUsers(rows);
      setMeta(res.data?.meta ?? null);
      // keep only selections that are on the current page
      setSelectedUsers((prev) => prev.filter((id) => rows.some((u) => u.id === id)));
    } catch (error) {
      if (myReq !== reqId.current) return;
      console.error("Failed to fetch users", error);
      toast.error("Failed to load users");
    } finally {
      if (myReq === reqId.current) setLoading(false);
    }
  };

  // Always points at the latest fetchUsers, so the callbacks below can stay stable
  const fetchRef = useRef(fetchUsers);
  fetchRef.current = fetchUsers;

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, usersPerPage, debouncedSearch, sortOrder]);

  /* ---------- stable row callbacks ---------- */
  const toggleSelectUser = useCallback(
    (id) => setSelectedUsers((prev) => (prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id])),
    []
  );
  const handleView = useCallback((id) => navigate(`/view-user/${id}`), [navigate]);
  const handleEdit = useCallback((id) => navigate(`/edit-user/${id}`), [navigate]);

  const handleDelete = useCallback(async (user) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `"${user.name}" will be permanently deleted!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      customClass: swalClasses,
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API}/users/${user.id}`, { headers: authHeaders() });
      toast.success("User deleted successfully");
      fetchRef.current();
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Failed to delete user");
    }
  }, []);

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      toast.warning("No users selected");
      return;
    }

    const result = await Swal.fire({
      title: `Delete ${selectedUsers.length} selected users?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete them!",
      customClass: swalClasses,
    });
    if (!result.isConfirmed) return;

    try {
      await axios.post(`${API}/user/bulk-delete`, { ids: selectedUsers }, { headers: authHeaders() });
      setSelectedUsers([]);
      fetchUsers();
      Swal.fire({ title: "Deleted!", text: "Selected users have been deleted successfully.", icon: "success", customClass: swalOk });
    } catch (error) {
      console.error("Bulk delete failed", error);
      Swal.fire({ title: "Error!", text: "Failed to delete selected users.", icon: "error", customClass: swalOk });
    }
  };

  /* ---------- derived ---------- */
  const selectedSet = useMemo(() => new Set(selectedUsers), [selectedUsers]);
  const areAllOnPageSelected = users.length > 0 && users.every((u) => selectedSet.has(u.id));
  const toggleSelectAll = () => setSelectedUsers(areAllOnPageSelected ? [] : users.map((u) => u.id));

  const page = meta?.current_page ?? currentPage;
  const lastPage = meta?.last_page ?? 1;
  const pages = useMemo(() => pageWindow(page, lastPage), [page, lastPage]);

  return (
    <div className="w-full">
      <style>{MOTION_CSS}</style>

      <div className="mx-auto w-full max-w-[90rem] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className={clsx("overflow-hidden rounded-2xl", glassCard, cardShadow)}>

          {/* HEADER + CONTROLS ON WAVES */}
          <div className="relative">
            <WaveBackground />

            <div className="relative z-10 border-b border-black/10 px-6 py-4 dark:border-white/10">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold text-card-foreground">Users</h1>
                  <p className="text-sm text-muted-foreground">Manage staff accounts, roles and access</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <PermissionGuard permission="bulk_delete_variants_colors">
                    <button
                      type="button"
                      onClick={handleBulkDelete}
                      disabled={selectedUsers.length === 0}
                      className={clsx(
                        "inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg px-4 text-sm font-semibold transition-colors",
                        selectedUsers.length > 0
                          ? "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-300"
                          : "cursor-not-allowed border border-border text-muted-foreground opacity-40"
                      )}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete selected{selectedUsers.length > 0 ? ` (${selectedUsers.length})` : ""}
                    </button>
                  </PermissionGuard>

                  <PermissionGuard permission="create_user">
                    <button
                      type="button"
                      onClick={() => navigate("/newuser")}
                      className={clsx(
                        "inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg bg-gradient-to-r px-4 text-sm font-semibold text-white transition-all duration-200",
                        "shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40",
                        primaryGradient
                      )}
                    >
                      <Plus className="h-4 w-4" />
                      Add user
                    </button>
                  </PermissionGuard>
                </div>
              </div>
            </div>

            <div className="relative z-10 px-6 pb-6 pt-4">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex flex-wrap items-center gap-3">
                  <label htmlFor="users-per-page" className="whitespace-nowrap text-sm text-muted-foreground">Show</label>
                  <select
                    id="users-per-page"
                    value={usersPerPage}
                    onChange={(e) => { setUsersPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className={clsx(
                      "h-9 w-[90px] cursor-pointer rounded-lg px-3 text-sm text-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-primary/40",
                      glassInput
                    )}
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n} className="text-slate-900">{n}</option>
                    ))}
                  </select>
                  <span className="whitespace-nowrap text-sm text-muted-foreground">entries</span>

                  <select
                    value={sortOrder}
                    onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
                    aria-label="Sort order"
                    className={clsx(
                      "h-9 cursor-pointer rounded-lg px-3 text-sm text-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-primary/40",
                      glassInput
                    )}
                  >
                    <option value="asc" className="text-slate-900">Sort ascending</option>
                    <option value="desc" className="text-slate-900">Sort descending</option>
                  </select>
                </div>

                <div className="relative w-full sm:w-80">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className={clsx(
                      "h-10 w-full rounded-xl pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground/60",
                      "focus:outline-none focus:ring-2 focus:ring-primary/40",
                      glassInput
                    )}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse">
              <thead className="border-b border-black/15 bg-white/30 dark:border-white/15 dark:bg-white/10">
                <tr className="divide-x divide-black/5 dark:divide-white/5">
                  <th className="w-[60px] px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={areAllOnPageSelected}
                      onChange={toggleSelectAll}
                      aria-label="Select all users on this page"
                      className="h-4 w-4 cursor-pointer rounded border-input accent-primary"
                    />
                  </th>
                  <th className="min-w-[170px] px-4 py-3 text-left text-xs font-semibold text-foreground">Name</th>
                  <th className="min-w-[200px] px-4 py-3 text-left text-xs font-semibold text-foreground">Email</th>
                  <th className="min-w-[130px] px-4 py-3 text-left text-xs font-semibold text-foreground">Phone</th>
                  <th className="min-w-[130px] px-4 py-3 text-left text-xs font-semibold text-foreground">Role</th>
                  <th className="min-w-[110px] px-4 py-3 text-left text-xs font-semibold text-foreground">Status</th>
                  <th className="w-[130px] px-4 py-3 text-right text-xs font-semibold text-foreground">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center text-sm text-muted-foreground">
                      {debouncedSearch ? `No users match "${debouncedSearch}"` : "No users found."}
                    </td>
                  </tr>
                ) : (
                  users.map((user, i) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      index={i}
                      checked={selectedSet.has(user.id)}
                      onToggle={toggleSelectUser}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER / PAGINATION */}
          {meta && (
            <div className="flex flex-col items-center justify-between gap-4 border-t border-black/10 bg-white/40 px-6 py-4 dark:border-white/10 dark:bg-white/5 md:flex-row">
              <span className="text-[13px] text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{meta.from ?? 0}</span> to{" "}
                <span className="font-semibold text-foreground">{meta.to ?? 0}</span> of{" "}
                <span className="font-semibold text-foreground">{meta.total ?? 0}</span> entries
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  aria-label="Previous page"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>

                {pages.map((n) =>
                  typeof n === "string" ? (
                    <span key={n} className="px-1 text-muted-foreground">…</span>
                  ) : (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCurrentPage(n)}
                      aria-current={n === page ? "page" : undefined}
                      className={clsx(
                        "h-9 min-w-[36px] rounded-lg px-2 text-[13px] font-medium transition-colors",
                        n === page
                          ? `bg-gradient-to-r ${primaryGradient} text-white shadow-md shadow-indigo-500/30`
                          : "border border-border text-foreground hover:bg-primary/5"
                      )}
                    >
                      {n}
                    </button>
                  )
                )}

                <button
                  type="button"
                  disabled={page === lastPage}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, lastPage))}
                  aria-label="Next page"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersListPage;