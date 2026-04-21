'use client';

import '@ant-design/v5-patch-for-react-19';
import { LockOutlined, MobileOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';
import { useRouter } from 'next/navigation';
import { storeSession, type WebSession } from '../../lib/api';

type LoginValues = {
  account: string;
  password: string;
};

const DEMO_SESSION: WebSession = {
  accessToken: 'parent-local-token',
  refreshToken: 'parent-local-refresh',
  role: 'parent',
  user: {
    id: 'parent_demo',
    account: 'parent_demo',
    displayName: '演示家长',
    role: 'parent',
  },
};

export default function ParentLoginPage() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  function onFinish(values: LoginValues) {
    if (values.account !== 'parent_demo' || values.password !== 'Yanxuebao@2026') {
      messageApi.error('账号或密码不正确');
      return;
    }
    storeSession(DEMO_SESSION);
    messageApi.success('登录成功');
    router.push('/home');
  }

  return (
    <main className="parent-app-bg">
      {contextHolder}
      <div className="parent-phone">
        <div className="parent-login-card">
          <div className="parent-login-brand">
            <div className="parent-login-mark">
              <MobileOutlined />
            </div>
            <div>
              <h1>研学宝家长端</h1>
              <p>管理学员、查看成长记录、创建家庭研学任务。</p>
            </div>
          </div>
          <div className="parent-login-panel">
            <Form<LoginValues>
              layout="vertical"
              initialValues={{ account: 'parent_demo', password: 'Yanxuebao@2026' }}
              onFinish={onFinish}
            >
              <Form.Item label="账号" name="account" rules={[{ required: true, message: '请输入账号' }]}>
                <Input prefix={<UserOutlined />} placeholder="请输入账号" />
              </Form.Item>
              <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
              </Form.Item>
              <Button block type="primary" htmlType="submit">
                登录家长端
              </Button>
            </Form>
          </div>
          <p className="parent-demo-account">演示账号：parent_demo / Yanxuebao@2026</p>
        </div>
      </div>
    </main>
  );
}
