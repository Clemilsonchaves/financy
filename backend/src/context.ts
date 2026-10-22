import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";
import { PrismaClient } from "./generated/prisma/client.js";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

export const prisma = new PrismaClient({ adapter });

export interface Context {
  userId: string | null;
}

export function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET não definido");
  return secret;
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, jwtSecret(), { expiresIn: "7d" });
}

export function buildContext(authorization?: string): Context {
  const header = authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return { userId: null };
  try {
    const payload = jwt.verify(token, jwtSecret());
    return { userId: typeof payload === "object" ? (payload.sub as string) : null };
  } catch {
    return { userId: null };
  }
}

export function requireAuth(ctx: Context): string {
  if (!ctx.userId) {
    throw new GraphQLError("Não autenticado", { extensions: { code: "UNAUTHENTICATED" } });
  }
  return ctx.userId;
}
