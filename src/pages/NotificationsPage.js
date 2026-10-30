// "use client";

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
// } from "../components/ui/Card";
// import Button from "../components/ui/Button";
// import {
//   Table,
//   TableHeader,
//   TableRow,
//   TableHead,
//   TableBody,
//   TableCell,
// } from "../components/ui/Table";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const API_BASE = "http://127.0.0.1:8000/api";

// // 🔑 Helper: get token (from localStorage or context)
// const getAuthHeaders = () => {
//   const token = localStorage.getItem("token"); // ya aapke context se le sakte ho
//   return {
//     headers: { Authorization: `Bearer ${token}` },
//   };
// };

// const NotificationsPage = () => {
//   const [notifications, setNotifications] = useState([]);
//   const [count, setCount] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [selectedNotification, setSelectedNotification] = useState(null);

//   // Fetch All Notifications
//   const fetchNotifications = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(
//         `${API_BASE}/notifications`,
//         getAuthHeaders()
//       );
//       setNotifications(res.data || []);
//     } catch (error) {
//       toast.error("Failed to load notifications");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch Count (unread or last 7 days)
//   const fetchCount = async () => {
//     try {
//       const res = await axios.get(
//         `${API_BASE}/notification-count`,
//         getAuthHeaders()
//       );
//       setCount(res.data?.count || 0);
//     } catch (error) {
//       console.error("Count fetch error:", error);
//     }
//   };

//   // Get Single Notification
//   const getNotification = async (id) => {
//     try {
//       const res = await axios.get(
//         `${API_BASE}/notifications/${id}`,
//         getAuthHeaders()
//       );
//       setSelectedNotification(res.data);
//     } catch (error) {
//       toast.error("Failed to fetch notification");
//     }
//   };

//   // Delete Notification
//   const deleteNotification = async (id) => {
//     try {
//       await axios.delete(`${API_BASE}/notifications/${id}`, getAuthHeaders());
//       toast.success("Notification deleted");
//       fetchNotifications();
//       fetchCount();
//     } catch (error) {
//       toast.error("Delete failed");
//     }
//   };

//   // Mark Single as Read
//   const markAsRead = async (id) => {
//     try {
//       await axios.put(`${API_BASE}/notifications/${id}`, {}, getAuthHeaders());
//       toast.success("Marked as read");
//       fetchNotifications();
//       fetchCount();
//     } catch (error) {
//       toast.error("Failed to mark as read");
//     }
//   };

//   // Mark All as Read
//   const markAllAsRead = async () => {
//     try {
//       await axios.put(`${API_BASE}/mark-as-all-read`, {}, getAuthHeaders());
//       toast.success("All notifications marked as read");
//       fetchNotifications();
//       fetchCount();
//     } catch (error) {
//       toast.error("Failed to mark all as read");
//     }
//   };

//   useEffect(() => {
//     fetchNotifications();
//     fetchCount();
//   }, []);

//   return (
//     <div className="p-4">
//       <ToastContainer />
//       <Card className="shadow-md rounded-xl">
//         <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
//           <CardTitle className="text-lg sm:text-xl font-semibold">
//             Notifications ({count} unread)
//           </CardTitle>
//           <Button
//             onClick={markAllAsRead}
//             className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm sm:text-base"
//           >
//             Mark All as Read
//           </Button>
//         </CardHeader>
//         <CardContent>
//           {loading ? (
//             <p className="text-center text-gray-500">Loading...</p>
//           ) : (
//             <div className="overflow-x-auto">
//               <Table className="w-full min-w-[600px]">
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>ID</TableHead>
//                     <TableHead>Message</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {notifications.length > 0 ? (
//                     notifications.map((n) => (
//                       <TableRow
//                         key={n.id}
//                         className={`${
//                           n.read
//                             ? "bg-gray-100 dark:bg-gray-700"
//                             : "bg-red-50 dark:bg-gray-800"
//                         }`}
//                       >
//                         <TableCell className="whitespace-nowrap">
//                           {n.id}
//                         </TableCell>
//                         <TableCell className="break-words max-w-[250px]">
//                           {n.message}
//                         </TableCell>
//                         <TableCell>
//                           {n.read ? (
//                             <span className="text-green-600">Read</span>
//                           ) : (
//                             <span className="text-red-600">Unread</span>
//                           )}
//                         </TableCell>
//                         <TableCell className="flex flex-wrap gap-2">
//                           <Button
//                             onClick={() => getNotification(n.id)}
//                             className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
//                           >
//                             View
//                           </Button>
//                           {!n.read && (
//                             <Button
//                               onClick={() => markAsRead(n.id)}
//                               className="bg-green-500 text-white px-2 py-1 rounded text-sm"
//                             >
//                               Mark Read
//                             </Button>
//                           )}
//                           <Button
//                             onClick={() => deleteNotification(n.id)}
//                             className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
//                           >
//                             Delete
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   ) : (
//                     <TableRow>
//                       <TableCell colSpan="4" className="text-center py-4">
//                         No notifications found
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Single Notification Modal */}
//       {selectedNotification && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-3">
//           <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md">
//             <h2 className="text-lg font-semibold mb-2">Notification Detail</h2>
//             <p className="text-gray-700 dark:text-gray-300">
//               {selectedNotification.message}
//             </p>
//             <div className="mt-4 flex justify-end space-x-2">
//               <Button
//                 onClick={() => setSelectedNotification(null)}
//                 className="bg-gray-500 text-white px-4 py-1 rounded"
//               >
//                 Close
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NotificationsPage;

// src/pages/NotificationsPage.js
// src/pages/NotificationsPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "http://127.0.0.1:8000/api";

// 🔑 Helper function to attach token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [readCount, setReadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  const navigate = useNavigate();

  // Fetch Notifications
  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE}/notifications?page=${page}`,
        getAuthHeaders()
      );
      const data = res.data.data || [];
      setNotifications(data);
      setPagination(res.data.meta || {});
      updateCounts(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const updateCounts = (data) => {
    const unread = data.filter((n) => !n.read_at).length;
    const read = data.filter((n) => n.read_at).length;
    setUnreadCount(unread);
    setReadCount(read);
  };

  // MARK SINGLE AS READ
  const markAsRead = async (id) => {
    try {
      await axios.get(`${API_BASE}/mark-as-read/${id}`, getAuthHeaders());
      toast.success("Notification marked as read", { autoClose: 2000 });
      fetchNotifications(currentPage);
    } catch (err) {
      console.error(err);
    }
  };

  // MARK ALL AS READ
  const markAllAsRead = async () => {
    try {
      await axios.post(
        `${API_BASE}/mark-as-all-read`,
        {
          ids: selectedNotifications, // ✅ ids array
          _method: "POST", // ✅ same as single delete
        },
        getAuthHeaders()
      );

      toast.success("All notifications marked as read", { autoClose: 2000 });

      setSelectedNotifications([]);
      fetchNotifications(currentPage);
    } catch (err) {
      console.error(err);
    }
  };

  // DELETE SINGLE NOTIFICATION
  const deleteNotification = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this notification?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post(
            `${API_BASE}/notifications/${id}`,
            { _method: "DELETE" },
            getAuthHeaders()
          );
          Swal.fire(
            "Deleted!",
            "The notification has been deleted.",
            "success"
          );
          fetchNotifications();
        } catch (err) {
          console.error("❌ Delete failed:", err);
          Swal.fire("Error", "Failed to delete order.", "error");
        }
      }
    });
  };

  // BULK DELETE
  const bulkDelete = async () => {
    if (selectedNotifications.length === 0) {
      toast.warning("Please select notifications to delete");
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete selected notifications?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete all!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post(
            `${API_BASE}/notification/bulk-delete`,
            {
              ids: selectedNotifications, // ✅ ids array
              _method: "POST", // ✅ same as single delete
            },
            getAuthHeaders()
          );

          setSelectedNotifications([]);
          fetchNotifications(currentPage);

          Swal.fire(
            "Deleted!",
            "Selected notifications have been deleted.",
            "success"
          );
        } catch (err) {
          console.error("❌ Bulk delete failed:", err);
          Swal.fire("Error", "Failed to delete notifications.", "error");
        }
      }
    });
  };

  // VIEW NOTIFICATION
  const handleView = (notification) => {
    if (!notification) return;
    let id;
    if (notification.url) {
      const parts = notification.url.split("/");
      const lastPart = parts[parts.length - 1];
      if (!isNaN(lastPart)) id = lastPart;
    }
    if (!id && notification.request_id) id = notification.request_id;

    if (
      notification.url?.includes("/admin/orders") ||
      notification.data?.type === "order_placed"
    ) {
      navigate(`/view-orders/${id}`);
    } else if (
      notification.url?.includes("/admin/products") ||
      notification.data?.type === "product"
    ) {
      navigate(`/view-product/${id}`);
    } else if (
      notification.url?.includes("/admin/users") ||
      notification.data?.type?.toLowerCase().includes("user")
    ) {
      navigate(`/view-user/${id}`);
    } else {
      window.open(notification.url, "_blank");
    }
  };

  // PAGINATION
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchNotifications(page);
  };

  // BULK SELECT
  const toggleSelect = (id) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(selectedNotifications.filter((x) => x !== id));
    } else {
      setSelectedNotifications([...selectedNotifications, id]);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold dark:text-white">Notifications</h1>
        <div className="flex gap-2 items-center">
          <span className="px-3 py-1 bg-red-500 text-white rounded-full">
            Unread: {unreadCount}
          </span>
          <span className="px-3 py-1 bg-gray-500 text-white rounded-full">
            Read: {readCount}
          </span>
          <button
            onClick={markAllAsRead}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Mark All Read
          </button>
          <button
            onClick={bulkDelete}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Delete Selected
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p>No notifications available</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`p-4 border rounded shadow flex justify-between items-start 
    ${
      n.read_at
        ? "bg-gray-100 dark:bg-gray-500 dark:text-black" // ✅ dark mode me text black
        : " dark:bg-gray-900 dark:text-white"
    }  // unread notifications
  `}
            >
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-2"
                  checked={selectedNotifications.includes(n.id)}
                  onChange={() => toggleSelect(n.id)}
                />
                <div>
                  <h3 className=" text-md">{n.head}</h3>
                  <p className="text-sm">{n.body}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {n.url && (
                  <button
                    onClick={() => handleView(n)}
                    className="text-sm bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    View
                  </button>
                )}
                {!n.read_at && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="text-sm bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Mark Read
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(n.id)}
                  className="text-sm bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pagination.links && (
        <div className="flex justify-center mt-4 space-x-2">
          {pagination.links.map((link, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(link.page)}
              disabled={!link.page || link.active}
              className={`px-3 py-1 rounded border ${
                link.active ? "bg-blue-500 text-white" : "bg-white text-black"
              }`}
            >
              {link.label.replace(/&laquo;/g, "«").replace(/&raquo;/g, "»")}
            </button>
          ))}
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default NotificationsPage;
