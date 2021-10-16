const express = require("express");
const router = express.Router();
const { getLogin, postLogin, postLogout, getSignUp, postSignUp, getReset, postReset, getNewPassword, postNewPassword } = require("../controllers/auth");

router.get("/login", getLogin);
router.post("/login", postLogin);
router.post("/logout", postLogout);
router.get("/signup", getSignUp);
router.post("/signup", postSignUp);
router.post("/reset", postReset);
router.get("/reset", getReset);
router.get("/reset/:token", getNewPassword);
router.post("/new-password", postNewPassword);

module.exports = router;
