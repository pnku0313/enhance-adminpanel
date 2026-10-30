import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import { clsx } from "clsx";
import {
  ArrowLeft, Eye, EyeOff, Plus, Pencil, Trash2, MapPin, Phone,
  Users, UserCheck, ShieldCheck, Mail,
} from "lucide-react";
import AddressForm from "./AddressForm";
import {
  FormShell, FormField, TextInput, SelectInput, FormActions, FormLoading, showSwalLoading,
  glassInput, primaryGradient,
} from "../../components/common/CategoryFormUi";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "http://127.0.0.1:8000/api/customers";
const API = "http://127.0.0.1:8000/api";
const ICONS = [Users, UserCheck, ShieldCheck, Mail];

const swalClasses = {
  popup: "bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl",
  confirmButton:
    "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40",
  cancelButton: "bg-muted text-muted-foreground hover:bg-muted/80",
};

export default function EditCustomerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("authToken") || localStorage.getItem("token");

  const queryParams = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(queryParams.get("page"), 10) || 1;
  const perPageFromUrl = parseInt(queryParams.get("per_page"), 10) || 10; // was 1 by default, which broke "Back"
  const backUrl = `/customers?page=${pageFromUrl}&per_page=${perPageFromUrl}`;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [status, setStatus] = useState(0); // 1 = active, 0 = inactive
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [addresses, setAddresses] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load customer and address data
  useEffect(() => {
    if (!id) return;
    if (!token) {
      toast.error("No token found. Please log in again.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    axios
      .get(`${API_BASE}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (cancelled) return;
        const data = res.data.data;
        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setGender(data.gender || "");
        setStatus(data.status === 1 || data.status === true ? 1 : 0); // always 1 or 0 (never "")
        setAddresses(data.address?.data || []);
      })
      .catch((err) => {
        toast.error("Failed to load customer data");
        console.error(err.response?.data || err.message);
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setSaving(true);
      const res = await axios.put(
        `${API}/users/${id}`,
        { name: name.trim(), email: email.trim(), phone: phone.trim(), gender, status, ...(password && { password }) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success("Customer updated!");
        setPassword("");
      } else {
        toast.error(res.data.message || "Update failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const refreshAddresses = () =>
    axios
      .get(`${API_BASE}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setAddresses(res.data.data.address?.data || []))
      .catch((err) => console.error("Failed to refresh addresses:", err.message));

  const handleAddAddress = () => {
    setFormData({
      name: "",
      line1: "",
      landmark: "",
      pincode: "",
      country: "",
      state: "",
      city: "",
      contact: "",
      addressType: "home",
      id: null,
    });
    setIsModalOpen(true);
  };

  const handleEditAddress = (address) => {
    setFormData({
      id: address.id,
      name: address.name || "",
      line1: address.street || "",
      landmark: address.apartment_suite || "",
      pincode: address.zipcode || "",
      country: address.country?.id || "",
      state: address.state?.id || "",
      city: address.city?.id || "",
      contact: address.phone_number || "",
      addressType: address.address_type || "home",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (address) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to recover this address!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      customClass: swalClasses,
    });
    if (!result.isConfirmed) return;

    try {
      showSwalLoading("Deleting...", "Please wait.");
      // The old code read only "authToken" here, which is null when you log in with "token"
      await axios.delete(`${API}/user-addresses/${address.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await refreshAddresses();
      Swal.fire({ title: "Deleted!", text: "Your address has been deleted.", icon: "success", customClass: { popup: swalClasses.popup } });
    } catch (err) {
      Swal.fire({ title: "Error!", text: "Failed to delete address.", icon: "error", customClass: { popup: swalClasses.popup } });
    }
  };

  return (
    <>
      <FormShell title="Edit customer" subtitle="Update this customer's profile and addresses" icons={ICONS}>
        {loading ? (
          <FormLoading />
        ) : (
          <>
            <button
              type="button"
              onClick={() => navigate(backUrl)}
              className="mb-6 inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-white/40 px-4 text-sm font-medium text-foreground transition-colors hover:bg-primary/5 hover:text-primary dark:bg-white/5"
            >
              <ArrowLeft size={16} /> Back to customers
            </button>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField label="Name" htmlFor="name" required>
                  <TextInput id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </FormField>

                <FormField label="Email" htmlFor="email" required>
                  <TextInput id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </FormField>

                <FormField label="Phone" htmlFor="phone" required>
                  <TextInput id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </FormField>

                <FormField label="Gender" htmlFor="gender">
                  <SelectInput id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </SelectInput>
                </FormField>
              </div>

              {/* Status switch */}
              <div className="flex items-center justify-between rounded-xl border border-black/10 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <div>
                  <p className="text-sm font-medium text-foreground">Account status</p>
                  <p className="text-xs text-muted-foreground">
                    {status === 1 ? "Active: this customer can sign in and order." : "Inactive: this customer is blocked."}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={status === 1}
                  aria-label="Account status"
                  onClick={() => setStatus(status === 1 ? 0 : 1)}
                  className={clsx(
                    "relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                    status === 1 ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                  )}
                >
                  <span
                    className={clsx(
                      "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                      status === 1 && "translate-x-5"
                    )}
                  />
                </button>
              </div>

              <FormField label="Password" htmlFor="password" hint="Leave empty to keep the current password.">
                <div className="relative">
                  <TextInput
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
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

              <FormActions
                onCancel={() => navigate(backUrl)}
                submitLabel="Update customer"
                loadingLabel="Updating..."
                loading={saving}
              />
            </form>

            {/* ADDRESSES */}
            <div className="mt-10 border-t border-black/10 pt-8 dark:border-white/10">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-foreground">Addresses</h2>
                <button
                  type="button"
                  onClick={handleAddAddress}
                  className={clsx(
                    "inline-flex h-9 items-center gap-2 rounded-lg bg-gradient-to-r px-4 text-sm font-semibold text-white transition-all duration-200",
                    "shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40",
                    primaryGradient
                  )}
                >
                  <Plus size={16} /> Add address
                </button>
              </div>

              {addresses.length === 0 ? (
                <p className="rounded-xl border border-dashed border-black/10 py-8 text-center text-sm text-muted-foreground dark:border-white/10">
                  No addresses found.
                </p>
              ) : (
                <ul className="grid gap-4 md:grid-cols-2">
                  {addresses.map((addr) => (
                    <li
                      key={addr.id}
                      className={clsx("flex items-start justify-between gap-3 rounded-xl p-4", glassInput)}
                    >
                      <div className="min-w-0 space-y-1.5 text-sm">
                        <p className="flex items-center gap-2 font-semibold text-foreground">
                          <MapPin size={14} className="text-primary" />
                          <span className="truncate">{addr.name}</span>
                          {addr.address_type && (
                            <span className="rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[11px] font-medium capitalize text-purple-700 dark:border-purple-400/30 dark:bg-purple-500/15 dark:text-purple-300">
                              {addr.address_type}
                            </span>
                          )}
                        </p>
                        <p className="text-muted-foreground">{addr.street}</p>
                        <p className="text-muted-foreground">
                          {[addr.city?.name, addr.state?.name, addr.country?.name].filter(Boolean).join(", ")}
                        </p>
                        {addr.phone_number && (
                          <p className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone size={12} /> {addr.phone_number}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditAddress(addr)}
                          title="Edit address"
                          aria-label="Edit address"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(addr)}
                          title="Delete address"
                          aria-label="Delete address"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 transition-colors hover:bg-rose-500/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </FormShell>

      {/* Address modal (AddressForm is a separate file, unchanged) */}
      {isModalOpen && formData && (
        <AddressForm
          formData={formData}
          setFormData={setFormData}
          id={id}
          onClose={() => setIsModalOpen(false)}
          onSubmit={() => {
            setIsModalOpen(false);
            refreshAddresses();
          }}
        />
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}