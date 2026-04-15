# 联调约定（首版）

## 1. Token 传递

- Web 端与后台：使用 `Authorization: Bearer <access_token>`
- 设备端：授权码登录换取 access token 后，同样使用 Bearer token
- refresh token 建议通过 HttpOnly cookie 或受控存储传递，后续按端细化

## 2. 上传规范

- 文件上传统一走 `/api/files/*`
- 支持的正式文件类型：图片、音频
- 视频、网盘等演示能力先走 mock 资源

## 3. 分页规范

- 查询参数：`page`、`pageSize`
- 响应建议字段：`items`、`page`、`pageSize`、`total`

## 4. 时间格式

- 接口传输统一使用 ISO 8601
- 前端展示按中国时区格式化

## 5. 错误码规范

- `AUTH_*`：认证与鉴权
- `USER_*`：用户与学员
- `TEAM_*`：团队与小组
- `TASK_*`：任务与作品
- `REPORT_*`：评分与报告
- `DEVICE_*`：设备与绑定
- `CONTENT_*`：课程、知识库、资讯、挑战
- `SYSTEM_*`：系统级异常

## 6. 需求状态标记

- `正式`：一期必须真实可用
- `演示`：一期只需支持高保真演示
- `待对接`：依赖硬件团队或外部能力

