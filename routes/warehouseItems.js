const express = require("express");
const router = express.Router();
const authChecks = require("../authChecks.js");
const flash = require("express-flash");
const connection = require("../database.js");
const queries = require("../queries/warehouseItemsQueries.js");
const { ROLE } = require("../roles.js");
var htmlEncode = require("js-htmlencode").htmlEncode;

router.get(
  "/warehouses/:id/items",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    queries.getWarehouseItemsById(connection, req.params.id, (data, error) => {
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
  "/warehouses/:id/items",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    let warehoseId = req.params.id;
    let itemId = req.body.itemId;
    let quantity = req.body.quantity;
    queries.addWarehouseItemsById(
      connection,
      warehoseId,
      itemId,
      quantity,
      function (error, results, fields) {
        if (error) {
          console.log(error);
          res.writeHead(500);
          res.write(JSON.stringify({ error: "Item or warehouse not found" }));
          res.send();
        } else {
          queries.getWarehouseById(connection, results.insertId, (data) => {
            if (data == undefined || data == null) {
              res.writeHead("404");
              res.write(JSON.stringify({ error: "Warehouse not found" }));
            } else {
              res.writeHead("200");
              res.write(JSON.stringify(data));
            }
            res.send();
          });
        }
      }
    );
  }
);

module.exports = router;