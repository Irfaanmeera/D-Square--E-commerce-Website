const express = require("express");
const { userHomeController, loginControler, signupControler, signupPostControler, loginPostControler, logoutControler, verifyOtp, resendOtp, productDetails,  } = require("../controller/userController");
const app =express.Router();
const blockedUser = require('../middlewares/blockedUserCheck');
const {addToCart, cartLoad} = require("../controller/cartController");

app.get("/",userHomeController);
app.get("/login",loginControler);
app.get("/signup",signupControler);
app.post('/signup',signupPostControler);
app.post("/login",loginPostControler);
app.get("/logout",logoutControler);
app.post('/verify',verifyOtp);
app.get('/resendOtp',resendOtp)


//product details
app.get('/productDetails/:id',productDetails)


//cart controller

app.get('/cart', blockedUser,cartLoad)
app.post('/addToCart/:id',blockedUser,addToCart)

module.exports = app; 