'use client';

import { memo, useState } from 'react';
import { Flexbox } from '@lobehub/ui';
import { Table, Tag, Select, DatePicker, Button } from 'antd';
import { AdminPageHeader, AdminFilterBar, AdminEmptyState, AdminEditDrawer } from '@/features/Admin/components';
import { lambdaQuery } from '@/libs/trpc/client';

const { RangePicker } = DatePicker;

const AdminAuditPage = memo(() => {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  const { data, isLoading } = lambdaQuery.auditLog.query.useQuery({
    category,
    limit: 20,
    offset: (page - 1) * 20,
    ...(dateRange ? { startDate: dateRange[0], endDate: dateRange[1] } : {}),
  });

  const [selectedLog, setSelectedLog] = useState<any>(null);

  const columns = [
    { title: '用户', dataIndex: 'userId', key: 'userId', width: 150, render: (v: string) => v ? v.substring(0, 12) + '...' : '-' },
    { title: '分类', dataIndex: 'category', key: 'category', width: 100, render: (v: string) => <Tag>{v}</Tag> },
    { title: '操作', dataIndex: 'action', key: 'action', width: 100 },
    { title: '对象', dataIndex: 'target', key: 'target', ellipsis: true },
    { title: '时间', dataIndex: 'createdAt', key: 'createdAt', width: 180, render: (v: string) => v ? new Date(v).toLocaleString('zh-CN') : '-' },
    { title: 'IP', dataIndex: 'ip', key: 'ip', width: 130 },
    { title: '操作', key: 'actions', width: 100,
      render: (_: any, record: any) => (
        <Button type="link" size="small" onClick={() => setSelectedLog(record)}>详情</Button>
      ),
    },
  ];

  const logs = (data?.data ?? []) as any[];

  return (
    <Flexbox gap={0}>
      <AdminPageHeader title="审计日志" breadcrumb={[{ title: '审计日志' }]} />
      <AdminFilterBar
        searchPlaceholder="搜索..."
        filters={
          <Flexbox horizontal gap={8}>
            <Select allowClear placeholder="分类" value={category} onChange={setCategory} style={{ width: 120 }}
              options={['auth','user','agent','plugin','mcp','knowledge','session','rbac','system'].map(c => ({ value: c, label: c }))} />
            <RangePicker onChange={(dates) => {
              if (dates?.[0] && dates?.[1]) setDateRange([dates[0].toISOString(), dates[1].toISOString()]);
              else setDateRange(null);
            }} />
          </Flexbox>
        }
      />
      {!isLoading && logs.length === 0 ? (
        <AdminEmptyState description="暂无审计日志" />
      ) : (
        <Table columns={columns} dataSource={logs} loading={isLoading} rowKey="id"
          pagination={{ current: page, pageSize: 20, total: data?.total ?? 0, onChange: setPage, showSizeChanger: true, showTotal: (t: number) => `共 ${t} 条` }} />
      )}
      <AdminEditDrawer open={!!selectedLog} title="日志详情" onClose={() => setSelectedLog(null)}>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: 12 }}>{JSON.stringify(selectedLog, null, 2)}</pre>
      </AdminEditDrawer>
    </Flexbox>
  );
});

export default AdminAuditPage;
