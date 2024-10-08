import resolvers from "../resolvers";
import { prismaMock } from "../jest.setup";
import { GraphQLError } from "graphql";

describe("Score Resolvers", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Query: leaderboard", () => {
    it("Should return the leaderboard successfully with sorted scores", async () => {
      const mockScores = [
        {
          id: 2,
          userId: 2,
          score: 13,
          time: 100,
          amount: 15,
          category: "random",
          difficulty: "easy",
          type: "multiple",
          user: { id: 2, username: "user2" },
        },
        {
          id: 1,
          userId: 1,
          score: 8,
          time: 120,
          amount: 15,
          category: "random",
          difficulty: "easy",
          type: "multiple",
          user: { id: 1, username: "user1" },
        },
      ];

      prismaMock.score.findMany.mockResolvedValue(mockScores);

      const result = await resolvers.Query.leaderboard(null, {
        input: { score: 5 },
      });

      expect(result).toEqual([
        {
          id: 2,
          username: "user2",
          score: 13,
          time: 100,
          amount: 15,
          category: "random",
          difficulty: "easy",
          type: "multiple",
        },
        {
          id: 1,
          username: "user1",
          score: 8,
          time: 120,
          amount: 15,
          category: "random",
          difficulty: "easy",
          type: "multiple",
        },
      ]);
      expect(prismaMock.score.findMany).toHaveBeenCalledTimes(1);
    });

    it("Should return an empty leaderboard if no scores match criteria", async () => {
      prismaMock.score.findMany.mockResolvedValue([]);

      const result = await resolvers.Query.leaderboard(null, {
        input: { score: 10 },
      });

      expect(result).toEqual([]);
      expect(prismaMock.score.findMany).toHaveBeenCalledTimes(1);
    });

    it("Should throw an error if Prisma fails during leaderboard query", async () => {
      prismaMock.score.findMany.mockRejectedValue(new Error("Random error"));

      await expect(
        resolvers.Query.leaderboard(null, { input: { score: 5 } })
      ).rejects.toThrow(GraphQLError);

      expect(prismaMock.score.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe("Mutation: submitScore", () => {
    it("Should submit score successfully", async () => {
      const mockUser = { id: 1, username: "user1" };
      const mockScore = {
        id: 1,
        userId: 1,
        score: 8,
        time: 120,
        amount: 10,
        category: "science",
        difficulty: "easy",
        type: "multiple choice",
        user: mockUser,
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.score.create.mockResolvedValue(mockScore);

      const result = await resolvers.Mutation.submitScore(null, {
        username: "user1",
        quizData: {
          amount: 10,
          category: "science",
          difficulty: "easy",
          type: "multiple choice",
        },
        score: 8,
        time: 120,
      });

      expect(result).toEqual({
        success: true,
        message: "Score submitted successfully",
      });
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.score.create).toHaveBeenCalledTimes(1);
    });

    it("Should throw an error if user cannot be found", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        resolvers.Mutation.submitScore(null, {
          username: "user1",
          quizData: {
            amount: 10,
            category: "science",
            difficulty: "easy",
            type: "multiple choice",
          },
          score: 8,
          time: 120,
        })
      ).rejects.toThrow(GraphQLError);

      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.score.create).not.toHaveBeenCalled();
    });
    it("Should throw error if creating the score fails", async () => {
      const mockUser = { id: 1, username: "user1" };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.score.create.mockRejectedValue(new Error("Prisma error"));

      await expect(
        resolvers.Mutation.submitScore(null, {
          username: "user1",
          quizData: {
            amount: 10,
            category: "science",
            difficulty: "easy",
            type: "multiple choice",
          },
          score: 8,
          time: 120,
        })
      ).rejects.toThrow(GraphQLError);

      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.score.create).toHaveBeenCalledTimes(1);
    });

    it("Should return specific error when creating score throws GraphQL error", async () => {
      const mockUser = { id: 1, username: "user1" };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.score.create.mockRejectedValue(
        new GraphQLError("Failed to submit the score.", {
          extensions: { code: "SCORE_SUBMISSION_FAILED" },
        })
      );

      await expect(
        resolvers.Mutation.submitScore(null, {
          username: "user1",
          quizData: {
            amount: 10,
            category: "science",
            difficulty: "easy",
            type: "multiple choice",
          },
          score: 8,
          time: 120,
        })
      ).rejects.toThrow(GraphQLError);

      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.score.create).toHaveBeenCalledTimes(1);
    });
  });
});
