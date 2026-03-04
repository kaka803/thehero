import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  firstName: String,
  lastName: String,
  phone: String,
  address: String,
  apartment: String,
  city: String,
  state: String,
  zipCode: String,
  country: { 
    type: String, 
    default: "Germany" 
  },
  orderHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    }
  ],
  totalOrders: {
    type: Number,
    default: 0,
  },
  totalSpent: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
