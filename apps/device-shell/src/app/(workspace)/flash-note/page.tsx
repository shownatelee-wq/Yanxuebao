'use client';

import { Button, Segmented, Space, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { getFlashNoteMeta, getFlashNoteSummary, getFlashNoteTypeLabel, useFlashNotes } from '../../../lib/flash-notes';

const { Paragraph } = Typography;

export default function DeviceFlashNotePage() {
  const notes = useFlashNotes();
  const [mode, setMode] = useState<'voice' | 'video' | 'works'>('voice');

  const filteredNotes = useMemo(() => {
    if (mode === 'works') {
      return notes;
    }

    return notes.filter((item) => (mode === 'voice' ? item.type === 'voice_note' : item.type === 'video_note'));
  }, [mode, notes]);

  return (
    <div className="device-page-stack">
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space wrap>
            <Tag color="green">闪记</Tag>
            <Tag color="gold">统一记录</Tag>
          </Space>
          <p className="device-page-title">闪记</p>
          <p className="device-page-subtle">进入创建页后自动保存，语音、视频和作品引用保持同一套记录。</p>
        </Space>
      </div>

      <div className="device-compact-card">
        <Segmented
          block
          value={mode}
          onChange={(value) => setMode(value as 'voice' | 'video' | 'works')}
          options={[
            { label: '语音闪记', value: 'voice' },
            { label: '视频闪记', value: 'video' },
            { label: '闪记作品', value: 'works' },
          ]}
        />
      </div>

      <div className="device-compact-card">
        <div className="device-page-toolbar">
          <p className="device-section-label" style={{ marginBottom: 0 }}>
            {mode === 'voice' ? '语音闪记' : mode === 'video' ? '视频闪记' : '闪记作品'}
          </p>
          <Link href="/flash-note/works">
            <Button type="primary">查看作品</Button>
          </Link>
        </div>

        <div className="device-action-row" style={{ marginBottom: 10 }}>
          <Link href="/flash-note/new">
            <Button type={mode === 'voice' ? 'primary' : 'default'} block>新建语音闪记</Button>
          </Link>
          <Link href="/flash-note/video">
            <Button type={mode === 'video' ? 'primary' : 'default'} block>新建视频闪记</Button>
          </Link>
        </div>

        <div className="device-mini-list">
          {filteredNotes.map((item) => (
            <Link key={item.id} href={`/flash-note/${item.id}`} className="device-card-link">
              <div className="device-mini-item">
                <div className="device-mini-item-title" style={{ alignItems: 'flex-start' }}>
                  <span>{item.title}</span>
                  <Tag color={item.type === 'voice_note' ? 'green' : 'purple'}>{getFlashNoteTypeLabel(item)}</Tag>
                </div>
                <Paragraph type="secondary" style={{ margin: '4px 0 0', fontSize: 11 }}>
                  {getFlashNoteSummary(item)}
                </Paragraph>
                <Paragraph type="secondary" style={{ margin: '4px 0 0', fontSize: 10 }}>
                  {new Date(item.createdAt).toLocaleString('zh-CN', { hour12: false })}
                </Paragraph>
                <div className="device-action-chip-row" style={{ marginTop: 8 }}>
                  {getFlashNoteMeta(item).map((meta) => (
                    <Tag key={`${item.id}-${meta}`} color="cyan">{meta}</Tag>
                  ))}
                </div>
              </div>
            </Link>
          ))}
          {!filteredNotes.length ? <p className="device-mini-item-desc" style={{ margin: 0 }}>暂无闪记内容。</p> : null}
        </div>
      </div>

      <div className="device-action-row">
        <Link href="/flash-note/new">
          <Button type="primary" block>语音闪记</Button>
        </Link>
        <Link href="/flash-note/video">
          <Button block>视频闪记</Button>
        </Link>
      </div>

      <div className="device-action-row single">
        <Link href="/tasks/new">
          <Button block>任务</Button>
        </Link>
      </div>
    </div>
  );
}
