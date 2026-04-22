'use client';

import { ReloadOutlined } from '@ant-design/icons';
import { Button, Empty, Segmented, Space, Tag } from 'antd';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  getDeviceTaskDisplayMeta,
  getDeviceTaskList,
  type DeviceTaskCategoryFilter,
  useDeviceTaskSnapshot,
} from '../../../lib/device-task-data';

const GAMEPLAY_LABELS = {
  speed_checkin: '竞速打卡',
  treasure_collect: '寻宝收集',
  creative_research: '创作研究',
  qa_research: '问答挑战',
  survey: '现场调查',
} as const;

const CATEGORY_OPTIONS: Array<{ label: string; value: DeviceTaskCategoryFilter }> = [
  { label: '所有', value: 'all' },
  { label: '研学', value: 'study' },
  { label: '日常', value: 'daily' },
  { label: '项目', value: 'project' },
];

const CATEGORY_TAG_COLORS: Record<Exclude<DeviceTaskCategoryFilter, 'all'>, string> = {
  study: 'blue',
  daily: 'green',
  project: 'purple',
};

export default function DeviceTasksPage() {
  const [category, setCategory] = useState<DeviceTaskCategoryFilter>('all');
  const [target, setTarget] = useState<'个人' | '小组'>('个人');
  const snapshot = useDeviceTaskSnapshot();
  const tasks = useMemo(() => getDeviceTaskList(), [snapshot.tasks, snapshot.works]);

  const categoryTasks = useMemo(
    () => (category === 'all' ? tasks : tasks.filter((item) => item.category === category)),
    [category, tasks],
  );

  const filteredTasks = useMemo(
    () => categoryTasks.filter((item) => item.target === target),
    [categoryTasks, target],
  );

  const progress = useMemo(() => {
    const personal = categoryTasks.filter((item) => item.target === '个人');
    const group = categoryTasks.filter((item) => item.target === '小组');
    const current = filteredTasks;
    return {
      currentDone: current.filter((item) => item.status === 'submitted').length,
      currentTotal: current.length,
      personalDone: personal.filter((item) => item.status === 'submitted').length,
      personalTotal: personal.length,
      groupDone: group.filter((item) => item.status === 'submitted').length,
      groupTotal: group.length,
    };
  }, [categoryTasks, filteredTasks]);

  const currentCategoryLabel = CATEGORY_OPTIONS.find((item) => item.value === category)?.label ?? '所有';
  const currentCategoryColor = category === 'all' ? 'blue' : CATEGORY_TAG_COLORS[category];

  const getGameplayLabels = (task: (typeof tasks)[number]) =>
    Array.from(new Set(task.taskSheets.map((sheet) => sheet.gameplayKind).filter(Boolean)))
      .map((kind) => GAMEPLAY_LABELS[kind as keyof typeof GAMEPLAY_LABELS])
      .filter(Boolean);

  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
      <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <p className="device-page-title">任务</p>
          <div className="watch-status-pills">
            <span className="watch-status-pill">
              {currentCategoryLabel} · {target} {progress.currentDone}/{progress.currentTotal}
            </span>
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
          onChange={(value) => setCategory(value as DeviceTaskCategoryFilter)}
          options={CATEGORY_OPTIONS}
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
          <Tag color={currentCategoryColor}>{category === 'all' ? '全部任务' : currentCategoryLabel}</Tag>
          <Tag color="cyan">{target}任务</Tag>
          <Button type="link" icon={<ReloadOutlined />}>
            本地数据
          </Button>
        </div>
        {filteredTasks.length > 0 ? (
          <div className="device-mini-list">
            {filteredTasks.map((task) => {
              const displayMeta = getDeviceTaskDisplayMeta(task);
              const gameplayLabels = getGameplayLabels(task);

              return (
                <Link key={task.id} href={`/tasks/${task.id}`} className="device-card-link">
                  <div className="device-mini-item watch-list-card">
                    <div className="device-mini-item-title">
                      <span>
                        {task.sequence}. {task.title}
                      </span>
                      <Tag color={task.status === 'submitted' ? 'green' : 'blue'}>
                        {task.status === 'submitted' ? '已完成' : task.status === 'todo' ? '待开始' : '进行中'}
                      </Tag>
                    </div>
                    <div className="device-action-chip-row" style={{ marginTop: 8 }}>
                      <Tag color={displayMeta.categoryColor}>{displayMeta.categoryShortLabel}</Tag>
                      <Tag color={displayMeta.sourceColor}>{displayMeta.taskKindLabel}</Tag>
                      <Tag color="cyan">来源：{displayMeta.sourceLabel}</Tag>
                      <Tag color="default">{task.target}</Tag>
                      {task.source === 'assistant_ai' ? <Tag color="geekblue">AI助手生成</Tag> : null}
                    </div>
                    <p className="device-mini-item-desc" style={{ marginTop: 8 }}>{task.taskDescription}</p>
                    <p className="device-mini-item-desc">{displayMeta.publisherLabel} · {task.infoSummary}</p>
                    <div className="device-action-chip-row" style={{ marginTop: 8 }}>
                      {task.capabilityTags.map((tag) => (
                        <Tag key={tag} color="purple">{tag}</Tag>
                      ))}
                    </div>
                    <div className="device-action-chip-row" style={{ marginTop: 8 }}>
                      <Tag color="cyan">
                        学习作品 {task.worksSubmitted}/{task.worksRequired}
                      </Tag>
                      <Tag color="purple">{task.taskSheets.length} 项学习作品</Tag>
                      {gameplayLabels.length ? <Tag color="gold">含 {gameplayLabels.length} 类趣味玩法</Tag> : null}
                      <Tag color="blue">{task.capabilityTagSource === 'ai' ? 'AI 推荐标签' : '导师设置标签'}</Tag>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <Empty description={`暂无${currentCategoryLabel}${target}任务`} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>

      </div>
    </div>
  );
}
