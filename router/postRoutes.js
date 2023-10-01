const { Router } = require('express');
const postController = require('./../controller/postController');
const router = Router();
router
  .route('/')
  .post(postController.createPost)
  .get(postController.getAllPost);
router
  .route('/:id')
  .get(postController.getSinglePost)
  .patch(postController.updatePost)
  .delete(postController.deletePost);
router.route('/getPostByUser/:id').get(postController.getPostByUser);
module.exports = router;
