/**
 * Type definitions for Admin mock data
 */

// ============================================
// Dashboard
// ============================================

export interface DashboardStats {
  monthlyActiveUsers: number;
  totalKnowledgeBases: number;
  totalMessages: number;
  totalSessions: number;
  totalUsers: number;
  weeklyActiveSessions: number;
}

// ============================================
// Session
// ============================================

export interface AdminSession {
  created_at: string;
  id: string;
  message_count: number;
  updated_at: string;
  user_email: string;
  user_id: string;
}

export interface AdminSessionMessage {
  content: string;
  created_at: string;
  id: string;
  model: string;
  role: 'assistant' | 'user';
}

// ============================================
// Agent
// ============================================

export interface AdminAgent {
  category: string;
  createdAt: string;
  enabled: boolean;
  id: string;
  model: string;
  name: string;
  userId: string;
}

// ============================================
// Knowledge Base
// ============================================

export interface AdminKnowledgeBase {
  file_count: number;
  id: string;
  name: string;
  user_email: string;
  visibility: 'restricted' | 'workspace';
}

// ============================================
// User
// ============================================

export interface AdminUser {
  created_at: string;
  email: string;
  id: string;
  name: string;
  status: 'active' | 'disabled';
}

// ============================================
// Audit Log
// ============================================

export interface AdminAuditLog {
  action: string;
  category: string;
  created_at: string;
  detail?: string;
  id: string;
  target: string;
  userId: string;
}

// ============================================
// RBAC
// ============================================

export interface AdminRole {
  displayName: string;
  id: string;
  isSystem: boolean;
  name: string;
}

// ============================================
// Aggregate mock data shape
// ============================================

export interface AdminMockData {
  agents: AdminAgent[];
  auditLogs: AdminAuditLog[];
  dashboardStats: DashboardStats;
  knowledgeBases: AdminKnowledgeBase[];
  permissionCodes: string[];
  roles: AdminRole[];
  sessionMessages: AdminSessionMessage[];
  sessions: AdminSession[];
  users: AdminUser[];
}
