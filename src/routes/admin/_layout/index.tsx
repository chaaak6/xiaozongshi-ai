'use client';

import { memo, useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';

import AdminSidebar from '@/features/Admin/AdminSidebar';
import { usePermission } from '@/hooks/usePermission';

const AdminLayout = memo(() => {
  const { allowed } = usePermission('admin:access');
  const [collapsed, setCollapsed] = useState(false);

  // Responsive: auto-collapse sidebar on smaller screens
  useEffect(() => {
    const check = () => setCollapsed(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!allowed) {
    return <Navigate to="/chat" replace />;
  }

  const sidebarWidth = collapsed ? 0 : 220;

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Sidebar — auto-collapses below 1024px */}
      <aside
        style={{
          background: 'var(--colorBgContainer)',
          borderRight: collapsed ? 'none' : '1px solid var(--colorBorderSecondary)',
          flexShrink: 0,
          minWidth: sidebarWidth,
          overflow: collapsed ? 'hidden' : 'auto',
          transition: 'min-width 0.2s',
          width: sidebarWidth,
        }}
      >
        <AdminSidebar />
      </aside>

      {/* Content — fills remaining space, no max-width */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          overflow: 'auto',
          padding: '16px 24px',
        }}
      >
        {/* Hamburger toggle for mobile */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            style={{
              background: 'var(--colorBgContainer)',
              border: '1px solid var(--colorBorderSecondary)',
              borderRadius: 4,
              cursor: 'pointer',
              marginBottom: 12,
              padding: '4px 10px',
            }}
          >
            ☰ 菜单
          </button>
        )}
        <Outlet />
      </main>
    </div>
  );
});

export default AdminLayout;
