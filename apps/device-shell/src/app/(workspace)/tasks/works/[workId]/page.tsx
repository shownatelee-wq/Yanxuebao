'use client';

import { PlayCircleOutlined } from '@ant-design/icons';
import { Button, Result, Space, Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { DemoWorkAnswer, DemoWorkMedia } from '../../../../../lib/device-demo-data';
import { getDeviceTaskById, getDeviceTaskWorkById } from '../../../../../lib/device-task-data';
import { WatchInfoRow } from '../../../../../lib/watch-ui';

const { Paragraph } = Typography;

function formatAnswerValue(value: string[]) {
  return value.join('、');
}

function getAnswerKindLabel(answer: DemoWorkAnswer) {
  if (answer.kind === 'fill_blank') {
    return '文字';
  }
  if (answer.kind === 'single_choice') {
    return '单选';
  }
  if (answer.kind === 'multiple_choice') {
    return '多选';
  }
  if (answer.kind === 'image_upload') {
    return '图片附件';
  }
  if (answer.kind === 'video_upload') {
    return '视频附件';
  }
  if (answer.kind === 'audio_upload') {
    return '音频附件';
  }
  return '链接证据';
}

function getMediaTagColor(type: DemoWorkMedia['type']) {
  if (type === '照片' || type === '打卡证明' || type === 'AI识图' || type === 'AI绘图') {
    return 'green';
  }
  if (type === '音频') {
    return 'orange';
  }
  if (type === '链接' || type === 'AI回答') {
    return 'blue';
  }
  if (type === '闪记引用') {
    return 'cyan';
  }
  return 'purple';
}

export default function DeviceTaskWorkDetailPage() {
  const params = useParams<{ workId: string }>();
  const [messageApi, contextHolder] = message.useMessage();
  const work = getDeviceTaskWorkById(params.workId);
  const task = work ? getDeviceTaskById(work.taskId) : undefined;

  if (!work || !task) {
    return <Result status="404" title="未找到作品" extra={<Link href="/tasks"><Button>返回任务</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <p className="device-page-title">{work.title}</p>
            <div className="watch-status-pills">
              <span className="watch-status-pill">{task.title}</span>
              <span className="watch-status-pill">{work.workCategory}</span>
              <span className="watch-status-pill">{work.status}</span>
            </div>
            <Space wrap>
              {(work.capabilityTags ?? task.capabilityTags).map((tag) => (
                <Tag key={tag} color="purple">{tag}</Tag>
              ))}
            </Space>
          </Space>
        </div>

        <div className="watch-list-panel">
          <div className="device-compact-card">
            <p className="device-section-label">作品基本信息</p>
            <div className="device-detail-grid">
              <WatchInfoRow label="所属研学活动" value={task.title} />
              <WatchInfoRow label="作品类型" value={`${work.workCategory} · ${work.topicType}`} />
              <WatchInfoRow label="作品形式" value={work.workKind} />
              <WatchInfoRow label="完成方式" value={work.workMode} />
              <WatchInfoRow label="提交人" value={work.authorName} />
              <WatchInfoRow label="更新时间" value={work.updatedAt} />
              <WatchInfoRow label="重新填写" value={work.canResubmit ? '支持覆盖更新' : '当前仅查看'} />
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
                    <Tag color={answer.kind.includes('upload') ? 'cyan' : 'blue'}>{getAnswerKindLabel(answer)}</Tag>
                  </div>
                  {'value' in answer ? (
                    <p className="device-mini-item-desc">
                      {Array.isArray(answer.value) ? formatAnswerValue(answer.value) : answer.value}
                    </p>
                  ) : (
                    <div className="device-attachment-list compact">
                      {answer.files.map((file) => (
                        <div key={file.id} className="device-attachment-card">
                          <div className="device-attachment-main">
                            <span>{file.title}</span>
                            {file.duration ? <small>{file.duration}</small> : null}
                            {file.locationLabel ? <small>{file.locationLabel} · {file.capturedAt ?? '刚刚'}</small> : null}
                            {file.summary ? <small>{file.summary}</small> : null}
                          </div>
                          <div className="device-attachment-actions">
                            {file.type === '音频' || file.type === '视频' || file.type === 'AI视频' ? (
                              <Button
                                size="small"
                                icon={<PlayCircleOutlined />}
                                onClick={() => messageApi.success(`正在播放${file.title}`)}
                              >
                                播放
                              </Button>
                            ) : null}
                            {file.type === '链接' ? (
                              <Button size="small" onClick={() => messageApi.success('已打开 AI 探究链接演示')}>打开</Button>
                            ) : null}
                            <Tag color={getMediaTagColor(file.type)}>{file.type}</Tag>
                          </div>
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
            <p className="device-section-label">附件与证据</p>
            {(work.attachments ?? work.media).length ? (
              <div className="device-attachment-list">
                {(work.attachments ?? work.media).map((item) => (
                  <div key={item.id} className="device-attachment-card">
                    <div className="device-attachment-main">
                      <span>{item.title}</span>
                      {item.duration ? <small>{item.duration}</small> : null}
                      {item.type === '打卡证明' ? (
                        <small>{item.locationLabel ?? '定位待同步'} · {item.capturedAt ?? '刚刚'}</small>
                      ) : null}
                      {item.type === '闪记引用' ? <small>已关联到任务作品</small> : null}
                      {item.summary ? <small>{item.summary}</small> : null}
                    </div>
                    <div className="device-attachment-actions">
                      {item.type === '音频' || item.type === '视频' || item.type === 'AI视频' ? (
                        <Button size="small" icon={<PlayCircleOutlined />} onClick={() => messageApi.success(`正在播放${item.title}`)}>
                          播放
                        </Button>
                      ) : null}
                      {item.type === '链接' ? (
                        <Button size="small" onClick={() => messageApi.success('已打开 AI 探究链接演示')}>打开</Button>
                      ) : null}
                      <Tag color={getMediaTagColor(item.type)}>{item.type}</Tag>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="device-mini-item-desc" style={{ margin: 0 }}>当前作品没有额外附件。</p>
            )}
            {work.audioPreview ? (
              <div className="device-review-summary-item" style={{ marginTop: 10 }}>
                <div className="device-mini-item-title">
                  <span>已录制音频</span>
                  <Tag color="orange">{work.audioPreview.duration ?? '待播放'}</Tag>
                </div>
                <p className="device-mini-item-desc">{work.audioPreview.title}</p>
                <Button
                  size="small"
                  icon={<PlayCircleOutlined />}
                  onClick={() => messageApi.success('正在播放已录制声音')}
                >
                  播放
                </Button>
              </div>
            ) : null}
            {work.linkedFlashNotes?.length ? (
              <div className="device-review-summary-item" style={{ marginTop: 10 }}>
                <div className="device-mini-item-title">
                  <span>引用闪记</span>
                </div>
                <div className="device-mini-list" style={{ marginTop: 8 }}>
                  {work.linkedFlashNotes.map((item) => (
                    <div key={item.id} className="device-mini-item">
                      <div className="device-mini-item-title">
                        <span>{item.title}</span>
                        <Tag color={item.type === 'video_note' ? 'purple' : 'green'}>
                          {item.type === 'video_note' ? '视频闪记' : '语音闪记'}
                        </Tag>
                      </div>
                      <p className="device-mini-item-desc" style={{ margin: '4px 0 0' }}>
                        {[item.duration, item.photoCount ? `${item.photoCount}张照片` : '', item.transcript].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="watch-bottom-dock">
          <div className="device-action-row">
            <Link href={`/tasks/new?taskId=${task.id}&sheetId=${work.taskSheetId ?? ''}`}>
              <Button type="primary" block>{work.canResubmit ? '重新填写' : '查看原表单'}</Button>
            </Link>
            <Link href={`/tasks/${task.id}`}>
              <Button block>返回任务</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
