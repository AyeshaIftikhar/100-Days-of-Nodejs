const User = require('../models/User');
const { generateToken } = require('../plugins/auth');
const { ValidationError, UnauthorizedError } = require('../utils/errors');

class AuthController {
  async register(ctx) {
    const { name, email, password } = ctx.request.body;
    if (!name || !email || !password) throw new ValidationError('All fields required');
    const exists = await User.findOne({ email });
    if (exists) throw new ValidationError('Email already registered');
    const user = await User.create({ name, email, password });
    ctx.body = { token: generateToken(user._id, user.roles) };
  }

  async login(ctx) {
    const { email, password } = ctx.request.body;
    if (!email || !password) throw new ValidationError('Email and password required');
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) throw new UnauthorizedError();
    ctx.body = { token: generateToken(user._id, user.roles) };
  }
}

module.exports = new AuthController();
