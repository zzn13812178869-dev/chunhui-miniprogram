const app = getApp();
const request = require('../../utils/request');

const CATEGORIES = [
  { id: 'all', name: '全部' },
  { id: 'clean', name: '日常保洁' },
  { id: 'deep_clean', name: '深度清洁' },
  { id: 'elderly', name: '养老陪护' },
  { id: 'nanny', name: '保姆月嫂' },
  { id: 'move', name: '搬家安装' },
  { id: 'water', name: '水电维修' },
  { id: 'appliance', name: '家电维修' },
  { id: 'wall', name: '墙面地面' },
  { id: 'door', name: '门窗维修' },
  { id: 'clock', name: '钟表维修' }
];

Page({
  data: {
    categories: CATEGORIES,
    activeCategory: 'all',
    workers: [],
    page: 1,
    pageSize: 20,
    total: 0,
    loading: false,
    hasMore: true,
    refreshing: false
  },

  onLoad(options) {
    const category = options.category || 'all';
    this.setData({ activeCategory: category });
    this.loadWorkers(true);
  },

  onPullDownRefresh() {
    this.setData({ refreshing: true, page: 1 });
    this.loadWorkers(true);
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 });
      this.loadWorkers(false);
    }
  },

  async loadWorkers(reset = false) {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    try {
      const { activeCategory, page, pageSize } = this.data;
      const location = app.globalData.location;
      
      const params = {
        page,
        pageSize,
        categoryId: activeCategory === 'all' ? '' : activeCategory
      };
      
      if (location.latitude && location.longitude) {
        params.latitude = location.latitude;
        params.longitude = location.longitude;
      }
      
      const res = await request.call('getWorkerList', params);
      
      if (res.code === 0) {
        const list = res.data.list || [];
        const total = res.data.total || 0;
        
        this.setData({
          workers: reset ? list : [...this.data.workers, ...list],
          total,
          hasMore: list.length === pageSize,
          loading: false,
          refreshing: false
        });
      } else {
        // 使用模拟数据
        this.loadMockWorkers(reset);
      }
    } catch (err) {
      console.error('加载工人列表失败:', err);
      this.loadMockWorkers(reset);
    }
  },

  loadMockWorkers(reset) {
    const mockWorkers = [
      { id: '1', name: '王师傅', avatar: '', distance: 800, tags: ['日常保洁', '深度清洁'], rating: 4.8, orderCount: 128 },
      { id: '2', name: '李阿姨', avatar: '', distance: 1200, tags: ['保姆月嫂', '养老陪护'], rating: 4.9, orderCount: 256 },
      { id: '3', name: '张师傅', avatar: '', distance: 500, tags: ['水电维修', '家电维修'], rating: 4.7, orderCount: 89 },
      { id: '4', name: '刘师傅', avatar: '', distance: 2000, tags: ['搬家安装'], rating: 4.6, orderCount: 67 },
      { id: '5', name: '陈阿姨', avatar: '', distance: 1500, tags: ['日常保洁'], rating: 4.9, orderCount: 312 }
    ];
    
    this.setData({
      workers: reset ? mockWorkers : [...this.data.workers, ...mockWorkers],
      hasMore: false,
      loading: false,
      refreshing: false
    });
  },

  // 切换分类
  onCategoryTap(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({ 
      activeCategory: id,
      page: 1,
      workers: []
    });
    this.loadWorkers(true);
  },

  // 工人卡片点击
  onWorkerTap(e) {
    const { id } = e.detail;
    wx.navigateTo({
      url: `/pages/workerDetail/workerDetail?workerId=${id}`
    });
  },

  // 预约按钮
  onBookTap(e) {
    const { id } = e.detail;
    wx.navigateTo({
      url: `/pages/orderCreate/orderCreate?workerId=${id}`
    });
  }
});
