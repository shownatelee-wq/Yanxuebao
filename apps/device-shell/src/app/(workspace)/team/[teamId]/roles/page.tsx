'use client';

import { Button, Input, Result, Select, Tag, message } from 'antd';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { assignTeamRole, useDeviceTeamSnapshot } from '../../../../../lib/device-team-data';
import { WatchHero, WatchSection } from '../../../../../lib/watch-ui';

const roleOptions = ['组长', '副组长', '观察员', '记录员', '操作员', '统计员', '汇报员', '摄影师', '安全员'];

export default function DeviceTeamRolesScopedPage() {
  const params = useParams<{ teamId: string }>();
  const searchParams = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();
  const { teams, details } = useDeviceTeamSnapshot();
  const team = teams.find((item) => item.id === params.teamId);
  const detail = params.teamId ? details[params.teamId] : undefined;
  const groupId = searchParams.get('groupId') ?? detail?.myGroupId;
  const selectedGroup = detail?.groups.find((group) => group.id === groupId);
  const currentMember = selectedGroup?.members.find((member) => member.isCurrentStudent);
  const canManage = Boolean(currentMember?.canManageRoles);
  const [customRoleMap, setCustomRoleMap] = useState<Record<string, string>>({});

  if (!team || !detail) {
    return <Result status="404" title="未找到团队" extra={<Link href="/team"><Button>更多团队</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <WatchHero
        title="岗位"
        subtitle={canManage ? '当前你是组长/副组长，可为本小组成员设置岗位。' : '普通成员只能查看本小组岗位和分工。'}
        tags={[{ label: selectedGroup?.displayName ?? '待分组' }, { label: currentMember?.roleName ?? detail.myRole, color: 'cyan' }]}
      />

      <WatchSection title="我的岗位">
        <div className="device-mini-item">
          <div className="device-mini-item-title">
            <span>{detail.myMember.name}</span>
            <Tag color="green">{currentMember?.roleName ?? detail.myRole}</Tag>
          </div>
          {(currentMember?.note ?? detail.myMember.note) ? <p className="device-mini-item-desc">{currentMember?.note ?? detail.myMember.note}</p> : null}
        </div>
      </WatchSection>

      <WatchSection title="组员岗位">
        <div className="device-mini-list">
          {(selectedGroup?.members ?? []).map((member) => (
            <div key={member.id} className="device-mini-item">
              <div className="device-mini-item-title">
                <span>{member.name}</span>
                <Tag color={member.isCurrentStudent ? 'green' : 'blue'}>{member.roleName}</Tag>
              </div>
              {canManage && !member.isCurrentStudent ? (
                <div style={{ marginTop: 8 }}>
                  <Select
                    size="small"
                    value={member.rolePreset ?? member.roleName}
                    style={{ width: '100%' }}
                    options={roleOptions.map((role) => ({ label: role, value: role }))}
                    onChange={(value) => {
                      if (!selectedGroup) {
                        return;
                      }
                      assignTeamRole(team.id, selectedGroup.id, member.id, value);
                      messageApi.success(`已把${member.name}设为${value}`);
                    }}
                  />
                  <Input
                    size="small"
                    placeholder="或输入自定义岗位"
                    style={{ marginTop: 8 }}
                    value={customRoleMap[member.id] ?? member.customRoleName ?? ''}
                    onChange={(event) =>
                      setCustomRoleMap((current) => ({
                        ...current,
                        [member.id]: event.target.value,
                      }))
                    }
                    onPressEnter={() => {
                      const customRole = (customRoleMap[member.id] ?? '').trim();
                      if (!customRole || !selectedGroup) {
                        return;
                      }
                      assignTeamRole(team.id, selectedGroup.id, member.id, customRole, customRole);
                      messageApi.success(`已把${member.name}设为${customRole}`);
                    }}
                  />
                </div>
              ) : member.note ? (
                <p className="device-mini-item-desc" style={{ marginTop: 6 }}>{member.note}</p>
              ) : null}
            </div>
          ))}
        </div>
      </WatchSection>

      <div className="device-action-row">
        {selectedGroup ? (
          <Link href={`/team/${team.id}/badge?groupId=${selectedGroup.id}`}>
            <Button type="primary" block>队名队徽</Button>
          </Link>
        ) : null}
        <Link href={selectedGroup ? `/team/${team.id}/groups/${selectedGroup.id}` : `/team/${team.id}/groups`}>
          <Button block>小组详情</Button>
        </Link>
      </div>
    </div>
  );
}
