const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { chatId, page = 1, pageSize = 20 } = event;

  if (!chatId) {
    return { code: 400, message: 'chatId不能为空' };
  }

  try {
    const res = await db.collection('messages')
      .where({ chatId })
      .orderBy('createTime', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();

    return {
      code: 0,
      data: {
        messages: res.data.reverse(),  // 按时间正序
        page,
        pageSize
      },
      message: 'success'
    };
  } catch (err) {
    console.error('获取聊天记录失败:', err);
    return { code: 500, message: err.message };
  }
};