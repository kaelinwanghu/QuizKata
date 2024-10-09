import "dotenv/config";
import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import path from "path";
import typeDefs from "./schema";
import resolvers from "./resolvers";
import prisma from "./prisma";
import cors from "cors";
import bodyParser from "body-parser";

async function startServer() {
  const app = express(); // Added express so frontend and backend can communicate

  app.use(
    cors({
      origin: "http://localhost:3000", // Allow frontend requests
    })
  );

  app.use(bodyParser.json());

  // Initialize Apollo
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  // Apollo middleware
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => ({
        prisma,
      }),
    })
  );

  // Serve static files from the frontend
  app.use(express.static(path.join(__dirname, "../../frontend")));

  // Catch-all route
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend", "index.html"));
  });

  app.listen(4000, () => {
    console.log(`Backend and frontend served at http://localhost:4000`);
    console.log(`GraphQL API available at http://localhost:4000/graphql`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
});
