// src/schema.ts
import { gql } from "graphql-tag";

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    scores: [Score!]!
  }

  type Quiz {
    id: ID!
    apiId: Int!
    title: String!
    questions: [Question!]!
    scores: [Score!]!
  }

  type Question {
    id: ID!
    text: String!
    answers: [Answer!]!
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

  type Query {
    users: [User!]!
    user(id: ID!): User
    quizzes: [Quiz!]!
    quiz(id: ID!): Quiz
    leaderboard: [LeaderboardEntry!]!
  }

  type Mutation {
    createUser(username: String!): User!
    submitScore(userId: ID!, quizId: ID!, value: Int!): Score!
  }
`;

export default typeDefs;
