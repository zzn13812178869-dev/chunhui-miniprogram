const app = getApp();

Page({
  data: {
    orderId: '',
    orderInfo: null,
    rating: 0,
    content: '',
    images: [],
    maxImages: 3,
    maxContentLength: 200,
    contentCount: 0,
    submitting: false,
    ratingLabels: ['', '非常差', '差', '一般', '好', '非常好']
  },

  onLoad(options) {
    const orderId = options.orderId || '';
    if (!orderId) {
      wx.showToast({ title: '订单参数缺失', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }
    this.setData({ orderId });
    this.loadOrderInfo(orderId);
  },

  loadOrderInfo(orderId) {
    wx.showLoading({ title: '加载中...' });
    wx.cloud.callFunction({
      name: 'getOrderDetail',
      data: { orderId },
      success: (res) => {
        wx.hideLoading();
        if (res.result && res.result.code === 0) {
          this.setData({ orderInfo: res.result.data });
        } else {
          wx.showToast({ title: res.result?.msg || '加载失败', icon: 'none' });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('加载订单失败:', err);
        wx.showToast({ title: '网络异常', icon: 'none' });
      }
    });
  },

  onRatingChange(e) {
    const rating = e.detail.score;
    this.setData({ rating });
  },

  onContentInput(e) {
    const content = e.detail.value || '';
    const contentCount = content.length;
    this.setData({ content, contentCount });
  },

  onImagesChange(e) {
    this.setData({ images: e.detail.images });
  },

  onSubmit() {
    const { orderId, rating, content, images, submitting } = this.data;
    if (submitting) return;

    if (rating <= 0) {
      wx.showToast({ title: '请选择评分', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    wx.showLoading({ title: '提交中...', mask: true });

    // 先上传图片到云存储
    this.uploadImages(images).then((imageUrls) => {
      return wx.cloud.callFunction({
        name: 'submitReview',
        data: {
          orderId,
          rating,
          content: content.trim(),
          images: imageUrls
        }
      });
    }).then((res) => {
      wx.hideLoading();
      this.setData({ submitting: false });
      if (res.result && res.result.code === 0) {
        wx.showToast({ title: '评价成功', icon: 'success' });
        setTimeout(() => {
          wx.redirectTo({
            url: `/pages/orderDetail/orderDetail?orderId=${orderId}`
          });
        }, 1200);
      } else {
        wx.showToast({ title: res.result?.msg || '提交失败', icon: 'none' });
      }
    }).catch((err) => {
      wx.hideLoading();
      this.setData({ submitting: false });
      console.error('提交评价失败:', err);
      wx.showToast({ title: '网络异常，请重试', icon: 'none' });
    });
  },

  uploadImages(images) {
    return new Promise((resolve) => {
      if (!images || images.length === 0) {
        resolve([]);
        return;
      }
      const uploadTasks = images.map((img, index) => {
        const filePath = img.path || img;
        const ext = filePath.match(/\.([^.]+)$/) ? RegExp.$1 : 'jpg';
        const cloudPath = `reviews/${Date.now()}_${index}.${ext}`;
        return wx.cloud.uploadFile({
          cloudPath,
          filePath
        }).then(res => res.fileID).catch(() => null);
      });
      Promise.all(uploadTasks).then((results) => {
        resolve(results.filter(id => id !== null));
      });
    });
  }
});
