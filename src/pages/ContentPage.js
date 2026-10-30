"use client";
// src/pages/ContentPage.jsx
import { useState } from "react";
import { FileText, ImageIcon, Globe, Layers, PenSquare } from "lucide-react";
import BannerManagement from "../components/content/Banner/BannerManagement";
import SliderManagement from "../components/content/Slider/SliderManagement";
import BlogManagement from "../components/content/Blog/BlogManagement";

const glassCard =
  "bg-white/70 dark:bg-slate-900/60 border border-slate-300/80 dark:border-white/20 shadow-xl shadow-black/5 dark:shadow-black/20";

const MOTION_CSS = `
.pp-view ::selection { background: rgba(99,102,241,.35); color: inherit; }
@keyframes pp-wave { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes pp-float { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-10px) rotate(6deg); } }
.pp-wave { animation: pp-wave 14s linear infinite; }
.pp-wave.slow { animation-duration: 22s; }
.pp-float { animation: pp-float 6s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .pp-wave, .pp-float { animation: none; } }
`;

const TABS = [
  { key: "banners", label: "Banners", icon: ImageIcon },
  { key: "homepage", label: "Sliders", icon: Layers },
  { key: "blog", label: "Blog Management", icon: PenSquare },
];

const ContentPage = () => {
  const [activeTab, setActiveTab] = useState("banners");

  // Static dummy stats (no API calls)
  const stats = {
    activeBanners: 6,
    homepageSections: 3,
    publishedPosts: 10,
    draftPosts: 4,
  };

  // Dummy callback to match child props
  const handleStatsUpdate = () => {
    console.log("Stats updated (dummy)");
  };

  const tiles = [
    { title: "Active Banners", value: stats.activeBanners, icon: ImageIcon, tone: "from-indigo-500 to-purple-500" },
    { title: "Homepage Sections", value: stats.homepageSections, icon: Globe, tone: "from-purple-500 to-fuchsia-500" },
    { title: "Published Posts", value: stats.publishedPosts, icon: FileText, tone: "from-emerald-500 to-teal-500" },
    { title: "Draft Posts", value: stats.draftPosts, icon: FileText, tone: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="pp-view">
      <style>{MOTION_CSS}</style>
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
            <ImageIcon className="pp-float absolute right-10 top-4 h-9 w-9 text-indigo-500/20" />
            <Globe className="pp-float absolute right-32 top-10 h-7 w-7 text-purple-500/20" style={{ animationDelay: "1.2s" }} />
            <FileText className="pp-float absolute right-56 top-3 h-6 w-6 text-indigo-500/20" style={{ animationDelay: "2.4s" }} />
          </div>
          <div className="relative z-10 px-6 py-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Content</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-card-foreground sm:text-3xl">
              Website Content Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Manage banners, homepage sections, and blog content
            </p>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {tiles.map(({ title, value, icon: Icon, tone }) => (
            <div key={title} className={glassCard + " flex items-center gap-4 rounded-2xl p-4"}>
              <div
                className={
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg shadow-indigo-500/20 " +
                  tone
                }
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-muted-foreground">{title}</p>
                <p className="text-2xl font-semibold leading-tight text-card-foreground">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* TABS + CONTENT */}
        <div className={glassCard + " rounded-2xl"}>
          <div className="border-b border-slate-300/80 px-4 py-3 dark:border-white/20 sm:px-6">
            <div
              role="tablist"
              className="inline-flex max-w-full flex-wrap gap-1 rounded-xl border border-slate-300/80 bg-white/50 p-1 dark:border-white/20 dark:bg-white/5"
            >
              {TABS.map(({ key, label, icon: Icon }) => {
                const active = activeTab === key;
                return (
                  <button
                    key={key}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveTab(key)}
                    className={
                      "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all sm:px-4 sm:py-2 sm:text-sm " +
                      (active
                        ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                        : "text-muted-foreground hover:bg-primary/5 hover:text-primary")
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === "banners" && <BannerManagement onStatsUpdate={handleStatsUpdate} />}
            {activeTab === "homepage" && <SliderManagement onStatsUpdate={handleStatsUpdate} />}
            {activeTab === "blog" && <BlogManagement onStatsUpdate={handleStatsUpdate} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPage;