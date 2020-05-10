var authChecks = function () {
    var checkAuthenticatedImpl = function (req, res, next) {
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

    function authRoleImpl(role, req, res, next) {
        return (req, res, next) => {
            console.log("pravoPristupa: " + req.user.pravo_pristupa);
            console.log("role: " + role);
            if (req.user.pravo_pristupa > role) {
                res.status(401)
                return res.send('Only admins can access this!!!')
            }

            next()
        }
    }

    return {
        checkAuthenticated: checkAuthenticatedImpl,
        checkNotAuthenticated: checkNotAuthenticatedImpl,
        authRole: authRoleImpl
    }
}();

module.exports = authChecks;