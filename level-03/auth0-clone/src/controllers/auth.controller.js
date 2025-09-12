const authService = require('../services/auth.service');
const { refreshTokens, revokeRefreshToken, revokeAllRefreshTokens } = require('../utils/token.utils');
const { AppError } = require('../middleware/error.middleware');

// Register a new user
const register = async (req, res, next) => {
  try {
    const userData = req.body;
    const tenant = req.tenant;

    const user = await authService.register(userData, tenant);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.getProfile(),
        emailVerificationRequired: tenant.settings.requireEmailVerification
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const tenant = req.tenant;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const result = await authService.login(email, password, tenant);

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        expiresAt: result.expiresAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token
const refresh = async (req, res, next) => {
  try {
    // Get refresh token from cookie or request body
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      throw new AppError('Refresh token is required', 400);
    }

    const result = await refreshTokens(token);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Logout user
const logout = async (req, res, next) => {
  try {
    // Get refresh token from cookie or request body
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (token) {
      await revokeRefreshToken(req.user.id, token);
      
      // Clear refresh token cookie
      res.clearCookie('refreshToken');
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

// Logout from all devices
const logoutAll = async (req, res, next) => {
  try {
    await revokeAllRefreshTokens(req.user.id);
    
    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Logged out from all devices'
    });
  } catch (error) {
    next(error);
  }
};

// Verify email
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new AppError('Verification token is required', 400);
    }

    await authService.verifyEmail(token);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Request password reset
const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const tenant = req.tenant;

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    await authService.requestPasswordReset(email, tenant);

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const tenant = req.tenant;

    if (!token || !newPassword) {
      throw new AppError('Token and new password are required', 400);
    }

    await authService.resetPassword(token, newPassword, tenant);

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  verifyEmail,
  requestPasswordReset,
  resetPassword
};
