import { and, asc, count, desc, eq, gte, ilike, or } from 'drizzle-orm';
import { z } from 'zod';

import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';

const adminProcedure = authedProcedure.use(serverDatabase);

export const adminRouter = router({
  /** 仪表盘统计数据 */
  getDashboardStats: adminProcedure.query(async ({ ctx }) => {
    const { serverDB } = ctx;

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [userCount] = await serverDB.select({ count: count() }).from(serverDB.users);
    const [sessionCount] = await serverDB.select({ count: count() }).from(serverDB.sessions);
    const [messageCount] = await serverDB.select({ count: count() }).from(serverDB.messages);
    const [kbCount] = await serverDB
      .select({ count: count() })
      .from(serverDB.knowledgeBases);

    // 7-day active sessions
    const [weeklyActiveRow] = await serverDB
      .select({ count: count() })
      .from(serverDB.sessions)
      .where(gte(serverDB.sessions.updatedAt, sevenDaysAgo));

    // 30-day active users
    const [monthlyActiveRow] = await serverDB
      .select({ count: count() })
      .from(serverDB.users)
      .where(gte(serverDB.users.lastActiveAt, thirtyDaysAgo));

    return {
      totalUsers: Number(userCount?.count ?? 0),
      totalSessions: Number(sessionCount?.count ?? 0),
      totalMessages: Number(messageCount?.count ?? 0),
      totalKnowledgeBases: Number(kbCount?.count ?? 0),
      weeklyActiveSessions: Number(weeklyActiveRow?.count ?? 0),
      monthlyActiveUsers: Number(monthlyActiveRow?.count ?? 0),
    };
  }),

  /** 会话存档列表 */
  querySessions: adminProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { serverDB } = ctx;
      const { sessions, users } = serverDB;

      let conditions = [];
      if (input.userId) {
        conditions.push(eq(sessions.userId, input.userId));
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const data = await serverDB
        .select({
          id: sessions.id,
          userId: sessions.userId,
          createdAt: sessions.createdAt,
          updatedAt: sessions.updatedAt,
          userEmail: users.email,
        })
        .from(sessions)
        .leftJoin(users, eq(sessions.userId, users.id))
        .where(whereClause)
        .orderBy(desc(sessions.updatedAt))
        .limit(input.limit)
        .offset(input.offset);

      const [totalRow] = await serverDB
        .select({ count: count() })
        .from(sessions)
        .where(whereClause);

      return {
        data: data.map((r) => ({
          id: r.id,
          user_id: r.userId,
          user_email: r.userEmail,
          created_at: r.createdAt,
          updated_at: r.updatedAt,
          message_count: 0,
        })),
        total: Number(totalRow?.count ?? 0),
      };
    }),

  /** 获取会话消息详情 */
  getSessionMessages: adminProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { serverDB } = ctx;
      const { messages } = serverDB;

      const data = await serverDB
        .select()
        .from(messages)
        .where(eq(messages.sessionId, input.sessionId))
        .orderBy(asc(messages.createdAt))
        .limit(500);

      return data;
    }),

  /** 用户列表（管理员视角） */
  listUsers: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { serverDB } = ctx;
      const { users } = serverDB;

      let conditions = [];
      if (input.search) {
        conditions.push(
          or(
            ilike(users.email, `%${input.search}%`),
            ilike(users.fullName, `%${input.search}%`),
          ),
        );
      }
      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const data = await serverDB
        .select({
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(where)
        .orderBy(desc(users.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const [totalRow] = await serverDB
        .select({ count: count() })
        .from(users)
        .where(where);

      return {
        data: data.map((u) => ({
          id: u.id,
          name: u.fullName,
          email: u.email,
          status: 'active',
          created_at: u.createdAt,
        })),
        total: Number(totalRow?.count ?? 0),
      };
    }),
});
