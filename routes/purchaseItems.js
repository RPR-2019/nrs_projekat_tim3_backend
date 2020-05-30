const express = require("express");
const router = express.Router();
const authChecks = require("../authChecks.js");
const flash = require("express-flash");
const connection = require("../database.js");
const queries = require("../queries/purchaseItemsQueries.js");
const { ROLE } = require("../roles.js");
var htmlEncode = require("js-htmlencode").htmlEncode;

router.get(
  "/purchases/:id/items",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    queries.getPurchaseItemsById(req.params.id, (error, results) => {
      if (error) {
        res.json(error);
      } else {
        res.json(results);
      }
    });
  }
);

router.post(
  "/purchases/:id/items/:itemId",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    let purchaseId = req.params.id;
    let itemId = req.params.itemId;
    let supplierId = req.body.supplierId;
    let quantity = req.body.quantity;
    if (!quantity || !supplierId || !itemId || !purchaseId) {
      res.json({ error: "Invalid params." });
      return;
    }
    quantity = htmlEncode(quantity);
    queries.addPurchaseItems(
      purchaseId,
      itemId,
      quantity,
      supplierId,
      function (error, results, fields) {
        if (error) {
          if (error.error) {
            res.json(error);
          } else {
            res.json({
              error: "Purchase already has that item from that supplier.",
            });
          }
        } else {
          res.json({ success: "Item added to purchase." });
        }
      }
    );
  }
);

router.delete(
  "/purchases/:id/items/:itemId",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    let purchaseId = req.params.id;
    let itemId = req.params.itemId;
    let supplierId = req.body.supplierId;
    if (!supplierId || !itemId || !purchaseId) {
      res.json({ error: "Invalid params." });
      return;
    }
    queries.deletePurchaseItemsById(purchaseId, itemId, supplierId, function (
      error,
      results,
      fields
    ) {
      if (error) {
        res.json(error);
      } else {
        res.json({ success: "Purchase item deleted" });
      }
    });
  }
);

router.delete(
  "/purchases/:id/items",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    let purchaseId = req.params.id;
    if (!purchaseId) {
      res.json({ error: "Invalid params." });
      return;
    }
    queries.deleteAllPurchaseItemsById(purchaseId, function (
      error,
      results,
      fields
    ) {
      if (error) {
        res.json(error);
      } else {
        res.json({ success: "Purchase items deleted" });
      }
    });
  }
);

router.put(
  "/purchases/:id/items/:itemId",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    let purchaseId = req.params.id;
    let itemId = req.params.itemId;
    let supplierId = req.body.supplierId;
    let quantity = req.body.quantity;
    if (!quantity || !supplierId || !itemId || !purchaseId) {
      res.json({ error: "Invalid params." });
      return;
    }
    quantity = htmlEncode(quantity);
    queries.updatePurchaseItemsById(
      purchaseId,
      itemId,
      quantity,
      supplierId,
      function (error, results, fields) {
        if (error) {
          res.json(error);
        } else {
          res.json({ success: "Purchase item updated." });
        }
      }
    );
  }
);

module.exports = router;
