'use client';

import { AudioOutlined } from '@ant-design/icons';
import { Button, Result, Space, Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { demoMeetings } from '../../../../../lib/device-demo-data';
import { WatchSection, WatchActionButtons, WatchNextSteps } from '../../../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceMeetingTalkPage() {
  const params = useParams<{ meetingId: string }>();
  const [messageApi, contextHolder] = message.useMessage();
  const meeting = demoMeetings.find((item) => item.id === params.meetingId);

  if (!meeting) {
    return <Result status="404" title="未找到会议" extra={<Link href="/meeting"><Button>返回会议</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Tag color="green">对讲中</Tag>
          <p className="device-page-title">{meeting.title}</p>
          <p className="device-page-subtle">按住说话，松开发送给全部成员。</p>
        </Space>
      </div>
      <WatchSection title="对讲状态">
        <div className="device-capture-stage capturing" style={{ minHeight: 118 }}>
          <AudioOutlined />
        </div>
        <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
          当前会自动播放群内对讲语音，也会生成会后纪要。
        </Paragraph>
      </WatchSection>
      <WatchSection title="快捷操作">
        <div className="device-action-chip-row">
          <Button type="primary" onClick={() => messageApi.success('已发送对讲语音')}>按住说话</Button>
          <Button onClick={() => messageApi.success('已切换静音模式')}>静音</Button>
        </div>
      </WatchSection>
      <WatchNextSteps text="结束对讲后，可以返回会议详情查看 AI 纪要。" />
      <WatchActionButtons primary={{ label: '看纪要', path: `/meeting/${meeting.id}/summary` }} secondary={{ label: '返回会议', path: `/meeting/${meeting.id}` }} />
    </div>
  );
}
