"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { clsx } from "clsx";
import {
  ArrowLeft, ArrowRight, Save, Loader2, FileText, Database, Link2,
  Image as ImageIcon, Layers,
} from "lucide-react";

import { Button } from "../../../components/ui";
import GeneralTab from "../../../components/tabs/addtab/GeneralTab";
import DataTab from "../../../components/tabs/addtab/DataTab";
import LinksTab from "../../../components/tabs/addtab/LinksTab";
import ImagesTab from "../../../components/tabs/addtab/ImagesTab";
import VariationsTab from "../../../components/tabs/addtab/VariationsTab";
import {
  FORM_CSS, WaveBackground, glassCard, hairline, primaryGradient, gradientBtn,
} from "../../../components/tabs/addtab/formTheme";

const API_BASE = "http://127.0.0.1:8000/api";
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

/* shallow helpers used to stop update loops */
const sameArr = (a = [], b = []) => a.length === b.length && a.every((v, i) => v === b[i]);
const sameVariants = (a = [], b = []) =>
  a.length === b.length &&
  a.every((v, i) => {
    const w = b[i];
    return (
      v.color_id === w.color_id &&
      v.size_id === w.size_id &&
      v.stock === w.stock &&
      v.default_image === w.default_image &&
      sameArr(v.images || [], w.images || [])
    );
  });

const ProductManagementForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get("page") || "1", 10) || 1;
  const perPageRaw = parseInt(searchParams.get("per_page"), 10);
  // Same rule as ProductsPage: only accept sizes it offers, otherwise 10
  const itemsPerPage = PAGE_SIZE_OPTIONS.includes(perPageRaw) ? perPageRaw : DEFAULT_PAGE_SIZE;

  const isEditMode = !!id;
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [apiResponse, setApiResponse] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    short_description: "",
    description: "",
    video_url: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    status: false,
    new: false,
    featured: false,
    top_selling: false,
    sale: false,
    special_offer: false,
    sku: "",
    hsn: "",
    cost_price: "",
    selling_price: "",
    discount: "",
    gst: "",
    gst_type: "",
    length: "",
    weight: "",
    height: "",
    width: "",
    season_id: "",
    brand_id: "",
    fabric_id: "",
    categories: [],
    head_categories: [],
    sub_categories: [],
    parent_categories: [],
    child_categories: [],
    tags: [],
    product_new_tags: [],
    related_product: [],
    images: [],
    default_image: null,

    sizes: [],
    colors: [],
    color_ids: [],
    size_ids: [],
    default_size: "",
    default_color: "",
    variants: [],
  });

  const [tableData, setTableData] = useState({});

  const goBack = () => navigate(`/products?page=${initialPage}&per_page=${itemsPerPage}`);

  // Update function for the tabs
  const updateData = useCallback((field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Auto slug generate from name
      if (field === "name") {
        newData.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }

      return newData;
    });
  }, []);

  // ImagesTab reports { default_image, images } in one object
  const updateImages = useCallback((patch) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  }, []);

  // VariationsTab reports the structured variants + defaults + selected ids.
  // The equality guard stops it from re-triggering itself.
  const updateVariantData = useCallback((variants, default_size, default_color, color_ids, size_ids) => {
    setFormData((prev) => {
      if (
        sameVariants(prev.variants, variants) &&
        prev.default_size === default_size &&
        prev.default_color === default_color &&
        sameArr(prev.color_ids, color_ids) &&
        sameArr(prev.size_ids, size_ids)
      ) {
        return prev;
      }
      return { ...prev, variants, default_size, default_color, color_ids, size_ids };
    });
  }, []);

  // Fetch product details if editing
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) {
          setFetching(false);
          return;
        }

        const response = await fetch(`${API_BASE}/products/${id}/edit`);
        if (!response.ok) throw new Error("Failed to fetch product");

        const result = await response.json();
        const resData = result?.data || result;

        setApiResponse(result);

        // Prepare tableData for variants
        const variantsTableData = {};
        (resData.variants || []).forEach((variant) => {
          const colorId = variant.color_id;
          const sizeId = variant.size_id;
          variantsTableData[`${colorId}_${sizeId}_qty`] = variant.stock;
          variantsTableData[`${colorId}_image_files`] = [];
          variantsTableData[`${colorId}_image_previews`] =
            variant.variant_images?.map((img) => img.path) || [];
        });
        setTableData(variantsTableData);

        // Selected sizes / colors: use the ids from the API, else derive from the variants
        const variantSizes = [...new Set((resData.variants || []).map((v) => Number(v.size_id)))];
        const variantColors = [...new Set((resData.variants || []).map((v) => Number(v.color_id)))];
        const sizeIds = (resData.size_ids?.length ? resData.size_ids : variantSizes).map(Number);
        const colorIds = (resData.color_ids?.length ? resData.color_ids : variantColors).map(Number);

        // Map API response to formData
        setFormData({
          id: resData.id || "",
          name: resData.name || "",
          slug: resData.slug || "",
          short_description: resData.short_description || "",
          description: resData.description || "",
          video_url: resData.video_url || "",
          meta_title: resData.meta_title || "",
          meta_description: resData.meta_description || "",
          meta_keywords: resData.meta_keywords || "",

          // Booleans
          status: !!resData.status,
          new: !!resData.new,
          featured: !!resData.featured,
          top_selling: !!resData.top_selling,
          sale: !!resData.sale,
          special_offer: false, // adjust if API has this field

          // Pricing
          sku: resData.sku || "",
          hsn: resData.hsn || "",
          cost_price: resData.cost_price ?? resData.price ?? "",
          selling_price: resData.selling_price || "",
          gst: resData.gst || "",
          gst_type: resData.gst_type || "",
          length: resData.length || "",
          weight: resData.weight || "",
          height: resData.height || "",
          width: resData.width || "",
          stock: resData.stock || "",

          // Relations
          discount: resData.discount?.id || "",
          discount_id: resData.discount?.id || "",
          season_id: resData.season?.id || "",
          brand_id: resData.brand?.id || "",
          fabric_id: resData.fabric?.id || "",

          // Categories
          head_categories: resData.head_categories?.map((c) => c.id) || [],
          parent_categories: resData.parent_categories?.map((c) => c.id || c) || [],
          child_categories: resData.child_categories?.map((c) => c.id || c) || [],
          related_product: resData.related_products?.map((p) => p.id || p) || [],
          tags: resData.tags?.map((t) => t.id || t) || [],

          // Tags
          product_tags: resData.tags?.map((t) => t.id) || [],
          product_new_tags: resData.tags || [],

          // Related products
          related_products: resData.related_products || [],

          // Images
          images: resData.images || [],
          default_image: resData.default_image || null,

          // Variants
          variants: resData.variants || [],

          // Sizes and Colors
          sizes: sizeIds,
          colors: colorIds,
          size_ids: sizeIds,
          color_ids: colorIds,
          default_size: resData.default_size ? Number(resData.default_size) : "",
          default_color: resData.default_color ? Number(resData.default_color) : "",
        });
      } catch (err) {
        console.error("❌ Fetch product error:", err);
        toast.error("❌ Failed to fetch product details.");
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id]);

  // Save handler
  const handleSave = async () => {
    setLoading(true);

    if (!formData.name || formData.name.trim() === "") {
      toast.error("❌ Product name is required.");
      setLoading(false);
      return;
    }
    if (!formData.slug || formData.slug.trim() === "") {
      toast.error("❌ Slug is required.");
      setLoading(false);
      return;
    }
    if (!formData.sku || formData.sku.trim() === "") {
      toast.error("❌ SKU is required.");
      setLoading(false);
      return;
    }
    if (!formData.status) {
      toast.error("❌ Product status must be Active to save.");
      setLoading(false);
      return;
    }

    // Validate variants if they exist
    if (formData.variants && formData.variants.length > 0) {
      const hasInvalidVariants = formData.variants.some(
        (variant) =>
          !variant.color_id ||
          !variant.size_id ||
          variant.stock === undefined ||
          variant.stock < 0
      );

      if (hasInvalidVariants) {
        toast.error("❌ Please ensure all variants have valid color, size, and stock values.");
        setLoading(false);
        return;
      }
    }

    const form = new FormData();

    // Recursive appender
    const appendFormData = (form, key, value) => {
      if (value === undefined || value === null) return;

      if (Array.isArray(value)) {
        if (key === "variants") {
          value.forEach((variant, index) => {
            Object.entries(variant).forEach(([vKey, vVal]) => {
              if (vKey === "images" && Array.isArray(vVal)) {
                vVal.forEach((img, imgIndex) => {
                  form.append(`variants[${index}][images][${imgIndex}]`, img);
                });
              } else if (vKey === "image_files") {
                // skipped on purpose
              } else if (vKey === "default_image") {
                if (vVal) form.append(`variants[${index}][default_image]`, vVal);
              } else {
                form.append(`variants[${index}][${vKey}]`, vVal);
              }
            });
          });
        } else {
          value.forEach((item, index) => {
            appendFormData(form, `${key}[${index}]`, item);
          });
        }
      } else if (typeof value === "object") {
        Object.entries(value).forEach(([childKey, childValue]) => {
          appendFormData(form, `${key}[${childKey}]`, childValue);
        });
      } else {
        form.append(key, value);
      }
    };

    // Main data population
    Object.keys(formData).forEach((key) => {
      const value = formData[key];

      if (["status", "new", "featured", "top_selling", "sale", "special_offer"].includes(key)) {
        form.append(key, value ? 1 : 0);
      } else if (key === "images") {
        value?.forEach((item) => {
          if (item instanceof File) {
            form.append("images[]", item);
          } else if (typeof item === "object") {
            if (item.id) {
              form.append("images[]", item.id); // send ID for existing image
            } else if (item.path_original) {
              form.append("images[]", item.path_original); // fallback to URL
            }
          } else {
            form.append("images[]", item); // plain string fallback
          }
        });
      } else if (key === "default_image") {
        // New upload -> send the file. Existing image (URL string) -> leave unchanged.
        if (value instanceof File) {
          form.append("default_image", value);
        } else if (value && typeof value === "object" && value.id) {
          form.append("default_image", value.id);
        }
      } else {
        appendFormData(form, key, value);
      }
    });

    // For new products, we don't need _method; for edits we do
    if (isEditMode) {
      form.append("_method", "PUT");
    }

    try {
      const response = await fetch(
        isEditMode ? `${API_BASE}/products/${id}` : `${API_BASE}/products`,
        {
          method: "POST",
          body: form,
        }
      );

      const result = await response.json();

      if (response.ok && (result?.success || !isEditMode)) {
        toast.success("✅ Product saved successfully!");
        navigate(`/products?page=${initialPage}&per_page=${itemsPerPage}`);
      } else {
        toast.error(result?.message || "❌ Failed to save product.");
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      toast.error("❌ Something went wrong!");
    }

    setLoading(false);
  };

  // Tabs
  const tabs = apiResponse || !isEditMode
    ? [
        {
          id: "general",
          label: "General",
          icon: FileText,
          content: <GeneralTab data={formData} updateData={updateData} />,
        },
        {
          id: "data",
          label: "Data",
          icon: Database,
          content: (
            <DataTab
              tags={apiResponse?.product_new_tags || []}
              seasons={apiResponse?.seasons || {}}
              fabrics={apiResponse?.fabric_types || {}}
              brands={apiResponse?.brands || {}}
              discounts={apiResponse?.discounts || []}
              formData={formData}
              updateData={updateData}
            />
          ),
        },
        {
          id: "links",
          label: "Links",
          icon: Link2,
          content: (
            <LinksTab
              categories={apiResponse?.new_categories || []}
              subcategories={apiResponse?.sub_categories || []}
              childcategories={apiResponse?.child_categories || []}
              products={apiResponse?.related_products || []}
              tags={apiResponse?.product_new_tags || {}}
              formData={formData}
              updateData={updateData}
            />
          ),
        },
        {
          id: "images",
          label: "Images",
          icon: ImageIcon,
          content: <ImagesTab data={formData} updateData={updateImages} />,
        },
        {
          id: "variations",
          label: "Variations",
          icon: Layers,
          content: (
            <VariationsTab
              sizes={apiResponse?.product_sizes || []}
              colors={apiResponse?.product_colors || []}
              formData={formData}
              setFormData={setFormData}
              tableData={tableData}
              setTableData={setTableData}
              updateData={updateVariantData}
            />
          ),
        },
      ]
    : [];

  const currentIndex = tabs.findIndex((t) => t.id === activeTab);
  const goToNextTab = () => {
    if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1].id);
  };
  const goToPreviousTab = () => {
    if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1].id);
  };
  const isLast = currentIndex === tabs.length - 1;

  return (
    <div className="w-full pp-form pp-view">
      <style>{FORM_CSS}</style>
      <div className="mx-auto w-full max-w-[90rem] space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* HEADER */}
        <div
          className={clsx(
            "relative overflow-hidden rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/20",
            glassCard
          )}
        >
          <WaveBackground />
          <div className="relative z-10 flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {isEditMode ? "Edit product" : "Add product"}
              </p>
              <h1 className="mt-1 break-words text-2xl font-semibold text-card-foreground">
                {formData.name || (isEditMode ? "Edit Product" : "Add Product")}
              </h1>
              {formData.sku && (
                <p className="mt-1 font-mono text-xs text-muted-foreground">SKU: {formData.sku}</p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={goBack}
              leftIcon={<ArrowLeft size={14} />}
              className="gap-2 border-border hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
            >
              Back to products
            </Button>
          </div>
        </div>

        {fetching ? (
          <div
            className={clsx(
              "flex flex-col items-center justify-center rounded-2xl py-20 shadow-xl shadow-black/5",
              glassCard
            )}
            aria-busy="true"
          >
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">Loading product details...</p>
          </div>
        ) : (
          <>
            {/* TABS */}
            <div
              role="tablist"
              className={clsx(
                "flex gap-2 overflow-x-auto rounded-2xl p-2 shadow-xl shadow-black/5 dark:shadow-black/20",
                glassCard
              )}
            >
              {tabs.map((tab, i) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      "flex items-center gap-2 whitespace-nowrap rounded-xl border border-transparent px-4 py-2 text-sm font-medium transition-colors",
                      active
                        ? `bg-gradient-to-r ${primaryGradient} text-white shadow-md shadow-indigo-500/30`
                        : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                    )}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{i + 1}</span>
                  </button>
                );
              })}
            </div>

            {/* ACTIVE TAB */}
            <div key={activeTab}>{tabs.find((tab) => tab.id === activeTab)?.content}</div>

            {/* FOOTER */}
            <div
              className={clsx(
                "sticky bottom-4 z-20 flex items-center justify-between gap-3 rounded-2xl px-4 py-3 shadow-xl shadow-black/10 bg-white/90 dark:bg-slate-900/90 border",
                hairline
              )}
            >
              <Button
                variant="outline"
                onClick={goToPreviousTab}
                disabled={currentIndex === 0}
                leftIcon={<ArrowLeft size={14} />}
                className="gap-2 border-border"
              >
                Previous
              </Button>

              <span className="text-xs text-muted-foreground">
                Step {currentIndex + 1} of {tabs.length}
              </span>

              {isLast ? (
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  leftIcon={
                    loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />
                  }
                  className={clsx("gap-2", gradientBtn)}
                >
                  {loading ? "Saving..." : "Save Product"}
                </Button>
              ) : (
                <Button onClick={goToNextTab} className={clsx("gap-2", gradientBtn)}>
                  Next <ArrowRight size={14} />
                </Button>
              )}
            </div>
          </>
        )}
      </div>
      <ToastContainer theme="colored" />
    </div>
  );
};

export default ProductManagementForm;