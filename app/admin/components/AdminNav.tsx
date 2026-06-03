"use client";
import { motion } from "framer-motion";
import { LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
  { href: "/admin/product", label: "Products", icon: LayoutDashboard },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminNav() {
  const pathname = usePathname();

  // Don't render on login page
  if (pathname === "/admin/login") return null;

  return (
    <div className="border-b border-zinc-800 bg-zinc-900/70 backdrop-blur-sm sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center gap-1">
          {adminLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  active ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
                {active && (
                  <motion.span
                    layoutId="admin-nav-pill"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 rounded-t-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
