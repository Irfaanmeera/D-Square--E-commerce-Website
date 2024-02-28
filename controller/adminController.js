const userCollection = require("../models/userModel");
const adminCollection= require('../models/adminModel')


//load homepage
const adminHomeController = async (req, res) => {

  if (req.session.admin) {
    console.log(req.session.admin)
    res.render("admin/home");
  } else {
    res.redirect("/admin/login");
  }
};

//login page
const adminLogin = (req, res) => {
  if(req.session.admin){
    res.redirect('/admin')
  }else{
  res.render("admin/login"); 
  }
};

//login post page

const adminLoginPostController = async (req, res) => {
  const{email,password} =req.body;

  const admin = await adminCollection.findOne(req.body);
  if (admin){

      req.session.admin= admin;

      console.log(req.session.admin);
      res.redirect('/admin');
    } else {
    res.render("admin/login", { message: "Invalid Email or password" });
  }
};


//user management

const userManagement = async (req, res) => {
  try {
    if(req.session.admin){
    let allUsersData = await userCollection.find({}, { password: false });
    res.render("admin/userManagement", { allUsersData });
    }
  } catch (error) {
    console.error(error);
  }
}

//block user
const blockUser = async (req, res) => {
  try {
    if(req.session.admin){
  const blockedUser =  await userCollection.findOneAndUpdate(
      { _id: req.query.id },
      { $set: { isBlocked: true } }
    );
    console.log(blockedUser)
    res.json({success: true})
  }
  }catch (error) {
    console.error(error);
  }
}

//unblock user
const unBlockUser = async (req, res) => {
  try {
    if(req.session.admin){
    await userCollection.findOneAndUpdate(
      { _id: req.query.id },
      { $set: { isBlocked: false } }
    );
    res.json({success: true})
    }
  } catch (error) {
    console.error(error);
  }
}






//admin logout

const adminlogout = async (req, res) => {
  req.session.destroy();
  res.redirect("/admin/login");
};



module.exports = {
  adminHomeController,
  adminLogin,
  adminLoginPostController,
  adminlogout,
  userManagement,
  blockUser,
  unBlockUser,
};
