"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import {
  Search, Download, Filter, Loader2, Eye, Trash2, Printer, MoreVertical, Pencil,
  FileText, X, ChevronLeft, ChevronRight, Truck, PackageCheck, ClipboardCheck, Boxes, MapPin,
} from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate, useSearchParams } from "react-router-dom";
import { clsx } from "clsx";
import PermissionGuard from "../../components/auth/PermissionGuard";

/* ==========================================================================
   THEME: same glass + indigo/purple look as Products / Dashboard.
   No backdrop-blur (it was the cause of scroll lag).
   ========================================================================== */
const glassCard = "bg-white/70 dark:bg-slate-900/60 border border-white/30 dark:border-white/10";
const glassInput = "bg-white/50 dark:bg-white/10 border border-white/30 dark:border-white/15";
const glassDropdown = "bg-white/95 dark:bg-slate-900/95 border border-white/20 dark:border-white/10";
const cardShadow = "shadow-xl shadow-black/5 dark:shadow-black/20";
const primaryGradient = "from-indigo-500 via-purple-500 to-indigo-600";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

const chipBase = "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap";
const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/30",
  processing: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-400/30",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-400/30",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/30",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-400/30",
};
const fieldCls = clsx(
  "h-9 w-full px-3 rounded-lg text-sm text-foreground",
  "focus:outline-none focus:ring-2 focus:ring-primary/40",
  glassInput
);

/* ==========================================================================
   MOTION (CSS only: transform/opacity) + visible text selection
   ========================================================================== */
const MOTION_CSS = `
/* Selected text stays readable: tinted highlight, original text colour kept */
::selection { background: rgba(99,102,241,0.35); color: inherit; }
::-moz-selection { background: rgba(99,102,241,0.35); color: inherit; }
.dark ::selection { background: rgba(165,180,252,0.40); color: inherit; }

@keyframes pp-wave { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes pp-float { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-6px) rotate(3deg); } }
@keyframes pp-drive { from { transform: translateX(-60px); } to { transform: translateX(110vw); } }
@keyframes pp-row-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.pp-wave-1 { animation: pp-wave 26s linear infinite; will-change: transform; }
.pp-wave-2 { animation: pp-wave 18s linear infinite reverse; will-change: transform; }
.pp-wave-3 { animation: pp-wave 12s linear infinite; will-change: transform; }
.pp-float { animation: pp-float 3.2s ease-in-out infinite; }
.pp-drive { animation: pp-drive 18s linear infinite; will-change: transform; }
.pp-row-in { animation: pp-row-in 0.28s ease-out backwards; }
@media (prefers-reduced-motion: reduce) {
  .pp-wave-1, .pp-wave-2, .pp-wave-3, .pp-float, .pp-drive, .pp-row-in { animation: none !important; }
}
`;

const WAVE_PATH =
  "M0 80 Q180 20 360 80 T720 80 T1080 80 T1440 80 T1800 80 T2160 80 T2520 80 T2880 80 L2880 160 L0 160 Z";

/* Waves with order-fulfilment icons: pick, pack, ship, deliver. A delivery truck drives across. */
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
    { Icon: ClipboardCheck, left: "7%", delay: "0s" },
    { Icon: Boxes, left: "30%", delay: "-1.1s" },
    { Icon: PackageCheck, left: "55%", delay: "-2.2s" },
    { Icon: MapPin, left: "80%", delay: "-0.6s" },
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
      <Truck
        size={24}
        strokeWidth={1.75}
        className="pp-drive absolute bottom-2 left-0 text-purple-500/50 dark:text-purple-300/50"
      />
    </div>
  );
};

/* Debounce so we don't hit the API on every keystroke */
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

/* Row actions menu: owns its open state (no whole-table re-render), closes on outside click / Esc */
const ActionsMenu = ({ order, flipUp, onView, onEdit, onPrint, onInvoice, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item = "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-foreground hover:bg-primary/5 hover:text-primary transition-colors";
  const run = (fn) => () => { setOpen(false); fn(order); };

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Actions for order ${order.order_code}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className={clsx(
          "h-8 w-8 inline-flex items-center justify-center rounded-lg transition-colors",
          "text-muted-foreground hover:bg-primary/10 hover:text-primary",
          open && "bg-primary/10 text-primary"
        )}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className={clsx(
            "absolute right-0 z-50 w-48 overflow-hidden rounded-2xl shadow-2xl text-left",
            flipUp ? "bottom-full mb-2" : "top-full mt-2",
            glassDropdown
          )}
        >
          <PermissionGuard permission="view_order">
            <button type="button" onClick={run(onView)} className={item}><Eye className="h-4 w-4" />View</button>
          </PermissionGuard>
          <PermissionGuard permission="edit_order">
            <button type="button" onClick={run(onEdit)} className={item}><Pencil className="h-4 w-4" />Edit</button>
          </PermissionGuard>
          <PermissionGuard permission="pdf_packaging_slip">
            <button type="button" onClick={run(onPrint)} className={item}><Printer className="h-4 w-4" />Packaging slip</button>
          </PermissionGuard>
          <PermissionGuard permission="pdf_invoice">
            <button type="button" onClick={run(onInvoice)} className={item}><FileText className="h-4 w-4" />Invoice</button>
          </PermissionGuard>
          <div className="border-t border-white/20 dark:border-white/10" />
          <PermissionGuard permission="delete_order">
            <button
              type="button"
              onClick={run(onDelete)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-rose-600 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" />Delete
            </button>
          </PermissionGuard>
        </div>
      )}
    </div>
  );
};

const customerName = (o) => o.users?.name || o.guest_name || "Guest User";
const addressText = (o) =>
  o.user_address && typeof o.user_address.user === "object"
    ? `${o.user_address?.street || ""}, ${o.user_address?.apartment_suite || ""}, ${o.user_address?.city?.name || ""}, ${o.user_address?.state?.name || ""}, ${o.user_address?.country?.name || ""} - ${o.user_address?.zipcode || ""}`
    : o.guest_shipping_address || o.guest_billing_address || o.guest_phone || "No Address";

const StatusSelect = ({ order, onChange }) => (
  <select
    value={order.order_status}
    onChange={(e) => onChange(order, e.target.value)}
    aria-label={`Order status for ${order.order_code}`}
    className={clsx(
      "h-8 rounded-full border px-3 text-xs font-medium cursor-pointer outline-none",
      "focus:ring-2 focus:ring-primary/40",
      STATUS_STYLES[order.order_status] || "bg-white/50 text-foreground border-border"
    )}
  >
    <option value="pending">Pending</option>
    <option value="processing">Processing</option>
    <option value="shipped">Shipped</option>
    <option value="delivered">Delivered</option>
    <option value="cancelled">Cancelled</option>
  </select>
);

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [ordersData, setOrdersData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ✅ page and per_page URL params
  const initialPage = Number.parseInt(searchParams.get("page") || "1", 10);
  const perPageParam = Number.parseInt(searchParams.get("per_page") || "10", 10);
  const initialPerPage = PAGE_SIZE_OPTIONS.includes(perPageParam) ? perPageParam : DEFAULT_PAGE_SIZE;
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
  const debouncedSearch = useDebounce(searchTerm, 400);
  const reqId = useRef(0); // ignore out-of-date responses

  const fetchOrders = async () => {
    const myReq = ++reqId.current;
    try {
      setLoading(true);
      setError(null);

      // Build params object with all filters
      const params = {
        search: debouncedSearch,
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
      if (myReq !== reqId.current) return;
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
      if (myReq !== reqId.current) return;
      console.error("❌ Error fetching orders:", err);
      setError("Failed to fetch orders. Please try again.");
    } finally {
      if (myReq === reqId.current) setLoading(false);
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
        phone: order.guest_phone,
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
        phone: order.guest_phone,
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
    debouncedSearch,
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

  const applyFilters = () => {
    // Filters already refetch as soon as they change; this just resets to page 1 and closes the panel
    setPage(1);
    setShowFilters(false);
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


  /* ---------- handlers used by the new UI ---------- */
  const handleStatusChange = async (order, newStatus) => {
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/order/${order.id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
      Swal.fire("Updated!", "Order status updated successfully.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update order status.", "error");
    }
  };

  const toggleOne = (order, checked) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, order.id]);
      setShippmentIds((prev) => [...prev, { id: order.id, order_code: order.order_code }]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== order.id));
      setShippmentIds((prev) => prev.filter((item) => item.id !== order.id));
    }
  };

  const toggleAll = (checked) => {
    if (checked) {
      setSelectedIds(ordersData.map((o) => o.id));
      setShippmentIds(ordersData.map((o) => ({ id: o.id, order_code: o.order_code })));
    } else {
      setSelectedIds([]);
      setShippmentIds([]);
    }
  };

  const goView = (o) => navigate(`/view-orders/${o.id}?page=${page}&per_page=${entriesPerPage}`);
  const goEdit = (o) => navigate(`/edit-orders/${o.id}?page=${page}&per_page=${entriesPerPage}`);
  const askDelete = (o) => handleDelete(o.id);

  const activeFilterCount = [paymentType, orderStatus, paymentStatus, startDate, endDate].filter(Boolean).length;
  const allSelected = ordersData.length > 0 && selectedIds.length === ordersData.length;
  const pages = useMemo(() => pageWindow(page, totalPages), [page, totalPages]);

  const filterFields = [
    { label: "Payment type", value: paymentType, set: setPaymentType, options: [["", "All"], ["payu", "PayU"], ["cod", "Cash on delivery"]] },
    { label: "Order status", value: orderStatus, set: setOrderStatus, options: [["", "All"], ["pending", "Pending"], ["processing", "Processing"], ["shipped", "Shipped"], ["delivered", "Delivered"], ["cancelled", "Cancelled"]] },
    { label: "Payment status", value: paymentStatus, set: setPaymentStatus, options: [["", "All"], ["paid", "Paid"], ["unpaid", "Unpaid"]] },
  ];

  const pill = "inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all duration-200";
  const disabledPill = "cursor-not-allowed opacity-40 border border-border text-muted-foreground";

  const stateBox = (content, tone = "text-muted-foreground") => (
    <div className={clsx("py-14 text-center text-sm", tone)}>{content}</div>
  );

  return (
    <div className="w-full">
      <style>{MOTION_CSS}</style>
      <div className="w-full max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className={clsx("rounded-2xl overflow-hidden", glassCard, cardShadow)}>

          {/* HEADER + CONTROLS ON WAVES */}
          <div className="relative">
            <WaveBackground />

            <div className="relative z-10 px-6 py-4 border-b border-white/20 dark:border-white/10">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold text-card-foreground">Orders</h1>
                  <p className="text-sm text-muted-foreground">Manage, process and track customer orders</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={selectedIds.length === 0}
                    onClick={() => handleBulkShipping(shippmentIds)}
                    className={clsx(
                      pill,
                      selectedIds.length > 0
                        ? `bg-gradient-to-r ${primaryGradient} text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40`
                        : disabledPill
                    )}
                  >
                    <Truck className="h-4 w-4" />
                    Shipping{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
                  </button>

                  <PermissionGuard permission="bulk_delete_order">
                    <button
                      type="button"
                      disabled={selectedIds.length === 0}
                      onClick={bulkDelete}
                      className={clsx(
                        pill,
                        selectedIds.length > 0
                          ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-400/30"
                          : disabledPill
                      )}
                    >
                      <Trash2 className="h-4 w-4" />
                      Bulk delete
                    </button>
                  </PermissionGuard>

                  <PermissionGuard permission="export_order">
                    <button
                      type="button"
                      onClick={exportCSV}
                      className={clsx(pill, "border border-border text-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-primary")}
                    >
                      <Download className="h-4 w-4" />
                      Export CSV
                    </button>
                  </PermissionGuard>

                  <button
                    type="button"
                    onClick={() => setShowFilters((p) => !p)}
                    aria-expanded={showFilters}
                    className={clsx(
                      pill,
                      "border text-foreground hover:bg-primary/5 hover:text-primary",
                      showFilters ? "border-primary/40 bg-primary/10 text-primary" : "border-border"
                    )}
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="ml-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="relative z-10 px-6 pt-4 pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <label htmlFor="orders-per-page" className="text-sm text-muted-foreground whitespace-nowrap">Show</label>
                  <select
                    id="orders-per-page"
                    value={entriesPerPage}
                    onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setPage(1); }}
                    className={clsx(
                      "h-9 w-[90px] px-3 rounded-lg text-sm text-foreground cursor-pointer",
                      "focus:outline-none focus:ring-2 focus:ring-primary/40",
                      glassInput
                    )}
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n} className="text-slate-900">{n}</option>
                    ))}
                  </select>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">entries</span>
                </div>

                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search orders, customers..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    className={clsx(
                      "h-10 w-full pl-10 pr-9 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60",
                      "focus:outline-none focus:ring-2 focus:ring-primary/40",
                      glassInput
                    )}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {showFilters && (
                <div className={clsx("mt-4 rounded-xl p-4", glassInput)}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {filterFields.map((f) => (
                      <div key={f.label} className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                        <select value={f.value} onChange={(e) => f.set(e.target.value)} className={fieldCls}>
                          {f.options.map(([v, l]) => (
                            <option key={v} value={v} className="text-slate-900">{l}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-muted-foreground">Start date</label>
                      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={fieldCls} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-muted-foreground">End date</label>
                      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={fieldCls} />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-2 pt-3 border-t border-white/20 dark:border-white/10">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="h-9 rounded-lg border border-border px-4 text-sm font-medium text-foreground hover:bg-primary/5"
                    >
                      Clear filters
                    </button>
                    <button
                      type="button"
                      onClick={applyFilters}
                      className={clsx("h-9 rounded-lg px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 bg-gradient-to-r", primaryGradient)}
                    >
                      Apply filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* TABLE (desktop) */}
          <div className="hidden lg:block overflow-x-auto min-h-[300px]">
            <Table className="w-full min-w-[1150px]">
              <TableHeader className="bg-white/30 dark:bg-white/10 border-b border-white/20 dark:border-white/15">
                <TableRow>
                  <TableHead className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-input accent-primary"
                      checked={allSelected}
                      onChange={(e) => toggleAll(e.target.checked)}
                      aria-label="Select all orders"
                    />
                  </TableHead>
                  {["Order code", "Customer", "Address", "Payment type", "Amount", "Order status", "Payment status", "Order date"].map((h) => (
                    <TableHead key={h} className="px-4 py-3 text-xs font-semibold text-foreground whitespace-nowrap">{h}</TableHead>
                  ))}
                  <TableHead className="px-4 py-3 text-right text-xs font-semibold text-foreground whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-14 text-center">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-10 text-center text-sm text-rose-500">{error}</TableCell>
                  </TableRow>
                ) : ordersData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-14 text-center text-sm text-muted-foreground">No orders found</TableCell>
                  </TableRow>
                ) : (
                  ordersData.map((order, i) => (
                    <TableRow
                      key={order.id}
                      className="pp-row-in hover:bg-primary/5 transition-colors border-b border-white/10 dark:border-white/5"
                      style={{ animationDelay: `${Math.min(i, 9) * 30}ms` }}
                    >
                      <TableCell className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-input accent-primary"
                          checked={selectedIds.includes(order.id)}
                          onChange={(e) => toggleOne(order, e.target.checked)}
                          aria-label={`Select order ${order.order_code}`}
                        />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span className={clsx(chipBase, "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-400/30")}>
                          {order.order_code}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-[13px] font-medium text-foreground">{customerName(order)}</TableCell>
                      <TableCell className="px-4 py-3 max-w-[280px]">
                        <p className="text-xs leading-5 text-muted-foreground line-clamp-2">{addressText(order)}</p>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span className={clsx(chipBase, "uppercase bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-400/30")}>
                          {order.payment_type}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 font-semibold text-sm text-foreground tabular-nums">₹{order.total_amount}</TableCell>
                      <TableCell className="px-4 py-3"><StatusSelect order={order} onChange={handleStatusChange} /></TableCell>
                      <TableCell className="px-4 py-3">
                        <span
                          className={clsx(
                            chipBase,
                            order.payment_status === "paid"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/30"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/30"
                          )}
                        >
                          {order.payment_status}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-[13px] text-muted-foreground whitespace-nowrap">
                        {order.order_date ? new Date(order.order_date).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <ActionsMenu
                          order={order}
                          flipUp={ordersData.length > 4 && i >= ordersData.length - 3}
                          onView={goView}
                          onEdit={goEdit}
                          onPrint={handlePrint}
                          onInvoice={handleInvoicePrint}
                          onDelete={askDelete}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* CARDS (mobile / tablet) */}
          <div className="lg:hidden divide-y divide-white/20 dark:divide-white/10">
            {loading ? (
              stateBox(<Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />)
            ) : error ? (
              stateBox(error, "text-rose-500")
            ) : ordersData.length === 0 ? (
              stateBox("No orders found")
            ) : (
              ordersData.map((order) => (
                <div key={order.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-input accent-primary"
                        checked={selectedIds.includes(order.id)}
                        onChange={(e) => toggleOne(order, e.target.checked)}
                      />
                      <span className={clsx(chipBase, "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-400/30")}>
                        {order.order_code}
                      </span>
                    </label>
                    <ActionsMenu
                      order={order}
                      onView={goView}
                      onEdit={goEdit}
                      onPrint={handlePrint}
                      onInvoice={handleInvoicePrint}
                      onDelete={askDelete}
                    />
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{customerName(order)}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{addressText(order)}</p>
                    </div>
                    <p className="font-semibold text-foreground tabular-nums shrink-0">₹{order.total_amount}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusSelect order={order} onChange={handleStatusChange} />
                    <span className={clsx(chipBase, "uppercase bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-400/30")}>
                      {order.payment_type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {order.order_date ? new Date(order.order_date).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* PAGINATION */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-white/20 dark:border-white/10 bg-white/40 dark:bg-white/5">
            <div className="text-[13px] text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">{totalItems === 0 ? 0 : startIndex + 1}</span> to{" "}
              <span className="font-semibold text-foreground">{endIndex}</span> of{" "}
              <span className="font-semibold text-foreground">{totalItems}</span> entries
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                aria-label="Previous page"
                className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-border text-foreground disabled:opacity-40 hover:bg-primary/5 transition-colors"
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
                    onClick={() => setPage(n)}
                    aria-current={n === page ? "page" : undefined}
                    className={clsx(
                      "h-9 min-w-[36px] px-2 rounded-lg text-[13px] font-medium transition-colors",
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
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                aria-label="Next page"
                className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-border text-foreground disabled:opacity-40 hover:bg-primary/5 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;