"use client";

import { ArrowLeft, ChevronLeft, ChevronRight, CreditCard, ShieldCheck, ShoppingCart, Star, Minus, Plus, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { use, useEffect, useState } from "react";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  images: string[];
  category?: string;
  discount?: number;
  stock?: number;
  sizes?: string[];
  colors?: string[];
};

const COLOR_MAP: Record<string, string> = {
  Black: "#18181b", White: "#e4e4e7", Red: "#ef4444", Blue: "#3b82f6",
  "Sky Blue": "#38bdf8", Lavender: "#c4b5fd",
  Green: "#22c55e", Yellow: "#eab308", Pink: "#ec4899", Purple: "#a855f7",
  Orange: "#f97316", Gray: "#71717a", Brown: "#a16207", Navy: "#1e3a5f",
  Maroon: "#9b1c1c", Teal: "#0d9488", Olive: "#4d7c0f", Beige: "#d4c5a9",
  Coral: "#f87171", Turquoise: "#06b6d4", Cream: "#fef3c7", Burgundy: "#831843",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 transition-colors ${star <= Math.round(rating) ? "text-amber-400" : "text-zinc-700"}`}
          fill={star <= Math.round(rating) ? "currentColor" : "none"}
        />
      ))}
      <span className="text-zinc-500 text-sm ml-2">({rating})</span>
    </div>
  );
}

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selected, setSelected] = useState(0);
  const [paying, setPaying] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => { setProduct(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleBuyNow = async () => {
    if (!product || paying) return;
    setPaying(true);
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(product.price * (1 - (product.discount ?? 0) / 100)) * qty }),
      });
      const order = await res.json();
      if (order.error || !order.id) { alert("Could not create order. Please try again."); return; }
      const RazorpayConstructor = (window as unknown as { Razorpay: new (o: object) => { open: () => void } }).Razorpay;
      const razorpay = new RazorpayConstructor({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, amount: order.amount, currency: order.currency,
        name: "ShopAdmin", description: product.name, order_id: order.id,
        handler: () => { alert(`Payment successful! ₹${Math.round(product.price * (1 - (product.discount ?? 0) / 100)) * qty} paid.`); },
        prefill: { name: "", email: "" }, theme: { color: "#3b82f6" },
      });
      razorpay.open();
    } catch { alert("Payment failed."); } finally { setPaying(false); }
  };

  const addToCart = async () => {
    if (!product) return;
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id, name: product.name, image: product.images?.[0] || "", price: product.price, quantity: qty }),
      });
      if (res.ok) {
        setAddedToCart(true);
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        setTimeout(() => setAddedToCart(false), 2200);
      }
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950 py-32">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 py-32 gap-5">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
          <Package className="w-8 h-8 text-zinc-600" />
        </div>
        <p className="text-zinc-400 text-lg font-semibold">Product not found</p>
        <Link href="/products" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors">
          Back to Products
        </Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [];
  const finalPrice = Math.round(product.price * (1 - (product.discount ?? 0) / 100));
  const outOfStock = (product.stock ?? 1) === 0;

  return (
    <div className="flex-1 bg-zinc-950 min-h-screen">
      {/* Ambient glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_70%_30%,rgba(59,130,246,0.06),transparent)] pointer-events-none" />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <div className="flex items-center gap-2 text-xs text-zinc-600">
          <Link href="/" className="hover:text-zinc-400 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-zinc-400 transition-colors">Products</Link>
          <span>/</span>
          <span className="text-zinc-400 truncate max-w-40">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-20">

          {/* ── LEFT — Gallery ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {/* Main viewer */}
            <div className="relative rounded-3xl overflow-hidden border border-white/5 bg-zinc-900 h-72 sm:h-96 lg:h-115 shadow-2xl shadow-black/40">
              {/* Blur bg */}
              <AnimatePresence mode="wait">
                {images[selected] && (
                  <motion.img
                    key={`bg-${selected}`}
                    src={images[selected]}
                    alt=""
                    aria-hidden
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 w-full h-full object-cover scale-150 blur-3xl pointer-events-none"
                    style={{ opacity: 0.5 }}
                  />
                )}
              </AnimatePresence>

              {/* Slides */}
              {images.map((img, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 z-10 flex items-center justify-center p-8"
                  animate={{ opacity: i === selected ? 1 : 0, scale: i === selected ? 1 : 0.95 }}
                  transition={{ duration: 0.4 }}
                  style={{ pointerEvents: i === selected ? "auto" : "none" }}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="max-h-full max-w-full object-contain drop-shadow-2xl" />
                </motion.div>
              ))}

              {/* Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelected((s) => (s - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-zinc-950/70 hover:bg-zinc-950 border border-white/10 text-white flex items-center justify-center transition-all backdrop-blur-sm"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelected((s) => (s + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-zinc-950/70 hover:bg-zinc-950 border border-white/10 text-white flex items-center justify-center transition-all backdrop-blur-sm"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <span className="absolute top-3 right-3 z-20 bg-zinc-950/70 backdrop-blur-sm text-zinc-400 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/5">
                    {selected + 1} / {images.length}
                  </span>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-zinc-900 [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full">
                {images.map((img, i) => (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelected(i)}
                    className={`relative shrink-0 w-18 h-18 rounded-2xl overflow-hidden border-2 transition-all duration-300 bg-zinc-900 ${
                      selected === i ? "border-blue-500 shadow-lg shadow-blue-500/20 scale-105" : "border-white/5 hover:border-white/15 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── RIGHT — Info ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            <Link href="/products" className="inline-flex items-center gap-1.5 text-zinc-600 hover:text-zinc-300 text-sm mb-6 transition-colors w-fit group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to Products
            </Link>

            {/* Badges */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {product.category && (
                <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 rounded-full">
                  {product.category}
                </span>
              )}
              {(product.discount ?? 0) > 0 && (
                <span className="text-[10px] font-black bg-linear-to-r from-blue-600 to-blue-500 text-white px-2.5 py-1 rounded-full shadow shadow-blue-500/30">
                  {product.discount}% OFF
                </span>
              )}
              {outOfStock && (
                <span className="text-[10px] font-bold bg-zinc-800 text-zinc-500 border border-white/5 px-2.5 py-1 rounded-full">Out of Stock</span>
              )}
            </div>

            {/* Name */}
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-4 tracking-tight">{product.name}</h1>

            {/* Rating + stock */}
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <StarRating rating={product.rating} />
              {!outOfStock && (product.stock ?? 0) > 0 && (
                <span className="text-xs text-emerald-400 font-semibold border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  In Stock ({product.stock})
                </span>
              )}
            </div>

            {/* Price */}
            <div className="mb-6 p-5 bg-zinc-900/60 rounded-2xl border border-white/5 backdrop-blur-sm">
              {(product.discount ?? 0) > 0 ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-600 mb-1 uppercase tracking-widest">Price</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-black text-white">₹{finalPrice}</span>
                      <span className="text-base text-zinc-600 line-through">₹{product.price}</span>
                    </div>
                    <p className="text-xs text-emerald-400 mt-1 font-semibold">You save ₹{product.price - finalPrice}</p>
                  </div>
                  <p className="text-xs text-zinc-600">FREE Delivery</p>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-600 mb-1 uppercase tracking-widest">Price</p>
                    <p className="text-3xl font-black text-white">₹{product.price}</p>
                  </div>
                  <p className="text-xs text-zinc-600">FREE Delivery</p>
                </div>
              )}
            </div>

            {/* Size */}
            {(product.sizes?.length ?? 0) > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Size</p>
                  {selectedSize && <p className="text-xs text-blue-400 font-bold">{selectedSize} selected</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes!.map((s) => (
                    <motion.button
                      key={s}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => setSelectedSize((prev) => prev === s ? "" : s)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-200 ${
                        selectedSize === s
                          ? "border-blue-500 bg-blue-500/10 text-blue-400 shadow shadow-blue-500/20"
                          : "border-white/8 bg-zinc-900 text-zinc-400 hover:border-white/15 hover:text-zinc-200"
                      }`}
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Color */}
            {(product.colors?.length ?? 0) > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Color</p>
                  {selectedColor && <p className="text-xs text-zinc-300 font-bold">{selectedColor}</p>}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors!.map((c) => (
                    <motion.button
                      key={c}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedColor((prev) => prev === c ? "" : c)}
                      title={c}
                      className={`w-9 h-9 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                        selectedColor === c ? "border-blue-400 scale-110 shadow-lg shadow-blue-500/30" : "border-zinc-700 hover:border-zinc-500 hover:scale-105"
                      }`}
                      style={{ backgroundColor: COLOR_MAP[c] ?? "#71717a" }}
                    >
                      {selectedColor === c && (
                        <svg className="w-3.5 h-3.5 text-white drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-2">Description</p>
                <p className="text-zinc-400 text-sm leading-relaxed">{product.description}</p>
              </div>
            )}

            <div className="border-t border-white/5 pt-6 mt-auto space-y-4">
              {/* Quantity */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest w-6">Qty</span>
                <div className="flex items-center bg-zinc-900 border border-white/8 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="px-4 py-2.5 text-zinc-400 hover:text-white hover:bg-white/5 disabled:text-zinc-700 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 text-sm font-black text-white border-x border-white/8 py-2.5 min-w-12 text-center">{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)} className="px-4 py-2.5 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-zinc-600">Total: <span className="text-zinc-300 font-bold">₹{finalPrice * qty}</span></span>
              </div>

              {/* CTAs */}
              <div className="flex gap-3">
                <motion.button
                  onClick={addToCart}
                  disabled={addedToCart || outOfStock}
                  whileTap={{ scale: 0.96 }}
                  className={`flex-1 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                    addedToCart
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      : outOfStock
                      ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                      : "bg-white text-zinc-950 hover:bg-zinc-100 shadow-xl shadow-white/10 hover:shadow-white/20"
                  }`}
                >
                  {addedToCart ? "Added to Cart ✓" : outOfStock ? "Out of Stock" : "Add to Cart"}
                </motion.button>
                <motion.button
                  onClick={handleBuyNow}
                  disabled={paying || outOfStock}
                  whileTap={{ scale: 0.96 }}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all duration-300 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 flex items-center justify-center gap-2"
                >
                  {paying && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {paying ? "Processing…" : "Buy Now"}
                </motion.button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { icon: <ShieldCheck className="w-5 h-5 text-blue-400" />, label: "Genuine" },
                  { icon: <ShoppingCart className="w-5 h-5 text-blue-400" />, label: "Easy Returns" },
                  { icon: <CreditCard className="w-5 h-5 text-blue-400" />, label: "Secure Pay" },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-2 p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                    {icon}
                    <span className="text-[10px] text-zinc-500 font-semibold">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
