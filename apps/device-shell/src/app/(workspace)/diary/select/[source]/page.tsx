'use client';

import { CheckCircleFilled } from '@ant-design/icons';
import { Button, Result, Tag } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  getDiarySelectableFlashNotes,
  getDiarySelectableMediaAssets,
  getDiarySelectableTaskWorks,
  getDiarySelectionState,
  setDiarySelectionIds,
  type DeviceDiarySelectionSource,
} from '../../../../../lib/device-diary-data';
import { useDeviceMediaLibrary } from '../../../../../lib/device-media-library';
import { getFlashNoteTypeLabel } from '../../../../../lib/flash-notes';
import { useDeviceTaskSnapshot } from '../../../../../lib/device-task-data';

type SelectItem = {
  id: string;
  title: string;
  summary: string;
  tag: string;
  subTag?: string;
  accent?: 'blue' | 'green' | 'orange' | 'purple';
  previewLabel?: string;
  mode: 'default' | 'media';
};

const sourceMeta: Record<DeviceDiarySelectionSource, { emptyText: string }> = {
  'flash-notes': { emptyText: '暂时没有可补充的闪记' },
  'task-works': { emptyText: '暂时没有可补充的任务作品' },
  'images': { emptyText: '相册中暂时没有可补充的图片' },
  'videos': { emptyText: '相册中暂时没有可补充的视频' },
};

function toSource(value?: string): DeviceDiarySelectionSource | null {
  if (value === 'flash-notes' || value === 'task-works' || value === 'images' || value === 'videos') {
    return value;
  }
  return null;
}

export default function DeviceDiarySelectPage() {
  const params = useParams<{ source: string }>();
  const router = useRouter();
  useDeviceMediaLibrary();
  useDeviceTaskSnapshot();
  const source = toSource(params.source);
  const selection = getDiarySelectionState();

  const items = useMemo<SelectItem[]>(() => {
    if (source === 'flash-notes') {
      return getDiarySelectableFlashNotes().map((item) => ({
        id: item.id,
        title: item.title,
        summary: item.transcript ?? '已保存的闪记内容',
        tag: getFlashNoteTypeLabel(item),
        subTag: item.createdAt,
        mode: 'default',
      }));
    }
    if (source === 'task-works') {
      return getDiarySelectableTaskWorks().map((item) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        tag: item.taskTitle,
        subTag: item.updatedAt,
        mode: 'default',
      }));
    }
    if (source === 'images') {
      return getDiarySelectableMediaAssets('photo').map((item) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        tag: '图片',
        subTag: item.createdAt,
        accent: item.accent,
        previewLabel: item.previewLabel ?? item.title,
        mode: 'media',
      }));
    }
    if (source === 'videos') {
      return getDiarySelectableMediaAssets('video').map((item) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        tag: '视频',
        subTag: item.createdAt,
        accent: item.accent,
        previewLabel: item.previewLabel ?? item.title,
        mode: 'media',
      }));
    }
    return [];
  }, [source]);

  const initialIds =
    source === 'flash-notes'
      ? selection.selectedFlashNoteIds
      : source === 'task-works'
        ? selection.selectedTaskWorkIds
        : source === 'images'
          ? selection.selectedImageIds
          : selection.selectedVideoIds;
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(initialIds));

  if (!source) {
    return <Result status="404" title="未找到选择页" extra={<Button onClick={() => router.push('/diary')}>返回研学日记</Button>} />;
  }

  if (!items.length) {
    return <Result status="404" title={sourceMeta[source].emptyText} extra={<Button onClick={() => router.push('/diary')}>返回研学日记</Button>} />;
  }

  function toggle(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function confirm() {
    if (!source) {
      return;
    }
    setDiarySelectionIds(source, Array.from(selectedIds));
    router.push('/diary');
  }

  const isMediaSource = source === 'images' || source === 'videos';

  return (
    <div className="device-page-stack device-diary-select-page">
      <div className={`device-mini-list${isMediaSource ? ' device-diary-media-select-grid' : ''}`}>
        {items.map((item) => {
          const selected = selectedIds.has(item.id);

          if (item.mode === 'media') {
            return (
              <button
                key={item.id}
                type="button"
                className={`device-diary-media-select-card${selected ? ' active' : ''}`}
                onClick={() => toggle(item.id)}
                aria-pressed={selected}
              >
                <div className="device-diary-media-select-check">
                  <CheckCircleFilled />
                </div>
                <div className={`device-ai-import-preview accent-${item.accent ?? 'blue'}`}>
                  <span>{item.previewLabel}</span>
                </div>
                <div className="device-diary-media-select-body">
                  <div className="device-diary-select-title">
                    <strong>{item.title}</strong>
                    <Tag color="blue">{item.tag}</Tag>
                  </div>
                  <p>{item.summary}</p>
                  {item.subTag ? <span>{item.subTag}</span> : null}
                </div>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              className={`device-diary-select-option${selected ? ' active' : ''}`}
              onClick={() => toggle(item.id)}
              aria-pressed={selected}
            >
              <div className="device-diary-select-check">
                <CheckCircleFilled />
              </div>
              <div className="device-diary-select-main">
                <div className="device-diary-select-title">
                  <strong>{item.title}</strong>
                  <Tag color="blue">{item.tag}</Tag>
                </div>
                <p>{item.summary}</p>
                {item.subTag ? <span>{item.subTag}</span> : null}
              </div>
            </button>
          );
        })}
      </div>

      <div className="device-action-row">
        <Button type="primary" block onClick={confirm}>
          确定
        </Button>
        <Button block onClick={() => router.push('/diary')}>
          返回
        </Button>
      </div>
    </div>
  );
}
