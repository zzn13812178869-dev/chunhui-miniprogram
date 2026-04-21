const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { chatId, page = 1, pageSize = 20 } = event;

  if (!chatId) {
    return { code: 400, message: 'chatId不能为空' };
  }

  try {
    // 查询总消息数
    const countRes = await db.collection('messages').where({ chatId }).count();
    const total = countRes.total;

    // 分页查询消息，按时间正序（旧消息在前）
    const messagesRes = await db.collection('messages')
      .where({ chatId })
      .orderBy('createTime', 'asc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();

    return {
      code: 0,
      data: {
        list: messagesRes.data || [],
        total,
        page,
        pageSize
      }
    };
  } catch (err) {
    console.error('获取聊天记录失败:', err);
    return { code: 500, message: '服务器错误', error: err.message };
  }
};
