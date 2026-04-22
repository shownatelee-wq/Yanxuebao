'use client';

import { Button } from 'antd';
import { clearSession, getStoredDeviceAccountHistory, getStoredSession } from '../../../lib/api';
import { demoSettings } from '../../../lib/device-demo-data';
import { deviceIdentityProfile } from '../../../lib/device-workspace-state';
import Link from 'next/link';

export default function DeviceSettingsPage() {
  const session = getStoredSession();
  const accountHistory = getStoredDeviceAccountHistory();

  function handleLogout() {
    clearSession();
    window.location.replace('/student-login');
  }

  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <p className="device-page-title">设置</p>
          <div className="watch-status-pills">
            <span className="watch-status-pill">{demoSettings.length} 项设置</span>
            <span className="watch-status-pill">设备 / 锁屏 / 人脸</span>
          </div>
        </div>
        <div className="watch-list-panel long-list">
          <div className="watch-inline-head">
            <span>当前状态</span>
            <span>已绑定 / 已启用</span>
          </div>
          <div className="device-mini-list">
            <div className="device-mini-item watch-list-card">
              <div className="device-mini-item-title">
                <span>设备绑定</span>
              </div>
              <p className="device-mini-item-desc">{`${deviceIdentityProfile.deviceId} · ${session?.user.displayName ?? deviceIdentityProfile.studentName}`}</p>
            </div>
            <div className="device-mini-item watch-list-card">
              <div className="device-mini-item-title">
                <span>研学宝身份</span>
              </div>
              <p className="device-mini-item-desc">{`ID ${deviceIdentityProfile.yxbId} · 手机 ${deviceIdentityProfile.mobile}`}</p>
            </div>
            <div className="device-mini-item watch-list-card">
              <div className="device-mini-item-title">
                <span>家长绑定</span>
              </div>
              <p className="device-mini-item-desc">{deviceIdentityProfile.parentBound ? `已绑定 ${deviceIdentityProfile.parentName}` : '未绑定家长'}</p>
            </div>
            <div className="device-mini-item watch-list-card">
              <div className="device-mini-item-title">
                <span>刷脸登录</span>
              </div>
              <p className="device-mini-item-desc">已录入 1 位学员。</p>
            </div>
            <div className="device-mini-item watch-list-card">
              <div className="device-mini-item-title">
                <span>账号状态</span>
              </div>
              <p className="device-mini-item-desc">{`${session?.user.displayName ?? '当前账号'} 在线 · 已记录 ${accountHistory.length} 个账号`}</p>
            </div>
          </div>
        </div>
        <div className="watch-list-panel long-list">
          <div className="watch-inline-head">
            <span>设置入口</span>
            <span>{demoSettings.length} 项</span>
          </div>
          <div className="device-mini-list">
            {demoSettings.map((item) => (
              <Link key={item.id} href={item.path} className="device-settings-button">
                <span>{item.title}</span>
                <em>{item.summary}</em>
                <strong>›</strong>
              </Link>
            ))}
          </div>
        </div>
        <div className="watch-list-panel long-list">
          <Button danger block onClick={handleLogout}>退出登录</Button>
        </div>
      </div>
    </div>
  );
}
