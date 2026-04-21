/**
 * 权限检查工具
 * 检查用户是否有权限执行某项操作
 */

const config = require('../config');

/**
 * 检查当前角色是否有权限
 * @param {string} requiredRole - 需要的角色
 * @returns {boolean}
 */
function hasRole(requiredRole) {
  const app = getApp();
  const currentRole = app.globalData.userRole;
  
  // 管理员拥有所有权限
  if (currentRole === config.roles.ADMIN) return true;
  
  // 角色匹配
  if (currentRole === requiredRole) return true;
  
  // 用户角色可以使用基础功能
  if (requiredRole === config.roles.USER) return true;
  
  return false;
}

/**
 * 检查是否已登录
 * @returns {boolean}
 */
function isLoggedIn() {
  const app = getApp();
  return app.globalData.isLogin;
}

/**
 * 检查是否是管理员
 * @returns {boolean}
 */
function isAdmin() {
  const app = getApp();
  return app.globalData.userRole === config.roles.ADMIN;
}

/**
 * 检查是否是工人
 * @returns {boolean}
 */
function isWorker() {
  const app = getApp();
  return app.globalData.userRole === config.roles.WORKER;
}

/**
 * 检查是否是合作商
 * @returns {boolean}
 */
function isPartner() {
  const app = getApp();
  return app.globalData.userRole === config.roles.PARTNER;
}

/**
 * 检查是否拥有指定角色
 * @param {string} role
 * @returns {boolean}
 */
function hasSpecificRole(role) {
  const app = getApp();
  return app.globalData.roles.includes(role);
}

/**
 * 检查是否有某角色的操作权限
 * 用于页面级别的权限控制
 * @param {string} pageRole - 页面需要的角色
 * @returns {object} { allowed: boolean, redirect?: string }
 */
function checkPagePermission(pageRole) {
  if (!isLoggedIn()) {
    return { allowed: false, redirect: 'login' };
  }
  
  if (!hasRole(pageRole)) {
    return { allowed: false, redirect: 'unauthorized' };
  }
  
  return { allowed: true };
}

/**
 * 要求登录，未登录时跳转
 * @returns {boolean} 是否已登录
 */
function requireLogin() {
  if (!isLoggedIn()) {
    wx.showModal({
      title: '提示',
      content: '请先登录后再操作',
      confirmText: '去登录',
      confirmColor: '#43A047',
      success: (res) => {
        if (res.confirm) {
          // 可以在这里跳转到登录页
          wx.switchTab({ url: '/pages/mine/mine' });
        }
      }
    });
    return false;
  }
  return true;
}

/**
 * 获取权限描述文本
 * @param {string} role
 * @returns {string}
 */
function getRoleText(role) {
  const roleMap = {
    [config.roles.USER]: '普通用户',
    [config.roles.WORKER]: '工人师傅',
    [config.roles.PARTNER]: '合作商',
    [config.roles.ADMIN]: '管理员'
  };
  return roleMap[role] || '未知角色';
}

/**
 * 获取权限描述颜色
 * @param {string} role
 * @returns {string}
 */
function getRoleColor(role) {
  const colorMap = {
    [config.roles.USER]: '#999999',
    [config.roles.WORKER]: '#1976D2',
    [config.roles.PARTNER]: '#43A047',
    [config.roles.ADMIN]: '#D32F2F'
  };
  return colorMap[role] || '#999999';
}

module.exports = {
  hasRole,
  isLoggedIn,
  isAdmin,
  isWorker,
  isPartner,
  hasSpecificRole,
  checkPagePermission,
  requireLogin,
  getRoleText,
  getRoleColor
};
