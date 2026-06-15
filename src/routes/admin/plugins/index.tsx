'use client';

import { Flexbox } from '@lobehub/ui';
import { Table, Tabs, Tag, Button, Space, Form, Input, Popconfirm, Select, message } from 'antd';
import { InfoCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { memo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminPageHeader, AdminFilterBar, AdminCreateModal, AdminEditDrawer, AdminEmptyState } from '@/features/Admin/components';
import { lambdaQuery } from '@/libs/trpc/client';

const AdminPluginsPage = memo(() => {
  const { t } = useTranslation('admin');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewingPlugin, setViewingPlugin] = useState<any>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading, refetch } = lambdaQuery.adminPlugin.listAllPlugins.useQuery({
    type: activeTab as any, search: search || undefined, limit: 20, offset: (page - 1) * 20,
  });

  const createMutation = lambdaQuery.adminPlugin.createSkill.useMutation({
    onSuccess: () => { message.success('Skill 已创建'); setCreateOpen(false); form.resetFields(); refetch(); },
  });

  const deleteMutation = lambdaQuery.adminPlugin.deleteSkill.useMutation({
    onSuccess: () => { message.success('已删除'); refetch(); },
  });

  const handleCreate = useCallback(() => {
    form.validateFields().then((v: any) => createMutation.mutate(v));
  }, [form, createMutation]);

  const columns = [
    { title: t('plugins.name'), dataIndex: 'name', key: 'name' },
    { title: t('plugins.type'), dataIndex: 'type', key: 'type', width: 80,
      render: (v: string) => <Tag color={v === 'skill' ? 'purple' : v === 'mcp' ? 'blue' : 'green'}>{v?.toUpperCase()}</Tag> },
    { title: '来源', dataIndex: 'source', key: 'source', width: 80,
      render: (v: string) => v ? <Tag>{v}</Tag> : '-' },
    { title: '所属用户', dataIndex: 'userId', key: 'userId', width: 120,
      render: (v: string) => v ? <span style={{ fontSize: 12 }}>{v.substring(0, 12)}...</span> : '-' },
    {
      title: '操作', key: 'actions', width: 150,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="link" size="small" icon={<InfoCircleOutlined />} onClick={() => setViewingPlugin(record)}>详情</Button>
          {record.type === 'skill' && (
            <Popconfirm title="确认删除？" onConfirm={() => deleteMutation.mutate({ id: record.id })}>
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const plugins = (data?.data ?? []) as any[];

  return (
    <Flexbox gap={0}>
      <AdminPageHeader title={t('plugins.title')} breadcrumb={[{ title: t('plugins.title') }]} />
      <AdminFilterBar
        searchPlaceholder={t('plugins.searchPlaceholder')}
        searchValue={search} onSearchChange={setSearch}
        createButtonText="创建 Skill" onCreate={() => { setCreateOpen(true); form.resetFields(); }}
        filters={
          <Tabs activeKey={activeTab} onChange={setActiveTab}
            items={[
              { key: 'all', label: t('plugins.all') },
              { key: 'plugin', label: t('plugins.plugins') },
              { key: 'mcp', label: t('plugins.mcp') },
              { key: 'skill', label: t('plugins.skills') },
            ]}
          />
        }
      />
      {!isLoading && plugins.length === 0 ? (
        <AdminEmptyState description={`暂无${activeTab === 'all' ? '' : activeTab}插件`} createButtonText="创建 Skill" onCreate={() => setCreateOpen(true)} />
      ) : (
        <Table columns={columns} dataSource={plugins} loading={isLoading}
          pagination={{ current: page, pageSize: 20, total: data?.total ?? 0, onChange: setPage, showSizeChanger: true, showTotal: (t: number) => `共 ${t} 条` }}
          rowKey="id" />
      )}

      {/* 创建 Skill Modal */}
      <AdminCreateModal open={createOpen} title="创建 Skill" onCancel={() => setCreateOpen(false)} onOk={handleCreate} loading={createMutation.isLoading}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input placeholder="Skill 名称" /></Form.Item>
          <Form.Item name="identifier" label="标识符" rules={[{ required: true }]}><Input placeholder="如 my-skill" /></Form.Item>
          <Form.Item name="description" label="描述"><Input.TextArea rows={2} placeholder="Skill 功能描述" /></Form.Item>
          <Form.Item name="content" label="内容/Prompt"><Input.TextArea rows={4} placeholder="Prompt 模板内容" /></Form.Item>
        </Form>
      </AdminCreateModal>

      {/* 详情 Drawer */}
      <AdminEditDrawer open={!!viewingPlugin} title="插件详情" onClose={() => setViewingPlugin(null)} footer={null}>
        {viewingPlugin && (
          <Flexbox gap={16}>
            <div>
              <div style={{ color: '#666', marginBottom: 4 }}>{t('plugins.name')}</div>
              <div style={{ fontSize: 16, fontWeight: 500 }}>{viewingPlugin.name || '-'}</div>
            </div>
            <div>
              <div style={{ color: '#666', marginBottom: 4 }}>{t('plugins.type')}</div>
              <Tag>{viewingPlugin.type?.toUpperCase()}</Tag>
            </div>
            <div>
              <div style={{ color: '#666', marginBottom: 4 }}>标识符</div>
              <div style={{ fontSize: 14 }}>{viewingPlugin.identifier || viewingPlugin.id}</div>
            </div>
            {viewingPlugin.description && (
              <div>
                <div style={{ color: '#666', marginBottom: 4 }}>描述</div>
                <div>{viewingPlugin.description}</div>
              </div>
            )}
            <div>
              <div style={{ color: '#666', marginBottom: 4 }}>Manifest</div>
              <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, fontSize: 12, maxHeight: 400, overflow: 'auto' }}>
                {viewingPlugin.manifest ? JSON.stringify(viewingPlugin.manifest, null, 2) : '暂无数据'}
              </pre>
            </div>
          </Flexbox>
        )}
      </AdminEditDrawer>
    </Flexbox>
  );
});

export default AdminPluginsPage;
