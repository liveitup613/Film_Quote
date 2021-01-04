const express = require('express');
const router = express.Router();

const controller = require('./controller');

router.post('/to/:userId', controller.transferData);
router.post('/:uuid', controller.addData);
router.get('/inbox/normals/:userId', controller.getNormalInboxData)
router.get('/inbox/:token', controller.getInboxData);
router.get('/archive/normals/:userId', controller.getNormalArchiveData);
router.get('/archive/:token', controller.getArchiveData);
router.get('/transferred/normals/:userId', controller.getNormalTransferData);
router.get('/transferred/:token', controller.getTransferredData);
router.put('/:id/archive', controller.archiveData);
router.put('/:id/unarchive', controller.unarchiveData);
router.put('/:id', controller.updateData);
router.delete('/:id', controller.deleteData);
router.post('/board/add', controller.boardData)

module.exports = router;