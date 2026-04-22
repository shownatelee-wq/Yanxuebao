'use client';

import { Button, Result, Segmented, Tag, message } from 'antd';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { appendGroupChatMessage, appendMicrochatMessage, useDeviceSocialSnapshot } from '../../../../../lib/device-social-state';
import { getMeetingById } from '../../../../../lib/device-workspace-state';
import { WatchHero, WatchSection } from '../../../../../lib/watch-ui';

export default function DeviceMeetingSharePage() {
  const params = useParams<{ meetingId: string }>();
  const router = useRouter();
  const meeting = getMeetingById(params.meetingId);
  const { microchatThreads, groupChats } = useDeviceSocialSnapshot();
  const [scope, setScope] = useState<'微聊' | '群聊'>('微聊');
  const [messageApi, contextHolder] = message.useMessage();

  if (!meeting) {
    return <Result status="404" title="未找到会议" extra={<Link href="/meeting"><Button>返回会议</Button></Link>} />;
  }

  const safeMeeting = meeting;

  function shareTo(targetId: string) {
    const payload = {
      type: 'meeting_summary' as const,
      content: safeMeeting.shareLink,
      cardTitle: '会议链接卡片',
      cardSummary: `${safeMeeting.title} · ${safeMeeting.shareLink}`,
      path: `/meeting/${safeMeeting.id}`,
      author: '我',
      self: true,
    };

    if (scope === '微聊') {
      appendMicrochatMessage(targetId, payload);
    } else {
      appendGroupChatMessage(targetId, payload);
    }
    messageApi.success(`已分享到${scope}`);
    window.setTimeout(() => router.push(`/meeting/${safeMeeting.id}?shared=1`), 500);
  }

  const targets = scope === '微聊' ? microchatThreads : groupChats;

  return (
    <div className="device-page-stack">
      {contextHolder}
      <WatchHero title="分享会议" subtitle="选择一个会话，发送会议链接卡片。" />
      <WatchSection title="分享给">
        <Segmented
          block
          value={scope}
          onChange={(value) => setScope(value as '微聊' | '群聊')}
          options={['微聊', '群聊']}
        />
        <div className="device-mini-list" style={{ marginTop: 12 }}>
          {targets.map((target) => (
            <button key={target.id} type="button" className="device-select-card" onClick={() => shareTo(target.id)}>
              <strong>{target.title}</strong>
              <span>{'lastMessage' in target ? target.lastMessage : `${target.members.length} 人 · ${target.badge}`}</span>
              <Tag color="blue">发送会议卡</Tag>
            </button>
          ))}
        </div>
      </WatchSection>
      <div className="device-action-row">
        <Link href={`/meeting/${safeMeeting.id}`}>
          <Button block>返回会议</Button>
        </Link>
      </div>
    </div>
  );
}
