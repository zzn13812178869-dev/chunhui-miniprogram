const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { orderId } = event;

  try {
    const res = await db.collection('orders').doc(orderId).get();
    
    if (!res.data) {
      return { code: 404, message: '订单不存在' };
    }
    
    // 获取用户信息
    let userInfo = null;
    let workerInfo = null;
    
    if (res.data.userId) {
      const userRes = await db.collection('users').where({
        _openid: res.data.userId
      }).get();
      userInfo = userRes.data[0] || null;
    }
    
    if (res.data.workerId) {
      const workerRes = await db.collection('workers').where({
        _openid: res.data.workerId
      }).get();
      workerInfo = workerRes.data[0] || null;
    }
    
    return {
      code: 0,
      data: {
        order: res.data,
        userInfo,
        workerInfo
      },
      message: 'success'
    };
  } catch (err) {
    console.error('获取订单详情失败:', err);
    return { code: 500, message: err.message };
  }
};