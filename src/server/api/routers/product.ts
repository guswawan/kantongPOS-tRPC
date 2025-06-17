import { createTRPCRouter, protectedProcedure } from "../trpc";

export const productRouter = createTRPCRouter({
  getProducts: protectedProcedure.query(async ({ ctx }) => {
    const products = await ctx.db.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        image: true,
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
});
