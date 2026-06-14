import { desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';

import { aiProviders } from '@/database/schemas/aiInfra';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { withRbacPermission } from '@/business/server/trpc-middlewares/rbacPermission';

const providerAdminProcedure = authedProcedure
  .use(serverDatabase)
  .use(withRbacPermission('admin:access'));

export const adminProviderRouter = router({
  /** 管理员列出所有 AI 供应商 */
  listAll: providerAdminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { serverDB } = ctx;

      const data = await serverDB
        .select({
          id: aiProviders.id,
          name: aiProviders.name,
          userId: aiProviders.userId,
          enabled: aiProviders.enabled,
          source: aiProviders.source,
          checkModel: aiProviders.checkModel,
          keyVaults: aiProviders.keyVaults,
          createdAt: aiProviders.accessedAt,
        })
        .from(aiProviders)
        .orderBy(desc(aiProviders.accessedAt))
        .limit(input.limit)
        .offset(input.offset);

      // Mask API keys — only show whether they're set
      const safe = data.map((r) => ({
        ...r,
        hasApiKey: !!(r.keyVaults as any)?.apiKey,
        hasBaseURL: !!(r.keyVaults as any)?.baseURL,
        keyVaults: undefined,
        enabled: r.enabled ?? false,
      }));

      return { data: safe, total: safe.length };
    }),

  /** 管理员启用/禁用供应商 */
  toggleEnabled: providerAdminProcedure
    .input(
      z.object({
        providerId: z.string(),
        userId: z.string(),
        enabled: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { serverDB } = ctx;

      await serverDB
        .update(aiProviders)
        .set({ enabled: input.enabled })
        .where(
          sql`${aiProviders.id} = ${input.providerId} AND ${aiProviders.userId} = ${input.userId}`,
        );

      return { success: true };
    }),
});
