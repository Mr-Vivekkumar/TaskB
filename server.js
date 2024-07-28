const typeDefs = require('./src/api/graphql/Schemas/index') //Graphql Schema File
const resolvers = require('./src/api/graphql/Resolvers/index') //Graphql Resolver File
const cors = require('cors')
const express = require('express')
const auth = require('./middleware/auth')
require('dotenv').config();
const { ApolloServer } = require('apollo-server-express'); //Graphql Apollo Server Express
const app = express();
async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      let { userobj, isAuth } = req;
      return {
        req,
        isAuth,
        userobj
      }
    }
  });
  await server.start();
  app.use(cors())
  app.use(auth)
  server.applyMiddleware({ app });

  await new Promise(r => app.listen({ port: process.env.PORT }, r).on('connection', (socket) => socket.setTimeout(1000 * 60 * 10)));

  console.log(`Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`);
}

startServer();