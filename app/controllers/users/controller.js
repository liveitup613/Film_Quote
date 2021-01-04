const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const randomize = require('randomatic');

const Utils = require('../../utils');
const User = require('../../models/User');
const Device = require('../../models/Device');
const SuperNormal = require('../../models/SuperNormal');
const UserRelation = require('../../models/UserRelation');

const saltRounds = 10;
const NORMAL = 0;
const SUPER = 1;
const ADMIN = 2;

const createUser = async (req, res) => {
    let body = req.body;

    let validation = await checkUser(body.username, body.email);
    if (!validation) {
        console.log('validation false');
        res.status(409).end();

        return;
    }

    const hash = bcrypt.hashSync(body.password, saltRounds);
    body.password = hash;

    try {
        let insertId = await User.createUser(body);
        let token = Utils.createToken({
            id: insertId,
            email: body.email,
            userType: NORMAL
        }, '60m');

        res.status(201).json(token);
    } catch (error) {
        console.log('createUser -------> ', error);

        res.status(500).json(error.toString());
    }
}

const createUserFromSuper = async (req, res) => {
    const body = req.body;
    const userId = body.userId;
    delete body.userId;
    const token = req.params.token;
    const time = new Date();
    body.created_at = time;
    body.updated_at = time;

    const user = Utils.verifyUser(token);
    console.log('-------------------------------\n', user);
    if (!user) {
        res.status(401).json('Token Expired');
        return;
    }

    try {
        let validation = await checkUser(body.username, body.email);
        if (!validation) {
            console.log('validation false');
            res.status(409).end();
            return;
        }

        const hash = bcrypt.hashSync(body.password, saltRounds);
        body.password = hash;
        let insertId = await User.createUser(body);

        if (user.userType == SUPER) {
            let results = await UserRelation.get(user.id);
            var relation = {
                super_id: user.id,
                normal_id: insertId,
                admin_id: results[0].admin_id
            }
        } else if (user.userType == ADMIN) {
            relation = {
                admin_id: user.id,
                normal_id: insertId,
                super_id: userId
            };
        }

        await UserRelation.add(relation);
        // const result = await SuperNormal.addNormal({ super_id: user.id, normal_id: insertId });

        let token = Utils.createToken({
            id: insertId,
            email: body.email,
            userType: NORMAL
        }, '60m'); // token for normal user

        res.status(201).json(token);
    } catch (error) {
        console.log('createUserFromSuper ------> ', error);
        res.status(500).json(error.toString());
    }
}

const createUserFromAdmin = async (req, res) => {
    const body = req.body;
    const token = req.params.token;
    const time = new Date();
    body.created_at = time;
    body.updated_at = time;

    const user = Utils.verifyUser(token);
    if (!user) {
        res.status(401).json('Token Expired');
        return;
    }

    let relation = {
        admin_id: user.id
    };
    try {
        let validation = await checkUser(body.username, body.email);
        if (!validation) {
            console.log('validation false');
            res.status(409).end();
            return;
        }

        const hash = bcrypt.hashSync(body.password, saltRounds);
        body.password = hash;

        let insertId = await User.createUser(body);
        if (body.user_type == 0) {
            relation.normal_id = insertId;
        } else if (body.user_type == 1) {
            relation.super_id = insertId;
        } else if (body.user_type == 2) {

        }
        console.log(relation);
        await UserRelation.add(relation);
        res.status(201).json('Success');
    } catch (error) {
        console.log('createUserFromAdmin --------> ', error);
        res.status(500).json(error.toString());
    }
}

const checkUser = async (username, email) => {
    try {
        let users = await User.checkUser(username, email);

        return users.length == 0;
    } catch (error) {
        console.log('checkUser -------> ', error);

        return false;
    }
}

const getUsers = async (req, res) => {
    try {
        // let users = await User.getUsers();

        const adminUsers = await User.getAdminUsers();
        const superUsers = await User.getSuperUsers();
        const normalUsers = await User.getNormalUsers();
        // console.log('admin ------> \n ', adminUsers);
        // console.log('super ------> \n', superUsers);
        // console.log('normal ------> \n', normalUsers);

        let results = [];
        adminUsers.forEach(adminUser => {
            results.push(adminUser);
            const normalUsers2 = normalUsers.filter(normalUser => normalUser.super_id == 0);
            results.push(...normalUsers2);

            superUsers.forEach(superUser => {
                results.push(superUser);
                // console.log('super ------> ', superUser);
                const users = normalUsers.filter(normalUser => superUser.id == normalUser.super_id);
                // console.log(`normal users -----> \n`, users);
                results.push(...users);
            });
        });

        res.status(200).json(results);
    } catch (error) {
        console.log('getUsers --------> ', error);
        res.status(500).json(error.toString());
    }
}

const getNormalUsersPerSuper = async (req, res) => {
    const token = req.params.token;
    const user = Utils.verifyUser(token);
    if (!user) {
        res.status(401).json('Token expired');
        return;
    }

    try {
        let mine = await User.getUser(user.id);
        console.log(mine);
        const users = await User.getNormalUsersPerSuper(user.id);
        mine.push(...users);
        console.log('users: ', mine);
        res.status(200).json(mine);
    } catch (error) {
        console.log('getNormalUsersPerUser', error);

        res.status(500).json(error.toString());
    }
}

const getUser = async (req, res) => {
    let id = req.params.id;

    try {
        let result = await User.getUser(id);

        res.status(500).json({
            data: result
        });
    } catch (error) {
        console.log('getUser ---------> ', error);

        res.status(500).json({
            body: error.toString()
        });
    }
}

const loginUser = async (req, res) => {
    console.log('login req: ', req.body);
    let username = req.body.username;
    let password = req.body.password;

    try {
        const hash = await getHash(username);

        if (hash.length == 0) {
            // res.status(404).end();
            res.status(404).json({
                "login": "ERROR"
            });
        } else {
            const match = bcrypt.compareSync(password, hash[0].password);

            if (match) {
                const users = await User.getUser(hash[0].id);
                const token = Utils.createToken({
                    id: users[0].id,
                    email: users[0].email,
                    userType: users[0].user_type
                }, '60m');
                // const key = await User.getKey('AESKey');
                // users[0].key = key.value;

                // res.status(200).json(token);
                res.status(200).json({
                    "login": "OK"
                });
            } else {
                // res.status(404).end();
                res.status(404).json({
                    "login": "ERROR"
                });
            }
        }
    } catch (error) {
        console.log('loginUser ------> ', error);

        res.status(500).json({
            "login": error.toString()
        });
    }
}

const deleteUser = async (req, res) => {
    let id = req.params.id;

    try {
        let result = await User.deleteUser(id);
        console.log('deleteUser result --------> ', result);

        res.status(204).end();
    } catch (error) {
        console.log('deleteUser -------> ', error);

        res.status(500).json(error.toString());
    }
}

const deleteUserFromSuper = async (req, res) => {
    const userId = req.params.userId;
    const userType = req.params.userType;
    let token = req.params.token;

    try {
        const user = Utils.verifyUser(token);
        if (!user) {
            res.status(401).end();
            return;
        }
        if (userType == 0) {
            let result = await User.deleteUser(userId);
        } else if (userType == 1) {
            const users = await User.getNormalUsersPerSuper(userId);
            const ids = await users.map(item => item.normal_id);
            ids.push(userId);
            await User.deleteUsers(ids);
        }

        res.status(204).end();
    } catch (error) {
        console.log('deleteUserFromSuper --------> ', error);
        res.status(500).json(error.toString());
    }
}

const updateUser = async (req, res) => {
    let id = req.params.id;
    let body = req.body;
    console.log('updateUser -------> ', body);

    try {
        await User.updateUser(id, body);

        res.status(204).json({});
    } catch (error) {
        console.log('updateUser -------> ', error);

        res.status(500).json({
            body: error.toString()
        });
    }
}

const setHoldUser = async (req, res) => {
    let userId = req.params.id;
    let apNumber = req.params.number;
    console.log('params: ', userId, apNumber);

    try {
        const normalIds = await SuperNormal.getNormalUserIds(userId);
        const ids = normalIds.map(e => e.normal_id);
        await User.setHoldUser(userId, apNumber);
        if (ids.length > 0) await User.setHoldNormalUsers(ids, apNumber);

        let deviceNumbers = await Device.getDeviceNumbers(userId);

        res.status(200).json({
            apNumber: apNumber,
            a6Number: deviceNumbers
        });
    } catch (error) {
        console.log('setHoldUser -------> ', error);

        res.status(500).json(error.toString());
    }
}

const getHash = async (username) => {
    try {
        const hash = await User.getHash(username);

        return hash;
    } catch (error) {
        console.log('getHash error------> ', error);
        return '';
    }
}

const sendCode = async (req, res) => {
    const email = req.params.email;
    const code = randomize('0', 6);

    try {
        let transport = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: 'johnnybkd@gmail.com',
                pass: '*johnnyboy12'
            }
        });

        let info = await transport.sendMail({
            from: '<TrafficMate>',
            to: email,
            subject: 'Verification Code',
            html: `Your code for resetting password is: <b>${code}</b>`
        });

        console.log('Message sent: ', info.messageId);
        res.status(200).json('We\'ve sent a verification code to your email!');
    } catch (error) {
        console.log('error: ', error);
        res.status(500).json(error.toString());
    }
}

const resetPassword = async (req, res) => {
    const email = req.params.email;
    const password = req.params.password;

    const hash = bcrypt.hashSync(password, saltRounds);
    console.log('hash: ', hash);

    try {
        const result = await User.resetPassword(email, hash);
        res.status(200).json('Your password has been changed successfully!');
    } catch (error) {
        res.status(500).json(error.toString());
    }
}

module.exports = {
    createUser,
    createUserFromSuper,
    createUserFromAdmin,
    loginUser,
    getUser,
    getUsers,
    deleteUser,
    deleteUserFromSuper,
    updateUser,
    setHoldUser,
    sendCode,
    resetPassword,
    getNormalUsersPerSuper
}