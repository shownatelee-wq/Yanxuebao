'use client';

import { Button, Result, Space, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { demoKnowledge } from '../../../../../lib/device-demo-data';

const { Paragraph } = Typography;

export default function DeviceAiKnowledgeDetailPage() {
  const params = useParams<{ knowledgeId: string }>();
  const item = demoKnowledge.find((entry) => entry.id === params.knowledgeId);

  if (!item) {
    return <Result status="404" title="未找到知识卡" extra={<Link href="/ai"><Button>回 AI 页</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space>
            <Tag color="blue">知识卡</Tag>
            <Tag color="green">{item.category}</Tag>
          </Space>
          <p className="device-page-title">{item.title}</p>
          <p className="device-page-subtle">已可加入专家伴学和任务链路。</p>
        </Space>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">卡片内容</p>
        <Paragraph style={{ margin: 0, fontSize: 12 }}>{item.content}</Paragraph>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">相关操作</p>
        <p className="device-mini-item-desc" style={{ margin: 0 }}>
          可结合专家伴学补充细节，或回 AI 页查看其他知识卡和记录。
        </p>
      </div>

      <div className="device-action-row">
        <Link href="/ask?agentId=plaza_agent_03">
          <Button type="primary" block>专家伴学</Button>
        </Link>
        <Link href="/ai">
          <Button block>回 AI 页</Button>
        </Link>
      </div>
    </div>
  );
}
