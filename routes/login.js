const express = require('express');
const router = express.Router();
const authChecks = require('../authChecks.js');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');


router.get('/login', (req, res) => {
    res.render('login.ejs');
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

router.delete('/logout', (req, res) => {
    req.logOut();
    res.redirect('/login')
});

module.exports = router;