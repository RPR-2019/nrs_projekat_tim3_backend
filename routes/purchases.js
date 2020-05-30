const express = require("express");
const router = express.Router();
const authChecks = require("../authChecks.js");
const flash = require("express-flash");
const connection = require("../database.js");
const queries = require("../queries/purchasesQueries.js");
const queriesItems = require("../queries/purchaseItemsQueries.js");
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
    queries.getPurchaseById(req.params.id, (error, data) => {
      if (error) {
        res.json(error);
      } else if (data == null) {
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
    if (req.body.korisnicki_racun !== undefined) {
      req.body.korisnicki_racun !== null
        ? (purchase.korisnicki_racun = htmlEncode(req.body.korisnicki_racun))
        : (purchase.korisnicki_racun = req.body.korisnicki_racun);
    }
    if (req.body.stanje_id !== undefined) {
      req.body.stanje_id !== null
        ? (purchase.stanje_id = htmlEncode(req.body.stanje_id))
        : (purchase.stanje_id = req.body.stanje_id);
    }
    queries.updatePurchaseById(purchase, (error, data) => {
      if (error) {
        res.writeHead("404");
        res.write(JSON.stringify({ error: "User or condition not found!" }));
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
  let purchase = {};
  if (req.body.korisnicki_racun !== undefined) {
    req.body.korisnicki_racun !== null
      ? (purchase.korisnicki_racun = htmlEncode(req.body.korisnicki_racun))
      : (purchase.korisnicki_racun = req.body.korisnicki_racun);
  }
  if (req.body.stanje_id !== undefined) {
    req.body.stanje_id !== null
      ? (purchase.stanje_id = htmlEncode(req.body.stanje_id))
      : (purchase.stanje_id = req.body.stanje_id);
  }
  purchase.purchaseItems = body.purchaseItems;
  queries.addPurchase(purchase, function (error, results, fields) {
    if (error) {
      res.writeHead(404);
      res.write(JSON.stringify({ error: "User or condition not found!" }));
      res.send();
    } else {
      let done = true;
      order.purchaseItems.forEach((element) => {
        queriesItems.addPurchaseItems(
          results[0].id,
          element.itemId,
          element.quantity,
          (error, data) => {
            if (error) {
              res.json(error);
              return;
            }
          }
        );
      });
      if (done) {
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
    }
  });
});

router.all(
  ["/purchases/:id/items", "/purchases/:id/items*"],
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  require("./purchaseItems")
);

module.exports = router;
