const User = require('../models/user.model');
const { Role } = require('../models/role.model');
const { Tenant } = require('../models/tenant.model');
const { AppError } = require('../middleware/error.middleware');
const { validateRegistration, sanitizeInput } = require('../utils/validation.utils');
const { generateAccessToken, generateRefreshToken } = require('../utils/token.utils');
const crypto = require('crypto');
const emailService = require('./email.service');

// Register a new user
const register = async (userData, tenant) => {
  // Sanitize input
  const sanitizedData = sanitizeInput(userData);
  
  // Validate registration data
  const validation = validateRegistration(sanitizedData, tenant);
  if (!validation.isValid) {
    throw new AppError('Validation failed', 400, validation.errors);
  }

  // Check if signup is allowed for this tenant
  if (tenant && tenant.settings && tenant.settings.allowSignup === false) {
    throw new AppError('Registration is disabled for this tenant', 403);
  }

  // Check if user already exists
  const existingUser = await User.findOne({ 
    email: sanitizedData.email,
    tenantId: tenant._id
  });
  
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  // Get default user role
  const userRole = await Role.findOne({ 
    name: 'user',
    tenantId: tenant._id
  });

  if (!userRole) {
    throw new AppError('Default user role not found', 500);
  }

  // Create verification token if email verification required
  let verificationToken = null;
  if (tenant.settings.requireEmailVerification) {
    verificationToken = crypto.randomBytes(32).toString('hex');
  }

  // Create new user
  const user = new User({
    ...sanitizedData,
    tenantId: tenant._id,
    roles: [userRole._id],
    emailVerified: !tenant.settings.requireEmailVerification,
    verificationToken
  });

  await user.save();

  // Send verification email if required
  if (verificationToken) {
    await emailService.sendVerificationEmail(user, tenant, verificationToken);
  }

  return user;
};

// Login user
const login = async (email, password, tenant) => {
  // Find user
  const user = await User.findOne({ 
    email, 
    tenantId: tenant._id 
  }).populate('roles');

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check if user is active
  if (!user.active) {
    throw new AppError('Account has been deactivated', 403);
  }

  // Check if email is verified
  if (tenant.settings.requireEmailVerification && !user.emailVerified) {
    throw new AppError('Email not verified. Please check your email for verification link.', 403);
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);

  // Update last login
  user.lastLogin = new Date();
  user.loginCount += 1;
  await user.save();

  return {
    user: user.getProfile(),
    accessToken,
    refreshToken: refreshToken.token,
    expiresAt: refreshToken.expiresAt
  };
};

// Verify email
const verifyEmail = async (token) => {
  // Find user with this verification token
  const user = await User.findOne({ verificationToken: token });
  
  if (!user) {
    throw new AppError('Invalid or expired verification token', 400);
  }

  // Update user
  user.emailVerified = true;
  user.verificationToken = undefined;
  await user.save();

  return user;
};

// Request password reset
const requestPasswordReset = async (email, tenant) => {
  // Find user
  const user = await User.findOne({ 
    email, 
    tenantId: tenant._id 
  });

  if (!user) {
    // For security, don't reveal that email doesn't exist
    return { success: true };
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpires = new Date();
  resetExpires.setHours(resetExpires.getHours() + 1); // Token valid for 1 hour

  // Save token to user
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetExpires;
  await user.save();

  // Send password reset email
  await emailService.sendPasswordResetEmail(user, tenant, resetToken);

  return { success: true };
};

// Reset password
const resetPassword = async (token, newPassword, tenant) => {
  // Find user with this reset token
  const user = await User.findOne({ 
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() },
    tenantId: tenant._id
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  // Validate new password
  const { validatePassword } = require('../utils/validation.utils');
  const validation = validatePassword(newPassword, tenant.settings.passwordPolicy);
  
  if (!validation.isValid) {
    throw new AppError('Password validation failed', 400, { errors: validation.errors });
  }

  // Update password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return { success: true };
};

module.exports = {
  register,
  login,
  verifyEmail,
  requestPasswordReset,
  resetPassword
};
