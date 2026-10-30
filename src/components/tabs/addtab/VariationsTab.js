"use client";

import { useEffect } from "react";
import $ from "jquery";
import "select2";
import "select2/dist/css/select2.min.css";
import { clsx } from "clsx";
import { Ruler, Palette, LayoutGrid, ImagePlus } from "lucide-react";

import { FormSection, Field, inputCls, hairline, glassSubtle, FORM_CSS } from "./formTheme";

const ProductVariationTab = ({
  sizes = [],
  colors = [],
  formData,
  setFormData,
  tableData,
  setTableData,
  updateData,
}) => {
  const selectedSizes = formData.sizes || [];
  const selectedColors = formData.colors || [];

  // Convert sizes/colors to proper arrays
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
        hexa_code: c.hexa_code || "#ccc",
        hexa_code_2: c.hexa_code_2 || "#ccc",
      }))
    : Object.entries(colors).map(([id, c]) => ({
        id: Number(id),
        name: c.name,
        hexa_code: c.hexa_code || "#ccc",
        hexa_code_2: c.hexa_code_2 || "#ccc",
      }));

  const getColorById = (id) => sampleColors.find((c) => c.id === Number(id));

  const swatchStyle = (color) => ({
    background: color.hexa_code_2
      ? `linear-gradient(135deg, ${color.hexa_code} 50%, ${color.hexa_code_2} 50%)`
      : color.hexa_code,
  });

  const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, idx) => val === sortedB[idx]);
  };

  const handleSelectChange = (field, selectedValues) => {
    const numericValues = selectedValues.map((v) => Number(v));

    setFormData((prev) => ({
      ...prev,
      [field]: numericValues,
      ...(field === "sizes" && !numericValues.includes(Number(prev.default_size))
        ? { default_size: "" }
        : {}),
      ...(field === "colors" && !numericValues.includes(Number(prev.default_color))
        ? { default_color: "" }
        : {}),
    }));
  };

  useEffect(() => {
    const selectors = ["#sizes", "#colors"];

    selectors.forEach((selector) => {
      const $el = $(selector);
      $el.select2({
        placeholder: "Select options",
        allowClear: true,
        width: "100%",
      });

      $el.on("change", function () {
        const field = $(this).attr("id");
        const values = $(this).val() || [];
        const numericValues = values.map((v) => Number(v));

        if (!arraysEqual(numericValues, formData[field] || [])) {
          handleSelectChange(field, numericValues);
        }
      });
    });

    return () => {
      selectors.forEach((selector) => {
        const $el = $(selector);
        if ($el.data("select2")) {
          $el.select2("destroy");
          $el.off("change");
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  useEffect(() => {
    const selectors = ["#sizes", "#colors"];
    selectors.forEach((selector) => {
      const $el = $(selector);
      const field = selector.slice(1);

      const stringValues = (formData[field] || []).map(String);
      if (!arraysEqual($el.val() || [], stringValues)) {
        $el.off("change");
        $el.val(stringValues).trigger("change.select2");
        $el.on("change", function () {
          const values = ($(this).val() || []).map(Number);
          handleSelectChange(field, values);
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.sizes, formData.colors]);

  // Build structured data for saving (real File objects for images)
  const buildStructuredData = () => {
    const result = [];

    selectedColors.forEach((color_id) => {
      selectedSizes.forEach((size_id) => {
        const stock = tableData[`${color_id}_${size_id}_qty`] || 0;
        const imageFiles = tableData[`${color_id}_image_files`] || [];

        result.push({
          color_id: Number(color_id),
          size_id: Number(size_id),
          stock: Number(stock),
          default_image: imageFiles.length > 0 ? imageFiles[0] : null,
          images: imageFiles,
        });
      });
    });

    return result;
  };

  // Report to the parent whenever the selection / stock / images change
  useEffect(() => {
    if (updateData) {
      const structuredData = buildStructuredData();
      const color_ids = selectedColors.map((id) => Number(id));
      const size_ids = selectedSizes.map((id) => Number(id));

      updateData(
        structuredData,
        Number(formData.default_size),
        Number(formData.default_color),
        color_ids,
        size_ids
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.sizes, formData.colors, formData.default_size, formData.default_color, tableData]);

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

  // Store both Files & Preview URLs
  const handleImageChange = (color_id, files) => {
    const newFiles = Array.from(files);
    const previews = newFiles.map((file) => URL.createObjectURL(file));

    setTableData((prev) => ({
      ...prev,
      [`${color_id}_image_files`]: [...(prev[`${color_id}_image_files`] || []), ...newFiles],
      [`${color_id}_image_previews`]: [...(prev[`${color_id}_image_previews`] || []), ...previews],
    }));
  };

  const defaultBtn = (isDefault) =>
    clsx(
      "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
      isDefault
        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm"
        : "bg-slate-200 text-muted-foreground hover:bg-primary/10 hover:text-primary dark:bg-white/10"
    );

  const chipCls = clsx("flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm", glassSubtle);
  const thCls = "px-3 py-3 font-medium text-foreground";

  return (
    <div className="pp-form pp-view">
      <style>{FORM_CSS}</style>
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* SIZES */}
          <FormSection icon={Ruler} title="Sizes" description="Choose sizes and mark one as default">
            <Field label="Size" htmlFor="sizes">
              <select id="sizes" multiple>
                {sampleSizes.map((size) => (
                  <option key={size.id} value={size.id}>
                    {size.name || size.label}
                  </option>
                ))}
              </select>
            </Field>

            {selectedSizes.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedSizes.map((size_id) => {
                  const sizeObj = sampleSizes.find((s) => s.id === Number(size_id));
                  if (!sizeObj) return null;
                  const isDefault = formData.default_size === sizeObj.id;
                  return (
                    <div key={size_id} className={chipCls}>
                      <span className="font-medium text-foreground">{sizeObj.label || sizeObj.name}</span>
                      <button type="button" onClick={() => setDefault("size", sizeObj.id)} className={defaultBtn(isDefault)}>
                        {isDefault ? "Default" : "Make default"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </FormSection>

          {/* COLORS */}
          <FormSection icon={Palette} title="Colors" description="Choose colors and mark one as default">
            <Field label="Color" htmlFor="colors">
              <select id="colors" multiple>
                {sampleColors.map((color) => (
                  <option key={color.id} value={color.id}>
                    {color.name}
                  </option>
                ))}
              </select>
            </Field>

            {selectedColors.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedColors.map((color_id) => {
                  const color = getColorById(color_id);
                  if (!color) return null;
                  const isDefault = formData.default_color === color.id;
                  return (
                    <div key={color_id} className={chipCls}>
                      <span
                        className="inline-block h-4 w-4 rounded-full border border-border"
                        style={swatchStyle(color)}
                      />
                      <span className="font-medium text-foreground">{color.name}</span>
                      <button type="button" onClick={() => setDefault("color", color.id)} className={defaultBtn(isDefault)}>
                        {isDefault ? "Default" : "Make default"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </FormSection>
        </div>

        {/* MATRIX */}
        {selectedSizes.length > 0 && selectedColors.length > 0 && (
          <FormSection
            icon={LayoutGrid}
            title="Stock & images"
            description="Enter stock for every color / size and upload images per color"
          >
            <div className={clsx("overflow-x-auto rounded-xl border", hairline)}>
              <table className="min-w-full text-sm">
                <thead className="bg-white/30 dark:bg-white/10">
                  <tr className="divide-x divide-slate-300/70 border-b border-slate-300/80 text-left dark:divide-white/20 dark:border-white/20">
                    <th className={thCls}>Color / Size</th>
                    {selectedSizes.map((size_id) => {
                      const sizeObj = sampleSizes.find((s) => s.id === Number(size_id));
                      return (
                        <th key={size_id} className={clsx(thCls, "text-center")}>
                          {sizeObj?.name}
                        </th>
                      );
                    })}
                    <th className={clsx(thCls, "text-center")}>Images</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedColors.map((color_id) => {
                    const color = getColorById(color_id);
                    if (!color) return null;
                    const previews = tableData[`${color_id}_image_previews`] || [];
                    return (
                      <tr
                        key={color_id}
                        className="divide-x divide-slate-300/70 border-b border-slate-300/80 last:border-b-0 dark:divide-white/20 dark:border-white/20"
                      >
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2 font-medium text-foreground">
                            <span
                              className="inline-block h-5 w-5 shrink-0 rounded-full border border-border"
                              style={swatchStyle(color)}
                            />
                            {color.name}
                          </div>
                        </td>

                        {selectedSizes.map((size_id) => (
                          <td key={`${color_id}_${size_id}`} className="px-2 py-2">
                            <input
                              type="number"
                              min={0}
                              className={clsx(inputCls, "text-center")}
                              value={tableData[`${color_id}_${size_id}_qty`] || ""}
                              onChange={(e) => handleInputChange(color_id, size_id, e.target.value)}
                              placeholder="0"
                            />
                          </td>
                        ))}

                        <td className="min-w-[260px] px-3 py-2">
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300/80 bg-white/60 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary dark:border-white/20 dark:bg-white/10">
                            <ImagePlus size={14} />
                            Add images
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => {
                                handleImageChange(color_id, e.target.files);
                                e.target.value = "";
                              }}
                              className="sr-only"
                            />
                          </label>
                          {previews.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {previews.map((img, i) => (
                                <img
                                  key={i}
                                  src={img || "/placeholder.svg"}
                                  alt="preview"
                                  className="h-12 w-12 rounded-lg border border-border object-cover"
                                />
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </FormSection>
        )}
      </div>
    </div>
  );
};

export default ProductVariationTab;