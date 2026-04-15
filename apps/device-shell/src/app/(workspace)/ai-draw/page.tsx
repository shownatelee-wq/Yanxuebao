'use client';

import { Button, Input, Typography, message } from 'antd';
import { useState } from 'react';
import { WatchActionButtons } from '../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceAiDrawPage() {
  const [prompt, setPrompt] = useState('把海豚馆画成一张蓝色科普海报');
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <p className="device-page-title">AI 绘画</p>
          <div className="watch-status-pills">
            <span className="watch-status-pill">提示词生成</span>
            <span className="watch-status-pill">相册底图</span>
          </div>
        </div>
        <div className="watch-list-panel">
          <Input.TextArea rows={4} value={prompt} onChange={(event) => setPrompt(event.target.value)} />
          <Paragraph type="secondary" style={{ margin: '8px 0 0', fontSize: 11 }}>
            可使用刚拍到的照片作为底图。
          </Paragraph>
        </div>
        <div className="watch-bottom-dock">
          <div style={{ marginBottom: 10 }}>
            <Button type="primary" block onClick={() => messageApi.success('已生成 1 张创作图并保存到相册')}>
              生成图片
            </Button>
          </div>
          <WatchActionButtons primary={{ label: '相册', path: '/album' }} secondary={{ label: '任务', path: '/tasks/new' }} />
        </div>
      </div>
    </div>
  );
}
