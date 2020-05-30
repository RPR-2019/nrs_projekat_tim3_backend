const purchasesQ = require("../queries/purchasesQueries.js");
const supplierItemsQ = require("../queries/supplierItemsQueries.js");
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
          "SELECT * from artikli_narudzbe WHERE narudzba_id=?",
          [id],
          callback
        );
      }
    });
  }

  function addPurchaseItemsImpl(purchaseId, itemId, quantity, callback) {
    checkAll(purchaseId, itemId, supplierId, callback, () => {
      connection.query(
        "INSERT INTO artikli_narudzbe(proizvod_id, kolicina, dobavljac_id, narudzba_id)" +
          " VALUES(?,?,?,?)",
        [itemId, quantity, supplierId, purchaseId],
        callback
      );
    });
  }

  function deletePurchaseItemsByIdImpl(
    purchaseId,
    itemId,
    supplierId,
    callback
  ) {
    checkAll(purchaseId, itemId, supplierId, callback, () => {
      connection.query(
        "DELETE FROM artikli_narudzbe " +
          "WHERE narudzba_id=? and proizvod_id=?",
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
          "DELETE FROM artikli_narudzbe " + "WHERE narudzba_id=?",
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
    checkAll(purchaseId, itemId, supplierId, callback, () => {
      connection.query(
        "UPDATE artikli_narudzbe SET kolicina=?" +
          "WHERE narudzba_id=? AND proizvod_id=? AND dobavljac_id=?",
        [quantity, purchaseId, itemId, supplierId],
        callback
      );
    });
  }

  function checkAll(purchaseId, itemId, supplierId, callback, resolve) {
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
            supplierItemsQ.getSupplierItemById(
              supplierId,
              itemId,
              (error, data) => {
                if (error) {
                  callback(error);
                } else if (data == null) {
                  callback({ error: "Supplier not found" });
                } else {
                  connection.query(
                    "SELECT * FROM proizvodi_dobavljaca WHERE dobavljac_id=? AND proizvod_id=?",
                    [supplierId, itemId],
                    (error, results) => {
                      if (error) {
                        callback(error);
                        return;
                      } else if (results[0] == null) {
                        callback({
                          error: "Supplier doesn't supply that item",
                        });
                      } else {
                        resolve();
                      }
                    }
                  );
                }
              }
            );
          }
        });
      }
    });
  }

  return {
    getPurchaseItemsById: getPurchaseItemsByIdImpl,
    addPurchaseItems: addPurchaseItemsImpl,
    deletePurchaseItemsById: deletePurchaseItemsByIdImpl,
    updatePurchaseItemsById: updatePurchaseItemsByIdImpl,
    deleteAllPurchaseItemsById: deleteAllPurchaseItemsByIdImpl,
  };
})();

module.exports = queries;
