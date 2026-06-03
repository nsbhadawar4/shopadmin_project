import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectDB } from "@/app/lib/db";
import Admin from "@/app/models/Admin";

export async function POST(req: Request) {
  await connectDB();

  const { email, password } = await req.json();

  const admin = await Admin.findOne({ email });

  if (!admin) {
    return NextResponse.json({ message: "Invalid email" }, { status: 401 });
  }

  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    return NextResponse.json({ message: "Wrong password" }, { status: 401 });
  }

  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });

  return NextResponse.json({ token });
}
