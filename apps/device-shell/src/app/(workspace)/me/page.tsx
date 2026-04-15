'use client';

import { Button, Empty, Space, Tag, message } from 'antd';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchWithMode, getStoredSession } from '../../../lib/api';
import { demoDiaries, demoFavorites, demoReports } from '../../../lib/device-demo-data';
import { getPurchasedCourses, useCourseState } from '../../../lib/device-course-data';

type Profile = { id: string; account: string; displayName: string; role: string; studentId?: string };
type Report = { id: string; title: string; status: string; publishedAt?: string };

export default function DeviceMePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const session = getStoredSession();
  const courseState = useCourseState();
  const courses = getPurchasedCourses(courseState);

  async function loadMe() {
    try {
      const reportList = await fetchWithMode<Report[]>(
        `/reports?studentId=${session?.user.studentId ?? ''}`,
        demoReports.map((report) => ({
          id: report.id,
          title: report.title,
          status: report.status,
          publishedAt: report.publishedAt,
        })),
      );
      setProfile(
        session?.user
          ? {
              id: session.user.id,
              account: session.user.account,
              displayName: session.user.displayName,
              role: session.user.role,
              studentId: session.user.studentId,
            }
          : {
              id: 'device-user-demo',
              account: 'device_demo_student',
              displayName: '小明',
              role: 'student',
              studentId: 'student_demo_01',
            },
      );
      setReports(reportList);
    } catch (error) {
      if (session?.user) {
        setProfile({
          id: session.user.id,
          account: session.user.account,
          displayName: session.user.displayName,
          role: session.user.role,
          studentId: session.user.studentId,
        });
      }
      messageApi.error(error instanceof Error ? error.message : '加载我的页面失败');
    }
  }

  useEffect(() => {
    void loadMe();
  }, [session?.user.studentId]);

  return (
    <div className="device-page-stack">
      {contextHolder}

      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space>
            <Tag color="purple">个人主页</Tag>
            <Tag color="blue">学员</Tag>
          </Space>
          <p className="device-page-title">{profile?.displayName ?? '我的'}</p>
          <p className="device-page-subtle">{profile?.studentId ?? '学员 ID 暂无'} · {profile?.account ?? '-'}</p>
        </Space>
      </div>

      <div className="device-inline-stats">
        <div className="device-inline-stat">
          <span>我的课程</span>
          <strong>{courses.length}</strong>
        </div>
        <div className="device-inline-stat">
          <span>我的报告</span>
          <strong>{reports.length}</strong>
        </div>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">课程入口</p>
        {courses.length > 0 ? (
          <div className="device-mini-list">
            {courses.slice(0, 2).map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`} className="device-card-link">
                <div className="device-mini-item">
                  <div className="device-mini-item-title">
                    <span>{course.title}</span>
                    <Tag>{course.type}</Tag>
                  </div>
                  <p className="device-mini-item-desc">{course.summary}</p>
                  <p className="device-mini-item-meta">上次学习位置 {course.lastPositionLabel}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Empty description="暂时没有课程" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">报告与日记</p>
        {reports.length > 0 ? (
          <div className="device-mini-list">
            {reports.map((report) => (
              <Link key={report.id} href={`/me/reports/${report.id}`} className="device-card-link">
                <div className="device-mini-item">
                  <div className="device-mini-item-title">
                    <span>{report.title}</span>
                    <Tag color="green">{report.status}</Tag>
                  </div>
                  <p className="device-mini-item-desc">{report.publishedAt ?? '待发布'}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Empty description="暂时没有报告" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">研学日记</p>
        <div className="device-mini-list">
          {demoDiaries.map((item) => (
            <Link key={item.id} href={`/me/diaries/${item.id}`} className="device-card-link">
              <div className="device-mini-item">
                <div className="device-mini-item-title">
                  <span>{item.title}</span>
                  <Tag color="blue">{item.createdAt}</Tag>
                </div>
                <p className="device-mini-item-desc">{item.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">收藏</p>
        <div className="device-mini-list">
          {demoFavorites.map((item) => (
            <Link key={item.id} href={`/me/favorites/${item.id}`} className="device-card-link">
              <div className="device-mini-item">
                <div className="device-mini-item-title">
                  <span>{item.title}</span>
                  <Tag color="gold">{item.type}</Tag>
                </div>
                <p className="device-mini-item-desc">{item.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="device-action-row">
        <Link href="/courses">
          <Button type="primary" block>
            课程
          </Button>
        </Link>
        <Link href="/settings">
          <Button block>设置</Button>
        </Link>
      </div>
    </div>
  );
}
