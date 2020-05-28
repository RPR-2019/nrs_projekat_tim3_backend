const express = require("express");
const router = express.Router();
const authChecks = require("../authChecks.js");
const passport = require("passport");
const flash = require("express-flash");
const connection = require("../database.js");
const queries = require("../queries/peopleQueries.js");
const { ROLE } = require("../roles.js");
const bcrypt = require("bcrypt");
var htmlEncode = require("js-htmlencode").htmlEncode;

router.get("/people", (req, res) => {
  queries.getPeople(connection, (data) => res.json(data));
});

router.get(
  //TODO - add html render
  "/people/add",
  authChecks.checkAuthenticated,
  authChecks.authRole(ROLE.ADMIN),
  async (req, res) => {
    res.render("addUser.ejs");
  }
);

router.get(
  "/people/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    queries.getPersonById(connection, req.params.id, (temp, data) => {
      if (data == undefined || data == null) {
        res.writeHead("404");
        res.write(JSON.stringify({ error: "Not found" }));
      } else {
        res.writeHead("200");
        res.write(JSON.stringify(data));
      }
      res.send();
    });
  }
);

router.delete(
  "/people/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    queries.deletePersonById(
      connection,
      req.params.id,
      (error, results, fields) => {
        if (error) {
          res.writeHead(500);
          res.write(JSON.stringify({ error: "person not found" }));
        } else {
          res.writeHead(200);
          res.write(JSON.stringify({ success: "person deleted" }));
        }
        res.send();
      }
    );
  }
);

router.put(
  "/people/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  async (req, res) => {
    let person = {};
    person.id = req.params.id;
    if (req.body.ime) {
      person.ime = htmlEncode(req.body.ime);
    }
    if (req.body.prezime) {
      person.prezime = htmlEncode(req.body.prezime);
    }
    if (req.body.telefon) {
      person.telefon = htmlEncode(req.body.telefon);
    }
    if (req.body.datum_zaposljavanja) {
      person.datum_zaposljavanja = htmlEncode(req.body.datum_zaposljavanja);
    }
    if (req.body.lokacija) {
      person.naziv_lokacije = htmlEncode(req.body.lokacija);
    }
    if (req.body.jmbg) {
      person.jmbg = htmlEncode(req.body.jmbg);
    }

    queries.updatePersonById(connection, person, (temp, data) => {
      if (data == undefined || data == null) {
        res.writeHead("404");
        res.write(JSON.stringify({ error: "Not found" }));
      } else {
        res.writeHead("200");
        res.write(JSON.stringify(data));
      }
      res.send();
    });
  }
);

router.post("/people/add", async (req, res) => {
  try {
    if (req.body.pravo_pristupa < 1 || req.body.pravo_pristupa > 3) {
      req.body.pravo_pristupa = 3;
    }
    let person = {
      lokacija: htmlEncode(req.body.lokacija),
      ime: htmlEncode(req.body.ime),
      prezime: htmlEncode(req.body.prezime),
      telefon: htmlEncode(req.body.telefon),
      datum_zaposljavanja: htmlEncode(req.body.datum_zaposljavanja),
      jmbg: htmlEncode(req.body.jmbg),
    };
    let query =
      "INSERT INTO osobe(Ime, Prezime, Telefon, datum_zaposljavanja, JMBG, naziv_lokacije)" +
      "VALUES (?,?,?,?,?,?)";
    connection.query(
      query,
      [
        person.ime,
        person.prezime,
        person.telefon,
        person.datum_zaposljavanja,
        person.jmbg,
        person.lokacija,
      ],
      function (error, resultsOuter, fields) {
        if (error) {
          console.log(error);
          res.writeHead(200);
          res.write(JSON.stringify({ error: "JMBG is taken" }));
          console.log("JMBG is taken");
          res.send();
          //req.flash("error", "JMBG vec postoji");
          //res.render("addUser.ejs");
        } else {
          queries.getPersonById(
            connection,
            resultsOuter.insertId,
            (temp, data) => {
              if (data == undefined || data == null) {
                res.writeHead("404");
                res.write(JSON.stringify({ error: "Not found" }));
              } else {
                res.writeHead("200");
                res.write(JSON.stringify(data));
              }
              res.send();
            }
          );
        }
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

module.exports = router;
