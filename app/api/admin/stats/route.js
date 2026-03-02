import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { verifyAdminAuth } from "@/lib/auth";

export async function GET() {
  if (!await verifyAdminAuth()) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    await dbConnect();

    // 1. Total Revenue (sum of all order totals)
    const revenueData = await Order.aggregate([
      { $group: { _id: null, totalSales: { $sum: "$total" } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalSales : 0;

    // 2. Total Orders
    const totalOrders = await Order.countDocuments();

    // 3. Total Customers (unique emails)
    const distinctEmails = await Order.distinct("email");
    const totalCustomers = distinctEmails.length;

    // 4. Total Products
    const totalProducts = await Product.countDocuments();

    // 5. Low Stock Products (stock < 10)
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } }).limit(5);

    // 6. Recent Orders
    const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(5);

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
      },
      lowStock: lowStockProducts,
      recentOrders: recentOrders
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
