var mysql = require('mysql');
/*
var connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "root",
    database: "skladista"
});*/

var connection = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "root",
    database: "skladista",
    connectionLimit: 100
});

/*
connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected to db!");
});*/

module.exports = connection;