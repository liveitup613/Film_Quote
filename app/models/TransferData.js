const db = require('./db');

class TransferData {
    static transferData(body) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`INSERT transferred_data SET ?`, body, (error, rows) => {
                db().close()
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }

    static getTransferredData(userId) {
        const conn = db().connection();

        return new Promise((resolve, reject) => {
            conn.query(`SELECT * FROM transferred_data WHERE to_user_id = ${userId}`, (error, rows) => {
                db().close();
                if (error) reject(error);
                else resolve(rows);
            });
        });
    }
}

module.exports = TransferData;