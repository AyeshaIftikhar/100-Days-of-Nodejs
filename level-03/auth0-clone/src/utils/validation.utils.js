// Validation utilities
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation based on tenant settings
const validatePassword = (password, passwordPolicy = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true
  } = passwordPolicy;

  const errors = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate registration data
const validateRegistration = (data, tenant) => {
  const { email, password, firstName, lastName } = data;
  const errors = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Invalid email format';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else {
    const passwordValidation = validatePassword(
      password, 
      tenant?.settings?.passwordPolicy
    );
    
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors;
    }
  }

  if (!firstName) {
    errors.firstName = 'First name is required';
  }

  if (!lastName) {
    errors.lastName = 'Last name is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Sanitize input data to prevent XSS
const sanitizeInput = (data) => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sanitized = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Basic sanitization - replace < and > with their HTML entities
      sanitized[key] = value
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateRegistration,
  sanitizeInput
};
