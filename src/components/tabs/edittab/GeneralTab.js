"use client";
import { useEffect, useRef } from "react";
import $ from "jquery";
import "popper.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { FileText, Globe, Video, SlidersHorizontal } from "lucide-react";

import "bootstrap/dist/css/bootstrap.min.css";
import "summernote/dist/summernote-bs4.css";
import "summernote/dist/summernote-bs4.js";

import { FormSection, Field, ToggleSwitch, inputCls, textareaCls } from "./formTheme ";

const GeneralTab = ({ data, updateData }) => {
  const descriptionEditorRef = useRef(null);
  // Content to load into the editor when it first mounts
  const initialDescription = useRef(data.description || "");

  // Initialise Summernote ONCE. (It used to re-initialise on every keystroke,
  // which reset the cursor and stacked up duplicate editors.)
  useEffect(() => {
    const $editor = $(descriptionEditorRef.current);
    if (typeof $editor.summernote !== "function") return undefined;

    $editor.summernote({
      placeholder: "Enter description...",
      tabsize: 2,
      height: 220,
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
          $editor.summernote("code", initialDescription.current);
        },
      },
    });

    return () => {
      try {
        $editor.summernote("destroy");
      } catch (e) {
        /* editor already gone */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate slug when name changes
  useEffect(() => {
    if (data.name) {
      const generatedSlug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      if (generatedSlug !== data.slug) {
        updateData("slug", generatedSlug);
      }
    } else if (data.slug) {
      updateData("slug", "");
    }
  }, [data.name, data.slug, updateData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateData(name, type === "checkbox" ? checked : value);
  };

  const handleToggle = (name) => {
    updateData(name, !data[name]);
  };

  const toggles = [
    ["status", "Status"],
    ["new", "New"],
    ["featured", "Featured"],
    ["top_selling", "Top Selling"],
    ["sale", "On Sale"],
  ];

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="grid w-full min-w-0 max-w-full grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]"
    >
      {/* Main content */}
      <div className="min-w-0 max-w-full space-y-6 [&>*]:min-w-0 [&>*]:max-w-full">
        <FormSection
          icon={FileText}
          title="Basic information"
          description="Name, slug and descriptions shown on the product page"
        >
          <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 [&>*]:min-w-0">
            <Field label="Name" htmlFor="name" required>
              <input
                type="text"
                id="name"
                name="name"
                value={data.name || ""}
                onChange={handleChange}
                className={`${inputCls} w-full min-w-0 max-w-full`}
                placeholder="Product name"
                required
              />
            </Field>

            <Field
              label="Slug"
              htmlFor="slug"
              required
              hint="Generated automatically from the name"
            >
              <input
                type="text"
                id="slug"
                name="slug"
                value={data.slug || ""}
                onChange={handleChange}
                className={`${inputCls} w-full min-w-0 max-w-full`}
                placeholder="Auto-generated slug"
                required
              />
            </Field>
          </div>

          <Field
            label="Short description"
            htmlFor="short_description"
            className="mt-5 min-w-0"
          >
            <textarea
              id="short_description"
              name="short_description"
              className={`${textareaCls} w-full min-w-0 max-w-full`}
              rows={4}
              placeholder="Enter a short description..."
              value={data.short_description || ""}
              onChange={handleChange}
            />
          </Field>

          <Field
            label="Description"
            htmlFor="description"
            className="mt-5 min-w-0"
          >
            {/* Keep the editor and its toolbar within the column */}
            <div
              className="
                min-w-0 max-w-full
                [&_.note-editor]:min-w-0
                [&_.note-editor]:max-w-full
                [&_.note-toolbar]:flex
                [&_.note-toolbar]:flex-wrap
                [&_.note-editable]:break-words
                [&_.note-editable]:[overflow-wrap:anywhere]
                [&_.note-editable_img]:max-w-full
                [&_.note-editable_video]:max-w-full
                [&_.note-editable_iframe]:max-w-full
              "
            >
              <textarea
                ref={descriptionEditorRef}
                id="description"
                name="description"
                className="hidden"
              />
            </div>
          </Field>
        </FormSection>

        <FormSection
          icon={Globe}
          title="SEO"
          description="How this product appears in search results"
        >
          <div className="min-w-0 space-y-5 [&>*]:min-w-0">
            <Field label="Meta title" htmlFor="meta_title">
              <input
                type="text"
                id="meta_title"
                name="meta_title"
                value={data.meta_title || ""}
                onChange={handleChange}
                className={`${inputCls} w-full min-w-0 max-w-full`}
                placeholder="Meta title for SEO"
              />
            </Field>

            <Field label="Meta description" htmlFor="meta_description">
              <textarea
                id="meta_description"
                name="meta_description"
                value={data.meta_description || ""}
                onChange={handleChange}
                rows={3}
                className={`${textareaCls} w-full min-w-0 max-w-full`}
                placeholder="Meta description for SEO"
              />
            </Field>

            <Field label="Meta keywords" htmlFor="meta_keywords">
              <input
                type="text"
                id="meta_keywords"
                name="meta_keywords"
                value={data.meta_keywords || ""}
                onChange={handleChange}
                className={`${inputCls} w-full min-w-0 max-w-full`}
                placeholder="Comma separated keywords"
              />
            </Field>
          </div>
        </FormSection>
      </div>

      {/* Settings column */}
      <div className="min-w-0 max-w-full space-y-6 [&>*]:min-w-0 [&>*]:max-w-full">
        <FormSection
          icon={SlidersHorizontal}
          title="Product settings"
          description="Visibility and highlight flags"
        >
          <div className="min-w-0 space-y-2.5 [&>*]:min-w-0 [&>*]:max-w-full">
            {toggles.map(([key, label]) => (
              <ToggleSwitch
                key={key}
                name={key}
                label={label}
                checked={!!data[key]}
                onChange={() => handleToggle(key)}
              />
            ))}
          </div>
        </FormSection>

        <FormSection
          icon={Video}
          title="Video"
          description="Optional product video"
        >
          <Field label="Video URL" htmlFor="video_url">
            <input
              type="url"
              id="video_url"
              name="video_url"
              value={data.video_url || ""}
              onChange={handleChange}
              className={`${inputCls} w-full min-w-0 max-w-full`}
              placeholder="https://example.com/video"
            />
          </Field>
        </FormSection>
      </div>
    </form>
  );
};

export default GeneralTab;