const { Router } = require('express');
const authController = require('./../controller/authController');
const router = Router();
router.route('/').post(authController.loginUser);

module.exports = router;
