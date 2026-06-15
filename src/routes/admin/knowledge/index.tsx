'use client';

import { memo, useState } from 'react';
import { Flexbox } from '@lobehub/ui';
import { Table, Tag, Button, Space, Descriptions } from 'antd';
import { AdminPageHeader, AdminFilterBar, AdminEditDrawer, AdminEmptyState } from '@/features/Admin/components';
import { lambdaQuery } from '@/libs/trpc/client';

const AdminKnowledgePage = memo(() => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedKB, setSelectedKB] = useState<any>(null);

  const { data, isLoading } = lambdaQuery.knowledgeBaseAdmin.listAll.useQuery({
    search: search || undefined,
    limit: 20,
    offset: (page - 1) * 20,
  });

  const columns: any[] = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    {
      title: '可见性', dataIndex: 'visibility', key: 'visibility',
      render: (v: string) => <Tag color={v === 'workspace' ? 'green' : 'orange'}>{v ?? '-'}</Tag>,
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 180,
      render: (v: string) => v ? new Date(v).toLocaleString('zh-CN') : '-' },
    {
      title: '操作', key: 'actions', width: 120,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => setSelectedKB(record)}>详情</Button>
        </Space>
      ),
    },
  ];

  const kbs = (data?.data ?? []) as any[];

  return (
    <Flexbox gap={0}>
      <AdminPageHeader title="知识库管理" breadcrumb={[{ title: '知识库' }]} />
      <AdminFilterBar
        searchPlaceholder="搜索知识库名称..."
        searchValue={search}
        onSearchChange={setSearch}
      />
      {!isLoading && kbs.length === 0 ? (
        <AdminEmptyState description="暂无知识库" />
      ) : (
        <Table columns={columns} dataSource={kbs} loading={isLoading} rowKey="id"
          pagination={{ current: page, pageSize: 20, total: data?.total ?? 0, onChange: setPage, showSizeChanger: true, showTotal: (t: number) => `共 ${t} 条` }} />
      )}
      <AdminEditDrawer open={!!selectedKB} title={`知识库详情 — ${selectedKB?.name || ''}`} onClose={() => setSelectedKB(null)} width={560}>
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="ID">{selectedKB?.id}</Descriptions.Item>
          <Descriptions.Item label="名称">{selectedKB?.name}</Descriptions.Item>
          <Descriptions.Item label="描述">{selectedKB?.description || '-'}</Descriptions.Item>
          <Descriptions.Item label="可见性">
            <Tag color={selectedKB?.visibility === 'workspace' ? 'green' : 'orange'}>{selectedKB?.visibility ?? '-'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">{selectedKB?.createdAt ? new Date(selectedKB.createdAt).toLocaleString('zh-CN') : '-'}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{selectedKB?.updatedAt ? new Date(selectedKB.updatedAt).toLocaleString('zh-CN') : '-'}</Descriptions.Item>
        </Descriptions>
      </AdminEditDrawer>
    </Flexbox>
  );
});

export default AdminKnowledgePage;
