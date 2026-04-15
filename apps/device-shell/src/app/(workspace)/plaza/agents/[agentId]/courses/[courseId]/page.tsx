'use client';

import { Button, Result, Tag, message } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { addPlazaCourseFlashNote, continuePlazaCourse, getPlazaAgentById, getPlazaCourse, sharePlazaCourse, togglePlazaCourseFavorite, usePlazaState } from '../../../../../../../lib/device-plaza-data';

export default function DevicePlazaAgentCourseDetailPage() {
  const params = useParams<{ agentId: string; courseId: string }>();
  const state = usePlazaState();
  const agent = getPlazaAgentById(params.agentId, state);
  const course = getPlazaCourse(params.agentId, params.courseId, state);
  const [messageApi, contextHolder] = message.useMessage();

  if (!agent || !course) {
    return <Result status="404" title="未找到课程" extra={<Link href="/plaza"><Button>广场</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <p className="device-page-title">{course.title}</p>
          <p className="device-page-subtle">{course.summary}</p>
          <div className="watch-status-pills" style={{ marginTop: 8 }}>
            <span className="watch-status-pill">{course.isPreviewFree ? '免费试听' : '家长端购买'}</span>
            <span className="watch-status-pill">{course.progress}% 进度</span>
            <span className="watch-status-pill">{course.tutor}</span>
          </div>
        </div>

        <div className="watch-list-panel">
          <div className="watch-inline-head">
            <span>课程目录</span>
            <span>{course.chapters.length} 节</span>
          </div>
          <div className="device-mini-list">
            {course.chapters.map((chapter) => (
              <div key={chapter.id} className="device-mini-item watch-list-card">
                <div className="device-mini-item-title">
                  <span>{chapter.title}</span>
                  <Tag color={chapter.status === '已学完' ? 'green' : chapter.status === '学习中' ? 'blue' : 'default'}>
                    {chapter.status}
                  </Tag>
                </div>
                <p className="device-mini-item-desc">{chapter.duration}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="watch-list-panel">
          <div className="watch-inline-head">
            <span>断点续播与闪记</span>
            <span>{course.notes.length} 条闪记</span>
          </div>
          <div className="device-mini-list">
            <div className="device-mini-item watch-list-card">
              <div className="device-mini-item-title">
                <span>上次学习位置</span>
              </div>
              <p className="device-mini-item-desc">{course.resumeHint}</p>
            </div>
            {course.notes.map((note) => (
              <div key={note.id} className="device-mini-item watch-list-card">
                <div className="device-mini-item-title">
                  <span>{note.title}</span>
                  <Tag color="purple">{note.createdAt}</Tag>
                </div>
                <p className="device-mini-item-desc">{note.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="watch-list-panel">
          <div className="watch-inline-head">
            <span>收藏与分享</span>
            <span>{agent.shortTitle}</span>
          </div>
          <div className="device-mini-list">
            <div className="device-mini-item watch-list-card">
              <div className="device-mini-item-title">
                <span>课程状态</span>
                <div className="watch-home-tab-tags">
                  {course.favorite ? <Tag color="gold">已收藏</Tag> : null}
                  {course.shared ? <Tag color="cyan">已分享</Tag> : null}
                </div>
              </div>
              <p className="device-mini-item-desc">收藏后会同步到我的收藏，分享会生成给家长的推荐提示。</p>
            </div>
          </div>
        </div>

        <div className="watch-bottom-dock">
          <div className="device-action-row">
            <Button
              type="primary"
              block
              onClick={() => {
                const nextCourse = continuePlazaCourse(agent.id, course.id);
                messageApi.success(`已继续学习，当前进度 ${nextCourse?.progress ?? course.progress}%`);
              }}
            >
              继续学习
            </Button>
            <Button
              block
              onClick={() => {
                const nextCourse = togglePlazaCourseFavorite(agent.id, course.id);
                messageApi.success(nextCourse?.favorite ? '已加入收藏' : '已取消收藏');
              }}
            >
              {course.favorite ? '取消收藏' : '收藏课程'}
            </Button>
          </div>
          <div className="device-action-row" style={{ marginTop: 10 }}>
            <Button
              type="primary"
              block
              onClick={() => {
                addPlazaCourseFlashNote(agent.id, course.id);
                messageApi.success('已加入一条新的闪记');
              }}
            >
              加入闪记
            </Button>
            <Button
              block
              onClick={() => {
                sharePlazaCourse(agent.id, course.id);
                messageApi.success('已分享课程推荐');
              }}
            >
              分享课程
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
