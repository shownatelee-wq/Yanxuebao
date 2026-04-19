'use client';

import { Button, Result, Space, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { demoReports } from '../../../../../lib/device-demo-data';
import { useDeviceTeamSnapshot } from '../../../../../lib/device-team-data';

const { Paragraph } = Typography;

export default function DeviceTeamReportsPage() {
  const params = useParams<{ teamId: string }>();
  const { teams } = useDeviceTeamSnapshot();
  const team = teams.find((item) => item.id === params.teamId);
  const report = demoReports.find((item) => item.teamId === params.teamId);

  if (!team || !report) {
    return <Result status="404" title="未找到研学报告" extra={<Link href="/team"><Button>更多团队</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space>
            <Tag color="green">研学报告</Tag>
            <Tag color="blue">{team.name}</Tag>
          </Space>
          <p className="device-page-title">{report.title}</p>
          <p className="device-page-subtle">{report.publishedAt ?? '待发布'}</p>
        </Space>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">报告摘要</p>
        <Paragraph style={{ margin: 0, fontSize: 12 }}>{report.summary}</Paragraph>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">关联证书</p>
        <p className="device-mini-item-desc" style={{ margin: 0 }}>{report.certificateTitle ?? '证书待生成'}</p>
      </div>

      <div className="device-action-row">
        <Link href={`/team/${team.id}/certificate`}>
          <Button type="primary" block>研学证书</Button>
        </Link>
        <Link href={`/team/${team.id}`}>
          <Button block>团队详情</Button>
        </Link>
      </div>
    </div>
  );
}
