const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const {
  getProducts,
  getIndex,
  getProduct,
  postCart,
  getCart,
  postCartDeleteProduct,
  postOrder,
  getOrders,
} = require("../controllers/shop");

router.get("/cart", [authMiddleware], getCart);

router.post("/cart", [authMiddleware], postCart);

router.get("/orders", [authMiddleware], getOrders);

// router.get("/checkout", getCheckout);

router.get("/products", getProducts);

router.get(["/index", "/"], getIndex);

router.post("/cart-delete-item", [authMiddleware], postCartDeleteProduct);

router.get("/products/:productId", getProduct);

router.post("/create-order", [authMiddleware], postOrder);

module.exports = router;
