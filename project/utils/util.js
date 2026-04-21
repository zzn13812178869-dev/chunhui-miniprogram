/**
 * 通用工具函数
 */

/**
 * 格式化日期
 * @param {Date|string|number} date - 日期对象/字符串/时间戳
 * @param {string} format - 格式模板，默认 'YYYY-MM-DD HH:mm'
 * @returns {string}
 */
function formatDate(date, format = 'YYYY-MM-DD HH:mm') {
  if (!date) return '';
  
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 格式化金额（分→元）
 * @param {number} amount - 金额（分）
 * @param {boolean} showSymbol - 是否显示¥符号
 * @returns {string}
 */
function formatAmount(amount, showSymbol = true) {
  if (amount === null || amount === undefined) return showSymbol ? '¥0.00' : '0.00';
  const yuan = (amount / 100).toFixed(2);
  return showSymbol ? `¥${yuan}` : yuan;
}

/**
 * 格式化距离
 * @param {number} distance - 距离（米）
 * @returns {string}
 */
function formatDistance(distance) {
  if (!distance && distance !== 0) return '';
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  }
  return `${(distance / 1000).toFixed(1)}km`;
}

/**
 * 计算两点间距离（米）
 * @param {number} lat1 - 纬度1
 * @param {number} lng1 - 经度1
 * @param {number} lat2 - 纬度2
 * @param {number} lng2 - 经度2
 * @returns {number} 距离（米）
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const radLat1 = lat1 * Math.PI / 180.0;
  const radLat2 = lat2 * Math.PI / 180.0;
  const a = radLat1 - radLat2;
  const b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
  
  let s = 2 * Math.asin(Math.sqrt(
    Math.pow(Math.sin(a / 2), 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
  ));
  s = s * 6378.137 * 1000; // 地球半径6378.137km
  return Math.round(s);
}

/**
 * 防抖
 * @param {Function} fn - 要执行的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function}
 */
function debounce(fn, delay = 300) {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * 节流
 * @param {Function} fn - 要执行的函数
 * @param {number} interval - 间隔时间（毫秒）
 * @returns {Function}
 */
function throttle(fn, interval = 300) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

/**
 * 生成随机字符串
 * @param {number} length - 长度
 * @returns {string}
 */
function randomString(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 生成订单编号
 * @returns {string}
 */
function generateOrderNo() {
  const now = new Date();
  const prefix = formatDate(now, 'YYYYMMDD');
  const random = randomString(6).toUpperCase();
  return `CH${prefix}${random}`;
}

/**
 * 深拷贝
 * @param {any} obj
 * @returns {any}
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof Object) {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
}

/**
 * 合并对象
 * @param  {...object} objects
 * @returns {object}
 */
function mergeObjects(...objects) {
  return objects.reduce((acc, obj) => {
    if (obj) {
      Object.keys(obj).forEach(key => {
        if (obj[key] !== undefined && obj[key] !== null) {
          acc[key] = obj[key];
        }
      });
    }
    return acc;
  }, {});
}

/**
 * 显示确认弹窗
 * @param {string} title - 标题
 * @param {string} content - 内容
 * @returns {Promise<boolean>}
 */
function showConfirm(title, content) {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      confirmColor: '#43A047',
      success: (res) => {
        resolve(res.confirm);
      }
    });
  });
}

/**
 * 检查手机号格式
 * @param {string} phone
 * @returns {boolean}
 */
function isValidPhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone);
}

/**
 * 检查身份证号格式（简易校验）
 * @param {string} idCard
 * @returns {boolean}
 */
function isValidIdCard(idCard) {
  return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idCard);
}

module.exports = {
  formatDate,
  formatAmount,
  formatDistance,
  calculateDistance,
  debounce,
  throttle,
  randomString,
  generateOrderNo,
  deepClone,
  mergeObjects,
  showConfirm,
  isValidPhone,
  isValidIdCard
};
