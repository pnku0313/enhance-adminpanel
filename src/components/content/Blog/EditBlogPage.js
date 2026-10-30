"use client";

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { X } from "lucide-react";
import Swal from "sweetalert2";
import $ from "jquery";

import "popper.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "summernote/dist/summernote-bs4.css";
import "summernote/dist/summernote-bs4.js";
import "react-toastify/dist/ReactToastify.css";

const EditBlogPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    author_id: "",
    title: "",
    seo_title: "",
    excerpt: "",
    body: "",
    image: "",
    slug: "",
    meta_description: "",
    meta_keywords: "",
    status: "DRAFT",
    featured: false,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const bodyEditorRef = useRef(null);

  // ✅ Fetch blog details
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        const res = await axios.get(
          `http://127.0.0.1:8000/api/blogs/${id}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        const blog = res.data.data;
        setFormData({
          author_id: blog.author.id?.toString() || "",
          title: blog.title || "",
          seo_title: blog.seo_title || "",
          excerpt: blog.excerpt || "",
          body: blog.body || "",
          image: blog.image || "",
          slug: blog.slug || "", // ✅ Will be displayed as read-only
          meta_description: blog.meta_description || "",
          meta_keywords: blog.meta_keywords || "",
          status: blog.status || "DRAFT",
          featured: blog.featured === 1 || blog.featured === true,
        });

        if (blog.image) {
          setPreviewImage(
            `http://127.0.0.1:8000/storage/${blog.image}`
          );
        }

        // Load into summernote after DOM is ready
        setTimeout(() => {
          if (bodyEditorRef.current) {
            $(bodyEditorRef.current).summernote("code", blog.body || "");
          }
        }, 200);
      } catch (error) {
        console.error("❌ Error fetching blog:", error);
        toast.error("Failed to load blog data.");
      }
    };

    fetchBlog();
  }, [id]);

  // ✅ Summernote Initialization
  useEffect(() => {
    const $body = $(bodyEditorRef.current);
    if (typeof $body.summernote === "function") {
      $body.summernote({
        placeholder: "Write full blog content here...",
        tabsize: 2,
        height: 250,
        toolbar: [
          ["style", ["bold", "italic", "underline", "clear"]],
          ["para", ["ul", "ol", "paragraph"]],
          ["insert", ["link", "picture"]],
          ["view", ["codeview"]],
        ],
        callbacks: {
          onChange: (contents) => {
            setFormData((prev) => ({ ...prev, body: contents }));
          },
        },
      });
    }
    return () => {
      if ($body.hasClass("summernote")) $body.summernote("destroy");
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    if (name === "title") {
      const slug = newValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({ ...prev, title: newValue, slug }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: newValue }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewImage(null);
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  const validateForm = () => {
    const bodyContent = $(bodyEditorRef.current).summernote("code");
    if (!formData.title.trim()) {
      toast.error("❌ Title is required.");
      return false;
    }
    if (!bodyContent || bodyContent === "<p><br></p>") {
      toast.error("❌ Body is required.");
      return false;
    }
    if (!formData.slug.trim()) {
      toast.error("❌ Slug is required.");
      return false;
    }
    if (!formData.author_id) {
      toast.error("❌ Author ID is missing.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get latest body content from Summernote
    const bodyContent = $(bodyEditorRef.current).summernote("code");

    // Replace body content in formData (force update before submission)
    const finalData = {
      ...formData,
      body: bodyContent,
    };

    // Client-side validation
    if (!finalData.title.trim()) {
      toast.error("❌ Title is required.");
      return;
    }

    if (!finalData.body || finalData.body === "<p><br></p>") {
      toast.error("❌ Body is required.");
      return;
    }

    if (!finalData.slug.trim()) {
      toast.error("❌ Slug is required.");
      return;
    }

    if (!finalData.author_id) {
      toast.error("❌ Author ID is required.");
      return;
    }

    if (!finalData.status) {
      toast.error("❌ Status is required.");
      return;
    }

    setLoading(true);

    try {
      const authToken = localStorage.getItem("authToken");
      const data = new FormData();

      // Append fields to FormData (convert booleans to string)
      Object.keys(finalData).forEach((key) => {
        let value = finalData[key];
        if (typeof value === "boolean") {
          value = value ? "1" : "0";
        }
        data.append(key, value);
      });

      // Append image if new file is selected
      if (imageFile) {
        data.append("image", imageFile);
      }

      // Optional: log FormData for debugging
      for (let pair of data.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      const res = await axios.post(
        `http://127.0.0.1:8000/api/blogs/${id}?_method=PUT`,
        data,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // ✅ Success
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "✅ Blog post updated successfully!",
        confirmButtonColor: "#d33",
      }).then(() => navigate("/content"));
    } catch (error) {
      console.error("❌ Update error:", error);

      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors)
          .flat()
          .join("\n");
        toast.error(errorMessages);
      } else {
        toast.error("Failed to update blog post.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">Edit Blog Post</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Author ID */}
        <div>
          <label className="text-sm font-medium">Author ID</label>
          <Input name="author_id" value={formData.author_id} readOnly />
        </div>

        {/* Title */}
        <div>
          <label className="text-sm font-medium">Title</label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter blog title"
            required
          />
        </div>

        {/* Slug (Read-Only) */}
        <div>
          <label className="text-sm font-medium">Slug</label>
          <Input
            name="slug"
            value={formData.slug}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Image */}
        <div>
          <label className="text-sm font-medium">Blog Image</label>
          <Input
            type="file"
            accept="image/*"
            required
            onChange={handleImageUpload}
          />
          {previewImage && (
            <div className="relative w-full mt-2">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-80 object-cover rounded border shadow"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Excerpt */}
        <div>
          <label className="text-sm font-medium">Excerpt</label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleInputChange}
            className="w-full h-100 border rounded p-2"
          />
        </div>

        {/* Body */}
        <div>
          <label className="text-sm font-medium">Body</label>
          <textarea ref={bodyEditorRef} className="hidden"></textarea>
        </div>

        {/* SEO Title */}
        <div>
          <label className="text-sm font-medium">SEO Title</label>
          <Input
            name="seo_title"
            value={formData.seo_title}
            onChange={handleInputChange}
            placeholder="Enter SEO title"
          />
        </div>

        {/* Meta Description */}
        <div>
          <label className="text-sm font-medium">Meta Description</label>
          <textarea
            name="meta_description"
            value={formData.meta_description}
            onChange={handleInputChange}
            className="w-full border rounded p-2"
          />
        </div>

        {/* Meta Keywords */}
        <div>
          <label className="text-sm font-medium">Meta Keywords</label>
          <textarea
            name="meta_keywords"
            value={formData.meta_keywords}
            onChange={handleInputChange}
            className="w-full border rounded p-2"
          />
        </div>

        {/* Status */}
        <div>
          <label className="text-sm font-medium">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full border rounded p-2"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium leading-none self-center">
            Featured
          </label>

          <div className="flex items-center">
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, featured: !prev.featured }))
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.featured ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.featured ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/content")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={loading}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Update Blog"
            )}
          </Button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default EditBlogPage;
