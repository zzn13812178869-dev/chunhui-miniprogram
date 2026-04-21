const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 生成随机昵称
function generateRandomNickname() {
  const prefixes = ['快乐', '阳光', '勇敢', '聪明', '可爱', '智慧', '勤奋', '善良', '热心', '诚实'];
  const suffixes = ['小熊', '小猫', '小狗', '小鸟', '小鱼', '小兔', '小鹿', '小马', '小羊', '小猪'];
  const num = Math.floor(1000 + Math.random() * 9000);
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return `${prefix}${suffix}_${num}`;
}

exports.main = async (event, context) => {
  const { openid, userInfo = {}, phone = '' } = event;

  if (!openid) {
    return { success: false, message: 'openid不能为空' };
  }

  try {
    // 检查用户是否已存在
    const existRes = await db.collection('users').where({ _openid: openid }).get();
    if (existRes.data && existRes.data.length > 0) {
      return { success: false, message: '用户已存在', user: existRes.data[0] };
    }

    const nickName = userInfo.nickName || generateRandomNickname();
    const avatarUrl = userInfo.avatarUrl || '';
    const gender = userInfo.gender || 0;
    const country = userInfo.country || '';
    const province = userInfo.province || '';
    const city = userInfo.city || '';

    const newUser = {
      _openid: openid,
      nickName,
      avatarUrl,
      phone,
      gender,
      country,
      province,
      city,
      role: 'user',
      roles: ['user'],
      balance: 0,
      status: 0,
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    };

    const addRes = await db.collection('users').add({ data: newUser });
    newUser._id = addRes._id;

    return { success: true, user: newUser };
  } catch (err) {
    console.error('注册用户失败:', err);
    return { success: false, message: '服务器错误', error: err.message };
  }
};
