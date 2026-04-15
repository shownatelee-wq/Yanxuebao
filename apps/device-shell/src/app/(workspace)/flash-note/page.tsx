'use client';

import { Button, Segmented, Space, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getFlashNotes } from '../../../lib/flash-notes';
import { demoFlashWorks } from '../../../lib/device-demo-data';

const { Paragraph } = Typography;

export default function DeviceFlashNotePage() {
  const [notes, setNotes] = useState(getFlashNotes());
  const [mode, setMode] = useState<'voice' | 'video' | 'works'>('voice');

  useEffect(() => {
    setNotes(getFlashNotes());
  }, []);

  return (
    <div className="device-page-stack">
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space>
            <Tag color="green">闪记</Tag>
            <Tag color="gold">快速记录</Tag>
          </Space>
          <p className="device-page-title">闪记</p>
          <p className="device-page-subtle">语音、视频和作品都会保存在这里。</p>
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
          {mode === 'voice' ? (
            <Link href="/flash-note/new">
              <Button type="primary">新建</Button>
            </Link>
          ) : mode === 'video' ? (
            <Link href="/flash-note/video">
              <Button type="primary">录制</Button>
            </Link>
          ) : (
            <Link href="/flash-note/works">
              <Button type="primary">查看</Button>
            </Link>
          )}
        </div>
        {mode === 'voice' ? (
          <div className="device-mini-list">
            {notes.map((item, index) => (
              <Link key={item.id} href={`/flash-note/${item.id}`} className="device-card-link">
                <div className="device-mini-item">
                  <div className="device-mini-item-title">
                    <span>{`闪记 ${index + 1}`}</span>
                    <Tag color="blue">已保存</Tag>
                  </div>
                  <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
                    {item.content}
                  </Paragraph>
                </div>
              </Link>
            ))}
          </div>
        ) : mode === 'video' ? (
          <div className="device-mini-item">
            <div className="device-mini-item-title">
              <span>视频闪记</span>
              <Tag color="purple">最长 3 分钟</Tag>
            </div>
            <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
              录制后会保存到视频闪记。
            </Paragraph>
          </div>
        ) : (
          <div className="device-mini-list">
            {demoFlashWorks.map((item) => (
              <Link key={item.id} href="/flash-note/works" className="device-card-link">
                <div className="device-mini-item">
                  <div className="device-mini-item-title">
                    <span>{item.title}</span>
                    <Tag color={item.type === '视频闪记' ? 'purple' : 'green'}>{item.type}</Tag>
                  </div>
                  <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
                    {item.duration} · {item.status}
                  </Paragraph>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="device-action-row">
        <Link href={mode === 'voice' ? '/flash-note/new' : mode === 'video' ? '/flash-note/video' : '/flash-note/works'}>
          <Button type="primary" block>{mode === 'voice' ? '新建' : mode === 'video' ? '录制' : '作品'}</Button>
        </Link>
        <Link href="/tasks/new">
          <Button block>作品</Button>
        </Link>
      </div>
    </div>
  );
}
