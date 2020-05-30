if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const helmet = require("helmet");
// const https = require('https');
const fs = require("fs");
// const http = require('http');
let net = require("net");
let io = require("socket.io");
let httpx = require("./httpx");

const initializePassport = require("./passport-config");
const authChecks = require("./authChecks.js");
const connection = require("./database.js");
const { ROLE } = require("./roles.js");
const queries = require("./queries/usersQueries.js");

const options = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
};

initializePassport(
  passport,
  async function (email, callback) {
    console.log("email" + email);
    queries.getUsers(connection, function (data) {
      callback(
        data.find(function (user) {
          return user.email === email;
        })
      );
    });
  },
  function (id, callback) {
    queries.getUserById(connection, id, callback);
  }
);

app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("layout", "layouts/layout");
app.set("views", __dirname + "/views");
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(express.json());
app.use(helmet());

app.all("/", authChecks.checkAuthenticated, require("./routes/index"));

app.all(
  ["/login", "/login*"],
  authChecks.checkNotAuthenticated,
  require("./routes/login")
);
app.all("/logout", authChecks.checkAuthenticated, require("./routes/login"));

app.all(
  ["/register", "/register*"],
  authChecks.checkNotAuthenticated,
  require("./routes/register")
);

app.all(
  ["/users", "/users*"],
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  require("./routes/users")
);

app.all(
  ["/people", "/people*"],
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  require("./routes/people")
);

app.all(
  ["/manufacturers", "/manufacturers*"],
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  require("./routes/manufacturers")
);

app.all(
  ["/categories", "/categories*"],
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  require("./routes/categories")
);

app.all(
  ["/items", "/items*"],
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  require("./routes/items")
);

app.all(
  ["/warehouses", "/warehouses*"],
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  require("./routes/warehouses")
);

app.all(
  ["/suppliers", "/suppliers*"],
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  require("./routes/suppliers")
);

app.all(
  ["/orders", "/orders*"],
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  require("./routes/orders")
);

app.all(
  ["/purchases", "/purchases*"],
  //authChecks.checkAuthenticated,
  //authChecks.authRole(ROLE.ADMIN),
  require("./routes/purchases")
);
//app.listen(process.env.PORT || 8080);

//https
//https.createServer(options, app).listen(8080);

/*
// set up a route to redirect http to https
http.createServer(
    function (req, res) {
        res.redirect('https://' + req.headers.host + req.url);

        // Or, if you don't want to automatically detect the domain name from the request header, you can hard code it:
        // res.redirect('https://example.com' + req.url);
    }
).listen(8080);
*/

//http(s) proxy

let server = httpx.createServer(options, app);
let ws = io(server.http);
let wss = io(server.https);
server.listen(process.env.PORT || 8080, "0.0.0.0");

console.log("Server started. Listening on port 8080");
