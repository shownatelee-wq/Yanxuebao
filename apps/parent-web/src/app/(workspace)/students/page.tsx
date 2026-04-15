'use client';

import { Button, Card, Descriptions, Empty, Form, Input, Select, Space, Table, Tag, Typography, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../../lib/api';

type Student = {
  id: string;
  name: string;
  city?: string;
  school?: string;
  grade?: string;
  primaryParent?: string;
  primaryParentUserId?: string;
  deviceBindings?: Array<{ deviceCode: string; mode: string; boundAt: string }>;
  growthValue?: number;
  reportsCount?: number;
};

const { Title, Paragraph } = Typography;

export default function ParentStudentsPage() {
  const [createForm] = Form.useForm();
  const [bindForm] = Form.useForm();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [binding, setBinding] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const selectedStudent = useMemo(
    () => students.find((item) => item.id === selectedStudentId) ?? students[0],
    [selectedStudentId, students],
  );

  async function loadStudents() {
    try {
      setLoading(true);
      const list = await apiFetch<Student[]>('/students');
      const details = await Promise.all(list.map((student) => apiFetch<Student>(`/students/${student.id}`)));
      setStudents(details);
      if (!selectedStudentId && details[0]) {
        setSelectedStudentId(details[0].id);
      }
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '加载学员失败');
    } finally {
      setLoading(false);
    }
  }

  async function createStudent(values: { name: string; city?: string; school?: string; grade?: string }) {
    try {
      setCreating(true);
      await apiFetch('/students', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      messageApi.success('学员已创建');
      createForm.resetFields();
      await loadStudents();
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '创建学员失败');
    } finally {
      setCreating(false);
    }
  }

  async function bindDevice(values: { deviceCode: string; mode: 'rental' | 'sale' }) {
    if (!selectedStudent) {
      messageApi.warning('请先选择学员');
      return;
    }

    try {
      setBinding(true);
      await apiFetch('/devices/bind', {
        method: 'POST',
        body: JSON.stringify({
          studentId: selectedStudent.id,
          deviceCode: values.deviceCode,
          mode: values.mode,
        }),
      });
      messageApi.success('设备已绑定');
      bindForm.resetFields();
      await loadStudents();
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '绑定设备失败');
    } finally {
      setBinding(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {contextHolder}
      <Title level={3} style={{ margin: 0 }}>
        学员与设备
      </Title>
      <Paragraph type="secondary" style={{ margin: 0 }}>
        完成学员注册、设备绑定和基础成长档案初始化。
      </Paragraph>
      <Card title="新增学员">
        <Form form={createForm} layout="inline" onFinish={createStudent}>
          <Form.Item name="name" rules={[{ required: true, message: '请输入学员姓名' }]}>
            <Input placeholder="学员姓名" />
          </Form.Item>
          <Form.Item name="school">
            <Input placeholder="学校" />
          </Form.Item>
          <Form.Item name="grade">
            <Input placeholder="年级" />
          </Form.Item>
          <Form.Item name="city">
            <Input placeholder="城市" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={creating}>
            创建学员
          </Button>
        </Form>
      </Card>
      <Card title="学员列表" loading={loading}>
        {students.length > 0 ? (
          <Table
            rowKey="id"
            dataSource={students}
            pagination={false}
            onRow={(record) => ({
              onClick: () => setSelectedStudentId(record.id),
            })}
            rowClassName={(record) => (record.id === selectedStudent?.id ? 'ant-table-row-selected' : '')}
            columns={[
              { title: '学员', dataIndex: 'name' },
              { title: '学校', dataIndex: 'school', render: (value?: string) => value ?? '-' },
              { title: '年级', dataIndex: 'grade', render: (value?: string) => value ?? '-' },
              { title: '成长值', dataIndex: 'growthValue', render: (value?: number) => value ?? 0 },
              { title: '报告数', dataIndex: 'reportsCount', render: (value?: number) => value ?? 0 },
            ]}
          />
        ) : (
          <Empty description="当前还没有学员，请先创建一位学员" />
        )}
      </Card>
      <Card title="当前学员详情">
        {selectedStudent ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="学员姓名">{selectedStudent.name}</Descriptions.Item>
            <Descriptions.Item label="学校">{selectedStudent.school ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="年级">{selectedStudent.grade ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="城市">{selectedStudent.city ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="成长值">{selectedStudent.growthValue ?? 0}</Descriptions.Item>
            <Descriptions.Item label="报告数">{selectedStudent.reportsCount ?? 0}</Descriptions.Item>
            <Descriptions.Item label="已绑设备" span={2}>
              <Space wrap>
                {(selectedStudent.deviceBindings ?? []).length > 0 ? (
                  selectedStudent.deviceBindings?.map((binding) => (
                    <Tag key={`${binding.deviceCode}-${binding.boundAt}`}>
                      {binding.deviceCode} · {binding.mode}
                    </Tag>
                  ))
                ) : (
                  <span>暂无绑定设备</span>
                )}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Empty description="暂无学员数据" />
        )}
      </Card>
      <Card title="绑定设备">
        <Form form={bindForm} layout="inline" onFinish={bindDevice}>
          <Form.Item name="deviceCode" rules={[{ required: true, message: '请输入设备码' }]}>
            <Input placeholder="设备码，例如 YXB-DEV-0002" />
          </Form.Item>
          <Form.Item name="mode" initialValue="sale">
            <Select
              style={{ width: 160 }}
              options={[
                { label: '销售模式', value: 'sale' },
                { label: '租赁模式', value: 'rental' },
              ]}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={binding}>
            绑定当前学员
          </Button>
        </Form>
      </Card>
    </Space>
  );
}
