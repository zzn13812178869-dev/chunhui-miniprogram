const ROLE_MAP = {
  user: { label: '普通会员', bg: '#F5F5F5', color: '#999' },
  worker: { label: '工人师傅', bg: '#E3F2FD', color: '#1976D2' },
  partner: { label: '合作商', bg: '#E8F5E9', color: '#43A047' },
  admin: { label: '管理员', bg: '#FFEBEE', color: '#D32F2F' }
};

Component({
  properties: {
    role: {
      type: String,
      value: 'user',
      observer(newVal) {
        const config = ROLE_MAP[newVal] || ROLE_MAP.user;
        this.setData({ label: config.label, bg: config.bg, color: config.color });
      }
    }
  },
  data: {
    label: '普通会员',
    bg: '#F5F5F5',
    color: '#999'
  },
  lifetimes: {
    attached() {
      const config = ROLE_MAP[this.data.role] || ROLE_MAP.user;
      this.setData({ label: config.label, bg: config.bg, color: config.color });
    }
  }
});
