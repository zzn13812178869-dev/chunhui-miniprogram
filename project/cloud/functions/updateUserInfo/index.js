const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { nickName, avatarUrl, phone, location } = event;

  try {
    const updateData = { updateTime: db.serverDate() };
    if (nickName !== undefined) updateData.nickName = nickName;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;

    await db.collection('users').where({ _openid: openid }).update({ data: updateData });

    return { code: 0, data: {}, message: '更新成功' };
  } catch (err) {
    console.error('更新用户信息失败:', err);
    return { code: 500, message: err.message };
  }
};
