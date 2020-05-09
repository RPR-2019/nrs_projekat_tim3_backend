const express = require('express');
const router = express.Router();
const authChecks = require('../authChecks.js');

router.get('/', authChecks.checkAuthenticated, (req, res) => {
    console.log("get /");
    res.render('index.ejs', { name: req.user.name });
});

module.exports = router;
