const productOfferCollection = require('../models/offerModel')
const productCollection = require('../models/productModel')
const categoryCollection = require('../models/categoryModel')
const formatDate = require('../helpers/formatDate')
const applyProductOffer = require('../helpers/applyProductOffers')


//offer management page load
const offerManagement = async(req,res)=>{
    try{
      let productOfferData = await productOfferCollection.find();
      productOfferData.forEach(async(v)=>{
        await productOfferCollection.updateOne({_id:v._id},
            {
                $set:{
               currentStatus : v.endDate >= new Date() & v.startDate <= new Date()
            }
        })
      })
       //sending the formatted date to the page
       productOfferData = productOfferData.map((v) => {
        v.startDateFormatted = formatDate(v.startDate, "YYYY-MM-DD");
        v.endDateFormatted = formatDate(v.endDate, "YYYY-MM-DD");
        return v;
      });

      let productData = await productCollection.find();
      let categoryData = await categoryCollection.find();
      res.render("admin/offer", {
        productData,
        productOfferData,
        categoryData,
      });
    }catch(error){
        console.log(error)
    }
}

//add product offer
const addOffer = async(req,res)=>{
    try{
        let {productName} = req.body;
        let existingOffer = await productOfferCollection.findOne({productName})

        if(!existingOffer){
            let productData = await productCollection.findOne({productName})

            let {productOfferPercentage,startDate,endDate} = req.body;
            await productOfferCollection.insertMany([
                {
                    productId:productData._id,
                    productName,
                    productOfferPercentage,
                    startDate:new Date(startDate),
                    endDate:new Date(endDate)
                }
            ]);
            await applyProductOffer('addOffer');
            res.json({success:true});
        }else{
            res.json({success:false})
        }

    }catch(error){
        console.log(error)
    }
}

//edit offer
const editOffer= async (req, res) => {
    try {
      let { productName } = req.body;
      let existingOffer = await productOfferCollection.findOne({
        productName: { $regex: new RegExp(req.body.productName, "i") },
      });

      if (!existingOffer || existingOffer._id == req.params.id) {
        let { productId, productOfferPercentage, startDate, endDate } =
          req.body;

        let updateFields = {
          productId,
          productName,
          productOfferPercentage,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        };

        await productOfferCollection.findOneAndUpdate(
          { _id: req.params.id },
          { $set: updateFields }
        );
        await applyProductOffer("editOffer");
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    } catch (error) {
      console.error(error);
    }
}
  

//category offer
  const categoryOffer = async (req, res) => {
    try {
      console.log(req.body);
      let productData = await productCollection.find();
      let productsUnderSelectedCategory = productData.filter(
        (v) => v.category == req.body.categoryName
      );

      productsUnderSelectedCategory.forEach(async (v) => {
        let existingOffer = await productOfferCollection.findOne({
          productName: v.productName,
        });

        if (!existingOffer) {
          //if offer for that particular product doesn't exist:
          let productData = await productCollection.findOne({
            productName: v.productName,
          });

          let {
            categoryOfferPercentage,
            categoryOfferStartDate,
            categoryOfferEndDate,
          } = req.body;
          await productOfferCollection.insertMany([
            {
              productId: productData._id,
              productName: v.productName,
              productOfferPercentage: categoryOfferPercentage,
              startDate: new Date(categoryOfferStartDate),
              endDate: new Date(categoryOfferEndDate),
            },
          ]);
          
        } else {
          let {
            categoryOfferPercentage,
            categoryOfferStartDate,
            categoryOfferEndDate,
          } = req.body;
console.log(req.body)
          let updateFields = {
            productId: v._id,
            productName: v.productName,
            productOfferPercentage: categoryOfferPercentage,
            startDate: new Date(categoryOfferStartDate),
            endDate: new Date(categoryOfferEndDate),
          };

          await productOfferCollection.findOneAndUpdate(
            { _id: req.params.id },
            { $set: updateFields }
          );
        }
        await applyProductOffer('categoryOffer');
      });
     
      res.json({ success: true });
    } catch (error) {
      console.error(error);
    }
  }




module.exports = {offerManagement,addOffer,editOffer,categoryOffer}