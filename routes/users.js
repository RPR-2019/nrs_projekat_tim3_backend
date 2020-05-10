const express = require('express');
const router = express.Router();
const authChecks = require('../authChecks.js');
const passport = require('passport');
const flash = require('express-flash');
const connection = require('../database.js');
const queries = require('../queries.js');
const { ROLE } = require('../roles.js');
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
router.post('/users',
    async (req, res) => {
        res.render('/addUsers');
        try {
            if (req.body.pravo_pristupa < 1 || req.body.pravo_pristupa > 3) {
                req.flash({ message: 'pogresno pravo pristupa' })
                res.render('/addUsers');
            }
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            let user = {
                lokacija: req.body.lokacija,
                ime: req.body.ime,
                prezime: req.body.prezime,
                telefon: req.body.telefon,
                datum_zaposljavanja: req.body.datum_zaposljavanja,
                jmbg: req.body.jmbg,
                pravo_pristupa: req.body.pravo_pristupa,
                email: req.body.email,
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
                function (error, results) {
                    if (error) {
                        console.log("jmbg error");
                        req.flash({ message: 'jmbg vec postoji' });
                        res.render('/addUsers');
                        return;
                    }
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
                                console.log("email je vec zauzet");
                                req.flash({ message: 'email je vec zauzet' })
                                res.render('/addUsers');
                                return;
                            }
                            /*getUsers(connection, data => {
                                response.writeHead(200, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(data) });
                                res.end(data);
                                res.send();
                            );
                            }*/
                            req.flash({ message: "korisnik dodan" });
                            res.render('/addUsers');
                        }
                    )
                });
            res.status(201).send()
        } catch {
            res.status(500).send()
        }
    });

module.exports = router;