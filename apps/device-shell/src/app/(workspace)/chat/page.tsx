'use client';

import { Button, Space, Tag, Typography } from 'antd';
import Link from 'next/link';
import { demoGroupChats, demoMicrochatThreads } from '../../../lib/device-demo-data';

const { Paragraph } = Typography;

export default function DeviceChatPage() {
  const totalUnread =
    demoMicrochatThreads.reduce((sum, thread) => sum + (thread.unread ?? 0), 0) +
    demoGroupChats.reduce((sum, chat) => sum + (chat.unread ?? 0), 0);

  const recentThreads = [
    ...demoMicrochatThreads.map((thread) => ({
      id: thread.id,
      title: thread.title,
      unread: thread.unread,
      subtitle: thread.lastMessage,
      path: `/microchat/${thread.id}`,
      tag: '微聊',
    })),
    ...demoGroupChats.map((chat) => ({
      id: chat.id,
      title: chat.title,
      unread: chat.unread,
      subtitle: chat.messages[chat.messages.length - 1]?.content ?? '暂无消息',
      path: `/group-chat/${chat.id}`,
      tag: '群聊',
    })),
  ].slice(0, 4);

  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <p className="device-page-title">聊天</p>
          <div className="watch-status-pills">
            <span className="watch-status-pill">{demoMicrochatThreads.length} 个微聊</span>
            <span className="watch-status-pill">{demoGroupChats.length} 个群聊</span>
            <span className="watch-status-pill">{totalUnread} 条未读</span>
          </div>
        </div>

        <div className="watch-grid-panel long-grid">
          <div className="watch-inline-head">
            <span>聊天入口</span>
            <span>一对一 / 小组群</span>
          </div>
          <div className="device-plaza-grid">
            <Link href="/microchat" className="device-plaza-tile">
              <strong style={{ fontSize: 12 }}>微聊</strong>
              <span className="device-mini-item-desc">一对一聊天</span>
            </Link>
            <Link href="/group-chat" className="device-plaza-tile">
              <strong style={{ fontSize: 12 }}>群聊</strong>
              <span className="device-mini-item-desc">班级群和小组群</span>
            </Link>
          </div>
        </div>

        <div className="watch-list-panel long-list">
          <div className="watch-inline-head">
            <span>最近会话</span>
            <span>{recentThreads.length} 个会话</span>
          </div>
          <div className="device-mini-list">
            {recentThreads.map((thread) => (
              <Link key={thread.id} href={thread.path} className="device-card-link">
                <div className="device-mini-item watch-list-card">
                  <div className="device-mini-item-title">
                    <span>{thread.title}</span>
                    <Space size={6}>
                      <Tag color="blue">{thread.tag}</Tag>
                      {thread.unread ? <Tag color="red">{thread.unread}</Tag> : null}
                    </Space>
                  </div>
                  <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
                    {thread.subtitle}
                  </Paragraph>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="watch-bottom-dock">
          <div className="device-action-row">
            <Link href="/microchat">
              <Button type="primary" block>
                微聊
              </Button>
            </Link>
            <Link href="/group-chat">
              <Button block>群聊</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
