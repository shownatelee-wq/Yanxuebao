'use client';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Space, Tag, Typography } from 'antd';
import Link from 'next/link';
import { demoMoments } from '../../../lib/device-demo-data';
import { WatchActionButtons } from '../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceMomentsPage() {
  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <p className="device-page-title">朋友圈</p>
              <Link href="/moments/new">
                <Button type="link" icon={<PlusOutlined />}>
                  发布
                </Button>
              </Link>
            </Space>
            <div className="watch-status-pills">
              <span className="watch-status-pill">{demoMoments.length} 条动态</span>
              <span className="watch-status-pill">看同学和家人动态</span>
            </div>
          </Space>
        </div>
        <div className="watch-list-panel">
          <div className="device-mini-list">
            {demoMoments.map((item) => (
              <Link key={item.id} href={`/moments/${item.id}`} className="device-card-link">
                <div className="device-mini-item watch-list-card">
                  <div className="device-mini-item-title">
                    <span>{item.author}</span>
                    <Tag color="blue">{item.createdAt}</Tag>
                  </div>
                  <Paragraph style={{ margin: 0, fontSize: 12 }}>{item.content}</Paragraph>
                  <Paragraph type="secondary" style={{ margin: '6px 0 0', fontSize: 11 }}>
                    点赞 {item.likes} · 评论 {item.comments}
                  </Paragraph>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="watch-bottom-dock">
          <WatchActionButtons primary={{ label: '发朋友圈', path: '/moments/new' }} secondary={{ label: '广场', path: '/plaza' }} />
        </div>
      </div>
    </div>
  );
}
