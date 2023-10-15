const { Router } = require('express');
const postController = require('./../controller/postController');
const authController = require('./../controller/authController');
const router = Router();
router
  .route('/')
  .get(authController.protects, postController.getAllPost)
  .post(postController.createPost);
router
  .route('/:id')
  .get(postController.getSinglePost)
  .patch(postController.updatePost)
  .delete(
    authController.protects,
    authController.restrictTo('ADMIN'),
    postController.deletePost
  );
router.route('/getPostByUser/:id').get(postController.getPostByUser);

module.exports = router;
