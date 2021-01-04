const mysql = require('mysql');

const config = {
    host: 'localhost',
    user: 'root',
    password: 'M2xS4lxJDo',
    database: 'cellmate_db',
    multipleStatements: true
};

const localConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'quote',
    multipleStatements: true
};

const makeConnection = () => {
    const conn = mysql.createConnection(localConfig);

    return {
        connection() {
            return conn;
        },
        close() {
            return conn.end();
        }
    }
}

module.exports = makeConnection;