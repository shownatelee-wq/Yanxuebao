'use client';

import { Button, Empty, Result, Space, Tag } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getDeviceTaskList } from '../../../../../lib/device-task-data';
import { useDeviceTeamSnapshot } from '../../../../../lib/device-team-data';

export default function DeviceTeamTasksPage() {
  const params = useParams<{ teamId: string }>();
  const { teams } = useDeviceTeamSnapshot();
  const team = teams.find((item) => item.id === params.teamId);
  const tasks = getDeviceTaskList().filter((task) => task.taskType.includes('研学'));

  if (!team) {
    return <Result status="404" title="未找到团队任务" extra={<Link href="/team"><Button>更多团队</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <p className="device-page-title">团队任务</p>
          <p className="device-page-subtle">{team.name}</p>
          <div className="watch-status-pills">
            <span className="watch-status-pill">{team.lifecycleStatus}</span>
            <span className="watch-status-pill">{tasks.length} 个任务</span>
          </div>
        </Space>
      </div>

      <div className="device-compact-card">
        {tasks.length ? (
          <div className="device-mini-list">
            {tasks.map((task) => (
              <Link key={task.id} href={`/tasks/${task.id}`} className="device-card-link">
                <div className="device-mini-item">
                  <div className="device-mini-item-title">
                    <span>{task.title}</span>
                    <Tag color="blue">{task.target}</Tag>
                  </div>
                  <p className="device-mini-item-desc">{task.taskDescription}</p>
                  <div className="device-action-chip-row" style={{ marginTop: 8 }}>
                    {task.capabilityTags.map((tag) => (
                      <Tag key={tag} color="purple">{tag}</Tag>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Empty description="当前团队还没有任务" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>

      <div className="device-action-row">
        <Link href="/tasks">
          <Button type="primary" block>全部任务</Button>
        </Link>
        <Link href={`/team/${team.id}`}>
          <Button block>团队详情</Button>
        </Link>
      </div>
    </div>
  );
}
