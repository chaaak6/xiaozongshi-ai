'use client';

import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import AdminSidebar from '@/features/Admin/AdminSidebar';
import { usePermission } from '@/hooks/usePermission';

const AdminLayout = memo(() => {
  const { allowed } = usePermission('admin:access');

  if (!allowed) {
    return <Navigate replace to="/chat" />;
  }

  return (
    <Flexbox height="100%" horizontal>
      <AdminSidebar />
      <Flexbox flex={1} style={{ overflow: 'auto', padding: 24 }}>
        <Outlet />
      </Flexbox>
    </Flexbox>
  );
});

export default AdminLayout;
