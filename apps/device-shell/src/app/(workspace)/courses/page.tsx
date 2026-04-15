'use client';

import { BookOutlined } from '@ant-design/icons';
import { Button, Empty, Progress, Segmented, Space, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { getLatestResumableCourse, useCourseState, useFilteredPurchasedCourses } from '../../../lib/device-course-data';

const { Paragraph } = Typography;

export default function DeviceCoursesPage() {
  const [filter, setFilter] = useState<'all' | '视频' | '音频' | '难题挑战'>('all');
  const state = useCourseState();
  const courses = useFilteredPurchasedCourses(filter);
  const latestCourse = useMemo(() => getLatestResumableCourse(state), [state]);
  const completedCount = useMemo(() => state.courses.filter((course) => course.purchased && course.progress >= 100).length, [state.courses]);

  return (
    <div className="device-page-stack">
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space>
            <BookOutlined />
            <Tag color="blue">我的课程</Tag>
          </Space>
          <p className="device-page-title">课程列表</p>
          <p className="device-page-subtle">这里只展示家长已购买并同步到学员端的课程，试听课程仍保留在广场智能体里。</p>
          <div className="watch-status-pills">
            <span className="watch-status-pill">我的课程 {state.courses.filter((course) => course.purchased).length}</span>
            <span className="watch-status-pill">已完成 {completedCount}</span>
            <span className="watch-status-pill">{latestCourse ? `最近续播 ${latestCourse.lastPositionLabel}` : '暂未开始学习'}</span>
          </div>
        </Space>
      </div>

      <div className="device-compact-card">
        <Segmented
          block
          value={filter}
          onChange={(value) => setFilter(value as 'all' | '视频' | '音频' | '难题挑战')}
          options={[
            { label: '全部', value: 'all' },
            { label: '视频', value: '视频' },
            { label: '音频', value: '音频' },
            { label: '挑战', value: '难题挑战' },
          ]}
        />
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">课程列表</p>
        {courses.length ? (
          <div className="device-mini-list">
            {courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`} className="device-card-link">
                <div className="device-mini-item watch-list-card">
                  <div className="device-mini-item-title">
                    <span>{course.title}</span>
                    <div className="watch-home-tab-tags">
                      <Tag>{course.type}</Tag>
                      {course.favorite ? <Tag color="gold">已收藏</Tag> : null}
                    </div>
                  </div>
                  <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
                    {course.summary}
                  </Paragraph>
                  <p className="device-mini-item-meta">
                    {course.type === '难题挑战' ? `当前进度 ${course.lastPositionLabel}` : `上次学习位置 ${course.lastPositionLabel}`}
                  </p>
                  <Progress percent={course.progress} strokeColor="#2f6bff" style={{ marginTop: 10 }} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Empty description="这个分类下暂时没有已购课程" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>

      <div className="device-action-row">
        <Link href={latestCourse ? `/courses/${latestCourse.id}` : '/courses'}>
          <Button type="primary" block>{latestCourse ? '继续学习' : '课程'}</Button>
        </Link>
        <Link href="/me">
          <Button block>我的</Button>
        </Link>
      </div>
    </div>
  );
}
