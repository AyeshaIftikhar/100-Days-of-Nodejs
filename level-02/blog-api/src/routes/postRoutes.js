const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router
  .route('/')
  .get(postController.getAllPosts)
  .post(auth.protect, validate.validatePost, postController.createPost);

router
  .route('/:id')
  .get(postController.getPost)
  .patch(auth.protect, validate.validatePost, postController.updatePost)
  .delete(auth.protect, postController.deletePost);

router.get('/user/me', auth.protect, postController.getUserPosts);

module.exports = router;