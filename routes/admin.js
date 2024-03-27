const express = require('express');
const upload= require('../services/multer.js')
const adminAuth = require('../middlewares/adminAuth')
const { adminLogin, adminLoginPostController,adminlogout, userManagement, blockUser, unBlockUser, adminDashboard, dashboardData, bannerManagement, uploadBanner, deleteBanner} = require('../controller/adminController');
const{addProduct, loadProduct, addProductLoad, editProduct, editProductPost, deleteProduct, listProduct, unlistProduct}= require('../controller/productController');
const { loadCategory, addCategory, addCategoryLoad, editCategoryPost, editCategory, deleteCategory, listCategory, unlistCategory } = require('../controller/categoryController.js');
const { orderManagement,changeStatus, acceptReturnOrder } = require('../controller/orderController.js')
const adminRoute = express.Router()
const{ couponPageLoad, addCoupon, addCouponLoad, editCouponLoad, editCoupon, deleteCoupon } = require('../controller/couponController.js')
const { salesReport, salesReportDownload, salesReportFilter, salesReportFilterWeekly } = require('../controller/salesReportController.js')
const{ offerManagement, addOffer, editOffer, categoryOffer } = require('../controller/offerController.js')

//admin login & home page
adminRoute.get('/login',adminLogin);
adminRoute.post('/login',adminLoginPostController)
adminRoute.get('/logout',adminlogout)

//dashboard management
adminRoute.get('/',adminAuth,adminDashboard)
adminRoute.get('/dashboardData',adminAuth,dashboardData)

//product management
adminRoute.get('/product',adminAuth,loadProduct)
adminRoute.get('/addProduct',adminAuth,addProductLoad)
adminRoute.post('/addProduct',adminAuth,upload.any(),addProduct)
adminRoute.get('/editProduct',adminAuth,editProduct)
adminRoute.post('/editProduct',adminAuth,upload.any(),editProductPost);
adminRoute.get('/deleteProduct',adminAuth,deleteProduct)
adminRoute.patch('/listProduct/:id',adminAuth,listProduct)
adminRoute.patch('/unlistProduct/:id',adminAuth,unlistProduct)


//category management
adminRoute.get('/category',adminAuth,loadCategory)
adminRoute.get('/addCategory',adminAuth,addCategoryLoad)
adminRoute.post('/addCategory',adminAuth,addCategory)
adminRoute.get('/editCategory',adminAuth,editCategory)
adminRoute.post('/editCategory',adminAuth,editCategoryPost)
adminRoute.get('/deleteCategory',adminAuth,deleteCategory)
adminRoute.patch('/listCategory/:id',adminAuth,listCategory)
adminRoute.patch('/unlistCategory/:id',adminAuth,unlistCategory)


//user management
adminRoute.get('/userManagement',adminAuth,userManagement)
adminRoute.patch('/blockUser',adminAuth,blockUser)
adminRoute.patch('/unblockUser',adminAuth,unBlockUser)

//order management
adminRoute.get('/orderManagement',adminAuth,orderManagement)
adminRoute.post('/changeStatus/:id',adminAuth,changeStatus)
adminRoute.post('/acceptReturnOrder/:id',adminAuth,acceptReturnOrder)

//coupon management
adminRoute.get('/couponManagement', adminAuth,couponPageLoad)
adminRoute.get('/addCoupon',adminAuth,addCouponLoad)
adminRoute.post('/addCoupon',adminAuth,addCoupon)
adminRoute.get('/editCoupon',adminAuth,editCouponLoad)
adminRoute.post('/editCoupon',adminAuth,editCoupon)
adminRoute.get('/deleteCoupon',adminAuth,deleteCoupon)

//offer management
adminRoute.get('/offerManagement',adminAuth,offerManagement)
adminRoute.post('/addOffer',adminAuth,addOffer)
adminRoute.put('/editOffer/:id',adminAuth,editOffer)
adminRoute.post('/categoryOffer',adminAuth,categoryOffer)

//salesReport management
adminRoute.get('/salesReport',adminAuth,salesReport)
adminRoute.get('/salesReportDownload',adminAuth,salesReportDownload)
adminRoute.post('/salesReportFilter',adminAuth, salesReportFilter)
adminRoute.post('/salesReportFilterWeekly',adminAuth, salesReportFilterWeekly)

//banner management
adminRoute.get('/bannerManagement',adminAuth,bannerManagement)
adminRoute.post('/uploadBanner',adminAuth,upload.single('bannerImage'),uploadBanner)
adminRoute.delete('/deleteBanner/:id',adminAuth,deleteBanner)

module.exports = adminRoute;     