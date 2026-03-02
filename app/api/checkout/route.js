import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Settings from "@/models/Settings";
import { sendOrderEmail, sendAdminOrderNotification } from "@/lib/mail";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { email, customerInfo, items, subtotal, discountAmount, total, isDiscounted } = body;

    // 1. Find how many orders this email has placed before
    const previousOrdersCount = await Order.countDocuments({ email });
    const currentOrderNumber = previousOrdersCount + 1;

    // 2. Create the order
    const newOrder = await Order.create({
      email,
      customerInfo,
      items,
      subtotal,
      discountAmount,
      total,
      isDiscounted,
      orderNumber: currentOrderNumber,
    });

    // 3. Send confirmation emails (don't block the response)
    sendOrderEmail(newOrder).catch(err => console.error("Customer email send failed:", err));
    sendAdminOrderNotification(newOrder).catch(err => console.error("Admin email notification failed:", err));

    return NextResponse.json({
      success: true,
      order: newOrder,
      orderCount: currentOrderNumber,
      nextRewardThreshold: 5,
    }, { status: 201 });

  } catch (error) {
    console.error("Order Creation Error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to place order",
      error: error.message
    }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ success: false, message: "Email required" }, { status: 400 });
    }

    const orderCount = await Order.countDocuments({ email });

    return NextResponse.json({
      success: true,
      orderCount,
    });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
