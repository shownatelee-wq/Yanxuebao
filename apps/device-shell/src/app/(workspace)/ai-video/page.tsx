'use client';

import { Button, Input, Typography, message } from 'antd';
import { useState } from 'react';
import { WatchActionButtons } from '../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceAiVideoPage() {
  const [prompt, setPrompt] = useState('把海豚跃出水面的照片生成 15 秒短视频');
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <p className="device-page-title">AI 视频</p>
          <div className="watch-status-pills">
            <span className="watch-status-pill">固定 15 秒</span>
            <span className="watch-status-pill">生成后自动保存</span>
          </div>
        </div>
        <div className="watch-list-panel">
          <Input.TextArea rows={4} value={prompt} onChange={(event) => setPrompt(event.target.value)} />
          <Paragraph type="secondary" style={{ margin: '8px 0 0', fontSize: 11 }}>
            当前固定生成 15 秒视频，并自动保存到相册。
          </Paragraph>
        </div>
        <div className="watch-bottom-dock">
          <div style={{ marginBottom: 10 }}>
            <Button type="primary" block onClick={() => messageApi.success('已生成 15 秒短视频并保存到相册')}>
              生成视频
            </Button>
          </div>
          <WatchActionButtons primary={{ label: '相册', path: '/album' }} secondary={{ label: '广场', path: '/plaza' }} />
        </div>
      </div>
    </div>
  );
}
