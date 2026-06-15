import { and, asc, count, desc, eq, gte, ilike, or, sql } from 'drizzle-orm';
import { z } from 'zod';

import { knowledgeBases } from '@/database/schemas/file';
import { messages } from '@/database/schemas/message';
import { sessions } from '@/database/schemas/session';
import { users } from '@/database/schemas/user';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { withRbacPermission } from '@/business/server/trpc-middlewares/rbacPermission';

const adminProcedure = authedProcedure.use(serverDatabase).use(withRbacPermission('admin:access'));

export const adminRouter = router({
  /** 仪表盘统计数据 */
  getDashboardStats: adminProcedure.query(async ({ ctx }) => {
    const { serverDB } = ctx;

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [userCount] = await serverDB.select({ count: count() }).from(users);
    const [sessionCount] = await serverDB.select({ count: count() }).from(sessions);
    const [messageCount] = await serverDB.select({ count: count() }).from(messages);
    const [kbCount] = await serverDB
      .select({ count: count() })
      .from(knowledgeBases);

    // 7-day active sessions
    const [weeklyActiveRow] = await serverDB
      .select({ count: count() })
      .from(sessions)
      .where(gte(sessions.updatedAt, sevenDaysAgo));

    // 7-day active users (UV)
    const [monthlyActiveRow] = await serverDB
      .select({ count: count() })
      .from(users)
      .where(gte(users.lastActiveAt, thirtyDaysAgo));

    // Total tokens consumed (from messages.usage JSONB)
    const [tokenRow] = await serverDB.execute(
      sql`SELECT COALESCE(SUM(COALESCE((usage->>'totalTokens')::int, 0)), 0) as total FROM messages`
    );
    const totalTokens = tokenRow?.rows?.[0]?.total ? Number(tokenRow.rows[0].total) : 0;

    // 7-day messages
    const [msg7d] = await serverDB
      .select({ count: count() })
      .from(messages)
      .where(gte(messages.createdAt, sevenDaysAgo));

    // 7-day active users (unique userId in messages)
    const uv7d = await serverDB
      .select({ userId: messages.userId })
      .from(messages)
      .where(gte(messages.createdAt, sevenDaysAgo))
      .groupBy(messages.userId);
    const uniqueUsers7d = new Set(uv7d.map(r => r.userId)).size;

    return {
      totalUsers: Number(userCount?.count ?? 0),
      totalSessions: Number(sessionCount?.count ?? 0),
      totalMessages: Number(messageCount?.count ?? 0),
      totalKnowledgeBases: Number(kbCount?.count ?? 0),
      totalTokens,
      messagesLast7d: Number(msg7d?.count ?? 0),
      activeUsers7d: uniqueUsers7d,
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

      let conditions = [];
      if (input.userId) {
        conditions.push(eq(sessions.userId, input.userId));
      }
      if (input.search) {
        conditions.push(
          or(
            ilike(users.email, `%${input.search}%`),
            ilike(sessions.groupId, `%${input.search}%`),
          ),
        );
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

  /** 创建用户 */
  createUser: adminProcedure
    .input(z.object({
      email: z.string().email(),
      fullName: z.string().min(1).max(100),
      password: z.string().min(8),
    }))
    .mutation(async ({ ctx, input }) => {
      const { serverDB } = ctx;
      const id = 'user_' + Date.now().toString(36);
      await serverDB.insert(users).values({
        id,
        email: input.email,
        fullName: input.fullName,
      });
      return { id };
    }),

  /** 更新用户 */
  updateUser: adminProcedure
    .input(z.object({
      id: z.string(),
      fullName: z.string().min(1).max(100).optional(),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { serverDB } = ctx;
      const { id, ...fields } = input;
      if (Object.keys(fields).length === 0) return { success: true };
      await serverDB.update(users).set(fields).where(eq(users.id, id));
      return { success: true };
    }),

  /** 删除用户 */
  deleteUser: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { serverDB } = ctx;
      await serverDB.delete(users).where(eq(users.id, input.id));
      return { success: true };
    }),
});
