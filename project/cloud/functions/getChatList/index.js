const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const res = await db.collection('chats').where(
      db.command.or([
        { userA: openid },
        { userB: openid }
      ])
    ).orderBy('updateTime', 'desc').get();

    const chats = res.data.map(chat => {
      const isUserA = chat.userA === openid;
      const otherId = isUserA ? chat.userB : chat.userA;
      const unread = isUserA ? chat.unreadA : chat.unreadB;

      return {
        chatId: chat._id,
        otherId,
        lastMessage: chat.lastMessage,
        unread,
        updateTime: chat.updateTime
      };
    });

    return { code: 0, data: { chats }, message: 'success' };
  } catch (err) {
    console.error('获取会话列表失败:', err);
    return { code: 500, message: err.message };
  }
};