const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const userId = wxContext.OPENID;
  const { period = 'month' } = event;  // month | week | year

  try {
    // 计算时间范围
    const now = new Date();
    let startDate;
    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'year') {
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // 统计总收益
    const incomeRes = await db.collection('income_records').where({
      userId,
      type: 'order_income',
      createTime: _.gte(startDate)
    }).get();

    const records = incomeRes.data || [];
    const totalIncome = records.reduce((sum, r) => sum + (r.amount || 0), 0);
    const orderCount = records.length;

    // 按天聚合趋势
    const trendMap = {};
    records.forEach(r => {
      const date = new Date(r.createTime).toISOString().slice(0, 10);
      trendMap[date] = (trendMap[date] || 0) + r.amount;
    });
    const trend = Object.entries(trendMap).map(([date, amount]) => ({ date, amount }));

    return {
      code: 0,
      data: {
        totalIncome,
        orderCount,
        trend,
        breakdown: records.slice(0, 10)  // 最近10条明细
      },
      message: 'success'
    };
  } catch (err) {
    console.error('获取收益统计失败:', err);
    return { code: 500, message: err.message };
  }
};