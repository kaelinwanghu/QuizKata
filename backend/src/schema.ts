import { gql } from "graphql-tag";

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    scores: [Score!]
  }

  type Question {
    text: String!
    answers: [Answer!]
    type: String!
  }

  type Answer {
    text: String!
    isCorrect: Boolean!
  }

  type Score {
    id: ID!
    score: Int!
    time: Float!
    username: String!
    amount: Int!
    category: String!
    difficulty: String!
    type: String!
  }

  type ScoreResponse {
    success: Boolean!
    message: String!
  }

  input LeaderboardQuery {
    username: String
    score: Int
    time: Float
    amount: Int
    category: String
    difficulty: String
    type: String
  }

  input QuizInput {
    amount: Int!
    category: String
    difficulty: String
    type: String
  }

  type QuizResponse {
    questions: [Question!]
  }

  type Query {
    users: [User!]!
    user(username: String!): User
    leaderboard(input: LeaderboardQuery!): [Score!]
    generateQuiz(input: QuizInput!): QuizResponse!
  }

  input QuizMetadata {
    amount: Int!
    category: String!
    difficulty: String!
    type: String!
  }

  type Mutation {
    createUser(username: String!): User!
    submitScore(
      username: String!
      quizData: QuizMetadata!
      score: Int!
      time: Float!
    ): ScoreResponse!
  }
`;

export default typeDefs;
