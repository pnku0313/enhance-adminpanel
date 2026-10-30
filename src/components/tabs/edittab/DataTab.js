"use client";
import React, { useState, useEffect } from "react";
import $ from "jquery";
import "select2";
import "select2/dist/css/select2.min.css";
import { Tag, IndianRupee, Ruler, Boxes, Layers } from "lucide-react";

import { FormSection, Field, inputCls, selectCls } from "./formTheme ";

const DataTab = ({
  tags = [],
  seasons = {},
  fabrics = {},
  brands = {},
  discounts = [],
  formData,
  updateData,
}) => {
  const [gstType, setGstType] = useState(formData.gst_type || formData.gstType || "");
  const [gstIncludeValue, setGstIncludeValue] = useState(formData.gstIncludeValue || formData.gst || "");
  const [gstExcludeValue, setGstExcludeValue] = useState(formData.gstExcludeValue || formData.gst || "");
  const [stock, setStock] = useState(formData.stock || "");
  const [sortOrder, setSortOrder] = useState(formData.sortOrder || "");

  // -------- INIT SELECT2 (runs once) ----------
  useEffect(() => {
    const ids = ["#tags"];
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
          updateData(field, selectedValues);
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------- SYNC formData to select2 ---------
  useEffect(() => {
    $("#tags")
      .val(formData.tags || [])
      .trigger("change.select2");
  }, [formData.tags]);

  // -------- Auto-calculate selling price based on discount_id --------
  useEffect(() => {
    const cost = parseFloat(formData.cost_price) || 0;
    const selectedDiscount = discounts.find(
      (d) => d.id.toString() === formData.discount_id?.toString()
    );
    const discountPercent = selectedDiscount ? parseFloat(selectedDiscount.amount) : 0;

    const discountAmount = (cost * discountPercent) / 100;
    const sellingPrice = cost - discountAmount;
    updateData("selling_price", sellingPrice.toFixed(2));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.cost_price, formData.discount_id]);

  const dimensionFields = [
    ["length", "Length (cm)"],
    ["width", "Width (cm)"],
    ["height", "Height (cm)"],
    ["weight", "Weight"],
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        {/* IDENTIFICATION */}
        <FormSection icon={Tag} title="Identification" description="SKU, HSN and tags">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="SKU" htmlFor="sku" required>
              <input
                id="sku"
                type="text"
                className={inputCls}
                value={formData.sku || ""}
                onChange={(e) => updateData("sku", e.target.value)}
                placeholder="Product SKU"
              />
            </Field>
            <Field label="HSN" htmlFor="hsn">
              <input
                id="hsn"
                type="text"
                className={inputCls}
                value={formData.hsn || ""}
                onChange={(e) => updateData("hsn", e.target.value)}
                placeholder="Product HSN"
              />
            </Field>
            <Field label="Tags" htmlFor="tags" className="md:col-span-2">
              <select id="tags" multiple className="w-full">
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </FormSection>

        {/* PRICING */}
        <FormSection icon={IndianRupee} title="Pricing information" description="Cost, discount and GST">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Cost price" htmlFor="cost_price">
              <input
                id="cost_price"
                type="number"
                className={inputCls}
                value={formData.cost_price || ""}
                onChange={(e) => updateData("cost_price", e.target.value)}
                placeholder="0.00"
                step="0.01"
              />
            </Field>

            <Field label="Selling price" htmlFor="selling_price" required>
              <input
                id="selling_price"
                type="number"
                className={inputCls}
                value={formData.selling_price || ""}
                readOnly
                placeholder="0.00"
                step="0.01"
              />
            </Field>

            <Field label="Discount" htmlFor="discount_id">
              <select
                id="discount_id"
                className={selectCls}
                value={formData.discount_id || ""}
                onChange={(e) => {
                  updateData("discount_id", e.target.value);
                  updateData("discount", e.target.value);
                }}
              >
                <option value="">Select discount</option>
                {discounts.map((d) => (
                  <option key={d.id} value={d.id} className="text-slate-900">
                    {d.amount}%
                  </option>
                ))}
              </select>
            </Field>

            <Field label="GST" htmlFor="gst_type">
              <select
                id="gst_type"
                value={gstType}
                onChange={(e) => {
                  setGstType(e.target.value);
                  updateData("gst_type", e.target.value);
                }}
                className={selectCls}
              >
                <option value="">Select GST type</option>
                <option value="include" className="text-slate-900">Include</option>
                <option value="exclude" className="text-slate-900">Exclude</option>
              </select>
            </Field>

            {gstType === "include" && (
              <Field label="GST include value" htmlFor="gst_include">
                <input
                  id="gst_include"
                  type="number"
                  value={gstIncludeValue}
                  onChange={(e) => {
                    setGstIncludeValue(e.target.value);
                    updateData("gst", e.target.value);
                  }}
                  placeholder="Enter GST include value"
                  className={inputCls}
                />
              </Field>
            )}
            {gstType === "exclude" && (
              <Field label="GST exclude value" htmlFor="gst_exclude">
                <input
                  id="gst_exclude"
                  type="number"
                  value={gstExcludeValue}
                  onChange={(e) => {
                    setGstExcludeValue(e.target.value);
                    updateData("gst", e.target.value);
                    updateData("gstExcludeValue", e.target.value);
                  }}
                  placeholder="Enter GST exclude value"
                  className={inputCls}
                />
              </Field>
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Selling price is calculated automatically from the cost price and the selected discount.
          </p>
        </FormSection>

        {/* DIMENSIONS */}
        <FormSection icon={Ruler} title="Dimensions & weight">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {dimensionFields.map(([field, label]) => (
              <Field key={field} label={label} htmlFor={field}>
                <input
                  id={field}
                  type="number"
                  className={inputCls}
                  value={formData[field] || ""}
                  onChange={(e) => updateData(field, e.target.value)}
                  placeholder="0"
                  step="0.1"
                />
              </Field>
            ))}
          </div>
        </FormSection>
      </div>

      <div className="space-y-6">
        {/* INVENTORY */}
        <FormSection icon={Boxes} title="Inventory">
          <div className="space-y-5">
            <Field label="Sort order" htmlFor="sort_order">
              <input
                id="sort_order"
                type="number"
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  updateData("sortOrder", e.target.value);
                }}
                placeholder="Enter sort order"
                className={inputCls}
              />
            </Field>
            <Field label="Stock" htmlFor="stock" hint="Low stock warning at 5 units or less">
              <input
                id="stock"
                type="number"
                value={stock}
                onChange={(e) => {
                  setStock(e.target.value);
                  updateData("stock", e.target.value);
                }}
                placeholder="Enter stock quantity"
                className={inputCls}
              />
            </Field>
          </div>
        </FormSection>

        {/* PRODUCT INFO */}
        <FormSection icon={Layers} title="Product information">
          <div className="space-y-5">
            <Field label="Season" htmlFor="season_id">
              <select
                id="season_id"
                className={selectCls}
                value={formData.season_id || ""}
                onChange={(e) => updateData("season_id", e.target.value)}
              >
                <option value="">-- Select option --</option>
                {Object.entries(seasons).map(([id, name]) => (
                  <option key={id} value={id} className="text-slate-900">
                    {name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Fabric" htmlFor="fabric_id">
              <select
                id="fabric_id"
                className={selectCls}
                value={formData.fabric_id || ""}
                onChange={(e) => updateData("fabric_id", e.target.value)}
              >
                <option value="">-- Select option --</option>
                {Object.entries(fabrics).map(([id, name]) => (
                  <option key={id} value={id} className="text-slate-900">
                    {name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Brand" htmlFor="brand_id">
              <select
                id="brand_id"
                className={selectCls}
                value={formData.brand_id || ""}
                onChange={(e) => updateData("brand_id", e.target.value)}
              >
                <option value="">-- Select option --</option>
                {Object.entries(brands).map(([id, name]) => (
                  <option key={id} value={id} className="text-slate-900">
                    {name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </FormSection>
      </div>
    </div>
  );
};

export default DataTab;