const Post = require('../models/Post');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

exports.getAllPosts = asyncHandler(async (req, res) => {
  const posts = await Post.findAll();
  res.status(200).json({
    status: 'success',
    results: posts.length,
    data: { posts }
  });
});

exports.getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    return next(new ApiError('No post found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: { post }
  });
});

exports.createPost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  const postId = await Post.create({
    title,
    content,
    userId: req.user.id
  });
  
  const post = await Post.findById(postId);
  
  res.status(201).json({
    status: 'success',
    data: { post }
  });
});

exports.updatePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    return next(new ApiError('No post found with that ID', 404));
  }
  
  // Check if the post belongs to the user
  if (post.user_id !== req.user.id) {
    return next(new ApiError('You are not authorized to update this post', 403));
  }
  
  await Post.update(req.params.id, req.body);
  const updatedPost = await Post.findById(req.params.id);
  
  res.status(200).json({
    status: 'success',
    data: { post: updatedPost }
  });
});

exports.deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    return next(new ApiError('No post found with that ID', 404));
  }
  
  // Check if the post belongs to the user
  if (post.user_id !== req.user.id) {
    return next(new ApiError('You are not authorized to delete this post', 403));
  }
  
  await Post.delete(req.params.id);
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getUserPosts = asyncHandler(async (req, res) => {
  const posts = await Post.findByUser(req.user.id);
  res.status(200).json({
    status: 'success',
    results: posts.length,
    data: { posts }
  });
});