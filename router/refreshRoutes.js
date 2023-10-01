const { Router } = require('express');
const refreshTokenController = require('./../controller/refreshTokenController');
const router = Router();
router.route('/').get(refreshTokenController.handleRefreshToken);

module.exports = router;
