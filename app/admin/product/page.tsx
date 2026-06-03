"use client";
import Pagination from "@/app/components/Pagination";
import { ImageUpIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";

type ProductType = {
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

type FormType = {
  name: string;
  description: string;
  price: string;
  rating: string;
  category: string;
  discount: string;
  stock: string;
};

const emptyForm: FormType = {
  name: "",
  description: "",
  price: "",
  rating: "",
  category: "",
  discount: "",
  stock: "",
};

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "Free Size"];

const PRESET_COLORS = [
  { name: "Black", hex: "#18181b" },
  { name: "White", hex: "#e4e4e7" },
  { name: "Red", hex: "#ef4444" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Green", hex: "#22c55e" },
  { name: "Yellow", hex: "#eab308" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Purple", hex: "#a855f7" },
  { name: "Orange", hex: "#f97316" },
  { name: "Gray", hex: "#71717a" },
  { name: "Sky Blue", hex: "#38bdf8" },
  { name: "Lavender", hex: "#c4b5fd" },
  { name: "Brown", hex: "#a16207" },
  { name: "Navy", hex: "#1e3a5f" },
  { name: "Maroon", hex: "#9b1c1c" },
  { name: "Teal", hex: "#0d9488" },
  { name: "Olive", hex: "#4d7c0f" },
  { name: "Beige", hex: "#d4c5a9" },
  { name: "Coral", hex: "#f87171" },
  { name: "Turquoise", hex: "#06b6d4" },
  { name: "Cream", hex: "#fef3c7" },
  { name: "Burgundy", hex: "#831843" },
];

const TABLE_PER_PAGE = 10;

const swal = {
  bg: "#27272a",
  color: "#fafafa",
  confirm: "#3b82f6",
  cancel: "#52525b",
};

// Compress an image File to max 800px, 75% JPEG quality (~50-80 KB each)
function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX = 800;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width >= height) {
          height = Math.round((height * MAX) / width);
          width = MAX;
        } else {
          width = Math.round((width * MAX) / height);
          height = MAX;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.src = objectUrl;
  });
}

// ── Animation variants ──────────────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: EASE },
  }),
};

const slideLeft = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

const slideRight = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, delay: 0.05, ease: EASE },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: i * 0.04, ease: "easeOut" as const },
  }),
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

export default function Admin() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [form, setForm] = useState<FormType>(emptyForm);
  const [images, setImages] = useState<string[]>([""]);
  const [editId, setEditId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [tablePage, setTablePage] = useState(1);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [outOfStock, setOutOfStock] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const getProducts = useCallback(async () => {
    const res = await fetch("/api/products");
    setProducts(await res.json());
  }, []);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/products");
      setProducts(await res.json());
      setLoading(false);
    })();
  }, []);

  // ── Image helpers ──────────────────────────────────────────────────────────
  const updateImage = (i: number, val: string) =>
    setImages((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });

  const addImageField = () => {
    if (images.length < 10) setImages((p) => [...p, ""]);
  };

  const removeImageField = (i: number) => {
    if (fileRefs.current[i]) fileRefs.current[i]!.value = "";
    setImages((p) => (p.length === 1 ? [""] : p.filter((_, idx) => idx !== i)));
  };

  const validImages = () => images.filter((u) => u.trim() !== "");
  const toggleSize = (s: string) =>
    setSizes((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  const toggleColor = (c: string) =>
    setColors((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const result = await Swal.fire({
      title: `Delete ${selectedIds.size} product${selectedIds.size > 1 ? "s" : ""}?`,
      html: `<span style="color:#a1a1aa;font-size:14px">This action cannot be undone.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete all",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: swal.cancel,
      background: swal.bg,
      color: swal.color,
    });
    if (!result.isConfirmed) return;
    for (const id of selectedIds) {
      await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    }
    const count = selectedIds.size;
    setSelectedIds(new Set());
    await Swal.fire({
      icon: "success",
      title: `${count} deleted!`,
      timer: 1500,
      showConfirmButton: false,
      background: swal.bg,
      color: swal.color,
    });
    getProducts();
  };

  // ── Submit (add / update) ──────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.name.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "Name required",
        text: "Please enter a product name.",
        background: swal.bg,
        color: swal.color,
        confirmButtonColor: swal.confirm,
      });
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      const imgs = validImages();
      const payload = {
        ...form,
        price: Number(form.price),
        rating: Number(form.rating),
        discount: Number(form.discount) || 0,
        stock: outOfStock ? 0 : Number(form.stock),
        images: imgs,
        image: imgs[0] || "",
        sizes,
        colors,
      };

      const res = await fetch("/api/products", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editId ? { id: editId, ...payload } : payload),
      });

      if (res.ok) {
        await Swal.fire({
          icon: "success",
          title: editId ? "Product Updated!" : "Product Added!",
          timer: 1500,
          showConfirmButton: false,
          background: swal.bg,
          color: swal.color,
        });
        setForm(emptyForm);
        setImages([""]);
        setSizes([]);
        setColors([]);
        setOutOfStock(false);
        fileRefs.current = [];
        setEditId(null);
        setTablePage(1);
        getProducts();
      } else {
        const err = await res.json().catch(() => ({}));
        await Swal.fire({
          icon: "error",
          title: "Failed",
          text: err?.message || "Something went wrong. Try again.",
          background: swal.bg,
          color: swal.color,
          confirmButtonColor: swal.confirm,
        });
      }
    } catch {
      await Swal.fire({
        icon: "error",
        title: "Network error",
        text: "Check your connection and try again. Images may be too large.",
        background: swal.bg,
        color: swal.color,
        confirmButtonColor: swal.confirm,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete with confirmation ───────────────────────────────────────────────
  const deleteProduct = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: "Delete product?",
      html: `<span style="color:#a1a1aa;font-size:14px">"${name}" will be permanently removed.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: swal.cancel,
      background: swal.bg,
      color: swal.color,
    });
    if (!result.isConfirmed) return;

    await fetch("/api/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    await Swal.fire({
      icon: "success",
      title: "Deleted!",
      timer: 1200,
      showConfirmButton: false,
      background: swal.bg,
      color: swal.color,
    });
    getProducts();
  };

  const editProduct = (p: ProductType) => {
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      rating: String(p.rating),
      category: p.category || "",
      discount: String(p.discount || 0),
      stock: String(p.stock || 0),
    });
    setImages(p.images?.length ? p.images : [""]);
    setSizes(p.sizes || []);
    setColors(p.colors || []);
    setOutOfStock((p.stock ?? 1) === 0);
    setEditId(p._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm(emptyForm);
    setImages([""]);
    setSizes([]);
    setColors([]);
    setOutOfStock(false);
    fileRefs.current = [];
  };

  const inputCls =
    "w-full bg-zinc-700/80 border border-zinc-600/80 rounded-xl px-3 py-2.5 text-sm text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/50 focus:bg-zinc-700 transition-all duration-200";

  const field = (
    label: string,
    key: keyof FormType,
    placeholder: string,
    extra = "",
  ) => (
    <div className={extra}>
      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <input
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className={inputCls}
      />
    </div>
  );

  const previewImages = validImages();
  const paginatedProducts = products.slice(
    (tablePage - 1) * TABLE_PER_PAGE,
    tablePage * TABLE_PER_PAGE,
  );

  // Derived stats
  const inStockCount = products.filter((p) => (p.stock ?? 1) > 0).length;
  const outOfStockCount = products.filter((p) => (p.stock ?? 1) === 0).length;

  return (
    <div className="px-4 py-8 md:px-8 max-w-7xl mx-auto w-full">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        custom={0}
        initial="hidden"
        animate="visible"
        className="mb-7"
      >
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-50 tracking-tight bg-linear-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Product Management
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              {products.length} product{products.length !== 1 ? "s" : ""} in catalogue
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Total", value: products.length, color: "blue" },
            { label: "In Stock", value: inStockCount, color: "green" },
            { label: "Out of Stock", value: outOfStockCount, color: "red" },
          ].map(({ label, value, color }, i) => (
            <motion.div
              key={label}
              variants={fadeUp}
              custom={i + 1}
              initial="hidden"
              animate="visible"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                color === "blue"
                  ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                  : color === "green"
                    ? "bg-green-500/10 border-green-500/20 text-green-400"
                    : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  color === "blue" ? "bg-blue-400" : color === "green" ? "bg-green-400" : "bg-red-400"
                }`}
              />
              {label}:{" "}
              <motion.span
                key={value}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                {value}
              </motion.span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-12 gap-4">
        {/* ── FORM CARD ─────────────────────────────────────────────────── */}
        <motion.div
          variants={slideLeft}
          initial="hidden"
          animate="visible"
          className="col-span-12 md:col-span-4"
        >
          <div
            className={`relative bg-zinc-800/80 rounded-2xl border overflow-hidden backdrop-blur-sm transition-colors duration-300 ${
              editId ? "border-amber-500/30 shadow-lg shadow-amber-500/5" : "border-zinc-700/60 hover:border-zinc-600/60"
            }`}
          >
            {/* Gradient accent line */}
            <div
              className={`h-0.5 w-full ${
                editId
                  ? "bg-linear-to-r from-amber-500/80 via-amber-400/60 to-transparent"
                  : "bg-linear-to-r from-blue-500/80 via-blue-400/60 to-transparent"
              }`}
            />

            <div className="p-5">
              <div className="flex items-center gap-3 mb-5">
                <motion.div
                  animate={{ rotate: editId ? [0, -10, 10, 0] : 0 }}
                  transition={{ duration: 0.4 }}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-lg ${
                    editId
                      ? "bg-linear-to-br from-amber-400 to-amber-600 shadow-amber-500/30"
                      : "bg-linear-to-br from-blue-500 to-blue-700 shadow-blue-500/30"
                  }`}
                >
                  {editId ? "✎" : "+"}
                </motion.div>
                <div>
                  <h2 className="font-bold text-zinc-100 text-sm">
                    {editId ? "Edit Product" : "Add New Product"}
                  </h2>
                  <p className="text-[11px] text-zinc-500">
                    {editId ? "Update product details" : "Fill in the product details"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {field("Product Name", "name", "e.g. Running Shoes")}
                {field("Description", "description", "Short product description")}
                <div className="grid grid-cols-2 gap-3">
                  {field("Price (₹)", "price", "0")}
                  {field("Rating (1–5)", "rating", "4.5")}
                </div>

                {field("Category", "category", "e.g. Men, Women, Electronics")}

                <div className="grid grid-cols-2 gap-3">
                  {field("Discount %", "discount", "0")}
                  {field("Stock Qty", "stock", "100")}
                </div>

                {/* Out of Stock toggle */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  disabled={!editId && !form.name.trim()}
                  onClick={() => {
                    setOutOfStock((o) => {
                      if (o && Number(form.stock) === 0) {
                        setForm((f) => ({ ...f, stock: "1" }));
                      }
                      return !o;
                    });
                  }}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border transition-all ${
                    !editId && !form.name.trim()
                      ? "bg-zinc-800 border-zinc-700/50 opacity-50 cursor-not-allowed"
                      : outOfStock
                        ? "bg-red-500/10 border-red-500/40 text-red-400 cursor-pointer"
                        : "bg-zinc-700/60 border-zinc-600/60 text-zinc-300 cursor-pointer hover:bg-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.3 }}
                      key={String(outOfStock)}
                      className={`w-2 h-2 rounded-full ${outOfStock ? "bg-red-400" : "bg-green-400"}`}
                    />
                    <span className="text-sm font-semibold">
                      {outOfStock ? "Out of Stock" : "In Stock"}
                    </span>
                    <span className="text-xs text-zinc-500 hidden sm:inline">
                      {!editId && !form.name.trim()
                        ? "— enter name to enable"
                        : outOfStock
                          ? "— stock = 0"
                          : "— use Qty field"}
                    </span>
                  </div>
                  <div
                    className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 ${outOfStock ? "bg-red-500" : "bg-zinc-600"}`}
                  >
                    <motion.span
                      layout
                      animate={{ x: outOfStock ? 22 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
                    />
                  </div>
                </motion.button>

                {/* ── SIZES ── */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">
                    Sizes{" "}
                    <span className="text-zinc-600 normal-case font-normal">(optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_SIZES.map((s) => (
                      <motion.button
                        key={s}
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleSize(s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          sizes.includes(s)
                            ? "bg-blue-500 border-blue-500 text-white shadow shadow-blue-500/20"
                            : "bg-zinc-700/60 border-zinc-600/60 text-zinc-400 hover:border-zinc-500"
                        }`}
                      >
                        {s}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* ── COLORS ── */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">
                    Colors{" "}
                    <span className="text-zinc-600 normal-case font-normal">(optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((c) => (
                      <motion.button
                        key={c.name}
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleColor(c.name)}
                        title={c.name}
                        className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                          colors.includes(c.name)
                            ? "border-blue-400 scale-110 shadow-lg shadow-black/30"
                            : "border-zinc-600"
                        }`}
                        style={{ backgroundColor: c.hex }}
                      >
                        <AnimatePresence>
                          {colors.includes(c.name) && (
                            <motion.svg
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="w-3 h-3 text-white drop-shadow"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </motion.svg>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    ))}
                  </div>
                  {colors.length > 0 && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-zinc-500 mt-1.5"
                    >
                      {colors.join(", ")}
                    </motion.p>
                  )}
                </div>

                {/* ── IMAGES ── */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                      Images
                    </label>
                    <span
                      className={`text-xs font-semibold ${images.length >= 10 ? "text-amber-400" : "text-zinc-500"}`}
                    >
                      {images.length} / 10
                    </span>
                  </div>

                  <div className="space-y-2">
                    {images.map((url, i) => {
                      const isFile = url.startsWith("data:");
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-2"
                        >
                          <input
                            placeholder={isFile ? "Uploaded from gallery" : `Image URL ${i + 1}`}
                            value={isFile ? "" : url}
                            disabled={isFile}
                            onChange={(e) => updateImage(i, e.target.value)}
                            className={`flex-1 bg-zinc-700/80 border rounded-xl px-3 py-2.5 text-sm text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/50 transition-all duration-200 w-1.5 ${
                              isFile ? "border-green-500/40 opacity-60 cursor-not-allowed" : "border-zinc-600/80"
                            }`}
                          />
                          <label
                            title="Upload from gallery"
                            className={`flex items-center gap-1.5 px-3 rounded-xl border cursor-pointer text-xs font-semibold transition-all shrink-0 ${
                              isFile
                                ? "bg-green-500/10 border-green-500/30 text-green-400"
                                : "bg-zinc-700/60 border-zinc-600/60 text-zinc-400 hover:bg-zinc-600 hover:text-zinc-200"
                            }`}
                          >
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              ref={(el) => { fileRefs.current[i] = el; }}
                              onChange={async (e) => {
                                const files = e.target.files;
                                if (!files || !files.length) return;
                                const limited = Array.from(files).slice(0, 10);
                                const compressed = await Promise.all(limited.map(compressImage));
                                setImages(compressed);
                              }}
                            />
                            {isFile ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <ImageUpIcon />
                            )}
                            <span className="hidden sm:inline">{isFile ? "Done" : "Gallery"}</span>
                          </label>
                          <button
                            onClick={() => removeImageField(i)}
                            className="px-2.5 h-10 w-10 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors font-bold text-base shrink-0"
                            aria-label="Remove"
                          >
                            ×
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>

                  {images.length < 10 && (
                    <button
                      onClick={addImageField}
                      className="mt-2 w-full py-2 rounded-xl border border-dashed border-zinc-600/60 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 text-xs transition-colors"
                    >
                      + Add another image
                    </button>
                  )}
                </div>

                {/* Preview strip */}
                <AnimatePresence>
                  {previewImages.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-2 overflow-x-auto pb-3 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-zinc-700 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-500 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-blue-500"
                    >
                      {images.map((url, idx) =>
                        url.trim() ? (
                          <motion.div
                            key={idx}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: idx * 0.04 }}
                            className="relative shrink-0 group/preview"
                          >
                            <div className="w-16 h-16 rounded-xl border border-zinc-600 bg-zinc-700 overflow-hidden">
                              <img src={url} alt={`preview ${idx + 1}`} className="w-full h-full object-cover" />
                            </div>
                            <span className="absolute bottom-1 left-1 bg-zinc-900/80 text-zinc-300 text-[9px] font-semibold px-1 rounded">
                              {idx + 1}
                            </span>
                            <button
                              onClick={() => removeImageField(idx)}
                              className="absolute top-0 right-0 w-5 h-5 rounded-full bg-red-500 hover:bg-red-400 text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity shadow-md leading-none"
                              aria-label="Remove image"
                            >
                              ×
                            </button>
                          </motion.div>
                        ) : null,
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit / Cancel */}
                <div className="flex gap-2 pt-1">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubmit}
                    disabled={submitting}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2 shadow-lg ${
                      submitting
                        ? "bg-zinc-600 cursor-not-allowed opacity-70 shadow-none"
                        : editId
                          ? "bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-amber-500/20"
                          : "bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-blue-500/20"
                    }`}
                  >
                    {submitting && (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {submitting ? (editId ? "Updating…" : "Adding…") : editId ? "Update Product" : "Add Product"}
                  </motion.button>
                  {editId && (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={cancelEdit}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 bg-zinc-700/60 hover:bg-zinc-700 border border-zinc-600/60 transition-colors"
                    >
                      Cancel
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── TABLE CARD ────────────────────────────────────────────────── */}
        <motion.div
          variants={slideRight}
          initial="hidden"
          animate="visible"
          className="col-span-12 md:col-span-8"
        >
          <div className="bg-zinc-800/80 rounded-2xl border border-zinc-700/60 overflow-hidden backdrop-blur-sm relative">
            {/* Gradient accent line */}
            <div className="h-0.5 w-full bg-linear-to-r from-transparent via-zinc-600/50 to-transparent" />

            <div className="px-4 sm:px-6 py-4 border-b border-zinc-700/60 flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h2 className="font-bold text-zinc-200 text-sm">All Products</h2>
                {products.length > TABLE_PER_PAGE && (
                  <span className="text-xs text-zinc-500">
                    {(tablePage - 1) * TABLE_PER_PAGE + 1}–
                    {Math.min(tablePage * TABLE_PER_PAGE, products.length)} of {products.length}
                  </span>
                )}
              </div>
              <AnimatePresence>
                {selectedIds.size > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete ({selectedIds.size})
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-zinc-900 [&::-webkit-scrollbar-thumb]:bg-zinc-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-blue-500">
              <table className="w-full min-w-160 text-sm">
                <thead>
                  <tr className="bg-zinc-900/60 border-b border-zinc-700/60 text-left">
                    <th className="pl-2 sm:pl-4 pr-1 sm:pr-2 py-3 w-8">
                      <input
                        type="checkbox"
                        checked={
                          paginatedProducts.length > 0 &&
                          paginatedProducts.every((p) => selectedIds.has(p._id))
                        }
                        onChange={(e) =>
                          setSelectedIds(
                            e.target.checked
                              ? new Set(paginatedProducts.map((p) => p._id))
                              : new Set(),
                          )
                        }
                        className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
                      />
                    </th>
                    {["Image", "Product", "Price", "Rating", "Actions"].map((h) => (
                      <th
                        key={h}
                        className={`px-2 sm:px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider ${h === "Actions" ? "text-right" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700/40">
                  {loading ? (
                    // Loading skeleton rows
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="pl-4 py-4"><div className="w-4 h-4 bg-zinc-700 rounded" /></td>
                        <td className="px-5 py-4"><div className="w-12 h-12 bg-zinc-700 rounded-xl" /></td>
                        <td className="px-5 py-4">
                          <div className="h-3 bg-zinc-700 rounded w-24 mb-2" />
                          <div className="h-2.5 bg-zinc-800 rounded w-16" />
                        </td>
                        <td className="px-5 py-4"><div className="h-3 bg-zinc-700 rounded w-12" /></td>
                        <td className="px-5 py-4"><div className="h-6 bg-zinc-700 rounded-lg w-14" /></td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <div className="h-7 w-12 bg-zinc-700 rounded-lg" />
                            <div className="h-7 w-14 bg-zinc-700 rounded-lg" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center gap-2"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-zinc-700/60 flex items-center justify-center text-2xl">
                            📦
                          </div>
                          <p className="text-zinc-500 text-sm font-medium">No products yet</p>
                          <p className="text-zinc-600 text-xs">Add your first product using the form</p>
                        </motion.div>
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {paginatedProducts.map((p, i) => (
                        <motion.tr
                          key={p._id}
                          custom={i}
                          variants={rowVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          layout
                          className={`transition-colors ${
                            selectedIds.has(p._id)
                              ? "bg-blue-500/5"
                              : editId === p._id
                                ? "bg-amber-500/5 border-l-2 border-amber-500/60"
                                : "hover:bg-zinc-700/30"
                          }`}
                        >
                          <td className="pl-2 sm:pl-4 pr-1 sm:pr-2 py-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(p._id)}
                              onChange={() => toggleSelect(p._id)}
                              className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-2 sm:px-5 py-3">
                            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-zinc-600/60 bg-zinc-700/60 overflow-hidden flex items-center justify-center shrink-0">
                              {p.images?.[0] && (
                                <img
                                  src={p.images[0]}
                                  alt={p.name}
                                  className="object-contain w-full h-full"
                                />
                              )}
                              {p.images?.length > 1 && (
                                <span className="absolute bottom-0 right-0 text-[9px] bg-blue-500 text-white px-1 rounded-tl font-bold">
                                  {p.images.length}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 sm:px-5 py-3 max-w-0">
                            <p className="font-semibold text-zinc-100 truncate">{p.name}</p>
                            <p className="text-xs text-zinc-500 mt-0.5 truncate">{p.description}</p>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {p.category && (
                                <span className="text-[10px] bg-zinc-700/60 text-zinc-400 px-1.5 py-0.5 rounded">
                                  {p.category}
                                </span>
                              )}
                              {(p.discount ?? 0) > 0 && (
                                <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">
                                  {p.discount}% OFF
                                </span>
                              )}
                              {(p.stock ?? 0) === 0 && (
                                <span className="text-[10px] bg-zinc-700/60 text-zinc-500 px-1.5 py-0.5 rounded">
                                  Out of Stock
                                </span>
                              )}
                              {(p.stock ?? 0) > 0 && (
                                <span className="text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded">
                                  Stock: {p.stock}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 sm:px-5 py-3 font-semibold text-zinc-200 whitespace-nowrap">
                            ₹{p.price}
                          </td>
                          <td className="px-2 sm:px-5 py-3">
                            <span className="inline-flex items-center gap-1 text-amber-400 font-semibold text-xs bg-amber-400/10 border border-amber-400/20 px-2 py-1 rounded-lg">
                              ★ {p.rating}
                            </span>
                          </td>
                          <td className="px-2 sm:px-5 py-3 text-right whitespace-nowrap">
                            <div className="flex justify-end gap-1 sm:gap-2">
                              <motion.button
                                whileTap={{ scale: 0.93 }}
                                onClick={() => editProduct(p)}
                                className="px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-colors"
                              >
                                Edit
                              </motion.button>
                              <motion.button
                                whileTap={{ scale: 0.93 }}
                                onClick={() => deleteProduct(p._id, p.name)}
                                className="px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                              >
                                Delete
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>

            {products.length > TABLE_PER_PAGE && (
              <div className="px-4 sm:px-6 pb-6">
                <Pagination
                  page={tablePage}
                  total={products.length}
                  perPage={TABLE_PER_PAGE}
                  onChange={setTablePage}
                />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
