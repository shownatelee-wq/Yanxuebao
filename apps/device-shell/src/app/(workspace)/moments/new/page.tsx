'use client';

import { BookOutlined, CameraOutlined, PlayCircleFilled, ReadOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Button, Input, message } from 'antd';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { addMoment, type DeviceMomentAttachment } from '../../../../lib/device-social-state';
import { getCourseById } from '../../../../lib/device-course-data';
import { getDeviceDiaryById } from '../../../../lib/device-diary-data';
import { getMediaAssetById } from '../../../../lib/device-media-library';
import { getDeviceTaskById } from '../../../../lib/device-task-data';
import { WatchHero, WatchSection } from '../../../../lib/watch-ui';

function appendContentParam(searchParams: URLSearchParams, content: string) {
  const next = new URLSearchParams(searchParams.toString());
  next.set('content', content);
  return next;
}

function buildAttachmentFromQuery(searchParams: URLSearchParams): DeviceMomentAttachment[] {
  const attachments: DeviceMomentAttachment[] = [];
  const assetIds = (searchParams.get('assetIds') ?? '').split(',').filter(Boolean);
  assetIds.forEach((assetId) => {
    const asset = getMediaAssetById(assetId);
    if (!asset) {
      return;
    }
    attachments.push({
      id: `moment_media_${asset.id}`,
      type: 'media',
      label: asset.title,
      summary: `${asset.type} · ${asset.createdAt}`,
      path: `/album/${asset.id}`,
      ctaLabel: '查看相册',
      previewLabel: asset.previewLabel ?? asset.type,
    });
  });

  const task = getDeviceTaskById(searchParams.get('taskId') ?? '');
  if (task) {
    attachments.push({
      id: `moment_task_${task.id}`,
      type: 'task',
      label: task.title,
      summary: `${task.taskType} · ${task.taskDescription}`,
      path: `/tasks/${task.id}`,
      ctaLabel: '加入任务',
      previewLabel: '任务卡',
      linkType: '任务挑战',
    });
  }

  const course = getCourseById(searchParams.get('courseId') ?? '');
  if (course) {
    attachments.push({
      id: `moment_course_${course.id}`,
      type: 'course',
      label: course.title,
      summary: `${course.type} · ${course.summary}`,
      path: `/courses/${course.id}`,
      ctaLabel: '加入课程',
      previewLabel: '课程卡',
      linkType: '课程',
    });
  }

  const diary = getDeviceDiaryById(searchParams.get('diaryId') ?? '');
  if (diary) {
    attachments.push({
      id: `moment_diary_${diary.id}`,
      type: 'diary',
      label: diary.title,
      summary: diary.summary,
      path: `/diary/${diary.id}`,
      ctaLabel: '查看日记',
      previewLabel: '研学日记',
      linkType: '研学日记',
    });
  }

  return attachments;
}

function isMediaAttachment(attachment: DeviceMomentAttachment) {
  return attachment.type === 'media' || attachment.type === 'image' || attachment.type === 'video';
}

export default function DeviceMomentNewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [content, setContent] = useState(searchParams.get('content') ?? '今天的研学发现很有意思，想分享给大家。');
  const attachments = buildAttachmentFromQuery(searchParams);
  const [messageApi, contextHolder] = message.useMessage();

  function selectHref(source: 'album' | 'tasks' | 'courses' | 'diaries') {
    return `/moments/new/select/${source}?${appendContentParam(new URLSearchParams(searchParams.toString()), content).toString()}`;
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <WatchHero title="发朋友圈" subtitle="输入一句话，再添加图片、任务、课程或日记。" />
      <WatchSection title="发布内容">
        <Input.TextArea
          rows={4}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onBlur={(event) => {
            const next = new URLSearchParams(searchParams.toString());
            next.set('content', event.target.value);
            window.history.replaceState(null, '', `/moments/new?${next.toString()}`);
          }}
          placeholder="这一刻想分享什么？"
        />
        <div className="device-moment-add-grid">
          <Link href={selectHref('album')}><Button icon={<CameraOutlined />}>添加图片/视频</Button></Link>
          <Link href={selectHref('tasks')}><Button icon={<UnorderedListOutlined />}>添加任务</Button></Link>
          <Link href={selectHref('courses')}><Button icon={<ReadOutlined />}>添加课程</Button></Link>
          <Link href={selectHref('diaries')}><Button icon={<BookOutlined />}>添加研学日记</Button></Link>
        </div>
      </WatchSection>

      <WatchSection title="已添加内容">
        {attachments.length ? (
          <>
            {attachments.some(isMediaAttachment) ? (
              <div className="device-moment-media-grid">
                {attachments.filter(isMediaAttachment).map((attachment, index) => {
                  const isVideo = attachment.summary.includes('视频') || attachment.label.includes('视频');
                  return (
                    <Link
                      key={attachment.id}
                      href={attachment.path ?? '#'}
                      className={`device-photo-thumb tone-${index % 6}`}
                      aria-label={attachment.label}
                    >
                      {isVideo ? <PlayCircleFilled /> : null}
                      <span>{attachment.previewLabel ?? attachment.label}</span>
                    </Link>
                  );
                })}
              </div>
            ) : null}
            {attachments.some((attachment) => !isMediaAttachment(attachment)) ? (
              <div className="device-moment-attachment-row">
                {attachments.filter((attachment) => !isMediaAttachment(attachment)).map((attachment) => (
                  <Link key={attachment.id} href={attachment.path ?? '#'} className={`device-moment-attachment type-${attachment.type}`}>
                    <strong>{attachment.label}</strong>
                    <span>{attachment.previewLabel ?? attachment.linkType ?? attachment.type} · {attachment.summary}</span>
                    <em>{attachment.ctaLabel ?? '查看'}</em>
                  </Link>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <p className="device-mini-item-desc" style={{ margin: 0 }}>还没有添加附件，可以先选一张图片或一个任务。</p>
        )}
        <Button
          type="primary"
          block
          style={{ marginTop: 12 }}
          onClick={() => {
            addMoment({ content, attachments });
            messageApi.success('已发布朋友圈');
            window.setTimeout(() => router.push('/moments'), 400);
          }}
        >
          发布
        </Button>
      </WatchSection>
    </div>
  );
}
