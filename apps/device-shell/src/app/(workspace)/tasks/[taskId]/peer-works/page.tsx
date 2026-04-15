'use client';

import { Button, Empty, Result, Space, Tag } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getDevicePeerWorksByTaskId, getDeviceTaskById } from '../../../../../lib/device-task-data';

export default function DeviceTaskPeerWorksPage() {
  const params = useParams<{ taskId: string }>();
  const task = getDeviceTaskById(params.taskId);

  if (!task) {
    return <Result status="404" title="未找到研学活动" extra={<Link href="/tasks"><Button>返回任务</Button></Link>} />;
  }

  const peerWorks = getDevicePeerWorksByTaskId(task.id);

  return (
    <div className="device-page-stack">
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <p className="device-page-title">同组作品互评</p>
          <p className="device-page-subtle">{task.title}</p>
          <Space wrap>
            <Tag color="purple">当前活动同组作品</Tag>
            <Tag color="blue">{peerWorks.length} 份</Tag>
          </Space>
        </Space>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">作品列表</p>
        {peerWorks.length ? (
          <div className="device-mini-list">
            {peerWorks.map((work) => (
              <Link key={work.id} href={`/tasks/works/${work.id}/peer-review`} className="device-card-link">
                <div className="device-mini-item">
                  <div className="device-mini-item-title">
                    <span>{work.title}</span>
                    <Tag color="green">{work.status}</Tag>
                  </div>
                  <p className="device-mini-item-desc">
                    {work.authorName} · {work.groupName ?? '同组成员'} · {work.workCategory}
                  </p>
                  <p className="device-mini-item-desc">{work.summary}</p>
                  <p className="device-mini-item-desc">最近更新：{work.updatedAt}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Empty description="当前活动还没有可互评的同组作品" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>

      <div className="device-action-row single">
        <Link href={`/tasks/${task.id}`}>
          <Button type="primary" block>返回研学活动</Button>
        </Link>
      </div>
    </div>
  );
}
