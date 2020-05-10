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
var mysql = require('mysql');

var con = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "root",
    database: "skladista"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected to db!");
});

//TODO
connection.query('SELECT * FROM ', function (error, results, fields) {
    if (error) throw error;
    console.log('The solution is: ', results[0].solution);
});


const initializePassport = require('./passport-config');
const authChecks = require('./authChecks.js');

initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = [];




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
    console.log("get /");
    res.render('index.ejs', { name: req.user.name });
});

app.get('/login', authChecks.checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');
});

app.post('/login', authChecks.checkNotAuthenticated, passport.authenticate('local', {
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

app.post('/register', authChecks.checkNotAuthenticated, async (req, res) => {
    try {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });
        console.log(users);
        res.redirect('/login');
    } catch {
        res.redirect('/register');
    }
})

app.get('/users', (req, res) => {
    res.json(users)
})

app.post('/users', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });
        users.push(user)
        res.status(201).send()
    } catch {
        res.status(500).send()
    }
})

app.post('/users/login', async (req, res) => {
    const user = users.find(user => user.name === req.body.name)
    if (user == null) {
        return res.status(400).send('Cannot find user')
    }
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            res.send('Success')
        } else {
            res.send('Not Allowed')
        }
    } catch {
        res.status(500).send()
    }
})


app.listen(process.env.PORT || 8000);
console.log("Server started. Listening on port 8000.");
