import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Network, FolderOpen, Layers, Tags } from "lucide-react";
import Swal from "sweetalert2";
import RichTextEditor from "../../../components/common/RichTextEditor";
import {
  FormShell, FormField, TextInput, SelectInput, EditorFrame, FormActions,
  slugify, fetchAllPages, showSwalLoading,
} from "../../../components/common/CategoryFormUi";
import "react-toastify/dist/ReactToastify.css";

const API = "http://127.0.0.1:8000/api";
const ICONS = [Network, FolderOpen, Layers, Tags];

const AddParentCategory = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [headCategories, setHeadCategories] = useState([]);
  const [headCategoryId, setHeadCategoryId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // All head categories (every page, so none are missing from the dropdown)
  useEffect(() => {
    let cancelled = false;
    fetchAllPages(`${API}/product-categories`, token ? { Authorization: `Bearer ${token}` } : undefined)
      .then((heads) => { if (!cancelled) setHeadCategories(heads); })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Failed to load head categories");
      });
    return () => { cancelled = true; };
  }, [token]);

  const handleNameChange = (value) => {
    setName(value);
    setSlug(slugify(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!headCategoryId) {
      toast.error("Please select a Head Category");
      return;
    }
    if (!/^[A-Za-z\s]+$/.test(name.trim())) {
      toast.error("Name should only contain letters and spaces!");
      return;
    }

    const payload = {
      product_category_id: headCategoryId,
      name: name.trim(),
      slug,
      description,
    };

    setLoading(true);
    showSwalLoading("Saving category...", "Please wait while we save your category.");

    try {
      const res = await fetch(`${API}/product-sub-categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message?.split(".")[0] || "Failed to add parent category");
      }

      Swal.close();
      toast.success("Parent category added successfully!");
      setTimeout(() => navigate("/parentcategory"), 1500);
    } catch (error) {
      Swal.close();
      console.error("Error:", error);
      toast.error(error.message || "An error occurred while adding the parent category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormShell
      title="Add parent category"
      subtitle="Create a category under a head category"
      icons={ICONS}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="Head category" htmlFor="headCategory" required>
          <SelectInput
            id="headCategory"
            value={headCategoryId}
            onChange={(e) => setHeadCategoryId(e.target.value)}
          >
            <option value="">Select a Head Category</option>
            {headCategories.map((head) => (
              <option key={head.id} value={head.id}>{head.name}</option>
            ))}
          </SelectInput>
        </FormField>

        <FormField label="Name" htmlFor="parentCategoryName" required hint="Letters and spaces only.">
          <TextInput
            id="parentCategoryName"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Enter parent category name"
            required
          />
        </FormField>

        <FormField label="Slug" htmlFor="slug" hint="Generated from the name. Not editable.">
          <TextInput id="slug" value={slug} readOnly placeholder="Auto-generated slug" />
        </FormField>

        <FormField label="Description" htmlFor="description">
          <EditorFrame>
            <RichTextEditor value={description} onChange={setDescription} />
          </EditorFrame>
        </FormField>

        <FormActions
          onCancel={() => navigate("/parentcategory")}
          submitLabel="Save"
          loadingLabel="Saving..."
          loading={loading}
        />
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </FormShell>
  );
};

export default AddParentCategory;