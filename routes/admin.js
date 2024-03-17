const express = require('express');
const upload= require('../services/multer.js')
const adminAuth = require('../middlewares/adminAuth')
const { adminHomeController,adminLogin, adminLoginPostController,adminlogout, userManagement, blockUser, unBlockUser} = require('../controller/adminController');
const{addProduct, loadProduct, addProductLoad, editProduct, editProductPost, deleteProduct, listProduct, unlistProduct}= require('../controller/productController');
const { loadCategory, addCategory, addCategoryLoad, editCategoryPost, editCategory, deleteCategory, listCategory, unlistCategory } = require('../controller/categoryController.js');
const { orderManagement, changePendingStatus, changeStatus } = require('../controller/orderController.js')
const app = express.Router()
const{ couponPageLoad, addCoupon, addCouponLoad, editCouponLoad, editCoupon, deleteCoupon } = require('../controller/couponController.js')
const { salesReport, salesReportDownload, salesReportFilter } = require('../controller/salesReportController.js')
const{ offerManagement, addOffer, editOffer, categoryOffer } = require('../controller/offerController.js')

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
app.patch('/listProduct/:id',adminAuth,listProduct)
app.patch('/unlistProduct/:id',adminAuth,unlistProduct)


//category management
app.get('/category',adminAuth,loadCategory)
app.get('/addCategory',adminAuth,addCategoryLoad)
app.post('/addCategory',adminAuth,addCategory)
app.get('/editCategory',adminAuth,editCategory)
app.post('/editCategory',adminAuth,editCategoryPost)
app.get('/deleteCategory',adminAuth,deleteCategory)
app.patch('/listCategory/:id',adminAuth,listCategory)
app.patch('/unlistCategory/:id',adminAuth,unlistCategory)


//user management
app.get('/userManagement',adminAuth,userManagement)
app.patch('/blockUser',adminAuth,blockUser)
app.patch('/unblockUser',adminAuth,unBlockUser)

//order management
app.get('/orderManagement',adminAuth,orderManagement)
app.post('/changeStatus/:id',adminAuth,changeStatus)

//coupon management
app.get('/couponManagement', adminAuth,couponPageLoad)
app.get('/addCoupon',adminAuth,addCouponLoad)
app.post('/addCoupon',adminAuth,addCoupon)
app.get('/editCoupon',adminAuth,editCouponLoad)
app.post('/editCoupon',adminAuth,editCoupon)
app.get('/deleteCoupon',adminAuth,deleteCoupon)

//offer management
app.get('/offerManagement',adminAuth,offerManagement)
app.post('/addOffer',adminAuth,addOffer)
app.put('/editOffer/:id',adminAuth,editOffer)
app.post('/categoryOffer',adminAuth,categoryOffer)

//salesReport management
app.get('/salesReport',adminAuth,salesReport)
app.get('/salesReportDownload',adminAuth,salesReportDownload)
app.post('/salesReportFilter',adminAuth, salesReportFilter)

module.exports = app;     