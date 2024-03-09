const express = require('express');
const upload= require('../services/multer.js')
const adminAuth = require('../middlewares/adminAuth')
const { adminHomeController,adminLogin, adminLoginPostController,adminlogout, userManagement, blockUser, unBlockUser} = require('../controller/adminController');
const{addProduct, loadProduct, addProductLoad, editProduct, editProductPost, deleteProduct}= require('../controller/productController');
const { loadCategory, addCategory, addCategoryLoad, editCategoryPost, editCategory, deleteCategory } = require('../controller/categoryController.js');
const { orderManagement, changePendingStatus, changeStatus } = require('../controller/orderController.js')
const app = express.Router()



//admin login & home page
app.get('/',adminAuth,adminHomeController)
app.get('/login',adminLogin);
app.post('/login',adminLoginPostController)
app.get('/logout',adminlogout)


//product management
app.get('/product',adminAuth,loadProduct)
app.get('/addProduct',adminAuth,addProductLoad)
app.post('/addProduct',adminAuth,upload.any(),addProduct)
app.get('/editProduct',adminAuth,editProduct)
app.post('/editProduct',adminAuth,upload.any(),editProductPost);
app.get('/deleteProduct',adminAuth,deleteProduct)


//category management
app.get('/category',adminAuth,loadCategory)
app.get('/addCategory',adminAuth,addCategoryLoad)
app.post('/addCategory',adminAuth,addCategory)
app.get('/editCategory',adminAuth,editCategory)
app.post('/editCategory',adminAuth,editCategoryPost)
app.get('/deleteCategory',adminAuth,deleteCategory)


//user management
app.get('/userManagement',adminAuth,userManagement)
app.patch('/blockUser',adminAuth,blockUser)
app.patch('/unblockUser',adminAuth,unBlockUser)

//order management
app.get('/orderManagement',adminAuth,orderManagement)
app.post('/changeStatus/:id',adminAuth,changeStatus)

module.exports = app;     