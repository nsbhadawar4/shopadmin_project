import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/app/lib/db";
import Admin from "@/app/models/Admin";

export async function GET() {
  await connectDB();

  const hashed = await bcrypt.hash("narayan123", 10);

  const admin = await Admin.create({
    email: "narayan@gmail.com",
    password: hashed,
  });

  return NextResponse.json(admin);
}
