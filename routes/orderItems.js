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
    queries.getOrderItemsById(req.params.id, (data, error) => {
      if (error) {
        res.writeHead("404");
        res.write(JSON.stringify({ error: "Order not found" }));
        res.send();
      } else {
        res.json(data);
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
    let quantity = req.body.quantity;
    queries.addOrderItems(orderId, itemId, quantity, function (
      error,
      results,
      fields
    ) {
      if (error) {
        res.writeHead(500);
        if (error === 1) {
          res.write(JSON.stringify({ error: "Item or order not found" }));
        } else {
          res.write(JSON.stringify({ error: "Order already has that item" }));
        }
        res.send();
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
    queries.deleteOrderItemsById(orderId, itemId, function (
      error,
      results,
      fields
    ) {
      if (error) {
        res.writeHead(500);
        if (error === 1) {
          res.write(
            JSON.stringify({
              error: "Order or item not found",
            })
          );
        } else {
          res.write(
            JSON.stringify({
              error: "Order didn't have that item",
            })
          );
        }
      } else {
        res.writeHead(200);
        res.write(JSON.stringify({ success: "Order item deleted" }));
      }
      res.send();
    });
  }
);

module.exports = router;
