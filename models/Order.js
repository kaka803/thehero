import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true,
  },
  customerInfo: {
    firstName: String,
    lastName: String,
    address: String,
    apartment: String,
    city: String,
    zipCode: String,
    phone: String,
    country: { type: String, default: "United States" }
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      name: String,
      quantity: Number,
      price: Number,
      variant: String,
      image: String,
      taxAmount: {
        type: Number,
        default: 0,
      }
    }
  ],
  subtotal: {
    type: Number,
    required: true,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  shippingFee: {
    type: Number,
    default: 0,
  },
  isDiscounted: {
    type: Boolean,
    default: false,
  },
  orderNumber: {
    type: Number, // Sequence number for this specific email
    required: true,
  },
  invoiceNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  trackingNumber: {
    type: String,
    default: "",
  },
  trackingLink: {
    type: String,
    default: "",
  },
  carrier: {
    type: String,
    default: "DHL",
  }
}, {
  timestamps: true,
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
