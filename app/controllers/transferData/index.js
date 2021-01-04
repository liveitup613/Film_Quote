const express = require('express');
const router = express.Router();

const controller = require('./controller');

router.post('/to/:userId', controller.transferData);
router.get('/:userId', controller.getTransferredData);

module.exports = router;