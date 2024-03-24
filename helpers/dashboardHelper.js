const categoryCollection = require('../models/categoryModel')
const orderCollection = require('../models/orderModel')
const productCollection = require('../models/productModel')
const userCollection = require('../models/userModel')

//product count
const productCount = async()=>{
    try{
        const result= await productCollection.countDocuments()
        return result;
         
    }catch(error){
        console.log(error)
    }
}

//users count
const userCount = async()=>{
    try{
       const result = await userCollection.countDocuments()
        return result;
    }catch(error){
        console.log(error)
    }
}

//category count
const categoryCount = async()=>{
    try{
  const  result= await categoryCollection.countDocuments()
  return result;
    }catch(error){
        console.log(error)
    }
}

//pending orders count
const pendingOrdersCount = async()=>{
    try{
const result = await orderCollection.countDocuments({
    orderStatus:{ $nin: ['Delivered', 'Cancelled', 'Return Pending', 'Return Accepted'] }
})
return result;
    }catch(error){
        console.log(error)
    }
}


//completed orders count
const totalOrdersCount = async()=>{
    try{
const result = await orderCollection.countDocuments({
})
return result;
    }catch(error){
        console.log(error)
    }
}


//total revenue
const totalRevenue = async () => {
    try {
        const result = await orderCollection.aggregate([
            {
                $match: {
                    orderStatus: { $nin: ["Cancelled", "Return Pending",'Return Accepted'] } // Exclude 'cancelled' and 'return' orderStatus
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$grandTotalCost' }
                }
            }
        ]);

        return result.length > 0 ? result[0].totalRevenue : 0;
    } catch (error) {
        console.error(error);
    }
};


//current day revenue
const currentDayRevenue= async()=>{
    try{
        let today = new Date();
        let yesterday = new Date()
        yesterday.setDate(today.getDate()-1)

      const result = await orderCollection.aggregate([{$match:{orderDate:{$gte:yesterday,$lt:today}}},
    {$group:{_id:'null',totalRevenue:{$sum:'$grandTotalCost'}}}])
    return result.length >0? result[0].totalRevenue:0;
    }catch(error){
        console.log(error)
    }
}


//weekly revenue
// const currentWeekRevenue= async () => {
//     try {
//       const today = new Date();
//       const firstDayOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
//       const lastDayOfWeek = new Date(firstDayOfWeek);
//       lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
  
//       const result = await orderCollection.aggregate([
//         {
//           $match: {
//             orderDate: { $gte: firstDayOfWeek, $lte: lastDayOfWeek }
//           }
//         },
//         {
//           $group: {
//             _id: null,
//             currentWeekRevenue: { $sum: "$grandTotalCost" }
//           }
//         }
//       ]);

//       return {
//         date: result.map((v) => v._id),
//         revenue: result.map((v) => v.currentWeekRevenue),
//       };
//     } catch (error) {
//       console.error(error);
//     }
//   }
  



const currentWeekRevenue= async () => {
    try {
      const result = await orderCollection.aggregate([
        {
                $match: {
                    orderStatus: { $nin: ["Cancelled", "Return Pending",'Return Accepted'] } // Exclude 'cancelled' and 'return' orderStatus
                }
            },
          {$group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
            dailyRevenue: { $sum: "$grandTotalCost" },
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $limit: 14,
        },
      ]);
      return {
        date: result.map((v) => v._id),
        revenue: result.map((v) => v.dailyRevenue),
      };
    } catch (error) {
      console.error(error);
    }
  }
  



//current month revenue
const currentMonthRevenue = async () => {
    try {
        const result = await orderCollection.aggregate([
            {
                $match: {
                    orderStatus: { $nin: ["Cancelled", "Return Pending",'Return Accepted'] }, // Exclude 'cancelled' and 'return' orderStatus
                    orderDate: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } // Filter by current month
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$orderDate" } },
                    monthlyRevenue: { $sum: "$grandTotalCost" },
                },
            }
        ]);

        return {
        month: result.map((v) => v._id),
        revenue: result.map((v) =>v.monthlyRevenue)
        }
    } catch (error) {
        console.error(error);
    }
};


  const categoryWiseRevenue = async () => {
    try {
        const result = await orderCollection.aggregate([
            {
                $match: {
                    orderStatus: { $nin: ["Cancelled", "Return"] } // Exclude 'cancelled' and 'return' orderStatus
                }
            },
            { $unwind: "$cartData" },
            {
                $group: {
                    _id: "$cartData.productId.category",
                    revenuePerCategory: { $sum: "$cartData.totalCostPerProduct" },
                },
            },
        ]);

        return {
            categoryName: result.map((v) => v._id),
            revenuePerCategory: result.map((v) => v.revenuePerCategory),
        };
    } catch (error) {
        console.error(error);
    }
};

  

module.exports = {productCount,userCount,categoryCount,pendingOrdersCount,totalOrdersCount,totalRevenue,currentDayRevenue,currentMonthRevenue,currentWeekRevenue,categoryWiseRevenue}