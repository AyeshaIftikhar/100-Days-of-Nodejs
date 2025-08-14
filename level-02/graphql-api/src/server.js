const { ApolloServer } = require('apollo-server');
const connectDB = require('./config/db'); 
const typeDefs = require('./graphql/schema/typeDefs');
const resolvers = require('./graphql/resolvers');
const context = require('./graphql/context');

// Connect to database
connectDB();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context,
  introspection: true,
  playground: true,
});

const PORT = process.env.PORT || 4000;

server.listen(PORT).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
  console.log("Press Ctrl+C to stop the server");
});