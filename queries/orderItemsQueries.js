const ordersQ = require("../queries/ordersQueries.js");
const supplierItemsQ = require("../queries/supplierItemsQueries.js");
const connection = require("../database.js");

var queries = (function () {
  function getOrderItemsByIdImpl(id, callback) {
    ordersQ.getOrderById(id, (error, data) => {
      if (error) {
        callback(error);
      } else if (data[0] == null) {
        callback({ error: "Order not found" });
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
        callback({ error: "Order not found" });
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
                    "SELECT * FROM proizvodi_skladista WHERE narudzba_id=? AND proizvod_id=?",
                    [orderId, itemId],
                    (error, results) => {
                      if (results[0] == null) {
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
    getOrderItemsById: getOrderItemsByIdImpl,
    addOrderItems: addOrderItemsImpl,
    deleteOrderItemsById: deleteOrderItemsByIdImpl,
    updateOrderItemsById: updateOrderItemsByIdImpl,
  };
})();

module.exports = queries;
