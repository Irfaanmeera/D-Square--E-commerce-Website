const productCollection = require('../models/productModel')
const categoryCollection = require('../models/categoryModel')
const wishlistCollection = require('../models/wishlistModel')
const cartCollection = require('../models/cartModel')


//get wishlist load
const wishlistGetController = async(req,res)=>{
    try{
        const cartProduct = await cartCollection.find({ userId: req.session?.user?._id }).populate("productId");
        const count = await cartCollection.countDocuments({userId: req.session.user._id,}); 
        const categoryData = await categoryCollection.find()
        const wishlistCount = await wishlistCollection.countDocuments({
            userId: req.session.user._id,
          });

  const wishlistData= await wishlistCollection.find({userId:req.session.user._id}).populate('productId')

  console.log(wishlistData)
  res.render('user/wishlist',{user:req.session.user,cartProduct,categoryData,count,wishlistData,wishlistCount})
    }catch(error){
        console.log(error)
    }
}


// add to wishlist
const addToWishlist = async(req,res)=>{
    try{
        const userId = req.session.user._id;
        const productId = req.params.id;

      
                const wishlist = new wishlistCollection({
                    userId:userId,
                    productId:productId
                })
               const wishlistData= await wishlist.save()
               console.log(wishlistData)
            
            res.status(200).json({ success: true });

       }catch(error){
        console.log(error)
    }
}


//delete cart post controller
const removeWishlist = async (req, res) => {
    try {
      await wishlistCollection.findOneAndDelete({ _id: req.params.id });
    } catch (error) {
      console.log(error);
    }
  };


module.exports = {wishlistGetController,addToWishlist,removeWishlist}