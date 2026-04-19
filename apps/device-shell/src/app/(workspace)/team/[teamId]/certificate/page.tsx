'use client';

import { Button, Result, Space, Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { demoReports } from '../../../../../lib/device-demo-data';
import { useDeviceTeamSnapshot } from '../../../../../lib/device-team-data';

const { Paragraph } = Typography;

export default function DeviceTeamCertificatePage() {
  const params = useParams<{ teamId: string }>();
  const { teams } = useDeviceTeamSnapshot();
  const [messageApi, contextHolder] = message.useMessage();
  const team = teams.find((item) => item.id === params.teamId);
  const report = demoReports.find((item) => item.teamId === params.teamId);

  if (!team) {
    return <Result status="404" title="未找到研学证书" extra={<Link href="/team"><Button>更多团队</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space>
            <Tag color="gold">{team.sourceType === '研学旅行推荐' ? '发送给家长' : '研学证书'}</Tag>
            <Tag color="blue">{team.name}</Tag>
          </Space>
          <p className="device-page-title">{report?.certificateTitle ?? `${team.name} 证书`}</p>
          <p className="device-page-subtle">
            {team.sourceType === '研学旅行推荐' ? '当前仅做推荐分享，不在设备端完成购买。' : '证书与报告同步展示。'}
          </p>
        </Space>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">{team.sourceType === '研学旅行推荐' ? '推荐说明' : '证书说明'}</p>
        <Paragraph style={{ margin: 0, fontSize: 12 }}>
          {team.sourceType === '研学旅行推荐'
            ? team.shareSummary ?? '可发送给家长，由家长在小程序中查看和报名。'
            : '证书展示本次研学完成情况、所属团队和成长成果，可与报告一起回看。'}
        </Paragraph>
      </div>

      <div className="device-action-row">
        <Button
          type="primary"
          block
          onClick={() => messageApi.success(team.sourceType === '研学旅行推荐' ? '已生成发送给家长提示' : '已打开证书分享提示')}
        >
          {team.sourceType === '研学旅行推荐' ? '发送给家长' : '分享证书'}
        </Button>
        <Link href={report ? `/team/${team.id}/reports` : `/team/${team.id}`}>
          <Button block>{report ? '研学报告' : '团队详情'}</Button>
        </Link>
      </div>
    </div>
  );
}
