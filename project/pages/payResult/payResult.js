const app = getApp();

Page({
  data: {
    orderId: '',
    status: '',
    orderInfo: null,
    loading: true
  },

  onLoad(options) {
    const orderId = options.orderId || '';
    const status = options.status || 'success';
    this.setData({ orderId, status });
    this.loadOrderInfo(orderId);
  },

  loadOrderInfo(orderId) {
    if (!orderId) {
      this.setData({ loading: false });
      return;
    }
    wx.cloud.callFunction({
      name: 'getOrderDetail',
      data: { orderId },
      success: (res) => {
        if (res.result && res.result.code === 0) {
          this.setData({ orderInfo: res.result.data, loading: false });
        } else {
          this.setData({ loading: false });
        }
      },
      fail: () => {
        this.setData({ loading: false });
      }
    });
  },

  onGoHome() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  onViewOrder() {
    const { orderId } = this.data;
    wx.redirectTo({
      url: `/pages/orderDetail/orderDetail?orderId=${orderId}`
    });
  },

  onRetryPay() {
    const { orderId } = this.data;
    wx.redirectTo({
      url: `/pages/orderDetail/orderDetail?orderId=${orderId}&action=pay`
    });
  }
});
