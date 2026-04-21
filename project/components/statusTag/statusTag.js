const STATUS_MAP = {
  order: {
    pending: { label: '待接单', color: '#FF9800', bg: '#FFF3E0' },
    accepted: { label: '已接单', color: '#2196F3', bg: '#E3F2FD' },
    serving: { label: '服务中', color: '#9C27B0', bg: '#F3E5F5' },
    completed: { label: '已完成', color: '#43A047', bg: '#E8F5E9' },
    cancelled: { label: '已取消', color: '#999', bg: '#F5F5F5' },
    reviewed: { label: '已评价', color: '#43A047', bg: '#E8F5E9' }
  },
  post: {
    pending: { label: '审核中', color: '#FF9800', bg: '#FFF3E0' },
    approved: { label: '已通过', color: '#43A047', bg: '#E8F5E9' },
    rejected: { label: '已拒绝', color: '#F44336', bg: '#FFEBEE' }
  },
  withdraw: {
    pending: { label: '待审核', color: '#FF9800', bg: '#FFF3E0' },
    approved: { label: '已通过', color: '#2196F3', bg: '#E3F2FD' },
    completed: { label: '已到账', color: '#43A047', bg: '#E8F5E9' },
    rejected: { label: '已拒绝', color: '#F44336', bg: '#FFEBEE' }
  }
};

Component({
  properties: {
    status: { type: String, value: '' },
    type: { type: String, value: 'order' }
  },
  data: {
    label: '',
    color: '',
    bg: ''
  },
  lifetimes: {
    attached() { this.updateStyle(); }
  },
  observers: {
    'status, type': function() { this.updateStyle(); }
  },
  methods: {
    updateStyle() {
      const map = STATUS_MAP[this.data.type] || STATUS_MAP.order;
      const config = map[this.data.status] || { label: this.data.status, color: '#999', bg: '#F5F5F5' };
      this.setData({ label: config.label, color: config.color, bg: config.bg });
    }
  }
});
