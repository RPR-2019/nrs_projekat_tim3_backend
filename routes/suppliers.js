const express = require("express");
const router = express.Router();
const authChecks = require("../authChecks.js");
const flash = require("express-flash");
const connection = require("../database.js");
const queries = require("../queries/suppliersQueries.js");
const { ROLE } = require("../roles.js");
var htmlEncode = require("js-htmlencode").htmlEncode;

router.get("/suppliers", (req, res) => {
  queries.getSuppliers(connection, (data) => res.json(data));
});

router.get(
  //TODO - add html render
  "/suppliers/add",
  authChecks.checkAuthenticated,
  authChecks.authRole(ROLE.ADMIN),
  async (req, res) => {
    res.render("addUser.ejs");
  }
);

router.get(
  "/suppliers/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    queries.getSupplierById(connection, req.params.id, (data) => {
      if (data == undefined || data == null) {
        res.writeHead("404");
        res.write(JSON.stringify({ error: "Supplier not found" }));
      } else {
        res.writeHead("200");
        res.write(JSON.stringify(data));
      }
      res.send();
    });
  }
);

router.delete(
  "/suppliers/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    queries.deleteSupplierById(
      connection,
      req.params.id,
      (error, results, fields) => {
        if (error) {
          res.writeHead(500);
          res.write(JSON.stringify({ error: "Supplier not found" }));
        } else {
          res.writeHead(200);
          res.write(JSON.stringify({ success: "Supplier deleted" }));
        }
        res.send();
      }
    );
  }
);

router.put(
  "/suppliers/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  async (req, res) => {
    let supplier = {};
    supplier.id = req.params.id;
    if (req.body.naziv) {
      supplier.naziv = htmlEncode(req.body.naziv);
    }

    queries.updateSupplierById(connection, supplier, (data) => {
      if (data == undefined || data == null) {
        res.writeHead("404");
        res.write(JSON.stringify({ error: "Supplier not found" }));
      } else {
        res.writeHead("200");
        res.write(JSON.stringify(data));
      }
      res.send();
    });
  }
);

router.post("/suppliers/add", async (req, res) => {
  try {
    let supplier = {};
    supplier.id = req.params.id;
    if (req.body.naziv) {
      supplier.naziv = htmlEncode(req.body.naziv);
    }
    queries.addSupplier(connection, supplier, (data) => {
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
