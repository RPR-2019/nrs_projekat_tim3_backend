var queries = (function () {
  function getCategoriesImpl(connection, callback) {
    connection.query("SELECT * FROM kategorije", function (
      error,
      results,
      fields
    ) {
      if (error) throw error;
      callback(results);
    });
  }

  function getCategoryByIdImpl(connection, id, callback) {
    connection.query("SELECT * FROM kategorije where id = ?", [id], function (
      error,
      results
    ) {
      if (error) throw error;
      callback(results[0]);
    });
  }

  function deleteCategoryByIdImpl(connection, id, callback) {
    getCategoryByIdImpl(connection, id, (data) => {
      if (data === undefined || data === null) {
        callback(1);
      } else {
        let query = "DELETE FROM kategorije WHERE id=" + id;
        connection.query(query, callback);
      }
    });
  }

  function updateCategoryByIdImpl(connection, category, callback) {
    let query = "UPDATE kategorije SET ";
    let params = [];
    if (category.naziv !== undefined) {
      query += "naziv=?,";
      params.push(category.naziv);
    }
    if (category.nadkategorija !== undefined) {
      query += "nadkategorija=?";
      params.push(category.nadkategorija);
    }
    params.push(category.id);
    if (query.slice(-1) == ",") {
      query = query.substring(0, query.length - 1);
    }
    query += " WHERE id=?";
    connection.query(query, params, (error, results, fields) => {
      if (error) {
        callback(null, 1);
      } else {
        getCategoryByIdImpl(connection, category.id, callback);
      }
    });
  }

  function addCategoryImpl(connection, category, callback) {
    let query = "INSERT INTO kategorije (naziv, nadkategorija) VALUES (?,?)";
    connection.query(query, [category.naziv, category.nadkategorija], callback);
  }

  return {
    getCategories: getCategoriesImpl,
    getCategoryById: getCategoryByIdImpl,
    deleteCategoryById: deleteCategoryByIdImpl,
    updateCategoryById: updateCategoryByIdImpl,
    addCategory: addCategoryImpl,
  };
})();

module.exports = queries;
