"use client";

import ImageSlider from "@/app/components/ImageSlider";
import Pagination from "@/app/components/Pagination";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ChevronDown, Check, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  image?: string;
  images?: string[];
  category?: string;
  discount?: number;
  stock?: number;
  sizes?: string[];
  colors?: string[];
};

type SortOrder = "default" | "asc" | "desc";
const ITEMS_PER_PAGE = 10;

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: EASE },
  }),
};

const SORT_OPTIONS = [
  { value: "default", label: "Newest First" },
  { value: "asc",     label: "Price: Low → High" },
  { value: "desc",    label: "Price: High → Low" },
] as const;

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOrder>("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        setProducts(await res.json());
      } catch (error) {
        console.log("Products Error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => { const reset = () => setPage(1); reset(); }, [search, sort]);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;
    if (sort === "asc") return [...base].sort((a, b) => a.price - b.price);
    if (sort === "desc") return [...base].sort((a, b) => b.price - a.price);
    return base;
  }, [products, search, sort]);

  const paginatedProducts = filteredProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const addToCart = async (product: Product) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          name: product.name,
          image: product.images?.[0] || "",
          price: product.price,
          quantity: 1,
        }),
      });
      if (res.ok) {
        setAddedId(product._id);
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        setTimeout(() => setAddedId(null), 1800);
      }
    } catch (error) {
      console.log("Cart Error", error);
    }
  };

  const discountedPrice = (price: number, discount?: number) =>
    discount ? Math.round(price * (1 - discount / 100)) : price;

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 min-h-screen">
      {/* PAGE HEADER */}
      <div className="bg-zinc-950 border-b border-white/5 px-4 py-6 sm:py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">Our Store</span>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">Products</h1>
              <p className="text-zinc-500 text-sm mt-1.5">
                {loading ? "Loading…" : (
                  search.trim()
                    ? `${filteredProducts.length} result${filteredProducts.length !== 1 ? "s" : ""} for "${search.trim()}"`
                    : `${filteredProducts.length} item${filteredProducts.length !== 1 ? "s" : ""} available`
                )}
              </p>
            </div>

            {!loading && products.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search products…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/8 text-zinc-200 text-sm rounded-xl pl-10 pr-9 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500/50 placeholder-zinc-600 transition-all duration-200"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Sort — custom dropdown */}
                <div className="relative shrink-0" ref={sortRef}>
                  <button
                    onClick={() => setSortOpen((o) => !o)}
                    className="flex items-center gap-2 bg-zinc-900 border border-white/8 hover:border-white/15 rounded-xl px-4 py-2.5 text-sm text-zinc-200 transition-all duration-200 whitespace-nowrap"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-zinc-500 shrink-0" />
                    {SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort"}
                    <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {sortOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden"
                      >
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => { setSort(opt.value as SortOrder); setSortOpen(false); }}
                            className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors ${
                              sort === opt.value
                                ? "text-blue-400 bg-blue-500/10"
                                : "text-zinc-400 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            {opt.label}
                            {sort === opt.value && <Check className="w-3.5 h-3.5 text-blue-400" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="relative">
              <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <div className="absolute inset-2 w-8 h-8 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-32">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-zinc-300 font-semibold text-lg mb-2">No results found</p>
            <p className="text-zinc-600 text-sm">Try a different search term or browse all products.</p>
          </div>
        ) : (
          <>
            {filteredProducts.length > ITEMS_PER_PAGE && (
              <p className="text-xs text-zinc-600 mb-6">
                Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length}
              </p>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence mode="popLayout">
                {paginatedProducts.map((p, i) => {
                  const finalPrice = discountedPrice(p.price, p.discount);
                  const outOfStock = (p.stock ?? 1) === 0;
                  return (
                    <motion.div
                      key={p._id}
                      custom={i}
                      variants={cardVariants}
                      initial="hidden"
                      animate="show"
                      layout
                      className={`group relative bg-zinc-900 rounded-2xl border transition-all duration-500 flex flex-col overflow-hidden ${
                        outOfStock
                          ? "border-white/3 opacity-60"
                          : "border-white/5 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/8"
                      }`}
                    >
                      {/* Image area */}
                      <Link href={`/products/${p._id}`} className="block relative">
                        <div className="relative h-56 overflow-hidden bg-zinc-800/50">
                          <ImageSlider
                            images={p.images?.length ? p.images : p.image ? [p.image] : []}
                            alt={p.name}
                            className="h-56"
                          />

                          {/* Discount badge */}
                          {(p.discount ?? 0) > 0 && !outOfStock && (
                            <div className="absolute top-2.5 left-2.5 z-30 bg-linear-to-r from-blue-600 to-blue-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-blue-500/40">
                              −{p.discount}%
                            </div>
                          )}

                          {/* OOS overlay */}
                          {outOfStock && (
                            <div className="absolute inset-0 bg-zinc-950/70 z-20 flex items-center justify-center backdrop-blur-[2px]">
                              <span className="bg-zinc-800/90 border border-white/10 text-zinc-300 text-xs font-bold px-3 py-1.5 rounded-full">
                                Out of Stock
                              </span>
                            </div>
                          )}

                          {/* Shine on hover */}
                          <div className="absolute inset-0 bg-linear-to-t from-zinc-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
                        </div>
                      </Link>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-1">
                        {p.category && (
                          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1.5">{p.category}</span>
                        )}

                        <Link href={`/products/${p._id}`}>
                          <h3 className="font-bold text-zinc-100 text-sm leading-snug line-clamp-2 hover:text-white transition-colors mb-2">
                            {p.name}
                          </h3>
                        </Link>

                        <p className="text-xs text-zinc-600 leading-relaxed flex-1 line-clamp-2 mb-3">
                          {p.description}
                        </p>

                        {/* Rating */}
                        {p.rating > 0 && (
                          <div className="flex items-center gap-1 mb-3">
                            {[1,2,3,4,5].map((s) => (
                              <div key={s} className={`w-2.5 h-2.5 rounded-sm ${s <= Math.round(p.rating) ? "bg-amber-400" : "bg-zinc-700"}`} />
                            ))}
                            <span className="text-[10px] text-zinc-500 ml-1">{p.rating}</span>
                          </div>
                        )}

                        {/* Sizes preview */}
                        {(p.sizes?.length ?? 0) > 0 && (
                          <div className="flex gap-1 mb-3 flex-wrap">
                            {p.sizes!.slice(0, 4).map((s) => (
                              <span key={s} className="text-[10px] border border-white/8 text-zinc-500 px-1.5 py-0.5 rounded-md">{s}</span>
                            ))}
                            {p.sizes!.length > 4 && <span className="text-[10px] text-zinc-700">+{p.sizes!.length - 4}</span>}
                          </div>
                        )}

                        {/* Price + CTA */}
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                          <div>
                            <p className="text-lg font-black text-white">₹{finalPrice}</p>
                            {(p.discount ?? 0) > 0 && (
                              <p className="text-xs text-zinc-600 line-through">₹{p.price}</p>
                            )}
                          </div>

                          <motion.button
                            onClick={() => addToCart(p)}
                            disabled={addedId === p._id || outOfStock}
                            whileTap={{ scale: 0.93 }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                              addedId === p._id
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                                : outOfStock
                                ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
                            }`}
                          >
                            {addedId === p._id ? "Added ✓" : outOfStock ? "Sold Out" : "Add to cart"}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <Pagination page={page} total={filteredProducts.length} perPage={ITEMS_PER_PAGE} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
