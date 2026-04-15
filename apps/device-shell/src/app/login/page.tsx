'use client';

import { KeyOutlined, PoweroffOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Button, Input, Segmented, Space, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import {
  createMockDeviceSession,
  getStoredLoginMode,
  storeLoginMode,
  storeSession,
  type DeviceLoginMode,
} from '../../lib/api';

const { Paragraph, Text, Title } = Typography;

export default function DeviceLoginPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [mode, setMode] = useState<DeviceLoginMode>('rental');
  const [code, setCode] = useState('123456');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMode(getStoredLoginMode());
  }, []);

  async function login() {
    if (mode === 'rental' && code !== '123456') {
      messageApi.error('租赁模式授权码固定为 123456');
      return;
    }

    try {
      setSubmitting(true);
      const session = createMockDeviceSession(mode);
      storeLoginMode(mode);
      storeSession(session);
      messageApi.success(mode === 'sale' ? '销售模式已直接登录' : '租赁模式授权成功');
      window.location.replace('/home');
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '登录失败');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="device-login-screen">
      {contextHolder}
      <div className="device-login-watch-card" style={{ padding: 12 }}>
        <div className="device-login-orb" aria-hidden="true" />
        <Space direction="vertical" size={12} style={{ width: '100%', position: 'relative' }}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Text className="device-login-chip">SMART WATCH</Text>
            <Title level={3} style={{ margin: 0, fontSize: 22 }}>
              研学宝
            </Title>
            <Paragraph type="secondary" style={{ margin: 0, fontSize: 12 }}>
              按设备模式登录
            </Paragraph>
          </Space>

          <div className="device-login-status">
            <div>
              <Text type="secondary" style={{ fontSize: 10 }}>
                设备码
              </Text>
              <div className="device-login-status-value">YXB-DEV-0001</div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 10 }}>
                当前模式
              </Text>
              <div className="device-login-status-value">{mode === 'sale' ? '销售模式' : '租赁模式'}</div>
            </div>
          </div>

          <div className="device-login-entry">
            <Segmented
              block
              value={mode}
              onChange={(value) => setMode(value as DeviceLoginMode)}
              options={[
                { label: '租赁模式', value: 'rental', icon: <KeyOutlined /> },
                { label: '销售模式', value: 'sale', icon: <ShoppingOutlined /> },
              ]}
            />

            {mode === 'rental' ? (
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <Text strong style={{ fontSize: 12 }}>
                  输入六位授权码
                </Text>
                <Input
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="请输入授权码"
                  style={{ textAlign: 'center', height: 38, borderRadius: 14, letterSpacing: '0.35em', fontSize: 16 }}
                />
                <Text type="secondary" style={{ fontSize: 11 }}>
                  租赁模式体验码：123456
                </Text>
              </Space>
            ) : (
              <Text strong style={{ fontSize: 12 }}>
                销售模式无需授权码，直接进入设备主屏
              </Text>
            )}

            <Button
              block
              size="large"
              type="primary"
              icon={<PoweroffOutlined />}
              onClick={login}
              loading={submitting}
              style={{ height: 40, borderRadius: 16 }}
            >
              {mode === 'sale' ? '直接登录' : '授权进入'}
            </Button>
          </div>
        </Space>
      </div>
    </main>
  );
}
