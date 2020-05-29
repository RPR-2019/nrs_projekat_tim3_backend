const express = require("express");
const router = express.Router();
const authChecks = require("../authChecks.js");
const flash = require("express-flash");
const connection = require("../database.js");
const queries = require("../queries/itemsQueries.js");
const { ROLE } = require("../roles.js");
var htmlEncode = require("js-htmlencode").htmlEncode;

router.get("/items", (req, res) => {
  queries.getItems((data) => res.json(data));
});

router.get(
  //TODO - add html render
  "/items/add",
  authChecks.checkAuthenticated,
  authChecks.authRole(ROLE.ADMIN),
  async (req, res) => {
    res.render("addUser.ejs");
  }
);

router.get(
  "/items/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    queries.getItemById(req.params.id, (data) => {
      if (data == null) {
        res.writeHead("404");
        res.write(JSON.stringify({ error: "Item not found" }));
      } else {
        res.writeHead("200");
        res.write(JSON.stringify(data));
      }
      res.send();
    });
  }
);

router.delete(
  "/items/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    queries.deleteItemById(req.params.id, (error, results, fields) => {
      if (error) {
        res.writeHead(500);
        res.write(
          JSON.stringify({ error: "Item not found or has dependency" })
        );
      } else {
        res.writeHead(200);
        res.write(JSON.stringify({ success: "Item deleted" }));
      }
      res.send();
    });
  }
);

router.put(
  "/items/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  async (req, res) => {
    let item = {};
    item.id = req.params.id;
    if (req.body.naziv !== undefined) {
      item.naziv = htmlEncode(req.body.naziv);
    }
    if (req.body.proizvodjac !== undefined) {
      req.body.proizvodjac !== null
        ? (item.proizvodjac = htmlEncode(req.body.proizvodjac))
        : (item.proizvodjac = req.body.proizvodjac);
    }
    if (req.body.kategorija !== undefined) {
      req.body.kategorija !== null
        ? (item.kategorija = htmlEncode(req.body.kategorija))
        : (item.kategorija = req.body.kategorija);
    }
    queries.updateItemById(item, (data, error) => {
      if (error) {
        res.writeHead("404");
        res.write(
          JSON.stringify({ error: "Manufacturer or category not found" })
        );
      } else if (data == undefined || data == null) {
        res.writeHead("404");
        res.write(JSON.stringify({ error: "Item not found" }));
      } else {
        res.writeHead("200");
        res.write(JSON.stringify(data));
      }
      res.send();
    });
  }
);

router.post("/items", async (req, res) => {
  try {
    let item = {};
    if (req.body.naziv !== undefined) {
      item.naziv = htmlEncode(req.body.naziv);
    }
    if (req.body.proizvodjac !== undefined) {
      req.body.proizvodjac !== null
        ? (item.proizvodjac = htmlEncode(req.body.proizvodjac))
        : (item.proizvodjac = req.body.proizvodjac);
    }
    if (req.body.kategorija !== undefined) {
      req.body.kategorija !== null
        ? (item.kategorija = htmlEncode(req.body.kategorija))
        : (item.kategorija = req.body.kategorija);
    }
    queries.addItem(item, function (error, results, fields) {
      if (error) {
        console.log(error);
        res.writeHead(500);
        res.write(
          JSON.stringify({ error: "Manufacturer or category not found!" })
        );
        res.send();
      } else {
        queries.getItemById(results.insertId, (data) => {
          if (data == null) {
            res.writeHead("404");
            res.write(JSON.stringify({ error: "Item not found" }));
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
