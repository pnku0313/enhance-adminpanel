"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Calendar } from "lucide-react";

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

export default function EditSeason() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [is_active, setIsActive] = useState("1");
  const navigate = useNavigate();

  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const itemsPerPage = parseInt(searchParams.get("per_page") || "10", 10);

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  // Fetch season data
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/seasons/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const season = data.data[0];
        setName(season.name || "");
        setSlug(season.slug || "");
        setIsActive(season.is_active?.toString() || "1");
      })
      .catch((err) => {
        console.error("Error loading season:", err);
        toast.error("Failed to load season details ❌");
      });
  }, [id]);

  // Auto-update slug when name changes
  useEffect(() => {
    setSlug(generateSlug(name));
  }, [name]);

  const handleUpdate = (e) => {
    e.preventDefault();

    const updatedSeason = {
      name,
      slug,
      is_active: parseInt(is_active),
    };

    fetch(`http://127.0.0.1:8000/api/seasons/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(updatedSeason),
    })
      .then((res) => res.json())
      .then((data) => {
        toast.success("Season updated successfully!", {
          position: "top-right",
          autoClose: 2000,
        });
        setTimeout(() => {
          navigate(`/seasons?page=${initialPage}&per_page=${itemsPerPage}`);
        }, 2200);
      })
      .catch((err) => {
        console.error("Error updating season:", err);
        toast.error("Failed to update season ❌", {
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
                Variants / Seasons
              </p>
              <h1 className="mt-1 break-words text-2xl font-semibold text-card-foreground">
                Edit Season
              </h1>
              {slug && (
                <p className="mt-1 font-mono text-xs text-muted-foreground">Slug: {slug}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate(`/seasons?page=${initialPage}&per_page=${itemsPerPage}`)}
                className="px-4 py-2 rounded-xl border border-slate-300/80 dark:border-white/20 bg-white/50 dark:bg-white/5 text-sm font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className={glassCard + " rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/20 p-6 space-y-6"}>
            {/* Season Name */}
            <Field label="Season Name" htmlFor="name" required>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputCls}
                placeholder="Enter season name"
              />
            </Field>

            {/* Slug */}
            <Field label="Slug" htmlFor="slug">
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(generateSlug(e.target.value))}
                readOnly
                className={inputCls}
                placeholder="Auto-generated slug"
              />
            </Field>

            {/* Status */}
            <Field label="Status" htmlFor="is_active">
              <select
                id="is_active"
                value={is_active}
                onChange={(e) => setIsActive(e.target.value)}
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
                Update Season
              </button>
            </div>
          </div>
        </form>

        <ToastContainer theme="colored" />
      </div>
    </div>
  );
}