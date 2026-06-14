import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { z } from 'zod';

import { auditLogs } from '@/database/schemas/auditLog';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { withRbacPermission } from '@/business/server/trpc-middlewares/rbacPermission';

const auditLogProcedure = authedProcedure.use(serverDatabase).use(withRbacPermission('admin:access'));

export const auditLogRouter = router({
  query: auditLogProcedure
    .input(
      z.object({
        action: z.string().optional(),
        category: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().min(1).max(100).optional().default(50),
        offset: z.number().min(0).optional().default(0),
        startDate: z.string().optional(),
        userId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { serverDB } = ctx;
      const { userId, category, action, startDate, endDate, limit, offset } = input;

      const conditions: ReturnType<typeof eq>[] = [];

      if (userId) conditions.push(eq(auditLogs.userId, userId));
      if (category) conditions.push(eq(auditLogs.category, category));
      if (action) conditions.push(eq(auditLogs.action, action));
      if (startDate) conditions.push(gte(auditLogs.createdAt, new Date(startDate)));
      if (endDate) conditions.push(lte(auditLogs.createdAt, new Date(endDate)));

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const data = await serverDB
        .select()
        .from(auditLogs)
        .where(where)
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit)
        .offset(offset);

      return { data };
    }),
});

export type AuditLogRouter = typeof auditLogRouter;
