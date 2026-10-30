"use client";
// src/pages/SettingsPage.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Save, Globe, Info, Share2, Layout, Truck, Contact, UploadCloud, Loader2, Image as ImageIcon } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const API = "http://127.0.0.1:8000/api";
const STORAGE = "http://127.0.0.1:8000/storage";

const glassCard =
  "bg-white/70 dark:bg-slate-900/60 border border-slate-300/80 dark:border-white/20 shadow-xl shadow-black/5 dark:shadow-black/20";
const inputCls =
  "w-full rounded-xl border border-slate-300/80 dark:border-white/20 bg-white/60 dark:bg-white/5 px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20";
const pickBtn =
  "inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300/80 dark:border-white/20 bg-white/60 dark:bg-white/10 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary";

const CSS = `
.pp-view ::selection { background: rgba(99,102,241,.35); color: inherit; }
@keyframes pp-wave { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes pp-float { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-10px) rotate(6deg); } }
.pp-wave { animation: pp-wave 14s linear infinite; }
.pp-wave.slow { animation-duration: 22s; }
.pp-float { animation: pp-float 6s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .pp-wave, .pp-float { animation: none; } }
/* phone input to match the theme */
.pp-view .pp-phone .form-control { width: 100% !important; height: 40px !important; border-radius: .75rem !important; border: 1px solid rgba(203,213,225,.8) !important; background: rgba(255,255,255,.6) !important; font-size: .875rem; }
.pp-view .pp-phone .flag-dropdown { border-radius: .75rem 0 0 .75rem !important; border: 1px solid rgba(203,213,225,.8) !important; background: rgba(255,255,255,.7) !important; }
.pp-view .pp-phone .form-control:focus { border-color: rgba(99,102,241,.6) !important; box-shadow: 0 0 0 2px rgba(99,102,241,.2) !important; }
.dark .pp-view .pp-phone .form-control { background: rgba(255,255,255,.05) !important; border-color: rgba(255,255,255,.2) !important; color: #fff !important; }
.dark .pp-view .pp-phone .flag-dropdown { background: rgba(255,255,255,.08) !important; border-color: rgba(255,255,255,.2) !important; }
.pp-view .pp-phone .country-list { background: #fff; color: #0f172a; border-radius: .75rem; }
.dark .pp-view .pp-phone .country-list { background: #0f172a; color: #fff; }
.dark .pp-view .pp-phone .country-list .country:hover, .dark .pp-view .pp-phone .country-list .country.highlight { background: #1e293b; }
`;

const FIELD_MAP = {
  app_name: "appName",
  footer_text: "footerText",
  logo: "logo",
  favicon: "favicon",
  email: "email",
  phone: "phone",
  address: "address",
  google_analytics: "googleAnalytics",
  facebook_url: "facebookUrl",
  twitter_url: "twitterUrl",
  instagram_url: "instagramUrl",
  linkedin_url: "linkedinUrl",
  youtube_url: "youtubeUrl",
  meta_site_name: "metaSiteName",
  meta_description: "metaDescription",
  meta_keywords: "meta_keyword",
  meta_keyword: "meta_keyword",
  meta_image: "metaImage",
  facebook_app_id: "facebookAppId",
  meta_fb_app_id: "facebookAppId",
  meta_twitter_site: "metaTwitterSite",
  meta_twitter_creator: "metaTwitterCreator",
  store_image: "store_image",
  shipping_charge: "shipping_charge",
};

const mapBackendToFrontend = (dataArray) => {
  const map = {};
  (dataArray || []).forEach((item) => {
    const key = FIELD_MAP[item.name];
    if (key) map[key] = item.val || "";
  });
  return map;
};

const Section = ({ icon: Icon, title, description, children }) => (
  <section className={glassCard + " rounded-2xl"}>
    <div className="flex items-center gap-3 border-b border-slate-300/80 px-5 py-4 dark:border-white/20 sm:px-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-card-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
    <div className="grid grid-cols-1 gap-6 p-5 sm:p-6 md:grid-cols-2">{children}</div>
  </section>
);

const Field = ({ label, htmlFor, hint, className = "", children }) => (
  <div className={className}>
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {label}
    </label>
    {children}
    {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const ImageField = ({ label, id, value, folder, onPick, previewClass }) => {
  const src = value ? (value.preview ? value.preview : `${STORAGE}/${folder}/${value}`) : "";
  return (
    <Field label={label} htmlFor={id}>
      <div className="rounded-xl border-2 border-dashed border-slate-300/80 p-4 dark:border-white/20">
        {src ? (
          <img src={src} alt={`${label} preview`} className={"mx-auto rounded-xl border border-slate-300/80 bg-white/60 object-contain dark:border-white/20 dark:bg-white/5 " + previewClass} />
        ) : (
          <div className="flex flex-col items-center gap-2 py-3 text-muted-foreground">
            <ImageIcon className="h-8 w-8 text-primary/70" />
            <p className="text-sm">No image selected</p>
          </div>
        )}
        <div className="mt-4 text-center">
          <label htmlFor={id} className={pickBtn}>
            <UploadCloud className="h-4 w-4" />
            {src ? "Replace image" : "Choose image"}
            <input
              id={id}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onPick({ file, preview: URL.createObjectURL(file) });
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>
    </Field>
  );
};

const SettingsPage = () => {
  const { authUserId } = useParams();
  const token = localStorage.getItem("authToken") || localStorage.getItem("token");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState({
    appName: "", footerText: "", logo: "", favicon: "", email: "", phone: "", address: "",
    googleAnalytics: "", facebookUrl: "", twitterUrl: "", instagramUrl: "", linkedinUrl: "",
    youtubeUrl: "", metaSiteName: "", metaDescription: "", meta_keyword: "", metaImage: "",
    facebookAppId: "", metaTwitterSite: "", metaTwitterCreator: "", store_image: "", shipping_charge: "",
  });

  useEffect(() => {
    let cancelled = false;
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };
        const results = await Promise.allSettled(
          [1, 2, 3].map((p) => axios.get(`${API}/settings?page=${p}`, { headers }))
        );
        if (results.every((r) => r.status === "rejected")) throw results[0].reason;

        const merged = {};
        results.forEach((r) => {
          if (r.status === "fulfilled") Object.assign(merged, mapBackendToFrontend(r.value.data?.settings?.data));
        });
        if (!cancelled) setSettings((prev) => ({ ...prev, ...merged }));
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Failed to fetch settings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchSettings();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const set = (field) => (e) => setSettings((prev) => ({ ...prev, [field]: e.target.value }));
  const setValue = (field, value) => setSettings((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("user_id", authUserId);
      formData.append("app_name", settings.appName || "");
      formData.append("footer_text", settings.footerText || "");
      formData.append("email", settings.email || "");
      formData.append("phone", settings.phone || "");
      formData.append("address", settings.address || "");
      formData.append("google_analytics", settings.googleAnalytics || "");
      formData.append("facebook_url", settings.facebookUrl || "");
      formData.append("twitter_url", settings.twitterUrl || "");
      formData.append("instagram_url", settings.instagramUrl || "");
      formData.append("linkedin_url", settings.linkedinUrl || "");
      formData.append("youtube_url", settings.youtubeUrl || "");
      formData.append("meta_site_name", settings.metaSiteName || "");
      formData.append("meta_description", settings.metaDescription || "");
      formData.append("meta_keyword", settings.meta_keyword || "");
      formData.append("facebook_app_id", settings.facebookAppId || "");
      formData.append("meta_twitter_site", settings.metaTwitterSite || "");
      formData.append("meta_twitter_creator", settings.metaTwitterCreator || "");
      formData.append("shipping_charge", settings.shipping_charge || "");

      // New upload -> send the file; otherwise send the existing stored name (as before)
      ["logo", "favicon", "store_image"].forEach((key) => {
        if (settings[key]) formData.append(key, settings[key].file ? settings[key].file : settings[key]);
      });

      await axios.post(`${API}/settings`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(error?.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pp-view">
      <style>{CSS}</style>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <div className="mx-auto w-full max-w-[90rem] space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* HEADER */}
        <div className={glassCard + " relative overflow-hidden rounded-2xl"}>
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-600/10" />
            <div className="absolute inset-x-0 bottom-0 h-16 overflow-hidden opacity-60">
              <svg className="pp-wave absolute bottom-0 left-0 h-full w-[200%]" viewBox="0 0 1200 100" preserveAspectRatio="none">
                <path d="M0 50 Q150 0 300 50 T600 50 T900 50 T1200 50 V100 H0Z" className="fill-indigo-500/15" />
              </svg>
              <svg className="pp-wave slow absolute bottom-0 left-0 h-full w-[200%]" viewBox="0 0 1200 100" preserveAspectRatio="none">
                <path d="M0 65 Q150 20 300 65 T600 65 T900 65 T1200 65 V100 H0Z" className="fill-purple-500/15" />
              </svg>
            </div>
            <Globe className="pp-float absolute right-10 top-4 h-9 w-9 text-indigo-500/20" />
            <Share2 className="pp-float absolute right-32 top-10 h-7 w-7 text-purple-500/20" style={{ animationDelay: "1.2s" }} />
            <Truck className="pp-float absolute right-56 top-3 h-6 w-6 text-indigo-500/20" style={{ animationDelay: "2.4s" }} />
          </div>
          <div className="relative z-10 flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">System</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-card-foreground sm:text-3xl">Settings</h1>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                Manage basic, address, social, SEO, and shipping settings
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="inline-flex h-10 items-center gap-2 self-start rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-opacity disabled:pointer-events-none disabled:opacity-60 sm:self-auto"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <fieldset disabled={loading} className={"space-y-6 transition-opacity " + (loading ? "opacity-60" : "")}>
          <Section icon={Layout} title="Basic Details" description="App name, footer, logo & favicon">
            <Field label="App Name" htmlFor="appName">
              <input id="appName" className={inputCls + " h-10"} placeholder="App Name" value={settings.appName} onChange={set("appName")} />
            </Field>
            <Field label="Footer Text" htmlFor="footerText">
              <textarea id="footerText" className={inputCls + " h-28 resize-y py-2"} placeholder="Footer Text" value={settings.footerText} onChange={set("footerText")} />
            </Field>
            <ImageField label="Logo" id="logo" value={settings.logo} folder="logo" onPick={(v) => setValue("logo", v)} previewClass="h-32 w-32" />
            <ImageField label="Favicon" id="favicon" value={settings.favicon} folder="favicon" onPick={(v) => setValue("favicon", v)} previewClass="h-20 w-20" />
          </Section>

          <Section icon={Contact} title="Contact Details" description="Contact information">
            <Field label="Email" htmlFor="email">
              <input id="email" type="email" className={inputCls + " h-10"} placeholder="Email" value={settings.email} onChange={set("email")} />
            </Field>
            <Field label="Phone" htmlFor="phone">
              <div className="pp-phone">
                <PhoneInput country={"in"} value={settings.phone} onChange={(v) => setValue("phone", v)} inputProps={{ id: "phone" }} />
              </div>
            </Field>
          </Section>

          <Section icon={Share2} title="Social Links" description="All your social media URLs">
            {[
              ["Facebook URL", "facebookUrl"],
              ["Twitter URL", "twitterUrl"],
              ["Instagram URL", "instagramUrl"],
              ["LinkedIn URL", "linkedinUrl"],
              ["YouTube URL", "youtubeUrl"],
            ].map(([label, key]) => (
              <Field key={key} label={label} htmlFor={key}>
                <input id={key} className={inputCls + " h-10"} placeholder={label} value={settings[key]} onChange={set(key)} />
              </Field>
            ))}
          </Section>

          <Section icon={Info} title="Meta Details" description="SEO-related settings and social preview data">
            <Field label="Meta Site Name" htmlFor="metaSiteName">
              <input id="metaSiteName" className={inputCls + " h-10"} placeholder="Meta Site Name" value={settings.metaSiteName} onChange={set("metaSiteName")} />
            </Field>
            <Field label="Meta Keywords" htmlFor="meta_keyword">
              <input id="meta_keyword" className={inputCls + " h-10"} placeholder="Meta Keywords" value={settings.meta_keyword} onChange={set("meta_keyword")} />
            </Field>
            <Field label="Meta Description" htmlFor="metaDescription" className="md:col-span-2">
              <textarea id="metaDescription" className={inputCls + " h-24 resize-y py-2"} placeholder="Meta Description" value={settings.metaDescription} onChange={set("metaDescription")} />
            </Field>
          </Section>

          <Section icon={ImageIcon} title="Store Image" description="Shown on your storefront">
            <ImageField label="Store Image" id="store_image" value={settings.store_image} folder="store_image" onPick={(v) => setValue("store_image", v)} previewClass="h-40 w-40 md:h-48 md:w-48 object-cover" />
          </Section>

          <Section icon={Truck} title="Shipping Charges" description="Manage shipping fee rules and thresholds">
            <Field label="Shipping Charge (₹)" htmlFor="shipping_charge">
              <input id="shipping_charge" type="number" min="0" className={inputCls + " h-10"} placeholder="Shipping Charge" value={settings.shipping_charge} onChange={set("shipping_charge")} />
            </Field>
          </Section>
        </fieldset>
      </div>
    </div>
  );
};

export default SettingsPage;