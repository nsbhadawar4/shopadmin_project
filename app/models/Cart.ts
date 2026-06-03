import mongoose from "mongoose";

const CartSchema = new mongoose.Schema(
  {
    productId: String,
    name: String,
    image: String,
    price: Number,
    quantity: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.models.Cart || mongoose.model("Cart", CartSchema);
