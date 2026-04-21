// pages/about/about.js
const config = require('../../config');

Page({
  data: {
    platformName: config.servicePhone,
    version: '1.0.0',
    companyName: '春辉综合服务部',
    items: [
      { label: '平台名称', value: '春辉综合服务部' },
      { label: '版本号', value: '1.0.0' },
      { label: '客服电话', value: config.servicePhone },
      { label: '客服微信', value: config.serviceWxId },
      { label: '工作时间', value: '8:00 - 20:00' }
    ]
  },

  onLoad() {},

  onCopyPhone() {
    wx.setClipboardData({
      data: config.servicePhone,
      success: () => wx.showToast({ title: '已复制', icon: 'success' })
    });
  },

  onCallPhone() {
    wx.makePhoneCall({ phoneNumber: config.servicePhone });
  },

  onViewProtocol() {
    wx.showModal({
      title: '用户协议',
      content: '本协议是您与春辉综合服务部之间关于使用本平台服务的协议。\n\n1. 服务条款\n2. 隐私政策\n3. 免责声明\n4. 联系我们',
      showCancel: false
    });
  }
});
