const express = require("express");
const { userHomeController, loginControler, signupControler, loginPostControler, logoutControler, productDetails, userLoginModel, signupPostController, sendOtp, forgotPassword, sendForgotPwdOtp, forgotPasswordUsermodel, forgotPasswordReset, forgotPasswordResetPage, aboutUsPage,  } = require("../controller/userController");
const userRoute =express.Router();
const blockedUser = require('../middlewares/blockedUserCheck');
const userAuth = require('../middlewares/userAuth')
const {addToCart,cartLoad, deleteCart, increaseCart, decreaseCart, checkoutPageLoad, addAddressCheckout, orderList, orderDetails, getOrderStatus, orderPlacedEnd, razorpayCreateOrderId, orderPlaced, applyCoupon,} = require("../controller/cartController");
const{shopPage, filterCategoryPage, filterBrandPage, filterPriceRange, sortPriceAscending, sortPriceDescending, searchProduct} = require('../controller/shopPageController');
const { userAccountPageLoad, addAddressPost, deleteAddress, editAddress, cancelOrder, userCoupons, transactionHistory, invoiceDownload, returnOrder,} = require("../controller/accountPageController");
const{ wishlistGetController, addToWishlist, removeWishlist, moveToCart } = require('../controller/wishlistController')

userRoute.get("/",blockedUser,userHomeController);
userRoute.get("/login",loginControler);
userRoute.get("/signup",signupControler);
userRoute.post('/otp',userLoginModel,sendOtp);
userRoute.get('/resendOtp',sendOtp);
userRoute.post('/signup',signupPostController)
userRoute.post("/login",loginPostControler);
userRoute.get("/logout",logoutControler);

//forgot Password
userRoute.get('/forgotPassword',forgotPassword)
userRoute.post('/forgotPasswordOtp',forgotPasswordUsermodel, sendForgotPwdOtp)
userRoute.post('/forgotPasswordPage', forgotPasswordResetPage)
userRoute.post('/forgotPasswordReset', forgotPasswordReset)

//aboutUs page
userRoute.get('/aboutUs',aboutUsPage)

//product details
userRoute.get('/productDetails/:id', productDetails)


//cart controller
userRoute.get('/cart', blockedUser,userAuth,cartLoad);
userRoute.post('/addToCart/:id',blockedUser,userAuth,addToCart);
userRoute.delete('/deleteCart/:id',blockedUser,userAuth,deleteCart)
userRoute.put('/increaseQty/:id',blockedUser,userAuth,increaseCart)
userRoute.put('/decreaseQty/:id',blockedUser, userAuth,decreaseCart)

//wishlist controller
userRoute.get('/wishlist',blockedUser,userAuth,wishlistGetController)
userRoute.post('/wishlist/:id',userAuth,addToWishlist)
userRoute.delete('/removeWishlist/:id',userAuth,removeWishlist)
userRoute.post('/moveToCart/:id',blockedUser,userAuth,moveToCart);


//shop page controller
userRoute.get('/shop',blockedUser, shopPage)
userRoute.get('/filterCategory/:categoryName',blockedUser,filterCategoryPage)
userRoute.get('/filterBrand/:brand',blockedUser,userAuth,filterBrandPage)
userRoute.get('/filterPriceRange',blockedUser,userAuth,filterPriceRange)
userRoute.get('/sortPriceAscending',blockedUser,userAuth, sortPriceAscending)
userRoute.get('/sortPriceDescending',blockedUser,userAuth, sortPriceDescending)
userRoute.get('/search',searchProduct)


//user account controller
userRoute.get('/userAccount',userAuth,userAccountPageLoad)
userRoute.post('/addAddress',blockedUser,userAuth,addAddressPost )
userRoute.post('/editAddress/:id',blockedUser,userAuth,editAddress)
userRoute.get('/deleteAddress/:id',blockedUser,userAuth,deleteAddress )
userRoute.get('/orderList',blockedUser,userAuth,orderList)
userRoute.get('/orderDetails/:id',blockedUser,userAuth,orderDetails)
userRoute.get('/orderStatus/:id',blockedUser,userAuth,getOrderStatus)
userRoute.put('/cancelOrder/:id',blockedUser,userAuth,cancelOrder)
userRoute.put('/returnOrder/:id',blockedUser,userAuth,returnOrder)

//order routes & checkout page
userRoute.get('/checkout',blockedUser,userAuth,checkoutPageLoad)
userRoute.post('/addAddressCheckout',blockedUser,userAuth,addAddressCheckout)
userRoute.all('/orderPlaced',blockedUser,userAuth,orderPlaced)
userRoute.all('/orderPlacedEnd',blockedUser,userAuth,orderPlacedEnd)
userRoute.post('/razorpay/create/orderId',blockedUser,userAuth,razorpayCreateOrderId)


//coupon management 
userRoute.post('/applyCoupon',blockedUser,userAuth,applyCoupon)
userRoute.get('/userCoupons',blockedUser,userAuth,userCoupons )

//transaction history
userRoute.get('/transaction',blockedUser,userAuth,transactionHistory)

//invoice download
userRoute.get('/invoice/:id',blockedUser,userAuth,invoiceDownload)


//404 error middlewares
userRoute.use((err, req, res, next) => {
    console.log(err.message);
    res.status(err.status || 404).render('user/404')
})


module.exports = userRoute; 