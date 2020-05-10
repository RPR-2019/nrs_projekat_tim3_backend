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
const queries = require('./queries.js');

initializePassport(
    passport,
    async function (email, callback) {
        queries.getUsers(
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
        queries.getUserById(
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


/*app.get('/', authChecks.checkAuthenticated, (req, res) => {
    res.render('index.ejs', { email: req.user.email });
});*/

app.all("/", authChecks.checkAuthenticated, require('./routes/index'));

app.all(["/login", "/login*"], authChecks.checkNotAuthenticated, require('./routes/login'));
app.all("/logout", authChecks.checkAuthenticated, require('./routes/login'));

app.all(["/register", "/register*"], authChecks.checkNotAuthenticated, require('./routes/register'));

app.all(
    ["/users", "/users*"],
    authChecks.checkAuthenticated,
    authChecks.authRole(ROLE.ADMIN),
    require('./routes/users')
);


app.listen(process.env.PORT || 8000);
console.log("Server started. Listening on port 8000.");
