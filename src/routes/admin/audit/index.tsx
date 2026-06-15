'use client';

import { memo, useState } from 'react';
import { Flexbox } from '@lobehub/ui';
import { Table, Tag, Select, DatePicker, Button, Space } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { AdminPageHeader, AdminFilterBar, AdminEmptyState, AdminEditDrawer } from '@/features/Admin/components';
import { lambdaQuery } from '@/libs/trpc/client';

const { RangePicker } = DatePicker;

const CATEGORY_MAP: Record<string, { label: string; color: string }> = {
  auth: { label: '认证', color: 'blue' },
  user: { label: '用户', color: 'green' },
  agent: { label: '智能体', color: 'purple' },
  plugin: { label: '插件', color: 'orange' },
  mcp: { label: 'MCP', color: 'cyan' },
  knowledge: { label: '知识库', color: 'magenta' },
  session: { label: '会话', color: 'geekblue' },
  rbac: { label: '权限', color: 'red' },
  system: { label: '系统', color: 'default' },
};

const AdminAuditPage = memo(() => {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string | undefined>();
  const [action, setAction] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const { data, isLoading } = lambdaQuery.auditLog.query.useQuery({
    category,
    action,
    limit: 20,
    offset: (page - 1) * 20,
    ...(dateRange ? { startDate: dateRange[0], endDate: dateRange[1] } : {}),
  });

  const columns = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 120,
      render: (v: string) => (v ? v.substring(0, 10) + '...' : '-'),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 90,
      render: (v: string) => {
        const info = CATEGORY_MAP[v] || { label: v, color: 'default' };
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    { title: '操作', dataIndex: 'action', key: 'action', width: 90 },
    { title: '操作对象', dataIndex: 'target', key: 'target', ellipsis: true },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (v: string) => (v ? new Date(v).toLocaleString('zh-CN') : '-'),
    },
    { title: 'IP', dataIndex: 'ip', key: 'ip', width: 130 },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_: any, record: any) => (
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setSelectedLog(record)}>
          查看
        </Button>
      ),
    },
  ];

  const logs = (data?.data ?? []) as any[];

  // Human-readable formatter for audit detail
  const formatDetail = (log: any) => {
    const detail =
      log.detail
        ? typeof log.detail === 'string'
          ? log.detail
          : JSON.stringify(log.detail, null, 2)
        : '';
    return [
      { label: '用户ID', value: log.userId || '-' },
      {
        label: '操作分类',
        value:
          (CATEGORY_MAP[log.category]?.label || log.category) +
          ' (' +
          (log.action || '-') +
          ')',
      },
      { label: '操作对象', value: log.target || '-' },
      {
        label: '时间',
        value: log.createdAt ? new Date(log.createdAt).toLocaleString('zh-CN') : '-',
      },
      { label: 'IP 地址', value: log.ip || '-' },
      { label: 'User-Agent', value: log.userAgent || '-' },
      { label: '详情', value: detail },
    ];
  };

  return (
    <Flexbox gap={0}>
      <AdminPageHeader title="审计日志" breadcrumb={[{ title: '审计日志' }]} />
      <AdminFilterBar
        searchPlaceholder="搜索..."
        filters={
          <Flexbox horizontal gap={8} wrap="wrap" style={{ flex: 1 }}>
            <Select
              allowClear
              placeholder="分类"
              value={category}
              onChange={setCategory}
              style={{ width: 120 }}
              options={Object.entries(CATEGORY_MAP).map(([k, v]) => ({
                value: k,
                label: v.label,
              }))}
            />
            <Select
              allowClear
              placeholder="操作"
              value={action}
              onChange={setAction}
              style={{ width: 120 }}
              options={[
                'login',
                'logout',
                'create',
                'update',
                'delete',
                'read',
                'export',
                'assign',
                'revoke',
                'enable',
                'disable',
              ].map((a) => ({ value: a, label: a }))}
            />
            <RangePicker
              onChange={(dates: any) => {
                if (dates?.[0] && dates?.[1])
                  setDateRange([dates[0].toISOString(), dates[1].toISOString()]);
                else setDateRange(null);
              }}
              style={{ width: 260 }}
            />
          </Flexbox>
        }
      />
      {!isLoading && logs.length === 0 ? (
        <AdminEmptyState description="暂无审计日志" />
      ) : (
        <Table
          columns={columns}
          dataSource={logs}
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

      {/* 日志详情 Drawer */}
      <AdminEditDrawer
        open={!!selectedLog}
        title="日志详情"
        onClose={() => setSelectedLog(null)}
      >
        {selectedLog && (
          <Flexbox gap={12}>
            {formatDetail(selectedLog).map((item: any, idx: number) => (
              <div key={idx}>
                <div
                  style={{
                    color: 'var(--colorTextSecondary)',
                    fontSize: 12,
                    marginBottom: 2,
                  }}
                >
                  {item.label}
                </div>
                {item.label === '详情' && item.value ? (
                  <pre
                    style={{
                      background: 'var(--colorFillQuaternary)',
                      padding: 12,
                      borderRadius: 6,
                      fontSize: 12,
                      maxHeight: 300,
                      overflow: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      margin: 0,
                    }}
                  >
                    {item.value}
                  </pre>
                ) : (
                  <div style={{ fontSize: 14 }}>{item.value || '-'}</div>
                )}
              </div>
            ))}
          </Flexbox>
        )}
      </AdminEditDrawer>
    </Flexbox>
  );
});

export default AdminAuditPage;
