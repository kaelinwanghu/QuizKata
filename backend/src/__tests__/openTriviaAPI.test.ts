import resolvers from "../resolvers";
import { fetchQuizQuestions } from "../openTriviaAPI";
import { GraphQLError } from "graphql";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

jest.mock("../openTriviaAPI");
const mockAxios = new MockAdapter(axios);

describe("generateQuiz resolver", () => {
  afterEach(() => {
    jest.resetAllMocks();
    mockAxios.reset();
  });

  it("Should generate a quiz with valid API response", async () => {
    // Mock the fetchQuizQuestions function
    const mockQuizResponse = {
      response_code: 0,
      results: [
        {
          question: "What is the capital of France?",
          correct_answer: "Paris",
          incorrect_answers: ["London", "Berlin", "Rome"],
          type: "multiple",
        },
      ],
    };

    (fetchQuizQuestions as jest.Mock).mockResolvedValue(mockQuizResponse);

    const args = {
      input: {
        amount: 1,
        category: "general knowledge",
        difficulty: "easy",
        type: "multiple",
      },
    };

    const result = await resolvers.Query.generateQuiz(null, args);

    expect(result).toEqual([
      {
        text: "What is the capital of France?",
        answers: [
          { text: "Paris", isCorrect: true },
          { text: "London", isCorrect: false },
          { text: "Berlin", isCorrect: false },
          { text: "Rome", isCorrect: false },
        ],
        type: "multiple",
      },
    ]);

    expect(fetchQuizQuestions).toHaveBeenCalledWith(args.input);
  });

  it("Should throw an error when API response code is not 0", async () => {
    const mockErrorResponse = {
      response_code: 1, // API failure
      results: [],
    };

    (fetchQuizQuestions as jest.Mock).mockResolvedValue(mockErrorResponse);

    const args = {
      input: {
        amount: 1,
        category: "general knowledge",
        difficulty: "easy",
        type: "multiple",
      },
    };

    await expect(resolvers.Query.generateQuiz(null, args)).rejects.toThrow(
      GraphQLError
    );

    expect(fetchQuizQuestions).toHaveBeenCalledWith(args.input);
  });

  it("Should handle axios error during API call", async () => {
    (fetchQuizQuestions as jest.Mock).mockRejectedValue(
      new Error("Network Error")
    );

    const args = {
      input: {
        amount: 1,
        category: "GenEraL kNowLedGE",
        difficulty: "easy",
        type: "multiple",
      },
    };

    await expect(resolvers.Query.generateQuiz(null, args)).rejects.toThrow(
      GraphQLError
    );

    expect(fetchQuizQuestions).toHaveBeenCalledWith(args.input);
  });
});
