const express = require('express');
const router = express.Router();
const authChecks = require('../authChecks.js');
const passport = require('passport');
const flash = require('express-flash');


router.get('/shop', (req, res) => {
    res.render('shopLogin.ejs');
});


module.exports = router;