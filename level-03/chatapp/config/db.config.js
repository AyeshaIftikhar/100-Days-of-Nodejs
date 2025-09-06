// Database configuration
const dbConfig = {
  url: process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
};

module.exports = dbConfig;
