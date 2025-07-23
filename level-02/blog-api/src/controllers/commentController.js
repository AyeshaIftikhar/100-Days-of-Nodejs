const Comment = require('../models/Comment');
const Post = require('../models/Post');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

exports.getPostComments = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);
  
  if (!post) {
    return next(new ApiError('No post found with that ID', 404));
  }
  
  const comments = await Comment.findByPost(req.params.postId);
  
  res.status(200).json({
    status: 'success',
    results: comments.length,
    data: { comments }
  });
});

exports.createComment = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);
  
  if (!post) {
    return next(new ApiError('No post found with that ID', 404));
  }
  
  const commentId = await Comment.create({
    content: req.body.content,
    postId: req.params.postId,
    userId: req.user.id
  });
  
  const comment = await Comment.findById(commentId);
  
  res.status(201).json({
    status: 'success',
    data: { comment }
  });
});

exports.deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  
  if (!comment) {
    return next(new ApiError('No comment found with that ID', 404));
  }
  
  // Check if the comment belongs to the user or the user is the post author
  const post = await Post.findById(comment.post_id);
  if (comment.user_id !== req.user.id && post.user_id !== req.user.id) {
    return next(new ApiError('You are not authorized to delete this comment', 403));
  }
  
  await Comment.delete(req.params.id);
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});