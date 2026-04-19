'use client';

import { Button, Space, Tag } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FlashNoteRecorder } from '../../../../components/flash-note-recorder';

export default function DeviceFlashVideoPage() {
  const router = useRouter();

  return (
    <div className="device-page-stack">
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space wrap>
            <Tag color="purple">视频闪记</Tag>
            <Tag color="blue">自动开始录制</Tag>
          </Space>
          <p className="device-page-title">视频闪记</p>
          <p className="device-page-subtle">进入页面后自动开始录像，结束后直接保存为可引用的视频闪记。</p>
        </Space>
      </div>

      <FlashNoteRecorder
        type="video_note"
        sourceContext={{ source: 'flash-note-app' }}
        saveButtonLabel="保存视频闪记"
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
