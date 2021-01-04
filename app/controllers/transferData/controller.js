const TransferData = require('../../models/TransferData');

const transferData = async (req, res) => {
    let toUserId = req.params.userId;
    let body = req.body;
    body.from_device_id = body.device_id;
    body.from_user_id = body.user_id;
    body.to_user_id = toUserId;
    delete body.type;
    delete body.user_id;
    delete body.device_id;

    try {
        let result = await TransferData.transferData(body);

        res.status(201).json({
            body: result
        });
    } catch (error) {
        console.log('transferData ---------> ', error);

        res.status(500).json({
            body: error.toString()
        });
    }
}

const getTransferredData = async (req, res) => {
    let userId = req.params.userId;

    try {
        let data = await TransferData.getTransferredData(userId);
        console.log(data);

        res.status(200).json(data);
    } catch (error) {
        console.log('getTransferredData ---------> ', error);

        res.status(500).json({
            body: error.toString()
        });
    }
}

module.exports = {
    transferData,
    getTransferredData
};





