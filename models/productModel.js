
const mongoose= require('mongoose');


const productSchema = mongoose.Schema({

  productName:{
    type:String,
   
  },
  productPrice:{
    type:Number,
    
  },
  category:{
    type:String,
  },
  brand:{
    type:String,
   
  },
  productStock:{
    type:Number,
    
  },
  productDescription:{
    type:String,
 
  },
  productImage1: {
    type: String,
   
  },
  productImage2: {
    type: String,
    
  },
  productImage3: {
    type: String,
 
  },
  productImage4: {
    type: String,
 
  },
 
  is_listed:{
    type:Boolean,
    default: true, 
  },
  discountedPrice:{
    type:Number
  },


},{
  timestamps:true
},

)


const productCollection= mongoose.model('products',productSchema)




module.exports=productCollection;
