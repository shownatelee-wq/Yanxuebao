'use client';

import { Button } from 'antd';
import { clearSession } from '../../../lib/api';
import { demoSettings } from '../../../lib/device-demo-data';
import Link from 'next/link';

export default function DeviceSettingsPage() {
  function handleLogout() {
    clearSession();
    window.location.replace('/login');
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
              <p className="device-mini-item-desc">YXB-DEV-0001 · 李同学</p>
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
              <p className="device-mini-item-desc">当前账号在线。</p>
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
              <Link key={item.id} href={item.path} className="device-card-link">
                <div className="device-mini-item watch-list-card">
                  <div className="device-mini-item-title">
                    <span>{item.title}</span>
                  </div>
                  <p className="device-mini-item-desc">{item.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="watch-bottom-dock">
          <div className="device-action-row">
            <Link href="/settings/device">
              <Button type="primary" block>设备绑定</Button>
            </Link>
            <Link href="/settings/face">
              <Button block>人脸识别</Button>
            </Link>
          </div>
          <div className="device-action-row single" style={{ marginTop: 10 }}>
            <Button danger block onClick={handleLogout}>退出登录</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
