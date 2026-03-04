import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import Settings from "@/models/Settings";
import { sendOrderEmail, sendAdminOrderNotification } from "@/lib/mail";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { email, customerInfo, items, subtotal, discountAmount, total, isDiscounted } = body;

    // 1. Manage User Data
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        ...customerInfo,
        totalOrders: 1,
        totalSpent: total,
      });
    } else {
      user.totalOrders += 1;
      user.totalSpent += total;
      // Update info in case it changed
      Object.assign(user, customerInfo);
      await user.save();
    }

    // 2. Continuous Invoice Number Sequence
    const currentYear = new Date().getFullYear();
    const sequenceKey = `invoice_sequence_${currentYear}`;
    
    // Atomically increment the sequence
    const sequenceDoc = await Settings.findOneAndUpdate(
      { key: sequenceKey },
      { $inc: { value: 1 } },
      { upsert: true, new: true }
    );

    const sequenceNumber = sequenceDoc.value;
    const formattedSequence = sequenceNumber.toString().padStart(4, '0');
    const invoiceNumber = `HH-${currentYear}-${formattedSequence}`;

    // 3. Find how many orders this email has placed before (keep for logic if needed)
    const previousOrdersCount = await Order.countDocuments({ email });
    const currentOrderNumber = previousOrdersCount + 1;

    // 4. Create the order
    const newOrder = await Order.create({
      email,
      customerInfo,
      items,
      subtotal,
      discountAmount,
      total,
      isDiscounted,
      orderNumber: currentOrderNumber,
      invoiceNumber,
    });

    // Update user's order history
    user.orderHistory.push(newOrder._id);
    await user.save();

    // 5. Send confirmation emails (don't block the response)
    sendOrderEmail(newOrder).catch(err => console.error("Customer email send failed:", err));
    sendAdminOrderNotification(newOrder).catch(err => console.error("Admin email notification failed:", err));

    return NextResponse.json({
      success: true,
      order: newOrder,
      orderCount: currentOrderNumber,
      invoiceNumber,
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
