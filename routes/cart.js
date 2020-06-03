const express = require('express');
const router = express.Router();
const authChecks = require('../authChecks.js');
const passport = require('passport');
const flash = require('express-flash');


router.get('/cart', (req, res) => {
    res.render('cart.ejs');
});


module.exports = router;