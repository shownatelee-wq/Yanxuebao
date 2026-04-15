'use client';

import { Button, Card, Empty, Input, InputNumber, Modal, Space, Table, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';

type Score = {
  id: string;
  taskTitle?: string;
  studentName?: string;
  status: string;
  aiScore?: number;
  tutorScore?: number;
};

const { Title } = Typography;

export default function ScoresPage() {
  const [records, setRecords] = useState<Score[]>([]);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [scoreValue, setScoreValue] = useState<number>(8.5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  async function loadScores() {
    try {
      setLoading(true);
      const data = await apiFetch<Score[]>('/scores');
      setRecords(data);
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '加载评分列表失败');
    } finally {
      setLoading(false);
    }
  }

  async function confirmScore() {
    if (!confirmingId) {
      return;
    }

    try {
      setSubmitting(true);
      await apiFetch('/scores/confirm', {
        method: 'POST',
        body: JSON.stringify({ scoreId: confirmingId, tutorScore: scoreValue, comment }),
      });
      setConfirmingId(null);
      setComment('');
      messageApi.success('评分已确认');
      await loadScores();
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '确认评分失败');
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    loadScores();
  }, []);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {contextHolder}
      <Title level={3} style={{ margin: 0 }}>
        评分确认
      </Title>
      <Card title="作品评分列表" loading={loading}>
        {records.length > 0 ? (
          <Table
            rowKey="id"
            dataSource={records}
            columns={[
              { title: '任务', dataIndex: 'taskTitle', render: (value?: string) => value ?? '-' },
              { title: '学员', dataIndex: 'studentName', render: (value?: string) => value ?? '-' },
              { title: 'AI 分', dataIndex: 'aiScore', render: (value?: number) => value ?? '-' },
              { title: '导师分', dataIndex: 'tutorScore', render: (value?: number) => value ?? '-' },
              { title: '状态', dataIndex: 'status', render: (value: string) => <Tag color="gold">{value}</Tag> },
              {
                title: '操作',
                render: (_value: unknown, record: Score) => (
                  <Button type="link" onClick={() => setConfirmingId(record.id)}>
                    确认评分
                  </Button>
                ),
              },
            ]}
          />
        ) : (
          <Empty description="暂无待确认评分记录" />
        )}
      </Card>
      <Modal
        open={Boolean(confirmingId)}
        title="确认导师评分"
        onCancel={() => setConfirmingId(null)}
        onOk={confirmScore}
        confirmLoading={submitting}
      >
        <Space direction="vertical">
          <div>请输入导师评分（0 - 10）</div>
          <InputNumber min={0} max={10} step={0.5} value={scoreValue} onChange={(value) => setScoreValue(value ?? 0)} />
          <Input.TextArea rows={3} placeholder="填写导师评语（选填）" value={comment} onChange={(event) => setComment(event.target.value)} />
        </Space>
      </Modal>
    </Space>
  );
}
