const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const partnerId = wxContext.OPENID;
  const { type, title, content, contact, images = [], validityDays = 30 } = event;

  if (!type || !title || !content) {
    return { code: 400, message: '类型、标题、内容不能为空' };
  }

  try {
    const now = db.serverDate();
    const validEnd = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);

    const postData = {
      partnerId,
      type,           // 'job' | 'marriage'
      title,
      content,
      images,
      contact: contact || {},
      viewCount: 0,
      status: 'pending',  // pending | approved | rejected
      validStart: now,
      validEnd,
      createTime: now,
      updateTime: now
    };

    const res = await db.collection('posts').add({ data: postData });

    return {
      code: 0,
      data: { publishId: res._id },
      message: '发布成功，等待审核'
    };
  } catch (err) {
    console.error('发布信息失败:', err);
    return { code: 500, message: err.message };
  }
};