'use client';

import { KeyOutlined, QrcodeOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Button, Input, Segmented, Space, Typography, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  getStoredLoginMode,
  getStoredSession,
  storeDeviceInitialized,
  storeLoginMode,
  type DeviceInitMode,
} from '../../lib/api';

const { Paragraph, Text, Title } = Typography;

function getModeLabel(mode: DeviceInitMode) {
  if (mode === 'sale') {
    return '销售模式';
  }
  if (mode === 'scan') {
    return '扫码授权';
  }
  return '租赁模式';
}

export default function DeviceLoginPage() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [mode, setMode] = useState<DeviceInitMode>('rental');
  const [code, setCode] = useState('123456');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const session = getStoredSession();
    if (session) {
      router.replace('/home');
      return;
    }
    setMode(getStoredLoginMode());
  }, [router]);

  function completeInitialization(nextMode = mode) {
    if (nextMode === 'rental' && code !== '123456') {
      messageApi.error('租赁模式授权码固定为 123456');
      return;
    }

    try {
      setSubmitting(true);
      storeDeviceInitialized(nextMode);
      if (nextMode !== 'scan') {
        storeLoginMode(nextMode);
      }
      messageApi.success(`${getModeLabel(nextMode)}初始化完成`);
      window.setTimeout(() => router.replace('/student-login'), 350);
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
            <Text className="device-login-chip">DEVICE INIT</Text>
            <Title level={3} style={{ margin: 0, fontSize: 22 }}>
              设备初始化绑定
            </Title>
            <Paragraph type="secondary" style={{ margin: 0, fontSize: 12 }}>
              先完成硬件授权，再登录学员账号。
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
                初始化方式
              </Text>
              <div className="device-login-status-value">{getModeLabel(mode)}</div>
            </div>
          </div>

          <div className="device-login-entry">
            <Segmented
              block
              value={mode}
              onChange={(value) => setMode(value as DeviceInitMode)}
              options={[
                { label: '租赁模式', value: 'rental', icon: <KeyOutlined /> },
                { label: '销售模式', value: 'sale', icon: <ShoppingOutlined /> },
                { label: '扫码授权', value: 'scan', icon: <QrcodeOutlined /> },
              ]}
            />

            {mode === 'rental' ? (
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <Text strong style={{ fontSize: 12 }}>
                  输入六位设备授权码
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
            ) : null}

            {mode === 'sale' ? (
              <Text strong style={{ fontSize: 12 }}>
                销售模式无需授权码，完成设备初始化后进入学员登录。
              </Text>
            ) : null}

            {mode === 'scan' ? (
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                <div className="device-login-qr" aria-label="扫码授权二维码示意">
                  <svg
                    className="device-login-qr-svg"
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M48.384 45.376l412.224 0 0 84.992-412.224 0 0-84.992ZM565.44 45.376l238.656 0 0 84.992-238.656 0 0-84.992ZM891.584 45.376l86.72 0 0 86.72-86.72 0 0-86.72ZM48.384 374.4l412.224 0 0 85.056-412.224 0 0-85.056ZM45.696 45.376l84.992 0 0 412.224-84.992 0 0-412.224ZM375.616 45.376l84.992 0 0 412.224-84.992 0 0-412.224ZM189.376 200.832l115.712 0 0 115.712-115.712 0 0-115.712ZM565.44 130.368l82.752 0 0 87.232-82.752 0 0-87.232ZM804.032 130.368l90.752 0 0 160.512-90.752 0 0-160.512ZM891.584 217.6l86.72 0 0 151.872-86.72 0 0-151.872ZM651.328 282.688l152.768 0 0 109.312-152.768 0 0-109.312ZM736.832 369.408l155.392 0 0 88.128-155.392 0 0-88.128ZM565.952 372.16l85.376 0 0 85.376-85.376 0 0-85.376ZM45.696 542.784l84.992 0 0 192.576-84.992 0 0-192.576ZM130.88 717.248l91.968 0 0 92.032-91.968 0 0-92.032ZM45.696 805.632l85.184 0 0 173.056-85.184 0 0-173.056ZM217.664 542.784l261.696 0 0 105.728-261.696 0 0-105.728ZM281.344 639.104l109.184 0 0 100.48-109.184 0 0-100.48ZM370.176 717.248l109.184 0 0 174.848-109.184 0 0-174.848ZM285.44 805.632l105.088 0 0 173.056-105.088 0 0-173.056ZM197.952 869.12l102.016 0 0 109.568-102.016 0 0-109.568ZM629.184 542.784l195.264 0 0 174.464-195.264 0 0-174.464ZM871.168 542.784l107.136 0 0 107.136-107.136 0 0-107.136ZM545.088 630.016l107.136 0 0 194.304-107.136 0 0-194.304ZM716.672 692.8l107.776 0 0 111.872-107.776 0 0-111.872ZM545.088 869.12l107.136 0 0 109.568-107.136 0 0-109.568ZM802.816 892.096l175.488 0 0 86.592-175.488 0 0-86.592ZM890.56 804.672l87.744 0 0 105.728-87.744 0 0-105.728Z"
                      fill="#272636"
                    />
                  </svg>
                </div>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  景区或机构扫码完成设备授权，授权后可登录学员账号。
                </Text>
              </Space>
            ) : null}

            <Button
              block
              size="large"
              type="primary"
              icon={mode === 'scan' ? <QrcodeOutlined /> : <KeyOutlined />}
              onClick={() => completeInitialization()}
              loading={submitting}
              style={{ height: 40, borderRadius: 16 }}
            >
              {mode === 'scan' ? '登陆学员账号' : '完成初始化'}
            </Button>
          </div>
        </Space>
      </div>
    </main>
  );
}
