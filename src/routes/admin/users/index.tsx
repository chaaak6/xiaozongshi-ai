'use client';

import { Flexbox } from '@lobehub/ui';
import { Table, Tag, Checkbox, Typography, Form, Input, Select, Popconfirm, message, Button, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { memo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminPageHeader, AdminFilterBar, AdminCreateModal, AdminEditDrawer, AdminEmptyState } from '@/features/Admin/components';
import { lambdaQuery } from '@/libs/trpc/client';

const { Text } = Typography;

const AdminUsersPage = memo(() => {
  const { t } = useTranslation('admin');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [orgView, setOrgView] = useState(false);

  const { data: workspaces } = lambdaQuery.adminWorkspace.listAll.useQuery({ limit: 50, offset: 0 });

  const { data, isLoading, refetch } = lambdaQuery.admin.listUsers.useQuery({
    search: search || undefined, limit: 20, offset: (page - 1) * 20,
  });

  const createMutation = lambdaQuery.admin.createUser.useMutation({
    onSuccess: () => { message.success('用户已创建'); setCreateOpen(false); form.resetFields(); refetch(); },
  });
  const updateMutation = lambdaQuery.admin.updateUser.useMutation({
    onSuccess: () => { message.success('用户已更新'); setEditingUser(null); editForm.resetFields(); refetch(); },
  });
  const deleteMutation = lambdaQuery.admin.deleteUser.useMutation({
    onSuccess: () => { message.success('用户已删除'); refetch(); },
  });

  const handleCreate = useCallback(() => {
    form.validateFields().then((values: any) => createMutation.mutate(values));
  }, [form, createMutation]);

  const handleEdit = useCallback(() => {
    editForm.validateFields().then((values: any) => updateMutation.mutate({ id: editingUser.id, ...values }));
  }, [editForm, editingUser, updateMutation]);

  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (v: string) => <Tag color={v === 'active' ? 'green' : 'red'}>{v === 'active' ? '正常' : '禁用'}</Tag> },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 140,
      render: (v: string) => new Date(v).toLocaleDateString('zh-CN') },
    { title: '操作', key: 'actions', width: 160,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />}
            onClick={() => { setEditingUser(record); editForm.setFieldsValue({ fullName: record.name, email: record.email, status: record.status, roles: record.roles }); }}>
            编辑
          </Button>
          <Popconfirm title="确认删除此用户？" onConfirm={() => deleteMutation.mutate({ id: record.id })}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const users = (data?.data ?? []) as any[];

  return (
    <Flexbox gap={0}>
      <AdminPageHeader title="用户管理" breadcrumb={[{ title: '用户管理' }]} />
      <AdminFilterBar
        searchPlaceholder="搜索姓名或邮箱..."
        searchValue={search}
        onSearchChange={setSearch}
        createButtonText="创建用户"
        onCreate={() => { setCreateOpen(true); form.resetFields(); }}
        extra={<Button onClick={() => setOrgView(!orgView)}>{orgView ? '隐藏' : '显示'}组织架构</Button>}
      />
      {/* 组织架构面板 */}
      {orgView && workspaces?.data && (
        <div style={{ marginBottom: 16, padding: 16, background: 'var(--colorFillQuaternary)', borderRadius: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>组织架构</Text>
          {workspaces.data.map((ws: any) => (
            <div key={ws.id} style={{ marginBottom: 4 }}>
              <Tag color="blue">🏢 {ws.name}</Tag>
              <Text style={{ fontSize: 12, color: 'var(--colorTextSecondary)' }}> {ws.memberCount} 人</Text>
            </div>
          ))}
        </div>
      )}

      {!isLoading && users.length === 0 ? (
        <AdminEmptyState description="暂无用户" createButtonText="创建用户" onCreate={() => setCreateOpen(true)} />
      ) : (
        <Table
          columns={columns}
          dataSource={users}
          loading={isLoading}
          rowKey="id"
          pagination={{ current: page, pageSize: 20, total: data?.total ?? 0, onChange: setPage, showSizeChanger: true, showTotal: (total: number) => `共 ${total} 条` }}
        />
      )}

      {/* 创建用户 Modal */}
      <AdminCreateModal open={createOpen} title="创建用户" onCancel={() => setCreateOpen(false)} onOk={handleCreate} loading={createMutation.isLoading}>
        <Form form={form} layout="vertical">
          <Form.Item name="fullName" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email', message: '请输入有效的邮箱' }]}>
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, min: 8, message: '密码至少8位' }]}>
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
        </Form>
      </AdminCreateModal>

      {/* 编辑用户 Drawer */}
      <AdminEditDrawer open={!!editingUser} title="编辑用户" onClose={() => setEditingUser(null)}
        footer={
          <Space style={{ float: 'right' }}>
            <Button onClick={() => setEditingUser(null)}>取消</Button>
            <Button type="primary" onClick={handleEdit} loading={updateMutation.isLoading}>保存</Button>
          </Space>
        }>
        <Form form={editForm} layout="vertical">
          <Form.Item name="fullName" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[{ value: 'active', label: '正常' }, { value: 'disabled', label: '禁用' }]} />
          </Form.Item>
          <Form.Item name="roles" label="角色分配">
            <Checkbox.Group options={[
              { value: 'super_admin', label: '超级管理员' },
              { value: 'admin', label: '管理员' },
              { value: 'workspace_owner', label: '工作空间所有者' },
              { value: 'workspace_member', label: '工作空间成员' },
              { value: 'workspace_viewer', label: '工作空间查看者' },
            ]} />
          </Form.Item>
        </Form>
      </AdminEditDrawer>
    </Flexbox>
  );
});

export default AdminUsersPage;
