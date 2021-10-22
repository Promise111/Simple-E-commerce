const Product = require("../models/product");
const Order = require("../models/order");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const axios = require("axios");
const ITEMS_PER_PAGE = 2;

exports.getProducts = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const totalProduct = await Product.find().count();
    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    return res.status(200).render("./shop/index", {
      prods: products,
      pageTitle: "All Products",
      path: "/products",
      totalItems: totalProduct,
      hasPrevious: page > 1,
      hasNext: page < totalProduct / ITEMS_PER_PAGE,
      nextPage: page + 1,
      previous: page - 1,
      lastPage: Math.ceil(totalProduct / ITEMS_PER_PAGE),
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

exports.getIndex = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const totalProduct = await Product.find().count();
    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    return res.status(200).render("./shop/product-list", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
      totalItems: totalProduct,
      hasPrevious: page > 1,
      hasNext: page < totalProduct / ITEMS_PER_PAGE,
      nextPage: page + 1,
      previous: page - 1,
      lastPage: Math.ceil(totalProduct / ITEMS_PER_PAGE),
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCart = async (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;
      res.status(200).render("./shop/cart", {
        pageTitle: "Your Cart",
        path: "/cart",
        products: products,
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.postCart = async (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.getCheckout = async (req, res, next) => {
  res.status(200).render("./shop/checkout", {
    pageTitle: "Checkout",
    path: "/checkout",
  });
};

exports.postCartDeleteProduct = async (req, res, next) => {
  const productId = req.body.cartProductId;
  req.user
    .removeFromCart(productId)
    .then((result) => {
      res.redirect("back");
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.getProduct = async (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .then((product) => {
      res.status(200).render("./shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.getCheckout = async (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;
      let total = 0;
      products.forEach((product) => {
        total += product.quantity * product.productId.price;
      });
      res.render("shop/checkout", {
        pageTitle: "Checkout",
        path: "/checkout",
        products: products,
        totalSum: total,
        user: req.user,
      });
    })
    .catch((error) => {
      return next(error);
    });
};

exports.postOrder = async (req, res, next) => {
  try {
    const reference = req.params.reference;
    const url = `https://api.paystack.co/transaction/verify/${reference}`;
    const token = "sk_test_d09f7b7c4f9ac64ec80afbcc122cd5b21f22b0e6";
    const isPaymentValid = await axios({
      method: "get",
      url: url,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(reference, isPaymentValid.data);
  } catch (error) {
    console.log(error.message);
  }
  // req.user
  //   .populate("cart.items.productId")
  //   .then((user) => {
  //     const products = user.cart.items.map((item) => {
  //       return { quantity: item.quantity, product: { ...item.productId._doc } };
  //     });
  //     const order = new Order({
  //       user: {
  //         email: req.user.email,
  //         userId: req.user,
  //       },
  //       products: products,
  //     });
  //     return order.save();
  //   })
  //   .then((result) => {
  //     return req.user.clearCart();
  //   })
  //   .then((result) => {
  //     return res.redirect("/orders");
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
};

exports.getOrders = async (req, res, next) => {
  req.user
    .getOrders()
    .then((orders) => {
      return res.status(200).render("./shop/orders", {
        pageTitle: "Your Orders",
        path: "/orders",
        orders: orders,
      });
    })
    .catch((err) => console.log(err));
};

exports.getInvoice = async (req, res, next) => {
  const orderId = req.params.orderId;
  if (!mongoose.Types.ObjectId.isValid(orderId))
    return next(new Error("Invalid ObjectId."));
  const order = await Order.findById(orderId);
  if (!order) return next(new Error("No order found."));
  if (String(order.user.userId) !== String(req.user._id)) {
    const error = new Error("Authorization required.");
    error.httpStatusCode = 401;
    return next(error);
  }
  const invoiceName = "invoice-" + orderId + ".pdf";
  const invoicePath = path.join("data", "invoices", invoiceName);

  const doc = new PDFDocument();
  let totalPrice = 0;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("content-disposition", "inline; filename =" + invoiceName);
  doc.pipe(fs.createWriteStream(invoicePath));
  doc.pipe(res);
  doc.fontSize(25).text("Invoice", { align: "center" });
  doc.text("-------------------------------", { align: "center" });
  order.products.map((product) => {
    totalPrice += product.quantity * product.product.price;
    doc.fontSize(14).text(
      product.product.title +
        " - " +
        product.quantity +
        " x " +
        // "₦ $" +
        " $" +
        product.product.price,
      { align: "center" }
    );
  });
  doc.text("-------------------------------", { align: "center" });
  doc.fontSize(20).text("Total price = $" + totalPrice, { align: "center" });
  doc.end();

  // fs.readFile(path.join(module.path, "..", invoicePath), (error, data) => {
  //   if (error) return next(error);
  //   res.setHeader("Content-Type", "application/pdf");
  //   res.setHeader("Content-Disposition", "inline; filename =" + invoiceName);
  //   res.send(data);
  // });

  // const readStream = fs.createReadStream(invoicePath);
  // res.setHeader("Content-Type", "application/pdf");
  // res.setHeader("content-disposition", "inline; filename =" + invoiceName);
  // readStream.pipe(res);
};
