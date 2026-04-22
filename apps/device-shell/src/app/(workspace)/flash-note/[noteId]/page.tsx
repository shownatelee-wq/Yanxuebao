'use client';

import { Button, Result, Space, Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { saveDemoDraft } from '../../../../lib/demo-draft';
import { getFlashNoteById, getFlashNoteMeta, getFlashNoteSummary, getFlashNoteTypeLabel } from '../../../../lib/flash-notes';

const { Paragraph } = Typography;

export default function DeviceFlashNoteDetailPage() {
  const params = useParams<{ noteId: string }>();
  const note = getFlashNoteById(params.noteId);
  const [messageApi, contextHolder] = message.useMessage();

  if (!note) {
    return <Result status="404" title="未找到闪记" extra={<Link href="/flash-note"><Button>返回闪记列表</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space wrap>
            <Tag color={note.type === 'voice_note' ? 'green' : 'purple'}>{getFlashNoteTypeLabel(note)}</Tag>
            <Tag color={note.status === 'saved' ? 'blue' : note.status === 'synced' ? 'cyan' : 'gold'}>
              {note.status === 'saved' ? '已保存' : note.status === 'synced' ? '已同步' : '草稿'}
            </Tag>
          </Space>
          <p className="device-page-title">{note.title}</p>
          <p className="device-page-subtle">
            创建时间：{new Date(note.createdAt).toLocaleString('zh-CN', { hour12: false })}
          </p>
          <div className="device-action-chip-row">
            {getFlashNoteMeta(note).map((meta) => (
              <Tag key={`${note.id}-${meta}`} color="cyan">{meta}</Tag>
            ))}
          </div>
        </Space>
      </div>

      {note.type === 'voice_note' ? (
        <>
          <div className="device-compact-card">
            <p className="device-section-label">语音转写</p>
            <Paragraph style={{ margin: 0, fontSize: 12 }}>{getFlashNoteSummary(note)}</Paragraph>
          </div>
          <div className="device-compact-card">
            <div className="device-mini-item-title">
              <span>录音回放</span>
              <Tag color="orange">{note.audio?.duration ?? note.duration}</Tag>
            </div>
            <p className="device-mini-item-desc" style={{ marginBottom: 8 }}>{note.audio?.title ?? '现场录音'}</p>
            <Button size="small" onClick={() => messageApi.success('正在播放录音')}>播放录音</Button>
          </div>
          <div className="device-compact-card">
            <div className="device-mini-item-title">
              <span>补充照片</span>
              <Tag color="green">{note.photos?.length ?? 0}张</Tag>
            </div>
            {note.photos?.length ? (
              <div className="device-action-chip-row" style={{ marginTop: 8 }}>
                {note.photos.map((photo) => (
                  <Tag key={photo.id} color="cyan">{photo.title}</Tag>
                ))}
              </div>
            ) : (
              <p className="device-mini-item-desc" style={{ margin: 0 }}>当前未补充照片。</p>
            )}
          </div>
        </>
      ) : (
        <div className="device-compact-card">
          <div className="device-mini-item-title">
            <span>视频预览</span>
            <Tag color="purple">{note.video?.duration ?? note.duration}</Tag>
          </div>
          <div className="device-capture-stage done" style={{ minHeight: 128, marginTop: 10 }}>
            <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
              <strong>视频闪记</strong>
              <span style={{ fontSize: 12, color: 'rgba(31, 41, 55, 0.72)' }}>{getFlashNoteSummary(note)}</span>
            </div>
          </div>
          <Button size="small" onClick={() => messageApi.success('正在播放视频闪记')}>播放视频</Button>
        </div>
      )}

      <div className="device-action-row">
        <Button
          type="primary"
          block
          onClick={() => {
            saveDemoDraft({
              type: note.type === 'voice_note' ? 'text' : 'video',
              title: note.title,
              content: getFlashNoteSummary(note),
              source: 'flash-note',
              updatedAt: new Date().toISOString(),
            });
            messageApi.success('已加入任务草稿');
          }}
        >
          加入任务
        </Button>
        <Link href={`/flash-note/${note.id}/edit`}>
          <Button block>编辑</Button>
        </Link>
      </div>

      <div className="device-action-row single">
        <Link href="/flash-note">
          <Button block>闪记</Button>
        </Link>
      </div>
    </div>
  );
}
