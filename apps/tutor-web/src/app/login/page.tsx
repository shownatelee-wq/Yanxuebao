'use client';

import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getStoredSession, mockLogin } from '../../lib/api';

export default function TutorLoginPage() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (getStoredSession()) {
      router.replace('/dashboard');
    }
  }, [router]);

  async function onFinish(values: { account: string; password: string }) {
    try {
      await mockLogin(values.account, values.password);
      messageApi.success('登录成功，正在进入导师端');
      router.push('/dashboard');
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '登录失败');
    }
  }

  return (
    <main className="tutor-login">
      {contextHolder}
      <div className="tutor-login-frame">
        <div
          className="tutor-login-cover"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(8, 32, 38, 0.28), rgba(8, 32, 38, 0.62)), url('https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1400&q=80')",
          }}
        >
          <div>
            <div className="tutor-cover-title">导师端手机工作台</div>
            <div className="tutor-cover-note">
              按研学现场执行路径重做，登录后直接进入导师主面板，围绕当前团队连续开展工作。
            </div>
          </div>
        </div>
        <div className="tutor-login-body">
          <Form
            layout="vertical"
            initialValues={{ account: 'tutor_demo', password: 'Yanxuebao@2026' }}
            onFinish={onFinish}
          >
            <Form.Item label="导师账号" name="account" rules={[{ required: true, message: '请输入账号' }]}>
              <Input prefix={<UserOutlined />} placeholder="请输入导师账号" />
            </Form.Item>
            <Form.Item label="登录密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="请输入登录密码" />
            </Form.Item>
            <Button block type="primary" htmlType="submit">
              进入导师工作台
            </Button>
          </Form>
          <div className="tutor-login-hint">
            演示账号：`tutor_demo`<br />
            演示密码：`Yanxuebao@2026`
          </div>
        </div>
      </div>
    </main>
  );
}
