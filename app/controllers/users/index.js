const express = require('express');
const router = express.Router();

const controller = require('./controller');

router.post('/login', controller.loginUser);
router.post('/:token/normal', controller.createUserFromSuper);
router.post('/:token/admin', controller.createUserFromAdmin);
router.post('/', controller.createUser);
router.put('/:id/hold/:number', controller.setHoldUser);
router.put('/:id', controller.updateUser);
router.delete('/:token/user/:userId/type/:userType', controller.deleteUserFromSuper);
router.delete('/:id', controller.deleteUser);
router.get('/code/:email', controller.sendCode);
router.get('/email/:email/password/:password', controller.resetPassword);
router.get('/super/:token/normal', controller.getNormalUsersPerSuper);
router.get('/:id', controller.getUser);
router.get('/', controller.getUsers);

module.exports = router;