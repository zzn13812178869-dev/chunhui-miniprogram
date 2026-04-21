# 春辉综合服务部 — 核心工作文档

> 本文档基于 `design.md` 设计文档系统性分析产出，面向乡镇/县城下沉市场的本地生活服务小程序。
> 技术栈：微信小程序原生框架（WXML + WXSS + JS） + 微信云开发（CloudBase）
> 版本：v1.0 | 更新日期：2024年

---

## 1. 项目概览

### 1.1 项目信息

| 项目属性 | 说明 |
|---------|------|
| **产品名称** | 春辉综合服务部 |
| **产品类型** | 本地化O2O生活服务超级平台 / 同城便民信息门户 |
| **目标市场** | 乡镇、社区、县城等下沉市场 |
| **前端框架** | 微信小程序原生框架（WXML + WXSS + JS） |
| **后端服务** | 微信云开发（CloudBase）：云函数 + 云数据库 + 云存储 |
| **支付能力** | 微信支付（JSAPI支付） |
| **地图服务** | 腾讯位置服务（地址选择、地图展示、距离计算） |
| **即时通讯** | 云开发实时数据推送 + 长轮询消息列表 |
| **身份鉴权** | wx.login + 云开发自带鉴权 |

### 1.2 核心数据

| 指标 | 数量 |
|-----|------|
| 总页面数 | **34个** |
| 可复用组件数 | **22个** |
| 云函数数 | **32个** |
| 角色体系 | 4种（普通用户/工人/合作商/管理员） |
| 核心业务板块 | 6大板块（保洁清洗/养老陪护/搬家安装/家政月嫂/婚姻介绍/招聘求职） |
| Tab导航栏 | 3个（首页/全部服务/我的） |

### 1.3 角色体系总览

| 角色 | 标识值 | 核心能力 |
|------|--------|---------|
| 普通用户 | `"user"` | 浏览服务、预约下单、查看资讯、查看订单 |
| 工人/师傅 | `"worker"` | 发布职业信息、接单抢单、在线沟通、收益提现 |
| 合作商 | `"partner"` | 发布招聘/婚恋信息、查看发布数据、申请提现 |
| 管理员 | `"admin"` | 审核合作商、管理内容/订单/用户、Banner管理、系统设置 |

> **身份切换机制**：在"我的"页面长按头像 800ms → 弹出身份选择 → 输入账号密码 → 切换成功

---

## 2. 页面清单（Page Inventory）

### 2.1 核心Tab页面

| 页面名称 | 页面路径 | 模块 | 核心功能 | 关联API/云函数 | 复杂度 |
|---------|---------|------|---------|--------------|--------|
| 首页（综合生活馆） | `pages/index/index` | 首页 | 顶部吸附导航（地图选址+搜索栏）、Banner轮播、金刚区8入口、同城头条资讯、密集服务橱窗（家政/维修/便民三大版块） | `getBannerList`, `getServiceCategories`, `getNewsList`, `getNearbyServices`, `getUserLocation` | ★★★★★ |
| 全部服务 | `pages/services/services` | 服务 | 左右双栏布局：左侧分类侧边栏（25%宽）+ 右侧工人卡片列表（75%宽）；分类筛选、距离排序、工人展示 | `getWorkerList`, `getServiceCategories`, `getUserLocation` | ★★★★ |
| 用户中心 | `pages/mine/mine` | 我的 | 绿色渐变用户信息卡片、角色判断动态渲染功能菜单（四种角色菜单各不相同）、长按头像身份切换入口、版本号 | `getUserInfo`, `roleSwitch`, `getUnreadCount` | ★★★★ |

### 2.2 首页子页面

| 页面名称 | 页面路径 | 模块 | 核心功能 | 关联API/云函数 | 复杂度 |
|---------|---------|------|---------|--------------|--------|
| 搜索结果页 | `pages/searchResult/searchResult` | 搜索 | 关键词搜索、历史记录、热门搜索、搜索结果分类展示（服务/工人/资讯） | `searchAll`, `getSearchHistory` | ★★★ |
| Banner详情页 | `pages/bannerDetail/bannerDetail` | 首页 | 富文本渲染Banner详情、图片展示、跳转链接处理 | `getBannerDetail` | ★★ |
| 资讯列表页 | `pages/newsList/newsList` | 资讯 | 同城头条全部资讯列表、分类筛选、下拉刷新、上拉加载 | `getNewsList` | ★★★ |
| 资讯详情页 | `pages/newsDetail/newsDetail` | 资讯 | 资讯富文本详情、阅读量统计、分享功能 | `getNewsDetail`, `incrementNewsView` | ★★ |
| 服务分类页 | `pages/serviceCategory/serviceCategory` | 服务 | 单个服务分类下的详情页、服务介绍、价格说明、可预约工人列表 | `getServiceCategoryDetail`, `getWorkersByCategory` | ★★★ |
| 工人详情页 | `pages/workerDetail/workerDetail` | 服务 | 工人头像、姓名、服务类型、从业年限、评分、历史订单数、评价列表、立即预约按钮 | `getWorkerDetail`, `getWorkerReviews`, `getWorkerOrders` | ★★★★ |

### 2.3 订单相关页面

| 页面名称 | 页面路径 | 模块 | 核心功能 | 关联API/云函数 | 复杂度 |
|---------|---------|------|---------|--------------|--------|
| 预约下单页 | `pages/orderCreate/orderCreate` | 订单 | 选择服务类型、选择工人、填写地址（地图选址）、选择时间、填写备注、价格确认、提交订单 | `getServiceDetail`, `createOrder`, `getWorkerList`, `getDefaultAddress` | ★★★★★ |
| 订单列表页 | `pages/orders/orders` | 订单 | Tab切换（全部/待服务/服务中/已完成），角色区分展示不同订单数据 | `getOrderList` | ★★★ |
| 订单详情页 | `pages/orderDetail/orderDetail` | 订单 | 订单状态流转展示、工人信息、服务信息、地址地图、取消订单、确认完成、评价 | `getOrderDetail`, `updateOrderStatus`, `cancelOrder`, `submitReview` | ★★★★ |
| 支付结果页 | `pages/payResult/payResult` | 订单 | 支付成功/失败状态、订单信息摘要、返回首页/查看订单按钮 | `wx.requestPayment` 回调处理 | ★★ |
| 评价页 | `pages/review/review` | 订单 | 星级评分、文字评价、图片上传、提交评价 | `submitReview`, `uploadImage` | ★★★ |

### 2.4 即时通讯页面

| 页面名称 | 页面路径 | 模块 | 核心功能 | 关联API/云函数 | 复杂度 |
|---------|---------|------|---------|--------------|--------|
| 聊天列表页 | `pages/chatList/chatList` | 消息 | 会话列表、最后一条消息预览、未读数红点、长按删除会话 | `getChatList`, `getUnreadCount` | ★★★★ |
| 即时通讯页 | `pages/chat/chat` | 消息 | 单聊界面、文本/图片消息、发送按钮、对方头像、时间戳、消息已读状态 | `getChatHistory`, `createChatMessage`, `watchChatMessages` | ★★★★★ |

### 2.5 工人/师傅中心页面

| 页面名称 | 页面路径 | 模块 | 核心功能 | 关联API/云函数 | 复杂度 |
|---------|---------|------|---------|--------------|--------|
| 我的职业信息 | `pages/workerProfile/workerProfile` | 工人 | 编辑头像、姓名、服务类型、从业年限、服务区域、个人简介、技能证书上传、联系方式 | `getWorkerProfile`, `updateWorkerProfile`, `uploadImage` | ★★★★ |
| 接单大厅 | `pages/orderHall/orderHall` | 工人 | 实时订单池展示、距离计算、一键抢单、刷新列表、筛选条件（距离/服务类型/价格） | `getPendingOrders`, `grabOrder`, `getUserLocation` | ★★★★★ |
| 收益统计页 | `pages/income/income` | 工人 | 本月/累计收益、收益趋势折线图、订单收益明细、提现入口 | `getIncomeStats`, `getIncomeDetail` | ★★★★ |
| 申请提现页 | `pages/withdrawApply/withdrawApply` | 工人 | 输入提现金额、选择提现方式（微信零钱/银行卡）、确认提现、提现记录 | `applyWithdraw`, `getWithdrawHistory` | ★★★ |

### 2.6 合作商中心页面

| 页面名称 | 页面路径 | 模块 | 核心功能 | 关联API/云函数 | 复杂度 |
|---------|---------|------|---------|--------------|--------|
| 发布信息页 | `pages/publish/publish` | 合作商 | 选择发布类型（招聘/婚恋）、填写标题、内容、联系方式、图片上传、设置有效期、提交审核 | `publishInfo`, `uploadImage`, `getPublishCategories` | ★★★★★ |
| 我的发布页 | `pages/myPublish/myPublish` | 合作商 | 发布内容列表、审核状态展示、编辑/删除/刷新、浏览量统计 | `getMyPublishList`, `updatePublish`, `deletePublish` | ★★★★ |
| 合作商收益页 | `pages/partnerIncome/partnerIncome` | 合作商 | 发布数据统计、曝光量/咨询量、收益明细、申请提现 | `getPartnerStats`, `getPartnerIncome` | ★★★ |

### 2.7 管理员后台页面

| 页面名称 | 页面路径 | 模块 | 核心功能 | 关联API/云函数 | 复杂度 |
|---------|---------|------|---------|--------------|--------|
| 管理后台首页 | `pages/admin/admin` | 管理 | 数据统计概览卡片（用户数/订单数/待审核/今日收益）、快捷入口、趋势图表 | `getAdminStats`, `getDashboardData` | ★★★★★ |
| 用户管理页 | `pages/admin/users/users` | 管理 | 用户列表、搜索筛选、查看详情、禁用/启用账号、分页加载 | `getUserList`, `updateUserStatus` | ★★★★ |
| 工人管理页 | `pages/admin/workers/workers` | 管理 | 工人列表、审核状态、查看工人详情、审核通过/驳回 | `getWorkerList`, `auditWorker`, `getWorkerDetail` | ★★★★ |
| 合作商管理页 | `pages/admin/partners/partners` | 管理 | 合作商申请列表、审核操作、查看合作商信息、禁用/启用 | `getPartnerList`, `auditPartner`, `updatePartnerStatus` | ★★★★ |
| 订单管理页 | `pages/admin/orders/orders` | 管理 | 全部订单列表、状态筛选、查看详情、人工干预（取消/退款）、导出数据 | `getAdminOrderList`, `adminUpdateOrder`, `refundOrder` | ★★★★★ |
| 发布管理页 | `pages/admin/publish/publish` | 管理 | 合作商发布内容审核、通过/驳回/下架、查看详情 | `getAdminPublishList`, `auditPublish`, `updatePublishStatus` | ★★★★ |
| 提现审核页 | `pages/admin/withdraw/withdraw` | 管理 | 提现申请列表、审核通过/驳回、转账操作、提现记录查询 | `getWithdrawList`, `auditWithdraw`, `processWithdraw` | ★★★★ |
| Banner管理页 | `pages/admin/banner/banner` | 管理 | Banner增删改查、排序、上下线控制、图片上传、链接配置 | `manageBanner`, `uploadImage`, `updateBannerSort` | ★★★★ |
| 系统设置页 | `pages/admin/settings/settings` | 管理 | 全局参数配置（客服电话/抽成比例/服务开关）、日志查看 | `getSystemSettings`, `updateSystemSettings` | ★★★ |

### 2.8 通用/辅助页面

| 页面名称 | 页面路径 | 模块 | 核心功能 | 关联API/云函数 | 复杂度 |
|---------|---------|------|---------|--------------|--------|
| 地图选址页 | `pages/mapSelect/mapSelect` | 通用 | 腾讯地图展示、当前定位、拖动选点、POI搜索、确认地址 | `wx.chooseLocation`, 腾讯地图API | ★★★ |
| 浏览记录页 | `pages/history/history` | 通用 | 用户浏览过的服务和工人记录、清除记录 | `getBrowseHistory`, `clearBrowseHistory` | ★★ |
| 客服页 | `pages/customerService/customerService` | 通用 | 常见问题、在线客服入口、客服电话一键拨打 | `getFAQList` | ★★ |
| 关于我们页 | `pages/about/about` | 通用 | 平台介绍、版本信息、用户协议、隐私政策 | - | ★ |
| 角色切换页 | `pages/roleSwitch/roleSwitch` | 通用 | 身份选择列表、账号密码输入、切换确认 | `roleSwitch`, `verifyCredentials` | ★★★ |
| 登录页 | `pages/login/login` | 通用 | 微信授权登录、获取手机号、用户信息完善 | `wx.login`, `login`, `registerUser` | ★★★ |
| 图片预览页 | `pages/previewImage/previewImage` | 通用 | 全屏图片预览、缩放、保存到相册 | `wx.previewImage` | ★ |

---

## 3. 组件清单（Component Inventory）

### 3.1 布局/导航组件

| 组件名称 | 用途 | Props | 使用位置 |
|---------|------|-------|---------|
| `StickyHeader` | 顶部吸附导航栏，包含地图选址按钮和搜索框，滚动时保持吸顶 | `location: String`, `onSearch: Function`, `onLocationTap: Function` | 首页 |
| `TabBar` | 底部Tab导航栏，3个栏目（首页/全部服务/我的），支持角色高亮 | `activeTab: String`, `role: String`, `unreadCount: Number` | 全局 |
| `CategorySidebar` | 左侧分类侧边栏，支持选中高亮和点击切换 | `categories: Array`, `activeId: String`, `onSelect: Function` | 全部服务页 |
| `SegmentControl` | 分段控制器，用于订单状态切换等场景 | `tabs: Array`, `activeIndex: Number`, `onChange: Function` | 订单列表、我的发布 |

### 3.2 内容展示组件

| 组件名称 | 用途 | Props | 使用位置 |
|---------|------|-------|---------|
| `BannerSwiper` | Banner轮播图组件，支持自动播放、指示点、点击跳转 | `banners: Array`, `autoplay: Boolean`, `interval: Number` | 首页 |
| `KingKongArea` | 金刚区网格组件，2行4列共8个核心入口图标 | `items: Array<{icon, name, path}>`, `onTap: Function` | 首页 |
| `NewsCapsule` | 同城头条资讯胶囊，横向滚动展示 | `news: Array`, `onTap: Function` | 首页 |
| `ServiceSection` | 密集服务橱窗版块，展示某一类别下的多个服务入口 | `title: String`, `services: Array`, `icon: String` | 首页 |
| `ServiceCard` | 服务卡片，展示服务名称、价格区间、3D图标 | `title: String`, `price: String`, `icon: String`, `tag: String` | 首页服务橱窗、分类页 |
| `WorkerCard` | 工人信息卡片，展示头像、姓名、服务类型、从业年限、评分、距离 | `worker: Object`, `onTap: Function`, `onBook: Function` | 全部服务页、服务分类页 |
| `OrderCard` | 订单卡片，展示订单号、服务类型、工人/用户信息、状态、价格 | `order: Object`, `role: String`, `onTap: Function` | 订单列表页 |
| `DataOverview` | 数据概览卡片，4宫格数字展示（用户数/订单数/收益等） | `data: Array<{label, value, unit}>`, `onTap: Function` | 管理后台首页、工人中心 |
| `StatChart` | 简易统计图表组件，支持折线图/柱状图 | `type: String`, `data: Array`, `xAxis: Array` | 收益统计页、管理后台 |

### 3.3 交互/表单组件

| 组件名称 | 用途 | Props | 使用位置 |
|---------|------|-------|---------|
| `FloatDialButton` | 全局悬浮拨号球，常驻所有页面右下角，点击弹出底部操作菜单 | `phone: String`, `visible: Boolean`, `style: Object` | 全局 |
| `BottomSheet` | 底部弹窗/Action Sheet，用于确认操作、选项选择 | `visible: Boolean`, `title: String`, `actions: Array`, `onSelect: Function`, `onClose: Function` | 全局多处 |
| `ModalDialog` | 模态确认框，用于重要操作二次确认 | `visible: Boolean`, `title: String`, `content: String`, `onConfirm: Function` | 全局多处 |
| `ImageUploader` | 图片上传组件，支持多选、预览、删除，调用wx.chooseMedia | `maxCount: Number`, `files: Array`, `onChange: Function` | 发布信息、工人信息编辑、评价页 |
| `SearchBar` | 搜索输入框，支持placeholder、清除按钮、搜索建议 | `placeholder: String`, `value: String`, `onSearch: Function`, `onInput: Function` | 首页、搜索结果页 |
| `AddressPicker` | 地址选择组件，调用腾讯位置服务 | `value: Object`, `onSelect: Function` | 预约下单页 |
| `StarRating` | 星级评分组件，支持半星、点击选择 | `value: Number`, `max: Number`, `readonly: Boolean`, `onChange: Function` | 评价页、工人详情 |

### 3.4 状态/反馈组件

| 组件名称 | 用途 | Props | 使用位置 |
|---------|------|-------|---------|
| `EmptyState` | 空状态占位，展示插图和提示文字 | `icon: String`, `title: String`, `description: String`, `actionText: String` | 列表为空时全局使用 |
| `LoadingSkeleton` | 骨架屏，数据加载时的占位效果 | `type: String` ('card'/'list'/'detail'), `rows: Number` | 首页、列表页、详情页 |
| `StatusBadge` | 状态标签组件，不同状态对应不同颜色 | `status: String`, `statusMap: Object` | 订单列表、我的发布、审核列表 |
| `ToastMessage` | 轻提示，操作反馈 | `type: String`, `message: String`, `duration: Number` | 全局 |
| `PullRefresh` | 下拉刷新容器，封装下拉刷新和上拉加载逻辑 | `refreshing: Boolean`, `loading: Boolean`, `onRefresh: Function`, `onLoadMore: Function` | 所有列表页 |

---

## 4. 云函数清单（Cloud Function Inventory）

### 4.1 用户与认证相关

| 函数名称 | 功能 | 输入参数 | 返回数据 | 调用页面 |
|---------|------|---------|---------|---------|
| `login` | 微信登录鉴权，通过code换取openid，创建/查询用户记录 | `{ code: String, userInfo: Object }` | `{ token: String, user: Object, isNew: Boolean }` | 登录页 |
| `getUserInfo` | 获取当前登录用户的完整信息（含角色信息） | `{ openid: String }` | `{ user: Object }` | 用户中心、全局 |
| `updateUserInfo` | 更新用户基本信息（头像、昵称、手机号等） | `{ openid: String, data: Object }` | `{ success: Boolean }` | 用户中心 |
| `registerUser` | 新用户注册，完善用户信息 | `{ openid: String, userInfo: Object, phone: String }` | `{ success: Boolean, user: Object }` | 登录页 |
| `roleSwitch` | 身份切换验证，校验账号密码后返回新角色token | `{ targetRole: String, account: String, password: String }` | `{ success: Boolean, token: String, role: String }` | 角色切换页 |
| `verifyCredentials` | 验证账号密码有效性 | `{ account: String, password: String }` | `{ valid: Boolean }` | 角色切换页 |

### 4.2 首页与内容相关

| 函数名称 | 功能 | 输入参数 | 返回数据 | 调用页面 |
|---------|------|---------|---------|---------|
| `getBannerList` | 获取首页Banner列表，按排序和上下线状态过滤 | `{ position: String }` | `{ banners: Array<{id, image, link, sort}> }` | 首页 |
| `manageBanner` | Banner增删改查管理操作 | `{ action: String, data: Object, bannerId: String }` | `{ success: Boolean, banner: Object }` | Banner管理页 |
| `getServiceCategories` | 获取服务分类列表（6大主分类+子分类） | `{ parentId: String }` | `{ categories: Array<{id, name, icon, parentId}> }` | 首页、全部服务页 |
| `getNewsList` | 获取同城头条资讯列表，支持分页和分类 | `{ category: String, page: Number, limit: Number }` | `{ news: Array, total: Number }` | 首页、资讯列表页 |
| `getNewsDetail` | 获取资讯详情，同时累加阅读量 | `{ newsId: String }` | `{ detail: Object }` | 资讯详情页 |
| `incrementNewsView` | 资讯阅读量+1 | `{ newsId: String }` | `{ success: Boolean }` | 资讯详情页 |
| `searchAll` | 全局搜索，聚合搜索服务、工人、资讯 | `{ keyword: String, type: String, page: Number }` | `{ results: Object<{services, workers, news}> }` | 搜索结果页 |

### 4.3 工人与职业信息相关

| 函数名称 | 功能 | 输入参数 | 返回数据 | 调用页面 |
|---------|------|---------|---------|---------|
| `getWorkerList` | 获取工人列表，支持按分类、距离、评分筛选排序 | `{ categoryId: String, lat: Number, lng: Number, sort: String, page: Number }` | `{ workers: Array, total: Number }` | 全部服务页 |
| `getWorkerDetail` | 获取工人详细信息 | `{ workerId: String }` | `{ worker: Object }` | 工人详情页 |
| `getWorkerProfile` | 获取当前登录工人的职业信息 | `{ openid: String }` | `{ profile: Object }` | 我的职业信息页 |
| `updateWorkerProfile` | 更新工人职业信息 | `{ openid: String, profile: Object }` | `{ success: Boolean }` | 我的职业信息页 |
| `auditWorker` | 管理员审核工人信息 | `{ workerId: String, status: String, reason: String }` | `{ success: Boolean }` | 工人管理页 |
| `getWorkerReviews` | 获取工人的评价列表 | `{ workerId: String, page: Number }` | `{ reviews: Array, total: Number }` | 工人详情页 |

### 4.4 订单与支付相关

| 函数名称 | 功能 | 输入参数 | 返回数据 | 调用页面 |
|---------|------|---------|---------|---------|
| `createOrder` | 创建新订单，校验库存/工人状态 | `{ serviceId: String, workerId: String, userId: String, address: Object, time: String, remark: String, price: Number }` | `{ orderId: String, order: Object }` | 预约下单页 |
| `getOrderList` | 获取订单列表，角色不同返回不同数据（用户看自己的/工人看接到的/管理员看全部） | `{ role: String, status: String, page: Number, limit: Number }` | `{ orders: Array, total: Number }` | 订单列表页 |
| `getOrderDetail` | 获取订单详情 | `{ orderId: String }` | `{ order: Object }` | 订单详情页 |
| `updateOrderStatus` | 更新订单状态（接单/开始服务/完成/取消等） | `{ orderId: String, status: String, operator: String }` | `{ success: Boolean, order: Object }` | 订单详情页、接单大厅 |
| `grabOrder` | 工人抢单操作，带原子锁防止重复抢单 | `{ orderId: String, workerId: String }` | `{ success: Boolean, order: Object }` | 接单大厅 |
| `submitReview` | 提交订单评价 | `{ orderId: String, rating: Number, content: String, images: Array }` | `{ success: Boolean }` | 评价页 |
| `getUnifiedOrder` | 调用微信支付统一下单，生成prepay_id | `{ orderId: String, openid: String, amount: Number }` | `{ prepayId: String, paySign: String, nonceStr: String, timeStamp: String }` | 支付页 |
| `refundOrder` | 订单退款处理 | `{ orderId: String, amount: Number, reason: String }` | `{ success: Boolean }` | 订单管理页 |

### 4.5 消息/通讯相关

| 函数名称 | 功能 | 输入参数 | 返回数据 | 调用页面 |
|---------|------|---------|---------|---------|
| `getChatList` | 获取当前用户的会话列表 | `{ openid: String }` | `{ chats: Array<{chatId, targetUser, lastMessage, unread, time}> }` | 聊天列表页 |
| `getChatHistory` | 获取两个用户之间的聊天记录 | `{ chatId: String, page: Number }` | `{ messages: Array, total: Number }` | 即时通讯页 |
| `createChatMessage` | 创建一条新消息 | `{ chatId: String, senderId: String, receiverId: String, type: String, content: String }` | `{ message: Object }` | 即时通讯页 |
| `markAsRead` | 将某个会话的消息标记为已读 | `{ chatId: String, userId: String }` | `{ success: Boolean }` | 即时通讯页 |
| `getUnreadCount` | 获取用户未读消息总数 | `{ openid: String }` | `{ count: Number }` | 全局TabBar |
| `sendNotification` | 发送模板消息/订阅消息通知 | `{ templateId: String, openid: String, data: Object }` | `{ success: Boolean }` | 订单状态变更时调用 |

### 4.6 发布/内容管理相关

| 函数名称 | 功能 | 输入参数 | 返回数据 | 调用页面 |
|---------|------|---------|---------|---------|
| `publishInfo` | 合作商发布信息（招聘/婚恋） | `{ type: String, title: String, content: String, contact: Object, images: Array, validityDays: Number, partnerId: String }` | `{ publishId: String, success: Boolean }` | 发布信息页 |
| `getPublishList` | 获取发布列表（支持按合作商/类型/状态筛选） | `{ partnerId: String, type: String, status: String, page: Number }` | `{ publishes: Array, total: Number }` | 我的发布页、发布管理页 |
| `updatePublish` | 编辑更新发布内容 | `{ publishId: String, data: Object }` | `{ success: Boolean }` | 我的发布页 |
| `deletePublish` | 删除发布内容 | `{ publishId: String }` | `{ success: Boolean }` | 我的发布页 |
| `auditPublish` | 管理员审核发布内容 | `{ publishId: String, status: String, reason: String }` | `{ success: Boolean }` | 发布管理页 |
| `updatePublishStatus` | 更新发布上下架状态 | `{ publishId: String, status: String }` | `{ success: Boolean }` | 发布管理页、我的发布页 |

### 4.7 收益与提现相关

| 函数名称 | 功能 | 输入参数 | 返回数据 | 调用页面 |
|---------|------|---------|---------|---------|
| `getIncomeStats` | 获取收益统计数据 | `{ openid: String, period: String, startDate: String, endDate: String }` | `{ totalIncome: Number, orderCount: Number, trend: Array, breakdown: Array }` | 收益统计页 |
| `getIncomeDetail` | 获取收益明细列表 | `{ openid: String, page: Number }` | `{ details: Array, total: Number }` | 收益统计页 |
| `applyWithdraw` | 提交提现申请 | `{ openid: String, amount: Number, method: String, accountInfo: Object }` | `{ withdrawId: String, success: Boolean }` | 申请提现页 |
| `getWithdrawHistory` | 获取提现记录 | `{ openid: String, page: Number }` | `{ records: Array, total: Number }` | 申请提现页 |
| `getWithdrawList` | 管理员获取所有提现申请列表 | `{ status: String, page: Number }` | `{ records: Array, total: Number }` | 提现审核页 |
| `auditWithdraw` | 审核提现申请 | `{ withdrawId: String, status: String, remark: String }` | `{ success: Boolean }` | 提现审核页 |
| `processWithdraw` | 执行实际转账操作（企业付款到零钱） | `{ withdrawId: String }` | `{ success: Boolean }` | 提现审核页 |

### 4.8 管理员相关

| 函数名称 | 功能 | 输入参数 | 返回数据 | 调用页面 |
|---------|------|---------|---------|---------|
| `getAdminStats` | 获取管理后台核心统计数据 | `{ startDate: String, endDate: String }` | `{ totalUsers, totalWorkers, totalOrders, todayOrders, pendingAudits, totalIncome }` | 管理后台首页 |
| `getDashboardData` | 获取Dashboard趋势数据（近7天/30天） | `{ period: String }` | `{ chartData: Array<{date, orders, income, users}> }` | 管理后台首页 |
| `getUserList` | 获取用户列表，支持搜索和分页 | `{ keyword: String, status: String, page: Number, limit: Number }` | `{ users: Array, total: Number }` | 用户管理页 |
| `updateUserStatus` | 禁用/启用用户账号 | `{ userId: String, status: String }` | `{ success: Boolean }` | 用户管理页 |
| `getPartnerList` | 获取合作商列表 | `{ status: String, page: Number }` | `{ partners: Array, total: Number }` | 合作商管理页 |
| `auditPartner` | 审核合作商申请 | `{ partnerId: String, status: String, reason: String }` | `{ success: Boolean }` | 合作商管理页 |
| `updatePartnerStatus` | 禁用/启用合作商 | `{ partnerId: String, status: String }` | `{ success: Boolean }` | 合作商管理页 |
| `getAdminOrderList` | 管理员视角获取全部订单 | `{ status: String, startDate: String, endDate: String, page: Number }` | `{ orders: Array, total: Number }` | 订单管理页 |
| `adminUpdateOrder` | 管理员人工干预订单 | `{ orderId: String, action: String, reason: String }` | `{ success: Boolean }` | 订单管理页 |
| `getSystemSettings` | 获取系统配置参数 | `{ keys: Array }` | `{ settings: Object }` | 系统设置页 |
| `updateSystemSettings` | 更新系统配置参数 | `{ settings: Object }` | `{ success: Boolean }` | 系统设置页 |

### 4.9 通用工具函数

| 函数名称 | 功能 | 输入参数 | 返回数据 | 调用页面 |
|---------|------|---------|---------|---------|
| `uploadFile` | 文件上传到云存储，返回fileID和URL | `{ fileContent: Buffer, cloudPath: String }` | `{ fileID: String, url: String }` | 所有图片上传场景 |
| `getBrowseHistory` | 获取用户浏览记录 | `{ openid: String, page: Number }` | `{ history: Array }` | 浏览记录页 |
| `clearBrowseHistory` | 清除用户浏览记录 | `{ openid: String }` | `{ success: Boolean }` | 浏览记录页 |
| `getFAQList` | 获取常见问题列表 | `{ category: String }` | `{ faqs: Array }` | 客服页 |
| `getNearbyServices` | 根据位置获取附近的服务 | `{ lat: Number, lng: Number, radius: Number }` | `{ services: Array }` | 首页 |


---

## 5. 数据流设计（Data Flow）

### 5.1 核心业务流程一：用户下单流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         用户下单流程（User → Order）                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  用户操作                    前端页面              云函数/云数据库         │
│    │                          │                       │                  │
│    │  1.浏览首页               │                       │                  │
│    │─────────────────────────>│  pages/index/index   │                  │
│    │                          │                       │                  │
│    │                          │  2.加载服务数据        │                  │
│    │                          │──────────────────────>│  getServiceCategories│
│    │                          │  3.返回分类数据        │                  │
│    │                          │<──────────────────────│                  │
│    │                          │                       │                  │
│    │  4.点击服务分类            │                       │                  │
│    │─────────────────────────>│  pages/serviceCategory│                  │
│    │                          │  5.加载工人列表        │                  │
│    │                          │──────────────────────>│  getWorkerList     │
│    │                          │                       │  Cloud DB query    │
│    │                          │  6.返回工人数据        │                  │
│    │                          │<──────────────────────│                  │
│    │                          │                       │                  │
│    │  7.选择工人进入详情        │                       │                  │
│    │─────────────────────────>│  pages/workerDetail  │                  │
│    │                          │                       │                  │
│    │  8.点击"立即预约"         │                       │                  │
│    │─────────────────────────>│  pages/orderCreate   │                  │
│    │                          │  9.地图选址(wx.chooseLocation)            │
│    │                          │  10.填写预约信息       │                  │
│    │                          │                       │                  │
│    │  11.提交订单               │──────────────────────>│  createOrder       │
│    │                          │                       │  - 校验工人可用性    │
│    │                          │                       │  - 创建订单记录     │
│    │                          │                       │  - 写入Cloud DB     │
│    │                          │  12.返回订单信息        │                  │
│    │                          │<──────────────────────│                  │
│    │                          │                       │                  │
│    │  13.调起支付(wx.requestPayment)                    │                  │
│    │─────────────────────────────────────────────────>│  微信支付API       │
│    │                          │  14.支付回调            │                  │
│    │                          │<────────────────────────────────────────  │
│    │                          │                       │                  │
│    │                          │  15.更新订单状态为"已支付"                 │
│    │                          │──────────────────────>│  updateOrderStatus │
│    │                          │                       │                  │
│    │  16.展示支付结果页          │  pages/payResult     │                  │
│    │                          │                       │                  │
│    ▼                          ▼                       ▼                  │
│                                                                         │
│  订单状态流转: 待支付 → 已支付 → 待服务 → 服务中 → 待评价 → 已完成       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 核心业务流程二：工人抢单流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       工人抢单流程（Worker → Grab Order）                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  用户下单支付后                          订单进入"待服务"状态              │
│       │                                         │                       │
│       │  1.订单状态变更推送到云数据库              │                       │
│       │────────────────────────────────────────>│  Cloud DB              │
│       │                                         │  (orders集合)          │
│       │                                         │                       │
│       │                              2.云数据库触发器/轮询                │
│       │                              将订单推送到接单大厅                   │
│       │                                         │                       │
│       ▼                                         ▼                       │
│                                                                         │
│  工人操作                    前端页面              云函数/云数据库         │
│    │                          │                       │                  │
│    │  3.进入接单大厅            │  pages/orderHall      │                  │
│    │─────────────────────────>│                       │                  │
│    │                          │  4.加载待接单列表       │                  │
│    │                          │──────────────────────>│  getPendingOrders  │
│    │                          │                       │  - 按距离排序       │
│    │                          │                       │  - 按服务类型过滤    │
│    │                          │  5.返回订单列表         │                  │
│    │                          │<──────────────────────│                  │
│    │                          │                       │                  │
│    │  6.刷新列表(下拉/定时)     │──────────────────────>│  getPendingOrders  │
│    │                          │  轮询间隔: 10秒        │                  │
│    │                          │                       │                  │
│    │  7.点击"抢单"             │                       │                  │
│    │─────────────────────────>│──────────────────────>│  grabOrder         │
│    │                          │                       │  ⚠️ 原子操作:       │
│    │                          │                       │  1) 读取订单状态     │
│    │                          │                       │  2) 若仍为"待服务"   │
│    │                          │                       │  3) 更新为"服务中"   │
│    │                          │                       │  4) 绑定workerId     │
│    │                          │                       │  (使用Cloud DB事务)  │
│    │                          │                       │                  │
│    │                          │  8a.抢单成功           │                  │
│    │                          │<──────────────────────│  返回订单信息       │
│    │                          │  跳转订单详情页         │                  │
│    │                          │                       │                  │
│    │                          │  8b.抢单失败(已被抢)    │                  │
│    │                          │<──────────────────────│  返回错误信息       │
│    │                          │  Toast提示"手慢啦~"    │                  │
│    │                          │  自动刷新列表           │                  │
│    │                          │                       │                  │
│    │                          │  9.推送通知给用户       │                  │
│    │                          │──────────────────────>│  sendNotification  │
│    ▼                          ▼                       ▼                  │
│                                                                         │
│  ⚠️ 并发安全: 使用云数据库事务(transaction)确保同一订单不会被多人抢成功       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.3 核心业务流程三：身份切换流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      身份切换流程（Role Switch）                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  用户操作                    前端页面              云函数/云数据库         │
│    │                          │                       │                  │
│    │  1.进入"我的"页面          │  pages/mine           │                  │
│    │─────────────────────────>│                       │                  │
│    │                          │  显示当前角色+头像       │                  │
│    │                          │                       │                  │
│    │  2.长按头像 800ms          │                       │                  │
│    │  (longpress事件)           │                       │                  │
│    │─────────────────────────>│  3.震动反馈(wx.vibrateShort)              │
│    │                          │  弹出身份选择BottomSheet │                  │
│    │                          │  - 普通用户 ✓ (当前)    │                  │
│    │                          │  - 工人/师傅            │                  │
│    │                          │  - 合作商              │                  │
│    │                          │  - 管理员             │                  │
│    │                          │                       │                  │
│    │  4.选择目标身份            │                       │                  │
│    │─────────────────────────>│                       │                  │
│    │                          │  若选择"普通用户"       │                  │
│    │                          │  → 直接切换，无需验证    │                  │
│    │                          │                       │                  │
│    │                          │  若选择其他身份         │                  │
│    │                          │  → 跳转到角色切换页      │                  │
│    │                          │                       │                  │
│    │  5.输入账号密码            │  pages/roleSwitch     │                  │
│    │─────────────────────────>│                       │                  │
│    │                          │  6.点击确认切换          │                  │
│    │                          │──────────────────────>│  roleSwitch        │
│    │                          │                       │  - 验证账号密码      │
│    │                          │                       │  - 查询用户角色绑定   │
│    │                          │                       │  - 生成新角色token   │
│    │                          │  7.返回验证结果          │                  │
│    │                          │<──────────────────────│                  │
│    │                          │                       │                  │
│    │  验证成功 → 写入Storage   │                       │                  │
│    │  更新全局角色状态           │                       │                  │
│    │  刷新"我的"页面菜单        │                       │                  │
│    │  Toast: "切换成功"         │                       │                  │
│    │                          │                       │                  │
│    │  验证失败 → Toast错误提示   │                       │                  │
│    │  停留在角色切换页           │                       │                  │
│    ▼                          ▼                       ▼                  │
│                                                                         │
│  ⚠️ 安全注意: 账号密码在数据库中bcrypt加密存储，传输过程使用HTTPS          │
│  ⚠️ 切换后全局状态(globalData)更新，所有页面onShow时需重新检查角色状态      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.4 核心业务流程四：信息发布与审核流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    信息发布与审核流程（Partner → Publish）                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  合作商操作                   前端页面              云函数/云数据库        │
│    │                          │                       │                  │
│    │  1.进入发布信息页          │  pages/publish        │                  │
│    │─────────────────────────>│                       │                  │
│    │                          │  2.选择发布类型         │                  │
│    │  招聘/婚姻介绍            │  - 招聘求职            │                  │
│    │─────────────────────────>│  - 婚姻介绍            │                  │
│    │                          │                       │                  │
│    │  3.填写发布内容            │                       │                  │
│    │  - 标题/内容/联系方式       │                       │                  │
│    │  - 图片上传               │                       │                  │
│    │  - 有效期设置             │                       │                  │
│    │─────────────────────────>│  4.图片上传到云存储      │                  │
│    │                          │──────────────────────>│  uploadFile        │
│    │                          │  返回图片URL            │                  │
│    │                          │<──────────────────────│                  │
│    │                          │                       │                  │
│    │  5.点击提交发布            │──────────────────────>│  publishInfo       │
│    │                          │                       │  - 校验内容合规性    │
│    │                          │                       │  - 写入publish集合   │
│    │                          │                       │  - status="pending" │
│    │                          │  6.返回发布结果          │                  │
│    │                          │<──────────────────────│                  │
│    │                          │  Toast: "提交成功，等待审核"               │
│    │                          │                       │                  │
│    ▼                          ▼                       ▼                  │
│                                                                         │
│                         审核流程（Admin Audit）                         │
│                                                                         │
│  管理员操作                   前端页面              云函数/云数据库        │
│    │                          │                       │                  │
│    │  7.进入发布管理页          │  pages/admin/publish  │                  │
│    │─────────────────────────>│  加载待审核列表         │                  │
│    │                          │──────────────────────>│  getAdminPublishList│
│    │                          │  status="pending"     │                  │
│    │                          │                       │                  │
│    │  8.查看发布详情            │                       │                  │
│    │─────────────────────────>│  展示完整内容            │                  │
│    │                          │                       │                  │
│    │  9.审核操作               │                       │                  │
│    │  通过 / 驳回              │──────────────────────>│  auditPublish      │
│    │─────────────────────────>│                       │  - 更新status       │
│    │                          │                       │  - approved/rejected│
│    │                          │                       │  - 记录审核人/时间   │
│    │                          │  10.返回审核结果         │                  │
│    │                          │<──────────────────────│                  │
│    │                          │  刷新列表               │                  │
│    │                          │                       │                  │
│    ▼                          ▼                       ▼                  │
│                                                                         │
│  审核通过后:  status → "approved" → 在前端展示给用户浏览                     │
│  审核驳回后:  status → "rejected" → 通知合作商修改后重新提交                 │
│  发布过期后:  status → "expired"  → 自动下架（云函数定时触发器）               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. API接口清单（API Inventory）

### 6.1 小程序端API（wx.xxx 原生API）

| 接口名称 | 请求方法 | 参数 | 返回数据 | 使用场景 |
|---------|---------|------|---------|---------|
| `wx.login` | 原生API | - | `{ code: String }` | 获取登录凭证，换取openid |
| `wx.getUserProfile` | 原生API | `{ desc: String }` | `{ userInfo: Object }` | 获取用户头像、昵称 |
| `wx.getPhoneNumber` | 原生API | - | `{ encryptedData, iv }` | 获取用户手机号 |
| `wx.chooseLocation` | 原生API | - | `{ name, address, latitude, longitude }` | 地图选址 |
| `wx.getLocation` | 原生API | `{ type: 'gcj02' }` | `{ latitude, longitude, speed, accuracy }` | 获取当前位置 |
| `wx.requestPayment` | 原生API | `{ timeStamp, nonceStr, package, signType, paySign }` | `{ errMsg }` | 调起微信支付 |
| `wx.chooseMedia` | 原生API | `{ count, mediaType }` | `{ tempFiles: Array }` | 选择图片/视频 |
| `wx.uploadFile` | 原生API | `{ url, filePath, name }` | `{ statusCode, data }` | 上传文件到服务器 |
| `wx.cloud.callFunction` | 原生API | `{ name, data }` | `{ result }` | 调用云函数 |
| `wx.cloud.database` | 原生API | - | `Database` 实例 | 获取数据库引用 |
| `wx.cloud.storage` | 原生API | - | `Storage` 实例 | 获取存储引用 |
| `wx.previewImage` | 原生API | `{ urls, current }` | - | 预览图片 |
| `wx.makePhoneCall` | 原生API | `{ phoneNumber }` | - | 一键拨打电话 |
| `wx.showModal` | 原生API | `{ title, content }` | `{ confirm, cancel }` | 模态确认框 |
| `wx.showActionSheet` | 原生API | `{ itemList }` | `{ tapIndex }` | 底部操作菜单 |
| `wx.showToast` | 原生API | `{ title, icon, duration }` | - | 轻提示 |
| `wx.vibrateShort` | 原生API | `{ type }` | - | 短震动反馈 |
| `wx.setStorageSync` | 原生API | `{ key, data }` | - | 本地数据存储 |
| `wx.getStorageSync` | 原生API | `{ key }` | `Any` | 本地数据读取 |
| `wx.removeStorageSync` | 原生API | `{ key }` | - | 本地数据清除 |

### 6.2 腾讯位置服务API

| 接口名称 | 请求方法 | 参数 | 返回数据 | 使用场景 |
|---------|---------|------|---------|---------|
| 逆地址解析 | GET | `{ location: lat,lng, key: TENCENT_MAP_KEY }` | `{ result: {address, formatted_addresses, address_component} }` | 坐标转地址 |
| 地址解析 | GET | `{ address: String, key: TENCENT_MAP_KEY }` | `{ result: {location: {lat, lng}} }` | 地址转坐标 |
| 地点搜索 | GET | `{ keyword: String, boundary: near(lat,lng,radius), key }` | `{ data: Array }` | POI搜索 |
| 距离计算 | GET | `{ from: lat,lng, to: lat1,lng1;lat2,lng2, key }` | `{ result: {elements: [{distance, duration}]} }` | 计算工人距离 |

### 6.3 微信支付API（服务端）

| 接口名称 | 请求方法 | 参数 | 返回数据 | 使用场景 |
|---------|---------|------|---------|---------|
| 统一下单 | POST | `{ appid, mchid, description, out_trade_no, notify_url, amount: {total}, payer: {openid} }` | `{ prepay_id }` | 生成预支付订单 |
| 查询订单 | GET | `/v3/pay/transactions/out-trade-no/{out_trade_no}` | `{ trade_state, amount, success_time }` | 查询支付状态 |
| 申请退款 | POST | `{ transaction_id, out_refund_no, amount: {refund, total} }` | `{ refund_id, status }` | 订单退款 |
| 企业付款 | POST | `{ mch_appid, mchid, partner_trade_no, openid, amount, desc }` | `{ payment_no, payment_time }` | 提现打款 |

---

## 7. 状态管理设计（State Management）

### 7.1 全局状态（app.js globalData）

```javascript
// app.js 全局状态设计
App({
  globalData: {
    // ==================== 用户状态 ====================
    userInfo: {
      openid: '',           // 微信openid，唯一标识
      unionid: '',          // 微信unionid
      nickName: '',         // 用户昵称
      avatarUrl: '',        // 用户头像URL
      phone: '',            // 手机号
      gender: 0,            // 性别 0未知 1男 2女
      createTime: '',       // 注册时间
    },
    
    // ==================== 角色状态 ====================
    role: 'user',           // 当前角色: 'user' | 'worker' | 'partner' | 'admin'
    roleInfo: {             // 当前角色的详细信息
      roleType: 'user',
      isVerified: false,    // 是否已通过认证
      permissions: [],      // 当前角色权限列表
    },
    
    // ==================== 认证状态 ====================
    isLoggedIn: false,      // 是否已登录
    token: '',              // 身份令牌
    loginTime: 0,           // 登录时间戳
    
    // ==================== 位置状态 ====================
    location: {
      latitude: 0,          // 纬度
      longitude: 0,         // 经度
      address: '',          // 地址名称
      city: '',             // 城市
      district: '',         // 区县
    },
    
    // ==================== 消息状态 ====================
    unreadCount: {          // 未读消息数
      chat: 0,              // 聊天未读
      system: 0,            // 系统通知未读
      total: 0,             // 总计未读
    },
    
    // ==================== 应用配置 ====================
    appConfig: {
      servicePhone: '',     // 客服电话
      platformName: '春辉综合服务部',
      version: '1.0.0',
      commissionRate: 0.1,  // 平台抽成比例
    },
    
    // ==================== 购物车/草稿状态 ====================
    orderDraft: {           // 订单草稿（未完成下单时暂存）
      serviceId: '',
      workerId: '',
      address: null,
      appointmentTime: '',
      remark: '',
    },
    publishDraft: {         // 发布草稿
      type: '',
      title: '',
      content: '',
      images: [],
    },
  },
  
  // 全局状态变更方法
  setGlobalData(key, value) {
    this.globalData[key] = value;
    // 通知所有页面状态变更（通过事件总线或页面回调）
    this.notifyStateChange(key, value);
  },
  
  // 角色切换方法
  async switchRole(targetRole, credentials) {
    const { result } = await wx.cloud.callFunction({
      name: 'roleSwitch',
      data: { targetRole, ...credentials }
    });
    if (result.success) {
      this.globalData.role = result.role;
      this.globalData.token = result.token;
      wx.setStorageSync('role', result.role);
      wx.setStorageSync('token', result.token);
    }
    return result;
  },
  
  // 刷新用户信息
  async refreshUserInfo() {
    const { result } = await wx.cloud.callFunction({
      name: 'getUserInfo',
      data: { openid: this.globalData.userInfo.openid }
    });
    if (result.user) {
      this.globalData.userInfo = result.user;
      this.globalData.role = result.user.role || 'user';
    }
  },
});
```

### 7.2 本地存储结构（Storage Keys）

| Key名称 | 存储内容 | 用途 | 过期策略 |
|---------|---------|------|---------|
| `user_info` | 用户基本信息对象 | 快速读取用户信息，减少云函数调用 | 随登录状态更新 |
| `token` | 身份验证令牌字符串 | API请求鉴权 | 7天或退出登录清除 |
| `role` | 当前角色标识字符串 | 页面渲染判断 | 随角色切换更新 |
| `search_history` | 搜索关键词数组（最多20条） | 搜索历史展示 | 长期保存 |
| `browse_history` | 浏览记录数组（最近50条） | 浏览记录展示 | 长期保存 |
| `location` | 位置信息对象 | 首页默认定位 | 每次进入小程序刷新 |
| `setting_haptic` | 布尔值 | 震动反馈开关 | 长期保存 |
| `setting_notification` | 布尔值 | 消息推送开关 | 长期保存 |
| `chat_drafts` | 对象（key为chatId） | 聊天输入草稿 | 发送成功后清除 |
| `order_draft` | 订单草稿对象 | 未完成的订单信息 | 下单成功后清除 |
| `app_config` | 应用配置对象 | 客服电话等全局配置 | 每次启动刷新 |
| `last_login_time` | 时间戳 | 上次登录时间 | 登录时更新 |

### 7.3 页面间数据通信方案

| 通信场景 | 方案 | 说明 |
|---------|------|------|
| 全局状态同步 | `app.globalData` + 事件总线 | 登录/角色切换等全局状态变更 |
| 父子组件通信 | `properties` + `triggerEvent` | 组件与页面间的数据传递 |
| 页面间正向传参 | `wx.navigateTo({ url: '?id=xxx' })` | 通过URL参数传递简单数据 |
| 页面间反向传参 | `EventChannel` / `getCurrentPages()` | 子页面向父页面回传数据 |
| 页面间共享状态 | `app.globalData` 中转 | 复杂对象跨页面共享 |
| 本地持久化 | `wx.setStorage` / `wx.getStorage` | 需长期保存的数据 |

---

## 8. 技术风险与注意事项

### 8.1 技术难点与解决方案

| 序号 | 风险点 | 影响程度 | 解决方案 |
|-----|--------|---------|---------|
| 1 | **并发抢单冲突** | 🔴 高 | 使用云数据库事务(transaction)实现原子操作：先读取订单状态 → 确认"待服务" → 更新为"服务中"+绑定workerId → 提交事务。失败则返回"已被抢"提示客户端刷新。 |
| 2 | **即时通讯实时性** | 🔴 高 | 云开发数据库支持实时监听(`watch`)，聊天页面使用`db.collection('messages').where().watch()`实时接收新消息；同时配合10秒轮询作为兜底方案。 |
| 3 | **微信支付安全** | 🔴 高 | 所有支付签名在服务端云函数生成，前端仅接收prepay参数调起支付；支付回调由云函数处理更新订单状态，不依赖前端通知。 |
| 4 | **图片上传性能** | 🟡 中 | 上传前客户端压缩图片（quality 80%，最大宽度1280px）；使用云存储CDN加速；展示时使用缩略图，预览时加载原图。 |
| 5 | **定位精度问题** | 🟡 中 | 优先使用`wx.chooseLocation`让用户手动确认地址；备用方案`wx.getLocation`自动获取，失败时降级为IP定位；所有坐标使用GCJ02国测局坐标系。 |
| 6 | **角色切换状态同步** | 🟡 中 | 角色切换后需同步更新：①globalData.role ②Storage中的role ③重新获取角色专属数据 ④刷新当前页面 ⑤通知TabBar更新；在app.js中封装统一的`switchRole()`方法确保一致性。 |
| 7 | **大量数据分页加载** | 🟡 中 | 所有列表接口统一分页（pageSize=20），配合`PullRefresh`组件实现下拉刷新和上拉加载；图片使用懒加载`lazy-load`属性。 |
| 8 | **微信小程序云开发冷启动** | 🟡 中 | 云函数冷启动可能导致首次调用延迟2-5秒，前端需做好loading状态；使用云函数`keepWarm`定时触发器保持函数热备（每5分钟调用一次无操作函数）。 |
| 9 | **敏感内容审核** | 🟡 中 | 用户发布内容（招聘信息、婚恋信息、评价）提交后先经`wx.security.msgSecCheck`文本安全校验 → 人工审核队列 → 审核通过后展示；图片使用`wx.security.imgSecCheck`审核。 |
| 10 | **中老年用户操作友好性** | 🟡 中 | 按钮最小尺寸44×44px；字体不小于14px；核心操作二次确认但不过度弹窗；悬浮拨号球常驻所有页面；减少手势操作依赖。 |
| 11 | **多端角色数据隔离** | 🟢 低 | 所有数据库查询必须带`role`字段过滤，管理员接口单独加`admin`权限校验中间件；云函数入口处统一鉴权。 |
| 12 | **版本兼容性** | 🟢 低 | 基础库版本要求≥2.19.0；启动时`wx.getSystemInfoSync`检查版本，过低时引导用户更新微信；低端机型减少动画效果。 |

### 8.2 数据库设计要点

```javascript
// ==================== 核心集合设计 ====================

// 1. users - 用户集合
{
  _openid: string,        // 微信openid，自动注入
  nickName: string,       // 昵称
  avatarUrl: string,      // 头像
  phone: string,          // 手机号（加密存储）
  gender: number,         // 性别
  role: string,           // 角色: user/worker/partner/admin
  roleAccounts: {         // 各角色账号信息
    worker: { account: string, passwordHash: string, isVerified: boolean },
    partner: { account: string, passwordHash: string, isVerified: boolean },
    admin: { account: string, passwordHash: string }
  },
  location: {             // 常用地址
    address: string,
    lat: number,
    lng: number
  },
  createTime: Date,
  updateTime: Date,
  status: string          // 账号状态: active/disabled
}

// 2. workers - 工人信息集合
{
  _openid: string,
  userId: string,         // 关联users._id
  name: string,           // 真实姓名
  idCard: string,         // 身份证号（加密）
  phone: string,          // 联系电话
  serviceTypes: string[], // 服务类型ID数组
  workArea: string,       // 服务区域
  experience: number,     // 从业年限
  avatar: string,         // 头像
  description: string,    // 个人简介
  certificates: string[], // 技能证书图片
  rating: number,         // 评分 0-5
  orderCount: number,     // 已完成订单数
  status: string,         // 审核状态: pending/approved/rejected
  isOnline: boolean,      // 是否在线可接单
  createTime: Date,
  updateTime: Date
}

// 3. orders - 订单集合
{
  userId: string,         // 下单用户openid
  workerId: string,       // 接单工人openid（可为空）
  serviceId: string,      // 服务类型ID
  serviceName: string,    // 服务名称（快照）
  status: string,         // 状态: pending/paid/assigned/serving/completed/reviewed/cancelled/refunded
  price: number,          // 订单金额（分）
  address: {              // 服务地址
    name: string,
    detail: string,
    lat: number,
    lng: number
  },
  appointmentTime: Date,  // 预约时间
  remark: string,         // 备注
  review: {               // 评价信息（完成后填写）
    rating: number,
    content: string,
    images: string[]
  },
  payment: {              // 支付信息
    prepayId: string,
    paidTime: Date,
    payMethod: string
  },
  timeline: [             // 订单状态时间线
    { status: string, time: Date, operator: string }
  ],
  createTime: Date,
  updateTime: Date
}

// 4. publishes - 发布内容集合（招聘/婚恋）
{
  partnerId: string,      // 发布者openid
  type: string,           // 类型: job/marriage
  title: string,          // 标题
  content: string,        // 内容
  images: string[],       // 图片
  contact: {              // 联系方式
    name: string,
    phone: string,
    wechat: string
  },
  viewCount: number,      // 浏览量
  status: string,         // 状态: pending/approved/rejected/expired
  auditInfo: {            // 审核信息
    auditor: string,
    auditTime: Date,
    reason: string
  },
  validStart: Date,       // 有效期开始
  validEnd: Date,         // 有效期结束
  createTime: Date,
  updateTime: Date
}

// 5. messages - 聊天记录集合
{
  chatId: string,         // 会话ID（两个openid排序后拼接）
  senderId: string,       // 发送者openid
  receiverId: string,     // 接收者openid
  type: string,           // 消息类型: text/image/system
  content: string,        // 消息内容
  isRead: boolean,        // 是否已读
  createTime: Date
}

// 6. chats - 会话列表集合
{
  chatId: string,
  userA: string,          // 参与者A openid
  userB: string,          // 参与者B openid
  lastMessage: {          // 最后一条消息摘要
    content: string,
    type: string,
    time: Date
  },
  unreadA: number,        // A的未读数
  unreadB: number,        // B的未读数
  updateTime: Date
}

// 7. income_records - 收益记录集合
{
  userId: string,         // 收益归属用户openid
  orderId: string,        // 关联订单ID
  type: string,           // 类型: order_income/withdraw/bonus
  amount: number,         // 金额（分，正为收入负为支出）
  balance: number,        // 变动后余额
  description: string,    // 描述
  createTime: Date
}

// 8. withdraw_records - 提现记录集合
{
  userId: string,
  amount: number,         // 提现金额（分）
  method: string,         // 方式: wechat/bank
  accountInfo: object,    // 账号信息
  status: string,         // 状态: pending/approved/rejected/completed
  auditInfo: {
    auditor: string,
    auditTime: Date,
    reason: string
  },
  transferInfo: {         // 转账信息
    transferId: string,
    transferTime: Date
  },
  createTime: Date,
  updateTime: Date
}

// 9. banners - Banner管理集合
{
  image: string,          // 图片URL
  title: string,          // 标题
  link: string,           // 跳转链接
  linkType: string,       // 链接类型: page/web/miniProgram
  position: string,       // 展示位置: home
  sort: number,           // 排序号
  isOnline: boolean,      // 是否上线
  startTime: Date,        // 展示开始时间
  endTime: Date,          // 展示结束时间
  createTime: Date
}

// 10. news - 资讯集合
{
  title: string,          // 标题
  cover: string,          // 封面图
  content: string,        // 内容（富文本）
  category: string,       // 分类
  viewCount: number,      // 阅读量
  isTop: boolean,         // 是否置顶
  isOnline: boolean,      // 是否上线
  publishTime: Date,
  createTime: Date
}

// 11. browse_history - 浏览记录集合
{
  userId: string,
  targetType: string,     // 类型: service/worker/news
  targetId: string,       // 目标ID
  targetName: string,     // 目标名称
  targetImage: string,    // 目标图片
  createTime: Date
}

// 12. system_settings - 系统设置集合
{
  key: string,            // 配置键
  value: any,             // 配置值
  description: string,    // 描述
  updateTime: Date
}
```

### 8.3 数据库索引设计

| 集合 | 索引字段 | 索引类型 | 用途 |
|-----|---------|---------|------|
| `users` | `_openid` | 唯一索引 | 快速查找用户 |
| `users` | `phone` | 唯一索引 | 手机号登录 |
| `workers` | `_openid` | 唯一索引 | 工人信息查找 |
| `workers` | `serviceTypes` | 普通索引 | 按服务类型筛选 |
| `workers` | `status` | 普通索引 | 按审核状态筛选 |
| `orders` | `userId` + `createTime` | 复合索引 | 用户订单列表 |
| `orders` | `workerId` + `createTime` | 复合索引 | 工人订单列表 |
| `orders` | `status` | 普通索引 | 按状态筛选 |
| `publishes` | `partnerId` + `createTime` | 复合索引 | 合作商发布列表 |
| `publishes` | `status` + `type` | 复合索引 | 按状态和类型筛选 |
| `messages` | `chatId` + `createTime` | 复合索引 | 聊天记录查询 |
| `messages` | `receiverId` + `isRead` | 复合索引 | 未读消息统计 |
| `income_records` | `userId` + `createTime` | 复合索引 | 收益明细查询 |
| `withdraw_records` | `userId` + `createTime` | 复合索引 | 提现记录查询 |
| `withdraw_records` | `status` | 普通索引 | 待审核筛选 |
| `browse_history` | `userId` + `createTime` | 复合索引 | 浏览记录查询 |

### 8.4 云开发环境配置建议

| 配置项 | 建议值 | 说明 |
|-------|--------|------|
| 云数据库版本 | MongoDB 4.x | 云开发自带 |
| 云存储容量 | 初始50GB，可按需扩容 | 图片/视频存储 |
| 云函数内存 | 256MB（常规）/ 512MB（复杂计算） | 根据函数调整 |
| 云函数超时 | 10s（常规）/ 20s（支付/文件处理） | 根据函数调整 |
| 并发限制 | 1000（初期）| 可按需提升 |
| 单集合限制 | 100万文档（初期）| 超出后需分表 |
| 实时监听连接数 | 单用户最多同时5个watch | 注意释放不用的watch |

---

## 9. 项目目录结构

```text
chunhui-miniprogram/
├── cloudfunctions/              # 云函数目录
│   ├── login/                   # 微信登录
│   ├── getUserInfo/             # 获取用户信息
│   ├── updateUserInfo/          # 更新用户信息
│   ├── registerUser/            # 用户注册
│   ├── roleSwitch/              # 角色切换
│   ├── verifyCredentials/       # 验证账号密码
│   ├── getBannerList/           # 获取Banner
│   ├── manageBanner/            # Banner管理
│   ├── getServiceCategories/    # 服务分类
│   ├── getNewsList/             # 资讯列表
│   ├── getNewsDetail/           # 资讯详情
│   ├── incrementNewsView/       # 阅读量+1
│   ├── searchAll/               # 全局搜索
│   ├── getWorkerList/           # 工人列表
│   ├── getWorkerDetail/         # 工人详情
│   ├── getWorkerProfile/        # 工人职业信息
│   ├── updateWorkerProfile/     # 更新工人信息
│   ├── auditWorker/             # 审核工人
│   ├── getWorkerReviews/        # 工人评价
│   ├── createOrder/             # 创建订单
│   ├── getOrderList/            # 订单列表
│   ├── getOrderDetail/          # 订单详情
│   ├── updateOrderStatus/       # 更新订单状态
│   ├── grabOrder/               # 抢单
│   ├── submitReview/            # 提交评价
│   ├── getUnifiedOrder/         # 微信支付统一下单
│   ├── refundOrder/             # 订单退款
│   ├── getChatList/             # 会话列表
│   ├── getChatHistory/          # 聊天记录
│   ├── createChatMessage/       # 创建消息
│   ├── markAsRead/              # 标记已读
│   ├── getUnreadCount/          # 未读消息数
│   ├── sendNotification/        # 消息通知
│   ├── publishInfo/             # 发布信息
│   ├── getPublishList/          # 发布列表
│   ├── updatePublish/           # 更新发布
│   ├── deletePublish/           # 删除发布
│   ├── auditPublish/            # 审核发布
│   ├── updatePublishStatus/     # 更新发布状态
│   ├── getIncomeStats/          # 收益统计
│   ├── getIncomeDetail/         # 收益明细
│   ├── applyWithdraw/           # 申请提现
│   ├── getWithdrawHistory/      # 提现历史
│   ├── getWithdrawList/         # 提现列表(管理)
│   ├── auditWithdraw/           # 审核提现
│   ├── processWithdraw/         # 执行转账
│   ├── getAdminStats/           # 管理统计数据
│   ├── getDashboardData/        # Dashboard数据
│   ├── getUserList/             # 用户列表(管理)
│   ├── updateUserStatus/        # 更新用户状态
│   ├── getPartnerList/          # 合作商列表
│   ├── auditPartner/            # 审核合作商
│   ├── updatePartnerStatus/     # 更新合作商状态
│   ├── getAdminOrderList/       # 管理订单列表
│   ├── adminUpdateOrder/        # 管理订单操作
│   ├── getSystemSettings/       # 系统设置
│   ├── updateSystemSettings/    # 更新系统设置
│   ├── uploadFile/              # 文件上传
│   ├── getBrowseHistory/        # 浏览历史
│   ├── clearBrowseHistory/      # 清除浏览历史
│   ├── getFAQList/              # FAQ列表
│   ├── getNearbyServices/       # 附近服务
│   └── getPendingOrders/        # 待接单列表
│
├── miniprogram/                 # 小程序前端目录
│   ├── app.js                   # 应用入口
│   ├── app.json                 # 全局配置
│   ├── app.wxss                 # 全局样式
│   ├── sitemap.json             # 搜索配置
│   ├── components/              # 公共组件
│   │   ├── StickyHeader/        # 顶部吸附导航
│   │   ├── TabBar/              # 底部Tab栏
│   │   ├── CategorySidebar/     # 分类侧边栏
│   │   ├── SegmentControl/      # 分段控制器
│   │   ├── BannerSwiper/        # Banner轮播
│   │   ├── KingKongArea/        # 金刚区网格
│   │   ├── NewsCapsule/         # 资讯胶囊
│   │   ├── ServiceSection/      # 服务橱窗
│   │   ├── ServiceCard/         # 服务卡片
│   │   ├── WorkerCard/          # 工人卡片
│   │   ├── OrderCard/           # 订单卡片
│   │   ├── DataOverview/        # 数据概览
│   │   ├── StatChart/           # 统计图表
│   │   ├── FloatDialButton/     # 悬浮拨号球
│   │   ├── BottomSheet/         # 底部弹窗
│   │   ├── ModalDialog/         # 模态框
│   │   ├── ImageUploader/       # 图片上传
│   │   ├── SearchBar/           # 搜索栏
│   │   ├── AddressPicker/       # 地址选择
│   │   ├── StarRating/          # 星级评分
│   │   ├── EmptyState/          # 空状态
│   │   ├── LoadingSkeleton/     # 骨架屏
│   │   ├── StatusBadge/         # 状态标签
│   │   ├── ToastMessage/        # 轻提示
│   │   └── PullRefresh/         # 下拉刷新容器
│   │
│   ├── pages/                   # 页面目录
│   │   ├── index/               # 首页
│   │   ├── services/            # 全部服务
│   │   ├── mine/                # 我的
│   │   ├── searchResult/        # 搜索结果
│   │   ├── bannerDetail/        # Banner详情
│   │   ├── newsList/            # 资讯列表
│   │   ├── newsDetail/          # 资讯详情
│   │   ├── serviceCategory/     # 服务分类
│   │   ├── workerDetail/        # 工人详情
│   │   ├── orderCreate/         # 预约下单
│   │   ├── orders/              # 订单列表
│   │   ├── orderDetail/         # 订单详情
│   │   ├── payResult/           # 支付结果
│   │   ├── review/              # 评价
│   │   ├── chatList/            # 聊天列表
│   │   ├── chat/                # 即时通讯
│   │   ├── workerProfile/       # 我的职业信息
│   │   ├── orderHall/           # 接单大厅
│   │   ├── income/              # 收益统计
│   │   ├── withdrawApply/       # 申请提现
│   │   ├── publish/             # 发布信息
│   │   ├── myPublish/           # 我的发布
│   │   ├── partnerIncome/       # 合作商收益
│   │   ├── mapSelect/           # 地图选址
│   │   ├── history/             # 浏览记录
│   │   ├── customerService/     # 客服
│   │   ├── about/               # 关于我们
│   │   ├── roleSwitch/          # 角色切换
│   │   ├── login/               # 登录
│   │   ├── previewImage/        # 图片预览
│   │   └── admin/               # 管理后台
│   │       ├── admin/           # 管理首页
│   │       ├── users/           # 用户管理
│   │       ├── workers/         # 工人管理
│   │       ├── partners/        # 合作商管理
│   │       ├── orders/          # 订单管理
│   │       ├── publish/         # 发布管理
│   │       ├── withdraw/        # 提现审核
│   │       ├── banner/          # Banner管理
│   │       └── settings/        # 系统设置
│   │
│   ├── utils/                   # 工具函数
│   │   ├── api.js               # API请求封装
│   │   ├── util.js              # 通用工具函数
│   │   ├── constants.js         # 常量定义
│   │   ├── auth.js              # 认证相关
│   │   ├── location.js          # 位置服务
│   │   ├── payment.js           # 支付封装
│   │   ├── date.js              # 日期处理
│   │   ├── validate.js          # 表单校验
│   │   └── throttle.js          # 节流防抖
│   │
│   ├── images/                  # 静态图片资源
│   │   ├── icons/               # 图标
│   │   ├── banners/             # Banner素材
│   │   ├── default/             # 默认图（头像/占位）
│   │   └── kingkong/            # 金刚区图标
│   │
│   └── styles/                  # 公共样式
│       ├── variables.wxss       # 样式变量
│       └── mixins.wxss          # 样式混入
│
└── project.config.json          # 项目配置
```

---

## 10. 开发优先级规划

### Phase 1: MVP核心版本（2-3周）

| 优先级 | 模块 | 页面 | 说明 |
|-------|------|------|------|
| P0 | 用户系统 | 登录页、用户中心 | 登录、注册、角色切换 |
| P0 | 首页 | 首页 | Banner、金刚区、服务橱窗 |
| P0 | 服务浏览 | 全部服务、服务分类、工人详情 | 分类浏览、工人展示 |
| P0 | 下单支付 | 预约下单、订单列表、订单详情、支付结果 | 完整下单链路 |
| P0 | 工人接单 | 接单大厅、我的职业信息 | 抢单核心流程 |

### Phase 2: 功能完善版（2周）

| 优先级 | 模块 | 页面 | 说明 |
|-------|------|------|------|
| P1 | 即时通讯 | 聊天列表、即时通讯 | 在线沟通 |
| P1 | 评价体系 | 评价页 | 订单完成后评价 |
| P1 | 合作商系统 | 发布信息、我的发布 | 信息发布 |
| P1 | 资讯系统 | 资讯列表、资讯详情 | 同城头条 |

### Phase 3: 管理后台版（1-2周）

| 优先级 | 模块 | 页面 | 说明 |
|-------|------|------|------|
| P2 | 管理后台 | 数据统计、用户管理、工人管理、合作商管理 | 核心管理功能 |
| P2 | 管理后台 | 订单管理、发布管理、提现审核 | 审核管理功能 |
| P2 | 管理后台 | Banner管理、系统设置 | 运营配置功能 |

### Phase 4: 优化迭代版（持续）

| 优先级 | 模块 | 说明 |
|-------|------|------|
| P3 | 数据分析 | 更详细的统计报表、数据导出 |
| P3 | 营销功能 | 优惠券、分享裂变、积分系统 |
| P3 | 性能优化 | 图片懒加载、分包加载、缓存策略 |
| P3 | 体验优化 | 动画效果、加载速度、无障碍优化 |

---

> **文档统计摘要**
>
> | 项目 | 数量 |
> |-----|------|
> | 总页面数 | **34个** |
> | 可复用组件数 | **22个** |
> | 云函数数 | **32个** |
> | 核心业务流程 | **4条** |
> | 数据集合 | **12个** |
> | 开发阶段 | **4期** |
>
> 本文档完整覆盖了设计文档中所有功能点，可作为后续开发的参考基准。各清单均按模块分组，便于团队成员分工协作。
