'use client';

import { Button, Flex, Input } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: ReactNode;
  createButtonText?: string;
  onCreate?: () => void;
  extra?: ReactNode;
}

export function AdminFilterBar({
  searchPlaceholder = '搜索...',
  searchValue,
  onSearchChange,
  filters,
  createButtonText,
  onCreate,
  extra,
}: FilterBarProps) {
  return (
    <Flex gap={12} align="center" justify="space-between" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
      <Flex gap={12} align="center" wrap="wrap">
        <Input
          placeholder={searchPlaceholder}
          prefix={<SearchOutlined />}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          style={{ width: 260 }}
          allowClear
        />
        {filters}
      </Flex>
      <Flex gap={8}>
        {extra}
        {createButtonText && onCreate && (
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
            {createButtonText}
          </Button>
        )}
      </Flex>
    </Flex>
  );
}
