'use client';

import { Button, Result, Space, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { demoReports } from '../../../../../lib/device-demo-data';

const { Paragraph } = Typography;

export default function DeviceReportDetailPage() {
  const params = useParams<{ reportId: string }>();
  const report = demoReports.find((item) => item.id === params.reportId);

  if (!report) {
    return <Result status="404" title="未找到报告" extra={<Link href="/me"><Button>我的</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space>
            <Tag color="green">{report.status}</Tag>
            <Tag color="blue">研学报告</Tag>
          </Space>
          <p className="device-page-title">{report.title}</p>
          <p className="device-page-subtle">{report.publishedAt ?? '待发布'}</p>
        </Space>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">报告摘要</p>
        <Paragraph style={{ margin: 0, fontSize: 12 }}>{report.summary}</Paragraph>
      </div>

      <div className="device-action-row">
        <Link href="/growth">
          <Button type="primary" block>成长</Button>
        </Link>
        <Link href="/me">
          <Button block>我的</Button>
        </Link>
      </div>
    </div>
  );
}
