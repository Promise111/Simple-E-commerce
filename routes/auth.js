const express = require("express");
const router = express.Router();
const { getLogin, postLogin, postLogout, getSignUp, postSignUp } = require("../controllers/auth");

router.get("/login", getLogin);
router.post("/login", postLogin);
router.post("/logout", postLogout);
router.get("/signup", getSignUp);
router.post("/signup", postSignUp);

module.exports = router;
