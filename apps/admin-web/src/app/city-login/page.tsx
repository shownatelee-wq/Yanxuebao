'use client';

import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Space, Typography, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getDefaultCredentials, getRoleHome, getStoredSession, loginWithCredentials } from '../../lib/admin-auth';

const { Title, Paragraph, Text } = Typography;

export default function CityLoginPage() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const defaults = getDefaultCredentials('city_maintainer');

  useEffect(() => {
    const session = getStoredSession();
    if (session?.role === 'city_maintainer') {
      router.replace(getRoleHome('city_maintainer'));
    }
  }, [router]);

  async function handleFinish(values: { account: string; password: string }) {
    try {
      const session = loginWithCredentials(values.account, values.password, 'city_maintainer');
      messageApi.success('已进入城市维护工作台');
      router.replace(getRoleHome(session.role));
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '登录失败');
    }
  }

  return (
    <main className="login-screen city-login-screen">
      {contextHolder}
      <Card className="login-card" variant="borderless">
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          <Space direction="vertical" size={4}>
            <Text className="eyebrow">城市数据维护入口</Text>
            <Title level={2} style={{ margin: 0 }}>
              进入维护工作台
            </Title>
            <Paragraph type="secondary" style={{ margin: 0 }}>
              用于维护授权城市的基地与任务信息，并查看审核与业绩结果。
            </Paragraph>
          </Space>
          <Card size="small" className="credential-card">
            <Space direction="vertical" size={4}>
              <Text strong>常用账号</Text>
              <Text type="secondary">账号：{defaults.account}</Text>
              <Text type="secondary">密码：{defaults.password}</Text>
            </Space>
          </Card>
          <Form layout="vertical" initialValues={defaults} onFinish={handleFinish}>
            <Form.Item label="账号" name="account" rules={[{ required: true, message: '请输入账号' }]}>
              <Input prefix={<UserOutlined />} placeholder="请输入账号" />
            </Form.Item>
            <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
            </Form.Item>
            <Button block type="primary" htmlType="submit">
              登录维护工作台
            </Button>
          </Form>
          <Button type="link" onClick={() => router.push('/login')}>
            返回运营后台入口
          </Button>
        </Space>
      </Card>
    </main>
  );
}
