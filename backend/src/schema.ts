import { gql } from "graphql-tag";

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    scores: [Score!]!
  }

  type Quiz {
    id: ID!
    title: String!
    questions: [Question!]!
    scores: [Score!]!
  }

  type Question {
    id: ID!
    text: String!
    answers: [Answer!]!
    type: String!
  }

  type Answer {
    id: ID!
    text: String!
    isCorrect: Boolean!
  }

  type Score {
    id: ID!
    value: Int!
    user: User!
    quiz: Quiz!
  }

  type LeaderboardEntry {
    user: User!
    score: Int!
  }

  input QuizInput {
    amount: Int!
    category: Int
    difficulty: String
    type: String
  }

  type QuizResponse {
    questions: [Question!]!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    quizzes: [Quiz!]!
    quiz(id: ID!): Quiz
    leaderboard: [LeaderboardEntry!]!
    generateQuiz(input: QuizInput!): QuizResponse!
  }

  type Mutation {
    createUser(username: String!): User!
    submitScore(userId: ID!, quizId: ID!, value: Int!): Score!
  }
`;

export default typeDefs;
