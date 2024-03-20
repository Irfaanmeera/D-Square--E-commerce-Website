const userCollection = require("../models/userModel");
const adminCollection = require("../models/adminModel");
const dashboardHelper = require('../helpers/dashboardHelper');
const categoryCollection = require("../models/categoryModel");
const orderCollection= require('../models/orderModel')



//login page
const adminLogin = (req, res) => {
  if (req.session.admin) {
    res.redirect("/admin");
  } else {
    res.render("admin/login");
  }
};

//login post page
const adminLoginPostController = async (req, res) => {
  const { email, password } = req.body;

  const admin = await adminCollection.findOne(req.body);
  if (admin) {
    req.session.admin = admin;

    console.log(req.session.admin);
    res.redirect("/admin");
  } else {
    res.render("admin/login", { message: "Invalid Email or password" });
  }
};

//load dashBoard
const adminDashboard = async (req, res) => {
 
  const bestSellingCategory = await orderCollection.aggregate([
    { $match: { orderStatus: { $ne: "Cancelled" } } },
    { $unwind: "$cartData" }, // Unwind to access individual products
    {
      $group: {
        _id: "$cartData.productId.category", // Group by category
        totalSales: { $sum: "$cartData.productQuantity" } // Calculate total sales
      }
    },
    { $sort: { totalSales: -1 } }, // Sort by total sales in descending order
    { $limit: 10 } // Limit to top 10 categories
  ]);

  const bestSellingProducts = await orderCollection.aggregate([
    { $match: { orderStatus: { $ne: "Cancelled" } } },
    { $unwind: "$cartData" }, // Unwind to access individual products
    {
      $group: {
        _id: "$cartData.productId.productName", // Group by product ID
        totalSales: { $sum: "$cartData.productQuantity" } // Calculate total sales
      }
    },
    { $sort: { totalSales: -1 } }, // Sort by total sales in descending order
    { $limit: 10 } // Limit to top 10 products
]);

const bestSellingBrand = await orderCollection.aggregate([
  { $match: { orderStatus: { $ne: "Cancelled" } } },
  { $unwind: "$cartData" }, // Unwind to access individual products
  {
    $group: {
      _id: "$cartData.productId.brand", // Group by category
      totalSales: { $sum: "$cartData.productQuantity" } // Calculate total sales
    }
  },
  { $sort: { totalSales: -1 } }, // Sort by total sales in descending order
  { $limit: 10 } // Limit to top 10 categories
]);

    res.render("admin/dashboard",{bestSellingCategory,bestSellingProducts,bestSellingBrand});
 
};

//admin dashboard data
const dashboardData = async(req,res)=>{
  try{
     const [
    productCount,
    userCount,
    categoryCount,
    pendingOrdersCount,
    totalOrdersCount,
    totalRevenue,
    currentDayRevenue,
    currentMonthRevenue,
    currentWeekRevenue,
    categoryWiseRevenue,
     ] = await Promise.all([
      dashboardHelper.productCount(),
      dashboardHelper.userCount(),
      dashboardHelper.categoryCount(),
      dashboardHelper.pendingOrdersCount(),
      dashboardHelper.totalOrdersCount(),
      dashboardHelper.totalRevenue(),
      dashboardHelper.currentDayRevenue(),
      dashboardHelper.currentMonthRevenue(),
      dashboardHelper.currentWeekRevenue(),
      dashboardHelper.categoryWiseRevenue(),
     ]);
     const data = {
      productCount,
      userCount,
      categoryCount,
      pendingOrdersCount,
      totalOrdersCount,
      totalRevenue,
      currentDayRevenue,
      currentMonthRevenue,
      currentWeekRevenue,
      categoryWiseRevenue
     }

     
     res.json(data)

  }catch(error){
      console.log(error)
    }
}

//user management
const userManagement = async (req, res) => {
  try {
    if (req.session.admin) {
      let allUsersData = await userCollection.find({}, { password: false });
      res.render("admin/userManagement", { allUsersData });
    }
  } catch (error) {
    console.error(error);
  }
};

//block user
const blockUser = async (req, res) => {
  try {
    if (req.session.admin) {
      const blockedUser = await userCollection.findOneAndUpdate(
        { _id: req.query.id },
        { $set: { isBlocked: true } }
      );
      console.log(blockedUser);
      res.json({ success: true });
    }
  } catch (error) {
    console.error(error);
  }
};

//unblock user
const unBlockUser = async (req, res) => {
  try {
    if (req.session.admin) {
      await userCollection.findOneAndUpdate(
        { _id: req.query.id },
        { $set: { isBlocked: false } }
      );
      res.json({ success: true });
    }
  } catch (error) {
    console.error(error);
  }
};

//admin logout
const adminlogout = async (req, res) => {
  req.session.destroy();
  res.redirect("/admin/login");
};

module.exports = {
  adminDashboard,
  adminLogin,
  adminLoginPostController,
  adminlogout,
  dashboardData,
  userManagement,
  blockUser,
  unBlockUser,
};
