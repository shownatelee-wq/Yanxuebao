'use client';

import { ReloadOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Empty, Space, Tag } from 'antd';
import Link from 'next/link';
import { useState } from 'react';
import { useDeviceTeamSnapshot, getVisibleTeamsForList } from '../../../lib/device-team-data';

function getStatusTag(status: 'joined' | 'joinable' | 'ended') {
  if (status === 'ended') {
    return { label: '历史团队', color: 'default' as const };
  }
  return { label: '进行中', color: 'blue' as const };
}

export default function DeviceTeamPage() {
  const { teams } = useDeviceTeamSnapshot();
  const [version, setVersion] = useState(0);
  const orderedTeams = getVisibleTeamsForList();

  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <p className="device-page-title">团队列表</p>
              <Button type="link" icon={<ReloadOutlined />} onClick={() => setVersion((value) => value + 1)}>
                刷新
              </Button>
            </Space>
            <div className="watch-status-pills">
              <span className="watch-status-pill">已加入 {teams.length}</span>
              <span className="watch-status-pill">进行中 {teams.filter((item) => item.joinStatus !== 'ended').length}</span>
              <span className="watch-status-pill">历史 {teams.filter((item) => item.joinStatus === 'ended').length}</span>
            </div>
          </Space>
        </div>

        <div className="watch-list-panel">
          {orderedTeams.length === 0 ? (
            <Empty description="当前没有可见团队" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <div className="device-mini-list" key={version}>
              {orderedTeams.map((team) => {
                const statusTag = getStatusTag(team.joinStatus);
                return (
                  <Link key={team.id} href={`/team/${team.id}`} className="device-card-link">
                    <div className={`device-mini-item watch-list-card${team.joinStatus === 'joined' && team.isActive ? ' active' : ''}`}>
                      <div className="device-mini-item-title">
                        <Space size={6}>
                          <TeamOutlined />
                          <span>{team.name}</span>
                        </Space>
                        <Tag color={statusTag.color}>{statusTag.label}</Tag>
                      </div>
                      <p className="device-mini-item-desc">{team.studyDate} · {team.days} 天 · {team.destination}</p>
                      <p className="device-mini-item-desc" style={{ marginTop: 4 }}>
                        {team.organizationName ?? '未分配机构'} · {team.studentCount} 人 · {team.joinStatus === 'joined' ? '已加入' : team.joinStatus === 'joinable' ? '未加入' : '仅可查看'}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="watch-bottom-dock">
          <div className="device-action-row">
            <Link href="/team/join">
              <Button type="primary" block>加入团队</Button>
            </Link>
            <Link href="/home">
              <Button block>主屏</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
