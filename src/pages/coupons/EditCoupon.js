// src/pages/coupons/EditCouponPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { clsx } from "clsx";
import { Ticket, Percent, Tag, Gift } from "lucide-react";

import {
  FormShell,
  FormField,
  FormLoading,
  TextInput,
  SelectInput,
  FormActions,
  showSwalLoading,
  primaryGradient,
} from "../../components/common/CategoryFormUi";

const API_BASE = "http://127.0.0.1:8000/api/coupons";

// "2025-03-01T00:00:00.000000Z" -> "2025-03-01" so <input type="date"> shows it
const toDateInput = (v) => (v ? String(v).slice(0, 10) : "");
const today = () => new Date().toISOString().split("T")[0];

const EditCouponPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fetching, setFetching] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    code: "",
    name: "",
    type: "percentage",
    value: "",
    usageLimit: "",
    minCart: "",
    startDate: today(),
    endDate: "",
  });

  const loadCoupon = useCallback(async () => {
    try {
      setFetching(true);
      setLoadError(false);
      const res = await axios.get(`${API_BASE}/${id}`);
      const d = res.data?.data ?? {};
      setForm({
        code: d.coupon_code || "",
        name: d.coupon_name || "",
        type: String(d.discount_type || "percentage").toLowerCase(),
        value: d.discount_value ?? "",
        usageLimit: d.no_uses_allowed ? String(d.no_uses_allowed) : "",
        minCart: d.min_amount ? String(d.min_amount) : "",
        startDate: toDateInput(d.date_from) || today(),
        endDate: toDateInput(d.date_to),
      });
    } catch (error) {
      console.error("Error fetching coupon:", error?.response?.data || error);
      setLoadError(true);
      toast.error("Failed to load coupon data.");
    } finally {
      setFetching(false);
    }
  }, [id]);

  useEffect(() => {
    loadCoupon();
  }, [loadCoupon]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.code.trim()) next.code = "Coupon code is required.";
    if (!form.name.trim()) next.name = "Coupon name is required.";
    if (form.value === "" || Number(form.value) <= 0) next.value = "Enter a value greater than 0.";
    else if (form.type === "percentage" && Number(form.value) > 100) next.value = "A percentage can't exceed 100.";
    if (form.endDate && form.startDate && form.endDate < form.startDate)
      next.endDate = "End date can't be before the start date.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    const payload = {
      coupon_name: form.name,
      coupon_code: form.code,
      discount_value: Number(form.value),
      discount_type: form.type,
      date_from: form.startDate,
      date_to: form.endDate,
      no_uses_allowed: Number(form.usageLimit) || 0,
      min_amount: Number(form.minCart) || 0,
    };

    try {
      setSaving(true);
      showSwalLoading("Updating Coupon...", "Please wait while we save your changes.");
      await axios.put(`${API_BASE}/${id}`, payload);
      Swal.close();
      toast.success("Coupon updated successfully!");
      setTimeout(() => navigate("/coupons"), 500);
    } catch (error) {
      Swal.close();
      console.error("Error updating coupon:", error?.response?.data || error);
      toast.error(error?.response?.data?.message || "Unable to update coupon. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <FormShell
        title="Edit Coupon"
        subtitle="Update the details of this coupon."
        icons={[Ticket, Percent, Tag, Gift]}
      >
        {fetching ? (
          <FormLoading />
        ) : loadError ? (
          <div className="py-10 text-center">
            <p className="font-medium text-foreground">Couldn't load this coupon</p>
            <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/coupons")}
                className="h-10 rounded-lg border border-border px-5 text-sm font-medium text-foreground hover:bg-primary/5 transition-colors"
              >
                Back to coupons
              </button>
              <button
                type="button"
                onClick={loadCoupon}
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField label="Coupon code" htmlFor="code" required error={errors.code}>
                <TextInput
                  id="code"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="e.g. SAVE20"
                  invalid={!!errors.code}
                />
              </FormField>

              <FormField label="Coupon name" htmlFor="name" required error={errors.name}>
                <TextInput
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter coupon name"
                  invalid={!!errors.name}
                />
              </FormField>

              <FormField label="Discount type" htmlFor="type" required>
                <SelectInput id="type" name="type" value={form.type} onChange={handleChange}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed amount (₹)</option>
                </SelectInput>
              </FormField>

              <FormField
                label={form.type === "percentage" ? "Value (%)" : "Value (₹)"}
                htmlFor="value"
                required
                error={errors.value}
              >
                <TextInput
                  id="value"
                  name="value"
                  type="number"
                  min="0"
                  value={form.value}
                  onChange={handleChange}
                  placeholder="0"
                  invalid={!!errors.value}
                />
              </FormField>

              <FormField label="Usage limit" htmlFor="usageLimit" hint="Leave empty for no limit">
                <TextInput
                  id="usageLimit"
                  name="usageLimit"
                  type="number"
                  min="0"
                  value={form.usageLimit}
                  onChange={handleChange}
                  placeholder="0"
                />
              </FormField>

              <FormField label="Min cart value (₹)" htmlFor="minCart" hint="Leave empty for no minimum">
                <TextInput
                  id="minCart"
                  name="minCart"
                  type="number"
                  min="0"
                  value={form.minCart}
                  onChange={handleChange}
                  placeholder="0"
                />
              </FormField>

              <FormField label="Start date" htmlFor="startDate">
                <TextInput id="startDate" name="startDate" type="date" value={form.startDate} onChange={handleChange} />
              </FormField>

              <FormField label="End date" htmlFor="endDate" error={errors.endDate}>
                <TextInput
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={handleChange}
                  invalid={!!errors.endDate}
                />
              </FormField>
            </div>

            <FormActions
              onCancel={() => navigate("/coupons")}
              submitLabel="Update Coupon"
              loadingLabel="Updating..."
              loading={saving}
            />
          </form>
        )}
      </FormShell>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  );
};

export default EditCouponPage;