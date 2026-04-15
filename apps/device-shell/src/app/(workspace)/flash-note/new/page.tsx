'use client';

import { CheckCircleOutlined, SoundOutlined } from '@ant-design/icons';
import { Button, Input, Space, Tag, message } from 'antd';
import Link from 'next/link';
import { useState } from 'react';
import { saveDemoDraft } from '../../../../lib/demo-draft';
import { saveFlashNote } from '../../../../lib/flash-notes';

export default function DeviceFlashNoteNewPage() {
  const [note, setNote] = useState('海豚表演前会先绕场一圈，像在熟悉环境。');
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space>
            <Tag color="green">闪记</Tag>
            <Tag color="gold">新建</Tag>
          </Space>
          <p className="device-page-title">新建闪记</p>
          <p className="device-page-subtle">记录完成后可保存到闪记。</p>
        </Space>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">记录内容</p>
        <Input.TextArea rows={5} value={note} onChange={(event) => setNote(event.target.value)} placeholder="输入观察要点" />
        <div className="device-action-row" style={{ marginTop: 10 }}>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => {
              if (!note.trim()) {
                messageApi.error('请先输入内容');
                return;
              }
              saveFlashNote(note);
              messageApi.success('闪记已保存');
            }}
            block
          >
            保存闪记
          </Button>
          <Button icon={<SoundOutlined />} block>
            语音闪记
          </Button>
        </div>
      </div>

      <div className="device-action-row">
        <Button
          block
          onClick={() => {
            if (!note.trim()) {
              messageApi.error('请先输入内容');
              return;
            }
            saveDemoDraft({
              type: 'text',
              title: '闪记观察记录',
              content: note,
              source: 'flash-note',
              updatedAt: new Date().toISOString(),
            });
            messageApi.success('已加入任务草稿');
          }}
        >
          加入任务
        </Button>
        <Link href="/flash-note">
          <Button block>闪记</Button>
        </Link>
      </div>
    </div>
  );
}
