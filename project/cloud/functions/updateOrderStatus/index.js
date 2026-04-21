const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { orderId, status, remark } = event;

  const validStatuses = ['pending', 'accepted', 'serving', 'completed', 'cancelled', 'reviewed'];
  if (!validStatuses.includes(status)) {
    return { code: 400, message: '无效的状态' };
  }

  try {
    const orderRes = await db.collection('orders').doc(orderId).get();
    const order = orderRes.data;
    
    if (!order) {
      return { code: 404, message: '订单不存在' };
    }
    
    // 权限校验
    const isOwner = order.userId === openid;
    const isWorker = order.workerId === openid;
    
    // 状态流转校验
    const flow = {
      pending: ['accepted', 'cancelled'],
      accepted: ['serving'],
      serving: ['completed'],
      completed: ['reviewed']
    };
    
    if (flow[order.status] && !flow[order.status].includes(status)) {
      return { code: 400, message: '非法的状态流转' };
    }
    
    const updateData = {
      status,
      updateTime: db.serverDate()
    };
    
    if (status === 'serving') updateData.startTime = db.serverDate();
    if (status === 'completed') updateData.completeTime = db.serverDate();
    if (remark) updateData.remark = remark;
    
    await db.collection('orders').doc(orderId).update({ data: updateData });
    
    return { code: 0, data: { orderId, status }, message: '状态更新成功' };
  } catch (err) {
    console.error('更新订单状态失败:', err);
    return { code: 500, message: err.message };
  }
};