import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import { clsx } from "clsx";
import { Percent, Tag, Ticket, Gift } from "lucide-react";

import {
  FormShell,
  FormField,
  FormLoading,
  TextInput,
  SelectInput,
  FormActions,
  showSwalLoading,
  glassInput,
  primaryGradient,
} from "../../components/common/CategoryFormUi";

const API_BASE = "http://127.0.0.1:8000/api";
// Native date picker icon is invisible on dark backgrounds without this
const dateCls = "[color-scheme:light] dark:[color-scheme:dark]";

const EditDiscountPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fetching, setFetching] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "",
    type: "PERCENTAGE",
    amount: "",
    start_date: "",
    end_date: "",
    active: true,
  });

  const fetchDiscount = useCallback(async () => {
    try {
      setFetching(true);
      setLoadError(false);
      const response = await axios.get(`${API_BASE}/discounts/${id}`);
      const d = response.data.data;

      setForm({
        name: d.name || "",
        type: d.type || "PERCENTAGE",
        amount: d.amount ?? "",
        // <input type="date"> needs YYYY-MM-DD, so trim an ISO date-time if the API sends one
        start_date: d.start_date ? String(d.start_date).slice(0, 10) : "",
        end_date: d.end_date ? String(d.end_date).slice(0, 10) : "",
        active: [true, 1, "1", "true"].includes(d.active),
      });
    } catch (error) {
      console.error("Error fetching discount:", error);
      setLoadError(true);
      toast.error("Failed to fetch discount details.");
    } finally {
      setFetching(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDiscount();
  }, [fetchDiscount]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Discount name is required.";
    if (!form.amount || Number(form.amount) <= 0) next.amount = "Please enter a valid discount amount.";
    if (!form.start_date) next.start_date = "Start date is required.";
    if (!form.end_date) next.end_date = "End date is required.";
    setErrors(next);
    const first = Object.values(next)[0];
    if (first) toast.error(first);
    return !first;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      showSwalLoading("Updating Discount...", "Please wait while we save your changes.");

      await axios.put(
        `${API_BASE}/discounts/${id}`,
        { ...form, name: form.name.trim() },
        { headers: { "Content-Type": "application/json" } }
      );

      Swal.close();
      toast.success("Discount updated successfully!");
      setTimeout(() => navigate("/discounts"), 500);
    } catch (error) {
      Swal.close();
      console.error("Update API Error:", error);
      toast.error(error.response?.data?.message || "Failed to update discount. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // The add page saves "percentage" and this page uses "PERCENTAGE": match either
  // for display, but only change the saved value if the user picks a new type.
  const typeKey = String(form.type || "").toUpperCase();

  return (
    <>
      <FormShell
        title="Edit Discount"
        subtitle="Update the details of this discount."
        icons={[Percent, Tag, Ticket, Gift]}
      >
        {fetching ? (
          <FormLoading />
        ) : loadError ? (
          <div className="py-10 text-center">
            <p className="font-medium text-foreground">Couldn't load this discount</p>
            <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/discounts")}
                className="h-10 rounded-lg border border-border px-5 text-sm font-medium text-foreground hover:bg-primary/5 transition-colors"
              >
                Back to discounts
              </button>
              <button
                type="button"
                onClick={fetchDiscount}
                className={clsx(
                  "h-10 rounded-lg px-5 text-sm font-semibold text-white bg-gradient-to-r shadow-lg shadow-indigo-500/30",
                  primaryGradient
                )}
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField label="Discount name" htmlFor="name" required error={errors.name}>
                <TextInput
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter discount name"
                  invalid={!!errors.name}
                />
              </FormField>

              <FormField label="Discount type" htmlFor="type" required>
                <SelectInput id="type" name="type" value={typeKey} onChange={handleChange}>
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed amount (₹)</option>
                </SelectInput>
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                label="Amount"
                htmlFor="amount"
                required
                error={errors.amount}
                hint={typeKey === "PERCENTAGE" ? "Percentage value, e.g. 10 for 10%" : "Amount in rupees"}
              >
                <TextInput
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="Enter discount amount"
                  invalid={!!errors.amount}
                />
              </FormField>

              <FormField label="Start date" htmlFor="start_date" required error={errors.start_date}>
                <TextInput
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={form.start_date}
                  onChange={handleChange}
                  invalid={!!errors.start_date}
                  className={dateCls}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField label="End date" htmlFor="end_date" required error={errors.end_date}>
                <TextInput
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={form.end_date}
                  onChange={handleChange}
                  invalid={!!errors.end_date}
                  className={dateCls}
                />
              </FormField>

              <FormField label="Status" htmlFor="active">
                <label
                  htmlFor="active"
                  className={clsx(
                    "flex h-10 w-full cursor-pointer select-none items-center justify-between rounded-lg px-3 text-sm text-foreground transition-colors hover:bg-primary/5",
                    glassInput
                  )}
                >
                  <span>{form.active ? "Active" : "Inactive"}</span>
                  <input
                    id="active"
                    name="active"
                    type="checkbox"
                    checked={form.active}
                    onChange={handleChange}
                    className="h-4 w-4 rounded accent-primary"
                  />
                </label>
              </FormField>
            </div>

            <FormActions
              onCancel={() => navigate("/discounts")}
              submitLabel="Save Changes"
              loadingLabel="Saving..."
              loading={saving}
            />
          </form>
        )}
      </FormShell>
      <ToastContainer theme="colored" />
    </>
  );
};

export default EditDiscountPage;