import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";

export const profileRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const [user] = await clerkClient.users.getUserList({
        username: [input.username],
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return {
        id: user.id,
        username: user.username,
        imageUrl: user.imageUrl,
      };
    }),
});
