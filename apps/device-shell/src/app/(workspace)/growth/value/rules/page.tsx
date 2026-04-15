'use client';

import { getGrowthRulesGrouped } from '../../../../../lib/device-growth-data';
import { WatchActionButtons, WatchHero, WatchSection } from '../../../../../lib/watch-ui';

export default function DeviceGrowthValueRulesPage() {
  const groups = getGrowthRulesGrouped();

  return (
    <div className="device-page-stack">
      <WatchHero title="成长值规则" subtitle="按研学任务、专家课程、日常使用三类查看成长值口径。" />
      {groups.map((group) => (
        <WatchSection key={group.group} title={group.group}>
          <div className="device-mini-list">
            {group.items.map((rule) => (
              <div key={rule.id} className="device-mini-item">
                <div className="device-mini-item-title">
                  <span>{rule.title}</span>
                </div>
                <p className="device-mini-item-desc">{rule.summary}</p>
              </div>
            ))}
          </div>
        </WatchSection>
      ))}
      <WatchActionButtons primary={{ label: '明细', path: '/growth/value/details' }} secondary={{ label: '成长值', path: '/growth/value' }} />
    </div>
  );
}
