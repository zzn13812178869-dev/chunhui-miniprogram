const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { category, page = 1, limit = 20 } = event;

  try {
    let query = db.collection('news');

    // 分类筛选
    if (category && category !== 'all') {
      query = query.where({ category });
    }

    // 获取总数
    const countRes = await query.count();
    const total = countRes.total;

    // 分页查询，按时间倒序
    const listRes = await query
      .orderBy('publishTime', 'desc')
      .skip((page - 1) * limit)
      .limit(limit)
      .get();

    return {
      code: 0,
      data: {
        list: listRes.data || [],
        total
      }
    };
  } catch (err) {
    console.error('获取资讯列表失败:', err);
    return { code: 500, message: '服务器错误', error: err.message };
  }
};
