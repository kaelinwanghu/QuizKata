import resolvers from "../resolvers";
import { prismaMock } from "../jest.setup";
import { GraphQLError } from "graphql";

describe("User Resolvers", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Query: users", () => {
    it("Should return all users successfully", async () => {
      const mockUsers = [
        { id: 1, username: "user1" },
        { id: 2, username: "user2" },
      ];

      prismaMock.user.findMany.mockResolvedValue(mockUsers);

      const result = await resolvers.Query.users(null, null);

      expect(result).toEqual(mockUsers);
      expect(prismaMock.user.findMany).toHaveBeenCalledTimes(1);
    });

    it("Should throw an error if Prisma fails during users query", async () => {
      prismaMock.user.findMany.mockRejectedValue(new Error("Prisma error"));

      await expect(resolvers.Query.users(null, null)).rejects.toThrow(
        GraphQLError
      );

      expect(prismaMock.user.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe("Query: user", () => {
    it("Should return a user when found by username", async () => {
      const mockUser = { id: 1, username: "user1" };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await resolvers.Query.user(null, { username: "user1" });

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { username: "user1" },
      });
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it("Should throw an error if the user is not found", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        resolvers.Query.user(null, { username: "does not exist" })
      ).rejects.toThrow(GraphQLError);

      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it("Should throw an error if Prisma fails during user query", async () => {
      prismaMock.user.findUnique.mockRejectedValue(new Error("Prisma error"));

      await expect(
        resolvers.Query.user(null, { username: "user1" })
      ).rejects.toThrow(
        new GraphQLError("Failed to fetch user: Error: Prisma error")
      );

      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe("Mutation: createUser", () => {
    it("Should create and return a new user", async () => {
      const mockNewUser = { id: 1, username: "newUser" };

      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(mockNewUser);

      const result = await resolvers.Mutation.createUser(null, {
        username: "newUser",
      });
      expect(result).toEqual(mockNewUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { username: "newUser" },
      });
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: { username: "newUser" },
      });
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
    });

    it("Should throw an error if the username already exists", async () => {
      const mockExistingUser = { id: 1, username: "alreadyExists" };

      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.findUnique.mockResolvedValue(mockExistingUser);

      await expect(
        resolvers.Mutation.createUser(null, { username: "alreadyExists" })
      ).rejects.toThrow(GraphQLError);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { username: "alreadyExists" },
      });
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it("Should throw an error if Prisma fails during user creation", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockRejectedValue(new Error("Prisma error"));
      await expect(
        resolvers.Mutation.createUser(null, { username: "newUser" })
      ).rejects.toThrow(GraphQLError);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { username: "newUser" },
      });
      expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
    });
  });
});
