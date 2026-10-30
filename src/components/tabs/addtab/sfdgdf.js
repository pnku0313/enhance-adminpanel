// http://127.0.0.1:8000/api   replaced
"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import GeneralTab from "./GeneralTab";
import DataTab from "./DataTab";
import LinksTab from "./LinksTab";
import ImagesTab from "./ImagesTab";
import VariationsTab from "./VariationsTab";

const ProductManagementForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;

  const [activeTab, setActiveTab] = useState("general");
  const navigate = useNavigate();

  const [productData, setProductData] = useState({
    name: "",
    slug: "",
    short_description: "",
    description: "",
    price: "",
    stock: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    status: true, // ✅ boolean
    new: false,
    featured: false,
    top_selling: false,
    sale: false,
    video_url: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    sku: "",
    hsn: "",
    cost_price: "",
    selling_price: "",
    discount: "",
    gst: "",

    // Product Links Tab Data
    season_id: [],
    fabric_id: [],
    brand_id: [],
    default_image: null,
    images: [],
    tags: [],
    discounts: [],
    head_categories: [],
    parent_categories: [],
    child_categories: [],
    related_products: [],
    variants: [],
  });

  // ✅ Fetch product details if editing
  useEffect(() => {
    if (isEditMode === true) {
      fetch(`http://127.0.0.1:8000/api/products/${id}/edit`)
        .then((res) => res.json())
        .then((data) => {
          console.log("data update", data);
          debugger;
          if (data) {
            setProductData((prev) => ({
              ...prev,
              ...data,
            }));
          }
        })
        .catch((err) => console.error("❌ Edit Product Error:", err));
    } else {
      fetch(`http://127.0.0.1:8000/api/products/create`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            console.log("dzfuysdf", data);
            debugger;
            setProductData((prev) => ({
              ...prev,
              ...data,
            }));
          }
        })
        .catch((err) => console.error("❌ Create Product Error:", err));
    }
  }, [id, isEditMode]);

  const tabs = [
    { id: "general", label: "General" },
    { id: "data", label: "Data" },
    { id: "links", label: "Links" },
    { id: "images", label: "Image" },
    { id: "variations", label: "Variant" },
  ];

  const updateProductData = (field, value) => {
    setProductData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ✅ Helper for nested FormData
  const appendFormData = (formData, key, value) => {
    if (value === null || value === undefined) return;

    if (Array.isArray(value)) {
      value.forEach((item, idx) => {
        appendFormData(formData, `${key}[${idx}]`, item);
      });
    } else if (typeof value === "object" && !(value instanceof File)) {
      Object.keys(value).forEach((subKey) => {
        appendFormData(formData, `${key}[${subKey}]`, value[subKey]);
      });
    } else {
      formData.append(key, value);
    }
  };

  const handleSave = async () => {
    // ✅ Frontend validation
    if (!productData.name || productData.name.trim() === "") {
      toast.error("❌ Product name is required.");
      return;
    }

    console.log("🛠 Sending product data to server:", productData);

    const formData = new FormData();
    console.log("kesgdfgsi", productData.fabric_types);

    for (const key in productData) {
      const value = productData[key];
      console.log(key, value);

      // ✅ Fix boolean fields explicitly
      if (["status", "new", "featured", "top_selling", "sale"].includes(key)) {
        formData.append(key, value ? 1 : 0);
      } else if (key === "images" && Array.isArray(value)) {
        value.forEach((item) => {
          if (item instanceof File) {
            formData.append("images[]", item);
          }
        });
      } else if (key === "default_image") {
        if (value instanceof File) {
          formData.append("default_image", value);
        }
      } else {
        appendFormData(formData, key, value);
      }
    }

    // Debug: entries
    // for (let [k, v] of formData.entries()) {
    //   console.log("📦 FormData:", k, v);
    // }
    debugger;
    try {
      const response = await fetch(
        isEditMode
          ? `http://127.0.0.1:8000/api/products/${id}`
          : "http://127.0.0.1:8000/api/products",
        {
          method: isEditMode ? "PUT" : "POST",
          body: formData,
        }
      );

      const data = await response.json();
      console.log("✅ POST/PUT Product Response:", data);
      debugger;

      if (response.ok) {
        toast.success("✅ Product saved successfully!");
        // navigate("/products");
        setTimeout(() => {
          // navigate("/products");
        }, 2200);
      } else {
        // ✅ Backend validation errors
        if (data?.message) {
          toast.error(`❌ ${data.message}`);
        } else {
          toast.error("❌ Failed to save product. Please check the inputs.");
        }
      }
    } catch (error) {
      console.error("❌ API Error:", error);
      toast.error("❌ An error occurred while saving the product.");
    }
  };

  const getCurrentTabIndex = () =>
    tabs.findIndex((tab) => tab.id === activeTab);

  const goToPreviousTab = () => {
    const currentIndex = getCurrentTabIndex();
    if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1].id);
  };

  const goToNextTab = () => {
    const currentIndex = getCurrentTabIndex();
    if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1].id);
  };
  console.log("productData.discounts", productData);
  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralTab data={productData} updateData={updateProductData} />;
      case "data":
        return (
          <DataTab
            tags={productData.product_new_tags}
            seasons={productData.seasons}
            fabrics={productData.fabric_types}
            brands={productData.brands}
            discounts={productData.discounts}
            formData={productData}
            updateData={updateProductData}
          />
        );
      case "links":
        return (
          <LinksTab
            categories={productData.new_categories}
            subcategories={productData.sub_catgegories}
            childcategories={productData.child_catgegories}
            products={productData.related_products}
            tags={productData.product_new_tags}
            formData={productData}
            updateData={updateProductData}
          />
        );
      case "images":
        return (
          <ImagesTab
            data={{
              default_image: productData.default_image,
              images: productData.images,
            }}
            updateData={(updated) =>
              setProductData((prev) => ({
                ...prev,
                default_image: updated.default_image,
                images: updated.images,
              }))
            }
          />
        );
      case "variations":
        return (
          // <VariationsTab
          //   colors={productData.product_colors}
          //   sizes={productData.product_sizes}
          //   data={productData.variants}
          //   updateData={(variants) =>
          //     setProductData((prev) => ({
          //       ...prev,
          //       variants,
          //     }))
          //   }
          // />
          <VariationsTab
            colors={productData.product_colors}
            sizes={productData.product_sizes}
            data={productData.variants}
            updateData={(variants, default_size, default_color) =>
              setProductData((prev) => ({
                ...prev,
                variants,
                default_size,
                default_color,
              }))
            }
          />
        );
      default:
        return <GeneralTab data={productData} updateData={updateProductData} />;
    }
  };

  return (
    <div
      className="product-form-container dark:bg-gray-900 dark:text-white bg-transparent"
      style={{
        width: "100%",
        overflowY: "hidden",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div style={{ minWidth: "768px", paddingBottom: "20px" }}>
        <div
          className="dark:text-white"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 10px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>
            {isEditMode ? "Edit Product" : "Add Product"}
          </h2>
        </div>

        <hr className="border-gray-300 dark:border-gray-700 mt-0" />

        {/* Tabs */}
        <div
          className="dark:text-white"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 10px 0",
          }}
        >
          <div style={{ display: "flex", gap: "10px" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderBottom:
                    activeTab === tab.id
                      ? "3px solid #dc2626"
                      : "3px solid transparent",
                  backgroundColor:
                    activeTab === tab.id ? "#dc2626" : "transparent",
                  color: activeTab === tab.id ? "#fff" : "inherit",
                  fontWeight: activeTab === tab.id ? "bold" : "normal",
                  borderRadius: "5px 5px 0 0",
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-gray-300 dark:border-gray-700 mt-0" />

        {/* Tab Content */}
        <div
          className="tab-content dark:text-white"
          style={{ padding: "20px" }}
        >
          {renderTabContent()}
        </div>

        <hr className="border-gray-300 dark:border-gray-700 mt-0" />

        {/* Navigation */}
        <div
          className="form-navigation"
          style={{
            padding: "0 20px 20px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={goToPreviousTab}
            disabled={getCurrentTabIndex() === 0}
            className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white disabled:bg-gray-300 disabled:text-gray-500"
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "14px",
            }}
          >
            ← Previous
          </button>

          {getCurrentTabIndex() === tabs.length - 1 && (
            <button
              onClick={handleSave}
              style={{
                padding: "8px 16px",
                backgroundColor: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                fontWeight: "bold",
                cursor: "pointer",
                marginTop: "14px",
              }}
            >
              Save Product
            </button>
          )}

          <button
            onClick={goToNextTab}
            disabled={getCurrentTabIndex() === tabs.length - 1}
            className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white disabled:bg-gray-300 disabled:text-gray-500"
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "14px",
            }}
          >
            Next →
          </button>
        </div>

        <hr className="border-gray-300 dark:border-gray-700 mt-0" />
      </div>
      {/* Toastify Container */}
      <ToastContainer />
    </div>
  );
};

export default ProductManagementForm;
