import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FolderTree, Layers, Tag, LayoutGrid } from "lucide-react";
import RichTextEditor from "../../../components/common/RichTextEditor";
import {
  FormShell, FormField, TextInput, EditorFrame, FormActions,
  slugifyStrict, showSwalLoading,
} from "../../../components/common/CategoryFormUi";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "http://127.0.0.1:8000/api/product-categories";
const ICONS = [FolderTree, Layers, Tag, LayoutGrid];

export default function AddHeadCategoryPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Slug follows the name as you type (you can still edit it afterwards)
  const handleNameChange = (value) => {
    setName(value);
    setSlug(slugifyStrict(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^[A-Za-z\s-]+$/.test(name.trim())) {
      toast.error("Category name can only contain letters, spaces, and hyphens.");
      return;
    }

    try {
      setLoading(true);
      showSwalLoading("Saving category...", "Please wait while we save your category.");

      await axios.post(
        API_BASE,
        { name: name.trim(), slug, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.close();
      toast.success("Category added successfully!");
      setTimeout(() => navigate("/headcategory"), 800);
    } catch (error) {
      Swal.close();
      toast.error("Failed to add category");
      console.error("Error Response:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormShell
      title="Add main category"
      subtitle="Create a new top-level product category"
      icons={ICONS}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="Name" htmlFor="name" required hint="Letters, spaces and hyphens only.">
          <TextInput
            id="name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Enter category name"
            required
          />
        </FormField>

        <FormField label="Slug" htmlFor="slug" required hint="Generated from the name. You can edit it.">
          <TextInput
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Auto-generated slug"
            required
          />
        </FormField>

        <FormField label="Description" htmlFor="description">
          <EditorFrame>
            <RichTextEditor initialContent={description} onChange={setDescription} />
          </EditorFrame>
        </FormField>

        <FormActions
          onCancel={() => navigate("/headcategory")}
          submitLabel="Add category"
          loadingLabel="Saving..."
          loading={loading}
        />
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </FormShell>
  );
}