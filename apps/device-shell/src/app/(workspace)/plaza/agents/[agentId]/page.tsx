'use client';

import {
  BellOutlined,
  BookOutlined,
  NotificationOutlined,
  PushpinOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { Button, Result, Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import {
  getPlazaAgentById,
  markPlazaAgentVisited,
  togglePlazaAgentDesktop,
  togglePlazaSubscription,
  usePlazaState,
} from '../../../../../lib/device-plaza-data';
import { useCaptureShare } from '../../../../../lib/device-capture-share';

const { Paragraph, Text } = Typography;

export default function DevicePlazaAgentDetailPage() {
  const params = useParams<{ agentId: string }>();
  const state = usePlazaState();
  const item = getPlazaAgentById(params.agentId, state);
  const sharedAsset = useCaptureShare();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (params.agentId) {
      markPlazaAgentVisited(params.agentId);
    }
  }, [params.agentId]);

  if (!item) {
    return <Result status="404" title="未找到智能体" extra={<Link href="/plaza"><Button>广场</Button></Link>} />;
  }

  const latestNews = item.news[0] ?? null;
  const latestCourse = item.courses[0] ?? null;
  const latestChallenge = item.challenges[0] ?? null;
  const showSharedExpertCard = sharedAsset && sharedAsset.target === 'expert' && item.id === 'plaza_agent_03';

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <div className="device-plaza-hero">
            <div className={`device-agent-logo large accent-${item.accent}`}>{item.logo}</div>
            <div style={{ minWidth: 0 }}>
              <p className="device-page-title">{item.title}</p>
              <p className="device-page-subtle">{item.desc}</p>
            </div>
          </div>
          <div className="watch-status-pills" style={{ marginTop: 8 }}>
            <span className="watch-status-pill">{item.category}</span>
            <span className="watch-status-pill">{item.tag}</span>
            <span className="watch-status-pill">{item.desk ? '已加桌面' : '可加桌面'}</span>
            <span className="watch-status-pill">{item.subscribed ? '已订阅资讯' : '可订阅资讯'}</span>
          </div>
        </div>

        <div className="watch-list-panel">
          <div className="watch-inline-head">
            <span>智能体信息</span>
            <span>{item.shortTitle}</span>
          </div>
          <div className="device-mini-list">
            <div className="device-mini-item watch-list-card">
              <div className="device-mini-item-title">
                <span>适用场景</span>
                <Tag color="blue">{item.category}</Tag>
              </div>
              <div className="watch-status-pills">
                {item.scenes.map((scene) => (
                  <span key={scene} className="watch-status-pill">{scene}</span>
                ))}
              </div>
            </div>
            <div className="device-mini-item watch-list-card">
              <div className="device-mini-item-title">
                <span>资讯订阅</span>
                <Tag color={item.subscribed ? 'green' : 'default'}>{item.subscribed ? '已订阅' : '未订阅'}</Tag>
              </div>
              <Paragraph style={{ margin: 0, fontSize: 12 }}>{item.subscriptionSummary}</Paragraph>
            </div>
            {showSharedExpertCard ? (
              <div className={`device-capture-chat-card accent-${sharedAsset.accent ?? 'blue'}`}>
                <div className="device-capture-chat-thumb">
                  <span>{sharedAsset.previewLabel ?? sharedAsset.title}</span>
                  <em>{sharedAsset.type}</em>
                </div>
                <div>
                  <Text strong style={{ fontSize: 12 }}>我刚发给专家的{sharedAsset.type === '照片' ? '照片' : '视频'}</Text>
                  <Paragraph style={{ margin: '6px 0 0', fontSize: 11 }}>{sharedAsset.summary}</Paragraph>
                  {sharedAsset.recognizedNames?.length ? (
                    <div className="watch-status-pills" style={{ marginTop: 8 }}>
                      {sharedAsset.recognizedNames.map((name) => (
                        <span key={name} className="watch-status-pill">{name}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="watch-grid-panel long-grid">
          <div className="watch-inline-head">
            <span>功能入口</span>
            <span>资讯 / 课程 / 挑战</span>
          </div>
          <div className="device-plaza-grid">
            <Link href={`/plaza/agents/${item.id}/news`} className="device-plaza-tile">
              <BellOutlined style={{ fontSize: 18, color: '#2f6bff' }} />
              <Text strong style={{ fontSize: 12 }}>资讯订阅</Text>
            </Link>
            <Link href={`/plaza/agents/${item.id}/courses`} className="device-plaza-tile">
              <BookOutlined style={{ fontSize: 18, color: '#18b7a0' }} />
              <Text strong style={{ fontSize: 12 }}>专家课程</Text>
            </Link>
            <Link href={`/plaza/agents/${item.id}/challenges`} className="device-plaza-tile">
              <TrophyOutlined style={{ fontSize: 18, color: '#ff8a34' }} />
              <Text strong style={{ fontSize: 12 }}>难题挑战</Text>
            </Link>
            <button
              type="button"
              className="device-plaza-tile device-tile-button"
              onClick={() => {
                const nextAgent = togglePlazaAgentDesktop(item.id);
                messageApi.success(nextAgent?.desk ? '已添加到主屏桌面' : '已从主屏桌面移除');
              }}
            >
              <PushpinOutlined style={{ fontSize: 18, color: '#7a5cff' }} />
              <Text strong style={{ fontSize: 12 }}>{item.desk ? '移出桌面' : '添加桌面'}</Text>
            </button>
          </div>
        </div>

        <div className="watch-list-panel">
          <div className="watch-inline-head">
            <span>能力预览</span>
            <span>当前可用</span>
          </div>
          <div className="device-mini-list">
            {latestNews ? (
              <Link href={`/plaza/agents/${item.id}/news/${latestNews.id}`} className="device-card-link">
                <div className="device-mini-item watch-list-card">
                  <div className="device-mini-item-title">
                    <span>{latestNews.title}</span>
                    <Tag color="blue">资讯播报</Tag>
                  </div>
                  <p className="device-mini-item-desc">{latestNews.summary}</p>
                  <p className="device-mini-item-meta">{latestNews.publishedAt} · {latestNews.audioDuration} · {latestNews.autoNext ? '自动下一条' : '手动切换'}</p>
                </div>
              </Link>
            ) : null}
            {latestCourse ? (
              <Link href={`/plaza/agents/${item.id}/courses/${latestCourse.id}`} className="device-card-link">
                <div className="device-mini-item watch-list-card">
                  <div className="device-mini-item-title">
                    <span>{latestCourse.title}</span>
                    <div className="watch-home-tab-tags">
                      {latestCourse.isPreviewFree ? <Tag color="green">免费试听</Tag> : <Tag color="gold">精选课</Tag>}
                      <Tag color="blue">{latestCourse.progress}%</Tag>
                    </div>
                  </div>
                  <p className="device-mini-item-desc">{latestCourse.summary}</p>
                  <p className="device-mini-item-meta">{latestCourse.resumeHint}</p>
                </div>
              </Link>
            ) : null}
            {latestChallenge ? (
              <Link href={`/plaza/agents/${item.id}/challenges`} className="device-card-link">
                <div className="device-mini-item watch-list-card">
                  <div className="device-mini-item-title">
                    <span>{latestChallenge.title}</span>
                    <Tag color="orange">{latestChallenge.mode}</Tag>
                  </div>
                  <p className="device-mini-item-desc">{latestChallenge.summary}</p>
                  <p className="device-mini-item-meta">{latestChallenge.status}</p>
                </div>
              </Link>
            ) : null}
            {!latestNews && !latestCourse && !latestChallenge ? (
              <div className="device-mini-item watch-list-card">
                <p className="device-mini-item-desc" style={{ margin: 0 }}>这个智能体当前主要提供对话能力，后续会继续补充资讯、课程和挑战。</p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="watch-bottom-dock">
          <div className="device-action-row">
            <Link href={item.openPath}>
              <Button type="primary" block>{item.openPath === '/ai-draw' || item.openPath === '/ai' ? '打开智能体' : '开始对话'}</Button>
            </Link>
            <Button
              block
              onClick={() => {
                const nextAgent = togglePlazaSubscription(item.id);
                messageApi.success(nextAgent?.subscribed ? '已开启资讯订阅' : '已取消资讯订阅');
              }}
            >
              {item.subscribed ? '取消订阅' : '订阅资讯'}
            </Button>
          </div>
          <div className="device-action-row" style={{ marginTop: 10 }}>
            <Link href="/messages">
              <Button type="primary" block icon={<NotificationOutlined />}>订阅消息</Button>
            </Link>
            <Link href="/plaza">
              <Button block>广场</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
