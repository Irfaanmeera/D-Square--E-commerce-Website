const mongoose = require('mongoose')

const cartSchema = mongoose.Schema({
userId :{
  type: mongoose.Types.ObjectId,
  required:true,
  ref:'users',
},
productId:{
    type: mongoose.Types.ObjectId,
    required:true,
    ref:'products',
},
productQuantity:{
    type:Number,
    default:1,
    min:1,
},
totalCostPerProduct:{
    type:Number,
    
}
},
{
    srictPopulate:false,
});

const cartCollection = mongoose.model('carts', cartSchema)

module.exports = cartCollection;