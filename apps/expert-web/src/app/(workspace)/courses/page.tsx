'use client';

import { Button, Card, Empty, Form, Input, Select, Space, Table, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';

type Course = { id: string; title: string; summary: string; format: string; status: string };

const { Title, Paragraph } = Typography;

export default function CoursesPage() {
  const [form] = Form.useForm();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  async function loadCourses() {
    try {
      setLoading(true);
      setCourses(await apiFetch<Course[]>('/courses'));
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '加载课程失败');
    } finally {
      setLoading(false);
    }
  }

  async function createCourse(values: { title: string; summary: string; format: string; status?: string }) {
    try {
      setSubmitting(true);
      await apiFetch('/courses', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      messageApi.success('课程已创建');
      form.resetFields();
      await loadCourses();
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '创建课程失败');
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {contextHolder}
      <Title level={3} style={{ margin: 0 }}>
        课程管理
      </Title>
      <Paragraph type="secondary" style={{ margin: 0 }}>
        管理线上/线下课程与基础状态。
      </Paragraph>
      <Card title="新增课程">
        <Form form={form} layout="inline" onFinish={createCourse}>
          <Form.Item name="title" rules={[{ required: true, message: '请输入课程标题' }]}>
            <Input placeholder="课程标题" />
          </Form.Item>
          <Form.Item name="summary" rules={[{ required: true, message: '请输入课程简介' }]}>
            <Input placeholder="课程简介" style={{ width: 360 }} />
          </Form.Item>
          <Form.Item name="format" initialValue="video">
            <Select
              style={{ width: 140 }}
              options={[
                { label: '视频课程', value: 'video' },
                { label: '直播课程', value: 'live' },
                { label: '线下课程', value: 'offline' },
              ]}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            新增课程
          </Button>
        </Form>
      </Card>
      <Card title="课程列表">
        {courses.length > 0 ? (
          <Table
            rowKey="id"
            loading={loading}
            dataSource={courses}
            pagination={false}
            columns={[
              { title: '课程标题', dataIndex: 'title' },
              { title: '课程简介', dataIndex: 'summary' },
              { title: '形式', dataIndex: 'format', render: (value: string) => <Tag>{value}</Tag> },
              { title: '状态', dataIndex: 'status', render: (value: string) => <Tag color="green">{value}</Tag> },
            ]}
          />
        ) : (
          <Empty description="暂无课程，请先新增一门课程" />
        )}
      </Card>
    </Space>
  );
}
