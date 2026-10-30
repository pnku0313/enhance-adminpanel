"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  PackageX,
  Bell,
  User,
  LogOut,
  Settings,
  Menu,
  ChevronDown,
  Search,
  Command,
  X,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Sun,
  Moon,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useSidebar } from "../../context/SidebarContext";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PermissionGuard from "../auth/PermissionGuard";
import { clsx } from "clsx";
import { createPortal } from "react-dom";

const API_BASE = "http://127.0.0.1:8000/api";

/* ==========================================================================
   GLASS MORPHISM - Matches Sidebar
   ========================================================================== */
const glassNavbar =
  "backdrop-blur-lg bg-white/5 dark:bg-white/10 border-b border-white/20 dark:border-white/20";
const glassDropdown =
  "backdrop-blur-md bg-white/10 dark:bg-white/15 border border-white/20 dark:border-white/20";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ==========================================================================
   IconButton
   FIX: defined at MODULE level. When it was defined inside Navbar, every
   re-render created a new component type, so React unmounted/remounted the
   button between mousedown and mouseup and the click event never fired.
   ========================================================================== */
const IconButton = ({
  children,
  onClick,
  className,
  "aria-label": ariaLabel,
  ...props
}) => (
  <button
    type="button"
    onClick={onClick}
    className={clsx(
      "relative flex items-center justify-center",
      "w-10 h-10 rounded-xl",
      "border border-border",
      "bg-card",
      "transition-all duration-200",
      "hover:bg-accent hover:border-primary/30",
      "shadow-sm",
      "active:scale-[0.97]",
      className
    )}
    aria-label={ariaLabel}
    {...props}
  >
    {children}
  </button>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useSidebar();
  const { toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [count, setCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false); // Cmd+K modal
  const [showDesktopResults, setShowDesktopResults] = useState(false); // desktop dropdown
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchRef = useRef(null);
  const desktopSearchRef = useRef(null);
  const searchRequestId = useRef(0);

  /* ---------------- Notification count ---------------- */
  const fetchNotificationCount = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/notification-count`, {
        headers: authHeaders(),
      });
      setCount(res.data?.unread_count || 0);
    } catch (err) {
      console.error("Failed to fetch notification count:", err);
    }
  }, []);

  useEffect(() => {
    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 6000);
    return () => clearInterval(interval);
  }, [fetchNotificationCount]);

  /* ---------------- Logout ---------------- */
  const handleLogout = useCallback(() => {
    logout();
    navigate("/auth/login");
  }, [logout, navigate]);

  /* ---------------- Search ---------------- */
  const handleSearch = useCallback(async (query) => {
    const requestId = ++searchRequestId.current;

    if (!query.trim()) {
      setSearchResults((prev) => (prev.length ? [] : prev));
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const config = { params: { q: query, limit: 5 }, headers: authHeaders() };

      const [productsRes, ordersRes, customersRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/products/search`, config),
        axios.get(`${API_BASE}/orders/search`, config),
        axios.get(`${API_BASE}/customers/search`, config),
      ]);

      // Ignore outdated responses (user kept typing)
      if (requestId !== searchRequestId.current) return;

      const results = [];

      if (productsRes.status === "fulfilled" && productsRes.value.data?.data?.length) {
        productsRes.value.data.data.forEach((item) => {
          results.push({
            type: "product",
            id: item.id,
            title: item.name,
            subtitle: `SKU: ${item.sku || "N/A"}`,
            icon: Package,
            url: `/products/${item.id}`,
          });
        });
      }

      if (ordersRes.status === "fulfilled" && ordersRes.value.data?.data?.length) {
        ordersRes.value.data.data.forEach((item) => {
          results.push({
            type: "order",
            id: item.id,
            title: `Order #${item.order_number || item.id}`,
            subtitle: `${item.customer?.name || "Customer"} - ${item.total_amount}`,
            icon: ShoppingCart,
            url: `/orders/${item.id}`,
          });
        });
      }

      if (customersRes.status === "fulfilled" && customersRes.value.data?.data?.length) {
        customersRes.value.data.data.forEach((item) => {
          results.push({
            type: "customer",
            id: item.id,
            title: item.name,
            subtitle: item.email,
            icon: Users,
            url: `/customers/${item.id}`,
          });
        });
      }

      setSearchResults(results.slice(0, 10));
    } catch (err) {
      if (requestId !== searchRequestId.current) return;
      console.error("Search failed:", err);
      setSearchResults([]);
    } finally {
      if (requestId === searchRequestId.current) setIsSearching(false);
    }
  }, []);

  // Debounced search (skips the API call for an empty query)
  useEffect(() => {
    if (!searchQuery.trim()) {
      searchRequestId.current++; // invalidate any in-flight request
      setSearchResults((prev) => (prev.length ? [] : prev));
      setIsSearching(false);
      return;
    }
    const timer = setTimeout(() => handleSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const handleSelectResult = useCallback(
    (result) => {
      setSearchQuery("");
      setShowSearch(false);
      setShowDesktopResults(false);
      navigate(result.url);
    },
    [navigate]
  );

  const closeSearchModal = useCallback(() => {
    setShowSearch(false);
  }, []);

  const openSearchModal = useCallback(() => {
    setShowDesktopResults(false);
    setShowSearch(true);
  }, []);

  /* ---------------- Outside click ----------------
     FIX: only hide things (boolean state). Never clear data here, and
     setting a boolean to its current value does not trigger a re-render.
  --------------------------------------------------- */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(event.target)) {
        setShowDesktopResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------- Keyboard shortcuts ---------------- */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowDesktopResults(false);
        setShowSearch(true);
      }
      if (e.key === "Escape") {
        setShowSearch(false);
        setShowUserMenu(false);
        setShowNotifications(false);
        setShowDesktopResults(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus modal input when it opens
  useEffect(() => {
    if (showSearch) {
      const t = setTimeout(() => searchRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [showSearch]);

  const hasQuery = searchQuery.trim().length > 0;

  return (
    <>
      <header
        className={clsx(
          "fixed top-0 right-0 left-0 lg:left-[288px] z-50",
          "h-[72px]",
          "transition-all duration-300 ease-in-out",
          glassNavbar,
          "shadow-sm shadow-black/5 dark:shadow-black/10"
        )}
      >
        <div className="relative z-10 h-full px-4 lg:px-8 flex items-center justify-between">
          {/* LEFT SIDE */}
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle */}
            <button
              type="button"
              onClick={toggleSidebar}
              className={clsx(
                "lg:hidden flex items-center justify-center",
                "w-10 h-10 rounded-xl",
                "border border-border",
                "bg-card",
                "hover:bg-accent",
                "transition-all duration-200 shadow-sm",
                "active:scale-[0.97]"
              )}
              aria-label="Toggle sidebar"
            >
              <Menu size={18} className="text-foreground" />
            </button>

            {/* Global Search (Desktop) */}
            <div className="hidden lg:block relative w-80" ref={desktopSearchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products, orders, customers... (⌘K)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDesktopResults(true);
                }}
                onFocus={() => setShowDesktopResults(true)}
                className="w-full h-10 pl-10 pr-10 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}

              {/* Search Results Dropdown */}
              {showDesktopResults && hasQuery && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl shadow-xl border border-border overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  <div className={clsx("max-h-96 overflow-y-auto", glassDropdown)}>
                    {isSearching && (
                      <div className="p-4 text-center text-muted-foreground">
                        <div className="flex justify-center gap-2 items-center">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm">Searching...</span>
                        </div>
                      </div>
                    )}

                    {searchResults.length > 0 && (
                      <ul className="py-1">
                        {searchResults.map((result, index) => (
                          <li key={`${result.type}-${result.id}-${index}`}>
                            <button
                              type="button"
                              onClick={() => handleSelectResult(result)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-primary/5 transition-colors group"
                            >
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                                <result.icon size={16} />
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <p className="font-medium truncate">{result.title}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {result.subtitle}
                                </p>
                              </div>
                              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
                                {result.type}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    {searchResults.length === 0 && !isSearching && (
                      <div className="p-4 text-center text-muted-foreground">
                        <p className="text-sm">No results found for "{searchQuery}"</p>
                        <button
                          type="button"
                          onClick={openSearchModal}
                          className="mt-2 text-xs text-primary hover:underline"
                        >
                          Open full search
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2">
            {/* Stock Alert */}
            <PermissionGuard permission="show_out_of_stock">
              <IconButton onClick={() => navigate("/stockalert")} aria-label="Stock alerts">
                <PackageX size={18} className="text-primary" />
              </IconButton>
            </PermissionGuard>

            {/* Global Search (Mobile) */}
            <div className="lg:hidden">
              <IconButton onClick={openSearchModal} aria-label="Search">
                <Search size={18} className="text-foreground" />
              </IconButton>
            </div>

            {/* Theme Toggle */}
            {/* <div className="flex items-center justify-center">
              <IconButton
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="relative overflow-hidden"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-foreground" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-foreground" />
              </IconButton>
            </div> */}

            {/* Notifications */}
            <PermissionGuard permission="show_notification">
              <div className="relative" ref={notificationsRef}>
                <IconButton
                  onClick={() => setShowNotifications((prev) => !prev)}
                  aria-label="Notifications"
                >
                  <Bell size={18} className="text-foreground" />
                </IconButton>

                {count > 0 && (
                  <div
                    className={clsx(
                      "absolute -top-1 -right-1 pointer-events-none",
                      "min-w-[18px] h-[18px]",
                      "px-1.5 rounded-full",
                      "bg-primary text-primary-foreground",
                      "text-[10px] font-bold",
                      "flex items-center justify-center",
                      "shadow-md",
                      "animate-in zoom-in"
                    )}
                  >
                    {count > 99 ? "99+" : count}
                  </div>
                )}

                {showNotifications && (
                  <div
                    className={clsx(
                      "absolute right-0 mt-3 w-80 overflow-hidden",
                      "rounded-2xl",
                      glassDropdown,
                      "shadow-xl",
                      "animate-in fade-in slide-in-from-top-2 duration-200"
                    )}
                  >
                    <div className="p-3 border-b border-border flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                      {count > 0 && (
                        <button
                          type="button"
                          className="text-xs text-primary hover:underline font-medium"
                          onClick={() => {
                            navigate("/notification");
                            setShowNotifications(false);
                          }}
                        >
                          View all
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto sidebar-scrollbar">
                      <button
                        type="button"
                        onClick={() => {
                          navigate("/notification");
                          setShowNotifications(false);
                        }}
                        className="block w-full text-left px-3 py-3 text-sm text-muted-foreground hover:bg-primary/5 transition-colors"
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </PermissionGuard>

            {/* USER MENU */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setShowUserMenu((prev) => !prev)}
                className={clsx(
                  "flex items-center gap-3",
                  "pl-3 pr-3 h-10 rounded-xl",
                  "border border-border",
                  "bg-card",
                  "hover:bg-accent",
                  "transition-all duration-200",
                  "shadow-sm",
                  "active:scale-[0.98]"
                )}
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30 dark:shadow-indigo-500/40">
                  <User size={14} />
                </div>

                {/* User Info */}
                <div className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-sm font-semibold text-foreground">
                    {user?.name || "Admin"}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Administrator
                  </span>
                </div>

                <ChevronDown
                  size={15}
                  className={clsx(
                    "text-muted-foreground transition-transform duration-200",
                    showUserMenu && "rotate-180"
                  )}
                />
              </button>

              {/* Dropdown */}
              {showUserMenu && (
                <div
                  className={clsx(
                    "absolute right-0 mt-3 w-56 overflow-hidden",
                    "rounded-2xl",
                    glassDropdown,
                    "shadow-xl",
                    "animate-in fade-in slide-in-from-top-2 duration-200"
                  )}
                >
                  {/* Header */}
                  <div className="p-3 border-b border-border bg-primary/5">
                    <p className="text-sm font-semibold text-foreground">
                      {user?.name || "Admin User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email || "admin@store.com"}
                    </p>
                  </div>

                  {/* Menu */}
                  <div className="p-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/profile");
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-primary/5 transition-all"
                    >
                      <User size={16} className="text-primary" />
                      Profile
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigate("/settings");
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-primary/5 transition-all"
                    >
                      <Settings size={16} className="text-primary" />
                      Settings
                    </button>

                    <div className="my-2 border-t border-border" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition-all"
                    >
                      <LogOut size={16} className="text-primary" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal (Cmd/Ctrl + K) */}
      {showSearch &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeSearchModal}
            />
            <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-zoom-in">
              <div className="p-4 lg:p-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search products, orders, customers, settings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchResults.length > 0) {
                        handleSelectResult(searchResults[0]);
                      }
                    }}
                    className="w-full h-12 pl-12 pr-32 rounded-xl border border-input bg-background text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    autoFocus
                  />
                  <kbd className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center px-2 py-1 text-xs text-muted-foreground bg-muted rounded">
                    <Command className="h-3 w-3 mr-1" /> Enter to open
                  </kbd>
                </div>

                {/* Results in Modal */}
                {hasQuery && (
                  <div className="mt-4 max-h-96 overflow-y-auto rounded-xl border border-border">
                    {isSearching && (
                      <div className="p-6 text-center text-muted-foreground">
                        <div className="flex justify-center gap-2 items-center">
                          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span>Searching...</span>
                        </div>
                      </div>
                    )}

                    {searchResults.length > 0 && (
                      <ul className="divide-y divide-border">
                        {searchResults.map((result, index) => (
                          <li key={`${result.type}-${result.id}-${index}`}>
                            <button
                              type="button"
                              onClick={() => handleSelectResult(result)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left text-foreground hover:bg-primary/5 transition-colors group"
                            >
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                                <result.icon size={20} />
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <p className="font-medium truncate">{result.title}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {result.subtitle}
                                </p>
                              </div>
                              <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-primary/10 text-primary">
                                {result.type}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    {searchResults.length === 0 && !isSearching && (
                      <div className="p-6 text-center text-muted-foreground">
                        <p className="text-sm">No results found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Actions */}
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-muted-foreground">Quick actions:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Products", path: "/products", icon: Package },
                      { label: "Orders", path: "/orders", icon: ShoppingCart },
                      { label: "Customers", path: "/customers", icon: Users },
                      { label: "Reports", path: "/reports", icon: BarChart3 },
                    ].map(({ label, path, icon: Icon }) => (
                      <button
                        key={path}
                        type="button"
                        onClick={() => {
                          navigate(path);
                          setShowSearch(false);
                        }}
                        className="p-3 rounded-xl border border-border hover:bg-primary/5 transition-colors text-left"
                      >
                        <Icon className="h-5 w-5 text-primary mb-1" />
                        <span className="text-sm font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default Navbar;