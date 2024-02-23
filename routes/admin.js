const express = require('express');
const upload= require('../services/multer.js')
const { adminHomeController,adminLogin, adminLoginPostController,adminlogout, userManagement, blockUser, unBlockUser} = require('../controller/adminController');
const{addProduct, loadProduct, addProductLoad, editProduct, editProductPost, deleteProduct}= require('../controller/productController');
const { loadCategory, addCategory, addCategoryLoad, editCategoryPost, editCategory, deleteCategory } = require('../controller/categoryController.js');
const app = express.Router()



//admin login & home page
app.get('/',adminHomeController)
app.get('/login',adminLogin);
app.post('/login',adminLoginPostController)
app.get('/logout',adminlogout)


//product management
app.get('/product',loadProduct)
app.get('/addProduct',addProductLoad)
app.post('/addProduct',upload.any(),addProduct)
app.get('/editProduct',editProduct)
app.post('/editProduct',upload.any(),editProductPost);
app.get('/deleteProduct',deleteProduct)


//category management
app.get('/category',loadCategory)
app.get('/addCategory',addCategoryLoad)
app.post('/addCategory',addCategory)
app.get('/editCategory',editCategory)
app.post('/editCategory',editCategoryPost)
app.get('/deleteCategory',deleteCategory)


//user management
app.get('/userManagement',userManagement)
app.patch('/blockUser',blockUser)
app.patch('/unblockUser',unBlockUser)

module.exports = app;     