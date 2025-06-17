import { db } from "@/server/db";
import { getAuth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";
import { type PrismaClient } from "@prisma/client";

interface CreateContextOptions {
  session: ReturnType<typeof getAuth>;
  db: PrismaClient;
}

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    db: opts.db,
  };
};

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req } = opts;

  const session = getAuth(req);

  return createInnerTRPCContext({
    session,
    db,
  });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session },
    },
  });
});

export const publicProcedure = t.procedure;
