'use client';

import { LockOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Input, Segmented, message } from 'antd';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createExpertSession,
  getExpertAccountByPhone,
  getStoredSession,
  saveExpertAccount,
  storeSession,
} from '../../lib/api';

type SetupDraft = {
  account: string;
  displayName: string;
  password: string;
  confirmPassword: string;
};

type LoginMode = 'code' | 'password';

export default function ExpertLoginPage() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [mode, setMode] = useState<LoginMode>('code');
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [phone, setPhone] = useState('13800000000');
  const [code, setCode] = useState('2605');
  const [passwordPhone, setPasswordPhone] = useState('13800000000');
  const [password, setPassword] = useState('');
  const [setupDraft, setSetupDraft] = useState<SetupDraft | null>(null);

  useEffect(() => {
    if (getStoredSession()) {
      router.replace('/dashboard');
    }
  }, [router]);

  function enterWorkspace(profile: NonNullable<ReturnType<typeof getExpertAccountByPhone>>) {
    storeSession(createExpertSession(profile));
    messageApi.success('登录成功');
    router.push('/dashboard');
  }

  function verifyPhone() {
    const normalizedPhone = phone.trim();
    if (!/^1\d{10}$/.test(normalizedPhone) || code.trim() !== '2605') {
      messageApi.error('请输入正确手机号和演示验证码 2605');
      return;
    }

    const account = getExpertAccountByPhone(normalizedPhone);
    if (account) {
      enterWorkspace(account);
      return;
    }

    setVerifiedPhone(normalizedPhone);
    setSetupDraft({
      account: `expert_${normalizedPhone.slice(-4)}`,
      displayName: `专家${normalizedPhone.slice(-4)}`,
      password: '',
      confirmPassword: '',
    });
    messageApi.success('手机号已验证，新账号已创建，请完成初始化');
  }

  function loginWithPassword() {
    const normalizedPhone = passwordPhone.trim();
    if (!/^1\d{10}$/.test(normalizedPhone)) {
      messageApi.error('请输入正确手机号');
      return;
    }

    const account = getExpertAccountByPhone(normalizedPhone);
    if (!account) {
      messageApi.warning('该手机号还没有账号，请先用验证码登录并完成初始化');
      setMode('code');
      setPhone(normalizedPhone);
      return;
    }
    if (account.password !== password) {
      messageApi.error('手机号或密码不正确');
      return;
    }

    enterWorkspace(account);
  }

  function finishSetup() {
    if (!verifiedPhone || !setupDraft) {
      messageApi.warning('请先完成手机号验证');
      return;
    }
    if (setupDraft.password.trim().length < 6) {
      messageApi.warning('密码至少 6 位');
      return;
    }
    if (setupDraft.password !== setupDraft.confirmPassword) {
      messageApi.warning('两次输入的密码不一致');
      return;
    }

    const account = saveExpertAccount({
      phone: verifiedPhone,
      account: setupDraft.account,
      displayName: setupDraft.displayName,
      password: setupDraft.password,
    });
    storeSession(createExpertSession(account));
    messageApi.success('账号初始化完成');
    router.push('/dashboard');
  }

  return (
    <main className="expert-app-bg">
      {contextHolder}
      <section className="expert-phone expert-login-shell">
        <div className="expert-login-brand">
          <span>研学宝专家合作中心</span>
          <h1>专家端</h1>
          <p>面向行业专家与机构的微信 H5 工作台，一个账号运营一个智能体。</p>
        </div>
        <div className="expert-login-card">
          {!verifiedPhone ? (
            <div className="expert-stack">
              <div className="expert-login-flow-header">
                <strong>手机号登录</strong>
                <span>支持验证码登录和密码登录。新手机号通过验证码后自动创建账号，再完成初始化。</span>
              </div>
              <Segmented
                block
                value={mode}
                onChange={(value) => setMode(value as LoginMode)}
                options={[
                  { label: '验证码登录', value: 'code' },
                  { label: '密码登录', value: 'password' },
                ]}
              />
              {mode === 'code' ? (
                <div className="expert-form-stack">
                  <label>手机号
                    <Input prefix={<PhoneOutlined />} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="请输入手机号" />
                  </label>
                  <label>验证码
                    <Input value={code} onChange={(event) => setCode(event.target.value)} placeholder="演示验证码 2605" />
                  </label>
                  <Button block size="large" type="primary" onClick={verifyPhone}>
                    手机号验证登录
                  </Button>
                </div>
              ) : null}
              {mode === 'password' ? (
                <div className="expert-form-stack">
                  <label>手机号
                    <Input prefix={<PhoneOutlined />} value={passwordPhone} onChange={(event) => setPasswordPhone(event.target.value)} placeholder="请输入手机号" />
                  </label>
                  <label>登录密码
                    <Input.Password prefix={<LockOutlined />} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="请输入登录密码" />
                  </label>
                  <Button block size="large" type="primary" onClick={loginWithPassword}>
                    手机号密码登录
                  </Button>
                </div>
              ) : null}
              <p className="expert-login-note">演示老账号：13800000000 / Yanxuebao@2026；新手机号请用验证码初始化。</p>
            </div>
          ) : null}

          {verifiedPhone && setupDraft ? (
            <div className="expert-stack">
              <div className="expert-login-flow-header">
                <strong>初始化账号</strong>
                <span>{verifiedPhone} 已完成验证，请设置账号名、展示名和登录密码。</span>
              </div>
              <div className="expert-form-stack">
                <label>账号名
                  <Input
                    prefix={<UserOutlined />}
                    value={setupDraft.account}
                    onChange={(event) => setSetupDraft((current) => current ? { ...current, account: event.target.value } : current)}
                    placeholder="用于后台账号识别"
                  />
                </label>
                <label>展示名
                  <Input
                    prefix={<UserOutlined />}
                    value={setupDraft.displayName}
                    onChange={(event) => setSetupDraft((current) => current ? { ...current, displayName: event.target.value } : current)}
                    placeholder="展示在专家端首页"
                  />
                </label>
                <label>登录密码
                  <Input.Password
                    prefix={<LockOutlined />}
                    value={setupDraft.password}
                    onChange={(event) => setSetupDraft((current) => current ? { ...current, password: event.target.value } : current)}
                    placeholder="至少 6 位"
                  />
                </label>
                <label>确认密码
                  <Input.Password
                    prefix={<LockOutlined />}
                    value={setupDraft.confirmPassword}
                    onChange={(event) => setSetupDraft((current) => current ? { ...current, confirmPassword: event.target.value } : current)}
                    placeholder="请再次输入密码"
                  />
                </label>
                <Button block size="large" type="primary" onClick={finishSetup}>
                  完成初始化并进入首页
                </Button>
                <Button block className="expert-top-gap" onClick={() => { setVerifiedPhone(''); setSetupDraft(null); }}>
                  返回手机号验证
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
