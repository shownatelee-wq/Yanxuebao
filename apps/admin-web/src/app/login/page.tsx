'use client';

import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Space, Typography, message } from 'antd';
import { useRouter } from 'next/navigation';
import { apiFetch, storeSession, type WebSession } from '../../lib/api';

const { Paragraph, Title } = Typography;

export default function AdminLoginPage() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  async function onFinish(values: { account: string; password: string }) {
    try {
      const session = await apiFetch<WebSession>('/auth/web/login', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      storeSession(session);
      messageApi.success('登录成功，正在进入运营后台');
      router.push('/organizations');
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '登录失败');
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
      }}
    >
      {contextHolder}
      <Card style={{ width: 420 }}>
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          <Space direction="vertical" size={4}>
            <Title level={3} style={{ margin: 0 }}>
              运营后台登录
            </Title>
            <Paragraph type="secondary" style={{ margin: 0 }}>
              演示账号：`operator_demo` / `Yanxuebao@2026`
            </Paragraph>
          </Space>
          <Form
            layout="vertical"
            initialValues={{ account: 'operator_demo', password: 'Yanxuebao@2026' }}
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
            <Button block type="primary" htmlType="submit">
              登录运营后台
            </Button>
          </Form>
        </Space>
      </Card>
    </main>
  );
}

