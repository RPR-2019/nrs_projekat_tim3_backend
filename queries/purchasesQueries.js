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
    connection.query("SELECT * FROM kupovine where id = ?", [id], callback);
  }

  function deletePurchaseByIdImpl(id, callback) {
    getPurchaseByIdImpl(id, (error, data) => {
      if (data == null) {
        callback(1);
      } else {
        //TODO cascade delete
        let query = "DELETE FROM kupovine WHERE id=" + id;
        connection.query(query, callback);
      }
    });
  }

  function updatePurchaseByIdImpl(purchase, callback) {
    let query = "UPDATE kupovine SET ";
    let params = [];
    if (purchase.stanje_id !== undefined) {
      query += "stanje_id=?,";
      params.push(purchase.stanje_id);
    }
    //enables null to be passed
    if (purchase.korisnicki_racun !== undefined) {
      query += "korisnicki_racun=?,";
      params.push(purchase.korisnicki_racun);
    }
    params.push(purchase.id);
    if (query.slice(-1) == ",") {
      query = query.substring(0, query.length - 1);
    }
    query += " WHERE id=?";
    connection.query(query, params, (error, results, fields) => {
      if (error) {
        callback(error);
      } else {
        getPurchaseByIdImpl(purchase.id, callback);
      }
    });
  }

  function addPurchaseImpl(purchase, callback) {
    let query =
      "INSERT INTO kupovine (korisnicki_racun, stanje_id) VALUES (?,?)";
    connection.query(
      query,
      [purchase.korisnicki_racun, purchase.stanje_id],
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
