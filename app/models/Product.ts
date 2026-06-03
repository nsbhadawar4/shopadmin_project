import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    price: Number,
    rating: Number,
    image: String,
    images: { type: [String], default: [] },
    // ── New e-commerce fields (all optional) ──
    category: { type: String, default: "" },
    discount: { type: Number, default: 0 },   // percentage 0-100
    stock: { type: Number, default: 0 },      // 0 = out of stock
    sizes: { type: [String], default: [] },   // ["S","M","L","XL"]
    colors: { type: [String], default: [] },  // ["Red","Blue","Black"]
  },
  { timestamps: true }
);

try { mongoose.deleteModel("Product"); } catch { /* not yet registered */ }

export default mongoose.model("Product", ProductSchema);
