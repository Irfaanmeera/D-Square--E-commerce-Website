const productCollection = require('../models/productModel')
const categoryCollection = require('../models/categoryModel')
const path  = require("node:path");
const sharpImage= require('../services/sharp')





//get product controller

const loadProduct = async(req,res)=>{
    try{
      if(req.session.admin){
      const productData = await productCollection.find({});
      
      const categoryData= await categoryCollection.find({},{categoryName: true });
        res.render('admin/product',{productData,categoryData})
      }else{
        res.redirect('/admin/login')
      }
    }catch(error){
        console.log(error)
    }
}

//load add product page
const addProductLoad = async(req,res)=>{
  try{
    if(req.session.admin){
      let categoryData= await categoryCollection.find({},{ categoryName: true }).lean();
      res.render('admin/addProduct',{categoryData})
    }else{
      res.redirect('/admin/login')
    }

  }catch(error){
    console.log(error)
  }
}


//add product post controller
const addProduct = async(req,res)=>{
    try{
      if(req.session.admin){
      const { productName, productPrice, category, brand, productStock,productDescription } = req.body;
      //  await sharpImage.cropImage(req.files)
     
 
    const product = new productCollection({
      productName,
      productPrice,
      productDescription,
      category,
      brand,
      productStock,
      productImage1: req.files[0].filename,
      productImage2: req.files[1].filename,
      productImage3: req.files[2].filename,
      productImage4: req.files[3].filename,
     
    });
     const productData = await product.save();
     console.log(productData);
 
    res.redirect('/admin/product');

}
}catch(error){
    console.log(error.message)
}
}

//edit product
const editProduct = async(req,res)=>{
  try{
     if(req.session.admin){
   
       const product= await productCollection.findOne({_id:req.query.id}).lean()
       let categoryData= await categoryCollection.find({},{ categoryName: true }).lean();
       res.render('admin/editProduct',{product,categoryData})
     }else{
      res.redirect('/admin/login')
     }
  }catch(error){
    console.log(error)
  }
}


//edit product post controller
const editProductPost = async (req, res) => {
  try {
    if(req.session.admin){
    const updateFields = {
      $set: {
        productName: req.body.productName,
        productPrice: req.body.productPrice,
        productDescription:req.body.productDescription,
        category:req.body.category,
        brand: req.body.brand,
        productStock: req.body.productStock,
      },
    };

    // Check and add image to the query
    if (req.files[0]) {
      updateFields.$set.productImage1 = req.files[0].filename;
    }
    
    if (req.files[1]) {
      updateFields.$set.productImage2 = req.files[1].filename;
    }
    
    if (req.files[2]) {
      updateFields.$set.productImage3 = req.files[2].filename;
    }
    if (req.files[3]) {
      updateFields.$set.productImage3 = req.files[3].filename;
    }
    if (req.files[4]) {
      updateFields.$set.productImage3 = req.files[4].filename;
    }
    const updatedProduct = await productCollection.findByIdAndUpdate(
      req.query.id,
      updateFields,
      { new: true } 
    ).lean();

    console.log(updatedProduct);

    res.redirect("/admin/product");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

//delete product

const deleteProduct = async(req,res)=>{
  try{
    if(req.session.admin){
    const deletedProduct = await productCollection.findByIdAndDelete({_id:req.query.id})
    res.redirect('/admin/product')
    
    console.log(deletedProduct)
    }
  }catch(error){
    console.log(error)
  }
}






module.exports = {loadProduct,addProductLoad,addProduct,editProduct,editProductPost,deleteProduct};