const express = require('express');
const router = express.Router();
const googleAuthController = require('../controller/googleAuthController');

router.get('/login', googleAuthController.googleLogin);
router.get('/dashbord', googleAuthController.googleDashboard);
router.get('/auth/google', googleAuthController.getGoogleAuth);
router.get('/auth/google/callback', googleAuthController.getGoogleAuthCallback);
router.get('/logout', googleAuthController.logout);

router.get(
  '/auth/linkedin/callback',
  googleAuthController.getLinkedinAuthCallBack
);

module.exports = router;
