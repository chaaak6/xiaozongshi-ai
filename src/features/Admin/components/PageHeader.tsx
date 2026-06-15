'use client';

import { Breadcrumb } from 'antd';
import { type ReactNode } from 'react';

interface AdminPageHeaderProps {
  title: string;
  breadcrumb?: { title: string }[];
  extra?: ReactNode;
}

export function AdminPageHeader({ title, breadcrumb = [], extra }: AdminPageHeaderProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Breadcrumb
        items={[{ title: '管理后台' }, ...breadcrumb.map((b) => ({ title: b.title }))]}
        style={{ marginBottom: 4 }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{title}</h3>
        <div style={{ display: 'flex', gap: 8 }}>{extra}</div>
      </div>
    </div>
  );
}
