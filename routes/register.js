const express = require('express');
const router = express.Router();
const authChecks = require('../authChecks.js');
const passport = require('passport');
const flash = require('express-flash');

router.get('/register', authChecks.checkNotAuthenticated, (req, res) => {
    res.render('register.ejs');
});

router.post('/register', authChecks.checkNotAuthenticated, passport.authenticate('local-register', {
    successRedirect: '/login',
    failureRedirect: '/register',
    failureFlash: true
}));

module.exports = router;