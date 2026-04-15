'use client';

import { Button, Result, Space, Tag, message } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { addCourseNote, continueCourse, getCourseById, shareCourse, toggleCourseFavorite, useCourseState } from '../../../../lib/device-course-data';

export default function DeviceCourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const state = useCourseState();
  const course = getCourseById(params.courseId, state);
  const [messageApi, contextHolder] = message.useMessage();

  if (!course || !course.purchased) {
    return <Result status="404" title="未找到课程" extra={<Link href="/courses"><Button>课程</Button></Link>} />;
  }

  const primaryActionLabel =
    course.type === '视频' ? '继续播放' : course.type === '音频' ? '继续收听' : '打开挑战';

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space>
            <Tag color="blue">{course.type}</Tag>
            <Tag color="green">已购课程</Tag>
            <Tag color="purple">{course.progress}%</Tag>
          </Space>
          <p className="device-page-title">{course.title}</p>
          <p className="device-page-subtle">{course.summary}</p>
        </Space>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">课程基础信息</p>
        <div className="device-mini-list">
          <div className="device-mini-item watch-list-card">
            <div className="device-mini-item-title">
              <span>课程摘要</span>
              <Tag color="blue">{course.cover}</Tag>
            </div>
            <p className="device-mini-item-desc">{course.summary}</p>
          </div>
          <div className="device-mini-item watch-list-card">
            <div className="device-mini-item-title">
              <span>课程状态</span>
            </div>
            <p className="device-mini-item-desc">{course.statusText}</p>
          </div>
        </div>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">课程目录</p>
        <div className="device-mini-list">
          {course.chapters.map((chapter) => (
            <div key={chapter.id} className="device-mini-item watch-list-card">
              <div className="device-mini-item-title">
                <span>{chapter.title}</span>
                <Tag color={chapter.progress >= 100 ? 'green' : chapter.progress > 0 ? 'blue' : 'default'}>
                  {chapter.duration}
                </Tag>
              </div>
              <p className="device-mini-item-desc">学习进度 {chapter.progress}%</p>
            </div>
          ))}
        </div>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">断点续播</p>
        <div className="device-mini-item watch-list-card">
          <div className="device-mini-item-title">
            <span>上次学习位置</span>
            <Tag color="blue">{course.lastPositionLabel}</Tag>
          </div>
          <p className="device-mini-item-desc">{course.resumeHint}</p>
        </div>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">闪记</p>
        <div className="device-mini-list">
          {course.notes.map((note) => (
            <div key={note.id} className="device-mini-item watch-list-card">
              <div className="device-mini-item-title">
                <span>{note.title}</span>
                <Tag color="purple">{note.createdAt}</Tag>
              </div>
              <p className="device-mini-item-desc">{note.content}</p>
              <p className="device-mini-item-meta">
                关联位置：{note.linkedChapterTitle} · {note.linkedPositionLabel}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">收藏与分享</p>
        <div className="device-mini-list">
          <div className="device-mini-item watch-list-card">
            <div className="device-mini-item-title">
              <span>当前状态</span>
              <div className="watch-home-tab-tags">
                {course.favorite ? <Tag color="gold">已收藏</Tag> : <Tag>未收藏</Tag>}
                {course.shared ? <Tag color="cyan">已分享</Tag> : <Tag>未分享</Tag>}
              </div>
            </div>
            <p className="device-mini-item-desc">可把当前课程或章节同步到我的收藏，也可分享给好友或朋友圈。</p>
          </div>
        </div>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">AI 陪伴学习</p>
        <div className="device-mini-item watch-list-card">
          <div className="device-mini-item-title">
            <span>{course.aiCompanionTitle}</span>
            <Tag color="blue">课程上下文</Tag>
          </div>
          <p className="device-mini-item-desc">
            从课程界面进入问答后，会带着当前课程内容继续提问，关闭后返回课程详情。
          </p>
        </div>
      </div>

      <div className="device-action-row">
        <Button
          type="primary"
          block
          onClick={() => {
            const nextCourse = continueCourse(course.id);
            messageApi.success(
              course.type === '难题挑战'
                ? `已进入挑战，当前进度 ${nextCourse?.progress ?? course.progress}%`
                : `${primaryActionLabel}成功，当前进度 ${nextCourse?.progress ?? course.progress}%`,
            );
          }}
        >
          {primaryActionLabel}
        </Button>
        <Link href="/ask">
          <Button block>AI 陪伴学习</Button>
        </Link>
      </div>
      <div className="device-action-row" style={{ marginTop: 10 }}>
        <Button
          type="primary"
          block
          onClick={() => {
            const nextCourse = toggleCourseFavorite(course.id);
            messageApi.success(nextCourse?.favorite ? '已加入收藏' : '已取消收藏');
          }}
        >
          {course.favorite ? '取消收藏' : '收藏课程'}
        </Button>
        <Button
          block
          onClick={() => {
            shareCourse(course.id);
            messageApi.success('已分享当前课程');
          }}
        >
          分享课程
        </Button>
      </div>
      <div className="device-action-row" style={{ marginTop: 10 }}>
        <Button
          type="primary"
          block
          onClick={() => {
            addCourseNote(course.id);
            messageApi.success('已新增一条课程闪记');
          }}
        >
          记录闪记
        </Button>
        <Link href="/courses">
          <Button block>课程列表</Button>
        </Link>
      </div>
    </div>
  );
}
