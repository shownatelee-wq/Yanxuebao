'use client';

import '@ant-design/v5-patch-for-react-19';
import { MessageOutlined, SendOutlined } from '@ant-design/icons';
import { Badge, Button, Empty, Segmented, Tag, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ParentRouteFallback } from './parent-route-fallback';
import { ParentPhoneFrame, ParentSubpageShell, useParentSessionReady } from './parent-mobile-shell';
import { ParentCapabilityImprovementList, ParentRadarCard, buildCapabilityImprovementRadarItems } from './parent-growth-ui';
import {
  getMessageScopeLabel,
  getMessageTypeLabel,
  getPortfolioTimelineEntries,
  getSortedMessageCenterItems,
  getStudyDiaryTypeLabel,
  getTimelineEntryLabel,
  useParentStore,
} from '../lib/parent-store';

function formatDate(value: string) {
  return value.length > 10 ? value.slice(0, 16).replace('T', ' ') : value;
}

function getRelatedRoute(relatedKind?: 'work' | 'record' | 'report' | 'ai', relatedId?: string, recordId?: string) {
  if (relatedKind === 'work' && relatedId) {
    return `/portfolio/works/${relatedId}`;
  }
  if (relatedKind === 'report' && relatedId) {
    return `/portfolio/reports/${relatedId}`;
  }
  if (relatedKind === 'ai' && relatedId) {
    return `/portfolio/ai/${relatedId}`;
  }
  if (recordId) {
    return `/portfolio/records/${recordId}`;
  }
  return '/portfolio';
}

function DetailShell({
  title,
  subtitle,
  backTo,
  children,
  footer,
  rightSlot,
}: {
  title: string;
  subtitle: string;
  backTo: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  rightSlot?: React.ReactNode;
}) {
  const router = useRouter();
  const sessionReady = useParentSessionReady();
  const store = useParentStore();

  if (!sessionReady || !store.hydrated) {
    return <ParentRouteFallback label={`正在进入${title}`} />;
  }

  return (
    <ParentPhoneFrame>
      <ParentSubpageShell title={title} subtitle={subtitle} onBack={() => router.push(backTo)} rightSlot={rightSlot} footer={footer}>
        {children}
      </ParentSubpageShell>
    </ParentPhoneFrame>
  );
}

export function ParentPortfolioWorkDetailScreen({ workId }: { workId: string }) {
  const router = useRouter();
  const store = useParentStore();
  const work = store.state.portfolioWorks.find((item) => item.id === workId);
  const relatedTask = work ? store.state.familyTasks.find((item) => item.id === work.taskId) : null;
  const relatedAdjustment = work
    ? store.state.capabilityAdjustmentRecords.find(
        (record) =>
          record.studentId === work.studentId &&
          (record.sourceTitle.includes(work.taskTitle) ||
            (relatedTask ? record.teamOrTaskName === relatedTask.title : false)),
      )
    : null;
  const workStudent = work ? store.state.students.find((student) => student.id === work.studentId) ?? null : null;
  const workImprovementItems = buildCapabilityImprovementRadarItems(workStudent?.capabilities ?? [], relatedAdjustment);

  if (!work) {
    return (
      <DetailShell title="作品详情" subtitle="作品" backTo="/portfolio?panel=works">
        <section className="parent-empty-guide compact">
          <Empty description="没有找到作品记录" />
        </section>
      </DetailShell>
    );
  }

  return (
    <DetailShell
      title="作品详情"
      subtitle="学习作品"
      backTo="/portfolio?panel=works"
      footer={
        <div className="parent-split-footer">
          <Button block onClick={() => router.push('/portfolio?panel=works')}>
            返回作品
          </Button>
          {work.taskId ? (
            <Button block type="primary" onClick={() => router.push('/family-tasks')}>
              查看任务
            </Button>
          ) : null}
        </div>
      }
    >
      <section className="parent-detail-hero">
        <span className="parent-detail-eyebrow">{work.studyType}</span>
        <strong>{work.taskTitle}</strong>
        <p>{work.summary}</p>
        <div className="parent-detail-chip-row">
          <Tag>{work.studyDate}</Tag>
          <Tag>{work.workCategory}</Tag>
          <Tag color={work.status === 'scored' ? 'green' : 'gold'}>{work.status === 'scored' ? work.rating ?? '已评分' : '待评分'}</Tag>
        </div>
      </section>

      <section className="parent-section">
        <div className="parent-section-head">
          <strong>作品概况</strong>
          <span>{work.topicType}</span>
        </div>
        <div className="parent-mini-table">
          <div>
            <span>研学日期</span>
            <strong>{work.studyDate}</strong>
            <em>{work.studyType}</em>
          </div>
          <div>
            <span>作品类型</span>
            <strong>{work.workKind}</strong>
            <em>{work.completionMode || work.workMode}</em>
          </div>
          <div>
            <span>AI 建议分</span>
            <strong>{work.aiScore ?? '-'}</strong>
            <em>{relatedTask?.points ? `满分 ${relatedTask.points}` : '设备端同步'}</em>
          </div>
          <div>
            <span>家长评分</span>
            <strong>{work.parentScore ?? '-'}</strong>
            <em>{work.rating ?? '待评分'}</em>
          </div>
        </div>
      </section>

      <section className="parent-section">
        <div className="parent-section-head">
          <strong>当前内容</strong>
          <span>{formatDate(work.updatedAt || work.submittedAt)}</span>
        </div>
        <div className="parent-note-card">
          <p>{work.currentContent || work.textContent || work.summary}</p>
        </div>
      </section>

      <section className="parent-section">
        <div className="parent-section-head">
          <strong>学员提交内容</strong>
          <span>{work.formAnswers.length} 项</span>
        </div>
        <div className="parent-detail-stack">
          {work.formAnswers.map((answer) => (
            <div key={answer.fieldId} className="parent-answer-card">
              <strong>{answer.label}</strong>
              {answer.value ? <p>{Array.isArray(answer.value) ? answer.value.join('、') : answer.value}</p> : null}
              {answer.files?.length ? (
                <div className="parent-tag-row">
                  {answer.files.map((file) => (
                    <Tag key={file.id}>{file.title}</Tag>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="parent-section">
        <div className="parent-section-head">
          <strong>附件证据</strong>
          <span>{work.attachments.length} 项</span>
        </div>
        <div className="parent-tag-row">
          {work.attachments.map((attachment) => (
            <Tag key={attachment.id}>{attachment.title}</Tag>
          ))}
        </div>
      </section>

      {work.linkedFlashNotes.length ? (
        <section className="parent-section">
          <div className="parent-section-head">
            <strong>闪记引用</strong>
            <span>{work.linkedFlashNotes.length} 条</span>
          </div>
          <div className="parent-card-list">
            {work.linkedFlashNotes.map((note) => (
              <div key={note.id} className="parent-list-card static">
                <span>{note.title}</span>
                <em>{note.duration ?? note.type}</em>
                {note.transcript ? <p>{note.transcript}</p> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="parent-section">
        <div className="parent-section-head">
          <strong>评价意见</strong>
          <span>导师 / 家长</span>
        </div>
        <div className="parent-detail-stack">
          <div className="parent-note-card">
            <strong>导师评价</strong>
            <p>{work.mentorComment ?? '暂无导师评价'}</p>
          </div>
          <div className="parent-note-card">
            <strong>家长评价</strong>
            <p>{work.parentComment ?? '家长尚未填写评价'}</p>
          </div>
        </div>
      </section>

      {work.status === 'scored' ? (
        <ParentRadarCard
          title="能力提升雷达图"
          labels={workImprovementItems.map((item) => item.elementKey)}
          values={workImprovementItems.map((item) => item.afterIndex)}
          compareValues={workImprovementItems.map((item) => item.beforeIndex)}
          valueLabel="最新指数"
          compareLabel="更新前指数"
          summary="作品评分已回写能力元素，展示本次增长最多的能力元素。"
        >
          <ParentCapabilityImprovementList items={workImprovementItems} />
        </ParentRadarCard>
      ) : null}
    </DetailShell>
  );
}

export function ParentPortfolioAiDetailScreen({ recordId }: { recordId: string }) {
  const router = useRouter();
  const store = useParentStore();
  const record = store.state.portfolioAiRecords.find((item) => item.id === recordId);

  if (!record) {
    return (
      <DetailShell title="AI 记录" subtitle="作品" backTo="/portfolio">
        <section className="parent-empty-guide compact">
          <Empty description="没有找到 AI 记录" />
        </section>
      </DetailShell>
    );
  }

  const backTo = record.kind === 'qa' ? '/portfolio?panel=qa' : '/portfolio?panel=creation';

  return (
    <DetailShell
      title={record.kind === 'qa' ? 'AI问答详情' : 'AI创作详情'}
      subtitle="作品"
      backTo={backTo}
      footer={
        <div className="parent-split-footer">
          <Button block onClick={() => router.push(backTo)}>
            返回列表
          </Button>
          {record.relatedWorkId ? (
            <Button block type="primary" onClick={() => router.push(`/portfolio/works/${record.relatedWorkId}`)}>
              查看关联作品
            </Button>
          ) : null}
        </div>
      }
    >
      <section className="parent-detail-hero">
        <span className="parent-detail-eyebrow">{record.agentName}</span>
        <strong>{record.title}</strong>
        <p>{record.summary}</p>
        <div className="parent-detail-chip-row">
          <Tag>{record.kind === 'qa' ? 'AI问答' : 'AI创作'}</Tag>
          <Tag>{formatDate(record.createdAt)}</Tag>
          {record.workType ? <Tag>{record.workType}</Tag> : null}
        </div>
      </section>

      <section className="parent-section">
        <div className="parent-section-head">
          <strong>记录概况</strong>
          <span>{record.scene}</span>
        </div>
        <div className="parent-mini-table">
          <div>
            <span>智能体</span>
            <strong>{record.agentName}</strong>
            <em>{record.kind === 'qa' ? `提问 ${record.questionCount ?? 1} 次` : '创作记录'}</em>
          </div>
          <div>
            <span>关联状态</span>
            <strong>{record.relatedWorkId ? '已引用到作品' : '独立记录'}</strong>
            <em>{record.workType ?? '内容记录'}</em>
          </div>
        </div>
      </section>

      {record.prompt ? (
        <section className="parent-section">
          <div className="parent-section-head">
            <strong>创作主题 / 提示词</strong>
          </div>
          <div className="parent-note-card">
            <p>{record.prompt}</p>
          </div>
        </section>
      ) : null}

      <section className="parent-section">
        <div className="parent-section-head">
          <strong>{record.kind === 'qa' ? '问答内容' : '创作结果'}</strong>
          <span>{record.blocks.length} 条</span>
        </div>
        <div className="parent-detail-stack">
          {record.blocks.map((block, index) => (
            <div key={`${record.id}_${index}`} className={`parent-block-card type-${block.type}`}>
              <strong>
                {block.type === 'text' ? '输入' : block.type === 'answer' ? '输出' : block.type === 'attachment' ? '附件' : '图片'}
              </strong>
              <p>{block.content}</p>
            </div>
          ))}
        </div>
      </section>
    </DetailShell>
  );
}

export function ParentPortfolioReportDetailScreen({ reportId }: { reportId: string }) {
  const router = useRouter();
  const store = useParentStore();
  const [messageApi, messageHolder] = message.useMessage();
  const report = store.state.reports.find((item) => item.id === reportId);
  const reportStudent = report ? store.state.students.find((student) => student.id === report.studentId) ?? null : null;
  const reportAdjustment = report ? store.state.capabilityAdjustmentRecords.find((record) => record.reportId === report.id) ?? null : null;
  const reportImprovementItems = buildCapabilityImprovementRadarItems(reportStudent?.capabilities ?? [], reportAdjustment);

  if (!report) {
    return (
      <DetailShell title="报告详情" subtitle="作品" backTo="/portfolio">
        <section className="parent-empty-guide compact">
          <Empty description="没有找到报告记录" />
        </section>
      </DetailShell>
    );
  }

  return (
    <DetailShell
      title="报告详情"
      subtitle="作品"
      backTo="/portfolio"
      footer={
        <div className="parent-split-footer">
          <Button block onClick={() => router.push('/portfolio')}>
            返回作品
          </Button>
          <Button block onClick={() => messageApi.success('已生成研学报告朋友圈分享卡片')}>
            分享朋友圈
          </Button>
          <Button block type="primary" onClick={() => router.push('/growth?focus=reports')}>
            查看成长页
          </Button>
        </div>
      }
    >
      {messageHolder}
      <section className="parent-detail-hero">
        <span className="parent-detail-eyebrow">{report.recordType ?? report.planeTitle}</span>
        <strong>{report.title}</strong>
        <p>{report.summary}</p>
        <div className="parent-detail-chip-row">
          <Tag>{formatDate(report.evaluatedAt ?? report.date)}</Tag>
          <Tag>{report.type === 'study_report' ? '研学报告' : report.type === 'parent_review' ? '家长评测' : '学员自测'}</Tag>
          <Tag>{report.sourceType ?? '系统'}评测</Tag>
        </div>
      </section>

      <section className="parent-section">
        <div className="parent-section-head">
          <strong>评分记录信息</strong>
          <span>{report.recordType ?? report.planeTitle}</span>
        </div>
        <div className="parent-report-meta-grid">
          <div>
            <span>研学机构</span>
            <strong>{report.organizationName ?? '研学宝'}</strong>
          </div>
          <div>
            <span>团队/任务</span>
            <strong>{report.teamOrTaskName ?? report.planeTitle}</strong>
          </div>
          <div>
            <span>评测日期时间</span>
            <strong>{formatDate(report.evaluatedAt ?? report.date)}</strong>
          </div>
          <div>
            <span>评测人</span>
            <strong>{report.evaluator ?? '系统'}</strong>
          </div>
        </div>
      </section>

      <section className="parent-section">
        <div className="parent-section-head">
          <strong>能力结果</strong>
          <span>{report.rows.length} 项</span>
        </div>
        <div className="parent-mini-table">
          {report.rows.map((row) => (
            <div key={row.elementKey}>
              <span>{row.elementKey}</span>
              <strong>{row.latestIndex.toFixed(1)}</strong>
              <em>
                本次评测 {row.score.toFixed(1)} / 历史 {row.average.toFixed(1)}
              </em>
            </div>
          ))}
        </div>
      </section>

      <ParentRadarCard
        title="能力提升雷达图"
        labels={reportImprovementItems.map((item) => item.elementKey)}
        values={reportImprovementItems.map((item) => item.afterIndex)}
        compareValues={reportImprovementItems.map((item) => item.beforeIndex)}
        valueLabel="最新指数"
        compareLabel="更新前指数"
        summary="研学报告同步展示本次增长最多的 6 项能力元素，不足时补充高分无变化元素。"
      >
        <ParentCapabilityImprovementList items={reportImprovementItems} />
      </ParentRadarCard>
    </DetailShell>
  );
}

function getDiaryRelatedRoute(type: string, relatedId?: string) {
  if (!relatedId) {
    return null;
  }
  if (type === 'work') {
    return `/portfolio/works/${relatedId}`;
  }
  if (type === 'report' || type === 'assessment') {
    return `/portfolio/reports/${relatedId}`;
  }
  if (type === 'ai_qa' || type === 'ai_creation') {
    return `/portfolio/ai/${relatedId}`;
  }
  return null;
}

export function ParentStudyDiaryDetailScreen({ diaryId }: { diaryId: string }) {
  const router = useRouter();
  const store = useParentStore();
  const [messageApi, messageHolder] = message.useMessage();
  const diary = store.state.diaryItems.find((item) => item.id === diaryId);
  const relatedRoute = diary ? getDiaryRelatedRoute(diary.type, diary.relatedId) : null;

  if (!diary) {
    return (
      <DetailShell title="研学日记" subtitle="作品" backTo="/portfolio?panel=diary">
        <section className="parent-empty-guide compact">
          <Empty description="没有找到研学日记" />
        </section>
      </DetailShell>
    );
  }

  return (
    <DetailShell
      title="研学日记"
      subtitle="作品"
      backTo="/portfolio?panel=diary"
      footer={
        <div className="parent-split-footer">
          <Button block onClick={() => messageApi.success('已生成朋友圈分享卡片')}>
            分享朋友圈
          </Button>
          {relatedRoute ? (
            <Button block type="primary" onClick={() => router.push(relatedRoute)}>
              查看关联详情
            </Button>
          ) : null}
        </div>
      }
    >
      {messageHolder}
      <section className="parent-detail-hero">
        <span className="parent-detail-eyebrow">{getStudyDiaryTypeLabel(diary.type)}</span>
        <strong>{diary.title}</strong>
        <p>{diary.summary}</p>
        <div className="parent-detail-chip-row">
          <Tag>{formatDate(diary.date)}</Tag>
          <Tag>{diary.source}</Tag>
          {diary.rating ? <Tag color="green">{diary.rating}</Tag> : null}
        </div>
      </section>

      <section className="parent-section">
        <div className="parent-section-head">
          <strong>日记内容</strong>
          <span>{diary.media?.length ? `${diary.media.length} 项素材` : '文本记录'}</span>
        </div>
        <div className="parent-note-card">
          <p>{diary.content ?? diary.summary}</p>
        </div>
      </section>

      {diary.media?.length ? (
        <section className="parent-section">
          <div className="parent-section-head">
            <strong>关联素材</strong>
            <span>{diary.media.length} 项</span>
          </div>
          <div className="parent-tag-row">
            {diary.media.map((item) => (
              <Tag key={item}>{item}</Tag>
            ))}
          </div>
        </section>
      ) : null}
    </DetailShell>
  );
}

export function ParentPortfolioRecordDetailScreen({ entryId }: { entryId: string }) {
  const router = useRouter();
  const store = useParentStore();
  const [messageApi, messageHolder] = message.useMessage();
  const entries = useMemo(
    () => store.state.students.flatMap((student) => getPortfolioTimelineEntries(store.state, student.id)),
    [store.state],
  );
  const entry = entries.find((item) => item.id === entryId);
  const photoRecord = entry?.relatedId ? store.state.portfolioPhotos.find((item) => item.id === entry.relatedId) : null;
  const achievementRecord = entry?.relatedId ? store.state.portfolioAchievements.find((item) => item.id === entry.relatedId) : null;
  const diaryRecord = entry?.relatedId ? store.state.portfolioDeviceDiaries.find((item) => item.id === entry.relatedId) : null;
  const growthRecord = entry?.relatedId ? store.state.portfolioGrowthRecords.find((item) => item.id === entry.relatedId) : null;
  const relatedRoute = entry ? getRelatedRoute(entry.relatedKind, entry.relatedId, entry.id) : '/portfolio';

  if (!entry) {
    return (
      <DetailShell title="成长记录" subtitle="作品" backTo="/portfolio">
        <section className="parent-empty-guide compact">
          <Empty description="没有找到成长记录" />
        </section>
      </DetailShell>
    );
  }

  return (
    <DetailShell
      title="成长记录"
      subtitle="作品"
      backTo="/portfolio"
      footer={
        <div className="parent-split-footer">
          <Button block onClick={() => messageApi.success('已生成朋友圈分享卡片')}>
            分享朋友圈
          </Button>
          {entry.relatedKind && entry.relatedKind !== 'record' ? (
            <Button block type="primary" onClick={() => router.push(relatedRoute)}>
              查看关联详情
            </Button>
          ) : null}
        </div>
      }
    >
      {messageHolder}
      <section className="parent-detail-hero">
        <span className="parent-detail-eyebrow">{getTimelineEntryLabel(entry.entryType)}</span>
        <strong>{entry.title}</strong>
        <p>{entry.summary}</p>
        <div className="parent-detail-chip-row">
          <Tag>{formatDate(entry.occurredAt)}</Tag>
          <Tag>{entry.sourceLabel}</Tag>
          {entry.rating ? <Tag>{entry.rating}</Tag> : null}
        </div>
      </section>

      {photoRecord ? (
        <section className="parent-section">
          <div className="parent-section-head">
            <strong>照片素材</strong>
            <span>{photoRecord.attachments.length} 张</span>
          </div>
          <div className="parent-note-card">
            <p>{photoRecord.content}</p>
          </div>
          <div className="parent-attachment-grid">
            {photoRecord.attachments.map((attachment) => (
              <div key={attachment.id} className="parent-attachment-tile">
                {attachment.fileUrl && attachment.mimeType?.startsWith('image/') ? (
                  <span className="parent-attachment-preview" style={{ backgroundImage: `url(${attachment.fileUrl})` }} />
                ) : (
                  <span className="parent-attachment-file">{attachment.type}</span>
                )}
                <strong>{attachment.title}</strong>
                <em>{attachment.locationLabel ?? attachment.uploadedBy ?? photoRecord.sourceLabel}</em>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {achievementRecord ? (
        <section className="parent-section">
          <div className="parent-section-head">
            <strong>成就附件</strong>
            <span>{achievementRecord.achievementType}</span>
          </div>
          <div className="parent-note-card">
            <p>{achievementRecord.content}</p>
          </div>
          <div className="parent-attachment-grid">
            {achievementRecord.attachments.map((attachment) => (
              <div key={attachment.id} className="parent-attachment-tile">
                {attachment.fileUrl && attachment.mimeType?.startsWith('image/') ? (
                  <span className="parent-attachment-preview" style={{ backgroundImage: `url(${attachment.fileUrl})` }} />
                ) : (
                  <span className="parent-attachment-file">{attachment.mimeType?.includes('pdf') ? 'PDF' : attachment.type}</span>
                )}
                <strong>{attachment.title}</strong>
                <em>{attachment.uploadedBy ?? achievementRecord.uploadedBy}</em>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {diaryRecord ? (
        <section className="parent-section">
          <div className="parent-section-head">
            <strong>设备端内容</strong>
            <span>{diaryRecord.sourceLabel}</span>
          </div>
          <div className="parent-note-card">
            <p>{diaryRecord.content}</p>
          </div>
          <div className="parent-tag-row">
            {diaryRecord.attachments.map((attachment) => (
              <Tag key={attachment.id}>{attachment.title}</Tag>
            ))}
          </div>
        </section>
      ) : null}

      {growthRecord ? (
        <section className="parent-section">
          <div className="parent-section-head">
            <strong>变化说明</strong>
            <span>{growthRecord.category}</span>
          </div>
          <div className="parent-mini-table">
            <div>
              <span>当前值</span>
              <strong>{growthRecord.value}</strong>
              <em>{growthRecord.displaySource}</em>
            </div>
            <div>
              <span>变化量</span>
              <strong>{growthRecord.delta > 0 ? `+${growthRecord.delta}` : growthRecord.delta}</strong>
              <em>{growthRecord.sourceType}</em>
            </div>
          </div>
        </section>
      ) : null}
    </DetailShell>
  );
}

export function ParentMessageCenterScreen() {
  const router = useRouter();
  const store = useParentStore();
  const sessionReady = useParentSessionReady();
  const [filter, setFilter] = useState<'all' | 'team' | 'group' | 'student' | 'system' | 'sos'>('all');

  const messages = useMemo(() => getSortedMessageCenterItems(store.state, store.selectedStudent?.id ?? null), [store.state, store.selectedStudent]);
  const filteredMessages = messages.filter((item) => {
    if (filter === 'all') {
      return true;
    }
    if (filter === 'sos') {
      return item.type === 'sos';
    }
    return item.scope === filter;
  });

  if (!sessionReady || !store.hydrated) {
    return <ParentRouteFallback label="正在进入消息中心" />;
  }

  return (
    <ParentPhoneFrame>
      <ParentSubpageShell
        title="消息中心"
        subtitle="我的"
        onBack={() => router.push('/me')}
        rightSlot={
          <Button type="text" icon={<SendOutlined />} onClick={() => router.push('/me/messages/compose')}>
            发送
          </Button>
        }
      >
        <section className="parent-detail-hero compact">
          <span className="parent-detail-eyebrow">首页提醒与历史消息</span>
          <strong>消息中心</strong>
          <p>支持团队、小组、家庭、系统和 SoS 消息查看；存在关联记录时可直接跳转。</p>
        </section>

        <Segmented
          block
          value={filter}
          onChange={(value) => setFilter(value as typeof filter)}
          options={[
            { label: '全部', value: 'all' },
            { label: '团队', value: 'team' },
            { label: '小组', value: 'group' },
            { label: '家庭', value: 'student' },
            { label: '系统', value: 'system' },
            { label: 'SoS', value: 'sos' },
          ]}
        />

        <section className="parent-card-list">
          {filteredMessages.length ? (
            filteredMessages.map((item) => (
              <div key={item.id} className="parent-message-center-card">
                <div className="parent-message-center-meta">
                  <div>
                    <Tag color={item.type === 'sos' ? 'red' : item.type === 'system' ? 'blue' : 'green'}>{getMessageTypeLabel(item.type)}</Tag>
                    <Tag>{getMessageScopeLabel(item.scope)}</Tag>
                    {!item.read ? <Badge status="processing" /> : null}
                  </div>
                  <em>{formatDate(item.createdAt)}</em>
                </div>
                <strong>{item.title}</strong>
                <p>{item.content}</p>
                <div className="parent-message-center-actions">
                  <span>{item.from}</span>
                  {item.relatedKind && item.relatedId ? (
                    <Button size="small" onClick={() => router.push(getRelatedRoute(item.relatedKind, item.relatedId, item.id))}>
                      查看关联
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <section className="parent-empty-guide compact">
              <MessageOutlined />
              <strong>暂无消息</strong>
              <p>当前筛选下还没有消息记录。</p>
            </section>
          )}
        </section>
      </ParentSubpageShell>
    </ParentPhoneFrame>
  );
}
