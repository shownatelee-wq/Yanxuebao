'use client';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Space, Tag, Typography } from 'antd';
import Link from 'next/link';
import { demoMeetings } from '../../../lib/device-demo-data';
import { WatchActionButtons } from '../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceMeetingPage() {
  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <p className="device-page-title">会议</p>
              <Button type="link" icon={<PlusOutlined />}>
                发起
              </Button>
            </Space>
            <div className="watch-status-pills">
              <span className="watch-status-pill">{demoMeetings.length} 场会议</span>
              <span className="watch-status-pill">
                {demoMeetings.filter((meeting) => meeting.status === '进行中').length} 场进行中
              </span>
            </div>
          </Space>
        </div>
        <div className="watch-list-panel">
          <div className="device-mini-list">
            {demoMeetings.map((meeting) => (
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
          <WatchActionButtons primary={{ label: '群聊', path: '/group-chat' }} secondary={{ label: '广场', path: '/plaza' }} />
        </div>
      </div>
    </div>
  );
}
