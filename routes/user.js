const express = require("express");
const { userHomeController, loginControler, signupControler, loginPostControler, logoutControler, productDetails, userLoginModel, signupPostController, sendOtp, forgotPassword, sendForgotPwdOtp, forgotPasswordUsermodel, forgotPasswordReset, forgotPasswordResetPage,  } = require("../controller/userController");
const app =express.Router();
const blockedUser = require('../middlewares/blockedUserCheck');
const userAuth = require('../middlewares/userAuth')
const {addToCart,cartLoad, deleteCart, increaseCart, decreaseCart,} = require("../controller/cartController");
const{shopPage, filterCategoryPage, filterBrandPage, priceRange, filterPriceRange, sortPriceAscending, sortPriceDescending} = require('../controller/shopPageController');
const { userAccountPageLoad, addAddressPost, deleteAddress, editAddress } = require("../controller/accountPageController");


app.get("/",userAuth, userHomeController);
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
app.get('/productDetails/:id',userAuth, productDetails)


//cart controller

app.get('/cart', blockedUser,userAuth,cartLoad);
app.post('/addToCart/:id',blockedUser,userAuth,addToCart);
app.delete('/deleteCart/:id',blockedUser,userAuth,deleteCart)
app.put('/increaseQty/:id',userAuth,increaseCart)
app.put('/decreaseQty/:id', userAuth,decreaseCart)


//shop page controller
app.get('/shop',blockedUser, userAuth, shopPage)
app.get('/filterCategory/:categoryName',filterCategoryPage)
app.get('/filterBrand/:brand',filterBrandPage)
app.get('/filterPriceRange',filterPriceRange)
app.get('/sortPriceAscending', sortPriceAscending)
app.get('/sortPriceDescending', sortPriceDescending)


//user account controller
app.get('/userAccount',userAuth,userAccountPageLoad)
app.post('/addAddress',addAddressPost )
app.post('/editAddress/:id',editAddress)
app.get('/deleteAddress/:id',deleteAddress )



module.exports = app; 