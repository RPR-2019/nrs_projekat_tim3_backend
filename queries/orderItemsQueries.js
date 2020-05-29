const ordersQ = require("../queries/ordersQueries.js");
const supplierItemsQ = require("../queries/supplierItemsQueries.js");
const connection = require("../database.js");

var queries = (function () {
  function getOrderItemsByIdImpl(id, callback) {
    ordersQ.getOrderById(id, (data) => {
      if (data == null) {
        callback(null, 1);
      } else {
        connection.query(
          "SELECT * from artikli_narudzbe WHERE narudzba_id=?",
          [id],
          function (error, results, fields) {
            if (error) throw error;
            callback(results);
          }
        );
      }
    });
  }

  function addOrderItemsImpl(orderId, itemId, quantity, supplierId, callback) {
    ordersQ.getOrderById(orderId, (data) => {
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
                "INSERT INTO proizvodi_skladista(proizvod_id, kolicina, dobavljac_id, narudzba_id)" +
                  " VALUES(?,?,?,?)",
                [itemId, quantity, supplierId, orderId],
                callback
              );
            }
          }
        );
      }
    });
  }

  function deleteOrderItemsByIdImpl(orderId, itemId, supplierId, callback) {
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
                    "SELECT * FROM proizvodi_skladista WHERE skladiste_id=? AND proizvod_id=?",
                    [orderId, itemId],
                    (error, results) => {
                      if (results[0] == null) {
                        callback(2);
                      } else {
                        connection.query(
                          "DELETE FROM proizvodi_skladista " +
                            "WHERE skladiste_id=? and proizvod_id=?",
                          [orderId, itemId],
                          callback
                        );
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
