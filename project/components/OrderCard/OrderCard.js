// components/OrderCard/OrderCard.js
Component({
  properties: {
    order: {
      type: Object,
      value: {}
    },
    role: {
      type: String,
      value: 'user'
    },
    showActions: {
      type: Boolean,
      value: true
    }
  },

  data: {
    statusMap: {
      pending: { text: '待接单', color: '#FF9800', bgColor: '#FFF3E0' },
      accepted: { text: '已接单', color: '#2196F3', bgColor: '#E3F2FD' },
      serving: { text: '服务中', color: '#9C27B0', bgColor: '#F3E5F5' },
      completed: { text: '待评价', color: '#43A047', bgColor: '#E8F5E9' },
      reviewed: { text: '已完成', color: '#757575', bgColor: '#F5F5F5' },
      cancelled: { text: '已取消', color: '#F44336', bgColor: '#FFEBEE' }
    }
  },

  methods: {
    onTap() {
      this.triggerEvent('tap', { order: this.properties.order });
    },

    onActionTap(e) {
      const action = e.currentTarget.dataset.action;
      this.triggerEvent('action', { action, order: this.properties.order });
    },

    getStatusConfig(status) {
      return this.data.statusMap[status] || { text: '未知', color: '#999999', bgColor: '#F5F5F5' };
    }
  }
});