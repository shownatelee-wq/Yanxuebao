'use client';

import { Button, Result, Space, Tag } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getDeviceTaskWorkById } from '../../../../../../lib/device-task-data';

export default function DeviceTaskWorkTeacherReviewPage() {
  const params = useParams<{ workId: string }>();
  const work = getDeviceTaskWorkById(params.workId);

  if (!work) {
    return <Result status="404" title="未找到作品" extra={<Link href="/tasks"><Button>返回任务</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <p className="device-page-title">教师评价</p>
          <p className="device-page-subtle">{work.title}</p>
          <Space>
            <Tag color="blue">{work.topicType}</Tag>
            <Tag color={work.teacherReview?.status === '已评价' ? 'green' : 'default'}>{work.teacherReview?.status ?? '待评价'}</Tag>
          </Space>
        </Space>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">评价结果</p>
        <p className="device-mini-item-desc" style={{ margin: 0 }}>
          {work.teacherReview?.status === '已评价'
            ? `评分 ${work.teacherReview.score ?? 0} 分 · ${work.teacherReview.comment ?? '已完成教师评价。'}`
            : '教师评价完成后会在这里显示评分和评语。'}
        </p>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">成长变化</p>
        <p className="device-mini-item-desc" style={{ margin: 0 }}>
          成长值 {work.growthValueDelta ?? 0} · 能力评分 +{work.capabilityScoreDelta ?? 0}
        </p>
      </div>

      <div className="device-action-row">
        <Link href={`/tasks/works/${work.id}`}>
          <Button type="primary" block>作品详情</Button>
        </Link>
        <Link href={`/tasks/${work.taskId}`}>
          <Button block>研学活动</Button>
        </Link>
      </div>
    </div>
  );
}
