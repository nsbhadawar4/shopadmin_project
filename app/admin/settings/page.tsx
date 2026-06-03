"use client";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Info,
  LayoutDashboard,
  LogOut,
  Mail,
  Moon,
  Palette,
  Server,
  Settings,
  ShieldCheck,
  Sun,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/app/context/ThemeContext";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: EASE },
  }),
};

function SectionCard({
  icon,
  title,
  children,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      animate="visible"
      className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl overflow-hidden backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-700/60">
        <div className="w-8 h-8 rounded-xl bg-zinc-700/80 flex items-center justify-center text-blue-400">
          {icon}
        </div>
        <h2 className="font-semibold text-zinc-100 text-sm">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </motion.div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-zinc-700/40 last:border-0">
      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-zinc-200 font-medium">{value}</span>
    </div>
  );
}

export default function AdminSettings() {
  const { themeToggleEnabled, setThemeToggleEnabled, theme } = useTheme();

  return (
    <div className="px-4 py-8 md:px-8 max-w-2xl mx-auto w-full">
      {/* ── Page header ── */}
      <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible" className="mb-8">
        <Link
          href="/admin/product"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-4 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Products
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-blue-500/20 to-blue-700/20 border border-blue-500/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-50 tracking-tight">Settings</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Configure your ShopAdmin preferences</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        {/* ── Appearance ── */}
        <SectionCard icon={<Palette className="w-4 h-4" />} title="Appearance" delay={1}>
          <div className="space-y-4">
            {/* Theme toggle row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-zinc-100">Theme Toggle Visibility</span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      themeToggleEnabled
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-zinc-700 text-zinc-500 border-zinc-600"
                    }`}
                  >
                    {themeToggleEnabled ? "Active" : "Hidden"}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  When enabled, a dark / light mode button appears in the navigation bar for all public visitors.
                </p>
              </div>

              {/* Animated toggle switch */}
              <button
                type="button"
                onClick={() => setThemeToggleEnabled(!themeToggleEnabled)}
                className={`relative shrink-0 w-12 h-6 rounded-full border transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  themeToggleEnabled
                    ? "bg-blue-500 border-blue-600"
                    : "bg-zinc-700 border-zinc-600"
                }`}
                aria-checked={themeToggleEnabled}
                role="switch"
              >
                <motion.span
                  layout
                  animate={{ x: themeToggleEnabled ? 24 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  className="absolute top-[0.5] w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
                >
                  {themeToggleEnabled ? (
                    <Sun className="w-2.5 h-2.5 text-amber-400" />
                  ) : (
                    <Moon className="w-2.5 h-2.5 text-zinc-400" />
                  )}
                </motion.span>
              </button>
            </div>

            {/* Theme preview */}
            <div className="rounded-xl border border-zinc-700/60 overflow-hidden">
              <div className="px-3.5 py-2.5 bg-zinc-900/60 border-b border-zinc-700/60 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-xs text-zinc-500 font-medium">Current theme preview</span>
              </div>
              <div className="px-4 py-3 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                    theme === "dark"
                      ? "bg-zinc-900 border-zinc-700"
                      : "bg-white border-zinc-200"
                  }`}
                >
                  {theme === "dark" ? (
                    <Moon className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-200 capitalize">{theme} Mode</p>
                  <p className="text-xs text-zinc-500">
                    {theme === "dark" ? "zinc-950 base, zinc-50 text" : "white base, zinc-900 text"}
                  </p>
                </div>
                <span className="ml-auto text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-lg font-semibold">
                  Active
                </span>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Store Information ── */}
        <SectionCard icon={<Tag className="w-4 h-4" />} title="Store Information" delay={2}>
          <div>
            <InfoRow label="Store Name" value="ShopAdmin" />
            <InfoRow label="Admin Email" value="admin@gmail.com" />
            <InfoRow label="Platform" value="Next.js + MongoDB" />
            <InfoRow label="Version" value="1.0.0" />
          </div>
        </SectionCard>

        {/* ── System ── */}
        <SectionCard icon={<Server className="w-4 h-4" />} title="System" delay={3}>
          <div>
            <InfoRow label="Database" value="MongoDB (Mongoose)" />
            <InfoRow label="Auth" value="JWT · 1-day expiry" />
            <InfoRow label="Image Storage" value="Base64 (compressed)" />
            <InfoRow label="Payment" value="Razorpay (configured)" />
          </div>
        </SectionCard>

        {/* ── Security ── */}
        <SectionCard icon={<ShieldCheck className="w-4 h-4" />} title="Security" delay={4}>
          <div className="flex items-start gap-3 py-1">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your session is protected by a JWT token stored in <code className="bg-zinc-700/60 px-1 rounded text-zinc-300">localStorage</code>.
              Always log out on shared devices. Admin credentials are managed via the database.
            </p>
          </div>
        </SectionCard>

        {/* ── Quick Links ── */}
        <motion.div
          variants={fadeUp}
          custom={5}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 gap-3"
        >
          <Link
            href="/admin/product"
            className="flex flex-col items-center gap-2 p-4 bg-zinc-800/60 hover:bg-zinc-700/60 border border-zinc-700/60 hover:border-zinc-600 rounded-2xl transition-all group"
          >
            <LayoutDashboard className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-zinc-300">Dashboard</span>
          </Link>
          <Link
            href="/products"
            target="_blank"
            className="flex flex-col items-center gap-2 p-4 bg-zinc-800/60 hover:bg-zinc-700/60 border border-zinc-700/60 hover:border-zinc-600 rounded-2xl transition-all group"
          >
            <ExternalLink className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-zinc-300">Storefront</span>
          </Link>
          <button
            onClick={() => { localStorage.removeItem("token"); window.location.href = "/admin/login"; }}
            className="flex flex-col items-center gap-2 p-4 bg-zinc-800/60 hover:bg-red-500/10 border border-zinc-700/60 hover:border-red-500/20 rounded-2xl transition-all group cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-zinc-400 group-hover:text-red-400 transition-colors">Logout</span>
          </button>
        </motion.div>

        {/* ── Footer note ── */}
        <motion.div
          variants={fadeUp}
          custom={6}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-center gap-1.5 py-2"
        >
          <Mail className="w-3 h-3 text-zinc-600" />
          <p className="text-[11px] text-zinc-600">
            ShopAdmin · Built with Next.js &amp; Tailwind CSS
          </p>
        </motion.div>
      </div>
    </div>
  );
}
