"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import {
  Search,
  Download,
  Filter,
  Loader2,
  Eye,
  Trash2,
  Printer,
  MoreVertical,
  Pencil,
  FileText,
} from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import PermissionGuard from "../../components/auth/PermissionGuard";

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [ordersData, setOrdersData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState([]);
  const token = localStorage.getItem("token");
  const [paymentType, setPaymentType] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // Build params object with all filters
      const params = {
        search: searchTerm,
        perPage: entriesPerPage,
        page: page,
      };

      // Add filter parameters if they have values
      if (paymentType) params.payment_type = paymentType;
      if (orderStatus) params.order_status = orderStatus;
      if (paymentStatus) params.payment_status = paymentStatus;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await axios.get(
        // `http://127.0.0.1:8000/api/orders`,
        `http://127.0.0.1:8000/api/orders`,

        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.data) {
        setOrdersData(response.data.data);
        setTotalPages(response.data.meta?.last_page || 1);
        setTotalItems(response.data.meta?.total || response.data.data.length);
      } else {
        setOrdersData([]);
        setTotalPages(1);
        setTotalItems(0);
        setError("Invalid data format received");
      }
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      setError("Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (order) => {
    // ✅ Create hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;

    // ✅ Address handling (Login user vs Guest user)
    let userAddress = null;
    let isGuest = false;

    if (order.users && Object.keys(order.users).length > 0) {
      // logged-in user
      userAddress = order.user_address;
    } else if (order.guest_shipping_address || order.guest_billing_address) {
      // guest user
      isGuest = true;
      userAddress = {
        shipping: order.guest_shipping_address,
        billing: order.guest_billing_address,
      };
    }

    const productsHTML =
      order.order_details?.data
        ?.map((item) => {
          return `
      <tr>
        <td>
          <strong>${item.products?.name}</strong><br/>
          <small>SKU: ${item.products?.sku || "N/A"}</small><br/>
          <small>Colour: ${item.colors?.name || "N/A"}</small><br/>
          <small>Size: ${item.sizes?.name || "N/A"}</small>
        </td>
        <td style="text-align:center;">${item.quantity}</td>
      </tr>
    `;
        })
        .join("") || "";

    const today = new Date().toLocaleDateString();

    iframeDoc.write(`
  <html>
  <head>
    <title>Packing Slip - ${order.order_code}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 40px; }
      .header { background: #f4e0f0; padding: 20px; }
      .company-info { text-align: right; }
      .section { margin-top: 20px; }
      .section h3 { background: #eee; padding: 8px; margin: 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { border-bottom: 1px solid #ddd; padding: 8px; vertical-align: top; }
      .address-box { width: 48%; display: inline-block; vertical-align: top; }
      .footer { margin-top: 40px; font-size: 12px; color: #777; }
    </style>
  </head>
  <body>
    <div class="header">
      <div style="float: left;"><h2>Packing Slip</h2></div>
      <div class="company-info">
        <strong>Tk Sports Pvt.Ltd.</strong><br/>
        407, Leather Complex, Jalandhar – 144021, Punjab<br/>
        9803061407<br/>
        coordinator@tyka.com
      </div>
      <div style="clear: both;"></div>
    </div>

    <div class="section">
      <div class="address-box">
        <h3>Ship To:</h3>
        <p>
          ${
            isGuest
              ? userAddress?.shipping || "N/A"
              : `${order.user_address?.name || ""}<br/>
                 ${order.user_address?.street || ""}, ${
                  order.user_address?.apartment_suite || ""
                }<br/>
                 ${order.user_address?.city?.name || ""}, ${
                  order.user_address?.state?.name || ""
                }, ${order.user_address?.country?.name || ""}<br/>
                 Zip: ${order.user_address?.zipcode || ""}<br/>
                 ${order.user_address?.phone_number || ""}`
          }
        </p>
      </div>

      <div class="address-box" style="float:right;">
        <h3>Bill To:</h3>
        <p>
          ${
            isGuest
              ? userAddress?.billing || "N/A"
              : `${order.user_address?.name || ""}<br/>
                 ${order.user_address?.street || ""}, ${
                  order.user_address?.apartment_suite || ""
                }<br/>
                 ${order.user_address?.city?.name || ""}, ${
                  order.user_address?.state?.name || ""
                }, ${order.user_address?.country?.name || ""}<br/>
                 Zip: ${order.user_address?.zipcode || ""}<br/>
                 ${order.user_address?.phone_number || ""}`
          }
        </p>
      </div>
      <div style="clear: both;"></div>
    </div>

    <div class="section">
      <p><strong>Order Number:</strong> ${order.order_code}</p>
      <p><strong>Order Date:</strong> ${new Date(
        order.order_date
      ).toLocaleDateString()}</p>
      <p><strong>Shipping Method:</strong> Free Shipping</p>
    </div>

    <div class="section">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align:center;">Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${productsHTML}
        </tbody>
      </table>
    </div>

    <div class="footer">Printed on: ${today}</div>
  </body>
  </html>
`);

    iframeDoc.close();

    // ✅ Print after iframe loads
    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      // ✅ Remove iframe after printing
      setTimeout(() => document.body.removeChild(iframe), 100);
    };
  };

  const handleInvoicePrint = (order) => {
    // ✅ Create hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;

    // ✅ Pick correct address like in view
    let isGuest = false;
    let userAddress = null;

    if (order.users && Object.keys(order.users).length > 0) {
      // logged-in user
      userAddress = order.user_address;
    } else if (order.guest_shipping_address || order.guest_billing_address) {
      // guest user
      isGuest = true;
      userAddress = {
        shipping: order.guest_shipping_address,
        billing: order.guest_billing_address,
      };
    }

    const productsHTML =
      order.order_details?.data
        ?.map((item) => {
          const price = Number.parseFloat(item.price || 0);
          const total = price * item.quantity;
          return `
        <tr>
          <td>
            <strong>${item.products?.name}</strong><br/>
            <small>SKU: ${item.products?.sku || "N/A"}</small><br/>
            <small>Colour: ${item.colors?.name || "N/A"}</small><br/>
            <small>Size: ${item.sizes?.name || "N/A"}</small>
          </td>
          <td style="text-align:center;">${item.quantity}</td>
          <td style="text-align:right;">₹${price.toFixed(2)}</td>
          <td style="text-align:right;">₹${total.toFixed(2)}</td>
        </tr>
      `;
        })
        .join("") || "";

    // ✅ Calculate totals from backend fields
    const subtotal =
      order.order_details?.data?.reduce(
        (sum, item) => sum + (item.price || 0) * item.quantity,
        0
      ) || 0;

    const discount = Number.parseFloat(order.discount_amount || 0);
    const shipping = Number.parseFloat(order.shipping_charge || 0);
    const coupon =
      Array.isArray(order.coupon_id) && order.coupon_id.length > 0
        ? "Applied"
        : null;

    const grandTotal = Number.parseFloat(order.final_amount || subtotal);

    const today = new Date().toLocaleDateString();

    iframeDoc.write(`
    <html>
    <head>
      <title>Invoice - ${order.order_code}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        .header { background: #f4e0f0; padding: 20px; }
        .company-info { text-align: right; }
        .section { margin-top: 20px; }
        .section h3 { background: #eee; padding: 8px; margin: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border-bottom: 1px solid #ddd; padding: 8px; vertical-align: top; }
        .address-box { width: 48%; display: inline-block; vertical-align: top; }
        .footer { margin-top: 40px; font-size: 12px; color: #777; }
        .totals { text-align: right; margin-top: 20px; }
        .totals table { width: 300px; float: right; }
        .totals td { border: none; padding: 6px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div style="float: left;"><h2>Invoice</h2></div>
        <div class="company-info">
          <strong>Tk Sports Pvt.Ltd.</strong><br/>
          407, Leather Complex, Jalandhar – 144021, Punjab<br/>
          9803061407<br/>
          coordinator@tyka.com
        </div>
        <div style="clear: both;"></div>
      </div>

      <div class="section">
        <div class="address-box">
          <h3>Bill To:</h3>
          <p>
            ${
              isGuest
                ? userAddress.billing || "N/A"
                : `${order.user_address?.name || ""}<br/>
                   ${order.user_address?.street || ""}, ${
                    order.user_address?.apartment_suite || ""
                  }<br/>
                   ${order.user_address?.city?.name || ""}, ${
                    order.user_address?.state?.name || ""
                  }, ${order.user_address?.country?.name || ""}<br/>
                   Zip: ${order.user_address?.zipcode || ""}<br/>
                   ${order.user_address?.phone_number || ""}`
            }
          </p>
        </div>

        <div class="address-box" style="float:right;">
          <h3>Ship To:</h3>
          <p>
            ${
              isGuest
                ? userAddress.shipping || "N/A"
                : `${order.user_address?.name || ""}<br/>
                   ${order.user_address?.street || ""}, ${
                    order.user_address?.apartment_suite || ""
                  }<br/>
                   ${order.user_address?.city?.name || ""}, ${
                    order.user_address?.state?.name || ""
                  }, ${order.user_address?.country?.name || ""}<br/>
                   Zip: ${order.user_address?.zipcode || ""}<br/>
                   ${order.user_address?.phone_number || ""}`
            }
          </p>
        </div>
        <div style="clear: both;"></div>
      </div>

      <div class="section">
        <p><strong>Invoice Number:</strong> INV-${order.order_code}</p>
        <p><strong>Order Date:</strong> ${new Date(
          order.order_date
        ).toLocaleDateString()}</p>
        <p><strong>Payment Method:</strong> ${
          order.payment_type || "Prepaid"
        }</p>
      </div>

      <div class="section">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th style="text-align:center;">Qty</th>
              <th style="text-align:right;">Price</th>
              <th style="text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${productsHTML}
          </tbody>
        </table>
      </div>

      <div class="totals">
        <table>
          <tr>
            <td><strong>Subtotal:</strong></td>
            <td>₹${subtotal.toFixed(2)}</td>
          </tr>
          ${
            discount > 0
              ? `<tr><td><strong>Discount:</strong></td><td>- ₹${discount.toFixed(
                  2
                )}</td></tr>`
              : ""
          }
          ${
            coupon
              ? `<tr><td><strong>Coupon:</strong></td><td>${coupon}</td></tr>`
              : ""
          }
          ${
            shipping > 0
              ? `<tr><td><strong>Shipping:</strong></td><td>₹${shipping.toFixed(
                  2
                )}</td></tr>`
              : ""
          }
          <tr>
            <td><strong>Grand Total:</strong></td>
            <td><strong>₹${grandTotal.toFixed(2)}</strong></td>
          </tr>
        </table>
      </div>

      <div style="clear: both;"></div>

      <div class="footer">Printed on: ${today}</div>
    </body>
    </html>
  `);

    iframeDoc.close();

    // ✅ Print after iframe loads
    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 100);
    };
  };

  useEffect(() => {
    fetchOrders();
  }, [
    searchTerm,
    page,
    entriesPerPage,
    paymentType,
    orderStatus,
    paymentStatus,
    startDate,
    endDate,
  ]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This order will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(
          // `http://127.0.0.1:8000/api/orders/${id}`,
          `http://127.0.0.1:8000/api/orders/${id}`,

          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        Swal.fire("Deleted!", "The order has been deleted.", "success");
        fetchOrders();
      } catch (err) {
        console.error("❌ Delete failed:", err);
        Swal.fire("Error", "Failed to delete order.", "error");
      }
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.length === 0) {
      Swal.fire("Warning", "Please select orders to delete", "warning");
      return;
    }

    // ✅ Show confirmation dialog
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete selected orders. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await axios.post(
          "http://127.0.0.1:8000/api/order/bulk-delete",
          { ids: selectedIds },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        Swal.fire(
          "Deleted!",
          "Selected orders deleted successfully.",
          "success"
        );
        setSelectedIds([]);
        fetchOrders(); // refresh the list
      } catch (err) {
        console.error("❌ Bulk delete failed:", err);
        Swal.fire("Error", "Failed to delete selected orders.", "error");
      }
    }
  };

  const exportCSV = async () => {
    try {
      const token = localStorage.getItem("token"); // attach your auth token if required
      const response = await axios.get(
        // "http://127.0.0.1:8000/api/orders-export",
        "http://127.0.0.1:8000/api/orders-export",

        {
          responseType: "blob", // important for file downloads
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Create blob and download
      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const filename = `orders_${timestamp}.csv`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    }
  };

  const startIndex = (page - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + ordersData.length, totalItems);

  // Generate page numbers dynamically
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const applyFilters = () => {
    setPage(1); // Reset to first page when applying filters
    fetchOrders(); // Trigger new API call with current filter values
    console.log("Filters applied:", {
      paymentType,
      orderStatus,
      paymentStatus,
      startDate,
      endDate,
    });
  };

  const clearFilters = () => {
    setPaymentType("");
    setOrderStatus("");
    setPaymentStatus("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  return (
    <div className="w-11/12 max-w-full overflow-x-hidden">
      <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6">
        <div className="w-full max-w-full">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate dark:text-white">
            Order Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Manage and process customer orders
          </p>
        </div>

        <Card className="w-full max-w-full">
          <CardHeader className="px-3 sm:px-4 lg:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
              <div className="min-w-0">
                <CardTitle className="text-lg sm:text-xl truncate">
                  Orders
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  Manage and process customer orders
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <PermissionGuard permission="bulk_delete_order">
                  <Button
                    variant={selectedIds.length > 0 ? "destructive" : "outline"}
                    disabled={selectedIds.length === 0}
                    onClick={bulkDelete}
                  >
                    Bulk Delete
                  </Button>
                </PermissionGuard>
                <PermissionGuard permission="export_order">
                  <Button
                    onClick={exportCSV}
                    className="w-full sm:w-auto text-sm"
                  >
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                  </Button>
                </PermissionGuard>

                {/* Filter Toggle Button */}
                {/* ✅ Filter toggle button */}
                <Button
                  onClick={() => setShowFilters((prev) => !prev)}
                  className="w-full sm:w-auto text-sm"
                  variant="outline"
                >
                  <Filter className="mr-2 h-4 w-4" /> Filters
                </Button>
              </div>
            </div>

            {/* Top controls: show entries & search */}
            <div className="flex justify-between items-center mt-4 w-full max-w-full dark:text-white">
              <div>
                Show{" "}
                <select
                  className="border p-1 rounded bg-transparent text-sm"
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>{" "}
                entries
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="text-sm"
                />
              </div>
            </div>
            {/* ✅ Filter dropdown */}
            {showFilters && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Payment Type */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Payment Type
                    </label>
                    <select
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value)}
                      className="w-full border rounded p-2 bg-transparent dark:text-white"
                    >
                      <option value="">All</option>
                      <option value="prepaid">Prepaid</option>
                      <option value="cod">Cash on Delivery</option>
                    </select>
                  </div>

                  {/* Order Status */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Order Status
                    </label>
                    <select
                      value={orderStatus}
                      onChange={(e) => setOrderStatus(e.target.value)}
                      className="w-full border rounded p-2 bg-transparent dark:text-white"
                    >
                      <option value="">All</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Payment Status */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Payment Status
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full border rounded p-2 bg-transparent dark:text-white"
                    >
                      <option value="">All</option>
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                    </select>
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border rounded p-2 bg-transparent dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full border rounded p-2 bg-transparent dark:text-white"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                  <Button
                    onClick={applyFilters}
                    className="bg-red-600 text-white"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="px-3 sm:px-4 lg:px-6">
            <div className="hidden lg:block w-full overflow-x-auto">
              <div className="overflow-x-auto w-full">
                <Table className=" table-auto">
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <input
                          type="checkbox"
                          checked={
                            selectedIds.length === ordersData.length &&
                            ordersData.length > 0
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(
                                ordersData.map((order) => order.id)
                              );
                            } else {
                              setSelectedIds([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Order Code</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Payment Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Order Status</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">
                          <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center text-red-500"
                        >
                          {error}
                        </TableCell>
                      </TableRow>
                    ) : ordersData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center text-gray-500"
                        >
                          No orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      ordersData.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(order.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIds((prev) => [...prev, order.id]);
                                } else {
                                  setSelectedIds((prev) =>
                                    prev.filter((id) => id !== order.id)
                                  );
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>{order.order_code}</TableCell>
                          <TableCell>
                            {order.users?.name ||
                              order.guest_name ||
                              "Guest User"}
                          </TableCell>
                          <TableCell>
                            <div>
                              <small>
                                {order.user_address &&
                                typeof order.user_address.user === "object"
                                  ? `${order.user_address?.street || ""}, ${
                                      order.user_address?.apartment_suite || ""
                                    }, ${
                                      order.user_address?.city?.name || ""
                                    }, ${
                                      order.user_address?.state?.name || ""
                                    }, ${
                                      order.user_address?.country?.name || ""
                                    } - ${order.user_address?.zipcode || ""}`
                                  : order.guest_shipping_address ||
                                    order.guest_billing_address ||
                                    order.guest_phone ||
                                    "No Address"}
                              </small>
                            </div>
                          </TableCell>

                          <TableCell>{order.payment_type}</TableCell>
                          <TableCell>₹{order.total_amount}</TableCell>
                          <TableCell>
                            <select
                              value={order.order_status}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                try {
                                  await axios.post(
                                    `http://127.0.0.1:8000/api/order/${order.id}`,
                                    { status: newStatus },
                                    {
                                      headers: {
                                        Authorization: `Bearer ${token}`,
                                      },
                                    }
                                  );
                                  fetchOrders();
                                  Swal.fire(
                                    "Updated!",
                                    "Order status updated successfully.",
                                    "success"
                                  );
                                } catch (err) {
                                  console.error(
                                    "❌ Failed to update status:",
                                    err
                                  );
                                  Swal.fire(
                                    "Error",
                                    "Failed to update order status.",
                                    "error"
                                  );
                                }
                              }}
                              className="border rounded px-2 py-1 text-sm dark:bg-transparent"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </TableCell>

                          <TableCell>{order.payment_status}</TableCell>
                          <TableCell>
                            {order.order_date
                              ? new Date(order.order_date).toLocaleDateString()
                              : "N/A"}
                          </TableCell>

                          <TableCell className="relative">
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(
                                    openDropdownId === order.id
                                      ? null
                                      : order.id
                                  );
                                }}
                                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                              >
                                <MoreVertical className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                              </button>

                              {openDropdownId === order.id && (
                                <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 shadow-lg rounded-md border z-[9999]">
                                  <PermissionGuard permission="view_order">
                                    <button
                                      onClick={() => {
                                        setOpenDropdownId(null);
                                        navigate(`/view-orders/${order.id}`);
                                      }}
                                      className="w-full px-3 py-2 flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                      <Eye className="h-4 w-4" />
                                      <span>View</span>
                                    </button>
                                  </PermissionGuard>
                                  <PermissionGuard permission="edit_order">
                                    <button
                                      onClick={() => {
                                        setOpenDropdownId(null);
                                        navigate(`/edit-orders/${order.id}`);
                                      }}
                                      className="w-full px-3 py-2 flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                      <Pencil className="h-4 w-4" />
                                      <span>Edit</span>
                                    </button>
                                  </PermissionGuard>
                                  <PermissionGuard permission="pdf_packaging_slip">
                                    {/* ✅ Packaging Slip Button Updated */}
                                    <button
                                      onClick={() => {
                                        setOpenDropdownId(null);
                                        handlePrint(order); // <-- call your print function here
                                      }}
                                      className="w-full px-3 py-2 flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                      <Printer className="h-4 w-4" />
                                      <span>Packaging Slip</span>
                                    </button>
                                  </PermissionGuard>
                                  <PermissionGuard permission="pdf_invoice">
                                    <button
                                      onClick={() => {
                                        setOpenDropdownId(null); // ✅ Close dropdown first
                                        handleInvoicePrint(order); // ✅ Call invoice print function
                                      }}
                                      className="w-full px-3 py-2 flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                      <FileText className="h-4 w-4" />
                                      <span>Invoice</span>
                                    </button>
                                  </PermissionGuard>
                                  <PermissionGuard permission="delete_order">
                                    <button
                                      onClick={() => handleDelete(order.id)}
                                      className="w-full px-3 py-2 flex items-center space-x-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span>Delete</span>
                                    </button>
                                  </PermissionGuard>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination and info */}
              <div className="flex justify-between items-center mt-4 dark:text-white">
                <div>
                  Showing {totalItems === 0 ? 0 : startIndex + 1} to {endIndex}{" "}
                  of {totalItems} entries
                </div>

                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {/* First Page Always */}
                  <button
                    onClick={() => setPage(1)}
                    className={`px-3 py-1 border rounded ${
                      page === 1
                        ? "bg-red-600 text-white"
                        : "bg-transparent dark:text-white"
                    }`}
                  >
                    1
                  </button>

                  {/* Left Dots */}
                  {page > 3 && <span className="px-2">...</span>}

                  {/* Dynamic Middle Pages */}
                  {Array.from({ length: 3 }, (_, i) => {
                    const pageNumber = page - 1 + i;
                    if (pageNumber > 1 && pageNumber < totalPages) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setPage(pageNumber)}
                          className={`px-3 py-1 border rounded ${
                            page === pageNumber
                              ? "bg-red-600 text-white"
                              : "bg-transparent dark:text-white"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                    return null;
                  })}

                  {/* Right Dots */}
                  {page < totalPages - 2 && <span className="px-2">...</span>}

                  {/* Last Page Always */}
                  {totalPages > 1 && (
                    <button
                      onClick={() => setPage(totalPages)}
                      className={`px-3 py-1 border rounded ${
                        page === totalPages
                          ? "bg-red-600 text-white"
                          : "bg-transparent dark:text-white"
                      }`}
                    >
                      {totalPages}
                    </button>
                  )}

                  {/* Next Button */}
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrdersPage;
