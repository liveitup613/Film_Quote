const express = require('express');
const router = express.Router();

const controller = require('./controller');

router.post('/search', controller.searchQuote);
router.get('/:id', controller.getQuote);

module.exports = router;