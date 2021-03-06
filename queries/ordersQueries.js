const usersQ = require("../queries/usersQueries.js");
const warehousesQ = require("../queries/warehousesQueries.js");
const items = require("../queries/orderItemsQueries.js");
const connection = require("../database.js");

var queries = (function () {
  function getOrdersImpl(callback) {
    connection.query("SELECT * FROM narudzbe", function (
      error,
      results,
      fields
    ) {
      if (error) throw error;
      callback(results);
    });
  }

  function getOrderByIdImpl(id, callback) {
    connection.query("SELECT * FROM narudzbe where id = ?", [id], callback);
  }

  function deleteOrderByIdImpl(id, callback) {
    getOrderByIdImpl(id, (error, results) => {
      if (results[0] == null) {
        callback(1);
      } else {
        items.deleteAllOrderItemsById(id, (error) => {
          if (error) {
            callback(error);
          } else {
            let query = "DELETE FROM narudzbe WHERE id=" + id;
            connection.query(query, callback);
          }
        });
      }
    });
  }

  function updateOrderByIdImpl(order, callback) {
    let query = "UPDATE narudzbe SET ";
    let params = [];
    if (order.korisnicki_racun !== undefined) {
      query += "korisnicki_racun=?,";
      params.push(order.korisnicki_racun);
    }
    if (order.skladiste_id !== undefined) {
      query += "skladiste_id=?,";
      params.push(order.skladiste_id);
    }
    if (order.datum_isporuke !== undefined) {
      query += "datum_isporuke=?";
      params.push(order.datum_isporuke);
    }
    if (query.slice(-1) == ",") {
      query = query.substring(0, query.length - 1);
    }
    if (params.length === 0) {
      return;
    }
    params.push(order.id);
    query += " WHERE id=?";
    connection.query(query, params, (error, results, fields) => {
      if (error) {
        callback(error);
      } else getOrderByIdImpl(order.id, callback);
    });
  }

  function addOrderImpl(order, callback) {
    checkUserAndWarehouse(order, callback, () => {
      let query =
        "INSERT INTO narudzbe(korisnicki_racun, skladiste_id, datum_isporuke)" +
        "VALUES (?,?,?)";

      connection.query(
        query,
        [order.korisnicki_racun, order.skladiste_id, order.datum_isporuke],
        function (error, results, fields) {
          if (error) {
            callback({ error: "Item or warehouse not found" });
          } else {
            getOrderByIdImpl(results.insertId, callback);
          }
        }
      );
    });
  }

  function checkUserAndWarehouse(order, callback, done) {
    usersQ.getUserById(order.korisnicki_racun, (error, data) => {
      if (data == null) {
        callback(1);
      } else {
        warehousesQ.getWarehouseById(order.skladiste_id, (result) => {
          if (result == null) {
            callback(1);
          } else {
            done();
          }
        });
      }
    });
  }

  return {
    getOrders: getOrdersImpl,
    getOrderById: getOrderByIdImpl,
    deleteOrderById: deleteOrderByIdImpl,
    updateOrderById: updateOrderByIdImpl,
    addOrder: addOrderImpl,
  };
})();

module.exports = queries;
