// "use client";

// import { useState, useEffect, useRef } from "react";
// import { PackageX, Bell, User, LogOut, Settings, Menu } from "lucide-react";
// import Button from "../ui/Button";
// import Badge from "../ui/Badge";
// import { useAuth } from "../../context/AuthContext";
// import { useSidebar } from "../../context/SidebarContext";
// import ThemeToggle from "../common/ThemeToggle";
// import { useNavigate } from "react-router-dom";

// const Navbar = () => {
//   const { user, logout } = useAuth();
//   const { toggleSidebar } = useSidebar();
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [showUserMenu, setShowUserMenu] = useState(false);
//   const navigate = useNavigate();

//   const userMenuRef = useRef(null);
//   const notificationRef = useRef(null);

//   const notifications = [
//     {
//       id: 1,
//       title: "New Order Received",
//       message: "Order #ORD-001 from John Doe",
//       time: "2 minutes ago",
//       read: false,
//     },
//     {
//       id: 2,
//       title: "Low Stock Alert",
//       message: "Wireless Headphones - Only 5 left",
//       time: "1 hour ago",
//       read: false,
//     },
//     {
//       id: 3,
//       title: "Customer Review",
//       message: "New 5-star review on Smart Watch",
//       time: "3 hours ago",
//       read: true,
//     },
//   ];

//   const handleLogout = () => {
//     logout(); // context se user clear karega
//     navigate("/auth/login"); // redirect to login page
//   };

//   const unreadCount = notifications.filter((n) => !n.read).length;

//   // ✅ Close dropdowns when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
//         setShowUserMenu(false);
//       }
//       if (
//         notificationRef.current &&
//         !notificationRef.current.contains(event.target)
//       ) {
//         setShowNotifications(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-red-200 dark:border-red-800 dark:bg-gray-900 backdrop-blur shadow-sm">
//       <div className="flex h-16 items-center px-4">
//         <div className="flex items-center gap-2">
//           {/* Mobile Menu Toggle */}
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={toggleSidebar}
//             className="md:hidden"
//           >
//             <Menu className="h-5 w-5 dark:text-white" />
//           </Button>
//           <h1 className="text-lg font-semibold text-red-600">TYKA</h1>
//         </div>

//         <div className="ml-auto flex items-center gap-4">
//           {/* Stock Alert */}
//           <div className="relative">
//             <Button
//               variant="outline"
//               size="icon"
//               onClick={() => navigate("/stockalert")}
//             >
//               <PackageX className="h-5 w-5 text-red-600 dark:text-red-400" />
//             </Button>
//           </div>

//           <ThemeToggle />

//           {/* Notifications */}
//           <div className="relative" ref={notificationRef}>
//             <Button
//               variant="outline"
//               size="icon"
//               onClick={() => setShowNotifications(!showNotifications)}
//             >
//               <Bell className="h-5 w-5 dark:text-white" />
//               {unreadCount > 0 && (
//                 <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-600">
//                   {unreadCount}
//                 </Badge>
//               )}
//             </Button>

//             {showNotifications && (
//               <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-50">
//                 <div className="p-4">
//                   <div className="flex items-center justify-between mb-4">
//                     <h4 className="font-semibold">Notifications</h4>
//                     <Badge variant="secondary">{unreadCount} new</Badge>
//                   </div>
//                   <div className="space-y-2 max-h-80 overflow-y-auto">
//                     {notifications.map((notification) => (
//                       <div
//                         key={notification.id}
//                         className={`p-3 rounded-lg border ${
//                           !notification.read
//                             ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
//                             : "bg-muted/50"
//                         }`}
//                       >
//                         <div className="flex items-start justify-between">
//                           <div className="space-y-1">
//                             <p className="text-sm font-medium">
//                               {notification.title}
//                             </p>
//                             <p className="text-xs text-muted-foreground">
//                               {notification.message}
//                             </p>
//                             <p className="text-xs text-muted-foreground">
//                               {notification.time}
//                             </p>
//                           </div>
//                           {!notification.read && (
//                             <div className="w-2 h-2 bg-red-600 rounded-full mt-1"></div>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* User Menu */}
//           <div className="relative" ref={userMenuRef}>
//             <Button
//               variant="outline"
//               size="icon"
//               onClick={() => setShowUserMenu(!showUserMenu)}
//             >
//               <User className="h-5 w-5 text-black dark:text-white" />
//             </Button>

//             {showUserMenu && (
//               <div className="absolute right-0 mt-2 w-56 dark:text-white bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-50">
//                 {user ? (
//                   <>
//                     <div className="p-3 border-b dark:border-gray-700">
//                       <div className="flex flex-col space-y-0.5">
//                         {" "}
//                         {/* 👈 kam spacing */}
//                         <p className="text-sm font-medium leading-none">
//                           {user?.name || "Admin User"}
//                         </p>
//                         {/* <p className="text-xs leading-none text-muted-foreground mb-6">
//         {user?.email}
//       </p> */}
//                       </div>
//                     </div>
//                     <div className="p-1">
//                       {" "}
//                       {/* 👈 outer padding kam */}
//                       <button
//                         onClick={() => {
//                           navigate("/profile");
//                           setShowUserMenu(false);
//                         }}
//                         className="flex w-full items-center px-2 py-1.5 text-sm hover:bg-accent rounded-md"
//                       >
//                         <User className="mr-2 h-4 w-4" />
//                         <span>Profile</span>
//                       </button>
//                       <button
//                         onClick={() => {
//                           navigate("/settings");
//                           setShowUserMenu(false);
//                         }}
//                         className="flex w-full items-center px-2 py-1.5 text-sm hover:bg-accent rounded-md"
//                       >
//                         <Settings className="mr-2 h-4 w-4" />
//                         <span>Settings</span>
//                       </button>
//                       <div className="border-t my-1 dark:border-gray-700"></div>{" "}
//                       {/* 👈 my-2 → my-1 */}
//                       <button
//                         onClick={handleLogout}
//                         className="flex w-full items-center px-2 py-1.5 text-sm text-red-600 hover:bg-accent rounded-md"
//                       >
//                         <LogOut className="mr-2 h-4 w-4" />
//                         <span>Log out</span>
//                       </button>
//                     </div>
//                   </>
//                 ) : (
//                   <div className="p-2">
//                     <button
//                       onClick={() => {
//                         navigate("/auth/login");
//                         setShowUserMenu(false);
//                       }}
//                       className="flex w-full items-center px-2 py-2 text-sm hover:bg-accent rounded-md"
//                     >
//                       <LogOut className="mr-2 h-4 w-4" />
//                       <span>Login</span>
//                     </button>
//                     <button
//                       onClick={() => {
//                         navigate("/auth/signup");
//                         setShowUserMenu(false);
//                       }}
//                       className="flex w-full items-center px-2 py-2 text-sm hover:bg-accent rounded-md"
//                     >
//                       <User className="mr-2 h-4 w-4" />
//                       <span>Signup</span>
//                     </button>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Navbar;

"use client";

import { useState, useEffect, useRef } from "react";
import { PackageX, Bell, User, LogOut, Settings, Menu } from "lucide-react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { useAuth } from "../../context/AuthContext";
import { useSidebar } from "../../context/SidebarContext";
import ThemeToggle from "../common/ThemeToggle";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PermissionGuard from "../auth/PermissionGuard";

const API_BASE = "http://127.0.0.1:8000/api";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useSidebar();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // 🔑 Fetch notifications from API
  // useEffect(() => {
  //   const fetchNotifications = async () => {
  //     try {
  //       const token = localStorage.getItem("token");
  //       const res = await axios.get(
  //         "http://127.0.0.1:8000/api/notification-count",
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );

  //       if (res.data) {
  //         const data = res.data.notifications || [];
  //         // Filter unread + last 7 days
  //         const sevenDaysAgo = new Date();
  //         sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  //         const filtered = data.filter((n) => {
  //           const createdAt = new Date(n.created_at);
  //           return !n.read && createdAt >= sevenDaysAgo;
  //         });

  //         setNotifications(filtered);
  //         setUnreadCount(filtered.length);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching notifications:", error);
  //     }
  //   };

  //   fetchNotifications();
  // }, []);

  const fetchNotificationCount = async () => {
    try {
      const res = await axios.get(`${API_BASE}/notification-count`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // 🔑 agar token lagta hai
        },
      });
      setCount(res.data?.unread_count || 0);
    } catch (err) {
      console.error("❌ Failed to fetch notification count:", err);
    }
  };

  useEffect(() => {
    // fetchNotificationCount();

    // optional: har 60 sec me refresh karna ho to
    const interval = setInterval(fetchNotificationCount, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  // ✅ Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-red-200 dark:border-red-800 dark:bg-gray-900 backdrop-blur shadow-sm">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-2">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5 dark:text-white" />
          </Button>
          <h1 className="text-lg font-semibold text-red-600">TYKA</h1>
        </div>

        <div className="ml-auto flex items-center gap-4">
          {/* Stock Alert */}
          <div className="relative">
            <PermissionGuard permission="show_out_of_stock">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("/stockalert")}
              >
                <PackageX className="h-5 w-5 text-red-600 dark:text-red-400" />
              </Button>
            </PermissionGuard>
          </div>

          <ThemeToggle />

          {/* Notifications */}
          {/* <div className="relative" ref={notificationRef}>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5 dark:text-white" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-600">
                  {unreadCount}
                </Badge>
              )}
            </Button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-50">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Notifications</h4>
                    <Badge variant="secondary">{unreadCount} new</Badge>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-3 rounded-lg border bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <p className="text-sm font-medium">
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {notification.time}
                              </p>
                            </div>
                            <div className="w-2 h-2 bg-red-600 rounded-full mt-1"></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                        No new notifications
                      </p>
                    )}
                  </div>
                  {/* Show All Button */}
          {/* <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setShowNotifications(false);
                        navigate("/notification");
                      }}
                    >
                      Show All
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>  */}

          <PermissionGuard permission="show_notification">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/notification")}
            >
              <Bell className="h-5 w-5 dark:text-white" />
            </Button>

            {count > 0 && (
              <span className="absolute -top-1 ml-36 mt-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold">
                {count}
              </span>
            )}
          </PermissionGuard>
          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <User className="h-5 w-5 text-black dark:text-white" />
            </Button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 dark:text-white bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-50">
                {user ? (
                  <>
                    <div className="p-3 border-b dark:border-gray-700">
                      <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-medium leading-none">
                          {user?.name || "Admin User"}
                        </p>
                      </div>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={() => {
                          navigate("/profile");
                          setShowUserMenu(false);
                        }}
                        className="flex w-full items-center px-2 py-1.5 text-sm hover:bg-accent rounded-md"
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate("/settings");
                          setShowUserMenu(false);
                        }}
                        className="flex w-full items-center px-2 py-1.5 text-sm hover:bg-accent rounded-md"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </button>
                      <div className="border-t my-1 dark:border-gray-700"></div>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-2 py-1.5 text-sm text-red-600 hover:bg-accent rounded-md"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate("/auth/login");
                        setShowUserMenu(false);
                      }}
                      className="flex w-full items-center px-2 py-2 text-sm hover:bg-accent rounded-md"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Login</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate("/auth/signup");
                        setShowUserMenu(false);
                      }}
                      className="flex w-full items-center px-2 py-2 text-sm hover:bg-accent rounded-md"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Signup</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
