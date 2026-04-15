'use client';

import { Button, Card, Empty, Form, Input, Space, Table, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';

type Organization = {
  id: string;
  name: string;
  type: string;
  city?: string;
  contactName?: string;
  contactPhone?: string;
};

const { Title, Paragraph } = Typography;

export default function OrganizationsPage() {
  const [form] = Form.useForm();
  const [records, setRecords] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  async function loadOrganizations() {
    setLoading(true);
    try {
      const data = await apiFetch<Organization[]>('/admin/organizations');
      setRecords(data);
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '加载机构失败');
    } finally {
      setLoading(false);
    }
  }

  async function createOrganization(values: Omit<Organization, 'id'>) {
    try {
      setSubmitting(true);
      await apiFetch('/admin/organizations', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      messageApi.success('机构已创建');
      form.resetFields();
      await loadOrganizations();
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '创建失败');
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    loadOrganizations();
  }, []);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {contextHolder}
      <Space direction="vertical" size={4}>
        <Title level={3} style={{ margin: 0 }}>
          合作机构管理
        </Title>
        <Paragraph type="secondary" style={{ margin: 0 }}>
          当前已接通运营后台首批真实接口，可新增并查看机构信息。
        </Paragraph>
      </Space>
      <Card title="新增机构">
        <Form form={form} layout="inline" onFinish={createOrganization}>
          <Form.Item name="name" rules={[{ required: true, message: '请输入机构名称' }]}>
            <Input placeholder="机构名称" />
          </Form.Item>
          <Form.Item name="type" rules={[{ required: true, message: '请输入机构类型' }]}>
            <Input placeholder="机构类型" />
          </Form.Item>
          <Form.Item name="city">
            <Input placeholder="城市" />
          </Form.Item>
          <Form.Item name="contactName">
            <Input placeholder="联系人" />
          </Form.Item>
          <Form.Item name="contactPhone">
            <Input placeholder="联系电话" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            创建机构
          </Button>
        </Form>
      </Card>
      <Card title="机构列表">
        {records.length > 0 ? (
          <Table
            rowKey="id"
            loading={loading}
            dataSource={records}
            columns={[
              { title: '机构名称', dataIndex: 'name' },
              {
                title: '类型',
                dataIndex: 'type',
                render: (value: string) => <Tag color="blue">{value}</Tag>,
              },
              { title: '城市', dataIndex: 'city', render: (value?: string) => value ?? '-' },
              { title: '联系人', dataIndex: 'contactName', render: (value?: string) => value ?? '-' },
              { title: '联系电话', dataIndex: 'contactPhone', render: (value?: string) => value ?? '-' },
            ]}
          />
        ) : (
          <Empty description="当前暂无机构，新增后会在这里展示" />
        )}
      </Card>
    </Space>
  );
}
