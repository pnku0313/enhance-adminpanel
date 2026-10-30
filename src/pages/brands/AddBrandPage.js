import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { clsx } from "clsx";
import { Tag, Award, Store, Star, UploadCloud } from "lucide-react";

import {
  FormShell,
  FormField,
  TextInput,
  SelectInput,
  FormActions,
  showSwalLoading,
  slugify,
} from "../../components/common/CategoryFormUi";

const API_URL = "http://127.0.0.1:8000/api/product-brands";

const pickBtn =
  "mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300/80 dark:border-white/20 bg-white/60 dark:bg-white/10 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary";

const AddBrandPage = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    status: "1", // 1 = Active, 0 = Inactive
    image: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      // Same rule as before: letters and spaces only
      if (!/^[A-Za-z\s]*$/.test(value)) {
        setErrors((prev) => ({ ...prev, name: "Only letters and spaces are allowed." }));
        return;
      }
      setErrors((prev) => (prev.name ? { ...prev, name: undefined } : prev));
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
      const base64String = reader.result; // full base64 data URL
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

    if (!formData.name.trim() || !formData.slug.trim()) {
      setErrors({ name: "Brand name is required." });
      toast.error("Brand name is required.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authorization token not found.");
      return;
    }

    const payload = {
      brand_name: formData.name,
      slug: formData.slug,
      is_active: formData.status,
      logo: formData.image, // base64 string
    };

    try {
      setSaving(true);
      showSwalLoading("Saving Brand...", "Please wait while we save your brand.");

      const response = await axios.post(API_URL, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      Swal.close();
      toast.success("Brand added successfully!");
      if (onSubmit) onSubmit(response.data);

      setTimeout(() => navigate("/brands"), 500);
    } catch (error) {
      Swal.close();
      const message = error.response?.data?.message || "Something went wrong!";
      toast.error(message);
      console.error("Brand creation error:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <FormShell
        title="Add New Brand"
        subtitle="Create a brand to attach to your products."
        icons={[Tag, Award, Store, Star]}
      >
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

            <FormField label="Slug" htmlFor="slug" hint="Generated automatically from the name">
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
            submitLabel="Add Brand"
            loadingLabel="Saving..."
            loading={saving}
          />
        </form>
      </FormShell>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  );
};

export default AddBrandPage;