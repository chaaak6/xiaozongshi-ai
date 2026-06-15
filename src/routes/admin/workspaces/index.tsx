'use client';

import { Flexbox } from '@lobehub/ui';
import { Table, Form, Input, Popconfirm, message, Button, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { memo, useState, useCallback } from 'react';

import { AdminPageHeader, AdminFilterBar, AdminCreateModal, AdminEditDrawer, AdminEmptyState } from '@/features/Admin/components';
import { lambdaQuery } from '@/libs/trpc/client';

const AdminWorkspacesPage = memo(() => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingWs, setEditingWs] = useState<any>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const { data, isLoading, refetch } = lambdaQuery.adminWorkspace.listAll.useQuery({
    search: search || undefined, limit: 20, offset: (page - 1) * 20,
  });

  const createMutation = lambdaQuery.adminWorkspace.create.useMutation({
    onSuccess: () => { message.success('工作区已创建'); setCreateOpen(false); form.resetFields(); refetch(); },
  });
  const updateMutation = lambdaQuery.adminWorkspace.update.useMutation({
    onSuccess: () => { message.success('已更新'); setEditingWs(null); editForm.resetFields(); refetch(); },
  });
  const deleteMutation = lambdaQuery.adminWorkspace.delete.useMutation({
    onSuccess: () => { message.success('已删除'); refetch(); },
  });

  const handleCreate = useCallback(() => {
    form.validateFields().then((values: any) => createMutation.mutate(values));
  }, [form, createMutation]);
  const handleEdit = useCallback(() => {
    editForm.validateFields().then((values: any) => updateMutation.mutate({ id: editingWs.id, ...values }));
  }, [editForm, editingWs, updateMutation]);

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'description', key: 'description', render: (v: string) => v || '-' },
    { title: '成员数', dataIndex: 'memberCount', key: 'memberCount', width: 90 },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 140, render: (v: string) => v ? new Date(v).toLocaleDateString('zh-CN') : '-' },
    { title: '操作', key: 'actions', width: 160,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />}
            onClick={() => { setEditingWs(record); editForm.setFieldsValue(record); }}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => deleteMutation.mutate({ id: record.id })}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const wss = (data?.data ?? []) as any[];

  return (
    <Flexbox gap={0}>
      <AdminPageHeader title="工作区管理" breadcrumb={[{ title: '工作区管理' }]} />
      <AdminFilterBar searchPlaceholder="搜索工作区..." searchValue={search} onSearchChange={setSearch}
        createButtonText="创建工作区" onCreate={() => { setCreateOpen(true); form.resetFields(); }} />
      {!isLoading && wss.length === 0 ? (
        <AdminEmptyState description="暂无工作区" createButtonText="创建工作区" onCreate={() => setCreateOpen(true)} />
      ) : (
        <Table columns={columns} dataSource={wss} loading={isLoading} rowKey="id"
          pagination={{ current: page, pageSize: 20, total: data?.total ?? 0, onChange: setPage, showSizeChanger: true, showTotal: (t: number) => `共 ${t} 条` }} />
      )}
      <AdminCreateModal open={createOpen} title="创建工作区" onCancel={() => setCreateOpen(false)} onOk={handleCreate} loading={createMutation.isLoading}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="描述"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </AdminCreateModal>
      <AdminEditDrawer open={!!editingWs} title="编辑工作区" onClose={() => setEditingWs(null)}
        footer={<Space style={{ float: 'right' }}><Button onClick={() => setEditingWs(null)}>取消</Button><Button type="primary" onClick={handleEdit} loading={updateMutation.isLoading}>保存</Button></Space>}>
        <Form form={editForm} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="描述"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </AdminEditDrawer>
    </Flexbox>
  );
});

export default AdminWorkspacesPage;
