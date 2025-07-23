const passport = require('passport');
const ApiError = require('../utils/apiError');

exports.googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

exports.googleAuthCallback = passport.authenticate('google', {
  failureRedirect: '/login',
  session: true
});

exports.githubAuth = passport.authenticate('github', {
  scope: ['user:email']
});

exports.githubAuthCallback = passport.authenticate('github', {
  failureRedirect: '/login',
  session: true
});

exports.getCurrentUser = (req, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError('Not authenticated', 401);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res, next) => {
  try {
    req.logout();
    req.session.destroy();
    res.clearCookie('connect.sid');
    res.status(200).json({ status: 'success' });
  } catch (error) {
    next(error);
  }
};