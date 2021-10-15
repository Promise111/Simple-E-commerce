const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const {
  getAddProduct,
  postAddProduct,
  getProducts,
  getEditProduct,
  postDeleteProduct,
  postEditProduct,
} = require("../controllers/admin");

router.get("/products", [authMiddleware], getProducts);

router.get("/edit-product/:productId", [authMiddleware], getEditProduct);

router.post("/edit-product", [authMiddleware], postEditProduct);

router.post("/delete-product", [authMiddleware], postDeleteProduct);

router.get("/add-product", [authMiddleware], getAddProduct);

router.post("/add-product", [authMiddleware], postAddProduct);

module.exports = router;
