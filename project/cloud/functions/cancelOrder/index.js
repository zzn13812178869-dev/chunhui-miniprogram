const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { orderId, reason } = event;

  try {
    const orderRes = await db.collection('orders').doc(orderId).get();
    const order = orderRes.data;
    
    if (!order) {
      return { code: 404, message: '订单不存在' };
    }
    
    // 只有下单用户或管理员可以取消
    if (order.userId !== openid) {
      return { code: 403, message: '无权操作' };
    }
    
    // 只有待接单状态可以取消
    if (order.status !== 'pending') {
      return { code: 400, message: '当前订单状态不可取消' };
    }
    
    await db.collection('orders').doc(orderId).update({
      data: {
        status: 'cancelled',
        cancelReason: reason || '',
        cancelTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    });
    
    return { code: 0, data: {}, message: '订单已取消' };
  } catch (err) {
    console.error('取消订单失败:', err);
    return { code: 500, message: err.message };
  }
};