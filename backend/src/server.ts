import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { Context, buildContext, jwtSecret } from "./context.js";
import { resolvers } from "./resolvers.js";
import { typeDefs } from "./schema.js";

jwtSecret();

const server = new ApolloServer<Context>({ typeDefs, resolvers });

const port = Number(process.env.PORT) || 4000;
// O servidor standalone do Apollo já habilita CORS por padrão
const { url } = await startStandaloneServer(server, {
  listen: { port },
  context: async ({ req }) => buildContext(req.headers.authorization),
});

console.log(`GraphQL em ${url}`);
