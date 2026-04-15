'use client';

import { App, Button, Card, List, Space, Tag, Typography } from 'antd';
import type { ReactNode } from 'react';

const { Paragraph, Text, Title } = Typography;

export function PageIntro(props: {
  title: string;
  subtitle: string;
  tags?: string[];
  actions?: ReactNode;
}) {
  const { title, subtitle, tags = [], actions } = props;

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Space wrap>
        {tags.map((tag) => (
          <Tag key={tag} color="blue">
            {tag}
          </Tag>
        ))}
      </Space>
      <Space direction="vertical" size={4}>
        <Title level={2} style={{ margin: 0 }}>
          {title}
        </Title>
        <Paragraph type="secondary" style={{ margin: 0 }}>
          {subtitle}
        </Paragraph>
      </Space>
      {actions}
    </Space>
  );
}

export function ChecklistCard(props: { title: string; items: string[] }) {
  return (
    <Card title={props.title}>
      <List
        dataSource={props.items}
        renderItem={(item) => (
          <List.Item>
            <Text>{item}</Text>
          </List.Item>
        )}
      />
    </Card>
  );
}

export function StatusNotice(props: { title: string; description: string; buttonText?: string }) {
  return (
    <App>
      <Card>
        <Space direction="vertical" size={12}>
          <Title level={4} style={{ margin: 0 }}>
            {props.title}
          </Title>
          <Paragraph type="secondary" style={{ margin: 0 }}>
            {props.description}
          </Paragraph>
          {props.buttonText ? <Button type="primary">{props.buttonText}</Button> : null}
        </Space>
      </Card>
    </App>
  );
}
