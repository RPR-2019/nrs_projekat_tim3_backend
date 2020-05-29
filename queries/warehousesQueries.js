const connection = require("../database.js");

var queries = (function () {
  function getWarehousesImpl(callback) {
    connection.query("SELECT * FROM skladista", function (
      error,
      results,
      fields
    ) {
      if (error) throw error;
      callback(results);
    });
  }

  function getWarehouseByIdImpl(id, callback) {
    connection.query("SELECT * FROM skladista where id = ?", [id], function (
      error,
      results
    ) {
      if (error) throw error;
      callback(results[0]);
    });
  }

  function deleteWarehouseByIdImpl(id, callback) {
    getWarehouseByIdImpl(id, (data) => {
      if (data === undefined || data === null) {
        callback(1);
      } else {
        let query = "DELETE FROM skladista WHERE id=" + id;
        connection.query(query, callback);
      }
    });
  }

  function updateWarehouseByIdImpl(warehouse, callback) {
    let query = "UPDATE skladista SET ";
    let params = [];
    if (warehouse.naziv !== undefined) {
      query += "naziv=?,";
      params.push(warehouse.naziv);
    }
    //enables null to be passed
    if (warehouse.naziv_lokacije !== undefined) {
      query += "naziv_lokacije=?";
      params.push(warehouse.naziv_lokacije);
    }
    params.push(warehouse.id);
    if (query.slice(-1) == ",") {
      query = query.substring(0, query.length - 1);
    }
    query += " WHERE id=?";
    connection.query(query, params, (error, results, fields) => {
      if (error) {
        callback(null, 1);
      } else {
        getWarehouseByIdImpl(warehouse.id, callback);
      }
    });
  }

  function addWarehouseImpl(warehouse, callback) {
    let query = "INSERT INTO skladista (naziv, naziv_lokacije) VALUES (?,?)";
    connection.query(
      query,
      [warehouse.naziv, warehouse.naziv_lokacije],
      callback
    );
  }

  return {
    getWarehouses: getWarehousesImpl,
    getWarehouseById: getWarehouseByIdImpl,
    deleteWarehouseById: deleteWarehouseByIdImpl,
    updateWarehouseById: updateWarehouseByIdImpl,
    addWarehouse: addWarehouseImpl,
  };
})();

module.exports = queries;
