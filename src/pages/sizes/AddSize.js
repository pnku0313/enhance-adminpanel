"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Ruler } from "lucide-react";

import {
  FORM_CSS,
  WaveBackground,
  glassCard,
  hairline,
  primaryGradient,
  gradientBtn,
  FormSection,
  Field,
  inputCls,
  selectCls,
} from "./formTheme";

export default function AddSize() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("1");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const newSize = {
      name,
      status: parseInt(status),
    };

    fetch("http://127.0.0.1:8000/api/product-sizes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSize),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          toast.success("Size saved successfully ✅", {
            position: "top-right",
            autoClose: 2000,
          });
          setTimeout(() => {
            navigate("/sizes");
          }, 2200);
        } else {
          toast.error(data.message || "Failed to save size ❌", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      })
      .catch((err) => {
        console.error("Error saving size:", err);
        toast.error("Something went wrong ❌", {
          position: "top-right",
          autoClose: 3000,
        });
      });
  };

  return (
    <div className="pp-form pp-view">
      <style>{FORM_CSS}</style>
      <div className="mx-auto w-full max-w-[90rem] space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* HEADER */}
        <div
          className={glassCard + " relative overflow-hidden rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/20"}
        >
          <WaveBackground />
          <div className="relative z-10 flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Variants / Sizes
              </p>
              <h1 className="mt-1 break-words text-2xl font-semibold text-card-foreground">
                Add Size
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate("/sizes")}
                className="px-4 py-2 rounded-xl border border-slate-300/80 dark:border-white/20 bg-white/50 dark:bg-white/5 text-sm font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={glassCard + " rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/20 p-6 space-y-6"}>
            {/* Size Name */}
            <Field label="Size Name" htmlFor="name" required>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputCls}
                placeholder="Enter size name (e.g., S, M, L, XL)"
              />
            </Field>

            {/* Status */}
            <Field label="Status" htmlFor="status">
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={selectCls}
              >
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </Field>

            {/* Submit Button */}
            <div className="pt-4 border-t dark:border-white/10">
              <button
                type="submit"
                className={gradientBtn + " px-6 py-3 rounded-xl font-medium"}
              >
                Save Size
              </button>
            </div>
          </div>
        </form>

        <ToastContainer theme="colored" />
      </div>
    </div>
  );
}