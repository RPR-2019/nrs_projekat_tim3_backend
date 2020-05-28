const express = require("express");
const router = express.Router();
const authChecks = require("../authChecks.js");
const flash = require("express-flash");
const connection = require("../database.js");
const queries = require("../queries/manufacturersQueries.js");
const { ROLE } = require("../roles.js");
var htmlEncode = require("js-htmlencode").htmlEncode;

router.get("/manufacturers", (req, res) => {
  queries.getManufacturers(connection, (data) => res.json(data));
});

router.get(
  //TODO - add html render
  "/manufacturers/add",
  authChecks.checkAuthenticated,
  authChecks.authRole(ROLE.ADMIN),
  async (req, res) => {
    res.render("addUser.ejs");
  }
);

router.get(
  "/manufacturers/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    queries.getManufacturerById(connection, req.params.id, (temp, data) => {
      if (data == undefined || data == null) {
        res.writeHead("404");
        res.write(JSON.stringify({ error: "Manufacturer not found" }));
      } else {
        res.writeHead("200");
        res.write(JSON.stringify(data));
      }
      res.send();
    });
  }
);

router.delete(
  "/manufacturers/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    queries.deleteManufacturerById(
      connection,
      req.params.id,
      (error, results, fields) => {
        if (error) {
          res.writeHead(500);
          res.write(JSON.stringify({ error: "Manufacturer not found" }));
        } else {
          res.writeHead(200);
          res.write(JSON.stringify({ success: "Manufacturer deleted" }));
        }
        res.send();
      }
    );
  }
);

router.put(
  "/manufacturers/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  async (req, res) => {
    let manufacturer = {};
    manufacturer.id = req.params.id;
    if (req.body.naziv) {
      manufacturer.naziv = htmlEncode(req.body.naziv);
    }

    queries.updateManufacturerById(connection, manufacturer, (data) => {
      if (data == undefined || data == null) {
        res.writeHead("404");
        res.write(JSON.stringify({ error: "Manufacturer not found" }));
      } else {
        res.writeHead("200");
        res.write(JSON.stringify(data));
      }
      res.send();
    });
  }
);

router.post("/manufacturers/add", async (req, res) => {
  try {
    let manufacturer = {};
    manufacturer.id = req.params.id;
    if (req.body.naziv) {
      manufacturer.naziv = htmlEncode(req.body.naziv);
    }
    queries.addManufacturer(connection, manufacturer, (data) => {
      if (data == undefined || data == null) {
        res.writeHead("404");
        res.write(JSON.stringify({ error: "Not found" }));
      } else {
        res.writeHead("200");
        res.write(JSON.stringify(data));
      }
      res.send();
    });
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

module.exports = router;
