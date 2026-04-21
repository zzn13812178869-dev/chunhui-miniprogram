const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { serviceId, workerId, address, appointmentTime, remark, price, serviceName } = event;

  try {
    // 1. 校验工人状态
    if (workerId) {
      const workerRes = await db.collection('workers').doc(workerId).get();
      if (!workerRes.data || workerRes.data.workStatus !== 'open') {
        return { code: 400, message: '该工人当前不可接单' };
      }
    }

    // 2. 创建订单
    const orderData = {
      userId: openid,
      workerId: workerId || '',
      serviceId: serviceId || '',
      serviceName: serviceName || '综合服务',
      status: 'pending',
      price: price || 0,
      address: address || {},
      appointmentTime: appointmentTime ? new Date(appointmentTime) : db.serverDate(),
      remark: remark || '',
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    };

    const addRes = await db.collection('orders').add({ data: orderData });

    return {
      code: 0,
      data: {
        orderId: addRes._id,
        order: { ...orderData, _id: addRes._id }
      },
      message: '订单创建成功'
    };
  } catch (err) {
    console.error('创建订单失败:', err);
    return { code: 500, message: err.message };
  }
};