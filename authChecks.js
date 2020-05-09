var authChecks = function () {
    var checkAuthenticatedImpl = function (req, res, next) {
        if (req.isAuthenticated()) {
            console.log("redirecting to login1");
            return next();
        }
        console.log("redirecting to login");
        res.redirect('/login');
    }

    function checkNotAuthenticatedImpl(req, res, next) {
        if (req.isAuthenticated()) {
            console.log("redirecting to homepage");
            return res.redirect('/');
        }
        console.log("redirecting to login2");
        next();
    }

    return {
        checkAuthenticated: checkAuthenticatedImpl,
        checkNotAuthenticated: checkNotAuthenticatedImpl
    }
}();

module.exports = authChecks;