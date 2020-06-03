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
    queries.getUsers((data) => {
      callback(
        data.find(function (user) {
          return user.email === email;
        })
      );
    });
  },
  function (id, callback) {
    queries.getUserById(id, callback);
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
  authChecks.checkAuthenticated,
  authChecks.authRole(ROLE.ADMIN),
  require("./routes/users")
);

app.all(
  ["/people", "/people*"],
  authChecks.checkAuthenticated,
  authChecks.authRole(ROLE.ADMIN),
  require("./routes/people")
);

app.all(
  ["/manufacturers", "/manufacturers*"],
  authChecks.checkAuthenticated,
  require("./routes/manufacturers")
);

app.all(
  ["/categories", "/categories*"],
  authChecks.checkAuthenticated,
  require("./routes/categories")
);

app.all(
  ["/items", "/items*"],
  authChecks.checkAuthenticated,
  require("./routes/items")
);

app.all(
  ["/warehouses", "/warehouses*"],
  authChecks.checkAuthenticated,
  authChecks.authRole(ROLE.UPOSLENIK),
  require("./routes/warehouses")
);

app.all(
  ["/suppliers", "/suppliers*"],
  authChecks.checkAuthenticated,
  authChecks.authRole(ROLE.UPOSLENIK),
  require("./routes/suppliers")
);

app.all(
  ["/orders", "/orders*"],
  authChecks.checkAuthenticated,
  authChecks.authRole(ROLE.UPOSLENIK),
  require("./routes/orders")
);

app.all(
  ["/purchases", "/purchases*"],
  authChecks.checkAuthenticated,
  authChecks.authRole(ROLE.KUPAC),
  require("./routes/purchases")
);
app.all(
  ["/shop", "/shop"],
  authChecks.checkAuthenticated,
  authChecks.authRole(ROLE.ADMIN),
  require("./routes/shop")
);
app.all(
  ["/cart", "/cart"],
  authChecks.checkAuthenticated,
  authChecks.authRole(ROLE.ADMIN),
  require("./routes/cart")
);
//app.listen(process.env.PORT || 8080);

//http(s) proxy

let server = httpx.createServer(options, app);
let ws = io(server.http);
let wss = io(server.https);
server.listen(process.env.PORT || 8080, "0.0.0.0");

console.log("Server started. Listening on port 8080");
