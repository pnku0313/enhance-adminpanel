"use client";
import { useEffect, useRef } from "react";
import $ from "jquery";
import "popper.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "bootstrap/dist/css/bootstrap.min.css";
import "summernote/dist/summernote-bs4.css";
import "summernote/dist/summernote-bs4.js";

const GeneralTab = ({ data, updateData }) => {
  const descriptionEditorRef = useRef(null);

  // ✅ Initialize Summernote once
  useEffect(() => {
    const $editor = $(descriptionEditorRef.current);

    if (typeof $editor.summernote === "function") {
      $editor.summernote({
        placeholder: "Enter description...",
        tabsize: 2,
        height: 200,
        toolbar: [
          ["style", ["bold", "italic", "underline", "clear"]],
          ["para", ["ul", "ol", "paragraph"]],
          ["insert", ["link", "picture"]],
          ["view", ["codeview"]],
        ],
        callbacks: {
          onChange: function (contents) {
            updateData("description", contents);
          },
          onInit: function () {
            $(".note-editable").css({
              backgroundColor: "transparent",
              color: "#000000",
            });

            if (data.description) {
              $editor.summernote("code", data.description);
            }
          },
        },
      });
    }

    return () => {
      if ($editor.hasClass("summernote")) {
        $editor.summernote("destroy");
      }
    };
  }, []);

  // ✅ Slug auto generation
  useEffect(() => {
    if (data.name) {
      const generatedSlug = data.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-") // convert spaces & special chars
        .replace(/(^-|-$)+/g, ""); // remove trailing dashes
      updateData("slug", generatedSlug);
    }
  }, [data.name]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateData(name, type === "checkbox" ? checked : value);
  };

  const handleToggle = (name) => {
    updateData(name, !data[name]);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <form className="shadow-md rounded-lg p-8 bg-transparent dark:text-white">
        {/* Name + Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={data.name || ""}
              onChange={(e) => updateData("name", e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              placeholder="Product name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input
              type="text"
              name="slug"
              value={data.slug || ""}
              onChange={(e) => updateData("slug", e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              placeholder="Auto-generated slug"
              required
            />
          </div>
        </div>

        {/* Short Description */}
        <div className="mb-6">
          <label
            htmlFor="short_description"
            className="block text-sm font-medium mb-1"
          >
            Short Description
          </label>
          <textarea
            id="short_description"
            name="short_description"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Enter a short description..."
            value={data.short_description || ""}
            onChange={(e) => updateData("short_description", e.target.value)}
          ></textarea>
        </div>

        {/* Description with Summernote */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            ref={descriptionEditorRef}
            name="description"
            className="hidden"
            defaultValue={data.description || ""}
          ></textarea>
        </div>

        {/* Video URL */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Video URL</label>
          <input
            type="url"
            name="video_url"
            value={data.video_url || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            placeholder="https://example.com/video"
          />
        </div>

        {/* SEO */}
        <div className="mb-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Meta Title</label>
            <input
              type="text"
              name="meta_title"
              value={data.meta_title || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
              placeholder="Meta title for SEO"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Meta Description
            </label>
            <textarea
              name="meta_description"
              value={data.meta_description || ""}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border rounded-md"
              placeholder="Meta description for SEO"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Meta Keywords
            </label>
            <input
              type="text"
              name="meta_keywords" // ✅ fixed to match backend
              value={data.meta_keywords || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
              placeholder="Comma separated keywords"
            />
          </div>
        </div>

        {/* Toggle Buttons */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6 pb-2 border-b dark:text-white dark:border-gray-700">
            Product Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {[
              ["status", "Status"],
              ["new", "New"],
              ["featured", "Featured"],
              ["top_selling", "Top Selling"],
              ["sale", "On Sale"],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center dark:text-white">
                <label className="toggle-button mt-2">
                  <input
                    type="checkbox"
                    name={key}
                    checked={data[key] || false}
                    onChange={() => handleToggle(key)}
                  />
                  <span className="slider"></span>
                </label>
                <span className="toggle-label ml-2">
                  {label}: {data[key] ? "Yes" : "No"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default GeneralTab;
