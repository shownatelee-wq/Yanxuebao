'use client';

import { Button, Result, Tag } from 'antd';
import Link from 'next/link';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getPlazaAgentById, markPlazaAgentVisited, usePlazaState } from '../../../../../../lib/device-plaza-data';

export default function DevicePlazaAgentChallengesPage() {
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
          <p className="device-page-subtle">难题挑战支持单人挑战和团队挑战，设备端会复用任务与团队现有能力。</p>
          <div className="watch-status-pills" style={{ marginTop: 8 }}>
            <span className="watch-status-pill">{agent.challenges.length} 个挑战</span>
            <span className="watch-status-pill">{agent.challenges.filter((item) => item.mode === '团队挑战').length} 个团队挑战</span>
          </div>
        </div>

        <div className="watch-list-panel">
          <div className="watch-inline-head">
            <span>挑战列表</span>
            <span>单人 / 团队</span>
          </div>
          <div className="device-mini-list">
            {agent.challenges.length ? agent.challenges.map((challenge) => (
              <Link key={challenge.id} href={challenge.targetPath} className="device-card-link">
                <div className="device-mini-item watch-list-card">
                  <div className="device-mini-item-title">
                    <span>{challenge.title}</span>
                    <div className="watch-home-tab-tags">
                      <Tag color={challenge.mode === '团队挑战' ? 'purple' : 'orange'}>{challenge.mode}</Tag>
                      <Tag color={challenge.status === '进行中' ? 'blue' : challenge.status === '已完成' ? 'green' : 'default'}>
                        {challenge.status}
                      </Tag>
                    </div>
                  </div>
                  <p className="device-mini-item-desc">{challenge.summary}</p>
                </div>
              </Link>
            )) : (
              <div className="device-mini-item watch-list-card">
                <p className="device-mini-item-desc" style={{ margin: 0 }}>这个智能体暂时没有可参与的挑战。</p>
              </div>
            )}
          </div>
        </div>

        <div className="watch-bottom-dock">
          <div className="device-action-row">
            <Link href={`/plaza/agents/${agent.id}`}>
              <Button type="primary" block>智能体详情</Button>
            </Link>
            <Link href="/tasks">
              <Button block>任务</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
