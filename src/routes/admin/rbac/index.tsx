'use client';

import { memo, useState, useCallback } from 'react';
import { Flexbox } from '@lobehub/ui';
import { Table, Tag, Button, Space, Popconfirm, Checkbox, Form, Input, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { AdminPageHeader, AdminFilterBar, AdminCreateModal, AdminEditDrawer, AdminEmptyState } from '@/features/Admin/components';
import { lambdaQuery } from '@/libs/trpc/client';

const ALL_PERMISSIONS = [
  'admin:access', 'audit:read', 'session:read', 'user:manage',
  'knowledge_base:manage', 'agent:manage', 'plugin:manage', 'rbac:manage',
  'agent:create:owner', 'agent:update:owner', 'agent:delete:owner',
  'file:upload:owner', 'file:read:owner',
  'message:create:owner', 'message:update:owner', 'message:delete:owner',
];

const AdminRbacPage = memo(() => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [form] = Form.useForm();

  const { data, isLoading, refetch } = lambdaQuery.rbacAdmin.listRoles.useQuery(
    { limit: 20, offset: (page - 1) * 20 },
  );

  const createMutation = lambdaQuery.rbacAdmin.createRole.useMutation({
    onSuccess: () => { message.success('角色已创建'); setCreateOpen(false); form.resetFields(); refetch(); },
  });
  const deleteMutation = lambdaQuery.rbacAdmin.deleteRole.useMutation({
    onSuccess: () => { message.success('角色已删除'); refetch(); },
  });
  const updatePermsMutation = lambdaQuery.rbacAdmin.updateRolePermissions.useMutation({
    onSuccess: () => { message.success('权限已更新'); setEditingRole(null); refetch(); },
  });

  const handleCreate = useCallback(() => {
    form.validateFields().then((v: any) => createMutation.mutate(v));
  }, [form, createMutation]);

  const columns = [
    { title: '名称', dataIndex: 'displayName', key: 'displayName' },
    { title: '标识', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'isSystem', key: 'isSystem', width: 100,
      render: (v: boolean) => <Tag color={v ? 'blue' : 'orange'}>{v ? '系统' : '自定义'}</Tag> },
    { title: '操作', key: 'actions', width: 200,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />}
            onClick={() => { setEditingRole(record); setSelectedPerms(record.permissions || []); }}>
            编辑权限
          </Button>
          {!record.isSystem && (
            <Popconfirm title="确认删除？" onConfirm={() => deleteMutation.mutate({ id: record.id })}>
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const roles = (data?.data ?? []) as any[];

  return (
    <Flexbox gap={0}>
      <AdminPageHeader title="权限管理" breadcrumb={[{ title: 'RBAC' }]} />
      <AdminFilterBar searchPlaceholder="搜索角色..." searchValue={search} onSearchChange={setSearch}
        createButtonText="创建角色" onCreate={() => { setCreateOpen(true); form.resetFields(); }} />
      {!isLoading && roles.length === 0 ? (
        <AdminEmptyState description="暂无角色" createButtonText="创建角色" onCreate={() => setCreateOpen(true)} />
      ) : (
        <Table columns={columns} dataSource={roles} loading={isLoading} rowKey="id"
          pagination={{ current: page, pageSize: 20, total: data?.total ?? 0, onChange: setPage, showSizeChanger: true, showTotal: (t: number) => `共 ${t} 条` }} />
      )}
      <AdminCreateModal open={createOpen} title="创建角色" onCancel={() => setCreateOpen(false)} onOk={handleCreate} loading={createMutation.isLoading}>
        <Form form={form} layout="vertical">
          <Form.Item name="displayName" label="显示名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="name" label="标识" rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </AdminCreateModal>
      <AdminEditDrawer open={!!editingRole} title={`编辑权限 — ${editingRole?.displayName || ''}`} onClose={() => setEditingRole(null)}
        footer={<Space style={{ float: 'right' }}><Button onClick={() => setEditingRole(null)}>取消</Button>
          <Button type="primary" onClick={() => updatePermsMutation.mutate({ roleId: editingRole?.id, permissionCodes: selectedPerms })} loading={updatePermsMutation.isLoading}>保存</Button></Space>}>
        <Checkbox.Group value={selectedPerms} onChange={(vals) => setSelectedPerms(vals as string[])} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ALL_PERMISSIONS.map((p) => <Checkbox key={p} value={p}>{p}</Checkbox>)}
        </Checkbox.Group>
      </AdminEditDrawer>
    </Flexbox>
  );
});

export default AdminRbacPage;
