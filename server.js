if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');


const initializePassport = require('./passport-config');
const authChecks = require('./authChecks.js');
const connection = require('./database.js');
const { ROLE } = require('./roles.js');

initializePassport(
    passport,
    async function (email, callback) {
        getUsers(
            connection,
            function (data) {
                callback(
                    data.find(function (user) {
                        return user.email === email;
                    })
                )
            }
            //data => data.find(user => user.email == email)
        )
    },
    function (id, callback) {
        getUserById(
            connection,
            id,
            callback
        )
    }
)





app.set('view-engine', 'ejs');
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use(express.json());

//routes

//lijepi fakultet koji te nista ne nauci <3

//app.use('/', authChecks.checkNotAuthenticated, require('./routes/index'));
//app.use('/login', authChecks.checkNotAuthenticated, require('./routes/login'));
//app.use('/logout', authChecks.checkNotAuthenticated, require('./routes/login'));


app.get('/', authChecks.checkAuthenticated, (req, res) => {
    console.log("requser" + JSON.stringify(req.user));
    res.render('index.ejs', { email: req.user.email });
});

app.get('/login', authChecks.checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');
});

app.post('/login', authChecks.checkNotAuthenticated, passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.delete('/logout', authChecks.checkAuthenticated, (req, res) => {
    req.logOut();
    res.redirect('/login');
});

app.get('/register', authChecks.checkNotAuthenticated, (req, res) => {
    res.render('register.ejs');
});

app.post('/register', authChecks.checkNotAuthenticated, passport.authenticate('local-register', {
    successRedirect: '/login',
    failureRedirect: '/register',
    failureFlash: true
}));


app.get('/users', authChecks.checkAuthenticated, authChecks.authRole(ROLE.ADMIN), (req, res) => {
    getUsers(
        connection,
        data => res.json(data)
    );
})

app.post('/users',
    authChecks.checkAuthenticated,
    authChecks.authRole(ROLE.ADMIN),
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

app.get('/addUsers',
    authChecks.checkAuthenticated,
    authChecks.authRole(ROLE.ADMIN),
    async (req, res) => {
        res.render('addUser.ejs');
    }
);

async function getUsers(connection, callback) {
    connection.query('SELECT * FROM korisnicki_racuni', function (error, results, fields) {
        if (error) throw error;
        callback(results);
    });
}

function getUserById(connection, id, callback) {
    connection.query(
        'SELECT * FROM korisnicki_racuni where id =' + id,
        function (error, results) {
            if (error) throw error;
            //console.log('Racuni: ', results);
            callback(null, results[0]);
        });
}

app.listen(process.env.PORT || 8000);
console.log("Server started. Listening on port 8000.");
