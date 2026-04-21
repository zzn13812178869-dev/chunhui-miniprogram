const config = require('../../config');

Component({
  properties: {},
  data: {
    showMenu: false
  },
  methods: {
    onTap() {
      this.setData({ showMenu: true });
    },
    onMaskTap() {
      this.setData({ showMenu: false });
    },
    onCallPhone() {
      wx.makePhoneCall({
        phoneNumber: config.servicePhone,
        fail: () => wx.showToast({ title: '拨号失败', icon: 'none' })
      });
      this.setData({ showMenu: false });
    },
    onCopyWx() {
      wx.setClipboardData({
        data: config.serviceWxId,
        success: () => wx.showToast({ title: '已复制客服微信', icon: 'success' })
      });
      this.setData({ showMenu: false });
    }
  }
});
