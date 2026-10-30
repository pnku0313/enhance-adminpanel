import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Network, FolderOpen, Layers, Tags } from "lucide-react";
import Swal from "sweetalert2";
import RichTextEditor from "../../../components/common/RichTextEditor";
import {
  FormShell, FormField, TextInput, SelectInput, EditorFrame, FormActions, FormLoading,
  slugify, fetchAllPages, showSwalLoading,
} from "../../../components/common/CategoryFormUi";
import "react-toastify/dist/ReactToastify.css";

const API = "http://127.0.0.1:8000/api";
const ICONS = [Network, FolderOpen, Layers, Tags];

const EditParentCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token") || localStorage.getItem("authToken");

  const [headCategories, setHeadCategories] = useState([]);
  const [headCategoryId, setHeadCategoryId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  // Head categories (all pages) + this parent category
  useEffect(() => {
    if (!token) {
      toast.error("No token found. Please log in again.");
      setFetching(false);
      return;
    }
    let cancelled = false;
    const headers = { Authorization: `Bearer ${token}` };

    const load = async () => {
      try {
        const heads = await fetchAllPages(`${API}/product-categories`, headers);

        const parentRes = await fetch(`${API}/product-sub-categories/${id}`, { headers });
        if (!parentRes.ok) throw new Error("Failed to fetch category");
        const cat = (await parentRes.json()).data;

        if (cancelled) return;
        setHeadCategories(heads);
        setName(cat.name || "");
        setSlug(cat.slug || "");
        setDescription(cat.description || "");
        setHeadCategoryId(cat.product_category_id?.toString() || "");
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load category data");
      } finally {
        if (!cancelled) setFetching(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [id, token]);

  // The slug only follows the name when YOU edit the name (not right after loading)
  const handleNameChange = (value) => {
    setName(value);
    setSlug(slugify(value));
  };

  const validateForm = () => {
    if (!headCategoryId) {
      toast.error("Please select a Head Category");
      return false;
    }
    if (!/^[A-Za-z\s]+$/.test(name.trim())) {
      toast.error("Name should only contain letters and spaces");
      return false;
    }
    if (!description || description.trim() === "" || description === "<p><br></p>") {
      toast.error("Description cannot be empty");
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

      const res = await fetch(`${API}/product-sub-categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          product_category_id: Number(headCategoryId),
          name: name.trim(),
          slug,
          description,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Update failed");

      Swal.close();
      toast.success("Parent Category updated successfully!");
      setTimeout(() => navigate("/parentcategory"), 1500);
    } catch (err) {
      Swal.close();
      console.error("Update error:", err);
      toast.error("Failed to update the category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormShell
      title="Edit parent category"
      subtitle="Update the details of this parent category"
      icons={ICONS}
    >
      {fetching ? (
        <FormLoading />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField label="Head category" htmlFor="headCategory" required>
            <SelectInput
              id="headCategory"
              value={headCategoryId}
              onChange={(e) => setHeadCategoryId(e.target.value)}
              required
            >
              <option value="">Select a Head Category</option>
              {headCategories.map((h) => (
                <option key={h.id} value={h.id.toString()}>{h.name}</option>
              ))}
            </SelectInput>
          </FormField>

          <FormField label="Name" htmlFor="name" required hint="Letters and spaces only.">
            <TextInput id="name" value={name} onChange={(e) => handleNameChange(e.target.value)} required />
          </FormField>

          <FormField label="Slug" htmlFor="slug" hint="Generated from the name. Not editable.">
            <TextInput id="slug" value={slug} readOnly />
          </FormField>

          <FormField label="Description" htmlFor="description" required>
            <EditorFrame>
              <RichTextEditor value={description} onChange={setDescription} />
            </EditorFrame>
          </FormField>

          <FormActions
            onCancel={() => navigate("/parentcategory")}
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

export default EditParentCategory;