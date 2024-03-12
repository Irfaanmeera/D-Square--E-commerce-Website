const productCollection = require("../models/productModel");
const categoryCollection = require("../models/categoryModel");
const path = require("node:path");
const sharpImage = require("../services/sharp");

//get product controller

const loadProduct = async (req, res) => {
  try {
    if (req.session.admin) {
      const productData = await productCollection.find({});

      const categoryData = await categoryCollection.find(
        {},
        { categoryName: true }
      );
      res.render("admin/product", { productData, categoryData });
    } else {
      res.redirect("/admin/login");
    }
  } catch (error) {
    console.log(error);
  }
};

//load add product page
const addProductLoad = async (req, res) => {
  try {
    if (req.session.admin) {
      let categoryData = await categoryCollection
        .find({}, { categoryName: true })
        .lean();
      res.render("admin/addProduct", { categoryData });
    } else {
      res.redirect("/admin/login");
    }
  } catch (error) {
    console.log(error);
  }
};

//add product post controller
const addProduct = async (req, res) => {
  try {
    if (req.session.admin) {
      const {
        productName,
        productPrice,
        category,
        brand,
        productStock,
        productDescription,
      } = req.body;
      //  await sharpImage.cropImage(path.join(__dirname,'../public/images/sharp',req.files[0].filename))

  
      if (!req.files || req.files.length < 4) {
        return res
          .status(400)
          .send("Please upload all required product images.");
      }

      // Validate each image
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];

      
        if (
          !["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
            file.mimetype
          )
        ) {
          return res
            .status(400)
            .send(
              "Invalid file type. Only JPEG, PNG, and GIF files are allowed."
            );
        }

        // Validate file size
        if (file.size > 5 * 1024 * 1024) {
          // 5MB
          return res
            .status(400)
            .send("File is too large. Maximum size allowed is 5MB.");
        }
      }
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

      res.redirect("/admin/product");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//edit product
const editProduct = async (req, res) => {
  try {
    if (req.session.admin) {
      const product = await productCollection
        .findOne({ _id: req.query.id })
        .lean();
      let categoryData = await categoryCollection
        .find({}, { categoryName: true })
        .lean();
      res.render("admin/editProduct", { product, categoryData });
    } else {
      res.redirect("/admin/login");
    }
  } catch (error) {
    console.log(error);
  }
};

//edit product post controller
const editProductPost = async (req, res) => {
  try {
    if (req.session.admin) {
      const updateFields = {
        $set: {
          productName: req.body.productName,
          productPrice: req.body.productPrice,
          productDescription: req.body.productDescription,
          category: req.body.category,
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
      const updatedProduct = await productCollection
        .findByIdAndUpdate(req.query.id, updateFields, { new: true })
        .lean();

      console.log(updatedProduct);

      res.redirect("/admin/product");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

//delete product

const deleteProduct = async (req, res) => {
  try {
    if (req.session.admin) {
      const deletedProduct = await productCollection.findByIdAndDelete({
        _id: req.query.id,
      });
      res.redirect("/admin/product");

      console.log(deletedProduct);
    }
  } catch (error) {
    console.log(error);
  }
};

const unlistProduct = async (req, res) => {
  try {
    await productCollection.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { is_listed: false } }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
  }
};

const listProduct = async (req, res) => {
  try {
    await productCollection.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { is_listed: true } }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  loadProduct,
  addProductLoad,
  addProduct,
  editProduct,
  editProductPost,
  deleteProduct,
  listProduct,
  unlistProduct,
};
