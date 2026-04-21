const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { newsId } = event;

  if (!newsId) {
    return { code: 400, message: 'newsId不能为空' };
  }

  try {
    // 查询资讯详情
    const detailRes = await db.collection('news').doc(newsId).get();
    const detail = detailRes.data;

    if (!detail) {
      return { code: 404, message: '资讯不存在' };
    }

    // 累加阅读量（异步，不阻塞返回）
    db.collection('news').doc(newsId).update({
      data: {
        viewCount: _.inc(1)
      }
    }).catch(err => {
      console.error('增加阅读量失败:', err);
    });

    // 前端返回的viewCount+1，保证一致性
    detail.viewCount = (detail.viewCount || 0) + 1;

    return {
      code: 0,
      data: detail
    };
  } catch (err) {
    console.error('获取资讯详情失败:', err);
    return { code: 500, message: '服务器错误', error: err.message };
  }
};
