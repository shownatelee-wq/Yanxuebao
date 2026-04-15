'use client';

import { Button, Empty, Space, Tag, Typography } from 'antd';
import Link from 'next/link';

const { Paragraph, Text } = Typography;

export function WatchHero({
  title,
  subtitle,
  tags,
  children,
}: {
  title: string;
  subtitle?: string;
  tags?: Array<{ label: string; color?: string }>;
  children?: React.ReactNode;
}) {
  return (
    <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        {tags?.length ? (
          <Space size={[6, 6]} wrap>
            {tags.map((tag) => (
              <Tag key={tag.label} color={tag.color ?? 'blue'}>
                {tag.label}
              </Tag>
            ))}
          </Space>
        ) : null}
        <p className="device-page-title">{title}</p>
        {subtitle ? <p className="device-page-subtle">{subtitle}</p> : null}
        {children}
      </Space>
    </div>
  );
}

export function WatchSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="device-compact-card">
      <div className="device-page-toolbar">
        <p className="device-section-label" style={{ marginBottom: 0 }}>
          {title}
        </p>
        {action}
      </div>
      {children}
    </div>
  );
}

export function WatchNextSteps({
  text,
  children,
}: {
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="device-compact-card">
      <p className="device-section-label">操作</p>
      <Paragraph style={{ margin: 0, fontSize: 11, color: '#6a7a9b' }}>{text}</Paragraph>
      {children}
    </div>
  );
}

export function WatchActionButtons({
  primary,
  secondary,
}: {
  primary: { label: string; path: string };
  secondary?: { label: string; path: string };
}) {
  return (
    <div className={`device-action-row${secondary ? '' : ' single'}`}>
      <Link href={primary.path}>
        <Button type="primary" block>
          {primary.label}
        </Button>
      </Link>
      {secondary ? (
        <Link href={secondary.path}>
          <Button block>{secondary.label}</Button>
        </Link>
      ) : null}
    </div>
  );
}

export function WatchEmpty({ description }: { description: string }) {
  return <Empty description={description} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
}

export function WatchInfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="device-detail-row">
      <Text type="secondary" style={{ fontSize: 11 }}>
        {label}
      </Text>
      <Text strong style={{ fontSize: 12 }}>
        {value}
      </Text>
    </div>
  );
}
