const express = require("express");
const { userHomeController, loginControler, signupControler, loginPostControler, logoutControler, productDetails, userLoginModel, signupPostController, sendOtp, forgotPassword, sendForgotPwdOtp, forgotPasswordUsermodel, forgotPasswordReset, forgotPasswordResetPage,  } = require("../controller/userController");
const app =express.Router();
const blockedUser = require('../middlewares/blockedUserCheck');
const userAuth = require('../middlewares/userAuth')
const {addToCart,cartLoad, deleteCart, increaseCart, decreaseCart, checkout, checkoutPageLoad, addAddressCheckout, placeOrder, orderList, orderDetails, getOrderStatus, orderPlacedEnd, razorpayCreateOrderId, orderPlaced, applyCoupon,} = require("../controller/cartController");
const{shopPage, filterCategoryPage, filterBrandPage, priceRange, filterPriceRange, sortPriceAscending, sortPriceDescending, searchProduct} = require('../controller/shopPageController');
const { userAccountPageLoad, addAddressPost, deleteAddress, editAddress, cancelOrder,} = require("../controller/accountPageController");
const{ wishlistGetController, addToWishlist, removeWishlist } = require('../controller/wishlistController')

app.get("/",blockedUser,userHomeController);
app.get("/login",loginControler);
app.get("/signup",signupControler);
app.post('/otp',userLoginModel,sendOtp);
app.get('/resendOtp',sendOtp);
app.post('/signup',signupPostController)
app.post("/login",loginPostControler);
app.get("/logout",logoutControler);

//forgot Password
app.get('/forgotPassword',forgotPassword)
app.post('/forgotPasswordOtp',forgotPasswordUsermodel, sendForgotPwdOtp)
app.post('/forgotPasswordPage', forgotPasswordResetPage)
app.post('/forgotPasswordReset', forgotPasswordReset)



//product details
app.get('/productDetails/:id', productDetails)


//cart controller

app.get('/cart', blockedUser,userAuth,cartLoad);
app.post('/addToCart/:id',blockedUser,userAuth,addToCart);
app.delete('/deleteCart/:id',blockedUser,userAuth,deleteCart)
app.put('/increaseQty/:id',blockedUser,userAuth,increaseCart)
app.put('/decreaseQty/:id',blockedUser, userAuth,decreaseCart)

//wishlist controller
app.get('/wishlist',blockedUser,userAuth,wishlistGetController)
app.post('/wishlist/:id',userAuth,addToWishlist)
app.delete('/removeWishlist/:id',userAuth,removeWishlist)


//shop page controller
app.get('/shop',blockedUser, userAuth, shopPage)
app.get('/filterCategory/:categoryName',blockedUser,filterCategoryPage)
app.get('/filterBrand/:brand',blockedUser,userAuth,filterBrandPage)
app.get('/filterPriceRange',blockedUser,userAuth,filterPriceRange)
app.get('/sortPriceAscending',blockedUser,userAuth, sortPriceAscending)
app.get('/sortPriceDescending',blockedUser,userAuth, sortPriceDescending)
app.get('/search',searchProduct)


//user account controller
app.get('/userAccount',userAuth,userAccountPageLoad)
app.post('/addAddress',blockedUser,userAuth,addAddressPost )
app.post('/editAddress/:id',blockedUser,userAuth,editAddress)
app.get('/deleteAddress/:id',blockedUser,userAuth,deleteAddress )
app.get('/orderList',blockedUser,userAuth,orderList)
app.get('/orderDetails/:id',blockedUser,userAuth,orderDetails)
app.get('/orderStatus/:id',blockedUser,userAuth,getOrderStatus)
app.put('/cancelOrder/:id',blockedUser,userAuth,cancelOrder)

//order routes checkout page
app.get('/checkout',blockedUser,userAuth,checkoutPageLoad)
app.post('/addAddressCheckout',blockedUser,userAuth,addAddressCheckout)
app.all('/orderPlaced',blockedUser,userAuth,orderPlaced)
app.all('/orderPlacedEnd',blockedUser,userAuth,orderPlacedEnd)
app.post('/razorpay/create/orderId',blockedUser,userAuth,razorpayCreateOrderId)


//coupon apply 
app.post('/applyCoupon',blockedUser,userAuth,applyCoupon)






module.exports = app; 