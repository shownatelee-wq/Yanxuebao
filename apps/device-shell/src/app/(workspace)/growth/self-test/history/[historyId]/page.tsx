'use client';

import { Button, Result, Space, Tag } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { DeviceRadarCard, DeviceSelfTestTable } from '../../../../../../lib/device-growth-ui';
import { getSelfTestReportById, useGrowthState } from '../../../../../../lib/device-growth-data';
import { WatchActionButtons, WatchHero, WatchSection } from '../../../../../../lib/watch-ui';

export default function DeviceGrowthSelfTestHistoryDetailPage() {
  const params = useParams<{ historyId: string }>();
  const state = useGrowthState();
  const report = getSelfTestReportById(params.historyId, state);

  if (!report) {
    return <Result status="404" title="未找到自测记录" extra={<Link href="/growth/self-test/history"><Button>返回历史</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <WatchHero title="自测记录" subtitle={`${report.planeTitle} · ${report.completedAt}`}>
        <Space>
          <Tag color="blue">{report.reportType}</Tag>
          <Tag color="green">总分 {report.totalScore.toFixed(1)}</Tag>
        </Space>
      </WatchHero>
      <WatchSection title="历史测试表">
        <DeviceSelfTestTable rows={report.rows} />
      </WatchSection>
      <DeviceRadarCard
        title="历史雷达图"
        labels={report.rows.map((item) => item.elementKey)}
        primaryValues={report.rows.map((item) => item.latestIndex)}
        compareValues={report.rows.map((item) => item.average)}
      />
      <WatchActionButtons primary={{ label: '再测一次', path: '/growth/self-test' }} secondary={{ label: '返回历史', path: '/growth/self-test/history' }} />
    </div>
  );
}
