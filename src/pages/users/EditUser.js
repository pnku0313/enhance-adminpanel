import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { ToastContainer, toast } from "react-toastify";
import { Eye, EyeOff, Loader2, UserCog, Users, ShieldCheck, KeyRound, User } from "lucide-react";
import { clsx } from "clsx";
import {
  FormShell, FormField, TextInput, SelectInput, FormLoading, primaryGradient, glassInput,
} from "../../components/common/CategoryFormUi";
import "react-toastify/dist/ReactToastify.css";

const API = "http://127.0.0.1:8000/api";
const ICONS = [UserCog, Users, ShieldCheck, KeyRound];

/* Makes react-phone-input-2 look like the other inputs (light + dark) */
const PHONE_CSS = `
.pp-phone .form-control {
  width: 100% !important; height: 40px !important; border-radius: 8px !important;
  background: rgba(255,255,255,0.5) !important; border: 1px solid rgba(0,0,0,0.1) !important;
  color: inherit !important; font-size: 14px !important;
}
.pp-phone .form-control:focus { box-shadow: 0 0 0 2px rgba(99,102,241,0.4) !important; border-color: rgba(99,102,241,0.5) !important; }
.pp-phone .flag-dropdown { border: 1px solid rgba(0,0,0,0.1) !important; background: transparent !important; border-radius: 8px 0 0 8px !important; }
.pp-phone .selected-flag:hover, .pp-phone .selected-flag.open { background: rgba(99,102,241,0.1) !important; }
.pp-phone .country-list { color: #0f172a; border-radius: 12px; }
.dark .pp-phone .form-control { background: rgba(255,255,255,0.1) !important; border-color: rgba(255,255,255,0.15) !important; }
.dark .pp-phone .flag-dropdown { border-color: rgba(255,255,255,0.15) !important; }
`;

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    gender: "",
    address: "",
    country: "",
    state: "",
    city: "",
    zipcode: "",
    status: "1",
    user_type: "",
  });
  // Loaded from the user and sent back unchanged. (The old code kept these as empty
  // states, so every save overwrote the saved coordinates with "".)
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const fetchRoles = async () => {
      try {
        const res = await fetch(`${API}/roles`, { headers });
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) setRoles(data.data || []);
        else toast.error(data.message || "Failed to fetch roles");
      } catch {
        if (!cancelled) toast.error("Error fetching roles");
      }
    };

    const fetchUser = async () => {
      try {
        const res = await fetch(`${API}/users/${id}`, { headers });
        const data = await res.json();
        if (cancelled) return;

        if (res.ok && data.data) {
          const user = data.data;
          const active = user.status === 1 || user.status === "1" || user.status === true;
          setFormData({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            password: "",
            role: user.roles?.[0]?.id ? String(user.roles[0].id) : "",
            gender: String(user.gender || "").toLowerCase(),
            address: user.address || "",
            country: user.country || "",
            state: user.state || "",
            city: user.city || "",
            zipcode: user.zipcode || "",
            // The old code turned an inactive user (status 0) into "1" (Active)
            status: active ? "1" : "0",
            user_type: user.user_type || "",
          });
          setLatitude(user.latitude ?? "");
          setLongitude(user.longitude ?? "");
          setImagePreview(user.avatar || null);
        } else {
          toast.error(data.message || "Failed to fetch user data");
        }
      } catch {
        if (!cancelled) toast.error("Error fetching user details");
      } finally {
        if (!cancelled) setFetching(false);
      }
    };

    fetchRoles();
    fetchUser();
    return () => { cancelled = true; };
  }, [id]);

  // Free the temporary preview URL of a newly picked image (saved avatars are plain URLs)
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!formData.name.trim()) return toast.error("Please enter the name.");
    if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) return toast.error("Please enter a valid email address.");
    if (!formData.role) return toast.error("Please select a role.");
    if (!formData.user_type) return toast.error("Please select the user type.");

    try {
      setSubmitting(true);

      const { role, password, ...rest } = formData;
      const updatedData = {
        ...rest,
        name: formData.name.trim(),
        email: formData.email.trim(),
        roles: [role],
        longitude,
        latitude,
        // Only send a password when you actually typed one
        ...(password && { password }),
      };

      // Only send an image when a new one was chosen
      if (image) updatedData.avatar = await toBase64(image);

      const res = await fetch(`${API}/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedData),
      });
      const result = await res.json();

      if (res.ok) {
        toast.success("User updated successfully!");
        setTimeout(() => navigate("/user"), 1500);
      } else {
        toast.error(result.message || "Failed to update user.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormShell title="Edit user" subtitle="Update this user's profile, role and access" icons={ICONS}>
      <style>{PHONE_CSS}</style>

      {fetching ? (
        <FormLoading />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Name" htmlFor="name" required>
              <TextInput id="name" name="name" value={formData.name} onChange={handleChange} required />
            </FormField>

            <FormField label="Role" htmlFor="role" required>
              <SelectInput id="role" name="role" value={formData.role} onChange={handleChange} required>
                <option value="">Select role</option>
                {roles.map((role) => (
                  <option key={role.id} value={String(role.id)}>{role.name}</option>
                ))}
              </SelectInput>
            </FormField>

            <FormField label="Email" htmlFor="email" required>
              <TextInput id="email" type="email" name="email" value={formData.email} onChange={handleChange} required />
            </FormField>

            <FormField label="Phone" htmlFor="phone">
              <PhoneInput
                country="in"
                value={formData.phone}
                onChange={(phone) => setFormData((prev) => ({ ...prev, phone }))}
                containerClass="pp-phone"
                inputProps={{ id: "phone", name: "phone" }}
              />
            </FormField>

            <FormField label="Password" htmlFor="password" hint="Leave blank to keep the current password.">
              <div className="relative">
                <TextInput
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FormField>

            <FormField label="Gender" htmlFor="gender">
              <SelectInput id="gender" name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </SelectInput>
            </FormField>

            <FormField label="User type" htmlFor="user_type" required>
              <SelectInput id="user_type" name="user_type" value={formData.user_type} onChange={handleChange} required>
                <option value="">Select type</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
                <option value="Seller">Seller</option>
              </SelectInput>
            </FormField>

            <FormField label="Status" htmlFor="status">
              <SelectInput id="status" name="status" value={formData.status} onChange={handleChange}>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </SelectInput>
            </FormField>
          </div>

          {/* Avatar */}
          <FormField label="Profile image" htmlFor="avatar" hint="Leave empty to keep the current image.">
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-16 w-16 shrink-0 rounded-full border border-border object-cover shadow-sm" />
              ) : (
                <div className={clsx("flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white", primaryGradient)}>
                  <User size={22} />
                </div>
              )}
              <input
                id="avatar"
                type="file"
                accept="image/*"
                name="avatar"
                onChange={handleImageChange}
                className={clsx(
                  "block w-full cursor-pointer rounded-lg p-2 text-sm text-muted-foreground",
                  "file:mr-4 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2",
                  "file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20",
                  "focus:outline-none focus:ring-2 focus:ring-primary/40",
                  glassInput
                )}
              />
            </div>
          </FormField>

          {/* Actions */}
          <div className="flex flex-wrap justify-end gap-3 border-t border-white/20 pt-5 dark:border-white/10">
            <button
              type="button"
              onClick={() => navigate("/user")}
              className="h-10 rounded-lg border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-primary/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={clsx(
                "inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r px-5 text-sm font-semibold text-white transition-all duration-200",
                "shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40",
                "disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none",
                primaryGradient
              )}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Updating..." : "Update user"}
            </button>
          </div>
        </form>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </FormShell>
  );
};

export default EditUser;