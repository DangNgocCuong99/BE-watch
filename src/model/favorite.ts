import mongoose from "mongoose";
const favoriteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    createdAt: { type: Date, default: Date.now }
  });

 const FavoriteModel = mongoose.model('favorite', favoriteSchema);
 export default FavoriteModel