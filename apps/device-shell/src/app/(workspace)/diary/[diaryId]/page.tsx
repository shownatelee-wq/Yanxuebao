'use client';

import { AudioOutlined } from '@ant-design/icons';
import { Button, Input, Result, Tag, message } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { getDeviceDiaryById, updateDeviceDiary } from '../../../../lib/device-diary-data';
import { getDeviceTaskById, getDeviceTaskWorkById } from '../../../../lib/device-task-data';
import { getMediaAssetById } from '../../../../lib/device-media-library';
import { getFlashNoteById } from '../../../../lib/flash-notes';

export default function DeviceDiaryDetailPage() {
  const params = useParams<{ diaryId: string }>();
  const [messageApi, contextHolder] = message.useMessage();
  const diary = getDeviceDiaryById(params.diaryId);
  const [content, setContent] = useState(diary?.content ?? '');

  if (!diary) {
    return <Result status="404" title="未找到日记" extra={<Link href="/diary"><Button>研学日记</Button></Link>} />;
  }

  const linkedAssets = diary.linkedAssets
    .map((assetId) => getMediaAssetById(assetId))
    .filter((item): item is NonNullable<ReturnType<typeof getMediaAssetById>> => Boolean(item));
  const linkedFlashNotes = diary.linkedFlashNotes
    .map((noteId) => getFlashNoteById(noteId))
    .filter((item): item is NonNullable<ReturnType<typeof getFlashNoteById>> => Boolean(item));
  const linkedTaskWorks = diary.linkedTaskWorks
    .map((workId) => getDeviceTaskWorkById(workId))
    .filter((item): item is NonNullable<ReturnType<typeof getDeviceTaskWorkById>> => Boolean(item));
  const linkedAiCreations = diary.linkedAiCreations
    .map((assetId) => getMediaAssetById(assetId))
    .filter((item): item is NonNullable<ReturnType<typeof getMediaAssetById>> => Boolean(item));

  return (
    <div className="device-page-stack">
      {contextHolder}

      <div className="device-hero-card device-stage-card" style={{ padding: 14 }}>
        <div className="device-inline-stat" style={{ marginBottom: 10, flexWrap: 'wrap' }}>
          <Tag color="blue">{diary.sourceRange.label}</Tag>
          <Tag color="gold">{diary.draftStatus === 'draft' ? 'AI草稿' : '已归档'}</Tag>
          <Tag>{diary.updatedAt}</Tag>
        </div>
        <p className="device-page-title">{diary.title}</p>
        <p className="device-page-subtle">{diary.summary}</p>
        {diary.lastAgentInstruction ? (
          <div className="device-mini-item compact" style={{ marginTop: 12 }}>
            <div className="device-mini-item-title">
              <span>最近一次 AI 改写要求</span>
              <Tag color="purple">智能体</Tag>
            </div>
            <p className="device-mini-item-desc">{diary.lastAgentInstruction}</p>
          </div>
        ) : null}
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">日记内容</p>
        <Input.TextArea rows={6} value={content} onChange={(event) => setContent(event.target.value)} />
        <div className="device-action-row" style={{ marginTop: 10 }}>
          <Button icon={<AudioOutlined />} onClick={() => setContent(`${content} 我今天最大的发现是：观察要结合现场证据和自己的判断。`)}>
            语音改写
          </Button>
          <Button
            type="primary"
            onClick={() => {
              updateDeviceDiary(diary.id, { content, summary: content.slice(0, 36) });
              messageApi.success('日记已更新');
            }}
          >
            保存修改
          </Button>
        </div>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">素材来源</p>
        <div className="device-mini-list">
          {linkedAssets.map((asset) => (
            <Link key={asset.id} href={`/album/${asset.id}`} className="device-card-link">
              <div className="device-mini-item">
                <div className="device-mini-item-title">
                  <span>{asset.title}</span>
                  <Tag color="blue">{asset.type}</Tag>
                </div>
                <p className="device-mini-item-desc">{asset.summary}</p>
              </div>
            </Link>
          ))}
          {linkedFlashNotes.map((note) => (
            <Link key={note.id} href={`/flash-note/${note.id}`} className="device-card-link">
              <div className="device-mini-item">
                <div className="device-mini-item-title">
                  <span>{note.title}</span>
                  <Tag color="green">闪记</Tag>
                </div>
                <p className="device-mini-item-desc">{note.transcript ?? note.duration}</p>
              </div>
            </Link>
          ))}
          {linkedTaskWorks.map((work) => {
            const task = getDeviceTaskById(work.taskId);
            return (
              <div key={work.id} className="device-mini-item">
                <div className="device-mini-item-title">
                  <span>{work.title}</span>
                  <Tag color="orange">{task?.title ?? '任务作品'}</Tag>
                </div>
                <p className="device-mini-item-desc">{work.summary}</p>
              </div>
            );
          })}
          {linkedAiCreations.map((asset) => (
            <Link key={asset.id} href={`/album/${asset.id}`} className="device-card-link">
              <div className="device-mini-item">
                <div className="device-mini-item-title">
                  <span>{asset.title}</span>
                  <Tag color="purple">AI创作</Tag>
                </div>
                <p className="device-mini-item-desc">{asset.summary}</p>
              </div>
            </Link>
          ))}
          {!linkedAssets.length && !linkedFlashNotes.length && !linkedTaskWorks.length && !linkedAiCreations.length ? (
            <div className="device-mini-item compact">
              <p className="device-mini-item-desc">这篇日记还没有关联额外素材。</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="device-action-row">
        <Link href="/diary">
          <Button type="primary" block>
            返回创作台
          </Button>
        </Link>
        <Link href="/me">
          <Button block>我的</Button>
        </Link>
      </div>
    </div>
  );
}
