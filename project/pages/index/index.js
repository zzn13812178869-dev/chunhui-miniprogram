const app = getApp();
const request = require('../../utils/request');
const util = require('../../utils/util');
const config = require('../../config');

Page({
  data: {
    // 导航栏状态
    navOpacity: 0,
    navBg: 'rgba(255,255,255,0)',
    searchBg: 'rgba(255,255,255,0.8)',
    
    // 位置信息
    location: {
      address: '选择位置',
      city: ''
    },
    
    // Banner数据
    banners: [],
    currentBanner: 0,
    
    // 金刚区服务
    homeServices: config.homeServices,
    
    // 同城头条
    newsList: config.defaultNews,
    
    // 服务橱窗版块
    serviceSections: config.serviceSections,
    
    // 加载状态
    loading: true,
    refresh: false
  },

  onLoad(options) {
    this.loadLocation();
    this.loadHomeData();
  },

  onShow() {
    // 刷新位置信息
    const appLoc = app.globalData.location;
    if (appLoc && appLoc.city) {
      this.setData({
        'location.address': appLoc.district || appLoc.city || '选择位置',
        'location.city': appLoc.city || ''
      });
    }
  },

  onPullDownRefresh() {
    this.setData({ refresh: true });
    this.loadHomeData();
    wx.stopPullDownRefresh();
  },

  onPageScroll(e) {
    const scrollTop = e.scrollTop;
    const threshold = 100;
    let opacity = 0;
    let navBg = 'rgba(255,255,255,0)';
    let searchBg = 'rgba(255,255,255,0.8)';

    if (scrollTop > 0) {
      opacity = Math.min(scrollTop / threshold, 1);
      navBg = `rgba(255,255,255,${opacity})`;
      searchBg = scrollTop > threshold ? '#F2F3F5' : 'rgba(255,255,255,0.8)';
    }

    this.setData({
      navOpacity: opacity,
      navBg,
      searchBg
    });
  },

  // 加载位置信息
  loadLocation() {
    const appLoc = app.globalData.location;
    if (appLoc && appLoc.city) {
      this.setData({
        'location.address': appLoc.district || appLoc.city,
        'location.city': appLoc.city
      });
    } else {
      // 使用默认值
      this.setData({
        'location.address': '高昌区',
        'location.city': '吐鲁番市'
      });
    }
  },

  // 加载首页数据
  async loadHomeData() {
    try {
      this.setData({ loading: true });
      
      // 并行加载Banner和分类
      const [bannerRes, categoryRes] = await Promise.all([
        request.call('getBannerList', {}).catch(() => ({ code: 0, data: { list: config.defaultBanners } })),
        request.call('getCategoryList', {}).catch(() => ({ code: 0, data: { list: [] } }))
      ]);

      const banners = (bannerRes.data && bannerRes.data.list) || config.defaultBanners;
      
      this.setData({
        banners,
        loading: false,
        refresh: false
      });
    } catch (err) {
      console.error('加载首页数据失败:', err);
      // 使用默认数据兜底
      this.setData({
        banners: config.defaultBanners,
        loading: false,
        refresh: false
      });
    }
  },

  // Banner切换
  onBannerChange(e) {
    this.setData({
      currentBanner: e.detail.current
    });
  },

  // 点击Banner
  onBannerTap(e) {
    const index = e.currentTarget.dataset.index;
    const banner = this.data.banners[index];
    if (banner && banner.link) {
      wx.navigateTo({ url: banner.link });
    }
  },

  // 选择位置
  onChooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        const address = res.name || res.address;
        app.globalData.location = {
          latitude: res.latitude,
          longitude: res.longitude,
          address: address,
          city: res.city || app.globalData.location.city
        };
        this.setData({
          'location.address': address
        });
        // 刷新附近服务
        this.loadHomeData();
      },
      fail: (err) => {
        if (err.errMsg && err.errMsg.includes('fail auth')) {
          wx.showModal({
            title: '需要位置权限',
            content: '请在设置中开启位置权限',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting();
              }
            }
          });
        }
      }
    });
  },

  // 点击搜索框
  onSearchTap() {
    wx.navigateTo({
      url: '/pages/searchResult/searchResult'
    });
  },

  // 金刚区服务点击
  onServiceTap(e) {
    const { id, url } = e.currentTarget.dataset;
    if (url) {
      wx.navigateTo({ url });
    } else {
      wx.navigateTo({
        url: `/pages/services/services?category=${id}`
      });
    }
  },

  // 资讯点击
  onNewsTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.showToast({ title: '资讯详情开发中', icon: 'none' });
  },

  // 服务橱窗卡片点击
  onSectionItemTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/services/services?category=${id}`
    });
  },

  // 查看更多
  onViewMore(e) {
    const { title } = e.currentTarget.dataset;
    if (title === '家政服务') {
      wx.navigateTo({ url: '/pages/services/services?category=clean' });
    } else if (title === '维修安装') {
      wx.navigateTo({ url: '/pages/services/services?category=repair' });
    } else if (title === '便民信息') {
      wx.switchTab({ url: '/pages/services/services' });
    }
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '春辉综合服务部 - 本地生活服务',
      path: '/pages/index/index'
    };
  }
});
