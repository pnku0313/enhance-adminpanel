// src/pages/brands/EditBrandPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { clsx } from "clsx";
import { Tag, Award, Store, Star, UploadCloud } from "lucide-react";

import {
  FormShell,
  FormField,
  FormLoading,
  TextInput,
  SelectInput,
  FormActions,
  showSwalLoading,
  slugify,
  primaryGradient,
} from "../../components/common/CategoryFormUi";

const API_BASE = "http://127.0.0.1:8000/api/product-brands";

const pickBtn =
  "mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300/80 dark:border-white/20 bg-white/60 dark:bg-white/10 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary";

const EditBrandPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // brand id from the route

  const [fetching, setFetching] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    status: "1", // "1" = Active, "0" = Inactive
    image: null, // existing logo URL, or a new base64 string
  });

  const fetchBrand = useCallback(async () => {
    try {
      setFetching(true);
      setLoadError(false);
      const res = await axios.get(`${API_BASE}/${id}`);
      const brand = res.data.data ?? {};

      setFormData({
        name: brand.brand_name || "",
        slug: brand.slug || "",
        status: [true, 1, "1", "true"].includes(brand.is_active) ? "1" : "0",
        image: brand.logo,
      });
      setImagePreview(brand.logo || "");
    } catch (error) {
      console.error("Error fetching brand:", error?.response?.data || error);
      setLoadError(true);
      toast.error("Failed to load brand details.");
    } finally {
      setFetching(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBrand();
  }, [fetchBrand]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      // Same rule as before: letters and spaces only
      if (!/^[A-Za-z\s]*$/.test(value)) {
        setErrors((prev) => ({ ...prev, name: "Only letters and spaces are allowed." }));
        return;
      }
      setErrors((prev) => (prev.name ? { ...prev, name: undefined } : prev));
      // The slug follows the name only when the name is edited
      setFormData((prev) => ({ ...prev, name: value, slug: slugify(value) }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const loadFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (PNG, JPG or JPEG).");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setFormData((prev) => ({ ...prev, image: base64String }));
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e) => {
    loadFile(e.target.files?.[0]);
    e.target.value = ""; // allow picking the same file again
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    loadFile(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrors({ name: "Brand name is required!" });
      toast.error("Brand name is required!");
      return;
    }
    if (!formData.slug.trim()) {
      setErrors({ name: "Slug is required!" });
      toast.error("Slug is required!");
      return;
    }

    const updateData = {
      brand_name: formData.name,
      slug: formData.slug,
      is_active: formData.status === "1" ? "1" : "0",
      logo: formData.image,
    };

    try {
      setSaving(true);
      showSwalLoading("Updating Brand...", "Please wait while we update brand details.");

      await axios.put(`${API_BASE}/${id}`, updateData, {
        headers: { "Content-Type": "application/json" },
      });

      Swal.close();
      toast.success("Brand updated successfully!");
      setTimeout(() => navigate("/brands"), 500);
    } catch (error) {
      Swal.close();
      console.error("Error updating brand:", error?.response?.data || error);
      const apiMsg =
        error?.response?.data?.message || error?.response?.data?.error || "Failed to update brand.";
      toast.error(apiMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <FormShell
        title="Edit Brand"
        subtitle="Update the details of this brand."
        icons={[Tag, Award, Store, Star]}
      >
        {fetching ? (
          <FormLoading />
        ) : loadError ? (
          <div className="py-10 text-center">
            <p className="font-medium text-foreground">Couldn't load this brand</p>
            <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/brands")}
                className="h-10 rounded-lg border border-border px-5 text-sm font-medium text-foreground hover:bg-primary/5 transition-colors"
              >
                Back to brands
              </button>
              <button
                type="button"
                onClick={fetchBrand}
                className={clsx(
                  "h-10 rounded-lg px-5 text-sm font-semibold text-white bg-gradient-to-r shadow-lg shadow-indigo-500/30",
                  primaryGradient
                )}
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField label="Brand name" htmlFor="name" required error={errors.name}>
                <TextInput
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter brand name"
                  invalid={!!errors.name}
                />
              </FormField>

              <FormField label="Slug" htmlFor="slug" hint="Updates automatically when you change the name">
                <TextInput id="slug" name="slug" value={formData.slug} readOnly />
              </FormField>
            </div>

            <FormField label="Status" htmlFor="status" required>
              <SelectInput id="status" name="status" value={formData.status} onChange={handleInputChange}>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </SelectInput>
            </FormField>

            <FormField label="Brand image" htmlFor="logo" hint="PNG, JPG or JPEG">
              <div
                className={clsx(
                  "rounded-xl border-2 border-dashed p-5 text-center transition-colors",
                  dragActive ? "border-primary bg-primary/5" : "border-slate-300/80 dark:border-white/20"
                )}
                onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                onDrop={handleDrop}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Brand preview"
                    className="mx-auto h-24 w-24 rounded-xl border border-border object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
                    <UploadCloud size={32} className="text-primary/70" />
                    <p className="text-sm">Drag & drop your brand image here</p>
                  </div>
                )}
                <label htmlFor="logo" className={pickBtn}>
                  <UploadCloud size={16} />
                  {imagePreview ? "Replace image" : "Choose image"}
                  <input id="logo" type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
                </label>
              </div>
            </FormField>

            <FormActions
              onCancel={() => navigate("/brands")}
              submitLabel="Update Brand"
              loadingLabel="Updating..."
              loading={saving}
            />
          </form>
        )}
      </FormShell>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  );
};

export default EditBrandPage;