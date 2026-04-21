# 春辉综合服务部 — 技术规格说明书 (SPEC.md)

> 本文档是项目的单一事实来源，所有子代理必须忠实实现此规格。

---

## 1. 项目结构

```
/mnt/agents/output/project/
├── app.js                          # 全局App逻辑，云开发初始化
├── app.json                        # 全局配置：页面路由、TabBar、导航栏
├── app.wxss                        # 全局样式：CSS变量、工具类、重置样式
├── config.js                       # 常量配置：颜色、API地址、分页大小
├── sitemap.json                    # 小程序索引配置
├── project.config.json             # 项目配置文件
├── README.md                       # 项目说明
│
├── pages/                          # 页面目录
│   ├── index/                      # 首页（综合生活馆）
│   ├── services/                   # 全部服务（左右双栏）
│   ├── mine/                       # 用户中心（"我的"）
│   ├── workerDetail/               # 工人详情页
│   ├── orderCreate/                # 预约下单页
│   ├── orderDetail/                # 订单详情页
│   ├── orders/                     # 订单列表页
│   ├── chat/                       # 即时通讯页
│   ├── chatList/                   # 聊天列表页
│   ├── searchResult/               # 搜索结果页
│   ├── workerProfile/              # 工人职业信息编辑
│   ├── orderHall/                  # 接单大厅
│   ├── income/                     # 收益统计页
│   ├── withdrawApply/              # 申请提现页
│   ├── publish/                    # 发布信息页
│   ├── myPosts/                    # 我的发布管理
│   ├── partnerCenter/              # 合作商中心
│   ├── adminDashboard/             # 管理员后台首页
│   ├── userManage/                 # 用户管理
│   ├── workerManage/               # 工人管理
│   ├── orderManage/                # 订单管理
│   ├── postManage/                 # 发布内容管理
│   ├── withdrawManage/             # 提现审核管理
│   └── bannerManage/               # Banner管理
│
├── components/                     # 可复用组件
│   ├── serviceGrid/                # 金刚区网格（首页8入口）
│   ├── serviceSection/             # 服务橱窗版块
│   ├── workerCard/                 # 工人卡片
│   ├── orderCard/                  # 订单卡片
│   ├── postCard/                   # 发布内容卡片
│   ├── chatBubble/                 # 聊天消息气泡
│   ├── floatDial/                  # 悬浮拨号球
│   ├── dialButton/                 # 拨号按钮
│   ├── searchBar/                  # 搜索栏
│   ├── locationPicker/             # 位置选择器
│   ├── roleBadge/                  # 角色徽章
│   ├── statusTag/                  # 状态标签
│   ├── emptyState/                 # 空状态展示
│   ├── loadingMore/                # 加载更多提示
│   └── tabBar/                     # 底部Tab栏（自定义）
│
├── cloud/functions/                # 云函数目录
│   ├── login/                      # 微信登录
│   ├── getUserInfo/                # 获取用户信息
│   ├── updateUserInfo/             # 更新用户信息
│   ├── roleSwitch/                 # 角色切换验证
│   ├── getBannerList/              # 获取Banner列表
│   ├── getCategoryList/            # 获取服务分类
│   ├── getWorkerList/              # 获取工人列表
│   ├── getWorkerDetail/            # 获取工人详情
│   ├── createOrder/                # 创建订单
│   ├── getOrderList/               # 获取订单列表
│   ├── getOrderDetail/             # 获取订单详情
│   ├── updateOrderStatus/          # 更新订单状态
│   ├── cancelOrder/                # 取消订单
│   ├── grabOrder/                  # 抢单
│   ├── startService/               # 开始服务
│   ├── completeService/            # 完成服务
│   ├── submitReview/               # 提交评价
│   ├── getReviewList/              # 获取评价列表
│   ├── createMessage/              # 发送消息
│   ├── getChatList/                # 获取聊天列表
│   ├── getChatHistory/             # 获取聊天历史
│   ├── watchMessages/              # 监听新消息
│   ├── publishPost/                # 发布信息
│   ├── getPostList/                # 获取发布列表
│   ├── getPostDetail/              # 获取发布详情
│   ├── updatePostStatus/           # 更新发布状态（审核）
│   ├── applyWithdraw/              # 申请提现
│   ├── getWithdrawList/            # 获取提现列表
│   ├── updateWithdrawStatus/       # 更新提现状态
│   ├── getAdminStats/              # 获取管理统计数据
│   ├── getUserList/                # 获取用户列表（管理）
│   ├── updateUserStatus/           # 更新用户状态
│   └── uploadImage/                # 上传图片
│
├── utils/
│   ├── request.js                  # 云函数调用封装
│   ├── util.js                     # 通用工具函数
│   ├── dateFormat.js              # 日期格式化
│   ├── location.js                # 地理位置工具
│   ├── permission.js              # 权限检查
│   └── constants.js               # 常量定义
│
└── images/                         # 静态图片资源
    ├── icons/                      # 图标资源
    └── banners/                    # Banner图片
```

---

## 2. 全局状态 (globalData)

```javascript
App({
  globalData: {
    userInfo: null,           // 当前用户信息
    userRole: 'user',         // 当前角色：user/worker/partner/admin
    roles: ['user'],          // 用户拥有的所有角色
    location: {               // 当前位置
      latitude: null,
      longitude: null,
      address: '',
      city: ''
    },
    systemInfo: null,         // 系统信息
    unreadCount: 0,           // 未读消息数
    isLogin: false            // 登录状态
  }
})
```

---

## 3. 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| pages/index/index | 首页 | Tab首页 |
| pages/services/services | 全部服务 | Tab页面 |
| pages/mine/mine | 我的 | Tab页面 |
| pages/workerDetail/workerDetail | 工人详情 | 需传入workerId |
| pages/orderCreate/orderCreate | 预约下单 | 需传入workerId, categoryId |
| pages/orderDetail/orderDetail | 订单详情 | 需传入orderId |
| pages/orders/orders | 订单列表 | 需传入status(可选) |
| pages/chat/chat | 即时通讯 | 需传入targetId, orderId(可选) |
| pages/chatList/chatList | 聊天列表 | |
| pages/searchResult/searchResult | 搜索结果 | 需传入keyword |
| pages/workerProfile/workerProfile | 工人资料 | |
| pages/orderHall/orderHall | 接单大厅 | |
| pages/income/income | 收益统计 | |
| pages/withdrawApply/withdrawApply | 申请提现 | |
| pages/publish/publish | 发布信息 | 需传入type |
| pages/myPosts/myPosts | 我的发布 | |
| pages/partnerCenter/partnerCenter | 合作商中心 | |
| pages/adminDashboard/adminDashboard | 管理后台 | |
| pages/userManage/userManage | 用户管理 | |
| pages/workerManage/workerManage | 工人管理 | |
| pages/orderManage/orderManage | 订单管理 | |
| pages/postManage/postManage | 发布管理 | |
| pages/withdrawManage/withdrawManage | 提现管理 | |
| pages/bannerManage/bannerManage | Banner管理 | |

---

## 4. 组件接口

### 4.1 floatDial（悬浮拨号球）
```
Props: 无
Events: tap → 弹出ActionSheet（拨打客服/微信客服）
Style: position: fixed; bottom: 30px; right: 30px; z-index: 999
       直径60px, 背景#2E7D32, 白色电话图标, 阴影
```

### 4.2 serviceGrid（金刚区网格）
```
Props:
  - services: Array<{id, name, icon, url}>  // 8个服务项
Events: itemTap → 导航到对应页面
Style: 2行4列网格, 绿色渐变顶部背景
```

### 4.3 workerCard（工人卡片）
```
Props:
  - worker: {id, name, avatar, distance, tags[], rating, orderCount}
  - showAction: Boolean  // 是否显示预约按钮
Events: 
  - tap → 查看工人详情
  - bookTap → 预约该工人
```

### 4.4 orderCard（订单卡片）
```
Props:
  - order: {id, status, categoryName, workerName, amount, time, address}
  - role: String  // user/worker 决定显示的按钮
Events:
  - tap → 查看订单详情
  - actionTap → 执行对应操作（取消/开始/完成）
```

### 4.5 statusTag（状态标签）
```
Props:
  - status: String  // 状态值
  - type: String     // order/post/withdraw 决定颜色映射
Style: 小药丸形状, 不同状态不同颜色
```

---

## 5. 云函数接口

### 5.1 login
```
Input:  { code: String }  // wx.login获取的code
Output: { 
  code: 0,
  data: { 
    openid: String,
    unionid: String,
    token: String,
    userInfo: Object  // 用户信息（如已注册）
  }
}
```

### 5.2 getUserInfo
```
Input:  {}
Output: { code: 0, data: userInfo }
Auth:   云开发自动鉴权（_openid）
```

### 5.3 roleSwitch
```
Input:  { role: String, account: String, password: String }
Output: { code: 0, data: { role: String, token: String } }
        { code: 401, message: "账号或密码错误" }
```

### 5.4 createOrder
```
Input:  { 
  workerId: String, 
  categoryId: String,
  address: Object,
  appointmentTime: Date,
  remark: String,
  amount: Number 
}
Output: { code: 0, data: { orderId: String } }
```

### 5.5 grabOrder
```
Input:  { orderId: String }
Output: { code: 0, data: { success: true } }
        { code: 409, message: "订单已被抢走" }
Logic:  数据库事务确保并发安全
```

---

## 6. 数据模型

### 6.1 User
```javascript
{
  _id: ObjectId,
  _openid: String,
  role: 'user' | 'worker' | 'partner' | 'admin',
  roles: String[],
  nickName: String,
  avatarUrl: String,
  phone: String,
  location: { type: 'Point', coordinates: [lng, lat] },
  balance: Number,        // 单位：分
  status: Number,         // 0-正常 1-禁用
  createTime: Date,
  updateTime: Date
}
```

### 6.2 Worker
```javascript
{
  _id: ObjectId,
  userId: ObjectId,       // 关联users
  realName: String,
  skills: String[],       // 服务技能标签
  serviceAreas: String[], // 服务区域
  pricing: [{ skill: String, price: Number, unit: String }],
  experience: Number,     // 从业年限
  bio: String,            // 个人简介
  workStatus: 'open' | 'busy' | 'closed',
  certificationStatus: 'pending' | 'approved' | 'rejected',
  rating: Number,         // 平均评分
  orderCount: Number,     // 接单数
  totalIncome: Number,    // 累计收入（分）
  createTime: Date
}
```

### 6.3 Order
```javascript
{
  _id: ObjectId,
  orderNo: String,        // 订单编号
  userId: ObjectId,
  workerId: ObjectId,
  categoryId: ObjectId,
  categoryName: String,   // 冗余字段
  status: 'pending' | 'accepted' | 'serving' | 'completed' | 'cancelled' | 'reviewed',
  address: {
    name: String,
    phone: String,
    detail: String,
    latitude: Number,
    longitude: Number
  },
  appointmentTime: Date,
  amount: Number,         // 金额（分）
  remark: String,
  review: {               // 评价信息
    rating: Number,
    content: String,
    createTime: Date
  },
  statusFlow: [{ status: String, time: Date, operator: String }],
  createTime: Date,
  updateTime: Date
}
```

---

## 7. 颜色与样式规范

### CSS变量（app.wxss）
```css
:root {
  --bg-primary: #F5F7F4;
  --bg-secondary: #FFFFFF;
  --accent: #43A047;
  --accent-light: #E8F5E9;
  --accent-secondary: #66BB6A;
  --text-primary: #1A1A1A;
  --text-secondary: #666666;
  --text-inverse: #FFFFFF;
  --action-primary: #2E7D32;
  --action-gradient: linear-gradient(135deg, #43A047, #66BB6A);
  --border: #E0E0E0;
  --warning: #FF9800;
  --error: #F44336;
  
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --shadow-card: 0 4px 12px rgba(0,0,0,0.06);
  --shadow-float: 0 8px 20px rgba(46, 125, 50, 0.4);
  
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 20px;
  --space-xxl: 24px;
}
```

---

## 8. 开发规范

### 8.1 文件命名
- 页面目录：kebab-case（如 order-create）
- 组件目录：kebab-case
- 云函数：camelCase
- JS变量：camelCase
- CSS类：kebab-case

### 8.2 代码规范
- 使用 ES6+ 语法
- 异步操作使用 async/await
- 云函数调用统一使用 utils/request.js 封装
- 所有页面 onLoad 需处理登录态检查
- 所有列表页支持下拉刷新和上拉加载
- 敏感操作需二次确认

### 8.3 错误处理
- 云函数返回统一格式：{ code: Number, data: Any, message: String }
- code === 0 表示成功
- 前端统一在 request.js 中处理 code !== 0 的情况
- 网络错误显示通用提示

---

## 9. 安全规范

- 所有数据库操作必须通过云函数
- 前端不直接暴露数据库 collection 操作
- 云函数中校验用户身份和权限
- 敏感字段（密码、手机号）加密存储
- 图片上传校验文件类型和大小（≤5MB）
- 支付相关操作需要双重校验

---

*本文档为项目开发的唯一事实来源，所有子代理必须严格遵循。*
