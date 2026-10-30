import { useState } from "react";
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
  Star,
  FileImage,
  User,
} from "lucide-react";
import { useSidebar } from "../../context/SidebarContext";
import { clsx } from "clsx";

const Sidebar = () => {
  const { isOpen, isMobile } = useSidebar();
  const [openDropdown, setOpenDropdown] = useState({
    product: false,
    variant: false,
    setting: false,
  });

  const toggleDropdown = (key) => {
    setOpenDropdown((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!isOpen && isMobile) return null;

  return (
    <>
      {isOpen && isMobile && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" />
      )}

      <aside
        className={clsx(
          "fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 transform border-r border-red-200 dark:border-red-800 bg-background transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          !isMobile && "lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col ">
          <div className="border-b border-red-200 dark:border-red-800 p-4">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-red-600" />
              <span className="font-semibold text-red-600">Store Admin</span>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <div className="mb-6">
              <h3 className="mb-2 px-2 text-xs font-semibold text-red-600 uppercase tracking-wider">
                Overview
              </h3>
              <ul className="space-y-1">
                <li>
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      clsx(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-red-50 dark:bg-red-950 text-red-600"
                          : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                      )
                    }
                  >
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* Product Dropdown */}
            <div className="mb-6">
              <h3
                className="flex items-center justify-between px-2 text-xs font-semibold text-red-600 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleDropdown("product")}
              >
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4" /> Product
                </span>
                {openDropdown.product ? <ChevronDown /> : <ChevronRight />}
              </h3>
              {openDropdown.product && (
                <ul className="mt-2 ml-6 space-y-1">
                  <li>
                    <NavLink
                      to="/products"
                      className={({ isActive }) =>
                        clsx(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-red-50 dark:bg-red-950 text-red-600"
                            : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                        )
                      }
                    >
                      Products
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/headcategory"
                      className={({ isActive }) =>
                        clsx(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-red-50 dark:bg-red-950 text-red-600"
                            : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                        )
                      }
                    >
                      Main Categories
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/parentcategory"
                      className={({ isActive }) =>
                        clsx(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-red-50 dark:bg-red-950 text-red-600"
                            : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                        )
                      }
                    >
                      Parent Categories
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/childcategory"
                      className={({ isActive }) =>
                        clsx(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-red-50 dark:bg-red-950 text-red-600"
                            : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                        )
                      }
                    >
                      Child Categories
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/producttags"
                      className={({ isActive }) =>
                        clsx(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-red-50 dark:bg-red-950 text-red-600"
                            : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                        )
                      }
                    >
                      Product Tags
                    </NavLink>
                  </li>

                  <li>
                    <NavLink
                      to="/discounts"
                      className={({ isActive }) =>
                        clsx(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-red-50 dark:bg-red-950 text-red-600"
                            : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                        )
                      }
                    >
                      Discounts
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/brands"
                      className={({ isActive }) =>
                        clsx(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-red-50 dark:bg-red-950 text-red-600"
                            : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                        )
                      }
                    >
                      Brands
                    </NavLink>
                  </li>
                </ul>
              )}
            </div>

            {/* Variants Dropdown */}
            <div className="mb-6">
              <h3
                className="flex items-center justify-between px-2 text-xs font-semibold text-red-600 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleDropdown("variant")}
              >
                <span className="flex items-center gap-2">
                  <List className="h-4 w-4" /> Variants
                </span>
                {openDropdown.variant ? <ChevronDown /> : <ChevronRight />}
              </h3>
              {openDropdown.variant && (
                <ul className="mt-2 ml-6 space-y-1">
                  <li>
                    <NavLink
                      to="/colors"
                      className={({ isActive }) =>
                        clsx(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-red-50 dark:bg-red-950 text-red-600"
                            : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                        )
                      }
                    >
                      Colors
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/sizes"
                      className={({ isActive }) =>
                        clsx(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-red-50 dark:bg-red-950 text-red-600"
                            : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                        )
                      }
                    >
                      Sizes
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/seasons"
                      className={({ isActive }) =>
                        clsx(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-red-50 dark:bg-red-950 text-red-600"
                            : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                        )
                      }
                    >
                      Seasons
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/fabric"
                      className={({ isActive }) =>
                        clsx(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-red-50 dark:bg-red-950 text-red-600"
                            : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                        )
                      }
                    >
                      Fabric
                    </NavLink>
                  </li>
                </ul>
              )}
            </div>

            {/* Management */}
            <div className="mb-6">
              <h3 className="mb-2 px-2 text-xs font-semibold text-red-600 uppercase tracking-wider">
                Management
              </h3>
              <ul className="space-y-1">
                <li>
                  <NavLink
                    to="/orders"
                    className={({ isActive }) =>
                      clsx(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-red-50 dark:bg-red-950 text-red-600"
                          : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                      )
                    }
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Orders</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/customers"
                    className={({ isActive }) =>
                      clsx(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-red-50 dark:bg-red-950 text-red-600"
                          : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                      )
                    }
                  >
                    <Users className="h-4 w-4" />
                    <span>Customers</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/coupons"
                    className={({ isActive }) =>
                      clsx(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-red-50 dark:bg-red-950 text-red-600"
                          : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                      )
                    }
                  >
                    <Tag className="h-4 w-4" />
                    <span>Coupons</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/content"
                    className={({ isActive }) =>
                      clsx(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-red-50 dark:bg-red-950 text-red-600"
                          : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                      )
                    }
                  >
                    <FileImage className="h-4 w-4" />
                    <span>Content</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/reviews"
                    className={({ isActive }) =>
                      clsx(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-red-50 dark:bg-red-950 text-red-600"
                          : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                      )
                    }
                  >
                    <Star className="h-4 w-4" />
                    <span>Review</span>
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* Analytics */}
            <div className="mb-6">
              <h3 className="mb-2 px-2 text-xs font-semibold text-red-600 uppercase tracking-wider">
                Analytics
              </h3>
              <ul className="space-y-1">
                <li>
                  <NavLink
                    to="/reports"
                    className={({ isActive }) =>
                      clsx(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-red-50 dark:bg-red-950 text-red-600"
                          : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                      )
                    }
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Reports</span>
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* Users */}
            <div className="mb-6">
              <h3 className="mb-2 px-2 text-xs font-semibold text-red-600 uppercase tracking-wider">
                Users
              </h3>
              <ul className="space-y-1">
                <li>
                  <NavLink
                    to="/newuser"
                    className={({ isActive }) =>
                      clsx(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-red-50 dark:bg-red-950 text-red-600"
                          : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                      )
                    }
                  >
                    <User className="h-4 w-4" />
                    <span>Add User</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/user"
                    className={({ isActive }) =>
                      clsx(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-red-50 dark:bg-red-950 text-red-600"
                          : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                      )
                    }
                  >
                    <Users className="h-4 w-4" />
                    <span>Users List</span>
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* HRM */}
            {/* <div className="mb-6">
              <h3 className="mb-2 px-2 text-xs font-semibold text-red-600 uppercase tracking-wider">
                HRM
              </h3>
              <ul className="space-y-1">
                <li>
                  <NavLink
                    to="/staff"
                    className={({ isActive }) =>
                      clsx(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-red-50 dark:bg-red-950 text-red-600"
                          : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                      )
                    }
                  >
                    <Users className="h-4 w-4" />
                    <span>Staff</span>
                  </NavLink>
                </li>
              </ul>
            </div> */}

            {/* Settings Dropdown */}
            <div className="mb-6">
              <h3
                className="flex items-center justify-between px-2 text-xs font-semibold text-red-600 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleDropdown("setting")}
              >
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Settings
                </span>
                {openDropdown.setting ? <ChevronDown /> : <ChevronRight />}
              </h3>
              {openDropdown.setting && ( // ✅ fix this
                <ul className="mt-2 ml-6 space-y-1">
                  <li>
                    <NavLink
                      to="/settings"
                      className={({ isActive }) =>
                        clsx(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-red-50 dark:bg-red-950 text-red-600"
                            : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                        )
                      }
                    >
                      General Settings
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/permissionsettings"
                      className={({ isActive }) =>
                        clsx(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-red-50 dark:bg-red-950 text-red-600"
                            : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                        )
                      }
                    >
                      Permission
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/roles"
                      className={({ isActive }) =>
                        clsx(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-red-50 dark:bg-red-950 text-red-600"
                            : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                        )
                      }
                    >
                      Role
                    </NavLink>
                  </li>
                </ul>
              )}
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;