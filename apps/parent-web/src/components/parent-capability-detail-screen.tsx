'use client';

import '@ant-design/v5-patch-for-react-19';
import { Button, Empty, Tag } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import { ParentRouteFallback } from './parent-route-fallback';
import {
  ParentAssessmentRecordCard,
  ParentCapabilityImprovementList,
  ParentGrowthSourceBreakdown,
  ParentRadarCard,
  buildCapabilityImprovementRadarItems,
  formatParentDateTime,
  getCapabilitySourceDescription,
  getCapabilitySourceLabel,
} from './parent-growth-ui';
import { ParentPhoneFrame, ParentSubpageShell, useParentSessionReady } from './parent-mobile-shell';
import { getCapabilityById, getCapabilityLevelColor, useParentStore } from '../lib/parent-store';

export function ParentCapabilityDetailScreen() {
  const params = useParams<{ capabilityId: string }>();
  const router = useRouter();
  const sessionReady = useParentSessionReady();
  const store = useParentStore();

  if (!sessionReady || !store.hydrated) {
    return <ParentRouteFallback label="正在进入能力详情" />;
  }

  if (!store.selectedStudent) {
    return (
      <ParentPhoneFrame>
        <ParentSubpageShell title="能力详情" subtitle="成长" onBack={() => router.push('/growth')}>
          <section className="parent-empty-guide onboarding">
            <strong>还没有可查看的学员能力</strong>
            <p>先添加学员并完成一次家长评测，成长页才会生成完整的能力档案。</p>
            <Button type="primary" onClick={() => router.push('/me/students/editor')}>
              去添加学员
            </Button>
          </section>
        </ParentSubpageShell>
      </ParentPhoneFrame>
    );
  }

  const capability = getCapabilityById(store.selectedStudent, params.capabilityId);
  if (!capability) {
    return (
      <ParentPhoneFrame>
        <ParentSubpageShell title="能力详情" subtitle="成长" onBack={() => router.push('/growth')}>
          <section className="parent-empty-guide">
            <Empty description="没有找到这项能力" />
            <Button type="primary" onClick={() => router.push('/growth')}>
              返回成长页
            </Button>
          </section>
        </ParentSubpageShell>
      </ParentPhoneFrame>
    );
  }

  const accentColor = getCapabilityLevelColor(capability.level);
  const studentAdjustmentRecords = store.state.capabilityAdjustmentRecords
    .filter((record) => record.studentId === store.selectedStudent?.id)
    .sort((left, right) => right.evaluatedAt.localeCompare(left.evaluatedAt));
  const latestAdjustmentRecord = studentAdjustmentRecords[0] ?? null;
  const improvementRadarItems = buildCapabilityImprovementRadarItems(store.selectedStudent.capabilities, latestAdjustmentRecord);
  const adjustmentRecords = store.state.capabilityAdjustmentRecords
    .filter((record) => record.studentId === store.selectedStudent?.id)
    .flatMap((record) =>
      record.elementRecords
        .filter((item) => item.elementKey === capability.elementKey)
        .map((item) => ({ ...item, record })),
    );

  return (
    <ParentPhoneFrame>
      <ParentSubpageShell
        title="能力详情"
        subtitle={store.selectedStudent.name}
        onBack={() => router.push('/growth')}
        footer={
          <div className="parent-split-footer">
            <Button block onClick={() => router.push('/growth?focus=reports')}>
              评测记录
            </Button>
            <Button block type="primary" onClick={() => router.push(`/growth/assessment?planeKey=${capability.planeKey}&capabilityId=${capability.id}`)}>
              家长评测
            </Button>
          </div>
        }
      >
        <section
          className="parent-capability-hero"
          style={{
            borderColor: `${accentColor}2a`,
            boxShadow: `0 18px 40px ${accentColor}10`,
          }}
        >
          <span className="parent-capability-hero-eyebrow">{capability.planeTitle}能力</span>
          <strong>{capability.elementKey}</strong>
          <div className="parent-capability-hero-pills">
            <span>{capability.planeTitle}</span>
            <span>{capability.score.toFixed(1)} 分</span>
            <span style={{ color: accentColor }}>{capability.level}</span>
          </div>
        </section>

        <div className="parent-card-list">
          <section className="parent-capability-info-card">
            <div className="parent-capability-info-head">
              <strong>当前指数</strong>
              <Tag
                color="blue"
                style={{
                  marginInlineEnd: 0,
                  color: getCapabilityLevelColor(capability.level),
                  borderColor: `${getCapabilityLevelColor(capability.level)}55`,
                  backgroundColor: `${getCapabilityLevelColor(capability.level)}14`,
                }}
              >
                {capability.score.toFixed(1)}
              </Tag>
            </div>
            <span>同龄平均 {capability.averageScore.toFixed(1)}</span>
            <em>最近更新 {formatParentDateTime(capability.recordedAt)}</em>
          </section>

          <section className="parent-capability-info-card">
            <div className="parent-capability-info-head">
              <strong>最近来源</strong>
              <Tag color="cyan" style={{ marginInlineEnd: 0 }}>
                {getCapabilitySourceLabel(capability.source)}
              </Tag>
            </div>
            <p>{getCapabilitySourceDescription(capability.source)}</p>
          </section>
        </div>

        <ParentGrowthSourceBreakdown level={capability.level} items={capability.sourceBreakdown} />

        <section className="parent-section">
          <div className="parent-section-head">
            <strong>研学报告评分记录详情</strong>
            <span>{adjustmentRecords.length} 条</span>
          </div>
          <div className="parent-card-list">
            {adjustmentRecords.length ? (
              adjustmentRecords.map((item) => (
                <ParentAssessmentRecordCard
                  key={`${item.record.id}_${item.elementKey}`}
                  record={item.record}
                  elementRecords={[item]}
                  onOpenReport={(record) => record.reportId && router.push(`/portfolio/reports/${record.reportId}`)}
                />
              ))
            ) : (
              <section className="parent-empty-guide compact">
                <Empty description="暂无调整记录" />
              </section>
            )}
          </div>
        </section>

        <ParentRadarCard
          title="能力提升雷达图"
          labels={improvementRadarItems.map((item) => item.elementKey)}
          values={improvementRadarItems.map((item) => item.afterIndex)}
          compareValues={improvementRadarItems.map((item) => item.beforeIndex)}
          valueLabel="最新指数"
          compareLabel="更新前指数"
          summary={
            latestAdjustmentRecord
              ? `${latestAdjustmentRecord.reportTitle}：按本次研学/评测增长最多的能力元素排序展示，不足 6 项时补充当前高分且无变化的能力元素。`
              : '暂无本次研学/评测调整记录，先展示当前分值最高的 6 项能力元素作为待观察基线。'
          }
        >
          <ParentCapabilityImprovementList items={improvementRadarItems} />
        </ParentRadarCard>
      </ParentSubpageShell>
    </ParentPhoneFrame>
  );
}
