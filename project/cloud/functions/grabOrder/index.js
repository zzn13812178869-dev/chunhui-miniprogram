const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const workerId = wxContext.OPENID;
  const { orderId } = event;

  if (!orderId) {
    return { code: 400, message: '订单ID不能为空' };
  }

  try {
    // 云开发事务保证原子性
    const transaction = await db.startTransaction();
    
    // 1. 读取订单当前状态
    const orderRes = await transaction.collection('orders').doc(orderId).get();
    const order = orderRes.data;
    
    if (!order) {
      await transaction.rollback();
      return { code: 404, message: '订单不存在' };
    }
    
    // 2. 校验状态
    if (order.status !== 'pending') {
      await transaction.rollback();
      return { code: 400, message: '订单已被抢或状态异常' };
    }
    
    // 3. 不能抢自己的单
    if (order.userId === workerId) {
      await transaction.rollback();
      return { code: 400, message: '不能抢自己的订单' };
    }
    
    // 4. 更新订单状态
    await transaction.collection('orders').doc(orderId).update({
      data: {
        status: 'accepted',
        workerId: workerId,
        acceptTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    });
    
    await transaction.commit();
    
    return {
      code: 0,
      data: {
        orderId,
        status: 'accepted',
        workerId
      },
      message: '抢单成功'
    };
  } catch (err) {
    console.error('抢单失败:', err);
    return { code: 500, message: '抢单失败，请重试' };
  }
};