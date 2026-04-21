// pages/newsDetail/newsDetail.js
const request = require('../../utils/request');

Page({
  data: {
    newsId: '',
    detail: null,
    loading: true
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ newsId: id });
      this.loadDetail(id);
      this.incrementView(id);
    }
  },

  async loadDetail(newsId) {
    try {
      const res = await request.call('getNewsDetail', { newsId });
      if (res.code === 0) {
        this.setData({ detail: res.data.detail, loading: false });
      } else {
        this.setData({ loading: false });
        wx.showToast({ title: '加载失败', icon: 'none' });
      }
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  async incrementView(newsId) {
    try {
      await request.call('incrementNewsView', { newsId });
    } catch (err) {
      console.warn('增加阅读量失败:', err);
    }
  },

  onShareAppMessage() {
    return {
      title: this.data.detail?.title || '资讯详情',
      path: `/pages/newsDetail/newsDetail?id=${this.data.newsId}`
    };
  }
});
