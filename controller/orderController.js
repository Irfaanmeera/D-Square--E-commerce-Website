const orderCollection = require("../models/orderModel");
const formatDate = require("../helpers/formatDate");
const walletCollection = require('../models/walletModel')
const cartCollection = require('../models/cartModel')

//admin side order Management

//order list load
const orderManagement = async (req, res) => {
  try {
    let orderData = await orderCollection
      .find({})
      .sort({ orderDate: -1 })
      .populate("userId");

    orderData = orderData.map((v) => {
      v.orderDateFormatted = formatDate(v.orderDate);
      return v;
    });

    res.render("admin/orders", { orderData });
  } catch (error) {
    console.log(error);
  }
};

//change pending status
const changeStatus = async (req, res) => {
  try {
    console.log(req.body.status);
    console.log(req.params.id);
    const status = {
      orderStatus: req.body.status,
    };
    await orderCollection.updateOne({ _id: req.params.id }, status);
    res.redirect("/admin/orderManagement");
  } catch (error) {
    console.log(error);
  }
};


const acceptReturnOrder = async (req, res) => {
  try {

    
    const orderData = await orderCollection.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: { orderStatus: "Return Accepted" } }
    );
    const userId = orderData.userId;

    let walletTransaction = {
      transactionDate: new Date(),
      transactionAmount: orderData.grandTotalCost,
      transactionType: "Refund from returned Order",
    };

    const wallet = await walletCollection.findOneAndUpdate(
      { userId:orderData.userId},
      {
        $inc: { walletBalance: orderData.grandTotalCost },
        $push: { walletTransaction },
      }
    );
console.log(wallet)

    let cartData = await cartCollection
    .find({ userId:orderData.userId })
    .populate("productId");

    //reducing from stock qty
  cartData.map(async (v) => {
    v.productId.productStock += v.productQuantity;
    await v.productId.save();
    return v;
  });

    console.log('productQuantity Added');
    res.json({ success: true });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { orderManagement, changeStatus,acceptReturnOrder };
