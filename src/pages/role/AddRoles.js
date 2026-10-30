// src/pages/roles/AddRoles.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Shield, ShieldCheck, KeyRound, Lock } from "lucide-react";

import {
  FormShell,
  FormField,
  TextInput,
  FormActions,
  slugify,
} from "../../components/common/CategoryFormUi";
import PermissionPicker, {
  usePermissions,
  isSuccess,
  parseRoleErrors,
} from "../../components/common/Rolepermissionspicker";

const API_URL = "http://127.0.0.1:8000/api/roles";

export default function AddRoles() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({});
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [saving, setSaving] = useState(false);
  const { permissions, loading, failed, reload } = usePermissions();

  const slug = slugify(name);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrors({ name: "Role name is required." });
      toast.error("Role name is required.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name, slug, permissions: selectedPermissions }),
      });
      const data = await res.json().catch(() => ({}));

      toast.dismiss();
      if (isSuccess(res, data)) {
        setErrors({});
        toast.success(data.message || "Role created successfully!");
        setTimeout(() => navigate("/roles"), 800);
      } else {
        const parsed = parseRoleErrors(data);
        setErrors(parsed);
        toast.error(parsed.name || parsed.permissions || data.message || "Failed to create role ❌");
      }
    } catch (err) {
      console.error("Error saving role:", err);
      toast.dismiss();
      toast.error("Something went wrong ❌");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <FormShell
        title="Add Role"
        subtitle="Create a role and choose what it can access."
        icons={[Shield, ShieldCheck, KeyRound, Lock]}
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {errors.general && (
            <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-300">
              {errors.general}
            </p>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField label="Role name" htmlFor="name" required error={errors.name}>
              <TextInput
                id="name"
                name="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                }}
                placeholder="Enter role name"
                invalid={!!errors.name}
              />
            </FormField>
            <FormField label="Slug" htmlFor="slug" hint="Generated automatically from the name">
              <TextInput id="slug" name="slug" value={slug} readOnly />
            </FormField>
          </div>

          <FormField label="Assign permissions" htmlFor="permissions">
            <PermissionPicker
              permissions={permissions}
              loading={loading}
              failed={failed}
              onRetry={reload}
              selected={selectedPermissions}
              onChange={setSelectedPermissions}
              error={errors.permissions}
            />
          </FormField>

          <FormActions
            onCancel={() => navigate("/roles")}
            submitLabel="Save Role"
            loadingLabel="Saving..."
            loading={saving}
          />
        </form>
      </FormShell>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  );
}