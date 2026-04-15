'use client';

import { Button, Result, Tag, message } from 'antd';
import Link from 'next/link';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getPlazaAgentById, markPlazaAgentVisited, togglePlazaSubscription, usePlazaState } from '../../../../../../lib/device-plaza-data';

export default function DevicePlazaAgentNewsPage() {
  const params = useParams<{ agentId: string }>();
  const state = usePlazaState();
  const agent = getPlazaAgentById(params.agentId, state);
  const [messageApi, contextHolder] = message.useMessage();

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
      {contextHolder}
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <p className="device-page-title">{agent.title}</p>
          <p className="device-page-subtle">这里集中展示智能体的资讯订阅、资讯播报和自动下一条能力。</p>
          <div className="watch-status-pills" style={{ marginTop: 8 }}>
            <span className="watch-status-pill">{agent.news.length} 条资讯</span>
            <span className="watch-status-pill">{agent.subscribed ? '已订阅' : '未订阅'}</span>
          </div>
        </div>

        <div className="watch-list-panel">
          <div className="watch-inline-head">
            <span>资讯播报</span>
            <span>自动下一条</span>
          </div>
          <div className="device-mini-list">
            {agent.news.length ? agent.news.map((news) => (
              <Link key={news.id} href={`/plaza/agents/${agent.id}/news/${news.id}`} className="device-card-link">
                <div className="device-mini-item watch-list-card">
                  <div className="device-mini-item-title">
                    <span>{news.title}</span>
                    <div className="watch-home-tab-tags">
                      <Tag color="blue">资讯播报</Tag>
                      {news.autoNext ? <Tag color="green">自动下一条</Tag> : null}
                    </div>
                  </div>
                  <p className="device-mini-item-desc">{news.summary}</p>
                  <p className="device-mini-item-meta">{news.publishedAt} · {news.audioDuration}</p>
                </div>
              </Link>
            )) : (
              <div className="device-mini-item watch-list-card">
                <p className="device-mini-item-desc" style={{ margin: 0 }}>这个智能体暂时没有资讯内容。</p>
              </div>
            )}
          </div>
        </div>

        <div className="watch-bottom-dock">
          <div className="device-action-row">
            <Button
              type="primary"
              block
              onClick={() => {
                const nextAgent = togglePlazaSubscription(agent.id);
                messageApi.success(nextAgent?.subscribed ? '已开启资讯订阅' : '已取消资讯订阅');
              }}
            >
              {agent.subscribed ? '取消订阅' : '订阅资讯'}
            </Button>
            <Link href={`/plaza/agents/${agent.id}`}>
              <Button block>智能体详情</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
