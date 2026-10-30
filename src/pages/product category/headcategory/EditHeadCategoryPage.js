import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FolderTree, Layers, Tag, LayoutGrid } from "lucide-react";
import Swal from "sweetalert2";
import RichTextEditor from "../../../components/common/RichTextEditor";
import {
  FormShell, FormField, TextInput, EditorFrame, FormActions, FormLoading,
  slugifyStrict, showSwalLoading,
} from "../../../components/common/CategoryFormUi";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "http://127.0.0.1:8000/api/product-categories";
const ICONS = [FolderTree, Layers, Tag, LayoutGrid];

export default function EditHeadCategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  // Load existing category
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    axios
      .get(`${API_BASE}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (cancelled) return;
        const data = res.data.data;
        setName(data.name || "");
        setSlug(data.slug || "");
        setDescription(data.description || "");
      })
      .catch((err) => {
        toast.error("Failed to load category");
        console.error(err.response?.data || err.message);
      })
      .finally(() => { if (!cancelled) setFetching(false); });

    return () => { cancelled = true; };
  }, [id, token]);

  // The slug only follows the name when YOU edit the name.
  // (The old code also regenerated it right after loading, which silently rewrote saved slugs.)
  const handleNameChange = (value) => {
    setName(value);
    setSlug(slugifyStrict(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a category name");
      return;
    }
    if (!/^[A-Za-z\s-]+$/.test(name.trim())) {
      toast.error("Category name can only contain letters, spaces, and hyphens.");
      return;
    }
    if (!slug.trim()) {
      toast.error("Slug cannot be empty.");
      return;
    }
    if (!token) {
      toast.error("No token found. Please log in again.");
      return;
    }

    try {
      setLoading(true);
      showSwalLoading("Updating category...", "Please wait while we update your category.");

      await axios.put(
        `${API_BASE}/${id}`,
        { name: name.trim(), slug, description },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      Swal.close();
      toast.success("Category updated successfully!");
      setTimeout(() => navigate("/headcategory"), 800);
    } catch (error) {
      Swal.close();
      toast.error("Failed to update category");
      console.error("PUT error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormShell
      title="Edit main category"
      subtitle="Update the details of this top-level category"
      icons={ICONS}
    >
      {fetching ? (
        <FormLoading />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField label="Name" htmlFor="name" required hint="Letters, spaces and hyphens only.">
            <TextInput
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter category name"
            />
          </FormField>

          <FormField label="Slug" htmlFor="slug" hint="Generated from the name. Not editable here.">
            <TextInput id="slug" value={slug} readOnly placeholder="Auto-generated slug" />
          </FormField>

          <FormField label="Description" htmlFor="description">
            <EditorFrame>
              <RichTextEditor value={description} initialContent={description} onChange={setDescription} />
            </EditorFrame>
          </FormField>

          <FormActions
            onCancel={() => navigate("/headcategory")}
            submitLabel="Update category"
            loadingLabel="Updating..."
            loading={loading}
          />
        </form>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </FormShell>
  );
}