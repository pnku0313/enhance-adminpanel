"use client";
import { useEffect, useRef } from "react";
import $ from "jquery";


import "bootstrap/dist/css/bootstrap.min.css";
import "summernote/dist/summernote-bs4.css";
import "summernote/dist/summernote-bs4.js";

const RichTextEditor = ({ value = "", onChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    const $editor = $(editorRef.current);

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
            if (typeof onChange === "function") {
              onChange(contents);
            } else {
              console.warn("RichTextEditor: onChange is not a function");
            }
          },
          onInit: function () {
            $(".note-editable").css({
              backgroundColor: "transparent",
              color: "#000000",
            });
          },
          onFocus: function () {
            $(".note-editable").css({
              backgroundColor: "transparent",
              color: "#000000",
            });
          },
        },
      });

      $editor.summernote("code", value);
    }

    return () => {
      if ($editor.hasClass("summernote")) {
        $editor.summernote("destroy");
      }
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && $(editorRef.current).summernote) {
      const currentContent = $(editorRef.current).summernote("code");
      if (value !== currentContent) {
        $(editorRef.current).summernote("code", value);
      }
    }
  }, [value]);

  return <textarea ref={editorRef} />;
};

export default RichTextEditor;
