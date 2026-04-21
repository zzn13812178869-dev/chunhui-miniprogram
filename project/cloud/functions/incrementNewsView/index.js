const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { newsId } = event;

  if (!newsId) {
    return { success: false, message: 'newsId不能为空' };
  }

  try {
    const updateRes = await db.collection('news').doc(newsId).update({
      data: {
        viewCount: _.inc(1)
      }
    });

    if (updateRes.stats.updated === 0) {
      return { success: false, message: '资讯不存在' };
    }

    return { success: true };
  } catch (err) {
    console.error('增加阅读量失败:', err);
    return { success: false, message: '服务器错误', error: err.message };
  }
};
