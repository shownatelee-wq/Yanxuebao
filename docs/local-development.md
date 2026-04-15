# 本地开发说明

## 1. 安装依赖

```bash
pnpm install
```

## 2. 配置环境变量

```bash
cp .env.example .env
```

然后填入可用的云端 PostgreSQL 连接串与 JWT 密钥。

- 如果配置了真实 `DATABASE_URL`，API 会优先使用 Prisma 持久化。
- 如果没有可用数据库，当前开发环境仍可通过回退数据源跑通 Demo。

## 3. 先看设备端 Demo（推荐）

```bash
pnpm dev:device-demo
```

启动后直接打开：

- `http://localhost:3105/login`

可直接使用：

- 授权码：`device_demo_code`
- 设备码：`YXB-DEV-0001`

推荐路径：

- `/login` -> `/home` -> 右上角“演示增强” -> `/demo`

## 4. 生成 Prisma Client

```bash
pnpm --filter @yanxuebao/api prisma:generate
```

## 5. 有数据库时初始化 Prisma

```bash
pnpm --filter @yanxuebao/api prisma:db:push
pnpm --filter @yanxuebao/api prisma:seed
```

## 6. 启动各应用

```bash
pnpm --filter @yanxuebao/api dev
pnpm --filter @yanxuebao/admin-web dev
pnpm --filter @yanxuebao/tutor-web dev
pnpm --filter @yanxuebao/parent-web dev
pnpm --filter @yanxuebao/expert-web dev
pnpm --filter @yanxuebao/device-shell dev
```

## 7. 一次性启动全部应用

```bash
pnpm dev
```

## 8. 校验命令

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm check
```

## 9. 烟测命令

先确保 API 正在运行，然后执行：

```bash
pnpm smoke:test
```
