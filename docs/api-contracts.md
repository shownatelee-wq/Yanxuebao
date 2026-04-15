# 首版 API 契约清单

本清单用于开发前准备阶段统一接口边界，字段会在正式开发中细化。

## 1. 鉴权

- `POST /api/auth/web/login`
  - 说明：家长端、导师端、专家端、后台账号密码登录
  - 请求：`AccountPasswordLoginDto`
  - 响应：`AuthSessionDto`
- `POST /api/auth/device/login`
  - 说明：设备端授权码登录
  - 请求：`DeviceAuthorizationCodeLoginDto`
  - 响应：`AuthSessionDto`
- `POST /api/auth/refresh`
  - 说明：刷新 access token

## 2. 学员与设备

- `GET /api/students/:id`
- `POST /api/students`
- `GET /api/students/:id/growth`
- `POST /api/devices/bind`
- `GET /api/devices/:code`

## 3. 团队与小组

- `GET /api/teams`
- `POST /api/teams`
- `GET /api/teams/:id`
- `GET /api/teams/:id/groups`
- `POST /api/groups`
- `PATCH /api/groups/:id`

## 4. 任务与作品

- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `POST /api/works`
- `PATCH /api/works/:id`

## 5. 评分与报告

- `GET /api/scores`
- `POST /api/scores/confirm`
- `POST /api/scores/batch-confirm`
- `GET /api/reports/:id`
- `POST /api/reports/generate`

## 6. 成长与评测

- `GET /api/growth/:studentId/records`
- `GET /api/growth/:studentId/capability-index`
- `POST /api/growth/:studentId/parent-assessment`

## 7. 专家内容

- `GET /api/courses`
- `POST /api/courses`
- `GET /api/knowledge`
- `POST /api/knowledge`
- `GET /api/challenges`
- `POST /api/challenges`
- `GET /api/news`
- `POST /api/news`

## 8. 运营后台

- `GET /api/admin/organizations`
- `POST /api/admin/organizations`
- `GET /api/admin/task-templates`
- `POST /api/admin/task-templates`
- `GET /api/admin/device-orders`
- `GET /api/admin/inventory`

