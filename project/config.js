// 全局配置
const config = {
  // 云开发环境ID（请替换为你的实际环境ID）
  cloudEnvId: 'your-cloud-env-id',

  // 腾讯位置服务Key（请替换为你的实际Key）
  tencentMapKey: 'YOUR-TENCENT-MAP-KEY',

  // 客服电话
  servicePhone: '400-888-8888',

  // 微信客服ID
  serviceWxId: 'chunhui_kefu',

  // 分页配置
  pageSize: 20,

  // 上传配置
  upload: {
    maxImageSize: 5 * 1024 * 1024, // 5MB
    maxImageCount: 9,
    allowedImageTypes: ['jpg', 'jpeg', 'png', 'gif']
  },

  // 订单状态
  orderStatus: {
    PENDING: 'pending',       // 待接单
    ACCEPTED: 'accepted',     // 已接单
    SERVING: 'serving',       // 服务中
    COMPLETED: 'completed',   // 已完成
    CANCELLED: 'cancelled',   // 已取消
    REVIEWED: 'reviewed'      // 已评价
  },

  // 订单状态文本映射
  orderStatusText: {
    pending: '待接单',
    accepted: '已接单',
    serving: '服务中',
    completed: '已完成',
    cancelled: '已取消',
    reviewed: '已评价'
  },

  // 工人认证状态
  certificationStatus: {
    PENDING: 'pending',       // 待审核
    APPROVED: 'approved',     // 已通过
    REJECTED: 'rejected'      // 已拒绝
  },

  // 发布内容类型
  postType: {
    JOB: 'job',               // 招聘求职
    MARRIAGE: 'marriage'      // 婚恋介绍
  },

  // 提现状态
  withdrawStatus: {
    PENDING: 'pending',       // 待审核
    APPROVED: 'approved',     // 已通过
    REJECTED: 'rejected',     // 已拒绝
    COMPLETED: 'completed'    // 已到账
  },

  // 角色定义
  roles: {
    USER: 'user',
    WORKER: 'worker',
    PARTNER: 'partner',
    ADMIN: 'admin'
  },

  // 金刚区服务配置
  homeServices: [
    { id: 'clean', name: '保洁清洗', icon: '/images/icons/clean.png', url: '/pages/services/services?category=clean' },
    { id: 'nanny', name: '保姆月嫂', icon: '/images/icons/nanny.png', url: '/pages/services/services?category=nanny' },
    { id: 'elderly', name: '养老陪护', icon: '/images/icons/elderly.png', url: '/pages/services/services?category=elderly' },
    { id: 'move', name: '搬家安装', icon: '/images/icons/move.png', url: '/pages/services/services?category=move' },
    { id: 'appliance', name: '家电维修', icon: '/images/icons/appliance.png', url: '/pages/services/services?category=appliance' },
    { id: 'water', name: '水电维修', icon: '/images/icons/water.png', url: '/pages/services/services?category=water' },
    { id: 'marriage', name: '婚姻介绍', icon: '/images/icons/marriage.png', url: '/pages/services/services?category=marriage' },
    { id: 'job', name: '招工招聘', icon: '/images/icons/job.png', url: '/pages/services/services?category=job' }
  ],

  // 服务橱窗版块配置
  serviceSections: [
    {
      title: '家政服务',
      color: '#E8F5E9',
      items: [
        { id: 'clean', name: '保洁清洗', desc: '日常保洁、深度清洁', icon: '/images/icons/clean-3d.png' },
        { id: 'nanny', name: '保姆月嫂', desc: '专业护理、贴心照顾', icon: '/images/icons/nanny-3d.png' },
        { id: 'elderly', name: '养老陪护', desc: '陪伴关爱、生活照料', icon: '/images/icons/elderly-3d.png' }
      ]
    },
    {
      title: '维修安装',
      color: '#E0F2F1',
      items: [
        { id: 'move', name: '搬家安装', desc: '安全搬运、专业安装', icon: '/images/icons/move-3d.png' },
        { id: 'appliance', name: '家电维修', desc: '快速上门、精准维修', icon: '/images/icons/appliance-3d.png' }
      ]
    },
    {
      title: '便民信息',
      color: '#FCE4EC',
      items: [
        { id: 'marriage', name: '婚姻介绍', desc: '缘来是你、幸福牵线', icon: '/images/icons/marriage-3d.png' },
        { id: 'job', name: '招工招聘', desc: '本地招聘、快速上岗', icon: '/images/icons/job-3d.png' }
      ]
    }
  ],

  // 初始Banner数据
  defaultBanners: [
    { id: '1', imageUrl: '/images/banners/banner1.jpg', title: '专业搬家服务', link: '', sortOrder: 1 },
    { id: '2', imageUrl: '/images/banners/banner2.jpg', title: '家政保洁特惠', link: '', sortOrder: 2 },
    { id: '3', imageUrl: '/images/banners/banner3.jpg', title: '企业招聘季', link: '', sortOrder: 3 }
  ],

  // 初始资讯数据
  defaultNews: [
    { id: '1', title: '每日金句: 活在当下', tag: '金句', color: '#FF9800' },
    { id: '2', title: '油价调整通知', tag: '生活', color: '#43A047' },
    { id: '3', title: '本周家政市场行情', tag: '资讯', color: '#2196F3' }
  ]
};

module.exports = config;
