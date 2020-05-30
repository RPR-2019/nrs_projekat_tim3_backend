const itemQ = require("../queries/itemsQueries.js");
const connection = require("../database.js");

var queries = (function () {
  function getPurchaseItemsByIdImpl(id, callback) {
    getPurchaseById(id, (error, data) => {
      if (error) {
        callback(error);
      } else if (data[0] == null) {
        callback({ error: "Purchase not found" });
      } else {
        connection.query(
          "SELECT * from proizvodi_kupovine WHERE kupovina_id=?",
          [id],
          callback
        );
      }
    });
  }

  function addPurchaseItemsImpl(purchaseId, itemId, quantity, callback) {
    checkAll(purchaseId, itemId, callback, (itemExists) => {
      if (!itemExists) {
        connection.query(
          "INSERT INTO proizvodi_kupovine(proizvod_id, kolicina, kupovina_id)" +
            " VALUES(?,?,?)",
          [itemId, quantity, purchaseId],
          callback
        );
      } else {
        callback({ error: "Purchase already has that item" });
      }
    });
  }

  function deletePurchaseItemByIdImpl(purchaseId, itemId, callback) {
    checkAll(purchaseId, itemId, callback, (itemExists) => {
      if (itemExists) {
        connection.query(
          "DELETE FROM proizvodi_kupovine " +
            "WHERE kupovina_id=? and proizvod_id=?",
          [purchaseId, itemId],
          callback
        );
      } else {
        callback({ error: "Purchase doesn't have that item" });
      }
    });
  }
  function deleteAllPurchaseItemsByIdImpl(purchaseId, callback) {
    getPurchaseById(purchaseId, (error, data) => {
      if (error) {
        callback(error);
      } else if (data[0] == null) {
        callback({ error: "Purchase not found" });
      } else {
        connection.query(
          "DELETE FROM proizvodi_kupovine WHERE kupovina_id=?",
          [purchaseId],
          callback
        );
      }
    });
  }

  function updatePurchaseItemsByIdImpl(purchaseId, itemId, quantity, callback) {
    checkAll(purchaseId, itemId, callback, (itemExists) => {
      if (itemExists) {
        connection.query(
          "UPDATE proizvodi_kupovine SET kolicina=?" +
            "WHERE kupovina_id=? AND proizvod_id=?",
          [quantity, purchaseId, itemId],
          callback
        );
      } else {
        callback({ error: "Purchase doesn't have that item" });
      }
    });
  }

  function checkAll(purchaseId, itemId, callback, resolve) {
    getPurchaseById(purchaseId, (error, data) => {
      if (error) {
        callback(error);
        return;
      } else if (data[0] == null) {
        callback({ error: "Purchase not found" });
      } else {
        itemQ.getItemById(itemId, (data) => {
          if (data == null) {
            callback({ error: "Item not found" });
          } else {
            connection.query(
              "SELECT * FROM proizvodi_kupovine WHERE kupovina_id=? AND proizvod_id=?",
              [purchaseId, itemId],
              (error, results) => {
                if (error) {
                  callback(error);
                  return;
                } else if (results[0] == null) {
                  resolve(0);
                } else {
                  resolve(1);
                }
              }
            );
          }
        });
      }
    });
  }

  function getPurchaseById(id, callback) {
    connection.query("SELECT * FROM kupovine where id = ?", [id], callback);
  }

  return {
    getPurchaseItemsById: getPurchaseItemsByIdImpl,
    addPurchaseItems: addPurchaseItemsImpl,
    deletePurchaseItemById: deletePurchaseItemByIdImpl,
    updatePurchaseItemsById: updatePurchaseItemsByIdImpl,
    deleteAllPurchaseItemsById: deleteAllPurchaseItemsByIdImpl,
  };
})();

module.exports = queries;
