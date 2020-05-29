const connection = require("../database.js");

var queries = (function () {
  function getItemsImpl(callback) {
    connection.query("SELECT * FROM proizvodi", function (
      error,
      results,
      fields
    ) {
      if (error) throw error;
      callback(results);
    });
  }

  function getItemByIdImpl(id, callback) {
    connection.query("SELECT * FROM proizvodi where id = ?", [id], function (
      error,
      results
    ) {
      if (error) throw error;
      callback(results[0]);
    });
  }

  function deleteItemByIdImpl(id, callback) {
    getItemByIdImpl(id, (data) => {
      if (data === undefined || data === null) {
        callback(1);
      } else {
        let query = "DELETE FROM proizvodi WHERE id=" + id;
        connection.query(query, callback);
      }
    });
  }

  function updateItemByIdImpl(item, callback) {
    let query = "UPDATE proizvodi SET ";
    let params = [];
    if (item.naziv !== undefined) {
      query += "naziv=?,";
      params.push(item.naziv);
    }
    //enables null to be passed
    if (item.proizvodjac !== undefined) {
      query += "proizvodjac=?,";
      params.push(item.proizvodjac);
    }
    if (item.kategorija !== undefined) {
      query += "kategorija=?";
      params.push(item.kategorija);
    }
    params.push(item.id);
    if (query.slice(-1) == ",") {
      query = query.substring(0, query.length - 1);
    }
    query += " WHERE id=?";
    connection.query(query, params, (error, results, fields) => {
      if (error) {
        callback(null, 1);
      } else {
        getItemByIdImpl(item.id, callback);
      }
    });
  }

  function addItemImpl(item, callback) {
    let query =
      "INSERT INTO proizvodi (naziv, proizvodjac, kategorija) VALUES (?,?,?)";
    connection.query(
      query,
      [item.naziv, item.proizvodjac, item.kategorija],
      callback
    );
  }

  return {
    getItems: getItemsImpl,
    getItemById: getItemByIdImpl,
    deleteItemById: deleteItemByIdImpl,
    updateItemById: updateItemByIdImpl,
    addItem: addItemImpl,
  };
})();

module.exports = queries;
