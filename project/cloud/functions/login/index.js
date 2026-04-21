const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  
  if (!openid) {
    return { code: 401, message: '获取openid失败' };
  }
  
  try {
    // 查找已有用户
    const userRes = await db.collection('users').where({ _openid: openid }).get();
    
    if (userRes.data && userRes.data.length > 0) {
      const user = userRes.data[0];
      return { code: 0, data: { userInfo: user, isNewUser: false }, message: '登录成功' };
    }
    
    // 创建新用户
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newUser = {
      _openid: openid,
      role: 'user',
      roles: ['user'],
      nickName: `用户_${randomNum}`,
      avatarUrl: '',
      phone: '',
      balance: 0,
      status: 0,
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    };
    
    const addRes = await db.collection('users').add({ data: newUser });
    newUser._id = addRes._id;
    
    return { code: 0, data: { userInfo: newUser, isNewUser: true }, message: '注册成功' };
  } catch (err) {
    console.error('登录失败:', err);
    return { code: 500, message: '服务器错误' };
  }
};
