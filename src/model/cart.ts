import mongoose from "mongoose";
const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: Number,
  createdAt: { type: Date, default: Date.now }
});
const CartModel = mongoose.model('cart', cartSchema);
export default CartModel