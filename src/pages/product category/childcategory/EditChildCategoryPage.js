import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { GitBranch, Tag, Boxes, Shapes } from "lucide-react";
import Swal from "sweetalert2";
import RichTextEditor from "../../../components/common/RichTextEditor";
import {
  FormShell, FormField, TextInput, SelectInput, EditorFrame, FormActions, FormLoading,
  slugify, fetchAllPages, showSwalLoading, glassInput,
} from "../../../components/common/CategoryFormUi";
import { clsx } from "clsx";
import "react-toastify/dist/ReactToastify.css";

const API = "http://127.0.0.1:8000/api";
const ICONS = [GitBranch, Tag, Boxes, Shapes];

const EditChildCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page") || 1;
  const per_page = searchParams.get("per_page") || 10;
  const backUrl = `/childcategory?page=${page}&per_page=${per_page}`;

  const [headCategories, setHeadCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [selectedHeadId, setSelectedHeadId] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  // Head categories, all parent categories (every page) and this child category
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [heads, parents, childRes] = await Promise.all([
          fetchAllPages(`${API}/product-categories`),
          fetchAllPages(`${API}/product-sub-categories`),
          axios.get(`${API}/product-child-categories/${id}`),
        ]);
        if (cancelled) return;

        const childData = childRes.data?.data;
        setHeadCategories(heads);
        setParentCategories(parents);

        if (childData) {
          // API naming: parent_category = the head, child_category = the parent
          setSelectedHeadId(childData.parent_category?.id?.toString() || "");
          setParentCategoryId(childData.child_category?.id?.toString() || "");
          setName(childData.name || "");
          setSlug(childData.slug || "");
          setDescription(childData.description || "");

          if (childData.banner) {
            setBannerPreview(
              childData.banner.startsWith("http") ? childData.banner : `http://127.0.0.1:8000/${childData.banner}`
            );
          }
        }
      } catch (error) {
        toast.error("Failed to load data.");
        console.error("Fetch error:", error);
      } finally {
        if (!cancelled) setFetching(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [id]);

  // Free the temporary preview URL of a newly picked image
  useEffect(() => {
    return () => {
      if (bannerPreview.startsWith("blob:")) URL.revokeObjectURL(bannerPreview);
    };
  }, [bannerPreview]);

  const filteredParentCategories = useMemo(
    () =>
      selectedHeadId
        ? parentCategories.filter((p) => p.product_category_id?.toString() === selectedHeadId)
        : [],
    [selectedHeadId, parentCategories]
  );

  const handleHeadChange = (value) => {
    setSelectedHeadId(value);
    setParentCategoryId(""); // a parent from the previous head is no longer valid
  };

  // The slug only follows the name when YOU edit the name (not right after loading)
  const handleNameChange = (value) => {
    setName(value);
    setSlug(slugify(value));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedHeadId) newErrors.head = "Please select a head category.";
    if (!parentCategoryId) newErrors.parent = "Please select a parent category.";
    if (!name.trim()) newErrors.name = "Name is required.";
    else if (!/^[A-Za-z\s]+$/.test(name)) newErrors.name = "Name should only contain letters and spaces.";
    if (!slug.trim()) newErrors.slug = "Slug is required.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach((err) => toast.error(err));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      showSwalLoading("Updating category...", "Please wait while we update the category.");

      const formData = new FormData();
      formData.append("product_category_id", selectedHeadId);
      formData.append("product_subcategory_id", parentCategoryId);
      formData.append("name", name.trim());
      formData.append("slug", slug);
      formData.append("description", description || "");
      if (bannerImage) formData.append("banner_image", bannerImage);

      await axios.post(`${API}/product-child-categories/${id}?_method=PUT`, formData);

      Swal.close();
      toast.success("Child category updated successfully!");
      setTimeout(() => navigate(backUrl), 1500);
    } catch (error) {
      Swal.close();
      console.error("Update error:", error);
      if (error.response) {
        toast.error(error.response.data?.message || "Failed to update child category.");
      } else {
        toast.error("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormShell
      title="Edit child category"
      subtitle="Update the details of this lowest-level category"
      icons={ICONS}
    >
      {fetching ? (
        <FormLoading />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Head category" htmlFor="headCategory" required error={errors.head}>
              <SelectInput
                id="headCategory"
                value={selectedHeadId}
                onChange={(e) => handleHeadChange(e.target.value)}
                invalid={!!errors.head}
              >
                <option value="">Select a Head Category</option>
                {headCategories.map((head) => (
                  <option key={head.id} value={head.id.toString()}>{head.name}</option>
                ))}
              </SelectInput>
            </FormField>

            <FormField
              label="Parent category"
              htmlFor="parentCategory"
              required
              error={errors.parent}
              hint={!selectedHeadId ? "Choose a head category first." : undefined}
            >
              <SelectInput
                id="parentCategory"
                value={parentCategoryId}
                onChange={(e) => setParentCategoryId(e.target.value)}
                invalid={!!errors.parent}
                disabled={!selectedHeadId || filteredParentCategories.length === 0}
              >
                <option value="">Select a Parent Category</option>
                {filteredParentCategories.map((parent) => (
                  <option key={parent.id} value={parent.id.toString()}>{parent.name}</option>
                ))}
              </SelectInput>
            </FormField>
          </div>

          <FormField label="Name" htmlFor="childCategoryName" required error={errors.name} hint="Letters and spaces only.">
            <TextInput
              id="childCategoryName"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              invalid={!!errors.name}
            />
          </FormField>

          <FormField label="Slug" htmlFor="slug" required error={errors.slug} hint="Generated from the name. You can edit it.">
            <TextInput id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} invalid={!!errors.slug} />
          </FormField>

          <FormField label="Description" htmlFor="description">
            <EditorFrame>
              <RichTextEditor value={description} onChange={setDescription} />
            </EditorFrame>
          </FormField>

          <FormField label="Banner image" htmlFor="bannerImage" hint="Leave empty to keep the current banner.">
            <input
              id="bannerImage"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setBannerImage(file);
                  setBannerPreview(URL.createObjectURL(file));
                }
              }}
              className={clsx(
                "block w-full rounded-lg p-2 text-sm text-muted-foreground cursor-pointer",
                "file:mr-4 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2",
                "file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20",
                "focus:outline-none focus:ring-2 focus:ring-primary/40",
                glassInput
              )}
            />

            {bannerPreview && (
              <div className="mt-4">
                <p className="mb-2 text-xs text-muted-foreground">
                  {bannerImage ? "New banner preview" : "Current banner"}
                </p>
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  onError={(e) => {
                    console.error("Failed to load image:", bannerPreview);
                    e.target.style.display = "none";
                  }}
                  className="h-40 w-full max-w-md rounded-xl border border-border object-cover shadow-sm"
                />
              </div>
            )}
          </FormField>

          <FormActions
            onCancel={() => navigate(backUrl)}
            submitLabel="Update"
            loadingLabel="Updating..."
            loading={loading}
          />
        </form>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </FormShell>
  );
};

export default EditChildCategory;