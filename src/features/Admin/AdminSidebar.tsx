'use client';

import { Flexbox } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

const menuItems = [
  { key: '/admin', icon: '📊', labelKey: 'dashboard' },
  { key: '/admin/sessions', icon: '💬', labelKey: 'sessions' },
  { key: '/admin/agents', icon: '🤖', labelKey: 'agents' },
  { key: '/admin/plugins', icon: '🔌', labelKey: 'plugins' },
  { key: '/admin/knowledge', icon: '📚', labelKey: 'knowledge' },
  { key: '/admin/users', icon: '👥', labelKey: 'users' },
  { key: '/admin/rbac', icon: '🛡️', labelKey: 'rbac' },
];

const AdminSidebar = memo(() => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Flexbox
      gap={4}
      style={{
        background: cssVar.colorBgContainer,
        borderRight: `1px solid ${cssVar.colorBorderSecondary}`,
        height: '100%',
        minWidth: 200,
        padding: 12,
      }}
    >
      {menuItems.map((item) => {
        const isActive = location.pathname === item.key;
        return (
          <div
            key={item.key}
            onClick={() => navigate(item.key)}
            style={{
              background: isActive ? cssVar.colorFillSecondary : 'transparent',
              borderRadius: 8,
              color: isActive ? cssVar.colorPrimary : cssVar.colorText,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: isActive ? 600 : 400,
              padding: '10px 12px',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ marginRight: 8 }}>{item.icon}</span>
            {t(`menu.${item.labelKey}`)}
          </div>
        );
      })}
    </Flexbox>
  );
});

export default AdminSidebar;
