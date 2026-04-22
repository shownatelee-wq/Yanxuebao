'use client';

import {
  CameraOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  SoundOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Button, Input, Space, Tag, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import {
  FlashNoteItem,
  FlashNoteSourceContext,
  FlashNoteType,
  createDraftFlashNote,
  deleteFlashNote,
  saveFlashNote,
  updateFlashNote,
} from '../lib/flash-notes';

type FlashNoteRecorderProps = {
  type: FlashNoteType;
  contextTitle?: string;
  sourceContext?: FlashNoteSourceContext;
  saveButtonLabel?: string;
  mode?: 'manual' | 'autosave';
  onSaved?: (note: FlashNoteItem) => void;
};

const VOICE_LIMIT_SECONDS = 10 * 60;
const VIDEO_LIMIT_SECONDS = 3 * 60;

function formatDuration(totalSeconds: number) {
  const seconds = Math.max(0, totalSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainSeconds = seconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainSeconds).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(remainSeconds).padStart(2, '0')}`;
}

function buildDefaultTranscript(contextTitle?: string) {
  if (!contextTitle) {
    return '我想快速记录现场观察到的重点，并带回当前任务继续整理。';
  }

  return `${contextTitle}：我刚记录了现场观察重点，后续可以继续补充证据和判断。`;
}

function buildPhoto(index: number) {
  return {
    id: `flash-note-photo-${Date.now()}-${index}`,
    title: `补充照片 ${index}`,
    url: index % 2 === 0 ? '/mock/task-photo.jpg' : '/mock/dolphin-photo.jpg',
  };
}

export function FlashNoteRecorder({
  type,
  contextTitle,
  sourceContext,
  saveButtonLabel,
  mode = 'manual',
  onSaved,
}: FlashNoteRecorderProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const [phase, setPhase] = useState<'recording' | 'completed'>('recording');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [transcript, setTranscript] = useState(buildDefaultTranscript(contextTitle));
  const [photos, setPhotos] = useState<Array<{ id: string; title: string; url?: string }>>([]);
  const [draftNoteId, setDraftNoteId] = useState<string | null>(null);

  const limitSeconds = type === 'voice_note' ? VOICE_LIMIT_SECONDS : VIDEO_LIMIT_SECONDS;
  const typeLabel = type === 'voice_note' ? '语音闪记' : '视频闪记';
  const actionLabel = type === 'voice_note' ? '录音' : '录制';
  const primaryIcon = type === 'voice_note' ? <SoundOutlined /> : <VideoCameraOutlined />;
  const safeDuration = useMemo(
    () => Math.max(elapsedSeconds, type === 'voice_note' ? 18 : 16),
    [elapsedSeconds, type],
  );

  useEffect(() => {
    setPhase('recording');
    setElapsedSeconds(0);
    setTranscript(buildDefaultTranscript(contextTitle));
    setPhotos([]);
    setDraftNoteId(null);
  }, [contextTitle, type]);

  useEffect(() => {
    if (phase !== 'recording') {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === 'recording' && elapsedSeconds >= limitSeconds) {
      setPhase('completed');
    }
  }, [elapsedSeconds, limitSeconds, phase]);

  useEffect(() => {
    if (mode !== 'autosave' || draftNoteId) {
      return;
    }

    const draft = createDraftFlashNote({
      title: contextTitle ? `${contextTitle}${type === 'voice_note' ? '语音闪记' : '视频闪记'}` : typeLabel,
      type,
      duration: formatDuration(type === 'voice_note' ? 18 : 16),
      transcript,
      sourceContext,
    });
    setDraftNoteId(draft.id);
  }, [contextTitle, draftNoteId, mode, sourceContext, transcript, type, typeLabel]);

  useEffect(() => {
    if (mode !== 'autosave' || !draftNoteId) {
      return;
    }

    updateFlashNote(draftNoteId, {
      title: contextTitle ? `${contextTitle}${type === 'voice_note' ? '语音闪记' : '视频闪记'}` : typeLabel,
      transcript,
      duration: formatDuration(safeDuration),
      status: phase === 'completed' ? 'saved' : 'draft',
      audio:
        type === 'voice_note'
          ? {
              title: contextTitle ? `${contextTitle}现场录音` : '现场录音',
              duration: formatDuration(safeDuration),
              url: '/mock/flash-note-audio.mp3',
            }
          : undefined,
      video:
        type === 'video_note'
          ? {
              title: contextTitle ? `${contextTitle}现场视频` : '现场视频',
              duration: formatDuration(safeDuration),
              url: '/mock/explain-video.mp4',
              coverImage: '/mock/task-photo.jpg',
            }
          : undefined,
      photos,
    });
  }, [contextTitle, draftNoteId, mode, phase, photos, safeDuration, transcript, type, typeLabel]);

  function stopCapture() {
    setElapsedSeconds((current) => Math.max(current, type === 'voice_note' ? 18 : 16));
    setPhase('completed');
  }

  function addPhoto() {
    setPhotos((current) => {
      if (current.length >= 9) {
        messageApi.warning('最多补拍 9 张照片');
        return current;
      }

      const next = [...current, buildPhoto(current.length + 1)];
      messageApi.success(`已补拍第 ${next.length} 张照片`);
      return next;
    });
  }

  function saveCurrentNote() {
    if (type === 'voice_note' && safeDuration <= 0) {
      messageApi.error('未录到有效音频，暂不能保存');
      return;
    }

    if (mode === 'autosave' && draftNoteId) {
      const saved = updateFlashNote(draftNoteId, {
        title: contextTitle ? `${contextTitle}${type === 'voice_note' ? '语音闪记' : '视频闪记'}` : typeLabel,
        transcript: transcript.trim() || undefined,
        duration: formatDuration(safeDuration),
        status: 'saved',
        audio:
          type === 'voice_note'
            ? {
                title: contextTitle ? `${contextTitle}现场录音` : '现场录音',
                duration: formatDuration(safeDuration),
                url: '/mock/flash-note-audio.mp3',
              }
            : undefined,
        video:
          type === 'video_note'
            ? {
                title: contextTitle ? `${contextTitle}现场视频` : '现场视频',
                duration: formatDuration(safeDuration),
                url: '/mock/explain-video.mp4',
                coverImage: '/mock/task-photo.jpg',
              }
            : undefined,
        photos,
      });
      if (saved) {
        messageApi.success('闪记已自动保存');
        onSaved?.(saved);
      }
      return;
    }

    const note = saveFlashNote({
      title: contextTitle ? `${contextTitle}${type === 'voice_note' ? '语音闪记' : '视频闪记'}` : typeLabel,
      type,
      duration: formatDuration(safeDuration),
      transcript: transcript.trim() || undefined,
      audio: type === 'voice_note'
        ? {
            title: contextTitle ? `${contextTitle}现场录音` : '现场录音',
            duration: formatDuration(safeDuration),
            url: '/mock/flash-note-audio.mp3',
          }
        : undefined,
      video: type === 'video_note'
        ? {
            title: contextTitle ? `${contextTitle}现场视频` : '现场视频',
            duration: formatDuration(safeDuration),
            url: '/mock/explain-video.mp4',
            coverImage: '/mock/task-photo.jpg',
          }
        : undefined,
      photos,
      sourceContext,
    });

    messageApi.success(type === 'voice_note' ? '语音闪记已保存' : '视频闪记已保存');
    onSaved?.(note);
  }

  function removeDraftNote() {
    if (!draftNoteId) {
      return;
    }

    deleteFlashNote(draftNoteId);
    messageApi.success('闪记草稿已删除');
    setDraftNoteId(null);
    setPhase('recording');
    setElapsedSeconds(0);
    setTranscript(buildDefaultTranscript(contextTitle));
    setPhotos([]);
  }

  return (
    <div className="device-page-stack" style={{ gap: 10 }}>
      {contextHolder}
      <div className="device-compact-card">
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space wrap>
            <Tag color={type === 'voice_note' ? 'green' : 'purple'}>{typeLabel}</Tag>
            <Tag color={phase === 'recording' ? 'blue' : 'gold'}>{phase === 'recording' ? `正在${actionLabel}` : `${actionLabel}完成`}</Tag>
            <Tag color="cyan">{type === 'voice_note' ? '最长10分钟' : '最长3分钟'}</Tag>
          </Space>
          {contextTitle ? <p className="device-mini-item-desc" style={{ margin: 0 }}>当前题目：{contextTitle}</p> : null}
        </Space>
      </div>

      <div className="device-compact-card">
        <div className={`device-capture-stage ${phase === 'recording' ? 'capturing' : 'done'}`} style={{ minHeight: 138, marginBottom: 10 }}>
          <div style={{ display: 'grid', justifyItems: 'center', gap: 8 }}>
            <span>{primaryIcon}</span>
            <strong style={{ fontSize: 18 }}>{formatDuration(phase === 'recording' ? elapsedSeconds : safeDuration)}</strong>
            <span style={{ fontSize: 12, color: 'rgba(31, 41, 55, 0.72)' }}>
              {phase === 'recording' ? `${actionLabel}已自动开始` : type === 'voice_note' ? '已生成转写文字，可继续补拍照片' : '已生成视频预览，可直接保存'}
            </span>
          </div>
        </div>

        {phase === 'recording' ? (
          <div className="device-action-row">
            <Button type="primary" icon={primaryIcon} block onClick={stopCapture}>
              {type === 'voice_note' ? '点击结束录音' : '点击结束录制'}
            </Button>
            <Button icon={<PauseCircleOutlined />} block onClick={stopCapture}>
              停止
            </Button>
          </div>
        ) : (
          <Space direction="vertical" size={10} style={{ width: '100%' }}>
            <div className="device-review-summary-item">
              <div className="device-mini-item-title">
                <span>{type === 'voice_note' ? '录音回放' : '视频预览'}</span>
                <Tag color={type === 'voice_note' ? 'orange' : 'purple'}>{formatDuration(safeDuration)}</Tag>
              </div>
              <p className="device-mini-item-desc" style={{ marginBottom: 8 }}>
                {type === 'voice_note' ? '录音结束后已自动生成转写文字。' : '录制结束后可直接保存为视频闪记。'}
              </p>
              <Button size="small" icon={<PlayCircleOutlined />} onClick={() => messageApi.success(type === 'voice_note' ? '正在播放录音' : '正在播放视频')}>
                播放
              </Button>
            </div>

            {type === 'voice_note' ? (
              <>
                <div>
                  <p className="device-section-label" style={{ marginBottom: 8 }}>自动转写文字</p>
                  <Input.TextArea
                    rows={4}
                    value={transcript}
                    onChange={(event) => setTranscript(event.target.value)}
                    placeholder="转写失败时，可手动补充文字"
                  />
                </div>
                <div className="device-review-summary-item">
                  <div className="device-mini-item-title">
                    <span>补充照片</span>
                    <Tag color="blue">{photos.length}/9</Tag>
                  </div>
                  <p className="device-mini-item-desc" style={{ marginBottom: 8 }}>录音结束后可连续补拍 1-9 张照片，与这条语音闪记一起保存。</p>
                  <Button icon={<CameraOutlined />} onClick={addPhoto}>
                    拍照
                  </Button>
                  {photos.length ? (
                    <div className="device-action-chip-row" style={{ marginTop: 8 }}>
                      {photos.map((photo) => (
                        <Tag key={photo.id} color="cyan">{photo.title}</Tag>
                      ))}
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="device-review-summary-item">
                <div className="device-mini-item-title">
                  <span>保存提示</span>
                  <Tag color="purple">1段视频</Tag>
                </div>
                <p className="device-mini-item-desc" style={{ margin: 0 }}>视频闪记不追加拍照链路，保存后可直接在任务中引用。</p>
              </div>
            )}

            {mode === 'autosave' ? (
              <div className="device-action-row">
                <Button block icon={<DeleteOutlined />} onClick={removeDraftNote}>
                  {saveButtonLabel ?? '删除闪记'}
                </Button>
                <Button type="primary" block icon={<CheckCircleOutlined />} onClick={saveCurrentNote}>
                  查看已保存内容
                </Button>
              </div>
            ) : (
              <Button type="primary" block icon={<CheckCircleOutlined />} onClick={saveCurrentNote}>
                {saveButtonLabel ?? '保存闪记'}
              </Button>
            )}
          </Space>
        )}
      </div>
    </div>
  );
}
