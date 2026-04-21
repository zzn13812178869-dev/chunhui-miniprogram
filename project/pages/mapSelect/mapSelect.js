// pages/mapSelect/mapSelect.js
Page({
  data: {
    latitude: 39.9042,
    longitude: 116.4074,
    address: '',
    name: '',
    markers: []
  },

  onLoad() {
    this.chooseLocation();
  },

  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          address: res.address,
          name: res.name || res.address,
          markers: [{
            id: 1,
            latitude: res.latitude,
            longitude: res.longitude,
            title: res.name
          }]
        });
      },
      fail: (err) => {
        if (err.errMsg?.includes('cancel')) {
          wx.navigateBack();
        }
      }
    });
  },

  onConfirm() {
    const { latitude, longitude, address, name } = this.data;
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage && prevPage.onAddressSelect) {
      prevPage.onAddressSelect({ latitude, longitude, address, name });
    }
    wx.navigateBack();
  },

  onCancel() {
    wx.navigateBack();
  }
});
