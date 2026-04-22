'use client';

import { AudioOutlined, MutedOutlined, PhoneOutlined, UserAddOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Button, Result, Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { getMeetingById } from '../../../../../lib/device-workspace-state';

const { Paragraph } = Typography;

export default function DeviceMeetingTalkPage() {
  const params = useParams<{ meetingId: string }>();
  const [messageApi, contextHolder] = message.useMessage();
  const [muted, setMuted] = useState(false);
  const meeting = getMeetingById(params.meetingId);

  if (!meeting) {
    return <Result status="404" title="未找到会议" extra={<Link href="/meeting"><Button>返回会议</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="device-meeting-room">
        <div className="device-meeting-room-head">
          <div>
            <Tag color="green">会议中</Tag>
            <p className="device-page-title">{meeting.title}</p>
          </div>
          <Link href={`/meeting/${meeting.id}/share`}>
            <Button shape="circle" icon={<UserAddOutlined />} aria-label="分享邀请好友加入会议" />
          </Link>
        </div>

        <div className="device-meeting-grid">
          {meeting.participants.map((participant, index) => (
            <div key={participant} className={`device-meeting-participant ${index === 0 ? 'speaking' : ''}`}>
              <div className={`device-meeting-avatar tone-${index % 6}`}>{participant.slice(0, 1)}</div>
              <strong>{participant}</strong>
              <span>{index === 0 ? '正在发言' : index === 1 ? '摄像头开启' : '已加入'}</span>
            </div>
          ))}
          <Link href={`/meeting/${meeting.id}/share`} className="device-meeting-participant invite">
            <UserAddOutlined />
            <strong>邀请好友</strong>
            <span>分享会议链接</span>
          </Link>
        </div>

        <div className="device-meeting-caption">
          <VideoCameraOutlined />
          <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
            AI 正在记录会议重点，结束后会生成本地 mock 纪要。
          </Paragraph>
        </div>

        <div className="device-meeting-controls">
          <Button
            shape="circle"
            icon={muted ? <MutedOutlined /> : <AudioOutlined />}
            onClick={() => {
              setMuted((value) => !value);
              messageApi.success(muted ? '已打开麦克风' : '已静音');
            }}
          />
          <Link href={`/meeting/${meeting.id}`}>
            <Button danger shape="circle" icon={<PhoneOutlined />} aria-label="离开会议" />
          </Link>
          <Link href={`/meeting/${meeting.id}/share`}>
            <Button type="primary" shape="circle" icon={<UserAddOutlined />} aria-label="邀请好友" />
          </Link>
        </div>
      </div>
    </div>
  );
}
