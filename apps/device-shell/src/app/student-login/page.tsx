'use client';

import { ScanOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Space, Typography } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getDeviceInitialized, getStoredSession } from '../../lib/api';

const { Paragraph, Text, Title } = Typography;

export default function StudentLoginPage() {
  const router = useRouter();
  const [isAddAccountFlow, setIsAddAccountFlow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setIsAddAccountFlow(new URLSearchParams(window.location.search).get('intent') === 'add-account');
  }, []);

  useEffect(() => {
    if (getStoredSession() && !isAddAccountFlow) {
      router.replace('/home');
      return;
    }
    if (!getDeviceInitialized()) {
      router.replace('/login');
    }
  }, [isAddAccountFlow, router]);

  return (
    <main className="device-login-screen">
      <div className="device-login-watch-card" style={{ padding: 12 }}>
        <div className="device-login-orb" aria-hidden="true" />
        <Space direction="vertical" size={14} style={{ width: '100%', position: 'relative' }}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Text className="device-login-chip">STUDENT LOGIN</Text>
            <Title level={3} style={{ margin: 0, fontSize: 24 }}>
              研学宝
            </Title>
            <Paragraph type="secondary" style={{ margin: 0, fontSize: 12 }}>
              {isAddAccountFlow ? '请选择新的学员账号登录方式。' : '请选择学员账号登录方式。'}
            </Paragraph>
          </Space>

          <div className="device-login-status">
            <div>
              <Text type="secondary" style={{ fontSize: 10 }}>
                设备状态
              </Text>
              <div className="device-login-status-value">已初始化</div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 10 }}>
                学员账号
              </Text>
              <div className="device-login-status-value">{isAddAccountFlow ? '添加新账号' : '待登录'}</div>
            </div>
          </div>

          <div className="device-login-entry">
            <Link href={isAddAccountFlow ? '/student-login/account?intent=add-account' : '/student-login/account'}>
              <Button type="primary" size="large" block icon={<UserOutlined />} style={{ height: 42, borderRadius: 16 }}>
                账号登陆
              </Button>
            </Link>
            <Link href={isAddAccountFlow ? '/student-login/face?intent=add-account' : '/student-login/face'}>
              <Button size="large" block icon={<ScanOutlined />} style={{ height: 42, borderRadius: 16 }}>
                人脸登陆
              </Button>
            </Link>
            <Text type="secondary" style={{ fontSize: 11 }}>
              学员账号注册不在设备端进行，请使用已分配账号登录。
            </Text>
          </div>
        </Space>
      </div>
    </main>
  );
}
