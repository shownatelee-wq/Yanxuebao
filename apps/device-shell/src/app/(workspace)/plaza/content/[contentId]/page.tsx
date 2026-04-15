'use client';

import { Button, Result, Space, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { demoPlazaContent } from '../../../../../lib/device-demo-data';

const { Paragraph } = Typography;

export default function DevicePlazaContentDetailPage() {
  const params = useParams<{ contentId: string }>();
  const item = demoPlazaContent.find((entry) => entry.id === params.contentId);

  if (!item) {
    return <Result status="404" title="未找到内容" extra={<Link href="/plaza"><Button>广场</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <p className="device-page-title">{item.title}</p>
            <div className="watch-status-pills">
              <span className="watch-status-pill">{item.tag}</span>
              <span className="watch-status-pill">快速入口</span>
            </div>
          </Space>
        </div>

        <div className="watch-list-panel">
          <div className="watch-inline-head">
            <span>内容详情</span>
            <span>{item.tag}</span>
          </div>
          <div className="device-mini-list">
            <div className="device-mini-item watch-list-card">
              <div className="device-mini-item-title">
                <span>内容信息</span>
                <Tag color="blue">{item.tag}</Tag>
              </div>
              <Paragraph style={{ margin: 0, fontSize: 12 }}>{item.summary}</Paragraph>
            </div>
            <div className="device-mini-item watch-list-card">
              <div className="device-mini-item-title">
                <span>关联入口</span>
              </div>
              <p className="device-mini-item-desc">
                {item.tag === '课程'
                  ? '课程内容会同步到智能体的专家课程与课程中心。'
                  : item.tag === '资讯'
                    ? '资讯内容会同步到智能体订阅、资讯播报和消息提醒里。'
                    : '会同步到 AI 最近使用记录。'}
              </p>
            </div>
          </div>
        </div>

        <div className="watch-bottom-dock">
          <div className="device-action-row">
            <Link href={item.tag === '课程' ? '/plaza/agents/plaza_agent_03/courses' : item.tag === '资讯' ? '/plaza/agents/plaza_agent_03/news' : '/plaza'}>
              <Button type="primary" block>{item.tag === '课程' ? '打开课程' : item.tag === '资讯' ? '查看资讯' : '打开智能体'}</Button>
            </Link>
            <Link href="/plaza">
              <Button block>广场</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
