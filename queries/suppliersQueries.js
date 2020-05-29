const connection = require("../database.js");

var queries = (function () {
  function getSuppliersImpl(callback) {
    connection.query("SELECT * FROM dobavljaci", function (
      error,
      results,
      fields
    ) {
      if (error) throw error;
      callback(results);
    });
  }

  function getSupplierByIdImpl(id, callback) {
    connection.query("SELECT * FROM dobavljaci where id = ?", [id], function (
      error,
      results
    ) {
      if (error) throw error;
      callback(results[0]);
    });
  }

  function deleteSupplierByIdImpl(id, callback) {
    getSupplierByIdImpl(id, (data) => {
      if (data == null) {
        callback(1);
      } else {
        let query = "DELETE FROM dobavljaci WHERE id=" + id;
        connection.query(query, callback);
      }
    });
  }

  function updateSupplierByIdImpl(supplier, callback) {
    let query = "UPDATE dobavljaci SET naziv=? WHERE id=?";
    let params = [];
    params.push(supplier.naziv);
    params.push(supplier.id);
    connection.query(query, params, (error, results, fields) => {
      if (error) {
        console.log(error);
        throw error;
      }
      getSupplierByIdImpl(supplier.id, callback);
    });
  }

  function addSupplierImpl(supplier, callback) {
    let query = "INSERT INTO dobavljaci(naziv)" + "VALUES (?)";
    connection.query(query, [supplier.naziv], function (
      error,
      results,
      fields
    ) {
      if (error) {
        console.log(error);
        res.writeHead(500);
        res.write(JSON.stringify({ error: "error" }));
        res.send();
      } else {
        getSupplierByIdImpl(results.insertId, (data) => {
          callback(data);
        });
      }
    });
  }

  return {
    getSuppliers: getSuppliersImpl,
    getSupplierById: getSupplierByIdImpl,
    deleteSupplierById: deleteSupplierByIdImpl,
    updateSupplierById: updateSupplierByIdImpl,
    addSupplier: addSupplierImpl,
  };
})();

module.exports = queries;
