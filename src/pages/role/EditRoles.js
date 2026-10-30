// src/pages/roles/EditRole.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { clsx } from "clsx";
import { Shield, ShieldCheck, KeyRound, Lock } from "lucide-react";

import {
  FormShell,
  FormField,
  FormLoading,
  TextInput,
  FormActions,
  slugify,
  primaryGradient,
} from "../../components/common/CategoryFormUi";
import PermissionPicker, {
  usePermissions,
  isSuccess,
  parseRoleErrors,
} from "../../components/common/Rolepermissionspicker";

const API_BASE = "http://127.0.0.1:8000/api/roles";

export default function EditRole() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [errors, setErrors] = useState({});
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const { permissions, loading, failed, reload } = usePermissions();

  const slug = slugify(name);

  const fetchRole = useCallback(async () => {
    try {
      setFetching(true);
      setLoadError(false);
      const res = await fetch(`${API_BASE}/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (!res.ok || !data.data) throw new Error(data?.message || "Failed to load role data.");

      setName(data.data.name || "");
      setSelectedPermissions((data.data.permissions || []).map((p) => (typeof p === "object" ? p.id : p)));
    } catch (err) {
      console.error("Error fetching role:", err);
      setLoadError(true);
      toast.error("Failed to load role data.");
    } finally {
      setFetching(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchRole();
  }, [id, fetchRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrors({ name: "Role name is required." });
      toast.error("Role name is required.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
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
        toast.success(data.message || "Role updated successfully!");
        setTimeout(() => navigate("/roles"), 800);
      } else {
        const parsed = parseRoleErrors(data);
        setErrors(parsed);
        toast.error(parsed.name || parsed.permissions || data.message || "Failed to update role ❌");
      }
    } catch (err) {
      console.error("Error updating role:", err);
      toast.dismiss();
      toast.error("Something went wrong ❌");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <FormShell
        title="Edit Role"
        subtitle="Update this role and its permissions."
        icons={[Shield, ShieldCheck, KeyRound, Lock]}
      >
        {fetching ? (
          <FormLoading />
        ) : loadError ? (
          <div className="py-10 text-center">
            <p className="font-medium text-foreground">Couldn't load this role</p>
            <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/roles")}
                className="h-10 rounded-lg border border-border px-5 text-sm font-medium text-foreground hover:bg-primary/5 transition-colors"
              >
                Back to roles
              </button>
              <button
                type="button"
                onClick={fetchRole}
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
              <FormField label="Slug" htmlFor="slug" hint="Updates automatically when you change the name">
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
              submitLabel="Update Role"
              loadingLabel="Updating..."
              loading={saving}
            />
          </form>
        )}
      </FormShell>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  );
}