'use client';

import { ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Empty, Select, Space, Table, Tag, Typography, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../../lib/api';

type Student = { id: string; name: string };
type AiRecord = { id: string; scene: string; title: string; summary: string; createdAt: string };
type MessageRecord = { id: string; type: string; title: string; content: string; createdAt: string };

const { Title, Paragraph } = Typography;

export default function ParentAiRecordsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>();
  const [aiRecords, setAiRecords] = useState<AiRecord[]>([]);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const selectedStudent = useMemo(
    () => students.find((item) => item.id === selectedStudentId) ?? students[0],
    [selectedStudentId, students],
  );

  useEffect(() => {
    setLoadingStudents(true);
    apiFetch<Student[]>('/students')
      .then((list) => {
        setStudents(list);
        if (list[0]) {
          setSelectedStudentId(list[0].id);
        }
      })
      .catch((error) => {
        messageApi.error(error instanceof Error ? error.message : '加载学员失败');
      })
      .finally(() => {
        setLoadingStudents(false);
      });
  }, []);

  async function loadAiRecords(studentId: string) {
    setLoadingRecords(true);
    try {
      const [recordList, messageList] = await Promise.all([
        apiFetch<AiRecord[]>(`/messages/ai-records?studentId=${studentId}`),
        apiFetch<MessageRecord[]>('/messages'),
      ]);
      setAiRecords(recordList);
      setMessages(messageList);
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '加载 AI 记录失败');
    } finally {
      setLoadingRecords(false);
    }
  }

  useEffect(() => {
    if (!selectedStudentId) {
      return;
    }

    void loadAiRecords(selectedStudentId);
  }, [selectedStudentId]);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {contextHolder}
      <Title level={3} style={{ margin: 0 }}>
        AI 记录
      </Title>
      <Paragraph type="secondary" style={{ margin: 0 }}>
        聚合查看学员的 AI 问答、闪记与系统消息。
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
          <Button type="link" icon={<ReloadOutlined />} onClick={() => selectedStudentId && void loadAiRecords(selectedStudentId)}>
            刷新
          </Button>
        </Space>
      </Card>
      <Card title="AI 交互记录" loading={loadingRecords}>
        {aiRecords.length > 0 ? (
          <Table
            rowKey="id"
            dataSource={aiRecords}
            pagination={false}
            columns={[
              { title: '场景', dataIndex: 'scene', render: (value: string) => <Tag color="purple">{value}</Tag> },
              { title: '标题', dataIndex: 'title' },
              { title: '摘要', dataIndex: 'summary' },
              { title: '时间', dataIndex: 'createdAt' },
            ]}
          />
        ) : (
          <Empty description="暂无 AI 记录" />
        )}
      </Card>
      <Card title="系统消息" loading={loadingRecords}>
        {messages.length > 0 ? (
          <Table
            rowKey="id"
            dataSource={messages}
            pagination={false}
            columns={[
              { title: '类型', dataIndex: 'type', render: (value: string) => <Tag>{value}</Tag> },
              { title: '标题', dataIndex: 'title' },
              { title: '内容', dataIndex: 'content' },
              { title: '时间', dataIndex: 'createdAt' },
            ]}
          />
        ) : (
          <Empty description="暂无系统消息" />
        )}
      </Card>
    </Space>
  );
}
