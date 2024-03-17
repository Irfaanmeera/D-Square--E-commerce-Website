const addressCollection = require("../models/addressModel");
const userCollection = require("../models/userModel");
const cartCollection = require("../models/cartModel");
const categoryCollection = require("../models/categoryModel");
const formatDate = require("../helpers/formatDate");
const orderCollection = require("../models/orderModel");
const walletCollection = require ('../models/walletModel')
const wishlistCollection = require('../models/wishlistModel')
const couponCollection = require('../models/couponModel')

//user account page get controller
const userAccountPageLoad = async (req, res) => {
  try {
    let userData = await userCollection.findOne({ _id: req.session.user._id });
    let addressData = await addressCollection.find({
      userId: req.session.user._id,
    });
    const cartProduct = await cartCollection.find({userId: req.session?.user?._id,});
    const count = await cartCollection.countDocuments({
      userId: req.session?.user?._id,
    });
    const wishlistData= await wishlistCollection.find({userId:req.session.user._id})
    const wishlistCount = await wishlistCollection.countDocuments({userId:req.session?.user?._id})
    const categoryData = await categoryCollection.find({});
    const walletData = await walletCollection.findOne({userId:req.session?.user?._id})
    let orderData = await orderCollection
      .find({ userId: req.session.user._id })
      .sort({ orderDate: -1 })
      .limit(2)
      .populate("addressChosen");

    orderData = orderData.map((v) => {
      v.orderDateFormatted = formatDate(v.orderDate);
      return v;
    });

    console.log(addressData);

    res.render("user/userProfile", {
      userData,
      user: req.session.user,
      addressData,
      count,
      categoryData,
      orderData,
      wishlistData,
      wishlistCount,
      cartProduct,
      walletData,
    });
  } catch (error) {
    console.log(error);
  }
};

//user add new address post controller
const addAddressPost = async (req, res) => {
  try {
    const address = new addressCollection({
      userId: req.session.user._id,
      addressTitle: req.body.addressTitle,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      phone: req.body.phone,
    });

    const addressData = await address.save();
    console.log(addressData);

    res.redirect("/userAccount");
  } catch (error) {
    console.log(error);
  }
};

//edit address post
const editAddress = async (req, res) => {
  try {
    const address = {
      addressTitle: req.body.addressTitle,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      phone: req.body.phone,
    };
    await addressCollection.updateOne({ _id: req.params.id }, address);
    res.redirect("/userAccount");
  } catch (error) {
    console.log(error);
  }
};

//deleteAddress post
const deleteAddress = async (req, res) => {
  try {
    const deleteAddressData = await addressCollection.findOneAndDelete({
      _id: req.params.id,
    });
    res.redirect("/userAccount");
  } catch (error) {
    console.log(error);
  }
};

//cancel order
const cancelOrder = async (req, res) => {
  try {
   const orderData= await orderCollection.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: { orderStatus: "Cancelled" } }
    );
    let walletTransaction = {
      transactionDate: new Date(),
      transactionAmount: orderData.grandTotalCost,
      transactionType: "Refund from cancelled Order",
    };

    const wallet= await walletCollection.findOneAndUpdate(
      { userId: req.session.user._id },
      {
        $inc: { walletBalance: orderData.grandTotalCost },
        $push: { walletTransaction },
      }
    );
console.log(wallet)
    res.json({ success: true });
  } catch (error) {
    console.log(error);
  }
};

const userCoupons = async (req,res)=>{
  try{
    let couponData= await couponCollection.find()
    couponData = couponData.map((coupon)=>{
       coupon.startDateFormatted=formatDate(coupon.startDate);
       coupon.expiryDateFormatted=formatDate(coupon.expiryDate);
       return coupon;})
       
    res.render('user/coupons',{couponData,user:req.session.user})

  }catch(error){
    console.log(error)
  }
}

module.exports = {
  userAccountPageLoad,
  addAddressPost,
  editAddress,
  deleteAddress,
  cancelOrder,
  userCoupons,
};
