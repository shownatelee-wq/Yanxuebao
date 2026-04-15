'use client';

import { Button, Typography, message } from 'antd';
import { WatchHero, WatchSection, WatchActionButtons, WatchNextSteps } from '../../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceFlashVideoPage() {
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <div className="device-page-stack">
      {contextHolder}
      <WatchHero title="视频闪记" subtitle="记录现场视频内容。" />
      <WatchSection title="录制状态">
        <div className="device-capture-stage">
          <span>视频</span>
        </div>
        <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
          支持将现场视频保存到闪记作品。
        </Paragraph>
        <Button type="primary" block style={{ marginTop: 10 }} onClick={() => messageApi.success('视频闪记已保存')}>
          开始录制
        </Button>
      </WatchSection>
      <WatchNextSteps text="视频内容可保存为闪记，也可用于任务作品。" />
      <WatchActionButtons primary={{ label: '闪记作品', path: '/flash-note/works' }} secondary={{ label: '任务', path: '/tasks/new' }} />
    </div>
  );
}
