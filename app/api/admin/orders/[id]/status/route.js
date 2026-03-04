import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { verifyAdminAuth } from "@/lib/auth";
import { sendStatusUpdateEmail } from "@/lib/mail";

export async function PATCH(req, { params }) {
  if (!await verifyAdminAuth()) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, trackingNumber, trackingLink, carrier } = body;

    await dbConnect();
    
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { 
        status, 
        trackingNumber, 
        trackingLink, 
        carrier: carrier || "DHL" 
      },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // Trigger email notification
    sendStatusUpdateEmail(updatedOrder).catch(err => console.error("Status update email failed:", err));

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
