"use client";

import { useRef } from "react";

const ImageUpload = ({
  onUpload,
  currentImage,
  currentImages,
  single = false,
  multiple = false,
}) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      if (single) {
        onUpload(files[0]);
      } else {
        onUpload(files);
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-upload">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        multiple={multiple}
        style={{ display: "none" }}
      />

      <div className="upload-area" onClick={triggerFileSelect}>
        <div className="upload-content">
          <div className="upload-icon">📷</div>
          <p className="upload-text">
            {single ? "Click to upload image" : "Click to upload images"}
          </p>
          <p className="upload-subtext">JPG, PNG, WebP up to 5MB</p>
        </div>
      </div>

      <button
        type="button"
        className="btn btn-secondary btn-sm mt-2"
        onClick={triggerFileSelect}
      >
        {single ? "Choose Image" : "Choose Images"}
      </button>
    </div>
  );
};

export default ImageUpload;
