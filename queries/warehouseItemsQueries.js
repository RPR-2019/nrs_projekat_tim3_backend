const warehousesQ = require("../queries/warehousesQueries.js");
const itemQ = require("../queries/itemsQueries.js");
const connection = require("../database.js");

var queries = (function () {
  function getWarehouseItemsByIdImpl(id, callback) {
    warehousesQ.getWarehouseById(id, (data) => {
      if (data == null) {
        callback(null, 1);
      } else {
        connection.query(
          "SELECT ps.kolicina, ps.proizvod_id, p.naziv as 'naziv_proizvoda', p.proizvodjac," +
            " p.kategorija, k.naziv as 'naziv_kategorije', s.naziv as 'naziv_skladista', ps.skladiste_id" +
            " FROM proizvodi_skladista ps" +
            " INNER JOIN proizvodi p ON p.id = ps.proizvod_id " +
            " INNER JOIN skladista s ON s.id = ps.skladiste_id " +
            " INNER JOIN kategorije k ON p.kategorija = k.id WHERE ps.skladiste_id=?",
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
    warehousesQ.getWarehouseById(warehouseId, (data) => {
      if (data == null) {
        callback(1);
      } else {
        itemQ.getItemById(itemId, (data) => {
          if (data == null) {
            callback(1);
          } else {
            connection.query(
              "INSERT INTO proizvodi_skladista(proizvod_id, kolicina, skladiste_id)" +
                " VALUES(?,?,?)",
              [itemId, quantity, warehouseId],
              callback
            );
          }
        });
      }
    });
  }

  function deleteWarehouseItemsByIdImpl(
    connection,
    warehouseId,
    itemId,
    callback
  ) {
    warehousesQ.getWarehouseById(warehouseId, (data) => {
      if (data == null) {
        callback(1);
      } else {
        itemQ.getItemById(itemId, (data) => {
          if (data == null) {
            callback(1);
          } else {
            connection.query(
              "SELECT * FROM proizvodi_skladista WHERE skladiste_id=? AND proizvod_id=?",
              [warehouseId, itemId],
              (error, results) => {
                if (results[0] == null) {
                  callback(2);
                } else {
                  connection.query(
                    "DELETE FROM proizvodi_skladista " +
                      "WHERE skladiste_id=? and proizvod_id=?",
                    [warehouseId, itemId],
                    callback
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
    getWarehouseItemsById: getWarehouseItemsByIdImpl,
    addWarehouseItemsById: addWarehouseItemsByIdImpl,
    deleteWarehouseItemsById: deleteWarehouseItemsByIdImpl,
  };
})();

module.exports = queries;
