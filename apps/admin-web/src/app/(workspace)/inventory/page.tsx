'use client';

import { Card, Empty, Space, Statistic, Table, Tag, Typography, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../../lib/api';

type InventoryItem = {
  id: string;
  label: string;
  category: string;
  quantity: number;
  status: string;
};

const { Title } = Typography;

export default function InventoryPage() {
  const [records, setRecords] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    setLoading(true);
    apiFetch<InventoryItem[]>('/admin/inventory')
      .then(setRecords)
      .catch((error) => {
        messageApi.error(error instanceof Error ? error.message : '加载库存失败');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const totals = useMemo(() => records.reduce((sum, item) => sum + item.quantity, 0), [records]);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {contextHolder}
      <Title level={3} style={{ margin: 0 }}>
        库存管理
      </Title>
      <Card>
        <Statistic title="设备总量" value={totals} />
      </Card>
      <Card title="库存列表">
        {records.length > 0 ? (
          <Table
            rowKey="id"
            loading={loading}
            dataSource={records}
            columns={[
              { title: '名称', dataIndex: 'label' },
              { title: '分类', dataIndex: 'category' },
              { title: '数量', dataIndex: 'quantity' },
              {
                title: '状态',
                dataIndex: 'status',
                render: (value: string) => <Tag color="cyan">{value}</Tag>,
              },
            ]}
          />
        ) : (
          <Empty description="暂无库存数据" />
        )}
      </Card>
    </Space>
  );
}
