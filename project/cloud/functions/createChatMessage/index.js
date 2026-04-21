const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const senderId = wxContext.OPENID;
  const { chatId, receiverId, type = 'text', content } = event;

  if (!chatId || !receiverId || !content) {
    return { code: 400, message: '参数不完整' };
  }

  try {
    // 创建消息
    const messageData = {
      chatId,
      senderId,
      receiverId,
      type,
      content,
      isRead: false,
      createTime: db.serverDate()
    };

    const msgRes = await db.collection('messages').add({ data: messageData });

    // 更新会话最后一条消息
    await db.collection('chats').doc(chatId).update({
      data: {
        lastMessage: {
          content: type === 'image' ? '[图片]' : content,
          type,
          time: db.serverDate()
        },
        [`unread${receiverId === chatId.split('_')[0] ? 'A' : 'B'}`]: _.inc(1),
        updateTime: db.serverDate()
      }
    });

    return {
      code: 0,
      data: { messageId: msgRes._id, ...messageData },
      message: '发送成功'
    };
  } catch (err) {
    console.error('创建消息失败:', err);
    return { code: 500, message: err.message };
  }
};