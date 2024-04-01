const addressCollection = require("../models/addressModel");
const userCollection = require("../models/userModel");
const cartCollection = require("../models/cartModel");
const categoryCollection = require("../models/categoryModel");
const formatDate = require("../helpers/formatDate");
const orderCollection = require("../models/orderModel");
const walletCollection = require("../models/walletModel");
const wishlistCollection = require("../models/wishlistModel");
const couponCollection = require("../models/couponModel");
const { generateInvoice } = require("../helpers/invoice");

//user account page get controller
const userAccountPageLoad = async (req, res,next) => {
  try {
    let userData = await userCollection.findOne({ _id: req.session.user._id });
    let addressData = await addressCollection.find({
      userId: req.session.user._id,
    });
    const cartProduct = await cartCollection.find({
      userId: req.session?.user?._id,
    });
    const count = await cartCollection.countDocuments({
      userId: req.session?.user?._id,
    });
    const wishlistData = await wishlistCollection.find({
      userId: req.session.user._id,
    });
    const wishlistCount = await wishlistCollection.countDocuments({
      userId: req.session?.user?._id,
    });
    const categoryData = await categoryCollection.find({});
    const walletData = await walletCollection.findOne({
      userId: req.session?.user?._id,
    });
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
    next(error)
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
    const orderData = await orderCollection.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: { orderStatus: "Cancelled" } }
    );
    let walletTransaction = {
      transactionDate: new Date(),
      transactionAmount: orderData.grandTotalCost,
      transactionType: "Refund from cancelled Order",
    };

    const wallet = await walletCollection.findOneAndUpdate(
      { userId: req.session.user._id },
      {
        $inc: { walletBalance: orderData.grandTotalCost },
        $push: { walletTransaction },
      }
    );

    let cartData = await cartCollection
      .find({ userId: req.session.user._id })
      .populate("productId");

    //reducing from stock qty
    cartData.map(async (v) => {
      v.productId.productStock += v.productQuantity;
      await v.productId.save();
      return v;
    });

    console.log("productQuantity Added");
    res.json({ success: true });
  } catch (error) {
    console.log(error);
  }
};

//return order
const returnOrder = async (req, res) => {
  try {
    const orderData = await orderCollection.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: { orderStatus: "Return Pending" } }
    );
    res.json({ success: true, orderStatus: "Return Pending" });
  } catch (error) {
    console.log(error);
  }
};

//user coupon page
const userCoupons = async (req, res,next) => {
  try {
    const categoryData = await categoryCollection.find({});
    let couponData = await couponCollection.find();
    couponData = couponData.map((coupon) => {
      coupon.startDateFormatted = formatDate(coupon.startDate);
      coupon.expiryDateFormatted = formatDate(coupon.expiryDate);
      return coupon;
    });

    res.render("user/coupons", { couponData, user: req.session.user,categoryData });
  } catch (error) {
    console.log(error);
    next(error)
  }
};

//transaction page
const transactionHistory = async (req, res,next) => {
  try {
    const categoryData = await categoryCollection.find({});
    let walletData = await walletCollection.findOne({
      userId: req.session.user._id,
    });
    let walletBalance = await walletCollection.findOne({
      userId: req.session.user._id,
    });

    walletData = walletData.walletTransaction.map((transaction) => {
      transaction.walletDateFormatted = formatDate(transaction.transactionDate);
      return transaction;
    });
    console.log(walletData);
    res.render("user/transaction", {
      walletData,
      user: req.session.user,
      walletBalance,
      categoryData,
    });
  } catch (error) {
    console.log(RangeError);
    next(error)
  }
};

//dowload invoice
const invoiceDownload = async (req, res) => {
  try {
    let orderData = await orderCollection
      .findOne({ _id: req.params.id })
      .populate("addressChosen");

    const stream = res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment;filename=invoice.pdf",
    });

    generateInvoice(
      (chunk) => stream.write(chunk),
      () => stream.end(),
      orderData
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  userAccountPageLoad,
  addAddressPost,
  editAddress,
  deleteAddress,
  cancelOrder,
  returnOrder,
  userCoupons,
  transactionHistory,
  invoiceDownload,
};
