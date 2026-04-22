'use client';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Space, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useDeviceWorkspaceSnapshot } from '../../../lib/device-workspace-state';
import { WatchActionButtons } from '../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceMeetingPage() {
  const { meetings } = useDeviceWorkspaceSnapshot();

  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <p className="device-page-title">会议</p>
              <Link href="/meeting/new">
                <Button type="link" icon={<PlusOutlined />}>
                  创建
                </Button>
              </Link>
            </Space>
            <div className="watch-status-pills">
              <span className="watch-status-pill">{meetings.length} 场会议</span>
              <span className="watch-status-pill">
                {meetings.filter((meeting) => meeting.status === '进行中').length} 场进行中
              </span>
            </div>
          </Space>
        </div>
        <div className="watch-list-panel">
          <div className="device-mini-list">
            {meetings.map((meeting) => (
              <Link key={meeting.id} href={`/meeting/${meeting.id}`} className="device-card-link">
                <div className="device-mini-item watch-list-card">
                  <div className="device-mini-item-title">
                    <span>{meeting.title}</span>
                    <Space size={6}>
                      <Tag color={meeting.status === '进行中' ? 'green' : meeting.status === '待开始' ? 'blue' : 'default'}>
                        {meeting.status}
                      </Tag>
                    </Space>
                  </div>
                  <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
                    {meeting.startedAt} · {meeting.participants.join('、')}
                  </Paragraph>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="watch-bottom-dock">
          <WatchActionButtons primary={{ label: '创建会议', path: '/meeting/new' }} secondary={{ label: '群聊', path: '/group-chat' }} />
        </div>
      </div>
    </div>
  );
}
