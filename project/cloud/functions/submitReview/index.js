const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { orderId, rating, content, images } = event;

  if (!orderId || !rating) {
    return { code: 400, message: '订单ID和评分不能为空' };
  }

  try {
    // 校验订单状态
    const orderRes = await db.collection('orders').doc(orderId).get();
    const order = orderRes.data;
    
    if (!order) {
      return { code: 404, message: '订单不存在' };
    }
    
    if (order.userId !== openid) {
      return { code: 403, message: '无权评价' };
    }
    
    if (order.status !== 'completed') {
      return { code: 400, message: '订单未完成，无法评价' };
    }

    // 创建评价
    const reviewData = {
      orderId,
      userId: openid,
      workerId: order.workerId,
      rating,
      content: content || '',
      images: images || [],
      createTime: db.serverDate()
    };
    
    await db.collection('reviews').add({ data: reviewData });
    
    // 更新订单状态为已评价
    await db.collection('orders').doc(orderId).update({
      data: {
        status: 'reviewed',
        review: reviewData,
        updateTime: db.serverDate()
      }
    });
    
    // 更新工人评分
    if (order.workerId) {
      const reviewsRes = await db.collection('reviews').where({
        workerId: order.workerId
      }).get();
      
      const reviews = reviewsRes.data || [];
      const avgRating = reviews.length > 0 
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : rating;
      
      await db.collection('workers').where({
        _openid: order.workerId
      }).update({
        data: {
          rating: Number(avgRating),
          orderCount: _.inc(1),
          updateTime: db.serverDate()
        }
      });
    }
    
    return { code: 0, data: {}, message: '评价成功' };
  } catch (err) {
    console.error('提交评价失败:', err);
    return { code: 500, message: err.message };
  }
};