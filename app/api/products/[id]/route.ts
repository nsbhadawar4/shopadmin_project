import { connectDB } from "@/app/lib/db";
import Product from "@/app/models/Product";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const product = await Product.findById(id);
  if (!product) return Response.json({ error: "Not found" }, { status: 404 });

  const obj = product.toObject();
  if (!obj.images || obj.images.length === 0) {
    obj.images = obj.image ? [obj.image] : [];
  }
  return Response.json(obj);
}
