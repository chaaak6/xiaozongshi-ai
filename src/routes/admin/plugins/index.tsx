'use client';

import { Flexbox } from '@lobehub/ui';
import { Table, Tabs, Tag, Button, Space } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminPageHeader, AdminFilterBar, AdminEditDrawer, AdminEmptyState } from '@/features/Admin/components';
import { lambdaQuery } from '@/libs/trpc/client';

const AdminPluginsPage = memo(() => {
  const { t } = useTranslation('admin');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewingPlugin, setViewingPlugin] = useState<any>(null);

  const { data, isLoading } = lambdaQuery.adminPlugin.listAllPlugins.useQuery({
    type: activeTab as any,
    search: search || undefined,
    limit: 20,
    offset: (page - 1) * 20,
  });

  const columns = [
    { title: t('plugins.name'), dataIndex: 'name', key: 'name' },
    { title: t('plugins.type'), dataIndex: 'type', key: 'type', render: (v: string) => v ? <Tag>{v.toUpperCase()}</Tag> : '-' },
    {
      title: '操作', key: 'actions', width: 100,
      render: (_: any, record: any) => (
        <Button type="link" size="small" icon={<InfoCircleOutlined />}
          onClick={() => setViewingPlugin(record)}>
          详情
        </Button>
      ),
    },
  ];

  const plugins = (data?.data ?? []) as any[];

  return (
    <Flexbox gap={0}>
      <AdminPageHeader title={t('plugins.title')} breadcrumb={[{ title: t('plugins.title') }]} />
      <AdminFilterBar
        searchPlaceholder={t('plugins.searchPlaceholder')}
        searchValue={search}
        onSearchChange={setSearch}
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
        <AdminEmptyState description={`暂无${activeTab === 'all' ? '' : activeTab}插件`} />
      ) : (
        <Table columns={columns} dataSource={plugins} loading={isLoading}
          pagination={{ current: page, pageSize: 20, total: data?.total ?? 0, onChange: setPage, showSizeChanger: true, showTotal: (total: number) => `共 ${total} 条` }}
          rowKey="id"
        />
      )}

      {/* 查看插件详情 Drawer */}
      <AdminEditDrawer open={!!viewingPlugin} title="插件详情" onClose={() => setViewingPlugin(null)}
        footer={null}>
        {viewingPlugin && (
          <Flexbox gap={16}>
            <div>
              <div style={{ color: '#666', marginBottom: 4 }}>{t('plugins.name')}</div>
              <div style={{ fontSize: 16, fontWeight: 500 }}>{viewingPlugin.name || '-'}</div>
            </div>
            <div>
              <div style={{ color: '#666', marginBottom: 4 }}>{t('plugins.type')}</div>
              <div style={{ fontSize: 16, fontWeight: 500 }}>{viewingPlugin.type ? <Tag>{viewingPlugin.type.toUpperCase()}</Tag> : '-'}</div>
            </div>
            <div>
              <div style={{ color: '#666', marginBottom: 4 }}>标识符</div>
              <div style={{ fontSize: 14 }}>{viewingPlugin.identifier || viewingPlugin.id || '-'}</div>
            </div>
            <div>
              <div style={{ color: '#666', marginBottom: 4 }}>Manifest</div>
              <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, fontSize: 12, maxHeight: 400, overflow: 'auto' }}>
                {viewingPlugin.manifest ? JSON.stringify(viewingPlugin.manifest, null, 2) : '暂无 manifest 数据'}
              </pre>
            </div>
          </Flexbox>
        )}
      </AdminEditDrawer>
    </Flexbox>
  );
});

export default AdminPluginsPage;
