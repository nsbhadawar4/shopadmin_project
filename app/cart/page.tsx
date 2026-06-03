"use client";

import { ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

type CartItem = {
  _id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

const swal = { bg: "#27272a", color: "#fafafa", cancel: "#52525b" };

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const getCart = async () => {
    try {
      const res = await fetch("/api/cart");
      setCart(await res.json());
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/cart");
        setCart(await res.json());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const total = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cart]
  );

  const totalItems = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const notify = () => window.dispatchEvent(new CustomEvent("cartUpdated"));

  // ── Smooth remove helper ──
  const animateAndRemove = (ids: string[], afterFn: () => Promise<void>) => {
    setDeletingIds(new Set(ids));
    setTimeout(async () => {
      await afterFn();
      setDeletingIds(new Set());
      getCart();
      notify();
    }, 320);
  };

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const isAllSelected = cart.length > 0 && cart.every((i) => selectedIds.has(i._id));

  // ── Quantity ──
  const increaseQty = async (item: CartItem) => {
    await fetch(`/api/cart/${item._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: item.quantity + 1 }),
    });
    getCart();
    notify();
  };

  const decreaseQty = async (item: CartItem) => {
    if (item.quantity <= 1) return;
    await fetch(`/api/cart/${item._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: item.quantity - 1 }),
    });
    getCart();
    notify();
  };

  // ── Single delete ──
  const deleteItem = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: "Remove item?",
      html: `<span style="color:#a1a1aa;font-size:14px">"${name}" will be removed from your cart.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: swal.cancel,
      background: swal.bg,
      color: swal.color,
    });
    if (!result.isConfirmed) return;

    animateAndRemove([id], async () => {
      await fetch(`/api/cart/${id}`, { method: "DELETE" });
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    });
  };

  // ── Bulk delete ──
  const deleteBulk = async () => {
    if (selectedIds.size === 0) return;
    const result = await Swal.fire({
      title: `Remove ${selectedIds.size} item${selectedIds.size > 1 ? "s" : ""}?`,
      html: `<span style="color:#a1a1aa;font-size:14px">Selected items will be removed from your cart.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove all",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: swal.cancel,
      background: swal.bg,
      color: swal.color,
    });
    if (!result.isConfirmed) return;

    const ids = [...selectedIds];
    animateAndRemove(ids, async () => {
      await Promise.all(ids.map((id) => fetch(`/api/cart/${id}`, { method: "DELETE" })));
      setSelectedIds(new Set());
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24 bg-zinc-900">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-zinc-900 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Shopping Cart</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {totalItems > 0 ? `${totalItems} item${totalItems !== 1 ? "s" : ""} in your cart` : "Your cart is empty"}
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="bg-zinc-800 rounded-2xl border border-zinc-700 flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-700 border border-zinc-600 mb-4">
              <ShoppingCart className="w-8 h-8 text-zinc-400" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">Your cart is empty</h2>
            <p className="text-zinc-500 text-sm mb-6">Browse our products and add something you like.</p>
            <Link href="/products" className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors shadow shadow-blue-500/20">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
            {/* ── LEFT — CART ITEMS ── */}
            <div className="bg-zinc-800 rounded-2xl border border-zinc-700 overflow-hidden">
              {/* Header with select-all + bulk delete */}
              <div className="px-4 sm:px-5 py-4 border-b border-zinc-700 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => setSelectedIds(e.target.checked ? new Set(cart.map((i) => i._id)) : new Set())}
                    className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
                  />
                  <h2 className="font-semibold text-zinc-200 text-sm">
                    {totalItems} item{totalItems !== 1 ? "s" : ""}
                    {selectedIds.size > 0 && (
                      <span className="ml-2 text-blue-400 font-normal">({selectedIds.size} selected)</span>
                    )}
                  </h2>
                </div>
                {selectedIds.size > 0 && (
                  <button
                    onClick={deleteBulk}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Remove </span>{selectedIds.size} selected
                  </button>
                )}
              </div>

              {/* Items */}
              <div className="divide-y divide-zinc-700">
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className={`flex gap-3 sm:gap-4 p-4 sm:p-5 transition-all duration-300 ease-in-out ${
                      deletingIds.has(item._id)
                        ? "opacity-0 translate-x-8 scale-95 pointer-events-none"
                        : "opacity-100 translate-x-0 scale-100"
                    } ${selectedIds.has(item._id) ? "bg-blue-500/5" : ""}`}
                  >
                    {/* Checkbox */}
                    <div className="flex items-start pt-1 shrink-0">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item._id)}
                        onChange={() => toggleSelect(item._id)}
                        className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
                      />
                    </div>

                    {/* IMAGE */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-zinc-700 rounded-xl border border-zinc-600 flex items-center justify-center p-2 shrink-0 overflow-hidden">
                      <img src={item.image} alt={item.name} className="max-h-full object-contain" />
                    </div>

                    {/* INFO */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-3">
                        <div>
                          <h3 className="font-semibold text-zinc-100 leading-snug line-clamp-2">{item.name}</h3>
                          <p className="text-green-400 text-xs mt-1 font-medium">In stock</p>
                          <p className="text-xs text-zinc-500 mt-0.5">FREE delivery Tomorrow</p>
                        </div>
                        <span className="text-xl font-bold text-zinc-50 shrink-0">₹{item.price * item.quantity}</span>
                      </div>

                      {/* QTY + DELETE */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center bg-zinc-700 border border-zinc-600 rounded-xl overflow-hidden select-none">
                          <button
                            onClick={() => decreaseQty(item)}
                            disabled={item.quantity <= 1}
                            className="px-2.5 sm:px-3.5 py-2 text-base font-bold text-zinc-300 hover:bg-zinc-600 hover:text-zinc-50 disabled:text-zinc-600 disabled:cursor-not-allowed transition-colors"
                          >
                            −
                          </button>
                          <span className="px-4 text-sm font-bold text-zinc-100 border-x border-zinc-600 py-2 min-w-10 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => increaseQty(item)}
                            className="px-2.5 sm:px-3.5 py-2 text-base font-bold text-zinc-300 hover:bg-zinc-600 hover:text-zinc-50 transition-colors"
                          >
                            +
                          </button>
                        </div>

                        <div className="w-px h-5 bg-zinc-600" />
                        <button
                          onClick={() => deleteItem(item._id, item.name)}
                          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal row */}
              <div className="px-4 sm:px-6 py-4 border-t border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-zinc-500 text-xs">
                  {selectedIds.size > 0
                    ? `${selectedIds.size} item${selectedIds.size > 1 ? "s" : ""} selected`
                    : "Select items to bulk remove"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 text-sm">Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""}):</span>
                  <span className="text-lg font-bold text-zinc-50">₹{total}</span>
                </div>
              </div>
            </div>

            {/* ── RIGHT — ORDER SUMMARY ── */}
            <div className="sticky top-20">
              <div className="bg-zinc-800 rounded-2xl border border-zinc-700 p-6">
                <h2 className="font-bold text-zinc-50 text-base mb-5">Order Summary</h2>

                <div className="space-y-3 text-sm mb-5">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})</span>
                    <span className="text-zinc-200 font-medium">₹{total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Delivery</span>
                    <span className="text-green-400 font-semibold">FREE</span>
                  </div>
                  <div className="border-t border-zinc-700 pt-3 flex justify-between font-bold text-zinc-50 text-base">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>

                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-3 font-semibold text-sm transition-colors shadow shadow-blue-500/20">
                  Proceed to Buy
                </button>

                <Link href="/products" className="block text-center text-xs text-zinc-500 hover:text-zinc-300 mt-4 transition-colors">
                  ← Continue shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
