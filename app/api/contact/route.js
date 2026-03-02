import { NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/mail";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const result = await sendContactEmail({ name, email, subject, message });

    if (result.success) {
      return NextResponse.json({ success: true, message: "Message sent successfully" });
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to send message", 
      error: error.message 
    }, { status: 500 });
  }
}
