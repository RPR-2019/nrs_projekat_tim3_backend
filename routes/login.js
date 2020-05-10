const express = require('express');
const router = express.Router();
const authChecks = require('../authChecks.js');
const passport = require('passport');
const flash = require('express-flash');


router.get('/login', authChecks.checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');
});

router.post('/login', authChecks.checkNotAuthenticated, passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

router.delete('/logout', authChecks.checkAuthenticated, (req, res) => {
    req.logOut();
    res.redirect('/login');
});

module.exports = router;