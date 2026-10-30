"use client";

import { useEffect, useState } from "react";

const ProductVariationTab = ({
  sizes = [],
  colors = [],
  formData = {},
  setFormData,
  tableData = {},
  setTableData,
  updateData,
}) => {
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);

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

  const getColorById = (id) =>
    sampleColors.find((c) => String(c.id) === String(id));

  // ✅ set default size/color
  const setDefault = (field, value) => {
    if (field === "size") {
      setFormData((prev) => ({ ...prev, default_size: value }));
    } else if (field === "color") {
      setFormData((prev) => ({ ...prev, default_color: value }));
    }
  };

  useEffect(() => {
    const loadLibraries = async () => {
      if (!window.jQuery) {
        const jqueryScript = document.createElement("script");
        jqueryScript.src = "https://code.jquery.com/jquery-3.6.0.min.js";
        jqueryScript.onload = () => {
          const select2Script = document.createElement("script");
          select2Script.src =
            "https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js";
          document.head.appendChild(select2Script);

          const select2CSS = document.createElement("link");
          select2CSS.rel = "stylesheet";
          select2CSS.href =
            "https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css";
          document.head.appendChild(select2CSS);
        };
        document.head.appendChild(jqueryScript);
      }
    };

    loadLibraries();
  }, []);

  useEffect(() => {
    const initializeSelect2 = () => {
      if (window.jQuery && window.jQuery.fn.select2) {
        const $ = window.jQuery;

        const $sizeSelect = $("#size-select");
        if (
          $sizeSelect.length &&
          !$sizeSelect.hasClass("select2-hidden-accessible")
        ) {
          $sizeSelect
            .select2({
              placeholder: "Select sizes",
              allowClear: true,
              width: "100%",
            })
            .on("change", function () {
              const selectedValues = $(this).val() || [];
              setSelectedSizes(selectedValues);
              setFormData((prev) => ({
                ...prev,
                size_ids: selectedValues.map(Number),
              }));
            });
        }

        const $colorSelect = $("#color-select");
        if (
          $colorSelect.length &&
          !$colorSelect.hasClass("select2-hidden-accessible")
        ) {
          $colorSelect
            .select2({
              placeholder: "Select colors",
              allowClear: true,
              width: "100%",
              templateResult: (option) => {
                if (!option.id) return option.text;
                const color = sampleColors.find(
                  (c) => String(c.id) === String(option.id)
                );
                if (color) {
                  return $(
                    `<span><span style="display:inline-block;width:16px;height:16px;border:1px solid #ccc;margin-right:8px;border-radius:2px;background:${
                      color.hexa_code_2
                        ? `linear-gradient(135deg, ${color.hexa_code} 50%, ${color.hexa_code_2} 50%)`
                        : color.hexa_code
                    };"></span>${option.text}</span>`
                  );
                }
                return option.text;
              },
              templateSelection: (option) => {
                if (!option.id) return option.text;
                const color = sampleColors.find(
                  (c) => String(c.id) === String(option.id)
                );
                if (color) {
                  return $(
                    `<span><span style="display:inline-block;width:16px;height:16px;border:1px solid #ccc;margin-right:8px;border-radius:2px;background:${
                      color.hexa_code_2
                        ? `linear-gradient(135deg, ${color.hexa_code} 50%, ${color.hexa_code_2} 50%)`
                        : color.hexa_code
                    };"></span>${option.text}</span>`
                  );
                }
                return option.text;
              },
            })
            .on("change", function () {
              const selectedValues = $(this).val() || [];
              setSelectedColors(selectedValues);
              setFormData((prev) => ({
                ...prev,
                color_ids: selectedValues.map(Number),
              }));
            });
        }

        if (formData?.size_ids?.length) {
          const sizeValues = formData.size_ids.map(String);
          $sizeSelect.val(sizeValues).trigger("change.select2");
          setSelectedSizes(sizeValues);
        }

        if (formData?.color_ids?.length) {
          const colorValues = formData.color_ids.map(String);
          $colorSelect.val(colorValues).trigger("change.select2");
          setSelectedColors(colorValues);
        }
      }
    };

    const checkLibraries = setInterval(() => {
      if (window.jQuery && window.jQuery.fn.select2) {
        clearInterval(checkLibraries);
        setTimeout(initializeSelect2, 100);
      }
    }, 100);

    return () => clearInterval(checkLibraries);
  }, [formData?.size_ids, formData?.color_ids, sampleSizes, sampleColors]);

  const buildStructuredData = () => {
    const result = [];
    selectedColors.forEach((color_id) => {
      selectedSizes.forEach((size_id) => {
        const stock = tableData[`${color_id}_${size_id}_qty`] || 0;
        const imageFiles = tableData[`${color_id}_image_files`] || [];
        const imagePreviews = tableData[`${color_id}_image_previews`] || [];

        const variant = {
          color_id: Number(color_id),
          size_id: Number(size_id),
          stock: Number(stock),
          default_image: imagePreviews.length > 0 ? imagePreviews[0] : null,
          images: imagePreviews,
          image_files: imageFiles,
        };

        result.push(variant);
      });
    });

    if (setFormData) {
      setFormData((prev) => ({
        ...prev,
        variants: result,
        default_color: prev.default_color || "",
        default_size: prev.default_size || "",
      }));
    }

    return result;
  };

  const handleInputChange = (color_id, size_id, stock) => {
    setTableData((prev) => {
      const newTable = { ...prev, [`${color_id}_${size_id}_qty`]: stock };
      setTimeout(() => {
        const structuredData = buildStructuredData();
        if (updateData) updateData("variants", structuredData);
      }, 0);
      return newTable;
    });
  };

  const handleImageChange = async (color_id, files) => {
    const newFiles = Array.from(files);
    const previewUrls = await Promise.all(
      newFiles.map((file) => fileToBase64(file))
    );

    setTableData((prev) => {
      const existingPreviews = prev[`${color_id}_image_previews`] || [];
      const newTable = {
        ...prev,
        [`${color_id}_image_previews`]: [...existingPreviews, ...previewUrls],
      };
      setTimeout(() => {
        const structuredData = buildStructuredData();
        if (updateData) updateData("variants", structuredData);
      }, 0);
      return newTable;
    });
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (color_id, imageIndex) => {
    setTableData((prev) => {
      const existingPreviews = prev[`${color_id}_image_previews`] || [];
      const existingFiles = prev[`${color_id}_image_files`] || [];

      const newPreviews = existingPreviews.filter(
        (_, index) => index !== imageIndex
      );
      const newFiles = existingFiles.filter((_, index) => index !== imageIndex);

      const newTable = {
        ...prev,
        [`${color_id}_image_files`]: newFiles,
        [`${color_id}_image_previews`]: newPreviews,
      };

      setTimeout(() => {
        const structuredData = buildStructuredData();
        if (updateData) updateData("variants", structuredData);
      }, 0);

      return newTable;
    });
  };

  useEffect(() => {
    if (selectedSizes.length > 0 && selectedColors.length > 0) {
      const structuredData = buildStructuredData();
      if (updateData) updateData("variants", structuredData);
    }
  }, [selectedSizes, selectedColors]);

  return (
    <div className="p-6">
      {/* Size Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Size</label>
        <select id="size-select" multiple className="w-full">
          {sampleSizes.map((size) => (
            <option key={size.id} value={size.id}>
              {size.name || size.label}
            </option>
          ))}
        </select>

        {/* ✅ Default Size Selector */}
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedSizes.map((size_id) => {
            const sizeObj = sampleSizes.find((s) => s.id === Number(size_id));
            if (!sizeObj) return null;
            return (
              <div
                key={size_id}
                className="flex gap-2 items-center bg-gray-100 p-2 rounded"
              >
                <span>{sizeObj.name || sizeObj.label}</span>
                <button
                  onClick={() => setDefault("size", Number(size_id))}
                  className={`text-xs px-2 py-0.5 rounded ${
                    formData.default_size === Number(size_id)
                      ? "bg-red-600 text-white"
                      : "bg-gray-300"
                  }`}
                >
                  {formData.default_size === Number(size_id)
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
        <label className="block text-sm font-medium mb-2">Color</label>
        <select id="color-select" multiple className="w-full">
          {sampleColors.map((color) => (
            <option key={color.id} value={color.id}>
              {color.name}
            </option>
          ))}
        </select>

        {/* ✅ Default Color Selector */}
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedColors.map((color_id) => {
            const color = getColorById(color_id);
            if (!color) return null;
            return (
              <div
                key={color_id}
                className="flex gap-2 items-center bg-gray-100 p-2 rounded"
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
                  onClick={() => setDefault("color", Number(color_id))}
                  className={`text-xs px-2 py-0.5 rounded ${
                    formData.default_color === Number(color_id)
                      ? "bg-red-600 text-white"
                      : "bg-gray-300"
                  }`}
                >
                  {formData.default_color === Number(color_id)
                    ? "Default"
                    : "Make Default"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Variations Matrix */}
      {selectedSizes.length > 0 && selectedColors.length > 0 && (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="border-b px-4 py-2 text-left font-medium">
                  Color / Size
                </th>
                {selectedSizes.map((s) => {
                  const sizeObj = sampleSizes.find((sz) => sz.id === Number(s));
                  return (
                    <th
                      key={s}
                      className="border-b px-4 py-2 text-center font-medium"
                    >
                      {sizeObj?.name}
                    </th>
                  );
                })}
                <th className="border-b px-4 py-2 text-left font-medium">
                  Images
                </th>
              </tr>
            </thead>
            <tbody>
              {selectedColors.map((c) => {
                const color = getColorById(c);
                return (
                  <tr key={c} className="hover:bg-gray-50">
                    <td className="border-b px-4 py-2 font-medium">
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-4 h-4 rounded border"
                          style={{
                            background: color.hexa_code_2
                              ? `linear-gradient(135deg, ${color.hexa_code} 50%, ${color.hexa_code_2} 50%)`
                              : color.hexa_code,
                          }}
                        ></span>
                        <span>{color?.name}</span>
                      </div>
                    </td>
                    {selectedSizes.map((s) => (
                      <td key={`${c}_${s}`} className="border-b px-4 py-2">
                        <input
                          type="number"
                          value={tableData[`${c}_${s}_qty`] || ""}
                          onChange={(e) =>
                            handleInputChange(c, s, e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full text-center"
                          placeholder="0"
                          min="0"
                        />
                      </td>
                    ))}
                    <td className="border-b px-4 py-2">
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleImageChange(c, e.target.files)}
                        className="text-xs mb-2"
                        accept="image/*"
                      />
                      <div className="flex gap-2 flex-wrap">
                        {(tableData[`${c}_image_previews`] || []).map(
                          (img, i) => (
                            <div key={i} className="relative">
                              <img
                                src={img || "/placeholder.svg"}
                                alt=""
                                className="w-12 h-12 object-cover rounded border"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(c, i)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
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
