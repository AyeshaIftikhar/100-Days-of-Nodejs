const User = require("../models/User");
const { signToken } = require("../config/jwt");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

exports.signup = asyncHandler(async (req, res, next) => {
  console.log(req.body);
  const { username, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return next(new ApiError("Email already in use", 400));
  }

  const userId = await User.create({ username, email, password });
  const user = await User.findById(userId);

  const token = signToken(user.id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    },
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new ApiError("Please provide email and password", 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findByEmail(email);
  if (!user || !(await User.comparePasswords(password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }

  // 3) If everything ok, send token to client
  const token = signToken(user.id);

  res.status(200).json({
    status: "success",
    token,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    },
  });
});
