// http://127.0.0.1:8000/api   replaced
"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import GeneralTab from "./GeneralTab";
import DataTab from "../../components/tabs/DataTab";
import LinksTab from "./LinksTab";
import ImagesTab from "./ImagesTab";
import VariationsTab from "./VariationsTab";

const ProductManagementForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;

  const [activeTab, setActiveTab] = useState("general");

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
    status: true,
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
    head_categories: [],
    parent_categories: [],
    child_categories: [],
    related_products: [],
    variants: [],
  });

  // ✅ Fetch product details if editing
  useEffect(() => {
    if (isEditMode) {
      // 📝 Edit mode me product details fetch karna
      console.log(`📡 Fetching product by ID: ${id}`);
      fetch(
        `http://127.0.0.1:8000/api/products/${id}`
      )
        .then((res) => res.json())
        .then((data) => {
          console.log("✅ Edit Product Response:", data);
          if (data) {
            setProductData((prev) => ({
              ...prev,
              ...data, // API ke keys match hone chahiye
            }));
          }
        })
        .catch((err) => {
          console.error("❌ Edit Product Error:", err);
        });
    } else {
      // 🆕 Create mode me naya product default data fetch karna
      console.log("📡 Fetching default create product data");
      fetch(
        `http://127.0.0.1:8000/api/products/create`
      )
        .then((res) => res.json())
        .then((data) => {
        
          if (data) {
            setProductData((prev) => ({
              ...prev,
              ...data,
            }));
          }
          
        })
        .catch((err) => {
          console.error("❌ Create Product Error:", err);
        });
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

  // ✅ Handle Save - POST with FormData
  const handleSave = async () => {
  

    try {
      const formData = new FormData();

      // Append all fields
      for (const key in productData) {
        if (
          Array.isArray(productData[key]) &&
          key !== "images" &&
          key !== "default_image"
        ) {
          // Multiple values for array fields
          productData[key].forEach((item, idx) =>
            formData.append(`${key}[${idx}]`, item)
          );
        } else if (key === "images") {
          // Multiple image files
          productData.images.forEach((file) => {
            formData.append("images[]", file);
          });
        } else if (key === "default_image") {
          if (productData.default_image) {
            formData.append("default_image", productData.default_image);
          }
        } else {
          formData.append(key, productData[key]);
        }
      }

      console.log("📦 FormData entries:");
      for (let [k, v] of formData.entries()) {
        console.log(k, v);
      }
      
      const response = await fetch(
        "http://127.0.0.1:8000/api/products",
        {
          method: "POST",
          body: formData, // No headers for FormData
        }
      );

      const data = await response.json();
      

      if (response.ok) {
        alert("Product saved successfully!");
      } else {
        alert(`Failed to save product: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("❌ API Error:", error);
      alert("An error occurred while saving the product.");
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

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralTab data={productData} updateData={updateProductData} />;
      case "data":
        return (
          <DataTab
            tags={productData.product_tags}
            seasons={productData.seasons}
            fabrics={productData.fabric_types}
            brands={productData.brands}
            updateData={updateProductData}
          />
        );
      case "links":
        return (
          <LinksTab
            categories={productData.categories}
            subcategories={productData.sub_catgegories}
            childcategories={productData.child_catgegories}
            products={productData.products}
            tags={productData.product_tags} // optional
            formData={productData}
            updateData={updateProductData} // ✅ required
          />
        );
      case "images":
        return <ImagesTab data={productData} updateData={updateProductData} />;
      case "variations":
        return (
          <VariationsTab
            colors={productData.product_colors}
            sizes={productData.product_sizes}
            updateData={updateProductData}
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
            className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300"
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
            className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300"
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
    </div>
  );
};

export default ProductManagementForm;

<div>
  <label htmlFor="colorSelect" className="block text-sm font-medium mb-2">
    Select Colors
  </label>
  <select
    id="colorSelect"
    multiple
    className="w-full border rounded p-2"
    value={formData.colors} // 🔥 ADD THIS
    onChange={() => {}} // 🔥 required for React controlled select
  >
    {Object.entries(colors).map(([id, name]) => (
      <option key={id} value={name}>
        {name}
      </option>
    ))}
  </select>

  {formData.colors.length > 0 && (
    <div className="flex flex-wrap gap-2 mt-2">
      {formData.colors.map((color) => (
        <div
          key={color}
          className="flex items-center gap-2 border px-2 py-1 rounded bg-gray-100 dark:bg-gray-800"
        >
          <span
            className={`inline-block w-4 h-4 rounded-full mr-1 ${
              colorPalette[color] || "bg-gray-400"
            }`}
          ></span>
          <span>{color}</span>
          <button
            type="button"
            onClick={() => setDefault("color", color)}
            className={`text-xs px-2 py-0.5 rounded ${
              formData.defaultColor === color
                ? "bg-red-600 text-white"
                : "bg-gray-300 dark:bg-gray-700"
            }`}
          >
            {formData.defaultColor === color ? "Default" : "Make Default"}
          </button>
        </div>
      ))}
    </div>
  )}
</div>;













"use client";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axios from "axios";

export default function ViewProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://127.0.0.1:8000/api/products/${id}`
        );
        setProduct(res.data.data);
       
      } catch (err) {
        setError("Error fetching product");
        console.error("Error fetching product", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // ✅ Updated helper function
  const renderArray1 = (arr) => {
    if (!arr || arr.length === 0) return "—";
    return arr.map((item) => item.name).join(", ");
  };

  // ✅ Fixed this one to support array of objects
  const renderArray = (arr) =>
    Array.isArray(arr) && arr.length > 0
      ? arr.map((item) => item.name).join(", ")
      : "—";

  if (loading) {
    return <div className="text-center py-10 text-gray-400">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!product) {
    return (
      <div className="text-center py-10 text-gray-400">No product found</div>
    );
  }

  return (
    <div className="p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
      >
        <ArrowLeft size={18} /> Back
      </button>

      {/* Product Details */}
      <div className=" dark:bg-transparent shadow-lg  p-6 dark:text-white">
        <h1 className="text-2xl font-bold mb-4">{product.name}</h1>

        <table className="w-full border border-gray-200 dark:border-gray-700">
          <tbody>
            <tr>
              <td className="border px-4 py-2 font-semibold">Slug</td>
              <td className="border px-4 py-2">{product.slug}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">
                Short Description
              </td>
              <td className="border px-4 py-2">
                <div
                  dangerouslySetInnerHTML={{
                    __html: product.short_description,
                  }}
                />
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">Description</td>
              <td className="border px-4 py-2">
                <div
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">Stock</td>
              <td className="border px-4 py-2">{product.stock}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">Weight</td>
              <td className="border px-4 py-2">{product.weight}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">Length</td>
              <td className="border px-4 py-2">{product.length}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">Width</td>
              <td className="border px-4 py-2">{product.width}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">Height</td>
              <td className="border px-4 py-2">{product.height}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">Status</td>
              <td
                className={`border px-4 py-2 ${
                  product.status ? "text-green-600" : "text-red-600"
                }`}
              >
                {product.status ? "Active" : "Inactive"}
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">New</td>
              <td
                className={`border px-4 py-2 ${
                  product.new ? "text-green-600" : "text-red-600"
                }`}
              >
                {product.new ? "Yes" : "No"}
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">Featured</td>
              <td
                className={`border px-4 py-2 ${
                  product.featured ? "text-green-600" : "text-red-600"
                }`}
              >
                {product.featured ? "Yes" : "No"}
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">Top Selling</td>
              <td
                className={`border px-4 py-2 ${
                  product.top_selling ? "text-green-600" : "text-red-600"
                }`}
              >
                {product.top_selling ? "Yes" : "No"}
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">Sale</td>
              <td
                className={`border px-4 py-2 ${
                  product.sale ? "text-green-600" : "text-red-600"
                }`}
              >
                {product.sale ? "Yes" : "No"}
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">Video URL</td>
              <td className="border px-4 py-2">{product.video_url}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">Meta Title</td>
              <td className="border px-4 py-2">{product.meta_title}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">
                Meta Description
              </td>
              <td className="border px-4 py-2">{product.meta_description}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">Meta Keywords</td>
              <td className="border px-4 py-2">{product.meta_keywords}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">SKU</td>
              <td className="border px-4 py-2">{product.sku}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">HSN</td>
              <td className="border px-4 py-2">{product.hsn}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">Cost Price</td>
              <td className="border px-4 py-2">{product.price}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">Selling Price</td>
              <td className="border px-4 py-2">{product.selling_price}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">Discount</td>
              <td className="border px-4 py-2">
                <span>{parseInt(product.discount.name)}</span>%
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">GST</td>
              <td className="border px-4 py-2">
                {product.gst_inclusive ? "Inclusive" : "Exclusive"}
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">Season</td>
              <td className="border px-4 py-2">
                {product.season?.name || "N/A"}
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">Fabric</td>
              <td className="border px-4 py-2">
                {product.fabric?.name || "N/A"}
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">Brand</td>
              <td className="border px-4 py-2">
                {product.brand?.name || "N/A"}
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">Tags</td>
              <td className="border px-4 py-2">
                {Array.isArray(product.tags) && product.tags.length > 0
                  ? product.tags.map((tag) => tag.name).join(", ")
                  : "N/A"}
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">
                Head Categories
              </td>
              <td className="border px-4 py-2">
                {renderArray1(product.head_categories)}
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">
                Parent Categories
              </td>
              <td className="border px-4 py-2">
                {renderArray1(product.parent_categories)}
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">
                Child Categories
              </td>
              <td className="border px-4 py-2">
                {renderArray1(product.child_categories)}
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">
                Related Products
              </td>
              <td className="border px-4 py-2">
                {renderArray(product.related_products)}
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">Variants</td>
              <td className="border px-4 py-2">
                {Array.isArray(product.variants) &&
                product.variants.length > 0 ? (
                  <table className="w-full border border-gray-200 dark:border-gray-700">
                    <thead>
                      <tr>
                        <th className="border px-2 py-1">Size</th>
                        <th className="border px-2 py-1">Color</th>
                        <th className="border px-2 py-1">Stock</th>
                        <th className="border px-2 py-1">Images</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.variants.map((v) => (
                        <tr key={v.id}>
                          <td className="border px-2 py-1">{v.size_id}</td>
                          <td className="border px-2 py-1">{v.color_id}</td>
                          <td className="border px-2 py-1">{v.stock}</td>
                          <td className="border px-4 py-2 flex gap-2 flex-wrap">
                            {v.variant_images &&
                              v.variant_images.map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img.path}
                                  alt={`Image ${idx + 1}`}
                                  className="w-20 h-20 object-cover rounded border"
                                />
                              ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  "—"
                )}
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">Main Image</td>
              <td className="border px-4 py-2">
                {product.default_image && (
                  <img
                    src={product.default_image}
                    alt="Default"
                    className="w-40 h-40 object-cover rounded"
                  />
                )}
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-semibold">
                Additional Images
              </td>
              <td className="border px-4 py-2 flex gap-2 flex-wrap">
                {product.images &&
                  product.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.path_original}
                      alt={`Image ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded border"
                    />
                  ))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}












"use client";

import React, { useState, useEffect, useRef } from "react";
import $ from "jquery";
import "select2";
import "select2/dist/css/select2.min.css";

const ProductVariationTab = ({
  data = {},
  sizes = [],
  colors = [],
  updateData,
  default_size = null,
  default_color = null,
}) => {
  console.log("eiagysufd", sizes, colors);
  const [formData, setFormData] = useState({
    sizes: [],
    colors: [],
    default_size: default_size || "",
    default_color: default_color || "",
  });

  const [tableData, setTableData] = useState({});
  const inputRefs = useRef({});

  // 🆕 Dynamic color code support
  const sampleSizes = Array.isArray(sizes)
    ? sizes
    : Object.entries(sizes).map(([id, label]) => ({
        id: Number(id),
        label,
        name: label,
      }));

  const sampleColors = Array.isArray(colors)
    ? colors.map((c) => ({
        id: c.id,
        name: c.name,
        hexa_code: c.hexa_code,
        hexa_code_2: c.hexa_code_2,
      }))
    : Object.entries(colors).map(([id, c]) => ({
        id: Number(id),
        name: c.name,
        hexa_code: c.hexa_code || "#ccc",
        hexa_code_2: c.hexa_code_2 || "#ccc",
      }));

  const getColorById = (id) =>
    sampleColors.find((c) => String(c.id) === String(id));

  useEffect(() => {
    const ids = ["#sizes", "#colors"];
    ids.forEach((id) => {
      $(id)
        .select2({
          placeholder: "Select options",
          allowClear: true,
          width: "100%",
          theme: "default",
        })
        .on("change", function () {
          const field = $(this).attr("id");
          const selectedValues = $(this).val();
          handleSelectChange(field, selectedValues || []);
        });
    });

    return () => {
      ids.forEach((id) => {
        const $el = $(id);
        if ($el.data("select2")) {
          $el.select2("destroy");
        }
      });
    };
  }, []);

  const buildStructuredData = () => {
    let result = [];

    formData.colors.forEach((color_id) => {
      formData.sizes.forEach((size_id) => {
        const stock = tableData[`${color_id}_${size_id}_qty`] || 0;
        const images = tableData[`${color_id}_image_files`] || [];

        result.push({
          color_id: Number(color_id),
          size_id: Number(size_id),
          stock: Number(stock),
          images,
          status:
            Number(color_id) === Number(formData.default_color) &&
            Number(size_id) === Number(formData.default_size)
              ? 1
              : 0,
        });
      });
    });

    return result;
  };

  useEffect(() => {
    if (updateData) {
      const structuredData = buildStructuredData();
      updateData(structuredData, formData.default_size, formData.default_color);
    }
  }, [formData, tableData]);

  const handleSelectChange = (field, selectedValues) => {
    setFormData((prev) => ({
      ...prev,
      [field]: selectedValues,
      ...(field === "sizes" &&
      !selectedValues.includes(String(prev.default_size))
        ? { default_size: "" }
        : {}),
      ...(field === "colors" &&
      !selectedValues.includes(String(prev.default_color))
        ? { default_color: "" }
        : {}),
    }));
  };

  const setDefault = (field, value) => {
    if (field === "size") {
      setFormData((prev) => ({ ...prev, default_size: value }));
    } else if (field === "color") {
      setFormData((prev) => ({ ...prev, default_color: value }));
    }
  };

  const handleInputChange = (color_id, size_id, stock) => {
    setTableData((prev) => ({
      ...prev,
      [`${color_id}_${size_id}_qty`]: stock,
    }));
  };

  const handleImageChange = (color_id, files) => {
    const newFiles = Array.from(files);
    const previewUrls = newFiles.map((file) => URL.createObjectURL(file));

    setTableData((prev) => ({
      ...prev,
      [`${color_id}_image_files`]: newFiles,
      [`${color_id}_image_previews`]: [
        ...(prev[`${color_id}_image_previews`] || []),
        ...previewUrls,
      ],
    }));
  };

  const handleKeyDown = (e, color_id, size_id) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const colorIndex = formData.colors.indexOf(String(color_id));
      const sizeIndex = formData.sizes.indexOf(String(size_id));
      let nextColorIndex = colorIndex;
      let nextSizeIndex = sizeIndex + 1;
      if (nextSizeIndex >= formData.sizes.length) {
        nextSizeIndex = 0;
        nextColorIndex++;
      }
      if (nextColorIndex < formData.colors.length) {
        const nextColor = formData.colors[nextColorIndex];
        const nextSize = formData.sizes[nextSizeIndex];
        const nextRef = inputRefs.current?.[nextColor]?.[nextSize];
        if (nextRef) nextRef.focus();
      }
    }
  };

  return (
    <div className="max-w-full p-6 dark:bg-transparent text-gray-900 dark:text-white">
      {/* Size Selector */}
      <div className="mb-6">
        <label htmlFor="sizes" className="block text-sm font-medium mb-2">
          Size
        </label>
        <select
          id="sizes"
          multiple
          className="w-full"
          defaultValue={formData.sizes}
        >
          {sampleSizes.map((size) => (
            <option key={size.id} value={size.id}>
              {size.name}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.sizes.map((size_id) => {
            const sizeObj = sampleSizes.find((s) => s.id === Number(size_id));
            if (!sizeObj) return null;
            return (
              <div
                key={size_id}
                className="flex gap-2 items-center bg-gray-100 dark:bg-gray-800 p-2 rounded"
              >
                <span>{sizeObj.label || sizeObj.name}</span>
                <button
                  onClick={() => setDefault("size", sizeObj.id)}
                  className={`text-xs px-2 py-0.5 rounded ${
                    formData.default_size === sizeObj.id
                      ? "bg-red-600 text-white"
                      : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  {formData.default_size === sizeObj.id
                    ? "Default"
                    : "Make Default"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Color Selector */}
      <div className="mb-6">
        <label htmlFor="colors" className="block text-sm font-medium mb-2">
          Color
        </label>
        <select
          id="colors"
          multiple
          className="w-full"
          defaultValue={formData.colors}
        >
          {sampleColors.map((color) => (
            <option key={color.id} value={color.id}>
              {color.name}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.colors.map((color_id) => {
            const color = getColorById(color_id);
            return (
              <div
                key={color_id}
                className="flex gap-2 items-center bg-gray-100 dark:bg-gray-800 p-2 rounded"
              >
                <span
                  className="inline-block w-4 h-4 rounded-full border"
                  style={{
                    background: color.hexa_code_2
                      ? `linear-gradient(135deg, ${color.hexa_code} 50%, ${color.hexa_code_2} 50%)`
                      : color.hexa_code,
                  }}
                ></span>

                <span>{color.name}</span>
                <button
                  onClick={() => setDefault("color", color.id)}
                  className={`text-xs px-2 py-0.5 rounded ${
                    formData.default_color === color.id
                      ? "bg-red-600 text-white"
                      : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  {formData.default_color === color.id
                    ? "Default"
                    : "Make Default"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Matrix Table */}
      {formData.sizes.length > 0 && formData.colors.length > 0 && (
        <div className="overflow-x-auto border rounded shadow-sm">
          <table className="min-w-full table-fixed">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left">Color / Size</th>
                {formData.sizes.map((size_id) => {
                  const sizeObj = sampleSizes.find(
                    (s) => s.id === Number(size_id)
                  );
                  return (
                    <th key={size_id} className="px-3 py-2 text-center">
                      {sizeObj?.name}
                    </th>
                  );
                })}
                <th className="px-3 py-2 text-center">Images</th>
              </tr>
            </thead>
            <tbody>
              {formData.colors.map((color_id) => {
                const color = getColorById(color_id);
                return (
                  <tr key={color_id}>
                    <td className="px-3 py-2 font-medium flex items-center gap-2">
                      <span
                        className="inline-block w-4 h-4 rounded-full border"
                        style={{
                          background: color.hexa_code_2
                            ? `linear-gradient(135deg, ${color.hexa_code} 50%, ${color.hexa_code_2} 50%)`
                            : color.hexa_code,
                        }}
                      ></span>

                      {color.name}
                    </td>

                    {formData.sizes.map((size_id) => {
                      if (!inputRefs.current[color_id])
                        inputRefs.current[color_id] = {};
                      return (
                        <td
                          key={`${color_id}_${size_id}`}
                          className="px-2 py-1"
                        >
                          <input
                            type="number"
                            min={0}
                            className="w-full text-center border rounded"
                            value={
                              tableData[`${color_id}_${size_id}_qty`] || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                color_id,
                                size_id,
                                e.target.value
                              )
                            }
                            onKeyDown={(e) =>
                              handleKeyDown(e, color_id, size_id)
                            }
                            ref={(el) =>
                              (inputRefs.current[color_id][size_id] = el)
                            }
                          />
                        </td>
                      );
                    })}

                    <td className="px-2 py-1 min-w-[250px]">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) =>
                          handleImageChange(color_id, e.target.files)
                        }
                        className="block w-full text-sm"
                      />
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {(tableData[`${color_id}_image_previews`] || []).map(
                          (img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt="preview"
                              className="w-12 h-12 object-cover rounded"
                            />
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductVariationTab;

