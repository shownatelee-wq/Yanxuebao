'use client';

import { Button, Form, Input, message } from 'antd';
import { useRouter } from 'next/navigation';
import { submitTeamJoinCode, submitTeamScanJoin } from '../../../../lib/device-team-data';
import { demoTeams } from '../../../../lib/device-demo-data';
import { WatchHero, WatchSection } from '../../../../lib/watch-ui';

export default function DeviceTeamJoinPage() {
  const [form] = Form.useForm<{ code: string }>();
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();

  return (
    <div className="device-page-stack">
      {contextHolder}
      <WatchHero
        title="扫码入团"
        subtitle="扫码入团是本轮默认入团方式。授权码加入继续保留，作为兼容方案使用。"
        tags={[{ label: '扫码优先' }, { label: '授权码兼容', color: 'cyan' }]}
      />

      <WatchSection title="模拟扫码">
        <div className="device-mini-list">
          {demoTeams
            .filter((team) => team.canScanJoin)
            .map((team) => (
              <div key={team.id} className="device-mini-item">
                <div className="device-mini-item-title">
                  <span>{team.name}</span>
                </div>
                <p className="device-mini-item-desc">{team.lifecycleStatus} · {team.membershipStatus}</p>
                <div className="device-action-chip-row" style={{ marginTop: 8 }}>
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => {
                      const result = submitTeamScanJoin(team.id);
                      if (!result.ok) {
                        messageApi.error(result.reason);
                        return;
                      }
                      messageApi.success(result.membershipStatus === '待审批' ? '扫码申请已提交，等待导师审批' : '扫码成功，已加入团队');
                      router.push(`/team/${result.teamId}`);
                    }}
                  >
                    模拟扫码加入
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </WatchSection>

      <WatchSection title="输入授权码">
        <Form
          form={form}
          layout="vertical"
          initialValues={{ code: '' }}
          onFinish={(values) => {
            const result = submitTeamJoinCode(values.code);
            if (!result.ok) {
              messageApi.error(result.reason);
              return;
            }
            messageApi.success(result.membershipStatus === '待审批' ? '授权码提交成功，等待审批' : '已加入团队');
            router.push(`/team/${result.teamId}`);
          }}
        >
          <Form.Item
            name="code"
            label="授权码"
            rules={[
              { required: true, message: '请输入授权码' },
              { pattern: /^\d{6}$/, message: '请输入 6 位数字授权码' },
            ]}
          >
            <Input inputMode="numeric" maxLength={6} placeholder="请输入 6 位授权码" />
          </Form.Item>
        </Form>
      </WatchSection>

      <WatchSection title="提示">
        <div className="device-mini-list">
          {[
            '扫码入团优先使用，适用于老师或机构在群里分享的团队二维码。',
            '招募中团队提交后通常进入待审批；待出行团队可直接加入。',
            '如果提示无效或过期，请联系导师重新确认。',
          ].map((item) => (
            <div key={item} className="device-mini-item">
              <p className="device-mini-item-desc" style={{ margin: 0 }}>{item}</p>
            </div>
          ))}
        </div>
      </WatchSection>

      <div className="watch-bottom-dock">
        <div className="device-action-row">
          <Button type="primary" block onClick={() => form.submit()}>
            提交授权码
          </Button>
          <Button block onClick={() => router.push('/team')}>
            更多团队
          </Button>
        </div>
      </div>
    </div>
  );
}
