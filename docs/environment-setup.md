# 环境准备说明

## 1. 开发环境

- Node.js：`v23.x`
- pnpm：`v10.x`
- Python：`3.9+`
- Docker：当前不作为前期必需条件
- 数据库：云端 PostgreSQL

## 2. 必备环境变量

参考根目录 `.env.example`：

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_TTL`
- `JWT_REFRESH_TTL`

说明：

- 当前导师端、家长端、专家端、运营后台都按纯前端本地演示数据运行，不依赖 `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_API_BASE_URL` 仅在设备端需要联调真实 API 时才需要配置

## 3. 数据库策略

- 一期先直接连接云端 PostgreSQL。
- 不使用 Docker 作为当前开发前置条件。
- Prisma 作为 ORM 与 schema/migration 管理工具。

## 4. 推荐的云端资源

- 一个共享开发库：`yanxuebao_dev`
- 一个测试库：`yanxuebao_test`
- 每次结构调整通过 Prisma migration 记录
