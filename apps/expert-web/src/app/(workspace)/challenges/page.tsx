'use client';

import { Button, Card, Empty, Form, Input, Select, Space, Table, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';

type Challenge = { id: string; title: string; summary: string; difficulty: string; status: string };

const { Title, Paragraph } = Typography;

export default function ChallengesPage() {
  const [form] = Form.useForm();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  async function loadChallenges() {
    try {
      setLoading(true);
      setChallenges(await apiFetch<Challenge[]>('/challenges'));
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '加载难题挑战失败');
    } finally {
      setLoading(false);
    }
  }

  async function createChallenge(values: { title: string; summary: string; difficulty: string }) {
    try {
      setSubmitting(true);
      await apiFetch('/challenges', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      messageApi.success('难题挑战已发布');
      form.resetFields();
      await loadChallenges();
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '创建难题挑战失败');
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    loadChallenges();
  }, []);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {contextHolder}
      <Title level={3} style={{ margin: 0 }}>
        难题挑战
      </Title>
      <Paragraph type="secondary" style={{ margin: 0 }}>
        管理挑战内容与难度分层。
      </Paragraph>
      <Card title="发布挑战">
        <Form form={form} layout="inline" onFinish={createChallenge}>
          <Form.Item name="title" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="挑战标题" />
          </Form.Item>
          <Form.Item name="summary" rules={[{ required: true, message: '请输入摘要' }]}>
            <Input placeholder="挑战摘要" style={{ width: 360 }} />
          </Form.Item>
          <Form.Item name="difficulty" initialValue="中级">
            <Select
              style={{ width: 140 }}
              options={[
                { label: '初级', value: '初级' },
                { label: '中级', value: '中级' },
                { label: '高级', value: '高级' },
              ]}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            发布挑战
          </Button>
        </Form>
      </Card>
      <Card title="挑战列表">
        {challenges.length > 0 ? (
          <Table
            rowKey="id"
            loading={loading}
            dataSource={challenges}
            pagination={false}
            columns={[
              { title: '挑战标题', dataIndex: 'title' },
              { title: '摘要', dataIndex: 'summary' },
              { title: '难度', dataIndex: 'difficulty' },
              { title: '状态', dataIndex: 'status', render: (value: string) => <Tag color="blue">{value}</Tag> },
            ]}
          />
        ) : (
          <Empty description="暂无挑战，可先发布一条难题挑战" />
        )}
      </Card>
    </Space>
  );
}
