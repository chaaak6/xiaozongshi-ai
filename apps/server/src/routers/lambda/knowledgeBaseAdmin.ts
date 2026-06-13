import { and, desc, eq, ilike } from 'drizzle-orm';
import { z } from 'zod';

import { knowledgeBasePermissions, knowledgeBases } from '@/database/schemas';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { withRbacPermission } from '@/business/server/trpc-middlewares/rbacPermission';

const kbAdminProcedure = authedProcedure.use(serverDatabase).use(withRbacPermission('admin:access'));

export const knowledgeBaseAdminRouter = router({
  listAll: kbAdminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { serverDB } = ctx;

      let conditions = [];
      if (input.search) {
        conditions.push(ilike(knowledgeBases.name, `%${input.search}%`));
      }
      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const data = await serverDB
        .select()
        .from(knowledgeBases)
        .where(where)
        .orderBy(desc(knowledgeBases.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return { data };
    }),

  grantPermission: kbAdminProcedure
    .input(
      z.object({
        knowledgeBaseId: z.string(),
        granteeType: z.enum(['user', 'role']),
        granteeId: z.string(),
        accessLevel: z.enum(['read', 'write', 'admin']),
        allowExport: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { serverDB } = ctx;

      await serverDB
        .insert(knowledgeBasePermissions)
        .values({
          knowledgeBaseId: input.knowledgeBaseId,
          granteeType: input.granteeType,
          granteeId: input.granteeId,
          accessLevel: input.accessLevel,
          allowExport: input.allowExport,
          grantedBy: ctx.userId,
        })
        .onConflictDoUpdate({
          target: [
            knowledgeBasePermissions.knowledgeBaseId,
            knowledgeBasePermissions.granteeType,
            knowledgeBasePermissions.granteeId,
          ],
          set: {
            accessLevel: input.accessLevel,
            allowExport: input.allowExport,
            updatedAt: new Date(),
          },
        });

      return { success: true };
    }),

  revokePermission: kbAdminProcedure
    .input(
      z.object({
        knowledgeBaseId: z.string(),
        granteeType: z.enum(['user', 'role']),
        granteeId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { serverDB } = ctx;

      await serverDB
        .delete(knowledgeBasePermissions)
        .where(
          and(
            eq(knowledgeBasePermissions.knowledgeBaseId, input.knowledgeBaseId),
            eq(knowledgeBasePermissions.granteeType, input.granteeType),
            eq(knowledgeBasePermissions.granteeId, input.granteeId),
          ),
        );

      return { success: true };
    }),
});
