'use client';

import { Button, Result, Space, Tag } from 'antd';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { DeviceRadarCard, DeviceSelfTestTable } from '../../../../../lib/device-growth-ui';
import { getSelfTestReportById, useGrowthState } from '../../../../../lib/device-growth-data';
import { WatchActionButtons, WatchHero, WatchSection } from '../../../../../lib/watch-ui';

export default function DeviceGrowthSelfTestReportPage() {
  const searchParams = useSearchParams();
  const state = useGrowthState();
  const reportId = searchParams.get('reportId') ?? '';
  const report = getSelfTestReportById(reportId, state);

  if (!report) {
    return <Result status="404" title="未找到自测报告" extra={<Link href="/growth/self-test"><Button>能力自测</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <WatchHero title="自测报告" subtitle={`${report.planeTitle} · ${report.completedAt}`}>
        <Space>
          <Tag color="blue">总分 {report.totalScore.toFixed(1)}</Tag>
          <Tag color="green">{report.elementCount} 项</Tag>
        </Space>
      </WatchHero>

      <WatchSection title="本次测试表">
        <DeviceSelfTestTable rows={report.rows} />
      </WatchSection>

      <DeviceRadarCard
        title="自测雷达图"
        labels={report.rows.map((item) => item.elementKey)}
        primaryValues={report.rows.map((item) => item.score)}
        compareValues={report.rows.map((item) => item.average)}
      />

      <DeviceRadarCard
        title="最新能力雷达图"
        labels={report.rows.map((item) => item.elementKey)}
        primaryValues={report.rows.map((item) => item.latestIndex)}
        compareValues={report.rows.map((item) => item.average)}
      />

      <WatchActionButtons primary={{ label: '看历史', path: '/growth/self-test/history' }} secondary={{ label: '再测一次', path: '/growth/self-test' }} />
    </div>
  );
}
