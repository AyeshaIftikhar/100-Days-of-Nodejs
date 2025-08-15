// Basic API controller for rate-limited endpoints

exports.publicEndpoint = (req, res) => {
  res.json({ message: 'Public endpoint accessed!' });
};

exports.userEndpoint = (req, res) => {
  res.json({ message: `User endpoint accessed by user ${req.user ? req.user.id : 'unknown'}` });
};

exports.adminEndpoint = (req, res) => {
  res.json({ message: 'Admin endpoint accessed!' });
};

exports.keyBasedEndpoint = (req, res) => {
  res.json({ message: `Key-based endpoint accessed with API key ${req.apiKey || 'none'}` });
};
