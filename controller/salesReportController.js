const orderCollection = require('../models/orderModel')
const formatDate = require('../helpers/formatDate')
const exceljs = require('exceljs')
const {ObjectId} = require('mongodb')

//get sales report page
const salesReport = async (req, res) => {
    try {
      if (req.session?.admin?.salesData) {
        let { salesData, dateValues } = req.session.admin;
        return res.render("admin/salesReport", { salesData, dateValues });
      }

      let salesData = await orderCollection.find().populate("userId couponApplied");

      salesData = salesData.map((v) => {
        v.orderDateFormatted = formatDate(v.orderDate);
        return v;
      });

      res.render("admin/salesReport", { salesData, dateValues: null });
    } catch (error) {
      console.error(error);
    }
  }

//sales report download
const salesReportDownload = async (req,res)=>{
   try{
    const workBook = new exceljs.Workbook();
    const sheet = workBook.addWorksheet("book");
    sheet.columns = [
      { header: "No", key: "no", width: 10 },
      { header: "Username", key: "username", width: 25 },
      { header: "Order Date", key: "orderDate", width: 25 },
      { header: "Products", key: "products", width: 35 },
      { header: "No of items", key: "noOfItems", width: 35 },
      { header: "Coupon", key: "coupon", width: 25 },
      { header: "Total Discount", key: "totalDiscount", width: 25 },
      { header: "Total Cost", key: "totalCost", width: 25 },
      { header: "Payment Method", key: "paymentMethod", width: 25 },
      { header: "Status", key: "status", width: 20 },
    ];

    
if(req.session?.admin?.dateValues){

    
     let startDate = new Date(req.session?.admin?.dateValues.startDate);
      startDate.setUTCHours(0, 0, 0, 0); 

     let  endDate = new Date(req.session?.admin?.dateValues.endDate);
     endDate.setUTCHours(23, 59, 59, 999);
    
    let salesData = await orderCollection.find({
        orderDate:{
            $gte: startDate,
            $lte: endDate
        }
    }).populate('userId couponApplied')

    salesData.map((v) => {
      sheet.addRow({
        no: v.orderNumber,
        username: v.userId.name,
        orderDate: v.orderDateFormatted,
        products: v.cartData.map((v) => v.productId.productName).join(", "),
        noOfItems: v.cartData.map((v) => v.productQuantity).join(", "),
        coupon:v.couponApplied.couponCode,
        totalDiscount:v.totalDiscount,
        totalCost: "₹" + v.grandTotalCost,
        paymentMethod: v.paymentType,
        status: v.orderStatus,
      });
    });
     
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=salesReport.xlsx"
    );
   
    workBook.xlsx.write(res);

   }else{

    let salesData = await orderCollection.find().populate('userId couponApplied')


    salesData = salesData.map((v)=>{
        v.orderDateFormatted = formatDate(v.orderDate)
        return v;
    })
  
    salesData.map((v) => {
        sheet.addRow({
          no: v.orderNumber,
          username: v.userId.name,
          orderDate: v.orderDateFormatted,
          products: v.cartData.map((v) => v.productId.productName).join(", "),
          noOfItems: v.cartData.map((v) => v.productQuantity).join(", "),
          coupon:v.couponApplied.couponCode,
          totalDiscount:v.totalDiscount,
          totalCost: "₹" + v.grandTotalCost,
          paymentMethod: v.paymentType,
          status: v.orderStatus,
        });
      });
       
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=salesReport.xlsx"
      );
     
      workBook.xlsx.write(res);

      }
   }catch(error){
    console.log(error)
   }
}


//sales report filter
const salesReportFilter = async (req, res) => {
    try {
     
   let startDate = new Date(req.body.startDate);
    startDate.setUTCHours(0, 0, 0, 0); 

    let endDate = new Date(req.body.endDate);
    endDate.setUTCHours(23, 59, 59, 999);

      let salesDataFiltered = await orderCollection
        .find({
          orderDate: { $gte: startDate, $lte: endDate },
        })
        .populate("userId couponApplied");



      salesData = salesDataFiltered.map((v) => {
        v.orderDateFormatted = formatDate(v.orderDate);
        return v;
      });

      req.session.admin = {};
      req.session.admin.dateValues = req.body;
      req.session.admin.salesData = JSON.parse(JSON.stringify(salesData));
      console.log(req.session.admin.dateValues)
      // console.log(typeof(req.session.admin.salesData));

      res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
    }
  }

module.exports = {salesReport,salesReportDownload,salesReportFilter}