const db = require('./db');

class SuperNormal {
    static addNormal(body) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`INSERT super_normal SET ?`, body, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static getNormalUserIds(superId) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`SELECT normal_id FROM super_normal WHERE super_id = ${superId}`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }
}

module.exports = SuperNormal;