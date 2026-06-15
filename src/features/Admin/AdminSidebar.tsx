'use client';

import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
  BarChartOutlined,
  MessageOutlined,
  RobotOutlined,
  ApartmentOutlined,
  KeyOutlined,
  AppstoreOutlined,
  BookOutlined,
  TeamOutlined,
  SafetyOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

const menuItems: MenuProps['items'] = [
  { key: '/admin', icon: <BarChartOutlined />, labelKey: 'dashboard' },
  { key: '/admin/sessions', icon: <MessageOutlined />, labelKey: 'sessions' },
  { key: '/admin/agents', icon: <RobotOutlined />, labelKey: 'agents' },
  { key: '/admin/workspaces', icon: <ApartmentOutlined />, labelKey: 'workspaces' },
  { key: '/admin/providers', icon: <KeyOutlined />, labelKey: 'providers' },
  { key: '/admin/plugins', icon: <AppstoreOutlined />, labelKey: 'plugins' },
  { key: '/admin/knowledge', icon: <BookOutlined />, labelKey: 'knowledge' },
  { key: '/admin/users', icon: <TeamOutlined />, labelKey: 'users' },
  { key: '/admin/rbac', icon: <SafetyOutlined />, labelKey: 'rbac' },
  { key: '/admin/audit', icon: <AuditOutlined />, labelKey: 'audit' },
];

const AdminSidebar = memo(() => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = '/' + location.pathname.split('/').slice(1, 3).join('/');

  const items: MenuProps['items'] = menuItems.map((item: any) => ({
    key: item.key,
    icon: item.icon,
    label: t(`menu.${item.labelKey}`),
  }));

  return (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      items={items}
      onClick={({ key }) => navigate(key)}
      style={{ height: '100%', borderRight: 0 }}
    />
  );
});

export default AdminSidebar;
