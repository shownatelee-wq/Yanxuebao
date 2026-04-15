'use client';

import { Button, Card, Empty, Form, Select, Space, Table, Tag, Typography, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../../lib/api';

type Report = {
  id: string;
  studentId: string;
  title: string;
  status: string;
  publishedAt?: string;
};
type Student = { id: string; name: string };
type Team = { id: string; name: string };

const { Title } = Typography;

export default function ReportsPage() {
  const [form] = Form.useForm();
  const [records, setRecords] = useState<Report[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const defaultStudentId = useMemo(() => students[0]?.id, [students]);
  const defaultTeamId = useMemo(() => teams[0]?.id, [teams]);

  async function loadReports() {
    try {
      setLoading(true);
      const [data, studentData, teamData] = await Promise.all([
        apiFetch<Report[]>('/reports'),
        apiFetch<Student[]>('/students'),
        apiFetch<Team[]>('/teams'),
      ]);
      setRecords(data);
      setStudents(studentData);
      setTeams(teamData);
      form.setFieldsValue({
        studentId: studentData[0]?.id,
        teamId: teamData[0]?.id,
      });
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '加载报告失败');
    } finally {
      setLoading(false);
    }
  }

  async function generateReport(values: { studentId: string; teamId?: string }) {
    try {
      setSubmitting(true);
      await apiFetch('/reports/generate', {
        method: 'POST',
        body: JSON.stringify({
          studentId: values.studentId,
          teamId: values.teamId,
          title: '导师端即时生成报告',
        }),
      });
      messageApi.success('报告已生成');
      await loadReports();
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '生成报告失败');
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {contextHolder}
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Title level={3} style={{ margin: 0 }}>
          研学报告
        </Title>
      </Space>
      <Card title="生成报告">
        <Form form={form} layout="inline" onFinish={generateReport} initialValues={{ studentId: defaultStudentId, teamId: defaultTeamId }}>
          <Form.Item name="studentId" rules={[{ required: true, message: '请选择学员' }]}>
            <Select style={{ width: 220 }} placeholder="选择学员" options={students.map((student) => ({ label: student.name, value: student.id }))} />
          </Form.Item>
          <Form.Item name="teamId">
            <Select allowClear style={{ width: 220 }} placeholder="选择团队" options={teams.map((team) => ({ label: team.name, value: team.id }))} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            生成报告
          </Button>
        </Form>
      </Card>
      <Card title="报告列表">
        {records.length > 0 ? (
          <Table
            loading={loading}
            rowKey="id"
            dataSource={records}
            columns={[
              { title: '学员 ID', dataIndex: 'studentId' },
              { title: '报告标题', dataIndex: 'title' },
              { title: '状态', dataIndex: 'status', render: (value: string) => <Tag color="green">{value}</Tag> },
              { title: '发布时间', dataIndex: 'publishedAt', render: (value?: string) => value ?? '-' },
            ]}
          />
        ) : (
          <Empty description="暂无报告，先为学员生成一份报告" />
        )}
      </Card>
    </Space>
  );
}
