"use client";
import { useState, useRef, useEffect } from "react";

export default function AdminHeader() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-lg border-b border-slate-800">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow shadow-indigo-500/40">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <span className="text-lg font-bold tracking-tight">
          Shop<span className="text-indigo-400">Admin</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
        <a href="/admin/product" className="hover:text-white transition-colors">
          Products
        </a>
        <a href="/products" className="hover:text-white transition-colors">
          Storefront ↗
        </a>
      </nav>

      {/* User dropdown */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl transition-colors"
        >
          <span className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold shadow shadow-indigo-500/40">
            A
          </span>
          <span className="text-sm hidden sm:block text-slate-200">Admin</span>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-xs text-slate-400">Signed in as</p>
              <p className="text-sm font-semibold text-slate-800 truncate">admin@gmail.com</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/admin/login";
              }}
              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
