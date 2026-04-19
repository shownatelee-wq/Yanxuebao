'use client';

import { Button, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getFlashNoteMeta, getFlashNoteSummary, getFlashNotes, getFlashNoteTypeLabel, type FlashNoteItem } from '../../../../lib/flash-notes';

const { Paragraph } = Typography;

export default function DeviceFlashWorksPage() {
  const [notes, setNotes] = useState<FlashNoteItem[]>([]);

  useEffect(() => {
    setNotes(getFlashNotes());
  }, []);

  return (
    <div className="device-page-stack">
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <p className="device-page-title">闪记作品</p>
        <p className="device-page-subtle">统一查看语音闪记和视频闪记，供任务引用和回看。</p>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">作品列表</p>
        <div className="device-mini-list">
          {notes.map((item) => (
            <Link key={item.id} href={`/flash-note/${item.id}`} className="device-card-link">
              <div className="device-mini-item">
                <div className="device-mini-item-title">
                  <span>{item.title}</span>
                  <Tag color={item.type === 'voice_note' ? 'green' : 'purple'}>{getFlashNoteTypeLabel(item)}</Tag>
                </div>
                <Paragraph type="secondary" style={{ margin: '4px 0 0', fontSize: 11 }}>
                  {getFlashNoteSummary(item)}
                </Paragraph>
                <div className="device-action-chip-row" style={{ marginTop: 8 }}>
                  {getFlashNoteMeta(item).map((meta) => (
                    <Tag key={`${item.id}-${meta}`} color="cyan">{meta}</Tag>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="device-action-row">
        <Link href="/flash-note">
          <Button type="primary" block>闪记</Button>
        </Link>
        <Link href="/tasks/new">
          <Button block>任务</Button>
        </Link>
      </div>
    </div>
  );
}
