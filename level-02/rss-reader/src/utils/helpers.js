// Basic helpers utility
module.exports = {
  isValidUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  },
  // Add more helper functions as needed
};
