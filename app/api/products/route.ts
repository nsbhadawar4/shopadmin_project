import { connectDB } from "@/app/lib/db";
import Product from "@/app/models/Product";

// GET PRODUCTS
export async function GET() {
  await connectDB();
  const products = await Product.find().sort({ _id: -1 });
  // OLD PRODUCTS FIX
  const normalized = products.map((p) => {
    const obj = p.toObject();

    if (!obj.images || obj.images.length === 0) {
      obj.images = obj.image ? [obj.image] : [];
    }

    return obj;
  });
  return Response.json(normalized);
}

// ADD PRODUCT
export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();

  const images: string[] = (body.images || []).filter(Boolean);

  const image = images[0] || "";

  const product = await Product.create({
    ...body,
    image,
    images,
  });

  return Response.json(product);
}

// DELETE PRODUCT
export async function DELETE(req: Request) {
  await connectDB();

  const { id } = await req.json();

  await Product.findByIdAndDelete(id);

  return Response.json({
    message: "Deleted",
  });
}

// UPDATE PRODUCT
export async function PUT(req: Request) {
  await connectDB();

  const { id, ...data } = await req.json();

  const images: string[] = (data.images || []).filter(Boolean);

  const image = images[0] || "";

  await Product.findByIdAndUpdate(id, {
    ...data,
    image,
    images,
  });

  return Response.json({
    message: "Updated",
  });
}
