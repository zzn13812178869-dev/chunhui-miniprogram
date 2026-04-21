/**
 * 云函数调用封装
 * 统一处理错误、加载状态、网络异常
 */

const config = require('../config');

/**
 * 调用云函数
 * @param {string} name - 云函数名称
 * @param {object} data - 请求参数
 * @param {object} options - 可选配置 { showLoading: boolean, loadingText: string }
 * @returns {Promise} - 返回云函数执行结果
 */
function callCloudFunction(name, data = {}, options = {}) {
  return new Promise((resolve, reject) => {
    // 显示加载提示
    if (options.showLoading !== false) {
      wx.showLoading({
        title: options.loadingText || '加载中...',
        mask: true
      });
    }

    wx.cloud.callFunction({
      name,
      data,
      success: (res) => {
        wx.hideLoading();
        
        const result = res.result;
        
        // 统一错误码处理
        if (result && result.code !== 0) {
          // 特殊错误码处理
          if (result.code === 401) {
            // 未登录或登录过期
            wx.showToast({ title: '请先登录', icon: 'none' });
            // 清除登录态
            const app = getApp();
            app.logout();
            return;
          }
          
          if (result.code === 403) {
            wx.showToast({ title: '没有操作权限', icon: 'none' });
            reject(new Error(result.message || '权限不足'));
            return;
          }
          
          if (result.code === 404) {
            wx.showToast({ title: result.message || '数据不存在', icon: 'none' });
            reject(new Error(result.message || '数据不存在'));
            return;
          }
          
          if (result.code === 409) {
            wx.showToast({ title: result.message || '操作冲突', icon: 'none' });
            reject(new Error(result.message || '操作冲突'));
            return;
          }

          // 通用错误
          wx.showToast({
            title: result.message || '操作失败',
            icon: 'none'
          });
          reject(new Error(result.message || '操作失败'));
          return;
        }

        resolve(result);
      },
      fail: (err) => {
        wx.hideLoading();
        console.error(`云函数 [${name}] 调用失败:`, err);
        
        // 网络错误处理
        if (err.errCode === -501000 || err.errMsg.includes('network')) {
          wx.showToast({ title: '网络连接失败，请检查网络', icon: 'none', duration: 3000 });
        } else if (err.errMsg.includes('timeout')) {
          wx.showToast({ title: '请求超时，请重试', icon: 'none', duration: 3000 });
        } else {
          wx.showToast({ title: '服务异常，请稍后重试', icon: 'none' });
        }
        
        reject(err);
      }
    });
  });
}

/**
 * 批量调用云函数（并行）
 * @param {Array<{name, data}>} tasks
 * @returns {Promise<Array>}
 */
function callCloudFunctionsParallel(tasks) {
  const promises = tasks.map(t => callCloudFunction(t.name, t.data, { showLoading: false }));
  return Promise.all(promises);
}

/**
 * 上传文件到云存储
 * @param {string} filePath - 本地文件路径
 * @param {string} cloudPath - 云存储路径
 * @returns {Promise<string>} - 返回 fileID
 */
function uploadFile(filePath, cloudPath) {
  return new Promise((resolve, reject) => {
    wx.showLoading({ title: '上传中...', mask: true });

    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: (res) => {
        wx.hideLoading();
        resolve(res.fileID);
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('文件上传失败:', err);
        wx.showToast({ title: '上传失败，请重试', icon: 'none' });
        reject(err);
      }
    });
  });
}

/**
 * 获取临时访问链接
 * @param {string} fileID - 云存储fileID
 * @returns {Promise<string>} - 返回https临时链接
 */
function getTempFileURL(fileID) {
  return new Promise((resolve, reject) => {
    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: (res) => {
        if (res.fileList && res.fileList[0] && res.fileList[0].tempFileURL) {
          resolve(res.fileList[0].tempFileURL);
        } else {
          reject(new Error('获取文件链接失败'));
        }
      },
      fail: reject
    });
  });
}

module.exports = {
  call: callCloudFunction,
  callAll: callCloudFunctionsParallel,
  upload: uploadFile,
  getTempURL: getTempFileURL
};
