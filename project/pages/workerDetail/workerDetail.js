const app = getApp();
const request = require('../../utils/request');

Page({
  data: {
    workerId: '',
    worker: null,
    reviews: [],
    loading: true,
    defaultAvatar: '/images/icons/default-avatar.png'
  },

  onLoad(options) {
    const workerId = options.workerId;
    this.setData({ workerId });
    this.loadWorkerDetail(workerId);
    this.loadReviews(workerId);
  },

  onPullDownRefresh() {
    this.loadWorkerDetail(this.data.workerId);
    this.loadReviews(this.data.workerId);
    wx.stopPullDownRefresh();
  },

  async loadWorkerDetail(workerId) {
    try {
      this.setData({ loading: true });
      const res = await request.call('getWorkerDetail', { workerId }, { showLoading: false });
      if (res.code === 0 && res.data) {
        this.setData({ worker: res.data.worker || res.data, loading: false });
      } else {
        this.loadMockData();
      }
    } catch (err) {
      this.loadMockData();
    }
  },

  async loadReviews(workerId) {
    try {
      const res = await request.call('getReviewList', { workerId }, { showLoading: false });
      if (res.code === 0) {
        this.setData({ reviews: res.data.list || [] });
      }
    } catch (err) {
      // 使用模拟评价
      this.setData({ reviews: [
        { id: '1', userName: '张女士', avatar: '', rating: 5, content: '服务非常好，打扫得很干净！', createTime: '2024-01-15' },
        { id: '2', userName: '李先生', avatar: '', rating: 4, content: '准时到达，态度很好。', createTime: '2024-01-10' }
      ]});
    }
  },

  loadMockData() {
    this.setData({
      worker: {
        id: this.data.workerId,
        name: '王师傅',
        avatar: '',
        rating: 4.8,
        orderCount: 128,
        experience: 5,
        bio: '专业保洁10年经验，服务态度好，客户满意度高。',
        skills: ['日常保洁', '深度清洁', '开荒保洁'],
        serviceAreas: ['东城区', '西城区'],
        pricing: [{ skill: '日常保洁', price: 50, unit: '小时' }, { skill: '深度清洁', price: 80, unit: '小时' }],
        phone: '138****8888'
      },
      loading: false
    });
  },

  onBookTap() {
    const { workerId } = this.data;
    wx.navigateTo({
      url: `/pages/orderCreate/orderCreate?workerId=${workerId}`
    });
  },

  onPhoneTap() {
    const phone = this.data.worker?.phone;
    if (phone) {
      wx.makePhoneCall({ phoneNumber: phone });
    }
  },

  onShareAppMessage() {
    const { worker } = this.data;
    return {
      title: `${worker?.name || '师傅'} - 春辉综合服务部`,
      path: `/pages/workerDetail/workerDetail?workerId=${this.data.workerId}`
    };
  }
});
