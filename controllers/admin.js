const Cart = require("../models/cart");
const mongoose = require("mongoose");
const Product = require("../models/product");
const { validationResult } = require("express-validator");
const { deleteFile } = require("../utils/functions");
const ITEMS_PER_PAGE = 2;

exports.getProducts = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const totalProduct = await Product.find({
      userId: req.session.user._id,
    }).count();
    const products = await Product.find({ userId: req.session.user._id })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    return res.status(200).render("./admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
      totalItems: totalProduct,
      hasPrevious: page > 1,
      hasNext: page < totalProduct / ITEMS_PER_PAGE,
      nextPage: page + 1,
      previous: page - 1,
      lastPage: Math.ceil(totalProduct / ITEMS_PER_PAGE),
      currentPage: page,
    });
  } catch (error) {
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getAddProduct = async (req, res, next) => {
  res.status(200).render("./admin/add-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    errorMessage: "",
    old: req.body,
    validationErrors: [],
  });
};

exports.postAddProduct = async (req, res, next) => {
  const image = req.file;
  const errors = validationResult(req);
  if (!image) {
    return res.status(422).render("./admin/add-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      old: req.body,
      errorMessage: "Image must be of type 'jpg', 'jpeg', or 'png'.",
      validationErrors: [],
    });
  }
  req.body.imageUrl = image.path;
  if (!errors.isEmpty()) {
    return res.status(422).render("./admin/add-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      old: req.body,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  req.body.userId = req.user;
  Product.create(req.body)
    .then((result) => {
      return res.status(200).redirect("/admin/products");
    })
    .catch((error) => {
      console.log(error);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = async (req, res, next) => {
  const productId = req.params.productId;
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  Product.findById(productId)
    .then((products) => {
      const product = products;
      if (!product) {
        return res.redirect("/admin/products");
      }
      return res.status(200).render("./admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        old: req.body,
        errorMessage: "",
        validationErrors: [],
        hasError: false,
      });
    })
    .catch((error) => {
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = async (req, res, next) => {
  req.body.imageUrl = req.file && req.file.path;
  const body = req.body;
  const productId = body.productId;
  const errors = validationResult(req);
  const editMode = req.query.edit;
  const image = req.file;

  if (!errors.isEmpty()) {
    return res.status(422).render("./admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      product: {
        title: req.body.title,
        price: req.body.price,
        description: req.body.description,
        _id: req.body.productId,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      old: req.body,
      hasError: true,
    });
  }
  Product.findById(productId)
    .then((product) => {
      if (product.userId.toString() !== req.session.user._id.toString()) {
        return res.redirect("/");
      }
      if (image && product.imageUrl) {
        deleteFile(product.imageUrl);
      }
      product.title = body.title;
      product.imageUrl = body.imageUrl ? body.imageUrl : product.imageUrl;
      product.price = body.price;
      product.description = body.description;
      product.userId = req.session.user;
      return product.save().then((result) => {
        console.log("UPDATED PRODUCT!");
        return res.redirect("/admin/products");
      });
    })
    .catch((error) => {
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (!product) return next(new Error("Product not found."));
    deleteFile(product.imageUrl);
    await Product.deleteOne({ _id: productId, userId: req.user.id });
    return res.status(200).json({ status: "Success" });
  } catch (error) {
    return res.status(500).json({ status: "Failure" });
  }

  // const productId = req.body.productId;
  // const product = await Product.findById(productId);
  // if (!product) return next(new Error("Product not found."));
  // deleteFile(product.imageUrl);
  // await Product.deleteOne({ _id: productId, userId: req.user.id });
  // try {
  //   return res.redirect("back");
  // } catch (error) {
  //   error.httpStatusCode = 500;
  //   return next(error);
  // }
};
