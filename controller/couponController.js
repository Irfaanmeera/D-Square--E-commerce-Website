const couponCollection = require("../models/couponModel");
const formatDate = require("../helpers/formatDate");

//get coupon page load
const couponPageLoad = async (req, res) => {
  try {
    let couponData = await couponCollection.find();
    couponData = couponData.map((coupon) => {
      coupon.startDateFormatted = formatDate(coupon.startDate);
      coupon.expiryDateFormatted = formatDate(coupon.expiryDate);
      return coupon;
    });
    res.render("admin/coupons", { couponData });
  } catch (error) {
    console.log(error);
  }
};

//add coupon get
const addCouponLoad = async (req, res) => {
  try {
    res.render("admin/addCoupon");
  } catch (error) {
    console.log(error);
  }
};

//add coupon post controller
const addCoupon = async (req, res) => {
  try {
    let existingCoupon = await couponCollection.findOne({
      couponCode: { $regex: new RegExp(req.body.couponCode, "i") },
    });
    if (!existingCoupon) {
      await couponCollection.insertMany([
        {
          couponCode: req.body.couponCode,
          discountPercentage: req.body.discountPercentage,
          startDate: new Date(req.body.startDate),
          expiryDate: new Date(req.body.expiryDate),
          minimumPurchase: req.body.minimumPurchase,
          maximumDiscount: req.body.maximumDiscount,
        },
      ]);
      res.redirect("/admin/couponManagement");
    } else {
      res.render("/admin/couponManagement", {
        message: "Coupon Already Exists",
      });
    }
  } catch (error) {
    console.error(error);
  }
};

//edit coupon get controller
const editCouponLoad = async (req, res) => {
  try {
    const coupon = await couponCollection.findOne({ _id: req.query.id });
    res.render("admin/editCoupon", { coupon });
  } catch (error) {
    console.log(error);
  }
};

//edit coupon post controller
const editCoupon = async (req, res) => {
  try {
    let updateFields = {
      couponCode: req.body.couponCode,
      discountPercentage: req.body.discountPercentage,
      startDate: new Date(req.body.startDate),
      expiryDate: new Date(req.body.expiryDate),
      minimumPurchase: req.body.minimumPurchase,
      maximumDiscount: req.body.maximumDiscount,
    };
    const updatedCoupon = await couponCollection
      .findByIdAndUpdate(req.query.id, updateFields, { new: true })
      .lean();
    console.log(updatedCoupon);
    res.redirect("/admin/couponManagement");
  } catch (error) {
    console.error(error);
  }
};

//delete category
const deleteCoupon = async (req, res) => {
  try {
    const deletedCoupon = await couponCollection.findByIdAndDelete({
      _id: req.query.id,
    });
    res.redirect("/admin/couponManagement");

    console.log(deletedCoupon);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  couponPageLoad,
  addCoupon,
  addCouponLoad,
  editCoupon,
  editCouponLoad,
  deleteCoupon,
};
