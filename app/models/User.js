const db = require('./db');

class User {
    static createUser(body) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`INSERT users SET ?`, body, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows.insertId);
            });
        });
    }

    static getUsers() {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`SELECT * FROM users WHERE active = 1`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static getUser(id) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`SELECT * FROM users WHERE id = ${id} AND active = 1`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static loginUser(username, password) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static deleteUser(id) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            let query = conn.query(`UPDATE users SET active = 0 WHERE id = '${id}'`, (error, rows) => {
                console.log('sql: ', query.sql);
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static deleteUsers(ids) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`UPDATE users SET active = 0 WHERE id in (${ids})`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static updateUser(id, body) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`UPDATE users SET ? WHERE id = ${id}`, body, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static checkUser(username, email) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`SELECT * FROM users WHERE username = '${username}' OR email = '${email}'`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static setHoldUser(id, apNumber) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`UPDATE users SET status='hold', AP_number='${apNumber}' WHERE id = ${id}`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static setHoldNormalUsers(ids, apNumber) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            let query = conn.query(`UPDATE users SET status = 'hold', AP_number = '${apNumber}' WHERE id IN (${ids})`, (error, rows) => {
                console.log(query.sql);
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static getHash(username) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`SELECT id, password FROM users WHERE username = '${username}'`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static resetPassword(email, password) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`UPDATE users SET password = '${password}' WHERE email = '${email}'`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static getKey(field) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`SELECT value FROM security_keys WHERE field = '${field}'`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows[0]);
            });
        });
    }

    static getAdminUsers() {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`SELECT * 
                        FROM users 
                        WHERE user_type = 2 AND active = 1`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static getSuperUsers() {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`SELECT users.*, user_relation.admin_id
                        FROM users 
                        LEFT JOIN user_relation
                        ON users.id = user_relation.super_id
                        WHERE user_type = 1 AND active = 1
                        GROUP BY id
                        ORDER BY id`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static getNormalUsers() {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`SELECT users.*, user_relation.admin_id, user_relation.super_id, user_relation.normal_id
                        FROM users
                        LEFT JOIN user_relation
                        ON users.id = user_relation.normal_id
                        WHERE user_type = 0 AND active = 1
                        ORDER BY users.id`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static getNormalUsersPerSuper(id) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`SELECT *
                    FROM (SELECT normal_id FROM user_relation WHERE super_id = ${id}) as A
                    LEFT JOIN users
                    ON A.normal_id = users.id
                    WHERE users.active = 1`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }
}

module.exports = User;