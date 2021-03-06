const express = require("express");
const router = express.Router();
const authChecks = require("../authChecks.js");
const passport = require("passport");
const flash = require("express-flash");

router.get("/index", (req, res) => {
  res.render("index.ejs");
});

module.exports = router;
