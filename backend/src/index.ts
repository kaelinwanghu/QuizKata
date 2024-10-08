import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import typeDefs from "./schema";
import resolvers from "./resolvers";
import prisma from "./prisma";

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function startServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req, res }) => ({
      prisma,
    }),
  });
  console.log(`🚀 Server ready at ${url}`);
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
});
