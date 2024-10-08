// src/resolvers.ts
import { GraphQLError } from "graphql";
import prisma from "./prisma";

const resolvers = {
  Query: {
    /**
     * Gets all the users that currently exist
     *
     * @param _parent required for GraphQL resolvers but unused
     * @param _args no need for arguments for all users
     * @returns an array of all user objercts
     */
    users: async (_parent: any, _args: any) => {
      try {
        const users = await prisma.user.findMany();
        return users;
      } catch (error) {
        throw new GraphQLError(`Failed to get users: ${error}`, {
          extensions: { code: "GET_USERS_FAILED" },
        });
      }
    },

    /**
     * Gets a single user based on their ID
     *
     * @param _parent required for GraphQL resolvers but unused
     * @param args contains the username needed to find the user
     * @returns the user object if it exists
     */
    user: async (_parent: any, args: { username: string }) => {
      try {
        const user = await prisma.user.findUnique({
          where: { username: args.username },
        });

        if (!user) {
          throw new GraphQLError(`User with ID ${args.username} not found.`);
        }

        return user;
      } catch (error) {
        throw new GraphQLError(`Failed to fetch user: ${error}`, {
          extensions: { code: "GET_USER_FAILED" },
        });
      }
    },
  },

  Mutation: {
    /**
     * Creates a user with a username
     *
     * @param _parent required for GraphQL resolvers but unused
     * @param args contains the username to be created
     * @returns the newly created user object
     */
    createUser: async (_parent: any, args: { username: string }) => {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { username: args.username },
        });

        if (existingUser) {
          throw new GraphQLError(
            `Username "${args.username}" already exists.`,
            { extensions: { code: "USER_ALREADY_EXISTS" } }
          );
        }

        const user = await prisma.user.create({
          data: { username: args.username },
        });

        // If the user is null the creation process has failed
        if (!user) {
          throw new GraphQLError(`Failed to create the user.`, {
            extensions: { code: "USER_CREATION_FAILED" },
          });
        }

        return user;
      } catch (error) {
        throw new GraphQLError(`User creation error: ${error}.`, {
          extensions: { code: "USER_CREATION_ERROR" },
        });
      }
    },
  },
};

export default resolvers;
