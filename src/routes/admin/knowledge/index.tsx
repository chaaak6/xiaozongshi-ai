'use client';

import { memo, useState, useCallback } from 'react';
import { Flexbox } from '@lobehub/ui';
import { Table, Tag, Button, Space, Form, Input, Select, Modal, message } from 'antd';
import { EditOutlined, LockOutlined } from '@ant-design/icons';
import { AdminPageHeader, AdminFilterBar, AdminCreateModal, AdminEditDrawer, AdminEmptyState } from '@/features/Admin/components';
import { lambdaQuery } from '@/libs/trpc/client';

const AdminKnowledgePage = memo(() => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewingKB, setViewingKB] = useState<any>(null);
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [permForm] = Form.useForm();

  const { data, isLoading, refetch } = lambdaQuery.knowledgeBaseAdmin.listAll.useQuery({
    search: search || undefined,
    limit: 20,
    offset: (page - 1) * 20,
  });

  const createMutation = lambdaQuery.knowledgeBaseAdmin.createKnowledgeBase.useMutation({
    onSuccess: () => { message.success('知识库已创建'); setCreateOpen(false); form.resetFields(); refetch(); },
  });

  const createKnowledgeBase = useCallback((values: any) => {
    createMutation.mutate(values);
  }, [createMutation]);

  const grantMutation = lambdaQuery.knowledgeBaseAdmin.grantPermission.useMutation({
    onSuccess: () => {
      message.success('权限已授予');
      refetch();
    },
  });

  const revokeMutation = lambdaQuery.knowledgeBaseAdmin.revokePermission.useMutation({
    onSuccess: () => {
      message.success('权限已撤销');
      refetch();
    },
  });

  const columns: any[] = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    {
      title: '可见性',
      dataIndex: 'visibility',
      key: 'visibility',
      width: 100,
      render: (v: string) => (
        <Tag color={v === 'workspace' ? 'green' : 'orange'}>{v || 'workspace'}</Tag>
      ),
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 180,
      render: (v: string) => v ? new Date(v).toLocaleString('zh-CN') : '-' },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => setViewingKB(record)}>
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<LockOutlined />}
            onClick={() => {
              setViewingKB(record);
              setPermModalOpen(true);
            }}
          >
            权限
          </Button>
        </Space>
      ),
    },
  ];

  const kbs = (data?.data ?? []) as any[];

  return (
    <Flexbox gap={0}>
      <AdminPageHeader title="知识库管理" breadcrumb={[{ title: '知识库' }]} />
      <AdminFilterBar
        searchPlaceholder="搜索知识库..."
        searchValue={search}
        onSearchChange={setSearch}
        createButtonText="创建知识库"
        onCreate={() => {
          setCreateOpen(true);
          form.resetFields();
        }}
      />
      {!isLoading && kbs.length === 0 ? (
        <AdminEmptyState
          description="暂无知识库"
          createButtonText="创建知识库"
          onCreate={() => setCreateOpen(true)}
        />
      ) : (
        <Table
          columns={columns}
          dataSource={kbs}
          loading={isLoading}
          rowKey="id"
          pagination={{
            current: page,
            pageSize: 20,
            total: data?.total ?? 0,
            onChange: setPage,
            showSizeChanger: true,
            showTotal: (t: number) => `共 ${t} 条`,
          }}
        />
      )}

      {/* 创建知识库 Modal */}
      <AdminCreateModal
        open={createOpen}
        title="创建知识库"
        onCancel={() => setCreateOpen(false)}
        onOk={() => {
          form.validateFields().then((v: any) => createKnowledgeBase(v));
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="知识库名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="visibility" label="可见性" initialValue="workspace">
            <Select
              options={[
                { value: 'workspace', label: '工作区可见' },
                { value: 'restricted', label: '受限访问' },
                { value: 'private', label: '私有' },
              ]}
            />
          </Form.Item>
        </Form>
      </AdminCreateModal>

      {/* 知识库详情 Drawer */}
      <AdminEditDrawer
        open={!!viewingKB && !permModalOpen}
        title={`知识库详情 — ${viewingKB?.name || ''}`}
        onClose={() => setViewingKB(null)}
        width={560}
      >
        {/* keep existing detail content */}
      </AdminEditDrawer>

      {/* 权限管理 Modal */}
      <Modal
        open={permModalOpen}
        title={`权限管理 — ${viewingKB?.name || ''}`}
        onCancel={() => setPermModalOpen(false)}
        footer={null}
        width={500}
        destroyOnClose
      >
        <Form
          form={permForm}
          layout="vertical"
          onFinish={(v: any) =>
            grantMutation.mutate({
              knowledgeBaseId: viewingKB?.id,
              granteeType: v.granteeType,
              granteeId: v.granteeId,
              accessLevel: v.accessLevel,
            })
          }
        >
          <Form.Item name="granteeType" label="授权类型" initialValue="user">
            <Select
              options={[
                { value: 'user', label: '用户' },
                { value: 'role', label: '角色' },
              ]}
            />
          </Form.Item>
          <Form.Item name="granteeId" label="用户ID/角色ID" rules={[{ required: true }]}>
            <Input placeholder="输入用户或角色ID" />
          </Form.Item>
          <Form.Item name="accessLevel" label="访问级别" initialValue="read">
            <Select
              options={[
                { value: 'read', label: '只读' },
                { value: 'write', label: '读写' },
                { value: 'admin', label: '管理' },
              ]}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            授予权限
          </Button>
        </Form>
      </Modal>
    </Flexbox>
  );
});

export default AdminKnowledgePage;
