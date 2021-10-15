const Cart = require("../models/cart");
const Product = require("../models/product");

exports.getEditProduct = async (req, res) => {
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
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.postEditProduct = async (req, res) => {
  const productId = req.body.productId;
  req.body.userId = req.session.user;
  Product.findByIdAndUpdate(productId, req.body)
    .then((result) => {
      console.log("UPDATED PRODUCT!");
      return res.redirect("/admin/products");
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.postDeleteProduct = async (req, res) => {
  const productId = req.body.productId;
  await Product.findByIdAndDelete(productId);
  try {
    return res.redirect("back");
  } catch (error) {
    throw error;
  }
};

exports.getAddProduct = async (req, res) => {
  res.status(200).render("./admin/add-product", {
    pageTitle: "Add Product",
    path: "/admin/edit-product",
  });
};

exports.postAddProduct = async (req, res) => {
  req.body.userId = req.user;
  Product.create(req.body)
    .then((result) => {
      return res.status(200).redirect("/admin/products");
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).render("./admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
    });
  } catch (error) {
    throw error;
  }
};
