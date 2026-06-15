'use client';

import { memo, useState } from 'react';
import { Flexbox } from '@lobehub/ui';
import { Table, DatePicker } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AdminPageHeader, AdminFilterBar, AdminEmptyState } from '@/features/Admin/components';
import { lambdaQuery } from '@/libs/trpc/client';

const { RangePicker } = DatePicker;

const AdminSessionsPage = memo(() => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  const { data, isLoading } = lambdaQuery.admin.querySessions.useQuery({
    search: search || undefined,
    limit: 20,
    offset: (page - 1) * 20,
  });

  const columns = [
    { title: '用户', dataIndex: 'user_email', key: 'user_email' },
    { title: '消息数', dataIndex: 'message_count', key: 'message_count' },
    { title: '更新时间', dataIndex: 'updated_at', key: 'updated_at', render: (v: string) => v ? new Date(v).toLocaleString('zh-CN') : '-' },
  ];

  const sessions = (data?.data ?? []) as any[];

  return (
    <Flexbox gap={0}>
      <AdminPageHeader title="会话存档" breadcrumb={[{ title: '会话管理' }]} />
      <AdminFilterBar
        searchPlaceholder="搜索用户邮箱..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={
          <RangePicker
            onChange={(dates) => {
              if (dates?.[0] && dates?.[1]) setDateRange([dates[0].toISOString(), dates[1].toISOString()]);
              else setDateRange(null);
            }}
          />
        }
      />
      {!isLoading && sessions.length === 0 ? (
        <AdminEmptyState description="暂无会话记录" />
      ) : (
        <Table
          columns={columns}
          dataSource={sessions}
          loading={isLoading}
          onRow={(record: any) => ({ onClick: () => navigate(`/admin/sessions/${record.id}`), style: { cursor: 'pointer' } })}
          pagination={{ current: page, pageSize: 20, total: data?.total ?? 0, onChange: setPage, showSizeChanger: true, showTotal: (t: number) => `共 ${t} 条` }}
          rowKey="id"
        />
      )}
    </Flexbox>
  );
});

export default AdminSessionsPage;
