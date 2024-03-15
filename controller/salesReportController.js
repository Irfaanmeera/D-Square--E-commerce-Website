const orderCollection = require('../models/orderModel')
const formatDate = require('../helpers/formatDate')
const exceljs = require('exceljs')
const {ObjectId} = require('mongodb')

//get sales report page
const salesReport = async (req,res)=>{
    try{
if(req.session?.admin?.salesData){
    let{salesData,dataValues} = req.session.admin;
    res.render('admin/salesReport',{salesData,dataValues})
}

    let salesData= await orderCollection.find().populate('userId');   
    
    salesData = salesData.map((v)=>{
        v.orderDateFormatted = formatDate(v.orderDate)
        return v;
    })
    res.render('admin/salesReport',{salesData,dataValues:null})

    }catch(error){
        console.log(error)
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
      { header: "Total Cost", key: "totalCost", width: 25 },
      { header: "Payment Method", key: "paymentMethod", width: 25 },
      { header: "Status", key: "status", width: 20 },
    ];

    let salesData = req.session?.admin?.dataValues
    ?await orderCollection.find({
        orderDate:{
            $gte: new Date(req.session.admin.dateValues.startDate),
            $lte: new Date(req.session.admin.dateValues.endDate)
        }
    }).populate('userId','couponApplied')
    : await orderCollection.find().populate('userId','couponApplied')


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


   }catch(error){
    console.log(error)
   }
}


module.exports = {salesReport}