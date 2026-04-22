'use client';

import { CheckCircleFilled, PlayCircleFilled } from '@ant-design/icons';
import { Button, Result, Tag } from 'antd';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { getPurchasedCourses, useCourseState } from '../../../../../../lib/device-course-data';
import { useDeviceDiarySnapshot } from '../../../../../../lib/device-diary-data';
import { useDeviceMediaLibrary } from '../../../../../../lib/device-media-library';
import { getDeviceTaskList, useDeviceTaskSnapshot } from '../../../../../../lib/device-task-data';
import { WatchHero, WatchSection } from '../../../../../../lib/watch-ui';

type Source = 'album' | 'tasks' | 'courses' | 'diaries';

type SelectItem = {
  id: string;
  title: string;
  summary: string;
  tag: string;
  dateGroup?: string;
  mediaType?: 'photo' | 'video';
};

const sourceMeta: Record<Source, { title: string; confirmParam: 'assetIds' | 'taskId' | 'courseId' | 'diaryId' }> = {
  album: { title: '选择图片/视频', confirmParam: 'assetIds' },
  tasks: { title: '选择任务', confirmParam: 'taskId' },
  courses: { title: '选择课程', confirmParam: 'courseId' },
  diaries: { title: '选择研学日记', confirmParam: 'diaryId' },
};

function toSource(value: string): Source | null {
  if (value === 'album' || value === 'tasks' || value === 'courses' || value === 'diaries') {
    return value;
  }
  return null;
}

export default function DeviceMomentSelectPage() {
  const params = useParams<{ source: string }>();
  const source = toSource(params.source);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { assets } = useDeviceMediaLibrary();
  const taskSnapshot = useDeviceTaskSnapshot();
  const courseState = useCourseState();
  const diaries = useDeviceDiarySnapshot();

  const items = useMemo<SelectItem[]>(() => {
    if (source === 'album') {
      return assets
        .filter((asset) => asset.albumTab === 'photo' || asset.albumTab === 'video')
        .map((asset) => ({
          id: asset.id,
          title: asset.title,
          summary: `${asset.type} · ${asset.createdAt}`,
          tag: asset.type,
          dateGroup: asset.createdAt.startsWith('昨天') ? '昨天' : '今天',
          mediaType: asset.albumTab === 'video' ? 'video' : 'photo',
        }));
    }
    if (source === 'tasks') {
      return getDeviceTaskList().map((task) => ({
        id: task.id,
        title: task.title,
        summary: `${task.taskType} · ${task.taskDescription}`,
        tag: task.status === 'submitted' ? '已完成' : task.status === 'todo' ? '待开始' : '进行中',
      }));
    }
    if (source === 'courses') {
      return getPurchasedCourses(courseState).map((course) => ({
        id: course.id,
        title: course.title,
        summary: course.summary,
        tag: course.type,
      }));
    }
    if (source === 'diaries') {
      return diaries.map((diary) => ({
        id: diary.id,
        title: diary.title,
        summary: diary.summary,
        tag: diary.createdAt,
      }));
    }
    return [];
  }, [assets, courseState, diaries, source, taskSnapshot.tasks, taskSnapshot.works]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set((searchParams.get('assetIds') ?? '').split(',').filter(Boolean)),
  );
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? '');

  if (!source) {
    return <Result status="404" title="未找到选择页" extra={<Link href="/moments/new"><Button>返回发布</Button></Link>} />;
  }

  function confirm() {
    const albumSelectedIds = Array.from(selectedIds);
    if ((!selectedId && !albumSelectedIds.length) || !source) {
      return;
    }
    const next = new URLSearchParams(searchParams.toString());
    const param = sourceMeta[source].confirmParam;
    if (param === 'assetIds') {
      const current = (next.get('assetIds') ?? '').split(',').filter(Boolean);
      next.set('assetIds', Array.from(new Set([...current, ...albumSelectedIds])).join(','));
    } else {
      next.set(param, selectedId);
    }
    router.push(`/moments/new?${next.toString()}`);
  }

  function toggleAlbumItem(itemId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }

  const groupedAlbumItems = [
    { key: '今天', title: '今天', items: items.filter((item) => item.dateGroup !== '昨天') },
    { key: '昨天', title: '昨天', items: items.filter((item) => item.dateGroup === '昨天') },
  ].filter((group) => group.items.length);

  return (
    <div className="device-page-stack">
      <WatchHero title={sourceMeta[source].title} subtitle={source === 'album' ? '点选图片或视频，右上角勾选后确定。' : '点选一条内容，确定后回填到朋友圈。'} />
      {source === 'album' ? (
        <div className="device-photo-select-panel">
          {groupedAlbumItems.map((group) => (
            <section key={group.key} className="device-photo-select-group">
              <div className="device-photo-select-date">
                <strong>{group.title}</strong>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIds((current) => {
                      const next = new Set(current);
                      const allSelected = group.items.every((item) => next.has(item.id));
                      group.items.forEach((item) => {
                        if (allSelected) {
                          next.delete(item.id);
                        } else {
                          next.add(item.id);
                        }
                      });
                      return next;
                    });
                  }}
                >
                  全选
                </button>
              </div>
              <div className="device-photo-select-grid">
                {group.items.map((item, index) => {
                  const selected = selectedIds.has(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`device-photo-select-tile tone-${index % 6}${selected ? ' selected' : ''}`}
                      onClick={() => toggleAlbumItem(item.id)}
                      aria-pressed={selected}
                    >
                      {item.mediaType === 'video' ? <PlayCircleFilled className="device-photo-play" /> : null}
                      <CheckCircleFilled className="device-photo-check" />
                      <span>{item.title}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <WatchSection title="可选内容">
          <div className="device-mini-list">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`device-select-card${selectedId === item.id ? ' active' : ''}`}
                onClick={() => setSelectedId(item.id)}
              >
                <strong>{item.title}</strong>
                <span>{item.summary}</span>
                <Tag color={selectedId === item.id ? 'blue' : 'default'}>{item.tag}</Tag>
              </button>
            ))}
          </div>
        </WatchSection>
      )}
      <div className="device-action-row">
        <Button type="primary" block onClick={confirm} disabled={source === 'album' ? !selectedIds.size : !selectedId}>
          确定
        </Button>
        <Link href={`/moments/new?${searchParams.toString()}`}>
          <Button block>返回</Button>
        </Link>
      </div>
    </div>
  );
}
