"use client";

import { useEffect, useState, useCallback, useMemo, memo } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  IndianRupee, Package, ShoppingCart, Users, ArrowUpRight, ArrowDownRight,
  ChevronRight, RefreshCw, Plus, BarChart3, Truck, CheckCircle2, XCircle, Clock,
  Shirt, Tag, ShoppingBag, Receipt,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { clsx } from "clsx";

import { Skeleton, SkeletonGroup, EmptyState } from "../components/ui";

/* ==========================================================================
   THEME (same glass + indigo/purple look as the Products page)
   No backdrop-blur anywhere: it was the cause of the scroll lag.
   ========================================================================== */
const glassCard = "bg-white/70 dark:bg-slate-900/60 border border-white/30 dark:border-white/10";
const glassInner = "bg-white/50 dark:bg-white/5 border border-white/30 dark:border-white/10";
const cardShadow = "shadow-xl shadow-black/5 dark:shadow-black/20";
const primaryGradient = "from-indigo-500 via-purple-500 to-indigo-600";

const API_BASE = "http://127.0.0.1:8000/api";

const RANGES = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 days" },
  { value: "last_30_days", label: "Last 30 days" },
  { value: "last_90_days", label: "Last 90 days" },
  { value: "this_year", label: "This year" },
];

const STATUS_COLORS = {
  warning: "hsl(var(--warning))",
  info: "hsl(var(--info))",
  primary: "hsl(var(--primary))",
  success: "hsl(var(--success))",
  destructive: "hsl(var(--destructive))",
};

const SEGMENT_COLORS = ["hsl(var(--primary))", "hsl(var(--info))", "hsl(var(--success))"];

const fmtNum = (n) => Number(n || 0).toLocaleString("en-IN");
const fmtMoney = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const pct = (part, whole) => (whole > 0 ? (part / whole) * 100 : 0);

/* ==========================================================================
   MOTION (CSS only: transform/opacity, off for reduced-motion users)
   ========================================================================== */
const MOTION_CSS = `
/* Selected text stays readable: tinted highlight, original text colour kept */
::selection { background: rgba(99,102,241,0.35); color: inherit; }
::-moz-selection { background: rgba(99,102,241,0.35); color: inherit; }
.dark ::selection { background: rgba(165,180,252,0.40); color: inherit; }
@keyframes pp-wave { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes pp-float { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-6px) rotate(3deg); } }
@keyframes pp-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@keyframes pp-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.pp-wave-1 { animation: pp-wave 26s linear infinite; will-change: transform; }
.pp-wave-2 { animation: pp-wave 18s linear infinite reverse; will-change: transform; }
.pp-wave-3 { animation: pp-wave 12s linear infinite; will-change: transform; }
.pp-float { animation: pp-float 3.2s ease-in-out infinite; }
.pp-rise { animation: pp-rise 0.4s ease-out both; }
.pp-grow { transform-origin: left center; animation: pp-grow 0.8s cubic-bezier(.2,.7,.2,1) both; }
@media (prefers-reduced-motion: reduce) {
  .pp-wave-1, .pp-wave-2, .pp-wave-3, .pp-float, .pp-rise, .pp-grow { animation: none !important; }
}
`;

const WAVE_PATH =
  "M0 80 Q180 20 360 80 T720 80 T1080 80 T1440 80 T1800 80 T2160 80 T2520 80 T2880 80 L2880 160 L0 160 Z";

const WaveBackground = memo(function WaveBackground() {
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
    { Icon: Package, left: "10%", delay: "0s" },
    { Icon: Shirt, left: "38%", delay: "-1.1s" },
    { Icon: Tag, left: "64%", delay: "-2.2s" },
    { Icon: ShoppingBag, left: "88%", delay: "-0.6s" },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {layer("pp-wave-1", "text-indigo-500/10 dark:text-indigo-400/10", "70%")}
      {layer("pp-wave-2", "text-purple-500/10 dark:text-purple-400/10", "52%")}
      {layer("pp-wave-3", "text-indigo-500/15 dark:text-indigo-400/15", "34%")}
      {floaters.map(({ Icon, left, delay }, i) => (
        <Icon
          key={i}
          size={18}
          strokeWidth={1.75}
          className="pp-float absolute bottom-3 text-indigo-500/40 dark:text-indigo-300/40"
          style={{ left, animationDelay: delay }}
        />
      ))}
    </div>
  );
});

/* Count-up for the KPI numbers */
function useCountUp(target, duration = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const n = Number(target) || 0;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setV(n); return; }
    let raf, start;
    const tick = (t) => {
      if (start === undefined) start = t;
      const p = Math.min((t - start) / duration, 1);
      setV(n * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return Math.round(v);
}

/* ==========================================================================
   SMALL BUILDING BLOCKS
   ========================================================================== */
const TrendPill = ({ value }) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return null;
  const n = Number(value);
  const up = n >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
        up
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "bg-rose-500/10 text-rose-700 dark:text-rose-300"
      )}
    >
      <Icon size={12} />
      {Math.abs(n).toFixed(1).replace(/\.0$/, "")}%
    </span>
  );
};

const KpiCard = memo(function KpiCard({ title, value, prefix = "", icon: Icon, tint, trend, onClick, delay }) {
  const shown = useCountUp(value);
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
      className={clsx(
        "pp-rise group text-left rounded-2xl p-5 transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        glassCard, cardShadow
      )}
    >
      <div className="flex items-start justify-between">
        <div className={clsx("h-11 w-11 rounded-xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br", tint)}>
          <Icon size={20} />
        </div>
        <TrendPill value={trend} />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{title}</p>
      <p className="mt-0.5 text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
        {prefix}{fmtNum(shown)}
      </p>
      <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-primary transition-colors">
        View details <ChevronRight size={12} className="ml-0.5" />
      </div>
    </button>
  );
});

const InsightCard = memo(function InsightCard({ label, value, hint, percent, icon: Icon, barClass, delay }) {
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={clsx("pp-rise rounded-2xl p-4", glassCard, cardShadow)}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon size={16} className="text-primary" />
      </div>
      <p className="mt-1.5 text-xl font-bold text-foreground tabular-nums">{value}</p>
      <div className="mt-3 h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
        <div
          className={clsx("pp-grow h-full rounded-full", barClass)}
          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
});

const SectionCard = ({ title, description, icon: Icon, action, className, children }) => (
  <section className={clsx("rounded-2xl overflow-hidden", glassCard, cardShadow, className)}>
    <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-white/20 dark:border-white/10">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-card-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action ? (
        action
      ) : Icon ? (
        <div className="h-8 w-8 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon size={15} className="text-primary" />
        </div>
      ) : null}
    </div>
    <div className="p-6">{children}</div>
  </section>
);

/* ==========================================================================
   PAGE
   ========================================================================== */
const Dashboard = () => {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("last_30_days");
  const [updatedAt, setUpdatedAt] = useState(null);

  const [topProducts, setTopProducts] = useState([]);
  const [topProductsLoading, setTopProductsLoading] = useState(true);
  const [customerSegments, setCustomerSegments] = useState([]);
  const [segmentsLoading, setSegmentsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard`);
      const json = await res.json();
      setData(json);
      setUpdatedAt(new Date());
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadReports = useCallback(async (selectedRange) => {
    try {
      setTopProductsLoading(true);
      setSegmentsLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/reports`, {
        params: { filter: selectedRange },
        headers: { Authorization: `Bearer ${token}` },
      });

      const tp = res.data.top_products?.data;
      setTopProducts(
        tp
          ? tp.map((p) => ({ name: p.product_name, sales: p.total_qty, revenue: p.total_sales }))
          : []
      );

      const cs = res.data.customer_segments;
      setCustomerSegments(
        cs
          ? [
              { segment: "New Customers", count: cs.new_customers.count, percentage: cs.new_customers.percentage },
              { segment: "Returning Customers", count: cs.returning_customers.count, percentage: cs.returning_customers.percentage },
              { segment: "Guest Customers", count: cs.vip_customers.count, percentage: cs.vip_customers.percentage },
            ]
          : []
      );
    } catch (err) {
      console.error("Error fetching reports data:", err);
      setTopProducts([]);
      setCustomerSegments([]);
    } finally {
      setTopProductsLoading(false);
      setSegmentsLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);
  useEffect(() => { loadReports(range); }, [range, loadReports]);

  const refreshAll = useCallback(() => {
    loadDashboard();
    loadReports(range);
  }, [loadDashboard, loadReports, range]);

  /* ---- derived data ---- */
  const orderStats = useMemo(() => {
    const s = data?.order_status || {};
    return [
      { label: "Pending", count: s.pending || 0, color: STATUS_COLORS.warning, icon: Clock },
      { label: "Processing", count: s.processing || 0, color: STATUS_COLORS.info, icon: RefreshCw },
      { label: "Shipped", count: s.shipped || 0, color: STATUS_COLORS.primary, icon: Truck },
      { label: "Delivered", count: s.delivered || 0, color: STATUS_COLORS.success, icon: CheckCircle2 },
      { label: "Cancelled", count: s.returned || 0, color: STATUS_COLORS.destructive, icon: XCircle },
    ];
  }, [data]);

  const statusTotal = useMemo(() => orderStats.reduce((sum, i) => sum + i.count, 0), [orderStats]);
  const maxRevenue = useMemo(() => Math.max(0, ...topProducts.map((p) => Number(p.revenue) || 0)), [topProducts]);

  /* ---- loading / error states ---- */
  if (loading) {
    return (
      <div className="w-full max-w-[90rem] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton variant="card" className="h-28" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-40" />)}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-28" />)}
        </div>
        <div className="grid gap-4 xl:grid-cols-12">
          <Skeleton variant="card" className="h-96 xl:col-span-5" />
          <Skeleton variant="card" className="h-96 xl:col-span-7" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-8">
        <EmptyState
          illustration="analytics"
          title="Unable to load dashboard"
          description="Failed to fetch dashboard data. Please check your connection and try again."
          action={{ label: "Retry", onClick: () => window.location.reload() }}
        />
      </div>
    );
  }

  const { total_revenue = 0, total_orders = 0, products = 0, active_customers = 0, growth = {} } = data;

  const kpis = [
    { title: "Revenue", value: total_revenue, prefix: "₹", icon: IndianRupee, tint: "from-indigo-500 to-purple-500", trend: growth?.revenue, link: "/orders" },
    { title: "Orders", value: total_orders, icon: ShoppingCart, tint: "from-sky-500 to-indigo-500", trend: growth?.orders, link: "/orders" },
    { title: "Products", value: products, icon: Package, tint: "from-purple-500 to-fuchsia-500", trend: growth?.products, link: "/products" },
    { title: "Customers", value: active_customers, icon: Users, tint: "from-amber-500 to-orange-500", trend: growth?.customers, link: "/customers" },
  ];

  const delivered = orderStats[3].count;
  const cancelled = orderStats[4].count;
  const pending = orderStats[0].count;
  const processing = orderStats[1].count;
  const aov = total_orders > 0 ? total_revenue / total_orders : 0;
  const fulfilment = pct(delivered, statusTotal);
  const cancelRate = pct(cancelled, statusTotal);
  const inProgress = pending + processing;

  const insights = [
    { label: "Average order value", value: fmtMoney(aov), percent: 100, hint: "Revenue ÷ total orders", icon: Receipt, barClass: `bg-gradient-to-r ${primaryGradient}` },
    { label: "Fulfilment rate", value: `${fulfilment.toFixed(1)}%`, percent: fulfilment, hint: `${fmtNum(delivered)} of ${fmtNum(statusTotal)} orders delivered`, icon: CheckCircle2, barClass: "bg-emerald-500" },
    { label: "Orders in progress", value: fmtNum(inProgress), percent: pct(inProgress, statusTotal), hint: `${fmtNum(pending)} pending · ${fmtNum(processing)} processing`, icon: Clock, barClass: "bg-amber-500" },
    { label: "Cancellation rate", value: `${cancelRate.toFixed(1)}%`, percent: cancelRate, hint: `${fmtNum(cancelled)} cancelled or returned`, icon: XCircle, barClass: "bg-rose-500" },
  ];

  const quickActions = [
    { to: "/addproduct", label: "Add product", sub: "List a new item", icon: Plus },
    { to: "/orders", label: "View orders", sub: `${fmtNum(inProgress)} in progress`, icon: ShoppingCart },
    { to: "/customers", label: "Manage customers", sub: `${fmtNum(active_customers)} active`, icon: Users },
    { to: "/reports", label: "View reports", sub: "Sales and trends", icon: BarChart3 },
  ];

  return (
    <div className="w-full max-w-[90rem] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <style>{MOTION_CSS}</style>

      {/* HEADER WITH WAVES */}
      <div className={clsx("relative overflow-hidden rounded-2xl", glassCard, cardShadow)}>
        <WaveBackground />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-6">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Overview of your store's performance
              {updatedAt && (
                <span className="ml-2 text-muted-foreground/80">
                  · Updated {updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              aria-label="Report period"
              className={clsx(
                "h-9 px-3 rounded-lg text-sm text-foreground cursor-pointer",
                "focus:outline-none focus:ring-2 focus:ring-primary/40",
                glassInner
              )}
            >
              {RANGES.map((r) => (
                <option key={r.value} value={r.value} className="text-slate-900">{r.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={refreshAll}
              aria-label="Refresh dashboard"
              className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <RefreshCw size={16} className={topProductsLoading || segmentsLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <KpiCard
            key={k.title}
            title={k.title}
            value={k.value}
            prefix={k.prefix}
            icon={k.icon}
            tint={k.tint}
            trend={k.trend}
            delay={i * 60}
            onClick={() => navigate(k.link)}
          />
        ))}
      </div>

      {/* INSIGHTS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {insights.map((item, i) => (
          <InsightCard key={item.label} {...item} delay={240 + i * 60} />
        ))}
      </div>

      {/* ORDERS + TOP PRODUCTS */}
      <div className="grid gap-4 xl:grid-cols-12">
        <SectionCard
          title="Order analytics"
          description="Current order distribution"
          icon={ShoppingCart}
          className="xl:col-span-5"
        >
          {statusTotal === 0 ? (
            <EmptyState illustration="products" title="No orders yet" description="Order statuses will appear here." />
          ) : (
            <div className="flex flex-col sm:flex-row xl:flex-col 2xl:flex-row items-center gap-6">
              <div className="relative h-[220px] w-[220px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStats}
                      dataKey="count"
                      nameKey="label"
                      innerRadius={68}
                      outerRadius={96}
                      paddingAngle={2}
                      strokeWidth={0}
                      isAnimationActive
                      animationDuration={700}
                    >
                      {orderStats.map((entry) => (
                        <Cell key={entry.label} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        boxShadow: "var(--shadow-lg)",
                      }}
                      formatter={(value, name) => [fmtNum(value), name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-foreground tabular-nums">{fmtNum(statusTotal)}</span>
                  <span className="text-xs text-muted-foreground">total orders</span>
                </div>
              </div>

              <ul className="w-full space-y-2.5">
                {orderStats.map((item) => {
                  const share = pct(item.count, statusTotal);
                  return (
                    <li key={item.label}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-foreground">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          {item.label}
                        </span>
                        <span className="tabular-nums">
                          <span className="font-semibold text-foreground">{fmtNum(item.count)}</span>
                          <span className="ml-2 text-muted-foreground">{share.toFixed(1)}%</span>
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-muted/60 overflow-hidden">
                        <div
                          className="pp-grow h-full rounded-full"
                          style={{ width: `${share}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Top products"
          description="Best performing products in the selected period"
          className="xl:col-span-7"
          action={
            <Link
              to="/reports"
              className="inline-flex items-center text-sm font-medium text-primary hover:underline shrink-0"
            >
              View reports <ChevronRight size={14} />
            </Link>
          }
        >
          {topProductsLoading ? (
            <SkeletonGroup count={5} variant="tableRow" />
          ) : topProducts.length === 0 ? (
            <EmptyState
              illustration="products"
              title="No product data"
              description="No top performing products found for this period."
            />
          ) : (
            <ol className="space-y-4">
              {topProducts.slice(0, 5).map((product, index) => {
                const width = maxRevenue > 0 ? (Number(product.revenue) / maxRevenue) * 100 : 0;
                return (
                  <li key={`${product.name}-${index}`} className="flex items-center gap-4">
                    <span
                      className={clsx(
                        "h-9 w-9 shrink-0 rounded-xl flex items-center justify-center text-sm font-bold",
                        index === 0
                          ? `bg-gradient-to-br ${primaryGradient} text-white shadow-md shadow-indigo-500/30`
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate font-medium text-foreground">{product.name}</p>
                        <p className="shrink-0 font-semibold text-foreground tabular-nums">{fmtMoney(product.revenue)}</p>
                      </div>
                      <div className="mt-1.5 h-2 rounded-full bg-muted/60 overflow-hidden">
                        <div
                          className={clsx("pp-grow h-full rounded-full bg-gradient-to-r", primaryGradient)}
                          style={{ width: `${width}%`, animationDelay: `${index * 80}ms` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground tabular-nums">{fmtNum(product.sales)} units sold</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </SectionCard>
      </div>

      {/* SEGMENTS + QUICK ACTIONS */}
      <div className="grid gap-4 xl:grid-cols-12">
        <SectionCard
          title="Customer segments"
          description="How your customers are distributed"
          icon={Users}
          className="xl:col-span-5"
        >
          {segmentsLoading ? (
            <SkeletonGroup count={3} variant="card" />
          ) : customerSegments.length === 0 ? (
            <EmptyState
              illustration="users"
              title="No segment data"
              description="No customer segment data available for this period."
            />
          ) : (
            <div className="space-y-5">
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted/60">
                {customerSegments.map((seg, i) => (
                  <div
                    key={seg.segment}
                    className="pp-grow h-full"
                    style={{ width: `${Number(seg.percentage) || 0}%`, backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }}
                    title={`${seg.segment}: ${seg.percentage}%`}
                  />
                ))}
              </div>
              <ul className="space-y-3">
                {customerSegments.map((seg, i) => (
                  <li key={seg.segment} className={clsx("flex items-center justify-between rounded-xl px-4 py-3", glassInner)}>
                    <span className="flex items-center gap-2.5 text-sm font-medium text-foreground">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }} />
                      {seg.segment}
                    </span>
                    <span className="tabular-nums text-sm">
                      <span className="font-bold text-foreground">{fmtNum(seg.count)}</span>
                      <span className="ml-2 text-muted-foreground">{Number(seg.percentage) || 0}%</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Quick actions"
          description="Common tasks to manage your store"
          className="xl:col-span-7"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {quickActions.map(({ to, label, sub, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={clsx(
                  "group flex items-center gap-4 rounded-xl p-4 transition-all duration-200",
                  "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-indigo-500/10",
                  glassInner
                )}
              >
                <div className={clsx("h-11 w-11 shrink-0 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/30 bg-gradient-to-br", primaryGradient)}>
                  <Icon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">{sub}</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default Dashboard;