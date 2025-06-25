import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const orderRouter = createTRPCRouter({
  createOrder: protectedProcedure
    .input(
      z.object({
        orderItems: z.array(
          z.object({
            productId: z.string(),
            quantity: z.number().min(1),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const products = await ctx.db.product.findMany({
        where: {
          id: {
            in: input.orderItems.map((item) => item.productId),
          },
        },
      });

      let subtotal = 0;

      products.forEach((product) => {
        const productQuantity = input.orderItems.find(
          (item) => item.productId === product.id,
        )!.quantity;

        const totalprice = product.price * productQuantity;

        subtotal += totalprice;
      });

      const tax = subtotal * 0.1;
      const grandTotal = subtotal + tax;

      const order = await ctx.db.order.create({
        data: {
          subtotal,
          tax,
          grandTotal,
        },
      });

      const orderItems = await ctx.db.orderItem.createMany({
        data: products.map((product) => {
          const productQuantity = input.orderItems.find(
            (item) => item.productId === product.id,
          )!.quantity;

          return {
            orderId: order.id,
            productId: product.id,
            price: product.price,
            quantity: productQuantity,
          };
        }),
      });

      return {
        order,
        orderItems,
      };
    }),
});
