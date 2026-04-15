'use client';

import { Button, Result, Space, Tag } from 'antd';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getSelfTestReportById, useGrowthState } from '../../../../../lib/device-growth-data';
import { WatchActionButtons, WatchHero, WatchNextSteps, WatchSection } from '../../../../../lib/watch-ui';

export default function DeviceGrowthSelfTestResultPage() {
  const searchParams = useSearchParams();
  const state = useGrowthState();
  const reportId = searchParams.get('reportId') ?? '';
  const report = getSelfTestReportById(reportId, state);

  if (!report) {
    return <Result status="404" title="未找到自测结果" extra={<Link href="/growth/self-test"><Button>能力自测</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <WatchHero title="自测结果" subtitle={`${report.planeTitle} 已完成`}>
        <Space>
          <Tag color="blue">总分 {report.totalScore.toFixed(1)}</Tag>
          <Tag color="green">{report.elementCount} 个能力元素</Tag>
        </Space>
      </WatchHero>
      <WatchSection title="结果概览">
        <div className="device-mini-list">
          <div className="device-mini-item">
            <div className="device-mini-item-title">
              <span>测试范围</span>
              <strong>{report.planeTitle}</strong>
            </div>
            <p className="device-mini-item-desc">本次共完成 {report.elementCount} 个能力元素的自测题目。</p>
          </div>
          <div className="device-mini-item">
            <div className="device-mini-item-title">
              <span>完成时间</span>
              <strong>{report.completedAt}</strong>
            </div>
            <p className="device-mini-item-desc">结果已同步到能力指数与自测历史中。</p>
          </div>
        </div>
      </WatchSection>
      <WatchNextSteps text="可查看完整自测报告，也可返回成长页继续查看能力指数变化。" />
      <WatchActionButtons primary={{ label: '自测报告', path: `/growth/self-test/report?reportId=${report.id}` }} secondary={{ label: '成长', path: '/growth' }} />
    </div>
  );
}
