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

        for (var index in resultArray) {
            if (index != 0)
                searchQuery += ' or ';            
            searchQuery += "LOWER(Title) like '%" + resultArray[index] + "%' or LOWER(Reference) like '%"  + resultArray[index] + "%' or LOWER(Explanation) like '%" + resultArray[index] + "%'";
            
        }

        return new Promise((resolve, reject) => {
            conn.query(`select * from quotes where ${searchQuery}`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else {
                    rows.map((element, index) => {
                        var title_cnt = 0;
                        var exp_cnt = 0;
                        var ref_cnt = 0;
                        for(var index in resultArray) {
                            var filter = resultArray[index];

                            if (element['title'].toLowerCase().includes(filter))
                                title_cnt++;
                            if (element['reference'].toLowerCase().includes(filter))
                                ref_cnt++;
                            if (element['explanation'].toLowerCase().includes(filter))
                                exp_cnt++;
                        }

                        var max_cnt = Math.max(exp_cnt, title_cnt, ref_cnt);
                        element['contain_cnt'] = max_cnt;
                    });

                    rows.sort(function(a, b) {
                        return b['contain_cnt'] - a['contain_cnt'];
                    });
                    resolve(rows);
                }
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