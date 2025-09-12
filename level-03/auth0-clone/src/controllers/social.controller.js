const passport = require('passport');
const User = require('../models/user.model');
const { Role } = require('../models/role.model');
const { generateAccessToken, generateRefreshToken } = require('../utils/token.utils');
const { AppError } = require('../middleware/error.middleware');

// Handle social login (generic function for all providers)
const handleSocialLogin = (provider) => {
  return async (req, res, next) => {
    try {
      const { user, profile } = req;
      const tenant = req.tenant;

      // Check if provider is enabled for this tenant
      if (!tenant.settings.socialLogins?.[provider]?.enabled) {
        throw new AppError(`${provider} login is not enabled for this tenant`, 403);
      }

      // Get user data from the passport profile
      let userData = {
        email: profile.emails?.[0]?.value,
        firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || '',
        lastName: profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '',
        picture: profile.photos?.[0]?.value,
        emailVerified: true // Emails from OAuth providers are usually verified
      };

      // Check if user exists
      let existingUser = await User.findOne({
        $or: [
          { email: userData.email, tenantId: tenant._id },
          { 'socialLogins.provider': provider, 'socialLogins.providerId': profile.id, tenantId: tenant._id }
        ]
      }).populate('roles');

      // Get default user role
      const userRole = await Role.findOne({
        name: 'user',
        tenantId: tenant._id
      });

      if (!userRole) {
        throw new AppError('Default user role not found', 500);
      }

      if (existingUser) {
        // Update user data if needed
        let needsUpdate = false;
        
        // Add social login if not exists
        const socialLoginExists = existingUser.socialLogins.some(
          login => login.provider === provider && login.providerId === profile.id
        );
        
        if (!socialLoginExists) {
          existingUser.socialLogins.push({
            provider,
            providerId: profile.id,
            data: profile
          });
          needsUpdate = true;
        }
        
        // Update profile picture if not set
        if (!existingUser.picture && userData.picture) {
          existingUser.picture = userData.picture;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          await existingUser.save();
        }
        
        user = existingUser;
      } else {
        // Create new user
        const newUser = new User({
          ...userData,
          tenantId: tenant._id,
          roles: [userRole._id],
          socialLogins: [{
            provider,
            providerId: profile.id,
            data: profile
          }]
        });
        
        await newUser.save();
        user = newUser;
      }

      // Generate tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = await generateRefreshToken(user);

      // Update last login
      user.lastLogin = new Date();
      user.loginCount += 1;
      await user.save();

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', refreshToken.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Redirect to frontend with access token
      const redirectUrl = `${process.env.FRONTEND_URL}/callback?token=${accessToken}&userId=${user._id}`;
      res.redirect(redirectUrl);
    } catch (error) {
      // Redirect to frontend with error
      const redirectUrl = `${process.env.FRONTEND_URL}/callback?error=${encodeURIComponent(error.message)}`;
      res.redirect(redirectUrl);
    }
  };
};

// Google login
const googleLogin = passport.authenticate('google', {
  scope: ['profile', 'email']
});

// Google callback
const googleCallback = [
  passport.authenticate('google', { session: false }),
  handleSocialLogin('google')
];

// GitHub login
const githubLogin = passport.authenticate('github', {
  scope: ['user:email']
});

// GitHub callback
const githubCallback = [
  passport.authenticate('github', { session: false }),
  handleSocialLogin('github')
];

module.exports = {
  googleLogin,
  googleCallback,
  githubLogin,
  githubCallback
};
