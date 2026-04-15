'use client';

import { Button, Result, Space, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getDeviceTaskById, getDeviceTaskWorkById } from '../../../../../lib/device-task-data';
import { WatchInfoRow } from '../../../../../lib/watch-ui';

const { Paragraph } = Typography;

function formatAnswerValue(value: string[]) {
  return value.join('、');
}

export default function DeviceTaskWorkDetailPage() {
  const params = useParams<{ workId: string }>();
  const work = getDeviceTaskWorkById(params.workId);
  const task = work ? getDeviceTaskById(work.taskId) : undefined;

  if (!work || !task) {
    return <Result status="404" title="未找到作品" extra={<Link href="/tasks"><Button>返回任务</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <p className="device-page-title">{work.title}</p>
            <div className="watch-status-pills">
              <span className="watch-status-pill">{task.title}</span>
              <span className="watch-status-pill">{work.workCategory}</span>
              <span className="watch-status-pill">{work.status}</span>
            </div>
          </Space>
        </div>

        <div className="watch-list-panel">
          <div className="device-compact-card">
            <p className="device-section-label">作品基本信息</p>
            <div className="device-detail-grid">
              <WatchInfoRow label="所属研学活动" value={task.title} />
              <WatchInfoRow label="作品类型" value={`${work.workCategory} · ${work.topicType}`} />
              <WatchInfoRow label="完成方式" value={work.workMode} />
              <WatchInfoRow label="提交人" value={work.authorName} />
              <WatchInfoRow label="更新时间" value={work.updatedAt} />
              <WatchInfoRow label="最终得分" value={work.teacherReview?.score != null ? `${work.teacherReview.score} 分` : '教师评分后生成'} />
              <WatchInfoRow
                label="评价进度"
                value={`自评${work.selfReview ? '已完成' : '待完成'} / 互评${work.peerReviews?.length ? '已完成' : '待完成'} / 教师${work.teacherReview?.status ?? '待评价'}`}
              />
            </div>
            <Paragraph style={{ margin: '10px 0 0', fontSize: 11 }}>{work.summary}</Paragraph>
          </div>
        </div>

        <div className="watch-list-panel">
          <div className="device-compact-card">
            <p className="device-section-label">作品内容</p>
            <div className="device-answer-list">
              {(work.formAnswers ?? []).map((answer) => (
                <div key={answer.fieldId} className="device-answer-item">
                  <div className="device-mini-item-title" style={{ marginBottom: 6 }}>
                    <span>{answer.label}</span>
                    <Tag color={answer.kind.includes('upload') ? 'cyan' : 'blue'}>
                      {answer.kind === 'fill_blank'
                        ? '填空'
                        : answer.kind === 'single_choice'
                          ? '单选'
                          : answer.kind === 'multiple_choice'
                            ? '多选'
                            : answer.kind === 'image_upload'
                              ? '图片附件'
                              : '视频附件'}
                    </Tag>
                  </div>
                  {'value' in answer ? (
                    <p className="device-mini-item-desc">
                      {Array.isArray(answer.value) ? formatAnswerValue(answer.value) : answer.value}
                    </p>
                  ) : (
                    <div className="device-attachment-list compact">
                      {answer.files.map((file) => (
                        <div key={file.id} className="device-attachment-card">
                          <span>{file.title}</span>
                          <Tag color={file.type === '照片' ? 'green' : 'purple'}>{file.type}</Tag>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {work.textContent ? (
              <div className="device-answer-note">
                <p className="device-resource-pdf-block-title">补充说明</p>
                <p className="device-mini-item-desc">{work.textContent}</p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="watch-list-panel">
          <div className="device-compact-card">
            <p className="device-section-label">附件</p>
            {work.media.length ? (
              <div className="device-attachment-list">
                {work.media.map((item) => (
                  <div key={item.id} className="device-attachment-card">
                    <span>{item.title}</span>
                    <Tag color={item.type === '照片' ? 'green' : 'purple'}>{item.type}</Tag>
                  </div>
                ))}
              </div>
            ) : (
              <p className="device-mini-item-desc" style={{ margin: 0 }}>当前作品没有额外附件。</p>
            )}
          </div>
        </div>

        <div className="watch-list-panel">
          <div className="device-compact-card">
            <p className="device-section-label">评价结果</p>
            <div className="device-review-summary-list">
              <div className="device-review-summary-item">
                <div className="device-mini-item-title">
                  <span>自评</span>
                  <Tag color={work.selfReview ? 'green' : 'default'}>{work.selfReview ? '已完成' : '待完成'}</Tag>
                </div>
                <p className="device-mini-item-desc">{work.selfReviewDetail?.summary ?? '提交作品后完成自评。'}</p>
              </div>
              <div className="device-review-summary-item">
                <div className="device-mini-item-title">
                  <span>互评</span>
                  <Tag color={work.peerReviews?.length ? 'green' : 'default'}>{work.peerReviews?.length ? '已完成' : '待完成'}</Tag>
                </div>
                <p className="device-mini-item-desc">
                  {work.peerReviewDetails?.[0]?.summary ?? '进入同组作品列表后，可查看同组成员作品并完成互评。'}
                </p>
              </div>
              <div className="device-review-summary-item">
                <div className="device-mini-item-title">
                  <span>教师评价</span>
                  <Tag color={work.teacherReview?.status === '已评价' ? 'green' : 'default'}>{work.teacherReview?.status ?? '待评价'}</Tag>
                </div>
                <p className="device-mini-item-desc">{work.teacherReview?.comment ?? '教师评价完成后会同步展示在这里。'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="watch-bottom-dock">
          <div className={`device-action-row${work.status === '已提交' ? '' : ' single'}`}>
            {work.status === '已提交' ? (
              <>
                <Link href={`/tasks/works/${work.id}/self-review`}>
                  <Button type="primary" block>自评</Button>
                </Link>
                <Link href={`/tasks/${task.id}/peer-works`}>
                  <Button block>互评</Button>
                </Link>
              </>
            ) : (
              <Link href={`/tasks/new?taskId=${task.id}&sheetId=${work.taskSheetId ?? ''}`}>
                <Button type="primary" block>继续填写</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
