'use client';

import '@ant-design/v5-patch-for-react-19';
import { Button, Empty, Tag } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import { ParentRouteFallback } from './parent-route-fallback';
import { ParentRadarCard, ParentGrowthSourceBreakdown, formatParentDateTime, getCapabilitySourceDescription, getCapabilitySourceLabel } from './parent-growth-ui';
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

        <ParentRadarCard
          title={`${capability.elementKey}指标能力图`}
          labels={capability.indicatorDimensions.map((item) => item.label)}
          values={capability.indicatorDimensions.map((item) => item.score)}
          compareValues={capability.indicatorDimensions.map((item) => item.average)}
        />
      </ParentSubpageShell>
    </ParentPhoneFrame>
  );
}
