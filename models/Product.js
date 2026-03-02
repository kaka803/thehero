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
    calories: String,
    fat: String,
    carbs: String,
    sugar: String,
    protein: String,
    salt: String,
    extract: String,
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
}, {
  timestamps: true,
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
