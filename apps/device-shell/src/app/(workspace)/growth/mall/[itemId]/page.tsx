'use client';

import { Button, Result, Space, message } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getMallItemById, redeemGrowthMallItem, useGrowthState } from '../../../../../lib/device-growth-data';
import { WatchActionButtons } from '../../../../../lib/watch-ui';

export default function DeviceGrowthMallItemPage() {
  const params = useParams<{ itemId: string }>();
  const state = useGrowthState();
  const [messageApi, contextHolder] = message.useMessage();
  const item = getMallItemById(params.itemId, state);

  if (!item) {
    return <Result status="404" title="未找到商品" extra={<Link href="/growth/mall"><Button>返回商城</Button></Link>} />;
  }

  const mallItem = item;

  function handleRedeem() {
    const result = redeemGrowthMallItem(mallItem.id);
    if (!result.ok) {
      messageApi.error(result.reason === 'insufficient' ? '可用成长值不足' : result.reason === 'redeemed' ? '该商品已兑换' : '商品不存在');
      return;
    }
    messageApi.success(`已兑换 ${mallItem.title}`);
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <p className="device-page-title">{mallItem.title}</p>
            <div className="watch-status-pills">
              <span className="watch-status-pill">{mallItem.type}</span>
              <span className="watch-status-pill">需要 {mallItem.cost}</span>
              <span className="watch-status-pill">{mallItem.status}</span>
            </div>
          </Space>
        </div>
        <div className="watch-list-panel">
          <div className="device-mini-list">
            <div className="device-mini-item watch-list-card">
              <div className="device-mini-item-title">
                <span>可用成长值</span>
                <strong>{state.growthValueSummary.available}</strong>
              </div>
              <p className="device-mini-item-desc">兑换后会从可用成长值中扣减相应分值。</p>
            </div>
            <div className="device-mini-item watch-list-card">
              <div className="device-mini-item-title">
                <span>兑换说明</span>
              </div>
              <p className="device-mini-item-desc">{mallItem.exchangeNote}</p>
            </div>
          </div>
        </div>
        <div className="watch-bottom-dock">
          <div style={{ marginBottom: 10 }}>
            <Button type="primary" block disabled={mallItem.status !== '可兑换'} onClick={handleRedeem}>
              立即兑换
            </Button>
          </div>
          <WatchActionButtons primary={{ label: '成长值', path: '/growth/value' }} secondary={{ label: '商城', path: '/growth/mall' }} />
        </div>
      </div>
    </div>
  );
}
