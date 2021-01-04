const jwt = require('jsonwebtoken');

const Device = require('../../models/Device');
const UserRelation = require('../../models/UserRelation');
const uuid = require('uuid/v1');
const passwordGen = require('generate-password');

const addDevice = async (req, res) => {
    let token = req.params.token;
    const user = verifyUser(token);
    if (!user) {
        res.status(401).end();
        return;
    }

    let body = req.body;
    const uuid = getUUID();
    const password = getPassword();
    body.uuid = uuid;
    body.password = password;
    body.user_id = user.id;
    const apNumber = body.AP_number;
    const a6Number = body.A6_number;

    try {
        const rows = await Device.getDevice(apNumber, a6Number);
        if (rows.length != 0) {
            res.status(409).json({
                msg: 'This device already exists'
            });
            return;
        }
    } catch (error) {
        console.log('getDevice -------> ', error);
    }

    try {
        let insertId = await Device.addDevice(body);
        res.status(201).json({
            uuid: uuid,
            password: password,
            AP_number: body.AP_number,
            A6_number: body.A6_number
        });
    } catch (error) {
        console.log('addDevice -------> ', error);
        res.status(500).json({
            data: 'emtpy'
        });
    }
}

const getDevices = async (req, res) => {
    let token = req.params.token;
    const user = verifyUser(token);
    if (!user) {
        res.status(401).end('Token Expired');
        return;
    }

    try {
        let superUsers = await UserRelation.getSuperUsersUnderAdmin(user.id);
        superUsers = superUsers.map(e => e.super_id);

        let devices = await Device.getDevicesUnderAdmin([user.id, ...superUsers]);

        res.status(200).json(devices);
    } catch (error) {
        console.log('getDevice -------> ', error);
        res.status(500).json(error.toString());
    }
}

const getNormalDevices = async (req, res) => {
    let userId = req.params.userId;

    try {
        let devices = await Device.getDevices(userId);

        res.status(200).json(devices);
    } catch (error) {
        console.log('getNormalDevice -------> ', error);
        res.status(500).json(error.toString());
    }
}

const updateDevice = async (req, res) => {
    let id = req.body.id;
    let body = req.body;
    delete body.id;
    delete body.checking;

    try {
        let result = await Device.updateDevice(id, body);
        res.status(200).json({
            A6_number: body.A6_number
        });
    } catch (error) {
        console.log('updateDevice -------> ', error);
        res.status(500).json({
            body: error.toString()
        });
    }
}

const updateStatus = async (req, res) => {
    let apNumber = req.params.apNumber;
    let a6Number = req.params.a6Number;

    try {
        let result = await Device.updateStatus(apNumber, a6Number);
        res.status(204).json({

        })
    } catch (error) {
        console.log('updateStatus --------> ', error);
        res.status(500).json({
            body: error.toString()
        });
    }
}

const deleteDevice = async (req, res) => {
    let id = req.params.id;

    try {
        let result = await Device.deleteDevice(id);
        res.status(204).json({});
    } catch (error) {
        console.log('deleteDevice --------> ', error);
        res.status(500).json({
            body: error.toString()
        });
    }
}

const getUUID = () => {
    return Date.now().toString().substring(0, 10);
}

const getPassword = () => {
    return passwordGen.generate({
        length: 10,
        numbers: true
    });
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

module.exports = {
    addDevice,
    getDevices,
    getNormalDevices,
    updateDevice,
    deleteDevice,
    getUUID,
    getPassword,
    updateStatus
}