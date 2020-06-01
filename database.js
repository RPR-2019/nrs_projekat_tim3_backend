var mysql = require("mysql");
const dbConfig = require("./db.config.js");
/*
var connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "root",
    database: "skladista"
});*/

var connection = mysql.createPool({
  /*host: "127.0.0.1",
    user: "root",
    password: "root",
    database: "skladista",*/
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  connectionLimit: 100,
});

/*
connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected to db!");
});*/

module.exports = connection;
