// src/resolvers.ts
import { GraphQLError } from "graphql";
import prisma from "./prisma";
import {
  QuizResponse,
  QuizQuestion,
  fetchQuizQuestions,
} from "./openTriviaAPI";

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
        if (error instanceof GraphQLError) {
          throw error;
        } else {
          throw new GraphQLError(`Failed to get users: ${error}`, {
            extensions: { code: "GET_USERS_FAILED" },
          });
        }
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
        if (error instanceof GraphQLError) {
          throw error;
        } else {
          throw new GraphQLError(`Failed to fetch user: ${error}`, {
            extensions: { code: "GET_USER_FAILED" },
          });
        }
      }
    },

    /**
     * Generates a quiz by fetching questions from the Open Trivia Database API
     *
     * @param _parent required for GraphQL resolvers but unused
     * @param args contains the quiz input, including amount, category, difficulty, and type
     * @returns the quiz response containing the questions
     */
    generateQuiz: async (
      _parent: any,
      args: {
        input: {
          amount: number;
          category?: string;
          difficulty?: string;
          type?: string;
        };
      }
    ) => {
      try {
        // Call fetchQuizQuestions which will process the request for the frontend
        const quizData: QuizResponse = await fetchQuizQuestions(args.input);

        if (quizData.response_code !== 0) {
          throw new GraphQLError(
            "Failed to generate quiz, API response code: " +
              quizData.response_code,
            { extensions: { code: "QUIZ_API_FAILURE" } }
          );
        }
        console.log("quizData: ", JSON.stringify(quizData, null, 2));

        // Convert the API response to match the return schema
        const questions = quizData.results.map((question: QuizQuestion) => ({
          text: question.question,
          answers: [
            // Correct answer can just be set
            { text: question.correct_answer, isCorrect: true },
            // Multiple incorrect answers, need to be mapped
            ...question.incorrect_answers.map((answer) => ({
              text: answer,
              isCorrect: false,
            })),
          ],
          type: question.type,
        }));

        console.log("questions: ", JSON.stringify(questions, null, 2));

        return { questions };
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        } else {
          console.error(error);
          throw new GraphQLError(`Failed to generate quiz: ${error}`, {
            extensions: { code: "QUIZ_API_ERROR" },
          });
        }
      }
    },

    /**
     * Gets a leaderboard of all quizzes above a certain criteria
     *
     * @param _parent required for GraphQL resolvers but unused
     * @param args contains the quiz data to be submitted
     * @returns the fully created quiz object, or null if no quizzes
     */
    leaderboard: async (_parent: any, args: { input: any }) => {
      const {
        username,
        score,
        time,
        amount: questionAmount,
        category,
        difficulty,
        type,
      } = args.input;
      try {
        const scores = await prisma.score.findMany({
          where: {
            ...(questionAmount && { amount: questionAmount }),
            ...(username && { user: { username } }),
            ...(score && { score: { gte: score } }),
            ...(time && { time: { lte: time } }),
            ...(category && { category }),
            ...(difficulty && { difficulty }),
            ...(type && { type }),
          },
          orderBy: [{ score: "desc" }, { time: "asc" }], // First order by score, then by time
          include: {
            user: true, // To include username in the response
          },
        });

        return scores.map((score) => ({
          id: score.id,
          score: score.score,
          time: score.time,
          username: score.user.username,
          amount: score.amount,
          category: score.category,
          difficulty: score.difficulty,
          type: score.type,
        }));
      } catch (error) {
        throw new GraphQLError(`Error getting leaderboard: ${error}`, {
          extensions: { code: "LEADERBOARD_QUERY_ERROR" },
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
        // Let error propagate to be more accurate if it is an internal GraphQL error
        if (error instanceof GraphQLError) {
          throw error;
        } else {
          throw new GraphQLError(`User creation error: ${error}.`, {
            extensions: { code: "USER_CREATION_ERROR" },
          });
        }
      }
    },

    /**
     * Submits a score for a user along with quiz metadata.
     *
     * @param _parent required for GraphQL resolvers but unused
     * @param args contains username, score, time, and quiz metadata
     * @returns the newly created score object
     */
    submitScore: async (
      _parent: any,
      args: {
        // Pretty clunky but there aren't good ways to get GraphQL input types
        username: string;
        quizData: {
          category: string;
          difficulty: string;
          type: string;
          amount: number;
        };
        score: number;
        time: number;
      }
    ) => {
      const { username, quizData, score, time } = args;

      try {
        const user = await prisma.user.findUnique({
          where: { username },
        });

        if (!user) {
          throw new GraphQLError(
            `User with username "${username}" not found.`,
            { extensions: { code: "USER_NOT_FOUND" } }
          );
        }

        const newScore = await prisma.score.create({
          data: {
            score,
            time: time,
            amount: quizData.amount,
            category: quizData.category,
            difficulty: quizData.difficulty,
            type: quizData.type,
            user: {
              connect: { id: user.id }, // Has to be connected with userId to be updated correctly
            },
          },
        });

        if (!newScore) {
          throw new GraphQLError(`Failed to submit the score.`, {
            extensions: { code: "SCORE_SUBMISSION_FAILED" },
          });
        }

        // Can replace with ID response later if necessary
        return {
          success: true,
          message: "Score submitted successfully",
        };
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        } else {
          throw new GraphQLError(`Error submitting scores: ${error}`, {
            extensions: { code: "SUBMIT_SCORE_ERROR" },
          });
        }
      }
    },
  },
};

export default resolvers;
