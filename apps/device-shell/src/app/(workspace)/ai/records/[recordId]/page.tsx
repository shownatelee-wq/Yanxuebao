'use client';

import { Button, Result, Space, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { demoAiRecords } from '../../../../../lib/device-demo-data';

const { Paragraph } = Typography;

export default function DeviceAiRecordDetailPage() {
  const params = useParams<{ recordId: string }>();
  const item = demoAiRecords.find((entry) => entry.id === params.recordId);

  if (!item) {
    return <Result status="404" title="未找到 AI 记录" extra={<Link href="/ai"><Button>回 AI 页</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space>
            <Tag color="purple">{item.scene}</Tag>
            <Tag color="blue">记录详情</Tag>
          </Space>
          <p className="device-page-title">{item.title}</p>
          <p className="device-page-subtle">{item.createdAt}</p>
        </Space>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">处理结果</p>
        <Paragraph style={{ margin: 0, fontSize: 12 }}>{item.summary}</Paragraph>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">相关操作</p>
        <p className="device-mini-item-desc" style={{ margin: 0 }}>
          AI 结果可整理到作品内容中，再同步到任务。
        </p>
      </div>

      <div className="device-action-row">
        <Link href="/tasks/new">
          <Button type="primary" block>填写作品</Button>
        </Link>
        <Link href="/ai">
          <Button block>回 AI 页</Button>
        </Link>
      </div>
    </div>
  );
}
