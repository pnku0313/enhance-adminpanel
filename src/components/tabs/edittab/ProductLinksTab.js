"use client";

import React, { useEffect, useMemo } from "react";
import $ from "jquery";
import "select2";
import "select2/dist/css/select2.min.css";
import { Layers, Link2 } from "lucide-react";

import { FormSection, Field } from "./formTheme ";

const ProductLinksTab = ({
  categories = [],
  subcategories = [],
  childcategories = [],
  products = [],
  formData,
  updateData,
}) => {
  // -------- Derived Subcategories & Childcategories --------
  // Compare as strings: ids come from the API as numbers, Select2 returns strings.
  const filteredSubcategories = useMemo(() => {
    if (!formData.head_categories?.length) return [];
    const heads = formData.head_categories.map(String);
    return subcategories.filter((sub) => heads.includes(String(sub.product_category_id)));
  }, [formData.head_categories, subcategories]);

  const filteredChildcategories = useMemo(() => {
    if (!formData.parent_categories?.length) return [];
    const parents = formData.parent_categories.map(String);
    return childcategories.filter((child) => parents.includes(String(child.product_subcategory_id)));
  }, [formData.parent_categories, childcategories]);

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
  };

  // -------- Init Select2 (Only once on mount) --------
  useEffect(() => {
    const ids = ["#head_categories", "#parent_categories", "#child_categories", "#related_product"];

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
      ids.forEach((id) => {
        if ($(id).data("select2")) $(id).select2("destroy");
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------- Sync UI with formData --------
  useEffect(() => {
    $("#head_categories").val(formData.head_categories || []).trigger("change.select2");
    $("#parent_categories").val(formData.parent_categories || []).trigger("change.select2");
    $("#child_categories").val(formData.child_categories || []).trigger("change.select2");
    $("#related_product").val(formData.related_product || []).trigger("change.select2");
  }, [formData]);

  const stepBadge = (n) => (
    <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-[10px] font-semibold text-white">
      {n}
    </span>
  );

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <FormSection
        icon={Layers}
        title="Category hierarchy"
        description="Pick a main category first; sub and child categories depend on it"
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <Field label={<>{stepBadge(1)}Main category</>} htmlFor="head_categories">
            <select id="head_categories" multiple className="w-full">
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label={<>{stepBadge(2)}Sub category</>} htmlFor="parent_categories">
            <select id="parent_categories" multiple className="w-full">
              {filteredSubcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label={<>{stepBadge(3)}Child category</>} htmlFor="child_categories">
            <select id="child_categories" multiple className="w-full">
              {filteredChildcategories.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </FormSection>

      <FormSection
        icon={Link2}
        title="Related products"
        description="Products that are related or frequently bought together"
      >
        <Field label="Related products" htmlFor="related_product">
          <select id="related_product" multiple className="w-full">
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </Field>
      </FormSection>
    </form>
  );
};

export default ProductLinksTab;