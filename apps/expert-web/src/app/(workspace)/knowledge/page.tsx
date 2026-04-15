'use client';

import { Button, Card, Empty, Form, Input, Space, Table, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';

type Knowledge = { id: string; title: string; category: string; content: string };

const { Title, Paragraph } = Typography;

export default function KnowledgePage() {
  const [form] = Form.useForm();
  const [items, setItems] = useState<Knowledge[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  async function loadItems() {
    try {
      setLoading(true);
      setItems(await apiFetch<Knowledge[]>('/knowledge'));
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '加载知识库失败');
    } finally {
      setLoading(false);
    }
  }

  async function createItem(values: { title: string; category: string; content: string }) {
    try {
      setSubmitting(true);
      await apiFetch('/knowledge', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      messageApi.success('知识条目已创建');
      form.resetFields();
      await loadItems();
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '创建知识条目失败');
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {contextHolder}
      <Title level={3} style={{ margin: 0 }}>
        知识库管理
      </Title>
      <Paragraph type="secondary" style={{ margin: 0 }}>
        管理知识卡片与 AI 问答底层内容。
      </Paragraph>
      <Card title="新增知识条目">
        <Form form={form} layout="vertical" onFinish={createItem}>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="标题" />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true, message: '请输入分类' }]}>
            <Input placeholder="分类" />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入内容' }]}>
            <Input.TextArea rows={4} placeholder="知识条目内容" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            保存知识条目
          </Button>
        </Form>
      </Card>
      <Card title="知识条目列表">
        {items.length > 0 ? (
          <Table
            rowKey="id"
            loading={loading}
            dataSource={items}
            pagination={false}
            columns={[
              { title: '标题', dataIndex: 'title' },
              { title: '分类', dataIndex: 'category' },
              { title: '内容', dataIndex: 'content' },
            ]}
          />
        ) : (
          <Empty description="暂无知识条目，创建后将用于 AI 问答内容供给" />
        )}
      </Card>
    </Space>
  );
}
