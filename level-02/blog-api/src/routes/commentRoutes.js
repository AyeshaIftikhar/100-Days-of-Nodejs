const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');


router
  .route('/:postId')
  .get(commentController.getPostComments)
  .post(auth.protect, validate.validateComment, commentController.createComment);

router
  .route('/:postId/:id')
  .delete(auth.protect, commentController.deleteComment);

module.exports = router;