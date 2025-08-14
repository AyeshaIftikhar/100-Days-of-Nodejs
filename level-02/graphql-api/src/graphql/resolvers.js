const User = require("../models/User");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const { signToken } = require("../config/jwt");
const { AuthenticationError } = require("apollo-server");
const mongoose = require("mongoose");

const resolvers = {
  Query: {
    hello: () => "Hello, world!",
    me: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError("Not authenticated");
      return User.findById(user.id);
    },
    comments: async (_, { postId }) => {
      return Comment.find({ post: postId }).populate("author");
    },
    posts: async () => {
      return Post.find().populate("author").populate("comments");
    },
    post: async (_, { id }) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        // Handle invalid ID (e.g., return error response)
        return null;
      }
      return Post.findById(id).populate("author").populate("comments");
    },
  },
  Mutation: {
    signup: async (_, { input }) => {
      const { username, email, password } = input;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("Email already in use");
      }

      const newUser = await User.create({ username, email, password });
      const token = signToken(newUser.id);

      return {
        token,
        user: newUser,
      };
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email }).select("+password");

      if (!user || !(await user.correctPassword(password, user.password))) {
        throw new AuthenticationError("Incorrect email or password");
      }

      const token = signToken(user.id);

      return {
        token,
        user,
      };
    },
    createPost: async (_, { input }, { user }) => {
      if (!user) throw new AuthenticationError("Not authenticated");

      const post = await Post.create({
        title: input.title,
        content: input.content,
        author: user.id,
      });

      return await post.populate("author");
    },
    updatePost: async (_, { id, input }, { user }) => {
      if (!user) throw new AuthenticationError("Not authenticated");

      const post = await Post.findById(id);
      if (!post) throw new Error("Post not found");
      if (post.author.toString() !== user.id) {
        throw new AuthenticationError("Not authorized");
      }

      post.title = input.title;
      post.content = input.content;
      await post.save();

      return post.populate("author").execPopulate();
    },
    deletePost: async (_, { id }, { user }) => {
      if (!user) throw new AuthenticationError("Not authenticated");

      const post = await Post.findById(id);
      if (!post) throw new Error("Post not found");
      if (post.author.toString() !== user.id) {
        throw new AuthenticationError("Not authorized");
      }

      await post.remove();
      return true;
    },
    createComment: async (_, { input }, { user }) => {
      if (!user) throw new AuthenticationError("Not authenticated");

      const post = await Post.findById(input.postId);
      if (!post) throw new Error("Post not found");

      const comment = await Comment.create({
        content: input.content,
        author: user.id,
        post: input.postId,
      });

      post.comments.push(comment.id);
      await post.save();

      return await comment.populate("author");
    },
    deleteComment: async (_, { id }, { user }) => {
      if (!user) throw new AuthenticationError("Not authenticated");

      const comment = await Comment.findById(id);
      if (!comment) throw new Error("Comment not found");

      const post = await Post.findById(comment.post);
      if (!post) throw new Error("Post not found");

      // Allow deletion by comment author or post author
      if (
        comment.author.toString() !== user.id &&
        post.author.toString() !== user.id
      ) {
        throw new AuthenticationError("Not authorized");
      }

      await comment.remove();

      // Remove comment reference from post
      post.comments = post.comments.filter(
        (commentId) => commentId.toString() !== id
      );
      await post.save();

      return true;
    },
  },
  Post: {
    comments: async (parent) => {
      return parent
        .populate("comments")
        .execPopulate()
        .then((post) => post.comments);
    },
  },
  Comment: {
    post: async (parent) => {
      return parent
        .populate("post")
        .execPopulate()
        .then((comment) => comment.post);
    },
  },
  User: {
    posts: async (parent) => {
      return parent
        .populate("posts")
        .execPopulate()
        .then((user) => user.posts);
    },
    comments: async (parent) => {
      return parent
        .populate("comments")
        .execPopulate()
        .then((user) => user.comments);
    },
  },

  // Add other types (e.g., User, Post) if you have field resolvers for them
};

module.exports = resolvers;
