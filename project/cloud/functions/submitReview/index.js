const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  try {
    return { code: 0, data: {}, message: 'success' };
  } catch (err) {
    console.error('提交评价 error:', err);
    return { code: 500, message: err.message };
  }
};
