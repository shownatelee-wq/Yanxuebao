'use client';

import { BellOutlined, MessageOutlined, NotificationOutlined } from '@ant-design/icons';
import { Badge, Button, Empty, Segmented, Space, Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { demoMessages, type DemoMessage } from '../../../lib/device-demo-data';

const { Paragraph } = Typography;

export default function DeviceMessagesPage() {
  const [messages, setMessages] = useState<DemoMessage[]>(demoMessages);
  const [filter, setFilter] = useState<'all' | 'broadcast' | 'group' | 'family' | 'system' | 'subscription'>('all');
  const [messageApi, contextHolder] = message.useMessage();

  const filteredMessages = useMemo(() => {
    if (filter === 'all') {
      return messages;
    }
    return messages.filter((item) => item.type === filter);
  }, [filter, messages]);

  const unreadCount = useMemo(() => messages.filter((item) => !item.read).length, [messages]);

  return (
    <div className="device-page-stack">
      {contextHolder}

      <div className="watch-app-view">
      <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space>
            <Badge count={unreadCount} size="small">
              <BellOutlined style={{ fontSize: 16 }} />
            </Badge>
            <Tag color="blue">消息</Tag>
          </Space>
          <p className="device-page-title">消息</p>
          <div className="watch-status-pills">
            <span className="watch-status-pill">未读 {unreadCount}</span>
            <span className="watch-status-pill">广播 / 群聊 / 家庭</span>
          </div>
        </Space>
      </div>

      <div className="watch-segment-wrap">
        <Segmented
          block
          value={filter}
          onChange={(value) => setFilter(value as 'all' | 'broadcast' | 'group' | 'family' | 'system' | 'subscription')}
          options={[
            { label: '全部', value: 'all' },
            { label: '广播', value: 'broadcast' },
            { label: '群聊', value: 'group' },
            { label: '家庭', value: 'family' },
            { label: '系统', value: 'system' },
            { label: '订阅', value: 'subscription' },
          ]}
        />
      </div>

      <div className="watch-list-panel">
        {filteredMessages.length === 0 ? (
          <Empty description="暂时没有消息" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <div className="device-mini-list">
            {filteredMessages.map((item) => (
              <Link key={item.id} href={`/messages/${item.id}`} className="device-card-link">
                <div className={`device-message-card watch-list-card${item.read ? '' : ' unread'}`}>
                  <div className="device-mini-item-title">
                    <Space size={6}>
                      {item.type === 'broadcast' || item.type === 'subscription' ? <NotificationOutlined /> : <MessageOutlined />}
                      <span>{item.title}</span>
                    </Space>
                    {!item.read ? <Tag color="red">未读</Tag> : null}
                  </div>
                  <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
                    {item.content}
                  </Paragraph>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="watch-bottom-dock">
        <div className="device-action-row">
            <Button
              type="primary"
              block
              onClick={() => {
                setMessages((items) => items.map((item) => ({ ...item, read: true })));
                messageApi.success('已全部标为已读');
              }}
            >
              全部已读
            </Button>
            <Link href="/team">
              <Button block>看团队</Button>
            </Link>
      </div>
      </div>
      </div>
    </div>
  );
}
