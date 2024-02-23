const userCollection = require("../models/userModel");
const productCollection = require('../models/productModel')
const categoryCollection = require('../models/categoryModel')
const transporter = require('../services/sendOtp')
const nodemailer = require('nodemailer')
const bcrypt = require("bcrypt");
const saltRound = 10;


//homepage
const userHomeController = async(req,res)=>{
  let user = req.session.user;
  let productData = await productCollection.find({}).lean()
  let categoryData = await categoryCollection.find({},{categoryName:true})
if(req.session.user){

        res.render('user/homepageUser',{user,productData,categoryData});
    }else{
        res.render('user/homepageUser',{productData})
    }
}

//logincontroller
const loginControler = async (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("user/login");
  }
};

//lgoinpost conrtoler
const loginPostControler = async (req, res) => {
  const{email,password} =req.body;

  const user = await userCollection.findOne({email});
  if (user) {
    const password = await bcrypt.compare(req.body.password, user.password);

     if (password) {
      
        if(user.isBlocked){
          res.render("user/login", { message: "You are blocked by admin" });
        }else{
          req.session.user = user;
          res.redirect('/');
        }
      console.log(req.session.user);
   
     }else{
      res.render("user/login", { message: "Invalid Password" });
    }
  }else{
    res.render("user/login", { message: "Invalid Email" });
  }
};


//signup
const signupControler = async (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("user/signup");
  }
};


//signup post controller

const signupPostControler = async (req, res) => {
  // Validate input data
  const { name, email, mobile } = req.body;

  if (!name || name.trim() === "" || name.length < 0 || !email || !mobile) {
      return res.render('user/signup',{message:"Name, email, and mobile are required"});
  }

  // Additional validation for email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
      return res.render('user/signup',{message:"Invalid email id"});
  }

  //validation for mobile number
  const mobileRegex = /^\d{10}$/;
  if (!mobileRegex.test(mobile)) {
      return res.render('user/signup',{message:"Invalid mobile number"});
  }

  const existingUser = await userCollection.findOne({ email, isBlocked:false});

  if (existingUser) {
      return res.render("user/signup", { message: "User Name already exists" });
  }

  const password = await bcrypt.hash(req.body.password, saltRound);
  req.body.password = password;

  const newUser = await userCollection.create(req.body);
  req.session.user = req.body;
  req.session.loggedIn = true;
  
//noedmailer email verification

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'irfaanmeera@gmail.com',
        pass: 'tayk wqro aapk jryl'
    }
  });
  
  const otp = Math.floor(1000 + Math.random() * 9000);
  
  req.session.otp = otp;
  req.session.email = email;
  
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 5);
  
  req.session.otpExpiration = expirationTime;
  console.log(req.session.otpExpiration)
  
  const mailOptions = {
    from: 'irfaanmeera@gmail.com',
    to: email,
    subject: 'Registration OTP for D Square',
    html: `Your OTP is ${otp}`
  };
  
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
        console.log(error);
        return res.status(500).send("Error sending OTP");
    } else {
        console.log('Email has been sent:', info.response);
         res.render("user/otpPage",{ expirationTime: expirationTime.toISOString() });
    }
  })
  };

//resend otp

const resendOtp = async (req, res) => {

  const email = req.session.email || req.body.email;

//noedmailer email verification

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'irfaanmeera@gmail.com',
        pass: 'tayk wqro aapk jryl'
    }
  });
  
  const otp = Math.floor(1000 + Math.random() * 9000);
  
  req.session.otp = otp;
  req.session.email = email;

  
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 5);
  
  req.session.otpExpiration = expirationTime;
  console.log(req.session.otpExpiration)
  
  const mailOptions = {
    from: 'irfaanmeera@gmail.com',
    to: email,
    subject: 'Registration OTP for D Square',
    html: `Your OTP is ${otp}`
  };
  
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
        console.log(error);
        return res.status(500).send("Error sending OTP");
    } else {
        console.log('Email has been sent:', info.response);
         res.render("user/otpPage",{ expirationTime: expirationTime.toISOString(),message:'OTP Resent'});
    }
  })
  };

//otp post controller
const verifyOtp = async(req,res)=>{
  const otp = req.body.otp.join('');
  const email = req.session.email;
  const sessionOTP = req.session.otp;
  const expirationTime = req.session.otpExpirationTime;

  console.log(sessionOTP);
  console.log(otp)
  
  if (sessionOTP == otp) {
       res.render('user/otpSuccess');
  } else {
      res.render('user/otpPage',{message:'Invalid otp'});
  }

};

//product details page

const productDetails = async(req,res)=>{
  try{
    const currentProduct = await productCollection.findOne({_id:req.query.id})
    const productData = await productCollection.find({})
    if(req.session.user){
      res.render('user/product-details',{user:req.session.user,currentProduct,productData})
    }else{
      res.render('user/product-details',{currentProduct,productData})
    }
  }catch(error){
    console.log(error)
  }
}





//logout

const logoutControler = async (req, res) => {
  req.session.destroy();
  res.redirect("/login");
};


module.exports = {
  userHomeController,
  loginControler,
  signupControler,
  signupPostControler,
  loginPostControler,
  logoutControler,
  verifyOtp,
  resendOtp,
  productDetails,



};
