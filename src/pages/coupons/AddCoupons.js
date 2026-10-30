"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Ticket, Percent, Gift, Tag } from "lucide-react";
import {
  FormShell, FormField, TextInput, SelectInput, FormActions,
} from "../../components/common/CategoryFormUi";
import "react-toastify/dist/ReactToastify.css";

const API = "http://127.0.0.1:8000/api/coupons";
const ICONS = [Ticket, Percent, Gift, Tag];
const today = () => new Date().toISOString().split("T")[0];

const emptyCoupon = () => ({
  code: "",
  name: "",
  type: "percentage",
  value: "",
  usageLimit: 0,
  minCart: 0,
  startDate: today(),
  endDate: "",
});

const AddCouponPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formCoupon, setFormCoupon] = useState(emptyCoupon());

  const set = (field, value) => setFormCoupon((prev) => ({ ...prev, [field]: value }));
  // "" while empty so the field shows its placeholder instead of a stuck 0
  const setNumber = (field) => (e) => set(field, e.target.value === "" ? 0 : Number(e.target.value));
  const showNumber = (n) => (n === 0 ? "" : n);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formCoupon.name.trim()) return toast.error("Coupon name is required.");
    if (!formCoupon.code.trim()) return toast.error("Coupon code is required.");
    if (!formCoupon.type.trim()) return toast.error("Discount type is required.");
    if (formCoupon.value === "" || Number(formCoupon.value) <= 0) return toast.error("Discount value is required.");
    if (formCoupon.type === "percentage" && Number(formCoupon.value) > 100) {
      return toast.error("A percentage discount can't be more than 100.");
    }
    if (formCoupon.endDate && formCoupon.endDate < formCoupon.startDate) {
      return toast.error("End date can't be before the start date.");
    }

    const payload = {
      coupon_name: formCoupon.name.trim(),
      coupon_code: formCoupon.code.trim(),
      discount_type: formCoupon.type,
      discount_value: Number(formCoupon.value),
      date_from: formCoupon.startDate,
      date_to: formCoupon.endDate,
      no_uses_allowed: Number(formCoupon.usageLimit),
      no_of_uses: 0,
      min_amount: Number(formCoupon.minCart),
    };

    setLoading(true);
    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to add coupon");

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: `Coupon ${formCoupon.code} has been added successfully!`,
        timer: 1600,
        showConfirmButton: false,
        customClass: { popup: "bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl" },
      });

      setFormCoupon(emptyCoupon());
      navigate("/coupons");
    } catch (error) {
      console.error("API Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Something went wrong!",
        customClass: { popup: "bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl" },
      });
    } finally {
      setLoading(false);
    }
  };

  const isPercent = formCoupon.type === "percentage";

  return (
    <FormShell title="Add new coupon" subtitle="Create a discount coupon for your customers" icons={ICONS}>
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField label="Coupon code" htmlFor="code" required>
            <TextInput
              id="code"
              placeholder="Enter coupon code"
              value={formCoupon.code}
              onChange={(e) => set("code", e.target.value)}
              className="font-mono"
            />
          </FormField>

          <FormField label="Coupon name" htmlFor="name" required>
            <TextInput
              id="name"
              placeholder="Enter coupon name"
              value={formCoupon.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </FormField>

          <FormField label="Discount type" htmlFor="type" required>
            <SelectInput id="type" value={formCoupon.type} onChange={(e) => set("type", e.target.value)}>
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed amount (₹)</option>
            </SelectInput>
          </FormField>

          <FormField
            label={`Value (${isPercent ? "%" : "₹"})`}
            htmlFor="value"
            required
            hint={isPercent ? "Between 1 and 100." : "Amount taken off the cart."}
          >
            <TextInput
              id="value"
              type="number"
              min="0"
              placeholder="0"
              value={formCoupon.value}
              onChange={(e) => set("value", e.target.value)}
            />
          </FormField>

          <FormField label="Usage limit" htmlFor="usageLimit" hint="How many times this coupon can be used.">
            <TextInput
              id="usageLimit"
              type="number"
              min="0"
              placeholder="0"
              value={showNumber(formCoupon.usageLimit)}
              onChange={setNumber("usageLimit")}
            />
          </FormField>

          <FormField label="Min cart value (₹)" htmlFor="minCart" hint="Cart total needed to use this coupon.">
            <TextInput
              id="minCart"
              type="number"
              min="0"
              placeholder="0"
              value={showNumber(formCoupon.minCart)}
              onChange={setNumber("minCart")}
            />
          </FormField>

          <FormField label="Start date" htmlFor="startDate">
            <TextInput id="startDate" type="date" value={formCoupon.startDate} onChange={(e) => set("startDate", e.target.value)} />
          </FormField>

          <FormField label="End date" htmlFor="endDate">
            <TextInput
              id="endDate"
              type="date"
              min={formCoupon.startDate}
              value={formCoupon.endDate}
              onChange={(e) => set("endDate", e.target.value)}
            />
          </FormField>
        </div>

        <FormActions
          onCancel={() => navigate("/coupons")}
          submitLabel="Add coupon"
          loadingLabel="Saving..."
          loading={loading}
        />
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </FormShell>
  );
};

export default AddCouponPage;