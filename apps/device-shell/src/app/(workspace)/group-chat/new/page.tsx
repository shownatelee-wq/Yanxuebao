'use client';

import { Button, Input, Typography, message } from 'antd';
import { useState } from 'react';
import { WatchHero, WatchSection, WatchActionButtons, WatchNextSteps } from '../../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceGroupChatNewPage() {
  const [name, setName] = useState('我的新群聊');
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <div className="device-page-stack">
      {contextHolder}
      <WatchHero title="新建群聊" subtitle="给小组或班级创建一个新聊天。" />
      <WatchSection title="群信息">
        <Input value={name} onChange={(event) => setName(event.target.value)} />
        <Paragraph type="secondary" style={{ margin: '8px 0 0', fontSize: 11 }}>
          保存后可补充同学、家长或导师成员。
        </Paragraph>
        <Button type="primary" block style={{ marginTop: 10 }} onClick={() => messageApi.success(`${name} 已创建`)}>
          保存群聊
        </Button>
      </WatchSection>
      <WatchNextSteps text="建好群后可以回群聊列表，也可以直接去会议页发起小组碰头会。" />
      <WatchActionButtons primary={{ label: '返回群聊', path: '/group-chat' }} secondary={{ label: '去会议', path: '/meeting' }} />
    </div>
  );
}
