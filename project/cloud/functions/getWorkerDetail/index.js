const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { workerId } = event;

  try {
    // 获取工人信息
    const workerRes = await db.collection('workers').where({
      _openid: workerId
    }).get();
    
    const worker = workerRes.data[0] || null;
    
    if (!worker) {
      return { code: 404, message: '工人不存在' };
    }
    
    // 获取评价列表
    const reviewsRes = await db.collection('reviews').where({
      workerId: workerId
    }).orderBy('createTime', 'desc').limit(10).get();
    
    // 获取历史订单数
    const ordersRes = await db.collection('orders').where({
      workerId: workerId,
      status: _.in(['completed', 'reviewed'])
    }).count();
    
    return {
      code: 0,
      data: {
        worker: {
          ...worker,
          orderCount: ordersRes.total
        },
        reviews: reviewsRes.data
      },
      message: 'success'
    };
  } catch (err) {
    console.error('获取工人详情失败:', err);
    return { code: 500, message: err.message };
  }
};