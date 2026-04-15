'use client';

import { Button, Result, Space, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getDeviceTaskSheetById, getDeviceTaskWorksBySheetId } from '../../../../../lib/device-task-data';

const { Paragraph } = Typography;

export default function DeviceTaskSheetDetailPage() {
  const params = useParams<{ sheetId: string }>();
  const result = getDeviceTaskSheetById(params.sheetId);
  const task = result?.task;
  const sheet = result?.sheet;
  const relatedWorks = getDeviceTaskWorksBySheetId(params.sheetId);

  if (!task || !sheet) {
    return <Result status="404" title="未找到学习作品" extra={<Link href="/tasks"><Button>返回任务</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space wrap>
            <Tag color="blue">{sheet.topicType}</Tag>
            <Tag color="cyan">{sheet.workMode}</Tag>
            <Tag color={sheet.status === '已完成' ? 'green' : sheet.status === '进行中' ? 'blue' : 'default'}>{sheet.status}</Tag>
          </Space>
          <p className="device-page-title">{sheet.title}</p>
          <p className="device-page-subtle">{task.title}</p>
        </Space>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">学习作品要求</p>
        <Paragraph style={{ margin: 0, fontSize: 12 }}>{sheet.requirement}</Paragraph>
        <div className="watch-status-pills" style={{ marginTop: 10 }}>
          {sheet.mediaTypes.map((item) => (
            <span key={item} className="watch-status-pill">{item}</span>
          ))}
        </div>
        <div className="device-action-chip-row" style={{ marginTop: 10 }}>
          <Tag color={sheet.submissionStatus === '已提交' ? 'green' : sheet.submissionStatus === '待提交' ? 'orange' : 'default'}>
            {sheet.submissionStatus}
          </Tag>
          <Tag color="purple">{sheet.reviewStatus}</Tag>
        </div>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">已填写内容</p>
        <div className="device-mini-list">
          {relatedWorks.length ? (
            relatedWorks.map((work) => (
              <Link key={work.id} href={`/tasks/works/${work.id}`} className="device-card-link">
                <div className="device-mini-item">
                  <div className="device-mini-item-title">
                    <span>{work.title}</span>
                    <Tag color={work.status === '已提交' ? 'green' : 'orange'}>{work.status}</Tag>
                  </div>
                  <Paragraph style={{ margin: 0, fontSize: 11 }} type="secondary">
                    {work.summary}
                  </Paragraph>
                </div>
              </Link>
            ))
          ) : (
            <Paragraph style={{ margin: 0, fontSize: 11 }} type="secondary">
              暂时还没有填写内容。
            </Paragraph>
          )}
        </div>
      </div>

      <div className="device-action-row">
        <Link href={`/tasks/new?taskId=${task.id}&sheetId=${sheet.id}`}>
          <Button type="primary" block>{relatedWorks.length ? '继续填写' : '填写作品'}</Button>
        </Link>
        <Link href={`/tasks/${task.id}`}>
          <Button block>研学活动</Button>
        </Link>
      </div>
    </div>
  );
}
