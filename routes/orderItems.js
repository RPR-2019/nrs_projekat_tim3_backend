const express = require("express");
const router = express.Router();
const authChecks = require("../authChecks.js");
const flash = require("express-flash");
const connection = require("../database.js");
const queries = require("../queries/orderItemsQueries.js");
const { ROLE } = require("../roles.js");
var htmlEncode = require("js-htmlencode").htmlEncode;

router.get(
  "/orders/:id/items",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    queries.getOrderItemsById(req.params.id, (error, results) => {
      if (error) {
        res.json(error);
      } else {
        res.json(results);
      }
    });
  }
);

router.post(
  "/orders/:id/items/:itemId",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    let orderId = req.params.id;
    let itemId = req.params.itemId;
    let supplierId = req.body.supplierId;
    let quantity = req.body.quantity;
    queries.addOrderItems(orderId, itemId, quantity, supplierId, function (
      error,
      results,
      fields
    ) {
      if (error) {
        res.json(error);
      } else {
        res.json({ success: "Item added to order." });
      }
    });
  }
);

router.delete(
  "/orders/:id/items/:itemId",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    let orderId = req.params.id;
    let itemId = req.params.itemId;
    let supplierId = req.body.supplierId;
    queries.deleteOrderItemsById(orderId, itemId, supplierId, function (
      error,
      results,
      fields
    ) {
      if (error) {
        res.json(error);
      } else {
        res.json({ success: "Order item deleted" });
      }
    });
  }
);

module.exports = router;
