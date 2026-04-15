# 接口烟测报告

日期：`2026-04-09`

## 目标

验证当前代码是否已经能支撑首批真实业务闭环，而不只是页面和假数据。

## 环境

- API：`pnpm --filter @yanxuebao/api dev`
- 基础地址：`http://localhost:3001/api`
- 数据源：`Prisma 优先，DemoDataService 回退`
- 烟测脚本：`pnpm smoke:test`

## 已验证链路

### 1. 账号与设备授权

- 家长端登录：通过
- 导师端登录：通过
- 专家端登录：通过
- 设备端授权码登录：通过

### 2. 团体研学主闭环

- 导师创建团队：通过
- 导师创建任务：通过
- 任务分页查询：通过
- 文件上传：通过
- 设备端提交作品：通过
- 导师确认评分：通过
- 导师生成报告：通过
- 家长查询成长记录：通过

### 3. 家长侧查询链路

- 家长查询学员列表：通过
- 家长查询 AI 记录：通过
- 家长查询成长记录：通过

### 4. 专家内容链路

- 专家创建课程：通过

## 烟测结果摘要

```json
{
  "tutorLogin": 201,
  "parentLogin": 201,
  "deviceLogin": 201,
  "expertLogin": 201,
  "createTeam": 201,
  "createTask": 201,
  "listTasksItems": 1,
  "uploadFile": 201,
  "submitWork": 201,
  "confirmScore": 201,
  "report": 201,
  "parentGrowthRecords": 3,
  "parentStudents": 1,
  "aiRecords": 2,
  "createCourse": 201
}
```

## 过程中修复的问题

- 修复了 API `dev` 脚本使用 `tsx watch` 导致 Nest 运行时依赖注入失效的问题
- API 入口已补充 `reflect-metadata`
- 守卫逻辑改成无 `Reflector` 依赖实现，降低运行态注入风险

## 当前结论

当前代码已经不是“只有界面骨架”的状态，而是具备了首批接口可用、分页与上传可测、页面可接、闭环可走通、设备端可单独可看的基础。
