const express = require("express");
const router = express.Router();
const authChecks = require("../authChecks.js");

router.get("/", (req, res) => {
  res.render("shop.ejs", { email: req.user.email });
});

module.exports = router;
