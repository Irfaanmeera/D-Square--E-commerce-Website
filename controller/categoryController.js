const express = require("express");
const app = express.Router();
const categoryCollection = require("../models/categoryModel");
const productCollection = require("../models/productModel");

//load category
const loadCategory = async (req, res) => {
  try {
    const category = await categoryCollection.find({});
    res.render("admin/category", {
      category,
      categoryExists: req.session.categoryExists,
    });

    req.session.categoryExists = null;
  } catch (error) {
    console.log(error);
  }
};

//get addCategory controller
const addCategoryLoad = async (req, res) => {
  try {
    if (req.session.admin) {
      res.render("admin/addCategory");
    }
  } catch (error) {
    console.log(error);
  }
};

//post add category controller
// const addCategory = async (req, res) => {
//   try {
//     const { categoryName, categoryDescription } = req.body;

//     let categoryExists = await categoryCollection.findOne({
//       categoryName: { $regex: new RegExp(req.body.categoryName, "i") },
//     });
//     console.log(categoryExists);

//     if(!categoryExists){

//       const category = new categoryCollection({
//         categoryName,
//         categoryDescription,

//     });
//       const categoryData = await category.save();
// console.log(categoryData);

//     if(categoryData){
//     res.redirect('/admin/category');
//  }
//       }else{
//         req.session.categoryExists = categoryExists;

//         res.redirect("/admin/category");
//       }
//   }catch(error){
//     console.log(error.message)
// }
// }

const addCategory = async (req, res) => {
  try {
    const { categoryName, categoryDescription } = req.body;
    console.log(categoryName);
    let categoryExists = await categoryCollection.findOne({
      categoryName: { $regex: new RegExp(req.body.categoryName, "i") },
    });
    console.log("CAtegory Exists: ", categoryExists);
    if (!categoryExists) {
      const category = new categoryCollection({
        categoryName,
        categoryDescription,
      });
      const categoryData = await category.save();
      res.redirect("/admin/category");
    } else {
      req.session.categoryExists = categoryExists;
      res.redirect("/admin/category");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error");
  }
};

//edit category
const editCategory = async (req, res) => {
  try {
    if (req.session.admin) {
      const category = await categoryCollection
        .findOne({ _id: req.query.id })
        .lean();
      res.render("admin/editCategory", { category });
    }
  } catch (error) {
    console.log(error);
  }
};

//edit category post controller
const editCategoryPost = async (req, res) => {
  try {
    const updateFields = {
      $set: {
        categoryName: req.body.productName,
        categoryDescription: req.body.categoryDescription,
      },
    };

    const updatedCategory = await categoryCollection
      .findByIdAndUpdate(req.query.id, updateFields, { new: true })
      .lean();

    console.log(updatedCategory);

    res.redirect("/admin/category");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

//delete category
const deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await categoryCollection.findByIdAndDelete({
      _id: req.query.id,
    });
    res.redirect("/admin/category");

    console.log(deletedCategory);
  } catch (error) {
    console.log(error);
  }
};

const unlistCategory = async (req, res) => {
  try {
    await categoryCollection.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { is_listed: false } }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
  }
};

const listCategory = async (req, res) => {
  try {
    await categoryCollection.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { is_listed: true } }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  loadCategory,
  addCategoryLoad,
  addCategory,
  editCategory,
  editCategoryPost,
  deleteCategory,
  listCategory,
  unlistCategory,
};
