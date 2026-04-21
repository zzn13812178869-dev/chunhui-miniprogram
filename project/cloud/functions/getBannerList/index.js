const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const res = await db.collection('banners')
      .where({ status: 'active' })
      .orderBy('sortOrder', 'asc')
      .get();
    
    return { code: 0, data: { list: res.data }, message: 'success' };
  } catch (err) {
    console.error('获取Banner失败:', err);
    return { code: 0, data: { list: [] }, message: 'success' };
  }
};
