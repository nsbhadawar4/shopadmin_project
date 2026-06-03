import { ClipboardList, Lock, ShoppingCart, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const features = [
    {
      icon: <ClipboardList className="w-6 h-6 text-blue-400" />,
      title: "Product Catalogue",
      desc: "Add, edit, and remove products with image previews, pricing, and star ratings.",
      gradient: "from-blue-500/10 to-cyan-500/5",
    },
    {
      icon: <Lock className="w-6 h-6 text-violet-400" />,
      title: "Secure Admin Access",
      desc: "JWT-protected dashboard. Unauthorised users are redirected to the login page.",
      gradient: "from-violet-500/10 to-purple-500/5",
    },
    {
      icon: <ShoppingCart className="w-6 h-6 text-emerald-400" />,
      title: "Public Storefront",
      desc: "Customers browse your catalogue on a clean, responsive product listing page.",
      gradient: "from-emerald-500/10 to-teal-500/5",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* ── HERO ── */}
      <section className="relative min-h-[80vh] sm:min-h-[90vh] flex items-center overflow-hidden bg-zinc-950">
        {/* Ambient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.15),transparent)]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-24 text-center w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-xs font-bold tracking-widest uppercase mb-5 sm:mb-8">
            <Sparkles className="w-3 h-3" />
            Premium E-Commerce Platform
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[0.9] mb-6 sm:mb-8">
            Shop the{" "}
            <span className="relative">
              <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-violet-400 bg-clip-text text-transparent">
                Future
              </span>
              <span className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
            </span>
            <br />
            <span className="text-zinc-400">Today.</span>
          </h1>

          <p className="text-zinc-400 text-base sm:text-xl max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed">
            Curated products. Premium quality. Unmatched experience. Built for the modern consumer.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 bg-white text-zinc-950 hover:bg-zinc-100 px-8 py-4 rounded-2xl font-bold text-sm transition-all duration-300 hover:shadow-2xl hover:shadow-white/10 active:scale-95"
            >
              Shop Collection
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 border border-white/10 text-zinc-300 hover:text-white hover:border-white/20 hover:bg-white/5 px-8 py-4 rounded-2xl font-semibold text-sm transition-all duration-300 backdrop-blur-sm"
            >
              Admin Dashboard
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 sm:gap-12 mt-10 sm:mt-20 pt-8 sm:pt-12 border-t border-white/5">
            {[
              { label: "Products", value: "∞" },
              { label: "Categories", value: "10+" },
              { label: "Secure", value: "100%" },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-28 px-4 bg-zinc-950 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">Built for scale</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-3 mb-4">Everything you need</h2>
            <p className="text-zinc-500 text-sm max-w-md mx-auto">A modern stack built for performance — Next.js, MongoDB, and Tailwind CSS.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {features.map(({ icon, title, desc, gradient }) => (
              <div
                key={title}
                className={`relative p-7 rounded-2xl border border-white/5 bg-gradient-to-br ${gradient} hover:border-white/10 transition-all duration-300 group`}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 mb-5 group-hover:scale-110 transition-transform duration-300">
                  {icon}
                </div>
                <h3 className="font-bold text-white mb-2 text-sm">{title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <section className="relative py-20 px-4 overflow-hidden bg-zinc-950 border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(59,130,246,0.08),transparent)]" />
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Ready to start?</h2>
          <p className="text-zinc-500 text-sm mb-8">Sign in to manage your products and grow your catalogue.</p>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-sm transition-all duration-300 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 active:scale-95"
          >
            Go to Admin Login
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
