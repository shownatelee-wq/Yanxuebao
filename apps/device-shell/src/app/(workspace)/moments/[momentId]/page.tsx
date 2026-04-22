'use client';

import { Button, Result, Space, Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { addMomentComment, toggleMomentLike, useDeviceSocialSnapshot } from '../../../../lib/device-social-state';
import { WatchSection, WatchActionButtons, WatchNextSteps } from '../../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceMomentDetailPage() {
  const params = useParams<{ momentId: string }>();
  const [messageApi, contextHolder] = message.useMessage();
  const { moments } = useDeviceSocialSnapshot();
  const item = moments.find((entry) => entry.id === params.momentId);

  if (!item) {
    return <Result status="404" title="未找到动态" extra={<Link href="/moments"><Button>返回朋友圈</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space wrap>
            <Tag color="blue">{item.author}</Tag>
            <Tag color="default">{item.createdAt}</Tag>
          </Space>
          <p className="device-page-title">动态详情</p>
          <p className="device-page-subtle">可以直接查看附件、点赞、评论或转发邀请卡。</p>
        </Space>
      </div>

      <WatchSection title="动态内容">
        <Paragraph style={{ margin: 0, fontSize: 12 }}>{item.content}</Paragraph>
        {item.attachments.length ? (
          <div className="device-moment-attachment-row" style={{ marginTop: 10 }}>
            {item.attachments.map((attachment) => (
              <Link key={attachment.id} href={attachment.path ?? '#'} className={`device-moment-attachment type-${attachment.type}`}>
                <strong>{attachment.label}</strong>
                <span>{attachment.previewLabel ?? attachment.linkType ?? attachment.type} · {attachment.summary}</span>
                <em>{attachment.ctaLabel ?? '查看'}</em>
              </Link>
            ))}
          </div>
        ) : null}
        <Paragraph type="secondary" style={{ margin: '8px 0 0', fontSize: 11 }}>
          点赞 {item.likes} · 评论 {item.comments}
        </Paragraph>
      </WatchSection>

      <WatchSection title="评论">
        <div className="device-mini-list">
          {item.commentList.map((comment) => (
            <div key={comment.id} className="device-mini-item">
              <div className="device-mini-item-title">
                <span>{comment.author}</span>
              </div>
              <p className="device-mini-item-desc">{comment.content}</p>
            </div>
          ))}
        </div>
      </WatchSection>

      <WatchSection title="互动操作">
        <div className="device-action-chip-row">
          <Button type={item.liked ? 'primary' : 'default'} onClick={() => toggleMomentLike(item.id)}>
            {item.liked ? '已点赞' : '点赞'}
          </Button>
          <Button
            onClick={() => {
              addMomentComment(item.id, '我也想一起挑战。');
              messageApi.success('已评论 1 条');
            }}
          >
            评论
          </Button>
          <Button onClick={() => messageApi.success('已生成团队/任务邀请卡')}>邀请加入</Button>
        </div>
      </WatchSection>

      <WatchNextSteps text="互动内容可同步到朋友圈和成长日记。" />
      <WatchActionButtons primary={{ label: '朋友圈', path: '/moments' }} secondary={{ label: '我的', path: '/me' }} />
    </div>
  );
}
