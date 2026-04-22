'use client';

import { Button, Result, Space, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { getDeviceLearningWorkItems, getDeviceTaskById, getDeviceTaskDisplayMeta } from '../../../../lib/device-task-data';
import { useDeviceTeamSnapshot } from '../../../../lib/device-team-data';
import { WatchInfoRow } from '../../../../lib/watch-ui';

const { Paragraph, Text } = Typography;
const GAMEPLAY_LABELS = {
  speed_checkin: '竞速打卡',
  treasure_collect: '寻宝收集',
  creative_research: '创作研究',
  qa_research: '问答挑战',
  survey: '现场调查',
} as const;

function getResourceTag(resource: NonNullable<ReturnType<typeof getDeviceTaskById>>['resourcePacks'][number]) {
  if (resource.previewMode === 'ai') {
    return { color: 'cyan', label: 'AI资料' };
  }

  if (resource.previewMode === 'pdf') {
    return { color: 'purple', label: 'PDF资料' };
  }

  return { color: 'green', label: '图文资料' };
}

export default function DeviceTaskDetailPage() {
  const params = useParams<{ taskId: string }>();
  const searchParams = useSearchParams();
  const { teams } = useDeviceTeamSnapshot();
  const task = getDeviceTaskById(params.taskId);

  if (!task) {
    return <Result status="404" title="未找到研学活动" extra={<Link href="/tasks"><Button>返回任务</Button></Link>} />;
  }

  const teamId = searchParams.get('teamId') ?? '';
  const contextTeam = teamId ? teams.find((item) => item.id === teamId) : undefined;
  const isReadonlyQuery = searchParams.get('readonly') === '1';
  const isReadonlyContext =
    isReadonlyQuery && (!contextTeam || contextTeam.membershipStatus === '历史可查看' || contextTeam.lifecycleStatus === '已结束');
  const readonlySuffix = isReadonlyContext ? `?teamId=${teamId}&readonly=1` : '';
  const learningWorks = getDeviceLearningWorkItems(task.id);
  const firstSubmittedWork = learningWorks.find((item) => item.displayStatus === '已提交');
  const editorPath = `/tasks/new?taskId=${task.id}`;
  const readonlyWorkPath = (path: string) => (isReadonlyContext ? `${path}${path.includes('?') ? '&' : '?'}teamId=${teamId}&readonly=1` : path);
  const gameplayLabels = Array.from(new Set(task.taskSheets.map((sheet) => sheet.gameplayKind).filter(Boolean))).map(
    (kind) => GAMEPLAY_LABELS[kind as keyof typeof GAMEPLAY_LABELS],
  ).filter(Boolean);
  const displayMeta = getDeviceTaskDisplayMeta(task);

  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Space wrap>
              <Tag color={task.status === 'submitted' ? 'green' : 'blue'}>
                {task.status === 'submitted' ? '已完成' : task.status === 'todo' ? '待开始' : '进行中'}
              </Tag>
              <Tag color="cyan">{task.target}</Tag>
              <Tag color={displayMeta.categoryColor}>{displayMeta.categoryShortLabel}</Tag>
              <Tag color={displayMeta.sourceColor}>{displayMeta.taskKindLabel}</Tag>
              <Tag color="default">来源：{displayMeta.sourceLabel}</Tag>
            </Space>
            <p className="device-page-title">{task.title}</p>
            <Paragraph style={{ margin: 0, fontSize: 12 }}>{task.taskDescription}</Paragraph>
            <div className="watch-status-pills">
              <span className="watch-status-pill">学习作品 {task.worksSubmitted}/{task.worksRequired}</span>
              <span className="watch-status-pill">资源包 {task.resourcePacks.length}</span>
            </div>
            <Space wrap>
              <Tag color="cyan">{displayMeta.publisherLabel}</Tag>
              {task.source === 'assistant_ai' ? <Tag color="geekblue">AI助手生成</Tag> : null}
              {isReadonlyContext ? <Tag color="default">历史团队只读</Tag> : null}
              {gameplayLabels.map((label) => (
                <Tag key={label} color="gold">{label}</Tag>
              ))}
            </Space>
            <Space wrap>
              {task.capabilityTags.map((tag) => (
                <Tag key={tag} color="purple">{tag}</Tag>
              ))}
              <Tag color="blue">{task.capabilityTagSource === 'ai' ? 'AI 推荐' : '导师设置'}</Tag>
            </Space>
          </Space>
        </div>

        <div className="watch-list-panel">
          <div className="device-mini-list">
            <div className="device-mini-item watch-list-card">
              <Text strong style={{ fontSize: 12 }}>研学活动信息</Text>
              <div className="device-detail-grid" style={{ marginTop: 10 }}>
                <WatchInfoRow label="任务分类" value={displayMeta.categoryLabel} />
                <WatchInfoRow label="任务类型" value={displayMeta.taskKindLabel} />
                <WatchInfoRow label="任务来源" value={displayMeta.sourceLabel} />
                <WatchInfoRow label="发布方式" value={displayMeta.publisherLabel} />
                <WatchInfoRow label="活动对象" value={task.target} />
                <WatchInfoRow label="活动地点" value={task.infoSummary} />
                <WatchInfoRow label="时间要求" value={task.timeLimit} />
                <WatchInfoRow label="完成进度" value={`${task.worksSubmitted}/${task.worksRequired}`} />
              </div>
            </div>
            <div className="device-mini-item watch-list-card">
              <Text strong style={{ fontSize: 12 }}>活动说明</Text>
              <p className="device-mini-item-desc" style={{ marginTop: 8 }}>{task.intro}</p>
              <p className="device-mini-item-desc">{task.requirement}</p>
              {isReadonlyContext ? (
                <p className="device-mini-item-desc" style={{ color: '#8a6d3b' }}>
                  该任务来自已结束历史团队，仅支持查看任务、作品和资料，不能继续提交或修改。
                </p>
              ) : null}
            </div>
          </div>
          <div className="device-mini-item watch-list-card" style={{ marginTop: 10 }}>
            <div className="device-mini-item-title">
              <span>活动资源包</span>
              <Tag color="blue">{task.resourcePacks.length} 份</Tag>
            </div>
            <div className="device-mini-list" style={{ marginTop: 8 }}>
              {task.resourcePacks.map((resource) => (
                <Link key={resource.id} href={`/tasks/resources/${resource.id}`} className="device-card-link">
                  <div className="device-mini-item">
                    <div className="device-mini-item-title">
                      <span>{resource.title}</span>
                      <Tag color={getResourceTag(resource).color}>{getResourceTag(resource).label}</Tag>
                    </div>
                    <p className="device-mini-item-desc">{resource.summary}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="watch-list-panel">
          <div className="watch-inline-head">
            <span>学习作品</span>
            <span>{learningWorks.length} 项</span>
          </div>
          <div className="device-mini-list">
            {learningWorks.map((item) => (
              <Link key={item.sheetId} href={readonlyWorkPath(item.entryPath)} className="device-card-link">
                <div className="device-mini-item watch-list-card">
                  <div className="device-mini-item-title">
                    <span>{item.title}</span>
                    <Tag color={item.displayStatus === '已提交' ? 'green' : 'orange'}>{item.displayStatus}</Tag>
                  </div>
                  {item.gameplayKind ? (
                    <div className="device-action-chip-row" style={{ marginTop: 6 }}>
                      <Tag color="gold">{GAMEPLAY_LABELS[item.gameplayKind as keyof typeof GAMEPLAY_LABELS]}</Tag>
                    </div>
                  ) : null}
                  <p className="device-mini-item-desc">
                    {item.workCategory} · {item.workMode} · {item.topicType}
                  </p>
                  <p className="device-mini-item-desc">{item.requirement}</p>
                  {item.summary ? <p className="device-mini-item-desc">当前内容：{item.summary}</p> : null}
                  {item.updatedAt ? <p className="device-mini-item-desc">最近更新：{item.updatedAt}</p> : null}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="watch-bottom-dock">
          {isReadonlyContext ? (
            <div className="device-action-row">
              <Link href={firstSubmittedWork ? readonlyWorkPath(firstSubmittedWork.entryPath) : `/team/${teamId}/tasks`}>
                <Button type="primary" block>
                  查看作品
                </Button>
              </Link>
              <Link href={teamId ? `/team/${teamId}/tasks` : `/tasks/${task.id}${readonlySuffix}`}>
                <Button block>返回历史团队任务</Button>
              </Link>
            </div>
          ) : task.status === 'submitted' ? (
            <div className="device-action-row">
              <Link href={firstSubmittedWork?.entryPath ?? editorPath}>
                <Button type="primary" block>
                  查看作品
                </Button>
              </Link>
              <Link href={editorPath}>
                <Button block>重新填写作品</Button>
              </Link>
            </div>
          ) : (
            <div className="device-action-row single">
              <Link href={editorPath}>
                <Button type="primary" block>
                  填写当前学习作品
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
