import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { GitBranch, Tag, Boxes, Shapes } from "lucide-react";
import Swal from "sweetalert2";
import RichTextEditor from "../../../components/common/RichTextEditor";
import {
  FormShell, FormField, TextInput, SelectInput, EditorFrame, FormActions,
  slugify, fetchAllPages, showSwalLoading,
} from "../../../components/common/CategoryFormUi";
import "react-toastify/dist/ReactToastify.css";

const API = "http://127.0.0.1:8000/api";
const ICONS = [GitBranch, Tag, Boxes, Shapes];

const AddChildCategory = () => {
  const navigate = useNavigate();

  const [headCategories, setHeadCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [selectedHeadId, setSelectedHeadId] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Head + parent categories (every page, so none are missing from the dropdowns)
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchAllPages(`${API}/product-categories`),
      fetchAllPages(`${API}/product-sub-categories`),
    ])
      .then(([heads, parents]) => {
        if (cancelled) return;
        setHeadCategories(heads);
        setParentCategories(parents);
      })
      .catch((error) => {
        toast.error("Failed to load categories. Please try again.");
        console.error("API fetch error:", error);
      });
    return () => { cancelled = true; };
  }, []);

  // Parents that belong to the chosen head
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
      showSwalLoading("Saving...", "Please wait while we add the child category");

      await axios.post(`${API}/product-child-categories`, {
        product_category_id: selectedHeadId,
        product_subcategory_id: parentCategoryId,
        name: name.trim(),
        slug,
        description,
      });

      Swal.close();
      toast.success("Child category added successfully!");
      setTimeout(() => navigate("/childcategory"), 1500);
    } catch (error) {
      Swal.close();
      console.error("Submit error:", error);
      toast.error("Failed to add child category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormShell
      title="Add child category"
      subtitle="Create a lowest-level category under a parent category"
      icons={ICONS}
    >
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
                <option key={head.id} value={head.id}>{head.name}</option>
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
                <option key={parent.id} value={parent.id}>{parent.name}</option>
              ))}
            </SelectInput>
          </FormField>
        </div>

        <FormField label="Name" htmlFor="childCategoryName" required error={errors.name} hint="Letters and spaces only.">
          <TextInput
            id="childCategoryName"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Enter child category name"
            invalid={!!errors.name}
          />
        </FormField>

        <FormField label="Slug" htmlFor="slug" required error={errors.slug} hint="Generated from the name. You can edit it.">
          <TextInput
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            invalid={!!errors.slug}
          />
        </FormField>

        <FormField label="Description" htmlFor="description">
          <EditorFrame>
            <RichTextEditor value={description} onChange={setDescription} />
          </EditorFrame>
        </FormField>

        <FormActions
          onCancel={() => navigate("/childcategory")}
          submitLabel="Save"
          loadingLabel="Saving..."
          loading={loading}
        />
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </FormShell>
  );
};

export default AddChildCategory;