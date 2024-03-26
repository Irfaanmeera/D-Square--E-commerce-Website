const categoryCollection = require("../models/categoryModel");
const productCollection = require("../models/productModel");
const cartCollection = require("../models/cartModel");
const wishlistCollection = require("../models/wishlistModel");

//shop page get controller
const shopPage = async (req, res) => {
  try {
    const categoryData = await categoryCollection.find({});
    const cartProduct = await cartCollection
      .find({ userId: req.session?.user?._id })
      .populate("productId");
    const count = await cartCollection.countDocuments({
      userId: req.session?.user?._id,
    });
    const wishlistData = await wishlistCollection.find({
      userId: req.session.user._id,
    });
    const wishlistCount = await wishlistCollection.countDocuments({
      userId: req.session.user._id,
    });
    const productsInOnePage = 6;
    const pageNo = parseInt(req.query.pageNo) || 1;
    const skip = (pageNo - 1) * productsInOnePage;
    const limit = productsInOnePage;

    console.log(pageNo);

    const productDataWithPagination = await productCollection
      .find({ is_listed: true })
      .skip(skip)
      .limit(limit);
    const productData =
      req.session?.shopProductData || productDataWithPagination;

    const totalProducts = await productCollection.countDocuments();
    const totalPages = Math.ceil(totalProducts / productsInOnePage);
    const totalPagesArray = new Array(totalPages).fill(null);

    const previousPage = Math.max(pageNo - 1, 1);
    const nextPage = Math.min(pageNo + 1, totalPages);

    res.render("user/shop", {
      user: req.session.user,
      categoryData,
      cartProduct,
      productData,
      count,
      totalProducts,
      totalPagesArray,
      currentPage: pageNo,
      previousPage,
      nextPage,
      wishlistData,
      wishlistCount,
      limit,
    });

    req.session.shopProductData = null;
  } catch (error) {
    console.log(error);
  }
};

//filter Category
const filterCategoryPage = async (req, res) => {
  try {
    const count = await cartCollection.countDocuments({
      userId: req.session.user._id,
    });
    const cartProduct = await cartCollection.find({
      userId: req.session?.user?._id,
    });
    const wishlistData = await wishlistCollection.find({
      userId: req.session?.user?._id,
    });
    const wishlistCount = await wishlistCollection.countDocuments({
      userId: req.session?.user?._id,
    });
    const categoryData = await categoryCollection.find({});
    const productData = await productCollection.find({
      is_listed: true,
      category: req.params.categoryName,
    });
    res.render("user/shop", {
      user: req.session.user,
      categoryData,
      cartProduct,
      wishlistData,
      wishlistCount,
      productData,
      count,
    });
  } catch (error) {
    console.log(error);
  }
};

//filter brand
const filterBrandPage = async (req, res) => {
  try {
    req.session.shopProductData = await productCollection.find({
      is_listed: true,
      brand: req.params.brand,
    });
    res.redirect("/shop");
  } catch (error) {
    console.log(error);
  }
};

//filter price
const filterPriceRange = async (req, res) => {
  try {
    const minPrice = parseInt(req.query.minPrice);
    const maxPrice = parseInt(req.query.maxPrice);
    console.log(minPrice);
    console.log(req.query.minPrice);

    req.session.shopProductData = await productCollection.find({
      is_listed: true,
      productPrice: { $gte: minPrice, $lte: maxPrice },
    });
    res.redirect("/shop");
    console.log(req.session.shopProductData);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

//sort price low to high
const sortPriceAscending = async (req, res) => {
  try {
    req.session.shopProductData = await productCollection
      .find({ is_listed: true })
      .sort({ productPrice: 1 });
    res.redirect("/shop");
  } catch (error) {
    console.log(error);
  }
};

//sort price high to low
const sortPriceDescending = async (req, res) => {
  try {
    req.session.shopProductData = await productCollection
      .find({ is_listed: true })
      .sort({ productPrice: -1 });
    res.redirect("/shop");
  } catch (error) {
    console.log(error);
  }
};

//search product
const searchProduct = async (req, res) => {
  try {
    const searchQuery = req.query.q;
    const productData = await productCollection.find({
      is_listed: true,
      $or: [
        { productName: { $regex: searchQuery, $options: "i" } },
        { category: { $regex: searchQuery, $options: "i" } },
        { brand: { $regex: searchQuery, $options: "i" } },
      ],
    });
    const count = await cartCollection.countDocuments({
      userId: req.session.user._id,
    });
    const cartProduct = await cartCollection.find({
      userId: req.session?.user?._id,
    });
    const wishlistData = await wishlistCollection.find({
      userId: req.session?.user?._id,
    });
    const wishlistCount = await wishlistCollection.countDocuments({
      userId: req.session?.user?._id,
    });
    const categoryData = await categoryCollection.find({});

    res.render("user/shop", {
      user: req.session.user,
      searchQuery,
      productData,
      categoryData,
      cartProduct,
      wishlistData,
      wishlistCount,
      count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  shopPage,
  filterCategoryPage,
  filterBrandPage,
  filterPriceRange,
  sortPriceAscending,
  sortPriceDescending,
  searchProduct,
};
