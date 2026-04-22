'use client';

import { Button, Result, Space, Tag } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getMeetingById } from '../../../../lib/device-workspace-state';
import { WatchActionButtons, WatchInfoRow } from '../../../../lib/watch-ui';

export default function DeviceMeetingDetailPage() {
  const params = useParams<{ meetingId: string }>();
  const meeting = getMeetingById(params.meetingId);

  if (!meeting) {
    return <Result status="404" title="未找到会议" extra={<Link href="/meeting"><Button>返回会议</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
      <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Tag color={meeting.status === '进行中' ? 'green' : meeting.status === '待开始' ? 'blue' : 'default'}>
            {meeting.status}
          </Tag>
          <p className="device-page-title">{meeting.title}</p>
          <div className="watch-status-pills">
            <span className="watch-status-pill">{meeting.startedAt} 开始</span>
            <span className="watch-status-pill">{meeting.participants.length} 人</span>
          </div>
        </Space>
      </div>

      <div className="watch-list-panel">
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <WatchInfoRow label="参会成员" value={meeting.participants.join('、')} />
          <WatchInfoRow label="AI 纪要" value={meeting.summary} />
          <WatchInfoRow label="分享链接" value={meeting.shareLink} />
        </Space>
      </div>
      <div className="watch-bottom-dock">
        <WatchActionButtons primary={{ label: '进入会议', path: `/meeting/${meeting.id}/talk` }} secondary={{ label: '纪要', path: `/meeting/${meeting.id}/summary` }} />
      </div>
      </div>
    </div>
  );
}
