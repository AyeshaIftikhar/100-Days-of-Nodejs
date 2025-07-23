const Post = require('../../models/Post');
const { AuthenticationError } = require('apollo-server');

module.exports = {
  Query: {
    posts: async () => {
      return Post.find().populate('author').populate('comments');
    },
    post: async (_, { id }) => {
      return Post.findById(id).populate('author').populate('comments');
    },
  },
  Mutation: {
    createPost: async (_, { input }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      const post = await Post.create({
        title: input.title,
        content: input.content,
        author: user.id,
      });

      return post.populate('author').execPopulate();
    },
    updatePost: async (_, { id, input }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      const post = await Post.findById(id);
      if (!post) throw new Error('Post not found');
      if (post.author.toString() !== user.id) {
        throw new AuthenticationError('Not authorized');
      }

      post.title = input.title;
      post.content = input.content;
      await post.save();

      return post.populate('author').execPopulate();
    },
    deletePost: async (_, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      const post = await Post.findById(id);
      if (!post) throw new Error('Post not found');
      if (post.author.toString() !== user.id) {
        throw new AuthenticationError('Not authorized');
      }

      await post.remove();
      return true;
    },
  },
  Post: {
    comments: async (parent) => {
      return parent.populate('comments').execPopulate().then(post => post.comments);
    },
  },
};