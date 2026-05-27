'use client';

import '@ant-design/v5-patch-for-react-19';
import { CheckCircleOutlined, SafetyOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Button, Carousel, Tag } from 'antd';
import { useRouter } from 'next/navigation';
import { ParentRouteFallback } from './parent-route-fallback';
import { ParentPhoneFrame, ParentSubpageShell, useParentSessionReady } from './parent-mobile-shell';
import { useParentStore } from '../lib/parent-store';

export function ParentDeviceAdScreen() {
  const router = useRouter();
  const sessionReady = useParentSessionReady();
  const store = useParentStore();

  if (!sessionReady || !store.hydrated) {
    return <ParentRouteFallback label="正在进入研学宝广告页" />;
  }

  const ads = [...store.state.deviceAds]
    .filter((item) => item.enabled !== false)
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));

  function openOrder() {
    const orderId = store.createOrder({
      type: '研学宝',
      title: '研学宝智能硬件家庭套装',
      amount: 1299,
      status: '待支付',
      productName: '研学宝 Explorer S1 家庭套装',
      sourceLabel: '研学宝广告页',
      description: '从图文广告页进入订购流程，请填写收货信息后模拟支付。',
      receiver: store.state.parentProfile.name,
      address: '',
      phone: store.state.parentProfile.phone,
    });
    router.push(`/home?orderId=${orderId}`);
  }

  return (
    <ParentPhoneFrame>
      <ParentSubpageShell
        title="研学宝订购"
        subtitle="图文广告"
        onBack={() => router.push('/device')}
        footer={
          <Button block size="large" type="primary" icon={<ShoppingOutlined />} onClick={openOrder}>
            立即订购
          </Button>
        }
      >
        <section className="parent-device-ad-hero">
          <span>研学宝 Explorer S1</span>
          <strong>把研学现场变成孩子的能力成长资料库</strong>
          <p>AI 问答、拍照识别、任务作品、定位安全和能力雷达统一沉淀到家长端。</p>
        </section>

        <section className="parent-section parent-device-ad-carousel">
          <Carousel autoplay dots>
            {ads.map((ad) => (
              <article key={ad.id} className={`parent-device-ad-slide ${ad.imageTone}`}>
                <span className="parent-device-ad-image" role="img" aria-label={ad.title} style={{ backgroundImage: `url(${ad.imageUrl})` }} />
                <div>
                  <strong>{ad.title}</strong>
                  <p>{ad.subtitle}</p>
                  <div className="parent-tag-row">
                    {ad.features.map((feature) => (
                      <Tag key={feature}>{feature}</Tag>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </Carousel>
        </section>

        <section className="parent-card-list">
          <article className="parent-device-value-card">
            <CheckCircleOutlined />
            <div>
              <strong>任务闭环</strong>
              <span>家庭任务下发到设备端，作品同步回家长端评分，能力指数即时更新。</span>
            </div>
          </article>
          <article className="parent-device-value-card">
            <SafetyOutlined />
            <div>
              <strong>安全守护</strong>
              <span>定位、轨迹、联系人和 SoS 消息集中管理，适配研学现场与日常出行。</span>
            </div>
          </article>
          <article className="parent-device-value-card price">
            <ShoppingOutlined />
            <div>
              <strong>家庭套装 1299 元</strong>
              <span>含研学宝硬件、亲子账号、AI 能力、成长报告与家庭研学任务能力。</span>
            </div>
          </article>
        </section>
      </ParentSubpageShell>
    </ParentPhoneFrame>
  );
}
