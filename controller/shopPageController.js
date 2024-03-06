const categoryCollection = require('../models/categoryModel')
const productCollection = require('../models/productModel')
const cartCollection = require('../models/cartModel')


//shop page get controller
const shopPage = async (req,res)=>{
    try{
   const categoryData = await categoryCollection.find({})

   const count = await cartCollection.countDocuments({
    userId: req.session?.user?._id,
  });

  let productsInOnePage = 9
      let pageNo = req.query.pageNo ||  1
      let skip= (pageNo-1) * productsInOnePage 
      let limit= productsInOnePage
      let productDataWithPagination= await productCollection.find({}).skip(skip).limit(limit)
      
      let productData =
        req.session?.shopProductData || productDataWithPagination;

    //   let totalPages=  Math.ceil(  await productCollection.countDocuments() / productsInOnePage )
    //   console.log(totalPages);
    //   let totalPagesArray = new Array(totalPages).fill(null)

   res.render('user/shop',{user:req.session.user,categoryData,productData,count})
   req.session.shopProductData = null;

    }catch(error){
        console.log(error)
    }
};

//filter Category
const filterCategoryPage = async (req,res)=>{
    try{
       req.session.shopProductData = await productCollection.find({category:req.params.categoryName})
       res.redirect('/shop')
    }catch(error){
        console.log(error)
    }
}

//filter brand
const filterBrandPage = async (req,res)=>{
    try{
       req.session.shopProductData = await productCollection.find({brand:req.params.brand})
       res.redirect('/shop')
    }catch(error){
        console.log(error)
    }
}


//filter price range
// const filterPriceRange = async (req, res) => {
//     try {
//          req.session.shopProductData = await productCollection.find({
//         price: {
//           $gt: 0 + 500 * req.query.priceRange,
//           $lte: 500 + 500 * req.query.priceRange,
//         },
//       });
        
//         console.log(req.session.shopProductData);
//         res.redirect('/shop');
//     } catch (error) {
//         console.log(error);
//         // Handle errors appropriately
//         res.status(500).send("Internal Server Error");
//     }
// };



// 
const filterPriceRange = async (req, res) => {
    try {
        const minPrice =parseInt(req.query.minPrice);
        const maxPrice = parseInt(req.query.maxPrice);
        console.log(minPrice); // Log the parsed minPrice for debugging
        console.log(req.query.minPrice)
        // Query the database to get filtered data based on the price range
        req.session.shopProductData = await productCollection.find({ 
            productPrice: { $gte: minPrice, $lte: maxPrice } 
        });

        // Render the Handlebars template with the filtered data
        res.redirect('/shop');
        console.log(req.session.shopProductData); // Log the filtered data for debugging
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}

const sortPriceAscending = async(req,res)=>{
    try{
         req.session.shopProductData = await productCollection.find().sort({productPrice:1})
         res.redirect('/shop')
    }catch(error){
        console.log(error)
    }
}

const sortPriceDescending = async(req,res)=>{
    try{
         req.session.shopProductData = await productCollection.find().sort({productPrice:-1})
         res.redirect('/shop')
    }catch(error){
        console.log(error)
    }
}

module.exports = {shopPage,filterCategoryPage,filterBrandPage,filterPriceRange,sortPriceAscending,sortPriceDescending};