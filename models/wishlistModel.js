const mongoose = require('mongoose')


const wishlistSchema = new mongoose.Schema(
    {
      userId:{type:mongoose.Types.ObjectId,required:true, ref:'users'},
      productId:{type:mongoose.Types.ObjectId,required:true,ref:'products'}
    }
)

const wishlistCollection = mongoose.model('wishlist',wishlistSchema);

module.exports = wishlistCollection;