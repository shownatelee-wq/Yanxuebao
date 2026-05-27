'use client';

import { DeleteOutlined, EyeOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Card, Form, Image, Input, InputNumber, List, Space, Switch, Tag, Typography, message } from 'antd';
import { useMemo, useState, type ChangeEvent } from 'react';

const { Title, Text } = Typography;

type MockAd = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  features: string[];
  sortOrder: number;
  enabled: boolean;
};

type AdFormValues = {
  title: string;
  subtitle: string;
  imageUrl: string;
  features: string;
  sortOrder: number;
};

const INITIAL_ADS: MockAd[] = [
  {
    id: 'ad_device_01',
    title: 'AI 问问与拍拍',
    subtitle: '把孩子现场问题、照片和语音沉淀成研学记录',
    imageUrl: '/parent-device-ai.svg',
    features: ['语音问答', '拍照识别', '自动成册'],
    sortOrder: 1,
    enabled: true,
  },
  {
    id: 'ad_device_02',
    title: '能力成长看得见',
    subtitle: '任务评分后自动回写能力元素和成长值',
    imageUrl: '/parent-device-growth.svg',
    features: ['能力雷达', '成长值', '报告回写'],
    sortOrder: 2,
    enabled: true,
  },
  {
    id: 'ad_device_03',
    title: '定位与安全守护',
    subtitle: '查看当前位置、24 小时轨迹和 SoS 消息',
    imageUrl: '/parent-device-safety.svg',
    features: ['实时定位', '轨迹回放', 'SoS 提醒'],
    sortOrder: 3,
    enabled: true,
  },
];

export default function AdminAdsPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<AdFormValues>();
  const [ads, setAds] = useState(INITIAL_ADS);
  const [previewImage, setPreviewImage] = useState('/parent-device-ai.svg');

  const sortedAds = useMemo(() => [...ads].sort((left, right) => left.sortOrder - right.sortOrder), [ads]);

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewImage(reader.result);
        form.setFieldValue('imageUrl', reader.result);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  function createAd(values: AdFormValues) {
    setAds((current) => [
      {
        ...values,
        id: `mock_ad_${Date.now()}`,
        features: String(values.features).split(/[、,，]/).map((item) => item.trim()).filter(Boolean),
        enabled: true,
      },
      ...current,
    ]);
    form.resetFields();
    setPreviewImage('/parent-device-ai.svg');
    messageApi.success('广告图片已加入 mock 列表');
  }

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {contextHolder}
      <div>
        <Title level={3} style={{ marginBottom: 4 }}>
          研学宝广告管理
        </Title>
        <Text type="secondary">前端 mock 管理页，用于演示家长端订购广告图上传、排序、启停和预览。</Text>
      </div>

      <Card title="新增广告图">
        <Form
          form={form}
          layout="vertical"
          initialValues={{ imageUrl: previewImage, sortOrder: sortedAds.length + 1, features: '能力雷达、成长值、报告回写' }}
          onFinish={createAd}
        >
          <Space align="start" size={24} style={{ width: '100%' }}>
            <div style={{ width: 260 }}>
              <Image src={previewImage} alt="广告预览" width={240} height={160} style={{ objectFit: 'contain', border: '1px solid #edf0f2', borderRadius: 8 }} />
              <label style={{ display: 'block', marginTop: 12 }}>
                <Button icon={<UploadOutlined />}>上传广告图片</Button>
                <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
              </label>
            </div>
            <div style={{ flex: 1 }}>
              <Form.Item name="title" label="广告标题" rules={[{ required: true, message: '请输入广告标题' }]}>
                <Input placeholder="例如 AI 问问与拍拍" />
              </Form.Item>
              <Form.Item name="subtitle" label="广告说明" rules={[{ required: true, message: '请输入广告说明' }]}>
                <Input.TextArea rows={3} placeholder="说明研学宝功能与用途" />
              </Form.Item>
              <Form.Item name="features" label="功能标签" rules={[{ required: true, message: '请输入功能标签' }]}>
                <Input placeholder="用顿号或逗号分隔" />
              </Form.Item>
              <Form.Item name="imageUrl" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="sortOrder" label="排序" rules={[{ required: true, message: '请输入排序' }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
              <Button type="primary" icon={<PlusOutlined />} htmlType="submit">
                添加广告
              </Button>
            </div>
          </Space>
        </Form>
      </Card>

      <Card title="广告列表">
        <List
          dataSource={sortedAds}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button key="preview" icon={<EyeOutlined />} onClick={() => setPreviewImage(item.imageUrl)}>
                  预览
                </Button>,
                <Switch
                  key="switch"
                  checked={item.enabled}
                  checkedChildren="启用"
                  unCheckedChildren="停用"
                  onChange={(checked) => setAds((current) => current.map((ad) => (ad.id === item.id ? { ...ad, enabled: checked } : ad)))}
                />,
                <Button key="delete" danger icon={<DeleteOutlined />} onClick={() => setAds((current) => current.filter((ad) => ad.id !== item.id))}>
                  删除
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<Image src={item.imageUrl} alt={item.title} width={92} height={60} style={{ objectFit: 'contain', borderRadius: 6 }} preview={false} />}
                title={
                  <Space>
                    {item.title}
                    <Tag color={item.enabled ? 'green' : 'default'}>{item.enabled ? '启用' : '停用'}</Tag>
                    <Tag>排序 {item.sortOrder}</Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={4}>
                    <span>{item.subtitle}</span>
                    <span>{item.features.map((feature) => <Tag key={feature}>{feature}</Tag>)}</span>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </Space>
  );
}
