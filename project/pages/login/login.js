// pages/login/login.js
const app = getApp();
const request = require('../../utils/request');

Page({
  data: {
    // 登录方式：wx-微信授权 / phone-手机号
    loginType: 'wx',
    // 手机号登录
    phone: '',
    code: '',
    counting: false,
    countDown: 60,
    // 用户协议
    agreeProtocol: false,
    // 加载状态
    loading: false
  },

  onLoad(options) {
    // 检查是否已登录
    if (app.globalData.isLogin) {
      wx.switchTab({ url: '/pages/index/index' });
      return;
    }
  },

  // 切换登录方式
  onSwitchType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ loginType: type });
  },

  // 微信授权登录
  async onWxLogin() {
    if (!this.data.agreeProtocol) {
      wx.showToast({ title: '请先同意用户协议', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    try {
      // 1. 获取微信登录code
      const loginRes = await wx.login();
      
      // 2. 获取用户信息（可选，新版微信需要用户主动授权）
      let userInfo = {};
      try {
        const profileRes = await wx.getUserProfile({
          desc: '用于完善用户资料'
        });
        userInfo = profileRes.userInfo;
      } catch (err) {
        console.log('用户拒绝授权头像昵称');
      }

      // 3. 调用云函数登录
      const res = await request.call('login', {
        code: loginRes.code,
        userInfo
      });

      if (res.code === 0) {
        const { userInfo: serverUserInfo, isNewUser } = res.data;
        
        // 更新全局状态
        app.updateGlobalUserInfo(serverUserInfo);
        
        wx.showToast({ 
          title: isNewUser ? '注册成功' : '登录成功', 
          icon: 'success' 
        });

        // 跳转首页
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' });
        }, 1000);
      } else {
        wx.showToast({ title: res.message || '登录失败', icon: 'none' });
      }
    } catch (err) {
      console.error('登录失败:', err);
      wx.showToast({ title: '登录失败，请重试', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 获取手机号
  async onGetPhoneNumber(e) {
    if (e.detail.errMsg.includes('fail')) {
      wx.showToast({ title: '请授权手机号', icon: 'none' });
      return;
    }

    const { encryptedData, iv } = e.detail;
    
    try {
      this.setData({ loading: true });
      
      const res = await request.call('login', {
        encryptedData,
        iv
      });

      if (res.code === 0) {
        app.updateGlobalUserInfo(res.data.userInfo);
        wx.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' });
        }, 1000);
      }
    } catch (err) {
      wx.showToast({ title: '登录失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 输入手机号
  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },

  // 发送验证码
  async onSendCode() {
    const { phone } = this.data;
    if (!phone || phone.length !== 11) {
      wx.showToast({ title: '请输入正确手机号', icon: 'none' });
      return;
    }

    // 模拟发送验证码
    wx.showToast({ title: '验证码已发送', icon: 'success' });
    
    this.setData({ counting: true });
    let count = 60;
    const timer = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(timer);
        this.setData({ counting: false, countDown: 60 });
      } else {
        this.setData({ countDown: count });
      }
    }, 1000);
  },

  // 输入验证码
  onCodeInput(e) {
    this.setData({ code: e.detail.value });
  },

  // 手机号登录
  async onPhoneLogin() {
    if (!this.data.agreeProtocol) {
      wx.showToast({ title: '请先同意用户协议', icon: 'none' });
      return;
    }

    const { phone, code } = this.data;
    if (!phone || !code) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    try {
      // 模拟登录
      const mockUser = {
        _openid: 'mock_openid_' + Date.now(),
        nickName: `用户_${phone.slice(-4)}`,
        avatarUrl: '',
        phone,
        role: 'user',
        roles: ['user']
      };

      app.updateGlobalUserInfo(mockUser);
      wx.showToast({ title: '登录成功', icon: 'success' });
      
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' });
      }, 1000);
    } catch (err) {
      wx.showToast({ title: '登录失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 勾选协议
  onAgreeChange(e) {
    this.setData({ agreeProtocol: e.detail.value.length > 0 });
  },

  // 查看协议
  onViewProtocol() {
    wx.showModal({
      title: '用户协议与隐私政策',
      content: '本协议是用户与春辉综合服务部之间关于使用本平台服务的协议...',
      showCancel: false
    });
  }
});