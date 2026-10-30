"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { X } from "lucide-react";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";

const AddSliderPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    target_url: "",
    button_name: "",
    is_active: false,
    background_image: null,
    rawImage: null,
  });

  const [loading, setLoading] = useState(false);

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
        background_image: URL.createObjectURL(file),
        rawImage: file,
      }));
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      background_image: null,
      rawImage: null,
    }));
  };

  // Validate form
  const validateForm = () => {
    const urlRegex =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;

    if (!formData.rawImage) {
      toast.error("❌ Background image is required.");
      return false;
    }
    if (formData.target_url && !urlRegex.test(formData.target_url)) {
      toast.error("❌ Please enter a valid URL.");
      return false;
    }
    return true;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const data = new FormData();
    data.append("target_url", formData.target_url || "");
    data.append("button_name", formData.button_name || "");
    data.append("is_active", formData.is_active ? 1 : 0);
    if (formData.rawImage) data.append("background_image", formData.rawImage);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/sliders",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("API Response:", response.data);

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "✅ Slider created successfully!",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
      }).then(() => navigate("/content"));
    } catch (error) {
      console.error("API Error:", error.response || error);
      toast.error("❌ Failed to create slider.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">Add Slider</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Background Image */}
        <div>
          <label className="text-sm font-medium">Background Image</label>
          <div className="space-y-2">
            <Input
              type="file"
              accept="image/*"
              required
              onChange={handleImageUpload}
              className="cursor-pointer w-full"
            />
            {formData.background_image && (
              <div className="relative w-full">
                <img
                  src={formData.background_image}
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

        {/* Button Name */}
        <div>
          <label className="text-sm font-medium">Button Name</label>
          <Input
            name="button_name"
            value={formData.button_name}
            onChange={handleInputChange}
            placeholder="Enter button name"
            className="w-full"
          />
        </div>

        {/* Is Active */}
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
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Create Slider"
            )}
          </Button>
        </div>
      </form>

      <ToastContainer />
    </div>
  );
};

export default AddSliderPage;
