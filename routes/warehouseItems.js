const express = require("express");
const router = express.Router();
const authChecks = require("../authChecks.js");
const flash = require("express-flash");
const connection = require("../database.js");
const queries = require("../queries/warehouseItemsQueries.js");
const warehousesQ = require("../queries/warehousesQueries.js");
const { ROLE } = require("../roles.js");
var htmlEncode = require("js-htmlencode").htmlEncode;

router.get(
  "/warehouses/:id/items",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    queries.getWarehouseItemsById(req.params.id, (data, error) => {
      if (error) {
        res.writeHead("404");
        res.write(JSON.stringify({ error: "Warehouse not found" }));
        res.send();
      } else {
        res.json(data);
      }
    });
  }
);

router.post(
  "/warehouses/:id/items/:itemId",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    let warehouseId = req.params.id;
    let itemId = req.params.itemId;
    let quantity = req.body.quantity;
    queries.addWarehouseItemsById(warehouseId, itemId, quantity, function (
      error,
      results,
      fields
    ) {
      if (error) {
        res.writeHead(500);
        if (error === 1) {
          res.write(JSON.stringify({ error: "Item or warehouse not found" }));
        } else {
          res.write(
            JSON.stringify({ error: "Warehouse already has that item" })
          );
        }
        res.send();
      } else {
        res.json({ success: "Item added to warehouse." });
      }
    });
  }
);

router.delete(
  "/warehouses/:id/items/:itemId",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    let warehouseId = req.params.id;
    let itemId = req.params.itemId;
    queries.deleteWarehouseItemsById(warehouseId, itemId, function (
      error,
      results,
      fields
    ) {
      if (error) {
        res.writeHead(500);
        if (error === 1) {
          res.write(
            JSON.stringify({
              error: "Warehouse or item not found",
            })
          );
        } else {
          res.write(
            JSON.stringify({
              error: "Warehouse didn't have that item",
            })
          );
        }
      } else {
        res.writeHead(200);
        res.write(JSON.stringify({ success: "Warehouse item deleted" }));
      }
      res.send();
    });
  }
);

module.exports = router;
