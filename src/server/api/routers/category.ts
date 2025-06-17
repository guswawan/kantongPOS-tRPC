import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { type Category } from "@prisma/client";

//query -> fetching data
//mutation -> changing data(create, update, delete)

export const categoryRouter = createTRPCRouter({
  getCategories: protectedProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.category.findMany({
      select: {
        id: true,
        name: true,
        productCount: true,
      },
    });

    return categories;
  }),

  createCategory: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3, "Min 3 characters"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newCategory = await ctx.db.category.create({
        data: {
          name: input.name,
        },
        select: {
          id: true,
          name: true,
          productCount: true,
        },
      });

      return newCategory;
    }),
});
