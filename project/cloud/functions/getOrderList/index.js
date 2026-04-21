const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { role, status, page = 1, pageSize = 20 } = event;

  try {
    let query = db.collection('orders');
    
    // 根据角色过滤
    if (role === 'user') {
      query = query.where({ userId: openid });
    } else if (role === 'worker') {
      query = query.where({ workerId: openid });
    } else if (role === 'admin') {
      // 管理员查看全部
    } else {
      query = query.where({
        _openid: openid
      });
    }
    
    // 状态筛选
    if (status) {
      query = query.where({ status });
    }
    
    const res = await query
      .orderBy('createTime', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();
    
    return {
      code: 0,
      data: {
        list: res.data,
        total: res.data.length,
        page,
        pageSize
      },
      message: 'success'
    };
  } catch (err) {
    console.error('获取订单列表失败:', err);
    return { code: 500, message: err.message };
  }
};