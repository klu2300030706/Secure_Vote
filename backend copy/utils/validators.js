// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// Validate password strength
const isValidPassword = (password) => {
  return password.length >= 6;
};

// Validate event data
const validateEventData = (data) => {
  const errors = [];

  if (!data.title || data.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  }

  if (!Array.isArray(data.options) || data.options.length < 2) {
    errors.push('Event must have at least 2 options');
  }

  if (data.startAt && new Date(data.startAt) < new Date()) {
    errors.push('Start date cannot be in the past');
  }

  if (data.endAt && new Date(data.endAt) < new Date(data.startAt)) {
    errors.push('End date must be after start date');
  }

  return errors;
};

// Validate user registration data
const validateUserData = (data) => {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!isValidEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }

  if (!isValidPassword(data.password)) {
    errors.push('Password must be at least 6 characters long');
  }

  return errors;
};

module.exports = {
  isValidEmail,
  isValidPassword,
  validateEventData,
  validateUserData
};