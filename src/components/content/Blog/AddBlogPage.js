"use client";

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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

const AddBlogPage = () => {
  const navigate = useNavigate();

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
  const [loading, setLoading] = useState(false);
  const bodyEditorRef = useRef(null);

  useEffect(() => {
    const authUserId =
      localStorage.getItem("authUserId") || localStorage.getItem("token");
    if (authUserId) {
      setFormData((prev) => ({ ...prev, author_id: authUserId }));
    }
  }, []);

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
          onInit: () => {
            $body.summernote("code", formData.body || "");
          },
        },
      });
    }
    return () => {
      if ($body.hasClass("summernote")) $body.summernote("destroy");
    };
  }, [formData.body]);

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

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setFormData((prev) => ({ ...prev, image: base64String }));
      setPreviewImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: "" }));
    setPreviewImage(null);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("❌ Title is required.");
      return false;
    }
    if (!formData.body.trim()) {
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

    // ✅ Stop here if validation fails
    if (!validateForm()) return;

    setLoading(true);
    console.log("📤 Sending Blog Data:", formData);

    try {
      const authToken = localStorage.getItem("token");
      const res = await axios.post(
        "http://127.0.0.1:8000/api/blogs",
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      console.log("✅ API Response:", res.data);

      // ✅ Check if the API response indicates success
      if (res.data.success) {
        // Show success popup and then redirect
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "✅ Blog post created successfully!",
          confirmButtonColor: "#d33",
        }).then(() => navigate("/content"));
      } else {
        // Show error message if success flag is false
        toast.error(res.data.message || "❌ Failed to create blog post.");
      }
    } catch (error) {
      console.error("❌ API Error:", error.response || error);
      // Handle network or unexpected API errors
      toast.error("❌ Failed to create blog post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">Add Blog Post</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Slug */}
        <div>
          <label className="text-sm font-medium">Slug</label>
          <Input
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            placeholder="Auto-generated slug"
            required
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
            placeholder="short-description"
            value={formData.excerpt}
            onChange={handleInputChange}
            className="w-full border rounded p-2"
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

        {/* Featured */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="featured"
            checked={formData.featured}
            onChange={handleInputChange}
            className="h-4 w-4"
          />
          <label className="text-sm font-medium">Featured</label>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/content")}
            className="w-full sm:w-auto"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Create Blog"
            )}
          </Button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AddBlogPage;
