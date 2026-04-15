'use client';

import { Button, Input, Select, Space, Typography, message } from 'antd';
import { useState } from 'react';
import { WatchHero, WatchSection, WatchActionButtons, WatchNextSteps } from '../../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceFriendNewPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('同学');

  return (
    <div className="device-page-stack">
      {contextHolder}
      <WatchHero title="添加好友" subtitle="填写联系人信息。" />
      <WatchSection title="填写信息">
        <Space direction="vertical" size={10} style={{ width: '100%' }}>
          <Input placeholder="好友昵称" value={name} onChange={(event) => setName(event.target.value)} />
          <Select
            value={relation}
            onChange={setRelation}
            options={[
              { label: '同学', value: '同学' },
              { label: '家人', value: '家人' },
              { label: '导师', value: '导师' },
            ]}
          />
          <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
            可用学号、手机号或碰一碰录入。
          </Paragraph>
          <Button
            type="primary"
            block
            onClick={() => messageApi.success(`${name || '新好友'} 已加入联系人`)}
          >
            保存联系人
          </Button>
        </Space>
      </WatchSection>
      <WatchNextSteps text="保存后会同步到好友和微聊。" />
      <WatchActionButtons primary={{ label: '微聊', path: '/microchat' }} secondary={{ label: '好友', path: '/friends' }} />
    </div>
  );
}
