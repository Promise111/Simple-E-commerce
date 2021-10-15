const express = require("express");
const router = express.Router();
const { get404 } = require("../controllers/error");

router.use("", get404);

module.exports = router;
