const express = require('express');
const router = express.Router();

const controller = require('./controller');

router.post('/:token', controller.addDevice);
router.get('/uuid', controller.getUUID);
router.get('/normals/:userId', controller.getNormalDevices);
router.get('/:token', controller.getDevices);
router.put('/ap/:apNumber/a6/:a6Number', controller.updateStatus);
router.put('/', controller.updateDevice);
router.delete('/:id', controller.deleteDevice);

module.exports = router;