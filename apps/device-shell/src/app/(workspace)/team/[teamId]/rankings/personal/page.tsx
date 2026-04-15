'use client';

import { Space, Tag, Typography, Result, Button } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useDeviceTeamSnapshot } from '../../../../../../lib/device-team-data';
import { WatchHero, WatchSection, WatchInfoRow } from '../../../../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceTeamPersonalRankingsScopedPage() {
  const params = useParams<{ teamId: string }>();
  const { teams, details } = useDeviceTeamSnapshot();
  const team = teams.find((item) => item.id === params.teamId);
  const detail = params.teamId ? details[params.teamId] : undefined;

  if (!team || !detail) {
    return <Result status="404" title="未找到个人排行" extra={<Link href="/team"><Button>团队列表</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <WatchHero title="个人排行" subtitle="顶部显示本人总得分和名次，下方查看所有学员排行。" />
      <WatchSection title="我的个人排行">
        <div className="device-detail-grid">
          <WatchInfoRow label="本人总得分" value={`${detail.myRank.score} 分`} />
          <WatchInfoRow label="本人名次" value={`第 ${detail.myRank.rank} 名 / ${detail.myRank.total} 人`} />
        </div>
      </WatchSection>
      <WatchSection title="所有学员排行">
        <div className="device-mini-list">
          {detail.personalRankings.map((item, index) => (
            <div key={item.id} className="device-mini-item">
              <div className="device-mini-item-title">
                <span>{index + 1}. {item.name}</span>
                <Space size={6}>
                  <Tag color={item.name === detail.myMember.name ? 'green' : 'blue'}>{item.score} 分</Tag>
                  <Tag color="cyan">进度 {item.progress}%</Tag>
                </Space>
              </div>
              <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
                已完成 {item.completed} 项 · 待完成 {item.pending} 项
              </Paragraph>
            </div>
          ))}
        </div>
      </WatchSection>
      <div className="device-action-row">
        <Link href={`/team/${team.id}/rankings/groups`}>
          <Button type="primary" block>看小组排行</Button>
        </Link>
        <Link href={`/team/${team.id}/rankings`}>
          <Button block>返回排行</Button>
        </Link>
      </div>
    </div>
  );
}
