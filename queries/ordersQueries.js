var queries = (function () {
  function getOrdersImpl(connection, callback) {
    connection.query("SELECT * FROM narudzbe", function (
      error,
      results,
      fields
    ) {
      if (error) throw error;
      callback(results);
    });
  }

  function getOrderByIdImpl(connection, id, callback) {
    connection.query("SELECT * FROM narudzbe where id = ?", [id], function (
      error,
      results
    ) {
      if (error) throw error;
      callback(null, results[0]);
    });
  }

  function deleteOrderByIdImpl(connection, id, callback) {
    getOrderByIdImpl(connection, id, (temp, data) => {
      if (data === undefined || data === null) {
        callback(1);
      } else {
        let query = "DELETE FROM narudzbe WHERE id=" + id;
        connection.query(query, callback);
      }
    });
  }

  function updateOrderByIdImpl(connection, order, callback) {
    let query = "UPDATE narudzbe SET ";
    let params = [];
    if (order.korisnicki_racun) {
      query += "korisnicki_racun=?,";
      params.push(order.korisnicki_racun);
    }
    if (order.skladiste_id) {
      query += "skladiste_id=?,";
      params.push(order.skladiste_id);
    }
    /*if (order.datum_kreiranja) {
      query += "datum_kreiranja=?,";
      params.push(order.datum_kreiranja);
    }*/
    if (order.datum_isporuke) {
      query += "datum_isporuke=?";
      params.push(order.datum_isporuke);
    }
    if (query.slice(-1) == ",") {
      query = query.substring(0, query.length - 1);
    }
    params.push(order.id);
    query += " WHERE id=?";
    connection.query(query, params, (error, results, fields) => {
      if (error) {
        console.log(error);
        throw error;
      }
      getOrderByIdImpl(connection, order.id, callback);
    });
  }

  function addOrderImpl(connection, order, callback) {
    /*if (order.datum_kreiranja) {
      query += "datum_kreiranja=?,";
      params.push(order.datum_kreiranja);
    }*/
    let query =
      "INSERT INTO narudzbe(korisnicki_racun, skladiste_id, datum_isporuke)" +
      "VALUES (?,?,?)";
    connection.query(
      query,
      [order.korisnicki_racun, order.skladiste_id, order.datum_isporuke],
      function (error, results, fields) {
        if (error) {
          callback(error);
        } else {
          getOrderByIdImpl(connection, results.insertId, callback);
        }
      }
    );
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
