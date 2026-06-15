'use client';

import { Flexbox } from '@lobehub/ui';
import { Switch, Table, Tag, message, Button, Space } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminPageHeader, AdminFilterBar, AdminEditDrawer, AdminEmptyState } from '@/features/Admin/components';
import { lambdaQuery } from '@/libs/trpc/client';

const AdminAgentsPage = memo(() => {
  const { t } = useTranslation('admin');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewingAgent, setViewingAgent] = useState<any>(null);

  const { data, isLoading, refetch } = lambdaQuery.adminAgent.listAll.useQuery({
    search: search || undefined,
    limit: 20,
    offset: (page - 1) * 20,
  });

  const toggleMutation = lambdaQuery.adminAgent.togglePinned.useMutation({
    onSuccess: () => { message.success(t('agents.toggleSuccess')); refetch(); },
  });

  const columns = [
    { title: t('agents.name'), dataIndex: 'title', key: 'title', render: (v: string) => v || '(未命名)' },
    { title: 'Provider', dataIndex: 'provider', key: 'provider', render: (v: string) => v ? <Tag>{v}</Tag> : '-' },
    { title: t('agents.model'), dataIndex: 'model', key: 'model' },
    { title: t('agents.enabled'), dataIndex: 'pinned', key: 'pinned', width: 100,
      render: (v: boolean, record: any) => (
        <Switch checked={!!v} onChange={(checked) => toggleMutation.mutate({ agentId: record.id, pinned: checked })} />
      ),
    },
    {
      title: '操作', key: 'actions', width: 100,
      render: (_: any, record: any) => (
        <Button type="link" size="small" icon={<InfoCircleOutlined />}
          onClick={() => setViewingAgent(record)}>
          详情
        </Button>
      ),
    },
  ];

  const agents = (data?.data ?? []) as any[];

  return (
    <Flexbox gap={0}>
      <AdminPageHeader title={t('agents.title')} breadcrumb={[{ title: t('agents.title') }]} />
      <AdminFilterBar
        searchPlaceholder={t('agents.searchPlaceholder')}
        searchValue={search}
        onSearchChange={setSearch}
      />
      {!isLoading && agents.length === 0 ? (
        <AdminEmptyState description="暂无智能体" />
      ) : (
        <Table columns={columns} dataSource={agents} loading={isLoading}
          pagination={{ current: page, pageSize: 20, total: data?.total ?? 0, onChange: setPage, showSizeChanger: true, showTotal: (total: number) => `共 ${total} 条` }}
          rowKey="id"
        />
      )}

      {/* 查看智能体详情 Drawer（只读） */}
      <AdminEditDrawer open={!!viewingAgent} title="智能体详情" onClose={() => setViewingAgent(null)}
        footer={null}>
        {viewingAgent && (
          <Flexbox gap={16}>
            <div>
              <div style={{ color: '#666', marginBottom: 4 }}>{t('agents.name')}</div>
              <div style={{ fontSize: 16, fontWeight: 500 }}>{viewingAgent.title || '(未命名)'}</div>
            </div>
            <div>
              <div style={{ color: '#666', marginBottom: 4 }}>Provider</div>
              <div style={{ fontSize: 16, fontWeight: 500 }}>{viewingAgent.provider ? <Tag>{viewingAgent.provider}</Tag> : '-'}</div>
            </div>
            <div>
              <div style={{ color: '#666', marginBottom: 4 }}>{t('agents.model')}</div>
              <div style={{ fontSize: 16, fontWeight: 500 }}>{viewingAgent.model || '-'}</div>
            </div>
            <div>
              <div style={{ color: '#666', marginBottom: 4 }}>描述</div>
              <div style={{ fontSize: 16, fontWeight: 500 }}>{viewingAgent.description || '无描述'}</div>
            </div>
            <div>
              <div style={{ color: '#666', marginBottom: 4 }}>用户 ID</div>
              <div style={{ fontSize: 14 }}>{viewingAgent.userId || '-'}</div>
            </div>
            <div>
              <div style={{ color: '#666', marginBottom: 4 }}>创建时间</div>
              <div style={{ fontSize: 14 }}>{viewingAgent.createdAt ? new Date(viewingAgent.createdAt).toLocaleString('zh-CN') : '-'}</div>
            </div>
          </Flexbox>
        )}
      </AdminEditDrawer>
    </Flexbox>
  );
});

export default AdminAgentsPage;
