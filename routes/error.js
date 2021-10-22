const express = require("express");
const router = express.Router();
const { get404, get500 } = require("../controllers/error");

router.get("/500", get500);
router.use("", get404);

module.exports = router;
