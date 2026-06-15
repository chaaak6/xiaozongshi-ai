'use client';

import { memo } from 'react';
import { Outlet, Navigate } from 'react-router-dom';

import AdminSidebar from '@/features/Admin/AdminSidebar';
import { usePermission } from '@/hooks/usePermission';

const AdminLayout = memo(() => {
  const { allowed } = usePermission('admin:access');

  if (!allowed) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Sidebar */}
      <aside
        style={{
          background: 'var(--colorBgContainer)',
          borderRight: '1px solid var(--colorBorderSecondary)',
          flexShrink: 0,
          minWidth: 220,
          width: 220,
        }}
      >
        <AdminSidebar />
      </aside>

      {/* Content */}
      <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '16px 24px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
});

export default AdminLayout;
