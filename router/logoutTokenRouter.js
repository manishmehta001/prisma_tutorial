const { Router } = require('express');
const logoutController = require('./../controller/logoutController');
const router = Router();
router.route('/').get(logoutController.handleLogout);

module.exports = router;
