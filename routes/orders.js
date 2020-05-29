const express = require("express");
const router = express.Router();
const authChecks = require("../authChecks.js");
const flash = require("express-flash");
const connection = require("../database.js");
const queries = require("../queries/ordersQueries.js");
const { ROLE } = require("../roles.js");
var htmlEncode = require("js-htmlencode").htmlEncode;

router.get("/orders", (req, res) => {
  queries.getOrders(connection, (data) => res.json(data));
});

router.get(
  //TODO - add html render
  "/orders/add",
  authChecks.checkAuthenticated,
  authChecks.authRole(ROLE.ADMIN),
  async (req, res) => {
    res.render("addUser.ejs");
  }
);

router.get(
  "/orders/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    queries.getOrderById(connection, req.params.id, (temp, data) => {
      if (data == null) {
        res.writeHead("404");
        res.write(JSON.stringify({ error: "Order not found" }));
        res.send();
      } else {
        res.json(data);
      }
    });
  }
);

router.delete(
  "/orders/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    queries.deleteOrderById(
      connection,
      req.params.id,
      (error, results, fields) => {
        if (error) {
          res.writeHead(500);
          res.write(JSON.stringify({ error: "Order not found" }));
          res.send();
        } else {
          res.json({ success: "Order deleted" });
        }
      }
    );
  }
);

router.put(
  "/orders/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  async (req, res) => {
    let order = {};
    order.id = req.params.id;
    if (req.body.korisnicki_racun) {
      order.korisnicki_racun = htmlEncode(req.body.korisnicki_racun);
    }
    if (req.body.skladiste_id) {
      order.skladiste_id = htmlEncode(req.body.skladiste_id);
    }
    if (req.body.datum_isporuke) {
      order.datum_isporuke = htmlEncode(req.body.datum_isporuke);
    }

    queries.updateOrderById(connection, order, (temp, data) => {
      if (data == undefined || data == null) {
        res.writeHead("404");
        res.write(JSON.stringify({ error: "Not found" }));
        res.send();
      } else {
        res.json(data);
      }
    });
  }
);

router.post("/orders", async (req, res) => {
  try {
    let order = {};
    order.id = req.params.id;
    if (req.body.korisnicki_racun != undefined) {
      if (req.body.korisnicki_racun == null) {
        order.korisnicki_racun = req.body.korisnicki_racun;
      } else {
        order.korisnicki_racun = htmlEncode(req.body.korisnicki_racun);
      }
    }
    if (req.body.skladiste_id != undefined) {
      if (req.body.skladiste_id == null) {
        order.skladiste_id = req.body.skladiste_id;
      } else {
        order.skladiste_id = htmlEncode(req.body.skladiste_id);
      }
    }
    if (req.body.datum_isporuke != undefined) {
      if (req.body.datum_isporuke == null) {
        order.datum_isporuke = req.body.datum_isporuke;
      } else {
        order.datum_isporuke = htmlEncode(req.body.datum_isporuke);
      }
    }
    queries.addOrder(connection, order, (temp, data) => {
      if (data == null) {
        res.writeHead("404");
        res.write(JSON.stringify({ error: "Not found" }));
        res.send();
      } else {
        res.json(data);
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

module.exports = router;
