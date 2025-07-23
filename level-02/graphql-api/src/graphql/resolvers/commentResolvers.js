const Comment = require('../../models/Comment');
const Post = require('../../models/Post');
const { AuthenticationError } = require('apollo-server');

module.exports = {
  Query: {
    comments: async (_, { postId }) => {
      return Comment.find({ post: postId }).populate('author');
    },
  },
  Mutation: {
    createComment: async (_, { input }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      const post = await Post.findById(input.postId);
      if (!post) throw new Error('Post not found');

      const comment = await Comment.create({
        content: input.content,
        author: user.id,
        post: input.postId,
      });

      post.comments.push(comment.id);
      await post.save();

      return comment.populate('author').execPopulate();
    },
    deleteComment: async (_, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      const comment = await Comment.findById(id);
      if (!comment) throw new Error('Comment not found');
      
      const post = await Post.findById(comment.post);
      if (!post) throw new Error('Post not found');
      
      // Allow deletion by comment author or post author
      if (comment.author.toString() !== user.id && post.author.toString() !== user.id) {
        throw new AuthenticationError('Not authorized');
      }

      await comment.remove();
      
      // Remove comment reference from post
      post.comments = post.comments.filter(
        commentId => commentId.toString() !== id
      );
      await post.save();

      return true;
    },
  },
  Comment: {
    post: async (parent) => {
      return parent.populate('post').execPopulate().then(comment => comment.post);
    },
  },
};