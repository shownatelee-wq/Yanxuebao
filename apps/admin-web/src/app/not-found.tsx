import { Button, Result } from 'antd';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="center-screen">
      <Result
        status="404"
        title="页面不存在"
        subTitle="请检查地址是否正确，或从后台导航中重新进入。"
        extra={
          <Button type="primary">
            <Link href="/dashboard">返回后台首页</Link>
          </Button>
        }
      />
    </main>
  );
}
