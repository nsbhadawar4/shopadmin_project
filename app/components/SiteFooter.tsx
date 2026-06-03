import { Package } from "lucide-react";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-zinc-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow shadow-blue-500/30">
              <Package className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-sm text-white tracking-tight">
              Shop<span className="text-blue-400">Admin</span>
            </span>
          </div>

          <nav className="flex items-center gap-4 sm:gap-6 text-xs text-zinc-600 flex-wrap justify-center">
            <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
            <Link href="/products" className="hover:text-zinc-300 transition-colors">Products</Link>
            <Link href="/cart" className="hover:text-zinc-300 transition-colors">Cart</Link>
            <Link href="/admin/login" className="hover:text-zinc-300 transition-colors">Admin</Link>
          </nav>

          <p className="text-[11px] text-zinc-700">© 2026 ShopAdmin. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
