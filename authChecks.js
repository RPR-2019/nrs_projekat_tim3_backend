require("dotenv").config();
const queries = require("./queries/purchasesQueries.js");

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
        user &&
        user.pravo_pristupa > role &&
        req.body.apy_key !== process.env.API_KEY
      ) {
        res.status(401);
        return res.send("Only admins can access this!!!");
      }

      next();
    };
  }

  function checkPurchaseImpl(req, res, next) {
    if (!req.user || !req.user.id) {
      res.json({ error: "Not allowed" });
    } else if (req.body.apy_key === process.env.API_KEY) {
      next();
    } else {
      queries.getPurchaseById(req.params.id, (error, results) => {
        if (results[0].korisnicki_racun != req.user.id) {
          res.json({ error: "Not allowed" });
        } else {
          next();
        }
      });
    }
  }

  return {
    checkAuthenticated: checkAuthenticatedImpl,
    checkNotAuthenticated: checkNotAuthenticatedImpl,
    authRole: authRoleImpl,
    checkPurchase: checkPurchaseImpl,
  };
})();

module.exports = authChecks;
