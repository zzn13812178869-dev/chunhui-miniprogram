const app = getApp();
const request = require('../../utils/request');
const util = require('../../utils/util');
const config = require('../../config');

Page({
  data: {
    userInfo: null,
    userRole: 'user',
    defaultAvatar: '/images/icons/default-avatar.png',
    
    // 身份切换弹窗
    showRoleSheet: false,
    showPasswordModal: false,
    selectedRole: '',
    accountInput: '',
    passwordInput: '',
    
    // 角色选项
    roleOptions: [
      { value: 'user', label: '我是用户', desc: '浏览预约' },
      { value: 'worker', label: '我是工人/师傅', desc: '发布职业、接单抢单' },
      { value: 'partner', label: '我是合作商', desc: '发布招聘/婚恋信息' },
      { value: 'admin', label: '我是管理员', desc: '进入后台管理' }
    ],
    
    // 普通用户菜单
    userMenus: [
      { icon: '/images/icons/order.png', label: '我的订单', url: '/pages/orders/orders' },
      { icon: '/images/icons/history.png', label: '浏览记录', url: '' },
      { icon: '/images/icons/service.png', label: '我的客服', action: 'contact' },
      { icon: '/images/icons/about.png', label: '关于我们', url: '' }
    ],
    
    // 工人菜单
    workerMenus: [
      { icon: '/images/icons/profile.png', label: '我的职业信息', url: '/pages/workerProfile/workerProfile' },
      { icon: '/images/icons/hall.png', label: '接单大厅', url: '/pages/orderHall/orderHall' },
      { icon: '/images/icons/order.png', label: '我的订单', url: '/pages/orders/orders' },
      { icon: '/images/icons/income.png', label: '收益统计', url: '/pages/income/income' },
      { icon: '/images/icons/message.png', label: '消息中心', url: '/pages/chatList/chatList' }
    ],
    
    // 合作商菜单
    partnerMenus: [
      { icon: '/images/icons/publish.png', label: '发布信息', url: '/pages/publish/publish' },
      { icon: '/images/icons/my-posts.png', label: '我的发布', url: '/pages/myPosts/myPosts' },
      { icon: '/images/icons/income.png', label: '收益统计', url: '/pages/income/income' },
      { icon: '/images/icons/withdraw.png', label: '申请提现', url: '/pages/withdrawApply/withdrawApply' }
    ],
    
    // 管理员菜单
    adminMenus: [
      { icon: '/images/icons/users.png', label: '用户管理', url: '/pages/userManage/userManage' },
      { icon: '/images/icons/workers.png', label: '工人管理', url: '/pages/workerManage/workerManage' },
      { icon: '/images/icons/partners.png', label: '合作商管理', url: '/pages/partnerCenter/partnerCenter' },
      { icon: '/images/icons/orders.png', label: '订单管理', url: '/pages/orderManage/orderManage' },
      { icon: '/images/icons/posts.png', label: '发布管理', url: '/pages/postManage/postManage' },
      { icon: '/images/icons/withdraw.png', label: '提现审核', url: '/pages/withdrawManage/withdrawManage' },
      { icon: '/images/icons/banner.png', label: 'Banner管理', url: '/pages/bannerManage/bannerManage' },
      { icon: '/images/icons/settings.png', label: '系统设置', url: '' }
    ],
    
    // 动画
    menuAnimating: false
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    this.loadUserInfo();
  },

  onPullDownRefresh() {
    this.loadUserInfo();
    wx.stopPullDownRefresh();
  },

  loadUserInfo() {
    const userInfo = app.globalData.userInfo;
    const userRole = app.globalData.userRole || 'user';
    
    this.setData({
      userInfo,
      userRole
    });
  },

  // ===== 头像操作 =====
  
  onAvatarTap() {
    // 短按：上传头像
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.uploadAvatar(tempFilePath);
      }
    });
  },

  onAvatarLongPress() {
    // 长按：触发身份切换
    wx.vibrateShort({ type: 'light' });
    this.setData({ showRoleSheet: true });
  },

  async uploadAvatar(filePath) {
    try {
      wx.showLoading({ title: '上传中...' });
      const res = await request.call('uploadImage', { filePath });
      if (res.code === 0) {
        const fileID = res.data.fileID;
        // 更新用户信息
        await request.call('updateUserInfo', { avatarUrl: fileID });
        
        const userInfo = { ...this.data.userInfo, avatarUrl: fileID };
        app.updateGlobalUserInfo(userInfo);
        this.setData({ userInfo });
        wx.showToast({ title: '上传成功', icon: 'success' });
      }
    } catch (err) {
      wx.showToast({ title: '上传失败', icon: 'none' });
    }
  },

  // ===== 昵称编辑 =====
  
  onNicknameTap() {
    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入新昵称',
      confirmColor: '#43A047',
      success: async (res) => {
        if (res.confirm && res.content) {
          try {
            await request.call('updateUserInfo', { nickName: res.content });
            const userInfo = { ...this.data.userInfo, nickName: res.content };
            app.updateGlobalUserInfo(userInfo);
            this.setData({ userInfo });
            wx.showToast({ title: '修改成功', icon: 'success' });
          } catch (err) {
            wx.showToast({ title: '修改失败', icon: 'none' });
          }
        }
      }
    });
  },

  // ===== 身份切换 =====
  
  // 选择角色
  onRoleSelect(e) {
    const { value } = e.currentTarget.dataset;
    this.setData({
      showRoleSheet: false,
      showPasswordModal: true,
      selectedRole: value,
      accountInput: '',
      passwordInput: ''
    });
  },

  // 关闭角色选择
  onRoleSheetClose() {
    this.setData({ showRoleSheet: false });
  },

  // 账号输入
  onAccountInput(e) {
    this.setData({ accountInput: e.detail.value });
  },

  // 密码输入
  onPasswordInput(e) {
    this.setData({ passwordInput: e.detail.value });
  },

  // 确认切换
  async onRoleSwitchConfirm() {
    const { selectedRole, accountInput, passwordInput } = this.data;
    
    if (!accountInput || !passwordInput) {
      wx.showToast({ title: '请输入账号和密码', icon: 'none' });
      return;
    }
    
    wx.showLoading({ title: '验证中...', mask: true });
    
    try {
      const res = await request.call('roleSwitch', {
        role: selectedRole,
        account: accountInput,
        password: passwordInput
      });
      
      wx.hideLoading();
      
      if (res.code === 0) {
        // 切换成功
        app.switchRole(selectedRole);
        this.setData({
          showPasswordModal: false,
          userRole: selectedRole,
          menuAnimating: true
        });
        
        wx.showToast({ 
          title: `已切换为${this.getRoleLabel(selectedRole)}`, 
          icon: 'success' 
        });
        
        // 动画结束
        setTimeout(() => {
          this.setData({ menuAnimating: false });
        }, 300);
      } else {
        wx.showToast({ title: res.message || '切换失败', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      // 模拟成功（开发阶段）
      app.switchRole(selectedRole);
      this.setData({
        showPasswordModal: false,
        userRole: selectedRole,
        menuAnimating: true
      });
      
      wx.showToast({ 
        title: `已切换为${this.getRoleLabel(selectedRole)}`, 
        icon: 'success' 
      });
      
      setTimeout(() => {
        this.setData({ menuAnimating: false });
      }, 300);
    }
  },

  // 取消切换
  onRoleSwitchCancel() {
    this.setData({ showPasswordModal: false });
  },

  getRoleLabel(role) {
    const map = { user: '普通用户', worker: '工人师傅', partner: '合作商', admin: '管理员' };
    return map[role] || role;
  },

  // ===== 菜单点击 =====
  
  onMenuTap(e) {
    const { url, action } = e.currentTarget.dataset;
    
    if (action === 'contact') {
      // 联系客服
      wx.showActionSheet({
        itemList: ['拨打客服电话', '复制微信客服号'],
        success: (res) => {
          if (res.tapIndex === 0) {
            wx.makePhoneCall({ phoneNumber: config.servicePhone });
          } else {
            wx.setClipboardData({
              data: config.serviceWxId,
              success: () => wx.showToast({ title: '已复制', icon: 'success' })
            });
          }
        }
      });
    } else if (url) {
      wx.navigateTo({ url });
    } else {
      wx.showToast({ title: '功能开发中', icon: 'none' });
    }
  },

  // ===== 分享 =====
  onShareAppMessage() {
    return {
      title: '春辉综合服务部',
      path: '/pages/index/index'
    };
  }
});
