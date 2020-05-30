const connection = require("../database.js");

var queries = (function () {
  function getPurchasesImpl(callback) {
    connection.query("SELECT * FROM kupovine", function (
      error,
      results,
      fields
    ) {
      if (error) throw error;
      callback(results);
    });
  }

  function getPurchaseByIdImpl(id, callback) {
    connection.query("SELECT * FROM kupovine where id = ?", [id], function (
      error,
      results
    ) {
      if (error) throw error;
      callback(results[0]);
    });
  }

  function deletePurchaseByIdImpl(id, callback) {
    getPurchaseByIdImpl(id, (data) => {
      if (data === null) {
        callback(1);
      } else {
        let query = "DELETE FROM kupovine WHERE id=" + id;
        connection.query(query, callback);
      }
    });
  }

  function updatePurchaseByIdImpl(purchase, callback) {
    let query = "UPDATE kupovine SET ";
    let params = [];
    if (purchase.naziv !== undefined) {
      query += "naziv=?,";
      params.push(purchase.naziv);
    }
    //enables null to be passed
    if (purchase.proizvodjac !== undefined) {
      query += "proizvodjac=?,";
      params.push(purchase.proizvodjac);
    }
    if (purchase.kategorija !== undefined) {
      query += "kategorija=?";
      params.push(purchase.kategorija);
    }
    params.push(purchase.id);
    if (query.slice(-1) == ",") {
      query = query.substring(0, query.length - 1);
    }
    query += " WHERE id=?";
    connection.query(query, params, (error, results, fields) => {
      if (error) {
        callback(null, 1);
      } else {
        getPurchaseByIdImpl(purchase.id, callback);
      }
    });
  }

  function addPurchaseImpl(purchase, callback) {
    let query =
      "INSERT INTO kupovine (naziv, proizvodjac, kategorija) VALUES (?,?,?)";
    connection.query(
      query,
      [purchase.naziv, purchase.proizvodjac, purchase.kategorija],
      callback
    );
  }

  return {
    getPurchases: getPurchasesImpl,
    getPurchaseById: getPurchaseByIdImpl,
    deletePurchaseById: deletePurchaseByIdImpl,
    updatePurchaseById: updatePurchaseByIdImpl,
    addPurchase: addPurchaseImpl,
  };
})();

module.exports = queries;
