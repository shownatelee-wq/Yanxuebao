'use client';

import { Button, Form, Input, message } from 'antd';
import { useRouter } from 'next/navigation';
import { submitTeamJoinCode } from '../../../../lib/device-team-data';
import { WatchHero, WatchSection } from '../../../../lib/watch-ui';

export default function DeviceTeamJoinPage() {
  const [form] = Form.useForm<{ code: string }>();
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();

  return (
    <div className="device-page-stack">
      {contextHolder}
      <WatchHero
        title="加入团队"
        subtitle="输入导师发放的 6 位授权码后，可自动加入对应研学团队。授权码仅在本次研学期间有效。"
        tags={[{ label: '仅授权码加入' }, { label: '6 位数字', color: 'cyan' }]}
      />

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
            messageApi.success('已加入团队');
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
            '授权码由导师发放，仅在对应研学日期内有效。',
            '输入成功后会自动加入团队；如已开放小组任务，再到小组页选择加入小组。',
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
            加入团队
          </Button>
          <Button block onClick={() => router.push('/team')}>
            团队列表
          </Button>
        </div>
      </div>
    </div>
  );
}
