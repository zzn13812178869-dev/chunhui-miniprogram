# 春辉综合服务部 — 数据库Schema设计

> **项目信息**
> - 项目：春辉综合服务部（微信小程序）
> - 技术栈：微信小程序原生框架 + 微信云开发(CloudBase) + 云数据库(MongoDB)
> - 版本：v1.0
> - 设计日期：2024年

---

## 集合总览

| 序号 | 集合名称 | 用途 | 核心数据量预估 |
|------|---------|------|--------------|
| 1 | users | 用户信息（普通用户/工人/合作商/管理员） | 万级 |
| 2 | workers | 工人/师傅详细职业资料 | 千级 |
| 3 | categories | 服务分类（保洁、维修、养老等） | 十级（固定） |
| 4 | orders | 服务订单 | 万级 |
| 5 | messages | 聊天消息 + 系统消息 | 十万级 |
| 6 | posts | 招聘求职 + 婚恋介绍内容 | 千级 |
| 7 | banners | 首页轮播图 | 十级 |
| 8 | withdrawals | 提现申请记录 | 千级 |
| 9 | roleAccounts | 角色切换账号密码 | 百级 |
| 10 | reviews | 用户评价 | 万级 |

---

## 1. users（用户集合）

存储所有注册用户的基础信息，支持四种角色：普通用户(user)、工人(worker)、合作商(partner)、管理员(admin)。

```json
{
  "_id": "string (24位ObjectId, 系统自动生成)",
  "_openid": "string (微信openid, 云开发自动注入, 不可手动写入)",
  "unionId": "string (微信unionid, 多应用互通时使用)",
  
  "role": "string (用户主角色: user|worker|partner|admin, 默认user)",
  "roles": ["string[] (用户拥有的所有角色数组, 如 ['user','worker'])"],
  "roleSwitchCode": "string (角色切换验证码, 6位数字, 用于快捷切换)",
  
  "avatarUrl": "string (微信头像URL)",
  "nickName": "string (微信昵称)",
  "realName": "string (真实姓名, 认证后填写)",
  "gender": "number (性别: 0-未知, 1-男, 2-女, 默认0)",
  "phone": "string (手机号, 微信授权或手动绑定)",
  "phoneVerified": "boolean (手机号是否已验证, 默认false)",
  
  "idCardNo": "string (身份证号, 实名认证用)",
  "idCardFront": "string (身份证正面照片URL)",
  "idCardBack": "string (身份证反面照片URL)",
  "realNameVerified": "boolean (是否已通过实名认证, 默认false)",
  
  "province": "string (所在省份)",
  "city": "string (所在城市)",
  "district": "string (所在区县)",
  "town": "string (所在乡镇/街道)",
  "address": "string (详细地址)",
  "location": {
    "type": "Point (GeoJSON点坐标)",
    "coordinates": ["number[2] (经度, 纬度)"]
  },
  
  "balance": "number (账户余额, 单位分, 默认0)",
  "totalIncome": "number (累计收入, 单位分, 默认0)",
  "totalSpend": "number (累计消费, 单位分, 默认0)",
  
  "workerId": "string (关联的工人信息ID, workers._id)",
  "partnerId": "string (关联的合作商信息ID, partners._id)",
  
  "status": "number (账号状态: 0-正常, 1-禁用, 2-注销, 默认0)",
  "isDeleted": "boolean (软删除标记, 默认false)",
  
  "registerSource": "string (注册来源: wechat_miniapp|invite_code|qrcode, 默认wechat_miniapp)",
  "inviterId": "string (邀请人userId)",
  
  "lastLoginTime": "Date (最后登录时间)",
  "lastLoginIp": "string (最后登录IP)",
  
  "createTime": "Date (注册时间, 默认当前时间)",
  "updateTime": "Date (更新时间, 默认当前时间)"
}
```

### 字段说明

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| _id | ObjectId | 是 | 自动生成 | 主键 |
| _openid | string | 是 | 自动注入 | 微信openid，云开发自动注入 |
| unionId | string | 否 | - | 微信unionid |
| role | string | 是 | "user" | 当前激活角色：user/worker/partner/admin |
| roles | string[] | 是 | ["user"] | 拥有的所有角色数组 |
| roleSwitchCode | string | 否 | - | 6位数字角色切换验证码 |
| avatarUrl | string | 否 | - | 微信头像 |
| nickName | string | 否 | "微信用户" | 微信昵称 |
| realName | string | 否 | - | 真实姓名 |
| gender | number | 否 | 0 | 0未知 1男 2女 |
| phone | string | 否 | - | 手机号 |
| phoneVerified | boolean | 否 | false | 手机号是否已验证 |
| idCardNo | string | 否 | - | 身份证号（AES加密存储） |
| idCardFront | string | 否 | - | 身份证正面照片 |
| idCardBack | string | 否 | - | 身份证反面照片 |
| realNameVerified | boolean | 否 | false | 实名认证状态 |
| province | string | 否 | - | 省份 |
| city | string | 否 | - | 城市 |
| district | string | 否 | - | 区县 |
| town | string | 否 | - | 乡镇/街道 |
| address | string | 否 | - | 详细地址 |
| location | Point | 否 | - | GeoJSON坐标 [lng, lat] |
| balance | number | 是 | 0 | 账户余额（单位：分） |
| totalIncome | number | 是 | 0 | 累计收入（单位：分） |
| totalSpend | number | 是 | 0 | 累计支出（单位：分） |
| workerId | string | 否 | - | 关联workers._id |
| partnerId | string | 否 | - | 关联partners._id |
| status | number | 是 | 0 | 0正常 1禁用 2注销 |
| isDeleted | boolean | 是 | false | 软删除标记 |
| registerSource | string | 是 | "wechat_miniapp" | 注册来源 |
| inviterId | string | 否 | - | 邀请人ID |
| lastLoginTime | Date | 否 | - | 最后登录时间 |
| lastLoginIp | string | 否 | - | 最后登录IP |
| createTime | Date | 是 | 当前时间 | 注册时间 |
| updateTime | Date | 是 | 当前时间 | 更新时间 |

### 索引设计

```javascript
// 1. openid唯一索引 — 用于微信登录查询
db.users.createIndex({ "_openid": 1 }, { unique: true })

// 2. 手机号索引 — 用于手机号登录/查找
db.users.createIndex({ "phone": 1 }, { sparse: true, unique: true })

// 3. 角色索引 — 按角色筛选用户
db.users.createIndex({ "role": 1, "status": 1 })

// 4. 工人关联索引 — 通过workerId查找用户
db.users.createIndex({ "workerId": 1 }, { sparse: true })

// 5. 地理空间索引 — 附近的人查询
db.users.createIndex({ "location": "2dsphere" })

// 6. 创建时间索引 — 按注册时间排序
db.users.createIndex({ "createTime": -1 })

// 7. 多角色查询索引
db.users.createIndex({ "roles": 1 })
```

### 权限规则

```javascript
{
  "read": "doc._openid == auth.openid || doc.role == 'worker' || doc.role == 'partner'", 
  "write": "doc._openid == auth.openid"
}
```
- **read**: 用户可读自己的文档；工人和合作商可读（用于业务展示）
- **write**: 仅文档所有者（本人）可写

---

## 2. workers（工人信息集合）

存储工人/师傅的详细职业资料，与users集合通过workerId关联。

```json
{
  "_id": "string (24位ObjectId)",
  "userId": "string (关联users._id)",
  "_openid": "string (微信openid)",
  
  "realName": "string (真实姓名)",
  "phone": "string (联系电话)",
  "avatarUrl": "string (头像URL)",
  "gender": "number (0-未知, 1-男, 2-女)",
  "age": "number (年龄)",
  
  "workYears": "number (从业年限)",
  "education": "string (学历)",
  "selfIntro": "string (个人简介/服务宣言)",
  "workPhotos": ["string[] (工作照URL数组, 最多9张)"],
  
  "serviceCategories": ["string[] (服务分类ID数组, categories._id)"],
  "serviceSkills": ["string[] (具体技能标签数组, 如 ['空调清洗', '水管维修'])"],
  
  "serviceAreas": [{
    "province": "string (省)",
    "city": "string (市)",
    "district": "string (区县)",
    "town": "string (乡镇)"
  }],
  "serviceAreaDesc": "string (服务区域文字描述)",
  
  "chargeType": "string (收费方式: fixed-按次, hourly-按小时, daily-按天, negotiable-面议)",
  "chargeMin": "number (最低收费, 单位分)",
  "chargeMax": "number (最高收费, 单位分)",
  "chargeUnit": "string (收费单位: 次/小时/天)",
  "priceDesc": "string (收费标准说明文字)",
  
  "idCardNo": "string (身份证号)",
  "idCardFront": "string (身份证正面)",
  "idCardBack": "string (身份证反面)",
  "healthCert": "string (健康证照片URL)",
  "qualificationCerts": ["string[] (资格证书照片URL数组)"],
  
  "workStatus": "number (工作状态: 0-休息中, 1-可接单, 2-忙碌中, 3-已下线, 默认1)",
  
  "verifyStatus": "number (认证状态: 0-未提交, 1-审核中, 2-已通过, 3-已拒绝, 默认0)",
  "verifyRemark": "string (审核备注/拒绝原因)",
  "verifyTime": "Date (审核通过时间)",
  "verifiedBy": "string (审核人adminId)",
  
  "rating": "number (综合评分, 1-5, 默认5.0)",
  "totalOrders": "number (累计接单数, 默认0)",
  "completedOrders": "number (已完成订单数, 默认0)",
  "totalIncome": "number (累计收入, 单位分, 默认0)",
  
  "isRecommended": "boolean (是否推荐到首页, 默认false)",
  "recommendOrder": "number (首页推荐排序, 默认0)",
  
  "status": "number (账号状态: 0-正常, 1-禁用, 默认0)",
  "isDeleted": "boolean (软删除, 默认false)",
  
  "createTime": "Date (创建时间)",
  "updateTime": "Date (更新时间)"
}
```

### 字段说明

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| _id | ObjectId | 是 | 自动生成 | 主键 |
| userId | string | 是 | - | 关联users._id |
| _openid | string | 是 | - | 微信openid |
| realName | string | 是 | - | 真实姓名 |
| phone | string | 是 | - | 联系电话 |
| avatarUrl | string | 否 | - | 头像 |
| gender | number | 否 | 0 | 性别 |
| age | number | 否 | - | 年龄 |
| workYears | number | 否 | 0 | 从业年限 |
| education | string | 否 | - | 学历 |
| selfIntro | string | 否 | - | 个人简介（最多500字） |
| workPhotos | string[] | 否 | [] | 工作照数组（最多9张） |
| serviceCategories | string[] | 是 | [] | 服务分类ID数组 |
| serviceSkills | string[] | 否 | [] | 技能标签数组 |
| serviceAreas | object[] | 否 | [] | 服务区域数组（省市区镇） |
| serviceAreaDesc | string | 否 | - | 服务区域描述 |
| chargeType | string | 否 | "negotiable" | 收费方式 |
| chargeMin | number | 否 | 0 | 最低收费（分） |
| chargeMax | number | 否 | 0 | 最高收费（分） |
| chargeUnit | string | 否 | - | 收费单位 |
| priceDesc | string | 否 | - | 收费说明 |
| idCardNo | string | 否 | - | 身份证号 |
| idCardFront | string | 否 | - | 身份证正面 |
| idCardBack | string | 否 | - | 身份证反面 |
| healthCert | string | 否 | - | 健康证 |
| qualificationCerts | string[] | 否 | [] | 资格证书 |
| workStatus | number | 是 | 1 | 工作状态 |
| verifyStatus | number | 是 | 0 | 认证状态 |
| verifyRemark | string | 否 | - | 审核备注 |
| verifyTime | Date | 否 | - | 审核通过时间 |
| verifiedBy | string | 否 | - | 审核人ID |
| rating | number | 是 | 5.0 | 综合评分1-5 |
| totalOrders | number | 是 | 0 | 累计接单数 |
| completedOrders | number | 是 | 0 | 已完成订单数 |
| totalIncome | number | 是 | 0 | 累计收入（分） |
| isRecommended | boolean | 否 | false | 是否首页推荐 |
| recommendOrder | number | 否 | 0 | 推荐排序权重 |
| status | number | 是 | 0 | 0正常 1禁用 |
| isDeleted | boolean | 是 | false | 软删除 |
| createTime | Date | 是 | 当前时间 | 创建时间 |
| updateTime | Date | 是 | 当前时间 | 更新时间 |

### 索引设计

```javascript
// 1. userId唯一索引 — 一个用户对应一个工人资料
db.workers.createIndex({ "userId": 1 }, { unique: true })

// 2. openid索引 — 微信登录查询
db.workers.createIndex({ "_openid": 1 })

// 3. 服务分类索引 — 按分类找工人
db.workers.createIndex({ "serviceCategories": 1 })

// 4. 工作状态+认证状态 — 可接单工人查询
db.workers.createIndex({ "workStatus": 1, "verifyStatus": 1 })

// 5. 评分排序索引 — 优质工人推荐
db.workers.createIndex({ "rating": -1, "completedOrders": -1 })

// 6. 推荐索引 — 首页推荐查询
db.workers.createIndex({ "isRecommended": 1, "recommendOrder": -1 })

// 7. 审核状态索引 — 后台审核列表
db.workers.createIndex({ "verifyStatus": 1, "createTime": -1 })

// 8. 创建时间索引
db.workers.createIndex({ "createTime": -1 })
```

### 权限规则

```javascript
{
  "read": "doc._openid == auth.openid || doc.verifyStatus == 2",
  "write": "doc._openid == auth.openid || doc.verifyStatus != 2"
}
```
- **read**: 本人可读；已通过认证的工人资料对所有用户可读
- **write**: 本人可编辑；未通过审核时允许修改重新提交

---

## 3. categories（服务分类集合）

存储平台的服务分类，树形结构支持二级分类。

```json
{
  "_id": "string (24位ObjectId)",
  "name": "string (分类名称)",
  "icon": "string (分类图标URL)",
  "iconColor": "string (图标颜色, 如 '#FF6B6B')",
  "description": "string (分类描述)",
  
  "parentId": "string (父分类ID, 顶级为null)",
  "level": "number (层级: 1-一级, 2-二级)",
  "sortOrder": "number (排序权重, 越小越靠前, 默认0)",
  
  "isHot": "boolean (是否热门分类, 默认false)",
  "hotOrder": "number (热门排序, 默认0)",
  
  "needCert": "boolean (是否需要资质认证, 默认false)",
  "status": "number (状态: 0-正常, 1-禁用, 默认0)",
  
  "createTime": "Date (创建时间)",
  "updateTime": "Date (更新时间)"
}
```

### 字段说明

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| _id | ObjectId | 是 | 自动生成 | 主键 |
| name | string | 是 | - | 分类名称 |
| icon | string | 否 | - | 分类图标 |
| iconColor | string | 否 | "#666666" | 图标颜色 |
| description | string | 否 | - | 分类描述 |
| parentId | string | 否 | null | 父分类ID |
| level | number | 是 | 1 | 层级深度 |
| sortOrder | number | 是 | 0 | 排序权重 |
| isHot | boolean | 否 | false | 是否热门 |
| hotOrder | number | 否 | 0 | 热门排序 |
| needCert | boolean | 否 | false | 是否需要资质 |
| status | number | 是 | 0 | 0正常 1禁用 |
| createTime | Date | 是 | 当前时间 | 创建时间 |
| updateTime | Date | 是 | 当前时间 | 更新时间 |

### 索引设计

```javascript
// 1. 父分类索引 — 查询子分类
db.categories.createIndex({ "parentId": 1, "sortOrder": 1 })

// 2. 层级索引
db.categories.createIndex({ "level": 1, "sortOrder": 1 })

// 3. 热门索引
db.categories.createIndex({ "isHot": 1, "hotOrder": 1 })
```

### 初始数据

```javascript
// 一级分类（6大主分类）
db.categories.insertMany([
  {
    "_id": ObjectId("65a1b2c3d4e5f6a7b8c9d0e1"),
    "name": "保洁清洗",
    "icon": "cloud://cleaning.png",
    "iconColor": "#4CAF50",
    "description": "家庭保洁、深度清洁、开荒保洁、家电清洗等",
    "parentId": null,
    "level": 1,
    "sortOrder": 1,
    "isHot": true,
    "hotOrder": 2,
    "needCert": false,
    "status": 0,
    "createTime": ISODate("2024-01-01T00:00:00Z"),
    "updateTime": ISODate("2024-01-01T00:00:00Z")
  },
  {
    "_id": ObjectId("65a1b2c3d4e5f6a7b8c9d0e2"),
    "name": "养老陪护",
    "icon": "cloud://elderly_care.png",
    "iconColor": "#FF9800",
    "description": "老人陪护、康复护理、日间照料、助浴服务等",
    "parentId": null,
    "level": 1,
    "sortOrder": 2,
    "isHot": true,
    "hotOrder": 3,
    "needCert": true,
    "status": 0,
    "createTime": ISODate("2024-01-01T00:00:00Z"),
    "updateTime": ISODate("2024-01-01T00:00:00Z")
  },
  {
    "_id": ObjectId("65a1b2c3d4e5f6a7b8c9d0e3"),
    "name": "保姆月嫂",
    "icon": "cloud://nanny.png",
    "iconColor": "#E91E63",
    "description": "住家保姆、月嫂服务、育儿嫂、钟点工等",
    "parentId": null,
    "level": 1,
    "sortOrder": 3,
    "isHot": true,
    "hotOrder": 1,
    "needCert": true,
    "status": 0,
    "createTime": ISODate("2024-01-01T00:00:00Z"),
    "updateTime": ISODate("2024-01-01T00:00:00Z")
  },
  {
    "_id": ObjectId("65a1b2c3d4e5f6a7b8c9d0e4"),
    "name": "搬家安装",
    "icon": "cloud://moving.png",
    "iconColor": "#2196F3",
    "description": "居民搬家、家具安装、拆装服务、搬运服务等",
    "parentId": null,
    "level": 1,
    "sortOrder": 4,
    "isHot": false,
    "hotOrder": 0,
    "needCert": false,
    "status": 0,
    "createTime": ISODate("2024-01-01T00:00:00Z"),
    "updateTime": ISODate("2024-01-01T00:00:00Z")
  },
  {
    "_id": ObjectId("65a1b2c3d4e5f6a7b8c9d0e5"),
    "name": "家电维修",
    "icon": "cloud://appliance_repair.png",
    "iconColor": "#9C27B0",
    "description": "空调维修、冰箱维修、洗衣机维修、电视维修等",
    "parentId": null,
    "level": 1,
    "sortOrder": 5,
    "isHot": true,
    "hotOrder": 4,
    "needCert": false,
    "status": 0,
    "createTime": ISODate("2024-01-01T00:00:00Z"),
    "updateTime": ISODate("2024-01-01T00:00:00Z")
  },
  {
    "_id": ObjectId("65a1b2c3d4e5f6a7b8c9d0e6"),
    "name": "水电维修",
    "icon": "cloud://plumbing.png",
    "iconColor": "#00BCD4",
    "description": "水管维修、电路维修、灯具安装、防水补漏等",
    "parentId": null,
    "level": 1,
    "sortOrder": 6,
    "isHot": false,
    "hotOrder": 0,
    "needCert": true,
    "status": 0,
    "createTime": ISODate("2024-01-01T00:00:00Z"),
    "updateTime": ISODate("2024-01-01T00:00:00Z")
  }
])

// 二级分类示例（保洁清洗的子分类）
db.categories.insertMany([
  {
    "name": "日常保洁",
    "parentId": "65a1b2c3d4e5f6a7b8c9d0e1",
    "level": 2,
    "sortOrder": 1,
    "isHot": false,
    "needCert": false,
    "status": 0
  },
  {
    "name": "深度清洁",
    "parentId": "65a1b2c3d4e5f6a7b8c9d0e1",
    "level": 2,
    "sortOrder": 2,
    "isHot": false,
    "needCert": false,
    "status": 0
  },
  {
    "name": "开荒保洁",
    "parentId": "65a1b2c3d4e5f6a7b8c9d0e1",
    "level": 2,
    "sortOrder": 3,
    "isHot": false,
    "needCert": false,
    "status": 0
  },
  {
    "name": "家电清洗",
    "parentId": "65a1b2c3d4e5f6a7b8c9d0e1",
    "level": 2,
    "sortOrder": 4,
    "isHot": false,
    "needCert": false,
    "status": 0
  }
])
```

### 权限规则

```javascript
{
  "read": true,
  "write": "auth != null && getRole(auth.openid) == 'admin'"
}
```
- **read**: 所有用户可读（分类是公开数据）
- **write**: 仅管理员可编辑

---

## 4. orders（订单集合）

存储服务订单，完整状态机设计。

```json
{
  "_id": "string (24位ObjectId, 自动生成)",
  "orderNo": "string (订单编号, 如 'CH202401150001')",
  
  "categoryId": "string (服务分类ID, categories._id)",
  "categoryName": "string (服务分类名称, 冗余存储)",
  "serviceType": "string (具体服务类型)",
  
  "userId": "string (下单用户ID, users._id)",
  "userOpenid": "string (用户openid)",
  "userName": "string (用户姓名)",
  "userPhone": "string (用户电话)",
  
  "workerId": "string (接单工人ID, workers._id, 未接单为空)",
  "workerName": "string (工人姓名, 冗余)",
  "workerPhone": "string (工人电话, 冗余)",
  
  "province": "string (服务地址-省)",
  "city": "string (服务地址-市)",
  "district": "string (服务地址-区县)",
  "town": "string (服务地址-乡镇)",
  "address": "string (详细地址)",
  "location": {
    "type": "Point",
    "coordinates": ["number[2] (经度, 纬度)"]
  },
  "addressNote": "string (地址补充说明, 如 '进门左转')",
  
  "serviceDate": "Date (期望服务日期)",
  "serviceTime": "string (期望服务时间段, 如 '08:00-10:00')",
  "serviceDesc": "string (服务需求描述)",
  "serviceImages": ["string[] (问题/需求图片URL)"],
  
  "priceType": "string (定价方式: quote-报价, fixed-定价, negotiable-面议)",
  "quotedPrice": "number (报价金额, 单位分)",
  "finalPrice": "number (最终成交价, 单位分)",
  "materialFee": "number (材料费, 单位分)",
  "totalAmount": "number (订单总金额, 单位分)",
  
  "status": "number (订单状态, 详见状态机)",
  "statusFlow": [{
    "status": "number (状态值)",
    "statusName": "string (状态名称)",
    "time": "Date (状态变更时间)",
    "operator": "string (操作人: user/worker/system)",
    "remark": "string (操作备注)"
  }],
  
  "payStatus": "number (支付状态: 0-未支付, 1-已支付定金, 2-已支付全款, 3-已退款)",
  "payTime": "Date (支付时间)",
  "payMethod": "string (支付方式: wxpay-微信支付)",
  "wxPayOrderId": "string (微信支付订单号)",
  
  "grabMode": "string (接单模式: grab-抢单, assign-指派, bid-竞价)",
  "grabTime": "Date (抢单时间)",
  "grabWorkers": [{
    "workerId": "string",
    "workerName": "string",
    "grabTime": "Date",
    "quoteAmount": "number"
  }],
  
  "startTime": "Date (服务开始时间)",
  "completeTime": "Date (服务完成时间)",
  "cancelTime": "Date (订单取消时间)",
  "cancelReason": "string (取消原因)",
  "cancelBy": "string (取消人: user/worker/system)",
  
  "remark": "string (用户备注)",
  "adminRemark": "string (管理员备注)",
  
  "isUrgent": "boolean (是否加急, 默认false)",
  "urgentFee": "number (加急费, 单位分, 默认0)",
  
  "isDeleted": "boolean (软删除, 默认false)",
  "createTime": "Date (创建时间)",
  "updateTime": "Date (更新时间)"
}
```

### 字段说明

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| _id | ObjectId | 是 | 自动生成 | 主键 |
| orderNo | string | 是 | - | 业务订单编号 CH+年月日+4位序号 |
| categoryId | string | 是 | - | 服务分类ID |
| categoryName | string | 是 | - | 分类名称（冗余） |
| serviceType | string | 否 | - | 具体服务类型 |
| userId | string | 是 | - | 下单用户ID |
| userOpenid | string | 是 | - | 用户openid |
| userName | string | 否 | - | 用户姓名 |
| userPhone | string | 是 | - | 用户电话 |
| workerId | string | 否 | - | 接单工人ID |
| workerName | string | 否 | - | 工人姓名（冗余） |
| workerPhone | string | 否 | - | 工人电话（冗余） |
| province/city/district/town | string | 否 | - | 服务地址 |
| address | string | 是 | - | 详细地址 |
| location | Point | 否 | - | 坐标 |
| addressNote | string | 否 | - | 地址备注 |
| serviceDate | Date | 是 | - | 期望服务日期 |
| serviceTime | string | 是 | - | 服务时间段 |
| serviceDesc | string | 否 | - | 需求描述 |
| serviceImages | string[] | 否 | [] | 需求图片 |
| priceType | string | 否 | "negotiable" | 定价方式 |
| quotedPrice | number | 否 | 0 | 报价金额 |
| finalPrice | number | 否 | 0 | 成交价 |
| materialFee | number | 否 | 0 | 材料费 |
| totalAmount | number | 否 | 0 | 订单总额 |
| status | number | 是 | 10 | 订单状态（见状态机） |
| statusFlow | object[] | 是 | [] | 状态流转记录 |
| payStatus | number | 是 | 0 | 支付状态 |
| payTime | Date | 否 | - | 支付时间 |
| payMethod | string | 否 | - | 支付方式 |
| wxPayOrderId | string | 否 | - | 微信支付订单号 |
| grabMode | string | 否 | "grab" | 接单模式 |
| grabTime | Date | 否 | - | 抢单时间 |
| grabWorkers | object[] | 否 | [] | 抢单工人列表 |
| startTime | Date | 否 | - | 服务开始时间 |
| completeTime | Date | 否 | - | 完成时间 |
| cancelTime | Date | 否 | - | 取消时间 |
| cancelReason | string | 否 | - | 取消原因 |
| cancelBy | string | 否 | - | 取消人 |
| remark | string | 否 | - | 备注 |
| adminRemark | string | 否 | - | 管理员备注 |
| isUrgent | boolean | 否 | false | 是否加急 |
| urgentFee | number | 否 | 0 | 加急费 |
| isDeleted | boolean | 是 | false | 软删除 |
| createTime | Date | 是 | 当前时间 | 创建时间 |
| updateTime | Date | 是 | 当前时间 | 更新时间 |

### 订单状态机设计

```
订单生命周期:

  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
  │   已创建    │────▶│   待接单    │────▶│   已接单    │
  │  (status:   │     │  (status:   │     │  (status:   │
  │    10)      │     │    20)      │     │    30)      │
  └─────────────┘     └──────┬──────┘     └──────┬──────┘
                             │                     │
                    ┌────────▼────────┐           │
                    │   已取消(40)    │◀──────────┤
                    │  (用户/超时取消) │           │
                    └─────────────────┘           │
                                                  ▼
                                          ┌─────────────┐
                                          │   服务中    │
                                          │  (status:   │
                                          │    50)      │
                                          └──────┬──────┘
                                                 │
                    ┌─────────────┐              │
                    │   已取消    │◀─────────────┤
                    │  (status:   │   (工人取消)  │
                    │    40)      │              │
                    └─────────────┘              ▼
                                          ┌─────────────┐
                                          │   已完成    │
                                          │  (status:   │
                                          │    60)      │
                                          └──────┬──────┘
                                                 │
                                                 ▼
                                          ┌─────────────┐
                                          │   已评价    │
                                          │  (status:   │
                                          │    70)      │
                                          └─────────────┘

状态码定义:
┌────────┬─────────────┬──────────────────────────────────┐
│ 状态码 │   状态名    │            说明                   │
├────────┼─────────────┼──────────────────────────────────┤
│   10   │   已创建    │ 订单刚创建，等待支付（如需要）     │
│   20   │   待接单    │ 订单已发布，等待工人抢单/指派      │
│   30   │   已接单    │ 工人已接单，等待上门服务           │
│   40   │   已取消    │ 订单被取消（用户/工人/系统）       │
│   50   │   服务中    │ 工人已到达，开始服务               │
│   60   │   已完成    │ 服务完成，等待用户评价             │
│   70   │   已评价    │ 用户已评价，订单闭环               │
│   80   │   售后中    │ 售后/投诉处理中                   │
│   90   │   已关闭    │ 订单关闭（售后完成）               │
└────────┴─────────────┴──────────────────────────────────┘

状态流转规则:
1. 10→20: 创建完成（无需预付）或支付完成（需预付）
2. 20→30: 工人抢单成功 / 管理员指派
3. 20→40: 用户取消 / 超时未接单自动取消
4. 30→50: 工人点击"开始服务"
5. 30→40: 工人取消（需扣除信誉分）
6. 50→60: 工人点击"服务完成"，用户确认
7. 60→70: 用户提交评价
8. 60→80: 用户发起售后/投诉
9. 80→90: 售后处理完成
```

### 索引设计

```javascript
// 1. 订单编号唯一索引
db.orders.createIndex({ "orderNo": 1 }, { unique: true })

// 2. 用户索引 — 查询我的订单
db.orders.createIndex({ "userId": 1, "status": 1, "createTime": -1 })

// 3. 工人索引 — 查询工人的订单
db.orders.createIndex({ "workerId": 1, "status": 1, "createTime": -1 })

// 4. 状态索引 — 按状态筛选订单（后台管理）
db.orders.createIndex({ "status": 1, "createTime": -1 })

// 5. 创建时间索引 — 时间范围查询
db.orders.createIndex({ "createTime": -1 })

// 6. 服务日期索引 — 按服务日期排班
db.orders.createIndex({ "serviceDate": 1 })

// 7. 地理空间索引 — 附近订单查询
db.orders.createIndex({ "location": "2dsphere" })

// 8. 分类索引 — 按分类统计
db.orders.createIndex({ "categoryId": 1, "status": 1 })

// 9. 支付状态索引
db.orders.createIndex({ "payStatus": 1 })
```

### 权限规则

```javascript
{
  "read": "doc.userOpenid == auth.openid || doc.workerId == getWorkerId(auth.openid) || getRole(auth.openid) == 'admin'",
  "write": "doc.userOpenid == auth.openid || doc.workerId == getWorkerId(auth.openid) || getRole(auth.openid) == 'admin'"
}
```
- **read**: 下单用户可读；接单工人可读；管理员可读
- **write**: 下单用户可修改（取消订单）；工人可修改（更新状态）；管理员可修改

---

## 5. messages（消息集合）

支持聊天消息（用户↔工人）和系统消息两种类型，支持文字、语音、图片三种内容格式。

```json
{
  "_id": "string (24位ObjectId, 自动生成)",
  
  "msgType": "string (消息大类: chat-聊天消息, system-系统消息)",
  
  "conversationId": "string (会话ID, 用于聚合聊天会话)",
  "seq": "number (会话内消息序号, 用于排序)",
  
  "orderId": "string (关联订单ID, 如有)",
  
  "senderId": "string (发送者用户ID)",
  "senderOpenid": "string (发送者openid)",
  "senderName": "string (发送者昵称)",
  "senderAvatar": "string (发送者头像)",
  "senderRole": "string (发送者角色: user/worker/system/admin)",
  
  "receiverId": "string (接收者用户ID)",
  "receiverOpenid": "string (接收者openid)",
  
  "contentType": "string (内容类型: text-文字, voice-语音, image-图片, location-位置, order-订单卡片, system-系统通知)",
  
  "content": {
    "text": "string (文字内容, contentType=text时)",
    "voiceUrl": "string (语音文件URL, contentType=voice时)",
    "voiceDuration": "number (语音时长, 秒)",
    "imageUrl": "string (图片URL, contentType=image时)",
    "imageWidth": "number (图片宽度)",
    "imageHeight": "number (图片高度)",
    "location": {
      "name": "string (位置名称)",
      "address": "string (地址)",
      "latitude": "number (纬度)",
      "longitude": "number (经度)"
    }
  },
  
  "systemType": "string (系统消息类型: order_status-订单状态, verify_result-审核结果, withdraw_result-提现结果, account_notice-账户通知, activity-活动推送)",
  "systemData": "object (系统消息附加数据)",
  
  "isRead": "boolean (是否已读, 默认false)",
  "readTime": "Date (已读时间)",
  
  "isRecalled": "boolean (是否已撤回, 默认false)",
  "recallTime": "Date (撤回时间)",
  
  "isDeleted": "boolean (软删除, 默认false)",
  "createTime": "Date (发送时间)"
}
```

### 字段说明

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| _id | ObjectId | 是 | 自动生成 | 主键 |
| msgType | string | 是 | - | chat聊天 / system系统消息 |
| conversationId | string | 条件必填 | - | 会话ID（chat时必填） |
| seq | number | 否 | 0 | 会话内序号 |
| orderId | string | 否 | - | 关联订单ID |
| senderId | string | 是 | - | 发送者ID |
| senderOpenid | string | 是 | - | 发送者openid |
| senderName | string | 否 | - | 发送者昵称 |
| senderAvatar | string | 否 | - | 发送者头像 |
| senderRole | string | 是 | - | 发送者角色 |
| receiverId | string | 条件必填 | - | 接收者ID（chat时必填） |
| receiverOpenid | string | 条件必填 | - | 接收者openid |
| contentType | string | 是 | - | 内容类型 |
| content | object | 是 | - | 消息内容体 |
| content.text | string | 条件必填 | - | 文字内容 |
| content.voiceUrl | string | 条件必填 | - | 语音URL |
| content.voiceDuration | number | 否 | 0 | 语音时长(秒) |
| content.imageUrl | string | 条件必填 | - | 图片URL |
| content.imageWidth | number | 否 | - | 图片宽度 |
| content.imageHeight | number | 否 | - | 图片高度 |
| content.location | object | 条件必填 | - | 位置信息 |
| systemType | string | 条件必填 | - | 系统消息类型 |
| systemData | object | 否 | {} | 系统消息附加数据 |
| isRead | boolean | 是 | false | 是否已读 |
| readTime | Date | 否 | - | 已读时间 |
| isRecalled | boolean | 是 | false | 是否撤回 |
| recallTime | Date | 否 | - | 撤回时间 |
| isDeleted | boolean | 是 | false | 软删除 |
| createTime | Date | 是 | 当前时间 | 发送时间 |

### 会话ID生成规则

```javascript
// 会话ID由两个用户ID排序后拼接，确保双向唯一
conversationId = [userId1, userId2].sort().join("_")
// 示例: "65a1_65b2" （字母序较小的在前）

// 系统消息的conversationId = "system_" + userId
```

### 索引设计

```javascript
// 1. 会话ID+序号 — 查询会话消息并按序排列
db.messages.createIndex({ "conversationId": 1, "seq": 1 })

// 2. 发送者索引 — 查询我发送的消息
db.messages.createIndex({ "senderOpenid": 1, "createTime": -1 })

// 3. 接收者+已读 — 查询未读消息
db.messages.createIndex({ "receiverOpenid": 1, "isRead": 1 })

// 4. 订单关联索引 — 查询订单相关消息
db.messages.createIndex({ "orderId": 1, "createTime": -1 })

// 5. 创建时间索引 — 消息列表排序
db.messages.createIndex({ "createTime": -1 })

// 6. 消息类型索引 — 区分聊天和系统消息
db.messages.createIndex({ "msgType": 1, "receiverOpenid": 1 })
```

### 权限规则

```javascript
{
  "read": "doc.senderOpenid == auth.openid || doc.receiverOpenid == auth.openid",
  "write": "doc.senderOpenid == auth.openid"
}
```
- **read**: 发送者或接收者可读（确保只能看自己的聊天）
- **write**: 仅发送者可写（发送消息/撤回）

---

## 6. posts（发布内容集合）

支持招聘求职和婚恋介绍两种内容类型，通过postType字段区分。

```json
{
  "_id": "string (24位ObjectId, 自动生成)",
  "postNo": "string (内容编号, 如 'P202401150001')",
  
  "postType": "string (内容类型: job-招聘求职, marriage-婚恋介绍)",
  
  "publisherId": "string (发布者用户ID, users._id)",
  "publisherOpenid": "string (发布者openid)",
  "publisherName": "string (发布者昵称)",
  "publisherPhone": "string (发布者电话)",
  "publisherRole": "string (发布者角色: user/partner)",
  "partnerId": "string (合作商ID, 如为合作商发布)",
  
  "title": "string (标题)",
  "content": "string (详细内容)",
  "images": ["string[] (图片URL数组, 最多9张)"],
  "contactPhone": "string (联系手机)",
  "contactWechat": "string (联系微信)",
  "viewCount": "number (浏览次数, 默认0)",
  "likeCount": "number (点赞数, 默认0)",
  
  "province": "string (所在省份)",
  "city": "string (所在城市)",
  "district": "string (所在区县)",
  
  // === 招聘求职专属字段 (postType='job') ===
  "jobType": "string (招聘类型: recruit-招聘, apply-求职)",
  "jobPosition": "string (职位名称)",
  "jobSalaryMin": "number (最低薪资, 元/月)",
  "jobSalaryMax": "number (最高薪资, 元/月)",
  "jobSalaryUnit": "string (薪资单位: month-月, day-天, hour-小时)",
  "jobEducation": "string (学历要求: none-不限, high-高中, college-大专, bachelor-本科)",
  "jobExperience": "string (经验要求: none-不限, 1year-1年, 3year-3年, 5year-5年)",
  "jobAgeLimit": "string (年龄要求)",
  "jobGenderReq": "string (性别要求: any-不限, male-男, female-女)",
  "jobTags": ["string[] (福利标签, 如 ['五险一金', '包吃住'])"],
  "jobCompany": "string (公司名称)",
  "jobWorkplace": "string (工作地点)",
  "jobHeadcount": "number (招聘人数)",
  "jobResume": "string (求职简历内容, 求职时填写)",
  
  // === 婚恋介绍专属字段 (postType='marriage') ===
  "marriageType": "string (婚恋类型: self-本人, child-子女, relative-亲戚)",
  "marriageGender": "string (性别: male-男, female-女)",
  "marriageBirthYear": "number (出生年份)",
  "marriageHeight": "number (身高cm)",
  "marriageWeight": "number (体重kg)",
  "marriageEducation": "string (学历)",
  "marriageOccupation": "string (职业)",
  "marriageIncome": "string (年收入范围)",
  "marriageHousing": "string (住房情况: have-有, rent-租房, none-无)",
  "marriageCar": "string (购车情况: have-有, none-无)",
  "marriageNativePlace": "string (籍贯)",
  "marriageMarryStatus": "string (婚姻状况: unmarried-未婚, divorced-离异, widowed-丧偶)",
  "marriageRequirements": "string (择偶要求)",
  "marriageSelfDesc": "string (自我介绍)",
  
  "verifyStatus": "number (审核状态: 0-待审核, 1-已通过, 2-已拒绝, 默认0)",
  "verifyRemark": "string (审核备注/拒绝原因)",
  "verifyTime": "Date (审核时间)",
  
  "isTop": "boolean (是否置顶, 默认false)",
  "topExpireTime": "Date (置顶到期时间)",
  "sortOrder": "number (排序权重, 默认0)",
  
  "status": "number (状态: 0-正常, 1-下架, 2-已结束, 默认0)",
  "isDeleted": "boolean (软删除, 默认false)",
  "createTime": "Date (创建时间)",
  "updateTime": "Date (更新时间)"
}
```

### 字段说明（公共字段）

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| _id | ObjectId | 是 | 自动生成 | 主键 |
| postNo | string | 是 | - | 内容编号 |
| postType | string | 是 | - | job招聘求职 / marriage婚恋 |
| publisherId | string | 是 | - | 发布者用户ID |
| publisherOpenid | string | 是 | - | 发布者openid |
| publisherName | string | 否 | - | 发布者昵称 |
| publisherPhone | string | 否 | - | 联系电话 |
| publisherRole | string | 是 | "user" | user用户 / partner合作商 |
| partnerId | string | 否 | - | 合作商ID |
| title | string | 是 | - | 标题 |
| content | string | 是 | - | 详细内容 |
| images | string[] | 否 | [] | 图片（最多9张） |
| contactPhone | string | 否 | - | 联系手机 |
| contactWechat | string | 否 | - | 联系微信 |
| viewCount | number | 是 | 0 | 浏览数 |
| likeCount | number | 是 | 0 | 点赞数 |
| province | string | 否 | - | 省份 |
| city | string | 否 | - | 城市 |
| district | string | 否 | - | 区县 |

### 招聘求职专属字段

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| jobType | string | 条件 | - | recruit招聘 / apply求职 |
| jobPosition | string | 条件 | - | 职位名称 |
| jobSalaryMin | number | 否 | 0 | 最低薪资 |
| jobSalaryMax | number | 否 | 0 | 最高薪资 |
| jobSalaryUnit | string | 否 | "month" | 薪资单位 |
| jobEducation | string | 否 | "none" | 学历要求 |
| jobExperience | string | 否 | "none" | 经验要求 |
| jobAgeLimit | string | 否 | - | 年龄要求 |
| jobGenderReq | string | 否 | "any" | 性别要求 |
| jobTags | string[] | 否 | [] | 福利标签 |
| jobCompany | string | 否 | - | 公司名称 |
| jobWorkplace | string | 否 | - | 工作地点 |
| jobHeadcount | number | 否 | 1 | 招聘人数 |
| jobResume | string | 否 | - | 求职简历 |

### 婚恋介绍专属字段

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| marriageType | string | 条件 | - | self本人/child子女/relative亲戚 |
| marriageGender | string | 条件 | - | male男/female女 |
| marriageBirthYear | number | 条件 | - | 出生年份 |
| marriageHeight | number | 否 | - | 身高cm |
| marriageWeight | number | 否 | - | 体重kg |
| marriageEducation | string | 否 | - | 学历 |
| marriageOccupation | string | 否 | - | 职业 |
| marriageIncome | string | 否 | - | 年收入范围 |
| marriageHousing | string | 否 | - | 住房情况 |
| marriageCar | string | 否 | - | 购车情况 |
| marriageNativePlace | string | 否 | - | 籍贯 |
| marriageMarryStatus | string | 条件 | - | 婚姻状况 |
| marriageRequirements | string | 否 | - | 择偶要求 |
| marriageSelfDesc | string | 否 | - | 自我介绍 |

### 审核与状态字段

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| verifyStatus | number | 是 | 0 | 0待审核 1通过 2拒绝 |
| verifyRemark | string | 否 | - | 审核备注 |
| verifyTime | Date | 否 | - | 审核时间 |
| isTop | boolean | 否 | false | 是否置顶 |
| topExpireTime | Date | 否 | - | 置顶到期时间 |
| sortOrder | number | 否 | 0 | 排序权重 |
| status | number | 是 | 0 | 0正常 1下架 2已结束 |
| isDeleted | boolean | 是 | false | 软删除 |
| createTime | Date | 是 | 当前时间 | 创建时间 |
| updateTime | Date | 是 | 当前时间 | 更新时间 |

### 索引设计

```javascript
// 1. 内容编号唯一索引
db.posts.createIndex({ "postNo": 1 }, { unique: true })

// 2. 类型+审核+创建时间 — 前台列表查询（已通过的内容）
db.posts.createIndex({ "postType": 1, "verifyStatus": 1, "createTime": -1 })

// 3. 发布者索引 — 我的发布
db.posts.createIndex({ "publisherId": 1, "createTime": -1 })

// 4. 审核状态索引 — 后台审核列表
db.posts.createIndex({ "verifyStatus": 1, "createTime": -1 })

// 5. 置顶+排序 — 置顶内容优先
db.posts.createIndex({ "isTop": 1, "sortOrder": -1, "createTime": -1 })

// 6. 地区索引 — 按地区筛选
db.posts.createIndex({ "province": 1, "city": 1, "district": 1 })

// 7. 招聘类型索引
db.posts.createIndex({ "jobType": 1, "verifyStatus": 1 })

// 8. 合作商索引
db.posts.createIndex({ "partnerId": 1, "createTime": -1 })
```

### 权限规则

```javascript
{
  "read": "doc.verifyStatus == 1 || doc.publisherOpenid == auth.openid || getRole(auth.openid) == 'admin'",
  "write": "doc.publisherOpenid == auth.openid || getRole(auth.openid) == 'admin'"
}
```
- **read**: 已审核通过的所有人可读；发布者可读自己的（含未审核）；管理员可读所有
- **write**: 发布者可编辑/删除自己的；管理员可编辑所有

---

## 7. banners（Banner集合）

首页轮播图管理。

```json
{
  "_id": "string (24位ObjectId)",
  "title": "string (标题)",
  "subtitle": "string (副标题)",
  "imageUrl": "string (图片URL)",
  "linkType": "string (跳转类型: page-小程序页面, web-H5网页, miniprogram-其他小程序, none-不跳转)",
  "linkUrl": "string (跳转链接)",
  "linkParams": "object (跳转参数)",
  
  "position": "string (展示位置: home-首页, service-服务页, me-我的页)",
  "sortOrder": "number (排序权重, 默认0)",
  
  "startTime": "Date (展示开始时间)",
  "endTime": "Date (展示结束时间)",
  
  "isShow": "boolean (是否显示, 默认true)",
  "status": "number (状态: 0-正常, 1-禁用, 默认0)",
  
  "createTime": "Date (创建时间)",
  "updateTime": "Date (更新时间)"
}
```

### 字段说明

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| _id | ObjectId | 是 | 自动生成 | 主键 |
| title | string | 是 | - | 标题 |
| subtitle | string | 否 | - | 副标题 |
| imageUrl | string | 是 | - | Banner图片 |
| linkType | string | 否 | "none" | 跳转类型 |
| linkUrl | string | 否 | - | 跳转链接 |
| linkParams | object | 否 | {} | 跳转参数 |
| position | string | 是 | "home" | 展示位置 |
| sortOrder | number | 是 | 0 | 排序权重 |
| startTime | Date | 否 | - | 展示开始 |
| endTime | Date | 否 | - | 展示结束 |
| isShow | boolean | 是 | true | 是否显示 |
| status | number | 是 | 0 | 0正常 1禁用 |
| createTime | Date | 是 | 当前时间 | 创建时间 |
| updateTime | Date | 是 | 当前时间 | 更新时间 |

### 索引设计

```javascript
// 1. 位置+排序 — 按位置查询Banner
db.banners.createIndex({ "position": 1, "sortOrder": 1 })

// 2. 显示状态索引
db.banners.createIndex({ "isShow": 1, "status": 1 })
```

### 初始数据

```javascript
db.banners.insertMany([
  {
    "_id": ObjectId("65b1c2d3e4f5a6b7c8d9e0f1"),
    "title": "专业保洁清洗服务",
    "subtitle": "新房开荒、日常保洁、家电清洗一站式服务",
    "imageUrl": "cloud://banner_cleaning.jpg",
    "linkType": "page",
    "linkUrl": "/pages/category/category",
    "linkParams": { "categoryId": "65a1b2c3d4e5f6a7b8c9d0e1" },
    "position": "home",
    "sortOrder": 1,
    "startTime": ISODate("2024-01-01T00:00:00Z"),
    "endTime": ISODate("2024-12-31T23:59:59Z"),
    "isShow": true,
    "status": 0,
    "createTime": ISODate("2024-01-01T00:00:00Z"),
    "updateTime": ISODate("2024-01-01T00:00:00Z")
  },
  {
    "_id": ObjectId("65b1c2d3e4f5a6b7c8d9e0f2"),
    "title": "优质保姆月嫂推荐",
    "subtitle": "持证上岗、专业培训、贴心护理",
    "imageUrl": "cloud://banner_nanny.jpg",
    "linkType": "page",
    "linkUrl": "/pages/category/category",
    "linkParams": { "categoryId": "65a1b2c3d4e5f6a7b8c9d0e3" },
    "position": "home",
    "sortOrder": 2,
    "startTime": ISODate("2024-01-01T00:00:00Z"),
    "endTime": ISODate("2024-12-31T23:59:59Z"),
    "isShow": true,
    "status": 0,
    "createTime": ISODate("2024-01-01T00:00:00Z"),
    "updateTime": ISODate("2024-01-01T00:00:00Z")
  },
  {
    "_id": ObjectId("65b1c2d3e4f5a6b7c8d9e0f3"),
    "title": "本地招聘求职信息",
    "subtitle": "海量本地岗位，快速找到好工作",
    "imageUrl": "cloud://banner_job.jpg",
    "linkType": "page",
    "linkUrl": "/pages/posts/posts",
    "linkParams": { "tab": "job" },
    "position": "home",
    "sortOrder": 3,
    "startTime": ISODate("2024-01-01T00:00:00Z"),
    "endTime": ISODate("2024-12-31T23:59:59Z"),
    "isShow": true,
    "status": 0,
    "createTime": ISODate("2024-01-01T00:00:00Z"),
    "updateTime": ISODate("2024-01-01T00:00:00Z")
  }
])
```

### 权限规则

```javascript
{
  "read": true,
  "write": "auth != null && getRole(auth.openid) == 'admin'"
}
```
- **read**: 所有用户可读
- **write**: 仅管理员可编辑

---

## 8. withdrawals（提现记录集合）

工人/合作商的提现申请记录。

```json
{
  "_id": "string (24位ObjectId)",
  "withdrawNo": "string (提现单号, 如 'W202401150001')",
  
  "userId": "string (申请人用户ID, users._id)",
  "userOpenid": "string (申请人openid)",
  "userName": "string (申请人姓名)",
  "userRole": "string (申请人角色: worker/partner)",
  
  "amount": "number (提现金额, 单位分, 最低10000分=100元)",
  "fee": "number (手续费, 单位分, 默认0)",
  "actualAmount": "number (实际到账金额 = amount - fee)",
  
  "accountType": "string (账户类型: wechat-微信零钱, bank-银行卡, alipay-支付宝)",
  "accountInfo": {
    "bankName": "string (开户行名称)",
    "bankBranch": "string (开户支行)",
    "accountName": "string (开户姓名)",
    "accountNo": "string (银行卡号/支付宝账号, 脱敏存储)",
    "bindId": "string (绑定的支付渠道ID)"
  },
  
  "status": "number (提现状态: 0-待审核, 1-审核通过, 2-审核拒绝, 3-处理中, 4-已到账, 5-打款失败)",
  "statusFlow": [{
    "status": "number",
    "statusName": "string",
    "time": "Date",
    "operator": "string",
    "remark": "string"
  }],
  
  "applyRemark": "string (申请人备注)",
  "auditRemark": "string (审核备注/拒绝原因)",
  "auditTime": "Date (审核时间)",
  "auditBy": "string (审核人adminId)",
  
  "transferTime": "Date (实际转账时间)",
  "transferNo": "string (转账流水号)",
  "wxPayResult": "object (微信支付返回结果)",
  
  "isDeleted": "boolean (软删除, 默认false)",
  "createTime": "Date (申请时间)",
  "updateTime": "Date (更新时间)"
}
```

### 字段说明

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| _id | ObjectId | 是 | 自动生成 | 主键 |
| withdrawNo | string | 是 | - | 提现单号 W+年月日+4位序号 |
| userId | string | 是 | - | 申请人ID |
| userOpenid | string | 是 | - | 申请人openid |
| userName | string | 否 | - | 申请人姓名 |
| userRole | string | 是 | - | worker工人 / partner合作商 |
| amount | number | 是 | - | 提现金额（分），最低10000分 |
| fee | number | 是 | 0 | 手续费（分） |
| actualAmount | number | 是 | - | 实际到账 = amount - fee |
| accountType | string | 是 | "wechat" | 到账账户类型 |
| accountInfo | object | 否 | {} | 账户信息 |
| accountInfo.bankName | string | 否 | - | 开户行 |
| accountInfo.bankBranch | string | 否 | - | 开户支行 |
| accountInfo.accountName | string | 否 | - | 开户姓名 |
| accountInfo.accountNo | string | 否 | - | 卡号（脱敏） |
| accountInfo.bindId | string | 否 | - | 绑定ID |
| status | number | 是 | 0 | 提现状态 |
| statusFlow | object[] | 是 | [] | 状态流转记录 |
| applyRemark | string | 否 | - | 申请备注 |
| auditRemark | string | 否 | - | 审核备注 |
| auditTime | Date | 否 | - | 审核时间 |
| auditBy | string | 否 | - | 审核人 |
| transferTime | Date | 否 | - | 转账时间 |
| transferNo | string | 否 | - | 转账流水号 |
| wxPayResult | object | 否 | - | 微信支付结果 |
| isDeleted | boolean | 是 | false | 软删除 |
| createTime | Date | 是 | 当前时间 | 申请时间 |
| updateTime | Date | 是 | 当前时间 | 更新时间 |

### 提现状态机

```
提现流程:
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  待审核   │───▶│ 审核通过  │───▶│  处理中   │───▶│  已到账   │
│ (status:0)│    │ (status:1)│    │ (status:3)│    │ (status:4)│
└──────────┘    └──────────┘    └──────────┘    └─────┬────┘
      │                                                │
      │         ┌──────────┐                          │
      └────────▶│ 审核拒绝  │◀─────────────────────────┤
                │ (status:2)│    (打款失败)             │
                └──────────┘                          │
                                                      ▼
                                                ┌──────────┐
                                                │  打款失败  │
                                                │ (status:5)│
                                                └──────────┘
```

### 索引设计

```javascript
// 1. 提现单号唯一索引
db.withdrawals.createIndex({ "withdrawNo": 1 }, { unique: true })

// 2. 用户+状态 — 查询我的提现记录
db.withdrawals.createIndex({ "userId": 1, "status": 1, "createTime": -1 })

// 3. 状态+时间 — 后台审核列表
db.withdrawals.createIndex({ "status": 1, "createTime": -1 })

// 4. 创建时间 — 时间范围统计
db.withdrawals.createIndex({ "createTime": -1 })

// 5. 转账流水号 — 对账查询
db.withdrawals.createIndex({ "transferNo": 1 }, { sparse: true })
```

### 权限规则

```javascript
{
  "read": "doc.userOpenid == auth.openid || getRole(auth.openid) == 'admin'",
  "write": "doc.userOpenid == auth.openid || getRole(auth.openid) == 'admin'"
}
```
- **read**: 申请人可读自己的；管理员可读所有
- **write**: 申请人可创建；管理员可更新审核状态

---

## 9. roleAccounts（角色账号集合）

存储各角色的独立登录凭证，用于身份切换时的账号密码验证。

```json
{
  "_id": "string (24位ObjectId)",
  
  "userId": "string (关联用户ID, users._id)",
  "userOpenid": "string (微信openid)",
  
  "role": "string (角色: worker-工人, partner-合作商, admin-管理员)",
  "roleName": "string (角色显示名)",
  
  "account": "string (登录账号, 支持手机号/自定义账号)",
  "password": "string (密码, bcrypt加密存储)",
  "salt": "string (密码盐值)",
  
  "loginFailCount": "number (连续登录失败次数, 默认0)",
  "lastLoginTime": "Date (最后登录时间)",
  "lastLoginIp": "string (最后登录IP)",
  
  "isActive": "boolean (账号是否激活, 默认true)",
  "status": "number (状态: 0-正常, 1-锁定, 2-禁用, 默认0)",
  
  "createTime": "Date (创建时间)",
  "updateTime": "Date (更新时间)"
}
```

### 字段说明

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| _id | ObjectId | 是 | 自动生成 | 主键 |
| userId | string | 是 | - | 关联users._id |
| userOpenid | string | 是 | - | 微信openid |
| role | string | 是 | - | worker/partner/admin |
| roleName | string | 是 | - | 角色显示名称 |
| account | string | 是 | - | 登录账号（手机号或自定义） |
| password | string | 是 | - | bcrypt哈希后的密码 |
| salt | string | 是 | - | 密码盐值 |
| loginFailCount | number | 是 | 0 | 连续登录失败次数 |
| lastLoginTime | Date | 否 | - | 最后登录时间 |
| lastLoginIp | string | 否 | - | 最后登录IP |
| isActive | boolean | 是 | true | 是否激活 |
| status | number | 是 | 0 | 0正常 1锁定 2禁用 |
| createTime | Date | 是 | 当前时间 | 创建时间 |
| updateTime | Date | 是 | 当前时间 | 更新时间 |

### 索引设计

```javascript
// 1. 账号+角色唯一索引 — 登录查询
db.roleAccounts.createIndex({ "account": 1, "role": 1 }, { unique: true })

// 2. 用户ID+角色唯一索引 — 一个用户一个角色只有一个账号
db.roleAccounts.createIndex({ "userId": 1, "role": 1 }, { unique: true })

// 3. openid索引 — 通过openid查询角色列表
db.roleAccounts.createIndex({ "userOpenid": 1, "isActive": 1 })

// 4. 状态索引 — 排除锁定/禁用的账号
db.roleAccounts.createIndex({ "status": 1 })
```

### 权限规则

```javascript
{
  "read": "doc.userOpenid == auth.openid",
  "write": "doc.userOpenid == auth.openid || getRole(auth.openid) == 'admin'"
}
```
- **read**: 仅账号所有者可读（密码等敏感信息）
- **write**: 本人可修改密码；管理员可重置密码/锁定账号

---

## 10. reviews（评价集合）

用户对工人的服务评价。

```json
{
  "_id": "string (24位ObjectId)",
  
  "orderId": "string (关联订单ID, orders._id)",
  "orderNo": "string (订单编号, 冗余)",
  
  "userId": "string (评价用户ID, users._id)",
  "userOpenid": "string (用户openid)",
  "userName": "string (用户昵称)",
  "userAvatar": "string (用户头像)",
  
  "workerId": "string (被评价工人ID, workers._id)",
  "workerName": "string (工人姓名)",
  
  "categoryId": "string (服务分类ID)",
  "categoryName": "string (服务分类名称)",
  
  "rating": "number (综合评分, 1-5星)",
  "ratingItems": {
    "attitude": "number (服务态度, 1-5)",
    "skill": "number (专业技能, 1-5)",
    "punctuality": "number (准时到达, 1-5)",
    "cleanliness": "number (清洁整理, 1-5)"
  },
  
  "content": "string (评价内容文字)",
  "images": ["string[] (评价图片URL)"],
  "isAnonymous": "boolean (是否匿名评价, 默认false)",
  
  "workerReply": "string (工人回复内容)",
  "workerReplyTime": "Date (工人回复时间)",
  
  "isRecommend": "boolean (是否推荐, 默认true)",
  "isDeleted": "boolean (软删除, 默认false)",
  
  "createTime": "Date (评价时间)"
}
```

### 字段说明

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| _id | ObjectId | 是 | 自动生成 | 主键 |
| orderId | string | 是 | - | 关联订单ID |
| orderNo | string | 是 | - | 订单编号（冗余） |
| userId | string | 是 | - | 评价用户ID |
| userOpenid | string | 是 | - | 用户openid |
| userName | string | 否 | - | 用户昵称 |
| userAvatar | string | 否 | - | 用户头像 |
| workerId | string | 是 | - | 被评价工人ID |
| workerName | string | 否 | - | 工人姓名 |
| categoryId | string | 否 | - | 服务分类ID |
| categoryName | string | 否 | - | 服务分类名称 |
| rating | number | 是 | - | 综合评分1-5 |
| ratingItems | object | 否 | - | 分项评分 |
| ratingItems.attitude | number | 否 | - | 服务态度1-5 |
| ratingItems.skill | number | 否 | - | 专业技能1-5 |
| ratingItems.punctuality | number | 否 | - | 准时到达1-5 |
| ratingItems.cleanliness | number | 否 | - | 清洁整理1-5 |
| content | string | 否 | - | 评价内容 |
| images | string[] | 否 | [] | 评价图片 |
| isAnonymous | boolean | 否 | false | 是否匿名 |
| workerReply | string | 否 | - | 工人回复 |
| workerReplyTime | Date | 否 | - | 回复时间 |
| isRecommend | boolean | 否 | true | 是否推荐 |
| isDeleted | boolean | 是 | false | 软删除 |
| createTime | Date | 是 | 当前时间 | 评价时间 |

### 索引设计

```javascript
// 1. 订单唯一索引 — 一个订单一条评价
db.reviews.createIndex({ "orderId": 1 }, { unique: true })

// 2. 工人+时间 — 查询工人评价列表
db.reviews.createIndex({ "workerId": 1, "createTime": -1 })

// 3. 用户索引 — 我的评价
db.reviews.createIndex({ "userId": 1, "createTime": -1 })

// 4. 评分索引 — 好评/差评筛选
db.reviews.createIndex({ "workerId": 1, "rating": -1 })

// 5. 创建时间 — 最新评价
db.reviews.createIndex({ "createTime": -1 })

// 6. 分类索引 — 按服务类型评价统计
db.reviews.createIndex({ "categoryId": 1, "rating": 1 })
```

### 权限规则

```javascript
{
  "read": true,
  "write": "doc.userOpenid == auth.openid || doc.workerId == getWorkerId(auth.openid)"
}
```
- **read**: 评价公开可读（用于工人详情页展示）
- **write**: 评价者可创建/修改；被评价工人可回复

---

## 数据关联关系图

```
┌─────────────────────────────────────────────────────────────────────┐
│                        数据关联关系图                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌──────────┐         workerId         ┌──────────┐               │
│   │  users   │◄────────────────────────►│ workers  │               │
│   │          │         1:1             │          │               │
│   │ _openid  │                         │ userId   │               │
│   │ workerId │◄───────引用─────────────│          │               │
│   │ partnerId│                         └────┬─────┘               │
│   └────┬─────┘                              │                       │
│        │                                    │ workerId             │
│        │ roles数组                          │                       │
│        │ (user/worker/partner/admin)        ▼                       │
│        │                              ┌──────────┐                 │
│        │                              │  orders  │                 │
│        │        userId ──────────────►│          │◄──── workerId   │
│        └─────────────────────────────►│          │                 │
│        │                              │categoryId│                 │
│        │                              └────┬─────┘                 │
│        │                                   │                        │
│        │                                   │ categoryId             │
│        │                              ┌────┴─────┐                 │
│        │                         ┌───►│categories│                 │
│        │                         │    └──────────┘                 │
│        │                         │                                 │
│        │    ┌──────────┐        │    ┌──────────┐                 │
│        │    │ partners │◄───────┘    │ banners  │  (独立)         │
│        │    └──────────┘             └──────────┘                 │
│        │                                                          │
│        │    publisherId           userId/workerId                  │
│        └───►┌──────────┐         ┌────────────┐                   │
│             │  posts   │         │ withdrawals│                   │
│             └──────────┘         └────────────┘                   │
│                                                                     │
│   ┌──────────┐    conversationId    ┌──────────┐                   │
│   │ messages │◄───────────────────►│ messages │  (自关联会话)      │
│   └──────────┘                     └──────────┘                   │
│                                                                     │
│   ┌──────────┐    orderId           userId/workerId               │
│   │ reviews  │◄───────────────────┐ ┌──────────────┐              │
│   └──────────┘                    └►│ roleAccounts │              │
│                                     └──────────────┘              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 外键引用关系汇总

| 集合 | 外键字段 | 引用集合 | 引用字段 | 关系类型 |
|------|---------|---------|---------|---------|
| users | workerId | workers | _id | 1:1 可选 |
| workers | userId | users | _id | 1:1 必填 |
| orders | userId | users | _id | N:1 必填 |
| orders | workerId | workers | _id | N:1 可选 |
| orders | categoryId | categories | _id | N:1 必填 |
| messages | senderId | users | _id | N:1 必填 |
| messages | receiverId | users | _id | N:1 条件必填 |
| messages | orderId | orders | _id | N:1 可选 |
| posts | publisherId | users | _id | N:1 必填 |
| posts | partnerId | users | _id | N:1 可选 |
| withdrawals | userId | users | _id | N:1 必填 |
| roleAccounts | userId | users | _id | N:1 必填 |
| reviews | orderId | orders | _id | 1:1 必填 |
| reviews | userId | users | _id | N:1 必填 |
| reviews | workerId | workers | _id | N:1 必填 |
| reviews | categoryId | categories | _id | N:1 可选 |

---

## 安全规则设计

### 全局规则

```javascript
// 云函数安全规则（数据库操作统一走云函数）
// 客户端仅允许读取公开数据，敏感操作通过云函数鉴权

// 角色判断辅助函数
function getRole(openid) {
  const user = db.users.findOne({ _openid: openid });
  return user ? user.role : null;
}

function getWorkerId(openid) {
  const user = db.users.findOne({ _openid: openid });
  return user ? user.workerId : null;
}
```

### 各集合安全规则汇总

| 集合 | read权限 | write权限 | 说明 |
|------|---------|----------|------|
| users | 本人 + 工人/合作商 + 管理员 | 本人 | 开放给业务关联方读取 |
| workers | 本人 + 已认证公开 + 管理员 | 本人 + 未审核可修改 | 认证资料公开 |
| categories | 所有人 | 仅管理员 | 公开只读配置数据 |
| orders | 下单用户 + 接单工人 + 管理员 | 下单用户 + 接单工人 + 管理员 | 三方可见 |
| messages | 发送者 + 接收者 | 发送者 | 点对点私密 |
| posts | 已审核公开 + 本人 + 管理员 | 本人 + 管理员 | 审核后公开 |
| banners | 所有人 | 仅管理员 | 公开只读配置数据 |
| withdrawals | 申请人 + 管理员 | 申请人 + 管理员 | 敏感财务数据 |
| roleAccounts | 本人 | 本人 + 管理员 | 敏感凭证数据 |
| reviews | 所有人 | 评价者 + 被评价工人 | 评价公开，回复受限 |

### 安全最佳实践

1. **客户端直连限制**: 敏感操作（支付、提现、审核）必须通过云函数
2. **数据脱敏**: 手机号、身份证、银行卡号在返回前端时脱敏处理
3. **频率限制**: 登录失败5次锁定账号30分钟
4. **审计日志**: 所有资金操作记录操作人IP和时间
5. **软删除**: 所有核心业务集合使用isDeleted实现软删除

---

## 索引优化策略

### 高频查询场景与索引对照

| 业务场景 | 查询条件 | 推荐索引 | 预期性能 |
|---------|---------|---------|---------|
| 微信登录 | _openid | users._openid 唯一索引 | O(1) |
| 手机号登录 | phone | users.phone 唯一索引 | O(1) |
| 首页Banner | position+isShow | banners.position+sortOrder | O(1) |
| 服务分类列表 | level+status | categories.level+sortOrder | O(log n) |
| 附近工人 | location+serviceCategories | workers.location 2dsphere + serviceCategories | O(log n) |
| 工人列表（按分类） | serviceCategories+workStatus | workers.serviceCategories+workStatus+verifyStatus | O(log n) |
| 我的订单 | userId+status | users.userId+status+createTime | O(log n) |
| 工人的订单 | workerId+status | orders.workerId+status+createTime | O(log n) |
| 订单大厅（待接单） | status+serviceDate | orders.status+serviceDate+location | O(log n) |
| 聊天消息列表 | conversationId+seq | messages.conversationId+seq | O(log n) |
| 未读消息数 | receiverOpenid+isRead | messages.receiverOpenid+isRead | O(log n) |
| 内容列表 | postType+verifyStatus | posts.postType+verifyStatus+createTime | O(log n) |
| 工人评价 | workerId+createTime | reviews.workerId+createTime | O(log n) |
| 提现列表 | userId+status | withdrawals.userId+status+createTime | O(log n) |
| 审核列表 | verifyStatus+createTime | workers.verifyStatus+createTime | O(log n) |

### 索引优化建议

1. **覆盖索引**: 订单列表查询使用 `{userId:1, status:1, createTime:-1}` 覆盖常见查询，避免回表
2. **复合索引最左前缀**: 查询条件中带userId的优先使用复合索引
3. **地理索引**: 附近工人/附近订单查询使用2dsphere索引，注意MongoDB版本兼容性
4. **稀疏索引**: phone、workerId等可能为空的字段使用稀疏索引节省空间
5. **TTL索引**: 消息集合可考虑对软删除数据设置TTL自动清理（根据业务需求）
6. **索引监控**: 定期通过`.explain("executionStats")`分析慢查询，及时调整索引

### 分片策略（未来扩展）

```javascript
// 当数据量达到千万级时，建议按以下策略分片：

// orders — 按 userId 哈希分片（查询以用户维度为主）
sh.shardCollection("chunhui.orders", { "userId": "hashed" })

// messages — 按 conversationId 范围分片（会话消息集中在同一分片）
sh.shardCollection("chunhui.messages", { "conversationId": 1 })

// reviews — 按 workerId 哈希分片
sh.shardCollection("chunhui.reviews", { "workerId": "hashed" })
```

---

## 数据统计

| 统计项 | 数量 |
|--------|------|
| 集合总数 | **10** |
| 总字段数（去重） | **约 180+** |
| 索引总数 | **52** |
| 初始数据集合 | 2（categories、banners） |
| 外键关联数 | **16** |
| 状态机设计 | 2（orders、withdrawals） |
| 消息内容类型 | 6（text/voice/image/location/order/system） |
| 发布内容类型 | 2（job/marriage） |
| 角色类型 | 4（user/worker/partner/admin） |

---

## 附录：开发注意事项

### 1. _openid 处理
- `_openid` 是微信云开发自动注入的字段，客户端无法手动写入
- 查询时必须使用 `doc._openid == auth.openid` 做权限校验
- 云函数中可通过 `cloud.getWXContext()` 获取 openid

### 2. 金额存储
- 所有金额字段统一使用**分**为单位，避免浮点数精度问题
- 前端展示时转换为元（除以100）

### 3. 图片存储
- 图片先上传到云存储，获取 `cloud://` 或 `https://` 地址后存入数据库
- 建议图片URL使用云存储的CDN加速地址

### 4. 事务处理
- 涉及资金的操作（下单支付、提现、退款）必须使用云数据库事务
- 订单状态变更时同时写入 `statusFlow` 数组，保证可追溯

### 5. 数据迁移
- 新增字段时使用默认值兼容旧数据
- 字段重命名时先双写再迁移，避免服务中断
