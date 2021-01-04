const db = require('./db');

class Quote {
    static searchQuote(searchText) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`select * from quotes where LOWER(Title) like '%${searchText}%' or LOWER(Reference) like '%${searchText}%' or LOWER(Explanation) like '%${searchText}%'`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static getQuote(id) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`select * from quotes where id = ${id}`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            })
        })
    }
}

module.exports = Quote;