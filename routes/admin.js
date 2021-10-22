const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const { check, body } = require("express-validator");
const {
  getAddProduct,
  postAddProduct,
  getProducts,
  getEditProduct,
  deleteProduct,
  postEditProduct,
} = require("../controllers/admin");

router.get("/products", [authMiddleware], getProducts);

router.get("/add-product", [authMiddleware], getAddProduct);

router.post(
  "/add-product",
  [
    authMiddleware,
    body("title", "Title can not be less than 3 or greater than 15 characters.")
      .trim()
      .isLength({ min: 3, max: 15 }),
    body("price", "Price must be a number or a double.").trim().isNumeric(),
    body(
      "description",
      "Description can not be less than 5 or greater than 200 characters."
    )
      .trim()
      .isLength({ min: 5, max: 200 }),
  ],
  postAddProduct
);

router.get("/edit-product/:productId", [authMiddleware], getEditProduct);

router.post(
  "/edit-product",
  [
    authMiddleware,
    body("title", "Title can not be less than 3 or greater than 15 characters.")
      .trim()
      .isLength({ min: 3, max: 15 }),
    body("price", "Price must be a number or a double.").trim().isNumeric(),
    body(
      "description",
      "Description can not be less than 5 or greater than 200 characters."
    )
      .trim()
      .isLength({ min: 5, max: 200 }),
  ],
  postEditProduct
);

// router.post("/delete-product", [authMiddleware], postDeleteProduct);
router.delete("/deleteProduct/:productId", [authMiddleware], deleteProduct);

module.exports = router;
