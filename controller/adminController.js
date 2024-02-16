const userCollection = require("../models/userModel");
const bcrypt = require("bcrypt");
const saltRound = 10;

//load homepage
const adminHomeController = async (req, res) => {
  const userData = await userCollection.find({}).lean();
  if (req.session.admin) {
    res.render("admin/home", { userData });
  } else {
    res.redirect("/admin/login");
  }
};

//login page
const adminLogin = (req, res) => {
  res.render("admin/login"); 
};

//login post page

const adminLoginPostController = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email == "admin@gmail.com" && password == "admin") {
    req.session.admin = req.body;
    console.log(req.session.admin);
    req.session.admin.loggedIn = true;
    res.redirect("/admin");
  } else {
    res.render("admin/login", { message: "Invalid Email or password" });
  }
};

//adduser
const addUser = async (req, res) => {
  if (req.session.admin) {
    res.render("admin/add-user");
  } else {
    res.send("Unauthorized request");
  }
};

//adduser post page

const addUserPost = async (req, res) => {
  // Validate input data
  const { name, email, mobile } = req.body;

  if (!name || name.trim() === "" || name.length < 0 || !email || !mobile) {
    return res.status(400).send("Name, email, and mobile are required.");
  }

  // Additional validation for email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).send("Invalid email address.");
  }

  //validation for mobile number
  const mobileRegex = /^\d{10}$/;
  if (!mobileRegex.test(mobile)) {
    return res
      .status(400)
      .send("Invalid mobile number. It should be a ten-digit number.");
  }

  //checking existing user
  const existingUser = await userCollection.findOne({ email });
  if (existingUser) {
    res.render("admin/add-user", { message: "User Name already exists" });
  } else {
    const password = await bcrypt.hash(req.body.password, saltRound);

    req.body.password = password;
    const newUser = await userCollection.create(req.body);
    
    res.redirect("/admin");
  }
};

//edit user
const editUser = async (req, res) => {
  if (req.session.admin) {
    const userData = await userCollection.findOne({ _id: req.query.id }).lean();
    console.log(userData);
    res.render("admin/edit-user", { userData });
  } else {
    res.send("Unauthorized request");
  }
};

//edit user post

const editUserPost = async (req, res) => {
  // Validate input data
  const { name, email, mobile } = req.body;

  if (!name || name.trim() === "" || name.length < 0 || !email || !mobile) {
    return res.status(400).send("Name, email, and mobile are required.");
  }

  // Additional validation for email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).send("Invalid email address.");
  }

  //validation for mobile number
  const mobileRegex = /^\d{10}$/;
  if (!mobileRegex.test(mobile)) {
    return res
      .status(400)
      .send("Invalid mobile number. It should be a ten-digit number.");
  }

  const updatedUser = await userCollection
    .findByIdAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          mobile: req.body.mobile,
        },
      }
    )
    .lean();
  console.log(updatedUser);

  res.redirect("/admin");
};

//delete user
const deleteUser = async (req, res) => {
  await userCollection.findByIdAndDelete({ _id: req.query.id });
  res.redirect("/admin");
};

//admin logout

const adminlogout = async (req, res) => {
  req.session.destroy();
  res.redirect("/admin/login");
};



module.exports = {
  adminHomeController,
  adminLogin,
  adminLoginPostController,
  addUser,
  editUser,
  editUserPost,
  deleteUser,
  addUserPost,
  adminlogout,
};
