# 春辉综合服务部 — 项目记忆文档

> 本文档是主代理（Orchestrator）的工作记忆，记录设计决策、关键约束、阶段状态。
> 每次恢复上下文时，首先阅读此文档。

---

## 1. 项目基本信息

| 属性 | 值 |
|------|-----|
| 产品名称 | 春辉综合服务部 |
| 产品类型 | 本地化O2O生活服务小程序 |
| 目标市场 | 乡镇、县城下沉市场 |
| 技术栈 | 微信小程序原生 + 云开发(CloudBase) |
| 总页面数 | 34个 |
| 总组件数 | 22个 |
| 总云函数数 | 32个 |
| 数据库集合 | 10个 |

---

## 2. 核心设计决策（已确定）

### 2.1 技术决策
- **前端框架**: 微信小程序原生（WXML + WXSS + JS），不使用任何第三方框架（Taro/Uni-app）
- **后端**: 微信云开发 CloudBase（云函数 + 云数据库 + 云存储）
- **支付方式**: 微信支付 JSAPI
- **地图**: 腾讯位置服务
- **通讯**: 云开发 watch 实时推送 + 5秒轮询兜底
- **状态管理**: 使用小程序 globalData + Storage，不使用 Redux/Mobx

### 2.2 架构决策
- **角色体系**: 4种角色（user/worker/partner/admin），通过 roles 数组支持多角色
- **身份切换**: 长按头像800ms → 账号密码验证 → 切换角色 → 页面整体刷新
- **权限控制**: 前端通过 role 字段判断菜单渲染，后端云函数做二次校验
- **数据冗余**: 关键查询字段（订单中的 categoryName、workerName）做适当冗余
- **软删除**: 所有业务集合均支持 isDeleted 字段

### 2.3 视觉决策
- **主色调**: 绿色系（Accent: #43A047, Action: #2E7D32）
- **渐变**: linear-gradient(135deg, #43A047, #66BB6A)
- **卡片圆角**: 16px
- **卡片阴影**: 0 4px 12px rgba(0,0,0,0.06)
- **3D图标**: 8个核心服务入口使用3D拟物图标，需AI生成
- **字体**: 系统默认（PingFang SC, Roboto, Noto Sans SC）

### 2.4 交互决策
- **底部Tab**: 仅3个（首页/全部服务/我的），保持极简
- **悬浮拨号球**: 所有页面右下角常驻，绿色圆形
- **金刚区**: 2行4列网格，8个核心入口
- **服务橱窗**: 三大版块（家政服务/维修安装/便民信息）
- **下拉刷新**: 所有列表页统一支持
- **上拉加载**: 分页20条/页

---

## 3. 关键约束

### 3.1 微信小程序平台限制
- 单包大小 ≤ 2MB
- 总包大小 ≤ 20MB
- 本地存储 ≤ 10MB
- 页面栈深度 ≤ 10层
- 云函数执行超时 20秒
- 云函数并发有配额限制
- 需要用户授权才能获取手机号、位置等信息

### 3.2 开发约束
- 必须使用微信小程序原生框架
- 必须使用微信云开发
- 不能引入过多npm包（控制包体积）
- 图片资源需要压缩后上传到云存储
- 云数据库查询每次最多100条，需要分页

### 3.3 业务约束
- 普通用户不能发布信息（必须经过合作商认证）
- 身份切换需要账号密码验证
- 所有发布内容需要管理员审核
- 提现需要管理员审核
- 工人入驻需要管理员审核

---

## 4. 数据库Schema概要（10个集合）

| 集合 | 用途 | 关键字段 |
|------|------|---------|
| users | 用户信息 | role, roles, _openid, avatarUrl, nickName, location |
| workers | 工人职业信息 | userId, skills, serviceAreas, pricing, workStatus, certificationStatus |
| categories | 服务分类 | name, icon, parentId, sortOrder |
| orders | 订单 | status, userId, workerId, categoryId, amount, address, appointmentTime |
| messages | 消息 | senderId, receiverId, content, type, orderId, isRead |
| posts | 发布内容 | type(job/marriage), title, content, status, partnerId, viewCount |
| banners | 轮播图 | imageUrl, title, link, sortOrder, status |
| withdrawals | 提现 | userId, amount, status, method, applyTime |
| roleAccounts | 角色账号 | userId, role, account, passwordHash |
| reviews | 评价 | orderId, userId, workerId, rating, content |

---

## 5. 核心业务流程（4条）

### 流程1: 用户下单 → 工人接单 → 完成服务 → 评价
```
用户浏览服务 → 选择工人 → 填写预约信息 → 创建订单(待接单)
→ 工人在接单大厅看到 → 点击抢单 → 订单变为已接单
→ 工人开始服务 → 服务完成
→ 用户确认完成 → 用户评价
```

### 流程2: 工人入驻
```
用户提交工人资料 → 状态:待审核
→ 管理员审核 → 通过(状态:已通过) / 拒绝(状态:已拒绝+原因)
→ 通过后出现在工人列表中
```

### 流程3: 身份切换
```
在"我的"页面长按头像800ms → 弹出身份选择Action Sheet
→ 选择目标角色 → 弹出账号密码输入框
→ 云函数验证账号密码 → 成功则更新globalData中的role → 刷新页面
```

### 流程4: 发布信息审核
```
合作商填写表单 → 提交 → 状态:审核中
→ 管理员审核 → 通过(状态:已通过) / 拒绝(状态:已拒绝+原因)
→ 通过后在前端展示
```

---

## 6. 阶段状态追踪

### Stage 1: 深度分析与核心文档编写 ✅ 已完成
- [x] core_work.md（核心工作文档）- 1201行，34页面/22组件/32云函数
- [x] database_schema.md（数据库Schema）- 10集合/180+字段/58索引
- [x] dev_guide.md（开发说明文档）- 12章/52节/20FAQ
- [x] project_memory.md（项目记忆文档）- 本文件

### Stage 2: 项目骨架搭建与云开发配置 ✅ 已完成
- [x] 初始化小程序项目结构（182个文件）
- [x] 配置 app.json / app.js / app.wxss / config.js
- [x] 编写工具函数库（request.js, util.js, permission.js）
- [x] 编写 SPEC.md 技术规格说明书

### Stage 3-7: M1 MVP核心开发 ✅ 已完成
- [x] 首页 (pages/index/) — 导航栏、Banner、金刚区、资讯、服务橱窗、悬浮拨号球
- [x] 全部服务 (pages/services/) — 左右双栏、分类筛选、工人列表
- [x] 用户中心 (pages/mine/) — 4种角色动态界面、身份切换弹窗
- [x] 工人详情 (pages/workerDetail/) — 信息展示、评价列表、预约入口
- [x] 核心组件 — floatDial, workerCard, roleBadge, statusTag, emptyState, loadingMore
- [x] 核心云函数 — login, getBannerList, getWorkerList, createOrder 等16个
- [x] 占位页面 — 20个次级页面（订单、聊天、发布、管理等）

### Stage 3: 首页开发 ⏳ 待开始
- [ ] 顶部导航栏（地图选址+搜索栏）
- [ ] Banner轮播区
- [ ] 金刚区网格（8入口）
- [ ] 同城头条资讯
- [ ] 密集服务橱窗
- [ ] 全局悬浮拨号球

### Stage 4: 全部服务页开发 ⏳ 待开始
### Stage 5: 用户中心开发 ⏳ 待开始
### Stage 6: 订单与通讯系统 ⏳ 待开始
### Stage 7: 发布与内容管理 ⏳ 待开始
### Stage 8: 素材准备 ⏳ 待开始
### Stage 9: 集成测试 ⏳ 待开始

---

## 7. 关键风险与应对

| 风险 | 影响 | 应对方案 |
|------|------|---------|
| 云开发免费配额不足 | 上线后服务不可用 | 监控用量，必要时升级付费套餐 |
| 包体积超限(2MB) | 无法预览/上传 | 图片放云存储、代码分包、删除无用代码 |
| 地理位置授权被拒 | 无法计算距离 | 提供手动输入地址的备选方案 |
| 微信支付审核不通过 | 无法完成交易闭环 | 预留模拟支付开关用于测试 |
| 并发抢单冲突 | 重复接单 | 云函数中使用数据库事务 |
| 即时通讯延迟高 | 用户体验差 | watch+轮询双重保障 |
| 中老年用户操作困难 | 用户流失 | 大字号、一键拨号、极简交互 |

---

## 8. 开发优先级（4期迭代）

### M1: MVP核心（必须）
- 首页（除动效外全部功能）
- 全部服务页 + 工人列表
- 用户中心（普通用户视角）
- 工人详情页
- 预约下单流程
- 订单管理
- 一键拨号

### M2: 工人体系
- 工人入驻流程
- 我的职业信息编辑
- 接单大厅
- 抢单逻辑
- 工人订单管理

### M3: 合作商+管理后台
- 合作商申请与审核
- 信息发布与管理
- 管理员数据统计
- 用户/工人/订单管理
- Banner管理

### M4: 完善优化
- 即时通讯
- 评价系统
- 收益统计+提现
- 搜索功能
- 动效优化

---

## 9. 文件清单

| 文件 | 路径 | 用途 |
|------|------|------|
| 设计文档 | /mnt/agents/upload/design.md | 原始需求文档 |
| 执行计划 | /mnt/agents/output/plan.md | 执行阶段规划 |
| 核心工作文档 | /mnt/agents/output/core_work.md | 技术方案、清单 |
| 数据库Schema | /mnt/agents/output/database_schema.md | 数据库设计 |
| 开发说明文档 | /mnt/agents/output/dev_guide.md | 开发规范指南 |
| 项目记忆 | /mnt/agents/output/project_memory.md | 本文件 |

---

## 10. 备注

- 所有页面统一使用 pages/pageName/pageName 的四文件结构（.js/.wxml/.wxss/.json）
- 组件统一使用 components/compName/compName 的四文件结构
- 云函数统一使用 cloud/functions/funcName/index.js 结构
- 工具函数放在 utils/ 目录下
- 常量配置放在 config.js 中
- 颜色等变量统一在 app.wxss 中定义CSS变量
