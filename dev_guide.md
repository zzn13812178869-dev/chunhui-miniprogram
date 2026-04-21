# 春辉综合服务部 — 开发说明文档

> **版本**：v1.0  
> **适用对象**：前端/后端开发工程师、技术负责人、运维人员  
> **技术栈**：微信小程序原生框架 + 微信云开发（CloudBase）+ 微信支付 + 腾讯位置服务  
> **最后更新**：2024年

---

## 1. 开发环境配置

### 1.1 工具安装

| 工具 | 版本要求 | 下载地址 | 用途 |
|------|----------|----------|------|
| 微信开发者工具 | 稳定版（≥1.06） | https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html | 小程序开发、调试、预览、上传 |
| Node.js | ≥ 16.x LTS | https://nodejs.org/ | 云函数本地调试、npm包管理 |
| Git | ≥ 2.30 | https://git-scm.com/ | 版本控制 |
| VS Code（可选） | 最新版 | https://code.visualstudio.com/ | 辅助代码编辑 |

**验证安装：**

```bash
# 检查 Node.js 版本
node -v        # 应输出 v16.x.x 或更高

# 检查 npm 版本
npm -v         # 应输出 8.x.x 或更高

# 检查 Git 版本
git --version  # 应输出 2.30.x 或更高
```

**微信开发者工具必做配置：**

1. 打开开发者工具 → 设置 → 项目设置
2. 勾选「启用代码自动热重载」
3. 勾选「使用 npm 模块」（用于云函数安装依赖）
4. 勾选「不校验合法域名、web-view…」（开发阶段）
5. 勾选「启用云开发」（如使用云开发）
6. AppID 填入「春辉综合服务部」的正式 AppID（wx开头）

### 1.2 项目初始化步骤

```bash
# 1. 克隆项目代码仓库
git clone https://github.com/your-org/chunhui-miniprogram.git
cd chunhui-miniprogram

# 2. 安装小程序端依赖（如使用了 npm 包）
npm install

# 3. 初始化云函数依赖
cd cloudfunctions/
for dir in */; do
  cd "$dir"
  npm install
  cd ..
done

# 或逐个安装
cd cloudfunctions/user-login && npm install
cd ../order-create && npm install
# ... 对每个云函数重复
```

**导入项目到微信开发者工具：**

1. 打开微信开发者工具 → 点击「+」导入项目
2. 项目目录：选择 `chunhui-miniprogram` 文件夹
3. AppID：填写正式 AppID
4. 后端服务：选择「微信云开发」
5. 点击「确定」导入

### 1.3 云开发环境配置

**开通云开发（首次）：**

1. 在微信开发者工具中，点击左上角「云开发」按钮
2. 点击「开通」，按提示完成开通
3. 记录 **环境 ID**（格式如：`chunhui-xxx`）
4. 建议选择「按量付费」模式（有免费额度，超出后按量计费）

**在项目中配置环境 ID：**

编辑 `project.config.json`：

```json
{
  "cloudfunctionRoot": "cloudfunctions/",
  "appid": "wx你的appid",
  "projectname": "chunhui-miniprogram",
  "setting": {
    "urlCheck": false,
    "es6": true,
    "enhance": true,
    "postcss": true,
    "minified": true,
    "newFeature": true,
    "coverView": true,
    "nodeModules": true,
    "autoAudits": false,
    "showShadowRootInWxmlPanel": true,
    "scopeDataCheck": false,
    "checkInvalidKey": true,
    "checkSiteMap": true,
    "uploadWithSourceMap": true,
    "useMultiFrameRuntime": true,
    "useApiHook": true,
    "useApiHostProcess": true,
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    },
    "bundle": false,
    "useCompilerModule": true,
    "userConfirmedBundleSwitch": false
  }
}
```

编辑 `app.js`，确保云开发初始化正确：

```javascript
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 及以上的基础库以使用云能力');
      return;
    }
    // 初始化云开发环境
    wx.cloud.init({
      env: '你的环境ID',  // ← 替换为实际环境ID
      traceUser: true     // 记录用户访问日志
    });
    this.globalData = {};
  }
});
```

**多环境管理（开发/测试/生产）：**

```javascript
// config/env.js
const ENV_CONFIG = {
  develop: {
    envId: 'chunhui-dev-xxx',
    name: '开发环境'
  },
  trial: {
    envId: 'chunhui-test-xxx',
    name: '测试环境'
  },
  release: {
    envId: 'chunhui-prod-xxx',
    name: '生产环境'
  }
};

const currentEnv = __wxConfig.envVersion || 'develop';
module.exports = ENV_CONFIG[currentEnv];
```

---

## 2. 项目目录结构规范

```
chunhui-miniprogram/                        # 项目根目录
├── miniprogram/                             # 小程序前端代码
│   ├── app.js                               # 小程序入口（云开发初始化）
│   ├── app.json                             # 全局配置（页面路由、tabBar、窗口样式）
│   ├── app.wxss                             # 全局样式
│   ├── sitemap.json                         # 搜索索引配置
│   ├── config/                              # 配置文件
│   │   ├── env.js                           # 环境配置
│   │   ├── constants.js                     # 常量定义
│   │   └── api.config.js                    # API接口配置
│   ├── pages/                               # 页面目录（15+页面）
│   │   ├── index/                           # 首页
│   │   │   ├── index.wxml
│   │   │   ├── index.wxss
│   │   │   ├── index.js
│   │   │   └── index.json
│   │   ├── category/                        # 服务分类页
│   │   │   ├── category.wxml
│   │   │   ├── category.wxss
│   │   │   ├── category.js
│   │   │   └── category.json
│   │   ├── service-detail/                  # 服务详情页
│   │   │   ├── service-detail.wxml
│   │   │   ├── service-detail.wxss
│   │   │   ├── service-detail.js
│   │   │   └── service-detail.json
│   │   ├── service-list/                    # 服务列表页
│   │   │   ├── service-list.wxml
│   │   │   ├── service-list.wxss
│   │   │   ├── service-list.js
│   │   │   └── service-list.json
│   │   ├── booking/                         # 预约下单页
│   │   │   ├── booking.wxml
│   │   │   ├── booking.wxss
│   │   │   ├── booking.js
│   │   │   └── booking.json
│   │   ├── order-confirm/                   # 订单确认页
│   │   │   ├── order-confirm.wxml
│   │   │   ├── order-confirm.wxss
│   │   │   ├── order-confirm.js
│   │   │   └── order-confirm.json
│   │   ├── order-list/                      # 我的订单列表
│   │   │   ├── order-list.wxml
│   │   │   ├── order-list.wxss
│   │   │   ├── order-list.js
│   │   │   └── order-list.json
│   │   ├── order-detail/                    # 订单详情页
│   │   │   ├── order-detail.wxml
│   │   │   ├── order-detail.wxss
│   │   │   ├── order-detail.js
│   │   │   └── order-detail.json
│   │   ├── payment/                         # 支付页面
│   │   │   ├── payment.wxml
│   │   │   ├── payment.wxss
│   │   │   ├── payment.js
│   │   │   └── payment.json
│   │   ├── user-center/                     # 用户中心（我的）
│   │   │   ├── user-center.wxml
│   │   │   ├── user-center.wxss
│   │   │   ├── user-center.js
│   │   │   └── user-center.json
│   │   ├── profile-edit/                    # 编辑资料页
│   │   │   ├── profile-edit.wxml
│   │   │   ├── profile-edit.wxss
│   │   │   ├── profile-edit.js
│   │   │   └── profile-edit.json
│   │   ├── address-list/                    # 地址管理页
│   │   │   ├── address-list.wxml
│   │   │   ├── address-list.wxss
│   │   │   ├── address-list.js
│   │   │   └── address-list.json
│   │   ├── address-edit/                    # 地址编辑页
│   │   │   ├── address-edit.wxml
│   │   │   ├── address-edit.wxss
│   │   │   ├── address-edit.js
│   │   │   └── address-edit.json
│   │   ├── worker-center/                   # 师傅/工人工作台
│   │   │   ├── worker-center.wxml
│   │   │   ├── worker-center.wxss
│   │   │   ├── worker-center.js
│   │   │   └── worker-center.json
│   │   ├── worker-orders/                   # 师傅订单管理
│   │   │   ├── worker-orders.wxml
│   │   │   ├── worker-orders.wxss
│   │   │   ├── worker-orders.js
│   │   │   └── worker-orders.json
│   │   ├── admin-dashboard/                 # 管理员仪表盘
│   │   │   ├── admin-dashboard.wxml
│   │   │   ├── admin-dashboard.wxss
│   │   │   ├── admin-dashboard.js
│   │   │   └── admin-dashboard.json
│   │   ├── admin-order-manage/              # 管理员订单管理
│   │   │   ├── admin-order-manage.wxml
│   │   │   ├── admin-order-manage.wxss
│   │   │   ├── admin-order-manage.js
│   │   │   └── admin-order-manage.json
│   │   ├── admin-user-manage/               # 管理员用户管理
│   │   │   ├── admin-user-manage.wxml
│   │   │   ├── admin-user-manage.wxss
│   │   │   ├── admin-user-manage.js
│   │   │   └── admin-user-manage.json
│   │   ├── admin-service-manage/            # 管理员服务项目管理
│   │   │   ├── admin-service-manage.wxml
│   │   │   ├── admin-service-manage.wxss
│   │   │   ├── admin-service-manage.js
│   │   │   └── admin-service-manage.json
│   │   ├── search/                          # 搜索页
│   │   │   ├── search.wxml
│   │   │   ├── search.wxss
│   │   │   ├── search.js
│   │   │   └── search.json
│   │   ├── coupon/                          # 优惠券页
│   │   │   ├── coupon.wxml
│   │   │   ├── coupon.wxss
│   │   │   ├── coupon.js
│   │   │   └── coupon.json
│   │   └── notice-detail/                   # 公告详情页
│   │       ├── notice-detail.wxml
│   │       ├── notice-detail.wxss
│   │       ├── notice-detail.js
│   │       └── notice-detail.json
│   ├── components/                          # 公共组件（10+组件）
│   │   ├── ch-navbar/                       # 自定义导航栏
│   │   │   ├── ch-navbar.wxml
│   │   │   ├── ch-navbar.wxss
│   │   │   ├── ch-navbar.js
│   │   │   └── ch-navbar.json
│   │   ├── ch-tabbar/                       # 自定义TabBar
│   │   │   ├── ch-tabbar.wxml
│   │   │   ├── ch-tabbar.wxss
│   │   │   ├── ch-tabbar.js
│   │   │   └── ch-tabbar.json
│   │   ├── ch-service-card/                 # 服务卡片
│   │   │   ├── ch-service-card.wxml
│   │   │   ├── ch-service-card.wxss
│   │   │   ├── ch-service-card.js
│   │   │   └── ch-service-card.json
│   │   ├── ch-order-card/                   # 订单卡片
│   │   │   ├── ch-order-card.wxml
│   │   │   ├── ch-order-card.wxss
│   │   │   ├── ch-order-card.js
│   │   │   └── ch-order-card.json
│   │   ├── ch-worker-card/                  # 师傅卡片
│   │   │   ├── ch-worker-card.wxml
│   │   │   ├── ch-worker-card.wxss
│   │   │   ├── ch-worker-card.js
│   │   │   └── ch-worker-card.json
│   │   ├── ch-price-tag/                    # 价格标签
│   │   │   ├── ch-price-tag.wxml
│   │   │   ├── ch-price-tag.wxss
│   │   │   ├── ch-price-tag.js
│   │   │   └── ch-price-tag.json
│   │   ├── ch-status-badge/                 # 状态徽章
│   │   │   ├── ch-status-badge.wxml
│   │   │   ├── ch-status-badge.wxss
│   │   │   ├── ch-status-badge.js
│   │   │   └── ch-status-badge.json
│   │   ├── ch-loading/                      # 加载动画
│   │   │   ├── ch-loading.wxml
│   │   │   ├── ch-loading.wxss
│   │   │   ├── ch-loading.js
│   │   │   └── ch-loading.json
│   │   ├── ch-empty-state/                  # 空状态提示
│   │   │   ├── ch-empty-state.wxml
│   │   │   ├── ch-empty-state.wxss
│   │   │   ├── ch-empty-state.js
│   │   │   └── ch-empty-state.json
│   │   ├── ch-image-uploader/               # 图片上传器
│   │   │   ├── ch-image-uploader.wxml
│   │   │   ├── ch-image-uploader.wxss
│   │   │   ├── ch-image-uploader.js
│   │   │   └── ch-image-uploader.json
│   │   └── ch-date-picker/                  # 日期选择器
│   │       ├── ch-date-picker.wxml
│   │       ├── ch-date-picker.wxss
│   │       ├── ch-date-picker.js
│   │       └── ch-date-picker.json
│   ├── utils/                               # 工具函数
│   │   ├── util.js                          # 通用工具（日期格式化、防抖节流等）
│   │   ├── request.js                       # 云函数请求封装
│   │   ├── auth.js                          # 登录鉴权工具
│   │   ├── validate.js                      # 表单验证
│   │   ├── location.js                      # 位置服务工具
│   │   ├── payment.js                       # 支付工具
│   │   └── constants.js                     # 常量枚举
│   ├── images/                              # 静态图片资源
│   │   ├── icons/                           # 图标（tabBar、功能图标）
│   │   ├── banners/                         # 轮播图素材
│   │   └── empty/                           # 空状态插图
│   └── style/                               # 公共样式
│       ├── variables.wxss                   # CSS变量（主题色、字体大小）
│       ├── mixins.wxss                      # 混合宏
│       └── common.wxss                      # 公共类
├── cloudfunctions/                          # 云函数目录（15+云函数）
│   ├── user-login/                          # 用户登录
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   ├── user-get-info/                       # 获取用户信息
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   ├── user-update-profile/                 # 更新用户资料
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   ├── user-bind-phone/                     # 绑定手机号
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   ├── user-role-switch/                    # 切换用户角色
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   ├── service-list/                        # 获取服务列表
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   ├── service-detail/                      # 获取服务详情
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   ├── service-search/                      # 服务搜索
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   ├── order-create/                        # 创建订单
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   ├── order-get/                           # 获取订单详情
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   ├── order-list/                          # 获取订单列表
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   ├── order-update-status/                 # 更新订单状态
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   ├── order-cancel/                        # 取消订单
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   ├── order-assign-worker/                 # 分配师傅
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   ├── payment-unified-order/               # 统一下单
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   ├── payment-query/                       # 查询支付结果
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   ├── payment-refund/                      # 申请退款
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   ├── address-manage/                      # 地址增删改查
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   ├── coupon-list/                         # 优惠券列表
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   ├── coupon-use/                          # 使用优惠券
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   ├── admin-get-dashboard/                 # 管理员仪表盘数据
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   ├── admin-user-manage/                   # 管理员操作用户
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   ├── admin-service-manage/                # 管理员操作服务
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   ├── notice-get/                          # 获取公告
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   ├── message-notify/                      # 发送订阅消息
│   │   ├── index.js
│   │   ├── config.json
│   │   └── package.json
│   └── common/                              # 公共云函数库（共享代码）
│       ├── utils/
│       │   ├── db.js                        # 数据库操作封装
│       │   ├── response.js                  # 统一响应格式
│       │   ├── auth.js                      # 云函数鉴权
│       │   └── constants.js                 # 云函数常量
│       └── middleware/
│           ├── auth.js                      # 鉴权中间件
│           └── logger.js                    # 日志中间件
├── database/                                # 数据库脚本
│   ├── init-collections.js                  # 初始化集合
│   ├── init-data.json                       # 初始数据
│   ├── indexes.json                         # 索引配置
│   └── permissions.json                     # 权限配置
├── project.config.json                      # 项目配置文件
├── project.private.config.json              # 私有配置（不上传）
├── package.json                             # 项目依赖
└── README.md                                # 项目说明
```

---

## 3. 命名规范

### 3.1 文件命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 页面文件 | 小写字母 + 连字符 | `order-detail.js`, `user-center.wxml` |
| 组件文件 | `ch-`前缀 + 小写 + 连字符 | `ch-service-card.js`, `ch-navbar.wxss` |
| 云函数文件 | 小写 + 连字符，动词开头 | `order-create`, `user-login`, `payment-refund` |
| 工具文件 | 小写 + 连字符，名词 | `util.js`, `request.js`, `validate.js` |
| 图片文件 | 小写 + 连字符 + 用途 | `icon-home-active.png`, `banner-plumbing.jpg` |
| 配置文件 | 小写 + 点分隔 | `api.config.js`, `env.js` |

**禁止**：
- ❌ 使用中文文件名：`订单详情.js`
- ❌ 使用驼峰：`orderDetail.js`, `serviceCard.wxml`
- ❌ 使用下划线：`order_detail.js`, `user_center.wxss`
- ❌ 无意义命名：`a.js`, `temp.wxml`, `1.jpg`

### 3.2 变量命名

```javascript
// ✅ 常量：全大写 + 下划线
const ORDER_STATUS_PENDING = 0;
const ORDER_STATUS_PAID = 1;
const MAX_UPLOAD_IMAGE_COUNT = 9;
const API_BASE_URL = 'https://...';

// ✅ 普通变量：驼峰命名
let userInfo = {};
let orderList = [];
let isLoading = false;
let currentTab = 0;

// ✅ 布尔变量：is/has/can/should 开头
let isLoggedIn = false;
let hasMoreData = true;
let canSubmit = true;
let shouldRefresh = false;

// ✅ 数组：复数形式或 list 后缀
let serviceList = [];
let workers = [];
let bannerImages = [];

// ✅ 函数：动词开头 + 驼峰
function fetchOrderDetail() {}
function handleSubmit() {}
function formatPrice() {}
function validatePhoneNumber() {}

// ✅ 云函数调用：统一使用 callCloudFunction
async function callCloudFunction(name, data) {
  return wx.cloud.callFunction({ name, data });
}

// ❌ 错误示例
let a = 1;                    // 无意义
let xxxxx = '';               // 无意义
let order_list = [];          // 应该用驼峰
let OrderList = [];           // 不应该大写开头
let getorder = () => {};      // 应该驼峰分隔
```

### 3.3 类名/组件命名

**WXSS 类名规范（BEM 命名法）：**

```css
/* Block（模块） */
.service-card {}
.order-list {}
.user-profile {}

/* Element（元素）：双下划线 */
.service-card__title {}
.service-card__price {}
.order-list__item {}
.user-profile__avatar {}

/* Modifier（修饰）：双连字符 */
.service-card--featured {}
.service-card--disabled {}
.btn--primary {}
.btn--large {}

/* 状态类：is- 前缀 */
.is-active {}
.is-disabled {}
.is-hidden {}
.is-loading {}
```

**组件命名：**

```javascript
// components/ch-service-card/ch-service-card.js
Component({
  // 组件名（可选，用于调试）
  options: {
    addGlobalClass: true
  },
  
  // 属性定义
  properties: {
    // ✅ 属性名用驼峰
    serviceInfo: {
      type: Object,
      value: {}
    },
    showPrice: {
      type: Boolean,
      value: true
    },
    // ❌ 不要用连字符属性名
    // 'service-info': {}  ← 这样不好
  },
  
  // 数据
  data: {
    isExpanded: false
  }
});
```

### 3.4 云函数命名

| 命名模式 | 说明 | 示例 |
|----------|------|------|
| `{资源}-{动作}` | 标准 CRUD | `user-get-info`, `order-create` |
| `{资源}-{动作}-{对象}` | 带对象的 CRUD | `order-update-status`, `user-bind-phone` |
| `{角色}-{动作}-{资源}` | 管理员专用 | `admin-get-dashboard`, `admin-user-manage` |
| `{功能}-{动作}` | 功能模块 | `payment-unified-order`, `message-notify` |

**命名约定：**
- 全部小写
- 用连字符 `-` 分隔
- 动词放在第二位（`user-login` 而非 `login-user`）
- 批量操作加 `batch-` 前缀：`batch-update-orders`
- 定时触发加 `schedule-` 前缀：`schedule-cleanup-expired`

---

## 4. 代码规范

### 4.1 WXML规范

```xml
<!-- ✅ 正确：缩进2空格，属性换行对齐 -->
<view class="order-card {{ isUrgent ? 'order-card--urgent' : '' }}">
  <image 
    class="order-card__image"
    src="{{ order.serviceImage }}"
    mode="aspectFill"
    lazy-load
  />
  <view class="order-card__content">
    <text class="order-card__title">{{ order.title }}</text>
    <text class="order-card__status is-{{ order.status }}">
      {{ order.statusText }}
    </text>
  </view>
</view>

<!-- ❌ 错误：一行太长，无缩进 -->
<view class="order-card"><image class="order-card__image" src="{{order.serviceImage}}" mode="aspectFill"/><view class="order-card__content"><text>{{order.title}}</text></view></view>

<!-- ✅ 正确：条件渲染 -->
<view wx:if="{{ isAdmin }}">
  <ch-admin-panel adminInfo="{{ adminInfo }}" />
</view>
<view wx:elif="{{ isWorker }}">
  <ch-worker-panel workerInfo="{{ workerInfo }}" />
</view>
<view wx:else>
  <ch-user-panel userInfo="{{ userInfo }}" />
</view>

<!-- ✅ 正确：列表渲染 -->
<view 
  class="order-list__item"
  wx:for="{{ orderList }}"
  wx:for-item="order"
  wx:for-index="index"
  wx:key="_id"
  data-id="{{ order._id }}"
  bindtap="onOrderTap"
>
  <text>{{ index + 1 }}. {{ order.title }}</text>
</view>

<!-- ✅ 正确：模板使用 -->
<template name="serviceCard">
  <view class="service-card">
    <image class="service-card__image" src="{{ image }}" mode="aspectFill" />
    <view class="service-card__info">
      <text class="service-card__name">{{ name }}</text>
      <text class="service-card__price">￥{{ price }}</text>
    </view>
  </view>
</template>

<template is="serviceCard" data="{{ ...service }}" />
```

**WXML 规范要点：**

1. **缩进**：统一2个空格
2. **引号**：属性值用双引号 `"{{ value }}"`
3. **表达式**：`{{}}` 内只写简单表达式，复杂逻辑放 JS
4. **事件绑定**：用 `bind/catch` + 驼峰事件名：`bindtap="onSubmit"`，`catchsubmit="handleSubmit"`
5. **自定义组件**：标签名全小写 + 连字符：`<ch-service-card />`
6. **图片**：必须设置 `mode`，首屏图片不用 `lazy-load`，非首屏必须加 `lazy-load`
7. **key**：列表渲染必须提供 `wx:key`，优先用 `_id`

### 4.2 WXSS规范

```css
/* ✅ 正确：按属性分组，字母顺序 */
.order-card {
  /* 布局 */
  display: flex;
  flex-direction: row;
  align-items: center;
  
  /* 盒模型 */
  margin: 20rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  
  /* 视觉 */
  background-color: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

/* ✅ 正确：使用 rpx 作为尺寸单位 */
.banner {
  width: 750rpx;
  height: 320rpx;
}

/* ✅ 正确：使用 CSS 变量（定义在 variables.wxss） */
Page {
  --primary-color: #1989fa;
  --success-color: #07c160;
  --warning-color: #ff976a;
  --danger-color: #ee0a24;
  --text-primary: #323233;
  --text-secondary: #969799;
  --bg-color: #f7f8fa;
  --border-color: #ebedf0;
  --font-size-sm: 24rpx;
  --font-size-md: 28rpx;
  --font-size-lg: 32rpx;
  --font-size-xl: 36rpx;
  --radius-sm: 8rpx;
  --radius-md: 16rpx;
  --radius-lg: 24rpx;
}

/* ✅ 正确：媒体查询适配 */
@media (prefers-color-scheme: dark) {
  Page {
    --bg-color: #1a1a1a;
    --text-primary: #ffffff;
  }
}

/* ❌ 错误：使用 px（小程序中不推荐使用） */
.card { padding: 10px; }

/* ❌ 错误：使用 id 选择器 */
#header { font-size: 32rpx; }

/* ❌ 错误：嵌套过深 */
.page .section .card .header .title { color: red; }
```

**WXSS 规范要点：**

1. **单位**：一律使用 `rpx`，禁止使用 `px`（字体大小除外，可用 `px` 保证清晰度）
2. **选择器**：只用类选择器，禁止 `id` 选择器和标签选择器
3. **嵌套**：不超过3层嵌套
4. **颜色**：使用变量，禁止硬编码色值
5. **图片**：优先使用网络图片或 CDN，减少包体积
6. **导入**：公共样式在 `app.wxss` 中 `@import`

### 4.3 JS规范

```javascript
// pages/order-list/order-list.js
const { request } = require('../../utils/request');
const { ORDER_STATUS } = require('../../utils/constants');

Page({
  // ========== 页面数据 ==========
  data: {
    // 列表数据
    orderList: [],
    // 分页
    page: 1,
    pageSize: 10,
    hasMore: true,
    // 状态
    isLoading: false,
    isRefreshing: false,
    currentStatus: -1, // -1=全部
    // 筛选
    statusTabs: [
      { label: '全部', value: -1 },
      { label: '待支付', value: 0 },
      { label: '进行中', value: 1 },
      { label: '已完成', value: 2 },
      { label: '已取消', value: 3 }
    ]
  },

  // ========== 生命周期 ==========
  onLoad(options) {
    this.fetchOrderList();
  },

  onShow() {
    if (this.data.needRefresh) {
      this.refreshList();
    }
  },

  onPullDownRefresh() {
    this.setData({ isRefreshing: true });
    this.refreshList().finally(() => {
      wx.stopPullDownRefresh();
      this.setData({ isRefreshing: false });
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.loadMore();
    }
  },

  // ========== 数据请求 ==========
  
  /**
   * 获取订单列表
   * @param {boolean} isRefresh - 是否刷新
   */
  async fetchOrderList(isRefresh = false) {
    if (this.data.isLoading) return;
    
    this.setData({ isLoading: true });
    
    try {
      const { currentStatus, page, pageSize } = this.data;
      const params = {
        page: isRefresh ? 1 : page,
        pageSize,
        status: currentStatus === -1 ? undefined : currentStatus
      };
      
      const res = await request('order-list', params);
      
      this.setData({
        orderList: isRefresh ? res.list : [...this.data.orderList, ...res.list],
        page: (isRefresh ? 1 : page) + 1,
        hasMore: res.list.length === pageSize,
        isLoading: false
      });
    } catch (err) {
      this.setData({ isLoading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
      console.error('获取订单列表失败:', err);
    }
  },

  /**
   * 刷新列表
   */
  async refreshList() {
    await this.fetchOrderList(true);
  },

  /**
   * 加载更多
   */
  loadMore() {
    this.fetchOrderList(false);
  },

  // ========== 事件处理 ==========
  
  /**
   * 切换状态标签
   */
  onStatusTabTap(e) {
    const { value } = e.currentTarget.dataset;
    this.setData({
      currentStatus: value,
      orderList: [],
      page: 1,
      hasMore: true
    }, () => {
      this.fetchOrderList(true);
    });
  },

  /**
   * 点击订单卡片
   */
  onOrderCardTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?id=${id}`
    });
  },

  /**
   * 支付订单
   */
  async onPayOrderTap(e) {
    const { id } = e.currentTarget.dataset;
    
    // 防止重复点击
    if (this.data.isPaying) return;
    this.setData({ isPaying: true });
    
    try {
      await this.handlePayment(id);
      wx.showToast({ title: '支付成功', icon: 'success' });
      this.refreshList();
    } catch (err) {
      wx.showToast({ title: err.message || '支付失败', icon: 'none' });
    } finally {
      this.setData({ isPaying: false });
    }
  },

  // ========== 私有方法 ==========
  
  /**
   * 处理支付逻辑
   * @private
   */
  async handlePayment(orderId) {
    // 具体支付逻辑...
  }
});
```

**JS 规范要点：**

1. **严格模式**：`'use strict';`
2. **分号**：每个语句末尾必须加分号
3. **引号**：字符串使用单引号
4. **缩进**：2个空格
5. **注释**：函数必须写 JSDoc 注释，复杂逻辑写行内注释
6. **错误处理**：异步操作必须 try/catch
7. **this.setData**：不要频繁调用，尽量合并；不要设置未在 data 中声明的字段
8. **路由跳转**：统一使用绝对路径 `/pages/xxx/xxx`
9. **防止重复点击**：按钮操作加 `isXxx` 标志位
10. **全局数据**：通过 `getApp().globalData` 访问，不要滥用

**utils/request.js — 统一请求封装：**

```javascript
/**
 * 统一云函数调用封装
 * @param {string} name - 云函数名称
 * @param {Object} data - 请求参数
 * @param {Object} options - 可选配置
 * @returns {Promise}
 */
function request(name, data = {}, options = {}) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success: (res) => {
        if (res.result && res.result.code !== 0) {
          reject(new Error(res.result.message || '请求失败'));
        } else {
          resolve(res.result.data || res.result);
        }
      },
      fail: (err) => {
        console.error(`云函数 [${name}] 调用失败:`, err);
        reject(new Error('网络请求失败，请检查网络'));
      }
    });
  });
}

module.exports = { request };
```

### 4.4 云函数规范

```javascript
// cloudfunctions/order-create/index.js
const cloud = require('wx-server-sdk');

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

/**
 * 云函数主入口
 * @param {Object} event - 调用参数
 * @param {string} event.serviceId - 服务ID
 * @param {Object} event.address - 地址信息
 * @param {string} event.remark - 备注
 * @param {string} event.appointmentDate - 预约日期
 * @param {Object} context - 调用上下文
 */
exports.main = async (event, context) => {
  const { serviceId, address, remark, appointmentDate } = event;
  const { OPENID } = cloud.getWXContext();
  
  // ========== 参数校验 ==========
  if (!serviceId) {
    return { code: 400, message: '服务ID不能为空' };
  }
  if (!address || !address.detail) {
    return { code: 400, message: '地址信息不完整' };
  }
  if (!appointmentDate) {
    return { code: 400, message: '请选择预约时间' };
  }
  
  try {
    // ========== 业务逻辑 ==========
    
    // 1. 查询服务信息
    const serviceRes = await db.collection('services').doc(serviceId).get();
    const service = serviceRes.data;
    
    if (!service) {
      return { code: 404, message: '服务不存在' };
    }
    
    if (service.status !== 1) {
      return { code: 400, message: '该服务已下架' };
    }
    
    // 2. 查询用户信息
    const userRes = await db.collection('users')
      .where({ _openid: OPENID })
      .get();
    
    if (userRes.data.length === 0) {
      return { code: 401, message: '用户未登录' };
    }
    
    const user = userRes.data[0];
    
    // 3. 生成订单号
    const orderNo = generateOrderNo();
    
    // 4. 创建订单数据
    const orderData = {
      orderNo,
      _openid: OPENID,
      userId: user._id,
      userName: user.nickName || user.realName || '',
      userPhone: user.phone || '',
      
      // 服务信息
      serviceId: service._id,
      serviceName: service.name,
      serviceImage: service.coverImage || '',
      servicePrice: service.price,
      serviceUnit: service.unit || '次',
      
      // 地址信息
      address: {
        province: address.province || '',
        city: address.city || '',
        district: address.district || '',
        detail: address.detail,
        contactName: address.contactName || user.nickName || '',
        contactPhone: address.contactPhone || user.phone || '',
        latitude: address.latitude || null,
        longitude: address.longitude || null
      },
      
      // 预约信息
      appointmentDate,
      remark: remark || '',
      
      // 状态
      status: 0, // 0=待支付, 1=已支付, 2=已分配, 3=服务中, 4=已完成, 5=已取消
      statusText: '待支付',
      
      // 金额
      totalAmount: service.price,
      discountAmount: 0,
      payAmount: service.price,
      
      // 师傅信息（待分配）
      workerId: '',
      workerName: '',
      workerPhone: '',
      
      // 时间戳
      createTime: db.serverDate(),
      updateTime: db.serverDate(),
      payTime: null,
      assignTime: null,
      completeTime: null,
      cancelTime: null
    };
    
    // 5. 写入数据库
    const addRes = await db.collection('orders').add({
      data: orderData
    });
    
    // 6. 返回结果
    return {
      code: 0,
      message: '创建成功',
      data: {
        orderId: addRes._id,
        orderNo,
        payAmount: orderData.payAmount
      }
    };
    
  } catch (err) {
    console.error('创建订单失败:', err);
    return {
      code: 500,
      message: '系统繁忙，请稍后重试',
      error: err.message
    };
  }
};

/**
 * 生成订单号
 * @returns {string}
 */
function generateOrderNo() {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const timeStr = String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CH${dateStr}${timeStr}${randomStr}`;
}
```

**云函数规范要点：**

1. **初始化**：`cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })`
2. **获取 OpenID**：`const { OPENID } = cloud.getWXContext()`
3. **参数校验**：函数开头必须校验所有必需参数
4. **错误处理**：所有数据库操作必须 try/catch
5. **返回值**：统一格式 `{ code, message, data }`，code=0 表示成功
6. **日志**：关键节点使用 `console.log/error` 记录，便于调试
7. **事务**：涉及多文档更新的操作必须使用数据库事务
8. **超时**：单个云函数执行时间不超过 20 秒
9. **内存**：单次调用内存不超过 256MB
10. **并发**：注意控制并发量，避免触发限流

**统一响应工具（cloudfunctions/common/utils/response.js）：**

```javascript
/**
 * 成功响应
 */unction success(data = null, message = '操作成功') {
  return { code: 0, message, data };
}

/**
 * 失败响应
 */
function fail(message = '操作失败', code = 500, error = null) {
  const res = { code, message };
  if (error && process.env.NODE_ENV !== 'release') {
    res.error = error;
  }
  return res;
}

/**
 * 参数错误
 */
function badRequest(message = '参数错误') {
  return fail(message, 400);
}

/**
 * 未授权
 */
function unauthorized(message = '请先登录') {
  return fail(message, 401);
}

/**
 * 无权限
 */
function forbidden(message = '无权访问') {
  return fail(message, 403);
}

/**
 * 资源不存在
 */
function notFound(message = '资源不存在') {
  return fail(message, 404);
}

module.exports = { success, fail, badRequest, unauthorized, forbidden, notFound };
```

---

## 5. 云开发部署指南

### 5.1 数据库初始化

#### 5.1.1 创建集合

**方式一：通过开发者工具控制台**

1. 打开微信开发者工具 → 点击「云开发」→ 「数据库」
2. 点击「添加集合」按钮
3. 依次创建以下集合：

| 集合名 | 说明 | 主要字段 |
|--------|------|----------|
| `users` | 用户表 | _openid, nickName, avatarUrl, phone, role, status |
| `workers` | 师傅/工人表 | userId, realName, skills, serviceArea, rating, orderCount |
| `services` | 服务项目表 | name, categoryId, price, unit, coverImage, status, sort |
| `categories` | 服务分类表 | name, icon, sort, status |
| `orders` | 订单表 | orderNo, _openid, serviceId, status, totalAmount, workerId |
| `addresses` | 地址表 | _openid, province, city, district, detail, isDefault |
| `coupons` | 优惠券表 | title, type, value, minAmount, startTime, endTime, totalCount |
| `user_coupons` | 用户优惠券关联表 | _openid, couponId, status, getTime, useTime |
| `notices` | 公告表 | title, content, type, isTop, createTime |
| `payments` | 支付记录表 | orderId, orderNo, transactionId, amount, status, payTime |
| `refunds` | 退款记录表 | orderId, paymentId, amount, reason, status, applyTime |
| `balance_logs` | 余额变动日志 | userId, type, amount, balance, remark, createTime |
| `messages` | 消息通知表 | _openid, type, title, content, isRead, createTime |
| `ratings` | 评价表 | orderId, workerId, userId, score, content, tags |
| `banners` | 轮播图表 | image, link, type, sort, status, startTime, endTime |

**方式二：通过云函数批量创建**

```javascript
// cloudfunctions/init-database/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const COLLECTIONS = [
  'users', 'workers', 'services', 'categories', 'orders',
  'addresses', 'coupons', 'user_coupons', 'notices',
  'payments', 'refunds', 'balance_logs', 'messages',
  'ratings', 'banners'
];

exports.main = async () => {
  const results = [];
  
  for (const name of COLLECTIONS) {
    try {
      await db.createCollection(name);
      results.push({ name, status: 'created' });
    } catch (err) {
      if (err.errCode === -502005) {
        results.push({ name, status: 'exists' });
      } else {
        results.push({ name, status: 'error', error: err.message });
      }
    }
  }
  
  return { code: 0, message: '初始化完成', data: results };
};
```

部署并执行：

```bash
# 部署云函数
wx cloud functions:deploy --name init-database

# 在开发者工具中调用测试
```

#### 5.1.2 导入初始数据

**导入服务分类（categories）：**

```json
// database/init-categories.json
[
  { "name": "家政保洁", "icon": "/images/icons/cleaning.png", "sort": 1, "status": 1 },
  { "name": "水电维修", "icon": "/images/icons/plumbing.png", "sort": 2, "status": 1 },
  { "name": "家电维修", "icon": "/images/icons/appliance.png", "sort": 3, "status": 1 },
  { "name": "搬家拉货", "icon": "/images/icons/moving.png", "sort": 4, "status": 1 },
  { "name": "开锁换锁", "icon": "/images/icons/locksmith.png", "sort": 5, "status": 1 },
  { "name": "管道疏通", "icon": "/images/icons/dredging.png", "sort": 6, "status": 1 },
  { "name": "电脑维修", "icon": "/images/icons/computer.png", "sort": 7, "status": 1 },
  { "name": "空调清洗", "icon": "/images/icons/ac-clean.png", "sort": 8, "status": 1 }
]
```

**导入初始服务（services）：**

```json
// database/init-services.json
[
  {
    "name": "日常保洁",
    "categoryId": "{{category_cleaning_id}}",
    "price": 80,
    "unit": "小时",
    "coverImage": "cloud://path/to/image.jpg",
    "description": "包含地面清洁、家具擦拭、垃圾清理",
    "status": 1,
    "sort": 1,
    "createTime": { "__type__": "Date", "iso": "2024-01-01T00:00:00.000Z" }
  },
  {
    "name": "水管维修",
    "categoryId": "{{category_plumbing_id}}",
    "price": 100,
    "unit": "次",
    "coverImage": "cloud://path/to/image.jpg",
    "description": "水管漏水、破裂维修，含基础材料",
    "status": 1,
    "sort": 1,
    "createTime": { "__type__": "Date", "iso": "2024-01-01T00:00:00.000Z" }
  }
]
```

**导入方式：**

1. 打开云开发控制台 → 数据库 → 选择集合
2. 点击「导入」按钮
3. 选择 JSON 文件导入
4. 或使用云函数程序化导入：

```javascript
// cloudfunctions/init-data/index.js
const cloud = require('wx-server-sdk');
const initCategories = require('./data/categories.json');
const initServices = require('./data/services.json');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async () => {
  const batch = db.command;
  
  // 批量导入分类
  const categoryTasks = initCategories.map(item => 
    db.collection('categories').add({ data: item })
  );
  await Promise.all(categoryTasks);
  
  // 批量导入服务
  const serviceTasks = initServices.map(item =>
    db.collection('services').add({ data: item })
  );
  await Promise.all(serviceTasks);
  
  return { code: 0, message: '初始数据导入完成' };
};
```

#### 5.1.3 设置索引

**必须创建的索引：**

| 集合 | 索引字段 | 类型 | 说明 |
|------|----------|------|------|
| `users` | `_openid` | 唯一 | 用户唯一标识 |
| `users` | `role` | 普通 | 按角色查询 |
| `users` | `phone` | 唯一 | 手机号唯一 |
| `workers` | `userId` | 唯一 | 关联用户ID |
| `workers` | `status` | 普通 | 师傅状态筛选 |
| `services` | `categoryId` | 普通 | 按分类查询 |
| `services` | `status` | 普通 | 上下架状态 |
| `orders` | `orderNo` | 唯一 | 订单号唯一 |
| `orders` | `_openid` | 普通 | 用户订单查询 |
| `orders` | `status` | 普通 | 订单状态筛选 |
| `orders` | `workerId` | 普通 | 师傅订单查询 |
| `orders` | `createTime` | 普通 | 按时间排序 |
| `addresses` | `_openid` | 普通 | 用户地址查询 |
| `payments` | `orderId` | 唯一 | 订单支付记录 |
| `payments` | `transactionId` | 唯一 | 微信流水号 |

**创建索引命令（云控制台或 SDK）：**

```javascript
// 在任意云函数中执行
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

// 创建索引示例
await db.collection('users').createIndex({
  name: 'openid_index',
  unique: true,
  keys: { _openid: 1 }
});

await db.collection('orders').createIndex({
  name: 'status_time_index',
  keys: { status: 1, createTime: -1 }
});
```

#### 5.1.4 设置权限

**数据库安全规则：**

```json
// database/permissions.json
{
  "users": {
    "read": "doc._openid == auth.openid || get('database.users').where({_openid: auth.openid}).get()[0].role == 'admin'",
    "write": "doc._openid == auth.openid || get('database.users').where({_openid: auth.openid}).get()[0].role == 'admin'"
  },
  "orders": {
    "read": "doc._openid == auth.openid || doc.workerId == auth.openid || get('database.users').where({_openid: auth.openid}).get()[0].role == 'admin'",
    "write": "doc._openid == auth.openid || get('database.users').where({_openid: auth.openid}).get()[0].role == 'admin'"
  },
  "services": {
    "read": "true",
    "write": "get('database.users').where({_openid: auth.openid}).get()[0].role == 'admin'"
  },
  "addresses": {
    "read": "doc._openid == auth.openid",
    "write": "doc._openid == auth.openid"
  },
  "workers": {
    "read": "true",
    "write": "doc.userId == auth.openid || get('database.users').where({_openid: auth.openid}).get()[0].role == 'admin'"
  }
}
```

**推荐做法**：
- 客户端直接操作数据库的权限尽量收紧
- 大部分业务逻辑通过云函数中转，云函数使用管理员权限操作数据库
- 在控制台 → 数据库 → 权限设置 中配置

### 5.2 云函数部署

#### 5.2.1 单个云函数部署

```bash
# 在微信开发者工具中，右键 cloudfunctions/函数名 → 创建并部署：云端安装依赖

# 或使用命令行工具
cd cloudfunctions/order-create
npm install

# 在微信开发者工具中右键部署
```

#### 5.2.2 批量部署脚本

```bash
#!/bin/bash
# deploy-all.sh - 一键部署所有云函数

CLOUD_DIR="./cloudfunctions"
EXCLUDE_DIRS="common|node_modules"

echo "===== 开始部署云函数 ====="

for dir in "$CLOUD_DIR"/*/; do
  func_name=$(basename "$dir")
  
  # 跳过非云函数目录
  if echo "$func_name" | grep -Eq "$EXCLUDE_DIRS"; then
    echo "跳过: $func_name"
    continue
  fi
  
  echo ""
  echo "----- 部署: $func_name -----"
  
  # 进入目录安装依赖
  cd "$dir"
  
  if [ -f "package.json" ]; then
    npm install --production
  fi
  
  cd - > /dev/null
  
  # 在微信开发者工具中自动部署
  # 注：实际部署需要通过开发者工具 GUI 或 miniprogram-ci
done

echo ""
echo "===== 部署完成 ====="
```

**使用 miniprogram-ci 部署：**

```javascript
// scripts/deploy-functions.js
const ci = require('miniprogram-ci');
const path = require('path');
const fs = require('fs');

const PROJECT_PATH = path.resolve(__dirname, '../');
const PRIVATE_KEY_PATH = path.resolve(__dirname, './private.key');

(async () => {
  const project = new ci.Project({
    appid: 'wx你的appid',
    type: 'miniProgram',
    projectPath: PROJECT_PATH,
    privateKeyPath: PRIVATE_KEY_PATH,
    ignores: ['node_modules/**/*', 'scripts/**/*']
  });

  const cloudDir = path.join(PROJECT_PATH, 'cloudfunctions');
  const functions = fs.readdirSync(cloudDir)
    .filter(f => fs.statSync(path.join(cloudDir, f)).isDirectory())
    .filter(f => f !== 'common');

  for (const func of functions) {
    console.log(`部署云函数: ${func}`);
    await ci.cloud.uploadFunction({
      project,
      env: '你的环境ID',
      name: func,
      path: path.join(cloudDir, func),
      remoteNpmInstall: true
    });
  }

  console.log('所有云函数部署完成');
})();
```

#### 5.2.3 定时触发器配置

```json
// cloudfunctions/schedule-cleanup-expired/config.json
{
  "triggers": [
    {
      "name": "cleanupExpiredOrders",
      "type": "timer",
      "config": "0 2 * * * *"
    }
  ]
}
```

**常用定时规则（Cron 表达式）：**

| 规则 | 含义 |
|------|------|
| `0 0 2 * * * *` | 每天凌晨2点 |
| `0 0 */6 * * * *` | 每6小时执行一次 |
| `0 0 9 * * 1 *` | 每周一早上9点 |
| `0 */30 * * * * *` | 每30分钟执行一次 |

### 5.3 云存储配置

#### 5.3.1 存储桶目录结构

```
cloud://chunhui-xxx.6368-chunhui-xxx-xxx/    # 云存储根目录
├── images/                                    # 图片资源
│   ├── services/                              # 服务封面图
│   ├── banners/                               # 轮播图
│   ├── avatars/                               # 用户头像
│   └── icons/                                 # 图标素材
├── uploads/                                   # 用户上传文件
│   ├── user/                                  # 用户上传
│   └── worker/                                # 师傅资质上传
├── temp/                                      # 临时文件（定期清理）
└── documents/                                 # 文档资料
```

#### 5.3.2 图片上传策略

```javascript
// utils/upload.js

/**
 * 上传图片到云存储
 * @param {string} filePath - 本地临时文件路径
 * @param {string} dir - 目标目录
 * @returns {Promise<string>} 云存储文件ID
 */
function uploadImage(filePath, dir = 'uploads/user') {
  return new Promise((resolve, reject) => {
    // 生成唯一文件名
    const ext = filePath.match(/\.\w+$/)[0] || '.jpg';
    const cloudPath = `${dir}/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: (res) => {
        resolve(res.fileID);
      },
      fail: (err) => {
        reject(new Error('图片上传失败: ' + err.message));
      }
    });
  });
}

/**
 * 批量上传图片
 * @param {string[]} filePaths - 本地临时文件路径数组
 * @param {string} dir - 目标目录
 * @returns {Promise<string[]>}
 */
async function uploadImages(filePaths, dir = 'uploads/user') {
  const tasks = filePaths.map(path => uploadImage(path, dir));
  return Promise.all(tasks);
}

/**
 * 删除云存储文件
 */
function deleteFile(fileID) {
  return wx.cloud.deleteFile({ fileList: [fileID] });
}

module.exports = { uploadImage, uploadImages, deleteFile };
```

**上传安全限制（在云函数中校验）：**

```javascript
// 允许的格式和大小限制
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_COUNT = 9; // 最多9张
```

---

## 6. 微信支付配置

### 6.1 商户号申请与绑定

**申请流程：**

1. 访问 https://pay.weixin.qq.com/ 申请微信支付商户号
2. 准备材料：
   - 营业执照（个体工商户/企业）
   - 法人身份证
   - 对公银行账户
   - 小程序 AppID
3. 提交审核（通常 1-3 个工作日）

**绑定小程序与商户号：**

1. 登录微信支付商户平台 → 产品中心 → AppID 账号管理
2. 点击「关联AppID」
3. 填写小程序 AppID
4. 登录小程序后台 → 微信支付 → 确认绑定

**获取必要参数：**

| 参数 | 获取位置 | 用途 |
|------|----------|------|
| 商户号（mchid） | 商户平台 → 账户中心 → 商户信息 | 支付身份标识 |
| APIv3密钥 | 商户平台 → 账户中心 → API安全 | 签名验证 |
| 商户证书 | 商户平台 → 账户中心 → API安全 → 申请证书 | 双向认证 |
| 证书序列号 | 证书文件内 | 请求头携带 |

**在云函数中配置支付参数：**

```javascript
// cloudfunctions/payment-unified-order/config.js
const PAY_CONFIG = {
  mchid: '你的商户号',
  appid: 'wx小程序appid',
  // APIv3密钥
  apiV3Key: '你的APIv3密钥',
  // 证书路径（上传到云函数目录）
  certPem: './certs/apiclient_cert.pem',
  keyPem: './certs/apiclient_key.pem',
  // 回调地址（云函数不需要，用云调用）
  notifyUrl: ''
};

module.exports = PAY_CONFIG;
```

### 6.2 支付云函数配置

```javascript
// cloudfunctions/payment-unified-order/index.js
const cloud = require('wx-server-sdk');
const { mch } = require('tenpay');  // 使用 tenpay 库

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 初始化 tenpay
const tenpayConfig = {
  appid: 'wx小程序appid',
  mchid: '你的商户号',
  partnerKey: '你的APIv3密钥',
  pfx: Buffer.from(''), // 如需证书
  notify_url: '',
  // 使用云调用不需要服务器地址
};

exports.main = async (event, context) => {
  const { orderId } = event;
  const { OPENID } = cloud.getWXContext();
  
  try {
    // 1. 查询订单
    const orderRes = await db.collection('orders').doc(orderId).get();
    const order = orderRes.data;
    
    if (!order) {
      return { code: 404, message: '订单不存在' };
    }
    if (order._openid !== OPENID) {
      return { code: 403, message: '无权支付此订单' };
    }
    if (order.status !== 0) {
      return { code: 400, message: '订单状态不正确' };
    }
    
    // 2. 调用微信支付统一下单（云调用方式）
    const { result } = await cloud.cloudPay.unifiedOrder({
      body: `春辉服务-${order.serviceName}`,
      outTradeNo: order.orderNo,
      spbillCreateIp: '127.0.0.1',
      subMchId: '子商户号（如使用服务商模式）',
      totalFee: Math.round(order.payAmount * 100), // 转为分
      envId: cloud.DYNAMIC_CURRENT_ENV,
      functionName: 'payment-notify', // 支付回调云函数
      nonceStr: generateNonceStr(),
      tradeType: 'JSAPI',
      openid: OPENID
    });
    
    if (result.returnCode !== 'SUCCESS') {
      return { code: 500, message: '统一下单失败: ' + result.returnMsg };
    }
    
    // 3. 返回前端调起支付所需参数
    return {
      code: 0,
      message: 'ok',
      data: {
        timeStamp: String(Math.floor(Date.now() / 1000)),
        nonceStr: result.nonceStr,
        package: `prepay_id=${result.prepayId}`,
        signType: 'RSA', // APIv3使用RSA签名
        paySign: result.paySign
      }
    };
    
  } catch (err) {
    console.error('统一下单失败:', err);
    return { code: 500, message: '支付请求失败' };
  }
};

function generateNonceStr(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let str = '';
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
}
```

**支付回调云函数：**

```javascript
// cloudfunctions/payment-notify/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { returnCode, outTradeNo, transactionId, totalFee, timeEnd } = event;
  
  if (returnCode !== 'SUCCESS') {
    console.error('支付失败通知:', event);
    return { code: 0 }; // 返回成功避免微信重试
  }
  
  try {
    // 查询订单
    const orderRes = await db.collection('orders')
      .where({ orderNo: outTradeNo })
      .get();
    
    if (orderRes.data.length === 0) {
      return { code: 0 };
    }
    
    const order = orderRes.data[0];
    
    // 使用事务确保数据一致性
    const transaction = await db.startTransaction();
    
    try {
      // 更新订单状态
      await transaction.collection('orders').doc(order._id).update({
        data: {
          status: 1, // 已支付
          statusText: '已支付',
          payTime: db.serverDate(),
          transactionId,
          updateTime: db.serverDate()
        }
      });
      
      // 创建支付记录
      await transaction.collection('payments').add({
        data: {
          orderId: order._id,
          orderNo: outTradeNo,
          transactionId,
          amount: totalFee / 100,
          status: 1, // 成功
          payTime: db.serverDate(),
          createTime: db.serverDate()
        }
      });
      
      // 发送支付成功通知
      await transaction.collection('messages').add({
        data: {
          _openid: order._openid,
          type: 'payment_success',
          title: '支付成功',
          content: `您的订单 ${outTradeNo} 已支付成功，金额 ￥${totalFee / 100}`,
          isRead: false,
          createTime: db.serverDate()
        }
      });
      
      await transaction.commit();
      
      return { code: 0, message: '处理成功' };
      
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
    
  } catch (err) {
    console.error('支付回调处理失败:', err);
    return { code: 0 }; // 返回成功避免微信重试
  }
};
```

**前端调起支付：**

```javascript
// pages/payment/payment.js
const { request } = require('../../utils/request');

Page({
  data: {
    orderId: '',
    isPaying: false
  },

  onLoad(options) {
    this.setData({ orderId: options.orderId });
  },

  async onPayTap() {
    if (this.data.isPaying) return;
    this.setData({ isPaying: true });

    try {
      // 1. 调用云函数获取支付参数
      const res = await request('payment-unified-order', {
        orderId: this.data.orderId
      });

      // 2. 调起微信支付
      const payResult = await this.requestPayment(res.data);
      
      wx.showToast({ title: '支付成功', icon: 'success' });
      
      // 3. 跳转到订单详情
      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/order-detail/order-detail?id=${this.data.orderId}`
        });
      }, 1500);
      
    } catch (err) {
      if (err.errMsg && err.errMsg.includes('cancel')) {
        wx.showToast({ title: '已取消支付', icon: 'none' });
      } else {
        wx.showToast({ title: err.message || '支付失败', icon: 'none' });
      }
    } finally {
      this.setData({ isPaying: false });
    }
  },

  requestPayment(payData) {
    return new Promise((resolve, reject) => {
      wx.requestPayment({
        timeStamp: payData.timeStamp,
        nonceStr: payData.nonceStr,
        package: payData.package,
        signType: payData.signType,
        paySign: payData.paySign,
        success: resolve,
        fail: reject
      });
    });
  }
});
```

### 6.3 测试支付流程

**沙箱测试环境：**

1. 微信支付商户平台 → 开发配置 → 沙箱环境
2. 使用沙箱密钥和沙箱网关进行测试
3. 测试账号：`sandbox_signkey` 接口获取

**测试用例：**

| 场景 | 预期结果 |
|------|----------|
| 正常支付流程 | 下单 → 调起支付 → 输入密码 → 成功回调 → 状态更新 |
| 取消支付 | 下单 → 调起支付 → 取消 → 订单保持待支付状态 |
| 支付超时 | 下单 → 不调起支付 → 15分钟后订单自动关闭 |
| 重复支付 | 已支付订单再次调起 → 返回"订单已支付" |
| 金额异常 | 篡改金额 → 服务端校验失败 → 拒绝 |
| 回调重试 | 模拟回调失败 → 微信自动重试 → 幂等处理 |

---

## 7. 腾讯位置服务配置

### 7.1 Key申请

1. 访问 https://lbs.qq.com/ 注册腾讯位置服务账号
2. 进入「控制台」→ 「应用管理」→ 「创建应用」
3. 填写应用名称：「春辉综合服务部」
4. 添加 Key：
   - Key名称：`chunhui-miniprogram`
   - 启用产品：「微信小程序」
   - 填写小程序 AppID
5. 记录 Key 值（如：`ABCDE-FGHIJ-KLMNO-PQRST-UVWXY`）

### 7.2 在小程序中配置

**配置服务器域名（必须）：**

1. 登录小程序后台 → 开发 → 开发设置 → 服务器域名
2. 在 `request合法域名` 中添加：
   - `https://apis.map.qq.com`
3. 在 `uploadFile合法域名` 中添加（如需上传）：
   - `https://apis.map.qq.com`

**在代码中使用：**

```javascript
// config/api.config.js
const MAP_CONFIG = {
  key: '你的腾讯地图Key',
  // 逆地址解析接口
  geocoderUrl: 'https://apis.map.qq.com/ws/geocoder/v1/'
};

module.exports = { MAP_CONFIG };
```

```javascript
// utils/location.js
const { MAP_CONFIG } = require('../config/api.config');

/**
 * 获取用户当前位置
 * @returns {Promise<{latitude, longitude}>}
 */
function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02', // 国测局坐标系
      altitude: false,
      success: (res) => {
        resolve({
          latitude: res.latitude,
          longitude: res.longitude
        });
      },
      fail: (err) => {
        reject(new Error('获取位置失败: ' + err.errMsg));
      }
    });
  });
}

/**
 * 逆地址解析（坐标 → 地址）
 * @param {number} latitude
 * @param {number} longitude
 */
async function reverseGeocoder(latitude, longitude) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: MAP_CONFIG.geocoderUrl,
      data: {
        location: `${latitude},${longitude}`,
        key: MAP_CONFIG.key,
        get_poi: 0
      },
      success: (res) => {
        if (res.data.status === 0) {
          resolve(res.data.result);
        } else {
          reject(new Error(res.data.message));
        }
      },
      fail: reject
    });
  });
}

/**
 * 关键词搜索地点
 * @param {string} keyword
 * @param {{latitude, longitude}} location
 */
function searchPlace(keyword, location) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://apis.map.qq.com/ws/place/v1/search',
      data: {
        keyword,
        location: location ? `${location.latitude},${location.longitude}` : undefined,
        key: MAP_CONFIG.key,
        page_size: 20
      },
      success: (res) => {
        if (res.data.status === 0) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.message));
        }
      },
      fail: reject
    });
  });
}

module.exports = {
  getCurrentLocation,
  reverseGeocoder,
  searchPlace
};
```

**权限配置（app.json）：**

```json
{
  "permission": {
    "scope.userLocation": {
      "desc": "您的位置信息将用于推荐附近的服务"
    }
  },
  "requiredPrivateInfos": [
    "getLocation",
    "chooseLocation"
  ]
}
```

### 7.3 逆地址解析

```javascript
// pages/address-edit/address-edit.js
const { getCurrentLocation, reverseGeocoder } = require('../../utils/location');

Page({
  data: {
    address: {
      province: '',
      city: '',
      district: '',
      detail: '',
      latitude: null,
      longitude: null
    }
  },

  async onGetLocationTap() {
    try {
      wx.showLoading({ title: '定位中...' });
      
      // 1. 获取坐标
      const { latitude, longitude } = await getCurrentLocation();
      
      // 2. 逆地址解析
      const result = await reverseGeocoder(latitude, longitude);
      
      this.setData({
        'address.province': result.address_component.province,
        'address.city': result.address_component.city,
        'address.district': result.address_component.district,
        'address.detail': result.address_component.street + 
                         result.address_component.street_number,
        'address.latitude': latitude,
        'address.longitude': longitude
      });
      
    } catch (err) {
      wx.showModal({
        title: '定位失败',
        content: err.message || '请检查位置权限设置',
        showCancel: false
      });
    } finally {
      wx.hideLoading();
    }
  },

  onChooseLocationTap() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          'address.detail': res.address + (res.name || ''),
          'address.latitude': res.latitude,
          'address.longitude': res.longitude
        });
        // 可以进一步做逆地址解析获取省市县
      }
    });
  }
});
```

---

## 8. 角色与权限配置

### 8.1 四种角色的初始化

本系统支持四种用户角色，通过 `users` 集合的 `role` 字段区分：

| 角色值 | 角色名 | 说明 |
|--------|--------|------|
| `user` | 普通用户 | 可下单、查看自己的订单、管理地址 |
| `worker` | 服务师傅 | 可接单、查看分配的订单、更新服务状态 |
| `admin` | 管理员 | 可管理订单、用户、服务、查看数据报表 |
| `superadmin` | 超级管理员 | 拥有所有权限，可创建其他管理员 |

**角色权限矩阵：**

| 功能 | 普通用户 | 服务师傅 | 管理员 | 超级管理员 |
|------|----------|----------|--------|------------|
| 浏览服务 | ✅ | ✅ | ✅ | ✅ |
| 下单支付 | ✅ | ✅ | ✅ | ✅ |
| 查看自己的订单 | ✅ | ✅ | ✅ | ✅ |
| 接单/更新服务状态 | ❌ | ✅ | ❌ | ✅ |
| 查看所有订单 | ❌ | ❌ | ✅ | ✅ |
| 分配师傅 | ❌ | ❌ | ✅ | ✅ |
| 管理服务项目 | ❌ | ❌ | ✅ | ✅ |
| 管理用户 | ❌ | ❌ | ❌ | ✅ |
| 创建管理员 | ❌ | ❌ | ❌ | ✅ |
| 查看数据报表 | ❌ | ❌ | ✅ | ✅ |

**用户数据结构：**

```javascript
// users 集合字段定义
{
  _id: '',           // 文档ID
  _openid: '',       // 微信OpenID（唯一）
  
  // 基本信息
  nickName: '',      // 微信昵称
  avatarUrl: '',     // 头像URL
  phone: '',         // 手机号
  
  // 角色与状态
  role: 'user',      // 角色：user/worker/admin/superadmin
  status: 1,         // 状态：0=禁用, 1=正常
  
  // 角色升级申请
  roleApply: {
    targetRole: '',   // 申请的目标角色
    status: 0,        // 0=未申请, 1=审核中, 2=已通过, 3=已拒绝
    applyTime: null,
    reviewTime: null,
    rejectReason: ''
  },
  
  // 时间
  createTime: Date,  // 注册时间
  updateTime: Date   // 更新时间
}
```

### 8.2 管理员账号创建

**方式一：数据库直接创建（首次）**

```javascript
// 在云开发控制台 → 数据库 → users 集合 → 添加记录
{
  "_openid": "你的openid",
  "nickName": "管理员",
  "avatarUrl": "",
  "phone": "13800138000",
  "role": "superadmin",
  "status": 1,
  "roleApply": {
    "targetRole": "",
    "status": 0
  },
  "createTime": {
    "$date": "2024-01-01T00:00:00.000Z"
  },
  "updateTime": {
    "$date": "2024-01-01T00:00:00.000Z"
  }
}
```

**方式二：通过云函数升级**

```javascript
// cloudfunctions/admin-create/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { targetOpenId, role = 'admin' } = event;
  const { OPENID } = cloud.getWXContext();
  
  // 1. 验证调用者身份
  const callerRes = await db.collection('users').where({ _openid: OPENID }).get();
  if (callerRes.data.length === 0 || callerRes.data[0].role !== 'superadmin') {
    return { code: 403, message: '无权操作' };
  }
  
  // 2. 验证目标用户
  const targetRes = await db.collection('users').where({ _openid: targetOpenId }).get();
  if (targetRes.data.length === 0) {
    return { code: 404, message: '目标用户不存在' };
  }
  
  // 3. 更新角色
  await db.collection('users').doc(targetRes.data[0]._id).update({
    data: {
      role,
      updateTime: db.serverDate()
    }
  });
  
  return { code: 0, message: '管理员创建成功' };
};
```

### 8.3 身份切换测试

**前端角色切换页面：**

```javascript
// pages/user-center/user-center.js
Page({
  data: {
    userInfo: null,
    currentRole: 'user',
    canSwitchRoles: []
  },

  onShow() {
    this.loadUserInfo();
  },

  async loadUserInfo() {
    const res = await request('user-get-info');
    this.setData({
      userInfo: res.data,
      currentRole: res.data.role
    });
    
    // 确定可切换的角色列表
    this.setSwitchableRoles(res.data.role);
  },

  setSwitchableRoles(currentRole) {
    const roleMap = {
      user: ['worker'],
      worker: ['user'],
      admin: ['user'],
      superadmin: ['user', 'admin']
    };
    this.setData({
      canSwitchRoles: roleMap[currentRole] || []
    });
  },

  async onSwitchRoleTap(e) {
    const { role } = e.currentTarget.dataset;
    
    const confirmed = await wx.showModal({
      title: '切换身份',
      content: `确定切换到${this.getRoleName(role)}模式吗？`,
      confirmText: '切换'
    });
    
    if (!confirmed.confirm) return;
    
    try {
      wx.showLoading({ title: '切换中...' });
      
      await request('user-role-switch', { targetRole: role });
      
      wx.showToast({ title: '切换成功', icon: 'success' });
      
      // 刷新页面
      this.loadUserInfo();
      
    } catch (err) {
      wx.showToast({ title: err.message, icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  getRoleName(role) {
    const names = {
      user: '普通用户',
      worker: '服务师傅',
      admin: '管理员',
      superadmin: '超级管理员'
    };
    return names[role] || role;
  }
});
```

**根据角色显示不同入口：**

```xml
<!-- pages/user-center/user-center.wxml -->
<view class="role-section">
  <!-- 普通用户功能 -->
  <block wx:if="{{ currentRole === 'user' }}">
    <navigator url="/pages/order-list/order-list">我的订单</navigator>
    <navigator url="/pages/address-list/address-list">地址管理</navigator>
    <navigator url="/pages/coupon/coupon">我的优惠券</navigator>
    <button bindtap="onApplyWorker">申请成为师傅</button>
  </block>
  
  <!-- 师傅功能 -->
  <block wx:if="{{ currentRole === 'worker' }}">
    <navigator url="/pages/worker-center/worker-center">工作台</navigator>
    <navigator url="/pages/worker-orders/worker-orders">我的工单</navigator>
    <button bindtap="onSwitchRoleTap" data-role="user">切换为用户</button>
  </block>
  
  <!-- 管理员功能 -->
  <block wx:if="{{ currentRole === 'admin' || currentRole === 'superadmin' }}">
    <navigator url="/pages/admin-dashboard/admin-dashboard">管理后台</navigator>
    <navigator url="/pages/admin-order-manage/admin-order-manage">订单管理</navigator>
    <navigator url="/pages/admin-user-manage/admin-user-manage">用户管理</navigator>
  </block>
</view>
```

---

## 9. 调试与测试指南

### 9.1 微信开发者工具调试技巧

**控制台调试：**

1. **Console 面板**：查看 `console.log/warn/error` 输出
2. **Network 面板**：监控云函数调用、图片加载、请求耗时
3. **Storage 面板**：查看本地缓存、用户信息
4. **AppData 面板**：实时查看页面 data 变化
5. **Sources 面板**：打断点调试 JS 代码

**实用调试代码：**

```javascript
// utils/debug.js
const DEBUG = true;

/**
 * 调试日志（仅在开发环境输出）
 */
function debugLog(...args) {
  if (DEBUG) {
    console.log(`[DEBUG ${getTimeStamp()}]`, ...args);
  }
}

/**
 * 性能计时
 */
function perfTimer(label) {
  if (!DEBUG) return { end: () => {} };
  
  const start = performance.now();
  return {
    end: () => {
      const duration = (performance.now() - start).toFixed(2);
      console.log(`[PERF] ${label}: ${duration}ms`);
    }
  };
}

/**
 * 数据快照（对比数据变化）
 */
function dataSnapshot(label, data) {
  if (DEBUG) {
    console.log(`[SNAPSHOT ${label}]`, JSON.parse(JSON.stringify(data)));
  }
}

module.exports = { debugLog, perfTimer, dataSnapshot };
```

**云函数本地调试：**

1. 在开发者工具中，右键云函数 → 「开启本地调试」
2. 修改云函数代码后保存，自动热重载
3. 本地调试时可以打印更多日志，上线前删除

```javascript
// 云函数中添加调试日志
exports.main = async (event, context) => {
  console.log('=== 云函数调用开始 ===');
  console.log('Event:', JSON.stringify(event));
  console.log('Context:', JSON.stringify(context));
  console.log('OPENID:', cloud.getWXContext().OPENID);
  
  // ... 业务逻辑
  
  console.log('=== 云函数调用结束 ===');
};
```

### 9.2 真机调试

**步骤：**

1. 微信开发者工具 → 点击「真机调试」→ 选择「扫描二维码」
2. 使用微信扫描弹出的二维码
3. 真机上的操作会同步显示在开发者工具的调试面板中

**真机调试注意事项：**

- 确保手机与电脑在同一 WiFi 下
- 真机上云函数调用走的是真实网络，可以测试实际网络延迟
- 真机上可以测试「获取用户信息」「定位」「扫码」等需要原生能力的 API
- 真机调试时 `console.log` 的输出会同步到开发者工具控制台

**预览模式：**

1. 点击「预览」→ 生成二维码
2. 无需添加体验者权限，任何微信都可以扫码预览
3. 预览模式有 25 分钟的缓存，修改代码后需要重新生成二维码

### 9.3 常见错误排查

**问题1：云函数调用失败**

```
错误信息：Error: errCode: -404011
```
- 原因：云函数不存在或未部署
- 解决：右键云函数 → 创建并部署：云端安装依赖

**问题2：数据库权限不足**

```
错误信息：Error: errCode: -502001 database permission denied
```
- 原因：数据库安全规则限制了当前用户的操作
- 解决：检查集合权限设置，或通过云函数（管理员权限）操作

**问题3：登录失败**

```
错误信息：Error: errCode: -402002 login no permission
```
- 原因：未开启匿名登录或登录方式未配置
- 解决：云开发控制台 → 设置 → 登录授权 → 开启相应登录方式

**问题4：支付调用失败**

```
错误信息：requestPayment:fail reject
```
- 原因：统一下单参数错误、商户号配置问题
- 解决：检查 prepay_id 是否有效、签名是否正确

**问题5：无法获取定位**

```
错误信息：getLocation:fail auth deny
```
- 原因：用户未授权定位权限
- 解决：引导用户开启权限 `wx.openSetting()`

**问题6：云函数超时**

```
错误信息：Error: timeout of 20000ms exceeded
```
- 原因：云函数执行时间超过 20 秒限制
- 解决：优化代码逻辑，大任务拆分为多个小任务

---

## 10. 上线部署流程

### 10.1 代码审核

**提交审核前检查清单：**

- [ ] 所有页面都有内容，无空白页
- [ ] 所有功能都可以正常使用
- [ ] 支付流程完整测试通过
- [ ] 无 `console.log` 调试代码（或已用条件控制）
- [ ] 无测试数据残留
- [ ] 隐私政策页面已配置
- [ ] 用户协议页面已配置
- [ ] 数据收集说明完整（`app.json` 中 `__usePrivacyCheck__`）
- [ ] 图片资源已优化压缩
- [ ] 云函数依赖已正确安装

**代码上传：**

1. 微信开发者工具 → 点击「上传」
2. 填写版本号（如 `1.0.0`）和项目备注
3. 等待上传完成

**提交审核：**

1. 登录小程序后台 → 管理 → 版本管理
2. 在「开发版本」中找到刚上传的版本
3. 点击「提交审核」
4. 填写审核信息：
   - 功能页面（至少填写首页）
   - 审核备注（说明小程序功能和用途）
   - 测试账号（如有登录功能）
5. 勾选「用户隐私保护指引」
6. 提交审核（通常 1-3 个工作日）

### 10.2 版本管理

**版本号规范（语义化版本）：**

```
格式：MAJOR.MINOR.PATCH

MAJOR - 重大更新，不兼容的修改（如 2.0.0）
MINOR - 新增功能，向下兼容（如 1.1.0）
PATCH - 修复问题，向下兼容（如 1.0.1）

示例：
1.0.0 - 首次发布
1.0.1 - 修复登录Bug
1.1.0 - 新增优惠券功能
1.1.1 - 修复支付问题
2.0.0 - 重大改版
```

**版本管理流程：**

```
开发版本 → 体验版本 → 审核版本 → 线上版本
   ↓           ↓           ↓           ↓
开发者工具   体验者扫码    提交审核     全量发布
  调试        测试       等待审核     用户可见
```

**灰度发布：**

1. 审核通过后 → 点击「发布」
2. 选择「灰度发布」
3. 设置灰度比例：5% → 25% → 50% → 100%
4. 每个阶段观察错误率、用户反馈
5. 无问题后逐步全量

### 10.3 发布上线

**发布前最终检查：**

```bash
# 1. 确认云函数全部部署
# 在微信开发者工具中检查所有云函数状态

# 2. 确认数据库索引已创建
# 在云开发控制台 → 数据库 → 索引 中检查

# 3. 确认初始数据已导入
# 检查分类、服务项目、公告等数据

# 4. 确认商户号配置正确
# 检查支付云函数中的商户号、密钥

# 5. 确认腾讯地图Key有效
# 检查逆地址解析是否正常
```

**正式发布步骤：**

1. 小程序后台 → 版本管理 → 审核版本 → 点击「发布」
2. 选择发布方式（全量发布/灰度发布）
3. 确认发布
4. 发布后 5-10 分钟全量生效

**发布后监控：**

- 观察小程序后台的「统计」→「访问分析」
- 观察云开发控制台的「监控」→「云函数」错误率
- 关注用户反馈和投诉
- 准备紧急回滚方案（如有严重Bug）

---

## 11. 运维与监控

### 11.1 云开发控制台监控

**关键监控指标：**

| 指标 | 位置 | 正常范围 | 告警阈值 |
|------|------|----------|----------|
| 云函数调用次数 | 监控 → 云函数 | 视业务而定 | 超过免费额度 |
| 云函数错误率 | 监控 → 云函数 | < 1% | > 5% |
| 云函数平均耗时 | 监控 → 云函数 | < 500ms | > 3000ms |
| 数据库读操作 | 监控 → 数据库 | 视业务而定 | 超过免费额度 |
| 数据库写操作 | 监控 → 数据库 | 视业务而定 | 超过免费额度 |
| 慢查询数量 | 监控 → 数据库 | 0 | > 10/分钟 |
| 存储使用量 | 存储管理 | < 80% | > 90% |

**免费额度参考（按月）：**

| 资源 | 免费额度 |
|------|----------|
| 云函数调用次数 | 500万次 |
| 云函数外网出流量 | 1GB |
| 数据库读操作 | 5万次/天 |
| 数据库写操作 | 5万次/天 |
| 数据库存储 | 2GB |
| 云存储 | 5GB |
| CDN流量 | 5GB |

### 11.2 日志查看

**云函数日志：**

1. 微信开发者工具 → 云开发 → 云函数 → 点击函数名 → 「日志」
2. 可按时间范围、关键词筛选
3. 日志级别：`console.log`（信息）、`console.warn`（警告）、`console.error`（错误）

**前端日志收集：**

```javascript
// utils/logger.js

/**
 * 上报日志到云函数
 */
function reportLog(level, message, extra = {}) {
  const logData = {
    level,
    message,
    page: getCurrentPage(),
    timestamp: new Date().toISOString(),
    systemInfo: wx.getSystemInfoSync(),
    ...extra
  };
  
  // 存入本地（开发阶段）
  if (wx.getAccountInfoSync().miniProgram.envVersion === 'develop') {
    console.log('[LOG]', logData);
    return;
  }
  
  // 生产环境上报
  wx.cloud.callFunction({
    name: 'log-collect',
    data: logData
  }).catch(() => {}); // 静默失败
}

/**
 * 全局错误监听
 */
function setupErrorListener() {
  wx.onError((error) => {
    reportLog('error', 'JS Runtime Error', { error });
  });
  
  wx.onUnhandledRejection((res) => {
    reportLog('error', 'Unhandled Promise Rejection', { 
      reason: res.reason 
    });
  });
}

module.exports = { reportLog, setupErrorListener };
```

**日志收集云函数：**

```javascript
// cloudfunctions/log-collect/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { level, message, page, systemInfo } = event;
  
  await db.collection('logs').add({
    data: {
      level,
      message,
      page,
      systemInfo: {
        model: systemInfo.model,
        system: systemInfo.system,
        version: systemInfo.version,
        SDKVersion: systemInfo.SDKVersion
      },
      createTime: db.serverDate()
    }
  });
  
  return { code: 0 };
};
```

### 11.3 数据库备份

**自动备份策略：**

1. 云开发控制台 → 数据库 → 备份
2. 设置自动备份周期（建议每天）
3. 保留最近 7 天的备份

**手动备份（重要操作前）：**

```javascript
// cloudfunctions/db-backup/index.js（定时触发）
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async () => {
  // 云开发暂不支持直接导出备份文件
  // 可通过以下方式实现数据归档
  
  const db = cloud.database();
  const collections = ['orders', 'users', 'payments'];
  
  for (const coll of collections) {
    // 查询近30天数据
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const res = await db.collection(coll)
      .where({
        createTime: db.command.lt(thirtyDaysAgo)
      })
      .get();
    
    // 写入归档集合（或导出到云存储）
    if (res.data.length > 0) {
      // 批量写入归档表
      const archiveColl = `${coll}_archive`;
      for (const doc of res.data) {
        await db.collection(archiveColl).add({ data: doc });
      }
      console.log(`已归档 ${coll}: ${res.data.length} 条`);
    }
  }
  
  return { code: 0, message: '备份完成' };
};
```

**数据库导出（JSON格式）：**

1. 云开发控制台 → 数据库 → 选择集合 → 「导出」
2. 选择导出格式（JSON/CSV）
3. 导出到本地保存

---

## 12. 常见问题FAQ

### Q1: 小程序包体积超过 2MB 限制怎么办？

**解决方案：**

1. **分包加载**：将非核心页面放入分包
```json
// app.json
{
  "pages": ["pages/index/index"],
  "subPackages": [
    {
      "root": "package-admin",
      "pages": [
        "pages/admin-dashboard/admin-dashboard",
        "pages/admin-order-manage/admin-order-manage"
      ]
    },
    {
      "root": "package-worker",
      "pages": [
        "pages/worker-center/worker-center",
        "pages/worker-orders/worker-orders"
      ]
    }
  ],
  "preloadRule": {
    "pages/user-center/user-center": {
      "network": "all",
      "packages": ["package-admin", "package-worker"]
    }
  }
}
```

2. **图片资源放到云存储**：将所有图片上传到云存储，使用 `cloud://` 路径引用
3. **启用压缩**：开发者工具 → 详情 → 本地设置 → 勾选「上传代码时自动压缩」
4. **删除无用代码**：定期检查未使用的页面、组件、工具函数

### Q2: 云函数调用报 "Function not found" 错误？

**排查步骤：**

1. 确认云函数目录名和 `package.json` 中的 `name` 一致
2. 确认云函数已部署到云端（右键 → 创建并部署）
3. 确认 `project.config.json` 中 `cloudfunctionRoot` 配置正确
4. 如果修改了云函数代码，需要重新部署
5. 检查云函数 `index.js` 中是否正确 `exports.main`

### Q3: 用户登录状态如何保持？

**解决方案：**

```javascript
// utils/auth.js
const TOKEN_KEY = 'chunhui_token';
const USER_INFO_KEY = 'chunhui_user_info';

/**
 * 检查登录状态
 */
async function checkLoginStatus() {
  try {
    const res = await wx.cloud.callFunction({ name: 'user-get-info' });
    if (res.result.code === 0) {
      wx.setStorageSync(USER_INFO_KEY, res.result.data);
      return { isLogin: true, userInfo: res.result.data };
    }
    return { isLogin: false };
  } catch (err) {
    return { isLogin: false };
  }
}

/**
 * 全局登录检查（在app.js中使用）
 */
function setupLoginCheck() {
  // 每次启动时检查
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  
  // 需要登录的页面列表
  const authPages = [
    'pages/order-list/order-list',
    'pages/user-center/user-center',
    'pages/booking/booking'
  ];
  
  if (authPages.includes(currentPage?.route)) {
    checkLoginStatus().then(({ isLogin }) => {
      if (!isLogin) {
        wx.redirectTo({ url: '/pages/login/login' });
      }
    });
  }
}
```

### Q4: 数据库并发写入导致数据不一致？

**解决方案：使用事务**

```javascript
// cloudfunctions/order-cancel/index.js
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event) => {
  const { orderId } = event;
  
  const transaction = await db.startTransaction();
  
  try {
    // 1. 读取订单（加锁）
    const orderRes = await transaction.collection('orders').doc(orderId).get();
    const order = orderRes.data;
    
    // 2. 校验状态
    if (order.status !== 0) {
      await transaction.rollback();
      return { code: 400, message: '订单状态不允许取消' };
    }
    
    // 3. 更新订单状态
    await transaction.collection('orders').doc(orderId).update({
      data: {
        status: 5,
        statusText: '已取消',
        cancelTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    });
    
    // 4. 恢复优惠券
    if (order.couponId) {
      await transaction.collection('user_coupons')
        .where({ couponId: order.couponId, _openid: order._openid })
        .update({
          data: { status: 0 } // 未使用
        });
    }
    
    await transaction.commit();
    return { code: 0, message: '取消成功' };
    
  } catch (err) {
    await transaction.rollback();
    return { code: 500, message: '取消失败' };
  }
};
```

### Q5: 如何防止按钮重复点击？

```javascript
Page({
  data: {
    isSubmitting: false
  },

  async onSubmitTap() {
    // 防止重复点击
    if (this.data.isSubmitting) {
      wx.showToast({ title: '请勿重复提交', icon: 'none' });
      return;
    }
    
    this.setData({ isSubmitting: true });
    wx.showLoading({ title: '提交中...' });
    
    try {
      // 业务逻辑...
      await this.handleSubmit();
      wx.showToast({ title: '提交成功', icon: 'success' });
    } catch (err) {
      wx.showToast({ title: err.message, icon: 'none' });
    } finally {
      wx.hideLoading();
      this.setData({ isSubmitting: false });
    }
  }
});
```

### Q6: 如何实现下拉刷新和上拉加载更多？

```javascript
// pages/order-list/order-list.js
Page({
  data: {
    list: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    isLoading: false
  },

  // 下拉刷新
  async onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true });
    await this.loadData(true);
    wx.stopPullDownRefresh();
  },

  // 上拉加载
  onReachBottom() {
    if (!this.data.hasMore || this.data.isLoading) return;
    this.loadData(false);
  },

  async loadData(isRefresh) {
    this.setData({ isLoading: true });
    
    try {
      const res = await request('order-list', {
        page: this.data.page,
        pageSize: this.data.pageSize
      });
      
      this.setData({
        list: isRefresh ? res.list : [...this.data.list, ...res.list],
        page: this.data.page + 1,
        hasMore: res.list.length === this.data.pageSize,
        isLoading: false
      });
    } catch (err) {
      this.setData({ isLoading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  }
});
```

```json
// order-list.json
{
  "enablePullDownRefresh": true,
  "backgroundTextStyle": "dark"
}
```

### Q7: 云函数中如何使用第三方npm包？

```bash
# 1. 进入云函数目录
cd cloudfunctions/payment-unified-order

# 2. 初始化 npm（如没有 package.json）
npm init -y

# 3. 安装依赖包
npm install tenpay --production

# 4. 确保 package.json 中有依赖声明
cat package.json
```

```json
{
  "name": "payment-unified-order",
  "version": "1.0.0",
  "description": "微信支付统一下单",
  "main": "index.js",
  "dependencies": {
    "tenpay": "^2.2.0"
  }
}
```

部署时选择「云端安装依赖」会自动安装 `package.json` 中的包。

### Q8: 如何在开发环境和生产环境切换？

```javascript
// config/env.js
const envVersion = __wxConfig.envVersion;

const config = {
  develop: {
    envId: 'chunhui-dev-xxx',
    debug: true
  },
  trial: {
    envId: 'chunhui-test-xxx',
    debug: false
  },
  release: {
    envId: 'chunhui-prod-xxx',
    debug: false
  }
};

module.exports = config[envVersion] || config.develop;
```

- `develop`：开发工具 / 预览模式
- `trial`：体验版
- `release`：正式版

### Q9: 用户隐私保护如何配置？

1. 小程序后台 → 设置 → 基本设置 → 用户隐私保护指引
2. 填写收集的用户信息类型（位置信息、手机号、头像昵称等）
3. 填写信息用途说明
4. 在 `app.json` 中添加：

```json
{
  "__usePrivacyCheck__": true
}
```

5. 涉及隐私的 API 调用前需要引导用户同意：

```javascript
wx.requirePrivacyAuthorize({
  success: () => {
    // 用户同意，可以继续调用隐私接口
    wx.getLocation({...});
  },
  fail: () => {
    // 用户拒绝
    wx.showToast({ title: '需要授权才能使用此功能', icon: 'none' });
  }
});
```

### Q10: 图片上传后如何获取永久链接？

```javascript
// 上传到云存储后返回的 fileID 就是永久链接
const uploadRes = await wx.cloud.uploadFile({
  cloudPath: `images/${Date.now()}.jpg`,
  filePath: tempFilePath // 本地临时文件路径
});

// uploadRes.fileID 格式：cloud://bucket.envid.xxx/path
// 可以直接在 image 标签中使用
this.setData({
  imageUrl: uploadRes.fileID
});

// WXML 中
// <image src="{{imageUrl}}" mode="aspectFill" />
```

### Q11: 如何优化小程序启动速度？

1. **减少首包体积**：首页必需资源放主包，其余分包
2. **预加载分包**：`preloadRule` 配置用户可能进入的分包
3. **图片懒加载**：非首屏图片加 `lazy-load`
4. **减少 setData**：合并多次数据更新，减少通信次数
5. **使用本地缓存**：不常变的数据存 `wx.getStorageSync`
6. **云函数优化**：减少冷启动，使用云调用
7. **骨架屏**：首页加载时显示骨架屏，提升感知速度

### Q12: 如何实现全局状态管理？

```javascript
// store/index.js
class Store {
  constructor() {
    this.state = {};
    this.listeners = {};
  }
  
  set(key, value) {
    this.state[key] = value;
    if (this.listeners[key]) {
      this.listeners[key].forEach(cb => cb(value));
    }
  }
  
  get(key) {
    return this.state[key];
  }
  
  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);
  }
}

const store = new Store();

// app.js
App({
  store,
  onLaunch() {
    // 初始化云开发
    wx.cloud.init({ env: 'xxx' });
    
    // 全局状态示例
    store.set('systemInfo', wx.getSystemInfoSync());
    store.set('isLogin', false);
  }
});

// 页面中使用
const app = getApp();
Page({
  onLoad() {
    // 读取全局状态
    const systemInfo = app.store.get('systemInfo');
    
    // 监听状态变化
    app.store.subscribe('isLogin', (isLogin) => {
      this.setData({ isLogin });
    });
  }
});
```

### Q13: 订阅消息如何配置和使用？

1. 小程序后台 → 功能 → 订阅消息 → 选用模板
2. 搜索合适的模板（如：服务完成通知、订单状态变更通知）
3. 记录模板 ID

```javascript
// 请求订阅授权
const requestSubscribeMessage = async () => {
  try {
    const res = await wx.requestSubscribeMessage({
      tmplIds: [
        '模板ID_1', // 服务完成通知
        '模板ID_2'  // 订单状态变更
      ]
    });
    
    // 用户同意则记录到数据库
    if (res['模板ID_1'] === 'accept') {
      await wx.cloud.callFunction({
        name: 'message-subscribe',
        data: { templateId: '模板ID_1' }
      });
    }
  } catch (err) {
    console.error('订阅失败:', err);
  }
};

// 服务端发送订阅消息（云函数）
const cloud = require('wx-server-sdk');
cloud.init();

exports.main = async (event) => {
  const { openid, templateId, page, data } = event;
  
  try {
    await cloud.openapi.subscribeMessage.send({
      touser: openid,
      templateId,
      page,
      data: {
        thing1: { value: '水管维修服务' },
        phrase2: { value: '已完成' },
        time3: { value: '2024-01-15 14:30' }
      },
      miniprogramState: 'formal'
    });
    return { code: 0 };
  } catch (err) {
    return { code: 500, error: err.message };
  }
};
```

### Q14: 数据库查询性能优化建议？

1. **合理创建索引**：对频繁查询的字段创建索引
2. **限制返回数量**：`limit()` 避免大量数据返回
3. **分页查询**：使用 `skip()` + `limit()` 或基于游标分页
4. **只返回需要字段**：`field()` 投影减少数据传输
5. **复合查询利用索引**：确保查询条件匹配索引前缀
6. **避免正则匹配**：`db.RegExp` 无法使用索引，尽量用精确匹配
7. **数据归档**：历史数据迁移到归档集合，减少活跃数据量

```javascript
// 优化前：全表扫描
const res = await db.collection('orders').where({ status: 1 }).get();

// 优化后：使用索引 + 分页 + 字段投影
const res = await db.collection('orders')
  .where({ status: 1 })
  .orderBy('createTime', 'desc')
  .skip((page - 1) * pageSize)
  .limit(pageSize)
  .field({
    orderNo: true,
    serviceName: true,
    status: true,
    payAmount: true,
    createTime: true
  })
  .get();
```

### Q15: 小程序审核被拒绝的常见原因？

| 拒绝原因 | 解决方案 |
|----------|----------|
| 服务类目与内容不符 | 检查小程序类目设置，确保与实际功能匹配 |
| 涉及未开放类目 | 如包含电商需要选择「商家自营」类目并上传资质 |
| 缺少用户协议和隐私政策 | 添加相关页面并在显著位置提供入口 |
| 测试账号不可用 | 提供可用的测试账号和密码 |
| 功能不完整 | 确保所有声明的功能都可用，无空白页 |
| UGC内容无审核机制 | 添加内容审核功能或举报机制 |
| 涉及支付无资质 | 提供有效的商户号和支付资质 |
| 采集用户位置无说明 | 在隐私政策中说明位置信息采集用途 |
| 页面加载过慢/白屏 | 优化代码，添加骨架屏 |
| 诱导分享 | 去除强制分享、分享后才能使用等功能 |

**审核建议：**

- 首次提交选择「工具」或「生活服务」类目较容易通过
- 在「审核备注」中详细说明小程序功能
- 如涉及支付，确保测试账号有余额可以完成完整流程
- 不要包含测试数据或占位符内容

### Q16: 如何实现实时数据推送？

```javascript
// 使用云开发实时数据推送（watch）
const db = wx.cloud.database();

Page({
  watcher: null,

  onLoad() {
    this.startWatching();
  },

  onUnload() {
    // 页面卸载时关闭监听，避免内存泄漏
    if (this.watcher) {
      this.watcher.close();
    }
  },

  startWatching() {
    this.watcher = db.collection('orders')
      .where({
        _openid: '{openid}'
      })
      .watch({
        onChange: (snapshot) => {
          // snapshot.docChanges 包含变更的文档
          snapshot.docChanges.forEach(change => {
            if (change.dataType === 'update') {
              // 处理更新
              this.handleOrderUpdate(change.doc);
            } else if (change.dataType === 'add') {
              // 处理新增
              this.handleOrderAdd(change.doc);
            }
          });
        },
        onError: (err) => {
          console.error('实时监听失败:', err);
          // 自动重连
          setTimeout(() => this.startWatching(), 5000);
        }
      });
  },

  handleOrderUpdate(order) {
    // 更新页面数据
    const list = this.data.orderList.map(item => 
      item._id === order._id ? order : item
    );
    this.setData({ orderList: list });
    
    // 状态变更提示
    wx.showToast({
      title: `订单状态更新为${order.statusText}`,
      icon: 'none'
    });
  }
});
```

### Q17: 云函数本地调试与线上行为不一致？

**常见差异：**

1. **环境变量**：本地调试使用 `cloud.DYNAMIC_CURRENT_ENV`，确保与线上环境一致
2. **npm包版本**：本地 `node_modules` 可能与云端安装的版本不同
3. **文件系统**：云端的 `/tmp` 目录可写，其他目录只读
4. **网络请求**：云端有外网访问限制，需确认域名白名单
5. **内存限制**：云端 256MB，本地无此限制
6. **超时限制**：云端 20 秒，本地无此限制

**建议：**

- 尽量使用「云端测试」验证云函数行为
- 在代码中添加充分的日志记录
- 关键逻辑上线前先在测试环境验证

### Q18: 如何处理小程序版本更新？

```javascript
// app.js
App({
  onLaunch() {
    this.checkUpdate();
  },

  checkUpdate() {
    if (!wx.canIUse('getUpdateManager')) return;
    
    const updateManager = wx.getUpdateManager();
    
    // 检查更新
    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        console.log('发现新版本');
      }
    });
    
    // 更新就绪
    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已准备好，是否重启应用？',
        success: (res) => {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        }
      });
    });
    
    // 更新失败
    updateManager.onUpdateFailed(() => {
      wx.showModal({
        title: '更新失败',
        content: '新版本下载失败，请检查网络后重试',
        showCancel: false
      });
    });
  }
});
```

### Q19: 数据库中的日期字段如何正确处理？

```javascript
// 写入当前时间（服务端时间）
await db.collection('orders').add({
  data: {
    createTime: db.serverDate(),  // 使用服务端时间
    updateTime: db.serverDate()
  }
});

// 查询某日期范围
const startDate = new Date('2024-01-01');
const endDate = new Date('2024-01-31');

await db.collection('orders')
  .where({
    createTime: db.command.and([
      db.command.gte(startDate),
      db.command.lte(endDate)
    ])
  })
  .get();

// 前端格式化显示
function formatDate(dbDate) {
  // dbDate 可能是 Date 对象或 ISO 字符串
  const date = new Date(dbDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
}
```

### Q20: 如何进行数据迁移和结构变更？

```javascript
// cloudfunctions/db-migrate/index.js
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();
const _ = db.command;
const BATCH_SIZE = 100;

/**
 * 示例：给 users 集合新增字段，并为已有数据设置默认值
 */
async function migrateV1_1_0() {
  const collection = db.collection('users');
  let offset = 0;
  let hasMore = true;
  
  while (hasMore) {
    const res = await collection
      .limit(BATCH_SIZE)
      .skip(offset)
      .get();
    
    if (res.data.length === 0) {
      hasMore = false;
      break;
    }
    
    // 批量更新
    const updateTasks = res.data.map(doc => {
      return collection.doc(doc._id).update({
        data: {
          version: _.set(1),          // 新增 version 字段
          status: _.set(doc.status || 1),  // 设置默认值
          updateTime: db.serverDate()
        }
      });
    });
    
    await Promise.all(updateTasks);
    console.log(`已处理 ${offset + res.data.length} 条`);
    
    offset += BATCH_SIZE;
  }
  
  console.log('迁移完成');
}

/**
 * 示例：重命名字段
 */
async function renameField() {
  const res = await db.collection('orders').limit(100).get();
  
  const tasks = res.data.map(doc => {
    return db.collection('orders').doc(doc._id).update({
      data: {
        newFieldName: _.set(doc.oldFieldName),  // 复制到新字段
        oldFieldName: _.remove()                // 删除旧字段
      }
    });
  });
  
  await Promise.all(tasks);
}

exports.main = async (event) => {
  const { version } = event;
  
  switch (version) {
    case '1.1.0':
      await migrateV1_1_0();
      break;
    default:
      return { code: 400, message: '未知迁移版本' };
  }
  
  return { code: 0, message: '迁移完成' };
};
```

**迁移注意事项：**

1. 大集合分批处理，每批不超过 100 条
2. 先在测试环境验证迁移脚本
3. 迁移前备份数据
4. 添加版本号标记，避免重复执行
5. 复杂迁移考虑停机维护窗口

---

> **文档维护说明**：本文档随项目迭代持续更新。如有疑问或建议，请联系技术负责人。
