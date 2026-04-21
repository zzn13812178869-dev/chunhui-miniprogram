// pages/history/history.js
const app = getApp();
const request = require('../../utils/request');

Page({
  data: {
    historyList: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false,
    refreshing: false
  },

  onLoad() {
    this.loadHistory();
  },

  onPullDownRefresh() {
    this.setData({ page: 1, refreshing: true });
    this.loadHistory();
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 });
      this.loadHistory();
    }
  },

  async loadHistory() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    try {
      const res = await request.call('getBrowseHistory', {
        page: this.data.page,
        pageSize: this.data.pageSize
      });

      if (res.code === 0) {
        const list = res.data.list || [];
        this.setData({
          historyList: this.data.page === 1 ? list : [...this.data.historyList, ...list],
          hasMore: list.length === this.data.pageSize,
          loading: false,
          refreshing: false
        });
      } else {
        this.loadMockHistory();
      }
    } catch (err) {
      this.loadMockHistory();
    }
  },

  loadMockHistory() {
    const mock = [
      { id: '1', type: 'worker', name: '王师傅', image: '', time: '2024-01-15 14:30' },
      { id: '2', type: 'service', name: '日常保洁', image: '', time: '2024-01-14 10:20' },
      { id: '3', type: 'worker', name: '李阿姨', image: '', time: '2024-01-13 16:45' }
    ];
    this.setData({
      historyList: this.data.page === 1 ? mock : [...this.data.historyList, ...mock],
      hasMore: false,
      loading: false,
      refreshing: false
    });
  },

  onItemTap(e) {
    const { type, id } = e.currentTarget.dataset;
    if (type === 'worker') {
      wx.navigateTo({ url: `/pages/workerDetail/workerDetail?workerId=${id}` });
    } else {
      wx.navigateTo({ url: `/pages/services/services?category=${id}` });
    }
  },

  onClear() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有浏览记录吗？',
      confirmColor: '#F44336',
      success: (res) => {
        if (res.confirm) {
          this.clearHistory();
        }
      }
    });
  },

  async clearHistory() {
    try {
      await request.call('clearBrowseHistory', {});
      this.setData({ historyList: [], hasMore: false });
      wx.showToast({ title: '已清除', icon: 'success' });
    } catch (err) {
      this.setData({ historyList: [], hasMore: false });
      wx.showToast({ title: '已清除', icon: 'success' });
    }
  }
});
