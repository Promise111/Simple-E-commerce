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
  getInvoice,
  getCheckout,
} = require("../controllers/shop");

router.get(["/index", "/"], getIndex);

router.get("/products", getProducts);

router.get("/products/:productId", getProduct);

router.get("/cart", [authMiddleware], getCart);

router.post("/cart", [authMiddleware], postCart);

router.post("/cart-delete-item", [authMiddleware], postCartDeleteProduct);

router.get("/create-order/:reference", [authMiddleware], postOrder);

router.get("/orders/:orderId", [authMiddleware], getInvoice);

router.get("/orders", [authMiddleware], getOrders);

router.get("/checkout", [authMiddleware], getCheckout);

module.exports = router;
