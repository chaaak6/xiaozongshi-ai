'use client';

import { Flexbox, Text } from '@lobehub/ui';
import { Button, Checkbox, Modal, Table, Tag, message } from 'antd';
import { memo, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const ALL_PERMISSIONS = [
  'admin:access', 'audit:read', 'session:read', 'user:manage',
  'knowledge_base:manage', 'agent:manage', 'plugin:manage', 'rbac:manage',
  'agent:create:owner', 'agent:update:owner', 'agent:delete:owner',
  'file:upload:owner', 'file:read:owner',
  'message:create:owner', 'message:update:owner', 'message:delete:owner',
];

const AdminRbacPage = memo(() => {
  const { t } = useTranslation('admin');
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  const permissionCodes = useMemo(() => ALL_PERMISSIONS, []);

  // Built-in role definitions
  const roles = useMemo(() => [
    { id: 'super_admin', name: 'super_admin', displayName: '超级管理员', isSystem: true },
    { id: 'admin', name: 'admin', displayName: '管理员', isSystem: true },
    { id: 'workspace_owner', name: 'workspace_owner', displayName: '工作空间所有者', isSystem: true },
    { id: 'workspace_member', name: 'workspace_member', displayName: '工作空间成员', isSystem: true },
    { id: 'workspace_viewer', name: 'workspace_viewer', displayName: '工作空间查看者', isSystem: true },
  ], []);

  return (
    <Flexbox gap={16}>
      <Text style={{ fontSize: 24, fontWeight: 600 }}>{t('rbac.title')}</Text>
      <Table
        columns={[
          { title: t('rbac.roleName'), dataIndex: 'displayName', key: 'displayName' },
          { title: t('rbac.roleId'), dataIndex: 'name', key: 'name' },
          {
            title: t('rbac.actions'), key: 'actions',
            render: (_: any, record: any) => (
              <Button size="small" onClick={() => { setSelectedRole(record.name); setSelectedPerms([]); setPermModalOpen(true); }}>
                {t('rbac.managePermissions')}
              </Button>
            ),
          },
        ]}
        dataSource={roles} rowKey="id" pagination={false}
      />
      <Modal open={permModalOpen} title={t('rbac.editPermissions')} onCancel={() => setPermModalOpen(false)}
        onOk={() => { message.success(t('rbac.updateSuccess')); setPermModalOpen(false); }} width={600}>
        <Flexbox gap={8} style={{ maxHeight: 400, overflow: 'auto' }}>
          <Checkbox.Group
            options={permissionCodes.map((code: string) => ({ label: code, value: code }))}
            value={selectedPerms}
            onChange={(vals: any) => setSelectedPerms(vals)}
          />
        </Flexbox>
      </Modal>
    </Flexbox>
  );
});

export default AdminRbacPage;
