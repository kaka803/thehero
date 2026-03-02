import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";

export async function GET() {
  await dbConnect();
  try {
    const products = await Product.find({}).sort({ sortOrder: 1, createdAt: -1 });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!await verifyAdminAuth()) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();
  try {
    const data = await request.json();
    
    // If specialLabel is provided, clear it from all other products
    if (data.specialLabel) {
      await Product.updateMany(
        { specialLabel: data.specialLabel },
        { $set: { specialLabel: null } }
      );
    }

    const product = await Product.create(data);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
