"use client";

import React, { useEffect, useMemo } from "react";
import $ from "jquery";
import "select2";
import "select2/dist/css/select2.min.css";

const ProductLinksTab = ({
  categories = [],
  subcategories = [],
  childcategories = [],
  tags = {},
  products = [],
  formData,
  updateData,
}) => {
  // -------- Derived Subcategories & Childcategories --------
  const filteredSubcategories = useMemo(() => {
    if (!formData.head_categories?.length) return [];
    return subcategories.filter((sub) =>
      formData.head_categories.includes(String(sub.product_category_id))
    );
  }, [formData.head_categories, subcategories]);

  const filteredChildcategories = useMemo(() => {
    if (!formData.parent_categories?.length) return [];
    return childcategories.filter((child) =>
      formData.parent_categories.includes(String(child.product_subcategory_id))
    );
  }, [formData.parent_categories, childcategories]);

  // -------- Init Select2 (Only once on mount) --------
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

  // -------- Sync UI with formData --------
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

  // -------- Handle changes from Select2 --------
  const handleSelectChange = (field, selectedValues) => {
    updateData(field, selectedValues);

    if (field === "head_categories") {
      updateData("parent_categories", []);
      updateData("child_categories", []);
    }

    if (field === "parent_categories") {
      updateData("child_categories", []);
    }

    console.log("formData updated:", formData);
  };

  // -------- JSX --------
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="dark:bg-transparent shadow-md rounded-lg overflow-hidden">
        <div className="md:p-8 p-4">
          <form>
            <div className="space-y-6">
              {/* Main Category */}
              <div>
                <label
                  htmlFor="head_categories"
                  className="block text-sm font-medium mb-2 dark:text-white"
                >
                  Main Category
                </label>
                <select id="head_categories" multiple className="w-full">
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
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
                <select id="parent_categories" multiple className="w-full">
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
                  htmlFor="child_categories"
                  className="block text-sm font-medium mb-2 dark:text-white"
                >
                  Child Category
                </label>
                <select id="child_categories" multiple className="w-full">
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
                  htmlFor="related_product"
                  className="block text-sm font-medium mb-2 dark:text-white"
                >
                  Related Products
                </label>
                <select id="related_product" multiple className="w-full">
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
