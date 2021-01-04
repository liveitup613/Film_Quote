const db = require('./db');

class Device {
    static addDevice(body) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`INSERT devices SET ? `, body, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows.insertId);
            });
        });
    }

    static getDevices(userId) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`
                SELECT * FROM devices
                LEFT JOIN users
                ON devices.user_id = users.id 
                WHERE user_id = ${userId}
                ORDER BY users.user_type`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static getDevice(apNumber, a6Number) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`SELECT * FROM devices WHERE AP_number='${apNumber}' AND A6_number='${a6Number}'`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        })
    }

    static getDeviceNumbers(userId) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`SELECT A6_number FROM devices WHERE user_id = ${userId}`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static updateDevice(id, body) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`UPDATE devices SET ? WHERE id = ${id}`, body, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static updateStatus(apNumber, a6Number) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`UPDATE devices SET status='active' WHERE AP_number='${apNumber}' AND A6_number='${a6Number}'`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static deleteDevice(id) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`DELETE FROM devices WHERE id = ${id}`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static getDeviceId(uuid) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`SELECT id, user_id FROM devices WHERE uuid = '${uuid}'`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else {
                    console.log('rows[0]: ', rows);
                    resolve(rows);
                };
            });
        });
    }

    static getDevicesUnderAdmin(ids) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`
            SELECT devices.*, users.user_type, users.username
            FROM devices
            LEFT JOIN users
            ON devices.user_id = users.id
            WHERE user_id IN (${ids})
            ORDER BY users.user_type DESC`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            })
        });
    }
}

module.exports = Device;