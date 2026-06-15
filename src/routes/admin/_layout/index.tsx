'use client';

import { Layout } from 'antd';
import { memo } from 'react';
import { Outlet, Navigate } from 'react-router-dom';

import AdminSidebar from '@/features/Admin/AdminSidebar';
import { usePermission } from '@/hooks/usePermission';

const { Sider, Content } = Layout;

const AdminLayout = memo(() => {
  const { allowed } = usePermission('admin:access');

  if (!allowed) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <Layout style={{ height: '100%' }}>
      <Sider
        width={220}
        breakpoint="lg"
        collapsedWidth={60}
        style={{ background: 'var(--colorBgContainer)' }}
      >
        <AdminSidebar />
      </Sider>
      <Content style={{ overflow: 'auto' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '16px 24px' }}>
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
});

export default AdminLayout;
