'use client';

import { Button, Result, Typography, message } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { appendMicrochatMessage } from '../../../../../lib/device-social-state';
import { getMeetingById, uploadMeetingSummaryToCloud } from '../../../../../lib/device-workspace-state';
import { WatchHero, WatchSection, WatchActionButtons, WatchNextSteps } from '../../../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceMeetingSummaryPage() {
  const params = useParams<{ meetingId: string }>();
  const [messageApi, contextHolder] = message.useMessage();
  const meeting = getMeetingById(params.meetingId);

  if (!meeting) {
    return <Result status="404" title="未找到纪要" extra={<Link href="/meeting"><Button>返回会议</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <WatchHero title="会议纪要" subtitle={meeting.title} />
      <WatchSection title="AI 总结">
        <Paragraph style={{ margin: 0, fontSize: 12 }}>{meeting.summary}</Paragraph>
        <div className="device-action-row" style={{ marginTop: 10 }}>
          <Button
            type="primary"
            block
            onClick={() =>
              {
                appendMicrochatMessage('microchat_01', {
                  author: '我',
                  self: true,
                  type: 'meeting_summary',
                  content: '已分享会议纪要',
                  cardTitle: '会议纪要卡',
                  cardSummary: meeting.title,
                  path: `/meeting/${meeting.id}/summary`,
                });
                messageApi.success('已分享到妈妈的微聊');
              }
            }
          >
            分享到微聊
          </Button>
          <Button block onClick={() => {
            uploadMeetingSummaryToCloud(meeting.id);
            messageApi.success('已上传到网盘');
          }}>上传到网盘</Button>
        </div>
      </WatchSection>
      <WatchNextSteps text="纪要内容可同步到任务或群聊。" />
      <WatchActionButtons primary={{ label: '任务', path: '/tasks' }} secondary={{ label: '会议', path: `/meeting/${meeting.id}` }} />
    </div>
  );
}
