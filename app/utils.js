const jwt = require('jsonwebtoken');

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

const createToken = (user, expiresIn) => {
    const token = jwt.sign(user, 'traffic', { expiresIn });
    return token;
}

module.exports = {
    verifyUser,
    createToken
}