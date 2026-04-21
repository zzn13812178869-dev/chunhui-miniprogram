const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { openid } = event;

  if (!openid) {
    return { code: 400, message: 'openid不能为空' };
  }

  try {
    // 查询用户参与的会话
    const chatsRes = await db.collection('chats')
      .where(
        _.or([
          { userId: openid },
          { workerId: openid }
        ])
      )
      .orderBy('updateTime', 'desc')
      .get();

    const chats = chatsRes.data || [];

    // 补充对方用户信息
    const enrichedChats = await Promise.all(chats.map(async (chat) => {
      const otherId = chat.userId === openid ? chat.workerId : chat.userId;
      try {
        const userRes = await db.collection('users').where({ _openid: otherId }).get();
        const otherUser = userRes.data && userRes.data[0] ? userRes.data[0] : null;
        return {
          ...chat,
          otherUser: otherUser ? {
            nickName: otherUser.nickName,
            avatarUrl: otherUser.avatarUrl
          } : null
        };
      } catch (e) {
        return chat;
      }
    }));

    return {
      code: 0,
      data: enrichedChats
    };
  } catch (err) {
    console.error('获取会话列表失败:', err);
    return { code: 500, message: '服务器错误', error: err.message };
  }
};
