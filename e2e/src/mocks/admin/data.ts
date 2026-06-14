/**
 * Mock data for Admin management module
 */
import type {
  AdminAgent,
  AdminAuditLog,
  AdminKnowledgeBase,
  AdminMockData,
  AdminModel,
  AdminRole,
  AdminRoleDetail,
  AdminSession,
  AdminSessionMessage,
  AdminUser,
  AdminWorkspace,
  AdminWorkspaceMember,
  DashboardStats,
} from './types';

// ============================================
// Dashboard Stats
// ============================================

export const mockDashboardStats: DashboardStats = {
  monthlyActiveUsers: 28,
  totalKnowledgeBases: 15,
  totalMessages: 12_840,
  totalSessions: 358,
  totalUsers: 42,
  weeklyActiveSessions: 89,
};

// ============================================
// Sessions
// ============================================

export const mockSessions: AdminSession[] = [
  {
    created_at: '2026-06-10T08:00:00Z',
    id: 'sess-001',
    message_count: 12,
    updated_at: '2026-06-14T10:30:00Z',
    user_email: 'zhangsan@company.com',
    user_id: 'u1',
  },
  {
    created_at: '2026-06-11T09:00:00Z',
    id: 'sess-002',
    message_count: 5,
    updated_at: '2026-06-13T15:00:00Z',
    user_email: 'lisi@company.com',
    user_id: 'u2',
  },
  {
    created_at: '2026-06-12T14:00:00Z',
    id: 'sess-003',
    message_count: 28,
    updated_at: '2026-06-14T09:00:00Z',
    user_email: 'wangwu@company.com',
    user_id: 'u3',
  },
];

// ============================================
// Session Messages
// ============================================

export const mockSessionMessages: AdminSessionMessage[] = [
  {
    content: '帮我写一个排序算法',
    created_at: '2026-06-14T10:00:00Z',
    id: 'msg-001',
    model: 'gpt-4o',
    role: 'user',
  },
  {
    content: '好的，这是一个快速排序的实现...',
    created_at: '2026-06-14T10:00:05Z',
    id: 'msg-002',
    model: 'gpt-4o',
    role: 'assistant',
  },
  {
    content: '能优化一下吗',
    created_at: '2026-06-14T10:01:00Z',
    id: 'msg-003',
    model: 'gpt-4o',
    role: 'user',
  },
];

// ============================================
// Agents
// ============================================

export const mockAgents: AdminAgent[] = [
  {
    category: '编程',
    createdAt: '2026-06-01T00:00:00Z',
    enabled: true,
    id: 'agent-001',
    model: 'gpt-4o',
    name: '代码助手',
    userId: 'u1',
  },
  {
    category: '语言',
    createdAt: '2026-06-05T00:00:00Z',
    enabled: true,
    id: 'agent-002',
    model: 'claude-3-haiku',
    name: '翻译专家',
    userId: 'u2',
  },
  {
    category: '分析',
    createdAt: '2026-06-10T00:00:00Z',
    enabled: false,
    id: 'agent-003',
    model: 'gpt-4o-mini',
    name: '数据分析师',
    userId: 'u3',
  },
];

// ============================================
// Knowledge Bases
// ============================================

export const mockKnowledgeBases: AdminKnowledgeBase[] = [
  {
    file_count: 12,
    id: 'kb-001',
    name: '公司规章制度',
    user_email: 'zhangsan@company.com',
    visibility: 'workspace',
  },
  {
    file_count: 45,
    id: 'kb-002',
    name: '技术文档',
    user_email: 'lisi@company.com',
    visibility: 'restricted',
  },
  {
    file_count: 8,
    id: 'kb-003',
    name: '产品需求',
    user_email: 'wangwu@company.com',
    visibility: 'workspace',
  },
];

// ============================================
// Users
// ============================================

export const mockUsers: AdminUser[] = [
  {
    created_at: '2026-01-15T00:00:00Z',
    email: 'zhangsan@company.com',
    id: 'u1',
    name: '张三',
    status: 'active',
  },
  {
    created_at: '2026-02-20T00:00:00Z',
    email: 'lisi@company.com',
    id: 'u2',
    name: '李四',
    status: 'active',
  },
  {
    created_at: '2026-03-10T00:00:00Z',
    email: 'wangwu@company.com',
    id: 'u3',
    name: '王五',
    status: 'disabled',
  },
];

// ============================================
// Audit Logs
// ============================================

export const mockAuditLogs: AdminAuditLog[] = [
  {
    action: 'login',
    category: 'auth',
    created_at: '2026-06-14T09:00:00Z',
    id: 'log-001',
    target: 'user:u1',
    userId: 'u1',
  },
  {
    action: 'disable',
    category: 'agent',
    created_at: '2026-06-13T16:00:00Z',
    detail: '管理员手动禁用',
    id: 'log-002',
    target: 'agent:agent-003',
    userId: 'u3',
  },
  {
    action: 'create',
    category: 'knowledge',
    created_at: '2026-06-12T10:00:00Z',
    id: 'log-003',
    target: 'kb:kb-002',
    userId: 'u2',
  },
];

// ============================================
// RBAC Roles
// ============================================

export const mockRoles: AdminRole[] = [
  { displayName: '超级管理员', id: 'role-001', isSystem: true, name: 'super_admin' },
  { displayName: '管理员', id: 'role-002', isSystem: true, name: 'admin' },
  { displayName: '工作空间所有者', id: 'role-003', isSystem: true, name: 'workspace_owner' },
  { displayName: '工作空间成员', id: 'role-004', isSystem: true, name: 'workspace_member' },
  { displayName: '工作空间查看者', id: 'role-005', isSystem: true, name: 'workspace_viewer' },
];

// ============================================
// Permission Codes
// ============================================

export const mockPermissionCodes: string[] = [
  'admin:access',
  'audit:read',
  'session:read',
  'user:manage',
  'knowledge_base:manage',
  'agent:manage',
  'plugin:manage',
  'rbac:manage',
];

// ============================================
// Providers
// ============================================

export const mockProviders: AdminProvider[] = [
  { id: 'newapi', name: 'AI 中转站', userId: 'u1', enabled: true, source: 'builtin', checkModel: 'gpt-4o-mini', hasApiKey: true, hasBaseURL: true, createdAt: '2026-06-01T00:00:00Z', keyVaults: undefined },
  { id: 'openai', name: 'OpenAI', userId: 'u1', enabled: true, source: 'builtin', checkModel: null, hasApiKey: false, hasBaseURL: false, createdAt: '2026-06-01T00:00:00Z', keyVaults: undefined },
  { id: 'anthropic', name: 'Anthropic', userId: 'u1', enabled: true, source: 'builtin', checkModel: null, hasApiKey: false, hasBaseURL: false, createdAt: '2026-06-01T00:00:00Z', keyVaults: undefined },
  { id: 'deepseek', name: 'DeepSeek', userId: 'u1', enabled: false, source: 'builtin', checkModel: null, hasApiKey: false, hasBaseURL: false, createdAt: '2026-06-01T00:00:00Z', keyVaults: undefined },
];

// ============================================
// Models
// ============================================

export const mockModels: AdminModel[] = [
  { id: 'openai/gpt-5.5', displayName: 'GPT 5.5', enabled: true, providerId: 'newapi', type: 'chat', contextWindowTokens: 128000 },
  { id: 'openai/gpt-5.4', displayName: 'GPT 5.4', enabled: true, providerId: 'newapi', type: 'chat', contextWindowTokens: 128000 },
  { id: 'anthropic/claude-sonnet-4.6', displayName: 'Claude Sonnet 4.6', enabled: true, providerId: 'newapi', type: 'chat', contextWindowTokens: 200000 },
  { id: 'anthropic/claude-opus-4.7', displayName: 'Claude Opus 4.7', enabled: false, providerId: 'newapi', type: 'chat', contextWindowTokens: 200000 },
  { id: 'deepseek-v4-pro', displayName: 'DeepSeek V4 Pro', enabled: true, providerId: 'newapi', type: 'chat', contextWindowTokens: 64000 },
  { id: 'qwen3.7-max', displayName: 'Qwen 3.7 Max', enabled: true, providerId: 'newapi', type: 'chat', contextWindowTokens: 32000 },
  { id: 'google/gemini-3.1-pro-preview', displayName: 'Gemini 3.1 Pro', enabled: false, providerId: 'newapi', type: 'chat', contextWindowTokens: 1048576 },
];

// ============================================
// Workspaces
// ============================================

export const mockWorkspaces: AdminWorkspace[] = [
  { id: 'ws-default', name: '默认工作区', description: '系统默认工作区', memberCount: 42, createdAt: '2026-01-01T00:00:00Z', tokenQuota: 5000000 },
  { id: 'ws-dev', name: '研发部', description: '研发部门专用工作区', memberCount: 15, createdAt: '2026-03-15T00:00:00Z', tokenQuota: 3000000, modelWhitelist: ['openai/gpt-5.5', 'anthropic/claude-sonnet-4.6'] },
  { id: 'ws-marketing', name: '市场部', description: '市场部门工作区', memberCount: 8, createdAt: '2026-05-01T00:00:00Z', tokenQuota: 1000000 },
];

export const mockWorkspaceMembers: AdminWorkspaceMember[] = [
  { id: 'wsm-1', userId: 'u1', userName: '张三', userEmail: 'zhangsan@company.com', role: 'workspace_owner', joinedAt: '2026-03-15T00:00:00Z' },
  { id: 'wsm-2', userId: 'u2', userName: '李四', userEmail: 'lisi@company.com', role: 'workspace_member', joinedAt: '2026-04-01T00:00:00Z' },
  { id: 'wsm-3', userId: 'u3', userName: '王五', userEmail: 'wangwu@company.com', role: 'workspace_viewer', joinedAt: '2026-05-10T00:00:00Z' },
];

// ============================================
// Role Details (for RBAC page)
// ============================================

export const mockRoleDetails: AdminRoleDetail[] = [
  { id: 'role-super-admin', name: 'super_admin', displayName: '超级管理员', isSystem: true, permissions: ['admin:access','audit:read','session:read','user:manage','knowledge_base:manage','agent:manage','plugin:manage','rbac:manage'] },
  { id: 'role-admin', name: 'admin', displayName: '管理员', isSystem: true, permissions: ['admin:access','audit:read','session:read','user:manage','knowledge_base:manage','agent:manage'] },
  { id: 'role-ws-owner', name: 'workspace_owner', displayName: '工作空间所有者', isSystem: true, permissions: ['agent:create:all','agent:update:all','knowledge_base:manage','file:upload:all'] },
  { id: 'role-ws-member', name: 'workspace_member', displayName: '工作空间成员', isSystem: true, permissions: ['agent:create:owner','message:create:owner','file:upload:owner'] },
  { id: 'role-ws-viewer', name: 'workspace_viewer', displayName: '工作空间查看者', isSystem: true, permissions: [] },
];

// ============================================
// Aggregated Mock Data (used by handlers factory)
// ============================================

export const adminMockData: AdminMockData = {
  agents: mockAgents,
  auditLogs: mockAuditLogs,
  dashboardStats: mockDashboardStats,
  knowledgeBases: mockKnowledgeBases,
  models: mockModels,
  permissionCodes: mockPermissionCodes,
  providers: mockProviders,
  roleDetails: mockRoleDetails,
  roles: mockRoles,
  sessionMessages: mockSessionMessages,
  sessions: mockSessions,
  users: mockUsers,
  workspaceMembers: mockWorkspaceMembers,
  workspaces: mockWorkspaces,
};
