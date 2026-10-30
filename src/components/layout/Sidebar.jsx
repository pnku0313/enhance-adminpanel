"use client";

import { memo, useState, useCallback } from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Settings,
  Home,
  ChevronDown,
  ChevronRight,
  List,
  FileImage,
  Star,
  User,
  Palette,
  Ruler,
  Leaf,
  Layers,
  Percent,
  Award,
  FolderTree,
  FolderOpen,
  Folder,
  Hash,
  Shield,
  TrendingUp,
  MessageCircleMore,
  MailCheck,
  UserPlus,
  UserCog,
  Briefcase,
} from "lucide-react";

import { useSidebar } from "../../context/SidebarContext";
import PermissionGuard from "../auth/PermissionGuard";
import clsx from "clsx";

/* ==========================================================================
   SECTION COLOR THEMES - Premium Color Combinations
   ========================================================================== */
const SECTION_THEMES = {
  overview: {
    primary: "indigo",
    iconBg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    iconColor: "text-indigo-500 dark:text-indigo-400",
    hoverBg: "hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20",
    activeBg: "bg-indigo-500/15 dark:bg-indigo-500/25",
    borderColor: "border-indigo-500/20 dark:border-indigo-500/30",
    gradient: "from-indigo-500 to-indigo-600",
    gradientLight: "from-indigo-500/10 to-indigo-600/10",
  },
  product: {
    primary: "purple",
    iconBg: "bg-purple-500/10 dark:bg-purple-500/20",
    iconColor: "text-purple-500 dark:text-purple-400",
    hoverBg: "hover:bg-purple-500/10 dark:hover:bg-purple-500/20",
    activeBg: "bg-purple-500/15 dark:bg-purple-500/25",
    borderColor: "border-purple-500/20 dark:border-purple-500/30",
    gradient: "from-purple-500 to-purple-600",
    gradientLight: "from-purple-500/10 to-purple-600/10",
  },
  variant: {
    primary: "emerald",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    iconColor: "text-emerald-500 dark:text-emerald-400",
    hoverBg: "hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20",
    activeBg: "bg-emerald-500/15 dark:bg-emerald-500/25",
    borderColor: "border-emerald-500/20 dark:border-emerald-500/30",
    gradient: "from-emerald-500 to-emerald-600",
    gradientLight: "from-emerald-500/10 to-emerald-600/10",
  },
  management: {
    primary: "amber",
    iconBg: "bg-amber-500/10 dark:bg-amber-500/20",
    iconColor: "text-amber-500 dark:text-amber-400",
    hoverBg: "hover:bg-amber-500/10 dark:hover:bg-amber-500/20",
    activeBg: "bg-amber-500/15 dark:bg-amber-500/25",
    borderColor: "border-amber-500/20 dark:border-amber-500/30",
    gradient: "from-amber-500 to-amber-600",
    gradientLight: "from-amber-500/10 to-amber-600/10",
  },
  analytics: {
    primary: "blue",
    iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
    iconColor: "text-blue-500 dark:text-blue-400",
    hoverBg: "hover:bg-blue-500/10 dark:hover:bg-blue-500/20",
    activeBg: "bg-blue-500/15 dark:bg-blue-500/25",
    borderColor: "border-blue-500/20 dark:border-blue-500/30",
    gradient: "from-blue-500 to-blue-600",
    gradientLight: "from-blue-500/10 to-blue-600/10",
  },
  users: {
    primary: "violet",
    iconBg: "bg-violet-500/10 dark:bg-violet-500/20",
    iconColor: "text-violet-500 dark:text-violet-400",
    hoverBg: "hover:bg-violet-500/10 dark:hover:bg-violet-500/20",
    activeBg: "bg-violet-500/15 dark:bg-violet-500/25",
    borderColor: "border-violet-500/20 dark:border-violet-500/30",
    gradient: "from-violet-500 to-violet-600",
    gradientLight: "from-violet-500/10 to-violet-600/10",
  },
  hrm: {
    primary: "rose",
    iconBg: "bg-rose-500/10 dark:bg-rose-500/20",
    iconColor: "text-rose-500 dark:text-rose-400",
    hoverBg: "hover:bg-rose-500/10 dark:hover:bg-rose-500/20",
    activeBg: "bg-rose-500/15 dark:bg-rose-500/25",
    borderColor: "border-rose-500/20 dark:border-rose-500/30",
    gradient: "from-rose-500 to-rose-600",
    gradientLight: "from-rose-500/10 to-rose-600/10",
  },
  settings: {
    primary: "slate",
    iconBg: "bg-slate-500/10 dark:bg-slate-500/20",
    iconColor: "text-slate-500 dark:text-slate-400",
    hoverBg: "hover:bg-slate-500/10 dark:hover:bg-slate-500/20",
    activeBg: "bg-slate-500/15 dark:bg-slate-500/25",
    borderColor: "border-slate-500/20 dark:border-slate-500/30",
    gradient: "from-slate-500 to-slate-600",
    gradientLight: "from-slate-500/10 to-slate-600/10",
  },
};

/* ==========================================================================
   OPTIMIZED GLASS MORPHISM UTILITIES
   ========================================================================== */
// Single glass layer for entire sidebar - reduced blur for performance
// Light mode: subtle white with stronger border for visibility
// Dark mode: lighter base (not pure black) with visible border
const glassSidebar = "backdrop-blur-lg bg-white/5 dark:bg-white/10 border-r border-white/20 dark:border-white/20";
// Section glass - slightly stronger for depth
const glassSection = "backdrop-blur-md bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/15";
// Active/hover glass - minimal overlay
const glassActive = "bg-white/10 dark:bg-white/15";

const SectionLabel = ({ children, theme = "overview" }) => {
  return (
    <div className="flex items-center gap-2 px-2 mb-1.5 mt-3">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold">
        {children}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
};

// Memoized NavItem to prevent unnecessary re-renders
const NavItem = memo(({ to, icon: Icon, children, child = false, badge, theme = "overview" }) => {
  const colors = SECTION_THEMES[theme];

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          "group flex items-center gap-3 rounded-xl transition-colors duration-200",
          "text-sm font-medium mb-0.5 relative overflow-hidden",
          child
            ? "ml-4 pl-4 py-1.5 border-l-2"
            : "px-3 py-2.5",
          isActive
            ? clsx(
                colors.activeBg,
                glassActive,
                "text-foreground shadow-md",
                "shadow-primary/10 dark:shadow-primary/20",
                "border-r-2",
                colors.borderColor.replace("border-", "border-r-")
              )
            : clsx(
                "text-foreground",
                colors.hoverBg,
                "hover:shadow-sm hover:shadow-primary/5 dark:hover:shadow-primary/10"
              )
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Active indicator - simple, no gradient animation */}
          {isActive && !child && (
            <div
              className="absolute inset-0 bg-primary/5 dark:bg-primary/10 pointer-events-none"
              aria-hidden="true"
            />
          )}

          <div
            className={clsx(
              "flex items-center justify-center shrink-0 transition-colors duration-200 relative z-10",
              child
                ? "w-6 h-6 rounded-lg"
                : "w-9 h-9 rounded-xl",
              child
                ? ""
                : clsx(
                    colors.iconBg,
                    "group-hover:bg-primary/10 dark:group-hover:bg-primary/20",
                    isActive && "bg-primary/20 dark:bg-primary/30"
                  )
            )}
          >
            <Icon
              size={child ? 14 : 17}
              className={clsx(
                "transition-transform duration-200",
                isActive
                  ? "text-primary scale-110"
                  : clsx(colors.iconColor, "group-hover:text-primary group-hover:scale-105")
              )}
            />
          </div>

          <span className="truncate relative z-10">{children}</span>
          {badge && (
            <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20 relative z-10">
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
});

NavItem.displayName = "NavItem";

// Memoized DropdownSection
const DropdownSection = memo(({ label, icon: Icon, isOpen, onToggle, children, theme = "overview" }) => {
  const colors = SECTION_THEMES[theme];

  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className={clsx(
          "w-full flex items-center justify-between",
          "px-3 py-2.5 rounded-xl",
          "transition-colors duration-200",
          "relative overflow-hidden",
          isOpen
            ? clsx(
                colors.activeBg,
                glassActive,
                colors.borderColor,
                "text-foreground shadow-md shadow-primary/10 dark:shadow-primary/20"
              )
            : clsx(
                colors.hoverBg,
                "border border-transparent",
                "hover:shadow-sm hover:shadow-primary/5 dark:hover:shadow-primary/10"
              )
        )}
      >
        {/* Single glass layer for button background */}
        <div
          className={clsx(
            "absolute inset-0",
            glassSection,
            isOpen && "bg-white/10 dark:bg-white/15"
          )}
          aria-hidden="true"
        />

        <div className="flex items-center gap-3 relative z-10">
          <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200", colors.iconBg)}>
            <Icon size={17} className={clsx(colors.iconColor, isOpen && "text-primary scale-110")} />
          </div>

          <span className="text-sm font-semibold text-foreground truncate">
            {label}
          </span>
        </div>

        <div
          className={clsx(
            "w-5 h-5 flex items-center justify-center rounded-lg transition-all duration-200 relative z-10",
            colors.iconBg,
            isOpen && "bg-primary/20 dark:bg-primary/30"
          )}
        >
          {isOpen ? (
            <ChevronDown size={15} className="text-primary transition-transform duration-200 rotate-180" />
          ) : (
            <ChevronRight size={15} className={clsx(colors.iconColor, "transition-transform duration-200")} />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="mt-1 animate-in slide-in-from-top-2 duration-200">
          {/* Glass container for dropdown items - single layer */}
          <div className={clsx("rounded-2xl p-1.5", glassSection, "border-l-2", colors.borderColor)}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
});

DropdownSection.displayName = "DropdownSection";

// Static gradient mesh styles - no need for useMemo since they're constant
const gradientMeshStyles = [
  // Top-left: Primary color - subtle in both themes
  {
    className: "absolute -top-16 -left-16 w-64 h-64 bg-gradient-to-br from-primary/20 via-transparent to-transparent blur-2xl rounded-full opacity-40",
  },
  // Bottom-right: Secondary accent - very subtle
  {
    className: "absolute -bottom-16 -right-16 w-64 h-64 bg-gradient-to-tl from-purple-500/10 via-transparent to-transparent blur-2xl rounded-full opacity-30",
  },
  // Center: Very subtle bridge - only in light mode
  {
    className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-indigo-500/5 via-transparent to-emerald-500/5 blur-2xl rounded-full opacity-30 dark:hidden",
  },
];

const Sidebar = () => {
  const { isOpen, isMobile } = useSidebar();

  const [openDropdown, setOpenDropdown] = useState({
    product: true,
    variant: false,
    setting: false,
  });

  const toggle = useCallback((key) => {
    setOpenDropdown((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  if (!isOpen && isMobile) return null;

  return (
    <>
      {/* Mobile Overlay - simplified */}
      {isOpen && isMobile && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" />
      )}

      <aside
        className={clsx(
          "fixed top-0 left-0 z-50",
          "h-screen w-72",
          "transition-transform duration-300 ease-out",
          /* Single glass layer for entire sidebar */
          glassSidebar,
          "shadow-2xl shadow-black/5 dark:shadow-black/20",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        // Performance: hint to browser this element transforms
        style={{ willChange: isMobile ? "transform" : "auto" }}
      >
        {/* Simplified gradient mesh background - only 2 blobs, reduced blur */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
          {gradientMeshStyles.map((style, index) => (
            <div key={index} className={style.className} />
          ))}
        </div>

        <div className="relative h-full flex flex-col overflow-hidden">
          {/* =============================================
              TOP BRAND SECTION - Company Logo & Name
              ============================================= */}
          <div className="relative z-10 flex-shrink-0 px-4 py-5 border-b border-white/15 dark:border-white/15">
            {/* Single glass background for brand section */}
            <div className="absolute inset-0 -z-10 rounded-t-2xl bg-white/5 dark:bg-white/10 backdrop-blur-md" />

            <div className="flex items-center gap-3 relative z-10">
              {/* Company Logo with premium gradient - no pulsing ring for performance */}
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 dark:shadow-indigo-500/40 relative overflow-hidden">
                  {/* Shimmer overlay - static, no animation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                  <Package size={22} className="text-white relative z-10 drop-shadow-lg" />
                </div>
              </div>

              <div className="flex-1 min-w-0 leading-tight">
                <h1 className="font-heading font-bold text-lg text-foreground truncate bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Store Admin
                </h1>
                <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/70 mt-0.5">
                  Control Panel
                </p>
              </div>
            </div>
          </div>

          {/* =============================================
              NAVIGATION AREA - Glass with premium colors
              ============================================= */}
          <nav className="relative z-10 flex-1 overflow-y-auto px-3 py-4 scrollbar-thin sidebar-scrollbar">
            {/* Single glass background for entire nav area */}
            <div className="absolute inset-0 -z-10 backdrop-blur-sm" />

            {/* Overview */}
            <div className="mb-1">
              <ul className="space-y-0.5">
                <PermissionGuard permission="show_dashboard">
                  <li>
                    <NavItem to="/" icon={Home} theme="overview">
                      Dashboard
                    </NavItem>
                  </li>
                </PermissionGuard>
              </ul>
            </div>

            {/* Product - Purple Theme */}
            <DropdownSection
              label="Product"
              icon={Package}
              isOpen={openDropdown.product}
              onToggle={() => toggle("product")}
              theme="product"
            >
              <ul className="space-y-0.5">
                <PermissionGuard permission="show_product">
                  <li>
                    <NavItem to="/products" icon={Package} child theme="product">
                      Products
                    </NavItem>
                  </li>
                </PermissionGuard>

                <PermissionGuard permission="show_main_categories">
                  <li>
                    <NavItem to="/headcategory" icon={FolderTree} child theme="product">
                      Main Categories
                    </NavItem>
                  </li>
                </PermissionGuard>

                <PermissionGuard permission="show_parent_categories">
                  <li>
                    <NavItem to="/parentcategory" icon={FolderOpen} child theme="product">
                      Parent Categories
                    </NavItem>
                  </li>
                </PermissionGuard>

                <PermissionGuard permission="show_child_categories">
                  <li>
                    <NavItem to="/childcategory" icon={Folder} child theme="product">
                      Child Categories
                    </NavItem>
                  </li>
                </PermissionGuard>

                <PermissionGuard permission="show_product_tags">
                  <li>
                    <NavItem to="/producttags" icon={Hash} child theme="product">
                      Product Tags
                    </NavItem>
                  </li>
                </PermissionGuard>

                <PermissionGuard permission="show_discounts">
                  <li>
                    <NavItem to="/discounts" icon={Percent} child theme="product">
                      Discounts
                    </NavItem>
                  </li>
                </PermissionGuard>

                <PermissionGuard permission="show_brands">
                  <li>
                    <NavItem to="/brands" icon={Award} child theme="product">
                      Brands
                    </NavItem>
                  </li>
                </PermissionGuard>
              </ul>
            </DropdownSection>

            {/* Variants - Emerald Theme */}
            <DropdownSection
              label="Variants"
              icon={List}
              isOpen={openDropdown.variant}
              onToggle={() => toggle("variant")}
              theme="variant"
            >
              <ul className="space-y-0.5">
                <PermissionGuard permission="show_variants_colors">
                  <li>
                    <NavItem to="/colors" icon={Palette} child theme="variant">
                      Colors
                    </NavItem>
                  </li>
                </PermissionGuard>

                <PermissionGuard permission="show_variants_sizes">
                  <li>
                    <NavItem to="/sizes" icon={Ruler} child theme="variant">
                      Sizes
                    </NavItem>
                  </li>
                </PermissionGuard>

                <PermissionGuard permission="show_variants_seasons">
                  <li>
                    <NavItem to="/seasons" icon={Leaf} child theme="variant">
                      Seasons
                    </NavItem>
                  </li>
                </PermissionGuard>

                <PermissionGuard permission="show_variants_fabric">
                  <li>
                    <NavItem to="/fabric" icon={Layers} child theme="variant">
                      Fabric
                    </NavItem>
                  </li>
                </PermissionGuard>
              </ul>
            </DropdownSection>

            {/* Management - Amber Theme */}
            <div className="mb-1">
              <SectionLabel theme="management">Management</SectionLabel>

              <ul className="space-y-0.5">
                <PermissionGuard permission="show_order">
                  <li>
                    <NavItem to="/orders" icon={ShoppingCart} theme="management">
                      Orders
                    </NavItem>
                  </li>
                </PermissionGuard>

                <PermissionGuard permission="show_customers">
                  <li>
                    <NavItem to="/customers" icon={Users} theme="management">
                      Customers
                    </NavItem>
                  </li>
                </PermissionGuard>

                <PermissionGuard permission="show_coupons">
                  <li>
                    <NavItem to="/coupons" icon={Tag} theme="management">
                      Coupons
                    </NavItem>
                  </li>
                </PermissionGuard>

                <PermissionGuard permission="show_content">
                  <li>
                    <NavItem to="/content" icon={FileImage} theme="management">
                      Content
                    </NavItem>
                  </li>
                </PermissionGuard>

                <PermissionGuard permission="show_review">
                  <>
                    <li>
                      <NavItem to="/reviews" icon={Star} theme="management">
                        Reviews
                      </NavItem>
                    </li>

                    <li>
                      <NavItem to="/subscriber" icon={MailCheck} theme="management">
                        Subscriber
                      </NavItem>
                    </li>

                    <li>
                      <NavItem to="/postcomment" icon={MessageCircleMore} theme="management">
                        Blog Comment
                      </NavItem>
                    </li>
                  </>
                </PermissionGuard>
              </ul>
            </div>

            {/* Analytics - Blue Theme */}
            <PermissionGuard permission="show_reports">
              <div className="mb-1">
                <SectionLabel theme="analytics">Analytics</SectionLabel>

                <ul className="space-y-0.5">
                  <li>
                    <NavItem to="/reports" icon={TrendingUp} theme="analytics">
                      Reports
                    </NavItem>
                  </li>

                  <li>
                    <NavItem to="/analytics" icon={BarChart3} theme="analytics">
                      Charts
                    </NavItem>
                  </li>
                </ul>
              </div>
            </PermissionGuard>

            {/* Users - Violet Theme */}
            <PermissionGuard permission="show_member">
              <div className="mb-1">
                <SectionLabel theme="users">Users</SectionLabel>

                <ul className="space-y-0.5">
                  <PermissionGuard permission="create_member">
                    <li>
                      <NavItem to="/newuser" icon={UserPlus} theme="users">
                        Add User
                      </NavItem>
                    </li>
                  </PermissionGuard>

                  <PermissionGuard permission="show_member">
                    <li>
                      <NavItem to="/user" icon={UserCog} theme="users">
                        Users List
                      </NavItem>
                    </li>
                  </PermissionGuard>
                </ul>
              </div>
            </PermissionGuard>

            {/* HRM - Rose Theme */}
            <PermissionGuard permission="view_staff">
              <div className="mb-1">
                <SectionLabel theme="hrm">HRM</SectionLabel>

                <ul className="space-y-0.5">
                  <li>
                    <NavItem to="/staff" icon={Briefcase} theme="hrm">
                      Staff
                    </NavItem>
                  </li>
                </ul>
              </div>
            </PermissionGuard>

            {/* Settings - Slate Theme */}
            <DropdownSection
              label="Settings"
              icon={Settings}
              isOpen={openDropdown.setting}
              onToggle={() => toggle("setting")}
              theme="settings"
            >
              <ul className="space-y-0.5">
                <PermissionGuard permission="show_general_settings">
                  <li>
                    <NavItem to="/settings" icon={Settings} child theme="settings">
                      General Settings
                    </NavItem>
                  </li>
                </PermissionGuard>

                <PermissionGuard permission="show_permission">
                  <li>
                    <NavItem to="/permissionsettings" icon={Shield} child theme="settings">
                      Permissions
                    </NavItem>
                  </li>
                </PermissionGuard>

                <PermissionGuard permission="show_roles">
                  <li>
                    <NavItem to="/roles" icon={User} child theme="settings">
                      Roles
                    </NavItem>
                  </li>
                </PermissionGuard>
              </ul>
            </DropdownSection>
          </nav>

          {/* =============================================
              FOOTER - User Info (Glass Effect)
              ============================================= */}
          <div className="relative z-10 flex-shrink-0 p-4 border-t border-white/15 dark:border-white/15">
            {/* Glass background for footer */}
            <div className="absolute inset-0 -z-10 rounded-b-2xl bg-white/5 dark:bg-white/10 backdrop-blur-md" />

            <div className="flex items-center gap-3 relative z-10">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 dark:shadow-indigo-500/40 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                  <span className="text-white text-xs font-bold relative z-10">SA</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  Store Admin
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mt-0.5">
                  Super Admin
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;