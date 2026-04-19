'use client';

import { TeamOutlined } from '@ant-design/icons';
import { Button, Empty, Space, Tag } from 'antd';
import Link from 'next/link';
import { useDeviceTeamSnapshot } from '../../../../lib/device-team-data';

export default function DeviceTravelTeamListPage() {
  const { teams } = useDeviceTeamSnapshot();
  const travelTeams = teams.filter((team) => team.sourceType === '研学旅行推荐');

  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Space wrap>
              <Tag color="purple">研学旅行</Tag>
              <Tag color="blue">发给家长查看</Tag>
            </Space>
            <p className="device-page-title">研学旅行团队</p>
            <p className="device-page-subtle">查看可发送给家长的研学旅行团队信息，报名和购买在家长端完成。</p>
          </Space>
        </div>

        <div className="watch-list-panel">
          {travelTeams.length === 0 ? (
            <Empty description="暂无研学旅行团队" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <div className="device-mini-list">
              {travelTeams.map((team) => (
                <Link key={team.id} href={`/team/${team.id}`} className="device-card-link">
                  <div className="device-mini-item watch-list-card">
                    <div className="device-mini-item-title">
                      <Space size={6}>
                        <TeamOutlined />
                        <span>{team.name}</span>
                      </Space>
                      <Tag color="purple">查看详情</Tag>
                    </div>
                    <p className="device-mini-item-desc">{team.studyDate} · {team.days} 天 · {team.destination}</p>
                    <p className="device-mini-item-desc" style={{ marginTop: 4 }}>
                      {team.shareSummary ?? '可发送给家长，由家长查看详情并完成后续报名。'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="watch-bottom-dock">
          <div className="device-action-row">
            <Link href="/team">
              <Button block>返回团队</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
