const express = require("express");
const router = express.Router();
const authChecks = require("../authChecks.js");
const flash = require("express-flash");
const connection = require("../database.js");
const queries = require("../queries/ordersQueries.js");
const orderItemsQ = require("../queries/orderItemsQueries.js");
const { ROLE } = require("../roles.js");
var htmlEncode = require("js-htmlencode").htmlEncode;

router.get("/orders", (req, res) => {
  queries.getOrders((data) => res.json(data));
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
    queries.getOrderById(req.params.id, (error, results) => {
      if (error) {
        res.writeHead("500");
        res.write(JSON.stringify({ error: "Server error" }));
        res.send();
      } else if (results[0] == null) {
        res.writeHead("404");
        res.write(JSON.stringify({ error: "Order not found" }));
        res.send();
      } else {
        console.log(JSON.stringify(results));
        res.json(results[0]);
      }
    });
  }
);

router.delete(
  "/orders/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    queries.deleteOrderById(req.params.id, (error, results, fields) => {
      if (error) {
        res.writeHead(500);
        res.write(JSON.stringify({ error: "Order not found" }));
        res.send();
      } else {
        res.json({ success: "Order deleted" });
      }
    });
  }
);

router.put(
  "/orders/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  async (req, res) => {
    let order = {};

    order.id = req.params.id;
    var body = req.body;
    if (
      undefinedAndCheck(
        body.korisnicki_racun,
        body.skladiste_id,
        body.datum_isporuke
      )
    ) {
      res.json({ error: "Wrong params" });
      return;
    }
    if (body.korisnicki_racun !== undefined) {
      order.korisnicki_racun = htmlEncode(body.korisnicki_racun);
    }
    if (body.skladiste_id !== undefined) {
      order.skladiste_id = htmlEncode(body.skladiste_id);
    }
    if (body.datum_isporuke !== undefined) {
      if (body.datum_isporuke !== null) {
        order.datum_isporuke = htmlEncode(body.datum_isporuke);
      } else {
        order.datum_isporuke = body.datum_isporuke;
      }
    }

    queries.updateOrderById(order, (error, results) => {
      if (error) {
        res.writeHead("404");
        res.write(JSON.stringify({ error: "User or warehouse not found" }));
        res.send();
      } else if (results[0] == null) {
        res.writeHead("404");
        res.write(JSON.stringify({ error: "Order not found" }));
        res.send();
      } else {
        res.json(results[0]);
      }
    });
  }
);

router.post("/orders", async (req, res) => {
  try {
    let order = {};
    //params check
    var body = req.body;
    if (
      undefinedOrCheck(
        body.korisnicki_racun,
        body.skladiste_id,
        body.datum_isporuke,
        body.orderItems
      )
    ) {
      res.json({ error: "Wrong params" });
      return;
    }
    if (body.korisnicki_racun == null) {
      order.korisnicki_racun = body.korisnicki_racun;
    } else {
      order.korisnicki_racun = htmlEncode(body.korisnicki_racun);
    }
    if (body.skladiste_id == null) {
      order.skladiste_id = body.skladiste_id;
    } else {
      order.skladiste_id = htmlEncode(body.skladiste_id);
    }
    if (body.datum_isporuke == null) {
      order.datum_isporuke = body.datum_isporuke;
    } else {
      order.datum_isporuke = htmlEncode(body.datum_isporuke);
    }
    order.orderItems = body.orderItems;
    queries.addOrder(order, (error, results) => {
      if (error) {
        res.json(error);
      } else if (results == null) {
        res.writeHead("404");
        res.write(JSON.stringify({ error: "Order not found" }));
        res.send();
      } else {
        let done = true;
        order.orderItems.forEach((element) => {
          orderItemsQ.addOrderItems(
            results[0].id,
            element.itemId,
            element.quantity,
            element.supplierId,
            (error, data) => {
              if (error) {
                done = false;
                if (error.error) {
                  res.json(error);
                } else {
                  res.json({
                    error: "Order already has that item from that supplier.",
                  });
                }
                return;
              }
            }
          );
        });
        if (done) {
          res.json(results);
        }
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

function undefinedOrCheck(...params) {
  for (param of params) {
    if (param === undefined) {
      return true;
    }
  }
  return false;
}

function undefinedAndCheck(...params) {
  for (param of params) {
    if (param !== undefined) {
      return false;
    }
  }
  return true;
}

router.all(
  ["/orders/:id/items", "/orders/:id/items*"],
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  require("./orderItems")
);

module.exports = router;
