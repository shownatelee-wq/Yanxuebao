'use client';

import { Space, Tag, Typography } from 'antd';
import Link from 'next/link';
import { demoMicrochatThreads } from '../../../lib/device-demo-data';
import { WatchActionButtons } from '../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceMicrochatPage() {
  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <p className="device-page-title">微聊</p>
            <div className="watch-status-pills">
              <span className="watch-status-pill">{demoMicrochatThreads.length} 个会话</span>
              <span className="watch-status-pill">
                {demoMicrochatThreads.reduce((sum, thread) => sum + (thread.unread ?? 0), 0)} 条未读
              </span>
            </div>
          </Space>
        </div>
        <div className="watch-list-panel">
          <div className="device-mini-list">
            {demoMicrochatThreads.map((thread) => (
              <Link key={thread.id} href={`/microchat/${thread.id}`} className="device-card-link">
                <div className="device-mini-item watch-list-card">
                  <div className="device-mini-item-title">
                    <span>{thread.title}</span>
                    <Space size={6}>
                      <Tag color="blue">微聊</Tag>
                      {thread.unread ? <Tag color="red">{thread.unread}</Tag> : null}
                    </Space>
                  </div>
                  <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
                    {thread.lastMessage}
                  </Paragraph>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="watch-bottom-dock">
          <WatchActionButtons primary={{ label: '好友', path: '/friends' }} secondary={{ label: '群聊', path: '/group-chat' }} />
        </div>
      </div>
    </div>
  );
}
