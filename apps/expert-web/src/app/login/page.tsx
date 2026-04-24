'use client';

import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EXPERT_LOGIN_DEFAULTS, authenticateExpert, getStoredSession, storeSession } from '../../lib/api';

export default function ExpertLoginPage() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (getStoredSession()) {
      router.replace('/dashboard');
    }
  }, [router]);

  async function onFinish(values: { account: string; password: string }) {
    try {
      const session = authenticateExpert(values.account, values.password);
      storeSession(session);
      messageApi.success('登录成功');
      router.push('/dashboard');
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '登录失败');
    }
  }

  return (
    <main className="expert-app-bg">
      {contextHolder}
      <section className="expert-phone expert-login-shell">
        <div className="expert-login-brand">
          <span>研学宝专家工作台</span>
          <h1>专家端 H5</h1>
          <p>围绕课程、问答、知识、资讯、挑战和智能体维护的一体化工作区。</p>
        </div>
        <div className="expert-login-card">
          <Form
            layout="vertical"
            initialValues={EXPERT_LOGIN_DEFAULTS}
            onFinish={onFinish}
          >
            <Form.Item label="账号" name="account" rules={[{ required: true, message: '请输入账号' }]}>
              <Input prefix={<UserOutlined />} placeholder="请输入账号" />
            </Form.Item>
            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
            </Form.Item>
            <div className="expert-login-note">演示账号：expert_demo / Yanxuebao@2026</div>
            <Button block size="large" type="primary" htmlType="submit">
              登录专家端
            </Button>
          </Form>
        </div>
      </section>
    </main>
  );
}
