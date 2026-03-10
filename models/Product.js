import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  details: {
    type: String,
  },
  longDescription: {
    type: String,
  },
  image: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: "#d3b673",
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["live", "coming-soon"],
    default: "live",
  },
  nutrition: {
    energyKcal: String,
    energyKj: String,
    fat: String,
    saturatedFat: String,
    carbohydrates: String,
    sugar: String,
    protein: String,
    salt: String,
    fiber: String,
  },
  ingredients: {
    type: [String],
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  specialLabel: {
    type: String,
    enum: [null, "hummus", "tahini"],
    default: null,
  },
  taxRate: {
    type: Number,
    default: 0, // Percentage, e.g., 7 or 19
  },
  traySize: {
    type: Number,
    default: 12,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
