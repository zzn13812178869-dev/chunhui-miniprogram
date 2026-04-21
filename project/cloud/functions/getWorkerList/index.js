const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

// 计算距离的辅助函数
function calcDistance(lat1, lng1, lat2, lng2) {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*rad) * Math.cos(lat2*rad) * Math.sin(dLng/2)**2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

exports.main = async (event, context) => {
  const { categoryId, latitude, longitude, page = 1, pageSize = 20 } = event;
  
  try {
    let query = db.collection('workers').where({
      workStatus: 'open',
      certificationStatus: 'approved'
    });
    
    if (categoryId) {
      query = query.where({
        skills: _.all([categoryId])
      });
    }
    
    const res = await query
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();
    
    let workers = res.data || [];
    
    // 计算距离并排序
    if (latitude && longitude) {
      workers = workers.map(w => {
        if (w.location && w.location.coordinates) {
          w.distance = calcDistance(latitude, longitude, w.location.coordinates[1], w.location.coordinates[0]);
        } else {
          w.distance = 99999;
        }
        return w;
      }).sort((a, b) => a.distance - b.distance);
    }
    
    return { code: 0, data: { list: workers, total: workers.length }, message: 'success' };
  } catch (err) {
    console.error('获取工人列表失败:', err);
    return { code: 0, data: { list: [], total: 0 }, message: 'success' };
  }
};
