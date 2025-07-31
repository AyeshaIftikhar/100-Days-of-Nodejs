const validator = {
  isValidUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch (err) {
      return false;
    }
  },
  isValidEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
};

module.exports = validator;