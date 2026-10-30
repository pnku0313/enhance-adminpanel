"use client";
import React, { useState } from "react";
import { clsx } from "clsx";
import { UploadCloud, X, Image as ImageIcon, Images } from "lucide-react";

import { FormSection, hairline, glassSubtle } from "./formTheme ";

// Existing images come from the API as objects ({ id, path_original }) or URLs
const toUrl = (x) => (typeof x === "string" ? x : x?.path_original || x?.path || "");

const ImagesTab = ({ data = {}, updateData }) => {
  const [formData, setFormData] = useState({
    default_image: data.default_image || null, // file or url
    images: Array.isArray(data.images) ? data.images : [], // files or existing image objects
  });

  const [previews, setPreviews] = useState({
    default_image: toUrl(data.default_image),
    images: Array.isArray(data.images) ? data.images.map(toUrl) : [],
  });

  const [dragZone, setDragZone] = useState(null); // "main" | "extra" | null

  // Sync with parent using backend keys
  const syncWithParent = (newData, newPreviews) => {
    setFormData(newData);
    setPreviews(newPreviews);
    updateData({
      default_image: newData.default_image,
      images: newData.images,
    });
  };

  // Main image
  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    e.target.value = ""; // allow picking the same file again

    syncWithParent(
      { ...formData, default_image: file },
      { ...previews, default_image: preview }
    );
  };

  // Additional images
  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    e.target.value = "";
    if (!files.length) return;

    const newFiles = [...formData.images, ...files];
    const newPreviews = [...previews.images, ...files.map((file) => URL.createObjectURL(file))];

    syncWithParent({ ...formData, images: newFiles }, { ...previews, images: newPreviews });
  };

  const removeMainImage = () =>
    syncWithParent({ ...formData, default_image: null }, { ...previews, default_image: "" });

  const removeAdditionalImage = (index) => {
    const newFiles = [...formData.images];
    const newPreviews = [...previews.images];
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);

    syncWithParent({ ...formData, images: newFiles }, { ...previews, images: newPreviews });
  };

  // Drag & drop
  const handleDrag = (e, zone) => {
    e.preventDefault();
    e.stopPropagation();
    if (["dragenter", "dragover"].includes(e.type)) setDragZone(zone);
    if (e.type === "dragleave") setDragZone(null);
  };

  const handleDrop = (e, isMain = false) => {
    e.preventDefault();
    e.stopPropagation();
    setDragZone(null);

    if (!e.dataTransfer.files.length) return;

    if (isMain) {
      const file = e.dataTransfer.files[0];
      const preview = URL.createObjectURL(file);
      syncWithParent(
        { ...formData, default_image: file },
        { ...previews, default_image: preview }
      );
    } else {
      const files = Array.from(e.dataTransfer.files);
      const newFiles = [...formData.images, ...files];
      const newPreviews = [...previews.images, ...files.map((file) => URL.createObjectURL(file))];
      syncWithParent({ ...formData, images: newFiles }, { ...previews, images: newPreviews });
    }
  };

  const zoneCls = (zone) =>
    clsx(
      "rounded-xl border-2 border-dashed p-5 text-center transition-colors",
      dragZone === zone ? "border-primary bg-primary/5" : hairline
    );

  const pickBtn =
    "mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300/80 dark:border-white/20 bg-white/60 dark:bg-white/10 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary";

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      {/* MAIN IMAGE */}
      <FormSection icon={ImageIcon} title="Main image" description="Shown first on the product page">
        <div
          className={zoneCls("main")}
          onDragEnter={(e) => handleDrag(e, "main")}
          onDragLeave={(e) => handleDrag(e, "main")}
          onDragOver={(e) => handleDrag(e, "main")}
          onDrop={(e) => handleDrop(e, true)}
        >
          {previews.default_image ? (
            <div className={clsx("relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-xl", glassSubtle)}>
              <img src={previews.default_image} alt="Main" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={removeMainImage}
                aria-label="Remove main image"
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white shadow-md transition-colors hover:bg-rose-600"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
              <UploadCloud size={32} className="text-primary/70" />
              <p className="text-sm">Drag & drop your main image here</p>
            </div>
          )}
          <label className={pickBtn}>
            <UploadCloud size={16} />
            {previews.default_image ? "Replace image" : "Choose image"}
            <input type="file" accept="image/*" onChange={handleMainImageChange} className="sr-only" />
          </label>
        </div>
      </FormSection>

      {/* ADDITIONAL IMAGES */}
      <FormSection
        icon={Images}
        title="Additional images"
        description={`${previews.images.length} image${previews.images.length === 1 ? "" : "s"}`}
      >
        <div
          className={zoneCls("extra")}
          onDragEnter={(e) => handleDrag(e, "extra")}
          onDragLeave={(e) => handleDrag(e, "extra")}
          onDragOver={(e) => handleDrag(e, "extra")}
          onDrop={(e) => handleDrop(e, false)}
        >
          <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
            <UploadCloud size={32} className="text-primary/70" />
            <p className="text-sm">Drag & drop multiple images here</p>
          </div>
          <label className={pickBtn}>
            <UploadCloud size={16} />
            Choose images
            <input type="file" accept="image/*" multiple onChange={handleAdditionalImagesChange} className="sr-only" />
          </label>
        </div>

        {previews.images.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {previews.images.map((url, i) => (
              <div key={`${url}-${i}`} className={clsx("group relative aspect-square overflow-hidden rounded-xl", glassSubtle)}>
                <img src={url} alt={`Product ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeAdditionalImage(i)}
                  aria-label={`Remove image ${i + 1}`}
                  className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white shadow-md transition-colors hover:bg-rose-600"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </FormSection>
    </div>
  );
};

export default ImagesTab;