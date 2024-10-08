import axios from "axios";
import { GraphQLError } from "graphql";

interface QuizRequest {
  amount: number;
  category?: string; // Accept category as a string from the frontend
  difficulty?: string; // Accept string for difficulty
  type?: string; // Accept string for type
}

export interface QuizQuestion {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  type: "multiple" | "boolean";
}

export interface QuizResponse {
  response_code: number;
  results: QuizQuestion[];
}

const API_URL = "https://opentdb.com/api.php";

/**
 * Maps the input difficulty to a valid API difficulty.
 * Ensures the difficulty is either "easy", "medium", or "hard".
 *
 * @param difficulty the entered difficulty of the quiz
 * @returns string the selected difficulty, or undefined if the difficulty is not accounted for
 */
const mapDifficulty = (
  difficulty?: string
): "easy" | "medium" | "hard" | undefined => {
  switch (difficulty?.toLowerCase()) {
    case "easy":
      return "easy";
    case "medium":
      return "medium";
    case "hard":
      return "hard";
    default:
      return undefined; // No difficulty selected or invalid input
  }
};

/**
 * Maps human-readable category names to their corresponding category IDs.
 * Why doesn't the Quiz Database give a guide for this? Who knows...
 *
 * @param category the entered category of the quiz
 * @returns string the selected category of the quiz, or undefined if the difficulty is not accounted for
 */
const mapCategory = (category?: string): number | undefined => {
  // At this point why not just give the developers the mappings or use strings instead of numbers for categories
  switch (category?.toLowerCase()) {
    case "general knowledge":
      return 9;
    case "entertainment: books":
      return 10;
    case "entertainment: film":
      return 11;
    case "entertainment: music":
      return 12;
    case "entertainment: musicals & theatres":
      return 13;
    case "entertainment: television":
      return 14;
    case "entertainment: video games":
      return 15;
    case "entertainment: board games":
      return 16;
    case "science & nature":
      return 17;
    case "science: computers":
      return 18;
    case "science: mathematics":
      return 19;
    case "mythology":
      return 20;
    case "sports":
      return 21;
    case "geography":
      return 22;
    case "history":
      return 23;
    case "politics":
      return 24;
    case "art":
      return 25;
    // Keeping it to 25 for my own sanity
    default:
      return undefined; // No category selected or invalid input
  }
};

/**
 * Maps the input type to either "multiple" or "boolean".
 */
const mapType = (type?: string): "multiple" | "boolean" | undefined => {
  switch (type?.toLowerCase()) {
    case "multiple":
      return "multiple";
    case "boolean":
      return "boolean";
    default:
      return undefined; // No type selected or invalid input
  }
};

/**
 * Validates the amount of questions requested.
 * Ensures the amount is a positive integer and not null or undefined.
 *
 * @param amount the amount of quiz questions
 * @returns number the amount of quiz questions, if not specified correctly throw an error
 */
const validateAmount = (amount: number): number => {
  if (isNaN(amount) || amount < 1 || !Number.isInteger(amount)) {
    throw new GraphQLError(
      `Invalid amount specified. Amount must be a positive integer.`,
      { extensions: { code: "INVALID_AMOUNT_SPECIFIED" } }
    );
  }
  return amount;
};

/**
 * Fetches quiz questions from the Open Trivia Database API
 *
 * @param request - The quiz request containing amount, category, difficulty, and type
 * @returns The quiz questions and API response code
 */
export async function fetchQuizQuestions(
  request: QuizRequest
): Promise<QuizResponse> {
  try {
    const params: any = {
      amount: validateAmount(request.amount), // Ensure amount is valid
    };

    const categoryID = mapCategory(request.category);
    if (categoryID) {
      params.category = categoryID;
    }

    const difficulty = mapDifficulty(request.difficulty);
    if (difficulty) {
      params.difficulty = difficulty;
    }

    const type = mapType(request.type);
    if (type) {
      params.type = type;
    }

    const response = await axios.get(API_URL, { params });

    return response.data as QuizResponse;
  } catch (error) {
    console.error(`Error fetching quiz questions: ${error}`);
    throw new GraphQLError(`Error fetching quiz questions from trivia API.`, {
      extensions: { code: "QUIZ_API_ERROR" },
    });
  }
}
