'use client';

import { Button, Input, Space, Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { useState } from 'react';
import { createMeeting } from '../../../../lib/device-workspace-state';
import { WatchActionButtons, WatchHero, WatchSection, WatchNextSteps } from '../../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceMeetingNewPage() {
  const [title, setTitle] = useState('海豚观察复盘会');
  const [participants, setParticipants] = useState('王导师、陈同学、妈妈');
  const [createdPath, setCreatedPath] = useState('');
  const [createdMeetingId, setCreatedMeetingId] = useState('');
  const [messageApi, contextHolder] = message.useMessage();

  function submit() {
    const meeting = createMeeting({
      title,
      participants: participants.split('、').filter(Boolean),
    });
    setCreatedPath(`/meeting/${meeting.id}`);
    setCreatedMeetingId(meeting.id);
    messageApi.success('会议已创建，分享链接已生成');
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <WatchHero title="创建会议" subtitle="创建会议并生成可分享的会议链接。" />
      <WatchSection title="会议信息">
        <Space direction="vertical" size={10} style={{ width: '100%' }}>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="会议主题" />
          <Input value={participants} onChange={(event) => setParticipants(event.target.value)} placeholder="参会人，用顿号分隔" />
          <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
            演示中不会真实发起音视频，只展示创建和分享链路。
          </Paragraph>
          <Button type="primary" block onClick={submit}>
            创建并生成链接
          </Button>
          {createdPath ? (
            <div className="device-action-row">
              <Link href={`/meeting/${createdMeetingId}/share`}>
                <Button type="primary" block>分享</Button>
              </Link>
              <Link href={createdPath}>
                <Button block>查看会议详情</Button>
              </Link>
            </div>
          ) : null}
        </Space>
      </WatchSection>
      <WatchSection title="分享方式">
        <div className="watch-status-pills">
          <span className="watch-status-pill">微聊</span>
          <span className="watch-status-pill">群聊</span>
          <span className="watch-status-pill">朋友圈邀请卡</span>
        </div>
        <Tag color="blue" style={{ marginTop: 8 }}>创建成功后可在会议详情中复制/转发链接</Tag>
      </WatchSection>
      <WatchNextSteps text="会议结束后可生成纪要，并分享到微聊或上传网盘。" />
      <WatchActionButtons primary={{ label: '会议', path: '/meeting' }} secondary={{ label: '微聊', path: '/microchat' }} />
    </div>
  );
}
