'use client';

import { LockOutlined, MobileOutlined } from '@ant-design/icons';
import { Button, Input, Space, Typography, message } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  getDeviceInitialized,
  getMockStudentAccounts,
  getStoredLoginMode,
  getStoredSession,
  storeSession,
  createMockDeviceSessionForAccount,
  type DeviceLoginMode,
  validateMockStudentAccount,
} from '../../../lib/api';

const { Paragraph, Text, Title } = Typography;

function getSessionMode(): DeviceLoginMode {
  const initMode = getDeviceInitialized();
  if (initMode === 'sale' || initMode === 'rental') {
    return initMode;
  }
  return getStoredLoginMode();
}

export default function StudentAccountLoginPage() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [phone, setPhone] = useState('13800138000');
  const [password, setPassword] = useState('123456');
  const [submitting, setSubmitting] = useState(false);
  const [isAddAccountFlow, setIsAddAccountFlow] = useState(false);
  const sessionMode = useMemo(() => getSessionMode(), []);
  const mockAccounts = useMemo(() => getMockStudentAccounts(), []);

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

  function login() {
    const matchedAccount = validateMockStudentAccount(phone, password);
    if (!matchedAccount) {
      messageApi.error('手机号或密码错误');
      return;
    }

    setSubmitting(true);
    storeSession(createMockDeviceSessionForAccount(sessionMode, matchedAccount.id));
    messageApi.success(isAddAccountFlow ? '学员账号添加成功' : '学员账号登录成功');
    window.setTimeout(() => router.replace('/home'), 300);
  }

  return (
    <main className="device-login-screen">
      {contextHolder}
      <div className="device-login-watch-card" style={{ padding: 12 }}>
        <div className="device-login-orb" aria-hidden="true" />
        <Space direction="vertical" size={12} style={{ width: '100%', position: 'relative' }}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Text className="device-login-chip">ACCOUNT LOGIN</Text>
            <Title level={3} style={{ margin: 0, fontSize: 22 }}>
              账号登陆
            </Title>
            <Paragraph type="secondary" style={{ margin: 0, fontSize: 12 }}>
              {isAddAccountFlow ? '输入新的学员手机号和密码，登录后会加入切换账号列表。' : '输入已分配的学员手机号和密码。'}
            </Paragraph>
          </Space>

          <div className="device-login-entry">
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Input
                value={phone}
                onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 11))}
                prefix={<MobileOutlined />}
                inputMode="tel"
                maxLength={11}
                placeholder="请输入手机号"
                style={{ height: 40, borderRadius: 14 }}
              />
              <Input.Password
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                style={{ height: 40, borderRadius: 14 }}
              />
              <Text type="secondary" style={{ fontSize: 11 }}>
                演示密码统一为 123456
              </Text>
              <div className="device-account-demo-list">
                {mockAccounts.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="device-account-demo-chip"
                    onClick={() => {
                      setPhone(item.account);
                      setPassword('123456');
                    }}
                  >
                    {`${item.displayName} ${item.account}`}
                  </button>
                ))}
              </div>
            </Space>

            <Button type="primary" block size="large" loading={submitting} onClick={login} style={{ height: 42, borderRadius: 16 }}>
              {isAddAccountFlow ? '添加并登录账号' : '登陆研学宝'}
            </Button>
            <Link href={isAddAccountFlow ? '/student-login?intent=add-account' : '/student-login'}>
              <Button block>返回登录方式</Button>
            </Link>
          </div>
        </Space>
      </div>
    </main>
  );
}
