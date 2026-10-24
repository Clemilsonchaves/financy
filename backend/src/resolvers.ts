import bcrypt from "bcryptjs";
import { GraphQLError, GraphQLScalarType, Kind } from "graphql";
import { Context, prisma, requireAuth, signToken } from "./context.js";

const fail = (message: string, code = "BAD_USER_INPUT"): never => {
  throw new GraphQLError(message, { extensions: { code } });
};

function toDate(v: unknown): Date {
  const d = new Date(v as string);
  return isNaN(d.getTime()) ? fail("Data inválida") : d;
}

const DateTime = new GraphQLScalarType({
  name: "DateTime",
  serialize: (v) => (v instanceof Date ? v.toISOString() : String(v)),
  parseValue: (v) => toDate(v),
  parseLiteral: (ast) => (ast.kind === Kind.STRING ? toDate(ast.value) : fail("Data inválida")),
});

async function ownCategory(userId: string, id: string) {
  const c = await prisma.category.findFirst({ where: { id, userId } });
  return c ?? fail("Categoria não encontrada", "NOT_FOUND");
}

async function ownTransaction(userId: string, id: string) {
  const t = await prisma.transaction.findFirst({ where: { id, userId } });
  return t ?? fail("Transação não encontrada", "NOT_FOUND");
}

function validAmount(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) fail("O valor deve ser maior que zero");
}

export const resolvers = {
  DateTime,
  Query: {
    me: async (_: unknown, __: unknown, ctx: Context) => {
      const user = await prisma.user.findUnique({ where: { id: requireAuth(ctx) } });
      return user ?? fail("Não autenticado", "UNAUTHENTICATED");
    },
    categories: (_: unknown, __: unknown, ctx: Context) =>
      prisma.category.findMany({ where: { userId: requireAuth(ctx) }, orderBy: { name: "asc" } }),
    transactions: (_: unknown, __: unknown, ctx: Context) =>
      prisma.transaction.findMany({
        where: { userId: requireAuth(ctx) },
        include: { category: true },
        orderBy: { date: "desc" },
      }),
  },
  Mutation: {
    register: async (_: unknown, a: { name: string; email: string; password: string }) => {
      const email = a.email.trim().toLowerCase();
      if (!a.name.trim()) fail("Nome obrigatório");
      if (!/^\S+@\S+\.\S+$/.test(email)) fail("E-mail inválido");
      if (a.password.length < 8) fail("A senha deve ter ao menos 8 caracteres");
      if (await prisma.user.findUnique({ where: { email } })) fail("E-mail já cadastrado");
      const user = await prisma.user.create({
        data: { name: a.name.trim(), email, password: await bcrypt.hash(a.password, 10) },
      });
      return { token: signToken(user.id), user };
    },
    login: async (_: unknown, a: { email: string; password: string }) => {
      const user = await prisma.user.findUnique({ where: { email: a.email.trim().toLowerCase() } });
      if (!user || !(await bcrypt.compare(a.password, user.password))) {
        return fail("Credenciais inválidas", "UNAUTHENTICATED");
      }
      return { token: signToken(user.id), user };
    },

    createCategory: async (_: unknown, a: { name: string; description?: string }, ctx: Context) => {
      const userId = requireAuth(ctx);
      const name = a.name.trim();
      if (!name) fail("Nome obrigatório");
      if (await prisma.category.findFirst({ where: { userId, name } })) fail("Categoria já existe");
      return prisma.category.create({ data: { name, description: a.description, userId } });
    },
    updateCategory: async (
      _: unknown,
      a: { id: string; name?: string; description?: string },
      ctx: Context,
    ) => {
      const userId = requireAuth(ctx);
      await ownCategory(userId, a.id);
      const name = a.name?.trim();
      if (a.name != null && !name) fail("Nome obrigatório");
      if (name && (await prisma.category.findFirst({ where: { userId, name, NOT: { id: a.id } } }))) {
        fail("Categoria já existe");
      }
      return prisma.category.update({
        where: { id: a.id },
        data: { name, description: a.description },
      });
    },
    deleteCategory: async (_: unknown, a: { id: string }, ctx: Context) => {
      await ownCategory(requireAuth(ctx), a.id);
      await prisma.category.delete({ where: { id: a.id } });
      return true;
    },

    createTransaction: async (
      _: unknown,
      a: { description: string; amount: number; type: string; date?: Date; categoryId?: string },
      ctx: Context,
    ) => {
      const userId = requireAuth(ctx);
      validAmount(a.amount);
      if (!a.description.trim()) fail("Descrição obrigatória");
      if (a.categoryId) await ownCategory(userId, a.categoryId);
      return prisma.transaction.create({
        data: {
          description: a.description.trim(),
          amount: a.amount,
          type: a.type,
          date: a.date ?? new Date(),
          categoryId: a.categoryId,
          userId,
        },
        include: { category: true },
      });
    },
    updateTransaction: async (
      _: unknown,
      a: {
        id: string;
        description?: string;
        amount?: number;
        type?: string;
        date?: Date;
        categoryId?: string | null;
      },
      ctx: Context,
    ) => {
      const userId = requireAuth(ctx);
      await ownTransaction(userId, a.id);
      if (a.amount != null) validAmount(a.amount);
      if (a.description != null && !a.description.trim()) fail("Descrição obrigatória");
      if (a.categoryId) await ownCategory(userId, a.categoryId);
      return prisma.transaction.update({
        where: { id: a.id },
        data: {
          description: a.description?.trim(),
          amount: a.amount ?? undefined,
          type: a.type ?? undefined,
          date: a.date ?? undefined,
          categoryId: a.categoryId,
        },
        include: { category: true },
      });
    },
    deleteTransaction: async (_: unknown, a: { id: string }, ctx: Context) => {
      await ownTransaction(requireAuth(ctx), a.id);
      await prisma.transaction.delete({ where: { id: a.id } });
      return true;
    },
  },
};
