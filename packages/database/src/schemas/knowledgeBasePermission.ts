import { boolean, index, pgTable, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

import { createNanoId } from '../utils/idGenerator';
import { createdAt, updatedAt } from './_helpers';

export const knowledgeBasePermissions = pgTable(
  'knowledge_base_permissions',
  {
    id: text('id')
      .$defaultFn(() => createNanoId(16)())
      .notNull()
      .primaryKey(),
    knowledgeBaseId: text('knowledge_base_id').notNull(),
    granteeType: varchar('grantee_type', { length: 16 }).notNull(),
    granteeId: text('grantee_id').notNull(),
    accessLevel: varchar('access_level', { length: 16 }).notNull().default('read'),
    allowExport: boolean('allow_export').notNull().default(false),
    grantedBy: text('granted_by').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index('kbp_knowledge_base_idx').on(table.knowledgeBaseId),
    uniqueIndex('kbp_grantee_unique_idx').on(
      table.knowledgeBaseId,
      table.granteeType,
      table.granteeId,
    ),
  ],
);

export type KnowledgeBasePermissionItem = typeof knowledgeBasePermissions.$inferSelect;
export type NewKnowledgeBasePermission = typeof knowledgeBasePermissions.$inferInsert;
