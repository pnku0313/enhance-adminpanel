"use client";
import { useEffect } from "react";
import $ from "jquery";
import "select2";
import "select2/dist/css/select2.min.css";

const DataTab = ({
  tags = [],
  seasons = {},
  fabrics = {},
  brands = {},
  discounts = [],
  formData,
  updateData,
}) => {
  // -------- INIT SELECT2 (runs once) ----------
  useEffect(() => {
    const $tags = $("#tags");
    $tags
      .select2({
        placeholder: "Select options",
        allowClear: true,
        width: "100%",
        theme: "default",
      })
      .on("change", function () {
        const selectedValues = $(this).val() || [];
        updateData("tags", selectedValues);
      });

    return () => {
      $tags.select2("destroy");
    };
  }, []);

  // -------- SYNC formData.tags to select2 ---------
  useEffect(() => {
    const syncTags = () => {
      if (formData.product_tags && Array.isArray(formData.product_tags)) {
        const selectedIds = formData.product_tags.map((t) =>
          typeof t === "object" ? String(t.id) : String(t)
        );
        const $tags = $("#tags");
        if ($tags.length && $tags.hasClass("select2-hidden-accessible")) {
          $tags.val(selectedIds).trigger("change.select2");
        }
      }
    };

    // Small delay to ensure Select2 is fully initialized
    setTimeout(syncTags, 100);
  }, [formData.product_tags, tags]);

  // -------- Auto-calculate selling price --------
  useEffect(() => {
    const cost = Number.parseFloat(formData.cost_price) || 0;
    const selectedDiscount = discounts.find(
      (d) => String(d.id) === String(formData.discount)
    );
    const discountPercent = selectedDiscount
      ? Number.parseFloat(selectedDiscount.amount)
      : 0;

    const discountAmount = (cost * discountPercent) / 100;
    const sellingPrice = cost - discountAmount;

    if (!isNaN(sellingPrice)) {
      const newPrice = sellingPrice.toFixed(2);
      if (formData.selling_price !== newPrice) {
        updateData("selling_price", newPrice);
      }
    }
  }, [formData.cost_price, formData.discount]);

  return (
    <div className="tab-panel text-black dark:text-white">
      {/* SKU + Tags */}
      <div className="row">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">SKU *</label>
            <input
              type="text"
              className="form-control bg-transparent text-black dark:text-white"
              value={formData.sku || ""}
              onChange={(e) => updateData("sku", e.target.value)}
              placeholder="Product SKU"
            />
          </div>
        </div>

        {/* ✅ TAGS Select2 */}
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Tags</label>
            <select id="tags" multiple className="w-full">
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* HSN */}
      <div className="row">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">HSN</label>
            <input
              type="text"
              className="form-control bg-transparent text-black dark:text-white"
              value={formData.hsn || ""}
              onChange={(e) => updateData("hsn", e.target.value)}
              placeholder="Product HSN"
            />
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="pricing-section">
        <h4 className="section-title border-bottom pb-1 dark:text-white dark:border-gray-600">
          Pricing Information
        </h4>
        <div className="row">
          {/* Cost Price */}
          <div className="col-md-3">
            <label className="form-label">Cost Price</label>
            <input
              type="number"
              className="form-control bg-transparent text-black dark:text-white"
              value={formData.cost_price || ""}
              onChange={(e) => updateData("cost_price", e.target.value)}
              placeholder="0.00"
              step="0.01"
            />
          </div>

          {/* Selling Price */}
          <div className="col-md-3">
            <label className="form-label">Selling Price *</label>
            <input
              type="number"
              className="form-control bg-transparent text-black dark:text-white"
              name="selling_price"
              value={formData.selling_price || ""}
              readOnly
              placeholder="0.00"
              step="0.01"
            />
          </div>

          {/* Discount Dropdown */}
          <div className="col-md-3">
            <label className="form-label">Discount</label>
            <select
              className="form-control bg-transparent text-black dark:text-white"
              name="discount"
              value={
                formData.discount
                  ? typeof formData.discount === "object"
                    ? formData.discount.id
                    : formData.discount
                  : ""
              }
              onChange={(e) =>
                updateData(
                  "discount",
                  e.target.value ? Number.parseInt(e.target.value) : ""
                )
              }
            >
              <option value="">-- Select Discount --</option>
              {discounts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.amount}%
                </option>
              ))}
            </select>
          </div>

          {/* GST Type */}
          <div className="col-md-3">
            <label className="form-label">GST</label>
            <select
              value={formData.gst_type || ""}
              onChange={(e) => updateData("gst_type", e.target.value)}
              className="form-control bg-transparent text-black dark:text-white"
            >
              <option value="">Select GST Type</option>
              <option value="include">Include</option>
              <option value="exclude">Exclude</option>
            </select>
          </div>

          {/* GST Fields */}
          {formData.gst_type === "include" && (
            <div className="col-md-3">
              <label className="form-label">GST Include Value</label>
              <input
                type="number"
                value={formData.gst || ""}
                onChange={(e) => updateData("gst", e.target.value)}
                placeholder="Enter GST include value"
                className="form-control bg-transparent text-black dark:text-white"
              />
            </div>
          )}
          {formData.gst_type === "exclude" && (
            <div className="col-md-3">
              <label className="form-label">GST Exclude Value</label>
              <input
                type="number"
                value={formData.gst || ""}
                onChange={(e) => updateData("gst", e.target.value)}
                placeholder="Enter GST exclude value"
                className="form-control bg-transparent text-black dark:text-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Dimensions Section */}
      <div className="dimensions-section mt-4">
        <h4 className="section-title border-bottom pb-1 dark:text-white dark:border-gray-600">
          Dimensions & Weight
        </h4>
        <div className="row">
          {["length", "width", "height", "weight"].map((field, i) => (
            <div className="col-md-3" key={field}>
              <label className="form-label">
                {["Length (cm)", "Width (cm)", "Height (cm)", "Weight"][i]}
              </label>
              <input
                type="number"
                className="form-control bg-transparent text-black dark:text-white"
                value={formData[field] || ""}
                onChange={(e) => updateData(field, e.target.value)}
                placeholder="0"
                step="0.1"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sort Order & Stock */}
      <div className="row mt-4">
        <div className="col-md-6">
          <label className="form-label">Sort Order</label>
          <input
            type="number"
            value={formData.sortOrder || ""}
            onChange={(e) => updateData("sortOrder", e.target.value)}
            placeholder="Enter sort order"
            className="form-control bg-transparent text-black dark:text-white"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Stock</label>
          <input
            type="number"
            value={formData.stock || ""}
            onChange={(e) => updateData("stock", e.target.value)}
            placeholder="Enter stock quantity"
            className="form-control bg-transparent text-black dark:text-white"
          />
          <small className="text-muted">
            Low stock warning at 5 units or less
          </small>
        </div>
      </div>

      {/* Product Info */}
      <div className="product-info-section mt-4">
        <h4 className="section-title border-bottom pb-1 dark:text-white dark:border-gray-600">
          Product Information
        </h4>
        <div className="row">
          {/* Season */}
          <div className="col-md-4">
            <label className="form-label">Season</label>
            <select
              name="season_id"
              className="form-control"
              value={formData.season_id || ""}
              onChange={(e) => updateData("season_id", e.target.value)}
            >
              <option value="">-- Select Season --</option>
              {Object.entries(seasons).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Fabric */}
          <div className="col-md-4">
            <label className="form-label">Fabric</label>
            <select
              name="fabric_id"
              className="form-control"
              value={formData.fabric_id || ""}
              onChange={(e) => updateData("fabric_id", e.target.value)}
            >
              <option value="">-- Select Fabric --</option>
              {Object.entries(fabrics).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div className="col-md-4">
            <label className="form-label">Brand</label>
            <select
              name="brand_id"
              className="form-control"
              value={formData.brand_id || ""}
              onChange={(e) => updateData("brand_id", e.target.value)}
            >
              <option value="">-- Select Brand --</option>
              {Object.entries(brands).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTab;
