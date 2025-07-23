const User = require('../../models/User');
const { signToken } = require('../../config/jwt');
const { AuthenticationError } = require('apollo-server');

module.exports = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      return User.findById(user.id);
    },
  },
  Mutation: {
    signup: async (_, { input }) => {
      const { username, email, password } = input;
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('Email already in use');
      }

      const newUser = await User.create({ username, email, password });
      const token = signToken(newUser.id);

      return {
        token,
        user: newUser,
      };
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email }).select('+password');
      
      if (!user || !(await user.correctPassword(password, user.password))) {
        throw new AuthenticationError('Incorrect email or password');
      }

      const token = signToken(user.id);

      return {
        token,
        user,
      };
    },
  },
  User: {
    posts: async (parent) => {
      return parent.populate('posts').execPopulate().then(user => user.posts);
    },
    comments: async (parent) => {
      return parent.populate('comments').execPopulate().then(user => user.comments);
    },
  },
};