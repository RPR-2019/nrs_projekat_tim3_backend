const express = require("express");
const router = express.Router();
const authChecks = require("../authChecks.js");
const flash = require("express-flash");
const queries = require("../queries/supplierItemsQueries.js");
const suppliersQ = require("../queries/suppliersQueries.js");
const { ROLE } = require("../roles.js");
var htmlEncode = require("js-htmlencode").htmlEncode;

router.get(
  "/suppliers/:id/items",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    queries.getSupplierItemsById(req.params.id, (error, results, fields) => {
      if (error) {
        res.writeHead("404");
        res.write(JSON.stringify({ error: "Supplier not found" }));
        res.send();
      } else {
        res.json(results);
      }
    });
  }
);

router.post(
  "/suppliers/:id/items/:itemId",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    let supplierId = req.params.id;
    let itemId = req.params.itemId;
    queries.addSupplierItemsById(supplierId, itemId, function (
      error,
      results,
      fields
    ) {
      if (error) {
        res.writeHead(500);

        if (error === 1) {
          res.write(JSON.stringify({ error: "Item or supplier not found" }));
        } else {
          res.write(
            JSON.stringify({ error: "Supplier already has that item" })
          );
        }
        res.send();
      } else {
        res.json({ success: "Item added to supplier." });
      }
    });
  }
);

router.delete(
  "/suppliers/:id/items/:itemId",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    let supplierId = req.params.id;
    let itemId = req.params.itemId;
    queries.deleteSupplierItemsById(supplierId, itemId, function (
      error,
      results,
      fields
    ) {
      if (error) {
        res.writeHead(500);

        if (error === 1) {
          res.write(
            JSON.stringify({
              error: "Supplier or item not found",
            })
          );
        } else {
          res.write(
            JSON.stringify({
              error: "Supplier didn't have that item",
            })
          );
        }
      } else {
        res.writeHead(200);
        res.write(JSON.stringify({ success: "Supplier item deleted" }));
      }
      res.send();
    });
  }
);

module.exports = router;
