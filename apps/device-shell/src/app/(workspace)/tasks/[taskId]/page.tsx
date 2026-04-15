'use client';

import { Button, Result, Space, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getDeviceLearningWorkItems, getDeviceTaskById } from '../../../../lib/device-task-data';
import { WatchInfoRow } from '../../../../lib/watch-ui';

const { Paragraph, Text } = Typography;

export default function DeviceTaskDetailPage() {
  const params = useParams<{ taskId: string }>();
  const task = getDeviceTaskById(params.taskId);

  if (!task) {
    return <Result status="404" title="未找到研学活动" extra={<Link href="/tasks"><Button>返回任务</Button></Link>} />;
  }

  const learningWorks = getDeviceLearningWorkItems(task.id);
  const firstPendingWork = learningWorks.find((item) => item.displayStatus === '未完成');
  const firstSubmittedWork = learningWorks.find((item) => item.displayStatus === '已提交');

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
              <Tag color="default">{task.taskType}</Tag>
            </Space>
            <p className="device-page-title">{task.title}</p>
            <Paragraph style={{ margin: 0, fontSize: 12 }}>{task.taskDescription}</Paragraph>
            <div className="watch-status-pills">
              <span className="watch-status-pill">学习作品 {task.worksSubmitted}/{task.worksRequired}</span>
              <span className="watch-status-pill">资源包 {task.resourcePacks.length}</span>
            </div>
          </Space>
        </div>

        <div className="watch-list-panel">
          <div className="device-mini-list">
            <div className="device-mini-item watch-list-card">
              <Text strong style={{ fontSize: 12 }}>研学活动信息</Text>
              <div className="device-detail-grid" style={{ marginTop: 10 }}>
                <WatchInfoRow label="活动类型" value={task.taskType} />
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
                      <Tag color={resource.previewMode === 'pdf' ? 'purple' : 'green'}>
                        {resource.previewMode === 'pdf' ? 'PDF 预览' : '图文资料'}
                      </Tag>
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
              <Link key={item.sheetId} href={item.entryPath} className="device-card-link">
                <div className="device-mini-item watch-list-card">
                  <div className="device-mini-item-title">
                    <span>{item.title}</span>
                    <Tag color={item.displayStatus === '已提交' ? 'green' : 'orange'}>{item.displayStatus}</Tag>
                  </div>
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
          <div className="device-action-row single">
            <Link href={firstPendingWork?.entryPath ?? firstSubmittedWork?.entryPath ?? `/tasks/${task.id}`}>
              <Button type="primary" block>
                {firstPendingWork ? '填写当前学习作品' : firstSubmittedWork ? '查看已提交作品' : '返回活动'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
