const warehousesQ = require("../queries/warehousesQueries.js");
const itemQ = require("../queries/itemsQueries.js");

var queries = (function () {
  function getWarehouseItemsByIdImpl(connection, id, callback) {
    q.getWarehouseById(connection, id, (data) => {
      if (data == null) {
        callback(null, 1);
      } else {
        connection.query(
          "SELECT ps.kolicina, p.naziv, p.proizvodjac, p.kategorija FROM proizvodi_skladista ps" +
            " INNER JOIN proizvodi p ON p.id = ps.proizvod_id  WHERE skladiste_id=?",
          [id],
          function (error, results, fields) {
            if (error) throw error;
            callback(results);
          }
        );
      }
    });
  }

  function addWarehouseItemsByIdImpl(
    connection,
    warehouseId,
    itemId,
    quantity,
    callback
  ) {
    warehousesQ.getWarehouseById(connection, id, (data) => {
      if (data == null) {
        callback(1);
      } else {
        itemQ.getItemById(connection, itemId, (data) => {
          if (data == null) {
            callback(1);
          } else {
            connection.query(
              "INSERT INTO proizvodi_skladista(proizvoid_id, kolicina) " +
                " VALUES(?,?,?)  WHERE skladiste_id=?",
              [itemId, quantity, warehouseId],
              callback
            );
          }
        });
      }
    });
  }

  return {
    getWarehouseItemsById: getWarehouseItemsByIdImpl,
    addWarehouseItemsById: addWarehouseItemsByIdImpl,
  };
})();

module.exports = queries;
