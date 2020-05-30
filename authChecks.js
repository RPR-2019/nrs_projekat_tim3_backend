require("dotenv").config();

var authChecks = (function () {
  var checkAuthenticatedImpl = function (req, res, next) {
    if (req.isAuthenticated() || req.body.apy_key === process.env.API_KEY) {
      return next();
    }
    res.redirect("/login");
  };

  function checkNotAuthenticatedImpl(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/");
    }
    next();
  }

  function authRoleImpl(role, req, res, next) {
    return (req, res, next) => {
      let user = req.user;
      if (
        (user && user.pravo_pristupa > role) ||
        req.body.apy_key !== process.env.API_KEY
      ) {
        res.status(401);
        return res.send("Only admins can access this!!!");
      }

      next();
    };
  }

  return {
    checkAuthenticated: checkAuthenticatedImpl,
    checkNotAuthenticated: checkNotAuthenticatedImpl,
    authRole: authRoleImpl,
  };
})();

module.exports = authChecks;
