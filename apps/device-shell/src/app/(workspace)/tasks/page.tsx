'use client';

import { ReloadOutlined } from '@ant-design/icons';
import { Button, Empty, Segmented, Space, Tag } from 'antd';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { getDemoDraft } from '../../../lib/demo-draft';
import { getDeviceTaskList } from '../../../lib/device-task-data';

export default function DeviceTasksPage() {
  const [category, setCategory] = useState<'study' | 'daily' | 'project'>('study');
  const [target, setTarget] = useState<'个人' | '小组'>('个人');
  const draft = getDemoDraft();
  const tasks = useMemo(() => getDeviceTaskList(), []);

  const progress = useMemo(() => {
    const personal = tasks.filter((item) => item.target === '个人');
    const group = tasks.filter((item) => item.target === '小组');

    return {
      personalDone: personal.filter((item) => item.status === 'submitted').length,
      personalTotal: personal.length,
      groupDone: group.filter((item) => item.status === 'submitted').length,
      groupTotal: group.length,
    };
  }, [tasks]);

  const filteredTasks = useMemo(
    () => tasks.filter((item) => item.category === category && item.target === target),
    [category, target, tasks],
  );

  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
      <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <p className="device-page-title">任务</p>
          <div className="watch-status-pills">
            <span className="watch-status-pill">
              个人 {progress.personalDone}/{progress.personalTotal}
            </span>
            <span className="watch-status-pill">
              小组 {progress.groupDone}/{progress.groupTotal}
            </span>
          </div>
        </Space>
      </div>

      <div className="watch-segment-wrap">
        <Segmented
          block
          value={category}
          onChange={(value) => setCategory(value as 'study' | 'daily' | 'project')}
          options={[
            { label: '研学任务', value: 'study' },
            { label: '日常任务', value: 'daily' },
            { label: '项目任务', value: 'project' },
          ]}
        />
        <div style={{ marginTop: 10 }}>
          <Segmented
            block
            value={target}
            onChange={(value) => setTarget(value as '个人' | '小组')}
            options={[
              { label: '个人任务', value: '个人' },
              { label: '小组任务', value: '小组' },
            ]}
          />
        </div>
      </div>

      <div className="watch-list-panel">
        <div className="device-page-toolbar" style={{ marginBottom: 8 }}>
          <Tag color="blue">研学活动</Tag>
          <Button type="link" icon={<ReloadOutlined />}>
            本地数据
          </Button>
        </div>
        {filteredTasks.length > 0 ? (
          <div className="device-mini-list">
            {filteredTasks.map((task) => (
              <Link key={task.id} href={`/tasks/${task.id}`} className="device-card-link">
                <div className="device-mini-item watch-list-card">
                  <div className="device-mini-item-title">
                    <span>
                      {task.sequence}. {task.title}
                    </span>
                    <Space size={6}>
                      <Tag color="default">{task.target}</Tag>
                      <Tag color={task.status === 'submitted' ? 'green' : 'blue'}>
                        {task.status === 'submitted' ? '已完成' : task.status === 'todo' ? '待开始' : '进行中'}
                      </Tag>
                    </Space>
                  </div>
                  <p className="device-mini-item-desc">{task.taskType} · {task.infoSummary}</p>
                  <p className="device-mini-item-desc">{task.taskDescription}</p>
                  <div className="device-action-chip-row" style={{ marginTop: 8 }}>
                    <Tag color="cyan">
                      学习作品 {task.worksSubmitted}/{task.worksRequired}
                    </Tag>
                    <Tag color="purple">{task.taskSheets.length} 项学习作品</Tag>
                    <Tag color="blue">分值 {task.score ?? 0}</Tag>
                    <Tag color={task.rating === 'A' ? 'green' : task.rating ? 'gold' : 'default'}>
                      评级 {task.rating ?? '待评'}
                    </Tag>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Empty description="当前分类没有研学活动" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>

      {draft ? (
        <div className="watch-list-panel">
          <p className="device-section-label">待提交草稿</p>
          <div className="device-mini-item watch-list-card">
            <div className="device-mini-item-title">
              <span>{draft.title}</span>
              <Tag color="blue">{draft.source}</Tag>
            </div>
            <p className="device-mini-item-desc" style={{ margin: 0 }}>
              {draft.content}
            </p>
          </div>
          <div className="device-action-row" style={{ marginTop: 10 }}>
            <Link href="/tasks/new">
              <Button type="primary" block>
                填写作品
              </Button>
            </Link>
            <Link href="/capture">
              <Button block>采集</Button>
            </Link>
          </div>
        </div>
      ) : null}

      <div className="watch-bottom-dock">
      <div className="device-action-row">
        <Link href="/capture">
          <Button type="primary" block>去拍拍</Button>
        </Link>
        <Link href="/tasks/new">
          <Button block>填写作品</Button>
        </Link>
      </div>
      </div>
      </div>
    </div>
  );
}
