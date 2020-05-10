var queries = function () {
    async function getUsersImpl(connection, callback) {
        connection.query('SELECT * FROM korisnicki_racuni', function (error, results, fields) {
            if (error) throw error;
            callback(results);
        });
    }

    function getUserByIdImpl(connection, id, callback) {
        connection.query(
            'SELECT * FROM korisnicki_racuni where id = ?',
            [id],
            function (error, results) {
                if (error) throw error;
                callback(null, results[0]);

            });
    }

    return {
        getUsers: getUsersImpl,
        getUserById: getUserByIdImpl
    }
}();

module.exports = queries;