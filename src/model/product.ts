import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
  name: String,
  originalPrice: Number,
  discountedPrice: Number,
  images: [String],
  createdAt: { type: Date, default: Date.now }
});

const ProductModel = mongoose.model('product', productSchema);
export default ProductModel