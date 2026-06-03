import { NextResponse } from "next/server";

import { connectDB } from "@/app/lib/db";

import Cart from "@/app/models/Cart";

// GET CART
export async function GET() {
  await connectDB();

  const cart = await Cart.find();

  return NextResponse.json(cart);
}

// ADD TO CART
export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();

  const cartItem = await Cart.create(body);

  return NextResponse.json(cartItem);
}
