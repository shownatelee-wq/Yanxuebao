'use client';

import { Button, Card, Empty, Form, Input, Space, Table, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';

type News = { id: string; title: string; summary: string; category: string; publishedAt?: string };

const { Title, Paragraph } = Typography;

export default function NewsPage() {
  const [form] = Form.useForm();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  async function loadNews() {
    try {
      setLoading(true);
      setNews(await apiFetch<News[]>('/news'));
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '加载资讯失败');
    } finally {
      setLoading(false);
    }
  }

  async function createNews(values: { title: string; summary: string; category: string }) {
    try {
      setSubmitting(true);
      await apiFetch('/news', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      messageApi.success('资讯已发布');
      form.resetFields();
      await loadNews();
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '发布资讯失败');
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    loadNews();
  }, []);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {contextHolder}
      <Title level={3} style={{ margin: 0 }}>
        资讯管理
      </Title>
      <Paragraph type="secondary" style={{ margin: 0 }}>
        采集、编辑和发布研学资讯。
      </Paragraph>
      <Card title="发布资讯">
        <Form form={form} layout="inline" onFinish={createNews}>
          <Form.Item name="title" rules={[{ required: true, message: '请输入资讯标题' }]}>
            <Input placeholder="资讯标题" />
          </Form.Item>
          <Form.Item name="summary" rules={[{ required: true, message: '请输入资讯摘要' }]}>
            <Input placeholder="资讯摘要" style={{ width: 360 }} />
          </Form.Item>
          <Form.Item name="category" initialValue="研学资讯">
            <Input placeholder="资讯分类" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            发布资讯
          </Button>
        </Form>
      </Card>
      <Card title="资讯列表">
        {news.length > 0 ? (
          <Table
            rowKey="id"
            loading={loading}
            dataSource={news}
            pagination={false}
            columns={[
              { title: '资讯标题', dataIndex: 'title' },
              { title: '摘要', dataIndex: 'summary' },
              { title: '分类', dataIndex: 'category', render: (value: string) => <Tag>{value}</Tag> },
              { title: '发布时间', dataIndex: 'publishedAt', render: (value?: string) => value ?? '-' },
            ]}
          />
        ) : (
          <Empty description="暂无资讯，可先发布一条研学资讯" />
        )}
      </Card>
    </Space>
  );
}
