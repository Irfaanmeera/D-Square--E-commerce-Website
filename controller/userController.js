const userCollection = require("../models/userModel");
const productCollection = require("../models/productModel");
const categoryCollection = require("../models/categoryModel");
const transporter = require("../services/sendOtp");
const bcrypt = require("bcryptjs");
const cartCollection = require("../models/cartModel");
const walletCollection = require("../models/walletModel");
const wishlistCollection = require("../models/wishlistModel");
const productOfferCollection = require("../models/offerModel");
const applyReferralOffer = require("../helpers/applyReferralOffer");
const bannerCollection = require("../models/bannerModel");
const saltRound = 10;

//homepage
const userHomeController = async (req, res) => {
  let user = req.session.user;
  let productData = await productCollection.find({ is_listed: true }).lean();
  let categoryData = await categoryCollection.find(
    { is_listed: true },
    { categoryName: true }
  );

  const cartProduct = await cartCollection
    .find({ userId: req.session?.user?._id })
    .populate("productId");
  const count = await cartCollection.countDocuments({
    userId: req.session?.user?._id,
  });
  const wishlistCount = await wishlistCollection.countDocuments({
    userId: req.session?.user?._id,
  });
  const wishlistData = await wishlistCollection.find({
    userId: req.session?.user?._id,
  });
  const productOffer = await productOfferCollection
    .find()
    .populate("productId");
  const bannerData = await bannerCollection.find();

  if (req.session.user) {
    res.render("user/homepageUser", {
      user,
      productData,
      categoryData,
      grandTotal: req.session.grandTotal,
      count,
      cartProduct,
      wishlistCount,
      wishlistData,
      productOffer,
      bannerData,
    });
  } else {
    res.render("user/homepageUser", { productData, categoryData, bannerData });
  }
};

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
  const { email, password } = req.body;

  const user = await userCollection.findOne({ email });
  if (user) {
    const password = await bcrypt.compare(req.body.password, user.password);

    if (password) {
      if (user.isBlocked) {
        res.render("user/login", { message: "You are blocked by admin" });
      } else {
        req.session.user = user;
        res.redirect("/");
      }
    } else {
      res.render("user/login", { message: "Invalid Password" });
    }
  } else {
    res.render("user/login", { message: "Invalid Email" });
  }
};

//signup
const signupControler = async (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("user/signup");
    console.log(req.query?.referralCode);
    req.session.tempUserReferralCode = req.query?.referralCode;
  }
};

//userLoginModel
const userLoginModel = async (req, res, next) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (
      !name ||
      name.trim() === "" ||
      name.length < 0 ||
      !email ||
      !mobile ||
      !password
    ) {
      return res.render("user/signup", {
        message: "Name, email, and mobile are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.render("user/signup", { message: "Invalid email id" });
    }

    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobile)) {
      return res.render("user/signup", { message: "Invalid mobile number" });
    }

    if (password.length < 6) {
      return res.render("user/signup", {
        message: "Password must be at least 6 characters long",
      });
    }

    const existingUser = await userCollection.findOne({
      email,
      isBlocked: false,
    });
    let referralCode = Math.floor(1000 + Math.random() * 9000);

    if (existingUser) {
      return res.render("user/signup", { message: "User Name already exists" });
    }

    const encryptedPassword = await bcrypt.hash(req.body.password, saltRound);

    req.session.tempUserData = {
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      password: encryptedPassword,
      referralCode,
    };
    // req.session.user = req.body;
    // req.session.loggedIn = true;
    console.log(req.session.tempUserData);
    next();
  } catch (error) {
    console.log(error);
  }
};

//sendOtp
const sendOtp = async (req, res) => {
  const otp = Math.floor(1000 + Math.random() * 9000);
  req.session.otp = otp;
  req.session.emailofNewUser = req.body.email;

  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 5);

  req.session.otpExpiration = expirationTime;
  console.log(req.session.otpExpiration);

  const mailOptions = {
    from: "irfaanmeera@gmail.com",
    to: `${req.session.emailofNewUser}`,
    subject: "Registration OTP for D Square",
    html: `Your OTP is ${otp}`,
  };

  await transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return res.status(500).send("Error sending OTP");
    } else {
      console.log("Email has been sent:", info.response);
      res.render("user/otpPage", {
        expirationTime: expirationTime.toISOString(),
      });
    }
  });
};

//signup Post controller
const signupPostController = async (req, res) => {
  try {
    const otp = req.body.otp.join("");
    const sessionOTP = req.session.otp;

    if (sessionOTP == otp) {
      await userCollection.create(req.session.tempUserData);
      req.session.user = await userCollection.findOne({
        email: req.session.tempUserData.email,
      });

      //adding money to wallet if referral code exists
      let tempUserReferralCode = req.session?.tempUserReferralCode;
      if (tempUserReferralCode) {
        await applyReferralOffer(tempUserReferralCode);
      }

      await walletCollection.create({ userId: req.session.user._id });

      res.redirect("/");

      console.log(req.session.user);
    } else {
      res.render("user/otpPage", { message: "Invalid otp" });
    }
  } catch (error) {
    console.log(error);
  }
};

//forgot password
const forgotPassword = async (req, res) => {
  try {
    res.render("user/forgotPassword");
  } catch (error) {
    console.log(error);
  }
};

//forgot user post controller
const forgotPasswordUsermodel = async (req, res, next) => {
  try {
    console.log(req.body);
    const forgotUserData = await userCollection.findOne({
      email: req.body.email,
    });
    if (!forgotUserData) {
      res.render("user/forgotPassword", {
        message: "Email not Exist,Enter registered email id",
      });
    } else {
      req.session.forgotUserData = forgotUserData;
      next();
    }
  } catch (error) {
    console.log(error);
  }
};

//send otp for forgot password
const sendForgotPwdOtp = async (req, res) => {
  try {
    const otp = Math.floor(1000 + Math.random() * 9000);
    req.session.otp = otp;

    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 5);

    req.session.otpExpiration = expirationTime;
    console.log(req.session.otpExpiration);

    const mailOptions = {
      from: "irfaanmeera@gmail.com",
      to: `${req.body.email}`,
      subject: "Password Reset OTP for D Square",
      html: `Your OTP is ${otp}`,
    };

    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.status(500).send("Error sending OTP");
      } else {
        console.log("Email has been sent:", info.response);
        res.render("user/forgotPasswordOtp", {
          expirationTime: expirationTime.toISOString(),
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
};
//forgot password reset get controller
const forgotPasswordResetPage = async (req, res) => {
  try {
    res.render("user/forgotPasswordReset");
  } catch (error) {
    console.log(error);
  }
};

//forgot password reset post controller
const forgotPasswordReset = async (req, res) => {
  try {
    let encryptedPassword = await bcrypt.hashSync(
      req.body.newPassword,
      saltRound
    );
    let resetPasswordUser = await userCollection.findOneAndUpdate(
      { _id: req.session.forgotUserData._id },
      { $set: { password: encryptedPassword } }
    );
    res.redirect("/login");
    console.log(resetPasswordUser);
  } catch (error) {
    console.log(error);
  }
};

//product details page
const productDetails = async (req, res) => {
  try {
    const currentProduct = await productCollection.findOne({
      _id: req.params.id,
    });
    console.log(currentProduct._id);
    const count = await cartCollection.countDocuments({
      userId: req.session?.user?._id,
    });
    const categoryData = await categoryCollection.find({});
    const cartProduct = await cartCollection.find({
      userId: req.session?.user?._id,
    });
    const wishlistData = await wishlistCollection.find({
      userId: req.session?.user?._id,
    });
    const wishlistCount = await wishlistCollection.countDocuments({
      userId: req.session?.user?._id,
    });

    const productData = await productCollection.find({});

    const cartData = await cartCollection.findOne({
      userId: req.session?.user?._id,
      productId: req.params.id,
    });
    if (cartData) {
      var cartProductQuantity = cartData.productQuantity;
    }

    let productQtyLimit = [],
      i = 0;
    while (i < currentProduct.productStock - cartProductQuantity) {
      productQtyLimit.push(i + 1);
      i++;
    }
    res.render("user/product-details", {
      user: req.session.user,
      currentProduct,
      productData,
      productQtyLimit,
      count,
      wishlistCount,
      wishlistData,
      cartProduct,
      categoryData,
    });
  } catch (error) {
    console.log(error);
  }
};

//aboutUs page
const aboutUsPage = async (req, res) => {
  try {
    const count = await cartCollection.countDocuments({
      userId: req.session?.user?._id,
    });
    const wishlistCount = await wishlistCollection.countDocuments({
      userId: req.session?.user?._id,
    });
    const wishlistData = await wishlistCollection.find({
      userId: req.session?.user?._id,
    });
    let categoryData = await categoryCollection.find(
      { is_listed: true },
      { categoryName: true }
    );
    res.render("user/aboutUs", {
      user: req.session.user,
      count,
      wishlistCount,
      wishlistData,
      categoryData,
    });
  } catch {
    console.log(error);
  }
};

//logout
const logoutControler = async (req, res) => {
  req.session.destroy();
  res.redirect("/login");
};

module.exports = {
  userHomeController,
  loginControler,
  signupControler,
  userLoginModel,
  signupPostController,
  loginPostControler,
  logoutControler,
  sendOtp,
  productDetails,
  forgotPassword,
  forgotPasswordUsermodel,
  sendForgotPwdOtp,
  forgotPasswordResetPage,
  forgotPasswordReset,
  aboutUsPage,
};
