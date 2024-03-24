const productCollection = require("../models/productModel");
const categoryCollection = require("../models/categoryModel");
const wishlistCollection = require("../models/wishlistModel");
const cartCollection = require("../models/cartModel");

//get wishlist page load
const wishlistGetController = async (req, res) => {
  try {
    const cartProduct = await cartCollection
      .find({ userId: req.session?.user?._id })
      .populate("productId");
    const count = await cartCollection.countDocuments({
      userId: req.session.user._id,
    });
    const categoryData = await categoryCollection.find();
    const wishlistCount = await wishlistCollection.countDocuments({
      userId: req.session.user._id,
    });

    const wishlistData = await wishlistCollection
      .find({ userId: req.session.user._id })
      .populate("productId");

    
    res.render("user/wishlist", {
      user: req.session.user,
      cartProduct,
      categoryData,
      count,
      wishlistData,
      wishlistCount,
    });
  } catch (error) {
    console.log(error);
  }
};

// add to wishlist
const addToWishlist = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const productId = req.params.id;

    let existingProduct = await wishlistCollection.findOne({productId:req.params.id})
    if(existingProduct){
        // Product already exists in the wishlist
        return res.json({ exists: true });
  }else{
    const wishlist = new wishlistCollection({
      userId: userId,
      productId: productId,
    });
    const wishlistData = await wishlist.save();
    console.log(wishlistData);

    res.status(200).json({ success: true });
  }
  } catch (error) {
    console.log(error);
  }
};



//move to cart
const moveToCart = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const productId = req.params.id;
    const productQuantity = req.body.productQuantity ||1;

    let existingProduct = await cartCollection.findOne({
      userId: req.session.user._id,
      productId: req.params.id,
    });

    if (existingProduct) {
      await cartCollection.updateOne(
        { _id: existingProduct._id },
        { $inc: { productQuantity: productQuantity} }
      );
      res.status(200).json({ success: true });
    } else {
      console.log(req.session.user._id);

      // Create a new cart item
      const cart = new cartCollection({
        userId: userId,
        productId: productId,
        productQuantity: productQuantity,
      });

      // Save the cart item to the database
      const userCart = await cart.save();
      console.log(userCart)
      res.status(200).json({ success: true });


      await wishlistCollection.deleteOne({productId:req.params.id})
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//delete cart post controller
const removeWishlist = async (req, res) => {
  try {
    await wishlistCollection.findOneAndDelete({ _id: req.params.id });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { wishlistGetController, addToWishlist, moveToCart,removeWishlist };
