const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { openid, period } = event;

  if (!openid) {
    return { code: 400, message: 'openid不能为空' };
  }

  try {
    // 构建时间筛选条件
    let timeFilter = {};
    const now = new Date();
    if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      timeFilter = { createTime: _.gte(weekAgo) };
    } else if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      timeFilter = { createTime: _.gte(monthAgo) };
    }

    // 查询收益记录
    const whereCondition = {
      workerId: openid,
      ...timeFilter
    };

    const recordsRes = await db.collection('income_records')
      .where(whereCondition)
      .orderBy('createTime', 'desc')
      .get();

    const records = recordsRes.data || [];

    // 计算总收益
    const totalIncome = records.reduce((sum, r) => sum + (r.amount || 0), 0);
    const orderCount = records.length;

    // 按日期分组统计趋势
    const trendMap = {};
    records.forEach(r => {
      const date = r.createTime ? new Date(r.createTime).toISOString().slice(0, 10) : 'unknown';
      if (!trendMap[date]) {
        trendMap[date] = { date, income: 0, count: 0 };
      }
      trendMap[date].income += r.amount || 0;
      trendMap[date].count += 1;
    });
    const trend = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));

    // 明细分类
    const breakdown = {
      byType: {},
      byStatus: {}
    };
    records.forEach(r => {
      const type = r.type || 'other';
      const status = r.status || 'unknown';
      breakdown.byType[type] = (breakdown.byType[type] || 0) + (r.amount || 0);
      breakdown.byStatus[status] = (breakdown.byStatus[status] || 0) + (r.amount || 0);
    });

    return {
      code: 0,
      data: {
        totalIncome,
        orderCount,
        trend,
        breakdown
      }
    };
  } catch (err) {
    console.error('获取收益统计失败:', err);
    return { code: 500, message: '服务器错误', error: err.message };
  }
};
