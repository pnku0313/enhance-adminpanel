"use client";

import React, { useEffect, useState, useCallback, memo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft, Edit, Package, Tag, Layers, Ruler, Globe, Video, Palette,
  Image as ImageIcon, Check, X, Boxes, FileText, RefreshCw, AlertTriangle,
  Percent, Shirt, ShoppingBag, IndianRupee, Link2,
} from "lucide-react";
import axios from "axios";
import { clsx } from "clsx";
import PermissionGuard from "../../components/auth/PermissionGuard";
import { Button, Badge } from "../../components/ui";

/* ==========================================================================
   THEME (same tokens as ProductsPage)
   ========================================================================== */
const glassCard = "bg-white/70 dark:bg-slate-900/60 border border-slate-300/80 dark:border-white/20";
const glassSubtle = "bg-white/50 dark:bg-white/5 border border-slate-300/80 dark:border-white/20";
const glassCardHeader = "bg-white/40 dark:bg-white/5 border-b border-slate-300/80 dark:border-white/20";
const primaryGradient = "from-indigo-500 via-purple-500 to-indigo-600";

const API_BASE = "http://127.0.0.1:8000/api";
const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/* ==========================================================================
   MOTION (CSS only, switched off for reduced-motion users)
   ========================================================================== */
const MOTION_CSS = `
@keyframes pp-float { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-6px) rotate(3deg); } }
@keyframes pp-fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@keyframes pp-wave { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.pp-float { animation: pp-float 3.2s ease-in-out infinite; }
.pp-fade-up { animation: pp-fade-up 0.35s ease-out both; }
.pp-wave-1 { animation: pp-wave 26s linear infinite; will-change: transform; }
.pp-wave-2 { animation: pp-wave 18s linear infinite reverse; will-change: transform; }
.pp-wave-3 { animation: pp-wave 12s linear infinite; will-change: transform; }
/* Selected text: keep the text colour and use a soft indigo highlight so it stays readable */
.pp-view ::selection { background: rgba(99, 102, 241, 0.35) !important; color: inherit !important; }
.pp-view ::-moz-selection { background: rgba(99, 102, 241, 0.35) !important; color: inherit !important; }
@media (prefers-reduced-motion: reduce) {
  .pp-float, .pp-fade-up, .pp-wave-1, .pp-wave-2, .pp-wave-3 { animation: none !important; }
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
    { Icon: Package, left: "8%", delay: "0s" },
    { Icon: Shirt, left: "34%", delay: "-1.1s" },
    { Icon: Tag, left: "61%", delay: "-2.2s" },
    { Icon: ShoppingBag, left: "86%", delay: "-0.6s" },
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
    </div>
  );
});

/* ==========================================================================
   HELPERS
   ========================================================================== */
const isEmpty = (v) => v === null || v === undefined || v === "";
const show = (v) => (isEmpty(v) ? "—" : v);
const money = (v) => (isEmpty(v) ? "—" : `₹${Number(v).toLocaleString()}`);
const namesOf = (arr) => (Array.isArray(arr) ? arr.map((x) => x?.name).filter(Boolean) : []);

const chipBase = "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap";
const chipIndigo = `${chipBase} bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-400/30`;
const chipPurple = `${chipBase} bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-400/30`;

/* Small building blocks ---------------------------------------------------- */
function Section({ icon: Icon, title, children, className, delay = 0 }) {
  return (
    <section
      className={clsx("pp-fade-up rounded-2xl overflow-hidden shadow-xl shadow-black/5 dark:shadow-black/20", glassCard, className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={clsx("px-5 py-3.5 flex items-center gap-2.5", glassCardHeader)}>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-border">
          <Icon size={16} className="text-primary" />
        </span>
        <h2 className="text-sm font-semibold text-card-foreground">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <div className="min-w-0 border-b border-slate-300/80 dark:border-white/20 pb-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm font-medium text-foreground break-words">{children}</div>
    </div>
  );
}

function StatTile({ icon: Icon, label, value, accent }) {
  return (
    <div className={clsx("rounded-xl p-4", glassSubtle)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <Icon size={16} className="text-primary" />
      </div>
      <p className={clsx("mt-2 font-mono text-xl font-semibold", accent ? "text-primary" : "text-foreground")}>{value}</p>
    </div>
  );
}

function ChipGroup({ label, items, tone = chipIndigo }) {
  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((n, i) => (
            <span key={`${n}-${i}`} className={tone}>{n}</span>
          ))}
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      )}
    </div>
  );
}

function FlagItem({ label, on }) {
  return (
    <div className={clsx("flex items-center justify-between rounded-lg px-3 py-2", glassSubtle)}>
      <span className="text-sm text-foreground">{label}</span>
      <span
        className={clsx(
          "flex h-6 w-6 items-center justify-center rounded-full",
          on ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-500"
        )}
        aria-label={on ? "Yes" : "No"}
      >
        {on ? <Check size={14} /> : <X size={14} />}
      </span>
    </div>
  );
}

function RichText({ html }) {
  if (isEmpty(html)) return <span className="text-sm text-muted-foreground">—</span>;
  return (
    <div
      className="prose prose-sm max-w-none text-foreground dark:prose-invert [&_img]:max-w-full [&_img]:rounded-lg"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/* Loading skeleton ---------------------------------------------------------- */
function PageSkeleton() {
  const bar = "animate-pulse rounded-lg bg-slate-200/70 dark:bg-white/10";
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading product">
      <div className={clsx("h-32 rounded-2xl", bar)} />
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className={clsx("h-96 rounded-2xl", bar)} />
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <div key={i} className={clsx("h-24 rounded-xl", bar)} />)}
          </div>
          <div className={clsx("h-56 rounded-2xl", bar)} />
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   PAGE
   ========================================================================== */
export default function ViewProductPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(queryParams.get("page"), 10) || 1;
  const perPageRaw = parseInt(queryParams.get("per_page"), 10);
  // Same rule as ProductsPage: only accept sizes it offers, otherwise 10
  const perPageFromUrl = PAGE_SIZE_OPTIONS.includes(perPageRaw) ? perPageRaw : DEFAULT_PAGE_SIZE;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(null);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE}/products/${id}`);
      setProduct(res.data.data);
    } catch (err) {
      setError("Error fetching product");
      console.error("Error fetching product", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const goBack = () => navigate(`/products?page=${pageFromUrl}&per_page=${perPageFromUrl}`);
  const goEdit = () => navigate(`/edit-product/${id}?page=${pageFromUrl}&per_page=${perPageFromUrl}`);

  /* Gallery: main image first, then additional images, no duplicates */
  const gallery = product
    ? [...new Set([product.default_image, ...(product.images || []).map((i) => i?.path_original)].filter(Boolean))]
    : [];
  const mainImage = activeImage && gallery.includes(activeImage) ? activeImage : gallery[0];

  const flags = product
    ? [
        { label: "New", on: !!product.new },
        { label: "Featured", on: !!product.featured },
        { label: "Top Selling", on: !!product.top_selling },
        { label: "On Sale", on: !!product.sale },
      ]
    : [];

  const discountValue = !isEmpty(product?.discount?.name) ? `${parseInt(product.discount.name, 10)}%` : "—";
  const gstValue =
    product?.gst_inclusive === true ? "Inclusive" : product?.gst_inclusive === false ? "Exclusive" : "—";

  const backButton = (
    <Button
      variant="outline"
      onClick={goBack}
      leftIcon={<ArrowLeft size={14} />}
      className="gap-2 border-border hover:bg-primary/5 hover:border-primary/30 hover:text-primary"
    >
      Back
    </Button>
  );

  return (
    <div className="w-full pp-view">
      <style>{MOTION_CSS}</style>
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {loading ? (
          <PageSkeleton />
        ) : error ? (
          <div className={clsx("mx-auto max-w-lg rounded-2xl p-8 text-center shadow-xl shadow-black/5", glassCard)}>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10">
              <AlertTriangle className="text-rose-500" size={22} />
            </div>
            <h1 className="text-lg font-semibold text-card-foreground">Couldn't load this product</h1>
            <p className="mt-1 text-sm text-muted-foreground">{error}. Check your connection and try again.</p>
            <div className="mt-5 flex justify-center gap-2">
              {backButton}
              <Button
                onClick={fetchProduct}
                leftIcon={<RefreshCw size={14} />}
                className={clsx("gap-2 bg-gradient-to-r text-white shadow-lg shadow-indigo-500/30", primaryGradient)}
              >
                Retry
              </Button>
            </div>
          </div>
        ) : !product ? (
          <div className={clsx("mx-auto max-w-lg rounded-2xl p-8 text-center shadow-xl shadow-black/5", glassCard)}>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
              <Package className="text-primary" size={22} />
            </div>
            <h1 className="text-lg font-semibold text-card-foreground">No product found</h1>
            <p className="mt-1 text-sm text-muted-foreground">This product may have been removed.</p>
            <div className="mt-5 flex justify-center">{backButton}</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ------------------------------------------------ HEADER */}
            <div className={clsx("relative rounded-2xl overflow-hidden shadow-xl shadow-black/5 dark:shadow-black/20", glassCard)}>
              <WaveBackground />
              <div className="relative z-10 px-6 py-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Product details</p>
                    <h1 className="mt-1 text-2xl font-semibold text-card-foreground break-words">
                      {product.name || "Untitled product"}
                    </h1>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant={product.status ? "success" : "inactive"} dot className="text-xs px-2 py-1">
                        {product.status ? "Active" : "Inactive"}
                      </Badge>
                      {flags.filter((f) => f.on).map((f) => (
                        <span key={f.label} className={chipIndigo}>{f.label}</span>
                      ))}
                      <span className="font-mono text-xs text-muted-foreground">SKU: {show(product.sku)}</span>
                    </div>
                    {!isEmpty(product.slug) && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground break-all">
                        <Link2 size={12} className="shrink-0" /> {product.slug}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {backButton}
                    <PermissionGuard permission="edit_product">
                      <Button
                        onClick={goEdit}
                        leftIcon={<Edit size={14} />}
                        className={clsx("gap-2 bg-gradient-to-r text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40", primaryGradient)}
                      >
                        Edit Product
                      </Button>
                    </PermissionGuard>
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------ GALLERY + SUMMARY */}
            <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
              <Section icon={ImageIcon} title="Images" delay={40}>
                <div className={clsx("aspect-square w-full overflow-hidden rounded-xl flex items-center justify-center", glassSubtle)}>
                  {mainImage ? (
                    <img src={mainImage} alt={product.name || "Product"} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Package size={36} className="text-primary/60" />
                      <span className="text-sm">No image</span>
                    </div>
                  )}
                </div>
                {gallery.length > 1 && (
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {gallery.map((src, i) => (
                      <button
                        key={`${src}-${i}`}
                        onClick={() => setActiveImage(src)}
                        aria-label={`Show image ${i + 1}`}
                        className={clsx(
                          "aspect-square overflow-hidden rounded-lg border-2 transition",
                          src === mainImage ? "border-primary shadow-md shadow-indigo-500/20" : "border-transparent opacity-70 hover:opacity-100"
                        )}
                      >
                        <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </Section>

              <div className="space-y-6">
                <div className="pp-fade-up grid grid-cols-2 gap-4 md:grid-cols-4" style={{ animationDelay: "80ms" }}>
                  <StatTile icon={IndianRupee} label="Selling Price" value={money(product.selling_price)} accent />
                  <StatTile icon={Tag} label="Cost Price" value={money(product.price)} />
                  <StatTile icon={Boxes} label="Stock" value={show(product.stock)} />
                  <StatTile icon={Percent} label="Discount" value={discountValue} />
                </div>

                <Section icon={FileText} title="Description" delay={120}>
                  <div className="space-y-5">
                    <div>
                      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Short description</p>
                      <RichText html={product.short_description} />
                    </div>
                    <div className="border-t border-slate-300/80 dark:border-white/20 pt-5">
                      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Full description</p>
                      <RichText html={product.description} />
                    </div>
                  </div>
                </Section>
              </div>
            </div>

            {/* ------------------------------------------------ DETAILS + CLASSIFICATION */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Section icon={Ruler} title="Specifications" delay={160}>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                  <Field label="SKU"><span className="font-mono">{show(product.sku)}</span></Field>
                  <Field label="HSN"><span className="font-mono">{show(product.hsn)}</span></Field>
                  <Field label="GST">{gstValue}</Field>
                  <Field label="Weight">{show(product.weight)}</Field>
                  <Field label="Length">{show(product.length)}</Field>
                  <Field label="Width">{show(product.width)}</Field>
                  <Field label="Height">{show(product.height)}</Field>
                </div>
                <div className="mt-5 border-t border-slate-300/80 dark:border-white/20 pt-5">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Flags</p>
                  <div className="grid grid-cols-2 gap-2">
                    <FlagItem label="Active" on={!!product.status} />
                    {flags.map((f) => <FlagItem key={f.label} label={f.label} on={f.on} />)}
                  </div>
                </div>
              </Section>

              <Section icon={Layers} title="Classification" delay={200}>
                <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                  <Field label="Brand">{show(product.brand?.name)}</Field>
                  <Field label="Season">{show(product.season?.name)}</Field>
                  <Field label="Fabric">{show(product.fabric?.name)}</Field>
                </div>
                <div className="mt-5 divide-y divide-slate-300/80 dark:divide-white/20 border-t border-slate-300/80 dark:border-white/20 pt-5">
                  <ChipGroup label="Head categories" items={namesOf(product.head_categories)} />
                  <ChipGroup label="Parent categories" items={namesOf(product.parent_categories)} />
                  <ChipGroup label="Child categories" items={namesOf(product.child_categories)} />
                  <ChipGroup label="Tags" items={namesOf(product.tags)} tone={chipPurple} />
                  <ChipGroup label="Related products" items={namesOf(product.related_products)} />
                </div>
              </Section>
            </div>

            {/* ------------------------------------------------ SEO + MEDIA */}
            <Section icon={Globe} title="SEO & Media" delay={240}>
              <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
                <Field label="Meta title">{show(product.meta_title)}</Field>
                <Field label="Meta keywords">{show(product.meta_keywords)}</Field>
                <div className="md:col-span-2">
                  <Field label="Meta description">{show(product.meta_description)}</Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Video URL">
                    {isEmpty(product.video_url) ? (
                      "—"
                    ) : (
                      <a
                        href={product.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary hover:underline"
                      >
                        <Video size={14} /> {product.video_url}
                      </a>
                    )}
                  </Field>
                </div>
              </div>
            </Section>

            {/* ------------------------------------------------ VARIANTS */}
            {Array.isArray(product.variants) && product.variants.length > 0 && (
              <Section icon={Palette} title={`Variants (${product.variants.length})`} delay={280}>
                <div className="-m-5 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white/30 dark:bg-white/10 border-b border-slate-300/80 dark:border-white/20">
                      <tr className="text-left divide-x divide-slate-300/70 dark:divide-white/20">
                        <th className="px-4 py-3 font-medium text-foreground">Size</th>
                        <th className="px-4 py-3 font-medium text-foreground">Color</th>
                        <th className="px-4 py-3 text-right font-medium text-foreground">Stock</th>
                        <th className="px-4 py-3 font-medium text-foreground">Status</th>
                        <th className="px-4 py-3 font-medium text-foreground">Images</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.variants.map((v) => (
                        <tr key={v.id} className="border-b border-slate-300/80 dark:border-white/20 divide-x divide-slate-300/70 dark:divide-white/20 transition-colors last:border-b-0 hover:bg-primary/5">
                          <td className="px-4 py-3 font-medium text-foreground">
                            {show(v.size?.name || v.size_name || v.size_id)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-foreground">
                              {(v.color_code || v.color_code_2) && (
                                <span
                                  className="inline-block h-6 w-6 shrink-0 rounded-full border border-border shadow-sm"
                                  style={{
                                    background: v.color_code_2
                                      ? `linear-gradient(135deg, ${v.color_code} 50%, ${v.color_code_2} 50%)`
                                      : v.color_code,
                                  }}
                                />
                              )}
                              {show(v.color_name || v.color?.name)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-foreground">{show(v.stock)}</td>
                          <td className="px-4 py-3">
                            <Badge variant={v.status === 1 ? "success" : "inactive"} dot className="text-xs px-2 py-1 whitespace-nowrap">
                              {v.status === 1 ? "Active (Default)" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            {v.variant_images && v.variant_images.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {v.variant_images.map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img.path}
                                    alt={`Variant image ${idx + 1}`}
                                    loading="lazy"
                                    className="h-14 w-14 rounded-lg border border-border object-cover shadow-sm"
                                  />
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}