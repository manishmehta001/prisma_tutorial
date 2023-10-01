const { Router } = require('express');
const commentController = require('./../controller/commentController');
const router = Router();
router
  .route('/')
  .post(commentController.createComment)
  .get(commentController.getAllComment);
router
  .route('/:id')
  .patch(commentController.updateComment)
  .delete(commentController.deleteComment);

module.exports = router;
