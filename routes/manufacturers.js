const express = require("express");
const router = express.Router();
const authChecks = require("../authChecks.js");
const flash = require("express-flash");
const queries = require("../queries/manufacturersQueries.js");
const { ROLE } = require("../roles.js");
var htmlEncode = require("js-htmlencode").htmlEncode;

router.get("/manufacturers", authChecks.authRole(ROLE.KUPAC), (req, res) => {
  queries.getManufacturers((data) => res.json(data));
});

router.get(
  //TODO - add html render
  "/manufacturers/add",
  authChecks.checkAuthenticated,
  authChecks.authRole(ROLE.KUPAC),
  async (req, res) => {
    res.render("addUser.ejs");
  }
);

router.get(
  "/manufacturers/:id",
  authChecks.authRole(ROLE.KUPAC),
  (req, res) => {
    queries.getManufacturerById(req.params.id, (data) => {
      if (data == null) {
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
  authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    queries.deleteManufacturerById(req.params.id, (error, results, fields) => {
      if (error) {
        res.writeHead(500);
        res.write(JSON.stringify({ error: "Manufacturer not found" }));
      } else {
        res.writeHead(200);
        res.write(JSON.stringify({ success: "Manufacturer deleted" }));
      }
      res.send();
    });
  }
);

router.put(
  "/manufacturers/:id",
  authChecks.authRole(ROLE.ADMIN),
  async (req, res) => {
    let manufacturer = {};
    manufacturer.id = req.params.id;
    if (req.body.naziv) {
      manufacturer.naziv = htmlEncode(req.body.naziv);
    }

    queries.updateManufacturerById(manufacturer, (data) => {
      if (data == null) {
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

router.post(
  "/manufacturers",
  authChecks.authRole(ROLE.ADMIN),
  async (req, res) => {
    try {
      let manufacturer = {};
      manufacturer.id = req.params.id;
      if (req.body.naziv) {
        manufacturer.naziv = htmlEncode(req.body.naziv);
      }
      queries.addManufacturer(manufacturer, (data) => {
        if (data == null) {
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
  }
);

module.exports = router;
