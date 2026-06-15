'use client';

import { Breadcrumb, Flex, Typography } from 'antd';
import { type ReactNode } from 'react';

const { Title } = Typography;

interface AdminPageHeaderProps {
  title: string;
  breadcrumb?: { title: string }[];
  extra?: ReactNode;
}

export function AdminPageHeader({ title, breadcrumb = [], extra }: AdminPageHeaderProps) {
  return (
    <Flex vertical gap={4} style={{ marginBottom: 16 }}>
      <Breadcrumb
        items={[{ title: '管理后台' }, ...breadcrumb.map((b) => ({ title: b.title }))]}
      />
      <Flex justify="space-between" align="center">
        <Title level={3} style={{ margin: 0, flex: '0 0 auto' }}>{title}</Title>
        <Flex gap={8}>{extra}</Flex>
      </Flex>
    </Flex>
  );
}
