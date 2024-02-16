const express = require("express");
const { userHomeController, loginControler, signupControler, signupPostControler, loginPostControler, logoutControler, checkEmailExists, sendOTP, otpVerification, verifyOtp, } = require("../controller/userController");
const app =express.Router();

app.get("/",userHomeController);
app.get("/login",loginControler);
app.get("/signup",signupControler);
app.post('/signup',signupPostControler);
app.post("/login",loginPostControler);
app.get("/logout",logoutControler);
app.post('/verify',verifyOtp)



module.exports = app; 