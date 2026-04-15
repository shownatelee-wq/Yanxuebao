'use client';

import { ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Col, Empty, Row, Select, Space, Statistic, Table, Tag, Typography, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../../lib/api';

type Student = { id: string; name: string };
type GrowthRecord = { id: string; type: string; title: string; value: number; occurredAt: string };
type Report = { id: string; title: string; status: string; publishedAt?: string };
type CapabilityRecord = { id: string; elementKey: string; score: number; source: string; recordedAt: string };

const { Title, Paragraph } = Typography;

export default function ParentGrowthPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>();
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [capability, setCapability] = useState<CapabilityRecord[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingGrowth, setLoadingGrowth] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const selectedStudent = useMemo(
    () => students.find((item) => item.id === selectedStudentId) ?? students[0],
    [selectedStudentId, students],
  );

  async function loadStudents() {
    setLoadingStudents(true);
    try {
      const list = await apiFetch<Student[]>('/students');
      setStudents(list);
      if (!selectedStudentId && list[0]) {
        setSelectedStudentId(list[0].id);
      }
    } finally {
      setLoadingStudents(false);
    }
  }

  async function loadGrowth(studentId: string) {
    try {
      setLoadingGrowth(true);
      const [growth, capabilityIndex, reportList] = await Promise.all([
        apiFetch<{ records: GrowthRecord[]; reports: Report[] }>(`/growth/${studentId}/records`),
        apiFetch<CapabilityRecord[]>(`/growth/${studentId}/capability-index`),
        apiFetch<Report[]>(`/reports?studentId=${studentId}`),
      ]);
      setGrowthRecords(growth.records);
      setReports(reportList);
      setCapability(capabilityIndex);
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '加载成长记录失败');
    } finally {
      setLoadingGrowth(false);
    }
  }

  useEffect(() => {
    loadStudents().catch((error) => {
      messageApi.error(error instanceof Error ? error.message : '加载学员失败');
    });
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      void loadGrowth(selectedStudentId);
    }
  }, [selectedStudentId]);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {contextHolder}
      <Title level={3} style={{ margin: 0 }}>
        能力成长
      </Title>
      <Paragraph type="secondary" style={{ margin: 0 }}>
        查看能力指数、成长值沉淀和研学报告。
      </Paragraph>
      <Card>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Select
            style={{ width: 320 }}
            loading={loadingStudents}
            placeholder="请选择学员"
            value={selectedStudent?.id}
            onChange={setSelectedStudentId}
            options={students.map((student) => ({ label: student.name, value: student.id }))}
          />
          <Button type="link" icon={<ReloadOutlined />} onClick={() => selectedStudentId && void loadGrowth(selectedStudentId)}>
            刷新
          </Button>
        </Space>
      </Card>
      {!selectedStudent ? (
        <Empty description="暂无学员数据" />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card>
                <Statistic
                  title="能力指数均值"
                  value={
                    capability.length > 0
                      ? Number((capability.reduce((sum, item) => sum + item.score, 0) / capability.length).toFixed(1))
                      : 0
                  }
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Statistic title="成长记录数" value={growthRecords.length} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Statistic title="报告数" value={reports.length} />
              </Card>
            </Col>
          </Row>
          <Card title="能力指数" loading={loadingGrowth}>
            {capability.length > 0 ? (
              <Table
                rowKey="id"
                dataSource={capability}
                pagination={false}
                columns={[
                  { title: '能力元素', dataIndex: 'elementKey' },
                  { title: '得分', dataIndex: 'score' },
                  { title: '来源', dataIndex: 'source', render: (value: string) => <Tag color="blue">{value}</Tag> },
                  { title: '记录时间', dataIndex: 'recordedAt' },
                ]}
              />
            ) : (
              <Empty description="暂无能力指数记录" />
            )}
          </Card>
          <Card title="成长记录" loading={loadingGrowth}>
            {growthRecords.length > 0 ? (
              <Table
                rowKey="id"
                dataSource={growthRecords}
                pagination={false}
                columns={[
                  { title: '类型', dataIndex: 'type', render: (value: string) => <Tag>{value}</Tag> },
                  { title: '标题', dataIndex: 'title' },
                  { title: '数值', dataIndex: 'value' },
                  { title: '发生时间', dataIndex: 'occurredAt' },
                ]}
              />
            ) : (
              <Empty description="暂无成长记录" />
            )}
          </Card>
          <Card title="研学报告" loading={loadingGrowth}>
            {reports.length > 0 ? (
              <Table
                rowKey="id"
                dataSource={reports}
                pagination={false}
                columns={[
                  { title: '报告标题', dataIndex: 'title' },
                  { title: '状态', dataIndex: 'status', render: (value: string) => <Tag color="green">{value}</Tag> },
                  { title: '发布时间', dataIndex: 'publishedAt', render: (value?: string) => value ?? '-' },
                ]}
              />
            ) : (
              <Empty description="暂无研学报告" />
            )}
          </Card>
        </>
      )}
    </Space>
  );
}
