# 研学宝 V1 Monorepo

本仓库承载研学宝 V1 的正式研发与设备端 Demo 验证，当前已进入 `V1 Alpha` 阶段，支持设备端 Demo 开箱直达、五端联调与 API 持久化优先运行。设备端当前重点按“手表设备交互”去做高保真演示，而不是普通 H5 页面堆叠。

## 先看设备端 Demo

### 一条命令启动

```bash
pnpm install
pnpm dev:device-demo
```

### 直达地址

- 设备端登录页：`http://localhost:3105/login`
- 登录后主页：`http://localhost:3105/home`
- 任务页：`http://localhost:3105/tasks`
- 消息页：`http://localhost:3105/messages`
- 拍拍页：`http://localhost:3105/capture`
- 课程页：`http://localhost:3105/courses`
- 演示增强总览：`http://localhost:3105/demo`

### 演示授权信息

- 授权码：`device_demo_code`
- 默认设备码：`YXB-DEV-0001`

### 推荐演示路径

- 登录 -> 首页 `/home`
- 首页直接点击：任务 `/tasks`、拍拍 `/capture`、问问 `/ask`、闪记 `/flash-note`、识物 `/identify`
- 再进入团队 `/team`、成长 `/growth`、消息 `/messages`、课程 `/courses`
- 最后按需要进入演示增强总览 `/demo`，查看社交 / 对讲会议 / 朋友圈 / 支付 / 网盘 / AI 创作等扩展页

## 目录说明

- `apps/api`：NestJS API 服务
- `apps/admin-web`：运营后台
- `apps/tutor-web`：导师端
- `apps/parent-web`：家长端
- `apps/expert-web`：专家端
- `apps/device-shell`：设备端 WebView/H5 外壳
- `packages/ui`：共享 UI 组件
- `packages/config`：共享常量与环境配置
- `packages/types`：共享类型、枚举与 API 契约
- `packages/eslint-config`：共享 ESLint 配置
- `packages/tsconfig`：共享 TypeScript 配置
- `docs`：接口、数据字典、联调约定、账号、烟测与待硬件对接清单

## 当前完成情况

### 已完成

- API 鉴权、角色守卫、学员/设备、团队/任务、作品/评分、报告/成长、内容供给、消息与 AI 记录接口
- 运营后台首批正式能力：登录、机构、任务模板、题库、库存
- 导师端首批正式能力：登录、团队、小组、任务、评分、报告
- 家长端首批正式能力：登录、学员管理、设备绑定、能力成长、家庭任务、AI 记录
- 专家端首批正式能力：登录、课程、知识库、挑战、资讯
- 设备端正式基础能力：授权码登录、首页、团队、任务、成长、AI、我的、SoS
- 设备端手表化重做：手表壳层、手表风格首页、手表主导航
- 设备端正式基础能力补齐：授权码登录、首页、团队、任务、成长、AI、消息、拍拍、课程、我的、SoS
- 设备端演示增强页：演示级能力总览、真机待对接能力清单、社交 / 会议 / 朋友圈 / 支付 / 网盘 / AI 创作页
- 设备端首页 / 任务 / 成长 / AI 已补动态状态与演示反馈
- 设备端 `device bridge` 占位层：已接入人脸登录演示与 SoS 定位演示
- 根级快捷启动脚本：`pnpm dev:api`、`pnpm dev:device`、`pnpm dev:device-demo`
- 全仓 `pnpm check`
- API 与业务烟测脚本：`pnpm smoke:test`
- API 数据层已切到 `Prisma 优先、DemoDataService 回退`
- 设备端已固定可见入口：`http://localhost:3105/login`

### 待继续推进

- 设备端演示动画和视觉细节继续升级
- 设备端更多手表态交互细节，例如消息震动、拍照反馈、快捷返回手势的演示拟真
- 多端 UI 的完整手工回归与体验精修
- 更完整的生产级异常监控、审计日志和权限颗粒度
- 与硬件团队的真机接口联调
- 数据落库从 DemoDataService 迁移到真实 Prisma 持久化

## 启动方式

### 安装依赖

```bash
pnpm install
```

### 启动设备端 Demo（推荐）

```bash
pnpm dev:device-demo
```

### 单独启动全部应用

```bash
pnpm dev
```

### 单独启动 API

```bash
pnpm --filter @yanxuebao/api dev
```

### 常用校验

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm check
```

## 演示账号

- 运营后台：`operator_demo / Yanxuebao@2026`
- 导师端：`tutor_demo / Yanxuebao@2026`
- 家长端：`parent_demo / Yanxuebao@2026`
- 专家端：`expert_demo / Yanxuebao@2026`
- 学员端：`student_demo / Yanxuebao@2026`
- 设备端授权码：`device_demo_code`
- 设备端登录地址：`http://localhost:3105/login`

## 关键文档

- `docs/api-contracts.md`
- `docs/data-dictionary.md`
- `docs/demo-accounts.md`
- `docs/development-todo.md`
- `docs/environment-setup.md`
- `docs/integration-conventions.md`
- `docs/local-development.md`
- `docs/module-owners.md`
- `docs/smoke-test-report.md`
- `docs/hardware-readiness.md`
