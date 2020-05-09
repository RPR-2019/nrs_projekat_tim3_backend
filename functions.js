/*
var authenticationChecks = function () {
    function checkAuthenticatedImpl(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/login');
    }

    function checkNotAuthenticatedImpl(req, res, next) {
        if (req.isAuthenticated()) {
            return res.redirect('/');
        }
        next();
    }

    return {
        checkAuthenticated: checkAuthenticatedImpl,
        checkNotAuthenticated: checkNotAuthenticatedImpl
    }
}();*/

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
}

function checkNotAuthenticatedImpl(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
}

module.exports = checkNotAuthenticated;
module.exports = checkNotAuthenticatedImpl;