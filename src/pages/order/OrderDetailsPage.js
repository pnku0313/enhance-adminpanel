"use client";
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { clsx } from "clsx";
import {
  ArrowLeft, ClipboardCheck, Boxes, PackageCheck, MapPin, Truck, Loader2,
  User, Mail, Phone, CreditCard, Receipt, IndianRupee, Building2, Package, Calendar,
} from "lucide-react";

/* ==========================================================================
   THEME: same glass + indigo/purple look as the other pages.
   No backdrop-blur (it caused scroll lag).
   ========================================================================== */
const glassCard = "bg-white/70 dark:bg-slate-900/60 border border-black/10 dark:border-white/10";
const glassInner = "bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10";
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
};
const PAID_STYLE = STATUS_STYLES.delivered;
const UNPAID_STYLE = STATUS_STYLES.pending;
const NEUTRAL_STYLE = "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-400/30";

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
@keyframes pp-drive { from { transform: translateX(-60px); } to { transform: translateX(110vw); } }
@keyframes pp-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.pp-wave-1 { animation: pp-wave 26s linear infinite; will-change: transform; }
.pp-wave-2 { animation: pp-wave 18s linear infinite reverse; will-change: transform; }
.pp-wave-3 { animation: pp-wave 12s linear infinite; will-change: transform; }
.pp-float { animation: pp-float 3.2s ease-in-out infinite; }
.pp-drive { animation: pp-drive 18s linear infinite; will-change: transform; }
/* "backwards" (not "both") so finished blocks don't keep a stacking context */
.pp-rise { animation: pp-rise 0.4s ease-out backwards; }
@media (prefers-reduced-motion: reduce) {
  .pp-wave-1, .pp-wave-2, .pp-wave-3, .pp-float, .pp-drive, .pp-rise { animation: none !important; }
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

/* ==========================================================================
   SMALL BUILDING BLOCKS
   ========================================================================== */
const show = (v) => (v === undefined || v === null || v === "" ? "—" : v);

const Info = ({ label, children }) => (
  <div className="min-w-0 border-b border-black/10 dark:border-white/10 pb-3">
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="mt-0.5 text-sm font-medium text-foreground break-words">{children}</dd>
  </div>
);

const Section = ({ title, icon: Icon, delay = 0, className, children }) => (
  <section
    style={{ animationDelay: `${delay}ms` }}
    className={clsx("pp-rise rounded-2xl", glassCard, cardShadow, className)}
  >
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

const StatTile = ({ label, value, icon: Icon, highlight, delay }) => (
  <div
    style={{ animationDelay: `${delay}ms` }}
    className={clsx(
      "pp-rise rounded-2xl p-5",
      highlight
        ? `bg-gradient-to-br ${primaryGradient} text-white shadow-xl shadow-indigo-500/30`
        : clsx(glassCard, cardShadow)
    )}
  >
    <div className="flex items-center justify-between">
      <span className={clsx("text-sm", highlight ? "text-white/80" : "text-muted-foreground")}>{label}</span>
      <Icon size={16} className={highlight ? "text-white/80" : "text-primary"} />
    </div>
    <div className={clsx("mt-2 text-2xl font-bold tracking-tight tabular-nums", !highlight && "text-foreground")}>
      {value}
    </div>
  </div>
);

const Avatar = ({ src, name }) => {
  const initials = (name || "G")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return src ? (
    <img src={src} alt={name} className="h-16 w-16 rounded-full object-cover border border-border shadow-sm" />
  ) : (
    <div className={clsx("h-16 w-16 rounded-full flex items-center justify-center text-lg font-semibold text-white bg-gradient-to-br", primaryGradient)}>
      {initials}
    </div>
  );
};

/* ==========================================================================
   PAGE
   ========================================================================== */
const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // page and per_page come from the URL so "Back" returns to the same list page
  const page = Number.parseInt(searchParams.get("page") || "1", 10);
  const entriesPerPage = Number.parseInt(searchParams.get("per_page") || "10", 10);
  const backUrl = `/orders?page=${page}&per_page=${entriesPerPage}`;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    axios
      .get(`${API_BASE}/orders/${id}`)
      .then((res) => { if (!cancelled) setOrder(res.data); })
      .catch((err) => {
        console.error("Failed to fetch order:", err);
        if (!cancelled) setError(true);
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order || !order.data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6">
        <p className="text-lg font-medium text-rose-500">
          {error ? "Failed to load this order" : "Order not found"}
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

  const o = order.data;
  const consignment = o.shipping_detail?.payload?.consignments?.[0];
  const hasAccount = o.users && Object.keys(o.users).length > 0;
  const status = String(o.order_status || "").toLowerCase();
  const paid = String(o.payment_status || "").toLowerCase() === "paid";
  const address = o.user_address;
  const customerName = hasAccount ? o.users?.name : o.guest_name || "Guest";

  const dims = [consignment?.length, consignment?.width, consignment?.height];
  const hasDims = dims.some((d) => d !== undefined && d !== null && d !== "");

  const PartyDetails = ({ title, icon, d, delay }) => (
    <Section title={title} icon={icon} delay={delay}>
      <dl className="grid gap-4 sm:grid-cols-2">
        <Info label="Name">{show(d?.name)}</Info>
        <Info label="Phone">{show(d?.phone)}</Info>
        <Info label="Email">{show(d?.email)}</Info>
        <Info label="Pincode">{show(d?.pincode)}</Info>
        <Info label="Address">
          {[d?.address_line_1, d?.address_line_2].filter(Boolean).join(", ") || "—"}
        </Info>
        <Info label="City / State">
          {[d?.city, d?.state].filter(Boolean).join(", ") || "—"}
        </Info>
      </dl>
    </Section>
  );

  return (
    <div className="w-full">
      <style>{MOTION_CSS}</style>

      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">

        {/* HEADER ON WAVES */}
        <div className={clsx("relative overflow-hidden rounded-2xl", glassCard, cardShadow)}>
          <WaveBackground />
          <div className="relative z-10 px-6 py-6">
            <button
              type="button"
              onClick={() => navigate(backUrl)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-white/40 dark:bg-white/5 px-4 text-sm font-medium text-foreground hover:bg-primary/5 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to orders
            </button>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground break-words">
                  Order {o.order_code}
                </h1>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar size={14} />
                  {o.order_date ? new Date(o.order_date).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={clsx(chipBase, STATUS_STYLES[status] || NEUTRAL_STYLE)}>{show(o.order_status)}</span>
                <span className={clsx(chipBase, paid ? PAID_STYLE : UNPAID_STYLE)}>{show(o.payment_status)}</span>
                {o.payment_type && <span className={clsx(chipBase, "uppercase", NEUTRAL_STYLE)}>{o.payment_type}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile label="Order total" value={`₹${show(o.total_amount)}`} icon={Receipt} delay={0} />
          <StatTile label="Shipping charges" value={`₹${show(o.shipping_charge)}`} icon={Truck} delay={60} />
          <StatTile label="Final amount" value={`₹${show(o.final_amount)}`} icon={IndianRupee} highlight delay={120} />
          <StatTile
            label="Payment"
            value={<span className="text-xl capitalize">{show(o.payment_status)}{o.payment_type ? ` · ${o.payment_type}` : ""}</span>}
            icon={CreditCard}
            delay={180}
          />
        </div>

        {/* CUSTOMER + ADDRESS */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Customer" icon={User} delay={100}>
            <div className="flex items-center gap-4">
              <Avatar src={hasAccount ? o.users?.avatar : null} name={customerName} />
              <dl className="grid gap-3 min-w-0">
                <Info label="Name">{show(customerName)}</Info>
                <Info label="Email">
                  <span className="inline-flex items-center gap-1.5"><Mail size={13} className="text-muted-foreground" />{show(hasAccount ? o.users?.email : o.guest_email)}</span>
                </Info>
                <Info label="Phone">
                  <span className="inline-flex items-center gap-1.5"><Phone size={13} className="text-muted-foreground" />{show(hasAccount ? o.users?.phone : o.guest_phone)}</span>
                </Info>
              </dl>
            </div>
          </Section>

          <Section title="Shipping address" icon={MapPin} delay={140}>
            {hasAccount && address ? (
              <dl className="grid gap-4 sm:grid-cols-2">
                <Info label="Name">{show(address.name)}</Info>
                <Info label="Phone">{show(address.phone_number)}</Info>
                <Info label="Email">{show(address.email)}</Info>
                <Info label="Address type"><span className="capitalize">{show(address.address_type)}</span></Info>
                <Info label="Address">
                  {[address.street, address.apartment_suite].filter(Boolean).join(", ") || "—"}
                </Info>
                <Info label="City">{show(address.city?.name)}</Info>
                <Info label="State">{show(address.state?.name)}</Info>
                <Info label="Country">{show(address.country?.name)}</Info>
                <Info label="Zip code">{show(address.zipcode)}</Info>
              </dl>
            ) : o.guest_shipping_address || o.guest_billing_address ? (
              <dl className="grid gap-4">
                <Info label="Shipping address">{show(o.guest_shipping_address)}</Info>
                <Info label="Billing address">{show(o.guest_billing_address)}</Info>
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">No shipping address provided</p>
            )}
          </Section>
        </div>

        {/* SHIPPING DETAILS */}
        {o.shipping_detail && (
          <>
            <Section title="Shipping details" icon={Truck} delay={180}>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Info label="Carrier">{show(o.shipping_detail.carrier_name)}</Info>
                <Info label="Consignment #">{show(o.shipping_detail.consignment_number)}</Info>
                <Info label="Status">{show(o.shipping_detail.status)}</Info>
                <Info label="Customer ref #">{show(o.shipping_detail.customer_reference_number)}</Info>
                <Info label="Description">{show(consignment?.description)}</Info>
                <Info label="COD amount">₹{consignment?.cod_amount || "0.00"}</Info>
                <Info label="Declared value">₹{consignment?.declared_value || "0.00"}</Info>
                <Info label="Weight">
                  {consignment?.weight !== undefined && consignment?.weight !== null
                    ? `${consignment.weight} ${consignment?.weight_unit || ""}`.trim()
                    : "—"}
                </Info>
                <Info label="Dimensions (L×W×H)">
                  {hasDims
                    ? `${dims.map((d) => show(d)).join(" × ")} ${consignment?.dimension_unit || ""}`.trim()
                    : "—"}
                </Info>
              </dl>
            </Section>

            <div className="grid gap-4 lg:grid-cols-2">
              <PartyDetails title="Origin" icon={Building2} d={consignment?.origin_details} delay={220} />
              <PartyDetails title="Destination" icon={MapPin} d={consignment?.destination_details} delay={260} />
            </div>
          </>
        )}

        {/* ORDER ITEMS */}
        <section className={clsx("pp-rise rounded-2xl overflow-hidden", glassCard, cardShadow)} style={{ animationDelay: "300ms" }}>
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-black/10 dark:border-white/10">
            <h2 className="text-base font-semibold text-card-foreground">Order items</h2>
            <div className="h-8 w-8 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package size={15} className="text-primary" />
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse min-w-[860px]">
              <thead className="bg-white/30 dark:bg-white/10 border-b border-black/15 dark:border-white/15">
                <tr className="divide-x divide-black/5 dark:divide-white/5">
                  {["Image", "Product", "Color", "Size", "Qty", "Price", "Subtotal", "Status"].map((h, i) => (
                    <th
                      key={h}
                      className={clsx(
                        "px-4 py-3 text-xs font-semibold text-foreground whitespace-nowrap",
                        ["Qty", "Price", "Subtotal"].includes(h) ? "text-right" : "text-left"
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {o.order_details?.data?.length ? (
                  o.order_details.data.map((item) => (
                    <tr key={item.id} className="border-b border-black/10 dark:border-white/10 divide-x divide-black/5 dark:divide-white/5 hover:bg-primary/5 transition-colors">
                      <td className="px-4 py-3">
                        {item.products?.default_image ? (
                          <img
                            src={item.products.default_image}
                            alt={item.products?.name}
                            loading="lazy"
                            className="h-14 w-14 rounded-lg object-cover border border-border shadow-sm"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-border flex items-center justify-center">
                            <Package size={18} className="text-primary" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-foreground">{item.products?.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">SKU: {show(item.products?.sku)}</p>
                      </td>
                      <td className="px-4 py-3">
                        {item.colors ? (
                          <div className="flex items-center gap-2.5">
                            <div
                              className="h-7 w-7 rounded-full border-2 border-white/60 shadow-sm"
                              style={{
                                background: item.colors.hexa_code_2
                                  ? `linear-gradient(135deg, ${item.colors.hexa_code} 50%, ${item.colors.hexa_code_2} 50%)`
                                  : item.colors.hexa_code,
                              }}
                            />
                            <span className="text-sm text-foreground">{item.colors.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{show(item.sizes?.name)}</td>
                      <td className="px-4 py-3 text-right text-sm tabular-nums text-foreground">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-sm tabular-nums text-foreground">₹{item.price}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-foreground">₹{item.sub_total}</td>
                      <td className="px-4 py-3">
                        <span className={clsx(chipBase, STATUS_STYLES[status] || NEUTRAL_STYLE)}>{show(o.order_status)}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                      No items in this order
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default OrderDetailsPage;