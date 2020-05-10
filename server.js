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
/*async (req, res) => {
   try {
       const salt = await bcrypt.genSalt();
       const hashedPassword = await bcrypt.hash(req.body.password, salt);
       let user = {
           email: req.body.email,
       }
       console.log(hashedPassword);
       connection.query('INSERT INTO korisnicki_racuni(pravo_pristupa, password, email) VALUES' +
           `(3, "${hashedPassword}", "${user.email}")`, function (error, results, fields) {
               if (error) console.log(error);
           });
       res.redirect('/login');
   } catch (e) {
       console.log(e);
       res.redirect('/register');
   }
})*/

app.get('/users', (req, res) => {
    getUsers(
        connection,
        data => res.json(data)
    );
})

app.post('/users', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        let user = {
            pravo_pristupa: req.body.pravo_pristupa,
            email: req.body.email,
            password: hashedPassword
        }
        connection.query('INSERT INTO korisnicki_racuni(pravo_pristupa, password, email) VALUES' +
            `(${user.pravo_pristupa}, ${user.hashedPassword}, ${user.email})`, function (error, results, fields) {
                if (error) throw error;
            });
        res.status(201).send()
    } catch {
        res.status(500).send()
    }
})

app.post('/users/login', async (req, res) => {
    const user = getUsers(
        connection,
        data => data.find(user => user.email === req.body.email)
    )
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

async function getUsers(connection, callback) {
    connection.query('SELECT * FROM korisnicki_racuni', function (error, results, fields) {
        if (error) throw error;
        //console.log('Racuni: ', results);
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
