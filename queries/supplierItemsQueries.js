const suppliersQ = require("../queries/suppliersQueries.js");
const itemQ = require("../queries/itemsQueries.js");
const connection = require("../database.js");

var queries = (function () {
  function getSupplierItemsByIdImpl(id, callback) {
    suppliersQ.getSupplierById(id, (data) => {
      if (data == null) {
        callback(1);
      } else {
        connection.query(
          "SELECT pd.proizvod_id, p.naziv as 'naziv_proizvoda', p.proizvodjac," +
            " p.kategorija, d.naziv as 'naziv_dobavljaca', pd.dobavljac_id" +
            " FROM proizvodi_dobavljaca pd" +
            " INNER JOIN proizvodi p ON p.id = pd.proizvod_id " +
            " INNER JOIN dobavljaci d ON d.id = pd.dobavljac_id " +
            " WHERE pd.dobavljac_id=?",
          [id],
          callback
        );
      }
    });
  }

  function addSupplierItemsByIdImpl(supplierId, itemId, callback) {
    suppliersQ.getSupplierById(supplierId, (data) => {
      if (data == null) {
        callback(1);
      } else {
        itemQ.getItemById(itemId, (data) => {
          if (data == null) {
            callback(1);
          } else {
            connection.query(
              "INSERT INTO proizvodi_dobavljaca(proizvod_id, dobavljac_id)" +
                " VALUES(?,?)",
              [itemId, supplierId],
              callback
            );
          }
        });
      }
    });
  }

  function deleteSupplierItemsByIdImpl(
    connection,
    supplierId,
    itemId,
    callback
  ) {
    suppliersQ.getSupplierById(supplierId, (data) => {
      if (data == null) {
        callback(1);
      } else {
        itemQ.getItemById(itemId, (data) => {
          if (data == null) {
            callback(1);
          } else {
            connection.query(
              "SELECT * FROM proizvodi_dobavljaca WHERE dobavljac_id=? AND proizvod_id=?",
              [supplierId, itemId],
              (error, results) => {
                if (results[0] == null) {
                  callback(2);
                } else {
                  connection.query(
                    "DELETE FROM proizvodi_dobavljaca " +
                      "WHERE dobavljac_id=? and proizvod_id=?",
                    [supplierId, itemId],
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

  function getSupplierItemByIdImpl(supplierId, itemId, callback) {
    suppliersQ.getSupplierById(supplierId, (data) => {
      if (data == null) {
        callback(1);
      } else {
        itemQ.getItemById(itemId, (data) => {
          if (data == null) {
            callback(1);
          } else {
            connection.query(
              "SELECT * FROM proizvodi_dobavljaca" +
                " WHERE dobavljac_id=? AND proizvod_id=?",
              [supplierId, itemId],
              callback
            );
          }
        });
      }
    });
  }

  return {
    getSupplierItemsById: getSupplierItemsByIdImpl,
    addSupplierItemsById: addSupplierItemsByIdImpl,
    deleteSupplierItemsById: deleteSupplierItemsByIdImpl,
    getSupplierItemById: getSupplierItemByIdImpl,
  };
})();

module.exports = queries;
