import { NextResponse } from "next/server";

import { connectDB } from "@/app/lib/db";

import Cart from "@/app/models/Cart";

// UPDATE QUANTITY
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await connectDB();

  const { id } = await params;

  const body = await req.json();

  const updated = await Cart.findByIdAndUpdate(
    id,
    {
      quantity: body.quantity,
    },
    {
      new: true,
    },
  );

  return NextResponse.json(updated);
}

// DELETE ITEM
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await connectDB();

  const { id } = await params;

  await Cart.findByIdAndDelete(id);

  return NextResponse.json({
    message: "Deleted",
  });
}
