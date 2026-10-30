"use client";

import React, { useState, useEffect } from "react";
import $ from "jquery";
import "select2";
import "select2/dist/css/select2.min.css";

const ProductLinksTab = ({
  categories = {},
  subcategories = [],
  childcategories = [],
  tags = {},
  products = {},
}) => {
  const [formData, setFormData] = useState({
    mainCategory: [],
    subCategory: [],
    childCategory: [],
    tags: [],
    relatedProducts: [],
  });

  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [filteredChildcategories, setFilteredChildcategories] = useState([]);

  useEffect(() => {
    const ids = [
      "#mainCategory",
      "#subCategory",
      "#childCategory",
      "#relatedProducts",
      "#tags",
    ];

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
      ids.forEach((id) => $(id).select2("destroy"));
    };
  }, []);

  const reinitializeSelect2 = (selector) => {
    $(selector).select2("destroy");
    $(selector)
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
  };

  const handleSelectChange = (field, selectedValues) => {
    setFormData((prev) => ({
      ...prev,
      [field]: selectedValues,
    }));

    if (field === "mainCategory") {
      const filtered = subcategories.filter((sub) =>
        selectedValues.includes(String(sub.product_category_id))
      );
      setFilteredSubcategories(filtered);
      setFilteredChildcategories([]);
      setFormData((prev) => ({ ...prev, subCategory: [], childCategory: [] }));
      reinitializeSelect2("#subCategory");
      reinitializeSelect2("#childCategory");
    }

    if (field === "subCategory") {
      const filtered = childcategories.filter((child) =>
        selectedValues.includes(String(child.product_subcategory_id))
      );
      setFilteredChildcategories(filtered);
      setFormData((prev) => ({ ...prev, childCategory: [] }));
      reinitializeSelect2("#childCategory");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="dark:bg-transparent shadow-md rounded-lg overflow-hidden">
        <div className="md:p-8 p-4">
          <form>
            <div className="space-y-6">
              {/* Main Category */}
              <div>
                <label
                  htmlFor="mainCategory"
                  className="block text-sm font-medium mb-2 dark:text-white"
                >
                  Main Category
                </label>
                <select id="mainCategory" multiple className="w-full">
                  {Object.entries(categories).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub Category */}
              <div>
                <label
                  htmlFor="subCategory"
                  className="block text-sm font-medium mb-2 dark:text-white"
                >
                  Sub Category
                </label>
                <select id="subCategory" multiple className="w-full">
                  {filteredSubcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Child Category */}
              <div>
                <label
                  htmlFor="childCategory"
                  className="block text-sm font-medium mb-2 dark:text-white"
                >
                  Child Category
                </label>
                <select id="childCategory" multiple className="w-full">
                  {filteredChildcategories.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Related Products */}
              <div>
                <label
                  htmlFor="relatedProducts"
                  className="block text-sm font-medium mb-2 dark:text-white"
                >
                  Related Products
                </label>
                <select id="relatedProducts" multiple className="w-full">
                  {Object.entries(products).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Select products that are related or frequently bought together
                </p>
              </div>

              {/* Tags (if needed in future) */}
              {/* <div>
                <label htmlFor="tags">Tags</label>
                <select id="tags" multiple className="w-full">
                  {Object.entries(tags).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </div> */}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductLinksTab;








"use client";
import { useEffect, useRef } from "react";
import $ from "jquery";
import "popper.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "bootstrap/dist/css/bootstrap.min.css";
import "summernote/dist/summernote-bs4.css";
import "summernote/dist/summernote-bs4.js";

const GeneralTab = ({ data, updateData }) => {
  console.log("data", data);
  const descriptionEditorRef = useRef(null);

  // Initialize Summernote and sync description
  useEffect(() => {
    const $editor = $(descriptionEditorRef.current);

    if (typeof $editor.summernote === "function") {
      $editor.summernote({
        placeholder: "Enter description...",
        tabsize: 2,
        height: 200,
        toolbar: [
          ["style", ["bold", "italic", "underline", "clear"]],
          ["para", ["ul", "ol", "paragraph"]],
          ["insert", ["link", "picture"]],
          ["view", ["codeview"]],
        ],
        callbacks: {
          onChange: function (contents) {
            updateData("description", contents);
          },
          onInit: function () {
            $(".note-editable").css({
              backgroundColor: "transparent",
              color: "#000000",
            });
            // Set initial content
            $editor.summernote("code", data.data.description || "");
          },
          onFocus: function () {
            $(".note-editable").css({
              backgroundColor: "transparent",
              color: "#000000",
            });
          },
        },
      });
    }

    return () => {
      if ($editor.hasClass("summernote")) {
        $editor.summernote("destroy");
      }
    };
  }, [data.data.description, updateData]);

  // Generate slug when name changes
  useEffect(() => {
    if (data.data.name) {
      const generatedSlug = data.data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      if (generatedSlug !== data.data.slug) {
        updateData("slug", generatedSlug);
      }
    } else if (data.data.slug) {
      updateData("slug", "");
    }
  }, [data.data.name, data.data.slug, updateData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateData(name, type === "checkbox" ? checked : value);
  };

  const handleToggle = (name) => {
    updateData(name, !data.data[name]);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <form className="shadow-md rounded-lg p-8 bg-transparent dark:text-white">
        {/* Name and Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-1 dark:text-white"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={data.data.name || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              placeholder="Product name"
              required
            />
          </div>

          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium mb-1 dark:text-white"
            >
              Slug
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={data.data.slug || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              placeholder="Auto-generated slug"
              required
            />
          </div>
        </div>

        {/* Description */}
        {/* <div className="mb-6">
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-1"
          >
            Description
          </label>
          <textarea
            ref={descriptionEditorRef}
            id="description"
            name="description"
            className="hidden"
            defaultValue={data?.data?.description || ""}
          ></textarea>
        </div> */}

        {/* Video URL */}
        <div className="mb-6">
          <label
            htmlFor="video_url"
            className="block text-sm font-medium mb-1 dark:text-white"
          >
            Video URL
          </label>
          <input
            type="url"
            id="video_url"
            name="video_url"
            value={data.data.video_url || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            placeholder="https://example.com/video"
          />
        </div>

        {/* SEO Info */}
        <div className="mb-8 space-y-6">
          <div>
            <label
              htmlFor="meta_title"
              className="block text-sm font-medium mb-1 dark:text-white"
            >
              Meta Title
            </label>
            <input
              type="text"
              id="meta_title"
              name="meta_title"
              value={data.data.meta_title || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              placeholder="Meta title for SEO"
            />
          </div>
          <div>
            <label
              htmlFor="meta_description"
              className="block text-sm font-medium mb-1 dark:text-white"
            >
              Meta Description
            </label>
            <textarea
              id="meta_description"
              name="meta_description"
              value={data.data.meta_description || ""}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              placeholder="Meta description for SEO"
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="meta_keywords"
              className="block text-sm font-medium mb-1 dark:text-white"
            >
              Meta Keywords
            </label>
            <input
              type="text"
              id="meta_keywords"
              name="meta_keywords"
              value={data.data.meta_keywords || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              placeholder="Comma separated keywords"
            />
          </div>
        </div>

        {/* Toggle Buttons */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6 pb-2 border-b dark:text-white dark:border-gray-700">
            Product Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {[
              ["status", "Status"],
              ["new", "New"],
              ["featured", "Featured"],
              ["top_selling", "Top Selling"],
              ["sale", "On Sale"],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center dark:text-white">
                <label className="toggle-button mt-2">
                  <input
                    type="checkbox"
                    name={key}
                    checked={data.data[key] || false}
                    onChange={() => handleToggle(key)}
                  />
                  <span className="slider"></span>
                </label>
                <span className="toggle-label ml-2">
                  {label}: {data.data[key] ? "Yes" : "No"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default GeneralTab;




"use client";

import React, { useState, useEffect } from "react";
import $ from "jquery";
import "select2";
import "select2/dist/css/select2.min.css";

const ProductLinksTab = ({
  categories = [],
  subcategories = [],
  childcategories = [],
  tags = [],
  products = [],
  formData,
  updateData,
}) => {
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [filteredChildcategories, setFilteredChildcategories] = useState([]);

  // -------- INIT SELECT2 (mount par ek bar) ----------
  useEffect(() => {
    const ids = [
      "#head_categories",
      "#parent_categories",
      "#child_categories",
      "#related_product",
      "#tags",
    ];

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
          const selectedValues = $(this).val() || [];
          handleSelectChange(field, selectedValues);
        });
    });

    return () => {
      ids.forEach((id) => $(id).select2("destroy"));
    };
  }, []);

  // -------- Prefill (jab formData change hoga) ----------
  useEffect(() => {
    $("#head_categories")
      .val(formData.head_categories || [])
      .trigger("change.select2");
    $("#parent_categories")
      .val(formData.parent_categories || [])
      .trigger("change.select2");
    $("#child_categories")
      .val(formData.child_categories || [])
      .trigger("change.select2");
    $("#related_product")
      .val(formData.related_product || [])
      .trigger("change.select2");
    $("#tags")
      .val(formData.tags || [])
      .trigger("change.select2");
  }, [formData]);

  // ---------- HANDLE CHANGE ----------
  const handleSelectChange = (field, selectedValues) => {
    updateData(field, selectedValues);

    if (field === "head_categories") {
      const filtered = subcategories.filter((sub) =>
        selectedValues.includes(String(sub.product_category_id))
      );
      setFilteredSubcategories(filtered);
      setFilteredChildcategories([]);
      updateData("parent_categories", []);
      updateData("child_categories", []);
    }

    if (field === "parent_categories") {
      const filtered = childcategories.filter((child) =>
        selectedValues.includes(String(child.product_subcategory_id))
      );
      setFilteredChildcategories(filtered);
      updateData("child_categories", []);
    }
  };

  // ---------- JSX ----------
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="dark:bg-transparent shadow-md rounded-lg overflow-hidden">
        <div className="md:p-8 p-4">
          <form>
            <div className="space-y-6">
              {/* Head / Main Category */}
              <div>
                <label
                  htmlFor="head_categories"
                  className="block text-sm font-medium mb-2 dark:text-white"
                >
                  Main Category
                </label>
                <select
                  id="head_categories"
                  multiple
                  className="w-full"
                  defaultValue={formData.head_categories || []}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={String(category.id)}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub Category */}
              <div>
                <label
                  htmlFor="parent_categories"
                  className="block text-sm font-medium mb-2 dark:text-white"
                >
                  Sub Category
                </label>
                <select
                  id="parent_categories"
                  multiple
                  className="w-full"
                  defaultValue={formData.parent_categories || []}
                >
                  {filteredSubcategories.map((sub) => (
                    <option key={sub.id} value={String(sub.id)}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Child Category */}
              <div>
                <label
                  htmlFor="child_categories"
                  className="block text-sm font-medium mb-2 dark:text-white"
                >
                  Child Category
                </label>
                <select
                  id="child_categories"
                  multiple
                  className="w-full"
                  defaultValue={formData.child_categories || []}
                >
                  {filteredChildcategories.map((child) => (
                    <option key={child.id} value={String(child.id)}>
                      {child.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Related Products */}
              <div>
                <label
                  htmlFor="related_product"
                  className="block text-sm font-medium mb-2 dark:text-white"
                >
                  Related Products
                </label>
                <select
                  id="related_product"
                  multiple
                  className="w-full"
                  defaultValue={formData.related_product || []}
                >
                  {products.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Select products that are related or frequently bought together
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductLinksTab;





"use client";

import React, { useState, useEffect } from "react";
import $ from "jquery";
import "select2";
import "select2/dist/css/select2.min.css";

const ProductLinksTab = ({
  categories = [],
  subcategories = [],
  childcategories = [],
  tags = [],
  products = [],
}) => {
  const [formData, setFormData] = useState({
    mainCategory: [],
    subCategory: [],
    childCategory: [],
    tags: [],
    relatedProducts: [],
  });

  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [filteredChildcategories, setFilteredChildcategories] = useState([]);

  useEffect(() => {
    const ids = [
      "#mainCategory",
      "#subCategory",
      "#childCategory",
      "#relatedProducts",
      "#tags",
    ];

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
      ids.forEach((id) => $(id).select2("destroy"));
    };
  }, []);

  const reinitializeSelect2 = (selector) => {
    $(selector).select2("destroy");
    $(selector)
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
  };

  const handleSelectChange = (field, selectedValues) => {
    setFormData((prev) => ({
      ...prev,
      [field]: selectedValues,
    }));

    if (field === "mainCategory") {
      const filtered = subcategories.filter((sub) =>
        selectedValues.includes(String(sub.product_category_id))
      );
      setFilteredSubcategories(filtered);
      setFilteredChildcategories([]);
      setFormData((prev) => ({ ...prev, subCategory: [], childCategory: [] }));
      reinitializeSelect2("#subCategory");
      reinitializeSelect2("#childCategory");
    }

    if (field === "subCategory") {
      const filtered = childcategories.filter((child) =>
        selectedValues.includes(String(child.product_subcategory_id))
      );
      setFilteredChildcategories(filtered);
      setFormData((prev) => ({ ...prev, childCategory: [] }));
      reinitializeSelect2("#childCategory");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="dark:bg-transparent shadow-md rounded-lg overflow-hidden">
        <div className="md:p-8 p-4">
          <form>
            <div className="space-y-6">
              {/* Main Category */}
              <div>
                <label
                  htmlFor="mainCategory"
                  className="block text-sm font-medium mb-2 dark:text-white"
                >
                  Main Category
                </label>
                <select id="mainCategory" multiple className="w-full">
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub Category */}
              <div>
                <label
                  htmlFor="subCategory"
                  className="block text-sm font-medium mb-2 dark:text-white"
                >
                  Sub Category
                </label>
                <select id="subCategory" multiple className="w-full">
                  {filteredSubcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Child Category */}
              <div>
                <label
                  htmlFor="childCategory"
                  className="block text-sm font-medium mb-2 dark:text-white"
                >
                  Child Category
                </label>
                <select id="childCategory" multiple className="w-full">
                  {filteredChildcategories.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Related Products */}
              <div>
                <label
                  htmlFor="relatedProducts"
                  className="block text-sm font-medium mb-2 dark:text-white"
                >
                  Related Products
                </label>
                <select id="relatedProducts" multiple className="w-full">
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Select products that are related or frequently bought together
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductLinksTab;










// working code link tab 


"use client";

import React, { useState, useEffect, useRef } from "react";
import $ from "jquery";
import "select2";
import "select2/dist/css/select2.min.css";

const ProductLinksTab = ({
  categories = [],
  subcategories = [],
  childcategories = [],
  tags = [],
  products = [],
  formDatas,
}) => {
  const [formData, setFormData] = useState({
    mainCategory: [],
    subCategory: [],
    childCategory: [],
    tags: [],
    relatedProducts: [],
  });

  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [filteredChildcategories, setFilteredChildcategories] = useState([]);
  const select2Initialized = useRef(false);

  const handleSelectChange = (field, selectedValuesRaw) => {
    const selectedValues = selectedValuesRaw || [];

    setFormData((prev) => {
      let updated = { ...prev, [field]: selectedValues };

      if (field === "mainCategory") {
        const filtered = subcategories.filter((sub) =>
          selectedValues.includes(String(sub.product_category_id))
        );
        setFilteredSubcategories(filtered);
        setFilteredChildcategories([]);

        updated.subCategory = [];
        updated.childCategory = [];
      }

      if (field === "subCategory") {
        const filtered = childcategories.filter((child) =>
          selectedValues.includes(String(child.product_subcategory_id))
        );
        setFilteredChildcategories(filtered);

        updated.childCategory = [];
      }

      return updated;
    });
  };

  const initializeSelect2 = () => {
    const ids = [
      "#mainCategory",
      "#subCategory",
      "#childCategory",
      "#relatedProducts",
      "#tags",
    ];

    ids.forEach((id) => {
      $(id)
        .select2({
          placeholder: "Select options",
          allowClear: true,
          width: "100%",
        })
        .on("change", function () {
          const field = $(this).attr("id");
          const selectedValues = $(this).val() || [];
          handleSelectChange(field, selectedValues);
        });
    });

    select2Initialized.current = true;
  };

  const destroySelect2 = () => {
    const ids = [
      "#mainCategory",
      "#subCategory",
      "#childCategory",
      "#relatedProducts",
      "#tags",
    ];

    ids.forEach((id) => {
      if ($(id).data("select2")) {
        $(id).off("change").select2("destroy");
      }
    });

    select2Initialized.current = false;
  };

  useEffect(() => {
    if (!select2Initialized.current) {
      initializeSelect2();
    }

    if (formDatas) {
      const initialFormData = {
        mainCategory: formDatas.head_categories?.map((c) => String(c.id)) || [],
        subCategory:
          formDatas.parent_categories?.map((s) => String(s.id)) || [],
        childCategory:
          formDatas.child_categories?.map((c) => String(c.id)) || [],
        relatedProducts:
          formDatas.related_products?.map((p) => String(p.id)) || [],
        tags: formDatas.tags?.map((t) => String(t.id)) || [],
      };

      const filteredSubs = subcategories.filter((sub) =>
        initialFormData.mainCategory.includes(String(sub.product_category_id))
      );
      setFilteredSubcategories(filteredSubs);

      const filteredChildren = childcategories.filter((child) =>
        initialFormData.subCategory.includes(
          String(child.product_subcategory_id)
        )
      );
      setFilteredChildcategories(filteredChildren);

      setFormData(initialFormData);

      setTimeout(() => {
        Object.entries(initialFormData).forEach(([key, value]) => {
          $(`#${key}`).val(value).trigger("change");
        });
      }, 300);
    }

    return () => {
      destroySelect2();
    };
  }, [formDatas, subcategories, childcategories]);

  // keep select2 values in sync with state
  useEffect(() => {
    Object.entries(formData).forEach(([key, value]) => {
      $(`#${key}`).val(value).trigger("change.select2");
    });
  }, [formData]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="dark:bg-transparent shadow-md rounded-lg overflow-hidden">
        <div className="md:p-8 p-4">
          <form>
            <div className="space-y-6">
              {/* Main Category */}
              <div>
                <label
                  htmlFor="mainCategory"
                  className="block text-sm font-medium mb-2 dark:text-white"
                >
                  Main Category
                </label>
                <select id="mainCategory" multiple className="w-full">
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub Category */}
              <div>
                <label
                  htmlFor="subCategory"
                  className="block text-sm font-medium mb-2 dark:text-white"
                >
                  Sub Category
                </label>
                <select id="subCategory" multiple className="w-full">
                  {filteredSubcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
                {filteredSubcategories.length === 0 &&
                  formData.mainCategory.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      No subcategories found for the selected main categories
                    </p>
                  )}
              </div>

              {/* Child Category */}
              <div>
                <label
                  htmlFor="childCategory"
                  className="block text-sm font-medium mb-2 dark:text-white"
                >
                  Child Category
                </label>
                <select id="childCategory" multiple className="w-full">
                  {filteredChildcategories.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </select>
                {filteredChildcategories.length === 0 &&
                  formData.subCategory.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      No child categories found for the selected subcategories
                    </p>
                  )}
              </div>

              {/* Tags */}
              {/* Tags */}
              <div>
                <label
                  htmlFor="tags"
                  className="block text-sm font-medium mb-2 dark:text-white"
                >
                  Tags
                </label>
                <select id="tags" multiple className="w-full">
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Related Products (optional) */}
              {/* <div>
                <label
                  htmlFor="relatedProducts"
                  className="block text-sm font-medium mb-2 dark:text-white"
                >
                  Related Products
                </label>
                <select id="relatedProducts" multiple className="w-full">
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div> */}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductLinksTab;
