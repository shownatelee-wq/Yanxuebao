'use client';

import { Button, Result, Tag, message } from 'antd';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getPlazaAgentById, getPlazaNewsItem, usePlazaState } from '../../../../../../../lib/device-plaza-data';

export default function DevicePlazaAgentNewsDetailPage() {
  const params = useParams<{ agentId: string; newsId: string }>();
  const router = useRouter();
  const state = usePlazaState();
  const agent = getPlazaAgentById(params.agentId, state);
  const news = getPlazaNewsItem(params.agentId, params.newsId, state);
  const [messageApi, contextHolder] = message.useMessage();

  if (!agent || !news) {
    return <Result status="404" title="未找到资讯" extra={<Link href="/plaza"><Button>广场</Button></Link>} />;
  }

  const currentIndex = agent.news.findIndex((item) => item.id === news.id);
  const nextNews = currentIndex >= 0 ? agent.news[currentIndex + 1] ?? agent.news[0] ?? null : null;

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <p className="device-page-title">{news.title}</p>
          <p className="device-page-subtle">{news.summary}</p>
          <div className="watch-status-pills" style={{ marginTop: 8 }}>
            <span className="watch-status-pill">{news.publishedAt}</span>
            <span className="watch-status-pill">{news.audioDuration}</span>
            <span className="watch-status-pill">{news.autoNext ? '自动下一条' : '手动下一条'}</span>
          </div>
        </div>

        <div className="watch-list-panel">
          <div className="watch-inline-head">
            <span>资讯内容</span>
            <span>{agent.shortTitle}</span>
          </div>
          <div className="device-mini-list">
            {news.paragraphs.map((paragraph, index) => (
              <div key={`${news.id}_${index + 1}`} className="device-mini-item watch-list-card">
                <div className="device-mini-item-title">
                  <span>第 {index + 1} 段</span>
                  {index === 0 ? <Tag color="blue">播报重点</Tag> : null}
                </div>
                <p className="device-mini-item-desc">{paragraph}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="watch-bottom-dock">
          <div className="device-action-row">
            <Button
              type="primary"
              block
              onClick={() => {
                messageApi.success('开始资讯播报，语音模式会自动朗读当前内容');
              }}
            >
              开始播报
            </Button>
            <Button
              block
              onClick={() => {
                if (nextNews) {
                  router.push(`/plaza/agents/${agent.id}/news/${nextNews.id}`);
                }
              }}
            >
              自动下一条
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
