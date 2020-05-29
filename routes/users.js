const express = require("express");
const router = express.Router();
const authChecks = require("../authChecks.js");
const flash = require("express-flash");
const connection = require("../database.js");
const queries = require("../queries/usersQueries.js");
const { ROLE } = require("../roles.js");
const bcrypt = require("bcrypt");
var htmlEncode = require("js-htmlencode").htmlEncode;

router.get("/users", (req, res) => {
  queries.getUsers((data) => res.json(data));
});

router.get(
  "/users/add",
  authChecks.checkAuthenticated,
  authChecks.authRole(ROLE.ADMIN),
  async (req, res) => {
    res.render("addUser.ejs");
  }
);

router.get(
  "/users/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    queries.getUserById(req.params.id, (temp, data) => {
      if (data == null) {
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
  "/users/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  (req, res) => {
    queries.deleteUserById(req.params.id, (error, results, fields) => {
      if (error) {
        res.write(JSON.stringify({ error: "user not found" }));
      } else {
        res.writeHead(200);
        res.write(JSON.stringify({ success: "user deleted" }));
      }
      res.send();
    });
  }
);

router.put(
  "/users/:id",
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  async (req, res) => {
    let user = {};
    user.id = req.params.id;
    if (req.body.password) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      user.password = hashedPassword;
    }
    if (req.body.pravo_pristupa) {
      user.pravo_pristupa = htmlEncode(req.body.pravo_pristupa);
    }
    if (req.body.email) {
      user.email = htmlEncode(req.body.email);
    }

    queries.updateUserById(user, (temp, data) => {
      if (data == null) {
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

router.post("/users", async (req, res) => {
  try {
    if (req.body.pravo_pristupa < 1 || req.body.pravo_pristupa > 3) {
      req.body.pravo_pristupa = 3;
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    let user = {
      lokacija: htmlEncode(req.body.lokacija),
      ime: htmlEncode(req.body.ime),
      prezime: htmlEncode(req.body.prezime),
      telefon: htmlEncode(req.body.telefon),
      datum_zaposljavanja: htmlEncode(req.body.datum_zaposljavanja),
      jmbg: htmlEncode(req.body.jmbg),
      pravo_pristupa: htmlEncode(req.body.pravo_pristupa),
      email: htmlEncode(req.body.email),
      password: hashedPassword,
    };
    let query =
      "INSERT INTO osobe(Ime, Prezime, Telefon, datum_zaposljavanja, JMBG, naziv_lokacije)" +
      "VALUES (?,?,?,?,?,?)";
    connection.query(
      query,
      [
        user.ime,
        user.prezime,
        user.telefon,
        user.datum_zaposljavanja,
        user.jmbg,
        user.lokacija,
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
          user.o_id = resultsOuter.insertId;
          let query =
            "INSERT INTO  korisnicki_racuni(osoba_id,pravo_pristupa, password, email)" +
            "VALUES (?,?,?,?)";
          connection.query(
            query,
            [user.o_id, user.pravo_pristupa, user.password, user.email],
            function (error, results, fields) {
              if (error) {
                console.log(error);
                queries.deleteUserById(
                  resultsOuter.insertId,
                  (error, results, fields) => {
                    if (error) {
                      res.write(JSON.stringify(error));
                    }
                    console.log("email je zauzet ili predug");
                    res.writeHead(500);
                    res.write(JSON.stringify({ error: "Email is taken" }));
                    res.send();
                  }
                );
                //req.flash("error", "Email je zauzet");
                //res.render("addUser.ejs");
              } else {
                queries.getPersonById(results.insertId, (data) => {
                  res.write(JSON.stringify(data));
                  res.send();
                });
                //req.flash("info", "Korisnik dodan");
                //res.render("addUser.ejs");
              }
            }
          );
        }
      }
    );
    //res.status(201).send()
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

module.exports = router;
