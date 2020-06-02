const express = require("express");
const router = express.Router();
const authChecks = require("../authChecks.js");
const flash = require("express-flash");
const queries = require("../queries/warehousesQueries.js");
const { ROLE } = require("../roles.js");
var htmlEncode = require("js-htmlencode").htmlEncode;

router.get("/warehouses", (req, res) => {
  queries.getWarehouses((data) => res.json(data));
});

router.get(
  //TODO - add html render
  "/warehouses/add",
  authChecks.checkAuthenticated,
  authChecks.authRole(ROLE.ADMIN),
  async (req, res) => {
    res.render("addUser.ejs");
  }
);

router.get(
  "/warehouses/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    queries.getWarehouseById(req.params.id, (data) => {
      if (data == null) {
        res.writeHead("404");
        res.write(JSON.stringify({ error: "Warehouse not found" }));
      } else {
        res.writeHead("200");
        res.write(JSON.stringify(data));
      }
      res.send();
    });
  }
);

router.delete(
  "/warehouses/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    queries.deleteWarehouseById(req.params.id, (error, results, fields) => {
      if (error) {
        res.writeHead(500);
        res.write(
          JSON.stringify({ error: "Warehouse not found or has dependency" })
        );
      } else {
        res.writeHead(200);
        res.write(JSON.stringify({ success: "Warehouse deleted" }));
      }
      res.send();
    });
  }
);

router.put(
  "/warehouses/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  async (req, res) => {
    let warehouse = {};
    warehouse.id = req.params.id;
    if (req.body.naziv !== undefined) {
      warehouse.naziv = htmlEncode(req.body.naziv);
    }
    if (req.body.naziv_lokacije !== undefined) {
      req.body.naziv_lokacije !== null
        ? (warehouse.naziv_lokacije = htmlEncode(req.body.naziv_lokacije))
        : (warehouse.naziv_lokacije = req.body.naziv_lokacije);
    }
    queries.updateWarehouseById(warehouse, (data, error) => {
      if (error) {
        res.writeHead("404");
        res.write(JSON.stringify({ error: "Error" }));
      } else if (data == null) {
        res.writeHead("404");
        res.write(JSON.stringify({ error: "Warehouse not found" }));
      } else {
        res.writeHead("200");
        res.write(JSON.stringify(data));
      }
      res.send();
    });
  }
);

router.post("/warehouses", async (req, res) => {
  try {
    let warehouse = {};
    if (req.body.naziv !== undefined) {
      warehouse.naziv = htmlEncode(req.body.naziv);
    }
    if (req.body.naziv_lokacije !== undefined) {
      req.body.naziv_lokacije !== null
        ? (warehouse.naziv_lokacije = htmlEncode(req.body.naziv_lokacije))
        : (warehouse.naziv_lokacije = req.body.naziv_lokacije);
    }
    queries.addWarehouse(warehouse, function (error, results, fields) {
      if (error) {
        console.log(error);
        res.writeHead(500);
        res.write(JSON.stringify({ error: "Error" }));
        res.send();
      } else {
        queries.getWarehouseById(results.insertId, (data) => {
          if (data == null) {
            res.writeHead("404");
            res.write(JSON.stringify({ error: "Warehouse not found" }));
          } else {
            res.writeHead("200");
            res.write(JSON.stringify(data));
          }
          res.send();
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

router.all(
  ["/warehouses/:id/items", "/warehouses/:id/items*"],
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  require("./warehouseItems")
);

module.exports = router;
