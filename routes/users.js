const express = require('express');
const router = express.Router();
const authChecks = require('../authChecks.js');
const passport = require('passport');
const flash = require('express-flash');
const connection = require('../database.js');
const queries = require('../queries.js');
const { ROLE } = require('../roles.js');
const bcrypt = require('bcrypt');
var htmlEncode = require('js-htmlencode').htmlEncode;

router.get('/users', (req, res) => {
    queries.getUsers(
        connection,
        data => res.json(data)
    );
});

router.get('/users/add',
    authChecks.checkAuthenticated,
    authChecks.authRole(ROLE.ADMIN),
    async (req, res) => {
        res.render('addUser.ejs');
    }
);
//TODO
router.post(
    '/users/add',
    async (req, res) => {
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
                password: hashedPassword
            }
            let query = "INSERT INTO osobe(Ime, Prezime, Telefon, datum_zaposljavanja, JMBG, naziv_lokacije)" +
                "VALUES (?,?,?,?,?,?)";
            connection.query(
                query,
                [
                    user.ime,
                    user.prezime,
                    user.telefon,
                    user.datum_zaposljavanja,
                    user.jmbg,
                    user.lokacija
                ],
                function (error, results, fields) {
                    if (error) {
                        console.log(error);
                        req.flash('error', 'JMBG vec postoji');
                        res.render('addUser.ejs');
                    } else {
                        user.o_id = results.insertId;
                        let query = "INSERT INTO  korisnicki_racuni(osoba_id,pravo_pristupa, password, email)" +
                            "VALUES (?,?,?,?)";
                        connection.query(
                            query,
                            [
                                user.o_id,
                                user.pravo_pristupa,
                                user.password,
                                user.email
                            ],
                            function (error, results) {
                                if (error) {
                                    console.log(error);
                                    console.log("email je zauzet ili predug");
                                    req.flash('error', 'Email je zauzet');
                                    res.render('addUser.ejs');
                                } else {
                                    req.flash('info', 'Korisnik dodan');
                                    res.render('addUser.ejs');
                                }

                            }
                        )
                    }
                });
            //res.status(201).send()
        } catch (error) {
            console.log(error);
            res.status(500).send()
        }
    });

module.exports = router;