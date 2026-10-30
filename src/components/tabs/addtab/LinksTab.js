"use client";

import React, { useEffect, useMemo } from "react";
import $ from "jquery";
import "select2";
import "select2/dist/css/select2.min.css";
import { Link2, Tag, Package } from "lucide-react";

import { FormSection, Field, FORM_CSS } from "./formTheme";

const LinksTab = ({
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
  };

  // -------- JSX --------
  return (
    <div className="pp-form pp-view">
      <style>{FORM_CSS}</style>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* MAIN CATEGORY */}
        <FormSection icon={Package} title="Main Category" description="Select the top-level category">
          <Field label="Head Categories" htmlFor="head_categories">
            <select id="head_categories" multiple className="w-full">
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
        </FormSection>

        {/* SUB CATEGORY */}
        <FormSection icon={Package} title="Sub Category" description="Select sub-categories (depends on main category)">
          <Field label="Parent Categories" htmlFor="parent_categories">
            <select id="parent_categories" multiple className="w-full">
              {filteredSubcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </Field>
        </FormSection>

        {/* CHILD CATEGORY */}
        <FormSection icon={Package} title="Child Category" description="Select child categories (depends on sub-category)">
          <Field label="Child Categories" htmlFor="child_categories">
            <select id="child_categories" multiple className="w-full">
              {filteredChildcategories.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          </Field>
        </FormSection>

        {/* RELATED PRODUCTS */}
        <FormSection icon={Link2} title="Related Products" description="Products that are related or frequently bought together">
          <Field label="Related Products" htmlFor="related_product">
            <select id="related_product" multiple className="w-full">
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Select products that are related or frequently bought together
            </p>
          </Field>
        </FormSection>

        {/* TAGS */}
        <FormSection icon={Tag} title="Additional Tags" description="Additional tags for filtering and search">
          <Field label="Tags" htmlFor="tags" className="lg:col-span-2">
            <select id="tags" multiple className="w-full">
              {Object.entries(tags).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </Field>
        </FormSection>
      </div>
    </div>
  );
};

export default LinksTab;