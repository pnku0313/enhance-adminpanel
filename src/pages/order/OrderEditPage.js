"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { clsx } from "clsx";
import {
  ArrowLeft, Save, Loader2, ClipboardCheck, Boxes, PackageCheck, MapPin, Truck,
  User, Trash2, Minus, Plus, AlertTriangle, Package,
} from "lucide-react";

/* ==========================================================================
   THEME: same glass + indigo/purple look as the other pages.
   No backdrop-blur (it caused scroll lag). Light black lines separate data.
   ========================================================================== */
const glassCard = "bg-white/70 dark:bg-slate-900/60 border border-black/10 dark:border-white/10";
const glassInput = "bg-white/50 dark:bg-white/10 border border-black/10 dark:border-white/15";
const cardShadow = "shadow-xl shadow-black/5 dark:shadow-black/20";
const primaryGradient = "from-indigo-500 via-purple-500 to-indigo-600";

const API_BASE = "http://127.0.0.1:8000/api";

const chipBase = "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap capitalize";
const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/30",
  processing: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-400/30",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-400/30",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/30",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-400/30",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/30",
  unpaid: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/30",
  failed: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-400/30",
  refunded: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-400/30",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/30",
};
const NEUTRAL_STYLE = "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-400/30";

const fieldCls = clsx(
  "pp-select h-9 w-full px-3 rounded-lg text-sm text-foreground cursor-pointer",
  "focus:outline-none focus:ring-2 focus:ring-primary/40",
  glassInput
);

const swalClasses = {
  popup: "bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl",
  confirmButton: `bg-gradient-to-r ${primaryGradient} text-white shadow-lg shadow-indigo-500/30`,
};

/* ==========================================================================
   MOTION (CSS only) + visible text selection
   ========================================================================== */
const MOTION_CSS = `
/* Selected text stays readable: tinted highlight, original text colour kept */
::selection { background: rgba(99,102,241,0.35); color: inherit; }
::-moz-selection { background: rgba(99,102,241,0.35); color: inherit; }
.dark ::selection { background: rgba(165,180,252,0.40); color: inherit; }
.pp-select option { color: #0f172a; }

@keyframes pp-wave { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes pp-float { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-6px) rotate(3deg); } }
@keyframes pp-drive { from { transform: translateX(-60px); } to { transform: translateX(110vw); } }
.pp-wave-1 { animation: pp-wave 26s linear infinite; will-change: transform; }
.pp-wave-2 { animation: pp-wave 18s linear infinite reverse; will-change: transform; }
.pp-wave-3 { animation: pp-wave 12s linear infinite; will-change: transform; }
.pp-float { animation: pp-float 3.2s ease-in-out infinite; }
.pp-drive { animation: pp-drive 18s linear infinite; will-change: transform; }
@media (prefers-reduced-motion: reduce) {
  .pp-wave-1, .pp-wave-2, .pp-wave-3, .pp-float, .pp-drive { animation: none !important; }
}
`;

const WAVE_PATH =
  "M0 80 Q180 20 360 80 T720 80 T1080 80 T1440 80 T1800 80 T2160 80 T2520 80 T2880 80 L2880 160 L0 160 Z";

/* Waves with order-fulfilment icons; a delivery truck drives across */
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
    { Icon: ClipboardCheck, left: "9%", delay: "0s" },
    { Icon: Boxes, left: "34%", delay: "-1.1s" },
    { Icon: PackageCheck, left: "60%", delay: "-2.2s" },
    { Icon: MapPin, left: "85%", delay: "-0.6s" },
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

const show = (v) => (v === undefined || v === null || v === "" ? "—" : v);

const Section = ({ title, icon: Icon, children }) => (
  <section className={clsx("rounded-2xl", glassCard, cardShadow)}>
    <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-black/10 dark:border-white/10">
      <h2 className="text-base font-semibold text-card-foreground">{title}</h2>
      {Icon && (
        <div className="h-8 w-8 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon size={15} className="text-primary" />
        </div>
      )}
    </div>
    <div className="p-6">{children}</div>
  </section>
);

const Info = ({ label, children }) => (
  <div className="min-w-0 border-b border-black/10 dark:border-white/10 pb-3">
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="mt-0.5 text-sm font-medium text-foreground break-words">{children}</dd>
  </div>
);

/* Modal used for the order / item cancellation reasons */
const ReasonModal = ({ title, tone, description, value, onChange, onClose, onConfirm, confirmLabel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
    <div className="w-full max-w-md rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-2xl">
      <h3 className={clsx("text-lg font-semibold", tone === "danger" ? "text-rose-600" : "text-foreground")}>{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter reason..."
        maxLength={500}
        autoFocus
        className={clsx(
          "mt-4 h-24 w-full resize-none rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground/60",
          "focus:outline-none focus:ring-2 focus:ring-primary/40",
          glassInput
        )}
      />
      <div className="mt-1 text-xs text-muted-foreground">{value.length}/500 characters</div>
      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="h-9 rounded-lg border border-border px-4 text-sm font-medium text-foreground hover:bg-primary/5"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="h-9 rounded-lg bg-gradient-to-r from-rose-500 to-rose-600 px-4 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

/* ==========================================================================
   PAGE
   ========================================================================== */
const OrderEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // page and per_page come from the URL so we return to the same list page
  const page = Number.parseInt(searchParams.get("page") || "1", 10);
  const entriesPerPage = Number.parseInt(searchParams.get("per_page") || "10", 10);
  const backUrl = `/orders?page=${page}&per_page=${entriesPerPage}`;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [removeItems, setRemoveItems] = useState([]);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancellingItemIndex, setCancellingItemIndex] = useState(null);
  const [showOrderCancelModal, setShowOrderCancelModal] = useState(false);
  const [orderCancelReason, setOrderCancelReason] = useState("");

  const [formData, setFormData] = useState({
    shipping_name: "",
    shipping_phone: "",
    street: "",
    apartment_suite: "",
    zipcode: "",
    country: "",
    state: "",
    city: "",
    order_status: "",
    payment_status: "",
    order_details: [],
    order_cancel_reason: "",
  });

  /* ---------- load ---------- */
  useEffect(() => {
    let cancelled = false;

    const fetchOrder = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const res = await fetch(`${API_BASE}/orders/${id}`);
        const data = await res.json();
        if (cancelled) return;

        if (data.success && data.data) {
          const orderData = data.data;
          const addressApiResponse = orderData.users?.user_address?.data;

          setOrder(orderData);

          let defaultAddress = null;
          if (addressApiResponse) {
            const addressList = Array.isArray(addressApiResponse) ? addressApiResponse : [addressApiResponse];
            setAddresses(addressList);

            if (addressList.length > 0) {
              defaultAddress = addressList.find((addr) => addr.id === orderData.user_address_id) || addressList[0];
              setSelectedAddressId(defaultAddress.id);
            }
          }

          const orderDetailsWithStock =
            orderData.order_details?.data?.map((item) => {
              const allVariants = item.products?.variants || [];
              const currentVariant = allVariants.find(
                (v) => v.color_id === item.color_id && v.size_id === item.size_id
              );
              return {
                ...item,
                sub_total: item.price * item.quantity,
                stock: currentVariant ? currentVariant.stock : 0,
                available_variants: allVariants,
                current_image: item.products?.default_image,
                status: item.status || "active",
                cancel_reason: item.cancel_reason || "",
              };
            }) || [];

          setFormData({
            shipping_name: defaultAddress?.name || "",
            shipping_phone: defaultAddress?.phone_number || "",
            street: defaultAddress?.street || "",
            apartment_suite: defaultAddress?.apartment_suite || "",
            zipcode: defaultAddress?.zipcode || "",
            country: defaultAddress?.country?.name || "",
            state: defaultAddress?.state?.name || "",
            city: defaultAddress?.city?.name || "",
            order_status: orderData.order_status || "",
            payment_status: orderData.payment_status || "",
            order_details: orderDetailsWithStock,
            order_cancel_reason: orderData.order_cancel_reason || "",
          });
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrder();
    return () => { cancelled = true; };
  }, [id]);

  /* ---------- handlers ---------- */
  const handleAddressChange = (e) => {
    const newSelectedId = Number(e.target.value);
    setSelectedAddressId(newSelectedId);
    const selectedAddress = addresses.find((address) => address.id === newSelectedId);
    if (selectedAddress) {
      setFormData((prev) => ({
        ...prev,
        shipping_name: selectedAddress.name || "",
        shipping_phone: selectedAddress.phone_number || "",
        street: selectedAddress.street || "",
        apartment_suite: selectedAddress.apartment_suite || "",
        zipcode: selectedAddress.zipcode || "",
        country: selectedAddress.country?.name || "",
        state: selectedAddress.state?.name || "",
        city: selectedAddress.city?.name || "",
      }));
    }
  };

  const handleOrderStatusChange = (field, value) => {
    if (field === "order_status" && value === "cancelled") {
      setShowOrderCancelModal(true);
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  /* Immutable update of one order item */
  const updateItem = (index, patch) =>
    setFormData((prev) => ({
      ...prev,
      order_details: prev.order_details.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    }));

  const handleDetailChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      order_details: prev.order_details.map((it, i) => {
        if (i !== index) return it;
        const item = { ...it, [field]: value };

        // If colour or size changes, update stock and image
        if (field === "color_id" || field === "size_id") {
          const variant = item.available_variants.find(
            (v) => v.color_id === item.color_id && v.size_id === item.size_id
          );
          if (variant) {
            item.stock = variant.stock;
            if (item.quantity > variant.stock) item.quantity = variant.stock;
            const defaultImage = (variant.variant_images || []).find((img) => img.is_default);
            if (defaultImage) item.current_image = defaultImage.path;
          } else {
            item.stock = 0; // this colour/size combination doesn't exist
            item.quantity = 0;
          }
        }

        item.sub_total = item.price * item.quantity;
        return item;
      }),
    }));
  };

  const handleStatusChange = (index, newStatus) => {
    if (newStatus === "cancelled") {
      setCancellingItemIndex(index);
      setShowCancelModal(true);
    } else {
      updateItem(index, { status: newStatus, cancel_reason: "" });
    }
  };

  const handleCancelConfirm = () => {
    if (cancelReason.trim() === "") {
      Swal.fire({ title: "Reason needed", text: "Please provide a reason for cancellation", icon: "warning", customClass: swalClasses });
      return;
    }
    updateItem(cancellingItemIndex, { status: "cancelled", cancel_reason: cancelReason });
    handleCancelModalClose();
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
    setCancelReason("");
    setCancellingItemIndex(null);
  };

  const handleQuantityChange = (index, delta) => {
    const currentItem = formData.order_details[index];
    const newQuantity = currentItem.quantity + delta;

    if (delta < 0) {
      if (newQuantity >= 1) handleDetailChange(index, "quantity", newQuantity); // decrease while qty >= 1
    } else if (newQuantity <= currentItem.stock) {
      handleDetailChange(index, "quantity", newQuantity); // increase only if stock is available
    }
  };

  const handleRemoveItem = (itemId, index) => {
    setRemoveItems((prev) => [...prev, itemId]);
    setFormData((prev) => ({ ...prev, order_details: prev.order_details.filter((_, idx) => idx !== index) }));
  };

  const handleOrderCancelConfirm = () => {
    if (orderCancelReason.trim() === "") {
      Swal.fire({ title: "Reason needed", text: "Please provide a reason for order cancellation", icon: "warning", customClass: swalClasses });
      return;
    }
    setFormData((prev) => ({ ...prev, order_status: "cancelled", order_cancel_reason: orderCancelReason }));
    handleOrderCancelModalClose();
  };

  const handleOrderCancelModalClose = () => {
    setShowOrderCancelModal(false);
    setOrderCancelReason("");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saveData = {
        user_address_id: selectedAddressId,
        order_status: formData.order_status,
        payment_status: formData.payment_status,
        order_cancel_reason: formData.order_cancel_reason || "",
        items: formData.order_details.map((item) => ({
          id: item.id,
          product_id: item.product_id,
          size_id: item.size_id,
          color_id: item.color_id,
          quantity: item.quantity,
          price: item.price,
          tax: item.tax || 0,
          shipping_cost: item.shipping_cost || 0,
          status: item.status,
          cancel_reason: item.cancel_reason || "",
        })),
        remove_items: removeItems,
      };

      const response = await fetch(`${API_BASE}/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saveData),
      });
      const result = await response.json();

      if (result.success) {
        await Swal.fire({
          title: "Success!",
          text: "Order updated successfully!",
          icon: "success",
          confirmButtonText: "OK",
          customClass: swalClasses,
        });
        navigate(backUrl);
      } else {
        Swal.fire({
          title: "Error!",
          text: result.message || "Unknown error",
          icon: "error",
          confirmButtonText: "OK",
          customClass: swalClasses,
        });
      }
    } catch (error) {
      console.error("Error saving order:", error);
      Swal.fire({
        title: "Error!",
        text: "Error saving order. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        customClass: swalClasses,
      });
    } finally {
      setSaving(false);
    }
  };

  /* ---------- states ---------- */
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6">
        <p className="text-lg font-medium text-rose-500">
          {loadError ? "Failed to load this order" : "No order found."}
        </p>
        <button
          type="button"
          onClick={() => navigate(backUrl)}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-foreground hover:bg-primary/5"
        >
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </button>
      </div>
    );
  }

  const activeSubtotal = formData.order_details
    .filter((it) => it.status !== "cancelled")
    .reduce((sum, it) => sum + (it.sub_total || 0), 0);
  const statusKey = String(formData.order_status || "").toLowerCase();
  const paymentKey = String(formData.payment_status || "").toLowerCase();

  return (
    <div className="w-full">
      <style>{MOTION_CSS}</style>

      <div className="mx-auto w-full max-w-[90rem] space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">

        {/* HEADER ON WAVES */}
        <div className={clsx("relative overflow-hidden rounded-2xl", glassCard, cardShadow)}>
          <WaveBackground />
          <div className="relative z-10 px-6 py-6">
            <button
              type="button"
              onClick={() => navigate(backUrl)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-white/40 px-4 text-sm font-medium text-foreground transition-colors hover:bg-primary/5 hover:text-primary dark:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to orders
            </button>

            <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="min-w-0">
                <h1 className="break-words text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Edit order {order.order_code}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">Update status, address and items for this order</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {formData.order_status && (
                  <span className={clsx(chipBase, STATUS_STYLES[statusKey] || NEUTRAL_STYLE)}>{formData.order_status}</span>
                )}
                {formData.payment_status && (
                  <span className={clsx(chipBase, STATUS_STYLES[paymentKey] || NEUTRAL_STYLE)}>{formData.payment_status}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CUSTOMER + ORDER DETAILS */}
        <Section title="Customer & order details" icon={User}>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-3">
            <Info label="Customer">{show(order?.users?.name || order?.guest_name)}</Info>
            <Info label="Email">{show(order?.users?.email || order?.guest_email)}</Info>
            <Info label="Gender">{show(order?.users?.gender || "N/A")}</Info>
            <Info label="Payment type">
              <span className="uppercase">{show(order?.payment_type)}</span>
            </Info>

            <div className="min-w-0 border-b border-black/10 pb-3 dark:border-white/10">
              <label htmlFor="order-status" className="text-xs text-muted-foreground">Order status</label>
              <select
                id="order-status"
                value={formData.order_status}
                onChange={(e) => handleOrderStatusChange("order_status", e.target.value)}
                className={clsx(fieldCls, "mt-1")}
              >
                <option value="">Select status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {formData.order_status === "cancelled" && formData.order_cancel_reason && (
                <p className="mt-1.5 text-xs text-rose-600">
                  <strong>Cancellation reason:</strong> {formData.order_cancel_reason}
                </p>
              )}
            </div>

            <div className="min-w-0 border-b border-black/10 pb-3 dark:border-white/10">
              <label htmlFor="payment-status" className="text-xs text-muted-foreground">Payment status</label>
              <select
                id="payment-status"
                value={formData.payment_status}
                onChange={(e) => handleOrderStatusChange("payment_status", e.target.value)}
                className={clsx(fieldCls, "mt-1")}
              >
                <option value="">Select status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </dl>
        </Section>

        {removeItems.length > 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-sm">
              <strong>Notice:</strong> {removeItems.length} item(s) marked for removal. These will be permanently
              removed when you save changes.
            </p>
          </div>
        )}

        {/* SHIPPING ADDRESS */}
        <Section title="Shipping address" icon={MapPin}>
          {addresses.length > 0 ? (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                {addresses.map((address) => {
                  const selected = selectedAddressId === address.id;
                  return (
                    <label
                      key={address.id}
                      htmlFor={`address-${address.id}`}
                      className={clsx(
                        "flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition-colors",
                        selected
                          ? "border-primary/50 bg-primary/5"
                          : "border-black/10 bg-white/40 hover:bg-primary/5 dark:border-white/10 dark:bg-white/5"
                      )}
                    >
                      <input
                        type="radio"
                        id={`address-${address.id}`}
                        name="address"
                        value={address.id}
                        checked={selected}
                        onChange={handleAddressChange}
                        className="mt-1 accent-primary"
                      />
                      <span className="min-w-0">
                        <span className="block font-semibold text-foreground">{address.name}</span>
                        <span className="block text-muted-foreground">
                          {address.street}, {address.city?.name}
                        </span>
                        {address.address_type && (
                          <span className={clsx(chipBase, "mt-2", NEUTRAL_STYLE)}>{address.address_type}</span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>

              <dl className="grid gap-x-6 gap-y-4 pt-2 sm:grid-cols-2 lg:grid-cols-4">
                <Info label="Name">{show(formData.shipping_name)}</Info>
                <Info label="Phone">{show(formData.shipping_phone)}</Info>
                <Info label="Address">{[formData.street, formData.apartment_suite].filter(Boolean).join(", ") || "—"}</Info>
                <Info label="City / State">{[formData.city, formData.state].filter(Boolean).join(", ") || "—"}</Info>
                <Info label="Country">{show(formData.country)}</Info>
                <Info label="Zip code">{show(formData.zipcode)}</Info>
              </dl>
            </div>
          ) : (
            <p className="text-sm text-foreground">
              {order?.guest_name} ({order?.guest_phone}) -{" "}
              {order?.guest_shipping_address || order?.guest_billing_address || "No Address"}
            </p>
          )}
        </Section>

        {/* ORDER ITEMS */}
        <section className={clsx("overflow-hidden rounded-2xl", glassCard, cardShadow)}>
          <div className="flex items-center justify-between gap-3 border-b border-black/10 px-6 py-4 dark:border-white/10">
            <h2 className="text-base font-semibold text-card-foreground">Order items</h2>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Package size={15} className="text-primary" />
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse">
              <thead className="border-b border-black/15 bg-white/30 dark:border-white/15 dark:bg-white/10">
                <tr className="divide-x divide-black/5 dark:divide-white/5">
                  {["Product", "Color", "Size", "Status", "Qty", "Subtotal", "Actions"].map((h) => (
                    <th
                      key={h}
                      className={clsx(
                        "whitespace-nowrap px-4 py-3 text-xs font-semibold text-foreground",
                        h === "Subtotal" ? "text-right" : h === "Qty" || h === "Actions" ? "text-center" : "text-left"
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formData.order_details.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                      No items in this order
                    </td>
                  </tr>
                ) : (
                  formData.order_details.map((item, idx) => {
                    const uniqueColors = [
                      ...new Map(
                        item.available_variants.map((v) => [v.color_id, { id: v.color_id, name: v.color_name }])
                      ).values(),
                    ];
                    const uniqueSizes = [
                      ...new Map(
                        item.available_variants.map((v) => [v.size_id, { id: v.size_id, name: v.size_name }])
                      ).values(),
                    ];
                    const cancelled = item.status === "cancelled";

                    return (
                      <tr
                        key={item.id}
                        className={clsx(
                          "divide-x divide-black/5 border-b border-black/10 transition-colors hover:bg-primary/5 dark:divide-white/5 dark:border-white/10",
                          cancelled && "opacity-70"
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.current_image || "/placeholder.svg"}
                              alt={item.products?.name}
                              loading="lazy"
                              className="h-14 w-14 rounded-lg border border-border object-cover shadow-sm"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground">{item.products?.name || "N/A"}</p>
                              {cancelled && item.cancel_reason && (
                                <p className="mt-1 text-xs text-rose-600">
                                  <strong>Reason:</strong> {item.cancel_reason}
                                </p>
                              )}
                              {item.stock === 0 && !cancelled && (
                                <p className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                                  <AlertTriangle size={12} /> Out of stock or unavailable combination
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <select
                            value={item.color_id || ""}
                            onChange={(e) => handleDetailChange(idx, "color_id", Number(e.target.value))}
                            className={fieldCls}
                            aria-label="Colour"
                          >
                            {uniqueColors.map((color) => (
                              <option key={color.id} value={color.id}>{color.name}</option>
                            ))}
                          </select>
                        </td>

                        <td className="px-4 py-3">
                          <select
                            value={item.size_id || ""}
                            onChange={(e) => handleDetailChange(idx, "size_id", Number(e.target.value))}
                            className={fieldCls}
                            aria-label="Size"
                          >
                            {uniqueSizes.map((size) => (
                              <option key={size.id} value={size.id}>{size.name}</option>
                            ))}
                          </select>
                        </td>

                        <td className="px-4 py-3">
                          <select
                            value={item.status || "active"}
                            onChange={(e) => handleStatusChange(idx, e.target.value)}
                            className={fieldCls}
                            aria-label="Item status"
                          >
                            <option value="active">Active</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(idx, -1)}
                              disabled={item.quantity <= 1}
                              aria-label="Decrease quantity"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 bg-white/50 text-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:bg-white/10"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-sm font-bold tabular-nums text-foreground">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(idx, 1)}
                              disabled={item.quantity >= item.stock}
                              aria-label="Increase quantity"
                              title={item.quantity >= item.stock ? "No more stock available" : "Add quantity"}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 bg-white/50 text-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:bg-white/10"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <p className="mt-1 text-center text-xs text-muted-foreground">Stock: {item.stock}</p>
                        </td>

                        <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-foreground">
                          ₹{(item.sub_total || 0).toFixed(2)}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id, idx)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-300"
                          >
                            <Trash2 size={13} />
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {formData.order_details.length > 0 && (
                <tfoot>
                  <tr className="bg-white/30 dark:bg-white/5">
                    <td colSpan={5} className="px-4 py-3 text-right text-sm text-muted-foreground">
                      Active items subtotal
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold tabular-nums text-foreground">
                      ₹{activeSubtotal.toFixed(2)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </section>

        {/* SAVE BAR */}
        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(backUrl)}
            className="h-10 rounded-lg border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-primary/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={clsx(
              "inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r px-5 text-sm font-semibold text-white transition-all duration-200",
              "shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40",
              "disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none",
              primaryGradient
            )}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>

      {/* MODALS */}
      {showOrderCancelModal && (
        <ReasonModal
          title="Cancel order"
          tone="danger"
          description="You are about to cancel this entire order. Please provide a valid reason for cancellation:"
          value={orderCancelReason}
          onChange={setOrderCancelReason}
          onClose={handleOrderCancelModalClose}
          onConfirm={handleOrderCancelConfirm}
          confirmLabel="Confirm order cancellation"
        />
      )}

      {showCancelModal && (
        <ReasonModal
          title="Cancel item"
          description="Please provide a reason for cancelling this item:"
          value={cancelReason}
          onChange={setCancelReason}
          onClose={handleCancelModalClose}
          onConfirm={handleCancelConfirm}
          confirmLabel="Confirm cancellation"
        />
      )}
    </div>
  );
};

export default OrderEditPage;