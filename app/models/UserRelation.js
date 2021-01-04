const db = require('./db');

class UserRelation {
    static add(params) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`INSERT user_relation SET ?`, params, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static get(superId) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`SELECT * FROM user_relation WHERE super_id = ${superId}`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static getSuperAndNormalUsers(adminId) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`SELECT * FROM user_relation WHERE admin_id = ${adminId}`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static getSuperUsersUnderAdmin(adminId) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`SELECT super_id FROM user_relation WHERE admin_id = ${adminId} AND super_id != 0 GROUP BY super_id`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }
}

module.exports = UserRelation;