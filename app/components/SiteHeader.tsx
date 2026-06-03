"use client";
import { ChevronDown, LogOut, Menu, Moon, Package, Settings, ShoppingCart, Sun, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/app/context/ThemeContext";

type CartItem = { quantity: number };

export default function SiteHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const dropRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme, themeToggleEnabled } = useTheme();

  const fetchCartCount = useCallback(() => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then((items: CartItem[]) => {
        if (Array.isArray(items)) {
          setCartCount(items.reduce((acc, item) => acc + item.quantity, 0));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const sync = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
      setDropOpen(false);
      setMobileOpen(false);
    };
    sync();
    fetchCartCount();
  }, [pathname, fetchCartCount]);

  useEffect(() => {
    window.addEventListener("cartUpdated", fetchCartCount);
    return () => window.removeEventListener("cartUpdated", fetchCartCount);
  }, [fetchCartCount]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-zinc-950/90 backdrop-blur-2xl border-b border-white/5 shadow-2xl shadow-black/20"
          : "bg-zinc-950/60 backdrop-blur-xl border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-base tracking-tight text-white">
              Shop<span className="text-blue-400">Admin</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(href) ? "text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {isActive(href) && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-white/8 rounded-xl border border-white/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </Link>
            ))}
            {isLoggedIn && (
              <Link
                href="/admin/product"
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  pathname?.startsWith("/admin") ? "text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {pathname?.startsWith("/admin") && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-white/8 rounded-xl border border-white/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">Dashboard</span>
              </Link>
            )}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2">

            {/* Theme toggle — only visible when admin enables it */}
            <AnimatePresence>
              {themeToggleEnabled && (
                <motion.button
                  key="theme-toggle"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleTheme}
                  className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 border bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/15"
                  aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                  title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                >
                  <AnimatePresence mode="wait">
                    {theme === "dark" ? (
                      <motion.span
                        key="sun"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Sun className="w-4.5 h-4.5 text-amber-400" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="moon"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Moon className="w-4.5 h-4.5 text-blue-400" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Cart */}
            <Link
              href="/cart"
              className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 border ${
                pathname === "/cart"
                  ? "bg-white/10 border-white/20"
                  : "bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/15"
              }`}
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5 text-zinc-300" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-blue-500 text-white text-[10px] font-black rounded-full flex items-center justify-center leading-none shadow-lg shadow-blue-500/50"
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Admin dropdown — only on /admin/* */}
            {pathname?.startsWith("/admin") && (
              isLoggedIn ? (
                <div className="relative" ref={dropRef}>
                  <button
                    onClick={() => setDropOpen((o) => !o)}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-3 py-2 rounded-xl transition-all duration-200"
                  >
                    <span className="w-7 h-7 rounded-full bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xs font-black text-white shadow shadow-blue-500/40">A</span>
                    <span className="text-sm hidden sm:block text-zinc-200 font-medium">Admin</span>
                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {dropOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/50 border border-white/10 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-white/5">
                          <p className="text-xs text-zinc-500">Signed in as</p>
                          <p className="text-sm font-semibold text-zinc-100 truncate">admin@gmail.com</p>
                        </div>
                        <Link href="/admin/product" onClick={() => setDropOpen(false)} className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors">
                          Dashboard
                        </Link>
                        <Link href="/admin/settings" onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors">
                          <Settings className="w-3.5 h-3.5" />
                          Settings
                        </Link>
                        <button
                          onClick={() => { localStorage.removeItem("token"); window.location.href = "/admin/login"; }}
                          className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2 border-t border-white/5"
                        >
                          <LogOut className="w-4 h-4" />Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/admin/login" className="px-2.5 sm:px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-all duration-200 shadow shadow-blue-500/30 hover:shadow-blue-500/50 whitespace-nowrap">
                  <span className="sm:hidden">Login</span>
                  <span className="hidden sm:inline">Admin Login</span>
                </Link>
              )
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5 text-zinc-300" /> : <Menu className="w-5 h-5 text-zinc-300" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-white/5 py-3 pb-4 space-y-1"
            >
              {[
                ...navLinks,
                { href: "/cart", label: `Cart${cartCount > 0 ? ` (${cartCount})` : ""}` },
                ...(isLoggedIn ? [{ href: "/admin/product", label: "Dashboard" }, { href: "/admin/settings", label: "Settings" }] : []),
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive(href) ? "bg-white/8 text-white border border-white/10" : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {label}
                </Link>
              ))}
              {/* Mobile theme toggle */}
              {themeToggleEnabled && (
                <button
                  onClick={() => { toggleTheme(); setMobileOpen(false); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </button>
              )}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
