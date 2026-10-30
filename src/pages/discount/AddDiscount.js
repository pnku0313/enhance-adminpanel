import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import { clsx } from "clsx";
import { Percent, Tag, Ticket, Gift } from "lucide-react";

import {
  FormShell,
  FormField,
  TextInput,
  SelectInput,
  FormActions,
  showSwalLoading,
  glassInput,
} from "../../components/common/CategoryFormUi";

const API_BASE = "http://127.0.0.1:8000/api";
// Native date picker icon is invisible on dark backgrounds without this
const dateCls = "[color-scheme:light] dark:[color-scheme:dark]";

const AddDiscountPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "",
    type: "percentage",
    amount: "",
    start_date: "",
    end_date: "",
    active: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Please enter discount name";
    if (!form.amount || Number(form.amount) <= 0) next.amount = "Please enter a valid discount amount";
    if (!form.start_date) next.start_date = "Please select a start date";
    if (!form.end_date) next.end_date = "Please select an end date";
    setErrors(next);
    const first = Object.values(next)[0];
    if (first) toast.error(first);
    return !first;
  };

  const handleAddDiscount = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const newDiscount = {
      name: form.name.trim(),
      type: form.type,
      amount: Number(form.amount),
      start_date: form.start_date,
      end_date: form.end_date,
      active: form.active ? 1 : 0,
    };

    try {
      setLoading(true);
      showSwalLoading("Saving Discount...", "Please wait while we save your discount.");

      await axios.post(`${API_BASE}/discounts`, newDiscount, {
        headers: { "Content-Type": "application/json" },
      });

      Swal.close();
      toast.success("Discount added successfully!");
      setTimeout(() => navigate("/discounts"), 500);
    } catch (error) {
      Swal.close();
      console.error("API Error:", error);
      toast.error(error.response?.data?.message || "Failed to add discount. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FormShell
        title="Add New Discount"
        subtitle="Fill in the details below to create a new discount."
        icons={[Percent, Tag, Ticket, Gift]}
      >
        <form onSubmit={handleAddDiscount} noValidate className="space-y-6">
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
              <SelectInput id="type" name="type" value={form.type} onChange={handleChange}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed amount (₹)</option>
              </SelectInput>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              label="Amount"
              htmlFor="amount"
              required
              error={errors.amount}
              hint={form.type === "percentage" ? "Percentage value, e.g. 10 for 10%" : "Amount in rupees"}
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
            onCancel={() => navigate(-1)}
            submitLabel="Add Discount"
            loadingLabel="Saving..."
            loading={loading}
          />
        </form>
      </FormShell>
      <ToastContainer theme="colored" />
    </>
  );
};

export default AddDiscountPage;