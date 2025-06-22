import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { type Category } from "@prisma/client";

//query -> fetching data (GET)
//mutation -> changing data(create, update, delete) (POST, PUT, DELETE)

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
        name: z.string().min(3, "Minimum of 3 characters"),
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

  deleteCategoryById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.category.delete({
        where: { id: input.id },
      });
    }),

  editCategoryById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3, "Minimum of 3 characters"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.category.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    }),
});
