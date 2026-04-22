'use client';

import { Button, Input, Segmented, Select, Space, Typography, message } from 'antd';
import { useState } from 'react';
import { addFriend, type DeviceFriendRelation } from '../../../../lib/device-social-state';
import { WatchHero, WatchSection } from '../../../../lib/watch-ui';

const { Paragraph } = Typography;

type AddMode = '研学宝ID' | '手机号' | '碰一碰';

const relationOptions: Array<{ label: DeviceFriendRelation; value: DeviceFriendRelation }> = [
  { label: '好友', value: '好友' },
  { label: '同学', value: '同学' },
  { label: '家人', value: '家人' },
  { label: '老师', value: '老师' },
];

export default function DeviceFriendNewPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [mode, setMode] = useState<AddMode>('研学宝ID');
  const [keyword, setKeyword] = useState('80004');
  const [relation, setRelation] = useState<DeviceFriendRelation>('同学');

  function submit() {
    const value = mode === '碰一碰' ? `NFC-${Date.now().toString().slice(-4)}` : keyword.trim();
    if (!value) {
      messageApi.warning(mode === '手机号' ? '请输入手机号' : '请输入研学宝ID');
      return;
    }

    const friend = addFriend({
      relation,
      yxbId: mode === '手机号' ? undefined : value,
      mobile: mode === '手机号' ? value : undefined,
      note: mode === '碰一碰' ? '碰一碰添加好友申请' : `${mode}添加好友申请`,
      remark: '',
    });
    messageApi.success(`${friend.name} 已发送好友申请`);
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <WatchHero title="添加好友" subtitle="少输入，选类型，一步发送好友申请。" />
      <WatchSection title="添加方式">
        <Segmented
          block
          value={mode}
          onChange={(value) => setMode(value as AddMode)}
          options={['研学宝ID', '手机号', '碰一碰']}
        />
        <Space direction="vertical" size={10} style={{ width: '100%', marginTop: 12 }}>
          {mode === '碰一碰' ? (
            <div className="device-nfc-pair-card">
              <div className="device-nfc-watch left">
                <span>研学宝</span>
              </div>
              <div className="device-nfc-wave">
                <i />
                <i />
                <i />
              </div>
              <div className="device-nfc-watch right">
                <span>研学宝</span>
              </div>
              <strong>请将两台研学宝设备进行触碰添加好友</strong>
              <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
                演示中点击下方按钮会模拟 NFC 碰一碰读取对方设备 ID。
              </Paragraph>
            </div>
          ) : (
            <Input
              inputMode={mode === '手机号' ? 'tel' : 'numeric'}
              placeholder={mode === '研学宝ID' ? '输入研学宝ID' : '输入手机号'}
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          )}
          <Select value={relation} onChange={setRelation} options={relationOptions} />
          <Button type="primary" block onClick={submit}>
            {mode === '碰一碰' ? '开始碰一碰添加' : '发送好友申请'}
          </Button>
        </Space>
      </WatchSection>
    </div>
  );
}
