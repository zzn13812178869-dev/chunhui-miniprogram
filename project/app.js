const config = require('./config');

App({
  globalData: {
    userInfo: null,
    userRole: 'user',
    roles: ['user'],
    location: {
      latitude: null,
      longitude: null,
      address: '',
      city: '',
      district: ''
    },
    systemInfo: null,
    unreadCount: 0,
    isLogin: false,
    envId: config.cloudEnvId
  },

  onLaunch() {
    console.log('App Launch');
    
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用云开发功能，请升级到最新版本。',
        showCancel: false
      });
      return;
    }
    
    wx.cloud.init({
      env: config.cloudEnvId,
      traceUser: true
    });

    // 获取系统信息
    this.getSystemInfo();

    // 检查本地存储的登录态
    this.checkLoginStatus();

    // 获取用户位置
    this.getUserLocation();
  },

  onShow() {
    console.log('App Show');
    // 刷新未读消息数
    if (this.globalData.isLogin) {
      this.refreshUnreadCount();
    }
  },

  onHide() {
    console.log('App Hide');
  },

  onError(msg) {
    console.error('App Error:', msg);
  },

  // 获取系统信息
  getSystemInfo() {
    const that = this;
    wx.getSystemInfo({
      success(res) {
        that.globalData.systemInfo = res;
      }
    });
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    const userRole = wx.getStorageSync('userRole') || 'user';
    const roles = wx.getStorageSync('roles') || ['user'];
    
    if (userInfo) {
      this.globalData.userInfo = userInfo;
      this.globalData.userRole = userRole;
      this.globalData.roles = roles;
      this.globalData.isLogin = true;
    }
  },

  // 获取用户位置
  getUserLocation() {
    const that = this;
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        that.globalData.location.latitude = res.latitude;
        that.globalData.location.longitude = res.longitude;
        // 逆地址解析
        that.reverseGeocoder(res.latitude, res.longitude);
      },
      fail(err) {
        console.warn('获取位置失败:', err);
        // 使用默认位置
        that.globalData.location.city = '未知城市';
      }
    });
  },

  // 逆地址解析
  reverseGeocoder(latitude, longitude) {
    const that = this;
    const key = config.tencentMapKey;
    if (!key) return;
    
    wx.request({
      url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${key}`,
      success(res) {
        if (res.data && res.data.status === 0) {
          const adInfo = res.data.result.ad_info;
          const address = res.data.result.address;
          that.globalData.location.city = adInfo.city || '';
          that.globalData.location.district = adInfo.district || '';
          that.globalData.location.address = address || '';
        }
      },
      fail(err) {
        console.warn('逆地址解析失败:', err);
      }
    });
  },

  // 刷新未读消息数
  refreshUnreadCount() {
    const that = this;
    wx.cloud.callFunction({
      name: 'getChatList',
      success(res) {
        if (res.result && res.result.code === 0) {
          const list = res.result.data || [];
          let count = 0;
          list.forEach(item => {
            count += item.unreadCount || 0;
          });
          that.globalData.unreadCount = count;
          // 更新TabBar红点
          if (count > 0) {
            wx.setTabBarBadge({
              index: 2,
              text: String(count > 99 ? '99+' : count)
            }).catch(() => {});
          } else {
            wx.removeTabBarBadge({ index: 2 }).catch(() => {});
          }
        }
      },
      fail(err) {
        console.warn('获取未读消息失败:', err);
      }
    });
  },

  // 更新全局用户信息
  updateGlobalUserInfo(userInfo) {
    this.globalData.userInfo = userInfo;
    this.globalData.userRole = userInfo.role || 'user';
    this.globalData.roles = userInfo.roles || ['user'];
    this.globalData.isLogin = true;
    
    wx.setStorageSync('userInfo', userInfo);
    wx.setStorageSync('userRole', userInfo.role || 'user');
    wx.setStorageSync('roles', userInfo.roles || ['user']);
  },

  // 切换角色
  switchRole(newRole) {
    this.globalData.userRole = newRole;
    wx.setStorageSync('userRole', newRole);
    // 刷新当前页面
    const pages = getCurrentPages();
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1];
      if (currentPage.onLoad) {
        currentPage.onLoad(currentPage.options);
      }
    }
  },

  // 退出登录
  logout() {
    this.globalData.userInfo = null;
    this.globalData.userRole = 'user';
    this.globalData.roles = ['user'];
    this.globalData.isLogin = false;
    this.globalData.unreadCount = 0;
    
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('userRole');
    wx.removeStorageSync('roles');
    wx.removeStorageSync('token');
  }
});
