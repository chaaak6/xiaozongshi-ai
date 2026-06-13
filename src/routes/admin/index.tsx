'use client';

import { Flexbox, Text } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { lambdaQuery } from '@/libs/trpc/client';
import { useAdminStore } from '@/store/admin';

const DashboardPage = memo(() => {
  const { t } = useTranslation('admin');
  const { dashboardStats, setDashboardStats } = useAdminStore();
  const { data, isLoading } = lambdaQuery.admin.getDashboardStats.useQuery();

  useEffect(() => {
    if (data) setDashboardStats(data as any);
  }, [data]);

  if (isLoading || !dashboardStats) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  const stats = [
    { label: t('stats.totalUsers'), value: dashboardStats.totalUsers },
    { label: t('stats.totalSessions'), value: dashboardStats.totalSessions },
    { label: t('stats.totalMessages'), value: dashboardStats.totalMessages },
    { label: t('stats.totalKnowledgeBases'), value: dashboardStats.totalKnowledgeBases },
    { label: t('stats.weeklyActiveSessions'), value: dashboardStats.weeklyActiveSessions },
    { label: t('stats.monthlyActiveUsers'), value: dashboardStats.monthlyActiveUsers },
  ];

  return (
    <Flexbox gap={16}>
      <Text style={{ fontSize: 24, fontWeight: 600 }}>{t('dashboard')}</Text>
      <Flexbox gap={16} horizontal style={{ flexWrap: 'wrap' }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: 'var(--colorFillSecondary)',
              borderRadius: 12,
              minWidth: 200,
              padding: 20,
            }}
          >
            <Text style={{ color: 'var(--colorTextSecondary)', fontSize: 13 }}>
              {stat.label}
            </Text>
            <Text style={{ fontSize: 28, fontWeight: 700 }}>
              {stat.value?.toLocaleString() ?? '-'}
            </Text>
          </div>
        ))}
      </Flexbox>
    </Flexbox>
  );
});

export default DashboardPage;
