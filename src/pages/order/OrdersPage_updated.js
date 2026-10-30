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
import { useNavigate, useSearchParams } from "react-router-dom";
import PermissionGuard from "../../components/auth/PermissionGuard";
import {


  Package,
  Truck,
  Receipt,
  MapPinned,
} from "lucide-react";

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [ordersData, setOrdersData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ✅ page and per_page URL params
  const initialPage = Number.parseInt(searchParams.get("page") || "1", 10);
  const initialPerPage = Number.parseInt(
    searchParams.get("per_page") || "10",
    10
  );
  const [page, setPage] = useState(initialPage);
  const [entriesPerPage, setEntriesPerPage] = useState(initialPerPage);

  const [selectedIds, setSelectedIds] = useState([]);
  const [shippmentIds, setShippmentIds] = useState([]);
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

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    params.set("per_page", String(entriesPerPage));
    setSearchParams(params); // push to history so Back returns to the same page/per_page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, entriesPerPage]);

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

  const handleBulkShipping = async (shippmentIds) => {
    if (!Array.isArray(shippmentIds) || shippmentIds.length === 0) {
      Swal.fire(
        "Warning",
        "Please select orders to assign shipping",
        "warning"
      );
      return;
    }

    console.log("Selected Shipments:", shippmentIds);
    debugger;

    // ✅ Step 1: Select Provider
    const { value: provider } = await Swal.fire({
      title: "Select Shipping Provider",
      input: "radio",
      inputOptions: {
        bluedart: "Blue Dart",
        dtdc: "DTDC",
      },
      inputValidator: (value) => {
        if (!value) return "Please select a provider!";
      },
      confirmButtonText: "Select",
      showCancelButton: true,
      width: "400px",
    });

    if (!provider) return;

    // ✅ Step 2: Filter out orders already shipped by the other provider
    const filteredShipments = shippmentIds.filter((item) => {
      if (provider === "bluedart" && item.shipped_via === "dtdc") return false;
      if (provider === "dtdc" && item.shipped_via === "bluedart") return false;
      return true;
    });

    if (filteredShipments.length === 0) {
      Swal.fire(
        "Info",
        `All selected orders have already been shipped via ${
          provider === "bluedart" ? "DTDC" : "Blue Dart"
        }.`,
        "info"
      );
      return;
    }

    // ✅ Step 3: Remove Duplicate Orders (Fix for duplicate form display)
    const uniqueShipments = Array.from(
      new Map(filteredShipments.map((item) => [item.order_code, item])).values()
    );

    // ✅ Step 4: Generate Dynamic Order Forms
    const orderFormsHtml = uniqueShipments
      .map(
        (item, index) => `
    <div style="
      border:1px solid #dcdcdc;
      padding:10px 12px;
      border-radius:8px;
      margin-bottom:10px;
      background:#fdfdfd;
      text-align:left;
      font-size:13px;
    ">
      <h4 style="margin:0 0 8px 0;font-size:14px;">
        <span style="color:#444;">Order Code:</span> 
        <strong style="color:#2c3e50;">${item.order_code}</strong>
      </h4>

      <div style="display:flex;flex-direction:column;gap:8px;">
        <div>
          <label style="font-size:12px;color:#333;">Load Type:</label><br/>
          <select 
            id="load_type_${index}" 
            style="width:90%;margin-top:4px;padding:5px 8px;font-size:12px;height:32px;border:1px solid #bbb;border-radius:6px;background-color:#fff;">
            <option value="DOCUMENT">DOCUMENT</option>
            <option value="NON-DOCUMENT" selected>NON-DOCUMENT</option>
          </select>
        </div>

        <div>
          <label style="font-size:12px;color:#333;">Consignment Type:</label><br/>
          <select 
            id="consignment_type_${index}" 
            style="width:90%;margin-top:4px;padding:5px 8px;font-size:12px;height:32px;border:1px solid #bbb;border-radius:6px;background-color:#fff;">
            <option value="FORWARD" selected>FORWARD</option>
            <option value="RETURN">RETURN</option>
          </select>
        </div>
      </div>
    </div>
  `
      )
      .join("");

    // ✅ Step 5: Common Confirmation Before Submit
    const { value: confirmed } = await Swal.fire({
      title: `Assign ${
        provider === "bluedart" ? "Blue Dart" : "DTDC"
      } Shipping`,
      html: `<div style="max-height:300px;overflow-y:auto;padding-right:4px;">${orderFormsHtml}</div>`,
      width: "450px",
      confirmButtonText: "Submit",
      showCancelButton: true,
      focusConfirm: false,
      showLoaderOnConfirm: true,
      allowOutsideClick: false,
      preConfirm: async () => {
        Swal.showLoading();
        const orderData = uniqueShipments.map((item, index) => ({
          id: item.id,
          order_code: item.order_code,
          load_type: document.getElementById(`load_type_${index}`).value,
          consignment_type: document.getElementById(`consignment_type_${index}`)
            .value,
        }));
        await new Promise((res) => setTimeout(res, 400));
        return orderData;
      },
    });

    if (!confirmed) return;

    // ✅ Prepare Payload Based on Provider
    let payload;
    if (provider === "bluedart") {
      payload = {
        order_ids: confirmed.map((o) => o.id),
      };
    } else {
      payload = {
        provider,
        orders: confirmed.map((o) => ({
          id: o.id,
          order_code: o.order_code,
          load_type: o.load_type,
          consignment_type: o.consignment_type,
        })),
      };
    }

    // ✅ Loader Overlay
    const loaderOverlay = document.createElement("div");
    loaderOverlay.style.position = "fixed";
    loaderOverlay.style.top = "0";
    loaderOverlay.style.left = "0";
    loaderOverlay.style.width = "100vw";
    loaderOverlay.style.height = "100vh";
    loaderOverlay.style.background = "rgba(0,0,0,0.7)";
    loaderOverlay.style.display = "flex";
    loaderOverlay.style.alignItems = "center";
    loaderOverlay.style.justifyContent = "center";
    loaderOverlay.style.zIndex = "9999";
    loaderOverlay.innerHTML = `
    <div style="border:5px solid #f3f3f3;border-top:5px solid #e11d48;border-radius:50%;width:60px;height:60px;animation: spin 1s linear infinite;"></div>
    <style>@keyframes spin {0% {transform: rotate(0deg);}100% {transform: rotate(360deg);}}</style>
  `;
    document.body.appendChild(loaderOverlay);

    try {
      // ✅ CALL API BASED ON PROVIDER
      const url =
        provider === "bluedart"
          ? "http://127.0.0.1:8000/api/bluedart/shipment"
          : "http://127.0.0.1:8000/api/shipment";

      const res = await axios.post(url, payload);
      document.body.removeChild(loaderOverlay);

      console.log("ressssponse", res, payload);
      debugger;

      // ✅ Blue Dart Response Handling
      if (provider === "bluedart") {
        const results = res.data.results || [];
        const successShipments = results.filter((r) => r.success);
        const failedShipments = results.filter((r) => !r.success);

        const uniqueSuccess = Array.from(
          new Map(
            successShipments.map((item) => [item.order_id, item])
          ).values()
        );
        const uniqueFailed = Array.from(
          new Map(failedShipments.map((item) => [item.order_id, item])).values()
        );

        let html = `
        <p style="font-size:13px;margin-bottom:10px;">
          <strong>${res.data.message || "Blue Dart Shipment Summary"}</strong>
        </p>
        <div style="max-height:250px;overflow-y:auto;text-align:left;">`;

        if (uniqueSuccess.length > 0) {
          html += `
          <h4 style="font-size:13px;margin-bottom:5px;">Processed Shipments:</h4>
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <thead>
              <tr style="background:#f2f2f2;">
                <th style="padding:6px;border:1px solid #ddd;">Order Code</th>
                <th style="padding:6px;border:1px solid #ddd;">AWB No</th>
                <th style="padding:6px;border:1px solid #ddd;">Shipment ID</th>
                <th style="padding:6px;border:1px solid #ddd;">Label</th>
              </tr>
            </thead>
            <tbody>
              ${uniqueSuccess
                .map(
                  (item) => `
                <tr>
                  <td style="padding:5px;border:1px solid #ddd;">${item.order_id}</td>
                  <td style="padding:5px;border:1px solid #ddd;">${item.awb_no}</td>
                  <td style="padding:5px;border:1px solid #ddd;">${item.shipment_id}</td>
                  <td style="padding:5px;border:1px solid #ddd;">
                    <a href="${item.label_path}" target="_blank" style="color:#2563eb;text-decoration:underline;">View Label</a>
                  </td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>`;
        }

        if (uniqueFailed.length > 0) {
          html += `
          <h4 style="font-size:13px;color:red;margin-top:10px;">Failed Shipments:</h4>
          <table style="width:100%;border-collapse:collapse;font-size:12px;color:red;">
            <thead>
              <tr style="background:#ffecec;">
                <th style="padding:6px;border:1px solid #ddd;">Order Code</th>
                <th style="padding:6px;border:1px solid #ddd;">Error Message</th>
              </tr>
            </thead>
            <tbody>
              ${uniqueFailed
                .map(
                  (item) => `
                <tr>
                  <td style="padding:5px;border:1px solid #ddd;">${
                    item.order_id
                  }</td>
                  <td style="padding:5px;border:1px solid #ddd;">${
                    item.message || "Error"
                  }</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>`;
        }

        html += `</div>`;

        Swal.fire({
          title: "Blue Dart Summary",
          html,
          icon: "success",
          width: "600px",
          confirmButtonText: "OK",
        }).then(() => {
          setSelectedIds([]);
          setShippmentIds([]);
        });
      }

      // ✅ DTDC Response Handling (Modified)
      if (provider === "dtdc") {
        const responseData = res.data.data || res.data;
        const { message, processed = [], failed = [] } = responseData;

        // 👉 Move shipments without consignment_number to failed
        const processedWithNumber = [];
        const failedWithMissingNumber = [];

        processed.forEach((item) => {
          if (!item.consignment_number) {
            failedWithMissingNumber.push({
              order_id: item.order_id,
              reason: "Shipment failed: Consignment number not generated",
            });
          } else {
            processedWithNumber.push(item);
          }
        });

        const finalFailed = [...failed, ...failedWithMissingNumber];

        const uniqueProcessed = Array.from(
          new Map(
            processedWithNumber.map((item) => [item.order_id, item])
          ).values()
        );
        const uniqueFailed = Array.from(
          new Map(finalFailed.map((item) => [item.order_id, item])).values()
        );

        let html = `
      <p style="font-size:13px;margin-bottom:10px;">
        <strong>${message || "DTDC Shipment Summary"}</strong>
      </p>
      <div style="max-height:250px;overflow-y:auto;text-align:left;">`;

        if (uniqueProcessed.length > 0) {
          html += `
        <h4 style="font-size:13px;margin-bottom:5px;">Processed Shipments:</h4>
        <table style="width:100%;border-collapse:collapse;font-size:12px;text-align:left;">
          <thead>
            <tr style="background:#f2f2f2;border-bottom:1px solid #ddd;">
              <th style="padding:6px;border:1px solid #ddd;">Order Code</th>
              <th style="padding:6px;border:1px solid #ddd;">Service</th>
              <th style="padding:6px;border:1px solid #ddd;">Mode</th>
              <th style="padding:6px;border:1px solid #ddd;">Shipment ID</th>
              <th style="padding:6px;border:1px solid #ddd;">Consignment #</th>
            </tr>
          </thead>
          <tbody>
            ${uniqueProcessed
              .map(
                (item) => `
                <tr>
                  <td style="padding:5px;border:1px solid #ddd;">${item.order_id}</td>
                  <td style="padding:5px;border:1px solid #ddd;">${item.service_used}</td>
                  <td style="padding:5px;border:1px solid #ddd;">${item.mode}</td>
                  <td style="padding:5px;border:1px solid #ddd;">${item.shipment_id}</td>
                  <td style="padding:5px;border:1px solid #ddd;">${item.consignment_number}</td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>`;
        }

        if (uniqueFailed.length > 0) {
          html += `
        <h4 style="font-size:13px;color:red;margin-top:10px;">Failed Shipments:</h4>
        <table style="width:100%;border-collapse:collapse;font-size:12px;text-align:left;color:red;">
          <thead>
            <tr style="background:#ffecec;border-bottom:1px solid #ddd;">
              <th style="padding:6px;border:1px solid #ddd;">Order Code</th>
              <th style="padding:6px;border:1px solid #ddd;">Reason</th>
            </tr>
          </thead>
          <tbody>
            ${uniqueFailed
              .map(
                (item) => `
                <tr>
                  <td style="padding:5px;border:1px solid #ddd;">${
                    item.order_id
                  }</td>
                  <td style="padding:5px;border:1px solid #ddd;">${
                    item.reason || "Unknown"
                  }</td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>`;
        }

        html += `</div>`;

        Swal.fire({
          title: "DTDC Summary",
          html,
          icon: "success",
          width: "600px",
          confirmButtonText: "OK",
        }).then(() => {
          setSelectedIds([]);
          setShippmentIds([]);
        });
      }
    } catch (err) {
      document.body.removeChild(loaderOverlay);
      console.error(err);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to assign shipment",
        "error"
      );
    }
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
    <div className="w- max-w-full overflow-x-hidden">
      {/* Google Fonts import — kept as a style tag since Tailwind can't inject @import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .om-mono { font-family: 'DM Mono', monospace; }
        .om-amount { font-family: 'DM Mono', monospace; }
        .om-order-code { font-family: 'DM Mono', monospace; }
        .om-date { font-family: 'DM Mono', monospace; }
      `}</style>

      <div className="space-y-4 sm:space-y-5 px-3 sm:px-4 lg:px-6">

        {/* ── Page Header ── */}
        <div className="w-full max-w-full">
          <h1 className="text-[clamp(20px,2.5vw,26px)] font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Order Management
          </h1>
          <p className="text-[13px] text-gray-400 mt-0.5">Manage and process customer orders</p>
        </div>

        {/* ── Main Card ── */}
        <div className="w-full max-w-full bg-white dark:bg-[#111318] border border-[#e8e8ed] dark:border-[#1e2028] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3),0_4px_16px_rgba(0,0,0,0.4)]">
          {/* ── Card Header (dark strip) ── */}
          <div className="
            relative overflow-hidden
            rounded-t-2xl
            border-b border-gray-200 dark:border-gray-800
            bg-white dark:bg-[#111318]
            px-4 sm:px-6 py-5
          ">

            {/* BACKGROUND BLUR EFFECTS */}
            <div className="
              absolute -top-10 -right-10
              h-40 w-40
              rounded-full
              bg-green-100
              blur-3xl
              opacity-40
            " />

            <div className="
              absolute bottom-0 left-20
              h-32 w-32
              rounded-full
              bg-emerald-100
              blur-3xl
              opacity-30
            " />

            {/* DOT PATTERN */}
            <div
              className="
                absolute inset-0
                opacity-[0.03]
                [background-image:radial-gradient(#000_1px,transparent_1px)]
                [background-size:22px_22px]
              "
            />

            {/* ORDER MANAGEMENT ICONS */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none">

              <Package
                className="
                  absolute top-5 left-8
                  h-16 w-16
                  rotate-[-12deg]
                  text-green-700
                "
              />

              <Truck
                className="
                  absolute top-4 right-12
                  h-14 w-14
                  rotate-[8deg]
                  text-emerald-700
                "
              />

              <Receipt
                className="
                  absolute bottom-2 left-1/3
                  h-12 w-12
                  rotate-[10deg]
                  text-lime-700
                "
              />

              <MapPinned
                className="
                  absolute bottom-3 right-1/4
                  h-14 w-14
                  rotate-[-8deg]
                  text-green-800
                "
              />
            </div>

            {/* CONTENT */}
            <div className="relative z-10">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                {/* LEFT */}
                <div>

                  <h2 className="
                    text-[18px]
                    font-bold
                    tracking-[-0.02em]
                    text-gray-900
                    dark:text-white
                  ">
                    Orders
                  </h2>

                  <p className="
                    mt-1
                    text-[13px]
                    text-gray-500
                    dark:text-gray-400
                  ">
                    Manage and process customer orders
                  </p>
                </div>

                {/* RIGHT BUTTONS */}
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">

                  {/* SHIPPING */}
                  <button
                    className={
                      selectedIds.length > 0
                        ? "inline-flex items-center gap-1.5 bg-gradient-to-br from-emerald-500 to-green-700 text-white border-0 rounded-lg px-4 py-[7px] text-[13px] font-semibold tracking-[0.01em] cursor-pointer transition-all duration-[180ms] shadow-[0_2px_8px_rgba(16,185,129,0.35)] hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(16,185,129,0.45)]"
                        : "inline-flex items-center gap-1.5 bg-transparent text-gray-400 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-[7px] text-[13px] font-medium cursor-not-allowed opacity-40 transition-all duration-[180ms]"
                    }
                    disabled={selectedIds.length === 0}
                    onClick={() => handleBulkShipping(shippmentIds)}
                  >
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>

                    Shipping
                  </button>

                  {/* DELETE */}
                  <PermissionGuard permission="bulk_delete_order">
                    <button
                      className={
                        selectedIds.length > 0
                          ? "inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg px-4 py-[7px] text-[13px] font-semibold cursor-pointer transition-all duration-[180ms] hover:bg-red-100"
                          : "inline-flex items-center gap-1.5 bg-transparent text-gray-400 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-[7px] text-[13px] font-medium cursor-not-allowed opacity-40 transition-all duration-[180ms]"
                      }
                      disabled={selectedIds.length === 0}
                      onClick={bulkDelete}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Bulk Delete
                    </button>
                  </PermissionGuard>

                  {/* EXPORT */}
                  <PermissionGuard permission="export_order">
                    <button
                      className="
                        inline-flex items-center gap-1.5
                        bg-gradient-to-br from-emerald-500 to-green-700
                        text-white
                        border-0
                        rounded-lg
                        px-4 py-[7px]
                        text-[13px]
                        font-semibold
                        tracking-[0.01em]
                        cursor-pointer
                        transition-all duration-[180ms]
                        shadow-[0_2px_8px_rgba(16,185,129,0.35)]
                        hover:-translate-y-px
                        hover:shadow-[0_4px_14px_rgba(16,185,129,0.45)]
                      "
                      onClick={exportCSV}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export CSV
                    </button>
                  </PermissionGuard>

                  {/* FILTER */}
                  <button
                    onClick={() => setShowFilters((prev) => !prev)}
                    className="
                      inline-flex items-center gap-1.5
                      bg-white dark:bg-[#1a1d24]
                      text-gray-700 dark:text-gray-300
                      border border-gray-300 dark:border-gray-700
                      rounded-lg
                      px-4 py-[7px]
                      text-[13px]
                      font-medium
                      cursor-pointer
                      transition-all duration-[180ms]
                      hover:bg-gray-50 dark:hover:bg-[#1e2028]
                    "
                  >
                    <Filter className="h-3.5 w-3.5" />
                    Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* ── Card Content ── */}
          <div className="px-3 sm:px-4 lg:px-6 py-4">
            <div className="hidden lg:block w-full overflow-x-auto">
              <div className="overflow-x-auto w-full">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#f4f5f8] dark:bg-[#16181f] border-b-2 border-[#e8e8ed] dark:border-[#1e2028]">
                      <th className="w-9 px-3.5 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="w-[15px] h-[15px] accent-[#e63946] cursor-pointer"
                          checked={selectedIds.length === ordersData.length && ordersData.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(ordersData.map((order) => order.id));
                              setShippmentIds(ordersData.map((order) => ({ id: order.id, order_code: order.order_code })));
                            } else {
                              setSelectedIds([]);
                            }
                          }}
                        />
                      </th>
                      {["Order Code", "Customer", "Address", "Payment Type", "Amount", "Order Status", "Payment Status", "Order Date"].map((h) => (
                        <th key={h} className="px-3.5 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                      <th className="px-3.5 py-2.5 text-right text-[10.5px] font-bold uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <Loader2 className="animate-spin h-5 w-5 mx-auto text-[#e63946]" />
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-6 text-[#e63946] text-[13px]">
                          {error}
                        </TableCell>
                      </TableRow>
                    ) : ordersData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-gray-400 text-[13px]">
                          No orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      ordersData.map((order) => (
                        <tr
                          key={order.id}
                          className="transition-colors duration-[120ms] hover:[&>td]:bg-[#fafbff] dark:hover:[&>td]:bg-[#14161d]"
                        >
                          {/* Checkbox */}
                          <td className="px-3.5 py-[11px] text-[13px] text-gray-700 dark:text-gray-300 border-b border-[#f0f0f4] dark:border-[#1a1d24] align-middle">
                            <input
                              type="checkbox"
                              className="w-[15px] h-[15px] accent-[#e63946] cursor-pointer"
                              checked={selectedIds.includes(order.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIds((prev) => [...prev, order.id]);
                                  setShippmentIds((prev) => [...prev, { id: order.id, order_code: order.order_code }]);
                                } else {
                                  setSelectedIds((prev) => prev.filter((id) => id !== order.id));
                                  setShippmentIds((prev) => prev.filter((item) => item.id !== order.id));
                                }
                              }}
                            />
                          </td>

                          {/* Order Code */}
                          <td className="px-3.5 py-[11px] text-[13px] text-gray-700 dark:text-gray-300 border-b border-[#f0f0f4] dark:border-[#1a1d24] align-middle">
                            <span className="om-order-code text-[12px] font-medium text-[#e63946] bg-[rgba(230,57,70,0.07)] dark:bg-[rgba(230,57,70,0.12)] px-2 py-0.5 rounded-[5px] tracking-[0.02em]">
                              {order.order_code}
                            </span>
                          </td>

                          {/* Customer */}
                          <td className="px-3.5 py-[11px] text-[13px] border-b border-[#f0f0f4] dark:border-[#1a1d24] align-middle font-medium text-gray-900 dark:text-gray-200">
                            {order.users?.name || order.guest_name || "Guest User"}
                          </td>

                          {/* Address */}
                          <td className="px-3.5 py-[11px] text-[13px] text-gray-700 dark:text-gray-300 border-b border-[#f0f0f4] dark:border-[#1a1d24] align-middle max-w-[200px]">
                            <div className="text-[11.5px] text-gray-400 leading-snug whitespace-normal">
                              {order.user_address && typeof order.user_address.user === "object"
                                ? `${order.user_address?.street || ""}, ${order.user_address?.apartment_suite || ""}, ${order.user_address?.city?.name || ""}, ${order.user_address?.state?.name || ""}, ${order.user_address?.country?.name || ""} - ${order.user_address?.zipcode || ""}`
                                : order.guest_shipping_address || order.guest_billing_address || order.guest_phone || "No Address"}
                            </div>
                          </td>

                          {/* Payment Type */}
                          <td className="px-3.5 py-[11px] text-[13px] text-gray-700 dark:text-gray-300 border-b border-[#f0f0f4] dark:border-[#1a1d24] align-middle">
                            <span className="text-[12px] font-semibold text-indigo-500 bg-[rgba(99,102,241,0.08)] px-2.5 py-0.5 rounded-full uppercase tracking-[0.04em]">
                              {order.payment_type}
                            </span>
                          </td>

                          {/* Amount */}
                          <td className="px-3.5 py-[11px] text-[13px] text-gray-700 dark:text-gray-300 border-b border-[#f0f0f4] dark:border-[#1a1d24] align-middle">
                            <span className="om-amount font-semibold text-[13px] text-gray-900 dark:text-gray-100">
                              ₹{order.total_amount}
                            </span>
                          </td>

                          {/* Order Status */}
                          <td className="px-3.5 py-[11px] text-[13px] text-gray-700 dark:text-gray-300 border-b border-[#f0f0f4] dark:border-[#1a1d24] align-middle">
                            <select
                              value={order.order_status}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                try {
                                  await axios.post(`http://127.0.0.1:8000/api/order/${order.id}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
                                  fetchOrders();
                                  Swal.fire("Updated!", "Order status updated successfully.", "success");
                                } catch (err) {
                                  console.error("❌ Failed to update status:", err);
                                  Swal.fire("Error", "Failed to update order status.", "error");
                                }
                              }}
                              className="bg-transparent border border-[#e2e5ea] dark:border-[#2a2d38] text-gray-700 dark:text-gray-300 rounded-full px-2.5 py-1 text-[11.5px] font-semibold outline-none cursor-pointer transition-colors focus:border-[#e63946] appearance-auto"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>

                          {/* Payment Status */}
                          <td className="px-3.5 py-[11px] text-[13px] text-gray-700 dark:text-gray-300 border-b border-[#f0f0f4] dark:border-[#1a1d24] align-middle">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-[0.02em] ${
                                order.payment_status === "paid"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/25 dark:text-emerald-300"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/25 dark:text-amber-300"
                              }`}
                            >
                              {order.payment_status}
                            </span>
                          </td>

                          {/* Order Date */}
                          <td className="px-3.5 py-[11px] text-[13px] text-gray-700 dark:text-gray-300 border-b border-[#f0f0f4] dark:border-[#1a1d24] align-middle">
                            <span className="om-date text-[12px] text-gray-400">
                              {order.order_date ? new Date(order.order_date).toLocaleDateString() : "N/A"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-3.5 py-[11px] text-[13px] text-gray-700 dark:text-gray-300 border-b border-[#f0f0f4] dark:border-[#1a1d24] align-middle text-right">
                            <div className="relative inline-block">
                              <button
                                onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === order.id ? null : order.id); }}
                                className="h-[30px] w-[30px] flex items-center justify-center rounded-lg bg-transparent border-0 cursor-pointer transition-all text-gray-500 hover:bg-[#f0f0f4] hover:text-gray-900 dark:hover:bg-[#1e2028] dark:hover:text-gray-100"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>

                              {openDropdownId === order.id && (
                                <div
                                  className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-[#1a1d24] border border-[#e8e8ed] dark:border-[#252830] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] z-[9999] overflow-hidden animate-[om-drop-in_0.12s_ease]"
                                  style={{ animation: 'om-drop-in 0.12s ease' }}
                                >
                                  <style>{`
                                    @keyframes om-drop-in {
                                      from { opacity: 0; transform: translateY(-6px) scale(0.97); }
                                      to { opacity: 1; transform: translateY(0) scale(1); }
                                    }
                                  `}</style>

                                  <PermissionGuard permission="view_order">
                                    <button
                                      className="w-full px-3.5 py-2.5 flex items-center gap-2.5 text-[13px] font-medium text-gray-700 dark:text-gray-300 bg-transparent border-0 cursor-pointer text-left transition-colors hover:bg-[#f4f5f8] dark:hover:bg-[#1e2028]"
                                      onClick={() => { setOpenDropdownId(null); navigate(`/view-orders/${order.id}?page=${page}&per_page=${entriesPerPage}`); }}
                                    >
                                      <Eye className="h-3.5 w-3.5" /> View
                                    </button>
                                  </PermissionGuard>

                                  <PermissionGuard permission="edit_order">
                                    <button
                                      className="w-full px-3.5 py-2.5 flex items-center gap-2.5 text-[13px] font-medium text-gray-700 dark:text-gray-300 bg-transparent border-0 cursor-pointer text-left transition-colors hover:bg-[#f4f5f8] dark:hover:bg-[#1e2028]"
                                      onClick={() => { setOpenDropdownId(null); navigate(`/edit-orders/${order.id}?page=${page}&per_page=${entriesPerPage}`); }}
                                    >
                                      <Pencil className="h-3.5 w-3.5" /> Edit
                                    </button>
                                  </PermissionGuard>

                                  <PermissionGuard permission="pdf_packaging_slip">
                                    <button
                                      className="w-full px-3.5 py-2.5 flex items-center gap-2.5 text-[13px] font-medium text-gray-700 dark:text-gray-300 bg-transparent border-0 cursor-pointer text-left transition-colors hover:bg-[#f4f5f8] dark:hover:bg-[#1e2028]"
                                      onClick={() => { setOpenDropdownId(null); handlePrint(order); }}
                                    >
                                      <Printer className="h-3.5 w-3.5" /> Packaging Slip
                                    </button>
                                  </PermissionGuard>

                                  <PermissionGuard permission="pdf_invoice">
                                    <button
                                      className="w-full px-3.5 py-2.5 flex items-center gap-2.5 text-[13px] font-medium text-gray-700 dark:text-gray-300 bg-transparent border-0 cursor-pointer text-left transition-colors hover:bg-[#f4f5f8] dark:hover:bg-[#1e2028]"
                                      onClick={() => { setOpenDropdownId(null); handleInvoicePrint(order); }}
                                    >
                                      <FileText className="h-3.5 w-3.5" /> Invoice
                                    </button>
                                  </PermissionGuard>

                                  <div className="h-px bg-[#f0f0f4] dark:bg-[#1e2028] my-0.5" />

                                  <PermissionGuard permission="delete_order">
                                    <button
                                      className="w-full px-3.5 py-2.5 flex items-center gap-2.5 text-[13px] font-medium text-red-600 bg-transparent border-0 cursor-pointer text-left transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
                                      onClick={() => handleDelete(order.id)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" /> Delete
                                    </button>
                                  </PermissionGuard>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </TableBody>
                </table>
              </div>

              {/* ── Pagination ── */}
              <div className="flex justify-between items-center mt-4">
                <div className="text-[12.5px] text-gray-400">
                  Showing{" "}
                  <strong className="text-gray-700 dark:text-gray-300">{totalItems === 0 ? 0 : startIndex + 1}</strong>{" "}
                  to{" "}
                  <strong className="text-gray-700 dark:text-gray-300">{endIndex}</strong>{" "}
                  of{" "}
                  <strong className="text-gray-700 dark:text-gray-300">{totalItems}</strong>{" "}
                  entries
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="px-[11px] py-[5px] border border-[#e2e5ea] dark:border-[#2a2d38] rounded-[7px] text-[12.5px] font-medium bg-transparent text-gray-700 dark:text-gray-300 cursor-pointer transition-all hover:enabled:bg-[#f4f5f8] hover:enabled:border-gray-400 disabled:opacity-35 disabled:cursor-not-allowed"
                  >
                    ← Prev
                  </button>

                  <button
                    onClick={() => setPage(1)}
                    className={`px-[11px] py-[5px] border rounded-[7px] text-[12.5px] font-medium cursor-pointer transition-all ${
                      page === 1
                        ? "bg-[#e63946] text-white border-[#e63946] font-bold"
                        : "bg-transparent text-gray-700 dark:text-gray-300 border-[#e2e5ea] dark:border-[#2a2d38] hover:bg-[#f4f5f8] dark:hover:bg-[#1e2028]"
                    }`}
                  >
                    1
                  </button>

                  {page > 3 && <span className="text-gray-400 text-[13px] px-0.5">···</span>}

                  {Array.from({ length: 3 }, (_, i) => {
                    const pageNumber = page - 1 + i;
                    if (pageNumber > 1 && pageNumber < totalPages) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setPage(pageNumber)}
                          className={`px-[11px] py-[5px] border rounded-[7px] text-[12.5px] font-medium cursor-pointer transition-all ${
                            page === pageNumber
                              ? "bg-[#e63946] text-white border-[#e63946] font-bold"
                              : "bg-transparent text-gray-700 dark:text-gray-300 border-[#e2e5ea] dark:border-[#2a2d38] hover:bg-[#f4f5f8] dark:hover:bg-[#1e2028]"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                    return null;
                  })}

                  {page < totalPages - 2 && <span className="text-gray-400 text-[13px] px-0.5">···</span>}

                  {totalPages > 1 && (
                    <button
                      onClick={() => setPage(totalPages)}
                      className={`px-[11px] py-[5px] border rounded-[7px] text-[12.5px] font-medium cursor-pointer transition-all ${
                        page === totalPages
                          ? "bg-[#e63946] text-white border-[#e63946] font-bold"
                          : "bg-transparent text-gray-700 dark:text-gray-300 border-[#e2e5ea] dark:border-[#2a2d38] hover:bg-[#f4f5f8] dark:hover:bg-[#1e2028]"
                      }`}
                    >
                      {totalPages}
                    </button>
                  )}

                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="px-[11px] py-[5px] border border-[#e2e5ea] dark:border-[#2a2d38] rounded-[7px] text-[12.5px] font-medium bg-transparent text-gray-700 dark:text-gray-300 cursor-pointer transition-all hover:enabled:bg-[#f4f5f8] hover:enabled:border-gray-400 disabled:opacity-35 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
