'use client';

import '@ant-design/v5-patch-for-react-19';
import { CheckCircleOutlined, EditOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Empty, Form, Input, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { type ChangeEvent, useEffect, useMemo } from 'react';
import { ParentRouteFallback } from './parent-route-fallback';
import { ParentPhoneFrame, ParentSubpageShell, useParentSessionReady } from './parent-mobile-shell';
import { useParentStore, type ParentStudent, type StudentInput } from '../lib/parent-store';

function StudentAvatar({ student }: { student: ParentStudent }) {
  return (
    <div className="parent-avatar">
      {student.avatarImage ? (
        <span
          className="parent-avatar-photo"
          role="img"
          aria-label={`${student.name}头像`}
          style={{ backgroundImage: `url(${student.avatarImage})` }}
        />
      ) : (
        student.avatar
      )}
    </div>
  );
}

function StudentCard({
  student,
  onEdit,
  onAccount,
  onBindDevice,
}: {
  student: ParentStudent;
  onEdit: () => void;
  onAccount: () => void;
  onBindDevice: () => void;
}) {
  return (
    <section className="parent-student-manage-card">
      <div className="parent-student-manage-top">
        <StudentAvatar student={student} />
        <div className="parent-student-manage-main">
          <strong>{student.name}</strong>
          <span>
            {student.school} · {student.grade}
          </span>
          <em>研学宝 ID {student.yxbId}</em>
          <em>证件号 {student.idNumber || '待补充'}</em>
        </div>
        <Tag color={student.setupState === 'ready' ? 'green' : 'gold'}>
          {student.setupState === 'ready' ? '已绑定设备' : '待绑定设备'}
        </Tag>
      </div>

      <div className="parent-student-account-strip">
        <div>
          <span>学员账号</span>
          <strong>{student.account.username}</strong>
        </div>
        <div>
          <span>初始密码</span>
          <strong>{student.account.initialPassword}</strong>
        </div>
      </div>

      <div className="parent-action-row compact">
        <Button size="small" icon={<EditOutlined />} onClick={onEdit}>
          编辑资料
        </Button>
        <Button size="small" icon={<UserOutlined />} onClick={onAccount}>
          查看账号
        </Button>
        <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={onBindDevice}>
          {student.device ? '更换设备' : '绑定设备'}
        </Button>
      </div>
    </section>
  );
}

export function ParentStudentsScreen() {
  const router = useRouter();
  const sessionReady = useParentSessionReady();
  const store = useParentStore();

  if (!sessionReady || !store.hydrated) {
    return <ParentRouteFallback label="正在进入学员管理" />;
  }

  return (
    <ParentPhoneFrame>
      <ParentSubpageShell
        title="学员管理"
        subtitle="我的"
        onBack={() => router.push('/me')}
        footer={
          <Button block type="primary" icon={<PlusOutlined />} onClick={() => router.push('/me/students/editor')}>
            创建学员
          </Button>
        }
      >
        {store.state.students.length ? (
          <div className="parent-card-list">
            <section className="parent-editor-intro">
              <strong>管理家庭学员与账号</strong>
              <span>每位学员创建后会自动生成账号，可继续绑定专属研学宝设备。</span>
            </section>
            {store.state.students.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onEdit={() => router.push(`/me/students/editor?studentId=${student.id}`)}
                onAccount={() => router.push(`/me/students/account?studentId=${student.id}`)}
                onBindDevice={() => router.push(`/me/device/scan?studentId=${student.id}`)}
              />
            ))}
          </div>
        ) : (
          <section className="parent-empty-guide onboarding">
            <UserOutlined />
            <strong>还没有学员</strong>
            <p>先创建一位学员账号，后续才能绑定研学宝并开始家庭研学。</p>
            <Button type="primary" onClick={() => router.push('/me/students/editor')}>
              添加第一位学员
            </Button>
          </section>
        )}
      </ParentSubpageShell>
    </ParentPhoneFrame>
  );
}

export function ParentStudentEditorScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionReady = useParentSessionReady();
  const store = useParentStore();
  const [form] = Form.useForm<StudentInput>();
  const avatarImage = Form.useWatch('avatarImage', form);
  const avatarText = Form.useWatch('avatar', form);

  const studentId = searchParams.get('studentId');
  const editingStudent = useMemo(
    () => (studentId ? store.state.students.find((student) => student.id === studentId) ?? null : null),
    [store.state.students, studentId],
  );

  useEffect(() => {
    if (!store.hydrated) {
      return;
    }

    if (editingStudent) {
      form.setFieldsValue({
        name: editingStudent.name,
        idNumber: editingStudent.idNumber,
        birthday: editingStudent.birthday,
        city: editingStudent.city,
        school: editingStudent.school,
        grade: editingStudent.grade,
        avatar: editingStudent.avatar,
        avatarImage: editingStudent.avatarImage,
      });
      return;
    }

    form.setFieldsValue({
      birthday: '2016-09-01',
      idNumber: '',
      city: '深圳',
      school: '',
      grade: '',
      avatar: '',
      avatarImage: '',
    });
  }, [editingStudent, form, store.hydrated]);

  function goBack() {
    router.push('/me/students');
  }

  function saveStudent(values: StudentInput) {
    if (editingStudent) {
      store.updateStudent(editingStudent.id, values);
      router.push('/me/students');
      return;
    }
    const createdId = store.addStudent(values);
    router.push(`/me/students/account?studentId=${createdId}`);
  }

  function handleAvatarFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        form.setFieldValue('avatarImage', reader.result);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  if (!sessionReady || !store.hydrated) {
    return <ParentRouteFallback label="正在进入学员资料页" />;
  }

  if (studentId && !editingStudent) {
    return (
      <ParentPhoneFrame>
        <ParentSubpageShell title="学员资料" subtitle="我的" onBack={goBack}>
          <section className="parent-empty-guide">
            <Empty description="没有找到这位学员" />
            <Button type="primary" onClick={goBack}>
              返回学员管理
            </Button>
          </section>
        </ParentSubpageShell>
      </ParentPhoneFrame>
    );
  }

  return (
    <ParentPhoneFrame>
      <ParentSubpageShell
        title={editingStudent ? '编辑学员' : '添加学员'}
        subtitle="我的"
        onBack={goBack}
        footer={
          <Button block type="primary" onClick={() => form.submit()}>
            {editingStudent ? '保存资料' : '创建学员账号'}
          </Button>
        }
      >
        <section className="parent-editor-intro">
          <strong>{editingStudent ? '更新学员档案' : '填写学员基础信息'}</strong>
          <span>系统会自动生成学员账号、初始密码和研学宝 ID。</span>
        </section>

        <Form form={form} layout="vertical" onFinish={saveStudent} className="parent-editor-form">
          <Form.Item name="name" label="学员姓名" rules={[{ required: true, message: '请输入学员姓名' }]}>
            <Input placeholder="例如 林一诺" />
          </Form.Item>
          <Form.Item name="idNumber" label="证件号码" rules={[{ required: true, message: '请输入证件号码' }]}>
            <Input placeholder="用于与学校、研学机构名单匹配同步" />
          </Form.Item>
          <Form.Item name="birthday" label="出生日期" rules={[{ required: true, message: '请选择出生日期' }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item name="city" label="所在城市" rules={[{ required: true, message: '请输入所在城市' }]}>
            <Input placeholder="例如 深圳" />
          </Form.Item>
          <Form.Item name="school" label="所在学校" rules={[{ required: true, message: '请输入所在学校' }]}>
            <Input placeholder="例如 南山实验学校" />
          </Form.Item>
          <Form.Item name="grade" label="当前年级" rules={[{ required: true, message: '请输入当前年级' }]}>
            <Input placeholder="例如 五年级" />
          </Form.Item>
          <Form.Item name="avatarImage" hidden>
            <Input />
          </Form.Item>
          <div className="parent-avatar-uploader">
            <label>
              <input type="file" accept="image/*" onChange={handleAvatarFileChange} />
              <span className="parent-avatar-uploader-preview">
                {avatarImage ? (
                  <span
                    className="parent-avatar-uploader-photo"
                    role="img"
                    aria-label="学员头像预览"
                    style={{ backgroundImage: `url(${avatarImage})` }}
                  />
                ) : (
                  <em>{avatarText || '头像'}</em>
                )}
              </span>
              <strong>{avatarImage ? '更换头像' : '上传头像'}</strong>
              <small>支持从手机相册选择或拍照</small>
            </label>
            {avatarImage ? (
              <Button size="small" onClick={() => form.setFieldValue('avatarImage', '')}>
                恢复文字头像
              </Button>
            ) : null}
          </div>
          <Form.Item name="avatar" label="头像文字">
            <Input placeholder="未上传照片时显示，例如 一诺" maxLength={4} />
          </Form.Item>
        </Form>
      </ParentSubpageShell>
    </ParentPhoneFrame>
  );
}

export function ParentStudentAccountScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionReady = useParentSessionReady();
  const store = useParentStore();

  const studentId = searchParams.get('studentId');
  const student = useMemo(
    () => (studentId ? store.state.students.find((item) => item.id === studentId) ?? null : null),
    [store.state.students, studentId],
  );

  if (!sessionReady || !store.hydrated) {
    return <ParentRouteFallback label="正在生成学员账号" />;
  }

  if (!student) {
    return (
      <ParentPhoneFrame>
        <ParentSubpageShell title="学员账号" subtitle="我的" onBack={() => router.push('/me/students')}>
          <section className="parent-empty-guide">
            <Empty description="没有找到学员账号" />
            <Button type="primary" onClick={() => router.push('/me/students')}>
              返回学员管理
            </Button>
          </section>
        </ParentSubpageShell>
      </ParentPhoneFrame>
    );
  }

  return (
    <ParentPhoneFrame>
      <ParentSubpageShell
        title="学员账号"
        subtitle="我的"
        onBack={() => router.push('/me/students')}
        footer={
          <div className="parent-split-footer">
            <Button block onClick={() => router.push('/me/students')}>
              稍后再说
            </Button>
            <Button block type="primary" onClick={() => router.push(`/me/device/scan?studentId=${student.id}`)}>
              立即绑定设备
            </Button>
          </div>
        }
      >
        <section className="parent-success-panel">
          <CheckCircleOutlined />
          <strong>学员账号创建成功</strong>
          <span>{student.name} 现在已经拥有可登录的研学宝账号。</span>
        </section>

        <section className="parent-account-card">
          <div className="parent-account-head">
            <StudentAvatar student={student} />
            <div>
              <strong>{student.name}</strong>
              <span>
                {student.school} · {student.grade}
              </span>
            </div>
          </div>
          <div className="parent-account-grid">
            <span>
              研学宝 ID
              <strong>{student.yxbId}</strong>
            </span>
            <span>
              证件号码
              <strong>{student.idNumber || '待补充'}</strong>
            </span>
            <span>
              学员账号
              <strong>{student.account.username}</strong>
            </span>
            <span>
              初始密码
              <strong>{student.account.initialPassword}</strong>
            </span>
            <span>
              创建时间
              <strong>{student.account.createdAt}</strong>
            </span>
            <span>
              激活状态
              <strong>{student.account.status}</strong>
            </span>
            <span>
              设备绑定
              <strong>{student.device ? '已完成' : '待绑定'}</strong>
            </span>
          </div>
        </section>
      </ParentSubpageShell>
    </ParentPhoneFrame>
  );
}
