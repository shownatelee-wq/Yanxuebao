'use client';

import { Button, Result, Typography } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { demoMeetings } from '../../../../../lib/device-demo-data';
import { WatchHero, WatchSection, WatchActionButtons, WatchNextSteps } from '../../../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceMeetingSummaryPage() {
  const params = useParams<{ meetingId: string }>();
  const meeting = demoMeetings.find((item) => item.id === params.meetingId);

  if (!meeting) {
    return <Result status="404" title="未找到纪要" extra={<Link href="/meeting"><Button>返回会议</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <WatchHero title="会议纪要" subtitle={meeting.title} />
      <WatchSection title="AI 总结">
        <Paragraph style={{ margin: 0, fontSize: 12 }}>{meeting.summary}</Paragraph>
      </WatchSection>
      <WatchNextSteps text="纪要内容可同步到任务或群聊。" />
      <WatchActionButtons primary={{ label: '任务', path: '/tasks' }} secondary={{ label: '会议', path: `/meeting/${meeting.id}` }} />
    </div>
  );
}
