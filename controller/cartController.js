const cartCollection = require("../models/cartModel");
const productCollection = require("../models/productModel");
const addressCollection = require("../models/addressModel");
const orderCollection = require("../models/orderModel");
const formatDate = require("../helpers/formatDate");

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
            totalCostPerProduct:
              item.productId.productPrice * item.productQuantity,
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
const addToCart = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const productId = req.params.id;
    const productQuantity = req.body.productQuantity;

    let existingProduct = await cartCollection.findOne({
      userId: req.session.user._id,
      productId: req.params.id,
    });

    if (existingProduct) {
      await cartCollection.updateOne(
        { _id: existingProduct._id },
        { $inc: { productQuantity: req.body.productQuantity } }
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
      res.status(200).json({ success: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//show cart get controller
const cartLoad = async (req, res) => {
  try {
    let cartData = await grandTotal(req);
    let cartProduct = await cartCollection.find({
      userId: req.session.user._id,
    });
    const count = await cartCollection.countDocuments({
      userId: req.session.user._id,
    });

    console.log(req.session.grandTotal);
    res.render("user/cartDetail", {
      user: req.session.user,
      cartData,
      grandTotal: req.session.grandTotal,
      count,
      cartProduct,
    });
  } catch (error) {
    console.log(error);
  }
};

//delete cart post controller
const deleteCart = async (req, res) => {
  try {
    await cartCollection.findOneAndDelete({ _id: req.params.id });
  } catch (error) {
    console.log(error);
  }
};

//increase cart
const increaseCart = async (req, res) => {
  try {
    let cartProduct = await cartCollection
      .findOne({ _id: req.params.id })
      .populate("productId");
    if (cartProduct.productQuantity < cartProduct.productId.productStock) {
      cartProduct.productQuantity++;
    }

    cartProduct = await cartProduct.save();
    await grandTotal(req);
    res.json({ cartProduct, grandTotal: req.session.grandTotal });
  } catch (error) {
    console.log(error);
  }
};

//decrease cart

const decreaseCart = async (req, res) => {
  try {
    let cartProduct = await cartCollection
      .findOne({ _id: req.params.id })
      .populate("productId");
    if (cartProduct.productQuantity > 1) {
      cartProduct.productQuantity--;
    }

    cartProduct = await cartProduct.save();
    await grandTotal(req);
    res.json({ cartProduct, grandTotal: req.session.grandTotal });
  } catch (error) {
    console.log(error);
  }
};

//update Cart
const updateCart = async (req, res) => {
  try {
    let cartProduct = await cartCollection
      .findOne({ _id: req.params.id })
      .populate("productId");

    // Get the action from the request body (increment or decrement)
    const action = req.body.action;

    // Check if the current quantity is less than the product's stock limit for increment action
    if (
      action === "increment" &&
      cartProduct.productQuantity < cartProduct.productId.productStock
    ) {
      cartProduct.productQuantity++;
    }
    // Check if the current quantity is greater than 1 for decrement action
    else if (action === "decrement" && cartProduct.productQuantity > 1) {
      cartProduct.productQuantity--;
    }

    // Save the updated cart product
    cartProduct = await cartProduct.save();

    // Calculate the grand total
    await grandTotal(req);

    // Send response with updated cart product and grand total
    res.json({ cartProduct, grandTotal: req.session.grandTotal });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//checkout page

const checkoutPageLoad = async (req, res) => {
  try {
    let cartData = await grandTotal(req);
    const count = await cartCollection.countDocuments({
      userId: req.session.user._id,
    });
    let addressData = await addressCollection.find({
      userId: req.session.user._id,
    });

    if (addressData.length > 0) {
      req.session.orderData = await orderCollection.create({
        userId: req.session.user._id,
        orderNumber: (await orderCollection.countDocuments()) + 1,
        orderDate: new Date(),
        addressChosen: JSON.parse(JSON.stringify(addressData[0])), //default address
        cartData: await grandTotal(req),
        grandTotalCost: req.session.grandTotal,
      });
    }
    res.render("user/checkout", {
      user: req.session.user,
      cartData,
      grandTotal: req.session.grandTotal,
      count,
      addressData,
    });
  } catch (error) {
    console.log(error);
  }
};

//add address
const addAddressCheckout = async (req, res) => {
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

    res.redirect("/checkout");
  } catch (error) {
    console.log(error);
  }
};

//place order controller
const placeOrder = async (req, res) => {
  try {
    let cartData = await grandTotal(req);
    const count = await cartCollection.countDocuments({
      userId: req.session.user._id,
    });
    let addressData = await addressCollection.find({
      userId: req.session.user._id,
    });
    let orderData = await orderCollection.find({
      userId: req.session.user._id,
    });

    //reducing from stock qty

    // await orderCollection.updateOne(
    //   { _id: req.session.order._id },
    //   {
    //     $set: {
    //       paymentId: "generatedAtDelivery",
    //       paymentType: "COD",
    //     },
    //   }
    // );

    res.render("user/orderPlacedPage", {
      user: req.session.user,
      cartData,
      count,
      grandTotal: req.session.grandTotal,
      orderData,
    });
  } catch (error) {
    console.log(error);
  }
};

//after orderPlaced changes
const orderPlacedEnd = async (req, res) => {
  try {
    let cartData = await cartCollection
      .find({ userId: req.session.user._id })
      .populate("productId");
    let orderData = await orderCollection
      .findOne({ _id: req.session.orderData._id })
      .populate("addressChosen");
    const count = await cartCollection.countDocuments({
      userId: req.session.user._id,
    });

    //reducing from stock qty
    cartData.map(async (item) => {
      item.productId.productStock -= item.productQuantity;
      await item.productId.save();
      return item;
    });

    res.render("user/orderPlacedPage", {
      user: req.session.user,
      cartData,
      count,
      orderData,
      grandTotal: req.session.grandTotal,
    });

    //delete the cart- since the order is placed
    await cartCollection.deleteMany({ userId: req.session.user._id });
    console.log("deleting finished");
  } catch (error) {
    console.log(error);
  }
};

//order List Page
const orderList = async (req, res) => {
  try {
    let cartData = await grandTotal(req);
    const count = await cartCollection.countDocuments({
      userId: req.session.user._id,
    });
    let orderData = await orderCollection
      .find({ userId: req.session.user._id })
      .sort({ orderNumber: -1 });

    orderData = orderData.map((v) => {
      v.orderDateFormatted = formatDate(v.orderDate);
      return v;
    });

    res.render("user/orderList", {
      user: req.session.user,
      count,
      orderData,
      cartData,
      grandTotal: req.session.grandTotal,
    });
  } catch (error) {
    console.log(error);
  }
};

//get single order Details page
const orderDetails = async (req, res) => {
  try {
    const count = await cartCollection.countDocuments({
      userId: req.session.user._id,
    });
    let orderData = await orderCollection
      .findOne({ _id: req.params.id })
      .populate("addressChosen");

    console.log(orderData);

    const orderDateFormatted = formatDate(orderData.orderDate);

    res.render("user/orderDetailsPage", {
      user: req.session.user,
      count,
      orderData,
      orderDateFormatted,
    });
  } catch (error) {
    console.log(error);
  }
};

//get order status
const getOrderStatus = async (req, res) => {
  try {
    // Fetch the order status from the database
    const order = await orderCollection.findOne({ _id: req.params.id });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ status: order.orderStatus });
  } catch (error) {
    console.error("Error fetching order status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addToCart,
  cartLoad,
  deleteCart,
  increaseCart,
  decreaseCart,
  checkoutPageLoad,
  addAddressCheckout,
  placeOrder,
  orderList,
  orderDetails,
  getOrderStatus,
  orderPlacedEnd,
  updateCart,
};
