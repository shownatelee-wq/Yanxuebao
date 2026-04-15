'use client';

import { Button, Result, Tag } from 'antd';
import Link from 'next/link';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getPlazaAgentById, markPlazaAgentVisited, usePlazaState } from '../../../../../../lib/device-plaza-data';

export default function DevicePlazaAgentCoursesPage() {
  const params = useParams<{ agentId: string }>();
  const state = usePlazaState();
  const agent = getPlazaAgentById(params.agentId, state);

  useEffect(() => {
    if (params.agentId) {
      markPlazaAgentVisited(params.agentId);
    }
  }, [params.agentId]);

  if (!agent) {
    return <Result status="404" title="未找到智能体" extra={<Link href="/plaza"><Button>广场</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <p className="device-page-title">{agent.title}</p>
          <p className="device-page-subtle">课程支持在线学习、免费试听、课程目录、断点续播、闪记、收藏和分享。</p>
          <div className="watch-status-pills" style={{ marginTop: 8 }}>
            <span className="watch-status-pill">{agent.courses.length} 门课程</span>
            <span className="watch-status-pill">{agent.courses.filter((item) => item.isPreviewFree).length} 门可试听</span>
          </div>
        </div>

        <div className="watch-list-panel">
          <div className="watch-inline-head">
            <span>课程列表</span>
            <span>{agent.category}</span>
          </div>
          <div className="device-mini-list">
            {agent.courses.length ? agent.courses.map((course) => (
              <Link key={course.id} href={`/plaza/agents/${agent.id}/courses/${course.id}`} className="device-card-link">
                <div className="device-mini-item watch-list-card">
                  <div className="device-mini-item-title">
                    <span>{course.title}</span>
                    <div className="watch-home-tab-tags">
                      {course.isPreviewFree ? <Tag color="green">免费试听</Tag> : <Tag color="gold">需解锁</Tag>}
                      <Tag color="blue">{course.progress}%</Tag>
                    </div>
                  </div>
                  <p className="device-mini-item-desc">{course.summary}</p>
                  <p className="device-mini-item-meta">{course.resumeHint}</p>
                </div>
              </Link>
            )) : (
              <div className="device-mini-item watch-list-card">
                <p className="device-mini-item-desc" style={{ margin: 0 }}>这个智能体暂时没有课程内容。</p>
              </div>
            )}
          </div>
        </div>

        <div className="watch-bottom-dock">
          <div className="device-action-row">
            <Link href={`/plaza/agents/${agent.id}`}>
              <Button type="primary" block>智能体详情</Button>
            </Link>
            <Link href="/courses">
              <Button block>课程中心</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
