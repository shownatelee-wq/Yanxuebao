'use client';

import { Result } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useDeviceTeamSnapshot } from '../../../../../lib/device-team-data';
import { WatchHero, WatchSection, WatchInfoRow } from '../../../../../lib/watch-ui';

export default function DeviceTeamRankingsScopedPage() {
  const params = useParams<{ teamId: string }>();
  const { teams, details } = useDeviceTeamSnapshot();
  const team = teams.find((item) => item.id === params.teamId);
  const detail = params.teamId ? details[params.teamId] : undefined;

  if (!team || !detail) {
    return <Result status="404" title="未找到团队排行" extra={<Link href="/team"><span>更多团队</span></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <WatchHero title="团队排行" subtitle="分开查看本人个人排行和当前小组排行。" />
      <WatchSection title="我的排行摘要">
        <div className="device-detail-grid">
          <WatchInfoRow label="本人总得分" value={`${detail.myRank.score} 分`} />
          <WatchInfoRow label="本人名次" value={`第 ${detail.myRank.rank} 名`} />
          <WatchInfoRow label="小组总得分" value={`${detail.myGroupRank.score} 分`} />
          <WatchInfoRow label="小组名次" value={`第 ${detail.myGroupRank.rank} 名`} />
        </div>
      </WatchSection>

      <div className="device-plaza-grid">
        <Link href={`/team/${team.id}/rankings/personal`} className="device-plaza-tile">
          <strong style={{ fontSize: 12 }}>个人排行</strong>
          <span className="device-mini-item-desc">看本人总得分和所有学员排名</span>
        </Link>
        <Link href={`/team/${team.id}/rankings/groups`} className="device-plaza-tile">
          <strong style={{ fontSize: 12 }}>小组排行</strong>
          <span className="device-mini-item-desc">看所在小组和全部小组排名</span>
        </Link>
      </div>
    </div>
  );
}
