'use client';

import { Button, Space, Tag } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FlashNoteRecorder } from '../../../../components/flash-note-recorder';

export default function DeviceFlashNoteNewPage() {
  const router = useRouter();

  return (
    <div className="device-page-stack">
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space wrap>
            <Tag color="green">语音闪记</Tag>
            <Tag color="blue">自动开始录音</Tag>
          </Space>
          <p className="device-page-title">语音闪记</p>
          <p className="device-page-subtle">进入页面后自动开始录音，结束后可补拍 1-9 张照片并保存。</p>
        </Space>
      </div>

      <FlashNoteRecorder
        type="voice_note"
        sourceContext={{ source: 'flash-note-app' }}
        saveButtonLabel="保存语音闪记"
        onSaved={(note) => router.push(`/flash-note/${note.id}`)}
      />

      <div className="device-action-row">
        <Link href="/flash-note/works">
          <Button type="primary" block>闪记作品</Button>
        </Link>
        <Link href="/flash-note">
          <Button block>闪记</Button>
        </Link>
      </div>
    </div>
  );
}
