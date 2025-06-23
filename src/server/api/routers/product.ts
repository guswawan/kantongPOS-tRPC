import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { supabaseAdmin } from "@/server/supabase-admin";
import { TRPCError } from "@trpc/server";
import { Bucket } from "@/server/bucket";

export const productRouter = createTRPCRouter({
  getProducts: protectedProcedure.query(async ({ ctx }) => {
    const products = await ctx.db.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        imageUrl: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return products;
  }),

  createProduct: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3).max(25),
        price: z.number().min(1000),
        categoryId: z.string(),
        imageUrl: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newProduct = await ctx.db.product.create({
        data: {
          name: input.name,
          price: input.price,
          category: {
            connect: {
              id: input.categoryId,
            },
          },
          imageUrl: input.imageUrl,
        },
      });

      return newProduct;
    }),

  createProductImageUploadPresignedUrl: protectedProcedure.mutation(
    async () => {
      const { data, error } = await supabaseAdmin.storage
        .from(Bucket.ProductImages)
        .createSignedUploadUrl(`${Date.now()}.jpg`);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return data;
    },
  ),

  deleteProductById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.product.delete({
        where: { id: input.id },
      });
    }),
});
