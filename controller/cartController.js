const cartCollection = require('../models/cartModel')
const productCollection = require('../models/productModel')



//calculating grandTotal
async function grandTotal(req){
    try{
    
      let userCart = await cartCollection.find({userId:req.session.user._id}).populate('productId')
      let grandTotal = 0;
      for (let item of userCart){
        grandTotal += item.productId.productPrice * item.productQuantity
      

      const result = await cartCollection.updateOne({_id:item._id},{$set:{
        totalCostPerProduct:item.productId.productPrice * item.productQuantity
    }})
    console.log(result)
}

    userCart = await cartCollection.find({_id:req.session.user._id}).populate('productId')
    console.log(userCart)
    req.session.grandTotal = grandTotal;


    return JSON.parse(JSON.stringify(userCart));

    }catch(error){
        console.log(error)
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
        console.log(userCart);

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
    let userCartData = await cartCollection
    .find({ userId: req.session.user._id })
    .populate("productId");

    console.log(userCartData)
    console.log(req.session.grandTotal)
    res.render('user/cartDetail',{user:req.session.user,cartData,grandTotal:req.session.grandTotal,userCartData})

    }catch(error){
       console.log(error)
    }
}




module.exports = {addToCart,cartLoad};