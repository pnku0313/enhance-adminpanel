"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import axios from "axios";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BannerFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Banner ID from route for edit
  const [formData, setFormData] = useState({
    position: "", // ✅ updated key
    banner_image: null, // For preview
    rawImage: null, // Actual file to upload
    target_url: "",
    is_active: false,
  });

  const [loading, setLoading] = useState(false);
  const isEditing = !!id;

  // ✅ Fetch banner data if editing
  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      axios
        .get(`http://127.0.0.1:8000/api/banners/${id}`)
        .then((res) => {
          const data = res.data.data;

          setFormData({
            position: data.position || "", // ✅ using position instead of banner_placement
            banner_image: data.banner_image || null,
            rawImage: null,
            target_url: data.target_url || "",
            is_active: !!data.is_active,
          });
        })
        .catch((err) => {
          console.error(err);
          toast.error("❌ Failed to fetch banner data.");
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle image upload + preview
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        banner_image: URL.createObjectURL(file),
        rawImage: file,
      }));
    }
  };

  // Validation
  const validateForm = () => {
    const urlRegex =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;

    if (!formData.position) {
      toast.error("❌ Please select a banner position.");
      return false;
    }

    if (formData.target_url && !urlRegex.test(formData.target_url)) {
      toast.error("❌ Target URL must be a valid URL.");
      return false;
    }

    return true;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    console.log("Form Data State:", formData);
    const data = new FormData();
    data.append("position", formData.position); // ✅ correct key
    data.append("target_url", formData.target_url);
    data.append("is_active", formData.is_active ? 1 : 0);
    if (formData.rawImage) data.append("banner_image", formData.rawImage);

    for (let pair of data.entries()) {
      console.log(pair[0] + ": ", pair[1]);
    }

    setLoading(true);
    try {
      if (isEditing) {
        await axios.post(
          `http://127.0.0.1:8000/api/banners/${id}?_method=PUT`,
          data,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        Swal.fire({
          icon: "success",
          title: "Banner updated successfully!",
          confirmButtonColor: "#dc2626",
        }).then(() => navigate("/content"));
      } else {
        await axios.post(
          "http://127.0.0.1:8000/api/banners",
          data,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        Swal.fire({
          icon: "success",
          title: "Banner created successfully!",
          confirmButtonColor: "#dc2626",
        }).then(() => navigate("/content"));
      }
    } catch (error) {
      console.error(error);
      toast.error("❌ Failed to save banner.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? "Edit Banner" : "Add Banner"}
      </h1>

      {loading && <p className="mb-4 text-sm text-gray-500">Loading...</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ✅ Position Dropdown */}
        <div>
          <label className="text-sm font-medium">Banner Position</label>
          <select
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            required
            className="w-full border rounded p-2 focus:outline-none focus:ring focus:ring-red-300 bg-white dark:bg-transparent dark:text-white"
          >
            <option value="">-- Select Position --</option>
            <option value="top_banner">Top Banner</option>
            <option value="bottom_banner">Bottom Banner</option>
          </select>
        </div>

        {/* Banner Image */}
        <div>
          <label className="text-sm font-medium">Banner Image</label>
          <div className="space-y-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="cursor-pointer w-full"
            />
            {formData.banner_image && (
              <img
                src={formData.banner_image}
                alt="Preview"
                className="w-full h-80 object-cover rounded border"
              />
            )}
          </div>
        </div>

        {/* Target URL */}
        <div>
          <label className="text-sm font-medium">Target URL</label>
          <Input
            name="target_url"
            value={formData.target_url}
            onChange={handleInputChange}
            placeholder="Enter target URL"
            className="w-full"
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleInputChange}
            className="h-4 w-4"
          />
          <label className="text-sm font-medium">Active</label>
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
            disabled={loading}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 flex justify-center items-center"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : isEditing ? (
              "Update Banner"
            ) : (
              "Create Banner"
            )}
          </Button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default BannerFormPage;
