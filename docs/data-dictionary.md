# 首版数据字典

## 1. 用户与主体

- `User`
  - 作用：平台统一账号主体
  - 核心字段：`account`、`passwordHash`、`role`、`displayName`
- `StudentProfile`
  - 作用：学员档案
  - 核心字段：`name`、`city`、`school`、`grade`、`primaryParentUserId`
- `Organization`
  - 作用：学校、机构、景区、旅行社等合作主体
  - 核心字段：`name`、`type`、`contactName`、`contactPhone`

## 2. 设备与绑定

- `Device`
  - 作用：设备主数据
  - 核心字段：`deviceCode`、`serialNumber`、`mode`
- `DeviceBinding`
  - 作用：设备与学员绑定关系
  - 核心字段：`deviceId`、`studentId`、`boundAt`、`unboundAt`

## 3. 团队与任务

- `Team`
  - 作用：团体研学组织单元
  - 核心字段：`organizationId`、`name`、`startDate`
- `Group`
  - 作用：团队下的小组单元
  - 核心字段：`teamId`、`name`、`badgeUrl`
- `TeamMember`
  - 作用：团队/小组成员关系
  - 核心字段：`teamId`、`studentId`、`groupId`、`roleName`
- `TaskTemplate`
  - 作用：任务库模板
  - 核心字段：`title`、`taskType`、`requirementTemplate`
- `Task`
  - 作用：实际下发任务
  - 核心字段：`teamId`、`groupId`、`title`、`taskType`、`status`
- `Work`
  - 作用：学员或小组提交作品
  - 核心字段：`taskId`、`studentId`、`groupId`、`type`、`content`

## 4. 评分与成长

- `ScoreRecord`
  - 作用：AI 分与导师分记录
  - 核心字段：`taskId`、`workId`、`aiScore`、`tutorScore`、`status`
- `Report`
  - 作用：研学报告
  - 核心字段：`studentId`、`teamId`、`title`、`status`
- `CapabilityIndexRecord`
  - 作用：能力指数变化记录
  - 核心字段：`studentId`、`elementKey`、`source`、`score`
- `GrowthValueRecord`
  - 作用：成长值明细
  - 核心字段：`studentId`、`sourceType`、`delta`、`description`

## 5. 内容供给

- `Course`
  - 作用：课程主数据
  - 核心字段：`title`、`summary`、`format`、`status`
- `KnowledgeItem`
  - 作用：知识库条目
  - 核心字段：`title`、`category`、`content`
- `Challenge`
  - 作用：难题挑战
  - 核心字段：`title`、`summary`、`difficulty`、`status`
- `News`
  - 作用：资讯内容
  - 核心字段：`title`、`summary`、`content`、`publishedAt`

## 6. 消息

- `Message`
  - 作用：系统消息、团队广播、小组广播、定向消息
  - 核心字段：`type`、`title`、`content`、`senderUserId`、`teamId`、`groupId`

