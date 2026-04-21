const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event, context) => {
  const { fileContent, cloudPath } = event;
  
  try {
    // 解析base64图片
    const buffer = Buffer.from(fileContent, 'base64');
    
    // 上传至云存储
    const res = await cloud.uploadFile({
      cloudPath: cloudPath || `images/${Date.now()}_${Math.random().toString(36).substr(2, 6)}.jpg`,
      fileContent: buffer
    });

    // 获取临时链接
    const fileRes = await cloud.getTempFileURL({
      fileList: [res.fileID]
    });

    return {
      code: 0,
      data: {
        fileID: res.fileID,
        url: fileRes.fileList[0].tempFileURL
      },
      message: '上传成功'
    };
  } catch (err) {
    console.error('上传图片失败:', err);
    return { code: 500, message: err.message };
  }
};