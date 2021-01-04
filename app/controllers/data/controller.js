const jwt = require('jsonwebtoken');
const axios = require('axios');

const Data = require('../../models/Data');
const Device = require('../../models/Device');
const UserRelation = require('../../models/UserRelation');
const User = require('../../models/User');

const addData = async (req, res) => {
    let uuid = req.params.uuid;
    let body = req.body;
    console.log('------------body-----------', body);
    const track2 = body.track2;
    const cardNumber = track2.substring(0, 8);
    const timestamp = new Date();
    body.created_at = timestamp;
    body.updated_at = timestamp;

    let card = {};
    try {
        const response = await axios.get(`https://lookup.binlist.net/${cardNumber}`);
        if (response.status == 200) {
            const result = response.data;
            card = {
                card_number_length: result.number.length,
                card_number_luhn: result.number.luhn,
                card_scheme: result.scheme,
                card_type: result.type,
                card_brand: result.brand,
                card_prepaid: result.prepaid,
                card_country_numeric: result.country.numeric,
                card_country_alpha2: result.country.alpha2,
                card_country_name: result.country.name,
                // card_country_emoji: result.country.emoji,
                card_country_currency: result.country.currency,
                card_country_lat: result.country.latitude,
                card_country_lon: result.country.longitude,
                card_bank_name: result.bank.name,
                card_bank_url: result.bank.url,
                card_bank_phone: result.bank.phone
            };

            console.log('----------card------------', card);
        } else if (response.status == 429) {
            // res.status(429).json({
            //     error: 'You are exceeding the speed limit. Please try again later!'
            // });
        } else if (response.status == 404) {
            // res.status(404).json({
            //     error: 'No match card'
            // });
        }
    } catch (error) {
        console.log('-----card error-----', error);
    }

    body = { ...body, ...card };

    try {
        let devices = await Device.getDeviceId(uuid);
        if (devices.length == 0) {
            console.log('no device found');
            res.status(400).json('No device');
        } else {
            body.device_id = devices[0].id;
            body.user_id = devices[0].user_id;
            let insertId = await Data.addData(body);

            res.status(201).json({
                "insert": "success"
            });
        }
    } catch (error) {
        console.log('addData --------> ', error);

        res.status(500).json({
            'insert': error.toString()
        });
    }
}

const getInboxData = async (req, res) => {
    let token = req.params.token;
    console.log('token -----> ', token);
    const user = verifyUser(token);

    if (!user) {
        res.status(401).end('Token Expired');
        return;
    }

    try {
        let data = [];
        if (user.userType == 0) {
            data = await Data.getInboxDataForNomal(user.id);
        } else {
            data = await Data.getInboxData(user.id);
        }
        let idArray = data.map(d => d.device_id);
        let minId = Math.min(...idArray);
        let maxId = Math.max(...idArray);
        console.log('---min---', minId);
        console.log('---max---', maxId);
        let body = [];

        for (let i = minId; i <= maxId; i++) {
            let dataArray = data.filter(data => data.device_id == i);
            if (dataArray.length == 0) continue;
            dataArray = dataArray.sort((a, b) => b.data_id - a.data_id);
            body.push(...dataArray);
        }
        console.log('----body---');
        for (let i = 0; i < body.length; i++) {
            console.log(`--${body[i].data_id}--`);
        }

        res.status(200).json(body);
    } catch (error) {
        console.log('getDevice --------> ', error.toString());
        res.status(500).json({
            error: error.toString()
        });
    }
}

const getNormalInboxData = async (req, res) => {
    let userId = req.params.userId;

    try {
        const user = await User.getUser(userId);
        console.log('---user---', user);
        let data = [];
        if (user[0].user_type == 0) {
            data = await Data.getInboxDataForNomal(userId);
        } else {
            data = await Data.getInboxData(userId);
        }
        let idArray = data.map(d => d.device_id);
        let minId = Math.min(...idArray);
        let maxId = Math.max(...idArray);
        console.log('---min---', minId);
        console.log('---max---', maxId);
        let body = [];

        for (let i = minId; i <= maxId; i++) {
            let dataArray = data.filter(data => data.device_id == i);
            if (dataArray.length == 0) continue;
            dataArray = dataArray.sort((a, b) => b.data_id - a.data_id);
            body.push(...dataArray);
        }
        console.log('----body---', body);

        res.status(200).json(body);
    } catch (error) {
        console.log('getNormalInboxData -------> ', error);
        res.status(500).json({
            error: error.toString()
        });
    }
}

const getArchiveData = async (req, res) => {
    let token = req.params.token;
    const user = verifyUser(token);
    if (!user) {
        res.status(401).end();
        return;
    }

    try {
        let data = await Data.getArchiveData(user.id);
        let idArray = data.map(d => d.device_id);
        let minId = Math.min(...idArray);
        let maxId = Math.max(...idArray);
        let body = [];

        for (let i = minId; i <= maxId; i++) {
            let dataArray = data.filter(data => data.device_id == i);
            if (dataArray.length == 0) continue;
            body.push(...dataArray);
        }

        res.status(200).json(body);
    } catch (error) {
        console.log('getArchiveData ------> ', error.toString());
        res.status(500).json(error.toString());
    }
}

const getNormalArchiveData = async (req, res) => {
    let userId = req.params.userId;

    try {
        let data = await Data.getArchiveData(userId);
        let idArray = data.map(d => d.device_id);
        let minId = Math.min(...idArray);
        let maxId = Math.max(...idArray);
        let body = [];

        for (let i = minId; i <= maxId; i++) {
            let dataArray = data.filter(data => data.device_id == i);
            if (dataArray.length == 0) continue;
            body.push(...dataArray);
        }

        res.status(200).json(body);
    } catch (error) {
        console.log('getNormalArchiveData -------> ', error.toString());
        res.status(500).json(error.toString());
    }
}

const updateData = async (req, res) => {
    let id = req.params.id
    let body = req.body;

    try {
        let result = await Data.updateData(id, body);

        res.status(204).json({});
    } catch (error) {
        console.log('updateDevice --------> ', error);

        res.status(500).json({
            body: error.toString()
        });
    }
}

const transferData = async (req, res) => {
    let toUserId = req.params.userId;
    let body = req.body;
    // console.log('body: ', body);
    // body.transferred = 1;
    // body.to_user_id = toUserId;
    // delete body.type;
    // delete body.key;
    // delete body.number;
    // delete body.data_id;
    // delete body.device_name;

    let updateBody = {
        transferred: 1,
        to_user_id: toUserId
    };

    try {
        let result = await Data.transferData(updateBody, body.data_id);

        res.status(200).json({
            body: result
        });
    } catch (error) {
        console.log('transferData --------> ', error);

        res.status(500).json({
            body: error.toString()
        });
    }
}

const getTransferredData = async (req, res) => {
    let token = req.params.token;
    const user = verifyUser(token);
    if (!user) {
        res.status(401).end();
        return;
    }

    try {
        let ids = [];
        let users = [];
        if (user.userType == 1) {
            users = await UserRelation.get(user.id);
            ids = users.map(e => e.normal_id);
        } else if (user.userType == 2) {
            users = await UserRelation.getSuperAndNormalUsers(user.id);
            users.forEach(element => {
                if (element.super_id != 0) ids.push(element.super_id);
                if (element.normal_id != 0) ids.push(element.normal_id);
            });
        }
        ids.push(user.id);
        console.log('ids: ', ids);
        let transferredData = await Data.getTransferredData(ids);

        res.status(200).json(transferredData);
    } catch (error) {
        console.log('getTransferredData -------> ', error);

        res.status(500).json({
            body: error.toString()
        });
    }
}

//get super's outbox data
const getNormalTransferData = async (req, res) => {
    let userId = req.params.userId;

    try {
        const users = await UserRelation.get(userId);
        console.log('getNormalTransferData ------> ', users);
        const ids = users.map(e => e.normal_id);
        console.log(ids);
        ids.push(userId);

        let transferData = await Data.getTransferredData(ids);

        res.status(200).json(transferData);
    } catch (error) {
        console.log('getNormalTransferData --------> ', error);
        res.status(500).json(error.toString());
    }
}

const deleteData = async (req, res) => {
    let id = req.params.id;

    try {
        let result = await Data.deleteData(id);

        res.status(204).json();
    } catch (error) {
        console.log('deleteData -------> ', error);

        res.status(500).json(error.toString());
    }
}

const archiveData = async (req, res) => {
    let id = req.params.id;

    try {
        let result = await Data.archiveData(id);

        res.status(204).json();
    } catch (error) {
        console.log('archiveData -------> ', error);

        res.status(500).json(error.toString());
    }
}

const unarchiveData = async (req, res) => {
    let id = req.params.id;

    try {
        let result = await Data.unarchiveData(id);

        res.status(204).json();
    } catch (error) {

    }
}

const verifyUser = (token) => {
    try {
        let user = jwt.verify(token, 'traffic');
        console.log(user);
        return user;
    } catch (error) {
        console.log('error: ', error);
        return false;
    }
}

const boardData = async (req, res) => {
    let body = req.body;
    console.log('req header: ', req.headers);
    console.log('req body: ', body);
    const timestamp = new Date();
    body.created_at = timestamp;
    body.updated_at = timestamp;
    try {
        let result = await Data.addBoardData(body);

        res.status(200).json({
            result
        });

    } catch (error) {
        console.log('addBoardData --------> ', error);

        res.status(500).json({
            body: error.toString()
        });
    }
}

module.exports = {
    addData,
    getInboxData,
    getNormalInboxData,
    getArchiveData,
    getNormalArchiveData,
    updateData,
    deleteData,
    transferData,
    getTransferredData,
    getNormalTransferData,
    archiveData,
    unarchiveData,
    boardData
}