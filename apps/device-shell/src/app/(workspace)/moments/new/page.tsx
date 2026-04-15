'use client';

import { Button, Input, Typography, message } from 'antd';
import { useState } from 'react';
import { WatchHero, WatchSection, WatchActionButtons, WatchNextSteps } from '../../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceMomentNewPage() {
  const [content, setContent] = useState('今天拍到了海豚跃出水面的瞬间！');
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <div className="device-page-stack">
      {contextHolder}
      <WatchHero title="发朋友圈" subtitle="记录研学观察并发布到朋友圈。" />
      <WatchSection title="发布内容">
        <Input.TextArea rows={4} value={content} onChange={(event) => setContent(event.target.value)} />
        <Paragraph type="secondary" style={{ margin: '8px 0 0', fontSize: 11 }}>
          可搭配图片、视频或课程卡片。
        </Paragraph>
        <Button type="primary" block style={{ marginTop: 10 }} onClick={() => messageApi.success('已发布新动态')}>
          发布动态
        </Button>
      </WatchSection>
      <WatchNextSteps text="发布后可在朋友圈和成长记录中查看更新。" />
      <WatchActionButtons primary={{ label: '朋友圈', path: '/moments' }} secondary={{ label: '成长', path: '/growth' }} />
    </div>
  );
}
