'use client';

import { ReloadOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Empty, Space, Tag } from 'antd';
import Link from 'next/link';
import { useState } from 'react';
import { useDeviceTeamSnapshot, getVisibleTeamsForList } from '../../../lib/device-team-data';

function getLifecycleTag(status: string) {
  if (status === '已结束') {
    return { label: status, color: 'default' as const };
  }
  if (status === '待出行') {
    return { label: status, color: 'gold' as const };
  }
  if (status === '招募中') {
    return { label: status, color: 'blue' as const };
  }
  return { label: status, color: 'green' as const };
}

export default function DeviceTeamPage() {
  useDeviceTeamSnapshot();
  const [version, setVersion] = useState(0);
  const orderedTeams = getVisibleTeamsForList();
  const regularTeams = orderedTeams.filter((team) => team.sourceType !== '研学旅行推荐');

  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <p className="device-page-title">团队</p>
              <Button type="link" icon={<ReloadOutlined />} onClick={() => setVersion((value) => value + 1)}>
                刷新
              </Button>
            </Space>
            <div className="watch-status-pills">
              <span className="watch-status-pill">已加入 {regularTeams.filter((item) => item.membershipStatus === '已加入').length}</span>
              <span className="watch-status-pill">待审批 {regularTeams.filter((item) => item.membershipStatus === '待审批').length}</span>
              <span className="watch-status-pill">历史 {regularTeams.filter((item) => item.membershipStatus === '历史可查看').length}</span>
            </div>
          </Space>
        </div>

        <div className="watch-list-panel">
          {regularTeams.length === 0 ? (
            <Empty description="当前没有可见团队" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <div className="device-mini-list" key={version}>
              {regularTeams.map((team) => {
                const statusTag = getLifecycleTag(team.lifecycleStatus);
                return (
                  <Link key={team.id} href={`/team/${team.id}`} className="device-card-link">
                    <div className={`device-mini-item watch-list-card${team.membershipStatus === '已加入' && team.lifecycleStatus === '进行中' ? ' active' : ''}`}>
                      <div className="device-mini-item-title">
                        <Space size={6}>
                          <TeamOutlined />
                          <span>{team.name}</span>
                        </Space>
                        <Space size={6}>
                          <Tag color={statusTag.color}>{statusTag.label}</Tag>
                          <Tag color="cyan">{team.membershipStatus}</Tag>
                        </Space>
                      </div>
                      <p className="device-mini-item-desc">{team.studyDate} · {team.days} 天 · {team.destination}</p>
                      <p className="device-mini-item-desc" style={{ marginTop: 4 }}>
                        {team.organizationName ?? '未分配机构'} · {team.studentCount} 人 · {team.sourceType}
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
              <Button type="primary" block>扫码入团</Button>
            </Link>
            <Link href="/team/travel">
              <Button block>更多团队</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
