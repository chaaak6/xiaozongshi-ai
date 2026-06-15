'use client';

import { Flexbox } from '@lobehub/ui';
import { Switch, Table, Tag, message, Button, Space, Form, Input } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { memo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminPageHeader, AdminFilterBar, AdminEditDrawer } from '@/features/Admin/components';
import { lambdaQuery } from '@/libs/trpc/client';

const AdminProvidersPage = memo(() => {
  const { t } = useTranslation('admin');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editingProvider, setEditingProvider] = useState<any>(null);
  const [editForm] = Form.useForm();

  const { data, isLoading, refetch } = lambdaQuery.adminProvider.listAll.useQuery({
    search: search || undefined,
    limit: 20,
    offset: (page - 1) * 20,
  });

  const toggleMutation = lambdaQuery.adminProvider.toggleEnabled.useMutation({
    onSuccess: () => { message.success(t('providers.toggleSuccess')); refetch(); },
  });

  const updateMutation = lambdaQuery.adminProvider.update.useMutation({
    onSuccess: () => { message.success('供应商配置已更新'); setEditingProvider(null); editForm.resetFields(); refetch(); },
  });

  const handleEdit = useCallback(() => {
    editForm.validateFields().then((values: any) => {
      updateMutation.mutate({
        providerId: editingProvider.id,
        userId: editingProvider.userId,
        apiKey: values.apiKey || undefined,
        baseURL: values.baseURL || undefined,
      });
    });
  }, [editForm, editingProvider, updateMutation]);

  const columns = [
    {
      title: t('providers.name'), dataIndex: 'name', key: 'name',
      render: (v: string) => v || t('providers.unnamed'),
    },
    {
      title: t('providers.apiKey'), dataIndex: 'hasApiKey', key: 'hasApiKey',
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? '已配置' : '未配置'}</Tag>,
    },
    {
      title: t('providers.baseURL'), dataIndex: 'hasBaseURL', key: 'hasBaseURL',
      render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? '已配置' : '默认'}</Tag>,
    },
    {
      title: t('providers.enabled'), dataIndex: 'enabled', key: 'enabled',
      render: (v: boolean, record: any) => (
        <Switch
          checked={!!v}
          checkedChildren="开"
          unCheckedChildren="关"
          onChange={(checked) =>
            toggleMutation.mutate({ providerId: record.id, userId: record.userId, enabled: checked })
          }
        />
      ),
    },
    {
      title: t('providers.source'), dataIndex: 'source', key: 'source',
      render: (v: string) => <Tag color={v === 'builtin' ? 'blue' : 'orange'}>{v || 'custom'}</Tag>,
    },
    {
      title: '操作', key: 'actions', width: 100,
      render: (_: any, record: any) => (
        <Button type="link" size="small" icon={<EditOutlined />}
          onClick={() => {
            setEditingProvider(record);
            editForm.resetFields();
          }}>
          编辑
        </Button>
      ),
    },
  ];

  const providers = (data?.data ?? []) as any[];

  return (
    <Flexbox gap={0}>
      <AdminPageHeader title={t('providers.title')} breadcrumb={[{ title: t('providers.title') }]} />
      <AdminFilterBar
        searchPlaceholder={t('providers.searchPlaceholder')}
        searchValue={search}
        onSearchChange={setSearch}
      />
      <Table columns={columns} dataSource={providers} loading={isLoading}
        pagination={{ current: page, pageSize: 20, total: data?.total ?? 0, onChange: setPage, showSizeChanger: true, showTotal: (total: number) => `共 ${total} 条` }}
        rowKey={(r: any) => `${r.id}_${r.userId}`}
      />

      {/* 编辑供应商 Drawer */}
      <AdminEditDrawer open={!!editingProvider} title="编辑供应商配置" onClose={() => setEditingProvider(null)}
        footer={
          <Space style={{ float: 'right' }}>
            <Button onClick={() => setEditingProvider(null)}>取消</Button>
            <Button type="primary" onClick={handleEdit} loading={updateMutation.isLoading}>保存</Button>
          </Space>
        }>
        {editingProvider && (
          <Flexbox gap={16}>
            <div style={{ marginBottom: 12 }}>
              <strong>供应商：</strong>{editingProvider.name || t('providers.unnamed')}
            </div>
            <Form form={editForm} layout="vertical">
              <Form.Item name="apiKey" label="API Key">
                <Input.Password placeholder="输入新的 API Key（留空不修改）" />
              </Form.Item>
              <Form.Item name="baseURL" label="代理地址 (Base URL)">
                <Input placeholder="输入代理地址（留空不修改）" />
              </Form.Item>
            </Form>
          </Flexbox>
        )}
      </AdminEditDrawer>
    </Flexbox>
  );
});

export default AdminProvidersPage;
