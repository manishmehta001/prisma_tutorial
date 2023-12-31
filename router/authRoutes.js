const { Router } = require('express');
const authController = require('./../controller/authController');
const router = Router();
router.route('/signup').post(authController.signupUser);
router.route('/login').post(authController.loginUser);
router.route('/forgetPassword').post(authController.forgetPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);
router.route('/verifyEmail/:id').patch(authController.verifyEmail);
router.route('/updatePassword/:id').patch(authController.updatePassword);

module.exports = router;
