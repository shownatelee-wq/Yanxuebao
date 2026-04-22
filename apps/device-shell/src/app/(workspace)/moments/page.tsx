'use client';

import { LikeFilled, LikeOutlined, MessageOutlined, PlayCircleFilled } from '@ant-design/icons';
import { Button, Space, Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { useState } from 'react';
import {
  addMomentComment,
  type DeviceMomentAttachment,
  toggleMomentLike,
  useDeviceSocialSnapshot,
} from '../../../lib/device-social-state';

const { Paragraph } = Typography;

function isMediaAttachment(attachment: DeviceMomentAttachment) {
  return attachment.type === 'media' || attachment.type === 'image' || attachment.type === 'video';
}

export default function DeviceMomentsPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const { moments } = useDeviceSocialSnapshot();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [commentIds, setCommentIds] = useState<Set<string>>(() => new Set());

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <p className="device-page-title">朋友圈</p>
              <Link href="/moments/new">
                <Button type="link">
                  发布朋友圈
                </Button>
              </Link>
            </Space>
            <div className="watch-status-pills">
              <span className="watch-status-pill">{moments.length} 条动态</span>
              <span className="watch-status-pill">图片/视频/链接</span>
            </div>
          </Space>
        </div>
        <div className="watch-list-panel">
          <div className="device-mini-list">
            {moments.map((item) => {
              const expanded = expandedIds.has(item.id);
              const shouldCollapse = item.content.length > 36;
              const content = expanded || !shouldCollapse ? item.content : `${item.content.slice(0, 36)}...`;
              return (
                <div key={item.id} className="device-mini-item watch-list-card">
                  <div className="device-mini-item-title">
                    <span>{item.author}</span>
                    <Tag color="blue">{item.createdAt}</Tag>
                  </div>
                  <Paragraph style={{ margin: 0, fontSize: 12 }}>{content}</Paragraph>
                  {shouldCollapse ? (
                    <Button
                      type="link"
                      size="small"
                      style={{ padding: 0 }}
                      onClick={() =>
                        setExpandedIds((current) => {
                          const next = new Set(current);
                          if (next.has(item.id)) {
                            next.delete(item.id);
                          } else {
                            next.add(item.id);
                          }
                          return next;
                        })
                      }
                    >
                      {expanded ? '收起' : '全文'}
                    </Button>
                  ) : null}
                  {item.attachments.some(isMediaAttachment) ? (
                    <div className="device-moment-media-grid">
                      {item.attachments.filter(isMediaAttachment).map((attachment, index) => {
                        const isVideo = attachment.summary.includes('视频') || attachment.label.includes('视频');
                        return (
                          <Link
                            key={attachment.id}
                            href={attachment.path ?? `/moments/${item.id}`}
                            className={`device-photo-thumb tone-${index % 6}`}
                            aria-label={attachment.label}
                          >
                            {isVideo ? <PlayCircleFilled /> : null}
                            <span>{attachment.previewLabel ?? attachment.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                  {item.attachments.some((attachment) => !isMediaAttachment(attachment)) ? (
                    <div className="device-moment-attachment-row">
                      {item.attachments.filter((attachment) => !isMediaAttachment(attachment)).map((attachment) => (
                        <Link key={attachment.id} href={attachment.path ?? `/moments/${item.id}`} className={`device-moment-attachment type-${attachment.type}`}>
                          <strong>{attachment.label}</strong>
                          <span>{attachment.previewLabel ?? attachment.linkType ?? attachment.type} · {attachment.summary}</span>
                          <em>{attachment.ctaLabel ?? (attachment.type === 'task' ? '加入任务' : attachment.type === 'course' ? '加入课程' : '查看')}</em>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                  <div className="device-moment-toolbar">
                    <Button
                      size="small"
                      shape="circle"
                      type={item.liked ? 'primary' : 'default'}
                      icon={item.liked ? <LikeFilled /> : <LikeOutlined />}
                      onClick={() => toggleMomentLike(item.id)}
                      aria-label={item.liked ? '取消点赞' : '点赞'}
                    />
                    <span>{item.likes}</span>
                    <Button
                      size="small"
                      shape="circle"
                      icon={<MessageOutlined />}
                      onClick={() => {
                        setCommentIds((current) => {
                          const next = new Set(current);
                          if (next.has(item.id)) {
                            next.delete(item.id);
                          } else {
                            next.add(item.id);
                          }
                          return next;
                        });
                      }}
                      aria-label="展开评论"
                    />
                    <span>{item.comments}</span>
                  </div>
                  {commentIds.has(item.id) ? (
                    <div className="device-moment-comments">
                      {item.commentList.map((comment) => (
                        <p key={comment.id}>
                          <strong>{comment.author}</strong>
                          {comment.content}
                        </p>
                      ))}
                      <Button
                        size="small"
                        type="link"
                        onClick={() => {
                          addMomentComment(item.id, '我也想参加这个挑战。');
                          messageApi.success('已评论');
                        }}
                      >
                        快速评论
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
