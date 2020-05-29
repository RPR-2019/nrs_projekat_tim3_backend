const ordersQ = require("../queries/ordersQueries.js");
const supplierItemsQ = require("../queries/supplierItemsQueries.js");
const connection = require("../database.js");

var queries = (function () {
  function getOrderItemsByIdImpl(id, callback) {
    ordersQ.getOrderById(id, (data) => {
      if (data == null) {
        callback(1);
      } else {
        connection.query(
          "SELECT * from artikli_narudzbe WHERE narudzba_id=?",
          [id],
          callback
        );
      }
    });
  }

  function addOrderItemsImpl(orderId, itemId, quantity, supplierId, callback) {
    checkAll(orderId, itemId, supplierId, callback, () => {
      connection.query(
        "INSERT INTO proizvodi_skladista(proizvod_id, kolicina, dobavljac_id, narudzba_id)" +
          " VALUES(?,?,?,?)",
        [itemId, quantity, supplierId, orderId],
        callback
      );
    });
  }

  function deleteOrderItemsByIdImpl(orderId, itemId, supplierId, callback) {
    checkAll(orderId, itemId, supplierId, callback, () => {
      connection.query(
        "DELETE FROM proizvodi_skladista " +
          "WHERE narudzba_id=? and proizvod_id=?",
        [orderId, itemId],
        callback
      );
    });
  }

  function updateOrderItemsByIdImpl(
    orderId,
    itemId,
    quantity,
    supplierId,
    callback
  ) {
    checkAll(orderId, itemId, supplierId, callback, () => {
      connection.query(
        "UPDATE proizvodi_skladista SET kolicina=?" +
          "WHERE narudzba_id=? AND proizvod_id=? AND dobavljac_id=?",
        [quantity, orderId, itemId, supplierId],
        callback
      );
    });
  }

  function checkAll(orderId, itemId, supplierId, callback, resolve) {
    ordersQ.getOrderById(orderId, (data) => {
      if (data == null) {
        callback(1);
      } else {
        itemQ.getItemById(itemId, (data) => {
          if (data == null) {
            callback(1);
          } else {
            supplierItemsQ.getSupplierItemById(
              supplierId,
              itemId,
              (error, data) => {
                if (error) {
                  callback(error);
                } else if (data == null) {
                  callback(1);
                } else {
                  connection.query(
                    "SELECT * FROM proizvodi_skladista WHERE narudzba_id=? AND proizvod_id=?",
                    [orderId, itemId],
                    (error, results) => {
                      if (results[0] == null) {
                        callback(2);
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
    getOrderItemsById: getOrderItemsByIdImpl,
    addOrderItems: addOrderItemsImpl,
    deleteOrderItemsById: deleteOrderItemsByIdImpl,
  };
})();

module.exports = queries;
