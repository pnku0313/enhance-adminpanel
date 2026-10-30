import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import RichTextEditor from "../../../components/common/RichTextEditor";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

const EditParentCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken");

  const [headCategories, setHeadCategories] = useState([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [headCategoryId, setHeadCategoryId] = useState("");
  const [loading, setLoading] = useState(false); // ✅ loader state

  // Fetch head categories and existing parent category data
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        // Fetch head categories
        const headsRes = await fetch(
          "http://127.0.0.1:8000/api/product-categories",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const headsData = await headsRes.json();
        setHeadCategories(headsData.data || []);

        // Fetch existing parent category
        const parentRes = await fetch(
          `http://127.0.0.1:8000/api/product-sub-categories/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!parentRes.ok) throw new Error("Failed to fetch category");

        const parentData = await parentRes.json();
        const cat = parentData.data;

        setName(cat.name || "");
        setSlug(cat.slug || "");
        setDescription(cat.description || "");
        setHeadCategoryId(cat.product_category_id?.toString() || "");
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load category data");
      }
    };

    fetchData();
  }, [id, token]);

  // Auto-generate slug on name change
  useEffect(() => {
    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setSlug(generatedSlug);
  }, [name]);

  const validateForm = () => {
    if (!headCategoryId) {
      toast.error("Please select a Head Category");
      return false;
    }
    if (!/^[A-Za-z\s]+$/.test(name.trim())) {
      toast.error("Name should only contain letters and spaces");
      return false;
    }
    if (
      !description ||
      description.trim() === "" ||
      description === "<p><br></p>"
    ) {
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

      Swal.fire({
        title: "Updating Category...",
        text: "Please wait while we update the category.",
        allowOutsideClick: false,
        background: "#ffff",
        color: "#dc2626",
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const payload = {
        product_category_id: Number(headCategoryId),
        name: name.trim(),
        slug,
        description,
      };

      const res = await fetch(
        `http://127.0.0.1:8000/api/product-sub-categories/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "Update failed");

      Swal.close();
      toast.success("Parent Category updated successfully!");
      setLoading(false);

      setTimeout(() => navigate("/parentcategory"), 1500);
    } catch (err) {
      setLoading(false);
      Swal.close();
      console.error("Update error:", err);
      toast.error("Failed to update the category");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 dark:text-white">
      <ToastContainer position="top-right" autoClose={3000} />

      <h1 className="text-2xl font-bold mb-6">Edit Parent Category</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 dark:bg-gray-800 rounded-lg p-6"
      >
        {/* Head Category */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label htmlFor="headCategory" className="sm:w-40 font-medium">
            Head Category
          </label>
          <select
            id="headCategory"
            value={headCategoryId}
            onChange={(e) => setHeadCategoryId(e.target.value)}
            className="flex-1 border rounded-md p-2"
            required
          >
            <option value="">Select a Head Category</option>
            {headCategories.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>

        {/* Name */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label htmlFor="name" className="sm:w-40 font-medium">
            Name
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1"
            required
          />
        </div>

        {/* Slug */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label htmlFor="slug" className="sm:w-40 font-medium">
            Slug
          </label>
          <Input
            id="slug"
            value={slug}
            readOnly
            className="flex-1 bg-gray-100"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col sm:flex-row gap-3">
          <label htmlFor="description" className="sm:w-40 font-medium pt-2">
            Description
          </label>
          <RichTextEditor value={description} onChange={setDescription} />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/parentcategory")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditParentCategory;
