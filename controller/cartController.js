const cartCollection = require('../models/cartModel')
const productCollection = require('../models/productModel')




//calculating grandTotal
async function grandTotal(req) {
    try {
      let userCartData = await cartCollection
        .find({ userId: req.session.user._id })
        .populate("productId");
      let grandTotal = 0;
      for (const item of userCartData) {
        grandTotal += item.productId.productPrice * item.productQuantity;
        await cartCollection.updateOne(
          { _id: item._id },
          {
            $set: {
              totalCostPerProduct: item.productId.productPrice * item.productQuantity,
            },
          }
        );
      }
      userCartData = await cartCollection
        .find({ userId: req.session.user._id })
        .populate("productId");
      req.session.grandTotal = grandTotal;
      
      return JSON.parse(JSON.stringify(userCartData));
    } catch (error) {
      console.log(error);
    }
  }
  





//add to cart post controller
const addToCart = async(req,res)=>{
    try{
        const userId = req.session.user._id;
        const productId = req.params.id;
        const productQuantity = req.body.productQuantity;

    //    let existingProduct = await cartCollection.findOne(
    //     {userId:req.session.user._id, 
    //     productId:req.params.id});

    //     if(existingProduct){
    //         await cartCollection.updateOne(
    //             {_id:existingProduct._id},{$inc:{productQuantity:req.body.productQuantity}});
    //     }else{
              console.log(req.session.user._id)
          
           

        // Create a new cart item
        const cart = new cartCollection({
            userId: userId,
            productId: productId,
            productQuantity: productQuantity
        });

        // Save the cart item to the database
        const userCart = await cart.save();
        res.status(200).json({ success: true });
    
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  
}




//show cart get controller
const cartLoad = async(req,res)=>{
    try{
        
    let cartData = await grandTotal(req);
    // const count = await countCartItemsPerUser()
    const count = await cartCollection.countDocuments({ userId:req.session.user._id  });

    console.log(req.session.grandTotal)
    res.render('user/cartDetail',{user:req.session.user,cartData,grandTotal:req.session.grandTotal,count})

    }catch(error){
       console.log(error)
    }
};

//delete cart post controller
const deleteCart = async (req,res)=>{
    try{
       await cartCollection.findOneAndDelete({_id:req.params.id})
    }catch(error){
        console.log(error)
    }
};

//increase cart 
const increaseCart = async(req,res)=>{
  try{
     let cartProduct = await cartCollection.findOne({_id:req.params.id}).populate('productId');
     if(cartProduct.productQuantity < cartProduct.productId.productStock){
        cartProduct.productQuantity ++;
     }
     
     cartProduct= await cartProduct.save();
     await grandTotal(req);
     res.json({cartProduct,grandTotal:req.session.grandTotal})
  }catch(error){
    console.log(error)
  }
};

//decrease cart

const decreaseCart = async (req,res)=>{
    try{
        let cartProduct = await cartCollection.findOne({_id:req.params.id}).populate('productId')
        if(cartProduct.productQuantity >1){
            cartProduct.productQuantity --;
        }
        
       cartProduct = await cartProduct.save();
        await grandTotal(req)
            res.json({cartProduct,grandTotal:req.session.grandTotal})
        
    }catch(error){
        console.log(error)
    }
}




module.exports = {addToCart,cartLoad,deleteCart,increaseCart,decreaseCart};