'use client';

import { InboxOutlined } from '@ant-design/icons';
import { Button, Card, Empty, Form, Input, Select, Space, Table, Tag, Typography, Upload, message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { useEffect, useState } from 'react';
import { apiFetch, uploadFile } from '../../../lib/api';

type Task = {
  id: string;
  title: string;
  description: string;
  taskType: string;
  status: string;
  teamName?: string;
  dueAt?: string;
};

type Team = { id: string; name: string };

const { Title } = Typography;
const { Dragger } = Upload;

export default function TasksPage() {
  const [form] = Form.useForm();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [uploadList, setUploadList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  async function loadData() {
    try {
      setLoading(true);
      const [taskData, teamData] = await Promise.all([
        apiFetch<Task[]>('/tasks'),
        apiFetch<Team[]>('/teams'),
      ]);
      setTasks(taskData);
      setTeams(teamData);
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '加载任务失败');
    } finally {
      setLoading(false);
    }
  }

  async function createTask(values: { teamId?: string; title: string; description: string; taskType: string }) {
    try {
      setSubmitting(true);
      let description = values.description;

      if (uploadList[0]?.originFileObj) {
        const uploaded = await uploadFile<{ file: { publicUrl: string; originalName: string } }>(
          uploadList[0].originFileObj as File,
        );
        description = `${description}\n附件：${uploaded.file.originalName} (${uploaded.file.publicUrl})`;
      }

      await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          description,
        }),
      });
      messageApi.success('任务已创建');
      form.resetFields();
      setUploadList([]);
      await loadData();
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '创建任务失败');
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {contextHolder}
      <Title level={3} style={{ margin: 0 }}>
        任务管理
      </Title>
      <Card title="创建任务">
        <Form form={form} layout="vertical" onFinish={createTask}>
          <Form.Item name="teamId" label="所属团队">
            <Select
              allowClear
              placeholder="选择团队"
              options={teams.map((team) => ({ label: team.name, value: team.id }))}
            />
          </Form.Item>
          <Form.Item name="title" label="任务名称" rules={[{ required: true, message: '请输入任务名称' }]}>
            <Input placeholder="任务名称" />
          </Form.Item>
          <Form.Item name="description" label="任务说明" rules={[{ required: true, message: '请输入任务说明' }]}>
            <Input.TextArea rows={4} placeholder="任务说明" />
          </Form.Item>
          <Form.Item label="任务附件">
            <Dragger
              beforeUpload={() => false}
              multiple={false}
              fileList={uploadList}
              onChange={({ fileList }) => setUploadList(fileList.slice(-1))}
              accept="image/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">可选上传任务素材或说明附件</p>
              <p className="ant-upload-hint">当前先走本地开发上传接口，并把附件地址追加到任务说明中。</p>
            </Dragger>
          </Form.Item>
          <Form.Item name="taskType" label="任务类型" rules={[{ required: true, message: '请选择任务类型' }]}>
            <Select
              options={[
                { label: '个人任务', value: 'individual' },
                { label: '小组任务', value: 'group' },
                { label: '问答任务', value: 'qa' },
                { label: '创作任务', value: 'creation' },
              ]}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            创建并下发
          </Button>
        </Form>
      </Card>
      <Card title="任务列表" loading={loading}>
        {tasks.length > 0 ? (
          <Table
            rowKey="id"
            dataSource={tasks}
            columns={[
              { title: '任务名称', dataIndex: 'title' },
              { title: '团队', dataIndex: 'teamName', render: (value?: string) => value ?? '-' },
              { title: '类型', dataIndex: 'taskType', render: (value: string) => <Tag color="purple">{value}</Tag> },
              { title: '状态', dataIndex: 'status', render: (value: string) => <Tag color="blue">{value}</Tag> },
              { title: '说明', dataIndex: 'description' },
            ]}
          />
        ) : (
          <Empty description="暂无任务，可先创建并下发任务" />
        )}
      </Card>
    </Space>
  );
}
