var queries = (function () {
  function getPeopleImpl(connection, callback) {
    connection.query("SELECT * FROM osobe", function (error, results, fields) {
      if (error) throw error;
      callback(results);
    });
  }

  function getPersonByIdImpl(connection, id, callback) {
    connection.query("SELECT * FROM osobe where id = ?", [id], function (
      error,
      results
    ) {
      if (error) throw error;
      callback(null, results[0]);
    });
  }

  function deletePersonByIdImpl(connection, id, callback) {
    queries.getUserById(connection, id, (temp, data) => {
      if (data === undefined || data === null) {
        callback(1);
      } else {
        let query = "DELETE FROM osobe WHERE id=" + id;
        connection.query(query, callback);
      }
    });
  }

  function updatePersonByIdImpl(connection, person, callback) {
    let query = "UPDATE osobe SET ";
    let params = [];
    if (person.ime) {
      query += "ime=?,";
      params.push(person.ime);
    }
    if (person.prezime) {
      query += "prezime=?,";
      params.push(person.prezime);
    }
    if (person.telefon) {
      query += "telefon=?,";
      params.push(person.telefon);
    }
    if (person.datum_zaposljavanja) {
      query += "datum_zaposljavanja=?,";
      params.push(person.datum_zaposljavanja);
    }
    if (person.jmbg) {
      query += "JMBG=?,";
      params.push(person.JMBG);
    }
    if (person.naziv_lokacije) {
      query += "naziv_lokacije=?,";
      params.push(person.naziv_lokacije);
    }
    if (query.slice(-1) == ",") {
      query = query.substring(0, query.length - 1);
    }
    params.push(person.id);
    query += "WHERE id=?";
    connection.query(query, params, (error, results, fields) => {
      if (error) {
        console.log(error);
        throw error;
      }
      getPersonByIdImpl(connection, person.id, callback);
    });
  }

  return {
    getPeople: getPeopleImpl,
    getPersonById: getPersonByIdImpl,
    deletePersonById: deletePersonByIdImpl,
    updatePersonById: updatePersonByIdImpl,
  };
})();

module.exports = queries;
