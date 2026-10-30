import React, { useState } from "react";
import { Download, Upload, FileSpreadsheet } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UploadBrandPage = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    file: null,
    brandName: "",
    slug: "",
    brandStatus: "1", // default active
  });
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "brandName") {
        return {
          ...prev,
          brandName: value,
          slug: generateSlug(value),
        };
      }
      if (name === "slug") {
        return {
          ...prev,
          slug: generateSlug(value),
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleFileChange = (file) => {
    if (
      file &&
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      setFormData((prev) => ({
        ...prev,
        file: file,
      }));
    } else {
      alert("Please select a valid XLSX file");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.file) {
      alert("Please select an XLSX file");
      return;
    }
    if (onSubmit) onSubmit(formData);
    handleCancel();
  };

  const handleCancel = () => {
    setFormData({
      file: null,
      brandName: "",
      slug: "",
      brandStatus: "1",
    });
    navigate("/brands");
  };

  const downloadSample = () => {
    const sampleData = [
      ["Brand Name", "Slug", "Description", "Status"],
      ["Sample Brand 1", "sample-brand-1", "Sample description 1", "active"],
      ["Sample Brand 2", "sample-brand-2", "Sample description 2", "inactive"],
    ];

    const csvContent = sampleData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "brand_sample.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 text-red-600">
        Upload Brands
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6  p-4 sm:p-6 rounded-lg "
      >
        {/* File requirements box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <FileSpreadsheet className="text-blue-600" size={20} />
            <span className="text-sm font-medium text-blue-800">
              File Requirements
            </span>
          </div>
          <p className="text-sm text-blue-700 mb-3">
            Field must be in XLSX format. Download the sample file to see the
            required format.
          </p>
          <button
            type="button"
            onClick={downloadSample}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
          >
            <Download size={16} />
            <span>Download Sample File</span>
          </button>
        </div>

        {/* File upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
            Upload XLSX File *
          </label>
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center ${
              dragActive
                ? "border-red-600 hover:bg-red-500 bg-red-50"
                : "border-red-300"
            } ${formData.file ? "bg-green-50 border-green-300" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => handleFileChange(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-2">
              <Upload
                className={`mx-auto h-12 w-12 ${
                  formData.file ? "text-green-500" : "text-gray-400"
                }`}
              />
              {formData.file ? (
                <div>
                  <p className="text-sm font-medium text-green-700">
                    {formData.file.name}
                  </p>
                  <p className="text-xs text-green-600">
                    File selected successfully
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">XLSX files only</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
            Default Brand Name
          </label>
          <input
            type="text"
            name="brandName"
            value={formData.brandName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter default brand name (optional)"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
            Default Slug
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Auto-generated slug"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
            Default Brand Status
          </label>
          <select
            name="brandStatus"
            value={formData.brandStatus}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0 pt-4">
          <button
            type="submit"
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Upload Brands
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadBrandPage;
