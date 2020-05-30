const express = require("express");
const router = express.Router();
const authChecks = require("../authChecks.js");
const flash = require("express-flash");
const connection = require("../database.js");
const queries = require("../queries/purchasesQueries.js");
const { ROLE } = require("../roles.js");
var htmlEncode = require("js-htmlencode").htmlEncode;

router.get("/purchases", (req, res) => {
  queries.getPurchases((data) => res.json(data));
});

router.get(
  //TODO - add html render
  "/purchases/add",
  authChecks.checkAuthenticated,
  authChecks.authRole(ROLE.ADMIN),
  async (req, res) => {
    res.render("addUser.ejs");
  }
);

router.get(
  "/purchases/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    queries.getPurchaseById(req.params.id, (data) => {
      if (data == null) {
        res.writeHead("404");
        res.write(JSON.stringify({ error: "Purchase not found" }));
      } else {
        res.writeHead("200");
        res.write(JSON.stringify(data));
      }
      res.send();
    });
  }
);

router.delete(
  "/purchases/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    queries.deletePurchaseById(req.params.id, (error, results, fields) => {
      if (error) {
        res.writeHead(500);
        res.write(
          JSON.stringify({ error: "Purchase not found or has dependency" })
        );
      } else {
        res.writeHead(200);
        res.write(JSON.stringify({ success: "Purchase deleted" }));
      }
      res.send();
    });
  }
);

router.put(
  "/purchases/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  async (req, res) => {
    let purchase = {};
    purchase.id = req.params.id;
    if (req.body.naziv !== undefined) {
      purchase.naziv = htmlEncode(req.body.naziv);
    }
    if (req.body.proizvodjac !== undefined) {
      req.body.proizvodjac !== null
        ? (purchase.proizvodjac = htmlEncode(req.body.proizvodjac))
        : (purchase.proizvodjac = req.body.proizvodjac);
    }
    if (req.body.kategorija !== undefined) {
      req.body.kategorija !== null
        ? (purchase.kategorija = htmlEncode(req.body.kategorija))
        : (purchase.kategorija = req.body.kategorija);
    }
    queries.updatePurchaseById(purchase, (data, error) => {
      if (error) {
        res.writeHead("404");
        res.write(
          JSON.stringify({ error: "Manufacturer or category not found" })
        );
      } else if (data == undefined || data == null) {
        res.writeHead("404");
        res.write(JSON.stringify({ error: "Purchase not found" }));
      } else {
        res.writeHead("200");
        res.write(JSON.stringify(data));
      }
      res.send();
    });
  }
);

router.post("/purchases", async (req, res) => {
  try {
    let purchase = {};
    if (req.body.naziv !== undefined) {
      purchase.naziv = htmlEncode(req.body.naziv);
    }
    if (req.body.proizvodjac !== undefined) {
      req.body.proizvodjac !== null
        ? (purchase.proizvodjac = htmlEncode(req.body.proizvodjac))
        : (purchase.proizvodjac = req.body.proizvodjac);
    }
    if (req.body.kategorija !== undefined) {
      req.body.kategorija !== null
        ? (purchase.kategorija = htmlEncode(req.body.kategorija))
        : (purchase.kategorija = req.body.kategorija);
    }
    queries.addPurchase(purchase, function (error, results, fields) {
      if (error) {
        console.log(error);
        res.writeHead(500);
        res.write(
          JSON.stringify({ error: "Manufacturer or category not found!" })
        );
        res.send();
      } else {
        queries.getPurchaseById(results.insertId, (data) => {
          if (data == null) {
            res.writeHead("404");
            res.write(JSON.stringify({ error: "Purchase not found" }));
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

module.exports = router;
