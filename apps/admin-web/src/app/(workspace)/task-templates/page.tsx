'use client';

import { Button, Card, Empty, Form, Input, Select, Space, Table, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';

type TaskTemplate = {
  id: string;
  title: string;
  description: string;
  taskType: string;
  abilityTags: string[];
};

const { Title } = Typography;

export default function TaskTemplatesPage() {
  const [form] = Form.useForm();
  const [records, setRecords] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  async function loadTemplates() {
    try {
      setLoading(true);
      const data = await apiFetch<TaskTemplate[]>('/admin/task-templates');
      setRecords(data);
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '加载模板失败');
    } finally {
      setLoading(false);
    }
  }

  async function createTemplate(values: { title: string; description: string; taskType: string }) {
    try {
      setSubmitting(true);
      await apiFetch('/admin/task-templates', {
        method: 'POST',
        body: JSON.stringify({ ...values, abilityTags: [] }),
      });
      messageApi.success('模板已创建');
      form.resetFields();
      await loadTemplates();
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '创建模板失败');
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {contextHolder}
      <Title level={3} style={{ margin: 0 }}>
        任务模板库
      </Title>
      <Card title="新增模板">
        <Form form={form} layout="inline" onFinish={createTemplate}>
          <Form.Item name="title" rules={[{ required: true, message: '请输入模板名称' }]}>
            <Input placeholder="模板名称" />
          </Form.Item>
          <Form.Item name="description" rules={[{ required: true, message: '请输入描述' }]}>
            <Input placeholder="模板描述" />
          </Form.Item>
          <Form.Item name="taskType" rules={[{ required: true, message: '请选择任务类型' }]}>
            <Select
              style={{ width: 160 }}
              options={[
                { label: '个人任务', value: 'individual' },
                { label: '小组任务', value: 'group' },
                { label: '问答任务', value: 'qa' },
                { label: '创作任务', value: 'creation' },
              ]}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            创建模板
          </Button>
        </Form>
      </Card>
      <Card title="模板列表">
        {records.length > 0 ? (
          <Table
            rowKey="id"
            loading={loading}
            dataSource={records}
            columns={[
              { title: '模板名称', dataIndex: 'title' },
              { title: '描述', dataIndex: 'description' },
              {
                title: '类型',
                dataIndex: 'taskType',
                render: (value: string) => <Tag color="purple">{value}</Tag>,
              },
            ]}
          />
        ) : (
          <Empty description="暂无模板，创建后可供导师快速下发任务" />
        )}
      </Card>
    </Space>
  );
}
