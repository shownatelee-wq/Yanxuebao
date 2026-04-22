'use client';

import {
  AudioOutlined,
  CalendarOutlined,
  CameraOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { Button, Input, Tag, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import {
  createDiaryAgentSessionFromSelection,
  getDiarySelectableFlashNotes,
  getDiarySelectableMediaAssets,
  getDiarySelectableTaskWorks,
  removeDiarySelectionId,
  updateDiarySelection,
  useDeviceDiaryStore,
} from '../../../lib/device-diary-data';
import { getMediaAssetById, useDeviceMediaLibrary } from '../../../lib/device-media-library';

function buildRangeButtonLabel(label: string) {
  return `${label}···`;
}

export default function DeviceDiaryPage() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const diaryStore = useDeviceDiaryStore();
  const { selection } = diaryStore;
  const mediaSnapshot = useDeviceMediaLibrary();

  const selectedImages = useMemo(
    () =>
      selection.selectedImageIds
        .map((assetId) => getMediaAssetById(assetId))
        .filter((item): item is NonNullable<ReturnType<typeof getMediaAssetById>> => Boolean(item)),
    [mediaSnapshot.assets, selection.selectedImageIds],
  );
  const selectedVideos = useMemo(
    () =>
      selection.selectedVideoIds
        .map((assetId) => getMediaAssetById(assetId))
        .filter((item): item is NonNullable<ReturnType<typeof getMediaAssetById>> => Boolean(item)),
    [mediaSnapshot.assets, selection.selectedVideoIds],
  );
  const selectedFlashNotes = useMemo(() => {
    const notes = getDiarySelectableFlashNotes();
    return notes.filter((item) => selection.selectedFlashNoteIds.includes(item.id));
  }, [selection.selectedFlashNoteIds]);
  const selectedTaskWorks = useMemo(() => {
    const taskWorks = getDiarySelectableTaskWorks();
    return taskWorks.filter((item) => selection.selectedTaskWorkIds.includes(item.id));
  }, [selection.selectedTaskWorkIds]);

  const availablePhotoCount = useMemo(
    () => getDiarySelectableMediaAssets('photo').length,
    [mediaSnapshot.assets],
  );
  const availableVideoCount = useMemo(
    () => getDiarySelectableMediaAssets('video').length,
    [mediaSnapshot.assets],
  );

  function generateDiary() {
    if (!selectedImages.length && !selectedVideos.length && !selectedFlashNotes.length && !selectedTaskWorks.length) {
      messageApi.warning('先添加闪记、任务作品、图片或视频素材');
      return;
    }

    if (!selection.prompt.trim()) {
      messageApi.warning('先输入你想让 AI 重点写进日记里的内容');
      return;
    }

    const session = createDiaryAgentSessionFromSelection({ prompt: selection.prompt.trim() });
    router.push(`/diary/chat/${session.id}`);
  }

  return (
    <div className="device-ai-studio-page device-diary-studio-page device-diary-studio-manual-page">
      {contextHolder}

      <div className="device-ai-studio-stage device-diary-studio-stage">
        <div className="device-ai-import-card selected device-diary-material-card">
          <div className="device-diary-panel-head">
            <strong>添加素材</strong>
            <span>先把你想写进研学日记的内容加进来，再输入要求发送给 AI。</span>
          </div>

          <div className="device-diary-material-grid">
            <button type="button" className="device-diary-material-action" onClick={() => router.push('/diary/select/flash-notes')}>
              <FileTextOutlined />
              <strong>添加闪记</strong>
              <span>{selectedFlashNotes.length ? `已选 ${selectedFlashNotes.length} 条` : '补充语音或文字记录'}</span>
            </button>
            <button type="button" className="device-diary-material-action" onClick={() => router.push('/diary/select/task-works')}>
              <FileTextOutlined />
              <strong>添加任务作品</strong>
              <span>{selectedTaskWorks.length ? `已选 ${selectedTaskWorks.length} 份` : '补充作品和观察结果'}</span>
            </button>
            <button type="button" className="device-diary-material-action" onClick={() => router.push('/diary/select/images')}>
              <CameraOutlined />
              <strong>添加图片</strong>
              <span>{selectedImages.length ? `已选 ${selectedImages.length} 张` : `${availablePhotoCount} 张可选`}</span>
            </button>
            <button type="button" className="device-diary-material-action" onClick={() => router.push('/diary/select/videos')}>
              <PlayCircleOutlined />
              <strong>添加视频</strong>
              <span>{selectedVideos.length ? `已选 ${selectedVideos.length} 段` : `${availableVideoCount} 段可选`}</span>
            </button>
          </div>

          <div className="device-diary-selected-block">
            <div className="device-diary-panel-head compact">
              <strong>已添加素材</strong>
              <span>点一下素材标签可移除</span>
            </div>

            <div className="device-diary-selected-group">
              {selectedFlashNotes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="device-diary-selected-chip"
                  onClick={() => removeDiarySelectionId('flash-notes', item.id)}
                >
                  闪记 · {item.title}
                </button>
              ))}
              {selectedTaskWorks.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="device-diary-selected-chip"
                  onClick={() => removeDiarySelectionId('task-works', item.id)}
                >
                  作品 · {item.title}
                </button>
              ))}
              {selectedImages.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="device-diary-selected-chip media"
                  onClick={() => removeDiarySelectionId('images', item.id)}
                >
                  图片 · {item.title}
                </button>
              ))}
              {selectedVideos.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="device-diary-selected-chip media"
                  onClick={() => removeDiarySelectionId('videos', item.id)}
                >
                  视频 · {item.title}
                </button>
              ))}
              {!selectedFlashNotes.length && !selectedTaskWorks.length && !selectedImages.length && !selectedVideos.length ? (
                <div className="device-diary-selected-empty">
                  <Tag color="blue">日记日期：{selection.sourceRange.label}</Tag>
                  <span>当前还没有添加素材，可以先选图片、视频、闪记或任务作品。</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="device-ai-studio-footer">
        <div className="device-ai-studio-composer">
          <Input.TextArea
            value={selection.prompt}
            onChange={(event) => updateDiarySelection({ prompt: event.target.value })}
            autoSize={{ minRows: 3, maxRows: 5 }}
            variant="borderless"
            className="device-ai-studio-input"
            placeholder="输入你希望 AI 怎么写这篇研学日记"
          />

          <div className="device-diary-composer-toolbar">
            <button type="button" className="device-ai-studio-pill device-diary-date-trigger" onClick={() => router.push('/diary/range')}>
              <CalendarOutlined />
              <span>{buildRangeButtonLabel(selection.sourceRange.label)}</span>
            </button>

            <div className="device-diary-composer-actions">
              <Button
                shape="circle"
                icon={<AudioOutlined />}
                onClick={() => {
                  updateDiarySelection({ prompt: '请把我今天看到的重点现象、我的发现和感受整理得更完整一点。' });
                  messageApi.success('已模拟录音输入日记要求');
                }}
              />
              <Button type="primary" shape="round" icon={<SendOutlined />} onClick={generateDiary}>
                生成日记
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
