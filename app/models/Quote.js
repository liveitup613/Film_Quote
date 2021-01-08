const db = require('./db');

class Quote {
    static searchQuote(searchText) {
        const conn = db().connection();
        var searchArray = searchText.split(" ");
        var resultArray = [];

        for (var index in searchArray) {
            if (searchArray[index] == '')
                continue;
            resultArray.push(searchArray[index])
        }

        var searchQuery = '';

        console.log(resultArray.length);

        for (var index in resultArray) {
            if (index != 0)
                searchQuery += ' or ';            
            searchQuery += "LOWER(Title) like '%" + resultArray[index] + "%' or LOWER(Reference) like '%"  + resultArray[index] + "%' or LOWER(Explanation) like '%" + resultArray[index] + "%'";
            
        }
        
        return new Promise((resolve, reject) => {
            conn.query(`select * from quotes where ${searchQuery}`, (error, rows) => {
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