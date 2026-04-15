'use client';

import { Button, Result, Space, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { demoMessages } from '../../../../lib/device-demo-data';

const { Paragraph, Text } = Typography;

export default function DeviceMessageDetailPage() {
  const params = useParams<{ messageId: string }>();
  const item = demoMessages.find((entry) => entry.id === params.messageId);

  if (!item) {
    return <Result status="404" title="未找到消息" extra={<Link href="/messages"><Button>消息</Button></Link>} />;
  }

  const nextPath =
    item.type === 'broadcast'
      ? '/team'
      : item.type === 'group'
        ? '/group-chat'
        : item.type === 'subscription'
          ? item.targetPath ?? '/plaza'
        : item.type === 'system'
          ? '/growth'
          : '/tasks';
  const nextLabel =
    item.type === 'broadcast'
      ? '看团队'
      : item.type === 'group'
        ? '群聊'
        : item.type === 'subscription'
          ? '看订阅内容'
        : item.type === 'system'
          ? '成长'
          : '任务';
  const nextHint =
    item.type === 'broadcast'
      ? '导师广播会同步团队安排和集合提醒。'
      : item.type === 'group'
        ? '群消息会同步任务分工和小组沟通内容。'
      : item.type === 'subscription'
        ? '订阅消息会同步新的资讯、课程和挑战内容。'
      : item.type === 'system'
        ? '系统通知会同步成长记录、报告或日记更新。'
        : '家庭留言会同步任务或作品相关内容。';
  const typeLabel =
    item.type === 'broadcast'
      ? '导师广播'
      : item.type === 'group'
        ? '小组消息'
        : item.type === 'family'
          ? '家庭留言'
          : item.type === 'system'
            ? '系统通知'
            : '订阅消息';

  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Space>
              <Tag color="blue">{typeLabel}</Tag>
              {!item.read ? <Tag color="red">未读</Tag> : <Tag color="green">已读</Tag>}
            </Space>
            <p className="device-page-title">{item.title}</p>
            <div className="watch-status-pills">
              <span className="watch-status-pill">{item.from}</span>
              <span className="watch-status-pill">{item.sentAt}</span>
            </div>
          </Space>
        </div>

        <div className="watch-list-panel long-list">
          <div className="watch-inline-head">
            <span>消息内容</span>
            <span>{item.type === 'subscription' ? '订阅' : item.from}</span>
          </div>
          <Paragraph style={{ margin: 0, fontSize: 12 }}>{item.content}</Paragraph>
        </div>

        {(item.detailSections ?? []).map((section) => (
          <div key={section.title} className="watch-list-panel long-list">
            <div className="watch-inline-head">
              <span>{section.title}</span>
              <span>{item.title}</span>
            </div>
            <Paragraph style={{ margin: 0, fontSize: 12 }}>{section.content}</Paragraph>
          </div>
        ))}

        <div className="watch-list-panel long-list">
          <div className="watch-inline-head">
            <span>关联内容</span>
            <span>{nextLabel}</span>
          </div>
          <Text style={{ fontSize: 11 }}>{nextHint}</Text>
          {item.actionHint ? (
            <Paragraph style={{ marginTop: 8, marginBottom: 0, fontSize: 11, color: '#6a7a9b' }}>{item.actionHint}</Paragraph>
          ) : null}
        </div>

        <div className="watch-bottom-dock">
          <div className="device-action-row">
            <Link href={nextPath}>
              <Button type="primary" block>{nextLabel}</Button>
            </Link>
            <Link href="/messages">
              <Button block>消息</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
