'use client';

import { ScanOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Space, Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  createMockDeviceSessionForAccount,
  getDeviceInitialized,
  getMockStudentAccounts,
  getStoredLoginMode,
  getStoredSession,
  storeSession,
  type DeviceLoginMode,
} from '../../../lib/api';
import { deviceBridge } from '../../../lib/device-bridge';

const { Paragraph, Text, Title } = Typography;

function getSessionMode(): DeviceLoginMode {
  const initMode = getDeviceInitialized();
  if (initMode === 'sale' || initMode === 'rental') {
    return initMode;
  }
  return getStoredLoginMode();
}

export default function StudentFaceLoginPage() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [phase, setPhase] = useState<'ready' | 'scanning' | 'success'>('ready');
  const [resultText, setResultText] = useState('请正对摄像头，点击开始识别。');
  const [isAddAccountFlow, setIsAddAccountFlow] = useState(false);
  const sessionMode = useMemo(() => getSessionMode(), []);
  const mockAccounts = useMemo(() => getMockStudentAccounts(), []);
  const defaultFaceAccount = mockAccounts[mockAccounts.length - 1];

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

  async function startFaceLogin() {
    setPhase('scanning');
    setResultText('正在识别学员人脸...');
    const result = await deviceBridge.simulateFaceLogin();
    setResultText(result.message);
    setPhase('success');
    storeSession(createMockDeviceSessionForAccount(sessionMode, defaultFaceAccount.id));
    messageApi.success(isAddAccountFlow ? '账号添加成功，正在进入首页' : '人脸识别成功，正在进入首页');
    window.setTimeout(() => router.replace('/home'), 600);
  }

  return (
    <main className="device-login-screen">
      {contextHolder}
      <div className="device-login-watch-card" style={{ padding: 12 }}>
        <div className="device-login-orb" aria-hidden="true" />
        <Space direction="vertical" size={12} style={{ width: '100%', position: 'relative' }}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Text className="device-login-chip">FACE LOGIN</Text>
            <Title level={3} style={{ margin: 0, fontSize: 22 }}>
              人脸登陆
            </Title>
            <Paragraph type="secondary" style={{ margin: 0, fontSize: 12 }}>
              {isAddAccountFlow ? '识别成功后将新增一个学员账号并进入主屏。' : '识别成功后自动进入研学宝首页。'}
            </Paragraph>
          </Space>

          <div className="device-login-entry">
            <div className={`device-capture-stage ${phase === 'scanning' ? 'capturing' : phase === 'success' ? 'done' : ''}`} style={{ minHeight: 150 }}>
              <div style={{ display: 'grid', justifyItems: 'center', gap: 8 }}>
                {phase === 'scanning' ? <ScanOutlined style={{ fontSize: 28 }} /> : <UserOutlined style={{ fontSize: 28 }} />}
                <strong>{phase === 'success' ? '识别成功' : phase === 'scanning' ? '正在识别' : '等待识别'}</strong>
                <span style={{ fontSize: 12, color: 'rgba(31, 41, 55, 0.72)' }}>{resultText}</span>
              </div>
            </div>
            <Space wrap style={{ justifyContent: 'center' }}>
              <Tag color="green">学员身份校验</Tag>
              <Tag color="blue">前端模拟识别</Tag>
            </Space>

            <Button
              type="primary"
              block
              size="large"
              loading={phase === 'scanning'}
              disabled={phase === 'success'}
              onClick={() => void startFaceLogin()}
              style={{ height: 42, borderRadius: 16 }}
            >
              开始识别
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
