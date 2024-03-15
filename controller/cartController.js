const cartCollection = require("../models/cartModel");
const productCollection = require("../models/productModel");
const addressCollection = require("../models/addressModel");
const orderCollection = require("../models/orderModel");
const formatDate = require("../helpers/formatDate");
const razorpay = require("../services/razorpay.js");
const walletCollection= require('../models/walletModel.js')
const wishlistCollection = require('../models/wishlistModel.js')
const couponCollection = require('../models/couponModel.js')
const categoryCollection = require('../models/categoryModel.js')

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
    const cartData = await grandTotal(req);
    const categoryData = await categoryCollection.find()
    const cartProduct = await cartCollection.find({userId: req.session?.user?._id,});
    const count = await cartCollection.countDocuments({userId: req.session?.user?._id,});
    const wishlistData= await wishlistCollection.find({userId:req.session?.user?._id})
    const wishlistCount = await wishlistCollection.countDocuments({userId:req.session?.user?._id})
    console.log(req.session.grandTotal);
    res.render("user/cartDetail", {
      user: req.session.user,
      cartData,
      grandTotal: req.session.grandTotal,
      count,
      cartProduct,
      wishlistData,
      wishlistCount,
      categoryData,
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
    const cartProduct = await cartCollection.find({userId: req.session?.user?._id,});
    const count = await cartCollection.countDocuments({userId: req.session?.user?._id,});
    const wishlistData= await wishlistCollection.find({userId:req.session?.user?._id})
    const wishlistCount = await wishlistCollection.countDocuments({userId:req.session?.user?._id})
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
      cartProduct,
      wishlistData,
      wishlistCount,
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


  
//razorpay- creating an orderId with razorpay
const razorpayCreateOrderId= async (req, res) => {

  if(req.query?.combinedWalletPayment){

    let walletData = await walletCollection.findOne({userId: req.session.user._id})

    var options = {
      amount: req.session.grandTotal - walletData.walletBalance  + "00", // amount in the smallest currency unit
      currency: "INR",
    };


  }else{

    var options = {
      amount: req.session.grandTotal + "00", // amount in the smallest currency unit
      currency: "INR",
    };
  }


  razorpay.instance.orders.create(options, function (err, order) {
    res.json(order);
  });
}



const orderPlaced = async (req, res) => {
  try {
    
    if (req.body.razorpay_payment_id) {
      //razorpay payment
      await orderCollection.updateOne(
        { _id: req.session.orderData._id },
        {
          $set: {
            paymentId: req.body.razorpay_payment_id,
            paymentType: "Razorpay",
          },
        }
      );
      res.redirect("/orderPlacedEnd");
    } else if (req.body.walletPayment) {
      
      const walletData = await walletCollection.findOne({
        userId : req.session.user._id,
      });
      console.log(walletData)
      if (walletData.walletBalance >= req.session.grandTotal) {
        walletData.walletBalance -= req.session.grandTotal;

        //wallet tranaction data
        let walletTransaction = {
          transactionDate : new Date(),
          transactionAmount: -req.session.grandTotal,
          transactionType: "Debited for placed order",
        };
        walletData.walletTransaction.push(walletTransaction)
        await walletData.save();

        await orderCollection.updateOne(
          { _id: req.session.orderData._id },
          {
            $set: {
              paymentId: Math.floor(Math.random() * 9000000000) + 1000000000 ,
              paymentType: "Wallet",
            },
          })

        res.json({ success: true });
      } else {
        return res.json({ insufficientWalletBalance: true });
      }
    } else {
      //incase of COD
      await orderCollection.updateOne(
        { _id: req.session.orderData._id },
        {
          $set: {
            paymentId: "generatedAtDelivery",
            paymentType: "COD",
          },
        }
      );

      res.json({ success: true });
    }
  } catch (error) {
    console.error(error);
  }
}


const orderPlacedEnd = async (req, res) => {

  let cartData = await cartCollection
    .find({ userId: req.session.user._id })
    .populate("productId");
    const cartProduct = await cartCollection.find({userId: req.session?.user?._id,});
    const count = await cartCollection.countDocuments({userId: req.session?.user?._id,});
    const wishlistData= await wishlistCollection.find({userId:req.session?.user?._id})
    const wishlistCount = await wishlistCollection.countDocuments({userId:req.session?.user?._id})
    const categoryData = await categoryCollection.find()
  //reducing from stock qty
  cartData.map(async (v) => {
    v.productId.productStock -= v.productQuantity;
    await v.productId.save();
    return v;
  });

  let orderData= await orderCollection.findOne({ _id: req.session.orderData._id})
  if(orderData.paymentType =='toBeChosen'){
    orderData.paymentType = 'COD'
    orderData.save()
  }

  res.render("user/orderPlacedPage", {
    user: req.session.user,
          cartData,
          count,
          orderData,
          grandTotal: req.session.grandTotal,
          cartProduct,
          wishlistData,
          wishlistCount,
          categoryData
          
  });

  //delete the cart- since the order is placed
  await cartCollection.deleteMany({ userId: req.session.user._id });
  console.log("deleting finished");
}



//order List Page
const orderList = async (req, res) => {
  try {
    let cartData = await grandTotal(req);
    const count = await cartCollection.countDocuments({
      userId: req.session.user._id,
    });
    const cartProduct = await cartCollection.find({userId: req.session?.user?._id,});
    const wishlistData= await wishlistCollection.find({userId:req.session?.user?._id})
    const wishlistCount = await wishlistCollection.countDocuments({userId:req.session?.user?._id})
    const categoryData = await categoryCollection.find()
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
      cartProduct,
      grandTotal: req.session.grandTotal,
      categoryData,
      wishlistData,
      wishlistCount,
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


  //apply coupon
  const applyCoupon= async (req, res) => {
    try {

     
      let { couponCode } = req.body;
      console.log(couponCode)

      //Retrive the coupon document from the database if it exists
      let couponData = await couponCollection.findOne({ couponCode });
console.log(couponData)
      if (couponData) {

        let order = await orderCollection.findOne({ _id: req.session.orderData._id });
            if (order.couponApplied) {
                // Respond with an error status if the coupon has already been applied to the order
                return res.status(400).json({ error: "Coupon already applied to this order." });
            }
        /*if coupon exists:
        > check if it is applicable, i.e within minimum purchase limit & expiry date
        >proceed... */

        let { grandTotal } = req.session;
        let { minimumPurchase, expiryDate } = couponData;
        let minimumPurchaseCheck = minimumPurchase < grandTotal;
        let expiryDateCheck = new Date() < new Date(expiryDate);

        if (minimumPurchaseCheck && expiryDateCheck) {
          /* if coupon exists check if it is applicable :
          >calculate the discount amount
          >update the database's order document
          >update the grand total in the req.session for the payment page
          */
          let { discountPercentage, maximumDiscount } = couponData;

          let discountAmount =
            (grandTotal * discountPercentage) / 100 > maximumDiscount
              ? maximumDiscount
              : (grandTotal * discountPercentage) / 100;

        
        
const order = await orderCollection.findOne({_id:req.session.orderData._id})
console.log(order)


          await orderCollection.findByIdAndUpdate(
            { _id:req.session.orderData._id },
            {
              $set: { couponApplied: couponData._id },
              $inc: { grandTotalCost: -discountAmount },
            }
          );

          req.session.grandTotal -= discountAmount;
          req.session.totalDiscount = discountAmount;

          console.log(req.session.totalDiscount)

          // Respond with a success status and indication that the coupon was applied
          res.status(202).json({ couponApplied: true, discountAmount });
        } else {
          // Respond with an error status if the coupon is not applicable
          res.status(501).json({ couponApplied: false });
        }
      } else {
        // Respond with an error status if the coupon does not exist
        res.status(501).json({ couponApplied: false });
      }
    } catch (error) {
      console.error(error);
    }
  }





module.exports = {
  addToCart,
  cartLoad,
  deleteCart,
  increaseCart,
  decreaseCart,
  checkoutPageLoad,
  addAddressCheckout,
  orderPlaced,
  orderList,
  orderDetails,
  getOrderStatus,
  orderPlacedEnd,
  updateCart,
  razorpayCreateOrderId,
  applyCoupon
};
