const connection = require("../database.js");

var queries = (function () {
  function getManufacturersImpl(callback) {
    connection.query("SELECT * FROM proizvodjaci", function (
      error,
      results,
      fields
    ) {
      if (error) throw error;
      callback(results);
    });
  }

  function getManufacturerByIdImpl(id, callback) {
    connection.query("SELECT * FROM proizvodjaci where id = ?", [id], function (
      error,
      results
    ) {
      if (error) throw error;
      callback(results[0]);
    });
  }

  function deleteManufacturerByIdImpl(id, callback) {
    getManufacturerByIdImpl(id, (data) => {
      if (data === undefined || data === null) {
        callback(1);
      } else {
        let query = "DELETE FROM proizvodjaci WHERE id=" + id;
        connection.query(query, callback);
      }
    });
  }

  function updateManufacturerByIdImpl(manufacturer, callback) {
    let query = "UPDATE proizvodjaci SET naziv=? WHERE id=?";
    let params = [];
    params.push(manufacturer.naziv);
    params.push(manufacturer.id);
    connection.query(query, params, (error, results, fields) => {
      if (error) {
        console.log(error);
        throw error;
      }
      getManufacturerByIdImpl(manufacturer.id, callback);
    });
  }

  function addManufacturerImpl(manufacturer, callback) {
    let query = "INSERT INTO proizvodjaci(naziv)" + "VALUES (?)";
    connection.query(query, [manufacturer.naziv], function (
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
        getManufacturerByIdImpl(results.insertId, (data) => {
          callback(data);
        });
      }
    });
  }

  return {
    getManufacturers: getManufacturersImpl,
    getManufacturerById: getManufacturerByIdImpl,
    deleteManufacturerById: deleteManufacturerByIdImpl,
    updateManufacturerById: updateManufacturerByIdImpl,
    addManufacturer: addManufacturerImpl,
  };
})();

module.exports = queries;
