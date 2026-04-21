const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const res = await db.collection('users').where({ _openid: openid }).get();
    
    if (res.data && res.data.length > 0) {
      return { code: 0, data: { userInfo: res.data[0] }, message: 'success' };
    }
    
    return { code: 404, message: '用户不存在' };
  } catch (err) {
    console.error('获取用户信息失败:', err);
    return { code: 500, message: err.message };
  }
};