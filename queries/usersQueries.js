const connection = require("../database.js");

var queries = (function () {
  async function getUsersImpl(callback) {
    connection.query("SELECT * FROM korisnicki_racuni", function (
      error,
      results,
      fields
    ) {
      if (error) throw error;
      callback(results);
    });
  }

  function getUserByIdImpl(id, callback) {
    connection.query(
      "SELECT * FROM korisnicki_racuni where id = ?",
      [id],
      function (error, results) {
        if (error) throw error;
        callback(null, results[0]);
      }
    );
  }

  function getPersonByIdImpl(id, callback) {
    connection.query(
      "SELECT k.pravo_pristupa, k.email, o.ime, o.prezime, o.telefon, o.datum_zaposljavanja, o.JMBG, o.naziv_lokacije FROM korisnicki_racuni k RIGHT JOIN osobe o ON (o.id= k.osoba_id) where k.id = ?",
      [id],
      function (error, results) {
        if (error) throw error;
        callback(results[0]);
      }
    );
  }

  function deleteUserByIdImpl(id, callback) {
    queries.getUserById(id, (temp, data) => {
      if (data === undefined || data === null) {
        callback(1);
      } else {
        let query = "DELETE FROM korisnicki_racuni WHERE id=" + id;
        connection.query(query, callback);
      }
    });
  }

  function updatePersonByIdImpl(params, callback) {
    let query =
      "UPDATE osobe SET ime=?, prezime=?, telefon=?, datum_zaposljavanja=?, JMBG=?, naziv_lokacije=? WHERE id=?";
    connection.query(query, params, callback);
  }

  function updateUserByIdImpl(user, callback) {
    let query = "UPDATE korisnicki_racuni SET ";
    let params = [];
    if (user.password) {
      query += "password=?,";
      params.push(user.password);
    }
    if (user.email) {
      query += "email=?,";
      params.push(user.email);
    }
    if (user.pravo_pristupa) {
      query += "pravo_pristupa=?,";
      params.push(user.pravo_pristupa);
    }
    if (query.slice(-1) == ",") {
      query = query.substring(0, query.length - 1);
    }
    params.push(user.id);
    query += "WHERE id=?";
    connection.query(query, params, (error, results, fields) => {
      if (error) {
        console.log(error);
        throw error;
      }
      getUserByIdImpl(user.id, callback);
    });
  }

  return {
    getUsers: getUsersImpl,
    getUserById: getUserByIdImpl,
    getPersonById: getPersonByIdImpl,
    deleteUserById: deleteUserByIdImpl,
    updateUserById: updateUserByIdImpl,
  };
})();

module.exports = queries;
