'use client';

import { Card, Empty, Space, Table, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';

type QuestionBankItem = {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  status: 'active' | 'draft';
};

const { Title } = Typography;

export default function QuestionBankPage() {
  const [records, setRecords] = useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    setLoading(true);
    apiFetch<QuestionBankItem[]>('/admin/question-bank')
      .then(setRecords)
      .catch((error) => {
        messageApi.error(error instanceof Error ? error.message : '加载题库失败');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {contextHolder}
      <Title level={3} style={{ margin: 0 }}>
        能力题库
      </Title>
      <Card title="题库列表">
        {records.length > 0 ? (
          <Table
            rowKey="id"
            loading={loading}
            dataSource={records}
            columns={[
              { title: '题目', dataIndex: 'title' },
              { title: '分类', dataIndex: 'category' },
              { title: '难度', dataIndex: 'difficulty' },
              {
                title: '状态',
                dataIndex: 'status',
                render: (value: string) => <Tag color={value === 'active' ? 'green' : 'default'}>{value}</Tag>,
              },
            ]}
          />
        ) : (
          <Empty description="暂无能力题库数据" />
        )}
      </Card>
    </Space>
  );
}
