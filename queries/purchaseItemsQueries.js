const purchasesQ = require("../queries/purchasesQueries.js");
const itemQ = require("../queries/itemsQueries.js");
const connection = require("../database.js");

var queries = (function () {
  function getPurchaseItemsByIdImpl(id, callback) {
    purchasesQ.getPurchaseById(id, (error, data) => {
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
    checkAll(purchaseId, itemId, supplierId, callback, () => {
      connection.query(
        "INSERT INTO proizvodi_kupovine(proizvod_id, kolicina, kupovina_id)" +
          " VALUES(?,?,?)",
        [itemId, quantity, purchaseId],
        callback
      );
    });
  }

  function deletePurchaseItemByIdImpl(purchaseId, itemId, callback) {
    checkAll(purchaseId, itemId, callback, () => {
      connection.query(
        "DELETE FROM proizvodi_kupovine " +
          "WHERE kupovina_id=? and proizvod_id=?",
        [purchaseId, itemId],
        callback
      );
    });
  }
  function deleteAllPurchaseItemsByIdImpl(purchaseId, callback) {
    purchasesQ.getPurchaseById(purchaseId, (error, data) => {
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

  function updatePurchaseItemsByIdImpl(
    purchaseId,
    itemId,
    quantity,
    supplierId,
    callback
  ) {
    checkAll(purchaseId, itemId, callback, () => {
      connection.query(
        "UPDATE proizvodi_kupovine SET kolicina=?" +
          "WHERE kupovina_id=? AND proizvod_id=? AND dobavljac_id=?",
        [quantity, purchaseId, itemId],
        callback
      );
    });
  }

  function checkAll(purchaseId, itemId, callback, resolve) {
    purchasesQ.getPurchaseById(purchaseId, (error, data) => {
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
            resolve();
          }
        });
      }
    });
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
