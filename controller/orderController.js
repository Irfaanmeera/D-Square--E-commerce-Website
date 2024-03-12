const orderCollection = require("../models/orderModel");
const formatDate = require("../helpers/formatDate");

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

module.exports = { orderManagement, changeStatus };
