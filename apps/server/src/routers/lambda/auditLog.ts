import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { z } from 'zod';

import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';

const auditLogProcedure = authedProcedure.use(serverDatabase);

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

      if (userId) conditions.push(eq(serverDB.auditLogs.userId, userId));
      if (category) conditions.push(eq(serverDB.auditLogs.category, category));
      if (action) conditions.push(eq(serverDB.auditLogs.action, action));
      if (startDate) conditions.push(gte(serverDB.auditLogs.createdAt, new Date(startDate)));
      if (endDate) conditions.push(lte(serverDB.auditLogs.createdAt, new Date(endDate)));

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const data = await serverDB
        .select()
        .from(serverDB.auditLogs)
        .where(where)
        .orderBy(desc(serverDB.auditLogs.createdAt))
        .limit(limit)
        .offset(offset);

      return { data };
    }),
});

export type AuditLogRouter = typeof auditLogRouter;
