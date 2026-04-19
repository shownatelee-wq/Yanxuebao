'use client';

import { Button, Result, Space, Tag } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useDeviceTeamSnapshot } from '../../../../../../lib/device-team-data';

export default function DeviceTeamGroupScopedDetailPage() {
  const params = useParams<{ teamId: string; groupId: string }>();
  const { teams, details } = useDeviceTeamSnapshot();
  const team = teams.find((item) => item.id === params.teamId);
  const detail = params.teamId ? details[params.teamId] : undefined;
  const group = detail?.groups.find((item) => item.id === params.groupId);

  if (!team || !detail || !group) {
    return <Result status="404" title="未找到小组" extra={<Link href="/team"><Button>更多团队</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <p className="device-page-title">{group.displayName}</p>
          <p className="device-page-subtle">{group.topic}</p>
          <Space>
            <Tag color="blue">{group.members.length} 人</Tag>
            <Tag color="cyan">{group.badgeEmoji} {group.badgeTitle}</Tag>
            {group.joined ? <Tag color="green">当前小组</Tag> : null}
          </Space>
        </Space>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">成员与岗位</p>
        <div className="device-mini-list">
          {group.members.map((member) => (
            <div key={member.id} className="device-mini-item">
              <div className="device-mini-item-title">
                <span>{member.name}</span>
                <Tag color={member.isCurrentStudent ? 'green' : 'blue'}>{member.roleName}</Tag>
              </div>
              {member.note ? <p className="device-mini-item-desc">{member.note}</p> : null}
            </div>
          ))}
        </div>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">小组功能</p>
        <div className="device-action-row" style={{ marginTop: 0 }}>
          <Link href={`/team/${team.id}/roles?groupId=${group.id}`}>
            <Button type="primary" block>岗位</Button>
          </Link>
          <Link href={`/team/${team.id}/badge?groupId=${group.id}`}>
            <Button block>队名队徽</Button>
          </Link>
        </div>
      </div>

      <div className="device-action-row">
        <Link href={`/team/${team.id}/groups`}>
          <Button block>返回小组</Button>
        </Link>
        <Link href={`/team/${team.id}`}>
          <Button block>团队详情</Button>
        </Link>
      </div>
    </div>
  );
}
