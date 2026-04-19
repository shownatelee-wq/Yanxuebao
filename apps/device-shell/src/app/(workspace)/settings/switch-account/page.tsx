'use client';

import { CheckCircleFilled, PlusOutlined } from '@ant-design/icons';
import { Button, Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { getStoredDeviceAccountHistory, getStoredSession, switchStoredDeviceAccount } from '../../../../lib/api';

const { Text } = Typography;

export default function DeviceSwitchAccountPage() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const session = getStoredSession();
  const accounts = useMemo(() => getStoredDeviceAccountHistory(), []);

  function handleSwitch(accountId: string, accountName: string) {
    if (session?.user.id === accountId) {
      return;
    }

    switchStoredDeviceAccount(accountId);
    messageApi.success(`已切换到${accountName}`);
    window.setTimeout(() => router.replace('/home'), 220);
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <p className="device-page-title">切换账号</p>
          <div className="watch-status-pills">
            <span className="watch-status-pill">{accounts.length} 个学员账号</span>
            <span className="watch-status-pill">当前账号高亮显示</span>
          </div>
          <p className="device-page-subtle" style={{ margin: '8px 0 0' }}>
            选择设备上登录过的学员账号，切换后将直接进入主屏。
          </p>
        </div>

        <div className="watch-list-panel long-list">
          <div className="watch-inline-head">
            <span>账号列表</span>
            <span>{accounts.length} 个</span>
          </div>
          <div className="device-mini-list">
            {accounts.map((item) => {
              const isCurrent = session?.user.id === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`device-account-switch-btn${isCurrent ? ' selected' : ''}`}
                  onClick={() => handleSwitch(item.id, item.displayName)}
                >
                  <div className="device-mini-item watch-list-card device-account-switch-card">
                    <div className="device-mini-item-title">
                      <span>{item.displayName}</span>
                      <div className="watch-home-tab-tags">
                        {isCurrent ? (
                          <Tag color="blue" icon={<CheckCircleFilled />}>
                            当前登录
                          </Tag>
                        ) : (
                          <Tag color="default">点击切换</Tag>
                        )}
                      </div>
                    </div>
                    <p className="device-mini-item-desc">{`${item.account} · ${item.gradeLabel}`}</p>
                    <div className="device-account-switch-meta">
                      <Text type="secondary">{item.orgLabel}</Text>
                      <span>{isCurrent ? '当前使用中' : item.lastLoginAt}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="watch-bottom-dock">
          <div className="device-action-row single">
            <Link href="/student-login?intent=add-account">
              <Button type="primary" block icon={<PlusOutlined />}>
                添加账号
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
