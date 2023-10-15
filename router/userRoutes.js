const { Router } = require('express');
const userController = require('./../controller/userController');
const authController = require('./../controller/authController');
const verifyJWT = require('./../middleware/verifyJwt');
const router = Router();
router.route('/').get(userController.getAllUser);
router
  .route('/:id')
  .get(userController.getPostByUser)
  .patch(userController.updateUser)
  .delete(authController.restrictTo('ADMIN'), userController.deleteUser);

module.exports = router;
