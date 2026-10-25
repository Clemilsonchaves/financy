export const typeDefs = /* GraphQL */ `
  scalar DateTime

  enum TransactionType {
    INCOME
    EXPENSE
  }

  type User {
    id: ID!
    name: String!
    email: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Category {
    id: ID!
    name: String!
    description: String
    icon: String
    color: String
  }

  type Transaction {
    id: ID!
    description: String!
    amount: Float!
    type: TransactionType!
    date: DateTime!
    category: Category
  }

  type Query {
    me: User!
    categories: [Category!]!
    transactions: [Transaction!]!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    updateProfile(name: String!): User!

    createCategory(name: String!, description: String, icon: String, color: String): Category!
    updateCategory(id: ID!, name: String, description: String, icon: String, color: String): Category!
    deleteCategory(id: ID!): Boolean!

    createTransaction(
      description: String!
      amount: Float!
      type: TransactionType!
      date: DateTime
      categoryId: ID
    ): Transaction!
    updateTransaction(
      id: ID!
      description: String
      amount: Float
      type: TransactionType
      date: DateTime
      categoryId: ID
    ): Transaction!
    deleteTransaction(id: ID!): Boolean!
  }
`;
