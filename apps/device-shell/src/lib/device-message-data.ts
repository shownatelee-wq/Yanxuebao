'use client';

import { useMemo } from 'react';
import { demoMessages, type DemoMessage, type DemoPlazaAgent } from './device-demo-data';
import { getPlazaState, usePlazaState } from './device-plaza-data';

function buildSubscriptionMessage(agent: DemoPlazaAgent, index: number): DemoMessage {
  const latestNews = agent.news[0] ?? null;
  const latestCourse = agent.courses[0] ?? null;
  const latestChallenge = agent.challenges[0] ?? null;

  const contentParts = [
    latestNews ? `资讯「${latestNews.title}」` : null,
    latestCourse ? `课程「${latestCourse.title}」` : null,
    latestChallenge ? `挑战「${latestChallenge.title}」` : null,
  ].filter(Boolean) as string[];

  const detailSections = [
    latestNews
      ? { title: '最新资讯', content: latestNews.summary }
      : null,
    latestCourse
      ? { title: '推荐课程', content: latestCourse.summary }
      : null,
    latestChallenge
      ? { title: '难题挑战', content: latestChallenge.summary }
      : null,
  ].filter(Boolean) as NonNullable<DemoMessage['detailSections']>;

  const targetPath = latestNews
    ? `/plaza/agents/${agent.id}/news/${latestNews.id}`
    : latestCourse
      ? `/plaza/agents/${agent.id}/courses/${latestCourse.id}`
      : latestChallenge
        ? `/plaza/agents/${agent.id}/challenges`
        : `/plaza/agents/${agent.id}`;

  return {
    id: `message_subscription_${agent.id}`,
    title: `${agent.title} 订阅更新`,
    content: `${agent.title} 推送了${contentParts.join('、')}。`,
    type: 'subscription',
    from: agent.title,
    sentAt: latestNews?.publishedAt ?? '今天 09:00',
    read: index >= 3,
    targetPath,
    detailSections,
    actionHint: '订阅消息来自你已订阅的智能体，适合从消息直接进入对应伴学内容、课程或挑战。',
  };
}

export function getDeviceMessages() {
  const plazaState = getPlazaState();
  const baseMessages = demoMessages.filter((item) => item.type !== 'subscription');
  const subscriptionMessages = plazaState.agents
    .filter((item) => item.subscribed)
    .map((item, index) => buildSubscriptionMessage(item, index));

  return [...subscriptionMessages, ...baseMessages];
}

export function useDeviceMessages() {
  const plazaState = usePlazaState();

  return useMemo(() => {
    const baseMessages = demoMessages.filter((item) => item.type !== 'subscription');
    const subscriptionMessages = plazaState.agents
      .filter((item) => item.subscribed)
      .map((item, index) => buildSubscriptionMessage(item, index));

    return [...subscriptionMessages, ...baseMessages];
  }, [plazaState]);
}
