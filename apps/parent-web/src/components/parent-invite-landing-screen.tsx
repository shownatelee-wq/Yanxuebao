'use client';

import '@ant-design/v5-patch-for-react-19';
import { CheckCircleOutlined, PhoneOutlined, ReadOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Empty, Form, Input, Tag, message } from 'antd';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ParentPhoneFrame } from './parent-mobile-shell';
import { useParentStore } from '../lib/parent-store';

export function ParentInviteLandingScreen() {
  const params = useParams<{ teamId: string }>();
  const store = useParentStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [authorizedPhone, setAuthorizedPhone] = useState('');
  const [enrollmentId, setEnrollmentId] = useState('');

  const team = store.state.familyTeams.find((item) => item.id === params.teamId || item.inviteCode === params.teamId);
  const inviteRecords = store.state.inviteEnrollments.filter((item) => item.teamId === team?.id);
  const teamTasks = store.state.familyTasks.filter((item) => item.familyTeamId === team?.id);

  if (!store.hydrated) {
    return (
      <ParentPhoneFrame>
        <div className="parent-loading">正在打开邀伴链接</div>
      </ParentPhoneFrame>
    );
  }

  if (!team) {
    return (
      <ParentPhoneFrame>
        {contextHolder}
        <div className="parent-public-page">
          <section className="parent-empty-guide onboarding">
            <Empty description="邀伴链接已失效或团队不存在" />
          </section>
        </div>
      </ParentPhoneFrame>
    );
  }

  return (
    <ParentPhoneFrame>
      {contextHolder}
      <div className="parent-public-page">
        <section className="parent-invite-hero">
          <span>{store.state.parentProfile.name} 邀请你</span>
          <strong>加入 {team.name} 研学活动</strong>
          <p>{team.goal}</p>
          <div className="parent-detail-chip-row">
            <Tag>{team.theme}</Tag>
            <Tag>{team.location}</Tag>
            <Tag>{team.studyDate}</Tag>
          </div>
        </section>

        {!authorizedPhone ? (
          <section className="parent-section">
            <div className="parent-section-head">
              <strong>授权手机号后查看</strong>
              <PhoneOutlined />
            </div>
            <p className="parent-radar-summary">模拟小程序手机号授权。授权后可查看研学团队信息并为孩子报名，报名孩子不会绑定到邀请人账户。</p>
            <Form
              layout="vertical"
              initialValues={{ phone: '13900000009' }}
              onFinish={(values: { phone: string }) => {
                setAuthorizedPhone(values.phone);
                messageApi.success('手机号授权成功');
              }}
            >
              <Form.Item
                name="phone"
                label="家长手机号"
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1\d{10}$/, message: '请输入 11 位手机号' },
                ]}
              >
                <Input size="large" inputMode="tel" prefix={<PhoneOutlined />} />
              </Form.Item>
              <Button block type="primary" htmlType="submit" size="large">
                授权并查看
              </Button>
            </Form>
          </section>
        ) : (
          <>
            <section className="parent-section parent-invite-team-detail">
              <div className="parent-section-head">
                <strong>研学团队信息</strong>
                <TeamOutlined />
              </div>
              <div className="parent-mini-table">
                <div>
                  <span>研学主题</span>
                  <strong>{team.theme}</strong>
                  <em>{team.location}</em>
                </div>
                <div>
                  <span>研学日期</span>
                  <strong>{team.studyDate}</strong>
                  <em>邀伴码 {team.inviteCode}</em>
                </div>
                <div>
                  <span>研学目标</span>
                  <strong>{team.goal}</strong>
                  <em>报名人数 {inviteRecords.length}</em>
                </div>
              </div>
            </section>

            <section className="parent-section">
              <div className="parent-section-head">
                <strong>研学任务</strong>
                <ReadOutlined />
              </div>
              {teamTasks.length ? (
                <div className="parent-invite-task-list">
                  {teamTasks.map((task) => (
                    <article key={task.id} className="parent-invite-task-card">
                      <div>
                        <span>{task.taskType}</span>
                        <Tag>{task.points} 成长值</Tag>
                      </div>
                      <strong>{task.title}</strong>
                      <p>{task.description}</p>
                      <div className="parent-detail-chip-row">
                        {task.capabilityTags.map((tag) => (
                          <Tag key={tag}>{tag}</Tag>
                        ))}
                      </div>
                      {task.requirements.length ? (
                        <ul>
                          {task.requirements.slice(0, 3).map((requirement) => (
                            <li key={requirement.id}>{requirement.requirement}</li>
                          ))}
                        </ul>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : (
                <Empty description="该研学团队暂未配置任务" />
              )}
              <Button
                block
                type="primary"
                size="large"
                onClick={() => document.getElementById('invite-enroll-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                我感兴趣，去报名
              </Button>
            </section>

            <section className="parent-section" id="invite-enroll-form">
              <div className="parent-section-head">
                <strong>为孩子报名</strong>
                <span>暂不缴费 · {authorizedPhone}</span>
              </div>
              {enrollmentId ? (
                <section className="parent-success-panel compact">
                  <CheckCircleOutlined />
                  <strong>报名成功</strong>
                  <span>已创建好友孩子的研学宝 ID，未绑定到邀请人家长账户。</span>
                  <Tag color="green">{enrollmentId}</Tag>
                </section>
              ) : (
                <Form
                  layout="vertical"
                  initialValues={{ childName: '好友孩子', grade: '五年级' }}
                  onFinish={(values: { childName: string; grade: string }) => {
                    const createdId = store.joinFamilyTeamFromInvite({
                      teamId: team.id,
                      childName: values.childName,
                      grade: values.grade,
                      phone: authorizedPhone,
                    });
                    setEnrollmentId(createdId);
                    messageApi.success('报名成功');
                  }}
                >
                  <Form.Item name="childName" label="孩子姓名" rules={[{ required: true, message: '请输入孩子姓名' }]}>
                    <Input size="large" />
                  </Form.Item>
                  <Form.Item name="grade" label="年级" rules={[{ required: true, message: '请输入年级' }]}>
                    <Input size="large" />
                  </Form.Item>
                  <Button block type="primary" htmlType="submit" size="large">
                    确认报名
                  </Button>
                </Form>
              )}
            </section>
          </>
        )}
      </div>
    </ParentPhoneFrame>
  );
}
