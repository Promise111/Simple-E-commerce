const express = require("express");
const { check, body } = require("express-validator");
const router = express.Router();
const User = require("../models/user");
const {
  getLogin,
  postLogin,
  postLogout,
  getSignUp,
  postSignUp,
  getReset,
  postReset,
  getNewPassword,
  postNewPassword,
} = require("../controllers/auth");

router.get("/login", getLogin);
router.post(
  "/login",
  check("email", "Enter valid e-mail.").isEmail().normalizeEmail(),
  body(
    "password",
    "Password must not be less than 6 characters and must contain texts and numbers."
  )
    .isLength({ min: 6 })
    .isAlphanumeric()
    .trim(),
  postLogin
);
router.post("/logout", postLogout);
router.get("/signup", getSignUp);
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please, enter a valid e-mail.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("E-mail already exists.");
          }
        });
      }).normalizeEmail(),
    body(
      "password",
      "Please, enter a password that is at least 6 characters long and contains only text and numbers."
    )
      .isLength({ min: 6 })
      .isAlphanumeric(["en-US"]).trim(),
    check("confirmPassword").trim().custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords have to match.");
      }
      return true;
    }),
  ],
  postSignUp
);
router.post("/reset", postReset);
router.get("/reset", getReset);
router.get("/reset/:token", getNewPassword);
router.post("/new-password", postNewPassword);

module.exports = router;
