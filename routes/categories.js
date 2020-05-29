const express = require("express");
const router = express.Router();
const authChecks = require("../authChecks.js");
const flash = require("express-flash");
const connection = require("../database.js");
const queries = require("../queries/categoriesQueries.js");
const { ROLE } = require("../roles.js");
var htmlEncode = require("js-htmlencode").htmlEncode;

router.get("/categories", (req, res) => {
  queries.getCategories((data) => res.json(data));
});

router.get(
  //TODO - add html render
  "/categories/add",
  authChecks.checkAuthenticated,
  authChecks.authRole(ROLE.ADMIN),
  async (req, res) => {
    res.render("addUser.ejs");
  }
);

router.get(
  "/categories/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    queries.getCategoryById(req.params.id, (data) => {
      if (data == null) {
        res.writeHead("404");
        res.write(JSON.stringify({ error: "Category not found" }));
      } else {
        res.writeHead("200");
        res.write(JSON.stringify(data));
      }
      res.send();
    });
  }
);

router.delete(
  "/categories/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    queries.deleteCategoryById(req.params.id, (error, results, fields) => {
      if (error) {
        res.writeHead(500);
        res.write(
          JSON.stringify({ error: "Category not found or has dependency" })
        );
      } else {
        res.writeHead(200);
        res.write(JSON.stringify({ success: "Category deleted" }));
      }
      res.send();
    });
  }
);

router.put(
  "/categories/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  async (req, res) => {
    let category = {};
    category.id = req.params.id;
    if (req.body.naziv !== undefined) {
      category.naziv = htmlEncode(req.body.naziv);
    }
    if (req.body.nadkategorija !== undefined) {
      req.body.nadkategorija !== null
        ? (category.nadkategorija = htmlEncode(req.body.nadkategorija))
        : (category.nadkategorija = req.body.nadkategorija);
    }

    queries.updateCategoryById(category, (data, error) => {
      if (error) {
        res.writeHead("404");
        res.write(JSON.stringify({ error: "Parent category not found" }));
      } else if (data == null) {
        res.writeHead("404");
        res.write(JSON.stringify({ error: "Category not found" }));
      } else {
        res.writeHead("200");
        res.write(JSON.stringify(data));
      }
      res.send();
    });
  }
);

router.post("/categories", async (req, res) => {
  try {
    let category = {};
    if (req.body.naziv) {
      category.naziv = htmlEncode(req.body.naziv);
    }
    if (req.body.nadkategorija) {
      category.nadkategorija = htmlEncode(req.body.nadkategorija);
    }
    queries.addCategory(category, function (error, results, fields) {
      if (error) {
        console.log(error);
        res.writeHead(500);
        res.write(JSON.stringify({ error: "error" }));
        res.send();
      } else {
        queries.getCategoryById(results.insertId, (data) => {
          if (data == null) {
            res.writeHead("404");
            res.write(JSON.stringify({ error: "Category not found" }));
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
